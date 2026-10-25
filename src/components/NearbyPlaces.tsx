'use client';

import React, { useState, useEffect } from 'react';

interface NearbyPlacesProps {
  lat: number;
  lng: number;
}

interface Place {
  name: string;
  type: 'hotel' | 'park' | 'event';
  vicinity?: string;
  latitude?: number;
  longitude?: number;
  distanceKm?: number;
}

// ข้อมูลจำลองโรงแรมในกรุงเทพ
const mockBangkokHotels = [
  { name: 'โรงแรมดุสิตธานี', lat: 13.7430, lng: 100.5445, vicinity: 'สีลม' },
  { name: 'โรงแรมแมนดาริน โอเรียนเต็ล', lat: 13.7240, lng: 100.5150, vicinity: 'บางรัก' },
  { name: 'โรงแรมสยามเคมปินสกี้', lat: 13.7465, lng: 100.5392, vicinity: 'สยาม' },
  { name: 'โรงแรมแกรนด์ ไฮแอท เอราวัณ', lat: 13.7443, lng: 100.5405, vicinity: 'ราชดำริ' },
  { name: 'โรงแรมเซ็นทรา แกรนด์ แอท เซ็นทรัลเวิลด์', lat: 13.7468, lng: 100.5398, vicinity: 'ราชประสงค์' },
  { name: 'โรงแรมอนันตรา สยาม กรุงเทพฯ', lat: 13.7451, lng: 100.5403, vicinity: 'ราชดำริ' },
  { name: 'โรงแรมโฟร์ซีซั่นส์ กรุงเทพฯ', lat: 13.7308, lng: 100.5418, vicinity: 'สาทร' },
  { name: 'โรงแรมเพนนินซูลา กรุงเทพฯ', lat: 13.7227, lng: 100.4937, vicinity: 'คลองสาน' },
  { name: 'โรงแรมรอยัล ออคิด เชอราตัน', lat: 13.7235, lng: 100.5153, vicinity: 'สาทร' },
  { name: 'โรงแรมเลอ เมอริเดียน กรุงเทพฯ', lat: 13.7278, lng: 100.5433, vicinity: 'สีลม' }
];

// ข้อมูลจำลองอีเว้นท์
const mockEvents = [
  { name: '🎭 งานศิลปะร่วมสมัย', vicinity: 'BACC' },
  { name: '🎵 คอนเสิร์ตดนตรีแจ๊ส', vicinity: 'Saxophone Pub' },
  { name: '🍜 เทศกาลอาหารริมแม่น้ำ', vicinity: 'เจ้าพระยา' },
  { name: '🎪 ตลาดนัดวินเทจ', vicinity: 'จตุจักร' },
  { name: '🎨 นิทรรศการภาพถ่าย', vicinity: 'สยามพารากอน' }
];

export default function NearbyPlaces({ lat, lng }: NearbyPlacesProps) {
  const [hotels, setHotels] = useState<Place[]>([]);
  const [parks, setParks] = useState<Place[]>([]);
  const [events, setEvents] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNearbyPlaces() {
      try {
        setLoading(true);
        
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

        // ใช้ข้อมูลจำลองเพื่อความเร็ว
        const hotelList = mockBangkokHotels
          .map(hotel => ({
            name: hotel.name,
            type: 'hotel' as const,
            vicinity: hotel.vicinity,
            latitude: hotel.lat,
            longitude: hotel.lng,
            distanceKm: calculateDistance(lat, lng, hotel.lat, hotel.lng)
          }))
          .sort((a, b) => a.distanceKm - b.distanceKm)
          .slice(0, 3);

        const eventList = mockEvents
          .map((event, idx) => ({
            name: event.name,
            type: 'event' as const,
            vicinity: event.vicinity,
            distanceKm: 0.5 + idx * 0.3 // จำลองระยะทาง
          }))
          .slice(0, 3);

        setHotels(hotelList);
        setEvents(eventList);
        
        // พยายามดึงสวนจาก API (ถ้าช้าก็ข้าม)
        try {
          const parkQuery = `
            [out:json][timeout:5];
            node["leisure"="park"](around:5000,${lat},${lng});
            out body 5;
          `;
          
          const parkRes = await Promise.race([
            fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(parkQuery)}`),
            new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
          ]) as Response;
          
          const parkData = await parkRes.json();
          
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
            
          setParks(parkList);
        } catch (error) {
          console.log('Parks API slow or failed, continuing without parks');
        }
        
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
              href={`https://www.agoda.com/search?city=Bangkok&checkIn=&checkOut=&rooms=1&adults=1&children=0`}
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

      {events.length > 0 && (
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0369a1', marginBottom: '0.25rem' }}>
            🎉 อีเว้นท์ใกล้เคียง:
          </div>
          {events.map((event, idx) => (
            <a
              key={idx}
              href={`https://www.google.com/search?q=${encodeURIComponent(event.name + ' ' + event.vicinity)}`}
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
              • {event.name} {event.vicinity && `(${event.vicinity})`} ↗
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

      {hotels.length === 0 && parks.length === 0 && events.length === 0 && (
        <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
          ไม่พบสถานที่ใกล้เคียงในพื้นที่นี้
        </div>
      )}

      {/* Links */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid #e0f2fe' }}>
        <a
          href={`https://www.agoda.com/search?city=Bangkok&checkIn=&checkOut=&rooms=1&adults=1&children=0`}
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
        <a
          href={`https://www.booking.com/searchresults.th.html?ss=Bangkok`}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontSize: '0.75rem',
            color: '#0ea5e9',
            textDecoration: 'none'
          }}
        >
          → จองโรงแรม (Booking.com)
        </a>
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
      </div>
    </div>
  );
}
