/**
 * Minimaler SMTP-Client für das Kontaktformular (#31) – nur Node-Bordmittel (`node:net`, `node:tls`), keine Abhängigkeit.
 * Rein (ohne SvelteKit-Importe), getestet mit einem Test-Server in `tests/unit/website-contact.test.ts`.
 *
 * Unterstützt: direktes TLS (Port 465, `secure`), STARTTLS (Port 587/25; Pflicht, sobald angemeldet wird),
 * AUTH PLAIN/LOGIN, genau einen Absender und feste Empfänger. Die Nachricht muss fertig aufgebaut sein
 * (`contact.ts` → `buildContactMessage`); hier wird nur noch Punkt-Maskierung („dot-stuffing“) angewendet.
 */
import net from 'node:net';
import tls from 'node:tls';

export interface SmtpConfig {
	host: string;
	port: number;
	/** Direktes TLS (Port 465). Sonst Klartext mit STARTTLS, falls angeboten (mit Anmeldung Pflicht). */
	secure: boolean;
	user?: string;
	pass?: string;
	/** Name für EHLO (Standard `localhost`) */
	clientName?: string;
	timeoutMs?: number;
	/** Nur für Tests/lokale Relays: Zertifikat nicht prüfen bzw. Anmeldung ohne TLS erlauben */
	insecure?: boolean;
}

export class SmtpError extends Error {}

interface Reply {
	code: number;
	text: string;
	lines: string[];
}

class Connection {
	private socket: net.Socket | tls.TLSSocket;
	private buffer = '';
	private lines: string[] = [];
	private waiting: { resolve: (line: string) => void; reject: (e: Error) => void } | null = null;
	private failure: Error | null = null;
	private readonly onData = (chunk: Buffer) => {
		this.buffer += chunk.toString('utf8');
		let i: number;
		while ((i = this.buffer.indexOf('\n')) >= 0) {
			const line = this.buffer.slice(0, i).replace(/\r$/, '');
			this.buffer = this.buffer.slice(i + 1);
			if (this.waiting) {
				const w = this.waiting;
				this.waiting = null;
				w.resolve(line);
			} else this.lines.push(line);
		}
		if (this.buffer.length > 64 * 1024) this.fail(new SmtpError('Antwort des Mailservers zu lang'));
	};
	private readonly onError = (e: Error) => this.fail(new SmtpError(`Mailserver: ${e.message}`));
	private readonly onClose = () => this.fail(new SmtpError('Verbindung zum Mailserver geschlossen'));

	constructor(
		socket: net.Socket | tls.TLSSocket,
		private readonly timeoutMs: number
	) {
		this.socket = socket;
		this.attach(socket);
	}

	private attach(socket: net.Socket | tls.TLSSocket) {
		socket.on('data', this.onData);
		socket.on('error', this.onError);
		socket.on('close', this.onClose);
		socket.setTimeout(this.timeoutMs, () => {
			this.fail(new SmtpError('Zeitüberschreitung beim Mailserver'));
			socket.destroy();
		});
	}

	private detach(socket: net.Socket | tls.TLSSocket) {
		socket.off('data', this.onData);
		socket.off('error', this.onError);
		socket.off('close', this.onClose);
		socket.setTimeout(0);
	}

	private fail(e: Error) {
		if (!this.failure) this.failure = e;
		if (this.waiting) {
			const w = this.waiting;
			this.waiting = null;
			w.reject(this.failure);
		}
	}

	private readLine(): Promise<string> {
		const queued = this.lines.shift();
		if (queued !== undefined) return Promise.resolve(queued);
		if (this.failure) return Promise.reject(this.failure);
		return new Promise((resolve, reject) => (this.waiting = { resolve, reject }));
	}

	async reply(): Promise<Reply> {
		const lines: string[] = [];
		for (;;) {
			const line = await this.readLine();
			const m = /^(\d{3})([ -])(.*)$/.exec(line);
			if (!m) throw new SmtpError('Ungültige Antwort des Mailservers');
			lines.push(m[3]!);
			if (m[2] === ' ') return { code: Number(m[1]), text: lines.join(' '), lines };
			if (lines.length > 100) throw new SmtpError('Antwort des Mailservers zu lang');
		}
	}

	write(data: string) {
		if (this.failure) throw this.failure;
		this.socket.write(data);
	}

	/** `label` = Name des Befehls in Fehlermeldungen (nie Zugangsdaten ausgeben) */
	async command(line: string, expect: number[], label = line.split(' ')[0]): Promise<Reply> {
		this.write(`${line}\r\n`);
		const r = await this.reply();
		if (!expect.includes(r.code)) throw new SmtpError(`Mailserver lehnt ${label} ab (${r.code})`);
		return r;
	}

	async upgrade(host: string, insecure: boolean) {
		const raw = this.socket;
		this.detach(raw);
		const secured = await new Promise<tls.TLSSocket>((resolve, reject) => {
			const s = tls.connect({ socket: raw, servername: host, rejectUnauthorized: !insecure }, () =>
				resolve(s)
			);
			s.once('error', reject);
		});
		this.socket = secured;
		this.attach(secured);
	}

	close() {
		this.detach(this.socket);
		this.socket.on('error', () => {});
		this.socket.end();
	}
}

function connect(cfg: SmtpConfig, timeoutMs: number): Promise<net.Socket | tls.TLSSocket> {
	return new Promise((resolve, reject) => {
		const onError = (e: Error) => reject(new SmtpError(`Mailserver nicht erreichbar: ${e.message}`));
		const timer = setTimeout(() => {
			socket.destroy();
			reject(new SmtpError('Zeitüberschreitung beim Verbinden mit dem Mailserver'));
		}, timeoutMs);
		const done = () => {
			clearTimeout(timer);
			socket.off('error', onError);
			resolve(socket);
		};
		const socket = cfg.secure
			? tls.connect(
					{
						host: cfg.host,
						port: cfg.port,
						servername: cfg.host,
						rejectUnauthorized: !cfg.insecure
					},
					done
				)
			: net.connect({ host: cfg.host, port: cfg.port }, done);
		socket.once('error', (e) => {
			clearTimeout(timer);
			onError(e);
		});
	});
}

/** Punkt am Zeilenanfang verdoppeln, Zeilenenden auf CRLF bringen (RFC 5321 4.5.2). */
export function dotStuff(message: string): string {
	return message
		.replace(/\r?\n/g, '\r\n')
		.split('\r\n')
		.map((line) => (line.startsWith('.') ? `.${line}` : line))
		.join('\r\n');
}

const ADDRESS_RE = /^[^\s<>()[\]\\,;:"@]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;

/** Eine Nachricht an feste Empfänger zustellen. Wirft `SmtpError` bei jedem Fehler. */
export async function sendMail(
	cfg: SmtpConfig,
	envelope: { from: string; to: string[] },
	message: string
): Promise<void> {
	for (const address of [envelope.from, ...envelope.to]) {
		if (!ADDRESS_RE.test(address)) throw new SmtpError('Ungültige Adresse in der Mail-Konfiguration');
	}
	if (envelope.to.length === 0) throw new SmtpError('Kein Empfänger konfiguriert');
	const timeoutMs = cfg.timeoutMs ?? 15_000;
	const clientName = /^[A-Za-z0-9.-]{1,253}$/.test(cfg.clientName ?? '')
		? cfg.clientName!
		: 'localhost';
	const conn = new Connection(await connect(cfg, timeoutMs), timeoutMs);
	try {
		const greeting = await conn.reply();
		if (greeting.code !== 220) throw new SmtpError(`Mailserver nicht bereit (${greeting.code})`);
		let ehlo = await conn.command(`EHLO ${clientName}`, [250]);
		let secured = cfg.secure;
		const offersTls = ehlo.lines.some((l) => /^STARTTLS\b/i.test(l));
		if (!secured && offersTls) {
			await conn.command('STARTTLS', [220]);
			await conn.upgrade(cfg.host, !!cfg.insecure);
			secured = true;
			ehlo = await conn.command(`EHLO ${clientName}`, [250]);
		}
		if (cfg.user) {
			if (!secured && !cfg.insecure) {
				throw new SmtpError('Mailserver bietet kein TLS an – Anmeldung im Klartext abgelehnt');
			}
			const auth = ehlo.lines.find((l) => /^AUTH\b/i.test(l))?.toUpperCase() ?? '';
			if (/\bPLAIN\b/.test(auth) || !/\bLOGIN\b/.test(auth)) {
				const token = Buffer.from(`\0${cfg.user}\0${cfg.pass ?? ''}`, 'utf8').toString('base64');
				await conn.command(`AUTH PLAIN ${token}`, [235], 'AUTH');
			} else {
				await conn.command('AUTH LOGIN', [334]);
				await conn.command(Buffer.from(cfg.user, 'utf8').toString('base64'), [334], 'AUTH');
				await conn.command(Buffer.from(cfg.pass ?? '', 'utf8').toString('base64'), [235], 'AUTH');
			}
		}
		await conn.command(`MAIL FROM:<${envelope.from}>`, [250]);
		for (const to of envelope.to) await conn.command(`RCPT TO:<${to}>`, [250, 251]);
		await conn.command('DATA', [354]);
		const body = dotStuff(message);
		conn.write(body.endsWith('\r\n') ? body : `${body}\r\n`);
		await conn.command('.', [250]);
		await conn.command('QUIT', [221]).catch(() => undefined);
	} finally {
		conn.close();
	}
}
