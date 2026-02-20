export type Category = "Strategy" | "Sales" | "Operations" | "Execution";

export type TrackType = "founder" | "consultant" | "future_founder";

export interface SegmentOption {
  text: string;
  track: TrackType;
  label: string;
}

export const SEGMENTATION_QUESTION = {
  question: "Which best describes you right now?",
  options: [
    { text: "I am building my own business", track: "founder" as TrackType, label: "Founder" },
    { text: "I run a service business (consultant, agency, freelancer, coach)", track: "consultant" as TrackType, label: "Consultant" },
    { text: "I am employed but want to start something", track: "future_founder" as TrackType, label: "Future Founder" },
    { text: "I am exploring ideas", track: "founder" as TrackType, label: "Founder" },
  ],
};

export const TRACK_LABELS: Record<TrackType, string> = {
  founder: "Founder / Builder",
  consultant: "Service / Consultant",
  future_founder: "Future Founder",
};

export interface QuizAnswer {
  text: string;
  category: Category;
}

export interface QuizQuestion {
  question: string;
  answers: QuizAnswer[];
}

export const TRACK_QUESTIONS: Record<TrackType, QuizQuestion[]> = {
  founder: [
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
  ],
  consultant: [
    {
      question: "What feels like the biggest bottleneck in scaling your services right now?",
      answers: [
        { text: "I'm not clear on how I stand out from other providers", category: "Strategy" },
        { text: "I don't have a reliable way to generate new leads", category: "Sales" },
        { text: "I'm spending too much time on delivery and admin", category: "Operations" },
        { text: "I know what to do but can't find the time to do it", category: "Execution" },
      ],
    },
    {
      question: "In the next 90 days, what would make the biggest difference to your revenue?",
      answers: [
        { text: "Refining my offer so it's easier to sell", category: "Strategy" },
        { text: "Getting in front of more qualified prospects", category: "Sales" },
        { text: "Streamlining how I deliver and onboard clients", category: "Operations" },
        { text: "Actually launching the offer I've been planning", category: "Execution" },
      ],
    },
    {
      question: "How clear and differentiated is your positioning in the market?",
      answers: [
        { text: "I'm not sure what makes me different from competitors", category: "Strategy" },
        { text: "People get it, but they shop around and choose cheaper options", category: "Sales" },
        { text: "My positioning is clear but operations can't keep up with demand", category: "Operations" },
        { text: "I have a strong position but haven't communicated it well yet", category: "Execution" },
      ],
    },
    {
      question: "Where does most of your time go today?",
      answers: [
        { text: "Researching, planning, and rethinking my approach", category: "Strategy" },
        { text: "Chasing leads, following up, and trying to close", category: "Sales" },
        { text: "Managing projects, clients, and admin tasks", category: "Operations" },
        { text: "Switching between priorities without completing anything", category: "Execution" },
      ],
    },
    {
      question: "How predictable is your lead flow?",
      answers: [
        { text: "I don't have a clear strategy for attracting clients", category: "Strategy" },
        { text: "It's inconsistent — feast or famine", category: "Sales" },
        { text: "I get referrals but can't handle more without better systems", category: "Operations" },
        { text: "I have ideas for lead gen but haven't implemented them", category: "Execution" },
      ],
    },
    {
      question: "What happens when a potential client asks \"Why should we choose you?\"",
      answers: [
        { text: "I struggle to articulate a compelling reason", category: "Strategy" },
        { text: "I explain well but they still don't convert", category: "Sales" },
        { text: "They choose me but onboarding is slow and messy", category: "Operations" },
        { text: "I have a great answer but need to put it into action", category: "Execution" },
      ],
    },
    {
      question: "How confident do you feel about your pricing?",
      answers: [
        { text: "I'm not sure if I'm priced too high or too low", category: "Strategy" },
        { text: "I know my value but clients push back on price", category: "Sales" },
        { text: "My pricing works but margins are thin due to overhead", category: "Operations" },
        { text: "I've researched pricing but haven't updated my rates yet", category: "Execution" },
      ],
    },
    {
      question: "If you had the right support, what would you want to optimize first?",
      answers: [
        { text: "My offer and market positioning", category: "Strategy" },
        { text: "My lead generation and sales process", category: "Sales" },
        { text: "My systems, team, and delivery workflow", category: "Operations" },
        { text: "My focus and follow-through on key priorities", category: "Execution" },
      ],
    },
  ],
  future_founder: [
    {
      question: "What is the main reason you want to start something of your own?",
      answers: [
        { text: "I want more freedom to shape my own direction", category: "Strategy" },
        { text: "I want to earn more and build real financial independence", category: "Sales" },
        { text: "I want to escape the corporate grind and work on my terms", category: "Operations" },
        { text: "I have an idea burning inside me that I need to pursue", category: "Execution" },
      ],
    },
    {
      question: "What is stopping you from taking the first real step?",
      answers: [
        { text: "I don't know where to start or what business to build", category: "Strategy" },
        { text: "I'm worried I won't be able to make money from it", category: "Sales" },
        { text: "I don't have enough time alongside my current job", category: "Operations" },
        { text: "Fear of failure and what others might think", category: "Execution" },
      ],
    },
    {
      question: "Do you already have a clear business idea?",
      answers: [
        { text: "No, I'm still exploring and brainstorming", category: "Strategy" },
        { text: "I have a concept but I'm not sure anyone would pay for it", category: "Sales" },
        { text: "I have an idea but don't know how to structure it", category: "Operations" },
        { text: "Yes, I know what I want to build but haven't started", category: "Execution" },
      ],
    },
    {
      question: "How confident do you feel about turning an idea into income?",
      answers: [
        { text: "Not at all — I don't understand how businesses really work", category: "Strategy" },
        { text: "I understand the basics but selling feels uncomfortable", category: "Sales" },
        { text: "I could do it if I had the right tools and guidance", category: "Operations" },
        { text: "I'm confident but keep procrastinating on actually doing it", category: "Execution" },
      ],
    },
    {
      question: "How much time per week could you realistically invest?",
      answers: [
        { text: "Less than 2 hours — I need to figure things out first", category: "Strategy" },
        { text: "2-5 hours — but only if I see a clear path to revenue", category: "Sales" },
        { text: "5-10 hours — but I need structure and a plan", category: "Operations" },
        { text: "10+ hours — I'm ready, I just need to commit", category: "Execution" },
      ],
    },
    {
      question: "What scares you most about starting?",
      answers: [
        { text: "Picking the wrong idea and wasting time", category: "Strategy" },
        { text: "Not making enough money to justify leaving my job", category: "Sales" },
        { text: "Not being able to manage everything on top of life", category: "Operations" },
        { text: "Actually putting myself out there and possibly failing", category: "Execution" },
      ],
    },
    {
      question: "Do you feel you have people around you who understand your ambition?",
      answers: [
        { text: "No, and I feel like I'm figuring this out alone", category: "Strategy" },
        { text: "Some, but no one who can help me with the business side", category: "Sales" },
        { text: "Yes, but I need more practical support and accountability", category: "Operations" },
        { text: "I have supporters but I still can't get myself to start", category: "Execution" },
      ],
    },
    {
      question: "What would need to happen for you to finally say \"I am doing this\"?",
      answers: [
        { text: "I need a clear, validated idea I believe in", category: "Strategy" },
        { text: "I need proof that I can actually make money from it", category: "Sales" },
        { text: "I need a step-by-step plan that fits my schedule", category: "Operations" },
        { text: "I just need to stop overthinking and take the leap", category: "Execution" },
      ],
    },
  ],
};

export const QUIZ_QUESTIONS = TRACK_QUESTIONS.founder;

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
  topBlocker?: string;
  overallScore?: number;
  track?: TrackType;
}

export function calculateResults(answers: number[], track: TrackType = "founder"): QuizResult {
  const questions = TRACK_QUESTIONS[track];
  const scores: Record<Category, number> = {
    Strategy: 0,
    Sales: 0,
    Operations: 0,
    Execution: 0,
  };

  answers.forEach((answerIndex, questionIndex) => {
    if (answerIndex >= 0 && answerIndex < 4 && questions[questionIndex]) {
      const category = questions[questionIndex].answers[answerIndex].category;
      scores[category] += 10;
    }
  });

  const maxPossible = questions.length * 10;

  const categories: Category[] = ["Strategy", "Sales", "Operations", "Execution"];
  const primaryBlocker = categories.reduce((max, cat) =>
    scores[cat] > scores[max] ? cat : max
  , categories[0]);

  const maxCategoryScore = scores[primaryBlocker];
  const totalScore = Math.round(100 - ((maxCategoryScore / maxPossible) * 40));

  const categoryResults: CategoryResult[] = categories.map((cat) => ({
    category: cat,
    score: scores[cat],
    percentage: Math.round((scores[cat] / maxPossible) * 100),
  }));

  categoryResults.sort((a, b) => b.score - a.score);

  const overallScore = Math.round((totalScore / 100) * 10);

  return { totalScore, primaryBlocker, scores, categoryResults, topBlocker: BLOCKER_INFO[primaryBlocker].title, overallScore, track };
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

export const TRACK_BLOCKER_INFO: Record<TrackType, Record<Category, { title: string; explanation: string; action: string }>> = {
  founder: {
    Strategy: {
      title: "Strategy & Direction",
      explanation: "Your biggest growth blocker is a lack of strategic clarity. You may be unsure about your target market, value proposition, or competitive positioning. Without a clear direction, effort gets scattered and progress stalls.",
      action: "Define your ideal customer profile and write a one-sentence value proposition that clearly explains who you help and how. Test it with 5 people this week.",
    },
    Sales: {
      title: "Sales & Revenue",
      explanation: "Your biggest growth blocker is revenue generation. You may have a good product or idea but struggle to convert interest into paying customers. Without consistent sales, the business can't sustain itself.",
      action: "Identify your 3 most promising leads and reach out to each one this week with a specific offer. Track what objections come up and how you handle them.",
    },
    Operations: {
      title: "Operations & Systems",
      explanation: "Your biggest growth blocker is operational efficiency. You may be spending too much time on manual tasks, firefighting, or managing processes that don't scale. This drains energy and limits growth.",
      action: "List the 3 tasks you repeat most often each week and identify one that could be automated, delegated, or eliminated. Implement that change within 7 days.",
    },
    Execution: {
      title: "Execution & Follow-Through",
      explanation: "Your biggest growth blocker is execution speed. You may have solid ideas and plans but struggle to turn them into finished work. Without shipping, nothing gets validated or generates results.",
      action: "Pick the one project or task that would create the most impact if completed. Break it into 3 steps and commit to finishing the first step by end of day tomorrow.",
    },
  },
  consultant: {
    Strategy: {
      title: "Positioning & Differentiation",
      explanation: "Your biggest growth blocker is positioning. You may struggle to articulate what makes your service unique, making it hard for prospects to see why they should choose you over competitors.",
      action: "Write down 3 things that make your service different from alternatives. Then craft a one-line positioning statement: 'I help [who] achieve [what] through [how].' Share it with 3 prospects this week.",
    },
    Sales: {
      title: "Lead Flow & Conversion",
      explanation: "Your biggest growth blocker is inconsistent lead generation and conversion. Without a predictable pipeline, revenue swings between feast and famine, making it impossible to plan or grow sustainably.",
      action: "Map your current lead sources and identify which one has the highest conversion rate. Double down on that channel this week by reaching out to 5 new prospects using that method.",
    },
    Operations: {
      title: "Delivery & Systems",
      explanation: "Your biggest growth blocker is operational overhead. You may be spending too much time on client delivery, admin, and firefighting instead of growing the business. Without systems, you can't scale beyond your own capacity.",
      action: "Document your client onboarding process step by step. Identify one step you can automate or template. Implement it this week to save time on every new client.",
    },
    Execution: {
      title: "Focus & Follow-Through",
      explanation: "Your biggest growth blocker is execution. You likely have plenty of ideas and even a solid strategy, but competing priorities and distractions prevent you from completing what matters most.",
      action: "Choose the one initiative that would most impact your revenue if completed. Block 2 hours on your calendar this week dedicated solely to advancing it. No client work, no admin — just this.",
    },
  },
  future_founder: {
    Strategy: {
      title: "Clarity & Direction",
      explanation: "Your biggest blocker is not knowing where to begin. Without a clear idea or direction, it's easy to stay stuck in research mode. The key is narrowing down your options and validating one idea quickly.",
      action: "Write down 3 problems you've personally experienced or heard others complain about. Pick the one you're most passionate about and talk to 3 people who have that problem this week.",
    },
    Sales: {
      title: "Confidence in Monetization",
      explanation: "Your biggest blocker is uncertainty about whether you can actually make money. This fear of not earning enough keeps you from committing. The key is proving to yourself that people will pay — even before you build anything.",
      action: "Find one person in your network who has the problem your idea solves. Offer to help them for a small fee or in exchange for a testimonial. This is your first proof of concept.",
    },
    Operations: {
      title: "Time & Structure",
      explanation: "Your biggest blocker is feeling like you don't have enough time or structure to get started. Between your job and personal life, entrepreneurship feels impossible without a clear, manageable plan.",
      action: "Block 3 hours this weekend for 'founder time.' Use the first hour to outline your idea, the second to research one competitor, and the third to write down your next 3 steps.",
    },
    Execution: {
      title: "Taking the Leap",
      explanation: "Your biggest blocker is overthinking instead of acting. You may already know what you want to do, but fear, perfectionism, or waiting for the 'right moment' keeps you stuck. The right moment is now.",
      action: "Tell one person you trust about your business idea today. Then take one small public action — register a domain, post about your idea, or set up a simple landing page. Movement creates momentum.",
    },
  },
};
