// Health Switch RSA: patch cords that join you to the right ward.
// One small rope simulation (verlet points + length constraints) drives every cord.
(() => {
  "use strict";

  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const NS = "http://www.w3.org/2000/svg";
  const GRAVITY = 0.5;
  const DAMP = 0.982;

  // Made-up extensions and numbers, checked against the real directory: none match.
  const WARDS = [
    ["Maternity", "9757"], ["Casualty", "7719"], ["ICU", "3705"],
    ["Theatre", "9065"], ["Pharmacy", "3516"], ["Radiology", "3198"],
    ["Paeds", "8659"], ["Labour ward", "7879"], ["Lab", "9729"],
    ["Burns unit", "3694"], ["Neonatal", "9879"], ["Switchboard", "7725"],
  ];

  const HOSPITALS = [
    "Addington", "Beaufort West", "Caledon", "Cecilia Makiwane", "Chris Hani Baragwanath",
    "Dora Nginza", "Dr Pixley ka Isaka Seme", "Du Noon CHC", "Edendale", "Edenvale",
    "Eerste River", "Evander", "False Bay", "Frere", "George Regional", "Groote Schuur",
    "Heideveld", "Helen Joseph", "Inanda C CHC", "Inkosi Albert Luthuli", "Kalafong",
    "Karl Bremer", "Khayelitsha District", "King Dinuzulu", "King Edward VIII", "Klerksdorp",
    "Lentegeur", "Livingstone", "Madwaleni", "Mahatma Gandhi", "Mahikeng Provincial",
    "Mankweng", "Mapulaneng", "Mitchells Plain District", "Mowbray Maternity",
    "Nelson Mandela Academic", "New Somerset", "Niemeyer Memorial", "Northdale",
    "Oudtshoorn", "Paarl Provincial", "Pelonomi", "Pholosong", "Polokwane",
    "Port Elizabeth Provincial", "Port Shepstone", "Prince Mshiyeni", "Red Cross Children's",
    "RK Khan", "Robert Mangaliso Sobukwe", "Rob Ferreira", "Sabie", "Sebokeng", "Shongwe",
    "Stikland", "Taung District", "Tembisa", "Thelle Mogoerane", "Themba", "Tshepong",
    "Tygerberg", "Uitenhage Provincial", "Universitas", "Victoria", "Wentworth", "Witbank",
    "Worcester Provincial", "Umphumulo", "Isilimela", "Montana", "Wilgers", "Pretoria East",
  ];

  const svgEl = (tag, attrs, parent) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  };
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const rand = (a, b) => a + Math.random() * (b - a);

  // ---------- Stage: one svg layer over one part of the page ----------
  const stages = [];
  class Stage {
    constructor(svg) {
      this.svg = svg;
      this.box = svg.parentElement;
      this.cords = [];
      this.anchors = [];
      this.visible = false;
      this.onVisible = null;
      this.rect = this.box.getBoundingClientRect();
      new ResizeObserver(() => this.refresh()).observe(this.box);
      new IntersectionObserver(([e]) => {
        this.visible = e.isIntersecting;
        if (this.onVisible) this.onVisible(this.visible);
        if (this.visible) wake();
      }, { rootMargin: "80px" }).observe(this.box);
      stages.push(this);
    }
    // An anchor follows the centre of an element, or a custom point function.
    anchor(el, fn) {
      const a = { el, fn, x: 0, y: 0 };
      this.anchors.push(a);
      this.place(a);
      return a;
    }
    place(a) {
      if (a.fn) { Object.assign(a, a.fn(this.rect)); return; }
      const r = a.el.getBoundingClientRect();
      a.x = r.left + r.width / 2 - this.rect.left;
      a.y = r.top + r.height / 2 - this.rect.top;
    }
    refresh() {
      this.rect = this.box.getBoundingClientRect();
      for (const a of this.anchors) this.place(a);
      if (reduce) this.settle();
      else wake();
    }
    settle() {
      for (let i = 0; i < 400; i++) for (const c of this.cords) c.step(performance.now() + 1e6);
      for (const c of this.cords) c.draw();
    }
  }

  // ---------- Cord ----------
  class Cord {
    constructor(stage, { head, tail, segs = 22, width = 7, slack = 1.18, minLen = 80, freeLen = 200, plugHead = false, scale = 1 }) {
      this.stage = stage;
      this.head = head;
      this.tail = tail;
      this.n = segs;
      this.slack = slack;
      this.minLen = minLen;
      this.freeLen = freeLen;
      this.follow = null;
      this.tween = null;
      const h = head || { x: 0, y: 0 };
      const t = tail || { x: h.x, y: h.y + freeLen };
      this.pts = [];
      for (let i = 0; i < segs; i++) {
        const k = i / (segs - 1);
        const x = h.x + (t.x - h.x) * k, y = h.y + (t.y - h.y) * k;
        this.pts.push({ x, y, px: x, py: y });
      }
      this.seg = this.wantLen() / (segs - 1);

      this.g = svgEl("g", {}, stage.svg);
      this.shadow = svgEl("path", { class: "cord-shadow", "stroke-width": width + 2, transform: "translate(0 4)" }, this.g);
      this.body = svgEl("path", { class: "cord-body", "stroke-width": width }, this.g);
      this.shine = svgEl("path", { class: "cord-shine", "stroke-width": Math.max(1.2, width * 0.2), transform: "translate(-1 -1.5)" }, this.g);
      this.plugs = [this.plug(scale)];
      if (plugHead) this.plugs.push(this.plug(scale));
      stage.cords.push(this);
    }
    plug(s) {
      const g = svgEl("g", {}, this.g);
      const p = svgEl("g", { transform: `scale(${s})` }, g);
      svgEl("rect", { class: "plug-sleeve", x: -36, y: -7.5, width: 26, height: 15, rx: 4 }, p);
      svgEl("rect", { class: "plug-ring", x: -12, y: -6, width: 5, height: 12, rx: 1 }, p);
      svgEl("rect", { class: "plug-tip", x: -7, y: -3.5, width: 10, height: 7, rx: 3.5 }, p);
      return g;
    }
    wantLen() {
      if (this.head && this.tail) return Math.max(this.minLen, dist(this.head, this.tail) * this.slack);
      return this.freeLen;
    }
    // Carry the free end to a new point along a lifted arc.
    moveTail(to, { dur = 700, lift = 110, done } = {}) {
      const from = this.tail ? { x: this.tail.x, y: this.tail.y } : { x: this.pts[this.n - 1].x, y: this.pts[this.n - 1].y };
      if (reduce || dur === 0) { this.tail = to; this.tween = null; if (done) done(); return; }
      this.tween = { from, to, t0: performance.now(), dur, lift, done };
      this.tail = { x: from.x, y: from.y };
      wake();
    }
    release() { this.tail = null; this.tween = null; this.follow = null; wake(); }
    step(now) {
      if (this.tween) {
        const tw = this.tween;
        const t = Math.min(1, (now - tw.t0) / tw.dur), e = ease(t);
        this.tail.x = tw.from.x + (tw.to.x - tw.from.x) * e;
        this.tail.y = tw.from.y + (tw.to.y - tw.from.y) * e - tw.lift * Math.sin(Math.PI * t);
        if (t >= 1) { this.tail = tw.to; this.tween = null; if (tw.done) tw.done(); }
      } else if (this.follow) {
        // the free end chases the pointer, softened
        this.tail.x += (this.follow.x - this.tail.x) * 0.25;
        this.tail.y += (this.follow.y - this.tail.y) * 0.25;
      }
      const p = this.pts, n = this.n;
      for (let i = 0; i < n; i++) {
        const q = p[i];
        const vx = (q.x - q.px) * DAMP, vy = (q.y - q.py) * DAMP;
        q.px = q.x; q.py = q.y;
        q.x += vx; q.y += vy + GRAVITY;
      }
      this.seg += (this.wantLen() / (n - 1) - this.seg) * 0.1;
      for (let k = 0; k < 14; k++) {
        if (this.head) { p[0].x = this.head.x; p[0].y = this.head.y; }
        if (this.tail) { p[n - 1].x = this.tail.x; p[n - 1].y = this.tail.y; }
        for (let i = 0; i < n - 1; i++) {
          const a = p[i], b = p[i + 1];
          const dx = b.x - a.x, dy = b.y - a.y;
          const d = Math.hypot(dx, dy) || 0.001;
          const f = (d - this.seg) / d;
          const aPin = i === 0 && this.head, bPin = i === n - 2 && this.tail;
          const wa = aPin ? 0 : bPin ? 1 : 0.5, wb = bPin ? 0 : aPin ? 1 : 0.5;
          a.x += dx * f * wa; a.y += dy * f * wa;
          b.x -= dx * f * wb; b.y -= dy * f * wb;
        }
      }
    }
    draw() {
      const p = this.pts, n = this.n;
      let d = `M${p[0].x.toFixed(1)},${p[0].y.toFixed(1)}`;
      for (let i = 1; i < n - 1; i++) {
        const mx = (p[i].x + p[i + 1].x) / 2, my = (p[i].y + p[i + 1].y) / 2;
        d += `Q${p[i].x.toFixed(1)},${p[i].y.toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)}`;
      }
      d += `L${p[n - 1].x.toFixed(1)},${p[n - 1].y.toFixed(1)}`;
      this.shadow.setAttribute("d", d);
      this.body.setAttribute("d", d);
      this.shine.setAttribute("d", d);
      this.orient(this.plugs[0], p[n - 1], p[n - 4]);
      if (this.plugs[1]) this.orient(this.plugs[1], p[0], p[3]);
    }
    orient(g, end, back) {
      const a = Math.atan2(end.y - back.y, end.x - back.x) * 180 / Math.PI;
      g.setAttribute("transform", `translate(${end.x.toFixed(1)} ${end.y.toFixed(1)}) rotate(${a.toFixed(1)})`);
    }
    remove() {
      this.g.remove();
      const list = this.stage.cords;
      list.splice(list.indexOf(this), 1);
    }
  }

  // ---------- One animation loop for every visible stage ----------
  let running = false, last = 0, acc = 0;
  function wake() {
    if (reduce || running) return;
    running = true; last = performance.now(); acc = 0;
    requestAnimationFrame(frame);
  }
  function frame(now) {
    const live = stages.filter((s) => s.visible && s.cords.length);
    if (!live.length || document.hidden) { running = false; return; }
    acc = Math.min(acc + (now - last), 50); last = now;
    while (acc >= 16.67) {
      for (const s of live) for (const c of s.cords) c.step(now);
      acc -= 16.67;
    }
    for (const s of live) for (const c of s.cords) c.draw();
    requestAnimationFrame(frame);
  }
  document.addEventListener("visibilitychange", () => { if (!document.hidden) wake(); });

  // ---------- Hero: the headline patched into a ward ----------
  {
    const hero = document.querySelector(".hero");
    const list = document.getElementById("hero-jacks");
    const wardBox = hero.querySelector(".ward");
    const jacks = WARDS.map(([name, ext], i) => {
      const li = document.createElement("li");
      li.innerHTML = `<button class="jack" type="button" aria-pressed="false"><span class="lamp"></span><span class="socket"></span><span class="jack-name">${name}</span><span class="jack-ext">Ext ${ext}</span></button>`;
      list.appendChild(li);
      const btn = li.firstChild;
      btn.addEventListener("click", () => { patch(i); hold = performance.now() + 9000; });
      return btn;
    });

    const stage = new Stage(hero.querySelector(".cords"));
    const head = stage.anchor(hero.querySelector('[data-anchor="head"]'));
    const sockets = jacks.map((j) => stage.anchor(j.querySelector(".socket")));
    let cur = 0, hold = 0;
    const cord = new Cord(stage, { head, tail: sockets[0], slack: 1.3, segs: 26 });
    live(0);
    if (reduce) stage.settle();
    else for (let i = 0; i < 240; i++) cord.step(0);

    function live(i) {
      jacks.forEach((j, k) => { j.classList.toggle("is-live", k === i); j.setAttribute("aria-pressed", k === i); });
    }
    function swapWord(name) {
      const old = wardBox.querySelector(".ward-in");
      const next = document.createElement("span");
      next.className = "ward-in";
      next.textContent = name;
      if (reduce) { old.replaceWith(next); stage.refresh(); return; }
      old.className = "ward-out";
      wardBox.appendChild(next);
      setTimeout(() => { old.remove(); stage.refresh(); }, 360);
      requestAnimationFrame(() => stage.refresh());
    }
    function patch(i) {
      if (i === cur) return;
      cur = i;
      live(-1);
      swapWord(WARDS[i][0]);
      cord.moveTail(sockets[i], { dur: 760, lift: 130, done: () => live(i) });
      if (reduce) stage.settle();
    }
    if (!reduce) {
      setInterval(() => {
        if (!stage.visible || document.hidden || performance.now() < hold) return;
        patch((cur + 1) % WARDS.length);
      }, 3200);
    }
  }

  // ---------- Offline wall: cords keep patching with no data ----------
  {
    const section = document.querySelector(".offline");
    const wall = document.getElementById("wall");
    const items = HOSPITALS.map((name) => {
      const li = document.createElement("li");
      li.innerHTML = `<span class="socket" aria-hidden="true"></span><span>${name}</span>`;
      wall.appendChild(li);
      return li;
    });
    const stage = new Stage(wall.parentElement.querySelector(".cords"));
    const anchors = items.map((li) => stage.anchor(li.querySelector(".socket")));
    const busy = new Set();
    const shown = () => items.map((li, i) => i).filter((i) => items[i].offsetParent && !busy.has(i));

    function pickPair() {
      const free = shown();
      for (let tries = 0; tries < 30; tries++) {
        const a = free[Math.floor(Math.random() * free.length)];
        const near = free.filter((b) => { const d = dist(anchors[a], anchors[b]); return b !== a && d > 110 && d < 380 && Math.abs(anchors[a].x - anchors[b].x) > 90; });
        if (near.length) return [a, near[Math.floor(Math.random() * near.length)]];
      }
      return null;
    }
    function connect(a, b, instant) {
      busy.add(a); busy.add(b);
      items[a].classList.add("is-live");
      const cord = new Cord(stage, { head: anchors[a], tail: null, segs: 18, width: 5, slack: 1.2, freeLen: 60, plugHead: true, scale: 0.72 });
      cord.moveTail(anchors[b], {
        dur: instant ? 0 : 820, lift: 90,
        done: () => items[b].classList.add("is-live"),
      });
      return cord;
    }
    function hangUp(cord, a, b) {
      items[b].classList.remove("is-live");
      cord.release();
      setTimeout(() => {
        cord.g.classList.add("cord-fade");
        items[a].classList.remove("is-live");
        setTimeout(() => { cord.remove(); busy.delete(a); busy.delete(b); }, 650);
      }, 900);
    }
    function spawn() {
      const max = innerWidth < 600 ? 3 : 6;
      if (stage.cords.length >= max) return;
      const pair = pickPair();
      if (!pair) return;
      const [a, b] = pair;
      const cord = connect(a, b, false);
      setTimeout(() => hangUp(cord, a, b), rand(2600, 4200));
    }

    if (reduce) {
      for (let k = 0; k < 4; k++) { const pair = pickPair(); if (pair) connect(pair[0], pair[1], true); }
      stage.settle();
    } else {
      let timer = 0;
      stage.onVisible = (on) => {
        section.classList.toggle("is-running", on);
        clearInterval(timer);
        if (on) { spawn(); timer = setInterval(spawn, 750); }
      };
    }
  }

  // ---------- Fix: move off the wrong number, and back ----------
  {
    const board = document.querySelector(".fix-board");
    const btn = document.getElementById("fix-toggle");
    const hist = document.getElementById("history");
    const oldJ = board.querySelector('[data-num="old"]');
    const newJ = board.querySelector('[data-num="new"]');
    const stage = new Stage(board.querySelector(".cords"));
    const head = stage.anchor(board.querySelector('[data-anchor="fix-head"]'));
    const oldS = stage.anchor(oldJ.querySelector(".socket"));
    const newS = stage.anchor(newJ.querySelector(".socket"));
    const cord = new Cord(stage, { head, tail: oldS, segs: 20, width: 6, slack: 1.25 });
    oldJ.classList.add("is-live");
    let fixed = false, auto = true;
    if (reduce) stage.settle(); else for (let i = 0; i < 240; i++) cord.step(0);

    function note(text) {
      const now = new Date();
      const li = document.createElement("li");
      li.innerHTML = `<b>Today ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}</b> ${text}`;
      hist.prepend(li);
      while (hist.children.length > 4) hist.lastElementChild.remove();
    }
    function toggle() {
      fixed = !fixed;
      oldJ.classList.remove("is-live"); newJ.classList.remove("is-live");
      oldJ.classList.toggle("is-wrong", fixed);
      const to = fixed ? newJ : oldJ;
      cord.moveTail(fixed ? newS : oldS, { dur: 800, lift: 70, done: () => { to.classList.add("is-live"); if (reduce) stage.settle(); } });
      note(fixed ? "Changed to 021 938 4417" : "Put back to 021 938 4471");
      btn.textContent = fixed ? "Put it back" : "Fix the number";
    }
    btn.addEventListener("click", () => { auto = false; toggle(); });
    stage.onVisible = (on) => {
      if (on && auto && !reduce) { auto = false; setTimeout(() => { if (!fixed) toggle(); }, 900); }
    };
  }

  // ---------- Get: a loose cord that plugs into a store button ----------
  {
    const section = document.querySelector(".get");
    const stage = new Stage(section.querySelector(".cords"));
    const top = stage.anchor(null, (r) => ({ x: r.width / 2, y: -12 }));
    const hang = () => Math.min(stage.rect.height * 0.3, 190);
    const cord = new Cord(stage, { head: top, tail: null, segs: 24, width: 7, freeLen: hang() });
    // start swinging so the cord reads as loose
    cord.pts.forEach((p, i) => { p.px = p.x - i * 0.9; });
    if (reduce) stage.settle(); else for (let i = 0; i < 20; i++) cord.step(0);

    const plugs = [...section.querySelectorAll("[data-plug]")];
    const holes = plugs.map((el) => stage.anchor(el, (r) => {
      const b = el.getBoundingClientRect();
      return { x: b.left - r.left + b.width / 2, y: b.top - r.top + 3 };
    }));
    let plugged = -1;
    const fine = matchMedia("(pointer: fine)").matches;

    if (!reduce && fine) {
      section.addEventListener("pointermove", (e) => {
        if (plugged >= 0) return;
        stage.rect = section.getBoundingClientRect();
        const pt = { x: e.clientX - stage.rect.left, y: e.clientY - stage.rect.top };
        if (!cord.tail) cord.tail = { x: cord.pts[cord.n - 1].x, y: cord.pts[cord.n - 1].y };
        cord.follow = pt;
        cord.freeLen = Math.max(hang(), dist(top, pt) * 1.08);
        wake();
      });
      section.addEventListener("pointerleave", () => {
        if (plugged >= 0) unplug();
        cord.freeLen = hang();
        cord.release();
      });
      plugs.forEach((el, i) => {
        el.addEventListener("pointerenter", () => {
          plugged = i;
          cord.follow = null;
          stage.rect = section.getBoundingClientRect();
          stage.place(holes[i]);
          cord.freeLen = dist(top, holes[i]) * 1.03;
          cord.moveTail(holes[i], { dur: 260, lift: 20 });
          el.classList.add("is-plugged");
        });
        el.addEventListener("pointerleave", unplug);
      });
    }
    function unplug() {
      if (plugged < 0) return;
      plugs[plugged].classList.remove("is-plugged");
      plugged = -1;
      cord.tween = null;
      cord.tail = { x: cord.pts[cord.n - 1].x, y: cord.pts[cord.n - 1].y };
    }
  }

  if (document.fonts) document.fonts.ready.then(() => stages.forEach((s) => s.refresh()));
})();
