import React from 'react';
import { Clock, ShieldAlert, CheckCircle, AlertCircle } from 'lucide-react';

export default function SettlementPeriodHeatmap({ periods, onSelectPeriod }) {
  if (!periods || periods.length === 0) return null;

  return (
    <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f8fafc' }}>
            Settlement Period Accuracy Matrix (48 Half-Hours)
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
            Granular half-hourly error profile across the entire delivery day. Highlighted zone indicates UK peak demand hours (07:00–19:00 UTC).
          </p>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#f43f5e' }} />
            <span style={{ color: '#fb7185' }}>Over-Forecast (Short Risk)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#06b6d4' }} />
            <span style={{ color: '#22d3ee' }}>Under-Forecast (Surplus)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#10b981' }} />
            <span style={{ color: '#34d399' }}>High Accuracy (&lt;300 MW)</span>
          </div>
        </div>
      </div>

      {/* Grid of 48 Settlement Periods */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
        gap: '8px'
      }}>
        {periods.map((p) => {
          const isPeak = p.settlementPeriod >= 15 && p.settlementPeriod <= 38;
          const absErr = p.absErrorMW !== null ? p.absErrorMW : 0;
          const err = p.errorMW !== null ? p.errorMW : 0;

          let cardBg = 'rgba(255, 255, 255, 0.03)';
          let borderColor = 'rgba(255, 255, 255, 0.08)';
          let tagColor = '#94a3b8';

          if (absErr < 300) {
            cardBg = 'rgba(16, 185, 129, 0.08)';
            borderColor = 'rgba(16, 185, 129, 0.25)';
            tagColor = '#34d399';
          } else if (err > 0) {
            cardBg = 'rgba(244, 63, 94, 0.1)';
            borderColor = 'rgba(244, 63, 94, 0.3)';
            tagColor = '#fb7185';
          } else {
            cardBg = 'rgba(6, 182, 212, 0.1)';
            borderColor = 'rgba(6, 182, 212, 0.3)';
            tagColor = '#38bdf8';
          }

          return (
            <div
              key={p.settlementPeriod}
              onClick={() => onSelectPeriod && onSelectPeriod(p.startTime)}
              style={{
                background: cardBg,
                border: `1px solid ${borderColor}`,
                borderRadius: '8px',
                padding: '8px 10px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = borderColor;
              }}
            >
              {isPeak && (
                <span style={{
                  position: 'absolute',
                  top: '4px',
                  right: '6px',
                  fontSize: '0.62rem',
                  fontWeight: '700',
                  color: '#fbbf24',
                  textTransform: 'uppercase'
                }}>
                  Peak
                </span>
              )}

              <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#f8fafc', marginBottom: '2px' }}>
                SP {p.settlementPeriod} <span style={{ color: '#94a3b8', fontWeight: '400' }}>({p.timeLabel})</span>
              </div>

              <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                Act: <strong style={{ color: '#10b981' }}>{p.actualMW !== null ? `${p.actualMW}` : '—'}</strong>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}>
                Fc: <strong style={{ color: '#f59e0b' }}>{p.dayAheadForecastMW !== null ? `${p.dayAheadForecastMW}` : '—'}</strong>
              </div>

              <div style={{
                marginTop: '4px',
                paddingTop: '4px',
                borderTop: '1px solid rgba(255,255,255,0.06)',
                fontSize: '0.72rem',
                fontWeight: '700',
                color: tagColor
              }}>
                {err > 0 ? `+${err} MW` : `${err} MW`}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
}
