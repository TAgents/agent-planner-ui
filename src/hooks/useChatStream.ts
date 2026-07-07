/**
 * Streams an assistant turn over SSE (raw fetch + ReadableStream, so we can
 * attach the Authorization header — EventSource can't). Framing is handled by
 * the spec-conformant SseParser; this file maps events to handlers.
 */
import { API_CONFIG, getAuthHeaders } from '../services/api-client';
import { SseParser } from '../services/sse';

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

/**
 * POST the user message and stream the assistant turn. Resolves when the
 * stream ends. An abort via `signal` resolves silently — no onError — since
 * cancellation is the caller's own action, not a failure.
 */
export async function streamChat(
  conversationId: string,
  content: string,
  handlers: StreamHandlers,
  signal?: AbortSignal,
): Promise<void> {
  let res: Response;
  try {
    res = await fetch(`${API_CONFIG.BASE_URL}/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ content }),
      signal,
    });
  } catch (e: any) {
    if (e?.name !== 'AbortError') handlers.onError(e?.message || 'Network error');
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

  const parser = new SseParser(({ event, data }) => {
    let parsed: any = {};
    try {
      parsed = data ? JSON.parse(data) : {};
    } catch {
      return; // malformed frame — skip
    }
    dispatch(event, parsed);
  });

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  try {
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      parser.feed(decoder.decode(value, { stream: true }));
    }
    parser.end();
  } catch (e: any) {
    if (e?.name !== 'AbortError') handlers.onError(e?.message || 'Stream interrupted');
  }
}
