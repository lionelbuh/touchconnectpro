import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export interface RephraseInput {
  answers: Record<string, string>;
}

export interface RephraseOutput {
  answers: Record<string, { original: string; aiEnhanced: string }>;
}

export interface BusinessPlanInput {
  answers: Record<string, string>;
}

export interface BusinessPlanOutput {
  executiveSummary: string;
  problemStatement: string;
  solution: string;
  targetMarket: string;
  marketSize: string;
  revenueModel: string;
  competitiveAdvantage: string;
  roadmap12Month: string;
  fundingRequirements: string;
  risksAndMitigation: string;
  successMetrics: string;
}

const REPHRASE_SYSTEM_PROMPT = `You are an expert business writing assistant helping entrepreneurs refine their startup pitch answers.

Your task is to take each answer and improve it by:
1. Correcting any spelling and grammar errors
2. Rephrasing for clarity and professional tone
3. Making the language more concise and impactful
4. Keeping the original meaning and intent intact

Important guidelines:
- Keep the enhanced answer roughly similar in length to the original (within 20%)
- Use professional but accessible language
- Preserve any specific numbers, names, or data points
- If the original answer is already well-written, make only minor improvements
- Return the improved text directly, not in quotes or with explanations`;

const BUSINESS_PLAN_SYSTEM_PROMPT = `You are an expert business strategist and startup advisor. Your task is to generate a comprehensive business plan based on the entrepreneur's answers to 43 questions about their startup idea.

Create a professional, investor-ready business plan with the following sections. Each section should be 2-4 paragraphs with specific details based on the provided answers:

1. **Executive Summary**: A compelling overview of the business opportunity, key value proposition, target market, and growth potential.

2. **Problem Statement**: Deep dive into the problem being solved, who experiences it, and why it's urgent.

3. **Solution**: Detailed description of the product/service and how it addresses the problem.

4. **Target Market**: Customer segments, demographics, and growth trends.

5. **Market Size & Opportunity**: TAM, SAM, SOM estimates and market growth potential.

6. **Revenue Model & Pricing**: Revenue streams, pricing strategy, and path to profitability.

7. **Competitive Advantage**: What makes this solution unique, competitive landscape, and differentiation.

8. **90-Day Roadmap**: Concrete action plan with milestones and go-to-market strategy for the next quarter.

9. **Funding Requirements**: How much funding is needed and what it will be used for.

10. **Risks & Mitigation**: Key challenges and how they will be addressed.

11. **Success Metrics**: How success will be measured in the first 12 months.

Use the entrepreneur's specific details and numbers where provided. Be specific, actionable, and professional. Avoid generic statements.`;

export async function rephraseAnswers(input: RephraseInput): Promise<RephraseOutput> {
  const result: RephraseOutput = { answers: {} };
  
  const answerEntries = Object.entries(input.answers).filter(([_, value]) => value && value.trim());
  
  const batchPrompt = answerEntries.map(([key, value], index) => 
    `Question ${index + 1} (${key}):\nOriginal: "${value}"`
  ).join("\n\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: REPHRASE_SYSTEM_PROMPT },
      { 
        role: "user", 
        content: `Please improve the following startup pitch answers. Return a JSON object where each key matches the original key and contains the enhanced version.

${batchPrompt}

Return ONLY valid JSON in this exact format:
{
  "key1": "enhanced answer 1",
  "key2": "enhanced answer 2",
  ...
}` 
      }
    ],
    temperature: 0.7,
    response_format: { type: "json_object" }
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  const enhanced = JSON.parse(content);
  
  for (const [key, original] of answerEntries) {
    result.answers[key] = {
      original: original,
      aiEnhanced: enhanced[key] || original
    };
  }

  return result;
}

export async function generateBusinessPlan(input: BusinessPlanInput): Promise<BusinessPlanOutput> {
  const answersText = Object.entries(input.answers)
    .filter(([_, value]) => value && value.trim())
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: BUSINESS_PLAN_SYSTEM_PROMPT },
      { 
        role: "user", 
        content: `Based on these entrepreneur answers, generate a comprehensive business plan:

${answersText}

Return the business plan as a JSON object with these exact keys:
{
  "executiveSummary": "...",
  "problemStatement": "...",
  "solution": "...",
  "targetMarket": "...",
  "marketSize": "...",
  "revenueModel": "...",
  "competitiveAdvantage": "...",
  "roadmap12Month": "...",
  "fundingRequirements": "...",
  "risksAndMitigation": "...",
  "successMetrics": "..."
}

Each field should contain 2-4 well-written paragraphs. Return ONLY valid JSON.`
      }
    ],
    temperature: 0.7,
    response_format: { type: "json_object" }
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  return JSON.parse(content) as BusinessPlanOutput;
}

// Generate meeting questions based on business plan
export interface MeetingQuestionsInput {
  businessPlan: BusinessPlanOutput;
  fullBio?: string;
  ideaName?: string;
}

export interface MeetingQuestionsOutput {
  executiveSummary: string[];
  problemStatement: string[];
  solution: string[];
  targetMarket: string[];
  marketSize: string[];
  revenueModel: string[];
  competitiveAdvantage: string[];
  roadmap12Month: string[];
  fundingRequirements: string[];
  risksAndMitigation: string[];
  successMetrics: string[];
}

const MEETING_QUESTIONS_PROMPT = `You are an experienced mentor and investor advisor helping prepare for a meeting with an entrepreneur.

Review the business plan draft provided and generate insightful questions that a mentor should ask the entrepreneur during their meeting. 

DO NOT rephrase or improve the business plan - instead, identify gaps, unclear areas, assumptions that need validation, and areas where more detail is needed.

For EACH of the 11 business plan sections, provide 2-4 specific, probing questions that will:
1. Clarify vague or missing information
2. Challenge assumptions
3. Dig deeper into the entrepreneur's thinking
4. Help the mentor understand the entrepreneur's preparedness

Make questions specific to the content provided, not generic. Reference specific claims or numbers from the plan.`;

export async function generateMeetingQuestions(input: MeetingQuestionsInput): Promise<MeetingQuestionsOutput> {
  const businessPlanText = Object.entries(input.businessPlan)
    .map(([key, value]) => `**${key}**:\n${value}`)
    .join("\n\n");

  const bioContext = input.fullBio ? `\nEntrepreneur Bio: ${input.fullBio}` : "";
  const ideaContext = input.ideaName ? `\nIdea Name: ${input.ideaName}` : "";

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: MEETING_QUESTIONS_PROMPT },
      { 
        role: "user", 
        content: `Review this business plan and generate meeting questions for the mentor to ask:
${ideaContext}${bioContext}

BUSINESS PLAN:
${businessPlanText}

Return as JSON with these exact keys, each containing an array of 2-4 question strings:
{
  "executiveSummary": ["question 1", "question 2", ...],
  "problemStatement": ["question 1", "question 2", ...],
  "solution": ["question 1", "question 2", ...],
  "targetMarket": ["question 1", "question 2", ...],
  "marketSize": ["question 1", "question 2", ...],
  "revenueModel": ["question 1", "question 2", ...],
  "competitiveAdvantage": ["question 1", "question 2", ...],
  "roadmap12Month": ["question 1", "question 2", ...],
  "fundingRequirements": ["question 1", "question 2", ...],
  "risksAndMitigation": ["question 1", "question 2", ...],
  "successMetrics": ["question 1", "question 2", ...]
}

Return ONLY valid JSON.`
      }
    ],
    temperature: 0.7,
    response_format: { type: "json_object" }
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  return JSON.parse(content) as MeetingQuestionsOutput;
}

// Generate mentor draft response for message thread
export interface MentorDraftInput {
  entrepreneurName: string;
  entrepreneurQuestion: string;
  ideaProposal?: Record<string, any>;
  businessPlan?: Record<string, any>;
  mentorName?: string;
  threadSubject?: string;
}

export interface MentorDraftOutput {
  draft: string;
}

const MENTOR_DRAFT_PROMPT = `You are an experienced business mentor helping prepare a thoughtful response to an entrepreneur's message. Your role is to provide guidance, ask clarifying questions when needed, and offer actionable advice.

Guidelines for your response:
1. Be warm, encouraging, and professional
2. Reference SPECIFIC details from their business plan or idea proposal - use exact numbers, figures, funding amounts, dates, and company names they mentioned
3. When asked about specific data (funding, revenue targets, market size, etc.), quote the exact figures from their documents
4. Provide actionable next steps or thoughtful questions
5. Keep the response concise but substantive (2-4 paragraphs)
6. If their question relates to a specific aspect of their business, tie your answer back to their stated goals using their own words and data
7. Encourage them while also being honest about challenges they may face

IMPORTANT: When the entrepreneur asks about specific information (like funding amounts, revenue projections, dates), find and quote the exact data from their idea proposal and business plan. Do not generalize or paraphrase numbers.

Remember: This is a draft for the mentor to review and personalize before sending.`;

// Helper: Recursively flatten nested objects/arrays into readable key-value lines
function flattenToLines(obj: Record<string, any>, prefix = ""): string[] {
  const lines: string[] = [];
  if (!obj || typeof obj !== 'object') {
    return lines;
  }
  
  for (const [key, val] of Object.entries(obj)) {
    const label = prefix ? `${prefix} > ${key}` : key;
    
    if (val === null || val === undefined) {
      continue;
    } else if (typeof val === 'string' && val.trim()) {
      lines.push(`- ${label}: ${val}`);
    } else if (typeof val === 'number' || typeof val === 'boolean') {
      lines.push(`- ${label}: ${val}`);
    } else if (Array.isArray(val)) {
      // Handle arrays - could be array of objects or primitives
      val.forEach((item, idx) => {
        if (typeof item === 'object' && item !== null) {
          // Check for question/answer format
          if (item.question && item.answer) {
            lines.push(`- ${item.question}: ${item.answer}`);
          } else {
            lines.push(...flattenToLines(item, `${label}[${idx}]`));
          }
        } else if (item && String(item).trim()) {
          lines.push(`- ${label}[${idx}]: ${item}`);
        }
      });
    } else if (typeof val === 'object') {
      // Recurse into nested objects
      lines.push(...flattenToLines(val, label));
    }
  }
  return lines;
}

export async function generateMentorDraftResponse(input: MentorDraftInput): Promise<MentorDraftOutput> {
  // Build context from available data - send FULL data to AI for accuracy
  let contextParts: string[] = [];
  
  contextParts.push(`Entrepreneur: ${input.entrepreneurName}`);
  if (input.threadSubject) {
    contextParts.push(`Conversation Subject: ${input.threadSubject}`);
  }
  
  // Include FULL idea proposal (all 42 questions) - recursively flattened
  if (input.ideaProposal && Object.keys(input.ideaProposal).length > 0) {
    const proposalLines = flattenToLines(input.ideaProposal);
    if (proposalLines.length > 0) {
      contextParts.push(`\n**Entrepreneur's Full Idea Proposal:**\n${proposalLines.join("\n")}`);
    }
    console.log("[AI-DRAFT] Idea proposal lines extracted:", proposalLines.length);
  }
  
  // Include FULL business plan (all 11 sections) - recursively flattened
  if (input.businessPlan && Object.keys(input.businessPlan).length > 0) {
    const planLines = flattenToLines(input.businessPlan);
    if (planLines.length > 0) {
      contextParts.push(`\n**Entrepreneur's Full Business Plan:**\n${planLines.join("\n")}`);
    }
    console.log("[AI-DRAFT] Business plan lines extracted:", planLines.length);
  }
  
  contextParts.push(`\n**Entrepreneur's Latest Message:**\n"${input.entrepreneurQuestion}"`);

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      { role: "system", content: MENTOR_DRAFT_PROMPT },
      { 
        role: "user", 
        content: `Based on the following context, draft a helpful mentor response:

${contextParts.join("\n")}

Write a draft response that the mentor (${input.mentorName || 'Mentor'}) can review and personalize before sending. The response should be helpful, specific to their situation, and actionable.

Return ONLY the draft response text, no additional formatting or explanations.`
      }
    ],
    temperature: 0.7,
    max_tokens: 800
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  return { draft: content };
}
