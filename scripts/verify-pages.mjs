import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";

const requiredFiles = Object.freeze([
  "index.html",
  "lifecore-v04.html",
  "lifecore-data.js",
  "README.md",
  "site.webmanifest",
  "assets/loviverse-logo.png",
]);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

try {
  await Promise.all(requiredFiles.map((path) => access(path)));

  const [indexHtml, versionedHtml, manifestText] = await Promise.all([
    readFile("index.html"),
    readFile("lifecore-v04.html"),
    readFile("site.webmanifest", "utf8"),
  ]);

  assert(
    indexHtml.equals(versionedHtml),
    "index.html and lifecore-v04.html must remain byte-identical",
  );

  const html = indexHtml.toString("utf8");
  const iconLinks =
    html.match(/<link\b(?=[^>]*\brel=["']icon["'])[^>]*>/gi) ?? [];

  assert(iconLinks.length === 1, "exactly one favicon link is required");
  assert(
    /\bhref\s*=\s*["']assets\/loviverse-logo\.png["']/i.test(iconLinks[0]),
    "the favicon link must reference assets/loviverse-logo.png",
  );

  const manifestLinks =
    html.match(/<link\b(?=[^>]*\brel=["']manifest["'])[^>]*>/gi) ?? [];

  assert(manifestLinks.length === 1, "exactly one manifest link is required");
  assert(
    /\bhref\s*=\s*["']site\.webmanifest["']/i.test(manifestLinks[0]),
    "the manifest link must reference site.webmanifest",
  );

  const themeColorTags =
    html.match(/<meta\b(?=[^>]*\bname=["']theme-color["'])[^>]*>/gi) ?? [];

  assert(themeColorTags.length === 1, "exactly one theme-color tag is required");
  assert(
    /\bcontent\s*=\s*["']#0b0f1e["']/i.test(themeColorTags[0]),
    "the theme-color tag must match the manifest",
  );

  assert(
    /<button\b(?=[^>]*\bid=["']demoModeButton["'])(?=[^>]*\bdata-runtime-mode=["']demo["'])(?=[^>]*\baria-pressed=["']true["'])[^>]*>\s*DEMO\s*<\/button>/i.test(
      html,
    ),
    "the DEMO mode button must remain selected by default",
  );

  assert(
    /<button\b(?=[^>]*\bid=["']fileModeButton["'])(?=[^>]*\bdata-runtime-mode=["']file["'])(?=[^>]*\baria-pressed=["']false["'])[^>]*>\s*FÁJL\s*<\/button>/i.test(
      html,
    ),
    "the file mode button must remain unselected by default",
  );

  assert(
    /\blet\s+runtimeMode\s*=\s*["']demo["']\s*;/.test(html),
    "runtimeMode must initialize in demo mode",
  );

  let manifest;
  try {
    manifest = JSON.parse(manifestText);
  } catch {
    throw new Error("site.webmanifest must contain valid JSON");
  }

  assert(manifest.name === "LifeCore OS", "manifest name is invalid");
  assert(manifest.short_name === "LifeCore", "manifest short_name is invalid");
  assert(manifest.lang === "hu", "manifest language is invalid");
  assert(manifest.id === "./", "manifest id is invalid");
  assert(manifest.start_url === "./", "manifest start_url is invalid");
  assert(manifest.scope === "./", "manifest scope is invalid");
  assert(manifest.display === "standalone", "manifest display is invalid");
  assert(
    manifest.background_color === "#05070f",
    "manifest background_color is invalid",
  );
  assert(
    manifest.theme_color === "#0b0f1e",
    "manifest theme_color is invalid",
  );
  assert(
    Array.isArray(manifest.icons) &&
      manifest.icons.some(
        (icon) =>
          icon.src === "assets/loviverse-logo.png" &&
          icon.sizes === "any" &&
          icon.type === "image/png" &&
          icon.purpose === "any",
      ),
    "manifest icon metadata is invalid",
  );

  const htmlHash = createHash("sha256").update(indexHtml).digest("hex");
  console.log(
    `Pages smoke PASS: ${requiredFiles.length} required files, HTML SHA-256 ${htmlHash}`,
  );
} catch (error) {
  console.error(`Pages smoke FAIL: ${error.message}`);
  process.exit(1);
}
