import React, { useRef, useEffect } from 'react';
import { useSupabase } from '../../context/SupabaseContext';

interface Hero3DCanvasProps {
  className?: string;
}

export const Hero3DCanvas: React.FC<Hero3DCanvasProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useSupabase();
  const isDark = theme === 'midnight';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 600);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 450);

    const handleResize = () => {
      if (!canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Mouse tracking for 3D tilt
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0.35;
    let targetRotY = 0.55;
    let rotX = 0.35;
    let rotY = 0.55;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetRotY = x * 1.5;
      targetRotX = -y * 1.2 + 0.3;
    };

    canvas.addEventListener('mousemove', handleMouseMove);

    // 3D Geometry: Nested Cubes & Prisms (Database Stack)
    interface Point3D {
      x: number;
      y: number;
      z: number;
    }

    // Generate layered 3D database tiers
    const createCube = (size: number, offsetY: number): Point3D[] => {
      const s = size / 2;
      return [
        { x: -s, y: -s + offsetY, z: -s },
        { x: s, y: -s + offsetY, z: -s },
        { x: s, y: s + offsetY, z: -s },
        { x: -s, y: s + offsetY, z: -s },
        { x: -s, y: -s + offsetY, z: s },
        { x: s, y: -s + offsetY, z: s },
        { x: s, y: s + offsetY, z: s },
        { x: -s, y: s + offsetY, z: s },
      ];
    };

    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0], // back face
      [4, 5], [5, 6], [6, 7], [7, 4], // front face
      [0, 4], [1, 5], [2, 6], [3, 7], // connecting
    ];

    const faces = [
      [0, 1, 2, 3], // back
      [4, 5, 6, 7], // front
      [0, 1, 5, 4], // top
      [2, 3, 7, 6], // bottom
      [0, 3, 7, 4], // left
      [1, 2, 6, 5], // right
    ];

    // Multi-tier Database Blocks
    const tier1 = createCube(130, -75);
    const tier2 = createCube(160, 0);
    const tier3 = createCube(190, 85);

    // Floating orbital data nodes
    const particleCount = 38;
    const particles: { angle: number; speed: number; radius: number; height: number; size: number }[] = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        angle: (i / particleCount) * Math.PI * 2,
        speed: 0.008 + (i % 3) * 0.004,
        radius: 120 + (i % 4) * 35,
        height: (Math.random() - 0.5) * 180,
        size: 2.5 + (i % 3) * 1.5,
      });
    }

    const project = (p: Point3D, rx: number, ry: number, cx: number, cy: number, scale = 1.3) => {
      // Rotate Y
      const cosY = Math.cos(ry);
      const sinY = Math.sin(ry);
      const x1 = p.x * cosY + p.z * sinY;
      const z1 = -p.x * sinY + p.z * cosY;

      // Rotate X
      const cosX = Math.cos(rx);
      const sinX = Math.sin(rx);
      const y2 = p.y * cosX - z1 * sinX;
      const z2 = p.y * sinX + z1 * cosX;

      // Perspective projection
      const distance = 460;
      const fov = distance / (distance + z2);

      return {
        x: cx + x1 * fov * scale,
        y: cy + y2 * fov * scale,
        z: z2,
        fov,
      };
    };

    let tick = 0;

    const render = () => {
      tick += 0.015;
      rotX += (targetRotX - rotX) * 0.06;
      rotY += (targetRotY + Math.sin(tick * 0.5) * 0.1 - rotY) * 0.06;

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2 + 10;

      // Draw background ambient glow
      const grad = ctx.createRadialGradient(cx, cy, 20, cx, cy, 220);
      if (isDark) {
        grad.addColorStop(0, 'rgba(224, 72, 109, 0.12)');
        grad.addColorStop(0.6, 'rgba(224, 72, 109, 0.03)');
        grad.addColorStop(1, 'rgba(15, 13, 14, 0)');
      } else {
        grad.addColorStop(0, 'rgba(139, 30, 63, 0.09)');
        grad.addColorStop(0.6, 'rgba(139, 30, 63, 0.02)');
        grad.addColorStop(1, 'rgba(250, 247, 242, 0)');
      }
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      // Draw 3D Ground Grid (Isometric Ring Floor)
      ctx.save();
      const ringRadius = 210;
      ctx.beginPath();
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 16) {
        const p = project({ x: Math.cos(a) * ringRadius, y: 140, z: Math.sin(a) * ringRadius }, rotX, rotY, cx, cy);
        if (a === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.closePath();
      ctx.strokeStyle = isDark ? 'rgba(84, 28, 41, 0.6)' : 'rgba(232, 221, 210, 0.8)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.restore();

      // Render Cubes
      const tiers = [tier1, tier2, tier3];

      tiers.forEach((vertices, tierIdx) => {
        const projected = vertices.map((v) => project(v, rotX, rotY, cx, cy));

        // Draw translucent faces for depth
        faces.forEach((face) => {
          const p0 = projected[face[0]];
          const p1 = projected[face[1]];
          const p2 = projected[face[2]];
          const p3 = projected[face[3]];

          // Calculate normal for back-face culling & lighting
          const v1x = p1.x - p0.x;
          const v1y = p1.y - p0.y;
          const v2x = p2.x - p0.x;
          const v2y = p2.y - p0.y;
          const normalZ = v1x * v2y - v1y * v2x;

          if (normalZ > 0) {
            ctx.beginPath();
            ctx.moveTo(p0.x, p0.y);
            ctx.lineTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.lineTo(p3.x, p3.y);
            ctx.closePath();

            const alpha = 0.03 + (tierIdx === 1 ? 0.06 : 0.02);
            if (isDark) {
              ctx.fillStyle = tierIdx === 1 ? `rgba(255, 90, 132, ${alpha + 0.04})` : `rgba(245, 242, 243, ${alpha})`;
            } else {
              ctx.fillStyle = tierIdx === 1 ? `rgba(139, 30, 63, ${alpha})` : `rgba(43, 29, 32, ${alpha})`;
            }
            ctx.fill();
          }
        });

        // Draw Edges
        ctx.beginPath();
        edges.forEach(([i, j]) => {
          const pA = projected[i];
          const pB = projected[j];
          ctx.moveTo(pA.x, pA.y);
          ctx.lineTo(pB.x, pB.y);
        });

        if (tierIdx === 1) {
          ctx.strokeStyle = isDark ? 'rgba(255, 90, 132, 0.85)' : 'rgba(139, 30, 63, 0.65)';
          ctx.lineWidth = 1.6;
        } else {
          ctx.strokeStyle = isDark ? 'rgba(184, 168, 172, 0.45)' : 'rgba(104, 85, 89, 0.45)';
          ctx.lineWidth = 1.1;
        }
        ctx.stroke();

        // Draw Vertices
        projected.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, p.y, tierIdx === 1 ? 3 : 2, 0, Math.PI * 2);
          if (isDark) {
            ctx.fillStyle = tierIdx === 1 ? '#FF5A84' : '#B8A8AC';
          } else {
            ctx.fillStyle = tierIdx === 1 ? '#8B1E3F' : '#685559';
          }
          ctx.fill();
        });
      });

      // Draw Energy Rings around central core
      const coreY = -5;
      const energyRadius = 140 + Math.sin(tick * 2) * 6;
      ctx.beginPath();
      for (let a = 0; a <= Math.PI * 2; a += Math.PI / 20) {
        const p = project(
          {
            x: Math.cos(a + tick * 0.8) * energyRadius,
            y: coreY + Math.sin(a * 3 + tick) * 12,
            z: Math.sin(a + tick * 0.8) * energyRadius,
          },
          rotX,
          rotY,
          cx,
          cy
        );
        if (a === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = isDark ? 'rgba(255, 90, 132, 0.75)' : 'rgba(139, 30, 63, 0.5)';
      ctx.lineWidth = 1.4;
      ctx.stroke();

      // Render Orbital Particles
      particles.forEach((pt) => {
        pt.angle += pt.speed;
        const p = project(
          {
            x: Math.cos(pt.angle) * pt.radius,
            y: pt.height + Math.sin(pt.angle * 2) * 20,
            z: Math.sin(pt.angle) * pt.radius,
          },
          rotX,
          rotY,
          cx,
          cy
        );

        ctx.beginPath();
        ctx.arc(p.x, p.y, pt.size * p.fov, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? 'rgba(255, 90, 132, 0.9)' : 'rgba(139, 30, 63, 0.75)';
        ctx.fill();

        // Trace beam to core
        if (Math.random() > 0.96) {
          const coreProj = project({ x: 0, y: 0, z: 0 }, rotX, rotY, cx, cy);
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(coreProj.x, coreProj.y);
          ctx.strokeStyle = isDark ? 'rgba(255, 90, 132, 0.35)' : 'rgba(139, 30, 63, 0.18)';
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [isDark]);

  return (
    <div className={`relative w-full h-full min-h-[380px] flex items-center justify-center ${className || ''}`}>
      <canvas ref={canvasRef} className="w-full h-full block cursor-grab active:cursor-grabbing" />
      <div className="absolute bottom-3 left-4 text-[11px] font-mono text-[#9B888C] tracking-wide pointer-events-none">
        INTERACTIVE 3D POSTGRES CORE • ROTATE WITH CURSOR
      </div>
    </div>
  );
};
