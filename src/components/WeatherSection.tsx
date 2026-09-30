import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface WeatherSectionProps {
  onProgress?: (p: number) => void;
}

export const WeatherSection: React.FC<WeatherSectionProps> = ({ onProgress }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);

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

    // Multi-layered Raindrops particle system
    interface RainDrop {
      x: number;
      y: number;
      length: number;
      speed: number;
      alpha: number;
      layer: number; // 0 = distant fine mist, 1 = mid, 2 = foreground heavy streak
      thickness: number;
    }
    const raindrops: RainDrop[] = [];
    const rainCount = 450;
    for (let i = 0; i < rainCount; i++) {
      const layer = Math.random() < 0.3 ? 0 : Math.random() < 0.7 ? 1 : 2;
      raindrops.push({
        x: Math.random() * (width + 200) - 100,
        y: Math.random() * height,
        length: layer === 0 ? 12 : layer === 1 ? 25 : 45,
        speed: layer === 0 ? 14 : layer === 1 ? 24 : 36,
        alpha: layer === 0 ? 0.25 : layer === 1 ? 0.5 : 0.85,
        thickness: layer === 0 ? 0.8 : layer === 1 ? 1.5 : 2.2,
        layer,
      });
    }

    // Cloud volumetric clusters
    interface CloudBlob {
      x: number;
      y: number;
      rx: number;
      ry: number;
      speed: number;
      density: number;
    }
    const clouds: CloudBlob[] = [];
    for (let i = 0; i < 22; i++) {
      clouds.push({
        x: (Math.random() * width * 1.5) - width * 0.25,
        y: Math.random() * height * 0.55,
        rx: Math.random() * 220 + 140,
        ry: Math.random() * 110 + 60,
        speed: Math.random() * 0.4 + 0.15,
        density: Math.random() * 0.4 + 0.5,
      });
    }

    // State object scrubbed by GSAP
    const weatherState = {
      progress: 0,
      cloudDensity: 0.8,
      rainIntensity: 0,
      cameraY: 0, // descends from sky to field
      fieldReveal: 0,
      lightningFlash: 0,
      soilTransition: 0,
    };

    let tick = 0;
    let lightningBranches: { x1: number; y1: number; x2: number; y2: number; w: number }[] = [];

    const generateLightning = (startX: number, startY: number) => {
      const branches: { x1: number; y1: number; x2: number; y2: number; w: number }[] = [];
      let cx = startX;
      let cy = startY;

      while (cy < height * 0.7) {
        const ny = cy + Math.random() * 35 + 20;
        const nx = cx + (Math.random() - 0.5) * 60;
        branches.push({ x1: cx, y1: cy, x2: nx, y2: ny, w: Math.random() * 2.5 + 1.5 });

        // Occasional sub branch
        if (Math.random() < 0.45) {
          const subX = nx + (Math.random() - 0.5) * 80;
          const subY = ny + Math.random() * 40 + 15;
          branches.push({ x1: nx, y1: ny, x2: subX, y2: subY, w: 1 });
        }
        cx = nx;
        cy = ny;
      }
      return branches;
    };

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      const p = weatherState.progress;

      // Occasional natural lightning event (between 30% and 75% scroll)
      if (p > 0.28 && p < 0.75) {
        if (tick % 190 === 0 && Math.random() < 0.7) {
          weatherState.lightningFlash = 1;
          lightningBranches = generateLightning(width * 0.5 + (Math.random() - 0.5) * width * 0.6, 20);
        }
      }

      // Decay lightning flash
      if (weatherState.lightningFlash > 0) {
        weatherState.lightningFlash = Math.max(0, weatherState.lightningFlash - 0.08);
      }

      const flash = weatherState.lightningFlash;

      // 1. Storm Sky Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (flash > 0.1) {
        // Lightning illumination
        skyGrad.addColorStop(0, `rgba(186, 210, 245, ${0.4 + flash * 0.6})`);
        skyGrad.addColorStop(0.5, `rgba(90, 115, 150, ${0.3 + flash * 0.5})`);
        skyGrad.addColorStop(1, `rgba(20, 35, 55, ${0.2 + flash * 0.4})`);
      } else {
        // Dark storm sky
        skyGrad.addColorStop(0, '#0a1018');
        skyGrad.addColorStop(0.4, '#141d2b');
        skyGrad.addColorStop(0.8, '#1e293b');
        skyGrad.addColorStop(1, '#0f172a');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Volumetric Storm Clouds
      for (let c of clouds) {
        c.x = (c.x + c.speed + width * 1.5) % (width * 1.5) - width * 0.25;
        const cloudY = c.y - weatherState.cameraY * 0.6;

        const cGrad = ctx.createRadialGradient(c.x, cloudY, 10, c.x, cloudY, c.rx);
        if (flash > 0.2) {
          cGrad.addColorStop(0, `rgba(220, 235, 255, ${c.density * (0.6 + flash * 0.4)})`);
          cGrad.addColorStop(0.6, `rgba(130, 155, 185, ${c.density * 0.5})`);
          cGrad.addColorStop(1, 'rgba(30, 45, 65, 0)');
        } else {
          cGrad.addColorStop(0, `rgba(55, 65, 81, ${c.density * 0.85})`);
          cGrad.addColorStop(0.5, `rgba(30, 41, 59, ${c.density * 0.7})`);
          cGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
        }
        ctx.fillStyle = cGrad;
        ctx.beginPath();
        ctx.ellipse(c.x, cloudY, c.rx, c.ry, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Lightning Branch Strokes
      if (flash > 0.05 && lightningBranches.length > 0) {
        ctx.save();
        ctx.strokeStyle = `rgba(255, 255, 255, ${flash})`;
        ctx.shadowColor = '#60a5fa';
        ctx.shadowBlur = 20 * flash;

        for (let b of lightningBranches) {
          ctx.lineWidth = b.w * flash * 1.5;
          ctx.beginPath();
          ctx.moveTo(b.x1, b.y1 - weatherState.cameraY * 0.5);
          ctx.lineTo(b.x2, b.y2 - weatherState.cameraY * 0.5);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 4. Agricultural Field Reveal Below (Green Rice Fields & Terraces)
      if (weatherState.fieldReveal > 0.02) {
        ctx.save();
        const fieldY = height * 0.45 - (weatherState.cameraY - height * 0.3) * 0.9;
        const fieldHeight = height * 1.2;

        // Base field gradient with wet sheen
        const fieldGrad = ctx.createLinearGradient(0, fieldY, 0, fieldY + fieldHeight);
        fieldGrad.addColorStop(0, flash > 0.2 ? '#2d6a4f' : '#143621');
        fieldGrad.addColorStop(0.4, flash > 0.2 ? '#40916c' : '#1b4332');
        fieldGrad.addColorStop(0.8, flash > 0.2 ? '#52b788' : '#2d6a4f');
        fieldGrad.addColorStop(1, '#081c15');

        ctx.fillStyle = fieldGrad;
        ctx.beginPath();
        // Perspective horizon line
        ctx.moveTo(0, fieldY);
        ctx.lineTo(width, fieldY);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();

        // Field Plots / Paddy Bunds / Terrace Curves
        ctx.strokeStyle = flash > 0.2 ? 'rgba(74, 222, 128, 0.4)' : 'rgba(16, 185, 129, 0.25)';
        ctx.lineWidth = 2;

        const numRows = 16;
        for (let r = 0; r < numRows; r++) {
          const rowProgress = r / numRows;
          const y = fieldY + Math.pow(rowProgress, 1.6) * (height - fieldY + 200);
          const curveDepth = Math.sin(rowProgress * Math.PI) * 40;

          ctx.beginPath();
          ctx.moveTo(-50, y);
          ctx.bezierCurveTo(
            width * 0.3,
            y + curveDepth,
            width * 0.7,
            y - curveDepth * 0.5,
            width + 50,
            y + curveDepth * 0.8
          );
          ctx.stroke();

          // Paddy Crop Tufts along rows (dense green vegetation)
          if (y > height * 0.4 && y < height + 80) {
            const tuftCount = Math.floor(width / (40 - rowProgress * 25));
            const tuftHeight = (8 + rowProgress * 32) * (1 + p * 0.4);

            for (let t = 0; t < tuftCount; t++) {
              const tx = (t / tuftCount) * width + ((r % 2) * 15);
              const plantColor = flash > 0.3 ? '#86efac' : '#22c55e';

              ctx.strokeStyle = plantColor;
              ctx.lineWidth = 1.2 + rowProgress * 1.5;

              // 3-blade rice sprout tuft
              ctx.beginPath();
              ctx.moveTo(tx, y);
              ctx.lineTo(tx - 4, y - tuftHeight);
              ctx.moveTo(tx, y);
              ctx.lineTo(tx + (Math.sin(tick * 0.05 + t) * 3), y - tuftHeight * 1.15);
              ctx.moveTo(tx, y);
              ctx.lineTo(tx + 5, y - tuftHeight * 0.9);
              ctx.stroke();
            }
          }
        }

        // Wet Water Reflection on Ground
        const wetGrad = ctx.createLinearGradient(0, height * 0.6, 0, height);
        wetGrad.addColorStop(0, 'rgba(56, 189, 248, 0.08)');
        wetGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.15)');
        wetGrad.addColorStop(1, 'rgba(6, 78, 59, 0.3)');
        ctx.fillStyle = wetGrad;
        ctx.fillRect(0, height * 0.6, width, height * 0.4);

        ctx.restore();
      }

      // 5. Realistic Falling Rain Simulation
      if (weatherState.rainIntensity > 0.05) {
        ctx.save();
        const windSlant = 6; // wind-driven slant angle

        for (let r of raindrops) {
          r.y += r.speed;
          r.x += windSlant * (r.speed / 20);

          if (r.y > height + 50) {
            r.y = -50;
            r.x = Math.random() * (width + 200) - 100;
          }

          const currentAlpha = r.alpha * weatherState.rainIntensity * (flash > 0.2 ? 1.4 : 1);
          ctx.strokeStyle = `rgba(200, 225, 255, ${Math.min(1, currentAlpha)})`;
          ctx.lineWidth = r.thickness;
          ctx.lineCap = 'round';

          ctx.beginPath();
          ctx.moveTo(r.x, r.y);
          ctx.lineTo(r.x - windSlant * (r.length / 15), r.y - r.length);
          ctx.stroke();

          // Rain splash ripple on ground
          if (r.y > height * 0.75 && Math.random() < 0.2) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${currentAlpha * 0.4})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(r.x, r.y, 6, 2, 0, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // 6. Underground Transition Overlay (Descending to Soil)
      if (weatherState.soilTransition > 0.01) {
        const soilAlpha = weatherState.soilTransition;
        const soilGrad = ctx.createLinearGradient(0, height * (1 - soilAlpha), 0, height);
        soilGrad.addColorStop(0, 'rgba(41, 24, 14, 0)');
        soilGrad.addColorStop(0.3, `rgba(56, 32, 18, ${soilAlpha * 0.8})`);
        soilGrad.addColorStop(1, `rgba(28, 16, 9, ${soilAlpha})`);
        ctx.fillStyle = soilGrad;
        ctx.fillRect(0, 0, width, height);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // GSAP ScrollTrigger Scrubbing Timeline
    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: '+=190%',
      pin: true,
      scrub: 1.2,
      onUpdate: (self) => {
        const p = self.progress;
        weatherState.progress = p;
        if (onProgress) onProgress(p);

        // Sequence:
        // 0.00 - 0.25: Atmospheric entry & dark storm clouds condensing
        // 0.25 - 0.55: Heavy precipitation onset, lightning events
        // 0.55 - 0.80: Camera breaks through clouds, reveals lush green paddy landscape drenched in rain
        // 0.80 - 1.00: Camera zooms into a specific field patch and dips down toward soil

        if (p < 0.25) {
          const sub = p / 0.25;
          weatherState.rainIntensity = sub * 0.7;
          weatherState.cameraY = sub * 60;
          weatherState.fieldReveal = 0;
          weatherState.soilTransition = 0;
        } else if (p < 0.55) {
          const sub = (p - 0.25) / 0.3;
          weatherState.rainIntensity = 0.7 + sub * 0.3;
          weatherState.cameraY = 60 + sub * 120;
          weatherState.fieldReveal = sub * 0.7;
          weatherState.soilTransition = 0;
        } else if (p < 0.8) {
          const sub = (p - 0.55) / 0.25;
          weatherState.rainIntensity = 1;
          weatherState.cameraY = 180 + sub * 200;
          weatherState.fieldReveal = 0.7 + sub * 0.3;
          weatherState.soilTransition = 0;
        } else {
          const sub = (p - 0.8) / 0.2;
          weatherState.rainIntensity = 1 - sub * 0.4;
          weatherState.cameraY = 380 + sub * 300;
          weatherState.fieldReveal = 1;
          weatherState.soilTransition = sub;
        }

        // Minimal Label Opacity
        if (labelRef.current) {
          if (p < 0.12) {
            labelRef.current.style.opacity = '0';
          } else if (p < 0.78) {
            const op = Math.min(1, (p - 0.12) / 0.15);
            labelRef.current.style.opacity = op.toString();
          } else {
            const op = Math.max(0, 1 - (p - 0.78) / 0.15);
            labelRef.current.style.opacity = op.toString();
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
      className="relative w-full h-screen overflow-hidden bg-[#0a1018] select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Minimalistic Atmospheric Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-16 z-10">
        <div className="flex justify-between items-center text-xs tracking-[0.3em] font-mono text-cyan-400/70 uppercase">
          <span>STAGE 03 // HYDRO-METEOROLOGY</span>
          <span>PRECIPITATION: 842 MM // DENSE CLOUD CEILING</span>
        </div>

        {/* Minimal Text Label */}
        <div
          ref={labelRef}
          className="flex flex-col items-center justify-center text-center space-y-2 my-auto opacity-0 transition-opacity duration-300"
        >
          <h2 className="text-4xl md:text-6xl font-light tracking-[0.35em] text-white font-['Space_Grotesk'] text-glow-cyan">
            WEATHER
          </h2>
          <span className="text-xs md:text-sm tracking-[0.5em] text-cyan-300/80 font-mono uppercase">
            EVERY DROP MATTERS // BIOMASS ACCELERATION
          </span>
        </div>

        <div className="flex justify-between items-end text-xs tracking-widest font-mono text-slate-500">
          <span>RELATIVE HUMIDITY: 78%</span>
          <span>SOIL INFILTRATION OPTIMAL</span>
        </div>
      </div>
    </section>
  );
};
