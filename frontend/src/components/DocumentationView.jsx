import React from 'react';
import { ShieldCheck, Code, Server, Terminal, Cpu, Database, Check } from 'lucide-react';

export function DocumentationView() {
  return (
    <div style={{ maxWidth: '960px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Hero Header */}
      <div className="glass-card" style={{ padding: '2.5rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>PulseCheck Architecture & API Reference</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Production-ready Automated Website Uptime & BeautifulSoup Link Audit Engine</p>
          </div>
        </div>
      </div>

      {/* Feature Highlights Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <Cpu color="#6366f1" size={24} style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>BeautifulSoup Link Engine</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Recursively extracts all anchor tags (<code>&lt;a&gt;</code>), normalizes relative links (<code>urljoin</code>), and concurrently tests target URLs for 404, 500, timeouts, and SSL failures.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <Server color="#06b6d4" size={24} style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>APScheduler Periodic Monitoring</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Automated background scheduler continuously monitors all registered web targets without blocking thread loops or UI responsiveness.
          </p>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <Database color="#10b981" size={24} style={{ marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>SQLAlchemy & Pydantic Validation</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Clean ORM structure storing audit sessions, broken link records, response time telemetry, and password security using bcrypt & JWT.
          </p>
        </div>
      </div>

      {/* REST API Endpoints Specification */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <Code color="#818cf8" size={24} />
          <h2 style={{ fontSize: '1.3rem' }}>REST API Specifications</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {[
            { method: 'POST', endpoint: '/api/auth/register', desc: 'Register new user account' },
            { method: 'POST', endpoint: '/api/auth/login', desc: 'Authenticate and receive JWT token' },
            { method: 'GET', endpoint: '/api/websites', desc: 'Fetch user monitored websites with latest status' },
            { method: 'POST', endpoint: '/api/websites', desc: 'Add new website URL to periodic monitor' },
            { method: 'POST', endpoint: '/api/websites/{id}/check', desc: 'Trigger manual instant BeautifulSoup link crawl' },
            { method: 'GET', endpoint: '/api/websites/{id}/logs', desc: 'Retrieve historical response time & uptime logs' },
            { method: 'GET', endpoint: '/api/websites/{id}/audits', desc: 'Fetch detailed broken link crawl results' },
            { method: 'POST', endpoint: '/api/websites/{id}/alerts', desc: 'Register Slack/Discord alert webhook' }
          ].map((api, idx) => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'rgba(15, 23, 42, 0.6)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-mono)',
                  fontWeight: 700,
                  fontSize: '0.75rem',
                  background: api.method === 'GET' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(99, 102, 241, 0.2)',
                  color: api.method === 'GET' ? '#34d399' : '#818cf8'
                }}>
                  {api.method}
                </span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.875rem', color: 'white' }}>{api.endpoint}</span>
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{api.desc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Setup Instructions */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
          <Terminal color="#34d399" size={24} />
          <h2 style={{ fontSize: '1.3rem' }}>Step-by-Step Setup & Running</h2>
        </div>

        <div style={{ background: 'rgba(15, 23, 42, 0.8)', padding: '1.25rem', borderRadius: '12px', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', color: '#e5e7eb' }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}># 1. Backend Setup</div>
          <div>cd backend</div>
          <div>pip install -r requirements.txt</div>
          <div>uvicorn app.main:app --reload --port 8000</div>
          <br />
          <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}># 2. Frontend Setup</div>
          <div>cd frontend</div>
          <div>npm install</div>
          <div>npm run dev</div>
          <br />
          <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}># 3. Docker Compose Orchestration</div>
          <div>docker-compose up --build</div>
        </div>
      </div>
    </div>
  );
}
