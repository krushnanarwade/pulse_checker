import React from 'react';
import { Globe, Activity, Zap, AlertTriangle } from 'lucide-react';

export function DashboardStats({ metrics }) {
  const cards = [
    {
      title: 'Monitored Sites',
      value: metrics?.total_monitored ?? 0,
      subtext: `${metrics?.up_count ?? 0} Up • ${metrics?.down_count ?? 0} Down`,
      icon: Globe,
      color: '#6366f1',
      bgGlow: 'rgba(99, 102, 241, 0.15)'
    },
    {
      title: 'Overall Uptime',
      value: `${metrics?.overall_uptime_percentage ?? 100}%`,
      subtext: 'Target 99.9% SLO SLA',
      icon: Activity,
      color: '#10b981',
      bgGlow: 'rgba(16, 185, 129, 0.15)'
    },
    {
      title: 'Avg Latency',
      value: `${metrics?.average_response_time_ms ?? 0} ms`,
      subtext: 'Global HTTP ping speed',
      icon: Zap,
      color: '#06b6d4',
      bgGlow: 'rgba(6, 182, 212, 0.15)'
    },
    {
      title: 'Broken Links Flagged',
      value: metrics?.total_broken_links ?? 0,
      subtext: '404 / 500 dead targets',
      icon: AlertTriangle,
      color: '#f43f5e',
      bgGlow: 'rgba(244, 63, 94, 0.15)'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '1.25rem',
      marginBottom: '2rem'
    }}>
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <div key={idx} className="glass-card" style={{ padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{
              position: 'absolute',
              top: '-15px',
              right: '-15px',
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: card.bgGlow,
              filter: 'blur(20px)',
              pointerEvents: 'none'
            }} />

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-muted)' }}>{card.title}</span>
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: card.bgGlow,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: card.color,
                border: `1px solid ${card.color}33`
              }}>
                <IconComponent size={20} />
              </div>
            </div>

            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1, marginBottom: '0.375rem', fontFamily: 'var(--font-mono)' }}>
              {card.value}
            </div>

            <div style={{ fontSize: '0.775rem', color: 'var(--text-dim)' }}>
              {card.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
