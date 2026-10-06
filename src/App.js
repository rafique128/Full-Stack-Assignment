import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import StatsCards from './components/StatsCards';
import FilterBar from './components/FilterBar';
import KanbanBoard from './components/KanbanBoard';
import TableView from './components/TableView';
import LeadModal from './components/LeadModal';
import QuickScanModal from './components/QuickScanModal';
import AIDrawer from './components/AIDrawer';
import {
  fetchLeads,
  createLead,
  updateLead,
  deleteLead,
  fetchStats,
  seedDemoData,
  getExportCsvUrl
} from './api';

function App() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSeeding, setIsSeeding] = useState(false);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [eventFilter, setEventFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'table'

  // Modals & Drawers
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [isQuickScanOpen, setIsQuickScanOpen] = useState(false);
  const [aiStudioLead, setAiStudioLead] = useState(null);

  // Toast notification
  const [toast, setToast] = useState('');

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3500);
  };

  const loadData = useCallback(async () => {
    try {
      const [leadsData, statsData] = await Promise.all([
        fetchLeads({
          search: search,
          status: statusFilter,
          event: eventFilter,
          priority: priorityFilter
        }),
        fetchStats().catch(() => null)
      ]);
      setLeads(leadsData);
      setStats(statsData);
    } catch (err) {
      console.error('Failed to load leads:', err);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, eventFilter, priorityFilter]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Extract distinct event names for filter list
  const distinctEvents = Array.from(
    new Set(leads.map((l) => l.event_name).filter(Boolean))
  );

  const handleSaveLead = async (leadData) => {
    try {
      if (editingLead) {
        await updateLead(editingLead.id, leadData);
        showToast(`Lead "${leadData.name}" updated successfully.`);
      } else {
        await createLead(leadData);
        showToast(`Lead "${leadData.name}" captured & AI analyzed!`);
      }
      setIsLeadModalOpen(false);
      setEditingLead(null);
      loadData();
    } catch (err) {
      alert(err.message || 'Error saving lead');
    }
  };

  const handleDeleteLead = async (id) => {
    if (!window.confirm('Are you sure you want to remove this lead?')) return;
    try {
      await deleteLead(id);
      showToast('Lead removed.');
      loadData();
    } catch (err) {
      alert('Failed to delete lead');
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      await updateLead(id, { follow_up_status: newStatus });
      setLeads((prev) =>
        prev.map((l) => (l.id === id ? { ...l, follow_up_status: newStatus } : l))
      );
      showToast(`Status updated to "${newStatus}"`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickScanCreated = async (extracted) => {
    try {
      await createLead(extracted);
      showToast(`AI extracted and created lead: ${extracted.name}`);
      loadData();
    } catch (err) {
      alert('Failed to save extracted lead: ' + err.message);
    }
  };

  const handleSeedDemo = async () => {
    setIsSeeding(true);
    try {
      const res = await seedDemoData();
      showToast(res.message || 'Demo conference leads loaded!');
      loadData();
    } catch (err) {
      alert('Could not seed demo leads');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleExportCsv = () => {
    window.location.href = getExportCsvUrl();
  };

  return (
    <div className="app-container">
      <Header
        onOpenNewLead={() => {
          setEditingLead(null);
          setIsLeadModalOpen(true);
        }}
        onOpenQuickScan={() => setIsQuickScanOpen(true)}
        onSeedDemo={handleSeedDemo}
        onExportCsv={handleExportCsv}
        isSeeding={isSeeding}
        onRefresh={loadData}
      />

      <StatsCards stats={stats} leads={leads} />

      <FilterBar
        search={search}
        setSearch={setSearch}
        status={statusFilter}
        setStatus={setStatusFilter}
        event={eventFilter}
        setEvent={setEventFilter}
        priority={priorityFilter}
        setPriority={setPriorityFilter}
        eventsList={distinctEvents}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-muted)' }}>
          Loading event intelligence pipeline...
        </div>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard
          leads={leads}
          onEditLead={(lead) => {
            setEditingLead(lead);
            setIsLeadModalOpen(true);
          }}
          onDeleteLead={handleDeleteLead}
          onOpenAIStudio={(lead) => setAiStudioLead(lead)}
          onUpdateStatus={handleUpdateStatus}
        />
      ) : (
        <TableView
          leads={leads}
          onEditLead={(lead) => {
            setEditingLead(lead);
            setIsLeadModalOpen(true);
          }}
          onDeleteLead={handleDeleteLead}
          onOpenAIStudio={(lead) => setAiStudioLead(lead)}
          onUpdateStatus={handleUpdateStatus}
        />
      )}

      {/* Modals & Drawers */}
      <LeadModal
        isOpen={isLeadModalOpen}
        onClose={() => {
          setIsLeadModalOpen(false);
          setEditingLead(null);
        }}
        onSave={handleSaveLead}
        initialData={editingLead}
        eventsList={distinctEvents}
      />

      <QuickScanModal
        isOpen={isQuickScanOpen}
        onClose={() => setIsQuickScanOpen(false)}
        onLeadCreated={handleQuickScanCreated}
      />

      <AIDrawer
        isOpen={Boolean(aiStudioLead)}
        onClose={() => setAiStudioLead(null)}
        lead={aiStudioLead}
        onLeadUpdated={(updated) => {
          setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
        }}
      />

      {toast && (
        <div className="toast-msg">
          <span>✨</span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}

export default App;
