'use client'

import React from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';


const MapComponent = ({ geolocation }) => {


  const marker = L.icon({
      iconUrl: "data:image/svg+xml,%3Csvg width='28' height='28' viewBox='0 0 28 28' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 25.3167C20.1833 19.8333 23.3333 15.1667 23.3333 11.6667C23.3333 9.19131 22.35 6.81734 20.5997 5.067C18.8493 3.31666 16.4754 2.33333 14 2.33333C11.5246 2.33333 9.15068 3.31666 7.40034 5.067C5.65 6.81734 4.66667 9.19131 4.66667 11.6667C4.66667 15.1667 7.81667 19.7167 14 25.3167Z' fill='%23D9D9D9' stroke='black' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round'/%3E%3Cpath d='M14 15.1667C15.933 15.1667 17.5 13.5997 17.5 11.6667C17.5 9.73367 15.933 8.16667 14 8.16667C12.067 8.16667 10.5 9.73367 10.5 11.6667C10.5 13.5997 12.067 15.1667 14 15.1667Z' stroke='black' strokeWidth='1.75' strokeLinecap='round' strokeLinejoin='round'/%3E%3C/svg%3E%0A",
  });

  return (
    <MapContainer center={[geolocation.lat, geolocation.lng]} zoom={13} scrollWheelZoom={true} className="h-96 border w-96 max-w-full">
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker 
        position={[geolocation.lat, geolocation.lng]} 
        icon= {marker}
      >
        <Popup>
          Hello
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapComponent;
