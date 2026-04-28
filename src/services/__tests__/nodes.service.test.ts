/**
 * Unit tests for nodes.service.ts
 */
import { nodeService } from '../nodes.service';

// Mock api-client (where nodes.service actually imports `request` from).
const mockRequest = jest.fn();
jest.mock('../api-client', () => ({
  request: (...args: any[]) => mockRequest(...args),
  API_CONFIG: { BASE_URL: 'http://localhost:3000', HEADERS: {}, TIMEOUT: 30000 },
  api: { defaults: { baseURL: 'http://localhost:3000' } },
}));

beforeEach(() => {
  mockRequest.mockReset();
});

describe('nodeService', () => {
  describe('getNodes', () => {
    it('should call GET /plans/:id/nodes with include_root', async () => {
      mockRequest.mockResolvedValue([]);
      await nodeService.getNodes('p1');

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/plans/p1/nodes',
        params: { include_root: 'true' },
      });
    });

    it('should flatten hierarchical response', async () => {
      mockRequest.mockResolvedValue([
        { id: 'root', children: [
          { id: 'child1', children: [] },
          { id: 'child2', children: [{ id: 'grandchild', children: [] }] },
        ]},
      ]);

      const result = await nodeService.getNodes('p1');
      expect(result.data).toHaveLength(4); // root + child1 + child2 + grandchild
      expect(result.status).toBe(200);
    });

    it('should handle empty response', async () => {
      mockRequest.mockResolvedValue([]);
      const result = await nodeService.getNodes('p1');
      expect(result.data).toEqual([]);
      expect(result.status).toBe(200);
    });

    it('should handle non-hierarchical response', async () => {
      const flat = [{ id: 'n1' }, { id: 'n2' }];
      mockRequest.mockResolvedValue(flat);
      const result = await nodeService.getNodes('p1');
      expect(result.data).toEqual(flat);
    });

    it('should return error status on failure', async () => {
      mockRequest.mockRejectedValue({ response: { status: 403 }, message: 'Forbidden' });
      const result = await nodeService.getNodes('p1');
      expect(result.status).toBe(403);
      expect(result.data).toEqual([]);
    });
  });

  describe('getNode', () => {
    it('should call GET /plans/:planId/nodes/:nodeId', async () => {
      mockRequest.mockResolvedValue({ id: 'n1', title: 'Task' });
      const result = await nodeService.getNode('p1', 'n1');

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/plans/p1/nodes/n1',
      });
      expect(result.data.id).toBe('n1');
    });
  });

  describe('createNode', () => {
    it('should call POST /plans/:id/nodes', async () => {
      const data = { title: 'New Task', node_type: 'task' };
      mockRequest.mockResolvedValue({ id: 'n1', ...data });
      await nodeService.createNode('p1', data as any);

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: '/plans/p1/nodes',
        data,
      });
    });
  });

  describe('updateNode', () => {
    it('should call PUT /plans/:planId/nodes/:nodeId', async () => {
      mockRequest.mockResolvedValue({});
      await nodeService.updateNode('p1', 'n1', { title: 'Updated' } as any);

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'PUT',
        url: '/plans/p1/nodes/n1',
        data: { title: 'Updated' },
      });
    });
  });

  describe('updateNodeStatus', () => {
    it('should call PUT /plans/:planId/nodes/:nodeId/status', async () => {
      mockRequest.mockResolvedValue({});
      await nodeService.updateNodeStatus('p1', 'n1', 'completed');

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'PUT',
        url: '/plans/p1/nodes/n1/status',
        data: { status: 'completed' },
      });
    });
  });

  describe('deleteNode', () => {
    it('should call DELETE /plans/:planId/nodes/:nodeId', async () => {
      mockRequest.mockResolvedValue(null);
      await nodeService.deleteNode('p1', 'n1');

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'DELETE',
        url: '/plans/p1/nodes/n1',
      });
    });
  });

  describe('moveNode', () => {
    it('should call POST /plans/:planId/nodes/:nodeId/move', async () => {
      mockRequest.mockResolvedValue({});
      await nodeService.moveNode('p1', 'n1', { parent_id: 'p2', order_index: 3 });

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: '/plans/p1/nodes/n1/move',
        data: { parent_id: 'p2', order_index: 3 },
      });
    });
  });

  describe('assignAgent', () => {
    it('should call POST with agent_id', async () => {
      mockRequest.mockResolvedValue({});
      await nodeService.assignAgent('p1', 'n1', 'agent-1');

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: '/plans/p1/nodes/n1/assign-agent',
        data: { agent_id: 'agent-1' },
      });
    });
  });

  describe('getSuggestedAgents', () => {
    it('should call GET with optional tags', async () => {
      mockRequest.mockResolvedValue({ agents: [] });
      await nodeService.getSuggestedAgents('p1', 'n1', 'qa,dev');

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/plans/p1/nodes/n1/suggested-agents',
        params: { tags: 'qa,dev' },
      });
    });

    it('should omit params when no tags', async () => {
      mockRequest.mockResolvedValue({ agents: [] });
      await nodeService.getSuggestedAgents('p1', 'n1');

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/plans/p1/nodes/n1/suggested-agents',
        params: undefined,
      });
    });
  });
});
