'use strict';

/* v7 界面：六部作品。开场 → 选世界 → 出生 → 一段一段地活 → 死亡 → 带着记忆重来。 */


/* ---------------- 小工具 ---------------- */
function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

let v7Page = 'scene';      // scene | life | people | memory | book
let v7Loading = false;

function v7Top() {
  return `<div class="top">
    <div class="brand"><b>此世</b><span class="dot">·</span><span class="mono" style="font-size:11px;letter-spacing:.12em">SIX LIVES</span></div>
    <div style="display:flex;gap:6px">
      <button class="icon" onclick="v7SheetBook()">书</button>
      <button class="icon" onclick="v7SheetPeople()">人</button>
      <button class="icon" onclick="v7SheetSettings()">设置</button>
    </div>
  </div>`;
}

function v7Render(keep) {
  const y = keep ? window.scrollY : 0;
  stopFields();
  const map = {
    wake: v7Wake, pick: v7Pick, born: v7Born, play: v7Play, end: v7End
  };
  document.getElementById('app').innerHTML = v7Top() + (map[state.screen7] || v7Wake)();
  paintFields();
  if (keep) requestAnimationFrame(() => window.scrollTo(0, y)); else window.scrollTo(0, 0);
}

/* ---------------- 开场 ---------------- */
function v7Wake() {
  const done = (state.lives || []).length;
  return `<div class="view splash">
    <canvas class="mark" data-field="sigil" style="width:110px;height:76px"></canvas>
    <h1 class="display">六段人生，<br><span>每一段都会疼。</span></h1>
    <p class="sub">不是选答案，是替一个人活一次。<br>他记得的，你也会记得。</p>
    <button class="btn primary" style="max-width:280px" onclick="v7Go('pick')">开始</button>
    ${done ? `<button class="btn ghost" style="max-width:280px;margin-top:10px" onclick="v7SheetShelf()">读过的故事 · ${done}</button>` : ''}
    <p class="faint mono" style="font-size:10px;letter-spacing:.14em;margin-top:34px">SIX WORKS · LOCAL ONLY</p>
  </div>`;
}

/* ---------------- 选书 ---------------- */
function v7Pick() {
  return `<div class="view">
    <div class="eyebrow">Six works</div>
    <h1 class="title">先读哪一部</h1>
    <p class="subtitle">六部作品，写的是六种普通人的一生。每部都能读完，也能重读。</p>
    <canvas data-field="wide" style="height:64px;width:100%;margin:10px 0 18px"></canvas>
    ${STORY_ORDER.map((name, i) => {
      const b = STORY6[name];
      const read = (state.readBooks || []).includes(name);
      return `<div class="bookcard" onclick="v7Choose(${i})">
        <div class="bn">第 ${['一','二','三','四','五','六'][i]} 部 · ${esc(b.subtitle)}</div>
        <h3>${esc(name)}</h3>
        <p class="small">${esc(b.through)}</p>
        <div class="bmeta"><span>${b.main.length + b.side.length} 段</span><span>${b.main[0].age[0]}–${b.main[b.main.length-1].age[1]} 岁</span>${read ? '<span class="blue">读过</span>' : ''}</div>
      </div>`;
    }).join('')}
    <p class="small faint" style="margin-top:18px">建议第一次从《穗骨原》读起。它最像我们自己的来处。</p>
  </div>`;
}

function v7Choose(i) {
  state.worldIndex = i;
  state.bookName = STORY_ORDER[i];
  state.screen7 = 'born';
  v7Save();
  v7Render();
}

/* ---------------- 出生 ---------------- */
function v7Born() {
  const b = v7Book();
  return `<div class="view">
    <div class="eyebrow">Before you were born</div>
    <h1 class="title">${esc(b.name)}</h1>
    <p class="subtitle">${esc(b.subtitle)}</p>
    <canvas data-field="sigil" style="height:88px;width:100%;margin:8px 0 18px"></canvas>
    <div class="card">
      <h3 style="font:400 17px/1.5 var(--serif)">这一部讲的是</h3>
      <p class="small" style="margin-top:6px">${esc(b.through)}</p>
    </div>
    <div class="card">
      <h3 style="font:400 17px/1.5 var(--serif)">你会遇见</h3>
      ${b.cast.map(c => `<p class="small" style="margin:6px 0"><b>${esc(c.name)}</b> · 你的${esc(c.tag)}，${esc(c.role)}</p>`).join('')}
    </div>
    <div class="stack" style="margin-top:16px">
      <div><label class="small muted">你的名字</label><input id="v7name" value="${esc(state.name || '')}" placeholder="写一个名字，或者不写"></div>
      <div><label class="small muted">性别</label>
        <select id="v7sex">
          <option ${state.sex === '男' ? 'selected' : ''}>男</option>
          <option ${state.sex === '女' ? 'selected' : ''}>女</option>
        </select>
      </div>
    </div>
    <p class="small faint" style="margin-top:12px">名字会出现在叙事里。不写的话，故事里的人会叫你"孩子"。</p>
    <button class="btn primary" style="margin-top:18px" onclick="v7Start()">出生</button>
    <button class="btn ghost" style="margin-top:10px" onclick="v7Go('pick')">换一部</button>
  </div>`;
}

function v7Start() {
  const n = (document.getElementById('v7name') || {}).value || '';
  const s = (document.getElementById('v7sex') || {}).value || '女';
  v7ResetBook(n.trim(), s);
  state.screen7 = 'play';
  v7Page = 'scene';
  v7Save();
  v7Render();
}

function v7ResetBook(name, sex) {
  state.name = name;
  state.sex = sex;
  state.age0 = 0;
  state.days = 0;
  state.health = 100;
  state.reputation = 0;
  state.stats = { 智识: 5, 体魄: 5, 魅力: 5, 机缘: 5 };
  state.emotions = { 喜: 30, 怒: 20, 哀: 20, 惧: 20, 爱: 30, 恶: 15, 欲: 30 };
  state.bonds = {};
  state.memories = [];
  state.seen = [];
  state.threads = [];
  state.flags = [];
  state.journal = [];
  state.mainIdx = 0;
  state.lastWasSide = false;
  state.scene7 = null;
  state.result7 = null;
  state.dead = false;
}

/* ---------------- 玩 ---------------- */
function v7Play() {
  if (state.result7) return v7ResultPage();
  if (state.dead) return v7End();
  const body = v7Page === 'life' ? v7Life()
    : v7Page === 'people' ? v7People()
    : v7Page === 'memory' ? v7Memory()
    : v7Page === 'book' ? v7BookPage()
    : v7ScenePage();
  return `<div>${v7Nav()}${body}</div>`;
}

function v7Nav() {
  const a = v7Age();
  const st = v7Stage();
  return `<div style="padding:16px 18px 0">
    <div class="row">
      <div>
        <div class="mono" style="font-size:10px;letter-spacing:.12em;color:var(--ink-faint)">${st.label} · ${esc(v7Book().name)}</div>
        <div style="font:400 19px/1.3 var(--serif);margin-top:2px">${a} 岁 · ${esc(state.name || '孩子')}</div>
      </div>
      <div style="text-align:right;max-width:120px">
        <div class="mono" style="font-size:10px;color:var(--ink-faint)">身子</div>
        <div class="mono" style="font-size:17px">${Math.round(state.health)}</div>
      </div>
    </div>
    <div class="moods">${Object.entries(state.emotions).map(([k, v]) => `<div class="mood"><div class="lb">${k}</div><div class="bar"><i style="height:${Math.max(2, v * 0.22)}px"></i></div></div>`).join('')}</div>
  </div>
  <div class="tabs" style="margin-top:12px">${[['scene', '此刻'], ['people', '人'], ['memory', '记忆'], ['book', '这一部']].map(([k, n]) => `<button class="tab ${v7Page === k ? 'active' : ''}" onclick="v7NavTo('${k}')">${n}</button>`).join('')}</div>`;
}
function v7NavTo(p) { v7Page = p; v7Render(); }

function v7ScenePage() {
  if (!state.scene7) {
    const sc = v7NextScene();
    if (!sc) {
      state.dead = true; v7Save(); return v7End();
    }
    v7AdvanceToScene(sc);
    state.scene7 = sc;
    v7Save();
  }
  const sc = state.scene7;
  const b = v7Book();
  const who = sc.npc ? `<span class="npcname">${esc(v7NameOf(sc.npc))}</span>` : '';
  return `<div class="view" style="padding-top:14px">
    <canvas data-field="wide" style="height:72px;width:100%;margin-bottom:14px"></canvas>
    <div class="scene-meta">${esc(b.name)} · ${v7Age()} 岁 · ${sc.act === 'main' ? '主线' : '插曲'}</div>
    <h1 class="scene-title">${esc(sc.title)}</h1>
    <div class="prose">${v7Para(sc.opening)}</div>
    ${sc.ask ? `<div class="ask">${esc(sc.ask)}</div>` : ''}
    <div class="choices" style="margin-top:6px">
      ${sc.choices.map((c, i) => `<button class="choice2" onclick="v7ChooseOpt(${i})">
        <span class="cn">${['一', '二', '三'][i]}</span>
        <span class="ct">
          <b>${esc(c.title)}</b>
          <span class="cd">${esc(c.desc)}</span>
          <span class="ch">${esc(c.hint)}</span>
        </span>
      </button>`).join('')}
    </div>
    <p class="small faint" style="margin-top:16px">三个都可以选。没有一个是完全对的。</p>
  </div>`;
}

/* 正文分段：中文长段落自动断成 2-3 段，读起来不闷 */
function v7Para(text) {
  const t = String(text || '').trim();
  if (t.includes('\n')) return t.split(/\n+/).map(p => `<p>${esc(p)}</p>`).join('');
  const parts = t.match(/[^。！？]{1,90}[。！？]?/g) || [t];
  const out = [];
  let cur = '';
  for (const p of parts) {
    cur += p;
    if (cur.length >= 76) { out.push(cur); cur = ''; }
  }
  if (cur) { if (out.length) out[out.length - 1] += cur; else out.push(cur); }
  return out.map(p => `<p>${esc(p)}</p>`).join('');
}

function v7ChooseOpt(i) {
  const sc = state.scene7;
  if (!sc || !sc.choices[i]) return;
  const ch = sc.choices[i];
  const notes = v7Apply(sc, ch);
  state.result7 = {
    title: sc.title, choice: ch.title, outcome: ch.outcome, notes,
    age: v7Age(), days: sc.days, npc: sc.npc ? v7NameOf(sc.npc) : '',
    thread: ch.eff && ch.eff.thread ? ch.eff.thread : '',
    memory: sc.memory || sc.title
  };
  state.scene7 = null;
  if (state.health <= 0 || v7Age() >= 96) state.dead = true;
  v7Save();
  v7Render();
}

/* ---------------- 这一段之后 ---------------- */
function v7ResultPage() {
  const r = state.result7;
  return `<div class="view" style="padding-top:16px">
    <div class="eyebrow">After this</div>
    <h1 class="scene-title" style="margin-bottom:4px">${esc(r.title)}</h1>
    <div class="small faint mono" style="margin-bottom:14px">${r.age} 岁 · 你选了：${esc(r.choice)}</div>
    <canvas data-field="wide" style="height:48px;width:100%;margin-bottom:16px"></canvas>
    <div class="prose">${v7Para(r.outcome)}</div>
    ${r.notes.length ? `<div class="gains">${r.notes.map(n => `<span class="gain ${n.c}">${esc(n.k)} ${n.v > 0 ? '+' : ''}${n.v}</span>`).join('')}</div>` : ''}
    ${r.thread ? `<div class="notice" style="margin-top:16px"><b>留下一句</b> · ${esc(r.thread)}</div>` : ''}
    ${r.npc ? `<p class="small muted" style="margin-top:14px">你和${esc(r.npc)}之间，多了一点什么，或者少了一点什么。</p>` : ''}
    <button class="btn primary" style="margin-top:20px" onclick="v7Next()">往下走</button>
    <button class="btn ghost" style="margin-top:10px" onclick="v7PlayExtra()">让 AI 在这里补一段番外</button>
  </div>`;
}

function v7Next() {
  state.result7 = null;
  state.scene7 = null;
  v7Page = 'scene';
  v7Save();
  v7Render();
}

/* ---------------- 人 ---------------- */
function v7People() {
  const b = v7Book();
  const lines = (b.cast || []).map(c => {
    const v = state.bonds[c.id] || 0;
    const stage = v >= 30 ? '很近了' : v >= 15 ? '说得上话' : v > 0 ? '还算熟' : v === 0 ? '还没走近' : v > -15 ? '有点僵' : '说不清了';
    return `<div class="pcard">
      <div class="row"><div><h3>${esc(c.name)}</h3><div class="small muted">你的${esc(c.tag)} · ${esc(c.role)}</div></div>
      <span class="tag ${v >= 15 ? 'blue' : ''}">${stage}</span></div>
      <div class="pline"><i style="left:${Math.round((v + 40) / 80 * 100)}%"></i></div>
      <div class="small faint mono">${v > 0 ? '+' : ''}${v}</div>
    </div>`;
  }).join('');
  return `<div class="view">
    <div class="eyebrow">People</div>
    <h1 class="title">人</h1>
    <p class="subtitle">这里的数字不是分数。它只说明，你和他之间还剩下多少话可以说。</p>
    ${lines}
    ${state.threads && state.threads.filter(t => t.open).length ? `<div class="scene-meta" style="margin-top:22px">还没说完的事</div>
      ${state.threads.filter(t => t.open).map(t => `<div class="card"><p class="small">${esc(t.text)}</p><p class="small faint">${t.age} 岁那年留下的</p></div>`).join('')}` : ''}
  </div>`;
}

/* ---------------- 记忆 ---------------- */
function v7Memory() {
  const mem = (state.memories || []).slice().reverse();
  return `<div class="view">
    <div class="eyebrow">Memory</div>
    <h1 class="title">你记得的</h1>
    <p class="subtitle">人一生记得的事不多。这里留下的，是这个人到死都还记得的。</p>
    ${mem.length ? mem.slice(0, 40).map(m => `<div class="memitem">
      <div class="mag">${m.age} 岁</div>
      <div>
        <h4>${esc(m.title)}</h4>
        <p class="small">${esc(m.choice)}</p>
        <p class="small muted">${esc(String(m.text).slice(0, 96))}${String(m.text).length > 96 ? '…' : ''}</p>
      </div>
    </div>`).join('') : '<p class="small muted">还没有。先去活。</p>'}
  </div>`;
}

/* ---------------- 这一部 ---------------- */
function v7BookPage() {
  const b = v7Book();
  const total = b.main.length + b.side.length;
  const seen = (state.seen || []).length;
  return `<div class="view">
    <div class="eyebrow">The work</div>
    <h1 class="title">${esc(b.name)}</h1>
    <p class="subtitle">${esc(b.subtitle)}</p>
    <canvas data-field="sigil" style="height:80px;width:100%;margin:10px 0 16px"></canvas>
    <div class="card"><h3 style="font:400 17px/1.6 var(--serif)">这一部讲的是</h3><p class="small">${esc(b.through)}</p></div>
    <div class="card">
      <div class="statline"><span>读过的段落</span><span>${seen} / ${total}</span></div>
      <div class="bar"><i style="width:${Math.round(seen / total * 100)}%"></i></div>
      <p class="small muted" style="margin-top:10px">主线 ${b.main.length} 段，插曲 ${b.side.length} 段。插曲按年龄自己长出来，不走完也不影响结局。</p>
    </div>
    <div class="card"><h3 style="font:400 17px/1.6 var(--serif)">人物</h3>
      ${b.cast.map(c => `<p class="small" style="margin:5px 0"><b>${esc(c.name)}</b> · 你的${esc(c.tag)}，${esc(c.role)}</p>`).join('')}
    </div>
  </div>`;
}

/* ---------------- 结局 ---------------- */
function v7End() {
  const e = v7Ending();
  return `<div class="view">
    <div class="eyebrow">The end</div>
    <h1 class="title">${v7Age()} 岁，这一生结束</h1>
    <p class="subtitle">${esc(state.name || '这个人')} · ${esc(v7Book().name)} · ${esc(e.title)}</p>
    <canvas data-field="wide" style="height:88px;width:100%;margin:12px 0 18px"></canvas>
    <div class="card"><dl class="kv">
      <dt>活到</dt><dd>${v7Age()} 岁</dd>
      <dt>最后心里</dt><dd>${esc(e.dominant || '说不上来')}</dd>
      <dt>读过</dt><dd>${(state.seen || []).length} 段</dd>
    </dl></div>
    ${e.people.length ? `<div class="card"><h3 style="font:400 17px/1.6 var(--serif)">最后想起的人</h3>
      ${e.people.map(p => `<p class="small" style="margin:6px 0"><b>${esc(p.name)}</b> · ${p.v > 0 ? '你们之间是暖的' : '你们之间有些话没说完'}</p>`).join('')}</div>` : ''}
    <div class="card"><h3 style="font:400 17px/1.6 var(--serif)">最后记得的事</h3>
      ${e.mem.map(m => `<p class="small" style="margin:8px 0"><span class="faint mono">${m.age}岁</span> ${esc(m.title)}<br><span class="muted">${esc(String(m.text).slice(0, 60))}</span></p>`).join('') || '<p class="small muted">没有。</p>'}
    </div>
    <div class="notice">这一生读完了。你可以重新读一遍——换一种选法，看看他会不会过得好一点。</div>
    <button class="btn primary" onclick="v7Again()">再活一次</button>
    <button class="btn ghost" style="margin-top:10px" onclick="v7PlayExtra()">让 AI 写这段余生</button>
    <button class="btn ghost" style="margin-top:10px" onclick="v7Another()">去读另一部</button>
  </div>`;
}

function v7Again() {
  v7ResetBook(state.name, state.sex);
  state.screen7 = 'born';
  v7Save(); v7Render();
}
function v7Another() {
  (state.readBooks = state.readBooks || []);
  if (!state.readBooks.includes(v7Book().name)) state.readBooks.push(v7Book().name);
  state.screen7 = 'pick';
  v7Save(); v7Render();
}

/* ---------------- 弹层 ---------------- */
function v7Sheet(html) {
  const el = document.createElement('div');
  el.className = 'modal'; el.id = 'v7modal';
  el.innerHTML = `<div>${html}</div>`;
  el.addEventListener('click', e => { if (e.target === el) el.remove(); });
  document.body.appendChild(el);
}
function v7Close() { const m = document.getElementById('v7modal'); if (m) m.remove(); }

function v7SheetBook() {
  const b = v7Book();
  v7Sheet(`<h2>这一部</h2>
    <p class="small muted">${esc(b.subtitle)}</p>
    <p class="small" style="margin-top:10px">${esc(b.through)}</p>
    <div style="margin-top:14px">${b.cast.map(c => `<p class="small" style="margin:6px 0"><b>${esc(c.name)}</b> · 你的${esc(c.tag)}，${esc(c.role)}</p>`).join('')}</div>
    <button class="btn" style="margin-top:14px" onclick="v7Close()">合上</button>`);
}
function v7SheetPeople() {
  v7Page = 'people'; v7Render();
}
function v7SheetShelfJump(){ v7Page='book'; v7Render(); }
function v7SheetSettings() {
  v7Sheet(`<h2>设置</h2>
    <p class="small muted">六部作品是写好的。AI 只在"续写"功能里出现，用来按你这一生的走向，补写一段属于你的番外。</p>
    <div style="margin:14px 0"><label class="small muted">DeepSeek API Key（可选）</label>
      <input id="v7key" type="password" value="${esc(state.apiKey || '')}" placeholder="sk-...">
      <p class="small faint" style="margin-top:6px">只存在这台设备上。不填也能读完全部六部。</p></div>
    <label class="small" style="display:flex;gap:8px;align-items:center;margin:12px 0"><input type="checkbox" id="v7ai" ${state.ai !== false ? 'checked' : ''} style="width:auto"> 允许 AI 续写番外</label>
    <button class="btn" onclick="v7SaveSettings()">保存</button>
    <hr style="border:none;border-top:1px solid var(--rule);margin:18px 0">
    <button class="btn danger" onclick="v7Wipe()">清除本地存档</button>
    <button class="btn ghost" style="margin-top:10px" onclick="v7Close()">关闭</button>`);
}
function v7SaveSettings() {
  const k = document.getElementById('v7key'), a = document.getElementById('v7ai');
  if (k) state.apiKey = k.value.trim();
  if (a) state.ai = a.checked;
  v7Save(); v7Close();
  v7Toast(state.apiKey && state.ai !== false ? '已保存' : '已保存 · 纯离线');
}
function v7Wipe() {
  if (!confirm('删除这台设备上的全部进度？')) return;
  try { localStorage.removeItem(V7KEY); } catch (e) {}
  location.reload();
}
function v7SheetShelf() {
  const read = state.readBooks || [];
  v7Sheet(`<h2>读过的故事</h2>
    ${read.length ? read.map(n => `<div class="card"><h3 style="font:400 17px/1.5 var(--serif)">${esc(n)}</h3><p class="small muted">${esc(STORY6[n] ? STORY6[n].subtitle : '')}</p></div>`).join('') : '<p class="small muted">还没有读完一部。</p>'}
    <button class="btn" style="margin-top:12px" onclick="v7Close()">合上</button>`);
}

function v7Toast(t) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = t; el.style.display = 'block';
  clearTimeout(window.__v7t);
  window.__v7t = setTimeout(() => el.style.display = 'none', 2600);
}

/* ---------------- 存档 ---------------- */
const V7KEY = 'sixlives_v7';

function v7Save() {
  try {
    const keep = {
      screen7: state.screen7, worldIndex: state.worldIndex, bookName: state.bookName,
      name: state.name, sex: state.sex, age0: state.age0, days: state.days,
      health: state.health, reputation: state.reputation, stats: state.stats,
      emotions: state.emotions, bonds: state.bonds, memories: state.memories,
      seen: state.seen, threads: state.threads, flags: state.flags, journal: state.journal,
      mainIdx: state.mainIdx, lastWasSide: state.lastWasSide, dead: state.dead,
      scene7: state.scene7, result7: state.result7, readBooks: state.readBooks,
      apiKey: state.apiKey, ai: state.ai, lives: state.lives
    };
    localStorage.setItem(V7KEY, JSON.stringify(keep));
  } catch (e) {}
}
function v7Load() {
  try {
    const raw = localStorage.getItem(V7KEY);
    if (!raw) return false;
    const d = JSON.parse(raw);
    Object.assign(state, d);
    return true;
  } catch (e) { return false; }
}
function v7Go(s) { state.screen7 = s; v7Save(); v7Render(); }

/* ---------------- 启动 ---------------- */
(function v7Boot() {
  state.screen7 = 'wake';
  state.worldIndex = 0;
  state.bookName = STORY_ORDER[0];
  state.name = '';
  state.sex = '女';
  state.stats = { 智识: 5, 体魄: 5, 魅力: 5, 机缘: 5 };
  state.emotions = { 喜: 30, 怒: 20, 哀: 20, 惧: 20, 爱: 30, 恶: 15, 欲: 30 };
  state.bonds = {}; state.memories = []; state.seen = []; state.threads = [];
  state.flags = []; state.journal = []; state.readBooks = []; state.apiKey = ''; state.ai = true;
  v7Load();
  if (state.screen7 === 'play' && state.result7) state.screen7 = 'play';
  window.addEventListener('beforeunload', v7Save);
  document.addEventListener('visibilitychange', () => { if (document.hidden) v7Save(); });
  v7Render();
})();
