import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { cn } from "@/lib/utils";
import L from "leaflet";

// Fix for default marker icon in React Leaflet with Vite/Webpack
// We use CDN icons to ensure they load correctly without complex asset configuration
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface MapViewProps {
  className?: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  onMapReady?: (map: L.Map) => void;
}

// Component to expose the map instance to the parent via callback
function MapController({ onMapReady }: { onMapReady?: (map: L.Map) => void }) {
  const map = useMap();
  useEffect(() => {
    if (onMapReady) {
      onMapReady(map);
    }
  }, [map, onMapReady]);
  return null;
}

export function MapView({
  className,
  initialCenter = { lat: 7.8804, lng: 98.3923 }, // Default to Phuket Town
  initialZoom = 13,
  onMapReady,
}: MapViewProps) {

  return (
    <div className={cn("w-full h-[500px] z-0", className)}>
      <MapContainer
        center={[initialCenter.lat, initialCenter.lng]}
        zoom={initialZoom}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[initialCenter.lat, initialCenter.lng]}>
          <Popup>
            Mirin Motorcycle Rental<br />
            Phuket, Thailand
          </Popup>
        </Marker>
        <MapController onMapReady={onMapReady} />
      </MapContainer>
    </div>
  );
}
