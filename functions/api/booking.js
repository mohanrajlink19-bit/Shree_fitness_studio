// Cloudflare Pages Function for /api/booking: sends website requests to the studio's WhatsApp.
import { handleBooking } from '../../worker/booking.js';

export const onRequest = ({ request, env }) => handleBooking(request, env);
