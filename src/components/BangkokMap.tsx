'use client';

import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet default icon issue in Next.js
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface BangkokMapProps {
  onLocationSelect?: (lat: number, lng: number) => void;
  initialCenter?: [number, number];
  initialZoom?: number;
  height?: string;
}

// Component to handle map clicks
function LocationMarker({ onLocationSelect, initialPosition }: { onLocationSelect?: (lat: number, lng: number) => void; initialPosition?: [number, number] }) {
  const [position, setPosition] = useState<[number, number] | null>(initialPosition || null);

  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setPosition([lat, lng]);
      if (onLocationSelect) {
        onLocationSelect(lat, lng);
      }
    },
  });

  if (position === null) return null;

  return (
    <Marker position={position} draggable eventHandlers={{ dragend: (e) => {
      const marker = e.target as L.Marker;
      const next = marker.getLatLng();
      setPosition([next.lat, next.lng]);
      onLocationSelect?.(next.lat, next.lng);
    } }}>
      <Popup>
        <div style={{ fontSize: '0.9rem', lineHeight: 1.4 }}>
          <strong style={{ color: '#0284c7' }}>📍 ตำแหน่งที่เลือก</strong>
          <br />
          Latitude: {position[0].toFixed(6)}
          <br />
          Longitude: {position[1].toFixed(6)}
        </div>
      </Popup>
    </Marker>
  );
}

export default function BangkokMap({
  onLocationSelect,
  initialCenter = [13.7563, 100.5018], // Bangkok center
  initialZoom = 12,
  height = '500px',
}: BangkokMapProps) {
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number } | null>(null);

  const handleLocationSelect = (lat: number, lng: number) => {
    setSelectedCoords({ lat, lng });
    if (onLocationSelect) {
      onLocationSelect(lat, lng);
    }
  };

  return (
    <div style={{ position: 'relative' }}>
      <div
        style={{
          height,
          borderRadius: '12px',
          overflow: 'hidden',
          border: '2px solid #334155',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
        }}
      >
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
          <LocationMarker onLocationSelect={handleLocationSelect} initialPosition={selectedCoords ? [selectedCoords.lat, selectedCoords.lng] : undefined} />
        </MapContainer>
      </div>

      {/* Coordinates display */}
      {selectedCoords && (
        <div
          style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(15, 23, 42, 0.95)',
            border: '1px solid #38bdf8',
            borderRadius: '8px',
            padding: '0.75rem 1rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
            zIndex: 1000,
            minWidth: '220px',
          }}
        >
          <div style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: 600, marginBottom: '0.3rem' }}>
            📍 พิกัดที่เลือก
          </div>
          <div style={{ fontSize: '0.8rem', color: '#e2e8f0', fontFamily: 'monospace' }}>
            <div>Lat: {selectedCoords.lat.toFixed(6)}</div>
            <div>Lng: {selectedCoords.lng.toFixed(6)}</div>
          </div>
        </div>
      )}

      {/* Map instructions */}
      <div
        style={{
          marginTop: '0.75rem',
          padding: '0.75rem',
          background: '#0f172a',
          borderRadius: '8px',
          border: '1px solid #334155',
          fontSize: '0.85rem',
          color: '#94a3b8',
        }}
      >
        <strong style={{ color: '#38bdf8' }}>💡 วิธีใช้งาน:</strong>
        <ul style={{ marginLeft: '1.2rem', marginTop: '0.3rem', lineHeight: 1.5 }}>
          <li>คลิกที่แผนที่เพื่อเลือกตำแหน่ง</li>
          <li>ใช้ปุ่ม + / - หรือ scroll เพื่อซูมเข้า/ออก</li>
          <li>ลากแผนที่เพื่อเลื่อนดูพื้นที่อื่นๆ</li>
        </ul>
      </div>
    </div>
  );
}
