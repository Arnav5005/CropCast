import React, { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  Sprout,
  Satellite,
  CloudRain,
  Layers,
  Sparkles,
  TrendingUp,
  Activity,
  Compass,
  CheckCircle2,
  RefreshCw,
  Sun,
  Droplets,
  BarChart3,
  ChevronDown,
} from 'lucide-react';
import { DISTRICTS, type DistrictData } from '../data/districts';

gsap.registerPlugin(ScrollTrigger);

interface CropPredictionSectionProps {
  onProgress?: (p: number) => void;
  onNavigateSection?: (index: number) => void;
}

export const CropPredictionSection: React.FC<CropPredictionSectionProps> = ({
  onProgress,
  onNavigateSection,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const appUIRef = useRef<HTMLDivElement>(null);

  // Selected district baseline
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictData>(DISTRICTS[0]);

  // Form states for live tuning
  const [districtId, setDistrictId] = useState<string>(DISTRICTS[0].id);
  const [cropType, setCropType] = useState<string>('Rice / Paddy (PR-126 & Basmati)');
  const [ndvi, setNdvi] = useState<number>(DISTRICTS[0].defaultNDVI);
  const [evi, setEvi] = useState<number>(DISTRICTS[0].defaultEVI);
  const [ndwi, setNdwi] = useState<number>(DISTRICTS[0].defaultNDWI);
  const [rainfall, setRainfall] = useState<number>(DISTRICTS[0].rainfall);
  const [temp, setTemp] = useState<number>(DISTRICTS[0].temperature);
  const [humidity, setHumidity] = useState<number>(DISTRICTS[0].humidity);
  const [soilMoisture, setSoilMoisture] = useState<number>(DISTRICTS[0].soilMoisture);
  const [soilPH, setSoilPH] = useState<number>(DISTRICTS[0].soilPH);
  const [historicalYield, setHistoricalYield] = useState<number>(DISTRICTS[0].historicalYield);

  // Prediction output state
  const [isPredicting, setIsPredicting] = useState<boolean>(false);
  const [predictionResult, setPredictionResult] = useState<{
    predictedYield: number;
    delta: number;
    deltaPercent: number;
    confidence: number;
    healthScore: number;
    harvestDate: string;
    biomassIndex: number;
  }>({
    predictedYield: DISTRICTS[0].predictedYield,
    delta: +(DISTRICTS[0].predictedYield - DISTRICTS[0].historicalYield).toFixed(2),
    deltaPercent: +(
      ((DISTRICTS[0].predictedYield - DISTRICTS[0].historicalYield) /
        DISTRICTS[0].historicalYield) *
      100
    ).toFixed(1),
    confidence: DISTRICTS[0].confidence,
    healthScore: DISTRICTS[0].healthScore,
    harvestDate: 'Oct 24 - Nov 02, 2026',
    biomassIndex: 94.2,
  });

  // Handle District Change
  const handleDistrictChange = (id: string) => {
    setDistrictId(id);
    const d = DISTRICTS.find((item) => item.id === id) || DISTRICTS[0];
    setSelectedDistrict(d);
    setCropType(d.majorCrop);
    setNdvi(d.defaultNDVI);
    setEvi(d.defaultEVI);
    setNdwi(d.defaultNDWI);
    setRainfall(d.rainfall);
    setTemp(d.temperature);
    setHumidity(d.humidity);
    setSoilMoisture(d.soilMoisture);
    setSoilPH(d.soilPH);
    setHistoricalYield(d.historicalYield);

    // Auto-recalculate
    recalculatePrediction(
      d.defaultNDVI,
      d.rainfall,
      d.soilMoisture,
      d.historicalYield
    );
  };

  // Yield model calculation
  const recalculatePrediction = (
    cNDVI: number,
    cRain: number,
    cMoist: number,
    cHist: number
  ) => {
    setIsPredicting(true);
    setTimeout(() => {
      // Dynamic yield model based on NDVI vigour, moisture, and historical baseline
      const ndviFactor = (cNDVI - 0.5) * 1.8;
      const moistureFactor = (cMoist - 50) * 0.015;
      const rainFactor = (cRain - 700) * 0.0006;
      const rawYield = Math.max(
        2.5,
        +(cHist * 0.85 + ndviFactor + moistureFactor + rainFactor).toFixed(2)
      );
      const delta = +(rawYield - cHist).toFixed(2);
      const deltaPercent = +((delta / cHist) * 100).toFixed(1);
      const confidence = +(92 + (cNDVI * 6)).toFixed(1);
      const healthScore = Math.min(99, Math.round(cNDVI * 115));

      setPredictionResult({
        predictedYield: rawYield,
        delta,
        deltaPercent,
        confidence,
        healthScore,
        harvestDate: 'Oct 24 - Nov 04, 2026',
        biomassIndex: +(cNDVI * 120).toFixed(1),
      });
      setIsPredicting(false);
    }, 450);
  };

  const handlePredictSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    recalculatePrediction(ndvi, rainfall, soilMoisture, historicalYield);
  };

  // Canvas Golden Paddy Wind Simulation & Transition
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

    // Stalks grid for golden paddy field
    interface PaddyStalk {
      x: number;
      baseY: number;
      length: number;
      phase: number;
      width: number;
      grainCount: number;
      maturity: number; // 0 = green, 1 = golden ripe
    }

    const stalks: PaddyStalk[] = [];
    const numRows = 22;
    for (let r = 0; r < numRows; r++) {
      const rowProg = r / numRows;
      const y = height * 0.35 + Math.pow(rowProg, 1.7) * (height * 0.65 + 100);
      const rowScale = 0.35 + rowProg * 0.75;
      const spacing = 18 * rowScale;
      const count = Math.floor(width / spacing) + 4;

      for (let c = 0; c < count; c++) {
        const x = c * spacing + (r % 2) * (spacing * 0.5) - 30;
        stalks.push({
          x,
          baseY: y,
          length: (55 + Math.random() * 25) * rowScale,
          phase: x * 0.008 + r * 0.4,
          width: 1.8 * rowScale,
          grainCount: Math.floor(Math.random() * 4 + 5),
          maturity: 0,
        });
      }
    }

    // Scrubbed state
    const cropState = {
      progress: 0,
      maturity: 0, // 0 (green) to 1 (golden)
      windStrength: 1,
      cameraElevation: 0,
      uiReveal: 0,
    };

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      const mat = cropState.maturity;

      // 1. Sky / Sunset Ambient Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height * 0.6);
      // Sky warms up from agricultural green-blue to golden harvest glow
      const skyColor1 = `rgb(${Math.round(15 + mat * 45)}, ${Math.round(26 - mat * 5)}, ${Math.round(38 - mat * 20)})`;
      const skyColor2 = `rgb(${Math.round(25 + mat * 80)}, ${Math.round(45 + mat * 35)}, ${Math.round(40 - mat * 20)})`;
      skyGrad.addColorStop(0, skyColor1);
      skyGrad.addColorStop(0.5, skyColor2);
      skyGrad.addColorStop(1, `rgba(${Math.round(180 * mat + 20)}, ${Math.round(140 * mat + 60)}, 20, ${0.4 + mat * 0.4})`);

      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Golden Sun Orb on horizon during golden stage
      if (mat > 0.1) {
        const sunGrad = ctx.createRadialGradient(
          width * 0.75,
          height * 0.35,
          20,
          width * 0.75,
          height * 0.35,
          280
        );
        sunGrad.addColorStop(0, `rgba(253, 230, 138, ${mat * 0.8})`);
        sunGrad.addColorStop(0.4, `rgba(245, 158, 11, ${mat * 0.4})`);
        sunGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = sunGrad;
        ctx.fillRect(0, 0, width, height * 0.6);
      }

      // 2. Field Floor Base Gradient
      const fieldGrad = ctx.createLinearGradient(0, height * 0.35, 0, height);
      if (mat > 0.5) {
        // Golden ripe field floor
        fieldGrad.addColorStop(0, '#583c0f');
        fieldGrad.addColorStop(0.4, '#784e12');
        fieldGrad.addColorStop(0.8, '#926017');
        fieldGrad.addColorStop(1, '#3b2505');
      } else {
        // Green lush field floor
        fieldGrad.addColorStop(0, '#14532d');
        fieldGrad.addColorStop(0.5, '#166534');
        fieldGrad.addColorStop(1, '#0f3d1f');
      }
      ctx.fillStyle = fieldGrad;
      ctx.fillRect(0, height * 0.35, width, height * 0.65);

      // 3. Realistic Wind Wave Equation
      const windSpeed = 0.045;
      const windWaveFreq = 0.006;

      // 4. Render Golden / Green Paddy Rice Stalks with Panicles
      for (let s of stalks) {
        // Wind wave sway displacement
        const wave = Math.sin(s.x * windWaveFreq - tick * windSpeed + s.phase);
        const gust = Math.cos(s.x * 0.003 - tick * 0.02) * 0.5 + 0.5;
        const swayAngle = (wave * 0.28 + gust * 0.15) * cropState.windStrength;

        const startX = s.x;
        const startY = s.baseY + cropState.cameraElevation * 40;

        // Tip coordinates under wind bend
        const tipX = startX + Math.sin(swayAngle) * s.length;
        const tipY = startY - Math.cos(swayAngle) * s.length;

        // Control point for natural curved stem bending
        const cpX = startX + Math.sin(swayAngle * 0.6) * (s.length * 0.5);
        const cpY = startY - Math.cos(swayAngle * 0.6) * (s.length * 0.5);

        // Stalk Color blending from Green to Golden Amber
        const rVal = Math.round(34 + mat * 200);
        const gVal = Math.round(197 - mat * 45);
        const bVal = Math.round(94 - mat * 80);

        ctx.strokeStyle = `rgb(${rVal}, ${gVal}, ${bVal})`;
        ctx.lineWidth = s.width;
        ctx.lineCap = 'round';

        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(cpX, cpY, tipX, tipY);
        ctx.stroke();

        // Heavy Rice Panicle (Golden Grain Head Droop)
        if (mat > 0.2) {
          const panicleMat = (mat - 0.2) / 0.8;
          ctx.save();
          ctx.translate(tipX, tipY);

          // Panicle droops further under grain weight
          const droopAngle = swayAngle + 0.45 * panicleMat;
          ctx.rotate(droopAngle);

          // Grain Head
          const panLen = s.length * 0.45 * panicleMat;
          ctx.strokeStyle = `rgb(${Math.round(234 + panicleMat * 20)}, ${Math.round(179 - panicleMat * 25)}, 8)`;
          ctx.lineWidth = s.width * 1.6;

          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.quadraticCurveTo(8, panLen * 0.5, 4, panLen);
          ctx.stroke();

          // Individual Golden Rice Grains along panicle
          ctx.fillStyle = '#fef08a';
          for (let g = 1; g <= s.grainCount; g++) {
            const gy = (panLen / (s.grainCount + 1)) * g;
            const gx = (g % 2 === 0 ? 3 : -3) * (1 + panicleMat);
            ctx.beginPath();
            ctx.ellipse(gx, gy, 2.5 * s.width, 1.2 * s.width, Math.PI * 0.25, 0, Math.PI * 2);
            ctx.fill();
          }

          ctx.restore();
        }
      }

      // 5. Ambient Atmospheric Dust / Pollen Motes in Golden Sunlight
      if (mat > 0.3) {
        ctx.fillStyle = 'rgba(254, 240, 138, 0.4)';
        for (let i = 0; i < 40; i++) {
          const mx = (Math.sin(tick * 0.02 + i) * width * 0.5 + width * 0.5 + i * 25) % width;
          const my = (height * 0.3 + (i * 37 + tick * 0.6) % (height * 0.6));
          ctx.beginPath();
          ctx.arc(mx, my, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 6. UI Dark Backdrop Dimming as Interface slides in
      if (cropState.uiReveal > 0.1) {
        const uiDarkness = cropState.uiReveal * 0.85;
        ctx.fillStyle = `rgba(5, 7, 10, ${uiDarkness})`;
        ctx.fillRect(0, 0, width, height);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // GSAP ScrollTrigger Scrubbing Timeline
    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: '+=240%',
      pin: true,
      scrub: 1.2,
      onUpdate: (self) => {
        const p = self.progress;
        cropState.progress = p;
        if (onProgress) onProgress(p);

        // Sequence:
        // 0.00 - 0.38: Green paddy field develops, grains form, matures into glorious Golden Paddy with wind waves
        // 0.38 - 0.60: Camera glides through swaying golden crop, cinematic wind climax
        // 0.60 - 1.00: Smooth transition revealing CROPCAST Application Interface and Top Navigation

        if (p < 0.38) {
          cropState.maturity = p / 0.38;
          cropState.windStrength = 1 + (p / 0.38) * 0.6;
          cropState.cameraElevation = 0;
          cropState.uiReveal = 0;
        } else if (p < 0.6) {
          const sub = (p - 0.38) / 0.22;
          cropState.maturity = 1;
          cropState.windStrength = 1.6;
          cropState.cameraElevation = sub * 0.8;
          cropState.uiReveal = sub * 0.3;
        } else {
          const sub = (p - 0.6) / 0.4;
          cropState.maturity = 1;
          cropState.windStrength = 1.6 - sub * 0.5;
          cropState.cameraElevation = 0.8 + sub * 0.6;
          cropState.uiReveal = 0.3 + sub * 0.7;
        }

        // Reveal App UI Container
        if (appUIRef.current) {
          if (p < 0.45) {
            appUIRef.current.style.opacity = '0';
            appUIRef.current.style.pointerEvents = 'none';
            appUIRef.current.style.transform = 'translateY(80px)';
          } else {
            const uiProg = Math.min(1, (p - 0.45) / 0.35);
            appUIRef.current.style.opacity = uiProg.toString();
            appUIRef.current.style.pointerEvents = uiProg > 0.6 ? 'auto' : 'none';
            appUIRef.current.style.transform = `translateY(${Math.round((1 - uiProg) * 60)}px)`;
          }
        }
      },
    });

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      st.kill();
    };
  }, [onProgress]);

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen overflow-hidden bg-[#05070a] select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* ========================================================================= */}
      {/* FINAL APPLICATION INTERFACE & HEADER (Revealed only in Section 5) */}
      {/* ========================================================================= */}
      <div
        ref={appUIRef}
        className="relative z-20 w-full min-h-screen flex flex-col justify-start text-slate-100 opacity-0 transition-all duration-300 pointer-events-none pb-16"
      >
        {/* ========================================== */}
        {/* 1. TOP NAVIGATION HEADER (Exclusive to Section 5) */}
        {/* ========================================== */}
        <header className="sticky top-0 w-full z-40 glass-panel border-b border-white/10 px-6 py-4 flex items-center justify-between shadow-2xl">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-emerald-500 to-cyan-400 p-[1.5px] shadow-lg shadow-amber-500/20">
              <div className="w-full h-full bg-[#080d1a] rounded-[10px] flex items-center justify-center">
                <Sprout className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-wider font-['Space_Grotesk'] text-white">
                  CROPCAST
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  AI v2.4 LIVE
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wider font-mono">
                SATELLITE YIELD INTELLIGENCE
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-full border border-white/10 text-xs font-medium">
            <button
              onClick={() => onNavigateSection?.(0)}
              className="px-4 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/5 transition flex items-center gap-1.5 cursor-pointer"
            >
              <span>Home</span>
            </button>
            <button
              onClick={() => onNavigateSection?.(1)}
              className="px-4 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/5 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Satellite className="w-3.5 h-3.5 text-cyan-400" />
              <span>Satellite</span>
            </button>
            <button
              onClick={() => onNavigateSection?.(2)}
              className="px-4 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/5 transition flex items-center gap-1.5 cursor-pointer"
            >
              <CloudRain className="w-3.5 h-3.5 text-blue-400" />
              <span>Weather</span>
            </button>
            <button
              onClick={() => onNavigateSection?.(3)}
              className="px-4 py-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/5 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Soil</span>
            </button>
            <button
              onClick={() => onNavigateSection?.(4)}
              className="px-4 py-1.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Prediction</span>
            </button>
          </nav>

          {/* Status */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-slate-300 bg-emerald-950/40 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>SENTINEL-2 LINK: ACTIVE</span>
            </div>
          </div>
        </header>

        {/* ========================================== */}
        {/* 2. MAIN PREDICTION WORKSPACE */}
        {/* ========================================== */}
        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
          {/* Hero Banner Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/10 pb-6">
            <div>
              <div className="flex items-center gap-2 text-amber-400 text-xs font-mono tracking-widest uppercase mb-1">
                <Compass className="w-4 h-4" />
                <span>PRECISION AGRICULTURAL FORECASTING</span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-['Space_Grotesk'] text-white">
                Multi-Modal Crop Yield Prediction
              </h1>
              <p className="text-slate-400 text-sm mt-1 max-w-2xl">
                Synthesizing orbital multi-spectral indices, hydro-meteorology, and rhizosphere soil dynamics for harvest estimation.
              </p>
            </div>

            {/* Quick District Picker */}
            <div className="flex items-center gap-3 bg-slate-900/90 border border-white/10 rounded-xl p-2 px-3 shadow-lg">
              <span className="text-xs font-mono text-slate-400">Target Region:</span>
              <div className="relative">
                <select
                  value={districtId}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                  className="appearance-none bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold py-1.5 pl-3 pr-8 rounded-lg border border-amber-500/30 focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
                >
                  {DISTRICTS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.state.split(' ')[0]})
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-amber-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Core 2-Column Grid: Left Inputs, Right Visual Yield Results */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* ==================================================== */}
            {/* LEFT COLUMN (Inputs / Sliders / Parameters) - 5 Cols */}
            {/* ==================================================== */}
            <div className="lg:col-span-5 space-y-6">
              <form onSubmit={handlePredictSubmit} className="space-y-6">
                {/* 1. Target Crop & Region Card */}
                <div className="glass-card rounded-2xl p-5 space-y-4 border border-white/10">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                      <Sprout className="w-4 h-4" />
                      <span>Target Crop & Location</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {selectedDistrict.state}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-xs text-slate-300 font-medium mb-1">
                        Cultivar / Crop Variety
                      </label>
                      <input
                        type="text"
                        value={cropType}
                        onChange={(e) => setCropType(e.target.value)}
                        className="w-full bg-slate-900/80 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Satellite Spectral Indices Card */}
                <div className="glass-card rounded-2xl p-5 space-y-4 border border-white/10">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                      <Satellite className="w-4 h-4" />
                      <span>Orbital Multi-Spectral Indices</span>
                    </div>
                    <span className="text-[10px] font-mono bg-cyan-950/60 text-cyan-300 px-2 py-0.5 rounded border border-cyan-500/20">
                      SENTINEL-2 / LANDSAT-9
                    </span>
                  </div>

                  {/* NDVI Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300">NDVI (Normalized Veg Index)</span>
                      <span className="text-cyan-300 font-bold">{ndvi.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.3"
                      max="0.95"
                      step="0.01"
                      value={ndvi}
                      onChange={(e) => setNdvi(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>0.30 (Sparse)</span>
                      <span>0.75+ (Dense Vigorous Canopy)</span>
                    </div>
                  </div>

                  {/* EVI Slider */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300">EVI (Enhanced Vegetation)</span>
                      <span className="text-cyan-300 font-bold">{evi.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="0.8"
                      step="0.01"
                      value={evi}
                      onChange={(e) => setEvi(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                  </div>

                  {/* NDWI */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-mono">
                      <span className="text-slate-300">NDWI (Canopy Water Index)</span>
                      <span className="text-cyan-300 font-bold">{ndwi.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="0.6"
                      step="0.01"
                      value={ndwi}
                      onChange={(e) => setNdwi(parseFloat(e.target.value))}
                      className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                    />
                  </div>
                </div>

                {/* 3. Weather & Climate Dynamics Card */}
                <div className="glass-card rounded-2xl p-5 space-y-4 border border-white/10">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm">
                      <CloudRain className="w-4 h-4" />
                      <span>Weather & Atmospheric Data</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">ERA5 SYNTHESIS</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* Rainfall */}
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Droplets className="w-3 h-3 text-blue-400" />
                        Rainfall (mm)
                      </label>
                      <input
                        type="number"
                        value={rainfall}
                        onChange={(e) => setRainfall(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm font-mono text-slate-100"
                      />
                    </div>

                    {/* Temperature */}
                    <div className="space-y-1">
                      <label className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        <Sun className="w-3 h-3 text-amber-400" />
                        Avg Temp (°C)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={temp}
                        onChange={(e) => setTemp(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-sm font-mono text-slate-100"
                      />
                    </div>
                  </div>

                  {/* Humidity info badge */}
                  <div className="flex justify-between items-center text-xs font-mono text-slate-400 pt-1">
                    <span>Relative Humidity:</span>
                    <span className="text-slate-200 font-semibold">{humidity}%</span>
                  </div>
                </div>

                {/* 4. Soil & Historical Baseline */}
                <div className="glass-card rounded-2xl p-5 space-y-4 border border-white/10">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                      <Layers className="w-4 h-4" />
                      <span>Soil Health & Historical Yield</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-400">ICAR / SOIL LAB</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-mono">Soil Moisture (%)</label>
                      <input
                        type="number"
                        value={soilMoisture}
                        onChange={(e) => setSoilMoisture(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs font-mono text-slate-100"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-mono">Soil pH</label>
                      <input
                        type="number"
                        step="0.1"
                        value={soilPH}
                        onChange={(e) => setSoilPH(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs font-mono text-slate-100"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-400 font-mono">Hist. Yield (t/ha)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={historicalYield}
                        onChange={(e) => setHistoricalYield(parseFloat(e.target.value) || 0)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-1.5 text-xs font-mono text-slate-100"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit AI Prediction Button */}
                <button
                  type="submit"
                  disabled={isPredicting}
                  className="w-full py-4 rounded-xl font-bold tracking-wider font-['Space_Grotesk'] text-slate-950 bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 hover:from-amber-300 hover:to-emerald-300 shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition transform active:scale-[0.98] cursor-pointer"
                >
                  {isPredicting ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span>PROCESSING SPECTRAL MODEL...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>RUN AI YIELD PREDICTION</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* ==================================================== */}
            {/* RIGHT COLUMN (Yield Results & Visualizations) - 7 Cols */}
            {/* ==================================================== */}
            <div className="lg:col-span-7 space-y-6">
              {/* Main Prominent Predicted Yield Hero Card */}
              <div className="glass-card rounded-2xl p-6 border-2 border-amber-500/40 relative overflow-hidden glow-gold">
                <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
                <div className="absolute -left-12 -bottom-12 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      PREDICTED CROP YIELD (2026 HARVEST)
                    </span>
                    <h2 className="text-xl font-bold font-['Space_Grotesk'] text-white mt-0.5">
                      {selectedDistrict.name}, {selectedDistrict.state}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Confidence: {predictionResult.confidence}%
                    </span>
                  </div>
                </div>

                {/* Big Metric Display */}
                <div className="py-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
                  <div>
                    <div className="flex items-baseline gap-3">
                      <span className="text-6xl sm:text-7xl font-extrabold font-['Space_Grotesk'] tracking-tight text-white text-glow-gold">
                        {predictionResult.predictedYield.toFixed(2)}
                      </span>
                      <span className="text-xl font-mono text-amber-300/90 font-semibold">
                        t/ha
                      </span>
                    </div>
                    <p className="text-xs font-mono text-slate-400 mt-1">
                      (Tonnes per Hectare // Metric Quintals: {(predictionResult.predictedYield * 10).toFixed(1)} q/ha)
                    </p>
                  </div>

                  {/* Comparison vs Historical */}
                  <div className="bg-slate-900/90 border border-white/10 rounded-xl p-3.5 space-y-1">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                      Delta vs Historical Baseline
                    </span>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      <span className="text-xl font-bold font-mono text-emerald-400">
                        +{predictionResult.delta} t/ha (+{predictionResult.deltaPercent}%)
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">
                      Historical baseline: {historicalYield.toFixed(2)} t/ha
                    </span>
                  </div>
                </div>

                {/* Secondary Key Indicators Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10">
                  <div className="bg-white/5 rounded-xl p-3">
                    <span className="text-[10px] font-mono text-slate-400 block">Canopy Vigour (NDVI)</span>
                    <span className="text-base font-bold font-mono text-cyan-300 mt-0.5 block">
                      {ndvi.toFixed(2)}
                    </span>
                    <span className="text-[9px] text-emerald-400 font-mono">High Photosynthesis</span>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3">
                    <span className="text-[10px] font-mono text-slate-400 block">Crop Health Score</span>
                    <span className="text-base font-bold font-mono text-emerald-400 mt-0.5 block">
                      {predictionResult.healthScore}/100
                    </span>
                    <span className="text-[9px] text-emerald-400 font-mono">Optimal Vigour</span>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3">
                    <span className="text-[10px] font-mono text-slate-400 block">Root Moisture</span>
                    <span className="text-base font-bold font-mono text-blue-400 mt-0.5 block">
                      {soilMoisture}%
                    </span>
                    <span className="text-[9px] text-blue-300 font-mono">No Water Stress</span>
                  </div>

                  <div className="bg-white/5 rounded-xl p-3">
                    <span className="text-[10px] font-mono text-slate-400 block">Est. Harvest Window</span>
                    <span className="text-xs font-bold font-mono text-amber-300 mt-0.5 block">
                      {predictionResult.harvestDate.split(',')[0]}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">Golden Maturity</span>
                  </div>
                </div>
              </div>

              {/* Multi-Year Yield Comparison Chart */}
              <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <BarChart3 className="w-4 h-4 text-amber-400" />
                    <span>Historical vs Predicted Yield Trajectory (t/ha)</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-400">
                    2021 – 2026 Forecast
                  </span>
                </div>

                <div className="h-44 flex items-end justify-between gap-3 pt-4 px-2">
                  {selectedDistrict.history.map((item) => {
                    const isCurrentForecast = item.year === 2026;
                    const maxYield = 5.5;
                    const heightPercent = (item.yield / maxYield) * 100;

                    return (
                      <div key={item.year} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                        <span className="text-[11px] font-mono font-bold text-slate-200">
                          {isCurrentForecast ? predictionResult.predictedYield.toFixed(2) : item.yield.toFixed(2)}
                        </span>
                        <div className="w-full max-w-[48px] bg-slate-800 rounded-t-lg relative overflow-hidden flex flex-col justify-end" style={{ height: `${heightPercent}%` }}>
                          <div
                            className={`w-full rounded-t-lg ${
                              isCurrentForecast
                                ? 'h-full bg-gradient-to-t from-amber-500 to-emerald-400 shadow-lg shadow-amber-500/30'
                                : 'h-full bg-slate-600/80 hover:bg-slate-500/80 transition'
                            }`}
                          />
                        </div>
                        <span
                          className={`text-[10px] font-mono ${
                            isCurrentForecast ? 'text-amber-400 font-bold' : 'text-slate-400'
                          }`}
                        >
                          {item.year}
                          {isCurrentForecast ? ' (AI)' : ''}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* NDVI Phenological Growth Stage Timeline */}
              <div className="glass-card rounded-2xl p-5 border border-white/10 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-3">
                  <div className="flex items-center gap-2 text-white font-semibold text-sm">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <span>NDVI Phenological Progression Curve</span>
                  </div>
                  <span className="text-[11px] font-mono text-cyan-400">
                    SATELLITE VEGETATION INDEX
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
                  {selectedDistrict.ndviTrend.map((stage) => (
                    <div
                      key={stage.stage}
                      className="bg-slate-900/80 rounded-xl p-3 border border-white/5 space-y-1.5"
                    >
                      <span className="text-[10px] font-mono text-slate-400 block line-clamp-1">
                        {stage.stage}
                      </span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-sm font-bold font-mono text-cyan-300">
                          {stage.ndvi.toFixed(2)}
                        </span>
                        <span className="text-[9px] font-mono text-slate-500">
                          Opt: {stage.optimal}
                        </span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-cyan-400 h-full rounded-full"
                          style={{ width: `${(stage.ndvi / 0.9) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Advisory & Precision Insights */}
              <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900/60 to-amber-950/40 rounded-2xl p-5 border border-emerald-500/20 space-y-3">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-mono font-bold uppercase tracking-wider">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Harvest Recommendation & Agronomic Insights</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-300">
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <p>
                      <strong className="text-white">Optimal Grain Filling:</strong> Current canopy NIR reflectance indicates superior panicle density. Favorable solar radiation during ripening ensures high test weight.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <p>
                      <strong className="text-white">Moisture Management:</strong> Cease standing water irrigation 10-12 days prior to harvest to accelerate uniform ripening of golden grains.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </section>
  );
};
