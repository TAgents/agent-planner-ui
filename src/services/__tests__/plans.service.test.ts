/**
 * Unit tests for plans.service.ts
 * Mocks the request function to verify correct API calls.
 */
import { planService } from '../plans.service';

// Mock the api module's request function
const mockRequest = jest.fn();
jest.mock('../api', () => ({
  request: (...args: any[]) => mockRequest(...args),
  API_CONFIG: { BASE_URL: 'http://localhost:3000', HEADERS: {}, TIMEOUT: 30000 },
}));

beforeEach(() => {
  mockRequest.mockReset();
});

describe('planService', () => {
  describe('getPlans', () => {
    it('should call GET /plans with page and limit', async () => {
      mockRequest.mockResolvedValue([]);
      await planService.getPlans(2, 20);

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/plans',
        params: { page: 2, limit: 20 },
      });
    });

    it('should include status param when provided', async () => {
      mockRequest.mockResolvedValue([]);
      await planService.getPlans(1, 10, 'active');

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/plans',
        params: { page: 1, limit: 10, status: 'active' },
      });
    });

    it('should not include status param when undefined', async () => {
      mockRequest.mockResolvedValue([]);
      await planService.getPlans(1, 10);

      const params = mockRequest.mock.calls[0][0].params;
      expect(params.status).toBeUndefined();
    });
  });

  describe('getPlan', () => {
    it('should call GET /plans/:id', async () => {
      mockRequest.mockResolvedValue({ id: 'p1' });
      await planService.getPlan('p1');

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/plans/p1',
      });
    });
  });

  describe('createPlan', () => {
    it('should call POST /plans with data', async () => {
      const data = { title: 'New Plan', description: 'Test' };
      mockRequest.mockResolvedValue({ id: 'p1', ...data });
      await planService.createPlan(data);

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'POST',
        url: '/plans',
        data,
      });
    });
  });

  describe('updatePlan', () => {
    it('should call PUT /plans/:id', async () => {
      const data = { title: 'Updated' };
      mockRequest.mockResolvedValue({ id: 'p1', title: 'Updated' });
      await planService.updatePlan('p1', data as any);

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'PUT',
        url: '/plans/p1',
        data,
      });
    });
  });

  describe('deletePlan', () => {
    it('should call DELETE /plans/:id with archive param', async () => {
      mockRequest.mockResolvedValue(null);
      await planService.deletePlan('p1', true);

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'DELETE',
        url: '/plans/p1?archive=true',
      });
    });

    it('should omit archive param when false', async () => {
      mockRequest.mockResolvedValue(null);
      await planService.deletePlan('p1', false);

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'DELETE',
        url: '/plans/p1',
      });
    });
  });

  describe('updatePlanVisibility', () => {
    it('should call PUT /plans/:id/visibility', async () => {
      mockRequest.mockResolvedValue({});
      await planService.updatePlanVisibility('p1', 'public');

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'PUT',
        url: '/plans/p1/visibility',
        data: { visibility: 'public' },
      });
    });
  });

  describe('getCollaborators', () => {
    it('should return array response directly', async () => {
      const collabs = [{ id: 'c1' }];
      mockRequest.mockResolvedValue(collabs);
      const result = await planService.getCollaborators('p1');
      expect(result).toEqual(collabs);
    });

    it('should unwrap data property if present', async () => {
      const collabs = [{ id: 'c1' }];
      mockRequest.mockResolvedValue({ data: collabs });
      const result = await planService.getCollaborators('p1');
      expect(result).toEqual(collabs);
    });

    it('should return empty array for unexpected format', async () => {
      mockRequest.mockResolvedValue({ unexpected: true });
      const result = await planService.getCollaborators('p1');
      expect(result).toEqual([]);
    });
  });

  describe('getPlanProgress', () => {
    it('should call GET /plans/:id/progress', async () => {
      mockRequest.mockResolvedValue({ total_nodes: 10, completed_nodes: 5 });
      await planService.getPlanProgress('p1');

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'GET',
        url: '/plans/p1/progress',
      });
    });
  });

  describe('linkGitHubRepo', () => {
    it('should call PUT /plans/:id/github with owner and name', async () => {
      mockRequest.mockResolvedValue({});
      await planService.linkGitHubRepo('p1', 'org', 'repo');

      expect(mockRequest).toHaveBeenCalledWith({
        method: 'PUT',
        url: '/plans/p1/github',
        data: { github_repo_owner: 'org', github_repo_name: 'repo' },
      });
    });
  });
});
