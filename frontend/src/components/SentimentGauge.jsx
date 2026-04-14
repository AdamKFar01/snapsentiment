const COLORS = {
  positive: '#34d399',
  negative: '#f87171',
  neutral: '#94a3b8',
};

// SVG semicircle gauge — score (0–1) drives how much of the arc is filled.
// The arc sweeps left-to-right so higher confidence reads as "more full".
export default function SentimentGauge({ label, score }) {
  const color = COLORS[label] ?? COLORS.neutral;
  const pct = Math.round(score * 100);

  const cx = 60, cy = 58, r = 46, sw = 8;

  // endpoint on the arc for the current score value
  const angle = score * Math.PI;
  const endX = +(cx - r * Math.cos(angle)).toFixed(3);
  const endY = +(cy - r * Math.sin(angle)).toFixed(3);
  // large-arc-flag flips at 0.5 so the SVG arc engine takes the right path
  const largeArc = score > 0.5 ? 1 : 0;

  const trackD = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const valueD = score > 0.001
    ? `M ${cx - r} ${cy} A ${r} ${r} 0 ${largeArc} 1 ${endX} ${endY}`
    : null;

  return (
    <div className="gauge-wrap">
      <svg viewBox="0 0 120 66" className="gauge-svg" aria-hidden="true">
        <path d={trackD} fill="none" stroke="var(--border)" strokeWidth={sw} strokeLinecap="round" />
        {valueD && (
          <path d={valueD} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" />
        )}
        <text x={cx} y={cy - 4} textAnchor="middle" className="gauge-pct" fill={color}>
          {pct}%
        </text>
      </svg>
      <p className={`gauge-label sentiment-text-${label}`}>{label.charAt(0).toUpperCase() + label.slice(1)}</p>
    </div>
  );
}
