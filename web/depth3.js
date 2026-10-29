'use strict';

/* Depth packs, batch 3: expand 无昼京 / 井垂天 / 逆轨环城 / 髓云都市 / 钟葬群岛 to full density. */

(function(){
  const add = (name, extra) => {
    const p = DEPTH_WORLDS[name];
    if(!p) return;
    for(const k of Object.keys(extra)){
      const list = p[k] || (p[k] = []);
      const have = new Set(list.map(e=>e.id));
      for(const e of extra[k]) if(!have.has(e.id)) list.push(e);
    }
  };

  add('无昼京', {
    child:[
      {id:'wu_c3',mode:'dialogue',npc:'mother',title:'灯娘教认光',opening:()=>`母亲教你认光的等级：哪种光是配给的，哪种是偷来的，哪种是死人留下的。她说认错了，会被司昼院记上一笔。`,line:'母亲问你：你分得清吗？',days:[3,10],minTurns:2,maxTurns:3,effects:{stats:{智识:1}},memory:'母亲教的三种光'},
      {id:'wu_c4',mode:'narration',title:'街上的更夫',opening:()=>`更夫夜里敲梆子，一下代表一个时辰。有一晚他多敲了一下，第二天那条街的时间就少了半个时辰，没人敢问。`,ask:'你去看吗？',days:[1,4],minTurns:1,maxTurns:2,effects:{emotions:{惧:5}},memory:'多敲的一下'}
    ],
    teen:[
      {id:'wu_t3',mode:'narration',title:'影市',opening:()=>`影市只在没有日门的时候开。摊子上卖的都不是货，是别人不要的光、不要的时辰、不要的影子。`,ask:'你买什么？',days:[2,8],minTurns:1,maxTurns:3,effects:{coins:-60,importance:3},memory:'影市的第一趟'},
      {id:'wu_t4',mode:'dialogue',npc:'father',title:'夜脚夫的腿',opening:()=>`父亲的腿开始肿，走一趟歇三趟。他说夜脚夫这行，腿先坏，然后是眼睛。`,line:'父亲问你：等我走不动了，家里靠谁？',days:[3,10],minTurns:2,maxTurns:4,effects:{emotions:{哀:5,爱:4}},memory:'父亲的腿'}
    ],
    land:[
      {id:'wu_l4',mode:'dialogue',npc:'sibling',title:'妹妹的抄漏',opening:()=>`妹妹在司昼院抄漏，抄错一笔就是少算一户人家的光时。她说她抄错的那户，昨天全家搬走了。`,line:'妹妹问你：我是不是害了人？',days:[3,8],minTurns:2,maxTurns:3,effects:{emotions:{哀:5,惧:4}},memory:'抄错的那一笔'},
      {id:'wu_l5',mode:'aftermath',title:'一场停光',opening:()=>`日门没有按时开。街上的人挤在门前，越挤越黑。等门开时，有人已经不在原来的位置。`,days:[1,4],minTurns:0,maxTurns:1,effects:{health:-5,importance:4},memory:'日门迟开的那天'}
    ],
    world:[
      {id:'wu_w4',mode:'narration',title:'光时账',opening:()=>`你在司昼院的墙上看见一张账：整座城的光时总量，每年少一点，却没人知道少在了哪里。`,ask:'你记下来吗？',days:[2,6],minTurns:1,maxTurns:3,effects:{importance:7},memory:'城的光时账本'},
      {id:'wu_w5',mode:'dialogue',npc:'father',title:'父亲的第一日',opening:()=>`父亲说他这辈子只见过三次真正的白天。第一次是他出生那天，被人抱着，他不记得；第二次是娶母亲；第三次是今天。`,line:'父亲问你：你见过几次？',days:[3,8],minTurns:2,maxTurns:4,effects:{emotions:{哀:6,爱:5}},memory:'父亲的三次白天'}
    ],
    random:[
      {id:'wu_r3',mode:'narration',title:'黑市卖昨日',opening:()=>`有人在巷子深处卖“昨日午后”：一小瓶光，打开就能重看一段别人的白天。`,ask:'你买不买？',days:[1,3],minTurns:1,maxTurns:2,effects:{coins:-40,emotions:{哀:3}},memory:'一小瓶别人的白天'}
    ]
  });

  add('井垂天', {
    child:[
      {id:'jing_c3',mode:'narration',title:'井底的雨',opening:()=>`井底也下雨，只是方向相反。你第一次看见雨往上落，以为是自己眼花。父亲说那是另一边的天在漏。`,ask:'你伸手接吗？',days:[2,6],minTurns:1,maxTurns:3,effects:{emotions:{喜:3,惧:3}},memory:'往上落的雨'},
      {id:'jing_c4',mode:'dialogue',npc:'father',title:'绳伯的规矩',opening:()=>`父亲守了三十年绳，规矩只有三条：结要打双，绳要摸一遍，听见井底有人叫你，不要停。`,line:'父亲问你：三条都记住了吗？',days:[2,6],minTurns:2,maxTurns:3,effects:{stats:{体魄:1}},memory:'守绳的三条规矩'}
    ],
    teen:[
      {id:'jing_t3',mode:'narration',title:'税归于井深',opening:()=>`县里按井深收税，井越深，税越重。你家井深，父亲说这叫“深有深的道理”。`,ask:'你信吗？',days:[3,10],minTurns:1,maxTurns:3,effects:{coins:-70,emotions:{怒:4}},memory:'按井深收的税'},
      {id:'jing_t4',mode:'dialogue',npc:'sibling',title:'妹妹的井底画',opening:()=>`妹妹在井壁上画东西，画的是井底的天。她说那里有房子也有人，只是都倒着走。`,line:'妹妹问你：你信我说的话吗？',days:[3,8],minTurns:2,maxTurns:3,effects:{bond:5,emotions:{爱:4}},memory:'井壁上的画'}
    ],
    land:[
      {id:'jing_l4',mode:'dialogue',npc:'mother',title:'桶娘的账',opening:()=>`母亲修桶收了半辈子钱，账记在一只旧桶的桶底。她把桶翻过来给你看，一笔不差。`,line:'母亲问你：这些账以后谁来记？',days:[3,10],minTurns:2,maxTurns:4,effects:{stats:{智识:1},emotions:{爱:4}},memory:'桶底的账'},
      {id:'jing_l5',mode:'aftermath',title:'一次塌井',opening:()=>`邻村有口井塌了，井壁上的土把下面的人埋住。救人要下井，下井的人可能就上不来了。`,days:[2,6],minTurns:0,maxTurns:1,effects:{health:-8,importance:6},memory:'塌井下的呼救'}
    ],
    world:[
      {id:'jing_w4',mode:'narration',title:'倒影十年的差',opening:()=>`你在井水里看见自己，比水面上的你老了十岁。你问父亲，父亲说他年轻时也见过，只是他看见的是年轻时十岁的自己。`,ask:'你还敢下井吗？',days:[1,4],minTurns:1,maxTurns:3,effects:{importance:7,emotions:{惧:6}},memory:'井水里老十岁的自己'},
      {id:'jing_w5',mode:'dialogue',npc:'father',title:'父亲的井',opening:()=>`父亲说他守的那口井里，埋着他父亲。不是尸体，是名字——守绳人死了，名字就留在井下，等下一个守绳人放绳时念一遍。`,line:'父亲问你：以后你会念我的名字吗？',days:[3,10],minTurns:2,maxTurns:4,effects:{emotions:{哀:7,爱:5}},memory:'井下的名字'}
    ],
    random:[
      {id:'jing_r3',mode:'narration',title:'井水的味道',opening:()=>`这几天井水的味道不对。有人说上游有死东西，有人说井底的天换了季。`,ask:'你还喝吗？',days:[1,3],minTurns:1,maxTurns:2,effects:{health:-4,emotions:{惧:4}},memory:'味道不对的井水'}
    ]
  });

  add('逆轨环城', {
    child:[
      {id:'ni_c3',mode:'narration',title:'蚀里的数数',opening:()=>`每十一次心跳，环城就暗一次。母亲教你数到六百六十下，数完光就会回来。有一晚她数错了，你数了一千多下。`,ask:'你告诉她吗？',days:[1,4],minTurns:1,maxTurns:2,effects:{emotions:{惧:4,爱:3}},memory:'数错的那个夜晚'},
      {id:'ni_c4',mode:'dialogue',npc:'father',title:'轮叔的补丁',opening:()=>`父亲的工服上全是补丁，每一块补丁对应一次险情。他说补丁是维修工的资历。`,line:'父亲问你：你看得出哪块最险吗？',days:[2,6],minTurns:2,maxTurns:3,effects:{stats:{体魄:1}},memory:'父亲工服上的补丁'}
    ],
    teen:[
      {id:'ni_t3',mode:'narration',title:'飞轮的份例',opening:()=>`母亲在飞轮农场，份例按公斤算。今年轮子转得慢，菜长得也慢，份例却没减。`,ask:'你怎么帮？',days:[5,20],minTurns:1,maxTurns:3,effects:{coins:-50,emotions:{爱:4}},memory:'飞轮的份例'},
      {id:'ni_t4',mode:'dialogue',npc:'sibling',title:'妹妹的制动课',opening:()=>`妹妹制动课排第一，教官说她有天赋。她却问：制动就是让别人先停，这算天赋吗？`,line:'妹妹问你：你会不会觉得我冷血？',days:[3,8],minTurns:2,maxTurns:3,effects:{emotions:{哀:3,爱:3}},memory:'妹妹问的天赋'}
    ],
    land:[
      {id:'ni_l4',mode:'dialogue',npc:'mother',title:'母亲的飞轮',opening:()=>`母亲的飞轮出过一次故障，她被甩出去，断了三根肋骨。她说那之后她才明白什么叫“持续运动岗”。`,line:'母亲问你：你还想进环带吗？',days:[3,10],minTurns:2,maxTurns:4,effects:{emotions:{哀:5,爱:4}},memory:'母亲断过的肋骨'},
      {id:'ni_l5',mode:'aftermath',title:'轨道相位',opening:()=>`轨道偏了一点，全城的人都要重新登记相位。登记错的人，会被算作“无票乘员”。`,days:[2,6],minTurns:0,maxTurns:1,effects:{coins:-80,importance:4},memory:'重登相位'}
    ],
    world:[
      {id:'ni_w4',mode:'narration',title:'刹轮贵族的宴',opening:()=>`刹轮贵族开宴，请了几个维修工。宴上他们谈角动量像谈酒，没有人问过谁被甩出过环带。`,ask:'你去不去？',days:[2,6],minTurns:1,maxTurns:3,effects:{importance:6,emotions:{怒:4}},memory:'贵族的宴'},
      {id:'ni_w5',mode:'dialogue',npc:'father',title:'父亲的一次刹车',opening:()=>`父亲说他一辈子只做过一次真正的决定：在陨石来的那一秒，把刹车推向了农场那边。船坞死了人。`,line:'父亲问你：你觉得我做对了吗？',days:[3,10],minTurns:2,maxTurns:4,effects:{emotions:{哀:7,爱:5}},memory:'父亲推动的那一秒'}
    ],
    random:[
      {id:'ni_r3',mode:'narration',title:'断缆',opening:()=>`环带之间断了一根缆，掉下去的东西没有声响。维修队到场时，只找到一截还在转的轴。`,ask:'你去看吗？',days:[1,3],minTurns:1,maxTurns:2,effects:{emotions:{惧:5}},memory:'断缆后的一截轴'}
    ]
  });

  add('髓云都市', {
    child:[
      {id:'sui2_c3',mode:'narration',title:'学校的记忆课',opening:()=>`学校教孩子整理自己的记忆，说整理得好，将来能卖好价钱。老师夸你归档整齐。`,ask:'你高兴吗？',days:[10,30],minTurns:1,maxTurns:2,effects:{stats:{智识:1},emotions:{哀:3}},memory:'被夸整齐的记忆'},
      {id:'sui2_c4',mode:'dialogue',npc:'father',title:'父亲的采集器',opening:()=>`父亲带你去采集现场。他戴着管子，把别人的一段回忆抽进雾晶，那人坐在椅子上，脸上什么也没有。`,line:'父亲问你：你觉得这算不算拿走？',days:[3,10],minTurns:2,maxTurns:3,effects:{emotions:{惧:4}},memory:'被抽走回忆的人'}
    ],
    teen:[
      {id:'sui2_t3',mode:'narration',title:'雾晶的价格',opening:()=>`一段高纯度童年能卖出一个月的饭钱。你算了算自己还剩几段。`,ask:'你卖哪段？',days:[5,15],minTurns:1,maxTurns:3,effects:{coins:150,emotions:{哀:5}},memory:'数剩下的童年'},
      {id:'sui2_t4',mode:'dialogue',npc:'mother',title:'母亲的封忆匣',opening:()=>`母亲的柜子里有一排封忆匣，每一个都贴着日期。她从不打开，也不扔。`,line:'母亲问你：你想知道里面是什么吗？',days:[3,8],minTurns:2,maxTurns:3,effects:{emotions:{哀:5,爱:4}},memory:'母亲柜子里的匣子'}
    ],
    land:[
      {id:'sui2_l4',mode:'dialogue',npc:'father',title:'父亲的职业债',opening:()=>`父亲做了三十年采集师，自己的记忆被磨得很薄。他有时会问你：你是我儿子吧？`,line:'父亲问你：我有没有忘掉什么重要的事？',days:[3,10],minTurns:2,maxTurns:4,effects:{emotions:{哀:8,爱:5}},memory:'父亲问的那句话'},
      {id:'sui2_l5',mode:'aftermath',title:'一次归档事故',opening:()=>`午夜归档出了故障，一条街的人同时失去了同一年的记忆。第二天大家都在问：去年到底发生了什么。`,days:[2,6],minTurns:0,maxTurns:1,effects:{importance:6,emotions:{惧:6}},memory:'被抹掉的那一年'}
    ],
    world:[
      {id:'sui2_w4',mode:'narration',title:'无名者的记忆',opening:()=>`无档区有人找到你，拿出一段没有主人的记忆：一个孩子在门口等，等到天黑。他们问：能不能给它找个名字。`,ask:'你接不接？',days:[2,6],minTurns:1,maxTurns:3,effects:{importance:7},memory:'等不到人的孩子'},
      {id:'sui2_w5',mode:'dialogue',npc:'mother',title:'母亲的一段',opening:()=>`母亲终于打开一个匣子，放给你听。里面是她十七岁那年的一个下午，她在河边等一个人，那人没来。`,line:'母亲问你：你说，我该不该留着它？',days:[3,10],minTurns:2,maxTurns:4,effects:{emotions:{哀:7,爱:5}},memory:'母亲十七岁的下午'}
    ],
    random:[
      {id:'sui2_r3',mode:'narration',title:'假忆郎中',opening:()=>`街上有人卖假忆，说能让你记起没发生过的好事。买的人不少，回头的人更多。`,ask:'你试吗？',days:[1,4],minTurns:1,maxTurns:2,effects:{coins:-50,emotions:{喜:3,哀:2}},memory:'一段没发生过的好事'}
    ]
  });

  add('钟葬群岛', {
    child:[
      {id:'zhong_c3',mode:'narration',title:'第一次海葬',opening:()=>`你第一次跟船出海葬。棺木沉下去时，全岛的钟同时响了一下，你的耳朵疼了三天。`,ask:'你记住了什么？',days:[2,6],minTurns:1,maxTurns:2,effects:{emotions:{哀:4,惧:4}},memory:'沉棺时的钟声'},
      {id:'zhong_c4',mode:'dialogue',npc:'father',title:'钟伯的耳朵',opening:()=>`父亲的耳朵被钟声磨坏了，说话要凑很近。他说守钟人的耳朵都是这么坏的，坏了才算入行。`,line:'父亲问你：你还想守钟吗？',days:[3,10],minTurns:2,maxTurns:3,effects:{emotions:{哀:4,爱:4}},memory:'父亲坏掉的耳朵'}
    ],
    teen:[
      {id:'zhong_t3',mode:'narration',title:'潮铢的重量',opening:()=>`潮铢按钟铜重量算，铜越重越值钱。有人开始往钟铜里掺铅，被潮声议会抓到，罚他听一夜哑钟。`,ask:'你掺过吗？',days:[3,10],minTurns:1,maxTurns:3,effects:{coins:60,emotions:{惧:4}},memory:'掺过铅的钟铜'},
      {id:'zhong_t4',mode:'dialogue',npc:'sibling',title:'妹妹想上岛',opening:()=>`妹妹说她想离开七声礁，去没钟的岛上生活。母亲说没钟的地方不算活人。`,line:'妹妹问你：你帮我说话吗？',days:[3,10],minTurns:2,maxTurns:4,effects:{bond:5,emotions:{哀:4}},memory:'妹妹想去的岛'}
    ],
    land:[
      {id:'zhong_l4',mode:'dialogue',npc:'mother',title:'潮娘的耳朵',opening:()=>`母亲潜了半辈子水，耳朵里常年有水。她说在水下能听见沉钟还在响，喊的都是活人的名字。`,line:'母亲问你：你听见了会应吗？',days:[3,10],minTurns:2,maxTurns:4,effects:{emotions:{惧:6,爱:4}},memory:'水下喊名字的钟'},
      {id:'zhong_l5',mode:'aftermath',title:'一场伪潮',opening:()=>`潮水没有按历法来，提前淹了半个村。潮声议会说是伪潮，不是他们的错。`,days:[2,6],minTurns:0,maxTurns:1,effects:{health:-6,importance:6},memory:'没有按历法来的潮'}
    ],
    world:[
      {id:'zhong_w4',mode:'narration',title:'第九口钟',opening:()=>`七声礁本来有九口钟。少的两口去哪了，议会不说，老钟谱上那两页也被撕掉了。`,ask:'你去查吗？',days:[2,8],minTurns:1,maxTurns:3,effects:{importance:8,emotions:{惧:5}},memory:'被撕掉的两页钟谱'},
      {id:'zhong_w5',mode:'dialogue',npc:'father',title:'父亲的钟',opening:()=>`父亲说他的钟是第七口，等他死，第七口会裂，名字会被刻在裂缝里。`,line:'父亲问你：你愿意接第七口吗？',days:[3,10],minTurns:2,maxTurns:4,effects:{emotions:{哀:7,爱:5}},memory:'第七口钟'}
    ],
    random:[
      {id:'zhong_r3',mode:'narration',title:'无声者的灯',opening:()=>`无声者点起灯，说这才是真正的潮。他们听不见钟，也就不欠钟。`,ask:'你靠过去吗？',days:[1,4],minTurns:1,maxTurns:2,effects:{emotions:{惧:4}},memory:'无声者的灯'}
    ]
  });

  // 借寿渡 / 星耒野 / 空白修院 already at density; add one world-scene each for continuity
  add('借寿渡', {world:[
    {id:'jie_w5',mode:'dialogue',npc:'mother',title:'棺娘的年岁',opening:()=>`母亲说她不记得自己多大。嫁到渡口以后，日子按葬礼算，一场葬礼一年，数着数着就乱了。`,line:'母亲问你：你说我算活了多少年？',days:[3,10],minTurns:2,maxTurns:3,effects:{emotions:{哀:6,爱:5}},memory:'按葬礼算的年岁'}
  ]});
  add('星耒野', {world:[
    {id:'xing_w5',mode:'dialogue',npc:'mother',title:'糠娘的梦',opening:()=>`母亲说她这些年的梦越来越短。舂星糠的人，梦都短，因为光被舂碎了。`,line:'母亲问你：你昨晚梦见了什么？',days:[3,10],minTurns:2,maxTurns:3,effects:{emotions:{哀:5,爱:4}},memory:'母亲的短梦'}
  ]});
  add('空白修院', {child:[
    {id:'kong_c4',mode:'narration',title:'墨池的夜',opening:()=>`母亲守墨池的夜里，池面会浮起字。她不看，只用竹竿把字拨开。你偷偷看过一次，那上面写着一个和你很像的名字。`,ask:'你记住那个名字了吗？',days:[2,6],minTurns:1,maxTurns:2,effects:{emotions:{惧:5}},memory:'池面浮起的名字'}
  ]});
})();
