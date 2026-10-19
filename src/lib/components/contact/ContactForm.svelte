<script lang="ts">
	import { env } from '$env/dynamic/public';

	interface Props {
		/** Nach erfolgreichem Versand (`?success=1`) */
		success?: boolean;
	}

	let { success = false }: Props = $props();

	/**
	 * Zieladresse des Kontaktformulars (formsubmit.co) – unverändert von der alten Website übernommen.
	 * ACHTUNG: „kotakt@“ ist vermutlich ein Tippfehler für „kontakt@“. Bewusst nicht korrigiert, bis der
	 * Stamm entschieden hat (formsubmit.co verlangt für eine neue Adresse eine erneute Bestätigung).
	 */
	const FORM_RECIPIENT = 'kotakt@edelweisspiraten-bremen.de';

	/** Öffentliche Adresse dieser Website für die Rückleitung nach dem Versand */
	const FALLBACK_SITE = 'https://edelweisspiraten-bremen.de';
	const site = $derived((env.PUBLIC_SITE_URL || FALLBACK_SITE).replace(/\/+$/, ''));
	const nextUrl = $derived(`${site}/kontakt?success=1#kontaktformular`);

	const input =
		'w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-base text-ink placeholder:text-muted/70 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 focus:outline-none';
	const labelClass = 'mb-1.5 block text-sm font-medium text-ink';
</script>

{#if success}
	<div
		class="mb-6 rounded-card border border-brand-200 bg-brand-50 p-4 text-brand-900 sm:p-5"
		role="status"
	>
		<p>
			<strong>Danke!</strong> Deine Nachricht wurde erfolgreich versendet. Wir melden uns so schnell wie
			möglich.
		</p>
	</div>
{/if}

<form
	action="https://formsubmit.co/{FORM_RECIPIENT}"
	method="POST"
	class="space-y-5 rounded-card border border-line bg-surface p-6 shadow-card sm:p-8"
>
	<!-- FormSubmit-Optionen -->
	<input type="hidden" name="_subject" value="Neue Nachricht – Stamm Edelweißpiraten" />
	<input type="hidden" name="_template" value="table" />
	<input type="hidden" name="_captcha" value="false" />
	<input type="hidden" name="_next" value={nextUrl} />
	<input
		type="hidden"
		name="_autoresponse"
		value="Danke für deine Nachricht an den Stamm Edelweißpiraten. Wir melden uns zeitnah zurück."
	/>

	<!-- Honeypot (Spam-Schutz): für Menschen unsichtbar, Bots füllen es aus -->
	<div class="hidden" aria-hidden="true">
		<label for="kontakt-honey">Nicht ausfüllen</label>
		<input id="kontakt-honey" type="text" name="_honey" tabindex="-1" autocomplete="off" />
	</div>

	<p class="text-sm text-muted">
		Mit <span aria-hidden="true">*</span> markierte Felder sind Pflichtfelder.
	</p>

	<div class="grid gap-5 md:grid-cols-2">
		<div>
			<label for="kontakt-name" class={labelClass}>Name <span aria-hidden="true">*</span></label>
			<input
				id="kontakt-name"
				name="name"
				type="text"
				required
				autocomplete="name"
				maxlength="200"
				class={input}
			/>
		</div>
		<div>
			<label for="kontakt-email" class={labelClass}>E-Mail <span aria-hidden="true">*</span></label>
			<input
				id="kontakt-email"
				name="email"
				type="email"
				required
				autocomplete="email"
				inputmode="email"
				maxlength="254"
				class={input}
			/>
		</div>
		<div class="md:col-span-2">
			<label for="kontakt-telefon" class={labelClass}>
				Telefon <span class="font-normal text-muted">(optional)</span>
			</label>
			<input
				id="kontakt-telefon"
				name="phone"
				type="tel"
				autocomplete="tel"
				maxlength="50"
				class={input}
			/>
		</div>
		<div class="md:col-span-2">
			<label for="kontakt-nachricht" class={labelClass}>
				Nachricht <span aria-hidden="true">*</span>
			</label>
			<textarea
				id="kontakt-nachricht"
				name="message"
				rows="6"
				required
				maxlength="5000"
				class="{input} min-h-36"></textarea>
		</div>
		<div class="flex items-start gap-3 md:col-span-2">
			<input
				id="kontakt-einwilligung"
				type="checkbox"
				required
				class="mt-1 size-5 shrink-0 accent-brand-700"
			/>
			<label for="kontakt-einwilligung" class="text-sm leading-relaxed text-ink/85">
				Ich habe die <a class="link" href="/datenschutz">Hinweise zum Datenschutz</a> gelesen und
				bin einverstanden, dass meine Angaben zur Kontaktaufnahme verarbeitet werden.
				<span aria-hidden="true">*</span>
			</label>
		</div>
	</div>

	<p class="text-xs leading-relaxed text-muted">
		Das Formular wird über den Dienst formsubmit.co versendet. Deine Angaben nutzen wir nur, um
		deine Anfrage zu beantworten.
	</p>

	<button type="submit" class="btn btn-primary">
		Nachricht senden
		<svg
			class="size-4"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			aria-hidden="true"
		>
			<path stroke-linecap="round" stroke-linejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
		</svg>
	</button>
</form>
