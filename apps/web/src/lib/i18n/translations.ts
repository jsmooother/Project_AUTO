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
    pageTitle: string;
    pageSubtitle: string;
    tabStatus: string;
    tabAutomation: string;
    live: string;
    statusActive: string;
    lastSync: string;
    advertisedItems: string;
    metaCampaign: string;
    metaCampaignDescription: string;
    openAdsManager: string;
    syncNow: string;
    runManualSync: string;
    productCatalog: string;
    campaign: string;
    dynamicProductAds: string;
    automaticSync: string;
    enableAutomaticSync: string;
    checkNightly: string;
    nextScheduledRun: string;
    howItWorks: string;
    autoCreateAds: string;
    autoPauseAds: string;
    budgetDistribution: string;
    dailyMonitoring: string;
    currentStatus: string;
    mode: string;
    lastRun: string;
    healthy: string;
    itemsSynced: string;
    alwaysOn: string;
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
    preview: {
      generateCreatives: string;
      generating: string;
      creativesReady: string;
      creativesFailed: string;
      notGeneratedYet: string;
      proceedToPublishDisabledHint: string;
    };
  };
  inventory: {
    includeInAds: string;
    includeAll: string;
    excludeAll: string;
    includeTop10: string;
    selectionSaved: string;
    selectionSaveFailed: string;
  };
  settings: {
    title: string;
    subtitle: string;
    meta: {
      sectionTitle: string;
      sectionDescription: string;
      step1Optional: string;
      step2SelectAdAccount: string;
      step3GrantPartnerAccess: string;
      grantPartnerAccessTitle: string;
      connectMeta: string;
      selectAdAccount: string;
      grantPartnerInstructions: string;
      grantPartnerInstructionsSimplified: string;
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
    discoverLogo: string;
    logoDiscovered: string;
    logoDiscoverFailed: string;
  };
  onboarding: {
    title: string;
    step: string;
    back: string;
    continue: string;
    startTitle: string;
    startDescription: string;
    startReassurance: string;
    tagline: string;
    setupTime: string;
    whatYoullDo: string;
    stepConnectWebsite: string;
    stepConnectWebsiteSub: string;
    stepConnectMeta: string;
    stepConnectMetaSub: string;
    stepLaunchAds: string;
    stepLaunchAdsSub: string;
    companyNameLabel: string;
    companyWebsiteLabel: string;
    companyWebsiteOptional: string;
    companyNamePlaceholder: string;
    companyWebsitePlaceholder: string;
    companyNameHint: string;
    companyWebsiteHint: string;
    nextStep: string;
    trustFooter: string;
    nextUp: string;
    nextUpConnectInventory: string;
    nextUpConnectMeta: string;
    saving: string;
    getStarted: string;
    connectYourWebsite: string;
    connectStepTime: string;
    connectCardTitle: string;
    connectCardSubtitle: string;
    connectPullInventory: string;
    connectCreateAds: string;
    inventoryTitle: string;
    inventoryDescription: string;
    inventoryReassurance: string;
    websiteUrl: string;
    runCrawl: string;
    runCrawlHelper: string;
    crawlStarting: string;
    itemsDetected: string;
    previewTitle: string;
    previewDescription: string;
    previewReassurance: string;
    approveTemplate: string;
    metaTitle: string;
    metaDescription: string;
    metaReassurance: string;
    connectMeta: string;
    selectAdAccount: string;
    verifyAccess: string;
    allowUsToPublish: string;
    budgetTitle: string;
    budgetDescription: string;
    contactUs: string;
    requestProposal: string;
    doneTitle: string;
    doneDescription: string;
    doneReassurance: string;
    goToDashboard: string;
    statusBoxTitle: string;
    readyToActivate: string;
    notReadyYet: string;
    adsTitle: string;
    adsDescription: string;
    adsReassurance: string;
    adsBudgetLabel: string;
    adsGeoLabel: string;
    adsGeoPlaceholder: string;
    adsGeoHelper: string;
    adsSavedButNotConfirmed: string;
    continueAnyway: string;
    adsRadiusLabel: string;
    adsRadiusHelper: string;
    adsFormatsLabel: string;
    adsFormatsHelper: string;
    adsCtaLabel: string;
    adsCtaHelper: string;
    saveAndContinue: string;
    saved: string;
    saveFailed: string;
    adsInventoryNote: string;
    skipNow: string;
    setupTitle: string;
    setupDescription: string;
    setupOptional: string;
    continueToDashboard: string;
    guidesTitle: string;
    guidesIntro: string;
    guideConnectWebsite: string;
    guideConnectMeta: string;
    guideSettings: string;
  };
  dashboard: {
    title: string;
    subtitle: string;
    setupIncomplete: string;
    setupIncompleteHelper: string;
    finishSetup: string;
    systemActive: string;
    systemActiveHelper: string;
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
    noDataYet: string;
    noDataYetHelper: string;
    overview: string;
    automationSummary: string;
    adsRunning: string;
    attentionNeeded: string;
    itemsLabel: string;
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
      pageTitle: "Annonser",
      pageSubtitle: "Din Meta-kampanjstatus och automation",
      tabStatus: "Status",
      tabAutomation: "Automation",
      live: "Live",
      statusActive: "Aktiv",
      lastSync: "Senaste synk",
      advertisedItems: "Annonserade objekt",
      metaCampaign: "Meta-kampanj",
      metaCampaignDescription: "Dina annonsobjekt på Meta",
      openAdsManager: "Öppna Ads Manager",
      syncNow: "Synka nu",
      runManualSync: "Kör manuell synk",
      productCatalog: "Produktkatalog",
      campaign: "Kampanj",
      dynamicProductAds: "Dynamiska produktannonser",
      automaticSync: "Automatisk synkronisering",
      enableAutomaticSync: "Aktivera automatisk synk",
      checkNightly: "Kontrollera nya och borttagna objekt varje natt",
      nextScheduledRun: "Nästa schemalagda körning",
      howItWorks: "Hur det fungerar",
      autoCreateAds: "Skapa annonser automatiskt:",
      autoPauseAds: "Pausa annonser automatiskt:",
      budgetDistribution: "Budgetfördelning:",
      dailyMonitoring: "Daglig övervakning:",
      currentStatus: "Aktuell status",
      mode: "Läge",
      lastRun: "Senaste körning",
      healthy: "Hälsosam",
      itemsSynced: "Synkade objekt",
      alwaysOn: "Alltid på",
      testModeBanner: "Intern Meta-testläge aktiv",
      testModeBannerDescription: "Publicering använder Project Auto annonskonto. Endast för intern testning.",
      previewTitle: "Förhandsgranska annonser",
      previewDescription: "Granska vad som kommer att publiceras innan du fortsätter",
      previewAds: "Förhandsgranska annonser",
      proceedToPublish: "Fortsätt till publicering",
      qaGateFailing: "Kvalitetskontroll misslyckades",
      qaGateFailingHint: "Kontrollera Scrape QA-panelen eller lagerkvalitet innan du fortsätter.",
      itemsToPublish: "Objekt som kommer att publiceras",
      noItemsToPublish: "Inga objekt hittades att publiceras",
      publishBlocked: "Publicering blockerad",
      price: "Pris",
      destinationUrl: "Mål-URL",
      viewItem: "Visa objekt",
      verifyMetaAccessCta: "Tillåt oss att publicera annonser",
      preview: {
        generateCreatives: "Generera kreativ",
        generating: "Genererar...",
        creativesReady: "Kreativ redo",
        creativesFailed: "Kreativ misslyckades",
        notGeneratedYet: "Inte genererad än",
        proceedToPublishDisabledHint: "Generera kreativ först",
      },
    },
    inventory: {
      includeInAds: "Inkludera i annonser",
      includeAll: "Inkludera alla",
      excludeAll: "Exkludera alla",
      includeTop10: "Inkludera 10 nyaste",
      selectionSaved: "Val sparade",
      selectionSaveFailed: "Kunde inte spara val",
    },
    settings: {
      title: "Inställningar",
      subtitle: "Hantera ditt konto och anslutningar",
      meta: {
        sectionTitle: "Meta-anslutning",
        sectionDescription: "Facebook & Instagram Ads",
        step1Optional: "Steg 1 (valfritt)",
        step2SelectAdAccount: "Steg 2",
        step3GrantPartnerAccess: "Steg 3",
        grantPartnerAccessTitle: "Tillåt oss att publicera annonser",
        connectMeta: "Anslut Meta",
        selectAdAccount: "Välj annonskonto",
        grantPartnerInstructions: "Lägg till {partnerName} som partner i din Meta Business Manager och ge åtkomst till det valda annonskontot. Klicka sedan på Verifiera.",
        grantPartnerInstructionsSimplified: "För att vi ska kunna skapa annonser åt dig måste du ge oss tillgång i Meta Business Manager. Kopiera informationen nedan och följ instruktionerna.",
        openMetaBusinessSettings: "Öppna Meta Business-inställningar",
        verifyAccess: "Verifiera",
        checking: "Kontrollerar…",
        statusPending: "Väntar",
        statusVerified: "Verifierad",
        statusFailed: "Misslyckad",
        partnerAccessVerified: "Klart! Vi kan nu skapa annonser i ditt annonskonto.",
        accessNotGrantedYet: "Åtkomst inte beviljad än. Följ stegen ovan.",
        metaNotConfiguredBanner: "Meta är inte konfigurerad för produktion. Sätt META_SYSTEM_USER_ACCESS_TOKEN på servern för att aktivera partnerverifiering.",
        metaNotConfiguredForProductionBanner: "Meta är inte konfigurerad för produktion. Business Manager-id saknas.",
        step3WhatToDo: "Gör så här i Meta Business Manager:",
        step3AddPartner: "Lägg till partner med partnernamnet och Business Manager-id nedan.",
        step3GrantAccess: "Ge tillgång till det valda annonskontot för partnern.",
        step3PermissionWording: "Ge behörighet att hantera annonser (manage ads).",
        partnerNameLabel: "Partnernamn",
        partnerBusinessIdLabel: "Partner Business Manager-id",
        copy: "Kopiera",
        copied: "Kopierat",
        showFull: "Visa hela",
      },
      discoverLogo: "Upptäck logotyp",
      logoDiscovered: "Logotyp upptäckt och sparad",
      logoDiscoverFailed: "Kunde inte upptäcka logotyp",
    },
    onboarding: {
      title: "Kom igång",
      step: "Steg",
      back: "Tillbaka",
      continue: "Fortsätt",
      startTitle: "Välkommen till Agentic Ads",
      startDescription: "Vi hjälper dig att automatisera annonser för din annonsinventar. Installationen tar cirka 5 minuter.",
      startReassurance: "Inga annonser publiceras förrän du godkänner det.",
      tagline: "Smarter ads. Zero busywork.",
      setupTime: "Cirka 5 minuter",
      whatYoullDo: "Så här går det till:",
      stepConnectWebsite: "Anslut webbplats",
      stepConnectWebsiteSub: "URL till din inventar",
      stepConnectMeta: "Anslut Meta",
      stepConnectMetaSub: "Facebook & Instagram",
      stepLaunchAds: "Starta annonser",
      stepLaunchAdsSub: "Budget och automation",
      companyNameLabel: "Företagsnamn",
      companyWebsiteLabel: "Webbplats",
      companyWebsiteOptional: "(valfritt)",
      companyNamePlaceholder: "Acme Bil AB",
      companyWebsitePlaceholder: "https://mittforetag.se",
      companyNameHint: "Namnet på ditt företag eller varumärke",
      companyWebsiteHint: "Din huvudsakliga webbplats (behöver inte vara lagersidan)",
      nextStep: "Nästa steg",
      trustFooter: "Säker & privat. Vi skyddar dina data enligt GDPR.",
      nextUp: "Nästa:",
      nextUpConnectInventory: "Anslut din lagersida",
      nextUpConnectMeta: "Anslut Meta-konto för publicering",
      saving: "Sparar...",
      getStarted: "Kom igång",
      connectYourWebsite: "Anslut din webbplats",
      connectStepTime: "Steg 2 av 3 • cirka 2 min",
      connectCardTitle: "Anslut din webbplats",
      connectCardSubtitle: "Vi hämtar automatiskt din inventar. Anslut webbplatsen så skapar vi annonser för alla dina produkter.",
      connectPullInventory: "Vi hämtar automatiskt din inventar",
      connectCreateAds: "Anslut webbplatsen så skapar vi annonser för alla dina produkter.",
      inventoryTitle: "Anslut ditt lager",
      inventoryDescription: "Ange webbadressen till din lagersida så hämtar vi automatiskt din inventar.",
      inventoryReassurance: "Vi hämtar endast produktinformation – inga annonser skapas ännu.",
      websiteUrl: "Webbplats-URL",
      runCrawl: "Hämta inventar",
      runCrawlHelper: "Klicka här för att söka efter inventar på din webbplats",
      crawlStarting: "Hämtar…",
      itemsDetected: "objekt hittade",
      previewTitle: "Välj hur dina annonser ska se ut",
      previewDescription: "Välj en annonsdesign och förhandsgranska hur den kommer att se ut.",
      previewReassurance: "Du kan ändra design när som helst – ingenting publiceras ännu.",
      approveTemplate: "Godkänn design",
      metaTitle: "Anslut till Facebook/Instagram",
      metaDescription: "För att publicera annonser behöver vi tillgång till ditt Facebook/Instagram-annonskonto.",
      metaReassurance: "Vi kan bara publicera annonser – vi kan aldrig se eller använda dina betaluppgifter.",
      connectMeta: "Anslut Facebook/Instagram",
      selectAdAccount: "Välj annonskonto",
      verifyAccess: "Ge oss tillgång",
      allowUsToPublish: "Tillåt oss att publicera annonser",
      budgetTitle: "Sätt din budget",
      budgetDescription: "Välj hur mycket du vill spendera på annonser varje månad.",
      contactUs: "Kontakta oss",
      requestProposal: "Begär förslag",
      doneTitle: "Klart! Allt är redo",
      doneDescription: "Din annonsautomation är nu konfigurerad. Vi börjar arbeta när du aktiverar den.",
      doneReassurance: "Alla annonser skapas pausade tills du väljer att aktivera dem.",
      goToDashboard: "Visa översikt",
      statusBoxTitle: "Status",
      readyToActivate: "Redo att aktivera",
      notReadyYet: "Inte redo än",
      adsTitle: "Var ska annonserna visas?",
      adsDescription: "Välj område och format så skapar vi automatiskt annonser för varje objekt i inventariet.",
      adsReassurance: "Alla annonser skapas pausade – du bestämmer när de ska börja köras.",
      adsBudgetLabel: "Månatlig budget (SEK, valfritt)",
      adsGeoLabel: "Vilket område ska vi rikta oss till?",
      adsGeoPlaceholder: "t.ex. Stockholm, Göteborg, Malmö",
      adsGeoHelper: "Vi visar annonser för personer i och runt denna plats.",
      adsSavedButNotConfirmed: "Inställningarna sparades men kunde inte bekräftas. Försök igen eller gå vidare om allt ser rätt ut.",
      continueAnyway: "Fortsätt ändå",
      adsRadiusLabel: "Hur stor radie?",
      adsRadiusHelper: "Hur långt från platsen ska vi visa annonser?",
      adsFormatsLabel: "Var ska annonserna visas?",
      adsFormatsHelper: "Välj en eller flera",
      adsCtaLabel: "Vad ska knappen säga?",
      adsCtaHelper: "Den knapp som visas i annonsen",
      saveAndContinue: "Spara och fortsätt",
      saved: "Sparat",
      saveFailed: "Kunde inte spara",
      adsInventoryNote: "Vi hittar annonsinställningar för era {count} objekt",
      skipNow: "Hoppa över",
      setupTitle: "Anslut när du vill",
      setupDescription: "Du kan ansluta din webbplats och Facebook/Instagram nu eller senare från Inställningar. Vi har guider som visar hur allt fungerar.",
      setupOptional: "Allt nedan är valfritt – du kan hoppa över och utforska översikten och guiderna direkt.",
      continueToDashboard: "Gå till översikt",
      guidesTitle: "Så hjälper vi dig",
      guidesIntro: "Utforska översikten och använd guiderna nedan när du är redo att sätta upp allt.",
      guideConnectWebsite: "Anslut webbplats – Vi hämtar din inventar automatiskt från din lagersida.",
      guideConnectMeta: "Anslut Facebook/Instagram – Krävs för att publicera annonser. Du kan göra det när du har tillgång.",
      guideSettings: "Inställningar – Här ansluter du webbplats, Meta-konto och ser dina preferenser.",
    },
    dashboard: {
      title: "Översikt",
      subtitle: "Din annonsautomation i ett ögonkast",
      setupIncomplete: "Installation inte klar",
      setupIncompleteHelper: "Slutför installationen för att börja automatisera annonser",
      finishSetup: "Slutför installation",
      systemActive: "Systemet är aktivt",
      systemActiveHelper: "Annonser uppdateras automatiskt varje natt",
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
      scaleSuggestion: "Bra prestanda! Överväg att öka budgeten för att nå fler kunder.",
      inventoryIncreased: "Ny inventar upptäckt i lagret.",
      campaignPausedHint: "Dina kampanjer kan vara pausade. Aktivera dem i Annonser.",
      noDataYet: "Inga data än",
      noDataYetHelper: "Data visas när dina annonser börjar köras. Detta kan ta 24-48 timmar efter aktivering.",
      overview: "Översikt",
      automationSummary: "Din automationssammanfattning",
      adsRunning: "Annonser körs",
      attentionNeeded: "Uppmärksamhet behövs",
      itemsLabel: "objekt",
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
      pageTitle: "Ads",
      pageSubtitle: "Your Meta campaign status and automation",
      tabStatus: "Status",
      tabAutomation: "Automation",
      live: "Live",
      statusActive: "Active",
      lastSync: "Last sync",
      advertisedItems: "Advertised items",
      metaCampaign: "Meta campaign",
      metaCampaignDescription: "Your ad objects on Meta",
      openAdsManager: "Open Ads Manager",
      syncNow: "Sync now",
      runManualSync: "Run manual sync",
      productCatalog: "Product Catalog",
      campaign: "Campaign",
      dynamicProductAds: "Dynamic Product Ads",
      automaticSync: "Automatic sync",
      enableAutomaticSync: "Enable automatic sync",
      checkNightly: "Check for new and removed items nightly",
      nextScheduledRun: "Next scheduled run",
      howItWorks: "How it works",
      autoCreateAds: "Auto-create ads:",
      autoPauseAds: "Auto-pause ads:",
      budgetDistribution: "Budget distribution:",
      dailyMonitoring: "Daily monitoring:",
      currentStatus: "Current status",
      mode: "Mode",
      lastRun: "Last run",
      healthy: "Healthy",
      itemsSynced: "Items synced",
      alwaysOn: "Always On",
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
      verifyMetaAccessCta: "Allow us to publish ads",
      preview: {
        generateCreatives: "Generate Creatives",
        generating: "Generating...",
        creativesReady: "Creatives Ready",
        creativesFailed: "Creatives Failed",
        notGeneratedYet: "Not Generated Yet",
        proceedToPublishDisabledHint: "Generate creatives first",
      },
    },
    inventory: {
      includeInAds: "Include in ads",
      includeAll: "Include All",
      excludeAll: "Exclude All",
      includeTop10: "Include Top 10 Newest",
      selectionSaved: "Selection saved",
      selectionSaveFailed: "Failed to save selection",
    },
    settings: {
      title: "Settings",
      subtitle: "Manage your account and connections",
      meta: {
        sectionTitle: "Meta connection",
        sectionDescription: "Facebook & Instagram Ads",
        step1Optional: "Step 1 (optional)",
        step2SelectAdAccount: "Step 2",
        step3GrantPartnerAccess: "Step 3",
        grantPartnerAccessTitle: "Allow us to publish ads",
        connectMeta: "Connect Meta",
        selectAdAccount: "Select ad account",
        grantPartnerInstructions: "Add {partnerName} as a partner to your Meta Business Manager and grant access to the selected ad account. Then click Verify.",
        grantPartnerInstructionsSimplified: "To create ads for you, we need access in Meta Business Manager. Copy the information below and follow the instructions.",
        openMetaBusinessSettings: "Open Meta Business Settings",
        verifyAccess: "Verify",
        checking: "Checking…",
        statusPending: "Pending",
        statusVerified: "Verified",
        statusFailed: "Failed",
        partnerAccessVerified: "All set! We can now create ads in your ad account.",
        accessNotGrantedYet: "Access not granted yet. Follow the steps above.",
        metaNotConfiguredBanner: "Meta not configured for production. Set META_SYSTEM_USER_ACCESS_TOKEN on the server to enable partner verification.",
        metaNotConfiguredForProductionBanner: "Meta not configured for production. Business Manager ID is missing.",
        step3WhatToDo: "In Meta Business Manager, do the following:",
        step3AddPartner: "Add partner using the Partner Name and Partner Business Manager ID below.",
        step3GrantAccess: "Grant access to the selected ad account for the partner.",
        step3PermissionWording: "Grant permission to manage ads (manage ads).",
        partnerNameLabel: "Partner name",
        partnerBusinessIdLabel: "Partner Business Manager ID",
        copy: "Copy",
        copied: "Copied",
        showFull: "Show full",
      },
      discoverLogo: "Discover Logo",
      logoDiscovered: "Logo discovered and saved",
      logoDiscoverFailed: "Failed to discover logo",
    },
    onboarding: {
      title: "Get started",
      step: "Step",
      back: "Back",
      continue: "Continue",
      startTitle: "Welcome to Agentic Ads",
      startDescription: "We'll help you automate ads for your ad inventory. Setup takes about 5 minutes.",
      startReassurance: "No ads will be published until you approve them.",
      tagline: "Smarter ads. Zero busywork.",
      setupTime: "Set up in about 5 minutes",
      whatYoullDo: "What you'll do:",
      stepConnectWebsite: "Connect website",
      stepConnectWebsiteSub: "URL to your inventory",
      stepConnectMeta: "Connect Meta",
      stepConnectMetaSub: "Facebook & Instagram",
      stepLaunchAds: "Launch ads",
      stepLaunchAdsSub: "Budget & automation",
      companyNameLabel: "Company name",
      companyWebsiteLabel: "Website",
      companyWebsiteOptional: "(optional)",
      companyNamePlaceholder: "Acme Auto Ltd",
      companyWebsitePlaceholder: "https://acmeauto.com",
      companyNameHint: "The name of your business or brand",
      companyWebsiteHint: "Your main website (not necessarily where inventory is)",
      nextStep: "Next step",
      trustFooter: "Secure & private. We protect your data according to GDPR.",
      nextUp: "Next up:",
      nextUpConnectInventory: "Connect your inventory page",
      nextUpConnectMeta: "Connect Meta account for publishing",
      saving: "Saving...",
      getStarted: "Get started",
      connectYourWebsite: "Connect your website",
      connectStepTime: "Step 2 of 3 • ~2 minutes",
      connectCardTitle: "Connect your website",
      connectCardSubtitle: "We automatically pull your inventory. Connect your website and we'll create ads for all your products.",
      connectPullInventory: "We automatically pull your inventory",
      connectCreateAds: "Connect your website and we'll create ads for all your products.",
      inventoryTitle: "Connect your inventory",
      inventoryDescription: "Enter the URL to your inventory page and we'll automatically fetch your items.",
      inventoryReassurance: "We only fetch product information – no ads are created yet.",
      websiteUrl: "Website URL",
      runCrawl: "Fetch inventory",
      runCrawlHelper: "Click here to search for inventory on your website",
      crawlStarting: "Fetching…",
      itemsDetected: "items found",
      previewTitle: "Choose how your ads will look",
      previewDescription: "Select an ad design and preview how it will appear.",
      previewReassurance: "You can change the design anytime – nothing is published yet.",
      approveTemplate: "Approve design",
      metaTitle: "Connect to Facebook/Instagram",
      metaDescription: "To publish ads, we need access to your Facebook/Instagram ad account.",
      metaReassurance: "We can only publish ads – we can never see or use your payment details.",
      connectMeta: "Connect Facebook/Instagram",
      selectAdAccount: "Select ad account",
      verifyAccess: "Grant us access",
      allowUsToPublish: "Allow us to publish ads",
      budgetTitle: "Set your budget",
      budgetDescription: "Choose how much you want to spend on ads each month.",
      contactUs: "Contact us",
      requestProposal: "Request proposal",
      doneTitle: "All set! You're ready to go",
      doneDescription: "Your ad automation is now configured. We'll start working when you activate it.",
      doneReassurance: "All ads are created paused until you choose to activate them.",
      goToDashboard: "View dashboard",
      statusBoxTitle: "Status",
      readyToActivate: "Ready to activate",
      notReadyYet: "Not ready yet",
      adsTitle: "Where should ads appear?",
      adsDescription: "Choose area and formats, and we'll automatically create ads for each inventory item.",
      adsReassurance: "All ads are created paused – you decide when they should start running.",
      adsBudgetLabel: "Monthly budget (SEK, optional)",
      adsGeoLabel: "Which area should we target?",
      adsGeoPlaceholder: "e.g. Stockholm, Gothenburg, Malmö",
      adsGeoHelper: "We'll show ads to people in and around this location.",
      adsSavedButNotConfirmed: "Settings were saved but could not be confirmed. Try again or continue if everything looks correct.",
      continueAnyway: "Continue anyway",
      adsRadiusLabel: "How large radius?",
      adsRadiusHelper: "How far from the location should we show ads?",
      adsFormatsLabel: "Where should ads appear?",
      adsFormatsHelper: "Choose one or more",
      adsCtaLabel: "What should the button say?",
      adsCtaHelper: "The button shown in the ad",
      saveAndContinue: "Save and continue",
      saved: "Saved",
      saveFailed: "Save failed",
      adsInventoryNote: "We'll set up ads for your {count} items",
      skipNow: "Skip for now",
      setupTitle: "Connect when you're ready",
      setupDescription: "You can connect your website and Facebook/Instagram now or later from Settings. We have guides that show how everything works.",
      setupOptional: "Everything below is optional – you can skip and explore the dashboard and guides right away.",
      continueToDashboard: "Go to dashboard",
      guidesTitle: "How we help you",
      guidesIntro: "Explore the dashboard and use the guides below when you're ready to set everything up.",
      guideConnectWebsite: "Connect website – We fetch your inventory automatically from your listing page.",
      guideConnectMeta: "Connect Facebook/Instagram – Required to publish ads. You can do it when you have access.",
      guideSettings: "Settings – Here you connect your website, Meta account, and manage your preferences.",
    },
    dashboard: {
      title: "Dashboard",
      subtitle: "Your ad automation at a glance",
      setupIncomplete: "Setup incomplete",
      setupIncompleteHelper: "Finish setup to start automating ads",
      finishSetup: "Finish setup",
      systemActive: "System is active",
      systemActiveHelper: "Ads are automatically updated every night",
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
      scaleSuggestion: "Strong performance! Consider increasing budget to reach more customers.",
      inventoryIncreased: "New items detected in inventory.",
      campaignPausedHint: "Your campaigns may be paused. Activate them in Ads.",
      noDataYet: "No data yet",
      noDataYetHelper: "Data will appear when your ads start running. This can take 24-48 hours after activation.",
      overview: "Overview",
      automationSummary: "Your automation summary",
      adsRunning: "Ads Running",
      attentionNeeded: "Attention needed",
      itemsLabel: "items",
    },
  },
};
