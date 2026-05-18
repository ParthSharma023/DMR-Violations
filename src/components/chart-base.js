// Shared Chart.js helper. Handles mount/update/unmount lifecycle,
// CoH theme palette, and responsive behavior inside the PBIX canvas.

import { h } from "preact";
import { useEffect, useRef } from "preact/hooks";
import htm from "htm";
const html = htm.bind(h);

export const PALETTE = [
  "#48d0c9", "#5da8ff", "#f2c14e", "#78d39b", "#ee6c5d",
  "#a78bfa", "#fb923c", "#34d399", "#f472b6", "#facc15",
  "#d46b2d", "#41b9a8", "#e6a52e", "#cf4336", "#60a5fa",
];

// Common Chart.js defaults for this dashboard
Chart.defaults.color = "#b4c0d0";
Chart.defaults.borderColor = "rgba(139, 175, 214, 0.22)";
Chart.defaults.font.family = '"Segoe UI", Arial, sans-serif';
Chart.defaults.font.size = 11;
Chart.defaults.plugins.legend.labels.boxWidth = 12;
Chart.defaults.plugins.legend.labels.padding = 8;

export function ChartWrap({ type, data, options }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    chartRef.current = new Chart(canvasRef.current, { type, data, options });
    return () => {
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.data = data;
    chartRef.current.options = options;
    chartRef.current.update("none");
  }, [data, options]);

  return html`
    <div style="width:100%;height:100%;position:relative;">
      <canvas ref=${canvasRef}></canvas>
    </div>
  `;
}
