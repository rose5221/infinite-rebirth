'use strict';

/* v22 · 世界书触发引擎（移植自 badhope/world-walker 的 rules/lorebook.py，MIT）
   原版是 Python，这里是 JS 移植，语义对齐并做了适应我们游戏的简化。

   为什么需要它：
   我们现在的选段只按"年龄 + 是否看过"抽。
   结果是 13 岁永远遇到同一类事，两局到同一个年龄遇到的事高度雷同。

   这一层解决的是：
   · 按【当前场景文字里的关键词】触发——你在药铺里才会遇到药的事
   · 每条戏有【冷却】——同一类事不会连着来
   · 每条戏有【分组互斥】——同一组里只会出一个（比如"父亲相关"一组只出一个）
   · 每条戏有【概率】——有的事只是偶尔发生
   · 全部由种子决定——同一局可复现

   随机派生用 hash(seed|tick|entryId)，不消耗全局 RNG，所以回放一致。 */

const LORE22 = {
  MAX_RECURSION: 2,
  DEFAULT_SCAN_DEPTH: 2,
  RUNTIME_CAP: 300,
  HISTORY_CAP: 150
};

/* 四种副键逻辑（对齐 SillyTavern） */
const LOGIC = { AND_ANY: 0, NOT_ALL: 1, NOT_ANY: 2, AND_ALL: 3 };

/* 确定性随机：sha1 近似（用 FNV-1a 双轮，够用且不用 crypto） */
function l22Unit(seed, tick, key) {
  const raw = `${seed}|${tick}|${key}`;
  let h1 = 2166136261, h2 = 5381;
  for (let i = 0; i < raw.length; i++) {
    const c = raw.charCodeAt(i);
    h1 ^= c; h1 = Math.imul(h1, 16777619) >>> 0;
    h2 = ((h2 << 5) + h2 + c) >>> 0;
  }
  return ((h1 ^ (h2 >>> 3)) >>> 0) / 4294967296;
}

function l22EntryId(entry, index) {
  if (entry.id != null) return String(entry.id);
  if (entry.comment) return String(entry.comment);
  if (entry.keys && entry.keys.length) return String(entry.keys[0]);
  return 'entry:' + (index || 0);
}

function l22NormLogic(v) {
  if (typeof v === 'number' && LOGIC[v] !== undefined) return v;
  if (typeof v === 'string') {
    const t = v.trim().toUpperCase();
    if (LOGIC[t] !== undefined) return LOGIC[t];
  }
  return LOGIC.AND_ANY;
}

/* 关键词命中 */
function l22Hits(entry, text, low) {
  const caseSens = !!entry.case_sensitive;
  const whole = !!entry.match_whole_words;

  const one = (key) => {
    if (!key) return false;
    const hay = caseSens ? text : low;
    const needle = caseSens ? key : key.toLowerCase();
    if (!whole) return hay.indexOf(needle) >= 0;
    // 整词：只把 ASCII 字母数字当词内字符（中文没有词边界）
    const wordChar = (ch) => /[A-Za-z0-9]/.test(ch);
    let idx = 0;
    while (true) {
      idx = hay.indexOf(needle, idx);
      if (idx < 0) return false;
      const before = idx > 0 ? hay[idx - 1] : ' ';
      const after = idx + needle.length < hay.length ? hay[idx + needle.length] : ' ';
      if (!wordChar(before) && !wordChar(after)) return true;
      idx += needle.length;
    }
  };
  return one;
}

function l22MatchPrimary(entry, text, low) {
  const hit = l22Hits(entry, text, low);
  return (entry.keys || []).some(k => hit(k));
}

function l22MatchSecondary(entry, text, low) {
  const sec = entry.secondary_keys || [];
  if (!sec.length) return true;
  const hit = l22Hits(entry, text, low);
  return sec.some(k => hit(k));
}

/* 副键四种逻辑 */
function l22SelectiveOk(entry, text, low) {
  if (!entry.selective) return l22MatchSecondary(entry, text, low);
  const sec = entry.secondary_keys || [];
  if (!sec.length) return true;
  const hit = l22Hits(entry, text, low);
  let matched = 0;
  for (const k of sec) if (hit(k)) matched++;
  const logic = l22NormLogic(entry.selective_logic != null ? entry.selective_logic : entry.selectiveLogic);
  if (logic === LOGIC.AND_ALL) return matched === sec.length;
  if (logic === LOGIC.NOT_ALL) return matched < sec.length;
  if (logic === LOGIC.NOT_ANY) return matched === 0;
  return matched >= 1;
}

/* 运行时状态 */
function l22Runtime() {
  if (!s9.loreRt) {
    s9.loreRt = {
      lastFired: {}, stickyUntil: {}, cooldownUntil: {},
      firedCount: {}, delayedUntil: {}
    };
  }
  return s9.loreRt;
}

/* 时间闸：delay / sticky / cooldown */
function l22Availability(entry, rt, tick) {
  const eid = entry._eid;
  const delay = Number(entry.delay) || 0;
  if (delay > 0 && tick < delay) return { ok: false, why: 'delay' };

  const stickyUntil = Number(rt.stickyUntil[eid] != null ? rt.stickyUntil[eid] : -1);
  if (stickyUntil >= tick) return { ok: true, why: 'sticky' };

  const cdUntil = Number(rt.cooldownUntil[eid] != null ? rt.cooldownUntil[eid] : -1);
  if (cdUntil > tick) return { ok: false, why: 'cooldown' };

  return { ok: true, why: '' };
}

/* 概率闸：确定性 */
function l22ProbOk(entry, tick) {
  if (entry.use_probability === false) return true;
  let p = entry.probability;
  if (p == null) return true;
  p = Number(p);
  if (!isFinite(p)) return true;
  const ratio = p > 1 ? p / 100 : p;
  if (ratio >= 1) return true;
  if (ratio <= 0) return false;
  return l22Unit(s9.seed || 0, tick, 'lore:' + entry._eid) < ratio;
}

/* 分组互斥 */
function l22SplitGroups(cands) {
  const groups = {}, singles = [];
  for (const e of cands) {
    if (e.group) {
      const g = String(e.group);
      (groups[g] = groups[g] || []).push(e);
    } else singles.push(e);
  }
  return { singles, groups };
}

function l22PickGroup(pool, tick, name) {
  const override = pool.find(e => e.group_override);
  if (override) return override;
  const weights = pool.map(e => Math.max(0.01, Number(e.group_weight) || 100));
  const total = weights.reduce((a, b) => a + b, 0);
  const roll = l22Unit(s9.seed || 0, tick, 'lore_group:' + name) * total;
  let acc = 0;
  for (let i = 0; i < pool.length; i++) {
    acc += weights[i];
    if (roll <= acc) return pool[i];
  }
  return pool[pool.length - 1];
}

function l22MarkFired(entry, tick) {
  const rt = l22Runtime();
  const eid = entry._eid;
  rt.lastFired[eid] = tick;
  rt.firedCount[eid] = (Number(rt.firedCount[eid]) || 0) + 1;

  const sticky = Number(entry.sticky) || 0;
  const cd = Number(entry.cooldown) || 0;
  if (sticky > 0) rt.stickyUntil[eid] = tick + sticky;
  if (cd > 0) rt.cooldownUntil[eid] = tick + Math.max(0, sticky) + cd;

  // 容量控制
  for (const store of ['lastFired', 'stickyUntil', 'cooldownUntil', 'firedCount', 'delayedUntil']) {
    const keys = Object.keys(rt[store]);
    if (keys.length > LORE22.RUNTIME_CAP) {
      for (const k of keys.slice(0, keys.length - LORE22.RUNTIME_CAP)) delete rt[store][k];
    }
  }

  s9.loreHist = s9.loreHist || [];
  s9.loreHist.push({ tick, entry: eid });
  if (s9.loreHist.length > LORE22.HISTORY_CAP) s9.loreHist.splice(0, s9.loreHist.length - LORE22.HISTORY_CAP);
}

function l22Decorate(entries) {
  const out = [];
  (entries || []).forEach((e, i) => {
    if (!e || e.enabled === false) return;
    const item = Object.assign({}, e);
    item._eid = l22EntryId(e, i);
    out.push(item);
  });
  return out;
}

function l22Collect(batch, stickyOnly, tick, depth, reason, chosen, skipped, groupWon) {
  const { singles, groups } = l22SplitGroups(batch);
  const winners = singles.slice();

  for (const name of Object.keys(groups).sort()) {
    if (groupWon[name]) {
      skipped.push({ entry: groups[name][0]._eid, why: 'group' });
      continue;
    }
    const pool = groups[name].filter(e => e.group_override).length
      ? groups[name].filter(e => e.group_override)
      : groups[name];
    const winner = l22PickGroup(pool, tick, name);
    groupWon[name] = winner._eid;
    winners.push(winner);
  }

  for (const entry of winners) {
    const eid = entry._eid;
    if (chosen[eid]) continue;
    if (!stickyOnly.has(eid) && !entry.constant && !l22ProbOk(entry, tick)) {
      skipped.push({ entry: eid, why: 'probability' });
      continue;
    }
    entry._depth = depth;
    entry._reason = stickyOnly.has(eid) ? 'sticky' : reason;
    chosen[eid] = entry;
  }
}

function l22Scan(pool, text, low, depth, reason, rt, tick, chosen, skipped, groupWon) {
  const batch = [];
  const stickyOnly = new Set();

  for (const entry of pool) {
    const eid = entry._eid;
    if (chosen[eid]) continue;
    const av = l22Availability(entry, rt, tick);
    if (!av.ok) {
      if (av.why) skipped.push({ entry: eid, why: av.why });
      continue;
    }
    if (av.why === 'sticky') {
      batch.push(entry);
      stickyOnly.add(eid);
      continue;
    }
    if (entry.constant && depth === 0) {
      batch.push(entry);
    } else if (l22MatchPrimary(entry, text, low) && l22SelectiveOk(entry, text, low)) {
      batch.push(entry);
    }
  }
  l22Collect(batch, stickyOnly, tick, depth, reason, chosen, skipped, groupWon);
}

/* ---------- 主入口 ---------- */
function l22Trigger(entries, scanTexts, tick) {
  tick = (tick == null) ? (s9.year || 0) : tick;
  if (typeof scanTexts === 'string') scanTexts = [scanTexts];
  scanTexts = (scanTexts || []).map(String).filter(t => t.trim());

  const decorated = l22Decorate(entries);
  const depthCap = Math.max(0, Math.min(LORE22.MAX_RECURSION, (s9.loreRecursion || 0)));
  const scanDepth = LORE22.DEFAULT_SCAN_DEPTH;
  const tail = scanDepth > 0 ? scanTexts.slice(-scanDepth) : scanTexts;
  const baseText = tail.join('\n');

  const rt = l22Runtime();
  const chosen = {}, skipped = [], groupWon = {};

  l22Scan(decorated, baseText, baseText.toLowerCase(), 0, 'keyword',
    rt, tick, chosen, skipped, groupWon);

  for (let depth = 1; depth <= depthCap; depth++) {
    const feed = Object.values(chosen)
      .filter(e => Number(e._depth) === depth - 1)
      .map(e => String(e.content || '')).join('\n');
    if (!feed.trim()) break;
    const pool = decorated.filter(e => !e.exclude_recursion);
    l22Scan(pool, feed, feed.toLowerCase(), depth, 'recursion',
      rt, tick, chosen, skipped, groupWon);
  }

  for (const e of Object.values(chosen)) {
    if (e._reason !== 'sticky') l22MarkFired(e, tick);
  }

  const out = Object.values(chosen).sort((a, b) => {
    const ca = a.constant ? 0 : 1, cb = b.constant ? 0 : 1;
    if (ca !== cb) return ca - cb;
    const oa = Number(a.order != null ? a.order : 100), ob = Number(b.order != null ? b.order : 100);
    if (oa !== ob) return oa - ob;
    return a._eid < b._eid ? -1 : 1;
  });

  return { entries: out, skipped: skipped.slice(-40) };
}

/* ---------- 场景条目规范化 ---------- */
/* 把 STORY6 里的一段转成 lorebook 条目 */
function l22SceneToEntry(sc, opts) {
  opts = opts || {};
  const words = l22SceneKeywords(sc);
  return {
    id: sc.id,
    keys: words,
    constant: false,
    probability: opts.probability != null ? opts.probability : 100,
    cooldown: opts.cooldown != null ? opts.cooldown : 6,
    delay: sc.age ? sc.age[0] : 0,
    group: opts.group || null,
    order: sc.age ? sc.age[0] : 100,
    content: (sc.title || '') + ' ' + (sc.opening || '').slice(0, 60),
    scene: sc,
    enabled: true
  };
}

/* 从一段戏里抽关键词（不用分词，用词表命中） */
const L22_WORD_BANK = [
  '药', '病', '伤', '疼', '死', '葬', '棺', '丧',
  '钱', '债', '账', '租', '借', '还', '卖', '买',
  '田', '地', '渠', '水', '旱', '涝', '蝗', '种', '收',
  '婚', '嫁', '娶', '亲', '媒', '聘',
  '官', '税', '役', '告示', '官司', '规矩',
  '灯', '光', '影', '夜', '门',
  '钟', '海', '船', '潮', '盐',
  '记忆', '瓶', '雾', '忘',
  '星', '陨', '种子', '冷房',
  '孩子', '父亲', '母亲', '姐姐', '妹妹', '祖母',
  '师父', '同行', '同事', '邻居', '上司'
];

function l22SceneKeywords(sc) {
  const text = (sc.title || '') + (sc.opening || '') + (sc.ask || '');
  const out = [];
  for (const w of L22_WORD_BANK) if (text.indexOf(w) >= 0) out.push(w);
  return out.length ? out : [(sc.title || '').slice(0, 2)];
}

/* ---------- 给游戏用：这一年该出哪一段 ---------- */
/* 把候选池转成 lorebook 条目，按当前场景文字触发 */
function l22PickScene(candidates, scanTexts, tick) {
  if (!candidates || !candidates.length) return null;
  const entries = candidates.map((sc, i) => l22SceneToEntry(sc, {
    cooldown: 5,
    group: null,
    probability: 100
  }));
  const r = l22Trigger(entries, scanTexts, tick);
  if (!r.entries.length) return null;
  // 取排序后第一个未被看过的
  for (const e of r.entries) {
    if (e.scene && !(s9.seen || []).includes(e.scene.id)) return e.scene;
  }
  return null;
}

/* 调试：这一轮为什么没触发 */
function l22Why(entries, scanTexts, tick) {
  const r = l22Trigger(entries, scanTexts, tick);
  return {
    fired: r.entries.map(e => e._eid),
    skipped: r.skipped
  };
}
