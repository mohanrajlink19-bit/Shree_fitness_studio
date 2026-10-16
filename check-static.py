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
for name in ['index.html', 'booking.html', '404.html']:
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
schema = json.loads(re.search(r'<script type="application/ld\+json">(.*?)</script>', (root / 'index.html').read_text(encoding='utf-8')).group(1))
assert schema['telephone'] == '+919710999898'
assert schema['address']['postalCode'] == '600116'
assert len(schema['openingHoursSpecification']) == 2
print('Structured business data passed')
