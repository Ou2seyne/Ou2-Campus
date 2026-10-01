import { describe, it, expect } from 'vitest';
import { getLensCampusInfo } from '@/lib/campus';

describe('V3 Views & Campus Decoder', () => {
  it('decodes room codes accurately for Lens campus', () => {
    const dRoom = getLensCampusInfo('D004');
    expect(dRoom).not.toBeNull();
    expect(dRoom?.building).toContain('Bâtiment D');
    expect(dRoom?.floor).toBe('Rez-de-chaussée');
    expect(dRoom?.badge).toContain('Salle 004');

    const eRoom = getLensCampusInfo('E203');
    expect(eRoom).not.toBeNull();
    expect(eRoom?.building).toContain('Bâtiment E');
    expect(eRoom?.floor).toBe('2ème étage');

    const souriauAmphi = getLensCampusInfo('Amphi Souriau');
    expect(souriauAmphi).not.toBeNull();
    expect(souriauAmphi?.badge).toContain('Souriau');
  });

  it('handles unknown or empty locations gracefully', () => {
    expect(getLensCampusInfo('')).toBeNull();
    expect(getLensCampusInfo(undefined, undefined)).toBeNull();
    expect(getLensCampusInfo('Salle Inconnue XYZ')).toBeNull();
  });
});
