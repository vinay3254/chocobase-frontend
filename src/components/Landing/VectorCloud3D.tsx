import React, { useRef, useEffect, useState } from 'react';

interface VectorCloud3DProps {
  className?: string;
}

export const VectorCloud3D: React.FC<VectorCloud3DProps> = ({ className }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [metric, setMetric] = useState<'cosine' | 'euclidean' | 'dot'>('cosine');
  const [similarityScore, setSimilarityScore] = useState(0.964);

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

    // Generate clusters of 3D points representing semantic embeddings
    interface VectorPoint {
      x: number;
      y: number;
      z: number;
      cluster: number;
      name: string;
    }

    const points: VectorPoint[] = [];
    const clusterCenters = [
      { x: -50, y: -30, z: 20, cluster: 0, label: 'Auth & Security' },
      { x: 45, y: 40, z: -30, cluster: 1, label: 'Realtime Data' },
      { x: 10, y: -45, z: -40, cluster: 2, label: 'Postgres Index' },
      { x: -40, y: 45, z: 40, cluster: 3, label: 'Edge Compute' },
    ];

    clusterCenters.forEach((center) => {
      // 10 satellite vectors per cluster
      for (let i = 0; i < 10; i++) {
        points.push({
          x: center.x + (Math.random() - 0.5) * 45,
          y: center.y + (Math.random() - 0.5) * 45,
          z: center.z + (Math.random() - 0.5) * 45,
          cluster: center.cluster,
          name: `${center.label} #${i + 1}`,
        });
      }
    });

    let rotX = 0.2;
    let rotY = 0.4;
    let mouseIsDown = false;
    let lastMouseX = 0;
    let lastMouseY = 0;

    const onMouseDown = (e: MouseEvent) => {
      mouseIsDown = true;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!mouseIsDown) return;
      const dx = e.clientX - lastMouseX;
      const dy = e.clientY - lastMouseY;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
      rotY += dx * 0.01;
      rotX += dy * 0.01;
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

      const distance = 280;
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
      tick += 0.01;
      if (!mouseIsDown) {
        rotY += 0.003;
      }

      ctx.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;

      // Draw 3D coordinate axes grid
      const axisLen = 65;
      const origin = project(0, 0, 0, rotX, rotY, cx, cy);
      const px = project(axisLen, 0, 0, rotX, rotY, cx, cy);
      const py = project(0, axisLen, 0, rotX, rotY, cx, cy);
      const pz = project(0, 0, axisLen, rotX, rotY, cx, cy);

      ctx.strokeStyle = 'rgba(232, 221, 210, 0.9)';
      ctx.lineWidth = 1;

      // X axis
      ctx.beginPath();
      ctx.moveTo(origin.x, origin.y);
      ctx.lineTo(px.x, px.y);
      ctx.stroke();

      // Y axis
      ctx.beginPath();
      ctx.moveTo(origin.x, origin.y);
      ctx.lineTo(py.x, py.y);
      ctx.stroke();

      // Z axis
      ctx.beginPath();
      ctx.moveTo(origin.x, origin.y);
      ctx.lineTo(pz.x, pz.y);
      ctx.stroke();

      // Draw active query vector
      const queryPos = {
        x: Math.sin(tick * 0.8) * 40,
        y: Math.cos(tick * 0.6) * 35,
        z: Math.sin(tick * 0.4) * 30,
      };
      const queryProj = project(queryPos.x, queryPos.y, queryPos.z, rotX, rotY, cx, cy);

      // Connect query vector to nearest cluster
      const nearest = points[0];
      const nearProj = project(nearest.x, nearest.y, nearest.z, rotX, rotY, cx, cy);

      ctx.beginPath();
      ctx.moveTo(queryProj.x, queryProj.y);
      ctx.lineTo(nearProj.x, nearProj.y);
      ctx.strokeStyle = '#8B1E3F';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw points
      points.forEach((pt) => {
        const p = project(pt.x, pt.y, pt.z, rotX, rotY, cx, cy);
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(1, 2.8 * p.fov), 0, Math.PI * 2);
        ctx.fillStyle = pt.cluster === 0 ? '#8B1E3F' : '#685559';
        ctx.fill();
      });

      // Draw Query Vector Node
      ctx.beginPath();
      ctx.arc(queryProj.x, queryProj.y, 4.5 * queryProj.fov, 0, Math.PI * 2);
      ctx.fillStyle = '#8B1E3F';
      ctx.fill();

      // Query vector halo
      ctx.beginPath();
      ctx.arc(queryProj.x, queryProj.y, 8 * queryProj.fov, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(139, 30, 63, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

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
        <div className="flex items-center gap-1.5">
          {(['cosine', 'euclidean', 'dot'] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMetric(m);
                setSimilarityScore(+(0.94 + Math.random() * 0.05).toFixed(3));
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
                metric === m ? 'bg-[#8B1E3F] text-white' : 'text-[#685559] hover:text-[#2B1D20]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="font-mono text-[11px] text-[#8B1E3F]">
          Score: {similarityScore}
        </div>
      </div>
    </div>
  );
};
