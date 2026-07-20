# LifeCore v04 demo

A LifeCore OS egy local-first életmenedzsment- és agent-munkafolyamat prototípus. Ez a repó a nyilvános, kizárólag szintetikus adatokkal működő bemutató változatot tartalmazza.

[Élő demo megnyitása](https://theloviverse.github.io/lifecore-demo/)

A közvetlen, verziózott oldal: [lifecore-v04.html](https://theloviverse.github.io/lifecore-demo/lifecore-v04.html)

## Használati módok

### DEMO

- Ez az alapértelmezett mód.
- Kizárólag szintetikus, GREEN besorolású bemutatóadatokat használ.
- Nem olvas valódi vaultot vagy személyes fájlokat.
- Mobilon a felület megtekintésére és technikai smoke tesztre használható.

### FÁJL

- A felhasználó által kifejezetten kiválasztott helyi mappát olvassa.
- A működéshez olyan böngésző kell, amely támogatja a helyi mappaválasztást és a szükséges fájlhozzáférést.
- A legmegbízhatóbb célkörnyezet jelenleg egy Chromium-alapú asztali böngésző.
- Mobilon a támogatás eszköz- és böngészőfüggő; ahol nincs mappaválasztási lehetőség, a FÁJL mód nem használható.
- A GitHub Pages önmagában nem kap hozzáférést egy helyi vaulthoz: a mappát mindig a felhasználónak kell kiválasztania és engedélyeznie.

## Mobilos használat

A nyilvános DEMO mód mobilon megnyitható. Ez a mobilos felület és a safety-kapuk ellenőrzésére alkalmas, de nem helyettesíti a saját vaulton végigvitt valós handoffot.

A Phase 4 rolloutba csak a tényleges, teljes **Inbox → Accepted / Merged** folyamat számít bele.

## Adatvédelmi határ

- Ebben a publikus repóban nincs valódi vault-adat.
- A bemutatóadatok szintetikusak és GREEN besorolásúak.
- Valódi személyes, pénzügyi, egészségügyi vagy más érzékeny tartalom nem kerülhet ebbe a repóba.
- A FÁJL mód helyi hozzáférése nem jelent automatikus feltöltést a GitHubra.

## Jelenlegi korlátok

- A rendszer nem indít automatikus cloud-agent hívást.
- Az agent-dispatch kézi, ember által jóváhagyott művelet.
- A Local Runtime útvonal szüneteltetve van.
- A completion reportot a dispatch után külön kell elhelyezni a helyi `30_Agent_Work/completed/` mappában.
- Az ütemezett handoff-kiadás szándékosan nincs engedélyezve.
- A teljes Phase 4 DoD a saját, helyi vaultban végigvitt valós handoffokkal teljesíthető.

## A repo fő fájljai

- `index.html` — a GitHub Pages belépési pontja, jelenleg a v04 felület.
- `lifecore-v04.html` — a verziózott v04 felület.
- `lifecore-data.js` — a szintetikus demo-adatforrás.
- `assets/` — a publikus vizuális elemek.

---

A demo célja a felület, a fájlkezelési kapuk és az agent-pipeline biztonságos bemutatása. A valós vault továbbra is local-first marad.
