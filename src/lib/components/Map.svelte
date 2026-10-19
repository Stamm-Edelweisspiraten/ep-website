<script lang="ts">
	import 'leaflet/dist/leaflet.css';
	import { onMount } from 'svelte';

	interface Props {
		/** Standard: Ev. Auferstehungsgemeinde Bremen-Hastedt */
		lat?: number;
		lng?: number;
		zoom?: number;
		/** Text im Marker-Popup und Name der Karte für Screenreader */
		label?: string;
		/** Höhe der Karte über Klassen (Standard `h-[400px]`) */
		class?: string;
	}

	let {
		lat = 53.064289,
		lng = 8.868496,
		zoom = 16,
		label = 'Ev. Auferstehungsgemeinde Bremen-Hastedt',
		class: className = 'h-[400px]'
	}: Props = $props();

	let container: HTMLDivElement;

	onMount(() => {
		let map: import('leaflet').Map | undefined;
		let cancelled = false;

		(async () => {
			// Leaflet braucht `window` – nur im Browser laden
			const L = (await import('leaflet')).default;
			if (cancelled) return;
			const icon = L.icon({
				iconUrl: '/marker-icon.png',
				iconRetinaUrl: '/marker-icon-2x.png',
				shadowUrl: '/marker-shadow.png',
				iconSize: [25, 41],
				iconAnchor: [12, 41],
				popupAnchor: [1, -34],
				shadowSize: [41, 41]
			});
			map = L.map(container, { scrollWheelZoom: false }).setView([lat, lng], zoom);
			L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
				maxZoom: 19,
				attribution:
					'&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>-Mitwirkende'
			}).addTo(map);
			const popup = document.createElement('span');
			popup.textContent = label;
			L.marker([lat, lng], { icon, alt: label }).addTo(map).bindPopup(popup).openPopup();
		})();

		return () => {
			cancelled = true;
			map?.remove();
		};
	});

	const osmLink = $derived(
		`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=${zoom}/${lat}/${lng}`
	);
</script>

<div class="overflow-hidden border border-gray-300 bg-white">
	<div
		bind:this={container}
		class="relative z-0 w-full bg-gray-100 {className}"
		role="region"
		aria-label="Karte: {label}"
	></div>
	<p class="border-t border-gray-300 px-4 py-2 text-xs text-gray-500">
		<a class="link" href={osmLink} target="_blank" rel="noopener noreferrer">
			Größere Karte bei OpenStreetMap öffnen
		</a>
	</p>
</div>
