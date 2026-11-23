// Spendenkonto für die Seite `/spenden`. Leere IBAN = Kontodaten werden nicht angezeigt, die Seite verweist
// stattdessen auf die Kasse (E-Mail aus dem Amt im Intern-Bereich).
export const DONATION_ACCOUNT = {
	/** Kontoinhaber*in, z. B. „Christliche Pfadfinderschaft Deutschlands e. V. – Stamm Edelweißpiraten“ */
	holder: 'Christliche Pfadfinderschaft Bremen e.V. (C P Bremen)',
	/** mit oder ohne Leerzeichen */
	iban: 'DE75 5206 0410 0506 4394 38',
	bic: 'ENODEF1EK1',
	bank: 'Evangelische Bank',
	/** Vorschlag für den Verwendungszweck */
	reference: 'Spende Stamm Edelweißpiraten'
};

/** Rein: IBAN ohne Leerzeichen, Großbuchstaben */
export function compactIban(iban: string): string {
	return iban.replace(/\s+/g, '').toUpperCase();
}

/** Rein: IBAN in Vierergruppen („DE12 3456 …“) */
export function formatIban(iban: string): string {
	return compactIban(iban).replace(/(.{4})(?=.)/g, '$1 ');
}

/** Rein: Amt der Kasse bzw. Materialwart*in am Namen erkennen */
export const TREASURER_RE = /kass(e|ier|enwart)|schatzmeist|finanz/i;
export const MATERIAL_RE = /material/i;
