import { ChatOpenAI } from "@langchain/openai";
import { TicketState } from "../state";

export const billingAgent = async (state: TicketState): Promise<Partial<TicketState>> => {
  console.log(`[Billing Agent] Processing ticket: ${state.ticketId}`);
  
  const llm = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0.2 });
  
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

export const techAgent = async (state: TicketState): Promise<Partial<TicketState>> => {
  console.log(`[Tech Agent] Processing ticket: ${state.ticketId}`);
  
  const llm = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0.2 });
  
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

export const humanEscalation = async (state: TicketState): Promise<Partial<TicketState>> => {
  console.log(`[Human Escalation] Escalating ticket: ${state.ticketId}`);
  
  const response = `This ticket has been escalated to a human agent due to ${state.sentiment === 'angry' ? 'customer sentiment' : 'low AI confidence'}. 
Classifier Reasoning: ${state.reasoning}`;

  return {
    response,
    status: "escalated"
  };
};

export const generalAgent = async (state: TicketState): Promise<Partial<TicketState>> => {
  console.log(`[General Agent] Processing ticket: ${state.ticketId}`);
  
  const llm = new ChatOpenAI({ model: "gpt-4o-mini", temperature: 0.2 });
  
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
