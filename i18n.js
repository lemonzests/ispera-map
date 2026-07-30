(function exposeI18n(globalScope) {
  const messages = {
    it: {
      pageTitle: "ISPERA — Mappa delle opere",
      pageDescription: "Mappa delle opere della mostra diffusa ISPERA a Laconi, Sardegna.",
      skipToList: "Vai all’elenco delle opere",
      hideList: "Nascondi elenco",
      showList: "Mostra elenco",
      homeLabel: "Torna alla homepage ISPERA",
      languageLabel: "Lingua",
      about: "Info",
      closeAbout: "Chiudi informazioni",
      exhibitionKind: "Mostra diffusa",
      aboutTextBefore: "Per informazioni dettagliate sulle opere, visita il nostro sito:",
      privacyNote: "La posizione dell’utente è facoltativa e viene elaborata solo dal browser.",
      mapRegionLabel: "Mappa delle opere",
      mapLabel: "Mappa interattiva delle opere a Laconi",
      loadingMap: "Caricamento mappa…",
      mapUnavailable: "La mappa non è disponibile.",
      mapFallback: "Usa l’elenco per consultare tutte le posizioni.",
      locateLabel: "Mostra la mia posizione",
      locate: "La mia posizione",
      collectionLabel: "Elenco delle opere",
      freePath: "Percorso libero",
      artworks: "Le opere",
      instruction: "Seleziona un’opera per localizzarla sulla mappa.",
      mapData: "Dati cartografici",
      viewLabel: "Vista",
      mapTab: "Mappa",
      listTab: "Elenco",
      walk: "Naviga a piedi",
      openPosition: "Apri posizione",
      share: "Condividi",
      fullDescription: "Descrizione completa",
      linkCopied: "Link copiato",
      shareFailed: "Impossibile condividere",
      locationUnavailable: "Posizione non disponibile",
      locating: "Localizzazione…",
      locationFound: "Posizione trovata",
      mapLibreMissing: "MapLibre non caricato",
      localServerFallback: "Avvia il sito tramite un server locale e usa l’elenco delle posizioni.",
      locationPermission: "Consenti l’accesso alla posizione per visualizzarti sulla mappa e raggiungere le opere."
    },
    en: {
      pageTitle: "ISPERA — Artwork map",
      pageDescription: "Map of the artworks in the ISPERA distributed exhibition in Laconi, Sardinia.",
      skipToList: "Skip to the artwork list",
      hideList: "Hide artwork list",
      showList: "Show artwork list",
      homeLabel: "Return to the ISPERA homepage",
      languageLabel: "Language",
      about: "Info",
      closeAbout: "Close information",
      exhibitionKind: "Distributed exhibition",
      aboutTextBefore: "For detailed information about the artworks, visit our website:",
      privacyNote: "Sharing your location is optional and is processed only by your browser.",
      mapRegionLabel: "Artwork map",
      mapLabel: "Interactive map of the artworks in Laconi",
      loadingMap: "Loading map…",
      mapUnavailable: "The map is unavailable.",
      mapFallback: "Use the list to browse all artwork locations.",
      locateLabel: "Show my location",
      locate: "My location",
      collectionLabel: "Artwork list",
      freePath: "Explore freely",
      artworks: "The artworks",
      instruction: "Select an artwork to locate it on the map.",
      mapData: "Map data",
      viewLabel: "View",
      mapTab: "Map",
      listTab: "List",
      walk: "Walking directions",
      openPosition: "Open location",
      share: "Share",
      fullDescription: "Full description",
      linkCopied: "Link copied",
      shareFailed: "Unable to share",
      locationUnavailable: "Location unavailable",
      locating: "Locating…",
      locationFound: "Location found",
      mapLibreMissing: "MapLibre did not load",
      localServerFallback: "Run the website through a local server and use the location list.",
      locationPermission: "Allow location access to see your position on the map and walk to the artworks."
    }
  };

  const artworkTypes = {
    "Pittura": "Painting",
    "Quadro in legno": "Wooden panel",
    "Fotografia": "Photography",
    "Scultura in fil di ferro": "Wire sculpture",
    "Tessuto": "Textile",
    "Illustrazione digitale": "Digital illustration",
    "Fotografia ricamata": "Embroidered photography",
    "Installazione fotografica": "Photographic installation"
  };

  const params = new URLSearchParams(globalScope.location?.search || "");
  const language = params.get("lang") === "en" ? "en" : "it";

  function t(key) {
    return messages[language][key] || messages.it[key] || key;
  }

  function urlForLanguage(nextLanguage, { home = false } = {}) {
    const url = new URL(globalScope.location?.href || "http://localhost/");
    if (nextLanguage === "en") url.searchParams.set("lang", "en");
    else url.searchParams.delete("lang");
    if (home) url.hash = "";
    return `${url.pathname}${url.search}${url.hash}`;
  }

  function localizeArtworkType(type) {
    return language === "en" ? (artworkTypes[type] || type) : type;
  }

  function applyDocumentTranslations() {
    document.documentElement.lang = language;
    document.title = t("pageTitle");
    const description = document.querySelector('meta[name="description"]');
    if (description) description.content = t("pageDescription");

    document.querySelectorAll("[data-i18n]").forEach((element) => {
      element.textContent = t(element.dataset.i18n);
    });
    document.querySelectorAll("[data-i18n-aria-label]").forEach((element) => {
      element.setAttribute("aria-label", t(element.dataset.i18nAriaLabel));
    });
    document.querySelectorAll("[data-i18n-title]").forEach((element) => {
      element.title = t(element.dataset.i18nTitle);
    });

    document.querySelectorAll("[data-language]").forEach((link) => {
      const linkLanguage = link.dataset.language;
      link.href = urlForLanguage(linkLanguage);
      if (linkLanguage === language) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });

    const homeLink = document.querySelector(".wordmark");
    if (homeLink) homeLink.href = urlForLanguage(language, { home: true });
  }

  const api = { language, t, urlForLanguage, localizeArtworkType, applyDocumentTranslations };
  globalScope.ISPERAI18n = api;
  if (typeof module !== "undefined" && module.exports) module.exports = { messages, artworkTypes, ...api };
})(typeof window !== "undefined" ? window : globalThis);
