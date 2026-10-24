/**
 * Process OpenStreetMap XML data to extract useful places for Bangkok
 * 
 * Input: C:\Users\Admin\Downloads\map (399MB OSM XML)
 * Output: Compact GeoJSON files by category
 * 
 * This script:
 * 1. Streams the large XML file (no full load into memory)
 * 2. Extracts named places with useful categories
 * 3. Handles both nodes and ways (calculates center for ways)
 * 4. Exports compact GeoJSON files
 */

const fs = require('fs');
const path = require('path');
const { Transform } = require('stream');

// Configuration
const INPUT_FILE = 'C:\\Users\\Admin\\Downloads\\map';
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'data', 'osm-places');
const SNAPSHOT_DATE = '2026-10-23';

// Categories we want to extract (prioritized)
const USEFUL_CATEGORIES = {
  // Cafes & Restaurants
  'amenity=cafe': { category: 'cafe', priority: 1 },
  'amenity=restaurant': { category: 'restaurant', priority: 1 },
  'amenity=fast_food': { category: 'restaurant', priority: 2 },
  'amenity=food_court': { category: 'restaurant', priority: 2 },
  'amenity=bar': { category: 'bar', priority: 2 },
  'amenity=pub': { category: 'bar', priority: 2 },
  
  // Shops & Markets
  'shop=convenience': { category: 'shop', priority: 2 },
  'shop=supermarket': { category: 'shop', priority: 1 },
  'shop=mall': { category: 'shopping', priority: 1 },
  'shop=department_store': { category: 'shopping', priority: 1 },
  'shop=books': { category: 'shop', priority: 2 },
  'shop=clothes': { category: 'shop', priority: 3 },
  'amenity=marketplace': { category: 'market', priority: 1 },
  
  // Parks & Gardens
  'leisure=park': { category: 'park', priority: 1 },
  'leisure=garden': { category: 'park', priority: 1 },
  'landuse=recreation_ground': { category: 'park', priority: 2 },
  
  // Museums & Attractions
  'tourism=museum': { category: 'museum', priority: 1 },
  'tourism=gallery': { category: 'museum', priority: 1 },
  'tourism=attraction': { category: 'attraction', priority: 1 },
  'historic=monument': { category: 'attraction', priority: 1 },
  'tourism=viewpoint': { category: 'attraction', priority: 2 },
  
  // Leisure & Activities
  'leisure=fitness_centre': { category: 'fitness', priority: 2 },
  'leisure=sports_centre': { category: 'fitness', priority: 2 },
  'amenity=cinema': { category: 'entertainment', priority: 1 },
  'amenity=theatre': { category: 'entertainment', priority: 1 },
  'amenity=arts_centre': { category: 'entertainment', priority: 1 },
  'leisure=swimming_pool': { category: 'fitness', priority: 2 },
  
  // Hotels & Accommodation
  'tourism=hotel': { category: 'hotel', priority: 2 },
  'tourism=hostel': { category: 'hotel', priority: 3 },
  
  // Named buildings
  'building=commercial': { category: 'building', priority: 3 },
  'building=retail': { category: 'building', priority: 3 },
};

// Stats tracking
const stats = {
  nodesProcessed: 0,
  waysProcessed: 0,
  placesExtracted: 0,
  byCategory: {},
};

// Storage for nodes (we need this to resolve way coordinates)
const nodeCoords = new Map(); // id -> {lat, lon}

// Storage for extracted places
const places = [];

// Current element being parsed
let currentElement = null;
let currentTags = {};

/**
 * Simple XML parser for OSM format
 */
class OSMParser extends Transform {
  constructor() {
    super({ objectMode: true });
    this.buffer = '';
  }

  _transform(chunk, encoding, callback) {
    this.buffer += chunk.toString();
    
    // Process complete elements
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop(); // Keep incomplete line

    for (const line of lines) {
      this.parseLine(line);
    }
    
    callback();
  }

  _flush(callback) {
    if (this.buffer) {
      this.parseLine(this.buffer);
    }
    callback();
  }

  parseLine(line) {
    const trimmed = line.trim();
    
    // Start of node
    if (trimmed.startsWith('<node ')) {
      stats.nodesProcessed++;
      const idMatch = trimmed.match(/id="(\d+)"/);
      const latMatch = trimmed.match(/lat="([^"]+)"/);
      const lonMatch = trimmed.match(/lon="([^"]+)"/);
      
      if (idMatch && latMatch && lonMatch) {
        const id = idMatch[1];
        const lat = parseFloat(latMatch[1]);
        const lon = parseFloat(lonMatch[1]);
        
        // Store node coordinates for way resolution
        nodeCoords.set(id, { lat, lon });
        
        currentElement = {
          type: 'node',
          id,
          lat,
          lon,
        };
        currentTags = {};
      }
      
      if (stats.nodesProcessed % 100000 === 0) {
        console.log(`Processed ${stats.nodesProcessed} nodes...`);
      }
    }
    
    // Start of way
    else if (trimmed.startsWith('<way ')) {
      stats.waysProcessed++;
      const idMatch = trimmed.match(/id="(\d+)"/);
      
      if (idMatch) {
        currentElement = {
          type: 'way',
          id: idMatch[1],
          nodes: [],
        };
        currentTags = {};
      }
      
      if (stats.waysProcessed % 10000 === 0) {
        console.log(`Processed ${stats.waysProcessed} ways...`);
      }
    }
    
    // Node reference in way
    else if (trimmed.startsWith('<nd ') && currentElement?.type === 'way') {
      const refMatch = trimmed.match(/ref="(\d+)"/);
      if (refMatch) {
        currentElement.nodes.push(refMatch[1]);
      }
    }
    
    // Tag
    else if (trimmed.startsWith('<tag ')) {
      const keyMatch = trimmed.match(/k="([^"]+)"/);
      const valueMatch = trimmed.match(/v="([^"]+)"/);
      
      if (keyMatch && valueMatch) {
        currentTags[keyMatch[1]] = valueMatch[1];
      }
    }
    
    // End of node
    else if (trimmed === '</node>') {
      if (currentElement?.type === 'node') {
        this.processNode(currentElement, currentTags);
      }
      currentElement = null;
      currentTags = {};
    }
    
    // End of way
    else if (trimmed === '</way>') {
      if (currentElement?.type === 'way') {
        this.processWay(currentElement, currentTags);
      }
      currentElement = null;
      currentTags = {};
    }
  }

  processNode(node, tags) {
    // Check if this node has useful tags
    const name = tags.name || tags['name:en'] || tags['name:th'];
    if (!name) return; // Skip unnamed places

    // Check for useful category
    const categoryInfo = this.findCategory(tags);
    if (!categoryInfo) return;

    // Extract place data
    const place = {
      id: `osm-node-${node.id}`,
      name,
      nameTh: tags['name:th'] || null,
      lat: node.lat,
      lon: node.lon,
      category: categoryInfo.category,
      priority: categoryInfo.priority,
      tags: this.extractUsefulTags(tags),
      osmType: 'node',
      osmId: node.id,
    };

    places.push(place);
    stats.placesExtracted++;
    stats.byCategory[categoryInfo.category] = (stats.byCategory[categoryInfo.category] || 0) + 1;
  }

  processWay(way, tags) {
    // Check if this way has useful tags
    const name = tags.name || tags['name:en'] || tags['name:th'];
    if (!name) return; // Skip unnamed places

    // Check for useful category
    const categoryInfo = this.findCategory(tags);
    if (!categoryInfo) return;

    // Calculate center point from way nodes
    const coords = way.nodes
      .map(nodeId => nodeCoords.get(nodeId))
      .filter(Boolean);

    if (coords.length === 0) return; // No coordinates available

    // Calculate centroid
    const lat = coords.reduce((sum, c) => sum + c.lat, 0) / coords.length;
    const lon = coords.reduce((sum, c) => sum + c.lon, 0) / coords.length;

    // Extract place data
    const place = {
      id: `osm-way-${way.id}`,
      name,
      nameTh: tags['name:th'] || null,
      lat,
      lon,
      category: categoryInfo.category,
      priority: categoryInfo.priority,
      tags: this.extractUsefulTags(tags),
      osmType: 'way',
      osmId: way.id,
    };

    places.push(place);
    stats.placesExtracted++;
    stats.byCategory[categoryInfo.category] = (stats.byCategory[categoryInfo.category] || 0) + 1;
  }

  findCategory(tags) {
    // Check all tag combinations
    for (const [key, value] of Object.entries(tags)) {
      const tagKey = `${key}=${value}`;
      if (USEFUL_CATEGORIES[tagKey]) {
        return USEFUL_CATEGORIES[tagKey];
      }
    }
    return null;
  }

  extractUsefulTags(tags) {
    const useful = {};
    
    // Preserve useful fields
    const keepFields = [
      'addr:street', 'addr:housenumber', 'addr:city',
      'phone', 'website', 'opening_hours',
      'cuisine', 'description', 'wheelchair',
      'internet_access', 'wifi'
    ];

    for (const field of keepFields) {
      if (tags[field]) {
        useful[field] = tags[field];
      }
    }

    return useful;
  }
}

/**
 * Main processing function
 */
async function processOSMData() {
  console.log('=== OSM Data Processor ===\n');
  console.log(`Input file: ${INPUT_FILE}`);
  console.log(`Snapshot date: ${SNAPSHOT_DATE}`);
  console.log(`Output directory: ${OUTPUT_DIR}\n`);

  // Create output directory
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  console.log('Starting to process OSM XML file (this will take a few minutes)...\n');

  const startTime = Date.now();

  // Create read stream and parser
  const readStream = fs.createReadStream(INPUT_FILE, { encoding: 'utf8', highWaterMark: 64 * 1024 });
  const parser = new OSMParser();

  // Pipe through parser
  await new Promise((resolve, reject) => {
    readStream
      .pipe(parser)
      .on('finish', resolve)
      .on('error', reject);
  });

  const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n=== Processing Complete ===\n');
  console.log(`Total nodes processed: ${stats.nodesProcessed.toLocaleString()}`);
  console.log(`Total ways processed: ${stats.waysProcessed.toLocaleString()}`);
  console.log(`Places extracted: ${stats.placesExtracted.toLocaleString()}`);
  console.log(`Processing time: ${processingTime}s\n`);

  console.log('Places by category:');
  for (const [category, count] of Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${category}: ${count.toLocaleString()}`);
  }

  // Export data
  console.log('\nExporting data...');
  await exportData();

  console.log('\n✅ Complete!');
}

/**
 * Export places to GeoJSON files
 */
async function exportData() {
  // Sort by priority and name
  places.sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return a.name.localeCompare(b.name);
  });

  // Group by category
  const byCategory = {};
  for (const place of places) {
    if (!byCategory[place.category]) {
      byCategory[place.category] = [];
    }
    byCategory[place.category].push(place);
  }

  // Export each category
  let totalSize = 0;

  for (const [category, categoryPlaces] of Object.entries(byCategory)) {
    const geojson = {
      type: 'FeatureCollection',
      metadata: {
        source: 'OpenStreetMap',
        snapshotDate: SNAPSHOT_DATE,
        category,
        count: categoryPlaces.length,
        attribution: '© OpenStreetMap contributors',
        license: 'ODbL',
        url: 'https://www.openstreetmap.org/copyright',
      },
      features: categoryPlaces.map(place => ({
        type: 'Feature',
        id: place.id,
        geometry: {
          type: 'Point',
          coordinates: [place.lon, place.lat],
        },
        properties: {
          name: place.name,
          nameTh: place.nameTh,
          category: place.category,
          osmType: place.osmType,
          osmId: place.osmId,
          ...place.tags,
        },
      })),
    };

    const filename = `${category}.geojson`;
    const filepath = path.join(OUTPUT_DIR, filename);
    fs.writeFileSync(filepath, JSON.stringify(geojson, null, 2));

    const size = fs.statSync(filepath).size;
    totalSize += size;

    console.log(`  ✓ ${filename} - ${categoryPlaces.length} places (${(size / 1024).toFixed(1)} KB)`);
  }

  // Create index file
  const index = {
    metadata: {
      source: 'OpenStreetMap',
      snapshotDate: SNAPSHOT_DATE,
      totalPlaces: places.length,
      attribution: '© OpenStreetMap contributors',
      license: 'ODbL',
      url: 'https://www.openstreetmap.org/copyright',
    },
    categories: Object.keys(byCategory).map(cat => ({
      id: cat,
      count: byCategory[cat].length,
      file: `${cat}.geojson`,
    })),
  };

  const indexPath = path.join(OUTPUT_DIR, 'index.json');
  fs.writeFileSync(indexPath, JSON.stringify(index, null, 2));
  console.log(`  ✓ index.json - ${(fs.statSync(indexPath).size / 1024).toFixed(1)} KB`);

  console.log(`\nTotal output size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
}

// Run the processor
processOSMData().catch(err => {
  console.error('Error processing OSM data:', err);
  process.exit(1);
});
