import React, { useState } from 'react';
import { X, Sparkles, Scan, Check } from '../Icons';
import { requestAIExtract } from '../api';

export default function QuickScanModal({ isOpen, onClose, onLeadCreated }) {
  const [rawText, setRawText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleScan = async () => {
    if (!rawText.trim()) {
      setError('Please paste text from a business card or booth note.');
      return;
    }

    setIsScanning(true);
    setError('');

    try {
      const data = await requestAIExtract(rawText);
      setExtractedData(data);
    } catch (err) {
      console.error(err);
      setError('Failed to extract lead details. Try typing clearly.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleApply = () => {
    if (!extractedData) return;
    onLeadCreated(extractedData);
    setRawText('');
    setExtractedData(null);
    onClose();
  };

  const handleLoadSampleCard = () => {
    setRawText(
      `Alexandria Chen\nChief Technology Officer\nVortex Robotics Corp\nalex.chen@vortexrobotics.com\n+1 (415) 782-9901\nEvent: TechCrunch Disrupt 2026\nNotes: Met at keynote. Currently evaluating autonomous fleet orchestration. Very urgent, looking to run a pilot next month. Big budget allocated.`
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        <div className="modal-header">
          <div className="modal-title">
            <Scan size={20} style={{ color: '#06b6d4' }} />
            <span>AI Quick Scribe & Card Extractor</span>
          </div>
          <button className="btn-icon btn-secondary" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            Paste raw business card OCR text, email signatures, or quick booth dictations.
            The AI engine automatically parses contact fields, event, intent, and priority.
          </p>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleLoadSampleCard}
            >
              Paste Sample Business Card
            </button>
          </div>

          <div className="scanner-window" style={{ minHeight: '140px' }}>
            {isScanning && <div className="scanner-laser" />}
            <textarea
              className="form-textarea"
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                padding: '14px',
                minHeight: '140px',
                color: '#fff',
                fontFamily: 'monospace'
              }}
              placeholder="e.g. &#10;Dr. Jordan Lee&#10;VP AI Research at Synapse Labs&#10;jordan@synapselabs.ai | +1 650 998 1234&#10;Met at Slush 2026. Needs enterprise security review ASAP..."
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
            />
          </div>

          {error && (
            <div style={{ color: '#f87171', fontSize: '0.8rem' }}>
              {error}
            </div>
          )}

          {extractedData && (
            <div
              style={{
                background: 'rgba(6, 182, 212, 0.08)',
                border: '1px solid rgba(6, 182, 212, 0.3)',
                borderRadius: '12px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase' }}>
                  AI Extracted Lead Profile
                </span>
                <span className={`priority-pill priority-${extractedData.priority?.toLowerCase() || 'warm'}`}>
                  {extractedData.priority} Priority
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.82rem' }}>
                <div><strong>Name:</strong> {extractedData.name}</div>
                <div><strong>Company:</strong> {extractedData.company}</div>
                <div><strong>Email:</strong> {extractedData.email || 'N/A'}</div>
                <div><strong>Phone:</strong> {extractedData.phone || 'N/A'}</div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <strong>Event:</strong> {extractedData.event_name}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button type="button" className="btn btn-secondary" onClick={onClose}>
            Cancel
          </button>
          {!extractedData ? (
            <button
              type="button"
              className="btn btn-ai"
              onClick={handleScan}
              disabled={isScanning}
            >
              <Sparkles size={16} />
              <span>{isScanning ? 'Extracting Lead Intelligence...' : 'Extract Lead Info'}</span>
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleApply}
            >
              <Check size={16} />
              <span>Confirm & Save Lead</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
