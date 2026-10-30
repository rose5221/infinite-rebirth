'use strict';

/* v10 · L4 关系层
   配角之间有关系，关系会自己变，主角可以撞见，也可以不知道。

   核心：删掉主角，这张网还会动。 */

/* ---------------- 六部的关系网 ---------------- */
/* 每条边：a, b, 亲近 close, 亏欠 debt(正=a欠b), 未说的话 unsaid, drift 每年自变, cause 为什么 */

const WEB10 = {
  '穗骨原': {
    people: {
      father: { name: '穗老六', tag: '父' },
      mother: { name: '棠娘', tag: '母' },
      sibling: { name: '穗禾', tag: '姐' },
      guild: { name: '谷债盟', tag: '债主' }
    },
    edges: [
      { a: 'father', b: 'mother', close: 58, debt: 14, unsaid: 7, drift: { debt: 4, unsaid: 1 }, cause: '他押了地，没告诉她' },
      { a: 'mother', b: 'sibling', close: 62, debt: 0, unsaid: 6, drift: { unsaid: 2 }, cause: '她想走，母亲不点头' },
      { a: 'father', b: 'sibling', close: 44, debt: -6, unsaid: 5, drift: { close: -1 }, cause: '他舍不得她走，说不出口' },
      { a: 'father', b: 'guild', close: 10, debt: -18, unsaid: 0, drift: { debt: -6 }, cause: '欠着租，一年一年压着' },
      { a: 'mother', b: 'guild', close: 12, debt: -4, unsaid: 3, drift: {}, cause: '她想过去求情，没去' }
    ],
    /* 撞见：家里有事在发生，主角撞见的场景 */
    overhears: [
      {
        id: 'w_light', age: [9, 40], weight: 4,
        need: { edge: 'father|mother', minUnsaid: 5 },
        title: '灶房还亮着灯',
        text: '你半夜起来喝水，看见灶房还亮着灯。父亲和母亲在说话，声音压得很低。你听不清，只听见"押"这个字，说了两遍。',
        ask: '你怎么办？',
        choices: [
          { title: '站在门外听完', desc: '把鞋脱了，贴在门边。', hint: '知道一件事，心里落块石头',
            outcome: '你听完了。父亲把地押给了谷债盟，秋后还不上，就没了。母亲一直没说话，最后只说了一句：早该告诉我。',
            eff: { heart: -6, debtKnow: 'father|mother' }, who: 'father' },
          { title: '推门进去问', desc: '直接问他们在说什么。', hint: '打断他们，两边都不高兴',
            outcome: '两个人都停住了。父亲说没什么事，母亲说去睡吧。第二天早上，母亲的眼睛是肿的。',
            eff: { relMother: -6, relFather: -4 }, who: 'mother' },
          { title: '回屋接着睡', desc: '当作没看见。', hint: '什么都没发生，那盏灯你记了一辈子',
            outcome: '你回屋躺下，很久没睡着。后来你一直记得那盏灯：油快没了，火苗很小，可它亮着。',
            eff: { heart: -2, mark: '那盏灯亮到很晚' }, who: 'father' }
        ]
      },
      {
        id: 'w_ticket', age: [12, 22], weight: 4,
        need: { edge: 'mother|sibling', minUnsaid: 6 },
        title: '鞋底的纸',
        text: '你替穗禾晒鞋，摸到鞋底有一块硬的东西。抽出来是一张车票，去穗仓城，日期是下月初。她把票藏在鞋里，走了多少路，纸边都磨成布了。',
        ask: '你把票放回去吗？',
        choices: [
          { title: '放回去，装不知道', desc: '把鞋摆回原处，鞋尖朝里。', hint: '她会走，你早就知道了',
            outcome: '你把票塞回去，把鞋摆好。此后每次看见她，你都在算还有几天。她走的那天，你一点都不意外。',
            eff: { heart: -3, mark: '我早就知道她要走' }, who: 'sibling' },
          { title: '拿着票去问她', desc: '当面问，什么时候走。', hint: '她会求你别说',
            outcome: '她一把把票抢过去，说：你要是告诉娘，我这辈子都不回来。你答应了。那天晚上她第一次给你留了半块饼。',
            eff: { relSibling: 8, unsaid: -3 }, who: 'sibling' },
          { title: '告诉母亲', desc: '把票交到母亲手里。', hint: '她三年没叫你名字',
            outcome: '母亲把票收进柜子，把她的鞋锁起来。穗禾没有哭，也没有说话。她三年没叫过你的名字。',
            eff: { relSibling: -22, relMother: 6 }, who: 'mother' }
        ]
      },
      {
        id: 'w_guild', age: [14, 45], weight: 3,
        need: { edge: 'father|guild', maxDebt: -12 },
        title: '门口站着人',
        text: '从早上起就有两个人站在你家门口，不进来，也不走。父亲出去说过一次话，回来把我叫到一边，让我进屋，把门关上。',
        ask: '你听他的吗？',
        choices: [
          { title: '进屋关门', desc: '照他说的做。', hint: '你不知道外面谈了什么',
            outcome: '你坐在屋里，听见外面有说话声，听不清。后来人走了。父亲进来，说：没事。他那天晚饭没吃。',
            eff: { heart: -4 }, who: 'father' },
          { title: '扒着门缝看', desc: '留一条缝，看他们做什么。', hint: '你会看见父亲低头',
            outcome: '你看见父亲给那两个人鞠躬。他弯下去的时候，脊背中间那块骨头凸出来，像一根钉子。你一辈子记得那个弧度。',
            eff: { heart: -7, mark: '他给他们鞠了躬' }, who: 'father' },
          { title: '冲出去站在他旁边', desc: '不管他要不要，你站过去。', hint: '他事后会骂你',
            outcome: '你站到父亲旁边，一句话没说。那两个人看了你一眼。人走后，父亲骂了你一句，声音是抖的。后来他再没让你站到前面去。',
            eff: { relFather: 10, body: -2 }, who: 'father' }
        ]
      }
    ]
  },

  '无昼京': {
    people: {
      father: { name: '亥叔', tag: '父' },
      mother: { name: '灯娘', tag: '母' },
      sibling: { name: '小漏', tag: '妹' },
      bureau: { name: '司昼院', tag: '官' }
    },
    edges: [
      { a: 'father', b: 'mother', close: 54, debt: 8, unsaid: 8, drift: { unsaid: 2 }, cause: '他签了别人的名字，没敢说' },
      { a: 'mother', b: 'sibling', close: 60, debt: 0, unsaid: 5, drift: { unsaid: 1 }, cause: '她想让妹妹离光近一点' },
      { a: 'father', b: 'bureau', close: 8, debt: -20, unsaid: 0, drift: { debt: -4 }, cause: '账上那个名字' },
      { a: 'sibling', b: 'bureau', close: 30, debt: 0, unsaid: 4, drift: {}, cause: '她抄错了一笔' }
    ],
    overhears: [
      {
        id: 'w_lamp', age: [8, 40], weight: 4,
        need: { edge: 'father|mother', minUnsaid: 6 },
        title: '灯下的两个影子',
        text: '你起夜，看见修灯铺里还有光。父亲坐在矮凳上，母亲在替他补鞋。两个人一句话都没说，只有针穿过鞋底的声音。',
        ask: '你过去吗？',
        choices: [
          { title: '过去坐下', desc: '挤到他们中间，什么也不说。', hint: '他们会让出一点位置',
            outcome: '母亲把灯往你那边挪了挪。父亲往旁边让了让。三个人挤着，谁都没说话，那盏灯亮到鸡叫。',
            eff: { heart: 8, mark: '三个人挤着一盏灯' }, who: 'mother' },
          { title: '站着看一会儿', desc: '站在门边，看他们。', hint: '你会记住这个画面',
            outcome: '你站了一会儿。母亲抬头看见你，笑了一下，说去睡吧。你回屋，躺着，觉得这日子也还行。',
            eff: { heart: 4 }, who: 'mother' },
          { title: '回去睡', desc: '他们大概有事要说。', hint: '其实他们什么都没说',
            outcome: '你回屋了。很多年后你才知道，那一晚他们什么都没说，就是坐着。你后悔过很多次。',
            eff: { heart: -3, mark: '那一晚他们什么都没说' }, who: 'father' }
        ]
      },
      {
        id: 'w_name', age: [12, 45], weight: 3,
        need: { edge: 'father|bureau', maxDebt: -14 },
        title: '账上的名字',
        text: '父亲让你替他送一趟东西去司昼院。你在门口等的时候，看见墙上贴着一张单子，上面有他的名字，后面跟着另一个人的名字。',
        ask: '你去看清楚吗？',
        choices: [
          { title: '走近看', desc: '记住那两个名字。', hint: '你会知道一件不该知道的事',
            outcome: '你看清了。父亲替人签了字，那人早就搬走了。这笔光时，最后要父亲自己还。',
            eff: { heart: -5, mark: '父亲的名字后面跟着别人' }, who: 'father' },
          { title: '装作没看见', desc: '送完东西就走。', hint: '你只是不想知道',
            outcome: '你把东西放下就走了。回去的路上你一直在想那两个名字，但你没问。',
            eff: { heart: -2 }, who: 'father' },
          { title: '回去问父亲', desc: '当面问他。', hint: '他会发火',
            outcome: '父亲把碗摔了。他说大人的事你别管。母亲没说话，只是把碎片一片片捡起来。',
            eff: { relFather: -10, relMother: 4 }, who: 'father' }
        ]
      }
    ]
  },

  '借寿渡': {
    people: {
      grandma: { name: '阿婆', tag: '祖母' },
      father: { name: '渡生', tag: '父' },
      sibling: { name: '纸鸢', tag: '妹' },
      broker: { name: '灰契台', tag: '契头' }
    },
    edges: [
      { a: 'grandma', b: 'father', close: 66, debt: 0, unsaid: 9, drift: { unsaid: 2 }, cause: '她早就把自己的寿记在空契上' },
      { a: 'father', b: 'sibling', close: 50, debt: 4, unsaid: 6, drift: { unsaid: 1 }, cause: '他怕女儿也去烧契' },
      { a: 'grandma', b: 'broker', close: 20, debt: -12, unsaid: 0, drift: {}, cause: '她有一张契押在台上' },
      { a: 'sibling', b: 'broker', close: 26, debt: 0, unsaid: 3, drift: {}, cause: '她偷偷改过一张契' }
    ],
    overhears: [
      {
        id: 'w_paper', age: [9, 38], weight: 4,
        need: { edge: 'grandma|father', minUnsaid: 7 },
        title: '灰契台上的两个人',
        text: '你去灰契台替阿婆取东西，看见她和父亲站在台上。阿婆手里捏着一张空契，父亲一直摇头。风把灰吹起来，落在他们肩上。',
        ask: '你走过去吗？',
        choices: [
          { title: '走过去', desc: '站到他们中间。', hint: '阿婆会把契收起来',
            outcome: '阿婆看见你，把契折起来塞进袖子里，说：回去了。父亲一路没说话。你后来再没见过那张契。',
            eff: { heart: -4 }, who: 'grandma' },
          { title: '躲在一边看', desc: '等他们说完。', hint: '你会知道那张契是给谁的',
            outcome: '你听见阿婆说：反正也没几年了。父亲说：娘。就这两个字。你站在那儿，手里的东西掉在地上。',
            eff: { heart: -9, mark: '阿婆说反正也没几年了' }, who: 'grandma' },
          { title: '回去装作没去过', desc: '扭头就走。', hint: '阿婆回来时会多看你一眼',
            outcome: '你回去了。那天晚饭阿婆给你多夹了一筷子菜，什么也没说。你吃着吃着，眼睛有点酸。',
            eff: { heart: 2, mark: '她多夹了一筷子菜' }, who: 'grandma' }
        ]
      },
      {
        id: 'w_kite', age: [11, 34], weight: 3,
        need: { edge: 'father|sibling', minUnsaid: 5 },
        title: '妹妹的秤',
        text: '你去找纸鸢，看见她蹲在河边，用阿婆那杆小秤在称什么。她看见你，手背到身后。',
        ask: '你问她吗？',
        choices: [
          { title: '问她称什么', desc: '蹲下来，跟她一起看。', hint: '她会告诉你一半',
            outcome: '她把秤拿出来，说：我称称我自己还剩多少。你笑了，她没笑。',
            eff: { relSibling: 8, heart: -4 }, who: 'sibling' },
          { title: '装作没看见', desc: '转身走。', hint: '她会松一口气',
            outcome: '你走了。她在后面叫你，你没回头。后来那杆秤不见了，你一直没问。',
            eff: { heart: -2, mark: '那杆秤后来不见了' }, who: 'sibling' },
          { title: '去告诉父亲', desc: '这不是小孩子该碰的东西。', hint: '她恨了你很久',
            outcome: '父亲把秤收了，打了她一下。她站在墙角，眼睛盯着你，一句话没说。那之后她有事都不找你了。',
            eff: { relSibling: -16, relFather: 5 }, who: 'father' }
        ]
      }
    ]
  },

  '钟葬群岛': {
    people: {
      father: { name: '铜九', tag: '父' },
      mother: { name: '海娥', tag: '母' },
      sibling: { name: '小螺', tag: '妹' },
      keeper: { name: '钟楼', tag: '守钟会' }
    },
    edges: [
      { a: 'father', b: 'mother', close: 60, debt: 0, unsaid: 10, drift: { unsaid: 2 }, cause: '他怕自己先忘了她' },
      { a: 'father', b: 'keeper', close: 40, debt: -8, unsaid: 2, drift: {}, cause: '钟谱上多记了一个名字' },
      { a: 'mother', b: 'sibling', close: 58, debt: 0, unsaid: 6, drift: { unsaid: 1 }, cause: '她想送女儿离岛' },
      { a: 'sibling', b: 'keeper', close: 24, debt: 0, unsaid: 3, drift: {}, cause: '她捞上来一枚不属于本岛的钟舌' }
    ],
    overhears: [
      {
        id: 'w_tower', age: [10, 42], weight: 4,
        need: { edge: 'father|mother', minUnsaid: 8 },
        title: '塔上的两个名字',
        text: '你半夜上塔找父亲，听见他在念名字。念到一半停住，又从头念。母亲站在旁边，手里拿着一盏小灯。',
        ask: '你出声吗？',
        choices: [
          { title: '出声叫他', desc: '喊一声爹。', hint: '他会装作没事',
            outcome: '父亲停下来，说：来了。母亲把灯递给你，说拿着。那天夜里你们三个人在塔上坐到天亮。',
            eff: { heart: 6, mark: '三个人在塔上坐到天亮' }, who: 'father' },
          { title: '在楼梯上坐着听', desc: '不走，也不出声。', hint: '你会听见他念自己的名字',
            outcome: '你听见他念到自己的名字，停了一下，又念下去。他在提前练，怕哪天忘了。你坐在楼梯上，冷得发抖，没动。',
            eff: { heart: -8, mark: '他在练自己的名字' }, who: 'father' },
          { title: '悄悄下去', desc: '不该听的别听。', hint: '那晚你没睡着',
            outcome: '你下去了。躺在床上一夜没睡。第二天父亲照常做饭，照常出海，好像什么都没发生。',
            eff: { heart: -3 }, who: 'father' }
        ]
      },
      {
        id: 'w_clapper', age: [13, 40], weight: 3,
        need: { edge: 'sibling|keeper', minUnsaid: 2 },
        title: '鱼篓底的东西',
        text: '你替小螺晒鱼篓，篓底摸到一块硬东西，用油布包着。打开是一枚钟舌，铜的，比本岛任何一口钟的舌头都短一寸。',
        ask: '怎么办？',
        choices: [
          { title: '包好放回去', desc: '盖好，当没摸到。', hint: '她会知道你知道',
            outcome: '你放回去了。晚上她回来，看了你一眼，说：谢了。你们谁都没再提这件事。',
            eff: { relSibling: 10, mark: '我们谁都没再提' }, who: 'sibling' },
          { title: '拿去问父亲', desc: '这不该在家里。', hint: '她会被罚',
            outcome: '父亲把钟舌送去了钟楼。小螺被罚在静湾守三个月。她回来那天，手上的绳痕还没消。',
            eff: { relSibling: -18, relFather: 6 }, who: 'father' },
          { title: '问她从哪来的', desc: '当面问。', hint: '她会讲一个不该讲的故事',
            outcome: '她说是从沉钟渊底下摸的。她说底下还有好多口钟，都在响。你让她别再去了。她说好。后来她又去了。',
            eff: { relSibling: 6, heart: -5, mark: '她说底下还有好多口钟' }, who: 'sibling' }
        ]
      }
    ]
  },

  '髓云都市': {
    people: {
      mother: { name: '母亲', tag: '母' },
      father: { name: '父亲', tag: '父' },
      friend: { name: '阿棠', tag: '友' },
      tower: { name: '封存塔', tag: '官' }
    },
    edges: [
      { a: 'mother', b: 'father', close: 56, debt: 10, unsaid: 9, drift: { unsaid: 2 }, cause: '手术费是他签的字' },
      { a: 'father', b: 'tower', close: 14, debt: -16, unsaid: 0, drift: { debt: -3 }, cause: '质押合同上的担保人' },
      { a: 'mother', b: 'tower', close: 20, debt: 0, unsaid: 4, drift: {}, cause: '她缝在衣角的名字被登记过' },
      { a: 'friend', b: 'tower', close: 22, debt: 0, unsaid: 5, drift: {}, cause: '阿棠私留了一瓶记忆' }
    ],
    overhears: [
      {
        id: 'w_ward', age: [10, 38], weight: 4,
        need: { edge: 'mother|father', minUnsaid: 7 },
        title: '走廊尽头',
        text: '医院走廊很白。你去找父亲，看见他和母亲站在尽头，两个人都没说话。父亲手里捏着一张纸，捏得皱成一团。',
        ask: '你走过去吗？',
        choices: [
          { title: '走过去', desc: '站在他们旁边。', hint: '父亲会把纸藏起来',
            outcome: '父亲把纸塞进口袋。母亲摸了摸你的头，说：没事。那张纸后来你在他枕头下找到过，是质押合同。',
            eff: { heart: -5, mark: '那张纸在他枕头下' }, who: 'father' },
          { title: '站在拐角看', desc: '看他们说什么。', hint: '你会知道手术费从哪来',
            outcome: '你听见母亲说：不治了。父亲说：签都签了。你站在拐角，手心全是汗。',
            eff: { heart: -9, mark: '签都签了' }, who: 'mother' },
          { title: '回去等', desc: '这不是你该听的事。', hint: '他们会装作没事',
            outcome: '你回病房等。他们进来时脸上都有笑。那天母亲还问你饿不饿。你说不饿。',
            eff: { heart: -2 }, who: 'mother' }
        ]
      },
      {
        id: 'w_bottle', age: [14, 42], weight: 3,
        need: { edge: 'friend|tower', minUnsaid: 4 },
        title: '阿棠的抽屉',
        text: '你去阿棠的店，她不在。抽屉半开着，里面有一瓶记忆，标签上写着别人的名字。按规矩，这瓶早该上交了。',
        ask: '怎么办？',
        choices: [
          { title: '关上抽屉', desc: '当没看见。', hint: '她会知道你没动',
            outcome: '你把抽屉推回去。阿棠回来，看了一眼抽屉，又看了你一眼。她笑了，说：谢了。',
            eff: { relFriend: 10, mark: '她说了声谢了' }, who: 'friend' },
          { title: '当面问她', desc: '为什么不交。', hint: '她会讲一个理由',
            outcome: '她说这瓶的主人已经死了，交上去就会被洗掉。她说她做不到。你问她打算怎么办。她说不知道。',
            eff: { relFriend: 6, heart: -4 }, who: 'friend' },
          { title: '报告封存塔', desc: '这是规矩。', hint: '她再没跟你说过话',
            outcome: '封存塔的人来了。阿棠被吊销了执照。她搬走那天你去了，她没开门。',
            eff: { relFriend: -25, rep: 6 }, who: 'friend' }
        ]
      }
    ]
  },

  '星耒野': {
    people: {
      father: { name: '耒三', tag: '父' },
      mother: { name: '穗娘', tag: '母' },
      sibling: { name: '小满', tag: '妹' },
      city: { name: '陨铁城', tag: '收粮' }
    },
    edges: [
      { a: 'father', b: 'mother', close: 62, debt: 0, unsaid: 8, drift: { unsaid: 1 }, cause: '他眼睛的事，没跟她说' },
      { a: 'father', b: 'city', close: 16, debt: -12, unsaid: 0, drift: { debt: -4 }, cause: '签过一张收粮的契' },
      { a: 'mother', b: 'sibling', close: 56, debt: 0, unsaid: 6, drift: { unsaid: 1 }, cause: '她想让女儿进城' },
      { a: 'sibling', b: 'city', close: 30, debt: 0, unsaid: 3, drift: {}, cause: '她替城里记过父亲的名字' }
    ],
    overhears: [
      {
        id: 'w_eye', age: [9, 40], weight: 4,
        need: { edge: 'father|mother', minUnsaid: 6 },
        title: '他数不清垄',
        text: '你从田里回来，看见父亲蹲在垄边，用手一寸一寸地摸。母亲站在后面，没出声。他数到第七垄就停了，又从头数。',
        ask: '你过去吗？',
        choices: [
          { title: '过去扶他', desc: '把手搭在他胳膊上。', hint: '他会甩开',
            outcome: '他甩了一下，说不用。你没松手。他就不动了，蹲在那儿，很久。母亲背过身去。',
            eff: { relFather: 8, heart: -4, mark: '他数到第七垄就停了' }, who: 'father' },
          { title: '喊一声爹', desc: '让他知道有人来了。', hint: '他会装作在找东西',
            outcome: '他站起来，说：我在看墒。你说是。你们一起往回走，他走得比平时慢。',
            eff: { heart: -3 }, who: 'father' },
          { title: '走开', desc: '他自己会想办法。', hint: '那晚你没吃下饭',
            outcome: '你走了。晚饭时他照常给你夹菜，筷子在盘子上磕了两下才夹稳。你低着头吃完。',
            eff: { heart: -5, mark: '筷子磕了两下' }, who: 'father' }
        ]
      },
      {
        id: 'w_contract', age: [13, 44], weight: 3,
        need: { edge: 'father|city', maxDebt: -10 },
        title: '城里的车',
        text: '陨铁城的车停在村口，来了三个人。他们进了你家，把一张纸摊在桌上。父亲看了一眼，说：我签过了。',
        ask: '你做什么？',
        choices: [
          { title: '站到父亲身前', desc: '不管他要不要。', hint: '他会把你推开',
            outcome: '他把你推到身后，力气很大。他说：这是大人的事。那三个人走了以后，他坐在门槛上抽了很久的烟。',
            eff: { relFather: 6, heart: -4 }, who: 'father' },
          { title: '去看那张纸', desc: '把纸拿起来读。', hint: '你会知道家里欠了多少',
            outcome: '纸上写着，这一季的星糠全归城里，抵去年的账。你读完，抬头看父亲。他一直没看你。',
            eff: { heart: -6, mark: '这一季全归城里' }, who: 'father' },
          { title: '回自己屋', desc: '让他们谈。', hint: '你不知道最后谈成什么',
            outcome: '你在屋里坐着，听见外面说话的声音一阵高一阵低。后来车走了。父亲进来，说：明天照常下田。',
            eff: { heart: -2 }, who: 'father' }
        ]
      }
    ]
  }
};

/* ---------------- 状态 ---------------- */
function w10Init(book) {
  const w = WEB10[book];
  if (!w) return;
  s9.web = {
    people: JSON.parse(JSON.stringify(w.people)),
    edges: JSON.parse(JSON.stringify(w.edges)),
    heard: [],
    known: []
  };
}

function w10Edge(a, b) {
  if (!s9.web) return null;
  return s9.web.edges.find(e => (e.a === a && e.b === b) || (e.a === b && e.b === a));
}

/* 每年 drift：配角之间自己变 */
function w10Drift() {
  if (!s9.web) return;
  const notes = [];
  for (const e of s9.web.edges) {
    const dr = e.drift || {};
    if (dr.close) e.close = Math.max(-50, Math.min(100, e.close + dr.close));
    if (dr.debt) e.debt = Math.max(-50, Math.min(50, e.debt + dr.debt));
    if (dr.unsaid) e.unsaid = Math.max(0, Math.min(12, e.unsaid + dr.unsaid));
    // 亲近高的边，未说的话会慢慢攒起来（越亲越有话不说）
    if (e.close > 55 && Math.random() < 0.35) e.unsaid = Math.min(12, e.unsaid + 1);
    if (e.unsaid >= 10 && !s9.web.heard.some(h => h.id === e.a + '|' + e.b)) {
      notes.push({ a: e.a, b: e.b, text: e.cause });
    }
  }
  return notes;
}

/* 这一年该不该撞见 */
function w10PickOverhear() {
  if (!s9.web) return null;
  const w = WEB10[s9.book];
  if (!w) return null;
  const pool = (w.overhears || []).filter(o => {
    if (s9.web.heard.includes(o.id)) return false;
    if (s9.age < o.age[0] || s9.age > o.age[1]) return false;
    const [ea, eb] = (o.need.edge || '').split('|');
    const e = w10Edge(ea, eb);
    if (!e) return false;
    if (o.need.minUnsaid && e.unsaid < o.need.minUnsaid) return false;
    if (o.need.maxDebt !== undefined && e.debt > o.need.maxDebt) return false;
    return true;
  });
  if (!pool.length) return null;
  // 一年最多一次，三成概率
  if (Math.random() > 0.34) return null;
  const bag = [];
  for (const o of pool) for (let i = 0; i < (o.weight || 1); i++) bag.push(o);
  return bag[Math.floor(Math.random() * bag.length)];
}

/* 撞见场景转成一张卡 */
function w10ToCard(o) {
  return {
    kind: 'plot',
    web: true,
    title: o.title,
    text: o.text,
    ask: o.ask,
    scene: o,
    actions: o.choices.map((c, i) => ({
      id: 'w_' + i,
      name: c.title,
      desc: c.desc,
      hint: c.hint,
      effort: 1,
      plot: { title: c.title, desc: c.desc, hint: c.hint, outcome: c.outcome, eff: c.eff }
    }))
  };
}

/* 撞见之后：记账 */
function w10MarkHeard(o) {
  if (!s9.web) return;
  s9.web.heard.push(o.id);
}

/* 关系层结算：选项里的 relXxx 生效 */
function w10ApplyRel(eff) {
  if (!s9.web || !eff) return;
  const map = { relFather: 'father', relMother: 'mother', relSibling: 'sibling', relFriend: 'friend', relGrandma: 'grandma' };
  for (const k of Object.keys(map)) {
    if (!eff[k]) continue;
    const other = map[k];
    let e = w10Edge('self', other);
    if (!e) {
      s9.web.edges.push({ a: 'self', b: other, close: 50, debt: 0, unsaid: 0, drift: {}, cause: '' });
      e = w10Edge('self', other);
    }
    e.close = Math.max(-50, Math.min(100, e.close + eff[k]));
  }
  if (eff.unsaid) {
    // 未说的话记在最近的那条边上
    const near = s9.web.edges.filter(x => x.a !== 'self' && x.b !== 'self').sort((p, q) => q.unsaid - p.unsaid)[0];
    if (near) near.unsaid = Math.max(0, Math.min(12, near.unsaid + eff.unsaid));
  }
  if (eff.debtKnow) {
    const idx = eff.debtKnow.indexOf('|');
    const a = eff.debtKnow.slice(0, idx), b = eff.debtKnow.slice(idx + 1);
    const e = w10Edge(a, b);
    if (e) { e.unsaid = Math.max(0, e.unsaid - 5); s9.web.known.push(e.cause); }
  }
}

/* 给 UI：这一家的网 */
function w10Net() {
  if (!s9.web) return [];
  return s9.web.edges.map(e => {
    const A = (s9.web.people[e.a] || {}).name || c9Name(e.a) || e.a;
    const B = (s9.web.people[e.b] || {}).name || c9Name(e.b) || e.b;
    return {
      a: A, b: B,
      close: Math.round(e.close), unsaid: e.unsaid, debt: e.debt,
      cause: s9.web.known.includes(e.cause) ? e.cause : ''
    };
  });
}
