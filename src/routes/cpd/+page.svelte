<script lang="ts">
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Seo from '$lib/components/Seo.svelte';

	interface Station {
		/** Jahr/Zeitraum als Zwischenüberschrift; `null` = einfache Liste */
		year: string | null;
		items: string[];
	}

	interface Epoch {
		title: string;
		stations: Station[];
		open?: boolean;
	}

	const epochs: Epoch[] = [
		{
			title: 'Ur-CP (vor 1921)',
			stations: [
				{
					year: '1909',
					items: [
						'Erste Anfänge der CP innerhalb des CVJM in Stuttgart',
						'Erster Gründer: Johann Knehr',
						'Erstes Pfadfinderbuch „Allzeit Bereit“ von Dr. Kertz',
						'Arbeit nach der Methode von Lord Baden-Powell'
					]
				},
				{
					year: '1912',
					items: [
						'Erste Satzung der CP von Pastor Köhler',
						'Erste Formen einer einheitlichen Tracht (Kluft)'
					]
				},
				{
					year: '1919',
					items: [
						'Kleinste Form heißt Gruppe, Gruppenführer kann nur ein Oberpfadfinder sein',
						'Das Pfadfinderkreuz (von Lt. Lohse im Krieg entworfen) wird eingeführt',
						'Gründung der „Tatgemeinschaft Sachsen“ (Karl Friede, Fritz Riebold)'
					]
				}
			]
		},
		{
			title: 'Historische CPD (1921–1945)',
			stations: [
				{
					year: '1921',
					items: [
						'Anerkennung innerhalb des CVJM wird erkämpft',
						'Führertagung in Neudietendorf (9./10. Juni)',
						'Verabschiedung der Grundsätze von Neudietendorf',
						'Zusammenschluss zum Bund „Christliche Pfadfinderschaft Deutschlands (CPD)“',
						'Erich Stange wird Reichsführer'
					]
				},
				{
					year: '1922–1929',
					items: [
						'Einführung von Ausweis, Proben, Reichsliederbuch, Ehrenpfadfinderschaft',
						'Neue Ständearbeit: Jungpfadfinder, Pfadfinder, Knappe, Späher',
						'Fritz Riebold: Späherbuch & Zeitschrift „Auf neuem Pfad“ (1922)',
						'Erste internationale Lager-Teilnahme (1925, Dänemark)',
						'Internationaler Gruß & Halstuch (1926)',
						'Kreuzlilie als Späherzeichen; Morgen- und Abendwache (1927)',
						'Pfadfinderhof Langemarck angemietet (1928)',
						'Endgültige Trennung vom CVJM; CPD eigenständig (1929)'
					]
				},
				{
					year: '1931–1934',
					items: [
						'Langemarck bei Wettmar erworben & eingeweiht (1931)',
						'Erste einheitliche Probenordnung; Gedanken zum Kreuzpfadfinder (1932)',
						'„Meißner Grundsätze“ (1933) – Bekenntnis gegen Gleichschaltung',
						'Opposition gegen Eingliederung in HJ; Aufbau Bruderschaft Ü18',
						'1934: Verbot der Jungenschaftsarbeit'
					]
				},
				{
					year: '1935–1944',
					items: [
						'Bruderschaftstreffen (Dassel, Bethel)',
						'1937: Verbot, Auflösung, Untergrundarbeit; Aufgabe Langemarck',
						'1938: Hof neu errichtet am Annateich (Hannover-Kirchrode)',
						'1944: fridu (Friedrich Duensing) stirbt'
					]
				}
			]
		},
		{
			title: 'Nachkriegs-CPD (1946–1973)',
			stations: [
				{
					year: null,
					items: [
						'1946: Führertagung Hannover; „Hohensolmser Erklärung“',
						'1947: heika (Heinrich Karsch) wird Bundesführer; Zeitschrift „Jungenland“',
						'1949: Gründung des RDP (CPD, DPSG, BDP)',
						'1950: Internationale Anerkennung des RDP',
						'1957: Teilnahme am World Jamboree',
						'1959/67: Burg Rieneck gepachtet/gekauft; 1962 „Grundsätze von Rieneck“',
						'1968–69: Führungswechsel; Beginn „moderner Zeiten“',
						'1970–73: Weg zum VCP; 1973 Gründung des VCP (Rechtsnachfolge CPD im RdP)'
					]
				}
			]
		},
		{
			title: 'Verbands-Phase im VCP (1973–1976)',
			stations: [
				{
					year: null,
					items: [
						'Arbeitskreise Nord/West; spätere Landesmarken & EJ tyrker',
						'1974: „Falkenhagener Erklärung“'
					]
				}
			]
		},
		{
			title: 'Neue CPD (1976–1996)',
			stations: [
				{
					year: null,
					items: [
						'1976: Gründungsthing CPD e.V. in Falkenhagen; Rüdiger Elsell Bundesführer',
						'1977: Deutscher Pfadfinderring (DPR) mit KPE & DPV',
						'1980–84: Führungswechsel; innere Spannungen; Zavelsteiner Erklärung (1984)',
						'1986: Ring Christlicher Pfadfinderschaften (RCP) gegründet',
						'1990–95: Annäherung CPD & CP 1921; gemeinsame Lager/Kurse',
						'1995: Beschluss zur Wiedervereinigung'
					]
				}
			]
		},
		{
			title: 'Heutige CPD (seit 1996)',
			open: true,
			stations: [
				{
					year: null,
					items: [
						'1996: Gründungsthing der wiedervereinigten CPD in St. Goarshausen; Beginn neuer Landesmark-Strukturen',
						'1997–2005: Aufbau Bundeshof Birkenfelde; Bundesfeste & Bundesfeuer',
						'2004: Bundeslager „panta rei – alles fließt“; erste Bundesführerin (wadu)',
						'2008: Bundeslager an den Gosheimer Baggerseen „Der Freiheit so nah“'
					]
				}
			]
		}
	];
</script>

<Seo
	title="Bund & Geschichte"
	description="Wir sind ein Stamm der CPD in der Landesmark Achter'n Diek im Gau Bremen. Überblick über Bund und Geschichte der Christlichen Pfadfinderschaft Deutschlands."
	image="/kreuzlilie.avif"
/>

<PageHeader
	eyebrow="Unser Bund"
	title="Christliche Pfadfinderschaft Deutschlands (CPD)"
	lead="Wir sind ein Stamm der CPD in der Landesmark Achter'n Diek im Gau Bremen."
/>

<div class="container-page section-y space-y-12">
	<section aria-labelledby="bund">
		<h2 id="bund" class="sr-only">Der Bund</h2>
		<div
			class="flex flex-col items-center gap-8 border border-gray-300 bg-white p-6 sm:flex-row sm:p-8"
		>
			<dl class="grow">
				<dt class="font-semibold text-gray-700">Name</dt>
				<dd class="mt-1 text-gray-600">Christliche Pfadfinderschaft Deutschlands e.V. (CPD)</dd>
			</dl>
			<img
				src="/kreuzlilie.avif"
				alt="Kreuzlilie der CPD e.V."
				width="160"
				height="160"
				class="h-40 w-auto shrink-0"
			/>
		</div>
	</section>

	<section aria-labelledby="geschichte">
		<h2 id="geschichte" class="text-2xl font-bold text-gray-800">Geschichte der CPD – Überblick</h2>
		<p class="mt-2 text-sm text-gray-600">
			Ein Auszug wichtiger Stationen des Bundes, nach Epochen gegliedert.
		</p>

		<div class="mt-8 space-y-3">
			{#each epochs as epoch (epoch.title)}
				<details class="group border border-gray-300 bg-white" open={epoch.open}>
					<summary
						class="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-lg font-semibold select-none hover:text-blue-600 sm:px-6 [&::-webkit-details-marker]:hidden"
					>
						{epoch.title}
						<svg
							class="size-5 shrink-0 text-gray-500 transition-transform group-open:rotate-180 motion-reduce:transition-none"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2"
							aria-hidden="true"
						>
							<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
						</svg>
					</summary>
					<div class="space-y-5 border-t border-gray-300 px-5 py-5 sm:px-6">
						{#each epoch.stations as station, i (i)}
							<div>
								{#if station.year}
									<h3 class="mb-2 text-base font-semibold text-gray-800">{station.year}</h3>
								{/if}
								<ul class="list-disc space-y-1.5 pl-6 leading-relaxed text-gray-800">
									{#each station.items as item, j (j)}
										<li>{item}</li>
									{/each}
								</ul>
							</div>
						{/each}
					</div>
				</details>
			{/each}
		</div>
	</section>
</div>
