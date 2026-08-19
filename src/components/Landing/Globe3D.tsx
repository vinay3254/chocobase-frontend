import React, { useRef, useEffect, useState } from 'react';

interface Globe3DProps {
  className?: string;
}

export const Globe3D: React.FC<Globe3DProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeRegion, setActiveRegion] = useState('us-east-1 (N. Virginia)');
  const [activeLatency, setActiveLatency] = useState('18ms');

  const regions = [
    { name: 'us-east-1 (N. Virginia)', lat: 38.9, lon: -77.0, latency: '18ms' },
    { name: 'eu-west-1 (Frankfurt)', lat: 50.1, lon: 8.6, latency: '24ms' },
    { name: 'ap-southeast-1 (Singapore)', lat: 1.3, lon: 103.8, latency: '32ms' },
    { name: 'ap-northeast-1 (Tokyo)', lat: 35.6, lon: 139.6, latency: '39ms' },
    { name: 'sa-east-1 (São Paulo)', lat: -23.5, lon: -46.6, latency: '54ms' },
    { name: 'us-west-1 (California)', lat: 37.7, lon: -122.4, latency: '14ms' },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 320);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 260);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };
    window.addEventListener('resize', handleResize);

    // Generate Globe Dot Matrix (latitude & longitude grid)
    const globeRadius = Math.min(width, height) * 0.38;
    const dots: { x: number; y: number; z: number }[] = [];

    const numLat = 18;
    const numLon = 32;

    for (let i = 0; i <= numLat; i++) {
      const phi = (i / numLat) * Math.PI; // 0 to PI
      const ringRadius = globeRadius * Math.sin(phi);
      const y = globeRadius * Math.cos(phi);

      for (let j = 0; j < numLon; j++) {
        const theta = (j / numLon) * Math.PI * 2; // 0 to 2PI
        const x = ringRadius * Math.cos(theta);
        const z = ringRadius * Math.sin(theta);
        dots.push({ x, y, z });
      }
    }

    let rotY = 0;
    const rotX = 0.25;

    let mouseIsDown = false;
    let lastMouseX = 0;
    let dragVelocity = 0.005;

    const onMouseDown = (e: MouseEvent) => {
      mouseIsDown = true;
      lastMouseX = e.clientX;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!mouseIsDown) return;
      const dx = e.clientX - lastMouseX;
      lastMouseX = e.clientX;
      rotY += dx * 0.01;
      dragVelocity = dx * 0.003;
    };

    const onMouseUp = () => {
      mouseIsDown = false;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

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
      tick++;
      if (!mouseIsDown) {
        dragVelocity *= 0.95;
        rotY += 0.004 + dragVelocity;
      }

      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;

      // Draw outer atmosphere glow
      const atmosphere = ctx.createRadialGradient(cx, cy, globeRadius * 0.7, cx, cy, globeRadius * 1.25);
      atmosphere.addColorStop(0, 'rgba(139, 30, 63, 0.06)');
      atmosphere.addColorStop(1, 'rgba(250, 247, 242, 0)');
      ctx.fillStyle = atmosphere;
      ctx.beginPath();
      ctx.arc(cx, cy, globeRadius * 1.2, 0, Math.PI * 2);
      ctx.fill();

      // Render Dots
      dots.forEach((dot) => {
        const p = project(dot.x, dot.y, dot.z, rotX, rotY, cx, cy);
        if (p.z > -globeRadius * 0.2) {
          const depthAlpha = Math.max(0.1, (p.z + globeRadius) / (globeRadius * 2));
          ctx.beginPath();
          ctx.arc(p.x, p.y, Math.max(0.7, 1.3 * p.fov), 0, Math.PI * 2);
          ctx.fillStyle = `rgba(104, 85, 89, ${depthAlpha * 0.45})`;
          ctx.fill();
        }
      });

      // Render Regions (Points on Globe)
      regions.forEach((reg) => {
        const phi = (90 - reg.lat) * (Math.PI / 180);
        const theta = (reg.lon + 180) * (Math.PI / 180);

        const x = -globeRadius * Math.sin(phi) * Math.cos(theta);
        const y = globeRadius * Math.cos(phi);
        const z = globeRadius * Math.sin(phi) * Math.sin(theta);

        const p = project(x, y, z, rotX, rotY, cx, cy);

        // Only draw if on front hemisphere
        if (p.z > 0) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3.5 * p.fov, 0, Math.PI * 2);
          ctx.fillStyle = '#8B1E3F';
          ctx.fill();

          // Pulsing halo
          const pulse = (Math.sin(tick * 0.08 + reg.lat) + 1) * 3 + 4;
          ctx.beginPath();
          ctx.arc(p.x, p.y, pulse * p.fov, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(139, 30, 63, 0.4)';
          ctx.lineWidth = 1;
          ctx.stroke();

          // Draw connection to center
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x, p.y - 12);
          ctx.strokeStyle = '#8B1E3F';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className={`relative flex flex-col items-center ${className || ''}`}>
      <canvas ref={canvasRef} className="w-full h-48 block cursor-grab active:cursor-grabbing" />
      <div className="w-full px-4 pt-2 flex items-center justify-between border-t border-[#E8DDD2] text-xs">
        <select
          value={activeRegion}
          onChange={(e) => {
            const reg = regions.find((r) => r.name === e.target.value);
            if (reg) {
              setActiveRegion(reg.name);
              setActiveLatency(reg.latency);
            }
          }}
          className="bg-transparent text-xs font-semibold text-[#2B1D20] focus:outline-hidden cursor-pointer"
        >
          {regions.map((r) => (
            <option key={r.name} value={r.name}>
              {r.name}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1 font-mono text-[11px] text-[#286E4F]">
          <span>{activeLatency}</span>
        </div>
      </div>
    </div>
  );
};
