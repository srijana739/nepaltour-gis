// ============================================================
// FILE: frontend/app.js
// PURPOSE: All map logic — base maps, layers, spatial tools,
//          attribute tools, filters, popups
// ============================================================

// Change this to your hosted backend URL after deployment
const API_BASE = 'https://nepaltour-gis-backend.onrender.com/api';

// ============================================================
// SECTION 1: BASE MAPS (3 required + 1 bonus)
// These are the background tile layers the user can switch between
// ============================================================

// Base Map 1: OpenStreetMap — standard street map
const osm = L.tileLayer(
  'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }
);

// Base Map 2: Satellite imagery (Esri World Imagery)
const satellite = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  {
    attribution: 'Tiles © Esri',
    maxZoom: 19
  }
);

// Base Map 3: Terrain map (ESRI World Topo - free, no API key needed)
const terrain = L.tileLayer(
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
  {
    attribution: 'Tiles © Esri',
    maxZoom: 18
  }
);

// Base Map 4: Topographic map (OpenTopoMap)
const topo = L.tileLayer(
  'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
  {
    attribution: 'Map data: © OpenStreetMap contributors | Map style: © OpenTopoMap',
    maxZoom: 17
  }
);


// ============================================================
// SECTION 2: CREATE THE MAP
// Center on Nepal, zoom level 7 shows the whole country
// Start with OpenStreetMap as the default base map
// ============================================================
const map = L.map('map', {
  center: [28.3949, 84.1240],  // Center of Nepal
  zoom: 7,
  layers: [osm]                // Default base map
});


// ============================================================
// SECTION 3: OVERLAY LAYERS
// These sit on top of the base map
// User can toggle them on/off using the layer control
// ============================================================

// --- Boundary Layers (polygons) ---

// Province boundaries — thick dark border
const provinceLayer = L.geoJSON(null, {
  style: {
    color: '#333',
    weight: 2.5,
    fillOpacity: 0,
    dashArray: null
  },
  onEachFeature: (feature, layer) => {
    // Clicking a province shows its name
    layer.bindTooltip(feature.properties.name, { sticky: true });
  }
});

// District boundaries — medium dashed border
const districtLayer = L.geoJSON(null, {
  style: {
    color: '#666',
    weight: 1.2,
    fillOpacity: 0,
    dashArray: '5,5'
  },
  onEachFeature: (feature, layer) => {
    layer.bindTooltip(feature.properties.name, { sticky: true });
  }
});

// Local level boundaries — thin light border
const localLayer = L.geoJSON(null, {
  style: {
    color: '#aaa',
    weight: 0.8,
    fillOpacity: 0,
    dashArray: '2,4'
  },
  onEachFeature: (feature, layer) => {
    layer.bindTooltip(feature.properties.name, { sticky: true });
  }
});

// --- Tourism Point Layers ---

// Heritage sites — red circles
const heritageLayer = L.geoJSON(null, {
  pointToLayer: (feature, latlng) => {
    return L.circleMarker(latlng, {
      radius: 7,
      fillColor: '#9b2226',
      color: '#fff',
      weight: 1.5,
      fillOpacity: 0.9
    });
  },
  onEachFeature: bindPopup
});

// Hotels — blue circles
const hotelLayer = L.geoJSON(null, {
  pointToLayer: (feature, latlng) => {
    return L.circleMarker(latlng, {
      radius: 7,
      fillColor: '#1d3557',
      color: '#fff',
      weight: 1.5,
      fillOpacity: 0.9
    });
  },
  onEachFeature: bindPopup
});

// Restaurants — orange circles
const restaurantLayer = L.geoJSON(null, {
  pointToLayer: (feature, latlng) => {
    return L.circleMarker(latlng, {
      radius: 7,
      fillColor: '#ca6702',
      color: '#fff',
      weight: 1.5,
      fillOpacity: 0.9
    });
  },
  onEachFeature: bindPopup
});


// ============================================================
// SECTION 4: POPUP FUNCTION (Attribute Tool)
// Shows place details when user clicks a point on the map
// This is the main popup/attribute display tool
// ============================================================
function bindPopup(feature, layer) {
  const p = feature.properties;

  // Build popup HTML based on available properties
  const popup = `
    <div style="min-width:180px; font-size:13px; line-height:1.7;">
      <b style="font-size:14px; color:#1b4332;">${p.name}</b><br>
      <span style="background:#e9f5ec; padding:1px 6px; border-radius:10px;
                   font-size:11px;">${p.category || 'N/A'}</span><br>
      <b>District:</b> ${p.district || 'N/A'}<br>
      <b>Province:</b> ${p.province || 'N/A'}<br>
      ${p.description
        ? `<hr style="margin:5px 0;"><i style="font-size:12px;">${p.description}</i>`
        : ''}
      ${p.contact
        ? `<br><b>Contact:</b> ${p.contact}`
        : ''}
      ${p.photo_url
        ? `<br><img src="${p.photo_url}"
               style="width:100%; margin-top:6px; border-radius:4px;">`
        : ''}
    </div>
  `;

  layer.bindPopup(popup);
}


// ============================================================
// SECTION 5: LAYER CONTROL
// Top-right corner control to switch base maps and toggle overlays
// ============================================================
const baseMaps = {
  'OpenStreetMap':  osm,
  'Satellite':      satellite,
  'Terrain':        terrain,
  'Topographic':    topo
};

const overlayMaps = {
  'Province Boundary':    provinceLayer,
  'District Boundary':    districtLayer,
  'Local Level Boundary': localLayer,
  'Heritage Sites':       heritageLayer,
  'Hotels':               hotelLayer,
  'Restaurants':          restaurantLayer
};

L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);


// ============================================================
// SECTION 6: LOAD DATA FROM BACKEND
// Fetches GeoJSON from the Express API and adds to layers
// ============================================================

// Generic loader — fetches a URL and adds data to a Leaflet layer
async function loadLayer(url, layerObj) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Failed to load ${url}: ${response.status}`);
      return;
    }

    const data = await response.json();
    layerObj.addData(data);

  } catch (err) {
    console.error(`Error loading ${url}:`, err.message);
  }
}

// Load all tourism point layers
loadLayer(`${API_BASE}/heritage`,     heritageLayer);
loadLayer(`${API_BASE}/hotels`,       hotelLayer);
loadLayer(`${API_BASE}/restaurants`,  restaurantLayer);

// Load boundary layers
loadLayer(`${API_BASE}/boundaries/province`, provinceLayer);
loadLayer(`${API_BASE}/boundaries/district`, districtLayer);
loadLayer(`${API_BASE}/boundaries/local`,    localLayer);

// Add layers to map (visible by default)
provinceLayer.addTo(map);
districtLayer.addTo(map);
heritageLayer.addTo(map);
hotelLayer.addTo(map);
restaurantLayer.addTo(map);


// ============================================================
// SECTION 7: ATTRIBUTE TOOL 1 — Search by Place Name
// Searches loaded layers for a matching name and zooms to it
// Also calls the backend /api/search for a full DB search
// ============================================================
async function searchPlace() {
  const query = document.getElementById('searchBox').value.trim();

  if (!query) {
    alert('Please enter a place name to search.');
    return;
  }

  // First try searching already-loaded map layers
  let found = null;
  const allLayers = [heritageLayer, hotelLayer, restaurantLayer];

  allLayers.forEach(layer => {
    layer.eachLayer(l => {
      const name = l.feature?.properties?.name || '';
      if (name.toLowerCase().includes(query.toLowerCase())) {
        found = l;
      }
    });
  });

  if (found) {
    // Zoom to the found feature and open its popup
    map.setView(found.getLatLng(), 14);
    found.openPopup();
    return;
  }

  // If not found in loaded layers, ask the backend
  try {
    const response = await fetch(`${API_BASE}/search?name=${encodeURIComponent(query)}`);
    const data = await response.json();

    if (data.features && data.features.length > 0) {
      const coords = data.features[0].geometry.coordinates;
      // GeoJSON is [lng, lat] but Leaflet needs [lat, lng]
      map.setView([coords[1], coords[0]], 14);
      showToolResult(`Found: <b>${data.features[0].properties.name}</b>
        (${data.features[0].properties.type})`);
    } else {
      alert(`No results found for "${query}"`);
    }
  } catch (err) {
    console.error('Search error:', err);
    alert('Search failed. Make sure the backend is running.');
  }
}

// Allow pressing Enter in the search box
document.getElementById('searchBox').addEventListener('keypress', e => {
  if (e.key === 'Enter') searchPlace();
});


// ============================================================
// SECTION 8: ATTRIBUTE TOOL 2 & 3 — Filter by Category & Province
// Clears layers and reloads from backend with filter parameters
// ============================================================
async function applyFilters() {
  const categoryValue = document.getElementById('categoryFilter').value;
  const province      = document.getElementById('provinceFilter').value;

  // categoryValue format is "type-Category" e.g. "heritage-Temple"
  // or "all" for everything
  let type     = null;
  let category = null;

  if (categoryValue !== 'all') {
    const parts = categoryValue.split('-');
    type     = parts[0];               // "heritage", "hotels", "restaurants"
    category = parts.slice(1).join('-'); // "Mid-range", "UNESCO Site", etc.
  }

  // Build query string
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  if (province !== 'all') params.append('province', province);
  const qs = params.toString() ? '?' + params.toString() : '';

  // Clear and reload based on which type is selected
  if (!type || type === 'heritage') {
    heritageLayer.clearLayers();
    await loadLayer(`${API_BASE}/heritage${qs}`, heritageLayer);
  }
  if (!type || type === 'hotels') {
    hotelLayer.clearLayers();
    await loadLayer(`${API_BASE}/hotels${qs}`, hotelLayer);
  }
  if (!type || type === 'restaurants') {
    restaurantLayer.clearLayers();
    await loadLayer(`${API_BASE}/restaurants${qs}`, restaurantLayer);
  }

  showToolResult(`Filters applied: 
    ${type ? type : 'All layers'} | 
    ${category ? category : 'All categories'} | 
    Province: ${province !== 'all' ? province : 'All'}`);
}

// Reset all filters and reload original data
async function resetFilters() {
  document.getElementById('categoryFilter').value = 'all';
  document.getElementById('provinceFilter').value = 'all';

  heritageLayer.clearLayers();
  hotelLayer.clearLayers();
  restaurantLayer.clearLayers();

  await loadLayer(`${API_BASE}/heritage`,    heritageLayer);
  await loadLayer(`${API_BASE}/hotels`,      hotelLayer);
  await loadLayer(`${API_BASE}/restaurants`, restaurantLayer);

  showToolResult('Filters reset. Showing all data.');
}


// ============================================================
// SECTION 9: TRACK LAST CLICKED POINT ON MAP
// Used by spatial tools that need a reference location
// ============================================================
let lastClick = null;

map.on('click', function (e) {
  lastClick = e.latlng;
});


// ============================================================
// SECTION 10: SPATIAL TOOL 1 — Buffer + Point-in-Polygon
// Draws a 1km buffer circle around a clicked point using Turf.js
// Then checks which heritage sites fall inside (point-in-polygon)
// ============================================================
let bufferMode  = false;
let bufferGroup = L.layerGroup().addTo(map);

function toggleBufferMode() {
  bufferMode = !bufferMode;
  const btn = document.getElementById('bufferBtn');

  if (bufferMode) {
    btn.classList.add('active');
    showToolResult('Buffer mode ON — click anywhere on the map.');
  } else {
    btn.classList.remove('active');
    bufferGroup.clearLayers();
    showToolResult('Buffer mode OFF.');
  }
}

map.on('click', function (e) {
  if (!bufferMode) return;

  bufferGroup.clearLayers();

  // Create a Turf point from clicked coordinates
  const clickedPoint = turf.point([e.latlng.lng, e.latlng.lat]);

  // Create a 1km buffer circle around that point
  const buffered = turf.buffer(clickedPoint, 1, { units: 'kilometers' });

  // Draw the buffer on the map
  L.geoJSON(buffered, {
    style: {
      color: '#06d6a0',
      fillColor: '#06d6a0',
      fillOpacity: 0.15,
      weight: 2
    }
  }).addTo(bufferGroup);

  // Mark the clicked point
  L.circleMarker(e.latlng, {
    radius: 5, color: '#06d6a0', fillColor: '#06d6a0', fillOpacity: 1
  }).addTo(bufferGroup);

  // Point-in-polygon: find heritage sites inside the buffer
  const insideNames = [];
  heritageLayer.eachLayer(layer => {
    const coords = layer.feature.geometry.coordinates;
    const pt     = turf.point(coords);
    if (turf.booleanPointInPolygon(pt, buffered)) {
      insideNames.push(layer.feature.properties.name);
    }
  });

  showToolResult(`
    <b>Buffer:</b> 1km radius<br>
    <b>Heritage sites inside:</b><br>
    ${insideNames.length > 0
      ? insideNames.map(n => `• ${n}`).join('<br>')
      : 'None found in this area'}
  `);
});


// ============================================================
// SECTION 11: SPATIAL TOOL 2 — Distance Measurement
// User clicks two points, Turf.js calculates distance between them
// ============================================================
let distanceMode   = false;
let distancePoints = [];
let distanceGroup  = L.layerGroup().addTo(map);

function toggleDistanceMode() {
  distanceMode = !distanceMode;
  const btn = document.getElementById('distanceBtn');

  distancePoints = [];
  distanceGroup.clearLayers();

  if (distanceMode) {
    btn.classList.add('active');
    showToolResult('Distance mode ON — click Point 1 on the map.');
  } else {
    btn.classList.remove('active');
    showToolResult('Distance mode OFF.');
  }
}

map.on('click', function (e) {
  if (!distanceMode) return;

  distancePoints.push(e.latlng);

  // Draw a small marker at each clicked point
  L.circleMarker(e.latlng, {
    radius: 5, color: '#0077b6',
    fillColor: '#0077b6', fillOpacity: 1
  })
  .bindTooltip(`Point ${distancePoints.length}`)
  .addTo(distanceGroup);

  if (distancePoints.length === 1) {
    showToolResult('Point 1 set — now click Point 2.');
  }

  if (distancePoints.length === 2) {
    // Draw line between the two points
    L.polyline(distancePoints, {
      color: '#0077b6', weight: 2, dashArray: '6,4'
    }).addTo(distanceGroup);

    // Calculate distance using Turf.js
    const from = turf.point([distancePoints[0].lng, distancePoints[0].lat]);
    const to   = turf.point([distancePoints[1].lng, distancePoints[1].lat]);
    const dist = turf.distance(from, to, { units: 'kilometers' });

    showToolResult(`
      <b>Distance measured:</b><br>
      📏 ${dist.toFixed(2)} km
      (${(dist * 1000).toFixed(0)} meters)
    `);

    // Reset for next measurement
    distancePoints = [];
  }
});


// ============================================================
// SECTION 12: SPATIAL TOOL 3 — Nearest Location Finder
// Sends last clicked point to backend, PostGIS finds nearest places
// ============================================================
async function findNearest(type) {
  if (!lastClick) {
    alert('Click somewhere on the map first to set your location.');
    return;
  }

  const typeLabels = {
    hotels:      '🏨 Hotels',
    restaurants: '🍽️ Restaurants',
    heritage:    '🏛️ Heritage Sites'
  };

  showToolResult(`Finding nearest ${typeLabels[type]}...`);

  try {
    const url = `${API_BASE}/nearest?lat=${lastClick.lat}&lng=${lastClick.lng}&type=${type}&limit=3`;
    const response = await fetch(url);
    const data = await response.json();

    if (!data.features || data.features.length === 0) {
      showToolResult('No results found. Make sure data is loaded in the database.');
      return;
    }

    // Show results in tool result box
    const lines = data.features.map(f => {
      const km = (f.properties.distance_meters / 1000).toFixed(2);
      return `• <b>${f.properties.name}</b> — ${km} km`;
    });

    showToolResult(`
      <b>Nearest ${typeLabels[type]}:</b><br>
      (from your last clicked point)<br><br>
      ${lines.join('<br>')}
    `);

    // Highlight the nearest results on the map temporarily
    data.features.forEach(f => {
      const coords = f.geometry.coordinates;
      L.circleMarker([coords[1], coords[0]], {
        radius: 10,
        color: '#f72585',
        fillColor: '#f72585',
        fillOpacity: 0.5,
        weight: 2
      })
      .bindPopup(`<b>${f.properties.name}</b><br>${(f.properties.distance_meters/1000).toFixed(2)} km away`)
      .addTo(map)
      .openPopup();
    });

  } catch (err) {
    console.error('Nearest search error:', err);
    showToolResult('Error finding nearest. Is the backend running?');
  }
}


// ============================================================
// SECTION 13: ATTRIBUTE TOOL 4 — Attribute Table
// Shows a scrollable table of all features in a selected layer
// ============================================================
function showAttributeTable() {
  const layerSelect = document.getElementById('tableLayerSelect').value;

  const layerMap = {
    heritage:    heritageLayer,
    hotels:      hotelLayer,
    restaurants: restaurantLayer
  };

  const layer = layerMap[layerSelect];
  const rows  = [];

  layer.eachLayer(l => {
    const p = l.feature.properties;
    rows.push(`
      <tr>
        <td>${p.name || ''}</td>
        <td>${p.category || ''}</td>
        <td>${p.district || ''}</td>
        <td>${p.province || ''}</td>
      </tr>
    `);
  });

  if (rows.length === 0) {
    document.getElementById('tableContent').innerHTML =
      '<p style="padding:10px;">No data loaded yet.</p>';
  } else {
    document.getElementById('tableContent').innerHTML = `
      <h3 style="margin:6px 0; font-size:14px; color:#1b4332;">
        ${layerSelect.charAt(0).toUpperCase() + layerSelect.slice(1)} 
        (${rows.length} records)
      </h3>
      <table style="width:100%; border-collapse:collapse; font-size:12px;">
        <thead style="background:#2d6a4f; color:white;">
          <tr>
            <th style="padding:6px; text-align:left;">Name</th>
            <th style="padding:6px; text-align:left;">Category</th>
            <th style="padding:6px; text-align:left;">District</th>
            <th style="padding:6px; text-align:left;">Province</th>
          </tr>
        </thead>
        <tbody>
          ${rows.join('')}
        </tbody>
      </table>
    `;

    // Style table rows alternately
    document.querySelectorAll('#tableContent tbody tr').forEach((row, i) => {
      row.style.background = i % 2 === 0 ? '#f9f9f9' : 'white';
    });
  }

  document.getElementById('tableModal').style.display = 'block';
}


// ============================================================
// SECTION 14: HELPER — Show result in the tool result box
// ============================================================
function showToolResult(html) {
  const box = document.getElementById('toolResult');
  box.style.display = 'block';
  box.innerHTML = html;
}