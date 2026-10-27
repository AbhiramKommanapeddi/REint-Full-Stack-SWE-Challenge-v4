"""
Elexon BMRS Live Client Service
Fetches live stream updates from data.elexon.co.uk API
"""
import urllib.request
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, List

logger = logging.getLogger(__name__)

class ElexonClient:
    def __init__(self):
        self.base_url = "https://data.elexon.co.uk/bmrs/api/v1"

    def fetch_stream(self, dataset: str, start_iso: str, end_iso: str, timeout: int = 15) -> List[Dict[str, Any]]:
        url = f"{self.base_url}/datasets/{dataset}/stream?publishDateTimeFrom={start_iso}&publishDateTimeTo={end_iso}"
        req = urllib.request.Request(
            url,
            headers={
                "User-Agent": "UK-Energy-Procurement-App/1.0",
                "Accept": "application/json"
            }
        )
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            return json.loads(resp.read().decode("utf-8"))

    def check_connection(self) -> Dict[str, Any]:
        """Checks connectivity to Elexon BMRS API."""
        now = datetime.utcnow()
        start = (now - timedelta(hours=2)).strftime("%Y-%m-%dT%H:%M:%SZ")
        end = now.strftime("%Y-%m-%dT%H:%M:%SZ")
        try:
            items = self.fetch_stream("FUELHH", start, end, timeout=5)
            return {
                "status": "connected",
                "elexonApi": "https://data.elexon.co.uk/bmrs/api/v1",
                "sampleRecordsReturned": len(items),
                "timestamp": now.isoformat() + "Z"
            }
        except Exception as e:
            return {
                "status": "degraded_or_offline",
                "error": str(e),
                "timestamp": now.isoformat() + "Z"
            }

elexon_client = ElexonClient()
