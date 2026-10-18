// Serves Google Search Console's ownership file at its exact .html address; Pages would otherwise redirect it to /googled4059e86940ab7b5.
export const onRequestGet = () => new Response('google-site-verification: googled4059e86940ab7b5.html', { headers: { 'content-type': 'text/html; charset=utf-8' } });
