import React, { useRef, useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { useSupabase } from '../../context/SupabaseContext';

interface PostgresCluster3DProps {
  className?: string;
  activeTier?: 'primary' | 'replica' | 'analytics';
  onTierChange?: (tier: 'primary' | 'replica' | 'analytics') => void;
}

export const PostgresCluster3D: React.FC<PostgresCluster3DProps> = ({ 
  className,
  activeTier: externalActiveTier,
  onTierChange
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { theme } = useSupabase();
  const isDark = theme === 'midnight';
  const [internalTier, setInternalTier] = useState<'primary' | 'replica' | 'analytics'>('primary');
  const [iops, setIops] = useState(1480);
  const [cacheHit, setCacheHit] = useState(99.8);
  const [connections, setConnections] = useState(38);

  const activeTier = externalActiveTier || internalTier;

  const handleSelectTier = (tier: 'primary' | 'replica' | 'analytics') => {
    setInternalTier(tier);
    if (onTierChange) onTierChange(tier);
  };

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

    // 3D Nodes representing PostgreSQL Architecture
    interface ClusterNode {
      id: string;
      label: string;
      tier: 'primary' | 'replica' | 'analytics';
      baseX: number;
      baseY: number;
      baseZ: number;
      radius: number;
      color: string;
      accentColor: string;
      isPrimary?: boolean;
    }

    const nodes: ClusterNode[] = [
      // Primary Coordinator & Buffer Pool
      { id: 'master', label: 'Primary (Write)', tier: 'primary', baseX: 0, baseY: -25, baseZ: 0, radius: 18, color: '#8B1E3F', accentColor: '#D68E6D', isPrimary: true },
      // Read Replicas (Sync stream)
      { id: 'rep-1', label: 'Replica East', tier: 'replica', baseX: -65, baseY: 20, baseZ: -35, radius: 12, color: '#286E4F', accentColor: '#C4E6D5' },
      { id: 'rep-2', label: 'Replica West', tier: 'replica', baseX: 65, baseY: 20, baseZ: -35, radius: 12, color: '#286E4F', accentColor: '#C4E6D5' },
      { id: 'rep-3', label: 'Replica EU', tier: 'replica', baseX: -55, baseY: 30, baseZ: 45, radius: 11, color: '#286E4F', accentColor: '#C4E6D5' },
      // Analytics & Columnar OLAP shard
      { id: 'olap-1', label: 'OLAP DuckDB', tier: 'analytics', baseX: 55, baseY: 30, baseZ: 45, radius: 13, color: '#A0522D', accentColor: '#F5CBD3' },
    ];

    // Animated particles flowing between nodes (Replication log stream & query bus)
    interface StreamParticle {
      sourceIndex: number;
      targetIndex: number;
      progress: number;
      speed: number;
      color: string;
    }

    const particles: StreamParticle[] = [];
    for (let i = 0; i < 18; i++) {
      const targetIdx = 1 + (i % 4);
      particles.push({
        sourceIndex: 0,
        targetIndex: targetIdx,
        progress: Math.random(),
        speed: 0.008 + Math.random() * 0.012,
        color: targetIdx === 4 ? '#D68E6D' : '#286E4F',
      });
    }

    // Interactive mouse rotation
    let rotX = 0.35;
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
      rotY += dx * 0.008;
      rotX += dy * 0.008;
      lastMouseX = e.clientX;
      lastMouseY = e.clientY;
    };

    const onMouseUp = () => {
      mouseIsDown = false;
    };

    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // 3D Isometric projection math
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
      const fov = distance / (distance + z2 + 100);

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
        rotY += 0.003;
      }

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2 - 4;

      // Draw Base Ring / Storage Substrate Grid
      const baseRadius = 85;
      const ringSegments = 28;
      ctx.beginPath();
      for (let i = 0; i <= ringSegments; i++) {
        const angle = (i / ringSegments) * Math.PI * 2;
        const bx = baseRadius * Math.cos(angle);
        const bz = baseRadius * Math.sin(angle);
        const p = project(bx, 45, bz, rotX, rotY, cx, cy);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = isDark ? 'rgba(84, 28, 41, 0.4)' : 'rgba(232, 221, 210, 0.55)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([3, 3]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Concentric Storage Rings (Buffer Pool / SSD WAL)
      const innerRadius = 50;
      ctx.beginPath();
      for (let i = 0; i <= ringSegments; i++) {
        const angle = (i / ringSegments) * Math.PI * 2;
        const bx = innerRadius * Math.cos(angle);
        const bz = innerRadius * Math.sin(angle);
        const p = project(bx, 45, bz, rotX, rotY, cx, cy);
        if (i === 0) ctx.moveTo(p.x, p.y);
        else ctx.lineTo(p.x, p.y);
      }
      ctx.strokeStyle = isDark ? 'rgba(255, 90, 132, 0.2)' : 'rgba(139, 30, 63, 0.12)';
      ctx.stroke();

      // Project all nodes
      const projectedNodes = nodes.map((node) => {
        // Floating hover motion
        const floatOffset = Math.sin(tick * 0.04 + node.baseX * 0.1) * 3;
        const p = project(node.baseX, node.baseY + floatOffset, node.baseZ, rotX, rotY, cx, cy);
        return {
          ...node,
          projX: p.x,
          projY: p.y,
          projZ: p.z,
          fov: p.fov,
        };
      });

      // Sort by Z for proper 3D occlusion
      projectedNodes.sort((a, b) => a.projZ - b.projZ);

      // Draw Replication & Connection lines from Primary to Replicas
      const primaryNode = projectedNodes.find((n) => n.id === 'master')!;

      projectedNodes.forEach((node) => {
        if (node.id === 'master') return;

        const isHighlighted = activeTier === 'primary' || activeTier === node.tier;

        ctx.beginPath();
        ctx.moveTo(primaryNode.projX, primaryNode.projY);
        // Subtle curve
        const midX = (primaryNode.projX + node.projX) / 2;
        const midY = (primaryNode.projY + node.projY) / 2 - 10;
        ctx.quadraticCurveTo(midX, midY, node.projX, node.projY);
        ctx.strokeStyle = isHighlighted 
          ? (node.tier === 'replica' 
              ? (isDark ? 'rgba(62, 207, 142, 0.65)' : 'rgba(40, 110, 79, 0.45)') 
              : (isDark ? 'rgba(255, 90, 132, 0.6)' : 'rgba(139, 30, 63, 0.4)'))
          : (isDark ? 'rgba(45, 37, 42, 0.6)' : 'rgba(232, 221, 210, 0.35)');
        ctx.lineWidth = isHighlighted ? 1.5 : 0.8;
        ctx.stroke();
      });

      // Update and Draw Data Stream Particles
      particles.forEach((p) => {
        p.progress += p.speed;
        if (p.progress > 1) p.progress = 0;

        const targetNode = projectedNodes.find((n) => n.id === nodes[p.targetIndex].id);
        if (!targetNode || !primaryNode) return;

        const px = primaryNode.projX + (targetNode.projX - primaryNode.projX) * p.progress;
        const py = primaryNode.projY + (targetNode.projY - primaryNode.projY) * p.progress;

        ctx.beginPath();
        ctx.arc(px, py, 2 * primaryNode.fov, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Draw 3D Database Nodes
      projectedNodes.forEach((node) => {
        const isSelected = activeTier === node.tier;
        const radius = node.radius * node.fov;

        // Shadow under node on storage substrate
        const groundP = project(node.baseX, 45, node.baseZ, rotX, rotY, cx, cy);
        ctx.beginPath();
        ctx.ellipse(groundP.x, groundP.y, radius * 0.9, radius * 0.35, 0, 0, Math.PI * 2);
        ctx.fillStyle = isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(43, 29, 32, 0.06)';
        ctx.fill();

        // Dropline from node to substrate
        ctx.beginPath();
        ctx.moveTo(node.projX, node.projY);
        ctx.lineTo(groundP.x, groundP.y);
        ctx.strokeStyle = isSelected 
          ? (isDark ? 'rgba(255, 90, 132, 0.4)' : 'rgba(139, 30, 63, 0.25)') 
          : (isDark ? 'rgba(84, 28, 41, 0.3)' : 'rgba(232, 221, 210, 0.4)');
        ctx.lineWidth = 0.8;
        ctx.setLineDash([2, 2]);
        ctx.stroke();
        ctx.setLineDash([]);

        // Node Outer Glow (if active)
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(node.projX, node.projY, radius + 5, 0, Math.PI * 2);
          ctx.fillStyle = node.tier === 'primary' 
            ? (isDark ? 'rgba(255, 90, 132, 0.2)' : 'rgba(139, 30, 63, 0.12)') 
            : node.tier === 'replica' 
            ? (isDark ? 'rgba(62, 207, 142, 0.2)' : 'rgba(40, 110, 79, 0.12)') 
            : (isDark ? 'rgba(235, 160, 120, 0.2)' : 'rgba(214, 142, 109, 0.15)');
          ctx.fill();
        }

        // Node Body (Radial Shading)
        const grad = ctx.createRadialGradient(
          node.projX - radius * 0.3,
          node.projY - radius * 0.3,
          radius * 0.1,
          node.projX,
          node.projY,
          radius
        );

        if (isSelected) {
          grad.addColorStop(0, '#FFFFFF');
          grad.addColorStop(0.4, node.accentColor);
          grad.addColorStop(1, node.color);
        } else {
          grad.addColorStop(0, isDark ? '#3A2E33' : '#FFFFFF');
          grad.addColorStop(0.6, isDark ? '#231B1E' : '#F4EFEA');
          grad.addColorStop(1, isDark ? '#161214' : '#C2B3B5');
        }

        ctx.beginPath();
        ctx.arc(node.projX, node.projY, radius, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = isSelected ? node.color : (isDark ? '#3D3136' : '#E8DDD2');
        ctx.lineWidth = isSelected ? 1.5 : 1;
        ctx.stroke();

        // Node Label
        ctx.fillStyle = isSelected 
          ? (isDark ? '#F5EEF0' : '#2B1D20') 
          : (isDark ? '#B8A8AC' : '#685559');
        ctx.font = `${Math.max(9, Math.round(10 * node.fov))}px Outfit, sans-serif`;
        ctx.textAlign = 'center';
        ctx.fillText(node.label, node.projX, node.projY + radius + 11);
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // Random fluctuations in IOPS for live feel
    const metricInterval = setInterval(() => {
      setIops((prev) => Math.floor(1450 + Math.random() * 80));
      setConnections((prev) => Math.floor(36 + Math.random() * 8));
    }, 1800);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearInterval(metricInterval);
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [activeTier, isDark]);

  return (
    <div className={`relative w-full flex flex-col items-center select-none ${className || ''}`}>
      {/* 3D Canvas Viewport */}
      <div className="relative w-full h-[180px] sm:h-[195px] flex items-center justify-center cursor-grab active:cursor-grabbing">
        <canvas ref={canvasRef} className="w-full h-full block" />

        {/* Orbit Drag Helper Badge */}
        <div className="pointer-events-none absolute top-2 right-2 px-2 py-0.5 rounded-md bg-[#FAF7F2] border border-[#E8DDD2] text-[9px] font-mono text-[#9B888C] shadow-2xs">
          Interactive 3D Cluster
        </div>
      </div>

      {/* Interactive Cluster Tier Switcher */}
      <div className="w-full grid grid-cols-3 gap-2 mt-1 px-1">
        {(['primary', 'replica', 'analytics'] as const).map((t) => (
          <button
            key={t}
            onClick={() => handleSelectTier(t)}
            className={`p-2.5 rounded-xl border text-left transition-all ${
              activeTier === t
                ? 'border-[#8B1E3F]/50 bg-[#FAF7F2] shadow-xs ring-1 ring-[#8B1E3F]/30'
                : 'border-[#E8DDD2] bg-[#FFFDF9] hover:bg-[#FAF7F2] hover:-translate-y-0.5 hover:shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold capitalize text-[#2B1D20]">{t}</span>
              {activeTier === t && (
                <Check className="w-3 h-3 text-[#8B1E3F]" />
              )}
            </div>
            <div className="text-[9px] text-[#685559] mt-0.5 truncate">
              {t === 'primary' ? 'Read/Write Master' : t === 'replica' ? 'Global Read Mesh' : 'Columnar Shard'}
            </div>
          </button>
        ))}
      </div>

      {/* Realtime Engine Telemetry */}
      <div className="w-full mt-3 p-2.5 rounded-xl bg-[#FAF7F2] border border-[#E8DDD2] flex items-center justify-between text-xs shadow-2xs">
        <div className="flex items-center gap-1.5 text-[11px] text-[#685559]">
          <span className="font-semibold text-[#2B1D20]">{iops.toLocaleString()} IOPS</span>
          <span>•</span>
          <span>{connections} Pool Conns</span>
        </div>
        <div className="text-[11px] font-semibold text-[#286E4F] flex items-center gap-1">
          <span>{cacheHit}% Buffer Hit</span>
        </div>
      </div>
    </div>
  );
};
