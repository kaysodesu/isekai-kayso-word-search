/* Seek & Find - chibi avatar renderer.
   An outfit = hair accessory + shirt + pants + shoes (5 choices each).
   Skin tone, hair color and hair style are free cosmetic choices. */
(function () {
  "use strict";

  var SKINS = ["#ffe3cc", "#f7c9a3", "#e3a979", "#c68658", "#93603f", "#5f3b27"];
  var HAIR_COLORS = ["#3b2a20", "#7a4a28", "#e0b04a", "#e2683a", "#30303f", "#a58be6"];
  var HAIR_STYLES = ["Bob", "Pigtails", "Spiky", "Short Crop", "Swept Fringe", "Ponytail", "Messy Shag"];
  // Body styles change the torso, shoulders and face. Every outfit fits every body.
  var BODIES = [
    { key: 0, name: "Feminine", hair: 0, torso: "M70 144 Q100 134 130 144 L136 196 Q100 203 64 196 Z", arm: 72 },
    { key: 1, name: "Masculine", hair: 3, torso: "M64 144 Q100 136 136 144 L134 198 Q100 203 66 198 Z", arm: 67 },
    { key: 2, name: "Non-binary", hair: 6, torso: "M67 144 Q100 135 133 144 L135 197 Q100 203 65 197 Z", arm: 70 }
  ];

  var LEG_L = "M66 188 H134 L132 234 H104 L100 208 L96 234 H68 Z";
  var TORSO = BODIES[0].torso; // set per render() for the chosen body style

  function star(cx, cy, r, fill) {
    var pts = [];
    for (var i = 0; i < 10; i++) {
      var a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r;
      pts.push((cx + Math.cos(a) * rr).toFixed(1) + "," + (cy + Math.sin(a) * rr).toFixed(1));
    }
    return '<polygon points="' + pts.join(" ") + '" fill="' + fill + '" stroke="#e0a800" stroke-width="1.5" stroke-linejoin="round"/>';
  }
  function torso(fill) { return '<path d="' + TORSO + '" fill="' + fill + '"/>'; }
  function boots(fill, top, extra) {
    return '<path d="M74 ' + top + ' H96 V244 H66 Q62 244 62 238 Q62 230 74 230 Z" fill="' + fill + '"/>' +
      '<path d="M104 ' + top + ' H126 V230 Q138 230 138 238 Q138 244 134 244 H104 Z" fill="' + fill + '"/>' + (extra || "");
  }

  var ITEMS = [
    // ---- hair accessories ----
    { id: "acc-none", slot: "acc", name: "Nothing", cost: 0, draw: function () { return ""; } },
    { id: "acc-bow", slot: "acc", name: "Ribbon Bow", cost: 0, draw: function () {
      return '<g transform="translate(134 46) rotate(12)"><path d="M0 0 L-18 -11 L-16 12 Z" fill="#ff5c8a"/><path d="M0 0 L18 -11 L16 12 Z" fill="#ff5c8a"/><circle r="6" fill="#e8457a"/></g>';
    } },
    { id: "acc-kitsune", slot: "acc", name: "Kitsune Mask", cost: 15, draw: function () {
      return '<g transform="translate(58 56) rotate(-20)"><path d="M-15 -6 L-13 -22 L-4 -11 L4 -11 L13 -22 L15 -6 Q15 13 0 17 Q-15 13 -15 -6 Z" fill="#fff" stroke="#d8d0d0" stroke-width="1.5"/>' +
        '<path d="M-9 -1 L-3 1 M9 -1 L3 1" stroke="#e23b3b" stroke-width="2.6" stroke-linecap="round"/><path d="M-11 -16 L-8 -9 M11 -16 L8 -9" stroke="#e23b3b" stroke-width="2.2" stroke-linecap="round"/><circle cy="9" r="2" fill="#e23b3b"/></g>';
    } },
    { id: "acc-star", slot: "acc", name: "Star Hairpin", cost: 25, draw: function () { return star(136, 48, 15, "#ffd54a"); } },
    { id: "acc-cat", slot: "acc", name: "Cat-Ear Headband", cost: 40, draw: function () {
      return '<path d="M52 64 L58 18 L92 42 Z" fill="#3a3550"/><path d="M60 54 L63 30 L82 43 Z" fill="#ff9fb8"/>' +
        '<path d="M148 64 L142 18 L108 42 Z" fill="#3a3550"/><path d="M140 54 L137 30 L118 43 Z" fill="#ff9fb8"/>';
    } },
    { id: "acc-crown", slot: "acc", name: "Tiny Crown", cost: 60, draw: function () {
      return '<path d="M74 42 L78 14 L91 30 L100 8 L109 30 L122 14 L126 42 Z" fill="#ffcc33" stroke="#e0a800" stroke-width="2" stroke-linejoin="round"/>' +
        '<circle cx="100" cy="32" r="4" fill="#ff5c8a"/><circle cx="86" cy="36" r="3" fill="#4fc3f7"/><circle cx="114" cy="36" r="3" fill="#4fc3f7"/>';
    } },

    // ---- shirts ----
    { id: "shirt-tee", slot: "shirt", name: "Comfy Tee", cost: 0, color: "#ff8a7a", front: function () {
      return torso("#ff8a7a") + '<path d="M88 141 Q100 151 112 141" stroke="#e66a5a" stroke-width="3" fill="none" stroke-linecap="round"/>';
    } },
    { id: "shirt-sailor", slot: "shirt", name: "Sailor Top", cost: 15, color: "#f4f6fb", front: function () {
      return torso("#f4f6fb") + '<path d="M80 140 L100 160 L120 140 L134 146 L130 160 L100 170 L70 160 L66 146 Z" fill="#2c3e7a"/>' +
        '<path d="M70 156 L100 166 L130 156" stroke="#fff" stroke-width="2" fill="none"/>' +
        '<path d="M100 164 L88 158 L90 174 Z M100 164 L112 158 L110 174 Z" fill="#e23b3b"/><circle cx="100" cy="164" r="4" fill="#c42d2d"/>';
    } },
    { id: "shirt-hoodie", slot: "shirt", name: "Cozy Hoodie", cost: 25, color: "#4caf7d",
      back: function () { return '<ellipse cx="100" cy="142" rx="50" ry="20" fill="#3d9467"/>'; },
      front: function () {
        return torso("#4caf7d") + '<rect x="82" y="172" width="36" height="16" rx="6" fill="#3d9467"/>' +
          '<path d="M94 146 V162 M106 146 V162" stroke="#fff" stroke-width="2.5" stroke-linecap="round"/>';
      } },
    { id: "shirt-vest", slot: "shirt", name: "Explorer Vest", cost: 40, color: "#f5ecd5", front: function () {
      return torso("#f5ecd5") +
        '<path d="M70 144 Q82 139 92 140 L90 199 Q76 198 64 196 Z" fill="#a8774a"/><path d="M130 144 Q118 139 108 140 L110 199 Q124 198 136 196 Z" fill="#a8774a"/>' +
        '<rect x="72" y="166" width="13" height="11" rx="2" fill="#8c5f36"/><rect x="115" y="166" width="13" height="11" rx="2" fill="#8c5f36"/>';
    } },
    { id: "shirt-cape", slot: "shirt", name: "Starry Cape", cost: 60, color: "#7b5cd6",
      back: function () { return '<path d="M68 146 L132 146 L154 230 Q100 240 46 230 Z" fill="#2c3e7a"/>'; },
      front: function () { return torso("#7b5cd6") + star(88, 172, 7, "#ffd54a") + star(112, 162, 5, "#ffd54a") + star(110, 184, 4, "#ffd54a") + '<circle cx="100" cy="146" r="5" fill="#ffd54a"/>'; } },

    // ---- pants ----
    { id: "pants-jeans", slot: "pants", name: "Blue Jeans", cost: 0, draw: function () {
      return '<path d="' + LEG_L + '" fill="#4a78c2"/><path d="M100 194 V206" stroke="#3a62a3" stroke-width="2"/>';
    } },
    { id: "pants-shorts", slot: "pants", name: "Sunny Shorts", cost: 15, draw: function () {
      return '<path d="M66 188 H134 L133 212 H104 L100 202 L96 212 H67 Z" fill="#f5c542"/>';
    } },
    { id: "pants-pleated", slot: "pants", name: "Pleated Skirt", cost: 25, draw: function () {
      return '<path d="M68 186 H132 L148 220 H52 Z" fill="#2c3e7a"/>' +
        '<path d="M80 188 L74 220 M92 188 L90 220 M108 188 L110 220 M120 188 L126 220" stroke="#1d2a5a" stroke-width="2"/>' +
        '<path d="M53 216 H147" stroke="#fff" stroke-width="2" opacity=".7"/>';
    } },
    { id: "pants-cargo", slot: "pants", name: "Trail Cargos", cost: 40, draw: function () {
      return '<path d="' + LEG_L + '" fill="#b49a6a"/><rect x="70" y="206" width="13" height="11" rx="2" fill="#9c8256"/><rect x="117" y="206" width="13" height="11" rx="2" fill="#9c8256"/>';
    } },
    { id: "pants-dots", slot: "pants", name: "Polka Dot Pants", cost: 60, draw: function () {
      var d = [[76, 198], [88, 214], [76, 226], [112, 200], [124, 216], [112, 228], [100, 196]];
      return '<path d="' + LEG_L + '" fill="#2bb3a3"/>' + d.map(function (p) { return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="3.5" fill="#fff"/>'; }).join("");
    } },

    // ---- shoes ----
    { id: "shoes-sneakers", slot: "shoes", name: "Sneakers", cost: 0, draw: function () {
      return '<ellipse cx="82" cy="238" rx="16" ry="8" fill="#fff" stroke="#cfd0d8" stroke-width="2"/><ellipse cx="118" cy="238" rx="16" ry="8" fill="#fff" stroke="#cfd0d8" stroke-width="2"/>' +
        '<path d="M74 236 H88 M112 236 H126" stroke="#ff5c5c" stroke-width="3" stroke-linecap="round"/>';
    } },
    { id: "shoes-sandals", slot: "shoes", name: "Sandals", cost: 15, draw: function (skin) {
      return '<ellipse cx="82" cy="237" rx="13" ry="7" fill="' + skin + '"/><ellipse cx="118" cy="237" rx="13" ry="7" fill="' + skin + '"/>' +
        '<path d="M68 243 H96 M104 243 H132" stroke="#8a5a3a" stroke-width="4" stroke-linecap="round"/><path d="M75 234 H90 M110 234 H125" stroke="#c98a4b" stroke-width="4" stroke-linecap="round"/>';
    } },
    { id: "shoes-rain", slot: "shoes", name: "Rain Boots", cost: 25, draw: function () {
      return boots("#ffcf33", 212, '<path d="M74 218 H96 M104 218 H126" stroke="#f0b400" stroke-width="3"/>');
    } },
    { id: "shoes-boots", slot: "shoes", name: "Hiking Boots", cost: 40, draw: function () {
      return boots("#8a5a3a", 220, '<path d="M66 242 H96 M104 242 H134" stroke="#4a2f1d" stroke-width="4"/><path d="M80 225 L90 229 M80 231 L90 235 M110 225 L120 229 M110 231 L120 235" stroke="#f3d9a4" stroke-width="2"/>');
    } },
    { id: "shoes-slippers", slot: "shoes", name: "Star Slippers", cost: 60, draw: function () {
      return '<ellipse cx="82" cy="238" rx="16" ry="8" fill="#b388ff"/><ellipse cx="118" cy="238" rx="16" ry="8" fill="#b388ff"/>' + star(76, 232, 7, "#ffd54a") + star(124, 232, 7, "#ffd54a");
    } }
  ];

  /* ---- Seasonal collections: unlocked through the Isekai Kayso Studio Discord (not shown in the Closet in this version) ---- */
  var SEASONS = {
    winter: { name: "Winter Festival", emoji: "❄️" },
    sakura: { name: "Sakura Spring", emoji: "🌸" }
  };
  function flower(x, y, petal, center) {
    var s = '<g transform="translate(' + x + " " + y + ')">';
    for (var i = 0; i < 5; i++) { var a = -Math.PI / 2 + i * 2 * Math.PI / 5; s += '<circle cx="' + (Math.cos(a) * 7).toFixed(1) + '" cy="' + (Math.sin(a) * 7).toFixed(1) + '" r="6" fill="' + petal + '"/>'; }
    return s + '<circle r="4" fill="' + center + '"/></g>';
  }
  ITEMS.push(
    // Winter Festival
    { id: "win-beanie", season: "winter", slot: "acc", name: "Snowflake Beanie", cost: 0, draw: function () {
      return '<path d="M48 64 Q50 20 100 18 Q150 20 152 64 Z" fill="#c0392b"/><path d="M60 40 H140 M56 52 H144" stroke="#fff" stroke-width="3" stroke-dasharray="6 5" opacity=".8"/>' +
        '<rect x="46" y="56" width="108" height="13" rx="6.5" fill="#f4f6fb"/><circle cx="100" cy="16" r="10" fill="#f4f6fb"/>';
    } },
    { id: "win-sweater", season: "winter", slot: "shirt", name: "Holiday Knit Sweater", cost: 0, color: "#2e7d4f", front: function () {
      return torso("#2e7d4f") + '<path d="M68 162 L76 155 L84 162 L92 155 L100 162 L108 155 L116 162 L124 155 L132 162" stroke="#fff" stroke-width="3.2" fill="none" stroke-linejoin="round"/>' +
        '<path d="M68 176 L76 169 L84 176 L92 169 L100 176 L108 169 L116 176 L124 169 L132 176" stroke="#fff" stroke-width="3.2" fill="none" stroke-linejoin="round"/>' +
        '<circle cx="84" cy="188" r="3" fill="#e23b3b"/><circle cx="100" cy="188" r="3" fill="#fff"/><circle cx="116" cy="188" r="3" fill="#e23b3b"/>';
    } },
    { id: "win-flannel", season: "winter", slot: "pants", name: "Plaid Flannel Pants", cost: 0, draw: function () {
      return '<path d="' + LEG_L + '" fill="#b03a2e"/><path d="M78 190 V234 M88 190 V234 M112 190 V234 M122 190 V234 M68 202 H96 M104 202 H132 M68 216 H96 M104 216 H132 M68 228 H96 M104 228 H132" stroke="#6e1b14" stroke-width="2.2" opacity=".55"/>';
    } },
    { id: "win-boots", season: "winter", slot: "shoes", name: "Fur-Trim Snow Boots", cost: 0, draw: function () {
      return boots("#d9cfc0", 212, '<rect x="70" y="208" width="30" height="9" rx="4.5" fill="#fff"/><rect x="100" y="208" width="30" height="9" rx="4.5" fill="#fff"/><path d="M64 242 H96 M104 242 H136" stroke="#8a7b66" stroke-width="4"/>');
    } },
    // Sakura Spring
    { id: "sak-pin", season: "sakura", slot: "acc", name: "Sakura Hairpin", cost: 0, draw: function () { return flower(64, 52, "#ffb7d0", "#ff6b9a") + flower(52, 66, "#ffd1e2", "#ff6b9a"); } },
    { id: "sak-haori", season: "sakura", slot: "shirt", name: "Blossom Haori", cost: 0, color: "#f6b9cf", front: function () {
      return torso("#f6b9cf") + '<path d="M90 140 L86 199 M110 140 L114 199" stroke="#c95f8a" stroke-width="5"/>' +
        flower(76, 170, "#fff", "#ff6b9a").replace("translate(76 170)", "translate(76 170) scale(.55)") +
        flower(124, 184, "#fff", "#ff6b9a").replace("translate(124 184)", "translate(124 184) scale(.5)");
    } },
    { id: "sak-hakama", season: "sakura", slot: "pants", name: "Pleated Hakama", cost: 0, draw: function () {
      return '<path d="M66 186 H134 L146 234 H54 Z" fill="#3b3a6b"/><path d="M84 188 L78 234 M100 188 V234 M116 188 L122 234" stroke="#2a2950" stroke-width="2.2"/>';
    } },
    { id: "sak-geta", season: "sakura", slot: "shoes", name: "Geta Sandals", cost: 0, draw: function (skin) {
      return '<ellipse cx="82" cy="234" rx="12" ry="6" fill="' + skin + '"/><ellipse cx="118" cy="234" rx="12" ry="6" fill="' + skin + '"/>' +
        '<rect x="68" y="238" width="28" height="5" rx="2" fill="#a0703f"/><rect x="104" y="238" width="28" height="5" rx="2" fill="#a0703f"/>' +
        '<rect x="72" y="243" width="5" height="4" fill="#7a5230"/><rect x="87" y="243" width="5" height="4" fill="#7a5230"/><rect x="108" y="243" width="5" height="4" fill="#7a5230"/><rect x="123" y="243" width="5" height="4" fill="#7a5230"/>' +
        '<path d="M76 233 L82 229 L88 233 M112 233 L118 229 L124 233" stroke="#e23b3b" stroke-width="2.6" fill="none" stroke-linecap="round"/>';
    } }
  );

  var BY_ID = {};
  ITEMS.forEach(function (it) { BY_ID[it.id] = it; });
  var SLOTS = [
    { key: "acc", name: "Hair Accessory" },
    { key: "shirt", name: "Shirt" },
    { key: "pants", name: "Pants" },
    { key: "shoes", name: "Shoes" }
  ];

  function hairBack(style, c) {
    if (style === 1) return '<circle cx="40" cy="112" r="17" fill="' + c + '"/><circle cx="160" cy="112" r="17" fill="' + c + '"/>';
    if (style === 0) return '<path d="M44 96 Q40 150 64 150 L136 150 Q160 150 156 96 Z" fill="' + c + '"/>';
    if (style === 5) return '<path d="M138 56 Q190 66 176 146 Q170 128 158 118 Q160 96 146 82 Z" fill="' + c + '"/>';
    return "";
  }
  function hairFront(style, c) {
    if (style === 3) return '<path d="M46 94 Q42 34 100 34 Q158 34 154 94 Q150 70 136 62 Q108 54 72 64 Q54 72 46 94 Z" fill="' + c + '"/>';
    if (style === 4) return '<path d="M44 98 Q38 32 100 32 Q162 34 156 98 Q150 74 140 66 L66 86 Q86 66 72 60 Q52 70 44 98 Z" fill="' + c + '"/>';
    if (style === 5) return '<path d="M44 96 Q40 32 100 32 Q160 32 156 96 Q148 66 124 60 Q100 70 76 62 Q54 70 44 96 Z" fill="' + c + '"/><circle cx="146" cy="62" r="5" fill="#ff6b8b"/>';
    if (style === 6) return '<path d="M42 104 Q36 40 70 36 Q86 22 104 32 Q126 22 140 40 Q166 50 158 104 L150 96 L146 76 L134 86 L126 68 L112 82 L100 66 L88 82 L74 68 L66 86 L54 76 L50 104 Z" fill="' + c + '"/>';
    if (style === 1) return '<path d="M44 94 Q44 34 100 34 Q156 34 156 94 Q146 66 120 62 Q100 74 80 64 Q56 70 44 94 Z" fill="' + c + '"/><circle cx="50" cy="100" r="5" fill="#ff6b8b"/><circle cx="150" cy="100" r="5" fill="#ff6b8b"/>';
    if (style === 2) return '<path d="M46 90 L48 52 L66 60 L74 32 L92 50 L104 24 L114 50 L132 34 L136 60 L154 52 L154 90 Q140 66 100 64 Q60 66 46 90 Z" fill="' + c + '"/>';
    return '<path d="M42 102 Q36 32 100 32 Q164 32 158 102 Q156 112 150 118 L150 96 Q140 70 112 66 Q96 78 70 70 Q54 80 50 118 Q44 112 42 102 Z" fill="' + c + '"/>';
  }
  var EYE_COLORS = ["#6b3e26", "#3d6fd6", "#2e9d6a", "#8a4fd6", "#d6455b", "#d99a1e"];
  // Big sparkly anime eyes: dark outline, colored iris, lighter lower glow, two highlights, lash line.
  // body 0: big lashes + rosy blush; 1: bold brows, smaller eyes, light blush; 2: soft brows, in-between
  function face(eye, body, hc) {
    var rx = body === 1 ? 8.5 : body === 2 ? 9 : 9.5, ry = body === 1 ? 11 : body === 2 ? 12 : 12.5;
    function one(cx, side) {
      var lash = body === 1
        ? '<path d="M' + (cx - 9) + ' 92 Q' + cx + ' 88 ' + (cx + 9) + ' 92" stroke="#241c33" stroke-width="2.2" fill="none" stroke-linecap="round"/>'
        : '<path d="M' + (cx - 11) + ' 92 Q' + cx + ' ' + (body === 2 ? 86 : 84) + ' ' + (cx + 11) + ' 92" stroke="#241c33" stroke-width="' + (body === 2 ? 2.6 : 3) + '" fill="none" stroke-linecap="round"/>' +
          (body === 0 ? '<path d="M' + (cx + side * 10) + ' 91 l' + side * 4 + ' -3" stroke="#241c33" stroke-width="2.4" stroke-linecap="round"/>' : "");
      var brow = body === 1 ? '<path d="M' + (cx - 10) + ' 80 Q' + cx + ' 76 ' + (cx + 10) + ' 79" stroke="' + hc + '" stroke-width="4" fill="none" stroke-linecap="round"/>'
        : body === 2 ? '<path d="M' + (cx - 9) + ' 80 Q' + cx + ' 77 ' + (cx + 9) + ' 80" stroke="' + hc + '" stroke-width="2.6" fill="none" stroke-linecap="round"/>' : "";
      return brow + '<ellipse cx="' + cx + '" cy="101" rx="' + rx + '" ry="' + ry + '" fill="#241c33"/>' +
        '<ellipse cx="' + cx + '" cy="103" rx="' + (rx - 2) + '" ry="' + (ry - 2.5) + '" fill="' + eye + '"/>' +
        '<ellipse cx="' + cx + '" cy="108" rx="5" ry="4" fill="#fff" opacity=".28"/>' +
        '<circle cx="' + (cx + 3) + '" cy="96" r="3.4" fill="#fff"/><circle cx="' + (cx - 3.5) + '" cy="107" r="1.6" fill="#fff"/>' + lash;
    }
    var blush = body === 1 ? ".28" : body === 2 ? ".4" : ".55";
    return '<g class="av-eyes">' + one(80, -1) + one(120, 1) + "</g>" +
      '<ellipse cx="66" cy="118" rx="8" ry="4" fill="#ff8fa3" opacity="' + blush + '"/><ellipse cx="134" cy="118" rx="8" ry="4" fill="#ff8fa3" opacity="' + blush + '"/>' +
      (body === 1 ? '<path d="M94 119 Q100 123 106 119" stroke="#8a3b3b" stroke-width="2.6" fill="none" stroke-linecap="round"/>'
        : '<path d="M95 119 Q100 124 105 119" stroke="#8a3b3b" stroke-width="2.6" fill="none" stroke-linecap="round"/>');
  }

  function defaultLook() {
    return { body: 0, skin: 1, hairColor: 1, hair: 0, eyeColor: 0, acc: "acc-bow", shirt: "shirt-tee", pants: "pants-jeans", shoes: "shoes-sneakers" };
  }
  function item(id, slot) {
    var it = BY_ID[id];
    if (!it || it.slot !== slot) it = ITEMS.filter(function (x) { return x.slot === slot && x.cost === 0 && !x.season; }).pop();
    return it;
  }

  function render(look, opts) {
    look = look || defaultLook(); opts = opts || {};
    var skin = SKINS[look.skin] || SKINS[0], hc = HAIR_COLORS[look.hairColor] || HAIR_COLORS[0], style = look.hair || 0;
    var body = BODIES[look.body] || BODIES[0], ax = body.arm;
    TORSO = body.torso;
    var shirt = item(look.shirt, "shirt"), pants = item(look.pants, "pants"), shoes = item(look.shoes, "shoes"), acc = item(look.acc, "acc");
    return '<svg class="avatar' + (opts.cls ? " " + opts.cls : "") + '" viewBox="0 0 200 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Avatar">' +
      '<ellipse cx="100" cy="246" rx="48" ry="6" fill="rgba(0,0,0,.12)"/>' +
      (shirt.back ? shirt.back() : "") +
      hairBack(style, hc) +
      '<rect x="76" y="188" width="18" height="46" rx="8" fill="' + skin + '"/><rect x="106" y="188" width="18" height="46" rx="8" fill="' + skin + '"/>' +
      pants.draw() + shoes.draw(skin) +
      '<path d="M' + ax + ' 150 L' + (ax - 16) + ' 180 M' + (200 - ax) + ' 150 L' + (216 - ax) + ' 180" stroke="' + shirt.color + '" stroke-width="' + (body.key === 1 ? 17 : 15) + '" stroke-linecap="round"/>' +
      '<circle cx="' + (ax - 18) + '" cy="184" r="8" fill="' + skin + '"/><circle cx="' + (218 - ax) + '" cy="184" r="8" fill="' + skin + '"/>' +
      shirt.front() +
      '<circle cx="100" cy="92" r="56" fill="' + skin + '"/>' + face(EYE_COLORS[look.eyeColor] || EYE_COLORS[0], body.key, hc) +
      hairFront(style, hc) + acc.draw() +
      "</svg>";
  }

  /* Story companions */
  var INKY = '<svg class="npc" viewBox="0 0 100 110" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Inky">' +
    '<ellipse cx="50" cy="104" rx="30" ry="4" fill="rgba(0,0,0,.12)"/>' +
    '<path d="M50 6 C62 30 86 50 86 70 A36 34 0 0 1 14 70 C14 50 38 30 50 6 Z" fill="#2d3a8c"/>' +
    '<ellipse cx="34" cy="52" rx="6" ry="10" fill="#fff" opacity=".25" transform="rotate(25 34 52)"/>' +
    '<circle cx="38" cy="68" r="9" fill="#fff"/><circle cx="62" cy="68" r="9" fill="#fff"/><circle cx="40" cy="70" r="5" fill="#1a1f4d"/><circle cx="64" cy="70" r="5" fill="#1a1f4d"/>' +
    '<circle cx="42" cy="68" r="1.8" fill="#fff"/><circle cx="66" cy="68" r="1.8" fill="#fff"/>' +
    '<path d="M44 84 Q50 90 56 84" stroke="#fff" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
    '<ellipse cx="28" cy="80" rx="5" ry="3" fill="#ff8fa3" opacity=".6"/><ellipse cx="72" cy="80" rx="5" ry="3" fill="#ff8fa3" opacity=".6"/></svg>';

  var JUMBLE = '<svg class="npc" viewBox="0 0 130 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Jumble">' +
    '<path d="M4 30 Q14 24 22 30 M2 50 Q12 44 20 50 M6 70 Q16 64 24 70" stroke="#9ccbe8" stroke-width="3" fill="none" stroke-linecap="round"/>' +
    '<g fill="#d8f0ff" stroke="#8cc4e6" stroke-width="2.5"><circle cx="50" cy="56" r="22"/><circle cx="76" cy="40" r="26"/><circle cx="102" cy="58" r="20"/><circle cx="74" cy="66" r="22"/></g>' +
    '<path d="M60 32 q8 -10 16 0 q8 10 -4 12" stroke="#8cc4e6" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
    '<path d="M60 54 Q66 48 72 54 M84 54 Q90 48 96 54" stroke="#24415a" stroke-width="3.5" fill="none" stroke-linecap="round"/>' +
    '<path d="M66 66 Q78 78 90 66" stroke="#24415a" stroke-width="3" fill="#fff" stroke-linecap="round"/>' +
    '<ellipse cx="58" cy="64" rx="5" ry="3" fill="#ff8fa3" opacity=".6"/><ellipse cx="98" cy="64" rx="5" ry="3" fill="#ff8fa3" opacity=".6"/></svg>';

  window.Avatar = {
    SKINS: SKINS, HAIR_COLORS: HAIR_COLORS, EYE_COLORS: EYE_COLORS, BODIES: BODIES, HAIR_STYLES: HAIR_STYLES,
    ITEMS: ITEMS, BY_ID: BY_ID, SLOTS: SLOTS,
    FREE: ITEMS.filter(function (i) { return i.cost === 0 && !i.season; }).map(function (i) { return i.id; }),
    SEASONS: SEASONS,
    defaultLook: defaultLook, render: render, INKY: INKY, JUMBLE: JUMBLE
  };
})();
