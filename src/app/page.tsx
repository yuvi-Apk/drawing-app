"use client";
import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import {
  Plus,
  Minus,
  Circle,
  Square,
  Trash2,
  Save,
  Layers,
  ChevronUp,
  ChevronDown,
  Move,
  Pencil,
  ArrowLeft,
  ArrowRight,
  Download,
  Eraser,
  RefreshCw,
  Palette,
  Eye,
  EyeOff,
  X,
} from "lucide-react";

// SVG icons (inline, no external libs)
const icons = {
  brush: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      className="lucide lucide-pen-line-icon lucide-pen-line"
    >
      <path d="M12 20h9" />
      <path d="M16.376 3.622a1 1 0 0 1 3.002 3.002L7.368 18.635a2 2 0 0 1-.855.506l-2.872.838a.5.5 0 0 1-.62-.62l.838-2.872a2 2 0 0 1 .506-.854z" />
    </svg>
  ),
  delete: (
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-archive-x-icon lucide-archive-x"><rect width="20" height="5" x="2" y="3" rx="1"/><path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8"/><path d="m9.5 17 5-5"/><path d="m9.5 12 5 5"/></svg>
  ),
  eraser: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <path
        stroke="currentColor"
        strokeWidth="2"
        d="M19 5L5 19M16 5h3v3M5 16v3h3"
      />
    </svg>
  ),
  rect: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
    </svg>
  ),
  circle: (
    <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  undo: (
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-undo-icon lucide-undo"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>
  ),
  redo: (
<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-redo-icon lucide-redo"><path d="M21 7v6h-6"/><path d="M3 17a9 9 0 0 1 9-9 9 9 0 0 1 6 2.3l3 2.7"/></svg>
  ),
  save: (
    <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
      <path
        d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2z"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M12 17v-6m0 0l-3 3m3-3l3 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  layers: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path
        stroke="currentColor"
        strokeWidth="2"
        d="M12 4l8 4-8 4-8-4 8-4zm0 8l8 4-8 4-8-4 8-4z"
      />
    </svg>
  ),
  clear: (
    <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path stroke="currentColor" strokeWidth="2" d="M9 9l6 6m0-6l-6 6" />
    </svg>
  ),
};

// Helper for random avatars
const randomAvatar = () =>
  `https://randomuser.me/api/portraits/lego/${Math.floor(
    Math.random() * 10
  )}.jpg`;

// Helper for unsplash images
const unsplash = (q: string) => `https://source.unsplash.com/800x400/?${q}`;

// Types
interface Layer {
  id: string;
  name: string;
  visible: boolean;
  data: ImageData;
}

type Tool = "brush" | "eraser" | "rect" | "circle";

const COLORS = [
  "#111827",
  "#fff",
  "#ef4444",
  "#10b981",
  "#2563eb",
  "#fbbf24",
  "#f472b6",
  "#06b6d4",
  "#f59e42",
  "#a21caf",
];

const BRUSH_SIZES = [2, 4, 8, 12, 20, 32];

const defaultStats = [
  { name: "Drawings", value: 120 },
  { name: "Layers", value: 8 },
  { name: "Users", value: 3 },
];

const DrawingApp: React.FC = () => {
  // Canvas refs and state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [tool, setTool] = useState<Tool>("brush");
  const [color, setColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[2]);
  const [layers, setLayers] = useState<Layer[]>([]);
  const [activeLayer, setActiveLayer] = useState<string | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);
  const [showPalette, setShowPalette] = useState(false);
  const [showLayers, setShowLayers] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [showAbout, setShowAbout] = useState(false);
  const [shapeStart, setShapeStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });

  // Responsive canvas
  useEffect(() => {
    const handleResize = () => {
      const w = Math.min(window.innerWidth - 40, 900);
      setCanvasSize({ width: w, height: Math.round(w * 0.6) });
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Init layer
  useEffect(() => {
    if (layers.length === 0) {
      const ctx = canvasRef.current?.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
        setLayers([
          {
            id: "layer-1",
            name: "Background",
            visible: true,
            data: ctx.getImageData(0, 0, canvasSize.width, canvasSize.height),
          },
        ]);
        setActiveLayer("layer-1");
      }
    }
  }, [canvasSize.width, canvasSize.height]);

  // Draw from layer
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !activeLayer) return;
    const layer = layers.find((l) => l.id === activeLayer);
    if (layer) {
      ctx.putImageData(layer.data, 0, 0);
    }
  }, [activeLayer, layers]);

  // Drawing logic
  const handlePointerDown = (e: React.PointerEvent) => {
    if (!activeLayer) return;
    setDrawing(true);
    setShapeStart({ x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY });
    saveHistory();
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!drawing || !activeLayer) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const x = e.nativeEvent.offsetX;
    const y = e.nativeEvent.offsetY;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (tool === "brush") {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.globalCompositeOperation = "source-over";
      ctx.beginPath();
      ctx.moveTo(shapeStart!.x, shapeStart!.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      setShapeStart({ x, y });
    } else if (tool === "eraser") {
      ctx.globalCompositeOperation = "destination-out";
      ctx.lineWidth = brushSize * 2;
      ctx.beginPath();
      ctx.moveTo(shapeStart!.x, shapeStart!.y);
      ctx.lineTo(x, y);
      ctx.stroke();
      setShapeStart({ x, y });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!drawing || !activeLayer) return;
    setDrawing(false);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    if (tool === "rect" && shapeStart) {
      const x0 = shapeStart.x;
      const y0 = shapeStart.y;
      const x1 = e.nativeEvent.offsetX;
      const y1 = e.nativeEvent.offsetY;
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.globalCompositeOperation = "source-over";
      ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
    } else if (tool === "circle" && shapeStart) {
      const x0 = shapeStart.x;
      const y0 = shapeStart.y;
      const x1 = e.nativeEvent.offsetX;
      const y1 = e.nativeEvent.offsetY;
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.globalCompositeOperation = "source-over";
      ctx.beginPath();
      ctx.ellipse(
        (x0 + x1) / 2,
        (y0 + y1) / 2,
        Math.abs(x1 - x0) / 2,
        Math.abs(y1 - y0) / 2,
        0,
        0,
        2 * Math.PI
      );
      ctx.stroke();
    }
    setShapeStart(null);
    saveLayer();
  };

  // Save current canvas to layer
  const saveLayer = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx || !activeLayer) return;
    const img = ctx.getImageData(0, 0, canvasSize.width, canvasSize.height);
    setLayers((prev) =>
      prev.map((l) => (l.id === activeLayer ? { ...l, data: img } : l))
    );
  };

  // Undo/Redo
  const saveHistory = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    setHistory((h) => [
      ...h,
      ctx.getImageData(0, 0, canvasSize.width, canvasSize.height),
    ]);
    setRedoStack([]);
  };
  const handleUndo = () => {
    if (history.length === 0) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const prev = history[history.length - 1];
    ctx.putImageData(prev, 0, 0);
    setHistory((h) => h.slice(0, -1));
    setRedoStack((r) => [
      ctx.getImageData(0, 0, canvasSize.width, canvasSize.height),
      ...r,
    ]);
    saveLayer();
  };
  const handleRedo = () => {
    if (redoStack.length === 0) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const next = redoStack[0];
    ctx.putImageData(next, 0, 0);
    setRedoStack((r) => r.slice(1));
    setHistory((h) => [
      ...h,
      ctx.getImageData(0, 0, canvasSize.width, canvasSize.height),
    ]);
    saveLayer();
  };

  // Clear
  const handleClear = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvasSize.width, canvasSize.height);
    saveLayer();
    saveHistory();
  };

  // Save as image
  const handleSave = () => {
    const link = document.createElement("a");
    link.download = "drawing.png";
    link.href = canvasRef.current!.toDataURL();
    link.click();
  };

  // Layer management
  const addLayer = () => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const id = `layer-${layers.length + 1}`;
    const img = ctx.getImageData(0, 0, canvasSize.width, canvasSize.height);
    setLayers((prev) => [
      ...prev,
      { id, name: `Layer ${layers.length + 1}`, visible: true, data: img },
    ]);
    setActiveLayer(id);
  };
  const removeLayer = (id: string) => {
    if (layers.length === 1) return;
    setLayers((prev) => prev.filter((l) => l.id !== id));
    setActiveLayer(layers[0].id);
  };
  const toggleLayer = (id: string) => {
    setLayers((prev) =>
      prev.map((l) => (l.id === id ? { ...l, visible: !l.visible } : l))
    );
  };

  // UI
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-100 to-slate-300 dark:from-slate-900 dark:to-slate-800 text-slate-900 dark:text-slate-100 font-sans">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-slate-900/80 shadow-md z-10">
        <div className="flex items-center gap-3">
          <img
            src={randomAvatar()}
            alt="avatar"
            className="w-10 h-10 rounded-full border-2 border-slate-300"
          />
          <span className="text-xl font-bold tracking-tight">Drawly</span>
        </div>
        <div className="flex gap-4 items-center">
          <button
            onClick={() => setShowStats(true)}
            className="hover:scale-110 transition-transform"
          >
            Stats
          </button>
          <button
            onClick={() => setShowAbout(true)}
            className="hover:scale-110 transition-transform"
          >
            About
          </button>
          <a
            href="#canvas"
            className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-700 transition"
          >
            Start Drawing
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col md:flex-row items-center justify-between gap-10 px-8 py-16 md:py-24 max-w-6xl mx-auto w-full">
        <div className="flex-1 flex flex-col gap-6">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-4xl md:text-6xl font-extrabold leading-tight"
          >
            Unleash Your Creativity
            <br />
            <span className="text-blue-500">Draw, Sketch, Imagine.</span>
          </motion.h1>
          <p className="text-lg md:text-2xl text-slate-600 dark:text-slate-300 max-w-xl">
            Drawly is your digital canvas for art, notes, and ideas. Freehand,
            shapes, layers, and more — all in a beautiful, responsive interface.
          </p>
          <div className="flex gap-4 mt-2">
            <a
              href="#canvas"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold shadow hover:bg-blue-700 transition"
            >
              Start Drawing
            </a>
            <button
              onClick={() => setShowAbout(true)}
              className="px-6 py-3 border border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition"
            >
              Learn More
            </button>
          </div>
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="flex-1 flex items-center justify-center"
        >
          <img
            src={unsplash("digital-art") + "&sig=1"}
            alt="Digital Art"
            className="rounded-2xl shadow-2xl w-full max-w-md"
          />
        </motion.div>
      </section>

      {/* Drawing Area */}
      <main
        className="flex-1 flex flex-col items-center justify-center w-full px-0 md:px-6 py-4"
        id="canvas"
      >
        <div className="flex flex-col-reverse md:flex-row w-full max-w-7xl h-[80vh] min-h-[400px] md:min-h-[500px] rounded-2xl shadow-2xl overflow-hidden bg-white/80 dark:bg-slate-900/80">
          {/* Sidebar Toolbar (desktop) */}
          <aside className="hidden md:flex flex-col overflow-auto gap-6 w-72 bg-slate-800 text-white p-4 rounded-l-2xl z-10">
            <div>
              <div className="font-bold text-lg mb-3">Tools</div>
              <div className="grid grid-cols-4 gap-2 mb-4">
                <button
                  title="Brush"
                  aria-label="Brush"
                  onClick={() => setTool("brush")}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 ${
                    tool === "brush"
                      ? "border-blue-400 bg-slate-700"
                      : "border-transparent hover:bg-slate-700"
                  }`}
                >
                  {icons.brush}
                </button>
                <button
                  title="Delete"
                  aria-label="Delete"
                  onClick={handleClear}
                  className="flex flex-col items-center justify-center p-2 rounded-lg border-2 border-transparent hover:bg-slate-700"
                >
                  {icons.delete}
                </button>
                <button
                  title="Rectangle"
                  aria-label="Rectangle"
                  onClick={() => setTool("rect")}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 ${
                    tool === "rect"
                      ? "border-blue-400 bg-slate-700"
                      : "border-transparent hover:bg-slate-700"
                  }`}
                >
                  {icons.rect}
                </button>
                <button
                  title="Circle"
                  aria-label="Circle"
                  onClick={() => setTool("circle")}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg border-2 ${
                    tool === "circle"
                      ? "border-blue-400 bg-slate-700"
                      : "border-transparent hover:bg-slate-700"
                  }`}
                >
                  {icons.circle}
                </button>
              </div>
            </div>
            <div>
              <div className="font-semibold mb-2">Brush Size</div>
              <div className="flex items-center gap-2 mb-2">
                <button
                  aria-label="Decrease brush size"
                  onClick={() =>
                    setBrushSize((s) => Math.max(BRUSH_SIZES[0], s - 2))
                  }
                  className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-xl"
                >
                  -
                </button>
                <span className="w-10 text-center">{brushSize}px</span>
                <button
                  aria-label="Increase brush size"
                  onClick={() =>
                    setBrushSize((s) =>
                      Math.min(BRUSH_SIZES[BRUSH_SIZES.length - 1], s + 2)
                    )
                  }
                  className="w-8 h-8 rounded bg-slate-700 flex items-center justify-center text-xl"
                >
                  +
                </button>
              </div>
            </div>
            <div>
              <div className="font-semibold mb-2">Color</div>
              <div className="flex flex-wrap gap-2 mb-2">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    title={c}
                    aria-label={c}
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full border-2 ${
                      color === c ? "border-blue-400" : "border-slate-500"
                    }`}
                    style={{ background: c }}
                  />
                ))}
                <button
                  aria-label="Custom color"
                  onClick={() => setShowPalette(true)}
                  className="w-7 h-7 rounded-full border-2 border-slate-500 bg-gradient-to-br from-slate-200 to-slate-400 flex items-center justify-center text-xs font-bold"
                >
                  +
                </button>
              </div>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-10 rounded mb-2 border-none"
              />
            </div>
            <div>
              <div className="font-semibold mb-2">History</div>
              <div className="flex gap-2 mb-2">
                <button
                  title="Undo"
                  aria-label="Undo"
                  onClick={handleUndo}
                  className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center overflow-hidden"
                >
                  {icons.undo}
                </button>
                <button
                  title="Redo"
                  aria-label="Redo"
                  onClick={handleRedo}
                  className="w-12 h-12 rounded-lg bg-slate-700 flex items-center justify-center overflow-hidden"
                >
                  {icons.redo}
                </button>
              </div>
            </div>
            <button
              onClick={handleSave}
              aria-label="Save as Image"
              className="w-full mt-2 py-3! rounded-lg bg-green-500 hover:bg-green-600 text-white font-bold flex items-center justify-center gap-2 text-lg shadow overflow-hidden"
            >
              {icons.save}
              <span className="ml-2 py-3!">Save as Image</span>
            </button>
            <button
              onClick={handleClear}
              aria-label="Clear"
              className="w-full mt-2 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-bold flex items-center justify-center gap-2 text-base shadow"
            >
              {icons.clear}
              <span className="ml-2">Clear</span>
            </button>
            <button
              onClick={() => setShowLayers(true)}
              aria-label="Layers"
              className="w-full mt-2 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white font-bold flex items-center justify-center gap-2 text-base shadow"
            >
              {icons.layers}
              <span className="ml-2">Layers</span>
            </button>
          </aside>
          {/* Bottom Toolbar (mobile) */}
          <nav className="md:hidden flex flex-row items-center justify-between gap-2 w-full bg-slate-800 text-white p-2 fixed bottom-0 left-0 right-0 z-20 shadow-2xl">
            <button
              title="Brush"
              aria-label="Brush"
              onClick={() => setTool("brush")}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 ${
                tool === "brush"
                  ? "border-blue-400 bg-slate-700"
                  : "border-transparent hover:bg-slate-700"
              }`}
            >
              {icons.brush}
            </button>
            <button
              title="Delete"
              aria-label="Delete"
              onClick={handleClear}
              className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-transparent hover:bg-slate-700"
            >
              {icons.delete}
            </button>
            <button
              title="Rectangle"
              aria-label="Rectangle"
              onClick={() => setTool("rect")}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 ${
                tool === "rect"
                  ? "border-blue-400 bg-slate-700"
                  : "border-transparent hover:bg-slate-700"
              }`}
            >
              {icons.rect}
            </button>
            <button
              title="Circle"
              aria-label="Circle"
              onClick={() => setTool("circle")}
              className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 ${
                tool === "circle"
                  ? "border-blue-400 bg-slate-700"
                  : "border-transparent hover:bg-slate-700"
              }`}
            >
              {icons.circle}
            </button>
            <button
              title="Undo"
              aria-label="Undo"
              onClick={handleUndo}
              className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-transparent hover:bg-slate-700"
            >
              {icons.undo}
            </button>
            <button
              title="Redo"
              aria-label="Redo"
              onClick={handleRedo}
              className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-transparent hover:bg-slate-700"
            >
              {icons.redo}
            </button>
            <button
              onClick={handleSave}
              aria-label="Save as Image"
              className="flex flex-col items-center justify-center p-3 rounded-lg border-2 border-transparent bg-green-500 hover:bg-green-600 text-white font-bold"
            >
              {icons.save}
            </button>
          </nav>
          {/* Canvas Area */}
          <section className="flex-1 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 relative overflow-auto">
            <div className="w-full flex justify-center items-center h-full">
              <div
                className="relative border-4 border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl bg-white overflow-auto max-w-full max-h-full flex items-center justify-center"
                style={{ width: "100%", height: "100%" }}
              >
                <canvas
                  ref={canvasRef}
                  width={canvasSize.width}
                  height={canvasSize.height}
                  className="block touch-none cursor-crosshair bg-white max-w-full max-h-[60vh] md:max-h-full"
                  style={{
                    width: "100%",
                    height: "100%",
                    minHeight: 300,
                    minWidth: 300,
                  }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={() => setDrawing(false)}
                />
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-6 px-8 flex flex-col md:flex-row items-center justify-between bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <img
            src={randomAvatar()}
            alt="avatar"
            className="w-7 h-7 rounded-full border border-slate-300"
          />
          <span className="font-semibold">Drawly</span>
          <span className="text-slate-400 text-xs ml-2">
            © {new Date().getFullYear()} All rights reserved.
          </span>
        </div>
        <div className="flex gap-4 mt-2 md:mt-0">
          <a href="#canvas" className="hover:underline">
            Canvas
          </a>
          <button
            onClick={() => setShowAbout(true)}
            className="hover:underline"
          >
            About
          </button>
          <a
            href="https://github.com/yuvi-Apk"
            target="_blank"
            rel="noopener"
            className="hover:underline"
          >
            GitHub
          </a>
        </div>
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {showPalette && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-xl flex flex-col gap-4 min-w-[300px]"
            >
              <div className="font-bold text-lg mb-2">Pick a Color</div>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-16 rounded"
              />
              <button
                onClick={() => setShowPalette(false)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
        {showLayers && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-xl flex flex-col gap-4 min-w-[350px] max-w-[90vw]"
            >
              <div className="font-bold text-lg mb-2 flex items-center justify-between">
                Layers
                <button
                  onClick={() => setShowLayers(false)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>
              <div className="flex flex-col gap-2">
                {layers.map((l, i) => (
                  <div
                    key={l.id}
                    className={`flex items-center gap-2 p-2 rounded ${
                      activeLayer === l.id ? "bg-blue-100 dark:bg-blue-900" : ""
                    }`}
                  >
                    <button
                      onClick={() => setActiveLayer(l.id)}
                      className="font-semibold flex-1 text-left"
                    >
                      {l.name}
                    </button>
                    <button
                      onClick={() => toggleLayer(l.id)}
                      className="text-lg"
                    >
                      {l.visible ? "👁️" : "🚫"}
                    </button>
                    {i > 0 && (
                      <button
                        onClick={() => removeLayer(l.id)}
                        className="text-red-500 hover:scale-110"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                onClick={addLayer}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add Layer
              </button>
            </motion.div>
          </motion.div>
        )}
        {showStats && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-xl flex flex-col gap-4 min-w-[350px] max-w-[90vw]"
            >
              <div className="font-bold text-lg mb-2 flex items-center justify-between">
                App Stats
                <button
                  onClick={() => setShowStats(false)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={defaultStats}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label
                  >
                    {defaultStats.map((entry, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={COLORS[idx % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex gap-4 justify-center">
                {defaultStats.map((s) => (
                  <div key={s.name} className="flex flex-col items-center">
                    <span className="font-bold text-xl">{s.value}</span>
                    <span className="text-slate-500 text-xs">{s.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
        {showAbout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-white dark:bg-slate-800 p-8 rounded-xl shadow-xl flex flex-col gap-4 min-w-[350px] max-w-[90vw]"
            >
              <div className="font-bold text-lg mb-2 flex items-center justify-between">
                About Drawly
                <button
                  onClick={() => setShowAbout(false)}
                  className="text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>
              <img
                src={unsplash("art") + "&sig=2"}
                alt="About"
                className="rounded-xl w-full max-h-40 object-cover mb-2"
              />
              <p className="text-slate-700 dark:text-slate-200">
                Drawly is a modern digital drawing app built with Next.js,
                Tailwind CSS, and TypeScript. It features a responsive canvas,
                layers, shapes, and more. Perfect for quick sketches, notes, or
                concept art. <br />{" "}
                <span className="font-semibold">
                  No data is uploaded — everything stays in your browser.
                </span>
              </p>
              <div className="flex gap-2 mt-2">
                <a
                  href="https://github.com/yuvi-Apk"
                  target="_blank"
                  rel="noopener"
                  className="px-4 py-2 bg-slate-900 text-white rounded hover:bg-slate-700"
                >
                  GitHub
                </a>
                <button
                  onClick={() => setShowAbout(false)}
                  className="px-4 py-2 border border-slate-900 text-slate-900 rounded hover:bg-slate-100"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DrawingApp;
