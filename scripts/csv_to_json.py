#!/usr/bin/env python3
"""CSV to JSON helper (handles simple CSVs). Usage: python csv_to_json.py input.csv output.json"""
import sys, json
if len(sys.argv) < 3:
    print('Usage: python csv_to_json.py input.csv output.json')
    sys.exit(1)
import csv
with open(sys.argv[1], newline='', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    rows = list(reader)
with open(sys.argv[2], 'w', encoding='utf-8') as f:
    json.dump(rows, f, indent=2)
print(f'Wrote {len(rows)} rows to {sys.argv[2]}')