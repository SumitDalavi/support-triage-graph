"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.classifyTicket = void 0;
const openai_1 = require("@langchain/openai");
const zod_1 = require("zod");
const classificationSchema = zod_1.z.object({
    category: zod_1.z.enum(["billing", "tech", "general", "low_conf"]),
    confidence: zod_1.z.number().min(0).max(1),
    reasoning: zod_1.z.string(),
    sentiment: zod_1.z.enum(["angry", "neutral", "happy"]),
});
const classifyTicket = async (state) => {
    console.log(`[Classifier] Classifying ticket: "${state.customerMessage}"`);
    const llm = new openai_1.ChatOpenAI({
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
exports.classifyTicket = classifyTicket;
