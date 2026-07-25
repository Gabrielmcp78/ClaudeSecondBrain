/**
 * NetworkGraph — D3 force-directed knowledge graph
 *
 * Nodes are derived from connection endpoints. Domain colors are drawn
 * from DOMAIN_COLORS in types.ts.
 *
 * ARCHITECTURE NOTE (fixes "zoom snaps back" / "blank on load" / "black
 * label text"):
 *
 * v1 had one big useEffect keyed on every piece of state (dims, filters,
 * selection) that tore down and rebuilt the whole SVG + simulation + zoom
 * on ANY change and reset the zoom transform to identity every time —
 * pan/zoom got wiped on every click.
 *
 * v2 split that into BUILD / RESIZE / STYLE effects, but had two new
 * bugs: (a) freshly-built node/link elements got their colors ONLY from
 * the separate STYLE effect, which doesn't rerun when BUILD reruns for
 * an unrelated reason (e.g. `connections` gets a new array reference on
 * every data refresh) — so a rebuild could leave labels with browser-default
 * black fill, which combined with the dark outline stroke rendered as
 * solid black blobs; (b) the `<svg>` was only mounted after the container
 * was measured, so if that measurement raced layout, nothing rendered at
 * all until something else forced a reflow.
 *
 * This version fixes both: every element gets its full baseline styling
 * at creation time in BUILD (not deferred to STYLE — STYLE only applies
 * the selection-dependent deltas on top, so a rebuild is never visually
 * broken even for a frame), and the `<svg>` always mounts immediately
 * using a safe fallback size (800×600) that gets corrected to the real
 * measured size a moment later via the RESIZE effect — never omitted,
 * never blank.
 */

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { ZoomIn, ZoomOut, RotateCcw, Search, X, Maximize2 } from 'lucide-react';
import type { Connection } from '../types';
import { DOMAIN_COLORS } from '../types';

interface SimNode extends d3.SimulationNodeDatum {
  id: string;
  label: string;
  domain: string;
  hasArticle: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
  source: SimNode | string;
  target: SimNode | string;
  description: string;
  idx: number;
}

interface Props {
  connections: Connection[];
  selectedNodeId: string | null;
  onSelectNode: (id: string | null) => void;
  selectedConnectionIdx: number | null;
  onSelectConnection: (idx: number | null) => void;
  onOpenArticle: (path: string) => void;
}

function domainFromId(id: string): string {
  const parts = id.split(/[/\\]/);
  return parts[0] || 'unknown';
}

const FALLBACK_DIMS = { width: 800, height: 600 };

// Build deduplicated node list from connection endpoints. `hasArticle`
// marks nodes that resolve to a real wiki file.
function buildNodes(connections: Connection[]): SimNode[] {
  const nodeMap = new Map<string, SimNode>();
  connections.forEach(c => {
    if (!nodeMap.has(c.source)) {
      nodeMap.set(c.source, {
        id: c.source,
        label: c.source.split('/').pop() ?? c.source,
        domain: c.sourceDomain || domainFromId(c.source),
        hasArticle: Boolean(c.sourcePath),
        x: 0, y: 0, vx: 0, vy: 0,
      });
    } else if (c.sourcePath) {
      nodeMap.get(c.source)!.hasArticle = true;
    }
    if (!nodeMap.has(c.target)) {
      nodeMap.set(c.target, {
        id: c.target,
        label: c.target.split('/').pop() ?? c.target,
        domain: c.targetDomain || domainFromId(c.target),
        hasArticle: Boolean(c.targetPath),
        x: 0, y: 0, vx: 0, vy: 0,
      });
    } else if (c.targetPath) {
      nodeMap.get(c.target)!.hasArticle = true;
    }
  });
  return Array.from(nodeMap.values());
}

function articlePathForNode(id: string, connections: Connection[]): string | null {
  return connections.find(c => c.source === id)?.sourcePath
    ?? connections.find(c => c.target === id)?.targetPath
    ?? null;
}

export default function NetworkGraph({
  connections,
  selectedNodeId,
  onSelectNode,
  selectedConnectionIdx,
  onSelectConnection,
  onOpenArticle,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const transformRef = useRef<d3.ZoomTransform>(d3.zoomIdentity);
  const simRef = useRef<d3.Simulation<SimNode, undefined> | null>(null);
  const nodeSelRef = useRef<d3.Selection<SVGGElement, SimNode, SVGGElement, unknown> | null>(null);
  const linkSelRef = useRef<d3.Selection<SVGLineElement, SimLink, SVGGElement, unknown> | null>(null);
  const filteredLinksRef = useRef<SimLink[]>([]);

  // Always a valid size — starts at a safe fallback so the <svg> renders
  // immediately on first paint (never blank, never conditionally
  // unmounted), then gets corrected to the real measured size a moment
  // later by the RESIZE effect below.
  const [dims, setDims] = useState(FALLBACK_DIMS);
  const [search, setSearch] = useState('');
  const [activeDomain, setActiveDomain] = useState<string | null>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      setDims({ width: rect.width, height: rect.height });
    }
    const ro = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      if (width > 0 && height > 0) setDims({ width, height });
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const allDomains = Array.from(
    new Set(connections.flatMap(c => [c.sourceDomain, c.targetDomain]))
  ).filter(Boolean);

  const dimsRef = useRef(dims);
  useEffect(() => { dimsRef.current = dims; }, [dims]);

  // ── 1. BUILD — data/filter changes. Rebuilds nodes/links/simulation,
  //    preserving prior node positions and zoom transform. Every element
  //    gets FULL baseline styling here at creation — colors are never
  //    left to default (black) waiting for a separate effect to fix them,
  //    because this effect can rerun (e.g. a data refresh gives
  //    `connections` a new array reference) without STYLE rerunning. ────
  useEffect(() => {
    if (!svgRef.current || connections.length === 0) return;
    const { width, height } = dimsRef.current;

    const allNodes = buildNodes(connections);

    const prevPositions = new Map(
      (simRef.current?.nodes() ?? []).map(n => [n.id, { x: n.x, y: n.y }])
    );

    const filteredNodes: SimNode[] = allNodes
      .filter(n => {
        const matchSearch = !search ||
          n.id.toLowerCase().includes(search.toLowerCase()) ||
          n.label.toLowerCase().includes(search.toLowerCase());
        const matchDomain = !activeDomain || n.domain === activeDomain;
        return matchSearch && matchDomain;
      })
      .map(n => {
        const prev = prevPositions.get(n.id);
        return {
          ...n,
          x: prev?.x ?? width / 2 + (Math.random() - 0.5) * 300,
          y: prev?.y ?? height / 2 + (Math.random() - 0.5) * 300,
        };
      });

    const nodeMap = new Map(filteredNodes.map(n => [n.id, n]));

    const filteredLinks: SimLink[] = connections
      .map((c, i) => ({ ...c, idx: i }))
      .filter(c => nodeMap.has(c.source) && nodeMap.has(c.target))
      .map(c => ({ source: c.source, target: c.target, description: c.description, idx: c.idx }));

    filteredLinks.forEach(l => {
      l.source = nodeMap.get(l.source as string)!;
      l.target = nodeMap.get(l.target as string)!;
    });
    filteredLinksRef.current = filteredLinks;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const wrapper = svg.append('g');
    const linkG = wrapper.append('g');
    const nodeG = wrapper.append('g');

    const sim = d3
      .forceSimulation<SimNode>(filteredNodes)
      .force('link', d3.forceLink<SimNode, SimLink>(filteredLinks).id(d => d.id).distance(d => {
        const s = d.source as SimNode;
        const t = d.target as SimNode;
        return s.domain === t.domain ? 180 : 250;
      }))
      .force('charge', d3.forceManyBody().strength(-360))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(68));

    simRef.current = sim;

    // Current selection, captured at build time — used only to give newly
    // created elements the CORRECT baseline immediately (no black-fill
    // frame). The STYLE effect below stays the single source of truth for
    // any later selection changes.
    const adjacent = new Set<string>();
    if (selectedNodeId) {
      adjacent.add(selectedNodeId);
      filteredLinks.forEach(l => {
        const s = (l.source as SimNode).id;
        const t = (l.target as SimNode).id;
        if (s === selectedNodeId) adjacent.add(t);
        if (t === selectedNodeId) adjacent.add(s);
      });
    }

    const linkSel = linkG.selectAll<SVGLineElement, SimLink>('line')
      .data(filteredLinks).enter().append('line')
      .attr('class', 'link-line')
      .attr('stroke', d => DOMAIN_COLORS[(d.source as SimNode).domain] ?? '#475569')
      .attr('stroke-opacity', d => {
        const s = d.source as SimNode; const t = d.target as SimNode;
        if (selectedConnectionIdx === d.idx) return 0.95;
        if (selectedNodeId) return (s.id === selectedNodeId || t.id === selectedNodeId) ? 0.85 : 0.1;
        return 0.5;
      })
      .attr('stroke-width', d => {
        const s = d.source as SimNode; const t = d.target as SimNode;
        if (selectedConnectionIdx === d.idx) return 4;
        if (selectedNodeId && (s.id === selectedNodeId || t.id === selectedNodeId)) return 3;
        return 2;
      })
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        onSelectConnection(d.idx);
        onSelectNode(null);
      });
    linkSelRef.current = linkSel;

    const nodeSel = nodeG.selectAll<SVGGElement, SimNode>('g')
      .data(filteredNodes).enter().append('g')
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        onSelectNode(d.id);
        onSelectConnection(null);
      })
      .on('dblclick', (event, d) => {
        event.stopPropagation();
        const path = articlePathForNode(d.id, connections);
        if (path) onOpenArticle(path);
      })
      .call(
        d3.drag<SVGGElement, SimNode>()
          .on('start', (event, d) => { if (!event.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
          .on('drag', (event, d) => { d.fx = event.x; d.fy = event.y; })
          .on('end', (event, d) => { if (!event.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
      );
    nodeSelRef.current = nodeSel;

    // Circle — full baseline (fill, stroke, opacity, radius) set here so
    // the node is correctly colored the instant it exists.
    nodeSel.append('circle')
      .attr('class', 'node-circle')
      .attr('r', d => selectedNodeId === d.id ? 21 : 14)
      .attr('fill', d => DOMAIN_COLORS[d.domain] ?? '#475569')
      .attr('stroke', d => selectedNodeId === d.id ? '#fff' : adjacent.has(d.id) ? 'rgba(255,255,255,.7)' : '#020617')
      .attr('stroke-width', d => selectedNodeId === d.id ? 3 : adjacent.has(d.id) ? 2 : 1.5)
      .attr('fill-opacity', d => selectedNodeId ? (adjacent.has(d.id) ? 1 : 0.2) : 0.9)
      .attr('filter', d => selectedNodeId === d.id ? `drop-shadow(0 0 10px ${DOMAIN_COLORS[d.domain]})` : 'none');

    // Label — fill/opacity set here at creation. This is the fix for the
    // "blacked out" text: previously fill was only ever set by the STYLE
    // effect, which does not rerun when BUILD rebuilds for an unrelated
    // reason, leaving fresh text at the SVG-default black fill.
    nodeSel.append('text')
      .attr('class', 'node-label')
      .attr('dx', 18).attr('dy', 5)
      .attr('font-size', 13).attr('font-weight', 650)
      .attr('stroke', '#020617').attr('stroke-width', 3).attr('paint-order', 'stroke')
      .attr('fill', d => selectedNodeId === d.id ? '#fff' : '#e2e8f0')
      .attr('fill-opacity', d => selectedNodeId ? (adjacent.has(d.id) ? 1 : 0.2) : 0.75)
      .text(d => d.label.length > 34 ? d.label.slice(0, 32) + '…' : d.label);

    // "Open article" glyph on nodes that resolve to real content.
    nodeSel.filter(d => d.hasArticle)
      .append('circle')
      .attr('class', 'article-glyph')
      .attr('r', 5).attr('cx', 11).attr('cy', -11)
      .attr('fill', '#0f172a').attr('stroke', '#818cf8').attr('stroke-width', 1.5)
      .attr('fill-opacity', d => selectedNodeId ? (adjacent.has(d.id) ? 1 : 0.15) : 1)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        const path = articlePathForNode(d.id, connections);
        if (path) onOpenArticle(path);
      });
    nodeSel.filter(d => d.hasArticle)
      .append('text')
      .attr('x', 11).attr('y', -7.5).attr('text-anchor', 'middle')
      .attr('font-size', 8).attr('fill', '#c7d2fe').attr('pointer-events', 'none')
      .text('↳');

    sim.on('tick', () => {
      linkSel
        .attr('x1', d => (d.source as SimNode).x)
        .attr('y1', d => (d.source as SimNode).y)
        .attr('x2', d => (d.target as SimNode).x)
        .attr('y2', d => (d.target as SimNode).y);
      nodeSel.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Zoom: re-attach the previous transform instead of resetting to
    // identity, so a filter change or data refresh never wipes pan/zoom.
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', e => {
        wrapper.attr('transform', e.transform.toString());
        transformRef.current = e.transform;
      });
    zoomRef.current = zoom;
    svg.call(zoom);
    svg.call(zoom.transform, transformRef.current);

    return () => { sim.stop(); };
  }, [connections, search, activeDomain]);

  // ── 2. RESIZE — container size changes only. Updates the coordinate
  //    space and gently reheats the simulation; never rebuilds DOM, never
  //    touches zoom. Runs once immediately after mount to correct the
  //    FALLBACK_DIMS placeholder to the real measured size. ────────────
  useEffect(() => {
    if (!svgRef.current) return;
    d3.select(svgRef.current).attr('viewBox', `0 0 ${dims.width} ${dims.height}`);
    const sim = simRef.current;
    if (sim) {
      sim.force('center', d3.forceCenter(dims.width / 2, dims.height / 2));
      sim.alpha(0.05).restart();
    }
  }, [dims]);

  // ── 3. STYLE — selection changes only. Mutates existing selections'
  //    visual attributes in place; matches the same formulas BUILD uses
  //    for its initial paint, so there is exactly one place each rule
  //    lives even though it's applied from two spots. ──────────────────
  useEffect(() => {
    const nodeSel = nodeSelRef.current;
    const linkSel = linkSelRef.current;
    if (!nodeSel || !linkSel) return;

    const adjacent = new Set<string>();
    if (selectedNodeId) {
      adjacent.add(selectedNodeId);
      filteredLinksRef.current.forEach(l => {
        const s = (l.source as SimNode).id;
        const t = (l.target as SimNode).id;
        if (s === selectedNodeId) adjacent.add(t);
        if (t === selectedNodeId) adjacent.add(s);
      });
    }

    nodeSel.select<SVGCircleElement>('circle.node-circle')
      .attr('r', d => selectedNodeId === d.id ? 21 : 14)
      .attr('stroke', d => selectedNodeId === d.id ? '#fff' : adjacent.has(d.id) ? 'rgba(255,255,255,.7)' : '#020617')
      .attr('stroke-width', d => selectedNodeId === d.id ? 3 : adjacent.has(d.id) ? 2 : 1.5)
      .attr('fill-opacity', d => selectedNodeId ? (adjacent.has(d.id) ? 1 : 0.2) : 0.9)
      .attr('filter', d => selectedNodeId === d.id ? `drop-shadow(0 0 10px ${DOMAIN_COLORS[d.domain]})` : 'none');

    nodeSel.select<SVGTextElement>('text.node-label')
      .attr('fill', d => selectedNodeId === d.id ? '#fff' : '#e2e8f0')
      .attr('fill-opacity', d => selectedNodeId ? (adjacent.has(d.id) ? 1 : 0.2) : 0.75);

    nodeSel.select<SVGCircleElement>('circle.article-glyph')
      .attr('fill-opacity', d => selectedNodeId ? (adjacent.has(d.id) ? 1 : 0.15) : 1);

    linkSel
      .attr('stroke-opacity', d => {
        const s = d.source as SimNode; const t = d.target as SimNode;
        if (selectedConnectionIdx === d.idx) return 0.95;
        if (selectedNodeId) return (s.id === selectedNodeId || t.id === selectedNodeId) ? 0.85 : 0.1;
        return 0.5;
      })
      .attr('stroke-width', d => {
        const s = d.source as SimNode; const t = d.target as SimNode;
        if (selectedConnectionIdx === d.idx) return 4;
        if (selectedNodeId && (s.id === selectedNodeId || t.id === selectedNodeId)) return 3;
        return 2;
      });
  }, [selectedNodeId, selectedConnectionIdx]);

  const zoomIn  = useCallback(() => svgRef.current && zoomRef.current && d3.select(svgRef.current).transition().duration(280).call(zoomRef.current.scaleBy, 1.3), []);
  const zoomOut = useCallback(() => svgRef.current && zoomRef.current && d3.select(svgRef.current).transition().duration(280).call(zoomRef.current.scaleBy, 0.75), []);
  const zoomReset = useCallback(() => svgRef.current && zoomRef.current && d3.select(svgRef.current).transition().duration(280).call(zoomRef.current.transform, d3.zoomIdentity), []);

  const fitToView = useCallback(() => {
    const sim = simRef.current;
    if (!sim || !svgRef.current || !zoomRef.current) return;
    const nodes = sim.nodes();
    if (nodes.length === 0) return;
    const xs = nodes.map(n => n.x);
    const ys = nodes.map(n => n.y);
    const minX = Math.min(...xs) - 60, maxX = Math.max(...xs) + 60;
    const minY = Math.min(...ys) - 60, maxY = Math.max(...ys) + 60;
    const w = Math.max(maxX - minX, 1);
    const h = Math.max(maxY - minY, 1);
    const scale = Math.min(4, Math.max(0.1, Math.min(dims.width / w, dims.height / h)));
    const tx = dims.width / 2 - scale * (minX + w / 2);
    const ty = dims.height / 2 - scale * (minY + h / 2);
    d3.select(svgRef.current)
      .transition().duration(400)
      .call(zoomRef.current.transform, d3.zoomIdentity.translate(tx, ty).scale(scale));
  }, [dims]);

  return (
    <div className="flex flex-col h-full min-h-0 min-w-0 gap-3">
      {/* Search + domain filters */}
      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" size={14} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search nodes…"
            className="w-full glass-inner focus:border-indigo-400/40 outline-none text-white/75 placeholder-white/28 font-mono text-sm pl-9 pr-8 py-2 rounded-lg transition"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 hover:text-white/80">
              <X size={12} />
            </button>
          )}
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <button
            onClick={() => setActiveDomain(null)}
            className={`shrink-0 px-3 py-1.5 rounded-lg border font-mono text-xs uppercase transition ${!activeDomain ? 'bg-white/10 border-white/20 text-white/85' : 'glass-inner text-white/42 hover:text-white/70'}`}
          >
            All
          </button>
          {allDomains.map(d => (
            <button
              key={d}
              onClick={() => setActiveDomain(activeDomain === d ? null : d)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-mono text-xs uppercase transition ${activeDomain === d ? 'bg-white/10 border-white/20 text-white/85' : 'glass-inner text-white/42 hover:text-white/70'}`}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: DOMAIN_COLORS[d] ?? '#475569' }} />
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas — svg is ALWAYS mounted (never conditionally omitted), so
          there is nothing that can render "blank" while waiting on a
          measurement. */}
      <div
        ref={containerRef}
        className="relative flex-1 min-h-0 glass-panel rounded-xl overflow-hidden"
        onClick={() => { onSelectNode(null); onSelectConnection(null); }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(rgba(99,102,241,0.08)_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />
        <svg
          ref={svgRef}
          viewBox={`0 0 ${dims.width} ${dims.height}`}
          className="block w-full h-full cursor-grab active:cursor-grabbing"
        />

        <div className="absolute bottom-4 right-4 flex flex-col gap-1 glass-panel p-1.5 rounded-xl">
          {[
            { fn: zoomIn, icon: ZoomIn, title: 'Zoom in' },
            { fn: zoomOut, icon: ZoomOut, title: 'Zoom out' },
            { fn: fitToView, icon: Maximize2, title: 'Fit to view' },
            { fn: zoomReset, icon: RotateCcw, title: 'Reset zoom' },
          ].map(({ fn, icon: Icon, title }) => (
            <button key={title} onClick={e => { e.stopPropagation(); fn(); }} title={title}
              className="p-1.5 glass-row-hover text-white/40 hover:text-white/85 rounded-lg transition">
              <Icon size={16} />
            </button>
          ))}
        </div>

        <div className="absolute bottom-4 left-4 pointer-events-none font-mono text-xs text-white/35 glass-inner px-2.5 py-1.5 rounded-lg">
          {buildNodes(connections).length} NODES · {connections.length} CONNECTIONS · double-click a node to open its article
        </div>
      </div>
    </div>
  );
}
