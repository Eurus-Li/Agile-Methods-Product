"""Rebuild the demo's templates from the five untouched Pencil exports.

Only needed after replacing the exports: python3 -m pip install -r requirements-dev.txt
then python3 scripts/build_demo.py. The generated demo needs no dependencies.
"""
from pathlib import Path
import base64
import hashlib
import re
from bs4 import BeautifulSoup

ROOT = Path(__file__).resolve().parent.parent
EXPORTS = ROOT / 'design' / 'exports'
ASSETS = ROOT / 'assets' / 'images'
ASSETS.mkdir(parents=True, exist_ok=True)

def extract_image(match):
    ext, encoded = match.groups()
    data = base64.b64decode(encoded)
    name = hashlib.sha256(data).hexdigest()[:16] + '.' + ext.replace('jpeg', 'jpg')
    # The exported Pip thumbnail is only 74 × 92; use the supplied original.
    if name == '119bbe39cb82fe1d.png':
        return 'assets/images/pip.jpg'
    (ASSETS / name).write_bytes(data)
    return 'assets/images/' + name

templates = []
for number, route in enumerate(['home', 'reply', 'journal', 'me', 'plus'], 1):
    source = next(EXPORTS.glob(f'{number:02} *-export.html'))
    soup = BeautifulSoup(source.read_text(encoding='utf-8'), 'html.parser')
    frame = soup.find(attrs={'data-pencil-name': re.compile(f'^{number:02} ')})
    frame['class'] = ['screen', f'screen-{route}']
    frame['style'] = re.sub(r'(?:^|;)\s*(?:left|top|position|width|height):[^;]+', '', frame['style']).lstrip('; ')
    html = re.sub(r'data:image/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)', extract_image, str(frame))
    templates.append(f'<template id="page-{route}">{html}</template>')

document = '''<!doctype html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#FBF3EC">
<title>Pip · Your little companion</title>
<link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="src/styles/app.css">
<script src="src/js/app.js" defer></script>
</head><body>
<main id="app" aria-label="Pip companion"></main>
<div id="toast" role="status" aria-live="polite"></div>
<dialog id="dialog" aria-labelledby="dialog-title"></dialog>
<noscript>Please enable JavaScript to use the Pip demo.</noscript>
''' + '\n'.join(templates) + '\n</body></html>\n'
(ROOT / 'index.html').write_text(document, encoding='utf-8')
print(f'Built index.html ({len(document):,} characters) and local image assets.')
