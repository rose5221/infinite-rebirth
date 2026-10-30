'use strict';

/* v15 · L7 结算层：时间归因
   不是"多少年给了活计"，是"多少年给了谁"。

   每一次选择，都记在这笔账上：
   给了活计 / 给了某个人 / 给了自己 / 什么也没给 */

function t15Init() {
  s9.time = {
    work: 0,
    self: 0,
    alone: 0,
    rest: 0,
    byPerson: {}
  };
}

/* 把这一年的一个动作记到账上 */
function t15Log(act, card) {
  if (!s9.time) t15Init();

  // 动作 → 归到谁头上
  const id = act.id || '';
  const L = s9.time;

  const toPerson = (who, w) => {
    if (!who) { L.self += w; return; }
    L.byPerson[who] = (L.byPerson[who] || 0) + w;
  };

  // 日常动作
  if (id === 'field' || id === 'help' || id === 'earn' || id === 'land' || id === 'craft' || id === 'shop') { L.work += 1; return; }
  if (id === 'study' || id === 'learn' || id === 'teach' || id === 'save') { L.self += 1; return; }
  if (id === 'rest' || id === 'sun') { L.rest += 1; return; }
  if (id === 'watch_kid') { toPerson('child', 1); return; }
  if (id === 'tell') { toPerson('child', 0.6); L.self += 0.4; return; }

  if (id.startsWith('talk_kid')) { toPerson('child', 1); return; }
  if (id.startsWith('talk_old')) { toPerson('elder', 1); return; }
  if (id === 'care') { toPerson('elder', 1); return; }
  if (id === 'marry') { toPerson('spouse', 1); return; }
  if (id === 'child') { toPerson('child', 1); return; }

  // 剧情/插曲：看 npc 和 tone
  if (card && (card.kind === 'plot' || card.web)) {
    const sc = card.scene || {};
    const npc = sc.npc || '';
    const tone = (act.plot && act.plot.tone) || '';
    if (npc) { toPerson(npc, 1); return; }
    if (tone === 'alone' || tone === 'distance' || tone === 'escape') { L.alone += 1; return; }
    if (tone === 'profit' || tone === 'greed' || tone === 'trade' || tone === 'rule') { L.work += 1; return; }
    L.self += 1;
    return;
  }

  // 关口
  if (card && card.kind === 'gate') {
    const gid = card.gate.id;
    if (gid === 'g7' || gid === 'g30') { L.self += 1; return; }
    if (gid === 'g25') { toPerson('spouse', 1); return; }
    if (gid === 'g40') { toPerson('father', 1); return; }
    if (gid === 'g50') { toPerson('child', 1); return; }
    L.self += 1;
    return;
  }

  L.self += 1;
}

/* 汇总：按名字排序，取前四 */
function t15Summary() {
  if (!s9.time) return { rows: [], total: 0 };
  const L = s9.time;
  const nameOf = (k) => {
    if (k === 'child') return s9.hasChild ? (c9Alive().find(p => p.age <= 25 && p.id !== 'self') || {}).name || '孩子' : '孩子';
    if (k === 'spouse') return s9.spouseName || '伴侣';
    if (k === 'elder') {
      const e = s9.family.filter(p => p.id !== 'self' && p.age >= 55).sort((a, b) => b.age - a.age)[0];
      return e ? e.name : '老人';
    }
    if (k === 'father') return c9Name('father') || '父亲';
    if (k === 'mother') return c9Name('mother') || '母亲';
    if (k === 'sibling') return c9Name('sibling') || '手足';
    if (k === 'grandma') return c9Name('grandma') || '祖母';
    if (k === 'friend') return c9Name('friend') || '朋友';
    return c9Name(k) || k;
  };

  const rows = [];
  const persons = Object.keys(L.byPerson).map(k => ({ k: 'give', name: nameOf(k), v: L.byPerson[k] }))
    .filter(x => x.v >= 0.5).sort((a, b) => b.v - a.v);

  // 合并同名
  const merged = {};
  for (const p of persons) merged[p.name] = (merged[p.name] || 0) + p.v;
  for (const n of Object.keys(merged)) rows.push({ k: 'give', name: n, v: Math.round(merged[n]) });

  if (L.work >= 1) rows.push({ k: 'work', name: '活计', v: Math.round(L.work) });
  if (L.self >= 1) rows.push({ k: 'self', name: '自己', v: Math.round(L.self) });
  if (L.alone >= 1) rows.push({ k: 'alone', name: '一个人', v: Math.round(L.alone) });
  if (L.rest >= 1) rows.push({ k: 'rest', name: '歇着', v: Math.round(L.rest) });

  rows.sort((a, b) => b.v - a.v);
  const total = rows.reduce((s, r) => s + r.v, 0);
  return { rows: rows.slice(0, 7), total };
}

/* 一句判词：这一生最像什么 */
function t15Verdict() {
  const L = s9.time || {};
  const persons = Object.values(L.byPerson || {}).reduce((a, b) => a + b, 0);
  const work = L.work || 0;
  const alone = L.alone || 0;
  const self = L.self || 0;

  if (persons > work + self + alone) return '这一生大半给了人';
  if (work > persons + self) return '这一生大半给了活计';
  if (alone > persons) return '这一生大半是一个人过的';
  if (self > persons + work) return '这一生大半给了自己';
  return '这一生分得很匀';
}

/* 谁在你最后那段日子里 */
function t15LastHands() {
  if (!s9.web) return [];
  const selfEdges = s9.web.edges.filter(e => e.a === 'self' || e.b === 'self');
  return selfEdges.map(e => {
    const other = e.a === 'self' ? e.b : e.a;
    const p = s9.family.find(x => x.id === other);
    return { name: c9Name(other) || other, close: Math.round(e.close), alive: !!(p && p.alive && !p.away) };
  }).sort((a, b) => b.close - a.close).slice(0, 4);
}
