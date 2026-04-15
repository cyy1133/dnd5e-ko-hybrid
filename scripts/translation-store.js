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
  "Specialty": "전문 분야"
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
    }

    await this._indexCompendiumTranslations();
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
          if (!pageTranslation?.name) continue;
          this.compendiumPageLabels.set(page.uuid, pageTranslation.name);
        }
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
