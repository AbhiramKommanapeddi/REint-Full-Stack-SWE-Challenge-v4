"""
Application Configuration
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"

ACTUALS_FILE = DATA_DIR / "fuelhh_wind_jan2026.json"
FORECASTS_FILE = DATA_DIR / "windfor_jan2026.json"

# UK Day-Ahead Market standard gate closure is 11:00 UTC / GMT on D-1
DEFAULT_CUTOFF_HOUR = 11
DEFAULT_CUTOFF_MINUTE = 0

# Number of half-hourly settlement periods in a UK delivery day
SETTLEMENT_PERIODS_PER_DAY = 48

# Representative UK System Imbalance Pricing (£/MWh) for risk quantification
DEFAULT_SYSTEM_BUY_PRICE = 125.0   # Cost when short (under-procured)
DEFAULT_SYSTEM_SELL_PRICE = 45.0   # Value when long (over-procured)
DEFAULT_DAY_AHEAD_INDEX_PRICE = 85.0 # Day-ahead power market reference
