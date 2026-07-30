import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");

assert.match(html, /class="navigate-link"/);
assert.match(html, /navigation\.js\?v=/);
assert.match(html, /<a class="wordmark" href="\.\/" aria-label="Torna alla homepage ISPERA">/);
assert.match(app, /directionsUrl\(feature\)/);
assert.match(app, /className = "popup-navigate"/);
assert.match(app, /window\.confirm\(LOCATION_PERMISSION_MESSAGE\)/);

console.log("PASS: navigation actions and permission explanation are wired into the interface");
