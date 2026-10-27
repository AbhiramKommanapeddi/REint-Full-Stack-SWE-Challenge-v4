import React from 'react';
import { AlertTriangle, TrendingUp, TrendingDown, Target, Zap, ShieldCheck } from 'lucide-react';

export default function MetricCards({ metrics, cutoffTimeUTC }) {
  if (!metrics) return null;

  const isOverforecast = metrics.meanBiasMW > 0;
  const biasLabel = isOverforecast ? 'Over-Forecasting (Short Risk)' : 'Under-Forecasting (Long Surplus)';
  const biasColor = isOverforecast ? '#fb7185' : '#38bdf8';

  // Recommended dynamic reserve buffer calculated from P90 error / MAE
  const recommendedBuffer = Math.round(Math.max(metrics.maeMW * 1.5, metrics.p90ErrorMW || 0));

  const cards = [
    {
      title: 'Day-Ahead MAE',
      value: `${metrics.maeMW.toLocaleString()} MW`,
      subtitle: `Mean Absolute Error across 48 periods`,
      icon: <Target size={20} color="#22d3ee" />,
      tag: `${metrics.wapePercent}% WAPE`,
      tagClass: 'badge-cyan',
      borderColor: 'rgba(6, 182, 212, 0.3)'
    },
    {
      title: 'Volatility RMSE',
      value: `${metrics.rmseMW.toLocaleString()} MW`,
      subtitle: `Quadratic penalty on large excursions`,
      icon: <Zap size={20} color="#a855f7" />,
      tag: `Ratio ${(metrics.rmseMW / (metrics.maeMW || 1)).toFixed(2)}x`,
      tagClass: 'badge-cyan',
      borderColor: 'rgba(168, 85, 247, 0.3)'
    },
    {
      title: 'Directional Bias',
      value: `${metrics.meanBiasMW > 0 ? '+' : ''}${metrics.meanBiasMW.toLocaleString()} MW`,
      subtitle: biasLabel,
      icon: isOverforecast ? <TrendingUp size={20} color="#fb7185" /> : <TrendingDown size={20} color="#38bdf8" />,
      tag: isOverforecast ? 'Deficit Warning' : 'Surplus Bias',
      tagClass: isOverforecast ? 'badge-rose' : 'badge-cyan',
      borderColor: isOverforecast ? 'rgba(244, 63, 94, 0.3)' : 'rgba(56, 189, 248, 0.3)'
    },
    {
      title: 'Worst Short Risk',
      value: `+${metrics.maxOverforecastMW.toLocaleString()} MW`,
      subtitle: 'Peak half-hour generation shortfall',
      icon: <AlertTriangle size={20} color="#f59e0b" />,
      tag: 'Max Imbalance Gap',
      tagClass: 'badge-amber',
      borderColor: 'rgba(245, 158, 11, 0.3)'
    },
    {
      title: 'Peak Hours MAE',
      value: `${metrics.peakMaeMW.toLocaleString()} MW`,
      subtitle: 'Settlement Periods 15–38 (07:00–19:00)',
      icon: <Zap size={20} color="#10b981" />,
      tag: `Off-Peak: ${metrics.offPeakMaeMW} MW`,
      tagClass: 'badge-emerald',
      borderColor: 'rgba(16, 185, 129, 0.3)'
    },
    {
      title: 'Rec. Safety Buffer',
      value: `+${recommendedBuffer.toLocaleString()} MW`,
      subtitle: `Procurement buffer to insulate short penalties`,
      icon: <ShieldCheck size={20} color="#34d399" />,
      tag: 'P90 Protection',
      tagClass: 'badge-emerald',
      borderColor: 'rgba(52, 211, 153, 0.3)',
      highlight: true
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
      gap: '16px',
      marginBottom: '20px'
    }}>
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={card.highlight ? 'glass-card-glow' : 'glass-card'}
          style={{
            padding: '18px 20px',
            borderColor: card.borderColor,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {card.title}
              </span>
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                padding: '6px',
                borderRadius: '8px'
              }}>
                {card.icon}
              </div>
            </div>

            <div style={{ fontSize: '1.65rem', fontWeight: '800', color: '#f8fafc', fontFamily: 'var(--font-display)', marginBottom: '4px' }}>
              {card.value}
            </div>
            
            <p style={{ fontSize: '0.78rem', color: '#94a3b8', lineHeight: '1.4' }}>
              {card.subtitle}
            </p>
          </div>

          <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span className={`badge ${card.tagClass}`} style={{ fontSize: '0.7rem' }}>
              {card.tag}
            </span>
            <span style={{ fontSize: '0.7rem', color: '#64748b' }}>
              {cutoffTimeUTC || 'D-1 11:00 UTC'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
