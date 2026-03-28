/**
 * Unit tests for NodeDetailsLogs component
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import NodeDetailsLogs from '../NodeDetailsLogs';
import type { UnifiedActivity } from '../NodeDetailsLogs';

const makeActivity = (overrides: Partial<UnifiedActivity> = {}): UnifiedActivity => ({
  id: 'act-1',
  nodeId: 'node-1',
  type: 'log',
  actor: { id: 'user-1', name: 'Test User', email: 'test@test.com' },
  timestamp: new Date('2026-03-28T12:00:00Z'),
  data: { content: 'Made progress on task', logType: 'progress' },
  ...overrides,
});

describe('NodeDetailsLogs', () => {
  it('should render loading spinner', () => {
    render(<NodeDetailsLogs activities={[]} isLoading={true} onLogAdd={jest.fn()} />);
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should render empty state when no activities', () => {
    render(<NodeDetailsLogs activities={[]} isLoading={false} onLogAdd={jest.fn()} />);
    expect(screen.getByText('No activity yet')).toBeInTheDocument();
  });

  it('should render activity items', () => {
    const activities = [
      makeActivity({ id: 'a1', data: { content: 'First log', logType: 'progress' } }),
      makeActivity({ id: 'a2', data: { content: 'Second log', logType: 'decision' } }),
    ];

    render(<NodeDetailsLogs activities={activities} isLoading={false} onLogAdd={jest.fn()} />);

    expect(screen.getByText('First log')).toBeInTheDocument();
    expect(screen.getByText('Second log')).toBeInTheDocument();
  });

  it('should render actor names', () => {
    const activities = [makeActivity()];
    render(<NodeDetailsLogs activities={activities} isLoading={false} onLogAdd={jest.fn()} />);
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('should render log composer form', () => {
    render(<NodeDetailsLogs activities={[]} isLoading={false} onLogAdd={jest.fn()} />);
    expect(screen.getByPlaceholderText('Write a log...')).toBeInTheDocument();
  });

  it('should call onLogAdd when submitting a log', () => {
    const onLogAdd = jest.fn();
    render(<NodeDetailsLogs activities={[]} isLoading={false} onLogAdd={onLogAdd} />);

    const textarea = screen.getByPlaceholderText('Write a log...');
    fireEvent.change(textarea, { target: { value: 'New log entry' } });

    const sendButton = screen.getByLabelText('Send');
    fireEvent.click(sendButton);

    expect(onLogAdd).toHaveBeenCalledWith('New log entry', 'progress');
  });

  it('should not submit empty logs', () => {
    const onLogAdd = jest.fn();
    render(<NodeDetailsLogs activities={[]} isLoading={false} onLogAdd={onLogAdd} />);

    const sendButton = screen.getByLabelText('Send');
    fireEvent.click(sendButton);

    expect(onLogAdd).not.toHaveBeenCalled();
  });

  it('should render status change activities', () => {
    const activities = [
      makeActivity({
        id: 'a1',
        type: 'status_change',
        data: { newStatus: 'completed' },
      }),
    ];

    render(<NodeDetailsLogs activities={activities} isLoading={false} onLogAdd={jest.fn()} />);
    expect(screen.getByText('changed status to')).toBeInTheDocument();
    expect(screen.getByText('Completed')).toBeInTheDocument();
  });

  it('should render tags on log entries', () => {
    const activities = [
      makeActivity({
        data: { content: 'Tagged log', logType: 'progress', tags: ['important', 'review'] },
      }),
    ];

    render(<NodeDetailsLogs activities={activities} isLoading={false} onLogAdd={jest.fn()} />);
    expect(screen.getByText('#important')).toBeInTheDocument();
    expect(screen.getByText('#review')).toBeInTheDocument();
  });
});
