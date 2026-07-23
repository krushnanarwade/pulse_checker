import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardStats } from './components/DashboardStats';
import { WebsiteGrid } from './components/WebsiteGrid';
import { AddSiteModal } from './components/AddSiteModal';
import { SiteDetailModal } from './components/SiteDetailModal';
import { AuthModal } from './components/AuthModal';
import { DocumentationView } from './components/DocumentationView';
import { api, getAuthToken, setAuthToken } from './services/api';

export function App() {
  const [user, setUser] = useState(null);
  const [websites, setWebsites] = useState([]);
  const [metrics, setMetrics] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAddSiteOpen, setIsAddSiteOpen] = useState(false);
  const [selectedSite, setSelectedSite] = useState(null);

  // Loading & checking flags
  const [checkingSites, setCheckingSites] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    initApp();
  }, []);

  const initApp = async () => {
    setLoading(true);
    const token = getAuthToken();
    if (token) {
      try {
        const userData = await api.getMe();
        setUser(userData);
        await loadDashboardData();
      } catch (err) {
        console.error("Auth session expired:", err);
        setAuthToken(null);
        setUser(null);
      }
    }
    setLoading(false);
  };

  const loadDashboardData = async () => {
    try {
      const [sitesData, metricsData] = await Promise.all([
        api.getWebsites(),
        api.getMetrics()
      ]);
      setWebsites(sitesData || []);
      setMetrics(metricsData || null);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    }
  };

  const handleLogin = async (credentials) => {
    const res = await api.login(credentials);
    setAuthToken(res.access_token);
    setUser(res.user);
    await loadDashboardData();
  };

  const handleRegister = async (payload) => {
    await api.register(payload);
    // Auto login after register
    await handleLogin({ email: payload.email, password: payload.password });
  };

  const handleLogout = () => {
    setAuthToken(null);
    setUser(null);
    setWebsites([]);
    setMetrics(null);
  };

  const handleAddSite = async (payload) => {
    if (!user) {
      setIsAuthOpen(true);
      return;
    }
    await api.createWebsite(payload);
    await loadDashboardData();
  };

  const handleTriggerCheck = async (siteId) => {
    setCheckingSites(prev => ({ ...prev, [siteId]: true }));
    try {
      await api.triggerCheck(siteId);
      await loadDashboardData();
    } catch (err) {
      alert("Check failed: " + err.message);
    } finally {
      setCheckingSites(prev => ({ ...prev, [siteId]: false }));
    }
  };

  const handleDeleteSite = async (siteId) => {
    if (!window.confirm("Are you sure you want to remove this website monitor?")) return;
    try {
      await api.deleteWebsite(siteId);
      await loadDashboardData();
    } catch (err) {
      alert("Delete failed: " + err.message);
    }
  };

  return (
    <div className="app-container">
      <Navbar
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
        onOpenAddSite={() => setIsAddSiteOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="main-content">
        {activeTab === 'docs' ? (
          <DocumentationView />
        ) : (
          <>
            {/* Top Dashboard Banner if not logged in */}
            {!user && (
              <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(16, 185, 129, 0.1) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Protect Your Website's Uptime & Search Ranking</h2>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '650px' }}>
                    Continuously monitor HTTP status codes, response speed, and parse HTML links using Python & BeautifulSoup to catch broken 404/500 links before your clients do.
                  </p>
                </div>
                <button className="btn btn-primary" onClick={() => setIsAuthOpen(true)}>
                  Get Started Free
                </button>
              </div>
            )}

            {/* Metrics KPI Cards */}
            <DashboardStats metrics={metrics} />

            {/* Websites List */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem' }}>Monitored Websites</h2>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>Real-time telemetry and BeautifulSoup broken link inspection</p>
              </div>
              {user && (
                <button className="btn btn-primary btn-sm" onClick={() => setIsAddSiteOpen(true)}>
                  + Add Target
                </button>
              )}
            </div>

            <WebsiteGrid
              websites={websites}
              onSelectSite={(site) => setSelectedSite(site)}
              onTriggerCheck={handleTriggerCheck}
              onDeleteSite={handleDeleteSite}
              checkingSites={checkingSites}
            />
          </>
        )}
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '1.5rem 0', textAlign: 'center', color: 'var(--text-dim)', fontSize: '0.8rem' }}>
        PulseCheck Automated Website Uptime & Link Checker • Production Architecture
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLogin={handleLogin}
        onRegister={handleRegister}
      />

      <AddSiteModal
        isOpen={isAddSiteOpen}
        onClose={() => setIsAddSiteOpen(false)}
        onAddSite={handleAddSite}
      />

      <SiteDetailModal
        site={selectedSite}
        isOpen={!!selectedSite}
        onClose={() => setSelectedSite(null)}
        onRefreshSites={loadDashboardData}
      />
    </div>
  );
}

export default App;
