'use strict';

/* v20 · 六部关系结构差异化
   每部的社会关系几何不一样：有的以家为本位，有的以行会，有的以职场。
   除了家人，每部还有两个"非血缘"的人——他们才是这个世界的社会。 */

const ROSTER20 = {
  '穗骨原': {
    shape: '家庭本位',
    note: '你的一生被土地和血缘绑在一起。除了家人，你只认识村里几个人。',
    extra: [
      { id: 'elder_v', name: '老账房', tag: '村中长者', role: '在田埂上用树枝教你写字的人',
        trait: '说话慢，写字的时候会把舌头伸出来一点。', desire: '想在死前教出一个认字的孩子。',
        rel: 40, body: 48,
        private: [{ age: 12, act: '眼睛看不见了，不再出门', tell: true, line: '他坐在门口，说：以后你自己写。' }] },
      { id: 'peer', name: '王二家的儿子', tag: '同龄人', role: '和你一起下田、一起争过水',
        trait: '嗓门大，打架不挑时候，但从不背后使坏。', desire: '想离开骨沟村。',
        rel: 45, body: 70,
        private: [{ age: 16, act: '偷偷去穗仓城报了工', tell: true, line: '他走的那天早上，没跟任何人告别。' }] }
    ],
    edges: [
      { a: 'elder_v', b: 'father', close: 50, debt: 8, unsaid: 3, drift: {}, cause: '老账房借过他家一斗种' },
      { a: 'peer', b: 'self', close: 45, debt: 0, unsaid: 2, drift: { close: 1 }, cause: '' }
    ]
  },

  '无昼京': {
    shape: '工坊本位',
    note: '父亲已经不在了。这个家由母亲、师父、和同铺的人撑起来。你的"父亲"是修灯这一行。',
    extra: [
      { id: 'mentor', name: '老灯匠', tag: '师父', role: '带你入行的人',
        trait: '手上有一道从虎口到手腕的旧疤。修灯时一句话不说。', desire: '想把手艺传下去，但挑人挑得厉害。',
        rel: 45, body: 55,
        private: [{ age: 15, act: '把手艺教完，开始把活交给你', tell: true, line: '他把最后一把镊子给你，说：以后你修。' },
                  { age: 34, act: '眼睛坏了，彻底交给别人', tell: true, line: '他不再来铺子。你去看了他一次，他在灯下坐着。' }] },
      { id: 'peer', name: '同铺的阿辛', tag: '师兄弟', role: '和你争同一个位置的人',
        trait: '比你手快，比你嘴甜，也比你怕输。', desire: '想顶下这间铺子。',
        rel: 35, body: 68,
        private: [{ age: 20, act: '自己另开了一间铺，就在对门', tell: true, line: '他把招牌挂在对门。你两个没说过话。' }] }
    ],
    edges: [
      { a: 'mentor', b: 'mother', close: 48, debt: 12, unsaid: 5, drift: {}, cause: '他替母亲垫过灯油钱' },
      { a: 'peer', b: 'self', close: 30, debt: -4, unsaid: 4, drift: { close: -1 }, cause: '争同一个位置' }
    ]
  },

  '借寿渡': {
    shape: '行业本位',
    note: '渡口是个行当。你的亲人是祖母，你的"家"是这条河和在这条河上讨生活的人。',
    extra: [
      { id: 'peer', name: '同船的秦五', tag: '同行', role: '跟你一条船、分一份钱的搭子',
        trait: '爱唱，唱得难听；算账的时候一个子都不让。', desire: '想自己买一条船。',
        rel: 42, body: 74,
        private: [{ age: 22, act: '凑够了买船的钱，要单干', tell: true, line: '他说：以后各走各的。还是笑着说的。' }] },
      { id: 'neighbor', name: '纸寿巷的阿婶', tag: '邻里', role: '糊纸人，替人写寿数',
        trait: '指甲缝里总有浆糊，说话前先看你手里拿的什么。', desire: '想攒钱赎回自己男人的名字。',
        rel: 38, body: 58,
        private: [{ age: 30, act: '赎回了名字，在巷口哭了一场', tell: true, line: '她说：他又有名字了。' }] }
    ],
    edges: [
      { a: 'peer', b: 'grandma', close: 40, debt: 6, unsaid: 2, drift: {}, cause: '同一条船上的旧账' },
      { a: 'neighbor', b: 'grandma', close: 55, debt: 0, unsaid: 7, drift: { unsaid: 1 }, cause: '两个人一起烧过很多契' }
    ]
  },

  '钟葬群岛': {
    shape: '行会本位',
    note: '守钟是行会，不是家务。你父亲教你敲钟，你的同伴跟你一起下沉。',
    extra: [
      { id: 'peer', name: '捞钟的阿鲛', tag: '同伴', role: '跟你一起潜到沉钟渊的人',
        trait: '能在水下睁眼，上岸后一直流眼泪，也不擦。', desire: '想捞到一口有名字的钟。',
        rel: 46, body: 80,
        private: [{ age: 24, act: '一个人下潜，三个时辰没上来', tell: true, line: '捞上来的时候，手里还攥着一块铜。' }] },
      { id: 'mentor', name: '守钟会的账老', tag: '上级', role: '管钟谱、管名字的人',
        trait: '从不看你的脸，只看你的手。', desire: '想让钟谱上一个名字都不少。',
        rel: 32, body: 62,
        private: [{ age: 40, act: '查出父亲多记了一个名字', tell: true, line: '他把那一行用指甲刮掉了。' }] }
    ],
    edges: [
      { a: 'peer', b: 'self', close: 46, debt: 0, unsaid: 3, drift: { close: 1 }, cause: '' },
      { a: 'mentor', b: 'father', close: 38, debt: -10, unsaid: 4, drift: {}, cause: '钟谱上那一行' }
    ]
  },

  '髓云都市': {
    shape: '职场本位',
    note: '这是一座城，不是一座村。你和母亲住在同一栋楼里，但你有同事、有上司、有对手。',
    extra: [
      { id: 'boss', name: '封存塔的科长', tag: '上司', role: '决定你审哪一份记忆的人',
        trait: '永远穿同一件灰外套，说话像念公文。', desire: '想让封存塔一间都不出错。',
        rel: 26, body: 60,
        private: [{ age: 33, act: '私下卖掉了一批过期记忆', tell: true, line: '你审到了那一份，签的是他的编号。' }] },
      { id: 'peer', name: '同组的周见', tag: '同事', role: '和你一起审记忆、也一起瞒事情的人',
        trait: '喝咖啡的时候会把杯子转三圈再喝。', desire: '想调去漂忆港做买卖。',
        rel: 44, body: 72,
        private: [{ age: 28, act: '被发现改了一份审计记录', tell: true, line: '她说是为了一个孩子。你没举报她。' }] }
    ],
    edges: [
      { a: 'peer', b: 'self', close: 44, debt: 6, unsaid: 5, drift: { unsaid: 1 }, cause: '你替她瞒过一次' },
      { a: 'boss', b: 'father', close: 20, debt: -14, unsaid: 2, drift: {}, cause: '父亲在质押合同上签过他的字' }
    ]
  },

  '星耒野': {
    shape: '拓荒本位',
    note: '这里是新开的地。除了家人，你只有邻田的人和城里来收糠的人。',
    extra: [
      { id: 'neighbor', name: '邻田的老祁', tag: '邻田', role: '地界相邻，水渠共用',
        trait: '话多，借东西从不还，但你家着火他第一个到。', desire: '想守住自己那块地不被城里收走。',
        rel: 43, body: 66,
        private: [{ age: 21, act: '地被城里收走了一半', tell: true, line: '他没说什么，第二天照常下田，只是田少了一半。' }] },
      { id: 'peer', name: '观星人的徒弟', tag: '同行', role: '看星雨、定播种时辰',
        trait: '夜里不睡，白天眼睛总是红的。', desire: '想自己定一次播种的日子。',
        rel: 36, body: 70,
        private: [{ age: 26, act: '自己定了一次播种，全赔了', tell: true, line: '他说：是我的错。没人怪他，他自己怪。' }] }
    ],
    edges: [
      { a: 'neighbor', b: 'father', close: 52, debt: 10, unsaid: 4, drift: {}, cause: '水渠改道那次' },
      { a: 'peer', b: 'self', close: 36, debt: 0, unsaid: 3, drift: {}, cause: '' }
    ]
  }
};

/* 把非血缘关系加入这一局 */
function r20Init() {
  const r = ROSTER20[s9.book];
  if (!r) return;

  // 加进 family 列表（但不是家人，用 tag 区分）
  for (const e of r.extra) {
    if (s9.family.find(p => p.id === e.id)) continue;
    s9.family.push({
      id: e.id, name: e.name, tag: e.tag, age: 30 + (e.rel % 12),
      rel: e.rel, body: e.body, alive: true, away: false, note: '',
      role: e.role, trait: e.trait, desire: e.desire, social: true
    });
  }

  // 关系网加边
  if (s9.web) {
    for (const e of r.extra) {
      if (!s9.web.people[e.id]) s9.web.people[e.id] = { name: e.name, tag: e.tag };
    }
    for (const ed of (r.edges || [])) {
      if (s9.web.edges.some(x => (x.a === ed.a && x.b === ed.b) || (x.a === ed.b && x.b === ed.a))) continue;
      s9.web.edges.push(Object.assign({}, ed));
    }
  }

  // 私事轨
  if (s9.priv) {
    for (const e of r.extra) {
      if (!e.private) continue;
      s9.priv[e.id] = [{
        id: 'pr_' + e.id, name: e.tag, step: 0,
        steps: e.private.map(p => ({ age: p.age, act: p.act, tell: p.tell, line: p.line, eff: {} })),
        done: false, revealed: false, lastAct: ''
      }];
    }
  }
}

/* 给"人"一页看的社会关系 */
function r20Social() {
  const r = ROSTER20[s9.book];
  return r || null;
}
