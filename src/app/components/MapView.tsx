import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router";
import type { CatListItem } from "../api/client";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
});

export default function MapView({ cats }: { cats: CatListItem[] }) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const markerLayer = useRef<L.LayerGroup | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    const map = L.map(mapRef.current).setView([31.9131, 118.7804], 16);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19
    }).addTo(map);

    markerLayer.current = L.layerGroup().addTo(map);
    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
      markerLayer.current = null;
    };
  }, []);

  useEffect(() => {
    const layer = markerLayer.current;
    if (!layer) return;

    layer.clearLayers();

    const catIcon = L.divIcon({
      className: "custom-cat-marker",
      html: `
        <div style="
          width: 40px;
          height: 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50% 50% 50% 0;
          border: 3px solid white;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          transform: rotate(-45deg);
        ">
          <span style="transform: rotate(45deg);">🐱</span>
        </div>
      `,
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40]
    });

    for (const cat of cats) {
      if (cat.latitude == null || cat.longitude == null) continue;

      const marker = L.marker([cat.latitude, cat.longitude], { icon: catIcon }).addTo(layer);
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 6px 0; font-size: 16px; font-weight: 600;">${cat.name}</h3>
          <p style="margin: 0; font-size: 13px; color: #666;">
            <strong>Last seen:</strong> ${cat.last_seen_at ?? "-"}<br/>
            <strong>Coords:</strong> ${cat.latitude.toFixed(5)}, ${cat.longitude.toFixed(5)}
          </p>
          <button
            onclick="window.viewCatDetail('${cat.id}')"
            style="
              width: 100%;
              margin-top: 10px;
              padding: 6px 12px;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-size: 13px;
              font-weight: 500;
            "
          >
            查看详情
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 300, className: "custom-popup" });
    }

    (window as any).viewCatDetail = (catId: string) => {
      navigate(`/cat/${catId}`);
    };
  }, [cats, navigate]);

  return <div ref={mapRef} className="w-full h-full" />;
}

