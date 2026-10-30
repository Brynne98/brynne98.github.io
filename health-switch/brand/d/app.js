// Health Switch RSA site. Hospital names are real; every number is made up.
document.documentElement.classList.add("js");
const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s) => document.querySelector(s);
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

/* ---------- the listing in the hero ---------- */
const LISTINGS = [
  ["ward", "Surgical ICU", "Tygerberg Hospital", "021 938 5172"],
  ["ward", "Neonatal ICU", "Chris Hani Baragwanath Academic Hospital", "011 933 4417"],
  ["ward", "Paediatric ICU", "Red Cross War Memorial Children's Hospital", "021 658 6093"],
  ["ward", "Cardiac ICU", "Inkosi Albert Luthuli Central Hospital", "031 240 2861"],
  ["ward", "Trauma ICU", "Groote Schuur Hospital", "021 404 7730"],
  ["ward", "Ward 7 Medical", "Edendale Hospital", "033 395 4417"],
  ["ward", "Labour Ward", "Mowbray Maternity Hospital", "021 659 5528"],
  ["ward", "Burns Unit", "Livingstone Hospital", "041 405 2390"],
  ["dept", "Radiology Bookings", "Universitas Academic Hospital", "051 405 3618"],
  ["dept", "Radiology, CT", "Helen Joseph Hospital", "011 489 1772"],
  ["dept", "Radiology Reception", "Frere Hospital", "043 709 2849"],
  ["dept", "Pharmacy", "Kalafong Hospital", "012 318 4417"],
  ["dept", "Casualty", "Dora Nginza Hospital", "041 406 4362"],
  ["dept", "Casualty", "Karl Bremer Hospital", "021 918 1645"],
  ["dept", "Blood Bank", "King Edward VIII", "031 360 3307"],
  ["dept", "Theatre Bookings", "George Regional Hospital", "044 802 4417"],
  ["dept", "Pathology Lab", "Pelonomi Academic Hospital", "051 405 1950"],
].map(([kind, name, where, num]) => ({ kind, name, where, num, ext: num.slice(-4) }));

const DEMO = { ward: "ICU", dept: "Radiology", ext: "4417" };
const q = $("#q"), rows = $("#rows"), none = $("#none");
const tabs = [...document.querySelectorAll(".leaf-tabs button")];
let mode = "ward";

function mark(text, term) {
  if (!term) return esc(text);
  const i = text.toLowerCase().indexOf(term.toLowerCase());
  if (i < 0) return esc(text);
  return esc(text.slice(0, i)) + "<mark>" + esc(text.slice(i, i + term.length)) + "</mark>" + esc(text.slice(i + term.length));
}

function render() {
  const term = q.value.trim();
  const t = term.toLowerCase();
  const num = /^\d+$/.test(t);
  const page = num ? LISTINGS : LISTINGS.filter((l) => l.kind === mode);
  const match = (l) => !t || (num ? l.ext.startsWith(t) : l.name.toLowerCase().includes(t));
  const hits = page.filter(match);
  // The whole page stays printed; lines that don't match fade back.
  const shown = (num ? [...hits, ...page.filter((l) => !match(l))] : page).slice(0, 8);
  rows.innerHTML = shown.map((l) => `
    <li class="row${match(l) ? "" : " dim"}">
      <span class="row-name">${mark(l.name, num ? "" : term)}<small>${esc(l.where)}</small></span>
      <span class="row-dots" aria-hidden="true"></span>
      <span class="num">${num ? "Ext " + mark(l.ext, term) : l.num}</span>
      <button class="row-call" type="button" aria-label="Call ${esc(l.name)}, ${esc(l.where)}"${match(l) ? "" : ' tabindex="-1"'}><svg aria-hidden="true" width="18" height="18"><use href="img/icons.svg#phone"/></svg></button>
    </li>`).join("");
  none.hidden = hits.length > 0;
  $("#guide-a").textContent = hits[0] ? hits[0].name : "";
  $("#guide-b").textContent = hits.length > 1 ? hits[hits.length - 1].name : "";
}

// Tap the phone: show what the app would do, without dialling a made-up number.
rows.addEventListener("click", (e) => {
  const b = e.target.closest(".row-call");
  if (!b) return;
  const row = b.closest(".row");
  if (row.querySelector(".row-note")) return;
  b.dataset.ringing = "";
  row.insertAdjacentHTML("beforeend", '<span class="row-note">In the app, this rings. This one is made up.</span>');
  setTimeout(() => { delete b.dataset.ringing; row.querySelector(".row-note")?.remove(); }, 2600);
});

function setMode(m) {
  mode = m;
  tabs.forEach((b) => b.setAttribute("aria-selected", String(b.dataset.mode === m)));
}

// The search types by itself until the visitor takes over.
let auto = !still, timer;
const wait = (ms) => new Promise((r) => (timer = setTimeout(r, ms)));
async function typeOut(text) {
  q.value = ""; render();
  for (const ch of text) { if (!auto) return; await wait(110); q.value += ch; render(); }
}
async function demo() {
  const order = ["ward", "dept", "ext"];
  for (let i = 0; auto; i = (i + 1) % 3) {
    setMode(order[i]);
    await typeOut(DEMO[order[i]]);
    if (!auto) return;
    await wait(2600);
  }
}
function takeOver() { auto = false; clearTimeout(timer); }
q.addEventListener("input", () => { takeOver(); render(); });
q.addEventListener("focus", takeOver);
tabs.forEach((b) => b.addEventListener("click", () => {
  takeOver(); setMode(b.dataset.mode); q.value = DEMO[b.dataset.mode]; render();
}));

q.value = DEMO.ward; render();
if (auto) setTimeout(demo, 1400);

/* ---------- A to Z ---------- */
const HOSPITALS = [
  "Addington Hospital Durban", "Beaufort West Hospital", "Caledon Provincial Hospital", "Cecilia Makiwane Hospital",
  "Chris Hani Baragwanath Academic Hospital", "Dora Nginza Hospital", "Dr Pixley Ka Isaka Seme Hospital", "Du Noon CHC",
  "Edendale Hospital", "Edenvale Hospital", "Eerste River Hospital", "Evander Hospital", "False Bay Hospital",
  "Frere Hospital", "George Regional Hospital", "Groote Schuur Hospital", "Heideveld Emergency Centre",
  "Helen Joseph Hospital", "Inanda C Community Health Centre", "Inkosi Albert Luthuli Central Hospital",
  "Kalafong Hospital", "Karl Bremer Hospital", "Khayelitsha District Hospital", "King Dinuzulu Hospital",
  "King Edward VIII", "Klerksdorp Hospital", "Lentegeur Hospital", "Livingstone Hospital", "Madwaleni Hospital",
  "Mahatma Gandhi Hospital", "Mahikeng Provincial Hospital", "Mankweng Hospital", "Mapulaneng Hospital",
  "Medicare Rustenburg", "Mitchells Plain District Hospital", "Mowbray Maternity Hospital",
  "Nelson Mandela Academic Hospital", "New Somerset Hospital", "Niemeyer Memorial Hospital", "Northdale Hospital",
  "Oudtshoorn Hospital", "Paarl Provincial Hospital", "Pelonomi Academic Hospital", "Pelonomi Regional Hospital",
  "Pholosong Hospital", "Pietersburg (Polokwane) Hospital", "Port Elizabeth Provincial Hospital",
  "Port Shepstone Regional Hospital", "Prince Mshiyeni Memorial Hospital", "Red Cross War Memorial Children's Hospital",
  "RK Khan Hospital", "Rob Ferreira Hospital", "Robert Mangaliso Sobukwe Hospital", "Sabie Hospital",
  "Sebokeng Hospital", "Shongwe Hospital", "Stikland Hospital", "Taung District Hospital", "Tembisa Provincial Hospital",
  "Thelle Mogoerane Regional Hospital", "Themba Hospital", "Tshepong Hospital", "Tygerberg Hospital",
  "Uitenhage Provincial Hospital", "Universitas Academic Hospital", "Victoria Hospital", "Wentworth Hospital",
  "Witbank Hospital", "Worcester Provincial Hospital",
];
const byLetter = {};
HOSPITALS.forEach((h) => (byLetter[h[0]] ||= []).push(h));
const letters = Object.keys(byLetter).sort();
// Letters share a page, like a printed directory: up to eighteen names a page.
const PAGES = [];
letters.forEach((l) => {
  const last = PAGES[PAGES.length - 1];
  if (last && last.count + byLetter[l].length <= 18) { last.letters.push(l); last.count += byLetter[l].length; }
  else PAGES.push({ letters: [l], count: byLetter[l].length });
});
const pageOf = (l) => PAGES.findIndex((p) => p.letters.includes(l));
const cuts = $("#az-cuts"), page = $("#az-page");
cuts.innerHTML = letters.map((l) => `<button role="tab" type="button" aria-selected="false" aria-label="${l}, ${byLetter[l].length} hospital${byLetter[l].length > 1 ? "s" : ""}">${l}</button>`).join("");
const cutBtns = [...cuts.children];

function fill(letter) {
  const pg = PAGES[pageOf(letter)], ls = pg.letters;
  const names = ls.flatMap((l) => byLetter[l]);
  $("#az-letter").textContent = ls.length > 1 ? `${ls[0]}-${ls[ls.length - 1]}` : ls[0];
  $("#az-guide").textContent = `${names[0]} to ${names[names.length - 1]}`;
  $("#az-names").innerHTML = ls.map((l) => `<li class="az-group${l === letter ? " on" : ""}"><b>${l}</b><ul>${byLetter[l].map((h) => `<li>${esc(h)}</li>`).join("")}</ul></li>`).join("");
  cutBtns.forEach((b) => b.setAttribute("aria-selected", String(b.textContent === letter)));
}
let current = "A", turning = false;
async function turnTo(letter) {
  if (letter === current || turning) return;
  const samePage = pageOf(letter) === pageOf(current);
  const forward = letter > current;
  current = letter;
  if (samePage || still || !page.animate) return fill(letter);
  turning = true;
  const narrow = matchMedia("(max-width: 860px)").matches;
  const axis = narrow ? "rotateX" : "rotateY";
  await page.animate([{ transform: `${axis}(0)`, opacity: 1 }, { transform: `${axis}(${forward ? -70 : 70}deg)`, opacity: 0 }],
    { duration: 240, easing: "cubic-bezier(.5,0,.75,0)" }).finished;
  fill(letter);
  await page.animate([{ transform: `${axis}(${forward ? 35 : -35}deg)`, opacity: 0 }, { transform: `${axis}(0)`, opacity: 1 }],
    { duration: 420, easing: "cubic-bezier(.16,1,.3,1)" }).finished;
  turning = false;
}
cuts.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) turnTo(b.textContent); });
cuts.addEventListener("keydown", (e) => {
  const i = cutBtns.indexOf(document.activeElement);
  if (i < 0) return;
  const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
  if (!step) return;
  e.preventDefault();
  const n = cutBtns[(i + step + cutBtns.length) % cutBtns.length];
  n.focus(); turnTo(n.textContent);
});
fill("A");

/* ---------- the lift: floors go down, signal drops, the number still comes up ---------- */
const floor = $("#floor"), bars = [...document.querySelectorAll("#bars i")], service = $("#service"), hit = $("#hit");
const FLOORS = [["4", 4], ["3", 4], ["2", 3], ["1", 2], ["G", 1], ["B1", 0], ["B2", 0]];
function showFloor([f, n], last) {
  floor.textContent = f;
  bars.forEach((b, i) => b.classList.toggle("off", i >= n));
  service.textContent = n ? "Signal" : "No service";
  if (last) hit.classList.add("found");
}
let rode = false;
function ride() {
  if (rode) return; rode = true;
  if (still) return showFloor(FLOORS[FLOORS.length - 1], true);
  FLOORS.forEach((f, i) => setTimeout(() => showFloor(f, i === FLOORS.length - 1), i * 520));
}

/* ---------- fixes: put back an older printing ---------- */
let prints = [
  { num: "021 659 5528", when: "Changed today" },
  { num: "021 659 5520", when: "Changed 12 Oct 2026" },
  { num: "021 659 5144", when: "Changed 3 Aug 2026" },
];
const printList = $("#prints");
function drawPrints(fresh) {
  printList.innerHTML = prints.map((p, i) => i === 0
    ? `<li class="print now${fresh ? " fresh" : ""}"><span class="num">${p.num}</span><span class="print-when">${p.when}</span><span class="print-tag">In use</span></li>`
    : `<li class="print${fresh && i === 1 ? " struck" : ""}"><span class="num"><span class="sr">Old number, </span>${p.num}</span><span class="print-when">${p.when}</span>
        <button class="print-back" type="button" data-i="${i}"><svg aria-hidden="true" width="16" height="16"><use href="img/icons.svg#undo"/></svg>Put back</button></li>`).join("");
}
printList.addEventListener("click", (e) => {
  const b = e.target.closest(".print-back");
  if (!b) return;
  const old = prints[+b.dataset.i];
  prints = [{ num: old.num, when: "Put back just now" }, ...prints.map((p, i) => i === 0 ? { ...p, when: p.when.replace("Changed today", "Changed earlier today") } : p)].slice(0, 4);
  drawPrints(true);
  printList.querySelector(".print-back")?.focus();
});
drawPrints(false);

/* ---------- scroll: reveals, the lift, and the thumb index ---------- */
const seen = new IntersectionObserver((entries) => entries.forEach((en) => {
  if (!en.isIntersecting) return;
  en.target.classList.add("in");
  seen.unobserve(en.target);
}), { threshold: 0.15 });
document.querySelectorAll(".reveal").forEach((el) => seen.observe(el));

new IntersectionObserver((entries) => { if (entries[0].isIntersecting) ride(); }, { threshold: 0.45 }).observe($("#offline"));

const thumbs = [...document.querySelectorAll(".thumbs a")];
const spy = new IntersectionObserver((entries) => entries.forEach((en) => {
  if (!en.isIntersecting) return;
  thumbs.forEach((a) => a.setAttribute("aria-current", String(a.dataset.for === en.target.id)));
}), { rootMargin: "-45% 0px -50% 0px" });
document.querySelectorAll("[data-section]").forEach((s) => spy.observe(s));
