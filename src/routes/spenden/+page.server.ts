// Spenden: Ansprechpersonen aus den Ämtern des Intern-Bereichs (Kasse für Geldspenden, Materialwart*in für
// Sachspenden). Ohne Backend bzw. ohne passendes Amt Rückfall auf die Stammesführung.
import { fetchTeam } from '$lib/server/backend';
import { MATERIAL_RE, TREASURER_RE } from '$lib/donation';
import { CONTACT_EMAIL } from '$lib/seo';
import type { PageServerLoad } from './$types';

interface Contact {
	office: string;
	names: string[];
	email: string;
}

export const load: PageServerLoad = async () => {
	const offices = await fetchTeam().catch(() => []);
	const pick = (re: RegExp): Contact | null => {
		const o = offices.find((x) => re.test(x.name) && x.emails.length > 0);
		return o ? { office: o.name, names: o.holders.map((h) => h.firstName), email: o.emails[0].email } : null;
	};
	const fallback: Contact = { office: 'Stammesführung', names: [], email: CONTACT_EMAIL };
	return {
		treasurer: pick(TREASURER_RE) ?? fallback,
		material: pick(MATERIAL_RE) ?? fallback
	};
};
