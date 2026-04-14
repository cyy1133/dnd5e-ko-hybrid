# Translation Schema

## 목표

이 모듈의 번역 데이터는 두 계층으로 나뉩니다.

- `compendium` 계층: `dnd5e-ko`와 같은 `Babele` 포맷
- `world` 계층: 런타임 오버레이용 UUID 기반 포맷

## Compendium

`localization/compendium/ko/<collection>.json`

```json
{
  "label": "규칙 (SRD)",
  "folders": {
    "Cantrip": "소마법"
  },
  "entries": {
    "Appendix E: Rules": {
      "name": "부록 E: 규칙",
      "pages": {
        "Spell Scroll": {
          "name": "주문 두루마리 Spell Scroll",
          "text": "<p>...</p>",
          "system": {
            "tooltip": "<p>...</p>"
          }
        }
      }
    }
  }
}
```

Actor compendium packs can also include embedded item translations:

```json
{
  "label": "Beast World",
  "entries": {
    "Wolf": {
      "name": "늑대 Wolf",
      "items": {
        "Bite": {
          "name": "물기 Bite",
          "description": "<p>...</p>"
        }
      }
    }
  }
}
```

## World

`localization/world/ko/*.json`

```json
{
  "label": "World Items",
  "entries": {
    "Item.ABC": {
      "name": "번역된 이름",
      "description": "<p>번역된 HTML</p>",
      "originalName": "Original Name",
      "originalDescription": "<p>Original HTML</p>"
    }
  }
}
```

Downloaded template files may also include a `compendiums` block. This is the export format used to generate external pack translation files:

```json
{
  "compendiums": {
    "label": "Compendiums",
    "entries": {
      "world.beast-world": {
        "label": "Beast World",
        "documentName": "Actor",
        "entries": {
          "Wolf": {
            "name": "",
            "description": "",
            "originalName": "Wolf",
            "originalDescription": "<p>...</p>",
            "items": {
              "Bite": {
                "name": "",
                "description": "",
                "originalName": "Bite",
                "originalDescription": "<p>...</p>"
              }
            }
          }
        }
      }
    }
  }
}
```

## 보존 원칙

- 링크 문법은 번역하지 않고 보존합니다.
- 번역 대상은 자연어 본문입니다.
- 아래 문법은 그대로 유지해야 합니다.

```text
&Reference[...]
@UUID[...]
@Compendium[...]
@item[...]
[[/damage ...]]
[[/save ...]]
```
