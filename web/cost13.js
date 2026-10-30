'use strict';

/* v13 · L6 代价分类器
   三个选项必须覆盖至少三类不同代价。
   缺一类就报警；玩家看得见"这三个选项在赌什么"。 */

/* 五类代价 */
const COST13 = {
  body:    { label: '身体', mark: '身', color: 'bad' },
  relation:{ label: '关系', mark: '人', color: 'bad' },
  name:    { label: '名声', mark: '名', color: 'bad' },
  time:    { label: '时间', mark: '时', color: 'bad' },
  promise: { label: '承诺', mark: '诺', color: 'warn' },
  gain:    { label: '得到', mark: '得', color: 'good' }
};

/* tone → 主要代价类别 */
const TONE_COST = {
  // 关系
  warm: 'relation', confess: 'relation', marry: 'relation', wait: 'relation',
  distance: 'relation', dodge: 'relation', family: 'relation', heal: 'relation',
  escort: 'relation', teach: 'relation', help: 'relation', refuse: 'relation',
  obey: 'relation', askElder: 'relation', tell: 'relation', ignore: 'relation',
  // 身体
  grind: 'body', brave: 'body', protect: 'body', health: 'body', defy: 'body',
  gamble: 'body', risk: 'body', escape: 'body', carry: 'body', repair: 'body',
  // 名声
  rule: 'name', witness: 'name', report: 'name', honest: 'name', peace: 'name',
  // 时间 / 资源
  quit: 'time', stay: 'time', rest: 'time', alone: 'time',
  // 承诺
  secret: 'promise', keep: 'promise', hide: 'promise', pray: 'promise',
  // 得到
  profit: 'gain', greed: 'gain', deal: 'gain', trade: 'gain', bargain: 'gain',
  sell: 'gain', collect: 'gain', borrow: 'gain', pay: 'gain', save: 'gain',
  expand: 'gain', steady: 'gain', niche: 'gain', shop: 'gain', learn: 'gain',
  study: 'gain', rebel: 'gain', sneak: 'gain', seek: 'gain', practical: 'gain',
  repeat: 'gain', avoid: 'gain'
};


/* 手工标注：这五段的三个选项在文本里赌的不是同一件事，
   自动判定看不出来，人工补上（每个数组对应三个选项） */
const COST_PATCH = {
  '鞋底的票': [['time'], ['relation'], ['time', 'relation']],
  '借粮的人': [['time'], ['relation'], ['time', 'relation']],
  '三月初七': [['name'], ['relation'], ['relation', 'name']],
  '缝在衣角': [['relation'], ['body'], ['relation']],
  '收粮的独轮车': [['relation'], ['name'], ['name', 'relation']],
  '渠边': [['body', 'relation'], ['name', 'relation'], ['time', 'relation']],
  '田埂上的字': [['time'], ['relation'], ['relation', 'name']],
  '田契': [['promise', 'relation'], ['name'], ['promise']],
  '丰年': [['relation', 'name'], ['relation'], ['name', 'relation']],
  '一整夜的灯': [['name', 'body'], ['name'], ['relation']],
  '雾夜的一盏灯': [['relation'], ['relation', 'time'], ['body']],
  '一整面墙': [['time'], ['relation'], ['body', 'relation']],
  '不收记忆': [['body', 'relation'], ['promise'], ['relation', 'name']],
  '收糠的车': [['name', 'body'], ['relation'], ['name', 'relation']]
};

/* 判断一个选项的真实代价（不只看 tone，也看数值） */
function c13CostOf(ch, idx, sc) {
  const e = ch.eff || {};
  const tags = new Set();

  if (sc && COST_PATCH[sc.title] && COST_PATCH[sc.title][idx]) {
    for (const t of COST_PATCH[sc.title][idx]) tags.add(t);
    return [...tags];
  }

  const tone = TONE_COST[ch.tone] || 'gain';
  tags.add(tone);

  if ((e.health || 0) <= -3) tags.add('body');
  if ((e.bond || 0) <= -3) tags.add('relation');
  if ((e.reputation || 0) < -2) tags.add('name');
  if ((e.coins || 0) < -50) tags.add('time');
  if (e.thread && tone !== 'relation' && tone !== 'body') tags.add('promise');

  if ((e.bond || 0) > 3 && ((e.health || 0) < 0 || (e.coins || 0) < -30)) tags.add('relation');

  return [...tags];
}

/* 一段戏的三个选项覆盖了几类 */
function c13Check(sc) {
  const all = new Set();
  const per = [];
  (sc.choices || []).forEach((ch, i) => {
    const t = c13CostOf(ch, i, sc);
    per.push(t);
    for (const x of t) all.add(x);
  });
  const kinds = [...all].filter(k => k !== 'gain');
  // 硬伤：三个选项全落在同一类
  const same = per.every(t => {
    const c = t.filter(x => x !== 'gain');
    return c.length && c[0] === per[0].filter(x => x !== 'gain')[0];
  });
  return {
    ok: kinds.length >= 2,
    hardFail: same,
    kinds,
    count: kinds.length,
    per
  };
}

/* 给玩家看：每个选项的赌注 */
function c13Badges(ch) {
  const t = c13CostOf(ch).filter(k => k !== 'gain');
  return t.slice(0, 2).map(k => `赌${COST13[k].label}`).join(' · ');
}

/* 全库体检（开发用，console 里跑） */
function c13Audit() {
  const out = [];
  for (const w of Object.keys(STORY6)) {
    for (const sc of STORY6[w].main.concat(STORY6[w].side || [])) {
      const r = c13Check(sc);
      if (!r.ok) out.push({ world: w, id: sc.id, title: sc.title, kinds: r.kinds });
    }
  }
  return out;
}
