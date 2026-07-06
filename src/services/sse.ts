/**
 * Minimal spec-conformant Server-Sent-Events parser (WHATWG EventSource
 * framing), decoupled from the network so it can be unit-tested. Feed it
 * decoded text chunks in any split; it dispatches complete events.
 *
 * Spec behaviors the previous ad-hoc parser got wrong and this one covers:
 * - line endings may be \n, \r\n, or \r
 * - multiple `data:` lines in one event are joined with \n (not concatenated)
 * - only the single space after the colon is stripped, not all whitespace
 * - `:` comment/keepalive lines are ignored
 * - a trailing event without a final blank line is flushed by end()
 */
export type SseEvent = { event: string; data: string };

export class SseParser {
  private buf = '';
  private eventType = '';
  private dataLines: string[] = [];

  constructor(private readonly onEvent: (e: SseEvent) => void) {}

  feed(chunk: string): void {
    this.buf += chunk;
    // Split on any line ending; keep a trailing partial line in the buffer.
    // A lone \r at the end of the buffer might be half of a \r\n — hold it.
    if (this.buf.endsWith('\r')) return this.consume(this.buf.slice(0, -1), '\r');
    this.consume(this.buf, '');
  }

  private consume(text: string, carry: string): void {
    const lines = text.split(/\r\n|\r|\n/);
    this.buf = (lines.pop() ?? '') + carry; // last element = partial line
    for (const line of lines) this.line(line);
  }

  /** Flush a final event that wasn't terminated by a blank line. */
  end(): void {
    if (this.buf) {
      this.line(this.buf.replace(/\r$/, ''));
      this.buf = '';
    }
    this.dispatch();
  }

  private line(line: string): void {
    if (line === '') return this.dispatch();
    if (line.startsWith(':')) return; // comment / keepalive
    const colon = line.indexOf(':');
    const field = colon === -1 ? line : line.slice(0, colon);
    let value = colon === -1 ? '' : line.slice(colon + 1);
    if (value.startsWith(' ')) value = value.slice(1);
    if (field === 'event') this.eventType = value;
    else if (field === 'data') this.dataLines.push(value);
    // id / retry are irrelevant to our transport — ignored.
  }

  private dispatch(): void {
    if (this.eventType === '' && this.dataLines.length === 0) return;
    this.onEvent({ event: this.eventType || 'message', data: this.dataLines.join('\n') });
    this.eventType = '';
    this.dataLines = [];
  }
}
