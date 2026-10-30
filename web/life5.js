'use strict';

/* v5 life engine — age stages, event director, event chains, memory-driven continuity.
   Loaded after month.js and replaces the monthly loop. */

const LIFE5 = {version:'5.0'};
const STAGES5 = [
  {key:'infant', from:0, to:3, label:'婴幼'},
  {key:'child', from:4, to:6, label:'幼年'},
  {key:'kid', from:7, to:12, label:'童年'},
  {key:'teen', from:13, to:18, label:'少年'},
  {key:'adult', from:19, to:30, label:'青年'},
  {key:'mid', from:31, to:50, label:'中年'},
  {key:'elder', from:51, to:70, label:'晚年'},
  {key:'dusk', from:71, to:200, label:'余晖'}
];
function stage5(){const a=age();return STAGES5.find(s=>a>=s.from&&a<=s.to)||STAGES5[STAGES5.length-1];}
function stageKey(){return stage5().key;}

function emotionFx(a){
  const fx=[];
  if(a.warm>0)fx.push({k:'喜',v:3},{k:'爱',v:1});
  if(a.warm<0)fx.push({k:'怒',v:2},{k:'哀',v:2});
  if(a.resolve>0)fx.push({k:'欲',v:1},{k:'惧',v:-2});
  if(a.resolve<0)fx.push({k:'惧',v:3},{k:'喜',v:-1});
  if(a.honest)fx.push({k:'恶',v:-1});
  return fx.filter(x=>x.v);
}
function fxChips(list){
  if(!list||!list.length)return '';
  return `<div class="fx">${list.map(x=>`<span class="chip ${x.v>0?'up':'down'}">${esc(x.k)} ${x.v>0?'+':''}${x.v}</span>`).join('')}</div>`;
}
function ensureMetaSoul(){
  if(!meta.soul)meta.soul={lives:0,worlds:[],lessons:[],kept:[]};
  if(!Array.isArray(meta.soul.worlds))meta.soul.worlds=[];
  if(!Array.isArray(meta.soul.lessons))meta.soul.lessons=[];
  if(!Array.isArray(meta.soul.kept))meta.soul.kept=[];
}
function recordLifeLesson(){
  ensureMetaSoul();
  const strong=(state.memories||[]).filter(m=>m.importance>=2).slice(0,6);
  const lesson={
    world:world().name, age:age(), ended:cal().year,
    people:(state.relationships||[]).filter(r=>!r.family).map(r=>r.name+'('+relationStage5(r)+')').slice(0,4),
    lines:strong.map(m=>m.age+'岁 · '+m.title)
  };
  meta.soul.lives+=1;
  meta.soul.worlds.push(world().name);
  meta.soul.lessons.unshift(lesson);
  if(meta.soul.lessons.length>8)meta.soul.lessons.length=8;
  // keep up to 12 strongest memories as cross-life echoes
  for(const m of strong){
    if(meta.soul.kept.length>=12)break;
    meta.soul.kept.unshift({world:world().name,age:m.age,title:m.title,text:m.text});
  }
  if(meta.soul.kept.length>12)meta.soul.kept.length=12;
  saveMeta();
}
function nextWorldIndex(){
  const cur=state.worldIndex<0?0:state.worldIndex;
  const alive=WORLDS.map((w,i)=>i).filter(i=>i!==cur);
  // prefer depth worlds that were not lived yet
  const lived=new Set((meta.soul&&meta.soul.worlds)||[]);
  const fresh=alive.filter(i=>!lived.has(WORLDS[i].name));
  const pool=fresh.length?fresh:alive;
  return pool[Math.floor(Math.random()*pool.length)];
}
function rebirthIntoNext(){
  ensureMetaSoul();
  recordLifeLesson();
  const keepName=state.name, keepSex=state.sex, keepStats={...state.stats}, keepTalents=[...state.talents];
  const nextIdx=nextWorldIndex();
  resetLife();
  state.worldIndex=nextIdx;
  state.identity=WORLDS[nextIdx].identity||'流浪者';
  state.name=keepName;state.sex=keepSex;
  state.stats={...keepStats};state.baseStats={...keepStats};
  state.talents=keepTalents.slice(0,3);
  state.screen='play';
  beginLife5();
  // echoes of past lives
  state.pastLives=(meta.soul.kept||[]).slice(0,3);
  state.relationNote=`你带着上一世的记忆醒来，这里是${world().name}。有些画面还认得，有些名字已经想不起。`;
  save();render();
}
function ensureLife5(){
  if(typeof state.packProgress!=='object'||!state.packProgress)state.packProgress={};
  if(!Array.isArray(state.chainQueue))state.chainQueue=[];
  if(!Array.isArray(state.memories))state.memories=[];
  if(!Array.isArray(state.relationships))state.relationships=[];
  if(typeof state.familySeeded!=='boolean')state.familySeeded=false;
  if(typeof state.stageSeen!=='object'||!state.stageSeen)state.stageSeen={};
  if(!Array.isArray(state.seenScenes))state.seenScenes=[];
  if(typeof state.memoir!=='string')state.memoir='';
  if(!Array.isArray(state.englishSeen))state.englishSeen=[];
  if(!state.emotions)state.emotions={喜:30,怒:20,哀:20,惧:20,爱:30,恶:15,欲:30};
}

function activePack(){ensureLife5();return DEPTH_WORLDS[world().name]||null;}
function packPhaseKey(){return stageKey();}
function phaseEvents(pack){
  if(!pack)return {baby:[],child:[],teen:[],land:[],world:[],random:[]};
  const k=stageKey();
  const baby=pack.baby||[],child=pack.child||[],teen=pack.teen||[],land=pack.land||[],worldE=pack.world||[],random=pack.random||[];
  if(k==='infant')return {pool:baby,phase:'baby'};
  if(k==='child'||k==='kid')return {pool:child,phase:'child'};
  if(k==='teen')return {pool:teen,phase:'teen'};
  return {pool:[...land,...worldE,...random],phase:'adult'};
}

/* ---------- family ---------- */
function ensureSocial(){
  ensureLife5();
  if(age()<13)return;
  const others=state.relationships.filter(r=>!r.family&&!r.faction);
  if(others.length)return;
  const start=state.worldIndex%NPC_NAMES.length;
  const made=[0,1].map(i=>{
    const name=NPC_NAMES[(start+i*5+2)%NPC_NAMES.length];
    return {id:'npc'+Date.now()+i,name,role:NPC_ROLES[(state.worldIndex+i*3)%NPC_ROLES.length],
      trait:NPC_TRAITS[(state.worldIndex+i)%NPC_TRAITS.length],desire:NPC_DESIRES[(state.worldIndex+i*2)%NPC_DESIRES.length],
      affinity:12+i*4,trust:8+i*3,romance:false,history:[],lastSceneKey:0};
  });
  state.relationships=state.relationships.concat(made);
  state.relationNote='你开始认识家人以外的人：'+made.map(m=>m.name+'（'+m.role+'）').join('、');
}
function seedFamily(pack){
  if(state.familySeeded)return;
  state.familySeeded=true;
  const f=pack&&pack.family;
  if(!f)return;
  const mk=(key,label,trait,desire)=>({id:'fam_'+key,name:f[key][0],role:f[key][1],relation:'family',trait,desire,affinity:60,trust:55,romance:false,history:[],family:label,lastSceneKey:0});
  state.relationships=[
    ...state.relationships.filter(r=>!r.relation),
    mk('father','父亲','话不多，习惯把担心说成责备。','想让这个家撑过今年。'),
    mk('mother','母亲','会把最好的部分留给你，也会把最难的话咽下去。','想让你过得比自己好。'),
    ...(f.sibling?[mk('sibling','手足','和你一起长大，也和你争过同一碗饭。','想有一条自己的路。')]:[])
  ];
}

/* ---------- director ---------- */
function directorPick(){
  ensureLife5();
  const pack=activePack();
  seedFamily(pack);
  const a=age(),k=stageKey(),seen=state.seenScenes||[];

  // 1. pending chain
  if(state.chainQueue.length){
    const nextId=state.chainQueue[0];
    const found=findPackScene(pack,nextId);
    if(found){state.chainQueue.shift();return decorateScene(found,nextId);}
    state.chainQueue.shift();
  }

  // 2. stage entry scene (first scene of each stage)
  if(!state.stageSeen[k]){
    state.stageSeen[k]=true;
    const entry=stageEntryScene(pack,k);
    if(entry&&!(state.seenScenes||[]).includes(entry.id))return decorateScene(entry,'stage:'+k);
  }

  // 3. relationship arc (cooldown, only if not seen recently)
  if(a>=13){
    ensureSocial();
    const rel=relationScene5();
    if(rel)return rel;
  }

  // 4. unseen depth-pack scene for this stage
  if(pack){
    const phase=phaseEvents(pack);
    const recent=state.recentScenes||[];
    const pool=(phase.pool||[]).filter(e=>!seen.includes(e.id)&&!recent.includes(e.id));
    if(pool.length){
      const weighted=[];
      for(const e of pool){const w=Math.max(1,e.weight||3);for(let i=0;i<w;i++)weighted.push(e);}
      return decorateScene(weighted[Math.floor(Math.random()*weighted.length)],'pack');
    }
  }
  if(k==='infant')return decorateScene(infantMontage(),'infant');

  // 5. generic/extended life events by stage
  if(k==='child'||k==='kid'){const ce=childExtra();if(ce)return decorateScene(ce,'child-extra');}
  if(k==='adult'&&!state.employed&&!state.study&&age()<=26){const ao=adultOpen();if(ao)return decorateScene(ao,'adult-open');}
  if(k==='adult'){const ae=poolPick(ADULT_EXTRA,null);if(ae)return decorateScene(ae,'adult-extra');}
  if(k==='mid'){const me=poolPick(MID_EXTRA,null);if(me)return decorateScene(me,'mid-extra');}
  if(k==='elder'||k==='dusk'){
    const ee=poolPick(k==='dusk'?DUSK_EXTRA.concat(ELDER_MORE,ELDER_EXTRA):ELDER_MORE.concat(ELDER_EXTRA),null);
    if(ee&&(state.lastChapterAge===undefined||age()-state.lastChapterAge>6))return decorateScene(ee,'elder-extra');
  }
  const gen=genericEvent(k);
  if(gen)return decorateScene(gen,'generic');
  return decorateScene(chapterFallback(),'chapter');
}

function rememberSceneId(id){
  if(!Array.isArray(state.recentScenes))state.recentScenes=[];
  state.recentScenes.push(id);
  if(state.recentScenes.length>6)state.recentScenes.shift();
}
function findPackScene(pack,id){
  if(!pack)return null;
  const all=[...(pack.baby||[]),...(pack.child||[]),...(pack.teen||[]),...(pack.land||[]),...(pack.world||[]),...(pack.random||[])];
  return all.find(e=>e.id===id)||null;
}

function stageDays(raw,mode,k){
  let d=Array.isArray(raw.days)?raw.days[0]+Math.floor(Math.random()*(raw.days[1]-raw.days[0]+1)):(raw.days||randDays(mode));
  if(mode==='montage')return Math.max(d, 360+Math.floor(Math.random()*300));
  if(k==='infant')return Math.max(d, 300+Math.floor(Math.random()*360));
  if(k==='child'||k==='kid')return Math.max(d, 200+Math.floor(Math.random()*180));
  if(k==='teen')return Math.max(d, 150+Math.floor(Math.random()*180));
  if(k==='mid'||k==='elder')return Math.max(d, 90+Math.floor(Math.random()*180));
  return Math.max(d, 30+Math.floor(Math.random()*120));
}
function decorateScene(raw,tag){
  ensureLife5();
  const a=age(),k=stageKey(),pack=activePack();
  const mode=raw.mode||'narration';
  const npc=raw.npc?familyOrNPC(raw.npc):null;
  const scene={
    id:raw.id||('s_'+Date.now()),
    source:tag,
    mode,
    arc:raw.arc||(mode==='dialogue'?'dialogue':'life'),
    stage:k,
    title:raw.title||'某个片段',
    opening:typeof raw.opening==='function'?raw.opening():raw.opening,
    ask:raw.ask||'',
    line:raw.line||'',
    npcId:npc?npc.id:null,
    npcName:npc?npc.name:(raw.npcName||''),
    npcRole:npc?npc.role:(raw.npcRole||''),
    location:(raw.location||currentPlace5()),
    days:stageDays(raw,mode,k),
    minTurns:raw.minTurns!==undefined?raw.minTurns:(mode==='dialogue'?2:1),
    maxTurns:raw.maxTurns!==undefined?raw.maxTurns:(mode==='dialogue'?4:3),
    effects:raw.effects||{},
    next:raw.next||(raw.chain?raw.chain.step:null),
    memory:raw.memory||'',
    english:pickExamWords({type:raw.arc||'life',arc:raw.arc||'life',stage:k,mode}),
    recall:pickRecall(raw)
  };
  if(!scene.npcName&&mode==='dialogue')scene.npcName='家里的人';
  return scene;
}
function monthlyLiving(){
  const wage=state.employed?Math.min(state.salary||0,annualIncome()/12):(state.pension||0);
  const base=state.pension?(state.pension*1.12):(wage>0?wage*0.58:Math.max(150,annualIncome()/12*0.46));
  // 日子会跟着钱一起变贵：存得越多，住处、人情、应酬越贵。攒钱有软上限，但不是死线。
  const wealth=1+Math.min(1.05,(state.coins||0)/95000);
  const mouths=1+Math.min(3,(state.children||0))*0.2+(state.spouse?0.22:0);
  return Math.max(120,Math.floor(base*effect().cost*wealth*mouths));
}
function checkRetire(){
  if(age()>=58&&state.employed){
    state.employed=false;
    state.pension=Math.floor((state.salary||0)*0.38);
    state.salary=0;
    state.occupation='退了休的人';
    state.flags.push('retired');
    state.chronicle.unshift({year:cal().year,title:'退休',detail:`${age()}岁那年，你把手上的活交出去，开始靠积蓄和一点养老钱过日子。`});
  }
}
function advance5(days){
  const oldYear=cal().year;
  state.days+=Math.max(1,Math.round(days));
  if(cal().year!==oldYear){
    const a=age();
    if(a>55)state.health=Math.max(1,state.health-Math.floor((a-55)/6+1));
    state.chronicle.unshift({year:cal().year,title:`${a}岁`,detail:`进入${stage5().label}。寿限${state.lifeLimit}岁。`});
    if(state.lifeLimit-a<=5)toast(`寿命提醒：距自然寿限还有${Math.max(0,state.lifeLimit-a)}年`);
    if(a>=state.lifeLimit&&!state.deceased){
      state.deceased=true;state.health=0;
      state.chronicle.unshift({year:cal().year,title:'此生谢幕',detail:`你在${world().name}走完了自己的一生。`});
      checkAchievements();
    }
  }
}
function randDays(mode){
  if(mode==='montage')return 300+Math.floor(Math.random()*300);
  if(mode==='aftermath')return 5+Math.floor(Math.random()*25);
  if(mode==='dialogue')return 3+Math.floor(Math.random()*20);
  return 20+Math.floor(Math.random()*120);
}
function familyOrNPC(key){
  ensureLife5();
  if(key==='father')return state.relationships.find(r=>r.family==='父亲');
  if(key==='mother')return state.relationships.find(r=>r.family==='母亲');
  if(key==='sibling')return state.relationships.find(r=>r.family==='手足');
  if(key==='faction'){const n=factionName(0);return {id:'faction',name:n,role:'地方势力'};}
  return state.relationships.find(r=>r.id===key)||state.relationships[0]||null;
}
function currentPlace5(){return locs()[state.location]?.name||world().name;}

function stageEntryScene(pack,k){
  if(pack){
    const first={infant:pack.baby&&pack.baby[0],child:pack.child&&pack.child[0],kid:pack.child&&pack.child[1],teen:pack.teen&&pack.teen[0]}[k];
    if(first)return first;
  }
  const a=age();
  if(k==='infant'){const fam=activePack()&&activePack().family;const dad=fam?fam.father[0]:'父亲';const mom=fam?fam.mother[0]:'母亲';return {id:'gen_infant',mode:'montage',title:'出生那年',opening:()=>`你出生在${world().name}的${currentPlace5()}。${dad}在屋外等到半夜，${mom}把你抱在怀里，说你的手很凉。${world().climate||world().dailyLife||''} 家里并不富裕，但这一年，他们决定先让你活下来。`,days:[300,420],minTurns:0,maxTurns:1,effects:{emotions:{爱:4}},memory:'出生的那年'};}
  if(k==='child')return {id:'gen_child',mode:'narration',title:'记事的年纪',opening:()=>`你开始记事。${world().dailyLife||''} 家里的大人很忙，你学会了不添麻烦。`,ask:'你那时最想做什么？',days:[30,90],minTurns:1,maxTurns:2,effects:{},memory:'开始记事的年纪'};
  if(k==='kid')return {id:'gen_kid',mode:'narration',title:'上学的路',opening:()=>`你到了该识字的年纪。${world().tech||world().arts||''} 家里为要不要送你去读书争过一次。`,ask:'你想去吗？',days:[30,90],minTurns:1,maxTurns:3,effects:{},memory:'上学的争论'};
  if(k==='teen')return {id:'gen_teen',mode:'narration',title:'十三岁的门槛',opening:()=>`十三岁，大人开始用另一种眼神看你。${world().stratification||''} 你要开始为自己打算。`,ask:'你想成为什么样的人？',days:[30,120],minTurns:1,maxTurns:3,effects:{},memory:'十三岁的门槛'};
  if(k==='adult')return {id:'gen_adult',mode:'narration',title:'成年',opening:()=>`${age()}岁，你正式要为自己的生活负责。${world().economy||''} 手里没有多少积蓄。`,ask:'你打算怎么开始？',days:[20,60],minTurns:1,maxTurns:3,effects:{},memory:'成年的开始',chain:{step:null}};
  if(k==='mid')return {id:'gen_mid',mode:'narration',title:'中年',opening:()=>`${age()}岁，你开始发现身体不如从前。${world().risks||''} 身边有人已经离开，也有人需要你照顾。`,ask:'你现在的重心是什么？',days:[60,180],minTurns:1,maxTurns:3,effects:{health:-5},memory:'中年的重量'};
  if(k==='elder')return {id:'gen_elder',mode:'narration',title:'晚年',opening:()=>`${age()}岁，你退到生活的边上。${world().beliefs||''} 年轻时急着要的东西，现在有些已经不重要。`,ask:'你想怎么度过接下来的日子？',days:[90,240],minTurns:1,maxTurns:3,effects:{},memory:'晚年的清晨'};
  return {id:'gen_dusk',mode:'montage',title:'余晖',opening:()=>`${age()}岁。你活得比大多数人都久。${world().beliefs||''} 剩下的事情不多，但每一件都很清楚。`,days:[180,360],minTurns:0,maxTurns:1,effects:{},memory:'最后的余年'};
}

function genericEvent(k){
  const w=world(),loc=currentPlace5(),f0=factionName(0);
  const pool={
    infant:[],
    child:[
      {id:'g_child_1',mode:'narration',title:'家里的一次争吵',opening:()=>`夜里，大人以为你睡着了，在隔壁吵起来。${w.risks||''} 你听见自己的名字。`,ask:'你做什么？',days:[2,6],minTurns:1,maxTurns:2,effects:{emotions:{惧:5}},memory:'隔壁的争吵'},
      {id:'g_child_2',mode:'dialogue',npc:'mother',title:'母亲的旧伤',opening:()=>`母亲的手上有一道旧伤，天一冷就疼。她说不碍事，可拿东西时会停一下。`,line:'母亲问你：你怕不怕我也倒下？',days:[3,10],minTurns:2,maxTurns:3,effects:{emotions:{爱:4,哀:3}},memory:'母亲的旧伤'}
    ],
    kid:[
      {id:'g_kid_1',mode:'narration',title:'一场病',opening:()=>`你病了一场，烧了三天。${w.risks||''} 家里请不起好大夫，只能用土方子。`,ask:'你记得什么？',days:[5,15],minTurns:1,maxTurns:2,effects:{health:-8,emotions:{惧:5}},memory:'那场高烧'},
      {id:'g_kid_2',mode:'narration',title:'第一个朋友',opening:()=>`你在${loc}认识了一个同龄人。你们一起偷过果子，也一起挨过打。`,ask:'你们后来怎么样了？',days:[30,90],minTurns:1,maxTurns:3,effects:{bond:6},memory:'第一个朋友'},
      {id:'g_kid_3',mode:'dialogue',npc:'father',title:'父亲的手艺',opening:()=>`父亲把手上的活教给你一点。他说学不学随你，但别什么都不会。`,line:'父亲问你：你想学吗？',days:[5,20],minTurns:2,maxTurns:3,effects:{stats:{体魄:1}},memory:'父亲教的第一件事'}
    ],
    teen:[
      {id:'g_teen_1',mode:'narration',title:'家里的期待',opening:()=>`${w.family||''} 家里开始替你打算：学一门手艺、早点成家，或者出去闯。三个方向都有人说。`,ask:'你自己想走哪条？',days:[20,60],minTurns:1,maxTurns:3,effects:{},memory:'家里的三个方向'},
      {id:'g_teen_2',mode:'narration',title:'第一次心动',opening:()=>`你在${loc}遇见一个人。你们没有说几句话，但你记住了对方走路的姿势。${w.family||''}`,ask:'你做了什么？',days:[10,40],minTurns:1,maxTurns:3,effects:{emotions:{爱:6}},memory:'第一次心动'},
      {id:'g_teen_3',mode:'narration',title:'地方出事',opening:()=>`${w.risks||'一场风波'}波及${loc}。${f0}的人在街上走动，家里的门早早关了。`,ask:'你做什么？',days:[2,8],minTurns:1,maxTurns:3,effects:{importance:4,emotions:{惧:5}},memory:'门关上的那天'}
    ],
    adult:[
      {id:'g_adult_1',mode:'narration',title:'钱不够用',opening:()=>`${age()}岁，你算了三遍账。房租、饭钱、家里要的，哪一项都不肯让步。`,ask:'你怎么补这个缺口？',days:[10,30],minTurns:1,maxTurns:3,effects:{coins:-80,emotions:{惧:4}},memory:'算三遍的账'},
      {id:'g_adult_2',mode:'narration',title:'一次机会',opening:()=>`有人给你一个机会：出力、出钱或出面。${w.economy||''} 哪一种都不轻松。`,ask:'你选哪一种？',days:[15,45],minTurns:1,maxTurns:3,effects:{importance:5},memory:'摆在面前的机会'},
      {id:'g_adult_3',mode:'dialogue',npc:'faction',title:'上面的意思',opening:()=>`${f0}的人找你，话说得很客气。他们希望你在一件事上不要多嘴。`,line:'来人问你：这点面子，你给不给？',days:[2,6],minTurns:2,maxTurns:4,effects:{importance:6,emotions:{怒:4}},memory:'上面的意思'},
      {id:'g_adult_4',mode:'narration',title:'身体先垮了',opening:()=>`你连熬了许多夜，某天早上起不来。${w.risks||''} 大夫说算不上大病，但再这样下去会出事。`,ask:'你停下来吗？',days:[10,30],minTurns:1,maxTurns:2,effects:{health:-10,coins:-60},memory:'起不来的早上'}
    ],
    mid:[
      {id:'g_mid_1',mode:'narration',title:'父母老了',opening:()=>`父母老了。${w.family||''} 他们开始记不清事情，也开始依赖你。`,ask:'你怎么安排？',days:[30,120],minTurns:1,maxTurns:3,effects:{emotions:{哀:6,爱:4},coins:-120},memory:'父母老去'},
      {id:'g_mid_2',mode:'narration',title:'旧人重逢',opening:()=>`你在${loc}遇见一个很久没见的人。对方先认出你，你却愣了一下。`,ask:'你先说什么？',days:[3,10],minTurns:1,maxTurns:3,effects:{bond:5,emotions:{喜:4}},memory:'旧人重逢'},
      {id:'g_mid_3',mode:'narration',title:'一个决定',opening:()=>`有件事你拖了很多年：${w.beliefs||'一笔旧账'}。现在必须决定，继续拖还是了结。`,ask:'你怎么决定？',days:[10,40],minTurns:1,maxTurns:3,effects:{importance:6},memory:'拖了很多年的决定'}
    ],
    elder:[
      {id:'g_elder_1',mode:'narration',title:'把事交出去',opening:()=>`你开始把手上的事一件件交出去。有些交给家人，有些没人可交。`,ask:'你交给谁？',days:[30,120],minTurns:1,maxTurns:3,effects:{emotions:{哀:4,喜:3}},memory:'把手上的事交出去'},
      {id:'g_elder_2',mode:'narration',title:'身体的提醒',opening:()=>`你摔了一跤。不重，但爬起来花了很久。${w.beliefs||''} 你第一次认真想“还剩多少时间”。`,ask:'你怕吗？',days:[5,20],minTurns:1,maxTurns:2,effects:{health:-10,emotions:{惧:5}},memory:'爬起来花了很久'},
      {id:'g_elder_3',mode:'dialogue',npc:'sibling',title:'最后的话',opening:()=>`你和手足坐在一起。年轻时争过的那些事，现在说起来像别人的故事。`,line:'手足问你：这辈子，你后悔过什么？',days:[2,6],minTurns:2,maxTurns:4,effects:{emotions:{哀:5,爱:5}},memory:'和手足说起这辈子'}
    ],
    dusk:[]
  }[k];
  if(!pool||!pool.length)return null;
  const unseen=pool.filter(e=>!(state.seenScenes||[]).includes(e.id)&&!(state.recentScenes||[]).includes(e.id));
  return unseen.length?unseen[Math.floor(Math.random()*unseen.length)]:null;
}

const CHILD_EXTRA=[
{id:'cx1',mode:'narration',title:'第一次挨打',opening:()=>`你打碎了家里的一个瓦罐。母亲问是谁干的，所有人的目光都落到你身上。`,ask:'你承认吗？',days:[1,4],minTurns:1,maxTurns:2,effects:{emotions:{惧:5,哀:3}},memory:'碎掉的瓦罐'},
{id:'cx2',mode:'narration',title:'邻居家的孩子',opening:()=>`邻居家有个孩子，衣服比你新，说话比你响。今天他抢了你手里的东西。`,ask:'你怎么办？',days:[2,6],minTurns:1,maxTurns:3,effects:{emotions:{怒:5}},memory:'被抢走的东西'},
{id:'cx3',mode:'narration',title:'第一次看到死人',opening:()=>`村里有人死了。大人不让你靠近，可你还是从门缝里看见了那张盖着白布的脸。`,ask:'你记住了什么？',days:[3,10],minTurns:1,maxTurns:2,effects:{emotions:{惧:6}},memory:'盖着白布的脸'},
{id:'cx4',mode:'dialogue',npc:'father',title:'父亲教你一件事',opening:()=>`父亲把你叫到院子，教你怎么用刀，怎么打一个结，怎么判断一个人有没有撒谎。`,line:'父亲问你：这三样，你先学哪个？',days:[3,10],minTurns:2,maxTurns:3,effects:{stats:{体魄:1}},memory:'父亲教的第二件事'},
{id:'cx5',mode:'narration',title:'第一次挣钱',opening:()=>`你替人跑了一趟腿，拿到几枚小钱。钱不多，但那是你自己挣的。`,ask:'你怎么花？',days:[3,10],minTurns:1,maxTurns:2,effects:{coins:15},memory:'第一次挣的钱'},
{id:'cx6',mode:'narration',title:'冬天太冷',opening:()=>`这个冬天格外冷。家里只够烧两个屋的柴，你被安排睡在最冷的角落。`,ask:'你怎么熬？',days:[20,60],minTurns:1,maxTurns:2,effects:{health:-6},memory:'最冷的那个冬天'},
{id:'cx7',mode:'dialogue',npc:'sibling',title:'手足抢东西',opening:()=>`你和手足为一件小东西争起来。母亲说大的要让小的，可你只大两岁。`,line:'手足问你：你到底让不让？',days:[1,6],minTurns:2,maxTurns:3,effects:{emotions:{怒:4}},memory:'争过的那个东西'},
{id:'cx8',mode:'narration',title:'一场喜事',opening:()=>`村里有人办喜事，所有人都去吃席。你第一次喝了酒，第一次看见大人哭。`,ask:'你记住了什么？',days:[2,5],minTurns:1,maxTurns:2,effects:{emotions:{喜:5,爱:3}},memory:'第一场喜事'},
{id:'cx9',mode:'narration',title:'一个秘密',opening:()=>`你发现了一件不该发现的事：家里某个大人，做了某件不能让外人知道的事。`,ask:'你说不说？',days:[5,20],minTurns:1,maxTurns:3,effects:{emotions:{惧:5}},memory:'不该知道的秘密'},
{id:'cx10',mode:'dialogue',npc:'mother',title:'母亲问你将来',opening:()=>`母亲在灯下补衣服，忽然问起你以后想做什么。她问得很随意，手却没停。`,line:'母亲问你：你长大了想干什么？',days:[2,6],minTurns:2,maxTurns:3,effects:{emotions:{爱:4}},memory:'灯下的那个问题'}
];
function childExtra(){
  const unseen=CHILD_EXTRA.filter(e=>!(state.seenScenes||[]).includes(e.id)&&!(state.recentScenes||[]).includes(e.id));
  const pool=unseen.length?unseen:CHILD_EXTRA;
  return pool[Math.floor(Math.random()*pool.length)];
}
const ADULT_OPEN=[
{id:'ad_job',mode:'narration',title:'找一份活',opening:()=>`${age()}岁，你手里只剩几百钱。${currentPlace5()}的招工牌子换了三块，没有一块写着你的名字。${world().economy||''}`,ask:'你打算先做什么？',days:[10,30],minTurns:1,maxTurns:3,effects:{},memory:'找活的那几天'},
{id:'ad_study',mode:'narration',title:'拜师',opening:()=>`你听说${currentPlace5()}有人在收学徒，管饭，不给工钱，学成了才算出师。${world().tech||world().arts||''} 家里不反对，也不支持。`,ask:'你去不去？',days:[15,40],minTurns:1,maxTurns:3,effects:{stats:{智识:1}},memory:'去拜师的那天'},
{id:'ad_move',mode:'narration',title:'离开',opening:()=>`${age()}岁，你开始想离开${currentPlace5()}。${world().space||''} 地图上有几个地名，没有一个是你熟悉的。`,ask:'你走不走？',days:[10,40],minTurns:1,maxTurns:3,effects:{},memory:'想离开的那阵子'},
{id:'ad_home',mode:'dialogue',npc:'mother',title:'母亲的态度',opening:()=>`母亲看出你在想事情。她没有直接问，只是把你碗里的菜又添了一点。`,line:'母亲问你：你是不是打算走了？',days:[3,8],minTurns:2,maxTurns:3,effects:{emotions:{爱:4}},memory:'母亲看出来的那件事'}
];
function adultOpen(){
  const unseen=ADULT_OPEN.filter(e=>!(state.seenScenes||[]).includes(e.id)&&!(state.recentScenes||[]).includes(e.id));
  if(!unseen.length)return null;
  return unseen[Math.floor(Math.random()*unseen.length)];
}
const ADULT_EXTRA=[
{id:'ae1',mode:'narration',title:'搬过一次家',opening:()=>`你搬了家。新住处更小，但离活计近。${world().space||''} 收拾东西时，你发现自己的全部家当只装得下一只箱子。`,ask:'你留下了什么？',days:[10,40],minTurns:1,maxTurns:3,effects:{coins:-40},memory:'只有一只箱子的家当'},
{id:'ae2',mode:'dialogue',npcName:'老同事',npcRole:'同行',mode:'dialogue',title:'同事的邀约',opening:()=>`一个同行约你喝酒。他说有个活，来钱快，就是不干净。`,line:'他问你：你敢不敢做？',days:[3,10],minTurns:2,maxTurns:4,effects:{emotions:{欲:4}},memory:'不干净的活'},
{id:'ae3',mode:'narration',title:'被拖欠工钱',opening:()=>`这个月的工钱没发。老板说下个月一起给，工友们都不说话。`,ask:'你怎么办？',days:[10,30],minTurns:1,maxTurns:3,effects:{coins:-100,emotions:{怒:6}},memory:'被拖欠的工钱'},
{id:'ae4',mode:'narration',title:'躺下的那些天',opening:()=>`你病得不得不躺下。${world().risks||''} 大夫说要静养，可静养就意味着没有收入。`,ask:'你听不听？',days:[20,50],minTurns:1,maxTurns:2,effects:{health:-12,coins:-150},memory:'躺下的那些天'},
{id:'ae5',mode:'dialogue',npc:'father',title:'父亲第一次求你',opening:()=>`父亲第一次开口求你办事。他说得很小心，像是怕你拒绝。`,line:'父亲问你：这件事，你能不能帮？',days:[3,10],minTurns:2,maxTurns:4,effects:{emotions:{爱:4}},memory:'父亲第一次求我'},
{id:'ae6',mode:'narration',title:'捡到的钱袋',opening:()=>`你在路边捡到一只钱袋。四周没有人，钱袋里有名字。`,ask:'你怎么处理？',days:[1,5],minTurns:1,maxTurns:2,effects:{coins:60},memory:'捡到的钱袋'},
{id:'ae7',mode:'narration',title:'同龄人的婚事',opening:()=>`同龄人陆续成家。有人来问你的意思，也有人说你该考虑了。`,ask:'你怎么想？',days:[20,60],minTurns:1,maxTurns:3,effects:{emotions:{爱:4,哀:3}},memory:'同龄人的婚事'},
{id:'ae8',mode:'narration',title:'被指名的那一年',opening:()=>`你手上的活比去年快了。别人开始指名找你，工钱也高了一点。`,ask:'你满足吗？',days:[30,90],minTurns:1,maxTurns:2,effects:{stats:{体魄:1},coins:80},memory:'被指名的那一年'},
{id:'ae9',mode:'dialogue',npcName:'掌柜',npcRole:'生意人',mode:'dialogue',title:'掌柜的条件',opening:()=>`掌柜想让你长期替他做事，条件是搬去他那边住，以后少回家。`,line:'掌柜问你：你答不答应？',days:[5,15],minTurns:2,maxTurns:4,effects:{coins:100},memory:'掌柜的条件'},
{id:'ae10',mode:'narration',title:'夜里哭的孩子',opening:()=>`亲戚家的孩子被送到你这里暂住。孩子不说话，只在夜里哭。`,ask:'你怎么对他？',days:[20,60],minTurns:1,maxTurns:3,effects:{emotions:{爱:5}},memory:'夜里哭的孩子'},
{id:'ae11',mode:'narration',title:'阴天的旧伤',opening:()=>`多年前的旧伤在阴天疼起来。你想起当时受伤的情形，和那个没有道歉的人。`,ask:'你还计较吗？',days:[5,20],minTurns:1,maxTurns:2,effects:{health:-5,emotions:{怒:4}},memory:'阴天的旧伤'},
{id:'ae12',mode:'dialogue',npc:'mother',title:'母亲催你成家',opening:()=>`母亲又提起成家的事。她说不是催你，只是怕自己等不到。`,line:'母亲问你：你到底在等什么？',days:[3,10],minTurns:2,maxTurns:4,effects:{emotions:{哀:4,爱:4}},memory:'母亲等不到的担心'},
{id:'ae13',mode:'narration',title:'送走一个人',opening:()=>`一个认识的人走了，去了很远的地方，或者死了。你去送，才发现自己并不了解他。`,ask:'你想说什么？',days:[3,10],minTurns:1,maxTurns:2,effects:{emotions:{哀:6}},memory:'送走的那个人'},
{id:'ae14',mode:'narration',title:'只能选一样',opening:()=>`你算了算攒下的钱。够做一件一直想做的事，也够应付一次意外。只能选一样。`,ask:'你选哪个？',days:[10,20],minTurns:1,maxTurns:2,effects:{},memory:'只能选一样'},
{id:'ae15',mode:'narration',title:'不是我做的事',opening:()=>`一件不是你做的事，被算到了你头上。解释需要时间，也需要有人愿意听。`,ask:'你解释吗？',days:[5,20],minTurns:1,maxTurns:3,effects:{emotions:{怒:5,哀:4}},memory:'不是我做的事'},
{id:'ae16',mode:'dialogue',npcName:'陌生人',npcRole:'路人',mode:'dialogue',title:'路边的那个人',opening:()=>`路边有人倒着，围观的人不少，伸手的没有。你路过时，对方抬眼看你。`,line:'对方问你：能帮我一把吗？',days:[1,3],minTurns:2,maxTurns:3,effects:{emotions:{爱:3}},memory:'路边的那个人'}
];
const MID_EXTRA=[
{id:'me1',mode:'narration',title:'第一根白发',opening:()=>`你照见自己的第一根白发。身体开始提醒你，时间不是无限的。`,ask:'你怎么想？',days:[30,120],minTurns:1,maxTurns:2,effects:{emotions:{哀:4}},memory:'第一根白发'},
{id:'me2',mode:'dialogue',npc:'father',title:'父亲倒下',opening:()=>`父亲病倒了，躺在床上，第一次不像那个能撑住一切的人。`,line:'父亲问你：家里以后靠谁？',days:[10,40],minTurns:2,maxTurns:4,effects:{coins:-200,emotions:{哀:6}},memory:'父亲倒下'},
{id:'me3',mode:'narration',title:'收下的徒弟',opening:()=>`有人想跟你学手艺。你想起自己当年拜师的样子。`,ask:'你收不收？',days:[10,40],minTurns:1,maxTurns:3,effects:{},memory:'收下的徒弟'},
{id:'me4',mode:'narration',title:'说重了的那次',opening:()=>`你和身边的人为一件旧事吵起来。话说重了，谁都不肯先低头。`,ask:'你先低头吗？',days:[3,10],minTurns:1,maxTurns:3,effects:{emotions:{怒:5,哀:3}},memory:'说重了的那次'},
{id:'me5',mode:'narration',title:'找上门的旧债',opening:()=>`一笔多年前的债找上门。债主老了，说话也不凶，只是把账本放在桌上。`,ask:'你认不认？',days:[5,20],minTurns:1,maxTurns:3,effects:{coins:-150,emotions:{哀:4}},memory:'找上门的旧债'}
];
const ELDER_EXTRA=[
{id:'ee1',mode:'montage',title:'葬礼的年份',opening:()=>`你参加了几场葬礼。同龄人一个个少了。你开始记不清最近一次是谁走的。`,days:[200,400],minTurns:0,maxTurns:1,effects:{emotions:{哀:6}},memory:'葬礼的年份'},
{id:'ee2',mode:'narration',title:'最后交代的事',opening:()=>`你把手上的东西一件件交代清楚。有人认真听，有人只是点头。`,ask:'你最想留下什么？',days:[20,60],minTurns:1,maxTurns:3,effects:{emotions:{喜:3,哀:4}},memory:'最后交代的事'},
{id:'ee3',mode:'dialogue',npc:'sibling',title:'和手足说的这辈子',opening:()=>`手足来看你。你们坐了很久，说的都是小时候的事。`,line:'手足问你：这辈子值不值？',days:[3,10],minTurns:2,maxTurns:4,effects:{emotions:{爱:5,哀:5}},memory:'和手足说的这辈子'},
{id:'ee4',mode:'narration',title:'大病醒来',opening:()=>`你大病一场，躺了很久。醒来时屋子里的光线变了，人也不在原来的位置。`,ask:'你最想见谁？',days:[20,60],minTurns:1,maxTurns:2,effects:{health:-15,coins:-200},memory:'大病醒来'}
];
const DUSK_EXTRA=[
{id:'de1',mode:'narration',title:'最后一个朋友',opening:()=>`你最后一个同龄的朋友也走了。葬礼上你站在最前面，忽然发现自己已经没有人可以一起回忆从前。`,ask:'你想说什么？',days:[10,40],minTurns:1,maxTurns:2,effects:{emotions:{哀:8}},memory:'最后一个朋友'},
{id:'de2',mode:'dialogue',npc:'sibling',title:'未了的旧事',opening:()=>`手足提起一件几十年前的旧事。你们当年都没说清楚，现在说起来，语气反而轻了。`,line:'手足问你：还怪吗？',days:[3,10],minTurns:2,maxTurns:4,effects:{emotions:{哀:4,爱:4}},memory:'几十年前的旧事'},
{id:'de3',mode:'montage',title:'一天里的光',opening:()=>`你坐在门口，看光从东边移到西边。邻居的孩子经过，叫你一声，你应了声，没听清后面的话。`,days:[200,400],minTurns:0,maxTurns:1,effects:{emotions:{哀:3,喜:2}},memory:'门口的光'},
{id:'de4',mode:'narration',title:'留下的话',opening:()=>`你开始想，自己走了以后，别人会怎么提起你。想到最后发现，记住你的人可能也不多了。`,ask:'你想留下什么？',days:[30,90],minTurns:1,maxTurns:3,effects:{emotions:{哀:5}},memory:'想留下的东西'}
];
const ELDER_MORE=[
{id:'em1',mode:'narration',title:'院子里的活',opening:()=>`你还在院子里做一点活。不多，但每天都要做。有人劝你别干了，你说不动就真的动不了了。`,ask:'你今天做什么？',days:[20,60],minTurns:1,maxTurns:2,effects:{health:2,emotions:{喜:2}},memory:'院子里的那点活'},
{id:'em2',mode:'dialogue',npc:'sibling',title:'手足的近况',opening:()=>`手足来看你，带了一点吃食。你们说起各自的身体，谁都不肯先说不好。`,line:'手足问你：你一个人，行不行？',days:[3,10],minTurns:2,maxTurns:3,effects:{emotions:{爱:4}},memory:'手足带来的吃食'},
{id:'em3',mode:'narration',title:'一封旧信',opening:()=>`你翻出一封很久以前的信。写信的人可能已经不在了，字迹还是当年的样子。`,ask:'你回不回？',days:[5,20],minTurns:1,maxTurns:2,effects:{emotions:{哀:5}},memory:'翻出的旧信'},
{id:'em4',mode:'narration',title:'邻家孩子',opening:()=>`邻家的孩子常来你门口玩。你不赶他，偶尔给他讲一点从前的事。`,ask:'你讲什么？',days:[10,40],minTurns:1,maxTurns:2,effects:{emotions:{喜:4},bond:3},memory:'门口的孩子'},
{id:'em5',mode:'dialogue',npcName:'大夫',npcRole:'医者',mode:'dialogue',title:'大夫的话',opening:()=>`大夫上门，说了一些你听不太懂的话，最后只说：想吃什么就吃点什么。`,line:'大夫问你：家里还有别人吗？',days:[2,6],minTurns:2,maxTurns:3,effects:{emotions:{惧:5},coins:-80},memory:'大夫说的话'},
{id:'em6',mode:'narration',title:'一个没办成的事',opening:()=>`有件事你年轻时就该办，一直拖到现在。再不做，可能就真的做不了了。`,ask:'你还做吗？',days:[10,40],minTurns:1,maxTurns:3,effects:{emotions:{哀:4}},memory:'拖到现在的这件事'},
{id:'em7',mode:'montage',title:'一个平常的冬天',opening:()=>`这个冬天很平常。你烧水、煮饭、晒太阳，偶尔和路过的人说两句话。你没有生病，也没有特别高兴。`,days:[120,240],minTurns:0,maxTurns:1,effects:{emotions:{喜:2}},memory:'平常的冬天'},
{id:'em8',mode:'narration',title:'想起一个人',opening:()=>`你忽然想起一个很久没想起的人。不是亲人，也不是仇人，只是某个在你生命里出现过的人。`,ask:'你想对那个人说什么？',days:[3,10],minTurns:1,maxTurns:2,effects:{emotions:{哀:4,爱:3}},memory:'忽然想起的人'}
];
function poolPick(list,fallback){
  const unseen=list.filter(e=>!(state.seenScenes||[]).includes(e.id)&&!(state.recentScenes||[]).includes(e.id));
  if(unseen.length)return unseen[Math.floor(Math.random()*unseen.length)];
  return fallback;
}
const CHAPTER_TEMPLATES=[
  ()=>`这几年过去了。${world().risks||'生活没有平静过'}。你在${currentPlace5()}做着手里的事，钱进一点、出一点，身体比去年差了一点。没有值得特别记住的事件，但你确实又老了一些。`,
  ()=>`这几年过去了。${world().economy||''} 你换过一次活计，也想过换活法，最后还是留在了原来的位置。`,
  ()=>`这几年过去了。你和身边的人有过几次争执，也一起吃过几顿好饭。日子没有变好，但也没有垮掉。`,
  ()=>`这几年过去了。${world().dailyLife||''} 你开始习惯某些声音、某些气味，也开始忘记某些名字。`,
  ()=>`这几年过去了。你攒下一点钱，又花掉一部分。${world().risks||''} 没什么大事，可你确实累了。`
];
const CHAPTER_DETAILS=[
  '你换过一次住处，扔掉了一批旧物，也留下了几样说不清为什么舍不得的东西。',
  '你生过一场不轻不重的病，好了之后，走路比以前慢了一点。',
  '你和人吵过一次架，后来不再来往。你偶尔会想起对方的姓。',
  '你攒下一点钱，又因为一件不得不办的事花掉大半。',
  '你去过一次很远的地方，回来之后觉得原来的地方也没那么难忍。',
  '有人来求你帮忙，你帮了；也有人求过你，你没帮。',
  '你学会了一样很小的本事，之后一直在用。',
  '你开始记不住某些名字，也开始反复想起某些早就过去的事。'
];
function chapterFallback(){
  const a=age();
  state.lastChapterAge=a;
  const span=1+Math.floor(Math.random()*3);
  const detail=CHAPTER_DETAILS[Math.floor(Math.random()*CHAPTER_DETAILS.length)];
  const worldLine=Math.random()<0.5?(world().risks||''):(world().dailyLife||'');
  const text=()=>`${a}岁到${a+span}岁。${worldLine} ${detail}这几年没有一件值得单独记下来的大事，但它们叠在一起，就成了你现在这个样子。`;
  return {id:'chapter_'+Date.now(),mode:'montage',title:`${a}岁到${a+span}岁`,opening:text,days:[360*span,360*span+120],minTurns:0,maxTurns:1,effects:{emotions:{哀:2}},memory:`${a}岁到${a+span}岁的几年`};
}

function randomScene5(){
  const w=world(),loc=currentPlace5();
  const pool=[
    {id:'r_small',mode:'narration',title:'一件小事',opening:()=>`${loc}的日常忽然出了一点岔子。不大，却要有人处理。${w.dailyLife||''}`,ask:'你管不管？',effects:{coins:20},memory:'一件小事'},
    {id:'r_bad',mode:'narration',title:'坏消息',opening:()=>`${w.risks||'坏消息'}从外面传来。人们开始囤东西，也有人准备离开。`,ask:'你信多少？',effects:{emotions:{惧:4}},memory:'传来的坏消息'},
    {id:'r_rain',mode:'narration',title:'一场雨',opening:()=>`${loc}下了一场很久的雨。屋顶漏水，路变得难走，活计也停了。`,ask:'这几天你怎么过？',effects:{coins:-20,emotions:{哀:3}},memory:'下了很久的雨'},
    {id:'r_guest',mode:'dialogue',npcName:'过路的客人',npcRole:'旅人',mode:'dialogue',title:'过路的人',opening:()=>`一个外地人敲开你家的门，想借宿一晚。${w.space||''} 他身上的衣服比本地人旧，但说话很有礼。`,line:'客人问你：方便让我住一夜吗？',effects:{coins:10,bond:3},memory:'借宿的客人'}
  ];
  const unseen=pool.filter(e=>!(state.seenScenes||[]).includes(e.id)&&!(state.recentScenes||[]).includes(e.id));
  return (unseen.length?unseen:pool)[Math.floor(Math.random()*(unseen.length||pool.length))];
}

const INFANT_MONTAGE=[
  {id:'inf_walk',title:'学走路',text:()=>`你扶着墙站起来，走了三步，摔在门槛上。有人把你抱起来，拍你的背，说没事。`},
  {id:'inf_wean',title:'断奶',text:()=>`母亲不再喂你了。你哭了两夜，第三夜自己抱着碗睡着。`},
  {id:'inf_fever',title:'第一次发烧',text:()=>`你烧得很厉害。家里人轮着守，用湿布擦你的额头。你记得有一只手一直在。`},
  {id:'inf_market',title:'第一次赶集',text:()=>`有人背你去赶集。你看见很多人、很多颜色，还有一个和你差不多大的孩子。回家的路上你睡着了。`},
  {id:'inf_word',title:'说出的第一个词',text:()=>`你含糊地叫了一声。全屋子的人都停下来，看着你。`},
  {id:'inf_move',title:'搬家',text:()=>`家里搬了一次。你不明白为什么，只记得旧屋子的墙有一道裂缝，新屋子的地更凉。`}
];
function infantMontage(){
  const unseen=INFANT_MONTAGE.filter(e=>!(state.seenScenes||[]).includes(e.id));
  const pick=(unseen.length?unseen:INFANT_MONTAGE)[Math.floor(Math.random()*(unseen.length||INFANT_MONTAGE.length))];
  return {id:pick.id,mode:'montage',title:pick.title,opening:pick.text,days:[400,760],minTurns:0,maxTurns:1,effects:{},memory:pick.title};
}

/* ---------- memory ---------- */
function remember(scene,outcome){
  ensureLife5();
  const mem={
    id:'mem_'+Date.now()+'_'+Math.floor(Math.random()*999),
    age:age(),year:cal().year,month:cal().month,
    title:scene.title,
    text:(outcome||'').slice(0,240),
    people:scene.npcName?[scene.npcName]:[],
    tags:[scene.mode,scene.arc,scene.stage,scene.location,scene.id].filter(Boolean),
    unresolved:!!scene.next,
    importance:scene.mode==='dialogue'?2:scene.mode==='montage'?3:1
  };
  state.memories=[mem,...state.memories].slice(0,90);
}
function pickRecall(scene){
  ensureLife5();
  if(!state.memories.length)return null;
  const tags=[scene.arc,scene.stage,scene.npcName].filter(Boolean);
  const pool=state.memories.filter(m=>m.tags.some(t=>tags.includes(t))||m.people.some(p=>scene.npcName&&p===scene.npcName));
  if(!pool.length)return null;
  if(Math.random()>0.55)return null;
  return pool[0];
}

/* ---------- relationships ---------- */
function relationScene5(){
  ensureLife5();
  const a=age();
  if(a<13)return null;
  const candidates=state.relationships.filter(r=>!r.family&&!r.faction);
  if(!candidates.length)return null;
  if(Math.random()>0.45)return null;
  const eligible=candidates.filter(r=>!r.lastSceneKey||state.days-r.lastSceneKey>900);
  if(!eligible.length)return null;
  const r=eligible[Math.floor(Math.random()*eligible.length)];
  const mk=state.days;
  r.lastSceneKey=mk;
  const st=relationStage5(r);
  const mode=st==='知己'||st==='恋人'?'dialogue':'narration';
  const opening=()=>`${r.name}最近出现在你的生活里。${r.trait} ${st==='陌生人'?'你们还没真正说过话。':'你们已经认识的这段时间，彼此都变了一点。'}`;
  return decorateScene({id:'rel5_'+r.id+'_'+mk,mode,arc:'relation',title:'和'+r.name+'的一段',opening,line:mode==='dialogue'?`${r.name}问你：你最近，过得怎么样？`:undefined,ask:mode==='narration'?'你打算怎么对待这个人？':undefined,npcId:r.id,days:[10,60],minTurns:mode==='dialogue'?2:1,maxTurns:4,effects:{bond:4},memory:'和'+r.name+'的一段'},'relation');
}
function relationStage5(r){
  const score=(r.affinity+r.trust)/2;
  if(r.romance)return '伴侣';
  if(score>=70)return '知己';
  if(score>=45)return '熟人';
  if(score>=20)return '相识';
  return '陌生人';
}

/* ---------- page ---------- */
function occupationTitle(){
  const a=age(),k=stageKey();
  if(k==='infant')return '婴孩';
  if(k==='child')return '幼童';
  if(k==='kid')return '孩子';
  if(k==='teen')return state.employed?state.occupation:'少年';
  if(state.employed)return state.occupation||'雇工';
  if(state.study)return '学生';
  if(state.lifePath==='study')return '求学者';
  if(state.lifePath==='travel')return '旅人';
  if(state.lifePath==='settle')return '定居者';
  if(k==='elder'||k==='dusk')return '老人';
  return '自由人';
}

function sceneHeader(){
  const s=state.scene;
  return `<div class="row" style="margin:14px 0 2px;align-items:flex-end"><div><h2 style="margin:0;color:var(--cyan);font-size:21px">${esc(s.title)}</h2><p class="small muted" style="margin:5px 0 0">${esc(s.npcName?s.npcName+' · '+s.npcRole:sceneModeLabel(s.mode))}</p></div><span class="tag">${age()}岁</span></div>`;
}
function sceneModeLabel(m){return {montage:'岁月',narration:'日常',dialogue:'对话',aftermath:'余波'}[m]||'片段';}

function monthPage(){
  ensureLife5();
  if(state.monthSummary)return monthSummaryPage();
  if(state.deceased){page='event';return endingPage();}
  if(!state.scene){state.scene=directorPick();state.dialog=sceneIntro5(state.scene);state.sceneTurns=0;state.sceneStats={warmth:0,resolve:0,honesty:0};}
  const s=state.scene;
  const talkMode=s.mode==='dialogue';
  const canEnd=state.sceneTurns>=s.minTurns||!talkMode;
  const recall=s.recall?`<div class="notice"><b>旧事</b>：${esc(s.recall.title)} · ${esc((s.recall.text||'').slice(0,60))}…</div>`:'';
  const askLine=s.mode==='narration'&&s.ask?`<div class="small muted" style="margin:10px 0 0">${esc(s.ask)}</div>`:'';
  return `<div class="view"><div class="row"><div><b class="cyan">${monthLabel()}</b><div class="small muted">${stage5().label} · ${age()}岁 · ${occupationTitle()} · ${currentPlace5()}</div></div><span class="tag cyan">${dominantMood()}</span></div>${moodBars()}${sceneHeader()}${recall}${state.pastLives&&state.pastLives.length&&age()<6?`<div class="notice"><b>前世的影子</b>：${state.pastLives.map(x=>esc(x.title)).join(' · ')}。你说不清那是什么，只是觉得眼熟。</div>`:''}<div id="chat-log" class="chatlog ${talkMode?'chat':'narra'}">${state.dialog.map(chatBubble).join('')}${fxChips(state.lastTurnFx)}${state.busy?'<div class="msg system">……</div>':''}</div>${askLine}<div class="card" style="margin-top:0"><input id="dialog-input" placeholder="${talkMode?'写下你要说的话…':'写下你做了什么、或者什么也没做…'}" ${state.busy||state.sceneTurns>=s.maxTurns?'disabled':''} onkeydown="if(event.key==='Enter'){event.preventDefault();sendDialogue()}"><div class="grid2" style="margin-top:8px"><button class="btn primary" ${state.busy||state.sceneTurns>=s.maxTurns?'disabled':''} onclick="sendDialogue()">${talkMode?'说':'做'}</button><button class="btn" ${(canEnd&&!state.busy)?'':'disabled'} onclick="endMonth()">结束这一段</button></div><p class="small muted">${s.mode==='montage'?'岁月可以直接翻过去，也可以留下一句话。':s.mode==='dialogue'?'这是对话场景：先回应 '+s.minTurns+' 次以上再结束。':'这是事件场景：可以写下你做了什么，也可以直接跳过这几年。'}结束时会结算时间、情绪、关系和学习。</p></div></div>`;
}

function sceneIntro5(s){
  const arr=[{role:'system',text:s.opening}];
  if(s.mode==='dialogue'&&s.line)arr.push({role:'npc',name:s.npcName,text:s.line});
  return arr;
}

function localReply(s,text){
  const a=analyzeDialogue(text);
  if(s.mode==='dialogue'){
    const npc=s.npcName||'对方';
    if(a.warm>0)return `${npc}没有立刻接话，过了一会儿才说：你能这么想，我就放心一点。`;
    if(a.warm<0)return `${npc}看着你，眼神暗了一下：原来你是这么想的。`;
    if(a.resolve>0)return `${npc}点了点头：你心里有数就好。别逞强。`;
    return `${npc}听着，没有打断你。等你说完，只问了一句：那你打算怎么办？`;
  }
  if(s.mode==='narration'||s.mode==='montage'){
    return `你把这件事记在了心里。日子照旧往前走，但你做的那一点选择，已经改变了后面的一些事。`;
  }
  return '事情就这样过去了。';
}

async function requestDialogueReply(text){
  const s=state.scene;
  const talk=s.mode==='dialogue';
  const recent=state.dialog.slice(-6).map(m=>`${m.role==='player'?'我':m.name||'旁白'}：${m.text}`).join('\n');
  const mem=(s.recall?[s.recall]:[]).concat(state.memories.slice(0,4)).slice(0,4).map(m=>`${m.title}：${(m.text||'').slice(0,70)}`).join('\n');
  const prompt=talk
    ?`你在一款中文人生模拟器里扮演 ${s.npcName}（${s.npcRole}），世界：${world().name}；${world().theme||world().civilization||''}。场景：${s.title}。开场：${s.opening}。${s.line?`你说过：${s.line}。`:''}对方是 ${state.name}，${age()}岁，${state.sex}，${occupationTitle()}，情绪${JSON.stringify(state.emotions)}。相关旧事：${mem||'无'}。最近对话：\n${recent}\n对方刚说：${text}\n只用 ${s.npcName} 的身份回应，30-80字，符合身份和世界规则，有具体反应。不要提问式审问，不要总结，不要说教，不要提游戏机制。只返回JSON：{"reply":"..."}`
    :`你是一款中文人生模拟器的旁白。世界：${world().name}；${world().theme||world().civilization||''}；规则：${world().worldAxis||world().political||''}；风险：${world().risks||''}。当前：${state.name}，${age()}岁，${state.sex}，${occupationTitle()}，地点${s.location}，情绪${JSON.stringify(state.emotions)}。场景：${s.title}。开场：${s.opening}。相关旧事：${mem||'无'}。最近：\n${recent}\n玩家刚刚的行动/想法：${text}\n用旁白写 50-100 字：这个行动带来了什么具体后果（人、物、钱、身体、关系、名声任一或几项），要具体、克制，不要问玩家问题，不要给选项，不要总结人生，不要说教。只返回JSON：{"reply":"..."}`;
  const res=await fetch('https://api.deepseek.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${state.apiKey}`},body:JSON.stringify({model:'deepseek-chat',messages:[{role:'user',content:prompt}],temperature:.9,response_format:{type:'json_object'}})});
  if(!res.ok)throw Error('API');
  const data=await res.json();const parsed=JSON.parse(data.choices[0].message.content);
  if(!parsed.reply)throw Error('schema');
  return String(parsed.reply).slice(0,220);
}

async function sendDialogue(){
  ensureLife5();
  if(state.busy||!state.scene)return;
  const input=$('#dialog-input');
  const text=input?.value.trim();
  if(!text)return toast('先写一句话，或者什么也不做直接跳过');
  if(state.sceneTurns>=state.scene.maxTurns){toast('这一段已经足够了');return;}
  input.value='';
  state.dialog.push({role:'player',text});
  state.sceneTurns++;
  const a=analyzeDialogue(text);
  state.sceneStats.warmth+=a.warm;state.sceneStats.resolve+=a.resolve;state.sceneStats.honesty+=a.honest;
  applyDialogueEmotion(a);
  state.lastTurnFx=emotionFx(a);
  const r=state.scene.npcId?state.relationships.find(x=>x.id===state.scene.npcId):null;
  if(r){if(a.warm>0){r.affinity=Math.min(100,r.affinity+1);}if(a.honest>0)r.trust=Math.min(100,r.trust+1);if(a.warm<0)r.affinity=Math.max(0,r.affinity-1);}
  state.busy=true;save();render(true);scrollChatBottom();
  let reply;
  if(state.ai&&state.apiKey){try{reply=await requestDialogueReply(text);}catch(e){reply=localReply(state.scene,text);toast('AI不可用，已用本地叙事');}}
  else reply=localReply(state.scene,text);
  state.dialog.push({role:state.scene.mode==='dialogue'?'npc':'system',name:state.scene.npcName,text:reply});
  state.busy=false;save();render(true);scrollChatBottom();
}

/* ---------- settlement ---------- */
function resolveMonth(){
  ensureLife5();
  const s=state.scene,stats=state.sceneStats;
  const settled=monthLabel();
  const ageAt=age();
  const said=state.dialog.filter(m=>m.role==='player').map(m=>m.text).join(' ').slice(0,400);
  const eff=s.effects||{};
  let outcome='';
  const mood=state.emotions||{};

  if(eff.stats)for(const k in eff.stats)state.stats[k]=Math.max(1,Math.min(20,(state.stats[k]||1)+eff.stats[k]));
  if(eff.coins){state.coins=Math.max(0,state.coins+eff.coins);}
  if(eff.health){state.health=Math.max(1,Math.min(100,state.health+eff.health));}
  if(eff.importance){state.importance=Math.min(100,state.importance+Math.floor(eff.importance*effect().event));}
  if(eff.bond){state.bond=Math.min(100,state.bond+eff.bond);}
  if(eff.emotions)changeEmotion(eff.emotions);

  // narrative outcome by mode & dialogue tone
  if(s.mode==='montage'){
    outcome=`${s.opening.split('。').slice(0,2).join('。')}。这段日子过得很快，留下的不是完整的事件，而是几个画面、几种气味，和你后来一直记得的一句话。`;
  }else if(s.mode==='aftermath'){
    outcome=`${s.opening} 事情结束之后，日子并没有立刻变好或变坏，只是从此多了一点不能假装没发生过的东西。`;
  }else if(s.mode==='dialogue'){
    const r=s.npcId?state.relationships.find(x=>x.id===s.npcId):null;
    if(r){
      const before=relationStage5(r);
      if(stats.warmth>0){r.affinity=Math.min(100,r.affinity+6);r.trust=Math.min(100,r.trust+5);}
      else if(stats.warmth<0){r.affinity=Math.max(0,r.affinity-6);r.trust=Math.max(0,r.trust-3);}
      else{r.affinity=Math.min(100,r.affinity+2);}
      if(stats.honesty>0)r.trust=Math.min(100,r.trust+4);
      const after=relationStage5(r);
      outcome=stats.warmth>0
        ?`你和${r.name}谈过之后，关系近了一点。${r.name}没有承诺什么，但你说话时，对方没有再把目光移开。`
        :stats.warmth<0
        ?`你和${r.name}的话没有说拢。走出门时，你们都知道有些东西被放在那里没有解决。`
        :`你和${r.name}说了一些话，也留了一些没说。关系停在原来的位置，但至少没有退。`;
      if(after!==before&&['知己','伴侣'].includes(after)){
        outcome+=` 从这一段之后，${r.name}对你来说不再只是“认识的人”。`;
        state.chronicle.unshift({year:cal().year,title:`${r.name}成为${after}`,detail:outcome});
      }
    }else{
      outcome=`这场谈话结束后，你把对方说的话在心里翻了一遍。有些话你认同，有些话你暂时做不到。`;
    }
  }else{
    if(s.id&&s.id.startsWith('ad_')){
      if(/学|拜师|读书/.test(said)){state.study=true;outcome=`你决定去学一门东西。师傅没有承诺你什么，只让你先把手上的活做干净。从这天起，你开始有个去处。`;}
      else if(/走|离开|外面/.test(said)){state.lifePath='travel';state.location=(state.location+1)%locs().length;outcome=`你收拾了行李，去了${currentPlace5()}。没有人送你，也没有人拦你。新的地方比旧地方更吵，也更空。`;}
      else if(/留|家|不走/.test(said)){state.lifePath='settle';outcome=`你决定先留下。母亲没有说什么，只是那天的饭多了一点。`;}
      else {state.employed=true;state.salary=Math.floor(annualIncome()/12);state.occupation='雇工';outcome=`你找到一份活，工钱不高，但够交这个月的房租。你第一次觉得，自己勉强算在这里站住了。`;}
      state.mainStage=1;
    }else{
    // narration: tone shifts outcome
    if(stats.resolve>0&&mood.惧<70){
      outcome=`你做了决定，并且真的去做了。结果不算完美，但至少这一件事被你推着往前走了一步。${eff.coins&&eff.coins<0?'为此付出的钱和力气，都是真的。':''}`;
    }else if(stats.resolve<0||mood.惧>=70){
      outcome=`你犹豫了很久。最后什么也没做，或者做得不够。日子继续，但那件事留在了原地。`;
      state.emotions.惧=Math.min(100,(state.emotions.惧||0)+3);
    }else{
      outcome=`你按自己的方式处理了这件事。没有戏剧性的转折，只有一点缓慢的变化。`;
    }
    if(eff.health&&eff.health<0)outcome+=` 身体记住了这一次。`;
    if(eff.coins&&eff.coins<0)outcome+=` 钱也少了一些。`;
    }
  }

  const days=s.days||30;
  checkRetire();
  const months=days/30;
  const income=0;
  // job wage while employed
  let paidSalary=state.employed?Math.floor(Math.min(state.salary||0,annualIncome()/12)*months):0;
  if(!paidSalary&&!state.deceased){
    const a=age();
    if(a>=18){
      paidSalary=Math.floor(monthlyLiving()*months*1.08);
      outcome+=` 你没有固定的雇主，靠零活换饭钱，勉强没有欠债。`;
    }else if(a>=12){
      paidSalary=Math.floor(monthlyLiving()*months*0.25);
    }else{
      paidSalary=0;
    }
  }
  if(!paidSalary&&state.pension)paidSalary=Math.floor(state.pension*months);
  if(paidSalary)state.coins+=paidSalary;
  const cost=(age()>=18||state.employed)?Math.min(state.coins,Math.floor(monthlyLiving()*months)):0;
  state.coins=Math.max(0,state.coins-cost);
  advance5(days);
  const afterLabel=monthLabel();
  const period=settled===afterLabel?settled:`${settled} — ${afterLabel}`;

  if(!Array.isArray(state.englishSeen))state.englishSeen=[];
  for(const w of (s.english||[])){if(!state.englishSeen.includes(w.id))state.englishSeen.push(w.id);}
  remember(s,outcome);
  if(s.next&&!state.chainQueue.includes(s.next))state.chainQueue.push(s.next);
  if(!state.seenScenes.includes(s.id))state.seenScenes.push(s.id);
  rememberSceneId(s.id);
  state.chronicle.unshift({year:cal().year,title:s.title,detail:outcome});

  const gains=[];
  if(paidSalary)gains.push({k:'收入',v:paidSalary,c:'good'});
  if(cost)gains.push({k:'支出',v:-cost,c:'bad'});
  for(const k in (eff.stats||{}))gains.push({k,v:eff.stats[k],c:eff.stats[k]>0?'good':'bad'});
  if(eff.health)gains.push({k:'健康',v:eff.health,c:eff.health>0?'good':'bad'});
  if(eff.importance)gains.push({k:'重要度',v:eff.importance,c:'good'});
  if(eff.bond)gains.push({k:'羁绊',v:eff.bond,c:'good'});
  if(eff.coins)gains.push({k:'现钱',v:eff.coins,c:eff.coins>0?'good':'bad'});
  if(stats.warmth&&s.npcId)gains.push({k:'亲近',v:stats.warmth>0?6:stats.warmth<0?-6:2,c:stats.warmth>0?'good':'bad'});
  state.monthSummary={
    month:settled,period,title:s.title,text:outcome,mode:s.mode,
    income:paidSalary,cost,days,age:ageAt,gains,
    emotions:{...state.emotions},
    memory:s.memory||s.title,
    en:null,enLoading:false,enOpen:false
  };
  state.lastTurnFx=[];
  state.scene=null;state.dialog=[];state.sceneTurns=0;state.sceneStats={warmth:0,resolve:0,honesty:0};
  checkAchievements();save();page='month';render();
}

function gainList(g){
  if(!g||!g.length)return '';
  return `<div class="gains">${g.map(x=>`<span class="gain ${x.c}">${esc(x.k)} ${x.v>0?'+':''}${x.v}</span>`).join('')}</div>`;
}
function englishRecap(m){
  if(!state.english)return '';
  if(!m.en&&!m.enTried&&state.ai&&state.apiKey){m.enTried=true;setTimeout(()=>translateRecap(true),300);}
  if(m.en){
    return `<div class="card" style="border-color:#77b7fa44"><div class="row"><h3 class="cyan">This chapter</h3><button class="btn ghost" style="width:auto;padding:6px 10px" onclick="toggleRecap()">${m.enOpen?'收起':'展开英文'}</button></div>${m.enOpen?`<p class="english-para" style="margin-top:10px">${esc(m.en)}</p>`:'<p class="small muted">这一段的故事已翻成英文。想读的时候再展开。</p>'}</div>`;
  }
  return `<div class="card"><div class="row"><h3 class="cyan">This chapter</h3><button class="btn ghost" style="width:auto;padding:6px 10px" onclick="translateRecap()">${m.enLoading?'翻译中…':'译成英文'}</button></div><p class="small muted">把这一段发生的事翻成英文。不译也能继续。</p></div>`;
}
function toggleRecap(){
  const m=state.monthSummary;if(!m)return;
  m.enOpen=!m.enOpen;save();render(true);
}
async function translateRecap(background){
  const m=state.monthSummary;if(!m||m.enLoading||m.en)return;
  m.enLoading=true;save();render(true);
  const raw=`${m.period}，${state.name}${m.title}。${m.text}`;
  if(!(state.ai&&state.apiKey)){
    m.en=simpleRecapEN(m);m.enLoading=false;m.enOpen=true;save();render(true);return;
  }
  try{
    const prompt=`Translate the following Chinese life-simulator chapter recap into natural, simple English (80-140 words). Keep it in third person, past tense, concrete, no commentary, no Chinese. Only return JSON: {"english":"..."}\n\n${raw}`;
    const res=await fetch('https://api.deepseek.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${state.apiKey}`},body:JSON.stringify({model:'deepseek-chat',messages:[{role:'user',content:prompt}],temperature:.4,response_format:{type:'json_object'}})});
    if(!res.ok)throw Error('api');
    const data=await res.json();const parsed=JSON.parse(data.choices[0].message.content);
    if(!parsed.english)throw Error('schema');
    m.en=String(parsed.english).trim();m.enOpen=!background;
    if(!Array.isArray(state.englishChapters))state.englishChapters=[];
    if(!state.englishChapters.includes(m.en))state.englishChapters.unshift(m.en);
  }catch(e){
    m.en=simpleRecapEN(m);m.enOpen=!background;
    if(!Array.isArray(state.englishChapters))state.englishChapters=[];
    if(!state.englishChapters.includes(m.en))state.englishChapters.unshift(m.en);
    if(!background)toast('AI暂不可用，已用本地英文简版');
  }
  m.enLoading=false;save();render(true);
}
function simpleRecapEN(m){
  const ageWord=m.age<3?'a small child':m.age<13?'a child':m.age<18?'a teenager':m.age<31?'a young adult':m.age<51?'an adult':'an old person';
  const kind={montage:'quiet years',narration:'an ordinary stretch of days',dialogue:'a long conversation',aftermath:'the quiet after an event'}[m.mode]||'some days';
  return `This chapter covers about ${m.days} days, when the narrator was ${m.age} years old and ${ageWord}. It was ${kind}, not a turning point. Work, money and family pressed on as usual: ${m.income>0?'a little income came in':'very little money came in'}, and daily life cost ${m.cost}. Nothing dramatic happened, but small choices added up, and the season left something worth remembering.`;
}
function monthSummaryPage(){
  const m=state.monthSummary;
  const modeLabel=sceneModeLabel(m.mode);
  return `<div class="view"><div class="eyebrow">${modeLabel} · ${m.age}岁</div><h1 class="title" style="font-size:24px">${esc(m.period)} · ${esc(m.title)}</h1><div class="card"><p class="story" style="font-size:15px;line-height:1.95">${esc(cleanText(m.text))}</p><div class="grid2" style="margin-top:12px"><div><span class="small muted">这段时间</span><b class="cyan" style="display:block">${m.days} 天</b></div><div><span class="small muted">收支</span><b class="${(m.income-m.cost)>=0?'gold':'red'}" style="display:block">${m.income-m.cost>=0?'+':''}${m.income-m.cost} ${world().currency}</b></div></div><p class="small muted">${m.income?`这一段收入 ${m.income} ${world().currency}。`:''}生活支出 ${m.cost} ${world().currency}，余额 ${state.coins.toLocaleString()} ${world().currency}。</p>${gainList(m.gains)}</div>${englishRecap(m)}<div class="notice">这一段记为“${esc(m.memory)}”，已存入记忆库。${state.deceased?'这是最后一段。':''}</div><button class="btn primary" onclick="nextMonth()">${state.deceased?'查看此生结局':'继续人生 ›'}</button></div>`;
}

function endMonth(){
  if(!state.scene||state.busy)return;
  if(state.scene.mode!=='dialogue'){resolveMonth();return;}
  if(state.sceneTurns<state.scene.minTurns)return toast(`至少回应 ${state.scene.minTurns} 次再结束这一段`);
  resolveMonth();
}
function nextMonth(){
  ensureLife5();
  state.monthSummary=null;
  if(state.deceased){page='event';render();return;}
  state.scene=directorPick();
  state.dialog=sceneIntro5(state.scene);
  state.sceneTurns=0;state.sceneStats={warmth:0,resolve:0,honesty:0};
  page='month';save();render();
}

function beginLife5(){
  resetLife();
  ensureLife5();
  const e=effect();
  state.coins=Math.max(60,START_COINS+e.add.coins);
  state.lifeLimit=100+e.add.life;
  state.health=Math.max(20,100+e.add.health);
  for(const k in e.add.stats)state.stats[k]=Math.max(1,Math.min(20,state.stats[k]+e.add.stats[k]));
  if(has('debt'))state.flags.push('debt');
  if(has('gambit'))state.flags.push('孤注者');
  if(has('world'))state.flags.push('被注视者');
  state.occupation='';
  seedFamily(activePack());
  ensureSocial();
  state.scene=directorPick();
  state.dialog=sceneIntro5(state.scene);
  state.screen='play';page='month';save();render();
}

/* life tab */
function lifePage(){
  const inc=Math.floor(annualIncome()/12),cost=Math.floor(LIVING_MONTH*effect().cost);
  const best=(state.relationships||[]).filter(r=>!r.family).slice().sort((a,b)=>(b.affinity+b.trust)-(a.affinity+a.trust))[0];
  return `<div class="view"><div class="eyebrow">A LIFE, NOT A SCORE</div><h1 class="title">此生生涯</h1><div class="card"><div class="row"><h3 class="cyan">${world().name}</h3><span class="tag">${world().currency}</span></div><p class="small">${esc(world().theme||world().civilization||'')}</p><p class="small muted">${esc(world().worldAxis||'')}</p><button class="btn ghost" onclick="showDossier(${state.worldIndex})">世界档案</button></div><div class="card"><div class="row"><h3>${occupationTitle()} · Lv.${state.career}</h3><span class="tag cyan">${stage5().label}</span></div><div class="grid2" style="margin:12px 0"><div><span class="small muted">月收入</span><b class="gold" style="display:block">${state.employed?(state.salary||0).toLocaleString():'0'}</b></div><div><span class="small muted">月生活成本</span><b class="red" style="display:block">${cost.toLocaleString()}</b></div></div><p class="small muted">续命药 ${pillPrice().toLocaleString()} ${world().currency}，按当前净收入约 ${pillYears()}。</p></div>${moodBars()}<div class="card"><div class="row"><h3>人物</h3><span class="cyan">${best?relationStage5(best):'—'}</span></div><p class="small">${best?`${best.name} · ${best.role}`:'还没有认识重要的人。'}</p><button class="btn ghost" onclick="nav('relation')">去人物页</button></div><div class="card"><h3>四维属性</h3>${Object.entries(state.stats).map(([k,v])=>`<div class="row" style="margin:10px 0"><span>${k}</span><b class="cyan mono">${v}</b></div>`).join('')}</div><div class="card"><h3>此生构筑</h3>${state.talents.map(id=>{const t=talent(id);return t?`<p class="small"><b class="${t.r}">${t.name}</b> · ${t.gain}<br><span class="red">${t.cost}</span></p>`:'';}).join('')}</div><button class="btn ghost" onclick="nav('month')">回到此刻</button></div>`;
}

function spendWith(id,kind){
  ensureLife5();
  const r=state.relationships.find(x=>x.id===id);if(!r||state.deceased||state.busy)return;
  const days={talk:5,share:45,confess:2,life:180}[kind]||5;
  let a=0,t=0,line='';
  if(kind==='talk'){a=5+Math.floor(state.stats.魅力/4);t=3;line=`你和${r.name}说了一会儿话。没有谈什么大事，但你记住了对方说话时的停顿。`;}
  else if(kind==='share'){a=12;t=8;line=`你和${r.name}一起做了一件具体的事。中途有点麻烦，你们都没有先走。`;}
  else if(kind==='confess'){
    r.confessTried=true;
    if(r.affinity>=75&&r.trust>=60){r.romance=true;a=10;t=6;line=`你把话说出口。${r.name}沉默了很久，最后没有说“好”，只是把手放在你手里。`;}
    else{a=-6;line=`${r.name}听懂了你的意思，却没有回应。你们都没有再提这件事。`;}
  }
  else if(kind==='life'){a=8;t=6;line=`你和${r.name}一起过了半年。有争执，也有和好；关系没有变淡，也没有变成传说。`;}
  r.affinity=Math.max(0,Math.min(100,r.affinity+a));
  r.trust=Math.max(0,Math.min(100,r.trust+t));
  r.lastSceneKey=state.days;
  state.relationNote=line;
  advance5(days);
  checkRelationships&&checkRelationships();
  save();render(true);
}
function relationPage(){
  ensureLife5();
  const rs=state.relationships||[];
  const fam=rs.filter(r=>r.family),others=rs.filter(r=>!r.family);
  const card=r=>{const st=relationStage5(r);
    const acts=r.family?'':`<div class="row" style="gap:8px;margin-top:12px;flex-wrap:wrap"><button class="btn ghost" style="width:auto;padding:8px 12px" onclick="spendWith('${r.id}','talk')">闲谈 · 数日</button><button class="btn ghost" style="width:auto;padding:8px 12px" onclick="spendWith('${r.id}','share')">共同经历 · 一两个月</button>${st==='知己'?`<button class="btn" style="width:auto;padding:8px 12px" onclick="spendWith('${r.id}','confess')">表明心意</button>`:''}${r.romance?`<button class="btn ghost" style="width:auto;padding:8px 12px" onclick="spendWith('${r.id}','life')">一起过日子 · 半年</button>`:''}</div>`;
    return `<div class="card"><div class="row"><div><h3 class="cyan">${esc(r.name)}</h3><span class="small muted">${esc(r.role)} · ${r.family?r.family:st}</span></div><span class="tag ${st==='伴侣'?'gold':st==='知己'?'cyan':''}">${r.family||st}</span></div><p class="small">${esc(r.trait||'')}</p><p class="small muted">${r.desire?'心愿：'+esc(r.desire):''}</p><div class="statline" style="margin-top:12px"><span>亲近 ${r.affinity}</span><span>信任 ${r.trust}</span></div><div class="bar"><i style="width:${r.affinity}%"></i></div>${acts}</div>`;};
  return `<div class="view"><div class="eyebrow">PEOPLE, NOT RESOURCES</div><h1 class="title">人物</h1><p class="subtitle">你会遇见谁，不全是你能选的。关系也不是一达成了就结束。</p>${state.relationNote?`<div class="notice">${esc(state.relationNote)}</div>`:''}${fam.length?`<div class="eyebrow" style="margin-top:14px">家人</div>${fam.map(card).join('')}`:''}${others.length?`<div class="eyebrow" style="margin-top:14px">其他人</div>${others.map(card).join('')}`:'<p class="small muted">还没有遇到家人以外的重要的人。关系会在人生里自然出现。</p>'}</div>`;
}

function lifeRecap(){
  const fam=(state.relationships||[]).filter(r=>r.family).map(r=>r.name+'（'+r.family+'）');
  const close=(state.relationships||[]).filter(r=>!r.family).map(r=>r.name+'（'+relationStage5(r)+'）');
  const en=(state.englishChapters||[]).slice(0,8);
  return `<div class="card"><h3>这一生遇见的人</h3><p class="small">${fam.concat(close).join(' · ')||'没有留下名字的人。'}</p></div>${en.length?`<div class="card" style="border-color:#77b7fa44"><h3 class="cyan">Chapters in English</h3>${en.map(x=>`<p class="small" style="line-height:1.7">${esc(x)}</p>`).join('')}</div>`:''}`;
}
function chroniclePage(){
  ensureLife5();
  const mem=state.memories||[];
  return `<div class="view"><h1 class="title">记忆库</h1><p class="subtitle">发生过的事不会全都留下。你记得的那些，会在后面的日子里重新浮现。</p><div class="eyebrow">长期记忆 · ${mem.length}</div>${mem.length?mem.slice(0,24).map(m=>`<div class="card"><div class="row"><b class="cyan">${esc(m.title)}</b><span class="small muted">${m.age}岁</span></div><p class="small" style="line-height:1.8">${esc(m.text)}</p><p class="small muted">第${m.year}年${m.month}月${m.people.length?' · '+esc(m.people.join('、')):''}${m.unresolved?' · 未了':''}</p></div>`).join(''):'<p class="small muted">还没有形成长期记忆。先过好此刻。</p>'}</div>`;
}

/* override the old annual play router */
function lifeNav(){
  return `<div style="padding:16px 17px 0"><div class="row"><div><b class="cyan">${dateText()}</b><div class="small muted">${stage5().label} · ${age()}岁 / 寿限${state.lifeLimit}岁 · ${occupationTitle()}</div></div><div style="text-align:right"><b class="gold mono" style="font-size:22px">${state.coins.toLocaleString()}</b><div class="small muted">${world().currency}</div></div></div>${attrs()}</div><div class="tabs">${[['month','此刻'],['life','生涯'],['relation','人物'],['memory','记忆'],['shop','商店'],['map','世界']].map(([k,n])=>`<button class="tab ${page===k?'active':''}" onclick="nav('${k}')">${n}</button>`).join('')}</div>`;
}
function play(){
  if(state.deceased&&state.monthSummary){
    const body=monthPage();
    return `<div class="view" style="padding:0">${lifeNav()}${body}</div>`;
  }
  if(state.deceased&&!state.monthSummary){
    return `<div class="view" style="padding:0">${lifeNav()}${endingPage()}</div>`;
  }
  const body=page==='month'?monthPage():page==='life'?lifePage():page==='relation'?relationPage():page==='memory'?chroniclePage():page==='shop'?shopPage():mapPage();
  return `<div class="view" style="padding:0">${lifeNav()}${body}</div>`;
}

function begin(){beginLife5();}
window.__life5={directorPick,resolveMonth,nextMonth,endMonth,sendDialogue,beginLife5,stage5,occupationTitle,state,get scene(){return state.scene;}};

/* load into the new engine */
(() => {
  ensureLife5();
  if(state.screen==='play'){
    if(state.scene&&!state.scene.mode){state.scene=null;}
    if(!state.scene){state.scene=directorPick();state.dialog=sceneIntro5(state.scene);}
    page=page==='chronicle'?'memory':page;
    render();
  }
})();
function endingTitle(){
  const rs=state.relationships||[];
  const partner=rs.find(r=>r.romance);
  const soul=rs.find(r=>!r.family&&relationStage5(r)==='知己');
  if(state.importance>=100&&state.pills>=2)return '驻世史诗';
  if(state.importance>=100)return '一域传奇';
  if(partner)return '有人同行的一生';
  if(soul)return '被理解的灵魂';
  if((state.pills||0)>=3)return '与时间讨价还价的人';
  if(rs.filter(r=>!r.family&&relationStage5(r)==='知己').length>=2)return '被许多人记得的人';
  if(state.career>=5)return '行业名宿';
  if(age()>=80)return '安度的长寿者';
  return '普通而完整的一生';
}
function endingPage(){
  const title5=endingTitle();
  const sc=score();
  const mem=(state.memories||[]).slice(0,10);
  return `<div class="view"><div class="eyebrow">THE END OF A LIFE</div><h1 class="title">此生谢幕</h1><div class="card center"><div class="logo" style="font-size:28px">${esc(title5)}</div><p class="story">${esc(state.name)} · ${world().name}<br>${age()}岁 · ${occupationTitle()} · ${stage5().label}<br><br>你走完了这一生。<br>有人记得你做过的事，也有人只记得你的名字。</p><div class="row" style="justify-content:center;gap:24px;margin-top:15px"><div><span class="small muted">人生评分</span><b class="gold" style="display:block;font:700 28px var(--mono)">${sc}</b></div><div><span class="small muted">记忆</span><b class="cyan" style="display:block;font:700 28px var(--mono)">${mem.length}</b></div></div></div>${lifeRecap()}<div class="card"><h3>最后的几段记忆</h3>${mem.map(m=>`<p class="small"><b class="cyan">${m.age}岁</b> · ${esc(m.title)}</p>`).join('')||'<p class="small muted">没有留下记忆。</p>'}</div><div class="card"><h3>带着这一世，去下一世</h3><p class="small muted">你会保留姓名、性别、属性与天赋，带着这一世最深的几段记忆，投到另一个世界，从 0 岁重新出生。财富、职业、关系都留在这一世。</p><button class="btn primary" onclick="rebirthIntoNext()">带着记忆重生到下一个世界 ›</button><button class="btn ghost" style="margin-top:8px" onclick="finish()">结束轮回，载入档案</button></div></div>`;
}
