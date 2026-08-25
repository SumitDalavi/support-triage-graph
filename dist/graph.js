"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTriageGraph = void 0;
const langgraph_1 = require("@langchain/langgraph");
const state_1 = require("./state");
const classifier_1 = require("./nodes/classifier");
const agents_1 = require("./nodes/agents");
// Define the router function
const routeTicket = (state) => {
    if (state.sentiment === "angry" || state.route === "low_conf") {
        return "escalate";
    }
    if (state.route === "billing")
        return "billing";
    if (state.route === "tech")
        return "tech";
    return "general";
};
// Define the graph
const createTriageGraph = () => {
    const graphBuilder = new langgraph_1.StateGraph({ channels: state_1.ticketStateChannels })
        .addNode("classify", classifier_1.classifyTicket)
        .addNode("billing", agents_1.billingAgent)
        .addNode("tech", agents_1.techAgent)
        .addNode("general", agents_1.generalAgent)
        .addNode("escalate", agents_1.humanEscalation)
        // The graph starts at the classify node
        .addEdge(langgraph_1.START, "classify")
        // The conditional routing
        .addConditionalEdges("classify", routeTicket, {
        billing: "billing",
        tech: "tech",
        general: "general",
        escalate: "escalate",
    })
        // All paths end after an agent responds
        .addEdge("billing", langgraph_1.END)
        .addEdge("tech", langgraph_1.END)
        .addEdge("general", langgraph_1.END)
        .addEdge("escalate", langgraph_1.END);
    return graphBuilder.compile();
};
exports.createTriageGraph = createTriageGraph;
