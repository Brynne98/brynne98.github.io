// Health Switch RSA site. Hospital names are real; every number here is made up.
document.documentElement.classList.add('js');
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- demo directory ---------- */
const NUMBERS = [
  ['C16 Neurosurgery ICU', 'Groote Schuur Hospital', '021 404 7318'],
  ['Surgical ICU', 'Tygerberg Hospital', '021 938 5726'],
  ['Paediatric ICU', 'Chris Hani Baragwanath Academic Hospital', '011 933 8264'],
  ['Cardiac ICU', 'Inkosi Albert Luthuli Central Hospital', '031 240 1937'],
  ['Radiology Bookings', 'Universitas Academic Hospital', '051 405 3618'],
  ['Radiology, CT', 'Helen Joseph Hospital', '011 489 1772'],
  ['Radiology Reception', 'Livingstone Hospital', '041 405 2849'],
  ['Casualty', 'Edendale Hospital', '033 395 4483'],
  ['Casualty Doctors', 'Frere Hospital', '043 709 2714'],
  ['Theatre Bookings', "Red Cross War Memorial Children's Hospital", '021 658 5963'],
  ['Labour Ward', 'Kalafong Hospital', '012 318 6147'],
  ['Pharmacy Dispensary', 'Tygerberg Hospital', 'Ext 3906'],
  ['Blood Bank', 'King Edward VIII Hospital', 'Ext 3906'],
  ['Ward 3 Postnatal', 'Mowbray Maternity Hospital', 'Ext 3906'],
];

const q = document.getElementById('q');
const results = document.getElementById('results');
const empty = document.getElementById('empty');
const tabs = [...document.querySelectorAll('.tab')];

const esc = (s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const mark = (text, term) => {
  if (!term) return esc(text);
  const i = text.toLowerCase().indexOf(term.toLowerCase());
  if (i < 0) return esc(text);
  return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + term.length)) + '</mark>' + esc(text.slice(i + term.length));
};

function render() {
  const term = q.value.trim();
  const t = term.toLowerCase();
  const hits = term
    ? NUMBERS.filter(([w, h, n]) => w.toLowerCase().includes(t) || h.toLowerCase().includes(t) || n.replace(/\s/g, '').includes(t.replace(/\s/g, '')))
    : NUMBERS.slice(0, 4);
  results.innerHTML = hits.slice(0, 5).map(([w, h, n], i) => `
    <li class="row" style="--i:${i}">
      <div class="row-what"><b>${mark(w, term)}</b><span>${mark(h, term)}</span></div>
      <span class="num">${mark(n, term)}</span>
      <button class="call" type="button" aria-label="Call ${esc(w)}, ${esc(h)}"><svg aria-hidden="true"><use href="img/icons.svg#phone"/></svg></button>
    </li>`).join('');
  empty.hidden = hits.length > 0;
}

// The call button only shows what the app would do; these numbers are not real.
results.addEventListener('click', (e) => {
  const btn = e.target.closest('.call');
  if (!btn) return;
  stopAuto();
  const row = btn.closest('.row');
  btn.classList.remove('ringing'); void btn.offsetWidth; btn.classList.add('ringing');
  if (!row.querySelector('.call-note')) {
    row.insertAdjacentHTML('beforeend', '<p class="call-note" role="status">In the app, this rings straight through. This number is made up.</p>');
  }
});

function selectTab(tab) {
  tabs.forEach((t) => t.setAttribute('aria-selected', String(t === tab)));
}

/* Auto-typing: shows the three ways to search, then gets out of the way once the visitor takes over. */
let auto = !calm, timer = null;
function stopAuto() { auto = false; clearTimeout(timer); }
function typeQuery(text, done) {
  let i = 0;
  const step = () => {
    if (!auto) return;
    q.value = text.slice(0, ++i); render();
    if (i < text.length) timer = setTimeout(step, 110); else timer = setTimeout(done, 2600);
  };
  q.value = ''; render(); timer = setTimeout(step, 400);
}
function cycle(n) {
  if (!auto) return;
  const tab = tabs[n % tabs.length];
  selectTab(tab);
  typeQuery(tab.dataset.q, () => cycle(n + 1));
}

tabs.forEach((tab) => tab.addEventListener('click', () => {
  stopAuto(); selectTab(tab); q.value = tab.dataset.q; render();
}));
q.addEventListener('focus', stopAuto);
q.addEventListener('input', () => { stopAuto(); render(); });

if (auto) cycle(0); else { q.value = tabs[0].dataset.q; render(); }

/* ---------- hospital index ---------- */
const HOSPITALS = [
  'Addington Hospital', 'Beaufort West Hospital', 'Caledon Provincial Hospital', 'Cecilia Makiwane Hospital',
  'Chris Hani Baragwanath Academic Hospital', 'Dora Nginza Hospital', 'Dr Pixley Ka Isaka Seme Hospital', 'Du Noon CHC',
  'Edendale Hospital', 'Edenvale Hospital', 'Eerste River Hospital', 'eMalahleni Private Hospital', 'Evander Hospital',
  'False Bay Hospital', 'Frere Hospital', 'George Regional Hospital', 'Groote Schuur Hospital', 'Heideveld Emergency Centre',
  'Helen Joseph Hospital', 'Inanda C Community Health Centre', 'Inkosi Albert Luthuli Central Hospital', 'Isilimela Hospital',
  'Kalafong Hospital', 'Karl Bremer Hospital', 'Khayelitsha District Hospital', 'King Dinuzulu Hospital',
  'King Edward VIII Hospital', 'Klerksdorp Hospital', 'Lentegeur Hospital', 'LHG La Femme', 'LHG Peglarae',
  'Livingstone Hospital', 'Madwaleni Hospital', 'Mahatma Gandhi Hospital', 'Mahikeng Provincial Hospital',
  'Mankweng Hospital', 'Mapulaneng Hospital', 'Medicare Rustenburg', 'Mitchells Plain District Hospital',
  'Montana Hospital', 'Mowbray Maternity Hospital', 'Nelson Mandela Academic Hospital', 'Netcare Rustenburg',
  'New Somerset Hospital', 'Niemeyer Memorial Hospital', 'Northdale Hospital', 'Oudtshoorn Hospital',
  'Paarl Provincial Hospital', 'Pelonomi Academic Hospital', 'Pelonomi Regional Hospital', 'Pholosong Hospital',
  'Pietersburg (Polokwane) Hospital', 'Port Elizabeth Provincial Hospital', 'Port Shepstone Regional Hospital',
  'Pretoria East Hospital', 'Prince Mshiyeni Memorial Hospital', "Red Cross War Memorial Children's Hospital",
  'RK Khan Hospital', 'Rob Ferreira Hospital', 'Robert Mangaliso Sobukwe Hospital', 'Sabie Hospital', 'Sebokeng Hospital',
  'Shongwe Hospital', 'Stikland Hospital', 'Taung District Hospital', 'Tembisa Provincial Hospital',
  'Thelle Mogoerane Regional Hospital', 'Themba Hospital', 'Tshepong Hospital', 'Tygerberg Hospital',
  'Uitenhage Provincial Hospital', 'Umphumulo Hospital', 'Universitas Academic Hospital', 'Victoria Hospital',
  'Wentworth Hospital', 'Wilgers Hospital', 'Witbank Hospital', 'Worcester Provincial Hospital',
];

const names = document.getElementById('names');
const letters = document.getElementById('letters');
const groups = {};
HOSPITALS.forEach((h) => (groups[h[0].toUpperCase()] ||= []).push(h));
const keys = Object.keys(groups).sort();

names.innerHTML = keys.map((k) =>
  `<li class="head" data-l="${k}" aria-hidden="true">${k}</li>` + groups[k].map((h) => `<li data-l="${k}">${esc(h)}</li>`).join('')
).join('');
letters.innerHTML = ['All', ...keys].map((k, i) =>
  `<button class="letter" role="tab" type="button" data-l="${k}" aria-selected="${i === 0}">${k}</button>`
).join('');

letters.addEventListener('click', (e) => {
  const btn = e.target.closest('.letter');
  if (!btn) return;
  const l = btn.dataset.l;
  letters.querySelectorAll('.letter').forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
  names.classList.toggle('filtered', l !== 'All');
  names.querySelectorAll('li').forEach((li) => li.classList.toggle('on', li.dataset.l === l));
});

/* ---------- history you can undo ---------- */
const fixNow = document.getElementById('fix-now');
const fixWhen = document.getElementById('fix-when');
const fixPast = document.getElementById('fix-past');
let current = { n: '021 938 5726', when: 'Changed today' };
let past = [
  { n: '021 938 5762', when: 'Changed 3 Oct 2026' },
  { n: '021 938 2630', when: 'Added 12 Aug 2026' },
];
function drawPast() {
  fixPast.innerHTML = past.map((p, i) => `
    <li>
      <div><span class="old">${p.n}</span><small>${p.when}</small></div>
      <button class="putback" type="button" data-i="${i}"><svg aria-hidden="true"><use href="img/icons.svg#undo"/></svg>Put back</button>
    </li>`).join('');
}
fixPast.addEventListener('click', (e) => {
  const btn = e.target.closest('.putback');
  if (!btn) return;
  const i = Number(btn.dataset.i);
  const back = past[i];
  past.splice(i, 1);
  past.unshift({ n: current.n, when: current.when });
  current = { n: back.n, when: 'Put back just now' };
  fixNow.textContent = current.n;
  fixWhen.textContent = current.when;
  fixNow.classList.remove('swap'); void fixNow.offsetWidth; fixNow.classList.add('swap');
  drawPast();
});
drawPast();

/* ---------- reveals and the sticky bar edge ---------- */
const seen = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add('in'); seen.unobserve(en.target); }
  });
}, { threshold: 0.18, rootMargin: '0px 0px -8% 0px' });
document.querySelectorAll('.reveal, .offline').forEach((el) => seen.observe(el));

const topBar = document.querySelector('.top');
new IntersectionObserver(([en]) => topBar.classList.toggle('scrolled', !en.isIntersecting))
  .observe(document.querySelector('.hero h1'));
