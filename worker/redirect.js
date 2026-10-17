// The old workers.dev address now permanently redirects to the Pages site, keeping the path and query.
const SITE = 'https://shreefitnessstudio.pages.dev';

export default {
  fetch(request) {
    const url = new URL(request.url);
    return Response.redirect(SITE + url.pathname + url.search, 301);
  },
};
