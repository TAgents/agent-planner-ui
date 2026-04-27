import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { SidebarState, NodeDetailsState, AppSidebarState } from '../types';

interface UIState {
  sidebar: SidebarState;
  appSidebar: AppSidebarState;
  nodeDetails: NodeDetailsState;
  darkMode: boolean;
}

type UIAction =
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR_OPEN'; payload: boolean }
  | { type: 'SET_SIDEBAR_TAB'; payload: SidebarState['activeTab'] }
  | { type: 'TOGGLE_APP_SIDEBAR' }
  | { type: 'SET_APP_SIDEBAR_COLLAPSED'; payload: boolean }
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
  toggleAppSidebar: () => void;
  setAppSidebarCollapsed: (collapsed: boolean) => void;
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
  appSidebar: {
    isCollapsed: false,
  },
  nodeDetails: {
    isOpen: false,
    selectedNodeId: null,
  },
  darkMode: true,
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
    case 'TOGGLE_APP_SIDEBAR':
      return {
        ...state,
        appSidebar: {
          ...state.appSidebar,
          isCollapsed: !state.appSidebar.isCollapsed,
        },
      };
    case 'SET_APP_SIDEBAR_COLLAPSED':
      return {
        ...state,
        appSidebar: {
          ...state.appSidebar,
          isCollapsed: action.payload,
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

  // Theme: read from localStorage with prefers-color-scheme as fallback;
  // dispatch SET_DARK_MODE so the rest of the reducer state stays in sync.
  // Then the second effect mirrors state.darkMode → <html class="dark">.
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const stored = localStorage.getItem('ap-theme');
    let next: boolean;
    if (stored === 'dark') next = true;
    else if (stored === 'light') next = false;
    else next = window.matchMedia('(prefers-color-scheme: dark)').matches;
    dispatch({ type: 'SET_DARK_MODE', payload: next });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    if (state.darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('ap-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('ap-theme', 'light');
    }
  }, [state.darkMode]);

  // Context actions
  const toggleSidebar = () => dispatch({ type: 'TOGGLE_SIDEBAR' });
  const setSidebarOpen = (open: boolean) => dispatch({ type: 'SET_SIDEBAR_OPEN', payload: open });
  const setSidebarTab = (tab: SidebarState['activeTab']) =>
    dispatch({ type: 'SET_SIDEBAR_TAB', payload: tab });

  const toggleAppSidebar = () => dispatch({ type: 'TOGGLE_APP_SIDEBAR' });
  const setAppSidebarCollapsed = (collapsed: boolean) =>
    dispatch({ type: 'SET_APP_SIDEBAR_COLLAPSED', payload: collapsed });

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


  return (
    <UIContext.Provider
      value={{
        state,
        toggleSidebar,
        setSidebarOpen,
        setSidebarTab,
        toggleAppSidebar,
        setAppSidebarCollapsed,
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
