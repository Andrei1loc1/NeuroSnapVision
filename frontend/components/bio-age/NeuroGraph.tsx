"use client";

import { useState } from "react";

interface NeuroGraphProps {
  dimensions: { name: string; score: number; color: string }[];
  connections: { from: string; to: string }[];
}

const HEX_POSITIONS = [
  { x: 50, y: 8 },
  { x: 93, y: 33 },
  { x: 93, y: 83 },
  { x: 50, y: 100 },
  { x: 7, y: 83 },
  { x: 7, y: 33 },
];

export default function NeuroGraph({ dimensions, connections }: NeuroGraphProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  const nodes = dimensions.slice(0, 6).map((dim, i) => ({
    ...dim,
    x: HEX_POSITIONS[i].x,
    y: HEX_POSITIONS[i].y,
  }));

  const activeConnections = hovered
    ? connections.filter((c) => c.from === hovered || c.to === hovered)
    : connections;

  return (
    <div className="mx-6 mt-4 rounded-[28px] border border-white bg-white/20 p-5 shadow-[0_20px_60px_rgba(20,83,45,0.08)] backdrop-blur-xl">
      <p className="mb-3 text-sm font-semibold text-zinc-600">
        Harta Influenței Dimensiunilor
      </p>

      <svg
        viewBox="0 0 100 108"
        className="mx-auto w-full max-w-[280px]"
        style={{ overflow: "visible" }}
      >
        {activeConnections.map((conn) => {
          const fromNode = nodes.find((n) => n.name === conn.from);
          const toNode = nodes.find((n) => n.name === conn.to);
          if (!fromNode || !toNode) return null;

          const isActive =
            hovered === null ||
            hovered === conn.from ||
            hovered === conn.to;

          return (
            <line
              key={`${conn.from}-${conn.to}`}
              x1={fromNode.x}
              y1={fromNode.y}
              x2={toNode.x}
              y2={toNode.y}
              stroke={isActive ? "#22c55e" : "#d1d5db"}
              strokeWidth={isActive ? 1.5 : 0.5}
              strokeOpacity={isActive ? 0.6 : 0.3}
              style={{ transition: "all 0.3s ease" }}
            />
          );
        })}

        {nodes.map((node) => {
          const isHovered = hovered === node.name;
          const isConnected =
            hovered !== null &&
            connections.some(
              (c) =>
                (c.from === hovered && c.to === node.name) ||
                (c.to === hovered && c.from === node.name)
            );
          const dimmed = hovered !== null && !isHovered && !isConnected;

          return (
            <g
              key={node.name}
              onMouseEnter={() => setHovered(node.name)}
              onMouseLeave={() => setHovered(null)}
              style={{ cursor: "pointer", transition: "opacity 0.3s ease" }}
              opacity={dimmed ? 0.4 : 1}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={isHovered ? 10 : 8}
                fill={isHovered ? node.color : "white"}
                stroke={node.color}
                strokeWidth={2}
                style={{ transition: "all 0.3s ease" }}
              />
              <text
                x={node.x}
                y={node.y - (isHovered ? 14 : 12)}
                textAnchor="middle"
                className="text-[5px] font-semibold"
                fill="#374151"
              >
                {node.name}
              </text>
              <text
                x={node.x}
                y={node.y + 2.5}
                textAnchor="middle"
                className="text-[5px] font-bold"
                fill={isHovered ? "white" : node.color}
              >
                {node.score}
              </text>
            </g>
          );
        })}
      </svg>

      <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1">
        {nodes.map((node) => (
          <button
            key={node.name}
            onMouseEnter={() => setHovered(node.name)}
            onMouseLeave={() => setHovered(null)}
            className="flex items-center gap-1 text-[10px] font-medium text-zinc-700 transition-colors hover:text-zinc-900"
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{ backgroundColor: node.color }}
            />
            {node.name}
          </button>
        ))}
      </div>
    </div>
  );
}