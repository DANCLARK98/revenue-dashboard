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

    const drawArc = (
      x: number, y: number, r: number, startAngle: number, endAngle: number,
      color: string, width: number, dashed?: number[]
    ) => {
      ctx.beginPath();
      ctx.arc(x, y, r, startAngle, endAngle);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      if (dashed) ctx.setLineDash(dashed);
      else ctx.setLineDash([]);
      ctx.stroke();
    };

    const drawTick = (
      cx: number, cy: number, r: number, angle: number,
      inner: number, outer: number, color: string, width: number
    ) => {
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(angle) * (r - inner), cy + Math.sin(angle) * (r - inner));
      ctx.lineTo(cx + Math.cos(angle) * (r + outer), cy + Math.sin(angle) * (r + outer));
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.setLineDash([]);
      ctx.stroke();
    };

    const draw = () => {
      const W = canvas.width;
      const H = canvas.height;
      tick++;

      ctx.clearRect(0, 0, W, H);

      // Subtle grid
      ctx.strokeStyle = "rgba(0, 140, 220, 0.03)";
      ctx.lineWidth = 0.5;
      ctx.setLineDash([]);
      const gridSize = 80;
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // === LARGE ARC REACTOR — bottom left ===
      const cx1 = W * 0.13;
      const cy1 = H * 0.82;
      const baseAngle1 = tick * 0.003;

      // Outer rotating ring
      drawArc(cx1, cy1, 140, baseAngle1, baseAngle1 + Math.PI * 1.2, "rgba(0, 160, 255, 0.07)", 2);
      drawArc(cx1, cy1, 140, baseAngle1 + Math.PI * 1.4, baseAngle1 + Math.PI * 1.9, "rgba(0, 160, 255, 0.05)", 1);

      // Middle ring with ticks
      drawArc(cx1, cy1, 100, -baseAngle1 * 0.7, -baseAngle1 * 0.7 + Math.PI * 1.5, "rgba(0, 180, 255, 0.08)", 1.5);
      for (let i = 0; i < 36; i++) {
        const a = (i / 36) * Math.PI * 2 - baseAngle1 * 0.7;
        drawTick(cx1, cy1, 100, a, 3, 6, "rgba(0, 160, 255, 0.05)", 0.5);
      }

      // Inner ring
      drawArc(cx1, cy1, 60, baseAngle1 * 1.5, baseAngle1 * 1.5 + Math.PI * 0.8, "rgba(0, 200, 255, 0.06)", 1);
      drawArc(cx1, cy1, 60, baseAngle1 * 1.5 + Math.PI, baseAngle1 * 1.5 + Math.PI * 1.6, "rgba(0, 200, 255, 0.04)", 1);

      // Core dot
      ctx.beginPath();
      ctx.arc(cx1, cy1, 4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 200, 255, ${0.06 + Math.sin(tick * 0.05) * 0.03})`;
      ctx.fill();

      // === MEDIUM ARC — top right ===
      const cx2 = W * 0.88;
      const cy2 = H * 0.18;
      const baseAngle2 = -tick * 0.004;

      drawArc(cx2, cy2, 90, baseAngle2, baseAngle2 + Math.PI * 1.4, "rgba(0, 140, 255, 0.06)", 1.5);
      drawArc(cx2, cy2, 70, -baseAngle2 * 0.5, -baseAngle2 * 0.5 + Math.PI * 1.0, "rgba(0, 160, 255, 0.05)", 1);
      drawArc(cx2, cy2, 50, baseAngle2 * 2, baseAngle2 * 2 + Math.PI * 0.6, "rgba(0, 180, 255, 0.04)", 1, [4, 4]);

      for (let i = 0; i < 24; i++) {
        const a = (i / 24) * Math.PI * 2 + baseAngle2;
        drawTick(cx2, cy2, 90, a, 2, 5, "rgba(0, 140, 255, 0.04)", 0.5);
      }

      // === SMALL TARGETING RETICLE — center ===
      const cx3 = W * 0.5;
      const cy3 = H * 0.5;

      // Crosshair lines (very faint)
      ctx.strokeStyle = "rgba(0, 140, 255, 0.02)";
      ctx.lineWidth = 0.5;
      ctx.setLineDash([6, 12]);
      ctx.beginPath(); ctx.moveTo(cx3 - 200, cy3); ctx.lineTo(cx3 + 200, cy3); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(cx3, cy3 - 120); ctx.lineTo(cx3, cy3 + 120); ctx.stroke();
      ctx.setLineDash([]);

      // Small rotating arcs
      drawArc(cx3, cy3, 30, tick * 0.01, tick * 0.01 + Math.PI * 0.5, "rgba(0, 180, 255, 0.04)", 1);
      drawArc(cx3, cy3, 30, tick * 0.01 + Math.PI, tick * 0.01 + Math.PI * 1.3, "rgba(0, 180, 255, 0.03)", 1);

      // === DECORATIVE ARC — bottom right ===
      const cx4 = W * 0.78;
      const cy4 = H * 0.9;
      drawArc(cx4, cy4, 60, tick * 0.005, tick * 0.005 + Math.PI * 0.7, "rgba(0, 120, 255, 0.05)", 1);
      drawArc(cx4, cy4, 45, -tick * 0.003, -tick * 0.003 + Math.PI * 0.5, "rgba(0, 150, 255, 0.04)", 1);

      // === CORNER BRACKETS ===
      const bracketSize = 30;
      const bracketColor = "rgba(0, 160, 255, 0.06)";
      ctx.strokeStyle = bracketColor;
      ctx.lineWidth = 1;
      // Top-left
      ctx.beginPath(); ctx.moveTo(8, bracketSize + 8); ctx.lineTo(8, 8); ctx.lineTo(bracketSize + 8, 8); ctx.stroke();
      // Top-right
      ctx.beginPath(); ctx.moveTo(W - bracketSize - 8, 8); ctx.lineTo(W - 8, 8); ctx.lineTo(W - 8, bracketSize + 8); ctx.stroke();
      // Bottom-left
      ctx.beginPath(); ctx.moveTo(8, H - bracketSize - 8); ctx.lineTo(8, H - 8); ctx.lineTo(bracketSize + 8, H - 8); ctx.stroke();
      // Bottom-right
      ctx.beginPath(); ctx.moveTo(W - bracketSize - 8, H - 8); ctx.lineTo(W - 8, H - 8); ctx.lineTo(W - 8, H - bracketSize - 8); ctx.stroke();

      // === FLOATING PARTICLES ===
      for (let i = 0; i < 8; i++) {
        const px = ((i * 137.5 + tick * 0.2) % W);
        const py = ((i * 89.3 + tick * 0.15) % H);
        ctx.beginPath();
        ctx.arc(px, py, 1, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 180, 255, ${0.03 + Math.sin(tick * 0.02 + i) * 0.02})`;
        ctx.fill();
      }

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
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}
