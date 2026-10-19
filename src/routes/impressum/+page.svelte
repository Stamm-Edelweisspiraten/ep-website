<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Seo from '$lib/components/Seo.svelte';

	/**
	 * Kontaktadresse wie auf der alten Website übernommen.
	 * ACHTUNG: „edelweisspiaretn“ ist vermutlich ein Tippfehler für „edelweisspiraten“ – vom Stamm prüfen lassen.
	 */
	const IMPRINT_EMAIL = 'info@edelweisspiaretn-bremen.de';
</script>

<Seo
	title="Impressum"
	description="Impressum des Stamms Edelweißpiraten – rechtliche Informationen und Kontaktdaten unserer Pfadfinder-Website."
/>

<PageHeader eyebrow="Rechtliches" title="Impressum" />

<div class="container-page section-y">
	<div class="prose-site">
		<h2 id="m46">Diensteanbieter</h2>
		<p>
			Stamm Edelweißpiraten<br />
			Christliche Pfadfinderschaft Deutschland e.V.<br />
			Drakenburger Str. 42<br />
			28207 Bremen
		</p>

		<h2 id="m56">Kontaktmöglichkeiten</h2>
		<p>E-Mail-Adresse: <a href="mailto:{IMPRINT_EMAIL}">{IMPRINT_EMAIL}</a></p>

		<h2 id="m172">Social Media und andere Onlinepräsenzen</h2>
		<p>Dieses Impressum gilt auch für die folgenden Social-Media-Präsenzen und Onlineprofile:</p>
		<p>
			<a
				href="https://www.instagram.com/edelweisspiraten_cpd/"
				target="_blank"
				rel="noopener noreferrer">https://www.instagram.com/edelweisspiraten_cpd/</a
			>
		</p>

		<p class="mt-10 text-sm text-muted">
			<a
				href="https://datenschutz-generator.de/"
				title="Rechtstext von Dr. Schwenke – für weitere Informationen bitte anklicken."
				target="_blank"
				rel="noopener noreferrer nofollow"
			>
				Erstellt mit kostenlosem Datenschutz-Generator.de von Dr. Thomas Schwenke
			</a>
		</p>
	</div>
</div>
