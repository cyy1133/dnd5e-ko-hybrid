import fs from "fs/promises";
import path from "path";

const usage = () => {
  console.error("Usage: node scripts/extract-world-db.mjs <world-data-dir> [output-json]");
  process.exit(1);
};

const [, , worldDataDirArg, outputArg] = process.argv;
if (!worldDataDirArg) usage();

const worldDataDir = path.resolve(worldDataDirArg);
const outputPath = outputArg
  ? path.resolve(outputArg)
  : path.resolve("tmp", `${path.basename(path.dirname(worldDataDir))}-template-export.json`);

const hasEnglish = (value = "") => /[A-Za-z]/.test(String(value));
const hasKorean = (value = "") => /[가-힣]/.test(String(value));

const shouldInclude = (name = "", body = "") => {
  const combined = `${name} ${body}`;
  return hasEnglish(combined);
};

const readDb = async (fileName) => {
  const filePath = path.join(worldDataDir, fileName);
  const raw = await fs.readFile(filePath, "utf8");
  return raw
    .split(/\r?\n/u)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
};

const describeItems = (items) => {
  const entries = {};
  for (const item of items) {
    const description = item.system?.description?.value ?? "";
    if (!shouldInclude(item.name, description)) continue;
    entries[`Item.${item._id}`] = {
      name: "",
      description: "",
      originalName: item.name,
      originalDescription: description,
      type: item.type,
      source: item.system?.source ?? null,
      englishOnly: hasEnglish(`${item.name} ${description}`) && !hasKorean(`${item.name} ${description}`)
    };
  }
  return entries;
};

const describeActorItems = (actors) => {
  const entries = {};
  for (const actor of actors) {
    for (const item of actor.items ?? []) {
      const description = item.system?.description?.value ?? "";
      if (!shouldInclude(item.name, description)) continue;
      entries[`Actor.${actor._id}.Item.${item._id}`] = {
        name: "",
        description: "",
        originalName: item.name,
        originalDescription: description,
        actor: actor.name,
        type: item.type,
        source: item.system?.source ?? null,
        englishOnly: hasEnglish(`${item.name} ${description}`) && !hasKorean(`${item.name} ${description}`)
      };
    }
  }
  return entries;
};

const describeActors = (actors) => {
  const entries = {};
  for (const actor of actors) {
    const biography = actor.system?.details?.biography?.value ?? "";
    if (!shouldInclude(actor.name, biography)) continue;
    entries[`Actor.${actor._id}`] = {
      name: "",
      description: "",
      originalName: actor.name,
      originalDescription: biography,
      type: actor.type,
      englishOnly: hasEnglish(`${actor.name} ${biography}`) && !hasKorean(`${actor.name} ${biography}`)
    };
  }
  return entries;
};

const describeJournalPages = (journals) => {
  const entries = {};
  for (const journal of journals) {
    for (const page of journal.pages ?? []) {
      const text = page.text?.content ?? "";
      if (!shouldInclude(page.name, text)) continue;
      entries[`JournalEntry.${journal._id}.JournalEntryPage.${page._id}`] = {
        name: "",
        text: "",
        originalName: page.name,
        originalText: text,
        journal: journal.name,
        type: page.type,
        englishOnly: hasEnglish(`${page.name} ${text}`) && !hasKorean(`${page.name} ${text}`)
      };
    }
  }
  return entries;
};

const main = async () => {
  const [actors, items, journals] = await Promise.all([
    readDb("actors.db"),
    readDb("items.db"),
    readDb("journal.db")
  ]);

  const template = {
    metadata: {
      generatedAt: new Date().toISOString(),
      worldDataDir
    },
    actors: {
      label: "Actors",
      entries: describeActors(actors)
    },
    items: {
      label: "World Items",
      entries: describeItems(items)
    },
    actorItems: {
      label: "Actor Embedded Items",
      entries: describeActorItems(actors)
    },
    journalPages: {
      label: "Journal Pages",
      entries: describeJournalPages(journals)
    }
  };

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(outputPath, JSON.stringify(template, null, 2), "utf8");

  const summary = {
    actors: Object.keys(template.actors.entries).length,
    items: Object.keys(template.items.entries).length,
    actorItems: Object.keys(template.actorItems.entries).length,
    journalPages: Object.keys(template.journalPages.entries).length,
    outputPath
  };
  console.log(JSON.stringify(summary, null, 2));
};

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
