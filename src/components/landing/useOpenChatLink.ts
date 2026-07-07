import { useUI } from '../../contexts/UIContext';
import { getSession } from '../../services/api-client';

/**
 * Target + click handler for the landing "Open chat" buttons. A signed-in
 * visitor goes straight into the app with the chat dock opened; everyone
 * else goes through /login as before.
 */
export function useOpenChatLink() {
  const { setChatDockOpen } = useUI();
  const signedIn = !!getSession();
  return {
    to: signedIn ? '/app/dashboard' : '/login',
    onClick: () => {
      if (signedIn) setChatDockOpen(true);
    },
  };
}
