import "./IndicatorCard.css";

interface IndicatorCardProps {
  label: string;
  value: string | number;
  accent?: "blue" | "green" | "amber" | "red";
}

export function IndicatorCard({ label, value, accent = "blue" }: IndicatorCardProps) {
  return (
    <div className={`indicator-card indicator-${accent}`}>
      <span className="indicator-value">{value}</span>
      <span className="indicator-label">{label}</span>
    </div>
  );
}
