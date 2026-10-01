export interface CampusLocationInfo {
  building: string;
  floor: string;
  badge: string;
  note?: string;
}

export function getLensCampusInfo(rawRoom?: string, rawLocation?: string): CampusLocationInfo | null {
  const text = `${rawRoom || ''} ${rawLocation || ''}`.trim();
  if (!text) return null;

  // Amphithéâtres
  if (/barbeaux/i.test(text)) {
    return {
      building: 'Bâtiment Sciences',
      floor: 'Rez-de-chaussée',
      badge: 'Sciences · Grand Amphi',
      note: 'Entrée principale de la Faculté des Sciences de Lens',
    };
  }
  if (/souriau/i.test(text)) {
    return {
      building: 'Bâtiment Sciences',
      floor: 'Rez-de-chaussée',
      badge: 'Sciences · Amphi Souriau',
      note: 'Aile amphithéâtres, Faculté des Sciences',
    };
  }
  if (/amphi/i.test(text)) {
    return {
      building: 'Bâtiment Sciences',
      floor: 'Rez-de-chaussée',
      badge: 'Amphithéâtre',
    };
  }

  // Salles de cours & TP : Lettre + Chiffres (ex: D004, E102, C203)
  const roomMatch = text.match(/\b([A-F])(\d{3})\b/i);
  if (roomMatch) {
    const letter = roomMatch[1].toUpperCase();
    const num = roomMatch[2];
    const floorDigit = num[0];

    let floorName = 'Rez-de-chaussée';
    if (floorDigit === '1') floorName = '1er étage';
    else if (floorDigit === '2') floorName = '2ème étage';
    else if (floorDigit === '3') floorName = '3ème étage';

    let buildingName = `Bâtiment ${letter}`;
    if (letter === 'D') buildingName = 'Bâtiment D (Maths & Info)';
    else if (letter === 'C') buildingName = 'Bâtiment C (Chimie & Physique)';
    else if (letter === 'E') buildingName = 'Bâtiment E (Biologie / Géol.)';
    else if (letter === 'B') buildingName = 'Bâtiment B';

    return {
      building: buildingName,
      floor: floorName,
      badge: `Bât. ${letter} · Salle ${num} (${floorName})`,
    };
  }

  return null;
}

export const getCampusLocation = getLensCampusInfo;
