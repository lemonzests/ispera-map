import assert from "node:assert/strict";
import fs from "node:fs";

const html = fs.readFileSync(new URL("../index.html", import.meta.url), "utf8");
const app = fs.readFileSync(new URL("../app.js", import.meta.url), "utf8");

assert.match(html, /class="navigate-link"/);
assert.match(html, /navigation\.js\?v=/);
assert.match(html, /class="wordmark"[^>]+data-i18n-aria-label="homeLabel"/);
assert.match(html, /class="language-switcher"/);
assert.match(html, /data-language="it"/);
assert.match(html, /data-language="en"/);
assert.match(html, /i18n\.js\?v=/);
assert.match(app, /directionsUrl\(feature\)/);
assert.match(app, /className = "popup-navigate"/);
assert.match(app, /window\.confirm\(LOCATION_PERMISSION_MESSAGE\)/);
assert.match(app, /localizeArtworkType/);

console.log("PASS: navigation actions and permission explanation are wired into the interface");
