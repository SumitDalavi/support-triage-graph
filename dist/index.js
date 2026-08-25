"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const graph_1 = require("./graph");
async function run() {
    const app = (0, graph_1.createTriageGraph)();
    const tickets = [
        {
            ticketId: "TICKET-001",
            customerMessage: "I was charged twice this month! Refund me immediately, I am so angry!",
            status: "open"
        },
        {
            ticketId: "TICKET-002",
            customerMessage: "My app keeps crashing when I try to upload a PDF.",
            status: "open"
        },
        {
            ticketId: "TICKET-003",
            customerMessage: "Can I get a copy of my invoice for last year?",
            status: "open"
        }
    ];
    for (const ticket of tickets) {
        console.log(`\n=========================================`);
        console.log(`🎫 Processing Ticket: ${ticket.ticketId}`);
        console.log(`💬 Message: "${ticket.customerMessage}"`);
        console.log(`=========================================\n`);
        const result = await app.invoke(ticket);
        console.log(`\n✅ Final State:`);
        console.log(`- Route Taken: ${result.route}`);
        console.log(`- Confidence: ${result.confidence}`);
        console.log(`- Sentiment: ${result.sentiment}`);
        console.log(`- Status: ${result.status}`);
        console.log(`- Response: ${result.response}\n`);
    }
}
run().catch(console.error);
