const assert = require("node:assert/strict");

function loadI18n(search) {
  const modulePath = require.resolve("../i18n.js");
  delete require.cache[modulePath];
  global.location = { search, href: `https://ispera-map.vercel.app/${search}#artwork-6` };
  return require(modulePath);
}

let i18n = loadI18n("");
assert.equal(i18n.language, "it");
assert.equal(i18n.t("artworks"), "Le opere");
assert.equal(i18n.localizeArtworkType("Pittura"), "Pittura");
assert.equal(i18n.urlForLanguage("en"), "/?lang=en#artwork-6");

i18n = loadI18n("?lang=en");
assert.equal(i18n.language, "en");
assert.equal(i18n.t("artworks"), "The artworks");
assert.equal(i18n.t("locationPermission"), "Allow location access to see your position on the map and walk to the artworks.");
assert.equal(i18n.localizeArtworkType("Pittura"), "Painting");
assert.equal(i18n.localizeArtworkType("Fotografia ricamata"), "Embroidered photography");
assert.equal(i18n.urlForLanguage("it"), "/#artwork-6");
assert.equal(i18n.urlForLanguage("en", { home: true }), "/?lang=en");

delete global.location;
console.log("PASS: Italian and English translations, artwork types, and language URLs");