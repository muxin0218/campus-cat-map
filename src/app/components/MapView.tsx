import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { mockCats } from '../data/mockData';
import { useNavigate } from 'react-router';

// 修复Leaflet默认图标问题
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // 初始化地图 - 以河海大学江宁校区为中心
    const map = L.map(mapRef.current).setView([31.9131, 118.7804], 16);

    // 添加瓦片图层
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // 自定义猫咪图标
    const catIcon = L.divIcon({
      className: 'custom-cat-marker',
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

    // 添加猫咪标记
    mockCats.forEach(cat => {
      const marker = L.marker([cat.location.lat, cat.location.lng], { icon: catIcon })
        .addTo(map);

      const popupContent = `
        <div style="min-width: 200px;">
          <img src="${cat.image}" alt="${cat.name}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 8px; margin-bottom: 8px;" />
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600;">${cat.nickname}</h3>
          <p style="margin: 0 0 4px 0; font-size: 13px; color: #666;">
            <strong>品种:</strong> ${cat.color}<br/>
            <strong>性格:</strong> ${cat.personality.join(', ')}<br/>
            <strong>位置:</strong> ${cat.location.name}
          </p>
          <button
            onclick="window.viewCatDetail('${cat.id}')"
            style="
              width: 100%;
              margin-top: 8px;
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

      marker.bindPopup(popupContent, {
        maxWidth: 300,
        className: 'custom-popup'
      });
    });

    // 添加点击事件处理
    (window as any).viewCatDetail = (catId: string) => {
      navigate(`/cat/${catId}`);
    };

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [navigate]);

  return (
    <div ref={mapRef} className="w-full h-full" />
  );
}
