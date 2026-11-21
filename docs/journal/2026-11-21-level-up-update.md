# Dev Journal: The "Level Up" Update

**Isekai Kayso Studio · November 21, 2026**
**Play it:** https://kaysodesu.github.io/isekai-kayso-word-search/

---

## Why this update

When *Seek & Find* launched, it was a big, open buffet: 175 puzzle cards on one long page and every length open from day one. It was fun, but it didn't feel like a *journey*. This update is about rhythm: a calmer home screen, a reason to come back tomorrow, rewards that feel earned, and a story that makes you smile at 10 p.m. after a long day.

We also did something new for the studio: a practice research run, to check that the game lives up to what we want it to be: **cozy, chill, self-paced, story-driven, and quietly rewarding.**

---

## What's new

### 🧹 A cleaner, calmer puzzle page
- The 175 cards are now **35 slim theme rows**. Each row shows its five lengths (1 · 5 · 10 · 15 · 30 minutes) as small buttons that fill in with color once solved.
- The header and filters fit into one compact bar: length, search, category and "Hide done".
- **About 86% less scrolling on phones**: 2,362 px instead of 17,115 px. On a desktop screen, nearly the whole catalog fits at once.

### 🔓 Lengths now unlock in order
- In each theme, the **5-minute puzzle unlocks after you solve the 1-minute one**, then 10, 15 and 30.
- Locked lengths show a small padlock. Links and bookmarks to a locked puzzle send you to your next playable one, with a short explanation.
- Puzzles you've already solved stay open to replay, so nobody loses progress.

**Why:** it gives every theme a gentle "level up" path, like a saga map in a match-3 game, without lives, timers or paywalls.

### ⏱️ Puzzle lengths now match their time goals
We tested every one of the 175 puzzles with a simulated, methodical searcher. It scans for first letters, checks directions and follows letters, with fixed costs per action that we chose *before* running the test, so the results couldn't be nudged. Three lengths were finishing well under their goals, so they got bigger:

| Length | Before | Now | Simulated time vs. goal |
|---|---|---|---|
| 1 min | 8×8, 6 words | unchanged | 0.89 |
| 5 min | 11×11, 12 words | **12×12, 16 words** | 0.60 → **0.88** |
| 10 min | 13×13, 18 words | **15×15, 22 words** | 0.62 → **0.95** |
| 15 min | 15×15, 26 words | **16×16, 30 words** | 0.77 → **0.97** |
| 30 min | 20×20, 40 words | unchanged | 0.95 |

*Honest note:* this is a model, not real players. Real play times may differ, and we'd love your feedback in Discord.

### 🏅 Beat the clock: double coins + achievements
- Finish a **10, 15 or 30-minute** puzzle within its goal (10:00, 15:00 or 30:00 on the clock) and it pays **double Grotto Coins**: up to 10 instead of 5.
- The first time you beat each goal, you unlock an achievement on your profile (the Leaderboard page):
  - 🥪 **Lunch Break Legend**: beat a 10-minute goal
  - ⏩ **Skip Intro Energy**: beat a 15-minute goal
  - 🍿 **Binge Boss**: beat a 30-minute goal
- Each achievement tracks how many of the 35 goals you've beaten. Replaying faster pays only the difference, so coins can't be farmed.
- The Time Buffer power-up *doesn't* count toward double coins: it's the real clock or nothing.

### 😂 A funnier story
Same Storybook, same characters, more comedy for the millennial crowd. Inky, the archivist, is on her third latte and doing her best. Jumble, the wind spirit, has notifications permanently on and a flair for dramatic entrances. Expect group chats, adulting, "per my last email", Mercury in retrograde, Top 8s and main-character energy, while Jumble's apology arc still lands with heart.

### 🐛 Fixes
- The Leaderboard's **Fastest solves** list was squashed into a narrow grid because its name clashed with the puzzle board's styling. It now displays properly.
- Behind-the-scenes cleanup: shared helpers for the lock rules and coin totals, and lighter work when the list redraws.

---

## Research: the "Edwin" case study

We published our first **practice research run**: [docs/case-study](../case-study/README.md). An AI tester played the live site on a phone as **Edwin**, a fictional 37-year-old millennial in early recovery who uses the game as an evening wind-down. The study also reviews 13 published sources on puzzles, mood, cravings, brain-training claims, loneliness and self-compassion.

**What it confirmed:** the game is cozy and truly self-paced. There are no manipulative tricks (ads, energy timers, purchases), and the earn → spend → wear loop works.

**What it found to fix:**
1. On phones, the **list of words to find sits below the screen**.
2. Tapping a locked length gives **no feedback on touchscreens**.
3. The game **never asks for your name**, so the hero says "I'm Seeker".
4. There's **no relaxed mode** (no clock) and **no gentle pacing check-in**.
5. Coin redemption on Discord **can't be verified yet**, because coins live on each player's device.

**What it says about the bigger idea:** puzzles like these have real evidence for short-term calm, reduced cravings and attention practice. Claims about "improving brain function" or curing loneliness go further than the science does. We're keeping our language honest: *Seek & Find* is a wellness and community game, **not a treatment**.

---

## Privacy, unchanged

Everything still saves **only in your browser**. There are no accounts, tracking or analytics, and nothing is ever sent to us. Use **Leaderboard → Download backup** to move your progress to another device.

---

## What's next

Straight from the case study, in priority order:
1. Keep the word list on screen while you play on phones.
2. A friendly message when you tap a locked length.
3. Ask your Seeker's name before the story starts.
4. Bigger tap targets for the length buttons.
5. **Relaxed mode** (no clock) and an optional evening wind-down goal.
6. Story moments that model kindness to yourself after a rough round.

---

## Come hang out

Redeem Grotto Coins for emotes, perks and more in the **Isekai Kayso Studio** gaming session channel: https://discord.gg/EAHfPzxqEc

*If you or someone you know is struggling with substance use, the SAMHSA National Helpline is free, confidential and open 24/7: **1-800-662-4357**.*
