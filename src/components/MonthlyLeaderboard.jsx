import React from 'react';
import { Calendar, TrendingUp, TrendingDown, Award, ArrowUpRight } from 'lucide-react';

export default function MonthlyLeaderboard({ dailyBreakdown, onSelectDate, selectedDate }) {
  if (!dailyBreakdown || dailyBreakdown.length === 0) return null;

  return (
    <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={20} color="#06b6d4" />
            <span>January 2026 Daily Forecasting Accuracy Leaderboard</span>
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
            Ranked performance and error metrics across all 31 delivery days of January 2026. Click any row to load that day into the Day-Ahead Cockpit.
          </p>
        </div>
      </div>

      <div style={{ overflowX: 'auto', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '10px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.04)', color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
              <th style={{ padding: '10px 14px' }}>Delivery Date</th>
              <th style={{ padding: '10px 14px' }}>Day-Ahead MAE</th>
              <th style={{ padding: '10px 14px' }}>RMSE</th>
              <th style={{ padding: '10px 14px' }}>Mean Bias</th>
              <th style={{ padding: '10px 14px' }}>WAPE</th>
              <th style={{ padding: '10px 14px' }}>Actual Energy</th>
              <th style={{ padding: '10px 14px' }}>Peak Short Gap</th>
              <th style={{ padding: '10px 14px', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {dailyBreakdown.map((row) => {
              const isSelected = row.date === selectedDate;
              const isShort = row.meanBiasMW > 0;

              return (
                <tr
                  key={row.date}
                  onClick={() => onSelectDate(row.date)}
                  style={{
                    background: isSelected ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    cursor: 'pointer',
                    transition: 'background 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <td style={{ padding: '10px 14px', fontWeight: '700', color: isSelected ? '#22d3ee' : '#f8fafc' }}>
                    {row.date}
                    {isSelected && <span className="badge badge-cyan" style={{ marginLeft: '8px', fontSize: '0.65rem' }}>Active</span>}
                  </td>
                  <td style={{ padding: '10px 14px', fontWeight: '600' }}>{row.maeMW.toLocaleString()} MW</td>
                  <td style={{ padding: '10px 14px', color: '#cbd5e1' }}>{row.rmseMW.toLocaleString()} MW</td>
                  <td style={{ padding: '10px 14px', color: isShort ? '#fb7185' : '#38bdf8', fontWeight: '600' }}>
                    {row.meanBiasMW > 0 ? `+${row.meanBiasMW}` : row.meanBiasMW} MW
                  </td>
                  <td style={{ padding: '10px 14px', color: '#94a3b8' }}>{row.wapePercent}%</td>
                  <td style={{ padding: '10px 14px', color: '#10b981' }}>{row.totalActualMWh.toLocaleString()} MWh</td>
                  <td style={{ padding: '10px 14px', color: '#f59e0b', fontWeight: '600' }}>
                    +{row.maxOverforecastMW.toLocaleString()} MW
                  </td>
                  <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectDate(row.date);
                      }}
                      className="btn-secondary"
                      style={{ padding: '4px 10px', fontSize: '0.72rem' }}
                    >
                      <span>Load</span>
                      <ArrowUpRight size={12} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
