export type LessonStatus = "complete" | "current" | "next" | "locked";
export type ExerciseKind = "multipleChoice" | "response" | "completion";

export type Exercise = {
  id: string;
  kind: ExerciseKind;
  label: string;
  question: string;
  helper: string;
  situation?: string;
  speaker?: string;
  prompt?: string;
  options?: string[];
  correctIndex?: number;
  before?: string;
  after?: string;
  accepted?: string[];
  sampleAnswer?: string;
  explanation: string;
};

export type Lesson = {
  id: string;
  title: string;
  detail: string;
  minutes: number;
  skills: string[];
  baselineStatus: LessonStatus;
  objective: string;
  exercises: Exercise[];
  words?: number;
};

export type Unit = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  focus: string;
  minutes: number;
  skills: string[];
  lessons: Lesson[];
};

export const learner = {
  name: "Alex Morgan",
  level: "B1 · Intermediate",
  baselineStreak: 3,
  bestStreak: 6,
  baselineWords: 116,
};

export const units: Unit[] = [
  {
    id: "unit-1",
    eyebrow: "UNIT 1 · COMPLETED",
    title: "Greetings & Small Talk",
    description:
      "Start and hold a simple conversation: greet people, introduce yourself, and keep small talk going.",
    focus: "Start and hold a simple conversation",
    minutes: 34,
    skills: ["Speaking", "Listening"],
    lessons: [
      {
        id: "lesson-1",
        title: "Saying hello properly",
        detail: "Speaking · 6 min",
        minutes: 6,
        skills: ["Speaking"],
        baselineStatus: "complete",
        objective: "Greet someone and introduce yourself in one natural sentence.",
        exercises: [],
      },
      {
        id: "lesson-2",
        title: "Introducing yourself",
        detail: "Speaking · 7 min",
        minutes: 7,
        skills: ["Speaking", "Vocabulary"],
        baselineStatus: "complete",
        objective: "Share your name, role, and what you are working on.",
        exercises: [],
        words: 6,
      },
      {
        id: "lesson-3",
        title: "Keeping the conversation going",
        detail: "Listening · 8 min",
        minutes: 8,
        skills: ["Listening"],
        baselineStatus: "complete",
        objective: "Follow up with a question instead of letting the conversation stop.",
        exercises: [],
      },
      {
        id: "lesson-4",
        title: "Unit check-in",
        detail: "Mixed practice · 8 min",
        minutes: 8,
        skills: ["Speaking", "Listening", "Vocabulary"],
        baselineStatus: "complete",
        objective: "Pull everything from Unit 1 together in one short conversation.",
        exercises: [],
        words: 6,
      },
    ],
  },
  {
    id: "unit-2",
    eyebrow: "UNIT 2 · CURRENT",
    title: "Everyday Conversations",
    description:
      "Ordering, asking for help, and meeting people — the conversations you actually have every day.",
    focus: "Ordering, asking for help, meeting people",
    minutes: 38,
    skills: ["Speaking", "Listening", "Vocabulary", "Grammar"],
    lessons: [
      {
        id: "lesson-1",
        title: "Greeting a server",
        detail: "Speaking · 5 min",
        minutes: 5,
        skills: ["Speaking"],
        baselineStatus: "complete",
        objective: "Open a service conversation politely and confidently.",
        exercises: [],
      },
      {
        id: "lesson-2",
        title: "Ordering at a café",
        detail: "Speaking · 6 min",
        minutes: 6,
        skills: ["Speaking", "Vocabulary"],
        baselineStatus: "current",
        objective: "Order food and drink politely, and ask for the menu.",
        words: 6,
        exercises: [
          {
            id: "u2l2-ex-1",
            kind: "multipleChoice",
            label: "MULTIPLE CHOICE",
            question: "Which sentence is the most polite way to ask for the menu?",
            helper: "Polite requests in English usually start with “Could” or “May”.",
            options: [
              "Could I see the menu, please?",
              "Give me the menu.",
              "Where menu is?",
            ],
            correctIndex: 0,
            explanation:
              "“Could I see the menu, please?” opens with a polite modal and closes with “please”, so it works in any café.",
          },
          {
            id: "u2l2-ex-2",
            kind: "response",
            label: "CHOOSE THE BEST RESPONSE",
            question: "The server has just walked up to your table.",
            helper: "Think about what sounds natural at the start of a service conversation.",
            speaker: "Server",
            situation: "“Good evening! What can I get for you tonight?”",
            options: [
              "I'd like the soup, please.",
              "I am liking the soup.",
              "The soup it is good.",
            ],
            correctIndex: 0,
            explanation:
              "“I'd like…” is the standard polite way to order. “I am liking” is not used in English for preferences.",
          },
          {
            id: "u2l2-ex-3",
            kind: "completion",
            label: "COMPLETE THE SENTENCE",
            question: "Finish the sentence so it sounds natural and polite.",
            helper: "Use the structure from the previous two exercises.",
            prompt: "You have finished your meal and want to pay.",
            before: "Could we have the",
            after: "please?",
            accepted: ["bill", "check"],
            sampleAnswer: "Could we have the bill, please?",
            explanation:
              "“Could we have the bill, please?” is the natural way to ask to pay in British English. “Check” works the same way in American English.",
          },
        ],
      },
      {
        id: "lesson-3",
        title: "Asking for directions",
        detail: "Speaking · 6 min",
        minutes: 6,
        skills: ["Speaking", "Listening"],
        baselineStatus: "next",
        objective: "Ask where something is and understand the answer.",
        exercises: [],
      },
      {
        id: "lesson-4",
        title: "Unit check-in",
        detail: "Mixed practice · 8 min",
        minutes: 8,
        skills: ["Speaking", "Listening", "Vocabulary", "Grammar"],
        baselineStatus: "locked",
        objective: "Show that you can handle a full everyday conversation.",
        exercises: [],
      },
    ],
  },
  {
    id: "unit-3",
    eyebrow: "UNIT 3 · LOCKED",
    title: "At Work",
    description: "Meetings, email, and updates — English for the workplace.",
    focus: "Meetings, email, and updates",
    minutes: 42,
    skills: ["Speaking", "Grammar"],
    lessons: [
      {
        id: "lesson-1",
        title: "Joining a meeting",
        detail: "Speaking · 8 min",
        minutes: 8,
        skills: ["Speaking", "Vocabulary"],
        baselineStatus: "locked",
        objective: "Introduce yourself on a call and state your role.",
        words: 5,
        exercises: [
          {
            id: "u3l1-ex-1",
            kind: "multipleChoice",
            label: "MULTIPLE CHOICE",
            question: "You join a video call a minute late. What is the natural way to open?",
            helper: "A short apology plus a reason sounds more natural than a long one.",
            options: [
              "Sorry, I'm a minute late — thanks for waiting.",
              "Excuse me, I am late because of the traffic and the weather and my computer.",
              "I am late. Continue.",
            ],
            correctIndex: 0,
            explanation:
              "A brief apology with a light reason keeps the meeting moving. Long explanations draw attention away from the agenda.",
          },
          {
            id: "u3l1-ex-2",
            kind: "response",
            label: "CHOOSE THE BEST RESPONSE",
            question: "Your manager welcomes you to the call.",
            helper: "You want to sound confident, not apologetic, when you introduce yourself.",
            speaker: "Manager",
            situation: "“Morning everyone — we have a new face today. Would you like to introduce yourself?”",
            options: [
              "Hi all, I'm Alex. I look after the billing service.",
              "Hi, I am Alex, and I am sorry, my English is not very good.",
              "Alex. Billing.",
            ],
            correctIndex: 0,
            explanation:
              "Name plus what you work on is the standard work introduction. Apologising for your English shifts focus away from your message.",
          },
          {
            id: "u3l1-ex-3",
            kind: "completion",
            label: "COMPLETE THE SENTENCE",
            question: "Finish the sentence so it sounds professional.",
            helper: "Use a verb that means “to be responsible for”.",
            prompt: "You are describing your role on the call.",
            before: "I",
            after: "the billing service.",
            accepted: ["look after", "take care of", "manage", "run", "handle"],
            sampleAnswer: "I look after the billing service.",
            explanation:
              "“I look after…” and “I take care of…” both describe responsibility naturally in workplace English.",
          },
        ],
      },
      {
        id: "lesson-2",
        title: "Writing a short update",
        detail: "Grammar · 9 min",
        minutes: 9,
        skills: ["Grammar"],
        baselineStatus: "locked",
        objective: "Write three clear sentences about what you finished this week.",
        words: 4,
        exercises: [
          {
            id: "u3l2-ex-1",
            kind: "multipleChoice",
            label: "MULTIPLE CHOICE",
            question: "You finished a task yesterday. Which sentence is correct?",
            helper: "Look at how the verb changes for a finished action in the past.",
            options: [
              "I sent the report yesterday.",
              "I send the report yesterday.",
              "I have sent the report yesterday.",
            ],
            correctIndex: 0,
            explanation:
              "For a finished action with a stated past time (“yesterday”), use the past simple. “Have sent” cannot take “yesterday”.",
          },
          {
            id: "u3l2-ex-2",
            kind: "response",
            label: "CHOOSE THE BEST RESPONSE",
            question: "Your colleague asks for a status update.",
            helper: "Give the status first, then the next step.",
            speaker: "Colleague",
            situation: "“How's the client report going?”",
            options: [
              "It's nearly done — I'll send it over this afternoon.",
              "I will maybe finish it, I think, probably.",
              "It is going.",
            ],
            correctIndex: 0,
            explanation:
              "“It's nearly done — I'll send it over this afternoon” gives a clear status plus a concrete commitment.",
          },
          {
            id: "u3l2-ex-3",
            kind: "completion",
            label: "COMPLETE THE SENTENCE",
            question: "Finish the update so it names a real next step.",
            helper: "Use “going to” for a plan you have already decided.",
            prompt: "You are writing a short weekly update.",
            before: "I",
            after: "the drafts to the client on Thursday.",
            accepted: ["am going to send", "will send", "am sending"],
            sampleAnswer: "I'm going to send the drafts to the client on Thursday.",
            explanation:
              "“I'm going to send…” signals a plan you have already decided, which is exactly what a weekly update should communicate.",
          },
        ],
      },
      {
        id: "lesson-3",
        title: "Asking a clarifying question",
        detail: "Speaking · 7 min",
        minutes: 7,
        skills: ["Speaking"],
        baselineStatus: "locked",
        objective: "Politely check that you understood a request.",
        exercises: [],
      },
      {
        id: "lesson-4",
        title: "Email that sounds friendly",
        detail: "Vocabulary · 9 min",
        minutes: 9,
        skills: ["Vocabulary"],
        baselineStatus: "locked",
        objective: "Write a short email that is warm but professional.",
        exercises: [],
      },
      {
        id: "lesson-5",
        title: "Unit check-in",
        detail: "Mixed practice · 9 min",
        minutes: 9,
        skills: ["Speaking", "Grammar", "Vocabulary"],
        baselineStatus: "locked",
        objective: "Handle a full workday conversation from hello to sign-off.",
        exercises: [],
      },
    ],
  },
];

export const unitById = (id: string) => units.find((unit) => unit.id === id);

export const lessonKey = (unitId: string, lessonId: string) => `${unitId}:${lessonId}`;

export const allLessonKeys = units.flatMap((unit) =>
  unit.lessons.map((lesson) => lessonKey(unit.id, lesson.id)),
);

export const totalLessonCount = units.reduce((sum, unit) => sum + unit.lessons.length, 0);

export const baselineCompletedKeys = units.flatMap((unit) =>
  unit.lessons
    .filter((lesson) => lesson.baselineStatus === "complete")
    .map((lesson) => lessonKey(unit.id, lesson.id)),
);

export const totalWordsAvailable = units.reduce(
  (sum, unit) => sum + unit.lessons.reduce((lessonSum, lesson) => lessonSum + (lesson.words ?? 0), 0),
  0,
);

export const lessonWords = (unitId: string, lessonId: string) => {
  const unit = unitById(unitId);
  const lesson = unit?.lessons.find((item) => item.id === lessonId);
  return lesson?.words ?? 0;
};
