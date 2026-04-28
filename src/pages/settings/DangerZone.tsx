import React, { useState } from 'react';
import { AlertTriangle } from 'lucide-react';

const DangerZone: React.FC = () => {
  const [confirmText, setConfirmText] = useState('');
  const [busy, setBusy] = useState(false);
  const armed = confirmText.trim().toLowerCase() === 'delete';

  const onDelete = () => {
    if (!armed || busy) return;
    setBusy(true);
    // Account deletion is a server-side flow; surface a clear hand-off until
    // the self-serve endpoint ships.
    window.location.href =
      'mailto:support@agentplanner.io?subject=Delete%20my%20AgentPlanner%20account';
    setBusy(false);
  };

  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-start gap-3">
        <AlertTriangle className="mt-1 h-4 w-4 text-red" />
        <div>
          <h1 className="font-display text-[18px] font-semibold tracking-tight text-text">
            Danger zone
          </h1>
          <p className="text-[12px] text-text-sec">
            Irreversible operations. Read carefully before acting.
          </p>
        </div>
      </header>

      <div className="rounded-xl border border-red/40 bg-surface">
        <div className="border-b border-border px-4 py-3">
          <div className="font-display text-[12px] uppercase tracking-[0.18em] text-red">
            Delete account
          </div>
          <p className="mt-1 text-[12px] text-text-sec">
            Permanently removes your user, your owned organizations, all plans, all knowledge
            episodes, and all API tokens. Members of orgs you don&apos;t own keep their access.
          </p>
        </div>
        <div className="flex flex-col gap-3 px-4 py-3">
          <label className="flex flex-col gap-1 text-[11px] text-text-sec">
            Type <span className="font-mono text-text">delete</span> to confirm
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              className="mt-1 rounded-md border border-border bg-surface-hi px-3 py-1.5 text-[12px] text-text placeholder:text-text-sec focus:border-red focus:outline-none"
              placeholder="delete"
            />
          </label>
          <button
            type="button"
            disabled={!armed || busy}
            onClick={onDelete}
            className={[
              'self-start rounded-md px-3 py-1.5 text-[12px] font-medium transition-opacity',
              armed
                ? 'bg-red text-bg hover:opacity-90'
                : 'bg-surface-hi text-text-sec opacity-60 cursor-not-allowed',
            ].join(' ')}
          >
            {busy ? 'Contacting support…' : 'Delete my account'}
          </button>
          <p className="text-[11px] text-text-sec">
            Self-serve deletion is in review — for now this opens a pre-filled support email so we
            can confirm ownership before destroying data.
          </p>
        </div>
      </div>
    </section>
  );
};

export default DangerZone;
