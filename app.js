const ends = { 
  "Apollo 11 Lunar Module Descent Stage": 1969, 
  "Apollo 15 Lunar Roving Vehicle": 1971, 
  "Surveyor 3": 1967,
  "Lunokhod 1": 1971, 
  "Viking 1 Lander": 1982, 
  "Viking 2 Lander": 1980, 
  "Mars 3 Lander": 1971,
  "Sojourner and Pathfinder Lander": 1997, 
  "Spirit Rover": 2010,
  "Opportunity Rover": 2018, 
  "Ingenuity Helicopter": 2024 
};
equipment.forEach(e => { e.end = ends[e.name]; });
const order = [...equipment].sort((a, b) => a.year - b.year);
const $ = id => document.getElementById(id);
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const rad = Math.PI / 180;
let world = "Moon", sel = null, query = "", dragging = false, moved = 0, last, target = null, hits = [], t = 0, dpr = 1;
let v = { lon: 0, lat: 10 }, R, cx, cy;
const gc = $("globe"), g = gc.getContext("2d"), sc = $("stars"), s = sc.getContext("2d");

// Procedural craters, fixed to the surface so they rotate with the globe
const rng = seed => () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const craters = {};
["Moon", "Mars"].forEach((w, k) => {
  const r = rng(7 + k * 13);
  craters[w] = Array.from({ length: 90 }, () => ({ lat: Math.asin(2 * r() - 1) / rad, lon: r() * 360 - 180, r: 1.5 + r() * r() * 9 }));
});

function proj(lat, lon) {
  const p = lat * rad, l = (lon - v.lon) * rad, p0 = v.lat * rad;
  return { c: Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l),
    x: cx + R * Math.cos(p) * Math.sin(l),
    y: cy - R * (Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l)) };
}
const shown = () => equipment.filter(e => e.location === world && (e.name + e.mission + e.site).toLowerCase().includes(query));

function curve(f, n) {
  g.beginPath(); let on = false;
  for (let i = 0; i <= n; i++) {
    const p = proj(...f(i));
    if (p.c > 0) { on ? g.lineTo(p.x, p.y) : g.moveTo(p.x, p.y); on = true; } else on = false;
  }
  g.stroke();
}

function drawGlobe() {
  const w = gc.width; R = w * 0.44; cx = cy = w / 2;
  const moon = world === "Moon";
  g.clearRect(0, 0, w, w);
  const base = g.createRadialGradient(cx - R * .35, cy - R * .35, R * .1, cx, cy, R);
  base.addColorStop(0, moon ? "#dcd9d2" : "#e58f62"); base.addColorStop(1, moon ? "#55545a" : "#6a2b1c");
  g.shadowColor = moon ? "rgba(125,211,252,.4)" : "rgba(240,138,93,.4)"; g.shadowBlur = 40 * dpr;
  g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fillStyle = base; g.fill(); g.shadowBlur = 0;
  g.save(); g.beginPath(); g.arc(cx, cy, R, 0, 7); g.clip();
  craters[world].forEach(c => {
    const p = proj(c.lat, c.lon); if (p.c < .05) return;
    const rr = c.r * rad * R;
    g.beginPath(); g.ellipse(p.x, p.y, rr * p.c, rr, Math.atan2(p.y - cy, p.x - cx), 0, 7);
    g.fillStyle = "rgba(0,0,0,.13)"; g.fill(); g.strokeStyle = "rgba(0,0,0,.25)"; g.lineWidth = dpr; g.stroke();
  });
  g.strokeStyle = "rgba(255,255,255,.14)"; g.lineWidth = dpr;
  for (let lo = -180; lo < 180; lo += 30) curve(i => [-90 + i * 3, lo], 60);
  for (let la = -60; la <= 60; la += 30) curve(i => [la, -180 + i * 6], 60);
  const sh = g.createRadialGradient(cx - R * .3, cy - R * .3, R * .25, cx, cy, R * 1.1);
  sh.addColorStop(0, "rgba(5,8,20,0)"); sh.addColorStop(1, "rgba(5,8,20,.78)");
  g.fillStyle = sh; g.fillRect(0, 0, w, w); g.restore();
  hits = [];
  shown().forEach(it => {
    const p = proj(it.lat, it.lon); if (p.c < .02) return;
    hits.push({ it, x: p.x, y: p.y });
    if (it === sel) {
      const k = (t % 60) / 60;
      g.beginPath(); g.arc(p.x, p.y, (9 + k * 20) * dpr, 0, 7); g.strokeStyle = `rgba(255,255,255,${1 - k})`; g.lineWidth = 2 * dpr; g.stroke();
    }
    g.beginPath(); g.arc(p.x, p.y, (it === sel ? 9 : 7) * dpr, 0, 7);
    g.fillStyle = it === sel ? "#fff" : "#38bdf8"; g.fill(); g.strokeStyle = "#fff"; g.lineWidth = 2 * dpr; g.stroke();
  });
}

function drawStars() {
  s.clearRect(0, 0, sc.width, sc.height); s.fillStyle = "#fff";
  stars.forEach(st => {
    if (!reduce) { st.y += st.d; if (st.y > sc.height) st.y = 0; }
    s.globalAlpha = .4 + .6 * Math.abs(Math.sin(st.p + (reduce ? 0 : t * .02)));
    s.fillRect(st.x, st.y, st.r, st.r);
  });
}
let stars = [];
function sizeAll() {
  dpr = devicePixelRatio || 1;
  gc.width = gc.height = Math.round(gc.clientWidth * dpr);
  sc.width = innerWidth; sc.height = innerHeight;
  stars = Array.from({ length: Math.round(innerWidth * innerHeight / 6000) }, () =>
    ({ x: Math.random() * sc.width, y: Math.random() * sc.height, r: Math.random() * 1.4 + .3, p: Math.random() * 6.3, d: Math.random() * .12 + .02 }));
}

function frame() {
  t++;
  if (target) {
    const d = ((target.lon - v.lon + 540) % 360 + 360) % 360 - 180;
    v.lon += d * .08; v.lat += (target.lat - v.lat) * .08;
    if (Math.abs(d) < .2 && Math.abs(target.lat - v.lat) < .2) target = null;
  } else if (!sel && !dragging && !reduce) v.lon += .15;
  v.lon = ((v.lon + 540) % 360 + 360) % 360 - 180;
  drawGlobe(); drawStars(); requestAnimationFrame(frame);
}

function renderPanel() {
  const p = $("panel");
  if (!sel) {
    p.innerHTML = `<h3>Pick an object</h3><p class="muted">Drag the globe and click a glowing pin, choose a site below, or follow the story from the very first landing.</p><button class="primary" data-start>Start the story</button>`;
    return;
  }
  const i = order.indexOf(sel), n = order.length;
  p.innerHTML = `<figure class="photo"><img src="images/${slug(sel.name)}.jpg" alt="${sel.name}" onerror="this.closest('figure').remove()"><figcaption>Image: NASA</figcaption></figure>
    <span class="badge">${sel.status}</span><h3>${sel.name}</h3>
    <dl>${[["Mission", sel.mission], ["Site", sel.site], ["Agency", sel.agency], ["Arrived", sel.year], ["Last contact", sel.lastContact]]
      .map(([k, x]) => `<dt>${k}</dt><dd>${x}</dd>`).join("")}</dl>
    <p class="purpose">${sel.purpose}</p><p>${sel.story}</p>
    <div class="nav"><button data-step="-1">← Earlier</button><span>${i + 1} of ${n}</span><button data-step="1">Later →</button></div>
    <div class="nav"><a class="btn" target="_blank" rel="noopener" href="https://images.nasa.gov/search?q=${encodeURIComponent(sel.name)}">NASA photos</a><button data-share>Copy link</button></div>`;
}

function renderChips() {
  const all = equipment.filter(e => e.location === world), list = shown();
  $("count").textContent = `${list.length} of ${all.length} sites on the ${world}`;
  $("chips").innerHTML = list.length ? list.map(e => `<button class="chip${e === sel ? " on" : ""}" data-s="${slug(e.name)}">${e.name}</button>`).join("")
    : "<p class='muted'>No sites match your search.</p>";
}

function renderChart() {
  const a = 1965, b = 2026, pct = y => (y - a) / (b - a) * 100;
  $("chart").innerHTML = order.map(e => {
    const l = pct(e.year), w = Math.max(pct(e.end) - l, .8), d = e.end - e.year;
    const pos = l > 70 ? `right:${100 - l}%` : `left:${l + w}%`;
    return `<button class="row${e === sel ? " on" : ""}" data-s="${slug(e.name)}" data-planet="${e.location}"><span class="lbl">${e.name}</span>
      <span class="track"><i style="left:${l}%;width:${w}%"></i><b style="${pos}">${d < 1 ? "under a year" : d + " years"}</b></span></button>`;
  }).join("") + `<div class="row axisrow"><span></span><span class="track">${[1970, 1980, 1990, 2000, 2010, 2020]
    .map(y => `<b style="left:${pct(y)}%">${y}</b>`).join("")}</span></div>`;
}

function setWorld(w) {
  world = w; document.body.classList.toggle("mars", w === "Mars");
  document.querySelectorAll(".tabs button").forEach(b => {
    b.classList.toggle("active", b.dataset.world === w); b.setAttribute("aria-pressed", b.dataset.world === w);
  });
}

function select(it, fly = true) {
  sel = it;
  if (it) {
    if (it.location !== world) setWorld(it.location);
    if (fly) target = { lon: it.lon, lat: Math.max(-55, Math.min(55, it.lat)) };
    history.replaceState(null, "", "#" + slug(it.name));
  } else history.replaceState(null, "", location.pathname + location.search);
  renderPanel(); renderChips(); renderChart();
}

const bySlug = x => equipment.find(e => slug(e.name) === x);
const step = d => { const i = order.indexOf(sel); select(order[(i + d + order.length) % order.length]); };
const toGlobe = () => $("globe").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });

document.body.addEventListener("click", e => {
  const b = e.target.closest("[data-start],[data-step],[data-share],[data-s],#start"); if (!b) return;
  if (b.dataset.step) step(+b.dataset.step);
  else if (b.hasAttribute("data-start") || b.id === "start") { select(order[0]); toGlobe(); }
  else if (b.hasAttribute("data-share")) {
    try { navigator.clipboard.writeText(location.href); b.textContent = "Copied!"; } catch (_) { b.textContent = "Copy from address bar"; }
  } else if (b.dataset.s) { select(bySlug(b.dataset.s)); if (b.classList.contains("row")) toGlobe(); }
});
document.querySelectorAll(".tabs button").forEach(b => b.addEventListener("click", () => {
  setWorld(b.dataset.world); v = { lon: 0, lat: 10 }; target = null; select(null);
}));
$("search").addEventListener("input", e => { query = e.target.value.trim().toLowerCase(); renderChips(); });

gc.addEventListener("pointerdown", e => { dragging = true; moved = 0; last = [e.clientX, e.clientY]; target = null; gc.setPointerCapture(e.pointerId); });
gc.addEventListener("pointermove", e => {
  if (!dragging) return;
  const dx = e.clientX - last[0], dy = e.clientY - last[1]; moved += Math.abs(dx) + Math.abs(dy);
  v.lon -= dx * .4; v.lat = Math.max(-70, Math.min(70, v.lat + dy * .3)); last = [e.clientX, e.clientY];
});
gc.addEventListener("pointerup", e => {
  dragging = false; if (moved > 6) return;
  const r = gc.getBoundingClientRect(), x = (e.clientX - r.left) * dpr, y = (e.clientY - r.top) * dpr;
  const h = hits.map(h => ({ h, d: Math.hypot(h.x - x, h.y - y) })).sort((a, b) => a.d - b.d)[0];
  if (h && h.d < 20 * dpr) select(h.h.it, false);
});
document.addEventListener("keydown", e => {
  if (e.target === gc) {
    const k = { ArrowLeft: [-8, 0], ArrowRight: [8, 0], ArrowUp: [0, 6], ArrowDown: [0, -6] }[e.key];
    if (k) { e.preventDefault(); target = null; v.lon += k[0]; v.lat = Math.max(-70, Math.min(70, v.lat + k[1])); }
  } else if (sel && !/INPUT|BUTTON/.test(e.target.tagName)) {
    if (e.key === "ArrowRight") step(1); else if (e.key === "ArrowLeft") step(-1);
  }
});
addEventListener("resize", sizeAll);

const min = Math.min(...equipment.map(e => e.year)), count = w => equipment.filter(e => e.location === w).length;
$("stats").innerHTML = [[equipment.length, "Objects"], [count("Moon"), "On the Moon"], [count("Mars"), "On Mars"],
  [new Date().getFullYear() - min, "Years of heritage"]].map(([n, l]) => `<div><dd>${n}</dd><dt>${l}</dt></div>`).join("");

sizeAll();
const start = bySlug(location.hash.slice(1));
if (start) { setWorld(start.location); select(start); } else select(null);
frame();