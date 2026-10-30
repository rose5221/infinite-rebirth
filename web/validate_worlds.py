#!/usr/bin/env python3
"""Validate the compressed 66-world bible before shipping the web build."""
import json, re, sys
from pathlib import Path

DIMS = ['political','demographics','economy','tech','arts','stratification','dailyLife','family','beliefs','intellectual','psychology','order','information','risks','aesthetics','ecology']
REQUIRED = ['name','category','currency','theme','era','worldAxis',*DIMS,'factions','timeline','locations','identity','goods','time','space','visual']

def main():
    text = Path('worlds.js').read_text(encoding='utf-8')
    data = json.loads(text.split('=', 1)[1].rstrip(';\n '))
    errors = []
    if len(data) != 66: errors.append(f'world count {len(data)} != 66')
    if len({w.get('name') for w in data}) != 66: errors.append('duplicate world names')
    if len({w.get('currency') for w in data}) != 66: errors.append('currencies are not unique')
    for w in data:
        name = w.get('name', '?')
        for key in REQUIRED:
            if not w.get(key): errors.append(f'{name}: missing {key}')
        for key in DIMS:
            if len(str(w.get(key, ''))) < 8: errors.append(f'{name}: {key} too short')
        if len(w.get('factions', [])) != 3: errors.append(f'{name}: factions != 3')
        if len(w.get('timeline', [])) != 4: errors.append(f'{name}: timeline != 4')
        if len(w.get('locations', [])) != 4: errors.append(f'{name}: locations != 4')
        for loc in w.get('locations', []):
            if not loc.get('name') or not loc.get('role'): errors.append(f'{name}: incomplete location')
    print(f'checked {len(data)} worlds, {len({w["currency"] for w in data})} currencies, {len(DIMS)} dimensions')
    if errors:
        print('\n'.join(errors[:30]))
        sys.exit(1)
    print('WORLD_BIBLE_VALID')

if __name__ == '__main__':
    main()
