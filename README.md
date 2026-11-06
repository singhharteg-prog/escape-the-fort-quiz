# Escape the Fort: Team Nagni quiz

A practice quiz for **Team Nagni** before the vidyala's *Escape the Fort*
game for Bandi Chhor Divas. Ustad Ji asked the jathedars to have their teams
watch one Basics of Sikhi video, because it will help in the game. This quiz
checks that the team knows what's in it.

Video: [“Diwali – A Festival of Light Animation”](https://youtu.be/3myspuH4zkc), Basics of Sikhi, 11:30.

**Keep this repo private.** Khanda and Baagnakha are competing in the same game.

## The two files

| File | Who it's for |
|---|---|
| `quiz.html` | **The team.** Send this one file (WhatsApp, email, AirDrop). It opens in a browser, marks itself, explains every answer with a link to that moment in the video, and ends on a score card to screenshot and send back. It needs no internet except to play the video links. It also has a **Print this quiz** button for an A4 paper copy (7 pages). |
| `answer-key.html` | **The Jathedar only.** Every answer, why, and where in the video it's said. Use it to mark paper copies. Don't send it to the team. |

27 questions in four parts (Chandu's plans · Inside Gwalior prison · The lions
and the release · put the story in order), plus one bonus that doesn't count.

## Rules the questions keep

- **Only what the video says.** Every question has the second it's said
  (`t` in `data/questions.mjs`). The questions were written from the video's
  English captions, which Basics of Sikhi wrote themselves (not auto-generated).
- **One exception, marked:** the bonus question (where Guru Ji's robe can be
  seen today) comes from the video's YouTube *description*, not its narration.
  The page says so, and it doesn't count towards the score.
- Wrong options are made up on purpose. Only the right answers are claims.
- Titles in full: Guru Hargobind Sahib Ji, Guru Arjan Dev Ji, Bhai Hardas Ji,
  Bhai Jetha Ji, Bhai Pirana Ji.
- One caption is unclear: at 2:59 it reads *“Jungle's final instruction…”*,
  probably a mis-typed “Chandu's”. No question depends on who said that line.

## Changing a question

1. Re-watch the moment, then edit `data/questions.mjs`.
2. `node tools/build.mjs` rebuilds both HTML files. It refuses to build if a
   question is malformed, shuffles the options (the same way every build, with
   right answers spread evenly over A–D), and shuffles the order question's
   events.
3. Never edit `quiz.html` or `answer-key.html` by hand. They're generated.

The page's look is in `src/quiz.css` and its marking in `src/quiz.js`.

## Things to know

- **The answers are inside `quiz.html`**, base64-encoded so they aren't in
  plain view. A determined kid could still dig them out. Fine for practice.
- **iPhone:** a file opened straight from WhatsApp or Files shows in a quick
  preview that doesn't run the marking. The questions still show, so they
  can be answered on paper. To mark itself on an iPhone, the file has to be
  opened in Safari, which isn't easy from a downloaded file. Android and
  laptops open it in Chrome and it works fully.
- Each device keeps its own answers until the quiz is checked, so closing
  the page by accident doesn't lose them.
- Not hosted anywhere, on purpose.
