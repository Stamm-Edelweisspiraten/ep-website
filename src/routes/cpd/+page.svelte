<script>
	import Icon from '$lib/components/Icon.svelte';
	import Seo from '$lib/components/Seo.svelte';

	// Geschichte der CPD als Zeitstrahl: je Epoche Einträge mit Jahr und Text (mehrere Punkte eines Jahres als Liste).
	const history = [
		{
			id: 'ur-cp',
			epoch: 'Ur-CP',
			period: 'vor 1921',
			entries: [
				{
					year: '1909',
					text: [
						'Erste Anfänge der CP innerhalb des CVJM in Stuttgart',
						'Erster Gründer: Johann Knehr',
						'Erstes Pfadfinderbuch „Allzeit Bereit“ von Dr. Kertz',
						'Arbeit nach der Methode von Lord Baden-Powell'
					]
				},
				{
					year: '1912',
					text: [
						'Erste Satzung der CP von Pastor Köhler',
						'Erste Formen einer einheitlichen Tracht (Kluft)'
					]
				},
				{
					year: '1919',
					text: [
						'Kleinste Form heißt Gruppe, Gruppenführer kann nur ein Oberpfadfinder sein',
						'Das Pfadfinderkreuz (von Lt. Lohse im Krieg entworfen) wird eingeführt',
						'Gründung der „Tatgemeinschaft Sachsen“ (Karl Friede, Fritz Riebold)'
					]
				}
			]
		},
		{
			id: 'historische-cpd',
			epoch: 'Historische CPD',
			period: '1921–1945',
			entries: [
				{
					year: '1921',
					text: [
						'Anerkennung innerhalb des CVJM wird erkämpft',
						'Führertagung in Neudietendorf (9./10. Juni)',
						'Verabschiedung der Grundsätze von Neudietendorf',
						'Zusammenschluss zum Bund „Christliche Pfadfinderschaft Deutschlands (CPD)“',
						'Erich Stange wird Reichsführer'
					]
				},
				{
					year: '1922–1929',
					text: [
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
					text: [
						'Langemarck bei Wettmar erworben & eingeweiht (1931)',
						'Erste einheitliche Probenordnung; Gedanken zum Kreuzpfadfinder (1932)',
						'„Meißner Grundsätze“ (1933) – Bekenntnis gegen Gleichschaltung',
						'Opposition gegen Eingliederung in HJ; Aufbau Bruderschaft Ü18',
						'1934: Verbot der Jungenschaftsarbeit'
					]
				},
				{
					year: '1935–1944',
					text: [
						'Bruderschaftstreffen (Dassel, Bethel)',
						'1937: Verbot, Auflösung, Untergrundarbeit; Aufgabe Langemarck',
						'1938: Hof neu errichtet am Annateich (Hannover-Kirchrode)',
						'1944: fridu (Friedrich Duensing) stirbt'
					]
				}
			]
		},
		{
			id: 'nachkriegs-cpd',
			epoch: 'Nachkriegs-CPD',
			period: '1946–1973',
			entries: [
				{ year: '1946', text: ['Führertagung Hannover; „Hohensolmser Erklärung“'] },
				{
					year: '1947',
					text: ['heika (Heinrich Karsch) wird Bundesführer; Zeitschrift „Jungenland“']
				},
				{ year: '1949', text: ['Gründung des RDP (CPD, DPSG, BDP)'] },
				{ year: '1950', text: ['Internationale Anerkennung des RDP'] },
				{ year: '1957', text: ['Teilnahme am World Jamboree'] },
				{
					year: '1959/67',
					text: ['Burg Rieneck gepachtet/gekauft; 1962 „Grundsätze von Rieneck“']
				},
				{ year: '1968–69', text: ['Führungswechsel; Beginn „moderner Zeiten“'] },
				{
					year: '1970–73',
					text: ['Weg zum VCP; 1973 Gründung des VCP (Rechtsnachfolge CPD im RdP)']
				}
			]
		},
		{
			id: 'vcp-phase',
			epoch: 'Verbands-Phase im VCP',
			period: '1973–1976',
			entries: [
				{ year: '', text: ['Arbeitskreise Nord/West; spätere Landesmarken & EJ tyrker'] },
				{ year: '1974', text: ['„Falkenhagener Erklärung“'] }
			]
		},
		{
			id: 'neue-cpd',
			epoch: 'Neue CPD',
			period: '1976–1996',
			entries: [
				{
					year: '1976',
					text: ['Gründungsthing CPD e.V. in Falkenhagen; Rüdiger Elsell Bundesführer']
				},
				{ year: '1977', text: ['Deutscher Pfadfinderring (DPR) mit KPE & DPV'] },
				{
					year: '1980–84',
					text: ['Führungswechsel; innere Spannungen; Zavelsteiner Erklärung (1984)']
				},
				{ year: '1986', text: ['Ring Christlicher Pfadfinderschaften (RCP) gegründet'] },
				{ year: '1990–95', text: ['Annäherung CPD & CP 1921; gemeinsame Lager/Kurse'] },
				{ year: '1995', text: ['Beschluss zur Wiedervereinigung'] }
			]
		},
		{
			id: 'heutige-cpd',
			epoch: 'Heutige CPD',
			period: 'seit 1996',
			entries: [
				{
					year: '1996',
					text: [
						'Gründungsthing der wiedervereinigten CPD in St. Goarshausen; Beginn neuer Landesmark-Strukturen'
					]
				},
				{ year: '1997–2005', text: ['Aufbau Bundeshof Birkenfelde; Bundesfeste & Bundesfeuer'] },
				{
					year: '2004',
					text: ['Bundeslager „panta rei – alles fließt“; erste Bundesführerin (wadu)']
				},
				{ year: '2008', text: ['Bundeslager an den Gosheimer Baggerseen „Der Freiheit so nah“'] }
			]
		}
	];
	const lastEra = history.length - 1;
	const lastEntry = history[lastEra].entries.length - 1;
	/** Maschinenlesbares `datetime` nur bei einem einzelnen Jahr. */
	const datetimeOf = (/** @type {string} */ y) => (/^\d{4}$/.test(y) ? y : undefined);
</script>

<Seo
	title="Unser Bund (CPD) – Stamm Edelweißpiraten"
	description="Wir sind ein Stamm der CPD in der Landesmark Achter'n Diek im Gau Bremen. Überblick über Bund und Geschichte der Christlichen Pfadfinderschaft Deutschlands."
	path="/cpd"
	breadcrumbs={[{ name: 'Unser Bund (CPD)', path: '/cpd' }]}
/>

<section class="site-container" aria-labelledby="h-cpd">
	<nav class="crumbs" aria-label="Brotkrümel">
		<a href="/">Start</a><Icon name="chevron-right" size={18} /><span aria-current="page"
			>Unser Bund</span
		>
	</nav>
	<div class="chead">
		<div class="t">
			<p class="strong">Christliche Pfadfinderschaft Deutschlands e. V.</p>
			<h1 class="display" id="h-cpd">Unser Bund:<br />die CPD</h1>
			<p class="lede">Wir sind ein Stamm der CPD in der Landesmark Achter'n Diek im Gau Bremen.</p>
			<div class="acts">
				<a class="pill" href="#geschichte">Zur Geschichte</a><a class="pill soft" href="/team"
					>Unser Team</a
				>
			</div>
		</div>
		<div class="seal">
			<img
				src="/kreuzlilie.avif"
				alt="Kreuzlilie der CPD e. V."
				width="1295"
				height="1656"
				decoding="async"
			/>
		</div>
	</div>
</section>

<section class="site-container section-gap" aria-labelledby="h-aufbau">
	<h2 class="h-xl" id="h-aufbau" style="margin-bottom: 24px">So sind wir aufgebaut</h2>
	<ol class="chain">
		<li class="step">
			<span class="lv">Bund</span><span class="n">Christliche Pfadfinderschaft Deutschlands</span
			><span class="ar" aria-hidden="true"><Icon name="chevron-right" size={18} /></span>
		</li>
		<li class="step">
			<span class="lv">Landesmark</span><span class="n">Achter'n Diek</span><span
				class="ar"
				aria-hidden="true"><Icon name="chevron-right" size={18} /></span
			>
		</li>
		<li class="step">
			<span class="lv">Gau</span><span class="n">Bremen</span><span class="ar" aria-hidden="true"
				><Icon name="chevron-right" size={18} /></span
			>
		</li>
		<li class="step here">
			<span class="lv">Stamm</span><span class="n">Edelweißpiraten</span><span class="cap"
				>Bremen-Hastedt</span
			><span class="ar" aria-hidden="true"><Icon name="chevron-right" size={18} /></span>
		</li>
		<li class="step">
			<span class="lv">Gruppen</span><span class="n">Meute und Sippen</span><a
				class="ulink"
				href="/#gruppen"
				style="margin-top: auto">Unsere Gruppen</a
			>
		</li>
	</ol>
</section>

<section class="site-container section-gap" id="geschichte" aria-labelledby="h-geschichte">
	<div class="intro2">
		<h2 class="h-xl" id="h-geschichte">Geschichte der CPD</h2>
		<p class="r">Ein Auszug wichtiger Stationen des Bundes, nach Epochen gegliedert.</p>
	</div>

	<ol class="timeline">
		{#each history as era, ei (era.id)}
			<li class="era" id={era.id}>
				<div class="ehead">
					<span class="period cap">{era.period}</span>
					<span class="node" aria-hidden="true"></span>
					<h3>{era.epoch} <span class="sr-only">({era.period})</span></h3>
				</div>
				<ol class="entries">
					{#each era.entries as entry, i (i)}
						{@const latest = ei === lastEra && i === lastEntry}
						<li class="entry" class:latest>
							{#if entry.year}<time class="yr" datetime={datetimeOf(entry.year)}>{entry.year}</time
								>{:else}<span class="yr" aria-hidden="true"></span>{/if}
							<span class="dot" aria-hidden="true"></span>
							<div class="card">
								{#if entry.text.length === 1}
									<p>{entry.text[0]}</p>
								{:else}
									<ul>
										{#each entry.text as t, k (k)}<li>{t}</li>{/each}
									</ul>
								{/if}
							</div>
						</li>
					{/each}
				</ol>
			</li>
		{/each}
	</ol>
</section>

<style>
	.chead {
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		gap: 24px;
		align-items: center;
		padding-top: 24px;
	}
	.chead .t {
		grid-column: 1 / span 7;
		display: flex;
		flex-direction: column;
		gap: 22px;
		align-items: flex-start;
	}
	.chead h1 {
		font-size: clamp(72px, 8.4vw, 128px);
	}
	.lede {
		font-size: 19px;
		color: var(--color-body);
		max-width: 48ch;
	}
	.seal {
		grid-column: 9 / span 4;
		background: var(--color-subtle);
		aspect-ratio: 1 / 1;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.seal img {
		width: 46%;
		height: auto;
		display: block;
	}
	.chain {
		display: grid;
		grid-template-columns: repeat(5, minmax(0, 1fr));
		gap: 8px;
	}
	.step {
		background: var(--color-subtle);
		padding: 24px;
		display: flex;
		flex-direction: column;
		gap: 12px;
		position: relative;
		min-height: 180px;
	}
	.step.here {
		background: var(--color-ink);
		color: var(--color-on-ink);
	}
	.step.here .cap,
	.step.here .lv {
		color: inherit;
		opacity: 0.75;
	}
	.lv {
		font-size: 14px;
		color: var(--color-muted);
	}
	.n {
		font-size: 20px;
		font-weight: 500;
		line-height: 1.25;
	}
	.ar {
		position: absolute;
		right: -20px;
		top: 50%;
		transform: translateY(-50%);
		width: 32px;
		height: 32px;
		border-radius: 50%;
		background: var(--color-page);
		color: var(--color-ink);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1;
	}
	.intro2 {
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		gap: 24px;
		align-items: baseline;
		margin-bottom: 32px;
	}
	.intro2 h2 {
		grid-column: 1 / span 5;
	}
	.intro2 .r {
		grid-column: 7 / span 6;
		font-size: 17px;
		color: var(--color-body);
	}
	/* Zeitstrahl: Jahr | Linie mit Punkt | Text */
	.timeline {
		--yw: 150px;
		--lw: 24px;
		--gap: 20px;
		position: relative;
		display: flex;
		flex-direction: column;
		gap: 48px;
	}
	.timeline::before {
		content: '';
		position: absolute;
		top: 12px;
		bottom: 12px;
		left: calc(var(--yw) + var(--gap) + var(--lw) / 2 - 1px);
		width: 2px;
		background: var(--color-subtle-2);
	}
	.ehead,
	.entry {
		display: grid;
		grid-template-columns: var(--yw) var(--lw) minmax(0, 1fr);
		column-gap: var(--gap);
		align-items: start;
	}
	.era {
		scroll-margin-top: 96px;
	}
	.ehead {
		align-items: center;
		margin-bottom: 16px;
	}
	.period {
		text-align: right;
		font-variant-numeric: tabular-nums;
	}
	.node {
		position: relative;
		justify-self: center;
		width: 24px;
		height: 24px;
		border-radius: 50%;
		background: var(--color-page);
		display: flex;
		align-items: center;
		justify-content: center;
	}
	.node::after {
		content: '';
		width: 14px;
		height: 14px;
		background: var(--color-ink);
	}
	.ehead h3 {
		font-size: 24px;
		font-weight: 500;
		line-height: 1.25;
	}
	.entries {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.yr {
		padding-top: 17px;
		text-align: right;
		font-size: 18px;
		font-weight: 600;
		line-height: 1.4;
		color: var(--color-ink);
		font-variant-numeric: tabular-nums;
	}
	.dot {
		position: relative;
		justify-self: center;
		margin-top: 23px;
		width: 14px;
		height: 14px;
		border-radius: 50%;
		background: var(--color-page);
	}
	.dot::after {
		content: '';
		position: absolute;
		inset: 3px;
		border-radius: 50%;
		background: var(--color-muted);
	}
	.card {
		background: var(--color-subtle);
		padding: 18px 22px;
		color: var(--color-body);
		line-height: 1.55;
	}
	.card ul {
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
	.card li {
		position: relative;
		padding-left: 18px;
	}
	.card li::before {
		content: '';
		position: absolute;
		left: 0;
		top: 0.7em;
		width: 6px;
		height: 6px;
		border-radius: 50%;
		background: var(--color-muted);
	}
	.entry.latest .yr {
		color: var(--color-ink);
	}
	.entry.latest .card {
		background: var(--color-ink);
		color: var(--color-on-ink);
	}
	.entry.latest .card li::before {
		background: currentColor;
	}
	.entry.latest .dot {
		margin-top: 20px;
		width: 20px;
		height: 20px;
	}
	.entry.latest .dot::after {
		inset: 2px;
		background: var(--color-ink);
	}
	@media (max-width: 62rem) {
		.chain {
			grid-template-columns: 1fr;
		}
		.step {
			min-height: 0;
		}
		.ar {
			right: auto;
			left: 50%;
			top: auto;
			bottom: -20px;
			transform: translateX(-50%) rotate(90deg);
		}
	}
	@media (max-width: 50rem) {
		.chead .t,
		.seal,
		.intro2 h2,
		.intro2 .r {
			grid-column: 1 / -1;
		}
		.chead h1 {
			font-size: clamp(56px, 17vw, 96px);
		}
		.seal {
			aspect-ratio: 16 / 10;
		}
		.timeline {
			--yw: 0px;
			--lw: 20px;
			--gap: 14px;
			gap: 40px;
		}
		.timeline::before {
			left: calc(var(--lw) / 2 - 1px);
		}
		.ehead,
		.entry {
			grid-template-columns: var(--lw) minmax(0, 1fr);
			grid-template-rows: auto auto;
		}
		.ehead {
			row-gap: 2px;
		}
		.ehead .node {
			grid-column: 1;
			grid-row: 1 / span 2;
			width: 20px;
			height: 20px;
		}
		.ehead .node::after {
			width: 12px;
			height: 12px;
		}
		.ehead h3 {
			grid-column: 2;
			grid-row: 1;
			font-size: 22px;
		}
		.period {
			grid-column: 2;
			grid-row: 2;
			text-align: left;
		}
		.entry {
			row-gap: 6px;
		}
		.yr {
			grid-column: 2;
			grid-row: 1;
			padding-top: 0;
			text-align: left;
			font-size: 16px;
		}
		span.yr {
			display: none;
		}
		.dot {
			grid-column: 1;
			grid-row: 1;
			margin-top: 5px;
		}
		.entry.latest .dot {
			margin-top: 2px;
		}
		.card {
			grid-column: 2;
			grid-row: 2;
			padding: 16px 18px;
		}
	}
</style>
