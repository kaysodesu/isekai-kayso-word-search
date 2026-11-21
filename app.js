(function () {
  "use strict";

  var TIERS = window.TIERS, CATEGORIES = window.CATEGORIES, PUZZLES = window.PUZZLES, THEMES = window.THEMES;
  var Avatar = window.Avatar, STORY = window.STORY;
  var app = document.getElementById("app");
  var DIRS = { E: [0, 1], W: [0, -1], S: [1, 0], N: [-1, 0], SE: [1, 1], NW: [-1, -1], NE: [-1, 1], SW: [1, -1] };
  var FOUND_COLORS = ["#2a9d8f", "#e76f51", "#457b9d", "#e9c46a", "#8e5bd1", "#f4a261", "#43aa8b", "#d1495b", "#3a86ff", "#c77dff", "#90be6d", "#f28482"];
  var STORY_BONUS = 5, MAX_OUTFITS = 15;
  // Isekai Kayso Studio Discord: gaming session channel (redeem Grotto Coins for emotes, perks and more)
  var DISCORD_URL = "https://discord.gg/EAHfPzxqEc";

  var POWERS = [
    { id: "spark", kind: "Power-up", icon: "💡", name: "Spark", cost: 2, desc: "Flashes the first letter of a hidden word. No coin penalty." },
    { id: "spyglass", kind: "Power-up", icon: "🔭", name: "Spyglass", cost: 6, desc: "Instantly circles one whole word for you." },
    { id: "freeze", kind: "Power-up", icon: "❄️", name: "Time Freeze", cost: 4, desc: "Stops the clock for 60 seconds." },
    { id: "buffer", kind: "Buffer", icon: "⏳", name: "Time Buffer", cost: 3, desc: "50% more time before your coin rating starts to drop. Lasts one puzzle." },
    { id: "shield", kind: "Buffer", icon: "🛡️", name: "Coin Shield", cost: 5, desc: "Your rating can't fall below 3 coins. Lasts one puzzle." }
  ];

  /* ================= utilities ================= */
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function el(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  function load(key, fallback) { try { var v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } }
  function store(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) {} }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function fmt(sec) { var m = Math.floor(sec / 60), s = sec % 60; return m >= 60 ? Math.floor(m / 60) + ":" + pad(m % 60) + ":" + pad(s) : m + ":" + pad(s); }
  function catOf(key) { for (var i = 0; i < CATEGORIES.length; i++) if (CATEGORIES[i].key === key) return CATEGORIES[i]; }
  function themeById(id) { for (var i = 0; i < THEMES.length; i++) if (THEMES[i].id === id) return THEMES[i]; }
  function puzzleById(id) { for (var i = 0; i < PUZZLES.length; i++) if (PUZZLES[i].id === id) return PUZZLES[i]; }
  // Grotto Coin icon (inline SVG so it renders on every device)
  function coin(on) { return '<svg class="gc' + (on === false ? " off" : "") + '" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10.5" fill="#f5b301" stroke="#b97f00" stroke-width="2"/><circle cx="12" cy="12" r="6.8" fill="none" stroke="#ffe08a" stroke-width="1.4"/><text x="12" y="16.2" text-anchor="middle" font-size="11" font-weight="900" font-family="Arial,sans-serif" fill="#8a5a00">G</text></svg>'; }
  var COIN = coin();
  function starStr(n, max) { max = max || 5; var s = ""; for (var i = 1; i <= max; i++) s += coin(i <= n); return '<span class="coin-row" aria-label="' + n + ' of ' + max + ' Grotto Coins">' + s + "</span>"; }
  var toastTimer;
  function toast(msg) {
    var t = $("toast"); t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, 2600);
  }

  /* ================= player state ================= */
  function freshState() {
    return { v: 2, done: {}, spent: 0, inv: { spark: 2, spyglass: 0, freeze: 0, buffer: 0, shield: 0 },
      owned: Avatar.FREE.slice(), look: Avatar.defaultLook(), outfits: [], seen: {}, ach: {}, name: "Seeker" };
  }
  function normalize(s) {
    var d = freshState();
    Object.keys(d).forEach(function (k) { if (s[k] == null) s[k] = d[k]; });
    POWERS.forEach(function (p) { if (typeof s.inv[p.id] !== "number") s.inv[p.id] = 0; });
    Avatar.FREE.forEach(function (id) { if (s.owned.indexOf(id) < 0) s.owned.push(id); });
    s.look = Object.assign(Avatar.defaultLook(), s.look);
    return s;
  }
  var S = load("sf_state", null);
  if (!S) {
    S = freshState();
    var legacy = load("sf_done", null); // from version 1 (best seconds only)
    if (legacy) Object.keys(legacy).forEach(function (id) { S.done[id] = { s: legacy[id], stars: 3 }; });
  }
  S = normalize(S);
  var prefs = load("sf_prefs", { tier: "all", cat: "all", hideDone: false });

  // Lengths unlock in order inside each theme: 1 → 5 → 10 → 15 → 30 minutes.
  // A length is open if it's the first one, the one before it is solved, or it's already solved.
  function unlocked(theme, i) {
    return i === 0 || !!S.done[theme.id + "-" + TIERS[i].key] || !!S.done[theme.id + "-" + TIERS[i - 1].key];
  }
  function lockedHint(i) { return "Locked: solve the " + TIERS[i - 1].minutes + "-minute puzzle first"; }
  // The next unsolved length (always unlocked), or the first length once the theme is finished
  function firstOpen(theme) {
    for (var i = 0; i < TIERS.length; i++) if (!S.done[theme.id + "-" + TIERS[i].key]) return TIERS[i];
    return TIERS[0];
  }

  var VALID = {}; PUZZLES.forEach(function (p) { VALID[p.id] = true; });
  // only count puzzles that still exist (themes were swapped in v2)
  // Coins a solved puzzle is worth: its 1-5 rating, doubled when a 10/15/30-min time goal was beaten.
  // Older saves have no "coins" field, so they fall back to the rating.
  function coinsOf(d) { return d ? (d.coins || d.stars || 0) : 0; }
  function earnedCoins() { var t = 0; Object.keys(S.done).forEach(function (k) { if (VALID[k]) t += coinsOf(S.done[k]); }); return t; }

  // Beat the clock on the long puzzles: double coins + an achievement on your profile
  var ACHIEVEMENTS = [
    { key: "10", icon: "🥪", name: "Lunch Break Legend", desc: "Beat a 10-minute puzzle's 10:00 goal" },
    { key: "15", icon: "⏩", name: "Skip Intro Energy", desc: "Beat a 15-minute puzzle's 15:00 goal" },
    { key: "30", icon: "🍿", name: "Binge Boss", desc: "Beat a 30-minute puzzle's 30:00 goal" }
  ];
  var ACH_BY_TIER = {}; ACHIEVEMENTS.forEach(function (a) { ACH_BY_TIER[a.key] = a; });
  function achievementFor(tier) { return ACH_BY_TIER[tier.key] || null; }
  function beatCount(key) { return THEMES.filter(function (th) { var d = S.done[th.id + "-" + key]; return d && d.beat; }).length; }
  function episodeNo(theme) { return THEMES.indexOf(theme) + 1; }
  function themeDone(theme) { return TIERS.every(function (t) { return S.done[theme.id + "-" + t.key]; }); }
  function storiesDone() { return THEMES.filter(themeDone); }
  function themeCoins(theme) { return TIERS.reduce(function (a, t) { return a + coinsOf(S.done[theme.id + "-" + t.key]); }, 0); }
  // Most coins a theme can pay: 5 per length, doubled on the lengths with a time-goal bonus
  var THEME_MAX = TIERS.reduce(function (a, t) { return a + (achievementFor(t) ? 10 : 5); }, 0);
  // Grotto Coins: earned in puzzles + story bonuses, minus spending in the shop and closet.
  function wallet() { return earnedCoins() + storiesDone().length * STORY_BONUS - S.spent; }

  // Everything is saved in this browser only (localStorage). Nothing is ever sent anywhere.
  function save() { store("sf_state", S); refreshTop(); }
  function spend(cost) {
    if (wallet() < cost) { toast("Not enough Grotto Coins yet. Solve puzzles to earn more."); return false; }
    S.spent += cost; return true;
  }
  /* ================= theme toggle + top bar ================= */
  var themePref = load("sf_theme", null);
  function applyTheme() {
    var dark = themePref ? themePref === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.setAttribute("data-theme", dark ? "dark" : "light");
  }
  applyTheme();
  $("themeToggle").addEventListener("click", function () {
    themePref = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    store("sf_theme", themePref); applyTheme();
  });
  // Display comfort: text size (Aa button cycles) and reduce motion
  var TEXT_SIZES = [{ key: "md", name: "Standard" }, { key: "lg", name: "Large" }, { key: "xl", name: "Extra large" }];
  var display = load("sf_display", { text: "md", motion: "full" });
  function applyDisplay() {
    document.documentElement.setAttribute("data-text", display.text);
    document.documentElement.setAttribute("data-motion", display.motion);
  }
  applyDisplay();
  $("textToggle").addEventListener("click", function () {
    var i = TEXT_SIZES.findIndex(function (t) { return t.key === display.text; });
    display.text = TEXT_SIZES[(i + 1) % TEXT_SIZES.length].key;
    store("sf_display", display); applyDisplay();
    toast("Text size: " + TEXT_SIZES.filter(function (t) { return t.key === display.text; })[0].name);
  });
  function drawDisplay() {
    var c = $("displayCard"); if (!c) return;
    c.innerHTML = "<h2>Display</h2><p class=\"muted\">Make the game comfortable for your eyes. Saved on this device.</p>" +
      '<div class="seg" role="group" aria-label="Text size">' + TEXT_SIZES.map(function (t) { return '<button class="seg-btn" data-ts="' + t.key + '" aria-pressed="' + (display.text === t.key) + '">' + t.name + "</button>"; }).join("") + "</div>" +
      '<label class="check"><input type="checkbox" id="motionBox"' + (display.motion === "reduced" ? " checked" : "") + "> <span>Reduce motion (turns off bouncing, confetti and panel slides)</span></label>";
    c.querySelectorAll("[data-ts]").forEach(function (b) { b.onclick = function () { display.text = b.dataset.ts; store("sf_display", display); applyDisplay(); drawDisplay(); }; });
    $("motionBox").onchange = function () { display.motion = this.checked ? "reduced" : "full"; store("sf_display", display); applyDisplay(); };
  }

  function refreshTop() {
    $("starCount").textContent = wallet();
    $("miniAvatar").innerHTML = Avatar.render(S.look);
    var pp = $("progressPill"); if (pp) pp.textContent = Object.keys(S.done).length + " / " + PUZZLES.length + " solved";
  }

  /* ================= puzzle generator (seeded, deterministic) ================= */
  function hashStr(s) { var h = 2166136261; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function rng(seed) {
    return function () {
      seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function shuffle(arr, rand) { for (var i = arr.length - 1; i > 0; i--) { var j = Math.floor(rand() * (i + 1)); var t = arr[i]; arr[i] = arr[j]; arr[j] = t; } return arr; }
  var cache = {};
  function generate(puzzle) {
    if (cache[puzzle.id]) return cache[puzzle.id];
    var tier = puzzle.tier, size = tier.size;
    var bank = puzzle.theme.words.split(",").map(function (w) { return w.trim().toUpperCase(); });
    bank = bank.filter(function (w, i) { return w && bank.indexOf(w) === i; });
    for (var attempt = 0; attempt < 60; attempt++) {
      var rand = rng(hashStr(puzzle.id) + attempt * 7919);
      var pool = shuffle(bank.slice(), rand).filter(function (w) { return w.replace(/ /g, "").length <= size; });
      var grid = [];
      for (var r = 0; r < size; r++) grid.push(new Array(size).fill(""));
      var placed = [];
      for (var p = 0; p < pool.length && placed.length < tier.words; p++) {
        var display = pool[p], letters = display.replace(/ /g, "");
        var dup = placed.some(function (pw) { return pw.letters.indexOf(letters) >= 0 || letters.indexOf(pw.letters) >= 0; });
        if (dup) continue;
        var spot = findSpot(grid, letters, tier, rand);
        if (spot) {
          for (var k = 0; k < letters.length; k++) grid[spot.r + spot.dr * k][spot.c + spot.dc * k] = letters[k];
          placed.push({ display: display, letters: letters, r: spot.r, c: spot.c, dr: spot.dr, dc: spot.dc });
        }
      }
      if (placed.length < tier.words) continue;
      fillGrid(grid, placed, tier, rand);
      placed.sort(function (a, b) { return a.display.localeCompare(b.display); });
      cache[puzzle.id] = { grid: grid, words: placed, size: size };
      return cache[puzzle.id];
    }
    throw new Error("Could not build puzzle " + puzzle.id);
  }
  function findSpot(grid, letters, tier, rand) {
    var size = grid.length, best = null, bestScore = -1;
    var tries = tier.key === "30" || tier.key === "15" ? 260 : 160;
    for (var t = 0; t < tries; t++) {
      var d = DIRS[tier.dirs[Math.floor(rand() * tier.dirs.length)]];
      var dr = d[0], dc = d[1], L = letters.length;
      var rMin = dr < 0 ? L - 1 : 0, rMax = dr > 0 ? size - L : size - 1;
      var cMin = dc < 0 ? L - 1 : 0, cMax = dc > 0 ? size - L : size - 1;
      if (rMax < rMin || cMax < cMin) continue;
      var r = rMin + Math.floor(rand() * (rMax - rMin + 1));
      var c = cMin + Math.floor(rand() * (cMax - cMin + 1));
      var overlap = 0, ok = true;
      for (var k = 0; k < L; k++) {
        var ch = grid[r + dr * k][c + dc * k];
        if (ch === "") continue;
        if (ch !== letters[k]) { ok = false; break; }
        overlap++;
      }
      if (!ok || overlap === L) continue;
      var score = tier.key === "1" || tier.key === "5" ? -overlap + rand() : overlap + rand();
      if (score > bestScore) { bestScore = score; best = { r: r, c: c, dr: dr, dc: dc }; }
      if (tier.key === "1" && overlap === 0) break;
    }
    return best;
  }
  function fillGrid(grid, placed, tier, rand) {
    var abc = "ABCDEFGHIJKLMNOPRSTUVWY";
    var wordLetters = placed.map(function (p) { return p.letters; }).join("");
    for (var r = 0; r < grid.length; r++) for (var c = 0; c < grid.length; c++) {
      if (grid[r][c]) continue;
      var src = abc;
      if (tier.fill === "mixed") src = rand() < 0.45 ? wordLetters : abc;
      if (tier.fill === "tricky") src = rand() < 0.7 ? wordLetters : abc;
      grid[r][c] = src[Math.floor(rand() * src.length)];
    }
  }

  /* ================= star rating ================= */
  // 5★ within the target time, 4★ within 1.5x, 3★ within 2x, 2★ within 3x, else 1★.
  // Each plain Hint costs 1★. Time Buffer stretches the target by 50%. Star Shield floors at 3★.
  function rateStars(seconds, puzzle, run) {
    var T = puzzle.tier.minutes * 60 * (run.buffer ? 1.5 : 1);
    var s = seconds <= T ? 5 : seconds <= T * 1.5 ? 4 : seconds <= T * 2 ? 3 : seconds <= T * 3 ? 2 : 1;
    s -= run.hints;
    if (run.shield) s = Math.max(3, s);
    return Math.max(1, Math.min(5, s));
  }

  /* ================= comic engine ================= */
  var WHO = { N: { name: "", cls: "narrator" }, I: { name: "Inky", cls: "inky" }, J: { name: "Jumble", cls: "jumble" }, Y: { name: "", cls: "you" } };
  function panelHTML(line, cat, props) {
    var who = line.charAt(0), text = line.slice(2).replace(/\{name\}/g, S.name);
    var w = WHO[who] || WHO.N, speaker = who === "Y" ? S.name : w.name;
    var p = (props || []).map(function (e, i) { return '<span class="prop p' + i + '">' + e + "</span>"; }).join("");
    var speech = who === "N"
      ? '<div class="caption">' + esc(text) + "</div>"
      : '<div class="bubble from-' + w.cls + '"><b>' + esc(speaker) + "</b>" + esc(text) + "</div>";
    return '<div class="cpanel bg-' + cat + (who === "J" ? " fx-speed" : "") + (who === "I" || who === "Y" ? " fx-sparkle" : "") + '">' +
      '<div class="cprops" aria-hidden="true">' + p + "</div>" + speech +
      '<div class="cast">' +
      '<div class="char c-inky' + (who === "I" ? " talking" : "") + '">' + Avatar.INKY + "</div>" +
      (who === "J" ? '<div class="char c-jumble talking">' + Avatar.JUMBLE + "</div>" : "") +
      '<div class="char c-you' + (who === "Y" ? " talking" : "") + '">' + Avatar.render(S.look) + "</div>" +
      "</div></div>";
  }
  function showComic(lines, opts) {
    return new Promise(function (resolve) {
      var box = $("comic"), stage = $("comicStage"), dots = $("comicDots"), next = $("comicNext"), skip = $("comicSkip");
      var i = 0;
      $("comicTitle").textContent = opts.title || "";
      function draw() {
        stage.innerHTML = panelHTML(lines[i], opts.cat || "prologue", opts.props);
        dots.innerHTML = lines.map(function (_, k) { return '<i class="' + (k === i ? "on" : "") + '"></i>'; }).join("");
        next.textContent = i === lines.length - 1 ? (opts.endLabel || "Let's go!") : "Next ›";
      }
      function close() {
        box.hidden = true; next.onclick = skip.onclick = null; document.removeEventListener("keydown", key);
        resolve();
      }
      function advance() { if (i < lines.length - 1) { i++; draw(); } else close(); }
      function key(e) { if (e.key === "Enter" || e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); advance(); } if (e.key === "Escape") close(); }
      next.onclick = advance; skip.onclick = close;
      stage.onclick = advance;
      document.addEventListener("keydown", key);
      box.hidden = false; draw(); next.focus();
    });
  }
  function themeProps(theme) {
    var e = theme.emoji, c = catOf(theme.cat).emoji;
    return [e, c, "✨", e, "📜"];
  }
  // First time only: let the player pick their Seeker's body style before the story starts
  function pickSeeker() {
    if (S.seen.picked) return Promise.resolve();
    return new Promise(function (resolve) {
      var tiles = '<div class="item-grid pick-grid">' + Avatar.BODIES.map(function (bd) {
        var look = Object.assign({}, S.look, { body: bd.key, hair: bd.hair, acc: bd.key === 0 ? "acc-bow" : "acc-none" });
        return '<button class="item" data-pick="' + bd.key + '">' + Avatar.render(look) + '<span class="i-name">' + bd.name + "</span></button>";
      }).join("") + '</div><p class="muted small">You can change everything later in the Closet.</p>';
      openModal("Choose your Seeker", "", "Who's heading into the Storybook?", tiles, [], { quiet: true });
      document.querySelectorAll("[data-pick]").forEach(function (b) {
        b.onclick = function () {
          var key = +b.dataset.pick;
          setBody(key); S.look.hair = Avatar.BODIES[key].hair;
          if (key !== 0 && S.look.acc === "acc-bow") S.look.acc = "acc-none";
          S.seen.picked = true; save();
          $("winModal").hidden = true; resolve();
        };
      });
    });
  }
  function playPrologue() {
    return pickSeeker().then(function () { return showComic(STORY.prologue, { title: "Prologue: The Scattered Storybook", cat: "prologue", props: ["📖", "🌬️", "📜", "✨", "🔤"], endLabel: "Begin the journey!" }); })
      .then(function () { S.seen.prologue = true; save(); });
  }
  function playIntro(theme) {
    var lines = STORY.themes[theme.id];
    return showComic(lines.slice(0, 2), { title: "Episode " + episodeNo(theme) + ": " + theme.name, cat: theme.cat, props: themeProps(theme), endLabel: "Start searching!" })
      .then(function () { S.seen["i:" + theme.id] = true; save(); });
  }
  function playOutro(theme) {
    var lines = STORY.themes[theme.id];
    return showComic([lines[2]], { title: "Episode " + episodeNo(theme) + " · Page restored!", cat: theme.cat, props: ["🎉", theme.emoji, "📜", "✨", "💰"], endLabel: "To be continued ›" });
  }

  /* ================= router ================= */
  var cleanup = null;
  function route() {
    if (cleanup) { cleanup(); cleanup = null; }
    $("winModal").hidden = true;
    var h = location.hash || "#/";
    h = h.split("?")[0];
    var m = h.match(/^#\/play\/(.+)$/), view = "home";
    var p = m && puzzleById(decodeURIComponent(m[1]));
    if (p) {
      // guard direct links and bookmarks to locked lengths
      var ti = TIERS.indexOf(p.tier);
      if (!unlocked(p.theme, ti)) {
        var open = firstOpen(p.theme);
        toast("🔒 " + p.tier.minutes + " min is locked. Your next " + p.theme.name + " puzzle is the " + open.minutes + "-minute one.");
        location.replace("#/play/" + encodeURIComponent(p.theme.id + "-" + open.key));
        return;
      }
      view = "play"; renderPlay(p);
    }
    else if (h === "#/journey") { view = "journey"; renderJourney(); }
    else if (h === "#/closet") { view = "closet"; renderCloset(); }
    else if (h === "#/shop") { view = "shop"; renderShop(); }
    else if (h === "#/leaderboard") { view = "leaderboard"; renderBoard(); }
    else renderHome();
    document.querySelectorAll("#mainNav a").forEach(function (a) {
      if (a.dataset.nav === view || (view === "play" && a.dataset.nav === "home")) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    refreshTop();
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);

  /* ================= home ================= */
  function renderHome() {
    document.title = "Seek & Find Word Search";
    app.innerHTML = "";
    app.appendChild($("homeTpl").content.cloneNode(true));

    // Length pills: All · 1 · 5 · 10 · 15 · 30
    var tierRow = $("tierRow");
    [{ key: "all", label: "All", color: "var(--brand)", title: "Every length" }]
      .concat(TIERS.map(function (t) { return { key: t.key, label: t.minutes + "m", color: t.color, title: t.name + " · about " + t.minutes + " min" }; }))
      .forEach(function (t) {
        var b = el("button", "len-pill", t.label); b.type = "button"; b.dataset.key = t.key; b.title = t.title;
        b.style.setProperty("--tc", t.color);
        b.setAttribute("aria-pressed", prefs.tier === t.key);
        b.addEventListener("click", function () {
          prefs.tier = t.key; store("sf_prefs", prefs);
          tierRow.querySelectorAll(".len-pill").forEach(function (x) { x.setAttribute("aria-pressed", x.dataset.key === prefs.tier); });
          drawList();
        });
        tierRow.appendChild(b);
      });

    var cat = $("catSelect");
    cat.innerHTML = '<option value="all">All categories</option>' + CATEGORIES.map(function (c) { return '<option value="' + c.key + '">' + c.emoji + " " + c.name + "</option>"; }).join("");
    cat.value = prefs.cat;
    cat.addEventListener("change", function () { prefs.cat = cat.value; store("sf_prefs", prefs); drawList(); });
    var search = $("searchBox"), hide = $("hideDone");
    search.addEventListener("input", drawList);
    hide.checked = !!prefs.hideDone;
    hide.addEventListener("change", function () { prefs.hideDone = hide.checked; store("sf_prefs", prefs); drawList(); });

    // One slim row per theme, with its five lengths as small buttons
    function drawList() {
      var q = search.value.trim().toLowerCase(), list = $("puzzleList"), html = "", shown = 0;
      var fi = TIERS.findIndex(function (t) { return t.key === prefs.tier; }); // -1 when "All"
      THEMES.forEach(function (th) {
        if (prefs.cat !== "all" && th.cat !== prefs.cat) return;
        if (q && (th.name + " " + catOf(th.cat).name + " " + th.words).toLowerCase().indexOf(q) < 0) return;
        var doneCount = TIERS.filter(function (t) { return S.done[th.id + "-" + t.key]; }).length;
        if (prefs.hideDone && (prefs.tier === "all" ? doneCount === 5 : S.done[th.id + "-" + prefs.tier])) return;
        shown++;
        // the row opens the chosen length if it's unlocked, otherwise the next one the player can play
        var pick = fi >= 0 && unlocked(th, fi) ? prefs.tier : firstOpen(th).key;
        html += '<div class="trow' + (doneCount === 5 ? " complete" : "") + '">' +
          '<a class="tr-main" title="' + esc(th.name) + '" href="#/play/' + encodeURIComponent(th.id + "-" + pick) + '"><span class="tr-emoji">' + th.emoji + '</span><span class="tr-name"><b>' + esc(th.name) + "</b><small>" + catOf(th.cat).name + (doneCount ? " · " + doneCount + "/5" : "") + "</small></span></a>" +
          '<span class="tr-chips">' + TIERS.map(function (t, i) {
            var id = th.id + "-" + t.key, d = S.done[id], dim = prefs.tier !== "all" && prefs.tier !== t.key ? " dim" : "";
            if (!unlocked(th, i)) {
              return '<span class="lc locked' + dim + '" style="--tc:' + t.color + '" title="' + lockedHint(i) + '" aria-label="' + esc(th.name) + ", " + t.minutes + ' minute puzzle, locked">' + t.minutes + "</span>";
            }
            return '<a class="lc' + (d ? " done" : "") + dim + '" style="--tc:' + t.color + '" href="#/play/' + encodeURIComponent(id) + '" title="' + esc(th.name) + " · " + t.minutes + " min" + (d ? " · best " + fmt(d.s) + " · " + d.stars + " coins" : "") + '" aria-label="' + esc(th.name) + ", " + t.minutes + " minute puzzle" + (d ? ", solved" : "") + '">' + t.minutes + "</a>";
          }).join("") + "</span></div>";
      });
      list.innerHTML = html;
      $("emptyMsg").hidden = shown > 0;
    }
    drawList();
  }

  /* ================= play ================= */
  function renderPlay(puzzle) {
    var data = generate(puzzle), size = data.size, theme = puzzle.theme;
    document.title = theme.name + " (" + puzzle.tier.minutes + " min) · Seek & Find";
    app.innerHTML = "";
    app.appendChild($("playTpl").content.cloneNode(true));
    $("pCat").textContent = theme.emoji + " " + STORY.realms[theme.cat];
    $("pTitle").textContent = theme.name;
    $("pMeta").textContent = puzzle.tier.name + " · about " + puzzle.tier.minutes + " min · line " + (TIERS.indexOf(puzzle.tier) + 1) + " of 5" +
      (achievementFor(puzzle.tier) ? " · ⏱️ beat " + puzzle.tier.minutes + ":00 for double coins" : "");

    var board = $("board");
    board.style.setProperty("--n", size);
    var cells = [];
    for (var r = 0; r < size; r++) for (var c = 0; c < size; c++) {
      var cell = el("div", "cell", data.grid[r][c]); cell.setAttribute("role", "gridcell");
      board.appendChild(cell); cells.push(cell);
    }
    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "overlay"); svg.setAttribute("viewBox", "0 0 " + size + " " + size); svg.setAttribute("preserveAspectRatio", "none");
    board.appendChild(svg);
    var selLine = document.createElementNS(NS, "line");
    selLine.setAttribute("class", "sel"); selLine.setAttribute("stroke-width", "0.78"); selLine.style.display = "none";
    svg.appendChild(selLine);
    function cellAt(r, c) { return cells[r * size + c]; }
    function drawLine(line, r1, c1, r2, c2) { line.setAttribute("x1", c1 + .5); line.setAttribute("y1", r1 + .5); line.setAttribute("x2", c2 + .5); line.setAttribute("y2", r2 + .5); }

    var wordList = $("wordList"), wordEls = {};
    data.words.forEach(function (w) { var li = el("li", "", w.display); wordEls[w.letters] = li; wordList.appendChild(li); });

    var found = {}, foundCount = 0, total = data.words.length, colorIdx = 0, finished = false, started = false;
    var run = { hints: 0, buffer: false, shield: false, freezeLeft: 0, gaveUp: false };
    function updateFound() { $("foundCount").textContent = foundCount + "/" + total; }
    updateFound();

    var seconds = 0, paused = false;
    function updateLive() {
      var st = rateStars(seconds, puzzle, run), ls = $("liveStars");
      ls.innerHTML = starStr(st); ls.title = st + " Grotto Coin rating so far";
      var status = $("statusLine");
      if (run.freezeLeft > 0) status.textContent = "❄️ Clock frozen for " + run.freezeLeft + "s";
      else status.textContent = "Drag across letters, or tap the first and last letter of a word.";
    }
    var tick = setInterval(function () {
      if (!started || paused || finished || document.hidden) return;
      if (run.freezeLeft > 0) run.freezeLeft--; else { seconds++; $("timer").textContent = fmt(seconds); }
      updateLive();
    }, 1000);
    updateLive();

    function markFound(w, revealed) {
      found[w.letters] = true;
      var line = document.createElementNS(NS, "line");
      line.setAttribute("class", revealed ? "revealed" : "found");
      line.setAttribute("stroke-width", "0.74");
      line.setAttribute("stroke", revealed ? "var(--danger)" : FOUND_COLORS[colorIdx++ % FOUND_COLORS.length]);
      drawLine(line, w.r, w.c, w.r + w.dr * (w.letters.length - 1), w.c + w.dc * (w.letters.length - 1));
      svg.insertBefore(line, selLine);
      var li = wordEls[w.letters];
      li.classList.add(revealed ? "revealed" : "found");
      if (!revealed) { foundCount++; li.classList.add("just"); setTimeout(function () { li.classList.remove("just"); }, 600); }
      updateFound();
      if (!revealed && foundCount === total) finish();
    }
    function checkSelection(r1, c1, r2, c2) {
      var dr = Math.sign(r2 - r1), dc = Math.sign(c2 - c1);
      var len = Math.max(Math.abs(r2 - r1), Math.abs(c2 - c1)) + 1, s = "";
      for (var k = 0; k < len; k++) s += data.grid[r1 + dr * k][c1 + dc * k];
      var rev = s.split("").reverse().join("");
      for (var i = 0; i < data.words.length; i++) {
        var w = data.words[i];
        if (found[w.letters]) continue;
        if (w.letters === s || w.letters === rev) { markFound({ letters: w.letters, r: r1, c: c1, dr: dr, dc: dc }, false); return true; }
      }
      return false;
    }

    // ---- pointer selection (mouse, touch, pen) ----
    var start = null, end = null, dragging = false, moved = false, anchor = null;
    function cellFromPoint(x, y) {
      var rect = board.getBoundingClientRect(), pd = parseFloat(getComputedStyle(board).paddingLeft) || 0;
      var cs = (rect.width - pd * 2) / size;
      var c = Math.floor((x - rect.left - pd) / cs), r = Math.floor((y - rect.top - pd) / cs);
      if (r < 0 || c < 0 || r >= size || c >= size) return null;
      return { r: r, c: c };
    }
    function snap(s, p) {
      var dr = p.r - s.r, dc = p.c - s.c;
      if (dr === 0 && dc === 0) return { r: s.r, c: s.c };
      var oct = Math.round(Math.atan2(dr, dc) / (Math.PI / 4));
      var sdr = Math.round(Math.sin(oct * Math.PI / 4)), sdc = Math.round(Math.cos(oct * Math.PI / 4));
      var len = Math.max(Math.abs(dr), Math.abs(dc));
      while (len > 0) { var rr = s.r + sdr * len, cc = s.c + sdc * len; if (rr >= 0 && cc >= 0 && rr < size && cc < size) return { r: rr, c: cc }; len--; }
      return { r: s.r, c: s.c };
    }
    function showSel(a, b) { selLine.style.display = ""; drawLine(selLine, a.r, a.c, b.r, b.c); }
    function hideSel() { selLine.style.display = "none"; }
    function clearAnchor() { if (anchor) cellAt(anchor.r, anchor.c).classList.remove("anchor"); anchor = null; }
    var missTimer;
    function flashMiss(ok) {
      clearTimeout(missTimer);
      if (ok) { hideSel(); return; }
      selLine.style.stroke = "var(--danger)";
      missTimer = setTimeout(function () { selLine.style.stroke = ""; hideSel(); }, 260);
    }
    board.addEventListener("pointerdown", function (e) {
      if (paused || finished || !started) return;
      var p = cellFromPoint(e.clientX, e.clientY);
      if (!p) return;
      e.preventDefault();
      try { board.setPointerCapture(e.pointerId); } catch (x) {}
      if (anchor) {
        var tgt = snap(anchor, p), a = anchor; clearAnchor();
        if (!(tgt.r === a.r && tgt.c === a.c)) { showSel(a, tgt); flashMiss(checkSelection(a.r, a.c, tgt.r, tgt.c)); } else hideSel();
        return;
      }
      start = p; end = p; dragging = true; moved = false; showSel(start, end);
    });
    board.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var p = cellFromPoint(e.clientX, e.clientY);
      if (!p) return;
      var s = snap(start, p);
      if (s.r !== end.r || s.c !== end.c) { end = s; moved = true; showSel(start, end); }
    });
    board.addEventListener("pointerup", function () {
      if (!dragging) return;
      dragging = false;
      if (!moved || (start.r === end.r && start.c === end.c)) {
        hideSel(); anchor = start; cellAt(anchor.r, anchor.c).classList.add("anchor"); showSel(anchor, anchor); return;
      }
      flashMiss(checkSelection(start.r, start.c, end.r, end.c));
    });
    board.addEventListener("pointercancel", function () { dragging = false; hideSel(); });
    board.addEventListener("contextmenu", function (e) { e.preventDefault(); });

    // ---- hints, power-ups and buffers ----
    function unfound() { return data.words.filter(function (w) { return !found[w.letters]; }); }
    function flashWord(w) {
      var c = cellAt(w.r, w.c); c.classList.remove("flash"); void c.offsetWidth; c.classList.add("flash");
      var li = wordEls[w.letters]; li.classList.remove("just"); void li.offsetWidth; li.classList.add("just");
    }
    function canAct() { return started && !finished && !paused; }
    $("hintBtn").addEventListener("click", function () {
      if (!canAct()) return;
      var left = unfound(); if (!left.length) return;
      run.hints++; flashWord(left[Math.floor(Math.random() * left.length)]); updateLive();
    });
    function drawPowerBar() {
      var bar = $("powerBar");
      bar.innerHTML = '<div class="pb-head"><span>Power-ups &amp; buffers</span><a href="#/shop">Get more</a></div>';
      var row = el("div", "pb-row");
      POWERS.forEach(function (p) {
        var active = (p.id === "buffer" && run.buffer) || (p.id === "shield" && run.shield) || (p.id === "freeze" && run.freezeLeft > 0);
        var b = el("button", "pb" + (active ? " active" : ""));
        b.type = "button"; b.title = p.name + ": " + p.desc;
        b.innerHTML = '<span class="pb-icon">' + p.icon + '</span><span class="pb-name">' + p.name + '</span><span class="pb-count">' + (active ? "On" : "×" + S.inv[p.id]) + "</span>";
        b.disabled = finished || active || S.inv[p.id] < 1;
        b.addEventListener("click", function () { usePower(p); });
        row.appendChild(b);
      });
      bar.appendChild(row);
    }
    function usePower(p) {
      if (!canAct() || S.inv[p.id] < 1) return;
      var left = unfound();
      if ((p.id === "spark" || p.id === "spyglass") && !left.length) return;
      S.inv[p.id]--; save();
      var w = left[Math.floor(Math.random() * left.length)];
      if (p.id === "spark") flashWord(w);
      if (p.id === "spyglass") markFound(w, false);
      if (p.id === "freeze") run.freezeLeft = 60;
      if (p.id === "buffer") run.buffer = true;
      if (p.id === "shield") run.shield = true;
      toast(p.icon + " " + p.name + " used!");
      updateLive(); drawPowerBar();
    }
    drawPowerBar();
    var pbTimer = setInterval(function () { if (run.freezeLeft === 0 && $("powerBar") && $("powerBar").querySelector(".pb.active .pb-icon")) drawPowerBar(); }, 1000);

    var pauseBtn = $("pauseBtn"), cover = $("pauseCover");
    function setPaused(v) { if (finished) return; paused = v; board.classList.toggle("paused", v); cover.hidden = !v; pauseBtn.textContent = v ? "Resume" : "Pause"; }
    pauseBtn.addEventListener("click", function () { if (started) setPaused(!paused); });
    $("resumeBtn").addEventListener("click", function () { setPaused(false); });
    $("restartBtn").addEventListener("click", function () { route(); });
    $("revealBtn").addEventListener("click", function () {
      if (!canAct()) return;
      if (!confirm("Give up and show all remaining words? You won't earn Grotto Coins for this puzzle.")) return;
      run.gaveUp = true; finished = true;
      unfound().forEach(function (w) { markFound(w, true); });
      clearAnchor(); hideSel(); setPaused(false); lockTools();
    });
    function lockTools() { ["hintBtn", "pauseBtn", "revealBtn"].forEach(function (id) { $(id).disabled = true; }); drawPowerBar(); }

    function finish() {
      finished = true; clearAnchor(); lockTools();
      var stars = rateStars(seconds, puzzle, run);
      var prev = S.done[puzzle.id];
      // beat the real clock goal (not the Time Buffer one) on a 10/15/30-min puzzle -> double coins
      var ach = achievementFor(puzzle.tier), beat = !!ach && seconds <= puzzle.tier.minutes * 60;
      var runCoins = stars * (beat ? 2 : 1);
      var gained = Math.max(0, runCoins - coinsOf(prev));
      var wasStory = themeDone(theme);
      S.done[puzzle.id] = {
        s: prev ? Math.min(prev.s, seconds) : seconds,
        stars: Math.max(prev ? prev.stars : 0, stars),
        coins: Math.max(coinsOf(prev), runCoins),
        beat: !!(beat || (prev && prev.beat))
      };
      var newAch = beat && !S.ach[ach.key] ? ach : null;
      if (newAch) S.ach[ach.key] = Date.now();
      var storyNow = !wasStory && themeDone(theme);
      save();
      setTimeout(function () { showWin(puzzle, seconds, stars, gained, prev, storyNow, beat, newAch); }, 450);
    }

    cleanup = function () { clearInterval(tick); clearInterval(pbTimer); clearTimeout(missTimer); };

    // ---- story transitions before the clock starts ----
    var chain = Promise.resolve();
    if (!S.seen.prologue) chain = chain.then(playPrologue);
    if (!S.seen["i:" + theme.id]) chain = chain.then(function () { return playIntro(theme); });
    chain.then(function () { started = true; });
  }

  /* ================= results + story completion ================= */
  function confetti(modal) {
    var conf = modal.querySelector(".confetti"); conf.innerHTML = "";
    for (var k = 0; k < 40; k++) {
      var b = document.createElement("i");
      b.style.left = Math.random() * 100 + "%"; b.style.background = FOUND_COLORS[k % FOUND_COLORS.length];
      b.style.animationDelay = Math.random() * 0.6 + "s"; conf.appendChild(b);
    }
  }
  function nextPuzzle(puzzle) {
    var th = puzzle.theme;
    for (var i = 0; i < TIERS.length; i++) { var id = th.id + "-" + TIERS[i].key; if (!S.done[id]) return puzzleById(id); }
    var idx = THEMES.indexOf(th);
    for (var j = 1; j <= THEMES.length; j++) {
      var t2 = THEMES[(idx + j) % THEMES.length];
      for (var k = 0; k < TIERS.length; k++) { var id2 = t2.id + "-" + TIERS[k].key; if (!S.done[id2]) return puzzleById(id2); }
    }
    return PUZZLES[(PUZZLES.indexOf(puzzle) + 1) % PUZZLES.length];
  }
  function pageProgress(theme) {
    return '<div class="page-progress"><span>Page “' + esc(theme.name) + '”</span><span class="pips">' +
      TIERS.map(function (t) { var d = S.done[theme.id + "-" + t.key]; return '<i class="' + (d ? "on" : "") + '" title="' + t.minutes + ' min">' + (d ? "✓" : "") + "</i>"; }).join("") +
      "</span><span>" + TIERS.filter(function (t) { return S.done[theme.id + "-" + t.key]; }).length + "/5 lines</span></div>";
  }
  function openModal(title, starsHTML, text, extra, actions, opts) {
    var modal = $("winModal");
    $("winTitle").textContent = title;
    $("winStars").innerHTML = starsHTML || "";
    $("winText").textContent = text;
    $("winExtra").innerHTML = extra || "";
    var act = $("winActions"); act.innerHTML = "";
    actions.forEach(function (a) {
      var b = el(a.href ? "a" : "button", "btn" + (a.ghost ? " ghost" : ""), a.label);
      if (a.href) b.href = a.href; else b.type = "button";
      if (a.onClick) b.addEventListener("click", a.onClick);
      act.appendChild(b);
    });
    if (opts && opts.quiet) modal.querySelector(".confetti").innerHTML = ""; else confetti(modal);
    modal.hidden = false;
    var first = act.querySelector(".btn:not(.ghost)"); if (first) first.focus();
  }
  function showWin(puzzle, seconds, stars, gained, prev, storyNow, beat, newAch) {
    var stars5 = "";
    for (var i = 1; i <= 5; i++) stars5 += '<span class="ws' + (i <= stars ? " on" : "") + '" style="animation-delay:' + (i * 0.12) + 's">' + coin(i <= stars) + "</span>";
    var target = puzzle.tier.minutes;
    var text = "Solved in " + fmt(seconds) + " (target about " + target + " min). ";
    text += gained > 0 ? "+" + gained + " Grotto Coin" + (gained > 1 ? "s" : "") + " added to your pouch!" : prev ? "You already earned " + coinsOf(prev) + " coins here. Beat it to earn more." : "";
    var extra = "";
    if (beat) extra += '<div class="reward-box"><b>⏱️ Time goal beaten: double Grotto Coins!</b><span>Under ' + target + ":00 on a " + target + "-minute puzzle.</span></div>";
    if (newAch) extra += '<div class="entry-box ok ach-unlock"><b>' + newAch.icon + " Achievement unlocked: " + newAch.name + '</b><span>It\'s on your <a href="#/leaderboard">profile</a> now.</span></div>';
    extra += pageProgress(puzzle.theme);
    var actions = [];
    if (storyNow) actions.push({ label: "📖 Restore the page!", onClick: function () { $("winModal").hidden = true; completeStory(puzzle.theme); } });
    else {
      var nx = nextPuzzle(puzzle);
      actions.push({ label: "Journey", href: "#/journey", ghost: true });
      actions.push({ label: "Next puzzle →", href: "#/play/" + encodeURIComponent(nx.id) });
    }
    openModal(storyNow ? "Last line found!" : "Puzzle complete!", stars5, text, extra, actions);
  }
  function completeStory(theme) {
    playOutro(theme).then(function () {
      S.seen["o:" + theme.id] = true; save();
      var extra = '<div class="reward-box"><b>+' + STORY_BONUS + " " + COIN + " Grotto Coin story bonus</b><span>" + storiesDone().length + " of 35 pages restored</span></div>" + discordBox(true);
      var all = storiesDone().length === THEMES.length && !S.seen.finale;
      openModal("Page restored!", '<div class="story-badge">' + theme.emoji + "</div>", "You found all five lines of “" + theme.name + "”.", extra, [
        all ? { label: "📖 The final chapter", onClick: function () { $("winModal").hidden = true; showComic(STORY.finale, { title: "Epilogue: The Storybook Is Whole", cat: "prologue", props: ["📖", "🏆", "✨", "🎉", "💰"], endLabel: "The End ♥" }).then(function () { S.seen.finale = true; save(); location.hash = "#/journey"; }); } }
          : { label: "Continue the journey →", href: "#/journey" }
      ]);
    });
  }
  // Link to the Isekai Kayso Studio Discord gaming session channel
  function discordBox(compact) {
    return '<div class="entry-box discord-box">🎮 <b>Spend Grotto Coins on our Discord</b><span>Join the Isekai Kayso Studio gaming session channel to redeem coins for emotes, perks and much more.</span>' +
      '<a class="btn discord' + (compact ? " small" : "") + '" href="' + DISCORD_URL + '" target="_blank" rel="noopener noreferrer">Join Isekai Kayso Studio</a></div>';
  }

  /* ================= journey ================= */
  function renderJourney() {
    document.title = "Journey · Seek & Find";
    var done = storiesDone().length;
    var h = '<section class="page-head journey-head">' +
      '<div class="jh-cast">' + Avatar.render(S.look) + Avatar.INKY + "</div>" +
      '<div><h1>The Scattered Storybook</h1><p>Jumble the wind sprite blew the Great Storybook apart. Each theme is a lost page with five lines: one puzzle of every length. Restore a page to finish its story.</p>' +
      '<div class="bar"><i style="width:' + (done / THEMES.length * 100) + '%"></i></div><p class="muted">' + done + " of " + THEMES.length + ' pages restored · +' + STORY_BONUS + " " + COIN + ' Grotto Coin bonus for each</p>' +
      '<button class="btn ghost small" id="replayPrologue">▶ Replay prologue</button></div></section>';
    CATEGORIES.forEach(function (cat, ci) {
      h += '<section class="chapter"><h2><span class="ch-num">Arc ' + (ci + 1) + "</span> " + cat.emoji + " " + STORY.realms[cat.key] + "</h2><div class=\"stops\">";
      THEMES.filter(function (t) { return t.cat === cat.key; }).forEach(function (t) {
        var complete = themeDone(t), lines = TIERS.filter(function (tr) { return S.done[t.id + "-" + tr.key]; }).length;
        h += '<article class="stop' + (complete ? " complete" : "") + '">' +
          '<div class="stop-top"><span class="stop-emoji">' + t.emoji + '</span><div><h3>' + esc(t.name) + '</h3><span class="muted">' + themeCoins(t) + "/" + THEME_MAX + " " + COIN + "</span></div>" + (complete ? '<span class="seal" title="Story complete">📜✓</span>' : "") + "</div>" +
          '<div class="pips">' + TIERS.map(function (tr, i) {
            var d = S.done[t.id + "-" + tr.key];
            if (!unlocked(t, i)) return '<span class="locked" title="' + lockedHint(i) + '">' + tr.minutes + "</span>";
            return '<a href="#/play/' + t.id + "-" + tr.key + '" class="' + (d ? "on" : "") + '" title="' + tr.minutes + " min" + (d ? ", " + d.stars + " coins" : "") + '">' + tr.minutes + "</a>";
          }).join("") + "</div>" +
          '<div class="stop-actions"><a class="btn small" href="#/play/' + t.id + "-" + firstOpen(t).key + '">' + (complete ? "Replay" : lines ? "Continue" : "Start") + '</a><button class="btn ghost small" data-story="' + t.id + '">📖 Story</button></div></article>';
      });
      h += "</div></section>";
    });
    app.innerHTML = h;
    $("replayPrologue").addEventListener("click", function () { playPrologue(); });
    app.querySelectorAll("[data-story]").forEach(function (b) {
      b.addEventListener("click", function () {
        var t = themeById(b.dataset.story);
        playIntro(t).then(function () { if (themeDone(t)) return playOutro(t); });
      });
    });
    if (!S.seen.prologue) playPrologue();
  }

  /* ================= closet ================= */
  var closetTab = "look";

  // Switching body style also switches hair, but only if the player hasn't picked their own hairstyle
  function setBody(key) {
    var suggested = Avatar.BODIES.map(function (b) { return b.hair; });
    if (suggested.indexOf(S.look.hair || 0) >= 0) S.look.hair = Avatar.BODIES[key].hair;
    S.look.body = key;
  }

  function renderCloset() {
    document.title = "Closet · Seek & Find";
    var tabs = [{ key: "look", name: "Look" }].concat(Avatar.SLOTS);
    var h = '<section class="page-head"><h1>Closet</h1><p>Mix a hair accessory, shirt, pants and shoes. Unlock pieces with Grotto Coins, then save up to ' + MAX_OUTFITS + " outfits.</p></section>" +
      '<div class="closet"><div class="closet-preview card-box"><div class="big-av">' + Avatar.render(S.look) + "</div>" +
      '<label class="field"><span>Seeker name</span><input id="avName" maxlength="16" value="' + esc(S.name) + '"></label>' +
      '<button class="btn" id="saveOutfit">💾 Save this outfit</button></div>' +
      '<div class="closet-main card-box"><div class="tabs" role="tablist">' +
      tabs.map(function (t) { return '<button role="tab" class="tab" aria-selected="' + (closetTab === t.key) + '" data-tab="' + t.key + '">' + t.name + "</button>"; }).join("") +
      '</div><div class="item-grid" id="itemGrid"></div></div></div>' +
      '<section class="card-box wardrobe"><h2>Wardrobe <span class="muted">' + S.outfits.length + "/" + MAX_OUTFITS + '</span></h2><div class="outfits" id="outfits"></div></section>';
    app.innerHTML = h;

    app.querySelectorAll("[data-tab]").forEach(function (b) { b.addEventListener("click", function () { closetTab = b.dataset.tab; renderCloset(); }); });
    $("avName").addEventListener("change", function () { S.name = this.value.trim().slice(0, 16) || "Seeker"; save(); toast("Nice to meet you, " + S.name + "!"); });
    $("saveOutfit").addEventListener("click", function () {
      if (S.outfits.length >= MAX_OUTFITS) { toast("Wardrobe full. Delete an outfit to save a new one."); return; }
      var exists = S.outfits.some(function (o) { return o.acc === S.look.acc && o.shirt === S.look.shirt && o.pants === S.look.pants && o.shoes === S.look.shoes; });
      if (exists) { toast("This outfit is already in your wardrobe."); return; }
      S.outfits.push({ name: "Outfit " + (S.outfits.length + 1), acc: S.look.acc, shirt: S.look.shirt, pants: S.look.pants, shoes: S.look.shoes });
      save(); renderCloset(); toast("Outfit saved!");
    });

    var grid = $("itemGrid");
    if (closetTab === "look") {
      grid.className = "look-grid";
      var lh = "<h3>Body style</h3><div class=\"item-grid body-grid\">" + Avatar.BODIES.map(function (bd) {
          return '<button class="item' + ((S.look.body || 0) === bd.key ? " equipped" : "") + '" data-body="' + bd.key + '">' + Avatar.render(Object.assign({}, S.look, { body: bd.key })) + '<span class="i-name">' + bd.name + "</span></button>";
        }).join("") + "</div>" +
        "<h3>Skin tone</h3><div class=\"swatches\">" + Avatar.SKINS.map(function (c, i) { return '<button class="sw' + (S.look.skin === i ? " on" : "") + '" data-skin="' + i + '" style="background:' + c + '" aria-label="Skin tone ' + (i + 1) + '"></button>'; }).join("") + "</div>" +
        "<h3>Eye color</h3><div class=\"swatches\">" + Avatar.EYE_COLORS.map(function (c, i) { return '<button class="sw' + ((S.look.eyeColor || 0) === i ? " on" : "") + '" data-eye="' + i + '" style="background:' + c + '" aria-label="Eye color ' + (i + 1) + '"></button>'; }).join("") + "</div>" +
        "<h3>Hair color</h3><div class=\"swatches\">" + Avatar.HAIR_COLORS.map(function (c, i) { return '<button class="sw' + (S.look.hairColor === i ? " on" : "") + '" data-hc="' + i + '" style="background:' + c + '" aria-label="Hair color ' + (i + 1) + '"></button>'; }).join("") + "</div>" +
        "<h3>Hair style</h3><div class=\"item-grid\">" + Avatar.HAIR_STYLES.map(function (n, i) {
          return '<button class="item' + (S.look.hair === i ? " equipped" : "") + '" data-hair="' + i + '">' + Avatar.render(Object.assign({}, S.look, { hair: i })) + '<span class="i-name">' + n + "</span></button>";
        }).join("") + "</div>";
      grid.innerHTML = lh;
      grid.querySelectorAll("[data-skin]").forEach(function (b) { b.onclick = function () { S.look.skin = +b.dataset.skin; save(); renderCloset(); }; });
      grid.querySelectorAll("[data-eye]").forEach(function (b) { b.onclick = function () { S.look.eyeColor = +b.dataset.eye; save(); renderCloset(); }; });
      grid.querySelectorAll("[data-hc]").forEach(function (b) { b.onclick = function () { S.look.hairColor = +b.dataset.hc; save(); renderCloset(); }; });
      grid.querySelectorAll("[data-hair]").forEach(function (b) { b.onclick = function () { S.look.hair = +b.dataset.hair; save(); renderCloset(); }; });
      grid.querySelectorAll("[data-body]").forEach(function (b) { b.onclick = function () { setBody(+b.dataset.body); save(); renderCloset(); }; });
    } else {
      Avatar.ITEMS.filter(function (it) { return it.slot === closetTab && !it.season; }).forEach(function (it) {
        var owned = S.owned.indexOf(it.id) >= 0, on = S.look[it.slot] === it.id;
        var b = el("button", "item" + (on ? " equipped" : "") + (owned ? "" : " locked"));
        b.type = "button";
        var tryLook = Object.assign({}, S.look); tryLook[it.slot] = it.id;
        b.innerHTML = Avatar.render(tryLook) + '<span class="i-name">' + it.name + '</span><span class="i-state">' + (on ? "Wearing" : owned ? "Owned" : "🔒 " + it.cost + " " + COIN) + "</span>";
        b.addEventListener("click", function () {
          if (!owned) {
            if (!confirm("Unlock " + it.name + " for " + it.cost + " Grotto Coins?")) return;
            if (!spend(it.cost)) return;
            S.owned.push(it.id); toast("Unlocked " + it.name + "!");
          }
          S.look[it.slot] = it.id; save(); renderCloset();
        });
        grid.appendChild(b);
      });
    }

    var out = $("outfits");
    for (var i = 0; i < MAX_OUTFITS; i++) {
      var o = S.outfits[i];
      if (!o) { out.appendChild(el("div", "outfit empty", "Empty")); continue; }
      var d = el("div", "outfit");
      d.innerHTML = Avatar.render(Object.assign({}, S.look, o)) + '<span class="i-name">' + esc(o.name) + '</span><span class="o-actions"><button class="btn small" data-wear="' + i + '">Wear</button><button class="btn ghost small" data-del="' + i + '" aria-label="Delete outfit">✕</button></span>';
      out.appendChild(d);
    }
    out.querySelectorAll("[data-wear]").forEach(function (b) { b.onclick = function () { var o = S.outfits[+b.dataset.wear]; ["acc", "shirt", "pants", "shoes"].forEach(function (k) { S.look[k] = o[k]; }); save(); renderCloset(); }; });
    out.querySelectorAll("[data-del]").forEach(function (b) { b.onclick = function () { if (confirm("Delete this outfit?")) { S.outfits.splice(+b.dataset.del, 1); save(); renderCloset(); } }; });
  }

  /* ================= shop ================= */
  function renderShop() {
    document.title = "Grotto Shop · Seek & Find";
    var earned = earnedCoins(), bonus = storiesDone().length * STORY_BONUS;
    var h = '<section class="page-head"><h1>Grotto Shop</h1><p>Spend your Grotto Coins on power-ups, buffers and outfit pieces here, or on emotes, perks and more in our Discord.</p></section>' +
      '<div class="shop-top"><div class="card-box wallet"><div class="wallet-big">' + COIN + " " + wallet() + '</div><span class="muted">Grotto Coins to spend</span>' +
      '<dl><dt>From puzzles</dt><dd>' + earned + "</dd><dt>Story bonuses</dt><dd>" + bonus + "</dd><dt>Spent</dt><dd>−" + S.spent + "</dd></dl></div>" +
      '<div class="card-box how"><h2>How to earn Grotto Coins</h2><ul class="rate-list">' +
      "<li><b>" + starStr(5) + "</b> Finish within the target time</li><li><b>" + starStr(4) + "</b> Within 1.5× the target</li><li><b>" + starStr(3) + "</b> Within 2×</li><li><b>" + starStr(2) + "</b> Within 3×</li><li><b>" + starStr(1) + "</b> Any finish counts!</li></ul>" +
      '<p class="double-note">⏱️ <b>Double coins:</b> beat the clock (10:00, 15:00 or 30:00) on a 10, 15 or 30-minute puzzle to double its coins, up to 10, and unlock an achievement.</p>' +
      '<p class="muted">Each plain Hint costs 1 coin from that puzzle\'s rating. Replaying a puzzle only adds the coins you improve by. Finishing a story adds +' + STORY_BONUS + " coins.</p></div></div>" +
      '<section><h2 class="sec-title">Power-ups &amp; buffers</h2><div class="shop-grid">' +
      POWERS.map(function (p) {
        return '<article class="card-box shop-item"><div class="si-icon">' + p.icon + '</div><div class="si-body"><span class="si-kind">' + p.kind + "</span><h3>" + p.name + "</h3><p>" + p.desc + '</p></div><div class="si-foot"><span class="muted">Owned ×' + S.inv[p.id] + '</span><button class="btn small" data-buy="' + p.id + '">Buy · ' + p.cost + " " + COIN + "</button></div></article>";
      }).join("") + "</div></section>" +
      '<section><h2 class="sec-title">Discord rewards</h2>' + discordBox(false) + '</section>' +
      '<section><h2 class="sec-title">Outfit pieces</h2><p class="muted">Unlock clothes in the <a href="#/closet">Closet</a>. ' + S.owned.filter(function (id) { return Avatar.BY_ID[id] && !Avatar.BY_ID[id].season; }).length + " of " + Avatar.ITEMS.filter(function (i) { return !i.season; }).length + " pieces owned.</p></section>";
    app.innerHTML = h;
    app.querySelectorAll("[data-buy]").forEach(function (b) {
      b.addEventListener("click", function () {
        var p = POWERS.filter(function (x) { return x.id === b.dataset.buy; })[0];
        if (!spend(p.cost)) return;
        S.inv[p.id]++; save(); toast(p.icon + " " + p.name + " added!"); renderShop();
      });
    });
  }

  /* ================= leaderboard (this device only) ================= */
  // Built from the progress saved in this browser. Nothing is uploaded anywhere.
  var boardTier = "1";
  function renderBoard() {
    document.title = "Leaderboard · Seek & Find";
    var solved = PUZZLES.filter(function (p) { return S.done[p.id]; });
    var perfect = solved.filter(function (p) { return S.done[p.id].stars === 5; }).length;
    var totalTime = solved.reduce(function (t, p) { return t + S.done[p.id].s; }, 0);
    var coinsEarned = earnedCoins() + storiesDone().length * STORY_BONUS;
    var rows = solved.filter(function (p) { return p.tier.key === boardTier; })
      .sort(function (x, y) { return S.done[x.id].s - S.done[y.id].s; }).slice(0, 10);
    var tier = TIERS.filter(function (t) { return t.key === boardTier; })[0];

    var h = '<section class="page-head board-head"><div class="board-av">' + Avatar.render(S.look) + '</div><div><h1>Leaderboard</h1>' +
      "<p>" + esc(S.name) + "'s hall of fame. Scores are saved only on this device; nothing is sent anywhere.</p></div></section>" +
      '<div class="tiles">' +
      tile(COIN + " " + coinsEarned, "Grotto Coins earned") +
      tile(solved.length + "<small>/" + PUZZLES.length + "</small>", "Puzzles solved") +
      tile(storiesDone().length + "<small>/" + THEMES.length + "</small>", "Stories restored") +
      tile(perfect, "Perfect 5-coin solves") +
      tile(fmt(totalTime), "Total time searching") +
      "</div>" +
      '<section class="card-box ach-card"><h2>🏅 Achievements</h2><div class="ach-grid">' + ACHIEVEMENTS.map(function (a) {
        var at = S.ach[a.key], n = beatCount(a.key);
        return '<div class="ach' + (at ? " earned" : "") + '"><span class="ach-icon">' + (at ? a.icon : "🔒") + '</span><div><b>' + a.name + "</b><span>" + a.desc + " for double coins.</span>" +
          '<small>' + (at ? "Unlocked " + new Date(at).toLocaleDateString() + " · " : "") + n + "/" + THEMES.length + " goals beaten</small></div></div>";
      }).join("") + "</div></section>" +
      '<section class="card-box fastest"><h2>🏆 Fastest solves</h2>' +
      '<div class="seg" role="group" aria-label="Puzzle length">' + TIERS.map(function (t) { return '<button class="seg-btn" data-bt="' + t.key + '" aria-pressed="' + (t.key === boardTier) + '">' + t.minutes + " min</button>"; }).join("") + "</div>" +
      (rows.length
        ? '<ol class="rank-list">' + rows.map(function (p, i) {
            var d = S.done[p.id], medal = ["🥇", "🥈", "🥉"][i] || (i + 1) + ".";
            return '<li><span class="rk">' + medal + '</span><a href="#/play/' + encodeURIComponent(p.id) + '">' + p.theme.emoji + " " + esc(p.theme.name) + '</a><span class="rk-coins">' + starStr(d.stars) + '</span><span class="rk-time">' + fmt(d.s) + "</span></li>";
          }).join("") + "</ol>"
        : '<p class="muted">No ' + tier.minutes + '-minute puzzles solved yet. <a href="#/">Pick one</a> and set the first record!</p>') +
      "</section>" +
      '<section class="sec-gap">' + discordBox(false) + "</section>" +
      '<div class="card-box display-card" id="displayCard"></div>' +
      '<section class="card-box display-card"><h2>Your data</h2><p class="muted">Your progress, coins and outfits live in this browser only. Clearing your browser data erases them, so download a backup if you want to keep them or move to another device.</p>' +
      '<div class="data-actions"><button class="btn ghost small" id="backupBtn">⬇️ Download backup</button>' +
      '<label class="btn ghost small file-btn">⬆️ Restore backup<input type="file" id="restoreFile" accept="application/json,.json" hidden></label>' +
      '<button class="btn ghost small danger" id="resetBtn">Reset everything</button></div></section>';
    app.innerHTML = h;
    drawDisplay();
    app.querySelectorAll("[data-bt]").forEach(function (b) { b.onclick = function () { boardTier = b.dataset.bt; renderBoard(); }; });
    $("backupBtn").onclick = function () {
      var blob = new Blob([JSON.stringify({ app: "seek-and-find", v: 2, saved: new Date().toISOString(), state: S }, null, 1)], { type: "application/json" });
      var a = document.createElement("a");
      a.href = URL.createObjectURL(blob); a.download = "seek-and-find-backup.json";
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    };
    $("restoreFile").onchange = function () {
      var f = this.files && this.files[0]; if (!f) return;
      var reader = new FileReader();
      reader.onload = function () {
        try {
          var data = JSON.parse(reader.result);
          if (!data || data.app !== "seek-and-find" || !data.state || typeof data.state.done !== "object") throw new Error();
          if (!confirm("Replace your current progress with this backup?")) return;
          S = normalize(data.state); save(); toast("Backup restored!"); renderBoard();
        } catch (e) { toast("That file isn't a Seek & Find backup."); }
      };
      reader.readAsText(f);
    };
    $("resetBtn").onclick = function () {
      if (!confirm("Erase ALL progress, Grotto Coins and outfits on this device? This can't be undone.")) return;
      S = normalize(freshState()); save(); toast("Fresh start! Good luck, Seeker."); renderBoard();
    };
  }
  function tile(big, label) { return '<div class="tile card-box"><b>' + big + "</b><span>" + label + "</span></div>"; }

  /* ================= boot ================= */
  document.getElementById("winModal").addEventListener("click", function (e) { if (e.target === this) this.hidden = true; });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") $("winModal").hidden = true; });
  window.__generate = generate;
  window.__state = function () { return S; };

  refreshTop();
  route();
})();
