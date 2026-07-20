import { createHash } from "node:crypto";
import { access, readFile } from "node:fs/promises";

const requiredFiles = Object.freeze([
  "index.html",
  "lifecore-v04.html",
  "lifecore-data.js",
  "README.md",
  "assets/loviverse-logo.png",
]);

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

try {
  await Promise.all(requiredFiles.map((path) => access(path)));

  const [indexHtml, versionedHtml] = await Promise.all([
    readFile("index.html"),
    readFile("lifecore-v04.html"),
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

  const htmlHash = createHash("sha256").update(indexHtml).digest("hex");
  console.log(
    `Pages smoke PASS: ${requiredFiles.length} required files, HTML SHA-256 ${htmlHash}`,
  );
} catch (error) {
  console.error(`Pages smoke FAIL: ${error.message}`);
  process.exit(1);
}
