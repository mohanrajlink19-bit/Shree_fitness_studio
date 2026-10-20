"""Create responsive WebP copies of the site photos in assets/opt/ (run locally after adding or changing photos).

Requires Pillow (`pip install pillow`). The generated files and manifest are committed, so Cloudflare's build
needs no image tools: build.py reads assets/opt/manifest.json and points each <img> at the WebP versions.
"""
from pathlib import Path
import json
import re
import shutil
from PIL import Image, ImageOps

root = Path(__file__).resolve().parent
source_dir = root / 'assets'
output_dir = source_dir / 'opt'
shutil.rmtree(output_dir, ignore_errors=True)
output_dir.mkdir()
WIDTHS = [480, 720, 1080, 1440]
QUALITY = 68

# Only photos the pages actually show.
pages = ['index.html', 'gym-in-porur.html', 'booking.html', 'personal-training.html', 'online-training.html']
used = sorted({m for page in pages for m in re.findall(r'assets/([\w-]+\.jpeg)', (root / page).read_text(encoding='utf-8'))})

manifest = {}
for source in (source_dir / name for name in used):
    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image).convert('RGB')
        width, height = image.size
        variants = []
        for target in WIDTHS:
            target = min(target, width)
            if variants and target <= variants[-1]['width']:
                break
            size = (target, round(height * target / width))
            name = f'{source.stem}-{size[0]}.webp'
            image.resize(size, Image.LANCZOS).save(output_dir / name, 'WEBP', quality=QUALITY, method=6)
            variants.append({'file': f'assets/opt/{name}', 'width': size[0]})
        manifest[f'assets/{source.name}'] = {'width': width, 'height': height, 'variants': variants}

(output_dir / 'manifest.json').write_text(json.dumps(manifest, indent=1), encoding='utf-8')
before = sum((source_dir / name).stat().st_size for name in used)
after = sum(p.stat().st_size for p in output_dir.glob('*.webp'))
print(f'{len(manifest)} photos -> {sum(len(m["variants"]) for m in manifest.values())} WebP files ({after / 1e6:.1f} MB; originals {before / 1e6:.1f} MB)')
