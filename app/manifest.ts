import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Aura Campus — Emploi du Temps ADE',
    short_name: 'Aura Campus',
    description: "Cockpit académique instantané et hors-ligne — ADE Campus, Université d'Artois",
    start_url: '/?source=pwa',
    scope: '/',
    id: 'aura-campus-v2',
    display: 'standalone',
    display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
    background_color: '#F5F3EE',
    theme_color: '#0052CC',
    orientation: 'portrait-primary',
    lang: 'fr',
    dir: 'ltr',
    categories: ['education', 'productivity', 'utilities'],
    prefer_related_applications: false,
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-maskable-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icons/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
    shortcuts: [
      {
        name: "Planning d'aujourd'hui",
        short_name: "Aujourd'hui",
        description: 'Accéder directement aux cours du jour',
        url: '/?view=day&date=today',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Vue Semaine complète',
        short_name: 'Semaine',
        description: "Vue d'ensemble des cours de la semaine",
        url: '/?view=week',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Radar des Contrôles & Partiels',
        short_name: 'Contrôles',
        description: 'Vérifier les prochains examens',
        url: '/?modal=exams',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Devoirs & Rappels',
        short_name: 'Devoirs',
        description: 'Consulter et cocher les devoirs',
        url: '/?modal=homework',
        icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }],
      },
    ],
    // Note: screenshots require real PNG files in /public/screenshots/
    // Uncomment and add screenshots once assets are generated:
    // screenshots: [
    //   {
    //     src: '/screenshots/day-view-mobile.png',
    //     sizes: '390x844',
    //     type: 'image/png',
    //     form_factor: 'narrow',
    //     label: 'Vue Jour — emploi du temps en temps réel',
    //   },
    //   {
    //     src: '/screenshots/week-view-desktop.png',
    //     sizes: '1280x800',
    //     type: 'image/png',
    //     form_factor: 'wide',
    //     label: 'Vue Semaine — grille de cours',
    //   },
    // ],
    related_applications: [],
  };
}
