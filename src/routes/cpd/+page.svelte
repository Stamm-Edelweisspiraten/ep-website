<svelte:head>
    <title>Stamm Edelweißpiraten – Bund & Geschichte</title>
    <meta name="description" content="Wir sind ein Stamm der CPD in der Landesmark Achter'n Diek im Gau Bremen. Überblick über Bund und Geschichte der Christlichen Pfadfinderschaft Deutschlands." />
</svelte:head>

<script>
    import Icon from '$lib/components/Icon.svelte';
</script>

<section class="site-container" aria-labelledby="h-cpd">
    <nav class="crumbs" aria-label="Brotkrümel"><a href="/">Start</a><Icon name="chevron-right" size={18} /><span aria-current="page">Unser Bund</span></nav>
    <div class="chead">
        <div class="t">
            <p class="strong">Christliche Pfadfinderschaft Deutschlands e. V.</p>
            <h1 class="display" id="h-cpd">Unser Bund:<br />die CPD</h1>
            <p class="lede">Wir sind ein Stamm der CPD in der Landesmark Achter'n Diek im Gau Bremen.</p>
            <div class="acts"><a class="pill" href="#geschichte">Zur Geschichte</a><a class="pill soft" href="/team">Unser Team</a></div>
        </div>
        <div class="seal"><img src="/kreuzlilie.avif" alt="Kreuzlilie der CPD e. V." width="1295" height="1656" decoding="async" /></div>
    </div>
</section>

<section class="site-container section-gap" aria-labelledby="h-aufbau">
    <h2 class="h-xl" id="h-aufbau" style="margin-bottom: 24px">So sind wir aufgebaut</h2>
    <ol class="chain">
        <li class="step"><span class="lv">Bund</span><span class="n">Christliche Pfadfinderschaft Deutschlands</span><span class="ar" aria-hidden="true"><Icon name="chevron-right" size={18} /></span></li>
        <li class="step"><span class="lv">Landesmark</span><span class="n">Achter'n Diek</span><span class="ar" aria-hidden="true"><Icon name="chevron-right" size={18} /></span></li>
        <li class="step"><span class="lv">Gau</span><span class="n">Bremen</span><span class="ar" aria-hidden="true"><Icon name="chevron-right" size={18} /></span></li>
        <li class="step here"><span class="lv">Stamm</span><span class="n">Edelweißpiraten</span><span class="cap">Bremen-Hastedt</span><span class="ar" aria-hidden="true"><Icon name="chevron-right" size={18} /></span></li>
        <li class="step"><span class="lv">Gruppen</span><span class="n">Meute und Sippen</span><a class="ulink" href="/#gruppen" style="margin-top: auto">Unsere Gruppen</a></li>
    </ol>
</section>

<section class="site-container section-gap" id="geschichte" aria-labelledby="h-geschichte">
    <div class="intro2"><h2 class="h-xl" id="h-geschichte">Geschichte der CPD</h2>
    <p class="r">Ein Auszug wichtiger Stationen des Bundes, nach Epochen gegliedert.</p></div>

    <div class="epochs">
        <!-- Ur-CP (vor 1921) -->
        <details class="epoch">
            <summary><span>Ur-CP (vor 1921)</span><svg class="i chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary>
            <div class="eb">
                <div>
                    <h3 class="y">1909</h3>
                    <ul class="items">
                        <li>Erste Anfänge der CP innerhalb des CVJM in Stuttgart</li>
                        <li>Erster Gründer: Johann Knehr</li>
                        <li>Erstes Pfadfinderbuch „Allzeit Bereit“ von Dr. Kertz</li>
                        <li>Arbeit nach der Methode von Lord Baden-Powell</li>
                    </ul>
                </div>
                <div>
                    <h3 class="y">1912</h3>
                    <ul class="items">
                        <li>Erste Satzung der CP von Pastor Köhler</li>
                        <li>Erste Formen einer einheitlichen Tracht (Kluft)</li>
                    </ul>
                </div>
                <div>
                    <h3 class="y">1919</h3>
                    <ul class="items">
                        <li>Kleinste Form heißt Gruppe, Gruppenführer kann nur ein Oberpfadfinder sein</li>
                        <li>Das Pfadfinderkreuz (von Lt. Lohse im Krieg entworfen) wird eingeführt</li>
                        <li>Gründung der „Tatgemeinschaft Sachsen“ (Karl Friede, Fritz Riebold)</li>
                    </ul>
                </div>
            </div>
        </details>

        <!-- Historische CPD (1921–1945) -->
        <details class="epoch">
            <summary><span>Historische CPD (1921–1945)</span><svg class="i chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary>
            <div class="eb">
                <div>
                    <h3 class="y">1921</h3>
                    <ul class="items">
                        <li>Anerkennung innerhalb des CVJM wird erkämpft</li>
                        <li>Führertagung in Neudietendorf (9./10. Juni)</li>
                        <li>Verabschiedung der Grundsätze von Neudietendorf</li>
                        <li>Zusammenschluss zum Bund „Christliche Pfadfinderschaft Deutschlands (CPD)“</li>
                        <li>Erich Stange wird Reichsführer</li>
                    </ul>
                </div>
                <div>
                    <h3 class="y">1922–1929</h3>
                    <ul class="items">
                        <li>Einführung von Ausweis, Proben, Reichsliederbuch, Ehrenpfadfinderschaft</li>
                        <li>Neue Ständearbeit: Jungpfadfinder, Pfadfinder, Knappe, Späher</li>
                        <li>Fritz Riebold: Späherbuch & Zeitschrift „Auf neuem Pfad“ (1922)</li>
                        <li>Erste internationale Lager-Teilnahme (1925, Dänemark)</li>
                        <li>Internationaler Gruß & Halstuch (1926)</li>
                        <li>Kreuzlilie als Späherzeichen; Morgen- und Abendwache (1927)</li>
                        <li>Pfadfinderhof Langemarck angemietet (1928)</li>
                        <li>Endgültige Trennung vom CVJM; CPD eigenständig (1929)</li>
                    </ul>
                </div>
                <div>
                    <h3 class="y">1931–1934</h3>
                    <ul class="items">
                        <li>Langemarck bei Wettmar erworben & eingeweiht (1931)</li>
                        <li>Erste einheitliche Probenordnung; Gedanken zum Kreuzpfadfinder (1932)</li>
                        <li>„Meißner Grundsätze“ (1933) – Bekenntnis gegen Gleichschaltung</li>
                        <li>Opposition gegen Eingliederung in HJ; Aufbau Bruderschaft Ü18</li>
                        <li>1934: Verbot der Jungenschaftsarbeit</li>
                    </ul>
                </div>
                <div>
                    <h3 class="y">1935–1944</h3>
                    <ul class="items">
                        <li>Bruderschaftstreffen (Dassel, Bethel)</li>
                        <li>1937: Verbot, Auflösung, Untergrundarbeit; Aufgabe Langemarck</li>
                        <li>1938: Hof neu errichtet am Annateich (Hannover-Kirchrode)</li>
                        <li>1944: fridu (Friedrich Duensing) stirbt</li>
                    </ul>
                </div>
            </div>
        </details>

        <!-- Nachkriegs-CPD (1946–1973) -->
        <details class="epoch">
            <summary><span>Nachkriegs-CPD (1946–1973)</span><svg class="i chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary>
            <div class="eb">
                <ul class="items">
                    <li>1946: Führertagung Hannover; „Hohensolmser Erklärung“</li>
                    <li>1947: heika (Heinrich Karsch) wird Bundesführer; Zeitschrift „Jungenland“</li>
                    <li>1949: Gründung des RDP (CPD, DPSG, BDP)</li>
                    <li>1950: Internationale Anerkennung des RDP</li>
                    <li>1957: Teilnahme am World Jamboree</li>
                    <li>1959/67: Burg Rieneck gepachtet/gekauft; 1962 „Grundsätze von Rieneck“</li>
                    <li>1968–69: Führungswechsel; Beginn „moderner Zeiten“</li>
                    <li>1970–73: Weg zum VCP; 1973 Gründung des VCP (Rechtsnachfolge CPD im RdP)</li>
                </ul>
            </div>
        </details>

        <!-- Verbands-Phase im VCP (1973–1976) -->
        <details class="epoch">
            <summary><span>Verbands-Phase im VCP (1973–1976)</span><svg class="i chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary>
            <div class="eb">
                <ul class="items">
                    <li>Arbeitskreise Nord/West; spätere Landesmarken & EJ tyrker</li>
                    <li>1974: „Falkenhagener Erklärung“</li>
                </ul>
            </div>
        </details>

        <!-- Neue CPD (1976–1996) -->
        <details class="epoch">
            <summary><span>Neue CPD (1976–1996)</span><svg class="i chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary>
            <div class="eb">
                <ul class="items">
                    <li>1976: Gründungsthing CPD e.V. in Falkenhagen; Rüdiger Elsell Bundesführer</li>
                    <li>1977: Deutscher Pfadfinderring (DPR) mit KPE & DPV</li>
                    <li>1980–84: Führungswechsel; innere Spannungen; Zavelsteiner Erklärung (1984)</li>
                    <li>1986: Ring Christlicher Pfadfinderschaften (RCP) gegründet</li>
                    <li>1990–95: Annäherung CPD & CP 1921; gemeinsame Lager/Kurse</li>
                    <li>1995: Beschluss zur Wiedervereinigung</li>
                </ul>
            </div>
        </details>

        <!-- Heutige CPD (seit 1996) -->
        <details class="epoch" open>
            <summary><span>Heutige CPD (seit 1996)</span><svg class="i chev" viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></summary>
            <div class="eb">
                <ul class="items">
                    <li>1996: Gründungsthing der wiedervereinigten CPD in St. Goarshausen; Beginn neuer Landesmark-Strukturen</li>
                    <li>1997–2005: Aufbau Bundeshof Birkenfelde; Bundesfeste & Bundesfeuer</li>
                    <li>2004: Bundeslager „panta rei – alles fließt“; erste Bundesführerin (wadu)</li>
                    <li>2008: Bundeslager an den Gosheimer Baggerseen „Der Freiheit so nah“</li>
                </ul>
            </div>
        </details>
    </div>
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
    .epochs {
        display: flex;
        flex-direction: column;
        gap: 8px;
    }
    .epoch {
        background: var(--color-subtle);
    }
    .epoch summary {
        list-style: none;
        cursor: pointer;
        min-height: 76px;
        padding: 16px 24px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        font-size: 18px;
        font-weight: 500;
    }
    .epoch summary::-webkit-details-marker {
        display: none;
    }
    .epoch summary:hover {
        background: var(--color-subtle-2);
    }
    .epoch :global(.chev) {
        transition: transform 0.2s ease;
    }
    .epoch[open] :global(.chev) {
        transform: rotate(180deg);
    }
    .eb {
        padding: 0 24px 24px;
        display: flex;
        flex-direction: column;
        gap: 8px;
        color: var(--color-body);
    }
    .eb > div {
        display: grid;
        grid-template-columns: 140px minmax(0, 1fr);
        gap: 20px;
        background: var(--color-page);
        padding: 18px 22px;
    }
    .y {
        font-size: 18px;
        font-weight: 600;
        color: var(--color-ink);
        font-variant-numeric: tabular-nums;
    }
    .items {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }
    .eb > .items {
        background: var(--color-page);
        padding: 18px 22px;
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
        .eb > div {
            grid-template-columns: 1fr;
            gap: 6px;
        }
    }
</style>
