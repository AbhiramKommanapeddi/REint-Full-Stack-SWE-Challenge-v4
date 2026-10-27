import React, { useEffect, useState } from 'react';
import { fetchForecastEvolution } from '../services/api';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { X, Clock, History, AlertCircle } from 'lucide-react';

export default function ForecastEvolutionModal({ targetStartTime, onClose }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    if (!targetStartTime) return;
    setLoading(true);
    fetchForecastEvolution(targetStartTime)
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [targetStartTime]);

  if (!targetStartTime) return null;

  const chartData = data && data.evolution ? data.evolution.map((item) => ({
    publishTime: item.publishTime.substring(11, 16) + ' (' + item.publishTime.substring(5, 10) + ')',
    horizonHours: item.horizonHours,
    forecastMW: item.forecastMW,
    actualMW: data.actualMW
  })) : [];

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px'
    }}>
      <div className="glass-card-glow" style={{
        width: '100%',
        maxWidth: '750px',
        background: '#090f1d',
        borderRadius: '16px',
        padding: '24px',
        maxHeight: '90vh',
        overflowY: 'auto'
      }}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(6, 182, 212, 0.15)', padding: '8px', borderRadius: '8px' }}>
              <History size={20} color="#22d3ee" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#f8fafc' }}>
                Forecast Horizon Evolution (Lead-Time Convergence)
              </h3>
              <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
                Target Delivery: <strong>{targetStartTime}</strong> (Settlement Period {data?.settlementPeriod || '—'})
              </p>
            </div>
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

        {/* Content */}
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
            Loading forecast revisions for this period...
          </div>
        ) : data && chartData.length > 0 ? (
          <div>
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '8px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Actual Wind Outturn:</span>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#10b981' }}>
                  {data.actualMW !== null ? `${data.actualMW.toLocaleString()} MW` : 'N/A'}
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Revisions Recorded:</span>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#38bdf8' }}>
                  {data.evolution.length} updates
                </div>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Max Horizon:</span>
                <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fbbf24' }}>
                  {data.evolution[0]?.horizonHours || 0} hrs out
                </div>
              </div>
            </div>

            <div style={{ height: '300px', width: '100%' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 25 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
                  <XAxis
                    dataKey="publishTime"
                    stroke="#64748b"
                    fontSize={10}
                    interval={Math.max(1, Math.floor(chartData.length / 6))}
                    angle={-20}
                    textAnchor="end"
                    dy={5}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={11}
                    tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
                  />
                  <Tooltip
                    contentStyle={{ background: '#090f1d', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', fontSize: '0.8rem' }}
                  />
                  {data.actualMW !== null && (
                    <ReferenceLine
                      y={data.actualMW}
                      stroke="#10b981"
                      strokeWidth={2}
                      strokeDasharray="4 4"
                      label={{ value: 'Actual Outturn', fill: '#10b981', position: 'top', fontSize: 11 }}
                    />
                  )}
                  <Line
                    type="monotone"
                    dataKey="forecastMW"
                    name="Forecast Evolution (MW)"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#f59e0b' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '10px', textAlign: 'center' }}>
              Publish time progresses left to right towards delivery time. Revisions closer to gate closure show forecast convergence.
            </p>
          </div>
        ) : (
          <div style={{ padding: '30px', textAlign: 'center', color: '#94a3b8' }}>
            No intermediate forecast evolution records available for this timestamp.
          </div>
        )}

      </div>
    </div>
  );
}
