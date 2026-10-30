'use strict';

/* v11 · L8 编排层
   一个种子，决定这一局遇到哪些戏。
   同一部作品，两局能走出不同的中年。 */

const GATE_AGES = [0, 4, 7, 13, 18, 25, 30, 40, 50, 60, 68];

/* ---------- 种子随机 ---------- */
function o11Rng(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const O11 = {
  seed: 0, rnd: null, vars: null,
  anchors: [], pool: [], lastSceneAge: -99, gap: 0
};

/* ---------- 开局三变量 ---------- */
function o11RollVars(rnd) {
  const mouths = [4, 5, 6][Math.floor(rnd() * 3)];
  const order = ['eldest', 'middle', 'youngest'][Math.floor(rnd() * 3)];
  const temper = ['strict', 'soft', 'sick', 'drink'][Math.floor(rnd() * 4)];
  return { mouths, order, temper };
}

function o11VarText() {
  const v = O11.vars;
  if (!v) return '';
  const orderTxt = { eldest: '你是老大', middle: '你夹在中间', youngest: '你是老小' }[v.order];
  const tempTxt = { strict: '父亲严厉', soft: '父亲心软', sick: '父亲身子不好', drink: '父亲好喝两口' }[v.temper];
  return `${v.mouths} 口人 · ${orderTxt} · ${tempTxt}`;
}

/* ---------- 初始化：分类 + 掷变量 ---------- */
function o11Preview() {
  if (O11.vars) return O11.vars;
  O11.seed = Math.floor(Math.random() * 900000000) + 100000000;
  O11.rnd = o11Rng(O11.seed);
  O11.vars = o11RollVars(O11.rnd);
  return O11.vars;
}

function o11Init(book) {
  if (!O11.vars) o11Preview();
  O11.lastSceneAge = -99;
  O11.gap = 0;
  O11.poolLeft = undefined;

  const b = STORY6[book];
  // 主线 + 支线一起进池：支线是这一局可遇不可求的部分
  const all = (b.main || []).concat((b.side || []).map(x => Object.assign({}, x, { side: true })));

  // 必经：每个关口附近只挑一段（离关口最近的那段），且总量不超过四成
  const sorted = all.slice().sort((a, b) => a.age[0] - b.age[0]);
  const anchors = new Set();
  for (const g of GATE_AGES) {
    const near = sorted.filter(sc => Math.abs(sc.age[0] - g) <= 2 && !anchors.has(sc.id));
    if (!near.length) continue;
    // 同关口里只留一段（按顺序第一段），其余进池
    anchors.add(near[0].id);
  }
  // 头尾必须 anchor：出生段和最后一段
  if (sorted.length) {
    anchors.add(sorted[0].id);
    anchors.add(sorted[sorted.length - 1].id);
  }
  const mainLen = (b.main || []).length;
  // 收尾必到：最后四段主线无论如何都要出，否则一生收不拢
  const mains = (b.main || []).slice().sort((a, b) => a.age[0] - b.age[0]);
  for (const sc of mains.slice(-4)) anchors.add(sc.id);
  // 晚年（60 岁以上）的主线段也必到
  for (const sc of mains) if (sc.age[0] >= 58) anchors.add(sc.id);

  O11.anchors = [...anchors];
  O11.pool = all.filter(sc => !O11.anchors.includes(sc.id)).map(sc => sc.id);
  O11.byId = {};
  for (const sc of all) O11.byId[sc.id] = sc;
}

/* ---------- 条件：这一段现在能不能出 ---------- */
function o11Alive(id) {
  const p = s9.family.find(x => x.id === id);
  return !!(p && p.alive && !p.away);
}
function o11Req(sc) {
  const t = (sc.title || '') + (sc.opening || '').slice(0, 40);
  // 人物必须在
  if (sc.npc === 'father' && !o11Alive('father')) return false;
  if (sc.npc === 'mother' && !o11Alive('mother')) return false;
  if (sc.npc === 'sibling' && !o11Alive('sibling')) return false;
  if (sc.npc === 'grandma' && !o11Alive('grandma')) return false;
  if (sc.npc === 'friend' && !o11Alive('friend') && s9.age > 18) return false;
  // 婚事类：没成家才有意思
  if (/提亲|说亲|定亲|成亲|婚事/.test(t) && s9.married) return false;
  // 孩子类
  if (/孩子长大|抚养|啼哭|教孩子/.test(t) && !s9.hasChild && s9.age > 30) return false;
  // 父亲已故，不再有父亲的戏
  if (!o11Alive('father') && /父亲/.test(sc.title || '')) return false;
  if (!o11Alive('mother') && /母亲/.test(sc.title || '')) return false;
  return true;
}

/* ---------- 这一年出哪一段 ---------- */
function o11NextScene() {
  const b = STORY6[s9.book];
  if (!b) return null;
  const age = s9.age;

  // 1. 关口戏优先：年龄到了，必经的必须先出
  for (const id of O11.anchors) {
    if (s9.seen.includes(id)) continue;
    const sc = O11.byId[id];
    if (!sc) continue;
    if (age < sc.age[0] || age > sc.age[1] + 1) continue;
    if (!o11Req(sc)) continue;
    return sc;
  }

  // 2. 支线池：年龄合适 + 条件过 + 不重复
  const cands = [];
  for (const id of O11.pool) {
    if (s9.seen.includes(id)) continue;
    const sc = O11.byId[id];
    if (!sc) continue;
    if (age < sc.age[0] || age > sc.age[1] + 2) continue;
    if (!o11Req(sc)) continue;
    cands.push(sc);
  }
  if (!cands.length) return null;

  // 3. 池子有预算：一生只出 5-7 段支线戏，剩下的这辈子遇不到
  if (O11.poolLeft === undefined) O11.poolLeft = 7 + Math.floor(O11.rnd() * 4);
  if (O11.poolLeft <= 0) return null;

  const must = (s9.sceneGap || 0) >= 3;
  if (!must && O11.rnd() > 0.55) return null;

  O11.poolLeft--;
  s9.poolLeft = O11.poolLeft;
  return cands[Math.floor(O11.rnd() * cands.length)];
}

/* ---------- 变量带来的效果 ---------- */
function o11ApplyVars() {
  const v = O11.vars;
  if (!v) return;
  // 排行：老大起点更穷但更能干；老小起点好一点
  if (v.order === 'eldest') { s9.coin = Math.max(200, s9.coin - 120); s9.hand += 0.2; }
  if (v.order === 'youngest') { s9.coin += 80; s9.body -= 4; }
  if (v.order === 'middle') { s9.heart -= 5; }
  // 父亲性格
  if (v.temper === 'strict') { s9.heart -= 6; s9.relFatherBase = -8; }
  if (v.temper === 'soft') { s9.heart += 5; s9.relFatherBase = 8; }
  if (v.temper === 'sick') { s9.coin -= 100; s9.famSick = true; }
  if (v.temper === 'drink') { s9.coin -= 60; s9.famDrink = true; }
  // 口数：多一口，多一张嘴（吃饭在结算里按人头算，这里给一点起始压力）
  if (v.mouths === 6) s9.grain = Math.max(3, s9.grain - 2);
  if (v.mouths === 4) s9.grain += 2;
}

/* 每年：父亲性格带来的持续影响 */
function o11YearTick() {
  const v = O11.vars;
  if (!v) return;
  if (v.temper === 'sick') {
    const f = s9.family.find(p => p.id === 'father');
    if (f && f.alive) {
      if ((s9.year % 4) === 0) f.body = (f.body || 70) - 3;
      if (f.body <= 0) { f.alive = false; f.note = '病没熬过去'; }
    }
  }
  if (v.temper === 'drink' && Math.random() < 0.22) {
    s9.coin = Math.max(0, s9.coin - 40);
    s9.heart = Math.max(0, s9.heart - 4);
  }
  s9.sceneGap = (s9.sceneGap || 0) + 1;
}

/* 给 UI 的一行：还会遇到多少没见过的段落 */
function o11Remain() {
  const total = (O11.anchors || []).length + (O11.pool || []).length;
  const seen = (s9.seen || []).filter(id => O11.byId && O11.byId[id]).length;
  return { seen, total };
}
