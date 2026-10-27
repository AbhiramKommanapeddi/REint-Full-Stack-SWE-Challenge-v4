"""
FastAPI Backend Application for UK Day-Ahead Renewable Procurement
Client: UK Energy Utility
Data Source: Elexon BMRS (FUELHH WIND & WINDFOR)
"""
import logging
from typing import Optional
from fastapi import FastAPI, Query, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.models.schemas import (
    DayAheadResponse,
    MonthlyAnalyticsResponse,
    ForecastEvolutionResponse,
    ProcurementAnalysisResult
)
from app.services.data_processor import processor
from app.services.analytics_service import analytics_service
from app.services.elexon_client import elexon_client
from app.config import (
    DEFAULT_CUTOFF_HOUR,
    DEFAULT_CUTOFF_MINUTE,
    DEFAULT_SYSTEM_BUY_PRICE,
    DEFAULT_SYSTEM_SELL_PRICE,
    DEFAULT_DAY_AHEAD_INDEX_PRICE
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("energy-app")

app = FastAPI(
    title="UK Day-Ahead Renewable Generation & Procurement API",
    description="Customized Decision-Support & Accuracy Quantification Engine for UK Wholesale Day-Ahead Power Procurement",
    version="1.0.0"
)

# CORS configuration for frontend web app
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
def health_check():
    dates = processor.get_available_dates()
    return {
        "status": "healthy",
        "service": "UK Day-Ahead Energy Procurement Engine",
        "dataScope": "January 2026 Elexon BMRS (FUELHH WIND & WINDFOR)",
        "availableDeliveryDatesCount": len(dates),
        "availableDates": dates,
        "totalActualRecords": len(processor.actuals),
        "totalForecastRecords": len(processor.forecasts)
    }

@app.get("/api/forecasts/day-ahead", response_model=DayAheadResponse)
def get_day_ahead_forecasts(
    deliveryDate: Optional[str] = Query(None, description="Delivery date in YYYY-MM-DD format (e.g. 2026-01-15)"),
    cutoffHour: int = Query(DEFAULT_CUTOFF_HOUR, ge=0, le=23, description="Decision cutoff hour on Day D-1 (UTC)"),
    cutoffMinute: int = Query(DEFAULT_CUTOFF_MINUTE, ge=0, le=59, description="Decision cutoff minute on Day D-1")
):
    available_dates = processor.get_available_dates()
    if not available_dates:
        raise HTTPException(status_code=503, detail="Elexon dataset is loading or not available.")

    selected_date = deliveryDate if deliveryDate else available_dates[min(14, len(available_dates) - 1)]
    if selected_date not in available_dates:
        # Fallback to closest available date
        selected_date = available_dates[0]

    periods, summary = processor.get_day_ahead_forecasts(selected_date, cutoffHour, cutoffMinute)
    cutoff_str = f"D-1 at {cutoffHour:02d}:{cutoffMinute:02d} UTC"

    return {
        "deliveryDate": selected_date,
        "cutoffHour": cutoffHour,
        "cutoffMinute": cutoffMinute,
        "cutoffTimeUTC": cutoff_str,
        "summaryMetrics": summary,
        "settlementPeriods": periods,
        "availableDates": available_dates
    }

@app.get("/api/forecasts/evolution", response_model=ForecastEvolutionResponse)
def get_forecast_evolution(
    targetStartTime: str = Query(..., description="Target settlement start time ISO (e.g. 2026-01-15T14:00:00Z)")
):
    result = processor.get_forecast_evolution(targetStartTime)
    return result

@app.get("/api/analytics/monthly", response_model=MonthlyAnalyticsResponse)
def get_monthly_analytics(
    cutoffHour: int = Query(DEFAULT_CUTOFF_HOUR, ge=0, le=23),
    cutoffMinute: int = Query(DEFAULT_CUTOFF_MINUTE, ge=0, le=59)
):
    analytics = analytics_service.get_monthly_analytics(cutoffHour, cutoffMinute)
    return analytics

@app.post("/api/analytics/simulate-procurement", response_model=ProcurementAnalysisResult)
def simulate_procurement(
    deliveryDate: str = Query(..., description="Target delivery date YYYY-MM-DD"),
    cutoffHour: int = Query(DEFAULT_CUTOFF_HOUR, ge=0, le=23),
    cutoffMinute: int = Query(DEFAULT_CUTOFF_MINUTE, ge=0, le=59),
    demandProfile: str = Query("medium_utility", description="medium_utility, large_utility, small_supplier, or custom"),
    userPeakDemandMW: float = Query(16000.0, description="Gross peak customer demand in MW"),
    riskBufferPercentile: float = Query(85.0, description="Percentile risk tolerance (e.g. 85th percentile)"),
    systemBuyPrice: float = Query(DEFAULT_SYSTEM_BUY_PRICE, description="UK Imbalance System Buy Price (£/MWh)"),
    systemSellPrice: float = Query(DEFAULT_SYSTEM_SELL_PRICE, description="UK Imbalance System Sell Price (£/MWh)"),
    dayAheadPrice: float = Query(DEFAULT_DAY_AHEAD_INDEX_PRICE, description="Day-Ahead wholesale price (£/MWh)")
):
    result = analytics_service.simulate_procurement(
        delivery_date=deliveryDate,
        cutoff_hour=cutoffHour,
        cutoff_minute=cutoffMinute,
        demand_profile=demandProfile,
        user_peak_demand_mw=userPeakDemandMW,
        risk_buffer_percentile=riskBufferPercentile,
        system_buy_price=systemBuyPrice,
        system_sell_price=systemSellPrice,
        day_ahead_price=dayAheadPrice
    )
    return result

@app.get("/api/elexon/status")
def get_elexon_status():
    return elexon_client.check_connection()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
