import { redirect, type Handle } from '@sveltejs/kit';

// Die Download-Seite gibt es mit dem neuen Backend nicht mehr – alte Links landen auf der Startseite.
export const handle: Handle = async ({ event, resolve }) => {
    const path = event.url.pathname;
    if (path === '/download' || path.startsWith('/download/')) throw redirect(308, '/');
    return resolve(event);
};
