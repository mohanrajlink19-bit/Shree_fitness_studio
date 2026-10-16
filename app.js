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
document.querySelector('#enquiry-form').addEventListener('submit', event => {
  event.preventDefault();
  const nameInput = document.querySelector('#name');
  const name = nameInput.value.trim();
  if (!name) {
    nameInput.setCustomValidity('Please enter your name.');
    nameInput.reportValidity();
    return;
  }
  const goal = document.querySelector('#goal').value;
  const note = document.querySelector('#message').value.trim();
  const message = `Hi Shree Fitness! I’m ${name}. I’d like to enquire about ${goal.toLowerCase()}.${note ? `\n\n${note}` : ''}\n\nPlease share the current timings and details. Thank you!`;
  const url = `https://wa.me/918778642342?text=${encodeURIComponent(message)}`;
  const status = document.querySelector('#form-status');
  status.replaceChildren();
  const fallback = document.createElement('a');
  fallback.href = url;
  fallback.target = '_blank';
  fallback.rel = 'noopener noreferrer';
  fallback.textContent = 'Open your WhatsApp draft ↗';
  fallback.style.textDecoration = 'underline';
  status.append('If WhatsApp did not open, ', fallback);
  window.open(url, '_blank', 'noopener,noreferrer');
});
document.querySelector('#name').addEventListener('input', event => event.target.setCustomValidity(''));
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
