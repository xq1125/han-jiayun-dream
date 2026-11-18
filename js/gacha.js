/* ═══════════ 梦境扭蛋机 + 今日签 ═══════════ */
(function () {
  "use strict";
  try {
  const D = window.DREAM_DATA;
  const $ = (s, p) => (p || document).querySelector(s);
  const $$ = (s, p) => Array.from((p || document).querySelectorAll(s));

  const LS_COL = "h jy collection";
  const LS_PITY = "h jy pity";
  const LS_TOTAL = "h jy total";

  let collection = JSON.parse(localStorage.getItem(LS_COL) || "[]");
  let pity = +localStorage.getItem(LS_PITY) || 0;
  let total = +localStorage.getItem(LS_TOTAL) || 0;
  let busy = false;

  const RARITY_COLOR = { N: "#9FB0A0", R: "#A9A3C2", SR: "#E3B7A9", SSR: "#E8722C" };
  const CAP_COLORS = [["#E3B7A9", "#E8C87E"], ["#9FB0A0", "#E3B7A9"], ["#A9A3C2", "#9FB0A0"],
    ["#E8C87E", "#E8722C"], ["#E3B7A9", "#A9A3C2"], ["#9FB0A0", "#E8C87E"]];

  /* ── 蛋池装饰 ── */
  const pool = $("#capsPool");
  for (let i = 0; i < 14; i++) {
    const c = document.createElement("i");
    const [a, b] = CAP_COLORS[i % CAP_COLORS.length];
    c.className = "cap";
    c.style.cssText = `--c1:${a};left:${6 + (i * 13) % 82}%;top:${30 + (i * 29) % 52}%;animation-delay:${(i * 0.37).toFixed(2)}s;transform:scale(${0.7 + (i % 4) * 0.12})`;
    pool.appendChild(c);
  }

  /* ── 抽卡核心 ── */
  function pickCard() {
    pity++; total++;
    let poolSet;
    if (pity >= D.gachaPity) {           // 保底：必出 SSR
      poolSet = D.cards.filter(c => c.rarity === "SSR");
      pity = 0;
    } else {
      const r = Math.random(), R = D.gachaRates;
      let rarity = r < R.SSR ? "SSR" : r < R.SSR + R.SR ? "SR" : r < R.SSR + R.SR + R.R ? "R" : "N";
      poolSet = D.cards.filter(c => c.rarity === rarity);
      if (!poolSet.length) poolSet = D.cards.filter(c => c.rarity === "N");
      if (rarity === "SSR") pity = 0;
    }
    const card = poolSet[Math.floor(Math.random() * poolSet.length)];
    if (!collection.includes(card.id)) collection.push(card.id);
    save();
    return card;
  }
  function save() {
    localStorage.setItem(LS_COL, JSON.stringify(collection));
    localStorage.setItem(LS_PITY, pity);
    localStorage.setItem(LS_TOTAL, total);
  }

  /* ── 卡片渲染 ── */
  function cardFaceHTML(card) {
    const media = card.img
      ? `<img class="c-img" src="${card.img}" alt="" onerror="this.remove()">`
      : `<span class="c-emoji">${card.emoji}</span>`;
    return `<span class="rarity">${card.rarity}</span>${media}<h4>${card.name}</h4><p>${card.text}</p>`;
  }

  const stage = $("#gachaStage"), empty = $("#stageEmpty");
  const card3d = $("#card3d"), inner = $("#card3dInner"), front = $("#cardFront");
  const cardSlot = $("#stageCard"), slotHint = $("#slotHint");
  let flipTimer = null;

  function showCard(card, fast) {
    if (window.SFX) { SFX.flip(); if (card.rarity === "SSR") setTimeout(() => SFX.ssr(), 500); }
    $$(".ten-grid", cardSlot).forEach(n => n.remove());
    empty.hidden = true; card3d.hidden = false;
    card3d.classList.remove("flipped");
    front.className = "card-face card-front " + card.rarity;
    front.innerHTML = cardFaceHTML(card);
    clearTimeout(flipTimer);
    flipTimer = setTimeout(() => card3d.classList.add("flipped"), fast ? 140 : 420);
  }
  card3d.addEventListener("click", () => {
    card3d.classList.toggle("flipped");
    if (window.SFX) SFX.flip();
  });

  /* ── 扭蛋动画 ── */
  const machine = $("#machine"), mouth = $("#machineMouth");
  function dropCapsule(card) {
    if (window.SFX) SFX.drop();
    const cap = document.createElement("i");
    const [a, b] = CAP_COLORS[Math.floor(Math.random() * CAP_COLORS.length)];
    cap.className = "dropping-cap";
    cap.style.background = `linear-gradient(180deg,${card.rarity === "SSR" ? "#E8722C" : a} 0 52%,#F6F1E6 52%)`;
    machine.querySelector(".machine-body").appendChild(cap);
    setTimeout(() => cap.remove(), 1000);
    mouth.animate([{ boxShadow: "inset 0 4px 10px rgba(0,0,0,.4)" },
      { boxShadow: `inset 0 4px 10px rgba(0,0,0,.4),0 0 26px 6px ${RARITY_COLOR[card.rarity]}` },
      { boxShadow: "inset 0 4px 10px rgba(0,0,0,.4)" }], { duration: 1200 });
  }

  async function pull(times) {
    if (busy) return; busy = true;
    $("#btnPull").disabled = $("#btnPull10").disabled = true;
    const results = [];
    for (let i = 0; i < times; i++) {
      machine.classList.add("shaking"); machine.classList.add("turn");
      if (window.SFX) SFX.rattle();
      const card = pickCard();
      await new Promise(r => setTimeout(r, times === 1 ? 480 : 200));
      machine.classList.remove("shaking", "turn");
      dropCapsule(card);
      results.push(card);
      if (times === 1) showCard(card, false);
      await new Promise(r => setTimeout(r, times === 1 ? 900 : 130));
    }
    if (times > 1) showTenPull(results);
    renderAlbum();
    $("#btnPull").disabled = $("#btnPull10").disabled = false;
    busy = false;
  }

  function showTenPull(results) {
    empty.hidden = true; card3d.hidden = true;
    const grid = document.createElement("div");
    grid.style.cssText = "display:grid;grid-template-columns:repeat(5,1fr);gap:10px;width:100%";
    results.forEach((c, i) => {
      const mini = document.createElement("div");
      mini.className = "card-front " + c.rarity;
      mini.style.cssText = "border-radius:4px;padding:10px 6px;font-size:11px;min-height:120px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;color:#3A342A;opacity:0;transform:translateY(16px) scale(.9);transition:.5s";
      mini.innerHTML = `<span class="rarity" style="font-size:9px">${c.rarity}</span><span style="font-size:26px">${c.img ? "🎁" : c.emoji}</span><b style="font-family:var(--serif)">${c.name}</b>`;
      grid.appendChild(mini);
      setTimeout(() => { mini.style.opacity = 1; mini.style.transform = "none"; }, 120 * i);
    });
    stage.querySelectorAll(".ten-grid").forEach(n => n.remove());
    grid.classList.add("ten-grid");
    cardSlot.appendChild(grid);
  }

  $("#machine").addEventListener("click", () => pull(1));
  $("#btnPull").addEventListener("click", () => pull(1));
  $("#btnPull10").addEventListener("click", () => pull(10));
  $("#btnClear").addEventListener("click", () => {
    if (window.SFX) SFX.click();
    card3d.hidden = true; empty.hidden = false;
    $$(".ten-grid", cardSlot).forEach(n => n.remove());
  });

  /* ── 收藏册 ── */
  function renderAlbum() {
    const album = $("#album"); album.innerHTML = "";
    D.cards.forEach(c => {
      const owned = collection.includes(c.id);
      const n = document.createElement("div");
      if (owned) {
        n.className = "got r-" + c.rarity;
        const bg = { N: "#E4E8DE", R: "#E5E0EE", SR: "#F0E0CE", SSR: "#F6E3BE" }[c.rarity];
        n.innerHTML = `<div class="mini" style="background:${bg}"><i class="m-ico">${c.emoji}</i><b class="m-rar">${c.rarity}</b><span class="m-name">${c.name}</span></div>`;
        n.title = `${c.name} — ${c.text}`;
        n.addEventListener("click", () => { showCard(c, false); $("#machine").scrollIntoView({ behavior: "smooth", block: "center" }); });
      } else {
        n.className = "slot-card";
        n.textContent = "?";
      }
      album.appendChild(n);
    });
    $("#albumCount").textContent = `${collection.length} / ${D.cards.length} · 累计 ${total} 抽`;
    $("#pityLine").textContent = `距离保底 SSR 还差 ${Math.max(0, D.gachaPity - pity)} 抽 · 已收 ${collection.length} 张卡`;
  }
  renderAlbum();

  /* ── 重置收藏（两步确认，防误触） ── */
  const btnReset = $("#btnReset");
  let armed = false, armTimer = null;
  if (btnReset) btnReset.addEventListener("click", () => {
    if (!armed) {
      armed = true; btnReset.textContent = "确认?"; btnReset.classList.add("armed");
      if (window.SFX) SFX.click();
      armTimer = setTimeout(() => { armed = false; btnReset.textContent = "↺"; btnReset.classList.remove("armed"); }, 3000);
      return;
    }
    clearTimeout(armTimer); armed = false;
    btnReset.textContent = "↺"; btnReset.classList.remove("armed");
    collection = []; pity = 0; total = 0;
    localStorage.removeItem(LS_COL); localStorage.removeItem(LS_PITY); localStorage.removeItem(LS_TOTAL);
    card3d.hidden = true; empty.hidden = false;
    $$(".ten-grid", cardSlot).forEach(n => n.remove());
    renderAlbum();
    if (window.SFX) SFX.drop();
  });

  /* ── 今日签 ── */
  const box = $("#fortuneBox"), paper = $("#fortunePaper");
  let shaking = false;
  box.addEventListener("click", () => {
    if (shaking) return; shaking = true;
    if (window.SFX) SFX.rattle();
    box.classList.add("shaking");
    paper.hidden = true;
    setTimeout(() => {
      box.classList.remove("shaking");
      const f = D.fortunes[Math.floor(Math.random() * D.fortunes.length)];
      $("#fpLevel").textContent = f.level;
      $("#fpLevel").style.color = { "大吉": "#8A3B2E", "中吉": "#E8722C", "小吉": "#B8905E", "末吉": "#7C8A6E", "平": "#6E6A5E", "怪签": "#4A5A50" }[f.level] || "#3A342A";
      $("#fpDate").textContent = new Date().toLocaleDateString("zh-CN") + " · 第 " + (total || 1) + " 次观测";
      $("#fpTitle").textContent = f.title;
      $("#fpText").textContent = f.text;
      paper.hidden = false;
      if (slotHint) slotHint.hidden = true;
      paper.style.animation = "none"; void paper.offsetWidth; paper.style.animation = "";
      if (window.SFX) SFX.paper();
      shaking = false;
    }, 700);
  });
  } catch (e) { console.error("gacha:", e); }
})();
