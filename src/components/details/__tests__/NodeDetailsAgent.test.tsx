/**
 * Unit tests for NodeDetailsAgent component
 */
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NodeDetailsAgent from '../NodeDetailsAgent';
import { PlanNode } from '../../../types';

const makeNode = (overrides: Partial<PlanNode> = {}): PlanNode => ({
  id: 'node-1',
  plan_id: 'plan-1',
  parent_id: 'root-1',
  node_type: 'task',
  title: 'Test Task',
  description: 'A test task',
  status: 'not_started',
  order_index: 0,
  due_date: null,
  created_at: '2026-03-28T12:00:00Z',
  updated_at: '2026-03-28T12:00:00Z',
  context: '',
  agent_instructions: null,
  metadata: {},
  task_mode: 'free',
  ...overrides,
} as PlanNode);

describe('NodeDetailsAgent', () => {
  it('should render empty state when no instructions', () => {
    render(<NodeDetailsAgent node={makeNode()} />);
    expect(screen.getByText('No instructions defined')).toBeInTheDocument();
  });

  it('should render Add button when no instructions and not readOnly', () => {
    render(<NodeDetailsAgent node={makeNode()} />);
    expect(screen.getByText('+ Add')).toBeInTheDocument();
  });

  it('should NOT render Add button when readOnly', () => {
    render(<NodeDetailsAgent node={makeNode()} readOnly={true} />);
    expect(screen.queryByText('+ Add')).not.toBeInTheDocument();
  });

  it('should render instructions in read-only mode', () => {
    const node = makeNode({ agent_instructions: 'Do the thing carefully' });
    render(<NodeDetailsAgent node={node} />);
    expect(screen.getByText('Do the thing carefully')).toBeInTheDocument();
  });

  it('should enter edit mode when clicking Add', () => {
    render(<NodeDetailsAgent node={makeNode()} onUpdate={jest.fn()} />);
    fireEvent.click(screen.getByText('+ Add'));
    expect(screen.getByPlaceholderText('Enter instructions for AI agents...')).toBeInTheDocument();
  });

  it('should enter edit mode when clicking edit button', () => {
    const node = makeNode({ agent_instructions: 'Existing instructions' });
    render(<NodeDetailsAgent node={node} onUpdate={jest.fn()} />);
    fireEvent.click(screen.getByLabelText('Edit instructions'));
    expect(screen.getByPlaceholderText('Enter instructions for AI agents...')).toBeInTheDocument();
  });

  it('should call onUpdate when saving', async () => {
    const onUpdate = jest.fn().mockResolvedValue(undefined);
    render(<NodeDetailsAgent node={makeNode()} onUpdate={onUpdate} />);

    fireEvent.click(screen.getByText('+ Add'));

    const textarea = screen.getByPlaceholderText('Enter instructions for AI agents...');
    fireEvent.change(textarea, { target: { value: 'New instructions' } });

    fireEvent.click(screen.getByText('Save'));

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith('New instructions');
    });
  });

  it('should cancel editing and revert', () => {
    const node = makeNode({ agent_instructions: 'Original' });
    render(<NodeDetailsAgent node={node} onUpdate={jest.fn()} />);

    fireEvent.click(screen.getByLabelText('Edit instructions'));
    const textarea = screen.getByPlaceholderText('Enter instructions for AI agents...');
    fireEvent.change(textarea, { target: { value: 'Modified' } });

    fireEvent.click(screen.getByText('Cancel'));

    // Should show original text again
    expect(screen.getByText('Original')).toBeInTheDocument();
  });

  it('should copy instructions to clipboard', async () => {
    Object.assign(navigator, { clipboard: { writeText: jest.fn().mockResolvedValue(undefined) } });

    const node = makeNode({ agent_instructions: 'Copy me' });
    render(<NodeDetailsAgent node={node} />);

    fireEvent.click(screen.getByLabelText('Copy to clipboard'));

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith('Copy me');
  });
});
