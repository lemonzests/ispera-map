const CONFIG = {
  dataUrl: "data/artworks.geojson?v=20260730-12",
  mapStyle: "https://tiles.openfreemap.org/styles/liberty",
  initialCenter: [9.05312, 39.85385],
  initialZoom: 16.3
};

const state = { map: null, artworks: [], markers: new Map(), userMarker: null, popup: null, selectedId: null, locationPromptAccepted: false };
const list = document.querySelector("#artwork-list");
const template = document.querySelector("#artwork-template");
const mapStatus = document.querySelector("#map-status");
const mapError = document.querySelector("#map-error");
const { directionsUrl, LOCATION_PERMISSION_MESSAGE } = window.ISPERANavigation;
const { t, localizeArtworkType, applyDocumentTranslations } = window.ISPERAI18n;
const MARKER_OFFSETS = {
  "artwork-1": [-22, -6],
  "artwork-2": [22, -6],
  "artwork-3": [-20, -10],
  "artwork-4": [-36, -8],
  "artwork-5": [20, -10],
  "artwork-6": [-4, -26],
  "artwork-9": [-22, -24],
  "artwork-10": [22, -24],
  "artwork-12": [16, -14],
  "artwork-13": [-16, 14]
};
const CLOSE_ZOOM_OFFSETS = {
  "artwork-1": [-14, -4],
  "artwork-2": [14, -4],
  "artwork-3": [-12, -6],
  "artwork-4": [-32, -8],
  "artwork-5": [12, -6],
  "artwork-6": [-10, -24],
  "artwork-9": [8, -10],
  "artwork-10": [34, -18],
  "artwork-12": [0, 0],
  "artwork-13": [0, 0]
};

function markerOffsetAtZoom(id, baseOffset) {
  const closeOffset = CLOSE_ZOOM_OFFSETS[id];
  if (!closeOffset || !state.map) return baseOffset;
  const progress = Math.max(0, Math.min(1, (state.map.getZoom() - 17.2) / 0.8));
  return baseOffset.map((value, axis) => Math.round(value + (closeOffset[axis] - value) * progress));
}

function updateMarkerOffsets() {
  state.markers.forEach((entry, id) => {
    entry.currentOffset = markerOffsetAtZoom(id, entry.baseOffset);
    entry.marker.setOffset(entry.currentOffset);
  });
}

function createMarkerPin(feature) {
  const markerButton = document.createElement("button");
  markerButton.className = "ispera-marker";
  markerButton.type = "button";
  markerButton.setAttribute("aria-label", feature.properties.title);
  markerButton.innerHTML = '<svg class="marker-pin" viewBox="0 0 28 36" aria-hidden="true"><path class="marker-shape" d="M14 1C6.8 1 2 6.2 2 12.6 2 21.1 14 35 14 35s12-13.9 12-22.4C26 6.2 21.2 1 14 1Z"/><circle class="marker-center" cx="14" cy="12.5" r="4"/></svg>';
  return markerButton;
}

function mapUrl(feature) {
  if (!feature.geometry) return "";
  const [lon, lat] = feature.geometry.coordinates;
  return `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=19/${lat}/${lon}`;
}

function renderList() {
  list.replaceChildren();
  state.artworks.forEach((feature) => {
    const fragment = template.content.cloneNode(true);
    const item = fragment.querySelector("li");
    const button = fragment.querySelector(".artwork-card");
    const share = fragment.querySelector(".share-button");
    const p = feature.properties;

    item.id = feature.id;
    button.dataset.id = feature.id;
    button.setAttribute("aria-expanded", "false");
    button.setAttribute("aria-controls", `${feature.id}-detail`);
    fragment.querySelector(".artwork-detail").id = `${feature.id}-detail`;
    fragment.querySelector(".artwork-title").textContent = p.title;
    fragment.querySelector(".artwork-artist").textContent = p.artist;
    const type = fragment.querySelector(".artwork-type");
    if (p.artworkType) type.textContent = localizeArtworkType(p.artworkType);
    else type.hidden = true;
    fragment.querySelector(".artwork-address").textContent = p.address;
    const detailsLink = fragment.querySelector(".details-link");
    if (p.detailsUrl) {
      detailsLink.href = p.detailsUrl;
      detailsLink.hidden = false;
    }
    const mapLink = fragment.querySelector(".map-link");
    if (feature.geometry) mapLink.href = mapUrl(feature);
    else mapLink.hidden = true;
    const navigateLink = fragment.querySelector(".navigate-link");
    if (feature.geometry) navigateLink.href = directionsUrl(feature);
    else navigateLink.hidden = true;
    navigateLink.textContent = t("walk");
    mapLink.textContent = t("openPosition");
    share.textContent = t("share");

    button.addEventListener("click", () => selectArtwork(feature.id, true));
    share.addEventListener("click", () => shareArtwork(feature));
    list.append(fragment);
  });
}

function addMarkers() {
  const locatedArtworks = state.artworks.filter((feature) => feature.geometry);
  const locationGroups = new Map();
  locatedArtworks.forEach((feature) => {
    const key = feature.geometry.coordinates.join(",");
    if (!locationGroups.has(key)) locationGroups.set(key, []);
    locationGroups.get(key).push(feature);
  });

  locatedArtworks.forEach((feature) => {
    const markerButton = createMarkerPin(feature);
    markerButton.addEventListener("click", (event) => {
      event.stopPropagation();
      selectArtwork(feature.id, true);
    });

    const siblings = locationGroups.get(feature.geometry.coordinates.join(","));
    const siblingIndex = siblings.indexOf(feature);
    const angle = -Math.PI / 2 + (2 * Math.PI * siblingIndex) / siblings.length;
    const radius = siblings.length > 1 ? 24 : 0;
    const offset = MARKER_OFFSETS[feature.id] || [Math.round(Math.cos(angle) * radius), Math.round(Math.sin(angle) * radius)];
    const marker = new maplibregl.Marker({ element: markerButton, anchor: "bottom", offset })
      .setLngLat(feature.geometry.coordinates)
      .addTo(state.map);
    state.markers.set(feature.id, { marker, element: markerButton, baseOffset: offset, currentOffset: offset });
  });

  const bounds = new maplibregl.LngLatBounds();
  locatedArtworks.forEach((feature) => bounds.extend(feature.geometry.coordinates));
  state.map.fitBounds(bounds, { padding: { top: 70, right: 70, bottom: 90, left: 70 }, maxZoom: 17.2, duration: 0 });
  updateMarkerOffsets();
  state.map.on("zoom", updateMarkerOffsets);
}

function selectArtwork(id, moveMap = false) {
  const feature = state.artworks.find((item) => item.id === id);
  if (!feature) return;
  state.selectedId = id;
  if (state.popup) {
    state.popup.remove();
    state.popup = null;
  }

  document.querySelectorAll(".artwork-item").forEach((item) => {
    const selected = item.id === id;
    item.querySelector(".artwork-card").setAttribute("aria-expanded", String(selected));
    item.querySelector(".artwork-detail").hidden = !selected;
  });
  state.markers.forEach((entry, markerId) => entry.element.classList.toggle("is-active", markerId === id));
  history.replaceState(null, "", `#${id}`);

  if (state.map && moveMap) {
    if (!feature.geometry) {
      if (innerWidth <= 720) setView("list");
      return;
    }
    state.map.jumpTo({ center: feature.geometry.coordinates, zoom: 18 });
    updateMarkerOffsets();
    const popupCard = document.createElement("div");
    popupCard.className = "popup-card";
    const title = document.createElement("strong");
    title.textContent = feature.properties.title;
    const artist = document.createElement("span");
    artist.className = "popup-artist";
    artist.textContent = feature.properties.artist;
    popupCard.append(title, artist);
    const popupMeta = document.createElement("div");
    popupMeta.className = "popup-meta";
    if (feature.properties.artworkType) {
      const type = document.createElement("span");
      type.className = "popup-type";
      type.textContent = localizeArtworkType(feature.properties.artworkType);
      popupMeta.append(type);
    }
    const popupShare = document.createElement("button");
    popupShare.className = "popup-share";
    popupShare.type = "button";
    popupShare.title = t("share");
    popupShare.setAttribute("aria-label", `${t("share")} ${feature.properties.title}`);
    popupShare.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="18" cy="5" r="2.5"></circle><circle cx="6" cy="12" r="2.5"></circle><circle cx="18" cy="19" r="2.5"></circle><path d="M8.2 10.8 15.8 6.3M8.2 13.2l7.6 4.5"></path></svg>';
    popupShare.addEventListener("click", (event) => {
      event.stopPropagation();
      shareArtwork(feature, popupShare);
    });
    popupMeta.append(popupShare);
    popupCard.append(popupMeta);
    const navigate = document.createElement("a");
    navigate.className = "popup-navigate";
    navigate.href = directionsUrl(feature);
    navigate.target = "_blank";
    navigate.rel = "noopener noreferrer";
    navigate.textContent = `${t("walk")} ↗`;
    popupCard.append(navigate);
    if (feature.properties.detailsUrl) {
      const details = document.createElement("a");
      details.className = "popup-details";
      details.href = feature.properties.detailsUrl;
      details.target = "_blank";
      details.rel = "noopener noreferrer";
      details.textContent = `${t("fullDescription")} ↗`;
      popupCard.append(details);
    }
    const markerOffset = state.markers.get(id)?.currentOffset || [0, 0];
    const popupOffset = [markerOffset[0], markerOffset[1] - 48];
    state.popup = new maplibregl.Popup({ anchor: "bottom", offset: popupOffset, closeButton: true, focusAfterOpen: false })
      .setLngLat(feature.geometry.coordinates)
      .setDOMContent(popupCard)
      .addTo(state.map);
  }

  if (innerWidth <= 720 && moveMap) setView("map");
}

async function shareArtwork(feature, triggerButton = null) {
  const url = `${location.href.split("#")[0]}#${feature.id}`;
  try {
    if (navigator.share) await navigator.share({ title: `ISPERA — ${feature.properties.title}`, url });
    else {
      await navigator.clipboard.writeText(url);
      const button = triggerButton || document.querySelector(`#${feature.id} .share-button`);
      if (button.classList.contains("popup-share")) {
        const prior = button.innerHTML;
        button.textContent = "✓";
        button.setAttribute("aria-label", t("linkCopied"));
        setTimeout(() => {
          button.innerHTML = prior;
          button.setAttribute("aria-label", `${t("share")} ${feature.properties.title}`);
        }, 1600);
      } else {
        const prior = button.textContent;
        button.textContent = t("linkCopied");
        setTimeout(() => { button.textContent = prior; }, 1600);
      }
    }
  } catch (error) {
    if (error.name !== "AbortError") console.warn(t("shareFailed"), error);
  }
}

function setView(view) {
  document.body.dataset.view = view;
  document.querySelectorAll("[data-view]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.view === view)));
  if (view === "map" && state.map) setTimeout(() => state.map.resize(), 20);
}

function setupInterface() {
  document.querySelectorAll("[data-view]").forEach((button) => button.addEventListener("click", () => setView(button.dataset.view)));
  const listToggle = document.querySelector("#list-toggle");
  listToggle.addEventListener("click", () => {
    const expanded = listToggle.getAttribute("aria-expanded") === "true";
    const nextExpanded = !expanded;
    document.body.dataset.listCollapsed = String(!nextExpanded);
    listToggle.setAttribute("aria-expanded", String(nextExpanded));
    listToggle.setAttribute("aria-label", nextExpanded ? t("hideList") : t("showList"));
    listToggle.title = nextExpanded ? t("hideList") : t("showList");
    if (state.map) requestAnimationFrame(() => state.map.resize());
  });
  const aboutButton = document.querySelector("#about-button");
  const aboutPanel = document.querySelector("#about-panel");
  const closeAbout = () => { aboutPanel.hidden = true; aboutButton.setAttribute("aria-expanded", "false"); aboutButton.focus(); };
  aboutButton.addEventListener("click", () => { const willOpen = aboutPanel.hidden; aboutPanel.hidden = !willOpen; aboutButton.setAttribute("aria-expanded", String(willOpen)); if (willOpen) document.querySelector("#about-close").focus(); });
  document.querySelector("#about-close").addEventListener("click", closeAbout);
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !aboutPanel.hidden) closeAbout(); });
  document.querySelector("#locate-button").addEventListener("click", locateUser);
}

function locateUser() {
  const button = document.querySelector("#locate-button");
  if (!navigator.geolocation) { button.textContent = t("locationUnavailable"); return; }
  if (!state.locationPromptAccepted) {
    if (!window.confirm(LOCATION_PERMISSION_MESSAGE)) return;
    state.locationPromptAccepted = true;
  }
  button.disabled = true;
  button.textContent = t("locating");
  navigator.geolocation.getCurrentPosition(({ coords }) => {
    if (state.userMarker) state.userMarker.remove();
    const dot = document.createElement("div");
    dot.className = "user-marker";
    state.userMarker = new maplibregl.Marker({ element: dot }).setLngLat([coords.longitude, coords.latitude]).addTo(state.map);
    state.map.flyTo({ center: [coords.longitude, coords.latitude], zoom: 17 });
    button.disabled = false;
    button.innerHTML = `<span aria-hidden="true">◎</span> ${t("locationFound")}`;
  }, () => {
    button.disabled = false;
    button.textContent = t("locationUnavailable");
  }, { enableHighAccuracy: true, timeout: 9000, maximumAge: 60000 });
}

async function init() {
  applyDocumentTranslations();
  setupInterface();
  try {
    const response = await fetch(CONFIG.dataUrl);
    if (!response.ok) throw new Error(`Artwork data: HTTP ${response.status}`);
    const geojson = await response.json();
    state.artworks = geojson.features;
    renderList();

    if (!window.maplibregl) throw new Error(t("mapLibreMissing"));
    state.map = new maplibregl.Map({ container: "map", style: CONFIG.mapStyle, center: CONFIG.initialCenter, zoom: CONFIG.initialZoom, attributionControl: true });
    state.map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");
    state.map.once("load", () => {
      mapStatus.hidden = true;
      addMarkers();
      const requested = location.hash.slice(1);
      if (requested) selectArtwork(requested, true);
    });
    setTimeout(() => { if (!state.map.loaded()) { mapStatus.hidden = true; mapError.hidden = false; } }, 10000);
  } catch (error) {
    console.error(error);
    mapStatus.hidden = true;
    mapError.hidden = false;
    mapError.querySelector("span").textContent = t("localServerFallback");
  }
}

init();
