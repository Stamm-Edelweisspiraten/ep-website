/**
 * Bereinigung von Rich-Text aus dem Backend (Blog-Beiträge, FAQ-Antworten) vor der Ausgabe per `{@html}` (rein,
 * ohne SvelteKit-Importe – getestet in der Root-Suite, `tests/unit/website-rich-text.test.ts`).
 *
 * Das Backend liefert bereits bereinigtes HTML; die Website verlässt sich darauf nicht und lässt nur eine kleine
 * Whitelist durch (zweite Verteidigungslinie, dazu die CSP in `svelte.config.js`):
 * - Text: p, br, strong, b, em, i, u, s, ul, ol, li, blockquote, h2, h3, hr (h1 → h2, h4–h6 → h3)
 * - Links nur mit http/https/mailto oder relativem Pfad; immer `rel="noopener noreferrer"`, externe mit `target="_blank"`
 * - Bilder nur mit bekannter `data-image-id` (aus `images`): `src` = Bild-Proxy (`web`), echte Maße, lazy;
 *   jedes fremde `src` und unbekannte IDs fallen weg.
 * Alles andere (Skripte, Ereignis-Attribute, Stile, Klassen, iframes, Formulare …) wird entfernt.
 */
import sanitizeHtml, { type Attributes } from 'sanitize-html';

export interface RichTextImage {
	width: number;
	height: number;
}

export interface RenderRichTextOptions {
	/** Bekannte Bilder des Beitrags (ID → Maße); ohne Angabe werden alle Bilder entfernt */
	images?: Map<string, RichTextImage>;
	/** Adresse eines Bildes über den Bild-Proxy */
	imageUrl?: (id: string, variant: 'thumb' | 'web') => string;
}

const TAGS = [
	'p',
	'br',
	'strong',
	'b',
	'em',
	'i',
	'u',
	's',
	'ul',
	'ol',
	'li',
	'blockquote',
	'h2',
	'h3',
	'hr',
	'a',
	'img'
];

const IMAGE_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EXTERNAL_RE = /^https?:\/\//i;
const SAFE_HREF_RE = /^(https?:\/\/|mailto:|\/(?!\/)|#)/i;

export function renderRichText(html: string, options: RenderRichTextOptions = {}): string {
	const { images, imageUrl } = options;
	return sanitizeHtml(html ?? '', {
		allowedTags: TAGS,
		allowedAttributes: {
			a: ['href', 'rel', 'target'],
			img: ['src', 'alt', 'width', 'height', 'loading', 'decoding']
		},
		allowedSchemes: ['http', 'https', 'mailto'],
		allowedSchemesByTag: { img: [] },
		allowedSchemesAppliedToAttributes: ['href', 'src'],
		allowProtocolRelative: false,
		allowedClasses: {},
		allowedStyles: {},
		disallowedTagsMode: 'discard',
		transformTags: {
			h1: 'h2',
			h4: 'h3',
			h5: 'h3',
			h6: 'h3',
			a: (tagName, attribs): { tagName: string; attribs: Attributes } => {
				const href = (attribs.href ?? '').trim();
				if (!href || !SAFE_HREF_RE.test(href)) return { tagName, attribs: {} };
				return {
					tagName,
					attribs: EXTERNAL_RE.test(href)
						? { href, rel: 'noopener noreferrer', target: '_blank' }
						: { href, rel: 'noopener noreferrer' }
				};
			},
			img: (tagName, attribs): { tagName: string; attribs: Attributes } => {
				const id = (attribs['data-image-id'] ?? '').toLowerCase();
				const known = IMAGE_ID_RE.test(id) ? images?.get(id) : undefined;
				if (!known || !imageUrl) return { tagName, attribs: {} };
				return {
					tagName,
					attribs: {
						src: imageUrl(id, 'web'),
						alt: (attribs.alt ?? '').slice(0, 300),
						width: String(Math.round(known.width)),
						height: String(Math.round(known.height)),
						loading: 'lazy',
						decoding: 'async'
					}
				};
			}
		},
		// Bilder ohne (zulässige) Quelle ganz entfernen
		exclusiveFilter: (frame) => frame.tag === 'img' && !frame.attribs.src
	}).trim();
}

/** Klartext (für Rückfall-Antworten) als einfacher Absatz – Zeichen maskiert */
export function textToHtml(text: string): string {
	const escaped = text
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
	return escaped
		.split(/\n{2,}/)
		.map((p) => p.trim())
		.filter(Boolean)
		.map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
		.join('');
}
