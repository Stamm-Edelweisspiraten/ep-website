// RSS 2.0 der 20 neuesten Blog-Beiträge (absolute Adressen aus `ORIGIN`, sonst der Anfrage-Origin).
import { error } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import { fetchPosts } from '$lib/server/backend';
import type { RequestHandler } from './$types';

export const prerender = false;

const TITLE = 'Blog – Stamm Edelweißpiraten';
const DESCRIPTION = 'Berichte und Neuigkeiten aus dem Stamm Edelweißpiraten in Bremen-Hastedt.';

/** XML-Sonderzeichen maskieren und in XML 1.0 unzulässige Steuerzeichen entfernen */
function xml(value: string): string {
	return value
		.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F￾￿]/g, '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;');
}

function rfc822(iso: string): string | null {
	const d = new Date(iso);
	return Number.isNaN(d.getTime()) ? null : d.toUTCString();
}

export const GET: RequestHandler = async ({ url }) => {
	const page = await fetchPosts({ limit: 20 }).catch(() => {
		throw error(503, 'Der Blog ist gerade nicht erreichbar');
	});
	const origin = (env.ORIGIN || url.origin).replace(/\/+$/, '');
	const items = page.items
		.map((p) => {
			const link = `${origin}${p.href}`;
			const date = rfc822(p.publishedAt);
			return [
				'    <item>',
				`      <title>${xml(p.title)}</title>`,
				`      <link>${xml(link)}</link>`,
				`      <guid isPermaLink="true">${xml(link)}</guid>`,
				date ? `      <pubDate>${date}</pubDate>` : '',
				p.teaser ? `      <description>${xml(p.teaser)}</description>` : '',
				...p.tags.map((t) => `      <category>${xml(t)}</category>`),
				'    </item>'
			]
				.filter(Boolean)
				.join('\n');
		})
		.join('\n');
	const lastBuild = page.items[0] ? rfc822(page.items[0].publishedAt) : null;
	const body = [
		'<?xml version="1.0" encoding="UTF-8"?>',
		'<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
		'  <channel>',
		`    <title>${xml(TITLE)}</title>`,
		`    <link>${xml(`${origin}/blog`)}</link>`,
		`    <description>${xml(DESCRIPTION)}</description>`,
		'    <language>de-DE</language>',
		`    <atom:link href="${xml(`${origin}/blog/rss.xml`)}" rel="self" type="application/rss+xml" />`,
		lastBuild ? `    <lastBuildDate>${lastBuild}</lastBuildDate>` : '',
		items,
		'  </channel>',
		'</rss>',
		''
	]
		.filter((line) => line !== '')
		.join('\n');
	return new Response(`${body}\n`, {
		headers: {
			'content-type': 'application/rss+xml; charset=utf-8',
			'cache-control': 'public, max-age=600'
		}
	});
};
