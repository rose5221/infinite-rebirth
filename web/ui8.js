'use strict';

/* v8 · 家计界面
   一块棋盘：岗位 × 人。一年一拍。 */

function b8Esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function b8Paras(t) {
  const parts = String(t || '').match(/[^。！？]{1,90}[。！？]?/g) || [t];
  const out = []; let cur = '';
  for (const p of parts) { cur += p; if (cur.length >= 74) { out.push(cur); cur = ''; } }
  if (cur) { if (out.length) out[out.length - 1] += cur; else out.push(cur); }
  return out.map(p => `<p>${b8Esc(p)}</p>`).join('');
}

function b8Render(keep) {
  const y = keep ? window.scrollY : 0;
  stopFields();
  const map = { wake: b8Wake, pick: b8Pick, name: b8Name, game: b8Game, event: b8Event, result: b8Result, renew: b8Renew, end: b8End };
  document.getElementById('app').innerHTML = b8Top() + (map[state8.screen] || b8Wake)();
  paintFields();
  if (keep) requestAnimationFrame(() => window.scrollTo(0, y)); else window.scrollTo(0, 0);
}

function b8Top() {
  return `<div class="top">
    <div class="brand"><b>此世</b><span class="dot">·</span><span class="mono" style="font-size:11px;letter-spacing:.12em">家计</span></div>
    <div style="display:flex;gap:6px">
      <button class="icon" onclick="b8Book()">账</button>
      <button class="icon" onclick="b8Help()">?</button>
    </div>
  </div>`;
}

function b8Wake() {
  return `<div class="view splash">
    <canvas class="mark" data-field="sigil" style="width:110px;height:76px"></canvas>
    <h1 class="display">一家人，<br><span>一年一年地熬。</span></h1>
    <p class="sub">五个岗位，五六口人。<br>总有一个位置空着，空着就荒。</p>
    <button class="btn primary" style="max-width:280px" onclick="b8Go('pick')">翻开</button>
    <p class="faint mono" style="font-size:10px;letter-spacing:.14em;margin-top:34px">FAMILY LEDGER · LOCAL ONLY</p>
  </div>`;
}

function b8Pick() {
  return `<div class="view">
    <div class="eyebrow">Six families</div>
    <h1 class="title">先算哪一家</h1>
    <p class="subtitle">六部作品，六本家计。每本从出生算到死。一局二十来次分配。</p>
    <canvas data-field="wide" style="height:56px;width:100%;margin:10px 0 16px"></canvas>
    ${STORY_ORDER.map((n, i) => {
      const b = STORY6[n];
      return `<div class="bookcard" onclick="b8Choose(${i})">
        <div class="bn">第 ${['一','二','三','四','五','六'][i]} 部 · ${b8Esc(b.subtitle)}</div>
        <h3>${b8Esc(n)}</h3>
        <p class="small">${b8Esc(b.through)}</p>
        <div class="bmeta"><span>${b.main.length} 段戏</span><span>${b.main[0].age[0]}–${b.main[b.main.length-1].age[1]} 岁</span><span>${BOARD8[n] ? BOARD8[n].posts.map(p => p.name).join(' · ') : ''}</span></div>
      </div>`;
    }).join('')}
  </div>`;
}

function b8Choose(i) { state8.book = STORY_ORDER[i]; state8.screen = 'name'; b8Render(); }

function b8Name() {
  const b = STORY6[state8.book];
  const cfg = BOARD8[state8.book];
  return `<div class="view">
    <div class="eyebrow">Before you were born</div>
    <h1 class="title">${b8Esc(state8.book)}</h1>
    <p class="subtitle">${b8Esc(b.subtitle)}</p>
    <canvas data-field="sigil" style="height:80px;width:100%;margin:8px 0 14px"></canvas>
    <div class="card"><h3 style="font:400 17px/1.6 var(--serif)">这一本记的是</h3><p class="small">${b8Esc(b.through)}</p></div>
    <div class="card"><h3 style="font:400 17px/1.6 var(--serif)">这一家的五个岗位</h3>
      ${cfg.posts.map(p => `<p class="small" style="margin:5px 0"><b>${p.name}</b> · 出${{food:cfg.food,util:cfg.util,house:'住',social:'人情',craft:'手艺'}[p.out]}　体耗 ${p.ti}　心耗 ${p.xin > 0 ? '-' + p.xin : '+' + (-p.xin)}</p>`).join('')}
    </div>
    <div class="card"><h3 style="font:400 17px/1.6 var(--serif)">这一家的人</h3>
      ${b.cast.map(c => `<p class="small" style="margin:5px 0"><b>${b8Esc(c.name)}</b> · 你的${b8Esc(c.tag)}，${b8Esc(c.role)}</p>`).join('')}
    </div>
    <div style="margin-top:16px"><label class="small muted">你的名字</label>
      <input id="b8n" value="" placeholder="不写也行"></div>
    <button class="btn primary" style="margin-top:18px" onclick="b8Start()">出生</button>
    <button class="btn ghost" style="margin-top:10px" onclick="b8Go('pick')">换一家</button>
  </div>`;
}

function b8Start() {
  const el = document.getElementById('b8n');
  const nm = el ? el.value.trim() : '';
  s8Make(state8.book, nm);
  state8.screen = 'game';
  b8Render();
}

function b8Go(s) { state8.screen = s; b8Render(); }

/* ---------- 棋盘 ---------- */
function b8Game() {
  if (state8.dead) return b8End();
  const alive = s8Alive();
  const cfg = state8.cfg;
  const assigned = Object.values(state8.assign).filter(Boolean);
  const freePeople = alive.filter(p => !state8.assign[p.id]);
  const unmanned = state8.posts.filter(p => !assigned.includes(p.id));
  const season = s8Season();

  return `<div class="view">
    <div class="eyebrow">第 ${state8.year} 年 · ${season}</div>
    <div class="row" style="align-items:flex-end;margin-bottom:2px">
      <h1 class="title" style="margin:0">${b8Esc(state8.book)}</h1>
      <div class="mono small" style="color:var(--ink-faint)">${state8.age} 岁</div>
    </div>

    <div class="ledgerbar">
      <div><span>${cfg.food}</span><b>${state8.food.toFixed(1)}</b></div>
      <div><span>${cfg.util}</span><b>${state8.util.toFixed(1)}</b></div>
      <div><span>人情</span><b>${state8.social.toFixed(1)}</b></div>
      <div><span>名声</span><b>${state8.rep}</b></div>
    </div>

    <div class="board">
      <div class="bh"><span>岗位</span><span>守的人</span><span>级</span></div>
      ${state8.posts.map(p => {
        const pid = s8PostOf(p.id);
        const person = pid ? alive.find(x => x.id === pid) : null;
        return `<div class="brow ${person ? '' : 'empty'}" onclick="b8TapPost('${p.id}')">
          <div class="bnm">${p.name}</div>
          <div class="bwho">${person ? b8Esc(person.name) + '<span>' + person.age + ' 体' + Math.round(person.ti) + ' 心' + Math.round(person.xin) + '</span>' : '<span class="faint">空着 · 要荒</span>'}</div>
          <div class="blv">${'■'.repeat(p.lv)}${'□'.repeat(Math.max(0, 3 - p.lv))}</div>
        </div>`;
      }).join('')}
    </div>

    <div class="scene-meta" style="margin-top:16px">还没上工的人</div>
    <div class="freebar">
      ${freePeople.length ? freePeople.map(p => `<button class="pchip" onclick="b8TapPerson('${p.id}')">
        <b>${b8Esc(p.name)}</b><span>${p.tag} · ${p.age} · 体${Math.round(p.ti)} 心${Math.round(p.xin)} 手${p.shou}</span>
      </button>`).join('') : '<span class="small faint">都上工了。</span>'}
    </div>
    ${unmanned.length ? `<p class="small faint" style="margin-top:8px">空着的岗位：${unmanned.map(p => p.name).join('、')}</p>` : ''}

    <div class="clocks">
      ${s8ClocksBar()}
    </div>

    ${state8.lastNotes && state8.lastNotes.length ? `<div class="yearnotes">${state8.lastNotes.map(n => `<span class="yn ${n.c}">${b8Esc(n.k)}${n.v ? ' ' + (n.v > 0 ? '+' : '') + n.v : ''}</span>`).join('')}</div>` : ''}

    <button class="btn primary" style="margin-top:18px" onclick="b8RunYear()">就这么过一年</button>
    <div class="grid2" style="margin-top:8px">
      <button class="btn ghost" onclick="b8RestAll()">剩下的人歇着</button>
      <button class="btn ghost" onclick="b8Auto()">随便排一下</button>
    </div>
  </div>`;
}

function s8ClocksBar() {
  const alive = s8Alive().filter(p => p.id !== 'self');
  const elder = alive.slice().sort((a, b) => b.age - a.age)[0];
  const kid = alive.filter(p => p.age >= 5 && p.age <= 14).sort((a, b) => a.age - b.age)[0];
  const rent = state8.cfg.rent;
  const yearsToRent = 4 - (state8.year % 4 || 4);
  return `<div class="cbar">
    ${elder ? `<div class="ck"><span>${b8Esc(elder.name)}</span><b>${elder.age}</b><i>还能干 ${Math.max(0, 70 - elder.age)} 年</i></div>` : ''}
    <div class="ck"><span>地租</span><b>${rent}</b><i>${yearsToRent === 0 ? '今年秋后' : yearsToRent + ' 年后'}</i></div>
    ${kid ? `<div class="ck"><span>${b8Esc(kid.name)}</span><b>${kid.age}</b><i>读书窗口 ${Math.max(0, 14 - kid.age)} 年</i></div>` : `<div class="ck"><span>寿限</span><b>${state8.deadline}</b><i>还有 ${Math.max(0, state8.deadline - state8.age)} 年</i></div>`}
  </div>`;
}

/* ---------- 交互 ---------- */
let b8Sel = null;

function b8TapPerson(id) {
  b8Sel = (b8Sel === id) ? null : id;
  b8Render(true);
  if (b8Sel) b8Toast('点一个岗位');
}

function b8TapPost(pid) {
  if (!b8Sel) {
    // 空位且有人在等 → 也行，先选人
    b8Toast('先点下面的人');
    return;
  }
  const p = state8.people.find(x => x.id === b8Sel);
  const post = s8Post(pid);
  if (!p || !post) return;
  if (p.age < post.minAge) { b8Toast(`${p.name}太小，做不了${post.name}`); return; }
  if (post.maxAge && p.age > post.maxAge) { b8Toast(`${p.name}太大了`); return; }
  if (p.id === 'self' && p.age < 7) { b8Toast('你还太小'); return; }
  // 岗位已有人 → 换下来
  const cur = s8PostOf(pid);
  if (cur) state8.assign[cur] = null;
  state8.assign[b8Sel] = pid;
  b8Sel = null;
  b8Render(true);
}

function b8RestAll() {
  for (const p of s8Alive()) if (!state8.assign[p.id]) state8.assign[p.id] = 'rest';
  b8Render(true);
}

function b8Auto() {
  const alive = s8Alive();
  const order = alive.slice().sort((a, b) => (b.shou * 2 + b.ti / 20) - (a.shou * 2 + a.ti / 20));
  state8.assign = {};
  const posts = state8.posts.slice();
  for (const p of order) {
    const fit = posts.find(p2 => !s8PostOf(p2.id) && p.age >= p2.minAge && (!p2.maxAge || p.age <= p2.maxAge) && p.id !== 'self' || (p.id === 'self' && p.age >= 7 && p.age >= p2.minAge && !s8PostOf(p2.id)));
    if (fit) state8.assign[p.id] = fit.id;
  }
  b8Render(true);
}

function b8RunYear() {
  for (const p of s8Alive()) if (!state8.assign[p.id]) state8.assign[p.id] = 'rest';
  state8.lastNotes = s8ResolveYear();
  state8.assign = {};

  if (state8.dead) { state8.screen = 'end'; b8Render(); return; }
  if (state8.reasonOpen) { state8.screen = 'renew'; b8Render(); return; }

  const ev = s8NextEvent();
  if (ev) { state8.pendingEvent = ev; state8.screen = 'event'; b8Render(); return; }
  state8.screen = 'game';
  b8Render();
}

/* ---------- 事件 ---------- */
function b8Event() {
  const sc = state8.pendingEvent;
  if (!sc) return b8Game();
  const post = s8EventPost(sc);
  const pname = (s8Post(post) || {}).name || '';
  return `<div class="view">
    <div class="eyebrow">第 ${state8.year} 年 · 一件事</div>
    <div class="scene-meta">${b8Esc(state8.book)} · ${state8.age} 岁 · 要占「${pname}」这个岗位</div>
    <h1 class="scene-title">${b8Esc(sc.title)}</h1>
    <div class="prose">${b8Paras(sc.opening)}</div>
    ${sc.ask ? `<div class="ask">${b8Esc(sc.ask)}</div>` : ''}
    <div class="choices">
      ${sc.choices.map((c, i) => `<button class="choice2" onclick="b8PickOpt(${i})">
        <span class="cn">${['一','二','三'][i]}</span>
        <span class="ct"><b>${b8Esc(c.title)}</b><span class="cd">${b8Esc(c.desc)}</span><span class="ch">${b8Esc(c.hint)}</span></span>
      </button>`).join('')}
    </div>
  </div>`;
}

function b8PickOpt(i) {
  s8ApplyChoice(i);
  state8.screen = 'result';
  b8Render();
}

function b8Result() {
  const r = state8.lastResult;
  return `<div class="view">
    <div class="eyebrow">After this</div>
    <h1 class="scene-title">${b8Esc(r.title)}</h1>
    <div class="small faint mono" style="margin-bottom:12px">你选了：${b8Esc(r.choice)}${r.post ? ' · ' + r.post + '这一年荒了' : ''}</div>
    <canvas data-field="wide" style="height:44px;width:100%;margin-bottom:14px"></canvas>
    <div class="prose">${b8Paras(r.outcome)}</div>
    <p class="small muted" style="margin-top:14px">处理这件事，占掉了家里一个人一整年。</p>
    <button class="btn primary" style="margin-top:18px" onclick="b8BackGame()">回去排明年</button>
  </div>`;
}
function b8BackGame() { state8.screen = 'game'; state8.assign = {}; b8Render(); }

/* ---------- 续命 ---------- */
function b8Renew() {
  const reasons = s8Reasons();
  return `<div class="view">
    <div class="eyebrow">The limit</div>
    <h1 class="title">${state8.age} 岁，你走到了尽头</h1>
    <p class="subtitle">入冬以后你就没下过炕。屋檐挂着冰，屋里只有灶膛一点火。</p>
    <div class="prose" style="margin-top:14px">
      <p>有天夜里你醒着，听见堂屋有人说话。说家里的事，说明年开春的打算。</p>
      <p>你躺在那里，把这些话听完了。窗纸上有月亮。</p>
    </div>
    <div class="ask" style="margin-top:18px">你还想看见什么？</div>
    <div class="choices">
      ${reasons.map((r, i) => `<button class="choice2" onclick="b8Take(${i})">
        <span class="cn">${['一','二','三'][i]}</span>
        <span class="ct"><b>${b8Esc(r.text)}</b><span class="cd">${b8Esc(r.sub)}</span><span class="ch">代价：${b8Esc(r.cost)}</span></span>
      </button>`).join('')}
      ${state8.renewals.length ? `<button class="choice2" onclick="b8Strike()">
        <span class="cn">四</span>
        <span class="ct"><b>把自己从名册上划掉</b><span class="cd">你搬到柴房去，不占屋里的位置了。她今年能腾出手，办自己的事。</span><span class="ch">代价：你每季掉八点体，可能过不了这个冬</span></span>
      </button>` : ''}
      <button class="choice2" onclick="b8GiveUp()">
        <span class="cn">五</span>
        <span class="ct"><b>不了。</b><span class="cd">就这样吧。他们都还在，我不想一个人留到最后。</span><span class="ch">这也是一条正经的结局</span></span>
      </button>
    </div>
  </div>`;
}

function b8Take(i) {
  s8TakeReason(i);
  state8.screen = 'game';
  b8Render();
  b8Toast('你活下来了。寿限推到 ' + state8.deadline + ' 岁');
}

function b8GiveUp() { s8GiveUp(); state8.screen = 'end'; b8Render(); }
function b8Strike() {
  s8StrikeSelf();
  // 立刻结算一次"划掉"的代价
  const me = s8Self();
  me.ti = Math.max(1, me.ti - 8);
  state8.deadline = Math.min(state8.deadline, state8.age + 4);
  state8.screen = 'game';
  b8Render();
  b8Toast('你搬去了柴房。穗禾今年能办自己的事了。');
}

/* ---------- 结局 ---------- */
function b8End() {
  const L = s8LedgerData();
  const alive = s8Alive().filter(p => p.id !== 'self');
  const gone = state8.people.filter(p => p.id !== 'self' && (!p.alive || p.away));
  return `<div class="view">
    <div class="eyebrow">The ledger closes</div>
    <h1 class="title">${state8.age} 岁，这一本合上了</h1>
    <p class="subtitle">${b8Esc(state8.name)} · ${b8Esc(state8.book)} · ${b8Esc(state8.deathWhy || '一生走完')}</p>
    <canvas data-field="wide" style="height:76px;width:100%;margin:12px 0 16px"></canvas>

    <div class="card"><h3 style="font:400 17px/1.6 var(--serif)">这一生，时间去了哪</h3>
      <div class="tl">
        ${[['田里', L.field], ['做工', L.work], ['屋里陪人', L.care], ['走人情', L.social], ['读书', L.study]].filter(x => x[1] > 0).map(x => `
          <div class="tlrow"><span>${x[0]}</span><div class="tlbar"><i style="width:${Math.min(100, x[1] / Math.max(1, L.years) * 100)}%"></i></div><b>${x[1]} 年</b></div>`).join('')}
      </div>
      <p class="small muted" style="margin-top:10px">活了 ${L.years} 年。</p>
    </div>

    <div class="card"><h3 style="font:400 17px/1.6 var(--serif)">家业</h3>
      <p class="small">${state8.cfg.food} ${state8.food.toFixed(1)} · 钱 ${Math.round(state8.coins)} · 名声 ${state8.rep}</p>
      <p class="small">岗位：${state8.posts.map(p => p.name + ' ' + p.lv + '级').join(' · ')}</p>
    </div>

    <div class="card"><h3 style="font:400 17px/1.6 var(--serif)">人</h3>
      ${alive.length ? alive.map(p => `<p class="small" style="margin:6px 0"><b>${b8Esc(p.name)}</b>（${p.age}）· 还在</p>`).join('') : '<p class="small muted">身边没有人。</p>'}
      ${gone.length ? gone.map(p => `<p class="small muted" style="margin:4px 0">${b8Esc(p.name)} · ${b8Esc(p.note || '走了')}</p>`).join('') : ''}
    </div>

    ${state8.renewals.length ? `<div class="card"><h3 style="font:400 17px/1.6 var(--serif)">续过 ${state8.renewals.length} 次命</h3>
      ${state8.renewals.map(r => `<p class="small" style="margin:7px 0"><span class="faint mono">${r.age} 岁</span> ${b8Esc(r.text)}</p>`).join('')}</div>` : ''}

    ${state8.threads.filter(t => t.open).length ? `<div class="card"><h3 style="font:400 17px/1.6 var(--serif)">没结的事</h3>
      ${state8.threads.filter(t => t.open).slice(0,8).map(t => `<p class="small" style="margin:5px 0">${b8Esc(t.text)} <span class="faint mono">${t.age} 岁</span></p>`).join('')}</div>` : ''}
    <div class="card"><h3 style="font:400 17px/1.6 var(--serif)">最后一句</h3>
      <p class="small muted">${alive.length ? '床头站着人。你说了一句什么，没人听清。' : '床边没有人。屋里有灶灰的味道。'}</p></div>

    <div class="notice">这一本算完了。换一种排法，是另一本账。</div>
    <button class="btn primary" onclick="b8Again()">再算一次</button>
    <button class="btn ghost" style="margin-top:10px" onclick="b8Go('pick')">去算另一家</button>
  </div>`;
}

function b8Again() {
  s8Make(state8.book, state8.name);
  state8.screen = 'game';
  b8Render();
}

/* ---------- 弹层 ---------- */
function b8Sheet(html) {
  const el = document.createElement('div');
  el.className = 'modal'; el.id = 'b8modal';
  el.innerHTML = `<div>${html}</div>`;
  el.addEventListener('click', e => { if (e.target === el) el.remove(); });
  document.body.appendChild(el);
}
function b8Book() {
  const L = s8LedgerData();
  b8Sheet(`<h2>这本账</h2>
    <dl class="kv">
      <dt>第</dt><dd>${state8.year} 年 · ${s8Season()}</dd>
      <dt>${state8.cfg.food}</dt><dd>${state8.food.toFixed(1)}</dd>
      <dt>${state8.cfg.util}</dt><dd>${state8.util.toFixed(1)}</dd>
      <dt>人情</dt><dd>${state8.social.toFixed(1)}</dd>
      <dt>名声</dt><dd>${state8.rep} / 30</dd>
      <dt>钱</dt><dd>${Math.round(state8.coins)}</dd>
    </dl>
    <hr style="border:none;border-top:1px solid var(--rule);margin:14px 0">
    <p class="small muted">已经过去：田 ${L.field} · 工 ${L.work} · 陪人 ${L.care} · 人情 ${L.social} · 读 ${L.study}</p>
    ${state8.combosFound.length ? `<p class="small" style="margin-top:8px">撞见过：${state8.combosFound.join('、')}</p>` : ''}
    ${state8.threads.filter(t => t.open).length ? `<p class="small" style="margin-top:8px">没结的事：${state8.threads.filter(t => t.open).map(t => b8Esc(t.text)).join('；')}</p>` : ''}
    <button class="btn" style="margin-top:14px" onclick="document.getElementById('b8modal').remove()">合上</button>`);
}
function b8Help() {
  b8Sheet(`<h2>怎么排</h2>
    <p class="small">五个岗位，一家人。一年排一次。岗位空着不会等你——空两季就降级。</p>
    <p class="small">每个人有<b>体</b>、<b>心</b>、<b>手</b>。体掉到 25 以下活儿干不动，心掉到 12 以下人会走。手只有「学」能涨。</p>
    <p class="small">「学」只有 7–14 岁能上。孩子读七年，手能到 4 级以上，回来一个顶三个。</p>
    <p class="small">人和人放在相邻的岗位上，会撞出组合。组合不写在任何地方，自己发现。</p>
    <p class="small">每段戏都要占一个岗位——处理一件事，就要有一个人去做。</p>
    <p class="small">寿限到了会问你「还想看见什么」。选了能接着活，但身子回不去，而且你从此只能待在屋里。</p>
    <button class="btn" style="margin-top:14px" onclick="document.getElementById('b8modal').remove()">明白了</button>`);
}
function b8Toast(t) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = t; el.style.display = 'block';
  clearTimeout(window.__b8t);
  window.__b8t = setTimeout(() => el.style.display = 'none', 2000);
}

(function b8Boot() {
  const ok = s8Load();
  if (ok && state8.dead) state8.screen = 'end';
  else if (ok && state8.people.length) state8.screen = state8.screen === 'wake' ? 'game' : state8.screen;
  b8Render();
  window.addEventListener('beforeunload', s8Save);
})();
