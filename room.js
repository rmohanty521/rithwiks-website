// ===== pixel room =====
// world is 640x480 internal pixels (20x15 tiles of 32px), integer-scaled to the window.
// objects are pixel-grid sprites; a future Claude generator just has to output the same
// { pal: {char: "#hex"}, px: ["row strings"] } shape to become placeable.

const PASS_HASH = "a06b51749e8f09be02d4846e183ba9e62545e50a98cbac8f3fe07a419bbb49a5";
const EMAIL_HASHES = [
  "09adbee9f07490754124a595c334eb2f3e5cdf8ca20208ea87a4547ac5ef581e",
  "d9d00b8dab6c06afa52d2b816464b7795d7be60a2d118a64d3348152c7815992",
];

const TILE = 32;
const COLS = 20;
const ROWS = 15;
const W = COLS * TILE;
const H = ROWS * TILE;
const SPEED = 180;

function shade(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = v => Math.max(0, Math.min(255, Math.round(v * f)));
  return `rgb(${c((n >> 16) & 255)},${c((n >> 8) & 255)},${c(n & 255)})`;
}

// ---------- object sprites (16x16 grids, drawn at 2x) ----------
const SPRITES = {
  chair: {
    name: "chair",
    pal: { a: "#7a4a2b", b: "#5c3620", c: "#8f5c38" },
    px: [
      "................",
      "................",
      "....aaaaaaaa....",
      "....abbbbbba....",
      "....abbbbbba....",
      "....abbbbbba....",
      "....aaaaaaaa....",
      "....acccccca....",
      "....aaaaaaaa....",
      "....a......a....",
      "....a......a....",
      "....b......b....",
      "................",
      "................",
      "................",
      "................",
    ],
  },
  table: {
    name: "table",
    pal: { a: "#8f5c38", b: "#5c3620", c: "#a86f45" },
    px: [
      "................",
      "................",
      "................",
      "..aaaaaaaaaaaa..",
      "..acccccccccca..",
      "..aaaaaaaaaaaa..",
      "..b..........b..",
      "..b..........b..",
      "..b..........b..",
      "..b..........b..",
      "................",
      "................",
      "................",
      "................",
      "................",
      "................",
    ],
  },
  plant: {
    name: "plant",
    pal: { g: "#3f9e4d", d: "#2c7038", p: "#b3512f", q: "#8f3f24" },
    px: [
      "................",
      "................",
      "......g..g......",
      ".....gggggg.....",
      "....ggdggdgg....",
      "....gdggggdg....",
      ".....gggggg.....",
      "......gddg......",
      ".......gg.......",
      "......pppp......",
      "......pqqp......",
      "......pqqp......",
      ".......pp.......",
      "................",
      "................",
      "................",
    ],
  },
  lamp: {
    name: "lamp",
    pal: { y: "#f2d98c", o: "#d8a84a", m: "#4a4658", d: "#2c2936" },
    px: [
      "................",
      "......yyyy......",
      ".....yyyyyy.....",
      ".....oyyyyo.....",
      ".....oooooo.....",
      ".......mm.......",
      ".......mm.......",
      ".......mm.......",
      ".......mm.......",
      ".......mm.......",
      "......dmmd......",
      ".....dddddd.....",
      "................",
      "................",
      "................",
      "................",
    ],
  },
  rug: {
    name: "rug",
    pal: { r: "#8b7ed8", s: "#6a5fb8", t: "#b6a8e8" },
    px: [
      "................",
      "................",
      "................",
      "................",
      ".rrrrrrrrrrrrrr.",
      ".rssssssssssssr.",
      ".rsttttttttttsr.",
      ".rstssssssstsr..",
      ".rsttttttttttsr.",
      ".rssssssssssssr.",
      ".rrrrrrrrrrrrrr.",
      "................",
      "................",
      "................",
      "................",
      "................",
    ],
  },
  mirror: {
    name: "mirror",
    pal: { f: "#8a8398", g: "#bcd8e8", w: "#eef8ff", d: "#5c5870" },
    px: [
      "................",
      ".....ffffff.....",
      "....fggggggf....",
      "....fgwggggf....",
      "....fggwgggf....",
      "....fgggwggf....",
      "....fggggwgf....",
      "....fggggggf....",
      "....fggggggf....",
      "....fggggggf....",
      ".....ffffff.....",
      ".......dd.......",
      "......dddd......",
      "................",
      "................",
      "................",
    ],
  },
  shelf: {
    name: "shelf",
    pal: { a: "#7a4a2b", b: "#5c3620", r: "#c25b4a", g: "#4a9e5c", u: "#5b7ac2" },
    px: [
      "................",
      "..aaaaaaaaaaaa..",
      "..a.r.g.u.r..a..",
      "..a.r.g.u.r..a..",
      "..aaaaaaaaaaaa..",
      "..a.u.r.g.g..a..",
      "..a.u.r.g.g..a..",
      "..aaaaaaaaaaaa..",
      "..a.g.u.r.u..a..",
      "..a.g.u.r.u..a..",
      "..aaaaaaaaaaaa..",
      "..b..........b..",
      "................",
      "................",
      "................",
      "................",
    ],
  },
  tv: {
    name: "tv",
    pal: { k: "#1a1826", s: "#3a4a6a", h: "#6a8ac2", d: "#2c2936" },
    px: [
      "................",
      "................",
      "..kkkkkkkkkkkk..",
      "..kssssssssssk..",
      "..kshssssssssk..",
      "..ksssshhssssk..",
      "..kssssssshssk..",
      "..kssssssssssk..",
      "..kkkkkkkkkkkk..",
      ".......kk.......",
      ".....dddddd.....",
      "................",
      "................",
      "................",
      "................",
      "................",
    ],
  },
};

// ---------- character looks ----------
const SKINS = ["#f2d3b3", "#e8c39e", "#c68e5e", "#8a5a3b", "#6b4226"];
const HAIR_COLORS = ["#1a1826", "#4a3020", "#8a5a2b", "#d8a84a", "#c25b4a", "#b6a8e8", "#e8e6f0"];
const HAIR_STYLES = ["short", "spiky", "long", "none"];
const SHIRTS = ["#3a6ea5", "#c25b4a", "#4a9e5c", "#b6a8e8", "#d8a84a", "#e8e6f0", "#2c2936", "#d867a8"];
const PANTS = ["#2c2936", "#3a4a6a", "#5c3620", "#4a4658", "#7a1f2b"];

const DEFAULT_LOOK = { skin: 1, hairStyle: 0, hairColor: 0, shirt: 0, pants: 0 };

function loadLook() {
  try {
    const l = JSON.parse(localStorage.getItem("room_look"));
    return { ...DEFAULT_LOOK, ...l };
  } catch { return { ...DEFAULT_LOOK }; }
}

// character, 24x48, human proportions. (px, py) = top-left. dir 1 = right, -1 = left.
const CHAR_W = 24, CHAR_H = 48;
function drawChar(g, px, py, look, dir, step) {
  const skin = SKINS[look.skin] || SKINS[1];
  const hairC = HAIR_COLORS[look.hairColor] || HAIR_COLORS[0];
  const hairS = HAIR_STYLES[look.hairStyle] || "short";
  const shirt = SHIRTS[look.shirt] || SHIRTS[0];
  const pants = PANTS[look.pants] || PANTS[0];
  const skinD = shade(skin, 0.86);
  const hairD = shade(hairC, 0.72);
  const hairL = shade(hairC, 1.35);
  const shirtD = shade(shirt, 0.78);
  const shirtL = shade(shirt, 1.18);
  const pantsD = shade(pants, 0.75);
  const shoe = "#2a2833";

  const r = (x, y, w, h, c) => {
    g.fillStyle = c;
    g.fillRect(px + (dir === -1 ? CHAR_W - x - w : x), py + y, w, h);
  };

  const s = step % 2;

  // long hair back layer (falls behind shoulders)
  if (hairS === "long") {
    r(5, 5, 2, 24, hairC);
    r(17, 5, 2, 24, hairC);
    r(5, 27, 2, 2, hairD);
    r(17, 27, 2, 2, hairD);
  }

  // legs (walk anim)
  if (s === 0) {
    r(7, 30, 4, 13, pants); r(13, 30, 4, 13, pants);
    r(7, 42, 4, 1, pantsD); r(13, 42, 4, 1, pantsD);
    r(7, 43, 5, 3, shoe); r(13, 43, 5, 3, shoe);
  } else {
    r(7, 30, 4, 11, pants); r(13, 30, 4, 13, pants);
    r(7, 41, 5, 3, shoe); r(13, 43, 5, 3, shoe);
  }
  // hip shading
  r(7, 30, 4, 1, pantsD); r(13, 30, 4, 1, pantsD);

  // torso
  r(6, 16, 12, 14, shirt);
  r(6, 16, 1, 14, shirtD);
  r(6, 29, 12, 1, shirtD);
  r(9, 17, 5, 1, shirtL);
  // collar
  r(9, 16, 6, 1, shirtD);

  // arms + hands
  r(4, 17, 2, 9, shirt);
  r(18, 17, 2, 9, shirt);
  r(4, 25, 2, 1, shirtD);
  r(18, 25, 2, 1, shirtD);
  r(4, 26, 2, 3, skin);
  r(18, 26, 2, 3, skin);

  // neck
  r(10, 13, 4, 3, skinD);

  // head
  r(7, 2, 10, 11, skin);
  r(7, 11, 10, 2, skinD);
  r(7, 2, 1, 11, skinD);

  // hair
  if (hairS === "short") {
    r(6, 0, 12, 4, hairC);
    r(6, 4, 2, 5, hairC);
    r(16, 4, 2, 5, hairC);
    r(8, 4, 3, 1, hairC);
    r(13, 4, 3, 1, hairC);
    r(8, 1, 6, 1, hairL);
    r(6, 8, 2, 1, hairD);
    r(16, 8, 2, 1, hairD);
  } else if (hairS === "spiky") {
    r(6, -1, 2, 3, hairC); r(9, -2, 2, 3, hairC); r(13, -1, 2, 3, hairC); r(16, 0, 2, 2, hairC);
    r(6, 1, 12, 3, hairC);
    r(6, 4, 2, 4, hairC);
    r(16, 4, 2, 4, hairC);
    r(9, 4, 2, 1, hairC); r(13, 4, 2, 1, hairC);
    r(8, 2, 4, 1, hairL);
  } else if (hairS === "long") {
    r(6, 0, 12, 4, hairC);
    r(6, 4, 2, 7, hairC);
    r(16, 4, 2, 7, hairC);
    r(8, 4, 4, 2, hairC);
    r(13, 4, 3, 2, hairC);
    r(8, 1, 6, 1, hairL);
  }

  // eyes
  r(9, 6, 2, 1, "#2a2833");
  r(13, 6, 2, 1, "#2a2833");
  r(9, 7, 2, 2, "#ffffff");
  r(13, 7, 2, 2, "#ffffff");
  r(10, 7, 1, 2, "#3a3050");
  r(14, 7, 1, 2, "#3a3050");

  // blush + mouth
  r(8, 10, 1, 1, "#eda3b2");
  r(15, 10, 1, 1, "#eda3b2");
  r(11, 11, 2, 1, "#b06a6a");
}

// ---------- state ----------
// stable per-browser id so refreshing replaces your node instead of ghosting a duplicate
const myId = localStorage.getItem("room_pid") || "p_" + Math.random().toString(36).slice(2, 9);
localStorage.setItem("room_pid", myId);
let myName = localStorage.getItem("room_name") || "";
let myLook = loadLook();
const me = { x: W / 2, y: 360, dir: 1, moving: false, step: 0 };
const remotes = {};
let objects = {};
let buildOpen = false;
let nearWardrobe = false;
let selected = null;
let hoverTile = null;
let online = false;
let db = null, refs = null;

// ---------- canvas ----------
const canvas = document.getElementById("game");
canvas.width = W;
canvas.height = H;
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = false;

let scale = 1;
function fit() {
  // fill the window (fractional scale, keeps the whole room visible)
  scale = Math.min(window.innerWidth / W, window.innerHeight / H);
  canvas.style.width = Math.round(W * scale) + "px";
  canvas.style.height = Math.round(H * scale) + "px";
}
window.addEventListener("resize", fit);
fit();

// ---------- firebase ----------
const cfg = window.FIREBASE_CONFIG;
const hasConfig = cfg && cfg.apiKey && cfg.apiKey !== "PASTE_ME";

async function connect() {
  if (!hasConfig) {
    document.getElementById("offlineNote").style.display = "block";
    updateHud();
    return;
  }
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js");
  const fdb = await import("https://www.gstatic.com/firebasejs/10.13.2/firebase-database.js");
  const app = initializeApp(cfg);
  db = fdb.getDatabase(app);
  refs = {
    me: fdb.ref(db, `room/players/${myId}`),
    players: fdb.ref(db, "room/players"),
    objects: fdb.ref(db, "room/objects"),
  };
  fdb.onDisconnect(refs.me).remove();

  fdb.onValue(refs.players, snap => {
    const data = snap.val() || {};
    for (const id of Object.keys(remotes)) if (!data[id]) delete remotes[id];
    for (const [id, p] of Object.entries(data)) {
      if (id === myId) continue;
      if (!remotes[id]) remotes[id] = { ...p, tx: p.x, ty: p.y, step: 0 };
      else Object.assign(remotes[id], { tx: p.x, ty: p.y, dir: p.dir, moving: p.moving, name: p.name, look: p.look, noting: p.noting });
    }
    updateHud();
  });

  fdb.onValue(refs.objects, snap => { objects = snap.val() || {}; });

  const chatRef = fdb.ref(db, "room/chat");
  fdb.onChildAdded(fdb.query(chatRef, fdb.limitToLast(30)), snap => {
    const m = snap.val();
    if (!m || !m.text) return;
    addChatMessage(m.name, m.text);
    if (Date.now() - (m.ts || 0) < 10000) {
      if (m.id === myId) bubbles[myId] = { text: m.text, until: performance.now() + 5000 };
      else bubbles[m.id] = { text: m.text, until: performance.now() + 5000 };
    }
  });
  refs.chat = chatRef;

  online = true;
  window._fdb = fdb;

  fdb.onValue(fdb.ref(db, "room/sprites"), snap => {
    const data = snap.val() || {};
    let changed = false;
    for (const [k, s] of Object.entries(data)) {
      if (!SPRITES[k] && validSprite(s)) { SPRITES[k] = s; changed = true; }
    }
    if (changed) {
      try {
        const cs = JSON.parse(localStorage.getItem("room_sprites")) || {};
        Object.assign(cs, data);
        localStorage.setItem("room_sprites", JSON.stringify(cs));
      } catch {}
      buildPanelUI();
    }
  });

  const notesRef = fdb.ref(db, "room/notes");
  fdb.onValue(notesRef, snap => {
    const data = snap.val() || {};
    let changed = false;
    for (const [id, n] of Object.entries(data)) {
      const local = notes.find(x => x.id === id);
      if (!local) { notes.push(n); changed = true; }
      else if ((n.updated || 0) > (local.updated || 0)) { Object.assign(local, n); changed = true; }
    }
    if (changed) {
      try { localStorage.setItem("room_notes", JSON.stringify(notes)); } catch {}
      renderNotesList();
      if (curNote && data[curNote.id] && !noteDirty) openNote(curNote.id);
    }
  });

  pushMe(true);
}

let lastPush = 0;
let lastSent = null;
function pushMe(force) {
  if (!online) return;
  const now = performance.now();
  if (!force && now - lastPush < 80) return;
  const state = { name: myName, look: myLook, x: Math.round(me.x), y: Math.round(me.y), dir: me.dir, moving: me.moving, noting: notesOpen() };
  const key = JSON.stringify(state);
  if (!force && key === lastSent) return;
  lastPush = now; lastSent = key;
  window._fdb.set(refs.me, state);
}

function setObject(tx, ty, type) {
  const key = `${tx}_${ty}`;
  if (online) {
    const r = window._fdb.ref(db, `room/objects/${key}`);
    type ? window._fdb.set(r, { type }) : window._fdb.remove(r);
  } else {
    if (type) objects[key] = { type };
    else delete objects[key];
  }
}

// ---------- chat ----------
const chatInput = document.getElementById("chatInput");
const chatLog = document.getElementById("chatLog");
const bubbles = {}; // player id -> {text, until}

function addChatMessage(name, text) {
  const div = document.createElement("div");
  div.className = "msg";
  const b = document.createElement("b");
  b.textContent = name + ": ";
  div.appendChild(b);
  div.appendChild(document.createTextNode(text));
  chatLog.appendChild(div);
  while (chatLog.children.length > 30) chatLog.removeChild(chatLog.firstChild);
  chatLog.scrollTop = chatLog.scrollHeight;
}

function sendChat() {
  const text = chatInput.value.trim().slice(0, 120);
  chatInput.value = "";
  chatInput.blur();
  if (!text) return;
  if (online) {
    window._fdb.push(refs.chat, { id: myId, name: myName, text, ts: Date.now() });
  } else {
    addChatMessage(myName, text);
    bubbles[myId] = { text, until: performance.now() + 5000 };
  }
}

// ---------- hud ----------
function updateHud() {
  document.getElementById("hudName").textContent = myName;
  const others = Object.values(remotes).map(r => r.name).filter(Boolean);
  document.getElementById("hudPlayers").textContent =
    others.length ? "with: " + others.join(", ") : (online ? "alone in here" : "");
}

// ---------- password gate ----------
const passOverlay = document.getElementById("passOverlay");
const emailInput = document.getElementById("emailInput");
const passInput = document.getElementById("passInput");
const passError = document.getElementById("passError");

async function sha256(text) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}

async function tryUnlock() {
  const emailHash = await sha256(emailInput.value.trim().toLowerCase());
  const passHash = await sha256(passInput.value);
  if (EMAIL_HASHES.includes(emailHash) && passHash === PASS_HASH) {
    localStorage.setItem("room_pass_ok", emailHash + ":" + passHash);
    passOverlay.style.display = "none";
    afterUnlock();
  } else {
    passError.textContent = "not on the list";
    passInput.value = "";
  }
}

function gate() {
  const saved = (localStorage.getItem("room_pass_ok") || "").split(":");
  if (EMAIL_HASHES.includes(saved[0]) && saved[1] === PASS_HASH) { afterUnlock(); return; }
  passOverlay.style.display = "flex";
  emailInput.focus();
  document.getElementById("passGo").onclick = tryUnlock;
  const onEnter = e => { if (e.key === "Enter") tryUnlock(); };
  emailInput.onkeydown = onEnter;
  passInput.onkeydown = onEnter;
}

function afterUnlock() {
  if (myName) { updateHud(); connect(); }
  else openCustomize();
}

// ---------- customization ----------
const custOverlay = document.getElementById("custOverlay");
const custRows = document.getElementById("custRows");
const nameInput = document.getElementById("nameInput");
const preview = document.getElementById("custPreview");
const pctx = preview.getContext("2d");
pctx.imageSmoothingEnabled = false;
let started = false;

function renderPreview() {
  pctx.clearRect(0, 0, CHAR_W, CHAR_H + 2);
  drawChar(pctx, 0, 2, myLook, 1, 0);
}

function buildCustUI() {
  custRows.innerHTML = "";
  const swatchRow = (labelText, colors, key) => {
    const row = document.createElement("div");
    row.className = "cust-row";
    const label = document.createElement("label");
    label.textContent = labelText;
    row.appendChild(label);
    colors.forEach((c, i) => {
      const b = document.createElement("button");
      b.className = "swatch" + (myLook[key] === i ? " sel" : "");
      b.style.background = c;
      b.onclick = () => { myLook[key] = i; buildCustUI(); renderPreview(); };
      row.appendChild(b);
    });
    custRows.appendChild(row);
  };
  const row = document.createElement("div");
  row.className = "cust-row";
  const label = document.createElement("label");
  label.textContent = "hair";
  row.appendChild(label);
  HAIR_STYLES.forEach((s, i) => {
    const b = document.createElement("button");
    b.className = "style-btn" + (myLook.hairStyle === i ? " sel" : "");
    b.textContent = s;
    b.onclick = () => { myLook.hairStyle = i; buildCustUI(); renderPreview(); };
    row.appendChild(b);
  });
  custRows.appendChild(row);
  swatchRow("hair color", HAIR_COLORS, "hairColor");
  swatchRow("skin", SKINS, "skin");
  swatchRow("shirt", SHIRTS, "shirt");
  swatchRow("pants", PANTS, "pants");
}

function openCustomize() {
  buildCustUI();
  renderPreview();
  nameInput.value = myName;
  custOverlay.style.display = "flex";
  if (!myName) nameInput.focus();
}

function saveCustomize() {
  myName = nameInput.value.trim().slice(0, 12) || "???";
  localStorage.setItem("room_name", myName);
  localStorage.setItem("room_look", JSON.stringify(myLook));
  custOverlay.style.display = "none";
  updateHud();
  if (!started) { started = true; connect(); }
  else pushMe(true);
}

document.getElementById("custGo").onclick = saveCustomize;
nameInput.addEventListener("keydown", e => { if (e.key === "Enter") saveCustomize(); });

gate();

// ---------- build panel ----------
const panel = document.getElementById("buildPanel");

function validSprite(s) {
  return !!(s && typeof s === "object" && s.pal && typeof s.pal === "object" &&
    Array.isArray(s.px) && s.px.length && s.px.every(r => typeof r === "string"));
}

// custom AI-generated sprites persist locally and sync via Firebase room/sprites
try {
  const cs = JSON.parse(localStorage.getItem("room_sprites")) || {};
  for (const [k, s] of Object.entries(cs)) if (validSprite(s)) SPRITES[k] = s;
} catch {}

function saveCustomSprite(key, spr) {
  let cs = {};
  try { cs = JSON.parse(localStorage.getItem("room_sprites")) || {}; } catch {}
  cs[key] = spr;
  try { localStorage.setItem("room_sprites", JSON.stringify(cs)); } catch {}
  if (online) window._fdb.set(window._fdb.ref(db, `room/sprites/${key}`), spr);
}

async function geminiSprite(desc) {
  const sys = 'You design 16x16 pixel art sprites for a cozy pixel bedroom game with a warm stardew-valley palette. Reply ONLY with JSON in this exact shape: {"name": "short name", "pal": {"a": "#hex", "b": "#hex"}, "px": [16 strings, each exactly 16 characters]}. Rules: palette keys are single lowercase letters; "." means transparent; every non-"." character in px must exist in pal; use 2-3 shades per material plus a dark outline shade; the object sits on the bottom of the tile with the outer edge mostly transparent; name is lowercase, 10 chars max.';
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": window.GEMINI_KEY },
    body: JSON.stringify({
      contents: [{ parts: [{ text: sys + "\n\nObject to draw: " + desc }] }],
      generationConfig: { responseMimeType: "application/json" },
    }),
  });
  if (!res.ok) throw new Error("api error " + res.status);
  const data = await res.json();
  const text = (data.candidates && data.candidates[0] && data.candidates[0].content.parts.map(p => p.text || "").join("")) || "";
  const spr = JSON.parse(text);
  if (!validSprite(spr)) throw new Error("bad sprite data");
  spr.px = spr.px.slice(0, 16).map(r => (r + "................").slice(0, 16));
  while (spr.px.length < 16) spr.px.unshift("................");
  spr.name = String(spr.name || desc).toLowerCase().slice(0, 10);
  return spr;
}

let generating = false;
async function generateObject() {
  if (generating) return;
  const desc = prompt("describe an object to create:");
  if (!desc || !desc.trim()) return;
  generating = true;
  const aiBtn = document.getElementById("aiGenBtn");
  if (aiBtn) aiBtn.querySelector("span").textContent = "making…";
  try {
    const spr = await geminiSprite(desc.trim());
    const key = "ai_" + Date.now().toString(36);
    SPRITES[key] = spr;
    saveCustomSprite(key, spr);
    selected = key;
  } catch (err) {
    alert("couldn't generate that: " + err.message);
  }
  generating = false;
  buildPanelUI();
}

function buildPanelUI() {
  panel.innerHTML = "";
  for (const [key, spr] of Object.entries(SPRITES)) {
    const btn = document.createElement("button");
    btn.className = "build-item" + (selected === key ? " sel" : "");
    const c = document.createElement("canvas");
    c.width = 16; c.height = 16;
    drawSprite(c.getContext("2d"), spr, 0, 0, 1);
    const label = document.createElement("span");
    label.textContent = spr.name;
    btn.append(c, label);
    btn.onclick = () => {
      selected = selected === key ? null : key;
      for (const el of panel.children) el.classList.remove("sel");
      if (selected) btn.classList.add("sel");
    };
    panel.appendChild(btn);
  }
  const ai = document.createElement("button");
  ai.className = "build-item";
  ai.id = "aiGenBtn";
  const spark = document.createElement("div");
  spark.textContent = "✨";
  spark.style.cssText = "font-size:18px;height:32px;line-height:32px;";
  const label = document.createElement("span");
  label.textContent = "make new";
  ai.append(spark, label);
  ai.onclick = generateObject;
  panel.appendChild(ai);
}
buildPanelUI();

function toggleBuild() {
  buildOpen = !buildOpen;
  panel.classList.toggle("open", buildOpen);
  if (!buildOpen) { selected = null; for (const el of panel.children) el.classList.remove("sel"); }
}

// ---------- notes ----------
const notesPanel = document.getElementById("notesPanel");
const notesListEl = document.getElementById("notesList");
const noteTitle = document.getElementById("noteTitle");
const noteText = document.getElementById("noteText");
const paperEl = document.getElementById("paper");
const inkCanvas = document.getElementById("noteInk");
const inkCtx = inkCanvas.getContext("2d");
const INK_SCALE = 2; // canvas internal px per CSS px
const INK_COLORS = ["#26233a", "#c25b4a", "#3a6ea5", "#4a9e5c", "#d867a8"];
const PAGE_H = 960; // starting paper height, grows as needed
let paperH = PAGE_H;

// grow the paper without losing what's drawn (canvas resize clears it)
function setPaperHeight(h) {
  h = Math.max(PAGE_H, Math.ceil(h));
  if (h === paperH && inkCanvas.height === h * INK_SCALE) return;
  const saved = document.createElement("canvas");
  saved.width = inkCanvas.width;
  saved.height = inkCanvas.height;
  saved.getContext("2d").drawImage(inkCanvas, 0, 0);
  paperH = h;
  paperEl.style.height = h + "px";
  inkCanvas.style.height = h + "px";
  inkCanvas.height = h * INK_SCALE;
  inkCtx.drawImage(saved, 0, 0);
}

function growForText() {
  if (noteText.scrollHeight > noteText.clientHeight) setPaperHeight(noteText.scrollHeight + PAGE_H / 2);
}

let notes = [];
try { notes = JSON.parse(localStorage.getItem("room_notes")) || []; } catch {}
let curNote = null;
let inkColor = INK_COLORS[0];
let inkTool = "pen";
let drawMode = false;
let noteDirty = false;
let inkDirty = false;
let saveTimer = null;
let stroking = false;
let lastPt = null;

function notesOpen() { return notesPanel.classList.contains("open"); }

function persistNotes(pushCur) {
  try { localStorage.setItem("room_notes", JSON.stringify(notes)); } catch {}
  if (pushCur && curNote && online) {
    window._fdb.set(window._fdb.ref(db, `room/notes/${curNote.id}`), curNote);
  }
}

function scheduleSave() {
  if (!curNote) return;
  noteDirty = true;
  curNote.updated = Date.now();
  clearTimeout(saveTimer);
  saveTimer = setTimeout(flushSave, 500);
}

function flushSave() {
  clearTimeout(saveTimer);
  if (!curNote || !noteDirty) return;
  curNote.title = noteTitle.value.trim();
  curNote.text = noteText.value;
  if (inkDirty) { curNote.ink = inkCanvas.toDataURL(); inkDirty = false; }
  noteDirty = false;
  persistNotes(true);
  renderNotesList();
}

function sortedNotes() { return [...notes].sort((a, b) => (b.updated || 0) - (a.updated || 0)); }

function renderNotesList() {
  notesListEl.innerHTML = "";
  for (const n of sortedNotes()) {
    const b = document.createElement("button");
    b.className = "note-item" + (curNote && n.id === curNote.id ? " sel" : "");
    b.textContent = n.title || "untitled";
    b.onclick = () => { flushSave(); openNote(n.id); };
    notesListEl.appendChild(b);
  }
}

function clearInk() { inkCtx.clearRect(0, 0, inkCanvas.width, inkCanvas.height); }

function loadInk(dataUrl) {
  clearInk();
  if (!dataUrl) return;
  const img = new Image();
  img.onload = () => {
    const needed = img.height / INK_SCALE;
    if (needed > paperH) setPaperHeight(needed);
    inkCtx.drawImage(img, 0, 0);
  };
  img.src = dataUrl;
}

function openNote(id) {
  const n = notes.find(x => x.id === id);
  if (!n) return;
  curNote = n;
  noteTitle.value = n.title || "";
  noteText.value = n.text || "";
  paperH = 0;
  setPaperHeight(PAGE_H);
  growForText();
  loadInk(n.ink);
  renderNotesList();
}

function newNote() {
  flushSave();
  const n = { id: "n_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6), title: "", text: "", ink: "", updated: Date.now() };
  notes.push(n);
  persistNotes(false);
  openNote(n.id);
  noteTitle.focus();
}

function openNotes() {
  notesPanel.classList.add("open");
  for (const k of Object.keys(keys)) keys[k] = false;
  if (!curNote) {
    if (notes.length) openNote(sortedNotes()[0].id);
    else newNote();
  }
}

function closeNotes() {
  flushSave();
  notesPanel.classList.remove("open");
}

function setDrawMode(on) {
  drawMode = on;
  notesPanel.classList.toggle("drawing", on);
  document.getElementById("modeType").classList.toggle("sel", !on);
  document.getElementById("modeDraw").classList.toggle("sel", on);
}

function setTool(t) {
  inkTool = t;
  document.getElementById("toolPen").classList.toggle("sel", t === "pen");
  document.getElementById("toolEraser").classList.toggle("sel", t === "eraser");
}

const inkColorsEl = document.getElementById("inkColors");
INK_COLORS.forEach(c => {
  const b = document.createElement("button");
  b.className = "ink-swatch" + (c === inkColor ? " sel" : "");
  b.style.background = c;
  b.onclick = () => {
    inkColor = c;
    setTool("pen");
    for (const el of inkColorsEl.children) el.classList.toggle("sel", el === b);
  };
  inkColorsEl.appendChild(b);
});

function inkPoint(e) {
  const r = inkCanvas.getBoundingClientRect();
  return {
    x: (e.clientX - r.left) * inkCanvas.width / r.width,
    y: (e.clientY - r.top) * inkCanvas.height / r.height,
  };
}

function drawSeg(a, b, pressure) {
  inkCtx.lineCap = "round";
  inkCtx.lineJoin = "round";
  if (inkTool === "eraser") {
    inkCtx.globalCompositeOperation = "destination-out";
    inkCtx.lineWidth = 24 * INK_SCALE;
  } else {
    inkCtx.globalCompositeOperation = "source-over";
    inkCtx.strokeStyle = inkColor;
    inkCtx.lineWidth = (1.4 + (pressure || 0.5) * 1.6) * INK_SCALE;
  }
  inkCtx.beginPath();
  inkCtx.moveTo(a.x, a.y);
  inkCtx.lineTo(b.x, b.y);
  inkCtx.stroke();
}

inkCanvas.addEventListener("pointerdown", e => {
  if (!drawMode) return;
  e.preventDefault();
  inkCanvas.setPointerCapture(e.pointerId);
  stroking = true;
  lastPt = inkPoint(e);
  drawSeg(lastPt, lastPt, e.pressure);
});
inkCanvas.addEventListener("pointermove", e => {
  if (!stroking) return;
  e.preventDefault();
  const pt = inkPoint(e);
  if (pt.y / INK_SCALE > paperH - 100) setPaperHeight(paperH + PAGE_H / 2);
  drawSeg(lastPt, pt, e.pressure);
  lastPt = pt;
});
const endStroke = () => {
  if (!stroking) return;
  stroking = false;
  inkDirty = true;
  scheduleSave();
};
inkCanvas.addEventListener("pointerup", endStroke);
inkCanvas.addEventListener("pointercancel", endStroke);

function noteFileName() {
  const base = (curNote.title || "note").replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "_") || "note";
  return base + "_" + new Date().toISOString().slice(0, 10);
}

function downloadUrl(url, name) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
}

function wrapText(g, text, maxW) {
  const out = [];
  for (const para of text.split("\n")) {
    let line = "";
    for (const word of para.split(" ")) {
      const t = line ? line + " " + word : word;
      if (g.measureText(t).width > maxW && line) { out.push(line); line = word; }
      else line = t;
    }
    out.push(line);
  }
  return out;
}

function exportPng() {
  if (!curNote) return;
  flushSave();
  const c = document.createElement("canvas");
  c.width = inkCanvas.width;
  c.height = inkCanvas.height;
  const g = c.getContext("2d");
  g.fillStyle = "#f7f5ef";
  g.fillRect(0, 0, c.width, c.height);
  g.scale(INK_SCALE, INK_SCALE);
  g.fillStyle = "#26233a";
  g.font = "15px 'JetBrains Mono', monospace";
  const lines = wrapText(g, curNote.text || "", 720 - 48);
  lines.forEach((ln, i) => g.fillText(ln, 24, 24 + 17 + i * 24));
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.drawImage(inkCanvas, 0, 0);
  downloadUrl(c.toDataURL("image/png"), noteFileName() + ".png");
}

function exportTxt() {
  if (!curNote) return;
  flushSave();
  const blob = new Blob([(curNote.title || "untitled") + "\n\n" + (curNote.text || "")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  downloadUrl(url, noteFileName() + ".txt");
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function deleteNote() {
  if (!curNote) return;
  if (!confirm("delete this note?")) return;
  const id = curNote.id;
  notes = notes.filter(n => n.id !== id);
  if (online) window._fdb.remove(window._fdb.ref(db, `room/notes/${id}`));
  curNote = null;
  noteDirty = false;
  inkDirty = false;
  persistNotes(false);
  noteTitle.value = "";
  noteText.value = "";
  clearInk();
  if (notes.length) openNote(sortedNotes()[0].id);
  else newNote();
  renderNotesList();
}

document.getElementById("notesBtn").onclick = openNotes;
document.getElementById("notesClose").onclick = closeNotes;
document.getElementById("noteNew").onclick = newNote;
document.getElementById("modeType").onclick = () => setDrawMode(false);
document.getElementById("modeDraw").onclick = () => setDrawMode(true);
document.getElementById("toolPen").onclick = () => setTool("pen");
document.getElementById("toolEraser").onclick = () => setTool("eraser");
document.getElementById("exportPng").onclick = exportPng;
document.getElementById("exportTxt").onclick = exportTxt;
document.getElementById("noteDelete").onclick = deleteNote;
noteTitle.addEventListener("input", scheduleSave);
noteText.addEventListener("input", () => { growForText(); scheduleSave(); });

// ---------- input ----------
const keys = {};
function overlaysOpen() {
  return passOverlay.style.display !== "none" || custOverlay.style.display !== "none";
}
window.addEventListener("keydown", e => {
  if (notesOpen()) {
    if (e.key === "Escape") closeNotes();
    return;
  }
  if (overlaysOpen()) return;
  if (document.activeElement === chatInput) {
    if (e.key === "Enter") sendChat();
    if (e.key === "Escape") chatInput.blur();
    return;
  }
  if (e.key === "Enter") { e.preventDefault(); chatInput.focus(); return; }
  keys[e.key.toLowerCase()] = true;
  if (e.key.toLowerCase() === "b") toggleBuild();
  if (e.key.toLowerCase() === "n") openNotes();
  if (e.key.toLowerCase() === "e" && nearWardrobe) openCustomize();
});
window.addEventListener("keyup", e => { keys[e.key.toLowerCase()] = false; });

canvas.addEventListener("mousemove", e => {
  const r = canvas.getBoundingClientRect();
  const tx = Math.floor((e.clientX - r.left) / scale / TILE);
  const ty = Math.floor((e.clientY - r.top) / scale / TILE);
  hoverTile = (tx >= 1 && tx < COLS - 1 && ty >= 3 && ty < ROWS) ? { tx, ty } : null;
});
canvas.addEventListener("mouseleave", () => { hoverTile = null; });
canvas.addEventListener("click", () => {
  if (buildOpen && selected && hoverTile) setObject(hoverTile.tx, hoverTile.ty, selected);
});
canvas.addEventListener("contextmenu", e => {
  e.preventDefault();
  if (hoverTile && objects[`${hoverTile.tx}_${hoverTile.ty}`]) setObject(hoverTile.tx, hoverTile.ty, null);
});

// ---------- drawing ----------
function drawSprite(g, spr, px, py, s) {
  s = s || 2;
  for (let y = 0; y < spr.px.length; y++) {
    const row = spr.px[y];
    for (let x = 0; x < row.length; x++) {
      const col = spr.pal[row[x]];
      if (col) { g.fillStyle = col; g.fillRect(px + x * s, py + y * s, s, s); }
    }
  }
}

function drawPlayer(p, isMe) {
  const x = Math.round(p.x), y = Math.round(p.y);
  // shadow
  ctx.fillStyle = "rgba(20,10,5,0.28)";
  ctx.beginPath();
  ctx.ellipse(x, y - 1, 9, 3, 0, 0, Math.PI * 2);
  ctx.fill();
  const step = p.moving ? Math.floor(p.step) : 0;
  drawChar(ctx, x - 12, y - CHAR_H, p.look || DEFAULT_LOOK, p.dir || 1, step);
  ctx.font = "9px monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = isMe ? "#b6a8e8" : "#c8c4d8";
  ctx.fillText(p.name || "", x, y - CHAR_H - 4);

  // "taking notes" indicator: bobbing paper + pencil
  const noting = isMe ? notesOpen() : p.noting;
  if (noting) {
    const iy = Math.round(y - CHAR_H - 31 + Math.sin(performance.now() / 280) * 2);
    ctx.fillStyle = "#f7f3ea";
    ctx.fillRect(x - 7, iy, 12, 14);
    ctx.fillStyle = "#c9c4d4";
    ctx.fillRect(x - 5, iy + 3, 8, 1);
    ctx.fillRect(x - 5, iy + 6, 8, 1);
    ctx.fillRect(x - 5, iy + 9, 5, 1);
    ctx.fillStyle = "#d8a84a";
    ctx.fillRect(x + 3, iy + 3, 3, 9);
    ctx.fillStyle = "#e8c39e";
    ctx.fillRect(x + 3, iy + 12, 3, 2);
    ctx.fillStyle = "#2a2833";
    ctx.fillRect(x + 4, iy + 14, 1, 1);
  }

  // chat bubble
  const bub = bubbles[p.id];
  if (bub && bub.until > performance.now()) {
    const text = bub.text.length > 26 ? bub.text.slice(0, 25) + "…" : bub.text;
    ctx.font = "9px monospace";
    const tw = ctx.measureText(text).width;
    const bx = x - tw / 2 - 6, by = y - CHAR_H - 32, bw = tw + 12, bh = 16;
    ctx.fillStyle = "#f7f3ea";
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 5);
    ctx.fill();
    ctx.fillRect(x - 3, by + bh, 6, 4);
    ctx.fillStyle = "#26233a";
    ctx.fillText(text, x, by + 11);
  } else if (bub) {
    delete bubbles[p.id];
  }
}

// modeled on the reference bedroom photos: pink + lavender walls, wood floor,
// white bed / dresser / armoire, pink rug, window, wooden door, neon hello sign
function drawRoom() {
  const p = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
  const sh = (x, y, w, h) => p(x, y, w, h, "rgba(30,15,8,0.18)");
  // stardew-style dark outline
  const ol = (x, y, w, h, c) => {
    ctx.strokeStyle = c || "rgba(70,45,30,0.55)";
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 1, y + 1, w - 2, h - 2);
  };

  // ---- back wall ----
  p(0, 0, 416, 96, "#d9a3b0");
  p(416, 0, 224, 96, "#b9aed6");
  // wallpaper: stripes + hearts on pink, polka dots on lavender
  for (let x = 0; x < 416; x += 32) p(x + 4, 0, 10, 96, "rgba(255,255,255,0.06)");
  for (let x = 16; x < 400; x += 32) {
    for (const wy of [22, 62]) {
      p(x, wy, 2, 2, "#c88ba0"); p(x + 3, wy, 2, 2, "#c88ba0");
      p(x, wy + 2, 5, 2, "#c88ba0"); p(x + 1, wy + 4, 3, 1, "#c88ba0");
    }
  }
  for (let x = 424; x < 632; x += 28) {
    for (let wy = 14; wy < 84; wy += 24) {
      const ox = ((wy / 24) % 2) * 14;
      p(x + ox, wy, 4, 4, "rgba(255,255,255,0.14)");
    }
  }
  // crown molding
  p(0, 0, W, 6, "#efe9f2");
  p(0, 6, W, 2, "rgba(0,0,0,0.10)");
  // wall bottom shading + baseboard
  p(0, 84, 416, 4, "#c391a0");
  p(416, 84, 224, 4, "#a89bc7");
  p(0, 88, W, 8, "#e8e6f0");
  p(0, 94, W, 2, "#c9c4d4");

  // ---- floor ----
  for (let y = 96; y < H; y += 16) {
    const row = (y / 16) % 2;
    p(32, y, 576, 16, row ? "#84563a" : "#8d5d3e");
    p(32, y, 576, 2, "#75492f");
    p(32, y + 14, 576, 2, "rgba(255,255,255,0.04)");
    const off = row * 32;
    for (let x = 32 + off; x < 608; x += 64) {
      p(x, y, 2, 16, "#6b4226");
      if ((x + y) % 128 === 0) p(x + 20, y + 6, 3, 2, "#6b4226");
    }
  }

  // ---- side walls ----
  p(0, 0, 32, H, "#cc93a4");
  p(28, 88, 4, H - 88, "#e8e6f0");
  p(608, 0, 32, H, "#a89bc7");
  p(608, 88, 4, H - 88, "#e8e6f0");

  // ---- framed prints (pink wall) ----
  // heart print
  sh(38, 15, 28, 32);
  p(36, 12, 28, 32, "#f7f3ea");
  p(38, 14, 24, 28, "#fdf7f9");
  p(43, 22, 6, 4, "#e08aab");
  p(55, 22, 6, 4, "#e08aab");
  p(43, 25, 18, 4, "#e08aab");
  p(46, 29, 12, 3, "#e08aab");
  p(49, 32, 6, 2, "#e08aab");
  p(51, 34, 2, 2, "#e08aab");
  ol(36, 12, 28, 32);
  // little landscape print
  sh(38, 55, 28, 32);
  p(36, 52, 28, 32, "#f7f3ea");
  p(38, 54, 24, 20, "#bcd6ea");
  p(38, 68, 24, 14, "#8fba6d");
  p(52, 58, 6, 6, "#f7e9a8");
  p(42, 70, 6, 10, "#5c8a46");
  ol(36, 52, 28, 32);

  // ---- window (pink wall) ----
  sh(98, 16, 116, 76);
  p(96, 12, 112, 72, "#8a5a2b");
  p(99, 15, 106, 66, "#6e4522");
  p(102, 18, 100, 60, "#e8e6f0");
  for (let y = 22; y < 76; y += 7) p(102, y, 100, 2, "#c4c2cc");
  p(148, 18, 3, 60, "#d8d6e0");
  p(92, 80, 120, 8, "#9c6b43");
  p(92, 86, 120, 2, "#7a4e32");
  ol(96, 12, 112, 72);

  // ---- wooden door (pink wall) ----
  sh(340, 8, 60, 84);
  p(336, 4, 56, 84, "#9c6b43");
  p(336, 4, 56, 2, "#7a4e32"); p(336, 86, 56, 2, "#7a4e32");
  p(336, 4, 2, 84, "#7a4e32"); p(390, 4, 2, 84, "#7a4e32");
  p(344, 12, 40, 28, "#8a5a3a");
  p(346, 14, 36, 24, "#94623e");
  p(344, 48, 40, 28, "#8a5a3a");
  p(346, 50, 36, 24, "#94623e");
  p(380, 44, 5, 5, "#e8c46a");
  p(381, 45, 2, 2, "#f7e0a0");
  ol(336, 4, 56, 84);

  // ---- neon hello sign (lavender wall) ----
  ctx.save();
  ctx.shadowColor = "#e8d5ff";
  ctx.shadowBlur = 8;
  ctx.strokeStyle = "#f4eeff";
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(520, 44, 54, 26, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.font = "20px monospace";
  ctx.textAlign = "center";
  ctx.fillStyle = "#f8f4ff";
  ctx.fillText("hello", 520, 51);
  ctx.restore();

  // ---- pink rug ----
  p(200, 300, 240, 128, "#c993a6");
  p(208, 308, 224, 112, "#d8aebc");
  p(212, 312, 216, 104, "#dcb6c3");
  // fringe
  for (let y = 302; y < 426; y += 8) {
    p(196, y, 4, 4, "#c993a6");
    p(440, y, 4, 4, "#c993a6");
  }
  // pattern
  for (let cx = 232; cx <= 408; cx += 44) {
    for (let cy = 332; cy <= 396; cy += 36) {
      p(cx - 6, cy - 2, 12, 4, "#b57f95");
      p(cx - 2, cy - 6, 4, 12, "#b57f95");
      p(cx - 2, cy - 2, 4, 4, "#c993a6");
    }
  }
  p(304, 348, 32, 32, "#b57f95");
  p(310, 354, 20, 20, "#d8aebc");
  p(316, 360, 8, 8, "#b57f95");
  ol(200, 300, 240, 128, "rgba(140,80,105,0.5)");

  // ---- dresser + round mirror (left) ----
  // mirror rests on the dresser top (bottom of the ellipse tucks behind it)
  ctx.beginPath();
  ctx.fillStyle = "#f7f3ea";
  ctx.ellipse(100, 96, 36, 31, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = "#e4ddd0";
  ctx.ellipse(100, 96, 30, 25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.fillStyle = "#cfe0ea";
  ctx.ellipse(100, 96, 26, 21, 0, 0, Math.PI * 2);
  ctx.fill();
  p(86, 84, 6, 4, "#eef8ff");
  p(94, 90, 4, 4, "#eef8ff");
  // ornament bumps
  for (const [bx, by] of [[100, 62], [70, 74], [130, 74], [64, 96], [136, 96]]) {
    ctx.beginPath();
    ctx.fillStyle = "#f7f3ea";
    ctx.arc(bx, by, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  sh(52, 132, 108, 90);
  p(48, 128, 104, 88, "#f0ece4");
  p(44, 124, 112, 8, "#ffffff");
  p(44, 130, 112, 2, "#d0cabc");
  for (const [dx, dy] of [[54, 136], [102, 136], [54, 162], [102, 162], [54, 188], [102, 188]]) {
    p(dx, dy, 44, 22, "#e6e0d6");
    p(dx + 1, dy + 1, 42, 20, "#efe9dd");
    p(dx + 19, dy + 8, 5, 5, "#b8b0a8");
    p(dx + 20, dy + 9, 2, 2, "#e0d8cc");
  }
  p(48, 214, 104, 4, "#d8d2c8");
  ol(44, 124, 112, 94);

  // ---- black storage cart (left) ----
  sh(52, 236, 46, 54);
  p(48, 232, 44, 52, "#3a3a42");
  p(46, 230, 48, 4, "#4a4a55");
  for (const dy of [238, 254, 270]) {
    p(52, dy, 36, 12, "#4a4a55");
    p(52, dy, 36, 2, "#55555f");
    p(66, dy + 5, 8, 2, "#2a2a30");
  }
  ol(46, 230, 48, 56, "rgba(0,0,0,0.4)");

  // ---- bed (center) ----
  // headboard (ornate arch)
  p(288, 56, 28, 10, "#f7f3ea");
  p(276, 60, 52, 10, "#f7f3ea");
  p(296, 50, 12, 8, "#f7f3ea");
  p(252, 68, 100, 12, "#f0ece4");
  p(232, 78, 140, 26, "#f0ece4");
  p(232, 100, 140, 4, "#d8d2c8");
  // carved detail
  p(296, 62, 12, 4, "#e0d8cc");
  p(268, 72, 8, 4, "#e0d8cc");
  p(328, 72, 8, 4, "#e0d8cc");
  // pillow
  sh(250, 116, 110, 26);
  p(248, 112, 104, 24, "#ffffff");
  p(248, 132, 104, 4, "#e0dcd4");
  p(250, 114, 100, 3, "#f4f1ea");
  p(252, 120, 6, 2, "#e8b4c8");
  p(330, 124, 6, 2, "#e8b4c8");
  // pink plushie on bed
  p(340, 108, 18, 12, "#ef9dc4");
  p(338, 112, 4, 6, "#ef9dc4");
  p(356, 112, 4, 6, "#ef9dc4");
  p(344, 111, 2, 2, "#2c2936");
  p(351, 111, 2, 2, "#2c2936");
  p(347, 115, 3, 1, "#c26a94");
  // duvet
  p(232, 136, 140, 96, "#f2eee6");
  p(232, 136, 140, 4, "#ffffff");
  // quilt grid
  for (let y = 148; y < 228; y += 20) p(232, y, 140, 1, "#e2dccd");
  for (let x = 252; x < 372; x += 24) p(x, 140, 1, 90, "#e2dccd");
  // floral pattern
  for (let i = 0; i < 30; i++) {
    const fx = 240 + ((i * 47) % 120);
    const fy = 144 + ((i * 73) % 80);
    const col = i % 2 ? "#d867a8" : "#4a9e5c";
    p(fx, fy, 3, 3, col);
    if (i % 2) { p(fx - 1, fy + 1, 1, 1, col); p(fx + 3, fy + 1, 1, 1, col); }
  }
  // fold
  p(232, 216, 140, 3, "#e2dccd");
  p(232, 219, 140, 8, "#f7f3ea");
  // footboard + legs
  sh(232, 236, 146, 10);
  p(228, 228, 148, 14, "#f0ece4");
  p(228, 238, 148, 4, "#d8d2c8");
  p(228, 242, 8, 8, "#d8d2c8");
  p(368, 242, 8, 8, "#d8d2c8");
  ol(228, 134, 148, 110);

  // ---- nightstand + lamp + pink cup ----
  // lamp glow
  const glow = ctx.createRadialGradient(418, 130, 4, 418, 130, 60);
  glow.addColorStop(0, "rgba(255,220,150,0.16)");
  glow.addColorStop(1, "rgba(255,220,150,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(358, 70, 120, 120);
  p(406, 112, 24, 8, "#e8d8b0");
  p(402, 120, 32, 14, "#f2e4c0");
  p(402, 130, 32, 4, "#d8c49a");
  p(414, 134, 6, 26, "#8a8398");
  p(412, 160, 10, 4, "#6a6478");
  sh(396, 168, 56, 62);
  p(392, 164, 56, 8, "#ffffff");
  p(392, 170, 56, 2, "#d0cabc");
  p(396, 172, 48, 54, "#f0ece4");
  p(400, 178, 40, 16, "#e6e0d6");
  p(400, 198, 40, 16, "#e6e0d6");
  p(401, 179, 38, 2, "#efe9dd");
  p(401, 199, 38, 2, "#efe9dd");
  p(417, 183, 6, 5, "#b8b0a8");
  p(417, 203, 6, 5, "#b8b0a8");
  ol(392, 164, 56, 62);
  // pink cup + pencils
  p(434, 148, 10, 16, "#d88aa8");
  p(435, 149, 8, 2, "#e8a8c0");
  p(436, 140, 2, 8, "#d8a84a");
  p(440, 138, 2, 10, "#5b7ac2");

  // ---- armoire / wardrobe (right) ----
  sh(548, 90, 66, 172);
  p(540, 84, 68, 8, "#ffffff");
  p(542, 90, 64, 2, "#d0cabc");
  p(544, 92, 60, 164, "#f0ece4");
  p(544, 92, 2, 164, "#d8d2c8");
  // glass doors
  p(550, 100, 22, 102, "#cfe0ea");
  p(576, 100, 22, 102, "#cfe0ea");
  p(556, 100, 3, 102, "#e8f4fa");
  p(582, 100, 3, 102, "#e8f4fa");
  p(564, 100, 2, 102, "#dceaf2");
  p(590, 100, 2, 102, "#dceaf2");
  p(572, 100, 4, 102, "#f0ece4");
  p(570, 148, 3, 6, "#b8b0a8");
  p(576, 148, 3, 6, "#b8b0a8");
  // drawers
  p(550, 210, 48, 18, "#e6e0d6");
  p(550, 232, 48, 18, "#e6e0d6");
  p(551, 211, 46, 2, "#efe9dd");
  p(551, 233, 46, 2, "#efe9dd");
  p(571, 217, 6, 5, "#b8b0a8");
  p(571, 239, 6, 5, "#b8b0a8");
  ol(540, 84, 68, 172);

  // ---- cow print slippers ----
  for (const [sx, sy] of [[452, 356], [472, 362]]) {
    sh(sx + 1, sy + 4, 16, 5);
    p(sx, sy, 16, 9, "#f7f3ea");
    p(sx, sy, 6, 4, "#2c2936");
    p(sx + 9, sy + 4, 5, 4, "#2c2936");
    p(sx + 2, sy + 2, 12, 3, "#e8b4c8");
  }
}

// ---------- loop ----------
let last = performance.now();
function loop(now) {
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;

  let dx = 0, dy = 0;
  if (!overlaysOpen()) {
    if (keys["w"] || keys["arrowup"]) dy -= 1;
    if (keys["s"] || keys["arrowdown"]) dy += 1;
    if (keys["a"] || keys["arrowleft"]) dx -= 1;
    if (keys["d"] || keys["arrowright"]) dx += 1;
  }
  me.moving = !!(dx || dy);
  if (me.moving) {
    const len = Math.hypot(dx, dy);
    me.x += (dx / len) * SPEED * dt;
    me.y += (dy / len) * SPEED * dt;
    if (dx) me.dir = dx > 0 ? 1 : -1;
    me.step += dt * 8;
    me.x = Math.max(TILE + 12, Math.min(W - TILE - 12, me.x));
    me.y = Math.max(104, Math.min(H - 6, me.y));
  }
  if (started) pushMe();
  nearWardrobe = me.x > 516 && me.y > 240 && me.y < 330;

  for (const r of Object.values(remotes)) {
    r.x += (r.tx - r.x) * Math.min(1, dt * 12);
    r.y += (r.ty - r.y) * Math.min(1, dt * 12);
    if (r.moving) r.step = (r.step || 0) + dt * 8;
  }

  drawRoom();
  const objList = Object.entries(objects)
    .map(([k, o]) => { const [tx, ty] = k.split("_").map(Number); return { tx, ty, o }; })
    .sort((a, b) => a.ty - b.ty);
  for (const { tx, ty, o } of objList) {
    const spr = SPRITES[o.type];
    if (spr) drawSprite(ctx, spr, tx * TILE, ty * TILE);
  }
  if (buildOpen && selected && hoverTile) {
    ctx.globalAlpha = 0.5;
    drawSprite(ctx, SPRITES[selected], hoverTile.tx * TILE, hoverTile.ty * TILE);
    ctx.globalAlpha = 1;
    ctx.strokeStyle = "#b6a8e8";
    ctx.strokeRect(hoverTile.tx * TILE + 0.5, hoverTile.ty * TILE + 0.5, TILE - 1, TILE - 1);
  }
  const everyone = [
    ...Object.entries(remotes).map(([id, r]) => ({ ...r, id })),
    { ...me, look: myLook, name: myName, id: myId, _me: true },
  ].sort((a, b) => a.y - b.y);
  for (const p of everyone) drawPlayer(p, !!p._me);

  if (nearWardrobe && !overlaysOpen()) {
    ctx.fillStyle = "#f7f3ea";
    ctx.fillRect(562, 56, 24, 22);
    ctx.fillRect(570, 78, 8, 4);
    ctx.fillStyle = "#26233a";
    ctx.font = "15px monospace";
    ctx.textAlign = "center";
    ctx.fillText("E", 574, 72);
  }

  // cozy stardew-ish lighting: warm tint + vignette
  ctx.fillStyle = "rgba(255,200,120,0.05)";
  ctx.fillRect(0, 0, W, H);
  const vig = ctx.createRadialGradient(W / 2, H * 0.52, H * 0.35, W / 2, H * 0.52, H * 0.85);
  vig.addColorStop(0, "rgba(25,12,40,0)");
  vig.addColorStop(1, "rgba(25,12,40,0.34)");
  ctx.fillStyle = vig;
  ctx.fillRect(0, 0, W, H);

  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
