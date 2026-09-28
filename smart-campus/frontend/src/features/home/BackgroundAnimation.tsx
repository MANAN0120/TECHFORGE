import React, { useEffect, useRef } from 'react';

interface PinNode {
  id: string;
  name: string;
  relX: number;
  relY: number;
}

interface GraphEdge {
  from: string;
  to: string;
  dist: number;
}

const PIN_NODES: PinNode[] = [
  { id: 'gate1', name: 'Main Gate 1', relX: 0.12, relY: 0.28 },
  { id: 'blockA', name: 'A Block Admin', relX: 0.28, relY: 0.22 },
  { id: 'blockA1', name: 'A1 CSE Block', relX: 0.44, relY: 0.18 },
  { id: 'blockA2', name: 'A2 ECE Block', relX: 0.65, relY: 0.24 },
  { id: 'cafe', name: 'Central Cafe', relX: 0.36, relY: 0.45 },
  { id: 'plaza', name: 'Student Plaza', relX: 0.54, relY: 0.48 },
  { id: 'blockD6', name: 'D6 Academic', relX: 0.74, relY: 0.42 },
  { id: 'library', name: 'Central Library', relX: 0.24, relY: 0.68 },
  { id: 'sports', name: 'Sports Complex', relX: 0.48, relY: 0.75 },
  { id: 'medical', name: 'Health Centre', relX: 0.7, relY: 0.72 },
  { id: 'hostel', name: 'Hostel Block 3', relX: 0.86, relY: 0.65 },
  { id: 'gate2', name: 'Gate 2 Plaza', relX: 0.88, relY: 0.32 },
];

const CONNECTIONS: [string, string][] = [
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

    const getPinPos = (id: string) => {
      const pin = PIN_NODES.find((p) => p.id === id)!;
      return { x: pin.relX * width, y: pin.relY * height };
    };

    // Calculate Dijkstra shortest path between two pins
    const computePath = (startId: string, targetId: string): string[] => {
      const distances: Record<string, number> = {};
      const previous: Record<string, string | null> = {};
      const unvisited = new Set<string>();

      PIN_NODES.forEach((n) => {
        distances[n.id] = Infinity;
        previous[n.id] = null;
        unvisited.add(n.id);
      });

      distances[startId] = 0;

      while (unvisited.size > 0) {
        let current: string | null = null;
        let minDist = Infinity;

        unvisited.forEach((nId) => {
          if (distances[nId] < minDist) {
            minDist = distances[nId];
            current = nId;
          }
        });

        if (!current || minDist === Infinity || current === targetId) break;
        unvisited.delete(current);

        const neighbors = CONNECTIONS.filter(([a, b]) => a === current || b === current).map(
          ([a, b]) => (a === current ? b : a)
        );

        for (const nbr of neighbors) {
          if (!unvisited.has(nbr)) continue;
          const p1 = getPinPos(current);
          const p2 = getPinPos(nbr);
          const edgeDist = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
          const alt = distances[current] + edgeDist;
          if (alt < distances[nbr]) {
            distances[nbr] = alt;
            previous[nbr] = current;
          }
        }
      }

      const path: string[] = [];
      let curr: string | null = targetId;
      while (curr) {
        path.unshift(curr);
        curr = previous[curr];
      }
      return path[0] === startId ? path : [];
    };

    // State for path drawing simulation
    let originIndex = 0;
    let targetIndex = 7;
    let currentPath = computePath(PIN_NODES[originIndex].id, PIN_NODES[targetIndex].id);

    let pathCrawlProgress = 0; // 0 to (path.length - 1)
    let holdTimer = 0;
    let pulseTimer = 0;

    const selectNextRoute = () => {
      originIndex = targetIndex;
      do {
        targetIndex = Math.floor(Math.random() * PIN_NODES.length);
      } while (targetIndex === originIndex);

      currentPath = computePath(PIN_NODES[originIndex].id, PIN_NODES[targetIndex].id);
      pathCrawlProgress = 0;
      holdTimer = 0;
    };

    // Helper: Draw Map Pin Marker 📍
    const drawMapPin = (
      x: number,
      y: number,
      label: string,
      pinState: 'origin' | 'target' | 'active' | 'idle'
    ) => {
      ctx.save();

      const pinColor =
        pinState === 'origin'
          ? '#FBBF24' // Amber Gold
          : pinState === 'target'
          ? '#F87171' // Red Target
          : pinState === 'active'
          ? '#A3E635' // Lime Active Path
          : '#3F3F46'; // Dark Idle

      const pinSize = pinState === 'origin' || pinState === 'target' ? 14 : 11;

      // Outer Glow
      if (pinState !== 'idle') {
        ctx.shadowBlur = 12;
        ctx.shadowColor = pinColor;
      }

      // Draw Teardrop Pin Shape
      ctx.beginPath();
      ctx.arc(x, y - pinSize, pinSize * 0.75, Math.PI * 0.75, Math.PI * 2.25, false);
      ctx.lineTo(x, y);
      ctx.closePath();
      ctx.fillStyle = pinColor;
      ctx.fill();

      // Pin Border
      ctx.strokeStyle = '#09090B';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner Center Circle
      ctx.beginPath();
      ctx.arc(x, y - pinSize, pinSize * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = pinState === 'idle' ? '#18181B' : '#09090B';
      ctx.fill();

      ctx.shadowBlur = 0; // reset

      // Label Box
      ctx.font = '600 11px Outfit, sans-serif';
      const textWidth = ctx.measureText(label).width;
      const boxWidth = textWidth + 12;
      const boxHeight = 18;
      const boxX = x - boxWidth / 2;
      const boxY = y + 4;

      // Pill background
      ctx.beginPath();
      ctx.roundRect(boxX, boxY, boxWidth, boxHeight, 6);
      ctx.fillStyle = pinState !== 'idle' ? 'rgba(24, 24, 27, 0.95)' : 'rgba(18, 18, 22, 0.7)';
      ctx.fill();
      ctx.strokeStyle = pinState !== 'idle' ? pinColor : 'rgba(63, 63, 70, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Label text
      ctx.fillStyle = pinState === 'origin' ? '#FBBF24' : pinState === 'target' ? '#F87171' : pinState === 'active' ? '#A3E635' : '#A1A1AA';
      ctx.textAlign = 'center';
      ctx.fillText(label, x, boxY + 13);

      ctx.restore();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      pulseTimer += 0.016;

      // 1. Draw Faint Background Route Network Lines
      CONNECTIONS.forEach(([aId, bId]) => {
        const p1 = getPinPos(aId);
        const p2 = getPinPos(bId);
        ctx.beginPath();
        ctx.moveTo(p1.x, p1.y);
        ctx.lineTo(p2.x, p2.y);
        ctx.strokeStyle = 'rgba(63, 63, 70, 0.3)';
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });

      // 2. Update Path Line Crawl Speed
      const totalSegments = Math.max(1, currentPath.length - 1);
      if (pathCrawlProgress < totalSegments) {
        pathCrawlProgress += 0.015; // Speed of line finding its way
        if (pathCrawlProgress >= totalSegments) {
          pathCrawlProgress = totalSegments;
        }
      } else {
        holdTimer += 0.016;
        if (holdTimer > 3.5) {
          selectNextRoute();
        }
      }

      // 3. Draw The Growing Neon Path Line (Line Finding its Way)
      if (currentPath.length > 1) {
        const fullPassedSegments = Math.floor(pathCrawlProgress);
        const partialProgress = pathCrawlProgress - fullPassedSegments;

        ctx.save();
        ctx.shadowBlur = 16;
        ctx.shadowColor = '#A3E635';

        ctx.beginPath();
        const pStart = getPinPos(currentPath[0]);
        ctx.moveTo(pStart.x, pStart.y);

        // Draw fully passed segments
        for (let i = 1; i <= fullPassedSegments && i < currentPath.length; i++) {
          const pt = getPinPos(currentPath[i]);
          ctx.lineTo(pt.x, pt.y);
        }

        // Draw active crawling segment tip
        if (fullPassedSegments < totalSegments) {
          const pA = getPinPos(currentPath[fullPassedSegments]);
          const pB = getPinPos(currentPath[fullPassedSegments + 1]);

          const tipX = pA.x + (pB.x - pA.x) * partialProgress;
          const tipY = pA.y + (pB.y - pA.y) * partialProgress;

          ctx.lineTo(tipX, tipY);

          // Draw Glowing Leading Spark Particle at line tip
          ctx.restore();
          ctx.save();
          ctx.shadowBlur = 20;
          ctx.shadowColor = '#A3E635';

          ctx.beginPath();
          ctx.arc(tipX, tipY, 7, 0, Math.PI * 2);
          ctx.fillStyle = '#FFFFFF';
          ctx.fill();

          ctx.beginPath();
          ctx.arc(tipX, tipY, 14, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(163, 230, 53, 0.45)';
          ctx.fill();
        }

        ctx.strokeStyle = '#A3E635';
        ctx.lineWidth = 3.5;
        ctx.stroke();
        ctx.restore();

        // 4. Draw Faint Secondary Probe Lines (Dijkstra Branch Search Effect)
        if (fullPassedSegments < totalSegments) {
          const currentPinId = currentPath[fullPassedSegments];
          const curPos = getPinPos(currentPinId);
          const neighbors = CONNECTIONS.filter(([a, b]) => a === currentPinId || b === currentPinId).map(
            ([a, b]) => (a === currentPinId ? b : a)
          );

          neighbors.forEach((nbrId) => {
            if (nbrId !== currentPath[fullPassedSegments + 1]) {
              const nbrPos = getPinPos(nbrId);
              const probeLength = Math.sin(pulseTimer * 8) * 0.4 + 0.4;
              const px = curPos.x + (nbrPos.x - curPos.x) * probeLength;
              const py = curPos.y + (nbrPos.y - curPos.y) * probeLength;

              ctx.beginPath();
              ctx.moveTo(curPos.x, curPos.y);
              ctx.lineTo(px, py);
              ctx.strokeStyle = 'rgba(251, 191, 36, 0.5)';
              ctx.lineWidth = 1.5;
              ctx.setLineDash([3, 3]);
              ctx.stroke();
              ctx.setLineDash([]);
            }
          });
        }
      }

      // 5. Render All Map Pins 📍
      PIN_NODES.forEach((node) => {
        const pos = getPinPos(node.id);
        const isOrigin = node.id === PIN_NODES[originIndex].id;
        const isTarget = node.id === PIN_NODES[targetIndex].id;

        // Check if path has reached this node
        const nodePathIndex = currentPath.indexOf(node.id);
        const isReached = nodePathIndex !== -1 && nodePathIndex <= Math.floor(pathCrawlProgress);

        let pinState: 'origin' | 'target' | 'active' | 'idle' = 'idle';
        if (isOrigin) pinState = 'origin';
        else if (isTarget) pinState = 'target';
        else if (isReached) pinState = 'active';

        drawMapPin(pos.x, pos.y, node.name, pinState);
      });

      // 6. Live Pathfinding Status Banner Overlay (Bottom Left)
      ctx.save();
      const originName = PIN_NODES[originIndex].name;
      const targetName = PIN_NODES[targetIndex].name;
      const isComplete = pathCrawlProgress >= totalSegments;

      const statusMsg = isComplete
        ? `📍 Route Found: ${originName} ➔ ${targetName} (Complete)`
        : `⚡ Pathfinding... ${originName} ➔ ${targetName}`;

      ctx.font = '600 12px Outfit, sans-serif';
      ctx.fillStyle = isComplete ? '#A3E635' : '#FBBF24';
      ctx.textAlign = 'left';
      ctx.fillText(statusMsg, 24, height - 28);
      ctx.restore();

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
      {/* Map Pin Pathfinding Crawl Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block opacity-90" />

      {/* Blueprint Grid Mesh */}
      <svg
        className="absolute inset-0 w-full h-full opacity-10 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="pin-blueprint-grid"
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
        <rect width="100%" height="100%" fill="url(#pin-blueprint-grid)" />
      </svg>

      {/* Soft Ambient Light Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#A3E635]/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[500px] bg-red-500/10 rounded-full blur-[140px] pointer-events-none animate-pulse" />
    </div>
  );
};
