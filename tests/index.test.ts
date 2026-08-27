import { classifyTicket } from '../src/nodes/classifier';
import { billingAgent, techAgent, humanEscalation, generalAgent } from '../src/nodes/agents';
import { createTriageGraph } from '../src/graph';
import { TicketState } from '../src/state';

// Mock ChatOpenAI
const mockInvoke = jest.fn();
jest.mock('@langchain/openai', () => {
  return {
    ChatOpenAI: jest.fn().mockImplementation(() => {
      return {
        withStructuredOutput: jest.fn().mockReturnValue({
          invoke: mockInvoke
        }),
        invoke: mockInvoke
      };
    })
  };
});

describe('Support Triage Graph Components', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Classifier Node', () => {
    it('should classify ticket correctly', async () => {
      mockInvoke.mockResolvedValueOnce({
        category: 'tech',
        confidence: 0.9,
        reasoning: 'Mentioned bug',
        sentiment: 'neutral'
      });
      
      const state: TicketState = { ticketId: '1', customerMessage: 'App crashes', status: 'open' };
      const result = await classifyTicket(state);
      
      expect(result.route).toBe('tech');
      expect(result.confidence).toBe(0.9);
      expect(result.sentiment).toBe('neutral');
    });
  });

  describe('Agents', () => {
    it('billingAgent should resolve', async () => {
      mockInvoke.mockResolvedValueOnce({ content: 'I can refund this.' });
      const state: TicketState = { ticketId: '1', customerMessage: 'Refund me', status: 'open' };
      const result = await billingAgent(state);
      expect(result.status).toBe('resolved');
      expect(result.response).toBe('I can refund this.');
    });

    it('techAgent should resolve', async () => {
      mockInvoke.mockResolvedValueOnce({ content: 'Restart it.' });
      const state: TicketState = { ticketId: '1', customerMessage: 'Broken', status: 'open' };
      const result = await techAgent(state);
      expect(result.status).toBe('resolved');
      expect(result.response).toBe('Restart it.');
    });

    it('generalAgent should resolve', async () => {
      mockInvoke.mockResolvedValueOnce({ content: 'Hello.' });
      const state: TicketState = { ticketId: '1', customerMessage: 'Hi', status: 'open' };
      const result = await generalAgent(state);
      expect(result.status).toBe('resolved');
      expect(result.response).toBe('Hello.');
    });

    it('humanEscalation should escalate (angry)', async () => {
      const state: TicketState = { ticketId: '1', customerMessage: 'Grr', status: 'open', sentiment: 'angry', reasoning: 'Mad' };
      const result = await humanEscalation(state);
      expect(result.status).toBe('escalated');
      expect(result.response).toContain('customer sentiment');
      expect(result.response).toContain('Mad');
    });

    it('humanEscalation should escalate (low confidence)', async () => {
      const state: TicketState = { ticketId: '1', customerMessage: 'Grr', status: 'open', sentiment: 'neutral', reasoning: 'Idk' };
      const result = await humanEscalation(state);
      expect(result.status).toBe('escalated');
      expect(result.response).toContain('low AI confidence');
      expect(result.response).toContain('Idk');
    });
  });

  describe('Graph Routing', () => {
    it('should compile and route to tech', async () => {
      // Mock classifier to return tech
      mockInvoke
        .mockResolvedValueOnce({
          category: 'tech',
          confidence: 0.9,
          reasoning: 'tech',
          sentiment: 'neutral'
        })
        .mockResolvedValueOnce({
          content: 'Tech response'
        });

      const graph = createTriageGraph();
      const result = await graph.invoke({
        ticketId: '1',
        customerMessage: 'Fix this',
        status: 'open'
      });

      expect(result.route).toBe('tech');
      expect(result.status).toBe('resolved');
    });

    it('should compile and route to billing', async () => {
      mockInvoke
        .mockResolvedValueOnce({
          category: 'billing',
          confidence: 0.9,
          reasoning: 'billing',
          sentiment: 'neutral'
        })
        .mockResolvedValueOnce({
          content: 'Billing response'
        });

      const graph = createTriageGraph();
      const result = await graph.invoke({
        ticketId: '1',
        customerMessage: 'Invoice issue',
        status: 'open'
      });

      expect(result.route).toBe('billing');
      expect(result.status).toBe('resolved');
    });

    it('should compile and route to general', async () => {
      mockInvoke
        .mockResolvedValueOnce({
          category: 'general',
          confidence: 0.9,
          reasoning: 'general',
          sentiment: 'neutral'
        })
        .mockResolvedValueOnce({
          content: 'General response'
        });

      const graph = createTriageGraph();
      const result = await graph.invoke({
        ticketId: '1',
        customerMessage: 'Hello',
        status: 'open'
      });

      expect(result.route).toBe('general');
      expect(result.status).toBe('resolved');
    });

    it('should compile and route to escalate (angry)', async () => {
      mockInvoke
        .mockResolvedValueOnce({
          category: 'general',
          confidence: 0.9,
          reasoning: 'mad',
          sentiment: 'angry'
        });

      const graph = createTriageGraph();
      const result = await graph.invoke({
        ticketId: '1',
        customerMessage: 'I am angry',
        status: 'open'
      });

      expect(result.status).toBe('escalated');
    });

    it('should compile and route to escalate (low_conf)', async () => {
      mockInvoke
        .mockResolvedValueOnce({
          category: 'low_conf',
          confidence: 0.4,
          reasoning: 'idk',
          sentiment: 'neutral'
        });

      const graph = createTriageGraph();
      const result = await graph.invoke({
        ticketId: '1',
        customerMessage: 'confusing',
        status: 'open'
      });

      expect(result.status).toBe('escalated');
    });
  });
});
