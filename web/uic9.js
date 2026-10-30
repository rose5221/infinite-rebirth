'use strict';

/* v9 界面：一年一卡 */

function c9Esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function c13Esc(s){ return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;'); }
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
      <button class="icon" onclick="c9Settings()">设置</button>
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

function c9Choose(i) {
  s9.book = STORY_ORDER[i];
  if (typeof o11Preview === 'function') { O11.vars = null; o11Preview(); }
  s9.screen = 'name';
  c9Render();
}

function c9NamePage() {
  const b = STORY6[s9.book];
  return `<div class="view">
    <div class="eyebrow">Before you were born</div>
    <h1 class="title">${c9Esc(s9.book)}</h1>
    <p class="subtitle">${c9Esc(b.subtitle)}</p>
    <canvas data-field="sigil" style="height:78px;width:100%;margin:8px 0 14px"></canvas>
    <div class="card"><h3 style="font:400 17px/1.6 var(--serif)">这一本记的是</h3><p class="small">${c9Esc(b.through)}</p></div>
    ${typeof o11VarText === 'function' && o11VarText() ? `<div class="card" style="border-color:var(--blue)"><h3 style="font:400 17px/1.6 var(--serif)">这一局</h3>
      <p class="small" style="margin:6px 0">${c9Esc(o11VarText())}</p>
      <p class="small faint">每一局的家里都不一样。换一局，人会变，事也会变。</p></div>` : ''}
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
function g14Index(g) { const L = g14List(); return L.findIndex(x => x.id === g.id) + 1; }

function c9Card() {
  if (s9.dead) return c9End();
  if (s9.outcome) return c9Result();

  if (s9.loading) {
    return `<div class="view" style="padding-top:16px">
      <div class="eyebrow">第 ${s9.year} 年 · ${s9.age} 岁</div>
      <canvas data-field="wide" style="height:70px;width:100%;margin-bottom:16px"></canvas>
      <h1 class="scene-title">${s9.loading === 'ai' ? '这一年出了件事…' : '这一年…'}</h1>
      <p class="prose faint">${s9.loading === 'ai' ? '正在写一段只属于你这一生的插曲。' : '正在写这一年。'}</p>
      <div class="loading"><i></i></div>
    </div>`;
  }

  if (!s9.card) {
    c9BuildCard();          // 先给一张本地卡，AI 好了再换
    if (a9On() && !s9.prepared) { s9.prepared = true; setTimeout(c9Prepare, 60); }
  }
  if (!s9.card) return `<div class="view"><div class="loading"><i></i></div></div>`;
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

    ${card.kind === 'gate' ? `
      <div class="gatebox">
        <div class="glabel">第 ${g14Index(card.gate)} 关 · ${card.gate.age} 岁</div>
        ${s9.passed && s9.passed.length ? `<div class="gprev">已经过：${g14Summary().filter(x=>x.done).map(x=>x.name).join(' · ')}</div>` : ''}
      </div>
      <div class="choices" style="margin-top:10px">
        ${card.actions.map((a, i) => `<button class="choice2 ${s9.picks.includes(i) ? 'on' : ''}" onclick="c9Toggle(${i})">
          <span class="cn">${['一','二','三'][i]}</span>
          <span class="ct"><b>${c9Esc(a.name)}</b><span class="cd">${c9Esc(a.desc)}</span><span class="ch">${c9Esc(a.hint)}</span></span>
        </button>`).join('')}
      </div>` : card.kind === 'plot' ? `
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

    <button class="btn primary" style="margin-top:16px" onclick="c9Commit()">${card.kind === 'gate' ? '就这么定' : '过完这一年'}</button>
    <p class="small faint" style="margin-top:8px">${card.kind === 'gate' ? '这一关过了，就再也不会回来。' : card.kind === 'plot' ? '三个选择，各自要付一样不同的东西。选一个，不能反悔。' : '心力用不完也没关系，剩下的会变成休息。'}</p>
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

    ${s9.card && s9.card.mark ? `<p class="small muted" style="margin-top:12px">「${c9Esc(s9.card.mark)}」</p>` : ''}
    ${(o.gate) ? `<div class="gateout ${o.gate.passed ? 'ok' : 'no'}">
      <div class="gt">${o.gate.passed ? '过了' : '没过'} · ${c9Esc(o.gate.title)}</div>
      ${o.gate.line ? `<p class="small" style="margin:6px 0 0">${c9Esc(o.gate.line)}</p>` : ''}
    </div>` : ''}
    ${(s9.pendingPriv && s9.pendingPriv.length) ? `<div class="blindbox">
      <div class="bt">你不在的那些时候</div>
      ${s9.pendingPriv.map(h => `<div class="brow2"><b>${c9Esc(h.name)}</b> · ${c9Esc(h.act)}${h.line ? `<br><span class="faint">${c9Esc(h.line)}</span>` : ''}</div>`).join('')}
      <p class="small faint" style="margin:8px 0 0">这些事你不知道是怎么开始的。你只是赶上了后面。</p>
    </div>` : ''}
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

    ${(typeof g14Summary==='function') ? `<div class="card"><h3 style="font:400 17px/1.6 var(--serif)">这一生过了哪几关</h3>
      <div class="gatesum">
      ${g14Summary().map(g => `<div class="gsrow ${g.done ? 'ok' : 'no'}"><span>${g.age} 岁</span><b>${c9Esc(g.name)}</b><i>${g.done ? '过了' : '没过'}</i></div>`).join('')}
      </div></div>` : ''}
    ${(typeof t15Summary==='function') ? (()=>{const T=t15Summary(); return T.rows.length?`<div class="card timecard">
      <h3 style="font:400 17px/1.6 var(--serif)">这一生，时间给了谁</h3>
      <div class="trows">
      ${T.rows.map(r=>`<div class="trow"><span class="tn">${c9Esc(r.name)}</span><div class="tbar"><i class="${r.k}" style="width:${Math.max(4, Math.round(r.v / Math.max(1,T.total) * 100))}%"></i></div><b>${r.v} 年</b></div>`).join('')}
      </div>
      <p class="small" style="margin-top:12px;font-family:var(--serif);font-size:15px">${c9Esc(typeof t15Verdict==='function'?t15Verdict():'')}</p>
    </div>`:'';})() : ''}

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

    ${(typeof p12Blind === 'function' && p12Blind().length) ? `<div class="card"><h3 style="font:400 17px/1.6 var(--serif)">你不知道的事</h3>
      ${p12Blind().map(x => `<p class="small" style="margin:6px 0"><span class="faint mono">${x.age}岁</span> ${c9Esc(x.line)}</p>`).join('')}</div>` : ''}

    ${s9.marks && s9.marks.length ? `<div class="card"><h3 style="font:400 17px/1.6 var(--serif)">这一生留下的几句话</h3>
      ${s9.marks.slice(-6).map(x => `<p class="small" style="margin:5px 0">「${c9Esc(x)}」</p>`).join('')}</div>` : ''}

    ${s9.letter ? `<div class="card"><h3 style="font:400 17px/1.6 var(--serif)">${c9Esc(s9.letter.from)}写的信</h3>
      <p class="small" style="line-height:1.9">${c9Esc(s9.letter.letter)}</p></div>` :
      (a9On() ? `<div class="card"><h3 style="font:400 17px/1.6 var(--serif)">半年后</h3>
      <p class="small muted">有人要给你写一封信。</p>
      <button class="btn ghost" style="margin-top:8px" onclick="c9GetLetter()">让他写</button></div>` : '')}

    <div class="card"><h3 style="font:400 17px/1.6 var(--serif)">最后一句</h3>
      <p class="small muted">${L.alive.length ? '床头站着人。你说了一句什么，没人听清。' : '床边没有人。屋里有灶灰的味道。'}</p>
    </div>

    <div class="notice">这一世走完了。换一种活法，是另一世。</div>
    <button class="btn primary" onclick="c9Again()">再活一次</button>
    <button class="btn ghost" style="margin-top:10px" onclick="c9Go('pick')">去活别人</button>
  </div>`;
}

function c9Again() { c9Make(s9.book, s9.name); s9.screen = 'card'; c9Render(); }

async function c9GetLetter() {
  c9Toast('正在写…');
  try {
    const L = await a9Letter();
    if (!L.letter) throw new Error('empty');
    s9.letter = L;
    s9Save();
    c9Render();
  } catch (e) { c9Toast('没写出来：' + (e.message || '网络')); }
}

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
  c9Sheet(`<h2>这一生</h2>
    <dl class="kv">
      <dt>年</dt><dd>第 ${s9.year} 年 · ${c9Season()}</dd>
      <dt>身</dt><dd>${Math.round(s9.body)}</dd>
      <dt>心</dt><dd>${Math.round(s9.heart)}</dd>
      <dt>手</dt><dd>${s9.hand.toFixed(1)}</dd>
      <dt>${L.grain}</dt><dd>${s9.grain.toFixed(1)}</dd>
      <dt>${L.unit}</dt><dd>${Math.round(s9.coin)}</dd>
      <dt>田</dt><dd>${s9.field} 亩</dd>
      ${s9.seed ? `<dt>这一局</dt><dd class="mono" style="font-size:11px">${s9.seed}</dd>` : ''}
    </dl>
    ${(typeof w10Net === 'function' && w10Net().length) ? `<hr style="border:none;border-top:1px solid var(--rule);margin:14px 0">
      <p class="small muted" style="margin-bottom:10px">他们之间</p>
      ${w10Net().map(e => `<div class="netrow">
        <span class="netpair">${c9Esc(e.a)} — ${c9Esc(e.b)}</span>
        <span class="netbar"><i style="width:${Math.max(0, Math.min(100, e.close))}%"></i></span>
        <span class="netnum">${e.unsaid >= 6 ? '话没说完' : '亲 ' + e.close}</span>
      </div>${e.cause ? `<p class="small faint" style="margin:-2px 0 8px 0">${c9Esc(e.cause)}</p>` : ''}`).join('')}` : ''}
    <button class="btn" style="margin-top:14px" onclick="document.getElementById('c9modal').remove()">合上</button>`);
}
function c9Settings() {
  c9Sheet(`<h2>设置</h2>
    <p class="small muted">填了密钥，日常年由 AI 现写，还会随机插入只属于你这一生的插曲。不填也能读完全部六部。</p>
    <div style="margin:14px 0"><label class="small muted">DeepSeek API Key</label>
      <input id="a9key" type="password" value="${c9Esc(s9.apiKey || '')}" placeholder="sk-...">
    </div>
    <label class="small" style="display:flex;gap:8px;align-items:center;margin:12px 0">
      <input type="checkbox" id="a9on" ${s9.ai !== false ? 'checked' : ''} style="width:auto"> 让 AI 写日常年与插曲
    </label>
    <button class="btn" onclick="c9SaveCfg()">保存</button>
    <button class="btn ghost" style="margin-top:8px" onclick="c9TestAI()">测试</button>
    <hr style="border:none;border-top:1px solid var(--rule);margin:16px 0">
    <p class="small faint">当前状态：${s9.apiKey ? (s9.ai !== false ? 'AI 已开' : 'AI 已关') : '未填密钥，纯离线'}</p>
    <button class="btn ghost" style="margin-top:10px" onclick="document.getElementById('c9modal').remove()">关闭</button>`);
}
function c9SaveCfg() {
  const k = document.getElementById('a9key'), a = document.getElementById('a9on');
  if (k) s9.apiKey = k.value.trim();
  if (a) s9.ai = a.checked;
  a9SaveCfg(); s9Save();
  document.getElementById('c9modal').remove();
  c9Toast(s9.apiKey && s9.ai !== false ? '已保存 · 下一张卡开始由 AI 现写' : '已保存 · 纯离线');
}
async function c9TestAI() {
  const k = document.getElementById('a9key'), a = document.getElementById('a9on');
  if (k) s9.apiKey = k.value.trim();
  if (a) s9.ai = a.checked;
  a9SaveCfg();
  if (!s9.apiKey) return c9Toast('先填密钥');
  c9Toast('正在测试…');
  try {
    const d = await a9JSON('只输出 JSON。', '只输出 {"ok":true}', 60);
    c9Toast(d && d.ok ? '连接正常，AI 剧情可用' : '有回应但格式不对');
  } catch (e) { c9Toast('失败：' + (e.message || '网络')); }
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
  const fresh = /(?:^|[?&])new=1/.test(location.search);
  if (fresh) { try { localStorage.removeItem('one_card_v9'); } catch (e) {} }
  else s9Load();
  if (s9.dead) s9.screen = 'end';
  else if (s9.screen === 'wake' && s9.family && s9.family.length) s9.screen = 'card';
  c9Render();
  window.addEventListener('beforeunload', s9Save);
})();
