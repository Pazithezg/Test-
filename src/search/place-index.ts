/**
 * Place Index - Load and index all 12,207 places from OSM data
 * 
 * This runs ONCE on server startup and keeps everything in memory.
 * Fast search without hitting disk or database.
 */

import fs from 'fs';
import path from 'path';

export interface IndexedPlace {
  id: string;
  name: string;
  category: string;
  latitude: number | null;
  longitude: number | null;
  tags: Record<string, string>;
  nameNormalized: string;  // For fast searching
}

export class PlaceIndex {
  private places: IndexedPlace[] = [];
  private byCategory: Map<string, IndexedPlace[]> = new Map();
  private byNamePattern: Map<string, IndexedPlace[]> = new Map();
  private loaded: boolean = false;
  
  /**
   * Load all places from GeoJSON files
   */
  async load(): Promise<void> {
    if (this.loaded) return;
    
    const dataDir = path.join(process.cwd(), 'public', 'data', 'osm-places');
    const indexPath = path.join(dataDir, 'index.json');
    
    // Read index to get all category files
    const indexContent = fs.readFileSync(indexPath, 'utf-8');
    const index = JSON.parse(indexContent);
    
    console.log('[PlaceIndex] Loading places from', index.categories.length, 'categories');
    
    let totalLoaded = 0;
    
    // Load each category
    for (const cat of index.categories) {
      const filePath = path.join(dataDir, cat.file);
      
      try {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const geojson = JSON.parse(fileContent);
        
        for (const feature of geojson.features) {
          const props = feature.properties;
          const geometry = feature.geometry;
          
          // Extract coordinates
          let latitude: number | null = null;
          let longitude: number | null = null;
          
          if (geometry && geometry.type === 'Point' && geometry.coordinates) {
            [longitude, latitude] = geometry.coordinates;
          }
          
          // Create indexed place
          const place: IndexedPlace = {
            id: props.id || `${cat.id}-${totalLoaded}`,
            name: props.name || 'Unnamed',
            category: cat.id,
            latitude,
            longitude,
            tags: props.tags || {},
            nameNormalized: this.normalizeName(props.name || ''),
          };
          
          this.places.push(place);
          totalLoaded++;
          
          // Index by category
          if (!this.byCategory.has(cat.id)) {
            this.byCategory.set(cat.id, []);
          }
          this.byCategory.get(cat.id)!.push(place);
          
          // Index by name patterns (for fast lookup)
          this.indexByNamePatterns(place);
        }
        
        console.log(`[PlaceIndex] Loaded ${cat.count} places from ${cat.id}`);
      } catch (error) {
        console.error(`[PlaceIndex] Error loading ${cat.file}:`, error);
      }
    }
    
    this.loaded = true;
    console.log(`[PlaceIndex] Total places loaded: ${totalLoaded}`);
    console.log(`[PlaceIndex] Categories: ${this.byCategory.size}`);
    console.log(`[PlaceIndex] Name patterns: ${this.byNamePattern.size}`);
  }
  
  /**
   * Normalize Thai/English text for comparison
   */
  private normalizeName(name: string): string {
    return name.toLowerCase()
      .replace(/\s+/g, '')  // Remove spaces
      .replace(/[\u0E48-\u0E4B]/g, '');  // Remove Thai tone marks
  }
  
  /**
   * Index place by name patterns for fast lookup
   */
  private indexByNamePatterns(place: IndexedPlace): void {
    const name = place.nameNormalized;
    
    // Common patterns to index
    const patterns: string[] = [];
    
    // Exact name
    patterns.push(name);
    
    // Individual words (if space-separated)
    const words = place.name.toLowerCase().split(/\s+/);
    for (const word of words) {
      if (word.length >= 3) {  // Min 3 chars
        patterns.push(this.normalizeName(word));
      }
    }
    
    // Common keywords
    const keywords = ['วัด', 'ค่าย', 'สวน', 'ตลาด', 'ศูนย์', 'โรงแรม', 
                      'temple', 'camp', 'park', 'market', 'center', 'hotel'];
    for (const keyword of keywords) {
      if (name.includes(keyword.toLowerCase())) {
        patterns.push(keyword.toLowerCase());
      }
    }
    
    // Add to index
    for (const pattern of patterns) {
      if (!this.byNamePattern.has(pattern)) {
        this.byNamePattern.set(pattern, []);
      }
      this.byNamePattern.get(pattern)!.push(place);
    }
  }
  
  /**
   * Search places by categories
   */
  searchByCategories(categories: string[]): IndexedPlace[] {
    const results: IndexedPlace[] = [];
    
    for (const cat of categories) {
      const places = this.byCategory.get(cat) || [];
      results.push(...places);
    }
    
    return results;
  }
  
  /**
   * Search places by name patterns
   */
  searchByNamePatterns(patterns: string[]): IndexedPlace[] {
    const results = new Map<string, IndexedPlace>();
    
    for (const pattern of patterns) {
      const normalized = this.normalizeName(pattern);
      
      // Exact match in index
      const indexed = this.byNamePattern.get(normalized) || [];
      for (const place of indexed) {
        results.set(place.id, place);
      }
      
      // Fuzzy match in all places (fallback)
      for (const place of this.places) {
        if (place.nameNormalized.includes(normalized)) {
          results.set(place.id, place);
        }
      }
    }
    
    return Array.from(results.values());
  }
  
  /**
   * Get all places
   */
  getAllPlaces(): IndexedPlace[] {
    return this.places;
  }
  
  /**
   * Get place by ID
   */
  getById(id: string): IndexedPlace | undefined {
    return this.places.find(p => p.id === id);
  }
  
  /**
   * Get stats
   */
  getStats() {
    return {
      totalPlaces: this.places.length,
      categories: Array.from(this.byCategory.keys()),
      categoryCounts: Object.fromEntries(
        Array.from(this.byCategory.entries()).map(([cat, places]) => [cat, places.length])
      )
    };
  }
}

// Singleton instance
let placeIndexInstance: PlaceIndex | null = null;

export async function getPlaceIndex(): Promise<PlaceIndex> {
  if (!placeIndexInstance) {
    placeIndexInstance = new PlaceIndex();
    await placeIndexInstance.load();
  }
  return placeIndexInstance;
}
