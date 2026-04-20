import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const targets = [
  ["ddb-spells", path.join(ROOT, "localization", "compendium", "ko", "world.ddb---ddb-spells.json")],
  ["ddb-monsters", path.join(ROOT, "localization", "compendium", "ko", "world.ddb---ddb-monsters.json")],
  ["actor-items", path.join(ROOT, "localization", "world", "ko", "actor-items.json")],
  ["world-items", path.join(ROOT, "localization", "world", "ko", "world-items.json")],
];

const suspiciousPatterns = [
  "__FVTTT",
  "??",
  "우주가 걸리고",
  "다 다루셨나요",
  "주문 공유",
  "Hare-Trigger.",
  "Harengons",
  "Do they have connections to other changelings",
  "In their true form, changelings are pale",
];

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function stripMarkup(value) {
  return String(value ?? "")
    .replace(/<[^>]+>/gu, " ")
    .replace(/&(?:amp;)?Reference\[[^\]]+\](?:\{[^}]*\})?/gu, " ")
    .replace(/@[A-Za-z]+(?:\[[^\]]*\])(?:\{[^}]*\})?/gu, " ")
    .replace(/\[\[\/[^\]]+\]\]/gu, " ")
    .replace(/\s+/gu, " ")
    .trim();
}

function walkDescriptions(node, pathParts = [], rows = []) {
  if (Array.isArray(node)) {
    node.forEach((child, index) => walkDescriptions(child, [...pathParts, String(index)], rows));
    return rows;
  }

  if (!node || typeof node !== "object") return rows;

  if (typeof node.description === "string") {
    const plain = stripMarkup(node.description);
    const english = (plain.match(/[A-Za-z]/gu) ?? []).length;
    const hangul = (plain.match(/[\u3131-\u318E\uAC00-\uD7A3]/gu) ?? []).length;
    const foundPatterns = suspiciousPatterns.filter((pattern) => node.description.includes(pattern));

    if (foundPatterns.length || english >= 120 || (english >= 40 && english > hangul * 0.35)) {
      rows.push({
        path: pathParts.join(" -> "),
        name: node.name ?? "",
        english,
        hangul,
        patterns: foundPatterns
      });
    }
  }

  for (const [key, value] of Object.entries(node)) {
    walkDescriptions(value, [...pathParts, key], rows);
  }

  return rows;
}

for (const [label, filePath] of targets) {
  const data = readJson(filePath).entries ?? {};
  const rows = walkDescriptions(data).sort((a, b) => {
    const patternDelta = b.patterns.length - a.patterns.length;
    if (patternDelta) return patternDelta;
    return b.english - a.english;
  });

  console.log(`\n[${label}] suspicious=${rows.length}`);
  for (const row of rows.slice(0, 20)) {
    const patternText = row.patterns.length ? ` patterns=${row.patterns.join(",")}` : "";
    const nameText = row.name ? ` name=${row.name}` : "";
    console.log(`- eng=${row.english} kor=${row.hangul}${nameText} path=${row.path}${patternText}`);
  }
}
