# dnd5e-ko-hybrid

`dnd5e-ko-hybrid`는 기존 `dnd5e-ko`의 컴펜디움 번역 형식을 유지하면서, 월드에 직접 들어온 `Item`, `Actor` 내부 아이템, `JournalEntryPage`까지 런타임 오버레이로 한글화하는 Foundry VTT 모듈입니다.

## 설치

Foundry VTT의 `Install Module`에서 아래 manifest URL을 넣으면 설치할 수 있습니다.

`https://raw.githubusercontent.com/cyy1133/dnd5e-ko-hybrid/main/module.json`

직접 내려받으려면 아래 저장소를 사용하면 됩니다.

`https://github.com/cyy1133/dnd5e-ko-hybrid`

핵심 원칙은 단순합니다.

- 모듈이 **활성화**되어 있을 때만 번역이 보입니다.
- 원본 문서는 직접 수정하지 않습니다.
- 모듈을 **비활성화**하면 화면이 원래 영어 데이터로 돌아갑니다.
- `&Reference[...]`, `@UUID[...]`, `@Compendium[...]`, `@item[...]`, `[[/...]]` 링크는 가능한 한 그대로 유지합니다.

## 포함 범위

- `dnd5e-ko` 스타일의 `Babele` 컴펜디움 번역 파일
- 월드 `Item` 이름/설명 오버레이
- `Actor` 내부 `Item` 이름/설명 오버레이
- `JournalEntryPage` 이름/본문 오버레이
- 렌더된 설명 안의 `content-link` 라벨 치환

## 폴더 구조

```text
module.json
scripts/
styles/
localization/
  languages/ko.json
  compendium/ko/
    index.json
    dnd5e.rules.json
  world/ko/
    actors.json
    world-items.json
    actor-items.json
    journal-pages.json
```

## 월드 번역 데이터 형식

월드 번역 파일은 UUID 기반입니다.

```json
{
  "label": "World Items",
  "entries": {
    "Item.abc123": {
      "name": "안개 걸음",
      "description": "<p>...</p>"
    }
  }
}
```

`Actor` 내부 아이템은 임베디드 UUID를 그대로 씁니다.

```json
{
  "label": "Actor Embedded Items",
  "entries": {
    "Actor.XYZ.Item.123": {
      "name": "비무장 공격",
      "description": "<p>...</p>"
    }
  }
}
```

저널 페이지는 `text` 필드를 씁니다.

```json
{
  "label": "Journal Pages",
  "entries": {
    "JournalEntry.ABC.JournalEntryPage.DEF": {
      "name": "개요",
      "text": "<p>...</p>"
    }
  }
}
```

추가 필드는 무시되므로, 템플릿 생성 시 들어가는 `originalName`, `originalDescription` 같은 메타데이터를 함께 둬도 됩니다.

## 템플릿 추출

GM으로 접속한 상태에서 브라우저 콘솔에서 아래를 실행하면 번역 템플릿 JSON을 다운로드할 수 있습니다.

```js
dnd5eKoHybrid.downloadTemplates({ onlyEnglish: true });
```

메모리 내 객체만 보고 싶다면:

```js
dnd5eKoHybrid.exportTemplates({ onlyEnglish: true });
```

## 현재 단계

이 저장소의 1차 구현은 다음을 목표로 합니다.

- 기존 `dnd5e-ko`와 충돌하지 않는 확장 모듈 뼈대
- 비파괴식 런타임 오버레이
- 규칙 참조 라벨 보강용 `dnd5e.rules` 시드
- 월드 템플릿 추출 API

다음 확장 목표는 다음과 같습니다.

- 더 넓은 `dnd5e.rules` 페이지 번역 커버리지
- 실제 월드 데이터용 대량 번역 JSON 생성/동기화 파이프라인
- 시트별 선택자 보강과 렌더링 커버리지 확대
