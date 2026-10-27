import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MetricCards from './components/MetricCards';
import ForecastChart from './components/ForecastChart';
import SettlementPeriodHeatmap from './components/SettlementPeriodHeatmap';
import ErrorDistributionChart from './components/ErrorDistributionChart';
import ProcurementCalculator from './components/ProcurementCalculator';
import MonthlyLeaderboard from './components/MonthlyLeaderboard';
import ForecastEvolutionModal from './components/ForecastEvolutionModal';
import ClientPitchModal from './components/ClientPitchModal';
import TechLeadModal from './components/TechLeadModal';

import {
  fetchDayAheadForecast,
  fetchMonthlyAnalytics,
  fetchHealth
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('cockpit'); // 'cockpit', 'accuracy', 'procurement'
  const [deliveryDate, setDeliveryDate] = useState('2026-01-15');
  const [cutoffHour, setCutoffHour] = useState(11);
  const [availableDates, setAvailableDates] = useState([]);
  
  const [deliveryData, setDeliveryData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [healthData, setHealthData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [selectedPeriodStartTime, setSelectedPeriodStartTime] = useState(null);
  const [isPitchOpen, setIsPitchOpen] = useState(false);
  const [isTechLeadOpen, setIsTechLeadOpen] = useState(false);

  // Initial load
  useEffect(() => {
    fetchHealth()
      .then((data) => {
        setHealthData(data);
        if (data.availableDates && data.availableDates.length > 0) {
          setAvailableDates(data.availableDates);
          if (!data.availableDates.includes(deliveryDate)) {
            setDeliveryDate(data.availableDates[Math.floor(data.availableDates.length / 2)]);
          }
        }
      })
      .catch((err) => {
        console.warn('Backend not responding yet or loading:', err);
      });
  }, []);

  // Fetch day-ahead data when date or cutoff changes
  useEffect(() => {
    setLoading(true);
    fetchDayAheadForecast(deliveryDate, cutoffHour, 0)
      .then((data) => {
        setDeliveryData(data);
        if (data.availableDates && data.availableDates.length > 0) {
          setAvailableDates(data.availableDates);
        }
        setError(null);
      })
      .catch((err) => {
        console.error('Failed to load forecast data:', err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, [deliveryDate, cutoffHour]);

  // Fetch monthly data once or when cutoff changes
  useEffect(() => {
    fetchMonthlyAnalytics(cutoffHour, 0)
      .then((data) => {
        setMonthlyData(data);
      })
      .catch((err) => {
        console.error('Failed to load monthly analytics:', err);
      });
  }, [cutoffHour]);

  return (
    <div style={{ minHeight: '100vh', padding: '24px', maxWidth: '1440px', margin: '0 auto' }}>
      
      {/* Executive Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPitch={() => setIsPitchOpen(true)}
        onOpenTechLead={() => setIsTechLeadOpen(true)}
        healthData={healthData}
      />

      {/* Top Error Alert if backend is down */}
      {error && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.12)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          borderRadius: '10px',
          padding: '14px 18px',
          marginBottom: '20px',
          color: '#fb7185',
          fontSize: '0.85rem'
        }}>
          <strong>API Notice:</strong> {error}. Ensure backend FastAPI server is running on port 8000.
        </div>
      )}

      {/* KPI Metric Cards */}
      {deliveryData && (
        <MetricCards
          metrics={deliveryData.summaryMetrics}
          cutoffTimeUTC={deliveryData.cutoffTimeUTC}
        />
      )}

      {/* Tab 1: Day-Ahead Cockpit */}
      {activeTab === 'cockpit' && (
        <>
          <ForecastChart
            deliveryData={deliveryData}
            deliveryDate={deliveryDate}
            setDeliveryDate={setDeliveryDate}
            cutoffHour={cutoffHour}
            setCutoffHour={setCutoffHour}
            availableDates={availableDates}
            onSelectPeriod={(st) => setSelectedPeriodStartTime(st)}
          />

          <SettlementPeriodHeatmap
            periods={deliveryData?.settlementPeriods}
            onSelectPeriod={(st) => setSelectedPeriodStartTime(st)}
          />

          <ProcurementCalculator
            deliveryDate={deliveryDate}
            cutoffHour={cutoffHour}
          />
        </>
      )}

      {/* Tab 2: Accuracy & Error Analytics */}
      {activeTab === 'accuracy' && (
        <>
          <ErrorDistributionChart
            monthlyData={monthlyData}
          />

          <SettlementPeriodHeatmap
            periods={deliveryData?.settlementPeriods}
            onSelectPeriod={(st) => setSelectedPeriodStartTime(st)}
          />

          {monthlyData && (
            <MonthlyLeaderboard
              dailyBreakdown={monthlyData.dailyBreakdown}
              onSelectDate={(d) => {
                setDeliveryDate(d);
                setActiveTab('cockpit');
              }}
              selectedDate={deliveryDate}
            />
          )}
        </>
      )}

      {/* Tab 3: Procurement Simulator */}
      {activeTab === 'procurement' && (
        <>
          <ProcurementCalculator
            deliveryDate={deliveryDate}
            cutoffHour={cutoffHour}
          />

          <ForecastChart
            deliveryData={deliveryData}
            deliveryDate={deliveryDate}
            setDeliveryDate={setDeliveryDate}
            cutoffHour={cutoffHour}
            setCutoffHour={setCutoffHour}
            availableDates={availableDates}
            onSelectPeriod={(st) => setSelectedPeriodStartTime(st)}
          />
        </>
      )}

      {/* Horizon Evolution Modal */}
      {selectedPeriodStartTime && (
        <ForecastEvolutionModal
          targetStartTime={selectedPeriodStartTime}
          onClose={() => setSelectedPeriodStartTime(null)}
        />
      )}

      {/* Client Pitch Deck Modal */}
      {isPitchOpen && (
        <ClientPitchModal
          onClose={() => setIsPitchOpen(false)}
        />
      )}

      {/* Internal Tech Lead Architecture Modal */}
      {isTechLeadOpen && (
        <TechLeadModal
          onClose={() => setIsTechLeadOpen(false)}
        />
      )}

      {/* Professional Footer */}
      <footer style={{
        marginTop: '40px',
        paddingTop: '20px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        fontSize: '0.78rem',
        color: '#64748b'
      }}>
        <div>
          <strong style={{ color: '#94a3b8' }}>AeroWatt UK v1.0.0</strong> • Elexon BMRS Datasets FUELHH & WINDFOR
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <button
            onClick={() => setIsPitchOpen(true)}
            style={{ background: 'none', border: 'none', color: '#06b6d4', cursor: 'pointer', fontSize: '0.78rem' }}
          >
            Client Pitch Document
          </button>
          <button
            onClick={() => setIsTechLeadOpen(true)}
            style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', fontSize: '0.78rem' }}
          >
            Technical Lead Review
          </button>
          <span>UK Power Wholesale Day-Ahead Procurement</span>
        </div>
      </footer>

    </div>
  );
}
