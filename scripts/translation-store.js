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

const signatureFor = ({ type = "", name = "", content = "" } = {}) =>
  `${normalizeText(type)}::${normalizeText(name)}::${normalizeText(content)}`;

const COMMON_NAME_TRANSLATIONS = {
  "+1 Breastplate": "+1 브레스트플레이트",
  "Absorb Elements": "원소 흡수",
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
  "Bloodlink Potion": "피의 연결 물약",
  "Bola": "볼라",
  "Bomb": "폭탄",
  "Booming Blade": "우레 칼날",
  "Breastplate of Gleaming": "빛나는 브레스트플레이트",
  "Candle": "초",
  "Cause Fear": "공포 유발",
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
  "Dart": "다트",
  "Death Domain": "죽음 권역",
  "Dhampir": "댐피르",
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
  "Magic Resistance": "마법 저항",
  "Mantle of Inspiration": "영감의 망토",
  "Mantle of Whispers": "속삭임의 망토",
  "Mastermind": "책략가",
  "Menacing": "위협적 존재감",
  "Miner's Tattoo": "광부의 문신",
  "Misty Step": "안개 걸음",
  "Move": "이동",
  "Multiattack": "다중공격",
  "Nakano's Tarot Cards": "나카노의 타로 카드",
  "Nangnang": "낭낭",
  "Nature Domain": "자연 권역",
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
  "School of Divination": "점술 학파",
  "School of Enchantment": "매혹 학파",
  "School of Illusion": "환영 학파",
  "School of Necromancy": "사령 학파",
  "School of Transmutation": "변환 학파",
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
  "Staff of the Three Toads": "세 두꺼비의 지팡이",
  "String": "끈",
  "Studded Leather Armor": "스터디드 레더 아머",
  "Sunlight Sensitivity": "햇빛 민감성",
  "Swashbuckler": "스워시버클러",
  "Tabaxi": "타바시",
  "Tail": "꼬리",
  "Tail Swipe": "꼬리 휩쓸기",
  "Talons": "발톱",
  "Tempest Domain": "폭풍 권역",
  "Thaumaturgy": "소마법",
  "The Cat Lord": "고양이 군주",
  "Trickery Domain": "기만 권역",
  "Trigger": "발동 조건",
  "Twilight Domain": "황혼 권역",
  "Unarmed Strike": "비무장 공격",
  "Undead Fortitude": "언데드의 불굴",
  "Unusual Nature": "기이한 본성",
  "Vampiric Bite": "흡혈 물기",
  "War Domain": "전쟁 권역",
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
  "Wyvern Poison": "와이번 독"
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
  "Class Features": "클래스 특성",
  "Classes & Class Features": "클래스 및 클래스 특성",
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
  "Species": "종족",
  "Species Traits": "종족 특성",
  "Superior Darkvision.": "상급 암시야.",
  "Spells": "주문",
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

const formatBilingualName = (sourceName, translatedName) => {
  const source = normalizeText(sourceName);
  const translated = normalizeText(translatedName);

  if (!source || !translated) return translated;
  if (!/[A-Za-z]/u.test(source)) return translated;
  if (/[가-힣]/u.test(source)) return translated;
  if (translated === source) return translated;
  if (translated.includes(source)) return translated;
  if (/[A-Za-z]/u.test(translated)) return translated;

  return `${translated} ${source}`;
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

const autoTranslateName = (value) => {
  let output = normalizeText(value);
  if (!output || hasKoreanText(output) || !/[A-Za-z]/u.test(output)) return output;

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
    .replace(/\bBlade\b/gu, "칼날")
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
    .replace(/\bCloud\b/gu, "구름")
    .replace(/\bClose\b/gu, "아슬한")
    .replace(/\bContract\b/gu, "계약")
    .replace(/\bCounter\b/gu, "역추")
    .replace(/\bCourage\b/gu, "용기")
    .replace(/\bCrate\b/gu, "상자")
    .replace(/\bCuriosity\b/gu, "호기심")
    .replace(/\bDaydream\b/gu, "백일몽")
    .replace(/\bDeath\b/gu, "죽음")
    .replace(/\bDream\b/gu, "꿈")
    .replace(/\bDoor\b/gu, "문")
    .replace(/\bDrop\b/gu, "낙하")
    .replace(/\bEvening\b/gu, "저녁")
    .replace(/\bEye\b/gu, "눈")
    .replace(/\bFeet\b/gu, "발")
    .replace(/\bFire\b/gu, "불")
    .replace(/\bFootlocker\b/gu, "풋락커")
    .replace(/\bFocus\b/gu, "집중")
    .replace(/\bFriendship\b/gu, "우정")
    .replace(/\bFriend\b/gu, "친구")
    .replace(/\bGarden\b/gu, "정원")
    .replace(/\bGrace\b/gu, "은총")
    .replace(/\bGuard\b/gu, "수호")
    .replace(/\bHarvest\b/gu, "수확")
    .replace(/\bHeart\b/gu, "심장")
    .replace(/\bHidden\b/gu, "숨겨진")
    .replace(/\bHook\b/gu, "갈고리")
    .replace(/\bHunter\b/gu, "사냥꾼")
    .replace(/\bInterior\b/gu, "내부")
    .replace(/\bJump\b/gu, "도약")
    .replace(/\bKid\b/gu, "아이")
    .replace(/\bLamp\b/gu, "램프")
    .replace(/\bLadder\b/gu, "사다리")
    .replace(/\bLife\b/gu, "생명")
    .replace(/\bLightning\b/gu, "번개")
    .replace(/\bLock\b/gu, "잠금")
    .replace(/\bLoft\b/gu, "다락")
    .replace(/\bLuck\b/gu, "행운")
    .replace(/\bMagic\b/gu, "마법")
    .replace(/\bMemory\b/gu, "기억")
    .replace(/\bMercy\b/gu, "자비")
    .replace(/\bMind\b/gu, "정신")
    .replace(/\bMoon\b/gu, "달")
    .replace(/\bNight\b/gu, "밤")
    .replace(/\bOrb\b/gu, "구체")
    .replace(/\bPoison\b/gu, "독")
    .replace(/\bPrivacy\b/gu, "사생활")
    .replace(/\bResolve\b/gu, "결의")
    .replace(/\bSchool\b/gu, "학파")
    .replace(/\bShadow\b/gu, "그림자")
    .replace(/\bShelf\b/gu, "선반")
    .replace(/\bSilence\b/gu, "침묵")
    .replace(/\bSnow\b/gu, "눈")
    .replace(/\bSolar\b/gu, "태양")
    .replace(/\bSoul\b/gu, "영혼")
    .replace(/\bSpell\b/gu, "주문")
    .replace(/\bSpirit\b/gu, "영혼")
    .replace(/\bStar\b/gu, "별")
    .replace(/\bStone\b/gu, "돌")
    .replace(/\bStorm\b/gu, "폭풍")
    .replace(/\bStrike\b/gu, "강타")
    .replace(/\bSun\b/gu, "태양")
    .replace(/\bSword\b/gu, "검")
    .replace(/\bTable\b/gu, "테이블")
    .replace(/\bTank\b/gu, "탱크")
    .replace(/\bTail\b/gu, "꼬리")
    .replace(/\bThoughts\b/gu, "생각")
    .replace(/\bThrower\b/gu, "발사기")
    .replace(/\bTouch\b/gu, "손길")
    .replace(/\bTrail\b/gu, "궤적")
    .replace(/\bTruth\b/gu, "진실")
    .replace(/\bWindow\b/gu, "창문")
    .replace(/\bViolence\b/gu, "폭력")
    .replace(/\bVision\b/gu, "시야")
    .replace(/\bWheels\b/gu, "바퀴")
    .replace(/\bWings\b/gu, "날개")
    .replace(/\bWinter\b/gu, "겨울")
    .replace(/\bof the\b/gu, "의")
    .replace(/\bof\b/gu, "의")
    .replace(/\band\b/gu, "및")
    .replace(/\s{2,}/gu, " ")
    .trim();

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

const escapeHtml = (value) => {
  const div = document.createElement("div");
  div.textContent = value ?? "";
  return div.innerHTML;
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
    this.compendiumNameIndex = new Map();
    this.compendiumActorNameIndex = new Map();
    this.sharedItems = new Map();
  }

  async load() {
    this.ready = false;

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

    const compendiumFiles = await this._discoverCompendiumFiles();
    this.compendium.clear();
    this.compendiumDocLabels.clear();
    this.compendiumPageLabels.clear();
    this.compendiumPackLabels.clear();
    this.compendiumFolderLabels.clear();
    this.compendiumSignatureIndex.clear();
    this.compendiumNameIndex.clear();
    this.compendiumActorNameIndex.clear();

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
    }

    await this._indexCompendiumTranslations();
    this.ready = true;
  }

  async refresh() {
    await this.load();
  }

  getActorTranslation(actor) {
    if (!actor) return null;
    if (actor.uuid && this.world.actors.has(actor.uuid)) {
      return this._mergeTranslations(
        this._withFormattedName(actor.name, this.world.actors.get(actor.uuid)),
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

    if (item.parent instanceof Actor) {
      return this._mergeTranslations(
        this._withFormattedName(item.name, this.world.actorItems.get(item.uuid)),
        this._withFormattedName(item.name, this._getSharedItemTranslation(item)),
        this._withFormattedName(item.name, this._getCompendiumSignatureFallback(item)),
        this._withFormattedName(item.name, this._getCompendiumNameFallback(item)),
        this._getGeneratedItemTranslation(item)
      );
    }

    if (item.pack) {
      return this._withFormattedName(item.name, this._getCompendiumEntry(item.pack, item.name));
    }

    return this._mergeTranslations(
      this._withFormattedName(item.name, this.world.items.get(item.uuid)),
      this._withFormattedName(item.name, this._getSharedItemTranslation(item)),
      this._withFormattedName(item.name, this._getCompendiumSignatureFallback(item)),
      this._withFormattedName(item.name, this._getCompendiumNameFallback(item)),
      this._getGeneratedItemTranslation(item)
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

  translateAnchor(anchor, label) {
    if (!anchor || !label) return;
    const icon = anchor.querySelector("i")?.outerHTML ?? "";
    anchor.innerHTML = `${icon}${escapeHtml(label)}`;
  }

  translateHtmlString(html, { relativeTo = null, rollData = null } = {}) {
    if (!html) return html;
    const enriched = TextEditor.enrichHTML(html, {
      async: false,
      documents: true,
      rolls: true,
      secrets: false,
      relativeTo,
      rollData
    });
    const template = document.createElement("template");
    template.innerHTML = typeof enriched === "string" ? enriched : html;
    this.translateContentLinks(template.content);
    return template.innerHTML;
  }

  translateContentLinks(root) {
    root.querySelectorAll("a.content-link").forEach((anchor) => {
      const label = this.getLinkLabel(anchor);
      if (label) this.translateAnchor(anchor, label);
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
        entries: {}
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

  _mergeTranslations(...translations) {
    const merged = {};

    for (const translation of translations) {
      if (!translation) continue;
      if (!merged.name && translation.name) merged.name = translation.name;
      if (!merged.description && translation.description) merged.description = translation.description;
      if (!merged.text && translation.text) merged.text = translation.text;
    }

    return Object.keys(merged).length ? merged : null;
  }

  _translateGeneratedDescription(description) {
    if (!description) return description;

    let output = String(description ?? "");

    output = output
      .replace(/\u00a0/gu, " ")
      .replace(/<span class="No-Break">([^<]+)<\/span>/gu, "$1");

    output = output
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
      .replace(/<span class="entry-title-inner">Special\.<\/span>/gu, "<span class=\"entry-title-inner\">특수.</span>")
      .replace(/<i>Hit:<\/i>/gu, "<i>명중:</i>")
      .replace(/<i>Failure:<\/i>/gu, "<i>실패:</i>")
      .replace(/<i>Success:<\/i>/gu, "<i>성공:</i>")
      .replace(/On a failed save, /gu, "내성 굴림에 실패하면, ")
      .replace(/On a successful save, /gu, "내성 굴림에 성공하면, ")
      .replace(/The target must succeed on a ([A-Za-z]+) saving throw or ([^.]+)\./gu, (_, ability, effect) => `대상은 ${abilityToKo(ability)} 내성 굴림에 성공해야 하며, 실패하면 ${effect}.`)
      .replace(/The target must make a ([A-Za-z]+) saving throw/gu, (_, ability) => `대상은 ${abilityToKo(ability)} 내성 굴림을 해야 합니다`)
      .replace(/If the saving throw fails by ([0-9]+) or more, ([^.]+)\./gu, (_, amount, effect) => `내성 굴림에 ${amount} 이상 차이로 실패하면, 추가로 ${effect}.`)
      .replace(/The creature wakes up if it takes damage or if another creature takes an action to shake it awake\./gu, "피해를 받거나 다른 생물이 행동을 사용해 흔들어 깨우면 그 생물은 깨어납니다.")
      .replace(/A creature can use its action to make a ([A-Za-z]+) check, freeing itself or another creature within its reach on a success\./gu, (_, ability) => `생물은 행동을 사용해 ${abilityToKo(ability)} 판정을 할 수 있으며, 성공하면 자신이나 손이 닿는 거리 내 다른 생물 하나를 풀어줄 수 있습니다.`)
      .replace(/The target drops whatever it is holding and then ends its turn\./gu, "대상은 들고 있는 것을 떨어뜨리고 그 턴을 끝냅니다.")
      .replace(/The target spends its turn moving away from you by the fastest available means\./gu, "대상은 가능한 가장 빠른 수단으로 당신에게서 멀어지는 데 자신의 턴을 사용합니다.")
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
      .replace(/The ([^.]+?) casts the (.+?) spell, requiring no spell components and using Charisma as the spellcasting ability \(spell save DC <span class="rd__dc">([0-9]+)<\/span>\)\./gu, (_, subject, spellName, dc) => `${subjectToKo(subject)}는 ${spellName} 주문을 시전합니다. 이때 주문 구성 요소는 필요하지 않으며, 주문시전 능력치는 매력입니다 (주문 내성 DC <span class="rd__dc">${dc}</span>).`)
      .replace(/The ([^.]+?) casts the (.+?) spell, requiring no spell components and using Charisma as the spellcasting ability \(spell save DC ([0-9]+) ?\)\./gu, (_, subject, spellName, dc) => `${subjectToKo(subject)}는 ${spellName} 주문을 시전합니다. 이때 주문 구성 요소는 필요하지 않으며, 주문시전 능력치는 매력입니다 (주문 내성 DC ${dc}).`)
      .replace(/<span class="entry-title-inner">Psychic Blades<\/span>/gu, "<span class=\"entry-title-inner\">정신 칼날</span>")
      .replace(/<span class="entry-title-inner">Words of Terror<\/span>/gu, "<span class=\"entry-title-inner\">공포의 속삭임</span>")
      .replace(/<span class="entry-title-inner">Mantle of Whispers<\/span>/gu, "<span class=\"entry-title-inner\">속삭임의 망토</span>")
      .replace(/<span class="entry-title-inner">Shadow Lore<\/span>/gu, "<span class=\"entry-title-inner\">그림자 비전</span>")
      .replace(/<span class="entry-title-inner">Whispers of the Dead<\/span>/gu, "<span class=\"entry-title-inner\">죽은 자의 속삭임</span>")
      .replace(/<span class="entry-title-inner">Leporine Senses\.<\/span>/gu, "<span class=\"entry-title-inner\">토끼 감각.</span>")
      .replace(/<span class="entry-title-inner">Superior Darkvision\.<\/span>/gu, "<span class=\"entry-title-inner\">상급 암시야.</span>")
      .replace(/<span class="entry-title-inner">Keen Senses\.<\/span>/gu, "<span class=\"entry-title-inner\">예리한 감각.</span>")
      .replace(/<span class="entry-title-inner">Sunlight Sensitivity\.<\/span>/gu, "<span class=\"entry-title-inner\">햇빛 민감성.</span>")
      .replace(/<span class="entry-title-inner">Drow Magic\.<\/span>/gu, "<span class=\"entry-title-inner\">드로우 마법.</span>")
      .replace(/<span class="entry-title-inner">Drow Weapon Training\.<\/span>/gu, "<span class=\"entry-title-inner\">드로우 무기 수련.</span>")
      .replace(/<span class="entry-title-inner">Shapechanger\.<\/span>/gu, "<span class=\"entry-title-inner\">변신체.</span>")
      .replace(/<span class="entry-title-inner">Changeling Instincts\.<\/span>/gu, "<span class=\"entry-title-inner\">체인질링의 본능.</span>")
      .replace(/<span class="entry-title-inner">Activating the Armor\.<\/span>/gu, "<span class=\"entry-title-inner\">갑옷 활성화.</span>")
      .replace(/<span class="entry-title-inner">Augmented Physicality\.<\/span>/gu, "<span class=\"entry-title-inner\">강화된 신체 능력.</span>")
      .replace(/<span class="entry-title-inner">Environmental Adaptation\.<\/span>/gu, "<span class=\"entry-title-inner\">환경 적응.</span>")
      .replace(/<span class="entry-title-inner">Force Field\.<\/span>/gu, "<span class=\"entry-title-inner\">역장.</span>")
      .replace(/<span class="entry-title-inner">Propulsion\.<\/span>/gu, "<span class=\"entry-title-inner\">추진.</span>")
      .replace(/<span class="entry-title-inner">Replacing the Energy Cell\.<\/span>/gu, "<span class=\"entry-title-inner\">에너지 셀 교체.</span>")
      .replace(/<span class="entry-title-inner">Harvesting Troll Blood<\/span>/gu, "<span class=\"entry-title-inner\">트롤 피 채취</span>")
      .replace(/<span class="entry-title-inner">Instant Death and Mutations<\/span>/gu, "<span class=\"entry-title-inner\">즉사와 돌연변이</span>")
      .replace(/<span class="entry-title-inner">Instant Death<\/span>/gu, "<span class=\"entry-title-inner\">즉사</span>")
      .replace(/<span class="entry-title-inner">Mutations\.<\/span>/gu, "<span class=\"entry-title-inner\">돌연변이.</span>");

    output = output
      .replace(/<h1>Description<\/h1>/gu, "<h1>설명</h1>")
      .replace(/<h1>Class Features<\/h1>/gu, "<h1>클래스 특성</h1>")
      .replace(/<strong>Hit Die:<\/strong>/gu, "<strong>히트 다이스:</strong>")
      .replace(/<strong>Primary Ability:<\/strong>/gu, "<strong>주요 능력:</strong>")
      .replace(/<strong>Saves:<\/strong>/gu, "<strong>내성:</strong>")
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
      .replace(/This feature has no effect on undead and constructs\./gu, "이 특성은 언데드와 구조물에게는 아무 효과가 없습니다.");

    return output;
  }

  _getSharedItemTranslation(item) {
    const key = signatureFor({
      type: item?.type,
      name: item?.name,
      content: item?.system?.description?.value ?? ""
    });
    return this.sharedItems.get(key) ?? null;
  }

  _getCompendiumSignatureFallback(item) {
    const key = signatureFor({
      type: item?.type,
      name: item?.name,
      content: item?.system?.description?.value ?? ""
    });
    return this.compendiumSignatureIndex.get(key) ?? null;
  }

  _getCompendiumNameFallback(item) {
    if (!item?.name || !NAME_FALLBACK_TYPES.has(item.type)) return null;
    const key = normalizeText(item.name).toLowerCase();
    const candidates = this.compendiumNameIndex.get(key) ?? [];
    const preferredCollections = this._preferredCollectionsForType(item.type);
    for (const collection of preferredCollections) {
      const match = candidates.find((candidate) => candidate.collection === collection);
      if (match?.translation) return match.translation;
    }
    return candidates[0]?.translation ?? null;
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

  _collectionFromPath(relativePath) {
    const fileName = relativePath.split("/").at(-1) ?? "";
    return fileName.replace(/\.json$/u, "");
  }

  async _indexCompendiumTranslations() {
    for (const [collection, data] of this.compendium.entries()) {
      const pack = game.packs.get(collection);
      if (!pack) continue;

      data.entries ??= {};
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

      const documents = await pack.getDocuments();

      for (const document of documents) {
        const entry = data.entries?.[document.name] ?? {};

        if (document.documentName === "Item") {
          const translation = this._mergeCompendiumEntry(entry, this._getGeneratedItemTranslation(document), {
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
            this._addCompendiumNameCandidate(collection, document.name, data.entries[document.name]);
          }

          data.entries[document.name].items ??= {};
          for (const item of document.items ?? []) {
            const itemEntry = data.entries[document.name].items?.[item.name] ?? {};
            const itemTranslation = this._mergeCompendiumEntry(itemEntry, this._getGeneratedItemTranslation(item), {
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
          }
          if (Object.keys(translation.pages).length) {
            data.entries[document.name] = translation;
          }
        }
      }

      const index = await pack.getIndex();
      for (const entry of index.values()) {
        const translation = data.entries?.[entry.name];
        if (!translation?.name) continue;
        this.compendiumDocLabels.set(`Compendium.${collection}.${entry.documentName ?? pack.documentName}.${entry._id}`, translation.name);
        this._addCompendiumNameCandidate(collection, entry.name, translation);
      }

      const journalEntries = Object.entries(data.entries ?? {}).filter(([, entry]) => entry?.pages);
      if (!journalEntries.length) continue;

      for (const [entryName, translation] of journalEntries) {
        const match = index.find((entry) => entry.name === entryName);
        if (!match) continue;

        const document = await pack.getDocument(match._id);
        if (!document?.pages) continue;

        for (const page of document.pages) {
          const pageTranslation = translation.pages?.[page.name];
          if (!pageTranslation?.name) continue;
          this.compendiumPageLabels.set(page.uuid, pageTranslation.name);
        }
      }
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
