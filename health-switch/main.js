(function () {
  "use strict";
  var doc = document.documentElement;
  doc.classList.add("js");
  var still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";
  var ZA = window.ZA;

  function el(name, attrs, parent) {
    var n = document.createElementNS(NS, name);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  }

  // Map: every district of South Africa, and a light for each hospital.
  var mapBox = document.querySelector(".map");
  var tip = document.getElementById("map-name");
  var svg = el("svg", { viewBox: "-6 -6 " + (ZA.w + 12) + " " + (ZA.ht + 12), "aria-hidden": "true" }, mapBox);
  var land = el("g", { class: "land" }, svg);
  ZA.d.forEach(function (d) { el("path", { d: d }, land); });
  var lights = el("g", { class: "lights" }, svg);
  var maxX = Math.max.apply(null, ZA.h.map(function (h) { return h[0]; }));
  var dots = ZA.h.map(function (h) {
    var g = el("g", { class: "h" }, lights);
    // Lights come on east to west, the way night crosses the country.
    g.style.setProperty("--t", Math.round((maxX - h[0]) * 3.2 + Math.random() * 180) + "ms");
    el("circle", { class: "glow", cx: h[0], cy: h[1], r: 9 }, g);
    el("circle", { class: "dot", cx: h[0], cy: h[1], r: 3.6 }, g);
    el("circle", { class: "hit", cx: h[0], cy: h[1], r: 16 }, g);
    function pick() {
      dots.forEach(function (o) { o.classList.remove("on"); });
      g.classList.add("on");
      tip.textContent = h[2];
    }
    function byHand() { stopTour(); pick(); }
    g.addEventListener("mouseenter", byHand);
    g.addEventListener("click", byHand);
    g.pick = pick;
    return g;
  });
  // Until someone points at the map, it names one hospital after another.
  var tour = null, stopped = false;
  function stopTour() { stopped = true; clearInterval(tour); }
  if (!still) {
    var spots = dots.slice().sort(function () { return Math.random() - 0.5; });
    var k = 0;
    setTimeout(function () {
      if (stopped) return;
      spots[k++].pick();
      tour = setInterval(function () { spots[k++ % spots.length].pick(); }, 2200);
    }, 2600);
  }
  requestAnimationFrame(function () { requestAnimationFrame(function () { mapBox.classList.add("lit"); }); });

  // Hospital names and province counts, from the same list.
  var names = ZA.h.map(function (h) { return h[2]; })
    .filter(function (n, i, a) { return a.indexOf(n) === i; });
  var rows = document.querySelectorAll(".names-row");
  var half = Math.ceil(names.length / 2);
  [names.slice(0, half), names.slice(half)].forEach(function (list, i) {
    var all = still ? list : list.concat(list);
    rows[i].innerHTML = all.map(function (n) { return "<span>" + n + "</span>"; }).join("");
  });
  var provinces = [
    ["WC", "Western Cape"], ["KZN", "KwaZulu-Natal"], ["GP", "Gauteng"],
    ["EC", "Eastern Cape"], ["MP", "Mpumalanga"], ["NW", "North West"],
    ["FS", "Free State"], ["NC", "Northern Cape"], ["LP", "Limpopo"]
  ];
  document.querySelector(".provinces").innerHTML = provinces.map(function (p) {
    var n = ZA.h.filter(function (h) { return h[3] === p[0]; }).length;
    return "<div><dt>" + p[1] + "</dt><dd>" + n + "</dd></div>";
  }).join("");

  // Night scene: windows in the main building.
  var win = document.querySelector(".windows");
  var wins = [];
  for (var r = 0; r < 6; r++) {
    for (var c = 0; c < 14; c++) {
      wins.push(el("rect", { class: "win", x: 522 + c * 41, y: 212 + r * 31, width: 22, height: 14, rx: 2 }, win));
    }
  }
  [[176, 310, 5, 3], [1224, 292, 5, 4]].forEach(function (b) {
    for (var r2 = 0; r2 < b[3]; r2++) for (var c2 = 0; c2 < b[2]; c2++) {
      wins.push(el("rect", { class: "win", x: b[0] + c2 * 44, y: b[1] + r2 * 24, width: 20, height: 11, rx: 2 }, win));
    }
  });
  var order = wins.map(function (w, i) { return i; }).sort(function () { return Math.random() - 0.5; });
  var share = [0.18, 0.55, 0.85, 0.3];
  var night = document.querySelector(".night");
  var moments = night.querySelectorAll(".moments li");
  function setStep(s) {
    night.setAttribute("data-step", s);
    moments.forEach(function (m, i) { m.classList.toggle("on", i === s); });
    var lit = Math.round(wins.length * share[s]);
    order.forEach(function (idx, k) { wins[idx].classList.toggle("lit", k < lit); });
  }
  setStep(0);

  // Change history: the current number is typed in over the old one.
  var now = document.querySelector(".h-now .num");
  function retype() {
    var from = now.getAttribute("data-from"), to = now.getAttribute("data-to");
    var keep = 0;
    while (from[keep] === to[keep]) keep++;
    var i = from.length;
    now.innerHTML = from;
    var t = setInterval(function () {
      if (i > keep) { i--; now.innerHTML = from.slice(0, i) + '<span class="tw"></span>'; return; }
      if (keep < to.length) { keep++; now.innerHTML = to.slice(0, keep) + (keep < to.length ? '<span class="tw"></span>' : ""); return; }
      clearInterval(t);
    }, 160);
  }

  // One observer for reveals, the night steps and the one-off effects.
  if (!("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach(function (n) { n.classList.add("in"); });
    return;
  }
  var seen = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      e.target.classList.add("in");
      if (e.target.classList.contains("history") && !still) setTimeout(retype, 400);
      seen.unobserve(e.target);
    });
  }, { threshold: 0.25 });
  document.querySelectorAll(".reveal, .nosignal, .history").forEach(function (n) { seen.observe(n); });

  // The night plays through once each time the scene comes into view.
  // A moment can be picked by hand, which stops the play.
  var timer = null;
  function play() {
    clearInterval(timer);
    var s = 0;
    setStep(0);
    timer = setInterval(function () {
      s++;
      if (s > 3) { clearInterval(timer); return; }
      setStep(s);
    }, 2600);
  }
  moments.forEach(function (m, i) {
    m.tabIndex = 0;
    function pick() { clearInterval(timer); setStep(i); }
    m.addEventListener("click", pick);
    m.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
  });
  if (still) { setStep(2); return; }
  var playing = false;
  new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && !playing) { playing = true; play(); }
      if (!e.isIntersecting) { playing = false; clearInterval(timer); }
    });
  }, { threshold: 0.6 }).observe(document.querySelector(".scene"));
})();

// Switchboard: a patch cord that joins the headline to the right ward.
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
  const svgEl = (tag, attrs, parent) => {
    const el = document.createElementNS(NS, tag);
    for (const k in attrs) el.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(el);
    return el;
  };
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

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

  // ---------- Switchboard: the headline patched into a ward ----------
  {
    const hero = document.querySelector(".patch");
    const list = document.getElementById("jacks");
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

  if (document.fonts) document.fonts.ready.then(() => stages.forEach((s) => s.refresh()));
})();
