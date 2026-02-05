export const translations = {
  sv: {
    // Common
    common: {
      loading: "Laddar...",
      save: "Spara",
      cancel: "Avbryt",
      delete: "Ta bort",
      edit: "Redigera",
      back: "Tillbaka",
      next: "Nästa",
      previous: "Föregående",
      search: "Sök",
      filter: "Filtrera",
      sort: "Sortera",
      actions: "Åtgärder",
      status: "Status",
      active: "Aktiv",
      inactive: "Inaktiv",
      enabled: "Aktiverad",
      disabled: "Inaktiverad",
      connected: "Ansluten",
      disconnected: "Frånkopplad",
      success: "Lyckades",
      error: "Fel",
      warning: "Varning",
      info: "Information",
    },

    // Navigation
    nav: {
      dashboard: "Översikt",
      ads: "Annonser",
      inventory: "Lager",
      performance: "Prestanda",
      billing: "Fakturering",
      settings: "Inställningar",
      logout: "Logga ut",
    },

    // Dashboard
    dashboard: {
      title: "Översikt",
      subtitle: "Din annonsautomation i ett ögonkast",
      welcomeBack: "Välkommen tillbaka",
      quickStats: "Snabb statistik",
      recentActivity: "Senaste aktivitet",
      upcomingRuns: "Kommande körningar",
    },

    // Billing
    billing: {
      title: "Fakturering & Krediter",
      subtitle: "Dina Project Auto-krediter och leveransstatistik",
      creditsRemaining: "Återstående krediter",
      plan: "Abonnemang",
      billingMode: "Fakturering",
      monthlyPrice: "Månadspris",
      timeBased: "Tidsbaserad",
      impressionBased: "Impressionsbaserad",
      deliverySummary: "Leveranssammanfattning",
      impressions: "Visningar",
      clicks: "Klick",
      ctr: "CTR",
      reach: "Räckvidd",
      creditsUsed: "Använda krediter",
      last7Days: "Senaste 7 dagarna",
      last30Days: "Senaste 30 dagarna",
      thisMonthMtd: "Denna månad (MTD)",
      noBillingData: "Ingen faktureringsdata tillgänglig.",
    },

    // Settings
    settings: {
      title: "Inställningar",
      subtitle: "Hantera ditt konto och anslutna tjänster",
      
      // Account
      accountInfo: "Kontoinformation",
      accountInfoDesc: "Dina personliga uppgifter och företagsdetaljer",
      fullName: "Fullständigt namn",
      email: "E-post",
      companyName: "Företagsnamn",
      saveChanges: "Spara ändringar",
      saving: "Sparar...",

      // Website
      connectedWebsite: "Ansluten webbplats",
      connectedWebsiteDesc: "Din lagerkälla",
      noWebsiteConnected: "Ingen webbplats ansluten",
      noWebsiteDesc: "Anslut din lagerwebbplats för att börja automatisera annonser",
      connectWebsite: "Anslut webbplats",
      connectedOn: "Ansluten den",
      lastSync: "Senaste synk",
      itemsDetected: "Objekt upptäckta",
      testConnection: "Testa anslutning",
      testing: "Testar...",
      updateWebsiteUrl: "Uppdatera webbplats-URL",
      update: "Uppdatera",
      updating: "Uppdaterar...",
      urlChangeWarning: "Att ändra din URL kommer att utlösa en ny lagerskanning",
      mvpLimitationWebsite: "MVP-begränsning: Endast en webbplatskälla stöds. Flera källor kommer i v2.",

      // Meta
      connectedMeta: "Ansluten Meta-konto",
      connectedMetaDesc: "Din Meta (Facebook/Instagram) annonsplattform",
      notConnected: "Inte ansluten",
      connectYourMeta: "Anslut ditt Meta-konto",
      devModeAvailable: "Dev-läge tillgängligt",
      comingSoon: "Kommer snart",
      connectMetaDesc: "Anslut ditt Meta-konto för att aktivera annonsskapande",
      devConnectDesc: "Använd dev connect för att testa integrationsflödet",
      metaComingSoonDesc: "Meta Ads-integration kommer att finnas tillgänglig i en framtida version",
      reconnect: "Återanslut",
      disconnect: "Koppla från",
      disconnecting: "Kopplar från...",
      connecting: "Ansluter...",
      connectMeta: "Anslut Meta",
      devFakeConnect: "🔧 Dev: Fejkanslutning",
      accountId: "Konto-ID",
      permissions: "Behörigheter",
      campaignManagement: "Kampanjhantering",
      adAccountSelection: "Val av annonskonto",
      adAccountSelectionDesc: "Välj vilket Meta-annonskonto som ska användas för dina kampanjer",
      selectedAccount: "Valt konto",
      adAccount: "Annonskonto",
      loadingAccounts: "Laddar konton...",
      selectAdAccount: "Välj ett annonskonto",
      saveSelection: "Spara val",
      noAdAccounts: "Inga annonskonton hittades. Se till att ditt Meta-konto har annonskonton konfigurerade.",
      metaSmokeTest: "Meta API-anslutningstest",
      metaSmokeTestDesc: "Verifiera att din Meta-åtkomsttoken fungerar med Graph API",
      runMetaSmokeTest: "Kör Meta-röktest",
      connectionSuccessful: "Anslutning lyckades",
      me: "Jag",
      adAccounts: "Annonskonton",
      found: "hittade",
      andMore: "och {count} till",
      mvpLimitationMeta: "MVP-begränsning: Endast Meta Ads stöds. Google Ads, TikTok och andra plattformar kommer i v2.",

      // Notifications
      notificationPreferences: "Aviseringsinställningar",
      notificationPreferencesDesc: "Välj vilka uppdateringar du vill ta emot",
      runCompletionNotif: "Aviseringar om körning slutförd",
      runCompletionDesc: "Få aviseringar när automationskörningar slutförs (lyckades eller misslyckades)",
      errorAlerts: "Fellarm",
      errorAlertsDesc: "Omedelbara larm när körningar misslyckas eller anslutningar bryts",
      budgetAlerts: "Budgetlarm",
      budgetAlertsDesc: "Larm när du når 75%, 90% och 100% av din månatliga budget",
      inventoryChangeSummary: "Sammanfattning av lagerändringar",
      inventoryChangeSummaryDesc: "Daglig sammanfattning av nya och borttagna objekt",
      weeklySummary: "Veckorapport",
      weeklySummaryDesc: "Veckovis översikt av lager, körningar och annonsprestanda",
      productUpdates: "Produktuppdateringar & tips",
      productUpdatesDesc: "Enstaka e-postmeddelanden om nya funktioner och bästa praxis",

      // Danger Zone
      dangerZone: "Farlig zon",
      dangerZoneDesc: "Oåterkalleliga åtgärder för ditt konto",
      disconnectWebsite: "Koppla från webbplats",
      disconnectWebsiteDesc: "Ta bort din webbplatsanslutning. Automationen kommer att stoppas men annonskampanjer förblir aktiva.",
      pauseAutomation: "Pausa automation",
      pauseAutomationDesc: "Stoppa tillfälligt alla automationskörningar. Dina anslutningar och data kommer att finnas kvar.",
      pause: "Pausa",
      deleteAccount: "Ta bort konto",
      deleteAccountDesc: "Ta permanent bort ditt konto, all data, koppla från integrationer och stoppa fakturering.",
    },

    // Performance
    performance: {
      title: "Prestanda",
      subtitle: "Analysera dina annonser och kampanjresultat",
    },

    // Ads
    ads: {
      title: "Annonser",
      subtitle: "Hantera dina automatiserade annonskampanjer",
      setup: "Konfigurera",
      campaigns: "Kampanjer",
      diagnostics: "Diagnostik",
    },

    // Inventory
    inventory: {
      title: "Lager",
      subtitle: "Dina produkter och lagerobjekt",
      items: "objekt",
      lastUpdated: "Senast uppdaterad",
    },

    // Auth
    auth: {
      login: "Logga in",
      logout: "Logga ut",
      signup: "Registrera dig",
      email: "E-post",
      password: "Lösenord",
      forgotPassword: "Glömt lösenord?",
      dontHaveAccount: "Har du inget konto?",
      alreadyHaveAccount: "Har du redan ett konto?",
    },

    // Errors
    errors: {
      somethingWentWrong: "Något gick fel",
      tryAgain: "Försök igen",
      pageNotFound: "Sidan hittades inte",
      unauthorized: "Obehörig",
      forbidden: "Förbjuden",
      serverError: "Serverfel",
    },
  },

  en: {
    // Common
    common: {
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      back: "Back",
      next: "Next",
      previous: "Previous",
      search: "Search",
      filter: "Filter",
      sort: "Sort",
      actions: "Actions",
      status: "Status",
      active: "Active",
      inactive: "Inactive",
      enabled: "Enabled",
      disabled: "Disabled",
      connected: "Connected",
      disconnected: "Disconnected",
      success: "Success",
      error: "Error",
      warning: "Warning",
      info: "Info",
    },

    // Navigation
    nav: {
      dashboard: "Dashboard",
      ads: "Ads",
      inventory: "Inventory",
      performance: "Performance",
      billing: "Billing",
      settings: "Settings",
      logout: "Logout",
    },

    // Dashboard
    dashboard: {
      title: "Dashboard",
      subtitle: "Your ad automation at a glance",
      welcomeBack: "Welcome back",
      quickStats: "Quick stats",
      recentActivity: "Recent activity",
      upcomingRuns: "Upcoming runs",
    },

    // Billing
    billing: {
      title: "Billing & Credits",
      subtitle: "Your Project Auto credits and delivery metrics",
      creditsRemaining: "Credits remaining",
      plan: "Plan",
      billingMode: "Billing",
      monthlyPrice: "Monthly price",
      timeBased: "Time-based",
      impressionBased: "Impression-based",
      deliverySummary: "Delivery summary",
      impressions: "Impressions",
      clicks: "Clicks",
      ctr: "CTR",
      reach: "Reach",
      creditsUsed: "Credits used",
      last7Days: "Last 7 days",
      last30Days: "Last 30 days",
      thisMonthMtd: "This month (MTD)",
      noBillingData: "No billing data available.",
    },

    // Settings
    settings: {
      title: "Settings",
      subtitle: "Manage your account and connected services",
      
      // Account
      accountInfo: "Account information",
      accountInfoDesc: "Your personal and company details",
      fullName: "Full name",
      email: "Email",
      companyName: "Company name",
      saveChanges: "Save Changes",
      saving: "Saving...",

      // Website
      connectedWebsite: "Connected website",
      connectedWebsiteDesc: "Your inventory source",
      noWebsiteConnected: "No website connected",
      noWebsiteDesc: "Connect your inventory website to start automating ads",
      connectWebsite: "Connect Website",
      connectedOn: "Connected on",
      lastSync: "Last sync",
      itemsDetected: "Items detected",
      testConnection: "Test Connection",
      testing: "Testing...",
      updateWebsiteUrl: "Update website URL",
      update: "Update",
      updating: "Updating...",
      urlChangeWarning: "Changing your URL will trigger a new inventory scan",
      mvpLimitationWebsite: "MVP limitation: Only one website source supported. Multiple sources coming in v2.",

      // Meta
      connectedMeta: "Connected Meta account",
      connectedMetaDesc: "Your Meta (Facebook/Instagram) advertising platform",
      notConnected: "Not connected",
      connectYourMeta: "Connect your Meta account",
      devModeAvailable: "Dev mode available",
      comingSoon: "Coming soon",
      connectMetaDesc: "Connect your Meta account to enable ad creation",
      devConnectDesc: "Use dev connect to test the integration flow",
      metaComingSoonDesc: "Meta Ads integration will be available in a future release",
      reconnect: "Reconnect",
      disconnect: "Disconnect",
      disconnecting: "Disconnecting...",
      connecting: "Connecting...",
      connectMeta: "Connect Meta",
      devFakeConnect: "🔧 Dev: Fake Connect",
      accountId: "Account ID",
      permissions: "Permissions",
      campaignManagement: "Campaign management",
      adAccountSelection: "Ad Account Selection",
      adAccountSelectionDesc: "Select which Meta ad account to use for your campaigns",
      selectedAccount: "Selected account",
      adAccount: "Ad Account",
      loadingAccounts: "Loading accounts...",
      selectAdAccount: "Select an ad account",
      saveSelection: "Save Selection",
      noAdAccounts: "No ad accounts found. Make sure your Meta account has ad accounts set up.",
      metaSmokeTest: "Meta API Connection Test",
      metaSmokeTestDesc: "Verify your Meta access token works with the Graph API",
      runMetaSmokeTest: "Run Meta smoke test",
      connectionSuccessful: "Connection successful",
      me: "Me",
      adAccounts: "Ad Accounts",
      found: "found",
      andMore: "and {count} more",
      mvpLimitationMeta: "MVP limitation: Only Meta Ads supported. Google Ads, TikTok, and other platforms coming in v2.",

      // Notifications
      notificationPreferences: "Notification preferences",
      notificationPreferencesDesc: "Choose what updates you want to receive",
      runCompletionNotif: "Run completion notifications",
      runCompletionDesc: "Get notified when automation runs complete (success or failure)",
      errorAlerts: "Error alerts",
      errorAlertsDesc: "Immediate alerts when runs fail or connections drop",
      budgetAlerts: "Budget alerts",
      budgetAlertsDesc: "Alerts when you reach 75%, 90%, and 100% of your monthly budget",
      inventoryChangeSummary: "Inventory change summary",
      inventoryChangeSummaryDesc: "Daily digest of new and removed items",
      weeklySummary: "Weekly summary report",
      weeklySummaryDesc: "Weekly overview of inventory, runs, and ad performance",
      productUpdates: "Product updates & tips",
      productUpdatesDesc: "Occasional emails about new features and best practices",

      // Danger Zone
      dangerZone: "Danger zone",
      dangerZoneDesc: "Irreversible actions for your account",
      disconnectWebsite: "Disconnect website",
      disconnectWebsiteDesc: "Remove your website connection. Automation will stop but ad campaigns will remain active.",
      pauseAutomation: "Pause automation",
      pauseAutomationDesc: "Temporarily stop all automation runs. Your connections and data will remain.",
      pause: "Pause",
      deleteAccount: "Delete account",
      deleteAccountDesc: "Permanently delete your account, all data, disconnect integrations, and stop billing.",
    },

    // Performance
    performance: {
      title: "Performance",
      subtitle: "Analyze your ads and campaign results",
    },

    // Ads
    ads: {
      title: "Ads",
      subtitle: "Manage your automated ad campaigns",
      setup: "Setup",
      campaigns: "Campaigns",
      diagnostics: "Diagnostics",
    },

    // Inventory
    inventory: {
      title: "Inventory",
      subtitle: "Your products and inventory items",
      items: "items",
      lastUpdated: "Last updated",
    },

    // Auth
    auth: {
      login: "Login",
      logout: "Logout",
      signup: "Sign up",
      email: "Email",
      password: "Password",
      forgotPassword: "Forgot password?",
      dontHaveAccount: "Don't have an account?",
      alreadyHaveAccount: "Already have an account?",
    },

    // Errors
    errors: {
      somethingWentWrong: "Something went wrong",
      tryAgain: "Try again",
      pageNotFound: "Page not found",
      unauthorized: "Unauthorized",
      forbidden: "Forbidden",
      serverError: "Server error",
    },
  },
};

export type Language = keyof typeof translations;
export type TranslationKeys = typeof translations.sv;
