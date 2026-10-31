'use strict';

/* v19 · 商店
   每个世界一间铺子。卖的不是装备，是能让人多撑几天的东西。

   续命药 —— 一颗多活十年，价格每买一颗翻倍
   伤药   —— 补身子
   礼物   —— 送给某个人，关系会动
   借粮   —— 用钱换粮，或者用粮换钱
*/

const SHOP19 = {
  '穗骨原': {
    name: '鱼尾泽的船上铺子',
    keeper: '一个不开口的船家',
    line: '东西都在船上，要哪样自己指。',
    pill: { name: '续骨汤', desc: '一副多活十年。喝完身上会有一层白，洗不掉。' },
    heal: { name: '伤药', desc: '田里磕碰用的。' },
    gifts: [
      { name: '一块麦芽糖', cost: 40, rel: 5, why: '孩子都爱这个。' },
      { name: '一匹粗布', cost: 160, rel: 9, why: '做件冬衣，够穿三年。' },
      { name: '一对银耳环', cost: 420, rel: 15, why: '这地方的女人一辈子有一对就够。' }
    ]
  },
  '无昼京': {
    name: '灯油行的后门',
    keeper: '一个眼皮很厚的账房',
    line: '别在这儿站太久，人家看见要说闲话。',
    pill: { name: '整夜灯油', desc: '一小瓶，能换来十个整夜的光。光多，人就像多活了些。' },
    heal: { name: '灯芯草', desc: '烤了喝水，能缓一缓。' },
    gifts: [
      { name: '一截好灯芯', cost: 50, rel: 6, why: '好灯芯不易冒烟。' },
      { name: '遮光布', cost: 180, rel: 9, why: '夜里隔出一点自己的地方。' },
      { name: '一张多余的灯牌', cost: 460, rel: 15, why: '多一块牌，家里就多一个人能领光。' }
    ]
  },
  '借寿渡': {
    name: '纸寿巷的老摊',
    keeper: '一个糊纸人的老太太',
    line: '要什么，自己看。价钱写在纸角上。',
    pill: { name: '一张阳楮', desc: '替自己烧，或者替人烧。烧了就不一样了。' },
    heal: { name: '一包艾', desc: '煮水，熏一熏。' },
    gifts: [
      { name: '一对纸灯', cost: 45, rel: 5, why: '渡口的人信这个。' },
      { name: '一双布鞋', cost: 150, rel: 9, why: '走远路要一双好的。' },
      { name: '一张空契', cost: 400, rel: 14, why: '空契能写名字。这是重礼。' }
    ]
  },
  '钟葬群岛': {
    name: '静湾的盐铺',
    keeper: '一个手指有盐霜的女人',
    line: '买就买，别问钟的事。',
    pill: { name: '一口替钟', desc: '替你自己敲。敲一次，多活几年，少记一点事。' },
    heal: { name: '海盐袋', desc: '焐着伤口，能收一收。' },
    gifts: [
      { name: '一挂新网', cost: 60, rel: 6, why: '网破了要补，补不动就买。' },
      { name: '一罐盐', cost: 170, rel: 9, why: '这地方盐比米贵。' },
      { name: '一枚旧钟舌', cost: 450, rel: 15, why: '来路不正，但有人就想要。' }
    ]
  },
  '髓云都市': {
    name: '漂忆港的第九号摊',
    keeper: '一个眼睛很干净的年轻人',
    line: '瓶子都标了年份。要不要闻一下。',
    pill: { name: '一瓶髓云', desc: '纯净压制的记忆。喝下去，人会多活几年，也会少记几年。' },
    heal: { name: '淡化剂', desc: '把疼的那一段稀释掉。' },
    gifts: [
      { name: '一小瓶夏天', cost: 70, rel: 6, why: '闻一下会很暖。' },
      { name: '一张空白瓶签', cost: 190, rel: 10, why: '可以给自己的记忆取名。' },
      { name: '一段别人的童年', cost: 480, rel: 15, why: '来源不明。但很动人。' }
    ]
  },
  '星耒野': {
    name: '陨铁城的收货铺',
    keeper: '一个总在算账的伙计',
    line: '东西放这儿，价钱我按今天的算。',
    pill: { name: '一袋星糠', desc: '烧了能暖一冬。烧得越多，天越暗。' },
    heal: { name: '陨铁屑', desc: '和水服下，压一压星尘灼伤。' },
    gifts: [
      { name: '一株会发光的麦穗', cost: 50, rel: 5, why: '插在屋里，夜里也亮。' },
      { name: '一块陨铁', cost: 180, rel: 9, why: '冷房要用这个。' },
      { name: '一小袋老种', cost: 430, rel: 15, why: '不多了。给他就是给他明年。' }
    ]
  }
};

function sh19Init() {
  if (!s9.shop) s9.shop = { bought: 0, lastVisit: 0 };
}

/* 药价：每买一颗翻倍 */
function sh19PillPrice() {
  const base = 12000;
  sh19Init();
  return Math.round(base * Math.pow(1.8, s9.shop.bought));
}

function sh19Pill() {
  sh19Init();
  const s = SHOP19[s9.book];
  const price = sh19PillPrice();
  if (s9.coin < price) {
    const short = price - s9.coin;
    return { ok: false, line: `还差 ${short.toLocaleString()}。这不是几天能攒出来的。` };
  }
  s9.coin -= price;
  s9.shop.bought += 1;
  s9.deadline += 10;
  s9.body = Math.max(1, s9.body - 6);
  s9.threads = s9.threads || [];
  s9.threads.push({ text: `买过一次${s.pill.name}`, age: s9.age, open: true });
  s9Save();
  return { ok: true, line: `你把钱推过去。${s.keeper}数了一遍，把${s.pill.name}推回来。` };
}

function sh19Heal() {
  sh19Init();
  const s = SHOP19[s9.book];
  const cost = 120;
  if (s9.coin < cost) return { ok: false, line: '钱不够。' };
  s9.coin -= cost;
  s9.body = Math.min(100, s9.body + 14);
  s9Save();
  return { ok: true, line: `你把${s.heal.name}拿回家。` };
}

function sh19Gift(idx, who) {
  sh19Init();
  const s = SHOP19[s9.book];
  const g = s.gifts[idx];
  if (!g) return { ok: false, line: '没有这样东西。' };
  if (s9.coin < g.cost) return { ok: false, line: `还差 ${g.cost - s9.coin}。` };
  s9.coin -= g.cost;
  const p = s9.family.find(x => x.id === who);
  if (p) { p.rel = Math.min(100, (p.rel || 50) + g.rel); }
  if (typeof w10ApplyRel === 'function' && who) {
    const map = { father: 'relFather', mother: 'relMother', sibling: 'relSibling', grandma: 'relGrandma', friend: 'relFriend' };
    if (map[who]) w10ApplyRel({ [map[who]]: Math.round(g.rel * 0.6) });
  }
  s9Save();
  return { ok: true, line: `你把${g.name}给了${p ? p.name : '他'}。他没说什么，收下了。` };
}

/* 借粮 / 卖粮 */
function sh19Grain(dir) {
  sh19Init();
  if (dir === 'buy') {
    const cost = 180, add = 3;
    if (s9.coin < cost) return { ok: false, line: '钱不够。' };
    s9.coin -= cost; s9.grain += add;
    return { ok: true, line: `买了 ${add} 石粮，钱少了 ${cost}。` };
  }
  const sell = 2;
  if (s9.grain < sell + 2) return { ok: false, line: '粮不够卖，家里还要吃。' };
  s9.grain -= sell;
  s9.coin += 150;
  return { ok: true, line: `卖了 ${sell} 石粮，得了 150。` };
}
