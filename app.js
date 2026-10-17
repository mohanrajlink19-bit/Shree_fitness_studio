'use strict';
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#navigation');
function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  navigation.classList.remove('is-open');
}
menuButton.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  navigation.classList.toggle('is-open', open);
});
navigation.addEventListener('click', event => {
  if (event.target.closest('a')) closeMenu();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
    closeMenu();
    menuButton.focus();
  }
});
document.querySelector('#year').textContent = new Date().getFullYear();
document.querySelectorAll('[data-goal]').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelector('#goal').value = link.dataset.goal;
  });
});
const pageOpened = Date.now();
function normalizePhone(value) {
  const digits = value.trim().replace(/[\s()-]/g, '');
  if (/^[6-9]\d{9}$/.test(digits)) return `+91${digits}`;
  if (/^\+91[6-9]\d{9}$/.test(digits)) return digits;
  if (/^91[6-9]\d{9}$/.test(digits)) return `+${digits}`;
  if (/^\+(?!91)[1-9]\d{7,14}$/.test(digits)) return digits;
  return '';
}
// Sends the request to the studio's WhatsApp through the site's /api/booking function.
async function sendRequest(payload) {
  try {
    const response = await fetch('/api/booking', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    return response.ok && (await response.json()).ok === true;
  } catch {
    return false;
  }
}
document.querySelector('#enquiry-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.target;
  const nameInput = document.querySelector('#name');
  const phoneInput = document.querySelector('#enquiry-phone');
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.setCustomValidity('Please enter your name.');
    nameInput.reportValidity();
    return;
  }
  const phone = normalizePhone(phoneInput.value);
  if (!phone) {
    phoneInput.setCustomValidity('Enter a 10-digit Indian mobile number, or an international number beginning with + and its country code.');
    phoneInput.reportValidity();
    return;
  }
  const displayPhone = phone.startsWith('+91') ? `+91 ${phone.slice(3)}` : phone;
  const goal = document.querySelector('#goal').value;
  const note = document.querySelector('#message').value.trim();
  const status = document.querySelector('#form-status');
  const button = form.querySelector('button[type="submit"]');
  button.disabled = true;
  status.textContent = 'Sending your enquiry…';
  const sent = await sendRequest({ type: 'enquiry', name, phone, goal, message: note, company: form.elements.company.value, elapsed: Date.now() - pageOpened });
  button.disabled = false;
  if (sent) {
    status.textContent = `Thanks, ${name}! Your enquiry has reached the Shree Fitness team. They will contact you on ${displayPhone}.`;
    form.reset();
    return;
  }
  const message = `Hi Shree Fitness! I’m ${name} (${displayPhone}). I’d like to enquire about ${goal.toLowerCase()}.${note ? `\n\n${note}` : ''}\n\nPlease share the current timings and details. Thank you!`;
  const fallback = document.createElement('a');
  fallback.href = `https://wa.me/919566099329?text=${encodeURIComponent(message)}`;
  fallback.target = '_blank';
  fallback.rel = 'noopener noreferrer';
  fallback.textContent = 'Send it on WhatsApp instead ↗';
  fallback.style.textDecoration = 'underline';
  status.replaceChildren('We couldn’t send your enquiry automatically. ', fallback);
});
document.querySelector('#name').addEventListener('input', event => event.target.setCustomValidity(''));
document.querySelector('#enquiry-phone').addEventListener('input', event => event.target.setCustomValidity(''));
const photoDialog = document.querySelector('#photo-dialog');
document.querySelectorAll('[data-image]').forEach(button => {
  button.addEventListener('click', () => {
    const image = document.querySelector('#dialog-image');
    image.src = button.dataset.image;
    image.alt = button.querySelector('img').alt;
    document.querySelector('#dialog-caption').textContent = button.dataset.caption;
    photoDialog.showModal();
    document.body.classList.add('dialog-open');
  });
});
document.querySelector('.dialog-close').addEventListener('click', () => photoDialog.close());
photoDialog.addEventListener('click', event => {
  const box = photoDialog.getBoundingClientRect();
  if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) photoDialog.close();
});
photoDialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));
document.querySelector('#copy-address').addEventListener('click', async () => {
  const address = 'Shree Fitness Unisex Studio AC, No.3, Sakthi Nagar 4th Street, opposite Saravana Stores, Somasundaram Avenue, Porur, Chennai, Tamil Nadu 600116. Upstairs at the BSNL Telephone Exchange.';
  const status = document.querySelector('#address-status');
  try {
    await navigator.clipboard.writeText(address);
    status.textContent = 'Studio address copied.';
  } catch {
    status.textContent = `You can select and copy this address: ${address}`;
  }
});

// Three identical image runs keep a neighbouring slide on both sides of every wrap.
document.querySelectorAll('[data-carousel]').forEach(carousel => {
  const track = carousel.querySelector('.carousel-track');
  const slides = [...track.children];
  const pause = carousel.querySelector('[data-pause]');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let paused = motion.matches, visible = false, position = 0, cycle = 0, step = 0;
  let previous = 0, resumeAt = 0, dragging = false;
  function cloneRun() {
    // Clones are built in a template's inert document so their images stay lazy until placed.
    const fragment = document.createElement('template').content;
    slides.forEach(slide => {
      const clone = fragment.ownerDocument.importNode(slide, true);
      clone.dataset.clone = 'true';
      clone.setAttribute('aria-hidden', 'true');
      [clone, ...clone.querySelectorAll('button')].forEach(el => { if (el.matches('button')) el.tabIndex = -1; });
      clone.addEventListener('click', () => (slide.matches('button') ? slide : slide.querySelector('button')).click());
      fragment.append(clone);
    });
    return fragment;
  }
  track.prepend(cloneRun());
  track.append(cloneRun());
  // Eager-load every run only as the carousel nears the viewport, not on page load.
  new IntersectionObserver((entries, observer) => {
    if (!entries[0].isIntersecting) return;
    track.querySelectorAll('img').forEach(img => { img.loading = 'eager'; });
    observer.disconnect();
  }, {rootMargin: '600px 0px'}).observe(carousel);
  function measure() {
    const oldStep = step;
    const offset = oldStep ? (position - cycle) / oldStep : 0;
    step = slides[1].offsetLeft - slides[0].offsetLeft;
    cycle = step * slides.length;
    position = cycle + offset * step;
    track.scrollLeft = position;
  }
  function update() {
    const index = ((Math.round((track.scrollLeft - cycle) / step) % slides.length) + slides.length) % slides.length;
    carousel.querySelector('.carousel-count').textContent = `${String(index + 1).padStart(2, '0')} / ${slides.length}`;
    pause.textContent = paused ? 'Play slideshow' : 'Pause slideshow';
  }
  function normalize() {
    if (!cycle) return;
    while (position < cycle) position += cycle;
    while (position >= cycle * 2) position -= cycle;
  }
  function move(direction) {
    resumeAt = performance.now() + 3000;
    const target = Math.round(track.scrollLeft / step) * step + direction * step;
    track.scrollTo({left: target, behavior: motion.matches ? 'instant' : 'smooth'});
  }
  carousel.querySelector('[data-prev]').addEventListener('click', () => move(-1));
  carousel.querySelector('[data-next]').addEventListener('click', () => move(1));
  pause.addEventListener('click', () => { paused = !paused; position = track.scrollLeft; update(); });
  track.addEventListener('pointerdown', () => { dragging = true; });
  window.addEventListener('pointerup', () => { if (dragging) { dragging = false; resumeAt = performance.now() + 2000; } });
  track.addEventListener('pointercancel', () => { dragging = false; resumeAt = performance.now() + 2000; });
  track.addEventListener('wheel', () => { resumeAt = performance.now() + 2000; }, {passive: true});
  track.addEventListener('scroll', update, {passive: true});
  motion.addEventListener('change', () => { paused = motion.matches; update(); });
  new ResizeObserver(measure).observe(track);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; }, {threshold: .1}).observe(carousel);
  function frame(time) {
    const delta = Math.min(time - previous, 40);
    previous = time;
    if (visible && !paused && !dragging && !document.hidden && !photoDialog.open && time > resumeAt && cycle) {
      position += 38 * delta / 1000;
      normalize();
      track.scrollLeft = position;
    } else {
      position = track.scrollLeft;
    }
    requestAnimationFrame(frame);
  }
  measure(); update(); requestAnimationFrame(frame);
});
