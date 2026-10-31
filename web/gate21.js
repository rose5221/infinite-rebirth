'use strict';

/* v21 · 关口变体池
   每一道关口都有 5 种以上变体，按本局种子抽一个。
   同一部作品，两局到 13 岁遇到的事完全不同。

   另外：每部有自己的专属变体，不再六部共用一套台词。 */

/* ---------- 7 岁：识不识字 ---------- */
const G7_POOL = [
  { id: 'g7a', name: '先生来了',
    text: '村里来了个先生，在祠堂开蒙。一年三百文束脩，管一顿晌午饭。家里没人说话，都在看你。',
    c: [['求家里让你读', '一年三百文。', '钱-300 · 手+0.6', { coin: -300, heart: 4, hand: 0.6, body: -1 }, '']] },
  { id: 'g7b', name: '一本旧书',
    text: '你在柴堆底下翻出一本泡过水的书，字都糊了。你拿着去问人，问了三个人，只有一个肯看一眼。',
    c: [['天天去问他', '问一次一个字。', '手+0.5 · 体-3', { hand: 0.5, body: -3, heart: 3 }, '']] },
  { id: 'g7c', name: '姐姐的课本',
    text: '姐姐上了两年学就回来了，课本留在箱底。你翻出来，一个字一个字照着描，描坏了三张纸。',
    c: [['把她的书要过来', '她还没说不给。', '手+0.4 · 关系+4', { hand: 0.4, relSibling: 4 }, '']] },
  { id: 'g7d', name: '算工分',
    text: '队里派你去看秤。管秤的老头说：会写数的来。你站在那儿，第一次觉得不会写字是件麻烦事。',
    c: [['求他教你写数字', '他不太愿意。', '手+0.3 · 人情', { hand: 0.3, heart: 2 }, '']] },
  { id: 'g7e', name: '名字',
    text: '有人问你叫什么。你说了一遍，他写下来给你看——那是你第一次看见自己的名字。',
    c: [['把那三个字记住', '照着描了一下午。', '手+0.4 · 心+3', { hand: 0.4, heart: 3 }, '']] }
];

/* ---------- 13 岁：你在这个家的位置（核心修复） ---------- */
const G13_POOL = [
  { id: 'g13a', name: '背着你说话',
    text: '你个子蹿了一截。家里有事的时候，他们开始背着你说话。也可能只是你多想了。',
    c: [['推门进去听', '不管他们要说什么。', '关系-4 · 心-3', { relFather: -4, heart: -3 }, ''],
        ['去问母亲', '当面问。', '心+2 · 她不说', { heart: 2 }, ''],
        ['装作没注意', '回屋去。', '心-4', { heart: -4 }, '']] },
  { id: 'g13b', name: '上工',
    text: '队里给你派了正式的活，不再是打杂。工钱按半个人的算。你娘说：你也算能顶事了。',
    c: [['把活接下来', '从天亮干到天黑。', '钱+180 · 体-6', { coin: 180, body: -6, heart: 4 }, ''],
        ['说自己还小', '再等两年。', '心-3 · 关系-2', { heart: -3, relFather: -2 }, ''],
        ['只接半天', '剩下半天自己用。', '钱+90 · 手+0.2', { coin: 90, hand: 0.2 }, '']] },
  { id: 'g13c', name: '挨打',
    text: '你闯了祸——不算大，但足够让你爹当着外人骂了你一顿。他没动手，那比动手更难受。',
    c: [['当场顶回去', '当着所有人的面。', '名声-4 · 心+5', { heart: 5, relFather: -6 }, ''],
        ['认了，回家再说', '一句话不辩。', '关系+3 · 心-3', { relFather: 3, heart: -3 }, ''],
        ['跑出去半夜才回', '让他们找。', '心-2 · 关系-4', { heart: -2, relFather: -4 }, '']] },
  { id: 'g13d', name: '第一个朋友',
    text: '你跟一个同龄人熟了。你们一起下田、一起偷懒、一起被骂。你第一次觉得，家里之外还有别的人。',
    c: [['把他带回家', '让家里人认识。', '关系+4 · 心+4', { heart: 4, relFather: 2 }, ''],
        ['只在外头玩', '家里是家里的事。', '心+3', { heart: 3 }, ''],
        ['跟他去做一件不该做的事', '比如偷人家果园。', '心+6 · 风险', { heart: 6, reputation: -3 }, '']] },
  { id: 'g13e', name: '身体',
    text: '你开始长得比母亲高了。有天她抬手要摸你的头，摸到一半收回去，说：都这么高了。',
    c: [['低头让她摸', '像小时候那样。', '心+5 · 关系+5', { heart: 5, relMother: 5 }, ''],
        ['躲开', '不好意思。', '心-2', { heart: -2 }, ''],
        ['自己蹲下来一点', '让她摸得着。', '心+3 · 关系+6', { heart: 3, relMother: 6 }, '']] },
  { id: 'g13f', name: '一次死',
    text: '村里死了人。不是亲人，是你认识的、说过话的人。你第一次看见一个人从站着到躺着。',
    c: [['跟着送葬', '走完全程。', '心-3 · 懂事', { heart: -3, hand: 0.1 }, ''],
        ['不去', '心里发怵。', '心-5', { heart: -5 }, ''],
        ['一个人去看坟', '等人散了才去。', '心+2 · 想通一点', { heart: 2 }, '']] },
  { id: 'g13g', name: '一只手',
    text: '你伤了手——割的、砸的、烧的，看你干什么活。不重，但那几天你什么都干不了。',
    c: [['忍过去', '不吭声。', '体-4 · 心+2', { body: -4, heart: 2 }, ''],
        ['让家里照顾', '难得被照顾一次。', '心+5 · 关系+3', { heart: 5, relMother: 3 }, ''],
        ['自己找药敷', '翻箱倒柜。', '体+2 · 手+0.1', { body: 2, hand: 0.1 }, '']] }
];

/* ---------- 18 岁：走还是留 ---------- */
const G18_POOL = [
  { id: 'g18a', name: '走，还是留',
    text: '同龄的人有的走了，有的定了亲。你还没有决定。那天早上你在门口站了很久，天很冷。',
    c: [['走', '背一个包，天亮前出门。', '钱+400 · 关系-15', { coin: 400, relFather: -8, relMother: -8, heart: 6 }, 'left'],
        ['留', '这里需要人。', '关系+10 · 心-3', { relFather: 10, relMother: 10, heart: -3 }, 'stayed'],
        ['先去一趟再回来', '看看外面。', '钱-100 · 心+3', { coin: -100, heart: 3, hand: 0.3 }, '']] },
  { id: 'g18b', name: '招人的车',
    text: '城里的车来招工，一天五十文，管住。车上坐满了跟你差不多大的人。他们在等你上来。',
    c: [['上车', '不等了。', '钱+300 · 关系-10', { coin: 300, relFather: -6, heart: 5 }, 'left'],
        ['不上，留下', '家里走不开。', '关系+8', { relFather: 8, relMother: 6 }, 'stayed'],
        ['记下车去的地方', '以后也许用得上。', '心+2 · 手+0.1', { heart: 2, hand: 0.1 }, '']] },
  { id: 'g18c', name: '一门亲事',
    text: '有人来说亲。对方你见过，说不上讨厌也说不上喜欢。母亲问你的意思，问得很轻。',
    c: [['答应', '这事就这么定了。', '心+5 · 身不由己', { coin: -400, heart: 5, married: true }, ''],
        ['不答应', '还想再看看。', '心-2 · 关系-3', { heart: -2, relMother: -3 }, ''],
        ['说再等两年', '拖一拖。', '心+1', { heart: 1 }, '']] },
  { id: 'g18d', name: '一场大火',
    text: '夜里有人喊救火。你冲出去的时候，半条街已经红了。你不知道自家会不会烧到。',
    c: [['先抢自己家的东西', '顾不上别人的。', '钱+50 · 名声-3', { coin: 50, reputation: -3 }, ''],
        ['去帮邻居', '别人家先烧起来了。', '名声+8 · 体-8', { reputation: 8, body: -8, heart: 4 }, ''],
        ['站在外头看', '不敢进去。', '心-4', { heart: -4 }, '']] },
  { id: 'g18e', name: '一个手艺',
    text: '有人愿意教你一门手艺，但要跟着走三年，三年里挣的钱都归师傅。',
    c: [['跟他走', '三年换一辈子。', '手+1.2 · 关系-8', { hand: 1.2, relFather: -4, heart: 3 }, 'left'],
        ['不去了', '三年太长。', '心-2', { heart: -2 }, ''],
        ['问能不能只学一年', '讲讲价。', '手+0.5 · 人情-2', { hand: 0.5 }, '']] }
];

/* ---------- 25 岁：成不成家 ---------- */
const G25_POOL = [
  { id: 'g25a', name: '成不成家',
    text: '媒人来过三次。母亲问你的意思，你说不上来。',
    c: [['说一门亲', '托媒人，摆六桌。', '钱-600 · 家里多一口', { coin: -600, heart: 8, married: true }, ''],
        ['再等等', '还没那个心思。', '心-2', { heart: -2 }, ''],
        ['自己找', '不想让媒人决定。', '心+4 · 钱-100', { heart: 4, coin: -100 }, '']] },
  { id: 'g25b', name: '一个人过得下去',
    text: '你一个人过了一段日子，发现也还行。有天夜里下雨，屋里只有你一个人，你听着雨，没觉得难过。',
    c: [['就这么过', '不找了。', '心+3 · 名声-2', { heart: 3 }, 'alone'],
        ['还是想找个人', '一个人终究是冷。', '心+4', { heart: 4 }, ''],
        ['养一条狗', '先有个伴。', '心+5 · 钱-30', { heart: 5, coin: -30 }, '']] },
  { id: 'g25c', name: '有人等你',
    text: '有个人一直在等你开口。你知道，对方也知道你知道。这话谁先说都一样，但谁也不说。',
    c: [['先说', '不再等了。', '心+8 · 成家', { heart: 8, coin: -300, married: true }, ''],
        ['继续等', '怕说错了。', '心-4', { heart: -4 }, ''],
        ['走开', '不想耽误人家。', '心-6 · 关系-8', { heart: -6 }, '']] },
  { id: 'g25d', name: '家里催得紧',
    text: '家里开始催了。不是一天两天，是每天。母亲说：你再不办，别人就该说闲话了。',
    c: [['依了他们', '省事。', '心-3 · 成家', { heart: -3, coin: -500, married: true }, ''],
        ['跟他们吵一次', '把话说清楚。', '心+5 · 关系-8', { heart: 5, relMother: -8 }, ''],
        ['嘴上答应，实际上拖着', '两头糊弄。', '心-2', { heart: -2 }, '']] }
];

/* ---------- 30 岁：营生立没立住 ---------- */
const G30_POOL = [
  { id: 'g30a', name: '营生立没立住',
    text: '你干了十年活。有一天你忽然想：如果明天干不动了，还剩什么。',
    c: [['把手艺做精', '推掉别的活。', '手+0.8 · 钱-200', { hand: 0.8, coin: -200, heart: 3 }, ''],
        ['什么都接', '有活就干。', '钱+400 · 体-6', { coin: 400, body: -6 }, ''],
        ['自己开一间', '自己给自己干。', '钱-800 · 往后有进项', { coin: -800, heart: 5 }, 'shop']] },
  { id: 'g30b', name: '一个更好的活',
    text: '有个更好的活找上门，要搬到别处去干。比现在挣得多，但要离开这条街。',
    c: [['去', '人往高处走。', '钱+600 · 关系-10', { coin: 600, relFather: -6, heart: 3 }, 'left'],
        ['不去', '这里有我认得的人。', '关系+8 · 心+3', { relFather: 6, heart: 3 }, ''],
        ['先去试试，一个月再说', '骑墙。', '钱+200 · 心-2', { coin: 200, heart: -2 }, '']] },
  { id: 'g30c', name: '带徒弟',
    text: '有个半大孩子来找你，说想跟你学。你想起自己当年也是这样站在别人门口。',
    c: [['收下', '多一张嘴，多一双手。', '手+0.4 · 钱-100', { hand: 0.4, coin: -100, heart: 4 }, ''],
        ['不收', '自己都还没站稳。', '心-2', { heart: -2 }, ''],
        ['教一点，不算师徒', '先看看人。', '手+0.2 · 心+2', { hand: 0.2, heart: 2 }, '']] },
  { id: 'g30d', name: '一场病',
    text: '你病了一场，躺了半个月。这半个月里，活全停了，钱也停了。你第一次算自己还能撑几天。',
    c: [['咬牙起来干活', '不能停。', '钱+200 · 体-10', { coin: 200, body: -10 }, ''],
        ['把身体养好', '先活下来。', '体+10 · 钱-300', { body: 10, coin: -300 }, ''],
        ['把活分给别人', '少挣点。', '钱-150 · 关系+6', { coin: -150, heart: 3 }, '']] }
];

/* ---------- 40 岁：父母走时你在不在 ---------- */
const G40_POOL = [
  { id: 'g40a', name: '父母走时，你在不在',
    text: '有人来送信。你手里的活还没干完。',
    c: [['立刻放下活回去', '不管损失。', '心+6 · 钱-300', { heart: 6, coin: -300, relFather: 10, relMother: 10 }, ''],
        ['先把手上的活做完', '晚几天。', '钱+300 · 心-8', { coin: 300, heart: -8, relFather: -8 }, ''],
        ['赶不回来', '路太远。', '心-12', { heart: -12 }, 'absent']] },
  { id: 'g40b', name: '最后一句话',
    text: '躺在床上的人已经不太认人了。你坐在旁边，等一句话。他/她张了张嘴。',
    c: [['凑近去听', '怕听漏。', '心+4 · 记一辈子', { heart: 4 }, ''],
        ['握住手', '不听了，就这样。', '心+6', { heart: 6 }, ''],
        ['出去透口气', '待不住。', '心-8', { heart: -8 }, 'absent']] },
  { id: 'g40c', name: '一件旧衣',
    text: '收拾东西的时候，你翻出一件旧衣服。补过很多次，最后一次补的线还在。',
    c: [['留着', '不穿了，收起来。', '心+3', { heart: 3 }, ''],
        ['烧了', '按规矩。', '心-4', { heart: -4 }, ''],
        ['给孩子', '让他知道有这么个人。', '心+5 · 关系+4', { heart: 5 }, '']] }
];

/* ---------- 50 岁：孩子跟你亲不亲 ---------- */
const G50_POOL = [
  { id: 'g50a', name: '孩子跟你亲不亲',
    text: '孩子长大了。他有些事不跟你说，你也不问。',
    c: [['主动问一次', '哪怕他不说。', '心+6 · 关系+8', { heart: 6 }, ''],
        ['不问', '随他。', '心-5', { heart: -5 }, 'distant'],
        ['托人带句话', '不好意思当面说。', '心-2', { heart: -2 }, '']] },
  { id: 'g50b', name: '他要走',
    text: '孩子说要走，去别处。说的时候没看你，一直看着门口。',
    c: [['让他走', '不拦。', '心+2 · 关系+6', { heart: 2 }, ''],
        ['拦下来', '家里还要人。', '心-6 · 关系-10', { heart: -6 }, 'distant'],
        ['问他什么时候回来', '只问这一句。', '心+4', { heart: 4 }, '']] },
  { id: 'g50c', name: '一顿饭',
    text: '一家人难得坐在一起吃饭。孩子夹了一筷子菜给你，谁都没说话。',
    c: [['吃了', '什么也没说。', '心+6', { heart: 6 }, ''],
        ['也夹一筷子给他', '一来一回。', '心+8', { heart: 8 }, ''],
        ['说点什么', '比如"你小时候也这样"。', '心+4', { heart: 4 }, '']] }
];

/* ---------- 60 岁：身体还剩多少 ---------- */
const G60_POOL = [
  { id: 'g60a', name: '身体还剩多少',
    text: '你开始算还剩多少年。',
    c: [['把身子养回来', '少吃点苦。', '体+12 · 钱-200', { body: 12, coin: -200 }, ''],
        ['再拼两年', '趁还能动。', '钱+500 · 体-8', { coin: 500, body: -8 }, ''],
        ['就这样吧', '该来的来。', '心+3', { heart: 3 }, '']] },
  { id: 'g60b', name: '下不动了',
    text: '有一天你发现自己蹲下去起不来。不是疼，就是起不来。你扶着墙站了很久。',
    c: [['认了', '以后不蹲了。', '心+2 · 体-4', { heart: 2, body: -4 }, 'frail'],
        ['练', '每天练一次。', '体+8 · 心+3', { body: 8, heart: 3 }, ''],
        ['找人帮忙', '开口了。', '心-3 · 关系+5', { heart: -3 }, '']] },
  { id: 'g60c', name: '一个老友',
    text: '一个老朋友走了。你是最后一个知道他年轻时什么样的人。',
    c: [['去送', '走最后一段。', '心-3 · 关系+4', { heart: -3 }, ''],
        ['不去', '见不得。', '心-6', { heart: -6 }, ''],
        ['回来写下来', '怕以后忘了。', '心+3', { heart: 3 }, '']] }
];

const GATE_POOLS = {
  g7: G7_POOL, g13: G13_POOL, g18: G18_POOL,
  g25: G25_POOL, g30: G30_POOL, g40: G40_POOL,
  g50: G50_POOL, g60: G60_POOL
};

const GATE_AGES21 = [
  { id: 'g7', age: 7, check: () => s9.hand >= 1.4,
    pass: { text: '你认得自己的名字了。', eff: { hand: 0.4, heart: 4 } },
    fail: { text: '你到死只认得自己的名字。', eff: { heart: -5 }, flag: 'illiterate' } },
  { id: 'g13', age: 13, check: () => (s9.heart > 40 || s9.hand >= 2),
    pass: { text: '这个家开始把你当个人。', eff: { heart: 5 } },
    fail: { text: '这个家里没有人问你的意思。', eff: { heart: -7 }, flag: 'outsider' } },
  { id: 'g18', age: 18, check: () => !!(s9.flags && (s9.flags.left || s9.flags.stayed)),
    pass: { text: '你做了决定。', eff: {} },
    fail: { text: '你在门口站了半年，最后什么也没选。', eff: { heart: -4 } } },
  { id: 'g25', age: 25, check: () => !!s9.married,
    pass: { text: '你成了家。', eff: {} },
    fail: { text: '你没成家。以后也没成。', eff: { heart: -5 }, flag: 'alone' } },
  { id: 'g30', age: 30, check: () => s9.hand >= 3.2,
    pass: { text: '你有一门吃饭的本事。', eff: { coin: 200 } },
    fail: { text: '你什么都会一点，什么都不精。', eff: { heart: -4 }, flag: 'oddjobs' } },
  { id: 'g40', age: 40, check: () => true, pass: { text: '', eff: {} }, fail: { text: '', eff: {} } },
  { id: 'g50', age: 50, check: () => s9.hasChild && s9.heart > 45,
    pass: { text: '孩子愿意跟你说事。', eff: { heart: 5 } },
    fail: { text: '孩子有话不跟你说。', eff: { heart: -6 }, flag: 'distant' } },
  { id: 'g60', age: 60, check: () => s9.body >= 40,
    pass: { text: '你还走得动。', eff: {} },
    fail: { text: '你走两步就要歇。', eff: { body: -6 }, flag: 'frail' } }
];

/* ---------- 按种子抽变体 ---------- */
function g21Pick(poolId) {
  const pool = GATE_POOLS[poolId];
  if (!pool || !pool.length) return null;
  // 用本局种子 + 关口 id 派生，稳定但每局不同
  const key = poolId + ':' + (s9.seed || 1) + ':' + s9.book;
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) { h ^= key.charCodeAt(i); h = Math.imul(h, 16777619); }
  const idx = Math.abs(h) % pool.length;
  return pool[idx];
}

function g21List() { return GATE_AGES21; }

function g21Due() {
  for (const g of GATE_AGES21) {
    if (s9.passed && s9.passed.includes(g.id)) continue;
    if (s9.age >= g.age) return g;
  }
  return null;
}

function g21Card(g) {
  const v = g21Pick(g.id);
  if (!v) return null;
  return {
    kind: 'gate',
    gate: g,
    variant: v,
    title: v.name,
    text: v.text,
    ask: '',
    actions: v.c.map((c, i) => ({
      id: 'g_' + i, name: c[0], desc: c[1], hint: c[2],
      effort: 0, gateEff: c[3], gateFlag: c[4] || ''
    }))
  };
}

function g21Apply(g, variant, idx) {
  const c = variant.c[idx];
  if (!c) return null;
  const e = c[3] || {};
  const notes = [];

  if (e.body) { s9.body = Math.max(1, Math.min(100, s9.body + e.body)); notes.push({ k: '身', v: e.body, c: e.body > 0 ? 'good' : 'bad' }); }
  if (e.heart) { s9.heart = Math.max(0, Math.min(100, s9.heart + e.heart)); notes.push({ k: '心', v: e.heart, c: e.heart > 0 ? 'good' : 'bad' }); }
  if (e.hand) { s9.hand = Math.max(1, Math.min(10, s9.hand + e.hand)); notes.push({ k: '手', v: e.hand, c: 'good' }); }
  if (e.coin) { s9.coin = Math.max(0, s9.coin + e.coin); notes.push({ k: '钱', v: e.coin, c: e.coin > 0 ? 'good' : 'bad' }); }
  if (e.grain) { s9.grain = Math.max(0, s9.grain + e.grain); notes.push({ k: '粮', v: e.grain, c: e.grain > 0 ? 'good' : 'bad' }); }
  if (e.reputation) { s9.rep = Math.max(0, Math.min(30, (s9.rep || 0) + e.reputation)); }
  if (e.married) s9.married = true;
  if (e.relFather && typeof w10ApplyRel === 'function') w10ApplyRel({ relFather: e.relFather });
  if (e.relMother && typeof w10ApplyRel === 'function') w10ApplyRel({ relMother: e.relMother });
  if (e.relSibling && typeof w10ApplyRel === 'function') w10ApplyRel({ relSibling: e.relSibling });

  if (c[4]) {
    s9.flags = s9.flags || {};
    s9.flags[c[4]] = true;
    if (c[4] === 'left') s9.flagLeft = true;
    if (c[4] === 'stayed') s9.flagStay = true;
  }

  s9.passed = s9.passed || [];
  if (!s9.passed.includes(g.id)) s9.passed.push(g.id);

  const ok = g.check();
  const oc = ok ? g.pass : g.fail;
  if (oc && oc.eff) {
    if (oc.eff.heart) s9.heart = Math.max(0, Math.min(100, s9.heart + oc.eff.heart));
    if (oc.eff.hand) s9.hand = Math.min(10, s9.hand + oc.eff.hand);
    if (oc.eff.body) s9.body = Math.max(1, Math.min(100, s9.body + oc.eff.body));
    if (oc.eff.coin) s9.coin = Math.max(0, s9.coin + oc.eff.coin);
  }
  if (oc && oc.flag) { s9.flags = s9.flags || {}; s9.flags[oc.flag] = true; }

  return { title: variant.name, choice: c[0], line: (oc && oc.text) || '', passed: ok, notes };
}

function g21Summary() {
  return GATE_AGES21.map(g => {
    const v = g21Pick(g.id);
    return { name: g.name || (v && v.name) || '', age: g.age, done: (s9.passed || []).includes(g.id) };
  });
}
