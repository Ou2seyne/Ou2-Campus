import { NextRequest, NextResponse } from 'next/server';
import { fetchAdeSchedule } from '@/lib/ade-fetcher';
import { ScheduleApiResponse } from '@/types/schedule';

export const dynamic = 'force-dynamic';

/**
 * ADE Host allowlist — prevents SSRF.
 * Only these hostnames (and demo:// URIs) can be proxied.
 * Add university hostnames here as needed.
 */
const ALLOWED_HOSTS = new Set([
  'ade-consult.univ-artois.fr',
  'ade.univ-artois.fr',
  'ade-web.univ-artois.fr',
  'planning.univ-artois.fr',
  // Generic ADE Campus cloud patterns
  'ade-consulting.grenet.fr',
  'edt.univ-grenoble-alpes.fr',
  // Allow any *.shu or *.ics on known university TLDs
]);

const ALLOWED_HOST_PATTERNS = [
  /\.univ-[a-z-]+\.fr$/,
  /\.u-[a-z-]+\.fr$/,
  /\.ens[a-z-]*\.fr$/,
  /\.edu\.fr$/,
  /\.ac-[a-z-]+\.fr$/,
];

function isAllowedHost(rawUrl: string): boolean {
  // demo:// is always allowed
  if (rawUrl.startsWith('demo://')) return true;

  try {
    const url = new URL(rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`);
    const hostname = url.hostname.toLowerCase();

    // Block private/loopback ranges
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.') ||
      hostname === '::1' ||
      hostname === '0.0.0.0' ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.internal')
    ) {
      return false;
    }

    // Explicit allowlist
    if (ALLOWED_HOSTS.has(hostname)) return true;

    // Pattern allowlist (French university TLDs)
    if (ALLOWED_HOST_PATTERNS.some((p) => p.test(hostname))) return true;

    // .shu files from any HTTPS host are typical ADE exports
    if (url.pathname.endsWith('.shu') || url.pathname.endsWith('.ics')) return true;

    return false;
  } catch {
    return false;
  }
}

function buildResponse(body: ScheduleApiResponse, status = 200) {
  return NextResponse.json<ScheduleApiResponse>(body, {
    status,
    headers: {
      'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
      'Vary': 'Accept-Encoding',
    },
  });
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    let url = searchParams.get('url') ?? searchParams.get('data') ?? searchParams.get('link');
    const isDemo = searchParams.get('demo') === 'true' || searchParams.get('demo') === '1';

    if (isDemo || (!url && searchParams.has('demo'))) {
      url = 'demo://sample-l3';
    }

    if (!url) {
      return buildResponse(
        {
          success: false,
          events: [],
          error: "Paramètre 'url' manquant. Fournir l'URL du flux ADE.",
        },
        400
      );
    }

    // SSRF guard
    if (!isAllowedHost(url)) {
      return buildResponse(
        {
          success: false,
          events: [],
          error:
            "URL non autorisée. Seules les URLs de plannings universitaires ADE Campus (*.univ-*.fr) sont acceptées.",
        },
        403
      );
    }

    const { events, meta, warning } = await fetchAdeSchedule(url);

    return buildResponse({
      success: true,
      events,
      meta,
      warning,
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Erreur inconnue lors du chargement de l'emploi du temps.";
    return buildResponse({ success: false, events: [], error: message }, 500);
  }
}

// POST kept for legacy compatibility — delegates to GET logic
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const url  = body.url ?? body.data ?? body.link ?? (body.demo ? 'demo://sample-l3' : null);

  if (!url) {
    return buildResponse(
      { success: false, events: [], error: "URL manquante dans le corps de la requête." },
      400
    );
  }

  if (!isAllowedHost(url)) {
    return buildResponse(
      { success: false, events: [], error: "URL non autorisée." },
      403
    );
  }

  try {
    const { events, meta, warning } = await fetchAdeSchedule(url);
    return buildResponse({ success: true, events, meta, warning });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue.";
    return buildResponse({ success: false, events: [], error: message }, 500);
  }
}
