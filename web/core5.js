'use strict';

/* Shared helpers for the v5 life engine. */
/* 考研常见词：按场景抽取，避免脱离故事背词。 */
const EXAM_WORDS=[
{id:'x_allocate',word:'allocate',zh:'分配；拨出',ex:'The council had to allocate scarce water.',tags:['job','opening','settle']},
{id:'x_assess',word:'assess',zh:'评估；判断',ex:'She assessed the risk before answering.',tags:['job','main','opening']},
{id:'x_competent',word:'competent',zh:'有能力的；胜任的',ex:'He was competent enough to keep the job.',tags:['job','study']},
{id:'x_compensate',word:'compensate',zh:'补偿；弥补',ex:'No one could compensate them for the lost years.',tags:['job','relation']},
{id:'x_pursue',word:'pursue',zh:'追求；继续从事',ex:'She decided to pursue a different life.',tags:['opening','path','study']},
{id:'x_sustain',word:'sustain',zh:'维持；支撑',ex:'A small wage could not sustain the family.',tags:['job','child','settle']},
{id:'x_undergo',word:'undergo',zh:'经历；经受',ex:'The town underwent a quiet change.',tags:['main','child','random']},
{id:'x_strategy',word:'strategy',zh:'策略；谋划',ex:'He needed a strategy, not a promise.',tags:['job','main','path']},
{id:'x_acquire',word:'acquire',zh:'获得；习得',ex:'Children acquire language without noticing.',tags:['child','study','path']},
{id:'x_comprehend',word:'comprehend',zh:'理解；领会',ex:'She could not comprehend his choice.',tags:['study','relation']},
{id:'x_discipline',word:'discipline',zh:'纪律；训练',ex:'Learning a craft requires discipline.',tags:['study','job','child']},
{id:'x_derive',word:'derive',zh:'获得；源自',ex:'He derived little comfort from the answer.',tags:['study','child','main']},
{id:'x_illustrate',word:'illustrate',zh:'说明；阐明',ex:'One example may illustrate the whole system.',tags:['study','main']},
{id:'x_interpret',word:'interpret',zh:'解释；理解',ex:'People interpret silence in different ways.',tags:['relation','study','main']},
{id:'x_significant',word:'significant',zh:'重要的；显著的',ex:'A small decision can be significant.',tags:['main','relation','child']},
{id:'x_affection',word:'affection',zh:'喜爱；感情',ex:'Her affection showed in small habits.',tags:['relation','settle']},
{id:'x_accompany',word:'accompany',zh:'陪伴；伴随',ex:'He asked her to accompany him home.',tags:['relation','travel']},
{id:'x_mutual',word:'mutual',zh:'相互的；共同的',ex:'Trust has to be mutual.',tags:['relation','settle']},
{id:'x_vulnerable',word:'vulnerable',zh:'脆弱的；易受伤的',ex:'He felt vulnerable without his old name.',tags:['relation','child','main']},
{id:'x_longing',word:'longing',zh:'渴望；思念',ex:'There was a longing in her voice.',tags:['relation','travel']},
{id:'x_confront',word:'confront',zh:'面对；对抗',ex:'She had to confront the truth alone.',tags:['main','crisis','random']},
{id:'x_consequence',word:'consequence',zh:'后果；结果',ex:'Every choice carries a consequence.',tags:['main','crisis','job']},
{id:'x_endure',word:'endure',zh:'忍受；持续',ex:'Some days you simply endure.',tags:['crisis','job','child']},
{id:'x_refuge',word:'refuge',zh:'避难；庇护',ex:'They offered refuge to the stranded.',tags:['crisis','settle','child']},
{id:'x_scarce',word:'scarce',zh:'稀缺的；不足的',ex:'Clean water was scarce.',tags:['crisis','settle','job']},
{id:'x_resilient',word:'resilient',zh:'有韧性的；能恢复的',ex:'Ordinary people can be resilient.',tags:['crisis','child','main']},
{id:'x_survive',word:'survive',zh:'幸存；挺过',ex:'The family survived the long winter.',tags:['crisis','job','child']},
{id:'x_authority',word:'authority',zh:'权威；权力',ex:'The local authority ignored the complaint.',tags:['main','opening','job']},
{id:'x_alliance',word:'alliance',zh:'联盟；结盟',ex:'The two factions formed an alliance.',tags:['main','relation','random']},
{id:'x_influence',word:'influence',zh:'影响；影响力',ex:'Money can buy influence, not trust.',tags:['main','job','relation']},
{id:'x_phenomenon',word:'phenomenon',zh:'现象',ex:'The phenomenon defied explanation.',tags:['main','random','study']},
{id:'x_inevitable',word:'inevitable',zh:'不可避免的',ex:'The conflict felt inevitable.',tags:['main','crisis']},
{id:'x_resolve',word:'resolve',zh:'解决；决心',ex:'She resolved to leave before dawn.',tags:['main','path','job']},
{id:'x_transform',word:'transform',zh:'改变；转化',ex:'A single year can transform a person.',tags:['main','relation','child']},
{id:'x_valid',word:'valid',zh:'有效的；正当的',ex:'His fear was valid, even if inconvenient.',tags:['relation','main']},
{id:'x_curiosity',word:'curiosity',zh:'好奇心',ex:'Curiosity kept her asking questions.',tags:['child','study','main']},
{id:'x_profession',word:'profession',zh:'职业；专业',ex:'He chose a profession his family despised.',tags:['opening','job','path']},
{id:'x_endeavor',word:'endeavor',zh:'努力；尝试',ex:'The endeavor cost more than he expected.',tags:['opening','job','study']},
{id:'x_adapt',word:'adapt',zh:'适应；改编',ex:'She learned to adapt to the new rules.',tags:['opening','travel','settle']},
{id:'x_resource',word:'resource',zh:'资源；办法',ex:'They had few resources and less time.',tags:['job','crisis','settle']}
];
ENGLISH_PACK.push(...EXAM_WORDS);
function pickExamWords(scene){
  const tags=new Set([scene?.type,scene?.arc,scene?.path].filter(Boolean));
  const fresh=EXAM_WORDS.filter(w=>!meta.english.includes(w.id));
  let pool=fresh.filter(w=>w.tags.some(t=>tags.has(t)));
  if(pool.length<3)pool=fresh.length>=3?fresh:EXAM_WORDS;
  const copy=[...pool];const out=[];let h=hashText((scene?.id||'scene')+'-'+(state.days||0));
  while(out.length<3&&copy.length){h=(h*1664525+1013904223)>>>0;out.push(copy.splice(h%copy.length,1)[0]);}
  return out;
}

function ensureMonthState(){
  if(!state.emotions)state.emotions={喜:30,怒:20,哀:20,惧:20,爱:30,恶:15,欲:30};
  if(!state.sceneStats)state.sceneStats={warmth:0,resolve:0,honesty:0};
  if(!state.relationships)state.relationships=[];
  if(typeof state.mainStage!=='number')state.mainStage=0;
  if(typeof state.salary!=='number')state.salary=0;
  if(typeof state.employed!=='boolean')state.employed=false;
  if(typeof state.openingDone!=='boolean')state.openingDone=false;
  if(typeof state.jobDone!=='boolean')state.jobDone=false;
  if(typeof state.study!=='boolean')state.study=false;
  if(typeof state.lifePath!=='string')state.lifePath='';
}

function changeEmotion(delta){ensureMonthState();for(const k in delta)state.emotions[k]=Math.max(0,Math.min(100,(state.emotions[k]||0)+delta[k]));}

function dominantMood(){const e=state.emotions||{};const order=Object.entries(e).sort((a,b)=>b[1]-a[1]);return order[0]?.[0]||'平静';}

function moodBars(){ensureMonthState();return `<div class="moodrow">${Object.entries(state.emotions).map(([k,v])=>`<div class="mood"><span>${k}</span><i style="height:${Math.max(4,v*0.3)}px"></i><b>${v}</b></div>`).join('')}</div>`;}

function monthLabel(){const c=cal();return `第${c.year}年 ${c.month}月`;}

function currentPlace(){return locs()[state.location]?.name||world().name;}

function analyzeDialogue(text){
  const t=String(text||'');
  const negWarm=(t.match(/不想|不愿意|不干|拒绝|讨厌|滚|恨|不喜欢|没兴趣|做不到|算了|别管/g)||[]).length;
  const posWarm=(t.match(/愿意|喜欢|想|希望|帮|一起|留下|试试|学|谢谢|可以|陪|相信|照顾|在乎|爱|不怕|自己/g)||[]).length;
  const warm=posWarm>negWarm?1:(negWarm>posWarm?-1:0);
  const negResolve=(t.match(/害怕|担心|不知道|累了|做不到|算了|没想好|不敢/g)||[]).length;
  const posResolve=(t.match(/不怕|愿意|我来|我去|一定|必须|直接|证明|保证|会|能|希望|自己/g)||[]).length;
  const resolve=posResolve>negResolve?1:(negResolve>posResolve?-1:0);
  const honest=/实话|真的|不骗|承认|确实|老实|坦白/.test(t)?1:0;
  return {warm,resolve,honest};
}

function applyDialogueEmotion(a){
  const d={喜:0,怒:0,哀:0,惧:0,爱:0,恶:0,欲:0};
  if(a.warm>0){d.喜+=3;d.爱+=1;d.恶=Math.max(d.恶-1,0);}
  if(a.warm<0){d.怒+=2;d.哀+=2;d.爱-=1;}
  if(a.resolve>0){d.欲+=1;d.惧-=2;}
  if(a.resolve<0){d.惧+=3;d.哀+=1;d.喜-=1;}
  if(a.honest){d.喜+=1;d.恶-=1;}
  changeEmotion(d);
}

function chatBubble(m){
  if(m.role==='system')return `<div class="msg system">${esc(cleanText(m.text))}</div>`;
  if(m.role==='player')return `<div class="msg player"><span class="who">你</span>${esc(cleanText(m.text))}</div>`;
  return `<div class="msg npc"><span class="who">${esc(m.name||'对方')}</span>${esc(cleanText(m.text))}</div>`;
}

function scrollChatBottom(){requestAnimationFrame(()=>{const c=$('#chat-log');if(c)c.scrollTop=c.scrollHeight;});}
