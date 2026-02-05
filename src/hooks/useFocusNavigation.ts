import { useState, useCallback, useMemo, useEffect } from 'react';
import { PlanNode } from '../types';

// Extended node type that may include children from nested API response
interface NodeWithChildren extends PlanNode {
  children?: NodeWithChildren[];
}

interface FocusNavigationOptions {
  onFocusChange?: (nodeId: string | null) => void;
  initialFocusId?: string | null;
}

/**
 * Hook for keyboard-based focus navigation in plan tree
 * Provides navigation between nodes and tracks focused state
 */
export function useFocusNavigation(
  nodes: PlanNode[],
  options: FocusNavigationOptions = {}
) {
  const { onFocusChange, initialFocusId = null } = options;
  const [focusedId, setFocusedId] = useState<string | null>(initialFocusId);

  // Flatten the tree for sequential navigation (DFS order)
  const flattenedNodes = useMemo(() => {
    const result: PlanNode[] = [];
    
    function traverse(node: NodeWithChildren) {
      // Skip root node in navigation
      if (node.node_type !== 'root') {
        result.push(node);
      }
      if (node.children && Array.isArray(node.children)) {
        node.children.forEach(traverse);
      }
    }
    
    (nodes as NodeWithChildren[]).forEach(traverse);
    return result;
  }, [nodes]);

  // Get current focused index
  const focusedIndex = useMemo(() => {
    if (!focusedId) return -1;
    return flattenedNodes.findIndex(n => n.id === focusedId);
  }, [flattenedNodes, focusedId]);

  // Get currently focused node
  const focusedNode = useMemo(() => {
    if (focusedIndex === -1) return null;
    return flattenedNodes[focusedIndex];
  }, [flattenedNodes, focusedIndex]);

  // Set focus to a specific node
  const setFocus = useCallback((nodeId: string | null) => {
    setFocusedId(nodeId);
    onFocusChange?.(nodeId);
  }, [onFocusChange]);

  // Move focus to next node
  const focusNext = useCallback(() => {
    if (flattenedNodes.length === 0) return;
    
    let nextIndex: number;
    if (focusedIndex === -1) {
      // Start from first node if nothing focused
      nextIndex = 0;
    } else {
      // Move to next, wrap around
      nextIndex = (focusedIndex + 1) % flattenedNodes.length;
    }
    
    setFocus(flattenedNodes[nextIndex].id);
  }, [flattenedNodes, focusedIndex, setFocus]);

  // Move focus to previous node
  const focusPrev = useCallback(() => {
    if (flattenedNodes.length === 0) return;
    
    let prevIndex: number;
    if (focusedIndex === -1) {
      // Start from last node if nothing focused
      prevIndex = flattenedNodes.length - 1;
    } else {
      // Move to previous, wrap around
      prevIndex = focusedIndex === 0 ? flattenedNodes.length - 1 : focusedIndex - 1;
    }
    
    setFocus(flattenedNodes[prevIndex].id);
  }, [flattenedNodes, focusedIndex, setFocus]);

  // Focus first node
  const focusFirst = useCallback(() => {
    if (flattenedNodes.length > 0) {
      setFocus(flattenedNodes[0].id);
    }
  }, [flattenedNodes, setFocus]);

  // Focus last node
  const focusLast = useCallback(() => {
    if (flattenedNodes.length > 0) {
      setFocus(flattenedNodes[flattenedNodes.length - 1].id);
    }
  }, [flattenedNodes, setFocus]);

  // Clear focus
  const clearFocus = useCallback(() => {
    setFocus(null);
  }, [setFocus]);

  // Scroll focused element into view
  useEffect(() => {
    if (focusedId) {
      const element = document.querySelector(`[data-node-id="${focusedId}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [focusedId]);

  return {
    focusedId,
    focusedIndex,
    focusedNode,
    setFocus,
    focusNext,
    focusPrev,
    focusFirst,
    focusLast,
    clearFocus,
    flattenedNodes,
  };
}
