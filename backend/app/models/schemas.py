"""
Pydantic Schemas for UK Day-Ahead Renewable Procurement App
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class SettlementPeriodPoint(BaseModel):
    settlementPeriod: int = Field(..., description="UK Settlement Period (1 to 48)")
    startTime: str = Field(..., description="Target half-hour start time in ISO UTC")
    timeLabel: str = Field(..., description="Display label, e.g. '14:30'")
    actualMW: Optional[float] = Field(None, description="Actual outturn wind generation in MW")
    dayAheadForecastMW: Optional[float] = Field(None, description="Wind forecast available before decision cutoff in MW")
    forecastPublishTime: Optional[str] = Field(None, description="Timestamp when the decision forecast was published")
    horizonHours: Optional[float] = Field(None, description="Lead time in hours between forecast publication and delivery start")
    errorMW: Optional[float] = Field(None, description="Forecast error (Forecast - Actual) in MW")
    absErrorMW: Optional[float] = Field(None, description="Absolute error in MW")
    errorPercentage: Optional[float] = Field(None, description="Percentage error relative to actual")
    imbalanceDirection: Optional[str] = Field(None, description="'SHORT_DEFICIT' (Over-forecast), 'LONG_SURPLUS' (Under-forecast), or 'BALANCED'")

class SummaryMetrics(BaseModel):
    totalActualMWh: float = Field(..., description="Total actual energy delivered (MWh = sum(MW * 0.5h))")
    totalForecastMWh: float = Field(..., description="Total forecast energy (MWh)")
    maeMW: float = Field(..., description="Mean Absolute Error in MW")
    rmseMW: float = Field(..., description="Root Mean Square Error in MW")
    meanBiasMW: float = Field(..., description="Mean Bias in MW (Positive = Over-forecasting, Negative = Under-forecasting)")
    wapePercent: float = Field(..., description="Weighted Absolute Percentage Error (%) = Sum(|Err|) / Sum(Actual) * 100")
    mapePercent: float = Field(..., description="Mean Absolute Percentage Error (%)")
    maxOverforecastMW: float = Field(..., description="Worst-case over-forecasting (leads to under-procurement short risk)")
    maxUnderforecastMW: float = Field(..., description="Worst-case under-forecasting (leads to over-procurement surplus)")
    p10ErrorMW: float = Field(..., description="10th percentile of error distribution")
    p50ErrorMW: float = Field(..., description="50th percentile (median) error")
    p90ErrorMW: float = Field(..., description="90th percentile error")
    peakMaeMW: float = Field(..., description="MAE during peak demand hours (07:00 - 19:00 UTC)")
    offPeakMaeMW: float = Field(..., description="MAE during off-peak hours")
    periodsEvaluated: int = Field(..., description="Total settlement periods evaluated")

class PeriodAggregateStat(BaseModel):
    settlementPeriod: int
    timeLabel: str
    avgActualMW: float
    avgForecastMW: float
    maeMW: float
    rmseMW: float
    meanBiasMW: float
    wapePercent: float
    sampleCount: int

class ErrorBin(BaseModel):
    binLabel: str
    minMW: float
    maxMW: float
    count: int
    percentage: float

class ProcurementPeriodDetail(BaseModel):
    settlementPeriod: int
    timeLabel: str
    grossDemandMW: float
    forecastWindMW: float
    actualWindMW: float
    dayAheadBaseProcurementMW: float
    recommendedSafetyBufferMW: float
    recommendedDayAheadProcurementMW: float
    actualNetProcurementRequiredMW: float
    imbalanceWithoutBufferMW: float
    imbalanceWithBufferMW: float
    avoidedShortImbalanceCostGBP: float

class ProcurementAnalysisResult(BaseModel):
    deliveryDate: str
    grossDemandProfileName: str
    baselineShortImbalanceExposureGBP: float
    bufferedImbalanceExposureGBP: float
    netFinancialSavingsGBP: float
    recommendedTotalProcurementMWh: float
    periods: List[ProcurementPeriodDetail]

class ForecastEvolutionItem(BaseModel):
    publishTime: str
    horizonHours: float
    forecastMW: float

class ForecastEvolutionResponse(BaseModel):
    targetStartTime: str
    settlementDate: str
    settlementPeriod: int
    actualMW: Optional[float]
    evolution: List[ForecastEvolutionItem]

class DayAheadResponse(BaseModel):
    deliveryDate: str
    cutoffHour: int
    cutoffMinute: int
    cutoffTimeUTC: str
    summaryMetrics: SummaryMetrics
    settlementPeriods: List[SettlementPeriodPoint]
    availableDates: List[str]

class MonthlyAnalyticsResponse(BaseModel):
    month: str
    totalDays: int
    totalPeriods: int
    overallMetrics: SummaryMetrics
    hourlyProfile: List[PeriodAggregateStat]
    dailyBreakdown: List[Dict[str, Any]]
    errorDistribution: List[ErrorBin]
