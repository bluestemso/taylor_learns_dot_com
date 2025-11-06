---
layout: project
title: Quikpik App
description: A simple random picker app for busy parents.
image: /assets/images/Quikpik-composite-screenshot.png
tags: [Flutter]
link: https://play.google.com/store/apps/details?id=solutions.bluestem.quikpik&hl=en_US
---

**Quikpik** helps busy parents when they need to flip a coin, pick a random number/color, or select from a list at random.  It is meant to be a quickly accessible and simple utility app.

This is the first in a new series called "90 Minute Flutter," in which I see just how far I can take a [Flutter](https://flutter.dev/){:target="_blank"} app build in less than 90 minutes.

The repo is available publicly on [GitHub](https://github.com/bluestemso/randomness-90-minute-flutter).

## 90 Minute Flutter
#### Build Prep
I didn't complete any prep before this build.  I used Gemini to brainstorm five app ideas and I selected the one that resonated the most with me.

#### Design Brief
Build a multi-purpose randomness generator app.  At minimum, it should contain features for:
- Coin flips
- Random number generator (with ability to set limits)
- Random color generator
- Random item from a list

#### Post-Build Reflection
Overall, this was a really smooth build.  I started by writing the README.md file to include the key features and screens, and then asked Cursor create the build-plan.md file based on that.  Then we just worked through each phase of the build plan, which I think helped keep everything on track and focused.  I've been seeing a lot of other AI-first developers using that technique, but this was my first attempt at it, and it seemed to work really well.

Something I've noticed before that definitely played out in this exercise as well is how much the LLM's seem to struggle with the finer points of design (which I'm comfortable doing), while still excelling at architecture (which I'm still learning).  We're a great team!

In particular, the LLM had a really hard time with setting up the color configuration portion of the Random Color Selection screen.  I tried multiple different prompts, but all yielded almost comically wrong implementations.  First, each section of the bar just toggled through each of the available colors with each tap, then it wouldn't show the colors at all, then after some tweaking to get the right behavior, the orange section (and *only* the orange section) started behaving strangely.  This feature alone ended up taking more than just about anything else in the app.

Next time I'd like to be able to come in with my own theme from [Flex Color Scheme](https://docs.flexcolorscheme.com/), although we'll see if that ends up generating more issues for the LLM. I may end up needing to apply that after the fact.

I'd also like to be able to automate some of the post-build processes (screenshots, README, etc), so I need to find some tools that might be able to help with that.
