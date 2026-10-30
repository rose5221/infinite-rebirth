'use strict';

/* v12 · L3 人物层（私事）
   每个配角都有一件正在做、但不告诉主角的事。
   它有自己的时间表：到点自己推进，不管主角在不在场。
   主角可能永远不知道前因，只承受后果。 */

const PRIV12 = {
  '穗骨原': {
    father: [
      { id: 'p_jar', name: '祖骨罐', start: 0, steps: [
        { age: 3, act: '夜里把祖骨罐从村后挪到柴房底下', tell: false },
        { age: 8, act: '谷债盟来查穗印，位置对不上，罚了两石谷', tell: true, eff: { grain: -2, heart: -4 }, line: '你只知道那年的谷少了，不知道少在哪。' },
        { age: 14, act: '又把罐子挪回去，怕你娘发现', tell: false },
        { age: 22, act: '喝多了，跟人说漏嘴', tell: true, eff: { heart: -3 }, line: '村里人看他的眼神变了。你不知道为什么。' }
      ]},
      { id: 'p_debt', name: '押地', start: 6, steps: [
        { age: 6, act: '把西边那亩押给了谷债盟', tell: false },
        { age: 12, act: '开始每月去镇上还利钱', tell: false },
        { age: 17, act: '利钱还不上，押期又延了三年', tell: true, eff: { thread: '押在西边那亩的契，还没赎回' }, line: '他把契纸塞回梁上，说没什么。' }
      ]}
    ],
    mother: [
      { id: 'p_retire', name: '退婚', start: 0, steps: [
        { age: 9, act: '娘家来人，说漏了嘴', tell: true, eff: { heart: -2 }, line: '你听见"当年要是嫁过去"这半句，后面被咽回去了。' },
        { age: 26, act: '那个人回来了，在村口站了半天', tell: true, eff: { heart: -3 }, line: '母亲那天没出门。' }
      ]},
      { id: 'p_water', name: '水口', start: 4, steps: [
        { age: 4, act: '她偷偷替上游的人家看了三年水口，换一点粮', tell: false },
        { age: 11, act: '被人告发，看水的差事丢了', tell: true, eff: { grain: -1.5, rep: -2 }, line: '她回来什么也没说，第二天照常下田。' }
      ]}
    ],
    sibling: [
      { id: 'p_ticket', name: '车票', start: 2, steps: [
        { age: 2, act: '开始把拾穗攒的谷子换成钱', tell: false },
        { age: 9, act: '托人从穗仓城带了一张车票', tell: false },
        { age: 14, act: '车票快过期了，她开始天天看天', tell: true, eff: { heart: -3 }, line: '她这一年常站在村口往远处看。' },
        { age: 17, act: '走了。留了一双鞋在门口', tell: true, eff: { heart: -8, thread: '穗禾走了，没说要多久回来' }, line: '你回来的时候，她的床已经空了。' }
      ]}
    ]
  },

  '无昼京': {
    father: [
      { id: 'p_name', name: '替签', start: 0, steps: [
        { age: 4, act: '在司昼院的账上替人签了一个名字', tell: false },
        { age: 10, act: '那人搬走了，光时债落到他头上', tell: true, eff: { coin: -120, heart: -4 }, line: '那年家里的灯突然短了两刻，没人解释。' },
        { age: 20, act: '为了还这笔，多接了三年夜班', tell: false }
      ]}
    ],
    mother: [
      { id: 'p_goodlamp', name: '好灯', start: 0, steps: [
        { age: 7, act: '把最好的一盏灯藏在柜底，说等好日子', tell: false },
        { age: 18, act: '家里出了事，她把那盏灯当了', tell: true, eff: { coin: 200, heart: -6 }, line: '柜底空了。她说是她自己弄丢的。' },
        { age: 41, act: '眼睛坏了，再也修不了灯', tell: true, eff: { heart: -5 }, line: '她开始教你认光的等级，教得很慢。' }
      ]}
    ],
    sibling: [
      { id: 'p_wrong', name: '抄错的那笔', start: 0, steps: [
        { age: 8, act: '抄漏时抄错一笔，少算了一户人家的光时', tell: false },
        { age: 15, act: '那户人家搬走了，她一直记着', tell: true, eff: { heart: -4 }, line: '她那天回来，眼睛是红的。' },
        { age: 24, act: '去把那笔补上了，自己贴了半年光时', tell: true, eff: { coin: -100, heart: 3 }, line: '她补完了才告诉你。' }
      ]}
    ]
  },

  '借寿渡': {
    grandma: [
      { id: 'p_empty', name: '空契', start: 0, steps: [
        { age: 2, act: '在一张空契上写了自己的名字，压着没烧', tell: false },
        { age: 10, act: '你病重，她把那张契烧了', tell: true, eff: { health: 10, heart: -6, thread: '阿婆烧了一张空契，为了你' }, line: '你退了烧。她那年冬天一直咳嗽。' },
        { age: 16, act: '她开始记不清事，但记得你的生日', tell: true, eff: { heart: -5 }, line: '她把你生日记成两个日子，两个都记对了。' },
        { age: 22, act: '走了。契上写着余寿尽数转予长孙', tell: true, eff: { heart: -12, thread: '阿婆的寿数在你身上' }, line: '出殡那天你没哭。回家看见她那双鞋还摆在门口。' }
      ]}
    ],
    father: [
      { id: 'p_boat', name: '不该载的人', start: 0, steps: [
        { age: 5, act: '半夜载过一个不该载的人过河', tell: false },
        { age: 13, act: '那人回来了，站在渡口看他', tell: true, eff: { heart: -5, thread: '渡口那个人还在等' }, line: '父亲把船撑到对岸，一整天没回来。' }
      ]}
    ],
    sibling: [
      { id: 'p_alter', name: '改契', start: 0, steps: [
        { age: 6, act: '偷偷把一张契上的名字改了', tell: false },
        { age: 13, act: '改的那张契被人发现了', tell: true, eff: { rep: -4, heart: -5 }, line: '父亲打了她。她一句都没辩。' },
        { age: 20, act: '她开始攒钱，想给自己赎一张', tell: true, eff: { heart: -3 }, line: '你看见她把铜板一个一个数进罐子。' }
      ]}
    ]
  },

  '钟葬群岛': {
    father: [
      { id: 'p_extra', name: '多记的名字', start: 0, steps: [
        { age: 5, act: '在钟谱上多记了一个名字', tell: false },
        { age: 12, act: '守钟会查谱，查出了那一行', tell: true, eff: { rep: -6, heart: -6 }, line: '他被罚在静湾守了三个月。回来时嗓子更哑了。' },
        { age: 30, act: '他开始忘事，先忘的是你的名字', tell: true, eff: { heart: -10 }, line: '他叫你的时候停了一下，然后叫了你娘的名字。' }
      ]}
    ],
    mother: [
      { id: 'p_cloth', name: '烧衣服', start: 0, steps: [
        { age: 6, act: '每年在海边烧一件旧衣服，不说是给谁的', tell: false },
        { age: 15, act: '你跟着她去看，发现是给一个孩子的', tell: true, eff: { heart: -8, thread: '海边烧掉的那些小衣服' }, line: '她看见你，说：回去吧。你们一路没说话。' }
      ]}
    ],
    sibling: [
      { id: 'p_dive', name: '沉钟渊', start: 0, steps: [
        { age: 4, act: '开始跟捞钟人学潜水', tell: false },
        { age: 12, act: '从底下带上来一枚钟舌', tell: true, eff: { heart: -4 }, line: '她把钟舌藏在鱼篓里，被你摸到。' },
        { age: 21, act: '一次潜下去，三个时辰没上来', tell: true, eff: { heart: -14, thread: '她那天没上来' }, line: '捞上来的时候，手里还攥着一块铜。' }
      ]}
    ]
  },

  '髓云都市': {
    mother: [
      { id: 'p_seam', name: '缝名字', start: 0, steps: [
        { age: 3, act: '把你的名字缝在你的衣角上', tell: false },
        { age: 17, act: '病重，手术费差一大截', tell: true, eff: { heart: -6 }, line: '她开始收拾东西，把该送人的都送了。' },
        { age: 19, act: '醒来，不认得你', tell: true, eff: { heart: -12, thread: '她不记得你了' }, line: '她问护士：这个年轻人是谁。' },
        { age: 60, act: '走了。葬礼上她叫了你的小名', tell: true, eff: { heart: -6 }, line: '她走之前叫了一声，你听清了。' }
      ]}
    ],
    father: [
      { id: 'p_sign', name: '担保人', start: 0, steps: [
        { age: 8, act: '在质押合同上替儿子签了字，一直没敢说', tell: false },
        { age: 26, act: '合同到期，催款的找上门', tell: true, eff: { coin: -200, heart: -5 }, line: '他从那天开始喝酒。' }
      ]}
    ],
    friend: [
      { id: 'p_keep', name: '私留的瓶', start: 0, steps: [
        { age: 9, act: '私留了一瓶客人的记忆没上交', tell: false },
        { age: 18, act: '封存塔来查，她把那瓶换成了空的', tell: true, eff: { heart: -4 }, line: '她关店关了三天。' },
        { age: 33, act: '店关了，她说要去漂忆港找一个人', tell: true, eff: { heart: -6, thread: '阿棠说她要去找一个人' }, line: '她走的那天没让你送。' }
      ]}
    ]
  },

  '星耒野': {
    father: [
      { id: 'p_seed', name: '私藏的种', start: 0, steps: [
        { age: 4, act: '在种子库偷存了一小袋没上交的种', tell: false },
        { age: 10, act: '种子库查账，他把那袋种埋在了田里', tell: false },
        { age: 18, act: '眼睛被星尘灼伤，看东西开始有光斑', tell: true, eff: { health: -4, heart: -6 }, line: '他数垄的时候开始用手指摸。' },
        { age: 47, act: '走了。葬在能看见望星台的坡上', tell: true, eff: { heart: -12, thread: '他埋在能看见望星台的那块坡上' }, line: '下葬那天没下雨。' }
      ]}
    ],
    mother: [
      { id: 'p_hide', name: '米缸底下的种', start: 0, steps: [
        { age: 7, act: '把一包变异种子藏在米缸底下', tell: false },
        { age: 22, act: '你淘米的时候发现了那包东西', tell: true, eff: { heart: -4, thread: '米缸底下那包变异种' }, line: '她说：别告诉你爹。' }
      ]}
    ],
    sibling: [
      { id: 'p_name', name: '替城里记名', start: 0, steps: [
        { age: 6, act: '替陨铁城记了父亲的名字', tell: false },
        { age: 15, act: '那张单子被人翻出来', tell: true, eff: { rep: -4, heart: -6 }, line: '父亲看了她一眼，什么也没说。' },
        { age: 26, act: '进城做了不用看天的人，再没回来', tell: true, eff: { heart: -8, thread: '小满进城后再没回来' }, line: '她走的时候说：这里没什么好留的。' }
      ]}
    ]
  }
};

/* 每条轨的有效期：过了这个年纪，这件事就错过了，不再补发 */
const P12_EXPIRE = {
  p_jar: 40, p_debt: 45, p_retire: 40, p_water: 30, p_ticket: 26,
  p_name: 35, p_goodlamp: 50, p_wrong: 40,
  p_empty: 40, p_boat: 35, p_alter: 32,
  p_extra: 40, p_cloth: 30, p_dive: 30,
  p_seam: 65, p_sign: 40, p_keep: 45,
  p_seed: 50, p_hide: 35, p_name2: 35
};

function p12Init(book) {
  const w = PRIV12[book];
  if (!w) return;
  s9.priv = {};
  for (const who of Object.keys(w)) {
    s9.priv[who] = w[who].map(t => ({
      id: t.id, name: t.name,
      step: 0, steps: t.steps.slice(),
      done: false, revealed: false,
      lastAct: ''
    }));
  }
}

/* 每年推进：谁的事到点了 */
function p12Tick() {
  if (!s9.priv) return null;
  const hits = [];
  for (const who of Object.keys(s9.priv)) {
    const p = s9.family.find(x => x.id === who);
    if (!p || !p.alive) continue;
    for (const track of s9.priv[who]) {
      if (track.done) continue;
      const step = track.steps[track.step];
      if (!step) { track.done = true; continue; }
      if (s9.age < step.age) continue;
      const exp = P12_EXPIRE[track.id] || 50;
      if (s9.age > exp) { track.done = true; track.missed = true; continue; }
      track.step++;
      track.lastAct = step.act;
      if (track.step >= track.steps.length) track.done = true;

      // 这一件事要不要让主角知道
      if (step.tell) {
        hits.push({
          who, name: (s9.web && s9.web.people[who] ? s9.web.people[who].name : c9Name(who)) || who,
          track: track.name, act: step.act, line: step.line || '', eff: step.eff || {}
        });
      }
    }
  }
  return hits.length ? hits : null;
}

/* 私事带来的效果（不弹卡，直接落账） */
function p12Apply(hits) {
  if (!hits || !hits.length) return [];
  const notes = [];
  for (const h of hits) {
    const e = h.eff || {};
    if (e.grain) { s9.grain = Math.max(0, s9.grain + e.grain); notes.push({ k: '粮', v: Math.round(e.grain * 10) / 10, c: 'bad' }); }
    if (e.coin) { s9.coin = Math.max(0, s9.coin + e.coin); notes.push({ k: '谷铢', v: e.coin, c: e.coin > 0 ? 'good' : 'bad' }); }
    if (e.heart) { s9.heart = Math.max(0, Math.min(100, s9.heart + e.heart)); }
    if (e.health) { s9.body = Math.max(1, Math.min(100, s9.body + e.health)); }
    if (e.rep) { }
    if (e.thread) {
      s9.threads = s9.threads || [];
      s9.threads.push({ text: e.thread, age: s9.age, open: true });
    }
    // 记成"你不知道的这些年"
    s9.blind = s9.blind || [];
    s9.blind.push({ age: s9.age, who: h.name, line: h.line || h.act });
    if (s9.blind.length > 12) s9.blind.shift();
  }
  return notes;
}

/* 给结局：这一生你不知道的事 */
function p12Blind() {
  return (s9.blind || []).slice(-8);
}
