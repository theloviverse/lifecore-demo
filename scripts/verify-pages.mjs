import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";

const requiredFiles = Object.freeze([
  "index.html",
  "lifecore-v04.html",
  "lifecore-data.js",
  "README.md",
  "site.webmanifest",
  "assets/apple-touch-icon-180.png",
  "assets/lifecore-icon-192.png",
  "assets/lifecore-icon-512.png",
  "assets/lifecore-icon-maskable-512.png",
  "assets/loviverse-logo.png",
]);

const pngSignature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function pngDimensions(buffer, path) {
  assert(buffer.length >= 24, `${path} is too small to be a PNG`);
  assert(
    buffer.subarray(0, pngSignature.length).equals(pngSignature),
    `${path} must be a PNG`,
  );
  assert(
    buffer.toString("ascii", 12, 16) === "IHDR",
    `${path} must contain an IHDR chunk`,
  );

  return Object.freeze({
    width: buffer.readUInt32BE(16),
    height: buffer.readUInt32BE(20),
  });
}

try {
  await Promise.all(requiredFiles.map((path) => access(path)));

  const [
    indexHtml,
    versionedHtml,
    manifestText,
    appleTouchIcon,
    icon192,
    icon512,
    maskableIcon512,
  ] = await Promise.all([
    readFile("index.html"),
    readFile("lifecore-v04.html"),
    readFile("site.webmanifest", "utf8"),
    readFile("assets/apple-touch-icon-180.png"),
    readFile("assets/lifecore-icon-192.png"),
    readFile("assets/lifecore-icon-512.png"),
    readFile("assets/lifecore-icon-maskable-512.png"),
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
    /\bhref\s*=\s*["']assets\/lifecore-icon-192\.png["']/i.test(iconLinks[0]),
    "the favicon link must reference assets/lifecore-icon-192.png",
  );
  assert(
    /\bsizes\s*=\s*["']192x192["']/i.test(iconLinks[0]),
    "the favicon link must declare its 192x192 size",
  );
  assert(
    /\btype\s*=\s*["']image\/png["']/i.test(iconLinks[0]),
    "the favicon link must declare image/png",
  );

  const appleTouchLinks =
    html.match(/<link\b(?=[^>]*\brel=["']apple-touch-icon["'])[^>]*>/gi) ?? [];

  assert(
    appleTouchLinks.length === 1,
    "exactly one apple-touch-icon link is required",
  );
  assert(
    /\bhref\s*=\s*["']assets\/apple-touch-icon-180\.png["']/i.test(
      appleTouchLinks[0],
    ),
    "the apple-touch-icon link must reference assets/apple-touch-icon-180.png",
  );
  assert(
    /\bsizes\s*=\s*["']180x180["']/i.test(appleTouchLinks[0]),
    "the apple-touch-icon link must declare its 180x180 size",
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
  const expectedManifestIcons = Object.freeze([
    Object.freeze({
      src: "assets/lifecore-icon-192.png",
      sizes: "192x192",
      type: "image/png",
      purpose: "any",
    }),
    Object.freeze({
      src: "assets/lifecore-icon-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "any",
    }),
    Object.freeze({
      src: "assets/lifecore-icon-maskable-512.png",
      sizes: "512x512",
      type: "image/png",
      purpose: "maskable",
    }),
  ]);

  assert(
    Array.isArray(manifest.icons) &&
      manifest.icons.length === expectedManifestIcons.length &&
      expectedManifestIcons.every((expectedIcon) =>
        manifest.icons.some(
          (icon) =>
            icon.src === expectedIcon.src &&
            icon.sizes === expectedIcon.sizes &&
            icon.type === expectedIcon.type &&
            icon.purpose === expectedIcon.purpose,
        ),
      ),
    "manifest icon metadata is invalid",
  );

  const iconDimensions = Object.freeze([
    ["assets/apple-touch-icon-180.png", appleTouchIcon, 180],
    ["assets/lifecore-icon-192.png", icon192, 192],
    ["assets/lifecore-icon-512.png", icon512, 512],
    ["assets/lifecore-icon-maskable-512.png", maskableIcon512, 512],
  ]);

  for (const [path, buffer, expectedSize] of iconDimensions) {
    const { width, height } = pngDimensions(buffer, path);
    assert(
      width === expectedSize && height === expectedSize,
      `${path} must be ${expectedSize}x${expectedSize}`,
    );
  }

  const htmlHash = createHash("sha256").update(indexHtml).digest("hex");
  console.log(
    `Pages smoke PASS: ${requiredFiles.length} required files, HTML SHA-256 ${htmlHash}`,
  );
} catch (error) {
  console.error(`Pages smoke FAIL: ${error.message}`);
  process.exit(1);
}
