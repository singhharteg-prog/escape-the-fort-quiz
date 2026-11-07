// Builds the two pages from data/questions.mjs:
//   quiz.html        the team's quiz: one self-contained file, no script, no internet needed
//   answer-key.html  the Jathedar's answer key: never send this to the team
//   docs/index.html  the same quiz, for the GitHub Pages link
//
//   node tools/build.mjs
//
// It refuses to build if a question is malformed (see check()).

import { writeFileSync, readFileSync, mkdirSync } from 'node:fs';
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
// No JavaScript: an iPhone opening the file from WhatsApp, Mail or Files
// shows it in a preview that never runs scripts (tested 6 Nov 2026). So the
// page marks itself with CSS alone: right options carry `data-c`, ticking
// "Check my answers" reveals each question's feedback, and CSS counters add
// up the score. See MARKING below for the selectors.

// One selector per question type that matches a question answered right.
const RIGHT = [
  '.q[data-type=choice]:has(input[data-c]:checked)',
  '.q[data-type=multi]:not(:has(input[data-c]:not(:checked))):not(:has(input:not([data-c]):checked))',
  '.q[data-type=number]:has(input:valid)',
  '.q[data-type=order]:not(:has(input[data-c]:not(:checked)))',
];
const ON = '.quiz:has(#check:checked)';

function marking() {
  // :has() can't sit inside another :has(), so each rule is written out
  // once per selector above instead of using one combined list.
  const each = (fn) => RIGHT.map(fn).join('\n');
  return `/* ---- marking (generated by tools/build.mjs) ---- */
${each((r) => `${r}[data-count="1"] { counter-increment: score; }`)}
${ON} .q { border-color: var(--wrong); }
${ON} .fb { display: block; }
${ON} .q .v-right { display: none; }
${each((r) => `${ON} ${r} { border-color: var(--right); }`)}
${each((r) => `${ON} ${r} .fb { background: var(--right-bg); }`)}
${each((r) => `${ON} ${r} .v-right { display: block; }`)}
${each((r) => `${ON} ${r} :is(.v-wrong, .ans) { display: none; }`)}
`;
}

function feedback(q) {
  let right;
  if (q.type === 'choice') right = `Answer: <b>${esc(q.options[q.answer])}</b>`;
  else if (q.type === 'multi') right = `Answer: <b>${q.answer.map((a) => esc(q.options[a])).join(' · ')}</b>`;
  else if (q.type === 'number') right = `Answer: <b>${q.answer}</b>`;
  else right = `The right order is:<br>${q.items.map((it, k) => `${k + 1}. ${esc(it)}`).join('<br>')}`;
  const placed = q.type === 'order' ? `<p class="placed"> in the right place.</p>` : '';
  const link = q.t == null || q.type === 'order' ? '' : ` <a href="${watch(q.t)}" target="_blank" rel="noopener">Watch at ${mmss(q.t)}</a>`;
  return `<div class="fb">
<p class="verdict v-right">✓ Right</p><p class="verdict v-wrong">✗ Not quite</p>
${placed}<p class="ans">${right}</p>
<p>${esc(q.why)}${link}</p>
</div>`;
}

function questionHTML(q) {
  const id = q.key;
  let body = '';
  if (q.type === 'choice' || q.type === 'multi') {
    const kind = q.type === 'choice' ? 'radio' : 'checkbox';
    const right = Array.isArray(q.answer) ? q.answer : [q.answer];
    body =
      `<div class="opts">` +
      q.options
        .map(
          (o, i) =>
            `<label class="opt"><input type="${kind}" name="${id}" value="${i}"${right.includes(i) ? ' data-c' : ''}><span>${esc(o)}</span></label>`,
        )
        .join('') +
      `</div>`;
  } else if (q.type === 'number') {
    body = `<label class="num-wrap"><span class="sr">Your answer</span><input type="text" name="${id}" inputmode="numeric" pattern="\\s*${q.answer}\\s*" required placeholder="Type a number" autocomplete="off"></label>`;
  } else if (q.type === 'order') {
    const n = q.items.length;
    body =
      `<p class="hint"><span class="screen-only">Tap a number for each event</span><span class="print-only">Circle a number for each event</span>: 1 for what happens first, ${n} for what happens last.</p><ol class="order">` +
      q.shown
        .map(
          (orig, k) =>
            `<li class="row"><span class="ev">${esc(q.items[orig])}</span><span class="nums" role="radiogroup" aria-label="Position of: ${esc(q.items[orig])}">` +
            [...Array(n)]
              .map(
                (_, j) =>
                  `<label class="pos"><input type="radio" name="${id}-${k}" value="${j + 1}"${q.answer[k] === j + 1 ? ' data-c' : ''}><span>${j + 1}</span></label>`,
              )
              .join('') +
            `</span></li>`,
        )
        .join('') +
      `</ol>`;
  }
  const tag = q.type === 'multi' ? `<span class="tag">Tick ${q.answer.length}</span>` : '';
  const src = q.source === 'description' ? `<p class="src">From the video’s YouTube description, not the narration. Doesn’t count towards your score.</p>` : '';
  return `<fieldset class="q" id="${id}" data-type="${q.type}" data-count="${q.key === 'bonus' ? 0 : 1}">
<legend><span class="n">${q.n}</span><span class="text">${esc(q.q)} ${tag}</span></legend>
${src}${body}
${feedback(q)}
</fieldset>`;
}

function quizHTML(list) {
  const counted = list.filter((q) => q.key !== 'bonus');
  const sections = PARTS.map((p) => {
    const qs = list.filter((q) => q.part === p.id);
    return `<section class="part"><h2><span class="pid">Part ${p.id}</span> ${esc(p.title)}</h2>${qs.map(questionHTML).join('\n')}</section>`;
  }).join('\n');
  const bonus = `<section class="part bonus-part"><h2><span class="pid">Bonus</span> One more, from the description</h2>${questionHTML(list.find((q) => q.key === 'bonus'))}</section>`;

  const css = readFileSync(join(ROOT, 'src/quiz.css'), 'utf8');

  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Escape the Fort · Team Nagni quiz</title>
<style>
${css}
${marking()}
</style>
</head>
<body>
<form class="quiz" action="#" onsubmit="return false">
<header class="top">
  ${DIVA}
  <p class="kicker">Team Nagni · Escape the Fort</p>
  <h1>Bandi Chhor Divas quiz</h1>
  <p class="lede">Every answer is in the Basics of Sikhi video <a href="${VIDEO.url}" target="_blank" rel="noopener">“${esc(VIDEO.title)}”</a>. Use your notes. <span class="screen-only">When you’ve answered everything, put your name at the bottom, tick <b>Check my answers</b>, and send your Jathedar a screenshot of your score.</span><span class="print-only">Circle or tick one answer unless it says otherwise, then hand this sheet to your Jathedar.</span></p>
  <p class="print-only print-name">Name: ______________________________</p>
</header>

${sections}
${bonus}

<section class="finish">
  <h2>Finished?</h2>
  <p class="answered">You’ve answered <b class="answered-num"></b> of ${counted.length}.</p>
  <label class="name"><span>Your name</span><input type="text" autocomplete="name" maxlength="40"></label>
  <label class="check-btn"><input type="checkbox" id="check"><span class="off">Check my answers</span><span class="on">Marked ✓ (tap to hide the marks)</span></label>
  <div class="score-card">
    <p class="score"><span class="score-num"></span><small> / ${counted.length}</small></p>
    <p class="meta">Scroll up to see what you got wrong. Each one says why and links to that moment in the video.</p>
    <p class="meta"><b>Screenshot this, with your name, and send it to your Jathedar.</b></p>
  </div>
  <button type="reset" class="again ghost">Start again (clears everything)</button>
</section>
</form>

<footer class="foot">
  <p>Questions written from the video only. To print a paper copy, use your browser’s Print.</p>
</footer>
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
          `<p class="small">The quiz shows the events shuffled. Reading its rows top to bottom, the right numbers are: ${q.shown
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
const quiz = quizHTML(list);
writeFileSync(join(ROOT, 'quiz.html'), quiz);
// GitHub Pages serves ONLY docs/, so the live link has the quiz and nothing
// else: the answer key is never at a guessable address.
mkdirSync(join(ROOT, 'docs'), { recursive: true });
writeFileSync(join(ROOT, 'docs/index.html'), quiz);
writeFileSync(join(ROOT, 'docs/.nojekyll'), '');
writeFileSync(join(ROOT, 'answer-key.html'), keyHTML(list));
const spread = [0, 0, 0, 0];
list.filter((q) => q.type === 'choice' && q.options.length === 4).forEach((q) => spread[q.answer]++);
console.log(`Built quiz.html and answer-key.html: ${QUESTIONS.length} questions + bonus.`);
console.log(`Right answer position in 4-option questions (A B C D): ${spread.join(' ')}`);
