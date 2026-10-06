import React, { useState, useEffect } from 'react';
import { X, Sparkles, Mic, User } from '../Icons';

export default function LeadModal({
  isOpen,
  onClose,
  onSave,
  initialData = null,
  eventsList = []
}) {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    event_name: 'TechCrunch Disrupt 2026',
    notes: '',
    follow_up_status: 'New Met',
    priority: 'Warm',
    tags: ''
  });

  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        company: initialData.company || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        event_name: initialData.event_name || 'TechCrunch Disrupt 2026',
        notes: initialData.notes || '',
        follow_up_status: initialData.follow_up_status || 'New Met',
        priority: initialData.priority || 'Warm',
        tags: initialData.tags || ''
      });
    } else {
      setFormData({
        name: '',
        company: '',
        email: '',
        phone: '',
        event_name: eventsList[0] || 'TechCrunch Disrupt 2026',
        notes: '',
        follow_up_status: 'New Met',
        priority: 'Warm',
        tags: ''
      });
    }
  }, [initialData, eventsList, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert('Please provide lead name');
      return;
    }
    if (!formData.event_name.trim()) {
      alert('Please specify the event name');
      return;
    }
    onSave(formData);
  };

  // Voice speech dictation using Web Speech API
  const handleToggleVoiceNotes = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSpeechError('Speech recognition is not supported in this browser. Try Chrome/Edge.');
      setTimeout(() => setSpeechError(''), 4000);
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setSpeechError('');
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setFormData((prev) => ({
        ...prev,
        notes: prev.notes ? `${prev.notes} ${transcript}` : transcript
      }));
      setIsListening(false);
    };

    recognition.onerror = (err) => {
      console.warn('Speech error:', err);
      setIsListening(false);
      setSpeechError('Could not capture audio. Check microphone permissions.');
      setTimeout(() => setSpeechError(''), 4000);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            <User size={20} style={{ color: '#818cf8' }} />
            <span>{initialData ? 'Edit Event Lead' : 'Capture New Event Lead'}</span>
          </div>
          <button className="btn-icon btn-secondary" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Sarah Jenkins"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Company / Organization</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. HyperScale Tech"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="sarah@hyperscale.io"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="+1 (555) 234-5678"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Business Event / Summit *</label>
                <input
                  type="text"
                  required
                  className="form-input"
                  placeholder="e.g. Slush 2026, SaaStr Annual"
                  value={formData.event_name}
                  onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                  list="event-suggestions"
                />
                <datalist id="event-suggestions">
                  {eventsList.map((ev) => (
                    <option key={ev} value={ev} />
                  ))}
                  <option value="TechCrunch Disrupt 2026" />
                  <option value="Web Summit Lisbon" />
                  <option value="SaaStr Annual 2026" />
                  <option value="AWS Summit" />
                  <option value="GITEX Global 2026" />
                </datalist>
              </div>

              <div className="form-group">
                <label className="form-label">Lead Priority (Temperature)</label>
                <select
                  className="form-select"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="Hot">🔥 Hot (Immediate Intent / Budget)</option>
                  <option value="Warm">⚡ Warm (Good Fit / Follow Up)</option>
                  <option value="Cool">❄️ Cool (Nurture / Long Term)</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Follow-up Pipeline Stage</label>
                <select
                  className="form-select"
                  value={formData.follow_up_status}
                  onChange={(e) => setFormData({ ...formData, follow_up_status: e.target.value })}
                >
                  <option value="New Met">📌 New Met</option>
                  <option value="Follow-up Pending">⏳ Follow-up Pending</option>
                  <option value="In Conversation">💬 In Conversation</option>
                  <option value="Meeting Scheduled">📅 Meeting Scheduled</option>
                  <option value="Closed Won">🏆 Closed Won</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Tags (comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enterprise, AI, Decision Maker"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <label className="form-label">
                  Booth Interaction Notes & Pain Points
                </label>
                <button
                  type="button"
                  onClick={handleToggleVoiceNotes}
                  className={`btn btn-sm ${isListening ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ fontSize: '0.75rem', padding: '4px 10px' }}
                >
                  <Mic size={13} />
                  <span>{isListening ? 'Listening...' : 'Voice Dictate'}</span>
                </button>
              </div>
              <textarea
                rows={3}
                className="form-textarea"
                placeholder="Key things discussed, pain points, demo interest, team size, budget expectations..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
              {speechError && (
                <div style={{ fontSize: '0.75rem', color: '#f87171' }}>
                  {speechError}
                </div>
              )}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <Sparkles size={16} />
              <span>{initialData ? 'Update Lead' : 'Save & AI Analyze'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
