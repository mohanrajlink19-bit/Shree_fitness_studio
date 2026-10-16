"""Assemble only public website files for static hosting; no dependencies."""
from pathlib import Path
import shutil
import zipfile

root = Path(__file__).resolve().parent
output = root / 'dist'
output.mkdir(exist_ok=True)
public_files = ['index.html', 'booking.html', '404.html', 'styles.css', 'enhancements.css', 'app.js', 'booking.js', '_headers', 'robots.txt', '.nojekyll']
for name in public_files:
    shutil.copy2(root / name, output / name)
(output / 'assets').mkdir(exist_ok=True)
assets = sorted((root / 'assets').glob('*'))
for asset in assets:
    if asset.is_file():
        shutil.copy2(asset, output / 'assets' / asset.name)
archive = root.parent / 'shreefitnees-deploy.zip'
with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as bundle:
    for name in public_files:
        bundle.write(output / name, name)
    for asset in assets:
        if asset.is_file():
            bundle.write(output / 'assets' / asset.name, 'assets/' + asset.name)
print(f'Public website: {output}')
print(f'Cloudflare Pages upload: {archive} ({archive.stat().st_size:,} bytes)')
