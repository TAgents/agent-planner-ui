import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { SidebarState, NodeDetailsState, AppSidebarState } from '../types';

interface ChatDockState {
  open: boolean;
  width: number;
  /** One-shot composer prefill — set by create-flow handoffs, consumed (and
   *  cleared) by ChatDock on its next render. Never persisted. */
  draft: string | null;
}

interface UIState {
  sidebar: SidebarState;
  appSidebar: AppSidebarState;
  nodeDetails: NodeDetailsState;
  darkMode: boolean;
  chatDock: ChatDockState;
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
  | { type: 'SET_DARK_MODE'; payload: boolean }
  | { type: 'TOGGLE_CHAT_DOCK' }
  | { type: 'SET_CHAT_DOCK_OPEN'; payload: boolean }
  | { type: 'SET_CHAT_DOCK_WIDTH'; payload: number }
  | { type: 'OPEN_CHAT_DOCK_WITH_DRAFT'; payload: string }
  | { type: 'CLEAR_CHAT_DOCK_DRAFT' };

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
  toggleChatDock: () => void;
  setChatDockOpen: (open: boolean) => void;
  setChatDockWidth: (width: number) => void;
  /** Open the dock with the composer prefilled (create-flow handoff). */
  openChatDockWithDraft: (draft: string) => void;
  clearChatDockDraft: () => void;
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
  chatDock: {
    open: true,
    width: 380,
    draft: null,
  },
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
    case 'TOGGLE_CHAT_DOCK':
      return {
        ...state,
        chatDock: { ...state.chatDock, open: !state.chatDock.open },
      };
    case 'SET_CHAT_DOCK_OPEN':
      return {
        ...state,
        chatDock: { ...state.chatDock, open: action.payload },
      };
    case 'SET_CHAT_DOCK_WIDTH':
      return {
        ...state,
        chatDock: { ...state.chatDock, width: action.payload },
      };
    case 'OPEN_CHAT_DOCK_WITH_DRAFT':
      return {
        ...state,
        chatDock: { ...state.chatDock, open: true, draft: action.payload },
      };
    case 'CLEAR_CHAT_DOCK_DRAFT':
      return {
        ...state,
        chatDock: { ...state.chatDock, draft: null },
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

  // Chat dock: restore open/width from localStorage once on mount.
  useEffect(() => {
    try {
      const openStored = localStorage.getItem('ap-chatdock-open');
      if (openStored === 'true' || openStored === 'false') {
        dispatch({ type: 'SET_CHAT_DOCK_OPEN', payload: openStored === 'true' });
      }
      const widthStored = Number(localStorage.getItem('ap-chatdock-width'));
      if (Number.isFinite(widthStored) && widthStored >= 320 && widthStored <= 560) {
        dispatch({ type: 'SET_CHAT_DOCK_WIDTH', payload: widthStored });
      }
    } catch {
      /* localStorage unavailable — keep defaults */
    }
  }, []);

  // Persist chat dock preferences whenever they change.
  useEffect(() => {
    try {
      localStorage.setItem('ap-chatdock-open', String(state.chatDock.open));
      localStorage.setItem('ap-chatdock-width', String(state.chatDock.width));
    } catch {
      /* ignore */
    }
  }, [state.chatDock.open, state.chatDock.width]);

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

  const toggleChatDock = () => dispatch({ type: 'TOGGLE_CHAT_DOCK' });
  const setChatDockOpen = (open: boolean) => dispatch({ type: 'SET_CHAT_DOCK_OPEN', payload: open });
  const setChatDockWidth = (width: number) => dispatch({ type: 'SET_CHAT_DOCK_WIDTH', payload: width });
  const openChatDockWithDraft = (draft: string) =>
    dispatch({ type: 'OPEN_CHAT_DOCK_WITH_DRAFT', payload: draft });
  const clearChatDockDraft = () => dispatch({ type: 'CLEAR_CHAT_DOCK_DRAFT' });


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
        toggleChatDock,
        setChatDockOpen,
        setChatDockWidth,
        openChatDockWithDraft,
        clearChatDockDraft,
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
