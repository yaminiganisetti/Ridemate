import LOCATIONS from '../data/locations.json'

// Normalize: lowercase, remove spaces/punctuation, handle common substitutions
const norm = (s = '') => s.toLowerCase()
  .replace(/[\s\-_.,'()/]/g, '')
  .replace(/aa/g, 'a').replace(/ee/g, 'i').replace(/oo/g, 'u')
  .replace(/th/g, 't').replace(/sh/g, 's').replace(/ph/g, 'p')

// Levenshtein distance for fuzzy matching
function lev(a, b) {
  const m = a.length, n = b.length
  const dp = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0)
  )
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] = a[i-1] === b[j-1]
        ? dp[i-1][j-1]
        : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
  return dp[m][n]
}

// Score a location against a query
function score(loc, q) {
  const qn = norm(q)
  const qLower = q.toLowerCase()
  let best = 0

  const fields = [
    loc.name, loc.tamilName,
    ...(loc.aliases || []),
    ...(loc.keywords || []),
  ]

  for (const field of fields) {
    if (!field) continue
    const f = field.toLowerCase()
    const fn = norm(field)

    // Exact match
    if (f === qLower || fn === qn) return 100

    // Starts with
    if (f.startsWith(qLower) || fn.startsWith(qn)) { best = Math.max(best, 90); continue }

    // Contains
    if (f.includes(qLower) || fn.includes(qn)) { best = Math.max(best, 75); continue }

    // Tamil character match
    if (loc.tamilName?.includes(q)) { best = Math.max(best, 85); continue }

    // Fuzzy: only if query >= 3 chars
    if (qn.length >= 3) {
      const d = lev(qn, fn.slice(0, qn.length + 2))
      const ratio = 1 - d / Math.max(qn.length, fn.length)
      if (ratio > 0.72) best = Math.max(best, Math.round(ratio * 65))
    }
  }
  return best
}

/**
 * Search local dataset.
 * Returns array of result objects sorted by score.
 * @param {string} query
 * @param {number} limit
 * @returns {Array}
 */
export function searchLocal(query, limit = 8) {
  if (!query || query.trim().length < 2) return []
  const q = query.trim()
  return LOCATIONS
    .map(loc => ({ loc, score: score(loc, q) }))
    .filter(({ score }) => score >= 40)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ loc }) => ({
      id: loc.id,
      display_name: loc.name + (loc.tamilName ? ` (${loc.tamilName})` : '') +
        (loc.district ? `, ${loc.district}` : '') +
        (loc.state ? `, ${loc.state}` : ''),
      name: loc.name,
      tamilName: loc.tamilName,
      lat: loc.lat,
      lng: loc.lng,
      type: loc.type,
      district: loc.district,
      state: loc.state,
      fareFromBase: loc.fareFromBase,
      source: 'local',
    }))
}

/**
 * Search via Nominatim (OpenStreetMap) — fallback only.
 */
export async function searchNominatim(query) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1&countrycodes=in`
  const res = await fetch(url, { headers: { 'Accept-Language': 'en' } })
  if (!res.ok) return []
  const data = await res.json()
  return data.map(r => ({
    id: `osm_${r.osm_id}`,
    display_name: r.display_name,
    name: r.display_name.split(',')[0],
    tamilName: '',
    lat: parseFloat(r.lat),
    lng: parseFloat(r.lon),
    type: r.type,
    district: r.address?.county || r.address?.state_district || '',
    state: r.address?.state || '',
    fareFromBase: null,
    source: 'nominatim',
  }))
}

/**
 * Combined search: local first, Nominatim as fallback.
 * @param {string} query
 * @returns {Promise<Array>}
 */
export async function searchLocations(query) {
  if (!query || query.trim().length < 2) return []

  const local = searchLocal(query, 6)
  if (local.length >= 3) return local   // enough local results → skip Nominatim

  try {
    const remote = await searchNominatim(query)
    // Merge: local first, then Nominatim (no duplicates by lat/lng)
    const seen = new Set(local.map(l => l.name.toLowerCase()))
    const unique = remote.filter(r => !seen.has(r.name.toLowerCase()))
    return [...local, ...unique].slice(0, 8)
  } catch {
    return local
  }
}

/** Get a single location by id from local dataset */
export function getLocationById(id) {
  return LOCATIONS.find(l => l.id === id) || null
}

/** All locations list for dropdowns */
export function getAllLocations() { return LOCATIONS }
