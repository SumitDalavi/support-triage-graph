"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generalAgent = exports.humanEscalation = exports.techAgent = exports.billingAgent = void 0;
const openai_1 = require("@langchain/openai");
const billingAgent = async (state) => {
    console.log(`[Billing Agent] Processing ticket: ${state.ticketId}`);
    const llm = new openai_1.ChatOpenAI({ model: "gpt-4o-mini", temperature: 0.2 });
    const systemPrompt = `You handle billing tickets: refunds, invoices, plan changes. 
You have access to get_order() and issue_refund() tools. 
Never issue a refund over $50 without noting it needs manager approval in your response.`;
    const response = await llm.invoke([
        { role: "system", content: systemPrompt },
        { role: "user", content: state.customerMessage }
    ]);
    return {
        response: response.content.toString(),
        status: "resolved"
    };
};
exports.billingAgent = billingAgent;
const techAgent = async (state) => {
    console.log(`[Tech Agent] Processing ticket: ${state.ticketId}`);
    const llm = new openai_1.ChatOpenAI({ model: "gpt-4o-mini", temperature: 0.2 });
    const systemPrompt = `You handle technical support tickets. 
Walk the user through the standard troubleshooting steps for their issue type before suggesting escalation. 
Be concrete — no 'have you tried restarting' without specifics.`;
    const response = await llm.invoke([
        { role: "system", content: systemPrompt },
        { role: "user", content: state.customerMessage }
    ]);
    return {
        response: response.content.toString(),
        status: "resolved"
    };
};
exports.techAgent = techAgent;
const humanEscalation = async (state) => {
    console.log(`[Human Escalation] Escalating ticket: ${state.ticketId}`);
    const response = `This ticket has been escalated to a human agent due to ${state.sentiment === 'angry' ? 'customer sentiment' : 'low AI confidence'}. 
Classifier Reasoning: ${state.reasoning}`;
    return {
        response,
        status: "escalated"
    };
};
exports.humanEscalation = humanEscalation;
const generalAgent = async (state) => {
    console.log(`[General Agent] Processing ticket: ${state.ticketId}`);
    const llm = new openai_1.ChatOpenAI({ model: "gpt-4o-mini", temperature: 0.2 });
    const systemPrompt = `You handle general inquiries. Answer the customer politely.`;
    const response = await llm.invoke([
        { role: "system", content: systemPrompt },
        { role: "user", content: state.customerMessage }
    ]);
    return {
        response: response.content.toString(),
        status: "resolved"
    };
};
exports.generalAgent = generalAgent;
