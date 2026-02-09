export type Category = "Strategy" | "Sales" | "Operations" | "Execution";

export interface QuizAnswer {
  text: string;
  category: Category;
}

export interface QuizQuestion {
  question: string;
  answers: QuizAnswer[];
}

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    question: "What feels like the biggest obstacle to growing your business right now?",
    answers: [
      { text: "I'm not sure who my ideal customer really is", category: "Strategy" },
      { text: "I struggle to get meetings or close deals", category: "Sales" },
      { text: "I'm overwhelmed by day-to-day tasks and processes", category: "Operations" },
      { text: "I have ideas but can't seem to make them happen", category: "Execution" },
    ],
  },
  {
    question: "When you think about the next 90 days, what concerns you most?",
    answers: [
      { text: "I don't have a clear plan or direction", category: "Strategy" },
      { text: "I don't have enough revenue coming in", category: "Sales" },
      { text: "Things keep falling through the cracks", category: "Operations" },
      { text: "I keep starting things but not finishing them", category: "Execution" },
    ],
  },
  {
    question: "How would you describe your current product or service offering?",
    answers: [
      { text: "I'm still trying to figure out what to offer", category: "Strategy" },
      { text: "I have something good but can't get people to buy it", category: "Sales" },
      { text: "It works but delivering it is messy and inconsistent", category: "Operations" },
      { text: "I know what to build but haven't finished building it", category: "Execution" },
    ],
  },
  {
    question: "What best describes how you spend most of your time?",
    answers: [
      { text: "Thinking and researching but not deciding", category: "Strategy" },
      { text: "Trying to find leads and convince people to pay", category: "Sales" },
      { text: "Managing tools, people, or processes that aren't working well", category: "Operations" },
      { text: "Jumping between tasks without making real progress", category: "Execution" },
    ],
  },
  {
    question: "If a mentor could help you with one thing, what would it be?",
    answers: [
      { text: "Clarifying my vision and competitive positioning", category: "Strategy" },
      { text: "Building a repeatable way to acquire customers", category: "Sales" },
      { text: "Setting up systems so things run smoothly", category: "Operations" },
      { text: "Holding me accountable to actually ship things", category: "Execution" },
    ],
  },
  {
    question: "What happens when you try to explain your business to someone new?",
    answers: [
      { text: "I give a different answer every time", category: "Strategy" },
      { text: "They understand but don't seem interested in buying", category: "Sales" },
      { text: "They're interested but I can't deliver at scale yet", category: "Operations" },
      { text: "I explain it well but haven't launched or shipped yet", category: "Execution" },
    ],
  },
  {
    question: "How do you feel about your team or resources right now?",
    answers: [
      { text: "I'm not sure what roles I need or what to delegate", category: "Strategy" },
      { text: "I need someone who can sell but can't afford to hire yet", category: "Sales" },
      { text: "I have people but coordination is a constant challenge", category: "Operations" },
      { text: "I have what I need but keep getting stuck on priorities", category: "Execution" },
    ],
  },
  {
    question: "What would make you feel like you're finally making real progress?",
    answers: [
      { text: "Having a clear roadmap I believe in", category: "Strategy" },
      { text: "Seeing consistent revenue growth month over month", category: "Sales" },
      { text: "Running my business without everything depending on me", category: "Operations" },
      { text: "Launching the thing I've been planning for months", category: "Execution" },
    ],
  },
];

export interface CategoryResult {
  category: Category;
  score: number;
  percentage: number;
}

export interface QuizResult {
  totalScore: number;
  primaryBlocker: Category;
  scores: Record<Category, number>;
  categoryResults: CategoryResult[];
}

export function calculateResults(answers: number[]): QuizResult {
  const scores: Record<Category, number> = {
    Strategy: 0,
    Sales: 0,
    Operations: 0,
    Execution: 0,
  };

  answers.forEach((answerIndex, questionIndex) => {
    if (answerIndex >= 0 && answerIndex < 4) {
      const category = QUIZ_QUESTIONS[questionIndex].answers[answerIndex].category;
      scores[category] += 10;
    }
  });

  const maxPossible = 80;

  const categories: Category[] = ["Strategy", "Sales", "Operations", "Execution"];
  const primaryBlocker = categories.reduce((max, cat) =>
    scores[cat] > scores[max] ? cat : max
  , categories[0]);

  const maxCategoryScore = scores[primaryBlocker];
  const totalScore = Math.round(100 - ((maxCategoryScore / 80) * 40));

  const categoryResults: CategoryResult[] = categories.map((cat) => ({
    category: cat,
    score: scores[cat],
    percentage: Math.round((scores[cat] / maxPossible) * 100),
  }));

  categoryResults.sort((a, b) => b.score - a.score);

  return { totalScore, primaryBlocker, scores, categoryResults };
}

export const BLOCKER_INFO: Record<Category, { title: string; explanation: string; action: string; color: string; icon: string }> = {
  Strategy: {
    title: "Strategy & Direction",
    explanation: "Your biggest growth blocker is a lack of strategic clarity. You may be unsure about your target market, value proposition, or competitive positioning. Without a clear direction, effort gets scattered and progress stalls.",
    action: "Define your ideal customer profile and write a one-sentence value proposition that clearly explains who you help and how. Test it with 5 people this week.",
    color: "indigo",
    icon: "Compass",
  },
  Sales: {
    title: "Sales & Revenue",
    explanation: "Your biggest growth blocker is revenue generation. You may have a good product or idea but struggle to convert interest into paying customers. Without consistent sales, the business can't sustain itself.",
    action: "Identify your 3 most promising leads and reach out to each one this week with a specific offer. Track what objections come up and how you handle them.",
    color: "emerald",
    icon: "DollarSign",
  },
  Operations: {
    title: "Operations & Systems",
    explanation: "Your biggest growth blocker is operational efficiency. You may be spending too much time on manual tasks, firefighting, or managing processes that don't scale. This drains energy and limits growth.",
    action: "List the 3 tasks you repeat most often each week and identify one that could be automated, delegated, or eliminated. Implement that change within 7 days.",
    color: "amber",
    icon: "Settings",
  },
  Execution: {
    title: "Execution & Follow-Through",
    explanation: "Your biggest growth blocker is execution speed. You may have solid ideas and plans but struggle to turn them into finished work. Without shipping, nothing gets validated or generates results.",
    action: "Pick the one project or task that would create the most impact if completed. Break it into 3 steps and commit to finishing the first step by end of day tomorrow.",
    color: "cyan",
    icon: "Rocket",
  },
};
