---
title: "How to Edit a Day of Street Interviews Without Watching All the Footage"
description: "Forty to eighty clips, no master file, and every one of them contains the same words. Here is how to cut a day of street interviews without scrubbing all of it."
slug: "edit-a-day-of-street-interviews"
tags: ["street interviews", "editing workflow", "short form video", "content operations"]
date: "2026-08-05"
coverImage: "/images/articles/creator-reviewing-clips.jpg"
---

# How to Edit a Day of Street Interviews Without Watching All the Footage

A three-hour street interview shoot produces somewhere between 40 and 80 discrete clips. One per person, sometimes two if the first answer was a false start. Each clip runs 45 seconds to three minutes. There is no master file, and there never will be one. Nobody rolls continuously through a day of stopping strangers on a sidewalk.

That single fact is why street interviews are the hardest common format to get through, and why the tools built for editing don't help.

Here's how to shoot and cut one so the day ends with a stack of deliverables instead of a folder you're afraid to open.

## Why this format breaks the usual workflow

Four things stack up at once:

**No master file.** Every repurposing tool (the clippers, the caption tools, most of the automation platforms) takes a finished video and finds moments inside it. Street interviews have no inside. The footage is already atomized. You'd have to concatenate 60 files into a fake long video first, which throws away the one piece of structure you actually have: the clip boundaries mark the subjects.

**Many speakers, no continuity.** Sixty different faces, sixty different voice levels, sixty different backgrounds because the sun moved. Speaker diarization on a podcast is solving a two-person problem. Here every clip is a new person and the useful grouping isn't by speaker at all.

**One repeated question.** You asked the same thing 60 times. Transcript search is nearly useless. Every clip contains the same keywords. Searching "rent" in a shoot about rent returns everything.

**Wildly variable quality.** Maybe 12 of 60 answers are genuinely good. Another 20 are usable filler. The rest are "I don't know, sorry." You cannot tell which is which without hearing them, and the good ones aren't evenly distributed. You'll get four in a row and then nothing for twenty.

The result: 60 clips at ~2 minutes each is 120 minutes of footage. Scrubbing with notes runs closer to real time than people expect, so budget two to three hours of review before a single cut gets made. That's the actual cost of the format, and it lands on one person.

## Shoot so the edit is tractable

Most of the pain is created on the sidewalk, not in the timeline. Six habits that pay for themselves:

**Slate every subject, verbally.** Before the question, the operator says "subject 14, guy in the red jacket, Bushwick." Two seconds. It gives you a spoken index that survives into the transcript, so later you can find a person by description instead of by filename. If you use a physical slate, still say it out loud, audio is searchable, cardboard isn't.

**Get the question on tape, every time.** Not once at the top of the day. Every clip. It costs four seconds and it means each file is self-contained: question, answer, done. If you skip it, you'll spend the edit reconstructing which of your three phrasings you used on which subject, and any compilation cut will need the question rebuilt in post as a title card anyway.

**Lock your framing.** Pick one setup, subject on the same third, same lens, same height, and don't drift. Compilations cut between 8 to 12 people in 45 seconds. If the framing wanders, every cut reads as a mistake.

**Record ambient separately.** Two to three minutes of clean street tone at each location. You will need it to bridge cuts between subjects whose background noise doesn't match, and without it the compilation sounds like it was assembled from wreckage.

**Shoot the location.** Fifteen to twenty b-roll shots per location: the street sign, foot traffic, the storefront, hands, the skyline. It's what lets a recap breathe and what covers your jump cuts. Nothing from a stock library will ever match the actual corner you were standing on.

**Hold five seconds after the answer ends.** People finish, pause, and then say the real thing. Roughly one in six of the best sound bites of a shoot arrive in that pause. Cutting on the period costs you those. Hold, and let the silence be uncomfortable.

## The real problem is selection, not cutting

Once you've shot it well, the cutting itself is trivial. Each clip is one person answering one question. There's no structure to discover inside the file. Trim the head, trim the tail, done. Thirty seconds of work.

The problem is that you have 60 answers to the same question and you need the best 8, in the right order.

That's a ranking problem, and it's the part every tool skips. To do it you need each clip reduced to something comparable: what did they actually say, how well did they say it, and how does it relate to the other 59. A working pass looks like this. For every clip, write one line: **subject, position, the strongest 10 words, and a 1–5 rating.** That document is the edit. Everything after it is assembly.

Ranking criteria that hold up in practice: does the answer stand alone without the question, is it under 15 seconds, does it contain a specific detail rather than a generality, and does the person commit to a position. Specificity beats eloquence. "Twenty-eight hundred for a studio" outperforms "it's really expensive out here" every time.

## Through-lines are your separate videos

Ask 60 people one question and the answers self-organize. Four clusters show up in almost every shoot:

- **Agreement**. The majority take, said 30 different ways. Pick the five sharpest.
- **Disagreement**. The counter-position. Usually 10 to 15 percent of subjects, and it's your best video, because contrast holds attention.
- **The outlier**. One person with an answer nobody else gave. Often the strongest single clip of the day.
- **The funny one**, unintentional comedy, always present, always worth its own cut.

Add demographic or geographic splits when you shot more than one location, and you have six through-lines from one question. Each cluster is a separate video with its own hook, its own order, and its own audience. They are not variations of one edit. They're different arguments made from the same raw material.

## Two output shapes, ten-plus deliverables

**Per-subject recaps.** One person, one strong answer, 20 to 40 seconds, location b-roll under the setup. Fast to build and the best-performing format for a lot of accounts because a single face and a single idea is easy to follow. From 60 clips you'll have 10 to 15 worth publishing.

**Through-line compilations.** Eight to twelve subjects answering the same question, cut tight, 45 to 90 seconds. One per cluster, so five or six from a shoot day.

Total: 15 to 20 publishable pieces from one afternoon. Most teams get three, because they run out of patience during the review pass, not because the footage wasn't there.

## Doing it by hand, and where that stops working

If you're organizing manually, this structure survives contact with volume better than most:

```
2026-08-05-rent-question/
  raw/            01_redjacket_bushwick.mp4 ..
  broll/          location tags in filenames
  ambient/
  selects/        symlinks or copies of 4s and 5s
  projects/
    recap-14-redjacket/
    comp-agreement/
    comp-disagreement/
    comp-outlier/
```

Rename on ingest, `subjectnumber_descriptor_location`, and keep the one-line-per-clip selects document next to the raw folder. Two rules: never edit out of `raw/`, and never let a project folder contain footage from two through-lines.

This works fine for one shoot. It stops working at three shoots a week. The bottleneck isn't the folders, it's that every one of those 180 clips still has to pass through a human's eyes and ears before anyone knows what they contain, and that review time scales linearly while nothing else does. Teams either cap their shooting volume to match one person's review capacity, or they publish the first eight clips they happen to like and leave the rest on the drive.

This is the exact gap Clik was built for: point it at the folder of 60 clips, and it reads all of them, groups them by through-line, and builds each group into its own project, recaps and compilations in parallel, using your own location b-roll and your own cutting style. You never sort a file, and you never watch the 40 clips that were never going to make it.

Shoot it well, rank before you cut, and let the clusters tell you how many videos you actually have.

[Try Clik on your next shoot day →](https://clik.vision)
