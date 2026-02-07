export const translations = {
  en: {
    // Common
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    
    // Onboarding
    onboarding: {
      connect: {
        title: 'Connect Your Data',
        subtitle: 'Link your inventory source to get started',
        companyName: 'Company Name',
        inventoryUrl: 'Inventory URL',
        continue: 'Continue',
        back: 'Back',
      },
      launch: {
        title: 'Launch Your Campaigns',
        subtitle: 'Set your budget and go live',
        monthlyBudget: 'Monthly Budget',
        launch: 'Launch',
        back: 'Back',
      },
    },
  },
  
  sv: {
    // Common
    save: 'Spara',
    cancel: 'Avbryt',
    delete: 'Ta bort',
    edit: 'Redigera',
    loading: 'Laddar...',
    error: 'Fel',
    success: 'Lyckades',
    
    // Onboarding
    onboarding: {
      connect: {
        title: 'Anslut Dina Data',
        subtitle: 'Länka din lagerkälla för att komma igång',
        companyName: 'Företagsnamn',
        inventoryUrl: 'Lager-URL',
        continue: 'Fortsätt',
        back: 'Tillbaka',
      },
      launch: {
        title: 'Starta Dina Kampanjer',
        subtitle: 'Ställ in din budget och gå live',
        monthlyBudget: 'Månadsbudget',
        launch: 'Starta',
        back: 'Tillbaka',
      },
    },
  },
  
  de: {
    // Common
    save: 'Speichern',
    cancel: 'Abbrechen',
    delete: 'Löschen',
    edit: 'Bearbeiten',
    loading: 'Lädt...',
    error: 'Fehler',
    success: 'Erfolg',
    
    // Onboarding
    onboarding: {
      connect: {
        title: 'Verbinden Sie Ihre Daten',
        subtitle: 'Verknüpfen Sie Ihre Inventarquelle, um zu beginnen',
        companyName: 'Firmenname',
        inventoryUrl: 'Inventar-URL',
        continue: 'Weiter',
        back: 'Zurück',
      },
      launch: {
        title: 'Starten Sie Ihre Kampagnen',
        subtitle: 'Legen Sie Ihr Budget fest und gehen Sie live',
        monthlyBudget: 'Monatsbudget',
        launch: 'Starten',
        back: 'Zurück',
      },
    },
  },
} as const;

export type TranslationKey = keyof typeof translations.en;
