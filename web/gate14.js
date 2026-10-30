'use strict';

/* v14 · L2 时间层：九道关口
   不是"年龄从 0 到死"，是九个关口。
   每个关口检验前几年的所有选择；过不去就分岔，不是结束。 */

const GATE14 = {
  '穗骨原': [
    {
      id: 'g7', age: 7, name: '识不识字',
      check: () => s9.hand >= 1.4,
      hint: '家里让不让你读书',
      pass: { text: '你认得自己的名字。先生说你记性好。', eff: { hand: 0.4, heart: 4 } },
      fail: { text: '家里没让你读书。你到死只认得自己的名字。', eff: { heart: -5 }, flag: 'illiterate' },
      choice: [
        { t: '求家里让你读', d: '一年三百文的束脩。', h: '钱-300 · 手+0.6', e: { body: -1, heart: 4, hand: 0.6, coin: -300 }, setHand: 1.4 },
        { t: '不读了，下田', d: '多半个劳力。', h: '粮+2 · 一生只认自己的名字', e: { grain: 2, body: -3 }, flag: 'illiterate' },
        { t: '偷偷跟着听', d: '站在窗外，被赶也不走。', h: '手+0.2 · 先生会记住你', e: { heart: -2, hand: 0.2 } }
      ]
    },
    {
      id: 'g13', age: 13, name: '你在这个家的位置',
      check: () => (s9.heart > 40 || s9.hand >= 2),
      hint: '你是顶事的那个，还是多余的那个',
      pass: { text: '家里有事开始问你一句。你没说什么，但记住了。', eff: { heart: 5 } },
      fail: { text: '家里有事不叫你。你在门口站着，听里面说话。', eff: { heart: -7 }, flag: 'outsider' },
      choice: [
        { t: '自己找活干', d: '不等人安排。', h: '钱+150 · 身-5', e: { coin: 150, body: -5, heart: 3 } },
        { t: '跟着姐姐走', d: '她去哪儿你去哪儿。', h: '关系+6 · 少一份自己的主意', e: { relSibling: 6, hand: -0.2 } },
        { t: '什么也不做', d: '这一年就这样过去。', h: '心-6', e: { heart: -6 } }
      ]
    },
    {
      id: 'g18', age: 18, name: '走，还是留',
      check: () => !!(s9.flagLeft || s9.flagStay),
      hint: '走断关系，留断可能',
      pass: { text: '你做了决定。', eff: {} },
      fail: { text: '你在村口站了半年，最后没走。', eff: { heart: -4 } },
      choice: [
        { t: '走', d: '背一个包，天亮前出村。', h: '钱+400 · 关系-15', e: { coin: 400, relFather: -8, relMother: -8, heart: 6 }, flag: 'left' },
        { t: '留', d: '家里需要人。', h: '关系+10 · 一生在这几条街', e: { relFather: 10, relMother: 10, heart: -3 }, flag: 'stayed' },
        { t: '先去一趟再回来', d: '看看外面，再决定。', h: '钱-100 · 心+3', e: { coin: -100, heart: 3, hand: 0.3 } }
      ]
    },
    {
      id: 'g25', age: 25, name: '成不成家',
      check: () => !!s9.married,
      hint: '不成则晚年无人',
      pass: { text: '你成了家。', eff: {} },
      fail: { text: '你没成家。以后也没成。', eff: { heart: -5 }, flag: 'alone' },
      choice: [
        { t: '说一门亲', d: '托媒人，摆六桌。', h: '钱-600 · 家里多一口', e: { coin: -600, heart: 8, married: true } },
        { t: '再等等', d: '还没有那个心思。', h: '钱留着 · 心-2', e: { heart: -2 } },
        { t: '自己找', d: '不想让媒人决定。', h: '可能成，可能不成', e: { heart: 4, coin: -100 }, maybe: 'marry' }
      ]
    },
    {
      id: 'g30', age: 30, name: '营生立没立住',
      check: () => s9.hand >= 3.2,
      hint: '没立住则一生打零工',
      pass: { text: '你有一门吃饭的本事。', eff: { coin: 200 } },
      fail: { text: '你什么都会一点，什么都不精。', eff: { heart: -4 }, flag: 'oddjobs' },
      choice: [
        { t: '把手艺做精', d: '推掉别的活，只做这一样。', h: '手+0.8 · 钱-200', e: { hand: 0.8, coin: -200, heart: 3 } },
        { t: '什么都接', d: '有活就干。', h: '钱+400 · 手+0.1', e: { coin: 400, body: -6 } },
        { t: '开个小铺', d: '自己给自己干。', h: '钱-800 · 往后有进项', e: { coin: -800, heart: 5 }, flag: 'shop' }
      ]
    },
    {
      id: 'g40', age: 40, name: '父母走时，你在不在',
      check: () => true,
      hint: '不在则留一辈子的话没说完',
      pass: { text: '', eff: {} },
      fail: { text: '', eff: {} },
      choice: [
        { t: '守着', d: '把手上的事都放下。', h: '心+6 · 钱-300', e: { heart: 6, coin: -300, relFather: 10, relMother: 10 } },
        { t: '先把手上的活做完', d: '晚几天回去。', h: '钱+300 · 心-8', e: { coin: 300, heart: -8, relFather: -8 } },
        { t: '不在身边', d: '你在外面，赶不回来。', h: '心-12 · 一辈子记着', e: { heart: -12 }, flag: 'absent' }
      ]
    },
    {
      id: 'g50', age: 50, name: '孩子跟你亲不亲',
      check: () => s9.hasChild && s9.heart > 45,
      hint: '不亲则晚年没人来',
      pass: { text: '孩子愿意跟你说事。', eff: { heart: 5 } },
      fail: { text: '孩子有话不跟你说。', eff: { heart: -6 }, flag: 'distant' },
      choice: [
        { t: '坐下来听他说', d: '把手上的活放下。', h: '心+6 · 关系+8', e: { heart: 6, relSibling: 4 } },
        { t: '先忙自己的', d: '等有功夫再说。', h: '钱+200 · 心-5', e: { coin: 200, heart: -5 } },
        { t: '托人带句话', d: '不好意思当面说。', h: '心-2', e: { heart: -2 } }
      ]
    },
    {
      id: 'g60', age: 60, name: '身体还剩多少',
      check: () => s9.body >= 40,
      hint: '决定还能干几年',
      pass: { text: '你还走得动。', eff: {} },
      fail: { text: '你走两步就要歇。', eff: { body: -6 }, flag: 'frail' },
      choice: [
        { t: '把身子养回来', d: '少吃点苦，多睡。', h: '身+12 · 钱-200', e: { body: 12, coin: -200 } },
        { t: '再拼两年', d: '趁还能动。', h: '钱+500 · 身-8', e: { coin: 500, body: -8 } },
        { t: '就这样吧', d: '该来的来。', h: '心+3', e: { heart: 3 } }
      ]
    },
    {
      id: 'g68', age: 68, name: '寿限',
      check: () => true,
      hint: '续命，或者不了',
      pass: { text: '', eff: {} },
      fail: { text: '', eff: {} },
      choice: []
    }
  ]
};

/* 其他五部共用一套通用关口（措辞按世界替换关键名词） */
const GATE_GENERIC = [
  { id: 'g7', age: 7, name: '识不识字', check: () => s9.hand >= 1.4,
    pass: { text: '你认得自己的名字。', eff: { hand: 0.4, heart: 4 } },
    fail: { text: '没人教你认字。你到死只认得自己的名字。', eff: { heart: -5 }, flag: 'illiterate' },
    choice: [
      { t: '求家里让你读', d: '一年三百文。', h: '钱-300 · 手+0.6', e: { body: -1, heart: 4, hand: 0.6, coin: -300 } },
      { t: '不读了', d: '多半个劳力。', h: '粮+2 · 只认自己的名字', e: { grain: 2, body: -3 }, flag: 'illiterate' },
      { t: '偷偷跟着听', d: '被赶也不走。', h: '手+0.2 · 心-2', e: { heart: -2, hand: 0.2 } }
    ] },
  { id: 'g13', age: 13, name: '你在这个家的位置', check: () => (s9.heart > 40 || s9.hand >= 2),
    pass: { text: '家里有事开始问你一句。', eff: { heart: 5 } },
    fail: { text: '家里有事不叫你。', eff: { heart: -7 }, flag: 'outsider' },
    choice: [
      { t: '自己找活干', d: '不等人安排。', h: '钱+150 · 身-5', e: { coin: 150, body: -5, heart: 3 } },
      { t: '跟着家里老人', d: '他去哪儿你去哪儿。', h: '关系+6', e: { relFather: 6, hand: -0.2 } },
      { t: '什么也不做', d: '这一年就这样过去。', h: '心-6', e: { heart: -6 } }
    ] },
  { id: 'g18', age: 18, name: '走，还是留', check: () => !!(s9.flagLeft || s9.flagStay),
    pass: { text: '你做了决定。', eff: {} },
    fail: { text: '你在门口站了半年，最后没走。', eff: { heart: -4 } },
    choice: [
      { t: '走', d: '背一个包，天亮前出门。', h: '钱+400 · 关系-15', e: { coin: 400, relFather: -8, relMother: -8, heart: 6 }, flag: 'left' },
      { t: '留', d: '这里需要人。', h: '关系+10 · 心-3', e: { relFather: 10, relMother: 10, heart: -3 }, flag: 'stayed' },
      { t: '先去一趟再回来', d: '看看外面。', h: '钱-100 · 心+3', e: { coin: -100, heart: 3, hand: 0.3 } }
    ] },
  { id: 'g25', age: 25, name: '成不成家', check: () => !!s9.married,
    pass: { text: '你成了家。', eff: {} },
    fail: { text: '你没成家。以后也没成。', eff: { heart: -5 }, flag: 'alone' },
    choice: [
      { t: '说一门亲', d: '托媒人，摆六桌。', h: '钱-600 · 家里多一口', e: { coin: -600, heart: 8, married: true } },
      { t: '再等等', d: '还没那个心思。', h: '心-2', e: { heart: -2 } },
      { t: '自己找', d: '不想让媒人决定。', h: '心+4 · 钱-100', e: { heart: 4, coin: -100 } }
    ] },
  { id: 'g30', age: 30, name: '营生立没立住', check: () => s9.hand >= 3.2,
    pass: { text: '你有一门吃饭的本事。', eff: { coin: 200 } },
    fail: { text: '你什么都会一点，什么都不精。', eff: { heart: -4 }, flag: 'oddjobs' },
    choice: [
      { t: '把手艺做精', d: '推掉别的活。', h: '手+0.8 · 钱-200', e: { hand: 0.8, coin: -200, heart: 3 } },
      { t: '什么都接', d: '有活就干。', h: '钱+400 · 身-6', e: { coin: 400, body: -6 } },
      { t: '自己开一间', d: '自己给自己干。', h: '钱-800 · 往后有进项', e: { coin: -800, heart: 5 }, flag: 'shop' }
    ] },
  { id: 'g40', age: 40, name: '父母走时，你在不在', check: () => true,
    pass: { text: '', eff: {} }, fail: { text: '', eff: {} },
    choice: [
      { t: '守着', d: '把手上的事都放下。', h: '心+6 · 钱-300', e: { heart: 6, coin: -300, relFather: 10, relMother: 10 } },
      { t: '先把手上的活做完', d: '晚几天回去。', h: '钱+300 · 心-8', e: { coin: 300, heart: -8, relFather: -8 } },
      { t: '不在身边', d: '赶不回来。', h: '心-12', e: { heart: -12 }, flag: 'absent' }
    ] },
  { id: 'g50', age: 50, name: '孩子跟你亲不亲', check: () => s9.hasChild && s9.heart > 45,
    pass: { text: '孩子愿意跟你说事。', eff: { heart: 5 } },
    fail: { text: '孩子有话不跟你说。', eff: { heart: -6 }, flag: 'distant' },
    choice: [
      { t: '坐下来听他说', d: '把手上的活放下。', h: '心+6', e: { heart: 6 } },
      { t: '先忙自己的', d: '等有功夫。', h: '钱+200 · 心-5', e: { coin: 200, heart: -5 } },
      { t: '托人带句话', d: '不好意思当面说。', h: '心-2', e: { heart: -2 } }
    ] },
  { id: 'g60', age: 60, name: '身体还剩多少', check: () => s9.body >= 40,
    pass: { text: '你还走得动。', eff: {} },
    fail: { text: '你走两步就要歇。', eff: { body: -6 }, flag: 'frail' },
    choice: [
      { t: '把身子养回来', d: '少吃点苦。', h: '身+12 · 钱-200', e: { body: 12, coin: -200 } },
      { t: '再拼两年', d: '趁还能动。', h: '钱+500 · 身-8', e: { coin: 500, body: -8 } },
      { t: '就这样吧', d: '该来的来。', h: '心+3', e: { heart: 3 } }
    ] },
  { id: 'g68', age: 68, name: '寿限', check: () => true,
    pass: { text: '', eff: {} }, fail: { text: '', eff: {} }, choice: [] }
];

function g14List() {
  return GATE14[s9.book] || GATE_GENERIC;
}

/* 到点了吗 */
function g14Due() {
  const list = g14List();
  for (const g of list) {
    if (g.id === 'g68') continue;
    if (s9.passed && s9.passed.includes(g.id)) continue;
    if (s9.age >= g.age) return g;
  }
  return null;
}

/* 关口卡：三个选项 + 检验结果 */
function g14Card(g) {
  return {
    kind: 'gate',
    gate: g,
    title: g.name,
    text: g14Text(g),
    ask: '',
    actions: g.choice.map((c, i) => ({
      id: 'g_' + i,
      name: c.t,
      desc: c.d,
      hint: c.h,
      effort: 0,
      gateEff: c.e,
      gateFlag: c.flag || ''
    }))
  };
}

function g14Text(g) {
  const a = s9.age;
  const lines = {
    g7: `${a} 岁这年，村里来了个先生，在祠堂开蒙。一年三百文束脩，管一顿晌午饭。家里没人说话，都在看你。`,
    g13: `${a} 岁，你个子蹿了一截。家里有事的时候，他们开始背着你说话，也可能只是你多想了。`,
    g18: `${a} 岁。同龄的人有的走了，有的定了亲。你还没有决定。那天早上你在门口站了很久，天很冷。`,
    g25: `${a} 岁。媒人来过三次。母亲问你的意思，你说不上来。`,
    g30: `${a} 岁。你干了十年活。有一天你忽然想：如果明天干不动了，还剩什么。`,
    g40: `${a} 岁。这一年家里有人走了。你站在灵前，想起很多年前的一件小事。`,
    g50: `${a} 岁。孩子长大了。他有些事不跟你说，你也不问。`,
    g60: `${a} 岁。你开始算还剩多少年。`,
    g68: `${a} 岁。`
  };
  return lines[g.id] || `${a} 岁。这一年有一件事，你得做个决定。`;
}

/* 应用关口结果 */
function g14Apply(g, idx) {
  const c = g.choice[idx];
  if (!c) return null;
  const e = c.e || {};
  const notes = [];

  if (e.body) { s9.body = Math.max(1, Math.min(100, s9.body + e.body)); notes.push({ k: '身', v: e.body, c: e.body > 0 ? 'good' : 'bad' }); }
  if (e.heart) { s9.heart = Math.max(0, Math.min(100, s9.heart + e.heart)); notes.push({ k: '心', v: e.heart, c: e.heart > 0 ? 'good' : 'bad' }); }
  if (e.hand) { s9.hand = Math.max(1, Math.min(10, s9.hand + e.hand)); notes.push({ k: '手', v: e.hand, c: 'good' }); }
  if (e.coin) { s9.coin = Math.max(0, s9.coin + e.coin); notes.push({ k: '谷铢', v: e.coin, c: e.coin > 0 ? 'good' : 'bad' }); }
  if (e.grain) { s9.grain = Math.max(0, s9.grain + e.grain); notes.push({ k: '粮', v: e.grain, c: e.grain > 0 ? 'good' : 'bad' }); }
  if (e.married) s9.married = true;
  if (e.relFather) w10ApplyRel({ relFather: e.relFather });
  if (e.relMother) w10ApplyRel({ relMother: e.relMother });
  if (e.relSibling) w10ApplyRel({ relSibling: e.relSibling });

  if (c.flag) {
    s9.flags = s9.flags || {};
    s9.flags[c.flag] = true;
    if (c.flag === 'left') s9.flagLeft = true;
    if (c.flag === 'stayed') s9.flagStay = true;
  }

  s9.passed = s9.passed || [];
  if (!s9.passed.includes(g.id)) s9.passed.push(g.id);

  // 检验：这个关口过去之后，你是什么状态
  const ok = g.check();
  const outcome = ok ? g.pass : g.fail;
  if (outcome && outcome.eff) {
    if (outcome.eff.heart) s9.heart = Math.max(0, Math.min(100, s9.heart + outcome.eff.heart));
    if (outcome.eff.hand) s9.hand = Math.min(10, s9.hand + outcome.eff.hand);
    if (outcome.eff.body) s9.body = Math.max(1, Math.min(100, s9.body + outcome.eff.body));
    if (outcome.eff.coin) s9.coin = Math.max(0, s9.coin + outcome.eff.coin);
  }
  if (outcome && outcome.flag) {
    s9.flags = s9.flags || {};
    s9.flags[outcome.flag] = true;
  }

  return {
    title: g.name,
    choice: c.t,
    line: (outcome && outcome.text) || '',
    passed: ok,
    notes
  };
}

/* 人生小结：过了哪几关 */
function g14Summary() {
  const list = g14List();
  const passed = s9.passed || [];
  return list.filter(g => g.id !== 'g68').map(g => ({
    name: g.name, age: g.age, done: passed.includes(g.id)
  }));
}
