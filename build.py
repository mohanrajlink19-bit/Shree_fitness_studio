"""Assemble only public website files for static hosting; no dependencies."""
from pathlib import Path
import json
import os
import re
import shutil
import zipfile

root = Path(__file__).resolve().parent
output = root / 'dist'
shutil.rmtree(output, ignore_errors=True)
output.mkdir(exist_ok=True)
pages = ['index.html', 'booking.html', 'personal-training.html', 'online-training.html', '404.html']
public_files = pages + ['styles.css', 'enhancements.css', 'app.js', 'booking.js', '_headers', 'robots.txt', 'sitemap.xml', '.nojekyll', '5d415d3ff958007e70461042801040b7.txt', 'googled4059e86940ab7b5.html']
# The .txt file is the IndexNow key and the googled*.html file is Google Search Console's ownership file; both must stay published.
manifest_path = root / 'assets' / 'opt' / 'manifest.json'
manifest = json.loads(manifest_path.read_text(encoding='utf-8')) if manifest_path.exists() else {}
# Phones get ~2x-density images: sharp on 3x screens at about half the bytes.
DEFAULT_SIZES = '(max-width: 760px) 66vw, 50vw'


def clean_links(html):
    """Link straight to the extensionless URLs the host serves, avoiding a redirect per internal link."""
    return re.sub(r'href="([a-z-]+)\.html', lambda m: 'href="' + ('./' if m.group(1) == 'index' else m.group(1)), html)


def responsive_images(html):
    """Serve the WebP copies from optimize-images.py: srcset for <img>, the largest copy for the photo viewer."""
    def img(match):
        tag = match.group(0)
        photo = manifest.get(re.search(r'src="([^"]+)"', tag).group(1))
        if not photo:
            return tag
        variants = photo['variants']
        default = max((v for v in variants if v['width'] <= 1080), key=lambda v: v['width'])
        srcset = ', '.join(f"{v['file']} {v['width']}w" for v in variants)
        tag = re.sub(r'src="[^"]+"', f'src="{default["file"]}" srcset="{srcset}"', tag, count=1)
        if 'sizes=' not in tag:
            tag = tag.replace(' srcset=', f' sizes="{DEFAULT_SIZES}" srcset=', 1)
        tag = re.sub(r'width="\d+"', f'width="{photo["width"]}"', tag)
        return re.sub(r'height="\d+"', f'height="{photo["height"]}"', tag)

    html = re.sub(r'<img [^>]*src="assets/[a-z0-9-]+\.jpeg"[^>]*>', img, html)
    return re.sub(r'data-image="(assets/[a-z0-9-]+\.jpeg)"',
                  lambda m: f'data-image="{manifest[m.group(1)]["variants"][-1]["file"]}"' if m.group(1) in manifest else m.group(0), html)


for name in public_files:
    if name in pages:
        html = (root / name).read_text(encoding='utf-8')
        (output / name).write_text(responsive_images(clean_links(html)), encoding='utf-8')
    else:
        shutil.copy2(root / name, output / name)
shutil.copytree(root / 'assets', output / 'assets', dirs_exist_ok=True)
assets = sorted(path for path in (output / 'assets').rglob('*') if path.is_file())
print(f'Public website: {output} ({len(manifest)} photos served as responsive WebP)')
# Cloudflare Pages sets CF_PAGES=1 during Git builds; the ZIP is only for manual uploads from this machine.
if os.environ.get('CF_PAGES') != '1':
    archive = root.parent / 'shreefitnees-deploy.zip'
    with zipfile.ZipFile(archive, 'w', zipfile.ZIP_DEFLATED) as bundle:
        for name in public_files:
            bundle.write(output / name, name)
        for asset in assets:
            bundle.write(asset, asset.relative_to(output).as_posix())
    print(f'Static-only ZIP (no booking sender): {archive} ({archive.stat().st_size:,} bytes)')
