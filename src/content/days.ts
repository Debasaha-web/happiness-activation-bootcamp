// ─────────────────────────────────────────────────────────────────────────
//  content/days.ts — single source of truth for all 7 days (ABM 3.0)
//
//  Day 1 (Gratitude) is transcribed verbatim from day-1-gratitude.html.
//  Days 2–7 come from Days-2-7-Content.md.
//  Edit copy HERE — components never hardcode content.
// ─────────────────────────────────────────────────────────────────────────

/** A run of scenario text. `tone` paints an inline highlight, matching the mockup. */
export type Segment = { t: string; tone?: "hot" | "warm" };
export type Paragraph = Segment[];

export type Rep = "See" | "Feel" | "Become";

export type NeuroTagRep = {
  key: string; // stable prompt_key, e.g. "d1_tag_see"
  rep: number;
  label: Rep;
  question: string;
  placeholder?: string;
};

export type RASPrompt = {
  key: string;
  question: string;
  placeholder?: string;
};

export type TFQuestion = {
  key: string;
  question: string;
  scenarioTied: boolean;
};

export type DropdownQuestion = {
  key: string;
  question: string;
  options: string[];
  scenarioTied: boolean;
};

export type OpenQuestion = {
  key: string;
  question: string;
  placeholder?: string;
  scenarioTied: boolean;
};

export type Day = {
  day: number;
  mindset: string; // "Gratitude"
  /** Hero headline split so the second half glows, matching the mockup. */
  display: { head: string; glow: string };
  /** Hero subtitle. */
  tagline: string;
  video: { length: string; url?: string };
  scenario: {
    label: string;
    paragraphs: Paragraph[];
  };
  neuroTagging: {
    help: string;
    reps: NeuroTagRep[];
  };
  ras: {
    help: string;
    prompts: RASPrompt[];
  };
  verbalEncoding: {
    help: string;
    prompt: string;
  };
  neuroJournaling: {
    tf: TFQuestion[];
    dropdown: DropdownQuestion[];
    open: OpenQuestion[];
  };
  /** Mindset Bursting — algorithm unchanged: 45s evidence scan (self / others / world). */
  mindsetBursting: { prompt: string };
};

const burst = (mindset: string) =>
  `45 seconds on the clock. Burst out every bit of evidence you saw today that ${mindset} is real — in you, in others, in the world. Go fast, don't edit.`;

export const DAYS: Day[] = [
  // ═══════════════════════════════ DAY 1 — GRATITUDE ═══════════════════════
  {
    day: 1,
    mindset: "Gratitude",
    display: { head: "Grati", glow: "tude" },
    tagline:
      "The mindset that rewires what your brain looks for. Train it for the next 20 minutes.",
    video: { length: "2:10", url: "https://dgynmkwftbrla2it.public.blob.vercel-storage.com/day-1-gratitude.mp4" },
    scenario: {
      label: "Live the moment",
      paragraphs: [
        [
          {
            t: "It's 6:40 on a Tuesday and the day already got away from you. The inbox won. The meeting ran long. You're standing in the kitchen, keys still in your hand, running the to-do list that never ends.",
          },
        ],
        [
          { t: "Then your phone buzzes. A name you haven't seen in months. " },
          {
            t: '"Just thinking about you — you changed the way I work. Thank you."',
            tone: "warm",
          },
          { t: " No ask. No agenda. Just that." },
        ],
        [
          { t: "You read it twice. Something in your chest " },
          { t: "loosens", tone: "hot" },
          {
            t: ". The list is still there. The day was still long. But for ten seconds, none of it is the thing you're looking at. You're looking at the person who took thirty seconds to say you mattered — and at the version of you who, somewhere along the line, did something worth remembering.",
          },
        ],
      ],
    },
    neuroTagging: {
      help: "This is the visualization — done by writing it down. Answer as if you're inside the scene.",
      reps: [
        {
          key: "d1_tag_see",
          rep: 1,
          label: "See",
          question:
            "Whose name lit up your phone in that moment — someone real who'd actually thank you like that?",
          placeholder: "Type the person and what they'd say…",
        },
        {
          key: "d1_tag_feel",
          rep: 2,
          label: "Feel",
          question:
            "Name the exact thing that loosened in your chest. Where did you feel it, and what did it push out?",
          placeholder: "Describe the physical shift…",
        },
        {
          key: "d1_tag_become",
          rep: 3,
          label: "Become",
          question:
            "What did you do — months ago — that made you worth that message? Say it in one line.",
          placeholder: "The thing you'd be remembered for…",
        },
      ],
    },
    ras: {
      help: "Tell your brain what to look for today. Two people or situations that show gratitude in action.",
      prompts: [
        {
          key: "d1_ras_1",
          question:
            "One person in your life who lives this mindset — who notices and says thank you. Who, and how?",
          placeholder: "Name them and what they do…",
        },
        {
          key: "d1_ras_2",
          question:
            "One situation from the last 24 hours you almost walked past — but it deserved a thank-you.",
          placeholder: "The small moment you'd have missed…",
        },
      ],
    },
    verbalEncoding: {
      help: "Speak it — 2 to 3 sentences, out loud, about the scenario. Saying it encodes it deeper than typing.",
      prompt:
        '"Describe the moment you got that message — and say what you did, months ago, that earned it. Speak as if you\'re telling a friend."',
    },
    neuroJournaling: {
      tf: [
        {
          key: "d1_tf_1",
          question:
            "Today, I caught myself looking for something to be grateful for — not waiting for it to find me.",
          scenarioTied: false,
        },
        {
          key: "d1_tf_2",
          question:
            "The message in this morning's scenario reminded me of a real person I haven't thanked.",
          scenarioTied: true,
        },
        {
          key: "d1_tf_3",
          question:
            "I noticed at least one good thing today I'd normally have walked past.",
          scenarioTied: false,
        },
      ],
      dropdown: [
        {
          key: "d1_dd_1",
          question: "Where did gratitude show up strongest today?",
          options: [
            "At work / with a colleague",
            "At home / with family",
            "A stranger or small moment",
            "In something I did for myself",
            "It didn't, yet — tomorrow",
          ],
          scenarioTied: false,
        },
        {
          key: "d1_dd_2",
          question:
            'Think back to the scenario. The "thank-you that earned it" — how close are you to deserving one like it?',
          options: [
            "I'm living it right now",
            "Close — a few more reps",
            "I see the gap clearly",
            "I needed this reminder",
          ],
          scenarioTied: true,
        },
        {
          key: "d1_dd_3",
          question: "When you felt thankful today, what did you do with it?",
          options: [
            "Said it out loud to them",
            "Sent a message",
            "Felt it but kept it in",
            "Wrote it down",
            "Let it pass",
          ],
          scenarioTied: false,
        },
      ],
      open: [
        {
          key: "d1_open_1",
          question:
            "Who deserves your version of that 6:40 message — and what would you say?",
          placeholder: "Write it like you'd send it…",
          scenarioTied: true,
        },
        {
          key: "d1_open_2",
          question: "What's one thing today that went better than you expected?",
          placeholder: "Be specific…",
          scenarioTied: false,
        },
        {
          key: "d1_open_3",
          question:
            "If tomorrow held one more moment worth being grateful for, what do you hope it is?",
          placeholder: "Name it before it happens…",
          scenarioTied: false,
        },
      ],
    },
    mindsetBursting: { prompt: burst("gratitude") },
  },

  // ═══════════════════════════════ DAY 2 — ASPIRATION ══════════════════════
  {
    day: 2,
    mindset: "Aspiration",
    display: { head: "Aspir", glow: "ation" },
    tagline: 'The mindset that refuses to let "good enough" be the ceiling.',
    video: { length: "2:10", url: "https://dgynmkwftbrla2it.public.blob.vercel-storage.com/day-2-aspiration.mp4" },
    scenario: {
      label: "Live the moment",
      paragraphs: [
        [
          {
            t: "You're at the kitchen table at 10pm, laptop half-closed, and you catch your own reflection in the dark window. You look... fine. The job is fine. The paycheck clears. Nobody's complaining.",
          },
        ],
        [
          {
            t: 'And that\'s exactly the problem. Somewhere in the last few years, "fine" quietly became the goal. You stopped saying the bigger thing out loud — the one you used to talk about with your hands moving, before you learned to be reasonable.',
          },
        ],
        [
          {
            t: "Then you remember it. The version of your life you sketched out at 25, the thing you were ",
          },
          { t: "sure", tone: "warm" },
          {
            t: " you'd build. It's still in there. It didn't die. It just got polite. And tonight, in the window, it's looking right back at you — not disappointed, just ",
          },
          { t: "waiting.", tone: "warm" },
          { t: " Asking the same question it's always asked: " },
          { t: "are we still going for it, or not?", tone: "hot" },
        ],
      ],
    },
    neuroTagging: {
      help: "This is the visualization — done by writing it down. Answer as if you're inside the scene.",
      reps: [
        {
          key: "d2_tag_see",
          rep: 1,
          label: "See",
          question:
            "What's the bigger thing you stopped saying out loud? Name it plainly, the way you'd have said it at 25.",
          placeholder: "Say it the way 25-year-old you would…",
        },
        {
          key: "d2_tag_feel",
          rep: 2,
          label: "Feel",
          question:
            "When you picture actually going for it again, what shows up first — the fear or the pull? Describe it.",
          placeholder: "Fear or pull — which lands first?",
        },
        {
          key: "d2_tag_become",
          rep: 3,
          label: "Become",
          question:
            'What\'s the one move this week that the "still going for it" version of you would make?',
          placeholder: "One move, this week…",
        },
      ],
    },
    ras: {
      help: "Tell your brain what to look for today. Two people or situations that show aspiration in action.",
      prompts: [
        {
          key: "d2_ras_1",
          question:
            "Name one person who's still chasing something bigger and makes you believe it's possible. What do they do?",
          placeholder: "Name them and what they do…",
        },
        {
          key: "d2_ras_2",
          question:
            "One thing in your own life that started as a far-off aspiration and is now just... real. Thank it.",
          placeholder: "The far-off thing that came true…",
        },
      ],
    },
    verbalEncoding: {
      help: "Speak it — 2 to 3 sentences, out loud, about the scenario. Saying it encodes it deeper than typing.",
      prompt:
        '"Say out loud the bigger thing you\'ve been keeping quiet — and finish with the one move you\'re going to make toward it this week. Say it like you mean it."',
    },
    neuroJournaling: {
      tf: [
        {
          key: "d2_tf_1",
          question:
            "I said my real ambition out loud today, even just to myself.",
          scenarioTied: true,
        },
        {
          key: "d2_tf_2",
          question: 'I caught myself settling for "fine" at least once today.',
          scenarioTied: false,
        },
        {
          key: "d2_tf_3",
          question:
            "I did one small thing today that the bigger version of me would respect.",
          scenarioTied: false,
        },
      ],
      dropdown: [
        {
          key: "d2_dd_1",
          question: "What's keeping the bigger thing on the shelf?",
          options: [
            "Time",
            "Fear of failing",
            "Other people's expectations",
            "I forgot I wanted it",
            "Nothing — I'm moving on it",
          ],
          scenarioTied: false,
        },
        {
          key: "d2_dd_2",
          question: "Where's your aspiration loudest right now?",
          options: [
            "Career",
            "Health & body",
            "A relationship",
            "A creative thing",
            "Money & freedom",
          ],
          scenarioTied: false,
        },
        {
          key: "d2_dd_3",
          question:
            'The reflection in the window asked "are we still going for it?" — your honest answer today:',
          options: [
            "A clear yes",
            "A scared yes",
            'A "not yet"',
            "I needed the reminder",
          ],
          scenarioTied: true,
        },
      ],
      open: [
        {
          key: "d2_open_1",
          question:
            "What did the 25-year-old version of you want that you owe them a shot at?",
          placeholder: "What you owe 25-year-old you…",
          scenarioTied: true,
        },
        {
          key: "d2_open_2",
          question: "What's the smallest first step that's still genuinely scary?",
          placeholder: "Small, but still scary…",
          scenarioTied: false,
        },
        {
          key: "d2_open_3",
          question:
            "If you knew you couldn't fail, what would you start tomorrow morning?",
          placeholder: "If failure were impossible…",
          scenarioTied: false,
        },
      ],
    },
    mindsetBursting: { prompt: burst("aspiration") },
  },

  // ═══════════════════════════════ DAY 3 — MISSION ═════════════════════════
  {
    day: 3,
    mindset: "Mission",
    display: { head: "Miss", glow: "ion" },
    tagline:
      "The mindset that turns a wish into a thing you actually do, on purpose, daily.",
    video: { length: "2:10", url: "https://dgynmkwftbrla2it.public.blob.vercel-storage.com/day-3-mission.mp4" },
    scenario: {
      label: "Live the moment",
      paragraphs: [
        [
          {
            t: "It's Sunday night. The week ahead is a wall of other people's priorities — meetings you didn't call, asks you didn't make, a calendar that fills itself. You feel the familiar drift coming: a week will happen ",
          },
          { t: "to", tone: "warm" },
          {
            t: " you, and on Friday you'll wonder where it went.",
          },
        ],
        [
          {
            t: "Then you do something different. You take out one card and you write a single sentence — what ",
          },
          { t: "this week", tone: "warm" },
          {
            t: " is actually for. Not the to-do list. The point. The one thing that, if it moves, makes the week count no matter what else burns.",
          },
        ],
        [
          {
            t: "Monday comes and the chaos arrives right on schedule. But this time there's a line running underneath all of it, quiet and steady: ",
          },
          { t: "this is what I'm here to move.", tone: "warm" },
          {
            t: " The noise doesn't stop. But for the first time in a while, you're not drifting in it. ",
          },
          { t: "You're aimed.", tone: "hot" },
        ],
      ],
    },
    neuroTagging: {
      help: "This is the visualization — done by writing it down. Answer as if you're inside the scene.",
      reps: [
        {
          key: "d3_tag_see",
          rep: 1,
          label: "See",
          question:
            "What's the one sentence on your card — the single thing this week is actually for?",
          placeholder: "One sentence. The point of the week…",
        },
        {
          key: "d3_tag_feel",
          rep: 2,
          label: "Feel",
          question:
            "Picture Friday with that one thing moved. What does that version of the week feel like in your body?",
          placeholder: "Friday, with it moved…",
        },
        {
          key: "d3_tag_become",
          rep: 3,
          label: "Become",
          question:
            "What will you have to say no to, to protect the one thing? Name it.",
          placeholder: "What you'll say no to…",
        },
      ],
    },
    ras: {
      help: "Tell your brain what to look for today. Two people or situations that show mission in action.",
      prompts: [
        {
          key: "d3_ras_1",
          question:
            "One person who lives with clear purpose, who always seems aimed instead of adrift. What do they do?",
          placeholder: "Name them and what they do…",
        },
        {
          key: "d3_ras_2",
          question:
            "One time you finished a week knowing it counted. What made it count? Thank that.",
          placeholder: "The week that counted…",
        },
      ],
    },
    verbalEncoding: {
      help: "Speak it — 2 to 3 sentences, out loud, about the scenario. Saying it encodes it deeper than typing.",
      prompt:
        '"Say your one sentence out loud — what this week is for — and then say the one thing you\'ll say no to in order to protect it."',
    },
    neuroJournaling: {
      tf: [
        {
          key: "d3_tf_1",
          question:
            "I know the single most important thing I'm moving this week.",
          scenarioTied: true,
        },
        {
          key: "d3_tf_2",
          question:
            "Today I let other people's priorities set my whole agenda.",
          scenarioTied: false,
        },
        {
          key: "d3_tf_3",
          question:
            "I said no to at least one thing that didn't serve the mission today.",
          scenarioTied: false,
        },
      ],
      dropdown: [
        {
          key: "d3_dd_1",
          question: "How aimed did today feel?",
          options: [
            "Locked in",
            "Mostly on track",
            "Pulled in pieces",
            "Pure drift",
            "Recovering from drift",
          ],
          scenarioTied: false,
        },
        {
          key: "d3_dd_2",
          question: "What pulls you off mission most?",
          options: [
            "Other people's urgency",
            "My own distraction",
            "No clear priority",
            "Saying yes too much",
            "Fatigue",
          ],
          scenarioTied: false,
        },
        {
          key: "d3_dd_3",
          question:
            "The card said what the week is for. Did today move it?",
          options: [
            "Yes, real progress",
            "A little",
            "No, but I will",
            "Forgot it entirely",
          ],
          scenarioTied: true,
        },
      ],
      open: [
        {
          key: "d3_open_1",
          question: "Write the one sentence — what is this week actually for?",
          placeholder: "One sentence…",
          scenarioTied: true,
        },
        {
          key: "d3_open_2",
          question:
            "What's the thing that's been eating your time without earning it?",
          placeholder: "The time-thief…",
          scenarioTied: false,
        },
        {
          key: "d3_open_3",
          question: "Who or what are you trying to be aimed for — not just at?",
          placeholder: "Aimed for…",
          scenarioTied: false,
        },
      ],
    },
    mindsetBursting: { prompt: burst("mission") },
  },

  // ═══════════════════════════════ DAY 4 — HOPE ════════════════════════════
  {
    day: 4,
    mindset: "Hope",
    display: { head: "Ho", glow: "pe" },
    tagline:
      "The mindset that bets on a future worth showing up for — and trains the brain to find it.",
    video: { length: "2:10", url: "https://dgynmkwftbrla2it.public.blob.vercel-storage.com/day-4-hope.mp4" },
    scenario: {
      label: "Live the moment",
      paragraphs: [
        [
          {
            t: "You get the news mid-afternoon — the thing you'd been counting on isn't happening. The deal, the answer, the break. Not a catastrophe. Just a door, quietly closing. And the old script starts up automatically: ",
          },
          { t: "of course. This is how it always goes.", tone: "warm" },
        ],
        [
          {
            t: "You sit with it. And then — not because you're naïve, but because you've decided to — you ask a different question than your gut wants to ask. Not \"why does this always happen to me,\" but: ",
          },
          { t: "what's still possible from here?", tone: "warm" },
        ],
        [
          {
            t: "It's a small shift. The door's still closed. But asking the second question, something loosens — the future stops being a fixed thing happening ",
          },
          { t: "to", tone: "warm" },
          {
            t: " you and goes back to being something you get a say in. You can't see the whole path. You don't need to. You just need to believe there ",
          },
          { t: "is", tone: "warm" },
          {
            t: " one, enough to take the next step. ",
          },
          { t: "And tonight, you do.", tone: "hot" },
        ],
      ],
    },
    neuroTagging: {
      help: "This is the visualization — done by writing it down. Answer as if you're inside the scene.",
      reps: [
        {
          key: "d4_tag_see",
          rep: 1,
          label: "See",
          question:
            "What's the door that recently closed on you — the deal, the answer, the break that didn't come?",
          placeholder: "The door that closed…",
        },
        {
          key: "d4_tag_feel",
          rep: 2,
          label: "Feel",
          question:
            'When you ask "what\'s still possible from here?" instead of "why me," what changes inside?',
          placeholder: "What shifts with the better question…",
        },
        {
          key: "d4_tag_become",
          rep: 3,
          label: "Become",
          question:
            "What's the one next step you can take that assumes the future is still yours to shape?",
          placeholder: "The next step you take anyway…",
        },
      ],
    },
    ras: {
      help: "Tell your brain what to look for today. Two people or situations that show hope in action.",
      prompts: [
        {
          key: "d4_ras_1",
          question:
            "One person who keeps hope alive even when things look bleak. How do they do it?",
          placeholder: "Name them and how they do it…",
        },
        {
          key: "d4_ras_2",
          question:
            "One time a closed door turned out to be the best thing that could've happened. Thank it.",
          placeholder: "The door that was a gift…",
        },
      ],
    },
    verbalEncoding: {
      help: "Speak it — 2 to 3 sentences, out loud, about the scenario. Saying it encodes it deeper than typing.",
      prompt:
        '"Say out loud the door that closed — and then finish with what\'s still possible from here, and the next step you\'re taking anyway."',
    },
    neuroJournaling: {
      tf: [
        {
          key: "d4_tf_1",
          question:
            'Today I caught the old "this always happens to me" script and chose a better question.',
          scenarioTied: true,
        },
        {
          key: "d4_tf_2",
          question:
            "I believed, at least once today, that things can actually get better.",
          scenarioTied: false,
        },
        {
          key: "d4_tf_3",
          question:
            "I took a step toward something good even though the outcome isn't guaranteed.",
          scenarioTied: false,
        },
      ],
      dropdown: [
        {
          key: "d4_dd_1",
          question: "Where's your hope strongest right now?",
          options: [
            "My work",
            "My health",
            "A relationship",
            "The bigger picture",
            "Honestly, it's low today",
          ],
          scenarioTied: false,
        },
        {
          key: "d4_dd_2",
          question: "When a door closes, your default reaction is usually:",
          options: [
            '"What\'s next"',
            "Spiral first, recover later",
            "Shut down",
            "Blame myself",
            "It depends",
          ],
          scenarioTied: false,
        },
        {
          key: "d4_dd_3",
          question:
            'The scenario asked "what\'s still possible from here?" — your honest answer about your own closed door:',
          options: [
            "A lot, actually",
            "More than I thought",
            "Not sure yet",
            "I'm still grieving it",
          ],
          scenarioTied: true,
        },
      ],
      open: [
        {
          key: "d4_open_1",
          question:
            "What future are you secretly afraid to hope for because it might not happen?",
          placeholder: "The hope you're guarding…",
          scenarioTied: true,
        },
        {
          key: "d4_open_2",
          question:
            "What's one piece of evidence from your own life that things can turn around?",
          placeholder: "Your own proof…",
          scenarioTied: false,
        },
        {
          key: "d4_open_3",
          question:
            "If you fully believed the best version of next year was possible, what would you do differently this week?",
          placeholder: "If you believed it…",
          scenarioTied: false,
        },
      ],
    },
    mindsetBursting: { prompt: burst("hope") },
  },

  // ═══════════════════════════════ DAY 5 — RESILIENCE ══════════════════════
  {
    day: 5,
    mindset: "Resilience",
    display: { head: "Resili", glow: "ence" },
    tagline:
      "The mindset that doesn't avoid the hit — it gets up faster every time.",
    video: { length: "2:10", url: "https://dgynmkwftbrla2it.public.blob.vercel-storage.com/day-5-resilience.mp4" },
    scenario: {
      label: "Live the moment",
      paragraphs: [
        [
          {
            t: "It's the second hard thing this month. The first one you absorbed. This one lands while you're still standing in the rubble of the last, and for a second the thought is simple and total: ",
          },
          { t: "I don't have it in me to do this again.", tone: "warm" },
        ],
        [
          {
            t: "You sit on the bottom step. You let it be exactly as bad as it is — no spin, no silver lining, just the weight of it. And then, from somewhere underneath the exhaustion, an older truth surfaces: you have been here before. Not this exact spot, but ",
          },
          { t: "this feeling", tone: "warm" },
          {
            t: " — the one where you were sure you were done. And you weren't. You got up. You always have.",
          },
        ],
        [
          {
            t: "That's not a motivational poster. It's a track record. You're not made of glass; you're made of every time you thought you'd break and didn't. The hit is real. The weight is real. ",
          },
          {
            t: "And so is the part of you that's already, quietly, starting to stand up.",
            tone: "hot",
          },
        ],
      ],
    },
    neuroTagging: {
      help: "This is the visualization — done by writing it down. Answer as if you're inside the scene.",
      reps: [
        {
          key: "d5_tag_see",
          rep: 1,
          label: "See",
          question:
            "What's the hit you're absorbing right now — the hard thing that's testing you?",
          placeholder: "The hit you're taking…",
        },
        {
          key: "d5_tag_feel",
          rep: 2,
          label: "Feel",
          question:
            "Find the older truth: a time you were sure you were done and weren't. What does remembering it do?",
          placeholder: "The time you got up before…",
        },
        {
          key: "d5_tag_become",
          rep: 3,
          label: "Become",
          question:
            "What's the first small motion of standing back up — the next thing you do anyway?",
          placeholder: "The first motion up…",
        },
      ],
    },
    ras: {
      help: "Tell your brain what to look for today. Two people or situations that show resilience in action.",
      prompts: [
        {
          key: "d5_ras_1",
          question:
            "One person you've watched take a brutal hit and get back up. What did they do?",
          placeholder: "Name them and what they did…",
        },
        {
          key: "d5_ras_2",
          question:
            "One past hardship that built something in you that you now rely on. Thank it.",
          placeholder: "The hardship that built you…",
        },
      ],
    },
    verbalEncoding: {
      help: "Speak it — 2 to 3 sentences, out loud, about the scenario. Saying it encodes it deeper than typing.",
      prompt:
        '"Say out loud the hard thing you\'re carrying — then say the time you got up before, and the first thing you\'re doing to stand up now."',
    },
    neuroJournaling: {
      tf: [
        {
          key: "d5_tf_1",
          question:
            "I let today's hard thing be as hard as it was, without forcing a fake silver lining.",
          scenarioTied: true,
        },
        {
          key: "d5_tf_2",
          question: "I reminded myself of a time I got through something worse.",
          scenarioTied: false,
        },
        {
          key: "d5_tf_3",
          question:
            "I took one step forward today even while still carrying the weight.",
          scenarioTied: false,
        },
      ],
      dropdown: [
        {
          key: "d5_dd_1",
          question: "How are you handling the current hit?",
          options: [
            "Standing back up",
            "Sitting on the step, but okay",
            "Still in the rubble",
            "Numb",
            "One day at a time",
          ],
          scenarioTied: false,
        },
        {
          key: "d5_dd_2",
          question: "When you get knocked down, what gets you up fastest?",
          options: [
            "A person",
            "A routine",
            "Remembering past wins",
            "Sheer stubbornness",
            "Faith",
          ],
          scenarioTied: false,
        },
        {
          key: "d5_dd_3",
          question:
            'The scenario said "you have been here before and got up." How true does that feel today?',
          options: [
            "Completely",
            "Mostly",
            "I needed to hear it",
            "Working on believing it",
          ],
          scenarioTied: true,
        },
      ],
      open: [
        {
          key: "d5_open_1",
          question:
            "What hard thing are you carrying right now that you haven't said out loud?",
          placeholder: "Say it here…",
          scenarioTied: true,
        },
        {
          key: "d5_open_2",
          question:
            "Name a time you were certain you'd break and didn't. What got you through?",
          placeholder: "The time you didn't break…",
          scenarioTied: false,
        },
        {
          key: "d5_open_3",
          question:
            'What does "getting up" look like, concretely, for you tomorrow morning?',
          placeholder: "Concretely, tomorrow…",
          scenarioTied: false,
        },
      ],
    },
    mindsetBursting: { prompt: burst("resilience") },
  },

  // ═══════════════════════════════ DAY 6 — PERSPECTIVE ═════════════════════
  {
    day: 6,
    mindset: "Perspective",
    display: { head: "Perspec", glow: "tive" },
    tagline:
      "The mindset that zooms out — so the thing that feels enormous goes back to its actual size.",
    video: { length: "2:10", url: "https://dgynmkwftbrla2it.public.blob.vercel-storage.com/day-6-perspective.mp4" },
    scenario: {
      label: "Live the moment",
      paragraphs: [
        [
          {
            t: "The email sat you down. One line from someone whose opinion you care about, and now it's all you can see. It's been ninety minutes and you've reread it six times. It has eaten the entire evening, the dinner you didn't taste, the conversation you nodded through.",
          },
        ],
        [
          {
            t: "Then you do the thing that's almost impossible in the moment: you zoom out. Will this matter in a week? Probably a little. A year? You can't even remember the equivalent email from last year — and there ",
          },
          { t: "was", tone: "warm" },
          { t: " one. Five years? It won't exist." },
        ],
        [
          {
            t: "The email doesn't change. But its ",
          },
          { t: "size", tone: "warm" },
          {
            t: " does. It shrinks back down from \"the whole sky\" to what it actually is: one line, one moment, one Tuesday, in a life that is much, much larger than this. You get your evening back. Not because the problem vanished — because you remembered how big you are compared to it. ",
          },
          { t: "And how big everything else still is.", tone: "hot" },
        ],
      ],
    },
    neuroTagging: {
      help: "This is the visualization — done by writing it down. Answer as if you're inside the scene.",
      reps: [
        {
          key: "d6_tag_see",
          rep: 1,
          label: "See",
          question:
            'What\'s the "email" in your life right now — the thing that\'s eating more space than it deserves?',
          placeholder: "The thing taking up the sky…",
        },
        {
          key: "d6_tag_feel",
          rep: 2,
          label: "Feel",
          question:
            "When you zoom out to a year from now, five years, what happens to its size?",
          placeholder: "Its size, zoomed out…",
        },
        {
          key: "d6_tag_become",
          rep: 3,
          label: "Become",
          question:
            "What did this thing crowd out tonight that you want to get back — the dinner, the person, the evening?",
          placeholder: "What you want back…",
        },
      ],
    },
    ras: {
      help: "Tell your brain what to look for today. Two people or situations that show perspective in action.",
      prompts: [
        {
          key: "d6_ras_1",
          question:
            "One person who never seems to lose perspective, who keeps small things small. What do they do?",
          placeholder: "Name them and what they do…",
        },
        {
          key: "d6_ras_2",
          question:
            "One thing in your life right now that's genuinely good — that the small stuff has been crowding out. Thank it.",
          placeholder: "The good thing being crowded out…",
        },
      ],
    },
    verbalEncoding: {
      help: "Speak it — 2 to 3 sentences, out loud, about the scenario. Saying it encodes it deeper than typing.",
      prompt:
        '"Say out loud the thing that\'s been taking up too much space — and then say, honestly, whether it\'ll matter in a year, and what you\'re choosing to look at instead."',
    },
    neuroJournaling: {
      tf: [
        {
          key: "d6_tf_1",
          question:
            "Today I caught myself making something small feel like the whole sky.",
          scenarioTied: true,
        },
        {
          key: "d6_tf_2",
          question: "I zoomed out at least once and a problem got smaller.",
          scenarioTied: false,
        },
        {
          key: "d6_tf_3",
          question: "I gave my attention to something that actually matters today.",
          scenarioTied: false,
        },
      ],
      dropdown: [
        {
          key: "d6_dd_1",
          question: "What's been eating more space than it deserves?",
          options: [
            "A work thing",
            "Something someone said",
            "A mistake I made",
            "Money worry",
            "The news",
            "Nothing today",
          ],
          scenarioTied: false,
        },
        {
          key: "d6_dd_2",
          question: "When something feels huge, what helps you shrink it?",
          options: [
            "Time",
            "Talking to someone",
            'Asking "will this matter in a year"',
            "Sleep",
            "Getting outside",
          ],
          scenarioTied: false,
        },
        {
          key: "d6_dd_3",
          question:
            'The scenario asked if the "email" will matter in a year. Your honest answer about yours:',
          options: [
            "No, barely",
            "A little",
            "Yes, but less than now",
            "I needed to ask",
          ],
          scenarioTied: true,
        },
      ],
      open: [
        {
          key: "d6_open_1",
          question:
            "What's been crowding out the good stuff lately, and is it actually as big as it feels?",
          placeholder: "Name it, and its real size…",
          scenarioTied: true,
        },
        {
          key: "d6_open_2",
          question:
            "Name something genuinely good in your life right now that you've been too distracted to enjoy.",
          placeholder: "The good thing you've missed…",
          scenarioTied: false,
        },
        {
          key: "d6_open_3",
          question:
            "A year from now, what will you wish you'd spent tonight's energy on?",
          placeholder: "What's worth tonight's energy…",
          scenarioTied: false,
        },
      ],
    },
    mindsetBursting: { prompt: burst("perspective") },
  },

  // ═══════════════════════════════ DAY 7 — PURPOSE ═════════════════════════
  {
    day: 7,
    mindset: "Purpose",
    display: { head: "Pur", glow: "pose" },
    tagline:
      "The mindset that ties it all together — the reason underneath everything you just trained.",
    video: { length: "2:10", url: "https://dgynmkwftbrla2it.public.blob.vercel-storage.com/day-7-purpose.mp4" },
    scenario: {
      label: "Live the moment",
      paragraphs: [
        [
          {
            t: "It's the end of the week, and the end of something. Seven days ago you started this because some part of you suspected there was more available than \"fine.\" You were right.",
          },
        ],
        [
          {
            t: "Now picture it — not a fantasy, a real Tuesday, eighteen months out. You're moving through an ordinary day, and there's a thread running under all of it: you know what you're ",
          },
          { t: "for.", tone: "warm" },
          {
            t: " Not in a grand, on-a-mountaintop way. In the way you answer a hard email. The way you show up for the person across the table. The way you spend the one resource you can never get back.",
          },
        ],
        [
          {
            t: "That thread has a name, even if you've never said it. It's the answer to the question that's been quietly underneath all seven days: ",
          },
          {
            t: "when it's all said and done, what was the point of you?",
            tone: "warm",
          },
          {
            t: " You don't have to have the perfect answer tonight. You just have to start living like the question matters. Because it does. ",
          },
          { t: "And so, it turns out, do you.", tone: "hot" },
        ],
      ],
    },
    neuroTagging: {
      help: "This is the visualization — done by writing it down. Answer as if you're inside the scene.",
      reps: [
        {
          key: "d7_tag_see",
          rep: 1,
          label: "See",
          question:
            'Picture that ordinary Tuesday eighteen months out, living "on purpose." What are you actually doing?',
          placeholder: "An ordinary day, on purpose…",
        },
        {
          key: "d7_tag_feel",
          rep: 2,
          label: "Feel",
          question:
            'When you sit with "what was the point of you," what rises up — and where do you feel it?',
          placeholder: "What rises, and where…",
        },
        {
          key: "d7_tag_become",
          rep: 3,
          label: "Become",
          question:
            "What's the one way you can start living like the answer matters, starting tomorrow?",
          placeholder: "Starting tomorrow…",
        },
      ],
    },
    ras: {
      help: "Tell your brain what to look for today. Two people or situations that show purpose in action.",
      prompts: [
        {
          key: "d7_ras_1",
          question:
            "One person who clearly knows what they're for — whose life has a thread. What is it, and how do you see it?",
          placeholder: "Name them and their thread…",
        },
        {
          key: "d7_ras_2",
          question:
            "One moment in your life that felt like it was exactly what you were here to do. Thank it.",
          placeholder: "The moment you were made for…",
        },
      ],
    },
    verbalEncoding: {
      help: "Speak it — 2 to 3 sentences, out loud, about the scenario. Saying it encodes it deeper than typing.",
      prompt:
        '"Say out loud your best answer — even an imperfect one — to \'what\'s the point of you?\' Then say the first way you\'ll live like that answer matters."',
    },
    neuroJournaling: {
      tf: [
        {
          key: "d7_tf_1",
          question: 'I have at least a rough answer to "what am I for."',
          scenarioTied: true,
        },
        {
          key: "d7_tf_2",
          question: "This week changed something about how I see my days.",
          scenarioTied: false,
        },
        {
          key: "d7_tf_3",
          question:
            "I did something today that lined up with what actually matters to me.",
          scenarioTied: false,
        },
      ],
      dropdown: [
        {
          key: "d7_dd_1",
          question: "Over these 7 days, what shifted most?",
          options: [
            "How I start my mornings",
            "What I pay attention to",
            "How fast I recover",
            "How I talk to myself",
            "My sense of what's possible",
          ],
          scenarioTied: false,
        },
        {
          key: "d7_dd_2",
          question: "Which mindset hit hardest for you this week?",
          options: [
            "Gratitude",
            "Aspiration",
            "Mission",
            "Hope",
            "Resilience",
            "Perspective",
            "Purpose",
          ],
          scenarioTied: false,
        },
        {
          key: "d7_dd_3",
          question:
            'The scenario asked "what was the point of you?" — where are you with that tonight?',
          options: [
            "I have a real answer",
            "A working draft",
            "Still forming",
            "I'm not afraid of the question anymore",
          ],
          scenarioTied: true,
        },
      ],
      open: [
        {
          key: "d7_open_1",
          question:
            'What\'s your honest, imperfect answer right now to "what am I for?"',
          placeholder: "Imperfect is fine…",
          scenarioTied: true,
        },
        {
          key: "d7_open_2",
          question:
            "Of everything this week, what's the one thing you don't want to let slide back?",
          placeholder: "The one thing to keep…",
          scenarioTied: false,
        },
        {
          key: "d7_open_3",
          question:
            "Eighteen months from now, what do you want to be true that isn't true yet?",
          placeholder: "True in eighteen months…",
          scenarioTied: false,
        },
      ],
    },
    mindsetBursting: { prompt: burst("purpose") },
  },
];

export function getDay(n: number): Day | undefined {
  return DAYS.find((d) => d.day === n);
}

export const TOTAL_DAYS = DAYS.length;
