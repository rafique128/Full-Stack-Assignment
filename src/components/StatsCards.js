import React from 'react';
import { User, Flame, Calendar, Zap } from '../Icons';

export default function StatsCards({ stats, leads = [] }) {
  const totalLeads = leads.length;
  const hotLeads = leads.filter(l => l.priority === 'Hot').length;
  
  // Follow up completion rate (leads with status != 'New Met')
  const followedUp = leads.filter(l => l.follow_up_status && l.follow_up_status !== 'New Met').length;
  const followUpRate = totalLeads > 0 ? Math.round((followedUp / totalLeads) * 100) : 0;

  // Find top event
  const eventCounts = {};
  leads.forEach(l => {
    if (l.event_name) {
      eventCounts[l.event_name] = (eventCounts[l.event_name] || 0) + 1;
    }
  });
  const topEventEntry = Object.entries(eventCounts).sort((a, b) => b[1] - a[1])[0];
  const topEventName = topEventEntry ? topEventEntry[0] : 'No events yet';

  return (
    <div className="stats-grid">
      <div className="glass-panel stat-card" style={{ '--card-accent': '#6366f1' }}>
        <div className="stat-header">
          <span className="stat-title">Total Leads Met</span>
          <div className="stat-icon" style={{ color: '#818cf8' }}>
            <User size={18} />
          </div>
        </div>
        <div className="stat-val" style={{ color: '#ffffff' }}>{totalLeads}</div>
        <div className="stat-sub">Across all business summits</div>
      </div>

      <div className="glass-panel stat-card" style={{ '--card-accent': '#f43f5e' }}>
        <div className="stat-header">
          <span className="stat-title">Hot Deals</span>
          <div className="stat-icon" style={{ color: '#fb7185' }}>
            <Flame size={18} />
          </div>
        </div>
        <div className="stat-val" style={{ color: '#fb7185' }}>{hotLeads}</div>
        <div className="stat-sub">High purchasing intent / Decision makers</div>
      </div>

      <div className="glass-panel stat-card" style={{ '--card-accent': '#06b6d4' }}>
        <div className="stat-header">
          <span className="stat-title">Follow-up Velocity</span>
          <div className="stat-icon" style={{ color: '#38bdf8' }}>
            <Zap size={18} />
          </div>
        </div>
        <div className="stat-val" style={{ color: '#38bdf8' }}>{followUpRate}%</div>
        <div className="stat-sub">{followedUp} of {totalLeads} leads engaged</div>
      </div>

      <div className="glass-panel stat-card" style={{ '--card-accent': '#a855f7' }}>
        <div className="stat-header">
          <span className="stat-title">Top Event Anchor</span>
          <div className="stat-icon" style={{ color: '#c084fc' }}>
            <Calendar size={18} />
          </div>
        </div>
        <div className="stat-val" style={{ fontSize: '1.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#e9d5ff' }}>
          {topEventName}
        </div>
        <div className="stat-sub">
          {topEventEntry ? `${topEventEntry[1]} leads captured here` : 'Record your first lead'}
        </div>
      </div>
    </div>
  );
}
