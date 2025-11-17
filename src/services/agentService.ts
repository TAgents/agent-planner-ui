import axios from 'axios';

const AGENT_REGISTRY_URL = process.env.REACT_APP_AGENT_REGISTRY_URL || 'http://localhost:5000';

export interface AgentCapability {
  name: string;
  description: string;
  schema?: any;
}

export interface Agent {
  id: string;
  name: string;
  url: string;
  status: 'active' | 'inactive' | 'unhealthy';
  capabilities: AgentCapability[];
  metadata?: {
    lastHeartbeat?: string;
    registeredAt?: string;
    [key: string]: any;
  };
}

export interface CapabilitiesMap {
  [capabilityName: string]: Agent[];
}

class AgentService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = AGENT_REGISTRY_URL;
  }

  /**
   * Get all registered agents
   */
  async getAgents(): Promise<Agent[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/agents`);
      return response.data.agents || response.data || [];
    } catch (error) {
      console.error('Failed to fetch agents:', error);
      throw new Error('Failed to fetch agents from registry');
    }
  }

  /**
   * Get a specific agent by ID
   */
  async getAgent(id: string): Promise<Agent> {
    try {
      const response = await axios.get(`${this.baseUrl}/agents/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch agent ${id}:`, error);
      throw new Error(`Failed to fetch agent ${id}`);
    }
  }

  /**
   * Get all capabilities and the agents that provide them
   */
  async getCapabilities(): Promise<CapabilitiesMap> {
    try {
      const response = await axios.get(`${this.baseUrl}/capabilities`);
      return response.data.capabilities || response.data || {};
    } catch (error) {
      console.error('Failed to fetch capabilities:', error);
      throw new Error('Failed to fetch capabilities from registry');
    }
  }

  /**
   * Find agents by capability name
   */
  async findByCapability(capabilityName: string): Promise<Agent[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/capabilities/${capabilityName}`);
      return response.data.agents || response.data || [];
    } catch (error) {
      console.error(`Failed to find agents with capability ${capabilityName}:`, error);
      throw new Error(`Failed to find agents with capability ${capabilityName}`);
    }
  }

  /**
   * Check registry health
   */
  async getHealth(): Promise<{ status: string; agentCount: number; uptime?: number }> {
    try {
      const response = await axios.get(`${this.baseUrl}/health`);
      return response.data;
    } catch (error) {
      console.error('Failed to check registry health:', error);
      throw new Error('Failed to check registry health');
    }
  }
}

export const agentService = new AgentService();
