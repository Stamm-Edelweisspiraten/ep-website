<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Icon from '$lib/components/Icon.svelte';
	import MonthCalendar from '$lib/components/MonthCalendar.svelte';
	import TagMenu from '$lib/components/TagMenu.svelte';
	import Seo from '$lib/components/Seo.svelte';
	import { dayParts, formatDateRange, formatMonth, formatTimeRange, isMultiDay } from '$lib/dates';
	import {
		collectGroups,
		collectTags,
		eventColor,
		filterEvents,
		groupByMonth,
		splitSingles,
		summarizeSeries
	} from '$lib/event-view';
	import type { SiteEvent } from '$lib/site-types';
	import type { PageData } from './$types';

	export let data: PageData;

	type View = 'kalender' | 'kacheln' | 'liste';
	const VIEWS: { id: View; label: string; icon: 'calendar' | 'grid' | 'list' }[] = [
		{ id: 'kalender', label: 'Kalender', icon: 'calendar' },
		{ id: 'kacheln', label: 'Kacheln', icon: 'grid' },
		{ id: 'liste', label: 'Liste', icon: 'list' }
	];
	const VIEW_KEY = 'termine:ansicht';
	const PAGE_SIZE = 12;

	const groups = collectGroups(data.events);
	const tags = collectTags(data.events);

	// --- Zustand aus der URL (alte Links `?tags=<Name>&year=` der Gruppenseiten bleiben gültig)
	const params = $page.url.searchParams;
	const lower = (v: string) => v.trim().toLocaleLowerCase('de-DE');
	const legacy = params.getAll('tags').map(lower);
	const wantedGroups = [...params.getAll('gruppe').map(lower), ...legacy];
	const wantedTags = [...params.getAll('thema').map(lower), ...legacy];

	let view: View = (VIEWS.find((v) => v.id === params.get('ansicht'))?.id ?? 'kalender') as View;
	let selectedGroups = groups.filter((g) => wantedGroups.includes(lower(g.name))).map((g) => g.id);
	let selectedTags = tags.filter((t) => wantedTags.includes(lower(t)));
	let q = params.get('q') ?? '';
	let month = /^\d{4}-\d{2}$/.test(params.get('monat') ?? '')
		? params.get('monat')!
		: data.today.slice(0, 7);
	let showPast = false;
	let visibleCount = PAGE_SIZE;

	$: filtered = filterEvents(data.events, { groups: selectedGroups, tags: selectedTags, q });
	$: series = summarizeSeries(filtered, data.today);
	$: singles = splitSingles(filtered, data.today);
	$: upcomingShown = singles.upcoming.slice(0, visibleCount);
	$: calendarItems = filtered.map((e) => ({
		id: e.id,
		key: e.key,
		href: `/termine/${e.key}`,
		title: e.title,
		color: eventColor(e),
		startsOn: e.startsOn,
		startsTime: e.startsTime,
		endsOn: e.endsOn,
		endsTime: e.endsTime,
		recurring: e.recurring
	}));
	$: filterActive = selectedGroups.length > 0 || selectedTags.length > 0 || q.trim() !== '';

	// --- URL aktuell halten (ohne neuen Verlaufseintrag)
	let ready = false;
	$: if (ready) syncUrl(view, selectedGroups, selectedTags, q, month);

	function syncUrl(v: View, gs: string[], ts: string[], text: string, m: string) {
		if (!browser) return;
		const next = new URLSearchParams();
		if (v !== 'kalender') next.set('ansicht', v);
		for (const id of gs) {
			const g = groups.find((x) => x.id === id);
			if (g) next.append('gruppe', g.name);
		}
		for (const t of ts) next.append('thema', t);
		if (text.trim()) next.set('q', text.trim());
		if (v === 'kalender' && m !== data.today.slice(0, 7)) next.set('monat', m);
		const qs = next.toString();
		if (qs === $page.url.searchParams.toString()) return;
		goto(`/termine${qs ? `?${qs}` : ''}`, { replaceState: true, keepFocus: true, noScroll: true });
	}

	function setView(v: View) {
		view = v;
		try {
			localStorage.setItem(VIEW_KEY, v);
		} catch {
			// ohne Speicher (privater Modus) nur für diesen Besuch
		}
	}

	function toggle<T>(list: T[], value: T): T[] {
		return list.includes(value) ? list.filter((x) => x !== value) : [...list, value];
	}

	function resetFilters() {
		selectedGroups = [];
		selectedTags = [];
		q = '';
		visibleCount = PAGE_SIZE;
	}

	function timeOf(e: SiteEvent) {
		return formatTimeRange(e.startsTime, e.endsTime, isMultiDay(e));
	}

	onMount(() => {
		if (!params.get('ansicht')) {
			try {
				const saved = localStorage.getItem(VIEW_KEY);
				if (saved && VIEWS.some((v) => v.id === saved)) view = saved as View;
			} catch {
				// Speicher nicht verfügbar
			}
		}
		ready = true;
	});
</script>

<Seo
	title="Termine – Stamm Edelweißpiraten"
	description="Gruppenstunden, Fahrten und Aktionen des Stammes Edelweißpiraten in Bremen-Hastedt."
	path="/termine"
	breadcrumbs={[{ name: 'Termine', path: '/termine' }]}
/>

{#snippet row(e: SiteEvent)}
	{@const d = dayParts(e.startsOn)}
	<li>
		<a href={`/termine/${e.key}`} class="tl">
			<span class="dbox"
				><span class="wd">{d.weekday}</span><span class="dn">{d.day}</span><span class="mo"
					>{d.month.replace('.', '')}</span
				></span
			>
			<span style="min-width: 0">
				<span class="t">{e.title}</span>
				<span class="cap meta">
					{#if isMultiDay(e)}<span><Icon name="calendar" size={16} />{formatDateRange(e)}</span
						>{/if}
					{#if timeOf(e)}<span><Icon name="clock" size={16} />{timeOf(e)}</span>{/if}
					{#if e.location}<span><Icon name="map-pin" size={16} />{e.location}</span>{/if}
					{#if e.galleries.length}<span><Icon name="images" size={16} />Bilder</span>{/if}
				</span>
			</span>
			<span class="tags">
				{#each e.groups as g (g.id)}<span class="tag on-cloud"
						><span class="dot" style="--g: {g.color ?? 'currentColor'}"></span><span>{g.name}</span
						></span
					>{/each}
				{#each e.tags as t (t)}<span class="tag on-cloud"><span>{t}</span></span>{/each}
			</span>
			<Icon name="chevron-right" class="arrow" />
		</a>
	</li>
{/snippet}

{#snippet card(e: SiteEvent)}
	<li>
		<a href={`/termine/${e.key}`} class="ecard">
			<span class="cap tab strong" style="color: var(--color-ink)">{formatDateRange(e)}</span>
			<span class="et">{e.title}</span>
			<span class="cap meta">
				{#if timeOf(e)}<span><Icon name="clock" size={16} />{timeOf(e)}</span>{/if}
				{#if e.location}<span
						><Icon name="map-pin" size={16} /><span class="trunc">{e.location}</span></span
					>{/if}
			</span>
			{#if e.description}<span class="ed">{e.description}</span>{/if}
			<span class="tags">
				{#each e.groups as g (g.id)}<span class="tag on-cloud"
						><span class="dot" style="--g: {g.color ?? 'currentColor'}"></span><span>{g.name}</span
						></span
					>{/each}
				{#each e.tags as t (t)}<span class="tag on-cloud"><span>{t}</span></span>{/each}
				{#if e.galleries.length}<span class="tag on-cloud"
						><Icon name="images" size={14} /><span>Bilder</span></span
					>{/if}
			</span>
		</a>
	</li>
{/snippet}

<section class="site-container" aria-labelledby="h-termine">
	<nav class="crumbs" aria-label="Brotkrümel">
		<a href="/">Start</a><Icon name="chevron-right" size={18} /><span aria-current="page"
			>Termine</span
		>
	</nav>
	<div class="phead">
		<h1 class="display" id="h-termine">Termine</h1>
		<div class="side">
			<p>
				Fahrten, Lager und besondere Aktionen des Stammes. Die wöchentlichen Gruppenstunden stehen
				bei den regelmäßigen Terminen.
			</p>
		</div>
	</div>

	<!-- Filter und Ansicht -->
	<div class="tools">
		<label class="search">
			<span class="sr-only">Termine durchsuchen</span>
			<Icon name="search" />
			<input
				type="search"
				bind:value={q}
				name="q"
				autocomplete="off"
				placeholder="Termin oder Ort suchen …"
				class="field"
			/>
		</label>
		<div class="seg" role="group" aria-label="Ansicht">
			{#each VIEWS as v (v.id)}
				<button type="button" aria-pressed={view === v.id} on:click={() => setView(v.id)}>
					<Icon name={v.icon} size={18} /><span class="vl">{v.label}</span><span class="sr-only vs"
						>{v.label}</span
					>
				</button>
			{/each}
		</div>
	</div>
	{#if groups.length || tags.length}
		<div class="filters" role="group" aria-label="Filter">
			{#if groups.length}
				<div class="chips scroll groups">
					{#each groups as g (g.id)}
						{@const on = selectedGroups.includes(g.id)}
						<button
							type="button"
							class="chip"
							aria-pressed={on}
							on:click={() => (
								(selectedGroups = toggle(selectedGroups, g.id)),
								(visibleCount = PAGE_SIZE)
							)}
						>
							<span class="dot" style="--g: {g.color ?? 'currentColor'}"></span>{g.name}
						</button>
					{/each}
				</div>
			{/if}
			<TagMenu
				{tags}
				selected={selectedTags}
				on:change={(e) => ((selectedTags = e.detail), (visibleCount = PAGE_SIZE))}
			/>
		</div>
	{/if}
	{#if filterActive}
		<p class="cap found" role="status">
			{filtered.length}
			{filtered.length === 1 ? 'Termin' : 'Termine'} gefunden ·
			<button type="button" class="linkbtn" on:click={resetFilters}>Filter zurücksetzen</button>
		</p>
	{/if}

	<div class="layout">
		<div class="main">
			{#if view === 'kalender'}
				<MonthCalendar
					items={calendarItems}
					{month}
					today={data.today}
					on:month={(e) => (month = e.detail)}
				/>
			{:else}
				<section aria-labelledby="kommend">
					<h2 id="kommend" class="sr-only">Kommende Termine</h2>
					{#if singles.upcoming.length === 0}
						<p class="empty">
							{filterActive
								? 'Keine kommenden Termine zu diesem Filter.'
								: 'Gerade stehen keine besonderen Termine an. Die Gruppenstunde findet wie gewohnt statt.'}
						</p>
					{:else if view === 'liste'}
						{#each groupByMonth(upcomingShown) as m (m.month)}
							<div class="month">
								<h3>{formatMonth(m.month)}</h3>
								<ul class="tlist">
									{#each m.events as e (e.key)}
										{@render row(e)}
									{/each}
								</ul>
							</div>
						{/each}
					{:else}
						<ul class="cards">
							{#each upcomingShown as e (e.key)}
								{@render card(e)}
							{/each}
						</ul>
					{/if}
					{#if singles.upcoming.length > visibleCount}
						<div class="morebar">
							<button type="button" class="pill soft" on:click={() => (visibleCount += PAGE_SIZE)}>
								Weitere Termine laden ({singles.upcoming.length - visibleCount})
							</button>
						</div>
					{/if}
				</section>

				{#if singles.past.length}
					<section aria-labelledby="vergangen" class="past">
						<button
							type="button"
							class="pill soft"
							aria-expanded={showPast}
							on:click={() => (showPast = !showPast)}
						>
							<Icon name={showPast ? 'chevron-up' : 'chevron-down'} size={18} />
							{showPast
								? 'Vergangene Termine ausblenden'
								: `Vergangene Termine anzeigen (${singles.past.length})`}
						</button>
						{#if showPast}
							<h2 id="vergangen" class="h-xl" style="margin-top: 32px">Vergangene Termine</h2>
							{#each groupByMonth(singles.past) as m (m.month)}
								<div class="month dim">
									<h3>{formatMonth(m.month)}</h3>
									<ul class="tlist">
										{#each m.events as e (e.key)}
											{@render row(e)}
										{/each}
									</ul>
								</div>
							{/each}
						{:else}
							<h2 id="vergangen" class="sr-only">Vergangene Termine</h2>
						{/if}
					</section>
				{/if}
			{/if}
		</div>

		<aside aria-label="Regelmäßige Termine">
			{#if series.length}
				<div class="abox">
					<span class="ic" style="width: 48px; height: 48px"><Icon name="repeat" /></span>
					<h2>Regelmäßige Termine</h2>
					<ul class="weekly">
						{#each series as s (s.id)}
							<li>
								<a href={`/termine/${s.next.key}`}>
									<span class="wn"
										>{#if s.groups[0]}<span
												class="dot"
												style="--g: {s.groups[0].color ?? 'currentColor'}"
											></span>{/if}{s.title}</span
									>
									<span class="cap tab"
										>{s.rhythm.charAt(0).toUpperCase() + s.rhythm.slice(1)}{s.time
											? `, ${s.time}`
											: ''}</span
									>
									<span class="cap tab">Nächstes Treffen: {s.nextLabel}</span>
								</a>
							</li>
						{/each}
					</ul>
					<p>In den Schulferien fallen die Gruppenstunden aus.</p>
				</div>
			{/if}
			<div class="abox">
				<span class="ic" style="width: 48px; height: 48px"><Icon name="question" /></span>
				<h2>Neu dabei?</h2>
				<p>
					Komm einfach zur Gruppenstunde deiner Altersgruppe. Die erste ist kostenlos und ohne
					Anmeldung.
				</p>
				<a class="ulink" href="/#gruppen">Gruppe finden<Icon name="arrow-right" size={18} /></a>
			</div>
		</aside>
	</div>
</section>

<style>
	.tools {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		flex-wrap: wrap;
		margin-top: 48px;
	}
	.search {
		position: relative;
		flex: 1 1 320px;
		max-width: 480px;
	}
	.search :global(svg) {
		position: absolute;
		left: 20px;
		top: 50%;
		transform: translateY(-50%);
		color: var(--color-muted);
	}
	.search .field {
		border-radius: 30px;
		padding-left: 52px;
	}
	.filters {
		margin-top: 12px;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
	}
	.groups {
		flex: 0 1 auto;
		min-width: 0;
	}
	.found {
		margin-top: 12px;
	}
	.linkbtn {
		border: 0;
		background: none;
		padding: 0;
		font: inherit;
		color: var(--color-ink);
		font-weight: 500;
		text-decoration: underline;
		text-underline-offset: 3px;
		cursor: pointer;
	}
	.vs {
		display: none;
	}
	.layout {
		display: grid;
		grid-template-columns: repeat(12, minmax(0, 1fr));
		gap: 24px;
		align-items: start;
		margin-top: 32px;
	}
	.main {
		grid-column: 1 / span 9;
		min-width: 0;
	}
	aside {
		grid-column: 10 / span 3;
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	.month + .month {
		margin-top: 40px;
	}
	.month h3 {
		font-size: 20px;
		font-weight: 500;
		margin-bottom: 14px;
	}
	.month.dim {
		opacity: 0.8;
		margin-top: 24px;
	}
	.cards {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
		gap: 8px;
	}
	.ecard {
		height: 100%;
		background: var(--color-subtle);
		padding: 22px;
		display: flex;
		flex-direction: column;
		gap: 10px;
		text-decoration: none;
		color: var(--color-ink);
		transition: background 0.15s ease;
	}
	.ecard:hover {
		background: var(--color-subtle-2);
	}
	.et {
		font-size: 20px;
		font-weight: 500;
		line-height: 1.3;
	}
	.ecard .meta {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
	.ecard .meta > span {
		display: flex;
		align-items: center;
		gap: 6px;
		min-width: 0;
	}
	.trunc {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.ed {
		color: var(--color-body);
		display: -webkit-box;
		-webkit-line-clamp: 3;
		line-clamp: 3;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
	.ecard .tags {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-top: auto;
		padding-top: 6px;
	}
	.morebar {
		display: flex;
		justify-content: center;
		margin-top: 32px;
	}
	.past {
		margin-top: 48px;
	}
	.weekly {
		display: flex;
		flex-direction: column;
		gap: 8px;
		width: 100%;
	}
	.weekly a {
		display: flex;
		flex-direction: column;
		gap: 2px;
		background: var(--color-page);
		padding: 12px 16px;
		text-decoration: none;
		color: var(--color-ink);
		transition: background 0.15s ease;
	}
	.weekly a:hover {
		background: var(--color-subtle-2);
	}
	.wn {
		display: flex;
		align-items: center;
		gap: 8px;
		font-weight: 500;
	}
	@media (max-width: 62rem) {
		.main,
		aside {
			grid-column: 1 / -1;
		}
		aside {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
		}
	}
	@media (max-width: 50rem) {
		.tools {
			margin-top: 32px;
		}
		.search {
			max-width: none;
		}
		.vl {
			display: none;
		}
		.vs {
			display: inline;
		}
	}
</style>
