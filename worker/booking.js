// Forwards website booking/enquiry requests to the studio's WhatsApp; used by functions/api/booking.js (Cloudflare Pages).
// Providers, tried in order when their secrets are set: Meta WhatsApp Cloud API, GREEN-API, CallMeBot, Telegram.

const DEFAULT_NOTIFY_WHATSAPP = '+919566099329';
const MAX_BODY = 4096;
const SERVICES = ['Studio visit & membership enquiry', 'Personal training consultation', 'Online training consultation'];
const GOALS = ['Membership & studio visit', 'Strength & muscle', 'Fitness & weight management', 'Personal training', 'Online training'];
const EQUIPMENT = ['No equipment yet', 'Mat & light equipment', 'Dumbbells / resistance bands', 'Access to a gym', 'Let’s discuss this'];
const RATE_WINDOW = 10 * 60 * 1000;
const RATE_LIMIT = 5;
const recent = new Map(); // Best-effort, per-isolate limit; stops a single visitor flooding the studio's WhatsApp.

class NotConfigured extends Error {}

function reply(status, body) {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });
}

export async function handleBooking(request, env) {
  const url = new URL(request.url);
  if (request.method !== 'POST') return reply(405, { ok: false, error: 'method' });
  const origin = request.headers.get('origin');
  if (origin && origin !== url.origin) return reply(403, { ok: false, error: 'origin' });
  const raw = await request.text();
  if (raw.length > MAX_BODY) return reply(413, { ok: false, error: 'size' });
  let data;
  try {
    data = JSON.parse(raw);
  } catch {
    return reply(400, { ok: false, error: 'invalid' });
  }
  if (!data || typeof data !== 'object') return reply(400, { ok: false, error: 'invalid' });
  // Bots fill the hidden field or submit instantly: report success but send nothing.
  if (data.company || !(Number(data.elapsed) >= 1500)) return reply(200, { ok: true });
  if (tooMany(request.headers.get('cf-connecting-ip') || 'unknown')) return reply(429, { ok: false, error: 'busy' });
  const message = buildMessage(data);
  if (!message) return reply(400, { ok: false, error: 'invalid' });
  try {
    await sendNotification(env, message);
  } catch (error) {
    if (error instanceof NotConfigured) return reply(503, { ok: false, error: 'not-configured' });
    console.error('Booking notification failed:', error.message);
    return reply(502, { ok: false, error: 'send' });
  }
  return reply(200, { ok: true });
}

function tooMany(ip) {
  const now = Date.now();
  const hits = (recent.get(ip) || []).filter(time => now - time < RATE_WINDOW);
  hits.push(now);
  if (recent.size > 5000) recent.clear();
  recent.set(ip, hits);
  return hits.length > RATE_LIMIT;
}

function clean(value, max) {
  if (typeof value !== 'string') return '';
  const text = value.replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ').trim();
  return text.length <= max ? text : '';
}

export function normalizePhone(value) {
  const digits = typeof value === 'string' ? value.trim().replace(/[\s()-]/g, '') : '';
  if (/^[6-9]\d{9}$/.test(digits)) return `+91${digits}`;
  if (/^\+91[6-9]\d{9}$/.test(digits)) return digits;
  if (/^91[6-9]\d{9}$/.test(digits)) return `+${digits}`;
  if (/^\+(?!91)[1-9]\d{7,14}$/.test(digits)) return digits;
  return '';
}

export function buildMessage(data) {
  const name = clean(data.name, 80);
  const phone = normalizePhone(data.phone);
  if (!name || !phone) return null;
  const mobile = phone.startsWith('+91') ? `+91 ${phone.slice(3, 8)} ${phone.slice(8)}` : phone;
  const chat = `https://wa.me/${phone.slice(1)}`;
  if (data.type === 'appointment') {
    if (!SERVICES.includes(data.service) || !/^\d{4}-\d{2}-\d{2}$/.test(data.date) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(data.time)) return null;
    const day = new Date(`${data.date}T12:00:00+05:30`);
    if (Number.isNaN(day.getTime())) return null;
    const date = new Intl.DateTimeFormat('en-IN', { timeZone: 'Asia/Kolkata', weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' }).format(day);
    const [hours, minutes] = data.time.split(':').map(Number);
    const time = `${hours % 12 || 12}:${String(minutes).padStart(2, '0')} ${hours >= 12 ? 'PM' : 'AM'} IST`;
    const equipment = EQUIPMENT.includes(data.equipment) ? data.equipment : '';
    const notes = clean(data.notes, 600);
    return {
      kind: 'appointment request',
      name, mobile, chat,
      when: `${date}, ${time}`,
      details: [data.service, equipment && `Equipment: ${equipment}`, notes && `Notes: ${notes}`].filter(Boolean).join(' · '),
      lines: ['🔔 New appointment request – Shree Fitness website', '', `Service: ${data.service}`, `Date: ${date}`, `Time: ${time}`, `Name: ${name}`, `Mobile: ${mobile}`, equipment ? `Equipment: ${equipment}` : null, notes ? `Notes: ${notes}` : null, '', `Reply on WhatsApp: ${chat}`],
    };
  }
  if (data.type === 'enquiry') {
    if (!GOALS.includes(data.goal)) return null;
    const note = clean(data.message, 600);
    return {
      kind: 'enquiry',
      name, mobile, chat,
      when: 'Enquiry',
      details: [data.goal, note && `Message: ${note}`].filter(Boolean).join(' · '),
      lines: ['🔔 New enquiry – Shree Fitness website', '', `Interested in: ${data.goal}`, `Name: ${name}`, `Mobile: ${mobile}`, note ? `Message: ${note}` : null, '', `Reply on WhatsApp: ${chat}`],
    };
  }
  return null;
}

// Tries each configured provider in order, so Telegram can catch a request if WhatsApp delivery fails.
async function sendNotification(env, message) {
  const providers = [
    env.WHATSAPP_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID && sendMeta,
    env.GREENAPI_URL && env.GREENAPI_INSTANCE && env.GREENAPI_TOKEN && sendGreenApi,
    env.CALLMEBOT_APIKEY && sendCallMeBot,
    env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_CHAT_ID && sendTelegram,
  ].filter(Boolean);
  if (!providers.length) throw new NotConfigured('No notification provider secrets are set');
  const errors = [];
  for (const send of providers) {
    try {
      return await send(env, message);
    } catch (error) {
      errors.push(error.message);
    }
  }
  throw new Error(errors.join(' | '));
}

const plainText = message => message.lines.filter(line => line !== null).join('\n');

// GREEN-API (free Developer plan): sends from a WhatsApp number linked by QR code in the GREEN-API console.
async function sendGreenApi(env, message) {
  const chatId = `${(env.NOTIFY_WHATSAPP || DEFAULT_NOTIFY_WHATSAPP).replace(/\D/g, '')}@c.us`;
  const response = await fetch(`${env.GREENAPI_URL.replace(/\/+$/, '')}/waInstance${env.GREENAPI_INSTANCE}/sendMessage/${env.GREENAPI_TOKEN}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chatId, message: plainText(message) }),
    signal: AbortSignal.timeout(10000),
  });
  const body = await response.text();
  if (!response.ok || !/idMessage/.test(body)) throw new Error(`GREEN-API ${response.status}: ${body.slice(0, 200)}`);
}

async function sendTelegram(env, message) {
  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: plainText(message), disable_web_page_preview: true }),
    signal: AbortSignal.timeout(10000),
  });
  const body = await response.text();
  if (!response.ok || !/"ok":true/.test(body)) throw new Error(`Telegram ${response.status}: ${body.slice(0, 200)}`);
}

async function sendCallMeBot(env, message) {
  const text = plainText(message);
  const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(env.NOTIFY_WHATSAPP || DEFAULT_NOTIFY_WHATSAPP)}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(env.CALLMEBOT_APIKEY)}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
  const body = await response.text();
  if (!response.ok || /error|invalid/i.test(body)) throw new Error(`CallMeBot ${response.status}: ${body.replace(/<[^>]+>/g, ' ').slice(0, 200)}`);
}

// Template body (category Utility), e.g. "New {{1}} from {{2}} ({{3}}). When: {{4}}. Details: {{5}}. Chat: {{6}}"
async function sendMeta(env, message) {
  const param = text => ({ type: 'text', text: String(text || '—').replace(/\s+/g, ' ').slice(0, 900) });
  const response = await fetch(`https://graph.facebook.com/${env.WHATSAPP_API_VERSION || 'v23.0'}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
    method: 'POST',
    headers: { authorization: `Bearer ${env.WHATSAPP_TOKEN}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to: (env.NOTIFY_WHATSAPP || DEFAULT_NOTIFY_WHATSAPP).replace(/\D/g, ''),
      type: 'template',
      template: {
        name: env.WHATSAPP_TEMPLATE || 'website_booking',
        language: { code: env.WHATSAPP_TEMPLATE_LANG || 'en' },
        components: [{ type: 'body', parameters: [message.kind, message.name, message.mobile, message.when, message.details, message.chat].map(param) }],
      },
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`WhatsApp Cloud API ${response.status}: ${(await response.text()).slice(0, 300)}`);
}
