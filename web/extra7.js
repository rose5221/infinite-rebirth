'use strict';

/* v7 · AI 番外
   六部作品是写好的。AI 不参与主线，只在你活到一半或活完之后，
   按你这一生真正发生过的选择，给你写一段只属于你的插曲。
   这样主线有文学的确定性，番外有活人的随机性。 */

const V7AI = { busy: false, err: '', model: 'deepseek-chat' };

function v7AiReady() { return !!(state.apiKey && state.ai !== false); }

function v7AiPrompt() {
  const b = v7Book();
  const cast = b.cast.map(c => `${c.name}（${c.tag}，${c.role}）`).join('；');
  const mem = (state.memories || []).slice(-8).map(m => `${m.age}岁·${m.title}：${m.choice}——${String(m.text).slice(0, 50)}`).join('\n');
  const bonds = Object.keys(state.bonds || {}).map(id => `${v7NameOf(id)}${state.bonds[id] > 0 ? '+' : ''}${state.bonds[id]}`).join('、');
  return `你在为一部中文文学向的人生叙事游戏写一段"番外插曲"。它不是主线，是这个人一生里可能发生、但没有写进书里的一件小事。

【这一部】${b.name}｜${b.subtitle}
【讲的是】${b.through}
【人物】${cast}
【这个人】${state.name || '无名'}，${state.sex}，现在 ${v7Age()} 岁。身子 ${Math.round(state.health)}，名声 ${state.reputation}。
【他做过的事】
${mem || '还没有。'}
【他和人的距离】${bonds || '都还很远'}
【心里的七情】${Object.entries(state.emotions).map(([k, v]) => k + v).join(' ')}

要求：
1. 写一件 80-160 字的小事。必须有具体的物、具体的声音或气味。
2. 必须出现上面【人物】里的至少一个人，用他/她的名字，并符合这个人的声口。
3. 这件事要接着"他做过的事"里的某一件往下长：一个没还的人情、一句没说出口的话、一个还在疼的地方。
4. 不要总结他的一生，不要讲道理，不要写"他明白了""他终于懂得"。
5. 三个选项是三种不同的活法，不是三种说法。至少一个善意但对自己有损，至少一个正确但会伤人。
6. hint 写代价和余味，不写数值。outcome 写 60-110 字，写清谁说了什么、什么变了。
7. 钱只能当背景。禁止"泪水""感到温暖""心中一暖""眸光"。

只输出 JSON：
{"title":"≤10字","opening":"...","ask":"≤18字","days":30,"npc":"cast里的id，没有就空字符串","memory":"≤10字","choices":[{"title":"≤12字","desc":"≤34字","hint":"≤16字","tone":"从 ask rule greed quit protect brave profit learn warm stay distance confess marry wait dodge health defy seek carry honest avoid expand steady niche rebel obey deal brief grind family secret peace save alone heal repeat practical trade 里选，三个互不相同","outcome":"...","effects":{"bond":0,"health":0,"reputation":0,"stats":{},"emotion":{},"flag":"","thread":""}}]}`;
}

async function v7AiGenerate() {
  if (V7AI.busy) return null;
  if (!v7AiReady()) { v7Toast('先在设置里填 DeepSeek 密钥'); return null; }
  V7AI.busy = true; V7AI.err = '';
  const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
  const timer = ctrl ? setTimeout(() => ctrl.abort(), 26000) : null;
  try {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + state.apiKey },
      signal: ctrl ? ctrl.signal : undefined,
      body: JSON.stringify({
        model: V7AI.model,
        messages: [
          { role: 'system', content: '你是中文文学作者。白话，克制，具体。只输出 JSON。' },
          { role: 'user', content: v7AiPrompt() }
        ],
        temperature: 1.15,
        max_tokens: 900,
        response_format: { type: 'json_object' }
      })
    });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const d = await res.json();
    const txt = (d.choices && d.choices[0] && d.choices[0].message && d.choices[0].message.content) || '';
    const obj = JSON.parse(txt.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim());
    const sc = v7AiToScene(obj);
    V7AI.busy = false;
    return sc;
  } catch (e) {
    V7AI.err = (e && e.message) || 'failed';
    V7AI.busy = false;
    return null;
  } finally {
    if (timer) clearTimeout(timer);
  }
}

const V7_EMO = ['喜', '怒', '哀', '惧', '爱', '恶', '欲'];
const V7_STAT = ['智识', '体魄', '魅力', '机缘'];

function v7AiToScene(o) {
  if (!o || typeof o !== 'object') throw new Error('empty');
  const opening = String(o.opening || '').trim();
  if (opening.length < 30) throw new Error('short');
  if (/泪水|感到温暖|心中一暖|眸光/.test(opening)) throw new Error('cliche');
  const raw = Array.isArray(o.choices) ? o.choices : [];
  if (raw.length !== 3) throw new Error('choices');
  const tones = new Set();
  const choices = raw.map((c, i) => {
    const t = String(c.title || '').trim().slice(0, 16);
    const d = String(c.desc || '').trim().slice(0, 40);
    const oc = String(c.outcome || '').trim().slice(0, 140);
    if (!t || !d || !oc) throw new Error('choice text');
    let tone = String(c.tone || '').trim();
    if (!tone || tones.has(tone)) tone = ['ask', 'brave', 'wait'][i];
    tones.add(tone);
    const e = c.effects || {};
    const eff = {
      bond: Math.max(-20, Math.min(20, Math.round(Number(e.bond) || 0))),
      health: Math.max(-30, Math.min(30, Math.round(Number(e.health) || 0))),
      reputation: Math.max(-20, Math.min(20, Math.round(Number(e.reputation) || 0))),
      coins: 0,
      stats: {}, emotion: {},
      flag: '', thread: String(e.thread || '').slice(0, 24)
    };
    for (const k of Object.keys(e.stats || {})) if (V7_STAT.includes(k)) eff.stats[k] = Math.max(-2, Math.min(2, Math.round(Number(e.stats[k]) || 0)));
    for (const k of Object.keys(e.emotion || {})) if (V7_EMO.includes(k)) eff.emotion[k] = Math.max(-8, Math.min(8, Math.round(Number(e.emotion[k]) || 0)));
    return { title: t, desc: d, hint: String(c.hint || '').slice(0, 20), tone, outcome: oc, eff };
  });
  const castIds = (v7Book().cast || []).map(c => c.id);
  const npc = castIds.includes(o.npc) ? o.npc : '';
  return {
    id: 'ai_' + Date.now(),
    act: 'side',
    ai: true,
    age: [v7Age(), v7Age()],
    mode: npc ? 'dialogue' : 'narration',
    title: String(o.title || '插曲').slice(0, 14),
    opening,
    ask: String(o.ask || '你怎么做？').slice(0, 26),
    days: Math.max(10, Math.min(200, Math.round(Number(o.days) || 30))),
    npc,
    memory: String(o.memory || o.title || '插曲').slice(0, 14),
    choices
  };
}

async function v7PlayExtra() {
  if (!v7AiReady()) { v7Toast('先在设置里填 DeepSeek 密钥'); return; }
  v7Toast('正在写你的插曲…');
  const sc = await v7AiGenerate();
  if (!sc) { v7Toast('没写出来（' + (V7AI.err || '网络') + '），主线不受影响'); return; }
  state.scene7 = sc;
  state.result7 = null;
  v7Page = 'scene';
  v7Save(); v7Render();
  v7Toast('这段是为你写的');
}
