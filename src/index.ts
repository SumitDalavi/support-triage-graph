import "dotenv/config";
import { createTriageGraph } from "./graph";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { Pool } from "pg";

async function run() {
  const pool = new Pool({
    user: process.env.POSTGRES_USER || "postgres",
    password: process.env.POSTGRES_PASSWORD || "postgres",
    database: process.env.POSTGRES_DB || "langgraph_checkpoints",
    host: process.env.POSTGRES_HOST || "localhost",
    port: 5432,
  });

  const checkpointer = new PostgresSaver(pool);
  await checkpointer.setup();

  const app = createTriageGraph(checkpointer);

  let tickets = [];
  try {
    const zendeskUrl = process.env.ZENDESK_URL || "http://localhost:8080/api/v2/tickets.json";
    const res = await fetch(zendeskUrl);
    const data = await res.json();
    tickets = data.tickets.map((t: any) => ({
      ticketId: `TICKET-${t.id}`,
      customerMessage: t.description,
      status: t.status
    }));
    console.log(`Fetched ${tickets.length} tickets from Zendesk`);
  } catch (err) {
    console.warn("Failed to fetch from Zendesk, using fallback tickets", err);
    tickets = [
      {
        ticketId: "TICKET-001",
        customerMessage: "I was charged twice this month! Refund me immediately, I am so angry!",
        status: "open" as const
      },
      {
        ticketId: "TICKET-002",
        customerMessage: "My app keeps crashing when I try to upload a PDF.",
        status: "open" as const
      }
    ];
  }

  for (const ticket of tickets) {
    const thread_id = ticket.ticketId;
    console.log(`\n=========================================`);
    console.log(`🎫 Processing Ticket: ${ticket.ticketId}`);
    console.log(`💬 Message: "${ticket.customerMessage}"`);
    console.log(`=========================================\n`);

    const result = await app.invoke(ticket, { configurable: { thread_id } });

    console.log(`\n✅ Graph paused or ended:`);
    console.log(`- Route Taken: ${result.route}`);
    console.log(`- Confidence: ${result.confidence}`);
    console.log(`- Sentiment: ${result.sentiment}`);
    console.log(`- Status: ${result.status}`);
    
    // HUMAN TAKEOVER LOGIC
    const stateSnapshot = await app.getState({ configurable: { thread_id } });
    if (stateSnapshot.next && stateSnapshot.next.includes("escalate")) {
      console.log(`\n⚠️ HUMAN TAKEOVER REQUIRED for ${ticket.ticketId}`);
      console.log(`Agent: "I'm stepping in to handle this angry or confusing ticket."`);
      
      // We manually update the state
      await app.updateState({ configurable: { thread_id } }, { 
        response: "A human agent has reviewed and resolved your issue.",
        status: "resolved" 
      }, "escalate");
      
      // Resume the graph with the human input injected
      const finalResult = await app.invoke(null, { configurable: { thread_id } });
      console.log(`✅ Ticket Resolved by Human:`, finalResult.response);
      Object.assign(result, finalResult);
    } else {
      console.log(`- Response: ${result.response}\n`);
    }

    // REAL TICKET API SANDBOX
    // Update the ticket in the sandbox via PUT request
    try {
      const ticketIdNum = ticket.ticketId.split('-')[1];
      const zendeskPutUrl = process.env.ZENDESK_URL_PUT || `http://localhost:8080/api/v2/tickets/${ticketIdNum}.json`;
      await fetch(zendeskPutUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket: { status: result.status, comment: result.response } })
      });
      console.log(`📨 Synced resolution back to Ticket API Sandbox for ${ticket.ticketId}`);
    } catch (err) {
      console.warn("Failed to sync to Zendesk API Sandbox");
    }
  }
}

run().catch(console.error);
