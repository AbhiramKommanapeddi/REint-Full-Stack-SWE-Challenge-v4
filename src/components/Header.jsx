import React from 'react';
import { Wind, Activity, Presentation, Code2, ShieldAlert } from 'lucide-react';

export default function Header({
  activeTab,
  setActiveTab,
  onOpenPitch,
  onOpenTechLead,
  healthData
}) {
  return (
    <header className="glass-card" style={{ padding: '16px 24px', marginBottom: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand & Market Context */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 15px rgba(6, 182, 212, 0.4)'
          }}>
            <Wind size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#f8fafc' }}>
                AeroWatt <span style={{ color: '#22d3ee' }}>UK</span>
              </h1>
              <span className="badge badge-cyan">Day-Ahead Wholesale Intelligence</span>
            </div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
              Decision-Support & Forecast Error Quantification Platform for UK Utility Procurement
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '4px',
          borderRadius: '10px',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <button
            className={`btn-tab ${activeTab === 'cockpit' ? 'active' : ''}`}
            onClick={() => setActiveTab('cockpit')}
          >
            <Activity size={16} />
            <span>Day-Ahead Cockpit</span>
          </button>
          <button
            className={`btn-tab ${activeTab === 'accuracy' ? 'active' : ''}`}
            onClick={() => setActiveTab('accuracy')}
          >
            <ShieldAlert size={16} />
            <span>Accuracy & Errors</span>
          </button>
          <button
            className={`btn-tab ${activeTab === 'procurement' ? 'active' : ''}`}
            onClick={() => setActiveTab('procurement')}
          >
            <Wind size={16} />
            <span>Procurement Simulator</span>
          </button>
        </div>

        {/* Executive Action Modals */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            className="btn-secondary"
            onClick={onOpenPitch}
            title="Open pitch presentation prepared for the client"
            style={{ fontSize: '0.85rem' }}
          >
            <Presentation size={16} color="#38bdf8" />
            <span>Client Pitch</span>
          </button>
          <button
            className="btn-secondary"
            onClick={onOpenTechLead}
            title="Open software architecture & design review for internal tech lead"
            style={{ fontSize: '0.85rem' }}
          >
            <Code2 size={16} color="#a78bfa" />
            <span>Tech Lead Review</span>
          </button>

          {/* Elexon Live Status Badge */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            background: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: '8px',
            fontSize: '0.75rem',
            color: '#34d399'
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              boxShadow: '0 0 8px #10b981'
            }} />
            <span>Elexon BMRS Jan 2026 Active</span>
          </div>
        </div>

      </div>
    </header>
  );
}
