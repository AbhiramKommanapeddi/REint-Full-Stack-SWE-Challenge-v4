import React, { useState, useEffect } from 'react';
import { simulateProcurement } from '../services/api';
import { Calculator, ShieldCheck, DollarSign, TrendingDown, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function ProcurementCalculator({ deliveryDate, cutoffHour }) {
  const [demandProfile, setDemandProfile] = useState('medium_utility');
  const [userPeakMW, setUserPeakMW] = useState(16000);
  const [riskPercentile, setRiskPercentile] = useState(85);
  const [dayAheadPrice, setDayAheadPrice] = useState(85);
  const [systemBuyPrice, setSystemBuyPrice] = useState(130);
  const [systemSellPrice, setSystemSellPrice] = useState(45);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const runSimulation = async () => {
    setLoading(true);
    try {
      const data = await simulateProcurement({
        deliveryDate,
        cutoffHour,
        demandProfile,
        userPeakDemandMW: userPeakMW,
        riskBufferPercentile: riskPercentile,
        systemBuyPrice,
        systemSellPrice,
        dayAheadPrice
      });
      setResult(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runSimulation();
  }, [deliveryDate, cutoffHour, demandProfile, userPeakMW, riskPercentile, dayAheadPrice, systemBuyPrice, systemSellPrice]);

  return (
    <div className="glass-card" style={{ padding: '24px', marginBottom: '20px' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
        <div>
          <h2 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calculator size={22} color="#10b981" />
            <span>Day-Ahead Procurement Risk & Safety Buffer Simulator</span>
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
            Quantify exact thermal/wholesale procurement needs for delivery day <strong>{deliveryDate}</strong> with dynamic error buffers to minimize balancing cashout penalties.
          </p>
        </div>

        <button
          className="btn-primary"
          onClick={runSimulation}
          disabled={loading}
          style={{ fontSize: '0.85rem' }}
        >
          {loading ? 'Simulating...' : 'Recalculate Scenario'}
        </button>
      </div>

      {/* Control Panel Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '14px',
        padding: '16px',
        background: 'rgba(255, 255, 255, 0.02)',
        borderRadius: '10px',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        marginBottom: '20px'
      }}>
        
        {/* Profile Selector */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
            Utility Demand Portfolio
          </label>
          <select
            value={demandProfile}
            onChange={(e) => setDemandProfile(e.target.value)}
            style={{
              width: '100%',
              background: '#090f1d',
              color: '#f8fafc',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '0.82rem'
            }}
          >
            <option value="medium_utility">UK Mid-Sized Utility (16,000 MW Peak)</option>
            <option value="large_utility">Large Energy Supplier (28,000 MW Peak)</option>
            <option value="small_supplier">Regional / Commercial (8,000 MW Peak)</option>
            <option value="custom">Custom Scale</option>
          </select>
        </div>

        {/* Risk Buffer Percentile */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
            Error Buffer Protection: <span style={{ color: '#34d399', fontWeight: '700' }}>{riskPercentile}th Percentile</span>
          </label>
          <input
            type="range"
            min="50"
            max="98"
            step="5"
            value={riskPercentile}
            onChange={(e) => setRiskPercentile(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#10b981' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: '#64748b' }}>
            <span>P50 (Median)</span>
            <span>P85 (Standard)</span>
            <span>P95 (Conservative)</span>
          </div>
        </div>

        {/* Day-Ahead Power Index Price */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
            Day-Ahead Price: <strong style={{ color: '#f8fafc' }}>£{dayAheadPrice}/MWh</strong>
          </label>
          <input
            type="number"
            value={dayAheadPrice}
            onChange={(e) => setDayAheadPrice(Number(e.target.value))}
            style={{
              width: '100%',
              background: '#090f1d',
              color: '#f8fafc',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '0.82rem'
            }}
          />
        </div>

        {/* System Buy Price (Short Penalty) */}
        <div>
          <label style={{ fontSize: '0.75rem', fontWeight: '600', color: '#fb7185', display: 'block', marginBottom: '6px' }}>
            System Buy Price (Short): <strong>£{systemBuyPrice}/MWh</strong>
          </label>
          <input
            type="number"
            value={systemBuyPrice}
            onChange={(e) => setSystemBuyPrice(Number(e.target.value))}
            style={{
              width: '100%',
              background: '#090f1d',
              color: '#f8fafc',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '0.82rem'
            }}
          />
        </div>

      </div>

      {/* Financial Impact Cards */}
      {result && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))',
          gap: '14px',
          marginBottom: '20px'
        }}>
          
          <div className="glass-card" style={{ padding: '16px', borderColor: 'rgba(244, 63, 94, 0.25)' }}>
            <span style={{ fontSize: '0.75rem', color: '#fb7185', fontWeight: '600', textTransform: 'uppercase' }}>
              Baseline Imbalance Exposure (Naive)
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#fb7185', marginTop: '6px' }}>
              £{result.baselineShortImbalanceExposureGBP.toLocaleString()}
            </div>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
              Exposure without error quantification (basing orders purely on unadjusted point forecast).
            </p>
          </div>

          <div className="glass-card" style={{ padding: '16px', borderColor: 'rgba(6, 182, 212, 0.25)' }}>
            <span style={{ fontSize: '0.75rem', color: '#22d3ee', fontWeight: '600', textTransform: 'uppercase' }}>
              Buffered Strategy Imbalance Cost
            </span>
            <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#38bdf8', marginTop: '6px' }}>
              £{result.bufferedImbalanceExposureGBP.toLocaleString()}
            </div>
            <p style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '4px' }}>
              Net balancing market cost with quantified dynamic reserve safety buffers applied.
            </p>
          </div>

          <div className="glass-card-glow" style={{ padding: '16px', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
            <span style={{ fontSize: '0.75rem', color: '#34d399', fontWeight: '700', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <ShieldCheck size={16} />
              <span>Net Avoided Penalty Savings</span>
            </span>
            <div style={{ fontSize: '1.6rem', fontWeight: '800', color: '#34d399', marginTop: '6px' }}>
              +£{result.netFinancialSavingsGBP.toLocaleString()}
            </div>
            <p style={{ fontSize: '0.72rem', color: '#cbd5e1', marginTop: '4px' }}>
              Net cost savings delivered for this single delivery day by procuring with error awareness.
            </p>
          </div>

        </div>
      )}

      {/* Procurement Schedule Sample Table */}
      {result && result.periods && (
        <div style={{ overflowX: 'auto', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.78rem', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'rgba(255, 255, 255, 0.04)', color: '#94a3b8', borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <th style={{ padding: '8px 12px' }}>Period</th>
                <th style={{ padding: '8px 12px' }}>Time</th>
                <th style={{ padding: '8px 12px' }}>Gross Demand</th>
                <th style={{ padding: '8px 12px' }}>Wind Forecast</th>
                <th style={{ padding: '8px 12px' }}>Naive Order</th>
                <th style={{ padding: '8px 12px' }}>Safety Buffer</th>
                <th style={{ padding: '8px 12px', color: '#34d399' }}>Recommended Order</th>
                <th style={{ padding: '8px 12px' }}>Actual Wind</th>
                <th style={{ padding: '8px 12px' }}>Avoided Penalty</th>
              </tr>
            </thead>
            <tbody>
              {result.periods.slice(0, 12).map((p) => (
                <tr key={p.settlementPeriod} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.04)' }}>
                  <td style={{ padding: '8px 12px', fontWeight: '600' }}>SP {p.settlementPeriod}</td>
                  <td style={{ padding: '8px 12px', color: '#94a3b8' }}>{p.timeLabel}</td>
                  <td style={{ padding: '8px 12px' }}>{p.grossDemandMW.toLocaleString()} MW</td>
                  <td style={{ padding: '8px 12px', color: '#f59e0b' }}>{p.forecastWindMW.toLocaleString()} MW</td>
                  <td style={{ padding: '8px 12px' }}>{p.dayAheadBaseProcurementMW.toLocaleString()} MW</td>
                  <td style={{ padding: '8px 12px', color: '#38bdf8' }}>+{p.recommendedSafetyBufferMW} MW</td>
                  <td style={{ padding: '8px 12px', color: '#34d399', fontWeight: '700' }}>
                    {p.recommendedDayAheadProcurementMW.toLocaleString()} MW
                  </td>
                  <td style={{ padding: '8px 12px', color: '#10b981' }}>{p.actualWindMW.toLocaleString()} MW</td>
                  <td style={{ padding: '8px 12px', color: p.avoidedShortImbalanceCostGBP > 0 ? '#34d399' : '#64748b', fontWeight: '600' }}>
                    {p.avoidedShortImbalanceCostGBP > 0 ? `+£${p.avoidedShortImbalanceCostGBP.toFixed(0)}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ padding: '8px 12px', background: 'rgba(255, 255, 255, 0.02)', fontSize: '0.72rem', color: '#64748b', textAlign: 'center' }}>
            Showing sample preview of periods 1–12 (full 48 periods calculated in background model).
          </div>
        </div>
      )}

    </div>
  );
}
