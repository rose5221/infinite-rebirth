'use strict';

/* Depth packs, batch 2: 借寿渡 / 星耒野 / 空白修院 */

Object.assign(DEPTH_WORLDS, {

'借寿渡': {
  home:'沉碑渡',
  family:{father:['楮老渡','渡工'],mother:['棺娘','棺木匠'],sibling:['小楮','哭丧学徒']},
  baby:[
    {id:'jie_b1',mode:'montage',title:'满月与丧事',opening:()=>`你满月那天，上游正好有人家出殡。按规矩，婴儿要摸一下棺木，才不会被水里的东西认错。母亲抱着你，把她的手连着你的手一起按上去。木头是凉的。`,days:[360,420],minTurns:0,maxTurns:1,effects:{emotions:{惧:5,爱:3}},memory:'满月那天摸过的棺木'},
    {id:'jie_b2',mode:'narration',title:'赊来的寿',opening:()=>`家里死过一位长辈，葬礼是赊的。父亲在寿漕司的簿子上按了手印，用往后的寿数抵账。那天以后，他咳嗽的次数多了。`,ask:'你记得什么？',days:[200,360],minTurns:0,maxTurns:2,effects:{emotions:{哀:5}},memory:'父亲按下的手印'}
  ],
  child:[
    {id:'jie_c1',mode:'narration',title:'第一次撑船',opening:()=>`你第一次独自撑船，是替父亲送一具空棺到对岸。河面很静，水里却有别的声音，像是有人在数你的心跳。`,ask:'你把船撑向哪里？',days:[3,10],minTurns:1,maxTurns:3,effects:{stats:{体魄:1},emotions:{惧:4}},memory:'那具空棺'},
    {id:'jie_c2',mode:'dialogue',npc:'mother',title:'棺木匠的手',opening:()=>`母亲做棺木，从不问死者是谁。她的手很稳，钉子一下一下敲进去。今天她让你替她扶着木板。`,line:'母亲问你：你怕死人吗？',days:[3,8],minTurns:2,maxTurns:3,effects:{stats:{体魄:1},emotions:{惧:3,爱:3}},memory:'母亲钉棺的手'},
    {id:'jie_c3',mode:'narration',title:'替人哭一场',opening:()=>`村里有人死了，没有亲人。白衣孝会出钱请人哭丧，哭得好，死者才肯上船。你被拉去凑人数。`,ask:'你哭不哭？',days:[2,6],minTurns:1,maxTurns:2,effects:{coins:12,emotions:{哀:4}},memory:'替陌生人哭的一场'}
  ],
  teen:[
    {id:'jie_t1',mode:'dialogue',npc:'father',title:'父亲的寿数',opening:()=>`父亲的咳嗽越来越重。他把一张纸推给你看：寿漕司的簿子上，他的寿数已经抵掉了一半。`,line:'父亲问你：我要是走不了船了，你接不接？',days:[5,15],minTurns:2,maxTurns:4,effects:{emotions:{哀:6,爱:4}},memory:'父亲抵掉的一半寿数',chain:{step:'jie_l1'}},
    {id:'jie_t2',mode:'narration',title:'河改了道',opening:()=>`一场大葬之后，河改了道，把对岸的一个村子冲到了这边。村里人敲着门问：我们的坟还在不在原来的岸上？`,ask:'谁去回答他们？',days:[5,15],minTurns:1,maxTurns:3,effects:{importance:4},memory:'被冲过来的村子',chain:{step:'jie_w1'}},
    {id:'jie_t3',mode:'dialogue',npc:'sibling',title:'哭丧学徒',opening:()=>`手足做了哭丧学徒，嗓子练哑了。他说哭得越像，死者家属给的钱越多，可自己越来越分不清哪次是真难过。`,line:'手足问你：我这样，算不算骗人？',days:[3,10],minTurns:2,maxTurns:4,effects:{bond:4,emotions:{哀:4}},memory:'手足哑掉的嗓子'}
  ],
  land:[
    {id:'jie_l1',mode:'narration',title:'接船',opening:()=>`父亲不再下船了。你接过渡牌，天不亮就要在水边等。渡客有活人，也有不肯说自己已经死了的。`,ask:'你怎么认？',days:[20,50],minTurns:1,maxTurns:3,effects:{coins:60,importance:3},memory:'接过的第一趟船'},
    {id:'jie_l2',mode:'dialogue',npc:'faction',title:'寿漕司的账',opening:()=>`寿漕司的人来查账，说父亲当年抵的寿数不够，要拿你的补。他们把簿子摊在船头，墨还没干。`,line:'来人问你：这笔账，你认不认？',days:[2,8],minTurns:2,maxTurns:4,effects:{coins:-120,emotions:{怒:5}},memory:'船头上的簿子',next:'jie_l3'},
    {id:'jie_l3',mode:'narration',title:'赊一场葬礼',opening:()=>`村里又有人死了，家里拿不出寿数。他们跪在渡口，请你先摆渡，账以后还。你知道这账最后会落到谁头上。`,ask:'你摆不摆？',days:[3,10],minTurns:1,maxTurns:3,effects:{importance:5,emotions:{哀:4}},memory:'跪在渡口的人'},
    {id:'jie_l4',mode:'aftermath',title:'母亲的棺',opening:()=>`母亲给自己打了一口薄棺，说这样将来能少欠一点。她把棺木停在屋后，每天擦一遍。`,days:[5,20],minTurns:0,maxTurns:1,effects:{emotions:{哀:7}},memory:'屋后的那口薄棺'}
  ],
  world:[
    {id:'jie_w1',mode:'narration',title:'亡者持牌',opening:()=>`夜里有人来渡河。他把渡牌递给你，牌上的名字是你父亲。可父亲明明还睡在屋里。`,ask:'你让他上船吗？',days:[1,3],minTurns:1,maxTurns:3,effects:{importance:8,emotions:{惧:7}},memory:'父亲名字的渡牌',next:'jie_w2'},
    {id:'jie_w2',mode:'dialogue',npc:'faction',title:'沉碑帮',opening:()=>`沉碑帮的人从水里捞起一块碑，碑上刻着几十个名字，其中一个是你。他们说碑是从下游的旧渡口冲来的。`,line:'沉碑帮问你：这块碑，要不要沉回去？',days:[2,6],minTurns:2,maxTurns:4,effects:{importance:7,emotions:{惧:5}},memory:'刻着自己名字的碑',next:'jie_w3'},
    {id:'jie_w3',mode:'narration',title:'大潮',opening:()=>`大潮来了，河面涨得比岸高。寿漕司下令封渡，可岸上还有人在等船。白衣孝会的人点起灯，说今晚不封。`,ask:'你开不开船？',days:[1,3],minTurns:1,maxTurns:3,effects:{importance:9,health:-8},memory:'大潮那晚的灯'},
    {id:'jie_w4',mode:'dialogue',npc:'sibling',title:'手足的账',opening:()=>`手足替人哭丧攒了些寿数，全部抵给了家里。他说这样父亲的账能少一点，自己的不用管。`,line:'手足问你：你会不会也这样？',days:[3,8],minTurns:2,maxTurns:4,effects:{emotions:{爱:5,哀:5}},memory:'手足抵掉的寿数'}
  ],
  random:[
    {id:'jie_r1',mode:'narration',title:'不说话的渡客',opening:()=>`船上坐着一个不说话的渡客。到了对岸，他不下船，只问了一句：这边是哪一年？`,ask:'你回答吗？',days:[1,3],minTurns:1,maxTurns:2,effects:{emotions:{惧:5}},memory:'问年份的渡客'},
    {id:'jie_r2',mode:'narration',title:'棺材里的声音',opening:()=>`运棺的船到河心，棺里传出敲击声。父亲说过，听见了也不要打开。`,ask:'你开不开？',days:[1,2],minTurns:1,maxTurns:2,effects:{emotions:{惧:7}},memory:'河心的敲击声'},
    {id:'jie_r3',mode:'dialogue',npc:'mother',title:'母亲的生日',opening:()=>`母亲不过生日。她说嫁到渡口以后，日子就按葬礼算。今天你却想起她大概多大年纪了。`,line:'母亲问你：你知道我今年多大吗？',days:[2,6],minTurns:2,maxTurns:3,effects:{emotions:{哀:4,爱:4}},memory:'记不清的母亲年纪'}
  ]
},

'星耒野': {
  home:'暗河村',
  family:{father:['星老耒','夜灌农'],mother:['糠娘','舂星工'],sibling:['小耒','扎草人匠']},
  baby:[
    {id:'xing_b1',mode:'montage',title:'夜里的田',opening:()=>`你还在襁褓里，就被带到星田边。田是一塘黑水，水底沉着星星。父亲把你放在田埂上，说这样的话，长大才看得见星。`,days:[360,420],minTurns:0,maxTurns:1,effects:{emotions:{喜:3,惧:3}},memory:'田埂上的襁褓'},
    {id:'xing_b2',mode:'narration',title:'一次阴天',opening:()=>`连着半个月看不见星。田里不长，官月被推迟，家里把存下的星糠分成更小的份。你还小，只知道饿。`,ask:'你记得什么？',days:[150,300],minTurns:0,maxTurns:2,effects:{emotions:{哀:4,惧:4}},memory:'看不见星的那些天'}
  ],
  child:[
    {id:'xing_c1',mode:'narration',title:'第一次下田',opening:()=>`你第一次跟父亲下星田。脚踩进去，水只到膝盖，可往下一看，底下是没有尽头的夜。父亲说别往下看，看星。`,ask:'你看哪里？',days:[3,10],minTurns:1,maxTurns:3,effects:{stats:{体魄:1},emotions:{惧:4}},memory:'没有尽头的田底'},
    {id:'xing_c2',mode:'dialogue',npc:'mother',title:'舂星的手',opening:()=>`母亲舂星，把收下来的星粒舂成糠。她的手上全是细小的白点，洗不掉。她说不疼，只是夜里会发亮。`,line:'母亲问你：你怕不怕以后也这样？',days:[3,8],minTurns:2,maxTurns:3,effects:{emotions:{爱:4,哀:3}},memory:'母亲发亮的手'},
    {id:'xing_c3',mode:'narration',title:'草人',opening:()=>`手足扎草人立在田边，说是给迷路的游魂指路。有一夜，草人换了位置。`,ask:'你告诉谁？',days:[2,6],minTurns:1,maxTurns:2,effects:{emotions:{惧:5}},memory:'换了位置的草人'}
  ],
  teen:[
    {id:'xing_t1',mode:'dialogue',npc:'father',title:'星位',opening:()=>`父亲教你看星位，说什么时候下种、什么时候收、什么时候该停。他说错一次，一季就白干了。`,line:'父亲问你：你记住了几个星位？',days:[5,15],minTurns:2,maxTurns:4,effects:{stats:{智识:1}},memory:'父亲教的星位'},
    {id:'xing_t2',mode:'narration',title:'司辰庄来收星',opening:()=>`司辰庄的人来收星糠，说今年的份例涨了。母亲把最后一袋推过去，父亲没有说话。`,ask:'你说什么？',days:[3,10],minTurns:1,maxTurns:3,effects:{coins:-80,emotions:{怒:5}},memory:'涨价的那一袋星糠',chain:{step:'xing_l1'}},
    {id:'xing_t3',mode:'narration',title:'夜路',opening:()=>`你夜里走田埂，发现路边没有影子。守夜行会的人说，星收得太多，夜路就认不出人了。`,ask:'你继续走吗？',days:[1,4],minTurns:1,maxTurns:3,effects:{importance:3,emotions:{惧:5}},memory:'没有影子的夜路',chain:{step:'xing_w1'}}
  ],
  land:[
    {id:'xing_l1',mode:'narration',title:'自己的一亩星田',opening:()=>`你分到一小块星田，水比别人浅，星比别人疏。父亲说浅田也有浅田的好处，不容易沉。`,ask:'你怎么种？',days:[120,220],minTurns:1,maxTurns:3,effects:{coins:-60,stats:{体魄:1}},memory:'浅田的第一季'},
    {id:'xing_l2',mode:'narration',title:'抢灌',opening:()=>`夜里有人在上游开闸，把星水引走了。等你们发现，田里只剩下黑。`,ask:'你追不追？',days:[2,6],minTurns:1,maxTurns:3,effects:{health:-6,emotions:{怒:6}},memory:'被引走的星水',next:'xing_l3'},
    {id:'xing_l3',mode:'dialogue',npc:'faction',title:'暗河渔盟',opening:()=>`暗河渔盟的人说，他们能帮你把水引回来，但要你替他们送一趟不该送的东西。`,line:'渔盟的人问你：做不做？',days:[2,8],minTurns:2,maxTurns:4,effects:{importance:5},memory:'渔盟的交换'},
    {id:'xing_l4',mode:'aftermath',title:'收成',opening:()=>`这一季收下来的星糠不多，颗粒也不算亮。母亲舂了一整夜，说这糠能吃饱，只是梦会短一点。`,days:[20,40],minTurns:0,maxTurns:1,effects:{coins:140,emotions:{哀:3}},memory:'梦短一点的糠'}
  ],
  world:[
    {id:'xing_w1',mode:'narration',title:'星田里的门',opening:()=>`田底裂开一道缝，缝里透出光。父亲说那下面不是水，是另一个夜空。有人从缝里往上看着你。`,ask:'你伸手吗？',days:[1,3],minTurns:1,maxTurns:3,effects:{importance:7,emotions:{惧:6}},memory:'田底的那道缝',next:'xing_w2'},
    {id:'xing_w2',mode:'dialogue',npc:'sibling',title:'草人的名字',opening:()=>`手足在草人身上写了名字，一个是我们家死去的长辈，一个是他自己。他说这样迷路的魂就不会认错。`,line:'手足问你：你要不要也写一个？',days:[3,8],minTurns:2,maxTurns:4,effects:{emotions:{惧:5,爱:4}},memory:'草人身上的名字',next:'xing_w3'},
    {id:'xing_w3',mode:'narration',title:'午夜蚀光',opening:()=>`司辰庄下令制造午夜蚀光，说是为了校准星历。那天夜里，全野的星田同时黑了下去，很多人在黑暗里喊亲人的名字。`,ask:'你喊谁？',days:[1,3],minTurns:1,maxTurns:3,effects:{importance:9,emotions:{惧:7,哀:5}},memory:'全野黑下去的那一夜'},
    {id:'xing_w4',mode:'dialogue',npc:'father',title:'父亲的眼睛',opening:()=>`父亲的眼睛越来越花，看不清星位了。他把记星位的本子交给你，说以后靠你了。`,line:'父亲问你：你还看得见吗？',days:[4,10],minTurns:2,maxTurns:4,effects:{emotions:{哀:5,爱:5}},memory:'父亲交出的本子'}
  ],
  random:[
    {id:'xing_r1',mode:'narration',title:'游魂问路',opening:()=>`田埂上有个游魂问你路。他说他已经走了很久，找不到自己的村子。`,ask:'你指哪边？',days:[1,2],minTurns:1,maxTurns:2,effects:{emotions:{惧:4,哀:3}},memory:'问路的游魂'},
    {id:'xing_r2',mode:'dialogue',npc:'mother',title:'母亲的梦',opening:()=>`母亲说她昨晚梦见自己舂的星糠变成了灰。她醒来第一件事就是去看米缸。`,line:'母亲问你：家里还够吃多久？',days:[2,6],minTurns:2,maxTurns:3,effects:{emotions:{哀:3,爱:3}},memory:'母亲梦见糠变成灰'},
    {id:'xing_r3',mode:'narration',title:'流星落地',opening:()=>`一颗流星落在邻村田里，砸出一个坑。司辰庄的人连夜赶到，围起布，不让村里人靠近。`,ask:'你去不去看？',days:[1,4],minTurns:1,maxTurns:3,effects:{importance:3,emotions:{惧:4}},memory:'流星砸出的坑'}
  ]
},

'空白修院': {
  home:'白页回廊',
  family:{father:['无咎','抄谱杂役'],mother:['墨娘','墨池守'],sibling:['小页','无名童']},
  baby:[
    {id:'kong_b1',mode:'montage',title:'名字被写下的那天',opening:()=>`修院的孩子不取名。满周岁那天，长老在你的手腕上刻下第一道墨疤，算是记号。母亲在你耳边小声说了三个字，说完就让你忘掉。`,days:[360,420],minTurns:0,maxTurns:1,effects:{emotions:{爱:4,惧:4}},memory:'手腕上的第一道墨疤'},
    {id:'kong_b2',mode:'narration',title:'回声室',opening:()=>`你哭得太久，被抱进回声室。屋子会把你的哭声还给你，一遍一遍，直到你忘记自己为什么哭。`,ask:'你停下来了吗？',days:[2,10],minTurns:0,maxTurns:2,effects:{emotions:{惧:6}},memory:'回声室里的哭声'}
  ],
  child:[
    {id:'kong_c1',mode:'narration',title:'抄自己的名字',opening:()=>`先生让你抄一百遍自己的名字，可你没有名字。他想了想，让你改抄「空」。你抄到第七十几遍时，觉得那个字开始不像字。`,ask:'你抄完了吗？',days:[5,15],minTurns:1,maxTurns:3,effects:{stats:{智识:1},emotions:{哀:4}},memory:'抄了一百遍的空'},
    {id:'kong_c2',mode:'dialogue',npc:'mother',title:'墨池守的规矩',opening:()=>`母亲守墨池，从不问池底沉着谁的名字。今天她让你替她守一夜，只交代一句：听见有人叫你，不要应。`,line:'母亲问你：做得到吗？',days:[2,6],minTurns:2,maxTurns:3,effects:{emotions:{爱:4,惧:5}},memory:'母亲交代的那一夜'},
    {id:'kong_c3',mode:'narration',title:'会走路的房间',opening:()=>`修院有个房间，门牌被撕掉了，从此再没有人找得到。你昨天还在里面躲雨。`,ask:'你去找吗？',days:[2,6],minTurns:1,maxTurns:2,effects:{emotions:{惧:4}},memory:'找不到的房间'}
  ],
  teen:[
    {id:'kong_t1',mode:'dialogue',npc:'father',title:'父亲的笔迹',opening:()=>`父亲抄了三十年谱，字迹和印出来的一样。今天他让你替他抄一页，说抄错一个字，那个人就少活一天。`,line:'父亲问你：你敢下笔吗？',days:[3,10],minTurns:2,maxTurns:4,effects:{stats:{智识:1},emotions:{惧:4}},memory:'父亲交来的笔'},
    {id:'kong_t4',mode:'narration',title:'父亲的空缺',opening:()=>`你在谱房翻到一页，写着父亲的名字，后面却是一片留白。按理说，抄谱人也要被抄进去。`,ask:'你去问父亲吗？',days:[2,6],minTurns:1,maxTurns:3,effects:{emotions:{哀:5}},memory:'父亲名下的留白',chain:{step:'kong_w4'}},
    {id:'kong_t2',mode:'narration',title:'寻名者',opening:()=>`有个自称寻名者的人找到你，说能查出你的真名，代价是替他抄一份禁书。`,ask:'你答应吗？',days:[3,10],minTurns:1,maxTurns:3,effects:{importance:4},memory:'寻名者的交易',chain:{step:'kong_w1'}},
    {id:'kong_t3',mode:'dialogue',npc:'sibling',title:'手足的名字',opening:()=>`手足一直没有名字，别人只叫他小页。他说他偷偷给自己取了一个，写在纸上，藏在砖缝里。`,line:'手足问你：你要不要看？',days:[2,6],minTurns:2,maxTurns:3,effects:{bond:5,emotions:{爱:5}},memory:'砖缝里的名字'}
  ],
  land:[
    {id:'kong_l1',mode:'narration',title:'第一份差事',opening:()=>`你开始替香客保管姓名。他们把名字写在纸上交给你，你锁进柜子，每年收一次保管钱。有人三年没来取。`,ask:'你怎么处理？',days:[20,50],minTurns:1,maxTurns:3,effects:{coins:80,importance:3},memory:'没人来取的名字'},
    {id:'kong_l2',mode:'dialogue',npc:'faction',title:'无名议会',opening:()=>`无名议会的人来查柜子，说有三个名字被人取走了，而取走的人早已死了。`,line:'议会的人问你：最后一个开柜的是谁？',days:[2,6],minTurns:2,maxTurns:4,effects:{importance:5,emotions:{惧:5}},memory:'被取走的名字',next:'kong_l3'},
    {id:'kong_l3',mode:'narration',title:'墨池',opening:()=>`你第一次下墨池取墨。池底沉着无数被刮掉的名字，墨是黑的，水是清的，捞上来的时候会听见有人叫你。`,ask:'你应不应？',days:[2,8],minTurns:1,maxTurns:3,effects:{health:-6,emotions:{惧:6}},memory:'墨池底的名字'},
    {id:'kong_l4',mode:'aftermath',title:'香客的谢礼',opening:()=>`一个香客取回名字，临走时把一小袋钱放在你手里，说：谢谢你替我记住我还是谁。`,days:[3,10],minTurns:0,maxTurns:1,effects:{coins:60,emotions:{喜:4}},memory:'香客的谢礼'}
  ],
  world:[
    {id:'kong_w1',mode:'narration',title:'禁书',opening:()=>`寻名者给你的禁书里，有一页写着整个修院的真名目录。翻到中间，你看见了自己家的姓氏。`,ask:'你继续翻吗？',days:[1,3],minTurns:1,maxTurns:3,effects:{importance:7,emotions:{惧:6}},memory:'真名目录',next:'kong_w2'},
    {id:'kong_w2',mode:'dialogue',npc:'father',title:'父亲的罪',opening:()=>`父亲承认，他年轻时替人刮掉过一个名字。那个人后来死在门外，没有人认领。`,line:'父亲问你：你要不要替我把名字写回去？',days:[3,10],minTurns:2,maxTurns:4,effects:{emotions:{哀:6,爱:4}},memory:'父亲刮掉的名字',next:'kong_w3'},
    {id:'kong_w3',mode:'narration',title:'全院的钟同时失声',opening:()=>`有人在自己的留白处写下了院长的真名。那天所有钟同时失声，长老们一间间屋子搜查，查到谁，谁就少一段人生。`,ask:'你藏不藏？',days:[1,4],minTurns:1,maxTurns:3,effects:{importance:9,emotions:{惧:8}},memory:'钟声消失的那天'},
    {id:'kong_w4',mode:'dialogue',npc:'father',title:'父亲笔下的自己',opening:()=>`父亲抄了一辈子别人的名字，如今他的手开始抖。他把自己那一页从簿子上撕下来，交给你，说：我这半生，就当没写过。`,line:'父亲问你：你要不要替我把这一页补上？',days:[3,10],minTurns:2,maxTurns:4,effects:{emotions:{哀:8,爱:5}},memory:'父亲撕下的那一页'}
  ],
  random:[
    {id:'kong_r1',mode:'narration',title:'门牌',opening:()=>`你在回廊尽头捡到一块门牌，上头刻着一个名字。按规矩，捡到就该交上去烧掉。`,ask:'你交不交？',days:[1,4],minTurns:1,maxTurns:2,effects:{emotions:{惧:4}},memory:'捡到的门牌'},
    {id:'kong_r2',mode:'dialogue',npc:'sibling',title:'手足要走',opening:()=>`手足说他要去无名冢，把自己写进那里的石头，从此不被任何人管。`,line:'手足问你：你跟我一起走吗？',days:[3,10],minTurns:2,maxTurns:3,effects:{emotions:{爱:4,哀:4}},memory:'手足要去无名冢'},
    {id:'kong_r3',mode:'narration',title:'白蛾',opening:()=>`白蛾啃食废名纸，成群落在窗上。老人说，它们吃的是不要的名字，吃完会变成谁的梦。`,ask:'你赶不赶？',days:[1,3],minTurns:1,maxTurns:2,effects:{emotions:{哀:3,惧:3}},memory:'窗上的白蛾'}
  ]
}

});
