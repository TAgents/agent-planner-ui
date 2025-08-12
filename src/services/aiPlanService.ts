import { Plan, PlanNode } from '../types';

interface AIGenerationOptions {
  complexity: 'simple' | 'detailed' | 'comprehensive';
  timeline: string;
}

interface AIGenerationRequest {
  prompt: string;
  options: AIGenerationOptions;
}

interface AIGeneratedPlan {
  title: string;
  description: string;
  phases: {
    title: string;
    description: string;
    tasks: {
      title: string;
      description: string;
      estimatedTime?: string;
    }[];
  }[];
  milestones: {
    title: string;
    description: string;
    targetDate?: string;
  }[];
}

class AIPlanService {
  private openRouterApiKey: string;
  private baseUrl = 'https://openrouter.ai/api/v1';

  constructor() {
    this.openRouterApiKey = process.env.REACT_APP_OPENROUTER_API_KEY || '';
  }

  async generatePlan(request: AIGenerationRequest): Promise<AIGeneratedPlan> {
    // Check if API key is configured
    if (!this.openRouterApiKey || this.openRouterApiKey === 'your_openrouter_api_key_here') {
      console.warn('OpenRouter API key not configured. Using mock data.');
      return this.generateMockPlan(request);
    }

    console.log('Generating plan with OpenRouter API...');
    const systemPrompt = this.buildSystemPrompt(request.options);
    
    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Agent Planner AI'
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo', // Common models: openai/gpt-3.5-turbo, openai/gpt-4, google/palm-2-chat-bison, anthropic/claude-2, meta-llama/llama-2-70b-chat
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: request.prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      throw new Error(`AI generation failed: ${response.status} - ${response.statusText}. ${errorText}`);
    }

    const data = await response.json();
    
    // Extract the content from the response
    let content = data.choices[0].message.content;
    
    // Remove any markdown code blocks if present
    content = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    // Parse the JSON
    let generatedContent;
    try {
      generatedContent = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response:', content);
      throw new Error('Invalid JSON response from AI');
    }
    
    return this.validateAndTransformResponse(generatedContent);
  }

  private buildSystemPrompt(options: AIGenerationOptions): string {
    const complexityGuide = {
      simple: 'Create a simple plan with 3-4 main phases and 2-3 tasks per phase.',
      detailed: 'Create a detailed plan with 5-6 phases and 4-5 tasks per phase.',
      comprehensive: 'Create a comprehensive plan with 7-8 phases and 5-7 tasks per phase.'
    };

    return `You are an expert project planner. Generate a structured project plan based on the user's description.
    
    ${complexityGuide[options.complexity]}
    
    IMPORTANT: Return ONLY a valid JSON object with no additional text, markdown formatting, or explanation.
    
    The JSON must have this exact structure:
    {
      "title": "Project title",
      "description": "Brief project description",
      "phases": [
        {
          "title": "Phase title",
          "description": "Phase description",
          "tasks": [
            {
              "title": "Task title",
              "description": "Task description",
              "estimatedTime": "2 hours"
            }
          ]
        }
      ],
      "milestones": [
        {
          "title": "Milestone title",
          "description": "Milestone description",
          "targetDate": "2024-03-15"
        }
      ]
    }
    
    Make the plan actionable, realistic, and well-structured. Output only the JSON object, nothing else.`;
  }

  private validateAndTransformResponse(response: any): AIGeneratedPlan {
    // Validate and ensure the response matches our expected structure
    return {
      title: response.title || 'Untitled Plan',
      description: response.description || '',
      phases: response.phases || [],
      milestones: response.milestones || []
    };
  }

  async createPlanFromAI(generatedPlan: AIGeneratedPlan): Promise<Plan> {
    // This would integrate with your existing plan creation API
    // For now, returning a mock transformation
    return {
      id: '', // Will be set by API
      title: generatedPlan.title,
      description: generatedPlan.description,
      status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      owner_id: '', // Will be set by API
      progress: 0
    };
  }

  private generateMockPlan(request: AIGenerationRequest): AIGeneratedPlan {
    // Generate a mock plan based on the prompt for development/testing
    const complexityMap = {
      simple: { phases: 3, tasksPerPhase: 3 },
      detailed: { phases: 5, tasksPerPhase: 4 },
      comprehensive: { phases: 7, tasksPerPhase: 6 }
    };

    const config = complexityMap[request.options.complexity];
    const shortPrompt = request.prompt.substring(0, 100);

    return {
      title: `AI Generated Plan: ${shortPrompt}...`,
      description: `This is a mock plan generated from your prompt: "${request.prompt}". Configure your OpenRouter API key to generate real AI-powered plans.`,
      phases: Array.from({ length: config.phases }, (_, i) => ({
        title: `Phase ${i + 1}: ${this.getPhaseTitle(i)}`,
        description: `Description for phase ${i + 1} of the project`,
        tasks: Array.from({ length: config.tasksPerPhase }, (_, j) => ({
          title: `Task ${i + 1}.${j + 1}: ${this.getTaskTitle(i, j)}`,
          description: `Detailed description of task ${j + 1} in phase ${i + 1}`,
          estimatedTime: `${Math.floor(Math.random() * 8) + 1} hours`
        }))
      })),
      milestones: [
        {
          title: 'Project Kickoff',
          description: 'Initial project setup and team alignment',
          targetDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          title: 'Mid-Project Review',
          description: 'Review progress and adjust timeline',
          targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        },
        {
          title: 'Project Completion',
          description: 'Final deliverables and project closure',
          targetDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      ]
    };
  }

  private getPhaseTitle(index: number): string {
    const phases = [
      'Research & Planning',
      'Design & Architecture',
      'Development',
      'Testing & QA',
      'Deployment',
      'Documentation',
      'Maintenance & Support'
    ];
    return phases[index % phases.length];
  }

  private getTaskTitle(phaseIndex: number, taskIndex: number): string {
    const taskTemplates = [
      ['Define requirements', 'Conduct research', 'Create specifications', 'Review with stakeholders', 'Finalize scope', 'Set up tools'],
      ['Create wireframes', 'Design mockups', 'Define architecture', 'Review designs', 'Create prototypes', 'Finalize designs'],
      ['Set up environment', 'Implement core features', 'Build UI components', 'Integrate APIs', 'Code review', 'Optimize performance'],
      ['Write test cases', 'Unit testing', 'Integration testing', 'User acceptance testing', 'Bug fixes', 'Performance testing'],
      ['Prepare deployment', 'Configure servers', 'Deploy to staging', 'Final testing', 'Deploy to production', 'Monitor deployment'],
      ['Write user guide', 'Create API docs', 'Document processes', 'Training materials', 'Knowledge transfer', 'Archive project'],
      ['Monitor systems', 'Handle support tickets', 'Regular updates', 'Performance monitoring', 'Security patches', 'User feedback']
    ];
    
    const phaseTasks = taskTemplates[phaseIndex % taskTemplates.length];
    return phaseTasks[taskIndex % phaseTasks.length];
  }
}

export default new AIPlanService();
