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
    const ctx = canvas.getContext('2d', { alpha: false });
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

    // Multi-Layered Motion-Blurred Raindrops System
    interface RainDrop {
      x: number;
      y: number;
      length: number;
      speed: number;
      alpha: number;
      layer: number; // 0 = background mist, 1 = midground, 2 = heavy foreground
      thickness: number;
    }
    const raindrops: RainDrop[] = [];
    const rainCount = 550;
    for (let i = 0; i < rainCount; i++) {
      const layer = Math.random() < 0.35 ? 0 : Math.random() < 0.75 ? 1 : 2;
      raindrops.push({
        x: Math.random() * (width + 300) - 150,
        y: Math.random() * height,
        length: layer === 0 ? 16 : layer === 1 ? 32 : 55,
        speed: layer === 0 ? 18 : layer === 1 ? 28 : 42,
        alpha: layer === 0 ? 0.3 : layer === 1 ? 0.6 : 0.9,
        thickness: layer === 0 ? 0.9 : layer === 1 ? 1.6 : 2.4,
        layer,
      });
    }

    // Volumetric Cloud Cells
    interface CloudCell {
      x: number;
      y: number;
      rx: number;
      ry: number;
      speed: number;
      density: number;
      darkness: number;
    }
    const clouds: CloudCell[] = [];
    for (let i = 0; i < 26; i++) {
      clouds.push({
        x: Math.random() * width * 1.6 - width * 0.3,
        y: Math.random() * height * 0.6,
        rx: Math.random() * 260 + 160,
        ry: Math.random() * 130 + 70,
        speed: Math.random() * 0.35 + 0.1,
        density: Math.random() * 0.35 + 0.65,
        darkness: Math.random() * 0.4 + 0.6,
      });
    }

    // State object scrubbed by GSAP
    const weatherState = {
      progress: 0,
      rainIntensity: 0,
      cameraY: 0,
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

      while (cy < height * 0.75) {
        const ny = cy + Math.random() * 38 + 22;
        const nx = cx + (Math.random() - 0.5) * 70;
        branches.push({ x1: cx, y1: cy, x2: nx, y2: ny, w: Math.random() * 3 + 2 });

        if (Math.random() < 0.5) {
          const subX = nx + (Math.random() - 0.5) * 90;
          const subY = ny + Math.random() * 45 + 20;
          branches.push({ x1: nx, y1: ny, x2: subX, y2: subY, w: 1.2 });
        }
        cx = nx;
        cy = ny;
      }
      return branches;
    };

    const render = () => {
      tick++;
      const p = weatherState.progress;

      // Realistic Lightning Flash Events (between 25% and 75% scroll)
      if (p > 0.25 && p < 0.75) {
        if (tick % 210 === 0 && Math.random() < 0.75) {
          weatherState.lightningFlash = 1;
          lightningBranches = generateLightning(width * 0.5 + (Math.random() - 0.5) * width * 0.6, 20);
        }
      }

      if (weatherState.lightningFlash > 0) {
        weatherState.lightningFlash = Math.max(0, weatherState.lightningFlash - 0.07);
      }

      const flash = weatherState.lightningFlash;

      // 1. Dark Atmospheric Storm Sky
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      if (flash > 0.1) {
        skyGrad.addColorStop(0, `rgba(215, 230, 255, ${0.45 + flash * 0.55})`);
        skyGrad.addColorStop(0.5, `rgba(110, 135, 175, ${0.35 + flash * 0.45})`);
        skyGrad.addColorStop(1, `rgba(30, 48, 75, ${0.25 + flash * 0.35})`);
      } else {
        skyGrad.addColorStop(0, '#060a10');
        skyGrad.addColorStop(0.35, '#0e1624');
        skyGrad.addColorStop(0.75, '#182438');
        skyGrad.addColorStop(1, '#0c1420');
      }
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // 2. Volumetric Storm Clouds
      for (let c of clouds) {
        c.x = (c.x + c.speed + width * 1.6) % (width * 1.6) - width * 0.3;
        const cloudY = c.y - weatherState.cameraY * 0.65;

        const cGrad = ctx.createRadialGradient(c.x, cloudY, 15, c.x, cloudY, c.rx);
        if (flash > 0.2) {
          cGrad.addColorStop(0, `rgba(235, 245, 255, ${c.density * (0.65 + flash * 0.35)})`);
          cGrad.addColorStop(0.6, `rgba(145, 170, 205, ${c.density * 0.5})`);
          cGrad.addColorStop(1, 'rgba(30, 45, 65, 0)');
        } else {
          cGrad.addColorStop(0, `rgba(45, 55, 72, ${c.density * 0.9})`);
          cGrad.addColorStop(0.5, `rgba(24, 32, 47, ${c.density * 0.75})`);
          cGrad.addColorStop(1, 'rgba(10, 16, 26, 0)');
        }
        ctx.fillStyle = cGrad;
        ctx.beginPath();
        ctx.ellipse(c.x, cloudY, c.rx, c.ry, 0, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Lightning Channels & Atmospheric Glow
      if (flash > 0.05 && lightningBranches.length > 0) {
        ctx.save();
        ctx.strokeStyle = `rgba(255, 255, 255, ${flash})`;
        ctx.shadowColor = '#93c5fd';
        ctx.shadowBlur = 25 * flash;

        for (let b of lightningBranches) {
          ctx.lineWidth = b.w * flash * 1.6;
          ctx.beginPath();
          ctx.moveTo(b.x1, b.y1 - weatherState.cameraY * 0.5);
          ctx.lineTo(b.x2, b.y2 - weatherState.cameraY * 0.5);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 4. Agricultural Landscape Reveal (Lush Rain-Drenched Terraces)
      if (weatherState.fieldReveal > 0.02) {
        ctx.save();
        const fieldY = height * 0.42 - (weatherState.cameraY - height * 0.3) * 0.95;
        const fieldHeight = height * 1.3;

        const fieldGrad = ctx.createLinearGradient(0, fieldY, 0, fieldY + fieldHeight);
        fieldGrad.addColorStop(0, flash > 0.2 ? '#2d6a4f' : '#0f2918');
        fieldGrad.addColorStop(0.35, flash > 0.2 ? '#40916c' : '#143d24');
        fieldGrad.addColorStop(0.7, flash > 0.2 ? '#52b788' : '#1b5230');
        fieldGrad.addColorStop(1, '#07170c');

        ctx.fillStyle = fieldGrad;
        ctx.beginPath();
        ctx.moveTo(0, fieldY);
        ctx.lineTo(width, fieldY);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();

        // Field Terraces & Contour Bunds
        ctx.strokeStyle = flash > 0.2 ? 'rgba(134, 239, 172, 0.45)' : 'rgba(34, 197, 94, 0.22)';
        ctx.lineWidth = 2.2;

        const numRows = 18;
        for (let r = 0; r < numRows; r++) {
          const rowProgress = r / numRows;
          const y = fieldY + Math.pow(rowProgress, 1.65) * (height - fieldY + 220);
          const curveDepth = Math.sin(rowProgress * Math.PI) * 45;

          ctx.beginPath();
          ctx.moveTo(-50, y);
          ctx.bezierCurveTo(
            width * 0.32,
            y + curveDepth,
            width * 0.68,
            y - curveDepth * 0.6,
            width + 50,
            y + curveDepth * 0.75
          );
          ctx.stroke();

          // Dense Rice Crop Tufts along terrace rows
          if (y > height * 0.38 && y < height + 90) {
            const tuftCount = Math.floor(width / (38 - rowProgress * 24));
            const tuftHeight = (10 + rowProgress * 36) * (1 + p * 0.35);

            for (let t = 0; t < tuftCount; t++) {
              const tx = (t / tuftCount) * width + ((r % 2) * 16);
              const plantColor = flash > 0.3 ? '#86efac' : '#22c55e';

              ctx.strokeStyle = plantColor;
              ctx.lineWidth = 1.3 + rowProgress * 1.6;

              ctx.beginPath();
              ctx.moveTo(tx, y);
              ctx.lineTo(tx - 5, y - tuftHeight * 0.85);
              ctx.moveTo(tx, y);
              ctx.lineTo(tx + Math.sin(tick * 0.05 + t) * 4, y - tuftHeight);
              ctx.moveTo(tx, y);
              ctx.lineTo(tx + 6, y - tuftHeight * 0.9);
              ctx.stroke();
            }
          }
        }

        // Wet Standing Water Sheen Reflecting Rain
        const wetGrad = ctx.createLinearGradient(0, height * 0.55, 0, height);
        wetGrad.addColorStop(0, 'rgba(56, 189, 248, 0.09)');
        wetGrad.addColorStop(0.5, 'rgba(16, 185, 129, 0.16)');
        wetGrad.addColorStop(1, 'rgba(4, 47, 46, 0.35)');
        ctx.fillStyle = wetGrad;
        ctx.fillRect(0, height * 0.55, width, height * 0.45);

        ctx.restore();
      }

      // 5. Realistic Falling Rain Simulation with Depth & Slant
      if (weatherState.rainIntensity > 0.05) {
        ctx.save();
        const windSlant = 7;

        for (let r of raindrops) {
          r.y += r.speed;
          r.x += windSlant * (r.speed / 20);

          if (r.y > height + 50) {
            r.y = -50;
            r.x = Math.random() * (width + 300) - 150;
          }

          const currentAlpha = r.alpha * weatherState.rainIntensity * (flash > 0.2 ? 1.4 : 1);
          ctx.strokeStyle = `rgba(215, 235, 255, ${Math.min(1, currentAlpha)})`;
          ctx.lineWidth = r.thickness;
          ctx.lineCap = 'round';

          ctx.beginPath();
          ctx.moveTo(r.x, r.y);
          ctx.lineTo(r.x - windSlant * (r.length / 15), r.y - r.length);
          ctx.stroke();

          // Droplet Splash Rings on Water/Soil
          if (r.y > height * 0.72 && Math.random() < 0.25) {
            ctx.strokeStyle = `rgba(255, 255, 255, ${currentAlpha * 0.45})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.ellipse(r.x, r.y, 7, 2.5, 0, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
        ctx.restore();
      }

      // 6. Underground Transition to Soil
      if (weatherState.soilTransition > 0.01) {
        const soilAlpha = weatherState.soilTransition;
        const soilGrad = ctx.createLinearGradient(0, height * (1 - soilAlpha), 0, height);
        soilGrad.addColorStop(0, 'rgba(41, 24, 14, 0)');
        soilGrad.addColorStop(0.35, `rgba(56, 32, 18, ${soilAlpha * 0.85})`);
        soilGrad.addColorStop(1, `rgba(24, 14, 8, ${soilAlpha})`);
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
      className="relative w-full h-screen overflow-hidden bg-[#060a10] select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Atmospheric Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-16 z-10">
        <div className="flex justify-between items-center text-xs tracking-[0.3em] font-mono text-cyan-400/70 uppercase">
          <span>STAGE 03 // HYDRO-METEOROLOGY</span>
          <span>PRECIPITATION: 842 MM // DENSE CLOUD CEILING</span>
        </div>

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
