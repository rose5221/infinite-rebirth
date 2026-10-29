'use strict';

/* v5.2 per-world maps: every world gets its own layout, nodes and routes. */

const MAP_LAYOUTS = {
  ring:      {label:'环形',  hint:'地点围成一圈，相邻才能走'},
  line:      {label:'一线',  hint:'沿一条主路排开，只能前后移动'},
  vertical:  {label:'垂直',  hint:'上下分层，越往上越难进'},
  grid:      {label:'网格',  hint:'四方分布，斜着走要绕路'},
  star:      {label:'辐射',  hint:'中心是市集，四周是各自的路'},
  river:     {label:'沿河',  hint:'顺着水道排开，逆流更慢'},
  dual:      {label:'两岸',  hint:'两岸各有两处，中间靠渡口相连'},
  tower:     {label:'塔层',  hint:'一层一层往上，越上越少人'}
};

const MAP_STYLE_BY_WORLD = {
  '穗骨原':'line','无昼京':'vertical','借寿渡':'dual','纸甲梁':'line','负岳游原':'ring',
  '回声讼峡':'dual','药雨残朝':'ring','百姓城':'grid','鲸骨漕原':'river','井垂天':'vertical',
  '雪签江湖':'line','灯骨县':'star','逆葬原':'line','图外驿':'line','潮刻城':'tower',
  '盐月塞':'ring','织雷泽':'grid','走马碑林':'line','蝉醒都':'tower','星耒野':'river',
  '雾契群岛':'ring','无仙县':'grid',
  '逆轨环城':'ring','髓云都市':'tower','群胚拖舰':'line','灰烬气象台':'vertical',
  '年轮星':'ring','租壳人间':'vertical','垂天天梯':'vertical','黑潮档案馆':'star',
  '绿锈原':'grid','回环世代船':'ring','睡港云城':'vertical','静网废都':'grid',
  '昼焰极城':'ring','坠潮群岛':'ring','众身议会':'star','叠选城':'grid',
  '熵债矿区':'vertical','缓语检疫带':'line','无人造陆厂':'grid','冰下暖渊':'vertical',
  '借历难民站':'star','末光播种界':'ring',
  '钟葬群岛':'ring','镜证荒原':'grid','无昼牧场':'line','逆雨城':'vertical',
  '圣骸铁路局':'line','空白修院':'tower','灰烬婚约':'dual','疫冠温室':'ring',
  '债灵交易所':'star','黑雪边境':'line','鸦语港':'river','巨兽内科国':'tower',
  '坠月农场':'ring','第十三盏路灯':'line','木偶退朝':'tower','盐潮修道院':'dual',
  '无声剧团国':'star','蜂棺陵园':'grid','千门税关':'grid','星囚磨坊':'ring',
  '谎言孵化场':'grid','黎明回收站':'line'
};

function mapStyle(){
  return MAP_STYLE_BY_WORLD[world().name] || 'ring';
}

/* node coordinates in a 0-100 box, deterministic per world */
function mapNodes(){
  const list = locs();
  const style = mapStyle();
  const n = list.length;
  const pos = [];
  if(style==='line' || style==='river'){
    for(let i=0;i<n;i++) pos.push({x:12+ (76/(Math.max(1,n-1)))*i, y: style==='river'? 50 + (i%2? 16:-16) : 50});
  } else if(style==='vertical' || style==='tower'){
    for(let i=0;i<n;i++) pos.push({x: 50 + (i%2? 14:-14), y: 86 - (66/(Math.max(1,n-1)))*i});
  } else if(style==='dual'){
    for(let i=0;i<n;i++) pos.push({x: i%2? 74:26, y: 28 + Math.floor(i/2)*38});
  } else if(style==='grid'){
    const gx=[26,74,26,74,50], gy=[26,26,74,74,50];
    for(let i=0;i<n;i++) pos.push({x:gx[i%5], y:gy[i%5]});
  } else if(style==='star'){
    pos.push({x:50,y:50});
    for(let i=1;i<n;i++){const a=(-90+(360/(n-1))*(i-1))*Math.PI/180;pos.push({x:50+34*Math.cos(a),y:50+34*Math.sin(a)});}
  } else {
    const r=34, c={x:50,y:50};
    for(let i=0;i<n;i++){const a=(-90+(360/Math.max(1,n))*i)*Math.PI/180;pos.push({x:c.x+r*Math.cos(a),y:c.y+r*Math.sin(a)});}
  }
  return list.map((l,i)=>({...l, index:i, ...pos[i]}));
}

function mapEdges(nodes){
  const style = mapStyle(), n = nodes.length;
  const edges = [];
  const add=(a,b)=>{if(a<b&&a>=0&&b<n)edges.push([a,b]);};
  if(style==='star'){
    for(let i=1;i<n;i++)add(0,i);
  } else if(style==='dual'){
    add(0,1);add(2,3);add(1,2);
  } else if(style==='grid'){
    add(0,1);add(0,2);add(1,3);add(2,3);add(1,4);add(2,4);
  } else {
    for(let i=0;i<n-1;i++)add(i,i+1);
    if(style==='ring')add(0,n-1);
  }
  return edges;
}
function areAdjacent(a,b){
  const nodes=mapNodes(), edges=mapEdges(nodes);
  return edges.some(([x,y])=>(x===a&&y===b)||(x===b&&y===a));
}

function mapTravelDays(a,b){
  const style=mapStyle();
  const base=Math.abs(a-b);
  const per={line:45,river:55,ring:40,vertical:60,tower:75,grid:50,star:30,dual:70}[style]||45;
  return Math.max(7, base*per);
}

function mapPage(){
  const nodes=mapNodes(), edges=mapEdges(nodes), style=mapStyle(), meta=MAP_LAYOUTS[style]||MAP_LAYOUTS.ring;
  const cur=state.location;
  const lines=edges.map(([a,b])=>{
    const n1=nodes[a], n2=nodes[b];
    return `<line x1="${n1.x}" y1="${n1.y}" x2="${n2.x}" y2="${n2.y}" stroke="#19444a" stroke-width="0.7" stroke-dasharray="2 2"/>`;
  }).join('');
  const dots=nodes.map(nd=>{
    const here=nd.index===cur;
    const adj=areAdjacent(cur,nd.index);
    const color=here?'#65e8d2':(adj?'#3f8f92':'#2a5f63');
    const r=here?4.4:(adj?3.4:2.8);
    return `<g onclick="${nd.index===cur?'':'tryTravel('+nd.index+')'}" style="cursor:pointer">
      <circle cx="${nd.x}" cy="${nd.y}" r="${r+2.5}" fill="${here?'#65e8d222':'transparent'}"/>
      <circle cx="${nd.x}" cy="${nd.y}" r="${r}" fill="${color}"/>
      <text x="${nd.x}" y="${nd.y-6.5}" text-anchor="middle" font-size="3.6" fill="${here?'#65e8d2':'#9fb9bb'}">${esc(nd.name).slice(0,10)}</text>
    </g>`;
  }).join('');
  const list=nodes.map(nd=>{
    const here=nd.index===cur, adj=areAdjacent(cur,nd.index);
    const days=mapTravelDays(cur,nd.index);
    const cost=Math.max(20,Math.floor(days*(1.4*effect().travel)));
    return `<div class="card mapnode ${here?'cur':''}"><div class="row"><div><h3 class="${here?'cyan':''}">${esc(nd.name)}</h3><span class="small muted">${esc(nd.role||'')}</span></div>${here?'<span class="tag cyan">你在这里</span>':adj?`<span class="tag">${days}天 · ${cost}${world().currency}</span>`:'<span class="tag" style="opacity:.5">需先经过相邻地点</span>'}</div>${here?'':adj?`<button class="btn" onclick="tryTravel(${nd.index})">前往 ${esc(nd.name)} · ${days}天</button>`:''}</div>`;
  }).join('');
  return `<div class="view"><div class="eyebrow">MAP OF ${esc(world().name)}</div><h1 class="title">${esc(world().name)}的地图</h1>
  <p class="subtitle">${esc(meta.label)}布局：${esc(meta.hint)}。据点之间要走真实的路，越远越耗时。</p>
  <div class="card" style="padding:10px">
    <svg viewBox="0 0 100 100" style="width:100%;height:auto;display:block">${lines}${dots}</svg>
  </div>
  <div class="notice">${esc(world().space||'')}</div>
  ${list}</div>`;
}

function tryTravel(i){
  if(i===state.location)return;
  if(!areAdjacent(state.location,i))return toast('这里没有直路，先走到相邻的地点');
  const days=mapTravelDays(state.location,i);
  const cost=Math.max(20,Math.floor(days*(1.4*effect().travel)));
  if(state.coins<cost)return toast(`盘缠不够，需要 ${cost} ${world().currency}`);
  const dest=locs()[i]?.name||'新的地方';
  state.coins-=cost;
  state.location=i;
  advance5(days);
  state.chronicle.unshift({year:cal().year,title:'前往'+dest,detail:`走了 ${days} 天，花了 ${cost} ${world().currency}。`});
  state.relationNote=`你到了${dest}。${locs()[i]?.role||''}`;
  save();render(true);
  toast(`已抵达 ${dest}`);
}
