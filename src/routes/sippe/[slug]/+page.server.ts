import { loadGroupPage } from '$lib/server/group-page';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => loadGroupPage('sippe', params.slug);
