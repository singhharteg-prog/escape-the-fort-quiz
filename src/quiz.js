// Runs inside quiz.html. TOTAL and KEY are written in by tools/build.mjs.
// KEY is the answers, base64-encoded so they aren't sitting in plain view.
(() => {
  const answers = JSON.parse(
    new TextDecoder().decode(Uint8Array.from(atob(KEY), (c) => c.charCodeAt(0))),
  );
  const VIDEO = 'https://youtu.be/3myspuH4zkc';
  const STORE = 'nagni-bandi-chhor-quiz-v1';
  const form = document.getElementById('quiz');
  const who = document.getElementById('who');
  const nudge = document.getElementById('nudge');
  const result = document.getElementById('result');
  const again = document.getElementById('again');
  const check = document.getElementById('check');
  let warned = false;

  const mmss = (t) => `${Math.floor(t / 60)}:${String(t % 60).padStart(2, '0')}`;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

  // ----- reading what someone has put -----
  function given(a) {
    if (a.type === 'choice') {
      const el = form.querySelector(`input[name="${a.key}"]:checked`);
      return el ? Number(el.value) : null;
    }
    if (a.type === 'multi') {
      const els = [...form.querySelectorAll(`input[name="${a.key}"]:checked`)];
      return els.length ? els.map((e) => Number(e.value)) : null;
    }
    if (a.type === 'number') {
      const v = form.querySelector(`input[name="${a.key}"]`).value.trim();
      return v === '' ? null : Number(v);
    }
    if (a.type === 'order') {
      const vals = [...Array(a.n)].map((_, k) => form.querySelector(`[name="${a.key}-${k}"]`).value);
      return vals.every((v) => v === '') ? null : vals.map((v) => (v === '' ? null : Number(v)));
    }
  }
  const complete = (a, g) => g !== null && (a.type !== 'order' || g.every((v) => v !== null));

  function isRight(a, g) {
    if (g === null) return false;
    if (a.type === 'choice' || a.type === 'number') return g === a.answer;
    if (a.type === 'multi') return g.length === a.answer.length && a.answer.every((x) => g.includes(x));
    if (a.type === 'order') return g.every((v, k) => v === a.answer[k]);
  }

  // ----- saving progress on this device -----
  function save() {
    const data = { who: who.value, f: {} };
    form.querySelectorAll('input, select').forEach((el) => {
      if (el.type === 'radio' || el.type === 'checkbox') { if (el.checked) (data.f[el.name] ||= []).push(el.value); }
      else if (el.value !== '') data.f[el.name] = el.value;
    });
    try { localStorage.setItem(STORE, JSON.stringify(data)); } catch {}
  }
  function restore() {
    let data;
    try { data = JSON.parse(localStorage.getItem(STORE) || 'null'); } catch {}
    if (!data) return;
    who.value = data.who || '';
    form.querySelectorAll('input, select').forEach((el) => {
      const v = data.f[el.name];
      if (v === undefined) return;
      if (el.type === 'radio' || el.type === 'checkbox') el.checked = v.includes(el.value);
      else el.value = v;
    });
  }

  function count() {
    const counted = answers.filter((a) => a.key !== 'bonus');
    const done = counted.filter((a) => complete(a, given(a))).length;
    document.getElementById('count').textContent = done;
    document.getElementById('fill').style.width = `${(done / TOTAL) * 100}%`;
    return counted.filter((a) => !complete(a, given(a)));
  }

  // ----- marking -----
  function mark() {
    let score = 0;
    let bonusRight = false;
    const misses = [];
    for (const a of answers) {
      const box = document.getElementById(a.key);
      const g = given(a);
      const ok = isRight(a, g);
      const n = box.querySelector('.n').textContent;
      if (a.key === 'bonus') bonusRight = ok;
      else if (ok) score++;
      else misses.push({ n, t: a.t, order: a.type === 'order' });
      box.classList.add(ok ? 'is-right' : 'is-wrong');

      let extra = '';
      if (a.type === 'order' && g) {
        const placed = g.filter((v, k) => v === a.answer[k]).length;
        extra = `<p>${placed} of ${a.n} in the right place. The right order is:<br>${esc(a.right).replace(/ → /g, ' →<br>')}</p>`;
      }
      if (a.type === 'choice' || a.type === 'multi') {
        const right = Array.isArray(a.answer) ? a.answer : [a.answer];
        box.querySelectorAll('input').forEach((el) => {
          if (right.includes(Number(el.value))) el.closest('.opt').classList.add('was-right');
        });
      }
      const fb = box.querySelector('.fb');
      const link = a.t == null || a.type === 'order' ? '' : ` <a href="${VIDEO}?t=${a.t}" target="_blank" rel="noopener">Watch at ${mmss(a.t)}</a>`;
      fb.innerHTML =
        `<p class="verdict">${ok ? '✓ Right' : g === null ? '✗ Left blank' : '✗ Not quite'}</p>` +
        (ok || a.type === 'order' ? '' : `<p>Answer: <b>${esc(a.right)}</b></p>`) +
        extra +
        `<p>${esc(a.why)}${link}</p>`;
      fb.hidden = false;
    }

    form.classList.add('locked');
    form.querySelectorAll('input, select').forEach((el) => (el.disabled = true));
    who.disabled = true;
    check.hidden = true;
    again.hidden = false;
    nudge.textContent = '';

    const pct = score / TOTAL;
    const msg =
      score === TOTAL ? 'Full marks. Ready for the fort!'
      : pct >= 0.8 ? 'Really strong. Re-watch the ones you missed.'
      : pct >= 0.5 ? 'Good start. Re-watch the parts you missed, then try again.'
      : 'Watch the video once more with your notes, then try again.';
    const name = who.value.trim() || 'No name given';
    const when = new Date().toLocaleString('en-GB', { dateStyle: 'medium', timeStyle: 'short' });
    const missList = misses.length
      ? `<p class="misses"><b>Re-watch:</b> ${misses
          .map((m) => (m.order ? `Q${m.n} (the order)` : `Q${m.n} (<a href="${VIDEO}?t=${m.t}" target="_blank" rel="noopener">${mmss(m.t)}</a>)`))
          .join(', ')}</p>`
      : '';
    result.innerHTML = `<div class="card">
      <p class="who">${esc(name)}</p>
      <p class="score">${score}<small> / ${TOTAL}</small></p>
      <p class="msg">${msg}</p>
      <p class="meta">Bonus: ${bonusRight ? '✓' : '✗'} · ${esc(when)}</p>
      <p class="meta">Screenshot this and send it to your Jathedar.</p>
      ${missList}
    </div>`;
    result.hidden = false;
    form.parentNode.insertBefore(result, form); // score sits above the questions
    result.focus();
    result.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function reset() {
    form.reset();
    form.classList.remove('locked');
    form.querySelectorAll('.q').forEach((q) => {
      q.classList.remove('is-right', 'is-wrong');
      q.querySelector('.fb').hidden = true;
    });
    form.querySelectorAll('.was-right').forEach((o) => o.classList.remove('was-right'));
    form.querySelectorAll('input, select').forEach((el) => (el.disabled = false));
    who.disabled = false;
    check.hidden = false;
    again.hidden = true;
    result.hidden = true;
    warned = false;
    save();
    count();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ----- wiring -----
  form.addEventListener('change', () => { warned = false; nudge.textContent = ''; save(); count(); });
  form.addEventListener('input', () => { save(); count(); });
  who.addEventListener('input', save);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const blank = count();
    if (blank.length && !warned) {
      warned = true;
      const names = blank.map((a) => document.getElementById(a.key).querySelector('.n').textContent);
      nudge.textContent = `${blank.length} not finished (Q${names.join(', Q')}). Press again to check anyway.`;
      return;
    }
    mark();
  });
  again.addEventListener('click', reset);
  document.getElementById('print').addEventListener('click', () => window.print());

  restore();
  count();
})();
