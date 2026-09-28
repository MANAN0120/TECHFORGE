import React, { useEffect, useRef } from 'react';

interface Node {
  id: string;
  name: string;
  relX: number;
  relY: number;
}

interface Edge {
  from: string;
  to: string;
  dist: number;
}

const NODES: Node[] = [
  { id: 'gate1', name: 'Main Gate 1', relX: 0.12, relY: 0.25 },
  { id: 'blockA', name: 'A Block Admin', relX: 0.28, relY: 0.2 },
  { id: 'blockA1', name: 'A1 CSE Block', relX: 0.42, relY: 0.15 },
  { id: 'blockA2', name: 'A2 ECE Block', relX: 0.62, relY: 0.22 },
  { id: 'cafe', name: 'Central Cafe', relX: 0.35, relY: 0.42 },
  { id: 'plaza', name: 'Student Plaza', relX: 0.52, relY: 0.45 },
  { id: 'blockD6', name: 'D6 Academic', relX: 0.72, relY: 0.4 },
  { id: 'library', name: 'Central Library', relX: 0.25, relY: 0.68 },
  { id: 'sports', name: 'Sports Complex', relX: 0.48, relY: 0.72 },
  { id: 'medical', name: 'Health Centre', relX: 0.68, relY: 0.68 },
  { id: 'hostel', name: 'Hostel Block 3', relX: 0.85, relY: 0.62 },
  { id: 'gate2', name: 'Gate 2 Plaza', relX: 0.88, relY: 0.3 },
];

const RAW_CONNECTIONS: [string, string][] = [
  ['gate1', 'blockA'],
  ['blockA', 'blockA1'],
  ['blockA', 'cafe'],
  ['blockA1', 'blockA2'],
  ['blockA1', 'plaza'],
  ['blockA2', 'blockD6'],
  ['blockA2', 'gate2'],
  ['cafe', 'plaza'],
  ['cafe', 'library'],
  ['plaza', 'blockD6'],
  ['plaza', 'sports'],
  ['blockD6', 'medical'],
  ['blockD6', 'gate2'],
  ['library', 'sports'],
  ['sports', 'medical'],
  ['medical', 'hostel'],
  ['gate2', 'hostel'],
];

export const BackgroundAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Build graph edges with real distances
    const edges: Edge[] = RAW_CONNECTIONS.map(([fId, tId]) => {
      const n1 = NODES.find((n) => n.id === fId)!;
      const n2 = NODES.find((n) => n.id === tId)!;
      const dx = (n1.relX - n2.relX) * width;
      const dy = (n1.relY - n2.relY) * height;
      return { from: fId, to: tId, dist: Math.sqrt(dx * dx + dy * dy) };
    });

    // Dijkstra Algorithm Helper
    const runDijkstra = (startId: string, endId: string): { path: string[]; exploredEdges: [string, string][] } => {
      const distances: Record<string, number> = {};
      const previous: Record<string, string | null> = {};
      const unvisited = new Set<string>();
      const exploredEdges: [string, string][] = [];

      NODES.forEach((n) => {
        distances[n.id] = Infinity;
        previous[n.id] = null;
        unvisited.add(n.id);
      });

      distances[startId] = 0;

      while (unvisited.size > 0) {
        let current: string | null = null;
        let minDistance = Infinity;

        unvisited.forEach((nId) => {
          if (distances[nId] < minDistance) {
            minDistance = distances[nId];
            current = nId;
          }
        });

        if (!current || minDistance === Infinity || current === endId) break;

        unvisited.delete(current);

        // Find neighbors
        const neighborEdges = edges.filter((e) => e.from === current || e.to === current);
        for (const edge of neighborEdges) {
          const neighborId = edge.from === current ? edge.to : edge.from;
          if (!unvisited.has(neighborId)) continue;

          exploredEdges.push([current, neighborId]);
          const alt = distances[current] + edge.dist;
          if (alt < distances[neighborId]) {
            distances[neighborId] = alt;
            previous[neighborId] = current;
          }
        }
      }

      const path: string[] = [];
      let curr: string | null = endId;
      while (curr) {
        path.unshift(curr);
        curr = previous[curr];
      }

      return { path: path[0] === startId ? path : [], exploredEdges };
    };

    // Simulation Cycle State
    let startIdx = 0;
    let endIdx = 6;
    let simulationState = runDijkstra(NODES[startIdx].id, NODES[endIdx].id);

    let phase: 'SEARCHING' | 'FOUND_PATH' | 'HOLD' = 'SEARCHING';
    let phaseProgress = 0; // 0 to 1
    let beamParticleProgress = 0; // 0 to 1 along path
    let cycleTimer = 0;

    const selectNewRoute = () => {
      startIdx = Math.floor(Math.random() * NODES.length);
      do {
        endIdx = Math.floor(Math.random() * NODES.length);
      } while (endIdx === startIdx);

      simulationState = runDijkstra(NODES[startIdx].id, NODES[endIdx].id);
      phase = 'SEARCHING';
      phaseProgress = 0;
      beamParticleProgress = 0;
      cycleTimer = 0;
    };

    const getNodePos = (nodeId: string) => {
      const n = NODES.find((node) => node.id === nodeId)!;
      return { x: n.relX * width, y: n.relY * height };
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      cycleTimer += 0.016;

      // Update Phase State Machine
      if (phase === 'SEARCHING') {
        phaseProgress += 0.012; // Search wave expansion
        if (phaseProgress >= 1) {
          phase = 'FOUND_PATH';
          phaseProgress = 0;
        }
      } else if (phase === 'FOUND_PATH') {
        phaseProgress += 0.02; // Path beam illumination
        beamParticleProgress = (beamParticleProgress + 0.015) % 1;
        if (phaseProgress >= 1) {
          phase = 'HOLD';
          phaseProgress = 0;
        }
      } else if (phase === 'HOLD') {
        beamParticleProgress = (beamParticleProgress + 0.015) % 1;
        if (cycleTimer > 6.5) {
          selectNewRoute();
        }
      }

      const originNode = NODES[startIdx];
      const targetNode = NODES[endIdx];
      const originPos = getNodePos(originNode.id);
      const targetPos = getNodePos(targetNode.id);

      // 1. Draw All Graph Base Edges
      edges.forEach((edge) => {
        const p1 = getNodePos(edge.from);
        const p2 = getNodePos(edge.to);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = 'rgba(63, 63, 70, 0.4)';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // 2. Draw Dijkstra Frontier Exploration Lines (Cyan / Yellow waves)
      if (phase === 'SEARCHING') {
        const visibleExploredCount = Math.floor(simulationState.exploredEdges.length * phaseProgress);
        for (let i = 0; i < visibleExploredCount; i++) {
          const [fId, tId] = simulationState.exploredEdges[i];
          const p1 = getNodePos(fId);
          const p2 = getNodePos(tId);
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)'; // Cyan exploration
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Expanding search wave circle from origin
        const maxWaveRadius = Math.max(width, height) * 0.4 * phaseProgress;
        ctx.beginPath();
        ctx.arc(originPos.x, originPos.y, maxWaveRadius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(163, 230, 53, ${0.4 * (1 - phaseProgress)})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 3. Draw Shortest Path Beam (Bright Lime Laser #A3E635)
      const path = simulationState.path;
      if ((phase === 'FOUND_PATH' || phase === 'HOLD') && path.length > 1) {
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#A3E635';

        ctx.beginPath();
        const p0 = getNodePos(path[0]);
        ctx.moveTo(p0.x, p0.y);

        const visibleSegments = phase === 'HOLD' ? path.length - 1 : Math.ceil((path.length - 1) * phaseProgress);

        for (let i = 1; i <= visibleSegments && i < path.length; i++) {
          const pt = getNodePos(path[i]);
          ctx.lineTo(pt.x, pt.y);
        }

        ctx.strokeStyle = '#A3E635';
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.shadowBlur = 0; // reset glow

        // 4. Draw Animated Traveling Photon / Laser Particle along Shortest Path
        if (path.length > 1) {
          const totalPathLength = path.length - 1;
          const currentSegmentIndex = Math.min(
            totalPathLength - 1,
            Math.floor(beamParticleProgress * totalPathLength)
          );
          const segmentProgress = (beamParticleProgress * totalPathLength) % 1;

          const nA = getNodePos(path[currentSegmentIndex]);
          const nB = getNodePos(path[currentSegmentIndex + 1]);

          const particleX = nA.x + (nB.x - nA.x) * segmentProgress;
          const particleY = nA.y + (nB.y - nA.y) * segmentProgress;

          // Glowing laser head
          ctx.shadowBlur = 18;
          ctx.shadowColor = '#A3E635';
          ctx.beginPath();
          ctx.arc(particleX, particleY, 6, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(particleX, particleY, 12, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(163, 230, 53, 0.4)';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // 5. Draw All Graph Nodes & Labels
      NODES.forEach((node) => {
        const pos = getNodePos(node.id);
        const isOrigin = node.id === originNode.id;
        const isTarget = node.id === targetNode.id;
        const isInPath = path.includes(node.id) && (phase === 'FOUND_PATH' || phase === 'HOLD');

        if (isOrigin) {
          // Origin Node Pulse
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#FBBF24';
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 9, 0, Math.PI * 2);
          ctx.fillStyle = '#FBBF24';
          ctx.fill();
          ctx.shadowBlur = 0;

          // Ripple Ring
          const rippleR = 9 + (Math.sin(cycleTimer * 6) + 1) * 6;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, rippleR, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (isTarget) {
          // Target Node Pulse
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#A3E635';
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 9, 0, Math.PI * 2);
          ctx.fillStyle = '#A3E635';
          ctx.fill();
          ctx.shadowBlur = 0;

          // Target Pin Ring
          const rippleR = 9 + (Math.cos(cycleTimer * 6) + 1) * 6;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, rippleR, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(163, 230, 53, 0.7)';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else if (isInPath) {
          // Path Node
          ctx.shadowBlur = 10;
          ctx.shadowColor = '#A3E635';
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
          ctx.fillStyle = '#A3E635';
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          // Regular Node
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(161, 161, 170, 0.6)';
          ctx.fill();
        }

        // Node Label Text
        ctx.font = '500 11px Inter, sans-serif';
        ctx.fillStyle = isOrigin
          ? '#FBBF24'
          : isTarget
          ? '#A3E635'
          : isInPath
          ? '#FAFAFA'
          : 'rgba(161, 161, 170, 0.7)';
        ctx.fillText(node.name, pos.x + 10, pos.y + 4);
      });

      // 6. Dijkstra Simulation Status Overlay (Top Left Pill)
      ctx.font = '600 11px Outfit, sans-serif';
      ctx.fillStyle = '#A3E635';
      const statusText = `[Dijkstra Engine] Calculating path: ${originNode.name} ➔ ${targetNode.name}`;
      ctx.fillText(statusText, 24, height - 30);

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Dynamic Dijkstra Pathfinding Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block opacity-85" />

      {/* Subtle Background Grid Mesh */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="dijkstra-grid-mesh"
            width="60"
            height="60"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 60 0 L 0 0 0 60"
              fill="none"
              stroke="#3F3F46"
              strokeWidth="0.8"
              strokeDasharray="2 4"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#dijkstra-grid-mesh)" />
      </svg>

      {/* Soft Ambient Light Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#A3E635]/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
    </div>
  );
};
