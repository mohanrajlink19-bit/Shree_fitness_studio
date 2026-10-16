const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const code = fs.readFileSync('booking.js', 'utf8');
function setup() {
  const elements = new Map();
  const element = id => {
    if (!elements.has(id)) elements.set(id, { value: '', textContent: '', hidden: false, events: {}, validityMessage: '', addEventListener(type, fn) { (this.events[type] ||= []).push(fn); }, setCustomValidity(text) { this.validityMessage = text; }, reportValidity() { return !this.validityMessage; }, focus() {}, scrollIntoView() {} });
    return elements.get(id);
  };
  const date = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
  element('#visit-date').value = date;
  element('#visit-time').value = '14:30';
  element('#booking-name').value = 'Alex Example';
  element('#booking-phone').value = '+91 98765 43210';
  element('#booking-notes').value = '<script>alert(1)</script>';
  vm.runInNewContext(code, { document: { querySelector: element }, Intl, Date, FormData: class { get() { return 'Personal training consultation'; } }, encodeURIComponent });
  const submit = () => element('#booking-form').events.submit[0]({ preventDefault() {} });
  return { element, submit };
}
{
  const {element:e, submit} = setup(); submit();
  assert.equal(e('#booking-form').hidden, true);
  assert.equal(e('#review-phone').textContent, '+91 9876543210');
  assert.equal(e('#review-time').textContent, '2:30 PM IST');
  assert.equal(e('#review-notes').textContent, '<script>alert(1)</script>');
  const draft = decodeURIComponent(e('#send-booking').href);
  assert.ok(draft.startsWith('https://wa.me/918778642342?text='));
  assert.ok(draft.includes('not a confirmed booking'));
  assert.ok(draft.includes('Personal training consultation'));
  e('#edit-booking').events.click[0]();
  assert.equal(e('#booking-form').hidden, false);
  assert.equal(e('#booking-review').hidden, true);
}
for (const phone of ['123', '1234567890', '+44 9876543210']) {
  const {element:e, submit} = setup(); e('#booking-phone').value = phone; submit();
  assert.ok(e('#booking-phone').validityMessage);
  assert.equal(e('#booking-form').hidden, false);
}
{
  const {element:e, submit} = setup(); e('#booking-name').value = '   '; submit();
  assert.ok(e('#booking-name').validityMessage);
}
{
  const {element:e, submit} = setup(); e('#visit-date').value = '2000-01-01'; submit();
  assert.ok(e('#visit-date').validityMessage);
}
{
  const {element:e, submit} = setup(); e('#visit-date').value = '2099-12-31'; submit();
  assert.ok(e('#visit-date').validityMessage);
}
{
  const {element:e, submit} = setup(); e('#visit-date').value = e('#visit-date').min; e('#visit-time').value = '00:00'; submit();
  assert.ok(e('#visit-time').validityMessage);
  e('#visit-date').events.input.forEach(fn=>fn());
  assert.equal(e('#visit-time').validityMessage, '');
}
console.log('Booking logic passed: review, draft, edit, phone, name, date bounds, past time, safe text, dependent validity. Browser layout checks remain separate.');
