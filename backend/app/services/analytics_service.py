"""
Analytics & Procurement Simulator Service
Performs monthly quantitative accuracy assessments, error distribution modeling,
and day-ahead power procurement risk quantification.
"""
import numpy as np
from typing import Dict, List, Any
from app.services.data_processor import processor
from app.config import (
    DEFAULT_CUTOFF_HOUR,
    DEFAULT_CUTOFF_MINUTE,
    DEFAULT_SYSTEM_BUY_PRICE,
    DEFAULT_SYSTEM_SELL_PRICE,
    DEFAULT_DAY_AHEAD_INDEX_PRICE
)

class AnalyticsService:
    def __init__(self):
        pass

    def get_monthly_analytics(
        self,
        cutoff_hour: int = DEFAULT_CUTOFF_HOUR,
        cutoff_minute: int = DEFAULT_CUTOFF_MINUTE
    ) -> Dict[str, Any]:
        """
        Calculates aggregate quantitative accuracy metrics across all of January 2026.
        """
        available_dates = processor.get_available_dates()
        
        all_errors = []
        all_abs_errors = []
        all_squared_errors = []
        total_actual_mw = 0.0
        total_forecast_mw = 0.0
        peak_abs_errors = []
        offpeak_abs_errors = []

        # Period statistics accumulator: 1..48
        period_stats = {
            p: {
                "actuals": [],
                "forecasts": [],
                "errors": [],
                "abs_errors": []
            }
            for p in range(1, 49)
        }

        daily_breakdown = []

        for d_str in available_dates:
            periods, summary = processor.get_day_ahead_forecasts(d_str, cutoff_hour, cutoff_minute)
            daily_breakdown.append({
                "date": d_str,
                "maeMW": summary["maeMW"],
                "rmseMW": summary["rmseMW"],
                "meanBiasMW": summary["meanBiasMW"],
                "wapePercent": summary["wapePercent"],
                "totalActualMWh": summary["totalActualMWh"],
                "totalForecastMWh": summary["totalForecastMWh"],
                "maxOverforecastMW": summary["maxOverforecastMW"],
                "maxUnderforecastMW": summary["maxUnderforecastMW"]
            })

            for p_data in periods:
                p_num = p_data["settlementPeriod"]
                act = p_data["actualMW"]
                fc = p_data["dayAheadForecastMW"]
                err = p_data["errorMW"]

                if act is not None and fc is not None and err is not None:
                    diff = fc - act
                    abs_diff = abs(diff)
                    all_errors.append(diff)
                    all_abs_errors.append(abs_diff)
                    all_squared_errors.append(diff ** 2)
                    total_actual_mw += act
                    total_forecast_mw += fc

                    period_stats[p_num]["actuals"].append(act)
                    period_stats[p_num]["forecasts"].append(fc)
                    period_stats[p_num]["errors"].append(diff)
                    period_stats[p_num]["abs_errors"].append(abs_diff)

                    if 15 <= p_num <= 38:
                        peak_abs_errors.append(abs_diff)
                    else:
                        offpeak_abs_errors.append(abs_diff)

        # Monthly overall summary
        n = len(all_abs_errors)
        if n > 0:
            arr_err = np.array(all_errors)
            arr_abs = np.array(all_abs_errors)
            
            mae = float(np.mean(arr_abs))
            rmse = float(np.sqrt(np.mean(arr_err ** 2)))
            bias = float(np.mean(arr_err))
            wape = float((np.sum(arr_abs) / max(total_actual_mw, 1.0)) * 100.0)
            
            p10 = float(np.percentile(arr_err, 10))
            p50 = float(np.percentile(arr_err, 50))
            p90 = float(np.percentile(arr_err, 90))
            max_over = float(np.max(arr_err))
            max_under = float(abs(np.min(arr_err)))
            
            peak_mae = float(np.mean(peak_abs_errors)) if peak_abs_errors else 0.0
            offpeak_mae = float(np.mean(offpeak_abs_errors)) if offpeak_abs_errors else 0.0
            
            all_actuals = [val for p_dict in period_stats.values() for val in p_dict["actuals"]]
            if all_actuals and len(all_actuals) == len(arr_abs):
                pct_arr = arr_abs / np.maximum(np.array(all_actuals), 100.0) * 100.0
                mape = float(np.mean(pct_arr))
            else:
                mape = 0.0
        else:
            mae = rmse = bias = wape = mape = 0.0
            p10 = p50 = p90 = max_over = max_under = peak_mae = offpeak_mae = 0.0

        overall_metrics = {
            "totalActualMWh": round(total_actual_mw * 0.5, 1),
            "totalForecastMWh": round(total_forecast_mw * 0.5, 1),
            "maeMW": round(mae, 1),
            "rmseMW": round(rmse, 1),
            "meanBiasMW": round(bias, 1),
            "wapePercent": round(wape, 1),
            "mapePercent": round(mape, 1),
            "maxOverforecastMW": round(max_over, 1),
            "maxUnderforecastMW": round(max_under, 1),
            "p10ErrorMW": round(p10, 1),
            "p50ErrorMW": round(p50, 1),
            "p90ErrorMW": round(p90, 1),
            "peakMaeMW": round(peak_mae, 1),
            "offPeakMaeMW": round(offpeak_mae, 1),
            "periodsEvaluated": n
        }

        # Hourly / Settlement Period Aggregates (1 to 48)
        hourly_profile = []
        for p in range(1, 49):
            p_data = period_stats[p]
            p_acts = np.array(p_data["actuals"])
            p_fcs = np.array(p_data["forecasts"])
            p_errs = np.array(p_data["errors"])
            p_abs = np.array(p_data["abs_errors"])
            cnt = len(p_errs)

            h = (p - 1) // 2
            m = 30 if p % 2 == 0 else 0
            time_label = f"{h:02d}:{m:02d}"

            if cnt > 0:
                p_mae = float(np.mean(p_abs))
                p_rmse = float(np.sqrt(np.mean(p_errs ** 2)))
                p_bias = float(np.mean(p_errs))
                p_wape = float((np.sum(p_abs) / max(np.sum(p_acts), 1.0)) * 100.0)
                avg_act = float(np.mean(p_acts))
                avg_fc = float(np.mean(p_fcs))
            else:
                p_mae = p_rmse = p_bias = p_wape = avg_act = avg_fc = 0.0

            hourly_profile.append({
                "settlementPeriod": p,
                "timeLabel": time_label,
                "avgActualMW": round(avg_act, 1),
                "avgForecastMW": round(avg_fc, 1),
                "maeMW": round(p_mae, 1),
                "rmseMW": round(p_rmse, 1),
                "meanBiasMW": round(p_bias, 1),
                "wapePercent": round(p_wape, 1),
                "sampleCount": cnt
            })

        # Error distribution histogram
        error_bins_def = [
            ("Below -3000 MW", -999999, -3000),
            ("-3000 to -2000 MW", -3000, -2000),
            ("-2000 to -1000 MW", -2000, -1000),
            ("-1000 to -500 MW", -1000, -500),
            ("-500 to 0 MW", -500, 0),
            ("0 to +500 MW", 0, 500),
            ("+500 to +1000 MW", 500, 1000),
            ("+1000 to +2000 MW", 1000, 2000),
            ("+2000 to +3000 MW", 2000, 3000),
            ("Above +3000 MW", 3000, 999999),
        ]
        
        arr_err = np.array(all_errors)
        error_distribution = []
        for label, low, high in error_bins_def:
            mask = (arr_err >= low) & (arr_err < high)
            c = int(np.sum(mask))
            pct = round((c / max(n, 1)) * 100.0, 1)
            error_distribution.append({
                "binLabel": label,
                "minMW": low if low > -900000 else -4000,
                "maxMW": high if high < 900000 else 4000,
                "count": c,
                "percentage": pct
            })

        return {
            "month": "January 2026",
            "totalDays": len(available_dates),
            "totalPeriods": n,
            "overallMetrics": overall_metrics,
            "hourlyProfile": hourly_profile,
            "dailyBreakdown": daily_breakdown,
            "errorDistribution": error_distribution
        }

    def simulate_procurement(
        self,
        delivery_date: str,
        cutoff_hour: int = DEFAULT_CUTOFF_HOUR,
        cutoff_minute: int = DEFAULT_CUTOFF_MINUTE,
        demand_profile: str = "medium_utility",
        user_peak_demand_mw: float = 16000.0,
        risk_buffer_percentile: float = 85.0, # e.g. 85th percentile error buffer
        system_buy_price: float = DEFAULT_SYSTEM_BUY_PRICE,
        system_sell_price: float = DEFAULT_SYSTEM_SELL_PRICE,
        day_ahead_price: float = DEFAULT_DAY_AHEAD_INDEX_PRICE
    ) -> Dict[str, Any]:
        """
        Simulates how day-ahead procurement decisions perform with and without
        quantified error buffers.
        Demonstrates tangible financial value and risk mitigation for the utility.
        """
        periods, summary = processor.get_day_ahead_forecasts(delivery_date, cutoff_hour, cutoff_minute)

        # Realistic UK demand diurnal profile shape (normalised between 0.65 off-peak and 1.0 peak)
        diurnal_weights = [
            0.68, 0.65, 0.64, 0.63, 0.64, 0.66, 0.70, 0.75, # 00:00 - 03:30
            0.82, 0.88, 0.94, 0.98, 0.99, 1.00, 0.97, 0.96, # 04:00 - 07:30
            0.95, 0.94, 0.94, 0.93, 0.94, 0.95, 0.96, 0.97, # 08:00 - 11:30
            0.96, 0.95, 0.95, 0.96, 0.97, 0.98, 1.00, 0.99, # 12:00 - 15:30
            0.98, 0.97, 0.96, 0.95, 0.92, 0.88, 0.84, 0.80, # 16:00 - 19:30
            0.78, 0.76, 0.74, 0.72, 0.71, 0.70, 0.69, 0.68  # 20:00 - 23:30
        ]

        if demand_profile == "large_utility":
            scale = 28000.0
        elif demand_profile == "small_supplier":
            scale = 8000.0
        elif demand_profile == "custom":
            scale = float(user_peak_demand_mw)
        else:
            scale = 16000.0 # medium utility (~20-25% national scale)

        # Compute dynamic safety buffer based on MAE and selected risk appetite
        # Buffer accounts for over-forecast risk: Buffer = MAE * factor
        factor = 1.0 + (risk_buffer_percentile - 50.0) / 40.0 # e.g. 85th percentile -> ~1.87x MAE
        recommended_buffer_mw = max(round(summary["maeMW"] * factor, 1), 200.0)

        detailed_periods = []
        total_baseline_imbalance_gbp = 0.0
        total_buffered_imbalance_gbp = 0.0
        total_rec_procurement_mwh = 0.0

        for idx, p in enumerate(periods):
            p_num = p["settlementPeriod"]
            time_lbl = p["timeLabel"]
            act_wind = p["actualMW"] or 0.0
            fc_wind = p["dayAheadForecastMW"] or 0.0

            # Gross consumer demand for this half-hour
            weight = diurnal_weights[idx] if idx < len(diurnal_weights) else 0.85
            gross_demand = round(scale * weight, 1)

            # 1. Naive Base Day-Ahead procurement (no buffer, relies purely on point forecast)
            base_procurement = max(0.0, gross_demand - fc_wind)

            # 2. Recommended Day-Ahead procurement with quantified risk buffer
            # Buffer only needed to prevent short risk (procure buffer MW up to gross demand)
            rec_procurement = min(gross_demand, max(0.0, base_procurement + (recommended_buffer_mw * 0.4)))

            # 3. Actual net power that was physically needed in real-time
            actual_needed = max(0.0, gross_demand - act_wind)

            # 4. Imbalance under Naive strategy
            # If base_procurement < actual_needed: utility is SHORT (must buy at high SBP)
            # If base_procurement > actual_needed: utility is LONG (sells at low SSP)
            imbalance_naive = base_procurement - actual_needed # positive = long, negative = short
            if imbalance_naive < 0: # SHORT DEFICIT (cost penalty)
                short_mwh = abs(imbalance_naive) * 0.5
                naive_penalty = short_mwh * (system_buy_price - day_ahead_price)
            else: # LONG SURPLUS (discount loss)
                long_mwh = imbalance_naive * 0.5
                naive_penalty = long_mwh * (day_ahead_price - system_sell_price)

            # 5. Imbalance under Buffered strategy
            imbalance_buffered = rec_procurement - actual_needed
            if imbalance_buffered < 0:
                short_mwh = abs(imbalance_buffered) * 0.5
                buffered_penalty = short_mwh * (system_buy_price - day_ahead_price)
            else:
                long_mwh = imbalance_buffered * 0.5
                buffered_penalty = long_mwh * (day_ahead_price - system_sell_price)

            avoided_cost = max(0.0, naive_penalty - buffered_penalty)
            total_baseline_imbalance_gbp += naive_penalty
            total_buffered_imbalance_gbp += buffered_penalty
            total_rec_procurement_mwh += (rec_procurement * 0.5)

            detailed_periods.append({
                "settlementPeriod": p_num,
                "timeLabel": time_lbl,
                "grossDemandMW": gross_demand,
                "forecastWindMW": fc_wind,
                "actualWindMW": act_wind,
                "dayAheadBaseProcurementMW": round(base_procurement, 1),
                "recommendedSafetyBufferMW": round(recommended_buffer_mw * 0.4, 1),
                "recommendedDayAheadProcurementMW": round(rec_procurement, 1),
                "actualNetProcurementRequiredMW": round(actual_needed, 1),
                "imbalanceWithoutBufferMW": round(imbalance_naive, 1),
                "imbalanceWithBufferMW": round(imbalance_buffered, 1),
                "avoidedShortImbalanceCostGBP": round(avoided_cost, 2)
            })

        net_savings = max(0.0, total_baseline_imbalance_gbp - total_buffered_imbalance_gbp)

        return {
            "deliveryDate": delivery_date,
            "grossDemandProfileName": demand_profile,
            "baselineShortImbalanceExposureGBP": round(total_baseline_imbalance_gbp, 2),
            "bufferedImbalanceExposureGBP": round(total_buffered_imbalance_gbp, 2),
            "netFinancialSavingsGBP": round(net_savings, 2),
            "recommendedTotalProcurementMWh": round(total_rec_procurement_mwh, 1),
            "periods": detailed_periods
        }

analytics_service = AnalyticsService()
