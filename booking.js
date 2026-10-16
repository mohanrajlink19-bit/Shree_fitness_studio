'use strict';
const form = document.querySelector('#booking-form');
const review = document.querySelector('#booking-review');
const dateInput = document.querySelector('#visit-date');
const timeInput = document.querySelector('#visit-time');
const nameInput = document.querySelector('#booking-name');
const phoneInput = document.querySelector('#booking-phone');
const serviceInputs = [...document.querySelectorAll('input[name="service"]')];
const studioLocation = 'Shree Fitness, No.3 Sakthi Nagar 4th Street, Somasundaram Avenue, Porur, Chennai 600116 — upstairs at BSNL Telephone Exchange, opposite Saravana Stores';

function indiaNow() {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return { date: `${values.year}-${values.month}-${values.day}`, time: `${values.hour}:${values.minute}` };
}
function selectedService() { return serviceInputs.find(input => input.checked); }
function isOnline() { return selectedService().dataset.service === 'online'; }
function refreshDateBounds() {
  const now = indiaNow();
  dateInput.min = now.date;
  const maxDate = new Date(`${now.date}T12:00:00Z`);
  maxDate.setUTCDate(maxDate.getUTCDate() + 90);
  dateInput.max = maxDate.toISOString().slice(0, 10);
}
function studioHours() {
  const isSunday = dateInput.value && new Date(`${dateInput.value}T12:00:00Z`).getUTCDay() === 0;
  return isSunday ? ['07:00', '11:00'] : ['05:30', '21:30'];
}
function updateAppointmentOptions() {
  const online = isOnline();
  document.querySelector('#online-equipment-group').hidden = !online;
  document.querySelector('#appointment-location').textContent = online ? 'ONLINE · CONNECTION DETAILS CONFIRMED BY YOUR TRAINER' : 'AT THE STUDIO · PORUR, CHENNAI';
  document.querySelector('#time-note').textContent = online ? 'Choose your preferred time in Chennai local time (IST). Your trainer will agree the session timing and connection details with you.' : 'Chennai local time (IST). Studio: Mon–Sat, 5:30 AM–9:30 PM; Sunday, 7–11 AM. Preferences are subject to confirmation.';
  const [opens, closes] = studioHours();
  timeInput.min = online ? '' : opens;
  timeInput.max = online ? '' : closes;
  timeInput.setCustomValidity('');
  document.querySelector('#booking-error').textContent = '';
}
const requestedService = new URLSearchParams(window.location.search).get('service');
const preset = serviceInputs.find(input => input.dataset.service === requestedService);
if (preset) preset.checked = true;
refreshDateBounds();
updateAppointmentOptions();
dateInput.addEventListener('focus', refreshDateBounds);
dateInput.addEventListener('input', updateAppointmentOptions);
serviceInputs.forEach(input => input.addEventListener('change', updateAppointmentOptions));
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
  const digits = phoneInput.value.trim().replace(/[\s()-]/g, '');
  let phone;
  if (/^[6-9]\d{9}$/.test(digits)) phone = `+91${digits}`;
  else if (/^\+91[6-9]\d{9}$/.test(digits)) phone = digits;
  else if (/^91[6-9]\d{9}$/.test(digits)) phone = `+${digits}`;
  else if (/^\+(?!91)[1-9]\d{7,14}$/.test(digits)) phone = digits;
  else return invalid(phoneInput, 'Enter a 10-digit Indian mobile number, or an international number beginning with + and its country code.');
  if (!form.reportValidity()) return;
  const now = indiaNow();
  if (dateInput.value < now.date || dateInput.value > dateInput.max) return invalid(dateInput, 'Choose a date from today through the next 90 days.');
  if (dateInput.value === now.date && timeInput.value <= now.time) return invalid(timeInput, 'Choose a future time in Chennai local time (IST).');
  const online = isOnline();
  if (!online) {
    const [opens, closes] = studioHours();
    if (timeInput.value < opens || timeInput.value > closes) return invalid(timeInput, `For this date, choose a studio visit between ${opens} and ${closes} IST, or call to arrange another time.`);
  }
  const service = selectedService().value;
  const date = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${dateInput.value}T12:00:00+05:30`));
  const [hours, minutes] = timeInput.value.split(':').map(Number);
  const time = `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'} IST`;
  const notes = document.querySelector('#booking-notes').value.trim();
  const equipment = online ? document.querySelector('#online-equipment').value : '';
  const location = online ? 'Online — your trainer will confirm connection details' : studioLocation;
  const displayPhone = phone.startsWith('+91') ? `+91 ${phone.slice(3)}` : phone;
  const values = { service, location, date, time, name, phone: displayPhone, equipment, notes };
  for (const [key, value] of Object.entries(values)) document.querySelector(`#review-${key}`).textContent = value;
  document.querySelector('#review-notes-row').hidden = !notes;
  document.querySelector('#review-equipment-row').hidden = !online;
  const message = `Hi Shree Fitness! I’d like to request an appointment.\n\nAppointment: ${service}\nLocation: ${location}\nPreferred date: ${date}\nPreferred time: ${time}\nName: ${name}\nMobile: ${displayPhone}${equipment ? `\nEquipment: ${equipment}` : ''}${notes ? `\nNotes: ${notes}` : ''}\n\nPlease confirm availability and any applicable fees. I understand this is a request, not a confirmed booking.`;
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
