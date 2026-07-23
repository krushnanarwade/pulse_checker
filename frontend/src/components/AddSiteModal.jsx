import React, { useState } from 'react';
import { X, Globe, Clock, Sliders, Shield } from 'lucide-react';

export function AddSiteModal({ isOpen, onClose, onAddSite }) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [checkInterval, setCheckInterval] = useState(5);
  const [timeout, setTimeoutVal] = useState(10);
  const [maxDepth, setMaxDepth] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!name || !url) {
      setError('Please fill in both Website Name and URL.');
      return;
    }

    setLoading(true);
    try {
      await onAddSite({
        name,
        url,
        check_interval_minutes: parseInt(checkInterval),
        timeout_seconds: parseInt(timeout),
        max_depth: parseInt(maxDepth),
        is_active: true
      });
      onClose();
      setName('');
      setUrl('');
    } catch (err) {
      setError(err.message || 'Failed to create website monitor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#818cf8' }}>
              <Globe size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem' }}>Add Monitored Website</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Configure automated pinging and link crawling</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{ padding: '0.75rem 1rem', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '10px', color: '#fca5a5', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Website Name / Label</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Corporate Landing Page"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Target URL</label>
            <input
              type="url"
              className="form-input"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Clock size={14} /> Check Frequency
              </label>
              <select
                className="form-select"
                value={checkInterval}
                onChange={(e) => setCheckInterval(e.target.value)}
              >
                <option value={1}>Every 1 Minute</option>
                <option value={5}>Every 5 Minutes</option>
                <option value={15}>Every 15 Minutes</option>
                <option value={60}>Every 1 Hour</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                <Sliders size={14} /> Request Timeout
              </label>
              <select
                className="form-select"
                value={timeout}
                onChange={(e) => setTimeoutVal(e.target.value)}
              >
                <option value={5}>5 Seconds</option>
                <option value={10}>10 Seconds (Standard)</option>
                <option value={30}>30 Seconds</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <Shield size={14} /> Link Crawl Depth
            </label>
            <select
              className="form-select"
              value={maxDepth}
              onChange={(e) => setMaxDepth(e.target.value)}
            >
              <option value={1}>Level 1 - Direct Page Links Only</option>
              <option value={2}>Level 2 - Deep Link Crawl</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Start Monitoring'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
