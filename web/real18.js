'use strict';

/* v18 · 现实时间层
   你不在的时候，这个世界也在过。

   - 真实季节 → 世界的季节（你在冬天打开，穗骨原就是冬天）
   - 真实时辰 → 决定能遇到什么（深夜打开，遇到的是夜里的事）
   - 真实天数 → 你离开多久，回来时家里就过了多久
   - 生日 → 你第一次打开的那天，是他/她的生日
*/

const REAL18 = {
  /* 四个时辰 */
  buckets: [
    { id: 'dawn', name: '天没亮', from: 4, to: 7 },
    { id: 'day', name: '白天', from: 7, to: 17 },
    { id: 'dusk', name: '天快黑', from: 17, to: 20 },
    { id: 'night', name: '夜里', from: 20, to: 4 }
  ],
  seasons: ['春', '夏', '秋', '冬']
};

function r18Now() {
  const d = new Date();
  return {
    y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate(),
    h: d.getHours(), mi: d.getMinutes(),
    wd: d.getDay(),
    ts: d.getTime()
  };
}

function r18Bucket(h) {
  if (h >= 4 && h < 7) return 'dawn';
  if (h >= 7 && h < 17) return 'day';
  if (h >= 17 && h < 20) return 'dusk';
  return 'night';
}

function r18Season(m) {
  if (m >= 3 && m <= 5) return 0;   // 春
  if (m >= 6 && m <= 8) return 1;   // 夏
  if (m >= 9 && m <= 11) return 2;  // 秋
  return 3;                          // 冬
}

/* 每个世界的季节词（对应春夏秋冬） */
const SEASON_WORDS = {
  '穗骨原': [['初春', '开春', '化冻'], ['盛夏', '抢收前', '蝉响'], ['秋收', '暮秋', '谷黄'], ['隆冬', '落雪', '封冻']],
  '无昼京': [['亮班长的时节', '灯蕨发新芽', '回暖'], ['最长的白昼', '暑气从渠底上来', '日门开得久'], ['漏壶调校的月份', '灯油涨价', '天凉'], ['长夜', '暗禁最多的月份', '灯芯紧']],
  '借寿渡': [['河开', '雾薄的月份', '渡口最忙'], ['水涨', '船多', '对岸看不见'], ['灰落得厚', '契纸贵', '河面起白'], ['河封', '没人摆渡', '灯点得长']],
  '钟葬群岛': [['渔汛起', '海上平', '船下得多'], ['风季', '钟声传得远', '晒盐'], ['沉钟的季节', '潮退', '捞钟人下潜'], ['静湾结薄冰', '守夜多', '钟谱翻得勤']],
  '髓云都市': [['雾稀', '忆井最清', '赎瓶的人多'], ['雾浓', '富贵区的记忆溢出来', '甜味重'], ['雾沉', '封存塔检修', '交易旺季'], ['雾冷', '游魂多', '没人敢喊名字']],
  '星耒野': [['星雨初起', '播种', '土还松'], ['星最密', '庄稼疯长', '流星多'], ['抢收', '星糠价高', '夜路亮'], ['星稀', '冷房关一间', '守夜最苦']]
};

function r18WorldSeason() {
  const now = r18Now();
  const idx = r18Season(now.m);
  const words = (SEASON_WORDS[s9.book] || SEASON_WORDS['穗骨原'])[idx];
  return { idx, word: words[(now.d + now.m) % words.length] };
}

/* 初始化（第一次开这一局） */
function r18Init() {
  if (!s9.real) {
    const now = r18Now();
    s9.real = {
      startTs: now.ts,
      startDate: `${now.y}-${now.m}-${now.d}`,
      birthMonth: now.m,
      birthDay: now.d,
      lastPlayTs: now.ts,
      daysPlayed: 1,
      returns: 0,
      nightCards: 0,
      dawnCards: 0
    };
  }
}

/* 每次进游戏调用：算离开了多久 */
function r18CatchUp() {
  if (!s9.real) { r18Init(); return null; }
  const now = r18Now();
  const gapMs = now.ts - s9.real.lastPlayTs;
  const gapDays = Math.floor(gapMs / 86400000);
  s9.real.lastPlayTs = now.ts;

  if (gapDays < 1) return null;

  s9.real.returns += 1;
  s9.real.daysPlayed += gapDays;

  // 离开的日子，家里也过了
  const info = {
    days: gapDays,
    lines: []
  };

  // 家人变老
  for (const p of s9.family) {
    if (!p.alive) continue;
    if (p.id !== 'self') p.age += Math.min(gapDays, 2);
  }

  // 世界自己过：种子抽一下谁出事了
  const rnd = (n) => Math.floor(Math.random() * n);
  const alive = c9Alive().filter(p => p.id !== 'self');

  if (gapDays >= 7 && alive.length) {
    const who = alive[rnd(alive.length)];
    const kind = rnd(3);
    if (kind === 0) {
      who.rel = Math.max(0, (who.rel || 50) - 6);
      info.lines.push(`${who.name}问过你几次什么时候回来。`);
    } else if (kind === 1) {
      who.body = (who.body || 60) - 6;
      info.lines.push(`${who.name}病了一场，已经好了。`);
    } else {
      who.rel = Math.min(100, (who.rel || 50) + 4);
      info.lines.push(`${who.name}替你照看了家里。`);
    }
  }

  if (gapDays >= 14) {
    info.lines.push('地里的活误了一季，粮少了一点。');
    s9.grain = Math.max(0, s9.grain - 2);
  }

  if (gapDays >= 30) {
    info.lines.push('你回来的时候，村里有人已经不在了。');
  }

  // 记进 blind（你不知道的那些时候）
  s9.blind = s9.blind || [];
  for (const l of info.lines) s9.blind.push({ age: s9.age, who: '这些年', line: l });

  s9Save();
  return info;
}

/* 断天回归卡 */
function r18ReturnCard() {
  const info = s9.pendingReturn;
  if (!info) return null;
  s9.pendingReturn = null;
  s9.realShown = true;

  return {
    kind: 'return',
    title: `你走了 ${info.days} 天`,
    text: `这些天你不在。家里没有停下。\n日子照过，人的年纪也照长。`,
    ask: '',
    mark: `我走了 ${info.days} 天`,
    actions: [
      { id: 'r1', name: '问问这些天发生了什么', desc: '坐下来听。', hint: '心+4', effort: 1, plot: { title: '问问这些天发生了什么', desc: '', hint: '', outcome: (info.lines.length ? info.lines.join('') : '家里没什么大事。'), eff: { emotion: { 爱: 3 } } } },
      { id: 'r2', name: '先去看看地里的活', desc: '活不等人。', hint: '粮+1', effort: 1, plot: { title: '先去看看地里的活', desc: '', hint: '', outcome: '你在田里转了一圈，把该补的补上。', eff: {} } },
      { id: 'r3', name: '什么也不问', desc: '回来就好。', hint: '心-2', effort: 0, plot: { title: '什么也不问', desc: '', hint: '', outcome: '你什么也没问。他们也没说。', eff: { emotion: { 哀: 2 } } } }
    ]
  };
}

/* 时辰影响：这一年的卡，语气随你打开的时间变 */
function r18Tone() {
  const now = r18Now();
  const b = r18Bucket(now.h);
  const map = {
    dawn: { pre: '天还没亮的时候', intro: '你醒得比平常早。' },
    day: { pre: '白天', intro: '' },
    dusk: { pre: '天快黑的时候', intro: '日头落下去了。' },
    night: { pre: '夜里', intro: '屋里点着灯。' }
  };
  return Object.assign({ bucket: b }, map[b]);
}

/* 给账本显示：真实时间的一行 */
function r18Line() {
  if (!s9.real) return '';
  const now = r18Now();
  const daysSinceStart = Math.floor((now.ts - s9.real.startTs) / 86400000) + 1;
  return `第 ${daysSinceStart} 天 · ${s9.real.returns} 次远行`;
}

/* 生日：真实的一年到了，弹一段 */
function r18Birthday() {
  if (!s9.real) return null;
  const now = r18Now();
  if (now.m !== s9.real.birthMonth || now.d !== s9.real.birthDay) return null;
  const key = `${now.y}`;
  if (s9.real.lastBirthday === key) return null;
  s9.real.lastBirthday = key;

  return {
    kind: 'birthday',
    title: '今天是个日子',
    text: `一年过去了。${s9.name}，你还在这里。\n这一天和你第一天打开这个世界的日子是同一天。`,
    ask: '',
    mark: '又过了一年',
    actions: [
      { id: 'b1', name: '给自己做一碗面', desc: '没人记得，你自己记得。', hint: '心+6', effort: 0, plot: { title: '给自己做一碗面', desc: '', hint: '', outcome: '你下了碗面，坐在门口吃完。风挺好的。', eff: { emotion: { 喜: 4 } } } },
      { id: 'b2', name: '去看一个人', desc: '别一个人过。', hint: '关系+8', effort: 0, plot: { title: '去看一个人', desc: '', hint: '', outcome: '你去了。对方愣了一下，说：你怎么来了。你说：今天没什么事。', eff: { emotion: { 爱: 4 } } } },
      { id: 'b3', name: '当普通一天过', desc: '日子不需要记号。', hint: '心+2', effort: 0, plot: { title: '当普通一天过', desc: '', hint: '', outcome: '这一天和别的天一样过去了。晚上你想起是今天，已经过了。', eff: { emotion: { 哀: 2 } } } }
    ]
  };
}
