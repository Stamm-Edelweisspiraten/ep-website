/**
 * Inhalte für Crawler: `robots.txt`, `sitemap.xml` und `llms.txt` (rein, ohne SvelteKit-Importe –
 * getestet in `tests/unit/website-seo.test.ts`). Die Routen holen die Daten und reichen sie hier durch.
 */
import {
	MEETING_PLACE,
	SITE_NAME,
	CONTACT_EMAIL,
	INSTAGRAM_URL,
	absoluteUrl,
	cleanBase
} from '../seo';

/** Pfad der Bot-Falle (unsichtbarer Link im Fuß, in `robots.txt` gesperrt) */
export const BOT_TRAP_PATH = '/pfad-ins-unterholz';

/** KI-Crawler, die ausdrücklich willkommen sind */
export const AI_CRAWLERS = [
	'GPTBot',
	'ClaudeBot',
	'PerplexityBot',
	'Google-Extended',
	'CCBot'
] as const;

const DISALLOWED = ['/kontakt/challenge', '/stats/', BOT_TRAP_PATH];

export function robotsTxt(base: string): string {
	const block = (agent: string) => [
		`User-agent: ${agent}`,
		'Allow: /',
		...DISALLOWED.map((p) => `Disallow: ${p}`),
		''
	];
	return [
		`# ${SITE_NAME} – ${cleanBase(base)}`,
		'',
		...block('*'),
		'# KI-Crawler sind ausdrücklich willkommen',
		...AI_CRAWLERS.flatMap(block),
		`Sitemap: ${absoluteUrl(base, '/sitemap.xml')}`,
		''
	].join('\n');
}

/** Statische Seiten der Website (Pfad, Priorität, Änderungshäufigkeit) */
export const STATIC_PAGES: { path: string; priority: number; changefreq: string }[] = [
	{ path: '/', priority: 1, changefreq: 'weekly' },
	{ path: '/probestunde', priority: 0.9, changefreq: 'monthly' },
	{ path: '/termine', priority: 0.8, changefreq: 'daily' },
	{ path: '/galerie', priority: 0.7, changefreq: 'weekly' },
	{ path: '/blog', priority: 0.7, changefreq: 'weekly' },
	{ path: '/faq', priority: 0.6, changefreq: 'monthly' },
	{ path: '/team', priority: 0.6, changefreq: 'monthly' },
	{ path: '/kontakt', priority: 0.6, changefreq: 'yearly' },
	{ path: '/cpd', priority: 0.5, changefreq: 'yearly' },
	{ path: '/spenden', priority: 0.4, changefreq: 'yearly' },
	{ path: '/impressum', priority: 0.2, changefreq: 'yearly' },
	{ path: '/datenschutz', priority: 0.2, changefreq: 'yearly' }
];

export interface SitemapEntry {
	path: string;
	/** `YYYY-MM-DD` oder ISO-Zeitpunkt */
	lastmod?: string | null;
	changefreq?: string;
	priority?: number;
}

/** XML-Sonderzeichen maskieren und unzulässige Steuerzeichen entfernen */
export function xmlEscape(value: string): string {
	return (
		value
			// eslint-disable-next-line no-control-regex
			.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '')
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&apos;')
	);
}

function lastmodOf(value: string | null | undefined): string | null {
	if (!value) return null;
	if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
	const d = new Date(value);
	return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

export function sitemapXml(base: string, entries: SitemapEntry[]): string {
	const seen = new Set<string>();
	const urls = entries
		.filter((e) => (seen.has(e.path) ? false : (seen.add(e.path), true)))
		.map((e) => {
			const lastmod = lastmodOf(e.lastmod);
			return [
				'  <url>',
				`    <loc>${xmlEscape(absoluteUrl(base, e.path))}</loc>`,
				...(lastmod ? [`    <lastmod>${lastmod}</lastmod>`] : []),
				...(e.changefreq ? [`    <changefreq>${e.changefreq}</changefreq>`] : []),
				...(e.priority !== undefined ? [`    <priority>${e.priority.toFixed(1)}</priority>`] : []),
				'  </url>'
			].join('\n');
		});
	return [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
		...urls,
		'</urlset>',
		''
	].join('\n');
}

// --- llms.txt ------------------------------------------------------------------------------------

export interface LlmsGroup {
	name: string;
	typeLabel: string;
	href: string;
	ageRange: string;
	/** „Freitags“ */
	weekday: string;
	/** „16:30–18:00 Uhr“ */
	time: string;
	teaser: string;
}

export interface LlmsEvent {
	key: string;
	title: string;
	/** fertig formatiertes Datum (mit Uhrzeit) */
	when: string;
	location: string | null;
}

/** Markdown-Text ohne Zeilenumbrüche und ohne Zeichen, die Links/Überschriften brechen */
function md(value: string): string {
	return value
		.replace(/\s+/g, ' ')
		.replace(/[[\]<>]/g, '')
		.trim();
}

export function llmsTxt(
	base: string,
	data: { groups: LlmsGroup[]; events: LlmsEvent[] | null }
): string {
	const url = (path: string) => absoluteUrl(base, path);
	const place = `${MEETING_PLACE.name}, ${MEETING_PLACE.streetAddress}, ${MEETING_PLACE.postalCode} ${MEETING_PLACE.addressLocality}`;
	const lines: string[] = [
		`# ${SITE_NAME}`,
		'',
		'> Pfadfinder in Bremen: Pfadfinderstamm der Christlichen Pfadfinderschaft Deutschlands e. V. (CPD) in ' +
			'Bremen-Hastedt (Stadtteil Hemelingen). ' +
			'Wöchentliche Gruppenstunden, Fahrten und Zeltlager für Kinder und Jugendliche ab 6 Jahren. ' +
			'Die erste Gruppenstunde (Probestunde) ist kostenlos und unverbindlich.',
		'',
		'Der Stamm gehört zur CPD (Landesmark Achter’n Diek, Gau Bremen). In der Gruppenstunde wird gespielt, gebaut, ' +
			'gesungen und draußen getobt; mehrmals im Jahr geht es auf Fahrt und ins Zeltlager. Alle Leitungen arbeiten ehrenamtlich. ' +
			'Mitmachen können Kinder und Jugendliche aus Hastedt, Hemelingen und ganz Bremen.',
		'',
		'## Eckdaten',
		'',
		'- Alter: ab 6 Jahren (Meute für Kinder, Sippe für Jugendliche – genaue Alter siehe Gruppen)',
		`- Treffpunkt: ${place}`,
		'- Beitrag: 55 € im Jahr, Schnuppern ist kostenlos',
		`- Kontakt: ${CONTACT_EMAIL} (Stammesführung) oder Kontaktformular ${url('/kontakt')}`,
		`- Probestunde anfragen: ${url('/probestunde')}`,
		`- Instagram: ${INSTAGRAM_URL}`,
		''
	];
	if (data.groups.length) {
		lines.push('## Gruppen', '');
		for (const g of data.groups) {
			const facts = [
				g.ageRange && `Alter ${md(g.ageRange)}`,
				[g.weekday, g.time].filter(Boolean).join(' ') &&
					`Gruppenstunde ${md([g.weekday, g.time].filter(Boolean).join(' '))}`
			].filter(Boolean);
			const teaser = g.teaser ? ` ${md(g.teaser)}` : '';
			lines.push(
				`- [${md(`${g.typeLabel} ${g.name}`)}](${url(g.href)}): ${facts.join(', ') || 'Gruppe des Stammes'}.${teaser}`
			);
		}
		lines.push('');
	}
	lines.push('## Nächste Termine', '');
	if (data.events === null) {
		lines.push(`Gerade nicht abrufbar – aktuelle Termine unter ${url('/termine')}.`, '');
	} else if (data.events.length === 0) {
		lines.push(
			`Zurzeit keine besonderen Termine eingetragen (Gruppenstunden siehe oben). Übersicht: ${url('/termine')}`,
			''
		);
	} else {
		for (const e of data.events) {
			const where = e.location ? `, ${md(e.location)}` : '';
			lines.push(`- [${md(e.title)}](${url(`/termine/${e.key}`)}): ${md(e.when)}${where}`);
		}
		lines.push('');
	}
	lines.push(
		'## Wichtige Seiten',
		'',
		`- [Probestunde anfragen](${url('/probestunde')}): Kind anmelden, wir finden die passende Gruppe`,
		`- [Termine](${url('/termine')}): Gruppenstunden, Fahrten und Aktionen`,
		`- [Häufige Fragen](${url('/faq')}): Alter, Kosten, Ausrüstung`,
		`- [Unser Team](${url('/team')}): Ämter und Ansprechpartner*innen`,
		`- [Kontakt](${url('/kontakt')}): Formular, E-Mail-Adressen, Anfahrt`,
		`- [Blog](${url('/blog')}): Berichte von Fahrten und Lagern (RSS: ${url('/blog/rss.xml')})`,
		`- [Galerie](${url('/galerie')}): Bilder von Fahrten, Lagern und Aktionen`,
		`- [Unser Bund (CPD)](${url('/cpd')}): Aufbau und Geschichte der Christlichen Pfadfinderschaft Deutschlands`,
		`- [Spenden](${url('/spenden')}): Geld- und Sachspenden für Fahrten, Lager und Material`,
		'',
		'## Optional',
		'',
		`- [Impressum](${url('/impressum')})`,
		`- [Datenschutz](${url('/datenschutz')})`,
		`- [Sitemap](${url('/sitemap.xml')})`,
		''
	);
	return lines.join('\n');
}
