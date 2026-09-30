import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SoilSectionProps {
  onProgress?: (p: number) => void;
}

export const SoilSection: React.FC<SoilSectionProps> = ({ onProgress }) => {
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

    // Soil particles & organic matter aggregates
    interface SoilParticle {
      x: number;
      y: number;
      radius: number;
      color: string;
      moisture: boolean;
    }
    const soilParticles: SoilParticle[] = [];
    const colors = ['#23150c', '#331d10', '#422616', '#52301c', '#180e07', '#3d2514'];
    for (let i = 0; i < 400; i++) {
      soilParticles.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.7 + height * 0.3,
        radius: Math.random() * 5 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        moisture: Math.random() < 0.25,
      });
    }

    // Scrubbed state controlled by GSAP
    const growthState = {
      progress: 0,
      rootProgress: 0, // 0 to 1
      stemProgress: 0, // 0 to 1
      leafProgress: 0, // 0 to 1
      cameraPullback: 0, // 0 to 1 (1 plant -> multi -> rows -> field)
      cameraY: 0,
    };

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      const p = growthState.progress;
      const pullback = growthState.cameraPullback;

      // Ground Surface Line Y coordinate (shifts down as camera follows growth upward)
      const surfaceY = height * 0.48 + growthState.cameraY;
      const seedX = width * 0.5;
      const seedY = surfaceY + 110; // Seed rests in root zone

      // 1. Dual Environment Background (Daylight Sky/Air Above, Rich Soil Strata Below)
      // Air / Atmosphere Above Ground
      const skyGrad = ctx.createLinearGradient(0, 0, 0, surfaceY);
      skyGrad.addColorStop(0, '#0c1a24');
      skyGrad.addColorStop(0.6, '#132838');
      skyGrad.addColorStop(1, '#1b3b2b');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, Math.max(0, surfaceY));

      // Sun / Ambient Daylight Glow above
      if (surfaceY > 0) {
        const sunGlow = ctx.createRadialGradient(
          width * 0.5,
          surfaceY - 200,
          10,
          width * 0.5,
          surfaceY - 200,
          350
        );
        sunGlow.addColorStop(0, 'rgba(254, 240, 138, 0.35)');
        sunGlow.addColorStop(0.5, 'rgba(187, 247, 208, 0.15)');
        sunGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = sunGlow;
        ctx.fillRect(0, 0, width, surfaceY);
      }

      // Soil Subterranean Strata Below Ground
      const soilGrad = ctx.createLinearGradient(0, surfaceY, 0, height);
      soilGrad.addColorStop(0, '#3a2213'); // Humus rich topsoil
      soilGrad.addColorStop(0.2, '#2c190d');
      soilGrad.addColorStop(0.5, '#1e1108'); // Dense moist loam
      soilGrad.addColorStop(1, '#0e0804'); // Subsoil bedrock
      ctx.fillStyle = soilGrad;
      ctx.fillRect(0, Math.max(0, surfaceY), width, height - Math.max(0, surfaceY));

      // Surface Soil Crust & Mulch Texture Line
      ctx.strokeStyle = '#4a2c19';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, surfaceY);
      for (let x = 0; x < width; x += 20) {
        ctx.lineTo(x, surfaceY + Math.sin(x * 0.05) * 4);
      }
      ctx.stroke();

      // Soil Particles & Moisture Droplets
      for (let pt of soilParticles) {
        const py = pt.y + growthState.cameraY * 0.6;
        if (py > surfaceY && py < height + 20) {
          ctx.fillStyle = pt.color;
          ctx.beginPath();
          ctx.arc(pt.x, py, pt.radius, 0, Math.PI * 2);
          ctx.fill();

          // Moisture Gleam
          if (pt.moisture) {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
            ctx.beginPath();
            ctx.arc(pt.x - 1, py - 1, pt.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // ==========================================
      // 2. ROOT & PLANT GROWTH (Procedural Drawing)
      // ==========================================
      if (pullback < 0.85) {
        ctx.save();

        // 2a. The Rice Seed (Golden/Amber Husk)
        if (p < 0.75) {
          ctx.save();
          ctx.translate(seedX, seedY);
          ctx.rotate(Math.PI * 0.15);

          // Seed Husk
          const seedGrad = ctx.createLinearGradient(-14, -6, 14, 6);
          seedGrad.addColorStop(0, '#b45309');
          seedGrad.addColorStop(0.4, '#f59e0b');
          seedGrad.addColorStop(0.8, '#d97706');
          seedGrad.addColorStop(1, '#78350f');

          ctx.fillStyle = seedGrad;
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.ellipse(0, 0, 14, 6.5, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Seed Longitudinal Ridge
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
          ctx.beginPath();
          ctx.moveTo(-12, 0);
          ctx.lineTo(12, 0);
          ctx.stroke();
          ctx.restore();
        }

        // 2b. DOWNWARD ROOTS NETWORK (Organic branching)
        if (growthState.rootProgress > 0.05) {
          const rProg = growthState.rootProgress;
          ctx.save();
          ctx.strokeStyle = '#fef08a'; // Organic pale cream root
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          // Taproot (Main primary root extending deep)
          const maxRootDepth = 170;
          const rootDepth = maxRootDepth * rProg;

          ctx.lineWidth = 3.5 * Math.max(0.5, 1 - rProg * 0.3);
          ctx.beginPath();
          ctx.moveTo(seedX, seedY);

          const rSegs = 8;
          for (let s = 1; s <= rSegs; s++) {
            const segProg = s / rSegs;
            if (segProg > rProg) break;
            const targetY = seedY + (rootDepth / rSegs) * s;
            const targetX = seedX + Math.sin(s * 1.3) * (12 * segProg);
            ctx.lineTo(targetX, targetY);
          }
          ctx.stroke();

          // Lateral Secondary Roots & Fine Root Hairs
          if (rProg > 0.25) {
            const latProg = (rProg - 0.25) / 0.75;
            ctx.lineWidth = 1.6;
            ctx.strokeStyle = 'rgba(254, 240, 138, 0.85)';

            const numLaterals = 7;
            for (let l = 1; l <= numLaterals; l++) {
              const lStartProg = l / (numLaterals + 1);
              if (lStartProg > rProg) continue;

              const ly = seedY + rootDepth * lStartProg * 0.8;
              const lx = seedX + Math.sin(l * 1.3) * 8;
              const side = l % 2 === 0 ? 1 : -1;
              const latLen = (35 + l * 8) * latProg;

              ctx.beginPath();
              ctx.moveTo(lx, ly);
              ctx.quadraticCurveTo(
                lx + side * latLen * 0.5,
                ly + 10,
                lx + side * latLen,
                ly + 25 + Math.sin(l) * 10
              );
              ctx.stroke();

              // Tertiary fine hairs
              if (latProg > 0.5) {
                ctx.lineWidth = 0.8;
                ctx.strokeStyle = 'rgba(254, 240, 138, 0.55)';
                ctx.beginPath();
                ctx.moveTo(lx + side * latLen * 0.6, ly + 15);
                ctx.lineTo(lx + side * (latLen * 0.6 + 14), ly + 28);
                ctx.stroke();
              }
            }
          }
          ctx.restore();
        }

        // 2c. UPWARD STEM & SAPLING (Breaking through soil surface)
        if (growthState.stemProgress > 0.05) {
          const sProg = growthState.stemProgress;
          ctx.save();

          // Vibrant Rice Shoot Green Gradient
          const stemGrad = ctx.createLinearGradient(0, seedY, 0, surfaceY - 140);
          stemGrad.addColorStop(0, '#ca8a04'); // Pale yellow-green at seed base
          stemGrad.addColorStop(0.3, '#65a30d');
          stemGrad.addColorStop(0.7, '#22c55e');
          stemGrad.addColorStop(1, '#4ade80');

          ctx.strokeStyle = stemGrad;
          ctx.lineWidth = 5;
          ctx.lineCap = 'round';

          // Stem extends from seed (seedY) up to daylight (surfaceY - height)
          const totalStemHeight = (seedY - surfaceY) + 140; // breaks 140px above surface
          const currentStemHeight = totalStemHeight * sProg;
          const stemTipY = seedY - currentStemHeight;

          ctx.beginPath();
          ctx.moveTo(seedX, seedY);
          ctx.quadraticCurveTo(
            seedX - 6,
            seedY - currentStemHeight * 0.5,
            seedX + Math.sin(tick * 0.04) * 3,
            stemTipY
          );
          ctx.stroke();

          // 2d. TRUE LEAVES UNFOLDING (Once stem breaks ground)
          if (stemTipY < surfaceY && growthState.leafProgress > 0.05) {
            const lProg = growthState.leafProgress;

            // First Leaf (Curving Left)
            ctx.save();
            ctx.translate(seedX, stemTipY + 20);
            ctx.rotate(-0.4 - lProg * 0.6);

            const leaf1Len = 65 * lProg;
            const leaf1W = 14 * lProg;

            const leafGrad = ctx.createLinearGradient(0, 0, leaf1Len, -leaf1W);
            leafGrad.addColorStop(0, '#15803d');
            leafGrad.addColorStop(0.5, '#22c55e');
            leafGrad.addColorStop(1, '#86efac');

            ctx.fillStyle = leafGrad;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(leaf1Len * 0.5, -leaf1W * 1.5, leaf1Len, 0);
            ctx.quadraticCurveTo(leaf1Len * 0.5, leaf1W * 0.8, 0, 0);
            ctx.closePath();
            ctx.fill();

            // Leaf midrib vein
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(leaf1Len, 0);
            ctx.stroke();
            ctx.restore();

            // Second Leaf (Curving Right)
            if (lProg > 0.25) {
              const l2Prog = (lProg - 0.25) / 0.75;
              ctx.save();
              ctx.translate(seedX + 2, stemTipY + 35);
              ctx.rotate(0.3 + l2Prog * 0.7);

              const leaf2Len = 58 * l2Prog;
              const leaf2W = 12 * l2Prog;

              ctx.fillStyle = leafGrad;
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.quadraticCurveTo(leaf2Len * 0.5, -leaf2W * 1.4, leaf2Len, 0);
              ctx.quadraticCurveTo(leaf2Len * 0.5, leaf2W * 0.7, 0, 0);
              ctx.closePath();
              ctx.fill();

              ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(leaf2Len, 0);
              ctx.stroke();
              ctx.restore();
            }

            // Third central shoot leaf
            if (lProg > 0.6) {
              const l3Prog = (lProg - 0.6) / 0.4;
              ctx.save();
              ctx.translate(seedX, stemTipY);
              ctx.rotate(Math.sin(tick * 0.05) * 0.05);

              const leaf3Len = 50 * l3Prog;
              const leaf3W = 10 * l3Prog;

              ctx.fillStyle = '#4ade80';
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.quadraticCurveTo(-leaf3W * 0.5, -leaf3Len * 0.6, 0, -leaf3Len);
              ctx.quadraticCurveTo(leaf3W * 0.5, -leaf3Len * 0.6, 0, 0);
              ctx.closePath();
              ctx.fill();
              ctx.restore();
            }
          }

          ctx.restore();
        }

        ctx.restore();
      }

      // ==========================================
      // 3. CAMERA PULLBACK (1 Plant -> Rows -> Vast Paddy Field)
      // ==========================================
      if (pullback > 0.05) {
        ctx.save();
        const pbAlpha = Math.min(1, pullback * 1.5);
        ctx.globalAlpha = pbAlpha;

        // Ground landscape takes over screen
        const fieldFloorY = height * 0.35 * (1 - pullback);
        const landscapeGrad = ctx.createLinearGradient(0, fieldFloorY, 0, height);
        landscapeGrad.addColorStop(0, '#14532d');
        landscapeGrad.addColorStop(0.5, '#166534');
        landscapeGrad.addColorStop(1, '#15803d');
        ctx.fillStyle = landscapeGrad;
        ctx.fillRect(0, fieldFloorY, width, height - fieldFloorY);

        // Multiple plant rows spawning with perspective
        const rows = 14;
        for (let r = 0; r < rows; r++) {
          const rowP = r / rows;
          const ry = height * 0.38 + Math.pow(rowP, 1.8) * (height * 0.6);
          const rowScale = 0.2 + rowP * 0.8;
          const plantSpacing = 28 * rowScale;
          const numPlants = Math.floor(width / plantSpacing);

          for (let np = 0; np < numPlants; np++) {
            const px = np * plantSpacing + (r % 2) * (plantSpacing * 0.5);
            const pHeight = 35 * rowScale * (1 + Math.sin(np + r) * 0.2);

            ctx.strokeStyle = '#4ade80';
            ctx.lineWidth = 1.5 * rowScale;

            // Paddy plant tuft
            ctx.beginPath();
            ctx.moveTo(px, ry);
            ctx.lineTo(px - 6 * rowScale, ry - pHeight * 0.8);
            ctx.moveTo(px, ry);
            ctx.lineTo(px + Math.sin(tick * 0.06 + np) * (5 * rowScale), ry - pHeight);
            ctx.moveTo(px, ry);
            ctx.lineTo(px + 7 * rowScale, ry - pHeight * 0.85);
            ctx.stroke();
          }
        }

        ctx.restore();
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
        growthState.progress = p;
        if (onProgress) onProgress(p);

        // Sequence:
        // 0.00 - 0.20: Seed at rest in moist soil layer
        // 0.20 - 0.45: Downward root germination, taproot & laterals anchor
        // 0.45 - 0.65: Upward stem pushes through soil crust into daylight
        // 0.65 - 0.82: True leaves uncurl & photosynthesize, camera tracks upward
        // 0.82 - 1.00: Camera pulls back rapidly: 1 sapling -> rows -> field

        if (p < 0.2) {
          growthState.rootProgress = p / 0.2 * 0.15;
          growthState.stemProgress = 0;
          growthState.leafProgress = 0;
          growthState.cameraPullback = 0;
          growthState.cameraY = 0;
        } else if (p < 0.45) {
          const sub = (p - 0.2) / 0.25;
          growthState.rootProgress = 0.15 + sub * 0.85;
          growthState.stemProgress = sub * 0.35;
          growthState.leafProgress = 0;
          growthState.cameraPullback = 0;
          growthState.cameraY = sub * 40;
        } else if (p < 0.65) {
          const sub = (p - 0.45) / 0.2;
          growthState.rootProgress = 1;
          growthState.stemProgress = 0.35 + sub * 0.65;
          growthState.leafProgress = sub * 0.45;
          growthState.cameraPullback = 0;
          growthState.cameraY = 40 + sub * 120;
        } else if (p < 0.82) {
          const sub = (p - 0.65) / 0.17;
          growthState.rootProgress = 1;
          growthState.stemProgress = 1;
          growthState.leafProgress = 0.45 + sub * 0.55;
          growthState.cameraPullback = sub * 0.25;
          growthState.cameraY = 160 + sub * 100;
        } else {
          const sub = (p - 0.82) / 0.18;
          growthState.rootProgress = 1;
          growthState.stemProgress = 1;
          growthState.leafProgress = 1;
          growthState.cameraPullback = 0.25 + sub * 0.75;
          growthState.cameraY = 260 + sub * 200;
        }

        // Minimal Text Label
        if (labelRef.current) {
          if (p < 0.1) {
            labelRef.current.style.opacity = '0';
          } else if (p < 0.78) {
            const op = Math.min(1, (p - 0.1) / 0.15);
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
      className="relative w-full h-screen overflow-hidden bg-[#0e0804] select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Minimalistic Subterranean Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-16 z-10">
        <div className="flex justify-between items-center text-xs tracking-[0.3em] font-mono text-amber-500/70 uppercase">
          <span>STAGE 04 // RHIZOSPHERE DYNAMICS</span>
          <span>SOIL PH: 6.8 // NITROGEN: 245 KG/HA</span>
        </div>

        {/* Minimal Text Label */}
        <div
          ref={labelRef}
          className="flex flex-col items-center justify-center text-center space-y-2 my-auto opacity-0 transition-opacity duration-300"
        >
          <h2 className="text-4xl md:text-6xl font-light tracking-[0.35em] text-white font-['Space_Grotesk'] text-glow-gold">
            SOIL
          </h2>
          <span className="text-xs md:text-sm tracking-[0.5em] text-amber-300/80 font-mono uppercase">
            GERMINATION & ROOTING // VASCULAR ESTABLISHMENT
          </span>
        </div>

        <div className="flex justify-between items-end text-xs tracking-widest font-mono text-slate-500">
          <span>SOIL MOISTURE: 68%</span>
          <span>ROOT EXPANSION: 18 CM/DAY</span>
        </div>
      </div>
    </section>
  );
};
