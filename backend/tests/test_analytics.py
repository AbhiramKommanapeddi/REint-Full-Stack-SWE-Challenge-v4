"""
Unit tests for data processor and accuracy analytics
"""
import pytest
from app.services.data_processor import processor
from app.services.analytics_service import analytics_service

def test_data_loaded():
    assert len(processor.actuals) > 0, "Actuals should be loaded"
    assert len(processor.forecasts) > 0, "Forecasts should be loaded"
    dates = processor.get_available_dates()
    assert len(dates) >= 28, f"Expected January dates, got {len(dates)}"

def test_day_ahead_forecast_alignment():
    # Test on Jan 15, 2026 with 11:00 UTC D-1 cutoff
    periods, metrics = processor.get_day_ahead_forecasts("2026-01-15", cutoff_hour=11, cutoff_minute=0)
    assert len(periods) == 48, "Must produce 48 settlement periods"
    assert metrics["periodsEvaluated"] > 0
    assert metrics["maeMW"] >= 0
    assert metrics["rmseMW"] >= metrics["maeMW"], "RMSE must be >= MAE mathematically"
    assert metrics["wapePercent"] >= 0

def test_monthly_analytics():
    monthly = analytics_service.get_monthly_analytics(cutoff_hour=11, cutoff_minute=0)
    assert monthly["month"] == "January 2026"
    assert monthly["totalPeriods"] > 1000
    assert len(monthly["hourlyProfile"]) == 48
    assert len(monthly["dailyBreakdown"]) >= 28
    assert len(monthly["errorDistribution"]) > 0

def test_procurement_simulation():
    sim = analytics_service.simulate_procurement(
        delivery_date="2026-01-15",
        cutoff_hour=11,
        demand_profile="medium_utility",
        user_peak_demand_mw=16000.0,
        risk_buffer_percentile=85.0
    )
    assert sim["deliveryDate"] == "2026-01-15"
    assert len(sim["periods"]) == 48
    assert sim["baselineShortImbalanceExposureGBP"] >= 0
    assert sim["bufferedImbalanceExposureGBP"] >= 0
