import React, { useState } from 'react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine
} from 'recharts';
import { Calendar, Clock, ChevronLeft, ChevronRight, Info, Eye } from 'lucide-react';

export default function ForecastChart({
  deliveryData,
  deliveryDate,
  setDeliveryDate,
  cutoffHour,
  setCutoffHour,
  availableDates,
  onSelectPeriod
}) {
  const [chartMode, setChartMode] = useState('generation'); // 'generation', 'net_procurement', 'error'
  const [grossDemandScale, setGrossDemandScale] = useState(16000); // 16,000 MW typical utility

  if (!deliveryData || !deliveryData.settlementPeriods) return null;

  const periods = deliveryData.settlementPeriods;

  // Diurnal shape weight for gross demand simulation
  const getDiurnalWeight = (idx) => {
    const weights = [
      0.68, 0.65, 0.64, 0.63, 0.64, 0.66, 0.70, 0.75,
      0.82, 0.88, 0.94, 0.98, 0.99, 1.00, 0.97, 0.96,
      0.95, 0.94, 0.94, 0.93, 0.94, 0.95, 0.96, 0.97,
      0.96, 0.95, 0.95, 0.96, 0.97, 0.98, 1.00, 0.99,
      0.98, 0.97, 0.96, 0.95, 0.92, 0.88, 0.84, 0.80,
      0.78, 0.76, 0.74, 0.72, 0.71, 0.70, 0.69, 0.68
    ];
    return weights[idx] || 0.85;
  };

  const chartData = periods.map((p, idx) => {
    const grossDemand = Math.round(grossDemandScale * getDiurnalWeight(idx));
    const act = p.actualMW !== null ? p.actualMW : 0;
    const fc = p.dayAheadForecastMW !== null ? p.dayAheadForecastMW : 0;
    const err = p.errorMW !== null ? p.errorMW : 0;

    return {
      period: p.settlementPeriod,
      timeLabel: p.timeLabel,
      startTime: p.startTime,
      actualMW: p.actualMW,
      forecastMW: p.dayAheadForecastMW,
      errorMW: p.errorMW,
      deficitError: err > 0 ? err : 0,  // Over-forecast -> short imbalance
      surplusError: err < 0 ? err : 0,  // Under-forecast -> long imbalance
      grossDemandMW: grossDemand,
      netProcurementForecast: Math.max(0, grossDemand - fc),
      netProcurementActual: Math.max(0, grossDemand - act)
    };
  });

  // Date navigation helpers
  const curIdx = availableDates.indexOf(deliveryDate);
  const handlePrevDay = () => {
    if (curIdx > 0) setDeliveryDate(availableDates[curIdx - 1]);
  };
  const handleNextDay = () => {
    if (curIdx < availableDates.length - 1) setDeliveryDate(availableDates[curIdx + 1]);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    const data = payload[0].payload;
    return (
      <div style={{
        background: '#090f1d',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        padding: '12px 16px',
        borderRadius: '10px',
        boxShadow: '0 10px 25px rgba(0,0,0,0.6)',
        fontSize: '0.85rem',
        minWidth: '220px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '6px' }}>
          <span style={{ fontWeight: '700', color: '#f8fafc' }}>
            Period {data.period} ({data.timeLabel} UTC)
          </span>
          <span style={{ color: '#06b6d4', fontSize: '0.75rem' }}>Click for Horizon Evolution</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
          <span style={{ color: '#10b981' }}>● Actual Wind:</span>
          <span style={{ fontWeight: '600' }}>{data.actualMW !== null ? `${data.actualMW.toLocaleString()} MW` : 'N/A'}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
          <span style={{ color: '#f59e0b' }}>● Day-Ahead Forecast:</span>
          <span style={{ fontWeight: '600' }}>{data.forecastMW !== null ? `${data.forecastMW.toLocaleString()} MW` : 'N/A'}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
          <span style={{ color: data.errorMW > 0 ? '#fb7185' : '#38bdf8' }}>● Imbalance Error:</span>
          <span style={{ fontWeight: '700', color: data.errorMW > 0 ? '#fb7185' : '#38bdf8' }}>
            {data.errorMW > 0 ? `+${data.errorMW} MW (Short Risk)` : `${data.errorMW} MW (Surplus)`}
          </span>
        </div>

        {chartMode === 'net_procurement' && (
          <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#cbd5e1' }}>
              <span>Gross Demand:</span>
              <span>{data.grossDemandMW.toLocaleString()} MW</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#818cf8', fontWeight: '600' }}>
              <span>Day-Ahead Procurement:</span>
              <span>{data.netProcurementForecast.toLocaleString()} MW</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
      
      {/* Chart Control Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        
        {/* Date Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={16} color="#06b6d4" />
            <span>Delivery Date:</span>
          </span>
          
          <button
            className="btn-secondary"
            onClick={handlePrevDay}
            disabled={curIdx <= 0}
            style={{ padding: '6px 10px', opacity: curIdx <= 0 ? 0.4 : 1 }}
          >
            <ChevronLeft size={16} />
          </button>

          <select
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            style={{
              background: '#090f1d',
              color: '#f8fafc',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {availableDates.map((d) => (
              <option key={d} value={d}>
                {d} (Delivery Day)
              </option>
            ))}
          </select>

          <button
            className="btn-secondary"
            onClick={handleNextDay}
            disabled={curIdx >= availableDates.length - 1}
            style={{ padding: '6px 10px', opacity: curIdx >= availableDates.length - 1 ? 0.4 : 1 }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Day-Ahead Cutoff Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Clock size={16} color="#f59e0b" />
            <span>Decision Cutoff on D-1:</span>
          </span>

          <div style={{ display: 'flex', gap: '4px', background: 'rgba(255, 255, 255, 0.04)', padding: '3px', borderRadius: '8px' }}>
            {[
              { label: '09:00 UTC', hour: 9 },
              { label: '11:00 UTC (DAM Gate)', hour: 11 },
              { label: '14:00 UTC', hour: 14 },
              { label: '17:00 UTC', hour: 17 }
            ].map((preset) => (
              <button
                key={preset.hour}
                onClick={() => setCutoffHour(preset.hour)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '0.78rem',
                  fontWeight: cutoffHour === preset.hour ? '700' : '500',
                  background: cutoffHour === preset.hour ? 'rgba(245, 158, 11, 0.25)' : 'transparent',
                  color: cutoffHour === preset.hour ? '#fbbf24' : '#94a3b8',
                  border: cutoffHour === preset.hour ? '1px solid rgba(245, 158, 11, 0.4)' : '1px solid transparent',
                  cursor: 'pointer'
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* View Mode Toggle */}
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.04)', padding: '3px', borderRadius: '8px' }}>
          <button
            className={`btn-tab ${chartMode === 'generation' ? 'active' : ''}`}
            onClick={() => setChartMode('generation')}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            Wind Actual vs Forecast
          </button>
          <button
            className={`btn-tab ${chartMode === 'net_procurement' ? 'active' : ''}`}
            onClick={() => setChartMode('net_procurement')}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            Net Procurement Gap
          </button>
          <button
            className={`btn-tab ${chartMode === 'error' ? 'active' : ''}`}
            onClick={() => setChartMode('error')}
            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
          >
            Imbalance Error Bars
          </button>
        </div>

      </div>

      {/* Market Guidance Note */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(6, 182, 212, 0.05)',
        border: '1px solid rgba(6, 182, 212, 0.15)',
        borderRadius: '8px',
        padding: '10px 16px',
        marginBottom: '16px',
        fontSize: '0.82rem',
        color: '#cbd5e1'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Info size={16} color="#06b6d4" />
          <span>
            <strong>UK Day-Ahead Market Protocol:</strong> Forecasts displayed are strictly those published at or prior to{' '}
            <strong style={{ color: '#fbbf24' }}>D-1 at {String(cutoffHour).padStart(2, '0')}:00 UTC</strong>. Gate closure on EPEX SPOT UK Day-Ahead auction is 11:00 UTC. Click any half-hour point below to inspect forecast horizon evolution.
          </span>
        </div>
        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
          48 Settlement Periods (30m resolution)
        </span>
      </div>

      {/* Main Interactive Chart */}
      <div style={{ height: '420px', width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={chartData}
            margin={{ top: 10, right: 20, left: 10, bottom: 25 }}
            onClick={(state) => {
              if (state && state.activePayload && state.activePayload.length) {
                const pt = state.activePayload[0].payload;
                if (onSelectPeriod) onSelectPeriod(pt.startTime);
              }
            }}
          >
            <defs>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="procureGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.06)" />
            
            <XAxis
              dataKey="timeLabel"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              interval={3}
              dy={8}
            />
            
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              dx={-5}
              tickFormatter={(v) => `${(v / 1000).toFixed(1)}k`}
              label={{ value: 'Generation / Demand (MW)', angle: -90, position: 'insideLeft', fill: '#64748b', fontSize: 11, dy: 60 }}
            />

            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="top"
              height={36}
              wrapperStyle={{ paddingBottom: '10px', fontSize: '0.8rem' }}
            />

            {chartMode === 'generation' && (
              <>
                <Area
                  type="monotone"
                  dataKey="actualMW"
                  name="Actual Wind Outturn (FUELHH)"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#actualGrad)"
                />
                <Line
                  type="monotone"
                  dataKey="forecastMW"
                  name={`Day-Ahead Forecast (D-1 ${String(cutoffHour).padStart(2, '0')}:00Z)`}
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  strokeDasharray="4 4"
                  dot={{ r: 2.5, fill: '#f59e0b' }}
                  activeDot={{ r: 6, fill: '#fbbf24', stroke: '#ffffff' }}
                />
              </>
            )}

            {chartMode === 'net_procurement' && (
              <>
                <Line
                  type="monotone"
                  dataKey="grossDemandMW"
                  name="Gross Consumer Demand (MW)"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="3 3"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="netProcurementForecast"
                  name="Net Day-Ahead Power to Procure (Demand - Wind Forecast)"
                  stroke="#6366f1"
                  strokeWidth={2.5}
                  fill="url(#procureGrad)"
                />
                <Line
                  type="monotone"
                  dataKey="netProcurementActual"
                  name="Physical Required Power (Demand - Actual Wind)"
                  stroke="#ec4899"
                  strokeWidth={2}
                  dot={{ r: 2 }}
                />
              </>
            )}

            {chartMode === 'error' && (
              <>
                <ReferenceLine y={0} stroke="rgba(255,255,255,0.2)" />
                <Bar
                  dataKey="deficitError"
                  name="Over-Forecast Deficit (+MW Short Risk)"
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="surplusError"
                  name="Under-Forecast Surplus (-MW Long Risk)"
                  fill="#06b6d4"
                  radius={[0, 0, 4, 4]}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
}
