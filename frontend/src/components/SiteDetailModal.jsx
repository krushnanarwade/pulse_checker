import React, { useState, useEffect } from 'react';
import { X, ExternalLink, RefreshCw, AlertTriangle, CheckCircle, Clock, Bell, Trash2, Plus, ArrowUpRight } from 'lucide-react';
import { api } from '../services/api';

export function SiteDetailModal({ site, isOpen, onClose, onRefreshSites }) {
  const [activeTab, setActiveTab] = useState('broken-links');
  const [logs, setLogs] = useState([]);
  const [audits, setAudits] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  // Webhook state
  const [targetWebhook, setTargetWebhook] = useState('');
  const [addingAlert, setAddingAlert] = useState(false);

  useEffect(() => {
    if (isOpen && site) {
      fetchDetailData();
    }
  }, [isOpen, site]);

  const fetchDetailData = async () => {
    setLoading(true);
    try {
      const [logsData, auditsData, alertsData] = await Promise.all([
        api.getLogs(site.id, 50),
        api.getAudits(site.id, 10),
        api.getAlerts(site.id)
      ]);
      setLogs(logsData || []);
      setAudits(auditsData || []);
      setAlerts(alertsData || []);
    } catch (err) {
      console.error("Error loading detail data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerCheck = async () => {
    setChecking(true);
    try {
      await api.triggerCheck(site.id);
      await fetchDetailData();
      if (onRefreshSites) onRefreshSites();
    } catch (err) {
      alert("Check failed: " + err.message);
    } finally {
      setChecking(false);
    }
  };

  const handleAddAlert = async (e) => {
    e.preventDefault();
    if (!targetWebhook) return;
    setAddingAlert(true);
    try {
      await api.createAlert(site.id, {
        alert_type: "WEBHOOK",
        target: targetWebhook,
        notify_on_down: true,
        notify_on_broken_link: true
      });
      setTargetWebhook('');
      const alertsData = await api.getAlerts(site.id);
      setAlerts(alertsData || []);
    } catch (err) {
      alert(err.message);
    } finally {
      setAddingAlert(false);
    }
  };

  const handleDeleteAlert = async (alertId) => {
    try {
      await api.deleteAlert(site.id, alertId);
      setAlerts(alerts.filter(a => a.id !== alertId));
    } catch (err) {
      alert(err.message);
    }
  };

  if (!isOpen || !site) return null;

  const latestAudit = audits[0] || site.latest_audit;
  const brokenLinks = latestAudit?.broken_links || [];

  // Generate SVG points for response latency sparkline
  const sortedLogs = [...logs].reverse();
  const maxLatency = Math.max(...sortedLogs.map(l => l.response_time_ms), 500);
  const sparkPoints = sortedLogs.map((l, idx) => {
    const x = (idx / Math.max(sortedLogs.length - 1, 1)) * 500;
    const y = 120 - (l.response_time_ms / maxLatency) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" style={{ maxWidth: '850px' }} onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>{site.name}</h2>
              <span className={`badge ${site.status === 'UP' ? 'badge-up' : site.status === 'DOWN' ? 'badge-down' : 'badge-degraded'}`}>
                {site.status}
              </span>
            </div>
            <a href={site.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
              {site.url} <ExternalLink size={14} />
            </a>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button className="btn btn-secondary btn-sm" onClick={handleTriggerCheck} disabled={checking}>
              <RefreshCw size={14} style={{ animation: checking ? 'spin 1s linear infinite' : 'none' }} />
              {checking ? 'Scanning...' : 'Run Audit Now'}
            </button>
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={22} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '1.5rem', gap: '1.5rem' }}>
          {[
            { id: 'broken-links', label: `Broken Links (${brokenLinks.length})`, icon: AlertTriangle },
            { id: 'latency', label: 'Latency Sparkline', icon: Clock },
            { id: 'logs', label: 'Uptime History', icon: CheckCircle },
            { id: 'alerts', label: 'Alert Webhooks', icon: Bell },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '0.75rem 0',
                  background: 'none',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--primary)' : '2px solid transparent',
                  color: isActive ? '#ffffff' : 'var(--text-muted)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                <Icon size={16} color={isActive ? 'var(--primary)' : 'var(--text-muted)'} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading audit telemetry...</div>
        ) : (
          <>
            {/* Tab: Broken Links Report */}
            {activeTab === 'broken-links' && (
              <div>
                {brokenLinks.length === 0 ? (
                  <div style={{ padding: '2.5rem', textAlign: 'center', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <CheckCircle size={40} color="#34d399" style={{ marginBottom: '0.75rem' }} />
                    <h4 style={{ color: '#34d399', marginBottom: '0.25rem' }}>No Broken Links Detected!</h4>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      BeautifulSoup link crawler verified all extracted anchor tags on this target page.
                    </p>
                  </div>
                ) : (
                  <div>
                    <div style={{ padding: '0.75rem 1rem', background: 'rgba(244, 63, 94, 0.1)', borderRadius: '10px', border: '1px solid rgba(244, 63, 94, 0.2)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyBetween: 'space-between' }}>
                      <span style={{ fontSize: '0.85rem', color: '#fca5a5' }}>
                        Found {brokenLinks.length} dead link(s) on target page {site.url}
                      </span>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                      <table className="custom-table">
                        <thead>
                          <tr>
                            <th>Target Broken URL</th>
                            <th>Anchor Text</th>
                            <th>Status Code</th>
                            <th>Error Trace</th>
                          </tr>
                        </thead>
                        <tbody>
                          {brokenLinks.map((link) => (
                            <tr key={link.id}>
                              <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', maxWidth: '280px', wordBreak: 'break-all' }}>
                                <a href={link.target_url} target="_blank" rel="noreferrer" style={{ color: '#f87171', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                                  {link.target_url} <ArrowUpRight size={12} />
                                </a>
                              </td>
                              <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {link.anchor_text || '[No Text]'}
                              </td>
                              <td>
                                <span style={{ padding: '0.15rem 0.5rem', borderRadius: '6px', background: 'rgba(244, 63, 94, 0.2)', color: '#fca5a5', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.75rem' }}>
                                  {link.status_code || '404 / Fail'}
                                </span>
                              </td>
                              <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                {link.error_message || 'HTTP Error'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Latency Sparkline */}
            {activeTab === 'latency' && (
              <div>
                <h4 style={{ marginBottom: '1rem' }}>HTTP Response Latency (ms)</h4>
                {sortedLogs.length > 1 ? (
                  <div style={{ background: 'rgba(15, 23, 42, 0.6)', padding: '1.5rem', borderRadius: '14px', border: '1px solid var(--border-color)' }}>
                    <svg viewBox="0 0 500 130" style={{ width: '100%', height: '180px', overflow: 'visible' }}>
                      <polyline
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="3"
                        strokeLinecap="round"
                        points={sparkPoints}
                      />
                    </svg>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                      <span>Past Pings (Oldest)</span>
                      <span>Latest Ping ({logs[0]?.response_time_ms} ms)</span>
                    </div>
                  </div>
                ) : (
                  <p style={{ color: 'var(--text-muted)' }}>Insufficient ping data to render latency graph.</p>
                )}
              </div>
            )}

            {/* Tab: Uptime History Logs */}
            {activeTab === 'logs' && (
              <div style={{ overflowX: 'auto' }}>
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Status Code</th>
                      <th>Latency</th>
                      <th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map(log => (
                      <tr key={log.id}>
                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                          {new Date(log.checked_at).toLocaleString()}
                        </td>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: log.is_up ? '#34d399' : '#f87171' }}>
                            {log.status_code || 'TIMEOUT'}
                          </span>
                        </td>
                        <td style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem' }}>
                          {log.response_time_ms} ms
                        </td>
                        <td>
                          <span className={`badge ${log.is_up ? 'badge-up' : 'badge-down'}`}>
                            {log.is_up ? 'UP' : 'DOWN'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Tab: Alert Webhooks */}
            {activeTab === 'alerts' && (
              <div>
                <h4 style={{ marginBottom: '0.75rem' }}>Webhook Alert Channels</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
                  Send instant JSON payload alerts to Slack, Discord, or PagerDuty when this site goes down or dead links are flagged.
                </p>

                <form onSubmit={handleAddAlert} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://hooks.slack.com/services/..."
                    value={targetWebhook}
                    onChange={(e) => setTargetWebhook(e.target.value)}
                    required
                  />
                  <button type="submit" className="btn btn-primary" disabled={addingAlert}>
                    <Plus size={16} /> Add Webhook
                  </button>
                </form>

                {alerts.length === 0 ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No active webhooks configured for this site.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {alerts.map(a => (
                      <div key={a.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'white' }}>{a.target}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Triggers on Site Down & Dead Link Detection
                          </div>
                        </div>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDeleteAlert(a.id)}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
