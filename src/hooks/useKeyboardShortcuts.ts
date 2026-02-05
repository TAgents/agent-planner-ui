import { useEffect, useCallback, useRef } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description?: string;
}

/**
 * Hook for handling keyboard shortcuts
 * Automatically ignores shortcuts when typing in input/textarea elements
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Skip if not enabled
    if (!enabled) return;

    // Skip if typing in input, textarea, or contenteditable
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // Exception: Allow Escape to work even in inputs
      if (e.key !== 'Escape') {
        return;
      }
    }

    const key = e.key.toLowerCase();
    
    // Find matching shortcut
    const shortcut = shortcutsRef.current.find(s => {
      const keyMatch = s.key.toLowerCase() === key;
      const ctrlMatch = !!s.ctrl === (e.ctrlKey || e.metaKey);
      const shiftMatch = !!s.shift === e.shiftKey;
      const altMatch = !!s.alt === e.altKey;
      return keyMatch && ctrlMatch && shiftMatch && altMatch;
    });

    if (shortcut) {
      e.preventDefault();
      shortcut.action();
    }
  }, [enabled]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

/**
 * Default shortcuts for plan view
 */
export const PLAN_SHORTCUTS = {
  NEXT_TASK: 'j',
  PREV_TASK: 'k',
  TOGGLE_STATUS: ' ',
  OPEN_DETAIL: 'Enter',
  EDIT_TASK: 'e',
  NEW_TASK: 'n',
  NEW_PHASE: 'N',
  CLOSE: 'Escape',
  HELP: '?',
  SEARCH: '/',
};

/**
 * Shortcut documentation for help modal
 */
export const SHORTCUT_GROUPS = [
  {
    name: 'Navigation',
    shortcuts: [
      { key: 'j', description: 'Move to next task' },
      { key: 'k', description: 'Move to previous task' },
      { key: 'Enter', description: 'Open task details' },
      { key: '/', description: 'Focus search' },
    ],
  },
  {
    name: 'Actions',
    shortcuts: [
      { key: 'Space', description: 'Toggle task status' },
      { key: 'e', description: 'Edit task' },
      { key: 'n', description: 'New task in current phase' },
      { key: 'Shift + N', description: 'New phase' },
    ],
  },
  {
    name: 'General',
    shortcuts: [
      { key: 'Esc', description: 'Close modal/panel' },
      { key: '?', description: 'Show keyboard shortcuts' },
    ],
  },
];
