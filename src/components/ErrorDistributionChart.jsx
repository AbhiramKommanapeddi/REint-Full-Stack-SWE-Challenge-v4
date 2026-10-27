import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from 'recharts';
import { BarChart3, Info } from 'lucide-react';

export default function ErrorDistributionChart({ monthlyData }) {
  if (!monthlyData || !monthlyData.errorDistribution) return null;

  const data = monthlyData.errorDistribution;
  const metrics = monthlyData.overallMetrics;

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;
    const item = payload[0].payload;
    return (
      <div style={{
        background: '#090f1d',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        padding: '10px 14px',
        borderRadius: '8px',
        fontSize: '0.82rem'
      }}>
        <div style={{ fontWeight: '700', color: '#f8fafc', marginBottom: '4px' }}>
          {item.binLabel}
        </div>
        <div style={{ color: '#06b6d4' }}>
          Count: <strong>{item.count} settlement periods</strong> ({item.percentage}%)
        </div>
      </div>
    );
  };

  return (
    <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={20} color="#06b6d4" />
            <span>January 2026 Forecast Error Distribution & Quantiles</span>
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
            Statistical distribution of $(Forecast - Actual)$ wind errors across 1,488 evaluated settlement periods.
          </p>
        </div>

        {/* Quantile Highlights */}
        {metrics && (
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ background: 'rgba(6, 182, 212, 0.1)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(6, 182, 212, 0.25)', fontSize: '0.78rem' }}>
              <span style={{ color: '#94a3b8' }}>P10 (Surplus Bound): </span>
              <strong style={{ color: '#38bdf8' }}>{metrics.p10ErrorMW} MW</strong>
            </div>
            <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(245, 158, 11, 0.25)', fontSize: '0.78rem' }}>
              <span style={{ color: '#94a3b8' }}>P50 (Median): </span>
              <strong style={{ color: '#fbbf24' }}>{metrics.p50ErrorMW} MW</strong>
            </div>
            <div style={{ background: 'rgba(244, 63, 94, 0.1)', padding: '6px 12px', borderRadius: '8px', border: '1px solid rgba(244, 63, 94, 0.25)', fontSize: '0.78rem' }}>
              <span style={{ color: '#94a3b8' }}>P90 (Short Risk Bound): </span>
              <strong style={{ color: '#fb7185' }}>+{metrics.p90ErrorMW} MW</strong>
            </div>
          </div>
        )}
      </div>

      <div style={{ height: '280px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
            <XAxis
              dataKey="binLabel"
              stroke="#64748b"
              fontSize={10}
              interval={0}
              angle={-20}
              textAnchor="end"
              dy={5}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickFormatter={(v) => `${v}`}
              label={{ value: 'Frequency (Periods)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11, dy: 50 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => {
                const isShort = entry.minMW >= 0;
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={isShort ? '#f43f5e' : '#06b6d4'}
                    fillOpacity={0.8}
                  />
                );
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{
        marginTop: '12px',
        padding: '10px 14px',
        background: 'rgba(255, 255, 255, 0.03)',
        borderRadius: '8px',
        fontSize: '0.78rem',
        color: '#94a3b8',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <Info size={16} color="#06b6d4" />
        <span>
          <strong>Decision Insight:</strong> Notice the right tail (&gt;+1000 MW). Over-forecasting poses an asymmetric penalty because the UK System Buy Price for short imbalances is significantly higher than wholesale day-ahead prices.
        </span>
      </div>

    </div>
  );
}
