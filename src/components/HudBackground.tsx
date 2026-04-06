"use client";

import { useEffect, useRef } from "react";

export default function HudBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animFrame: number;
    let tick = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const PI2 = Math.PI * 2;

    const arc = (
      x: number, y: number, r: number, s: number, e: number,
      color: string, w: number, dash?: number[]
    ) => {
      ctx.beginPath();
      ctx.arc(x, y, r, s, e);
      ctx.strokeStyle = color;
      ctx.lineWidth = w;
      ctx.setLineDash(dash || []);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const line = (
      x1: number, y1: number, x2: number, y2: number,
      color: string, w: number, dash?: number[]
    ) => {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = color;
      ctx.lineWidth = w;
      ctx.setLineDash(dash || []);
      ctx.stroke();
      ctx.setLineDash([]);
    };

    const tickMark = (
      cx: number, cy: number, r: number, angle: number,
      len: number, color: string, w: number
    ) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      line(cx + cos * r, cy + sin * r, cx + cos * (r + len), cy + sin * (r + len), color, w);
    };

    // Colors — bold enough to actually see
    const c = (a: number) => `rgba(0, 160, 255, ${Math.min(a * 3, 1)})`;
    const cBright = (a: number) => `rgba(0, 210, 255, ${Math.min(a * 3.5, 1)})`;
    const cDim = (a: number) => `rgba(0, 100, 200, ${Math.min(a * 2.5, 1)})`;

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      tick++;
      const t = tick * 0.001; // slow time

      ctx.clearRect(0, 0, W, H);

      // ==========================================
      // GRID
      // ==========================================
      ctx.strokeStyle = c(0.04);
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += 60) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += 60) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // Brighter center cross grid lines
      line(W * 0.5, 0, W * 0.5, H, c(0.06), 0.5, [2, 8]);
      line(0, H * 0.5, W, H * 0.5, c(0.06), 0.5, [2, 8]);

      // ==========================================
      // LARGE ARC CLUSTER — bottom left
      // ==========================================
      const ax = W * 0.08;
      const ay = H * 0.85;
      const a1 = t * 3;

      // Outermost — thick, partial
      arc(ax, ay, 180, a1, a1 + Math.PI * 1.3, c(0.12), 2);
      arc(ax, ay, 180, a1 + Math.PI * 1.5, a1 + Math.PI * 1.85, c(0.08), 1);
      // Tick marks on outer
      for (let i = 0; i < 48; i++) {
        const angle = (i / 48) * PI2 + a1;
        const isMajor = i % 6 === 0;
        tickMark(ax, ay, 180, angle, isMajor ? 10 : 4, c(isMajor ? 0.12 : 0.06), isMajor ? 1 : 0.5);
      }

      // Second ring — counter-rotate
      arc(ax, ay, 140, -a1 * 0.7, -a1 * 0.7 + Math.PI * 1.6, c(0.15), 1.5);
      arc(ax, ay, 140, -a1 * 0.7 + Math.PI * 1.8, -a1 * 0.7 + PI2, c(0.08), 1);

      // Third ring — dashed
      arc(ax, ay, 105, a1 * 1.2, a1 * 1.2 + Math.PI * 1.0, c(0.1), 1, [6, 4]);
      arc(ax, ay, 105, a1 * 1.2 + Math.PI * 1.3, a1 * 1.2 + Math.PI * 1.9, c(0.07), 1, [3, 6]);

      // Inner ring — solid
      arc(ax, ay, 70, -a1 * 2, -a1 * 2 + Math.PI * 0.8, cBright(0.12), 1.5);
      arc(ax, ay, 70, -a1 * 2 + Math.PI, -a1 * 2 + Math.PI * 1.5, c(0.08), 1);

      // Core rings
      arc(ax, ay, 35, a1 * 3, a1 * 3 + Math.PI * 0.6, cBright(0.15), 1);
      arc(ax, ay, 20, 0, PI2, c(0.06), 0.5);

      // Core glow
      const coreGlow = 0.12 + Math.sin(tick * 0.04) * 0.05;
      ctx.beginPath(); ctx.arc(ax, ay, 6, 0, PI2);
      ctx.fillStyle = cBright(coreGlow);
      ctx.fill();
      ctx.beginPath(); ctx.arc(ax, ay, 2, 0, PI2);
      ctx.fillStyle = `rgba(180, 230, 255, ${coreGlow * 1.5})`;
      ctx.fill();

      // ==========================================
      // MEDIUM ARC CLUSTER — top right
      // ==========================================
      const bx = W * 0.92;
      const by = H * 0.15;
      const a2 = -t * 4;

      arc(bx, by, 120, a2, a2 + Math.PI * 1.5, c(0.13), 2);
      for (let i = 0; i < 36; i++) {
        const angle = (i / 36) * PI2 + a2;
        tickMark(bx, by, 120, angle, i % 4 === 0 ? 8 : 3, c(i % 4 === 0 ? 0.12 : 0.05), 0.5);
      }

      arc(bx, by, 90, -a2 * 0.6, -a2 * 0.6 + Math.PI * 1.2, c(0.1), 1.5);
      arc(bx, by, 65, a2 * 1.5, a2 * 1.5 + Math.PI * 0.7, cBright(0.1), 1, [4, 3]);
      arc(bx, by, 40, -a2 * 2, -a2 * 2 + Math.PI * 0.5, c(0.08), 1);

      // Core
      ctx.beginPath(); ctx.arc(bx, by, 4, 0, PI2);
      ctx.fillStyle = cBright(0.1 + Math.sin(tick * 0.03 + 1) * 0.04);
      ctx.fill();

      // ==========================================
      // SMALL ARC — top left
      // ==========================================
      const dx = W * 0.22;
      const dy = H * 0.12;
      const a4 = t * 5;

      arc(dx, dy, 50, a4, a4 + Math.PI * 1.0, c(0.1), 1);
      arc(dx, dy, 35, -a4 * 0.8, -a4 * 0.8 + Math.PI * 0.7, c(0.08), 1, [3, 3]);
      for (let i = 0; i < 16; i++) {
        tickMark(dx, dy, 50, (i / 16) * PI2 + a4, 4, c(0.06), 0.5);
      }

      // ==========================================
      // SMALL ARC — bottom right
      // ==========================================
      const ex = W * 0.82;
      const ey = H * 0.88;
      const a5 = -t * 3.5;

      arc(ex, ey, 65, a5, a5 + Math.PI * 1.2, c(0.1), 1.5);
      arc(ex, ey, 45, -a5 * 0.5, -a5 * 0.5 + Math.PI * 0.8, c(0.08), 1);
      arc(ex, ey, 28, a5 * 2, a5 * 2 + Math.PI * 0.5, cBright(0.08), 1);
      ctx.beginPath(); ctx.arc(ex, ey, 3, 0, PI2);
      ctx.fillStyle = c(0.1);
      ctx.fill();

      // ==========================================
      // MINI ARC — mid left
      // ==========================================
      const fx = W * 0.04;
      const fy = H * 0.45;
      arc(fx, fy, 40, t * 6, t * 6 + Math.PI * 0.8, c(0.08), 1);
      arc(fx, fy, 25, -t * 4, -t * 4 + Math.PI * 0.5, c(0.06), 1);

      // ==========================================
      // MINI ARC — mid right
      // ==========================================
      const gx = W * 0.96;
      const gy = H * 0.55;
      arc(gx, gy, 35, -t * 5, -t * 5 + Math.PI * 0.7, c(0.08), 1);

      // ==========================================
      // CONNECTING LINES — diagonal tech lines
      // ==========================================
      // Bottom-left cluster to top
      line(ax + 100, ay - 140, ax + 200, ay - 280, cDim(0.06), 0.5, [4, 8]);
      // Top-right cluster down
      line(bx - 80, by + 100, bx - 160, by + 200, cDim(0.05), 0.5, [4, 8]);
      // Horizontal data line across bottom
      const dataLineY = H * 0.95;
      line(W * 0.1, dataLineY, W * 0.9, dataLineY, c(0.04), 0.5);
      // Small notches on data line
      for (let i = 0; i < 20; i++) {
        const x = W * 0.1 + (W * 0.8 / 20) * i;
        line(x, dataLineY - 2, x, dataLineY + 2, c(0.06), 0.5);
      }

      // Horizontal data line across top
      const topLineY = H * 0.04;
      line(W * 0.15, topLineY, W * 0.85, topLineY, c(0.04), 0.5);
      for (let i = 0; i < 15; i++) {
        const x = W * 0.15 + (W * 0.7 / 15) * i;
        line(x, topLineY - 2, x, topLineY + 2, c(0.06), 0.5);
      }

      // ==========================================
      // CORNER BRACKETS — bold
      // ==========================================
      const bs = 40;
      const bc = c(0.15);
      // Top-left
      line(6, bs + 6, 6, 6, bc, 1.5); line(6, 6, bs + 6, 6, bc, 1.5);
      // Top-right
      line(W - bs - 6, 6, W - 6, 6, bc, 1.5); line(W - 6, 6, W - 6, bs + 6, bc, 1.5);
      // Bottom-left
      line(6, H - bs - 6, 6, H - 6, bc, 1.5); line(6, H - 6, bs + 6, H - 6, bc, 1.5);
      // Bottom-right
      line(W - bs - 6, H - 6, W - 6, H - 6, bc, 1.5); line(W - 6, H - 6, W - 6, H - bs - 6, bc, 1.5);

      // Inner corner accents
      const bs2 = 20;
      const bc2 = c(0.08);
      line(14, bs2 + 14, 14, 14, bc2, 0.5); line(14, 14, bs2 + 14, 14, bc2, 0.5);
      line(W - bs2 - 14, 14, W - 14, 14, bc2, 0.5); line(W - 14, 14, W - 14, bs2 + 14, bc2, 0.5);
      line(14, H - bs2 - 14, 14, H - 14, bc2, 0.5); line(14, H - 14, bs2 + 14, H - 14, bc2, 0.5);
      line(W - bs2 - 14, H - 14, W - 14, H - 14, bc2, 0.5); line(W - 14, H - 14, W - 14, H - bs2 - 14, bc2, 0.5);

      // ==========================================
      // FLOATING PARTICLES
      // ==========================================
      for (let i = 0; i < 25; i++) {
        const px = ((i * 137.5 + tick * 0.15) % W);
        const py = ((i * 89.3 + tick * 0.1 + i * 30) % H);
        const size = 0.5 + (i % 3) * 0.5;
        const alpha = 0.06 + Math.sin(tick * 0.015 + i * 0.7) * 0.04;
        ctx.beginPath();
        ctx.arc(px, py, size, 0, PI2);
        ctx.fillStyle = cBright(alpha);
        ctx.fill();
      }

      // ==========================================
      // HEX DECORATION — scattered small hexagons
      // ==========================================
      const drawHex = (hx: number, hy: number, r: number, alpha: number) => {
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
          const angle = (i / 6) * PI2 - Math.PI / 6;
          const px = hx + Math.cos(angle) * r;
          const py = hy + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.strokeStyle = c(alpha);
        ctx.lineWidth = 0.5;
        ctx.stroke();
      };

      drawHex(W * 0.35, H * 0.08, 8, 0.06);
      drawHex(W * 0.65, H * 0.92, 10, 0.05);
      drawHex(W * 0.95, H * 0.4, 6, 0.06);
      drawHex(W * 0.05, H * 0.3, 7, 0.05);
      drawHex(W * 0.5, H * 0.06, 5, 0.04);
      drawHex(W * 0.75, H * 0.06, 6, 0.05);

      // ==========================================
      // DATA READOUT LINES — small text-like dashes
      // ==========================================
      const drawReadout = (rx: number, ry: number, count: number, dir: number) => {
        for (let i = 0; i < count; i++) {
          const w = 5 + Math.random() * 15;
          const x = rx + (i * 4 + i * w * 0.3) * dir;
          line(x, ry, x + w * dir, ry, cDim(0.06 + Math.random() * 0.04), 1);
        }
      };

      drawReadout(W * 0.18, H * 0.97, 8, 1);
      drawReadout(W * 0.82, H * 0.97, 8, -1);
      drawReadout(W * 0.18, H * 0.02, 6, 1);
      drawReadout(W * 0.82, H * 0.02, 6, -1);

      animFrame = requestAnimationFrame(draw);
    };

    draw();
    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}
