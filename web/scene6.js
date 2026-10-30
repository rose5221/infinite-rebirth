'use strict';

/* v6: scene-first life sim.
   Every scene is generated fresh (no fixed template pool), always offers exactly 3 choices,
   choices set flags that later scenes read, and each scene ends with 3 English words pulled
   from what just happened. */

const V6 = {};

/* ---------- seeded RNG so a scene can be reproduced but never repeats ---------- */
function rng(seed){
  let s = (seed>>>0) || 1;
  return function(){
    s ^= s<<13; s>>>=0; s ^= s>>>17; s ^= s<<5; s>>>=0;
    return s / 4294967296;
  };
}
function pick(r, arr){ return arr[Math.floor(r()*arr.length)]; }
function rint(r,a,b){ return a + Math.floor(r()*(b-a+1)); }

/* ---------- world vocabulary: makes text world-specific instead of generic ---------- */
function worldLex(){
  const w = world();
  const pack = (typeof DEPTH_WORLDS!=='undefined' && DEPTH_WORLDS[w.name]) || null;
  const locs = (w.locations||[]).map(l=>l.name||l);
  return {
    w, pack,
    name: w.name,
    currency: w.currency,
    home: (pack&&pack.home) || locs[0] || w.name,
    places: locs.length?locs:[w.name],
    factions: (w.factions||[]).map(f=>f.split(/[，。；：,]/)[0].slice(0,10)),
    risks: (w.risks||'').split(/[、，。]/).filter(Boolean),
    goods: (w.goods||[]).slice(0,4),
    daily: w.dailyLife||'',
    theme: w.theme||w.civilization||'',
    rule: w.worldAxis||'',
    tech: w.tech||'',
    belief: w.beliefs||'',
    family: (state.relationships||[]).filter(r=>r.family),
    others: (state.relationships||[]).filter(r=>!r.family&&!r.faction),
    place: currentPlace5(),
    season: ['初春','暮春','盛夏','初秋','深秋','初冬'][Math.floor(state.days/60)%6]
  };
}

/* ---------- three-choice scene builder ---------- */
function stageMinDays(){
  const k=stageKey();
  return ({infant:400,child:300,kid:280,teen:220,adult:200,mid:260,elder:300,dusk:330})[k]||90;
}
function scene6(opts){
  const L = worldLex();
  const sc = {
    id: opts.id || ('s6_'+Date.now()+'_'+Math.floor(Math.random()*9999)),
    mode: opts.mode || 'narration',
    arc: opts.arc || 'life',
    stage: stageKey(),
    title: opts.title,
    opening: opts.opening,
    ask: opts.ask || '',
    choices: (opts.choices||[]).slice(0,3),
    npcId: opts.npcId || null,
    npcName: opts.npcName || '',
    npcRole: opts.npcRole || '',
    location: opts.location || L.place,
    days: Math.max(opts.days||0, stageMinDays(), rint(Math.random,stageMinDays(),Math.floor(stageMinDays()*1.6))),
    effects: opts.effects || {},
    flags: opts.flags || [],
    weight: opts.weight || 3,
    english: [],
    recall: opts.recall || recallFor(opts.arc),
    keepChoices: !!opts.keepChoices
  };
  const core = String(sc.opening || '').split(/。\s*/).filter(x => x && x.length > 3);
  let head = (core[0] || '').slice(0, 90);
  // 世界名、地名常带“水/漕/关/门”这类字，先剔掉再取题，免得每段都叫“水上”
  for (const w of [L.name, sc.location, L.place].filter(Boolean)) head = head.split(w).join('　');
  const derived = opts.keepTitle ? null : titleOf(head, null);
  sc.title = derived || opts.title || '一个片段';
  const kidUnsafe = age() < 12 && sc.choices.some(c => ['profit','greed','gamble','expand','shop','marry','confess','seek'].includes(c.payload && c.payload.tone) || Math.abs((c.payload && c.payload.coins) || 0) > 40);
  if ((!opts.keepChoices || kidUnsafe) && typeof contextualizeChoices === 'function') contextualizeChoices(sc);
  return sc;
}
function C(title, desc, hint, payload){
  return {title, desc, hint, payload: payload||{}};
}
function recallFor(arc){
  const mem=(state.memories||[]).filter(m=>!arc||m.tags.includes(arc));
  if(!mem.length||Math.random()>0.6)return null;
  return mem[Math.floor(Math.random()*mem.length)];
}

/* ---------- generators: each writes fresh text from world + state ---------- */
function worldFlavor(){
  const L=worldLex(), r=Math.random;
  if(r()<0.55)return '';
  // 只取一小截日常细节，当背景，不塞百科条目
  const bits=[L.daily,L.belief,L.tech].filter(Boolean);
  if(!bits.length)return '';
  let t=pick(r,bits).split(/[。；，]/)[0].replace(/[。]+$/,'').trim();
  if(t.length>22)t=t.slice(0,22);
  return t ? ' ' + t + '。' : '';
}
function genEarlyChildhood(){
  const L=worldLex(), r=Math.random;
  const baby = age()<4;
  const rel = L.family[0];
  const famMap={'父':'父亲','母':'母亲','手足':'手足','家人':'家人'};
  const who = rel? (famMap[rel.family]||rel.family) : '家里人';
  const subj = rel? rel.name : '家里的大人';
  const templates = baby? [
    ()=>`你还不太会说话。${subj}抱着你在${L.place}走了一圈，指着${pick(r,[].concat(L.goods,['远处的屋顶','檐下的灯','一截旧绳']))||'远处的屋顶'}说了个词，你没听懂，只记住了那个音。`,
    ()=>`这一年家里过得紧。${who}把你放在${pick(r,L.places)}的边上，自己去忙。你哭了一会儿，后来自己睡着了。`,
    ()=>`你第一次发热。${subj}整夜没睡，用凉布擦你的额头。天快亮时你退了烧，${subj}才敢闭眼。`,
    ()=>`${L.riskLine||L.risks[0]||'外面出了点事'}。家里人把你藏进里屋，压低声音说话。你什么都不知道，只觉得那天特别长。`
  ] : [
    ()=>`${subj}第一次带你出门，去${pick(r,L.places)}。街上比你想象的大，${L.daily} 你紧紧抓着衣角，不敢松手。`,
    ()=>`你开始记事了。家里${pick(r,['缺钱','有人生病','在搬家','来了远亲','丢了一样东西'])}，大人们说话时会忽然停下来看你一眼。`,
    ()=>`你和邻家的孩子争一样东西，争到最后都哭了。${subj}没有骂你，只说：以后要学会让，也要学会不让。`,
    ()=>`${L.name}的${L.season}来得很早。家里按老规矩做了一件事，${L.belief||'没人说得清为什么'}。你被要求在旁边站着，不许问。`
  ];
  const text=pick(r,templates)();
  const flavor = worldFlavor();
  return scene6({
    mode: age()<4?'montage':'narration',
    arc:'child',
    title: pick(r,['家里的一天','第一次出门','记事的年纪','一个平常的年份','家里出了点事','灶上的火','雨漏下来','谁家办丧事','母亲的手','父亲晚归']),
    opening:text,
    ask: pick(r,['你那时做了什么？','你还记得什么？','你心里怎么想？']),
    days: age()<4? rint(r,300,600) : rint(r,60,200),
    choices:[
      C('照大人说的做','不添麻烦，先保住眼前这点安稳。','顺从 · 家人信任+',{bond:4,tone:'obey'}),
      C('偷偷按自己的想法来','哪怕会被发现。','胆量 · 风险+',{tone:'rebel',risk:1,emotion:{惧:3,欲:2}}),
      C('去问一个为什么','不听解释就不罢休。','好奇 · 智识+',{stats:{智识:1},tone:'ask'})
    ]
  });
}

function genWorkScene(){
  const L=worldLex(), r=Math.random;
  const job = state.occupation||'活计';
  const boss = pick(r,['掌柜','工头','东家','管事的','老账房']);
  const place = pick(r,L.places);
  const money = rint(r,80,260);
  const open = [
    ()=>`${place}的${boss}把一摞账推到你面前，说最近总对不上。${L.risks[0]||'外面不太平'}，铺子里的人手又少了一个。`,
    ()=>`你在${L.name}做${job}已经有些日子了。这天${boss}把你叫到一边，说有个活，钱多，但不太干净。`,
    ()=>`${L.season}的生意不好。${boss}说要裁一个人，让你自己想想，谁最该走。`,
    ()=>`一个熟客在店里闹起来，说东西是坏的。围观的人越来越多，${boss}不在。`
  ];
  return scene6({
    mode:'narration',arc:'work',
    title: pick(r,['铺子里的一天','账对不上','一个不太干净的活','走还是留','闹起来的人','少了半吊钱','货压在手里','熟客翻脸','新来的学徒','东家要盘账']),
    opening: pick(r,open)() + worldFlavor(),
    ask:'你打算怎么处理？',
    days: rint(r,10,60),
    choices:[
      C('按规矩来，哪怕得罪人','把事摆到明面上。','声望+ · 得罪人',{reputation:6,coins:Math.floor(money*0.6),tone:'rule'}),
      C('先把钱挣到手','装作没看见那些不对劲的地方。','钱+ · 名声-',{coins:money,tone:'greed',emotion:{恶:3}}),
      C('撂挑子，自己找出路','不干了，去别处碰碰运气。','自由 · 收入中断',{tone:'quit',flag:'left_job',emotion:{欲:4,惧:3}})
    ]
  });
}

function genFamilyScene(){
  const L=worldLex(), r=Math.random;
  const f=L.family.length?pick(r,L.family):null;
  const famMap={'父':'父亲','母':'母亲','手足':'手足','家人':'家人'};
  const who=f?f.name:'家里的人';
  const relKey=f?f.family:'家人';
  const rel=famMap[relKey]||relKey;
  const open=[
    ()=>f?`${who}（你的${rel}）近来不太对劲。夜里咳嗽，白天却说自己没事。`:`家里最年长的那位近来不太对劲。夜里咳嗽，白天却说自己没事。`,
    ()=>`${f?who:'家里的人'}把你叫住，说家里有件事必须让你知道：${pick(r,['欠了钱','有人提亲','老屋要卖','族里要分家','有人在背后说我们'])}。`,
    ()=>f?`${who}老了。这天你发现${rel}系鞋带时手在抖，却不肯让你帮。`:`家里最年长的那位老了。这天你发现他系鞋带时手在抖，却不肯让你帮。`,
    ()=>`${f?who:'家里的长辈'}忽然问起你以后怎么办。问得很轻，像是怕你听清。`
  ];
  return scene6({
    mode:'dialogue',arc:'family',npcId:f?f.id:null,npcName:who,npcRole:rel,
    title: pick(r,['家里的人','一件必须知道的事','老去的手','问起以后','一碗药','族里的意思','旧屋','分家','冬衣','谁欠了谁']),
    opening:pick(r,open)() + worldFlavor(),
    ask:'你想怎么回应？',
    days:rint(r,3,20),
    choices:[
      C('先顾眼前，把事压下去','说些让大家都好过的话。','表面安稳 · 问题留着',{bond:3,tone:'avoid',flag:'family_debt'}),
      C('摊开说清楚','把家里真正的难处摆到桌面上。','信任+ · 冲突+',{bond:6,emotion:{哀:4},tone:'honest'}),
      C('自己扛下来','不让他们再操心。','独自承担 · 健康-',{health:-5,reputation:3,tone:'carry'})
    ]
  });
}

function genLoveScene(){
  const L=worldLex(), r=Math.random;
  ensureSocial();
  const pool=(state.relationships||[]).filter(x=>!x.family&&!x.faction);
  if(!pool.length)return genSocialScene();
  const p=pick(r,pool);
  const st=relationStage5(p);
  const open=[
    ()=>`${p.name}最近常来找你。${p.trait} 你们说的话不多，但每次分开时都比上一次多站一会儿。`,
    ()=>`${p.name}约你在${L.place}见面。来了之后却一直没开口，只是看着别处。`,
    ()=>`${p.name}遇到麻烦，第一个想到的是你。对方没有明说，但你知道这不是随口一提。`,
    ()=>`有人在你面前提起${p.name}，语气不太客气。`
  ];
  const isDeep=['知己','伴侣'].includes(st);
  return scene6({
    mode:'dialogue',arc:'relation',npcId:p.id,npcName:p.name,npcRole:p.role,
    title: pick(r,['又见面了','没说出口的话','第一个想到你的人','别人嘴里的'+p.name,L.place+'的傍晚','一场雨','你走以后','一起吃饭','借来的伞']),
    opening:pick(r,open)(),
    ask:'你怎么做？',
    days:rint(r,3,45),
    choices:[
      C('把话说明白','不再绕圈子。','关系可能前进，也可能到此为止',{tone:'confess',flag:'confessed_'+p.id}),
      C('先陪着，不急着定义','有些事不需要今晚就有答案。','亲近+ · 稳妥',{bond:6,tone:'stay'}),
      C('拉开一点距离','你还有自己的事要顾。','关系- · 时间省下',{bond:-4,tone:'distance'})
    ]
  });
}

function genSocialScene(){
  const L=worldLex(), r=Math.random;
  ensureSocial();
  const pool=(state.relationships||[]).filter(x=>!x.family&&!x.faction);
  if(!pool.length)return genWorkScene();
  const p=pick(r,pool);
  return scene6({
    mode:'dialogue',arc:'relation',npcId:p.id,npcName:p.name,npcRole:p.role,
    title: pick(r,['街上的相遇','一个熟人','在'+L.place,'旧识','有人叫你','巷口','顺路','点头之交']),
    opening:`你在${L.place}遇见${p.name}。${p.trait} 对方似乎有话要说，又像是在等你先开口。`,
    ask:'你先说什么？',
    days:rint(r,2,10),
    choices:[
      C('问对方最近怎么样','把注意力放到别人身上。','亲近+',{bond:5,tone:'warm'}),
      C('聊点实际的，比如钱和活计','你更关心能不能一起做点什么。','可能得到机会',{coins:40,tone:'deal'}),
      C('打个招呼就走','你还有事。','关系不变',{tone:'brief'})
    ]
  });
}

function genCrisisScene(){
  const L=worldLex(), r=Math.random;
  const risk=L.risks.length?pick(r,L.risks):'一场意外';
  const fac=L.factions.length?pick(r,L.factions):'本地势力';
  const open=[
    ()=>`${risk}波及${L.place}。${fac}的人封锁了路口，家家关门。`,
    ()=>`半夜有人敲门，说${risk}已经到街口了，让大家赶紧走。`,
    ()=>`${fac}要征用你家的东西，说是为了应付${risk}。`,
    ()=>`${L.name}的长辈们聚在一起商量${risk}，争论到半夜没有结果。`
  ];
  return scene6({
    mode:'narration',arc:'crisis',
    title: pick(r,['夜里敲门','封路','征用','商量到半夜','火光','往哪跑','留下的人','关上的门']),
    opening:pick(r,open)(),
    ask:'这时候你做什么？',
    days:rint(r,1,10),
    effects:{},
    choices:[
      C('先保住家里人和东西','不逞强，先活下来。','安全 · 声望-',{health:2,reputation:-2,tone:'protect'}),
      C('出去看看能帮什么','总得有人站出来。','声望+ · 受伤风险',{reputation:8,health:-6,importance:4,tone:'brave'}),
      C('趁乱做一笔','别人慌的时候，东西便宜。','钱+ · 名声-',{coins:120,reputation:-5,tone:'profit'})
    ]
  });
}

function genBusinessScene(){
  const L=worldLex(), r=Math.random;
  const shopName = state.shopName || pick(r,['一间小铺','临街的摊子','半间铺面','推车摊']);
  const good = L.goods.length?pick(r,L.goods):'杂货';
  const open=[
    ()=>`你的${shopName}开张有些日子了。这月账上终于有了结余，但也有人在门口站了很久没进来。`,
    ()=>`有人想跟你合伙，说能进一批便宜的${good}，但要你先垫钱。`,
    ()=>`隔壁的铺子降价了。你的客人一天比一天少。`,
    ()=>`一个老主顾欠了账，说下月一定还。你看见他家里也不宽裕。`
  ];
  return scene6({
    mode:'narration',arc:'business',
    title: pick(r,['开张','合伙的人','隔壁降价','欠账的老主顾','第一批货','算盘','赊账','新客','关门那天']),
    opening:pick(r,open)(),
    ask:'你怎么决定？',
    days:rint(r,20,60),
    choices:[
      C('扩大本钱，赌一把','把积蓄压进去。','利润高 · 风险高',{coins:-Math.min(state.coins,200),tone:'expand',flag:'shop_expand'}),
      C('守住现在的规模','不求大，只求稳。','稳 · 小赚',{coins:80,tone:'steady'}),
      C('换个做法，做别人不做的','不跟他们抢。','可能打开新路',{stats:{智识:1},tone:'niche'})
    ]
  });
}

function genMarriageScene(){
  const L=worldLex(), r=Math.random;
  const pool=(state.relationships||[]).filter(x=>!x.family&&!x.faction);
  const p=pool.length?pick(r,pool):null;
  if(!p)return genSocialScene();
  return scene6({
    mode:'dialogue',arc:'marriage',npcId:p.id,npcName:p.name,npcRole:p.role,
    title: pick(r,['谈以后','有人来提亲','两个人的打算','住处','两家的意思','定亲','日子定在哪天']),
    opening:`${p.name}提起以后的事。${L.name}的人结婚讲究实在：住处、营生、两家能不能处得来。${p.name}没有催你，只是把话说到了这里。`,
    ask:'你怎么回答？',
    days:rint(r,5,30),
    keepChoices:true,
    choices:[
      C('定下来，一起过','把话说死，也把日子过起来。','成为伴侣 · 责任+',{tone:'marry',flag:'married_'+p.id,bond:15}),
      C('再等一等','现在还不是时候。','关系保留 · 对方会记住',{tone:'wait',bond:-2}),
      C('把话岔开','不想现在谈这个。','关系受损',{tone:'dodge',bond:-8})
    ]
  });
}

function genChildScene(){
  const L=worldLex(), r=Math.random;
  return scene6({
    mode:'narration',arc:'parent',
    title: pick(r,['孩子','第一声啼哭','抚养','夜里睡不着','学走路','第一次生病','叫了一声']),
    opening:`你和${state.spouse||'伴侣'}有了孩子。${L.name}的夜里很吵，孩子哭起来的时候，整条街都听得见。你抱着来回走，想起自己小时候也是这样被人抱着的。`,
    ask:'你想怎么养这个孩子？',
    days:rint(r,120,300),
    keepChoices:true,
    choices:[
      C('照自己小时候的方式养','把你受过的，原样传下去。','延续 · 孩子像你',{tone:'repeat',bond:5}),
      C('按自己希望被对待的方式养','把没得到的，给出去。','温柔 · 自己也会被治愈',{tone:'heal',emotion:{爱:6}}),
      C('先把日子过好，教育以后再说','活着比什么都重要。','务实 · 孩子早熟',{coins:60,tone:'practical'})
    ]
  });
}

function genAgingScene(){
  const L=worldLex(), r=Math.random;
  return scene6({
    mode:'montage',arc:'aging',
    title: pick(r,['身体先知道','一年不如一年','镜子里的人','上坡','阴天','药罐','睡得浅','手里的活慢了']),
    opening:`${age()}岁以后，身体开始先于心事说话。${pick(r,['爬楼要停一次','阴天膝盖疼','看小字要凑近','睡到半夜会醒'])}。${L.belief} 你开始算还剩多少年。`,
    ask:'',
    days:rint(r,180,360),
    choices:[
      C('花钱养身体','能拖一年是一年。','健康+ · 钱-',{health:8,coins:-150,tone:'health'}),
      C('不管，照旧过','反正是早晚的事。','健康- · 心情+',{health:-8,emotion:{喜:3},tone:'defy'}),
      C('去打听续命药','既然有得卖，就还有办法。','开启续命线 · 钱-',{coins:-50,flag:'pill_seek',tone:'seek'})
    ]
  });
}

const FAMILY_NAMES=['周','陈','林','许','沈','顾','陆','苏','程','叶'];
const FAMILY_GIVEN=['守','禾','安','渡','棠','砚','秋','石','顺','槐'];
function genericFamily(){
  const r=Math.random, L=worldLex();
  if(state.familySeeded&&state.relationships.some(x=>x.family))return;
  state.familySeeded=true;
  const sur=FAMILY_NAMES[Math.floor(r()*FAMILY_NAMES.length)];
  const used=new Set();
  const given=()=>{let g;do{g=FAMILY_GIVEN[Math.floor(r()*FAMILY_GIVEN.length)];}while(used.has(g));used.add(g);return g;};
  const jobs=[(L.w.identity||'做工的人'),'打零工的','守夜的','跑腿的','种地的'].filter(Boolean);
  const role=r()<0.5?'父':'母';
  const parent1={id:'fam_f',name:sur+given(),role:jobs[Math.floor(r()*jobs.length)],family:role,trait:'话不多，习惯把担心说成责备。',desire:'想让这个家撑过今年。',affinity:62,trust:58,romance:false,history:[],lastSceneKey:0};
  const parent2={id:'fam_m',name:sur+given(),role:jobs[Math.floor(r()*jobs.length)],family:role==='父'?'母':'父',trait:'把最好的部分留给你，把最难的话咽下去。',desire:'想让你过得比自己好。',affinity:66,trust:60,romance:false,history:[],lastSceneKey:0};
  const sib={id:'fam_s',name:sur+given(),role:L.w.identity||'帮工',family:'手足',trait:'和你一起长大，也和你争过同一碗饭。',desire:'想有一条自己的路。',affinity:52,trust:48,romance:false,history:[],lastSceneKey:0};
  state.relationships=[parent1,parent2,sib].concat((state.relationships||[]).filter(x=>!x.family));
}
/* ---------- director ---------- */
function directorPick6(){
  ensureLife5();
  const a=age(), k=stageKey(), r=Math.random;
  ensureSocial();
  if(age()<13)genericFamily();
  const recent=state.recentScenes||[];
  const beats=state.recentBeats||[];
  const ok=s=>{
    if(recent.includes(s.title))return false;
    const key=String(s.opening||'').slice(0,14);
    return !beats.includes(key);
  };

  // pending chain first
  if(state.chainQueue&&state.chainQueue.length){
    const nextId=state.chainQueue.shift();
    const built=chainScene(nextId);
    if(built)return finishScene6(built);
  }

  // an open thread comes due — old choices are supposed to come back
  state.threads=(state.threads||[]).filter(t=>t&&t.open);
  const due=state.threads.find(t=>state.days>=(t.due||0));
  if(due&&age()>=8&&r()<0.85&&typeof threadScene6==='function')return finishScene6(threadScene6(due));

  // the extra incident generators (variety beyond the ten base scenes)
  const gens=state.genHistory||[];
  const fresh=(name,fn)=>{
    if(gens.slice(-4).filter(x=>x===name).length>=2)return null;
    return fn();
  };
  if(typeof EXTRA_GENS6!=='undefined'){
    const extra=EXTRA_GENS6.filter(g=>{try{return g.when();}catch(e){return false;}});
    if(extra.length&&r()<0.52){
      const bag=[];
      for(const g of extra)for(let i=0;i<g.w;i++)bag.push(g);
      for(let i=0;i<4;i++){
        const g=pick(r,bag);
        const s=fresh(g.name,g.fn);
        if(s&&ok(s)){s.gen=g.name;return finishScene6(s);}
      }
    }
  }

  // stage entry (once)
  if(!state.stageSeen[k]){
    state.stageSeen[k]=true;
    const seeds={
      infant: ()=>genEarlyChildhood(),
      child:  ()=>genEarlyChildhood(),
      kid:    ()=>genEarlyChildhood(),
      teen:   ()=>genTeenScene(),
      adult:  ()=>genAdultOpening(),
      mid:    ()=>genMidScene(),
      elder:  ()=>genElderScene(),
      dusk:   ()=>genAgingScene()
    };
    const s=(seeds[k]||genWorkScene)();
    if(s&&ok(s))return finishScene6(s);
  }

  // weighted candidate mix by stage; always fresh text
  const pool=[];
  const add=(fn,name,w)=>{for(let i=0;i<w;i++)pool.push([fn,name]);};
  if(a<7){ add(genEarlyChildhood,'child',10); }
  else if(a<13){ add(genEarlyChildhood,'child',6); add(genFamilyScene,'family',3); }
  else if(a<19){ add(genTeenScene,'teen',5); add(genFamilyScene,'family',3); add(genSocialScene,'social',2); }
  else if(a<31){
    add(genWorkScene,'work',3); add(genSocialScene,'social',4); add(genLoveScene,'love',4); add(genFamilyScene,'family',2); add(genBusinessScene,'business',2); add(genCrisisScene,'crisis',1);
    if(state.flags.includes('married')||state.spouse) add(genChildScene,'childgrow',2);
    if(!state.spouse&&age()>=21&&(state.relationships||[]).some(x=>!x.family&&x.affinity>=40)) add(genMarriageScene,'marriage',4);
    if(state.shopName) add(genBusinessScene,'business',2);
  } else if(a<51){
    add(genWorkScene,'work',3); add(genFamilyScene,'family',3); add(genLoveScene,'love',2); add(genBusinessScene,'business',3); add(genCrisisScene,'crisis',2); add(genAgingScene,'aging',1);
    if(state.spouse) add(genChildScene,'childgrow',2);
  } else {
    add(genAgingScene,'aging',5); add(genFamilyScene,'family',3); add(genLoveScene,'love',2); add(genBusinessScene,'business',1); add(genCrisisScene,'crisis',1);
  }
  const recentGens=(state.genHistory||[]).slice(-3);
  for(let i=0;i<28;i++){
    const [fn,name]=pick(r,pool);
    if(recentGens.filter(x=>x===name).length>=2)continue;
    const s=fn();
    if(s&&ok(s)){s.gen=name;return finishScene6(s);}
  }
  return finishScene6(genWorkScene());
}

const TITLE_RULES = [
  [/对门|同行|快半步|抢先一步|当众把|落魄了/, '对门的人'],
  [/不该在那里的东西|叫出你的名字|那扇门|一行字|灯全灭了|不该下的雨/, '不该有的东西'],
  [/借宿|敲门|门外站着|檐下/, '门外的人'],
  [/捡到|拾到|半袋|旧木匣|磨平的铜片/, '捡来的东西'],
  [/传言|闲话|背后说|变了三遍|解释不清/, '传言'],
  [/定钱|一批便宜的|验货|秤|缺斤少两/, '一笔买卖'],
  [/梦|不认识的街|醒来时|枕头是湿/, '梦'],
  [/连下了|大风|霜来得|水涨上了岸|日头毒|雪压塌|风暴|天时/, '天时'],
  [/孩子问你|问你：|张了张嘴/, '问问题'],
  [/借.{0,6}钱|想借|开口借钱|欠你/, '开口'],
  [/师傅|手艺|料钱|成品|出师/, '手上的活'],
  [/集市|祭祖|告示|押着走|办喜事|挤满了人|街口/, '街口'],
  [/苏.{0,3}老了|系鞋带|手在抖|夜里咳嗽|不太对劲/, '老去'],
  [/丧|葬|棺|死|亡|钟|尸|碑/, '丧事'],
  [/发热|发烧|病|药|咳|疼|伤|医/, '一场病'],
  [/账|债|租|工钱|本钱|税|欠了钱|赊/, '一笔账'],
  [/灯油|灯芯|剪芯|灯下|一盏灯|日门|雾晶灯/, '灯下'],
  [/田|谷|种|收|穗|糠|星|地力/, '田里的事'],
  [/船|渡口|河水|井水|水路|桥|涨潮|赶潮|涨上了岸/, '水上'],
  [/婚|嫁|娶|提亲|媒|聘|亲事/, '婚事'],
  [/邻家|邻居|玩伴|争一样东西/, '邻里'],
  [/孩子|生养|啼哭|抚养/, '孩子'],
  [/出远门|上路|搬走|驿站|赶路|动身|离开这里/, '出门'],
  [/官|役|封|禁|规矩|令|征/, '官面的事'],
  [/集市|铺|摊|客|货|买|卖/, '铺子里'],
  [/母亲|父亲|手足|族里|祖|家里的大人|家里人/, '家里的人'],
  [/镜|记忆|梦|雾晶|档/, '记得的事'],
  [/雷|织|纸|甲|匠|坊|丝/, '手艺'],
];
function titleOf(text, fallback) {
  for (const [re, t] of TITLE_RULES) if (re.test(text)) return t;
  return fallback === null ? null : (fallback || '一个片段');
}
function uniqueTitle(base){
  const L=worldLex();
  const used=(state.seenScenes||[]);
  if(!used.includes(base))return base;
  const seasons=['初春','仲春','暮春','初夏','盛夏','夏末','初秋','仲秋','暮秋','初冬','隆冬','残冬'];
  for(const se of seasons){
    const t=base+'·'+se;
    if(!used.includes(t))return t;
  }
  for(const pl of L.places){
    for(const se of ['初春','盛夏','暮秋','隆冬']){
      const t=base+'·'+pl+'·'+se;
      if(!used.includes(t))return t;
    }
  }
  return base+'·'+L.place+'·'+(used.length+1);
}
function finishScene6(s){
  if(s.gen){
    state.genHistory=state.genHistory||[];
    state.genHistory.push(s.gen);
    if(state.genHistory.length>12)state.genHistory.shift();
  }
  s.title=uniqueTitle(s.title);
  if(!state.seenScenes.includes(s.title))state.seenScenes.push(s.title);
  s.english=pickWords3(s);
  return s;
}

function genAdultOpening(){
  const L=worldLex(), r=Math.random;
  return scene6({
    mode:'narration',arc:'opening',
    title:'你要靠什么活下去',
    opening:`成年了。${L.name}的${L.season}，你站在${L.place}，手里没有多少钱，也没有人替你安排以后。${L.daily}`,
    ask:'你打算先做什么？',
    days:rint(r,10,40),
    keepChoices:true,
    choices:[
      C('找一份工','先有饭吃，再谈别的。','收入 · 稳定',{tone:'work',flag:'path_work'}),
      C('学一门手艺','宁可慢一点，也要学个长久的。','智识+ · 短期没钱',{stats:{智识:1},tone:'study',flag:'path_study'}),
      C('做点小买卖','自己给自己干活。','本钱- · 可能赚',{coins:-40,shop:'一间小铺',tone:'business',flag:'path_business'})
    ]
  });
}

function genTeenScene(){
  const L=worldLex(), r=Math.random;
  const open=[
    ()=>`${age()}岁，你开始想以后。${L.name}的同龄人有的去学徒，有的留在家里，有的已经定了亲。`,
    ()=>`先生/师傅问你以后想做什么。你说不上来，但知道不能一直这样。`,
    ()=>`家里要你做个选择：留下帮忙，还是出去闯。两边都有道理。`,
    ()=>`你在${L.place}看见一个和你差不多大的人，穿得比你好，说话也比你稳。你第一次觉得不甘心。`
  ];
  return scene6({
    mode:'narration',arc:'teen',
    title: pick(r,['想以后','师傅问的话','两条路','不甘心','同龄人','第一次撒谎','出门','留下的理由','有人提亲']),
    opening:pick(r,open)() + worldFlavor(),
    ask:'你怎么选？',
    days:rint(r,30,120),
    choices:[
      C('留在熟悉的地方','稳一点，至少不会饿死。','安定 · 见识少',{tone:'stay'}),
      C('出去看看','哪怕什么都得不到。','见识+ · 风险',{stats:{机缘:1},emotion:{欲:4},tone:'leave'}),
      C('先学一门本事','有手艺在身，去哪里都不怕。','智识+ · 慢',{stats:{智识:1},tone:'learn'})
    ]
  });
}

function genMidScene(){
  const L=worldLex(), r=Math.random;
  return scene6({
    mode:'narration',arc:'mid',
    title: pick(r,['中年','上有老下有小','撑住','两头跑','账本','一夜没睡','父亲病了','孩子的学费']),
    opening:`${age()}岁。${L.name}的${L.season}。${state.spouse?'家里有'+state.spouse+'，':''}${(state.children||0)>0?'还有'+(state.children||0)+'个孩子，':''}上面还有老人。你发现自己的时间不再只属于自己。`,
    ask:'这一年你打算怎么过？',
    days:rint(r,120,300),
    choices:[
      C('拼命挣钱','把能接的活都接下来。','钱+ · 健康-',{coins:200,health:-10,tone:'grind'}),
      C('多陪家里人','钱少一点，但别留下遗憾。','亲情+ · 钱-',{bond:10,coins:-60,emotion:{爱:5},tone:'family'}),
      C('给自己留一条后路','偷偷攒一笔，不让任何人知道。','安全感+ · 家人可能不满',{coins:120,flag:'secret_fund',tone:'secret'})
    ]
  });
}

function genElderScene(){
  const L=worldLex(), r=Math.random;
  return scene6({
    mode:'narration',arc:'elder',
    title: pick(r,['老了','交代','剩下的日子','门口','旧友','遗物','最后一趟','坐了很久']),
    opening:`${age()}岁。${L.name}的街还是那条街，认得的人却少了。${state.children?`孩子${state.children>1?'们':''}偶尔回来。`:'身边没有孩子。'}你开始把东西一件件送人。`,
    ask:'你想怎么安排剩下的日子？',
    days:rint(r,180,360),
    choices:[
      C('把该说的都说了','不留没说完的话。','关系+ · 平静',{bond:8,emotion:{爱:4},tone:'peace'}),
      C('再挣一点，留给后人','能留多少留多少。','钱+ · 身体-',{coins:150,health:-8,tone:'save'}),
      C('一个人安静过','不再管别人的事。','清静 · 关系-',{bond:-5,emotion:{哀:3},tone:'alone'})
    ]
  });
}

function chainScene(id){
  // chains are small named follow-ups, still written fresh
  const L=worldLex(), r=Math.random;
  if(id==='pill_after') return scene6({mode:'narration',arc:'pill',title:'续命之后',opening:`药很贵，但确实有用。${age()}岁这年，你发现自己还能像从前一样走上坡路。${L.belief} 只是你不知道，多出来的这些年，该拿来做什么。`,ask:'',days:rint(r,60,180),choices:[
    C('继续攒钱，再买一颗','把活着当成一件要长期投入的事。','健康+ · 钱-',{health:6,coins:-200,flag:'pill_keep'}),
    C('把时间用在人身上','去看一直没去看的人。','关系+',{bond:10,emotion:{爱:5}}),
    C('做一件一直想做的事','不再等。','心愿+ · 风险',{importance:6,health:-4})
  ]});
  if(id==='child_grow') return scene6({mode:'montage',arc:'parent',title:'孩子长大',opening:`孩子会走路了，会叫人了，开始问你一些你答不上来的问题。你在孩子脸上看见自己，也看见一些不属于你的东西。`,ask:'',days:rint(r,300,600),choices:[
    C('教孩子自己的手艺','把自己会的传下去。','传承',{bond:8}),
    C('让孩子自己选','不替他决定。','自由',{bond:5,emotion:{爱:4}}),
    C('把孩子送出去见世面','哪怕舍不得。','见识+ · 分离',{coins:-100,bond:3})
  ]});
  return null;
}

/* ---------- English: 3 words taken from this scene ---------- */
/* keyword -> word, so the three words really come from what just happened */
const WORD_LINKS=[
  [/婚|嫁|娶妻|成亲|亲事|提亲|伴侣|成家|孩子|生下|生子/,['x_affection','x_accompany','x_mutual','x_vulnerable','companionship']],
  [/钱|债|账|价|买|卖|工钱|本钱|攒/,['x_compensate','x_allocate','x_resource','debt','bargain']],
  
  [/病|伤|疼|身体|老|死|药|寿/,['x_endure','x_resilient','x_survive','remedy','x_consequence']],
  [/危险|风险|抢|斗|封|乱|逃|灾/,['x_confront','x_inevitable','x_endure','refuge','x_scarce']],
  [/学|读|书|师|手艺|本事|认字/,['x_acquire','x_discipline','x_comprehend','x_derive','x_illustrate']],
  [/官|规矩|法|势力|权|征|税/,['x_authority','x_influence','x_alliance','x_valid','x_strategy']],
  [/路|走|离|去|远|搬|渡|船/,['x_pursue','x_adapt','voyage','border','x_transform']],
  [/家里人|母亲|父亲|手足|兄弟|姐妹|族人|祖|家人/,['x_affection','x_sustain','inheritance','x_vulnerable','x_mutual']],
  [/生意|铺|摊|客|货|利/,['x_strategy','x_assess','bargain','contract','x_resource']],
  [/怪|异|梦|影|声|看|镜|光/,['x_phenomenon','x_interpret','x_comprehend','memory','x_significant']],
  [/人|朋|友|邻|熟|认识/,['x_affection','x_interpret','x_mutual','companionship','x_influence']]
];
function pickWords3(scene){
  const text=(scene.title||'')+' '+(scene.opening||'')+' '+(scene.ask||'')+' '+(scene.choices||[]).map(c=>c.title+c.desc).join(' ');
  const bags=[];
  for(const [re,ids] of WORD_LINKS){
    if(re.test(text))bags.push(ids);
  }
  const out=[];
  const seen=new Set((state.englishSeen||[]));
  // take from up to three different idea-bags first
  let bagIndex=0;
  for(const bag of bags){
    let taken=0;
    const quota = bagIndex===0?2:1;
    for(const id of bag){
      if(taken>=quota||out.length>=3)break;
      const w=EXAM_WORDS.find(x=>x.id===id)||ENGLISH_PACK.find(x=>x.id===id);
      if(w&&!seen.has(w.id)&&!out.includes(w)){out.push(w);taken++;}
    }
    bagIndex++;
  }
  // then any word from the bags
  for(const bag of bags){
    if(out.length>=3)break;
    for(const id of bag){
      if(out.length>=3)break;
      const w=EXAM_WORDS.find(x=>x.id===id)||ENGLISH_PACK.find(x=>x.id===id);
      if(w&&!out.includes(w))out.push(w);
    }
  }
  // last resort: arc pool
  let h=hashText(scene.id+'-'+(state.days||0));
  const arcPool=EXAM_WORDS.filter(w=>w.tags.includes(scene.arc));
  while(out.length<3&&arcPool.length){h=(h*1664525+1013904223)>>>0;out.push(arcPool.splice(h%arcPool.length,1)[0]);}
  return out.slice(0,3);
}

/* ---------- resolution: choice -> effects -> flags -> chain ---------- */
function resolveScene6(choiceIndex){
  const s=state.scene;
  if(!s||!s.choices||!s.choices[choiceIndex])return;
  const ch=s.choices[choiceIndex];
  const p=Object.assign({},ch.payload||{});
  const L=worldLex();
  let outcome='';

  // 赌一把的选项真的会摇：机缘决定成败，成败改写这一段的收益
  let riskRoll=null;
  if(p.risk){
    const luck=state.stats.机缘||1;
    const chance=Math.max(.28,Math.min(.86,.45+luck*.03-(p.tone==='gamble'?.05:0)));
    const won=Math.random()<chance;
    riskRoll={won,chance:Math.round(chance*100)};
    if(won){
      p.coins=Math.round((p.coins||0)*1.8)+20;
      p.reputation=(p.reputation||0)+2;
    }else{
      p.coins=-(Math.abs(p.coins||0)+Math.round(40+Math.random()*80));
      p.health=(p.health||0)-6;
      p.reputation=(p.reputation||0)-2;
    }
  }

  if(p.stats)for(const k in p.stats)state.stats[k]=Math.max(1,Math.min(20,(state.stats[k]||1)+p.stats[k]));
  if(p.coins)state.coins=Math.max(0,state.coins+p.coins);
  if(p.health)state.health=Math.max(1,Math.min(100,state.health+p.health));
  if(p.reputation)state.reputation=Math.max(0,state.reputation+p.reputation);
  if(p.importance)state.importance=Math.min(100,state.importance+p.importance);
  if(p.bond)state.bond=Math.min(100,Math.max(0,state.bond+p.bond));
  if(p.emotion)changeEmotion(p.emotion);
  if(p.flag){(state.flags=state.flags||[]).push(p.flag);}
  if(p.thread){
    state.threads=state.threads||[];
    state.threads.push({id:'th_'+Date.now()+'_'+Math.floor(Math.random()*999),text:String(p.thread).slice(0,60),age:age(),days:state.days,due:state.days+Math.floor(180+Math.random()*420),open:true,scene:null});
    if(state.threads.length>12)state.threads=state.threads.slice(-12);
  }
  if(p.shop){state.shopName=p.shop;state.flags.push('shop_open');}

  // relationship effects
  if(s.npcId){
    const r=state.relationships.find(x=>x.id===s.npcId);
    if(r){
      const d=p.tone==='confess'?(r.affinity>=55?12:-6)
        :p.tone==='marry'?12
        :p.tone==='warm'?6
        :p.tone==='stay'?7
        :p.tone==='distance'?-6
        :p.tone==='dodge'?-8
        :p.tone==='wait'?-2
        :p.bond||0;
      r.affinity=Math.max(0,Math.min(100,r.affinity+d));
      if(p.tone==='marry'&&r.affinity>=40){r.romance=true;state.spouse=r.name;state.flags.push('married');}
      if(p.tone==='confess'&&r.affinity>=55){r.romance=true;state.spouse=state.spouse||r.name;state.flags.push('married');}
      r.lastSceneKey=state.days;
    }
  }

  // outcome text follows the choice tone + world
  const toneText={
    obey:`你照做了。那天没有出事，${L.family[0]?L.family[0].name:'家里人'}看你的眼神松了一点。`,
    rebel:`你没忍住。事情闹到大人那里，挨了一顿说。但你心里知道自己不会一直听话。`,
    ask:`你问了。对方没有立刻回答，过了很久才说：等你长大就明白了。`,
    rule:`你把事情摆到明面上。有人不高兴，但更多人记住了你是个讲规矩的人。`,
    greed:`钱到手了。晚上你数钱的时候，想起白天那些不对劲的地方，没让自己多想。`,
    quit:`你撂下了手里的活。走出门的那一刻很轻松，第二天开始发愁。`,
    protect:`你先把家里人安顿好。后来有人议论你胆小，你没有反驳。`,
    brave:`你冲了出去。事情没有完美收场，但街上的人记住了你的脸。`,
    profit:`你趁乱赚了一笔。有人看你的眼神变了。`,
    expand:`你把钱压了进去。接下来几个月，你每天都睡不踏实。`,
    steady:`你没有扩大。铺子还是老样子，但账上每一笔都查得清。`,
    niche:`你换了个做法。一开始没人看好，后来慢慢有了回头客。`,
    stay:`你留了下来。日子一眼望得到头，但至少踏实。`,
    leave:`你走了。路上吃了不少苦，也见了以前没见过的东西。`,
    learn:`你开始学。学得慢，但每天都在往前走。`,
    grind:`你把自己熬得很累。钱是多了，可身体开始报警。`,
    family:`你把时间留给了家里人。钱少了一些，饭桌上的话多了。`,
    secret:`你偷偷攒下一笔。没有人知道，你也没打算说。`,
    peace:`你把该说的都说了。有些话说出口，人反而轻松。`,
    save:`你还在攒。留给谁其实你也没想清楚。`,
    alone:`你一个人过。清静，偶尔也空。`,
    health:`你花钱养身体。药不难吃，就是贵。`,
    defy:`你没管。该吃吃该喝喝，身体该坏还是坏。`,
    seek:`你去打听续命药。有人告诉你价格，你沉默了很久。`,
    warm:`你们聊了一会儿。没什么结果，但下次见面会更自然。`,
    deal:`你们谈成一笔小生意。钱不多，关系倒是近了一点。`,
    brief:`你打了个招呼就走。对方站在原地，看你走远。`,
    confess:'',
    marry:'',
    wait:'',
    dodge:'',
    repeat:`你照着自己小时候的方式养。有时候你听见自己的语气，像极了你父亲。`,
    heal:`你按自己希望被对待的方式养。孩子哭的时候，你先蹲下来。`,
    practical:`你先把日子过好。孩子很早学会了自己照顾自己。`,
    carry:`你把事扛了下来。没有人知道，你也没打算说。`,
    honest:`你把话说开了。家里吵了一架，但吵完之后，反而比以前实在。`,
    avoid:`你把话岔开了。那件事没有解决，只是暂时没人提。`
  };
  const extraTone={
    bargain:`你跟对方一点点磨。最后让了一步，也算省下一点。`,
    report:`你把事交到了上面。事情办得快，只是从此欠了一个人情。`,
    hide:`你把它瞒了下来。日子照旧，只是每次有人提起，你都要先想一下怎么答。`,
    gamble:`你把钱押了上去。开牌那一刻，手心里全是汗。`,
    pray:`你按老规矩做了一遍。有没有用说不清，心里倒是静了一点。`,
    repair:`你自己动手，弄了几天，总算恢复了大半。`,
    escort:`你陪着走了一趟。路上不算太平，但人平安到了。`,
    sell:`你折价出了手。钱是拿到了一点，心里空了一块。`,
    collect:`你上门把账要了回来。钱回来了，这门亲戚也淡了。`,
    teach:`你耐着性子教了一遍。对方学会的时候，你比自己学会还高兴。`,
    witness:`你站出来把看见的说了。有人谢你，也有人记住了你的脸。`,
    keep:`你把它收了起来。夜里想起，会翻出来看一眼。`,
    trade:`你做了一笔小买卖。赚得不多，路子倒是摸清了一点。`,
    tell:`你跑去把大人叫了来。事情最后怎么解决的你不知道，但你记得自己跑得很快。`,
    ignore:`你没有接话，低头做自己的活。对方说了几句，见没人应，也就散了。`,
    help:`你把手上的事放下，先去帮了。忙完天已经黑了，自己那摊事还堆着。`,
    sneak:`你背着人试了一次。没出事，也没人知道；只是从那以后，你心里多了一点自己的主意。`,
    pay:`钱付出去的时候心疼，事情办完却干净。回去的路上，你觉得肩轻了一点。`,
    borrow:`钱拿到了，字据也画了押。走出门你才想起，往后每个月的这一天都得记着。`,
    refuse:`你没有点头。对方脸色变了一下，说了句“随你”，转身走了。`,
    escape:`你走了。风头是避过去了，可等你回来，位置已经换了人。`,
    risk:`你把这一把押了下去。手心里全是汗，最后是盈是亏，只能等天亮。`,
    study:`你开始学。学得慢，手上也生，但每天晚上都比前一天多懂一点。`,
    elder:`你去问了。对方说的不一定对，但至少你没有自己瞎猜。`,
    distance:`你退了一步。日子还是照过，只是再见面时，话少了一半。`,
    shop:`你把本钱压进了一间小铺。开张那天没什么人，你站在柜台后面，从早等到晚。`
  };
  outcome=(extraTone[p.tone]||'')||toneText[p.tone]||'事情就这样过去了。';
  if(ch.outcome)outcome=ch.outcome;
  if(riskRoll){
    outcome=riskRoll.won
      ? `你赌赢了。${outcome}`
      : `你赌输了。钱没了大半，人也伤了。${L.place}的人看着你从地上爬起来，没有人伸手。`;
  }

  // consequence nudges
  if(p.tone==='confess'&&state.spouse)outcome=`你把话说出口。${s.npcName}没有立刻回答，只是把手放进你的掌心。你们决定一起走一段路。`;
  if(p.tone==='confess'&&!state.spouse)outcome=`你把话说出口。${s.npcName}听懂了，却没有回应。你们都没有再提这件事。`;
  if(p.tone==='marry')outcome=state.spouse?`你们把事定了下来。${L.name}的婚事讲究实在，没有太多浪漫，但从这天起，你们是一家人。`:`${s.npcName}没有答应。你说不清是时机不对，还是人不对。`;
  if(p.tone==='wait')outcome=`你说再等等。${s.npcName}点头，说好。你不知道这个“等等”会有多长。`;
  if(p.tone==='dodge')outcome=`你把话岔开了。${s.npcName}笑了一下，没再问。那之后，联系就少了。`;

  // marriage/child bookkeeping
  if(state.flags.includes('married')&&!state.children&&age()>=20&&Math.random()<0.5){
    state.children=1;
    state.chainQueue.push('child_grow');
  }
  if(state.flags.includes('pill_seek')&&!state.flags.includes('pill_done')){
    state.flags.push('pill_done');
    state.chainQueue.push('pill_after');
  }

  // time + money
  const days=s.days||30, months=days/30;
  const before=state.coins;

  // 成年路口真正决定营生：找了工就有工钱，学了手艺就慢慢有活，开了铺子就有流水
  if(p.flag==='path_work'&&!state.employed){
    state.employed=true;state.salary=Math.floor(annualIncome()/12);state.occupation='雇工';
  }
  if(p.flag==='path_study'){state.study=true;}
  if(p.flag==='path_business'&&!state.employed){
    state.employed=true;state.salary=Math.floor(annualIncome()/12*0.82);state.occupation='小贩';
  }
  if(state.study&&age()>=17&&!state.employed&&Math.random()<0.5){
    state.employed=true;state.salary=Math.floor(annualIncome()/12*0.9);state.occupation='手艺人';
  }

  let income=state.employed?Math.floor(Math.min(state.salary||0,annualIncome()/12)*months):0;
  if(!state.employed&&age()>=16&&age()<58){
    // 没正经营生的人靠打零工活着：饿不死，也攒不下
    income+=Math.floor(monthlyLiving()*months*0.58);
    state.flags=state.flags||[];
    if(!state.flags.includes('odd_jobs'))state.flags.push('odd_jobs');
  }
  let cost=0;
  if(age()>=18){
    const due=Math.floor(monthlyLiving()*months);
    const pot=state.coins+income;
    cost=Math.min(pot,due);
    state.coins=Math.max(0,pot-cost);
    if(cost<due*0.6&&!state.employed){
      state.health=Math.max(1,state.health-3);
      changeEmotion({哀:3});
    }
  }else{
    state.coins=Math.max(0,state.coins+income);
  }

  advance5(days);
  const settleMonth=monthLabel();

  // memory + chronicle
  remember(s,outcome);
  if(!state.seenScenes.includes(s.title))state.seenScenes.push(s.title);
  rememberSceneId(s.title);
  state.chronicle.unshift({year:cal().year,title:s.title,detail:outcome});

  const gains=[];
  if(income)gains.push({k:age()>=16?'收入':'家用',v:income,c:'good'});
  if(cost)gains.push({k:'支出',v:-cost,c:'bad'});
  if(p.coins)gains.push({k:'钱',v:p.coins,c:p.coins>0?'good':'bad'});
  if(p.bond)gains.push({k:'亲近',v:p.bond,c:p.bond>0?'good':'bad'});
  if(p.stats)for(const k in p.stats)gains.push({k,v:p.stats[k],c:p.stats[k]>0?'good':'bad'});
  if(p.health)gains.push({k:'健康',v:p.health,c:p.health>0?'good':'bad'});
  if(p.reputation)gains.push({k:'声望',v:p.reputation,c:p.reputation>0?'good':'bad'});
  if(p.importance)gains.push({k:'重要度',v:p.importance,c:'good'});

  const enByTone={
    obey:'The child did as told. Nothing went wrong that day, and the family relaxed a little.',
    rebel:'The child disobeyed. It ended in a scolding, but something in the child refused to stay small.',
    ask:'The child asked why. The answer was put off, as answers usually are.',
    rule:'It was handled by the rules, in the open. Some people disliked it; more people remembered.',
    greed:'The money was taken. That night the doubtful parts were deliberately not thought about.',
    quit:'The work was put down. The first steps out were light; the next morning was not.',
    protect:'The family was seen to first. Later there were whispers of cowardice, and no reply was made.',
    brave:'The street was stepped into. It did not end cleanly, but the face was remembered.',
    profit:'A profit was made out of other people\'s panic. Some looks changed afterwards.',
    health:'Money went into the body. Medicine is not pleasant, only expensive.',
    defy:'Nothing was done about it. What breaks, breaks.',
    seek:'Questions were asked about the life-extending pills. The price was heard, and there was a long silence.'
  };
  state.result6={
    title:s.title, choice:ch.title, outcome, gains,
    outcomeEN:enByTone[p.tone]||'',
    sceneSnapshot:{title:s.title,opening:s.opening,ask:s.ask,choice:ch.title,tone:p.tone||''},
    thread:p.thread||'',
    days, age:age(), words:s.english||[], risk:riskRoll,
    next:s.choices[choiceIndex]&&ch
  };
  state.lastBeat={age:age(),title:s.title,choice:ch.title,outcome:outcome.slice(0,90)};
  if(typeof prefetchNext6==='function')prefetchNext6();
  state.recentBeats=state.recentBeats||[];
  state.recentBeats.push(String(s.opening||'').slice(0,14));
  if(state.recentBeats.length>10)state.recentBeats.shift();
  state.dialog=[];state.sceneTurns=0;state.sceneStats={warmth:0,resolve:0,honesty:0};
  state.scene=null;
  save();render();
}

function continueScene6(){
  if(state.busy)return;
  state.result6=null;
  state.scene=null;
  page='scene';save();render();
}
function rerollScene6(){
  if(sceneBusy6)return;
  state.scene=null;save();render();
  toast('换一段');
}
