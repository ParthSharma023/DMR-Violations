import { h } from "preact";
import { useEffect, useMemo, useState } from "preact/hooks";
import htm from "htm";

const html = htm.bind(h);

const CANVAS_W = 1280;
const CANVAS_H = 720;

function useCanvasScale(width, height) {
  const [layout, setLayout] = useState({ scale: 1, wrapW: width, wrapH: height });

  useEffect(() => {
    const recompute = () => {
      const availW = Math.max(window.innerWidth - 48, 320);
      const availH = Math.max(window.innerHeight - 24, 320);
      const scale = Math.min(availW / width, availH / height);
      setLayout({
        scale,
        wrapW: width * scale,
        wrapH: height * scale,
      });
    };

    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [width, height]);

  return layout;
}

function normalizeCaption(caption) {
  if (caption === "Permit Evaluation Summay Tables") return "Permit Evaluation Summary Tables";
  return caption;
}

function NavButton({ item }) {
  const { position = {}, target_slug: targetSlug } = item;
  const style = {
    position: "absolute",
    left: `${position.x || 0}px`,
    top: `${position.y || 0}px`,
    width: `${position.width || 120}px`,
    height: `${position.height || 40}px`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "4px 12px",
    borderRadius: 8,
    border: "1px solid rgba(93,129,177,0.24)",
    background: "#10233d",
    color: "#f4f7fb",
    fontFamily: "Inter, sans-serif",
    fontSize: "14px",
    fontWeight: 700,
    lineHeight: 1.2,
    cursor: targetSlug ? "pointer" : "default",
    boxSizing: "border-box",
    boxShadow: "0 8px 18px rgba(0,0,0,0.16)",
    transition: "background 0.12s, border-color 0.12s, transform 0.12s",
    overflow: "hidden",
  };

  return html`
    <button
      key=${`${item.caption}-${position.x}-${position.y}`}
      onClick=${() => { if (targetSlug) window.location.hash = `#/${targetSlug}`; }}
      style=${style}
      onMouseEnter=${(e) => {
        e.currentTarget.style.background = "rgba(40,215,215,0.10)";
        e.currentTarget.style.borderColor = "rgba(40,215,215,0.42)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave=${(e) => {
        e.currentTarget.style.background = "#10233d";
        e.currentTarget.style.borderColor = "rgba(93,129,177,0.24)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <span style=${{
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        width: "100%",
      }}>
        ${normalizeCaption(item.caption || "—")}
      </span>
    </button>
  `;
}

export function HomeNavPage({ manifest }) {
  const homeNav = useMemo(
    () => [...(manifest?.home_nav || [])].sort((a, b) => (a.position?.z || 0) - (b.position?.z || 0)),
    [manifest],
  );
  const { scale, wrapW, wrapH } = useCanvasScale(CANVAS_W, CANVAS_H);
  const refresh = (manifest?.last_refresh || "—").replace("T", " ").replace(".000000", "");

  return html`
    <div style=${{
      minHeight: "100vh",
      background: "#071426",
      color: "#f4f7fb",
      fontFamily: "Inter, sans-serif",
      overflow: "hidden",
      padding: 12,
      boxSizing: "border-box",
      display: "grid",
      placeItems: "center",
    }}>
      <div style=${{ width: `${wrapW}px`, height: `${wrapH}px` }}>
        <div style=${{
          width: `${CANVAS_W}px`,
          height: `${CANVAS_H}px`,
          position: "relative",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}>
          <div style=${{
            position: "absolute",
            left: "0px",
            top: "0px",
            width: "1280px",
            height: "56px",
            borderRadius: 10,
            border: "1px solid rgba(93,129,177,0.24)",
            background: "#10233d",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            boxSizing: "border-box",
          }}>
            <div style=${{
              fontSize: "34px",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
            }}>
              WWiP Plant-Intelligence-System
            </div>
            <div style=${{
              fontSize: "15px",
              color: "#28d7d7",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}>
              transforms HachWIMS laboratory and process data into actionable insights
            </div>
          </div>

          <div style=${{
            position: "absolute",
            left: "14px",
            top: "58px",
            display: "flex",
            gap: "16px",
            alignItems: "center",
            color: "#a9b8cc",
            fontSize: "13px",
            fontWeight: 600,
          }}>
            <span style=${{ color: "#28d7d7", textTransform: "uppercase", letterSpacing: "0.06em" }}>Last Refreshed:</span>
            <span>${refresh}</span>
          </div>

          ${homeNav.map((item) => html`<${NavButton} key=${`${item.caption}-${item.position?.z || 0}`} item=${item} />`)}
        </div>
      </div>
    </div>
  `;
}
