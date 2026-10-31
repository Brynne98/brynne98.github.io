(() => {
  const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Hero: the department in "ICU, now." changes, to show it covers every one.
  const roller = document.querySelector('.roller');
  if (roller && !still) {
    const words = roller.dataset.words.split(',');
    let i = 0;
    let current = roller.querySelector('.roller-word');
    const fit = (el) => { roller.style.width = el.offsetWidth + 'px'; };
    document.fonts.ready.then(() => {
      fit(current);
      setInterval(() => {
        if (document.hidden) return;
        i = (i + 1) % words.length;
        const next = document.createElement('span');
        next.className = 'roller-word is-entering';
        next.textContent = words[i];
        current.className = 'roller-word is-out';
        const old = current;
        old.addEventListener('animationend', () => old.remove(), { once: true });
        roller.appendChild(next);
        fit(next);
        current = next;
      }, 2200);
    });
  }

  // Night: each line lights when it reaches the middle band of the screen, and stays lit.
  const lines = document.querySelectorAll('.line');
  const light = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-lit'); light.unobserve(e.target); }
    });
  }, { rootMargin: '-40% 0px -40% 0px' });
  lines.forEach((l) => (still ? l.classList.add('is-lit') : light.observe(l)));

  // Everything else: one-off entrance when a fifth of it is on screen.
  const targets = document.querySelectorAll('.reveal, .basement, .specimen');
  const show = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add('is-in'); show.unobserve(e.target); }
    });
  }, { threshold: 0.2 });
  targets.forEach((t) => (still ? t.classList.add('is-in') : show.observe(t)));
})();
