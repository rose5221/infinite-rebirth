'use strict';

/* v6.1 — contextual choices.
   Instead of every scene reusing "obey / rebel / ask", each scene gets its own
   three options built from what is actually happening: the actor, the place,
   the object at stake and the local risk. */

const CTX_KEYWORDS = [
  { re: /药|病|伤|发热|咳|疼|医|寿|续命/, item: '药', kind: 'medicine' },
  { re: /账|债|钱|工钱|租|价|本钱|银|铢|票|币/, item: '钱', kind: 'money' },
  { re: /棺|丧|葬|死|尸|亡|钟|魂|碑/, item: '丧事', kind: 'death' },
  { re: /船|渡口|河水|井水|水路|涨潮|赶潮|桥/, item: '水', kind: 'water' },
  { re: /灯芯|灯油|一盏灯|剪芯|日门|雾晶灯/, item: '灯', kind: 'light' },
  { re: /镜|忆|记忆|梦|雾晶|档/, item: '记忆', kind: 'memory' },
  { re: /纸|甲|坊|匠|织|雷|丝/, item: '手艺', kind: 'craft' },
  { re: /田|谷|种|收|穗|糠|星/, item: '田', kind: 'land' },
  { re: /婚|嫁|娶|提亲|成亲|定亲|说亲|亲事|媒人|聘礼/, item: '婚事', kind: 'marriage' },
  { re: /官|役|税|征|封|禁|规矩|令/, item: '官面', kind: 'authority' },
  { re: /地图|驿|图外|上路|赶路|岔路|界外/, item: '路', kind: 'road' },
  { re: /尸|兽|怪|鬼|妖|怪物/, item: '东西', kind: 'creature' },
  { re: /借宿|外乡|赶考|书生|行商/, item: '客人', kind: 'stranger' },
  { re: /老了|手在抖|系鞋带|夜里咳嗽|不太对劲|病了|卧床/, item: '身子', kind: 'old' },
  { re: /传言|闲话|背后|说我们|解释/, item: '传言', kind: 'rumor' },
  { re: /集市|祭祖|告示|押着走|办喜事|人多/, item: '这一天', kind: 'ceremony' },
  { re: /梦|不认识的街|醒来/, item: '梦', kind: 'memory' }
];

function deriveContext(s) {
  const L = worldLex();
  // 只看事件本身：标题 + 开头的第一句。世界背景铺陈不该决定选项内容。
  const firstSent = String(s.opening || '').split(/[。！？]/)[0];
  const text = (s.title || '') + ' ' + firstSent + ' ' + (s.ask || '');
  let item = '这件事', kind = 'thing';
  for (const k of CTX_KEYWORDS) { if (k.re.test(text)) { item = k.item; kind = k.kind; break; } }
  const fam = (state.relationships || []).filter(x => x.family);
  const others = (state.relationships || []).filter(x => !x.family && !x.faction);
  const actor = s.npcName || (fam[0] ? fam[0].name : null) || (others[0] ? others[0].name : null) || '家里人';
  const actorRole = s.npcRole || (fam[0] ? fam[0].family : '家人');
  const place = s.location || L.place;
  const risk = (L.risks && L.risks[0]) || '这地方的事';
  const faction = (L.factions && L.factions[0]) || '管事的人';
  return { item, kind, actor, actorRole, place, risk, faction, L, money: state.coins || 0, age: age() };
}

/* each builder returns {label, hint, tone, payload} */
const PHRASE = {
  medicine: { inq: '先弄清楚这病该用什么药', pay: '先掏钱把药买齐', learn: '把药理弄明白', risk: '赌一副偏方' },
  money:    { inq: '先把这笔账查清楚', pay: '先把这笔账结清', learn: '学会记账和算利', risk: '赌一把行情' },
  death:    { inq: '先问清丧事的规矩', pay: '先出一份丧仪的钱', learn: '把丧仪的规矩学到手', risk: '接一桩别人不敢接的活' },
  water:    { inq: '先摸清水路和深浅', pay: '先付清船钱水钱', learn: '学会看水路', risk: '赌一次赶潮' },
  light:    { inq: '先弄清楚光的来处', pay: '先把灯油钱付了', learn: '学会修灯剪芯', risk: '偷一次光' },
  memory:   { inq: '先弄清这段记忆是谁的', pay: '花钱买下这段记忆', learn: '学会封忆的手艺', risk: '赌一次封忆' },
  craft:    { inq: '先看清这门手艺的门道', pay: '先垫钱买料', learn: '把这门手艺学透', risk: '接一单没人敢接的活' },
  land:     { inq: '先看清水土和天时', pay: '先付清这季的租', learn: '学会看地力', risk: '赌一季的收成' },
  marriage: { inq: '先问清两家的意思', pay: '先把聘礼凑齐', learn: '先弄清婚事的规矩', risk: '赌一次私定' },
  authority:{ inq: '先弄清官面上的规矩', pay: '先把该交的交了', learn: '学会和官面打交道', risk: '赌一次硬顶' },
  road:     { inq: '先问清这条路通向哪', pay: '先付清上路的盘缠', learn: '学会看图和认路', risk: '赌一条没走过的路' },
  creature: { inq: '先弄清那东西是什么', pay: '花钱请人一同去', learn: '学会对付它的法子', risk: '赌一次硬碰' },
  thing:    { inq: '先把这里的事弄清楚', pay: '先把该付的付了', learn: '把这里的门道学明白', risk: '赌一次' },
  animal:   { inq: '先弄清这东西的来路', pay: '花钱把它留下来', learn: '学会照料它', risk: '赌它不会伤人' },
  rumor:    { inq: '先去打听这话是谁说的', pay: '花钱买一个准信', learn: '学会分辨传言', risk: '赌这传言是真的' },
  game:     { inq: '先看清这局的规矩', pay: '先押一笔小的', learn: '把赌法摸透', risk: '赌一把大的' },
  ceremony: { inq: '先问清仪式的讲究', pay: '把该出的份子出了', learn: '把礼数学会', risk: '赌一次失礼' },
  stranger: { inq: '先问清这人是谁', pay: '花钱买个方便', learn: '学会看人', risk: '赌这人可信' },
  old:      { inq: '先问清他到底哪里不舒服', pay: '先请个大夫来看看', learn: '学会怎么照料老人', risk: '赌他还能撑过去' }
};
function ph(c, key, fallback) {
  const p = PHRASE[c.kind] || PHRASE.thing;
  return p[key] || fallback;
}
const DESC = {
  inform: c => `先别急着动手，把${c.item === '这件事' ? '这里的事' : c.item + '的事'}问清楚。`,
  help: c => c.actorRole && /父|母|手足|家人/.test(c.actorRole) ? `你搭把手，${c.actor}就不用一个人扛这个家。` : `你搭把手，${c.actor}就不用一个人扛。`,
  obey: c => `按${c.actor}的意思来，先不出错。`,
  sneak: c => `不告诉${c.actor}，自己先试一次。`,
  pay: c => `把该付的付了，少一份牵挂。`,
  borrow: c => `去${c.faction}那里开口，钱能拿到，人情也欠下。`,
  refuse: c => `这一次不点头，哪怕让对方不快。`,
  escape: c => `离开${c.place}，先避开风头。`,
  takeRisk: c => `趁别人还没反应过来，赌这一次。`,
  protect: c => `先把家里人护住，别的事以后再说。`,
  brave: c => `迎着${c.risk}出去，看看能做什么。`,
  study: c => `把${c.item === '这件事' ? '手上' : c.item}的门道学明白，慢一点也不怕。`,
  askElder: c => `与其自己猜，不如去问${c.actor}。`,
  trade: c => `拿${c.item}做一笔小买卖，赚赔都认。`,
  confess: c => `把心里的话对${c.actor}说明白。`,
  wait: c => `先陪着，不急着把关系定下来。`,
  distance: c => `退一步，先顾自己的日子。`,
  marry: c => `把以后的事定下来，一起过。`,
  child: c => `按自己希望被对待的方式，把孩子养大。`,
  childOld: c => `照自己小时候那一套来，好的坏的都传下去。`,
  health: c => `花钱把身体养回来，能拖一年是一年。`,
  defy: c => `不管它，该吃吃该喝喝。`,
  seek: c => `去打听续命药，看看这条路通不通。`,
  shop: c => `盘下一间小铺，多一条自己的营生。`,
  bargain: c => `跟${c.actor}一点点把价钱磨下来。`,
  report: c => `把这件事交到${c.faction}手里。`,
  hide: c => `先瞒下来，等它自己过去。`,
  gamble: c => `把手里的一点钱押上去。`,
  pray: c => `照${c.place}的老规矩做一遍。`,
  repair: c => `自己找工具，把它修回原样。`,
  escort: c => `陪${c.actor}走完这一段路。`,
  sell: c => `折价出手，先换一点现钱。`,
  collect: c => `上门去，把这笔账要回来。`,
  teach: c => `把这里面的门道教给${c.actor}。`,
  witness: c => `站出来，把看见的说清楚。`,
  keep: c => `把它收起来，不告诉任何人。`,
  tell: c => `跑去找大人，让能管的人来管。`,
  ignore: c => `不接话，低头做自己的事。`
};
const ARCH = {
  inform: c => ({ label: ph(c, 'inq', `先弄清楚${c.item}的来路`), hint: '打听 · 智识+', tone: 'ask', payload: { stats: { 智识: 1 }, tone: 'ask' } }),
  help: c => ({ label: `搭把手，别让${c.actor}一个人扛`, hint: '亲近+ · 自己受累', tone: 'help', payload: { bond: 5, health: -2, tone: 'warm' } }),
  carry: c => ({ label: `自己把这件事扛下来`, hint: '独自承担 · 身体吃亏', tone: 'carry', payload: { health: -4, reputation: 3, emotion: { 哀: 2 }, tone: 'carry' } }),
  obey: c => ({ label: `${c.actor}说的，就照做`, hint: '稳 · 家人信任+', tone: 'obey', payload: { bond: 4, tone: 'obey' } }),
  sneak: c => ({ label: `背着${c.actor}自己试一次`, hint: '胆量 · 风险+', tone: 'sneak', payload: { emotion: { 惧: 3, 欲: 2 }, tone: 'rebel' } }),
  pay: c => ({ label: ph(c, 'pay', `先把${c.item}的账结了`), hint: '花钱 · 麻烦少一半', tone: 'pay', payload: { coins: -Math.min(c.money, 60), reputation: 2, tone: 'rule' } }),
  tell: c => ({ label: `跑去把大人叫来`, hint: '让能管的人来管', tone: 'tell', payload: { bond: 2, stats: { 机缘: 1 }, tone: 'ask' } }),
  borrow: c => ({ label: `去${c.faction}那里借一笔`, hint: '钱到手 · 欠人情', tone: 'borrow', payload: { coins: 90, flag: 'in_debt', tone: 'greed' } }),
  refuse: c => ({ label: `这次不点头`, hint: '得罪人 · 保住底线', tone: 'refuse', payload: { reputation: -3, emotion: { 怒: 2 }, tone: 'rule' } }),
  escape: c => ({ label: `先离开${c.place}`, hint: '避风头 · 钱和机会都少', tone: 'escape', payload: { coins: -40, tone: 'quit' } }),
  takeRisk: c => ({ label: ph(c, 'risk', `赌一把，${c.item}的便宜不常有`), hint: '钱+ · 名声-', tone: 'risk', payload: { coins: 110, reputation: -4, tone: 'profit', risk: 1 } }),
  protect: c => ({ label: `先把家里人护住`, hint: '安全 · 声望-', tone: 'protect', payload: { health: 2, reputation: -2, tone: 'protect' } }),
  brave: c => ({ label: `迎着${c.risk}出去看看`, hint: '声望+ · 会受伤', tone: 'brave', payload: { reputation: 8, health: -6, importance: 4, tone: 'brave' } }),
  study: c => ({ label: ph(c, 'learn', `把${c.item}的门道学明白`), hint: '智识+ · 慢', tone: 'study', payload: { stats: { 智识: 1 }, tone: 'learn' } }),
  askElder: c => ({ label: `去问${c.actor}，别自己猜`, hint: '少走弯路 · 欠解释的人情', tone: 'elder', payload: { bond: 3, stats: { 机缘: 1 }, tone: 'ask' } }),
  trade: c => ({ label: `拿${c.item}做一笔小买卖`, hint: '钱+ · 有赔的可能', tone: 'trade', payload: { coins: 70, stats: { 机缘: 1 }, tone: 'deal' } }),
  confess: c => ({ label: `把话对${c.actor}说明白`, hint: '关系可能前进', tone: 'confess', payload: { bond: 6, tone: 'confess' } }),
  wait: c => ({ label: `先陪着，不急着定`, hint: '亲近+ · 稳妥', tone: 'wait', payload: { bond: 5, tone: 'stay' } }),
  distance: c => ({ label: `退一步，先顾自己`, hint: '关系- · 时间省下', tone: 'distance', payload: { bond: -4, tone: 'distance' } }),
  marry: c => ({ label: `定下来，一起过日子`, hint: '成为伴侣 · 责任+', tone: 'marry', payload: { bond: 12, tone: 'marry' } }),
  child: c => ({ label: `按自己希望被对待的方式养`, hint: '温柔 · 自己也被治愈', tone: 'heal', payload: { emotion: { 爱: 6 }, bond: 4, tone: 'heal' } }),
  childOld: c => ({ label: `照自己小时候那套来`, hint: '延续 · 孩子像你', tone: 'repeat', payload: { bond: 3, tone: 'repeat' } }),
  health: c => ({ label: `花钱把身体养回来`, hint: '健康+ · 钱-', tone: 'health', payload: { health: 8, coins: -120, tone: 'health' } }),
  defy: c => ({ label: `不管它，照旧过`, hint: '心情+ · 健康-', tone: 'defy', payload: { health: -6, emotion: { 喜: 3 }, tone: 'defy' } }),
  seek: c => ({ label: `去打听续命药`, hint: '开续命线 · 钱-', tone: 'seek', payload: { coins: -40, flag: 'pill_seek', tone: 'seek' } }),
  shop: c => ({ label: `盘下${c.place}的一间小铺`, hint: '本钱- · 多一条营生', tone: 'shop', payload: { coins: -60, shop: '一间小铺', tone: 'expand' } }),
  bargain: c => ({ label: `跟${c.actor}把价钱磨下来`, hint: '省钱 · 费口舌', tone: 'bargain', payload: { coins: 35, reputation: 1, tone: 'deal' } }),
  report: c => ({ label: `把这事报到${c.faction}去`, hint: '借官面压人 · 欠人情', tone: 'report', payload: { reputation: 3, coins: -20, tone: 'rule' } }),
  hide: c => ({ label: `先瞒下来，别让人知道`, hint: '保住场面 · 心里压着', tone: 'hide', payload: { emotion: { 惧: 4, 哀: 2 }, tone: 'avoid' } }),
  gamble: c => ({ label: `押上${c.item === '这件事' ? '手里的钱' : '这笔' + c.item}赌一次`, hint: '可能翻倍 · 可能归零', tone: 'gamble', payload: { coins: -Math.min(c.money, 80), tone: 'profit', risk: 1 } }),
  pray: c => ({ label: `按${c.place}的老规矩求一次`, hint: '心里安稳 · 未必有用', tone: 'pray', payload: { emotion: { 惧: -3, 哀: -2 }, tone: 'pray' } }),
  repair: c => ({ label: `自己动手把它修好`, hint: '省钱 · 费时', tone: 'repair', payload: { coins: 20, stats: { 体魄: 1 }, tone: 'learn' } }),
  escort: c => ({ label: `陪${c.actor}走这一趟`, hint: '关系+ · 路上有险', tone: 'escort', payload: { bond: 6, health: -3, tone: 'warm' } }),
  sell: c => ({ label: `把${c.item === '这件事' ? '手边的东西' : c.item}折价卖掉`, hint: '先拿到钱 · 亏一截', tone: 'sell', payload: { coins: 55, emotion: { 哀: 2 }, tone: 'deal' } }),
  collect: c => ({ label: `上门把这笔账要回来`, hint: '钱+ · 结怨', tone: 'collect', payload: { coins: 70, reputation: -2, tone: 'rule' } }),
  teach: c => ({ label: `把这事教给${c.actor}`, hint: '关系+ · 花时间', tone: 'teach', payload: { bond: 5, stats: { 智识: 1 }, tone: 'warm' } }),
  witness: c => ({ label: `站出来作个证`, hint: '声望+ · 被记恨', tone: 'witness', payload: { reputation: 6, health: -2, tone: 'brave' } }),
  keep: c => ({ label: `把它留下，谁也不说`, hint: '得一件东西 · 心里不踏实', tone: 'keep', payload: { coins: 60, emotion: { 惧: 2, 欲: 3 }, tone: 'secret' } })
};

/* pools per arc — order matters: earlier entries are more "in character" */
const ARC_POOLS = {
  child: ['obey','sneak','askElder','help','inform','study','pray','hide','keep','witness','tell'],
  family: ['help','inform','obey','pay','refuse','askElder','escape','hide','pray','carry','witness'],
  work: ['pay','inform','refuse','takeRisk','escape','study','borrow','bargain','report','repair','collect','witness','gamble'],
  relation: ['confess','wait','distance','help','inform','escort','teach','bargain'],
  marriage: ['marry','wait','distance','askElder','pay','refuse'],
  business: ['trade','pay','takeRisk','shop','escape','borrow','bargain','sell','collect','repair'],
  crisis: ['protect','brave','takeRisk','escape','help','hide','witness','pray','report'],
  aging: ['health','defy','seek','help','inform','pray','teach'],
  parent: ['child','childOld','help','pay','teach','escort'],
  teen: ['study','escape','obey','sneak','inform','takeRisk','bargain','witness','pray'],
  opening: ['shop','study','escape','pay','borrow','trade','repair'],
  pillar: ['seek','health','help','pray'],
  life: ['obey','inform','help','sneak','pay','escape','bargain','keep','witness','pray','repair','sell','gamble','carry']
};

/* 有些动作只有大人能做。孩子看到的选项要是孩子真做得出来的事。 */
const AGE_GATE = {
  pay: 9, borrow: 16, trade: 14, shop: 17, sell: 12, collect: 16,
  bargain: 12, report: 15, gamble: 18, marry: 18, confess: 16, escort: 12,
  teach: 15, health: 14, seek: 16, keep: 6, witness: 10, repair: 9, escape: 8,
  study: 6, inform: 7, help: 3, obey: 2, sneak: 4, askElder: 3, pray: 3, hide: 4, tell: 3
};
const KID_ONLY = ['obey','sneak','askElder','help','pray','hide','tell','keep'];
const BABY_ONLY = ['obey','help','tell','pray','askElder'];
const CHILD_ONLY = ['obey','sneak','askElder','help','pray','hide','tell','keep','inform','witness','study','repair'];
function buildChoices(arc, ctx) {
  const a = ctx.age || 0;
  let pool = (ARC_POOLS[arc] || ARC_POOLS.life).filter(k => (AGE_GATE[k] || 0) <= a);
  if (a < 4) pool = pool.filter(k => BABY_ONLY.includes(k));
  else if (a < 7) pool = pool.filter(k => KID_ONLY.includes(k));
  else if (a < 13) pool = pool.filter(k => CHILD_ONLY.includes(k));
  if (pool.length < 4) {
    const fallback = a < 4 ? BABY_ONLY : a < 7 ? KID_ONLY : a < 13 ? CHILD_ONLY : ['obey', 'inform', 'help', 'sneak', 'askElder', 'study', 'pray', 'hide'];
    for (const k of fallback) if (!pool.includes(k)) pool.push(k);
  }
  const out = [];
  /* shuffle with a seed drawn from the scene, so the same event never repeats its order */
  let s = (hashText((ctx.actor || '') + (ctx.item || '') + (ctx.place || '') + (state.days || 0)) + 1) >>> 0;
  const rnd = () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s >>>= 0; s ^= s << 5; s >>>= 0; return s / 4294967296; };
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
  for (const key of pool) {
    if (out.length >= 3) break;
    const built = ARCH[key](ctx);
    if (!built) continue;
    if (out.some(x => x.tone === built.tone)) continue;
    out.push({
      title: built.label,
      desc: DESC[key] ? DESC[key](ctx) : '',
      hint: built.hint,
      tone: built.tone,
      payload: built.payload
    });
  }
  return out;
}

/* 四岁以前，玩家能做的只有婴儿能做的事：抓住、哭、看、睡。
   这一段留下的不是“策略”，是记忆最初的样子。 */
function babyChoices(s, ctx) {
  const who = ctx.actor || '家里人';
  const thing = ctx.item === '这件事' ? '手边的东西' : ctx.item;
  let h = (hashText((s.title || '') + who + (thing || '')) + 7) >>> 0;
  const rnd = () => { h ^= h << 13; h >>>= 0; h ^= h >>> 17; h >>>= 0; h ^= h << 5; h >>>= 0; return h / 4294967296; };
  const pool = [
    { title: `抓住${who}的衣角不放`, desc: `手很小，抓得很紧，谁劝都不松。`, hint: '被记住 · 心里安稳', payload: { bond: 4, emotion: { 爱: 3 }, tone: 'obey' } },
    { title: `哭到有人过来`, desc: '不知道想要什么，先哭。', hint: '有人来 · 众人都累', payload: { bond: 2, health: -1, tone: 'tell' } },
    { title: `盯着${thing}看很久`, desc: '看不懂，但记住了它的样子。', hint: '记忆+ · 安静', payload: { stats: { 智识: 1 }, tone: 'ask' } },
    { title: `自己爬过去摸一摸`, desc: '大人一转身，你已经到了那边。', hint: '胆量+ · 可能磕碰', payload: { emotion: { 惧: 2, 欲: 2 }, health: -1, tone: 'sneak' } },
    { title: `睡着了，什么也没记住`, desc: '这一天在梦里过去了。', hint: '身体+ · 无记忆', payload: { health: 2, tone: 'obey' } },
    { title: `伸手要${who}抱`, desc: '把手举起来，等人弯下腰。', hint: '亲近+', payload: { bond: 5, emotion: { 爱: 2 }, tone: 'help' } }
  ];
  for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); const t = pool[i]; pool[i] = pool[j]; pool[j] = t; }
  return pool.slice(0, 3);
}

/* rewrite a scene's options to fit its own content */
function contextualizeChoices(s) {
  const ctx = deriveContext(s);
  const arc = s.arc || 'life';
  const built = (ctx.age || 0) < 4 ? babyChoices(s, ctx) : buildChoices(arc, ctx);
  if (built.length === 3) s.choices = built;
  s.ctx = { item: ctx.item, actor: ctx.actor, place: ctx.place };
  return s;
}
