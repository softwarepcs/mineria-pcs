import "./MapPlaceholder.css";

export function MapPlaceholder({ titulo }: { titulo: string }) {
  return (
    <div className="map-placeholder">
      <div className="map-placeholder-grid" />
      <div className="map-placeholder-label">{titulo}</div>
    </div>
  );
}
