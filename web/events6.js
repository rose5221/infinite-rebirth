'use strict';

/* v6.2 — extra event generators.
   The local director only had ~10 shapes, so a long life started to feel like
   a loop. These add small, concrete, world-flavoured incidents, each with three
   genuinely different actions, plus follow-ups for threads left open earlier. */

function money6(n) { return Math.max(0, Math.round(n)); }

/* 1. something found */
function genFoundScene() {
  const L = worldLex(), r = Math.random;
  const shortGoods = L.goods.map(g => String(g).split(/[，。；]/)[0].slice(0, 10));
  const thing = pick(r, [].concat(shortGoods.length ? shortGoods : [], ['一只旧木匣', '半袋盐', '一枚磨平的铜片', '一件没做完的活', '一封信']));
  const who = pick(r, ['隔壁的老人', '一个跑腿的孩子', '守夜的人', '不认识的女人', '同行的伙计']);
  return scene6({
    mode: 'narration', arc: 'life',
    title: pick(r, ['捡到的东西', '谁丢的', '半个匣子', '路边', '不该在这里的东西']),
    opening: `${pick(r, ['集市散场以后', '天没亮的时候', '下过雨的午后', '收工回家的路上'])},你在${L.place}捡到${thing}。四下没人，${who}从远处看了一眼，又低下头去。${worldFlavor()}`,
    ask: '这东西怎么办？',
    days: rint(r, 3, 12),
    keepChoices: true,
    choices: [
      C('先收起来，谁也不说', '等弄清楚是谁的再说。', '得一件东西 · 心里不踏实', { coins: Math.round(30 + r() * 60), emotion: { 欲: 3, 惧: 2 }, tone: 'keep', thread: `捡到的${thing}还没找到主人` }),
      C('站在原地等失主', '丢了东西的人多半会回来找。', '费半天 · 可能结一份人情', { bond: 5, coins: -10, tone: 'wait', thread: '你在街上等过一个不认识的失主' }),
      C('交给管事的人', '让上面去认领，省得惹麻烦。', '名声+ · 东西留不住', { reputation: 4, tone: 'rule' })
    ]
  });
}

/* 2. a stranger asks for a night's shelter */
function genStrangerScene() {
  const L = worldLex(), r = Math.random;
  const name = pick(r, ['陆姓的行商', '一个背琴的女人', '自称画匠的男人', '赶考的书生', '带着孩子的妇人']);
  return scene6({
    mode: 'dialogue', arc: 'life',
    title: pick(r, ['借宿的人', '敲门', '一夜', '外乡人', '屋檐下']),
    opening: `夜里有人敲门。${name}站在门外，说路被封了，只想借一个能坐的地方到天亮。${L.risks[0] ? '最近的' + L.risks[0] + '让路上不太平。' : ''}家里人都在看你。`,
    ask: '你开不开门？',
    days: rint(r, 1, 4),
    keepChoices: true,
    choices: [
      C('让他进来，给一碗热的', '多一双筷子的事。', '可能得一条门路 · 有风险', { bond: 6, coins: -15, tone: 'warm', thread: '那个借宿的外乡人说过会回来' }),
      C('给点吃的，让他在檐下坐', '不进屋里，也不算见死不救。', '折中 · 两不相欠', { reputation: 2, coins: -5, tone: 'steady' }),
      C('关上门', '你不知道他是什么人。', '安全 · 半夜没睡好', { emotion: { 惧: 4, 恶: 2 }, tone: 'refuse' })
    ]
  });
}

/* 3. a small con / bad deal */
function genCheatScene() {
  const L = worldLex(), r = Math.random;
  const good = L.goods.length ? String(pick(r, L.goods)).split(/[，。；]/)[0].slice(0, 10) : '货';
  return scene6({
    mode: 'narration', arc: 'business',
    title: pick(r, ['缺斤少两', '一桩好买卖', '秤', '熟人介绍', '付了定钱']),
    opening: `有人找上门，说有一批便宜的${good}，只要先付定钱。介绍人是${pick(r, ['街口的熟人', '你帮过的那个人', '铺子里的老客'])}，说话时一直没看你的眼睛。${worldFlavor()}`,
    ask: '这笔定钱付不付？',
    days: rint(r, 5, 20),
    keepChoices: true,
    choices: [
      C('先验货，再付钱', '宁可慢，别把本钱折进去。', '稳妥 · 可能错过', { stats: { 智识: 1 }, tone: 'ask' }),
      C('付定钱，赌这批货', '便宜不常有。', '可能大赚 · 可能被骗', { coins: -Math.min(state.coins, 120), tone: 'gamble', thread: '那批便宜货的定钱还没着落' }),
      C('把这事告诉同行', '让大家都知道有这么个人。', '名声+ · 得罪人', { reputation: 4, tone: 'witness' })
    ]
  });
}

/* 4. weather / disaster beat */
function genWeatherScene() {
  const L = worldLex(), r = Math.random;
  const bySeason = {
    '初春': ['连下了七天雨', '一场倒春寒', '河里的水涨上了岸'],
    '暮春': ['连着几场大雨', '一场大风', '河里的水涨上了岸'],
    '盛夏': ['日头毒得人不敢出门', '一场暴雨淹了半条街', '夜里闷得睡不着'],
    '初秋': ['霜来得比往年早', '一场大风', '连日阴雨，粮晒不干'],
    '深秋': ['霜来得比往年早', '一场大风', '河里的水涨上了岸'],
    '初冬': ['雪压塌了西边的棚', '一场大雪封了路', '井水结了一层薄冰']
  };
  const season = (L.season && bySeason[L.season]) ? L.season : '初春';
  const w = pick(r, bySeason[season]);
  return scene6({
    mode: 'montage', arc: 'crisis',
    title: pick(r, ['天时', '连着七天', '这一季', '屋顶', '水退了以后']),
    opening: `${w}。${L.place}的人都在抢着收拾。${L.daily}`,
    ask: '这几天你怎么过？',
    days: rint(r, 7, 40),
    keepChoices: true,
    choices: [
      C('先抢自家的东西', '别人的事顾不上。', '保住家当 · 邻里看在眼里', { coins: 20, reputation: -2, tone: 'protect' }),
      C('帮邻里一起扛', '人多才扛得住。', '声望+ · 自己受损', { reputation: 7, coins: -40, health: -4, tone: 'brave' }),
      C('趁乱收一批便宜货', '别人急着卖，你不急。', '钱+ · 名声-', { coins: 90, reputation: -6, tone: 'profit' })
    ]
  });
}

/* 5. a child's question / family beat at any age */
function genKinshipScene() {
  const L = worldLex(), r = Math.random;
  const kid = state.children ? `你的孩子` : '邻居家的孩子';
  return scene6({
    mode: 'dialogue', arc: 'parent',
    title: pick(r, ['问一个问题', '孩子的眼睛', '为什么', '你小时候']),
    opening: `${kid}问你：${pick(r, ['人为什么会死', '我们家为什么这么穷', '你小时候怕什么', '外面是什么样子', '你是不是也做错过事'])}。你张了张嘴，发现自己没有现成的答案。`,
    ask: '你怎么回答？',
    days: rint(r, 2, 8),
    keepChoices: true,
    choices: [
      C('老实说：我也不知道', '不糊弄一个认真问问题的人。', '亲近+ · 孩子会记很久', { bond: 7, emotion: { 爱: 4 }, tone: 'honest' }),
      C('编一个能让他安心的答案', '有些真话说早了没用。', '安稳 · 以后要圆回来', { bond: 4, emotion: { 哀: 2 }, tone: 'avoid' }),
      C('把问题推回去，让他自己想', '答案要自己找。', '孩子早熟 · 亲近-', { bond: -3, stats: { 智识: 1 }, tone: 'teach' })
    ]
  });
}

/* 6. an old friend wants to borrow money */
function genBorrowScene() {
  const L = worldLex(), r = Math.random;
  ensureSocial();
  const pool = (state.relationships || []).filter(x => !x.family);
  const p = pool.length ? pick(r, pool) : null;
  if (!p) return genSocialScene();
  const sum = Math.max(40, Math.min(state.coins, 60 + Math.floor(r() * 200)));
  return scene6({
    mode: 'dialogue', arc: 'relation', npcId: p.id, npcName: p.name, npcRole: p.role,
    title: pick(r, ['开口借钱', '一笔旧账', '他张了张嘴', '朋友有难']),
    opening: `${p.name}来找你，绕了很久才说出口：想借${sum}${L.currency}，过两个月就还。${p.trait} 你知道对方不是随便开口的人，也知道这钱多半回不来。`,
    ask: '借不借？',
    days: rint(r, 2, 10),
    keepChoices: true,
    choices: [
      C('借，不用写凭据', '朋友值这个价。', '钱- · 关系+', { coins: -sum, bond: 10, tone: 'warm', thread: `${p.name}欠你${sum}${L.currency}` }),
      C('借，但要写清楚', '情分归情分，账归账。', '钱可能回来 · 对方有点难堪', { coins: -sum, bond: 4, reputation: 2, tone: 'rule', thread: `${p.name}欠你${sum}${L.currency}，写了凭据` }),
      C('不借，说清自己的难处', '你也有要养的人。', '钱保住 · 关系受损', { bond: -6, emotion: { 恶: 2, 哀: 3 }, tone: 'refuse' })
    ]
  });
}

/* 7. craft / study beat */
function genCraftScene() {
  const L = worldLex(), r = Math.random;
  const shortGoods2 = L.goods.map(g => String(g).split(/[，。；]/)[0].slice(0, 10));
  const craft = pick(r, [].concat(shortGoods2.length ? shortGoods2 : [], ['旧手艺', '记账', '看天', '修补']));
  return scene6({
    mode: 'narration', arc: 'work',
    title: pick(r, ['手上的活', '师傅', '学不下去', '慢工', '第一件成品']),
    opening: `你跟着人学${craft}。学到第三个月，师傅让你独立做一件。做坏了要自己赔料钱，做好了算是出师的第一步。${worldFlavor()}`,
    ask: '这一件怎么做？',
    days: rint(r, 20, 80),
    keepChoices: true,
    choices: [
      C('照师傅的规矩，一步一步来', '慢，但不会错。', '手艺稳 · 出师晚', { stats: { 智识: 1 }, coins: -10, tone: 'obey', thread: '你还没做出自己的第一件成品' }),
      C('按自己的想法改一改', '规矩是死的，东西是活的。', '可能出彩 · 可能赔料', { stats: { 机缘: 1 }, coins: -20, tone: 'rebel' }),
      C('先做一件最普通的交差', '不求好，只求过。', '省心 · 师傅失望', { reputation: -1, coins: 15, tone: 'steady' })
    ]
  });
}

/* 8. a rumour about you */
function genRumorScene() {
  const L = worldLex(), r = Math.random;
  const what = pick(r, ['说你攀了高枝', '说你欠钱不还', '说你家里的事不干净', '说你要走', '说你抢了别人的活']);
  return scene6({
    mode: 'dialogue', arc: 'relation',
    title: pick(r, ['传言', '有人这样说', '街上的话', '解释不清']),
    opening: `${what}。话是从${pick(r, ['隔壁铺子', '族里的长辈', '一起干活的人', '一个不熟的邻居'])}那边传出来的，等你听见时已经变了三遍。`,
    ask: '你怎么处置？',
    days: rint(r, 4, 20),
    keepChoices: true,
    choices: [
      C('挨个去解释', '能说清一个是一个。', '费时 · 声望+', { reputation: 5, coins: -10, tone: 'honest' }),
      C('不理，照旧过日子', '越解释越像真的。', '声望- · 心里堵', { reputation: -4, emotion: { 怒: 4 }, tone: 'defy' }),
      C('找传话的人当面对质', '不能让它烂在暗处。', '可能澄清 · 可能结怨', { reputation: 2, health: -2, tone: 'brave', thread: '你和传话的人把话说僵了' })
    ]
  });
}

/* 9. a night dream / memory echo (cross-life flavour) */
function genDreamScene() {
  const L = worldLex(), r = Math.random;
  const echo = (typeof meta !== 'undefined' && meta.soul && meta.soul.kept && meta.soul.kept.length) ? meta.soul.kept[0] : null;
  const line = echo ? `梦里有一件你从没经历过的事：${String(echo.title || '').slice(0, 16)}。醒来时枕头是湿的。` : `你梦见自己站在一个不认识的街上，街名却念得出来。醒来时天还没亮。`;
  return scene6({
    mode: 'montage', arc: 'life',
    title: pick(r, ['梦', '醒得早', '不认识的街', '枕头上']),
    opening: `${line}${worldFlavor()}`,
    ask: '这梦你打算怎么办？',
    days: rint(r, 1, 5),
    keepChoices: true,
    choices: [
      C('说给家里人听', '有些事说出来就不吓人了。', '亲近+ · 被当成胡话', { bond: 5, emotion: { 惧: -3 }, tone: 'warm' }),
      C('自己记下来', '写下来，说不定哪天用得上。', '记忆+ · 花时间', { stats: { 智识: 1 }, emotion: { 哀: 2 }, tone: 'learn' }),
      C('不想它，照常出门', '梦不能当饭吃。', '平静 · 心里留了个疙瘩', { health: 2, emotion: { 惧: 2 }, tone: 'defy' })
    ]
  });
}

/* 10. a public scene: festival / execution / market day */
function genPublicScene() {
  const L = worldLex(), r = Math.random;
  const event = pick(r, ['一年一次的集市', '族里祭祖', '官府贴了告示', '有人在街口被押着走', '一户人家办喜事']);
  return scene6({
    mode: 'narration', arc: 'life',
    title: pick(r, ['街口', '这一天', '人多的地方', '告示', '热闹']),
    opening: `${event}，${L.place}挤满了人。${L.belief || L.daily} 你被挤在中间，前面的人忽然回过头来看你。`,
    ask: '你往前挤，还是往外走？',
    days: rint(r, 1, 3),
    keepChoices: true,
    choices: [
      C('挤到前面去看清楚', '有些事错过就再也不知道了。', '见识+ · 有风险', { stats: { 机缘: 1 }, health: -2, tone: 'brave' }),
      C('退到外围，先看清局势', '热闹里最容易出事。', '安全 · 少知道一点', { emotion: { 惧: 2 }, tone: 'protect' }),
      C('趁人多做点生意', '人聚起来就是钱。', '钱+ · 可能被驱赶', { coins: 55, reputation: -1, tone: 'profit' })
    ]
  });
}

/* registry used by the local director */
const EXTRA_GENS6 = [
  { name: 'found', fn: genFoundScene, w: 5, when: () => age() >= 6 },
  { name: 'stranger', fn: genStrangerScene, w: 4, when: () => age() >= 10 },
  { name: 'cheat', fn: genCheatScene, w: 3, when: () => age() >= 16 },
  { name: 'weather', fn: genWeatherScene, w: 4, when: () => age() >= 5 },
  { name: 'kinship', fn: genKinshipScene, w: 4, when: () => age() >= 14 },
  { name: 'borrow', fn: genBorrowScene, w: 3, when: () => age() >= 15 },
  { name: 'craft', fn: genCraftScene, w: 4, when: () => age() >= 9 && age() <= 45 },
  { name: 'rumor', fn: genRumorScene, w: 3, when: () => age() >= 11 },
  { name: 'dream', fn: genDreamScene, w: 3, when: () => age() >= 7 },
  { name: 'public', fn: genPublicScene, w: 4, when: () => age() >= 6 },
  { name: 'rare', fn: genRareScene, w: 1, when: () => age() >= 8 },
  { name: 'rival', fn: genRivalScene, w: 3, when: () => age() >= 16 }
];

/* a thread planted by an earlier choice comes back */
function threadScene6(th) {
  const L = worldLex(), r = Math.random;
  const t = th.text || '一件没说完的事';
  const open = [
    () => `${t}。这件事你以为已经过去了，今天却有人重新提起。`,
    () => `那天的事还是找上来了：${t}。${L.place}的人都在等你怎么说。`,
    () => `${t}。你原以为时间会把它冲淡，结果它只是在等一个更合适的时机。`
  ];
  const s = scene6({
    mode: 'narration', arc: 'life',
    title: pick(r, ['旧事', '还没完', '找上门来', '当初那件事', '说清楚']),
    opening: pick(r, open)() + worldFlavor(),
    keepTitle: true,
    ask: '这次你怎么处理？',
    days: rint(r, 5, 30),
    keepChoices: true,
    choices: [
      C('把这件事彻底了结', '该还的还，该说的说。', '花代价 · 心里干净', { coins: -Math.min(state.coins, 90), emotion: { 惧: -4 }, tone: 'honest', thread: '' }),
      C('再拖一拖', '现在不是时候。', '暂时躲开 · 还会回来', { emotion: { 惧: 3 }, tone: 'avoid', thread: t }),
      C('反过来利用这件事', '既然躲不掉，就拿它换点东西。', '可能得利 · 名声受损', { coins: 70, reputation: -5, tone: 'profit' })
    ]
  });
  th.open = false;
  th.scene = s.title;
  return s;
}

/* 11. a rare wonder — the world's own strangeness, once in a while */
function genRareScene() {
  const L = worldLex(), r = Math.random;
  const omens = [
    () => `半夜，${L.place}的灯全灭了。只有你还醒着，看见巷子尽头有个人在等，看不清脸。`,
    () => `有人在河边捞上来一件不该在那里的东西，用布包着，交到你手里，说：你拿着比我们拿着安全。`,
    () => `你连续三夜做同一个梦。第四天，梦里出现的那扇门，真的在${L.place}的墙上。`,
    () => `一个陌生人叫出你的名字，说他知道你以后会遇见什么，只肯说一句：别在那一天出门。`,
    () => `${L.name}下了一场不该下的雨。雨停以后，地上留着一行字，第二天就没了。`
  ];
  const text = pick(r, omens)();
  return scene6({
    mode: 'narration', arc: 'life',
    title: pick(r, ['不该有的东西', '半夜', '那个人', '一行字', '门']),
    opening: text + ' ' + worldFlavor(),
    ask: '你怎么办？',
    days: rint(r, 3, 20),
    keepChoices: true,
    weight: 2,
    choices: [
      C('按对方说的做，什么也不问', '有些事知道了反而麻烦。', '避祸 · 错过', { emotion: { 惧: -4 }, stats: { 机缘: 1 }, tone: 'obey' }),
      C('追上去，问个明白', '你不能带着一个谜过一辈子。', '可能得真相 · 可能出事', { health: -5, importance: 6, stats: { 智识: 1 }, tone: 'brave', thread: '你追过那个不该存在的人' }),
      C('把这件事告诉别人', '一个人扛不住，也不想一个人扛。', '声望± · 被当成疯子', { reputation: 3, emotion: { 惧: -2, 哀: 2 }, tone: 'witness' })
    ]
  });
}

/* 12. a rival — a named person who keeps coming back */
function genRivalScene() {
  const L = worldLex(), r = Math.random;
  ensureSocial();
  let rival = (state.relationships || []).find(x => x.rival);
  if (!rival) {
    if (age() < 16) return genSocialScene();
    const names = ['程砺', '裴七', '邵九', '何三', '温策', '屠岸'];
    const name = pick(r, names);
    rival = {
      id: 'rival_' + Date.now(), name, role: pick(r, ['同行', '对门的掌柜', '同僚', '同门']),
      trait: '处处比你快半步，笑起来却像没把你放在眼里。',
      desire: '想证明自己比你更配得上这个地方。',
      affinity: 8, trust: 4, romance: false, history: [], rival: true, lastSceneKey: 0
    };
    state.relationships.push(rival);
    state.relationNote = `${name}出现了。${rival.trait}`;
  }
  const act = pick(r, [
    `抢先一步把你谈好的生意截了。`,
    `在众人面前把你的短处说了一遍，说得不算错。`,
    `托人带话，说想跟你合伙。`,
    `落魄了，站在你门口，没有开口。`
  ]);
  return scene6({
    mode: 'dialogue', arc: 'relation', npcId: rival.id, npcName: rival.name, npcRole: rival.role,
    title: pick(r, ['对门的人', '快半步', '同行', '他也来了', '门口站着的人']),
    opening: `${rival.name}${act}${rival.trait}`,
    ask: '你怎么应对？',
    days: rint(r, 5, 40),
    keepChoices: true,
    choices: [
      C('跟他正面争一次', '把话挑明，输赢都认。', '声望+ · 结怨', { reputation: 5, health: -3, tone: 'brave', thread: `你和${rival.name}当众争过一次` }),
      C('不接招，做自己的事', '把力气用在活上。', '省心 · 他更来劲', { stats: { 智识: 1 }, tone: 'ignore' }),
      C('先伸手，把关系转过来', '多一个对头不如多一条路。', '关系可能翻转 · 有风险', { bond: 6, coins: -30, tone: 'warm', thread: `你和${rival.name}之间还没算清` })
    ]
  });
}
