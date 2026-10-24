'use client';

import React, { useState, useEffect } from 'react';

interface NearbyPlacesProps {
  lat: number;
  lng: number;
}

interface Place {
  name: string;
  type: 'hotel' | 'park';
  vicinity?: string;
  latitude?: number;
  longitude?: number;
}

export default function NearbyPlaces({ lat, lng }: NearbyPlacesProps) {
  const [hotels, setHotels] = useState<Place[]>([]);
  const [parks, setParks] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNearbyPlaces() {
      try {
        setLoading(true);
        
        // ใช้ Overpass API (OSM) แทน Google Maps API (ฟรี)
        const radius = 1000; // 1km
        
        // ค้นหาโรงแรม
        const hotelQuery = `
          [out:json];
          (
            node["tourism"="hotel"](around:${radius},${lat},${lng});
            way["tourism"="hotel"](around:${radius},${lat},${lng});
          );
          out center 3;
        `;
        
        // ค้นหาสวน
        const parkQuery = `
          [out:json];
          (
            node["leisure"="park"](around:${radius},${lat},${lng});
            way["leisure"="park"](around:${radius},${lat},${lng});
          );
          out center 3;
        `;

        const [hotelRes, parkRes] = await Promise.all([
          fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(hotelQuery)}`),
          fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(parkQuery)}`)
        ]);

        const hotelData = await hotelRes.json();
        const parkData = await parkRes.json();

        const hotelList = hotelData.elements
          .filter((el: any) => el.tags?.name)
          .slice(0, 3)
          .map((el: any) => ({
            name: el.tags.name,
            type: 'hotel' as const,
            vicinity: el.tags['addr:street'] || '',
            latitude: el.lat ?? el.center?.lat,
            longitude: el.lon ?? el.center?.lon
          }));

        const parkList = parkData.elements
          .filter((el: any) => el.tags?.name)
          .slice(0, 3)
          .map((el: any) => ({
            name: el.tags.name,
            type: 'park' as const,
            vicinity: el.tags['addr:street'] || ''
          }));

        setHotels(hotelList);
        setParks(parkList);
      } catch (error) {
        console.error('Error fetching nearby places:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchNearbyPlaces();
  }, [lat, lng]);

  if (loading) {
    return (
      <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
        กำลังโหลดสถานที่ใกล้เคียง...
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {hotels.length > 0 && (
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0369a1', marginBottom: '0.25rem' }}>
            🏨 โรงแรม:
          </div>
          {hotels.map((hotel, idx) => (
            <a
              key={idx}
              href={hotel.latitude && hotel.longitude
                ? `https://www.google.com/maps/search/?api=1&query=${hotel.latitude},${hotel.longitude}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ fontSize: '0.8125rem', color: '#075985', paddingLeft: '0.5rem', textDecoration: 'none' }}
            >
              • {hotel.name} {hotel.vicinity && `(${hotel.vicinity})`} ↗
            </a>
          ))}
        </div>
      )}

      {parks.length > 0 && (
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0369a1', marginBottom: '0.25rem' }}>
            🌳 สวนสาธารณะ:
          </div>
          {parks.map((park, idx) => (
            <div key={idx} style={{ fontSize: '0.8125rem', color: '#075985', paddingLeft: '0.5rem' }}>
              • {park.name}
            </div>
          ))}
        </div>
      )}

      {hotels.length === 0 && parks.length === 0 && (
        <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
          ไม่พบสถานที่ใกล้เคียงในระยะ 1km
        </div>
      )}

      {/* Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e0f2fe' }}>
        <a
          href={`https://www.google.com/maps/search/hotel+near+${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '0.75rem',
            color: '#0ea5e9',
            textDecoration: 'none'
          }}
        >
          → ดูเพิ่มเติมบน Google Maps
        </a>
        <a
          href={`https://www.agoda.com/search?city=${lat},${lng}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '0.75rem',
            color: '#0ea5e9',
            textDecoration: 'none'
          }}
        >
          → จองโรงแรม (Agoda)
        </a>
      </div>
    </div>
  );
}
