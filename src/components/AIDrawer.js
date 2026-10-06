import React, { useState, useEffect } from 'react';
import { X, Sparkles, Copy, Check, Mail, ExternalLink, RefreshCw } from '../Icons';
import { requestAIDraft, requestAISummary, updateLead } from '../api';

const TONES = [
  'Warm & Professional',
  'Executive Strategic',
  'Casual Coffee',
  'Direct Value Pitch'
];

export default function AIDrawer({
  isOpen,
  onClose,
  lead,
  onLeadUpdated
}) {
  const [activeTab, setActiveTab] = useState('email'); // 'email', 'linkedin', 'whatsapp', 'summary'
  const [selectedTone, setSelectedTone] = useState('Warm & Professional');
  const [drafts, setDrafts] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && lead) {
      loadAIDrafts(selectedTone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, lead]);

  const loadAIDrafts = async (tone) => {
    if (!lead) return;
    setLoading(true);
    setCopied(false);
    setSavedSuccess(false);

    try {
      const [draftRes, sumRes] = await Promise.all([
        requestAIDraft({
          lead_id: lead.id,
          name: lead.name,
          company: lead.company,
          event_name: lead.event_name,
          notes: lead.notes || `Met at ${lead.event_name}`,
          tone: tone
        }),
        requestAISummary({
          lead_id: lead.id,
          name: lead.name,
          company: lead.company,
          event_name: lead.event_name,
          notes: lead.notes || `Met at ${lead.event_name}`
        })
      ]);

      setDrafts(draftRes);
      setSummaryData(sumRes);
      if (onLeadUpdated) {
        onLeadUpdated({
          ...lead,
          ai_summary: sumRes.summary,
          ai_followup_email: draftRes.email_body,
          ai_followup_linkedin: draftRes.linkedin_dm
        });
      }
    } catch (err) {
      console.error('Failed to generate AI drafts:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !lead) return null;

  const handleToneChange = (tone) => {
    setSelectedTone(tone);
    loadAIDrafts(tone);
  };

  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleOpenEmailClient = () => {
    if (!drafts) return;
    const recipient = lead.email || '';
    const subject = encodeURIComponent(drafts.email_subject || `Following up from ${lead.event_name}`);
    const body = encodeURIComponent(drafts.email_body || '');
    window.open(`mailto:${recipient}?subject=${subject}&body=${body}`, '_blank');
  };

  const handleSaveToRecord = async () => {
    if (!drafts || !summaryData) return;
    try {
      await updateLead(lead.id, {
        ai_summary: summaryData.summary,
        ai_key_points: summaryData.key_points ? summaryData.key_points.join(' • ') : '',
        ai_followup_email: drafts.email_body,
        ai_followup_linkedin: drafts.linkedin_dm
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      if (onLeadUpdated) {
        onLeadUpdated({
          ...lead,
          ai_summary: summaryData.summary,
          ai_followup_email: drafts.email_body,
          ai_followup_linkedin: drafts.linkedin_dm
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content ai-studio-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <Sparkles size={20} style={{ color: '#c084fc' }} />
            <span>AI Follow-Up Studio: {lead.name}</span>
          </div>
          <button className="btn-icon btn-secondary" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Lead Context Pill */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.82rem'
            }}
          >
            <div>
              <strong>{lead.name}</strong> • {lead.company || 'Organization'} • <span style={{ color: '#818cf8' }}>{lead.event_name}</span>
            </div>
            <span className={`priority-pill priority-${lead.priority?.toLowerCase() || 'warm'}`}>
              {lead.priority}
            </span>
          </div>

          {/* Tone Selector */}
          <div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
              SELECT COMMUNICATION TONE
            </div>
            <div className="tone-selector">
              {TONES.map((tone) => (
                <button
                  key={tone}
                  className={`tone-chip ${selectedTone === tone ? 'active' : ''}`}
                  onClick={() => handleToneChange(tone)}
                  disabled={loading}
                >
                  {tone}
                </button>
              ))}
            </div>
          </div>

          {/* Channel Tabs */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px' }}>
            <button
              className={`toggle-btn ${activeTab === 'email' ? 'active' : ''}`}
              onClick={() => setActiveTab('email')}
            >
              <Mail size={14} />
              <span>Email Draft</span>
            </button>
            <button
              className={`toggle-btn ${activeTab === 'linkedin' ? 'active' : ''}`}
              onClick={() => setActiveTab('linkedin')}
            >
              <span>LinkedIn InMail</span>
            </button>
            <button
              className={`toggle-btn ${activeTab === 'whatsapp' ? 'active' : ''}`}
              onClick={() => setActiveTab('whatsapp')}
            >
              <span>Quick Ping</span>
            </button>
            <button
              className={`toggle-btn ${activeTab === 'summary' ? 'active' : ''}`}
              onClick={() => setActiveTab('summary')}
            >
              <Sparkles size={14} />
              <span>Executive Brief</span>
            </button>
          </div>

          {/* Output Content */}
          {loading ? (
            <div style={{ padding: '60px 20px', textAlign: 'center', color: '#c084fc' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                <RefreshCw size={20} className="spinning" />
                <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>
                  Crafting hyper-personalized follow-up with AI...
                </span>
              </div>
            </div>
          ) : (
            <div>
              {activeTab === 'email' && drafts && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div
                    style={{
                      background: 'rgba(0,0,0,0.3)',
                      padding: '10px 14px',
                      borderRadius: '8px',
                      border: '1px solid var(--border-subtle)',
                      fontSize: '0.85rem'
                    }}
                  >
                    <span style={{ color: 'var(--text-dim)', fontWeight: 600 }}>Subject: </span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{drafts.email_subject}</span>
                  </div>

                  <div className="ai-output-box">
                    {drafts.email_body}
                  </div>

                  <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleCopy(`${drafts.email_subject}\n\n${drafts.email_body}`)}
                    >
                      {copied ? <Check size={14} style={{ color: '#34d399' }} /> : <Copy size={14} />}
                      <span>{copied ? 'Copied to Clipboard!' : 'Copy Email'}</span>
                    </button>

                    <button
                      className="btn btn-primary btn-sm"
                      onClick={handleOpenEmailClient}
                    >
                      <ExternalLink size={14} />
                      <span>Open in Mail Client</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'linkedin' && drafts && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="ai-output-box">
                    {drafts.linkedin_dm}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleCopy(drafts.linkedin_dm)}
                    >
                      {copied ? <Check size={14} style={{ color: '#34d399' }} /> : <Copy size={14} />}
                      <span>{copied ? 'Copied!' : 'Copy LinkedIn Message'}</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'whatsapp' && drafts && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div className="ai-output-box">
                    {drafts.whatsapp_quick_chat}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleCopy(drafts.whatsapp_quick_chat)}
                    >
                      {copied ? <Check size={14} style={{ color: '#34d399' }} /> : <Copy size={14} />}
                      <span>{copied ? 'Copied!' : 'Copy Quick Ping'}</span>
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'summary' && summaryData && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="ai-output-box" style={{ background: 'rgba(168, 85, 247, 0.08)', borderColor: 'rgba(168, 85, 247, 0.3)' }}>
                    <div style={{ fontWeight: 700, color: '#d8b4fe', marginBottom: '6px' }}>
                      Interaction Summary:
                    </div>
                    {summaryData.summary}
                  </div>

                  {summaryData.key_points && summaryData.key_points.length > 0 && (
                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px 16px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>
                        KEY TAKEAWAYS & ACTION POINTS
                      </div>
                      <ul style={{ paddingLeft: '18px', fontSize: '0.84rem', lineHeight: '1.6', color: '#cbd5e1' }}>
                        {summaryData.key_points.map((pt, i) => (
                          <li key={i}>{pt}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {summaryData.recommended_action && (
                    <div style={{ background: 'rgba(6, 182, 212, 0.08)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(6, 182, 212, 0.3)', fontSize: '0.84rem' }}>
                      <strong style={{ color: '#38bdf8' }}>Recommended Next Step: </strong>
                      {summaryData.recommended_action}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => loadAIDrafts(selectedTone)}
            disabled={loading}
          >
            <RefreshCw size={14} />
            <span>Regenerate</span>
          </button>

          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSaveToRecord}
          >
            <Check size={16} />
            <span>{savedSuccess ? 'Saved to Database!' : 'Persist AI Drafts'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
