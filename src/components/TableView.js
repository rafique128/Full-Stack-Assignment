import React from 'react';
import {
  Sparkles, Mail, Edit3, Trash2, Building,
  Flame, Zap, Snowflake, Calendar, Phone
} from '../Icons';

const STATUS_OPTIONS = [
  'New Met',
  'Follow-up Pending',
  'In Conversation',
  'Meeting Scheduled',
  'Closed Won'
];

export default function TableView({
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

  if (leads.length === 0) {
    return (
      <div className="glass-panel" style={{ padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          No leads matching current search or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel table-container">
      <table className="lead-table">
        <thead>
          <tr>
            <th>Lead / Organization</th>
            <th>Contact Info</th>
            <th>Event Context</th>
            <th>Priority</th>
            <th>Stage / Status</th>
            <th>AI Intelligence</th>
            <th style={{ textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id}>
              <td>
                <div style={{ fontWeight: 700, color: '#fff', fontSize: '0.92rem' }}>
                  {lead.name}
                </div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                  <Building size={12} />
                  <span>{lead.company || 'Not Specified'}</span>
                </div>
              </td>

              <td>
                {lead.email ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Mail size={13} style={{ color: '#818cf8' }} />
                    <a
                      href={`mailto:${lead.email}`}
                      style={{ color: '#93c5fd', textDecoration: 'none', fontSize: '0.82rem' }}
                    >
                      {lead.email}
                    </a>
                  </div>
                ) : (
                  <span style={{ color: 'var(--text-dim)', fontSize: '0.8rem' }}>No email</span>
                )}
                {lead.phone && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginTop: '3px', fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                    <Phone size={12} />
                    <span>{lead.phone}</span>
                  </div>
                )}
              </td>

              <td>
                <div className="event-badge">
                  <Calendar size={12} />
                  <span>{lead.event_name}</span>
                </div>
                {lead.notes && (
                  <div style={{
                    fontSize: '0.76rem',
                    color: 'var(--text-dim)',
                    maxWidth: '220px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    marginTop: '4px'
                  }} title={lead.notes}>
                    {lead.notes}
                  </div>
                )}
              </td>

              <td>{getPriorityBadge(lead.priority)}</td>

              <td>
                <select
                  className="select-dropdown"
                  style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                  value={lead.follow_up_status || 'New Met'}
                  onChange={(e) => onUpdateStatus(lead.id, e.target.value)}
                >
                  {STATUS_OPTIONS.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </td>

              <td>
                {lead.ai_summary ? (
                  <div style={{
                    maxWidth: '240px',
                    fontSize: '0.76rem',
                    color: '#e9d5ff',
                    background: 'rgba(168, 85, 247, 0.08)',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    borderLeft: '2px solid #a855f7',
                    lineHeight: '1.3'
                  }}>
                    {lead.ai_summary.slice(0, 80)}...
                  </div>
                ) : (
                  <button
                    className="btn btn-ai btn-sm"
                    style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                    onClick={() => onOpenAIStudio(lead)}
                  >
                    <Sparkles size={12} />
                    <span>Analyze</span>
                  </button>
                )}
              </td>

              <td style={{ textAlign: 'right' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    className="btn-icon btn-ai"
                    onClick={() => onOpenAIStudio(lead)}
                    title="Open AI Studio"
                  >
                    <Sparkles size={14} />
                  </button>
                  <button
                    className="btn-icon btn-secondary"
                    onClick={() => onEditLead(lead)}
                    title="Edit Lead"
                  >
                    <Edit3 size={14} />
                  </button>
                  <button
                    className="btn-icon btn-secondary"
                    style={{ color: '#f87171' }}
                    onClick={() => onDeleteLead(lead.id)}
                    title="Delete Lead"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
