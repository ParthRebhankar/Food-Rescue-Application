import L from 'leaflet';

// Create a custom SVG Leaflet icon
export const createStoreMapIcon = (category = 'Restaurant') => {
  let bgColor = '#265936'; // forest green default
  if (category === 'Bakery') bgColor = '#b45309'; // warm amber
  if (category === 'Grocery') bgColor = '#059669'; // emerald
  if (category === 'Restaurant') bgColor = '#c2410c'; // warm orange

  return L.divIcon({
    className: 'custom-map-pin',
    html: `
      <div style="
        background-color: ${bgColor};
        width: 34px;
        height: 34px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        border: 2px solid #ffffff;
      ">
        <div style="
          transform: rotate(45deg);
          color: white;
          font-size: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
        ">
          📍
        </div>
      </div>
    `,
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -32],
  });
};
