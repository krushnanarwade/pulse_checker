import React from 'react';
import { Activity, Plus, ShieldCheck, BookOpen, LogOut, User as UserIcon } from 'lucide-react';

export function Navbar({ user, onOpenAuth, onLogout, onOpenAddSite, activeTab, setActiveTab }) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(9, 13, 22, 0.8)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }} onClick={() => setActiveTab('dashboard')}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(99, 102, 241, 0.4)'
          }}>
            <Activity color="white" size={24} />
          </div>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              PulseCheck <span style={{ fontSize: '0.7rem', padding: '0.1rem 0.5rem', borderRadius: '6px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' }}>PRO</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Uptime & Broken Link Engine</div>
          </div>
        </div>

        {/* Navigation links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <ShieldCheck size={16} /> Dashboard
          </button>
          <button
            className={`btn ${activeTab === 'docs' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setActiveTab('docs')}
          >
            <BookOpen size={16} /> API Docs
          </button>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '0.5rem' }}>
              <button className="btn btn-primary" onClick={onOpenAddSite}>
                <Plus size={16} /> Monitor URL
              </button>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(255, 255, 255, 0.05)', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
                <UserIcon size={16} color="#818cf8" />
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>{user.email}</span>
                <button 
                  onClick={onLogout} 
                  title="Logout"
                  style={{ background: 'none', border: 'none', color: '#f87171', cursor: 'pointer', marginLeft: '0.5rem', display: 'flex', alignItems: 'center' }}
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={onOpenAuth}>
              Sign In / Register
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
