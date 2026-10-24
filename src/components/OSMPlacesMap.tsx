'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

// Fix Leaflet default icon issue in Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface Place {
  id: string;
  name: string;
  nameTh: string | null;
  lat: number;
  lon: number;
  category: string;
  osmType: string;
  osmId: string;
  [key: string]: any;
}

interface OSMPlacesMapProps {
  initialCenter?: [number, number];
  initialZoom?: number;
  height?: string;
  categories?: string[];
}

/**
 * Component to handle markers with clustering
 */
function PlaceMarkers({ places, onPlaceClick }: { places: Place[]; onPlaceClick?: (place: Place) => void }) {
  const map = useMap();
  const markersRef = useRef<L.MarkerClusterGroup | null>(null);

  useEffect(() => {
    // Dynamically import MarkerClusterGroup
    import('leaflet.markercluster').then((MarkerCluster) => {
      if (!markersRef.current) {
        // @ts-ignore
        markersRef.current = L.markerClusterGroup({
          chunkedLoading: true,
          spiderfyOnMaxZoom: true,
          showCoverageOnHover: false,
          zoomToBoundsOnClick: true,
          maxClusterRadius: 60,
        });
        map.addLayer(markersRef.current);
      }

      // Clear existing markers
      markersRef.current!.clearLayers();

      // Add markers for places
      places.forEach((place) => {
        const marker = L.marker([place.lat, place.lon]);
        
        marker.bindPopup(`
          <div style="min-width: 200px;">
            <strong style="font-size: 1.05rem; color: #0284c7;">${place.name}</strong>
            ${place.nameTh ? `<br/><span style="color: #64748b;">${place.nameTh}</span>` : ''}
            <br/>
            <span style="font-size: 0.85rem; color: #94a3b8;">
              📍 ${place.category} • OSM ${place.osmType}
            </span>
            ${place['addr:street'] ? `<br/><span style="font-size: 0.85rem;">🏠 ${place['addr:street']}</span>` : ''}
            ${place.phone ? `<br/><span style="font-size: 0.85rem;">📞 ${place.phone}</span>` : ''}
            ${place.opening_hours ? `<br/><span style="font-size: 0.85rem;">🕒 ${place.opening_hours}</span>` : ''}
            <br/>
            <a href="https://www.openstreetmap.org/${place.osmType}/${place.osmId}" 
               target="_blank" 
               style="font-size: 0.85rem; color: #38bdf8;">
              View on OpenStreetMap →
            </a>
          </div>
        `);

        if (onPlaceClick) {
          marker.on('click', () => onPlaceClick(place));
        }

        markersRef.current!.addLayer(marker);
      });
    });

    return () => {
      if (markersRef.current) {
        markersRef.current.clearLayers();
      }
    };
  }, [places, map, onPlaceClick]);

  return null;
}

export default function OSMPlacesMap({
  initialCenter = [13.7563, 100.5018], // Bangkok center
  initialZoom = 13,
  height = '600px',
  categories = ['cafe', 'restaurant', 'museum', 'park', 'shopping'],
}: OSMPlacesMapProps) {
  const [selectedCategories, setSelectedCategories] = useState<string[]>(categories);
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<{ total: number; displayed: number }>({ total: 0, displayed: 0 });

  // Load places from GeoJSON files
  useEffect(() => {
    loadPlaces();
  }, [selectedCategories]);

  async function loadPlaces() {
    setLoading(true);
    try {
      const loadedPlaces: Place[] = [];

      // Load only selected categories to save memory
      for (const category of selectedCategories) {
        try {
          const response = await fetch(`/data/osm-places/${category}.geojson`);
          if (!response.ok) continue;
          
          const geojson = await response.json();
          
          // Convert GeoJSON features to Place objects
          const categoryPlaces = geojson.features.map((feature: any) => ({
            id: feature.id,
            name: feature.properties.name,
            nameTh: feature.properties.nameTh,
            lat: feature.geometry.coordinates[1],
            lon: feature.geometry.coordinates[0],
            category: feature.properties.category,
            osmType: feature.properties.osmType,
            osmId: feature.properties.osmId,
            ...feature.properties,
          }));

          loadedPlaces.push(...categoryPlaces);
        } catch (err) {
          console.warn(`Failed to load category ${category}:`, err);
        }
      }

      setPlaces(loadedPlaces);
      setStats({ total: loadedPlaces.length, displayed: loadedPlaces.length });
    } catch (err) {
      console.error('Failed to load places:', err);
    } finally {
      setLoading(false);
    }
  }

  function toggleCategory(category: string) {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  }

  const categoryConfig = {
    cafe: { label: '☕ คาเฟ่', color: '#d97706' },
    restaurant: { label: '🍴 ร้านอาหาร', color: '#dc2626' },
    bar: { label: '🍺 บาร์/ผับ', color: '#7c3aed' },
    shop: { label: '🛍️ ร้านค้า', color: '#2563eb' },
    shopping: { label: '🏬 ห้างสรรพสินค้า', color: '#0891b2' },
    market: { label: '🏪 ตลาด', color: '#059669' },
    park: { label: '🌳 สวนสาธารณะ', color: '#16a34a' },
    museum: { label: '🏛️ พิพิธภัณฑ์', color: '#8b5cf6' },
    attraction: { label: '🎭 แหล่งท่องเที่ยว', color: '#ec4899' },
    entertainment: { label: '🎬 บันเทิง', color: '#f59e0b' },
    fitness: { label: '💪 ฟิตเนส/กีฬา', color: '#10b981' },
    hotel: { label: '🏨 โรงแรม', color: '#64748b' },
    building: { label: '🏢 อาคาร', color: '#475569' },
  };

  return (
    <div>
      {/* Category filters */}
      <div style={{ marginBottom: '1rem' }}>
        <div style={{ marginBottom: '0.75rem' }}>
          <strong style={{ color: '#f1f5f9', fontSize: '1.05rem' }}>
            🏷️ เลือกหมวดหมู่ที่ต้องการแสดง:
          </strong>
          <span style={{ marginLeft: '0.75rem', color: '#94a3b8', fontSize: '0.9rem' }}>
            {loading ? 'กำลังโหลด...' : `แสดง ${stats.displayed.toLocaleString()} จาก ${stats.total.toLocaleString()} สถานที่`}
          </span>
        </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {Object.entries(categoryConfig).map(([category, config]) => (
            <button
              key={category}
              onClick={() => toggleCategory(category)}
              style={{
                padding: '0.5rem 0.9rem',
                borderRadius: '8px',
                border: '2px solid',
                borderColor: selectedCategories.includes(category) ? config.color : '#475569',
                background: selectedCategories.includes(category) ? config.color + '22' : 'transparent',
                color: selectedCategories.includes(category) ? '#f1f5f9' : '#94a3b8',
                fontSize: '0.85rem',
                fontWeight: selectedCategories.includes(category) ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {config.label}
            </button>
          ))}
        </div>
      </div>

      {/* Map */}
      <div
        style={{
          height,
          borderRadius: '12px',
          overflow: 'hidden',
          border: '2px solid #b8e7f7',
          boxShadow: '0 4px 12px rgba(24, 59, 86, 0.08)',
          position: 'relative',
        }}
      >
        {loading && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(230, 245, 252, 0.92)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
          >
            <div style={{ textAlign: 'center', color: '#183b56' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
              <div>กำลังโหลดข้อมูล {selectedCategories.length} หมวดหมู่...</div>
            </div>
          </div>
        )}

        <MapContainer
          center={initialCenter}
          zoom={initialZoom}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          {!loading && <PlaceMarkers places={places} />}
        </MapContainer>
      </div>

      {/* Attribution & Info */}
      <div
        style={{
          marginTop: '1rem',
          padding: '0.75rem',
          background: '#e6f5fc',
          borderRadius: '8px',
          border: '1px solid #b8e7f7',
          fontSize: '0.85rem',
          color: '#617487',
        }}
      >
        <strong style={{ color: '#183b56' }}>ℹ️ ข้อมูลสถานที่:</strong>
        <ul style={{ marginLeft: '1.2rem', marginTop: '0.3rem', lineHeight: 1.5 }}>
          <li>แหล่งข้อมูล: OpenStreetMap (ดาวน์โหลดวันที่ 23 ตุลาคม 2026)</li>
          <li>จำนวนสถานที่ทั้งหมด: 12,207 แห่ง</li>
          <li>คลิกที่กลุ่มเครื่องหมายเพื่อซูมเข้าดูรายละเอียด</li>
          <li>คลิกที่เครื่องหมายแต่ละจุดเพื่อดูข้อมูลเพิ่มเติม</li>
        </ul>
      </div>
    </div>
  );
}
