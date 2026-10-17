#!/usr/bin/env python3
"""Audit V4 owner/source documentary retakes against actual rendered pixels."""
import importlib.util
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
spec=importlib.util.spec_from_file_location("rx_source_audit_v3",ROOT/"scripts/audit-owner-study-films-v3.py")
audit=importlib.util.module_from_spec(spec)
spec.loader.exec_module(audit)
audit.MOVIES=ROOT/"assets/films/series-v4"
audit.main()
