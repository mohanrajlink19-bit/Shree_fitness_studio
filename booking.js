'use strict';
const form = document.querySelector('#booking-form');
const review = document.querySelector('#booking-review');
const dateInput = document.querySelector('#visit-date');
const timeInput = document.querySelector('#visit-time');
const nameInput = document.querySelector('#booking-name');
const phoneInput = document.querySelector('#booking-phone');
function indiaNow() {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return { date: `${values.year}-${values.month}-${values.day}`, time: `${values.hour}:${values.minute}` };
}
function refreshDateBounds() {
  const now = indiaNow();
  dateInput.min = now.date;
  const maxDate = new Date(`${now.date}T12:00:00Z`);
  maxDate.setUTCDate(maxDate.getUTCDate() + 90);
  dateInput.max = maxDate.toISOString().slice(0, 10);
}
refreshDateBounds();
dateInput.addEventListener('focus', refreshDateBounds);
dateInput.addEventListener('input', () => timeInput.setCustomValidity(''));
[dateInput, timeInput, nameInput, phoneInput].forEach(input => input.addEventListener('input', () => {
  input.setCustomValidity('');
  document.querySelector('#booking-error').textContent = '';
}));
function invalid(input, message) {
  input.setCustomValidity(message);
  input.reportValidity();
  document.querySelector('#booking-error').textContent = message;
}
form.addEventListener('submit', event => {
  event.preventDefault();
  [dateInput, timeInput, nameInput, phoneInput].forEach(input => input.setCustomValidity(''));
  refreshDateBounds();
  const name = nameInput.value.trim();
  if (!name) return invalid(nameInput, 'Please enter your name.');
  const digits = phoneInput.value.replace(/\D/g, '');
  const phone = digits.length === 12 && digits.startsWith('91') ? digits.slice(2) : digits;
  if (!/^[6-9]\d{9}$/.test(phone)) return invalid(phoneInput, 'Enter a valid 10-digit Indian mobile number, with or without +91.');
  if (!form.reportValidity()) return;
  const now = indiaNow();
  if (dateInput.value < now.date || dateInput.value > dateInput.max) return invalid(dateInput, 'Choose a date from today through the next 90 days.');
  if (dateInput.value === now.date && timeInput.value <= now.time) return invalid(timeInput, 'Choose a future time in Chennai local time (IST).');
  const service = new FormData(form).get('service');
  const date = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${dateInput.value}T12:00:00+05:30`));
  const [hours, minutes] = timeInput.value.split(':').map(Number);
  const time = `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'} IST`;
  const notes = document.querySelector('#booking-notes').value.trim();
  const values = { service, date, time, name, phone: `+91 ${phone}`, notes };
  for (const [key, value] of Object.entries(values)) document.querySelector(`#review-${key}`).textContent = value;
  document.querySelector('#review-notes-row').hidden = !notes;
  const message = `Hi Shree Fitness! I’d like to request a visit.\n\nVisit: ${service}\nPreferred date: ${date}\nPreferred time: ${time}\nName: ${name}\nMobile: +91 ${phone}${notes ? `\nNotes: ${notes}` : ''}\n\nPlease confirm availability and any applicable fees. I understand this is a request, not a confirmed booking.`;
  document.querySelector('#send-booking').href = `https://wa.me/918778642342?text=${encodeURIComponent(message)}`;
  form.hidden = true;
  review.hidden = false;
  review.focus();
  review.scrollIntoView({ block: 'start', behavior: 'instant' });
});
document.querySelector('#edit-booking').addEventListener('click', () => {
  review.hidden = true;
  form.hidden = false;
  nameInput.focus();
});
