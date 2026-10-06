import React from 'react';
import { Search, LayoutGrid, Kanban, X } from '../Icons';

export const STATUS_LIST = [
  "All",
  "New Met",
  "Follow-up Pending",
  "In Conversation",
  "Meeting Scheduled",
  "Closed Won"
];

export const PRIORITY_LIST = ["All", "Hot", "Warm", "Cool"];

export default function FilterBar({
  search,
  setSearch,
  status,
  setStatus,
  event,
  setEvent,
  priority,
  setPriority,
  eventsList = [],
  viewMode,
  setViewMode
}) {
  return (
    <div className="filter-bar glass-panel">
      <div className="search-input-wrapper">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          className="search-input"
          placeholder="Search leads by name, company, notes, event..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'transparent',
              color: 'var(--text-dim)',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <X size={15} />
          </button>
        )}
      </div>

      <div className="filter-selects">
        <select
          className="select-dropdown"
          value={event}
          onChange={(e) => setEvent(e.target.value)}
          title="Filter by Event"
        >
          <option value="All">All Events</option>
          {eventsList.map(ev => (
            <option key={ev} value={ev}>{ev}</option>
          ))}
        </select>

        <select
          className="select-dropdown"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          title="Filter by Follow-up Status"
        >
          {STATUS_LIST.map(st => (
            <option key={st} value={st}>
              {st === "All" ? "All Stages" : st}
            </option>
          ))}
        </select>

        <select
          className="select-dropdown"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          title="Filter by Priority"
        >
          {PRIORITY_LIST.map(p => (
            <option key={p} value={p}>
              {p === "All" ? "All Priorities" : `${p} Priority`}
            </option>
          ))}
        </select>

        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === 'kanban' ? 'active' : ''}`}
            onClick={() => setViewMode('kanban')}
            title="Kanban Pipeline View"
          >
            <Kanban size={15} />
            <span>Pipeline</span>
          </button>
          <button
            className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Data Table View"
          >
            <LayoutGrid size={15} />
            <span>Table</span>
          </button>
        </div>
      </div>
    </div>
  );
}
