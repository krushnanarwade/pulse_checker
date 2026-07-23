import React, { useState } from 'react';
import { RefreshCw, ExternalLink, Trash2, ChevronRight, AlertCircle, Search, Clock, Link as LinkIcon } from 'lucide-react';

export function WebsiteGrid({ websites, onSelectSite, onTriggerCheck, onDeleteSite, checkingSites }) {
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const filteredWebsites = websites.filter(site => {
    const matchesSearch = site.name.toLowerCase().includes(search.toLowerCase()) || 
                          site.url.toLowerCase().includes(search.toLowerCase());
    if (filter === 'ALL') return matchesSearch;
    return matchesSearch && site.status === filter;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'UP':
        return (
          <span className="badge badge-up">
            <span className="pulse-dot pulse-dot-up"></span> Operational
          </span>
        );
      case 'DOWN':
        return (
          <span className="badge badge-down">
            <span className="pulse-dot pulse-dot-down"></span> Down
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="badge badge-degraded">
            <span className="pulse-dot pulse-dot-degraded"></span> Broken Links
          </span>
        );
      default:
        return (
          <span className="badge badge-pending">
            Pending Check
          </span>
        );
    }
  };

  return (
    <div style={{ marginTop: '1.5rem' }}>
      {/* Controls & Filter Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            placeholder="Search website or URL..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        {/* Status Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', background: 'rgba(15, 23, 42, 0.6)', padding: '0.25rem', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
          {['ALL', 'UP', 'DOWN', 'DEGRADED'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '0.375rem 0.875rem',
                borderRadius: '8px',
                border: 'none',
                background: filter === f ? 'var(--primary)' : 'transparent',
                color: filter === f ? 'white' : 'var(--text-muted)',
                fontWeight: 600,
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List */}
      {filteredWebsites.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <AlertCircle size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ marginBottom: '0.5rem' }}>No Monitored Websites Found</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {search ? 'No endpoints match your search criteria.' : 'Click "Monitor URL" above to add your first target website.'}
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '1.5rem'
        }}>
          {filteredWebsites.map(site => {
            const isChecking = checkingSites[site.id];
            const brokenCount = site.latest_audit?.broken_links_count || 0;
            const latency = site.latest_uptime?.response_time_ms;

            return (
              <div key={site.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div>
                      <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem', color: '#ffffff' }}>{site.name}</h3>
                      <a href={site.url} target="_blank" rel="noreferrer" style={{ fontSize: '0.825rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        {site.url} <ExternalLink size={12} />
                      </a>
                    </div>
                    {getStatusBadge(site.status)}
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '0.75rem',
                    margin: '1.25rem 0',
                    padding: '0.875rem',
                    background: 'rgba(15, 23, 42, 0.5)',
                    borderRadius: '10px',
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                  }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={12} /> Response Time
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: latency ? (latency < 300 ? '#34d399' : latency < 1000 ? '#fbbf24' : '#f87171') : 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                        {latency ? `${latency} ms` : 'N/A'}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <LinkIcon size={12} /> Dead Links
                      </div>
                      <div style={{ fontSize: '1rem', fontWeight: 700, color: brokenCount > 0 ? '#f87171' : '#34d399', fontFamily: 'var(--font-mono)', marginTop: '0.2rem' }}>
                        {brokenCount > 0 ? `${brokenCount} Broken` : '0 Broken'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => onTriggerCheck(site.id)}
                    disabled={isChecking}
                  >
                    <RefreshCw size={14} className={isChecking ? 'spin-anim' : ''} style={{ animation: isChecking ? 'spin 1s linear infinite' : 'none' }} />
                    {isChecking ? 'Checking...' : 'Run Audit'}
                  </button>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onSelectSite(site)}
                      title="Inspect Details & Broken Links"
                    >
                      Inspect <ChevronRight size={14} />
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => onDeleteSite(site.id)}
                      title="Delete Monitor"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
