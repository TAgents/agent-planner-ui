/**
 * Streams an assistant turn over SSE (raw fetch + ReadableStream, so we can
 * attach the Authorization header — EventSource can't). Parses `event:`/`data:`
 * frames and dispatches to handlers.
 */
import { API_CONFIG } from '../services/api-client';

export type StreamHandlers = {
  onToken: (delta: string) => void;
  onToolCall: (e: { name: string; args: any }) => void;
  onToolResult: (e: { name: string; status: string; summary?: string }) => void;
  onConfirm: (a: { id: string; name: string; description: string; args: any }) => void;
  onConversation?: (c: { id: string; title: string }) => void;
  onMessage: (m: any) => void;
  onError: (message: string) => void;
  onDone: () => void;
};

function authToken(): string | null {
  try {
    const s = JSON.parse(localStorage.getItem('auth_session') || '{}');
    return s.access_token || s.accessToken || s.token || null;
  } catch {
    return null;
  }
}

export async function streamChat(
  conversationId: string,
  content: string,
  handlers: StreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  const token = authToken();
  let res: Response;
  try {
    res = await fetch(`${API_CONFIG.BASE_URL}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ content }),
      signal,
    });
  } catch (e: any) {
    handlers.onError(e?.message || 'Network error');
    return;
  }

  if (!res.ok || !res.body) {
    let msg = `Request failed (${res.status})`;
    try {
      const j = await res.json();
      msg = j.error || msg;
    } catch {
      /* not JSON */
    }
    handlers.onError(msg);
    return;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buf = '';

  const dispatch = (event: string, data: any) => {
    switch (event) {
      case 'token':
        handlers.onToken(data.delta || '');
        break;
      case 'tool_call':
        handlers.onToolCall(data);
        break;
      case 'tool_result':
        handlers.onToolResult(data);
        break;
      case 'confirm_required':
        handlers.onConfirm(data);
        break;
      case 'conversation':
        handlers.onConversation?.(data);
        break;
      case 'message':
        handlers.onMessage(data);
        break;
      case 'error':
        handlers.onError(data.message || 'Chat failed');
        break;
      case 'done':
        handlers.onDone();
        break;
      default:
        break;
    }
  };

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf('\n\n')) !== -1) {
      const frame = buf.slice(0, idx);
      buf = buf.slice(idx + 2);
      let event = 'message';
      let dataStr = '';
      for (const line of frame.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        else if (line.startsWith('data:')) dataStr += line.slice(5).trim();
      }
      let data: any = {};
      try {
        data = dataStr ? JSON.parse(dataStr) : {};
      } catch {
        /* ignore malformed frame */
      }
      dispatch(event, data);
    }
  }
}
