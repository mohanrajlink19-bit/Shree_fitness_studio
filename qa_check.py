"""Local browser smoke checks; requires an existing Playwright installation."""
import json
from pathlib import Path
from urllib.parse import unquote
from playwright.sync_api import sync_playwright

root = Path(__file__).resolve().parent
out = root / 'qa'
out.mkdir(exist_ok=True)
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=r'C:\Program Files\Google\Chrome\Application\chrome.exe', headless=True, timeout=15000)
    page = browser.new_page(viewport={'width': 1440, 'height': 1000}, device_scale_factor=1)
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto((root / 'index.html').as_uri())
    page.screenshot(path=str(out / 'desktop.png'), full_page=True)
    assert page.locator('h1').count() == 1
    assert page.locator('img').evaluate_all('(imgs) => imgs.filter(i => i.getAttribute("src")).every(i => i.complete && i.naturalWidth > 0)')
    missing_anchors = page.locator('a[href^="#"]').evaluate_all('(links) => links.map(a => a.getAttribute("href")).filter(h => h.length > 1 && !document.querySelector(h))')
    assert not missing_anchors, missing_anchors
    page.locator('[data-image]').first.click()
    assert page.locator('dialog').evaluate('(d) => d.open')
    page.keyboard.press('Escape')
    assert not page.locator('dialog').evaluate('(d) => d.open')
    page.locator('[data-goal="Personal training"]').click()
    assert page.locator('#goal').input_value() == 'Personal training'
    page.locator('#name').fill('Alex Test')
    page.locator('#message').fill('Can I visit this weekend?')
    page.evaluate('window.open = (url) => { window.testDraft = url; return null; }')
    page.locator('button[type="submit"]').click()
    draft = unquote(page.evaluate('window.testDraft'))
    assert '918778642342' in draft and 'Alex Test' in draft and 'this weekend?' in draft
    assert 'personal training' in draft
    page.locator('details').first.locator('summary').click()
    assert page.locator('details').first.evaluate('(d) => d.open')
    widths = [320, 375, 390, 768, 1024, 1440]
    for width in widths:
        page.set_viewport_size({'width': width, 'height': 900})
        page.goto((root / 'index.html').as_uri())
        assert page.evaluate('document.documentElement.scrollWidth <= window.innerWidth'), f'Overflow at {width}'
        if width == 390:
            page.locator('.menu-toggle').click()
            assert page.locator('.menu-toggle').get_attribute('aria-expanded') == 'true'
            page.locator('#navigation a[href="#studio"]').click()
            assert page.locator('.menu-toggle').get_attribute('aria-expanded') == 'false'
            page.evaluate('window.scrollTo(0,0)')
            page.screenshot(path=str(out / 'mobile.png'), full_page=True)
    assert not errors, errors
    browser.close()
print(json.dumps({'status': 'passed', 'widths': widths, 'checks': ['images', 'anchors', 'gallery', 'menu', 'WhatsApp draft', 'FAQ', 'horizontal overflow', 'JavaScript errors']}))
