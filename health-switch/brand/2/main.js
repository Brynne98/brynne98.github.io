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
    el("circle", { class: "hit", cx: h[0], cy: h[1], r: 11 }, g);
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
