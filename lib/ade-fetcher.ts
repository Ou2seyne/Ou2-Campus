import { generateDemoSchedule, parseIcsContent } from './ade-parser';
import { ScheduleEvent, ScheduleMeta } from '@/types/schedule';

export interface FetchScheduleResult {
  events: ScheduleEvent[];
  meta: ScheduleMeta;
  warning?: string;
}

/**
 * Normalizes input URL (replaces webcal://, trims, cleans)
 */
export function normalizeAdeUrl(rawUrl: string): string {
  let url = (rawUrl || '').trim();

  if (url.startsWith('webcal://')) {
    url = 'https://' + url.substring('webcal://'.length);
  }

  // Ensure protocol
  if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('demo://')) {
    url = 'https://' + url;
  }

  return url;
}

/**
 * Resolves and fetches an ADE or iCalendar feed
 */
export async function fetchAdeSchedule(targetUrl: string): Promise<FetchScheduleResult> {
  const normalized = normalizeAdeUrl(targetUrl);

  // Check if demo requested
  if (
    normalized.startsWith('demo://') ||
    normalized.includes('demo=true') ||
    normalized.includes('preset=demo')
  ) {
    let preset = 'Licence 3 Informatique';
    if (normalized.includes('math')) preset = 'L1 Mathématiques';
    else if (normalized.includes('miage')) preset = 'Master MIAGE';
    else if (normalized.includes('but')) preset = 'BUT Informatique';

    const events = generateDemoSchedule(preset);
    return {
      events,
      meta: {
        sourceUrl: targetUrl,
        fetchedAt: new Date().toISOString(),
        totalEvents: events.length,
        calendarName: preset,
        isDemo: true,
      },
    };
  }

  // Fetch real iCal or ADE link
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000); // 12 seconds timeout

  try {
    const response = await fetch(normalized, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 PillCal/1.0',
        'Accept': 'text/calendar, text/plain, */*',
        'Cache-Control': 'no-cache',
      },
      redirect: 'follow',
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Le serveur de l'université a répondu avec le statut ${response.status} (${response.statusText}).`);
    }

    const text = await response.text();

    // Check if directly an iCalendar feed
    if (text.includes('BEGIN:VCALENDAR')) {
      const events = parseIcsContent(text);
      return {
        events,
        meta: {
          sourceUrl: normalized,
          fetchedAt: new Date().toISOString(),
          totalEvents: events.length,
        },
      };
    }

    // If it's an HTML page (like direct/index.jsp), check for embedded iCal link
    const icalLinkMatch = text.match(/href=["']([^"']*(?:anonymous_cal\.jsp|\.ics)[^"']*)["']/i);
    if (icalLinkMatch) {
      let resolvedIcsUrl = icalLinkMatch[1];
      if (!resolvedIcsUrl.startsWith('http')) {
        const parsedBase = new URL(normalized);
        resolvedIcsUrl = new URL(resolvedIcsUrl, parsedBase.origin).toString();
      }

      // Re-fetch the resolved ICS URL
      const subResponse = await fetch(resolvedIcsUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)',
          'Accept': 'text/calendar, text/plain, */*',
        },
      });

      if (subResponse.ok) {
        const subText = await subResponse.text();
        if (subText.includes('BEGIN:VCALENDAR')) {
          const events = parseIcsContent(subText);
          return {
            events,
            meta: {
              sourceUrl: resolvedIcsUrl,
              fetchedAt: new Date().toISOString(),
              totalEvents: events.length,
            },
          };
        }
      }
    }

    // If ADE web viewer (direct/index.jsp with data=...)
    if (normalized.includes('direct/index.jsp') || normalized.includes('data=')) {
      throw new Error(
        "Ce lien correspond à la vue web interactive d'ADE Campus et non au flux d'export iCalendar. Dans ADE Campus, cliquez sur l'icône de calendrier / 'Exporter' pour obtenir le lien direct (.ics ou anonymous_cal.jsp)."
      );
    }

    // If ADE login page or inaccessible
    throw new Error(
      "Le lien fourni ne contient pas directement de flux iCalendar (.ics). Assurez-vous d'utiliser le lien d'export 'iCalendar' ou le lien du calendrier anonyme dans ADE Campus."
    );
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error("Délai d'attente dépassé (12s). Le serveur ADE de votre université est peut-être inaccessible ou nécessite un VPN.");
    }
    throw err;
  }
}
