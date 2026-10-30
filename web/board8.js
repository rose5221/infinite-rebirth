'use strict';

/* v8 · 家计：岗位与人
   一年一拍。五个岗位，四到六口人。永远有一个岗位空着，空着就会荒。 */

if (typeof window !== 'undefined' && !window.state) window.state = { worldIndex: 0 };

const BOARD8 = {
  '穗骨原': {
    food: '粮', util: '水', rent: 300, foodPer: 1.2,
    posts: [
      { id: 'field', name: '田', out: 'food', ti: 8, xin: 3, minAge: 8 },
      { id: 'canal', name: '渠', out: 'util', ti: 6, xin: 2, minAge: 10 },
      { id: 'house', name: '屋', out: 'house', ti: 3, xin: -3, minAge: 5 },
      { id: 'social', name: '人情', out: 'social', ti: 4, xin: 4, minAge: 10 },
      { id: 'study', name: '学', out: 'craft', ti: 2, xin: -4, minAge: 7, maxAge: 14 }
    ]
  },
  '无昼京': {
    food: '灯油', util: '光时', rent: 340, foodPer: 1.15,
    posts: [
      { id: 'field', name: '灯铺', out: 'food', ti: 8, xin: 3, minAge: 8 },
      { id: 'canal', name: '配光', out: 'util', ti: 6, xin: 2, minAge: 10 },
      { id: 'house', name: '屋', out: 'house', ti: 6, xin: -2, minAge: 5 },
      { id: 'social', name: '影市', out: 'social', ti: 4, xin: 5, minAge: 12 },
      { id: 'study', name: '抄漏', out: 'craft', ti: 2, xin: -4, minAge: 7, maxAge: 14 }
    ]
  },
  '借寿渡': {
    food: '米', util: '渡', rent: 260, foodPer: 1.15,
    posts: [
      { id: 'field', name: '义庄', out: 'food', ti: 8, xin: 4, minAge: 9 },
      { id: 'canal', name: '渡船', out: 'util', ti: 7, xin: 2, minAge: 12 },
      { id: 'house', name: '屋', out: 'house', ti: 6, xin: -2, minAge: 5 },
      { id: 'social', name: '号子', out: 'social', ti: 4, xin: 4, minAge: 10 },
      { id: 'study', name: '秤', out: 'craft', ti: 2, xin: -5, minAge: 8, maxAge: 14 }
    ]
  },
  '钟葬群岛': {
    food: '鱼', util: '潮', rent: 280, foodPer: 1.25,
    posts: [
      { id: 'field', name: '渔', out: 'food', ti: 9, xin: 3, minAge: 10 },
      { id: 'canal', name: '捞钟', out: 'util', ti: 8, xin: 3, minAge: 12 },
      { id: 'house', name: '屋', out: 'house', ti: 6, xin: -2, minAge: 5 },
      { id: 'social', name: '钟谱', out: 'social', ti: 4, xin: 5, minAge: 9 },
      { id: 'study', name: '守夜', out: 'craft', ti: 2, xin: -3, minAge: 7, maxAge: 14 }
    ]
  },
  '髓云都市': {
    food: '食', util: '忆', rent: 380, foodPer: 1.1,
    posts: [
      { id: 'field', name: '铺', out: 'food', ti: 8, xin: 3, minAge: 8 },
      { id: 'canal', name: '井', out: 'util', ti: 6, xin: 2, minAge: 11 },
      { id: 'house', name: '屋', out: 'house', ti: 6, xin: -2, minAge: 5 },
      { id: 'social', name: '温室', out: 'social', ti: 4, xin: 5, minAge: 10 },
      { id: 'study', name: '封存', out: 'craft', ti: 2, xin: -6, minAge: 7, maxAge: 14 }
    ]
  },
  '星耒野': {
    food: '粮', util: '星', rent: 300, foodPer: 1.15,
    posts: [
      { id: 'field', name: '田', out: 'food', ti: 15, xin: 5, minAge: 8 },
      { id: 'canal', name: '灌', out: 'util', ti: 7, xin: 2, minAge: 10 },
      { id: 'house', name: '库', out: 'house', ti: 3, xin: -3, minAge: 5 },
      { id: 'social', name: '城', out: 'social', ti: 5, xin: 5, minAge: 12 },
      { id: 'study', name: '观星', out: 'craft', ti: 2, xin: -5, minAge: 7, maxAge: 14 }
    ]
  }
};

/* 组合：两个人放在特定岗位对，会撞出来。不告诉玩家。 */
const COMBOS8 = [
  { a: 'house', b: 'social', name: '搭伙', eff: c => { c.everyoneXin += 3; } },
  { a: 'field', b: 'study', name: '传艺', eff: c => { c.craftBonus += 1; c.elderXin -= 2; } },
  { a: 'canal', b: 'social', name: '水路人情', eff: c => { c.socialBonus += 1; } },
  { a: 'house', b: 'study', name: '隔代', eff: c => { c.everyoneXin += 4; c.elderTi -= 2; } }
];

let state8 = {
  screen: 'wake', book: '', name: '',
  year: 1, age: 0,
  people: [], posts: [], assign: {},
  food: 8, util: 3, social: 0, rep: 4, coins: 420,
  cfg: null, seen: [], pendingEvent: null, lastResult: null,
  log: [], threads: [], ledger: {},
  renewals: [], renewCap: 100, deadline: 68,
  dead: false, deathWhy: '', reasonOpen: false,
  turnStage: 'plan', lastNotes: [], combosFound: [], eventPost: ''
};

function s8Make(bookName, name) {
  const b = STORY6[bookName];
  const cfg = BOARD8[bookName];
  const cast = b.cast || [];
  const find = (id, tag) => cast.find(c => c.id === id) || cast.find(c => c.tag === tag);

  const people = [];
  const push = (id, nm, tag, age, ti, xin, shou) => people.push({
    id, name: nm, tag, age, ti, xin, shou, alive: true, away: false, note: ''
  });

  const f = find('father', '父'), m = find('mother', '母');
  const s = find('sibling', '姐') || find('sibling', '妹') || cast.find(c => c.id === 'friend');
  const g = find('grandma', '祖母');

  if (f) push('father', f.name, '父', 27, 86, 64, 3);
  if (m) push('mother', m.name, '母', 25, 78, 68, 2);
  if (g) push('grandma', g.name, '祖母', 57, 48, 58, 1);
  if (s) push('sibling', s.name, s.tag || '姐', 4, 58, 72, 0);
  push('self', name || '孩子', '我', 0, 58, 72, 0);

  Object.assign(state8, {
    book: bookName, name: name || '孩子', cfg,
    people, posts: cfg.posts.map(p => Object.assign({}, p, { lv: 1, fallow: 0 })),
    assign: {}, food: 8, util: 3, social: 0, rep: 4, coins: 420,
    year: 1, age: 0, seen: [], pendingEvent: null, lastResult: null,
    log: [], threads: [], ledger: { field: 0, work: 0, care: 0, social: 0, study: 0, rest: 0 },
    renewals: [], renewCap: 100, deadline: 68,
    dead: false, deathWhy: '', reasonOpen: false,
    turnStage: 'plan', lastNotes: [], combosFound: [], eventPost: ''
  });
  s8Save();
}

function s8Alive() { return state8.people.filter(p => p.alive && !p.away); }
function s8Self() { return state8.people.find(p => p.id === 'self'); }
function s8Post(id) { return state8.posts.find(p => p.id === id); }
function s8Season() { return ['春', '夏', '秋', '冬'][(state8.year - 1) % 4]; }
function s8Housing() { const h = s8Post('house'); return 2 + (h ? h.lv * 2 : 0); }
function s8PostOf(pid) { return Object.keys(state8.assign).find(k => state8.assign[k] === pid); }

function s8ResolveYear() {
  const cfg = state8.cfg;
  const alive = s8Alive();
  const usedPosts = {};
  let food = 0, util = 0, social = 0, craft = 0;
  const notes = [];
  const ctx = { everyoneXin: 0, craftBonus: 0, socialBonus: 0, elderXin: 0, elderTi: 0 };

  for (const post of state8.posts) {
    const pid = s8PostOf(post.id);
    if (!pid) {
      post.fallow += 1;
      if (post.fallow >= 2 && post.lv > 1) {
        post.lv -= 1; post.fallow = 0;
        notes.push({ k: post.name + '荒了', v: -1, c: 'bad' });
      } else {
        notes.push({ k: post.name + '空着', v: 0, c: 'bad' });
      }
      continue;
    }
    post.fallow = 0;
    post.kept = (post.kept || 0) + 1;
    if (post.kept >= 3 && post.lv < 3) {
      post.lv += 1; post.kept = 0;
      notes.push({ k: post.name + '升到 ' + post.lv + ' 级', v: 0, c: 'good' });
    }
    usedPosts[post.id] = pid;
    const p = alive.find(x => x.id === pid);
    if (!p) continue;

    const mood = Math.max(0.35, Math.min(1.25, p.xin / 62));
    const body = p.ti > 45 ? 1 : p.ti > 25 ? 0.7 : 0.4;
    const hand = 0.7 + (p.shou || 0) * 0.42;
    const power = post.lv * mood * body * hand;

    if (post.out === 'food') food += 5.2 * power;
    else if (post.out === 'util') util += 3.4 * power;
    else if (post.out === 'social') social += 2.2 * power;

    p.ti = Math.max(0, p.ti - post.ti);
    p.xin = Math.max(0, Math.min(100, p.xin - post.xin));

    if (post.out === 'craft' && p.age <= 14) p.shou = Math.min(10, p.shou + 1);
    if (post.out === 'craft') state8.ledger.study++;
    else if (post.out === 'social') state8.ledger.social++;
    else if (post.out === 'house') state8.ledger.care++;
    else if (post.out === 'food') state8.ledger.field++;
    else state8.ledger.work++;
  }

  // 组合
  for (const cb of COMBOS8) {
    if (usedPosts[cb.a] && usedPosts[cb.b]) {
      const pa = alive.find(x => x.id === usedPosts[cb.a]);
      const pb = alive.find(x => x.id === usedPosts[cb.b]);
      if (pa && pb && (pa.age + pb.age) >= 34) {
        cb.eff(ctx);
        if (!state8.combosFound.includes(cb.name)) {
          state8.combosFound.push(cb.name);
          notes.push({ k: '搭上了：' + cb.name, v: 0, c: 'good' });
        }
      }
    }
  }
  if (ctx.craftBonus) craft += ctx.craftBonus;
  if (ctx.socialBonus) social += ctx.socialBonus;

  if (util < 1) { food *= 0.55; notes.push({ k: cfg.util + '断了', v: 0, c: 'bad' }); }
  else if (util < 2.2) { food *= 0.8; notes.push({ k: cfg.util + '紧张', v: 0, c: 'bad' }); }
  state8.util = Math.max(0, Math.min(8, util * 0.78));

  if (alive.length > s8Housing()) {
    for (const p of alive) p.xin = Math.max(0, p.xin - 7);
    notes.push({ k: '住不下', v: 0, c: 'bad' });
  }

  const eat = alive.length * cfg.foodPer;
  state8.food = state8.food + food - eat;
  if (state8.food < 0) {
    const short = -state8.food;
    state8.food = 0;
    const bite = Math.min(12, 4 + Math.round(short * 2));
    for (const p of alive) { p.ti = Math.max(0, p.ti - bite); p.xin = Math.max(0, p.xin - 5); }
    notes.push({ k: '断粮', v: 0, c: 'bad' });
  }

  state8.social = Math.min(12, state8.social + social);
  state8.rep = Math.min(30, state8.rep + Math.round(social * 0.7));
  state8.coins = state8.coins + Math.round(social * 62);
  // 钱会花掉：吃穿、修屋、人情往来
  const upkeep = Math.round(alive.length * 120 + state8.posts.reduce((a, p) => a + p.lv * 230, 0));
  if (state8.coins > upkeep) state8.coins -= upkeep; else state8.coins = Math.max(0, Math.round(state8.coins * 0.35));
  if (state8.coins > 2600) state8.coins = 2600;

  if (state8.year % 4 === 0) {
    const rent = cfg.rent;
    if (state8.coins >= rent) {
      state8.coins -= rent;
      notes.push({ k: '交租', v: -rent, c: 'bad' });
    } else {
      state8.coins = 0;
      state8.threads.push({ text: '欠着这一年的租', age: state8.age, open: true });
      state8.rep = Math.max(0, state8.rep - 3);
      notes.push({ k: '欠租', v: 0, c: 'bad' });
    }
  }

  // 过日子本身会回一点心气：吃饭、睡觉、孩子在院子里跑
  for (const p of alive) {
    let regen = 9 + ctx.everyoneXin;
    if (p.age < 14) regen += 7;
    if (p.ti < 45) regen += 4;
    p.xin = Math.max(0, Math.min(100, p.xin + regen));
    if (p.age >= 55) { p.xin = Math.max(0, Math.min(100, p.xin + ctx.elderXin)); p.ti = Math.max(1, p.ti + ctx.elderTi); }
    // 身子也回一点
    p.ti = Math.min(100, p.ti + (p.age > 55 ? 6 : 14));
  }
  // 余粮换钱
  if (state8.food > 6) {
    const sell = Math.floor((state8.food - 6) * 32);
    state8.food -= Math.floor((state8.food - 6));
    state8.coins = Math.min(4000, state8.coins + sell);
    if (sell) notes.push({ k: '卖余粮', v: sell, c: 'good' });
  }

  if (food > 0) notes.push({ k: cfg.food, v: Math.round(food * 10) / 10, c: 'good' });
  if (social > 0) notes.push({ k: '人情', v: Math.round(social * 10) / 10, c: 'good' });

  for (const p of alive) {
    if (p.id === 'self') continue;
    if (p.xin <= 10 && p.age >= 15 && Math.random() < 0.45) {
      p.away = true; p.note = '走了';
      notes.push({ k: p.name + '走了', v: 0, c: 'bad' });
    }
    if (p.ti <= 0) { p.alive = false; p.note = '没了'; notes.push({ k: p.name + '没了', v: 0, c: 'bad' }); }
  }

  for (const p of state8.people) {
    if (!p.alive) continue;
    p.age += 1;
    if (p.age > 56) p.ti = Math.max(32, p.ti - Math.floor((p.age - 56) / 14));
    if (p.age >= 82 && Math.random() < 0.3) { p.alive = false; p.note = '老死'; notes.push({ k: p.name + '走了', v: 0, c: 'bad' }); }
  }
  state8.age = s8Self().age;
  state8.year += 1;
  state8.log.push({ y: state8.year - 1, notes });
  if (state8.log.length > 60) state8.log.shift();

  if (!s8Self().alive) { state8.dead = true; state8.deathWhy = '身子垮了'; }
  else if (state8.age >= state8.deadline) { state8.reasonOpen = true; state8.turnStage = 'renew'; }
  return notes;
}

function s8NextEvent() {
  const b = STORY6[state8.book];
  if (!b) return null;
  for (const sc of b.main) {
    if (state8.seen.includes(sc.id)) continue;
    if (state8.age < sc.age[0] - 1 || state8.age > sc.age[1] + 3) continue;
    return sc;
  }
  return null;
}

function s8EventPost(sc) {
  const a = sc.arc || '';
  if (a === 'work' || a === 'business') return 'field';
  if (a === 'family' || a === 'parent') return 'house';
  if (a === 'relation' || a === 'marriage') return 'social';
  if (a === 'child' || a === 'teen') return 'study';
  return 'canal';
}

function s8ApplyChoice(i) {
  const sc = state8.pendingEvent;
  if (!sc) return;
  const ch = sc.choices[i];
  const e = ch.eff || {};
  const me = s8Self();

  if (e.health) me.ti = Math.max(1, Math.min(100, me.ti + e.health));
  if (e.stats) for (const k of Object.keys(e.stats)) {
    if (k === '智识') me.shou = Math.min(10, me.shou + e.stats[k]);
    else if (k === '体魄') me.ti = Math.min(100, me.ti + e.stats[k] * 4);
    else if (k === '魅力') state8.rep = Math.min(30, state8.rep + e.stats[k] * 2);
    else if (k === '机缘') state8.social = Math.min(12, state8.social + e.stats[k]);
  }
  if (e.emotion) {
    let d = 0;
    for (const k of Object.keys(e.emotion)) d += (k === '喜' || k === '爱') ? 2 : -1;
    me.xin = Math.max(0, Math.min(100, me.xin + d));
  }
  if (e.coins) state8.coins = Math.max(0, state8.coins + e.coins);
  if (e.thread) state8.threads.push({ text: e.thread, age: state8.age, open: true });

  const pid = s8EventPost(sc);
  const post = s8Post(pid);
  if (post) post.fallow += 1;
  state8.eventPost = post ? post.name : '';

  if (!state8.seen.includes(sc.id)) state8.seen.push(sc.id);
  state8.lastResult = {
    title: sc.title, choice: ch.title, outcome: ch.outcome,
    post: state8.eventPost, age: state8.age, memory: sc.memory || sc.title
  };
  state8.pendingEvent = null;
  state8.turnStage = 'result';
  s8Save();
}

function s8Reasons() {
  const alive = s8Alive().filter(p => p.id !== 'self');
  const out = [];
  if ((state8.renewals || []).length >= 4) return [];
  const kid = alive.filter(p => p.age < 20).sort((a, b) => a.age - b.age)[0];
  if (kid) out.push({ id: 'kid', text: `想看见${kid.name}长大`, sub: `${kid.name}今年 ${kid.age} 岁。`, cost: '撑到成人那天' });
  const used = new Set((state8.renewals || []).map(r => r.text));
  const th = (state8.threads || []).filter(t => t.open).find(t => !used.has(`想把这件了了：${t.text}`));
  if (th) out.push({ id: 'thread', text: `想把这件了了：${th.text}`, sub: `${th.age} 岁那年留下的。`, cost: '拿最后一点力气去填' });
  else out.push({ id: 'land', text: '想把那块地赎回来', sub: '田契还在梁上。', cost: '把最后一点钱填进去' });
  if ((state8.renewals || []).length < 3) out.push({ id: 'place', text: '想再看一眼老屋', sub: '西墙补过两次。', cost: '走一趟，回来就躺下' });
  return out.slice(0, 3);
}

function s8TakeReason(i) {
  const r = s8Reasons()[i];
  if (!r) return;
  const me = s8Self();
  state8.renewals.push({ age: state8.age, text: r.text });
  state8.deadline = state8.age + 7 + Math.floor(Math.random() * 5);
  state8.renewCap -= 13;
  me.ti = Math.max(12, Math.round(me.ti * 0.5));
  state8.reasonOpen = false;
  state8.turnStage = 'plan';
  state8.assign = {};
  s8Save();
}

function s8GiveUp() {
  state8.dead = true;
  state8.deathWhy = '你自己说：够了';
  state8.reasonOpen = false;
  state8.turnStage = 'end';
  s8Save();
}

function s8StrikeSelf() {
  const me = s8Self();
  me.away = true;
  me.note = '自己搬去柴房了';
  state8.threads.push({ text: '你自己从名册上划掉了', age: state8.age, open: true });
  state8.turnStage = 'plan';
  state8.assign = {};
  s8Save();
}

function s8LedgerData() {
  const L = state8.ledger;
  return {
    field: Math.round(L.field / 2), work: Math.round(L.work / 2),
    care: Math.round(L.care / 2), social: Math.round(L.social / 2),
    study: Math.round(L.study / 2), years: state8.year - 1
  };
}

const S8KEY = 'family_board_v8';
function s8Save() { try { localStorage.setItem(S8KEY, JSON.stringify(state8)); } catch (e) {} }
function s8Load() {
  try {
    const r = localStorage.getItem(S8KEY);
    if (r) { const d = JSON.parse(r); if (d && d.people && d.people.length) { Object.assign(state8, d); return true; } }
  } catch (e) {}
  return false;
}
