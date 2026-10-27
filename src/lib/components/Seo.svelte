<script>
    // Kopfdaten einer Seite für Suchmaschinen und Link-Vorschauen: Titel, Beschreibung, kanonische Adresse,
    // Open Graph / Twitter und strukturierte Daten (JSON-LD). Basis-URL aus `PUBLIC_SITE_URL`, sonst die Adresse der Anfrage.
    // JSON-LD ist ein Datenblock (kein ausführbares Skript, die CSP greift nicht); `jsonLdScript` maskiert `<`, `>` und `&`.
    import { page } from '$app/stores';
    import { env } from '$env/dynamic/public';
    import { DEFAULT_OG_IMAGE, SITE_LOCALE, SITE_NAME, absoluteUrl, breadcrumb, cleanBase, jsonLdScript } from '$lib/seo';

    /** vollständiger Seitentitel (`<title>`) */
    export let title = SITE_NAME;
    /** Titel für Vorschauen (Standard: `title`) */
    /** @type {string | null} */
    export let ogTitle = null;
    export let description = '';
    /** Pfad der kanonischen Adresse (Standard: aktueller Pfad ohne Query) */
    /** @type {string | null} */
    export let path = null;
    /** Vorschaubild (Pfad oder absolute URL); Standard `/og-default.jpg` */
    /** @type {string | null} */
    export let image = null;
    /** @type {string | null} */
    export let imageAlt = null;
    /** `website` | `article` | `profile` … */
    export let type = 'website';
    export let noindex = false;
    /**
     * Strukturierte Daten: ein Objekt, eine Liste oder eine Funktion der Basis-URL (für absolute Adressen,
     * z. B. `(base) => event({ base, … })`).
     * @type {import('$lib/seo').JsonLd | import('$lib/seo').JsonLd[] | ((base: string) => import('$lib/seo').JsonLd | import('$lib/seo').JsonLd[]) | null}
     */
    export let jsonLd = null;
    /**
     * Brotkrümel als `BreadcrumbList` (ohne „Start“ – der kommt automatisch davor)
     * @type {{ name: string; path: string }[]}
     */
    export let breadcrumbs = [];

    $: base = cleanBase(env.PUBLIC_SITE_URL || $page.url.origin);
    $: canonical = absoluteUrl(base, path ?? $page.url.pathname);
    $: ogImage = absoluteUrl(base, image || DEFAULT_OG_IMAGE);
    $: ld = [
        ...[typeof jsonLd === 'function' ? jsonLd(base) : jsonLd].flat().filter((x) => !!x),
        ...(breadcrumbs.length ? [breadcrumb(base, [{ name: 'Start', path: '/' }, ...breadcrumbs])] : [])
    ];
</script>

<svelte:head>
    <title>{title}</title>
    {#if description}<meta name="description" content={description} />{/if}
    {#if noindex}
        <meta name="robots" content="noindex, follow" />
    {:else}
        <link rel="canonical" href={canonical} />
    {/if}
    <meta property="og:site_name" content={SITE_NAME} />
    <meta property="og:locale" content={SITE_LOCALE} />
    <meta property="og:type" content={type} />
    <meta property="og:title" content={ogTitle || title} />
    {#if description}<meta property="og:description" content={description} />{/if}
    <meta property="og:url" content={canonical} />
    <meta property="og:image" content={ogImage} />
    {#if imageAlt}<meta property="og:image:alt" content={imageAlt} />{/if}
    <meta name="twitter:card" content="summary_large_image" />
    {#if ld.length}{@html jsonLdScript(ld.length === 1 ? ld[0] : ld)}{/if}
</svelte:head>
