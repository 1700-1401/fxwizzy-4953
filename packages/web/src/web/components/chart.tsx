import { useState } from "react";
import {
  Crosshair,
  Minus,
  Pencil,
  Expand,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Layers,
  CandlestickChart,
} from "lucide-react";

const anchors = [
  280, 263, 287, 241, 225, 259, 292, 310, 272, 267, 222, 240, 249, 192, 203, 173, 198, 176, 139,
  168, 140, 122, 151, 165, 111, 97, 123, 100, 76, 99, 63, 94, 73, 107, 125, 96, 89, 127, 114, 85,
];
const candles = Array.from({ length: 100 }, (_, i) => {
  const t = (i / 99) * (anchors.length - 1);
  const low = Math.floor(t);
  const y = anchors[low]! + ((anchors[low + 1] ?? anchors[low]!) - anchors[low]!) * (t - low);
  const open = y + Math.sin(i * 2.7) * 13;
  const close = y + Math.cos(i * 2.1) * 10;
  return {
    x: 28 + i * 6.2,
    open,
    close,
    high: Math.min(open, close) - 5 - Math.abs(Math.sin(i)) * 12,
    low: Math.max(open, close) + 5 + Math.abs(Math.cos(i)) * 12,
  };
});

export function Chart({
  image,
  symbol,
  timeframe,
}: {
  image?: string;
  symbol: string;
  timeframe: string;
}) {
  const [zones, setZones] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [full, setFull] = useState(false);
  const [tool, setTool] = useState("crosshair");
  const [point, setPoint] = useState<{ x: number; y: number } | null>(null);
  return (
    <div className={`chart-shell ${full ? "chart-fullscreen" : ""}`}>
      <div className="chart-toolbar">
        <div className="tools">
          {[
            { id: "crosshair", icon: Crosshair, label: "Crosshair" },
            { id: "line", icon: Minus, label: "Price guide" },
            { id: "draw", icon: Pencil, label: "Mark chart" },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              title={label}
              aria-label={label}
              className={tool === id ? "active" : ""}
              onClick={() => setTool(id)}
            >
              <Icon size={16} />
            </button>
          ))}
          <span className="tool-divider" />
          <button
            className={zones ? "active" : ""}
            onClick={() => setZones(!zones)}
            title="Toggle example zones"
            aria-label="Toggle example zones"
          >
            <Layers size={16} />
          </button>
          <span className="chart-type">
            <CandlestickChart size={15} /> {image ? "Screenshot" : "Candlesticks"}
          </span>
        </div>
        <div className="tools">
          <span className="micro chart-sample-label">
            {image ? "UPLOADED CHART" : "ILLUSTRATIVE · NOT LIVE"}
          </span>
          <button
            title={full ? "Exit fullscreen" : "Expand chart"}
            aria-label="Expand chart"
            onClick={() => setFull(!full)}
          >
            <Expand size={16} />
          </button>
        </div>
      </div>
      <div className="chart-canvas">
      <button
        className="chart-interaction"
        aria-label="Interactive chart: use arrow keys to move the crosshair, Enter to mark the center, Escape to clear"
        onKeyDown={e => { if (e.key === 'Enter') setPoint({ x: 380, y: 200 }); if (e.key === 'Escape') { setPoint(null); setFull(false); } if (e.key.startsWith('Arrow')) { e.preventDefault(); setPoint(p => ({ x: Math.max(0, Math.min(760, (p?.x ?? 380) + (e.key === 'ArrowRight' ? 10 : e.key === 'ArrowLeft' ? -10 : 0))), y: Math.max(0, Math.min(400, (p?.y ?? 200) + (e.key === 'ArrowDown' ? 10 : e.key === 'ArrowUp' ? -10 : 0))) })); } }}
        onMouseMove={(e) => {
          if (tool === "crosshair") {
            const r = e.currentTarget.getBoundingClientRect();
            setPoint({
              x: ((e.clientX - r.left) / r.width) * 760,
              y: ((e.clientY - r.top) / r.height) * 400,
            });
          }
        }}
        onMouseLeave={() => {
          if (tool === "crosshair") setPoint(null);
        }}
        onClick={(e) => {
          if (tool !== "crosshair") {
            const r = e.currentTarget.getBoundingClientRect();
            setPoint({
              x: ((e.clientX - r.left) / r.width) * 760,
              y: ((e.clientY - r.top) / r.height) * 400,
            });
          }
        }}
      />
        {image ? (
          <img
            className="uploaded-chart"
            src={image}
            alt={`${symbol} uploaded ${timeframe} chart`}
            style={{ transform: `scale(${zoom})` }}
          />
        ) : (
          <svg
            viewBox="0 0 760 400"
            aria-label="Illustrative gold candlestick chart with liquidity and demand zones, not live market data"
            preserveAspectRatio="none"
          >
            <title>Illustrative gold chart, not live prices</title>
            <defs>
              <pattern id="grid" width="62" height="54" patternUnits="userSpaceOnUse">
                <path d="M 62 0 L 0 0 0 54" fill="none" stroke="#252930" strokeWidth=".7" />
              </pattern>
            </defs>
            <rect width="686" height="364" fill="url(#grid)" />
            {zones && (
              <g>
                <rect x="24" y="46" width="650" height="30" fill="#e4c078" fillOpacity=".065" />
                <path d="M24 47H674" stroke="#e4c078" strokeOpacity=".4" strokeDasharray="5 5" />
                <text x="37" y="65" fill="#b9a16c" fontSize="9">
                  BUY-SIDE LIQUIDITY
                </text>
                <rect x="343" y="188" width="332" height="29" fill="#45ba97" fillOpacity=".085" />
                <path
                  d="M343 188H675M343 217H675"
                  stroke="#45ba97"
                  strokeOpacity=".35"
                  strokeDasharray="4 4"
                />
                <text x="510" y="207" fill="#77af9f" fontSize="9">
                  DEMAND / ORDER BLOCK
                </text>
                <path d="M56 303H237" stroke="#bf7084" strokeOpacity=".6" strokeDasharray="4 4" />
                <text x="55" y="323" fill="#aa6e7d" fontSize="9">
                  SELL-SIDE LIQUIDITY
                </text>
                <path d="M192 236H356" stroke="#8892a0" strokeDasharray="3 4" />
                <text x="254" y="231" fill="#a5adbb" fontSize="9">
                  CHoCH ↗
                </text>
                <path d="M369 138H479" stroke="#8892a0" strokeDasharray="3 4" />
                <text x="407" y="131" fill="#a5adbb" fontSize="9">
                  BOS ↗
                </text>
              </g>
            )}
            <g style={{ transform: `scaleX(${zoom})`, transformOrigin: "340px 180px" }}>
              {candles.map((c, i) => (
                <g key={i} stroke={c.close < c.open ? "#4bc39c" : "#d76c7b"}>
                  <line x1={c.x} x2={c.x} y1={c.high} y2={c.low} strokeWidth="1" />
                  <rect
                    x={c.x - 1.8}
                    y={Math.min(c.open, c.close)}
                    width="3.6"
                    height={Math.max(1.5, Math.abs(c.close - c.open))}
                    fill={c.close < c.open ? "#4bc39c" : "#d76c7b"}
                    stroke="none"
                  />
                  <rect
                    x={c.x - 1.8}
                    y={352 - 11 - Math.abs(Math.sin(i * 1.3)) * 23}
                    width="3.6"
                    height={11 + Math.abs(Math.sin(i * 1.3)) * 23}
                    fill={c.close < c.open ? "#4bc39c" : "#d76c7b"}
                    fillOpacity=".22"
                    stroke="none"
                  />
                </g>
              ))}
            </g>
            <path d="M24 107H686" stroke="#49bd99" strokeDasharray="4 4" strokeOpacity=".6" />
            <rect x="687" y="96" width="70" height="23" rx="3" fill="#276550" />
            <text x="721" y="112" fontSize="10" textAnchor="middle" fill="#d5f7e9">
              2,348.50
            </text>
            {[
              ["2,370.00", 34],
              ["2,360.00", 85],
              ["2,340.00", 158],
              ["2,330.00", 211],
              ["2,320.00", 265],
              ["2,310.00", 319],
            ].map(([v, y]) => (
              <text key={v} x="700" y={y} fill="#767e8e" fontSize="10">
                {v}
              </text>
            ))}
            {["06:00", "08:00", "10:00", "12:00", "14:00", "16:00"].map((t, i) => (
              <text key={t} x={38 + i * 119} y="383" fill="#767e8e" fontSize="10">
                {t}
              </text>
            ))}
            <text x="295" y="292" fontSize="42" fontWeight="800" fill="#bfc7d4" fillOpacity=".035">
              fxwizzy
            </text>
          </svg>
        )}
        {point && (
          <svg className="chart-crosshair" viewBox="0 0 760 400" preserveAspectRatio="none">
            <path
              d={`M0 ${point.y}H760${tool === "line" ? "" : ` M${point.x} 0V400`}`}
              stroke="#b8b4a2"
              strokeWidth=".7"
              strokeDasharray="3 3"
            />
            {tool === "draw" && (
              <circle cx={point.x} cy={point.y} r="9" stroke="#e4c078" fill="none" />
            )}
          </svg>
        )}
        <div className="zoom-tools">
          <button aria-label="Zoom out" onClick={() => setZoom(Math.max(1, zoom - 0.2))}>
            <ZoomOut size={15} />
          </button>
          <button
            aria-label="Reset zoom"
            onClick={() => {
              setZoom(1);
              setPoint(null);
            }}
          >
            <RotateCcw size={13} />
          </button>
          <button aria-label="Zoom in" onClick={() => setZoom(Math.min(2.4, zoom + 0.2))}>
            <ZoomIn size={15} />
          </button>
        </div>
      </div>
      <div className="chart-foot">
        <span>
          <i className="dot" />
          {image
            ? "Screenshot analysis • no live feed"
            : "Sample chart • upload your own to analyze"}
        </span>
        <span>
          UTC <span className="muted">/</span> {timeframe}
        </span>
      </div>
    </div>
  );
}
