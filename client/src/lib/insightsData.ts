export interface InsightArticle {
  slug: string;
  title: string;
  summary: string;
  audienceTag: string;
  section: string;
  featured?: boolean;
  readTime?: string;
  bestFor?: string;
  keyQuestion?: string;
  shortAnswer: string;
  sections: {
    heading: string;
    content: string[];
    list?: string[];
  }[];
  practicalSteps: string[];
  howWeHelp: string;
}

export const insightArticles: InsightArticle[] = [
  {
    slug: "accounting-system-startup-needs",
    title: "What accounting system does your startup actually need right now?",
    summary: "Most founders set up accounting software by Googling \"best accounting tool for startups\" and picking whatever comes up first. That decision quietly causes problems six months later. Here is how to choose based on your actual stage.",
    audienceTag: "Accounting basics",
    section: "Accounting basics",
    featured: true,
    readTime: "7 min",
    bestFor: "Founders in their first 12 months, post-revenue",
    keyQuestion: "QuickBooks vs Xero vs Odoo: which one fits where you are?",
    shortAnswer: "The right accounting system depends on your current stage, not which software has the best marketing. Choosing too early or too late both cost you time and money.",
    sections: [
      {
        heading: "Why founders pick the wrong tool",
        content: [
          "Most founders make this decision based on a Google search or a recommendation from a friend who runs a different type of business. The result is a tool that either does too little or imposes complexity you do not need yet.",
          "The question is not which tool is the best overall. The question is which tool fits where you are right now and what you will need in the next twelve months.",
        ],
      },
      {
        heading: "QuickBooks and Xero: for early-stage founders",
        content: [
          "If you have just started generating revenue and you do not have inventory or complex operations, QuickBooks or Xero will do what you need. They are easy to set up, connect to your bank, and give you basic P&L reporting without requiring an accountant to configure them.",
          "The limitation is that both are primarily accounting tools, not operational ones. Once you need to manage inventory, multiple entities, or complex cost of goods reporting, they start to show their limits.",
        ],
      },
      {
        heading: "When to consider Odoo or a full ERP",
        content: [
          "If you are managing physical inventory, running multiple business units, or need operations and finance to be in the same system, an ERP like Odoo becomes worth evaluating. It is not for day one, but founders who wait too long to make the switch often do it under pressure and get it wrong.",
          "The signal that you need an ERP is not revenue size. It is operational complexity.",
        ],
      },
    ],
    practicalSteps: [
      "If you have no accounting software, start with QuickBooks or Xero this week — connect your business bank account and categorise the last 30 days of transactions.",
      "If you are already on QuickBooks or Xero and things feel messy, book one hour to reconcile your accounts before adding more tools.",
      "If you have inventory or multiple cost centres, book a free call to assess whether an ERP makes sense at your stage.",
    ],
    howWeHelp: "We help founders evaluate and implement the right accounting setup for their current stage, whether that is getting basic bookkeeping right or selecting and configuring an ERP that will grow with the business.",
  },
  {
    slug: "startup-books-are-a-mess",
    title: "Why your startup's books are a mess and what to do about it",
    summary: "Running on spreadsheets works until it suddenly does not. Here is the minimum accounting structure every early-stage startup needs before it becomes an emergency.",
    audienceTag: "Accounting basics",
    section: "Accounting basics",
    shortAnswer: "Messy books are almost always a structural problem, not a discipline problem. The fix is simpler than you think, but it needs to happen before your next growth phase.",
    sections: [
      {
        heading: "The real reason startup books get messy",
        content: [
          "It is rarely because the founder is disorganised. It is because accounting gets set up reactively — someone adds a bank account here, a PayPal there, a credit card for a team member — and no one ever connects everything to a single system with clear categories.",
          "By the time you notice the problem, there are six months of transactions to untangle.",
        ],
      },
      {
        heading: "The minimum structure you need",
        content: ["You need three things to have clean books: a dedicated business bank account, accounting software connected to that account, and a consistent set of expense categories. That is it. Everything else comes later."],
        list: [
          "Dedicated business bank account — never mix personal and business",
          "Accounting software connected via bank feed",
          "Consistent expense categories applied every month",
          "Monthly reconciliation — even if it takes only 20 minutes",
        ],
      },
    ],
    practicalSteps: [
      "Open a dedicated business bank account if you have not already.",
      "Connect it to QuickBooks or Xero and import the last three months of transactions.",
      "Create five to ten expense categories that reflect how your business actually spends money.",
      "Set a recurring 30-minute slot each month to reconcile.",
    ],
    howWeHelp: "We help founders build the right accounting structure from the ground up, or clean up an existing mess before it causes problems with investors, lenders, or tax filings.",
  },
  {
    slug: "cash-basis-vs-accrual",
    title: "Cash basis vs accrual accounting: which one is right for your stage?",
    summary: "This is one of the first real accounting decisions founders face. Getting it wrong does not break your business, but it does create unnecessary work later.",
    audienceTag: "Accounting basics",
    section: "Accounting basics",
    shortAnswer: "Cash basis is simpler and works well for early-stage businesses with straightforward transactions. Accrual gives you a more accurate picture of your financial health and is required as you grow.",
    sections: [
      {
        heading: "What the difference actually means",
        content: [
          "Cash basis accounting records income when money hits your account and expenses when you pay them. Accrual accounting records income when it is earned and expenses when they are incurred, regardless of when cash moves.",
          "In practice, this means your P&L can look very different depending on which method you use — especially if you have invoices outstanding or prepaid expenses.",
        ],
      },
      {
        heading: "Which one to use at your stage",
        content: [
          "If you are pre-revenue or early-stage with simple transactions, cash basis is easier to manage and still gives you useful information. If you have inventory, ongoing contracts, or plan to raise funding, you should be on accrual — investors and lenders will expect it.",
        ],
      },
    ],
    practicalSteps: [
      "If you are on cash basis and considering a switch, talk to your accountant before changing — it has tax implications.",
      "If you are setting up accounting for the first time and plan to raise funding in the next 12 months, start on accrual.",
      "If you are unsure which method you are currently using, check your accounting software settings.",
    ],
    howWeHelp: "We help founders understand which method is right for their stage and make the switch without disrupting their existing records.",
  },
  {
    slug: "what-investors-want-financials",
    title: "What investors actually want to see in your financial reporting",
    summary: "When a seed investor asks for your financials, they are not looking for perfection. They are looking for three specific things most first-time founders overlook.",
    audienceTag: "Accounting basics",
    section: "Accounting basics",
    shortAnswer: "Investors do not need perfect financials. They need to see that you understand your numbers and that your business has a credible financial structure.",
    sections: [
      {
        heading: "The three things investors look for",
        content: ["Most first-time founders either send a spreadsheet with no context or apologise for not having proper financials. Neither is the right move."],
        list: [
          "A clean P&L that shows revenue, cost of goods, and operating expenses clearly",
          "A 12-month cash flow forecast with visible assumptions",
          "A one-page summary of your unit economics: CAC, LTV, and gross margin",
        ],
      },
      {
        heading: "What signals poor financial management",
        content: [
          "Sending mixed personal and business expenses, missing categories, or a model that does not reconcile with your actuals tells investors the business is not ready — regardless of how good the product is.",
        ],
      },
    ],
    practicalSteps: [
      "Prepare a clean P&L from your accounting software before your next investor conversation.",
      "Build a 12-month forecast in a spreadsheet with clearly labelled assumptions.",
      "Calculate your gross margin and customer acquisition cost — even rough estimates are better than nothing.",
    ],
    howWeHelp: "We help founders prepare investor-ready financials, including clean P&Ls, cash flow forecasts, and unit economics summaries that hold up to scrutiny.",
  },
  {
    slug: "quickbooks-xero-netsuite-odoo",
    title: "QuickBooks, Xero, NetSuite, Odoo: an honest comparison for early-stage founders",
    summary: "Not a feature list. A plain-language breakdown of which tool fits which stage, what each one costs you in time, and when to switch.",
    audienceTag: "ERP and software",
    section: "ERP and software selection",
    shortAnswer: "No single tool is right for every stage. The question is which one creates the least friction for where you are now and gives you a clear path forward.",
    sections: [
      {
        heading: "QuickBooks: the default choice for a reason",
        content: ["QuickBooks is widely used, easy to set up, and connects to most banks and payment processors. It works well for service businesses and early-stage product companies with simple inventory. Its limitations appear when you need operational integration or multi-entity reporting."],
      },
      {
        heading: "Xero: the cleaner alternative",
        content: ["Xero is slightly more modern in its interface and often preferred by accountants. Its bank reconciliation is clean, its reporting is solid, and it handles multi-currency better than QuickBooks. The ecosystem of integrations is strong."],
      },
      {
        heading: "NetSuite: when you have outgrown the basics",
        content: ["NetSuite is a full ERP, not just accounting software. It handles multi-entity, multi-currency, revenue recognition, and complex inventory. It is expensive and requires implementation support. Most founders who need it know they need it because QuickBooks or Xero is no longer working."],
      },
      {
        heading: "Odoo: the flexible mid-market option",
        content: ["Odoo sits between basic accounting software and a full ERP like NetSuite. It handles accounting, inventory, CRM, and operations in a single system and is significantly cheaper than NetSuite to implement. For product-based businesses or those with operational complexity, it is often the right answer at the growth stage."],
      },
    ],
    practicalSteps: [
      "If you are pre-revenue or early stage with simple transactions: start with QuickBooks or Xero.",
      "If you have inventory or are managing multiple cost centres: evaluate Odoo before assuming you need NetSuite.",
      "If you are on spreadsheets: any of these is better than nothing — pick one and migrate this month.",
    ],
    howWeHelp: "We help founders evaluate which system fits their current stage, implement it correctly, and migrate from their existing setup without losing data or momentum.",
  },
  {
    slug: "when-startup-needs-erp",
    title: "When does a startup actually need an ERP system?",
    summary: "Most founders implement an ERP too late or too early. The signs that tell you it is time are more specific than you think.",
    audienceTag: "ERP and software",
    section: "ERP and software selection",
    shortAnswer: "You do not need an ERP because you are growing fast. You need one when your operations, finance, and inventory can no longer be managed in separate tools without causing errors or blind spots.",
    sections: [
      {
        heading: "The signals that it is time",
        content: ["The trigger for an ERP is not a revenue threshold. It is operational complexity that your current tools cannot handle cleanly."],
        list: [
          "You are managing inventory across multiple locations and your accounting software does not reconcile with your stock counts",
          "Finance and operations are in separate systems and the data does not agree",
          "You are manually consolidating data from multiple tools to produce reports",
          "Your accountant is spending significant time correcting errors caused by disconnected systems",
        ],
      },
      {
        heading: "Why implementing too early creates problems",
        content: ["ERP systems require implementation effort and ongoing configuration. If your business does not yet have the complexity that justifies one, you will spend money and time on a system you are only using at 20% of its capacity. Most of that configuration will need to be redone as the business changes."],
      },
    ],
    practicalSteps: [
      "List the top three data errors or reconciliation problems you deal with each month.",
      "If those errors are caused by disconnected systems, an ERP evaluation is worth starting.",
      "If your problems are caused by process or discipline gaps, fix those first before adding more software.",
    ],
    howWeHelp: "We help founders assess whether an ERP is the right next step, scope the implementation correctly, and avoid the common mistakes that cause ERP projects to go over time and budget.",
  },
  {
    slug: "migrate-accounting-data",
    title: "How to migrate your accounting data without losing three months of your life",
    summary: "Switching financial software is painful by default. It does not have to be. A clear sequence that reduces the risk of getting it wrong.",
    audienceTag: "ERP and software",
    section: "ERP and software selection",
    shortAnswer: "A clean data migration follows a specific sequence. Skipping steps — especially reconciliation before you start — is the most common reason migrations go wrong.",
    sections: [
      {
        heading: "Why migrations fail",
        content: ["Most accounting migrations fail not because of technical problems but because they start without a clean baseline. If your current books have errors, those errors migrate with you — and they become harder to trace in the new system."],
      },
      {
        heading: "The sequence that works",
        content: ["A clean migration has five stages:"],
        list: [
          "Reconcile and close your current books before migrating — do not migrate open issues",
          "Export a clean chart of accounts, outstanding balances, and historical reports",
          "Set up the new system with the correct configuration before importing any data",
          "Import opening balances and verify they match your exported reports",
          "Run both systems in parallel for one month before fully switching",
        ],
      },
    ],
    practicalSteps: [
      "Do not start a migration during a busy period — give yourself a clean month to do it properly.",
      "Reconcile your current books before you begin, not after.",
      "Document your current chart of accounts and expense categories so you can recreate them correctly in the new system.",
    ],
    howWeHelp: "We manage accounting data migrations from QuickBooks, Xero, and spreadsheets into ERP systems, handling everything from data mapping to parallel run verification.",
  },
  {
    slug: "fractional-cfo-what-it-does",
    title: "What a fractional CFO actually does, and whether you need one yet",
    summary: "The term gets used loosely. Here is what fractional CFO work really involves, at what stage it makes sense, and what to look for when you are ready.",
    audienceTag: "Fractional CFO",
    section: "Financial structure and CFO thinking",
    shortAnswer: "A fractional CFO is not a bookkeeper or a tax accountant. They are a strategic financial partner who works part-time inside your business to help you make better decisions with your money.",
    sections: [
      {
        heading: "What fractional CFO work actually involves",
        content: ["The term is used loosely, which creates confusion. At its best, fractional CFO work includes building and maintaining your financial model, interpreting your numbers for strategic decisions, preparing you for fundraising, and managing relationships with investors or lenders."],
        list: [
          "Building and maintaining the financial model",
          "Cash flow forecasting and scenario planning",
          "Fundraising preparation: investor materials, due diligence, cap table",
          "Unit economics analysis and pricing strategy",
          "Managing the relationship with your bookkeeper and external accountant",
        ],
      },
      {
        heading: "When you are ready for one",
        content: ["Most founders do not need a fractional CFO in their first year. You need one when financial decisions are becoming complex enough that you are either making them badly or spending too much of your own time on them. Typical trigger points: Series A preparation, scaling to a team of 10+, or managing a complex cost structure."],
      },
    ],
    practicalSteps: [
      "Before hiring a fractional CFO, make sure your bookkeeping is clean — they cannot do strategic work on top of bad data.",
      "Ask any prospective fractional CFO what the output of their engagement looks like at 90 days.",
      "If you are pre-Series A, a fractional CFO is often more valuable than a full-time hire.",
    ],
    howWeHelp: "We provide fractional CFO-level thinking for early-stage founders who need strategic financial guidance without the cost of a full-time hire.",
  },
  {
    slug: "financial-model-that-works",
    title: "How to build a financial model that your business will actually use",
    summary: "Most startup financial models are built once for a pitch deck and never opened again. A model that works for a real business looks different.",
    audienceTag: "Financial structure",
    section: "Financial structure and CFO thinking",
    shortAnswer: "A useful financial model is not a pitch deck exercise. It is a living document that helps you make decisions about hiring, pricing, and cash — updated at least monthly.",
    sections: [
      {
        heading: "Why most startup models are useless",
        content: ["Pitch deck models are built to impress, not to manage. They contain hockey-stick projections with no basis in actuals, assumptions that are never tested, and no connection to the real cost structure of the business. Once the fundraise is over, no one looks at them again."],
      },
      {
        heading: "What a working model looks like",
        content: ["A model you actually use has three components: a revenue model built on real drivers (not just a growth percentage), a cost structure that reflects what you actually spend, and a cash flow forecast that updates automatically as actuals come in."],
        list: [
          "Revenue built from unit economics: volume × price, not a percentage guess",
          "Costs broken into fixed and variable with clear owners",
          "Cash balance that updates monthly against actuals",
          "Three scenarios: base, conservative, and aggressive",
        ],
      },
    ],
    practicalSteps: [
      "Start with a 13-week cash flow model, not a three-year projection — it is more useful and more honest.",
      "Connect your model to your actual P&L so you can see variance each month.",
      "Update assumptions every quarter based on what you have learned.",
    ],
    howWeHelp: "We build financial models for early-stage founders that are designed to be used, not just presented — connected to real data and updated regularly.",
  },
  {
    slug: "unit-economics-for-founders",
    title: "Unit economics for non-finance founders: what to track and why it matters",
    summary: "You do not need an accounting degree to understand your unit economics. You do need to understand three numbers before you think about scaling.",
    audienceTag: "Financial structure",
    section: "Financial structure and CFO thinking",
    shortAnswer: "Unit economics tell you whether your business model works at the level of a single customer or transaction. If the unit economics are wrong, scaling makes things worse, not better.",
    sections: [
      {
        heading: "The three numbers that matter",
        content: ["You need to know three things: how much it costs to acquire a customer (CAC), how much revenue you make from a customer over their lifetime (LTV), and what percentage of each sale is actual margin after direct costs (gross margin)."],
        list: [
          "Customer Acquisition Cost (CAC): total sales and marketing spend ÷ new customers acquired",
          "Lifetime Value (LTV): average revenue per customer × average customer lifetime",
          "Gross Margin: (revenue − cost of goods sold) ÷ revenue × 100",
        ],
      },
      {
        heading: "What the numbers tell you",
        content: ["If your LTV is less than three times your CAC, you have a growth problem — you are spending too much to acquire customers relative to what they are worth. If your gross margin is below 40% in a software business, you have a cost structure problem."],
      },
    ],
    practicalSteps: [
      "Calculate your CAC for last month using actual spend data.",
      "Estimate your average customer lifetime in months based on churn.",
      "Calculate your gross margin from your P&L — revenue minus direct costs, divided by revenue.",
    ],
    howWeHelp: "We help founders calculate and interpret their unit economics, identify whether the numbers support growth, and fix the gaps before they become a fundraising problem.",
  },
  {
    slug: "financial-foundation-before-first-hire",
    title: "The financial foundation checklist before you hire your first employee",
    summary: "Hiring before your financial systems are ready creates expensive problems. Here is what needs to be in place first, and what order to tackle it.",
    audienceTag: "Operational readiness",
    section: "Operational readiness",
    shortAnswer: "Your first hire changes your cost structure permanently. Before you make it, your financial foundation needs to be solid enough to track that cost accurately and forecast its impact on cash.",
    sections: [
      {
        heading: "What needs to be in place before you hire",
        content: ["Most founders think of hiring as an operational decision. It is also a financial one. Your first employee affects payroll, taxes, benefits, and cash flow in ways that will compound quickly if your systems are not ready."],
        list: [
          "Clean, reconciled books with accurate expense categories",
          "A cash flow forecast that includes the new salary for at least six months",
          "A payroll system set up before day one, not after",
          "An employer identification number and any required registrations in your jurisdiction",
          "A clear understanding of your runway post-hire",
        ],
      },
    ],
    practicalSteps: [
      "Update your cash flow forecast to include the full cost of employment: salary, taxes, and any benefits.",
      "Verify your runway after the hire is at least six months under your conservative scenario.",
      "Set up payroll software before the start date — do not handle payroll manually.",
    ],
    howWeHelp: "We help founders prepare their financial systems for their first hire, including payroll setup, updated forecasting, and compliance checks before day one.",
  },
  {
    slug: "operations-ready-for-growth",
    title: "How to know if your operations are ready for growth before you start pushing",
    summary: "Scaling a broken system just breaks it faster. Three honest questions to ask before you accelerate, and what to fix if the answers are not reassuring.",
    audienceTag: "Operational readiness",
    section: "Operational readiness",
    shortAnswer: "Operational readiness is not about having everything perfect. It is about knowing which gaps will become failures under pressure and fixing those before you add volume.",
    sections: [
      {
        heading: "The three questions to ask",
        content: ["Before you push on growth, answer these honestly:"],
        list: [
          "Can you deliver your product or service consistently at twice the current volume without quality dropping?",
          "Do you know your unit economics well enough to know that more volume means more profit, not more loss?",
          "Are your financial systems accurate enough that you would trust the numbers to make a hiring decision today?",
        ],
      },
      {
        heading: "What to fix first",
        content: ["If the answer to any of those is no, fix that before spending on growth. Growth amplifies what is already there — good and bad. The most common version of this mistake is scaling a business with a margin problem, which just creates a bigger margin problem faster."],
      },
    ],
    practicalSteps: [
      "Map your current delivery process and identify the three steps most likely to fail at double the volume.",
      "Recalculate your unit economics using last month's actuals, not your original projections.",
      "Review your financial model and ask whether it reflects the business you are running today.",
    ],
    howWeHelp: "We help founders assess their operational readiness before a growth push, identify the gaps that will cause problems at scale, and fix the ones that matter most.",
  },
  {
    slug: "first-time-founder-financial-mistakes",
    title: "The financial mistakes first-time founders make in year one, and how to avoid them",
    summary: "Not about spending too much or raising too little. The quieter structural mistakes that create problems you do not notice until month eighteen.",
    audienceTag: "First-time founder",
    section: "Operational readiness",
    shortAnswer: "The most damaging financial mistakes in year one are structural, not behavioural. They are not about discipline — they are about not knowing what you do not know.",
    sections: [
      {
        heading: "The mistakes that matter",
        content: ["The obvious mistakes — overspending, not tracking cash — get talked about a lot. The structural ones are quieter."],
        list: [
          "Mixing personal and business finances, making it impossible to see true profitability",
          "Treating revenue as profit before accounting for cost of goods",
          "Not setting aside money for tax from day one",
          "Building a financial model on optimistic assumptions with no sensitivity testing",
          "Waiting until you have a problem to get financial advice",
        ],
      },
      {
        heading: "Why they are hard to see",
        content: ["These mistakes do not cause immediate pain. The business keeps moving, the bank account looks okay, and everything feels manageable. The problem shows up six to eighteen months later when you try to raise money, file taxes, or scale — and the foundation is not there."],
      },
    ],
    practicalSteps: [
      "Open a separate business bank account this week if you have not already.",
      "Set aside 25% of every payment received into a separate account for tax.",
      "Calculate your actual gross margin on your last five sales — the number may surprise you.",
    ],
    howWeHelp: "We work with first-time founders to build the financial foundation they should have had from day one, without judgement and without jargon.",
  },
];
