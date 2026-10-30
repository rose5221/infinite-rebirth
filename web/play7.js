'use strict';

/* v7 引擎：六部作品，逐段推进。
   每一段都是写好的正文与三个选项；选项改变四维、七情、身子、名声，
   以及你和某个人之间的那根线。没有账本，没有本钱，没有利润。 */

const V7 = { version: '7.0' };

/* v7 自己的存档状态（不再依赖 v6 的 state） */
let state = {
  screen7: 'wake',
  worldIndex: 0,
  bookName: '',
  name: '',
  sex: '女',
  age0: 0,
  days: 0,
  health: 100,
  reputation: 0,
  stats: { 智识: 5, 体魄: 5, 魅力: 5, 机缘: 5 },
  emotions: { 喜: 30, 怒: 20, 哀: 20, 惧: 20, 爱: 30, 恶: 15, 欲: 30 },
  bonds: {},
  memories: [],
  seen: [],
  threads: [],
  flags: [],
  journal: [],
  mainIdx: 0,
  lastWasSide: false,
  scene7: null,
  result7: null,
  dead: false,
  readBooks: [],
  apiKey: '',
  ai: true,
  lives: []
};

const V7_STAGES = [
  { key: 'infant', from: 0, to: 3, label: '婴幼' },
  { key: 'child', from: 4, to: 6, label: '幼年' },
  { key: 'kid', from: 7, to: 12, label: '童年' },
  { key: 'teen', from: 13, to: 18, label: '少年' },
  { key: 'adult', from: 19, to: 30, label: '青年' },
  { key: 'mid', from: 31, to: 50, label: '中年' },
  { key: 'elder', from: 51, to: 70, label: '晚年' },
  { key: 'dusk', from: 71, to: 200, label: '余晖' }
];

function v7Age() { return state.age0 + Math.floor(state.days / 360); }
function v7Stage() { const a = v7Age(); return V7_STAGES.find(s => a >= s.from && a <= s.to) || V7_STAGES[V7_STAGES.length - 1]; }
function v7World() { return WORLDS[state.worldIndex] || WORLDS[0]; }
function v7Book() { return STORY6[v7World().name] || STORY6[STORY_ORDER[0]]; }
function v7Name() { return state.name || '无名'; }

function v7Init() {
  if (!state.emotions) state.emotions = { 喜: 30, 怒: 20, 哀: 20, 惧: 20, 爱: 30, 恶: 15, 欲: 30 };
  if (!state.stats) state.stats = { 智识: 5, 体魄: 5, 魅力: 5, 机缘: 5 };
  if (!state.bonds) state.bonds = {};
  if (!state.memories) state.memories = [];
  if (!state.seen) state.seen = [];
  if (!state.threads) state.threads = [];
  if (!state.flags) state.flags = [];
  if (!state.journal) state.journal = [];
  if (typeof state.mainIdx !== 'number') state.mainIdx = 0;
  if (typeof state.age0 !== 'number') state.age0 = 0;
  if (typeof state.days !== 'number') state.days = 0;
  if (typeof state.health !== 'number') state.health = 100;
  if (typeof state.reputation !== 'number') state.reputation = 0;
}

/* ---------- 选段：主线推进 + 支线按年龄插进来 ---------- */
function v7NextScene() {
  v7Init();
  const book = v7Book();
  const main = book.main || [];
  const side = book.side || [];
  const age = v7Age();

  // 支线：年龄合适、没看过，且距上次支线至少一段
  const sideCand = side.filter(s => !state.seen.includes(s.id) && age >= s.age[0] - 1 && age <= s.age[1] + 1);
  if (sideCand.length && state.lastWasSide !== true && Math.random() < 0.55) {
    const s = sideCand[Math.floor(Math.random() * sideCand.length)];
    state.lastWasSide = true;
    return s;
  }
  state.lastWasSide = false;

  // 主线：找到第一条 age[1] >= 当前年龄 的未看场景
  let idx = state.mainIdx || 0;
  while (idx < main.length && main[idx].age[1] < age) idx++;
  if (idx >= main.length) return null;   // 主线走完，这一生就到底了；没赶上的插曲就是没赶上
  state.mainIdx = idx + 1;   // 这一场已经交出去，下一段从后一场开始
  return main[idx];
}

function v7AdvanceToScene(sc) {
  // 把时间推到这一段的年龄
  const target = sc.age[0];
  const cur = v7Age();
  if (target > cur) state.days += (target - cur) * 360;
}

/* ---------- 结算一个选择 ---------- */
function v7Apply(sc, choice) {
  const e = choice.eff || {};
  const notes = [];

  if (e.stats) for (const k in e.stats) {
    state.stats[k] = Math.max(1, Math.min(20, (state.stats[k] || 1) + e.stats[k]));
    notes.push({ k, v: e.stats[k], c: e.stats[k] > 0 ? 'good' : 'bad' });
  }
  if (e.emotion) for (const k in e.emotion) {
    if (!(k in state.emotions)) continue;
    state.emotions[k] = Math.max(0, Math.min(100, state.emotions[k] + e.emotion[k]));
  }
  if (e.health) {
    state.health = Math.max(0, Math.min(100, state.health + e.health));
    notes.push({ k: '身子', v: e.health, c: e.health > 0 ? 'good' : 'bad' });
  }
  if (e.reputation) {
    state.reputation = Math.max(-50, Math.min(100, state.reputation + e.reputation));
    notes.push({ k: '名声', v: e.reputation, c: e.reputation > 0 ? 'good' : 'bad' });
  }
  // 关系：有 npc 就记在那个人身上
  if (sc.npc) {
    const d = e.bond || 0;
    state.bonds[sc.npc] = (state.bonds[sc.npc] || 0) + d;
    if (d) notes.push({ k: v7NameOf(sc.npc), v: d, c: d > 0 ? 'good' : 'bad' });
  }
  if (e.flag) state.flags.push(e.flag);
  if (e.thread) {
    state.threads.push({ id: 'th' + Date.now(), text: e.thread, age: v7Age(), open: true });
    if (state.threads.length > 10) state.threads = state.threads.slice(-10);
  }

  state.seen.push(sc.id);
  state.memories.push({
    age: v7Age(),
    title: sc.memory || sc.title,
    scene: sc.title,
    choice: choice.title,
    text: choice.outcome,
    npc: sc.npc || '',
    days: state.days
  });
  state.journal.push({ age: v7Age(), title: sc.title, choice: choice.title, outcome: choice.outcome });
  if (state.journal.length > 60) state.journal.shift();

  // 时间推进：这一段的天数
  state.days += Math.max(10, sc.days || 30);

  // 身子随年龄自然下滑
  const a = v7Age();
  if (a > 52) state.health = Math.max(0, state.health - Math.floor((a - 52) / 12) - 1);

  return notes;
}

function v7NameOf(id) {
  const cast = (v7Book().cast || []).find(c => c.id === id);
  return cast ? cast.name : (id === 'friend' ? '朋友' : '那个人');
}
function v7RoleOf(id) {
  const cast = (v7Book().cast || []).find(c => c.id === id);
  return cast ? cast.role : '';
}
function v7TagOf(id) {
  const cast = (v7Book().cast || []).find(c => c.id === id);
  return cast ? cast.tag : '';
}

/* ---------- 结局 ---------- */
function v7Ending() {
  const book = v7Book();
  const mem = state.memories || [];
  const people = Object.keys(state.bonds || {}).map(id => ({ id, name: v7NameOf(id), v: state.bonds[id] }))
    .sort((a, b) => Math.abs(b.v) - Math.abs(a.v)).slice(0, 3);
  const m = state.emotions || {};
  const dominant = Object.entries(m).sort((a, b) => b[1] - a[1])[0];
  const warm = (m.爱 || 0) + (m.喜 || 0);
  const cold = (m.哀 || 0) + (m.惧 || 0);
  let title = '一生';
  if (warm > cold + 30) title = '有人记得你';
  else if (cold > warm + 30) title = '一个人走完';
  else if (people.length && people[0].v > 25) title = '把话说完了';
  else if (state.health > 55) title = '活到了最后';
  return { title, mem: mem.slice(-6).reverse(), people, dominant: dominant ? dominant[0] : '', book };
}
