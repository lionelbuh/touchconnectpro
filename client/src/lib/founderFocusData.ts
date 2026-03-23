export type Dimension = "clarity" | "finance" | "ops";

export type Category = "Strategy" | "Sales" | "Operations" | "Execution";

export const BLOCKER_INFO: Record<Category, { title: string; explanation: string; action: string }> = {
  Strategy: {
    title: "Strategic clarity",
    explanation: "Your primary challenge is around strategy and direction. You may struggle to define your ideal customer, articulate your unique value, or know which opportunity to pursue. Without a clear strategic foundation, effort gets scattered and progress stalls.",
    action: "Set aside two hours this week to write a one-paragraph answer to: who exactly is my ideal customer, what specific problem do I solve for them, and why would they choose me over alternatives. Share it with someone who will give you honest feedback.",
  },
  Sales: {
    title: "Sales and customer acquisition",
    explanation: "Your primary challenge is bringing in customers and revenue. You may have a good product or idea but struggle to get meetings, handle objections, or close deals consistently. Without a repeatable sales process, growth remains unpredictable.",
    action: "Identify five potential customers you have not yet spoken to and reach out to all five this week. Your goal is not to sell — it is to have a 20-minute conversation to understand their situation. One of those conversations will teach you more than a month of planning.",
  },
  Operations: {
    title: "Operational systems",
    explanation: "Your primary challenge is operational. Things keep falling through the cracks, delivery is inconsistent, or day-to-day management consumes most of your time. Without solid systems, you cannot scale without chaos.",
    action: "Pick the one recurring task that causes the most friction or rework each week. Document exactly how it should be done step by step, then hand it off or automate it. Freeing up that single process will have a compounding effect on everything else.",
  },
  Execution: {
    title: "Execution and follow-through",
    explanation: "Your primary challenge is execution. You likely have good ideas and a reasonable plan, but struggle to make consistent progress and see things through to completion. This often shows up as starting many things without finishing them.",
    action: "Choose one project or initiative that matters most to your business right now and commit to working on nothing else until it is done. Write down what done looks like, set a deadline two weeks from today, and share that commitment with someone who will hold you to it.",
  },
};

export interface QuizOption {
  letter: string;
  label: string;
  sub: string;
  value: string;
  scores: Partial<Record<Dimension, number>>;
}

export interface QuizQuestion {
  id: string;
  eyebrow: string;
  text: string;
  sub: string;
  options: QuizOption[];
}

export interface QuizResult {
  raw: { clarity: number; finance: number; ops: number };
  total: number;
  minDim: Dimension;
  diagnosis: { label: string; text: string };
  nextStep: string;
}

export const QUESTIONS: QuizQuestion[] = [
  {
    id: "stage",
    eyebrow: "Your situation",
    text: "Where are you right now with your business?",
    sub: "Be honest. There is no wrong answer and your score depends on accuracy.",
    options: [
      { letter: "A", label: "I have an idea but have not started yet", sub: "Still in the concept or validation phase", value: "idea", scores: { clarity: 20, finance: 10, ops: 10 } },
      { letter: "B", label: "I have started but have no revenue yet", sub: "Building the product or service, early traction", value: "pre-revenue", scores: { clarity: 50, finance: 20, ops: 30 } },
      { letter: "C", label: "I have some revenue but things feel chaotic", sub: "Customers exist but systems are not keeping up", value: "early-revenue", scores: { clarity: 65, finance: 35, ops: 45 } },
      { letter: "D", label: "I am generating consistent revenue and scaling", sub: "Operations are running but financial visibility is limited", value: "scaling", scores: { clarity: 80, finance: 50, ops: 65 } },
    ],
  },
  {
    id: "accounting",
    eyebrow: "Financial structure",
    text: "How would you describe your current accounting setup?",
    sub: "This is one of the most common growth blockers for early-stage founders.",
    options: [
      { letter: "A", label: "I have no real system, just bank transactions", sub: "No accounting software in use", value: "none", scores: { finance: 0 } },
      { letter: "B", label: "I use a spreadsheet to track income and expenses", sub: "Manual tracking, no dedicated software", value: "spreadsheet", scores: { finance: 15 } },
      { letter: "C", label: "I use basic accounting software like QuickBooks or Xero", sub: "Set up but possibly not fully configured", value: "basic", scores: { finance: 35 } },
      { letter: "D", label: "I have a proper system with monthly reconciliation", sub: "Clean books, someone reviews them regularly", value: "proper", scores: { finance: 60 } },
    ],
  },
  {
    id: "cashflow",
    eyebrow: "Cash visibility",
    text: "Can you tell right now how much cash your business will have in 60 days?",
    sub: "Not an estimate. An actual number based on what you know.",
    options: [
      { letter: "A", label: "No idea, I check my bank account when I need to", sub: "No forward visibility", value: "no-visibility", scores: { finance: 0 } },
      { letter: "B", label: "Roughly, but it is more of a feeling than a calculation", sub: "No formal cash flow forecast", value: "rough", scores: { finance: 15 } },
      { letter: "C", label: "I have a basic projection in a spreadsheet", sub: "Manual, updated occasionally", value: "basic-projection", scores: { finance: 35 } },
      { letter: "D", label: "Yes, I have a live cash flow forecast I update regularly", sub: "Clear 60 to 90 day visibility", value: "clear", scores: { finance: 55 } },
    ],
  },
  {
    id: "software",
    eyebrow: "Tools and systems",
    text: "Which best describes the software running your business finances?",
    sub: "The right tool depends on your stage. Most founders are either under or over-equipped.",
    options: [
      { letter: "A", label: "Nothing formal, I manage it manually", sub: "No dedicated finance software", value: "none", scores: { ops: 0 } },
      { letter: "B", label: "QuickBooks or Xero, basic setup", sub: "Useful but possibly not configured for my stage", value: "basic", scores: { ops: 25 } },
      { letter: "C", label: "I am considering or evaluating an ERP system", sub: "NetSuite, Odoo, or similar", value: "erp-considering", scores: { ops: 40 } },
      { letter: "D", label: "I have an ERP system in place and it works for us", sub: "Integrated with operations and finance", value: "erp-live", scores: { ops: 65 } },
    ],
  },
  {
    id: "reporting",
    eyebrow: "Financial reporting",
    text: "If an investor or partner asked for your financials today, what would you send?",
    sub: "This question reveals how investor-ready your financial foundation really is.",
    options: [
      { letter: "A", label: "Nothing, I do not have anything ready", sub: "No financial reports exist", value: "nothing", scores: { finance: 0, clarity: 0 } },
      { letter: "B", label: "A spreadsheet with some numbers", sub: "Informal, not structured as proper reports", value: "spreadsheet", scores: { finance: 10, clarity: 10 } },
      { letter: "C", label: "A basic P&L from my accounting software", sub: "Exists but may not be clean or accurate", value: "basic-pl", scores: { finance: 25, clarity: 20 } },
      { letter: "D", label: "A proper P&L, balance sheet, and cash flow statement", sub: "Clean, reconciled, ready to share", value: "full-reports", scores: { finance: 50, clarity: 35 } },
    ],
  },
  {
    id: "guidance",
    eyebrow: "Outside support",
    text: "Do you currently have any financial or operational guidance from someone outside your business?",
    sub: "A mentor, advisor, accountant, or fractional CFO who knows your numbers.",
    options: [
      { letter: "A", label: "No, I am figuring everything out on my own", sub: "Solo, no external financial perspective", value: "solo", scores: { clarity: 0, ops: 0 } },
      { letter: "B", label: "I have an accountant but only for taxes", sub: "Compliance only, no strategic input", value: "tax-only", scores: { clarity: 15, ops: 15 } },
      { letter: "C", label: "I have a mentor or advisor I talk to occasionally", sub: "Helpful but not deeply involved in my numbers", value: "occasional", scores: { clarity: 30, ops: 25 } },
      { letter: "D", label: "I have someone actively involved in my financial decisions", sub: "Regular involvement, knows my business well", value: "active", scores: { clarity: 50, ops: 45 } },
    ],
  },
  {
    id: "blocker",
    eyebrow: "Your biggest blocker",
    text: "What feels like the biggest thing holding your business back right now?",
    sub: "Pick the one that creates the most friction week to week.",
    options: [
      { letter: "A", label: "I am not sure where to focus or what to prioritize", sub: "Lack of clarity on next steps", value: "clarity", scores: { clarity: -10 } },
      { letter: "B", label: "My financial systems are a mess or do not exist", sub: "Accounting, reporting, or cash visibility", value: "finance", scores: { finance: -15 } },
      { letter: "C", label: "My operations are not ready for where I want to go", sub: "Processes, tools, or team structure", value: "ops", scores: { ops: -15 } },
      { letter: "D", label: "I am moving but not fast enough and I do not know why", sub: "Execution gap, unclear bottleneck", value: "speed", scores: { clarity: -5, ops: -5 } },
    ],
  },
  {
    id: "goal",
    eyebrow: "Your next milestone",
    text: "What is the most important thing you want to accomplish in the next 90 days?",
    sub: "This shapes the concrete next step in your results.",
    options: [
      { letter: "A", label: "Validate my idea and get my first paying customer", sub: "Pre-revenue, proving the concept", value: "validate", scores: { clarity: 10 } },
      { letter: "B", label: "Set up proper accounting and get my finances in order", sub: "Build the financial foundation", value: "accounting-setup", scores: { finance: 10 } },
      { letter: "C", label: "Understand my numbers and build a real financial forecast", sub: "Gain financial visibility and control", value: "forecast", scores: { finance: 10 } },
      { letter: "D", label: "Prepare my business to raise funding or bring on investors", sub: "Investor readiness and financial reporting", value: "fundraise", scores: { clarity: 10, finance: 10 } },
    ],
  },
];

export function computeResults(
  scores: { clarity: number; finance: number; ops: number },
  answers: Record<string, string>
): QuizResult {
  const maxScores = { clarity: 100, finance: 200, ops: 150 };
  const raw = {
    clarity: Math.max(0, Math.min(100, Math.round((scores.clarity / maxScores.clarity) * 100))),
    finance: Math.max(0, Math.min(100, Math.round((scores.finance / maxScores.finance) * 100))),
    ops: Math.max(0, Math.min(100, Math.round((scores.ops / maxScores.ops) * 100))),
  };

  raw.clarity = Math.min(100, raw.clarity + 30);
  raw.finance = Math.min(100, raw.finance + 15);
  raw.ops = Math.min(100, raw.ops + 25);

  const total = Math.round((raw.clarity + raw.finance + raw.ops) / 3);
  const minDim = (Object.entries(raw).sort((a, b) => a[1] - b[1])[0][0]) as Dimension;
  const goal = answers.goal || "accounting-setup";

  const diagnoses: Record<Dimension, { label: string; text: string }> = {
    finance: {
      label: "Financial structure gap",
      text: "Your business clarity and operations are moving in the right direction. The gap is your financial foundation. Without clean books, a real cash flow picture, and the right accounting setup for your stage, you are flying without instruments. This is the most common blocker at your stage and the one that quietly causes the most damage over time.",
    },
    clarity: {
      label: "Direction and focus gap",
      text: "You have some pieces in place but your direction is not yet clear enough to move fast. This shows up as scattered priorities, difficulty explaining your business concisely, and uncertainty about what to do next. Getting clarity on your positioning and next milestone will unlock everything else.",
    },
    ops: {
      label: "Operational readiness gap",
      text: "Your idea is clear and you understand your finances better than most founders at your stage. The gap is your operations. The systems, processes, and tools that need to be in place before you can scale are either missing or not working together. Growth right now would mean scaling problems, not results.",
    },
  };

  const nextSteps: Record<string, string> = {
    validate:
      "Before anything else, have three honest conversations with people who would pay for your product. Not friends. Real potential customers. One insight from those conversations is worth more than a month of building.",
    "accounting-setup":
      "Open a dedicated business bank account this week if you do not have one. Then connect it to a basic accounting tool. QuickBooks or Xero for early stage, Odoo if you are already managing inventory or multiple entities. This is the single highest-leverage hour you can spend on your business right now.",
    forecast:
      "Build a 13-week cash flow forecast in a spreadsheet. Three columns: expected inflows, expected outflows, running balance. Update it every Monday. This single habit will change how you make decisions.",
    fundraise:
      "Before you talk to investors, make sure you can share a clean P&L, a 12-month forecast, and a one-page summary of your unit economics. These three documents will determine how seriously you are taken in the first meeting.",
  };

  return { raw, total, minDim, diagnosis: diagnoses[minDim], nextStep: nextSteps[goal] };
}
