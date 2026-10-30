// Health Switch RSA, version F. Hospital names are real; every number below is made up.
(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)');
  const $ = (id) => document.getElementById(id);
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  /* ---------- the directory (made-up numbers) ---------- */
  const DIR = [
    { n: 'Surgical ICU', d: 'Critical care', h: 'Groote Schuur Hospital', p: '021 404 7731', x: '7731' },
    { n: 'Neonatal ICU', d: 'Paediatrics', h: 'Tygerberg Hospital', p: '021 938 2614', x: '2614' },
    { n: 'Paediatric ICU', d: 'Paediatrics', h: 'Chris Hani Baragwanath Academic Hospital', p: '011 933 0582', x: '0582' },
    { n: 'Cardiac ICU', d: 'Cardiology', h: 'Inkosi Albert Luthuli Central Hospital', p: '031 240 1196', x: '1196' },
    { n: 'Burns ICU', d: 'Surgery', h: "Red Cross War Memorial Children's Hospital", p: '021 658 3047', x: '3047' },
    { n: 'CT bookings', d: 'Radiology', h: 'Universitas Academic Hospital', p: '051 405 2279', x: '2279' },
    { n: 'Reception', d: 'Radiology', h: 'Helen Joseph Hospital', p: '011 489 0753', x: '0753' },
    { n: 'MRI', d: 'Radiology', h: 'Livingstone Hospital', p: '041 405 6638', x: '6638' },
    { n: 'After hours', d: 'Radiology', h: 'Frere Hospital', p: '043 709 1864', x: '1864' },
    { n: 'Ward 4 nurses station', d: 'Obstetrics', h: 'Mowbray Maternity Hospital', p: 'Ext 6143', x: '6143' },
    { n: 'Blood bank', d: 'Pathology', h: 'King Edward VIII Hospital', p: 'Ext 6143', x: '6143' },
    { n: 'Pharmacy', d: 'Pharmacy', h: 'Edendale Hospital', p: 'Ext 6143', x: '6143' },
    { n: 'Casualty', d: 'Emergency', h: 'Edendale Hospital', p: '033 395 1720', x: '1720' },
    { n: 'Casualty', d: 'Emergency', h: 'Khayelitsha District Hospital', p: '021 360 2286', x: '2286' },
    { n: 'Theatre 3', d: 'Surgery', h: 'Tygerberg Hospital', p: 'Ext 8152', x: '8152' },
    { n: 'Theatre bookings', d: 'Surgery', h: 'Dora Nginza Hospital', p: '041 406 3359', x: '3359' },
    { n: 'Labour ward', d: 'Obstetrics', h: 'Pelonomi Academic Hospital', p: '051 405 9917', x: '9917' },
    { n: 'Admissions', d: 'Psychiatry', h: 'Lentegeur Hospital', p: '021 370 1458', x: '1458' },
  ];
  const DEMO = [
    { mode: 'ward', q: 'ICU' },
    { mode: 'dept', q: 'Radiology' },
    { mode: 'ext', q: '6143' },
  ];

  const q = $('q'), rowsEl = $('rows'), none = $('none');
  const tabs = [...document.querySelectorAll('.ftab')];
  let mode = 'ward';

  function search(text) {
    const t = text.trim().toLowerCase();
    if (!t) return [];
    if (mode === 'ext') return DIR.filter((e) => e.x.includes(t.replace(/\D/g, '') || '#'));
    const key = mode === 'dept' ? 'd' : 'n';
    return DIR.filter((e) => e[key].toLowerCase().includes(t) || e.n.toLowerCase().includes(t));
  }

  function mark(s, t) {
    const i = t ? s.toLowerCase().indexOf(t.toLowerCase()) : -1;
    if (i < 0) return esc(s);
    return esc(s.slice(0, i)) + '<mark>' + esc(s.slice(i, i + t.length)) + '</mark>' + esc(s.slice(i + t.length));
  }

  function render() {
    const t = q.value.trim();
    const hits = search(t).slice(0, 4);
    rowsEl.innerHTML = hits.map((e, i) => {
      const name = mode === 'dept' ? `${e.d}, ${e.n}` : e.n;
      return `<li class="row" style="--i:${i}" data-i="${DIR.indexOf(e)}" tabindex="0">
        <span class="row-name">${mark(name, mode === 'ext' ? '' : t)}</span><span class="row-lead"></span>
        <span class="row-num">${mode === 'ext' ? mark(e.p, t) : esc(e.p)}</span>
        <span class="row-where">${esc(e.h)}</span></li>`;
    }).join('');
    none.hidden = !t || hits.length > 0;
    return hits;
  }

  function setMode(m) {
    mode = m;
    tabs.forEach((b) => b.setAttribute('aria-selected', String(b.dataset.mode === m)));
  }

  /* the readout: each digit rolls on its own strip */
  const roNum = $('ro-num'), roName = $('ro-name'), roCall = $('ro-call');
  function readout(e) {
    roName.textContent = `${e.n}, ${e.h}`;
    roCall.setAttribute('aria-label', `Call ${e.n}, ${e.h}`);
    $('ro-text').textContent = e.p;
    let k = 0;
    roNum.innerHTML = [...e.p].map((c) => {
      if (c === ' ') return '<span class="sp"></span>';
      if (!/\d/.test(c)) return `<span>${c}</span>`;
      return `<span class="d"><span class="strip" style="--i:${k++}" data-to="${c}">${'0123456789'.split('').map((n) => `<span>${n}</span>`).join('')}</span></span>`;
    }).join('');
    const strips = roNum.querySelectorAll('.strip');
    strips.forEach((s) => { s.style.transform = `translateY(-${(+s.dataset.to + 3) % 10}em)`; });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      strips.forEach((s) => { s.style.transform = `translateY(-${s.dataset.to}em)`; });
    }));
  }

  function pick(li) {
    rowsEl.querySelectorAll('.row').forEach((r) => r.classList.toggle('on', r === li));
    readout(DIR[+li.dataset.i]);
  }

  /* the page types by itself until the visitor takes over */
  let demo = !still.matches, step = 0, timer = 0, heroVisible = true;
  const wait = (ms) => new Promise((r) => { timer = setTimeout(r, ms); });
  async function play() {
    while (demo) {
      if (!heroVisible) { await wait(600); continue; }
      const { mode: m, q: text } = DEMO[step % DEMO.length];
      setMode(m); q.value = ''; render();
      await wait(500);
      for (const ch of text) { if (!demo) return; q.value += ch; render(); await wait(110); }
      await wait(700); if (!demo) return;
      const first = rowsEl.querySelector('.row');
      if (first) pick(first);
      await wait(3200);
      step++;
    }
  }
  function takeOver() { if (demo) { demo = false; clearTimeout(timer); } }
  $('finder').addEventListener('pointerdown', takeOver);
  q.addEventListener('focus', takeOver);
  q.addEventListener('input', () => { takeOver(); const hits = render(); if (hits.length) pick(rowsEl.querySelector('.row')); });
  tabs.forEach((b) => b.addEventListener('click', () => {
    takeOver(); setMode(b.dataset.mode);
    q.value = DEMO.find((d) => d.mode === b.dataset.mode).q;
    render(); const first = rowsEl.querySelector('.row'); if (first) pick(first);
  }));
  rowsEl.addEventListener('click', (ev) => { const li = ev.target.closest('.row'); if (li) pick(li); });
  rowsEl.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' && ev.target.matches('.row')) pick(ev.target); });
  roCall.addEventListener('click', (ev) => {
    ev.preventDefault();
    roCall.classList.remove('ring'); void roCall.offsetWidth; roCall.classList.add('ring');
  });
  new IntersectionObserver(([e]) => { heroVisible = e.isIntersecting; }).observe($('find'));

  setMode('ward'); q.value = 'ICU'; render();
  if (demo) { q.value = ''; render(); setTimeout(play, 900); }
  else pick(rowsEl.querySelector('.row'));

  /* ---------- hospital index ---------- */
  const HOSPITALS = ["Addington Hospital", "Beaufort West Hospital", "Caledon Provincial Hospital", "Cecilia Makiwane Hospital", "Chris Hani Baragwanath Academic Hospital", "Dora Nginza Hospital", "Dr Pixley Ka Isaka Seme Hospital", "Du Noon CHC", "Edendale Hospital", "Edenvale Hospital", "Eerste River Hospital", "eMalahleni Private Hospital", "Evander Hospital", "False Bay Hospital", "Femina Hospital", "Frere Hospital", "George Regional Hospital", "Groote Schuur Hospital", "Heideveld Emergency Centre", "Helen Joseph Hospital", "Inanda C Community Health Centre", "Inkosi Albert Luthuli Central Hospital", "Isilimela Hospital", "Kalafong Hospital", "Karl Bremer Hospital", "Khayelitsha District Hospital", "King Dinuzulu Hospital", "King Edward VIII Hospital", "Klerksdorp Hospital", "Lentegeur Hospital", "Livingstone Hospital", "Madwaleni Hospital", "Mahatma Gandhi Memorial Hospital", "Mahikeng Provincial Hospital", "Mankweng Hospital", "Mapulaneng Hospital", "Medicare Rustenburg", "Mitchells Plain District Hospital", "Montana Hospital", "Mowbray Maternity Hospital", "Nelson Mandela Academic Hospital", "New Somerset Hospital", "Niemeyer Memorial Hospital", "Northdale Hospital", "Oudtshoorn Hospital", "Paarl Provincial Hospital", "Peglerae Hospital", "Pelonomi Academic Hospital", "Pelonomi Regional Hospital", "Pholosong Hospital", "Pietersburg Hospital", "Port Elizabeth Provincial Hospital", "Port Shepstone Regional Hospital", "Pretoria East Hospital", "Prince Mshiyeni Memorial Hospital", "Red Cross War Memorial Children's Hospital", "RK Khan Hospital", "Rob Ferreira Hospital", "Robert Mangaliso Sobukwe Hospital", "Sabie Hospital", "Sebokeng Hospital", "Shongwe Hospital", "Stikland Hospital", "Taung District Hospital", "Tembisa Provincial Hospital", "Thelle Mogoerane Regional Hospital", "Themba Hospital", "Tshepong Hospital", "Tygerberg Hospital", "Uitenhage Provincial Hospital", "Umphumulo Hospital", "Universitas Academic Hospital", "Victoria Hospital", "Wentworth Hospital", "Wilgers Hospital", "Witbank Hospital", "Worcester Provincial Hospital"];
  $('count').textContent = HOSPITALS.length;
  const groups = {};
  HOSPITALS.forEach((h) => { (groups[h[0].toUpperCase()] ||= []).push(h); });
  $('cols').innerHTML = Object.keys(groups).map((L) =>
    `<div class="group"><span class="letter" aria-hidden="true">${L}</span><ul aria-label="${L}">${groups[L].map((h) => `<li>${esc(h)}</li>`).join('')}</ul></div>`
  ).join('');
  const items = [...document.querySelectorAll('.group li')];

  $('hq').addEventListener('input', (ev) => {
    const t = ev.target.value.trim().toLowerCase();
    let n = 0;
    items.forEach((li) => {
      const hit = !t || li.textContent.toLowerCase().includes(t);
      li.classList.toggle('dim', !hit);
      li.classList.toggle('match', !!t && hit);
      if (hit) n++;
    });
    document.querySelectorAll('.group').forEach((g) => g.classList.toggle('dim', !!t && !g.querySelector('li:not(.dim)')));
    $('hnone').hidden = n > 0;
  });

  /* guide words: first and last hospital in view, like the top of a directory page */
  const guide = $('guide'), seen = new Set();
  const gio = new IntersectionObserver((es) => {
    es.forEach((e) => (e.isIntersecting ? seen.add(e.target) : seen.delete(e.target)));
    const vis = items.filter((li) => seen.has(li));
    guide.classList.toggle('on', vis.length > 0);
    if (vis.length) {
      $('guide-a').textContent = vis[0].textContent.split(' ')[0];
      $('guide-b').textContent = vis[vis.length - 1].textContent.split(' ')[0];
    }
  }, { rootMargin: '-64px 0px 0px 0px' });
  items.forEach((li) => gio.observe(li));

  /* ---------- corrections ---------- */
  const fxNow = $('fx-now'), fxWhen = $('fx-when'), fxPast = $('fx-past');
  let now = { p: '021 404 6182', w: 'Changed 2 days ago' };
  let past = [
    { p: '021 404 6810', w: 'Changed 3 weeks ago' },
    { p: '021 404 5539', w: 'Added March 2026' },
  ];
  function drawFix(fresh) {
    fxNow.textContent = now.p; fxWhen.textContent = now.w;
    fxPast.innerHTML = past.map((e, i) => `<li class="past${fresh === i ? '' : ' struck'}">
      <span class="past-num">${esc(e.p)}</span><span class="past-when">${esc(e.w)}</span>
      <button class="put" type="button" data-i="${i}"><svg aria-hidden="true"><use href="img/icons.svg#arrow-counter-clockwise"/></svg>Put back<span class="sr"> ${esc(e.p)}</span></button></li>`).join('');
    if (fresh !== undefined) {
      fxNow.classList.remove('new'); void fxNow.offsetWidth; fxNow.classList.add('new');
      requestAnimationFrame(() => requestAnimationFrame(() => fxPast.children[fresh]?.classList.add('struck')));
    }
  }
  function replace(p, w) {
    past.unshift({ p: now.p, w: now.w });
    now = { p, w };
    drawFix(0);
  }
  fxPast.addEventListener('click', (ev) => {
    const b = ev.target.closest('.put'); if (!b) return;
    const [old] = past.splice(+b.dataset.i, 1);
    replace(old.p, 'Put back just now');
  });
  const fxIn = $('fx-in'), fxErr = $('fx-err');
  $('fx-form').addEventListener('submit', (ev) => {
    ev.preventDefault();
    const digits = fxIn.value.replace(/\D/g, '');
    if (digits.length !== 4 && digits.length !== 10) {
      fxErr.textContent = 'Type a 10-digit number or a 4-digit extension.';
      fxIn.setAttribute('aria-invalid', 'true');
      return;
    }
    fxErr.textContent = ''; fxIn.removeAttribute('aria-invalid');
    const p = digits.length === 4 ? `Ext ${digits}` : `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
    if (p === now.p) { fxErr.textContent = 'That is already the number.'; return; }
    replace(p, 'Changed just now');
    fxIn.value = '';
  });
  drawFix();

  /* ---------- the lift going down ---------- */
  const floor = $('floor'), bars = [...$('bars').children], state = $('floor-state');
  const FLOORS = [['G', 4], ['B1', 2], ['B2', 1], ['B3', 0]];
  function setFloor([f, b]) {
    floor.textContent = f;
    floor.classList.remove('tick'); void floor.offsetWidth; floor.classList.add('tick');
    bars.forEach((i, k) => i.classList.toggle('off', k >= b));
    state.textContent = b ? `${b} bar${b > 1 ? 's' : ''}` : 'No service';
    state.classList.toggle('dead', !b);
  }
  function ride() {
    if (still.matches) { setFloor(FLOORS[3]); $('lift').classList.add('done'); return; }
    FLOORS.forEach((f, i) => setTimeout(() => {
      setFloor(f);
      if (i === FLOORS.length - 1) $('lift').classList.add('done');
    }, i * 850));
  }

  /* ---------- scroll reveals, spine tabs, head rule ---------- */
  const rio = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    e.target.classList.add('seen'); rio.unobserve(e.target);
  }), { threshold: 0.15 });
  document.querySelectorAll('.up').forEach((el) => rio.observe(el));

  new IntersectionObserver(([e], o) => { if (e.isIntersecting) { ride(); o.disconnect(); } }, { threshold: 0.5 }).observe($('lift'));

  const spine = [...document.querySelectorAll('.spine-tab')];
  const sio = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) spine.forEach((t) => t.classList.toggle('on', t.dataset.for === e.target.dataset.tab));
  }), { rootMargin: '-45% 0px -50% 0px' });
  document.querySelectorAll('[data-tab]').forEach((s) => sio.observe(s));

  const head = $('head');
  new IntersectionObserver(([e]) => head.classList.toggle('scrolled', !e.isIntersecting)).observe($('top'));
})();
