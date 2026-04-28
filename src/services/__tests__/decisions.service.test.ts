/**
 * Unit tests for decisions.service.ts
 */
import { decisionsApi, agentRequestApi } from '../decisions.service';

// Mock api-client (where decisions.service actually imports `request` from).
const mockRequest = jest.fn();
jest.mock('../api-client', () => ({
  request: (...args: any[]) => mockRequest(...args),
  API_CONFIG: { BASE_URL: 'http://localhost:3000', HEADERS: {}, TIMEOUT: 30000 },
  api: { defaults: { baseURL: 'http://localhost:3000' } },
}));

beforeEach(() => {
  mockRequest.mockReset();
});

describe('decisionsApi', () => {
  describe('list', () => {
    it('should call GET /plans/:id/decisions with options', async () => {
      mockRequest.mockResolvedValue([]);
      await decisionsApi.list('p1', { status: 'pending', limit: 5 });

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/plans/p1/decisions',
        params: { status: 'pending', limit: 5 },
      });
    });
  });

  describe('get', () => {
    it('should call GET /plans/:id/decisions/:id', async () => {
      mockRequest.mockResolvedValue({ id: 'd1' });
      await decisionsApi.get('p1', 'd1');

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/plans/p1/decisions/d1',
      });
    });
  });

  describe('getPendingCount', () => {
    it('should count blocking and can_continue decisions', async () => {
      mockRequest.mockResolvedValue([
        { id: '1', urgency: 'blocking' },
        { id: '2', urgency: 'can_continue' },
        { id: '3', urgency: 'blocking' },
      ]);

      const result = await decisionsApi.getPendingCount('p1');
      expect(result.total).toBe(3);
      expect(result.blocking).toBe(2);
      expect(result.canContinue).toBe(1);
    });
  });

  describe('resolve', () => {
    it('should call POST /decisions/:id/resolve', async () => {
      mockRequest.mockResolvedValue({ id: 'd1', status: 'resolved' });
      await decisionsApi.resolve('p1', 'd1', {
        decision: 'Use Postgres',
        rationale: 'Better JSON',
      });

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: '/plans/p1/decisions/d1/resolve',
        data: { decision: 'Use Postgres', rationale: 'Better JSON' },
      });
    });
  });

  describe('cancel', () => {
    it('should call POST /decisions/:id/cancel', async () => {
      mockRequest.mockResolvedValue({ id: 'd1', status: 'cancelled' });
      await decisionsApi.cancel('p1', 'd1');

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: '/plans/p1/decisions/d1/cancel',
      });
    });
  });
});

describe('agentRequestApi', () => {
  describe('create', () => {
    it('should map execute to start request type', async () => {
      mockRequest.mockResolvedValue({ id: 'ar1' });
      await agentRequestApi.create('p1', 't1', {
        request_type: 'execute',
        prompt: 'Do the thing',
      });

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: '/plans/p1/nodes/t1/request-agent',
        data: { request_type: 'start', message: 'Do the thing' },
      });
    });

    it('should pass through native request types', async () => {
      mockRequest.mockResolvedValue({ id: 'ar1' });
      await agentRequestApi.create('p1', 't1', {
        request_type: 'review',
        message: 'Please review',
      });

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: '/plans/p1/nodes/t1/request-agent',
        data: { request_type: 'review', message: 'Please review' },
      });
    });
  });

  describe('listForTask', () => {
    it('should return empty array (state on node)', async () => {
      const result = await agentRequestApi.listForTask('p1', 't1');
      expect(result).toEqual([]);
    });
  });

  describe('listForPlan', () => {
    it('should return empty array (state on node)', async () => {
      const result = await agentRequestApi.listForPlan('p1');
      expect(result).toEqual([]);
    });
  });
});
