// ── CONFIGURAZIONE ──────────────────────────────────────
const WAQI_TOKEN = "872d32e1e9ebff234c6dcb75a66089be61b0225a";

// ── STATO GLOBALE ────────────────────────────────────────
let allMarkers = {};
let activeButton = null;

// ── COLORI AQI ───────────────────────────────────────────
function aqiColor(aqi) {
    if (aqi <= 50)  return "#00e400";
    if (aqi <= 100) return "#ffff00";
    if (aqi <= 150) return "#ff7e00";
    if (aqi <= 200) return "#ff0000";
    if (aqi <= 300) return "#99004c";
    return "#7e0023";
}

function aqiLabel(aqi) {
    if (aqi <= 50)  return "✅ Buona";
    if (aqi <= 100) return "🟡 Moderata";
    if (aqi <= 150) return "🟠 Non salutare (sensibili)";
    if (aqi <= 200) return "🔴 Non salutare";
    if (aqi <= 300) return "🟣 Molto non salutare";
    return "🔴 Pericolosa";
}

function aqiBadgeStyle(aqi) {
    const c = aqiColor(aqi);
    return `background: ${c}22; border-color: ${c}55; color: ${c};`;
}

// ── AGGIORNA PANNELLO LATERALE ────────────────────────────
function updatePanel(data) {
    const aqi = data.aqi;
    const cityName = (data.city && data.city.name) ? data.city.name : "—";
    const updated = (data.time && data.time.s) ? data.time.s : "";

    document.getElementById("aqi-city-name").textContent = cityName;

    const aqiEl = document.getElementById("aqi-value");
    aqiEl.textContent = aqi;
    aqiEl.style.color = aqiColor(aqi);

    const badge = document.getElementById("aqi-badge");
    badge.textContent = aqiLabel(aqi);
    badge.style.cssText = aqiBadgeStyle(aqi);

    // Pollutants
    const pollDiv = document.getElementById("aqi-pollutants");
    pollDiv.innerHTML = "";
    if (data.iaqi) {
        const pollutants = { pm25: "PM2.5", pm10: "PM10", no2: "NO₂", o3: "O₃", so2: "SO₂", co: "CO" };
        Object.entries(pollutants).forEach(([key, label]) => {
            if (data.iaqi[key]) {
                const chip = document.createElement("div");
                chip.className = "pollutant-chip";
                chip.innerHTML = `${label}: <span>${data.iaqi[key].v}</span>`;
                pollDiv.appendChild(chip);
            }
        });
    }

    document.getElementById("aqi-updated").textContent = updated ? `Aggiornato: ${updated}` : "";
}

// ── CREA MAPPA ────────────────────────────────────────────
function createMap() {
    const tileLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { maxZoom: 19, attribution: '© <a href="https://openstreetmap.org">OpenStreetMap</a>' }
    );

    const map = L.map("leaflet-map", {
        attributionControl: true,
        zoomSnap: 0.1,
    })
    .setView([41.9028, 12.4964], 6)
    .addLayer(tileLayer);

    // Aggiorna marker al movimento mappa
    map.on("moveend", () => {
        const b = map.getBounds();
        const boundsStr = `${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()}`;
        populateMarkers(map, boundsStr);
    });

    return map;
}

// ── POPOLA MARKER ─────────────────────────────────────────
function populateMarkers(map, bounds) {
    return fetch(`https://api.waqi.info/map/bounds/?latlng=${bounds}&token=${WAQI_TOKEN}`)
        .then(r => r.json())
        .then(stations => {
            if (stations.status !== "ok") throw stations.data;

            stations.data.forEach(station => {
                if (allMarkers[station.uid]) map.removeLayer(allMarkers[station.uid]);

                const aqi = parseInt(station.aqi) || 0;
                const color = aqiColor(aqi);

                // Cerchio colorato custom invece di immagine esterna
                const icon = L.divIcon({
                    className: "",
                    html: `<div style="
                        width:36px;height:36px;border-radius:50%;
                        background:${color};
                        border:3px solid rgba(255,255,255,0.8);
                        display:flex;align-items:center;justify-content:center;
                        font-size:11px;font-weight:700;color:#111;
                        font-family:'DM Sans',sans-serif;
                        box-shadow:0 2px 8px rgba(0,0,0,0.4);
                    ">${aqi > 0 ? aqi : "?"}</div>`,
                    iconSize: [36, 36],
                    iconAnchor: [18, 18],
                });

                const marker = L.marker([station.lat, station.lon], {
                    zIndexOffset: aqi,
                    title: station.station.name,
                    icon,
                }).addTo(map);

                marker.on("click", () => {
                    const popup = L.popup()
                        .setLatLng([station.lat, station.lon])
                        .setContent("<em style='color:#a8e063'>Caricamento...</em>")
                        .openOn(map);

                    getStationData(station.uid).then(data => {
                        if (!data) return;
                        const c = aqiColor(data.aqi);
                        popup.setContent(`
                            <b style="color:#a8e063;font-size:1rem">${data.city.name}</b><br>
                            AQI: <b style="color:${c};font-size:1.2rem">${data.aqi}</b>
                            <span style="font-size:.75rem;color:#aaa;margin-left:.3rem">${aqiLabel(data.aqi)}</span><br>
                            <small style="color:#888">Aggiornato: ${data.time ? data.time.s : "—"}</small>
                            <hr style="border-color:rgba(168,224,99,.2);margin:.5rem 0">
                            ${formatPollutants(data.iaqi)}
                        `);
                        updatePanel(data);
                    });
                });

                allMarkers[station.uid] = marker;
            });

            document.getElementById("leaflet-map-error").style.display = "none";
        })
        .catch(e => {
            const errEl = document.getElementById("leaflet-map-error");
            errEl.textContent = "Errore API: " + e;
            errEl.style.display = "";
        });
}

// ── DATI SINGOLA STAZIONE ─────────────────────────────────
function getStationData(uid) {
    return fetch(`https://api.waqi.info/feed/@${uid}/?token=${WAQI_TOKEN}`)
        .then(r => r.json())
        .then(res => res.status === "ok" ? res.data : null)
        .catch(() => null);
}

// ── FORMATO INQUINANTI NEL POPUP ──────────────────────────
function formatPollutants(iaqi) {
    if (!iaqi) return "";
    const names = { pm25: "PM2.5", pm10: "PM10", no2: "NO₂", o3: "O₃", so2: "SO₂", co: "CO" };
    let html = "<b style='color:#a8e063'>Inquinanti:</b><br>";
    Object.entries(names).forEach(([k, label]) => {
        if (iaqi[k]) html += `<span style="font-size:.8rem">${label}: <b>${iaqi[k].v}</b></span>&nbsp; `;
    });
    return html;
}

// ── ZOOM E CARICA MARKERS PER AREA ────────────────────────
function populateAndFitMarkers(map, bounds) {
    removeMarkers(map);
    const coords = bounds.split(",");

    if (coords.length === 2) {
        const lat = parseFloat(coords[0]);
        const lng = parseFloat(coords[1]);
        const off = 0.22;
        const apiBounds = `${lat-off},${lng-off},${lat+off},${lng+off}`;
        populateMarkers(map, apiBounds).then(() => {
            map.setView([lat, lng], 11);
            // Fetch panel data per la città selezionata
            fetch(`https://api.waqi.info/feed/geo:${lat};${lng}/?token=${WAQI_TOKEN}`)
                .then(r => r.json())
                .then(res => { if (res.status === "ok") updatePanel(res.data); });
        });
    } else {
        const mapBounds = L.latLngBounds(
            L.latLng(coords[0], coords[1]),
            L.latLng(coords[2], coords[3])
        );
        const centerLat = (parseFloat(coords[0]) + parseFloat(coords[2])) / 2;
        const centerLng = (parseFloat(coords[1]) + parseFloat(coords[3])) / 2;

        populateMarkers(map, bounds).then(() => {
            map.fitBounds(mapBounds);
            fetch(`https://api.waqi.info/feed/geo:${centerLat};${centerLng}/?token=${WAQI_TOKEN}`)
                .then(r => r.json())
                .then(res => { if (res.status === "ok") updatePanel(res.data); });
        });
    }
}

function removeMarkers(map) {
    Object.values(allMarkers).forEach(m => map.removeLayer(m));
    allMarkers = {};
}

// ── INIT ──────────────────────────────────────────────────
function init() {
    const map = createMap();

    const locations = {
        "Parma": "44.755,10.265,44.845,10.385",
        "Roma":    "41.760,12.330,42.010,12.650",
        "Milano":  "45.380,9.040,45.540,9.350",
        "Napoli":  "40.780,14.150,40.910,14.400",
        "Torino":  "45.000,7.580,45.150,7.780",
        "Palermo": "38.115,13.361",
        "Firenze": "43.769,11.255",
        "Bologna": "44.401,11.342",
        "Venezia": "45.437,12.332",
    };

    const container = document.getElementById("leaflet-locations");
    let firstActivate = null;

    Object.entries(locations).forEach(([city, bounds], idx) => {
        const btn = document.createElement("button");
        btn.className = "city-btn";
        btn.textContent = city;
        container.appendChild(btn);

        const activate = () => {
            if (activeButton) activeButton.classList.remove("active");
            btn.classList.add("active");
            activeButton = btn;
            populateAndFitMarkers(map, bounds);
        };

        btn.onclick = activate;
        if (idx === 0) firstActivate = activate;
    });

    const locBtn = document.createElement("button");
    locBtn.className = "city-btn loc-btn";
    locBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 14 14" fill="none" style="flex-shrink:0">
    <circle cx="7" cy="6" r="2.2" stroke="currentColor" stroke-width="1.5"/>
    <path d="M7 1C4.24 1 2 3.13 2 5.75 2 9.25 7 13 7 13s5-3.75 5-7.25C12 3.13 9.76 1 7 1z" stroke="currentColor" stroke-width="1.5" fill="none"/>
    </svg> Posizione attuale`;
    container.appendChild(locBtn);

    locBtn.onclick = () => {
        if (!navigator.geolocation) {
            locBtn.textContent = "GPS non disponibile";
            return;
        }
        locBtn.innerHTML = `<div class="loc-spinner"></div> Localizzazione...`;
        locBtn.disabled = true;

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords;
                locBtn.disabled = false;
                locBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="6" r="2.2" stroke="currentColor" stroke-width="1.5"/><path d="M7 1C4.24 1 2 3.13 2 5.75 2 9.25 7 13 7 13s5-3.75 5-7.25C12 3.13 9.76 1 7 1z" stroke="currentColor" stroke-width="1.5" fill="none"/></svg> La tua posizione`;
                locBtn.classList.add("active");
                if (activeButton) activeButton.classList.remove("active");
                activeButton = locBtn;

                // Aggiungi marker speciale per la posizione utente
                const userIcon = L.divIcon({
                    className: "",
                    html: `<div style="width:16px;height:16px;border-radius:50%;background:#4fc3f7;border:3px solid #fff;box-shadow:0 0 0 6px rgba(79,195,247,.25)"></div>`,
                    iconSize: [16, 16], iconAnchor: [8, 8],
                });
                L.marker([lat, lng], { icon: userIcon, zIndexOffset: 9999 })
                    .addTo(map).bindPopup("<b style='color:#4fc3f7'>La tua posizione</b>").openPopup();

                populateAndFitMarkers(map, `${lat},${lng}`);
            },
            () => {
                locBtn.disabled = false;
                locBtn.textContent = "Accesso negato";
                locBtn.style.color = "#f07070";
                locBtn.style.borderColor = "rgba(240,112,112,.4)";
            }
        );
    };

    // Attiva Roma al caricamento
    if (firstActivate) firstActivate();
}

window.onload = init;
