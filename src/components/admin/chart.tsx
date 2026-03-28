"use client";

// ── Bar Chart ───────────────────────────────────────────────────────
interface BarChartProps {
  data: Array<{ label: string; value: number; color?: string }>;
  height?: number;
}

export function BarChart({ data, height = 200 }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const barWidth = Math.min(48, Math.floor(300 / data.length));

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${data.length * (barWidth + 12) + 20} ${height + 40}`} className="w-full">
        {data.map((item, i) => {
          const barHeight = (item.value / max) * height;
          const x = i * (barWidth + 12) + 10;
          const y = height - barHeight;
          return (
            <g key={i}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={4}
                fill={item.color || "#0891b2"}
                className="transition-all duration-300"
              />
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                className="fill-slate-600 text-[10px] font-medium"
              >
                {item.value}
              </text>
              <text
                x={x + barWidth / 2}
                y={height + 16}
                textAnchor="middle"
                className="fill-slate-400 text-[9px]"
              >
                {item.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

// ── Line Chart ──────────────────────────────────────────────────────
interface LineChartProps {
  data: Array<{ label: string; value: number }>;
  height?: number;
  color?: string;
}

export function LineChart({ data, height = 160, color = "#0891b2" }: LineChartProps) {
  if (data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  const width = 600;
  const padX = 10;
  const padY = 20;
  const chartW = width - padX * 2;
  const chartH = height - padY * 2;

  const points = data.map((d, i) => {
    const x = padX + (i / (data.length - 1 || 1)) * chartW;
    const y = padY + chartH - (d.value / max) * chartH;
    return `${x},${y}`;
  });

  // Area fill
  const areaPoints = [
    `${padX},${padY + chartH}`,
    ...points,
    `${padX + chartW},${padY + chartH}`,
  ].join(" ");

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => (
          <line
            key={pct}
            x1={padX}
            y1={padY + chartH * (1 - pct)}
            x2={width - padX}
            y2={padY + chartH * (1 - pct)}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
        ))}
        {/* Area */}
        <polygon points={areaPoints} fill={color} opacity={0.08} />
        {/* Line */}
        <polyline points={points.join(" ")} fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
        {/* Dots */}
        {data.map((d, i) => {
          const x = padX + (i / (data.length - 1 || 1)) * chartW;
          const y = padY + chartH - (d.value / max) * chartH;
          return (
            <circle key={i} cx={x} cy={y} r={3} fill="white" stroke={color} strokeWidth={2} />
          );
        })}
      </svg>
    </div>
  );
}
