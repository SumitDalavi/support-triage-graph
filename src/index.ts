import "dotenv/config";
import { createTriageGraph } from "./graph";
import { TicketState } from "./state";

async function run() {
  const app = createTriageGraph();

  const tickets = [
    {
      ticketId: "TICKET-001",
      customerMessage: "I was charged twice this month! Refund me immediately, I am so angry!",
      status: "open" as const
    },
    {
      ticketId: "TICKET-002",
      customerMessage: "My app keeps crashing when I try to upload a PDF.",
      status: "open" as const
    },
    {
      ticketId: "TICKET-003",
      customerMessage: "Can I get a copy of my invoice for last year?",
      status: "open" as const
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
