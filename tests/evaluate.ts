import { classifyTicket } from "../src/nodes/classifier";
import { TicketState } from "../src/state";

// A deterministic evaluation set
const evalDataset = [
  {
    input: "I was charged twice this month! Refund me immediately, I am so angry!",
    expectedCategory: "billing",
    expectedSentiment: "angry"
  },
  {
    input: "My app keeps crashing when I try to upload a PDF.",
    expectedCategory: "tech",
    expectedSentiment: "neutral"
  },
  {
    input: "What are your hours of operation?",
    expectedCategory: "general",
    expectedSentiment: "neutral"
  },
  {
    input: "asdfasdfasdf",
    expectedCategory: "low_conf",
    expectedSentiment: "neutral"
  }
];

async function runEval() {
  console.log("Running Deterministic Evaluation Set...");
  let passed = 0;
  
  for (const [idx, data] of evalDataset.entries()) {
    const state: TicketState = {
      ticketId: `EVAL-${idx}`,
      customerMessage: data.input,
      status: "open"
    };
    
    const result = await classifyTicket(state);
    
    const categoryMatch = result.route === data.expectedCategory;
    const sentimentMatch = result.sentiment === data.expectedSentiment;
    
    if (categoryMatch && sentimentMatch) {
      console.log(`✅ Test ${idx + 1} Passed`);
      passed++;
    } else {
      console.log(`❌ Test ${idx + 1} Failed`);
      console.log(`   Expected: ${data.expectedCategory} / ${data.expectedSentiment}`);
      console.log(`   Got: ${result.route} / ${result.sentiment}`);
    }
  }
  
  console.log(`\nEvaluation Score: ${(passed / evalDataset.length) * 100}%`);
}

runEval().catch(console.error);
