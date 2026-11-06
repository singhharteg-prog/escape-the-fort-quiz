// Builds the two pages from data/questions.mjs:
//   quiz.html        the team's quiz: one self-contained file, no internet needed
//   answer-key.html  the Jathedar's answer key: never send this to the team
//
//   node tools/build.mjs
//
// It refuses to build if a question is malformed (see check()).

import { writeFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { VIDEO, PARTS, QUESTIONS, BONUS } from '../data/questions.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const VIDEO_LENGTH = 690; // seconds, from YouTube's own metadata

// ---------- checks ----------
function check() {
  const errors = [];
  const all = [...QUESTIONS, BONUS];
  all.forEach((q, i) => {
    const where = q === BONUS ? 'bonus' : `Q${i + 1} (t=${q.t})`;
    if (!q.q || !q.why) errors.push(`${where}: needs q and why`);
    if (q !== BONUS && !(Number.isInteger(q.t) && q.t >= 0 && q.t <= VIDEO_LENGTH))
      errors.push(`${where}: t must be a second inside the video`);
    if (q !== BONUS && !PARTS.some((p) => p.id === q.part)) errors.push(`${where}: unknown part ${q.part}`);
    if (q.type === 'choice') {
      if (!(q.answer >= 0 && q.answer < q.options.length)) errors.push(`${where}: answer outside options`);
    } else if (q.type === 'multi') {
      if (!q.answer.length || q.answer.some((a) => !(a >= 0 && a < q.options.length)))
        errors.push(`${where}: multi answers outside options`);
    } else if (q.type === 'number') {
      if (!Number.isInteger(q.answer)) errors.push(`${where}: number answer must be a whole number`);
    } else if (q.type === 'order') {
      if (!(q.items?.length >= 3)) errors.push(`${where}: order needs 3+ items`);
    } else errors.push(`${where}: unknown type ${q.type}`);
    if (q.options && new Set(q.options).size !== q.options.length) errors.push(`${where}: repeated option`);
  });
  if (errors.length) {
    console.error('Not built:\n  ' + errors.join('\n  '));
    process.exit(1);
  }
}

// ---------- helpers ----------
const esc = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const mmss = (t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
const watch = (t) => `${VIDEO.url}?t=${t}`;

// Order items are shown shuffled, the same way on every build (seeded),
// so the printed sheet and the phone page match.
function shuffled(n, seed) {
  const idx = [...Array(n).keys()];
  let s = seed;
  const rnd = () => ((s = (s * 1103515245 + 12345) % 2147483648) / 2147483648);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx; // idx[k] = original position of the item shown k-th
}

// Every question in display order, with display-ready fields.
function prepared() {
  const list = QUESTIONS.map((q, i) => ({ ...q, n: i + 1, key: `q${i + 1}` }));
  list.push({ ...BONUS, n: 'Bonus', key: 'bonus' });
  // Shuffle choices (not True/False) so the right answer's letter can't be
  // guessed from a pattern. Seeded, so it's the same on every build: the
  // first salt that spreads right answers most evenly over A–D wins.
  const shuffles = (q, i, salt) => shuffled(q.options.length, 7919 * (i + 3) + salt);
  const four = list.map((q, i) => [q, i]).filter(([q]) => q.type === 'choice' && q.options.length === 4);
  let salt = 0, best = Infinity;
  for (let k = 0; k < 500; k++) {
    const spread = [0, 0, 0, 0];
    four.forEach(([q, i]) => spread[shuffles(q, i, k).indexOf(q.answer)]++);
    const gap = Math.max(...spread) - Math.min(...spread);
    if (gap < best) { best = gap; salt = k; }
  }
  list.forEach((q, i) => {
    if (q.type === 'choice' && q.options.length > 2) {
      const s = shuffles(q, i, salt);
      q.answer = s.indexOf(q.answer);
      q.options = s.map((orig) => q.options[orig]);
    }
  });
  for (const q of list) {
    if (q.type === 'order') {
      q.shown = shuffled(q.items.length, 1699);
      // the right number to choose for each shown item
      q.answer = q.shown.map((orig) => orig + 1);
    }
  }
  return list;
}

const DIVA = `<svg class="diva" viewBox="0 0 64 64" aria-hidden="true"><path class="flame" d="M32 6c5 8 9 13 9 19a9 9 0 0 1-18 0c0-6 4-11 9-19z"/><path class="bowl" d="M6 38h52c-2 12-12 20-26 20S8 50 6 38z"/><path class="bowl-rim" d="M4 36h56v4H4z"/></svg>`;

// ---------- quiz.html ----------
function questionHTML(q) {
  const id = q.key;
  let body = '';
  if (q.type === 'choice' || q.type === 'multi') {
    const kind = q.type === 'choice' ? 'radio' : 'checkbox';
    body =
      `<div class="opts">` +
      q.options
        .map(
          (o, i) =>
            `<label class="opt"><input type="${kind}" name="${id}" value="${i}"><span>${esc(o)}</span></label>`,
        )
        .join('') +
      `</div>`;
  } else if (q.type === 'number') {
    body = `<label class="num-wrap"><span class="sr">Your answer</span><input type="number" name="${id}" inputmode="numeric" min="0" step="1" autocomplete="off"></label>`;
  } else if (q.type === 'order') {
    const n = q.items.length;
    const choices = ['<option value="">–</option>', ...[...Array(n)].map((_, k) => `<option>${k + 1}</option>`)].join('');
    body =
      `<p class="hint">Give each event a number: 1 for what happens first, ${n} for what happens last.</p><ol class="order">` +
      q.shown
        .map(
          (orig, k) =>
            `<li><label><select name="${id}-${k}" aria-label="Position of: ${esc(q.items[orig])}">${choices}</select><span>${esc(q.items[orig])}</span></label></li>`,
        )
        .join('') +
      `</ol>`;
  }
  const tag = q.type === 'multi' ? `<span class="tag">Tick ${q.answer.length}</span>` : '';
  const src = q.source === 'description' ? `<p class="src">From the video’s YouTube description, not the narration. Doesn’t count towards your score.</p>` : '';
  return `<fieldset class="q" id="${id}" data-type="${q.type}">
<legend><span class="n">${q.n}</span><span class="text">${esc(q.q)} ${tag}</span></legend>
${src}${body}
<div class="fb" hidden></div>
</fieldset>`;
}

function quizHTML(list) {
  const counted = list.filter((q) => q.key !== 'bonus');
  const secret = Buffer.from(
    JSON.stringify(
      list.map((q) => ({
        key: q.key,
        type: q.type,
        answer: q.answer,
        why: q.why,
        t: q.t,
        right:
          q.type === 'choice' ? q.options[q.answer]
          : q.type === 'multi' ? q.answer.map((a) => q.options[a]).join(' · ')
          : q.type === 'number' ? String(q.answer)
          : q.items.join(' → '),
        n: q.shown ? q.shown.length : 0,
      })),
    ),
    'utf8',
  ).toString('base64');

  const sections = PARTS.map((p) => {
    const qs = list.filter((q) => q.part === p.id);
    return `<section class="part"><h2><span class="pid">Part ${p.id}</span> ${esc(p.title)}</h2>${qs.map(questionHTML).join('\n')}</section>`;
  }).join('\n');
  const bonus = `<section class="part bonus-part"><h2><span class="pid">Bonus</span> One more, from the description</h2>${questionHTML(list.find((q) => q.key === 'bonus'))}</section>`;

  const css = readFileSync(join(ROOT, 'src/quiz.css'), 'utf8');
  const js = readFileSync(join(ROOT, 'src/quiz.js'), 'utf8');

  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Escape the Fort · Team Nagni quiz</title>
<style>
${css}
</style>
</head>
<body>
<header class="top">
  ${DIVA}
  <p class="kicker">Team Nagni · Escape the Fort</p>
  <h1>Bandi Chhor Divas quiz</h1>
  <p class="lede">Every answer is in the Basics of Sikhi video <a href="${VIDEO.url}" target="_blank" rel="noopener">“${esc(VIDEO.title)}”</a>. Use your notes. <span class="screen-only">When you’re done, press <b>Check my answers</b> and send your Jathedar a screenshot of your score.</span><span class="print-only">Circle or tick one answer unless it says otherwise, then hand this sheet to your Jathedar.</span></p>
  <noscript><p class="warn">This page can’t mark itself here. Open it in Chrome or Safari, or write your answers on paper.</p></noscript>
  <label class="name"><span>Your name</span><input type="text" id="who" autocomplete="name" maxlength="40"></label>
</header>

<div class="bar" aria-hidden="true"><div class="bar-in"><span id="count">0</span> of ${counted.length} answered<i id="fill"></i></div></div>

<form id="quiz" novalidate>
${sections}
${bonus}
<div class="actions">
  <p id="nudge" class="nudge" role="status" aria-live="polite"></p>
  <button type="submit" id="check">Check my answers</button>
  <button type="button" id="again" class="ghost" hidden>Try again</button>
</div>
</form>

<section id="result" class="result" hidden tabindex="-1" aria-live="polite"></section>

<footer class="foot">
  <p>Questions written from the video only. Each answer links to the moment it’s said.</p>
  <button type="button" id="print" class="ghost small">Print this quiz</button>
</footer>

<script>
const TOTAL = ${counted.length};
const KEY = "${secret}";
${js}
</script>
</body>
</html>
`;
}

// ---------- answer-key.html ----------
function keyHTML(list) {
  const rows = list
    .map((q) => {
      let ans;
      if (q.type === 'choice') ans = esc(q.options[q.answer]);
      else if (q.type === 'multi') ans = q.answer.map((a) => esc(q.options[a])).join('<br>');
      else if (q.type === 'number') ans = String(q.answer);
      else
        ans =
          '<ol>' + q.items.map((it) => `<li>${esc(it)}</li>`).join('') + '</ol>' +
          `<p class="small">The quiz shows the events shuffled. Reading its boxes top to bottom, the right numbers are: ${q.shown
            .map((orig) => orig + 1)
            .join(', ')}</p>`;
      const when = q.t == null ? 'Video description' : q.type === 'order' ? 'Whole video' : `<a href="${watch(q.t)}">${mmss(q.t)}</a>`;
      return `<tr><td class="n">${q.n}</td><td><p class="qq">${esc(q.q)}</p><p class="a">${ans}</p><p class="why">${esc(q.why)}</p></td><td class="when">${when}</td></tr>`;
    })
    .join('\n');
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Answer key · Team Nagni quiz</title>
<style>
:root{--paper:#fbf6ec;--ink:#2a2116;--soft:#6b5c48;--accent:#9a4a06;--line:#e4d8c2}
@media (prefers-color-scheme:dark){:root{--paper:#15131f;--ink:#f3ebdd;--soft:#b9ad9a;--accent:#f2a541;--line:#2e2a3d}}
body{margin:0;background:var(--paper);color:var(--ink);font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif}
main{max-width:860px;margin:0 auto;padding:24px 16px 48px}
h1{font-family:Georgia,serif;margin:0 0 4px}
.warn{border:2px solid var(--accent);border-radius:10px;padding:10px 14px;font-weight:600}
table{border-collapse:collapse;width:100%}
td{vertical-align:top;padding:12px 8px;border-top:1px solid var(--line)}
td.n{font-weight:700;color:var(--accent);width:3.5em}
td.when{white-space:nowrap;width:5em;text-align:right}
a{color:var(--accent)}
.qq{margin:0;color:var(--soft)}
.a{margin:4px 0;font-weight:700}
.a ol{margin:4px 0;padding-left:1.4em}
.why{margin:0;font-size:14px;color:var(--soft)}
.small{font-size:14px;font-weight:400;color:var(--soft);margin:4px 0}
@media print{:root{--paper:#fff;--ink:#000;--soft:#333;--accent:#000;--line:#bbb}tr{break-inside:avoid}a{text-decoration:none}}
</style>
</head>
<body><main>
<h1>Answer key</h1>
<p>Team Nagni · Escape the Fort · from <a href="${VIDEO.url}">“${esc(VIDEO.title)}”</a> (${esc(VIDEO.channel)})</p>
<p class="warn">Jathedar only. Don’t send this file to the team.</p>
<p>${list.length - 1} questions, one point each. The tick-three question scores only when all three are ticked and nothing else; the order question scores only when every event is in the right place. The bonus doesn’t count.</p>
<table>${rows}</table>
</main></body></html>
`;
}

check();
const list = prepared();
writeFileSync(join(ROOT, 'quiz.html'), quizHTML(list));
writeFileSync(join(ROOT, 'answer-key.html'), keyHTML(list));
const spread = [0, 0, 0, 0];
list.filter((q) => q.type === 'choice' && q.options.length === 4).forEach((q) => spread[q.answer]++);
console.log(`Built quiz.html and answer-key.html: ${QUESTIONS.length} questions + bonus.`);
console.log(`Right answer position in 4-option questions (A B C D): ${spread.join(' ')}`);
