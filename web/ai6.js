'use strict';

/* v6.2 — AI-directed scenes.
   When a DeepSeek key exists, the next scene, its three options and its three
   English words are written by the model from the live world state. Offline the
   local director takes over with the same shape, so nothing breaks without a key. */

const AI6 = { model: 'deepseek-chat', timeout: 20000, lastError: '', lastAt: 0, calls: 0 };

function aiReady() {
  return !!(state.ai !== false && state.apiKey);
}

function aiSystem6() {
  return [
    '你是一个中文人生模拟游戏的叙事导演。玩家从 0 岁出生，一段一段地活到老死。',
    '文风：白话、克制、具体。写人、写物、写钱数、写动作，不写网文腔，不用“命运的齿轮”“心中一凛”这类套话，不总结人生，不讲道理。',
    '每一段只是几个月到一年里发生的一件具体的事。人物、地名、行当、物件必须来自给定的世界设定，不能凭空发明世界观。',
    '年龄必须对：不到 7 岁只能写孩子能看见、能参与的事，不能让孩子做成年人的决定；13 岁以下不能写婚嫁、经商、饮酒。',
    '严禁重复【最近写过】里的事件类型、开头句式和高频词。',
    '三个选项必须是三种真正不同的做法：各有具体动作、具体代价、不同走向。禁止“顺从／反抗／询问”这种万能三件套，禁止三个选项意思相近，禁止写成心理活动而不是动作。',
    '选项要贴着本段事件里的具体人、具体物、具体数字写。',
    '只输出 JSON，不要解释，不要 markdown。'
  ].join('\n');
}

function aiState6() {
  const L = worldLex();
  const w = world();
  const rel = state.relationships || [];
  const fam = rel.filter(r => r.family).map(r => `${r.name}（你的${({父:'父亲',母:'母亲',手足:'手足'})[r.family] || r.family}，${r.role}，亲近${r.affinity}）`).join('；') || '无';
  const oth = rel.filter(r => !r.family).slice(0, 5).map(r => `${r.name}（${r.role}，${relationStage5(r)}，亲近${r.affinity}）`).join('；') || '还没有';
  const mem = (state.memories || []).slice(0, 5).map(m => `${m.age}岁·${m.title}：${String(m.text || '').slice(0, 46)}`).join('\n') || '无';
  const threads = (state.threads || []).slice(-4).map(t => t.text).join('\n') || '无';
  const recent = (state.recentScenes || []).slice(-6).join('、') || '无';
  const beat = state.lastBeat ? `你刚选了「${state.lastBeat.choice}」，结果是：${state.lastBeat.outcome}` : '这是这一世的第一段。';
  const emo = Object.entries(state.emotions || {}).map(([k, v]) => `${k}${v}`).join(' ');
  return [
    `【世界】${w.name}｜${w.category || ''}｜${w.theme || w.civilization || ''}`,
    `货币：${w.currency}｜时代与技术：${String(w.tech || '').slice(0, 60)}`,
    `日常：${String(w.dailyLife || '').slice(0, 80)}`,
    `信仰与规矩：${String(w.beliefs || w.order || '').slice(0, 70)}`,
    `风险：${String(w.risks || '').slice(0, 60)}`,
    `势力：${(w.factions || []).join('、').slice(0, 70)}`,
    `可去之处：${L.places.slice(0, 5).join('、')}`,
    `【我】${state.name}，${state.sex}，${age()}岁（${stage5().label}）。性格：${state.personality || '平常'}。外貌：${state.appearance || '未写'}。身份：${state.identity || '平民'}。营生：${occupationTitle()}${state.shopName ? '，另有一间' + state.shopName : ''}。`,
    `钱：${state.coins} ${w.currency}｜健康：${state.health}｜声望：${state.reputation}｜寿限：${state.lifeLimit}岁｜已婚：${state.spouse || '否'}｜孩子：${state.children || 0}`,
    `【家人】${fam}`,
    `【熟人】${oth}`,
    `【情绪】${emo}`,
    `【刚刚发生】${beat}`,
    `【最近写过·不要重复】${recent}`,
    `【没结的事】${threads}`,
    `【旧事】\n${mem}`
  ].join('\n');
}

function aiPrompt6() {
  return `${aiState6()}

请写“现在”这一段（第 ${cal().year} 年，${L_season6()}）。

硬性要求：
1. opening 60-150 字。必须出现一个具体的人、一个具体的物件（或数字），以及一个此刻必须做决定的问题。不要总结前半生。
2. ask 12-24 字，是此刻摆在面前的问题。
3. choices 恰好 3 个，彼此必须有实质差别（做的事不同、代价不同、后果不同）。
   - title ≤ 12 字，动词开头，写具体动作，不要写“顺从”“反抗”“询问”“静观其变”这种空话。
   - desc ≤ 36 字，写清具体怎么做、对谁做。
   - hint ≤ 16 字，写代价或收益（例如“得罪东家·钱+”“伤身·名声好”）。
   - outcome ≤ 70 字，写这个选择之后实际发生了什么，落到具体后果上。
   - effects：coins（-800..800 的整数）、health（-30..30）、reputation（-20..20）、bond（-15..15）、stats（智识/体魄/魅力/机缘 各 -2..2）、emotion（喜/怒/哀/惧/爱/恶/欲 各 -8..8）、flag（英文小写下划线，可空）、thread（≤40 字，留下的后患或念想，可空）。
   - tone 必须三个互不相同，从这些里选：ask rule greed quit protect brave profit learn warm stay distance confess marry wait dodge health defy seek carry honest avoid expand steady niche rebel obey deal brief grind family secret peace save alone heal repeat practical trade。
4. words：3 个与这段情节直接相关的英语词（考研/雅思难度，不要小学词），每个给 word、zh、ex（英文例句，必须复述这段情节里的一件事，8-20 词）。
5. 这一段代表“大约一年里最要紧的一件事”。不要写成一天之内的琐事，也不要写成十年总结。
6. npc：如果这段有具体对手/亲人/陌生人，写其名字；必须是【家人】【熟人】里已有的名字，或一个符合本世界命名习惯的新名字。没有就写空字符串。
7. arc：从 child family work relation marriage business crisis aging parent teen opening life 里选一个。

只输出这个 JSON：
{"title":"≤12字","opening":"...","ask":"...","arc":"family","npc":"","choices":[{"title":"...","desc":"...","hint":"...","outcome":"...","tone":"ask","effects":{"coins":0,"health":0,"reputation":0,"bond":0,"stats":{"智识":0},"emotion":{"喜":0},"flag":"","thread":""}}],"words":[{"word":"","zh":"","ex":""}]}`;
}

function L_season6() {
  try { return worldLex().season; } catch (e) { return '初春'; }
}

async function aiJSON6(prompt, maxTokens) {
  if (!aiReady()) throw new Error('no key');
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), AI6.timeout) : null;
  try {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${state.apiKey}` },
      signal: ctrl ? ctrl.signal : undefined,
      body: JSON.stringify({
        model: AI6.model,
        messages: [{ role: 'system', content: aiSystem6() }, { role: 'user', content: prompt }],
        temperature: 1.05,
        max_tokens: maxTokens || 1100,
        response_format: { type: 'json_object' }
      })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const txt = (data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || '';
    const clean = txt.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
    const obj = JSON.parse(clean);
    AI6.calls++;
    return obj;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/* ---------- validation: never let a bad generation break the game ---------- */
function aiNum6(v, min, max) {
  const n = Number(v);
  if (!isFinite(n)) return 0;
  return Math.max(min, Math.min(max, Math.round(n)));
}
function aiStr6(v, max) {
  return String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, max);
}
function aiStats6(o) {
  const out = {};
  if (!o || typeof o !== 'object') return out;
  for (const k of ['智识', '体魄', '魅力', '机缘']) {
    const v = aiNum6(o[k], -2, 2);
    if (v) out[k] = v;
  }
  return out;
}
function aiEmo6(o) {
  const out = {};
  if (!o || typeof o !== 'object') return out;
  for (const k of ['喜', '怒', '哀', '惧', '爱', '恶', '欲']) {
    const v = aiNum6(o[k], -8, 8);
    if (v) out[k] = v;
  }
  return out;
}

const AI_TONES = ['ask','rule','greed','quit','protect','brave','profit','learn','warm','stay','distance','confess','marry','wait','dodge','health','defy','seek','carry','honest','avoid','expand','steady','niche','rebel','obey','deal','brief','grind','family','secret','peace','save','alone','heal','repeat','practical','trade','bargain','help','keep','repair','sell','collect','teach','witness','escort','report','hide','pray','gamble'];

const AI_ADULT_WORDS = /债|账|铺子|生意|官|衙门|婚|嫁|娶|聘礼|酒|赌|税|租|合伙|本钱|聘|纳妾/;
function aiAgeGate6(text) {
  const a = age();
  if (a < 6) return !AI_ADULT_WORDS.test(text);
  if (a < 13) return !/婚|嫁|娶|聘礼|纳妾|赌|酒|合伙|本钱/.test(text);
  if (a < 16) return !/婚|嫁|娶|聘礼|纳妾/.test(text);
  return true;
}

function aiSceneTo6(data) {
  if (!data || typeof data !== 'object') throw new Error('empty');
  let opening = aiStr6(data.opening, 240);
  const choiceBlob = (Array.isArray(data.choices) ? data.choices : []).map(c => (c && (c.title + ' ' + c.desc)) || '').join(' ');
  if (!aiAgeGate6(opening + ' ' + choiceBlob)) throw new Error('age gate');
  const title = aiStr6(data.title, 14) || titleOf(opening, '一个片段');
  if (opening.length < 24) throw new Error('short opening');
  const rawChoices = Array.isArray(data.choices) ? data.choices.slice(0, 3) : [];
  if (rawChoices.length !== 3) throw new Error('choices');

  const seenTone = new Set();
  const choices = [];
  for (let i = 0; i < 3; i++) {
    const c = rawChoices[i] || {};
    const t = aiStr6(c.title, 14);
    const d = aiStr6(c.desc, 40);
    if (!t || !d) throw new Error('choice text');
    let tone = aiStr6(c.tone, 16).toLowerCase();
    if (!AI_TONES.includes(tone) || seenTone.has(tone)) {
      tone = ['ask', 'rule', 'brave', 'learn', 'replace', 'help'].find(x => !seenTone.has(x) && AI_TONES.includes(x)) || 'ask';
    }
    seenTone.add(tone);
    const eff = c.effects && typeof c.effects === 'object' ? c.effects : {};
    const payload = {
      coins: aiNum6(eff.coins, -800, 800),
      health: aiNum6(eff.health, -30, 30),
      reputation: aiNum6(eff.reputation, -20, 20),
      bond: aiNum6(eff.bond, -15, 15),
      importance: aiNum6(eff.importance, 0, 8),
      stats: aiStats6(eff.stats),
      emotion: aiEmo6(eff.emotion),
      tone
    };
    const flag = aiStr6(eff.flag, 32).toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (flag) payload.flag = flag;
    const thread = aiStr6(eff.thread, 40);
    if (thread) payload.thread = thread;
    if (!payload.coins) delete payload.coins;
    if (!payload.health) delete payload.health;
    if (!payload.reputation) delete payload.reputation;
    if (!payload.bond) delete payload.bond;
    if (!payload.importance) delete payload.importance;
    if (!Object.keys(payload.stats).length) delete payload.stats;
    if (!Object.keys(payload.emotion).length) delete payload.emotion;
    choices.push({
      title: t,
      desc: d,
      hint: aiStr6(c.hint, 18),
      outcome: aiStr6(c.outcome, 80),
      tone,
      payload
    });
  }

  const words = [];
  const rawWords = Array.isArray(data.words) ? data.words : [];
  for (const w of rawWords) {
    const word = aiStr6(w && w.word, 24);
    const zh = aiStr6(w && w.zh, 18);
    const ex = aiStr6(w && w.ex, 140);
    if (!/^[A-Za-z][A-Za-z' -]{1,23}$/.test(word)) continue;
    if (!zh || /^[A-Za-z0-9 ]+$/.test(zh)) continue;
    if (words.some(x => x.word.toLowerCase() === word.toLowerCase())) continue;
    const id = 'ai_' + hashText(word.toLowerCase());
    words.push({ id, word, zh, ex, ai: true });
    if (!state.aiWords) state.aiWords = {};
    state.aiWords[id] = { id, word, zh, ex, ai: true };
    if (words.length >= 3) break;
  }

  const L = worldLex();
  const npcName = aiStr6(data.npc, 12);
  let npcId = null;
  if (npcName) {
    const hit = (state.relationships || []).find(r => r.name === npcName);
    if (hit) npcId = hit.id;
  }
  const arc = ['child','family','work','relation','marriage','business','crisis','aging','parent','teen','opening','life'].includes(data.arc) ? data.arc : 'life';
  const baseDays = stageMinDays();
  const days = baseDays + Math.floor(Math.random() * baseDays * 0.5);

  const sc = {
    id: 'ai_' + Date.now() + '_' + Math.floor(Math.random() * 9999),
    mode: age() < 4 ? 'montage' : (npcName ? 'dialogue' : 'narration'),
    arc,
    stage: stageKey(),
    title: uniqueTitle(title),
    opening,
    ask: aiStr6(data.ask, 26) || '你怎么做？',
    choices,
    npcId,
    npcName: npcName && npcId ? npcName : '',
    npcRole: npcId ? ((state.relationships.find(r => r.id === npcId) || {}).role || '') : '',
    location: L.place,
    days: Math.max(days, stageMinDays()),
    effects: {},
    flags: [],
    weight: 4,
    english: words.length ? words : [],
    recall: recallFor(arc),
    ai: true,
    keepChoices: true
  };
  if (!sc.english.length) sc.english = pickWords3(sc);
  return sc;
}

async function aiScene6(fallback) {
  try {
    const data = await aiJSON6(aiPrompt6(), 1100);
    const sc = aiSceneTo6(data);
    AI6.lastError = '';
    AI6.lastAt = Date.now();
    return sc;
  } catch (e) {
    AI6.lastError = (e && e.message) || 'ai failed';
    AI6.lastAt = Date.now();
    return typeof fallback === 'function' ? fallback() : null;
  }
}

/* small self-check used by the settings panel */
async function aiTest6() {
  if (!state.apiKey) return toast('先填 DeepSeek 密钥');
  toast('正在测试…');
  try {
    const data = await aiJSON6('只输出 {"ok":true,"cn":"收到"}', 60);
    toast(data && data.ok ? 'DeepSeek 连接正常，AI 剧情可用' : '接口有回应，但格式不对');
  } catch (e) {
    toast('连接失败：' + ((e && e.message) || '未知错误'));
  }
}
