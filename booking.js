'use strict';
const form = document.querySelector('#booking-form');
const review = document.querySelector('#booking-review');
const dateInput = document.querySelector('#visit-date');
const timeInput = document.querySelector('#visit-time');
const minuteInput = document.querySelector('#visit-minute');
const periodInput = document.querySelector('#visit-period');
function selectedTime() {
  if (!timeInput.value) return '';
  const hour = Number(timeInput.value) % 12 + (periodInput.value === 'PM' ? 12 : 0);
  return `${String(hour).padStart(2, '0')}:${minuteInput.value}`;
}
function displayTime(value) {
  const [h, m] = value.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`;
}
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
[dateInput, timeInput, minuteInput, periodInput, nameInput, phoneInput].forEach(input => input.addEventListener('input', () => {
  input.setCustomValidity('');
  timeInput.setCustomValidity('');
  document.querySelector('#booking-error').textContent = '';
}));
function invalid(input, message) {
  input.setCustomValidity(message);
  input.reportValidity();
  document.querySelector('#booking-error').textContent = message;
}
const pageOpened = Date.now();
let lastSent = false;
// Sends the request to the studio's WhatsApp through the site's /api/booking function.
async function sendRequest(payload) {
  try {
    const response = await fetch('/api/booking', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
    return response.ok && (await response.json()).ok === true;
  } catch {
    return false;
  }
}
form.addEventListener('submit', async event => {
  event.preventDefault();
  [dateInput, timeInput, minuteInput, periodInput, nameInput, phoneInput].forEach(input => input.setCustomValidity(''));
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
  const chosenTime = selectedTime();
  if (dateInput.value < now.date || dateInput.value > dateInput.max) return invalid(dateInput, 'Choose a date from today through the next 90 days.');
  if (dateInput.value === now.date && chosenTime <= now.time) return invalid(timeInput, 'Choose a future time in Chennai local time (IST).');
  const online = isOnline();
  if (!online) {
    const [opens, closes] = studioHours();
    if (chosenTime < opens || chosenTime > closes) return invalid(timeInput, `For this date, choose a studio visit between ${displayTime(opens)} and ${displayTime(closes)} IST, or call to arrange another time.`);
  }
  const service = selectedService().value;
  const date = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${dateInput.value}T12:00:00+05:30`));
  const [hours, minutes] = chosenTime.split(':').map(Number);
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
  document.querySelector('#send-booking').href = `https://wa.me/919566099329?text=${encodeURIComponent(message)}`;
  const submit = form.querySelector('button[type="submit"]');
  submit.disabled = true;
  document.querySelector('#booking-error').textContent = 'Sending your request…';
  lastSent = await sendRequest({ type: 'appointment', service, date: dateInput.value, time: chosenTime, name, phone, equipment, notes, company: form.elements.company.value, elapsed: Date.now() - pageOpened });
  submit.disabled = false;
  document.querySelector('#booking-error').textContent = '';
  // Sent: confirm and let the team follow up. Not sent: offer the same request as a WhatsApp message.
  document.querySelector('#review-eyebrow').textContent = lastSent ? 'REQUEST SENT' : 'ONE MORE STEP';
  document.querySelector('#review-title').textContent = lastSent ? 'Your request is with the studio.' : 'Send your request on WhatsApp.';
  document.querySelector('#review-note').textContent = lastSent ? `The Shree Fitness team will contact you on ${displayPhone} to confirm.` : 'We couldn’t send it automatically. Tap the button below to send the same request on WhatsApp.';
  document.querySelector('#review-policy').textContent = lastSent ? 'Not confirmed yet. Wait for the studio to confirm your date and time.' : 'Not booked yet. Send the message and wait for the studio to confirm your appointment.';
  document.querySelector('#send-booking').hidden = lastSent;
  document.querySelector('#edit-booking').textContent = lastSent ? '← Book another appointment' : '← Edit my details';
  form.hidden = true;
  review.hidden = false;
  review.focus();
  review.scrollIntoView({ block: 'start', behavior: 'instant' });
});
document.querySelector('#edit-booking').addEventListener('click', () => {
  if (lastSent) {
    form.reset();
    preset?.click();
    updateAppointmentOptions();
  }
  review.hidden = true;
  form.hidden = false;
  nameInput.focus();
});
