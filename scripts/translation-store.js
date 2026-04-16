const MODULE_ID = "dnd5e-ko-hybrid";

const WORLD_TRANSLATION_FILES = {
  actors: "localization/world/ko/actors.json",
  items: "localization/world/ko/world-items.json",
  actorItems: "localization/world/ko/actor-items.json",
  journalPages: "localization/world/ko/journal-pages.json",
  sharedItems: "localization/world/ko/shared-items.json"
};

const NAME_FALLBACK_TYPES = new Set([
  "background",
  "class",
  "consumable",
  "container",
  "equipment",
  "feat",
  "loot",
  "race",
  "spell",
  "subclass",
  "tool",
  "weapon"
]);

const normalizeText = (value) => String(value ?? "").trim().replace(/\r\n/g, "\n");

const normalizeReferenceKey = (value) =>
  normalizeText(value)
    .replace(/&amp;/gu, "&")
    .replace(/['’]/gu, "")
    .replace(/[^A-Za-z0-9]+/gu, "")
    .toLowerCase();

const normalizeReferenceType = (value) => {
  const normalized = normalizeText(value).replace(/[^A-Za-z]+/gu, "").toLowerCase();
  switch (normalized) {
    case "abilities":
      return "ability";
    case "skills":
      return "skill";
    case "conditions":
      return "condition";
    case "damagetype":
    case "damagetypes":
      return "damage";
    case "rules":
      return "rule";
    default:
      return normalized;
  }
};

const referenceAliasKey = (type, value) => {
  const normalizedValue = normalizeReferenceKey(value);
  if (!normalizedValue) return "";
  const normalizedType = normalizeReferenceType(type);
  return normalizedType ? `${normalizedType}:${normalizedValue}` : normalizedValue;
};

const stripHtmlText = (value) => {
  const template = document.createElement("template");
  template.innerHTML = String(value ?? "");
  return normalizeText(template.content.textContent ?? "").replace(/\s+/gu, " ").trim();
};

const REFERENCE_TYPED_LABELS = {
  ability: {
    str: "Strength",
    strength: "Strength",
    dex: "Dexterity",
    dexterity: "Dexterity",
    con: "Constitution",
    constitution: "Constitution",
    int: "Intelligence",
    intelligence: "Intelligence",
    wis: "Wisdom",
    wisdom: "Wisdom",
    cha: "Charisma",
    charisma: "Charisma"
  },
  skill: {
    acr: "Acrobatics",
    acrobatics: "Acrobatics",
    ani: "Animal Handling",
    animalhandling: "Animal Handling",
    arc: "Arcana",
    arcana: "Arcana",
    ath: "Athletics",
    athletics: "Athletics",
    dec: "Deception",
    deception: "Deception",
    his: "History",
    history: "History",
    ins: "Insight",
    insight: "Insight",
    itm: "Intimidation",
    intimidation: "Intimidation",
    inv: "Investigation",
    investigation: "Investigation",
    med: "Medicine",
    medicine: "Medicine",
    nat: "Nature",
    nature: "Nature",
    prc: "Perception",
    perception: "Perception",
    prf: "Performance",
    performance: "Performance",
    per: "Persuasion",
    persuasion: "Persuasion",
    rel: "Religion",
    religion: "Religion",
    slt: "Sleight of Hand",
    sleightofhand: "Sleight of Hand",
    ste: "Stealth",
    stealth: "Stealth",
    sur: "Survival",
    survival: "Survival"
  },
  condition: {
    blinded: "Blinded",
    charmed: "Charmed",
    deafened: "Deafened",
    exhaustion: "Exhaustion",
    frightened: "Frightened",
    grappled: "Grappled",
    incapacitated: "Incapacitated",
    invisible: "Invisible",
    paralyzed: "Paralyzed",
    petrified: "Petrified",
    poisoned: "Poisoned",
    prone: "Prone",
    restrained: "Restrained",
    stunned: "Stunned",
    unconscious: "Unconscious"
  },
  damage: {
    acid: "Acid",
    bludgeoning: "Bludgeoning",
    cold: "Cold",
    fire: "Fire",
    force: "Force",
    lightning: "Lightning",
    necrotic: "Necrotic",
    piercing: "Piercing",
    poison: "Poison",
    psychic: "Psychic",
    radiant: "Radiant",
    slashing: "Slashing",
    thunder: "Thunder"
  },
  spellschool: {
    abj: "Abjuration",
    abjuration: "Abjuration",
    con: "Conjuration",
    conjuration: "Conjuration",
    div: "Divination",
    divination: "Divination",
    enc: "Enchantment",
    enchantment: "Enchantment",
    evo: "Evocation",
    evocation: "Evocation",
    ill: "Illusion",
    illusion: "Illusion",
    nec: "Necromancy",
    necromancy: "Necromancy",
    trs: "Transmutation",
    transmutation: "Transmutation"
  }
};

const referenceAliasesForPageName = (pageName) => {
  const aliases = [];
  const normalizedPageName = normalizeText(pageName);
  for (const [type, mapping] of Object.entries(REFERENCE_TYPED_LABELS)) {
    for (const [alias, canonicalLabel] of Object.entries(mapping)) {
      if (normalizeText(canonicalLabel).toLowerCase() !== normalizedPageName.toLowerCase()) continue;
      aliases.push(referenceAliasKey(type, alias));
    }
  }
  return aliases;
};

const signatureFor = ({ type = "", name = "", content = "" } = {}) =>
  `${normalizeText(type)}::${normalizeText(name)}::${normalizeText(content)}`;

const COMMON_NAME_TRANSLATIONS = {
  "+1 Breastplate": "+1 브레스트플레이트",
  "Absorb Elements": "원소 흡수",
  "Acid": "산성병",
  "Alchemist": "연금술사",
  "Alchemist's Fire": "연금술사의 불",
  "Alchemy": "연금술",
  "Amphibious": "양서",
  "Arcana Domain": "비전 권역",
  "Arcane Trickster": "아케인 트릭스터",
  "Arms of Hadar": "하다르의 팔",
  "Arrows": "화살",
  "Arrows (20)": "화살 (20)",
  "Assassin": "암살자",
  "Active Elements": "활성 요소",
  "Background": "배경",
  "Barbed Tail": "가시 꼬리",
  "Battle Master": "배틀 마스터",
  "Bastard Sword": "바스타드 소드",
  "Bites": "물기",
  "Bites (Half Hit Points)": "물기 (절반 HP)",
  "Bless": "축복",
  "Blowgun": "바람총",
  "Bardic Inspiration": "바드의 고양감",
  "Bedroll": "침낭",
  "Bigby's Hand": "빅비의 손",
  "Blessings of Knowledge": "지식의 축복",
  "Benign Transposition": "온화한 전치",
  "Blessed Strikes": "축복받은 일격",
  "Claws": "발톱",
  "Club": "곤봉",
  "Combat Superiority": "전투 우월성",
  "Command": "명령",
  "Countermeasures": "대응책",
  "Crowbar": "쇠지렛대",
  "Changeling Instincts": "체인질링 본능",
  "Deathless Nature": "죽지 않는 본성",
  "Description": "설명",
  "Detect Magic": "마법 탐지",
  "Disguise Kit": "변장 키트",
  "Dispel Magic": "마법 무효화",
  "Divine Aid": "신성한 도움",
  "Divine Smite": "신성한 강타",
  "Dynamic Elements": "가변 요소",
  "Eldritch Knight": "엘드리치 나이트",
  "Energy Drain (Melee)": "에너지 흡수 (근접)",
  "Energy Drain (Ranged)": "에너지 흡수 (원거리)",
  "Extra Attack": "추가 공격",
  "Faerie Fire": "요정 불꽃",
  "Fear": "공포",
  "Fey Ancestry": "요정 혈통",
  "Fighting Style: Defense": "전투 스타일: 방어",
  "Fighting Style: Great Weapon Fighting": "전투 스타일: 대형 무기 전투",
  "Eyes of Night": "밤의 눈",
  "Elemental Attunement": "원소 조율",
  "Elemental Attunement.": "원소 조율.",
  "Grasping Tendrils": "움켜쥐는 덩굴손",
  "Healing Word": "치료의 단어",
  "Innate Spellcasting": "선천적 주문시전",
  "Invisibility": "투명화",
  "Lay on Hands Pool": "치유력 풀",
  "Legendary Actions": "전설적 행동",
  "Life Drain": "생명력 흡수",
  "Light": "빛",
  "Longsword": "장검",
  "Piton": "등반용 고리못",
  "Ray of Cold": "냉기의 광선",
  "Reel": "끌어당기기",
  "Regional Effects": "지역 효과",
  "Regeneration": "재생",
  "Sanctuary": "성역화",
  "Second Wind": "재기의 바람",
  "Shapechanger": "형태변환자",
  "Slam": "강타",
  "Song of Rest": "휴식의 노래",
  "Student of War": "전쟁의 수련생",
  "Tendril": "촉수",
  "The Hexblade": "헥스블레이드",
  "Tinderbox": "부싯깃통",
  "Toll the Dead": "죽은 자의 종소리",
  "Torch": "횃불",
  "Wrathful Smite": "분노의 강타",
  "Artillerist": "포격술사",
  "Bite": "물기",
  "Backpack": "배낭",
  "Ball Bearings (bag of 1,000)": "쇠구슬 (1,000개 주머니)",
  "Battle Smith": "전투 대장장이",
  "Biomancer": "생체술사",
  "Birdpipes": "버드파이프",
  "Bladesinging": "칼춤 학파",
  "Blade Flourish": "검무",
  "Bloodlink Potion": "피의 연결 물약",
  "Bola": "볼라",
  "Bomb": "폭탄",
  "Booming Blade": "우레 칼날",
  "Bonus Proficiencies": "추가 숙련",
  "Breastplate of Gleaming": "빛나는 브레스트플레이트",
  "Candle": "초",
  "Cause Fear": "공포 유발",
  "Chaos Bolt": "혼돈 탄환",
  "Chain Mail": "체인 메일",
  "Chain Shirt": "체인 셔츠",
  "Changeling": "체인질링",
  "Claw": "발톱",
  "Clothes, Common": "평상복",
  "Clothes, Costume": "의상복",
  "Clothing, cold weather": "한랭지 의복",
  "College of Creation": "창조 학파",
  "College of Eloquence": "웅변 학파",
  "College of Glamour": "매혹 학파",
  "College of Spirits": "영혼 학파",
  "College of Swords": "검의 학파",
  "College of Valor": "용맹 학파",
  "College of Whispers": "속삭임 학파",
  "Combat Inspiration": "전투 영감",
  "Corrupting Touch": "부패의 손길",
  "Crossbow Bolts (20)": "크로스보우 볼트 (20)",
  "Crossbow, Hand, Repeating": "연발 핸드 크로스보우",
  "Crossbow, Heavy, Repeating": "연발 헤비 크로스보우",
  "Crossbow, Light, Repeating": "연발 라이트 크로스보우",
  "Dagger": "대거",
  "Dancing Lights": "춤추는 불빛",
  "Darkness": "암흑",
  "Darkvision": "암시야",
  "Darkvision.": "암시야.",
  "Dart": "다트",
  "Death Domain": "죽음 권역",
  "Dhampir": "댐피르",
  "Disciple of the Elements": "원소의 제자",
  "Channel Divinity: Knowledge of the Ages": "신성 변환: 시대의 지식",
  "Channel Divinity: Read Thoughts": "신성 변환: 사고 읽기",
  "Channel Divinity: Twilight Sanctuary": "신성 변환: 황혼의 성역",
  "Detect Life": "생명 감지",
  "Double-Bladed Scimitar": "양날 시미터",
  "Drow Magic": "드로우 마법",
  "Drow Poison": "드로우 독",
  "Elf (Drow)": "엘프 (드로우)",
  "Emblem": "엠블럼",
  "Engineering": "공학",
  "Endure Elements": "혹한내성 물약",
  "Effect": "효과",
  "Equipment": "장비",
  "Faction Agent": "파벌 요원",
  "Feline Agility": "고양이의 민첩성",
  "Feline Agility.": "고양이의 민첩성.",
  "Focused Conjuration": "집중 소환",
  "False Appearance": "의태",
  "Font of Inspiration": "영감의 샘",
  "Formation Tactics": "대형 전술",
  "Forge Domain": "대장간 권역",
  "Gender": "성별",
  "Gender:": "성별:",
  "Great Weapon Master": "대형 무기 달인",
  "Great Weapon Master Attack": "대형 무기 달인 공격",
  "Greatsword": "대검",
  "Green-Flame Blade": "녹염 칼날",
  "Grave Domain": "무덤 권역",
  "Guardian Emblem": "수호의 문장",
  "Guiding Whispers": "인도의 속삭임",
  "Hand of Harm": "해악의 손",
  "Hand of Healing": "치유의 손",
  "Hand of Ultimate Mercy": "궁극의 자비의 손",
  "Gunslinger": "총잡이",
  "Hare-Trigger": "토끼 같은 반사신경",
  "Harengon": "해렌곤",
  "Heavy Crossbow": "헤비 크로스보우",
  "Hex Warrior": "헥스 전사",
  "Hexblade's Curse": "헥스블레이드의 저주",
  "Hoopak": "후팍",
  "Holy Symbol": "성징",
  "Human (Legacy)": "인간 (구판)",
  "Initiative": "우선권",
  "Inquisitive": "탐정",
  "Influencer's Tattoo": "영향력의 문신",
  "Invisibility (Legacy)": "투명화 (구판)",
  "Jack of All Trades": "만능 재주꾼",
  "Keen Hearing and Smell": "예리한 청각과 후각",
  "Keen Smell": "예리한 후각",
  "Knowledge Domain": "지식 권역",
  "Knowledge Domain Spells": "지식 권역 주문",
  "Languages": "언어",
  "Lantern, Hooded": "후드 달린 랜턴",
  "Leather": "가죽 갑옷",
  "Leather Armor": "레더 아머",
  "Leporine Senses": "토끼 감각",
  "Legendary Resistance": "전설적 저항",
  "Light Crossbow": "라이트 크로스보우",
  "Light Domain": "빛 권역",
  "Liquid Shadow": "액체 그림자",
  "Longbow": "롱보우",
  "Lucky Footwork": "행운의 발놀림",
  "Mace": "메이스",
  "Mage Hand Legerdemain": "마법 손재주",
  "Magical Ambush": "마법적 기습",
  "Magic Resistance": "마법 저항",
  "Mantle of Inspiration": "영감의 망토",
  "Mantle of Whispers": "속삭임의 망토",
  "Mask Appearance": "가면 모양",
  "Merciful Mask": "자비로운 가면",
  "Mastermind": "책략가",
  "Menacing": "위협적 존재감",
  "Miner's Tattoo": "광부의 문신",
  "Misty Step": "안개 걸음",
  "Move": "이동",
  "Multiattack": "다중공격",
  "Nakano's Tarot Cards": "나카노의 타로 카드",
  "Nangnang": "낭낭",
  "Nature Domain": "자연 권역",
  "Minor Alchemy": "소연금술",
  "Minor Conjuration": "소환의 소기",
  "Master Transmuter": "대변환자",
  "Major Transformation": "대변환",
  "Object Reading": "물체 독심",
  "Necklace of Fireballs": "화염구 목걸이",
  "Oil of Extreme Bludgeoning": "극한 타격의 기름",
  "Oil (flask)": "기름 (플라스크)",
  "Order Domain": "질서 권역",
  "Order of Scribes": "필경사의 기사단",
  "Pack Tactics": "무리 전술",
  "Peace Domain": "평화 권역",
  "Personality": "성격",
  "Personality:": "성격:",
  "Phantom": "팬텀",
  "Powered Armor": "동력 갑옷",
  "Psychic Blades": "정신 칼날",
  "Psychic Whispers": "정신의 속삭임",
  "Pyrotechnics": "화공술",
  "Pounce": "도약 공격",
  "Potion of Barkskin": "바크스킨 물약",
  "Potion of Hide from Undead": "언데드 은폐 물약",
  "Potion of Lesser Restoration": "하급 회복 물약",
  "Potion of Neutralize Poison": "독 중화 물약",
  "Potion of Rage": "분노 물약",
  "Potion of Remove Disease": "질병 제거 물약",
  "Potion of Troll Blood": "트롤 피 물약",
  "Potion of Troll Blood, Greater": "상급 트롤 피 물약",
  "Potent Spellcasting": "강화된 주문시전",
  "Physician's Touch": "의사의 손길",
  "Philosopher's Stone": "현자의 돌",
  "Power": "능력",
  "Power:": "능력:",
  "Prone": "넘어짐",
  "Questing": "탐구자",
  "Rabbit Hop": "토끼 도약",
  "Radiant Flame": "광휘의 불꽃",
  "Rations": "휴대식량",
  "Rations (1 day)": "식량 (1일분)",
  "Redirect Attack": "공격 전환",
  "Rend": "찢기",
  "Remove Fear Potion": "공포 해제 물약",
  "Rope, Hempen (50 feet)": "마 밧줄 (50피트)",
  "Scout": "정찰병",
  "Scrying": "투시",
  "School of Abjuration": "방호 학파",
  "School of Conjuration": "소환 학파",
  "Conjuration Savant": "소환 학파 비전가",
  "School of Divination": "점술 학파",
  "School of Enchantment": "매혹 학파",
  "School of Illusion": "환영 학파",
  "School of Necromancy": "사령 학파",
  "School of Transmutation": "변환 학파",
  "Transmutation Savant": "변환 학파 비전가",
  "Scimitar": "시미터",
  "Shadow Lore": "그림자 비전",
  "Shield": "방패",
  "Shortbow": "숏보우",
  "Shortsword": "쇼트소드",
  "Silvery Barbs": "은빛 조롱",
  "Silvered Crossbow Bolt": "은도금 크로스보우 볼트",
  "Silvered Mace": "은도금 메이스",
  "Silvered Rapier": "은도금 레이피어",
  "Soldier": "병사",
  "Soulknife": "소울나이프",
  "Spear": "창",
  "Speedster": "신속한 자",
  "Spellcasting": "주문시전",
  "Spell Slots": "주문 슬롯",
  "Spell Slots.": "주문 슬롯.",
  "Spell Thief": "주문 도둑",
  "Spells Known of 1st-Level and Higher": "1레벨 이상 주문 습득",
  "Spells Known of 1st-Level and Higher.": "1레벨 이상 주문 습득.",
  "Cantrips": "캔트립",
  "Cantrips.": "캔트립.",
  "Signature Recipe": "대표 레시피",
  "Steps of Night": "밤의 걸음",
  "Staff of the Three Toads": "세 두꺼비의 지팡이",
  "String": "끈",
  "Studded Leather Armor": "스터디드 레더 아머",
  "Sunlight Sensitivity": "햇빛 민감성",
  "Swashbuckler": "스워시버클러",
  "Tabaxi": "타바시",
  "Cat's Claws": "고양이 발톱",
  "Cat's Claws.": "고양이 발톱.",
  "Tail": "꼬리",
  "Tail Swipe": "꼬리 휩쓸기",
  "Talons": "발톱",
  "Tempest Domain": "폭풍 권역",
  "Thaumaturgy": "소마법",
  "The Cat Lord": "고양이 군주",
  "Trickery Domain": "기만 권역",
  "Trigger": "발동 조건",
  "Twilight Domain": "황혼 권역",
  "Twilight Sanctuary": "황혼의 성역",
  "Twilight Shroud": "황혼의 장막",
  "Twilight Domain Spells": "황혼 권역 주문",
  "Vigilant Blessing": "경계의 축복",
  "Unarmed Strike": "비무장 공격",
  "Undead Fortitude": "언데드의 불굴",
  "Expanded Spell List": "확장 주문 목록",
  "Exceptional Potency": "탁월한 효력",
  "Flurry of Healing and Harm": "치유와 해악의 연타",
  "Fighting Style": "전투 스타일",
  "Wondrous Distribution": "경이로운 분배",
  "Potent Reagents": "강력한 시약",
  "Alchemist Spells": "연금술사 주문",
  "Artificer Level": "아티피서 레벨",
  "Vocation Spells": "직능 주문",
  "Defensive Flourish": "방어의 검무",
  "Mobile Flourish": "기동의 검무",
  "Slashing Flourish": "참격의 검무",
  "Dueling": "결투술",
  "Two-Weapon Fighting": "쌍수 전투",
  "Implements of Mercy": "자비의 도구",
  "Read Thoughts": "사고 읽기",
  "Cleric Level": "클레릭 레벨",
  "Feature": "특성",
  "Features": "특성",
  "Tool Proficiency": "도구 숙련",
  "Object Reading": "물체 독심",
  "Area Reading": "지역 독심",
  "Minor Conjuration": "소환의 소기",
  "Minor Alchemy": "소연금술",
  "Transmuter's Stone": "변환학자의 돌",
  "Unusual Nature": "기이한 본성",
  "Vampiric Bite": "흡혈 물기",
  "War Domain": "전쟁 권역",
  "War Priest": "전쟁 사제",
  "War Magic": "전투 마법",
  "Wail": "통곡",
  "Waterskin": "물주머니",
  "Way of Mercy": "자비의 길",
  "Way of Shadow": "그림자의 길",
  "Way of the Ascendant Dragon": "승천하는 드래곤의 길",
  "Way of the Astral Self": "아스트랄 자아의 길",
  "Way of the Drunken Master": "취권의 길",
  "Way of the Four Elements": "사원소의 길",
  "Way of the Kensei": "검성의 길",
  "Way of the Long Death": "긴 죽음의 길",
  "Way of the Sun Soul": "태양혼의 길",
  "Weapon Bond": "무기 결속",
  "Whispers of the Dead": "죽은 자의 속삭임",
  "Wild Magic": "야생 마법",
  "Wing Gusts": "날개 돌풍",
  "Words of Terror": "공포의 속삭임",
  "Visions of the Past": "과거의 환영",
  "Versatile Trickster": "만능 속임수꾼",
  "Age": "나이",
  "Ancestral Legacy: Deception": "선조의 유산: 기만",
  "Ancestral Legacy: Insight": "선조의 유산: 통찰",
  "Archer's Eye": "궁수의 눈",
  "Borrowed Knowledge": "지식 차용",
  "Catnap": "선잠",
  "Ceremony": "의식",
  "Commanding Spores": "지배 포자",
  "Dissonant Whispers": "불협화음의 속삭임",
  "Elemental Adept (Fire)": "원소 숙련 (화염)",
  "Enthralling Performance": "매혹적인 공연",
  "Explode": "폭발",
  "Friends": "우정",
  "Gift of Gab": "말재주",
  "Hempen Rope (50 feet)": "삼줄 밧줄 (50피트)",
  "Holy Water": "성수",
  "Holy Weapon": "신성한 무기",
  "Inflict Wounds (Legacy)": "상처 가하기 (구판)",
  "Inspire": "고무",
  "Javelin (Melee)": "재블린 (근접)",
  "Javelin (Ranged)": "재블린 (원거리)",
  "Life Transference": "생명 전이",
  "Magic Stone": "마법 돌",
  "Melf's Acid Arrow": "멜프의 산 화살",
  "Mind Spike": "정신 가시",
  "Multiattack (Humanoid or Hybrid Form Only)": "다중공격 (인간형 또는 혼성 형태에서만)",
  "Multiattack (Vampire Form Only)": "다중공격 (흡혈귀 형태에서만)",
  "Nightmare Breath": "악몽의 숨결",
  "Noxious Miasma": "유독한 독기",
  "Oath Spells": "맹세 주문",
  "Paralyzing Touch": "마비의 손길",
  "Robe": "로브",
  "Searing Smite": "작열 강타",
  "Shadow Touched (Charisma): Inflict Wounds": "그림자 물듦(매력): 상처 가하기",
  "Shape Water": "물 다루기",
  "Sorcerous Burst": "마력 폭발",
  "Spellcasting (Psionics)": "주문 시전 (사이오닉)",
  "Toxic Spores": "독성 포자",
  "Vine Staff": "덩굴 지팡이",
  "Viral Aura": "바이러스 오라",
  "Virulent Miasma": "맹독성 독기",
  "Vitriolic Sphere": "부식 구체",
  "Watery Sphere": "물 구체",
  "Wrathful Smite (Legacy)": "분노의 강타 (구판)",
  "Wyvern Poison": "와이번 독",
  "Rapier": "레이피어",
  "Net": "그물",
  "Lance": "랜스",
  "Maul": "마울",
  "Morningstar": "모닝스타",
  "Sling": "슬링",
  "Battleaxe": "배틀액스",
  "Whip": "채찍",
  "Handaxe": "손도끼",
  "Rod": "막대",
  "Bell": "종",
  "Blanket": "담요",
  "Hammer": "망치",
  "Book": "책",
  "Glass Bottle": "유리병",
  "Common Clothes": "평민 복장",
  "Antitoxin": "해독제",
  "Censer": "향로",
  "Vestments": "사제복",
  "Potion of Healing": "치유의 물약",
  "Potion of Poison": "독의 물약",
  "Aid": "원호",
  "Silence": "침묵",
  "Find Familiar": "패밀리어 찾기",
  "Color Spray": "색 분사",
  "Eldritch Blast": "섬뜩한 방출",
  "Mage Hand": "마법사의 손",
  "Spider Climb": "거미 등반",
  "Water Breathing": "수중 호흡",
  "Greater Invisibility": "상급 투명화",
  "Clenched Fist": "쥔 주먹",
  "Forceful Hand": "강권의 손",
  "Grasping Hand": "붙잡는 손",
  "Interposing Hand": "가로막는 손",
  "Vampire Weaknesses": "뱀파이어 약점",
  "Echolocation": "반향정위",
  "Beak": "부리",
  "Gore": "뿔받기",
  "Heal": "치유",
  "Harm": "해악",
  "Harmed by Running Water": "흐르는 물의 해",
  "Bound to a Circle": "원에 속박됨",
  "Fascinated by Oblivion": "망각에 매혹됨",
  "Parry": "쳐내기",
  "Keen Hearing": "예리한 청각",
  "Keen Sight": "예리한 시야",
  "Standing Leap": "제자리 도약",
  "Tentacles": "촉수",
  "Hold Breath": "숨 참기",
  "Underwater Camouflage": "수중 위장",
  "Flyby": "스쳐 날기",
  "Poisonous Snake": "독사",
  "Mimicry": "흉내내기",
  "Web Sense": "거미줄 감지",
  "Web Walker": "거미줄 보행",
  "Charm": "매혹",
  "Misty Escape": "안개 탈출",
  "Unseen Servant": "보이지 않는 하인",
  "Invisible Sensor": "보이지 않는 감지체",
  "Illusionary Creature": "환영 생물",
  "Illusionary Object": "환영 물체",
  "Illusionary Sound": "환영 소리",
  "Black Tentacles": "검은 촉수",
  "Moonbeam": "달빛 기둥",
  "Grease": "기름",
  "Spike Growth": "가시 성장",
  "Insect Plague": "곤충 역병",
  "Bullseye Lantern": "집광 랜턴",
  "Hooded Lantern": "후드 랜턴",
  "Arcane Hand": "비전 손",
  "None Light": "조명 없음",
  "Vampire Spawn": "뱀파이어 스폰",
  "Zombie": "좀비",
  "Crab": "게",
  "Frog": "개구리",
  "Hawk": "매",
  "Lizard": "도마뱀",
  "Octopus": "문어",
  "Owl": "올빼미",
  "Raven": "큰까마귀",
  "Spider": "거미",
  "Weasel": "족제비",
  "Vampire": "뱀파이어",
  "Ghoul": "구울",
  "Steam Engine": "증기 엔진",
  "Dimension Door": "차원문",
  "Flame Strike": "화염 강타",
  "Aura of Vitality": "활력의 오라",
  "Bones of the Earth": "대지의 뼈",
  "Burnt Othur Fumes": "불탄 오투르 증기",
  "Cast-Off Armor, Chain Shirt": "탈착 갑옷, 체인 셔츠",
  "Cast-Off Armor, Leather": "탈착 갑옷, 가죽",
  "Coin of Decisionry": "결정의 동전",
  "Create Bonfire": "모닥불 창조",
  "Crusader's Mantle": "성전사의 망토",
  "Distort Value": "가치 왜곡",
  "Elixir of Health": "건강의 영약",
  "Find Greater Steed": "상급 군마 찾기",
  "Flame Tongue Pike": "화염의 혀 파이크",
  "Illusory Dragon": "환영의 드래곤",
  "Ice Knife": "얼음 나이프",
  "Investiture of Stone": "돌의 현신",
  "Jim's Glowing Coin": "짐의 빛나는 동전",
  "Loadstone": "자철석",
  "Longship": "롱십",
  "Mordenkainen's Sword": "모르덴카이넨의 검",
  "Musket": "머스킷",
  "Moon-Touched Sword, Glaive": "달빛 물든 검, 글레이브",
  "Power Word Fortify": "권능어 강화",
  "Quiver of Ehlonna": "엘론나의 화살통",
  "Rary's Telepathic Bond": "레어리의 텔레파시 결속",
  "Ray of Sickness": "질병의 광선",
  "Spyglass of Clairvoyance": "투시의 망원경",
  "Summon Celestial": "천계 존재 소환",
  "Summon Undead": "언데드 소환",
  "Thunderclap": "천둥손뼉",
  "Tsunami": "해일",
  "Wrath of Nature": "자연의 분노",
  "Crossbow Bolts, +2": "+2 크로스보우 볼트",
  "Armor of Cold Resistance, Padded": "냉기 저항 패디드 갑옷",
  "Armor of Force Resistance, Padded": "역장 저항 패디드 갑옷",
  "Armor of Necrotic Resistance, Breastplate": "사령 저항 브레스트플레이트 갑옷",
  "Armor of Psychic Resistance, Chain Mail": "정신 저항 체인 메일 갑옷",
  "Armor of Radiant Resistance, Splint": "광휘 저항 스플린트 갑옷",
  "Armor of Thunder Resistance, Breastplate": "천둥 저항 브레스트플레이트 갑옷",
  "Armor of Vulnerability": "취약성의 갑옷",
  "Armor of Vulnerability (Bludgeoning)": "취약성의 갑옷 (타격)",
  "Half Plate Armor of Vulnerability (Slashing)": "참격 취약성 하프 플레이트 갑옷",
  "Blood Drinker Vampire": "피를 마시는 뱀파이어",
  "Ink Cloud": "먹물 구름",
  "Keen Hearing and Sight": "예리한 청각과 시야",
  "Blood Frenzy": "피의 광란",
  "Sea Horse": "해마",
  "Children of the Night": "밤의 권속",
  "Arcane Eye": "비전의 눈",
  "Goggles of Night": "밤의 고글",
  "Spirit Guardians": "영혼 수호자",
  "Magic Circle": "마법진",
  "Incendiary Cloud": "화염성 구름",
  "Aura of Protection": "보호의 오라",
  "Folk Hero": "민중 영웅",
  "Acolyte": "수행사제",
  "Hooded Lantern Bright": "밝은 후드 랜턴",
  "Hooded Lantern Dim": "희미한 후드 랜턴"
};

const STATIC_LABEL_TRANSLATIONS = {
  "Ability Scores": "능력치",
  "Age": "연령",
  "Age.": "연령.",
  "A Hidden People.": "숨겨진 종족.",
  "Alignment": "성향",
  "Alignment.": "성향.",
  "Alignment:": "성향:",
  "Actor": "액터",
  "Actors": "액터",
  "Augmented Physicality": "강화된 신체 능력",
  "Augmented Physicality.": "강화된 신체 능력.",
  "Barterers of Lore.": "지식의 교환자들.",
  "Class & Subclass Features": "클래스 및 서브클래스 특성",
  "Class Features": "클래스 특성",
  "Classes & Class Features": "클래스 및 클래스 특성",
  "Classes": "클래스",
  "Cat's Talents.": "고양이의 재능.",
  "Changeling Instincts.": "체인질링의 본능.",
  "Changeling Names.": "체인질링 이름.",
  "Dash over difficult terrain.": "험지 위 질주.",
  "Drow Magic.": "드로우 마법.",
  "Drow Weapon Training.": "드로우 무기 수련.",
  "Environmental Adaptation": "환경 적응",
  "Environmental Adaptation.": "환경 적응.",
  "Enemy": "적",
  "Enemy:": "적:",
  "Force Field": "역장",
  "Force Field.": "역장.",
  "Feats": "특성",
  "Fleeting Fancies.": "덧없는 변덕.",
  "Gender": "성별",
  "Gender:": "성별:",
  "Harvesting Troll Blood": "트롤 피 채취",
  "Homeland Traits": "고향 특성",
  "Inherited flaw": "타고난 결함",
  "Inherited flaw:": "타고난 결함:",
  "Instant Death": "즉사",
  "Instant Death and Mutations": "즉사와 돌연변이",
  "Item": "아이템",
  "Items": "아이템",
  "Races": "종족",
  "Spells": "주문",
  "Supernatural Gifts and Rewards": "초자연적 축복과 보상",
  "Keen Senses.": "예리한 감각.",
  "Languages": "언어",
  "Languages.": "언어.",
  "Leporine Senses.": "토끼 감각.",
  "Major Mutations": "중대 돌연변이",
  "Maps": "지도",
  "Masks and Personas.": "가면과 페르소나.",
  "Minor Mutations": "경미한 돌연변이",
  "Monsters": "몬스터",
  "More Details": "자세히 보기",
  "Mutations": "돌연변이",
  "Mutations.": "돌연변이.",
  "Personality": "성격",
  "Personality:": "성격:",
  "Pictograms & How to Make a Picto": "픽토그램과 픽토 만드는 법",
  "Power": "능력",
  "Power:": "능력:",
  "Propulsion": "추진",
  "Propulsion.": "추진.",
  "Replacing the Energy Cell": "에너지 셀 교체",
  "Replacing the Energy Cell.": "에너지 셀 교체.",
  "Rulebook": "규칙서",
  "Rules": "규칙",
  "Shapechanger.": "변신체.",
  "Size": "크기",
  "Size.": "크기.",
  "Speed": "속도",
  "Speed Increase.": "속도 증가.",
  "Speed.": "속도.",
  "Spell": "주문",
  "Species": "종족",
  "Species Traits": "종족 특성",
  "Battle Smith Spells": "전투 대장장이 주문",
  "Battle Ready": "전투 준비",
  "Steel Defender": "강철 수호자",
  "Additional Attack": "추가 공격",
  "Arcane Jolt": "비전 전격",
  "Improved Defender": "향상된 수호자",
  "Superior Darkvision.": "상급 암시야.",
  "Spells": "주문",
  "Quick Build": "빠른 빌드",
  "Creating Your Artificer": "당신의 아티피서 만들기",
  "Masters of Innovation": "혁신의 대가들",
  "Fierce Rivalries": "치열한 경쟁",
  "Proficiencies": "숙련",
  "Shelter of the Faithful": "신실한 자의 안식처",
  "Storied Histories League": "유서 깊은 역사 연맹",
  "Subclasses": "서브클래스",
  "Subclasses & Class Features": "서브클래스 및 클래스 특성",
  "Sunlight Sensitivity.": "햇빛 민감성.",
  "Tabaxi Names.": "타바시 이름.",
  "Tabaxi Personality.": "타바시 성향.",
  "The Cat Lord": "고양이 군주",
  "Tinkers and Minstrels.": "땜장이와 음유시인들.",
  "Trance.": "망아 상태.",
  "Wagon Components": "마차 부품",
  "Wagon Model Features": "마차 모델 특성",
  "Wagons": "마차",
  "Wandering Outcasts.": "떠도는 이방인들.",
  "Wild Cards": "와일드 카드",
  "Words of Terror": "공포의 속삭임"
};

const SUBJECT_TRANSLATIONS = {
  "aerosaur": "에어로사우르스",
  "banshee": "밴시",
  "dog": "개",
  "dragon": "드래곤",
  "goblin": "고블린",
  "lich": "리치",
  "priest": "사제",
  "rat": "쥐",
  "soldier": "병사",
  "tabaxi": "태버시",
  "thug": "폭한",
  "trap": "함정",
  "vampire": "뱀파이어"
};

const subjectToKo = (value) => {
  const normalized = normalizeText(value).replace(/^the\s+/iu, "").toLowerCase();
  return SUBJECT_TRANSLATIONS[normalized] ?? normalizeText(value).replace(/^The\s+/u, "");
};

const splitBilingualName = (value = "") => {
  const normalized = normalizeText(value);
  const match = normalized.match(/^(.*?)(?:\s*-\s*|\s+)([A-Za-z][A-Za-z0-9:'(),/+ -]*)$/u);
  if (!match) return null;

  const translated = normalizeText(match[1]);
  const source = normalizeText(match[2]);
  if (!translated || !source || !/[가-힣]/u.test(translated)) return null;

  return { translated, source };
};

const formatBilingualName = (sourceName, translatedName) => {
  const source = normalizeText(sourceName);
  const translated = normalizeText(translatedName);
  const sourceBilingual = splitBilingualName(source);
  const translatedBilingual = splitBilingualName(translated);
  const translatedHasKorean = hasKoreanText(translated);

  if (!source || !translated) return translated;
  if (sourceBilingual) {
    return `${translatedBilingual?.translated ?? sourceBilingual.translated} - ${translatedBilingual?.source ?? sourceBilingual.source}`;
  }
  if (translatedBilingual) {
    return translatedBilingual.source === source
      ? `${translatedBilingual.translated} - ${translatedBilingual.source}`
      : source;
  }
  if (!/[A-Za-z]/u.test(source)) return translated;
  if (translated === source) return translated;
  if (translated.endsWith(source)) {
    const head = translated.slice(0, -source.length).replace(/\s*-\s*$/u, "").trim();
    if (head) return `${head} - ${source}`;
  }
  if (/[A-Za-z]/u.test(translated)) {
    return translatedHasKorean ? `${translated} - ${source}` : source;
  }

  return `${translated} - ${source}`;
};

const nameToKo = (value) => {
  const normalized = normalizeText(value);
  return COMMON_NAME_TRANSLATIONS[normalized] ?? autoTranslateName(normalized);
};

const plainLabelToKo = (value) => {
  const normalized = normalizeText(value);
  return STATIC_LABEL_TRANSLATIONS[normalized] ?? COMMON_NAME_TRANSLATIONS[normalized] ?? normalized;
};

const hasKoreanText = (value = "") => /[가-힣]/u.test(normalizeText(value));

const NAME_FRAGMENT_TRANSLATIONS = [
  ["Channel Divinity", "신성 변환"],
  ["Class Features", "클래스 특성"],
  ["Wild Card Tables", "와일드 카드 표"],
  ["Wild Cards", "와일드 카드"],
  ["Homeland Traits", "고향 특성"],
  ["Species Traits", "종족 특성"],
  ["Subclasses", "서브클래스"],
  ["Class Features", "클래스 특성"],
  ["Wagon Components", "마차 부품"],
  ["Wagon Model Features", "마차 모델 특성"],
  ["Bonus Proficiencies", "추가 숙련"],
  ["Extra Attack", "추가 공격"],
  ["Profane Bond", "불경한 결속"],
  ["Powerful Build", "강인한 체격"],
  ["Spell Storing", "주문 저장"],
  ["Hoof Attack", "발굽 공격"],
  ["Legendary Actions", "전설 행동"],
  ["Legendary Resistance", "전설적 저항"],
  ["Shapechanger", "변신체"],
  ["Regeneration", "재생"],
  ["Sunlight Sensitivity", "햇빛 민감성"],
  ["Sunlight Weakness", "햇빛 약점"],
  ["Darkvision", "암시야"],
  ["Low-Light Vision", "저조도 시야"],
  ["Natural Armor", "천연 갑옷"],
  ["Natural Weapons", "천연 무기"],
  ["Fire Breath", "화염 숨결"],
  ["Cold Breath", "냉기 숨결"],
  ["Lightning Breath", "번개 숨결"],
  ["Acid Breath", "산성 숨결"],
  ["Dragon Magic", "드래곤 마법"],
  ["Dragon Launcher", "드래곤 발사기"],
  ["Metamagic Crystal", "메타매직 수정"],
  ["Soul Orb", "영혼 구체"],
  ["Pull-Hook Launcher", "갈고리 발사기"],
  ["Precision Railbow", "정밀 레일보우"],
  ["Reinforced Net Thrower", "강화 그물 발사기"],
  ["Net Thrower", "그물 발사기"],
  ["Twin Anchor Cable Harpoon", "쌍닻 케이블 작살"],
  ["Hand Canonball", "핸드 캐논볼"],
  ["Twin Hand Canonball", "쌍수 핸드 캐논볼"],
  ["Wagon Armor", "마차 장갑"],
  ["Wall Reinforcement", "벽 보강"],
  ["Wall-Mounted Soda Lamp", "벽걸이 소다 램프"],
  ["Wall-Shelf Cot, Pair", "벽선반 침대 한 쌍"],
  ["Single Full-Length Window", "전장 단일 창문"],
  ["Two Windows", "창문 두 개"],
  ["Floor Trapdoor", "바닥 함정문"],
  ["Ceiling Hatch", "천장 해치"],
  ["Ceiling Fan", "천장 선풍기"],
  ["Cantrip Lantern", "캔트립 랜턴"],
  ["Storage", "수납"],
  ["Bookcase", "책장"],
  ["Boiler", "보일러"],
  ["Bath", "욕조"],
  ["Basin", "세면대"],
  ["Garden", "정원"],
  ["Forge", "대장간"],
  ["Forge Bequeathed", "대장간 유산"],
  ["Laundry Machine", "세탁기"],
  ["Toilet Closet", "화장실 칸"],
  ["Fold-Out Patio", "접이식 파티오"],
  ["Fold-Out Counter", "접이식 카운터"],
  ["Retrieval Band", "회수 밴드"],
  ["Recall Canopy", "회수 캐노피"],
  ["Rain Cover", "빗덮개"],
  ["Rain Wheels", "우천 바퀴"],
  ["Cannon", "대포"],
  ["Ballista", "발리스타"],
  ["Blast Spike", "폭발 스파이크"],
  ["Cascade Anvil", "폭포 모루"],
  ["Absorbing Ram", "흡수식 충각"],
  ["Acid Smokescreen", "산성 연막"],
  ["Climate Control", "기후 조절"],
  ["Restful Interior", "안락한 내부"],
  ["Serene Sanctum", "고요한 성소"],
  ["Gyrostable Lounge", "자이로 안정 라운지"],
  ["Gyrostable Medicine Cabinet", "자이로 안정 약장"],
  ["Gyrostable Wine-Rack", "자이로 안정 와인 선반"],
  ["Transmutation-Powered Flywheel", "변환 동력 플라이휠"],
  ["Steam-Powered Flywheel", "증기 동력 플라이휠"],
  ["Wagon-Powered Flywheel", "마차 동력 플라이휠"],
  ["Arcana Blinding", "비전 실명화"],
  ["Astral Anchor", "아스트랄 닻"],
  ["Bubble Armor", "거품 갑옷"],
  ["Bubble Soap", "거품 비누"],
  ["Carrion Staff", "송장 지팡이"],
  ["Deck of the Cheated", "속임수의 덱"],
  ["Ring of Energy Conversion", "에너지 전환 반지"],
  ["Lantern of Unnature's Revealing", "부자연의 폭로 랜턴"],
  ["Potion of Appending", "추가의 물약"],
  ["Teapot of Rooted Memory", "뿌리내린 기억의 찻주전자"],
  ["Stone of Six Strengths", "여섯 힘의 돌"],
  ["Soil of Fecundity", "비옥함의 흙"],
  ["Blanket of Safekeeping", "보호의 담요"],
  ["Neckwear of Nativeness", "고향의 목장식"],
  ["Bulls-Eye Star", "불스아이 스타"],
  ["Single-Hand Rein", "한손 고삐"],
  ["Autotrotter Spurs", "오토트로터 박차"],
  ["Wainwright's Tools", "마차공 도구"],
  ["Maintenance Kit", "정비 키트"],
  ["Scroll of Self-Teaching", "자가 학습 두루마리"],
  ["Very Rare", "매우 희귀"],
  ["Uncommon", "비범"],
  ["Common", "일반"],
  ["Rare", "희귀"],
  ["Moment of Resolve", "결의의 순간"],
  ["Sphere of Shadows", "그림자의 구체"],
  ["Forecast Harvest", "수확 예보"],
  ["Stroke of Good Luck", "행운의 일격"],
  ["Borrow Concentration", "집중 빌리기"],
  ["Heart's Home", "마음의 고향"],
  ["Swift Invisibility", "신속 투명화"],
  ["Stagecraft", "무대 기술"],
  ["Summon Subject", "대상 소환"],
  ["Speaking Page", "말하는 페이지"],
  ["Create Thrall", "권속 창조"],
  ["Crossworld Well", "이세계 우물"],
  ["Where's Varasta?", "바라스타는 어디에?"],
  ["Forget I Said That", "내가 한 말은 잊어라"],
  ["Whispers of the Netherworld", "저승의 속삭임"],
  ["Path of", "길"],
  ["Way of the", "수행의 길"],
  ["Circle of the", "의 서클"],
  ["College of", "대학"],
  ["Oath of", "맹세"],
  ["Mercy Domain", "자비 권역"],
  ["The Main Event", "메인 이벤트"],
  ["The Ghost God", "유령신"],
  ["Somnomancy", "수면술"],
  ["Carrion Master", "송장술 달인"],
  ["Fell Infiltrator", "흉악한 잠입자"],
  ["Wraith-Touched", "망령 물든 자"],
  ["Zombie-Touched", "좀비 물든 자"],
  ["Shadow-Touched", "그림자 물든 자"],
  ["Ghoul-Touched", "구울 물든 자"],
  ["Mummy-Touched", "미라 물든 자"],
  ["Skeleton-Touched", "해골 물든 자"],
  ["Fiend-Inhabited Vampire", "악마 깃든 뱀파이어"],
  ["Fiend-Vessel Spawn", "악마 그릇 새끼"],
  ["Horse, Beylik Draydriver", "말, 베일릭 화물마"],
  ["Axe Beak, Jackal-Reared", "도끼부리, 자칼이 기른 개체"],
  ["A Space of One's Own", "나만의 공간"],
  ["A Mind Outside the Box", "틀을 벗어난 정신"],
  ["A Mean Right Hook", "매서운 오른손 훅"],
  ["A Head for Knots", "매듭에 밝은 머리"],
  ["The Scholar", "학자"],
  ["The Steward", "청지기"],
  ["The Scoundrel", "악한"],
  ["The Dread Compromise Spreads", "두려운 타협의 확산"],
  ["The Aurora Tradition", "오로라의 전통"],
  ["The Training of Privilege", "특권의 수련"],
  ["The Oric Shipbuilding Tradition", "오릭 조선 전통"],
  ["The Bouncer’s Kid", "문지기의 아이"],
  ["Way of the Kidney Punch", "신장 타격의 길"],
  ["Path of Thought's Tremor", "사념 진동의 길"],
  ["Circle of the Wild Card", "와일드 카드의 서클"],
  ["College of Witches", "마녀 대학"],
  ["Oath of Revolution", "혁명의 맹세"],
  ["Bovine", "우류"],
  ["Canine", "개과"],
  ["Cervine", "사슴류"],
  ["Celerine", "셀러린"],
  ["Dragon", "드래곤"],
  ["Equine", "말류"],
  ["Feline", "고양잇과"],
  ["Laetine", "레이틴"],
  ["Ligonine", "리고닌"],
  ["Murine", "쥐류"],
  ["Ovine", "양류"],
  ["Tenebrine", "테네브린"],
  ["Ursine", "곰류"],
  ["Vulpine", "여우류"],
  ["Armadillo", "아르마딜로"],
  ["Bear", "곰"],
  ["Bison", "들소"],
  ["Dog", "개"],
  ["Donkey", "당나귀"],
  ["Elk", "엘크"],
  ["Ferret", "페럿"],
  ["Horse", "말"],
  ["Bat", "박쥐"],
  ["Kobold", "코볼트"],
  ["Jackal", "자칼"],
  ["Mole", "두더지"],
  ["Monarch", "군주"],
  ["Mouse", "생쥐"],
  ["Otter", "수달"],
  ["Possum", "포섬"],
  ["Rabbit", "토끼"],
  ["Raccoon", "라쿤"],
  ["Rat", "쥐"],
  ["Scholar", "학자"],
  ["Sheep", "양"],
  ["Sloth", "나무늘보"],
  ["Squirrel", "다람쥐"],
  ["Whispering", "속삭임"],
  ["Wolf", "늑대"],
  ["Brethren", "형제단"]
];

const NAME_SUFFIX_TRANSLATIONS = {
  "Blue": "파랑",
  "Green": "초록",
  "Purple": "보라",
  "Red": "빨강",
  "Yellow": "노랑",
  "Pink": "분홍",
  "Blue Teal": "청록/파랑",
  "Blue Yellow": "파랑/노랑",
  "Purple Green": "보라/초록",
  "No preset": "프리셋 없음"
};

const BACKGROUND_LABEL_TRANSLATIONS = {
  "Defining Event": "결정적 사건",
  "Personality Trait": "성격 특성",
  "Ideal": "이상",
  "Flaw": "결점",
  "Bond": "유대",
  "Specialty": "전문 분야",
  "Suggested Characteristics": "권장 성향"
};

const autoTranslateName = (value) => {
  let output = normalizeText(value);
  if (!output || hasKoreanText(output) || !/[A-Za-z]/u.test(output)) return output;

  const unidentifiedMatch = output.match(/^Unidentified\s+(.+)$/u);
  if (unidentifiedMatch) {
    const translatedTail = nameToKo(unidentifiedMatch[1]);
    if (translatedTail !== unidentifiedMatch[1]) {
      return `미식별된 ${translatedTail}`;
    }
  }

  const backgroundMatch = output.match(/^Background:\s*([^:]+):\s*(.+)$/u);
  if (backgroundMatch) {
    const translatedBackground = nameToKo(backgroundMatch[1]);
    const translatedLabel = BACKGROUND_LABEL_TRANSLATIONS[backgroundMatch[2]] ?? nameToKo(backgroundMatch[2]);
    if (translatedBackground !== backgroundMatch[1] || translatedLabel !== backgroundMatch[2]) {
      return `배경: ${translatedBackground}: ${translatedLabel}`;
    }
  }

  const suffixMatch = output.match(/^(.*)\s+\(([^()]+)\)$/u);
  if (suffixMatch) {
    const translatedStem = nameToKo(suffixMatch[1]);
    const translatedSuffix = NAME_SUFFIX_TRANSLATIONS[suffixMatch[2]] ?? nameToKo(suffixMatch[2]);
    if (translatedStem !== suffixMatch[1] || translatedSuffix !== suffixMatch[2]) {
      return `${translatedStem} (${translatedSuffix})`;
    }
  }

  for (const [source, target] of NAME_FRAGMENT_TRANSLATIONS) {
    output = output.replaceAll(source, target);
  }

  output = output
    .replace(/\bAttack\b/gu, "공격")
    .replace(/\bArmor\b/gu, "갑옷")
    .replace(/\bArmored\b/gu, "장갑형")
    .replace(/\bArms\b/gu, "무장")
    .replace(/\bAudience\b/gu, "관객")
    .replace(/\bAura\b/gu, "오라")
    .replace(/\bAutomatic\b/gu, "자동")
    .replace(/\bAbsorbing\b/gu, "흡수")
    .replace(/\bBlade\b/gu, "칼날")
    .replace(/\bBones\b/gu, "뼈")
    .replace(/\bBolt\b/gu, "볼트")
    .replace(/\bBullets\b/gu, "탄환")
    .replace(/\bBarrage\b/gu, "탄막")
    .replace(/\bBlood\b/gu, "피")
    .replace(/\bBond\b/gu, "결속")
    .replace(/\bBody\b/gu, "몸체")
    .replace(/\bCard\b/gu, "카드")
    .replace(/\bCat\b/gu, "고양이")
    .replace(/\bCaution\b/gu, "경계")
    .replace(/\bCandle\b/gu, "초")
    .replace(/\bCalls\b/gu, "위기")
    .replace(/\bCharge\b/gu, "돌진")
    .replace(/\bChampion\b/gu, "챔피언")
    .replace(/\bChest\b/gu, "상자")
    .replace(/\bChime\b/gu, "차임")
    .replace(/\bClaw\b/gu, "발톱")
    .replace(/\bCelestial\b/gu, "천계")
    .replace(/\bChain\b/gu, "체인")
    .replace(/\bCold\b/gu, "냉기")
    .replace(/\bCloud\b/gu, "구름")
    .replace(/\bClose\b/gu, "아슬한")
    .replace(/\bConjure\b/gu, "소환")
    .replace(/\bContract\b/gu, "계약")
    .replace(/\bCounter\b/gu, "역추")
    .replace(/\bCourage\b/gu, "용기")
    .replace(/\bCrate\b/gu, "상자")
    .replace(/\bCreate\b/gu, "창조")
    .replace(/\bCrusader'?s\b/gu, "성전사의")
    .replace(/\bDance\b/gu, "춤")
    .replace(/\bCuriosity\b/gu, "호기심")
    .replace(/\bDaydream\b/gu, "백일몽")
    .replace(/\bDeath\b/gu, "죽음")
    .replace(/\bDistort\b/gu, "왜곡")
    .replace(/\bDream\b/gu, "꿈")
    .replace(/\bDoor\b/gu, "문")
    .replace(/\bDrop\b/gu, "낙하")
    .replace(/\bEarth\b/gu, "대지")
    .replace(/\bElemental\b/gu, "원소")
    .replace(/\bEvening\b/gu, "저녁")
    .replace(/\bEssence\b/gu, "정수")
    .replace(/\bEye\b/gu, "눈")
    .replace(/\bFeather\b/gu, "깃털")
    .replace(/\bFeet\b/gu, "발")
    .replace(/\bFire\b/gu, "불")
    .replace(/\bForce\b/gu, "역장")
    .replace(/\bFootlocker\b/gu, "풋락커")
    .replace(/\bFocus\b/gu, "집중")
    .replace(/\bFortify\b/gu, "강화")
    .replace(/\bFortress\b/gu, "요새")
    .replace(/\bFriendship\b/gu, "우정")
    .replace(/\bFriend\b/gu, "친구")
    .replace(/\bGarden\b/gu, "정원")
    .replace(/\bGate\b/gu, "관문")
    .replace(/\bGleaming\b/gu, "광채")
    .replace(/\bGreater\b/gu, "상급")
    .replace(/\bGrace\b/gu, "은총")
    .replace(/\bGuard\b/gu, "수호")
    .replace(/\bHail\b/gu, "우박")
    .replace(/\bHarvest\b/gu, "수확")
    .replace(/\bHeart\b/gu, "심장")
    .replace(/\bHidden\b/gu, "숨겨진")
    .replace(/\bHook\b/gu, "갈고리")
    .replace(/\bHunger\b/gu, "굶주림")
    .replace(/\bHunter\b/gu, "사냥꾼")
    .replace(/\bIce\b/gu, "얼음")
    .replace(/\bIllusory\b/gu, "환영의")
    .replace(/\bInterior\b/gu, "내부")
    .replace(/\bInvestiture\b/gu, "현신")
    .replace(/\bJump\b/gu, "도약")
    .replace(/\bKid\b/gu, "아이")
    .replace(/\bKnife\b/gu, "나이프")
    .replace(/\bLamp\b/gu, "램프")
    .replace(/\bLadder\b/gu, "사다리")
    .replace(/\bLaser\b/gu, "레이저")
    .replace(/\bLeather\b/gu, "가죽")
    .replace(/\bLife\b/gu, "생명")
    .replace(/\bLightning\b/gu, "번개")
    .replace(/\bLock\b/gu, "잠금")
    .replace(/\bLoft\b/gu, "다락")
    .replace(/\bLuck\b/gu, "행운")
    .replace(/\bMagic\b/gu, "마법")
    .replace(/\bMail\b/gu, "메일")
    .replace(/\bMantle\b/gu, "망토")
    .replace(/\bMansion\b/gu, "대저택")
    .replace(/\bMemory\b/gu, "기억")
    .replace(/\bMercy\b/gu, "자비")
    .replace(/\bMind\b/gu, "정신")
    .replace(/\bMoon\b/gu, "달")
    .replace(/\bMoon\b/gu, "달")
    .replace(/\bMusket\b/gu, "머스킷")
    .replace(/\bNight\b/gu, "밤")
    .replace(/\bNature\b/gu, "자연")
    .replace(/\bNecrotic\b/gu, "사령")
    .replace(/\bOrb\b/gu, "구체")
    .replace(/\bPadded\b/gu, "패디드")
    .replace(/\bPiercing\b/gu, "관통")
    .replace(/\bPlate\b/gu, "플레이트")
    .replace(/\bPotion\b/gu, "물약")
    .replace(/\bPoison\b/gu, "독")
    .replace(/\bPower\b/gu, "권능")
    .replace(/\bPrivacy\b/gu, "사생활")
    .replace(/\bPrivate\b/gu, "개인의")
    .replace(/\bPsychic\b/gu, "정신")
    .replace(/\bRadiant\b/gu, "광휘")
    .replace(/\bRay\b/gu, "광선")
    .replace(/\bResistance\b/gu, "저항")
    .replace(/\bResolve\b/gu, "결의")
    .replace(/\bRevolver\b/gu, "리볼버")
    .replace(/\bRifle\b/gu, "라이플")
    .replace(/\bSanctum\b/gu, "성소")
    .replace(/\bSchool\b/gu, "학파")
    .replace(/\bScroll\b/gu, "두루마리")
    .replace(/\bShadow\b/gu, "그림자")
    .replace(/\bShard\b/gu, "파편")
    .replace(/\bShirt\b/gu, "셔츠")
    .replace(/\bShelf\b/gu, "선반")
    .replace(/\bSilence\b/gu, "침묵")
    .replace(/\bSickness\b/gu, "질병")
    .replace(/\bSnow\b/gu, "눈")
    .replace(/\bSolar\b/gu, "태양")
    .replace(/\bSoul\b/gu, "영혼")
    .replace(/\bSpell\b/gu, "주문")
    .replace(/\bSplint\b/gu, "스플린트")
    .replace(/\bSpirit\b/gu, "영혼")
    .replace(/\bStar\b/gu, "별")
    .replace(/\bStone\b/gu, "돌")
    .replace(/\bStrike\b/gu, "강타")
    .replace(/\bStudded\b/gu, "스터디드")
    .replace(/\bSummon\b/gu, "소환")
    .replace(/\bStorm\b/gu, "폭풍")
    .replace(/\bStrike\b/gu, "강타")
    .replace(/\bSun\b/gu, "태양")
    .replace(/\bSword\b/gu, "검")
    .replace(/\bTable\b/gu, "테이블")
    .replace(/\bTattoo\b/gu, "문신")
    .replace(/\bTank\b/gu, "탱크")
    .replace(/\bTail\b/gu, "꼬리")
    .replace(/\bTelepathic\b/gu, "텔레파시")
    .replace(/\bThorns\b/gu, "가시")
    .replace(/\bThunder\b/gu, "천둥")
    .replace(/\bThunderous\b/gu, "천둥의")
    .replace(/\bThoughts\b/gu, "생각")
    .replace(/\bThrower\b/gu, "발사기")
    .replace(/\bTouch\b/gu, "손길")
    .replace(/\bTrail\b/gu, "궤적")
    .replace(/\bTruth\b/gu, "진실")
    .replace(/\bTsunami\b/gu, "해일")
    .replace(/\bUndead\b/gu, "언데드")
    .replace(/\bValue\b/gu, "가치")
    .replace(/\bVicious\b/gu, "잔혹한")
    .replace(/\bVitality\b/gu, "활력")
    .replace(/\bVulnerability\b/gu, "취약성")
    .replace(/\bWindow\b/gu, "창문")
    .replace(/\bViolence\b/gu, "폭력")
    .replace(/\bVision\b/gu, "시야")
    .replace(/\bWall\b/gu, "벽")
    .replace(/\bWard\b/gu, "수호막")
    .replace(/\bWheels\b/gu, "바퀴")
    .replace(/\bWings\b/gu, "날개")
    .replace(/\bWinter\b/gu, "겨울")
    .replace(/\bWind\b/gu, "바람")
    .replace(/\bWord\b/gu, "언어")
    .replace(/\bof the\b/gu, "의")
    .replace(/\bof\b/gu, "의")
    .replace(/\band\b/gu, "및")
    .replace(/\s{2,}/gu, " ")
    .trim();

  const outsideParentheses = output.replace(/\([^)]*\)/gu, "");
  if (/[A-Za-z]/u.test(outsideParentheses)) {
    return normalizeText(value);
  }

  return output;
};

const preferGeneratedText = (currentValue, generatedValue, originalValue = "") => {
  const current = normalizeText(currentValue);
  const generated = normalizeText(generatedValue);
  const original = normalizeText(originalValue);

  if (!generated || generated === original) return currentValue;
  if (!current) return generatedValue;

  const currentHasKorean = hasKoreanText(current);
  const generatedHasKorean = hasKoreanText(generated);
  const currentEnglishOnly = /[A-Za-z]/u.test(current) && !currentHasKorean;
  const generatedEnglishOnly = /[A-Za-z]/u.test(generated) && !generatedHasKorean;

  if (generatedHasKorean && !currentHasKorean) return generatedValue;
  if (generatedHasKorean && currentEnglishOnly) return generatedValue;
  if (generatedHasKorean && currentHasKorean && /[A-Za-z]/u.test(current) && !generatedEnglishOnly) return generatedValue;

  return currentValue;
};

const abilityToKo = (value) => {
  switch (normalizeText(value).toLowerCase()) {
    case "strength":
      return "근력";
    case "dexterity":
      return "민첩";
    case "constitution":
      return "건강";
    case "intelligence":
      return "지능";
    case "wisdom":
      return "지혜";
    case "charisma":
      return "매력";
    default:
      return normalizeText(value);
  }
};

const damageTypeToKo = (value, { linked = false } = {}) => {
  const normalized = normalizeText(value).toLowerCase();
  let translated = "";
  switch (normalized) {
    case "acid":
      translated = "산성";
      break;
    case "bludgeoning":
      translated = "타격";
      break;
    case "cold":
      translated = "냉기";
      break;
    case "fire":
      translated = "화염";
      break;
    case "force":
      translated = "역장";
      break;
    case "lightning":
      translated = "번개";
      break;
    case "necrotic":
      translated = "강령";
      break;
    case "piercing":
      translated = "관통";
      break;
    case "poison":
      translated = "독";
      break;
    case "psychic":
      translated = "정신";
      break;
    case "radiant":
      translated = "광휘";
      break;
    case "slashing":
      translated = "참격";
      break;
    case "thunder":
      translated = "천둥";
      break;
    default:
      translated = normalizeText(value);
      break;
  }

  if (!linked || !translated || translated === normalizeText(value)) return translated;
  return `&Reference[${normalized}]{${translated}}`;
};

const colorToKo = (value) => {
  switch (normalizeText(value).toLowerCase()) {
    case "green":
      return "녹색";
    case "blue":
      return "청색";
    case "red":
      return "적색";
    case "white":
      return "백색";
    case "yellow":
      return "황색";
    case "black":
      return "흑색";
    case "violet":
      return "보랏빛";
    case "silver":
      return "은색";
    case "gold":
      return "금색";
    case "orange":
      return "주황색";
    default:
      return normalizeText(value);
  }
};

const escapeHtml = (value) => {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
};

const LONGFORM_DESCRIPTION_REPLACEMENTS = [
  [
    "Bards of the College of Spirits seek tales with inherent power—be they legends, histories, or fictions—and bring their subjects to life. Using occult trappings, these bards conjure spiritual embodiments of powerful forces to change the world once more. Such spirits are capricious, though, and what a bard summons isn't always entirely under their control.",
    "영혼 학파의 바드들은 전설이든 역사이든 허구이든, 본래 힘을 지닌 이야기를 찾아내고 그 이야기의 주제를 현실로 불러냅니다. 이들은 오컬트적인 도구를 사용해 강력한 힘의 영적 구현을 소환하여 세상을 다시 움직입니다. 하지만 그러한 영혼들은 변덕스럽기에, 바드가 불러낸 존재가 언제나 완전히 통제되는 것은 아닙니다."
  ],
  [
    "You can reach out to spirits to guide you and others. You learn the @spell[guidance] cantrip, which doesn't count against the number of bard cantrips you know. For you, it has a range of 60 feet when you cast it.",
    "당신은 영혼에게 손을 뻗어 자신과 다른 이들을 인도하게 할 수 있습니다. 당신은 @spell[guidance] 캔트립을 배우며, 이는 당신이 아는 바드 캔트립 수에 포함되지 않습니다. 또한 당신이 이 주문을 시전할 때 사거리는 60피트가 됩니다."
  ],
  [
    "You employ tools that aid you in channeling spirits, be they historical figures or fictional archetypes. You can use the following objects as a spellcasting focus for your bard spells: a candle, crystal ball, skull, spirit board, or @deck[tarokka deck|CoS].",
    "당신은 역사적 인물이든 허구적 원형이든 영혼을 매개하는 데 도움이 되는 도구를 사용합니다. 당신은 다음 물건들을 바드 주문의 주문시전 매개체로 사용할 수 있습니다: 촛불, 수정 구슬, 해골, 영혼판, 또는 @deck[tarokka deck|CoS]."
  ],
  [
    "You reach out to spirits who tell their tales through you. While you are holding your Spiritual Focus, you can use a bonus action to expend one use of your Bardic Inspiration and roll on the Spirit Tales table using your Bardic Inspiration die to determine the tale the spirits direct you to tell. You retain the tale in mind until you bestow the tale's effect or you finish a short or long rest.",
    "당신은 자신을 통해 이야기를 들려주는 영혼들에게 손을 뻗습니다. Spiritual Focus를 들고 있는 동안, 당신은 보너스 액션으로 Bardic Inspiration 사용 횟수 1회를 소비하고, 그 주사위를 사용해 Spirit Tales 표를 굴려 영혼들이 당신에게 전하게 하는 이야기를 결정할 수 있습니다. 그렇게 얻은 이야기는 그 효과를 부여하거나 짧은 휴식 또는 긴 휴식을 마칠 때까지 당신의 마음속에 남아 있습니다."
  ],
  [
    "Bards believe the cosmos is a work of art-the creation of the first dragons and gods. That creative work included harmonies that continue to resound through existence today, a power known as the Song of Creation. The bards of the College of Creation draw on that primeval song through dance, music, and poetry, and their teachers share this lesson:",
    "바드들은 우주를 첫 번째 드래곤들과 신들이 빚어 낸 예술 작품이라 여긴다. 그 창조의 작업에는 오늘날까지 존재 전반에 울려 퍼지는 화음이 담겨 있었고, 그 힘은 창조의 노래라 불린다. 창조 학파의 바드들은 춤, 음악, 시를 통해 그 태고의 노래를 끌어내며, 그들의 스승들은 이렇게 가르친다:"
  ],
  [
    "Whenever you give a creature a Bardic Inspiration die, you can utter a note from the Song of Creation to create a Tiny mote of potential, which orbits within 5 feet of that creature. The mote is intangible and invulnerable, and it lasts until the Bardic Inspiration die is lost. The mote looks like a musical note, a star, a flower, or another symbol of art or life that you choose.",
    "당신이 크리처 하나에게 바드의 고양감 주사위를 줄 때마다, 창조의 노래에서 한 음을 흘려 Tiny 크기의 가능성의 빛무리를 만들어 그 크리처 5피트 이내를 맴돌게 할 수 있습니다. 그 빛무리는 실체가 없고 피해를 입지 않으며, 바드의 고양감 주사위가 사라질 때까지 지속됩니다. 그 모습은 당신이 선택한 음표, 별, 꽃, 또는 예술이나 생명을 상징하는 다른 표식으로 나타납니다."
  ],
  [
    "As an action, you can channel the magic of the Song of Creation to create one nonmagical item of your choice in an unoccupied space within 10 feet of you. The item must appear on a surface or in a liquid that can support it. The gp value of the item can't be more than 20 times your bard level, and the item must be Medium or smaller. The item glimmers softly, and a creature can faintly hear music when touching it. The created item disappears after a number of hours equal to your proficiency bonus. For examples of items you can create, see the equipment chapter of the Player's Handbook .",
    "행동으로 창조의 노래의 마법을 이끌어, 당신의 10피트 이내 비어 있는 공간에 원하는 비마법 물품 하나를 만들어 낼 수 있습니다. 그 물품은 그것을 지탱할 수 있는 표면 위나 액체 속에 나타나야 합니다. 그 물품의 gp 가치는 당신의 바드 레벨의 20배를 넘을 수 없고, 크기는 Medium 이하여야 합니다. 그 물품은 은은하게 반짝이며, 크리처가 손을 대면 희미한 음악 소리를 들을 수 있습니다. 만들어진 물품은 당신의 숙련 보너스와 같은 시간 수가 지나면 사라집니다. 만들 수 있는 물품의 예시는 Player's Handbook의 장비 장을 참고하세요."
  ],
  [
    "As an action, you can animate one Large or smaller nonmagical item within 30 feet of you that isn't being worn or carried. The animate item uses the @creature[Dancing Item|TCE] stat block, which uses your proficiency bonus (PB). The item is friendly to you and your companions and obeys your commands. It lives for 1 hour, until it is reduced to 0 hit points, or until you die.",
    "행동으로, 당신의 30피트 이내에 있으며 누구도 착용하거나 들고 있지 않은 Large 이하의 비마법 물품 하나를 움직이게 할 수 있습니다. 그 물품은 @creature[Dancing Item|TCE] 능력치 블록을 사용하며, 그 수치에는 당신의 숙련 보너스(PB)가 반영됩니다. 그 물품은 당신과 당신의 동료들에게 우호적이며 당신의 명령을 따릅니다. 그것은 1시간 동안, HP가 0이 될 때까지, 또는 당신이 죽을 때까지 살아 움직입니다."
  ],
  [
    "The College of Glamour is the home of bards who mastered their craft in the vibrant realm of the Feywild or under the tutelage of someone who dwelled there. The captivating magic of the Feywild is woven into the music and dance of these bards.",
    "매혹 학파는 페이와일드의 생기 넘치는 영역에서 기예를 완성했거나, 그곳에 머문 이의 가르침 아래 수련한 바드들의 터전이다. 페이와일드의 매혹적인 마력은 이 바드들의 음악과 춤 속에 짜여 들어 있다."
  ],
  [
    "The bards of this college are regarded with a mixture of awe and fear. Their performances are the stuff of legend. These bards are so eloquent that a speech or song that they perform can cause captors to release the bard unharmed and can lull a furious monster into a deep slumber. The same magic that allows them to quell beasts can also bend minds. Villainous bards of this college can leech off a community for weeks, abusing their magic to turn their hosts into thralls.",
    "이 학파의 바드들은 경외와 두려움이 뒤섞인 시선으로 여겨진다. 그들의 공연은 전설의 소재가 된다. 이들은 너무도 유려하여, 그들이 들려주는 연설이나 노래 하나만으로도 포로를 무사히 풀어 주게 만들고, 격노한 괴물을 깊은 잠에 빠뜨릴 수도 있다. 짐승을 가라앉히는 그 동일한 마력은 정신까지 굽힐 수 있다. 사악한 이 학파의 바드들은 그 힘을 남용해 공동체에 몇 주씩 빌붙으며, 자신들을 맞아 준 이들을 노예처럼 부릴 수도 있다."
  ],
  [
    "When you join the College of Glamour at 3rd level, you gain the ability to weave a song of fey magic that imbues your allies with vigor and speed.",
    "3레벨에 매혹 학파에 들어서면, 아군에게 활력과 속도를 불어넣는 페이 마법의 노래를 엮는 능력을 얻는다."
  ],
  [
    "As a bonus action, you can expend one use of your Bardic Inspiration to grant yourself a wondrous appearance. When you do so, choose a number of creatures you can see and who can see you within 60 feet of you, up to a number equal to your Charisma modifier (minimum of one). Each of them gains 5 temporary hit points. When a creature gains these temporary hit points, it can immediately use its reaction to move up to its speed, without provoking opportunity attacks.",
    "보너스 행동으로 바드 영감 사용 횟수 1회를 소비해 스스로에게 경이로운 외형을 부여할 수 있다. 그렇게 하면, 자신으로부터 60피트 이내에서 서로를 볼 수 있는 생물을 카리스마 수정치만큼 선택한다(최소 1명). 선택된 각 생물은 임시 HP 5를 얻는다. 이 임시 HP를 얻은 생물은 즉시 반응행동을 사용해 자신의 이동속도만큼 이동할 수 있으며, 이 이동은 기회공격을 유발하지 않는다."
  ],
  [
    "The number of temporary hit points increases when you reach certain levels in this class, increasing to 8 at 5th level, 11 at 10th level, and 14 at 15th level.",
    "이 임시 HP는 이 클래스의 레벨이 오를수록 증가하여, 5레벨에 8, 10레벨에 11, 15레벨에 14가 된다."
  ],
  [
    "Bladesingers master a tradition of wizardry that incorporates swordplay and dance. Originally created by elves, this tradition has been adopted by non-elf practitioners, who honor and expand on the elven ways.",
    "블레이드싱어는 검술과 춤을 결합한 마법 전통을 익힌다. 본래 엘프들이 만든 전통이지만, 이제는 엘프가 아닌 수행자들도 이를 받아들여 엘프의 방식을 기리고 확장해 나가고 있다."
  ],
  [
    "In combat, a bladesinger uses a series of intricate, elegant maneuvers that fend off harm and allow the bladesinger to channel magic into devastating attacks and a cunning defense. Many who have observed a bladesinger at work remember the display as one of the more beautiful experiences in their life, a glorious dance accompanied by a singing blade.",
    "전투에서 블레이드싱어는 정교하고 우아한 일련의 동작으로 위해를 흘려 보내고, 파괴적인 공격과 교묘한 방어에 마법을 실어 보낸다. 블레이드싱어의 전투를 본 많은 이들은 그것을 삶에서 가장 아름다운 광경 중 하나로 기억한다. 노래하는 칼날과 함께하는 장엄한 춤이기 때문이다."
  ],
  [
    "Starting at 2nd level, you can invoke a secret elven magic called the Bladesong, provided you aren't wearing medium or heavy armor or using a shield. It graces you with supernatural speed, agility, and focus.",
    "2레벨부터, 중형갑옷이나 중갑을 입지 않았고 방패를 사용하지 않는 한 블레이드송이라 불리는 비밀스러운 엘프 마법을 불러낼 수 있습니다. 블레이드송은 당신에게 초자연적인 속도, 민첩성, 집중력을 부여합니다."
  ],
  [
    "From its inception as a martial and magical art, Bladesinging has been tied to the sword, more specifically the longsword. Yet many generations of study gave rise to various styles of Bladesinging based on the melee weapon employed. The techniques of these styles are passed from master to students in small schools, some of which have a building dedicated to instruction. Even the newest styles are hundreds of years old, but are still taught by their original creators due to the long lives of elves. Most schools of Bladesinging are in Evermeet or Evereska. One was started in Myth Drannor, but the city's destruction has scattered those students who survived.",
    "무예이자 마법 예술로 출발한 블레이드싱잉은 언제나 검, 그중에서도 특히 롱소드와 결부되어 왔습니다. 그러나 수많은 세대에 걸친 연구는 사용되는 근접 무기에 따라 여러 블레이드싱잉 양식을 탄생시켰습니다. 이 양식들의 기법은 작은 학교들에서 스승에게서 제자로 전해지며, 그중 일부는 수련만을 위한 건물을 따로 두고 있습니다. 가장 새로운 양식조차 수백 년의 역사를 지니지만, 엘프의 긴 수명 덕분에 여전히 그 창시자들이 직접 가르치고 있습니다. 블레이드싱잉 학교의 대부분은 에버미트나 에버레스카에 있으며, 한 학교는 미스 드라노르에서 시작되었으나 도시의 멸망과 함께 살아남은 제자들이 흩어졌습니다."
  ],
  [
    "The gods of knowledge—including @deity[Oghma], @deity[Boccob|Greyhawk], @deity[Gilean|Dragonlance], @deity[Aureon|Eberron], and @deity[Thoth|Egyptian]—value learning and understanding above all. Some teach that knowledge is to be gathered and shared in libraries and universities, or promote the practical knowledge of craft and invention. Some deities hoard knowledge and keep its secrets to themselves. And some promise their followers that they will gain tremendous power if they unlock the secrets of the multiverse. Followers of these gods study esoteric lore, collect old tomes, delve into the secret places of the earth, and learn all they can. Some gods of knowledge promote the practical knowledge of craft and invention, including smith deities like @deity[Gond], @deity[Reorx|Dragonlance], @deity[Onatar|Eberron], @deity[Moradin|Nonhuman], @deity[Hephaestus|Greek], and @deity[Goibhniu|Celtic].",
    "지식의 신들—@deity[Oghma], @deity[Boccob|Greyhawk], @deity[Gilean|Dragonlance], @deity[Aureon|Eberron], @deity[Thoth|Egyptian] 등을 포함한—은 무엇보다도 배움과 이해를 중시합니다. 어떤 신들은 지식이 도서관과 대학에서 모이고 나뉘어야 한다고 가르치거나, 기술과 발명의 실천적 지식을 장려합니다. 어떤 신들은 지식을 독점하고 비밀을 자신만 알고 있으려 하며, 또 어떤 신들은 다중우주의 비밀을 풀어내면 엄청난 힘을 얻게 되리라고 신도들에게 약속합니다. 이 신들을 따르는 자들은 난해한 전승을 연구하고, 오래된 고서를 수집하며, 대지의 비밀스러운 장소들을 탐사하고, 배울 수 있는 모든 것을 익히려 합니다. 또한 일부 지식의 신들은 @deity[Gond], @deity[Reorx|Dragonlance], @deity[Onatar|Eberron], @deity[Moradin|Nonhuman], @deity[Hephaestus|Greek], @deity[Goibhniu|Celtic] 같은 대장장이 신들을 통해 기술과 발명의 실천적 지식을 장려합니다."
  ],
  [
    "The twilit transition from light into darkness often brings calm and even joy, as the day's labors end and the hours of rest begin. The darkness can also bring terrors, but the gods of twilight guard against the horrors of the night.",
    "빛에서 어둠으로 넘어가는 황혼의 이행은 하루의 노동이 끝나고 휴식의 시간이 시작되기에, 흔히 평온과 때로는 기쁨마저 가져옵니다. 어둠은 공포를 가져올 수도 있지만, 황혼의 신들은 밤의 공포로부터 이들을 지켜 줍니다."
  ],
  [
    "Clerics who serve these deities-examples of which appear on the Twilight Deities table-bring comfort to those who seek rest and protect them by venturing into the encroaching darkness to ensure that the dark is a comfort, not a terror.",
    "Twilight Deities 표에 예시가 실린 이러한 신들을 섬기는 클레릭들은 안식을 구하는 이들에게 위안을 가져다주며, 다가오는 어둠 속으로 직접 발을 들여 어둠이 공포가 아니라 안식이 되도록 그들을 보호합니다."
  ],
  [
    "As an action, you present your holy symbol, and a sphere of twilight emanates from you. The sphere is centered on you, has a 30-foot radius, and is filled with dim light. The sphere moves with you, and it lasts for 1 minute or until you are &Reference[condition=incapacitated] or die. Whenever a creature (including you) ends its turn in the sphere, you can grant that creature one of these benefits:",
    "행동으로 성표를 제시하면 황혼의 구체가 당신에게서 퍼져 나갑니다. 이 구체는 당신을 중심으로 한 반경 30피트이며, 희미한 빛으로 가득 차 있습니다. 구체는 당신과 함께 이동하고, 1분 동안 지속되거나 당신이 &Reference[condition=incapacitated] 상태가 되거나 죽을 때까지 유지됩니다. 크리처 하나(당신 자신 포함)가 이 구체 안에서 자기 차례를 마칠 때마다, 당신은 그 크리처에게 다음 혜택 중 하나를 부여할 수 있습니다:"
  ],
  [
    "As a conjurer, you favor spells that produce objects and creatures out of thin air. You can summon billowing clouds of killing fog or call creatures from elsewhere to fight on your behalf. As your mastery grows, you learn spells of transportation and can teleport yourself across vast distances, even to other planes of existence, in an instant.",
    "소환술사인 당신은 허공에서 물체와 생명을 끌어내는 주문을 선호한다. 치명적인 안개의 구름을 불러내거나, 다른 곳의 존재를 불러내 당신을 대신해 싸우게 할 수 있다. 숙련이 깊어질수록 이동 계열 주문도 익혀, 먼 거리나 다른 차원으로조차 순식간에 순간이동할 수 있게 된다."
  ],
  [
    "You are a student of spells that modify energy and matter. To you, the world is not a fixed thing, but eminently mutable, and you delight in being an agent of change. You wield the raw stuff of creation and learn both physical and magical secrets of transmutation in your ongoing quest to penetrate the mysteries of life and death, beginning with the simple premise that if you can understand how something works, you can change it.",
    "당신은 에너지와 물질을 변화시키는 주문을 연구하는 학자다. 당신에게 세계는 고정된 것이 아니라 얼마든지 바뀔 수 있는 것이며, 당신은 변화의 매개가 되는 일을 즐긴다. 당신은 창조의 근원적인 재료를 다루며, 사물이 어떻게 작동하는지 이해할 수 있다면 그것을 바꿀 수도 있다는 단순한 전제에서 출발해, 삶과 죽음의 신비를 꿰뚫기 위한 탐구 속에서 변환술의 물리적 비밀과 마법적 비밀을 익힌다."
  ],
  [
    "An Artillerist specializes in using magic to hurl energy, projectiles, and explosions on a battlefield. This destructive power was valued by all armies of the Last War. Now that war has ended, some members of this specialization seek to build a more peaceful world by using their powers to fight the resurgence of strife. The gnome artificer Vi, an outspoken champion of this study, has been especially vocal about making things right: \"It's about time we fixed things instead of blowing them all to hell.\"",
    "포격술사는 전장에서 마법으로 에너지와 투사체, 폭발을 퍼붓는 데 특화된 존재다. 이 파괴적인 힘은 최후의 전쟁 동안 모든 군대에게 높이 평가되었다. 이제 전쟁이 끝난 뒤, 이 전문화의 일부 구성원은 다시 고개 드는 분쟁에 맞서기 위해 자신의 힘을 사용하며 더 평화로운 세상을 만들고자 한다. 이 학문의 열렬한 옹호자인 노움 아티피서 비는 특히 크게 목소리를 내고 있다. \"이제는 다 날려버리는 대신, 망가진 걸 고칠 때도 됐지.\""
  ],
  [
    "Alchemy is a delicate art, tip the ratio of ingredients too far out of line and you can end up with a gout of baleful fire, a small mountain of smoking ooze, or noxious fumes that poison an entire room. Yet, where some see only danger and ruin, you see boundless potential. When brewed with precision and care, every Elixir can grant heroic strength, supernatural speed, or the power to twist the laws of nature itself.",
    "연금술은 섬세한 기술이다. 재료 비율이 조금만 크게 어긋나도 불길한 화염이 폭발하거나, 연기 나는 점액 더미가 솟아오르거나, 방 하나를 통째로 중독시키는 유독 가스가 퍼질 수 있다. 그러나 어떤 이들이 위험과 파멸만을 보는 곳에서, 당신은 무한한 가능성을 본다. 정밀함과 세심함으로 빚어낸 엘릭서는 영웅적인 힘, 초자연적인 속도, 심지어 자연의 법칙을 비트는 힘까지 부여할 수 있다."
  ],
  [
    "While most artificers are content with mechanical invention, your studies have led you down a stranger path: the manipulation of flesh, instinct, and arcane biology. To a Biomancer, life itself is the ultimate medium, and every beast, monstrosity, and mortal body is a blueprint waiting to be improved.",
    "대부분의 아티피서가 기계적 발명에 만족하는 반면, 당신의 연구는 더 기이한 길로 이어졌다. 바로 살점과 본능, 그리고 비전 생물학을 조작하는 길이다. 생체술사에게 생명 그 자체는 궁극의 재료이며, 모든 야수와 괴물, 필멸자의 육신은 개선을 기다리는 설계도다."
  ],
  [
    "You have dedicated your great intellect to the development of a one-of-a-kind weapon of war, the Arcane Firearm. Unlike the canons and handguns of the Warsmith, Arcane Firearms are highly specialized weapons of your own design that combine your talents for both artifice and evocation magic.",
    "당신은 비할 데 없는 전쟁 무기, 비전 화기를 개발하는 데 자신의 뛰어난 지성을 바쳐 왔다. 전쟁기술가의 대포나 총기와 달리, 비전 화기는 당신만의 설계로 만든 고도로 특화된 무기로서, 공예 기술과 발산 마법에 대한 재능을 결합한 산물이다."
  ],
  [
    "Tabaxi are taller on average than humans and relatively slender. Your size is Medium.",
    "타바시는 평균적으로 인간보다 키가 크고 비교적 날씬하다. 당신의 크기는 중형이다."
  ],
  [
    "Tabaxi have lifespans equivalent to humans.",
    "타바시는 인간과 비슷한 수명을 지닌다."
  ],
  [
    "You have a cat's keen senses, especially in the dark. You have darkvision out to 60 feet.",
    "당신은 특히 어둠 속에서 빛을 발하는 고양이 같은 예민한 감각을 지녔다. 60피트 범위의 암시야를 가진다."
  ],
  [
    "Your reflexes and agility allow you to move with a burst of speed. When you move on your turn in combat, you can double your speed until the end of the turn. Once you use this trait, you can't use it again until you move 0 feet on one of your turns.",
    "당신의 반사신경과 민첩함은 폭발적인 속도로 움직이게 해 준다. 전투 중 자신의 턴에 이동할 때, 그 턴이 끝날 때까지 자신의 이동속도를 두 배로 만들 수 있다. 이 특성을 사용한 뒤에는, 자신의 턴 중 한 번 0피트도 이동하지 않아야 다시 사용할 수 있다."
  ],
  [
    "Because of your claws, you have a climbing speed of 20 feet. In addition, your claws are natural weapons, which you can use to make unarmed strikes. If you hit with them, you deal slashing damage equal to [[/damage 1d4]] + your Strength modifier, instead of the bludgeoning damage normal for an unarmed strike.",
    "당신은 날카로운 발톱 덕분에 20피트의 등반 속도를 가집니다. 또한 당신의 발톱은 자연 무기로 간주되며, 이를 사용해 비무장 공격을 할 수 있습니다. 이 공격이 적중하면, 일반적인 비무장 공격의 타격 피해 대신 [[/damage 1d4]] + 당신의 근력 수정치만큼의 참격 피해를 입힙니다."
  ],
  [
    "Changelings mature slightly faster than humans but share a similar lifespan. They can live a century or less.",
    "체인질링은 인간보다 조금 더 빨리 성숙하지만, 수명은 비슷하다. 보통 한 세기 안팎까지 산다."
  ],
  [
    "As an action, you can change your appearance and your voice. You determine the specifics of the changes, including your coloration, hair length, and sex. You can also adjust your height and weight, but not so much that your size changes. You can make yourself appear as a member of another race, though none of your game statistics change. You can't duplicate the appearance of a creature you've never seen, and you must adopt a form that has the same basic arrangement of limbs that you have. Your clothing and equipment aren't changed by this trait.",
    "행동을 사용해 자신의 외형과 목소리를 바꿀 수 있다. 피부색, 머리 길이, 성별 등 세부 사항은 당신이 정한다. 또한 키와 몸무게도 조절할 수 있지만, 크기 범주가 바뀔 정도로는 바꿀 수 없다. 다른 종족처럼 보이게 만들 수도 있지만, 게임 통계치는 변하지 않는다. 본 적 없는 생물의 외형을 완벽히 복제할 수는 없고, 기본적인 팔다리 구조는 자신과 같아야 한다. 이 특성은 당신의 의복과 장비는 바꾸지 않는다."
  ],
  [
    "You stay in the new form until you use an action to revert to your true form or until you die.",
    "당신은 행동을 사용해 본래 모습으로 돌아가거나 죽을 때까지 새로운 모습으로 남아 있다."
  ],
  [
    "In the Land of the Mists, power and dread lie in the simple question “What happened to me?” The answer often comes as a revelation or a confession of despair.",
    "안개의 땅에서 힘과 공포는 “내게 무슨 일이 일어난 거지?”라는 단순한 질문 속에 깃들어 있다. 그 답은 종종 계시처럼, 혹은 절망의 고백처럼 다가온다."
  ],
  [
    "Poised between the worlds of the living and the dead, dhampirs retain their grip on life yet are endlessly tested by vampiric hungers.",
    "삶과 죽음의 세계 사이에 선 댐피르는 삶을 간신히 붙들고 있으면서도, 끝없는 흡혈의 굶주림에 시달린다."
  ],
  [
    "With unique insights into the nature of the undead, many dhampirs become adventurers and monster hunters. Their motives often stem from a desire to understand their own condition or to destroy the monsters that shaped them.",
    "언데드의 본질에 대한 독특한 통찰 덕분에, 많은 댐피르는 모험가나 괴물 사냥꾼이 된다. 그들의 동기는 대개 자신의 상태를 이해하려는 욕망이거나, 자신을 그렇게 만든 괴물을 파멸시키려는 집념에서 비롯된다."
  ],
  [
    "Every dhampir knows a thirst slaked only by the living. While many dhampirs thirst for blood, your character might otherwise gain sustenance from the psychic energy of emotions, the flesh or cerebrospinal fluid of living creatures, or some other source. You decide what your character craves, and you gain a mystical benefit from feeding on it.",
    "모든 댐피르는 오직 살아 있는 존재만이 채워 줄 수 있는 갈증을 안고 살아간다. 많은 댐피르가 피를 갈망하지만, 당신의 캐릭터는 감정에서 흘러나오는 정신 에너지나 살아 있는 존재의 살점, 뇌척수액, 혹은 다른 무언가를 양분으로 삼을 수도 있다. 당신의 캐릭터가 무엇을 갈망하는지는 당신이 정하며, 그것을 섭취함으로써 신비로운 이익을 얻는다."
  ],
  [
    "Some rogues enhance their fine-honed skills of stealth and agility with magic, learning tricks of enchantment and illusion. These rogues include pickpockets and burglars, but also pranksters, mischief-makers, and a significant number of adventurers.",
    "일부 로그는 오랫동안 갈고닦은 은신과 민첩의 기술에 마법을 더해, 환혹과 환영의 속임수를 익힙니다. 이런 로그들 중에는 소매치기와 도둑도 있지만, 장난꾸러기와 말썽꾼, 그리고 적지 않은 수의 모험가들도 포함됩니다."
  ],
  [
    "Most assassins strike with physical weapons, and many burglars and spies use @item[thieves' tools|PHB] to infiltrate secure locations. In contrast, a Soulknife strikes and infiltrates with the mind, cutting through barriers both physical and psychic. These rogues discover psionic power within themselves and channel it to do their roguish work. They find easy employment as members of thieves' guilds, though they are often mistrusted by rogues who are leery of anyone using strange mind powers to cut through walls, locks, and guards.",
    "대부분의 암살자들은 물리적 무기로 공격하고, 많은 도둑과 첩자들은 안전한 장소에 침투하기 위해 @item[thieves' tools|PHB]를 사용합니다. 반면 소울나이프는 정신으로 공격하고 침투하며, 물리적 장벽과 정신적 장벽을 모두 가릅니다. 이 도적들은 자신 안에서 사이오닉 힘을 발견하고, 그것을 도적다운 일에 활용합니다. 이들은 도둑 길드의 일원으로 쉽게 자리를 얻지만, 벽과 자물쇠, 경비를 기이한 정신력으로 뚫어 버리는 이들을 꺼리는 다른 도적들에게 자주 불신받습니다."
  ],
  [
    "Background: Faction Agent",
    "배경: 파벌 요원"
  ],
  [
    "Background: Hermit",
    "배경: 은둔자"
  ],
  [
    "Background: Soldier",
    "배경: 병사"
  ],
  [
    "Background: Noble",
    "배경: 귀족"
  ]
];

const LONGFORM_FRAGMENT_REPLACEMENTS = [
  ["Your innate magic comes from the wild forces of chaos that underlie the order of creation.", "당신의 선천적인 마법은 창조의 질서 아래 도사리는 혼돈의 야생적인 힘에서 비롯됩니다."],
  ["You might have endured exposure to some form of raw magic, perhaps through a planar portal leading to Limbo, the Elemental Planes, or the mysterious Far Realm.", "당신은 림보나 원소 차원, 혹은 불가해한 파 렐름으로 통하는 차원문을 통해 원초적인 마법에 노출되었을지도 모릅니다."],
  ["Perhaps you were blessed by a powerful fey creature or marked by a demon.", "강력한 페이 존재의 축복을 받았거나 악마의 표식을 지녔을 수도 있습니다."],
  ["Or your magic could be a fluke of your birth, with no apparent cause or reason.", "혹은 아무런 분명한 이유도 없이 태어날 때부터 이런 힘을 지니게 되었을 수도 있습니다."],
  ["However it came to be, this chaotic magic churns within you, waiting for any outlet.", "어떤 경로이든, 이 혼돈의 마법은 당신 안에서 소용돌이치며 분출할 틈을 기다립니다."],
  ["Starting when you choose this origin at 1st level, your spellcasting can unleash surges of untamed magic.", "1레벨에 이 기원을 선택하는 순간부터, 당신의 주문 시전은 길들여지지 않은 마법의 파동을 터뜨릴 수 있습니다."],
  ["Immediately after you cast a sorcerer spell of 1st level or higher, the DM can have you roll a [[/r d20]].", "당신이 1레벨 이상의 소서러 주문을 시전한 직후, DM은 당신에게 [[/r d20]]을 굴리게 할 수 있습니다."],
  ["If you roll a 1, roll on the Wild Magic Surge table to create a random magical effect.", "1이 나오면 Wild Magic Surge 표를 굴려 무작위 마법 효과를 발생시킵니다."],
  ["A Wild Magic Surge can happen once per turn.", "Wild Magic Surge는 턴당 한 번만 발생할 수 있습니다."],
  ["If a Wild Magic effect is a spell, it's too wild to be affected by Metamagic.", "Wild Magic 효과가 주문인 경우, 그 효과는 너무나 거칠어서 Metamagic의 영향을 받지 않습니다."],
  ["If it normally requires @status[concentration], it doesn't require @status[concentration] in this case; the spell lasts for its full duration.", "또한 원래 @status[concentration]이 필요한 주문이라도, 이 경우에는 @status[concentration]이 필요 없으며 주문은 전체 지속시간 동안 유지됩니다."],
  ["Magic of the book-that's what many folk call wizardry.", "많은 이들은 위저드의 마법을 \"책의 마법\"이라 부릅니다."],
  ["The name is apt, given how much time wizards spend poring over tomes and penning theories about the nature of magic.", "위저드들이 얼마나 많은 시간을 고서를 파고들고 마법의 본질에 대한 이론을 기록하며 보내는지를 생각하면, 이 이름은 매우 적절합니다."],
  ["It's rare to see wizards traveling without books and scrolls sprouting from their bags, and a wizard would go to great lengths to plumb an archive of ancient knowledge.", "가방에서 책과 두루마리가 삐져나오지 않은 채 여행하는 위저드를 보는 일은 드물며, 위저드는 고대 지식의 기록 보관소를 탐구하기 위해서라면 어떤 수고도 마다하지 않습니다."],
  ["Among wizards, the Order of Scribes is the most bookish.", "위저드들 중에서도 필경사의 기사단은 가장 책벌레 같은 집단입니다."],
  ["It takes many forms in different worlds, but its primary mission is the same everywhere: recording magical discoveries so that wizardry can flourish.", "이 조직은 세계마다 다양한 형태를 띠지만, 핵심 임무는 어디서나 같습니다. 마법적 발견을 기록하여 위저드의 학문이 번영하도록 만드는 것입니다."],
  ["And while all wizards value spellbooks, a wizard in the Order of Scribes magically awakens their book, turning it into a trusted companion.", "모든 위저드가 주문서를 소중히 여기지만, 필경사의 기사단 위저드는 자신의 책을 마법적으로 각성시켜 신뢰할 수 있는 동료로 만듭니다."],
  ["All wizards study books, but a wizardly scribe talks to theirs!", "모든 위저드는 책을 연구하지만, 필경사의 위저드는 자기 책과 대화까지 합니다!"],
  ["As a bonus action, you can magically create a Tiny quill in your free hand.", "보너스 액션으로, 당신은 빈 손에 Tiny 크기의 마법 깃펜 하나를 만들어낼 수 있습니다."],
  ["The magic quill has the following properties:", "이 마법 깃펜은 다음 성질을 가집니다:"],
  ["The quill doesn't require ink.", "이 깃펜은 잉크를 필요로 하지 않습니다."],
  ["When you write with it, it produces ink in a color of your choice on the writing surface.", "이 깃펜으로 글을 쓰면, 필기 표면 위에 당신이 선택한 색의 잉크가 생성됩니다."],
  ["This quill disappears if you create another one or if you die.", "이 깃펜은 당신이 다른 깃펜을 만들거나 죽으면 사라집니다."],
  ["Using specially prepared inks and ancient incantations passed down by your wizardly order, you have awakened an arcane sentience within your spellbook.", "당신은 기사단으로부터 전해 내려오는 특수한 잉크와 고대 주문을 사용해, 자신의 주문서 안에 비전적 지성을 일깨웠습니다."],
  ["While you are holding the book, it grants you the following benefits:", "당신이 이 책을 들고 있는 동안, 책은 당신에게 다음 혜택을 부여합니다:"],
  ["You can use the book as a spellcasting focus for your wizard spells.", "이 책을 위저드 주문의 주문시전 매개체로 사용할 수 있습니다."],
  ["Most assassins strike with physical weapons, and many burglars and spies use @item[thieves' tools|PHB] to infiltrate secure locations.", "대부분의 암살자들은 물리적 무기로 공격하고, 많은 도둑과 첩자들은 안전한 장소에 침투하기 위해 @item[thieves' tools|PHB]를 사용합니다."],
  ["In contrast, a Soulknife strikes and infiltrates with the mind, cutting through barriers both physical and psychic.", "반면 소울나이프는 정신으로 공격하고 침투하며, 물리적 장벽과 정신적 장벽을 모두 가릅니다."],
  ["These rogues discover psionic power within themselves and channel it to do their roguish work.", "이 도적들은 자신 안에서 사이오닉 힘을 발견하고, 그것을 도적다운 일에 활용합니다."],
  ["They find easy employment as members of thieves' guilds, though they are often mistrusted by rogues who are leery of anyone using strange mind powers to conduct their business.", "이들은 도둑 길드의 일원으로 쉽게 자리를 얻지만, 기이한 정신력으로 일을 처리하는 자들을 꺼리는 다른 도적들에게 자주 불신받습니다."],
  ["You harbor a wellspring of psionic energy within yourself.", "당신 안에는 사이오닉 에너지가 샘솟고 있습니다."],
  ["This energy is represented by your Psionic Energy dice, which are each a [[/r d6]].", "이 에너지는 각각 [[/r d6]]인 Psionic Energy 주사위로 표현됩니다."],
  ["You have a number of these dice equal to twice your proficiency bonus, and they fuel various psionic powers you have, which are detailed below.", "당신은 숙련 보너스의 두 배만큼 이 주사위를 가지며, 아래에 설명된 다양한 사이오닉 능력은 이 주사위를 동력으로 사용합니다."],
  ["Some of your powers expend the Psionic Energy die they use, as specified in a power's description, and you can't use a power if it requires you to use a die when your dice are all expended.", "당신의 일부 능력은 설명에 명시된 대로 Psionic Energy 주사위를 소모하며, 주사위를 써야 하는 능력은 모든 주사위를 다 소모한 상태에서는 사용할 수 없습니다."],
  ["You regain all your expended Psionic Energy dice when you finish a long rest.", "긴 휴식을 마치면 소모한 모든 Psionic Energy 주사위를 회복합니다."],
  ["In addition, as a bonus action, you can regain one expended Psionic Energy die, but you can't do so again until you finish a short or long rest.", "또한 보너스 액션으로 소모한 Psionic Energy 주사위 하나를 회복할 수 있지만, 그렇게 한 뒤에는 짧은 휴식 또는 긴 휴식을 마칠 때까지 다시 사용할 수 없습니다."],
  ["A combination of protector and medic, Battle Smith artificers are experts at defending others and repairing both material and personnel.", "수호자이자 의무병의 역할을 겸하는 전투 대장장이 아티피서들은 타인을 지키고 장비와 인원을 모두 복구하는 데 능숙한 전문가들입니다."],
  ["To aid in their work, Battle Smiths construct and modify their Steel Defender, a one-of-a-kind companion.", "이들의 활동을 돕기 위해, 전투 대장장이들은 자신만의 유일한 동반자인 Steel Defender를 제작하고 개조합니다."],
  ["You gain proficiency with smith's tools and in heavy armor.", "당신은 대장장이 도구와 중갑 숙련을 얻습니다."],
  ["If you are proficient in smith's tools, you gain proficiency in another set of artisan's tools of your choice.", "이미 대장장이 도구에 숙련이 있다면, 대신 원하는 다른 장인 도구 한 종류의 숙련을 얻습니다."],
  ["You learn certain spells at the artificer levels noted in the table below.", "아래 표에 적힌 아티피서 레벨에 도달하면 특정 주문을 배웁니다."],
  ["These don't count against your total number of Spells Known and can't be switched upon gaining a level.", "이 주문들은 당신이 아는 총 주문 수에 포함되지 않으며, 레벨 상승 시 교체할 수도 없습니다."],
  ["You have created for yourself a faithful construct, known as a Steel Defender.", "당신은 자신을 위해 Steel Defender라 불리는 충직한 구조체를 만들어 냈습니다."],
  ["It is friendly to you obeys your commands.", "이 존재는 당신에게 우호적이며 당신의 명령에 복종합니다."],
  ["Its game statistics are found in the Steel Defender stat block on the next page, which uses your Spell save DC and proficiency bonus (PB).", "이 존재의 게임 수치는 다음 페이지의 Steel Defender 스탯 블록에 나와 있으며, 당신의 주문 내성 DC와 숙련 보너스(PB)를 사용합니다."],
  ["An Artillerist specializes in using magic to hurl energy, projectiles, and explosions on a battlefield.", "포격술사는 전장에서 마법으로 에너지와 투사체, 폭발을 퍼붓는 데 특화된 존재다."],
  ["This destructive power was valued by all the armies of the Last War.", "이 파괴적인 힘은 최후의 전쟁 동안 모든 군대에게 높이 평가되었다."],
  ["Now that the war is over, some members of this specialization have sought to build a more peaceful world by using their powers to fight the resurgence of strife in Khorvaire.", "이제 전쟁이 끝난 뒤, 이 전문화의 일부 구성원은 자신의 힘으로 코르베어에 다시 고개 드는 분쟁에 맞서며 더 평화로운 세상을 만들고자 한다."],
  ["When you adopt this specialization at 3rd level, you gain proficiency with @item[woodcarver's tools|PHB].", "3레벨에 이 전문화를 선택하면 @item[woodcarver's tools|PHB] 숙련을 얻는다."],
  ["If you already have this proficiency, you gain proficiency with one other type of @item[artisan's tools|PHB] of your choice.", "이미 이 숙련이 있다면, 대신 원하는 다른 종류의 @item[artisan's tools|PHB] 하나에 대한 숙련을 얻는다."],
  ["Starting at 3rd level, you always have certain spells prepared after you reach particular levels in this class, as shown in the Artillerist Spells table.", "3레벨부터, Artillerist Spells 표에 표시된 대로 이 클래스의 특정 레벨에 도달하면 특정 주문이 항상 준비된 상태가 됩니다."],
  ["These spells count as artificer spells for you, but they don't count against the number of artificer spells you prepare.", "이 주문들은 당신에게 아티피서 주문으로 간주되지만, 준비할 수 있는 아티피서 주문 수에는 포함되지 않습니다."],
  ["Tabaxi are taller on average than humans and relatively slender.", "타바시는 평균적으로 인간보다 키가 크고 비교적 날씬하다."],
  ["You have proficiency in the &Reference[skill=Perception] and &Reference[skill=Stealth] skills.", "당신은 &Reference[skill=Perception] 및 &Reference[skill=Stealth] 기술에 숙련을 갖습니다."],
  ["Hailing from a strange and distant land, wandering tabaxi are catlike humanoids driven by curiosity to collect interesting artifacts, gather tales and stories, and lay eyes on all the world's wonders.", "기이하고 먼 땅에서 온 떠돌이 타바시는 흥미로운 유물과 이야기들을 모으고, 세상의 모든 경이로움을 직접 보고자 하는 호기심에 이끌리는 고양이 같은 인간형 존재입니다."],
  ["Instead, tabaxi value knowledge and new experiences.", "그 대신 타바시는 지식과 새로운 경험을 소중히 여깁니다."],
  ["The deity of the tabaxi is a fickle entity, as befits the patron of cats.", "타바시의 신은 고양이의 수호신답게 변덕스러운 존재입니다."],
  ["The Order Domain represents discipline, as well as devotion to a society or an institution and strict obedience to the laws governing it.", "질서 권역은 규율, 사회나 제도에 대한 헌신, 그리고 그것을 지배하는 법에 대한 엄격한 복종을 상징합니다."],
  ["The ideal of order is obedience to the law above all else, rather than to a specific individual or the passing influence of emotion or popular rule.", "질서의 이상은 특정 개인이나 감정, 혹은 대중 지배의 일시적인 영향보다도 법 그 자체에 대한 복종을 최우선으로 둡니다."],
  ["Clerics of order are typically concerned with how things are done, rather than whether an action's results are just.", "질서의 클레릭들은 보통 어떤 행동의 결과가 정의로운가보다, 일이 어떤 절차로 수행되는가를 더 중시합니다."],
  ["Following the law and obeying its edicts is critical, especially when it benefits these clerics and their guilds or deities.", "법을 따르고 그 명령에 복종하는 일은 특히 그들 자신과 그들의 길드 또는 신들에게 이익이 될 때 더욱 중요합니다."],
  ["Magic is an energy that suffuses the multiverse and that fuels both destruction and creation.", "마법은 다중우주를 가득 채우며 파괴와 창조를 모두 움직이게 하는 에너지입니다."],
  ["Gods of the Arcana domain know the secrets and potential of magic intimately.", "비전 권역의 신들은 마법의 비밀과 잠재력을 깊이 이해하고 있습니다."],
  ["For some of these gods, magical knowledge is a great responsibility that comes with a special understanding of the nature of reality.", "어떤 신들에게 마법적 지식은 현실의 본질에 대한 특별한 이해를 동반하는 막중한 책임입니다."],
  ["Other gods of Arcana see magic as pure power, to be used as its wielder sees fit.", "또 다른 비전의 신들은 마법을 순수한 힘으로 보고, 그 힘을 휘두르는 자가 뜻하는 대로 사용해야 할 것으로 여깁니다."],
  ["Gods of the grave watch over the line between life and death.", "무덤의 신들은 삶과 죽음 사이의 경계를 지켜봅니다."],
  ["To these deities, death and the afterlife are a foundational part of the multiverse.", "이 신들에게 죽음과 사후 세계는 다중우주의 근본적인 일부입니다."],
  ["To desecrate the peace of the dead is an abomination.", "죽은 자의 안식을 더럽히는 행위는 혐오스러운 모독입니다."],
  ["Followers of these deities seek to put wandering spirits to rest, destroy the undead, and ease the suffering of the dying.", "이 신들을 따르는 자들은 떠도는 영혼을 안식시키고, 언데드를 파괴하며, 죽어 가는 자의 고통을 덜어 주려 합니다."],
  ["Their magic also allows them to stave off death for a time, particularly for a person who still has some great work to accomplish in the world.", "그들의 마법은 세상에 아직 이루어야 할 큰일이 남은 사람을 위해 죽음을 잠시 유예하게 하기도 합니다."],
  ["This is a delay of death, not a denial of it, for death will eventually get its due.", "이것은 죽음의 부정이 아니라 연기일 뿐이며, 결국 죽음은 제 몫을 가져가게 됩니다."]
  ,["Immediately after you cast a sorcerer spell of 1st level or higher, the DM can have you roll a [[/r d20]].", "당신이 1레벨 이상의 소서러 주문을 시전한 직후, DM은 당신에게 [[/r d20]]을 굴리게 할 수 있습니다."]
  ,["If it normally requires @status[concentration], it doesn't require @status[concentration] in this case; the spell lasts for its full duration.", "원래 @status[concentration]이 필요한 주문이라도, 이 경우에는 @status[concentration]이 필요 없으며 주문은 전체 지속시간 동안 유지됩니다."]
  ,["The time you must spend to copy a spell into your spellbook equals 2 minutes per spell level if you use the quill for the transcription.", "이 깃펜으로 필사할 경우, 주문을 주문서에 옮겨 적는 데 걸리는 시간은 주문 레벨당 2분입니다."]
  ,["You can erase anything you write with the quill if you wave the feather over the text as a bonus action, provided the text is within 5 feet of you.", "문서가 당신의 5피트 이내에 있다면, 보너스 액션으로 깃펜을 그 글 위에 휘둘러 이 깃펜으로 쓴 내용을 지울 수 있습니다."]
  ,["When you cast a wizard spell with a spell slot, you can temporarily replace its damage type with a type that appears in another spell in your spellbook, which magically alters the spell's formula for this casting only.", "주문 슬롯을 사용해 위저드 주문을 시전할 때, 그 주문의 피해 유형을 당신의 주문서에 있는 다른 주문에 등장하는 유형으로 일시적으로 바꿀 수 있습니다. 이는 이번 시전에 한해서만 주문의 공식을 마법적으로 변형합니다."]
  ,["The latter spell must be of the same level as the spell slot you expend.", "그 다른 주문은 당신이 소비한 주문 슬롯과 같은 레벨이어야 합니다."]
  ,["When you cast a wizard spell as a ritual, you can use the spell's normal casting time, rather than adding 10 minutes to it.", "위저드 주문을 의식으로 시전할 때, 시전 시간에 10분을 더하지 않고 원래의 시전 시간을 사용할 수 있습니다."]
  ,["Once you use this benefit, you can't do so again until you finish a long rest.", "이 혜택을 한 번 사용하면 긴 휴식을 마칠 때까지 다시 사용할 수 없습니다."]
  ,["If necessary, you can replace the book over the course of a short rest by using your Wizardly Quill to write arcane sigils in a blank book or a magic spellbook to which you're attuned.", "필요하다면, 짧은 휴식 동안 Wizardly Quill로 빈 책이나 당신이 조율한 마법 주문서에 비전 문양을 적어 넣어 그 책을 대체할 수 있습니다."]
  ,["At the end of the rest, your spellbook's consciousness is summoned into the new book, which the consciousness transforms into your spellbook, along with all its spells.", "휴식이 끝나면 당신의 주문서의 의식이 새 책으로 불려와, 그 의식이 모든 주문과 함께 그 책을 당신의 주문서로 바꿉니다."]
  ,["If the previous book still existed somewhere, all the spells vanish from its pages.", "이전 책이 어딘가에 여전히 존재한다면, 그 책의 모든 주문은 페이지에서 사라집니다."]
  ,["You can conjure forth the mind of your Awakened Spellbook.", "당신은 각성한 주문서의 정신을 불러낼 수 있습니다."]
  ,["As a bonus action while the book is on your person, you can cause the mind to manifest as a Tiny spectral object, hovering in an unoccupied space of your choice within 60 feet of you.", "책을 몸에 지니고 있는 동안 보너스 액션으로, 그 정신을 당신으로부터 60피트 이내의 비어 있는 공간에 떠다니는 Tiny 크기의 영체 물체로 구현할 수 있습니다."]
  ,["The spectral mind is intangible and doesn't occupy its space, and it sheds dim light in a 10-foot radius.", "이 분광 정신은 실체가 없어서 공간을 차지하지 않으며, 10피트 반경에 희미한 빛을 비춥니다."]
  ,["Most governments would also be happy to employ a Soulknife as a spy.", "대부분의 정부 역시 소울나이프를 첩자로 기용하는 것을 반길 것입니다."]
  ,["As a Soulknife, your psionic abilities might have haunted you since you were a child, only revealing their full potential as you experienced the stress of adventure.", "소울나이프로서 당신의 사이오닉 능력은 어린 시절부터 당신을 따라다녔을 수도 있으며, 모험의 압박을 겪으며 비로소 온전한 잠재력을 드러냈을 수도 있습니다."]
  ,["Or you might have sought out a reclusive order of psychic adepts and spent years learning how to manifest your power.", "혹은 은둔하는 초능력 수행자 집단을 찾아가 자신의 힘을 구현하는 법을 수년간 배웠을 수도 있습니다."]
  ,["When you reach certain levels in this class, the size of your Psionic Energy dice increases: at 5th level ([[/r d8]]), 11th level ([[/r d10]]), and 17th level ([[/r d12]]).", "이 클래스의 특정 레벨에 도달하면 당신의 Psionic Energy 주사위 크기가 증가합니다: 5레벨 ([[/r d8]]), 11레벨 ([[/r d10]]), 17레벨 ([[/r d12]])입니다."]
  ,["The powers below use your Psionic Energy dice.", "아래 능력들은 당신의 Psionic Energy 주사위를 사용합니다."]
  ,["The gnome artificer Vi, an unlikely yet key member of House Cannith's warforged project, has been especially vocal about making things right: \"It's about time we fixed things instead of blowing them all to hell.\"", "하우스 카니스의 워포지드 계획에서 뜻밖이지만 핵심적인 일원인 노움 아티피서 비는, 사태를 바로잡아야 한다는 점을 특히 강하게 주장해 왔다. \"이제는 다 날려버리는 대신, 망가진 걸 고칠 때도 됐지.\""]
  ,["At 3rd level, you learn how to create a magical cannon.", "3레벨부터, 당신은 마법 대포를 만드는 법을 익힙니다."]
  ,["Using @item[woodcarver's tools|PHB] or @item[smith's tools|PHB], you can take an action to magically create a Small or Tiny eldritch cannon in an unoccupied space on a horizontal surface within 5 feet of you.", "@item[woodcarver's tools|PHB] 또는 @item[smith's tools|PHB]를 사용해, 당신의 5피트 이내 수평면 위의 비어 있는 공간에 Small 또는 Tiny 크기의 eldritch cannon을 마법적으로 만들어낼 수 있습니다."]
  ,["A Small eldritch cannon occupies its space, and a Tiny one can be held in one hand.", "Small 크기의 eldritch cannon은 그 공간을 차지하며, Tiny 크기의 것은 한 손에 들 수 있습니다."]
  ,["Once you create a cannon, you can't do so again until you finish a long rest or until you expend a spell slot of 1st level or higher.", "한 번 대포를 만들면, 긴 휴식을 마치거나 1레벨 이상의 주문 슬롯을 소비하기 전까지는 다시 만들 수 없습니다."]
  ,["It is immune to poison damage and psychic damage, and all conditions.", "이것은 독 피해와 정신 피해, 그리고 모든 상태이상에 면역입니다."]
  ,["If the @spell[mending] spell is cast on it, it regains [[/r 2d6]] hit points.", "@spell[mending] 주문이 여기에 시전되면, [[/r 2d6]] HP를 회복합니다."]
  ,["You are welcome in high society, and people assume you have the right to be wherever you are.", "당신은 상류 사회에서 환영받으며, 사람들은 당신이 어디에 있든 그곳에 있을 자격이 있다고 여깁니다."]
  ,["The common folk make every effort to accommodate you and avoid your displeasure, and other people of high birth treat you as a member of the same social sphere.", "평민들은 당신을 맞추고 당신의 불쾌함을 피하기 위해 최선을 다하며, 다른 고귀한 혈통의 사람들 역시 당신을 같은 사교계의 일원으로 대합니다."]
  ,["You can secure an audience with a local noble if you need to.", "필요하다면 현지 귀족과의 알현을 마련할 수 있습니다."]
  ,["You know a set of secret signs and passwords you can use to identify such operatives, who can provide you with access to a hidden safe house, free room and board, or assistance in finding information.", "당신은 같은 조직원임을 식별할 수 있는 비밀 표식과 암호를 알고 있으며, 그런 요원들은 당신에게 은신처 접근권, 무료 숙식, 또는 정보 수집 지원을 제공할 수 있습니다."]
  ,["These agents never risk their lives for you or risk revealing their true identities.", "이 요원들은 당신을 위해 목숨을 걸거나 자신의 정체를 드러낼 위험을 감수하지는 않습니다."]
  ,["War has been your life for as long as you care to remember.", "당신이 기억하는 한, 전쟁은 당신의 삶 그 자체였습니다."],
  ["You understand wealth, power, and privilege.", "당신은 부와 권력, 그리고 특권이 무엇인지 잘 알고 있습니다."],
  ["You add your Constitution modifier, instead of your Strength modifier, to the attack and damage rolls when you attack with this bite.", "이 물기로 공격할 때는 근력 수정치 대신 건강 수정치를 공격 굴림과 피해 굴림에 더합니다."],
  ["While you are missing half or more of your hit points, you have advantage on attack rolls you make with this bite.", "당신이 현재 HP의 절반 이상을 잃은 동안에는, 이 물기로 하는 공격 굴림에 이점을 얻습니다."],
  ["When you reach 14th level, the extra damage increases to [[/r 2d8]].", "14레벨이 되면 이 추가 피해는 [[/r 2d8]]로 증가합니다."],
  ["When a creature takes damage from one of your cantrips or weapon attacks, you can also deal [[/damage 1d8 type=radiant]] damage to that creature.", "크리처가 당신의 캔트립이나 무기 공격 중 하나로 피해를 받을 때, 당신은 그 크리처에게 추가로 [[/damage 1d8 type=radiant]] 피해를 줄 수 있습니다."],
  ["Once you deal this damage, you can't use this feature again until the start of your next turn.", "이 피해를 한 번 주고 나면, 당신의 다음 턴 시작 전까지는 이 특성을 다시 사용할 수 없습니다."]
];

const applyLongformDescriptionReplacements = (value) => {
  let output = String(value ?? "");
  for (const [source, target] of LONGFORM_DESCRIPTION_REPLACEMENTS) {
    output = output.replaceAll(source, target);
  }
  for (const [source, target] of LONGFORM_FRAGMENT_REPLACEMENTS) {
    output = output.replaceAll(source, target);
  }
  return output;
};

export class TranslationStore {
  constructor() {
    this.ready = false;
    this.world = {
      actors: new Map(),
      items: new Map(),
      actorItems: new Map(),
      journalPages: new Map()
    };
    this.compendium = new Map();
    this.compendiumDocLabels = new Map();
    this.compendiumPageLabels = new Map();
    this.compendiumPackLabels = new Map();
    this.compendiumFolderLabels = new Map();
    this.compendiumSignatureIndex = new Map();
    this.compendiumIdentifierIndex = new Map();
    this.compendiumNameIndex = new Map();
    this.compendiumActorNameIndex = new Map();
    this.referenceLabels = new Map();
    this.referenceTargets = new Map();
    this.referenceTooltips = new Map();
    this.sharedItems = new Map();
  }

  async load() {
    this.ready = false;

    await Promise.all([
      this._loadWorldTranslations(),
      this._loadCompendiumTranslations()
    ]);
    this.ready = true;
  }

  async refresh() {
    await this.load();
  }

  async refreshCompendiums() {
    this.ready = false;
    await this._loadCompendiumTranslations();
    this.ready = true;
  }

  getActorTranslation(actor) {
    if (!actor) return null;
    if (actor.uuid && this.world.actors.has(actor.uuid)) {
      return this._mergeTranslations(
        this._withFormattedName(actor.name, this.world.actors.get(actor.uuid)),
        this._withFormattedName(actor.name, this._getCompendiumActorFallback(actor)),
        this._getGeneratedActorTranslation(actor)
      );
    }
    return this._mergeTranslations(
      this._withFormattedName(actor.name, this._getCompendiumActorFallback(actor)),
      this._getGeneratedActorTranslation(actor)
    );
  }

  getItemTranslation(item) {
    if (!item) return null;
    const sourceName = this._getPreferredItemSourceName(item);
    const fallbackCandidates = this._getItemTranslationFallbacks(item, { includePackEntry: !!item.pack });

    if (item.parent instanceof Actor) {
      return this._mergeTranslations(
        this._withFormattedName(sourceName, this.world.actorItems.get(item.uuid)),
        ...fallbackCandidates
      );
    }

    if (item.pack) {
      return this._mergeTranslations(...fallbackCandidates);
    }

    return this._mergeTranslations(
      this._withFormattedName(sourceName, this.world.items.get(item.uuid)),
      ...fallbackCandidates
    );
  }

  getJournalPageTranslation(page) {
    if (!page) return null;

    if (page.pack) {
      const collection = page.parent?.pack ?? page.pack;
      const entryName = page.parent?.name;
      const entry = this._getCompendiumEntry(collection, entryName);
      return this._mergeTranslations(
        this._withFormattedName(page.name, entry?.pages?.[page.name] ?? null),
        this._getGeneratedPageTranslation(page)
      );
    }

    return this._mergeTranslations(
      this._withFormattedName(page.name, this.world.journalPages.get(page.uuid)),
      this._getGeneratedPageTranslation(page)
    );
  }

  getCompendiumPackLabel(collection) {
    return this.compendiumPackLabels.get(collection) ?? null;
  }

  getCompendiumFolderLabel(collection, folderName) {
    return this.compendiumFolderLabels.get(collection)?.get(folderName) ?? null;
  }

  getLinkLabel(anchor) {
    const uuid = anchor.dataset.uuid;
    if (uuid) {
      const directWorldLabel = this._getWorldLabelByUuid(uuid);
      if (directWorldLabel) return directWorldLabel;
      const directCompendiumPageLabel = this.compendiumPageLabels.get(uuid);
      if (directCompendiumPageLabel) return directCompendiumPageLabel;
      const directCompendiumDocLabel = this.compendiumDocLabels.get(uuid);
      if (directCompendiumDocLabel) return directCompendiumDocLabel;
    }

    const pack = anchor.dataset.pack;
    const id = anchor.dataset.id;
    if (pack && id) {
      const pageUuid = `Compendium.${pack}.JournalEntry.${anchor.closest("[data-entry-id]")?.dataset.entryId ?? ""}.JournalEntryPage.${id}`;
      if (this.compendiumPageLabels.has(pageUuid)) return this.compendiumPageLabels.get(pageUuid);
    }

    return null;
  }

  getLinkTooltip(anchor) {
    if (!anchor) return null;
    const uuid = anchor.dataset.uuid;
    if (uuid && this.referenceTooltips.has(uuid)) {
      return this.referenceTooltips.get(uuid);
    }

    const pack = anchor.dataset.pack;
    const id = anchor.dataset.id;
    if (pack && id) {
      const pageUuid = `Compendium.${pack}.JournalEntry.${anchor.closest("[data-entry-id]")?.dataset.entryId ?? ""}.JournalEntryPage.${id}`;
      if (this.referenceTooltips.has(pageUuid)) return this.referenceTooltips.get(pageUuid);
    }

    return null;
  }

  _indexReferenceLabel(type, value, label) {
    const normalizedLabel = normalizeText(label);
    if (!normalizedLabel) return;

    const key = referenceAliasKey(type, value);
    if (!key || this.referenceLabels.has(key)) return;
    this.referenceLabels.set(key, normalizedLabel);
  }

  _getReferenceDisplayLabel(type, target, explicitLabel = "") {
    const explicit = normalizeText(explicitLabel);
    if (explicit) return explicit;

    const normalizedType = normalizeReferenceType(type);
    const normalizedTarget = normalizeReferenceKey(target);
    if (!normalizedTarget) return "";

    const canonicalLabel = this._getCanonicalReferenceLabel(normalizedType, target);
    const candidates = [
      referenceAliasKey(normalizedType, target),
      referenceAliasKey(normalizedType, canonicalLabel),
      referenceAliasKey("", target),
      referenceAliasKey("", canonicalLabel)
    ].filter(Boolean);

    for (const candidate of candidates) {
      const mapped = this.referenceLabels.get(candidate);
      if (mapped) return mapped;
    }

    const entry = this._resolveReferenceTarget(
      normalizedType ? `${normalizedType}=${target}` : target,
      explicit
    );
    return normalizeText(entry?.label ?? "");
  }

  _getCanonicalReferenceLabel(type, target) {
    const normalizedType = normalizeReferenceType(type);
    const normalizedTarget = normalizeReferenceKey(target);
    if (!normalizedTarget) return "";

    const typedLookup = REFERENCE_TYPED_LABELS[normalizedType];
    if (typedLookup?.[normalizedTarget]) return typedLookup[normalizedTarget];

    return normalizeText(target);
  }

  _referenceTargetPriority(collection) {
    if (collection === "dnd5e.rules") return 2;
    if (collection.endsWith(".rules")) return 1;
    return 0;
  }

  _indexReferenceTarget(collection, alias, data) {
    const key = alias.includes(":")
      ? `${normalizeReferenceType(alias.split(":")[0])}:${normalizeReferenceKey(alias.split(":").slice(1).join(":"))}`
      : referenceAliasKey("", alias);

    if (!key) return;

    const existing = this.referenceTargets.get(key);
    const incomingPriority = this._referenceTargetPriority(collection);
    if (existing && existing.priority > incomingPriority) return;

    this.referenceTargets.set(key, {
      ...data,
      priority: incomingPriority
    });
  }

  _indexReferencePage(collection, page, pageTranslation = {}) {
    if (!page?.uuid || !page?.name) return;

    const tooltip = stripHtmlText(
      pageTranslation?.system?.tooltip
      ?? pageTranslation?.text
      ?? page?.system?.tooltip
      ?? page?.text?.content
      ?? ""
    );

    const data = {
      uuid: page.uuid,
      sourceName: page.name,
      label: pageTranslation?.name ?? page.name,
      tooltip
    };

    this._indexReferenceLabel("", page.name, data.label);
    this._indexReferenceLabel("rule", page.name, data.label);
    this._indexReferenceTarget(collection, page.name, data);
    this._indexReferenceTarget(collection, data.label, data);
    this._indexReferenceTarget(collection, `rule:${page.name}`, data);

    for (const alias of referenceAliasesForPageName(page.name)) {
      const [aliasType, ...aliasValueParts] = alias.split(":");
      this._indexReferenceLabel(aliasType, aliasValueParts.join(":"), data.label);
      this._indexReferenceTarget(collection, alias, data);
    }

    if (tooltip) {
      this.referenceTooltips.set(page.uuid, tooltip);
    }
  }

  _resolveReferenceTarget(target, explicitLabel = "") {
    const raw = normalizeText(target);
    if (!raw) return null;

    const [rawType, rawValue] = raw.includes("=")
      ? raw.split(/=(.+)/u, 2)
      : ["", raw];

    const normalizedType = normalizeReferenceType(rawType);
    const canonicalLabel = this._getCanonicalReferenceLabel(normalizedType, rawValue);

    const candidates = [
      referenceAliasKey(normalizedType, rawValue),
      referenceAliasKey(normalizedType, canonicalLabel),
      referenceAliasKey("", rawValue),
      referenceAliasKey("", canonicalLabel),
      referenceAliasKey("", explicitLabel)
    ].filter(Boolean);

    for (const candidate of candidates) {
      const entry = this.referenceTargets.get(candidate);
      if (entry) return entry;
    }

    return null;
  }

  _replaceReferenceMarkup(html) {
    if (!html || !String(html).includes("Reference[")) return html;

    return String(html).replace(/&(amp;)?Reference\[([^\]]+)\](?:\{([^}]+)\})?/gu, (match, _escaped, target, label) => {
      const rawTarget = normalizeText(target);
      const [rawType, rawValue] = rawTarget.includes("=")
        ? rawTarget.split(/=(.+)/u, 2)
        : ["", rawTarget];
      const preservedReference = match.replace(/^&amp;Reference/gu, "&Reference");
      const displayLabel = this._getReferenceDisplayLabel(rawType, rawValue, label);
      if (displayLabel) {
        return `&Reference[${target}]{${displayLabel}}`;
      }

      const entry = this._resolveReferenceTarget(target, label);
      if (!entry?.uuid) return preservedReference;

      const fallbackLabel = normalizeText(label) || entry.label || entry.sourceName;
      return `@UUID[${entry.uuid}]{${fallbackLabel}}`;
    });
  }

  translateAnchor(anchor, label) {
    if (!anchor || !label) return;
    const icon = anchor.querySelector("i")?.outerHTML ?? "";
    anchor.innerHTML = `${icon}${escapeHtml(label)}`;
  }

  async translateHtmlString(html, { relativeTo = null, rollData = null } = {}) {
    if (!html) return html;
    const source = this._replaceReferenceMarkup(html);
    let enriched = TextEditor.enrichHTML(source, {
      async: true,
      documents: true,
      rolls: true,
      secrets: false,
      relativeTo,
      rollData
    });
    if (typeof enriched?.then === "function") {
      enriched = await enriched;
    }
    const template = document.createElement("template");
    template.innerHTML = typeof enriched === "string" ? enriched : source;
    this.translateContentLinks(template.content);
    return template.innerHTML;
  }

  translateHtmlStringSync(html, { relativeTo = null, rollData = null } = {}) {
    if (!html) return html;
    const source = this._replaceReferenceMarkup(html);
    let enriched = TextEditor.enrichHTML(source, {
      async: false,
      documents: true,
      rolls: true,
      secrets: false,
      relativeTo,
      rollData
    });
    if (typeof enriched !== "string") {
      enriched = source;
    }
    const template = document.createElement("template");
    template.innerHTML = enriched;
    this.translateContentLinks(template.content);
    return template.innerHTML;
  }

  translateContentLinks(root) {
    root.querySelectorAll("a.content-link").forEach((anchor) => {
      const label = this.getLinkLabel(anchor);
      if (label) this.translateAnchor(anchor, label);
      const tooltip = this.getLinkTooltip(anchor);
      if (tooltip) anchor.setAttribute("title", tooltip);
    });
    this.translateStaticLabels(root);
  }

  translateStaticLabels(root) {
    const selectors = [
      ".entry-title-inner",
      ".rd__data-embed-name",
      ".rd__list-item-name",
      "summary",
      "caption",
      "th",
      ".summary td"
    ];

    root.querySelectorAll(selectors.join(", ")).forEach((node) => {
      const translated = this.getPlainTextLabel(node.textContent);
      if (translated && translated !== normalizeText(node.textContent)) {
        node.textContent = translated;
      }
    });
  }

  getPlainTextLabel(label) {
    const normalized = normalizeText(label);
    if (!normalized) return null;

    const direct = plainLabelToKo(normalized);
    if (direct !== normalized) return direct;

    const suffixMatch = normalized.match(/^(.+?)([.:])$/u);
    if (suffixMatch) {
      const [, stem, suffix] = suffixMatch;
      const translatedStem = this.getPlainTextLabel(stem);
      if (translatedStem && translatedStem !== stem) return `${translatedStem}${suffix}`;
    }

    const key = normalized.toLowerCase();
    const compendiumCandidate = this.compendiumNameIndex.get(key)?.[0]?.translation?.name
      ?? this.compendiumActorNameIndex.get(key)?.name
      ?? null;
    if (compendiumCandidate) return compendiumCandidate;

    const generated = nameToKo(normalized);
    if (generated !== normalized) return generated;

    return null;
  }

  async createWorldTemplate({
    onlyEnglish = true,
    includeCompendiums = true,
    includeSystemCompendiums = false,
    packFilter = null
  } = {}) {
    const shouldInclude = (name, description) => {
      if (!onlyEnglish) return true;
      return this._hasEnglishText(name) || this._hasEnglishText(description);
    };

    const actors = {};
    for (const actor of game.actors) {
      const description = this._extractActorDescription(actor);
      if (!shouldInclude(actor.name, description)) continue;
      actors[actor.uuid] = {
        name: "",
        description: "",
        originalName: actor.name,
        originalDescription: description,
        type: actor.type
      };
    }

    const items = {};
    for (const item of game.items) {
      const description = item.system?.description?.value ?? "";
      if (!shouldInclude(item.name, description)) continue;
      items[item.uuid] = {
        name: "",
        description: "",
        originalName: item.name,
        originalDescription: description,
        type: item.type,
        source: item.system?.source ?? null
      };
    }

    const actorItems = {};
    for (const actor of game.actors) {
      for (const item of actor.items) {
        const description = item.system?.description?.value ?? "";
        if (!shouldInclude(item.name, description)) continue;
        actorItems[item.uuid] = {
          name: "",
          description: "",
          originalName: item.name,
          originalDescription: description,
          actor: actor.name,
          type: item.type,
          source: item.system?.source ?? null
        };
      }
    }

    const journalPages = {};
    for (const journal of game.journal) {
      for (const page of journal.pages) {
        const text = page.text?.content ?? "";
        if (!shouldInclude(page.name, text)) continue;
        journalPages[page.uuid] = {
          name: "",
          text: "",
          originalName: page.name,
          originalText: text,
          journal: journal.name,
          type: page.type
        };
      }
    }

    const template = {
      metadata: {
        module: MODULE_ID,
        generatedAt: new Date().toISOString(),
        world: game.world?.title ?? "",
        foundryVersion: game.release?.version ?? game.version ?? "",
        systemVersion: game.system?.version ?? ""
      },
      actors: {
        label: "Actors",
        entries: actors
      },
      items: {
        label: "World Items",
        entries: items
      },
      actorItems: {
        label: "Actor Embedded Items",
        entries: actorItems
      },
      journalPages: {
        label: "Journal Pages",
        entries: journalPages
      }
    };

    if (includeCompendiums) {
      template.compendiums = await this._createCompendiumTemplate({
        onlyEnglish,
        includeSystemCompendiums,
        packFilter
      });
    }

    return template;
  }

  async _createCompendiumTemplate({
    onlyEnglish = true,
    includeSystemCompendiums = false,
    packFilter = null
  } = {}) {
    const shouldInclude = (name, content) => {
      if (!onlyEnglish) return true;
      return this._hasEnglishText(name) || this._hasEnglishText(content);
    };

    const compendiums = {};
    const filter = this._normalizePackFilter(packFilter);

    for (const pack of game.packs ?? []) {
      if (!this._shouldIncludeCompendiumPack(pack, { includeSystemCompendiums, filter })) continue;

      let documents;
      try {
        documents = await pack.getDocuments();
      } catch (error) {
        console.warn(`${MODULE_ID} | Failed to export compendium template for ${pack.collection}`, error);
        continue;
      }

      const entries = {};
      for (const document of documents) {
        const translation = this._getCompendiumEntry(pack.collection, document.name);
        const templateEntry = this._createCompendiumEntryTemplate(document, translation, shouldInclude);
        if (templateEntry) {
          entries[document.name] = templateEntry;
        }
      }

      if (!Object.keys(entries).length) continue;

      const folders = this._extractCompendiumFolderLabels(pack);
      compendiums[pack.collection] = {
        label: this.getCompendiumPackLabel(pack.collection) ?? pack.metadata?.label ?? pack.title ?? pack.collection,
        documentName: pack.documentName ?? null,
        packageType: pack.metadata?.packageType ?? pack.metadata?.package ?? null,
        packageName: pack.metadata?.packageName ?? null,
        folders,
        entries
      };
    }

    return {
      label: "Compendiums",
      entries: compendiums
    };
  }

  _createCompendiumEntryTemplate(document, translation, shouldInclude) {
    switch (document.documentName) {
      case "Actor":
        return this._createCompendiumActorTemplate(document, translation, shouldInclude);
      case "Item":
        return this._createCompendiumItemTemplate(document, translation, shouldInclude);
      case "JournalEntry":
        return this._createCompendiumJournalTemplate(document, translation, shouldInclude);
      default:
        if (!shouldInclude(document.name, "")) return null;
        return {
          name: translation?.name ?? "",
          originalName: document.name
        };
    }
  }

  _createCompendiumActorTemplate(document, translation, shouldInclude) {
    const description = this._extractActorDescription(document);
    const items = {};

    for (const item of document.items ?? []) {
      const itemDescription = this._extractItemDescription(item);
      if (!shouldInclude(item.name, itemDescription)) continue;
      const itemTranslation = translation?.items?.[item.name] ?? null;
      items[item.name] = {
        name: itemTranslation?.name ?? "",
        description: itemTranslation?.description ?? "",
        originalName: item.name,
        originalDescription: itemDescription,
        type: item.type,
        source: item.system?.source ?? null
      };
    }

    if (!shouldInclude(document.name, description) && !Object.keys(items).length) return null;

    return {
      name: translation?.name ?? "",
      description: translation?.description ?? "",
      originalName: document.name,
      originalDescription: description,
      type: document.type,
      items
    };
  }

  _createCompendiumItemTemplate(document, translation, shouldInclude) {
    const description = this._extractItemDescription(document);
    if (!shouldInclude(document.name, description)) return null;

    return {
      name: translation?.name ?? "",
      description: translation?.description ?? "",
      originalName: document.name,
      originalDescription: description,
      type: document.type,
      source: document.system?.source ?? null
    };
  }

  _createCompendiumJournalTemplate(document, translation, shouldInclude) {
    const pages = {};
    for (const page of document.pages ?? []) {
      const pageText = page.text?.content ?? "";
      if (!shouldInclude(page.name, pageText)) continue;
      const pageTranslation = translation?.pages?.[page.name] ?? null;
      pages[page.name] = {
        name: pageTranslation?.name ?? "",
        text: pageTranslation?.text ?? "",
        originalName: page.name,
        originalText: pageText,
        type: page.type
      };
    }

    if (!shouldInclude(document.name, "") && !Object.keys(pages).length) return null;

    return {
      name: translation?.name ?? "",
      originalName: document.name,
      pages
    };
  }

  _extractActorDescription(actor) {
    return actor?.system?.details?.biography?.value
      ?? actor?.system?.details?.description
      ?? actor?.system?.description?.value
      ?? "";
  }

  _extractItemDescription(item) {
    return item?.system?.description?.value
      ?? item?.system?.description
      ?? "";
  }

  _getPreferredItemSourceName(item) {
    return this._getItemLookupNames(item)[0] ?? item?.name ?? "";
  }

  _getItemLookupNames(item) {
    const names = [];
    const pushName = (value) => {
      const normalized = normalizeText(value);
      if (!normalized || names.includes(normalized)) return;
      names.push(normalized);
    };

    pushName(item?.flags?.ddbimporter?.originalName);
    pushName(item?.flags?.ddbimporter?.definition?.name);
    pushName(item?.flags?.ddbimporter?.dndbeyond?.originalName);
    pushName(splitBilingualName(item?.name)?.source);
    pushName(item?.name);

    return names;
  }

  _normalizeIdentifier(value) {
    return normalizeText(value)
      .toLowerCase()
      .replace(/-(legacy|2014|2024)$/u, "")
      .replace(/[^a-z0-9]+/gu, "-")
      .replace(/^-+|-+$/gu, "");
  }

  _identifierFromName(name) {
    return this._normalizeIdentifier(
      normalizeText(name)
        .replace(/['’]/gu, "")
        .replace(/\+/gu, " plus ")
    );
  }

  _getItemLookupIdentifiers(item) {
    const identifiers = [];
    const pushIdentifier = (value) => {
      const normalized = this._normalizeIdentifier(value);
      if (!normalized || identifiers.includes(normalized)) return;
      identifiers.push(normalized);
    };

    pushIdentifier(item?.system?.identifier);
    pushIdentifier(item?.flags?.ddbimporter?.definition?.identifier);
    pushIdentifier(item?.flags?.ddbimporter?.originalName);
    pushIdentifier(item?.flags?.ddbimporter?.definition?.name);
    pushIdentifier(item?.flags?.ddbimporter?.dndbeyond?.originalName);

    for (const name of this._getItemLookupNames(item)) {
      pushIdentifier(this._identifierFromName(name));
    }

    return identifiers;
  }

  _getItemLookupSignatures(item) {
    const signatures = [];
    const descriptions = [
      this._extractItemDescription(item),
      item?.system?.description?.value ?? ""
    ].map((value) => normalizeText(value)).filter(Boolean);

    for (const name of this._getItemLookupNames(item)) {
      for (const content of descriptions.length ? descriptions : [""]) {
        const key = signatureFor({
          type: item?.type,
          name,
          content
        });
        if (!signatures.includes(key)) signatures.push(key);
      }
    }

    return signatures;
  }

  _extractCompendiumFolderLabels(pack) {
    const folders = pack?.folders?.contents ?? pack?.folders ?? [];
    const labels = {};
    for (const folder of folders) {
      if (!folder?.name) continue;
      labels[folder.name] = folder.name;
    }
    return Object.keys(labels).length ? labels : undefined;
  }

  _hasEnglishText(value = "") {
    return /[A-Za-z]/u.test(normalizeText(value));
  }

  _normalizePackFilter(packFilter) {
    if (!packFilter) return null;
    if (packFilter instanceof Set) return packFilter;
    if (Array.isArray(packFilter)) {
      return new Set(packFilter.map((value) => normalizeText(value)).filter(Boolean));
    }
    if (typeof packFilter === "string") {
      return new Set(packFilter.split(",").map((value) => normalizeText(value)).filter(Boolean));
    }
    return null;
  }

  _shouldIncludeCompendiumPack(pack, { includeSystemCompendiums = false, filter = null } = {}) {
    if (!pack?.collection) return false;
    if (filter?.size && !filter.has(pack.collection)) return false;
    if (!includeSystemCompendiums && pack.collection.startsWith("dnd5e.")) return false;
    return true;
  }

  _getWorldLabelByUuid(uuid) {
    return this.world.actors.get(uuid)?.name
      ?? this.world.items.get(uuid)?.name
      ?? this.world.actorItems.get(uuid)?.name
      ?? this.world.journalPages.get(uuid)?.name
      ?? null;
  }

  _getCompendiumEntry(collection, entryName) {
    const entry = this.compendium.get(collection)?.entries?.[entryName] ?? null;
    if (!entry) return null;
    const generatedName = formatBilingualName(entryName, nameToKo(entryName));
    return {
      ...entry,
      name: formatBilingualName(entryName, entry.name) || generatedName
    };
  }

  _getGeneratedItemTranslation(item) {
    const translatedName = nameToKo(item?.name);
    const translatedDescription = this._translateGeneratedDescription(item?.system?.description?.value ?? "");
    if (translatedName === item?.name && translatedDescription === (item?.system?.description?.value ?? "")) {
      return null;
    }
    return {
      name: formatBilingualName(item?.name, translatedName),
      description: translatedDescription
    };
  }

  _getGeneratedActorTranslation(actor) {
    const originalDescription = this._extractActorDescription(actor);
    const translatedName = nameToKo(actor?.name);
    const translatedDescription = this._translateGeneratedDescription(originalDescription);
    if (translatedName === actor?.name && translatedDescription === originalDescription) {
      return null;
    }
    return {
      name: formatBilingualName(actor?.name, translatedName),
      description: translatedDescription
    };
  }

  _getGeneratedPageTranslation(page) {
    const originalText = page?.text?.content ?? "";
    const translatedName = nameToKo(page?.name);
    const translatedText = this._translateGeneratedDescription(originalText);
    if (translatedName === page?.name && translatedText === originalText) {
      return null;
    }
    return {
      name: formatBilingualName(page?.name, translatedName),
      text: translatedText
    };
  }

  _mergeCompendiumEntry(entry, generated, original = {}) {
    if (!entry && !generated) return null;

    const merged = {
      ...(entry ?? {})
    };

    if (generated?.name) {
      merged.name = preferGeneratedText(merged.name, generated.name, original.name ?? "");
    }

    if (generated?.description) {
      merged.description = preferGeneratedText(merged.description, generated.description, original.description ?? "");
    }

    if (generated?.text) {
      merged.text = preferGeneratedText(merged.text, generated.text, original.text ?? "");
    }

    return merged;
  }

  _withFormattedName(sourceName, translation) {
    if (!translation?.name) return translation ?? null;
    return {
      ...translation,
      name: formatBilingualName(sourceName, translation.name)
    };
  }

  _scoreTranslationValue(value) {
    if (!value) return Number.NEGATIVE_INFINITY;
    const raw = String(value ?? "");
    const visible = stripHtmlText(raw)
      .replace(/__FVTTTOK[_\s-]*\d+__?/gu, " ")
      .replace(/&amp;Reference\[[^\]]+\](?:\{[^}]*\})?/gu, " ")
      .replace(/&Reference\[[^\]]+\](?:\{[^}]*\})?/gu, " ")
      .replace(/@[A-Za-z]+(?:\[[^\]]*\])(?:\{[^}]*\})?/gu, " ")
      .replace(/\[\[\/[^\]]+\]\]/gu, " ");
    const hangul = (visible.match(/[\u3131-\u318E\uAC00-\uD7A3]/gu) ?? []).length;
    const english = (visible.match(/[A-Za-z]/gu) ?? []).length;
    const corruption = (raw.match(/__FVTTTOK|FVT\s*TTOK|_ _FVTTTOK|\?{2,}|[�쏮먮]/gu) ?? []).length;
    return (hangul * 3) - english - (corruption * 40);
  }

  _pickPreferredTranslationValue(currentValue, nextValue) {
    if (!nextValue) return currentValue;
    if (!currentValue) return nextValue;

    const currentScore = this._scoreTranslationValue(currentValue);
    const nextScore = this._scoreTranslationValue(nextValue);
    if (nextScore > currentScore + 15) return nextValue;
    return currentValue;
  }

  _mergeTranslations(...translations) {
    const merged = {};

    for (const translation of translations) {
      if (!translation) continue;
      merged.name = this._pickPreferredTranslationValue(merged.name, translation.name);
      merged.description = this._pickPreferredTranslationValue(merged.description, translation.description);
      merged.text = this._pickPreferredTranslationValue(merged.text, translation.text);
    }

    return Object.keys(merged).length ? merged : null;
  }

  _translateGeneratedDescription(description) {
    if (!description) return description;

    let current = String(description ?? "").replace(/\u00a0/gu, " ");
    for (let pass = 0; pass < 4; pass += 1) {
      const next = this._translateGeneratedDescriptionPass(current);
      if (next === current) return next;
      current = next;
    }

    return current;
  }

  _translateGeneratedDescriptionPass(description) {
    const source = String(description ?? "").replace(/\u00a0/gu, " ");
    const template = document.createElement("template");
    template.innerHTML = source;

    const walker = document.createTreeWalker(template.content, NodeFilter.SHOW_TEXT, {
      acceptNode: (node) => {
        if (!normalizeText(node.textContent)) return NodeFilter.FILTER_REJECT;
        const parentTag = node.parentElement?.tagName?.toUpperCase?.() ?? "";
        if (parentTag && ["SCRIPT", "STYLE"].includes(parentTag)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const textNodes = [];
    while (walker.nextNode()) textNodes.push(walker.currentNode);
    for (const node of textNodes) {
      node.textContent = this._translateGeneratedTextSegment(node.textContent);
    }

    let output = template.innerHTML
      .replace(/\u00a0/gu, " ")
      .replace(/<span class="No-Break">([^<]+)<\/span>/gu, "$1")
      .replace(/<h1>Description<\/h1>/gu, "<h1>설명</h1>")
      .replace(/<h1>Class Features<\/h1>/gu, "<h1>클래스 특성</h1>")
      .replace(/title="Source:\s*/gu, 'title="출처: ')
      .replace(/<caption>Twilight Deities<\/caption>/gu, "<caption>황혼의 신들</caption>")
      .replace(/<caption>Knowledge Domain Spells<\/caption>/gu, "<caption>지식 권역 주문</caption>")
      .replace(/<th class="ve-col-6 ve-text-center" data-rd-isroller="false">Example Deity<\/th>/gu, '<th class="ve-col-6 ve-text-center" data-rd-isroller="false">예시 신격</th>')
      .replace(/<th class="ve-col-6 ve-text-center" data-rd-isroller="false">Pantheon<\/th>/gu, '<th class="ve-col-6 ve-text-center" data-rd-isroller="false">판테온</th>')
      .replace(/<th class="ve-col-2 ve-text-center" data-rd-isroller="false">Cleric Level<\/th>/gu, '<th class="ve-col-2 ve-text-center" data-rd-isroller="false">클레릭 레벨</th>')
      .replace(/<strong>Hit Die:<\/strong>/gu, "<strong>히트 다이스:</strong>")
      .replace(/<strong>Primary Ability:<\/strong>/gu, "<strong>주요 능력:</strong>")
      .replace(/<strong>Saves:<\/strong>/gu, "<strong>내성:</strong>")
      .replace(/This armor is cursed, a fact that is revealed only when an <strong>identify<\/strong> spell is cast on the armor or you attune to it\./gu, "이 갑옷은 저주받았으며, 그 사실은 갑옷에 <strong>식별</strong> 주문을 시전하거나 당신이 갑옷에 조율할 때에만 드러납니다.")
      .replace(/Attuning to the armor curses you until you are targeted by the (@UUID\[[^\]]+\](?:\{[^}]+\})?) spell or similar magic; removing the armor fails to end the curse\./gu, (_, spell) => `갑옷에 조율하면 ${spell} 주문이나 유사한 마법의 대상이 되기 전까지 저주가 이어지며, 갑옷을 벗는 것만으로는 저주가 끝나지 않습니다.`)
      .replace(/When you cast the spell and as a (?:bonus action|추가 행동) on your later turns, you can move the hand up to ([0-9]+) feet and then cause one of the following effects:/gu, (_, distance) => `주문을 시전할 때와 이후 당신의 턴에 추가 행동으로, 그 손을 최대 ${distance}피트까지 이동시킨 뒤 다음 효과 중 하나를 일으킬 수 있습니다:`)
      .replace(/<strong>Clenched Fist\.<\/strong>/gu, "<strong>쥔 주먹.</strong>")
      .replace(/<strong>Forceful Hand\.<\/strong>/gu, "<strong>강권의 손.</strong>")
      .replace(/<strong>Grasping Hand\.<\/strong>/gu, "<strong>붙잡는 손.</strong>")
      .replace(/<strong>Interposing Hand\.<\/strong>/gu, "<strong>가로막는 손.</strong>")
      .replace(/The hand strikes a target within 5 feet of it\./gu, "그 손은 자신으로부터 5피트 이내의 대상 하나를 내리칩니다.")
      .replace(/Make a melee spell attack\./gu, "근접 주문 공격을 합니다.")
      .replace(/The hand attempts to push a Huge or smaller creature within 5 feet of it\./gu, "그 손은 자신으로부터 5피트 이내의 거대형 이하 크리처 하나를 밀어내려 합니다.")
      .replace(/The target must succeed on a Strength saving throw, or the hand pushes the target up to ([0-9]+) feet plus a number of feet equal to five times your spellcasting ability modifier\./gu, (_, distance) => `대상은 근력 내성 굴림에 성공해야 하며, 실패하면 그 손이 대상을 최대 ${distance}피트에 더해 당신의 주문시전 능력 수정치의 다섯 배만큼 밀어냅니다.`)
      .replace(/The hand moves with the target, remaining within 5 feet of it\./gu, "그 손은 대상과 함께 이동하며, 대상의 5피트 이내에 머뭅니다.")
      .replace(/The hand attempts to grapple a Huge or smaller creature within 5 feet of it\./gu, "그 손은 자신으로부터 5피트 이내의 거대형 이하 크리처 하나를 붙잡으려 합니다.")
      .replace(/The target must succeed on a Dexterity saving throw, or the target has the Grappled condition, with an escape DC equal to your spell save DC\./gu, "대상은 민첩 내성 굴림에 성공해야 하며, 실패하면 당신의 주문 내성 DC와 같은 탈출 DC를 가진 붙잡힘 상태가 됩니다.")
      .replace(/While the hand grapples the target, you can take a (?:bonus action|추가 행동) to cause the hand to crush it, dealing ([^.]+?) to the target equal to ([0-9]+d[0-9]+) plus your spellcasting ability modifier\./gu, (_, damageType, damage) => `그 손이 대상을 붙잡고 있는 동안, 추가 행동으로 손이 대상을 짓뭉개게 하여 ${damage} + 당신의 주문시전 능력 수정치만큼의 ${damageType}를 입힐 수 있습니다.`)
      .replace(/Clenched Fist의 피해는 ([0-9]+)레벨을 넘는 슬롯 레벨마다 ([0-9]+d[0-9]+)씩 증가하고, Grasping Hand의 피해는 ([0-9]+d[0-9]+)씩 증가합니다\./gu, (_, level, fistDamage, graspDamage) => `쥔 주먹의 피해는 ${level}레벨을 넘는 슬롯 레벨마다 ${fistDamage}씩 증가하고, 붙잡는 손의 피해는 ${graspDamage}씩 증가합니다.`)
      .replace(/It manifests in an unoccupied space that you can see within range and uses the <strong>Aberrant Spirit<\/strong> stat block\./gu, "사거리 내에서 당신이 볼 수 있는 비어 있는 공간에 나타나며 <strong>Aberrant Spirit</strong> 능력치 블록을 사용합니다.")
      .replace(/<strong>Curse\.<\/strong>/gu, "<strong>저주.</strong>")
      .replace(/<strong>Immunities<\/strong>\s*&Reference\[psychic\]\{정신\}/gu, "<strong>면역</strong> &Reference[psychic]{정신}")
      .replace(/<strong>Senses<\/strong>\s*&Reference\[darkvision\]\{(?:Darkvision|암시야)\}\s*([0-9]+) ft\.; Passive Perception ([0-9]+)/gu, (_, distance, passive) => `<strong>감각</strong> &Reference[darkvision]{암시야} ${distance}피트; 수동 지각 ${passive}`)
      .replace(/<strong>Languages<\/strong>\s*Deep Speech, understands the languages you know/gu, "<strong>언어</strong> 심층어, 당신이 아는 언어를 이해함")
      .replace(/<strong>CR<\/strong>\s*None \(XP 0; PB equals your Proficiency Bonus\)/gu, "<strong>CR</strong> 없음 (XP 0; PB는 당신의 숙련 보너스와 같음)")
      .replace(/<p>Medium Aberration, Neutral<\/p>/gu, "<p>중형 변이체, 중립</p>")
      .replace(/<p><strong>AC<\/strong> 11 \+ the spell[’']s level<\/p>/gu, "<p><strong>AC</strong> 11 + 주문 레벨</p>")
      .replace(/<p><strong>HP<\/strong> 40 \+ 10 for each spell level above 4<\/p>/gu, "<p><strong>HP</strong> 40 + 4레벨을 넘는 주문 레벨마다 10</p>")
      .replace(/<p><strong>속도<\/strong> 30 ft\.; Fly 30 ft\. \(hover; Beholderkin only\)<\/p>/gu, "<p><strong>속도</strong> 30피트, 비행 30피트 (호버; 비홀더킨 전용)</p>")
      .replace(/&amp;Reference\[/gu, "&Reference[");

    return output;
  }

  _protectFoundryInlineSyntax(text) {
    const tokens = [];
    const protectedText = String(text ?? "").replace(
      /@[\w.-]+\[[^\]]+\](?:\{[^}]*\})?|&Reference\[[^\]]+\](?:\{[^}]*\})?|\[\[[\s\S]*?\]\]/gu,
      (match) => {
        const token = `__FVTT_TOKEN_${tokens.length}__`;
        tokens.push(match);
        return token;
      }
    );

    return { text: protectedText, tokens };
  }

  _restoreFoundryInlineSyntax(text, tokens = []) {
    return tokens.reduce(
      (output, token, index) => output.replaceAll(`__FVTT_TOKEN_${index}__`, token),
      String(text ?? "")
    );
  }

  _translateGeneratedTextSegment(text) {
    if (!text || !/[A-Za-z@&[]/u.test(text)) return text;

    const { text: protectedText, tokens } = this._protectFoundryInlineSyntax(text);
    let output = protectedText
      .replace(/At Higher Levels\./gu, "상위 레벨 시전.")
      .replace(/Using a Higher-Level Spell Slot\./gu, "상위 레벨 주문 슬롯 사용.")
      .replace(/Random Properties\./gu, "무작위 속성.")
      .replace(/Tattoo Attunement\./gu, "문신 조율.")
      .replace(/Damage Resistance\./gu, "피해 저항.")
      .replace(/Damage Absorption\./gu, "피해 흡수.")
      .replace(/Magic Tattoo Coverage/gu, "마법 문신 적용 범위")
      .replace(/Tattoo Rarity/gu, "문신 희귀도")
      .replace(/Area Covered/gu, "적용 부위")
      .replace(/Spellwrought Tattoo/gu, "주문새김 문신")
      .replace(/Spell Level/gu, "주문 레벨")
      .replace(/Save DC/gu, "내성 DC")
      .replace(/Attack Bonus/gu, "공격 보너스")
      .replace(/Produced by a special needle, this magic tattoo features ([^.]+?) designs\./gu, (_, design) => `특수한 바늘로 새겨지는 이 마법 문신은 ${colorToKo(design)} 무늬를 띱니다.`)
      .replace(/Produced by a special needle, this magic tattoo features designs that emphasize one color\./gu, "특수한 바늘로 새겨지는 이 마법 문신은 특정한 한 색을 강조한 무늬를 띱니다.")
      .replace(/To attune to this item, you hold the needle to your skin where you want the tattoo to appear, pressing the needle there throughout the attunement process\./gu, "이 물건에 조율하려면 문신이 나타나길 원하는 피부에 바늘을 대고, 조율이 끝날 때까지 그 자리에 계속 눌러 두어야 합니다.")
      .replace(/When the attunement is complete, the needle turns into the ink that becomes the tattoo, which appears on the skin\./gu, "조율이 완료되면 바늘은 잉크로 변해 피부 위에 문신으로 나타납니다.")
      .replace(/If your attunement to the tattoo ends, the tattoo vanishes, and the needle reappears in your space\./gu, "문신과의 조율이 끝나면 문신은 사라지고 바늘은 당신의 공간에 다시 나타납니다.")
      .replace(/While the tattoo is on your skin, you have resistance to a type of damage associated with that color, as shown on the table below\. The DM chooses the color or determines it randomly\./gu, "문신이 피부 위에 있는 동안 아래 표의 색과 연관된 피해 유형 하나에 저항을 가집니다. DM은 그 색을 정하거나 무작위로 결정합니다.")
      .replace(/While wearing this armor, you have Resistance to ([A-Za-z]+) damage\./gu, (_, type) => `이 갑옷을 착용하고 있는 동안 ${damageTypeToKo(type, { linked: true })} 피해에 저항을 가집니다.`)
      .replace(/While wearing this armor, you have resistance to ([A-Za-z]+) (?:damage|피해)\./gu, (_, type) => `이 갑옷을 착용하고 있는 동안 ${damageTypeToKo(type, { linked: true })} 피해에 저항을 가집니다.`)
      .replace(/When you take ([A-Za-z]+) damage, you can use your reaction to gain immunity against that instance of the damage, and you regain a number of hit points equal to half the damage you would have taken\./gu, (_, type) => `${damageTypeToKo(type, { linked: true })} 피해를 받을 때 반응을 사용해 그 한 번의 피해에 면역을 얻고, 원래 받았을 피해의 절반만큼 HP를 회복할 수 있습니다.`)
      .replace(/This armor is cursed, a fact that is revealed only when the Identify spell is cast on the armor or you attune to it\./gu, "이 갑옷은 저주받았으며, 그 사실은 갑옷에 식별 주문을 시전하거나 당신이 갑옷에 조율할 때에만 드러납니다.")
      .replace(/Attuning to the armor curses you until you are targeted by a Remove Curse spell or similar magic; removing the armor fails to end the curse\./gu, "갑옷에 조율하면 해제 주문이나 유사한 마법의 대상이 되기 전까지 저주가 이어지며, 갑옷을 벗는 것만으로는 저주가 끝나지 않습니다.")
      .replace(/While cursed, you have Vulnerability to two of the three damage types associated with the armor \(not the one to which it grants Resistance\)\./gu, "저주받은 동안에는 이 갑옷이 저항을 주는 피해 유형을 제외한 나머지 둘에 취약해집니다.")
      .replace(/Once this reaction is used, it can[’']t be used again until the next dawn\./gu, "이 반응은 한 번 사용하면 다음 새벽까지 다시 사용할 수 없습니다.")
      .replace(/This weapon has the following mastery property\./gu, "이 무기는 다음 숙련 특성을 가집니다.")
      .replace(/To use this property, you must have a feature that lets you use it\./gu, "이 특성을 사용하려면 이를 사용할 수 있게 해 주는 능력이 필요합니다.")
      .replace(/It obeys your verbal commands \(no action required by you\)\./gu, "이 존재는 당신의 언어 명령에 복종합니다(당신의 행동은 필요하지 않습니다).")
      .replace(/This special action can[’']t be used again until the next dawn\./gu, "이 특수 행동은 다음 새벽까지 다시 사용할 수 없습니다.")
      .replace(/A spell scroll bears the words of a single spell, written in a mystical cipher\./gu, "주문 두루마리에는 하나의 주문이 신비한 암호문으로 기록되어 있습니다.")
      .replace(/If the spell is on your class[’']s spell list, you can read the scroll and cast its spell without providing any material components\./gu, "그 주문이 당신의 클래스 주문 목록에 있다면, 물질 구성 요소 없이 두루마리를 읽어 주문을 시전할 수 있습니다.")
      .replace(/Otherwise, the scroll is unintelligible\./gu, "그렇지 않다면 두루마리의 내용을 이해할 수 없습니다.")
      .replace(/Casting the spell by reading the scroll requires the spell[’']s normal casting time\./gu, "두루마리를 읽어 주문을 시전할 때는 그 주문의 원래 시전 시간이 그대로 필요합니다.")
      .replace(/Once the spell is cast, the words on the scroll fade, and it crumbles to dust\./gu, "주문이 시전되면 두루마리의 글자는 사라지고 두루마리는 먼지로 부서집니다.")
      .replace(/If the casting is interrupted, the scroll is not lost\./gu, "시전이 방해받더라도 두루마리는 소모되지 않습니다.")
      .replace(/If the spell is on your class[’']s spell list but of a higher level than you can normally cast, you must make an ability check using your spellcasting ability to determine whether you cast it successfully\./gu, "그 주문이 당신의 클래스 주문 목록에 있지만 평소 시전 가능한 레벨보다 높다면, 주문시전 능력치로 능력 판정을 하여 시전 성공 여부를 결정해야 합니다.")
      .replace(/On a failed check, the spell disappears from the scroll with no other effect\./gu, "판정에 실패하면 주문은 아무런 추가 효과 없이 두루마리에서 사라집니다.")
      .replace(/A wizard spell on a spell scroll can be copied just as spells in spellbooks can be copied\./gu, "주문 두루마리에 적힌 위저드 주문은 주문서의 주문을 필사하듯 그대로 옮겨 적을 수 있습니다.")
      .replace(/If the check succeeds, the spell is successfully copied\./gu, "판정에 성공하면 주문 필사에 성공합니다.")
      .replace(/Whether the check succeeds or fails, the spell scroll is destroyed\./gu, "판정 성공 여부와 관계없이 주문 두루마리는 파괴됩니다.")
      .replace(/It manifests in an unoccupied space that you can see within range\./gu, "사정거리 내에서 당신이 볼 수 있는 비어 있는 공간에 나타납니다.")
      .replace(/The creature disappears when it drops to 0 hit points or when the spell ends\./gu, "그 크리처는 HP가 0이 되거나 주문이 종료되면 사라집니다.")
      .replace(/The creature is an ally to you and your companions\./gu, "그 크리처는 당신과 당신의 동료들에게 우호적입니다.")
      .replace(/In combat, the creature shares your initiative count, but it takes its turn immediately after yours\./gu, "전투 중에는 당신과 같은 이니셔티브 값을 사용하지만, 당신의 턴 직후에 자기 턴을 가집니다.")
      .replace(/If you don[’']t issue any, it takes the Dodge action and uses its move to avoid danger\./gu, "당신이 아무 명령도 내리지 않으면 회피 행동을 취하고, 위험을 피하는 데 이동을 사용합니다.")
      .replace(/Note: importing a class as an item is provided for display purposes only\. If you wish to import a class to a character sheet, please use the importer on the sheet instead\./gu, "참고: 클래스를 아이템으로 가져오는 기능은 표시용으로만 제공됩니다. 클래스를 캐릭터 시트로 가져오려면 시트에서 가져오기 기능을 사용하세요.")
      .replace(/Mastery: Vex\./gu, "숙련: 벡스.")
      .replace(/Cantrips? \(at will\):/gu, "캔트립 (상시 사용 가능):")
      .replace(/At will:/gu, "상시 사용 가능:")
      .replace(/([1-9])\/day each:/gu, (_, uses) => `각각 하루 ${uses}회:`)
      .replace(/([1-9])\/day:/gu, (_, uses) => `하루 ${uses}회:`)
      .replace(/([1-9]|1[0-9]|20)(st|nd|rd|th) level \(([0-9]+) slots?\):/gu, (_, level, __, slots) => `${level}레벨 (${slots} 슬롯):`)
      .replace(/([1-9]|1[0-9]|20)(st|nd|rd|th) level \(([0-9]+) slot\):/gu, (_, level, __, slots) => `${level}레벨 (${slots} 슬롯):`)
      .replace(/Melee Weapon Attack:/gu, "근접 무기 공격:")
      .replace(/Ranged Weapon Attack:/gu, "원거리 무기 공격:")
      .replace(/Melee Attack Roll:/gu, "근접 공격 굴림:")
      .replace(/Ranged Attack Roll:/gu, "원거리 공격 굴림:")
      .replace(/Melee Spell Attack:/gu, "근접 주문 공격:")
      .replace(/Ranged Spell Attack:/gu, "원거리 주문 공격:")
      .replace(/Strength Saving Throw:/gu, "근력 내성 굴림:")
      .replace(/Dexterity Saving Throw:/gu, "민첩 내성 굴림:")
      .replace(/Constitution Saving Throw:/gu, "건강 내성 굴림:")
      .replace(/Intelligence Saving Throw:/gu, "지능 내성 굴림:")
      .replace(/Wisdom Saving Throw:/gu, "지혜 내성 굴림:")
      .replace(/Charisma Saving Throw:/gu, "매력 내성 굴림:")
      .replace(/\bto hit\b/gu, "명중")
      .replace(/reach ([0-9]+) ft\./gu, "사거리 $1피트")
      .replace(/range ([0-9/]+) ft\./gu, "사거리 $1피트")
      .replace(/\bone target\b/gu, "목표 하나")
      .replace(/\bone creature\b/gu, "크리처 하나")
      .replace(/\btwo targets\b/gu, "목표 둘")
      .replace(/\bthree targets\b/gu, "목표 셋")
      .replace(/\bDamage Type\b/gu, "피해 유형")
      .replace(/\bColor\b/gu, "색상")
      .replace(/\bCommon\b/gu, "공통")
      .replace(/\bUncommon\b/gu, "비범")
      .replace(/\bVery Rare\b/gu, "매우 희귀")
      .replace(/\bRare\b/gu, "희귀")
      .replace(/\bLegendary\b/gu, "전설")
      .replace(/\bGreen\b/gu, colorToKo("green"))
      .replace(/\bBlue\b/gu, colorToKo("blue"))
      .replace(/\bRed\b/gu, colorToKo("red"))
      .replace(/\bWhite\b/gu, colorToKo("white"))
      .replace(/\bYellow\b/gu, colorToKo("yellow"))
      .replace(/\bBlack\b/gu, colorToKo("black"))
      .replace(/\bViolet\b/gu, colorToKo("violet"))
      .replace(/\bSilver\b/gu, colorToKo("silver"))
      .replace(/\bGold\b/gu, colorToKo("gold"))
      .replace(/\bOrange\b/gu, colorToKo("orange"))
      .replace(/>(Acid|Bludgeoning|Cold|Fire|Force|Lightning|Necrotic|Piercing|Poison|Psychic|Radiant|Slashing|Thunder)</gu, (_, type) => `>${damageTypeToKo(type, { linked: true })}<`)
      .replace(/<td>\s*(Acid|Bludgeoning|Cold|Fire|Force|Lightning|Necrotic|Piercing|Poison|Psychic|Radiant|Slashing|Thunder)\s*<\/td>/gu, (_, type) => `<td>${damageTypeToKo(type, { linked: true })}</td>`)
      .replace(/\b(Acid|Bludgeoning|Cold|Fire|Force|Lightning|Necrotic|Piercing|Poison|Psychic|Radiant|Slashing|Thunder) damage\b/gu, (_, type) => `${damageTypeToKo(type, { linked: true })} 피해`)
      .replace(/\b(Acid|Bludgeoning|Cold|Fire|Force|Lightning|Necrotic|Piercing|Poison|Psychic|Radiant|Slashing|Thunder) 피해\b/gu, (_, type) => `${damageTypeToKo(type, { linked: true })} 피해`)
      .replace(/\b([0-9dD]+(?:\s*\+\s*[0-9dD]+)*) ([A-Za-z]+) 피해\b/gu, (_, amount, type) => `${amount} ${damageTypeToKo(type, { linked: true })} 피해`)
      .replace(/\b([0-9dD]+(?:\s*\+\s*[0-9dD]+)*) ([A-Za-z]+) 피해([를은이가와도에])\b/gu, (_, amount, type, suffix) => `${amount} ${damageTypeToKo(type, { linked: true })} 피해${suffix}`)
      .replace(/<span class="entry-title-inner">Special\.<\/span>/gu, "<span class=\"entry-title-inner\">특수.</span>")
      .replace(/<i>Hit:<\/i>/gu, "<i>명중:</i>")
      .replace(/<i>Failure:<\/i>/gu, "<i>실패:</i>")
      .replace(/<i>Success:<\/i>/gu, "<i>성공:</i>")
      .replace(/On a failed save, /gu, "내성 굴림에 실패하면, ")
      .replace(/On a successful save, /gu, "내성 굴림에 성공하면, ")
      .replace(/taking ([^.]+?) on a failed save, or half as much damage on a successful one\./gu, (_, effect) => `실패 시 ${effect}를 받고, 성공 시 그 절반의 피해만 받습니다.`)
      .replace(/The target must succeed on a ([A-Za-z]+) saving throw or ([^.]+)\./gu, (_, ability, effect) => `대상은 ${abilityToKo(ability)} 내성 굴림에 성공해야 하며, 실패하면 ${effect}.`)
      .replace(/The target must make a ([A-Za-z]+) saving throw/gu, (_, ability) => `대상은 ${abilityToKo(ability)} 내성 굴림을 해야 합니다`)
      .replace(/If the target succeeds on its saving throw, ([^.]+)\./gu, (_, effect) => `대상이 내성 굴림에 성공하면, ${effect}.`)
      .replace(/If the saving throw fails by ([0-9]+) or more, ([^.]+)\./gu, (_, amount, effect) => `내성 굴림에 ${amount} 이상 차이로 실패하면, 추가로 ${effect}.`)
      .replace(/The creature wakes up if it takes damage or if another creature takes an action to shake it awake\./gu, "피해를 받거나 다른 생물이 행동을 사용해 흔들어 깨우면 그 생물은 깨어납니다.")
      .replace(/A creature can use its action to make a ([A-Za-z]+) check, freeing itself or another creature within its reach on a success\./gu, (_, ability) => `생물은 행동을 사용해 ${abilityToKo(ability)} 판정을 할 수 있으며, 성공하면 자신이나 손이 닿는 거리 내 다른 생물 하나를 풀어줄 수 있습니다.`)
      .replace(/A creature can take this damage only once per turn\./gu, "한 생물은 이 피해를 한 턴에 한 번만 받을 수 있습니다.")
      .replace(/This sticky, adhesive fluid ignites when exposed to air\./gu, "이 끈적하고 점착성 있는 액체는 공기에 노출되면 불이 붙습니다.")
      .replace(/As an action, you can throw this flask up to 20 feet, shattering it on impact\./gu, "행동으로 이 플라스크를 최대 20피트까지 던질 수 있으며, 충돌하면 산산이 부서집니다.")
      .replace(/Make a ranged attack against a creature or object, treating the alchemist[’']s fire as an improvised weapon\./gu, "연금술사의 불을 즉흥 무기로 취급하여 크리처나 물체 하나를 상대로 원거리 공격을 합니다.")
      .replace(/On a hit, the target takes\s*(__FVTT_TOKEN_\d+__) damage at the start of each of its turns\./gu, (_, damage) => `명중 시, 대상은 자신의 각 턴 시작마다 ${damage} 피해를 받습니다.`)
      .replace(/A creature can end this damage by using its action to make a DC 10 Dexterity check to extinguish the flames\./gu, "크리처는 행동을 사용해 DC 10 민첩 판정을 성공시켜 불길을 꺼 이 피해를 끝낼 수 있습니다.")
      .replace(/The spell captures some of the incoming energy, lessening its effect on you and storing it for your next melee attack\./gu, "주문이 밀려오는 에너지 일부를 붙잡아 당신에게 미치는 영향을 줄이고, 그 힘을 다음 근접 공격을 위해 저장합니다.")
      .replace(/You have resistance to the triggering damage type until the start of your next turn\./gu, "다음 턴 시작까지 방아쇠가 된 피해 유형에 저항을 가집니다.")
      .replace(/Also, the first time you hit with a melee attack on your next turn, the target takes an extra ([^.]+?) damage of the triggering type, and the spell ends\./gu, (_, damage) => `또한 다음 턴에 처음으로 근접 공격을 명중시키면, 대상은 방아쇠가 된 피해 유형의 추가 ${damage} 피해를 받고 주문은 끝납니다.`)
      .replace(/An aura radiates from you in a 30-foot Emanation for the duration\./gu, "지속시간 동안 당신을 중심으로 30피트 발산 범위의 오라가 퍼져나갑니다.")
      .replace(/When you create the aura and at the start of each of your turns while it persists, you can restore ([^.]+?) Hit Points to one creature in it\./gu, (_, amount) => `오라를 처음 만들 때와 그 오라가 지속되는 동안 당신의 각 턴 시작마다, 그 안에 있는 크리처 하나의 HP를 ${amount}만큼 회복시킬 수 있습니다.`)
      .replace(/You brandish the weapon used in the spell[’']s casting and make a melee attack with it against one creature within 5 feet of you\./gu, "주문 시전에 사용한 무기를 치켜들고, 5피트 내의 크리처 하나를 상대로 그 무기로 근접 공격을 합니다.")
      .replace(/On a hit, the target suffers the weapon attack[’']s normal effects and then becomes sheathed in booming energy until the start of your next turn\./gu, "명중하면 목표는 무기 공격의 일반적인 효과를 받고, 다음 턴 시작까지 울려 퍼지는 에너지에 휩싸입니다.")
      .replace(/If the target willingly moves 5 feet or more before then, the target takes ([^.]+?) thunder damage, and the spell ends\./gu, (_, damage) => `그 전에 목표가 자발적으로 5피트 이상 이동하면 ${damage} 천둥 피해를 받고 주문은 끝납니다.`)
      .replace(/This spell[’']s damage increases when you reach certain levels\./gu, "이 주문의 피해는 특정 레벨에 도달하면 증가합니다.")
      .replace(/At 5th level, the melee attack deals an extra ([^.]+?) thunder damage to the target on a hit, and the damage the target takes for moving increases to ([^.]+?)\./gu, (_, damageA, damageB) => `5레벨부터는 근접 공격이 명중했을 때 목표에게 추가로 ${damageA} 천둥 피해를 주고, 이동했을 때 받는 피해는 ${damageB}로 증가합니다.`)
      .replace(/Both damage rolls increase by ([^.]+?) at 11th level \(([^)]+)\) and again at 17th level \(([^)]+)\)\./gu, (_, step, values11, values17) => `두 피해 굴림은 11레벨에 각각 ${step}씩 더 증가하고(${values11}), 17레벨에 다시 한 번 증가합니다(${values17}).`)
      .replace(/The target hit by the strike takes an extra ([^.]+?) Radiant damage from the attack, and the target has the Blinded condition until the spell ends\./gu, (_, damage) => `이 타격에 명중한 대상은 공격으로부터 추가 ${damage} 광휘 피해를 받고, 주문이 끝날 때까지 &Reference[condition=blinded]{실명} 상태가 됩니다.`)
      .replace(/At the end of each of its turns, the Blinded target makes a Constitution saving throw, ending the spell on itself on a success\./gu, "대상은 자신의 각 턴이 끝날 때마다 건강 내성 굴림을 하며, 성공하면 자신에게 걸린 이 주문을 끝냅니다.")
      .replace(/The creature disappears when it drops to 0 Hit Points or when the spell ends\./gu, "그 크리처는 HP가 0이 되거나 주문이 끝나면 사라집니다.")
      .replace(/The creature is an ally to you and your companions\./gu, "그 크리처는 당신과 당신의 동료들에게 우호적입니다.")
      .replace(/In combat, the creature shares your Initiative count, but it takes its turn immediately after yours\./gu, "전투 중 그 크리처는 당신과 같은 우선권을 공유하지만, 당신의 직후에 자신의 턴을 가집니다.")
      .replace(/If you don[’']t issue any, it takes the Dodge action and uses its move to avoid danger\./gu, "당신이 아무 명령도 내리지 않으면, 그 크리처는 회피 행동을 하고 위험을 피하기 위해 이동을 사용합니다.")
      .replace(/Use the spell slot[’']s level for the spell[’']s level in the stat block\./gu, "능력치 블록에 적힌 주문 레벨은 사용한 주문 슬롯의 레벨을 사용합니다.")
      .replace(/<strong><em>Regeneration \(Slaad Only\)\.<\/em><\/strong> The spirit regains 5 Hit Points at the start of its turn if it has at least 1 Hit Point\./gu, "<strong><em>재생 (슬라드 전용).</em></strong> 정령은 자신의 턴 시작 시 HP가 1 이상 남아 있다면 HP를 5 회복합니다.")
      .replace(/<strong><em>Whispering Aura \(Mind Flayer Only\)\.<\/em><\/strong> At the start of each of the spirit[’']s turns, the spirit emits psionic energy if it doesn[’']t have the Incapacitated condition\./gu, "<strong><em>속삭이는 오라 (마인드 플레이어 전용).</em></strong> 정령은 무력화 상태가 아니라면 자신의 각 턴 시작 시 사이오닉 에너지를 방출합니다.")
      .replace(/<strong><em>Multiattack\.<\/em><\/strong> The spirit makes a number of attacks equal to half this spell[’']s level \(round down\)\./gu, "<strong><em>다중공격.</em></strong> 정령은 이 주문 레벨의 절반(내림)과 같은 횟수만큼 공격합니다.")
      .replace(/<strong><em>Claw \(Slaad Only\)\.<\/em><\/strong>/gu, "<strong><em>발톱 (슬라드 전용).</em></strong>")
      .replace(/<strong><em>Eye Ray \(Beholderkin Only\)\.<\/em><\/strong>/gu, "<strong><em>안광선 (비홀더킨 전용).</em></strong>")
      .replace(/<strong><em>Psychic Slam \(Mind Flayer Only\)\.<\/em><\/strong>/gu, "<strong><em>정신 강타 (마인드 플레이어 전용).</em></strong>")
      .replace(/The damage is of the same type dealt by the original attack\./gu, "이 피해 유형은 원래 공격이 준 피해와 같습니다.")
      .replace(/The target drops whatever it is holding and then ends its turn\./gu, "대상은 들고 있는 것을 떨어뜨리고 그 턴을 끝냅니다.")
      .replace(/The target spends its turn moving away from you by the fastest available means\./gu, "대상은 가능한 가장 빠른 수단으로 당신에게서 멀어지는 데 자신의 턴을 사용합니다.")
      .replace(/Until the grapple ends, the target is ([^.]+)\./gu, (_, effect) => `붙잡기가 끝날 때까지 대상은 ${effect}.`)
      .replace(/The target moves toward you by the shortest and most direct route([^.]*)\./gu, (_, suffix) => `대상은 가장 짧고 직접적인 경로로 당신 쪽으로 이동합니다${suffix}.`)
      .replace(/It deals ([^.]+?) on a hit\./gu, (_, effect) => `명중 시 ${effect}를 줍니다.`)
      .replace(/On a hit, the target takes ([^.]+?)\./gu, (_, effect) => `명중 시, 대상은 ${effect}를 받습니다.`)
      .replace(/When you attack with this bite and hit a creature, ([^.]+)\./gu, (_, effect) => `이 물기로 생물을 공격해 명중시키면, ${effect}.`)
      .replace(/When a creature gains these temporary hit points, it can immediately use its reaction to move up to its speed, without provoking opportunity attacks\./gu, "어떤 생물이 이 임시 HP를 얻으면, 즉시 반응행동을 사용해 자신의 속도만큼 이동할 수 있으며 기회공격을 유발하지 않습니다.")
      .replace(/A Humanoid reduced to 0 hit points by this attack dies and instantly transforms into a free-willed shadow under the DM's control\./gu, "이 공격으로 HP가 0이 된 인간형은 죽으며, 즉시 DM의 통제 아래 있는 자유의지를 지닌 그림자로 변합니다.")
      .replace(/The priest casts (.+?), using the same spellcasting ability as Spellcasting\./gu, (_, spells) => `사제는 주문 시전과 같은 주문시전 능력치를 사용해 ${spells}을(를) 시전합니다.`)
      .replace(/When the vampirate is reduced to 0 hit points, it explodes in a cloud of ash\./gu, "뱀파이러트의 HP가 0이 되면, 잿빛 구름으로 폭발합니다.")
      .replace(/Any creature within 5 feet of it must succeed on a ([A-Za-z]+) saving throw or take ([^.]+)\./gu, (_, ability, effect) => `그것으로부터 5피트 이내의 모든 크리처는 ${abilityToKo(ability)} 내성 굴림에 성공해야 하며, 실패하면 ${effect}.`)
      .replace(/Immediately after another creature's turn, ([^.]+?) can expend a use to take one of the following actions\./gu, (_, subject) => `다른 생물의 턴 직후, ${subjectToKo(subject)}는 사용 횟수 1회를 소모해 다음 행동 중 하나를 할 수 있습니다.`)
      .replace(/([A-Z][^.]+?) can't take this action again until the start of its next turn\./gu, (_, subject) => `${subjectToKo(subject)}는 자신의 다음 턴 시작 전까지 이 행동을 다시 사용할 수 없습니다.`)
      .replace(/([A-Z][^.]+?) regains all expended uses at the start of each of its turns\./gu, (_, subject) => `${subjectToKo(subject)}는 자신의 각 턴 시작 시 소모한 모든 사용 횟수를 회복합니다.`)
      .replace(/If the dragon fails a saving throw, it can choose to succeed instead\./gu, "드래곤이 내성 굴림에 실패하면, 대신 성공으로 선택할 수 있습니다.")
      .replace(/Recharge ([0-9]-[0-9])\./gu, "재충전 $1.")
      .replace(/The target dies if its hit point maximum is reduced to 0\./gu, "대상의 최대 HP가 0이 되면 그 대상은 죽습니다.")
      .replace(/\bHalf damage\./gu, "절반 피해.")
      .replace(/\bdamage plus\b/gu, "피해에 더해")
      .replace(/\bdamage, or\b/gu, "피해, 또는")
      .replace(/\bdamage\./gu, "피해.")
      .replace(/if used with two hands to make a melee attack/gu, "두 손으로 근접 공격할 경우");

    output = output
      .replace(/You have a \+1 bonus to AC while wearing this armor\./gu, "이 갑옷을 착용하고 있는 동안 AC에 +1 보너스를 받습니다.")
      .replace(/You have a \+1 bonus to attack and damage rolls made with this magic weapon\./gu, "이 마법 무기로 하는 공격 굴림과 피해 굴림에 +1 보너스를 받습니다.")
      .replace(/This armor never gets dirty\./gu, "이 갑옷은 절대 더러워지지 않습니다.")
      .replace(/This crossbow has been fitted with a mechanism that allows it to be rapidly reloaded and fired in combat\. This weapon does not have the loading property\./gu, "이 크로스보우에는 전투 중 빠르게 장전하고 발사할 수 있는 장치가 달려 있습니다. 이 무기는 장전 속성을 가지지 않습니다.")
      .replace(/Rations consist of travel-ready food, including jerky, dried fruit, hardtack, and nuts\. See "@hazard\[Malnutrition\|XPHB\]" for the risks of not eating\./gu, "휴대식량은 육포, 건과일, 건빵, 견과류처럼 여행에 적합한 음식으로 이루어집니다. 굶주림의 위험은 \"@hazard[Malnutrition|XPHB]\"를 참조하세요.")
      .replace(/A yklwa \(pronounced YICK-ul-wah\) is a simple melee weapon that is the traditional weapon of Chultan warriors\. A yklwa consists of a 3-foot wooden shaft with a steel or stone blade up to 18 inches long\. Although it has the thrown weapon property, the yklwa is not well balanced for throwing\./gu, "이클와(발음: 이크-울-와)는 촐탄 전사들의 전통 무기인 단순 근접 무기입니다. 길이 3피트의 나무 자루 끝에 최대 18인치 길이의 강철 또는 돌 칼날이 달려 있습니다. 투척 속성을 지니고는 있지만, 던지기에 적합하도록 균형이 잘 잡힌 무기는 아닙니다.")
      .replace(/You can add your proficiency bonus to your initiative rolls\./gu, "우선권 굴림에 숙련 보너스를 더할 수 있습니다.")
      .replace(/You have proficiency in the &amp;Reference\[skill=Perception\] skill\./gu, "&amp;Reference[skill=Perception] 기술에 숙련을 갖습니다.")
      .replace(/You have advantage on saving throws against being &amp;Reference\[condition=charmed\], and magic can't put you to sleep\./gu, "&amp;Reference[condition=charmed] 상태가 되는 것에 대한 내성 굴림에 이점을 가지며, 마법으로 당신을 잠들게 할 수 없습니다.")
      .replace(/You can speak, read, and write Common and one other language of your choice\./gu, "공용어와 원하는 다른 언어 하나를 말하고, 읽고, 쓸 수 있습니다.")
      .replace(/You can speak, read, and write Common and two other languages of your choice\./gu, "공용어와 원하는 다른 언어 둘을 말하고, 읽고, 쓸 수 있습니다.")
      .replace(/Your size is Medium\./gu, "당신의 크기는 중형입니다.")
      .replace(/You are Medium or Small\. You choose the size when you select this race\./gu, "당신의 크기는 중형 또는 소형입니다. 이 종족을 선택할 때 크기를 고릅니다.")
      .replace(/When you fail a Dexterity saving throw, you can use your reaction to roll a \[\[\/r d4\]\] and add it to the save, potentially turning the failure into a success\. You can't use this reaction if you're &amp;Reference\[condition=prone\] or your speed is 0\./gu, "민첩 내성 굴림에 실패했을 때, 반응을 사용해 [[/r d4]]를 굴리고 그 결과를 내성 굴림에 더해 실패를 성공으로 바꿀 수 있습니다. 당신이 &amp;Reference[condition=prone] 상태이거나 속도가 0이라면 이 반응을 사용할 수 없습니다.")
      .replace(/As a bonus action, you can jump a number of feet equal to five times your proficiency bonus, without provoking opportunity attacks\. You can use this trait only if your speed is greater than 0\. You can use it a number of times equal to your proficiency bonus, and you regain all expended uses when you finish a long rest\./gu, "보너스 행동으로, 기회 공격을 유발하지 않고 자신의 숙련 보너스의 다섯 배에 해당하는 피트만큼 도약할 수 있습니다. 이 특성은 속도가 0보다 클 때만 사용할 수 있습니다. 이 특성은 숙련 보너스와 같은 횟수만큼 사용할 수 있으며, 긴 휴식을 마치면 소모한 사용 횟수를 모두 회복합니다.")
      .replace(/You know the @spell\[dancing lights\] cantrip\. When you reach 3rd level, you can cast the @spell\[faerie fire\] spell once per day; you must finish a long rest in order to cast the spell again using this trait\. When you reach 5th level, you can also cast the @spell\[darkness\] spell once per day; you must finish a long rest in order to cast the spell again using this trait\. Charisma is your spellcasting ability for these spells\./gu, "@spell[dancing lights] 캔트립을 알고 있습니다. 3레벨이 되면 @spell[faerie fire] 주문을 하루에 한 번 시전할 수 있으며, 이 특성으로 다시 시전하려면 긴 휴식을 마쳐야 합니다. 5레벨이 되면 @spell[darkness] 주문도 하루에 한 번 시전할 수 있으며, 이 특성으로 다시 시전하려면 긴 휴식을 마쳐야 합니다. 이 주문들의 주문시전 능력치는 매력입니다.")
      .replace(/You have proficiency with @item\[rapier\|phb\|rapiers\], @item\[shortsword\|phb\|shortswords\], and @item\[hand crossbow\|phb\|hand crossbows\]\./gu, "@item[rapier|phb|rapiers], @item[shortsword|phb|shortswords], @item[hand crossbow|phb|hand crossbows]에 숙련을 갖습니다.")
      .replace(/You gain proficiency with two of the following skills of your choice: &amp;Reference\[skill=Deception\], &amp;Reference\[skill=Insight\], &amp;Reference\[skill=Intimidation\], and &amp;Reference\[skill=Persuasion\]\./gu, "다음 기술 중 원하는 둘에 숙련을 얻습니다: &amp;Reference[skill=Deception], &amp;Reference[skill=Insight], &amp;Reference[skill=Intimidation], &amp;Reference[skill=Persuasion].")
      .replace(/This suit of technologically advanced plate armor includes an under-suit that can fully seal, a helmet with a full face mask and crystal lenses in the eyeholes, and a set of gauntlets\. The armor is powered by an @item\[energy cell\] stored in a compartment on the thigh plate\./gu, "이 기술적으로 진보한 판금 갑옷에는 완전히 밀폐되는 내부 슈트, 전면 가면과 눈구멍의 수정 렌즈가 달린 투구, 그리고 건틀릿 한 쌍이 포함됩니다. 이 갑옷은 허벅지 판의 수납칸에 보관된 @item[energy cell]로 동력을 얻습니다.")
      .replace(/Placing a full @item\[energy cell\] in the armor gives the armor 24 charges\. A suit of powered armor functions as a suit of normal plate armor, even when it has 0 charges remaining\./gu, "가득 찬 @item[energy cell]을 갑옷에 넣으면 갑옷은 24충전을 얻습니다. 동력 갑옷은 충전이 0 남았을 때도 일반 판금 갑옷처럼 기능합니다.")
      .replace(/As an action, you can expend any number of the armor's charges to activate it; the armor remains active for 1 hour per charge expended\. You can use a bonus action to deactivate the armor early, but doing so doesn't recover any expended charges\./gu, "행동으로 갑옷의 충전을 원하는 만큼 소모해 활성화할 수 있으며, 소모한 충전 1점마다 1시간 동안 갑옷이 활성 상태를 유지합니다. 보너스 행동으로 갑옷을 일찍 비활성화할 수 있지만, 그렇게 해도 소모한 충전은 회복되지 않습니다.")
      .replace(/While the armor is active, you gain the following benefits:/gu, "갑옷이 활성화되어 있는 동안 다음 이점을 얻습니다:")
      .replace(/You have advantage on Strength checks, and your carrying capacity is doubled\./gu, "근력 판정에 이점을 가지며, 운반 용량이 두 배가 됩니다.")
      .replace(/The armor seals airtight and provides its own atmosphere\. You can breathe normally in any environment and withstand extreme temperatures, and you're unaffected by harmful gases, as well as contact and inhaled poisons\./gu, "갑옷은 완전히 기밀하게 밀봉되며 자체적인 공기 환경을 제공합니다. 어떤 환경에서도 정상적으로 숨을 쉴 수 있고 극한의 온도도 견딜 수 있으며, 해로운 기체와 접촉성 및 흡입성 독의 영향을 받지 않습니다.")
      .replace(/When you would take damage, you can use your reaction to expend 1 of the armor's charges to deploy a defensive force field\. Roll \[\[\/r 3d10\]\] and reduce the damage taken by the total rolled\./gu, "피해를 입으려 할 때, 반응을 사용해 갑옷의 충전 1점을 소모하고 방어용 역장을 전개할 수 있습니다. [[/r 3d10]]을 굴려 나온 총합만큼 받는 피해를 줄입니다.")
      .replace(/As a bonus action, you can expend 1 of the armor's charges to gain a flying speed equal to your walking speed for 1 minute\. If you're airborne when this duration ends, you fall\./gu, "보너스 행동으로 갑옷의 충전 1점을 소모해 1분 동안 자신의 보행 속도와 같은 비행 속도를 얻을 수 있습니다. 이 지속시간이 끝났을 때 공중에 떠 있다면 추락합니다.")
      .replace(/While the armor has charges remaining, its @item\[energy cell\] can't be removed\. Once the armor has 0 charges, you can replace the @item\[energy cell\] with a new cell by using an action or a bonus action\./gu, "갑옷에 충전이 남아 있는 동안에는 @item[energy cell]을 제거할 수 없습니다. 갑옷의 충전이 0이 되면 행동 또는 보너스 행동으로 @item[energy cell]을 새 셀로 교체할 수 있습니다.")
      .replace(/If you hit a creature with this weapon and deal damage to the creature, you have @variantrule\[Advantage\|XPHB\] on your next attack roll against that creature before the end of your next turn\./gu, "이 무기로 생명체에게 명중시켜 피해를 입히면, 당신의 다음 턴이 끝나기 전까지 그 생명체를 상대로 하는 다음 공격 굴림에 @variantrule[Advantage|XPHB]를 받습니다.")
      .replace(/The ([^.]+?) can breathe air and water\./gu, (_, subject) => `${subjectToKo(subject)}는 공기와 물속에서 모두 숨을 쉴 수 있습니다.`)
      .replace(/If the ([^.]+?) fails a saving throw, it can choose to succeed instead\./gu, (_, subject) => `${subjectToKo(subject)}가 내성 굴림에 실패하면, 대신 성공하도록 선택할 수 있습니다.`)
      .replace(/The ([^.]+?) has advantage on saving throws against spells and other magical effects\./gu, (_, subject) => `${subjectToKo(subject)}는 주문 및 기타 마법 효과에 대한 내성 굴림에 이점을 받습니다.`)
      .replace(/The ([^.]+?) has advantage on Wisdom \(&amp;Reference\[skill=Perception\]\) checks that rely on smell\./gu, (_, subject) => `${subjectToKo(subject)}는 냄새에 의존하는 지혜 (&amp;Reference[skill=Perception]) 판정에 이점을 받습니다.`)
      .replace(/The ([^.]+?) has advantage on Wisdom \(&amp;Reference\[skill=Perception\]\) checks that rely on hearing or smell\./gu, (_, subject) => `${subjectToKo(subject)}는 청각이나 후각에 의존하는 지혜 (&amp;Reference[skill=Perception]) 판정에 이점을 받습니다.`)
      .replace(/The ([^.]+?) doesn't require air\./gu, (_, subject) => `${subjectToKo(subject)}는 공기를 필요로 하지 않습니다.`)
      .replace(/The ([^.]+?) makes one ([^.]+?) attack and one ([^.]+?) attack\./gu, (_, subject, attackA, attackB) => `${subjectToKo(subject)}는 ${nameToKo(attackA)} 공격 한 번과 ${nameToKo(attackB)} 공격 한 번을 합니다.`)
      .replace(/The ([^.]+?) makes one ([^.]+?) attack and two ([^.]+?) attacks\./gu, (_, subject, attackA, attackB) => `${subjectToKo(subject)}는 ${nameToKo(attackA)} 공격 한 번과 ${nameToKo(attackB)} 공격 두 번을 합니다.`)
      .replace(/The ([^.]+?) makes three ([^.]+?) attacks\./gu, (_, subject, attack) => `${subjectToKo(subject)}는 ${nameToKo(attack)} 공격을 세 번 합니다.`)
      .replace(/The ([^.]+?) makes one ([^.]+?) attack\./gu, (_, subject, attack) => `${subjectToKo(subject)}는 ${nameToKo(attack)} 공격을 한 번 합니다.`)
      .replace(/The ([^.]+?) moves up to half its @variantrule\[Speed\|XPHB\], and it makes one ([^.]+?) attack\./gu, (_, subject, attack) => `${subjectToKo(subject)}는 자신의 @variantrule[Speed|XPHB] 절반까지 이동한 뒤 ${nameToKo(attack)} 공격을 한 번 합니다.`)
      .replace(/The ([^.]+?) uses Spellcasting to cast (.+?)\./gu, (_, subject, spellPart) => `${subjectToKo(subject)}는 주문시전을 사용해 ${spellPart}를 시전합니다.`)
      .replace(/The ([^.]+?) casts the (.+?) spell, requiring no spell components and using Charisma as the spellcasting ability \(spell save DC ([0-9]+) ?\)\./gu, (_, subject, spellName, dc) => `${subjectToKo(subject)}는 ${spellName} 주문을 시전합니다. 이때 주문 구성 요소는 필요하지 않으며, 주문시전 능력치는 매력입니다 (주문 내성 DC ${dc}).`)
      .replace(/Hit:\s*([^.]+?) plus ([^.]+?)\./gu, (_, base, extra) => `명중: ${base}에 더해 ${extra}.`)
      .replace(/A master of martial combat, skilled with a variety of weapons and armor/gu, "다양한 무기와 갑옷에 능숙한 무예의 대가")
      .replace(/A wielder of magic that is derived from a bargain with an extraplanar entity/gu, "차원 너머 존재와의 계약에서 비롯된 마법을 휘두르는 자")
      .replace(/You learn maneuvers that are fueled by superiority dice\./gu, "당신은 전투 우월성 주사위로 구동되는 전술 기교를 배웁니다.")
      .replace(/Maneuvers enhance an attack in some way\./gu, "전술 기교는 공격을 다양한 방식으로 강화합니다.")
      .replace(/You have \[\[\/roll @scale\.battle-master\.combat-superiority\]\] superiority dice per short rest\./gu, "짧은 휴식마다 [[/roll @scale.battle-master.combat-superiority]]개의 전투 우월성 주사위를 가집니다.")
      .replace(/You have a pool of healing power that can restore \[\[@classes\.paladin\.levels\*5\]\] HP per long rest\./gu, "당신은 긴 휴식마다 [[@classes.paladin.levels*5]] HP를 회복할 수 있는 치유력 풀을 지닙니다.")
      .replace(/As an action, you can touch a creature to restore any number of HP remaining in the pool, or 5 HP to either cure a disease or neutralize a poison affecting the creature\./gu, "행동으로 크리처 하나에 접촉해 남아 있는 치유력 풀에서 원하는 만큼의 HP를 회복시키거나, HP 5점을 소모해 그 크리처를 괴롭히는 질병 하나를 치료하거나 독 하나를 중화할 수 있습니다.")
      .replace(/Your blessed touch can heal wounds\. You have a pool of healing power that replenishes when you take a long rest\./gu, "당신의 축복받은 손길은 상처를 치유합니다. 당신은 긴 휴식을 취하면 다시 차오르는 치유력 풀을 지닙니다.")
      .replace(/With that pool, you can restore a total number of hit points equal to your paladin level × 5\./gu, "이 풀로 당신은 팔라딘 레벨 × 5와 같은 총합의 HP를 회복시킬 수 있습니다.")
      .replace(/As an action, you can touch a creature and draw power from the pool to restore a number of hit points to that creature, up to the maximum amount remaining in your pool\./gu, "행동으로 크리처 하나에 접촉해 치유력 풀에서 힘을 끌어와, 그 풀에 남아 있는 최대치까지 원하는 만큼의 HP를 회복시킬 수 있습니다.")
      .replace(/Alternatively, you can expend 5 hit points from your pool of healing to cure the target of one disease or neutralize one poison affecting it\./gu, "또는 치유력 풀에서 HP 5점을 소모해 목표 하나의 질병 한 가지를 치료하거나 목표에게 영향을 주는 독 한 가지를 중화할 수 있습니다.")
      .replace(/You can cure multiple diseases and neutralize multiple poisons with a single use of Lay on Hands, expending hit points separately for each one\./gu, "치유의 손길 한 번으로 여러 질병을 치료하고 여러 독을 중화할 수 있지만, 각각에 대해 HP를 따로 소모해야 합니다.")
      .replace(/This feature has no effect on undead and constructs\./gu, "이 특성은 언데드와 구조물에게는 아무 효과가 없습니다.")
      .replace(/Healing energy radiates from you in an aura with a 30-foot radius\./gu, "치유 에너지가 당신으로부터 반경 30피트의 오라로 퍼져나갑니다.")
      .replace(/Until the spell ends, the aura moves with you, centered on you\./gu, "주문이 끝날 때까지 이 오라는 당신을 중심으로 함께 이동합니다.")
      .replace(/You can use a bonus action to cause one creature in the aura \(including you\) to regain ([^.]+?) hit points\./gu, (_, amount) => `보너스 행동으로 오라 안의 크리처 하나(당신 자신 포함)가 ${amount} HP를 회복하게 할 수 있습니다.`)
      .replace(/When you drink this potion, it cures any disease afflicting you, and it removes the blinded, deafened, paralyzed, and poisoned conditions\./gu, "이 물약을 마시면 당신을 괴롭히는 모든 질병을 치료하고, 실명, 청각 상실, 마비, 중독 상태를 제거합니다.")
      .replace(/The clear red liquid has tiny bubbles of light in it\./gu, "맑은 붉은 액체 안에는 작은 빛의 거품이 떠다닙니다.")
      .replace(/You draw the moisture from every creature in a ([0-9-]+-foot cube) centered on a point you choose within range\./gu, (_, area) => `사거리 내 당신이 선택한 한 지점을 중심으로 한 ${area} 범위 안의 모든 크리처로부터 수분을 빨아들입니다.`)
      .replace(/Each creature in that area must make a Constitution saving throw\./gu, "그 범위 안의 각 크리처는 건강 내성 굴림을 해야 합니다.")
      .replace(/Constructs and undead aren[’']t affected, and plants and water elementals make this saving throw with disadvantage\./gu, "구조물과 언데드는 영향을 받지 않으며, 식물과 물의 정령은 이 내성 굴림에 불리점을 받습니다.")
      .replace(/Nonmagical plants in the area that aren[’']t creatures, such as trees and shrubs, wither and die instantly\./gu, "그 범위 안의 비마법 식물(나무와 관목 등) 중 생물이 아닌 것은 즉시 시들어 죽습니다.")
      .replace(/A creature takes ([^.]+?) damage on a failed save, or half as much damage on a successful one\./gu, (_, damage) => `실패한 크리처는 ${damage} 피해를 받고, 성공한 크리처는 그 절반만 받습니다.`)
      .replace(/When you create the aura and at the start of each of your turns while it persists, you can restore ([^.]+?) Hit Points to (?:one creature|크리처 하나) in it\./gu, (_, amount) => `오라를 처음 만들 때와 그 오라가 지속되는 동안 당신의 각 턴 시작마다, 그 안에 있는 크리처 하나의 HP를 ${amount}만큼 회복시킬 수 있습니다.`)
      .replace(/When you cast this spell using a spell slot of ([0-9]+)(?:st|nd|rd|th) level or higher, the extra damage increases by ([^.]+?) for each slot level above ([0-9]+)(?:st|nd|rd|th)\./gu, (_, slotLevel, amount, baseLevel) => `이 주문을 ${slotLevel}레벨 이상의 주문 슬롯으로 시전하면, 추가 피해가 ${baseLevel}레벨을 넘는 슬롯 레벨마다 ${amount}씩 증가합니다.`)
      .replace(/When you cast this spell using a spell slot of ([0-9]+)(?:st|nd|rd|th) level or higher, the damage increases by ([^.]+?) for each slot level above ([0-9]+)(?:st|nd|rd|th)\./gu, (_, slotLevel, amount, baseLevel) => `이 주문을 ${slotLevel}레벨 이상의 주문 슬롯으로 시전하면, 피해가 ${baseLevel}레벨을 넘는 슬롯 레벨마다 ${amount}씩 증가합니다.`)
      .replace(/When you cast this spell using a spell slot of ([0-9]+)(?:st|nd|rd|th) level or higher, you can target one additional creature for each slot level above ([0-9]+)(?:st|nd|rd|th)\./gu, (_, slotLevel, baseLevel) => `이 주문을 ${slotLevel}레벨 이상의 주문 슬롯으로 시전하면, ${baseLevel}레벨을 넘는 슬롯 레벨마다 대상 크리처를 하나 더 지정할 수 있습니다.`)
      .replace(/The creatures must be within ([0-9]+) feet of each other when you target them\./gu, (_, distance) => `그 크리처들은 대상을 지정할 때 서로 ${distance}피트 이내에 있어야 합니다.`)
      .replace(/The Temporary Hit Points and the ([A-Za-z]+) damage both increase by ([0-9]+) for each spell slot level above ([0-9]+)\./gu, (_, type, amount, baseLevel) => `임시 HP와 ${damageTypeToKo(type, { linked: true })} 피해는 모두 ${baseLevel}레벨을 넘는 슬롯 레벨마다 ${amount}씩 증가합니다.`)
      .replace(/The billowing flames of a dragon blast from your feet, granting you explosive speed\./gu, "용의 불꽃이 당신의 발밑에서 폭발하듯 솟구치며 폭발적인 속도를 부여합니다.")
      .replace(/For the duration, your speed increases by ([0-9]+) feet and moving doesn[’']t provoke opportunity attacks\./gu, (_, distance) => `지속시간 동안 당신의 속도는 ${distance}피트 증가하며, 이동해도 기회공격을 유발하지 않습니다.`)
      .replace(/When you move within 5 feet of a creature or an object that isn[’']t being worn or carried, it takes ([^.]+?) fire damage from your trail of heat\./gu, (_, amount) => `당신이 크리처나 착용하거나 들고 있지 않은 물체의 5피트 이내로 이동하면, 그 대상은 당신이 남긴 열기의 자취로 ${amount} 화염 피해를 받습니다.`)
      .replace(/A creature or object can take this damage only once during a turn\./gu, "한 크리처나 물체는 한 턴 동안 이 피해를 한 번만 받을 수 있습니다.")
      .replace(/When you cast this spell using a spell slot of ([0-9]+)(?:st|nd|rd|th) level or higher, increase your speed by ([0-9]+) feet for each spell slot level above ([0-9]+)(?:st|nd|rd|th)\. The spell deals an additional ([^.]+?) ([A-Za-z]+) damage for each slot level above ([0-9]+)(?:st|nd|rd|th)\./gu, (_, slotLevel, speed, baseLevel, amount, type, damageBase) => `이 주문을 ${slotLevel}레벨 이상의 주문 슬롯으로 시전하면, ${baseLevel}레벨을 넘는 슬롯 레벨마다 속도가 ${speed}피트씩 증가합니다. 또한 주문은 ${damageBase}레벨을 넘는 슬롯 레벨마다 추가로 ${amount} ${damageTypeToKo(type, { linked: true })} 피해를 줍니다.`)
      .replace(/You awaken the sense of mortality in (?:one creature|크리처 하나) you can see within range\./gu, "사거리 내에서 당신이 볼 수 있는 크리처 하나에게 죽음의 감각을 일깨웁니다.")
      .replace(/A construct or an undead is immune to this effect\./gu, "구조물과 언데드는 이 효과에 면역입니다.")
      .replace(/대상은 지혜 내성 굴림에 성공해야 하며, 실패하면 become frightened of you until the spell ends\./gu, "대상은 지혜 내성 굴림에 성공해야 하며, 실패하면 주문이 끝날 때까지 당신을 두려워하게 됩니다.")
      .replace(/The frightened target can repeat the saving throw at the end of each of its turns, ending the effect on itself on a success\./gu, "두려움에 빠진 대상은 자신의 각 턴 종료 시마다 내성 굴림을 다시 할 수 있으며, 성공하면 자신에게 걸린 효과를 끝냅니다.")
      .replace(/You hurl an undulating, warbling mass of chaotic energy at (?:one creature|크리처 하나) in range\./gu, "사정거리 내의 크리처 하나를 향해 요동치며 울려 퍼지는 혼돈의 에너지 덩어리를 던집니다.")
      .replace(/명중 시, 대상은 ([^.]+?) damage를 받습니다\./gu, (_, amount) => `명중 시, 대상은 ${amount} 피해를 받습니다.`)
      .replace(/Choose one of the d8s\. The number rolled on that die determines the attack[’']s damage type, as shown below\./gu, "d8 중 하나를 선택합니다. 그 주사위에 나온 숫자가 아래 표에 따라 공격의 피해 유형을 결정합니다.")
      .replace(/If you roll the same number on both d8s, the chaotic energy leaps from the target to a different creature of your choice within ([0-9]+) feet of it\./gu, (_, distance) => `두 d8에서 같은 숫자가 나오면, 혼돈의 에너지는 대상에게서 ${distance}피트 이내에 있는 다른 크리처 하나에게 도약합니다.`)
      .replace(/Make a new attack roll against the new target, and make a new damage roll, which could cause the chaotic energy to leap again\./gu, "새 대상에게 새로운 공격 굴림을 하고 새 피해 굴림을 합니다. 그 결과 혼돈의 에너지가 다시 도약할 수도 있습니다.")
      .replace(/A creature can be targeted only once by each casting of this spell\./gu, "한 크리처는 이 주문 한 번의 시전마다 한 번만 대상이 될 수 있습니다.")
      .replace(/When you cast this spell using a spell slot of ([0-9]+)(?:st|nd|rd|th) level or higher, each target takes ([^.]+?) extra damage of the type rolled for each slot level above ([0-9]+)(?:st|nd|rd|th)\./gu, (_, slotLevel, amount, baseLevel) => `이 주문을 ${slotLevel}레벨 이상의 주문 슬롯으로 시전하면, 각 대상은 ${baseLevel}레벨을 넘는 슬롯 레벨마다 굴린 피해 유형의 추가 ${amount} 피해를 받습니다.`)
      .replace(/When you take the Attack action, you can replace one of your attacks with throwing a vial of Acid\. Target (?:one creature|크리처 하나) or object you can see within ([0-9]+) feet of yourself\. The target must succeed on a Dexterity saving throw \(DC 8 plus your Dexterity modifier and Proficiency Bonus\) or take\s*(__FVTT_TOKEN_\d+__) (?:damage|피해)\./gu, (_, distance, damage) => `공격 행동을 할 때 공격 하나를 산성 병을 던지는 것으로 대체할 수 있습니다. 자신으로부터 ${distance}피트 이내에서 볼 수 있는 크리처 하나 또는 물체 하나를 대상으로 삼습니다. 대상은 DC 8 + 당신의 민첩 수정치 + 숙련 보너스의 민첩 내성 굴림에 성공해야 하며, 실패하면 ${damage} 피해를 받습니다.`)
      .replace(/When you take damage of the chosen type, you can use your reaction to gain immunity against that instance of the damage, and you regain a number of hit points equal to half the damage you would have taken\./gu, "선택한 피해 유형의 피해를 받을 때 반응을 사용해 그 한 번의 피해에 면역이 될 수 있으며, 원래 받았을 피해의 절반만큼 HP를 회복합니다.")
      .replace(/While wearing this armor, you have resistance to ([A-Za-z]+) 피해\./gu, (_, type) => `이 갑옷을 착용하고 있는 동안 ${damageTypeToKo(type, { linked: true })} 피해에 저항을 가집니다.`)
      .replace(/While cursed, you have vulnerability to ([A-Za-z]+) and ([A-Za-z]+) 피해\./gu, (_, typeA, typeB) => `저주받은 동안 ${damageTypeToKo(typeA, { linked: true })} 피해와 ${damageTypeToKo(typeB, { linked: true })} 피해에 취약해집니다.`)
      .replace(/명중 시, 대상은\s*(__FVTT_TOKEN_\d+__) damage at the start of each of its turns를 받습니다\./gu, (_, damage) => `명중 시, 대상은 자신의 각 턴 시작마다 ${damage} 피해를 받습니다.`)
      .replace(/<strong>Curse\.<\/strong>/gu, "<strong>저주.</strong>")
      .replace(/<strong>identify<\/strong>/gu, "<strong>식별<\/strong>")
      .replace(/\bDamage Threshold\b/gu, "피해 한계")
      .replace(/\bCrew\b/gu, "승무원")
      .replace(/\bPassengers\b/gu, "승객")
      .replace(/\bCargo\b/gu, "적재량")
      .replace(/\bTemporary Hit Points\b/gu, "임시 HP")
      .replace(/\bBonus Action\b/gu, "추가 행동")
      .replace(/\bDisadvantage\b/gu, "불리점")
      .replace(/\bAdvantage\b/gu, "이점")
      .replace(/\bImmunity to\b/gu, "면역:")
      .replace(/\bImmunities\b/gu, "면역")
      .replace(/\bResistance to\b/gu, "저항:")
      .replace(/\bVulnerability to\b/gu, "취약:")
      .replace(/\bThe spell ends early if you have no Temporary Hit Points\./gu, "당신에게 임시 HP가 남아 있지 않으면 주문은 일찍 끝납니다.")
      .replace(/\bThe spell ends early if you have no 임시 HP\./gu, "당신에게 임시 HP가 남아 있지 않으면 주문은 일찍 끝납니다.")
      .replace(/Protective magical frost surrounds you\./gu, "보호하는 마법의 서리가 당신을 둘러쌉니다.")
      .replace(/You gain ([0-9]+) Temporary Hit Points\./gu, (_, amount) => `당신은 임시 HP ${amount}를 얻습니다.`)
      .replace(/You gain ([0-9]+) 임시 HP\./gu, (_, amount) => `당신은 임시 HP ${amount}를 얻습니다.`)
      .replace(/If a creature hits you with a melee attack roll before the spell ends, the creature takes ([0-9]+) ([A-Za-z]+) 피해\./gu, (_, amount, type) => `주문이 끝나기 전에 어떤 크리처가 근접 공격 굴림으로 당신을 명중시키면, 그 크리처는 ${amount} ${damageTypeToKo(type, { linked: true })} 피해를 받습니다.`)
      .replace(/If a creature hits you with a melee attack roll before the spell ends, the creature takes ([^.]+?) 피해\./gu, (_, effect) => `주문이 끝나기 전에 어떤 크리처가 근접 공격 굴림으로 당신을 명중시키면, 그 크리처는 ${effect} 피해를 받습니다.`)
      .replace(/The 임시 HP and the ([A-Za-z]+) 피해 both increase by ([0-9]+) for each spell slot level above ([0-9]+)\./gu, (_, type, amount, baseLevel) => `임시 HP와 ${damageTypeToKo(type, { linked: true })} 피해는 모두 ${baseLevel}레벨을 넘는 슬롯 레벨마다 ${amount}씩 증가합니다.`)
      .replace(/The 임시 HP and the ([^.]+?) 피해 both increase by ([0-9]+) for each spell slot level above ([0-9]+)\./gu, (_, effect, amount, baseLevel) => `임시 HP와 ${effect} 피해는 모두 ${baseLevel}레벨을 넘는 슬롯 레벨마다 ${amount}씩 증가합니다.`)
      .replace(/You create a Large hand of shimmering magical energy in an unoccupied space that you can see within range\./gu, "사거리 내에서 당신이 볼 수 있는 비어 있는 공간에 반짝이는 마법 에너지로 이루어진 대형 손 하나를 만들어 냅니다.")
      .replace(/The hand lasts for the duration, and it moves at your command, mimicking the movements of your own hand\./gu, "그 손은 지속시간 동안 남아 있으며, 당신의 명령에 따라 움직이고 당신 손의 움직임을 흉내 냅니다.")
      .replace(/The hand is an object that has AC 20 and Hit Points equal to your Hit Point maximum\./gu, "그 손은 AC 20과 당신의 최대 HP와 같은 HP를 가진 물체입니다.")
      .replace(/If it drops to 0 Hit Points, the spell ends\./gu, "그 손의 HP가 0이 되면 주문은 끝납니다.")
      .replace(/The hand doesn[’']t occupy its space\./gu, "그 손은 자신의 공간을 점유하지 않습니다.")
      .replace(/When you cast the spell and as a Bonus Action on your later turns, you can move the hand up to ([0-9]+) feet and then cause one of the following effects:\./gu, (_, distance) => `주문을 시전할 때와 이후 당신의 턴에 추가 행동으로, 그 손을 최대 ${distance}피트까지 이동시킨 뒤 다음 효과 중 하나를 일으킬 수 있습니다.`)
      .replace(/When you cast the spell and as a 추가 행동 on your later turns, you can move the hand up to ([0-9]+) feet and then cause one of the following effects:\./gu, (_, distance) => `주문을 시전할 때와 이후 당신의 턴에 추가 행동으로, 그 손을 최대 ${distance}피트까지 이동시킨 뒤 다음 효과 중 하나를 일으킬 수 있습니다.`)
      .replace(/Make a ranged spell attack against the target\./gu, "대상을 상대로 원거리 주문 공격을 합니다.")
      .replace(/The hand grants you Half Cover against attacks and other effects that originate from its space or that pass through it\./gu, "그 손은 그 손의 공간에서 시작되거나 그 공간을 통과하는 공격 및 다른 효과에 대해 당신에게 반엄폐를 제공합니다.")
      .replace(/In addition, its space counts as Difficult Terrain for your enemies\./gu, "또한 그 손이 차지한 공간은 적에게 험난한 지형으로 간주됩니다.")
      .replace(/The damage of the Clenched Fist increases by ([^.]+?) and the damage of the Grasping Hand increases by ([^.]+?) for each spell slot level above ([0-9]+)\./gu, (_, fist, grasp, baseLevel) => `Clenched Fist의 피해는 ${baseLevel}레벨을 넘는 슬롯 레벨마다 ${fist}씩 증가하고, Grasping Hand의 피해는 ${grasp}씩 증가합니다.`)
      .replace(/Each creature in the line must make a Dexterity saving throw\./gu, "선 안에 있는 각 크리처는 민첩 내성 굴림을 해야 합니다.")
      .replace(/A line of roaring flame ([0-9]+) feet long and ([0-9]+) feet wide emanates from you in a direction you choose\./gu, (_, length, width) => `당신이 선택한 방향으로 길이 ${length}피트, 너비 ${width}피트의 포효하는 화염선이 당신에게서 뻗어 나갑니다.`)
      .replace(/You call forth a bestial spirit\./gu, "야수의 정령을 불러냅니다.")
      .replace(/This corporeal form uses the Bestial Spirit stat block\./gu, "이 실체화된 형상은 Bestial Spirit 능력치 블록을 사용합니다.")
      .replace(/When you cast the spell, choose an environment: Air, Land, or Water\./gu, "주문을 시전할 때 환경 하나를 선택합니다: 공중, 육지, 물.")
      .replace(/The creature resembles an animal of your choice that is native to the chosen environment, which determines certain traits in its stat block\./gu, "그 크리처는 선택한 환경에 서식하는 동물 하나를 닮으며, 그 선택이 능력치 블록의 일부 특성을 결정합니다.")
      .replace(/You call forth an aberrant spirit\./gu, "변이체의 정령을 불러냅니다.")
      .replace(/In combat, it shares your Initiative count, but it takes its turn immediately after yours\./gu, "전투 중에는 당신과 같은 이니셔티브 값을 사용하지만, 당신의 턴 직후에 자기 턴을 가집니다.")
      .replace(/If you don[’']t issue any, it takes the Dodge action and uses its movement to avoid danger\./gu, "당신이 아무 명령도 내리지 않으면 회피 행동을 취하고, 위험을 피하는 데 이동을 사용합니다.")
      .replace(/It manifests in an unoccupied space that you can see within range and uses the <strong>Aberrant Spirit<\/strong> stat block\./gu, "사거리 내에서 당신이 볼 수 있는 비어 있는 공간에 나타나며 <strong>Aberrant Spirit</strong> 능력치 블록을 사용합니다.")
      .replace(/When you cast the spell, choose Beholderkin, Mind Flayer, or Slaad\./gu, "주문을 시전할 때 Beholderkin, Mind Flayer, 또는 Slaad 중 하나를 선택합니다.")
      .replace(/The creature resembles an Aberration of that kind, which determines certain details in its stat block\./gu, "그 크리처는 선택한 종류의 변이체를 닮으며, 그 선택이 능력치 블록의 일부 세부 사항을 결정합니다.")
      .replace(/The creature is an ally to you and your allies\./gu, "그 크리처는 당신과 당신의 동료들에게 우호적입니다.")
      .replace(/When you cast this spell using a spell slot of ([0-9]+)(?:st|nd|rd|th) level or higher, use the higher level wherever the spell[’']s level appears in the stat block\./gu, (_, slotLevel) => `이 주문을 ${slotLevel}레벨 이상의 주문 슬롯으로 시전하면, 능력치 블록에서 주문 레벨이 언급되는 모든 곳에 더 높은 레벨을 사용합니다.`)
      .replace(/Use the spell slot’s level for the spell’s level in the stat block\./gu, "능력치 블록에서 주문 레벨이 언급되는 부분에는 사용한 주문 슬롯의 레벨을 사용합니다.")
      .replace(/Use the higher level wherever the spell[’']s level appears in the stat block\./gu, "능력치 블록에 주문 레벨이 적힌 곳마다 더 높은 레벨을 사용합니다.");
    output = this._translateKnownLongformText(output);
    output = applyLongformDescriptionReplacements(output);

    const normalizedOutput = normalizeText(output);
    const exactDamageType = damageTypeToKo(normalizedOutput, { linked: true });
    const translatedLabel = exactDamageType !== normalizedOutput
      ? exactDamageType
      : plainLabelToKo(normalizedOutput);
    const restored = this._restoreFoundryInlineSyntax(
      translatedLabel !== normalizedOutput ? translatedLabel : output,
      tokens
    );

    return restored.replace(/&amp;Reference\[/gu, "&Reference[");
  }

  _translateKnownLongformText(text) {
    return String(text ?? "")
      .replace(/(\d+)(?:st|nd|rd|th)-level ([A-Za-z][A-Za-z' -]+?) feature/gu, (_, level, featureName) => {
        const translatedFeature = nameToKo(featureName);
        return `${level}레벨 ${translatedFeature !== featureName ? translatedFeature : featureName} 특성`;
      })
      .replace(/Most folk are happy to welcome a bard into their midst\. Bards of the College of Whispers use this to their advantage\. They appear to be like other bards, sharing news, singing songs, and telling tales to the audiences they gather\. In truth, the College of Whispers teaches its students that they are wolves among sheep\. These bards use their knowledge and magic to uncover secrets and turn them against others through extortion and threats\./gu, "대부분의 사람들은 바드가 자신의 무리에 들어오는 것을 기쁘게 받아들입니다. 속삭임 학파의 바드들은 이를 자신들의 이점으로 삼습니다. 그들은 다른 바드들과 다를 바 없이 소식을 전하고, 노래를 부르고, 모여든 청중에게 이야기를 들려주는 것처럼 보입니다. 하지만 진실로 속삭임 학파는 제자들에게 자신들이 양 떼 사이의 늑대라고 가르칩니다. 이 바드들은 지식과 마법을 이용해 비밀을 파헤치고, 협박과 위협을 통해 그것을 다른 이들에게 불리하게 이용합니다.")
      .replace(/Many other bards hate the College of Whispers, viewing it as a parasite that uses a bard's reputation to acquire wealth and power\. For this reason, members of this college rarely reveal their true nature\. They typically claim to follow some other college, or they keep their actual calling secret in order to infiltrate and exploit royal courts and other settings of power\./gu, "많은 바드들은 속삭임 학파를 바드의 명성을 이용해 부와 권력을 얻는 기생충처럼 여기며 증오합니다. 그래서 이 학파의 구성원들은 좀처럼 자신의 본모습을 드러내지 않습니다. 대개는 다른 학파를 따른다고 주장하거나, 왕실과 권력의 중심에 침투해 이용하기 위해 자신의 진짜 소명을 숨깁니다.")
      .replace(/When you join the College of Whispers at 3rd level, you gain the ability to make your weapon attacks magically toxic to a creature's mind\./gu, "3레벨에 속삭임 학파에 들어서면, 무기 공격에 정신을 좀먹는 마법적 독성을 실을 수 있게 됩니다.")
      .replace(/When you hit a creature with a weapon attack, you can expend one use of your Bardic Inspiration to deal an extra (__FVTT_TOKEN_\d+__) damage to that target\. You can do so only once per round on your turn\./gu, (_, damage) => `크리처를 무기 공격으로 명중시키면, 바드의 고양감 사용 횟수 1회를 소모해 대상에게 추가로 ${damage} 피해를 줄 수 있습니다. 이는 자신의 턴마다 라운드당 한 번만 사용할 수 있습니다.`)
      .replace(/The psychic damage increases when you reach certain levels in this class, increasing to (__FVTT_TOKEN_\d+__) at 5th level, (__FVTT_TOKEN_\d+__) at 10th level, and (__FVTT_TOKEN_\d+__) at 15th level\./gu, (_, five, ten, fifteen) => `이 정신 피해는 이 클래스에서 특정 레벨에 도달하면 증가합니다. 5레벨에는 ${five}, 10레벨에는 ${ten}, 15레벨에는 ${fifteen}가 됩니다.`)
      .replace(/At 3rd level, you learn to infuse innocent-seeming words with an insidious magic that can inspire terror\./gu, "3레벨이 되면, 겉보기에는 무해한 말에 공포를 불러일으키는 음습한 마법을 실을 수 있게 됩니다.")
      .replace(/If you speak to a humanoid alone for at least 1 minute, you can attempt to seed paranoia in its mind\. At the end of the conversation, the target must succeed on a Wisdom saving throw against your spell save DC or be (__FVTT_TOKEN_\d+__) of you or another creature of your choice\. The target is (__FVTT_TOKEN_\d+__) in this way for 1 hour, until it is attacked or damaged, or until it witnesses its allies being attacked or damaged\./gu, (_, frightenedA, frightenedB) => `인간형 하나와 최소 1분 동안 단둘이 이야기하면, 그 마음속에 편집증의 씨앗을 심으려 시도할 수 있습니다. 대화가 끝날 때 대상은 당신의 주문 내성 DC에 대한 지혜 내성 굴림에 성공해야 하며, 실패하면 당신 또는 당신이 선택한 다른 크리처를 ${frightenedA} 상태로 두려워하게 됩니다. 대상은 이렇게 1시간 동안 ${frightenedB} 상태가 되며, 공격받거나 피해를 입거나, 자신의 동료가 공격받거나 피해를 입는 모습을 목격하면 이 효과는 끝납니다.`)
      .replace(/If the target succeeds on its saving throw, the target has no hint that you tried to frighten it\./gu, "대상이 내성 굴림에 성공하면, 당신이 자신을 겁주려 했다는 낌새를 전혀 알아채지 못합니다.")
      .replace(/대상이 내성 굴림에 성공하면, the target has no hint that you tried to frighten it\./gu, "대상이 내성 굴림에 성공하면, 당신이 자신을 겁주려 했다는 낌새를 전혀 알아채지 못합니다.")
      .replace(/Bards of the College of Swords are called blades, and they entertain through daring feats of weapon prowess\. Blades perform stunts such as sword swallowing, knife throwing and juggling, and mock combats\. Though they use their weapons to entertain, they are also highly trained and skilled warriors in their own right\./gu, "검의 학파 바드들은 블레이드라고 불리며, 대담한 무기 묘기로 사람들을 즐겁게 합니다. 블레이드들은 칼 삼키기, 단검 던지기와 저글링, 모의 결투 같은 곡예를 선보입니다. 이들은 무기를 공연에 쓰기도 하지만, 동시에 뛰어난 훈련을 받은 숙련된 전사이기도 합니다.")
      .replace(/Their talent with weapons inspires many blades to lead double lives\. One blade might use a circus troupe as cover for nefarious deeds such as assassination, robbery, and blackmail\. Other blades strike at the wicked, bringing justice to bear against the cruel and powerful\. Most troupes are happy to accept a blade's talent for the excitement it adds to a performance, but few entertainers fully trust a blade in their ranks\./gu, "무기에 대한 재능 때문에 많은 블레이드들은 이중생활을 합니다. 어떤 블레이드는 서커스 단원을 위장막으로 삼아 암살, 강도, 협박 같은 악행을 저지르기도 합니다. 또 다른 블레이드들은 악인을 응징하며 잔혹하고 강대한 자들에게 정의를 내립니다. 대부분의 극단은 공연에 긴장감과 흥분을 더해 주는 블레이드의 재능을 기꺼이 받아들이지만, 정작 단원으로서 완전히 신뢰하는 일은 드뭅니다.")
      .replace(/Blades who abandon their lives as entertainers have often run into trouble that makes maintaining their secret activities impossible\. A blade caught stealing or engaging in vigilante justice is too great a liability for most troupes\. With their weapon skills and magic, these blades either take up work as enforcers for thieves' guilds or strike out on their own as adventurers\./gu, "연예인으로서의 삶을 버린 블레이드들은 대개 비밀 활동을 더는 숨길 수 없게 만드는 문제에 부딪힌 경우가 많습니다. 절도나 사적 제재를 하다 들킨 블레이드는 대부분의 극단에게 너무 큰 위험 부담입니다. 이들은 무기 솜씨와 마법을 살려 도둑 길드의 집행자가 되거나, 스스로 모험가의 길에 나섭니다.")
      .replace(/When you join the College of Swords at 3rd level, you gain proficiency with medium armor and the (__FVTT_TOKEN_\d+__)\./gu, (_, scimitar) => `3레벨에 검의 학파에 들어서면, 중형 갑옷과 ${scimitar}에 대한 숙련을 얻습니다.`)
      .replace(/If you're proficient with a simple or martial melee weapon, you can use it as a spellcasting focus for your bard spells\./gu, "단순 또는 군용 근접 무기에 숙련되어 있다면, 그 무기를 바드 주문의 주문시전 매개체로 사용할 수 있습니다.")
      .replace(/At 3rd level, you adopt a style of fighting as your specialty\. Choose one of the following options\. You can't take a Fighting Style option more than once, even if something in the game lets you choose again\./gu, "3레벨이 되면 전투 방식을 자신의 전문으로 삼습니다. 다음 선택지 중 하나를 고르세요. 게임의 다른 효과로 다시 선택할 수 있게 되더라도, 같은 전투 스타일 선택지를 두 번 고를 수는 없습니다.")
      .replace(/When you are wielding a melee weapon in one hand and no other weapons, you gain a \+2 bonus to damage rolls with that weapon\./gu, "한 손에 근접 무기 하나만 들고 다른 무기를 들고 있지 않다면, 그 무기의 피해 굴림에 +2 보너스를 받습니다.")
      .replace(/When you engage in two-weapon fighting, you can add your ability modifier to the damage of the second attack\./gu, "양손 무기 전투를 할 때 두 번째 공격의 피해에 자신의 능력 수정치를 더할 수 있습니다.")
      .replace(/At 3rd level, you learn to perform impressive displays of martial prowess and speed\./gu, "3레벨이 되면 무예와 속도를 과시하는 인상적인 기예를 선보이는 법을 익힙니다.")
      .replace(/Whenever you take the (__FVTT_TOKEN_\d+__) action on your turn, your walking speed increases by 10 feet until the end of the turn, and if a weapon attack that you make as part of this action hits a creature, you can use one of the following Blade Flourish options of your choice\. You can use only one Blade Flourish option per turn\./gu, (_, attackAction) => `자신의 턴에 ${attackAction} 행동을 취할 때마다, 턴이 끝날 때까지 보행 속도가 10피트 증가합니다. 그리고 그 행동의 일부로 한 무기 공격이 크리처에게 명중하면, 다음 Blade Flourish 선택지 중 하나를 사용할 수 있습니다. 턴당 사용할 수 있는 Blade Flourish 선택지는 하나뿐입니다.`)
      .replace(/You can expend one use of your Bardic Inspiration to cause the weapon to deal extra damage to the target you hit\. The damage equals the number you roll on the Bardic Inspiration die\. You also add the number rolled to your AC until the start of your next turn\./gu, "바드의 고양감 사용 횟수 1회를 소모해 무기가 명중한 대상에게 추가 피해를 줄 수 있습니다. 그 피해량은 바드의 고양감 주사위 결과와 같습니다. 또한 다음 자신의 턴 시작까지 그 굴린 수만큼 AC에 더합니다.")
      .replace(/You can expend one use of your Bardic Inspiration to cause the weapon to deal extra damage to the target you hit\. The damage equals the number you roll on the Bardic Inspiration die\. You can also push the target up to 5 feet away from you, plus a number of feet equal to the number you roll on that die\. You can then immediately use your reaction to move up to your walking speed to an unoccupied space within 5 feet of the target\./gu, "바드의 고양감 사용 횟수 1회를 소모해 무기가 명중한 대상에게 추가 피해를 줄 수 있습니다. 그 피해량은 바드의 고양감 주사위 결과와 같습니다. 또한 대상을 자신에게서 최대 5피트에 더해 그 주사위에서 굴린 수만큼 더 밀어낼 수 있습니다. 그 후 즉시 반응을 사용해 대상의 5피트 이내 빈 공간까지 자신의 보행 속도만큼 이동할 수 있습니다.")
      .replace(/You can expend one use of your Bardic Inspiration to cause the weapon to deal extra damage to the target you hit and to any other creature of your choice that you can see within 5 feet of you\. The damage equals the number you roll on the Bardic Inspiration die\./gu, "바드의 고양감 사용 횟수 1회를 소모해 무기가 명중한 대상과, 자신으로부터 5피트 이내에서 볼 수 있는 다른 크리처 하나에게도 추가 피해를 줄 수 있습니다. 그 피해량은 바드의 고양감 주사위 결과와 같습니다.")
      .replace(/Starting at 14th level, whenever you use a Blade Flourish option, you can roll a (__FVTT_TOKEN_\d+__) and use it instead of expending a Bardic Inspiration die\./gu, (_, dieRoll) => `14레벨부터 Blade Flourish 선택지를 사용할 때마다, 바드의 고양감 주사위를 소모하는 대신 ${dieRoll}을 굴려 그 결과를 사용할 수 있습니다.`)
      .replace(/Monks of the Way of Mercy learn to manipulate the life force of others to bring aid to those in need\. They are wandering physicians to the poor and hurt\. However, to those beyond their help, they bring a swift end as an act of mercy\./gu, "자비의 길을 따르는 수도승은 타인의 생명력을 다뤄 도움이 필요한 이들에게 구원을 베푸는 법을 배웁니다. 그들은 가난한 이들과 상처 입은 이들을 찾아다니는 떠돌이 의사입니다. 하지만 자신들이 도울 수 없는 이들에게는 자비의 이름으로 빠른 끝을 가져다줍니다.")
      .replace(/Those who follow the Way of Mercy might be members of a religious order, administering to the needy and making grim choices rooted in reality rather than idealism\. Some might be gentle-voiced healers, beloved by their communities, while others might be masked bringers of macabre mercies\./gu, "자비의 길을 따르는 자들은 종교 단체의 일원일 수도 있으며, 이상론보다는 현실에 뿌리내린 냉혹한 선택을 하면서 궁핍한 자들을 돌봅니다. 어떤 이는 공동체의 사랑을 받는 온화한 말씨의 치유사이고, 또 어떤 이는 기괴한 자비를 가져오는 가면 쓴 집행자일 수도 있습니다.")
      .replace(/The walkers of this way usually don robes with deep cowls, and they often conceal their faces with masks, presenting themselves as the faceless bringers of life and death\./gu, "이 길을 걷는 이들은 보통 깊은 후드가 달린 로브를 걸치고, 자주 가면으로 얼굴을 가려 생명과 죽음을 가져오는 무명의 존재처럼 자신을 드러냅니다.")
      .replace(/You gain proficiency in the (__FVTT_TOKEN_\d+__) and (__FVTT_TOKEN_\d+__) skills, and you gain proficiency with the (__FVTT_TOKEN_\d+__)\./gu, (_, insight, medicine, kit) => `${insight} 기술과 ${medicine} 기술에 숙련을 얻고, ${kit}에도 숙련을 얻습니다.`)
      .replace(/You also gain a special mask, which you often wear when using the features of this subclass\. You determine its appearance, or generate it randomly by rolling on the Merciful Mask table\./gu, "또한 이 서브클래스의 특성을 사용할 때 자주 쓰게 되는 특별한 가면을 얻습니다. 그 외형은 직접 정하거나, 자비로운 가면 표를 굴려 무작위로 정할 수 있습니다.")
      .replace(/\bBlank and white\b/gu, "하얗고 무표정한 얼굴")
      .replace(/\bCrying visage\b/gu, "우는 얼굴")
      .replace(/\bLaughing visage\b/gu, "웃는 얼굴")
      .replace(/\bSkull\b/gu, "해골")
      .replace(/\bButterfly\b/gu, "나비")
      .replace(/Your mystical touch can mend wounds\. As an action, you can spend 1 ki point to touch a creature and restore a number of hit points equal to a roll of your Martial Arts die \+ your Wisdom modifier\./gu, "당신의 신비로운 손길은 상처를 봉합합니다. 행동으로 기 1점을 소모해 크리처 하나를 접촉하고, 무술 주사위 굴림 + 지혜 수정치와 같은 수치만큼 HP를 회복시킬 수 있습니다.")
      .replace(/When you use your Flurry of Blows, you can replace one of the unarmed strikes with a use of this feature without spending a ki point for the healing\./gu, "연타를 사용할 때, 비무장 공격 하나를 이 특성의 사용으로 대체할 수 있으며, 이때 치유를 위해 기 점수를 추가로 소모하지 않습니다.")
      .replace(/You use your ki to inflict wounds\. When you hit a creature with an unarmed strike, you can spend 1 ki point to deal extra necrotic damage equal to one roll of your Martial Arts die \+ your Wisdom modifier\. You can use this feature only once per turn\./gu, "당신은 기를 이용해 상처를 입힙니다. 비무장 공격으로 크리처를 명중시키면, 기 1점을 소모해 무술 주사위 1회 굴림 + 지혜 수정치와 같은 추가 괴사 피해를 줄 수 있습니다. 이 특성은 턴당 한 번만 사용할 수 있습니다.")
      .replace(/You can administer even greater cures with a touch, and if you feel it's necessary, you can use your knowledge to cause harm\./gu, "이제는 손길만으로도 더욱 강력한 치유를 베풀 수 있으며, 필요하다면 그 지식을 해를 끼치는 데에도 사용할 수 있습니다.")
      .replace(/When you use Hand of Healing on a creature, you can also end one disease or one of the following conditions affecting the creature: (__FVTT_TOKEN_\d+__), (__FVTT_TOKEN_\d+__), (__FVTT_TOKEN_\d+__), (__FVTT_TOKEN_\d+__), or (__FVTT_TOKEN_\d+__)\./gu, (_, blinded, deafened, paralyzed, poisoned, stunned) => `크리처에게 Hand of Healing을 사용하면, 그 크리처에게 걸린 질병 하나 또는 다음 상태 중 하나도 끝낼 수 있습니다: ${blinded}, ${deafened}, ${paralyzed}, ${poisoned}, ${stunned}.`)
      .replace(/When you use Hand of Harm on a creature, you can subject that creature to the (__FVTT_TOKEN_\d+__) condition until the end of your next turn\./gu, (_, poisoned) => `크리처에게 Hand of Harm을 사용하면, 그 크리처를 다음 자신의 턴이 끝날 때까지 ${poisoned} 상태로 만들 수 있습니다.`)
      .replace(/You can now mete out a flurry of comfort and hurt\. When you use Flurry of Blows, you can now replace each of the unarmed strikes with a use of your Hand of Healing, without spending ki points for the healing\./gu, "이제는 위로와 고통의 연속타를 퍼부을 수 있습니다. 연타를 사용할 때, 각 비무장 공격을 Hand of Healing의 사용으로 대체할 수 있으며, 이 치유를 위해 기 점수를 소모하지 않습니다.")
      .replace(/In addition, when you make an unarmed strike with Flurry of Blows, you can use Hand of Harm with that strike without spending the ki point for Hand of Harm\. You can still use Hand of Harm only once per turn\./gu, "또한 연타로 비무장 공격을 할 때, 그 공격과 함께 Hand of Harm을 사용하면서도 Hand of Harm에 필요한 기 1점을 소모하지 않을 수 있습니다. 그래도 Hand of Harm은 턴당 한 번만 사용할 수 있습니다.")
      .replace(/Your mastery of life energy opens the door to the ultimate mercy\. As an action, you can touch the corpse of a creature that died within the past 24 hours and expend 5 ki points\. The creature then returns to life, regaining a number of hit points equal to (__FVTT_TOKEN_\d+__) \+ your Wisdom modifier\. If the creature died while subject to any of the following conditions, it revives with them removed: (__FVTT_TOKEN_\d+__), (__FVTT_TOKEN_\d+__), (__FVTT_TOKEN_\d+__), (__FVTT_TOKEN_\d+__), and (__FVTT_TOKEN_\d+__)\./gu, (_, healing, blinded, deafened, paralyzed, poisoned, stunned) => `생명 에너지에 대한 당신의 숙달은 궁극의 자비로 가는 문을 엽니다. 행동으로 지난 24시간 안에 죽은 크리처의 시신을 접촉하고 기 5점을 소모할 수 있습니다. 그러면 그 크리처는 되살아나며, ${healing} + 당신의 지혜 수정치만큼 HP를 회복합니다. 그 크리처가 다음 상태 중 하나에 걸린 채 죽었다면, 되살아날 때 그 상태도 함께 제거됩니다: ${blinded}, ${deafened}, ${paralyzed}, ${poisoned}, ${stunned}.`)
      .replace(/Tapping into the forgotten craft called alchemy, you create wondrous inventions which bind magical effects into potions, elixirs and salves\. These magical draughts are easy to give to allies, who can use them directly, and the alchemist can mix powerful reagents into their own draughts to empower the effects\./gu, "연금술이라 불리는 잊힌 기예를 되살려, 당신은 마법 효과를 물약과 영약, 연고에 봉인한 경이로운 발명품을 만들어 냅니다. 이러한 마법 혼합물은 동료에게 건네기 쉬워 곧바로 사용할 수 있으며, 연금술사는 여기에 강력한 시약을 섞어 그 효과를 더욱 증폭시킬 수 있습니다.")
      .replace(/Your mastery of alchemy gives you access to additional spells to create wondrous inventions\. At 2nd, 3rd, 5th, 7th, and 9th level you gain access to the spell listed for that level in the Alchemist Spells table\./gu, "연금술에 대한 숙련으로 인해 경이로운 발명품을 만드는 데 도움이 되는 추가 주문에 접근할 수 있습니다. 2, 3, 5, 7, 9레벨이 되면 연금술사 주문 표에 적힌 해당 레벨의 주문을 사용할 수 있게 됩니다.")
      .replace(/\bAlchemist Spells\b/gu, "연금술사 주문")
      .replace(/\bArtificer Level\b/gu, "아티피서 레벨")
      .replace(/\bVocation Spells\b/gu, "직능 주문")
      .replace(/Starting at 2nd level, you have learned to craft your wondrous inventions in a way that's easy to share with others\./gu, "2레벨부터, 경이로운 발명품을 다른 이와 쉽게 나눌 수 있는 방식으로 만드는 법을 익힙니다.")
      .replace(/Other creatures may use your wondrous inventions if their spell has a range of touch\./gu, "발명품에 담긴 주문의 사거리가 접촉이라면, 다른 크리처도 당신의 경이로운 발명품을 사용할 수 있습니다.")
      .replace(/When expended in this way, the invention still uses your spell casting modifier, spellsave DC, and spell attack modifier\./gu, "이렇게 사용된 경우에도 해당 발명품은 당신의 주문시전 수정치, 주문 내성 DC, 주문 공격 수정치를 그대로 사용합니다.")
      .replace(/Starting at 2nd level, you have learned to use special ingredients to make your wondrous inventions extra potent\./gu, "2레벨부터, 특별한 재료를 사용해 경이로운 발명품의 효과를 한층 더 강력하게 만드는 법을 익힙니다.")
      .replace(/As you use an invention, you may apply potent reagents to do one of the following:/gu, "발명품을 사용할 때 강력한 시약을 더해 다음 효과 중 하나를 적용할 수 있습니다:")
      .replace(/Reroll one of the damage or healing dice and use the new roll\./gu, "피해 또는 치유 주사위 하나를 다시 굴리고 새 결과를 사용합니다.")
      .replace(/Increase the area of any area of effect by increasing the radius of a sphere or cylinder or the length of a cone or cube by 50%, rounded up\./gu, "구체나 원통의 반경, 또는 원뿔과 정육면체의 길이를 50% 늘려 범위형 효과의 범위를 확장합니다. 소수점은 올림합니다.")
      .replace(/Gain advantage on the first Constitution saving throw to maintain concentration on the spell\./gu, "그 주문에 대한 집중을 유지하기 위해 하는 첫 번째 건강 내성 굴림에 이점을 얻습니다.")
      .replace(/Impose disadvantage for target one on the second saving throw caused by the spell\./gu, "그 주문으로 인해 대상 하나가 두 번째로 하는 내성 굴림에 불리점을 부여합니다.")
      .replace(/Impose disadvantage for 목표 하나 on the second saving throw caused by the spell\./gu, "그 주문으로 인해 대상 하나가 두 번째로 하는 내성 굴림에 불리점을 부여합니다.")
      .replace(/Potent reagents can only be used once per turn, and are used before the invention is expended\. You can use potent reagents a number of times equal to your Intelligence modifier \(minimum of once\), and you regain all expended uses of it when you finish a short or long rest\./gu, "강력한 시약은 턴당 한 번만 사용할 수 있으며, 발명품이 소모되기 전에 적용해야 합니다. 강력한 시약은 자신의 지능 수정치와 같은 횟수만큼 사용할 수 있고(최소 1회), 짧은 휴식이나 긴 휴식을 마치면 소모한 사용 횟수를 모두 회복합니다.")
      .replace(/At 6th level, you are always able to scrape together the materials for your signature recipe\. Choose any Artificer spell as your signature recipe\. You may use any wondrous invention to cast your signature recipe spell instead of the spell associated with the wondrous invention\. The signature recipe spell is cast as if using a spell slot equal to the invention's level, and the invention level must be greater than or equal to the signature recipe spell level\. You may change your signature recipe whenever you level up\./gu, "6레벨이 되면 대표 레시피를 위한 재료를 언제나 어떻게든 마련할 수 있게 됩니다. 대표 레시피로 아티피서 주문 하나를 선택하세요. 경이로운 발명품에 담긴 원래 주문 대신, 어떤 경이로운 발명품으로도 자신의 대표 레시피 주문을 시전할 수 있습니다. 이 주문은 발명품의 레벨과 같은 주문 슬롯으로 시전한 것처럼 취급되며, 발명품의 레벨은 대표 레시피 주문 레벨 이상이어야 합니다. 레벨이 오를 때마다 대표 레시피를 바꿀 수 있습니다.")
      .replace(/At 10th level, you have cracked the fundamentals of alchemy\. Once per long rest, over the course of an hour, you can transmute gold into any non-magical item, or any non-magical item into gold\. You can transmute up to 50gp of value, consuming the transmuted material\./gu, "10레벨이 되면 연금술의 근본 원리를 해독합니다. 긴 휴식마다 한 번, 1시간에 걸쳐 금을 비마법 물품으로, 또는 비마법 물품을 금으로 변환할 수 있습니다. 최대 50gp 가치까지 변환할 수 있으며, 변환된 재료는 소모됩니다.")
      .replace(/At 10th level, you've learned to make exceptionally potent reagents\. When you use potent reagents, you can apply up to two potent reagents effects per each use\. \(If the same potent reagent effect is selected twice, effects that say first or second should be treated as if they say first and second, or second and third\)\./gu, "10레벨이 되면 유난히 강력한 시약을 만들어내는 법을 익힙니다. 강력한 시약을 사용할 때 한 번의 사용마다 최대 두 가지 시약 효과를 적용할 수 있습니다. (같은 효과를 두 번 고른 경우, 첫 번째 또는 두 번째라고 적힌 부분은 각각 첫 번째와 두 번째, 또는 두 번째와 세 번째로 읽습니다.)")
      .replace(/At 14th level, your mastery of alchemy allows you to create a philosopher's stone\. The stone requires 8 hours of work to create, and 200gp of materials\. As long as you possess the stone, you gain the following benefits:/gu, "14레벨이 되면 연금술에 대한 숙련으로 현자의 돌을 만들어낼 수 있습니다. 이 돌은 8시간의 작업과 200gp어치 재료가 필요합니다. 당신이 이 돌을 지니고 있는 동안 다음 이점을 얻습니다:")
      .replace(/You may apply one use of potent reagents on your signature recipe without counting towards your total number of uses\./gu, "대표 레시피에 강력한 시약 1회를 적용할 때, 그 사용은 총 사용 횟수에 포함되지 않습니다.")
      .replace(/You have immunity to poison damage, and can remove the poisoned condition from yourself or a creature you can touch as an action\./gu, "독 피해에 면역이 되며, 행동으로 자신이나 접촉할 수 있는 크리처 하나에게서 중독 상태를 제거할 수 있습니다.")
      .replace(/If you would fail your last death saving throw, instead you are stabilized and regain 1 hit point, but the philosopher's stone is destroyed\./gu, "마지막 죽음 내성 굴림에 실패할 상황이라면, 대신 안정화되고 HP 1을 회복하지만 현자의 돌은 파괴됩니다.")
      .replace(/Once every five years, you can use this stone to perform a day long ritual which reverses 1d10 years of age from yourself\. This process heals the body of damage, restoring lost body parts and curing all diseases\./gu, "5년에 한 번, 이 돌을 사용해 하루 동안 의식을 치러 자신의 나이를 1d10년 되돌릴 수 있습니다. 이 과정은 몸의 손상을 치유하고, 잃어버린 신체 부위를 복원하며, 모든 질병을 치료합니다.")
      .replace(/Some rogues enhance their fine-honed skills of stealth and agility with magic, learning tricks of enchantment and illusion\. These rogues include pickpockets and burglars, but also pranksters, mischief-makers, and a significant number of adventurers\./gu, "일부 로그들은 정교하게 갈고닦은 은신과 민첩의 기술에 마법을 더해, 매혹과 환영의 속임수를 익힙니다. 이런 로그들 중에는 소매치기와 도둑뿐 아니라 장난꾸러기, 말썽꾸러기, 그리고 적지 않은 수의 모험가도 포함됩니다.")
      .replace(/When you reach 3rd level, you gain the ability to cast spells\. See <a href="[^"]+">chapter 10<\/a> for the general rules of spellcasting and <a href="[^"]+">chapter 11<\/a> for the <a href="[^"]+">wizard spell list<\/a>\./gu, "3레벨이 되면 주문을 시전할 수 있게 됩니다. 주문시전의 일반 규칙은 10장을, 위저드 주문 목록은 11장을 참조하세요.")
      .replace(/You learn three cantrips: (__FVTT_TOKEN_\d+__) and two other cantrips of your choice from the wizard spell list\. You learn another wizard cantrip of your choice at 10th level\./gu, (_, mageHand) => `캔트립 세 가지를 익힙니다. ${mageHand} 하나와 위저드 주문 목록에서 선택한 다른 캔트립 두 가지입니다. 10레벨이 되면 위저드 캔트립 하나를 추가로 익힙니다.`)
      .replace(/You know three 1st-level wizard spells of your choice, two of which you must choose from the enchantment and illusion spells on the wizard spell list\./gu, "원하는 1레벨 위저드 주문 세 가지를 알고 시작하며, 그중 두 가지는 위저드 주문 목록의 매혹 또는 환영계 주문에서 골라야 합니다.")
      .replace(/The Spells Known column of the Arcane Trickster Spellcasting table shows when you learn more wizard spells of 1st level or higher\. Each of these spells must be an enchantment or illusion spell of your choice, and must be of a level for which you have spell slots\. For instance, when you reach 7th level in this class, you can learn one new spell of 1st or 2nd level\./gu, "아케인 트릭스터 주문시전 표의 주문 습득 열은 언제 1레벨 이상 위저드 주문을 더 배우는지 보여 줍니다. 이 주문들은 각기 자신이 선택한 매혹 또는 환영계 주문이어야 하며, 자신이 가진 주문 슬롯으로 시전할 수 있는 레벨이어야 합니다. 예를 들어 이 클래스 7레벨이 되면 1레벨 또는 2레벨 주문 하나를 새로 익힐 수 있습니다.")
      .replace(/Starting at 3rd level, when you cast (__FVTT_TOKEN_\d+__), you can make the spectral hand invisible, and you can perform the following additional tasks with it:/gu, (_, mageHand) => `3레벨부터 ${mageHand}을 시전하면 그 유령 손을 투명하게 만들 수 있고, 다음 추가 기능을 수행하게 할 수 있습니다:`)
      .replace(/At 9th level, if you are hidden from a creature when you cast a spell on it, the creature has disadvantage on any saving throw it makes against the spell this turn\./gu, "9레벨이 되면, 어떤 크리처에게 주문을 시전할 때 당신이 그 크리처에게 숨은 상태였다면 그 크리처는 그 턴 동안 해당 주문에 대한 내성 굴림에 불리점을 받습니다.")
      .replace(/At 13th level, you gain the ability to distract targets with your (__FVTT_TOKEN_\d+__)\. As a bonus action on your turn, you can designate a creature within 5 feet of the spectral hand created by the spell\. Doing so gives you advantage on attack rolls against that creature until the end of the turn\./gu, (_, mageHand) => `13레벨이 되면 ${mageHand}으로 대상을 교란할 수 있게 됩니다. 자신의 턴에 추가 행동으로 그 주문이 만든 유령 손에서 5피트 이내에 있는 크리처 하나를 지정할 수 있습니다. 그렇게 하면 턴이 끝날 때까지 그 크리처를 상대로 하는 공격 굴림에 이점을 얻습니다.`)
      .replace(/At 17th level, you gain the ability to magically steal the knowledge of how to cast a spell from another spellcaster\./gu, "17레벨이 되면 다른 주문시전자로부터 주문 시전 지식을 마법적으로 훔칠 수 있게 됩니다.")
      .replace(/The gods of knowledge(?:[^.]+)\. Some teach that knowledge is to be gathered and shared in libraries and universities, or promote the practical knowledge of craft and invention\. Some deities hoard knowledge and keep its secrets to themselves\. And some promise their followers that they will gain tremendous power if they unlock the secrets of the multiverse\. Followers of these gods study esoteric lore, collect old tomes, delve into the secret places of the earth, and learn all they can\. Some gods of knowledge promote the practical knowledge of craft and invention, including smith deities like (__FVTT_TOKEN_\d+__), (__FVTT_TOKEN_\d+__), (__FVTT_TOKEN_\d+__), (__FVTT_TOKEN_\d+__), (__FVTT_TOKEN_\d+__), and (__FVTT_TOKEN_\d+__)\./gu, (_, gond, reorx, onatar, moradin, hephaestus, goibhniu) => `지식의 신들에는 여러 존재가 있으며, 그들은 무엇보다 배움과 이해를 중시합니다. 어떤 신은 지식이 도서관과 대학에서 수집되고 공유되어야 한다고 가르치고, 어떤 신은 장인 기술과 발명의 실용적 지식을 장려합니다. 어떤 신들은 지식을 독점하고 그 비밀을 자신만의 것으로 간직하며, 또 어떤 신들은 다중우주의 비밀을 풀면 엄청난 힘을 얻을 것이라 약속합니다. 이 신들을 따르는 자들은 난해한 전승을 연구하고, 오래된 고서를 수집하며, 땅속의 숨겨진 장소를 탐험하고, 가능한 모든 것을 배우려 합니다. 일부 지식의 신들은 장인과 발명의 실용 지식을 장려하는데, ${gond}, ${reorx}, ${onatar}, ${moradin}, ${hephaestus}, ${goibhniu} 같은 대장장이 신들이 여기에 속합니다.`)
      .replace(/At each indicated cleric level, you add the listed spells to your spells prepared\./gu, "표에 표시된 각 클레릭 레벨이 되면, 나열된 주문을 준비된 주문에 추가합니다.")
      .replace(/At 1st level, you learn two languages of your choice\. You also become proficient in your choice of two of the following skills: Arcana, History, Nature, or Religion\. Your proficiency bonus is doubled for any ability check you make that uses either of those skills\./gu, "1레벨이 되면 원하는 언어 두 가지를 배웁니다. 또한 비전학, 역사, 자연, 종교 중 두 기술을 선택해 숙련을 얻습니다. 그리고 그 기술들 중 하나를 사용하는 능력치 판정에는 자신의 숙련 보너스를 두 배로 적용합니다.")
      .replace(/Starting at 2nd level, you can use your Channel Divinity to tap into a divine well of knowledge\. As an action, you choose one skill or tool\. For 10 minutes, you have proficiency with the chosen skill or tool\./gu, "2레벨부터 신성 변환을 사용해 신성한 지식의 샘에 접속할 수 있습니다. 행동으로 기술 하나 또는 도구 하나를 선택하세요. 10분 동안 선택한 기술 또는 도구에 숙련을 얻습니다.")
      .replace(/At 6th level, you can use your Channel Divinity to read a creature's thoughts\. You can then use your access to the creature's mind to command it\./gu, "6레벨이 되면 신성 변환을 사용해 크리처의 생각을 읽을 수 있습니다. 그리고 그 마음에 닿은 힘으로 그 크리처에게 명령을 내릴 수 있습니다.")
      .replace(/At 8th level, you add your Wisdom modifier to the ?쇳빐 you deal with any cleric cantrip\./gu, "8레벨이 되면 어떤 클레릭 캔트립으로든 주는 피해에 자신의 지혜 수정치를 더합니다.")
      .replace(/Starting at 17th level, you can call up visions of the past that relate to an object you hold or your immediate surroundings\./gu, "17레벨부터 자신이 들고 있는 물체나 주변 환경과 관련된 과거의 환영을 불러낼 수 있습니다.")
      .replace(/As a conjurer, you favor spells that produce objects and creatures out of thin air\. You can conjure billowing clouds of killing fog or summon creatures from elsewhere to fight on your behalf\. As your mastery grows, you learn spells of transportation and can teleport yourself across vast distances, even to other planes of existence, in an instant\./gu, "소환학파 위저드로서 당신은 무에서 물체와 생물을 만들어 내는 주문을 선호합니다. 치명적인 안개 구름을 불러내거나, 다른 곳의 크리처를 소환해 당신을 대신해 싸우게 할 수 있습니다. 숙련이 깊어질수록 이동과 운송의 주문을 배우며, 순식간에 먼 거리나 다른 차원으로 순간이동할 수도 있게 됩니다.")
      .replace(/Beginning when you select this school at 2nd level, the gold and time you must spend to copy a conjuration spell into your spellbook is halved\./gu, "2레벨에 이 학파를 선택하는 순간부터, 소환계 주문을 주문책에 필사하는 데 필요한 시간과 금 비용이 절반으로 줄어듭니다.")
      .replace(/Starting at 2nd level when you select this school, you can use your action to conjure up an inanimate object in your hand or on the ground in an unoccupied space that you can see within 10 feet of you\. This object can be no larger than 3 feet on a side and weigh no more than 10 pounds, and its form must be that of a nonmagical object that you have seen\. The object is visibly magical, radiating dim light out to 5 feet\./gu, "2레벨에 이 학파를 선택하면, 행동으로 자신으로부터 10피트 이내에서 볼 수 있는 비어 있는 공간의 바닥이나 자신의 손 위에 무생물 물체 하나를 소환할 수 있습니다. 이 물체는 한 변이 3피트를 넘을 수 없고 무게는 10파운드를 넘을 수 없으며, 자신이 본 적 있는 비마법 물체의 형태여야 합니다. 이 물체는 명백히 마법적인 것으로 보이며 5피트 반경에 희미한 빛을 발합니다.")
      .replace(/The object disappears after 1 hour, when you use this feature again, if it takes any ?쇳빐, ?먮뒗 if it deals any ?쇳빐\./gu, "이 물체는 1시간 뒤에, 이 특성을 다시 사용하면, 피해를 입으면, 또는 피해를 주면 사라집니다.")
      .replace(/Starting at 6th level, you can use your action to teleport up to 30 feet to an unoccupied space that you can see\. Alternatively, you can choose a space within range that is occupied by a Small or Medium creature\. If that creature is willing, you both teleport, swapping places\./gu, "6레벨부터 행동으로 볼 수 있는 비어 있는 공간까지 최대 30피트 순간이동할 수 있습니다. 대신 범위 내에서 소형 또는 중형 크리처가 점유한 공간을 선택할 수도 있습니다. 그 크리처가 자발적이라면, 둘은 함께 순간이동하며 자리를 맞바꿉니다.")
      .replace(/Beginning at 10th level, while you are (__FVTT_TOKEN_\d+__) on a conjuration spell, your (__FVTT_TOKEN_\d+__) can't be broken as a result of taking ?쇳빐\./gu, (_, concentrating, concentration) => `10레벨부터 소환계 주문에 ${concentrating} 중일 때는 피해를 입었다는 이유만으로 ${concentration}이 깨지지 않습니다.`)
      .replace(/Starting at 14th level, any creature that you summon or create with a conjuration spell has 30 temporary hit points\./gu, "14레벨부터 소환계 주문으로 당신이 소환하거나 만들어낸 모든 크리처는 임시 HP 30을 얻습니다.")
      .replace(/You are a student of spells that modify energy and matter\. To you, the world is not a fixed thing, but eminently mutable, and you delight in being an agent of change\. You wield the raw stuff of creation and learn to alter both physical forms and mental qualities\. Your magic gives you the tools to become a smith on reality's forge\./gu, "당신은 에너지와 물질을 변화시키는 주문을 연구하는 학도입니다. 당신에게 세계는 고정된 것이 아니라 얼마든지 바뀔 수 있는 것이며, 당신은 변화의 매개자가 되는 일을 즐깁니다. 창조의 원초적 재료를 다루며, 물리적 형태와 정신적 성질 모두를 바꾸는 법을 배웁니다. 당신의 마법은 현실이라는 대장간에서 망치를 휘두를 도구를 제공합니다.")
      .replace(/Some transmuters are tinkerers and pranksters, turning people into toads and transforming copper into silver for fun and occasional profit\. Others pursue their magical studies with deadly seriousness, seeking the power of the gods to make and destroy worlds\./gu, "어떤 변환학파 위저드는 장난과 실험을 즐기며 사람을 두꺼비로 바꾸거나 구리를 은으로 바꿔 재미와 약간의 이익을 얻습니다. 다른 이들은 세상을 만들고 파괴할 신들의 힘을 추구하며 치명적으로 진지한 태도로 마법 연구에 몰두합니다.")
      .replace(/Beginning when you select this school at 2nd level, the gold and time you must spend to copy a transmutation spell into your spellbook is halved\./gu, "2레벨에 이 학파를 선택하는 순간부터, 변환계 주문을 주문책에 필사하는 데 필요한 시간과 금 비용이 절반으로 줄어듭니다.")
      .replace(/The twilit transition from light into darkness often brings calm and even joy, as the day's labors end and the hours of rest begin\. The darkness can also bring terrors, but the gods of twilight guard against the horrors of the night\./gu, "빛이 어둠으로 넘어가는 황혼의 순간은 하루의 노동이 끝나고 휴식의 시간이 시작되기에, 종종 평온과 기쁨마저 가져옵니다. 물론 어둠은 공포도 함께 데려오지만, 황혼의 신들은 밤의 공포로부터 이들을 지켜 줍니다.")
      .replace(/Clerics who serve these deities(?:[^.]+)\.bring comfort to those who seek rest and protect them by venturing into the encroaching darkness to ensure that the dark is a comfort, not a terror\./gu, "이 신들을 섬기는 클레릭들은 휴식을 원하는 이들에게 위안을 주고, 다가오는 어둠 속으로 직접 들어가 어둠이 공포가 아니라 안식이 되도록 지켜 냅니다.")
      .replace(/At 1st level, you gain proficiency with martial weapons and heavy armor\./gu, "1레벨이 되면 군용 무기와 중갑에 대한 숙련을 얻습니다.")
      .replace(/Tabaxi have lifespans equivalent to humans\./gu, "타바시는 인간과 비슷한 수명을 지닙니다.")
      .replace(/Tabaxi are taller on average than humans and relatively slender\. Your size is Medium\./gu, "타바시는 평균적으로 인간보다 키가 크고 비교적 날씬합니다. 당신의 크기는 중형입니다.")
      .replace(/You have a cat's keen senses, especially in the dark\. You can see in dim light within 60 feet of you as if it were bright light, and in darkness as if it were dim light\. You can't discern color in darkness, only shades of gray\./gu, "당신은 특히 어둠 속에서 뛰어난 고양이의 감각을 지니고 있습니다. 자신으로부터 60피트 이내의 희미한 빛을 밝은 빛처럼, 어둠을 희미한 빛처럼 볼 수 있습니다. 어둠 속에서는 색을 구분할 수 없고 회색조만 식별할 수 있습니다.")
      .replace(/Your reflexes and agility allow you to move with a burst of speed\. When you move on your turn in combat, you can double your speed until the end of the turn\. Once you use this trait, you can't use it again until you move 0 feet on one of your turns\./gu, "당신의 반사신경과 민첩성은 폭발적인 속도로 움직이게 합니다. 전투 중 자신의 턴에 이동할 때, 턴이 끝날 때까지 자신의 속도를 두 배로 만들 수 있습니다. 이 특성을 한 번 사용하면, 자신의 턴 중 한 번 0피트만 이동할 때까지 다시 사용할 수 없습니다.")
      .replace(/Because of your claws, you have a climbing speed of 20 feet\. In addition, your claws are natural weapons, which you can use to make unarmed strikes\. If you hit with them, you deal slashing damage equal to (__FVTT_TOKEN_\d+__) \+ your Strength modifier, instead of the bludgeoning damage normal for an unarmed strike\./gu, (_, damage) => `발톱 덕분에 당신은 20피트의 등반 속도를 가집니다. 또한 발톱은 자연 무기로, 비무장 공격에 사용할 수 있습니다. 발톱으로 명중시키면 일반적인 비무장 공격의 타격 피해 대신 ${damage} + 자신의 근력 수정치만큼의 참격 피해를 줍니다.`)
      .replace(/Changelings mature slightly faster than humans but share a similar lifespan(?:[^.]+)\./gu, "체인질링은 인간보다 약간 빠르게 성숙하지만 비슷한 수명을 가지며, 보통 100년 이내를 삽니다. 체인질링은 나이를 감추기 위해 모습을 바꿀 수 있지만, 노화 자체는 인간과 비슷하게 영향을 미칩니다.")
      .replace(/Changelings tend toward pragmatic neutrality, and few changelings embrace evil\./gu, "체인질링은 실용적인 중립 성향을 띠는 경향이 있으며, 악을 받아들이는 체인질링은 드뭅니다.")
      .replace(/As an action, you can change your appearance and your voice\. You determine the specifics of the changes, including your coloration, hair length, and sex\. You can also adjust your height and weight, but not so much that your size changes\. You can make yourself appear as a member of another race, though none of your game statistics change\. You can't duplicate the appearance of a creature you've never seen, and you must adopt a form that has the same basic arrangement of limbs that you have\. Your clothing and equipment aren't changed by this trait\./gu, "행동으로 자신의 외모와 목소리를 바꿀 수 있습니다. 피부색, 머리 길이, 성별을 포함해 변화의 세부 사항은 자신이 정합니다. 키와 몸무게도 조절할 수 있지만 크기 범주가 바뀔 정도로 크게 바꿀 수는 없습니다. 다른 종족의 일원처럼 보이게 만들 수 있지만 게임 수치는 바뀌지 않습니다. 본 적 없는 크리처의 모습을 복제할 수는 없고, 자신의 팔다리 배열과 같은 기본 구조를 지닌 형태만 취해야 합니다. 의복과 장비는 이 특성으로 바뀌지 않습니다.")
      .replace(/You stay in the new form until you use an action to revert to your true form or until you die\./gu, "진짜 모습으로 돌아가기 위해 행동을 사용하거나 죽을 때까지 새로운 형태를 유지합니다.")
      .replace(/You follow a monastic tradition that teaches you to harness the elements\. When you focus your ki, you can align yourself with the forces of creation and bend the four elements to your will, using them as an extension of your body\. Some members of this tradition dedicate themselves to a single element, but others weave the elements together\./gu, "당신은 원소를 다루는 법을 가르치는 수도 전통을 따릅니다. 기를 집중하면 창조의 힘과 자신을 조율해 네 원소를 자신의 의지에 따라 휘어 몸의 연장처럼 사용할 수 있습니다. 어떤 수행자는 하나의 원소에 헌신하고, 또 어떤 이는 원소들을 함께 엮어 사용합니다.")
      .replace(/Many monks of this tradition tattoo their bodies with representations of their ki powers, commonly imagined as coiling dragons, but also as phoenixes, fish, plants, mountains, and cresting waves\./gu, "이 전통의 많은 몽크들은 자신의 기의 힘을 몸에 문신으로 새기는데, 흔히 몸을 감아 도는 드래곤의 모습으로 그리지만 불사조, 물고기, 식물, 산, 또는 밀려오는 파도로 표현하기도 합니다.")
      .replace(/You learn magical disciplines that harness the power of the four elements\. A discipline requires you to spend ki points each time you use it\./gu, "네 원소의 힘을 끌어내는 마법적 수련법을 익힙니다. 수련법 하나를 사용할 때마다 기 점수를 소비해야 합니다.")
      .replace(/You know the Elemental Attunement discipline and one other elemental discipline of your choice\. You learn one additional elemental discipline of your choice at 6th, 11th, and 17th level\./gu, "원소 조율 수련과 자신이 선택한 다른 원소 수련 하나를 익힙니다. 6레벨, 11레벨, 17레벨이 되면 선택한 원소 수련 하나를 추가로 익힙니다.")
      .replace(/Whenever you learn a new elemental discipline, you can also replace one elemental discipline that you already know with a different discipline\./gu, "새로운 원소 수련을 익힐 때마다, 이미 알고 있는 원소 수련 하나를 다른 수련으로 교체할 수도 있습니다.")
      .replace(/At 6th level, you gain the ability to adopt a humanoid's persona\./gu, "6레벨이 되면 인간형 존재의 인격을 받아들일 수 있는 능력을 얻습니다.")
      .replace(/When a humanoid dies within 30 feet of you, you can magically capture its shadow using your reaction\./gu, "인간형 존재가 당신으로부터 30피트 이내에서 죽으면, 반응행동을 사용해 그 그림자를 마법적으로 붙잡을 수 있습니다.")
      .replace(/You retain this shadow until you use it or you finish a long rest\./gu, "이 그림자는 사용하거나 긴 휴식을 마칠 때까지 유지됩니다.")
      .replace(/You can use the shadow as an action\./gu, "행동으로 그 그림자를 사용할 수 있습니다.")
      .replace(/When you do so, it vanishes, magically transforming into a disguise that appears on you\./gu, "그렇게 하면 그림자는 사라지며, 당신 위에 걸쳐지는 변장으로 마법적으로 변합니다.")
      .replace(/You now look like the dead person, but healthy and alive\./gu, "이제 당신은 그 죽은 사람처럼 보이지만, 건강하고 살아 있는 모습으로 보입니다.")
      .replace(/This disguise lasts for 1 hour or until you end it as a bonus action\./gu, "이 변장은 1시간 동안 지속되거나, 추가 행동으로 끝낼 때까지 유지됩니다.")
      .replace(/While you're in the disguise, you gain access to all information that the humanoid would freely share with a casual acquaintance\./gu, "이 변장을 하고 있는 동안, 그 인간형 존재가 가벼운 지인에게 거리낌 없이 말해 줄 모든 정보에 접근할 수 있습니다.")
      .replace(/Such information includes general details on its background and personal life, but doesn't include secrets\./gu, "이 정보에는 배경과 사생활에 대한 일반적인 내용이 포함되지만, 비밀은 포함되지 않습니다.")
      .replace(/The information is enough that you can pass yourself off as the person by drawing on its memories\./gu, "이 정보만으로도 그 기억을 끌어내어 자신을 그 사람인 것처럼 꾸밀 수 있습니다.")
      .replace(/Another creature can see through this disguise by succeeding on a Wisdom \((__FVTT_TOKEN_\d+__)\) check contested by your Charisma \((__FVTT_TOKEN_\d+__)\) check\./gu, (_, insight, deception) => `다른 크리처는 당신의 매력(${deception}) 판정과 겨루는 지혜(${insight}) 판정에 성공하면 이 변장을 꿰뚫어 볼 수 있습니다.`)
      .replace(/You gain a \+5 bonus to your check\./gu, "당신은 그 판정에 +5 보너스를 얻습니다.")
      .replace(/When you reach 3rd level, you gain the ability to cast spells\./gu, "3레벨이 되면 주문을 시전할 수 있게 됩니다.")
      .replace(/See chapter 10 for the general rules of spellcasting and chapter 11 for the wizard spell list ?\./gu, "주문시전의 일반 규칙은 10장을, 위저드 주문 목록은 11장을 참조하세요.")
      .replace(/The Arcane Trickster Spellcasting table shows how many spell slots you have to cast your wizard spells of 1st level and higher\./gu, "아케인 트릭스터 주문시전 표는 1레벨 이상 위저드 주문을 시전할 수 있는 주문 슬롯의 수를 보여 줍니다.")
      .replace(/To cast one of these spells, you must expend a slot of the spell's level or higher\./gu, "이 주문들 가운데 하나를 시전하려면 해당 주문 레벨 이상의 주문 슬롯 하나를 소모해야 합니다.")
      .replace(/You regain all expended spell slots when you finish a long rest\./gu, "긴 휴식을 마치면 소모한 주문 슬롯을 모두 회복합니다.")
      .replace(/For example, if you know the 1st-level spell (__FVTT_TOKEN_\d+__) and have a 1st-level and a 2nd-level spell slot available, you can cast (__FVTT_TOKEN_\d+__) using either slot\./gu, (_, spellA, spellB) => `예를 들어 1레벨 주문 ${spellA}을 알고 있고 1레벨 슬롯과 2레벨 슬롯을 모두 가지고 있다면, ${spellB}을 어느 슬롯으로든 시전할 수 있습니다.`)
      .replace(/The spells you learn at 8th, 14th, and 20th level can come from any school of magic\./gu, "8레벨, 14레벨, 20레벨에 배우는 주문은 어느 마법 학파에서든 선택할 수 있습니다.")
      .replace(/Whenever you gain a level in this class, you can replace one of the wizard spells you know with another spell of your choice from the wizard spell list\./gu, "이 클래스에서 레벨을 올릴 때마다, 자신이 알고 있는 위저드 주문 하나를 위저드 주문 목록의 다른 주문 하나로 교체할 수 있습니다.")
      .replace(/The new spell must be of a level for which you have spell slots, and it must be an enchantment or illusion spell, unless you're replacing the spell you gained at 3rd, 8th, 14th, or 20th level from any school of magic\./gu, "새 주문은 자신이 주문 슬롯을 가진 레벨이어야 하며, 3레벨·8레벨·14레벨·20레벨에 어떤 학파에서든 고를 수 있었던 주문을 교체하는 경우가 아니라면 반드시 매혹계나 환영계 주문이어야 합니다.")
      .replace(/Spellcasting Ability\./gu, "주문시전 능력치.")
      .replace(/Intelligence is your spellcasting ability for your wizard spells, since you learn your spells through dedicated study and memorization\./gu, "주문을 꾸준한 연구와 암기를 통해 익히므로, 위저드 주문의 주문시전 능력치는 지능입니다.")
      .replace(/You use your Intelligence whenever a spell refers to your spellcasting ability\./gu, "주문이 자신의 주문시전 능력치를 참조할 때마다 지능을 사용합니다.")
      .replace(/In addition, you use your Intelligence modifier when setting the saving throw DC for a wizard spell you cast and when making an attack roll with one\./gu, "또한 자신이 시전하는 위저드 주문의 내성 굴림 DC를 정하거나 주문 공격 굴림을 할 때도 지능 수정치를 사용합니다.")
      .replace(/Spell save DC = 8 \+ your proficiency bonus \+ your Intelligence modifier Spell attack modifier = your proficiency bonus \+ your Intelligence modifier/gu, "주문 내성 DC = 8 + 숙련 보너스 + 지능 수정치 주문 공격 수정치 = 숙련 보너스 + 지능 수정치")
      .replace(/You can retrieve an object in a container worn or carried by another creature\./gu, "다른 크리처가 착용하거나 휴대한 용기 안의 물건을 꺼낼 수 있습니다.")
      .replace(/You can use (__FVTT_TOKEN_\d+__) to pick locks and disarm traps at range\./gu, (_, tools) => `${tools}을 사용해 원거리에서 자물쇠를 따고 함정을 해제할 수 있습니다.`)
      .replace(/You can perform one of these tasks without being noticed by a creature if you succeed on a Dexterity \((__FVTT_TOKEN_\d+__)\) check contested by the creature's Wisdom \((__FVTT_TOKEN_\d+__)\) check\./gu, (_, sleight, perception) => `크리처 하나에게 들키지 않고 이 작업을 수행하려면, 그 크리처의 지혜(${perception}) 판정과 겨루는 민첩(${sleight}) 판정에 성공해야 합니다.`)
      .replace(/In addition, you can use the bonus action granted by your Cunning Action to control the hand\./gu, "또한 교활한 행동으로 얻는 추가 행동을 사용해 그 손을 조종할 수 있습니다.")
      .replace(/You also become proficient in your choice of two of the following skills: (__FVTT_TOKEN_\d+__), (__FVTT_TOKEN_\d+__), (__FVTT_TOKEN_\d+__), or (__FVTT_TOKEN_\d+__)\./gu, (_, a, b, c, d) => `또한 다음 기술 가운데 두 가지를 선택해 숙련을 얻습니다: ${a}, ${b}, ${c}, ${d}.`)
      .replace(/Your proficiency bonus is doubled for any ability check you make that uses either of those skills\./gu, "그렇게 선택한 기술을 사용하는 모든 능력치 판정에는 숙련 보너스를 두 배로 적용합니다.")
      .replace(/As an action, choose .*? that you can see within 60 feet of you\./gu, "행동으로 자신으로부터 60피트 이내에서 볼 수 있는 크리처 하나를 선택합니다.")
      .replace(/That creature must make a Wisdom saving throw\./gu, "그 크리처는 지혜 내성 굴림을 해야 합니다.")
      .replace(/If the creature succeeds on the saving throw, you can't use this feature on it again until you finish a long rest\./gu, "그 크리처가 내성 굴림에 성공하면, 긴 휴식을 마칠 때까지는 그 크리처에게 이 특성을 다시 사용할 수 없습니다.")
      .replace(/If the creature fails its save, you can read its surface thoughts \(those foremost in its mind, reflecting its current emotions and what it is actively thinking about\) when it is within 60 feet of you\./gu, "그 크리처가 내성에 실패하면, 60피트 이내에 있는 동안 그 크리처의 표층 사고를 읽을 수 있습니다. 이는 현재 감정과 지금 무엇을 생각하고 있는지를 반영하는 마음속 최전면의 생각입니다.")
      .replace(/This effect lasts for 1 minute\./gu, "이 효과는 1분 동안 지속됩니다.")
      .replace(/During that time, you can use your action to end this effect and cast the (__FVTT_TOKEN_\d+__) spell on the creature without expending a spell slot\./gu, (_, suggestion) => `그동안 행동을 사용해 이 효과를 끝내고 주문 슬롯을 소모하지 않은 채 그 크리처에게 ${suggestion} 주문을 시전할 수 있습니다.`)
      .replace(/The target automatically fails its saving throw against the spell\./gu, "대상은 그 주문에 대한 내성 굴림에 자동으로 실패합니다.")
      .replace(/Starting at 2nd level when you select this school, you can temporarily alter the physical properties of one nonmagical object, changing it from one substance into another\./gu, "2레벨에 이 학파를 선택하면, 비마법 물체 하나의 물리적 성질을 일시적으로 바꾸어 한 물질을 다른 물질로 변환할 수 있습니다.")
      .replace(/You perform a special alchemical procedure on one object composed entirely of wood, stone \(but not a gemstone\), iron, copper, or silver, transforming it into a different one of those materials\./gu, "나무, 돌(보석 제외), 철, 구리, 은 가운데 하나로 전부 이루어진 물체 하나에 특별한 연금술 절차를 행해, 같은 목록 안의 다른 재질로 바꿉니다.")
      .replace(/For each 10 minutes you spend performing the procedure, you can transform up to 1 cubic foot of material\./gu, "이 절차를 10분 수행할 때마다 최대 1세제곱피트 분량의 물질을 변환할 수 있습니다.")
      .replace(/After 1 hour, or until you lose your (__FVTT_TOKEN_\d+) \(as if you were (__FVTT_TOKEN_\d+) on a spell\), the material reverts to its original substance\./gu, (_, concentration, concentrating) => `1시간이 지나거나 ${concentration}을 잃을 때(마치 주문에 ${concentrating} 중인 것처럼) 그 물질은 원래의 재질로 돌아갑니다.`)
      .replace(/Starting at 6th level, you can spend 8 hours creating a transmuter's stone that stores transmutation magic\./gu, "6레벨부터 8시간을 들여 변환 마법을 저장한 변환학자의 돌을 만들 수 있습니다.")
      .replace(/You can benefit from the stone yourself or give it to another creature\./gu, "그 돌의 이점을 자신이 받을 수도 있고 다른 크리처에게 줄 수도 있습니다.")
      .replace(/A creature gains a benefit of your choice as long as the stone is in the creature's possession\./gu, "크리처는 그 돌을 지니고 있는 동안 당신이 선택한 이점 하나를 얻습니다.")
      .replace(/When you create the stone, choose the benefit from the following options:/gu, "돌을 만들 때 다음 선택지 중 하나를 이점으로 고르세요:")
      .replace(/Darkvision out to a range of 60 feet, as described in chapter 8\./gu, "8장에 설명된 것처럼 60피트 범위의 암시야를 얻습니다.")
      .replace(/An increase to speed of 10 feet while the creature is unencumbered\./gu, "과적 상태가 아닐 때 속도가 10피트 증가합니다.")
      .replace(/Proficiency in Constitution saving throws\./gu, "건강 내성 굴림 숙련을 얻습니다.")
      .replace(/Each time you cast a transmutation spell of 1st level or higher, you can change the effect of your stone if the stone is on your person\./gu, "1레벨 이상 변환계 주문을 시전할 때마다, 돌이 자신의 소지품 안에 있다면 그 돌의 효과를 바꿀 수 있습니다.")
      .replace(/If you create a new transmuter's stone, the previous one ceases to function\./gu, "새로운 변환학자의 돌을 만들면 이전 돌은 기능을 잃습니다.")
      .replace(/At 10th level, you add the (__FVTT_TOKEN_\d+__) spell to your spellbook, if it is not there already\./gu, (_, polymorph) => `10레벨이 되면, 아직 없다면 ${polymorph} 주문을 주문책에 추가합니다.`)
      .replace(/You can cast (__FVTT_TOKEN_\d+__) without expending a spell slot\./gu, (_, polymorph) => `${polymorph} 주문을 주문 슬롯을 소모하지 않고 시전할 수 있습니다.`)
      .replace(/When you do so, you can target only yourself and transform into a beast whose challenge rating is 1 or lower ?\./gu, "그렇게 시전할 때는 자신만을 대상으로 삼을 수 있으며, 도전 지수 1 이하의 야수로 변신합니다.")
      .replace(/Starting at 14th level, you can use your action to consume the reserve of transmutation magic stored within your transmuter's stone in a single burst\./gu, "14레벨부터 행동으로 변환학자의 돌 안에 저장된 변환 마법의 비축분을 한 번에 소모할 수 있습니다.")
      .replace(/When you do so, choose one of the following effects\./gu, "그렇게 할 때 다음 효과 중 하나를 선택합니다.")
      .replace(/Your transmuter's stone is destroyed and can't be remade until you finish a long rest\./gu, "이 경우 변환학자의 돌은 파괴되며, 긴 휴식을 마칠 때까지 다시 만들 수 없습니다.")
      .replace(/Clerics who serve these deities-examples of which appear on the Twilight Deities table-bring comfort to those who seek rest and protect them by venturing into the encroaching darkness to ensure that the dark is a comfort, not a terror\./gu, "황혼의 신들 표에 실린 신격들을 섬기는 클레릭들은 쉬고자 하는 이들에게 위안을 전하고, 다가오는 어둠 속으로 몸소 들어가 어둠이 공포가 아니라 안식이 되도록 지켜 냅니다.")
      .replace(/See the Divine Domain class feature for how domain spells work\./gu, "권역 주문이 어떻게 작동하는지는 Divine Domain 클래스 특성을 참조하세요.")
      .replace(/You can see through the deepest gloom\./gu, "가장 깊은 어둠 속도 꿰뚫어 볼 수 있습니다.")
      .replace(/You have (__FVTT_TOKEN_\d+) out to a range of 300 feet\./gu, (_, darkvision) => `${darkvision}을 300피트 범위까지 얻습니다.`)
      .replace(/In that radius, you can see in dim light as if it were bright light and in darkness as if it were dim light\./gu, "그 범위 안에서는 희미한 빛을 밝은 빛처럼, 어둠을 희미한 빛처럼 볼 수 있습니다.")
      .replace(/As an action, you can magically share the (__FVTT_TOKEN_\d+) of this feature with willing creatures you can see within 10 feet of you, up to a number of creatures equal to your Wisdom modifier \(minimum of .*?\)\./gu, (_, darkvision) => `행동으로, 자신으로부터 10피트 이내에서 볼 수 있는 자발적인 크리처들에게 이 특성의 ${darkvision}을 마법적으로 나누어 줄 수 있습니다. 대상 수는 자신의 지혜 수정치와 같으며 최소 한 크리처입니다.`)
      .replace(/The shared (__FVTT_TOKEN_\d+) lasts for 1 hour\./gu, (_, darkvision) => `공유된 ${darkvision}은 1시간 동안 지속됩니다.`)
      .replace(/Once you share it, you can't do so again until you finish a long rest, unless you expend a spell slot of any level to share it again\./gu, "한 번 공유하면 긴 휴식을 마칠 때까지 다시 공유할 수 없지만, 아무 레벨이든 주문 슬롯 하나를 소모하면 다시 공유할 수 있습니다.")
      .replace(/The night has taught you to be vigilant\./gu, "밤은 당신에게 늘 경계를 늦추지 않는 법을 가르쳤습니다.")
      .replace(/As an action, you give .*? advantage on the next initiative roll the creature makes\./gu, "행동으로 자신이 접촉한 크리처 하나에게 다음 우선권 굴림에 대한 이점을 부여합니다.")
      .replace(/This benefit ends immediately after the roll or if you use this feature again\./gu, "이 이점은 해당 굴림이 끝나거나 이 특성을 다시 사용하는 즉시 종료됩니다.")
      .replace(/You can use your Channel Divinity to refresh your allies with soothing twilight\./gu, "신성 변환을 사용해 부드러운 황혼의 힘으로 아군을 새롭게 북돋울 수 있습니다.")
      .replace(/As an action, you present your holy symbol, and a sphere of twilight emanates from you\./gu, "행동으로 자신의 성표를 내세우면, 당신에게서 황혼의 구체가 퍼져 나갑니다.")
      .replace(/The sphere is centered on you, has a 30-foot radius, and is filled with dim light\./gu, "이 구체는 당신을 중심으로 반경 30피트이며, 희미한 빛으로 가득 차 있습니다.")
      .replace(/The sphere moves with you, and it lasts for 1 minute or until you are (__FVTT_TOKEN_\d+) or die\./gu, (_, incapacitated) => `구체는 당신과 함께 움직이며, 1분 동안 지속되거나 당신이 ${incapacitated} 상태가 되거나 죽을 때까지 유지됩니다.`)
      .replace(/Whenever a creature \(including you\) ends its turn in the sphere, you can grant that creature one of these benefits:/gu, "크리처 하나(당신 자신 포함)가 이 구체 안에서 턴을 마칠 때마다, 그 크리처에게 다음 이점 중 하나를 줄 수 있습니다:")
      .replace(/You grant it temporary hit points equal to (__FVTT_TOKEN_\d+) plus your cleric level\./gu, (_, dice) => `그 크리처는 ${dice} + 당신의 클레릭 레벨만큼의 임시 HP를 얻습니다.`)
      .replace(/You end one effect on it causing it to be (__FVTT_TOKEN_\d+) or (__FVTT_TOKEN_\d+)\./gu, (_, charmed, frightened) => `그 크리처에게 걸린 ${charmed} 또는 ${frightened} 상태를 유발하는 효과 하나를 끝냅니다.`)
      .replace(/You can draw on the mystical power of night to rise into the air\./gu, "밤의 신비한 힘을 끌어와 공중으로 떠오를 수 있습니다.")
      .replace(/You have proficiency in the (__FVTT_TOKEN_\d+) and (__FVTT_TOKEN_\d+) skills\./gu, (_, perception, stealth) => `${perception} 기술과 ${stealth} 기술에 숙련을 얻습니다.`)
      .replace(/You can speak, read, and write \uacf5\ud1b5 and one other language of your choice\./gu, "공용어와 자신이 선택한 다른 언어 하나를 말하고 읽고 쓸 수 있습니다.")
      .replace(/Ultimate travelers, the inquisitive tabaxi rarely stay in one place for long\./gu, "궁극의 여행자인 호기심 많은 타바시는 한곳에 오래 머무는 일이 드뭅니다.")
      .replace(/Their innate nature pushes them to leave no secrets uncovered, no treasures or legends lost\./gu, "그들의 타고난 본성은 어떤 비밀도 묻히지 않게 하고, 어떤 보물이나 전설도 잃어버린 채 남겨 두지 않도록 등을 떠밉니다.")
      .replace(/Most tabaxi remain in their distant homeland, content to dwell in small, tight clans\./gu, "대부분의 타바시는 먼 고향에 남아, 작고 결속력 강한 씨족 안에서 살아가는 데 만족합니다.")
      .replace(/These tabaxi hunt for food, craft goods, and largely keep to themselves\./gu, "이 타바시들은 사냥으로 식량을 구하고, 물건을 만들며, 대체로 자기들끼리 지냅니다.")
      .replace(/However, not all tabaxi are satisfied with such a life\./gu, "하지만 모든 타바시가 그런 삶에 만족하는 것은 아닙니다.")
      .replace(/The Cat Lord, the divine figure responsible for the creation of the tabaxi, gifts each of his children with one specific feline trait\./gu, "타바시를 창조한 신적 존재인 고양이 군주는 각 자식에게 하나의 특별한 고양이적 특질을 선물합니다.")
      .replace(/Those tabaxi gifted with curiosity are compelled to wander far and wide\./gu, "호기심을 선물받은 타바시는 넓은 세상을 떠돌아다니고자 하는 충동에 사로잡힙니다.")
      .replace(/They seek out stories, artifacts, and lore\./gu, "그들은 이야기와 유물, 그리고 전승을 찾아 나섭니다.")
      .replace(/Those who survive this period of wanderlust return home in their elder years to share news of the outside world\./gu, "이 방랑의 시기를 견뎌 낸 이들은 나이가 들어 고향으로 돌아와 바깥세상의 소식을 전합니다.")
      .replace(/In this manner, the tabaxi remain isolated but never ignorant of the world beyond their home\./gu, "이런 방식으로 타바시는 고립된 채 살아가면서도 고향 밖 세계에 대해 무지해지지는 않습니다.")
      .replace(/Tabaxi treasure knowledge rather than material things\./gu, "타바시는 물질적인 것보다 지식을 더 귀하게 여깁니다.")
      .replace(/While a changeling can transform to conceal their age, the effects of aging affect them similarly to humans\./gu, "체인질링은 나이를 감추기 위해 모습을 바꿀 수 있지만, 노화의 영향은 인간과 비슷하게 받습니다.")
      .replace(/You gain proficiency with two of the following skills of your choice: (__FVTT_TOKEN_\d+__), (__FVTT_TOKEN_\d+__), (__FVTT_TOKEN_\d+__), and (__FVTT_TOKEN_\d+)\./gu, (_, deception, insight, intimidation, persuasion) => `다음 기술 가운데 두 가지를 선택해 숙련을 얻습니다: ${deception}, ${insight}, ${intimidation}, ${persuasion}.`)
      .replace(/You can speak, read, and write \uacf5\ud1b5 and two other languages of your choice\./gu, "공용어와 자신이 선택한 다른 언어 두 가지를 말하고 읽고 쓸 수 있습니다.")
      .replace(/Long ago there was a woman named Jes, and she had one hundred children\./gu, "아주 오래전 제스라는 이름의 여인이 있었고, 그녀에게는 백 명의 자식이 있었습니다.")
      .replace(/Her rivals conspired against her and swore to kill her children\./gu, "그녀의 적들은 음모를 꾸며 그녀의 자식들을 죽이겠다고 맹세했습니다.")
      .replace(/Jes begged the Sovereigns for help, but their only answer was the wind and rain\./gu, "제스는 Sovereigns에게 도움을 빌었지만, 돌아온 것은 바람과 비뿐이었습니다.")
      .replace(/In the depths of her despair, a lonely traveler took her hand\./gu, "절망의 한가운데에서, 외로운 여행자가 그녀의 손을 잡았습니다.")
      .replace(/"I will protect your children if they follow my path\./gu, "\"그 아이들이 내 길을 따른다면 내가 지켜 주리라.")
      .replace(/Let them wander the world\./gu, "세상을 떠돌게 하라.")
      .replace(/They may be shunned and feared, but they will never be destroyed\."/gu, "사람들에게 외면받고 두려움의 대상이 될지라도, 결코 멸망하지는 않을 것이다.\"")
      .replace(/Jes agreed, and the traveler gave her his cloak\./gu, "제스는 그 제안을 받아들였고, 여행자는 자신의 망토를 그녀에게 건넸습니다.")
      .replace(/When she draped it over her children, their old faces melted away and they could be whoever they wanted to be\./gu, "그녀가 아이들에게 그 망토를 둘러 주자, 기존의 얼굴은 녹아내렸고 그들은 원하는 누구라도 될 수 있게 되었습니다.")
      .replace(/And so it remains\./gu, "그리고 지금도 그러합니다.")
      .replace(/Though the children are shunned by all, the gift of the Traveler protects them still\./gu, "아이들이 모두에게 외면받을지라도, 여행자의 선물은 여전히 그들을 보호합니다.")
      .replace(/Changelings can shift their forms with a thought\./gu, "체인질링은 생각만으로 자신의 모습을 바꿀 수 있습니다.")
      .replace(/Many changelings use this gift as a form of artistic and emotional expression\./gu, "많은 체인질링은 이 선물을 예술적이고 감정적인 자기표현의 수단으로 사용합니다.")
      .replace(/It's also an invaluable tool for grifters, spies, and others who wish to deceive\./gu, "이 능력은 사기꾼, 첩자, 그리고 남을 속이고자 하는 다른 이들에게도 더없이 귀중한 도구입니다.")
      .replace(/This leads many people to treat changelings with suspicion\./gu, "그 때문에 많은 사람들은 체인질링을 의심의 눈초리로 바라봅니다.")
      .replace(/Wherever humans live, changelings reside also; the question is whether their presence is known\./gu, "인간이 사는 곳이라면 어디든 체인질링도 함께 살고 있으며, 차이는 단지 그 존재가 드러나 있느냐는 점뿐입니다.")
      .replace(/Changelings are born to one of three paths\./gu, "체인질링은 세 가지 삶의 길 중 하나로 태어납니다.")
      .replace(/A few are raised in stable communities where changelings are true to their nature and deal openly with the people around them\./gu, "일부는 체인질링이 본모습대로 살며 주변 사람들과 솔직하게 관계를 맺는 안정된 공동체에서 자랍니다.")
      .replace(/Some are orphans, raised by other races, who find their way in the world without ever knowing another like themselves\./gu, "일부는 다른 종족에게 길러진 고아로, 자신과 같은 존재를 만나 보지도 못한 채 세상에서 자신의 길을 찾아갑니다.")
      .replace(/Others are part of nomadic changeling clans spread across the Five Nations, families who keep their true nature hidden from the single-skins\./gu, "또 다른 이들은 다섯 나라 전역에 흩어진 유목 체인질링 씨족의 일원으로, 단일 얼굴을 가진 이들에게 자신의 본성을 숨기고 살아가는 가족들입니다.")
      .replace(/Some clans maintain safe havens in major cities and communities, but most prefer to wander the unpredictable path of the god known as the Traveler\./gu, "일부 씨족은 큰 도시와 공동체에 안전한 피난처를 유지하지만, 대부분은 Traveler라 알려진 신의 예측 불가능한 길을 떠도는 쪽을 택합니다.")
      .replace(/In creating a changeling adventurer, consider the character's relationships with people around them\./gu, "체인질링 모험가를 만들 때는, 그 인물이 주변 사람들과 어떤 관계를 맺는지 생각해 보세요.")
      .replace(/Does the character conceal their true changeling nature\?/gu, "그 인물은 자신의 진짜 체인질링 본성을 숨기고 있나요?")
      .replace(/Do they embrace it\?/gu, "아니면 그것을 받아들이고 있나요?")
      .replace(/Casting Elemental Spells\./gu, "원소 주문 시전.")
      .replace(/Some elemental disciplines allow you to cast spells\./gu, "일부 원소 수련은 주문 시전을 허용합니다.")
      .replace(/See chapter 10 of the Player's Handbook for the general rules of spellcasting\./gu, "주문시전의 일반 규칙은 Player's Handbook 10장을 참조하세요.")
      .replace(/To cast one of these spells, you use its casting time and other rules, but you don't need to provide material components for it\./gu, "이 주문들 중 하나를 시전할 때는 그 주문의 시전 시간과 다른 규칙을 따르지만, 물질 성분은 제공할 필요가 없습니다.")
      .replace(/Once you reach 5th level in this class, you can spend additional ki points to increase the level of an elemental discipline spell that you cast, provided that the spell has an enhanced effect at a higher level, as (__FVTT_TOKEN_\d+) does/gu, (_, burningHands) => `이 클래스 5레벨이 되면, ${burningHands}처럼 상위 레벨에서 강화 효과가 있는 원소 수련 주문을 시전할 때 추가 기 점수를 써서 주문 레벨을 높일 수 있습니다.`)
      .replace(/The spell's level increases by 1 for each additional ki point you spend\./gu, "추가로 소비한 기 점수 1점마다 주문의 레벨은 1 증가합니다.")
      .replace(/For example, if you are a 5th-level monk and use Sweeping Cinder Strike to cast (__FVTT_TOKEN_\d+__), you can spend 3 ki points to cast it as a 2nd-level spell \(the discipline's base cost of 2 ki points plus 1\)\./gu, (_, burningHands) => `예를 들어 5레벨 몽크가 Sweeping Cinder Strike로 ${burningHands}을 시전할 때, 기 점수 3점을 써서 2레벨 주문처럼 시전할 수 있습니다(수련의 기본 비용 2점 + 추가 1점).`)
      .replace(/The maximum number of ki points you can spend to cast a spell in this way \(including its base ki point cost and any additional ki points you spend to increase its level\) is determined by your monk level, as shown in the Spells and Ki Points/gu, "이 방식으로 주문을 시전할 때 소비할 수 있는 기 점수의 최대치는(기본 비용과 레벨 상승을 위해 추가한 점수를 모두 포함해) 자신의 몽크 레벨로 정해지며, 아래 주문과 기 점수 표에 제시되어 있습니다.")
      .replace(/At 5th level, you may spend up to 3 ki points; this increases to 4 ki points at 9th level, 5 at 13th level, and 6 at 17th level\./gu, "5레벨에는 최대 3점의 기를 사용할 수 있고, 9레벨에는 4점, 13레벨에는 5점, 17레벨에는 6점으로 늘어납니다.")
      .replace(/The elemental disciplines are presented in alphabetical order\./gu, "원소 수련은 알파벳 순으로 제시됩니다.")
      .replace(/If a discipline requires a level, you must be the level in this class to learn the discipline\./gu, "수련에 레벨 요구 조건이 있다면, 이 클래스에서 해당 레벨에 도달해야 그 수련을 배울 수 있습니다.")
      .replace(/You can spend 6 ki points to cast (__FVTT_TOKEN_\d+__)\./gu, (_, spell) => `기 점수 6점을 소비해 ${spell} 주문을 시전할 수 있습니다.`)
      .replace(/You can spend 3 ki points to cast (__FVTT_TOKEN_\d+__)\./gu, (_, spell) => `기 점수 3점을 소비해 ${spell} 주문을 시전할 수 있습니다.`)
      .replace(/You can use your action to briefly control elemental forces within 30 feet of you, causing one of the following effects of your choice:/gu, "행동으로 자신으로부터 30피트 이내의 원소력을 잠시 제어해, 다음 효과 가운데 하나를 일으킬 수 있습니다:")
      .replace(/Create a harmless, instantaneous sensory effect related to air, earth, fire, or water, such as a shower .*$/gu, "공기, 대지, 불, 물과 관련된 무해하고 즉각적인 감각 효과 하나를 만들어냅니다.")
      .replace(/Instantaneously light or snuff out a candle, a torch, or a small campfire\./gu, "초, 횃불, 작은 모닥불 하나를 즉시 켜거나 끕니다.")
      .replace(/Chill or warm up to 1 pound of nonliving material for up to 1 hour\./gu, "최대 1파운드의 무생물 물질을 1시간 동안 차갑게 하거나 따뜻하게 만듭니다.")
      .replace(/Cause earth, fire, water, or mist that can fit within a 1-foot cube to shape itself into a crude form you designate for 1 minute\./gu, "1피트 정육면체 안에 들어갈 수 있는 흙, 불, 물 또는 안개를 1분 동안 당신이 지정한 조잡한 형태로 빚어냅니다.")
      .replace(/Once you use this feature, you can't use it again until you finish a short or long rest\./gu, "이 특성을 한 번 사용하면, 짧은 휴식이나 긴 휴식을 마칠 때까지 다시 사용할 수 없습니다.")
      .replace(/Once you use this feature, you can't use it again until you finish a long rest\./gu, "이 특성을 한 번 사용하면, 긴 휴식을 마칠 때까지 다시 사용할 수 없습니다.");
  }

  _getSharedItemTranslation(item) {
    for (const key of this._getItemLookupSignatures(item)) {
      const translation = this.sharedItems.get(key);
      if (translation) return translation;
    }
    return null;
  }

  _getItemTranslationFallbacks(item, { includePackEntry = false } = {}) {
    const sourceName = this._getPreferredItemSourceName(item);
    const fallbacks = [];

    if (includePackEntry && item?.pack) {
      fallbacks.push(this._withFormattedName(sourceName, this._getCompendiumEntry(item.pack, item.name)));
    }

    fallbacks.push(
      this._withFormattedName(sourceName, this._getSharedItemTranslation(item)),
      this._withFormattedName(sourceName, this._getCompendiumIdentifierFallback(item)),
      this._withFormattedName(sourceName, this._getCompendiumSignatureFallback(item)),
      this._withFormattedName(sourceName, this._getCompendiumNameFallback(item)),
      this._getGeneratedItemTranslation(item)
    );

    return fallbacks;
  }

  _getCompendiumSignatureFallback(item) {
    for (const key of this._getItemLookupSignatures(item)) {
      const translation = this.compendiumSignatureIndex.get(key);
      if (translation) return translation;
    }
    return null;
  }

  _getCompendiumIdentifierFallback(item) {
    for (const identifier of this._getItemLookupIdentifiers(item)) {
      const translation = this.compendiumIdentifierIndex.get(identifier);
      if (translation) return translation;
    }
    return null;
  }

  _getCompendiumNameFallback(item) {
    if (!item?.name || !NAME_FALLBACK_TYPES.has(item.type)) return null;
    const preferredCollections = this._preferredCollectionsForType(item.type);

    for (const name of this._getItemLookupNames(item)) {
      const key = normalizeText(name).toLowerCase();
      const candidates = this.compendiumNameIndex.get(key) ?? [];
      for (const collection of preferredCollections) {
        const match = candidates.find((candidate) => candidate.collection === collection);
        if (match?.translation) return match.translation;
      }
      if (candidates[0]?.translation) return candidates[0].translation;
    }

    return null;
  }

  _getCompendiumActorFallback(actor) {
    if (!actor?.name) return null;
    const key = normalizeText(actor.name).toLowerCase();
    return this.compendiumActorNameIndex.get(key) ?? null;
  }

  async _loadJson(relativePath) {
    const url = `modules/${MODULE_ID}/${relativePath}`;
    const response = await fetch(url, { cache: "no-cache" });
    if (!response.ok) return null;
    return response.json();
  }

  _toEntryMap(data) {
    if (Array.isArray(data?.entries)) {
      return new Map(data.entries
        .filter((entry) => entry?.signature)
        .map((entry) => [entry.signature, entry]));
    }
    return new Map(Object.entries(data?.entries ?? {}));
  }

  async _discoverCompendiumFiles() {
    const response = await fetch(`modules/${MODULE_ID}/localization/compendium/ko/index.json`, { cache: "no-cache" });
    if (!response.ok) return [];
    const data = await response.json();
    return Array.isArray(data.files) ? data.files : [];
  }

  async _loadWorldTranslations() {
    const [actors, items, actorItems, journalPages, sharedItems] = await Promise.all([
      this._loadJson(WORLD_TRANSLATION_FILES.actors),
      this._loadJson(WORLD_TRANSLATION_FILES.items),
      this._loadJson(WORLD_TRANSLATION_FILES.actorItems),
      this._loadJson(WORLD_TRANSLATION_FILES.journalPages),
      this._loadJson(WORLD_TRANSLATION_FILES.sharedItems)
    ]);

    this.world.actors = this._toEntryMap(actors);
    this.world.items = this._toEntryMap(items);
    this.world.actorItems = this._toEntryMap(actorItems);
    this.world.journalPages = this._toEntryMap(journalPages);
    this.sharedItems = this._toEntryMap(sharedItems);
  }

  async _loadCompendiumTranslations() {
    const compendiumFiles = await this._discoverCompendiumFiles();
    this._clearCompendiumIndexes();

    for (const filePath of compendiumFiles) {
      const data = await this._loadJson(filePath);
      if (!data) continue;
      const collection = this._collectionFromPath(filePath);
      this.compendium.set(collection, data);
      if (data.label) {
        this.compendiumPackLabels.set(collection, plainLabelToKo(data.label));
      }
      if (data.folders) {
        this.compendiumFolderLabels.set(
          collection,
          new Map(Object.entries(data.folders).map(([name, label]) => [name, plainLabelToKo(label)]))
        );
      }
      if (collection === "dnd5e.rules") {
        for (const entry of Object.values(data.entries ?? {})) {
          for (const [pageName, pageTranslation] of Object.entries(entry?.pages ?? {})) {
            const translatedLabel = normalizeText(pageTranslation?.name);
            if (!translatedLabel) continue;
            this._indexReferenceLabel("", pageName, translatedLabel);
            this._indexReferenceLabel("rule", pageName, translatedLabel);
            for (const alias of referenceAliasesForPageName(pageName)) {
              const [aliasType, ...aliasValueParts] = alias.split(":");
              this._indexReferenceLabel(aliasType, aliasValueParts.join(":"), translatedLabel);
            }
          }
        }
      }
    }

    await this._indexCompendiumTranslations();
    await this._indexSystemRuleReferences();
  }

  _clearCompendiumIndexes() {
    this.compendium.clear();
    this.compendiumDocLabels.clear();
    this.compendiumPageLabels.clear();
    this.compendiumPackLabels.clear();
    this.compendiumFolderLabels.clear();
    this.compendiumSignatureIndex.clear();
    this.compendiumIdentifierIndex.clear();
    this.compendiumNameIndex.clear();
    this.compendiumActorNameIndex.clear();
    this.referenceLabels.clear();
    this.referenceTargets.clear();
    this.referenceTooltips.clear();
  }

  _collectionFromPath(relativePath) {
    const fileName = relativePath.split("/").at(-1) ?? "";
    return fileName.replace(/\.json$/u, "");
  }

  async _indexCompendiumTranslations() {
    for (const [collection, data] of this.compendium.entries()) {
      const pack = game.packs.get(collection);
      if (!pack) continue;

      data.entries ??= {};
      this._indexCompendiumDataFallback(collection, data);
      const translatedPackLabel = plainLabelToKo(this.compendiumPackLabels.get(collection) ?? pack.metadata?.label ?? pack.title ?? collection);
      if (translatedPackLabel) {
        this.compendiumPackLabels.set(collection, translatedPackLabel);
      }

      const folderLabels = new Map(this.compendiumFolderLabels.get(collection) ?? []);
      for (const folder of pack?.folders?.contents ?? pack?.folders ?? []) {
        if (!folder?.name) continue;
        folderLabels.set(folder.name, plainLabelToKo(folderLabels.get(folder.name) ?? folder.name));
      }
      if (folderLabels.size) {
        this.compendiumFolderLabels.set(collection, folderLabels);
      }

      let documents = [];
      let documentsLoaded = false;
      try {
        documents = await pack.getDocuments();
        documentsLoaded = true;
      } catch (error) {
        console.warn(`${MODULE_ID} | Failed to index compendium documents for ${collection}`, error);
        this._indexCompendiumDataFallback(collection, data);
      }

      if (documentsLoaded) {
        for (const document of documents) {
          const entry = data.entries?.[document.name] ?? {};

          if (document.documentName === "Item") {
            const generatedFallback = this._mergeTranslations(
              ...this._getItemTranslationFallbacks(document)
            );
            const translation = this._mergeCompendiumEntry(entry, generatedFallback, {
              name: document.name,
              description: this._extractItemDescription(document)
            });
            if (translation) data.entries[document.name] = translation;

            const content = document.system?.description?.value ?? "";
            const key = signatureFor({
              type: document.type,
              name: document.name,
              content
            });
            if (translation) {
              this.compendiumSignatureIndex.set(key, translation);
              if (translation.name) {
                this._addCompendiumIdentifierCandidate(document.system?.identifier ?? document.name, translation);
                this._addCompendiumNameCandidate(collection, document.name, translation);
              }
            }
          }

          if (document.documentName === "Actor") {
            const translation = this._mergeCompendiumEntry(entry, this._getGeneratedActorTranslation(document), {
              name: document.name,
              description: this._extractActorDescription(document)
            });
            data.entries[document.name] = translation ?? entry ?? {};
            if (data.entries[document.name]?.name) {
              this.compendiumActorNameIndex.set(normalizeText(document.name).toLowerCase(), data.entries[document.name]);
              this._addCompendiumIdentifierCandidate(document.system?.identifier ?? document.name, data.entries[document.name]);
              this._addCompendiumNameCandidate(collection, document.name, data.entries[document.name]);
            }

            data.entries[document.name].items ??= {};
            for (const item of document.items ?? []) {
              const itemEntry = data.entries[document.name].items?.[item.name] ?? {};
              const generatedFallback = this._mergeTranslations(
                ...this._getItemTranslationFallbacks(item)
              );
              const itemTranslation = this._mergeCompendiumEntry(itemEntry, generatedFallback, {
                name: item.name,
                description: this._extractItemDescription(item)
              });
              if (!itemTranslation) continue;
              data.entries[document.name].items[item.name] = itemTranslation;

              const content = this._extractItemDescription(item);
              const key = signatureFor({
                type: item.type,
                name: item.name,
                content
              });

              this.compendiumSignatureIndex.set(key, itemTranslation);
              this._addCompendiumIdentifierCandidate(item.system?.identifier ?? item.name, itemTranslation);
              this._addCompendiumNameCandidate(collection, item.name, itemTranslation);
              if (itemTranslation.name) {
                this.compendiumDocLabels.set(item.uuid, itemTranslation.name);
              }
            }
          }

          if (document.documentName === "JournalEntry") {
            const translation = data.entries?.[document.name] ?? {};
            translation.pages ??= {};
            for (const page of document.pages ?? []) {
              const pageEntry = translation.pages?.[page.name] ?? {};
              const pageTranslation = this._mergeCompendiumEntry(pageEntry, this._getGeneratedPageTranslation(page), {
                name: page.name,
                text: page.text?.content ?? ""
              });
              if (!pageTranslation) continue;
              translation.pages[page.name] = pageTranslation;
              if (pageTranslation.name) {
                this.compendiumPageLabels.set(page.uuid, pageTranslation.name);
              }
              this._indexReferencePage(collection, page, pageTranslation);
            }
            if (Object.keys(translation.pages).length) {
              data.entries[document.name] = translation;
            }
          }
        }
      }

      let index = [];
      try {
        index = await pack.getIndex();
      } catch (error) {
        console.warn(`${MODULE_ID} | Failed to index compendium index for ${collection}`, error);
      }

      for (const entry of index.values()) {
        const translation = data.entries?.[entry.name];
        if (!translation?.name) continue;
        this.compendiumDocLabels.set(`Compendium.${collection}.${entry.documentName ?? pack.documentName}.${entry._id}`, translation.name);
        this._addCompendiumIdentifierCandidate(entry.system?.identifier ?? entry.name, translation);
        this._addCompendiumNameCandidate(collection, entry.name, translation);
      }

      const journalEntries = Object.entries(data.entries ?? {}).filter(([, entry]) => entry?.pages);
      if (!journalEntries.length) continue;

      for (const [entryName, translation] of journalEntries) {
        const match = index.find((entry) => entry.name === entryName);
        if (!match) continue;

        let document = null;
        try {
          document = await pack.getDocument(match._id);
        } catch (error) {
          console.warn(`${MODULE_ID} | Failed to index compendium journal ${collection}:${match._id}`, error);
          continue;
        }
        if (!document?.pages) continue;

        for (const page of document.pages) {
          const pageTranslation = translation.pages?.[page.name];
          if (pageTranslation?.name) {
            this.compendiumPageLabels.set(page.uuid, pageTranslation.name);
          }
          this._indexReferencePage(collection, page, pageTranslation);
        }
      }
    }
  }

  async _indexSystemRuleReferences() {
    const collection = "dnd5e.rules";
    const pack = game.packs.get(collection);
    const data = this.compendium.get(collection);
    if (!pack || !data?.entries) return;

    let documents = [];
    try {
      documents = await pack.getDocuments();
    } catch (error) {
      console.warn(`${MODULE_ID} | Failed to force-index ${collection} references`, error);
      return;
    }

    for (const document of documents) {
      if (document.documentName !== "JournalEntry") continue;
      const entry = data.entries?.[document.name];
      if (!entry?.pages) continue;

      for (const page of document.pages ?? []) {
        const pageTranslation = entry.pages?.[page.name] ?? {};
        if (pageTranslation?.name) {
          this.compendiumPageLabels.set(page.uuid, pageTranslation.name);
        }
        this._indexReferencePage(collection, page, pageTranslation);
      }
    }
  }

  _indexCompendiumDataFallback(collection, data) {
    for (const [entryName, translation] of Object.entries(data.entries ?? {})) {
      if (translation?.name) {
        if (data.documentName === "Actor") {
          this.compendiumActorNameIndex.set(normalizeText(entryName).toLowerCase(), translation);
        }
        this._addCompendiumIdentifierCandidate(entryName, translation);
        this._addCompendiumNameCandidate(collection, entryName, translation);
      }
      for (const [itemName, itemTranslation] of Object.entries(translation?.items ?? {})) {
        if (!itemTranslation) continue;
        this._addCompendiumIdentifierCandidate(itemName, itemTranslation);
        this._addCompendiumNameCandidate(collection, itemName, itemTranslation);
      }
    }
  }

  _addCompendiumIdentifierCandidate(identifierSource, translation) {
    const identifier = this._identifierFromName(identifierSource);
    if (!identifier || !translation) return;
    if (!this.compendiumIdentifierIndex.has(identifier)) {
      this.compendiumIdentifierIndex.set(identifier, translation);
    }
  }

  _addCompendiumNameCandidate(collection, entryName, translation) {
    const key = normalizeText(entryName).toLowerCase();
    if (!key || !translation) return;
    if (!this.compendiumNameIndex.has(key)) {
      this.compendiumNameIndex.set(key, []);
    }
    this.compendiumNameIndex.get(key).push({ collection, translation });
  }

  _preferredCollectionsForType(type) {
    switch (type) {
      case "background":
        return ["dnd5e.backgrounds"];
      case "class":
        return ["dnd5e.classes"];
      case "consumable":
      case "container":
      case "equipment":
      case "loot":
      case "tool":
      case "weapon":
        return ["dnd5e.items", "dnd5e.tradegoods"];
      case "feat":
        return ["dnd5e.monsterfeatures", "dnd5e.classfeatures", "dnd5e.heroes"];
      case "race":
        return ["dnd5e.races"];
      case "spell":
        return ["dnd5e.spells"];
      case "subclass":
        return ["dnd5e.subclasses"];
      default:
        return [];
    }
  }
}

export { MODULE_ID, nameToKo, plainLabelToKo };
