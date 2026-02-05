export type Language = "sv" | "en";

export interface Translations {
  common: {
    save: string;
    cancel: string;
    loading: string;
    logout: string;
    error: string;
    retry: string;
    view: string;
    edit: string;
    delete: string;
    create: string;
    update: string;
    back: string;
    next: string;
    previous: string;
    close: string;
    confirm: string;
  };
  nav: {
    dashboard: string;
    inventory: string;
    automation: string;
    templates: string;
    ads: string;
    performance: string;
    billing: string;
    settings: string;
  };
  automation: {
    title: string;
    description: string;
    monthlyBudget: string;
    monthlyBudgetDescription: string;
    monthlyBudgetUsd: string;
    metaAdsLimit: string;
    currentMonthUsage: string;
    daysRemaining: string;
    howBudgetWorks: string;
    howBudgetWorksText: string;
    updateBudget: string;
    alwaysOn: string;
    active: string;
    alwaysOnDescription: string;
    enableAutomaticSync: string;
    enableAutomaticSyncDescription: string;
    nextScheduledRun: string;
    onDemand: string;
    onDemandDescription: string;
    runManualSync: string;
    runManualSyncDescription: string;
    lastManualRun: string;
    currentStatus: string;
    mode: string;
    lastRun: string;
    status: string;
    healthy: string;
    itemsSynced: string;
    howAutomationWorks: string;
    autoCreateAds: string;
    autoCreateAdsText: string;
    autoPauseAds: string;
    autoPauseAdsText: string;
    budgetDistribution: string;
    budgetDistributionText: string;
    dailyMonitoring: string;
    dailyMonitoringText: string;
    runHistory: string;
    allRuns: string;
    last30Days: string;
    started: string;
    trigger: string;
    duration: string;
    seen: string;
    new: string;
    removed: string;
    statusCol: string;
    manual: string;
    scheduled: string;
    success: string;
    failed: string;
    running: string;
    queued: string;
    completedSuccessfully: string;
    never: string;
  };
  currency: {
    sek: string;
    usd: string;
  };
  ads: {
    testModeBanner: string;
    testModeBannerDescription: string;
    previewTitle: string;
    previewDescription: string;
    previewAds: string;
    proceedToPublish: string;
    qaGateFailing: string;
    qaGateFailingHint: string;
    itemsToPublish: string;
    noItemsToPublish: string;
    publishBlocked: string;
    price: string;
    destinationUrl: string;
    viewItem: string;
    verifyMetaAccessCta: string;
  };
  settings: {
    meta: {
      step1Optional: string;
      step2SelectAdAccount: string;
        step3GrantPartnerAccess: string;
        grantPartnerAccessTitle: string;
        connectMeta: string;
      selectAdAccount: string;
      grantPartnerInstructions: string;
      openMetaBusinessSettings: string;
      verifyAccess: string;
      checking: string;
      statusPending: string;
      statusVerified: string;
      statusFailed: string;
      partnerAccessVerified: string;
      accessNotGrantedYet: string;
      metaNotConfiguredBanner: string;
    };
  };
}

export const translations: Record<Language, Translations> = {
  sv: {
    common: {
      save: "Spara",
      cancel: "Avbryt",
      loading: "Laddar...",
      logout: "Logga ut",
      error: "Fel",
      retry: "Försök igen",
      view: "Visa",
      edit: "Redigera",
      delete: "Ta bort",
      create: "Skapa",
      update: "Uppdatera",
      back: "Tillbaka",
      next: "Nästa",
      previous: "Föregående",
      close: "Stäng",
      confirm: "Bekräfta",
    },
    nav: {
      dashboard: "Instrumentpanel",
      inventory: "Lager",
      automation: "Automatisering",
      templates: "Mallar",
      ads: "Annonser",
      performance: "Prestanda",
      billing: "Fakturering",
      settings: "Inställningar",
    },
    automation: {
      title: "Automatisering",
      description: "Hantera din lagersynkronisering, budget och kampanjautomatisering",
      monthlyBudget: "Månadsbudget för annonser",
      monthlyBudgetDescription: "Ange din totala månatliga annonsutgift för alla kampanjer",
      monthlyBudgetUsd: "Månadsbudget (SEK)",
      metaAdsLimit: "Detta är din Meta Ads-utgiftsgräns. Kampanjer pausas när denna nås.",
      currentMonthUsage: "Nuvarande månadsanvändning",
      daysRemaining: "dagar kvar i faktureringscykeln",
      howBudgetWorks: "Hur budgeten fungerar",
      howBudgetWorksText: "Denna budget spenderas direkt med Meta Ads. Project Auto fördelar den jämnt över dina aktiva lagerposter. Du kan justera detta när som helst.",
      updateBudget: "Uppdatera budget",
      alwaysOn: "Alltid på",
      active: "Aktiv",
      alwaysOnDescription: "Synkronisera lager automatiskt varje natt kl 02:00",
      enableAutomaticSync: "Aktivera automatisk synkronisering",
      enableAutomaticSyncDescription: "Kontrollera efter nya och borttagna objekt varje natt",
      nextScheduledRun: "Nästa schemalagda körning",
      onDemand: "På begäran",
      onDemandDescription: "Utlös en synkronisering manuellt när du behöver",
      runManualSync: "Kör manuell synkronisering",
      runManualSyncDescription: "Kör en manuell synkronisering för att omedelbart kontrollera efter lagersändringar och uppdatera kampanjer",
      lastManualRun: "Senaste manuella körningen",
      currentStatus: "Nuvarande status",
      mode: "Läge",
      lastRun: "Senaste körningen",
      status: "Status",
      healthy: "Frisk",
      itemsSynced: "Synkroniserade objekt",
      howAutomationWorks: "Hur automatisering fungerar",
      autoCreateAds: "Skapa annonser automatiskt:",
      autoCreateAdsText: "Nya lagerposter får automatiskt kampanjer skapade på Meta Ads",
      autoPauseAds: "Pausa annonser automatiskt:",
      autoPauseAdsText: "När objekt tas bort från din webbplats pausas deras kampanjer automatiskt",
      budgetDistribution: "Budgetfördelning:",
      budgetDistributionText: "Din månadsbudget fördelas jämnt över alla aktiva objekt",
      dailyMonitoring: "Daglig övervakning:",
      dailyMonitoringText: "Kampanjer övervakas och justeras för att hålla sig inom dina budgetgränser",
      runHistory: "Körhistorik",
      allRuns: "Alla körningar",
      last30Days: "Senaste 30 dagarna",
      started: "Startad",
      trigger: "Utlösare",
      duration: "Varaktighet",
      seen: "Sett",
      new: "Ny",
      removed: "Borttagen",
      statusCol: "Status",
      manual: "Manuell",
      scheduled: "Schemalagd",
      success: "Lyckades",
      failed: "Misslyckades",
      running: "Körs",
      queued: "Köad",
      completedSuccessfully: "Slutförd framgångsrikt",
      never: "Aldrig",
    },
    currency: {
      sek: "SEK",
      usd: "USD",
    },
    ads: {
      testModeBanner: "Intern Meta-testläge aktiv",
      testModeBannerDescription: "Publicering använder Project Auto annonskonto. Endast för intern testning.",
      previewTitle: "Förhandsgranska annonser",
      previewDescription: "Granska vad som kommer att publiceras innan du fortsätter",
      previewAds: "Förhandsgranska annonser",
      proceedToPublish: "Fortsätt till publicering",
      qaGateFailing: "Kvalitetskontroll misslyckades",
      qaGateFailingHint: "Kontrollera Scrape QA-panelen eller lagerkvalitet innan du fortsätter.",
      itemsToPublish: "Objekt som kommer att publiceras",
      noItemsToPublish: "Inga objekt hittades att publicera",
      publishBlocked: "Publicering blockerad",
      price: "Pris",
      destinationUrl: "Mål-URL",
      viewItem: "Visa objekt",
      verifyMetaAccessCta: "Verifiera Meta-åtkomst i Inställningar",
    },
    settings: {
      meta: {
        step1Optional: "Steg 1 (valfritt)",
        step2SelectAdAccount: "Steg 2",
        step3GrantPartnerAccess: "Steg 3",
        grantPartnerAccessTitle: "Ge partneråtkomst",
        connectMeta: "Anslut Meta",
        selectAdAccount: "Välj annonskonto",
        grantPartnerInstructions: "Lägg till {partnerName} som partner i din Meta Business Manager och ge åtkomst till det valda annonskontot. Klicka sedan på Verifiera.",
        openMetaBusinessSettings: "Öppna Meta Business-inställningar",
        verifyAccess: "Verifiera",
        checking: "Kontrollerar…",
        statusPending: "Väntar",
        statusVerified: "Verifierad",
        statusFailed: "Misslyckad",
        partnerAccessVerified: "Partneråtkomst verifierad. Annonser kan skapas i ditt annonskonto.",
        accessNotGrantedYet: "Åtkomst inte beviljad än.",
        metaNotConfiguredBanner: "Meta är inte konfigurerad för produktion. Sätt META_SYSTEM_USER_ACCESS_TOKEN på servern för att aktivera partnerverifiering.",
      },
    },
  },
  en: {
    common: {
      save: "Save",
      cancel: "Cancel",
      loading: "Loading...",
      logout: "Log out",
      error: "Error",
      retry: "Retry",
      view: "View",
      edit: "Edit",
      delete: "Delete",
      create: "Create",
      update: "Update",
      back: "Back",
      next: "Next",
      previous: "Previous",
      close: "Close",
      confirm: "Confirm",
    },
    nav: {
      dashboard: "Dashboard",
      inventory: "Inventory",
      automation: "Automation",
      templates: "Templates",
      ads: "Ads",
      performance: "Performance",
      billing: "Billing",
      settings: "Settings",
    },
    automation: {
      title: "Automation",
      description: "Manage your inventory sync, budget, and campaign automation",
      monthlyBudget: "Monthly ad budget",
      monthlyBudgetDescription: "Set your total monthly ad spend across all campaigns",
      monthlyBudgetUsd: "Monthly budget (USD)",
      metaAdsLimit: "This is your Meta Ads spend limit. Campaigns will pause when this is reached.",
      currentMonthUsage: "Current month usage",
      daysRemaining: "days remaining in billing cycle",
      howBudgetWorks: "How budget works",
      howBudgetWorksText: "This budget is spent directly with Meta Ads. Project Auto distributes it evenly across your active inventory items. You can adjust this anytime.",
      updateBudget: "Update Budget",
      alwaysOn: "Always On",
      active: "Active",
      alwaysOnDescription: "Automatically sync inventory every night at 2:00 AM",
      enableAutomaticSync: "Enable automatic sync",
      enableAutomaticSyncDescription: "Check for new and removed items nightly",
      nextScheduledRun: "Next scheduled run",
      onDemand: "On Demand",
      onDemandDescription: "Manually trigger a sync anytime you need",
      runManualSync: "Run Manual Sync",
      runManualSyncDescription: "Run a manual sync to immediately check for inventory changes and update campaigns",
      lastManualRun: "Last manual run",
      currentStatus: "Current status",
      mode: "Mode",
      lastRun: "Last run",
      status: "Status",
      healthy: "Healthy",
      itemsSynced: "Items synced",
      howAutomationWorks: "How automation works",
      autoCreateAds: "Auto-create ads:",
      autoCreateAdsText: "New inventory items automatically get campaigns created on Meta Ads",
      autoPauseAds: "Auto-pause ads:",
      autoPauseAdsText: "When items are removed from your website, their campaigns are automatically paused",
      budgetDistribution: "Budget distribution:",
      budgetDistributionText: "Your monthly budget is evenly distributed across all active items",
      dailyMonitoring: "Daily monitoring:",
      dailyMonitoringText: "Campaigns are monitored and adjusted to stay within your budget limits",
      runHistory: "Run History",
      allRuns: "All runs",
      last30Days: "Last 30 days",
      started: "Started",
      trigger: "Trigger",
      duration: "Duration",
      seen: "Seen",
      new: "New",
      removed: "Removed",
      statusCol: "Status",
      manual: "Manual",
      scheduled: "Scheduled",
      success: "Success",
      failed: "Failed",
      running: "Running",
      queued: "Queued",
      completedSuccessfully: "Completed successfully",
      never: "Never",
    },
    currency: {
      sek: "SEK",
      usd: "USD",
    },
    ads: {
      testModeBanner: "Internal Meta test mode active",
      testModeBannerDescription: "Publishing uses Project Auto ad account. This is for internal testing only.",
      previewTitle: "Preview Ads",
      previewDescription: "Review what will be published before proceeding",
      previewAds: "Preview Ads",
      proceedToPublish: "Proceed to Publish",
      qaGateFailing: "Quality gate failing",
      qaGateFailingHint: "Check Scrape QA panel or inventory quality before proceeding.",
      itemsToPublish: "Items to be published",
      noItemsToPublish: "No items found to publish",
      publishBlocked: "Publish blocked",
      price: "Price",
      destinationUrl: "Destination URL",
      viewItem: "View Item",
      verifyMetaAccessCta: "Verify Meta access in Settings",
    },
    settings: {
      meta: {
        step1Optional: "Step 1 (optional)",
        step2SelectAdAccount: "Step 2",
        step3GrantPartnerAccess: "Step 3",
        grantPartnerAccessTitle: "Grant Partner Access",
        connectMeta: "Connect Meta",
        selectAdAccount: "Select ad account",
        grantPartnerInstructions: "Add {partnerName} as a partner to your Meta Business Manager and grant access to the selected ad account. Then click Verify.",
        openMetaBusinessSettings: "Open Meta Business Settings",
        verifyAccess: "Verify",
        checking: "Checking…",
        statusPending: "Pending",
        statusVerified: "Verified",
        statusFailed: "Failed",
        partnerAccessVerified: "Partner access verified. Ads can be created in your ad account.",
        accessNotGrantedYet: "Access not granted yet.",
        metaNotConfiguredBanner: "Meta not configured for production. Set META_SYSTEM_USER_ACCESS_TOKEN on the server to enable partner verification.",
      },
    },
  },
};
