'use strict';

/* v9 · AI 随机层
   三件事：
   1. 日常年不再走模板，由 AI 现写这一年的小事（有缓存，不会卡）
   2. 剧情年也会有 AI 写的"插曲"混进来，这一局不重样
   3. 每年给一个"这一年的念想"，一句话，进结局 */

const A9 = {
  ready: false,
  lastErr: '',
  cache: {},
  model: 'deepseek-chat',
  busy: false
};

function a9On() { return !!(s9.apiKey && s9.ai !== false); }

/* ---------- 请求 ---------- */
async function a9JSON(sys, user, maxTokens) {
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), 22000) : null;
  try {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + s9.apiKey },
      signal: ctrl ? ctrl.signal : undefined,
      body: JSON.stringify({
        model: A9.model,
        messages: [{ role: 'system', content: sys }, { role: 'user', content: user }],
        temperature: 1.25,
        max_tokens: maxTokens || 700,
        response_format: { type: 'json_object' }
      })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const d = await res.json();
    const txt = (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || '';
    return JSON.parse(txt.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim());
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/* ---------- 日常年：AI 写这一段 ---------- */
function a9DailyPrompt() {
  const b = STORY6[s9.book];
  const L = c9Lex();
  const alive = c9Alive().map(p => `${p.name}（${p.tag}，${p.age}岁）`).join('；');
  const gone = s9.family.filter(p => p.id !== 'self' && (!p.alive || p.away)).map(p => `${p.name}（${p.note || '走了'}）`).join('；');
  const used = new Set(s9.years || []);
  const recent = (s9.yearlyLog || []).slice(-5).map(x => `${x.age}岁：${x.text}`).join('\n') || '无';

  return `你在写一部中文文学向人生叙事游戏的"这一年"。

【这一部】${b.name}｜${b.subtitle}
【讲的是】${b.through}
【主角】${s9.name}，${s9.age}岁。身${Math.round(s9.body)}，心${Math.round(s9.heart)}，手${s9.hand.toFixed(1)}。家里${L.grain}${s9.grain.toFixed(1)}，${L.unit}${Math.round(s9.coin)}，田${s9.field}亩。
【家里人】${alive || '只剩自己'}
【已经不在的人】${gone || '无'}
【最近几年】
${recent}

要求：
1. 写这一段"这一年"，70-130 字。必须是这一年里**一件具体的小事**，不是总结。
2. 要有感官：气味、声音、手上的触感、天气。至少两处。
3. 必须出现【家里人】里至少一个真名，符合这个人的身份和语气。
4. 不要写钱、账、本钱、买卖。这一段的赌注是**人**，不是钱。
5. 不要重复【最近几年】里出现过的场景类型。
6. 禁止"泪水""感到温暖""心中一暖""他终于明白""命运"。
7. 结尾要留一点没说出口的东西。

只输出 JSON：
{"text":"这一段","hint":"≤12字，这一年的余味","mark":"≤14字，这一年在主角心里留下的一句话，将来会进结局账本"}`;
}

async function a9Daily() {
  const key = 'd' + s9.book + s9.age + Math.round(s9.body) + Math.round(s9.heart);
  if (A9.cache[key]) return A9.cache[key];
  const data = await a9JSON(
    '你是中文文学作者。白话，克制，具体。只输出 JSON。',
    a9DailyPrompt(), 500
  );
  const text = String(data.text || '').trim();
  if (text.length < 40) throw new Error('short');
  if (/泪水|感到温暖|心中一暖|命运|他终于明白/.test(text)) throw new Error('cliche');
  const out = {
    text,
    hint: String(data.hint || '').slice(0, 16),
    mark: String(data.mark || '').slice(0, 20)
  };
  A9.cache[key] = out;
  return out;
}

/* ---------- 插曲：AI 写一段完全新的戏 ---------- */
function a9ScenePrompt() {
  const b = STORY6[s9.book];
  const L = c9Lex();
  const cast = (b.cast || []).map(c => `${c.name}（${c.tag}，${c.role}）`).join('；');
  const recent = (s9.seenTitles || []).slice(-8).join('、') || '无';
  return `你在写这部人生叙事游戏里的一段"插曲"。它不是主线，是这个人在${s9.age}岁那年可能发生、但书里没写的一件事。

【这一部】${b.name}｜${b.subtitle}
【讲的是】${b.through}
【人物】${cast}
【主角】${s9.name}，${s9.age}岁。身${Math.round(s9.body)}，心${Math.round(s9.heart)}，手${s9.hand.toFixed(1)}。
【最近写过·不要重复】${recent}

要求：
1. 60-130 字。一件具体的事，有具体的物、声音或气味。
2. 必须出现一个人名（上面的人物，或一个符合这个世界命名习惯的新名字）。
3. 三个选项是三种真正不同的活法，不是三种说法。至少一个善意但自损，至少一个正确但伤人。
4. hint 写代价和余味，不写数值。outcome 写 50-100 字，写清谁说了什么、什么变了。
5. 钱只能当背景。禁止"泪水""感到温暖""心中一暖""眸光"。

只输出 JSON：
{"title":"≤10字","text":"这一段","ask":"≤18字","npc":"人物id或空","choices":[{"title":"≤12字","desc":"≤32字","hint":"≤16字","outcome":"50-100字","eff":{"health":0,"coins":0,"stats":{},"emotion":{},"thread":""}}]}`;
}

async function a9Scene() {
  const data = await a9JSON('你是中文文学作者。白话，克制，具体。只输出 JSON。', a9ScenePrompt(), 900);
  const text = String(data.text || '').trim();
  const raw = Array.isArray(data.choices) ? data.choices : [];
  if (text.length < 35 || raw.length !== 3) throw new Error('bad');
  if (/泪水|感到温暖|心中一暖|眸光/.test(text)) throw new Error('cliche');
  const castIds = (STORY6[s9.book].cast || []).map(c => c.id);
  return {
    id: 'ai_' + Date.now(),
    ai: true,
    title: String(data.title || '插曲').slice(0, 14),
    opening: text,
    ask: String(data.ask || '').slice(0, 26),
    npc: castIds.includes(data.npc) ? data.npc : '',
    age: [s9.age, s9.age],
    choices: raw.map((c, i) => {
      const e = c.eff || {};
      return {
        title: String(c.title || '').slice(0, 16),
        desc: String(c.desc || '').slice(0, 36),
        hint: String(c.hint || '').slice(0, 20),
        outcome: String(c.outcome || '').slice(0, 140),
        eff: {
          health: Math.max(-30, Math.min(30, Math.round(Number(e.health) || 0))),
          coins: Math.max(-400, Math.min(400, Math.round(Number(e.coins) || 0))),
          stats: e.stats && typeof e.stats === 'object' ? e.stats : {},
          emotion: e.emotion && typeof e.emotion === 'object' ? e.emotion : {},
          thread: String(e.thread || '').slice(0, 24)
        }
      };
    })
  };
}

/* ---------- 死后：一封信 ---------- */
function a9LetterPrompt() {
  const b = STORY6[s9.book];
  const alive = c9Alive().filter(p => p.id !== 'self');
  const who = alive.length ? alive[0].name : '一个晚辈';
  const marks = (s9.marks || []).slice(-6).join('\n') || '无';
  return `写一封中文短信：${who}在${s9.name}死后半年，写给${s9.name}的信。
不要称呼"您"，用平时怎么叫就怎么叫。80-140字。
要提到一件具体的小事（下面这些是他生前留下的）：${marks}
不要煽情，不要总结他的一生，不要用"永远""怀念"。写一件还没做完的事，或者一句当时没说的话。
只输出 JSON：{"letter":"信的内容","from":"${who}"}`;
}

async function a9Letter() {
  const data = await a9JSON('你是中文文学作者。白话，克制。只输出 JSON。', a9LetterPrompt(), 500);
  return { letter: String(data.letter || '').trim(), from: String(data.from || '').slice(0, 12) };
}

/* ---------- 设置持久化 ---------- */
const A9KEY = 'ai9_cfg';
function a9SaveCfg() { try { localStorage.setItem(A9KEY, JSON.stringify({ apiKey: s9.apiKey || '', ai: s9.ai !== false })); } catch (e) {} }
function a9LoadCfg() {
  try {
    const r = localStorage.getItem(A9KEY);
    if (r) { const d = JSON.parse(r); s9.apiKey = d.apiKey || ''; s9.ai = d.ai !== false; }
  } catch (e) {}
}
