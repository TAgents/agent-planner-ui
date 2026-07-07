import { SseParser, type SseEvent } from './sse';

function collect(): { events: SseEvent[]; parser: SseParser } {
  const events: SseEvent[] = [];
  const parser = new SseParser((e) => events.push(e));
  return { events, parser };
}

describe('SseParser', () => {
  it('parses a simple event/data frame', () => {
    const { events, parser } = collect();
    parser.feed('event: token\ndata: {"delta":"hi"}\n\n');
    expect(events).toEqual([{ event: 'token', data: '{"delta":"hi"}' }]);
  });

  it('defaults the event type to "message"', () => {
    const { events, parser } = collect();
    parser.feed('data: x\n\n');
    expect(events).toEqual([{ event: 'message', data: 'x' }]);
  });

  it('joins multi-line data with newlines (not concatenation)', () => {
    const { events, parser } = collect();
    parser.feed('data: line one\ndata: line two\n\n');
    expect(events[0].data).toBe('line one\nline two');
  });

  it('strips only the single space after the colon, preserving leading whitespace', () => {
    const { events, parser } = collect();
    parser.feed('data:  padded\n\n');
    expect(events[0].data).toBe(' padded');
  });

  it('handles CRLF and lone-CR line endings', () => {
    const { events, parser } = collect();
    parser.feed('event: a\r\ndata: 1\r\n\r\n');
    // A chunk ending in a lone \r is ambiguous (could be half of \r\n) —
    // the parser must hold it until the next chunk or end() disambiguates.
    parser.feed('event: b\rdata: 2\r\r');
    expect(events).toEqual([{ event: 'a', data: '1' }]);
    parser.end();
    expect(events).toEqual([
      { event: 'a', data: '1' },
      { event: 'b', data: '2' },
    ]);
  });

  it('handles a CRLF split across chunk boundaries', () => {
    const { events, parser } = collect();
    parser.feed('data: x\r');
    parser.feed('\n\r\n');
    expect(events).toEqual([{ event: 'message', data: 'x' }]);
  });

  it('reassembles events split at arbitrary chunk boundaries', () => {
    const { events, parser } = collect();
    for (const ch of 'event: token\ndata: {"delta":" wor') parser.feed(ch);
    parser.feed('ld"}\n\n');
    expect(events).toEqual([{ event: 'token', data: '{"delta":" world"}' }]);
  });

  it('ignores comment/keepalive lines and unknown fields', () => {
    const { events, parser } = collect();
    parser.feed(': keepalive\nid: 42\nretry: 100\ndata: ok\n\n');
    expect(events).toEqual([{ event: 'message', data: 'ok' }]);
  });

  it('emits nothing for blank-line noise', () => {
    const { events, parser } = collect();
    parser.feed('\n\n\n');
    expect(events).toEqual([]);
  });

  it('flushes an unterminated final event on end()', () => {
    const { events, parser } = collect();
    parser.feed('event: done\ndata: {}');
    expect(events).toEqual([]);
    parser.end();
    expect(events).toEqual([{ event: 'done', data: '{}' }]);
  });
});
