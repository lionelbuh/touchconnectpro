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
  revenue: string;
  competitiveAdvantage: string;
  roadmap: string;
  fundingNeeds: string;
  risks: string;
  success: string;
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
  "revenue": "...",
  "competitiveAdvantage": "...",
  "roadmap": "...",
  "fundingNeeds": "...",
  "risks": "...",
  "success": "..."
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
