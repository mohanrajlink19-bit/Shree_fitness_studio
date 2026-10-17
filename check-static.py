"""Validate public HTML, internal links, assets and structured metadata."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json

root = Path(__file__).resolve().parent
void = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}

class Page(HTMLParser):
    def __init__(self, name):
        super().__init__()
        self.name, self.ids, self.links, self.stack, self.errors = name, [], [], [], []
        self.h1 = 0
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag not in void:
            self.stack.append(tag)
        if tag == 'h1':
            self.h1 += 1
        if 'id' in attrs:
            self.ids.append(attrs['id'])
        if tag == 'img':
            assert 'alt' in attrs, f'{self.name}: missing alt text'
        if tag == 'iframe':
            assert attrs.get('title'), f'{self.name}: missing iframe title'
        if tag == 'a' and attrs.get('target') == '_blank':
            assert 'noopener' in attrs.get('rel', ''), f'{self.name}: unsafe external target'
        for key in ['src', 'href', 'data-image']:
            if attrs.get(key):
                self.links.append(attrs[key])
    def handle_endtag(self, tag):
        if tag in void:
            return
        if not self.stack or self.stack[-1] != tag:
            self.errors.append(f'unbalanced closing {tag}')
        else:
            self.stack.pop()

pages = {}
for name in ['index.html', 'booking.html', 'personal-training.html', 'online-training.html', '404.html']:
    text = (root / name).read_text(encoding='utf-8')
    assert '\ufffd' not in text, f'{name}: broken Unicode'
    page = Page(name)
    page.feed(text)
    assert not page.errors and not page.stack, (name, page.errors, page.stack)
    assert page.h1 == 1, f'{name}: must have one main heading'
    assert len(page.ids) == len(set(page.ids)), f'{name}: duplicate IDs'
    pages[name] = page
for name, page in pages.items():
    for link in page.links:
        parsed = urlsplit(link)
        if parsed.scheme or parsed.netloc:
            continue
        target = unquote(parsed.path) or name
        if target == './':
            target = 'index.html'
        assert (root / target).is_file(), f'{name}: missing {target}'
        if parsed.fragment and target in pages:
            assert parsed.fragment in pages[target].ids, f'{name}: missing anchor {link}'
    print(f'{name}: HTML nesting, heading, links, anchors, image alt text and local assets passed')
import re
SITE = 'https://shreefitnessstudio.pages.dev'
canonicals = {'index.html': f'{SITE}/', 'booking.html': f'{SITE}/booking', 'personal-training.html': f'{SITE}/personal-training', 'online-training.html': f'{SITE}/online-training'}
sitemap = (root / 'sitemap.xml').read_text(encoding='utf-8')
assert f'Sitemap: {SITE}/sitemap.xml' in (root / 'robots.txt').read_text(encoding='utf-8'), 'robots.txt: missing sitemap'
for name, url in canonicals.items():
    text = (root / name).read_text(encoding='utf-8')
    assert f'<link rel="canonical" href="{url}">' in text, f'{name}: canonical'
    assert f'<loc>{url}</loc>' in sitemap, f'sitemap.xml: missing {url}'
    title = re.search(r'<title>(.*?)</title>', text).group(1)
    description = re.search(r'<meta name="description" content="(.*?)">', text).group(1)
    assert len(title) <= 60 and 70 <= len(description) <= 160, f'{name}: title {len(title)} / description {len(description)} characters'
    for block in re.findall(r'<script type="application/ld\+json">(.*?)</script>', text, re.S):
        json.loads(block)
graph = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', (root / 'index.html').read_text(encoding='utf-8'), re.S).group(1))['@graph']
gym = next(node for node in graph if node['@type'] == 'ExerciseGym')
assert gym['telephone'] == '+919566099329'
assert gym['address']['postalCode'] == '600116'
assert len(gym['openingHoursSpecification']) == 2
faq = next(node for node in graph if node['@type'] == 'FAQPage')
index_text = (root / 'index.html').read_text(encoding='utf-8')
for question in faq['mainEntity']:
    assert f'<summary>{question["name"]}<' in index_text, f'FAQ data not visible: {question["name"]}'
print('Canonicals, sitemap, titles, descriptions and structured business data passed')
