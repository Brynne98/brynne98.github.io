// Health Switch RSA, version E. Hospital names are real; every number here is made up.
document.documentElement.classList.add('js');
const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (id) => document.getElementById(id);
const esc = (s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

/* ---------- toast ---------- */
let toastTimer;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* ---------- hero: a printed listing that filters as you type ---------- */
const ENTRIES = [
  ['Blood Bank', 'Kalafong', 'Ext 4417'],
  ['Burns Unit', 'Dora Nginza', '041 406 4389'],
  ['C14 Neurosurgery ICU', 'Groote Schuur', '021 404 6312'],
  ['Cardiac ICU', 'Inkosi Albert Luthuli', '031 240 1583'],
  ['Casualty', 'Addington', '031 327 6851'],
  ['Labour Ward', 'Mowbray Maternity', '021 659 5832'],
  ['Maternity', 'Pelonomi', '051 405 9714'],
  ['Neonatal ICU', 'Universitas', '051 405 2296'],
  ['Paediatric ICU', 'Chris Hani Baragwanath', '011 933 7482'],
  ['Pharmacy', 'Edendale', 'Ext 4417'],
  ['Psychiatry', 'Stikland', '021 940 4422'],
  ['Radiology Bookings', 'Helen Joseph', '011 489 0637'],
  ['Radiology, CT', 'Livingstone', '041 405 2918'],
  ['Radiology, MRI', 'Groote Schuur', 'Ext 4417'],
  ['Radiology Reception', 'Frere', '043 709 2654'],
  ['Surgical ICU', 'Tygerberg', '021 938 5160'],
  ['Switchboard', 'Rob Ferreira', '013 741 6005'],
  ['Theatre Bookings', "Red Cross Children's", '021 658 5497'],
  ['Trauma Unit', 'Tembisa', 'Ext 3120'],
  ['Ward 7 Medical', 'Worcester Provincial', '023 348 1276'],
];

const q = $('q');
const list = $('entries');
const count = $('count');
const ftabs = [...document.querySelectorAll('.ftab')];

const mark = (text, term) => {
  const i = term ? text.toLowerCase().indexOf(term.toLowerCase()) : -1;
  if (i < 0) return esc(text);
  return esc(text.slice(0, i)) + '<mark>' + esc(text.slice(i, i + term.length)) + '</mark>' + esc(text.slice(i + term.length));
};

list.innerHTML = ENTRIES.map(([w, h, n]) => `
  <li class="e">
    <span class="e-what"><b>${esc(w)}</b><span>, ${esc(h)}</span></span>
    <span class="e-lead" aria-hidden="true"></span>
    <span class="e-num">${esc(n)}</span>
    <button class="e-call" type="button" tabindex="-1" aria-label="Call ${esc(w)}, ${esc(h)}"><svg aria-hidden="true"><use href="img/icons.svg#phone"/></svg></button>
  </li>`).join('');
const rows = [...list.children];

function filter() {
  const term = q.value.trim();
  const t = term.toLowerCase();
  const digits = t.replace(/\s/g, '');
  let hits = 0;
  ENTRIES.forEach(([w, h, n], i) => {
    const row = rows[i];
    const hit = !!t && (w.toLowerCase().includes(t) || h.toLowerCase().includes(t) || (/^\d+$/.test(digits) && n.replace(/\s/g, '').includes(digits)));
    hits += hit;
    row.classList.toggle('hit', hit);
    row.classList.toggle('dim', !!t && !hit);
    row.querySelector('.e-call').tabIndex = hit ? 0 : -1;
    row.querySelector('.e-what b').innerHTML = mark(w, term);
    row.querySelector('.e-what span').innerHTML = ', ' + mark(h, term);
    row.querySelector('.e-num').innerHTML = /^\d+$/.test(digits) ? mark(n, term) : esc(n);
  });
  list.classList.toggle('q', !!t);
  count.textContent = t ? (hits === 1 ? '1 found' : `${hits} found`) : '';
}

function pickTab(tab) {
  ftabs.forEach((b) => b.setAttribute('aria-selected', String(b === tab)));
}

list.addEventListener('click', (e) => {
  if (e.target.closest('.e-call')) toast('In the app, this rings the ward. These numbers are made up.');
});

/* The search types by itself until the visitor touches it. */
let auto = !calm;
let heroVisible = true;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const waitVisible = async () => { while (!heroVisible) await sleep(300); };

function takeOver() { auto = false; }
q.addEventListener('focus', takeOver);
q.addEventListener('input', () => { takeOver(); filter(); });
ftabs.forEach((tab) => tab.addEventListener('click', () => {
  takeOver();
  pickTab(tab);
  q.value = tab.dataset.q;
  filter();
}));

async function typeLoop() {
  let i = 0;
  while (auto) {
    const tab = ftabs[i % ftabs.length];
    await waitVisible();
    if (!auto) return;
    pickTab(tab);
    for (const ch of tab.dataset.q) {
      if (!auto) return;
      q.value += ch;
      filter();
      await sleep(110);
    }
    await sleep(2400);
    while (auto && q.value) {
      q.value = q.value.slice(0, -1);
      filter();
      await sleep(40);
    }
    await sleep(350);
    i++;
  }
}

if (calm) { q.value = ftabs[0].dataset.q; filter(); }
else { filter(); setTimeout(typeLoop, 900); }

new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe($('find'));

/* ---------- A to Z: one page per letter, turned like a phone book ---------- */
const HOSPITALS = [
  'Addington Hospital', 'Beaufort West Hospital', 'Caledon Provincial Hospital', 'Cecilia Makiwane Hospital',
  'Chris Hani Baragwanath Academic Hospital', 'Dora Nginza Hospital', 'Dr Harry Surtie Hospital',
  'Dr Pixley Ka Isaka Seme Hospital', 'Du Noon CHC', 'Edendale Hospital', 'Edenvale Hospital',
  'Eerste River Hospital', 'eMalahleni Private Hospital', 'Evander Hospital', 'False Bay Hospital',
  'Femina Hospital', 'Frere Hospital', 'George Regional Hospital', 'Groote Schuur Hospital',
  'Heideveld Emergency Centre', 'Helen Joseph Hospital', 'Inanda C Community Health Centre',
  'Inkosi Albert Luthuli Central Hospital', 'Isilimela Hospital', 'Kalafong Hospital', 'Karl Bremer Hospital',
  'Khayelitsha District Hospital', 'King Dinuzulu Hospital', 'King Edward VIII Hospital', 'Klerksdorp Hospital',
  'Lentegeur Hospital', 'Life La Femme Hospital', 'Life Peglerae Hospital', 'Livingstone Hospital',
  'Madwaleni Hospital', 'Mahatma Gandhi Memorial Hospital', 'Mahikeng Provincial Hospital', 'Mankweng Hospital',
  'Mapulaneng Hospital', 'Medicare Rustenburg', 'Mitchells Plain District Hospital', 'Montana Hospital',
  'Mowbray Maternity Hospital', 'Nelson Mandela Academic Hospital', 'Netcare Rustenburg', 'New Somerset Hospital',
  'Niemeyer Memorial Hospital', 'Northdale Hospital', 'Oudtshoorn Hospital', 'Paarl Provincial Hospital',
  'Pelonomi Academic Hospital', 'Pelonomi Regional Hospital', 'Pholosong Hospital', 'Pietersburg (Polokwane) Hospital',
  'Port Elizabeth Provincial Hospital', 'Port Shepstone Regional Hospital', 'Pretoria East Hospital',
  'Prince Mshiyeni Memorial Hospital', "Red Cross War Memorial Children's Hospital", 'RK Khan Hospital',
  'Rob Ferreira Hospital', 'Robert Mangaliso Sobukwe Hospital', 'Sabie Hospital', 'Sebokeng Hospital',
  'Shongwe Hospital', 'Stikland Hospital', 'Taung District Hospital', 'Tembisa Provincial Hospital',
  'Thelle Mogoerane Regional Hospital', 'Themba Hospital', 'Tshepong Hospital', 'Tygerberg Hospital',
  'Uitenhage Provincial Hospital', 'Umphumulo Hospital', 'Universitas Academic Hospital', 'Victoria Hospital',
  'Wentworth Hospital', 'Wilgers Hospital', 'Witbank Hospital', 'Worcester Provincial Hospital',
];
const byLetter = {};
HOSPITALS.forEach((h) => { const L = h[0].toUpperCase(); (byLetter[L] ||= []).push(h); });
const letters = Object.keys(byLetter).sort();
const cuts = $('cuts');
const page = $('az-page');
const big = $('az-letter');
const names = $('az-names');
const hq = $('hq');

cuts.innerHTML = letters.map((L) => `<button class="cut" type="button" role="tab" aria-selected="false" aria-controls="az-page" data-l="${L}">${L}</button>`).join('');
const cutBtns = [...cuts.children];

function turn() {
  if (calm) return;
  page.classList.remove('turn');
  void page.offsetWidth;
  page.classList.add('turn');
}

function showLetter(L, animate = true) {
  // A page holds the chosen letter and runs on, like a printed page, until it is full.
  cutBtns.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.l === L)));
  const run = [];
  for (const K of letters.slice(letters.indexOf(L))) {
    if (run.length && run.flat().length >= (matchMedia('(max-width: 860px)').matches ? 7 : 12)) break;
    run.push([K, byLetter[K]]);
  }
  const last = run[run.length - 1][0];
  big.textContent = last === L ? L : `${L}-${last}`;
  big.style.fontStretch = '';
  names.innerHTML = run.map(([K, hs]) => `<li class="lh">${K}</li>` + hs.map((h) => `<li>${esc(h)}</li>`).join('')).join('');
  if (animate) turn();
}

cuts.addEventListener('click', (e) => {
  const b = e.target.closest('.cut');
  if (!b) return;
  hq.value = '';
  showLetter(b.dataset.l);
});
cuts.addEventListener('keydown', (e) => {
  if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
  const i = cutBtns.findIndex((b) => b.getAttribute('aria-selected') === 'true');
  const next = cutBtns[(i + (e.key === 'ArrowRight' ? 1 : -1) + cutBtns.length) % cutBtns.length];
  next.focus();
  next.click();
});

hq.addEventListener('input', () => {
  const t = hq.value.trim().toLowerCase();
  if (!t) { showLetter(letters[0], false); return; }
  const found = HOSPITALS.filter((h) => h.toLowerCase().includes(t));
  cutBtns.forEach((b) => b.setAttribute('aria-selected', 'false'));
  big.textContent = found.length;
  big.style.fontStretch = '140%';
  names.innerHTML = found.length
    ? found.map((h) => `<li>${mark(h, hq.value.trim())}</li>`).join('')
    : '<li class="none">Not in the book yet. Ask for it through <a href="https://brynne98.github.io/health-switch/">Support</a>.</li>';
});

showLetter('A', false);

/* ---------- fixes: correction slips pasted over the number ---------- */
const history = [
  { num: '021 938 4071', when: 'Added 12 Aug 2026' },
  { num: '021 938 4702', when: 'Changed 3 Sep 2026' },
  { num: '021 938 5160', when: 'Changed today' },
];
const slips = $('slips');
const histEl = $('history');
const TILTS = [[-1.5, 0, 0], [2, 3, -2], [-2.5, -3, 2], [1, 2, 1]];

function renderFix(fresh = false) {
  const shown = history.slice(-4);
  slips.innerHTML = shown.map((h, i) => {
    const [r, x, y] = TILTS[(history.length - shown.length + i) % TILTS.length];
    const top = i === shown.length - 1;
    return `<span class="slip${top && fresh ? ' new' : ''}" style="--tilt:${r}deg;--dx:${x}px;--dy:${y}px"${top ? '' : ' aria-hidden="true"'}><b>${esc(h.num)}</b><span>${esc(h.when)}</span></span>`;
  }).join('');
  const cur = history.length - 1;
  histEl.innerHTML = history.map((h, i) => ({ h, i })).reverse().map(({ h, i }) => `
    <li class="h-row${fresh && i === cur ? ' fresh' : ''}">
      <b>${esc(h.num)}</b>
      <span>${esc(h.when)}</span>
      ${i === cur ? '<span class="now">Showing</span>'
        : h.num === history[cur].num ? ''
        : `<button class="put" type="button" data-i="${i}"><svg aria-hidden="true"><use href="img/icons.svg#arrow-counter-clockwise"/></svg>Put back</button>`}
    </li>`).join('');
}

histEl.addEventListener('click', (e) => {
  const b = e.target.closest('.put');
  if (!b) return;
  history.push({ num: history[+b.dataset.i].num, when: 'Put back just now' });
  renderFix(true);
  toast('Put back. The old number is still in the history.');
});

$('fix-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const input = $('fix-in');
  const raw = input.value.trim().replace(/\s+/g, ' ');
  const ok = raw.replace(/\D/g, '').length >= 4 && /^[\d\s()+-]+$/.test(raw);
  $('fix-err').hidden = ok;
  input.setAttribute('aria-invalid', String(!ok));
  if (!ok) return;
  history.push({ num: raw, when: 'Changed just now' });
  input.value = '';
  renderFix(true);
});

renderFix();

/* ---------- thumb index follows the open section ---------- */
const thumbs = [...document.querySelectorAll('.thumb')];
thumbs.forEach((t, i) => t.style.setProperty('--i', i));
const thumbFor = new Map(thumbs.map((t) => [t.getAttribute('href').slice(1), t]));
const spy = new IntersectionObserver((ents) => {
  ents.forEach((e) => {
    if (!e.isIntersecting) return;
    thumbs.forEach((t) => t.removeAttribute('aria-current'));
    thumbFor.get(e.target.id)?.setAttribute('aria-current', 'true');
  });
}, { rootMargin: '-45% 0px -50% 0px' });
['find', 'hospitals', 'offline', 'fixes', 'pro', 'get'].forEach((id) => spy.observe($(id)));

/* ---------- reveals ---------- */
const reveal = new IntersectionObserver((ents) => {
  ents.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add(e.target.id === 'offline' ? 'on' : 'seen');
    reveal.unobserve(e.target);
  });
}, { threshold: 0.18 });
document.querySelectorAll('.in').forEach((el) => {
  const sibs = [...el.parentElement.querySelectorAll(':scope > .in')];
  el.style.setProperty('--d', `${sibs.indexOf(el) * 0.09}s`);
  reveal.observe(el);
});
reveal.observe($('offline'));
