import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const paths = {
  worldItems: path.join(ROOT, "localization", "world", "ko", "world-items.json"),
  actorItems: path.join(ROOT, "localization", "world", "ko", "actor-items.json"),
  ddbSpells: path.join(ROOT, "localization", "compendium", "ko", "world.ddb---ddb-spells.json"),
  ddbMonsters: path.join(ROOT, "localization", "compendium", "ko", "world.ddb---ddb-monsters.json"),
};

const changelingInstinctsDescription = `<div class="ddb">
<p>다음 기술 가운데 원하는 둘의 숙련을 얻습니다: &Reference[skill=Deception]{기만 Deception}, &Reference[skill=Insight]{통찰 Insight}, &Reference[skill=Intimidation]{위협 Intimidation}, &Reference[skill=Persuasion]{설득 Persuasion}.</p>
<hr />
<section class="secret">
<ul>
<li><p>&Reference[skill=Deception]{기만 Deception}</p></li>
<li><p>&Reference[skill=Insight]{통찰 Insight}</p></li>
<li><p>&Reference[skill=Intimidation]{위협 Intimidation}</p></li>
<li><p>&Reference[skill=Persuasion]{설득 Persuasion}</p></li>
</ul>
</section>
</div>`;

const dissonantWhispers2024Description = `<div class="ddb">
<p>범위 내에서 볼 수 있는 당신이 선택한 생물 하나가 마음속에서 불협화음의 선율을 듣습니다. 대상은 지혜 내성 굴림을 해야 합니다. 실패하면 [[/damage 3d6 type=psychic]] 피해를 받고, 가능하다면 즉시 반응을 사용해 속도가 허용하는 한 당신에게서 최대한 멀리 이동해야 합니다. 성공하면 피해를 절반만 받습니다.</p>
<p><strong><em>상위 레벨 시전.</em></strong> 이 주문을 2레벨 이상의 주문 슬롯으로 시전하면, 1레벨을 초과하는 슬롯 레벨마다 피해가 [[/damage 1d6 type=psychic]]씩 증가합니다.</p>
</div>`;

const dissonantWhispers2014Description = `<div class="ddb">
<p>당신은 범위 내에서 당신이 선택한 생물 하나만 들을 수 있는 불협화음의 선율을 속삭여 끔찍한 고통을 안깁니다. 대상은 지혜 내성 굴림을 해야 합니다. 실패하면 [[/damage 3d6 type=psychic]] 피해를 받고, 가능하다면 즉시 반응을 사용해 속도가 허용하는 한 당신에게서 최대한 멀리 이동해야 합니다. 이 생물은 불이나 구덩이처럼 명백히 위험한 지형으로는 이동하지 않습니다. 성공하면 피해를 절반만 받고 이동하지 않습니다. &Reference[condition=deafened]{귀 먹음 Deafened} 상태인 생물은 이 내성 굴림에 자동으로 성공합니다.</p>
<p><strong>상위 레벨 시전.</strong> 이 주문을 2레벨 이상의 주문 슬롯으로 시전하면, 1레벨을 초과하는 슬롯 레벨마다 피해가 [[/damage 1d6 type=psychic]]씩 증가합니다.</p>
</div>`;

const distortValueDescription = `<div class="ddb">
<p>혼돈의 사원에서 해방한 기묘한 문어 조각상을 팔면서 상인에게 금화를 몇 닢이라도 더 받아내고 싶습니까? 아니면 마법 자산에 대한 세금을 피하려고 세금 징수원의 눈을 속여야 합니까? 어떤 상황이든 이 주문이 도움이 됩니다.</p>
<p>한 변이 1피트를 넘지 않는 물체 하나에 이 주문을 걸어, 환영 장식과 광택을 더해 인지되는 가치를 두 배로 늘리거나, 환영의 흠집과 찌그러짐, 보기 흉한 결함을 더해 인지되는 가치를 절반으로 줄입니다. 그 물체를 조사하는 생물은 당신의 주문 내성 DC에 대한 지능(조사) 판정에 성공하면 물체의 진짜 가치를 알아낼 수 있습니다.</p>
<p><em><strong>상위 레벨 시전.</strong></em> 이 주문을 2레벨 이상의 주문 슬롯으로 시전하면 1레벨을 초과하는 슬롯 레벨마다 대상으로 삼을 수 있는 물체의 최대 크기가 1피트씩 증가합니다.</p>
</div>`;

const harengonLoreSection = `<hr>
<h3>해렌곤</h3>
<p>해렌곤은 페이와일드 출신의 토끼 같은 민족으로, 종종 물질계로 건너옵니다. 이들은 걷는 여행을 사랑하며 한곳에 오래 머무는 일이 드뭅니다.</p>
<p>모든 해렌곤이 여기에 제시된 자들처럼 악랄한 불한당인 것은 아닙니다. 해렌곤은 각자 자신만의 길을 따르며, 그 성향 역시 함께 어울리는 동료들에게 영향을 받습니다. 어떤 해렌곤은 먼 나라를 여행하며 길 위에서 친구를 사귀고 자유와 탁 트인 길을 즐기며 내면의 평화를 찾습니다. 또 어떤 해렌곤은 강한 의지와 뜨거운 꿈을 지닌 모험가가 되기도 합니다.</p>`;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function cleanText(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(/__FVTTT(?:\s*OK)?[_\s-]*\d+__?/gu, "")
    .replace(/__FVTTTOK[_\s-]*\d+__?/gu, "")
    .replace(/\s{2,}/gu, " ")
    .replace(/>\s+</gu, "><")
    .trim();
}

function scrubDescriptions(node) {
  if (Array.isArray(node)) {
    node.forEach(scrubDescriptions);
    return;
  }

  if (!node || typeof node !== "object") return;

  for (const [key, value] of Object.entries(node)) {
    if ((key === "description" || key === "text") && typeof value === "string") {
      node[key] = cleanText(value);
      continue;
    }

    scrubDescriptions(value);
  }
}

function replaceHarengonLore(description) {
  if (!description) return description;
  return cleanText(
    description.replace(
      /<hr>\s*<h3>하렌곤스<\/h3>[\s\S]*$/u,
      harengonLoreSection
    )
      .replace(/Harengons는/gu, "해렌곤은")
      .replace(/Feywild/gu, "페이와일드")
  );
}

const worldItems = readJson(paths.worldItems);
const actorItems = readJson(paths.actorItems);
const ddbSpells = readJson(paths.ddbSpells);
const ddbMonsters = readJson(paths.ddbMonsters);

const worldItemEntries = worldItems.entries ?? {};
const actorItemEntries = actorItems.entries ?? {};
const spellEntries = ddbSpells.entries ?? {};
const monsterEntries = ddbMonsters.entries ?? {};

const harengonDescription = worldItemEntries["Item.9K9gSiglptF4GnE5"]?.description;
const changelingDescription = worldItemEntries["Item.Ca6RXTrp3nnLVIT2"]?.description;

if (!harengonDescription || !changelingDescription) {
  throw new Error("Expected Harengon/Changeling world item descriptions were not found.");
}

spellEntries["Dissonant Whispers"] = {
  ...(spellEntries["Dissonant Whispers"] ?? {}),
  description: dissonantWhispers2024Description
};

spellEntries["Distort Value"] = {
  ...(spellEntries["Distort Value"] ?? {}),
  description: distortValueDescription
};

for (const entry of Object.values(monsterEntries)) {
  if (entry?.items?.["Dissonant Whispers"]) {
    entry.items["Dissonant Whispers"] = {
      ...entry.items["Dissonant Whispers"],
      description: dissonantWhispers2014Description
    };
  }

  if (entry?.items?.["Distort Value"]) {
    entry.items["Distort Value"] = {
      ...entry.items["Distort Value"],
      description: distortValueDescription
    };
  }
}

for (const [entryKey, entry] of Object.entries(actorItemEntries)) {
  const name = String(entry?.name ?? "");

  if (name.includes("체인질링 본능 - Changeling Instincts")) {
    actorItemEntries[entryKey] = {
      ...entry,
      description: changelingInstinctsDescription
    };
    continue;
  }

  if (name === "체인질링 - Changeling") {
    actorItemEntries[entryKey] = {
      ...entry,
      description: changelingDescription
    };
    continue;
  }

  if (name === "해렌곤 - Harengon") {
    actorItemEntries[entryKey] = {
      ...entry,
      description: harengonDescription
    };
    continue;
  }

  if (!name && entry?.description?.includes("Hare-Trigger")) {
    actorItemEntries[entryKey] = {
      ...entry,
      name: "해렌곤 - Harengon",
      description: harengonDescription
    };
    continue;
  }

  if (name.includes("불협화음의 속삭임 - Dissonant Whispers")) {
    actorItemEntries[entryKey] = {
      ...entry,
      description: dissonantWhispers2014Description
    };
  }
}

for (const key of ["Harengon Brigand", "Harengon Sniper"]) {
  if (monsterEntries[key]?.description) {
    monsterEntries[key].description = replaceHarengonLore(monsterEntries[key].description);
  }
}

scrubDescriptions(worldItems);
scrubDescriptions(actorItems);
scrubDescriptions(ddbSpells);
scrubDescriptions(ddbMonsters);

writeJson(paths.worldItems, worldItems);
writeJson(paths.actorItems, actorItems);
writeJson(paths.ddbSpells, ddbSpells);
writeJson(paths.ddbMonsters, ddbMonsters);

console.log("Repaired translation quality issues in world and DDB localization files.");
