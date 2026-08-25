export interface TicketState {
  ticketId: string;
  customerMessage: string;
  route?: "billing" | "tech" | "low_conf" | "escalate" | "general";
  confidence?: number;
  reasoning?: string;
  sentiment?: "angry" | "neutral" | "happy";
  response?: string;
  status: "open" | "resolved" | "escalated";
}

// LangGraph requires a reducer map for the state.
// We'll define a simple one that just overwrites the keys.
export const ticketStateChannels = {
  ticketId: null,
  customerMessage: null,
  route: null,
  confidence: null,
  reasoning: null,
  sentiment: null,
  response: null,
  status: null,
};
