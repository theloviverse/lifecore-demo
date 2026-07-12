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
