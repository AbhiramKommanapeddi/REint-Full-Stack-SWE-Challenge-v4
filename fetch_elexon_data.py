"""
Elexon BMRS Data Fetcher for January 2026
Downloads FUELHH (WIND actuals) and WINDFOR (Wind forecasts)
"""
import urllib.request
import json
import os
import sys
from datetime import datetime, timedelta

DATA_DIR = os.path.join(os.path.dirname(__file__), 'backend', 'data')
os.makedirs(DATA_DIR, exist_ok=True)

ACTUALS_FILE = os.path.join(DATA_DIR, 'fuelhh_wind_jan2026.json')
FORECASTS_FILE = os.path.join(DATA_DIR, 'windfor_jan2026.json')

def fetch_json(url, timeout=30):
    req = urllib.request.Request(
        url,
        headers={'User-Agent': 'UK-Energy-Procurement-App/1.0', 'Accept': 'application/json'}
    )
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode('utf-8'))

def fetch_actuals():
    print("Fetching FUELHH (WIND actuals) for January 2026...")
    all_wind = []
    # Fetch in 5-day chunks from 2025-12-31 to 2026-02-01
    start_date = datetime(2025, 12, 31, 0, 0)
    end_date = datetime(2026, 2, 1, 23, 59)
    cur = start_date

    while cur < end_date:
        next_chunk = min(cur + timedelta(days=5), end_date)
        s_str = cur.strftime('%Y-%m-%dT%H:%M:%SZ')
        e_str = next_chunk.strftime('%Y-%m-%dT%H:%M:%SZ')
        url = f"https://data.elexon.co.uk/bmrs/api/v1/datasets/FUELHH/stream?publishDateTimeFrom={s_str}&publishDateTimeTo={e_str}"
        print(f"  Fetching FUELHH: {s_str} -> {e_str}")
        try:
            items = fetch_json(url)
            wind_items = [
                {
                    "startTime": item["startTime"],
                    "publishTime": item.get("publishTime"),
                    "settlementDate": item.get("settlementDate"),
                    "settlementPeriod": item.get("settlementPeriod"),
                    "generation": item.get("generation", 0)
                }
                for item in items if item.get("fuelType") == "WIND"
            ]
            all_wind.extend(wind_items)
            print(f"    Got {len(wind_items)} wind records (total: {len(all_wind)})")
        except Exception as e:
            print(f"    Error: {e}")
        cur = next_chunk

    # Deduplicate by startTime
    dedup = {}
    for item in all_wind:
        dedup[item["startTime"]] = item
    final_actuals = sorted(dedup.values(), key=lambda x: x["startTime"])
    
    with open(ACTUALS_FILE, 'w', encoding='utf-8') as f:
        json.dump(final_actuals, f, indent=2)
    print(f"Saved {len(final_actuals)} unique actual wind records to {ACTUALS_FILE}")
    return final_actuals

def fetch_forecasts():
    print("Fetching WINDFOR (Wind forecasts) for January 2026...")
    all_forecasts = []
    # Forecasts published between 2025-12-30 and 2026-02-01
    start_date = datetime(2025, 12, 30, 0, 0)
    end_date = datetime(2026, 2, 1, 23, 59)
    cur = start_date

    while cur < end_date:
        next_chunk = min(cur + timedelta(days=4), end_date)
        s_str = cur.strftime('%Y-%m-%dT%H:%M:%SZ')
        e_str = next_chunk.strftime('%Y-%m-%dT%H:%M:%SZ')
        url = f"https://data.elexon.co.uk/bmrs/api/v1/datasets/WINDFOR/stream?publishDateTimeFrom={s_str}&publishDateTimeTo={e_str}"
        print(f"  Fetching WINDFOR: {s_str} -> {e_str}")
        try:
            items = fetch_json(url)
            records = [
                {
                    "startTime": item["startTime"],
                    "publishTime": item["publishTime"],
                    "generation": item.get("generation", 0)
                }
                for item in items if "startTime" in item and "publishTime" in item
            ]
            all_forecasts.extend(records)
            print(f"    Got {len(records)} forecasts (total: {len(all_forecasts)})")
        except Exception as e:
            print(f"    Error: {e}")
        cur = next_chunk

    # Deduplicate by (startTime, publishTime)
    dedup = {}
    for item in all_forecasts:
        dedup[(item["startTime"], item["publishTime"])] = item
    final_forecasts = sorted(dedup.values(), key=lambda x: (x["startTime"], x["publishTime"]))

    with open(FORECASTS_FILE, 'w', encoding='utf-8') as f:
        json.dump(final_forecasts, f)
    print(f"Saved {len(final_forecasts)} unique forecast records to {FORECASTS_FILE}")
    return final_forecasts

if __name__ == '__main__':
    fetch_actuals()
    fetch_forecasts()
