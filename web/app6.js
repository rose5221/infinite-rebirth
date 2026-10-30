'use strict';

/* v6 app shell + screens. Replaces the old dark terminal UI. */

/* ---------------- line field ----------------
   Implemented in linefield6.js (60x30 quantized field, per-world sigil,
   pointer spring, live detection boxes). paintFields() is defined there. */

/* ---------------- shell ---------------- */
function topBar(){
  return `<div class="top">
    <div class="brand"><b>此世</b><span class="dot">·</span><span class="mono" style="font-size:11px;letter-spacing:.12em">REBIRTH</span></div>
    <div style="display:flex;gap:6px">
      <button class="icon" onclick="showArchive()">记</button>
      <button class="icon" onclick="showGuide6()">?</button>
      <button class="icon" onclick="showSettings6()">设置</button>
    </div>
  </div>`;
}
function render(keep){
  const y=keep?window.scrollY:0;
  const map={wake:wake6,intro:intro6,setup:setup6,play:play6};
  stopFields();
  $('#app').innerHTML = topBar() + (map[state.screen]||wake6)();
  paintFields();
  if(keep)requestAnimationFrame(()=>window.scrollTo(0,y)); else window.scrollTo(0,0);
}

/* ---------------- wake ---------------- */
function wake6(){
  return `<div class="view splash">
    <canvas class="mark" data-field="sigil" style="width:92px;height:72px"></canvas>
    <h1 class="display">这一世，<br><span>从出生开始。</span></h1>
    <p class="sub">你不是在选答案，是在过一生。<br>六十六个世界，每一段都不一样。</p>
    <button class="btn primary" style="max-width:260px" onclick="go('intro')">进入</button>
    ${meta.runs.length?`<button class="btn ghost" style="max-width:260px;margin-top:10px" onclick="showArchive()">轮回档案 · ${meta.runs.length} 次</button>`:''}
    <p class="faint mono" style="font-size:10px;letter-spacing:.14em;margin-top:34px">LOCAL ONLY · NO CLOUD</p>
  </div>`;
}

/* ---------------- intro ---------------- */
function intro6(){
  return `<div class="view">
    <div class="eyebrow">Soul archive / 01</div>
    <h1 class="title">你是谁，从哪来</h1>
    <p class="subtitle">姓名和性格会进入叙事。性别影响一些人的态度，也影响你能做的事。年龄固定从 0 岁开始——先有家人，再长大。</p>
    <canvas data-field="wide" style="height:78px;width:100%;margin:6px 0 16px"></canvas>
    <div class="stack">
      <div><label class="small muted">姓名</label><input id="name" value="${esc(state.name)}" placeholder="写一个名字"></div>
      <div class="grid2">
        <div><label class="small muted">性别</label>
          <select id="sex">
            <option ${state.sex==='男'?'selected':''}>男</option>
            <option ${state.sex==='女'?'selected':''}>女</option>
            <option ${state.sex==='其他'?'selected':''}>其他</option>
          </select>
        </div>
        <div><label class="small muted">性格</label><input id="personality" value="${esc(state.personality||'')}" placeholder="寡言 / 倔 / 心软"></div>
      </div>
      <div><label class="small muted">外貌（用于叙事与英文回顾）</label><textarea id="appearance" placeholder="例如：瘦，眼神有点躲，常穿洗旧的灰衣">${esc(state.appearance||'')}</textarea></div>
    </div>
    <div class="card" style="margin-top:18px">
      <div class="row"><h3>四维</h3><span class="blue mono" id="points">${20-allocated} 点</span></div>
      <p class="small muted">一共 20 点，每项 1-10。它们决定你遇到事时能做什么，不决定你成为谁。</p>
      ${Object.keys(state.stats).map(k=>`<div class="row" style="margin:12px 0"><span style="width:46px">${k}</span>
        <div style="display:flex;align-items:center;gap:10px">
          <button class="icon" onclick="stat('${k}',-1)">−</button>
          <output class="mono" style="width:22px;text-align:center">${state.stats[k]}</output>
          <button class="icon" onclick="stat('${k}',1)">+</button>
        </div>
        <span class="faint small">${{智识:'读书/算计',体魄:'出力/扛病',魅力:'待人/被记住',机缘:'碰上/躲开'}[k]}</span>
      </div>`).join('')}
    </div>
    <button class="btn primary" onclick="confirmIntro6()">继续</button>
  </div>`;
}
function confirmIntro6(){
  state.name=($('#name').value||'').trim()||'无名';
  state.sex=$('#sex').value;
  state.personality=$('#personality').value;
  state.appearance=$('#appearance').value;
  state.age=0;
  state.baseStats={...state.stats};
  if(!candidateIndices.length)candidateIndices=Array.from({length:66},(_,i)=>i).sort(()=>Math.random()-.5).slice(0,6);
  state.screen='setup';setupStep=0;save();render();
}

/* ---------------- setup ---------------- */
function setup6(){
  return `<div class="view">
    <div class="eyebrow">World / 02</div>
    <canvas data-field="${state.worldIndex>=0?'sigil':'wide'}" style="height:${state.worldIndex>=0?'96px':'64px'};width:100%;margin:2px 0 14px"></canvas>
    <div class="tabs">${['世界','天赋','确认'].map((t,i)=>`<button class="tab ${setupStep===i?'active':''}" onclick="setupStep=${i};render()">${t}</button>`).join('')}</div>
    ${[worldPick6,talentPick6,confirmSetup6][setupStep]()}
  </div>`;
}
function worldPick6(){
  const shown=state.showAllWorlds?WORLDS:(candidateIndices.length?candidateIndices.map(i=>WORLDS[i]):WORLDS.slice(0,6));
  return `<h1 class="title" style="margin-top:18px">去哪个世界</h1>
  <p class="subtitle">每个世界有自己的规则、货币和活法。先看六个，不满意再换一批。</p>
  <div class="grid2" style="margin:14px 0">
    <button class="btn ghost" onclick="randomWorld6()">换一批（6 个）</button>
    <button class="btn ghost" onclick="allWorlds6()">${state.showAllWorlds?'只看六个':'看全部 66 个'}</button>
  </div>
  ${shown.map(w=>{
    const i=WORLDS.indexOf(w);
    return `<div class="card">
      <div class="worldn">WORLD ${String(i+1).padStart(2,'0')} · ${esc(w.category)}</div>
      <h3 style="font:400 21px/1.35 var(--serif);margin:6px 0 4px">${esc(w.name)}</h3>
      <p class="small" style="margin:0 0 4px">${esc(w.theme||w.civilization||'')}</p>
      <p class="small muted" style="margin:0 0 10px">货币 ${esc(w.currency)} · 起始身份 ${esc(w.identity||'')}</p>
      <div class="grid2">
        <button class="btn ghost" onclick="showWorld6(${i})">看设定</button>
        <button class="btn" onclick="chooseWorld6(${i})">选这里</button>
      </div>
    </div>`;
  }).join('')}`;
}
function randomWorld6(){
  candidateIndices=Array.from({length:66},(_,i)=>i).sort(()=>Math.random()-.5).slice(0,6);
  render();
}
function allWorlds6(){
  state.showAllWorlds=!state.showAllWorlds;
  render(true);
}
function chooseWorld6(i){
  state.worldIndex=i;
  state.identity=WORLDS[i].identity||'平民';
  state.talents=[];state.pools=[];state.roll=0;
  setupStep=1;save();render();
}
function showWorld6(i){
  showDossier(i);
}
function talentPick6(){
  const w=world();
  return `<h1 class="title" style="margin-top:18px">你带着什么出生</h1>
  <p class="subtitle">天赋不是稀有度排名。普通的有普通的好处，强的都有代价，而且互相排斥。</p>
  <div class="card"><div class="row"><h3>${esc(w.name)}</h3><span class="tag">${esc(w.currency)}</span></div>
    <p class="small muted" style="margin:6px 0 0">${esc(w.theme||'')}</p></div>
  <button class="btn" onclick="roll6()">${state.pools.length?'重抽':'抽 8 个天赋'}</button>
  <p class="small faint">已选 ${state.talents.length}/3 · 重抽保留已选</p>
  ${(state.pools.length?state.pools.map(id=>talent(id)).filter(Boolean):drawable().slice(0,8)).map(t=>`
    <div class="choice" onclick="pickTalent6('${t.id}')" style="${state.talents.includes(t.id)?'border-color:var(--blue);background:#f6f9ff':''}">
      <span class="n">${t.r}</span>
      <span>
        <span class="t">${esc(t.name)}</span>
        <span class="d">${esc(t.desc)}</span>
        <span class="h">${esc(t.gain)} ／ 代价：${esc(t.cost)}</span>
      </span>
    </div>`).join('')}
  <button class="btn primary" style="margin-top:14px" ${state.talents.length===3?'':'disabled'} onclick="setupStep=2;render()">下一步</button>`;
}
function roll6(){
  const r=Math.random;
  const out=[];
  const tiers=['C','B','A','S','SS'];
  for(const t of tiers){
    const pool=TALENTS.filter(x=>x.r===t&&!x.hidden&&!conflicts(x)&&!state.talents.includes(x.id));
    if(pool.length)out.push(pool[Math.floor(r()*pool.length)].id);
  }
  while(out.length<8){
    const pool=TALENTS.filter(x=>!x.hidden&&!conflicts(x)&&!out.includes(x.id)&&!state.talents.includes(x.id));
    if(!pool.length)break;
    out.push(pool[Math.floor(r()*pool.length)].id);
  }
  state.pools=out;save();render(true);
}
function pickTalent6(id){
  if(state.talents.includes(id))state.talents=state.talents.filter(x=>x!==id);
  else if(state.talents.length<3)state.talents.push(id);
  else toast('最多三个');
  save();render(true);
}
function confirmSetup6(){
  const w=world();
  return `<h1 class="title" style="margin-top:18px">就这样开始</h1>
  <div class="card"><dl class="kv">
    <dt>身份</dt><dd>${esc(state.name)} · ${esc(state.sex)} · 0 岁</dd>
    <dt>世界</dt><dd>${esc(w.name)}（${esc(w.currency)}）</dd>
    <dt>出生地</dt><dd>${esc((DEPTH_WORLDS[w.name]&&DEPTH_WORLDS[w.name].home)||(w.locations&&w.locations[0]&&w.locations[0].name)||w.name)}</dd>
    <dt>天赋</dt><dd>${state.talents.map(id=>talent(id)?.name).filter(Boolean).join('、')||'无'}</dd>
  </dl></div>
  <div class="notice">你会从出生开始。死亡后可以带着记忆去下一个世界重来，也可以就此结束，把这一生记进档案。</div>
  <button class="btn primary" onclick="begin6()">出生</button>`;
}

/* ---------------- sheets ---------------- */
function sheet6(html){
  const el=document.createElement('div');
  el.className='modal';el.id='modal';
  el.innerHTML=`<div>${html}</div>`;
  el.addEventListener('click',e=>{if(e.target===el)el.remove();});
  document.body.appendChild(el);
}
function showGuide6(){
  sheet6(`<h2>怎么玩</h2>
  <p class="small">你从 0 岁出生，一段一段地活。每一段都是一件具体的事，摆在面前的是三个不同的做法，不是三道心理题。</p>
  <p class="small">选项会真的结算：钱、健康、声望、和人的亲近、七情，以及留在后面的「没结的事」。有些事隔几年会回来找你。</p>
  <p class="small">普通人寿限 100 岁。商店里的续命药一颗续十年，价格每买一颗翻倍——这是十年尺度的目标，不是打几份工就能买到的东西。</p>
  <p class="small">在设置里填 DeepSeek 密钥后，每一段剧情、三个选项和三个英文词都由 AI 按你此刻的处境现写；不填也能离线玩，剧情由本地导演生成。</p>
  <p class="small faint">所有进度、密钥都只保存在这台设备的浏览器里，不上传云端。</p>
  <button class="btn" onclick="document.getElementById('modal').remove()">知道了</button>`);
}
function showArchive(){
  const runs=meta.runs||[];
  sheet6(`<div class="row"><h2 style="margin:0">轮回档案</h2><span class="tag">${runs.length} 次</span></div>
  <p class="small muted" style="margin:6px 0 14px">每一世都会留在这里。清空浏览器数据会一起消失。</p>
  ${runs.length?runs.map(r=>`<div class="card" style="margin-bottom:10px">
    <div class="row"><b style="font:400 17px/1.4 var(--serif)">${esc(r.name||'无名')}</b><span class="mono small">${r.age} 岁</span></div>
    <p class="small muted" style="margin:4px 0 0">${esc(r.world||'')} · ${esc(r.title||'')}${r.date?' · '+esc(r.date):''}</p>
  </div>`).join(''):'<p class="small muted">还没有走完的一生。先去活一次。</p>'}
  <button class="btn ghost" style="margin-top:8px" onclick="document.getElementById('modal').remove()">关闭</button>`);
}
function showSettings6(){
  const aiOn=!!(state.apiKey&&state.ai!==false);
  sheet6(`<h2>设置</h2>
  <div class="notice">不外传。密钥只存在这台设备的浏览器里，请求直接发往 DeepSeek 官方接口。</div>
  <div style="margin:14px 0"><label class="small muted">DeepSeek API Key</label>
    <input id="api6" type="password" value="${esc(state.apiKey||'')}" placeholder="sk-... 不填则离线剧情">
    <p class="small faint" style="margin:6px 0 0">填了之后，每段剧情和三个选项由 AI 现写；失败会自动退回本地剧情，不会卡住。</p>
  </div>
  <label class="small" style="display:flex;gap:8px;align-items:center;margin:10px 0"><input type="checkbox" id="aion6" ${aiOn?'checked':''} style="width:auto"> 用 AI 生成剧情与选项</label>
  <label class="small" style="display:flex;gap:8px;align-items:center;margin:10px 0"><input type="checkbox" id="en6" ${state.english?'checked':''} style="width:auto"> 每段之后提供英文回顾</label>
  <div class="grid2" style="margin-top:12px">
    <button class="btn" onclick="saveSettings6()">保存</button>
    <button class="btn ghost" onclick="aiTest6()">测试接口</button>
  </div>
  <p class="small faint" style="margin-top:10px">模型 deepseek-chat · 状态：${state.apiKey?(AI6.lastError?'上次失败：'+esc(AI6.lastError):'已配置'):'未配置'}</p>
  <hr style="border:none;border-top:1px solid var(--rule);margin:18px 0">
  <button class="btn danger" onclick="wipe6()">清除本地存档</button>
  <button class="btn ghost" style="margin-top:10px" onclick="document.getElementById('modal').remove()">关闭</button>`);
}
function saveSettings6(){
  const a=document.getElementById('api6'), on=document.getElementById('aion6'), en=document.getElementById('en6');
  if(a)state.apiKey=a.value.trim();
  if(on)state.ai=on.checked;
  if(en)state.english=en.checked;
  AI6.lastError='';
  save();document.getElementById('modal').remove();render(true);
  toast(state.apiKey?'已保存 · 下一段开始由 AI 续写':'已保存 · 离线剧情');
}
function wipe6(){
  if(!confirm('删除这台设备上的全部进度和密钥？'))return;
  try{localStorage.removeItem(KEY);localStorage.removeItem(META_KEY);}catch(e){}
  location.reload();
}

/* ---------------- scene generation (AI first, local fallback) ---------------- */
let sceneBusy6=false;
let prefetch6=null, prefetchBusy6=false;

/* write the next scene while the player is reading the result, so 'continue' feels instant */
function prefetchNext6(){
  if(prefetch6||prefetchBusy6)return;
  if(!(typeof aiReady==='function'&&aiReady()))return;
  prefetchBusy6=true;
  const h=hashText((state.name||'')+'|'+state.days+'|'+(state.memories||[]).length+'|'+(state.lastBeat&&state.lastBeat.title||''));
  aiScene6(()=>null).then(sc=>{
    prefetchBusy6=false;
    if(sc)prefetch6={key:h,scene:sc};
  }).catch(()=>{prefetchBusy6=false;});
}
function takePrefetch6(){
  const sc=prefetch6?prefetch6.scene:null;
  prefetch6=null;
  return sc;
}
function ensureScene6(){
  if(state.scene&&state.scene.choices)return true;
  const pre=takePrefetch6();
  if(pre){
    state.scene=pre;
    if(!state.scene.english||!state.scene.english.length)state.scene.english=pickWords3(state.scene);
    save();
    return true;
  }
  if(sceneBusy6)return false;
  if(typeof aiReady==='function'&&aiReady()){
    sceneBusy6=true;
    aiScene6(()=>directorPick6()).then(sc=>{
      sceneBusy6=false;
      state.scene=sc||directorPick6();
      if(!state.scene.english||!state.scene.english.length)state.scene.english=pickWords3(state.scene);
      save();
      if(page==='scene'&&!state.result6)render(true);
    }).catch(()=>{
      sceneBusy6=false;state.scene=directorPick6();save();
      if(page==='scene')render(true);
    });
    return false;
  }
  state.scene=directorPick6();
  return true;
}

/* ---------------- play ---------------- */
function play6(){
  if(state.result6)return result6();
  if(state.deceased)return ending6();
  const body = page==='scene'?scene6Page()
    : page==='life'?life6()
    : page==='relation'?relation6()
    : page==='memory'?memory6()
    : page==='shop'?shop6()
    : page==='map'?map6()
    : scene6Page();
  return `<div style="padding:0">${nav6()}${body}</div>`;
}
function nav6(){
  const L=worldLex();
  return `<div style="padding:16px 18px 0">
    <div class="row">
      <div>
        <div class="mono" style="font-size:10px;letter-spacing:.12em;color:var(--ink-faint)">${stage5().label} · YEAR ${cal().year}</div>
        <div style="font:400 19px/1.3 var(--serif);margin-top:2px">${age()} 岁 · ${esc(occupationTitle())}</div>
        <div class="small muted" style="margin-top:2px">${esc(L.place)} · ${esc(L.name)}</div>
      </div>
      <div style="text-align:right">
        <div class="mono" style="font-size:19px">${state.coins.toLocaleString()}</div>
        <div class="mono" style="font-size:10px;color:var(--ink-faint)">${esc(L.currency)}</div>
      </div>
    </div>
    <div class="moods">${Object.entries(state.emotions||{}).map(([k,v])=>`<div class="mood"><div class="lb">${k}</div><div class="bar"><i style="height:${Math.max(2,v*0.24)}px"></i></div><div class="v">${v}</div></div>`).join('')}</div>
  </div>
  <div class="tabs" style="margin-top:12px">${[['scene','此刻'],['life','营生'],['relation','人物'],['memory','记忆'],['shop','商店'],['map','地图']].map(([k,n])=>`<button class="tab ${page===k?'active':''}" onclick="nav6to('${k}')">${n}</button>`).join('')}</div>`;
}
function nav6to(p){page=p;render();}

function scene6Page(){
  ensureLife5();
  const ready=ensureScene6();
  if(!ready){
    return `<div class="view" style="padding-top:16px">
      <canvas data-field="wide" style="height:84px;width:100%;margin-bottom:18px"></canvas>
      <div class="scene-meta">${esc(world().name)} · ${esc(currentPlace5())} · ${age()} 岁</div>
      <h1 class="scene-title">正在写下这一段…</h1>
      <div class="prose"><p class="faint">AI 正在按你此刻的处境写这一段：谁在场、手里有多少钱、上一次选了什么。通常几秒钟。</p>
      <p class="small faint" style="margin-top:10px">如果网络不通，会自动换成本地剧情，不会停在这里。</p></div>
      <div class="loading"><i></i></div>
    </div>`;
  }
  const s=state.scene;
  if(!s.english||!s.english.length)s.english=pickWords3(s);
  const recall=s.recall?`<div class="notice" style="margin-top:12px"><b>旧事</b> · ${esc(s.recall.title)}：${esc(String(s.recall.text||'').slice(0,54))}…</div>`:'';
  return `<div class="view" style="padding-top:16px">
    <canvas data-field="wide" style="height:84px;width:100%;margin-bottom:16px"></canvas>
    <div class="scene-head">
      <div class="scene-meta">${esc(world().name)} · ${esc(s.location)} · ${span6(s.days)} · <span class="src">${s.ai?'AI 现写':'本地导演'}</span></div>
      <h1 class="scene-title">${esc(s.title)}</h1>
      <div class="prose">${esc(cleanText(s.opening))}</div>
      ${s.ask?`<div class="ask">${esc(s.ask)}</div>`:''}
    </div>
    ${recall}
    ${s.choices.map((c,i)=>`<button class="choice" onclick="choose6(${i})">
      <span class="n">0${i+1}</span>
      <span><span class="t">${esc(c.title)}</span><span class="d">${esc(c.desc)}</span><span class="h">${esc(c.hint)}</span></span>
    </button>`).join('')}
    <div class="row" style="margin-top:14px">
      <p class="small faint" style="margin:0">三个选择会走向不同的路，也会留下不同的后患。</p>
      <button class="btn ghost" style="width:auto;padding:7px 12px" onclick="rerollScene6()">${s.ai?'重写这一段':'换一段'}</button>
    </div>
  </div>`;
}
function choose6(i){ resolveScene6(i); }
function span6(d){
  d=Math.max(1,Math.round(d||0));
  if(d<45)return d+' 天';
  if(d<330)return Math.round(d/30)+' 个月';
  const y=d/365;
  return (y<1.6?'约一年':y.toFixed(1)+' 年');
}

function result6(){
  const r=state.result6;
  return `<div class="view">
    <div class="eyebrow">After this</div>
    <h1 class="scene-title" style="margin-bottom:6px">${esc(r.title)}</h1>
    <div class="small faint mono" style="margin-bottom:14px">你选了：${esc(r.choice)} · ${span6(r.days)} · ${r.age} 岁</div>
    <canvas data-field="wide" style="height:56px;width:100%;margin-bottom:14px"></canvas>
    <div class="prose">${esc(cleanText(r.outcome))}</div>
    ${r.gains.length?`<div class="gains">${r.gains.map(g=>`<span class="gain ${g.c}">${esc(g.k)} ${g.v>0?'+':''}${g.v}</span>`).join('')}</div>`:''}
    ${r.risk?`<div class="small" style="margin-top:10px"><span class="tag">${r.risk.won?'赌赢了':'赌输了'} · ${r.risk.chance}%</span></div>`:''}
    ${r.thread?`<div class="notice" style="margin-top:14px"><b>留下的事</b> · ${esc(r.thread)}<br><span class="small faint">它会留在后面，隔些日子回来找你。</span></div>`:''}
    <div class="card" style="margin-top:18px"><div class="row"><h3 style="font:400 17px/1.4 var(--serif)">英文回顾</h3><button class="btn ghost" style="width:auto;padding:7px 11px" onclick="toggleRecap6()">${state.recapOpen?'收起':'展开'}</button></div>
      ${state.recapOpen?`<p class="recap" style="margin-top:10px">${esc(recapEN(r))}</p>`:'<p class="small muted" style="margin:6px 0 0">把这一段发生的事翻成英文。想读再展开。</p>'}
    </div>
    <div class="card" style="margin-top:20px">
      <div class="row"><h3 style="font:400 17px/1.4 var(--serif)">这段里的三个词</h3><span class="tag">英文</span></div>
      <p class="small muted" style="margin:6px 0 4px">从刚才发生的事里取的词。点一下记下来，之后会再遇到。</p>
      <div class="words">${r.words.map(w=>`<div class="word ${meta.english.includes(w.id)?'on':''}" onclick="learnWord6('${w.id}')">
        <div class="w">${esc(w.word)}</div><div class="z">${esc(w.zh)}</div><div class="e">${esc(w.ex)}</div></div>`).join('')}</div>
    </div>
    <button class="btn primary" style="margin-top:18px" onclick="continueScene6()">继续</button>
  </div>`;
}
function toggleRecap6(){
  state.recapOpen=!state.recapOpen;save();render(true);
  if(state.recapOpen&&state.result6&&!state.result6.outcomeEN)translateRecap6();
}
async function translateRecap6(){
  const r=state.result6;if(!r||r.enBusy)return;
  r.enBusy=true;
  if(!(state.ai&&state.apiKey)){r.enBusy=false;return;}
  try{
    const sn=r.sceneSnapshot||{};
    const prompt=`Translate this Chinese life-sim scene into natural English for a language learner. 90-140 words, past tense, simple but literary. No Chinese characters, no commentary. Only JSON {"english":"..."}.

World: ${world().name}. Scene: ${sn.title}. Event: ${sn.opening}. The person chose: ${r.choice}. Result: ${r.outcome}.`;
    const res=await fetch('https://api.deepseek.com/v1/chat/completions',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${state.apiKey}`},body:JSON.stringify({model:'deepseek-chat',messages:[{role:'user',content:prompt}],temperature:.4,response_format:{type:'json_object'}})});
    if(!res.ok)throw Error('api');
    const d=await res.json();const parsed=JSON.parse(d.choices[0].message.content);
    if(parsed.english&&!/[\u4e00-\u9fa5]/.test(parsed.english)){r.outcomeEN=String(parsed.english).trim();}
  }catch(e){}
  r.enBusy=false;save();render(true);
}
function recapEN(r){
  const key=r.title+'|'+r.choice+'|'+r.days;
  if(state.recapCache&&state.recapCache.key===key)return state.recapCache.text;
  const ageWord=r.age<4?'a small child':r.age<13?'a child':r.age<19?'a teenager':r.age<51?'an adult':'an old person';
  const body=r.outcomeEN||`For about ${r.days} days nothing dramatic was recorded: work, money, other people, and the quiet sense that time keeps moving.`;
  const text=`This passage covers about ${r.days} days, when he or she was ${r.age}, ${ageWord}. ${body}`;
  state.recapCache={key,text};
  return text;
}
function wordById6(id){
  return (typeof ENGLISH_PACK!=='undefined'&&ENGLISH_PACK.find(x=>x.id===id))
    || (typeof EXAM_WORDS!=='undefined'&&EXAM_WORDS.find(x=>x.id===id))
    || (state.aiWords&&state.aiWords[id])||null;
}
function learnWord6(id){
  if(!state.englishSeen.includes(id))state.englishSeen.push(id);
  if(!meta.english.includes(id)){meta.english.push(id);saveMeta();}
  save();render(true);
}

/* ---------------- life ---------------- */
function life6(){
  const L=worldLex();
  const wage=state.employed?Math.min(state.salary||0,annualIncome()/12):0;
  const outgo=Math.floor(monthlyLiving());
  return `<div class="view">
    <div class="eyebrow">Ledger</div>
    <h1 class="title">营生</h1>
    <canvas data-field="wide" style="height:52px;width:100%;margin-bottom:12px"></canvas>
    <div class="card"><dl class="kv">
      <dt>营生</dt><dd>${esc(occupationTitle())}</dd>
      <dt>月入</dt><dd>${wage?wage.toLocaleString()+' '+esc(L.currency):'—'}</dd>
      <dt>月出</dt><dd>${outgo.toLocaleString()} ${esc(L.currency)}</dd>
      <dt>积蓄</dt><dd>${state.coins.toLocaleString()} ${esc(L.currency)}</dd>
      <dt>孩子</dt><dd>${state.children||0} 个${state.spouse?' · 与'+esc(state.spouse):''}</dd>
    </dl></div>
    ${state.shopName?`<div class="card"><div class="row"><h3 style="font:400 18px/1.4 var(--serif)">${esc(state.shopName)}</h3><span class="tag">铺子</span></div>
      <p class="small muted">你有一个自己的营生。它会跟着年头变化，也要你花心思。</p></div>`:
      `<div class="card"><h3 style="font:400 18px/1.4 var(--serif)">还没有自己的营生</h3><p class="small muted">攒够本钱，可以开一间铺子。之后会多一条要照顾的线。</p></div>`}
    <div class="card"><h3 style="font:400 18px/1.4 var(--serif)">续命</h3>
      <p class="small muted">寿限 ${state.lifeLimit} 岁。药价随行市变，一颗续十年。</p>
      <div class="row" style="margin-top:8px"><span class="mono">${pillPrice().toLocaleString()} ${esc(L.currency)}</span>
      <button class="btn ghost" style="width:auto;padding:8px 12px" onclick="nav6to('shop')">去商店</button></div></div>
    <div class="card"><h3 style="font:400 18px/1.4 var(--serif)">四维</h3>
      ${Object.entries(state.stats).map(([k,v])=>`<div style="margin:10px 0"><div class="statline"><span>${k}</span><span>${v}</span></div><div class="bar"><i style="width:${v*5}%"></i></div></div>`).join('')}
    </div>
    <button class="btn ghost" onclick="nav6to('scene')">回到此刻</button>
  </div>`;
}

/* ---------------- relation ---------------- */
function relation6(){
  const rs=(state.relationships||[]);
  const fam=rs.filter(r=>r.family), oth=rs.filter(r=>!r.family&&!r.faction);
  const card=r=>`<div class="card">
    <div class="row"><div><h3 style="font:400 18px/1.4 var(--serif)">${esc(r.name)}</h3>
      <div class="small muted">${esc(r.role)}${r.family?' · '+esc(r.family):(r.romance?' · 伴侣':'')}</div></div>
      <span class="tag">${r.family||relationStage5(r)}</span></div>
    <p class="small" style="margin:8px 0 0">${esc(r.trait||'')}</p>
    ${r.desire?`<p class="small muted" style="margin:4px 0 0">想：${esc(r.desire)}</p>`:''}
    <div class="statline" style="margin-top:10px"><span>亲近</span><span>${r.affinity}</span></div>
    <div class="bar"><i style="width:${r.affinity}%"></i></div>
    ${r.family?'':`<div class="grid2" style="margin-top:12px">
      <button class="btn ghost" onclick="spend6('${r.id}','talk')">闲谈</button>
      <button class="btn ghost" onclick="spend6('${r.id}','share')">一起做事</button>
    </div>`}
  </div>`;
  return `<div class="view">
    <div class="eyebrow">People</div>
    <h1 class="title">人</h1>
    <p class="subtitle">关系不是数值奖励。它会在后面的场景里回来找你。</p>
    ${fam.length?`<div class="scene-meta" style="margin-top:16px">家人</div>${fam.map(card).join('')}`:''}
    ${oth.length?`<div class="scene-meta" style="margin-top:18px">其他人</div>${oth.map(card).join('')}`:'<p class="small muted">还没有认识家人以外的人。长大后会遇到。</p>'}
  </div>`;
}
function spend6(id,kind){
  const r=state.relationships.find(x=>x.id===id);if(!r)return;
  const d=kind==='share'?45:5;
  const a=kind==='share'?12:5, t=kind==='share'?8:3;
  r.affinity=Math.min(100,r.affinity+a); r.trust=Math.min(100,r.trust+t); r.lastSceneKey=state.days;
  state.relationNote=`${r.name}和你${kind==='share'?'一起做了一件具体的事':'聊了一会儿'}。`;
  advance5(d);save();render(true);
  toast(`${r.name} · 亲近 ${r.affinity}`);
}

/* ---------------- memory / shop / map ---------------- */
function memory6(){
  const mem=state.memories||[];
  return `<div class="view">
    <div class="eyebrow">Memory</div>
    <h1 class="title">记忆</h1>
    <p class="subtitle">发生过的事不会全留下。留下的那些，会在以后回来。</p>
    ${mem.length?mem.slice(0,26).map(m=>`<div class="card">
      <div class="row"><div class="scene-meta">${m.age} 岁 · 第${m.year}年</div><span class="tag">${esc(m.tags[0]||'片段')}</span></div>
      <h3 style="font:400 17px/1.4 var(--serif);margin:6px 0 4px">${esc(m.title)}</h3>
      <p class="small">${esc(m.text)}</p>
      ${m.people.length?`<p class="small faint">与：${esc(m.people.join('、'))}</p>`:''}
    </div>`).join(''):'<p class="small muted">还没有。先去活。</p>'}
    ${(state.englishSeen||[]).length?`<div class="scene-meta" style="margin-top:22px">遇到过的词</div>
      <div class="words" style="margin-top:8px">${state.englishSeen.slice(-12).reverse().map(id=>{const w=wordById6(id);return w?`<div class="word"><div class="w">${esc(w.word)}</div><div class="z">${esc(w.zh)}</div></div>`:'';}).join('')}</div>`:''}
  </div>`;
}
function shop6(){
  const L=worldLex();
  const pill=pillPrice();
  const items=[['伤药',Math.floor(45*rate()),'恢复 35 生命'],['补给',Math.floor(30*rate()),'恢复精力']];
  return `<div class="view">
    <div class="eyebrow">World shop</div>
    <h1 class="title">商店</h1>
    <p class="subtitle">${esc(L.name)}的物价按当日的行市算。1 标准券 = ${rate().toFixed(2)} ${esc(L.currency)}。</p>
    <div class="card">
      <div class="row"><h3 style="font:400 19px/1.4 var(--serif)">续命药</h3><span class="mono">${pill.toLocaleString()}</span></div>
      <p class="small muted">一颗续十年。寿限到之前买才有用。已经吃过 ${state.pills||0} 颗。</p>
      <button class="btn primary" ${state.coins<pill?'disabled':''} style="margin-top:10px" onclick="buyPill6(${pill})">买一颗</button>
      ${state.coins<pill?`<p class="small faint" style="margin-top:8px">还差 ${(pill-state.coins).toLocaleString()}。这不是几天能攒出来的。</p>`:''}
    </div>
    ${items.map(([n,p,d])=>`<div class="card"><div class="row"><h3 style="font:400 17px/1.4 var(--serif)">${n}</h3><span class="mono">${p}</span></div>
      <p class="small muted">${d}</p><button class="btn ghost" style="margin-top:8px" ${state.coins<p?'disabled':''} onclick="buyItem6('${n}',${p})">买</button></div>`).join('')}
  </div>`;
}
function buyPill6(p){
  if(state.coins<p)return;
  state.coins-=p;state.pills=(state.pills||0)+1;state.lifeLimit+=10;state.maxAge=state.lifeLimit;
  state.chronicle.unshift({year:cal().year,title:'续命',detail:`买了一颗续命药，寿限到 ${state.lifeLimit} 岁。`});
  save();render();toast('寿限 +10 年');
}
function buyItem6(n,p){
  if(state.coins<p)return;
  state.coins-=p;
  if(n==='伤药')state.health=Math.min(100,state.health+35);
  if(n==='补给')state.energy=Math.min(100,state.energy+45);
  save();render();
}
function map6(){
  const style=mapStyle();
  const meta=MAP_LAYOUTS[style]||{label:'',hint:''};
  const nodes=mapNodes(), edges=mapEdges(nodes), cur=state.location;
  const lines=edges.map(([a,b])=>`<line x1="${nodes[a].x}" y1="${nodes[a].y}" x2="${nodes[b].x}" y2="${nodes[b].y}" stroke="rgba(32,34,32,.22)" stroke-width="0.6"/>`).join('');
  const dots=nodes.map(nd=>{
    const here=nd.index===cur, adj=areAdjacent(cur,nd.index);
    return `<g ${nd.index===cur?'':`onclick="tryTravel(${nd.index})"`} style="cursor:pointer">
      <circle cx="${nd.x}" cy="${nd.y}" r="${here?3.6:2.4}" fill="${here?'#2152e7':adj?'#202220':'rgba(32,34,32,.35)'}"/>
      <text x="${nd.x}" y="${nd.y-5}" text-anchor="middle" font-size="3.3" font-family="Georgia,serif" fill="${here?'#2152e7':'#5b5f5b'}">${esc(nd.name).slice(0,9)}</text>
    </g>`;
  }).join('');
  return `<div class="view">
    <div class="eyebrow">Map</div>
    <h1 class="title">${esc(world().name)}</h1>
    <p class="subtitle">${esc(meta.label)} · ${esc(meta.hint)}</p>
    <div class="mapbox"><svg viewBox="0 0 100 100">${lines}${dots}</svg></div>
    <div style="margin-top:14px">
      ${nodes.map(nd=>{
        const here=nd.index===cur, adj=areAdjacent(cur,nd.index);
        const days=mapTravelDays(cur,nd.index), cost=Math.max(20,Math.floor(days*1.4));
        return `<div class="mapitem"><div><div class="nm">${esc(nd.name)}${here?' <span class="here">你在这里</span>':''}</div>
          <div class="rl">${esc(nd.role||'')}</div></div>
          ${here?'':adj?`<button class="icon" onclick="tryTravel(${nd.index})">${days}天</button>`:'<span class="faint small">需经相邻</span>'}
        </div>`;
      }).join('')}
    </div>
  </div>`;
}

/* ---------------- ending ---------------- */
function ending6(){
  const r=Math.random;
  const title=(state.spouse?'有人送终':state.children?'有后有代':state.importance>60?'一域有名':'普通一生');
  const mem=(state.memories||[]).slice(0,8);
  return `<div class="view">
    <div class="eyebrow">The end</div>
    <h1 class="title">${age()} 岁，这一生结束</h1>
    <canvas data-field="wide" style="height:88px;width:100%;margin:10px 0 18px"></canvas>
    <p class="subtitle">${esc(state.name)} · ${esc(world().name)} · ${esc(title)}</p>
    <div class="card"><dl class="kv">
      <dt>活到</dt><dd>${age()} 岁</dd>
      <dt>留下</dt><dd>${state.spouse?esc(state.spouse)+' · ':''}${state.children||0} 个孩子</dd>
      <dt>积蓄</dt><dd>${state.coins.toLocaleString()} ${esc(world().currency)}</dd>
      <dt>遇到的人</dt><dd>${(state.relationships||[]).filter(x=>!x.family).length} 位</dd>
    </dl></div>
    <div class="card"><h3 style="font:400 17px/1.4 var(--serif)">最后记得的事</h3>
      ${mem.map(m=>`<p class="small" style="margin:7px 0"><span class="faint mono">${m.age}岁</span> ${esc(m.title)}</p>`).join('')||'<p class="small muted">没有。</p>'}</div>
    <div class="notice">你可以带着这一世的记忆，去下一个世界重新出生。也可以到此为止。</div>
    <button class="btn primary" onclick="rebirth6()">带着记忆重生</button>
    <button class="btn ghost" style="margin-top:10px" onclick="finish6()">结束，记入档案</button>
  </div>`;
}

/* ---------------- start / rebirth ---------------- */
function begin6(){
  resetLife();
  prefetch6=null;prefetchBusy6=false;
  ensureLife5();
  const e=effect();
  state.coins=Math.max(80,START_COINS+e.add.coins);
  state.lifeLimit=100+e.add.life;state.maxAge=state.lifeLimit;
  state.health=Math.max(20,100+e.add.health);
  for(const k in e.add.stats)state.stats[k]=Math.min(20,state.stats[k]+e.add.stats[k]);
  state.occupation='';
  seedFamily(activePack());
  state.screen='play';page='scene';
  state.scene=null;state.lastBeat=null;
  save();render();
  toast('你出生了');
}
function rebirth6(){
  ensureMetaSoul();
  recordLifeLesson();
  const keep={name:state.name,sex:state.sex,stats:{...state.stats},talents:[...state.talents]};
  const next=nextWorldIndex();
  resetLife();
  state.worldIndex=next;state.identity=WORLDS[next].identity||'平民';
  state.name=keep.name;state.sex=keep.sex;state.stats={...keep.stats};state.baseStats={...keep.stats};state.talents=keep.talents;
  state.pastLives=(meta.soul.kept||[]).slice(0,3);
  state.screen='play';page='scene';
  begin6();
  state.relationNote=`你带着上一世的影子醒在${world().name}。有些画面眼熟，有些名字想不起了。`;
  save();render();
}
function finish6(){
  if(!state.runRecorded){
    meta.runs.unshift({date:new Date().toLocaleString('zh-CN'),name:state.name,world:world().name,age:age(),title:endingTitle(),score:score(),achievements:[...state.achievements]});
    meta.runs=meta.runs.slice(0,30);state.runRecorded=true;saveMeta();
  }
  state.screen='wake';state.worldIndex=-1;state.talents=[];state.pools=[];
  save();render();
}

/* ---------------- keep old helper entry points working ---------------- */
function begin(){begin6();}

/* v6 boot: paint last so it wins over legacy load-time renders */
render();
