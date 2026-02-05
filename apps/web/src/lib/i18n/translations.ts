export type Language = "sv" | "en";

export interface Translations {
  common: {
    save: string;
    cancel: string;
    copy: string;
    copied: string;
    loading: string;
    logout: string;
    error: string;
    retry: string;
    tryAgain: string;
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
      metaNotConfiguredForProductionBanner: string;
      step3WhatToDo: string;
      step3AddPartner: string;
      step3GrantAccess: string;
      step3PermissionWording: string;
      partnerNameLabel: string;
      partnerBusinessIdLabel: string;
      copy: string;
      copied: string;
      showFull: string;
    };
  };
  onboarding: {
    title: string;
    step: string;
    back: string;
    continue: string;
    startTitle: string;
    startDescription: string;
    getStarted: string;
    inventoryTitle: string;
    inventoryDescription: string;
    websiteUrl: string;
    runCrawl: string;
    crawlStarting: string;
    itemsDetected: string;
    previewTitle: string;
    previewDescription: string;
    approveTemplate: string;
    metaTitle: string;
    metaDescription: string;
    connectMeta: string;
    selectAdAccount: string;
    verifyAccess: string;
    budgetTitle: string;
    budgetDescription: string;
    contactUs: string;
    requestProposal: string;
    doneTitle: string;
    doneDescription: string;
    goToDashboard: string;
    statusBoxTitle: string;
    readyToActivate: string;
    notReadyYet: string;
    adsTitle: string;
    adsDescription: string;
    adsBudgetLabel: string;
    adsGeoLabel: string;
    adsGeoPlaceholder: string;
    adsGeoHelper: string;
    adsSavedButNotConfirmed: string;
    continueAnyway: string;
    adsRadiusLabel: string;
    adsFormatsLabel: string;
    adsCtaLabel: string;
    saveAndContinue: string;
    saved: string;
    saveFailed: string;
    adsInventoryNote: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    performanceSnapshot: string;
    impressions: string;
    clicks: string;
    ctr: string;
    reach: string;
    creditsRemaining: string;
    creditsUsedMtd: string;
    adsStatus: string;
    lastSync: string;
    lowCreditsRunway: string;
    topUpCta: string;
    scaleSuggestion: string;
    inventoryIncreased: string;
    campaignPausedHint: string;
  };
}

export const translations: Record<Language, Translations> = {
  sv: {
    common: {
      save: "Spara",
      cancel: "Avbryt",
      copy: "Kopiera",
      copied: "Kopierat",
      loading: "Laddar...",
      logout: "Logga ut",
      error: "Fel",
      retry: "Försök igen",
      tryAgain: "Försök igen",
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
        metaNotConfiguredForProductionBanner: "Meta är inte konfigurerad för produktion. Business Manager-id saknas.",
        step3WhatToDo: "Gör så här i Meta Business Manager:",
        step3AddPartner: "Lägg till partner med partnernamnet och Business Manager-id nedan.",
        step3GrantAccess: "Bevilja åtkomst till det valda annonskontot för partnern.",
        step3PermissionWording: "Ge behörighet att hantera annonser och se prestanda (manage ads + view performance).",
        partnerNameLabel: "Partnernamn",
        partnerBusinessIdLabel: "Partner Business Manager-id",
        copy: "Kopiera",
        copied: "Kopierat",
        showFull: "Visa hela",
      },
    },
    onboarding: {
      title: "Kom igång",
      step: "Steg",
      back: "Tillbaka",
      continue: "Fortsätt",
      startTitle: "Välkommen till Project Auto",
      startDescription: "Konfigurera din webbplats, mallar, Meta och budget på några minuter.",
      getStarted: "Kom igång",
      inventoryTitle: "Anslut webbplats och lager",
      inventoryDescription: "Ange webbadressen till din lagerlista och kör en crawl.",
      websiteUrl: "Webbplats-URL",
      runCrawl: "Kör crawl",
      crawlStarting: "Startar…",
      itemsDetected: "Objekt upptäckta",
      previewTitle: "Mall och förhandsgranskning",
      previewDescription: "Välj mall och godkänn förhandsgranskning.",
      approveTemplate: "Godkänn mall",
      metaTitle: "Meta och annonskonto",
      metaDescription: "Anslut Meta, välj annonskonto och verifiera partneråtkomst.",
      connectMeta: "Anslut Meta",
      selectAdAccount: "Välj annonskonto",
      verifyAccess: "Verifiera åtkomst",
      budgetTitle: "Budget och fakturering",
      budgetDescription: "Konfigurera din budget eller begär ett förslag.",
      contactUs: "Kontakta oss",
      requestProposal: "Begär förslag",
      doneTitle: "Klart",
      doneDescription: "Du kan nu använda dashboarden.",
      goToDashboard: "Gå till dashboard",
      statusBoxTitle: "Status",
      readyToActivate: "Redo att aktivera",
      notReadyYet: "Inte redo än",
      adsTitle: "Annonsinställningar",
      adsDescription: "Välj område och format så kan vi skapa kampanjer automatiskt.",
      adsBudgetLabel: "Månadsbudget (SEK)",
      adsGeoLabel: "Plats",
      adsGeoPlaceholder: "t.ex. Stockholm",
      adsGeoHelper: "Vi använder detta som centrum för radien.",
      adsSavedButNotConfirmed: "Inställningarna sparades men kunde inte bekräftas. Försök igen eller gå vidare om allt ser rätt ut.",
      continueAnyway: "Fortsätt ändå",
      adsRadiusLabel: "Radie (km)",
      adsFormatsLabel: "Format",
      adsCtaLabel: "Uppmaning (CTA)",
      saveAndContinue: "Spara och fortsätt",
      saved: "Sparat",
      saveFailed: "Kunde inte spara",
      adsInventoryNote: "Baserat på era {count} bilar i lager",
    },
    dashboard: {
      title: "Dashboard",
      subtitle: "Översikt och status",
      performanceSnapshot: "Prestanda (senaste 7 dagarna)",
      impressions: "Visningar",
      clicks: "Klick",
      ctr: "CTR",
      reach: "Räckvidd",
      creditsRemaining: "Krediter kvar",
      creditsUsedMtd: "Förbrukade denna månad",
      adsStatus: "Annonsstatus",
      lastSync: "Senaste sync",
      lowCreditsRunway: "Låg kreditkvarvarande. Fyll på eller uppgradera.",
      topUpCta: "Fyll på / Billing",
      scaleSuggestion: "Bra prestanda. Överväg att öka budgeten.",
      inventoryIncreased: "Lagerökning upptäckt.",
      campaignPausedHint: "Kampanjen kan vara pausad eller i inlärningsläge.",
    },
  },
  en: {
    common: {
      save: "Save",
      cancel: "Cancel",
      copy: "Copy",
      copied: "Copied",
      loading: "Loading...",
      logout: "Log out",
      error: "Error",
      retry: "Retry",
      tryAgain: "Try again",
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
        metaNotConfiguredForProductionBanner: "Meta not configured for production. Business Manager ID is missing.",
        step3WhatToDo: "In Meta Business Manager, do the following:",
        step3AddPartner: "Add partner using the Partner Name and Partner Business Manager ID below.",
        step3GrantAccess: "Grant access to the selected ad account for the partner.",
        step3PermissionWording: "Grant permission to manage ads and view performance (manage ads + view performance).",
        partnerNameLabel: "Partner name",
        partnerBusinessIdLabel: "Partner Business Manager ID",
        copy: "Copy",
        copied: "Copied",
        showFull: "Show full",
      },
    },
    onboarding: {
      title: "Get started",
      step: "Step",
      back: "Back",
      continue: "Continue",
      startTitle: "Welcome to Project Auto",
      startDescription: "Set up your website, templates, Meta and budget in a few minutes.",
      getStarted: "Get started",
      inventoryTitle: "Connect website and inventory",
      inventoryDescription: "Enter your inventory page URL and run a crawl.",
      websiteUrl: "Website URL",
      runCrawl: "Run crawl",
      crawlStarting: "Starting…",
      itemsDetected: "Items detected",
      previewTitle: "Template and preview",
      previewDescription: "Choose a template and approve the preview.",
      approveTemplate: "Approve template",
      metaTitle: "Meta and ad account",
      metaDescription: "Connect Meta, select ad account and verify partner access.",
      connectMeta: "Connect Meta",
      selectAdAccount: "Select ad account",
      verifyAccess: "Verify access",
      budgetTitle: "Budget and billing",
      budgetDescription: "Set up your budget or request a proposal.",
      contactUs: "Contact us",
      requestProposal: "Request proposal",
      doneTitle: "All set",
      doneDescription: "You can now use the dashboard.",
      goToDashboard: "Go to dashboard",
      statusBoxTitle: "Status",
      readyToActivate: "Ready to activate",
      notReadyYet: "Not ready yet",
      adsTitle: "Ads settings",
      adsDescription: "Choose area and formats so we can create campaigns automatically.",
      adsBudgetLabel: "Monthly budget (SEK)",
      adsGeoLabel: "Location",
      adsGeoPlaceholder: "e.g. Stockholm",
      adsGeoHelper: "Used as the center for your radius.",
      adsSavedButNotConfirmed: "Settings were saved but could not be confirmed. Try again or continue if everything looks correct.",
      continueAnyway: "Continue anyway",
      adsRadiusLabel: "Radius (km)",
      adsFormatsLabel: "Formats",
      adsCtaLabel: "Call-to-action (CTA)",
      saveAndContinue: "Save and continue",
      saved: "Saved",
      saveFailed: "Save failed",
      adsInventoryNote: "Based on your {count} items in inventory",
    },
    dashboard: {
      title: "Dashboard",
      subtitle: "Overview and status",
      performanceSnapshot: "Performance (last 7 days)",
      impressions: "Impressions",
      clicks: "Clicks",
      ctr: "CTR",
      reach: "Reach",
      creditsRemaining: "Credits remaining",
      creditsUsedMtd: "Used this month",
      adsStatus: "Ads status",
      lastSync: "Last sync",
      lowCreditsRunway: "Low credits runway. Top up or upgrade.",
      topUpCta: "Top up / Billing",
      scaleSuggestion: "Strong performance. Consider increasing budget.",
      inventoryIncreased: "Inventory increase detected.",
      campaignPausedHint: "Campaign may be paused or in learning.",
    },
  },
};
