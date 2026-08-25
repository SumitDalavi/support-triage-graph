"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ticketStateChannels = void 0;
// LangGraph requires a reducer map for the state.
// We'll define a simple one that just overwrites the keys.
exports.ticketStateChannels = {
    ticketId: null,
    customerMessage: null,
    route: null,
    confidence: null,
    reasoning: null,
    sentiment: null,
    response: null,
    status: null,
};
