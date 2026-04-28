import React from 'react';
import { CreditCard, ExternalLink } from 'lucide-react';

const BillingSettings: React.FC = () => {
  return (
    <section className="flex flex-col gap-4">
      <header className="flex items-start gap-3">
        <CreditCard className="mt-1 h-4 w-4 text-text-sec" />
        <div>
          <h1 className="font-display text-[18px] font-semibold tracking-tight text-text">Billing</h1>
          <p className="text-[12px] text-text-sec">
            Plan, seats, and invoices. Managed by the org owner.
          </p>
        </div>
      </header>

      <div className="rounded-xl border border-border bg-surface">
        <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <div className="font-display text-[12px] uppercase tracking-[0.18em] text-text-sec">
              Current plan
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-[16px] font-semibold text-text">Team</span>
              <span className="text-[12px] text-text-sec">$99 / month · billed monthly</span>
            </div>
            <div className="mt-1 text-[11px] text-text-sec">
              3 seats · unlimited plans · BDI knowledge graph
            </div>
          </div>
          <button
            type="button"
            disabled
            className="rounded-md border border-border bg-surface-hi px-3 py-1.5 text-[11px] font-medium text-text-sec opacity-60"
            title="Self-serve billing not yet enabled"
          >
            Manage seats
          </button>
        </div>
        <div className="px-4 py-3">
          <div className="font-display text-[12px] uppercase tracking-[0.18em] text-text-sec">
            Invoices
          </div>
          <div className="mt-2 text-[12px] text-text-sec">
            Invoices are emailed to the org owner. To download past invoices, contact{' '}
            <a href="mailto:billing@agentplanner.io" className="text-text underline underline-offset-2">
              billing@agentplanner.io
            </a>
            .
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-[11px] text-text-sec">
          <span>Payment method on file: ending 4242</span>
          <a
            href="mailto:billing@agentplanner.io"
            className="inline-flex items-center gap-1 text-text hover:opacity-80"
          >
            Update <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>

      <div className="rounded-xl border border-dashed border-border bg-surface/40 px-4 py-3 text-[11px] text-text-sec">
        Self-serve billing is rolling out. Until then, the team plan is enabled by default for paid
        workspaces — reach out if you need a different tier.
      </div>
    </section>
  );
};

export default BillingSettings;
