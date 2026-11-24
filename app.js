(() => {
'use strict';
const BASE = document.body.dataset.base || '';
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let unlockNarration = null, readingScan = null;
let startGlide = null, autoScrollHold = null, autoScrollRelease = null;
let glideNudge = null, releaseCompanion = null;
const guestEl = document.querySelector('.sh-letter .guest-name');
const named = !!(guestEl && guestEl.textContent.trim());
document.body.classList.toggle('is-named', named);
document.querySelectorAll(named ? '.only-plain' : '.only-named').forEach((el) => el.remove());
if (named) {
const line = guestEl.parentElement;
const fitName = () => {
for (let gs = 64; gs >= 34; gs -= 2) {
line.style.setProperty('--gs', gs);
if (line.scrollWidth <= line.clientWidth + 1) break;
}
};
fitName();
if (document.fonts) document.fonts.ready.then(fitName);
window.addEventListener('resize', fitName, { passive: true });
}
const gSlug = named ? (new URLSearchParams(location.search).get('g') || '') : '';
const fnv = [...gSlug].reduce((a, c) => Math.imul(a ^ c.charCodeAt(0), 16777619) >>> 0, 2166136261);
let lucky = 1 + ((fnv >>> 8) % 300);
if (!gSlug) {
lucky = 0;
try { lucky = Number(localStorage.getItem('huh-suvd-lucky')) || 0; } catch (_) {  }
if (!(lucky >= 1 && lucky <= 300)) {
lucky = 1 + Math.floor(Math.random() * 300);
try { localStorage.setItem('huh-suvd-lucky', String(lucky)); } catch (_) {  }
}
}
const tableEl = document.querySelector('[data-table]');
if (tableEl && gSlug) tableEl.textContent = `№ ${1 + (fnv % 24)}`;
const luckyEl = document.querySelector('[data-lucky-num]');
if (luckyEl) luckyEl.textContent = `№ ${String(lucky).padStart(3, '0')}`;
const musicBtn = document.getElementById('music-btn');
const bgMusic = document.getElementById('bg-music');
let bedHeld = false;
const bedWanted = () => !!musicBtn && musicBtn.getAttribute('aria-pressed') === 'true';
const setBed = (on) => {
if (!musicBtn) return;
musicBtn.setAttribute('aria-pressed', on ? 'true' : 'false');
musicBtn.setAttribute('aria-label', on ? 'Хөгжмийг зогсоох' : 'Хөгжим тоглуулах');
};
const startBed = (vol) => {
if (!bgMusic) return;
if (typeof vol === 'number') bgMusic.volume = vol;
setBed(true);
const p = bgMusic.play();
if (p && p.catch) p.catch(() => {
setBed(false);
const again = () => { bgMusic.play().then(() => setBed(true)).catch(() => {}); };
document.addEventListener('pointerdown', again, { once: true });
});
};
if (musicBtn && bgMusic) {
musicBtn.addEventListener('click', () => {
if (!bedWanted()) { bgMusic.volume = 1; startBed(); } else { bgMusic.pause(); setBed(false); }
});
bgMusic.addEventListener('pause', () => { if (!bedHeld) setBed(false); });
bgMusic.addEventListener('play', () => setBed(true));
}
const rvs = document.querySelectorAll('.rv');
let gateOpen = !!document.getElementById('gate');
const revealHero = () => document.querySelectorAll('.sh-hero .rv').forEach((el) => el.classList.add('is-in'));
if (reduceMotion || !('IntersectionObserver' in window)) {
rvs.forEach((el) => el.classList.add('is-in'));
} else {
const io = new IntersectionObserver((entries) => {
entries.forEach((e) => {
if (!e.isIntersecting) return;
if (gateOpen && e.target.closest('.sh-hero')) return;
e.target.classList.add('is-in');
io.unobserve(e.target);
});
}, { threshold: 0.12 });
rvs.forEach((el) => io.observe(el));
}
const leaveGate = () => {
const gate = document.getElementById('gate');
gateOpen = false;
document.body.classList.remove('is-gated');
document.body.classList.add('is-open');
revealHero();
if (releaseCompanion) releaseCompanion();
const mBird = musicBtn && musicBtn.querySelector('.music-bird');
if (mBird && !reduceMotion) {
musicBtn.classList.add('is-greeting');
mBird.addEventListener('animationend', () => musicBtn.classList.remove('is-greeting'), { once: true });
}
if (startGlide) startGlide(1000);
if (readingScan) readingScan();
if (!gate) return;
gate.classList.add('is-going');
const drop = () => gate.remove();
gate.addEventListener('transitionend', drop, { once: true });
setTimeout(drop, 1100);
};
const gate = document.getElementById('gate');
if (gate && gate.classList.contains('gate--film')) {
try { history.scrollRestoration = 'manual'; } catch (_) {}
window.scrollTo(0, 0);
const FILM_MS = 2600;
const STALL_MS = 2500;
const HOLD_MS = 250;
const SKIP_AFTER_MS = 1500;
const HARD_MS = 9000;
const stage = document.getElementById('g-stage');
const vid = document.getElementById('g-vid');
const hint = document.getElementById('g-hint');
const openBtn = document.getElementById('gate-btn');
const skip = document.getElementById('g-skip');
let opening = false, finished = false, pressedAt = 0, watchdog = 0, skipTimer = 0, hardTimer = 0;
const land = () => {
const plate = document.querySelector('.sh-hero .plate');
const gr = gate.getBoundingClientRect(), st = stage.getBoundingClientRect();
const hr = plate && plate.getBoundingClientRect();
if (!hr || hr.width < 50 || hr.bottom <= 0 || hr.top >= gr.height) { leaveGate(); return; }
const x = hr.left - (gr.left + gr.width / 2), y = hr.top - (gr.top + gr.height / 2);
gate.classList.add('is-landing');
stage.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) scale(${(hr.width / st.width).toFixed(5)})`;
setTimeout(leaveGate, 780);
};
const finishOpen = () => {
if (finished) return;
finished = true;
clearTimeout(watchdog); clearTimeout(skipTimer); clearTimeout(hardTimer);
const atEnd = !!vid && (vid.ended || (vid.duration > 0 && vid.currentTime >= vid.duration - 0.15));
try { vid.pause(); } catch (_) {}
if (bgMusic && !bgMusic.paused) bgMusic.volume = 1;
if (atEnd && !reduceMotion) land(); else leaveGate();
};
const openInvite = () => {
if (finished) return;
if (opening) { if (Date.now() - pressedAt > 600) finishOpen(); return; }
opening = true;
pressedAt = Date.now();
hint.classList.remove('is-on');
startBed(reduceMotion ? 1 : 0.3);
if (unlockNarration) unlockNarration();
if (reduceMotion || !vid) { finishOpen(); return; }
gate.classList.add('is-playing');
vid.addEventListener('ended', () => setTimeout(finishOpen, HOLD_MS), { once: true });
vid.addEventListener('error', finishOpen, { once: true });
const src = vid.querySelector('source');
if (src) src.addEventListener('error', finishOpen, { once: true });
const arm = (ms) => { clearTimeout(watchdog); watchdog = setTimeout(finishOpen, ms); };
let lastT = 0;
arm(FILM_MS + STALL_MS);
hardTimer = setTimeout(finishOpen, HARD_MS);
vid.addEventListener('timeupdate', () => {
if (vid.currentTime > lastT) { lastT = vid.currentTime; arm(STALL_MS); }
if (bgMusic && !bgMusic.paused && vid.duration > 0) bgMusic.volume = Math.min(1, 0.3 + 0.7 * vid.currentTime / vid.duration);
});
const p = vid.play();
if (p && typeof p.catch === 'function') p.catch(finishOpen);
skipTimer = setTimeout(() => gate.classList.add('can-skip'), SKIP_AFTER_MS);
};
if (reduceMotion) gate.classList.add('no-motion');
else setTimeout(() => { if (!opening) hint.classList.add('is-on'); }, 700);
gate.addEventListener('click', openInvite);
gate.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openInvite(); } });
if (openBtn) openBtn.addEventListener('click', (e) => { e.stopPropagation(); openInvite(); });
if (skip) skip.addEventListener('click', (e) => { e.stopPropagation(); finishOpen(); });
}
(() => {
const host = document.querySelector('[data-narration]');
if (!host || !bgMusic) return;
const title = host.querySelector('.t-l-urilga') || host;
const MUSIC_DUCK = 0.16;
const canDuck = (() => {
const v = bgMusic.volume;
bgMusic.volume = 0.5;
const ok = Math.abs(bgMusic.volume - 0.5) < 0.02;
bgMusic.volume = v;
return ok;
})();
let duckTimer = 0;
const rampMusic = (to) => {
clearInterval(duckTimer);
const from = bgMusic.volume;
let i = 0;
duckTimer = setInterval(() => {
i += 1;
bgMusic.volume = Math.min(1, Math.max(0, from + (to - from) * (i / 12)));
if (i >= 12) { clearInterval(duckTimer); duckTimer = 0; }
}, 40);
};
const quietBed = () => { if (canDuck) rampMusic(MUSIC_DUCK); else if (!bgMusic.paused) bgMusic.pause(); };
const loudBed = () => {
bedHeld = false;
if (canDuck) rampMusic(1); else bgMusic.volume = 1;
if (bgMusic.paused && bedWanted()) bgMusic.play().catch(() => setBed(false));
};
const voice = new Audio();
voice.preload = 'none';
voice.muted = true;
let loaded = false, unlocked = false, unlocking = false, heard = false;
let wanted = false, starting = false, reading = false, done = false;
const load = () => {
if (loaded) return;
loaded = true;
voice.src = spliced ? spliced.url : host.dataset.narration;
try { voice.load(); } catch (_) {  }
};
unlockNarration = () => {
if (unlocked) return;
unlocked = true;
load();
voice.muted = true;
unlocking = true;
const back = () => { unlocking = false; if (!reading && !starting) { voice.pause(); try { voice.currentTime = 0; } catch (_) {  } } };
try { const p = voice.play(); if (p && typeof p.then === 'function') p.then(back, back); else back(); } catch (_) { unlocking = false; }
};
const base = (host.dataset.times || '').split(',').filter(Boolean).map(Number).filter((n) => !Number.isNaN(n));
let times = base;
const kws = [], heads = [], kinds = [];
if (base.length) {
for (const el of host.querySelectorAll('[data-karaoke]')) {
if (el.hidden) continue;
const kind = el.classList.contains('guest-name') ? 'name' : el.classList.contains('sal-tail') ? 'tail' : '';
const frag = document.createDocumentFragment();
let first = true;
for (const tok of (el.textContent || '').split(/(\s+)/)) {
if (!tok) continue;
if (/^\s+$/.test(tok)) { frag.append(tok); continue; }
const span = document.createElement('span');
span.className = 'kw';
span.textContent = tok;
frag.append(span);
heads.push(first || /[,.!?]$/.test(kws[kws.length - 1].textContent));
kws.push(span);
kinds.push(kind);
first = false;
}
el.textContent = '';
el.append(frag);
}
}
const spliceName = async () => {
const g = new URLSearchParams(location.search).get('g');
const AC = window.AudioContext || window.webkitAudioContext;
if (!g || !AC || !host.dataset.nameVoice) return null;
const at = Number(host.dataset.nameAt), skip = Number(host.dataset.nameSkip);
const c0 = Number(host.dataset.cutFrom), c1 = Number(host.dataset.cutTo), tail = host.dataset.tail !== 'hidden';
const get = (u) => fetch(u).then((r) => { if (!r.ok) throw new Error(String(r.status)); return r.arrayBuffer(); });
const [a, b, c] = await Promise.all([
get(host.dataset.narration), get(host.dataset.nameVoice + encodeURIComponent(g)).catch(() => null), tail ? get(host.dataset.nameTanyg) : null,
]);
const ac = new AC();
const dec = (buf) => new Promise((ok, no) => ac.decodeAudioData(buf, ok, no));
let take, said = null, tanyg = null;
try {
take = await dec(a);
if (b) said = await dec(b).catch(() => null);
if (c) tanyg = await dec(c);
} finally { try { ac.close(); } catch (_) {  } }
const T = take.getChannelData(0), rate = take.sampleRate;
const N = said ? said.getChannelData(0) : new Float32Array(0), Y = tanyg ? tanyg.getChannelData(0) : new Float32Array(0);
const rms = (fs) => { let s = 0, n = 0; for (const f of fs) for (let i = 0; i < f.length; i++) if (Math.abs(f[i]) > 0.02) { s += f[i] * f[i]; n++; } return n ? Math.sqrt(s / n) : 0; };
const gain = Math.min(2.5, Math.max(0.4, rms([T]) / (rms([N, Y]) || 1)));
const ia = Math.round(at * rate), ib = Math.round(skip * rate), i0 = Math.round(c0 * rate), i1 = Math.round(c1 * rate);
const fade = Math.round(rate * 0.01), ins = N.length + Y.length;
const out = new Float32Array(ia + ins + (i0 - ib) + (T.length - i1));
out.set(T.subarray(0, ia));
for (let i = 0; i < N.length; i++) out[ia + i] = N[i] * gain;
for (let i = 0; i < Y.length; i++) out[ia + N.length + i] = Y[i] * gain;
out.set(T.subarray(ib, i0), ia + ins);
const j = ia + ins + (i0 - ib);
out.set(T.subarray(i1), j);
for (let i = 0; i < fade; i++) { out[ia - 1 - i] *= i / fade; out[ia + ins + i] *= i / fade; out[j - 1 - i] *= i / fade; out[j + i] *= i / fade; }
const n = out.length, dv = new DataView(new ArrayBuffer(44 + n * 2));
const tag = (o, s) => { for (let i = 0; i < s.length; i++) dv.setUint8(o + i, s.charCodeAt(i)); };
tag(0, 'RIFF'); dv.setUint32(4, 36 + n * 2, true); tag(8, 'WAVE'); tag(12, 'fmt ');
dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true); dv.setUint32(24, rate, true);
dv.setUint32(28, rate * 2, true); dv.setUint16(32, 2, true); dv.setUint16(34, 16, true); tag(36, 'data'); dv.setUint32(40, n * 2, true);
for (let i = 0; i < n; i++) { const v = Math.max(-1, Math.min(1, out[i])); dv.setInt16(44 + i * 2, v < 0 ? v * 0x8000 : v * 0x7fff, true); }
return { url: URL.createObjectURL(new Blob([dv], { type: 'audio/wav' })), at, skip, c0, c1, Dn: N.length / rate, D: ins / rate };
};
const retime = (s) => {
const syl = (w) => Math.max(1, (w.match(/[аеёиоөуүыэюяАЕЁИОӨУҮЫЭЮЯ]/g) || []).length);
const nameIdx = kinds.map((k, i) => (k === 'name' ? i : -1)).filter((i) => i >= 0);
const w = nameIdx.map((i) => syl(kws[i].textContent)), sum = w.reduce((x, y) => x + y, 0) || 1;
let acc = 0;
const nameT = w.map((k) => { const t = s.at + s.Dn * acc / sum; acc += k; return t; });
const after = (t) => t - s.skip + s.at + s.D - (t >= s.c1 ? s.c1 - s.c0 : 0);
return [...base.slice(0, 3), ...nameT, ...kinds.filter((k) => k === 'tail').map(() => s.at + s.Dn),
...base.slice(9, 24).map(after), ...base.slice(26).map(after)];
};
let synced = false, spliced = null, settled = !named;
const check = () => {
synced = kws.length > 0 && kws.length === times.length;
if (kws.length && !synced && settled && times.length) console.warn(`narration: ${kws.length} words vs ${times.length} timings`);
};
if (named && host.dataset.nameVoice) times = [];
check();
const useSplice = () => {
if (!spliced || reading || starting || voice.src === spliced.url) return;
voice.src = spliced.url;
try { voice.load(); } catch (_) {  }
};
if (named) {
spliceName().catch(() => null).then((s) => {
if (s) { spliced = s; times = retime(s); if (loaded) useSplice(); }
settled = true;
check();
if (readingScan) readingScan();
});
}
let painting = false, lastIdx = -1;
const paint = () => {
if (!painting) return;
const t = voice.currentTime;
let i = lastIdx;
while (i + 1 < times.length && times[i + 1] <= t) i++;
while (i >= 0 && times[i] > t) i--;
if (i !== lastIdx) {
if (lastIdx >= 0) kws[lastIdx].classList.remove('is-now');
for (let k = Math.max(0, lastIdx); k <= i; k++) kws[k].classList.add('is-said');
for (let k = i + 1; k < kws.length; k++) kws[k].classList.remove('is-said');
if (i >= 0) kws[i].classList.add('is-now');
lastIdx = i;
}
requestAnimationFrame(paint);
};
const startPaint = () => {
if (!synced || painting) return;
painting = true;
host.classList.add('is-karaoke');
requestAnimationFrame(paint);
};
const stopPaint = () => {
if (!painting) return;
painting = false;
host.classList.remove('is-karaoke');
kws.forEach((w) => w.classList.remove('is-said', 'is-now'));
lastIdx = -1;
};
let watch = 0;
const watchdog = () => {
clearInterval(watch);
const armed = performance.now();
let lastT = -1, lastMove = armed;
watch = setInterval(() => {
if (!reading && !starting) { clearInterval(watch); return; }
const now = performance.now();
if (voice.currentTime !== lastT) { lastT = voice.currentTime; lastMove = now; return; }
if ((lastT <= 0 && now - armed > 6000) || (lastT > 0 && now - lastMove > 3000)) { clearInterval(watch); done = true; stop(); }
}, 500);
};
const finish = () => {
reading = false;
voice.muted = true;
clearInterval(watch);
stopPaint();
loudBed();
useSplice();
if (autoScrollRelease) autoScrollRelease();
};
const start = () => {
if (!bedWanted()) return;
load();
wanted = true;
starting = true;
bedHeld = true;
if (!heard) { heard = true; try { voice.currentTime = 0; } catch (_) {  } }
voice.muted = false;
watchdog();
const p = voice.play();
const go = () => {
starting = false;
if (!wanted) { voice.pause(); voice.muted = true; loudBed(); return; }
reading = true;
quietBed();
startPaint();
if (autoScrollHold) {
const ms = (Number.isFinite(voice.duration) ? voice.duration : 24) * 1000 + 4000;
autoScrollHold(title, ms, Math.max(0, Math.min(title.getBoundingClientRect().top, window.innerHeight * 0.15)));
}
};
const refused = () => {
if (!voice.paused) { go(); return; }
starting = false; wanted = false; voice.muted = true;
clearInterval(watch);
loudBed();
};
if (p && typeof p.then === 'function') p.then(go, refused);
else go();
};
const stop = () => {
wanted = false;
if (!reading && !starting) return;
voice.pause();
if (synced && lastIdx >= 0) {
let h = lastIdx;
while (h > 0 && !heads[h]) h--;
try { voice.currentTime = Math.max(0, times[h] - 0.15); } catch (_) {  }
}
starting = false;
finish();
};
voice.addEventListener('ended', () => { if (reading) { done = true; wanted = false; finish(); } try { voice.currentTime = 0; } catch (_) {  } });
voice.addEventListener('error', () => { if (!loaded) return; done = true; wanted = false; finish(); });
voice.addEventListener('pause', () => {
if (!reading || !wanted || voice.ended) return;
done = true;
wanted = false;
finish();
});
voice.addEventListener('timeupdate', () => { if (!reading && !starting && !unlocking && !voice.paused) voice.pause(); });
if (musicBtn) musicBtn.addEventListener('click', () => { if (!bedWanted()) stop(); });
document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
const scan = () => {
if (done || document.body.classList.contains('is-gated') || document.hidden) return;
const vh = window.innerHeight;
const r = host.getBoundingClientRect(), t = title.getBoundingClientRect();
if (!loaded && r.top < vh * 2) load();
const onScreen = r.bottom > 0 && r.top < vh;
if (reading || starting) { if (!onScreen) stop(); return; }
if (onScreen && t.bottom <= vh && t.bottom > 0 && settled) start();
};
readingScan = scan;
let pending = false;
window.addEventListener('scroll', () => {
if (pending) return;
pending = true;
requestAnimationFrame(() => { pending = false; scan(); });
}, { passive: true });
window.addEventListener('resize', scan);
bgMusic.addEventListener('play', scan);
})();
(() => {
const SPEED = 42;
const RESUME_MS = 2500;
const gateEl = document.getElementById('gate');
let started = false, running = false, raf = 0, previous = 0, position = 0, wrote = 0, lastNudge = 0, resumeTimer = 0;
let holdEl = null, holdAt = 0, holdTimer = 0;
const maxY = () => Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
const busyGuest = () => !!document.querySelector('dialog[open]')
|| !!(document.activeElement && document.activeElement.matches('input[type="text"], input[type="tel"], input[type="number"], input:not([type]), textarea'));
const go = () => {
position = window.scrollY;
wrote = position;
previous = performance.now();
if (!raf) raf = requestAnimationFrame(tick);
};
const stop = () => { running = false; cancelAnimationFrame(raf); raf = 0; clearTimeout(resumeTimer); resumeTimer = 0; };
const resume = () => {
resumeTimer = 0;
if (!running) return;
if (busyGuest() || document.hidden) { resumeTimer = setTimeout(resume, 800); return; }
go();
};
const nudge = () => {
lastNudge = performance.now();
if (!running) return;
cancelAnimationFrame(raf); raf = 0;
clearTimeout(resumeTimer);
resumeTimer = setTimeout(resume, RESUME_MS);
};
function tick() {
raf = 0;
if (!running) return;
if (Math.abs(window.scrollY - wrote) > 3 || busyGuest()) { nudge(); return; }
const now = performance.now();
const elapsed = Math.max(0, Math.min(now - previous, 64)) / 1000;
previous = now;
let step = SPEED * elapsed;
if (holdEl) {
const room = holdEl.getBoundingClientRect().top - holdAt;
if (room <= 0.5) return;
step = Math.min(step, room);
}
position = Math.min(maxY(), position + step);
window.scrollTo({ top: position, behavior: 'instant' });
wrote = window.scrollY;
if (window.scrollY >= maxY() - 1) { stop(); return; }
raf = requestAnimationFrame(tick);
}
startGlide = (afterMs = 0) => {
if (started) return;
started = true;
setTimeout(() => {
if (window.scrollY >= maxY() - 1) return;
running = true;
const since = performance.now() - lastNudge;
if (since < RESUME_MS) { resumeTimer = setTimeout(resume, RESUME_MS - since); return; }
go();
}, afterMs);
};
for (const type of ['wheel', 'touchstart', 'touchmove', 'pointerdown', 'keydown']) {
window.addEventListener(type, (e) => {
if (gateEl && e.target instanceof Node && gateEl.contains(e.target)) return;
nudge();
}, { passive: true });
}
autoScrollHold = (el, ms, at = 0) => {
holdEl = el;
holdAt = at;
clearTimeout(holdTimer);
holdTimer = setTimeout(() => autoScrollRelease(), ms);
};
autoScrollRelease = () => {
if (!holdEl) return;
holdEl = null;
clearTimeout(holdTimer);
if (!running || raf || resumeTimer) return;
go();
};
glideNudge = nudge;
document.addEventListener('visibilitychange', () => { if (document.hidden) nudge(); });
})();
const cdEl = document.querySelector('.countdown[data-target]');
if (cdEl) {
const target = new Date(cdEl.dataset.target).getTime();
const cells = { d: cdEl.querySelector('[data-d]'), h: cdEl.querySelector('[data-h]'), m: cdEl.querySelector('[data-m]'), s: cdEl.querySelector('[data-s]') };
let timer = null;
const put = (el, v) => { if (el.textContent !== v) { el.textContent = v; if (!reduceMotion) { el.classList.remove('tick'); void el.offsetWidth; el.classList.add('tick'); } } };
const tick = () => {
const diff = Math.max(0, target - Date.now());
put(cells.d, String(Math.floor(diff / 86400000)));
put(cells.h, String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'));
put(cells.m, String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'));
put(cells.s, String(Math.floor((diff % 60000) / 1000)).padStart(2, '0'));
if (diff === 0 && timer) { clearInterval(timer); timer = null; }
};
if (!Number.isNaN(target)) { tick(); timer = setInterval(tick, 1000); }
}
(() => {
const box = document.querySelector('[data-lucky]');
const cv = box && box.querySelector('.lucky-cover');
if (!box || !cv || !cv.getContext) return;
const sec = box.closest('.sh-lucky');
const num = luckyEl ? luckyEl.textContent : '';
const KEY = 'huh-suvd-scratched';
const open = () => {
if (box.classList.contains('is-open')) return;
box.classList.add('is-open');
if (sec) sec.classList.add('is-scratched');
cv.setAttribute('aria-hidden', 'true');
cv.tabIndex = -1;
try { localStorage.setItem(KEY, num); } catch (_) {  }
};
let seen = '';
try { seen = localStorage.getItem(KEY) || ''; } catch (_) {  }
if (seen && seen === num) { open(); return; }
const ctx = cv.getContext('2d', { willReadFrequently: true });
const img = new Image();
let W = 0, H = 0, ready = false, touched = false;
const paint = () => {
const r = cv.getBoundingClientRect();
if (!r.width || !img.naturalWidth) return;
const dpr = Math.min(2, window.devicePixelRatio || 1);
W = cv.width = Math.round(r.width * dpr);
H = cv.height = Math.round(r.height * dpr);
ctx.globalCompositeOperation = 'source-over';
ctx.drawImage(img, 0, 0, W, H);
ready = true;
};
img.addEventListener('load', paint);
img.src = cv.dataset.src;
window.addEventListener('resize', () => { if (!touched) paint(); }, { passive: true });
const at = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * (W / r.width), (e.clientY - r.top) * (H / r.height)]; };
const wipe = (p, q) => {
touched = true;
ctx.globalCompositeOperation = 'destination-out';
ctx.lineCap = 'round';
ctx.lineWidth = H * 0.34;
ctx.beginPath(); ctx.moveTo(q[0], q[1]); ctx.lineTo(p[0], p[1]); ctx.stroke();
};
const clearShare = () => {
const d = ctx.getImageData(0, 0, W, H).data;
let clear = 0, all = 0;
for (let i = 3; i < d.length; i += 4 * 7) { all++; if (d[i] < 60) clear++; }
return all ? clear / all : 0;
};
let checkT = 0;
const check = () => { clearTimeout(checkT); checkT = setTimeout(() => { if (clearShare() > 0.45) open(); }, 140); };
let last = null;
cv.addEventListener('pointerdown', (e) => {
if (!ready) return;
last = at(e);
wipe(last, [last[0] - 0.5, last[1]]);
if (glideNudge) glideNudge();
check();
try { cv.setPointerCapture(e.pointerId); } catch (_) {  }
});
cv.addEventListener('pointermove', (e) => {
if (!last) return;
const p = at(e);
wipe(p, last);
last = p;
if (glideNudge) glideNudge();
check();
});
const up = () => { last = null; };
for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) cv.addEventListener(type, up);
cv.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
})();
document.addEventListener('DOMContentLoaded', () => {
const rform = document.querySelector('form[data-rsvp="v1"]');
if (!rform) return;
const clearErr = () => rform.querySelectorAll('[data-rsvp-err]').forEach((e) => { e.hidden = true; e.style.display = 'none'; });
rform.addEventListener('input', clearErr);
rform.addEventListener('change', clearErr);
});
(() => {
const carousel = document.getElementById('wishes-carousel');
const wishStage = document.getElementById('wishes-stage');
const wishPrev = document.getElementById('wish-prev');
const wishNext = document.getElementById('wish-next');
const wishDots = document.getElementById('wishes-dots');
const dialog = document.getElementById('wish-dialog');
const openBtn = document.getElementById('wish-open');
if (!carousel || !wishStage || !dialog || !openBtn) return;
const wishForm = document.getElementById('wish-form');
const closeBtn = document.getElementById('wish-close');
const fileInput = document.getElementById('wish-file');
const photoAdd = document.getElementById('wish-photo-add');
const photoPrev = document.getElementById('wish-photo-prev');
const photoImg = document.getElementById('wish-photo-img');
const photoDel = document.getElementById('wish-photo-del');
const sendBtn = document.getElementById('wish-send');
const msg = document.getElementById('wish-msg');
const MSG = {
tooMany: 'Хэт олон удаа илгээгдлээ. Дараа дахин оролдоно уу.',
serverErr: 'Алдаа гарлаа. Дахин оролдоно уу.',
networkErr: 'Сервертэй холбогдсонгүй. Дахин оролдоно уу.',
wishNeed: 'Нэр болон сэтгэлийн үгээ бичнэ үү',
wishOk: 'Баярлалаа! Сэтгэлийн үг хүлээн авлаа',
badPhoto: 'Зургийг уншиж чадсангүй. Өөр зураг сонгоно уу.',
photoBig: 'Зураг хэт том байна. Өөр зураг сонгоно уу.',
};
let photoData = null;
const esc = (t) => { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; };
const cardHTML = (w) => {
const src = w.has_photo ? `${BASE}/api/wish/${w.id}/photo` : (w._localPhoto || '');
const fig = src ? `<img class="wish-card-img" src="${src}" alt="">` : '';
return `<figure class="wish-card">${fig}<blockquote class="wish-card-msg">${esc(w.message)}</blockquote><figcaption class="wish-card-name">${esc(w.name)}</figcaption></figure>`;
};
let wishes = [], slides = [], cur = 0, timer = null;
let openViewer = () => {};
const treeBox = document.getElementById('tree-baubles');
const treeHint = document.getElementById('tree-hint');
const SLOTS = [[.37, .205], [.66, .23], [.29, .315], [.74, .31], [.45, .37], [.2, .43], [.8, .425], [.6, .46],
[.33, .5], [.14, .56], [.86, .555], [.5, .55], [.68, .6], [.27, .63], [.08, .7], [.92, .69], [.42, .69], [.76, .73],
[.2, .82], [.6, .82]];
const FILLS = ['', 'b-gold', 'b-ice'];
let freshId = null;
const renderTree = () => {
if (!treeBox) return;
const shown = wishes.slice(0, SLOTS.length);
treeBox.replaceChildren(...shown.map((w, i) => {
const slot = shown.length - 1 - i, [x, y] = SLOTS[slot];
const b = document.createElement('button');
b.type = 'button';
b.className = `bauble ${FILLS[slot % 3]}`;
if (w === freshId) b.classList.add('is-new');
b.style.left = `${(x * 100).toFixed(1)}%`;
b.style.top = `${(y * 100).toFixed(1)}%`;
b.style.setProperty('--sd', `${(-(slot * 0.37) % 3.6).toFixed(2)}s`);
b.setAttribute('aria-label', `Сэтгэлийн үг — ${w.name}`);
b.dataset.i = String(i);
b.append(document.createElement('i'));
b.addEventListener('click', () => openViewer(i));
return b;
}));
freshId = null;
if (treeHint) treeHint.hidden = !wishes.length;
markTree();
};
const markTree = () => { if (treeBox) for (const b of treeBox.children) b.classList.toggle('is-now', Number(b.dataset.i) === cur && slides.length > 1); };
const setH = () => {
if (!slides.length) return;
let h = 0;
slides.forEach((sl) => { const c = sl.firstElementChild; if (c) h = Math.max(h, c.offsetHeight); });
if (h) wishStage.style.height = `${h}px`;
};
const show = (i) => {
if (!slides.length) return;
cur = ((i % slides.length) + slides.length) % slides.length;
slides.forEach((sl, idx) => sl.classList.toggle('is-active', idx === cur));
if (wishDots) [...wishDots.children].forEach((d, idx) => d.classList.toggle('is-active', idx === cur));
setH();
markTree();
};
const stop = () => { if (timer) { clearInterval(timer); timer = null; } };
const start = () => { stop(); if (reduceMotion || slides.length < 2) return; timer = setInterval(() => show(cur + 1), 4200); };
const buildDots = () => {
if (!wishDots) return;
wishDots.replaceChildren();
if (wishes.length < 2) return;
wishes.forEach((_, i) => {
const b = document.createElement('button');
b.type = 'button'; b.className = 'wishes-dot'; b.setAttribute('aria-label', `Сэтгэлийн үг ${i + 1}`);
b.addEventListener('click', () => { show(i); start(); });
wishDots.appendChild(b);
});
};
const renderRail = () => {
stop();
if (!wishes.length) {
wishStage.innerHTML = '<p class="wishes-empty">Анхны сэтгэлийн үгийг\nта үлдээгээрэй.</p>';
wishStage.style.height = ''; slides = [];
wishPrev.hidden = true; wishNext.hidden = true;
if (wishDots) wishDots.replaceChildren();
renderTree();
return;
}
wishStage.innerHTML = wishes.map((w) => `<div class="wish-slide">${cardHTML(w)}</div>`).join('');
slides = [...wishStage.querySelectorAll('.wish-slide')];
wishStage.querySelectorAll('img').forEach((img) => img.addEventListener('load', setH, { once: true }));
wishPrev.hidden = wishes.length < 2; wishNext.hidden = wishes.length < 2;
buildDots(); cur = 0; renderTree(); show(0); requestAnimationFrame(setH); start();
};
fetch(`${BASE}/api/wishes`).then((r) => r.json())
.then((d) => { wishes = Array.isArray(d.wishes) ? d.wishes : []; renderRail(); })
.catch(() => { wishes = []; renderRail(); });
wishPrev.addEventListener('click', () => { show(cur - 1); start(); });
wishNext.addEventListener('click', () => { show(cur + 1); start(); });
carousel.addEventListener('pointerenter', stop);
carousel.addEventListener('pointerleave', start);
window.addEventListener('resize', setH);
const viewer = document.getElementById('wish-viewer');
const vStage = document.getElementById('wish-viewer-stage');
const vPrev = document.getElementById('wish-viewer-prev');
const vNext = document.getElementById('wish-viewer-next');
const vClose = document.getElementById('wish-viewer-close');
const vCount = document.getElementById('wish-viewer-count');
if (viewer && vStage) {
let vCur = 0;
const renderViewer = () => {
if (!wishes.length) return;
vCur = ((vCur % wishes.length) + wishes.length) % wishes.length;
vStage.innerHTML = cardHTML(wishes[vCur]);
if (vCount) vCount.textContent = `${vCur + 1} / ${wishes.length}`;
vPrev.hidden = wishes.length < 2; vNext.hidden = wishes.length < 2;
};
openViewer = (i) => { if (!wishes.length) return; stop(); vCur = i; renderViewer(); if (viewer.showModal) viewer.showModal(); else viewer.setAttribute('open', ''); };
const closeViewer = () => { if (viewer.close) viewer.close(); else viewer.removeAttribute('open'); };
vPrev.addEventListener('click', () => { vCur -= 1; renderViewer(); });
vNext.addEventListener('click', () => { vCur += 1; renderViewer(); });
vClose.addEventListener('click', closeViewer);
viewer.addEventListener('click', (e) => { if (e.target === viewer) closeViewer(); });
viewer.addEventListener('close', () => start());
viewer.addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft') { vCur -= 1; renderViewer(); } else if (e.key === 'ArrowRight') { vCur += 1; renderViewer(); } });
wishStage.setAttribute('role', 'button'); wishStage.setAttribute('tabindex', '0'); wishStage.setAttribute('aria-label', 'Сэтгэлийн үгийг нээж унших');
wishStage.addEventListener('click', () => { if (wishes.length) openViewer(cur); });
wishStage.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && wishes.length) { e.preventDefault(); openViewer(cur); } });
}
const open = () => { msg.textContent = ''; msg.className = 'form-msg'; stop(); if (dialog.showModal) dialog.showModal(); else dialog.setAttribute('open', ''); };
const close = () => { if (dialog.close) dialog.close(); else dialog.removeAttribute('open'); start(); };
openBtn.addEventListener('click', open);
closeBtn.addEventListener('click', close);
dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
const clearPhoto = () => { photoData = null; fileInput.value = ''; photoImg.src = ''; photoPrev.hidden = true; photoAdd.hidden = false; };
photoAdd.addEventListener('click', () => fileInput.click());
photoDel.addEventListener('click', clearPhoto);
fileInput.addEventListener('change', () => {
const file = fileInput.files && fileInput.files[0];
if (!file) return;
const reader = new FileReader();
reader.onload = () => {
const img = new Image();
img.onload = () => {
const MAX = 1280;
let w = img.naturalWidth, h = img.naturalHeight;
if (!w || !h) { msg.className = 'form-msg is-err'; msg.textContent = MSG.badPhoto; return; }
if (w > MAX || h > MAX) { const sc = MAX / Math.max(w, h); w = Math.round(w * sc); h = Math.round(h * sc); }
const c = document.createElement('canvas'); c.width = w; c.height = h;
c.getContext('2d').drawImage(img, 0, 0, w, h);
let q = 0.82, data = c.toDataURL('image/jpeg', q);
while (data.length > 1000000 && q > 0.4) { q -= 0.12; data = c.toDataURL('image/jpeg', q); }
if (data.length > 1150000) { msg.className = 'form-msg is-err'; msg.textContent = MSG.photoBig; return; }
photoData = data; photoImg.src = data; photoPrev.hidden = false; photoAdd.hidden = true;
msg.textContent = ''; msg.className = 'form-msg';
};
img.onerror = () => { msg.className = 'form-msg is-err'; msg.textContent = MSG.badPhoto; };
img.src = reader.result;
};
reader.onerror = () => { msg.className = 'form-msg is-err'; msg.textContent = MSG.badPhoto; };
reader.readAsDataURL(file);
});
wishForm.addEventListener('submit', async (e) => {
e.preventDefault();
msg.textContent = ''; msg.className = 'form-msg';
const fd = new FormData(wishForm);
const name = String(fd.get('name') || '').trim();
const message = String(fd.get('message') || '').trim();
if (!name || !message) { msg.className = 'form-msg is-err'; msg.textContent = MSG.wishNeed; return; }
sendBtn.disabled = true; sendBtn.classList.add('is-loading');
try {
const body = { name, message };
if (photoData) body.photo = photoData;
const r = await fetch(`${BASE}/api/wish`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
if (r.ok) {
const d = await r.json().catch(() => ({}));
if (!d.pending) { wishes.unshift({ id: 0, name, message, has_photo: false, _localPhoto: photoData }); freshId = wishes[0]; renderRail(); }
wishForm.reset(); clearPhoto();
msg.className = 'form-msg is-ok'; msg.textContent = MSG.wishOk;
setTimeout(close, 1400);
} else if (r.status === 429) { msg.className = 'form-msg is-err'; msg.textContent = MSG.tooMany; }
else if (r.status === 400) { msg.className = 'form-msg is-err'; msg.textContent = MSG.badPhoto; }
else { msg.className = 'form-msg is-err'; msg.textContent = MSG.serverErr; }
} catch {
msg.className = 'form-msg is-err'; msg.textContent = MSG.networkErr;
} finally {
sendBtn.disabled = false; sendBtn.classList.remove('is-loading');
}
});
})();
(() => {
const stage = document.querySelector('.tree-stage');
const lights = document.getElementById('tree-lights');
if (!stage || !lights || reduceMotion) return;
const LIGHTS = [[.681, .356], [.346, .234], [.244, .371], [.256, .485], [.672, .234], [.407, .16], [.204, .619], [.189, .883],
[.315, .348], [.421, .095], [.758, .37], [.704, .628], [.826, .918], [.792, .5], [.231, .769], [.193, .5], [.808, .621],
[.369, .491], [.544, .074], [.342, .178], [.847, .759], [.778, .773], [.096, .862], [.685, .747], [.154, .75], [.353, .929],
[.586, .099], [.328, .737]];
const dot = (cls, x, y) => { const i = document.createElement('i'); i.className = cls; i.style.left = `${(x * 100).toFixed(1)}%`; i.style.top = `${(y * 100).toFixed(1)}%`; return i; };
lights.append(...LIGHTS.map(([x, y], k) => { const i = dot('tl', x, y); i.style.setProperty('--d', `${((k * 0.83) % 3.2).toFixed(2)}s`); return i; }));
for (let k = 0; k < 14; k++) {
const y = 0.08 + ((k * 0.37) % 0.7), half = 0.06 + y * 0.42;
const i = dot('td', 0.5 + (((k * 0.61) % 1) * 2 - 1) * half, y);
i.style.setProperty('--d', `${((k * 0.9) % 6).toFixed(1)}s`);
i.style.setProperty('--dur', `${(5 + (k % 4)).toFixed(1)}s`);
i.style.setProperty('--dx', `${(k % 2 ? 1 : -1) * (3 + (k % 5))}px`);
lights.append(i);
}
if ('IntersectionObserver' in window) new IntersectionObserver((es) => es.forEach((e) => stage.classList.toggle('is-live', e.isIntersecting))).observe(stage);
else stage.classList.add('is-live');
})();
(() => {
const sec = document.querySelector('.sh-finale');
const cv = document.getElementById('fw-sky');
const hit = document.getElementById('sky-hit');
if (!sec || !cv || !cv.getContext) return;
const ctx = cv.getContext('2d');
const COLS = [[255, 236, 180], [255, 214, 130], [226, 238, 255], [170, 214, 255], [255, 250, 240], [150, 236, 220]];
let W = 0, H = 0, raf = 0, prev = 0, sparks = [], rockets = [], wordPts = null, presses = 0, shown = false;
const size = () => {
const r = cv.getBoundingClientRect();
const dpr = Math.min(2, window.devicePixelRatio || 1);
const w = Math.round(r.width * dpr), h = Math.round(r.height * dpr);
if (w === W && h === H) return;
W = cv.width = w; H = cv.height = h; wordPts = null;
};
const word = () => {
if (wordPts) return wordPts;
const o = document.createElement('canvas'); o.width = W; o.height = H;
const c = o.getContext('2d');
c.font = `700 ${Math.round(W * 0.31)}px 'Playfair Display', 'Noto Serif', Georgia, serif`;
c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#fff';
c.fillText('2027', W / 2, H * 0.21);
const d = c.getImageData(0, 0, W, H).data, k = Math.max(4, Math.round(W / 120));
wordPts = [];
for (let y = 0; y < H; y += k) for (let x = 0; x < W; x += k) if (d[(y * W + x) * 4 + 3] > 140) wordPts.push([x, y]);
return wordPts;
};
const burst = (x, y, spell) => {
const col = COLS[Math.floor(Math.random() * COLS.length)], col2 = COLS[Math.floor(Math.random() * COLS.length)];
if (spell) {
for (const [tx, ty] of word()) sparks.push({ x, y, tx, ty, t: 0, life: 3.4 + Math.random() * 0.5, col: Math.random() < 0.7 ? [255, 228, 160] : [236, 244, 255], r: W / 300, spell: true });
}
const n = spell ? 60 : 90 + Math.floor(Math.random() * 40), v0 = W * (spell ? 0.5 : 0.36);
for (let i = 0; i < n; i++) {
const a = Math.random() * Math.PI * 2, v = v0 * (0.35 + Math.random() * 0.65);
sparks.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: 1.3 + Math.random() * 0.9, col: i % 3 ? col : col2, r: W / (240 + Math.random() * 160) });
}
};
const launch = (tx, ty, spell = false) => {
size();
rockets.push({ x: tx + (Math.random() - 0.5) * W * 0.08, y: H * 0.7, tx, ty, spell, t: 0 });
if (!raf) { prev = performance.now(); raf = requestAnimationFrame(frame); }
};
function frame(now) {
raf = 0;
const dt = Math.min(0.05, (now - prev) / 1000);
prev = now;
ctx.globalCompositeOperation = 'source-over';
ctx.clearRect(0, 0, W, H);
ctx.globalCompositeOperation = 'lighter';
rockets = rockets.filter((r) => {
r.t += dt;
const k = Math.min(1, r.t / 0.85), e = 1 - Math.pow(1 - k, 3);
const x = r.x + (r.tx - r.x) * e, y = H * 0.7 + (r.ty - H * 0.7) * e;
sparks.push({ x, y, vx: (Math.random() - 0.5) * W * 0.02, vy: W * 0.03, t: 0, life: 0.45, col: [255, 214, 150], r: W / 420 });
if (k >= 1) { burst(r.tx, r.ty, r.spell); return false; }
return true;
});
const g = W * 0.16;
sparks = sparks.filter((s) => {
s.t += dt;
if (s.t >= s.life) return false;
let a;
if (s.spell) {
const k = Math.min(1, s.t / 1.1), e = 1 - Math.pow(1 - k, 3);
if (s.t < 2.4) {
s.px = s.x + (s.tx - s.x) * e; s.py = s.y + (s.ty - s.y) * e;
a = 0.55 + 0.45 * Math.sin(now / 90 + s.tx);
} else {
s.vy = (s.vy || 0) + g * dt; s.py += s.vy * dt;
a = 1 - (s.t - 2.4) / (s.life - 2.4);
}
} else {
s.vx *= 1 - 1.6 * dt; s.vy = s.vy * (1 - 1.6 * dt) + g * dt;
s.x += s.vx * dt; s.y += s.vy * dt; s.px = s.x; s.py = s.y;
a = Math.pow(1 - s.t / s.life, 1.4);
}
const [r, gg, b] = s.col;
ctx.fillStyle = `rgba(${r},${gg},${b},${(a * 0.9).toFixed(3)})`;
ctx.beginPath(); ctx.arc(s.px, s.py, s.r * (0.6 + a * 0.6), 0, Math.PI * 2); ctx.fill();
return true;
});
if (sparks.length || rockets.length) raf = requestAnimationFrame(frame);
else ctx.clearRect(0, 0, W, H);
}
const show = () => {
if (shown) return;
shown = true;
size();
const at = [[0.24, 0.2], [0.76, 0.17], [0.52, 0.12]];
at.forEach(([x, y], i) => setTimeout(() => launch(W * x, H * y), i * 520));
setTimeout(() => launch(W / 2, H * 0.21, true), 1900);
};
hit.addEventListener('click', (e) => {
size();
const r = cv.getBoundingClientRect();
const x = Math.min(W * 0.9, Math.max(W * 0.1, (e.clientX - r.left) * (W / r.width))), y = Math.min(H * 0.45, (e.clientY - r.top) * (H / r.height));
presses += 1;
sec.classList.add('has-fired');
if (presses % 3 === 0) launch(W / 2, H * 0.21, true); else launch(x || W / 2, y || H * 0.2);
});
window.addEventListener('resize', size, { passive: true });
if (!reduceMotion && 'IntersectionObserver' in window) {
const io = new IntersectionObserver((es) => {
if (es.some((e) => e.isIntersecting) && !document.body.classList.contains('is-gated')) { show(); io.disconnect(); }
}, { threshold: 0.45 });
io.observe(cv);
}
})();
(() => {
const prevImg = document.getElementById('keep-prev');
const btn = document.getElementById('keep-dl');
if (!prevImg || !btn) return;
const txt = (sel) => ((document.querySelector(sel) || {}).textContent || '').trim();
const W = 1350, H = 1080;
let card = null, building = null;
const fit = (c, s, max, size, face) => {
let fs = size;
do { c.font = `${face.replace('#', fs)}`; fs -= 4; } while (c.measureText(s).width > max && fs > 30);
};
const build = () => building || (building = (async () => {
const bg = new Image();
bg.src = `${BASE}/assets/plate/finale.webp`;
await bg.decode();
if (document.fonts) {
await Promise.all(["700 90px 'Playfair Display'", "600 40px 'Noto Serif'", "600 30px Manrope"]
.map((f) => document.fonts.load(f, 'Сайншанд Засаг ӨөҮү 2027')).concat(document.fonts.ready)).catch(() => {});
}
const c = document.createElement('canvas'); c.width = W; c.height = H;
const x = c.getContext('2d');
x.drawImage(bg, 0, 140, 941, 753, 0, 0, W, H);
let gr = x.createLinearGradient(0, 0, 0, H);
gr.addColorStop(0, 'rgba(5,10,28,.15)'); gr.addColorStop(.28, 'rgba(5,10,28,.5)'); gr.addColorStop(.6, 'rgba(5,10,28,.25)');
gr.addColorStop(.8, 'rgba(5,10,28,.35)'); gr.addColorStop(1, 'rgba(5,10,28,.78)');
x.fillStyle = gr; x.fillRect(0, 0, W, H);
x.strokeStyle = 'rgba(227,194,122,.9)'; x.lineWidth = 3; x.strokeRect(34, 34, W - 68, H - 68);
x.strokeStyle = 'rgba(227,194,122,.5)'; x.lineWidth = 1.5; x.strokeRect(48, 48, W - 96, H - 96);
const pg = x.createRadialGradient(W / 2 - 9, 118, 2, W / 2, 128, 30);
pg.addColorStop(0, '#FFFFFF'); pg.addColorStop(.35, '#F1EDE7'); pg.addColorStop(.8, '#A9A5A1'); pg.addColorStop(1, '#6E6B68');
x.fillStyle = pg; x.beginPath(); x.arc(W / 2, 128, 28, 0, Math.PI * 2); x.fill();
x.textAlign = 'center'; x.textBaseline = 'alphabetic';
x.shadowColor = 'rgba(0,0,0,.55)'; x.shadowBlur = 14;
const company = 'Сайншанд сумын Засаг даргын Тамгын газар';
const who = named ? guestEl.textContent.replace(/\s+/g, ' ').trim() : company;
if (named) { x.fillStyle = '#F1D597'; x.font = "600 40px 'Noto Serif', Georgia, serif"; x.fillText(company, W / 2, 222); }
fit(x, who, W - 220, 112, "700 #px 'Playfair Display', 'Noto Serif', Georgia, serif");
const ng = x.createLinearGradient(0, 260, 0, 380);
ng.addColorStop(0, '#FFF3CF'); ng.addColorStop(.5, '#EED29B'); ng.addColorStop(1, '#C99A57');
x.fillStyle = ng; x.fillText(who, W / 2, named ? 360 : 330);
x.fillStyle = '#FFFDF6'; x.font = "600 50px 'Noto Serif', Georgia, serif";
x.fillText('Шинэ жилийн баяр 2027', W / 2, named ? 452 : 430);
x.font = "600 36px Manrope, system-ui, sans-serif"; x.fillStyle = '#F3E6C4';
x.fillText(`${txt('.sh-when .t-w-big')} · ${txt('.sh-when .t-w-time')}`, W / 2, 940);
x.font = "500 34px 'Noto Serif', Georgia, serif"; x.fillStyle = '#EEF2FF';
x.fillText(txt('.sh-when .t-w-v1'), W / 2, 990);
x.shadowBlur = 0;
x.font = "700 26px Manrope, system-ui, sans-serif";
const chip = 'Powered by Beck <3', cw = x.measureText(chip).width + 36;
x.fillStyle = 'rgba(7,14,34,.62)'; x.strokeStyle = 'rgba(227,194,122,.6)'; x.lineWidth = 1.5;
x.beginPath(); x.roundRect ? x.roundRect(W - 70 - cw, H - 120, cw, 46, 23) : x.rect(W - 70 - cw, H - 120, cw, 46); x.fill(); x.stroke();
x.fillStyle = '#F0C98C'; x.textAlign = 'left'; x.fillText(chip, W - 70 - cw + 18, H - 88);
card = c;
prevImg.src = c.toDataURL('image/jpeg', 0.86);
return c;
})().catch(() => { building = null; return null; }));
btn.addEventListener('click', async () => {
const c = card || await build();
if (!c) return;
c.toBlob((blob) => {
if (!blob) return;
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'huh-suvd-2027.png';
document.body.appendChild(a);
a.click();
a.remove();
setTimeout(() => URL.revokeObjectURL(url), 4000);
}, 'image/png');
});
if ('IntersectionObserver' in window) {
const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { build(); io.disconnect(); } }, { rootMargin: '900px 0px' });
io.observe(prevImg.parentElement);
} else build();
})();
(() => {
const box = document.getElementById('cmp-c');
if (!box || reduceMotion) return;
const SLEIGH = box.dataset.kind === 'sleigh';
const STOPS = (SLEIGH ? [
['.sh-hero', 700, 1215], ['.sh-letter', 300, 1590], ['.sh-greet', 470, 1655], ['.sh-when', 300, 1590],
['.sh-seat', 700, 498], ['.sh-prog', 300, 1460], ['.sh-dress', 760, 1530], ['.sh-lucky', 300, 800],
['.sh-rsvp .part-top', 640, 150], ['.tree-stage', 0.2, 0.55, 'rel'], ['.sh-finale .part-top', 300, 640],
] : [
['.sh-hero', 838, 1185], ['.sh-letter', 120, 262], ['.sh-greet', 812, 610], ['.sh-when', 122, 800],
['.sh-seat', 860, 96], ['.sh-prog', 124, 1440], ['.sh-dress', 860, 900], ['.sh-lucky', 130, 700],
['.sh-rsvp .part-top', 846, 230], ['.tree-stage', 0.18, 0.14, 'rel'], ['.sh-finale .part-top', 742, 896],
]).map(([sel, a, b, rel]) => ({ el: document.querySelector(sel), a, b, rel })).filter((s) => s.el);
const land = (s) => {
const r = s.el.getBoundingClientRect();
if (s.rel) return [r.left + s.a * r.width, r.top + s.b * r.height];
const k = r.width / 941;
return [r.left + s.a * k, r.top + s.b * k];
};
const target = () => {
const vh = window.innerHeight, vw = window.innerWidth;
let best = null, bd = Infinity;
for (const s of STOPS) {
const p = land(s);
if (p[1] < 70 || p[1] > vh - 130 || p[0] < 30 || p[0] > vw - 30) continue;
const d = Math.abs(p[1] - vh * 0.45);
if (d < bd) { bd = d; best = p; }
}
return best;
};
const glint = (px, py) => {
const i = document.createElement('i');
i.className = 'glint';
const life = 800 + Math.random() * 700;
i.style.left = `${px.toFixed(0)}px`; i.style.top = `${py.toFixed(0)}px`;
i.style.setProperty('--s', `${(4.5 + Math.random() * 4).toFixed(1)}px`);
i.style.setProperty('--tx', `${(Math.random() * 16 - 8).toFixed(0)}px`);
i.style.setProperty('--ty', `${(8 + Math.random() * 20).toFixed(0)}px`);
i.style.setProperty('--d', `${life.toFixed(0)}ms`);
document.body.appendChild(i);
setTimeout(() => i.remove(), life + 80);
};
let x = 0, y = 0, tx = 0, ty = 0, sy = 0, flying = false, facing = 1, lastX = 0, lastY = 0, since = 0, t0 = 0;
const step = (now) => {
const t = (now - t0) / 1000;
const s = window.scrollY;
y -= s - sy; ty -= s - sy; sy = s;
const p = target();
if (p) { tx = p[0]; ty = p[1]; }
const dx = tx - x, dy = ty - y, dist = Math.hypot(dx, dy);
x += dx * 0.05; y += dy * 0.05;
const wob = Math.min(1, dist / 120);
const cx = x + Math.sin(t * 2.6) * 11 * wob, cy = y + Math.sin(t * 1.9 + 1.3) * 8 * wob + Math.sin(t * 1.1) * 2.5;
const nowFlying = dist > 26;
if (nowFlying !== flying) { flying = nowFlying; box.classList.toggle('is-flying', flying); }
if (dx > 40) facing = 1; else if (dx < -40) facing = -1;
const tilt = Math.max(-18, Math.min(18, dx * 0.05));
const moved = Math.hypot(cx - lastX, cy - lastY);
since += moved;
while (since >= 12 && flying) { since -= 12; glint(cx - (cx - lastX) * (since / (moved || 1)) + (Math.random() * 10 - 5), cy + (Math.random() * 8 - 4)); }
lastX = cx; lastY = cy;
box.style.transform = `translate3d(${cx.toFixed(1)}px, ${cy.toFixed(1)}px, 0) scaleX(${facing}) rotate(${(tilt * facing * 0.6).toFixed(1)}deg)`;
requestAnimationFrame(step);
};
let started = false;
releaseCompanion = () => {
if (started) return;
started = true;
const p = land(STOPS[0]);
x = window.innerWidth + 60; y = p[1] - 120; tx = p[0]; ty = p[1]; sy = window.scrollY;
lastX = x; lastY = y; t0 = performance.now();
box.classList.add('is-on', 'is-flying');
requestAnimationFrame(step);
};
if (!document.getElementById('gate')) releaseCompanion();
})();
})();

;document.documentElement.dataset.fiber='09f3f69b';

// Бичлэгийн дунд гарах хуучин нэрийг шинэ лого, нэрээр далдлах
(() => {
const v = document.getElementById('g-vid'), b = document.getElementById('g-brand');
if (!v || !b) return;
const A = 0.55, B = 0.57;
const tick = () => {
if (v.ended) b.style.opacity = '1';
else if (v.duration > 0) { const f = v.currentTime / v.duration; b.style.opacity = String(Math.max(0, Math.min(1, (f - A) / (B - A)))); }
if (document.body.contains(b)) requestAnimationFrame(tick);
};
requestAnimationFrame(tick);
})();
