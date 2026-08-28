import { StateGraph, END, START } from "@langchain/langgraph";
import { TicketState, ticketStateChannels } from "./state";
import { classifyTicket } from "./nodes/classifier";
import { billingAgent, techAgent, generalAgent, humanEscalation } from "./nodes/agents";

// Define the router function
const routeTicket = (state: TicketState) => {
  if (state.sentiment === "angry" || state.route === "low_conf") {
    return "escalate";
  }
  
  if (state.route === "billing") return "billing";
  if (state.route === "tech") return "tech";
  
  return "general";
};

// Define the graph
export const createTriageGraph = (checkpointer?: any) => {
  const graphBuilder = new StateGraph<TicketState>({ channels: ticketStateChannels })
    .addNode("classify", classifyTicket)
    .addNode("billing", billingAgent)
    .addNode("tech", techAgent)
    .addNode("general", generalAgent)
    .addNode("escalate", humanEscalation)

    // The graph starts at the classify node
    .addEdge(START, "classify")

    // The conditional routing
    .addConditionalEdges("classify", routeTicket, {
      billing: "billing",
      tech: "tech",
      general: "general",
      escalate: "escalate",
    })

    // All paths end after an agent responds
    .addEdge("billing", END)
    .addEdge("tech", END)
    .addEdge("general", END)
    .addEdge("escalate", END);

  return graphBuilder.compile({ 
    checkpointer,
    interruptBefore: ["escalate"] // Human takeover logic
  });
};
