const assert = require("node:assert/strict");
const { directionsUrl, LOCATION_PERMISSION_MESSAGE } = require("../navigation.js");

const feature = {
  geometry: { type: "Point", coordinates: [9.05339, 39.852867] }
};

assert.equal(
  directionsUrl(feature),
  "https://www.google.com/maps/dir/?api=1&destination=39.852867%2C9.05339&travelmode=walking"
);
assert.equal(directionsUrl({ geometry: null }), "");
assert.match(LOCATION_PERMISSION_MESSAGE, /posizione/i);
assert.match(LOCATION_PERMISSION_MESSAGE, /raggiungere le opere/i);

console.log("PASS: walking navigation URL and location-permission explanation");
