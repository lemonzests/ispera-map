(function exposeNavigation(globalScope) {
  const LOCATION_PERMISSION_MESSAGE = globalScope.ISPERAI18n?.t("locationPermission") || "Consenti l’accesso alla posizione per visualizzarti sulla mappa e raggiungere le opere.";

  function directionsUrl(feature) {
    if (!feature?.geometry) return "";
    const [longitude, latitude] = feature.geometry.coordinates;
    const destination = encodeURIComponent(`${latitude},${longitude}`);
    return `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=walking`;
  }

  const navigation = { directionsUrl, LOCATION_PERMISSION_MESSAGE };
  globalScope.ISPERANavigation = navigation;
  if (typeof module !== "undefined" && module.exports) module.exports = navigation;
})(typeof window !== "undefined" ? window : globalThis);
