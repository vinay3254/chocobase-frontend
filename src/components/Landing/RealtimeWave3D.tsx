import React, { useRef, useEffect, useState } from 'react';

interface RealtimeWave3DProps {
  className?: string;
}

export const RealtimeWave3D: React.FC<RealtimeWave3DProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [channelFrequency, setChannelFrequency] = useState(48);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 320);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 240);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    const rows = 12;
    const cols = 18;
    const spacingX = 14;
    const spacingZ = 12;

    const rotX = 0.55;
    const rotY = 0.45;

    const project = (x: number, y: number, z: number, rx: number, ry: number, cx: number, cy: number) => {
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      const x1 = x * cosY + z * sinY;
      const z1 = -x * sinY + z * cosY;

      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const y2 = y * cosX - z1 * sinX;
      const z2 = y * sinX + z1 * cosX;

      const distance = 300;
      const fov = distance / (distance + z2);

      return {
        x: cx + x1 * fov,
        y: cy + y2 * fov,
        z: z2,
        fov,
      };
    };

    let tick = 0;

    const render = () => {
      tick += 0.035;
      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Compute grid of 3D wave points
      const grid: { x: number; y: number; z: number; fov: number; origY: number }[][] = [];

      for (let r = 0; r < rows; r++) {
        grid[r] = [];
        for (let c = 0; c < cols; c++) {
          const worldX = (c - cols / 2) * spacingX;
          const worldZ = (r - rows / 2) * spacingZ;

          // Wave equation
          const distFromCenter = Math.sqrt(worldX * worldX + worldZ * worldZ) * 0.06;
          const worldY = Math.sin(distFromCenter - tick) * 16 + Math.cos((worldX * 0.08) + tick * 0.5) * 8;

          const p = project(worldX, worldY, worldZ, rotX, rotY, cx, cy);
          grid[r][c] = { ...p, origY: worldY };
        }
      }

      // Draw rows (lines across X)
      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        for (let c = 0; c < cols; c++) {
          const p = grid[r][c];
          if (c === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = r % 2 === 0 ? 'rgba(139, 30, 63, 0.45)' : 'rgba(104, 85, 89, 0.25)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Draw cols (lines across Z)
      for (let c = 0; c < cols; c++) {
        ctx.beginPath();
        for (let r = 0; r < rows; r++) {
          const p = grid[r][c];
          if (r === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        }
        ctx.strokeStyle = 'rgba(232, 221, 210, 0.7)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }

      // Highlight peak nodes with Burgundy points
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const p = grid[r][c];
          if (p.origY < -10) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2 * p.fov, 0, Math.PI * 2);
            ctx.fillStyle = '#8B1E3F';
            ctx.fill();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={`relative flex flex-col items-center ${className || ''}`}>
      <canvas ref={canvasRef} className="w-full h-48 block" />
      <div className="w-full px-4 pt-2 flex items-center justify-between border-t border-[#E8DDD2] text-xs">
        <span className="font-semibold text-[#2B1D20]">Broadcast Pipeline</span>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={10}
            max={120}
            value={channelFrequency}
            onChange={(e) => setChannelFrequency(+e.target.value)}
            className="w-16 accent-[#8B1E3F] cursor-pointer"
          />
          <span className="font-mono text-[11px] text-[#8B1E3F]">{channelFrequency} msg/s</span>
        </div>
      </div>
    </div>
  );
};
