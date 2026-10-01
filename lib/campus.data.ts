/**
 * Campus Data & Lens Campus Directory (Université d'Artois - Faculté des Sciences de Lens)
 * Data-driven decoder for rooms, buildings, amphitheaters, and facilities.
 */

export interface DecodedCampusLocation {
  isKnown: boolean;
  rawRoom: string;
  badge: string;
  building: string;
  floor: string;
  capacity?: number;
  accessibility: string;
  equipment?: string[];
  note?: string;
  landmark?: string;
}

export interface BuildingInfo {
  code: string;
  name: string;
  department: string;
  floorsCount: number;
  hasElevator: boolean;
  facilities: string[];
}

export const LENS_BUILDINGS: Record<string, BuildingInfo> = {
  D: {
    code: 'D',
    name: 'Bâtiment D',
    department: 'Mathématiques & Informatique',
    floorsCount: 3,
    hasElevator: true,
    facilities: ['Laboratoires Informatique', 'Salles TP Réseau', 'WiFi Eduroam Haut Débit', 'Distributeur RDC'],
  },
  C: {
    code: 'C',
    name: 'Bâtiment C',
    department: 'Physique & Chimie',
    floorsCount: 3,
    hasElevator: true,
    facilities: ['Laboratoires de Chimie', 'Salles de Travaux Pratiques', 'Préparation'],
  },
  E: {
    code: 'E',
    name: 'Bâtiment E',
    department: 'Biologie & Sciences de la Terre (SVT)',
    floorsCount: 2,
    hasElevator: false,
    facilities: ['Herbiers', 'Laboratoires de Microscopie', 'Microbiologie'],
  },
  B: {
    code: 'B',
    name: 'Bâtiment B',
    department: 'Administration & Scolarité',
    floorsCount: 2,
    hasElevator: true,
    facilities: ['Guichet Scolarité', 'Bureau des Examens', 'Relations Internationales'],
  },
};

/**
 * Decodes a raw room or location string into structured campus info.
 * Fallback to structured "Salle inconnue" if room cannot be parsed.
 */
export function decodeCampusRoom(rawRoom?: string, rawLocation?: string): DecodedCampusLocation {
  const text = `${rawRoom || ''} ${rawLocation || ''}`.trim();
  const raw = rawRoom || rawLocation || '';

  if (!text) {
    return {
      isKnown: false,
      rawRoom: '',
      badge: 'Salle non précisée',
      building: 'Bâtiment non assigné',
      floor: 'Inconnu',
      accessibility: 'Accès non vérifié',
      note: 'Vérifiez sur votre intranet ADE ou auprès de la scolarité',
    };
  }

  // 1. Amphithéâtres majeurs
  if (/barbeaux/i.test(text)) {
    return {
      isKnown: true,
      rawRoom: raw,
      badge: 'Sciences · Grand Amphi Barbeaux',
      building: 'Faculté des Sciences (Bât. Central)',
      floor: 'Rez-de-chaussée',
      capacity: 350,
      accessibility: 'Accès PMR de plain-pied (rampe d\'accès entrée Nord)',
      equipment: ['Vidéoprojection double', 'Micro cravate', 'Prises électriques sous pupitre'],
      landmark: 'Entrée principale face au parvis',
      note: 'Grand amphi principal de la Faculté des Sciences de Lens',
    };
  }

  if (/souriau/i.test(text)) {
    return {
      isKnown: true,
      rawRoom: raw,
      badge: 'Sciences · Amphi Souriau',
      building: 'Faculté des Sciences (Aile Amphis)',
      floor: 'Rez-de-chaussée',
      capacity: 220,
      accessibility: 'Accès PMR complet de plain-pied',
      equipment: ['Projection laser HD', 'Tableau triptyque', 'Système audio amplifié'],
      landmark: 'Aile Ouest des amphithéâtres',
      note: 'Amphithéâtre des sciences exactes',
    };
  }

  if (/amphi\s*([a-f\d]+)?/i.test(text)) {
    const match = text.match(/amphi\s*([a-f\d]+)?/i);
    const letter = match?.[1]?.toUpperCase() || 'Sciences';
    return {
      isKnown: true,
      rawRoom: raw,
      badge: `Amphithéâtre ${letter}`,
      building: 'Faculté des Sciences',
      floor: 'Rez-de-chaussée',
      capacity: 150,
      accessibility: 'Accès PMR de plain-pied',
      equipment: ['Vidéoprojecteur', 'Micros pupitre'],
      note: 'Amphithéâtre de cours magistral',
    };
  }

  // 2. Bibliothèque Universitaire / BU
  if (/\bbu\b|biblioth/i.test(text)) {
    return {
      isKnown: true,
      rawRoom: raw,
      badge: 'Bibliothèque Universitaire (BU)',
      building: 'BU Lens Sciences',
      floor: 'Rez-de-chaussée & 1er étage',
      accessibility: 'Accès PMR ascenseur et portes automatiques',
      equipment: ['Boxes de travail en groupe', 'Postes informatiques', 'Imprimantes copieurs'],
      landmark: 'En face du parvis des amphithéâtres',
      note: 'Horaires usuels : 8h30 – 19h00 du lundi au vendredi',
    };
  }

  // 3. Salles de cours et TP régulières : Lettre + 3 chiffres (ex: D004, D102, C203, E101)
  const roomPattern = text.match(/\b([A-F])(\d{3})\b/i);
  if (roomPattern) {
    const letter = roomPattern[1].toUpperCase();
    const num = roomPattern[2];
    const floorDigit = num[0];

    const buildingMeta = LENS_BUILDINGS[letter] || {
      code: letter,
      name: `Bâtiment ${letter}`,
      department: 'Sciences',
      floorsCount: 3,
      hasElevator: true,
      facilities: [],
    };

    let floorName = 'Rez-de-chaussée';
    if (floorDigit === '1') floorName = '1er étage';
    else if (floorDigit === '2') floorName = '2ème étage';
    else if (floorDigit === '3') floorName = '3ème étage';

    const isLab = /tp|info|reseau|chimie|physique/i.test(text) || ['01', '02', '03', '04', '05'].includes(num.slice(1));

    return {
      isKnown: true,
      rawRoom: raw,
      badge: `Bât. ${letter} · Salle ${letter}${num}`,
      building: `${buildingMeta.name} (${buildingMeta.department})`,
      floor: floorName,
      capacity: isLab ? 30 : 45,
      accessibility: buildingMeta.hasElevator
        ? 'Accessible PMR via ascenseur du bâtiment'
        : 'Accès par escalier (pas d\'ascenseur)',
      equipment: isLab
        ? ['Postes informatiques étudiants', 'Vidéo-projecteur mural', 'Connexion filaire RJ45']
        : ['Tableau blanc / feutres', 'Vidéoprojecteur plafond'],
      landmark: `Entrée ${letter}, ${floorName}`,
      note: `Salle ${letter}${num} située au ${floorName.toLowerCase()} du ${buildingMeta.name}`,
    };
  }

  // 4. Fallback « salle inconnue »
  return {
    isKnown: false,
    rawRoom: raw,
    badge: raw || 'Salle non répertoriée',
    building: 'Bâtiment non reconnu',
    floor: 'Étage non déterminé',
    accessibility: 'Informations d\'accessibilité non disponibles',
    note: 'Cette salle n\'a pas de correspondance exacte dans l\'annuaire du campus de Lens. Consultez le plan d\'affichage de la faculté.',
  };
}
