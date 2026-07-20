// LifeCore MVP — demo adatmodell és kereszt-domain szabálymotor
// MINDEN ADAT DEMO/MINTA — valós személyes adat nélkül.
// Lokális tárolás: localStorage ("lifecore.v1.captures", "lifecore.v1.decisions")

export const DOMAINS = [
  { id: 'command',  name: 'Parancsnokság',   icon: '🜂', score: 78, tone: 'ok',   note: 'Beérkező: 3 döntés vár · index napra kész' },
  { id: 'time',     name: 'Idő',             icon: '◔', score: 54, tone: 'warn', note: 'Heti terhelés 92% — túlvállalás jele' },
  { id: 'finance',  name: 'Pénzügyek',       icon: '◈', score: 61, tone: 'warn', note: 'Számla határidő: júl. 5. · büdzsé 71%-on' },
  { id: 'work',     name: 'Munka / projektek', icon: '⌘', score: 72, tone: 'ok', note: 'App_Dev sprint: 7/10 kész · 1 blokkoló' },
  { id: 'body',     name: 'Test',            icon: '♥', score: 43, tone: 'crit', note: 'Alvás 5ó 40p (3 napja 6ó alatt) · 2 100 lépés' },
  { id: 'mind',     name: 'Elme',            icon: '☾', score: 58, tone: 'warn', note: 'Hangulat 3/5 · stressz emelkedő · 1 reflexió ma' },
  { id: 'social',   name: 'Kapcsolatok',     icon: '☍', score: 66, tone: 'info', note: '2 esedékes bejelentkezés: Anya, Dávid (12 napja)' },
  { id: 'learning', name: 'Tanulás & AI',    icon: '✦', score: 49, tone: 'warn', note: 'Heti cél: 3 tanulóblokk · eddig 1 teljesült' },
  { id: 'rest',     name: 'Pihenés',         icon: '☼', score: 38, tone: 'crit', note: '0 pihenőblokk ezen a héten · regeneráció gyenge' },
  { id: 'purpose',  name: 'Motiváció',       icon: '✧', score: 74, tone: 'ok',  note: 'Negyedéves cél-illeszkedés: erős · irány tartható' },
];

// === C-döntés a kódban (docs/architecture/01_diagnozis.md): ===
// A Life Areas az egyetlen user-facing modell; a "workstation/station" belső,
// származtatott nézet. Új felület a LIFE_AREAS / PROJECTS / FEEDS exportokat
// használja — a STATIONS csak a régi UI kompatibilitása miatt él.

// A 9 életterület = DOMAINS a 'command' nélkül ('command' rendszer-egészség, nem életterület).
export const LIFE_AREAS = DOMAINS.filter((d) => d.id !== 'command');

// Rendszer-egészség — a régi 'command' domain utódja: Command Center widget +
// System Health metrika-kategória (docs/architecture/04_metrikak_rendszer.md 2.2).
export const SYSTEM_HEALTH = DOMAINS.find((d) => d.id === 'command');

// Projektek — korábban a STATIONS kevert listájában (App_Dev, Loviverse).
// goalId: null = Inbox-státusz; a "No Goal, No Project" szabály szerint 7 napon
// belül célt kap vagy Parked (docs/architecture/03_celok_rendszer.md 3.1).
export const PROJECTS = [
  { id: 'appdev',    name: 'App_Dev',   goalId: null, lifeAreaId: 'work',    zone: 'income',   dot: 'warn', badge: '1 blokkoló' },
  { id: 'loviverse', name: 'Loviverse', goalId: null, lifeAreaId: 'purpose', zone: 'creative', dot: 'ok',   badge: '' },
];

// Rendszerfeedek — korábban szintén a STATIONS-ben (Email_HQ); az INTEGRATIONS
// lista a tervezett feedeket sorolja, ez az élő/demo jelzéseket.
export const FEEDS = [
  { id: 'email', name: 'Email_HQ', dot: 'ok', badge: '3', areaId: null },
];

// Életterület-tükrök a régi oldalsávhoz: a dot a domain tone-jából származik,
// a badge demo-jelzés a domain note-jának kulcsszáma.
const MIRROR_DEFS = [
  { id: 'finance',  name: 'Pénzügyek',    badge: 'júl. 5.', domainId: 'finance' },
  { id: 'health',   name: 'Egészség',     badge: 'alvás!',  domainId: 'body' },
  { id: 'admin',    name: 'Admin',        badge: '',        domainId: 'command' },
  { id: 'social',   name: 'Kapcsolatok',  badge: '2',       domainId: 'social' },
  { id: 'learning', name: 'Tanulás & AI', badge: '1/3',     domainId: 'learning' },
  { id: 'rest',     name: 'Pihenés',      badge: '0 blokk', domainId: 'rest' },
];
const mirrorStation = (m) => {
  const d = DOMAINS.find((x) => x.id === m.domainId);
  return { id: m.id, name: m.name, dot: d.tone, badge: m.badge, domainId: m.domainId };
};

// DEPRECATED — származtatott nézet a régi UI-nak (LifeCore MVP.dc.html m.STATIONS).
// Sorrend és mezőkészlet a korábbi kézi listával azonos.
export const STATIONS = [
  { id: FEEDS[0].id, name: FEEDS[0].name, dot: FEEDS[0].dot, badge: FEEDS[0].badge },
  { id: PROJECTS[0].id, name: PROJECTS[0].name, dot: PROJECTS[0].dot, badge: PROJECTS[0].badge, domainId: PROJECTS[0].lifeAreaId },
  ...MIRROR_DEFS.map(mirrorStation),
  { id: PROJECTS[1].id, name: PROJECTS[1].name, dot: PROJECTS[1].dot, badge: PROJECTS[1].badge, domainId: PROJECTS[1].lifeAreaId },
];

// Mai nap terve — a szabálymotor kimenete (demo).
// domainId: melyik életterület pontszámát növeli a kipipálás.
// energyImpact: a kipipálás kapacitás-hatása %-ban (munka/admin negatív, regeneráció pozitív, semleges 0).
// scoreDelta: mennyivel nő a domain pontszáma kipipáláskor.
export const DAY_PLAN = [
  { time: '08:00', title: 'Reggeli rutin + gyors reflexió', meta: 'Test · Elme', tag: 'RUTIN', tone: 'ok', done: true, domainId: 'body', energyImpact: 0, scoreDelta: 4 },
  { time: '09:00', title: 'Fókuszblokk 1 — App_Dev: bejelentkezési hiba javítása', meta: 'Munka · 90 perc · legfontosabb', tag: 'P1', tone: 'warn', done: false, domainId: 'work', energyImpact: -4, scoreDelta: 5 },
  { time: '11:00', title: 'Séta + ebéd — képernyő nélkül', meta: 'Pihenés · védett idő', tag: 'VÉDETT', tone: 'ok', done: false, domainId: 'rest', energyImpact: 6, scoreDelta: 6 },
  { time: '13:00', title: 'Fókuszblokk 2 — Számlázás előkészítése (határidő: júl. 5.)', meta: 'Pénzügyek · 60 perc', tag: 'P1', tone: 'warn', done: false, domainId: 'finance', energyImpact: -4, scoreDelta: 5 },
  { time: '15:00', title: 'Admin sáv — e-mailek, apró teendők (max. 45 p)', meta: 'Parancsnokság · korlátozott', tag: 'P3', tone: 'dim', done: false, domainId: 'command', energyImpact: -3, scoreDelta: 3 },
  { time: '18:30', title: 'Hívás: Anya — heti bejelentkezés', meta: 'Kapcsolatok · emlékeztető', tag: 'SZOC', tone: 'info', done: false, domainId: 'social', energyImpact: 2, scoreDelta: 6 },
  { time: '21:30', title: 'Levezetés — képernyőmentes este, korai lefekvés', meta: 'Rendszer-javaslat az alvásadósság miatt', tag: 'ÚJ', tone: 'ok', done: false, domainId: 'rest', energyImpact: 4, scoreDelta: 5 },
];

export const DEADLINES = [
  { date: 'júl. 5.',  title: 'Számla kiállítása — Q3 ügyfél', domain: 'Pénzügyek', tone: 'crit' },
  { date: 'júl. 8.',  title: 'App_Dev béta kiadás', domain: 'Munka', tone: 'warn' },
  { date: 'júl. 12.', title: 'Negyedéves büdzsé-felülvizsgálat', domain: 'Pénzügyek', tone: 'dim' },
];

// Kereszt-domain szabálymotor — VALÓDI logika, demo bemeneteken fut.
// signals: { sleepHours3d, weekLoadPct, restBlocks, learningDone, learningGoal,
//            invoiceDueInDays, socialOverdue: [{name, days}], moodAvg }
export const SIGNALS = {
  sleepHours3d: [5.9, 5.5, 5.67],
  weekLoadPct: 92,
  restBlocks: 0,
  learningDone: 1,
  learningGoal: 3,
  invoiceDueInDays: 2,
  socialOverdue: [{ name: 'Anya', days: 7 }, { name: 'Dávid', days: 12 }],
  moodAvg: 3.0,
  sprintDone: 7, sprintTotal: 10,
};

export function runRules(s) {
  const out = [];
  const avgSleep = s.sleepHours3d.reduce((a, b) => a + b, 0) / s.sleepHours3d.length;
  if (avgSleep < 6) {
    out.push({ id: 'SLEEP_LOAD', sev: 'crit', icon: '⚠',
      title: 'Alvás → munkaterhelés: kapacitás ' + capacity(s) + '%-ra állítva',
      body: '3 napja ' + avgSleep.toFixed(1).replace('.', ',') + ' óra az átlagalvás. A mai terv 4 helyett 2 fókuszblokkra csökkentve; a mélymunka délelőttre került.',
      rule: 'Egészség × Idő · SLEEP_DEBT_3D → LOAD_CAP', needsApproval: false, domainId: 'body', scoreDelta: 6 });
    out.push({ id: 'WIND_DOWN', sev: 'ok', icon: '☾',
      title: 'Esti levezetés javasolva 21:30-tól — jóváhagyásra vár',
      body: 'Képernyőmentes este és korai lefekvés az alvásadósság törlesztésére. A rendszer nem állít be semmit nélküled.',
      rule: 'Pihenés × Egészség', needsApproval: true, domainId: 'rest', scoreDelta: 6 });
  }
  if (s.weekLoadPct > 85 && s.restBlocks === 0) {
    out.push({ id: 'REST_GUARD', sev: 'warn', icon: '☼',
      title: 'Túlterhelt hét → pihenésvédelem',
      body: 'A heti terhelés ' + s.weekLoadPct + '%, pihenőblokk 0. Javaslat: szombat délelőtt védett pihenőidő, munka nélkül.',
      rule: 'Idő × Pihenés · OVERLOAD_WEEK → REST_BLOCK', needsApproval: true, domainId: 'rest', scoreDelta: 6 });
  }
  if (s.invoiceDueInDays <= 3) {
    out.push({ id: 'FIN_CAL', sev: 'warn', icon: '◈',
      title: 'Határidő-védelem: számlablokk betéve ma 13:00-ra',
      body: 'Számla-határidő ' + s.invoiceDueInDays + ' nap múlva (vasárnap). Az előkészítő blokk ma elvégezhető, így a hétvége szabad marad.',
      rule: 'Pénzügyek × Naptár · DEADLINE_NEAR → CAL_BLOCK', needsApproval: false, domainId: 'finance', scoreDelta: 6 });
  }
  s.socialOverdue.filter(p => p.days >= 10).forEach(p => {
    out.push({ id: 'SOC_' + p.name, sev: 'info', icon: '☍',
      title: 'Üzenetvázlat ' + p.name + 'nak — ' + p.days + ' napja nem beszéltetek',
      body: 'A vázlatot te küldöd el, a rendszer soha nem üzen helyetted.',
      rule: 'Kapcsolatok · CONTACT_GAP → DRAFT', needsApproval: false, draft: true, domainId: 'social', scoreDelta: 8,
      draftText: 'Szia ' + p.name + '! Rég beszéltünk — van kedved a hétvégén egy gyors hívást? Kíváncsi vagyok, mi újság veled. 🙂' });
  });
  if (s.learningDone < s.learningGoal) {
    out.push({ id: 'LEARN_GAP', sev: 'info', icon: '✦',
      title: 'Tanulási rutin lemaradásban (' + s.learningDone + '/' + s.learningGoal + ')',
      body: 'A heti áttekintésben napirendre kerül — most nem terheli a napot.',
      rule: 'Tanulás · WEEKLY_REVIEW_FLAG', needsApproval: false, domainId: 'learning', scoreDelta: 5 });
  }
  if (s.sprintDone / s.sprintTotal >= 0.7) {
    out.push({ id: 'SPRINT_OK', sev: 'pos', icon: '✓',
      title: 'App_Dev sprint jó ütemben (' + s.sprintDone + '/' + s.sprintTotal + ')',
      body: 'A béta kiadás (júl. 8.) a jelenlegi tempóval tartható.',
      rule: 'Munka · PACE_OK', needsApproval: false, domainId: 'work', scoreDelta: 4 });
  }
  return out;
}

// Definiált számítású area-státusz (ok/warn/crit) a SIGNALS-ból — ahol nincs
// definiált jel, null-t ad vissza: ott státusz-állítás sem tehető
// ("No Metric, No Progress Claim" — docs/architecture/04_metrikak_rendszer.md).
// A DOMAINS score/tone mezői DEMO-értékek; a Phase 2 UI ezt a függvényt
// használja majd a tone helyett, a numerikus score pedig kivezetésre kerül.
export function areaStatus(areaId, s) {
  const avgSleep = s.sleepHours3d.reduce((a, b) => a + b, 0) / s.sleepHours3d.length;
  switch (areaId) {
    case 'body':     return avgSleep < 6 ? 'crit' : avgSleep < 7 ? 'warn' : 'ok';
    case 'rest':     return s.restBlocks === 0 ? 'crit' : s.restBlocks < 2 ? 'warn' : 'ok';
    case 'time':     return s.weekLoadPct > 100 ? 'crit' : s.weekLoadPct > 85 ? 'warn' : 'ok';
    case 'learning': return s.learningDone >= s.learningGoal ? 'ok' : s.learningDone > 0 ? 'warn' : 'crit';
    case 'finance':  return s.invoiceDueInDays <= 1 ? 'crit' : s.invoiceDueInDays <= 3 ? 'warn' : 'ok';
    case 'mind':     return s.moodAvg < 2.5 ? 'crit' : s.moodAvg < 3.5 ? 'warn' : 'ok';
    case 'social':   return s.socialOverdue.some((p) => p.days >= 10) ? 'warn' : 'ok';
    default:         return null; // work, purpose: nincs definiált jel — nincs státusz-állítás
  }
}

export function capacity(s) {
  const avgSleep = s.sleepHours3d.reduce((a, b) => a + b, 0) / s.sleepHours3d.length;
  let cap = 100;
  if (avgSleep < 6) cap -= 30;
  else if (avgSleep < 7) cap -= 15;
  if (s.weekLoadPct > 100) cap -= 10;
  if (s.restBlocks === 0) cap -= 8;
  if (s.moodAvg < 2.5) cap -= 10;
  return Math.max(30, cap);
}

// Heti áttekintés tartalma (demo bemenetből számolt részek + fix demo elemek)
export function weeklyReview(s) {
  return {
    wins: [
      'App_Dev sprint: ' + s.sprintDone + '/' + s.sprintTotal + ' feladat kész — a béta tartható',
      'Minden pénzügyi határidő időben észlelve, semmi nem csúszott',
      'Reggeli rutin 6/7 napon teljesült',
    ],
    gaps: [
      'Alvásátlag ' + (s.sleepHours3d.reduce((a,b)=>a+b,0)/3).toFixed(1).replace('.', ',') + ' óra — cél: 7+ · 3 egymást követő rossz éjszaka',
      'Pihenőblokk: ' + s.restBlocks + ' — a regeneráció a hét vesztese',
      'Tanulás: ' + s.learningDone + '/' + s.learningGoal + ' blokk — két blokk átcsúszik a jövő hétre',
      'Dávid: ' + s.socialOverdue[1].days + ' napja nincs kapcsolat — vázlat készült',
    ],
    nextWeek: [
      'Terhelésplafon: 80% (regeneráció-előző hét)',
      'Alvásvédelem: 23:00 lefekvési horgony, esti levezetéssel',
      'Szombat délelőtt: védett pihenőidő (jóváhagyás esetén)',
      '2 tanulóblokk hétfő/szerda reggelre előre betéve',
      'Számla + büdzsé-felülvizsgálat: kedd 13:00 pénzügyi sáv',
    ],
  };
}

// Kezdeti demo rögzítések
export const SEED_CAPTURES = [
  { type: 'MÉRÉS', time: '07:15', text: 'Alvás: 5ó 40p · Galaxy Watch (demo szinkron)', tone: 'ok' },
  { type: 'REFLEXIÓ', time: '07:32', text: '„Fáradt vagyok, de a sprint jól halad. Ma nem vállalok be újat."', tone: 'warn' },
  { type: 'JEGYZET', time: '07:35', text: 'Könyvelőtől megkérdezni: Q3 előleg összege', tone: 'info' },
];

export const INTEGRATIONS = [
  { name: 'Samsung Health (Watch Ultra)', status: 'DEMO', on: true },
  { name: 'Naptár-szinkron', status: 'TERVEZETT', on: false },
  { name: 'Lokális AI modell (RTX 4070)', status: 'TERVEZETT', on: false },
  { name: 'Banki export (CSV import)', status: 'TERVEZETT', on: false },
];

export const WEEK_TREND = [
  { day: 'Szo', v: 72 }, { day: 'Va', v: 68 }, { day: 'H', v: 63 },
  { day: 'K', v: 58 }, { day: 'Sze', v: 52 }, { day: 'Cs', v: 44 }, { day: 'Ma', v: 47 },
];

export const WEEK_LOAD = [
  { day: 'H', v: '96%', tone: 'warn' }, { day: 'K', v: '104%', tone: 'warn' },
  { day: 'Sze', v: '91%', tone: 'warn' }, { day: 'Cs', v: '88%', tone: 'crit' },
  { day: 'Ma', v: '62%', tone: 'ok' }, { day: 'Szo', v: 'pihenő?', tone: 'dashed' },
  { day: 'Va', v: 'szabad', tone: 'empty' },
];

// Phase 2 — kizárólag szintetikus GREEN demo-entitások.
// A seed JSON-kompatibilis és mélyen fagyasztott: a UI saját, másolt state-et
// perzisztálhat belőle, de ez a modul nem olvas és nem ír localStorage-ot.
// A hivatkozások a fenti kanonikus LIFE_AREAS / PROJECTS / FEEDS rekordok id-i.
const deepFreeze = (value) => {
  if (!value || typeof value !== 'object' || Object.isFrozen(value)) return value;
  Object.values(value).forEach(deepFreeze);
  return Object.freeze(value);
};

export const PHASE2_SEED = deepFreeze({
  schemaVersion: 2,
  seedId: 'lifecore-phase2-demo-v1',
  dataClass: 'GREEN',
  synthetic: true,
  demoOnly: true,
  goals: [
    {
      id: 'DEMO-GOAL-APPDEV',
      szint: 'project',
      cim: 'App_Dev demo-cél',
      miert: 'Az App_Dev demo-projekt lezárható folyamatának kipróbálása.',
      life_area: 'work',
      projektek: ['DEMO-PROJ-APPDEV'],
      dod: 'Az App_Dev demo-sprint állapota a definiált metrikából ellenőrizhető, és a review-ban lezárható.',
      siker_metrikak: ['DEMO-MET-SPRINT'],
      kockazat_anti_cel: 'A demo-cél nem jelent valós kiadást vagy külső rendszer módosítását.',
      statusz: 'active',
      review_datum: '2099-12-31',
      owner: 'mixed',
      zone: 'income',
      letrehozva: '2000-01-01',
      reframe_szamlalo: 0,
      decision_ids: [],
      frozen_fields: ['cim', 'miert', 'dod'],
    },
    {
      id: 'DEMO-GOAL-DRAFT',
      szint: 'project',
      cim: 'Demo-cél vázlat',
      miert: 'A goal-varázsló kötelező kapuinak kipróbálása.',
      life_area: 'purpose',
      projektek: [],
      dod: '',
      siker_metrikak: [],
      kockazat_anti_cel: 'A vázlat nem válhat aktívvá DoD és definiált metrika nélkül.',
      statusz: 'draft',
      review_datum: '2099-12-31',
      owner: 'human',
      zone: 'build',
      letrehozva: '2000-01-01',
      reframe_szamlalo: 0,
      decision_ids: [],
      frozen_fields: [],
    },
    {
      id: 'DEMO-GOAL-REFRAME-STOP',
      szint: 'quarterly',
      cim: 'Aktív demo reframe-fixture',
      miert: 'A harmadik újrakeretezés kötelező megállási pontjának kipróbálása.',
      life_area: 'work',
      projektek: [],
      dod: 'A harmadik reframe-kísérlet közvetlen átírás helyett három explicit lezárási utat mutat.',
      siker_metrikak: ['DEMO-MET-SPRINT'],
      kockazat_anti_cel: 'A fixture nem írhatja át csendben az aktív cél fagyott mezőit.',
      statusz: 'active',
      review_datum: '2099-12-31',
      owner: 'human',
      zone: 'build',
      letrehozva: '2000-01-01',
      reframe_szamlalo: 2,
      decision_ids: [],
      frozen_fields: ['cim', 'miert', 'dod'],
    },
  ],
  metrics: [
    {
      id: 'DEMO-MET-SPRINT',
      nev: 'App_Dev demo-sprint haladás',
      kategoria: 'progress',
      definicio: 'A meglévő demo-sprint lezárt elemeinek aránya.',
      szamitas: 'SIGNALS.sprintDone / SIGNALS.sprintTotal',
      forras: 'DEMO-PROJ-APPDEV',
      source_project_id: 'appdev',
      utem: 'heti',
      kuszobok: {
        ok: 'legalább 7/10',
        warn: '1/10–6/10',
        crit: '0/10',
      },
      dontesi_szabaly: 'warn vagy crit → a következő blokk kizárólag a meglévő blokkoló feloldását szolgálja.',
      erzekenyseg: 'GREEN',
      freshness: 'CURRENT',
      life_area: 'work',
      ertek: { done: SIGNALS.sprintDone, total: SIGNALS.sprintTotal },
      statusz: 'ok',
      action_required: false,
    },
    {
      id: 'DEMO-MET-WEEK-LOAD',
      nev: 'Heti demo-terhelés',
      kategoria: 'capacity',
      definicio: 'A meglévő demo-terhelés aránya a heti kapacitáshoz képest.',
      szamitas: 'SIGNALS.weekLoadPct',
      forras: 'SIGNALS',
      utem: 'heti',
      kuszobok: {
        ok: 'legfeljebb 85%',
        warn: '85% felett',
        crit: '100% felett',
      },
      dontesi_szabaly: 'warn vagy crit → pihenésvédelem és a következő terhelésplafon csökkentése.',
      erzekenyseg: 'GREEN',
      freshness: 'CURRENT',
      life_area: 'time',
      ertek: SIGNALS.weekLoadPct,
      mertekegyseg: '%',
      statusz: areaStatus('time', SIGNALS),
      action_required: true,
      action_rule_id: 'REST_GUARD',
    },
    {
      id: 'DEMO-MET-FEED-STATUS',
      nev: 'Demo feed-állapot',
      kategoria: 'system_health',
      definicio: 'A meglévő demo-feed jelzett működési állapota.',
      szamitas: 'FEEDS[id=email].dot',
      forras: 'email',
      utem: 'esemény-vezérelt',
      kuszobok: {
        ok: 'dot = ok',
        warn: 'dot = warn',
        crit: 'dot = crit',
      },
      dontesi_szabaly: 'warn vagy crit → a feed javítása vagy tudatos lekapcsolása.',
      erzekenyseg: 'GREEN',
      freshness: 'CURRENT',
      life_area: null,
      ertek: FEEDS.find((feed) => feed.id === 'email').dot,
      statusz: FEEDS.find((feed) => feed.id === 'email').dot,
      action_required: false,
    },
    {
      id: 'DEMO-MET-REST-GUARD',
      nev: 'Demo regenerációs kapu',
      kategoria: 'capacity',
      definicio: 'A meglévő demo pihenőblokkok alapján jelzi, szükséges-e regenerációs védelem.',
      szamitas: 'SIGNALS.restBlocks',
      forras: 'SIGNALS',
      utem: 'heti',
      kuszobok: {
        ok: 'legalább 2 demo-pihenőblokk',
        warn: '1 demo-pihenőblokk',
        crit: '0 demo-pihenőblokk',
      },
      dontesi_szabaly: 'crit → a következő demo-keretbe védett pihenőblokk kerül.',
      erzekenyseg: 'GREEN',
      freshness: 'CURRENT',
      life_area: 'rest',
      ertek: SIGNALS.restBlocks,
      statusz: areaStatus('rest', SIGNALS),
      action_required: true,
      action_rule_id: 'REST_GUARD',
    },
    {
      id: 'DEMO-MET-INCOMPLETE',
      nev: 'Hiányos demo-metrika',
      kategoria: 'progress',
      definicio: 'A metrika-kapu blokkolásának szintetikus bemenete.',
      szamitas: '',
      forras: 'DEMO-PROJ-INBOX',
      source_project_id: 'loviverse',
      utem: 'heti',
      kuszobok: null,
      dontesi_szabaly: '',
      erzekenyseg: 'GREEN',
      freshness: 'CURRENT',
      life_area: 'purpose',
      statusz: null,
      befogadva: false,
    },
  ],
  projects: [
    {
      id: 'DEMO-PROJ-APPDEV',
      nev: 'App_Dev',
      goal_id: 'DEMO-GOAL-APPDEV',
      life_area: 'work',
      zone: 'income',
      statusz: 'active',
      dod: 'A kapcsolt demo-cél DoD-ja.',
      blokkolok: [],
      workstation_forras: null,
      kod_lelohelyek: [],
      source_project_id: 'appdev',
    },
    {
      id: 'DEMO-PROJ-INBOX',
      nev: 'Loviverse demo-ötlet',
      goal_id: null,
      life_area: 'purpose',
      zone: 'creative',
      statusz: 'inbox',
      dod: null,
      blokkolok: [],
      workstation_forras: null,
      kod_lelohelyek: [],
      source_project_id: 'loviverse',
      inbox_nap_limit: 7,
    },
  ],
  handoffs: [
    {
      id: 'DEMO-HANDOFF-READY',
      project_id: 'DEMO-PROJ-APPDEV',
      goal_id: 'DEMO-GOAL-APPDEV',
      cel_agent: 'codex',
      scope: 'A Phase 2 demo-folyamat readiness-kapujának ellenőrzése.',
      erzekenyseg: 'GREEN',
      elvart_output: 'Szintetikus completion report.',
      validacios_kriterium: 'A hét readiness-mező mind kitöltött állapotot mutat.',
      engedelyezett_fajlok: ['lifecore-v02.html'],
      tiltott_fajlok: ['LifeCore MVP.dc.html'],
      do_not_do: ['Nincs fájlírás, cloud-hívás vagy külső rendszer-módosítás.'],
      statusz: 'draft',
      brief_fajl: null,
      human_approved: false,
    },
    {
      id: 'DEMO-HANDOFF-BLOCKED',
      project_id: 'DEMO-PROJ-APPDEV',
      goal_id: 'DEMO-GOAL-APPDEV',
      cel_agent: 'codex',
      scope: 'A hiányzó érzékenységi besorolás kapujának ellenőrzése.',
      erzekenyseg: null,
      elvart_output: 'Blokkolt demo-állapot.',
      validacios_kriterium: 'A handoff nem léphet aktív agent-állapotba.',
      engedelyezett_fajlok: ['lifecore-v02.html'],
      tiltott_fajlok: ['LifeCore MVP.dc.html'],
      do_not_do: ['A hiányzó besorolást a rendszer nem találhatja ki.'],
      statusz: 'draft',
      brief_fajl: null,
      human_approved: false,
    },
    {
      id: 'DEMO-HANDOFF-REVIEW',
      project_id: 'DEMO-PROJ-APPDEV',
      goal_id: 'DEMO-GOAL-APPDEV',
      cel_agent: 'codex',
      scope: 'A completion report review-kapujának ellenőrzése.',
      erzekenyseg: 'GREEN',
      elvart_output: 'Szintetikus completion report.',
      validacios_kriterium: 'Elfogadás csak kitöltött report és emberi jóváhagyás után történhet.',
      engedelyezett_fajlok: ['lifecore-v02.html'],
      tiltott_fajlok: ['LifeCore MVP.dc.html'],
      do_not_do: ['A demo nem merge-el és nem küld kifelé adatot.'],
      statusz: 'visszajott',
      brief_fajl: 'inline-demo',
      human_approved: true,
    },
    {
      id: 'DEMO-HANDOFF-ARCHIVED',
      project_id: 'DEMO-PROJ-APPDEV',
      goal_id: 'DEMO-GOAL-APPDEV',
      cel_agent: 'codex',
      scope: 'Az archív read-only és Decision-alapú reaktiválási kapu ellenőrzése.',
      erzekenyseg: 'GREEN',
      elvart_output: 'Változatlan archív demo-referencia.',
      validacios_kriterium: 'Közvetlen szerkesztés nem módosítja az archív fixture-t.',
      engedelyezett_fajlok: [],
      tiltott_fajlok: ['LifeCore MVP.dc.html'],
      do_not_do: ['Az archív példány közvetlen módosítása tilos.'],
      statusz: 'visszajott',
      brief_fajl: 'inline-demo',
      human_approved: true,
      read_only: true,
      reaktivacio_decision_id: null,
    },
  ],
  agentJobs: [
    {
      id: 'DEMO-JOB-READY',
      handoff_id: 'DEMO-HANDOFF-READY',
      agent: 'codex',
      kanban_oszlop: 'ready_for_brief',
      kezdet: null,
      veg: null,
      eredmeny_pointer: null,
      completion_report: null,
      elfogadva: { value: false, datum: null },
    },
    {
      id: 'DEMO-JOB-BLOCKED',
      handoff_id: 'DEMO-HANDOFF-BLOCKED',
      agent: 'codex',
      kanban_oszlop: 'needs_clarification',
      kezdet: null,
      veg: null,
      eredmeny_pointer: null,
      completion_report: null,
      elfogadva: { value: false, datum: null },
    },
    {
      id: 'DEMO-JOB-REVIEW',
      handoff_id: 'DEMO-HANDOFF-REVIEW',
      agent: 'codex',
      kanban_oszlop: 'review_needed',
      kezdet: null,
      veg: null,
      eredmeny_pointer: 'inline-demo',
      completion_report: {
        mit_csináltam: 'A szintetikus demo-folyamat ellenőrzése elkészült.',
        erintett_fajlok: ['lifecore-v02.html'],
        elteresek: 'nincs',
        nyitott_kerdesek: 'nincs',
        validalas: 'A deklarált demo-kritérium teljesült.',
        erzekenyseg: 'GREEN',
      },
      elfogadva: { value: false, datum: null },
    },
    {
      id: 'DEMO-JOB-ARCHIVED',
      handoff_id: 'DEMO-HANDOFF-ARCHIVED',
      agent: 'codex',
      kanban_oszlop: 'archived',
      kezdet: null,
      veg: null,
      eredmeny_pointer: 'inline-demo',
      completion_report: {
        mit_csináltam: 'Az archív demo-fixture lezárult.',
        erintett_fajlok: [],
        elteresek: 'nincs',
        nyitott_kerdesek: 'nincs',
        validalas: 'A read-only állapot ellenőrizhető.',
        erzekenyseg: 'GREEN',
      },
      elfogadva: { value: true, datum: null },
      read_only: true,
    },
  ],
  reviews: [
    {
      id: 'DEMO-REVIEW-WEEKLY',
      tipus: 'heti',
      idoszak: 'demo-hét',
      gyozelmek: ['Az App_Dev demo-sprint definiált metrikából olvasható.'],
      hianyok: ['A heti demo-terhelés döntési szabálya akciót jelez.'],
      kovetkezo_keret: ['A következő demo-terv a kapacitás-jelzéshez igazodik.'],
      cel_triage: { 'DEMO-GOAL-APPDEV': null, 'DEMO-GOAL-REFRAME-STOP': null },
      csendes_atfogalmazas_ellenorzes: false,
      lezarva: null,
    },
  ],
  decisions: [],
});

// Mock asszisztens-válaszok (kulcsszó-alapú; lokális/felhő modell-adapter cserélhető be ide)
export function mockAssistant(q) {
  const t = q.toLowerCase();
  if (t.startsWith('jegyzet:') || t.startsWith('jegyzet ')) return { capture: { type: 'JEGYZET', text: q.replace(/^jegyzet:?\s*/i, '') } };
  if (t.startsWith('hangulat')) return { capture: { type: 'MÉRÉS', text: 'Hangulat: ' + q.replace(/^hangulat:?\s*/i, '') } };
  if (t.startsWith('feladat:') || t.startsWith('feladat ')) return { capture: { type: 'FELADAT', text: q.replace(/^feladat:?\s*/i, '') } };
  if (t.startsWith('reflexió') || t.startsWith('reflexio')) return { capture: { type: 'REFLEXIÓ', text: q.replace(/^reflexi[óo]:?\s*/i, '') } };
  if (t.includes('pénz') || t.includes('penz') || t.includes('büdzsé') || t.includes('számla'))
    return { reply: 'A demo adatok szerint a havi büdzsé 71%-nál jár. Két tétel esedékes: számla kiállítása (júl. 5.) és negyedéves büdzsé-felülvizsgálat (júl. 12.). Ma 13:00-ra előkészítő blokk van betéve. Ez szervezési összefoglaló, nem pénzügyi tanácsadás.' };
  if (t.includes('alvás') || t.includes('alvas') || t.includes('fáradt'))
    return { reply: '3 napja 6 óra alatti az alvásod (átlag 5,7 óra), ezért a mai kapacitás 62%-ra van korlátozva. Javaslat: 21:30-tól levezetés, 23:00 lefekvési horgony. Ez rutin-támogatás, nem orvosi tanács.' };
  if (t.includes('terv') && (t.includes('holnap') || t.includes('hétvég')))
    return { reply: 'Holnapra (szombat) védett pihenő-délelőttöt javaslok — a hét 92%-os terhelésű volt, pihenőblokk nélkül. Délután 1 könnyű tanulóblokk beleférhet, ha az energiaszint engedi. Jóváhagyod a pihenőblokkot a Javaslatok panelen?' };
  if (t.includes('terv'))
    return { reply: 'A mai terv: 2 fókuszblokk (App_Dev blokkoló 09:00, számlázás 13:00), védett séta+ebéd 11:00, admin sáv 15:00 (max. 45 p), hívás Anyával 18:30, levezetés 21:30-tól. Kapacitás: 62% az alvásadósság miatt.' };
  if (t.includes('hét') || t.includes('het'))
    return { reply: 'A hét mérlege: sprint jó ütemben (7/10), de az összindex 4 napja csökken — fő ok az alvás és a 0 pihenőblokk. A heti áttekintés vasárnap esedékes; a Heti áttekintés fülön előnézetet találsz.' };
  return { reply: 'Ezt rögzítettem magamnak. Konkrét parancsok: „jegyzet: …", „feladat: …", „hangulat 4/5", „reflexió: …" — vagy kérdezz a tervről, a hétről, a pénzügyekről, az alvásról. (Mock asszisztens — lokális/felhő modell-adapter csatlakoztatható.)' };
}
