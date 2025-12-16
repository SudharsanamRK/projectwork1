import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";                         // ✅ Required Leaflet import
import "../utils/fixLeafletIcons";               // ✅ Your custom fix file

// ✅ Leaflet icons fix for Vite/React
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// ✅ Apply icon patch
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const fishingZones = [
  { name: "Chennai Coast", coords: [13.05, 80.27], id: "chennai" },
  { name: "Kolkata Coast", coords: [22.57, 88.36], id: "kolkata" },
  { name: "Mumbai Coast", coords: [19.07, 72.87], id: "mumbai" },
  { name: "Goa Coast", coords: [15.49, 73.82], id: "goa" },
  { name: "Kerala Coast", coords: [9.93, 76.25], id: "kerala" },
];

export default function FishRegionMap({ onSelect }) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-700 shadow-md h-[350px]">
      <MapContainer center={[12.97, 77.59]} zoom={5} className="h-full w-full">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {fishingZones.map((zone) => (
          <Marker
            key={zone.id}
            position={zone.coords}
            eventHandlers={{ click: () => onSelect(zone) }}
          >
            <Popup>{zone.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
