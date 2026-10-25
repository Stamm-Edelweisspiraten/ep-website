/**
 * Spam-Schutz des Kontaktformulars im Browser: Proof-of-Work-Aufgabe lösen (`challenge = SHA-256(salt + n)`,
 * `0 ≤ n ≤ maxNumber`). Rein (nur WebCrypto), getestet in `tests/unit/website-pow.test.ts` des Hauptprojekts.
 * WebCrypto braucht einen sicheren Kontext (HTTPS oder localhost).
 */

export interface PowTask {
	salt: string;
	challenge: string;
	maxNumber: number;
	signature: string;
}

export interface PowAnswer {
	salt: string;
	challenge: string;
	number: number;
	signature: string;
}

const encoder = new TextEncoder();

function hex(buffer: ArrayBuffer): string {
	const bytes = new Uint8Array(buffer);
	let out = '';
	for (let i = 0; i < bytes.length; i++) out += bytes[i]!.toString(16).padStart(2, '0');
	return out;
}

/**
 * Zahl suchen; gibt alle `chunk` Versuche die Hauptschleife frei (Seite bleibt bedienbar).
 * `null`, wenn keine Zahl passt (manipulierte Aufgabe) oder abgebrochen wurde.
 */
export async function solvePow(
	task: PowTask,
	options: { signal?: AbortSignal; chunk?: number; subtle?: SubtleCrypto } = {}
): Promise<PowAnswer | null> {
	const subtle = options.subtle ?? globalThis.crypto.subtle;
	const chunk = options.chunk ?? 500;
	const max = Math.min(Math.max(0, Math.floor(task.maxNumber)), 10_000_000);
	for (let start = 0; start <= max; start += chunk) {
		if (options.signal?.aborted) return null;
		const end = Math.min(max, start + chunk - 1);
		const hashes = await Promise.all(
			Array.from({ length: end - start + 1 }, (_, i) =>
				subtle.digest('SHA-256', encoder.encode(`${task.salt}${start + i}`))
			)
		);
		const hit = hashes.findIndex((h) => hex(h) === task.challenge);
		if (hit >= 0) {
			return {
				salt: task.salt,
				challenge: task.challenge,
				number: start + hit,
				signature: task.signature
			};
		}
		await new Promise((resolve) => setTimeout(resolve, 0));
	}
	return null;
}
