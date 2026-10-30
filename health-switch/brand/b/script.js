(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (id) => document.getElementById(id);
  const esc = (s) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

  /* ---- Hero search over the sample directory ---- */
  const input = $('q');
  const list = $('results');
  const meta = $('meta');
  const { entries, hospitals } = window.HSR;

  const highlight = (text, words) => {
    let out = esc(text);
    for (const w of words) {
      if (!w) continue;
      out = out.replace(new RegExp(`(${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'ig'), '<mark>$1</mark>');
    }
    return out;
  };

  const search = (q) => {
    const words = q.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!words.length) return { words, hits: [] };
    const hits = entries.filter((e) => words.every((w) => (/^\d+$/.test(w) ? e.ext.startsWith(w) : e.hay.includes(w))));
    return { words, hits };
  };

  const render = (q) => {
    const { words, hits } = search(q);
    if (!words.length) {
      meta.textContent = `${entries.length.toLocaleString('en-ZA')} sample numbers. Try a ward, a hospital or an extension.`;
      list.innerHTML = '';
      return;
    }
    meta.textContent = hits.length === 1 ? '1 number' : `${hits.length.toLocaleString('en-ZA')} numbers`;
    if (!hits.length) {
      list.innerHTML = '<li class="empty">No match. Try fewer letters, or a ward name like “ICU”.</li>';
      return;
    }
    list.innerHTML = hits.slice(0, 6).map((e, n) => `
      <li style="--n:${n}">
        <span><span class="r-dept">${highlight(e.dept, words)}</span><span class="r-hosp">${highlight(e.hospital, words)}</span></span>
        <span class="chip">${highlight(e.ext, words)}</span>
        <button class="call" type="button" aria-label="Call ${esc(e.dept)}, ${esc(e.hospital)}"><i class="ic ic-call" aria-hidden="true"></i></button>
      </li>`).join('');
  };

  list.addEventListener('click', (ev) => {
    const btn = ev.target.closest('.call');
    if (!btn) return;
    btn.classList.remove('is-ringing');
    void btn.offsetWidth;
    btn.classList.add('is-ringing');
    meta.textContent = 'In the app this rings straight through. These numbers are examples.';
  });

  // Demo typing until the reader takes over.
  const demo = ['icu', 'ward bara', '44', 'theatre', 'casualty'];
  let typing = !still;
  let timer;
  const stopDemo = () => { typing = false; clearTimeout(timer); };
  input.addEventListener('focus', stopDemo, { once: true });
  input.addEventListener('pointerdown', stopDemo, { once: true });
  input.addEventListener('input', () => { stopDemo(); render(input.value); });

  const typeLoop = (i = 0) => {
    if (!typing) return;
    const word = demo[i % demo.length];
    let c = 0;
    const step = () => {
      if (!typing) return;
      input.value = word.slice(0, ++c);
      render(input.value);
      if (c < word.length) timer = setTimeout(step, 70 + Math.random() * 70);
      else timer = setTimeout(() => typeLoop(i + 1), 2400);
    };
    step();
  };

  if (still) { input.value = 'casualty bara'; render(input.value); }
  else { render(''); timer = setTimeout(typeLoop, 1100); }

  /* ---- Hospital names: two copies so the line loops without a gap ---- */
  const names = $('names');
  const items = hospitals.map((h) => `<li>${esc(h)}</li>`).join('');
  names.innerHTML = items + items.replace(/<li>/g, '<li aria-hidden="true">');

  /* ---- Count up to 82 ---- */
  const countUp = (el) => {
    const to = Number(el.dataset.to);
    const t0 = performance.now();
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / 1200);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  /* ---- Reveal on scroll ---- */
  const seen = (el) => {
    el.classList.add('in');
    if (el.matches('.signal-copy')) document.querySelector('.bars').classList.add('is-dropped');
    const count = el.querySelector('.count');
    if (count && !still) countUp(count);
  };
  const io = new IntersectionObserver((list) => {
    for (const e of list) if (e.isIntersecting) { seen(e.target); io.unobserve(e.target); }
  }, { threshold: 0.25 });
  document.querySelectorAll('.reveal').forEach((el) => (still ? seen(el) : io.observe(el)));

  /* ---- Put an old number back ---- */
  const now = $('nowNum');
  const rowNew = $('rowNew');
  const rowOld = $('rowOld');
  const swapBtn = $('putBack');
  swapBtn.addEventListener('click', () => {
    const a = rowNew.querySelector('.h-num');
    const b = rowOld.querySelector('.h-num');
    [a.textContent, b.textContent] = [b.textContent, a.textContent];
    const back = a.textContent === '4417';
    rowNew.querySelector('.h-what').innerHTML = back
      ? '<i class="ic ic-undo" aria-hidden="true"></i> Put back just now'
      : '<i class="ic ic-pencil" aria-hidden="true"></i> Corrected 2 days ago';
    rowOld.querySelector('.h-what').textContent = back ? 'Replaced just now' : 'Reported not working by 3 people';
    now.textContent = a.textContent;
    now.classList.remove('is-swap');
    void now.offsetWidth;
    now.classList.add('is-swap');
  });
})();
