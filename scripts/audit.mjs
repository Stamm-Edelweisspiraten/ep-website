#!/usr/bin/env node
// Sicherheitsprüfung der Abhängigkeiten für die CI.
// Prüft ALLE Pakete (auch devDependencies: SvelteKit, Vite & Co. landen im gebauten Server) und bricht bei
// Meldungen ab Schwere „high“ ab – außer sie stehen unten in ALLOWED: bewusst bewertet, mit Begründung und
// Datum der nächsten Prüfung. Abgelaufene Ausnahmen gelten nicht mehr (dann neu bewerten oder aktualisieren).
import { execFileSync } from 'node:child_process';

/** @type {Record<string, { reason: string; until: string }>} GHSA-ID → Bewertung */
const ALLOWED = {
	'GHSA-pfhg-q3qv-9q6r': {
		reason: 'Weiterleitung bei use:enhance – die Website nutzt use:enhance nicht (Formulare ohne JS-Erweiterung).',
		until: '2027-02-28'
	},
	'GHSA-27mw-82g8-phjj': {
		reason: 'XSS nur bei vorgerenderten Seiten – prerender ist überall aus (+layout.js).',
		until: '2027-02-28'
	},
	'GHSA-3r8g-jcqq-3p5j': {
		reason: 'DoS in Remote-Functions-`form` – die Website nutzt keine Remote Functions.',
		until: '2027-02-28'
	},
	'GHSA-6cf5-gc4q-fm3x': {
		reason: 'Kollision privater `query.batch`-Funktionen – nicht genutzt.',
		until: '2027-02-28'
	},
	'GHSA-pxg6-pf52-xh8x': {
		reason: 'cookie <0.7 (über SvelteKit 2): nur feste Cookie-Namen/-Pfade (theme), keine Eingaben in Namen/Pfaden.',
		until: '2027-02-28'
	}
};

const LEVELS = ['info', 'low', 'moderate', 'high', 'critical'];
const minLevel = LEVELS.indexOf(process.argv[2] ?? 'high');

let raw;
try {
	raw = execFileSync('npm', ['audit', '--json'], { encoding: 'utf8', shell: process.platform === 'win32' });
} catch (err) {
	// npm audit endet mit Code 1, sobald es Funde gibt – die Ausgabe steht trotzdem in stdout
	raw = /** @type {{ stdout?: string }} */ (err).stdout ?? '';
}

let report;
try {
	report = JSON.parse(raw);
} catch {
	console.error('npm audit lieferte kein JSON:\n' + raw.slice(0, 500));
	process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);
const blocking = [];
const accepted = [];
const seen = new Set();

for (const vuln of Object.values(report.vulnerabilities ?? {})) {
	for (const via of vuln.via) {
		if (typeof via !== 'object') continue; // nur Verweis auf ein anderes Paket
		const id = String(via.url ?? '').split('/').pop() ?? '';
		const key = `${vuln.name}:${id}`;
		if (seen.has(key)) continue;
		seen.add(key);
		if (LEVELS.indexOf(via.severity) < minLevel) continue;
		const allow = ALLOWED[id];
		const line = `${via.severity.padEnd(8)} ${vuln.name} – ${via.title} (${id})`;
		if (allow && allow.until >= today) accepted.push(`${line}\n           bewertet: ${allow.reason} (bis ${allow.until})`);
		else blocking.push(allow ? `${line}\n           Ausnahme abgelaufen am ${allow.until} – neu bewerten` : line);
	}
}

if (accepted.length) console.log(`Bewusst akzeptiert (${accepted.length}):\n  ${accepted.join('\n  ')}\n`);
if (blocking.length) {
	console.error(`Sicherheitslücken ab „${LEVELS[minLevel]}“ (${blocking.length}):\n  ${blocking.join('\n  ')}`);
	console.error('\nAktualisieren (npm audit fix) oder bewerten und in scripts/audit.mjs eintragen.');
	process.exit(1);
}
console.log(`Keine offenen Sicherheitslücken ab „${LEVELS[minLevel]}“.`);
