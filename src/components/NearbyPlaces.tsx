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
  distanceKm?: number;
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

        // ฟังก์ชันคำนวณระยะทาง (Haversine formula)
        const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
          const R = 6371; // รัศมีโลก (กม.)
          const dLat = (lat2 - lat1) * Math.PI / 180;
          const dLon = (lon2 - lon1) * Math.PI / 180;
          const a = 
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          return R * c;
        };

        const hotelList = hotelData.elements
          .filter((el: any) => el.tags?.name)
          .map((el: any) => {
            const hotelLat = el.lat ?? el.center?.lat;
            const hotelLon = el.lon ?? el.center?.lon;
            const distance = hotelLat && hotelLon ? calculateDistance(lat, lng, hotelLat, hotelLon) : 0;
            
            return {
              name: el.tags.name,
              type: 'hotel' as const,
              vicinity: el.tags['addr:street'] || '',
              latitude: hotelLat,
              longitude: hotelLon,
              distanceKm: distance
            };
          })
          .sort((a: any, b: any) => a.distanceKm - b.distanceKm)
          .slice(0, 3);

        const parkList = parkData.elements
          .filter((el: any) => el.tags?.name)
          .map((el: any) => {
            const parkLat = el.lat ?? el.center?.lat;
            const parkLon = el.lon ?? el.center?.lon;
            const distance = parkLat && parkLon ? calculateDistance(lat, lng, parkLat, parkLon) : 0;
            
            return {
              name: el.tags.name,
              type: 'park' as const,
              vicinity: el.tags['addr:street'] || '',
              latitude: parkLat,
              longitude: parkLon,
              distanceKm: distance
            };
          })
          .sort((a: any, b: any) => a.distanceKm - b.distanceKm)
          .slice(0, 3);

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
            🏨 โรงแรมใกล้เคียง:
          </div>
          {hotels.map((hotel, idx) => (
            <a
              key={idx}
              href={hotel.latitude && hotel.longitude
                ? `https://www.google.com/maps/search/?api=1&query=${hotel.latitude},${hotel.longitude}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotel.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                fontSize: '0.8125rem', 
                color: '#075985', 
                paddingLeft: '0.5rem', 
                textDecoration: 'none',
                display: 'block',
                marginBottom: '0.25rem'
              }}
            >
              • {hotel.name} {hotel.distanceKm ? `(${hotel.distanceKm.toFixed(2)} กม.)` : ''} ↗
            </a>
          ))}
        </div>
      )}

      {parks.length > 0 && (
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0369a1', marginBottom: '0.25rem' }}>
            🌳 สวนสาธารณะใกล้เคียง:
          </div>
          {parks.map((park, idx) => (
            <a
              key={idx}
              href={park.latitude && park.longitude
                ? `https://www.google.com/maps/search/?api=1&query=${park.latitude},${park.longitude}`
                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(park.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ 
                fontSize: '0.8125rem', 
                color: '#075985', 
                paddingLeft: '0.5rem',
                textDecoration: 'none',
                display: 'block',
                marginBottom: '0.25rem'
              }}
            >
              • {park.name} {park.distanceKm ? `(${park.distanceKm.toFixed(2)} กม.)` : ''} ↗
            </a>
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
