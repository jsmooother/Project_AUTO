// Page-specific translations for complex pages
// This keeps the main translations.ts file clean

export const pageTranslations = {
  en: {
    dashboard: {
      title: 'Overview',
      subtitle: 'Your automation summary',
      active: 'Active',
      attentionNeeded: 'Attention needed',
      items: 'items',
      lastSync: 'Last sync:',
    },
    inventory: {
      title: 'Inventory',
      subtitle: 'Manage your product catalog',
    },
    ads: {
      title: 'Ads',
      subtitle: 'Manage your advertising campaigns',
    },
    billing: {
      title: 'Billing',
      subtitle: 'Credits and payment history',
    },
    settings: {
      title: 'Settings',
      subtitle: 'Account and integration settings',
    },
  },
  
  sv: {
    dashboard: {
      title: 'Översikt',
      subtitle: 'Din automationssammanfattning',
      active: 'Aktiv',
      attentionNeeded: 'Uppmärksamhet behövs',
      items: 'objekt',
      lastSync: 'Senaste synk:',
    },
    inventory: {
      title: 'Lager',
      subtitle: 'Hantera din produktkatalog',
    },
    ads: {
      title: 'Annonser',
      subtitle: 'Hantera dina annonskampanjer',
    },
    billing: {
      title: 'Fakturering',
      subtitle: 'Krediter och betalningshistorik',
    },
    settings: {
      title: 'Inställningar',
      subtitle: 'Konto- och integrationsinställningar',
    },
  },
  
  de: {
    dashboard: {
      title: 'Übersicht',
      subtitle: 'Ihre Automatisierungszusammenfassung',
      active: 'Aktiv',
      attentionNeeded: 'Aufmerksamkeit erforderlich',
      items: 'Artikel',
      lastSync: 'Letzte Synchronisation:',
    },
    inventory: {
      title: 'Bestand',
      subtitle: 'Verwalten Sie Ihren Produktkatalog',
    },
    ads: {
      title: 'Anzeigen',
      subtitle: 'Verwalten Sie Ihre Werbekampagnen',
    },
    billing: {
      title: 'Abrechnung',
      subtitle: 'Guthaben und Zahlungshistorie',
    },
    settings: {
      title: 'Einstellungen',
      subtitle: 'Konto- und Integrationseinstellungen',
    },
  },
} as const;
