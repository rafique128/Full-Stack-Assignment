import React from 'react';
import { Sparkles, Plus, Scan, Download, RefreshCw } from '../Icons';

export default function Header({
  onOpenNewLead,
  onOpenQuickScan,
  onSeedDemo,
  onExportCsv,
  isSeeding,
  onRefresh
}) {
  return (
    <header className="app-header glass-panel">
      <div className="logo-badge">
        <div className="logo-icon-wrapper">
          <Sparkles size={24} />
        </div>
        <div>
          <div className="brand-title">
            NexusPulse <span className="ai-tag">AI Lead Radar</span>
          </div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            High-Touch Event Lead Capture & Automated Follow-Up Studio
          </p>
        </div>
      </div>

      <div className="header-actions">
        <button
          className="btn btn-secondary btn-sm"
          onClick={onRefresh}
          title="Refresh Data"
        >
          <RefreshCw size={15} />
          <span>Sync</span>
        </button>

        <button
          className="btn btn-secondary btn-sm"
          onClick={onSeedDemo}
          disabled={isSeeding}
          title="Load realistic sample conference leads"
        >
          <Sparkles size={15} />
          <span>{isSeeding ? 'Seeding...' : 'Demo Seeds'}</span>
        </button>

        <button
          className="btn btn-secondary btn-sm"
          onClick={onExportCsv}
          title="Download leads as CSV"
        >
          <Download size={15} />
          <span>Export CSV</span>
        </button>

        <button
          className="btn btn-ai"
          onClick={onOpenQuickScan}
          title="Paste raw notes or business card text"
        >
          <Scan size={16} />
          <span>AI Quick Scribe</span>
        </button>

        <button
          className="btn btn-primary"
          onClick={onOpenNewLead}
        >
          <Plus size={16} />
          <span>Capture Lead</span>
        </button>
      </div>
    </header>
  );
}
