'use strict';

/* v9 界面：一年一卡 */

function c9Esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function c9Paras(t) {
  const parts = String(t || '').match(/[^。！？]{1,90}[。！？]?/g) || [t];
  const out = []; let cur = '';
  for (const p of parts) { cur += p; if (cur.length >= 72) { out.push(cur); cur = ''; } }
  if (cur) { if (out.length) out[out.length - 1] += cur; else out.push(cur); }
  return out.map(p => `<p>${c9Esc(p)}</p>`).join('');
}

function c9Render(keep) {
  const y = keep ? window.scrollY : 0;
  stopFields();
  const map = { wake: c9Wake, pick: c9Pick, name: c9NamePage, card: c9Card, result: c9Result, renew: c9RenewPage, end: c9End };
  document.getElementById('app').innerHTML = c9Top() + (map[s9.screen] || c9Wake)();
  paintFields();
  if (keep) requestAnimationFrame(() => window.scrollTo(0, y)); else window.scrollTo(0, 0);
}

function c9Top() {
  return `<div class="top">
    <div class="brand"><b>此世</b><span class="dot">·</span><span class="mono" style="font-size:11px;letter-spacing:.12em">一生</span></div>
    <div style="display:flex;gap:6px">
      <button class="icon" onclick="c9Book()">账</button>
      <button class="icon" onclick="c9Help()">?</button>
    </div>
  </div>`;
}

function c9Wake() {
  return `<div class="view splash">
    <canvas class="mark" data-field="sigil" style="width:110px;height:76px"></canvas>
    <h1 class="display">一年一张卡，<br><span>一年一个选择。</span></h1>
    <p class="sub">选项会随年龄长出来。<br>你今天投的，三年后才长出来。</p>
    <button class="btn primary" style="max-width:280px" onclick="c9Go('pick')">开始</button>
    <p class="faint mono" style="font-size:10px;letter-spacing:.14em;margin-top:34px">ONE CARD A YEAR · LOCAL ONLY</p>
  </div>`;
}

function c9Pick() {
  return `<div class="view">
    <div class="eyebrow">Six lives</div>
    <h1 class="title">活哪一辈子</h1>
    <p class="subtitle">六部作品。每部从 0 岁到死，一年一张卡。</p>
    <canvas data-field="wide" style="height:56px;width:100%;margin:10px 0 16px"></canvas>
    ${STORY_ORDER.map((n, i) => {
      const b = STORY6[n];
      return `<div class="bookcard" onclick="c9Choose(${i})">
        <div class="bn">第 ${['一','二','三','四','五','六'][i]} 部 · ${c9Esc(b.subtitle)}</div>
        <h3>${c9Esc(n)}</h3>
        <p class="small">${c9Esc(b.through)}</p>
        <div class="bmeta"><span>${b.main.length} 段戏</span><span>${b.main[0].age[0]}–${b.main[b.main.length-1].age[1]} 岁</span></div>
      </div>`;
    }).join('')}
  </div>`;
}

function c9Choose(i) { s9.book = STORY_ORDER[i]; s9.screen = 'name'; c9Render(); }

function c9NamePage() {
  const b = STORY6[s9.book];
  return `<div class="view">
    <div class="eyebrow">Before you were born</div>
    <h1 class="title">${c9Esc(s9.book)}</h1>
    <p class="subtitle">${c9Esc(b.subtitle)}</p>
    <canvas data-field="sigil" style="height:78px;width:100%;margin:8px 0 14px"></canvas>
    <div class="card"><h3 style="font:400 17px/1.6 var(--serif)">这一本记的是</h3><p class="small">${c9Esc(b.through)}</p></div>
    <div class="card"><h3 style="font:400 17px/1.6 var(--serif)">这一家的人</h3>
      ${b.cast.map(c => `<p class="small" style="margin:5px 0"><b>${c9Esc(c.name)}</b> · 你的${c9Esc(c.tag)}，${c9Esc(c.role)}</p>`).join('')}
    </div>
    <div style="margin-top:16px"><label class="small muted">你的名字</label>
      <input id="c9n" placeholder="不写也行"></div>
    <button class="btn primary" style="margin-top:18px" onclick="c9Start()">出生</button>
    <button class="btn ghost" style="margin-top:10px" onclick="c9Go('pick')">换一部</button>
  </div>`;
}

function c9Start() {
  const el = document.getElementById('c9n');
  c9Make(s9.book, el ? el.value.trim() : '');
  s9.screen = 'card';
  c9Render();
}

function c9Go(s) { s9.screen = s; c9Render(); }

/* ---------- 一年一张卡 ---------- */
function c9Card() {
  if (s9.dead) return c9End();
  if (s9.outcome) return c9Result();
  if (!s9.card) c9BuildCard();
  const card = s9.card;
  const L = c9Lex();
  const alive = c9Alive().filter(p => p.id !== 'self');
  const used = c9Used();
  const left = s9.effort - used;

  return `<div class="view">
    <div class="eyebrow">第 ${s9.year} 年 · ${s9.age} 岁</div>

    <div class="stats9">
      <div><span>身</span><b>${Math.round(s9.body)}</b><i style="width:${s9.body}%"></i></div>
      <div><span>心</span><b>${Math.round(s9.heart)}</b><i class="blue" style="width:${s9.heart}%"></i></div>
      <div><span>手</span><b>${s9.hand.toFixed(1)}</b><i class="ink" style="width:${s9.hand * 10}%"></i></div>
    </div>

    <div class="row" style="margin-top:10px">
      <span class="small muted">${L.grain} ${s9.grain.toFixed(1)}　${L.unit} ${Math.round(s9.coin)}　田 ${s9.field} 亩</span>
      <span class="mono small">${s9.age} 岁</span>
    </div>

    <div class="card9">
      <div class="c9head">${c9Esc(card.title)}</div>
      <div class="prose">${c9Paras(card.text)}</div>
      ${card.ask ? `<div class="ask">${c9Esc(card.ask)}</div>` : ''}
    </div>

    ${card.kind === 'plot' ? `
      <div class="scene-meta" style="margin-top:6px">这一年只做这一个决定</div>
      <div class="choices" style="margin-top:8px">
        ${card.actions.map((a, i) => `<button class="choice2 ${s9.picks.includes(i) ? 'on' : ''}" onclick="c9Toggle(${i})">
          <span class="cn">${['一','二','三'][i]}</span>
          <span class="ct"><b>${c9Esc(a.name)}</b><span class="cd">${c9Esc(a.desc)}</span><span class="ch">${c9Esc(a.hint)}</span></span>
        </button>`).join('')}
      </div>` : `
      <div class="effortbar">
        <span>这一年有 <b>${s9.effort}</b> 点心力</span>
        <span class="mono">剩 ${left}</span>
      </div>
      <div class="acts">
        ${card.actions.map((a, i) => {
          const on = s9.picks.includes(i);
          const tooMuch = !on && a.effort > left;
          return `<button class="act ${on ? 'on' : ''} ${tooMuch ? 'dim' : ''}" onclick="c9Toggle(${i})">
            <span class="an">${on ? '●' : '○'}</span>
            <span class="at"><b>${c9Esc(a.name)}</b><span class="ag">${c9Esc(a.gainText || '')}</span></span>
            <span class="ae">${a.effort ? '-' + a.effort : '0'}</span>
          </button>`;
        }).join('')}
      </div>`}

    <button class="btn primary" style="margin-top:16px" onclick="c9Commit()">过完这一年</button>
    <p class="small faint" style="margin-top:8px">${card.kind === 'plot' ? '选一个。不能反悔。' : '心力用不完也没关系，剩下的会变成休息。'}</p>
  </div>`;
}

/* ---------- 结算 ---------- */
function c9Result() {
  const o = s9.outcome;
  const d = o.d;
  const chips = [];
  if (d.body) chips.push({ k: '身', v: d.body });
  if (d.heart) chips.push({ k: '心', v: d.heart });
  if (d.hand) chips.push({ k: '手', v: d.hand });
  if (d.coin) chips.push({ k: c9Lex().unit, v: d.coin });
  if (d.grain) chips.push({ k: c9Lex().grain, v: d.grain });

  return `<div class="view">
    <div class="eyebrow">${o.year} 年 · ${o.age} 岁</div>
    <h1 class="scene-title" style="margin-bottom:6px">${c9Esc(o.title)}</h1>
    <canvas data-field="wide" style="height:44px;width:100%;margin:8px 0 14px"></canvas>

    <div class="prose">
      ${o.said.map(x => `<p>${c9Esc(x)}</p>`).join('')}
    </div>

    <div class="gains">${chips.map(c => `<span class="gain ${c.v > 0 ? 'good' : 'bad'}">${c.k} ${c.v > 0 ? '+' : ''}${c.v}</span>`).join('')}</div>

    ${s9.nextHint ? `<div class="notice" style="margin-top:14px">${c9Esc(s9.nextHint)}</div>` : ''}

    <button class="btn primary" style="margin-top:18px" onclick="c9NextYear()">下一年</button>
  </div>`;
}

function c9NextYear() {
  s9.outcome = null;
  s9.nextHint = '';
  s9.card = null;
  s9.screen = 'card';
  if (s9.dead) { s9.screen = 'end'; c9Render(); return; }
  s9Save();
  c9Render();
}

/* ---------- 续命 ---------- */
function c9RenewPage() {
  const reasons = c9Reasons();
  return `<div class="view">
    <div class="eyebrow">The limit</div>
    <h1 class="title">${s9.age} 岁，你走到了尽头</h1>
    <p class="subtitle">入冬以后你就没下过炕。屋檐上挂着冰，屋里只有灶膛一点火。</p>
    <div class="prose" style="margin-top:14px">
      <p>有天夜里你醒着，听见堂屋有人说话。说家里的事，说明年开春的打算。</p>
      <p>你躺在那里，把这些话听完了。窗纸上有月亮。</p>
    </div>
    <div class="ask" style="margin-top:18px">你还想看见什么？</div>
    <div class="choices">
      ${reasons.length ? reasons.map((r, i) => `<button class="choice2" onclick="c9Take(${i})">
        <span class="cn">${['一','二','三'][i]}</span>
        <span class="ct"><b>${c9Esc(r.text)}</b><span class="cd">${c9Esc(r.sub)}</span><span class="ch">代价：${c9Esc(r.cost)}</span></span>
      </button>`).join('') : `<p class="small muted">你已经想不出还想看见什么了。</p>`}
      <button class="choice2" onclick="c9EndIt()">
        <span class="cn">${reasons.length ? '四' : '一'}</span>
        <span class="ct"><b>不了。</b><span class="cd">就这样吧。他们都还在，我不想一个人留到最后。</span><span class="ch">这也是一条正经的结局</span></span>
      </button>
    </div>
  </div>`;
}

function c9Take(i) {
  c9Renew(i);
  s9.screen = 'card';
  c9Render();
  c9Toast('你活下来了。寿限推到 ' + s9.deadline + ' 岁');
}
function c9EndIt() { c9GiveUp(); c9Render(); }

/* ---------- 结局 ---------- */
function c9End() {
  const L = c9Ledger();
  return `<div class="view">
    <div class="eyebrow">The end</div>
    <h1 class="title">${s9.age} 岁，这一生走完了</h1>
    <p class="subtitle">${c9Esc(s9.name)} · ${c9Esc(s9.book)} · ${c9Esc(s9.why || '一生')}</p>
    <canvas data-field="wide" style="height:76px;width:100%;margin:12px 0 16px"></canvas>

    <div class="card"><h3 style="font:400 17px/1.6 var(--serif)">最后的样子</h3>
      <dl class="kv" style="margin-top:8px">
        <dt>活到</dt><dd>${s9.age} 岁</dd>
        <dt>手</dt><dd>${L.hand} 级</dd>
        <dt>田</dt><dd>${L.field} 亩</dd>
        <dt>留下</dt><dd>${L.grain} ${c9Lex().grain} · ${L.coin} ${c9Lex().unit}</dd>
      </dl>
    </div>

    <div class="card"><h3 style="font:400 17px/1.6 var(--serif)">人</h3>
      ${L.alive.length ? L.alive.map(p => `<p class="small" style="margin:6px 0"><b>${c9Esc(p.name)}</b>（${p.age}）· ${c9Esc(p.tag)}</p>`).join('') : '<p class="small muted">身边没有人。</p>'}
      ${L.gone.length ? L.gone.map(p => `<p class="small muted" style="margin:4px 0">${c9Esc(p.name)} · ${c9Esc(p.note || '走了')}</p>`).join('') : ''}
    </div>

    ${L.renew.length ? `<div class="card"><h3 style="font:400 17px/1.6 var(--serif)">续过 ${L.renew.length} 次命</h3>
      ${L.renew.map(r => `<p class="small" style="margin:7px 0"><span class="faint mono">${r.age} 岁</span> ${c9Esc(r.text)}</p>`).join('')}</div>` : ''}

    <div class="card"><h3 style="font:400 17px/1.6 var(--serif)">最后一句</h3>
      <p class="small muted">${L.alive.length ? '床头站着人。你说了一句什么，没人听清。' : '床边没有人。屋里有灶灰的味道。'}</p>
    </div>

    <div class="notice">这一世走完了。换一种活法，是另一世。</div>
    <button class="btn primary" onclick="c9Again()">再活一次</button>
    <button class="btn ghost" style="margin-top:10px" onclick="c9Go('pick')">去活别人</button>
  </div>`;
}

function c9Again() { c9Make(s9.book, s9.name); s9.screen = 'card'; c9Render(); }

/* ---------- 弹层 ---------- */
function c9Sheet(html) {
  const el = document.createElement('div');
  el.className = 'modal'; el.id = 'c9modal';
  el.innerHTML = `<div>${html}</div>`;
  el.addEventListener('click', e => { if (e.target === el) el.remove(); });
  document.body.appendChild(el);
}
function c9Book() {
  const L = c9Lex();
  s9Sheet(`<h2>这一生</h2>
    <dl class="kv">
      <dt>年</dt><dd>第 ${s9.year} 年 · ${c9Season()}</dd>
      <dt>身</dt><dd>${Math.round(s9.body)}</dd>
      <dt>心</dt><dd>${Math.round(s9.heart)}</dd>
      <dt>手</dt><dd>${s9.hand.toFixed(1)}</dd>
      <dt>${L.grain}</dt><dd>${s9.grain.toFixed(1)}</dd>
      <dt>${L.unit}</dt><dd>${Math.round(s9.coin)}</dd>
      <dt>田</dt><dd>${s9.field} 亩</dd>
    </dl>
    <button class="btn" style="margin-top:14px" onclick="document.getElementById('c9modal').remove()">合上</button>`);
}
function c9Help() {
  c9Sheet(`<h2>怎么活</h2>
    <p class="small">每年一张卡。卡上是这一年发生的事，下面是这一年你能做的事。</p>
    <p class="small">「心力」是这一年你还能分出多少神。身好、心好，心力就多。老了会少。</p>
    <p class="small">选项会随年龄长出来：七岁能上学，十三岁能出门做活，十八岁能说亲，二十岁能置地。</p>
    <p class="small">手只有读书、学手艺、教孩子能涨。手高的人做活产出高，一个顶三个。</p>
    <p class="small">寿限到了会问你「还想看见什么」。选了能接着活，但身子回不去。</p>
    <button class="btn" style="margin-top:14px" onclick="document.getElementById('c9modal').remove()">明白了</button>`);
}
function c9Toast(t) {
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = t; el.style.display = 'block';
  clearTimeout(window.__c9t);
  window.__c9t = setTimeout(() => el.style.display = 'none', 2000);
}

(function c9Boot() {
  s9Load();
  if (s9.dead) s9.screen = 'end';
  else if (s9.screen === 'wake' && s9.family && s9.family.length) s9.screen = 'card';
  c9Render();
  window.addEventListener('beforeunload', s9Save);
})();
