/* ═══════════ 梦境音效引擎 · WebAudio 合成，无需音频文件 ═══════════ */
window.SFX = (function () {
  "use strict";
  let ctx = null;
  let on = localStorage.getItem("h jy sfx") !== "0";

  function ac() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function tone(f, d, type, vol, slide, delay) {
    if (!on) return;
    const c = ac(); if (!c) return;
    const t0 = c.currentTime + (delay || 0);
    const o = c.createOscillator(), g = c.createGain();
    o.type = type || "sine";
    o.frequency.setValueAtTime(f, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t0 + d);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol || 0.07, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    o.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0 + d + 0.06);
  }
  function noise(d, vol, freq) {
    if (!on) return;
    const c = ac(); if (!c) return;
    const n = Math.floor(c.sampleRate * d);
    const buf = c.createBuffer(1, n, c.sampleRate);
    const ch = buf.getChannelData(0);
    for (let i = 0; i < n; i++) ch[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = c.createBufferSource(); src.buffer = buf;
    const f = c.createBiquadFilter(); f.type = "bandpass"; f.frequency.value = freq || 900; f.Q.value = 0.8;
    const g = c.createGain(); g.gain.value = vol || 0.05;
    src.connect(f); f.connect(g); g.connect(c.destination);
    src.start();
  }

  const api = {
    click()  { tone(660, 0.06, "triangle", 0.045); },
    step()   { tone(520, 0.05, "sine", 0.04, 640); },
    dice()   { noise(0.28, 0.05, 1200); tone(240, 0.16, "square", 0.025, 170); },
    drop()   { tone(300, 0.12, "sine", 0.07, 140); tone(180, 0.1, "sine", 0.05, 90, 0.09); },
    flip()   { tone(880, 0.08, "triangle", 0.05); tone(1175, 0.12, "triangle", 0.05, 0, 0.07); },
    ssr()    { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.24, "triangle", 0.055, 0, i * 0.09)); },
    rattle() { noise(0.22, 0.055, 700); },
    paper()  { tone(1400, 0.16, "sine", 0.028, 420); },
    toggle() {
      on = !on;
      localStorage.setItem("h jy sfx", on ? "1" : "0");
      const b = document.getElementById("sfxBtn");
      if (b) { b.textContent = on ? "🔊" : "🔇"; b.title = on ? "音效：开（点击关闭）" : "音效：关（点击开启）"; }
      if (on) api.click();
    }
  };

  function mount() {
    const b = document.createElement("button");
    b.id = "sfxBtn"; b.type = "button";
    b.textContent = on ? "🔊" : "🔇";
    b.title = on ? "音效：开（点击关闭）" : "音效：关（点击开启）";
    b.addEventListener("click", api.toggle);
    document.body.appendChild(b);
  }
  if (document.readyState === "loading") addEventListener("DOMContentLoaded", mount);
  else mount();

  return api;
})();
