'use strict';

/* v9 · 一年一卡
   每年一张卡：一段事 + 一份心力分配。
   选项随年龄长出来。你今天投的，三年后长出来。 */

if (typeof window !== 'undefined' && !window.state) window.state = { worldIndex: 0 };

/* 每个世界一套说法 */
const LEX9 = {
  '穗骨原': {
    unit: '谷铢', grain: '粮',
    play: '在渠边玩', watch: '跟着大人下地', study: '去学堂认字',
    help: '帮家里下田', earn: '去镇上做零工', learn: '拜师学手艺',
    rest: '歇一年', marry: '说亲', land: '置一亩地',
    child: '生养孩子', teach: '教孩子手艺', save: '攒着不花',
    care: '守在床边', talk: '陪{n}说话', place: '骨沟村'
  },
  '无昼京': {
    unit: '漏钱', grain: '灯油',
    play: '在灯蕨坑捡剩料', watch: '跟着母亲修灯', study: '去抄漏房认字',
    help: '替家里守灯铺', earn: '去影市接活', learn: '学配光的手艺',
    rest: '睡一整个白天', marry: '说亲', land: '盘下半间铺子',
    child: '生养孩子', teach: '教孩子认光', save: '攒着不花',
    care: '守在床边', talk: '陪{n}说话', place: '影市'
  },
  '借寿渡': {
    unit: '阳楮', grain: '米',
    play: '在渡口看船', watch: '跟着祖母糊纸', study: '去义庄认字',
    help: '替家里撑船', earn: '去纸寿巷接活', learn: '学称寿的规矩',
    rest: '歇一年', marry: '说亲', land: '盘下一条船',
    child: '生养孩子', teach: '教孩子烧契', save: '攒着不花',
    care: '守在床边', talk: '陪{n}说话', place: '双灯渡'
  },
  '钟葬群岛': {
    unit: '潮铢', grain: '鱼',
    play: '在礁石上数钟声', watch: '跟着父亲上塔', study: '学认钟谱',
    help: '跟着出海', earn: '去静湾搬货', learn: '学守钟的规矩',
    rest: '歇一年', marry: '说亲', land: '置一条船',
    child: '生养孩子', teach: '教孩子认钟', save: '攒着不花',
    care: '守在床边', talk: '陪{n}说话', place: '七声礁'
  },
  '髓云都市': {
    unit: '忆质', grain: '食',
    play: '在雾里跑', watch: '跟着母亲裁衣', study: '去封存塔认字',
    help: '替家里看铺子', earn: '去漂忆港接活', learn: '学审计的手艺',
    rest: '睡一整天', marry: '说亲', land: '盘下一间铺面',
    child: '生养孩子', teach: '教孩子辨忆', save: '攒着不花',
    care: '守在床边', talk: '陪{n}说话', place: '忆井广场'
  },
  '星耒野': {
    unit: '星糠', grain: '粮',
    play: '在田里追萤火', watch: '跟着父亲守夜灌', study: '去种子库认字',
    help: '帮着下田', earn: '去陨铁城搬货', learn: '学看天的手艺',
    rest: '歇一年', marry: '说亲', land: '开一亩新田',
    child: '生养孩子', teach: '教孩子看星', save: '攒着不花',
    care: '守在床边', talk: '陪{n}说话', place: '望星台'
  }
};

let s9 = {
  screen: 'wake', book: '', name: '',
  year: 1, age: 0,
  body: 72, heart: 72, hand: 1,
  coin: 500, grain: 8,
  field: 1,
  family: [],
  rel: {},
  picks: [],
  effort: 3,
  card: null,
  outcome: null,
  seen: [],
  log: [],
  renewals: [],
  deadline: 68,
  dead: false,
  why: '',
  lastSummary: '',
  nextHint: '',
  apiKey: '', ai: true,
  years: [], yearlyLog: [], marks: [], seenTitles: [],
  loading: false
};

/* ---------- 建局 ---------- */
function c9Make(book, name) {
  const b = STORY6[book];
  const cast = b.cast || [];
  const fam = [];
  const find = (id, tag) => cast.find(c => c.id === id) || cast.find(c => c.tag === tag);

  const push = (id, nm, tag, age, rel) => fam.push({ id, name: nm, tag, age, rel, alive: true, away: false, note: '' });

  const f = find('father', '父'), m = find('mother', '母');
  const s = find('sibling', '姐') || find('sibling', '妹') || cast.find(c => c.id === 'friend');
  const g = find('grandma', '祖母');

  if (f) push('father', f.name, '父', 28, 60);
  if (m) push('mother', m.name, '母', 26, 65);
  if (g) push('grandma', g.name, '祖母', 58, 55);
  if (s) push('sibling', s.name, s.tag || '姐', 5, 55);
  push('self', name || '孩子', '我', 0, 100);

  Object.assign(s9, {
    book, name: name || '孩子',
    year: 1, age: 0, body: 72, heart: 72, hand: 1,
    coin: 500, grain: 8, field: 1,
    family: fam, rel: {}, picks: [], effort: 3,
    card: null, outcome: null, seen: [], log: [],
    renewals: [], deadline: 68, dead: false, why: '',
    lastSummary: '', nextHint: '',
    years: [], yearlyLog: [], marks: [], seenTitles: [], loading: false
  });
  if (typeof w10Init === 'function') w10Init(book);
  if (typeof p12Init === 'function') p12Init(book);
  if (typeof t15Init === 'function') t15Init();
  if (typeof o11Init === 'function') {
    o11Init(book);
    s9.seed = O11.seed;
    s9.vars = O11.vars;
    o11ApplyVars();
  }
  s9Save();
}

function c9Self() { return s9.family.find(p => p.id === 'self'); }
function c9Alive() { return s9.family.filter(p => p.alive && !p.away); }
function c9Lex() { return LEX9[s9.book] || LEX9['穗骨原']; }
function c9Name(id) { const p = s9.family.find(x => x.id === id); return p ? p.name : ''; }

/* ---------- 心力 ---------- */
function c9Effort() {
  let e = 3;
  if (s9.body > 78) e += 1;
  if (s9.heart > 78) e += 1;
  if (s9.body < 42) e -= 1;
  if (s9.heart < 32) e -= 1;
  if (s9.age < 7) e = 1;
  else if (s9.age < 13) e = Math.min(e, 2);
  if (s9.age > 62) e -= 1;
  if (s9.age > 74) e -= 1;
  return Math.max(1, e);
}

/* ---------- 动作清单 ---------- */
function c9Actions() {
  const L = c9Lex();
  const a = s9.age;
  const out = [];
  const kids = c9Alive().filter(p => p.id !== 'self' && p.age <= 15);
  const olds = c9Alive().filter(p => p.id !== 'self' && p.age >= 55);
  const partner = s9.family.find(p => p.role === '伴侣' && p.alive);

  const fmt = (g) => {
    const p = [];
    if (g.body) p.push('身' + (g.body > 0 ? '+' : '') + g.body);
    if (g.heart) p.push('心' + (g.heart > 0 ? '+' : '') + g.heart);
    if (g.hand) p.push('手+' + g.hand);
    if (g.coin) p.push((g.coin > 0 ? '+' : '') + g.coin + L.unit);
    if (g.grain) p.push('粮' + (g.grain > 0 ? '+' : '') + g.grain);
    if (g.married) p.push('成家');
    if (g.child) p.push('添一口');
    if (g.field) p.push('田+1');
    if (g.kidHand) p.push('孩子手+' + g.kidHand);
    if (g.relKid) p.push('关系+' + g.relKid);
    if (g.relOld) p.push('关系+' + g.relOld);
    if (g.oldBody) p.push('长辈身+' + g.oldBody);
    return p.join(' · ');
  };
  const add = (id, name, effort, gain, desc, need) => {
    if (need && !need()) return;
    out.push({ id, name, effort, gain, gainText: fmt(gain) || desc, desc });
  };

  // 童年
  add('play', L.play, 1, { heart: 9 }, '心 +9', () => a <= 13);
  add('watch', L.watch, 1, { heart: 3, hand: 0.2 }, '心 +3 · 手 +0.2', () => a <= 10);
  // 读书
  add('study', L.study, 2, { hand: 0.4, coin: -280, heart: 4 }, '手 +0.55 · 心 +4', () => a >= 7 && a <= 15 && s9.coin >= 280);
  // 做活
  add('help', L.help, 1, { grain: 3.5, body: -7 }, '粮 +3.5 · 身 -7', () => a >= 8 && a <= 66);
  add('earn', L.earn, 2, { coin: 380, body: -12 }, '钱 +380 · 身 -12', () => a >= 13 && a <= 68);
  add('save', L.save, 1, { coin: 120 }, '钱 +120', () => a >= 16);
  // 学手艺
  add('learn', L.learn, 2, { hand: 0.35, coin: -160, body: -5 }, '手 +0.5', () => a >= 14 && a <= 32 && s9.coin >= 160);
  // 陪人
  const kid = kids[0], old = olds[0];
  add('talk_kid', L.talk.replace('{n}', kid ? kid.name : '孩子'), 1, { heart: 4, relKid: 4 }, '关系 +4 · 心 +4', () => !!kid);
  add('talk_old', L.talk.replace('{n}', old ? old.name : '老人'), 1, { heart: 3, relOld: 4 }, '关系 +4 · 心 +3', () => !!old);
  add('care', L.care.replace('{n}', old ? old.name : '老人'), 1, { body: -4, relOld: 6, oldBody: 10 }, '他身子 +10 · 关系 +6', () => !!old && old.age >= 58);
  // 成家
  add('marry', L.marry, 3, { married: true, coin: -600, heart: 10 }, '成家 · 心 +10', () => a >= 18 && a <= 32 && !s9.married && s9.coin >= 600);
  add('child', L.child, 2, { child: true, heart: 8, body: -6 }, '家里多一口 · 心 +8', () => s9.married && !s9.hasChild && a <= 42);
  add('land', L.land, 3, { field: 1, coin: -900 }, '田 +1 亩', () => a >= 20 && s9.coin >= 900);
  add('teach', L.teach, 2, { body: -6, kidHand: 0.5, heart: 5 }, '孩子手 +1 · 心 +5', () => s9.hasChild && a >= 34 && kids.length > 0);
  // 老年
  add('sun', '在门口坐着', 1, { heart: 6 }, '心 +6', () => a >= 62);
  add('watch_kid', '看孩子玩', 1, { heart: 7 }, '心 +7', () => a >= 55 && kids.length > 0);
  add('tell', '把旧事讲一遍', 1, { heart: 5, kidRel: 6 }, '心 +5 · 关系 +6', () => a >= 58);
  // 歇
  add('rest', L.rest, 0, { body: 11, heart: 7 }, '身 +11 · 心 +7', () => true);

  return out;
}

/* ---------- 今年的卡 ---------- */
/* 建卡后补 AI 内容（日常文本 / 插曲），失败就保留本地卡 */
async function c9Prepare() {
  if (!a9On()) return;
  if (s9.outcome || s9.loading || s9.aiDone) return;
  s9.aiDone = true;

  // 插曲：替换掉当前这张卡
  if (c9WantInterlude()) {
    s9.loading = 'ai';
    c9Render(true);
    try {
      const sc = await a9Scene();
      s9.pendingInterlude = sc;
      s9.lastWasInterlude = true;
      s9.card = null;
      c9BuildCard();
    } catch (e) {
      A9.lastErr = e.message || 'fail';
      s9.lastWasInterlude = false;
    }
    s9.loading = false;
    s9Save();
    c9Render(true);
    return;
  }

  // 日常文本：只换掉正文那一段
  if (s9.card && s9.card.kind === 'daily') {
    s9.loading = 'daily';
    c9Render(true);
    try {
      const d = await a9Daily();
      s9.card.text = d.text;
      s9.card.mark = d.mark;
      if (d.hint) s9.nextHint = d.hint;
    } catch (e) {
      A9.lastErr = e.message || 'fail';
    }
    s9.loading = false;
    s9Save();
    c9Render(true);
  }
}

function c9BuildCard() {
  s9.prepared = false;
  s9.aiDone = false;
  // 关系层：这一年有没有撞见
  if (!s9.pendingOverhear && !s9.pendingInterlude && s9.age >= 8 && typeof w10PickOverhear === 'function') {
    const o = w10PickOverhear();
    if (o) s9.pendingOverhear = o;
  }
  const L = c9Lex();
  const a = s9.age;
  s9.dailyText = ''; s9.dailyMark = '';

  // 关口最优先
  if (typeof g14Due === 'function') {
    const g = g14Due();
    if (g) {
      s9.card = g14Card(g);
      s9Save();
      return;
    }
  }

  // 关系层撞见
  if (s9.pendingOverhear) {
    const o = s9.pendingOverhear;
    s9.pendingOverhear = null;
    if (typeof w10MarkHeard === 'function') w10MarkHeard(o);
    s9.card = w10ToCard(o);
    return;
  }

  // AI 插曲
  if (s9.pendingInterlude) {
    const ai = s9.pendingInterlude;
    s9.pendingInterlude = null;
    s9.card = {
      kind: 'plot', ai: true,
      title: ai.title, text: ai.opening, ask: ai.ask,
      actions: ai.choices.map((c, i) => ({ id: 'ai_' + i, name: c.title, desc: c.desc, hint: c.hint, effort: 2, plot: c })),
      scene: ai
    };
    return;
  }

  const sc = c9NextScene();

  if (sc) {
    // 剧情年：用写好的那段戏当叙事，三个选项作为三个"活法"
    const acts = sc.choices.map((c, i) => ({
      id: 'plot_' + i,
      name: c.title,
      desc: c.desc,
      hint: c.hint,
      effort: 2,
      plot: c,
      gain: null
    }));
    s9.card = {
      kind: 'plot',
      title: sc.title,
      text: sc.opening,
      ask: sc.ask || '',
      actions: acts,
      scene: sc
    };
    return;
  }

  const acts = c9Actions();
  if (!s9.dailyText) s9.dailyText = c9DailyText();
  s9.card = {
    kind: 'daily',
    title: `${s9.year} 年 · ${c9Season()}`,
    text: s9.dailyText || c9DailyText(),
    ask: '',
    actions: acts,
    scene: null,
    mark: s9.dailyMark || c9LocalMark()
  };
}

/* 本地念想：一句话，将来进账本 */
function c9LocalMark() {
  const a = s9.age;
  const pool = [
    `你学会了在别人说话时不插嘴。`,
    `那一年你第一次觉得家里小。`,
    `你记住了母亲手上的皂角味。`,
    `你开始怕过年。`,
    `你发现自己走路的样子像父亲。`,
    `有一句话你到死也没说出口。`,
    `你数过一次家里的碗，比人少一只。`,
    `那年冬天你睡得特别多。`
  ];
  return pool[a % pool.length];
}

function c9Season() { return ['春', '夏', '秋', '冬'][(s9.year - 1) % 4]; }

function c9NextScene() {
  if (typeof o11NextScene === 'function' && s9.seed) return o11NextScene();
  const b = STORY6[s9.book];
  if (!b) return null;
  for (const sc of b.main) {
    if (s9.seen.includes(sc.id)) continue;
    if (s9.age < sc.age[0] || s9.age > sc.age[1] + 1) continue;
    return sc;
  }
  return null;
}

/* 这一年会不会是一段 AI 插曲：约三成，且不在头三年、不在寿限前 */
function c9WantInterlude() {
  if (!s9.interludes || s9.interludes.length >= 6) return false;
  if (s9.age < 8) return false;
  if (s9.age > s9.deadline - 6) return false;
  if (s9.lastWasInterlude) return false;
  return Math.random() < 0.32;
}

/* 日常年的叙事：从这一家的处境里长出来 */
function c9DailyText() {
  const L = c9Lex();
  const a = s9.age;
  const alive = c9Alive();
  const kid = alive.find(p => p.id !== 'self' && p.age <= 12);
  const old = alive.find(p => p.id !== 'self' && p.age >= 58);

  const open = [];
  if (a <= 6) {
    open.push(`${L.place}的${c9Season()}很长。你趴在门槛上看外面，${kid ? kid.name : '家里的人'}从你面前走过去，又走回来。`);
    open.push(`家里这一年没什么大事。你学会了自己穿鞋，学会在大人说话时不出声。`);
    open.push(`你记得这一年的味道：灶灰、湿柴、和母亲手上的皂角。`);
  } else if (a <= 13) {
    open.push(`这一年你长高了一截，袖子短了。${kid && kid.id !== 'me' ? kid.name + '总跟着你。' : ''}家里说，该想想以后了。`);
    open.push(`先生说过两年就不教了，剩下的要自己看书。你不太懂"以后"是什么意思。`);
    open.push(`${L.place}来了个走街的货郎，你跟着走了半条街，被叫回来。`);
  } else if (a <= 25) {
    open.push(`这一年你在想一件事：是留在这里，还是走。` + (old ? `${old.name}的背比去年弯了一点。` : ''));
    open.push(`同龄的人有的定了亲，有的去了城里。你两样都还没定。`);
    open.push(`家里今年的收成不好不坏。你开始听得懂大人饭桌上说的话。`);
  } else if (a <= 40) {
    open.push(`这一年过得快。田里的事、家里的事，一桩接一桩。`);
    open.push(`${s9.hasChild ? '孩子长得很快，你有点跟不上他问的问题。' : '屋里安静，安静得有点空。'}`);
    open.push(`你发现自己说话的口气越来越像${old ? old.name : '父亲'}。`);
  } else if (a <= 58) {
    open.push(`这一年身体先知道了。爬坡要歇一次，阴天膝盖疼。`);
    open.push(`${s9.hasChild ? '孩子的事你插不上嘴了，只能听着。' : '身边没什么人，日子过得清。'}`);
    open.push(`你开始算：还剩多少年，还够做什么。`);
  } else {
    open.push(`这一年过得很慢。日头从东墙走到西墙，一天就过去了。`);
    open.push(`认得的人少了。街还是那条街。`);
    open.push(`你坐在门口，看别人家的人来来去去。`);
  }
  const base = open[Math.floor(Math.random() * open.length)];

  const bits = [];
  if (s9.grain < 4) bits.push(`仓里只剩${s9.grain.toFixed(1)}${L.grain}。`);
  if (s9.coin < 200) bits.push(`钱也不多。`);
  if (old && old.age > 62) bits.push(`${old.name}今年咳得厉害。`);
  if (kid && kid.age < 10) bits.push(`${kid.name}又长了一岁。`);
  return base + (bits.length ? ' ' + bits.slice(0, 2).join('') : '');
}

/* ---------- 选与结算 ---------- */
function c9Toggle(idx) {
  const act = s9.card.actions[idx];
  if (!act) return;
  if (s9.card.kind === 'plot') {
    s9.picks = [idx];
    c9Render(true);
    return;
  }
  const i = s9.picks.indexOf(idx);
  if (i >= 0) {
    s9.picks.splice(i, 1);
  } else {
    const used = s9.picks.reduce((s, k) => s + s9.card.actions[k].effort, 0);
    if (used + act.effort > s9.effort) { c9Toast('心力不够了'); return; }
    s9.picks.push(idx);
  }
  c9Render(true);
}

function c9Used() {
  return s9.picks.reduce((s, k) => s + (s9.card.actions[k].effort || 0), 0);
}

function c9Commit() {
  const card = s9.card;
  if (!card) return;
  if (!s9.picks.length) { c9Toast('总得选一样'); return; }

  // 关口卡：只选一个，结果单独处理
  if (card.kind === 'gate') {
    const r = g14Apply(card.gate, s9.picks[0]);
    const year = s9.year, age = s9.age;
    s9.outcome = {
      year, age, title: card.title,
      said: [],
      d: {},
      gate: r,
      notes: r.notes || []
    };
    s9.picks = [];
    s9.card = null;
    // 关口占用这一年
    s9.age += 1; s9.year += 1;
    for (const p of s9.family) if (p.alive) p.age += 1;
    s9.effort = c9Effort();
    if (typeof o11YearTick === 'function') o11YearTick();
    if (typeof w10Drift === 'function') w10Drift();
    if (typeof p12Tick === 'function') { const hh = p12Tick(); if (hh) { p12Apply(hh); if (!s9.pendingPriv) s9.pendingPriv = hh; } }
    s9.screen = 'result';
    s9Save();
    c9Render();
    return;
  }

  const said = [];
  let dBody = 0, dHeart = 0, dHand = 0, dCoin = 0, dGrain = 0;

  for (const k of s9.picks) {
    const act = card.actions[k];
    if (typeof t15Log === 'function') t15Log(act, card);
    if (act.plot) {
      // 剧情年：三个选项各带效果
      const e = act.plot.eff || {};
      if (e.health) dBody += e.health;
      if (e.coins) dCoin += e.coins;
      if (e.stats) {
        if (e.stats['智识']) dHand += e.stats['智识'];
        if (e.stats['体魄']) dBody += e.stats['体魄'] * 3;
        if (e.stats['魅力']) dHeart += e.stats['魅力'] * 2;
        if (e.stats['机缘']) dCoin += e.stats['机缘'] * 60;
      }
      if (e.emotion) for (const kk of Object.keys(e.emotion)) {
        dHeart += (kk === '喜' || kk === '爱') ? e.emotion[kk] : -Math.round(e.emotion[kk] * 0.6);
      }
      said.push(act.plot.outcome || '');
      if (act.plot.eff && act.plot.eff.thread) s9.thread = act.plot.eff.thread;
    } else {
      const g = act.gain || {};
      if (g.body) dBody += g.body;
      if (g.heart) dHeart += g.heart;
      if (g.hand) dHand += g.hand;
      if (g.coin) dCoin += g.coin;
      if (g.grain) dGrain += g.grain;
      if (g.married) s9.married = true;
      if (g.child) s9.hasChild = true;
      if (g.field) s9.field += g.field;
      if (g.kidHand) {
        const kid = c9Alive().find(p => p.id !== 'self' && p.age <= 20);
        if (kid) kid.rel = Math.min(100, kid.rel + 6);
      }
      if (g.relKid) { const kid = c9Alive().find(p => p.id !== 'self' && p.age <= 22); if (kid) kid.rel = Math.min(100, (kid.rel || 50) + g.relKid); }
      if (g.relOld) { const old = c9Alive().filter(p => p.id !== 'self' && p.age >= 50).sort((a, b) => b.age - a.age)[0]; if (old) { old.rel = Math.min(100, old.rel + g.relOld); if (g.oldBody) old.body = (old.body || 60) + g.oldBody; } }
      said.push(c9Line(act, card));
    }
  }

  // 消耗：全家吃饭
  const alive = c9Alive();
  dGrain -= alive.length * 1.15;
  dCoin -= alive.length * 26;

  // 身子到底线时，先伤心，不直接垮
  if (s9.body + dBody < 25 && dBody < 0) {
    const over = 25 - (s9.body + dBody);
    dBody = Math.round(dBody + over * 0.6);
    dHeart -= Math.round(over * 0.8);
  }
  s9.body = Math.max(1, Math.min(100, s9.body + dBody));
  s9.heart = Math.max(0, Math.min(100, s9.heart + dHeart));
  s9.hand = Math.max(0, Math.min(10, s9.hand + dHand));
  s9.coin = Math.max(0, s9.coin + dCoin);
  s9.grain = Math.max(0, s9.grain + dGrain + s9.field * (1.6 + s9.hand * 0.35));
  // 余粮换钱
  if (s9.grain > 7) {
    const sell = Math.floor((s9.grain - 7) * 34);
    s9.grain = 7 + (s9.grain - 7 - Math.floor(s9.grain - 7));
    s9.coin += sell;
  }

  // 断粮
  if (s9.grain <= 0) {
    s9.body = Math.max(1, s9.body - 9);
    s9.heart = Math.max(0, s9.heart - 5);
    s9.grain = 0;
  }

  s9.body = Math.max(1, Math.min(100, s9.body));
  s9.heart = Math.max(0, Math.min(100, s9.heart));
  s9.hand = Math.max(0, Math.min(10, s9.hand));

  // 手会自然长一点（做过活的人手上有东西）
  if (s9.age > 14 && s9.age < 55) s9.hand = Math.min(10, s9.hand + 0.03);

  // 结案
  if (card.scene && !s9.seen.includes(card.scene.id)) s9.seen.push(card.scene.id);
  if (card.kind === 'plot') s9.sceneGap = 0;
  if (card.scene && card.scene.title) {
    s9.seenTitles = s9.seenTitles || [];
    s9.seenTitles.push(card.scene.title);
    if (s9.seenTitles.length > 20) s9.seenTitles.shift();
  }
  if (card.ai) {
    s9.interludes = s9.interludes || [];
    s9.interludes.push(card.title);
  }
  s9.years = s9.years || [];
  s9.years.push(card.title);
  s9.yearlyLog = s9.yearlyLog || [];
  s9.yearlyLog.push({ age: s9.age, text: String(card.text || '').slice(0, 40) });
  if (s9.yearlyLog.length > 12) s9.yearlyLog.shift();
  if (card.mark) { s9.marks = s9.marks || []; s9.marks.push(card.mark); }

  s9.outcome = {
    year: s9.year, age: s9.age,
    said: said.filter(Boolean),
    d: { body: Math.round(dBody), heart: Math.round(dHeart), hand: Math.round(dHand * 10) / 10, coin: Math.round(dCoin), grain: Math.round(dGrain * 10) / 10 },
    title: card.title
  };
  s9.picks = [];
  s9.card = null;
  s9.dailyText = ''; s9.dailyMark = ''; s9.prepared = false;

  // 关系层效果
  if (typeof w10ApplyRel === 'function') {
    for (const k of s9.picks) {
      const act = card.actions[k];
      if (act && act.plot && act.plot.eff) w10ApplyRel(act.plot.eff);
    }
  }

  // 时间推进
  const keep = s9.outcome;
  c9Advance();
  if (s9.screen === 'renew') {
    // 寿限插进来：先看续命，结果留到之后
    s9.resultPending = keep;
  } else {
    s9.outcome = keep;
    s9.screen = 'result';
  }
  s9Save();
  c9Render();
}

/* 日常动作写成一句人事，不是一句数值 */
function c9Line(act, card) {
  const L = c9Lex();
  const kid = c9Alive().find(p => p.id !== 'self' && p.age <= 22);
  const old = c9Alive().filter(p => p.id !== 'self' && p.age >= 50).sort((a, b) => b.age - a.age)[0];
  const map = {
    play: [
      `你在${L.place}玩到天黑。回头的时候，家里人站在门口等着，没骂你。`,
      `你捡了一兜子石子，装在口袋里，晚上睡觉硌得慌，也没舍得扔。`,
      `你学会了一种新的跑法。摔过两次，第三次就没摔。`
    ],
    watch: [
      `你跟在后面看了一整年。他们做什么，你就学什么，学得不像，但记住了顺序。`,
      `你学会了看天色。云往哪边走，第二天会不会下雨。`
    ],
    study: [
      `先生说你记性好。你自己知道，你只是怕回去下田。`,
      `你在纸上写自己的名字，写了很多遍，写到墨把纸洇穿了。`,
      `你把课本藏在枕头底下。夜里摸一摸，觉得日子还有个别的样子。`
    ],
    help: [
      `你在田里待了一整年。手上的口子结了痂又裂开。`,
      `你学会了扶犁。第一天走不直，第二天直了一点。`,
      `你把一垄地从头到尾锄完，直起腰的时候，天已经黑了。`
    ],
    earn: [
      `你在镇上做了一年零工。工钱不多，回来的时候给家里带了一包糖。`,
      `你扛了一年的货。肩膀磨破过，后来长出茧，就不疼了。`,
      `你第一次拿到自己挣的钱。数了三遍，一分没花。`
    ],
    save: [
      `你把钱藏在梁上。每次爬上去看一眼，再放回去。`,
      `你攒了一年。攒着攒着，就不太舍得花了。`
    ],
    learn: [
      `你跟着师傅学了一年。他不怎么说话，让你自己看。`,
      `你的手开始听话了。做出来的东西，第一次像样。`,
      `你学会了一门吃饭的本事。师傅说：这行当饿不死人，也富不了。`
    ],
    rest: [
      `这一年你什么也没干。身子缓过来了，心里也松了一点。`,
      `你歇了一年。醒来的时候日头已经到墙上了。`,
      `你把这一年睡过去了。有人说你懒，你没反驳。`
    ],
    marry: [
      `成了家。酒席摆了六桌，来的人都说了吉利话。`,
      `你们成了亲。她进门那天，母亲把家里最好的那只碗拿出来用了。`
    ],
    child: [
      `孩子生下来了。接生婆说是${Math.random() < 0.5 ? '个男孩' : '个女孩'}。你抱着，手不敢用力。`,
      `家里添了一口人。夜里哭起来，整条巷子都听得见。`
    ],
    land: [
      `你置了一亩地。田契拿在手里，比想的轻。`,
      `你又多了一亩。去看地那天，你在田埂上站了很久。`
    ],
    sun: [
      `你在门口坐了一年。日头从东墙到西墙。有人路过就点点头。`,
      `你每天在同一个时辰搬凳子出去，坐到看不清为止。`,
      `这一年你什么也没做，就是坐着。风从巷子里过来，带着别人家的饭味。`
    ],
    watch_kid: [
      `你看孩子们在巷子里跑。有一个摔了，你没动，他自己爬起来。`,
      `你看了他们一整年。他们跑得比去年的快。`
    ],
    tell: [
      `你把那些旧事讲了一遍。讲到一半，孩子问：后来呢。你说：没有后来了。`,
      `你讲了一遍从前。孩子听得半懂。讲完你自己愣了一会儿。`
    ],
    teach: [
      `你教了${kid ? kid.name : '孩子'}一年。他学得比你当年快。`,
      `你把会的都教了。${kid ? kid.name : '孩子'}问的问题，有些你答不上来。`
    ]
  };
  const arr = map[act.id];
  if (arr) return arr[Math.floor(Math.random() * arr.length)];

  if (act.id.startsWith('talk_kid') && kid) return `你陪${kid.name}说了几次话。他问的东西你答不全，但他愿意问。`;
  if (act.id.startsWith('talk_old') && old) return `你陪${old.name}说了几次话。他讲了些从前的事，有两件你听过。`;
  if (act.id === 'care' && old) return `${old.name}病了一阵。你守在床边，端水，擦身，没睡整夜。`;
  return act.name;
}

function c9Advance() {
  // 家人年龄
  for (const p of s9.family) {
    if (!p.alive) continue;
    p.age += 1;
    if (p.id === 'self') continue;
    if (p.age >= 76 && Math.random() < 0.33) { p.alive = false; p.note = '老死'; }
    if (p.rel !== undefined && p.rel <= 8 && p.age >= 16 && Math.random() < 0.4) { p.away = true; p.note = '走了'; }
    if (p.age > 55) { p.rel = Math.max(0, p.rel - 1); }
  }
  s9.age = c9Self().age;
  s9.year += 1;
  if (typeof w10Drift === 'function') w10Drift();
  if (typeof o11YearTick === 'function') o11YearTick();
  if (typeof p12Tick === 'function') {
    const hits = p12Tick();
    if (hits) { p12Apply(hits); s9.pendingPriv = hits; }
  }

  // 老年身体下滑
  if (s9.age > 56) s9.body = Math.max(20, s9.body - Math.floor((s9.age - 56) / 14) - 1);
  if (s9.age > 70) s9.body = Math.max(12, s9.body - 2);
  if (s9.age > 72) s9.hand = Math.max(1, s9.hand - 0.5);

  s9.effort = c9Effort();

  // 死
  if (s9.body <= 1 || s9.family.find(p => p.id === 'self' && !p.alive)) {
    s9.dead = true; s9.why = '身子垮了';
  } else if (s9.age >= s9.deadline) {
    if ((s9.renewals || []).length >= 4) {
      s9.dead = true; s9.why = '活到头了'; s9.screen = 'end'; return;
    }
    s9.screen = 'renew';
    s9.dead = false;
    return;
  }

  // 快进：没有剧情也没有新解锁的年份直接跳
  let skip = 0;
  while (skip < 3 && !s9.dead) {
    const nextSc = c9NextScene();
    if (nextSc) break;
    if (s9.age >= s9.deadline) break;
    if (s9.age === 7 || s9.age === 13 || s9.age === 18 || s9.age === 30 || s9.age === 45 || s9.age === 60) break;
    // 无事的一年：小幅自动推进
    s9.body = Math.min(100, s9.body + 6);
    s9.heart = Math.min(100, s9.heart + 4);
    s9.grain = Math.max(0, s9.grain + s9.field * 2.6 - c9Alive().length * 1.15);
    s9.coin = Math.max(0, s9.coin - c9Alive().length * 18);
    for (const p of s9.family) if (p.alive) p.age += 1;
    s9.age = c9Self().age;
    s9.year += 1;
    s9.effort = c9Effort();
    if (typeof o11YearTick === 'function') o11YearTick();
  if (typeof p12Tick === 'function') {
    const hits = p12Tick();
    if (hits) { p12Apply(hits); s9.pendingPriv = hits; }
  }
    if (typeof w10Drift === 'function') w10Drift();
    if (s9.age >= s9.deadline) break;
    skip++;
  }
  if (s9.age >= s9.deadline && !s9.dead) {
    if ((s9.renewals || []).length >= 4) { s9.dead = true; s9.why = '活到头了'; s9.screen = 'end'; }
    else s9.screen = 'renew';
  }
}

/* ---------- 续命 ---------- */
function c9Reasons() {
  const alive = c9Alive().filter(p => p.id !== 'self');
  const out = [];
  if ((s9.renewals || []).length >= 4) return [];
  const used = new Set(s9.renewals.map(r => r.text));
  const kid = alive.filter(p => p.age < 20).sort((a, b) => a.age - b.age)[0];
  if (kid) out.push({ id: 'kid', text: `想看见${kid.name}长大`, sub: `${kid.name}今年 ${kid.age} 岁。`, cost: '撑到成人那天' });
  const old = alive.sort((a, b) => b.age - a.age)[0];
  if (old && !used.has(`想再陪${old.name}几年`)) out.push({ id: 'old', text: `想再陪${old.name}几年`, sub: `${old.name}今年 ${old.age} 岁。`, cost: '撑到他先走' });
  if (s9.field < 5) out.push({ id: 'land', text: '想把那几亩地置齐', sub: `现在 ${s9.field} 亩。`, cost: '拿最后一点力气去换' });
  else out.push({ id: 'place', text: '想再看一眼老屋', sub: '西墙补过两次。', cost: '走一趟，回来就躺下' });
  return out.slice(0, 3);
}

function c9Renew(i) {
  const r = c9Reasons()[i];
  if (!r) return;
  s9.interludes = [];
  s9.renewals.push({ age: s9.age, text: r.text });
  s9.deadline = s9.age + 7 + Math.floor(Math.random() * 5);
  s9.body = Math.max(14, Math.round(s9.body * 0.55));
  s9.heart = Math.max(25, s9.heart);
  s9.screen = 'card';
  s9Save();
}

function c9GiveUp() {
  s9.dead = true;
  s9.why = '你自己说：够了';
  s9.screen = 'end';
  s9Save();
}

/* ---------- 结局 ---------- */
function c9Ledger() {
  const alive = c9Alive().filter(p => p.id !== 'self');
  const gone = s9.family.filter(p => p.id !== 'self' && (!p.alive || p.away));
  return {
    age: s9.age, years: s9.year - 1,
    field: s9.field, hand: Math.round(s9.hand * 10) / 10,
    coin: Math.round(s9.coin), grain: s9.grain.toFixed(1),
    alive, gone, renew: s9.renewals
  };
}

const S9KEY = 'one_card_v9';
function s9Save() { try { localStorage.setItem(S9KEY, JSON.stringify(s9)); } catch (e) {} }
function s9Load() {
  try {
    const r = localStorage.getItem(S9KEY);
    if (r) { const d = JSON.parse(r); if (d && d.family && d.family.length) { Object.assign(s9, d); return true; } }
  } catch (e) {}
  return false;
}
