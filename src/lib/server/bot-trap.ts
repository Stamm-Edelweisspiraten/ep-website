/**
 * Bot-Falle: Ein unsichtbarer Link im Fuß führt auf `/pfad-ins-unterholz` (in `robots.txt` gesperrt). Wer ihn trotzdem
 * aufruft, ist sehr wahrscheinlich ein Bot, der Regeln ignoriert – seine IP wird 24 h gemerkt. Folge: keine Spam-Schutz-
 * Aufgabe (`/kontakt/challenge` → 403) und Formulare antworten neutral mit Erfolg, ohne etwas weiterzuleiten. Seiten bleiben
 * erreichbar. Bekannte Suchmaschinen (nach User-Agent) werden nie gefangen.
 *
 * Nur im Arbeitsspeicher (je Prozess), höchstens `max` IPs (älteste fallen heraus). Im Log steht nie die IP selbst,
 * nur ein gekürzter Hash mit zufälligem Salz je Prozess.
 * Rein (nur `node:crypto`), getestet in `tests/unit/website-bot-trap.test.ts`.
 */
import { createHash, randomBytes } from 'node:crypto';

export const BOT_TRAP_TTL_MS = 24 * 60 * 60_000;
export const BOT_TRAP_MAX = 10_000;

/** Seriöse Suchmaschinen-Crawler (folgen eigentlich `robots.txt`; zur Sicherheit nie sperren) */
const GOOD_CRAWLERS = /\b(googlebot|bingbot|duckduckbot|applebot|yandexbot)\b/i;

export function isGoodCrawler(userAgent: string | null | undefined): boolean {
	return !!userAgent && GOOD_CRAWLERS.test(userAgent);
}

/** IP ohne verwertbaren Wert (z. B. `getClientAddress` schlug fehl) – nie sperren, sonst träfe es alle */
function usableIp(ip: string | null | undefined): ip is string {
	return !!ip && ip !== 'unbekannt';
}

export interface BotTrap {
	isTrapped(ip: string | null | undefined): boolean;
	/** IP fangen; `false`, wenn ausgenommen (guter Crawler, keine IP) */
	trap(ip: string | null | undefined, userAgent?: string | null): boolean;
	size(): number;
	clear(): void;
}

export function createBotTrap(
	opts: {
		ttlMs?: number;
		max?: number;
		now?: () => number;
		log?: (message: string) => void;
	} = {}
): BotTrap {
	const ttl = opts.ttlMs ?? BOT_TRAP_TTL_MS;
	const max = Math.max(1, opts.max ?? BOT_TRAP_MAX);
	const now = opts.now ?? Date.now;
	const log = opts.log ?? ((m: string) => console.warn(m));
	const salt = randomBytes(16);
	/** IP → Ablauf; Einfügereihenfolge = Alter (beim erneuten Fangen neu eingereiht) */
	const entries = new Map<string, number>();

	const hash = (ip: string) =>
		createHash('sha256').update(salt).update(ip).digest('hex').slice(0, 12);

	return {
		isTrapped(ip) {
			if (!usableIp(ip)) return false;
			const until = entries.get(ip);
			if (until === undefined) return false;
			if (until <= now()) {
				entries.delete(ip);
				return false;
			}
			return true;
		},
		trap(ip, userAgent) {
			if (!usableIp(ip) || isGoodCrawler(userAgent)) return false;
			entries.delete(ip);
			entries.set(ip, now() + ttl);
			while (entries.size > max) {
				const oldest = entries.keys().next().value;
				if (oldest === undefined) break;
				entries.delete(oldest);
			}
			log(`[bot-trap] Besucher ${hash(ip)} gefangen (24 h)`);
			return true;
		},
		size() {
			return entries.size;
		},
		clear() {
			entries.clear();
		}
	};
}

/** Gemeinsame Falle des Prozesses */
export const botTrap = createBotTrap();

export const isTrapped = (ip: string | null | undefined) => botTrap.isTrapped(ip);
export const trap = (ip: string | null | undefined, userAgent?: string | null) =>
	botTrap.trap(ip, userAgent);

/** Client-IP wie bei den Rate-Limits (`getClientAddress`, ohne IP `'unbekannt'`) */
export function clientIpOf(getClientAddress: () => string): string {
	try {
		return getClientAddress();
	} catch {
		return 'unbekannt';
	}
}
