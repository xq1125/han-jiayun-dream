/* ═══════════ 韩佳韵™ · 主引擎 ═══════════ */
(function () {
  "use strict";
  const D = window.DREAM_DATA;
  const $ = (s, p) => (p || document).querySelector(s);
  const $$ = (s, p) => Array.from((p || document).querySelectorAll(s));
  const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!REDUCED) document.body.classList.add("js-anim"); // 隐藏态只由 JS 接管，JS 失效内容直接可见

  /* ───────── ① 载入梦境序列 ───────── */
  const intro = $("#dream-intro");
  const MSGS = [
    "正在校准梦境频率…",
    "咖啡因注入中 · 40%",
    "突发奇想装载中 · 30%",
    "待机放空模块预热 · 30%",
    "正在模拟汤包香气…",
    "偷走一点凌晨三点的光…",
    "质检员已入睡，章自动盖下…",
    "梦境就绪，欢迎光临"
  ];
  let introDone = sessionStorage.getItem("h jy intro") === "1";
  function endIntro() {
    if (!intro || intro.classList.contains("gone")) return;
    intro.classList.add("gone");
    sessionStorage.setItem("h jy intro", "1");
    document.body.classList.add("entered");
    setTimeout(() => intro.remove(), 1800);
  }
  if (!intro || introDone || REDUCED) {
    if (intro) { intro.remove(); document.body.classList.add("entered"); }
  } else {
    const fill = $("#introFill"), pct = $("#introPct"), msg = $("#introMsg");
    let p = 0, mi = 0;
    const tick = setInterval(() => {
      p = Math.min(100, p + Math.random() * 9 + 3);
      fill.style.width = p + "%";
      pct.textContent = Math.floor(p) + "%";
      const ni = Math.min(MSGS.length - 1, Math.floor(p / 100 * MSGS.length));
      if (ni !== mi) { mi = ni; msg.style.opacity = 0;
        setTimeout(() => { msg.textContent = MSGS[mi]; msg.style.opacity = 1; }, 260); }
      if (p >= 100) { clearInterval(tick); setTimeout(endIntro, 700); }
    }, 260);
    $("#introSkip").addEventListener("click", endIntro);
    addEventListener("keydown", e => { if (e.key === "Escape") endIntro(); });
    setTimeout(endIntro, 9000); // 保险
  }

  /* ───────── ② 天空场景切换 ───────── */
  const layers = {};
  $$(".sky-layer").forEach(l => layers[l.dataset.scene] = l);
  function setScene(name) {
    if (!layers[name]) return;
    $$(".sky-layer").forEach(l => l.classList.toggle("active", l === layers[name]));
    document.body.className = document.body.className.replace(/scene-\S+/g, "").trim() + " scene-" + name;
  }
  const sceneObs = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) setScene(en.target.dataset.scene); });
  }, { rootMargin: "-35% 0px -55% 0px" });
  $$(".scene").forEach(s => sceneObs.observe(s));
  setScene("dawn");

  /* ───────── ③ 滚动入场 ───────── */
  const revObs = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        if (en.target.dataset.stagger !== undefined) en.target.classList.add("in");
        revObs.unobserve(en.target);
      }
    });
  }, { threshold: 0.12 });
  function watchReveal() { $$(".reveal:not(.in),.stagger:not(.in)").forEach(el => revObs.observe(el)); }

  /* ───────── ④ 云视差 ───────── */
  if (!REDUCED) {
    const clouds = $$(".cloud");
    let ticking = false;
    addEventListener("scroll", () => {
      if (ticking) return; ticking = true;
      requestAnimationFrame(() => {
        const y = scrollY;
        clouds.forEach((c, i) => { c.style.marginTop = (y * (0.02 + i * 0.012)) % 240 + "px"; });
        ticking = false;
      });
    }, { passive: true });
  }

  /* ───────── ⑤ 导航 ───────── */
  const nav = $("#nav");
  addEventListener("scroll", () => nav.classList.toggle("show", scrollY > innerHeight * 0.5), { passive: true });

  /* ───────── ⑥ HERO 标题逐字入场 ───────── */
  (function heroTitle() {
    const h = $("#heroTitle"); if (!h) return;
    const text = h.dataset.text || h.textContent;
    h.textContent = "";
    [...text].forEach((ch, i) => {
      const s = document.createElement("span");
      s.className = "ltr"; s.textContent = ch;
      s.style.animationDelay = (0.15 + i * 0.18) + "s";
      h.appendChild(s);
    });
    const tm = document.createElement("span");
    tm.className = "tm ltr"; tm.textContent = "™";
    tm.style.animationDelay = (0.15 + text.length * 0.18) + "s";
    h.appendChild(tm);
  })();

  /* ───────── ⑦ 数据渲染 ───────── */
  const el = (tag, cls, html) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html !== undefined) n.innerHTML = html;
    return n;
  };

  // 成分条
  const ingList = $("#ingList");
  D.ingredients.forEach(g => {
    const row = el("div", "ing-row");
    row.innerHTML = `<div class="lab"><span>${g.label}<small style="opacity:.6"> · ${g.note}</small></span><b>${g.pct}%</b></div><div class="ing-bar"><i style="background:${g.color}"></i></div>`;
    ingList.appendChild(row);
  });
  // 附加风味
  const chips = $("#flavorChips");
  D.flavors.forEach(f => chips.appendChild(el("span", "chip", f)));
  // 功能特性
  const feats = $("#featGrid"); feats.classList.add("stagger");
  D.features.forEach(f => {
    const c = el("div", "feat glass");
    c.innerHTML = `<span class="ico">${f.ico}</span><h4>${f.name}</h4><p>${f.desc}</p>`;
    feats.appendChild(c);
  });
  // 说明书
  $("#manualDecl").textContent = D.declaration;
  const mlist = $("#manualList");
  D.notices.forEach(n => mlist.appendChild(el("li", null, n)));
  $("#manualWarn").textContent = D.warning;
  $("#footDecl").textContent = D.declaration;
  const mx = $("#manualExtra");
  if (mx) (D.manualExtra || []).forEach(m => {
    mx.appendChild(el("h4", null, m.h));
    mx.appendChild(el("p", "manual-p", m.p));
  });

  // 成分条动画（进入视口时）
  const barObs = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) {
      $$(".ing-bar i", e.target).forEach((b, i) => {
        setTimeout(() => b.style.width = D.ingredients[i].pct + "%", 150 * i);
      });
      barObs.unobserve(e.target);
    }
  }), { threshold: 0.4 });
  barObs.observe(ingList);

  /* ───────── ⑧ 作品货架 ───────── */
  const shelf = $("#shelf"); shelf.classList.add("stagger");
  D.works.forEach((w, i) => {
    const card = el("article", "product glass" + (w.type === "video" ? " is-video" : ""));
    card.style.transitionDelay = (i % 3) * 0.1 + "s";
    card.innerHTML = `
      ${w.badge ? `<span class="p-badge">${w.badge}</span>` : ""}
      <div class="p-img"><span class="p-no">NO.${w.no}</span><span class="p-cat">${w.cat}</span>
        <img src="${w.images[0]}" alt="${w.title}" loading="lazy" onerror="this.parentNode.style.background='#D8CDB6';this.remove()"></div>
      <div class="p-body">
        <h3>${w.title}</h3>
        <p class="p-sub">${w.sub} · ${w.year}</p>
        <div class="p-foot"><span class="p-price">${w.price}</span><span class="p-more">查看 →</span></div>
      </div>`;
    card.addEventListener("click", () => openLightbox(i));
    shelf.appendChild(card);
  });
  // （货架不再放占位卡；上传预留位见「我的包」区块与 README-上传指南.md）

  /* ───────── ⑨ 梦境大富翁 ───────── */
  function boardGame() {
    const board = $("#board");
    if (!board || !D.board || D.board.length !== 20) { console.warn("board data missing"); return; }
    const N = 20, PER = 5;
    const wait = ms => new Promise(r => setTimeout(r, ms));
    const sideOf = i => Math.floor(i / PER);
    const KIND_LABEL = { event: "MILESTONE · 里程碑", chance: "CHANCE · 机会", rest: "REST · 休息", secret: "SECRET · 隐藏" };

    // 棋盘中心装饰
    const cen = el("div", "board-center");
    cen.innerHTML = `<svg class="bc-eye" viewBox="0 0 200 120"><path d="M10 60 Q100 -10 190 60 Q100 130 10 60 Z" fill="none" stroke="rgba(74,63,46,.6)" stroke-width="4"/><circle cx="100" cy="58" r="24" fill="#E8722C"/><circle cx="100" cy="58" r="10" fill="#3A342A"/><circle cx="107" cy="51" r="4" fill="#fff" opacity=".9"/></svg>
      <span class="bc-title">梦境大富翁</span><span class="bc-sub">HAN JIAYUN™ MONOPOLY · 员工人数 1</span>`;
    board.appendChild(cen);

    // 格子（4 角格 + 每边 4 格，角格 16% 见方，边格 17% 长条，互不重叠）
    const tiles = [];
    function tilePos(i) {
      const s = Math.floor(i / 5), k = i % 5;
      if (k === 0) {
        const p = { width: "16%", height: "16%" };
        if (s === 0) { p.left = "0"; p.bottom = "0"; }
        if (s === 1) { p.right = "0"; p.bottom = "0"; }
        if (s === 2) { p.right = "0"; p.top = "0"; }
        if (s === 3) { p.left = "0"; p.top = "0"; }
        return p;
      }
      const off = 16 + (k - 1) * 17;
      if (s === 0) return { left: off + "%", bottom: "0", width: "17%", height: "16%" };
      if (s === 1) return { right: "0", bottom: off + "%", width: "16%", height: "17%" };
      if (s === 2) return { right: off + "%", top: "0", width: "17%", height: "16%" };
      return { left: "0", top: off + "%", width: "16%", height: "17%" };
    }
    const PHOTOS = D.tilePhotos || [];
    D.board.forEach((t, i) => {
      const d = el("button", "tile k-" + t.kind + (i === 0 ? " k-go" : ""));
      d.type = "button";
      const p = tilePos(i);
      for (const key in p) d.style[key] = p[key];
      const ph = PHOTOS[i];
      d.innerHTML = `${ph ? `<img class="t-photo" src="assets/img/${ph}.jpg" alt="" loading="lazy" onerror="this.remove()">` : ""}${i === 0 ? '<span class="t-go">GO</span>' : ""}<span class="t-ico">${t.ico}</span>${i !== 0 && t.year ? `<span class="t-year">${t.year}</span>` : ""}<span class="t-lab">${t.title}</span>`;
      d.addEventListener("click", () => { if (!rolling) { if (window.SFX) SFX.click(); movePieceTo(i); showTile(i); } });
      board.appendChild(d); tiles.push(d);
    });

    // 双棋子：⭐ 韩佳韵 · 🌙 zky（星月同行，立体兵造型）
    const PAWN = em => `<i class="pd"></i><i class="pb"></i><i class="ph"></i><span class="pe">${em}</span>`;
    const piece = el("div", null, PAWN("⭐")); piece.id = "piece";
    const piece2 = el("div", null, PAWN("🌙")); piece2.id = "piece2";
    board.appendChild(piece); board.appendChild(piece2);
    const centerOf = i => {
      const s = Math.floor(i / 5), k = i % 5;
      if (k === 0) return s === 0 ? { x: 8, y: 92 } : s === 1 ? { x: 92, y: 92 } : s === 2 ? { x: 92, y: 8 } : { x: 8, y: 8 };
      const c = 16 + (k - 1) * 17 + 8.5;
      if (s === 0) return { x: c, y: 92 };
      if (s === 1) return { x: 92, y: 100 - c };
      if (s === 2) return { x: 100 - c, y: 8 };
      return { x: 8, y: c };
    };
    function place(i) {
      const c = centerOf(i);
      piece.style.left = (c.x - 4.5 - 2.6) + "%"; piece.style.top = (c.y - 6.5) + "%";
      piece2.style.left = (c.x - 4.5 + 2.6) + "%"; piece2.style.top = (c.y - 6.5) + "%";
    }

    // 状态（存档：回合数/汤包/位置）
    let turns = 0, tbao = 0, posI = 0, rolling = false;
    try {
      const sv = JSON.parse(localStorage.getItem("h jy mono") || "{}");
      turns = sv.turns | 0; tbao = sv.tbao | 0; posI = (sv.pos | 0) % N;
    } catch (e) {}
    function save() { localStorage.setItem("h jy mono", JSON.stringify({ turns, tbao, pos: posI })); }
    let view = localStorage.getItem("h jy view") === "1" ? "zky" : "hjy";
    let lastShown = null;
    function info() { $("#diceInfo").textContent = `回合 ${turns} · 汤包 ×${tbao} · ${view === "zky" ? "🌙 朋友视角" : "⭐ 本人视角"}`; }
    function setView(v) {
      view = v; localStorage.setItem("h jy view", v === "zky" ? "1" : "0");
      const bh = $("#btnViewH"), bz = $("#btnViewZ");
      if (bh) bh.classList.toggle("on", v === "hjy");
      if (bz) bz.classList.toggle("on", v === "zky");
      info(); if (lastShown !== null) showTile(lastShown);
    }
    place(posI); info();
    const bh = $("#btnViewH"), bz = $("#btnViewZ");
    if (bh) bh.addEventListener("click", () => { if (window.SFX) SFX.click(); setView("hjy"); });
    if (bz) bz.addEventListener("click", () => { if (window.SFX) SFX.click(); setView("zky"); });
    setView(view);

    function showTile(i) {
      lastShown = i;
      tiles.forEach((t, j) => t.classList.toggle("cur", j === i));
      const t = D.board[i];
      const useZ = view === "zky" && t.zky;
      $("#tileCard").innerHTML =
        `<p class="tc-kind">${KIND_LABEL[t.kind]}<span class="tc-view">${useZ ? "🌙 朋友视角" : "⭐ 本人视角"}</span></p><h4>${t.ico} ${t.title}${t.year ? `<small>${t.year}</small>` : ""}</h4><p>${useZ ? t.zky.text : t.text}</p>`;
    }
    function toast(msg) {
      const t = el("div", "mono-toast", msg); board.appendChild(t);
      setTimeout(() => t.remove(), 2300);
    }
    async function stepTo(target) {
      while (posI !== target) { posI = (posI + 1) % N; place(posI); if (window.SFX) SFX.step(); await wait(300); }
    }
    async function stepBack(target) {
      while (posI !== target) { posI = (posI + N - 1) % N; place(posI); if (window.SFX) SFX.step(); await wait(300); }
    }
    function sleepBoth(ms) {
      piece.classList.add("sleep"); piece2.classList.add("sleep");
      setTimeout(() => { piece.classList.remove("sleep"); piece2.classList.remove("sleep"); }, ms);
    }
    async function resolve(i, chained) {
      const t = D.board[i];
      if (!t.effect) { if (t.kind === "rest") { sleepBoth(2400); toast("💤 " + t.title + "：睡一轮再说"); } return; }
      const e = t.effect;
      if (e.type === "forward") { toast("☕ " + t.title + "：前进 " + e.n + " 格"); await wait(900); await stepTo((i + e.n) % N); showTile(posI); }
      else if (e.type === "back") { toast("🎫 " + t.title + "：后退 " + e.n + " 格，无惩罚"); await wait(900); await stepBack((i + N - e.n) % N); showTile(posI); }
      else if (e.type === "tbao") { tbao++; toast("🥟 汤包 +1！当前 ×" + tbao); }
      else if (e.type === "talk") { toast("🗣 已聊两小时，对方已读不回失败"); }
      else if (e.type === "stall") { sleepBoth(2000); toast("💡 突发奇想：原地思考人生中…"); }
      if (!chained) info();
    }
    function movePieceTo(i) { posI = i; place(i); save(); }

    $("#btnRoll").addEventListener("click", async () => {
      if (rolling) return; rolling = true;
      if (window.SFX) SFX.dice();
      const dEl = $("#die"), faces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
      dEl.classList.add("rolling");
      const spin = setInterval(() => dEl.textContent = faces[Math.floor(Math.random() * 6)], 80);
      const n = 1 + Math.floor(Math.random() * 6);
      await wait(650); clearInterval(spin);
      dEl.textContent = faces[n - 1]; dEl.classList.remove("rolling");
      turns++;
      await stepTo((posI + n) % N);
      showTile(posI);
      await resolve(posI, false);
      save(); info();
      rolling = false;
    });
  }
  try { boardGame(); } catch (e) { console.error("board:", e); }

  /* ───────── ⑩ 我的包 ───────── */
  const bagGrid = $("#bagGrid"); bagGrid.classList.add("stagger");
  D.bag.forEach(b => {
    const item = el("div", "bag-item glass");
    item.innerHTML = `<span class="b-ico">${b.ico}</span><h4>${b.name}</h4><p>${b.note}</p>`;
    bagGrid.appendChild(item);
  });
  [["🎬", "塞进一段视频", "assets/videos/ + data.js"], ["🖼", "塞进一张图", "assets/works/ + data.js"],
   ["🎵", "塞进一首歌单", "data.js 的 flavors 里"], ["✨", "塞进任何新鲜事物", "README 教你怎么塞"]]
    .forEach(([ico, name, note]) => {
      const slot = el("a", "bag-item slot");
      slot.href = "README-上传指南.md"; slot.target = "_blank";
      slot.innerHTML = `<b>${ico}</b><span>${name}</span><small>${note}</small>`;
      bagGrid.appendChild(slot);
    });

  /* ───────── ⑪ 售后 ───────── */
  const cc = $("#contactCard"); cc.classList.add("glass");
  cc.innerHTML = `
    <div><b>📮 邮箱</b><br>${D.contact.email}</div>
    <div><b>💬 微信</b><br>${D.contact.wechat}</div>
    <div><b>🧭 求职意向</b><br>${D.contact.intent}</div>
    <div><b>📍 坐标</b><br>${D.contact.city}</div>
    <div class="cc-full"><b>🔢 ${D.contact.phone}</b><br>${D.contact.note}</div>`;

  /* ───────── ⑫ 访客计数器（固定数字，见 data.visitors） ───────── */
  const vs = D.visitors || { total: "1113", sleeping: "0502" };
  $("#visitorNum").textContent = vs.total;
  $("#visitorSleep").textContent = vs.sleeping;

  /* ───────── ⑬ 灯箱 ───────── */
  const lb = $("#lightbox");
  let lbIndex = 0;
  function openLightbox(i) {
    if (window.SFX) SFX.click();
    lbIndex = i;
    const w = D.works[i];
    $("#lbTitle").textContent = `NO.${w.no} · ${w.title}`;
    $("#lbMeta").textContent = `${w.sub} · ${w.year} · 定价 ${w.price}`;
    const body = $("#lbBody"); body.innerHTML = "";
    const desc = el("p", "lb-desc", w.desc); body.appendChild(desc);
    const tags = el("div", "lb-tags"); w.tags.forEach(t => tags.appendChild(el("span", null, t)));
    body.appendChild(tags);
    if (w.type === "video" && w.video) {
      if (w.video.bilibili) {
        const f = el("iframe");
        f.src = `//player.bilibili.com/player.html?bvid=${w.video.bilibili}&page=1&high_quality=1`;
        f.allowFullscreen = true; body.appendChild(f);
      } else if (w.video.src) {
        const v = el("video"); v.src = w.video.src; v.controls = true; v.playsInline = true;
        body.appendChild(v);
      }
    }
    w.images.forEach(src => {
      const img = el("img"); img.src = src; img.alt = w.title; img.loading = "lazy";
      img.onerror = () => img.remove();
      body.appendChild(img);
    });
    if (w.link) {
      const a = el("a", "lb-link", w.link.label); a.href = w.link.url; a.target = "_blank";
      body.appendChild(a);
    }
    $("#lbCount").textContent = `${i + 1} / ${D.works.length}`;
    lb.hidden = false; document.body.style.overflow = "hidden";
  }
  function closeLightbox() { lb.hidden = true; document.body.style.overflow = ""; }
  $("#lbClose").addEventListener("click", closeLightbox);
  $(".lb-backdrop").addEventListener("click", closeLightbox);
  $("#lbPrev").addEventListener("click", () => openLightbox((lbIndex - 1 + D.works.length) % D.works.length));
  $("#lbNext").addEventListener("click", () => openLightbox((lbIndex + 1) % D.works.length));
  addEventListener("keydown", e => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft") $("#lbPrev").click();
    if (e.key === "ArrowRight") $("#lbNext").click();
  });

  /* ───────── ⑭ 装饰明信片（素材图，缺图自动隐藏） ───────── */
  const PCS = [
    { sec: "#hero", img: "assets/img/road-dusk.jpg", cap: "DREAM CHANNEL 01", rot: "-3deg", pos: "left:-3%;bottom:12%" },
    { sec: "#specs", img: "assets/works/profile.jpg", cap: "FACTORY REPORT", rot: "7deg", pos: "right:-5%;top:30%" },
    { sec: "#specs", img: "assets/img/caffeine-cloud.jpg", cap: "CAFFEINE 40%", rot: "-7deg", pos: "left:-4%;top:6%" },
    { sec: "#manual", img: "assets/img/floating-bed.jpg", cap: "SLEEP MODE ON", rot: "-8deg", pos: "right:-6%;bottom:6%" },
    { sec: "#manual", img: "assets/img/sky-eye.jpg", cap: "SKY IS WATCHING", rot: "5deg", pos: "left:-5%;top:14%" },
    { sec: "#shop", img: "assets/img/sunset-arcade.jpg", cap: "OPEN 24AM", rot: "-4deg", pos: "right:-5%;top:4%" },
    { sec: "#story", img: "assets/img/orange-bloom.jpg", cap: "ORANGE BLOOM", rot: "6deg", pos: "left:-4%;top:6%" },
    { sec: "#story", img: "assets/img/sky-door.jpg", cap: "NEXT STATION", rot: "-9deg", pos: "right:-6%;bottom:4%" },
    { sec: "#gacha", img: "assets/img/gashapon.jpg", cap: "GACHAPON", rot: "-5deg", pos: "right:-6%;top:10%" },
    { sec: "#bag", img: "assets/img/xiaolongbao.jpg", cap: "SOUP DUMPLING", rot: "4deg", pos: "left:-5%;top:10%" },
    { sec: "#contact", img: "assets/img/milk-moon.jpg", cap: "MILK & MOON", rot: "-6deg", pos: "right:-4%;top:16%" }
  ];
  PCS.forEach(p => {
    const sec = $(p.sec); if (!sec) return;
    const card = el("figure", "postcard");
    card.dataset.cap = p.cap;
    card.style.cssText += p.pos + `;--rot:${p.rot}`;
    const img = el("img"); img.src = p.img; img.alt = ""; img.loading = "lazy";
    img.onerror = () => card.remove();
    card.appendChild(img); sec.appendChild(card);
  });

  /* ───────── ⑮ 天空彩蛋：点月亮换频道 ───────── */
  const moon = $("#heroMoon");
  const CHANNELS = ["dawn", "morning", "noon", "afternoon", "dusk", "night", "latenight"];
  if (moon) {
    moon.style.cursor = "pointer";
    moon.title = "换台：梦境频道";
    let ch = 0;
    moon.addEventListener("click", () => {
      if (window.SFX) SFX.click();
      ch = (ch + 1) % CHANNELS.length;
      setScene(CHANNELS[ch]);
      moon.animate([{ transform: "scale(1)" }, { transform: "scale(1.25)" }, { transform: "scale(1)" }], { duration: 700 });
    });
  }

  watchReveal();
  // 动态插入的元素补观察
  setTimeout(watchReveal, 100);
  window.__dreamOK = true; // 向看门狗报到
})();
