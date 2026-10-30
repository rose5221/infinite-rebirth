'use strict';

/* v16 · L9 回声层
   这一生结束后，留下三样东西给下一世：
   一件物件 · 一句话 · 一个习惯。

   习惯不继承数值，只继承"说不出为什么眼熟"。
*/

const ECHO16 = {
  key: 'echo16_soul',
  maxLives: 12
};

/* ---------- 读/写跨世档案 ---------- */
function e16Load() {
  try {
    const r = localStorage.getItem(ECHO16.key);
    if (r) return JSON.parse(r);
  } catch (e) {}
  return { lives: [], habits: [], objects: [], marks: [] };
}
function e16Save(d) {
  try { localStorage.setItem(ECHO16.key, JSON.stringify(d)); } catch (e) {}
}

/* ---------- 一生结束时：提炼这三样 ---------- */
function e16Harvest() {
  const d = e16Load();
  const T = (typeof t15Summary === 'function') ? t15Summary() : { rows: [] };

  // 谁占的时间最多
  const closest = (T.rows || []).filter(r => r.k === 'give')[0];
  // 这一生最重的一句
  const mark = (s9.marks && s9.marks.length) ? s9.marks[s9.marks.length - 1] : '';
  // 一个物件
  const obj = e16Object();

  const life = {
    book: s9.book,
    name: s9.name,
    age: s9.age,
    verdict: (typeof t15Verdict === 'function') ? t15Verdict() : '',
    closest: closest ? closest.name : '',
    mark,
    object: obj.name,
    habit: obj.habit,
    seed: s9.seed,
    at: Date.now()
  };

  d.lives.unshift(life);
  if (d.lives.length > ECHO16.maxLives) d.lives.length = ECHO16.maxLives;

  if (mark) { d.marks.unshift(mark); if (d.marks.length > 6) d.marks.length = 6; }
  if (obj.name && !d.objects.includes(obj.name)) d.objects.unshift(obj.name);
  if (d.objects.length > 6) d.objects.length = 6;
  if (obj.habit && !d.habits.some(h => h.text === obj.habit)) d.habits.unshift({ text: obj.habit, from: s9.name });
  if (d.habits.length > 6) d.habits.length = 6;

  e16Save(d);
  return life;
}

/* 每个世界挑一个"该留下的物件 + 对应的习惯" */
function e16Object() {
  const table = {
    '穗骨原': [
      { name: '豁口镰刀', habit: '他握东西的时候，手会先掂一掂，像在试轻重。' },
      { name: '半袋谷', habit: '他数东西一定从左边数起，数完了还要再数一遍。' },
      { name: '祖骨罐上的绳痕', habit: '他蹲下来的时候，喜欢用手背撑一下膝盖。' }
    ],
    '无昼京': [
      { name: '半截灯芯', habit: '他点灯之前，会先用手挡一下风。' },
      { name: '藏起来的好灯', habit: '他进门先看灯亮不亮，才说话。' }
    ],
    '借寿渡': [
      { name: '称寿的小秤', habit: '他接东西的时候，手会往下沉一沉。' },
      { name: '祖母的空契', habit: '他说话之前先停半拍，像在算还有多少。' }
    ],
    '钟葬群岛': [
      { name: "不属于本岛的钟舌", habit: '他听见远处的声音会停一下，侧着耳朵。' },
      { name: '父亲的钟锤', habit: '他走路时脚跟先落地，很轻。' }
    ],
    '髓云都市': [
      { name: '编号 B-1147 的记忆瓶', habit: '他想事情的时候，会用指尖敲桌面，敲三下。' },
      { name: '母亲缝了名字的衣角', habit: '他摸衣角的时候，会捏一捏，像在确认什么还在。' }
    ],
    '星耒野': [
      { name: '父亲的夜灌灯', habit: '他抬头看天的时候，会眯一下眼睛。' },
      { name: '会发光的麦穗', habit: '他蹲在田边，总要先抓一把土在手里搓。' }
    ]
  };
  const arr = table[s9.book] || table['穗骨原'];
  // 按种子选，同一局稳定
  const i = (s9.seed || 1) % arr.length;
  return arr[i];
}

/* ---------- 下一世出生时：埋一个回声 ---------- */
function e16Plant() {
  const d = e16Load();
  if (!d.habits.length) return null;
  // 上一世的习惯，这一世落在某个人身上
  const h = d.habits[0];
  s9.echo = { habit: h.text, from: h.from };
  return s9.echo;
}

/* 这一世遇到"眼熟"的那一刻 */
function e16Moment() {
  if (!s9.echo) return null;
  if (s9.echoShown) return null;
  // 18-45 岁之间，遇一个非家人
  if (s9.age < 18 || s9.age > 45) return null;
  if (Math.random() > 0.28) return null;

  const who = e16StrangerName();
  s9.echoShown = true;
  return {
    kind: 'echo',
    title: '说不上来',
    text: `你在${c9Lex().place}遇见${who}。你们说了几句闲话。临走的时候，你注意到${who}有个习惯：${s9.echo.habit}`,
    ask: '',
    mark: '有个人让我想起谁，但我想不起来',
    actions: [
      { id: 'e1', name: '站着看了一会儿', desc: '说不出为什么。', hint: '心 +3', effort: 0, plot: { title: '站着看了一会儿', desc: '', hint: '', outcome: '你站在那里，看着那个人走远。心里有点空，又有点暖。你说不上来是为什么。', eff: { emotion: { 哀: 2, 爱: 2 } } } },
      { id: 'e2', name: '追上去问一句', desc: '问他是不是在哪里见过。', hint: '多半问不出什么', effort: 0, plot: { title: '追上去问一句', desc: '', hint: '', outcome: '你说：我们是不是见过。他想了想，说没有吧。你们笑了一下，各自走了。', eff: {} } },
      { id: 'e3', name: '低头走开', desc: '不想多想。', hint: '什么也不会发生', effort: 0, plot: { title: '低头走开', desc: '', hint: '', outcome: '你低头走了。走出去十几步，又回头看了一眼。那个人已经拐进巷子了。', eff: { emotion: { 哀: 1 } } } }
    ]
  };
}

function e16StrangerName() {
  const pool = {
    '穗骨原': ['林见', '周砚', '陆十一', '阿绵', '程石'],
    '无昼京': ['守灯的老周', '一个抄漏的', '巷口的女人', '提灯的孩子'],
    '借寿渡': ['渡口的年轻人', '糊纸的师傅', '一个抱着碗的孩子'],
    '钟葬群岛': ['捞钟的后生', '静湾的渔妇', '一个数钟的孩子'],
    '髓云都市': ['整理记忆的姑娘', '来赎瓶的男人', '问路的老太太'],
    '星耒野': ['邻村的夜灌人', '收糠的伙计', '看星的孩子']
  };
  const arr = pool[s9.book] || pool['穗骨原'];
  return arr[(s9.seed || 1) % arr.length];
}

/* 给结局：这是第几世 */
function e16LifeIndex() {
  const d = e16Load();
  return d.lives.length;
}

/* 六部读完：并排摊开 */
function e16Shelf() {
  const d = e16Load();
  return d.lives.slice().reverse();
}
