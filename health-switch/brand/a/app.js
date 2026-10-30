/*
  Health Switch RSA brand site.
  Hospital names are real (data/hospitals.csv, hospitals with numbers).
  Every phone number and extension is made up, from a fixed seed so the page
  shows the same ones on every visit.
*/
(() => {
  'use strict';

  const HOSPITALS = [
    'Addington Hospital Durban', 'Beaufort West Hospital', 'Caledon Provincial Hospital',
    'Cecilia Makiwane Hospital', 'Chris Hani Baragwanath Academic Hospital', 'DHSH',
    'Dora Nginza Hospital', 'Dr Pixely Ka Isaka Seme Hospital', 'Du Noon CHC',
    'Edendale Hospital', 'Edenvale Hospital', 'Eerste River Hospital', 'Evander Hospital',
    'False Bay Hospital', 'Frere Hospital', 'George Regional Hospital', 'Groote Schuur Hospital',
    'Heideveld Emergency Centre', 'Helen Joseph Hospital', 'Inanda C Community Health Centre',
    'Inkosi Albert Luthuli Central Hospital', 'Kalafong Hospital', 'Karl Bremer Hospital',
    'Khayelitsha District Hospital', 'King Dinuzulu Hospital', 'King Edward VIII',
    'Klerksdorp Hospital', 'Lentegeur Hospital', 'Livingstone Hospital', 'Madwaleni Hospital',
    'Mahikeng Provincial Hospital', 'Mankweng Hospital', 'Mapulaneng Hospital',
    'Medicare (Rustenberg)', 'Mitchell Plain District Hospital', 'Mowbray Maternity Hospital',
    'Nelson Mandela Academic Hospital', 'New Somerset Hospital', 'Niemeyer Memorial Hospital',
    'Northdale Hospital', 'Oudtshoorn Hospital', 'Paarl Provincial Hospital',
    'Pelonomi Academic Hospital', 'Pelonomi Regional Hospital', 'Pholosong Hospital',
    'Pietersburg (Polokwane) Hospital', 'Port Elizabeth Provincial Hospital',
    'Port Shepstone Regional Hospital', 'Prince Mshiyeni Memorial Hospital',
    "Red Cross War Memorial Children's Hospital", 'RK Khan Hospital',
    'Robert Mangaliso Sobukwe Hospital', 'Rob Ferreira Hospital', 'Sabie Hospital',
    'Sebokeng Hospital', 'Shongwe Hospital', 'Stikland Hospital', 'Taung District Hospital',
    'Tembisa Provincial Hospital', 'Thelle Mogoerane Regional Hospital', 'Themba Hospital',
    'Tshepong Hospital', 'Tygerberg Hospital', 'Uitenhage Provincial Hospital',
    'Universitas Academic Hospital', 'Victoria Hospital', 'Wentworth Hospital',
    'Witbank Hospital', 'Worcester Provincial Hospital',
  ];

  const UNITS = [
    'Casualty Reception', 'ICU', 'Labour Ward', 'Theatre Reception', 'Pharmacy', 'Radiology',
    'Switchboard', 'Maternity Ward', 'Paediatric Casualty', 'Blood Bank', 'Dialysis Unit',
    'Burns Unit', 'Psychiatry Ward', 'Neonatal ICU', 'Orthopaedic Clinic', 'Antenatal Clinic',
    'CSSD', 'CT Scanner', 'Eye Clinic', 'Resus Bay', 'Physiotherapy', 'Ward 7 Medical',
    'Ward 12 Surgical', 'High Care', 'Admissions', 'Security',
  ];

  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const $ = (id) => document.getElementById(id);
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // Seeded random, so the made-up numbers stay the same between visits.
  let seed = 0x5a17c0de;
  const rand = () => {
    seed |= 0; seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const digits = (n) => Array.from({ length: n }, () => Math.floor(rand() * 10)).join('');

  // Made-up directory: a handful of units per hospital.
  const ENTRIES = [];
  for (const hospital of HOSPITALS) {
    const prefix = `0${1 + Math.floor(rand() * 5)}${Math.floor(rand() * 10)} ${digits(3)}`;
    const pool = UNITS.slice().sort(() => rand() - 0.5).slice(0, 9 + Math.floor(rand() * 6));
    for (const name of pool) {
      const ext = String(1000 + Math.floor(rand() * 9000));
      ENTRIES.push({ name, hospital, ext, full: `${prefix} ${ext}` });
    }
  }
  // A few fixed ones the demos rely on.
  const pin = (name, hospital, ext) => {
    const e = ENTRIES.find((x) => x.hospital === hospital && x.name === name);
    if (e) { e.ext = ext; e.full = e.full.slice(0, -4) + ext; }
    else {
      const same = ENTRIES.find((x) => x.hospital === hospital);
      ENTRIES.push({ name, hospital, ext, full: same.full.slice(0, -4) + ext });
    }
  };
  pin('Casualty Reception', 'Chris Hani Baragwanath Academic Hospital', '4417');
  pin('Labour Ward', 'Groote Schuur Hospital', '2381');
  pin('Neonatal ICU', 'Edendale Hospital', '6052');
  pin('Resus Bay', 'Tygerberg Hospital', '7405');
  pin('ICU', 'Tygerberg Hospital', '3906');

  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const mark = (text, tokens) => {
    let out = esc(text);
    for (const t of tokens) {
      if (!t) continue;
      const re = new RegExp(`(${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig');
      out = out.replace(re, '<mark>$1</mark>');
    }
    return out;
  };

  /* ---------- The working directory in the hero ---------- */
  const q = $('q'), list = $('results'), count = $('count');
  const sheet = $('sheet'), callBtn = $('call'), callLabel = $('callLabel');
  let shown = [];

  function search(raw) {
    const tokens = raw.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!tokens.length) return null;
    const hits = ENTRIES.filter((e) => {
      const hay = `${e.name} ${e.hospital}`.toLowerCase();
      return tokens.every((t) => (/^\d+$/.test(t) ? e.ext.includes(t) : hay.includes(t)));
    });
    const num = tokens.find((t) => /^\d+$/.test(t));
    if (num) hits.sort((a, b) => (b.ext.startsWith(num) - a.ext.startsWith(num)));
    return { tokens, hits };
  }

  function render() {
    const res = search(q.value);
    if (!res) {
      shown = ENTRIES.filter((e) => e.name === 'Casualty Reception').slice(0, 6);
      count.textContent = 'Casualty, across hospitals';
      paint([]);
      return;
    }
    shown = res.hits.slice(0, 6);
    count.textContent = res.hits.length === 1 ? '1 match' : `${res.hits.length} matches`;
    if (!shown.length) {
      onScreen = new Set();
      list.innerHTML = '<li class="dir-empty">No match. Try a ward, a hospital or a 4-digit extension.</li>';
      return;
    }
    paint(res.tokens);
  }

  // Only rows that were not on screen before fade in; the rest stay put.
  let onScreen = new Set();
  function paint(tokens) {
    const was = onScreen;
    onScreen = new Set(shown);
    list.innerHTML = shown.map((e, i) => `
      <li style="--i:${i}${was.has(e) ? ';animation:none' : ''}">
        <button class="row" type="button" data-i="${i}">
          <span class="row-text">
            <span class="row-name">${mark(e.name, tokens)}</span>
            <span class="row-hosp">${mark(e.hospital, tokens)}</span>
          </span>
          <b class="ext">${mark(e.ext, tokens.filter((t) => /^\d+$/.test(t)))}</b>
        </button>
      </li>`).join('');
  }

  function openSheet(e) {
    $('sheetName').textContent = e.name;
    $('sheetHosp').textContent = e.hospital;
    $('sheetNum').textContent = e.full;
    callLabel.textContent = 'Call';
    sheet.classList.add('open');
    sheet.setAttribute('aria-hidden', 'false');
    sheet.querySelectorAll('button').forEach((b) => (b.tabIndex = 0));
  }
  function closeSheet() {
    sheet.classList.remove('open');
    sheet.setAttribute('aria-hidden', 'true');
    sheet.querySelectorAll('button').forEach((b) => (b.tabIndex = -1));
  }
  function pressCall() {
    callLabel.textContent = 'Demo: the number is made up';
  }

  list.addEventListener('click', (ev) => {
    const b = ev.target.closest('.row');
    if (!b) return;
    openSheet(shown[+b.dataset.i]);
    $('sheetBack').focus({ preventScroll: true });
  });
  $('sheetBack').addEventListener('click', () => { closeSheet(); q.focus({ preventScroll: true }); });
  callBtn.addEventListener('click', pressCall);
  q.addEventListener('input', () => { closeSheet(); render(); });

  // Auto-play: types a query, taps a result, taps Call. Stops for good once
  // someone touches the directory, and pauses while it is off screen.
  const dir = $('dir');
  let userTook = false, dirVisible = true;
  const takeOver = () => { userTook = true; };
  ['pointerdown', 'keydown', 'focusin'].forEach((t) => dir.addEventListener(t, takeOver, { once: false }));
  new IntersectionObserver(([e]) => { dirVisible = e.isIntersecting; }, { threshold: 0.2 }).observe(dir);

  const DEMO = ['icu tyger', '44', 'labour groote', 'neonatal'];
  const alive = () => !userTook && !reduce.matches;
  async function until(fn) { while (!fn()) { if (userTook) return; await wait(300); } }

  async function autoplay() {
    await wait(1200);
    for (let n = 0; alive(); n++) {
      await until(() => dirVisible);
      if (!alive()) return;
      const text = DEMO[n % DEMO.length];
      for (const ch of text) {
        if (!alive()) return;
        q.value += ch; render();
        await wait(70 + rand() * 70);
      }
      await wait(1100); if (!alive()) return;
      const first = list.querySelector('.row');
      if (first) {
        first.classList.add('pressed'); await wait(260);
        if (!alive()) return;
        openSheet(shown[0]); await wait(1300);
        if (!alive()) return;
        callBtn.classList.add('pressed'); await wait(180);
        callBtn.classList.remove('pressed'); pressCall(); await wait(1700);
        if (!alive()) return;
        closeSheet(); await wait(500);
      }
      while (q.value && alive()) { q.value = q.value.slice(0, -1); render(); await wait(28); }
      await wait(500);
    }
  }

  if (reduce.matches) q.value = 'icu';
  render();
  autoplay();

  /* ---------- Who rang: rolling digits ---------- */
  const digitsEl = $('digits'), who = $('rangWho'), extIn = $('extIn');
  // Positions 0-9 are digits, 10 is an empty slot.
  digitsEl.innerHTML = Array.from({ length: 4 }, () =>
    `<span class="slot"><span class="strip">${'0123456789'.split('').map((d) => `<span>${d}</span>`).join('')}<span>&nbsp;</span></span></span>`).join('');
  const strips = [...digitsEl.querySelectorAll('.strip')];

  function roll(code) {
    strips.forEach((s, i) => {
      const d = code[i];
      s.style.transform = `translateY(-${(d === undefined ? 10 : +d)}em)`;
    });
    if (code.length < 4) { who.innerHTML = '&nbsp;'; return; }
    const hits = ENTRIES.filter((e) => e.ext === code);
    who.innerHTML = hits.length
      ? `${esc(hits[0].name)}<small>${esc(hits[0].hospital)}${hits.length > 1 ? `, and ${hits.length - 1} more` : ''}</small>`
      : 'Not in this demo.<small>Try 4417, 2381 or 7405.</small>';
  }
  roll('4417');

  let rangTouched = false, rangVisible = false;
  extIn.addEventListener('input', () => {
    rangTouched = true;
    extIn.value = extIn.value.replace(/\D/g, '').slice(0, 4);
    roll(extIn.value);
  });
  new IntersectionObserver(([e]) => { rangVisible = e.isIntersecting; }, { threshold: 0.3 }).observe($('rang'));
  (async () => {
    const cycle = ['2381', '7405', '6052', '4417'];
    for (let n = 0; ; n++) {
      await wait(3200);
      if (rangTouched) return;
      if (rangVisible && !reduce.matches) roll(cycle[n % cycle.length]);
    }
  })();

  /* ---------- Fixes: a number's history, with Put back ---------- */
  const hist = $('hist');
  let versions = [
    { v: '021 938 4122', note: 'Changed 2 days ago' },
    { v: '021 938 5521', note: 'Changed 14 Oct. 3 had said it didn’t work' },
    { v: '021 938 5520', note: 'Changed 2 Aug' },
  ];
  const UNDO = '<svg viewBox="0 0 256 256" aria-hidden="true"><path d="M224,128a96,96,0,0,1-94.71,96H128A95.38,95.38,0,0,1,62.1,197.8a8,8,0,0,1,11-11.63A80,80,0,1,0,71.43,71.39a3.07,3.07,0,0,1-.26.25L60.630,81.29l17,17A8,8,0,0,1,72,112H24a8,8,0,0,1-8-8V56A8,8,0,0,1,29.66,50.3L49.31,70,60.25,60A96,96,0,0,1,224,128Z"/></svg>';

  function paintHist() {
    // FLIP: remember where each value was, re-render, then slide from there.
    const before = new Map([...hist.children].map((li) => [li.dataset.v, li.getBoundingClientRect().top]));
    hist.innerHTML = versions.map((x, i) => `
      <li data-v="${x.v}">
        <span class="hist-v">${x.v}</span>
        <span class="hist-note">${x.note}</span>
        ${i === 0 ? '<span class="hist-now">Now</span>'
          : `<button class="putback" type="button" data-i="${i}">${UNDO}Put back</button>`}
      </li>`).join('');
    if (reduce.matches) return;
    for (const li of hist.children) {
      const was = before.get(li.dataset.v);
      if (was === undefined) continue;
      const dy = was - li.getBoundingClientRect().top;
      if (!dy) continue;
      li.animate([{ transform: `translateY(${dy}px)` }, { transform: 'none' }], { duration: 650, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' });
    }
  }
  hist.addEventListener('click', (ev) => {
    const b = ev.target.closest('.putback');
    if (!b) return;
    const i = +b.dataset.i;
    const [old] = versions.splice(i, 1);
    versions[0] = { ...versions[0], note: 'Replaced just now' };
    versions.unshift({ v: old.v, note: 'Put back just now' });
    paintHist();
  });
  paintHist();

  /* ---------- Hospital index ---------- */
  const groupsEl = $('groups'), tabsEl = $('tabs');
  $('hospCount').textContent = HOSPITALS.length;
  const byLetter = {};
  for (const h of [...HOSPITALS].sort((a, b) => a.localeCompare(b))) {
    const L = h[0].toUpperCase();
    (byLetter[L] ||= []).push(h);
  }
  const letters = Object.keys(byLetter);
  tabsEl.innerHTML = letters.map((L) => `<a href="#h-${L}" aria-label="Hospitals starting with ${L}">${L}</a>`).join('');
  groupsEl.innerHTML = letters.map((L) => `
    <div class="group reveal" id="h-${L}">
      <h3>${L}</h3>
      <ul>${byLetter[L].map((h) => `<li>${esc(h)}</li>`).join('')}</ul>
    </div>`).join('');

  /* ---------- Scroll reveal and the offline panel ---------- */
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (!e.isIntersecting) continue;
      e.target.classList.add('in');
      if (e.target.id === 'offlinePanel') setTimeout(() => e.target.classList.add('off'), reduce.matches ? 0 : 900);
      io.unobserve(e.target);
    }
  }, { threshold: 0.18, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal').forEach((el, i) => {
    if (el.classList.contains('group')) el.style.transitionDelay = `${(i % 6) * 50}ms`;
    io.observe(el);
  });
})();
