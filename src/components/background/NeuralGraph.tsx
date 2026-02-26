/**
 * NeuralGraph — Bio-inspired canvas background animation
 * Ported from lordeassan.github.io graph.js
 * 
 * Features:
 * - 50 floating nodes with edges drawn when close
 * - Mouse repulsion effect
 * - Theme-reactive (reads CSS custom properties)
 * - Respects prefers-reduced-motion
 */
import { useEffect, useRef, useCallback } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
}

const NODE_COUNT = 50;
const EDGE_THRESHOLD = 140;
const MOUSE_RADIUS = 180;
const MOUSE_REPULSION = 0.8;
const BASE_SPEED = 0.3;

export function NeuralGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const nodesRef = useRef<Node[]>([]);
  const mouseRef = useRef<{ x: number; y: number } | null>(null);
  const rafRef = useRef<number>(0);

  const isDark = useCallback(() => {
    return document.documentElement.classList.contains('dark');
  }, []);

  const getColors = useCallback(() => {
    if (isDark()) {
      return {
        node: 'rgba(0, 255, 198, 0.5)',
        edge: 'rgba(0, 255, 198, ',
        nodeFill: 'rgba(0, 255, 198, 0.15)',
      };
    }
    return {
      node: 'rgba(111, 66, 193, 0.4)',
      edge: 'rgba(111, 66, 193, ',
      nodeFill: 'rgba(111, 66, 193, 0.1)',
    };
  }, [isDark]);

  const initNodes = useCallback((w: number, h: number) => {
    const nodes: Node[] = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * BASE_SPEED * 2,
        vy: (Math.random() - 0.5) * BASE_SPEED * 2,
        radius: Math.random() * 2 + 1,
      });
    }
    return nodes;
  }, []);

  useEffect(() => {
    // Respect prefers-reduced-motion
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (motionQuery.matches) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (nodesRef.current.length === 0) {
        nodesRef.current = initNodes(canvas.width, canvas.height);
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleMouseLeave = () => {
      mouseRef.current = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const animate = () => {
      const w = canvas.width;
      const h = canvas.height;
      const nodes = nodesRef.current;
      const mouse = mouseRef.current;
      const colors = getColors();

      ctx.clearRect(0, 0, w, h);

      // Update positions
      for (const node of nodes) {
        // Mouse repulsion
        if (mouse) {
          const dx = node.x - mouse.x;
          const dy = node.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < MOUSE_RADIUS && dist > 0) {
            const force = (MOUSE_RADIUS - dist) / MOUSE_RADIUS * MOUSE_REPULSION;
            node.vx += (dx / dist) * force;
            node.vy += (dy / dist) * force;
          }
        }

        // Damping
        node.vx *= 0.99;
        node.vy *= 0.99;

        // Ensure minimum speed
        const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
        if (speed < BASE_SPEED * 0.5) {
          const angle = Math.atan2(node.vy, node.vx);
          node.vx = Math.cos(angle) * BASE_SPEED * 0.5;
          node.vy = Math.sin(angle) * BASE_SPEED * 0.5;
        }

        node.x += node.vx;
        node.y += node.vy;

        // Wrap around edges
        if (node.x < -10) node.x = w + 10;
        if (node.x > w + 10) node.x = -10;
        if (node.y < -10) node.y = h + 10;
        if (node.y > h + 10) node.y = -10;
      }

      // Draw edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < EDGE_THRESHOLD) {
            const alpha = (1 - dist / EDGE_THRESHOLD) * 0.3;
            ctx.beginPath();
            ctx.strokeStyle = colors.edge + alpha.toFixed(3) + ')';
            ctx.lineWidth = 0.5;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const node of nodes) {
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = colors.nodeFill;
        ctx.fill();
        ctx.strokeStyle = colors.node;
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // Draw mouse highlight
      if (mouse) {
        const gradient = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, MOUSE_RADIUS * 0.5,
        );
        gradient.addColorStop(0, isDark() ? 'rgba(0,255,198,0.04)' : 'rgba(111,66,193,0.03)');
        gradient.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, MOUSE_RADIUS * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [initNodes, getColors, isDark]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
