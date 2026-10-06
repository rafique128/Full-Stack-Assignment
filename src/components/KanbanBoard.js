import React from 'react';
import {
  Sparkles, Edit3, Trash2, Building,
  Flame, Zap, Snowflake, Calendar
} from '../Icons';

const COLUMNS = [
  { id: 'New Met', label: 'New Met', color: '#6366f1' },
  { id: 'Follow-up Pending', label: 'Follow-up Pending', color: '#f59e0b' },
  { id: 'In Conversation', label: 'In Conversation', color: '#06b6d4' },
  { id: 'Meeting Scheduled', label: 'Meeting Scheduled', color: '#a855f7' },
  { id: 'Closed Won', label: 'Closed Won', color: '#10b981' }
];

export default function KanbanBoard({
  leads,
  onEditLead,
  onDeleteLead,
  onOpenAIStudio,
  onUpdateStatus
}) {
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Hot':
        return (
          <span className="priority-pill priority-hot">
            <Flame size={12} /> Hot
          </span>
        );
      case 'Warm':
        return (
          <span className="priority-pill priority-warm">
            <Zap size={12} /> Warm
          </span>
        );
      case 'Cool':
      default:
        return (
          <span className="priority-pill priority-cool">
            <Snowflake size={12} /> Cool
          </span>
        );
    }
  };

  return (
    <div className="kanban-board">
      {COLUMNS.map((col) => {
        const colLeads = leads.filter((l) => (l.follow_up_status || 'New Met') === col.id);

        return (
          <div key={col.id} className="kanban-col">
            <div className="col-header">
              <div className="col-title-group">
                <span className="col-dot" style={{ backgroundColor: col.color, boxShadow: `0 0 8px ${col.color}` }} />
                <span className="col-title">{col.label}</span>
              </div>
              <span className="col-count">{colLeads.length}</span>
            </div>

            <div className="col-cards">
              {colLeads.length === 0 ? (
                <div style={{
                  padding: '30px 10px',
                  textAlign: 'center',
                  fontSize: '0.78rem',
                  color: 'var(--text-dim)',
                  border: '1px dashed var(--border-subtle)',
                  borderRadius: '10px'
                }}>
                  No leads in this stage
                </div>
              ) : (
                colLeads.map((lead) => (
                  <div key={lead.id} className="lead-card">
                    <div className="card-top">
                      <div>
                        <div className="lead-name">{lead.name}</div>
                        <div className="lead-company">
                          <Building size={13} />
                          <span>{lead.company || 'Independent'}</span>
                        </div>
                      </div>
                      {getPriorityBadge(lead.priority)}
                    </div>

                    <div className="event-badge">
                      <Calendar size={12} />
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '170px' }}>
                        {lead.event_name}
                      </span>
                    </div>

                    {lead.notes && (
                      <div className="lead-notes-preview" title={lead.notes}>
                        {lead.notes}
                      </div>
                    )}

                    {lead.ai_summary && (
                      <div className="ai-summary-snippet">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: '#c084fc', marginBottom: '2px' }}>
                          <Sparkles size={11} /> AI Takeaway
                        </div>
                        {lead.ai_summary}
                      </div>
                    )}

                    <div className="card-actions-bar">
                      <select
                        className="stage-selector-mini"
                        value={lead.follow_up_status || 'New Met'}
                        onChange={(e) => onUpdateStatus(lead.id, e.target.value)}
                        title="Move to another stage"
                      >
                        {COLUMNS.map((c) => (
                          <option key={c.id} value={c.id}>
                            Move to: {c.label}
                          </option>
                        ))}
                      </select>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          className="btn-icon btn-ai"
                          style={{ width: '28px', height: '28px', borderRadius: '6px' }}
                          onClick={() => onOpenAIStudio(lead)}
                          title="Generate AI Follow-Up Drafts"
                        >
                          <Sparkles size={13} />
                        </button>

                        <button
                          className="btn-icon btn-secondary"
                          style={{ width: '28px', height: '28px', borderRadius: '6px' }}
                          onClick={() => onEditLead(lead)}
                          title="Edit Lead"
                        >
                          <Edit3 size={13} />
                        </button>

                        <button
                          className="btn-icon btn-secondary"
                          style={{ width: '28px', height: '28px', borderRadius: '6px', color: '#f87171' }}
                          onClick={() => onDeleteLead(lead.id)}
                          title="Delete Lead"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
