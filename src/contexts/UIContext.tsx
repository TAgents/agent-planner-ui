import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { SidebarState, NodeDetailsState } from '../types';

interface UIState {
  sidebar: SidebarState;
  nodeDetails: NodeDetailsState;
  darkMode: boolean;
}

type UIAction =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'SET_SIDEBAR_TAB'; payload: SidebarState['activeTab'] }
  | { type: 'TOGGLE_NODE_DETAILS' }
  | { type: 'OPEN_NODE_DETAILS'; payload: string }
  | { type: 'CLOSE_NODE_DETAILS' }
  | { type: 'TOGGLE_DARK_MODE' }
  | { type: 'SET_DARK_MODE'; payload: boolean };

interface UIContextProps {
  state: UIState;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setSidebarTab: (tab: SidebarState['activeTab']) => void;
  toggleNodeDetails: () => void;
  openNodeDetails: (nodeId: string) => void;
  closeNodeDetails: () => void;
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
}

const defaultState: UIState = {
  sidebar: {
    isOpen: true,
    activeTab: 'overview',
  },
  nodeDetails: {
    isOpen: false,
    selectedNodeId: null,
  },
  darkMode: false,
};

const UIContext = createContext<UIContextProps | undefined>(undefined);

const uiReducer = (state: UIState, action: UIAction): UIState => {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return {
        ...state,
        sidebar: {
          ...state.sidebar,
          isOpen: !state.sidebar.isOpen,
        },
      };
    case 'SET_SIDEBAR_OPEN':
      return {
        ...state,
        sidebar: {
          ...state.sidebar,
          isOpen: action.payload,
        },
      };
    case 'SET_SIDEBAR_TAB':
      return {
        ...state,
        sidebar: {
          ...state.sidebar,
          activeTab: action.payload,
        },
      };
    case 'TOGGLE_NODE_DETAILS':
      return {
        ...state,
        nodeDetails: {
          ...state.nodeDetails,
          isOpen: !state.nodeDetails.isOpen,
        },
      };
    case 'OPEN_NODE_DETAILS':
      return {
        ...state,
        nodeDetails: {
          isOpen: true,
          selectedNodeId: action.payload,
        },
      };
    case 'CLOSE_NODE_DETAILS':
      return {
        ...state,
        nodeDetails: {
          isOpen: false,
          selectedNodeId: null,
        },
      };
    case 'TOGGLE_DARK_MODE':
      return {
        ...state,
        darkMode: !state.darkMode,
      };
    case 'SET_DARK_MODE':
      return {
        ...state,
        darkMode: action.payload,
      };
    default:
      return state;
  }
};

export const UIProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(uiReducer, defaultState);

  // Initialize dark mode from user preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const savedDarkMode = localStorage.getItem('darkMode');
      
      if (savedDarkMode) {
        dispatch({ type: 'SET_DARK_MODE', payload: savedDarkMode === 'true' });
      } else if (prefersDarkMode) {
        dispatch({ type: 'SET_DARK_MODE', payload: true });
      }
    }
  }, []);

  // Update HTML class when dark mode changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (state.darkMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [state.darkMode])

  // Context actions
  const toggleSidebar = () => dispatch({ type: 'TOGGLE_SIDEBAR' });
  const setSidebarOpen = (open: boolean) => dispatch({ type: 'SET_SIDEBAR_OPEN', payload: open });
  const setSidebarTab = (tab: SidebarState['activeTab']) => 
    dispatch({ type: 'SET_SIDEBAR_TAB', payload: tab });
  
  const toggleNodeDetails = () => dispatch({ type: 'TOGGLE_NODE_DETAILS' });
  const openNodeDetails = (nodeId: string) => 
    dispatch({ type: 'OPEN_NODE_DETAILS', payload: nodeId });
  const closeNodeDetails = () => dispatch({ type: 'CLOSE_NODE_DETAILS' });
  
  const toggleDarkMode = () => {
    dispatch({ type: 'TOGGLE_DARK_MODE' });
  };
  const setDarkMode = (enabled: boolean) => {
    dispatch({ type: 'SET_DARK_MODE', payload: enabled });
  };

  // Save dark mode preference to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', String(state.darkMode));
    }
  }, [state.darkMode]);

  return (
    <UIContext.Provider
      value={{
        state,
        toggleSidebar,
        setSidebarOpen,
        setSidebarTab,
        toggleNodeDetails,
        openNodeDetails,
        closeNodeDetails,
        toggleDarkMode,
        setDarkMode,
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = (): UIContextProps => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUI must be used within a UIProvider');
  }
  return context;
};
