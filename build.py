"""Build one standalone HTML file with no network dependencies."""
from pathlib import Path
root = Path(__file__).resolve().parent
css = (root / 'src' / 'style.css').read_text() + '\n' + (root / 'src' / 'readability.css').read_text()
scripts = '\n'.join((root / 'src' / name).read_text() for name in ['domain.js','visuals.js','checks.js','app.js'])
if '</script' in scripts.lower():
    raise SystemExit('Unexpected script closing tag in source')
html = '''<!doctype html>
<html lang="sr-Latn-RS"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<meta name="color-scheme" content="light"><meta name="robots" content="noindex,nofollow">
<meta name="description" content="eBex testni prototip. Marketplace, BEX dostava i plaćanje pouzećem, sa simuliranim podacima.">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data: blob:; connect-src 'none'; font-src 'none'; base-uri 'none'; form-action 'none'; object-src 'none'">
<title>eBex · Nova prilika za dobre stvari</title>
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Crect width='40' height='40' rx='10' fill='%23df654e'/%3E%3Cpath d='M9 9h14l9 11-9 11H9l10-11Z' fill='white'/%3E%3C/svg%3E">
<style>''' + css + '''</style></head>
<body><a class="skip-link" href="#main-content">Preskoči na sadržaj</a><div id="shell"></div><div id="modals"></div><div id="toasts" class="toast-region" role="status" aria-live="polite"></div>
<noscript>Za testiranje eBex prototipa uključi JavaScript u pregledaču.</noscript>
<script>''' + scripts + '''</script></body></html>'''
(root / 'index.html').write_text(html)
(root.parent / 'eBex_Prototip.html').write_text(html)
print('Built eBex_Prototip.html: %s bytes, no external dependencies.' % len(html.encode()))
