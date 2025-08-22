# AI Plan Generation Feature

## Overview

The AI Plan Generation feature allows users to create comprehensive project plans using natural language prompts. This feature integrates with OpenRouter AI to transform user descriptions into structured, actionable plans.

## Setup

### 1. Obtain OpenRouter API Key

1. Visit [OpenRouter](https://openrouter.ai/keys)
2. Create an account or sign in
3. Generate a new API key
4. Add the key to your `.env` file:

```env
REACT_APP_OPENROUTER_API_KEY=your_openrouter_api_key_here
```

### 2. Test the Feature

1. Start the development server: `npm start`
2. Navigate to the Plans page
3. Click "Create with AI" button
4. Enter a project description
5. Click "Generate Plan" or press `Cmd/Ctrl + Enter`

## Usage Guide

### Basic Usage

1. **Navigate to AI Create**: Click the "Create with AI" button from the plans list
2. **Enter Prompt**: Describe your project in natural language
3. **Select Options** (optional):
   - **Complexity**: Simple, Detailed, or Comprehensive
   - **Timeline**: Auto-detect or specify duration
4. **Generate**: Click generate and wait for AI processing

### Example Prompts

- "Create a mobile app for tracking daily habits with user authentication, progress charts, and reminder notifications"
- "Plan a product launch including pre-launch buzz, marketing campaigns, PR strategy, and post-launch analysis"
- "Develop an online course including curriculum design, content creation, platform selection, and student engagement strategies"
- "Design a multi-channel marketing campaign with target audience analysis, channel strategy, and ROI measurement"

### Advanced Options

- **Plan Detail Level**:
  - **Simple**: 3-4 main phases with 2-3 tasks each
  - **Detailed**: 5-6 phases with 4-5 tasks each
  - **Comprehensive**: 7-8 phases with 5-7 tasks each

- **Timeline**:
  - Auto-detect (AI determines based on scope)
  - Fixed durations: 1 week, 1 month, 3 months, 6 months

## Technical Implementation

### Components

1. **AICreatePlan.tsx**: Main page component
2. **PromptInput.tsx**: Text input with character counter
3. **SuggestedPrompts.tsx**: Pre-made prompt suggestions
4. **GenerationModal.tsx**: Progress indicator during generation

### Services

- **aiPlanService.ts**: Handles OpenRouter API communication
  - Builds system prompts based on complexity
  - Validates and transforms AI responses
  - Converts to plan data structure

### Hooks

- **useAIPlanGeneration.ts**: Custom hook for generation logic
  - Manages generation steps
  - Handles state transitions
  - Integrates with existing plan creation

### API Integration

The feature uses OpenRouter's chat completions endpoint with:
- Model: `anthropic/claude-3-opus`
- Temperature: 0.7
- Response format: JSON object
- Max tokens: 2000

## Error Handling

The system handles various error scenarios:

1. **No API Key**: Shows error if key is missing
2. **Network Errors**: Displays retry option
3. **Generation Failures**: Falls back to manual creation
4. **Invalid Responses**: Validates AI output structure

## Future Enhancements

1. **Streaming Responses**: Real-time generation updates
2. **Plan Templates**: Save successful prompts
3. **Refinement**: Allow regeneration of specific sections
4. **History**: Track generated plans
5. **Collaboration**: Share prompts with team
6. **Analytics**: Track successful patterns

## Troubleshooting

### Common Issues

1. **"AI generation failed" error**:
   - Check API key in `.env`
   - Verify OpenRouter account has credits
   - Check network connectivity

2. **Empty or malformed plans**:
   - Try a more detailed prompt
   - Use suggested prompts as examples
   - Check browser console for errors

3. **Slow generation**:
   - Normal for complex plans (10-30 seconds)
   - Consider using "Simple" complexity for faster results

### Debug Mode

Enable debug logging by adding to `.env`:
```env
REACT_APP_DEBUG_AI=true
```

This will log:
- API requests/responses
- Generation steps
- Error details

## Best Practices

1. **Prompt Writing**:
   - Be specific about deliverables
   - Include key requirements
   - Mention any constraints or deadlines

2. **Complexity Selection**:
   - Start with "Detailed" for most projects
   - Use "Simple" for quick prototypes
   - Use "Comprehensive" for enterprise projects

3. **Post-Generation**:
   - Review and refine generated plans
   - Add specific details as needed
   - Adjust timelines based on team capacity
