import { ChatOpenAI } from "@langchain/openai";
import { TicketState } from "../state";
import { z } from "zod";

const classificationSchema = z.object({
  category: z.enum(["billing", "tech", "general", "low_conf"]),
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  sentiment: z.enum(["angry", "neutral", "happy"]),
});

export const classifyTicket = async (state: TicketState): Promise<Partial<TicketState>> => {
  console.log(`[Classifier] Classifying ticket: "${state.customerMessage}"`);
  
  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    temperature: 0,
  });

  const structuredLlm = llm.withStructuredOutput(classificationSchema, {
    name: "ticket_classification",
  });

  const systemPrompt = `Classify this support ticket into exactly one category: billing, tech, or general. 
Also return a confidence score between 0 and 1. 
If confidence < 0.6, category must be 'low_conf'.
Detect the sentiment of the user (angry, neutral, happy).`;

  const result = await structuredLlm.invoke([
    { role: "system", content: systemPrompt },
    { role: "user", content: state.customerMessage }
  ]);

  console.log(`[Classifier] Result: ${JSON.stringify(result)}`);

  return {
    route: result.category,
    confidence: result.confidence,
    reasoning: result.reasoning,
    sentiment: result.sentiment
  };
};
