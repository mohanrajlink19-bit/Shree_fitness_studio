"""Assemble only public website files for static hosting; no dependencies."""
from pathlib import Path
import os
import re
import shutil
import zipfile

root = Path(__file__).resolve().parent
output = root / 'dist'
output.mkdir(exist_ok=True)
pages = ['index.html', 'booking.html', 'personal-training.html', 'online-training.html', '404.html']
public_files = pages + ['styles.css', 'enhancements.css', 'app.js', 'booking.js', '_headers', 'robots.txt', 'sitemap.xml', '.nojekyll']


def clean_links(html):
    """Link straight to the extensionless URLs the host serves, avoiding a redirect per internal link."""
    return re.sub(r'href="([a-z-]+)\.html', lambda m: 'href="' + ('./' if m.group(1) == 'index' else m.group(1)), html)


for name in public_files:
    if name in pages:
        (output / name).write_text(clean_links((root / name).read_text(encoding='utf-8')), encoding='utf-8')
    else:
        shutil.copy2(root / name, output / name)
(output / 'assets').mkdir(exist_ok=True)
assets = sorted((root / 'assets').glob('*'))
for asset in assets:
    if asset.is_file():
        shutil.copy2(asset, output / 'assets' / asset.name)
print(f'Public website: {output}')
# Cloudflare Pages sets CF_PAGES=1 during Git builds; the ZIP is only for manual uploads from this machine.
if os.environ.get('CF_PAGES') != '1':
    archive = root.parent / 'shreefitnees-deploy.zip'
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as bundle:
        for name in public_files:
            bundle.write(output / name, name)
        for asset in assets:
            if asset.is_file():
                bundle.write(output / 'assets' / asset.name, 'assets/' + asset.name)
    print(f'Static-only ZIP (no booking sender): {archive} ({archive.stat().st_size:,} bytes)')
