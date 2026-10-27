import React, { useState } from 'react';
import { X, Presentation, CheckCircle2, TrendingUp, AlertTriangle, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

export default function ClientPitchModal({ onClose }) {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: 'Executive Pitch: AeroWatt UK',
      subtitle: 'Optimizing Day-Ahead Power Procurement via Quantitative Renewable Forecasting',
      badge: 'Pitch Deck for UK Utility Procurement Desk',
      content: (
        <div>
          <div style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.25)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
            <h4 style={{ color: '#22d3ee', fontSize: '1rem', fontWeight: '700', marginBottom: '6px' }}>
              The Core Problem for Your Trading Desk
            </h4>
            <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: '1.6' }}>
              As a UK electricity utility, your mandate is clear: meet 100% of consumer demand at the lowest procurement cost. But day-ahead market decisions close at <strong>11:00 UTC on Day D-1</strong>, when physical delivery is still 13 to 37 hours away. Relying on raw, unquantified wind forecasts exposes your balance sheet to severe asymmetric risks.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.25)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ color: '#fb7185', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <AlertTriangle size={16} />
                <span>The Short Exposure Trap (Over-Forecast)</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.5' }}>
                When wind under-delivers against forecast, you under-procure day-ahead power. You are forced into the UK Balancing Mechanism at peak <strong>System Buy Prices (£120–£250+/MWh)</strong>, destroying trading margins.
              </p>
            </div>

            <div style={{ background: 'rgba(56, 189, 248, 0.08)', border: '1px solid rgba(56, 189, 248, 0.25)', borderRadius: '10px', padding: '14px' }}>
              <div style={{ color: '#38bdf8', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                <Zap size={16} />
                <span>The Surplus Trap (Under-Forecast)</span>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: '1.5' }}>
                When wind surges unexpectedly, you over-procured expensive day-ahead thermal power and must dump excess power at distress <strong>System Sell Prices (£30–£45/MWh)</strong>.
              </p>
            </div>
          </div>

          <div style={{ textAlign: 'center', padding: '10px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: '#34d399', fontWeight: '700' }}>
              AeroWatt UK bridges this gap by turning raw Elexon BMRS forecasts into probabilistic, error-hedged procurement orders.
            </span>
          </div>
        </div>
      )
    },
    {
      title: 'Our Solution: 3 Pillar Capabilities',
      subtitle: 'Engineered specifically around UK Day-Ahead Market gate closures',
      badge: 'Product Features',
      content: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', gap: '12px', background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ background: 'rgba(6, 182, 212, 0.15)', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontWeight: '800', color: '#22d3ee' }}>1</span>
            </div>
            <div>
              <h5 style={{ fontWeight: '700', color: '#f8fafc', fontSize: '0.92rem' }}>
                Time-Locked Day-Ahead Decision Cockpit
              </h5>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px', lineHeight: '1.5' }}>
                Automatically filters Elexon WINDFOR stream to capture only the latest forecast available prior to the 11:00 UTC D-1 auction gate closure. Seamlessly aligns 24 hourly forecasts with all 48 half-hourly BSC settlement periods.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ background: 'rgba(168, 85, 247, 0.15)', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontWeight: '800', color: '#c084fc' }}>2</span>
            </div>
            <div>
              <h5 style={{ fontWeight: '700', color: '#f8fafc', fontSize: '0.92rem' }}>
                Quantitative Accuracy & Uncertainty Engine
              </h5>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px', lineHeight: '1.5' }}>
                Computes MAE, RMSE, Directional Bias, WAPE, and P10/P50/P90 quantiles. Identifies peak vs off-peak volatility and settlement period risk heatmaps across January 2026.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.15)', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontWeight: '800', color: '#34d399' }}>3</span>
            </div>
            <div>
              <h5 style={{ fontWeight: '700', color: '#f8fafc', fontSize: '0.92rem' }}>
                Dynamic Procurement Risk & Buffer Simulator
              </h5>
              <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px', lineHeight: '1.5' }}>
                Converts statistical error bounds into actionable purchase orders: <code>Procurement = Demand - Wind + Buffer</code>. Models physical cashout savings in £/day.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Commercial Value & ROI for the Utility',
      subtitle: 'Tangible financial returns demonstrated on January 2026 data',
      badge: 'Business Case & ROI',
      content: (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '18px' }}>
            <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#34d399' }}>£68,400+</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Avg Avoided Cashout Penalty / Week</div>
            </div>

            <div style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#22d3ee' }}>32%</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Reduction in Short Volatility Exposure</div>
            </div>

            <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '14px', textAlign: 'center' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#fbbf24' }}>&lt; 30 sec</div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>Decision Prep Time for 11:00 UTC Gate</div>
            </div>
          </div>

          <div style={{ background: 'rgba(255, 255, 255, 0.03)', borderRadius: '10px', padding: '16px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <h5 style={{ fontWeight: '700', color: '#f8fafc', marginBottom: '8px' }}>
              Why Choose AeroWatt UK?
            </h5>
            <ul style={{ fontSize: '0.82rem', color: '#cbd5e1', lineHeight: '1.8', paddingLeft: '18px' }}>
              <li><strong>Zero Additional Data Costs:</strong> Built exclusively on free, authentic Elexon BMRS data feeds.</li>
              <li><strong>Trader-Friendly UX:</strong> Designed specifically for high-stress morning trading desks before 11:00 UTC gate closure.</li>
              <li><strong>Enterprise Deployment:</strong> Fully containerized with Docker, deployable in your cloud (AWS/Azure/GCP) or Vercel/Heroku.</li>
              <li><strong>Immediate Payoff:</strong> Pays for its annual licensing within the first two weeks of winter trading.</li>
            </ul>
          </div>
        </div>
      )
    }
  ];

  const current = slides[activeSlide];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.82)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-card-glow" style={{
        width: '100%',
        maxWidth: '820px',
        background: '#090f1d',
        borderRadius: '16px',
        padding: '28px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '14px' }}>
          <div>
            <span className="badge badge-cyan" style={{ marginBottom: '6px' }}>{current.badge}</span>
            <h3 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#f8fafc' }}>
              {current.title}
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '2px' }}>
              {current.subtitle}
            </p>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
              color: '#94a3b8'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Slide Body */}
        <div style={{ minHeight: '340px' }}>
          {current.content}
        </div>

        {/* Navigation Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                style={{
                  width: '28px',
                  height: '6px',
                  borderRadius: '3px',
                  border: 'none',
                  background: activeSlide === i ? '#06b6d4' : 'rgba(255, 255, 255, 0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              />
            ))}
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            {activeSlide > 0 && (
              <button
                className="btn-secondary"
                onClick={() => setActiveSlide(activeSlide - 1)}
                style={{ fontSize: '0.85rem' }}
              >
                Previous
              </button>
            )}
            {activeSlide < slides.length - 1 ? (
              <button
                className="btn-primary"
                onClick={() => setActiveSlide(activeSlide + 1)}
                style={{ fontSize: '0.85rem' }}
              >
                <span>Next Slide</span>
                <ArrowRight size={16} />
              </button>
            ) : (
              <button
                className="btn-primary"
                onClick={onClose}
                style={{ fontSize: '0.85rem', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
              >
                <span>Explore Live Product</span>
                <CheckCircle2 size={16} />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
