"""
Data Processor Service
Handles Elexon BMRS data indexing, day-ahead cutoff matching, and resolution alignment.
"""
import os
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple, Any

from app.config import ACTUALS_FILE, FORECASTS_FILE, DEFAULT_CUTOFF_HOUR, DEFAULT_CUTOFF_MINUTE

logger = logging.getLogger(__name__)

class DataProcessor:
    def __init__(self):
        self.actuals: List[Dict[str, Any]] = []
        self.forecasts: List[Dict[str, Any]] = []
        
        # In-memory indexes for sub-millisecond querying
        # actuals_by_start: ISO startTime -> actual generation MW
        self.actuals_by_start: Dict[str, float] = {}
        
        # forecasts_by_start: ISO startTime -> list of {publishTime, generation, dt_publish}
        self.forecasts_by_start: Dict[str, List[Dict[str, Any]]] = {}
        
        # Available delivery dates
        self.available_dates: List[str] = []
        
        self.load_data()

    def load_data(self):
        """Loads cached January 2026 actuals and forecasts from disk."""
        if os.path.exists(ACTUALS_FILE):
            try:
                with open(ACTUALS_FILE, 'r', encoding='utf-8') as f:
                    self.actuals = json.load(f)
                for item in self.actuals:
                    st = item.get("startTime")
                    gen = item.get("generation", 0.0)
                    if st is not None and gen is not None:
                        self.actuals_by_start[st] = float(gen)
                logger.info(f"Loaded {len(self.actuals)} actual wind records.")
            except Exception as e:
                logger.error(f"Error reading actuals file: {e}")

        if os.path.exists(FORECASTS_FILE):
            try:
                with open(FORECASTS_FILE, 'r', encoding='utf-8') as f:
                    self.forecasts = json.load(f)
                for item in self.forecasts:
                    st = item.get("startTime")
                    pt = item.get("publishTime")
                    gen = item.get("generation", 0.0)
                    if st and pt and gen is not None:
                        if st not in self.forecasts_by_start:
                            self.forecasts_by_start[st] = []
                        self.forecasts_by_start[st].append({
                            "publishTime": pt,
                            "generation": float(gen),
                            "dt_publish": datetime.fromisoformat(pt.replace('Z', '+00:00'))
                        })
                
                # Sort forecasts for each startTime by publishTime ascending
                for st in self.forecasts_by_start:
                    self.forecasts_by_start[st].sort(key=lambda x: x["dt_publish"])
                logger.info(f"Loaded {len(self.forecasts)} forecast wind records.")
            except Exception as e:
                logger.error(f"Error reading forecasts file: {e}")

        # Compute available January 2026 delivery dates (YYYY-MM-DD)
        dates_set = set()
        for item in self.actuals:
            st = item.get("startTime", "")
            if st.startswith("2026-01-"):
                dates_set.add(st[:10])
        self.available_dates = sorted(list(dates_set))
        logger.info(f"Available delivery dates: {len(self.available_dates)} days.")

    def get_available_dates(self) -> List[str]:
        return self.available_dates

    def get_day_ahead_forecasts(
        self,
        delivery_date_str: str,
        cutoff_hour: int = DEFAULT_CUTOFF_HOUR,
        cutoff_minute: int = DEFAULT_CUTOFF_MINUTE
    ) -> Tuple[List[Dict[str, Any]], Dict[str, Any]]:
        """
        Retrieves Day-Ahead forecasts available at or before the decision cutoff on Day D-1,
        and aligns them with actual FUELHH generation for each of the 48 settlement periods.
        """
        target_date = datetime.strptime(delivery_date_str, "%Y-%m-%d")
        d_minus_1 = target_date - timedelta(days=1)
        
        # Day D-1 cutoff timestamp in UTC
        cutoff_dt = datetime(
            d_minus_1.year, d_minus_1.month, d_minus_1.day,
            cutoff_hour, cutoff_minute, 0
        )
        cutoff_str = cutoff_dt.strftime("%Y-%m-%dT%H:%M:%SZ")

        periods = []
        errors = []
        abs_errors = []
        squared_errors = []
        total_actual_mw = 0.0
        total_forecast_mw = 0.0
        peak_errors = []
        offpeak_errors = []

        for period in range(1, 49):
            period_minutes = (period - 1) * 30
            period_start = target_date + timedelta(minutes=period_minutes)
            st_iso = period_start.strftime("%Y-%m-%dT%H:%M:%SZ")
            hour_part = period_start.hour
            min_part = period_start.minute
            time_label = f"{hour_part:02d}:{min_part:02d}"

            # 1. Actual generation
            actual_mw = self.actuals_by_start.get(st_iso)

            # 2. Hourly forecast lookup (WINDFOR is hourly: 00:00, 01:00, etc.)
            hourly_start_iso = period_start.replace(minute=0, second=0).strftime("%Y-%m-%dT%H:%M:%SZ")
            available_forecasts = self.forecasts_by_start.get(hourly_start_iso, [])

            # Filter forecasts published at or before cutoff on Day D-1
            eligible = [
                f for f in available_forecasts
                if f["publishTime"] <= cutoff_str
            ]

            forecast_mw = None
            forecast_pt = None
            horizon_hours = None

            if eligible:
                # Latest forecast published prior to cutoff
                best = eligible[-1]
                forecast_mw = round(best["generation"], 1)
                forecast_pt = best["publishTime"]
                lead_seconds = (period_start - best["dt_publish"].replace(tzinfo=None)).total_seconds()
                horizon_hours = round(lead_seconds / 3600.0, 1)
            elif available_forecasts:
                # Fallback to earliest available forecast if cutoff is earlier than first issue
                earliest = available_forecasts[0]
                forecast_mw = round(earliest["generation"], 1)
                forecast_pt = earliest["publishTime"]
                lead_seconds = (period_start - earliest["dt_publish"].replace(tzinfo=None)).total_seconds()
                horizon_hours = round(lead_seconds / 3600.0, 1)

            error_mw = None
            abs_error_mw = None
            err_pct = None
            imbalance_dir = "BALANCED"

            if actual_mw is not None and forecast_mw is not None:
                diff = forecast_mw - actual_mw
                error_mw = round(diff, 1)
                abs_error_mw = round(abs(diff), 1)
                if actual_mw > 0:
                    err_pct = round((diff / actual_mw) * 100.0, 1)
                else:
                    err_pct = 0.0

                if diff > 10.0:
                    imbalance_dir = "SHORT_DEFICIT"  # Wind over-forecast -> utility under-procured day-ahead
                elif diff < -10.0:
                    imbalance_dir = "LONG_SURPLUS"   # Wind under-forecast -> utility over-procured day-ahead

                errors.append(diff)
                abs_errors.append(abs(diff))
                squared_errors.append(diff ** 2)
                total_actual_mw += actual_mw
                total_forecast_mw += forecast_mw

                # UK peak demand periods: 15 to 38 (07:00 to 19:00 UTC)
                if 15 <= period <= 38:
                    peak_errors.append(abs(diff))
                else:
                    offpeak_errors.append(abs(diff))

            periods.append({
                "settlementPeriod": period,
                "startTime": st_iso,
                "timeLabel": time_label,
                "actualMW": round(actual_mw, 1) if actual_mw is not None else None,
                "dayAheadForecastMW": forecast_mw,
                "forecastPublishTime": forecast_pt,
                "horizonHours": horizon_hours,
                "errorMW": error_mw,
                "absErrorMW": abs_error_mw,
                "errorPercentage": err_pct,
                "imbalanceDirection": imbalance_dir
            })

        # Summary statistics
        n = len(abs_errors)
        if n > 0:
            mae = round(sum(abs_errors) / n, 1)
            rmse = round((sum(squared_errors) / n) ** 0.5, 1)
            mean_bias = round(sum(errors) / n, 1)
            wape = round((sum(abs_errors) / max(total_actual_mw, 1.0)) * 100.0, 1)
            
            # Sorted errors for percentiles
            sorted_err = sorted(errors)
            p10 = round(sorted_err[int(0.10 * n)], 1)
            p50 = round(sorted_err[int(0.50 * n)], 1)
            p90 = round(sorted_err[min(int(0.90 * n), n - 1)], 1)
            max_over = round(max(errors), 1)
            max_under = round(abs(min(errors)), 1)
            
            peak_mae = round(sum(peak_errors) / max(len(peak_errors), 1), 1)
            offpeak_mae = round(sum(offpeak_errors) / max(len(offpeak_errors), 1), 1)
            
            # Simple MAPE calculation
            pct_errors = [
                abs(p["errorMW"]) / p["actualMW"] * 100.0
                for p in periods
                if p["actualMW"] is not None and p["actualMW"] > 100 and p["errorMW"] is not None
            ]
            mape = round(sum(pct_errors) / len(pct_errors), 1) if pct_errors else 0.0
        else:
            mae = rmse = mean_bias = wape = mape = 0.0
            p10 = p50 = p90 = max_over = max_under = peak_mae = offpeak_mae = 0.0

        summary_metrics = {
            "totalActualMWh": round(total_actual_mw * 0.5, 1),      # half-hour periods -> MWh
            "totalForecastMWh": round(total_forecast_mw * 0.5, 1),
            "maeMW": mae,
            "rmseMW": rmse,
            "meanBiasMW": mean_bias,
            "wapePercent": wape,
            "mapePercent": mape,
            "maxOverforecastMW": max_over,
            "maxUnderforecastMW": max_under,
            "p10ErrorMW": p10,
            "p50ErrorMW": p50,
            "p90ErrorMW": p90,
            "peakMaeMW": peak_mae,
            "offPeakMaeMW": offpeak_mae,
            "periodsEvaluated": n
        }

        return periods, summary_metrics

    def get_forecast_evolution(self, target_start_time: str) -> Dict[str, Any]:
        """
        Returns how the forecast for a target start time evolved over time
        across all publish horizons (from days ahead to gate closure).
        """
        # Round to hourly start time if needed
        dt = datetime.fromisoformat(target_start_time.replace('Z', '+00:00'))
        hourly_iso = dt.replace(minute=0, second=0).strftime("%Y-%m-%dT%H:%M:%SZ")
        
        actual = self.actuals_by_start.get(target_start_time)
        if actual is None:
            actual = self.actuals_by_start.get(hourly_iso)

        raw_forecasts = self.forecasts_by_start.get(hourly_iso, [])
        evolution = []
        for fc in raw_forecasts:
            lead_sec = (dt.replace(tzinfo=None) - fc["dt_publish"].replace(tzinfo=None)).total_seconds()
            evolution.append({
                "publishTime": fc["publishTime"],
                "horizonHours": round(lead_sec / 3600.0, 1),
                "forecastMW": round(fc["generation"], 1)
            })

        period = (dt.hour * 2) + (1 if dt.minute < 30 else 2)
        return {
            "targetStartTime": target_start_time,
            "settlementDate": dt.strftime("%Y-%m-%d"),
            "settlementPeriod": period,
            "actualMW": round(actual, 1) if actual is not None else None,
            "evolution": evolution
        }

# Global singleton instance
processor = DataProcessor()
