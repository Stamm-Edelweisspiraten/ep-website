<script lang="ts">
    // Kleine Symbole (Pfade aus Lucide, ISC-Lizenz) ohne zusätzliche Abhängigkeit.
    export let name:
        | 'chevron-left'
        | 'chevron-right'
        | 'repeat'
        | 'map-pin'
        | 'clock'
        | 'images'
        | 'image'
        | 'calendar'
        | 'grid'
        | 'list'
        | 'search'
        | 'x'
        | 'arrow-left'
        | 'share'
        | 'external';
    export let size = 16;
    let className = '';
    export { className as class };
</script>

<svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    class="shrink-0 {className}"
    aria-hidden="true"
>
    {#if name === 'chevron-left'}
        <path d="m15 18-6-6 6-6" />
    {:else if name === 'chevron-right'}
        <path d="m9 18 6-6-6-6" />
    {:else if name === 'repeat'}
        <path d="m17 2 4 4-4 4" /><path d="M3 11v-1a4 4 0 0 1 4-4h14" /><path d="m7 22-4-4 4-4" /><path
            d="M21 13v1a4 4 0 0 1-4 4H3"
        />
    {:else if name === 'map-pin'}
        <path
            d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
        /><circle cx="12" cy="10" r="3" />
    {:else if name === 'clock'}
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    {:else if name === 'images'}
        <path d="M18 22H4a2 2 0 0 1-2-2V6" /><path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18" /><circle
            cx="12"
            cy="8"
            r="2"
        /><rect width="16" height="16" x="6" y="2" rx="2" />
    {:else if name === 'image'}
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" /><circle cx="9" cy="9" r="2" /><path
            d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"
        />
    {:else if name === 'calendar'}
        <path d="M8 2v4" /><path d="M16 2v4" /><rect width="18" height="18" x="3" y="4" rx="2" /><path d="M3 10h18" />
    {:else if name === 'grid'}
        <rect width="7" height="7" x="3" y="3" rx="1" /><rect width="7" height="7" x="14" y="3" rx="1" /><rect
            width="7"
            height="7"
            x="14"
            y="14"
            rx="1"
        /><rect width="7" height="7" x="3" y="14" rx="1" />
    {:else if name === 'list'}
        <path d="M3 12h.01" /><path d="M3 18h.01" /><path d="M3 6h.01" /><path d="M8 12h13" /><path
            d="M8 18h13"
        /><path d="M8 6h13" />
    {:else if name === 'search'}
        <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
    {:else if name === 'x'}
        <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    {:else if name === 'arrow-left'}
        <path d="m12 19-7-7 7-7" /><path d="M19 12H5" />
    {:else if name === 'share'}
        <circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line
            x1="8.59"
            x2="15.42"
            y1="13.51"
            y2="17.49"
        /><line x1="15.41" x2="8.59" y1="6.51" y2="10.49" />
    {:else if name === 'external'}
        <path d="M15 3h6v6" /><path d="M10 14 21 3" /><path
            d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
        />
    {/if}
</svg>
