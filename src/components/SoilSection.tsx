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

    // Soil particles & organic matter aggregates
    interface SoilParticle {
      x: number;
      y: number;
      radius: number;
      color: string;
      moisture: boolean;
    }
    const soilParticles: SoilParticle[] = [];
    const colors = ['#26170d', '#361e11', '#452817', '#54321d', '#1a0f08', '#3f2615'];
    for (let i = 0; i < 450; i++) {
      soilParticles.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.75 + height * 0.25,
        radius: Math.random() * 5.5 + 1.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        moisture: Math.random() < 0.3,
      });
    }

    // Scrubbed state controlled by GSAP
    const growthState = {
      progress: 0,
      rootProgress: 0,
      stemProgress: 0,
      leafProgress: 0,
      cameraPullback: 0,
      cameraY: 0,
    };

    let tick = 0;

    const render = () => {
      tick++;
      const p = growthState.progress;
      const pullback = growthState.cameraPullback;

      const surfaceY = height * 0.48 + growthState.cameraY;
      const seedX = width * 0.5;
      const seedY = surfaceY + 115;

      // 1. Atmosphere / Daylight Above Ground
      const skyGrad = ctx.createLinearGradient(0, 0, 0, surfaceY);
      skyGrad.addColorStop(0, '#0a1720');
      skyGrad.addColorStop(0.55, '#112534');
      skyGrad.addColorStop(1, '#183828');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, Math.max(0, surfaceY));

      // Sun Ambient Light Beam Illuminating Shoot
      if (surfaceY > 0) {
        const sunGlow = ctx.createRadialGradient(
          width * 0.5,
          surfaceY - 220,
          15,
          width * 0.5,
          surfaceY - 220,
          380
        );
        sunGlow.addColorStop(0, 'rgba(254, 240, 138, 0.4)');
        sunGlow.addColorStop(0.5, 'rgba(187, 247, 208, 0.18)');
        sunGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = sunGlow;
        ctx.fillRect(0, 0, width, surfaceY);
      }

      // 2. Rich Organic Soil Strata Subterranean Layer
      const soilGrad = ctx.createLinearGradient(0, surfaceY, 0, height);
      soilGrad.addColorStop(0, '#3f2515'); // Humus topsoil
      soilGrad.addColorStop(0.18, '#2e1b0e');
      soilGrad.addColorStop(0.5, '#1e1108'); // Dark moist clay loam
      soilGrad.addColorStop(1, '#0e0703'); // Bedrock substrata
      ctx.fillStyle = soilGrad;
      ctx.fillRect(0, Math.max(0, surfaceY), width, height - Math.max(0, surfaceY));

      // Surface Soil Crust Mulch Line
      ctx.strokeStyle = '#54321d';
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.moveTo(0, surfaceY);
      for (let x = 0; x < width; x += 18) {
        ctx.lineTo(x, surfaceY + Math.sin(x * 0.05) * 4);
      }
      ctx.stroke();

      // Soil Particles & Capillary Water Beads
      for (let pt of soilParticles) {
        const py = pt.y + growthState.cameraY * 0.6;
        if (py > surfaceY && py < height + 20) {
          ctx.fillStyle = pt.color;
          ctx.beginPath();
          ctx.arc(pt.x, py, pt.radius, 0, Math.PI * 2);
          ctx.fill();

          if (pt.moisture) {
            ctx.fillStyle = 'rgba(56, 189, 248, 0.45)';
            ctx.beginPath();
            ctx.arc(pt.x - 1, py - 1, pt.radius * 0.4, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      // ==========================================
      // 3. SEED GERMINATION, ROOTING & EMERGENCE
      // ==========================================
      if (pullback < 0.85) {
        ctx.save();

        // 3a. Realistic Rice Grain Seed (Lemma & Palea Husks)
        if (p < 0.75) {
          ctx.save();
          ctx.translate(seedX, seedY);
          ctx.rotate(Math.PI * 0.14);

          const seedGrad = ctx.createLinearGradient(-15, -7, 15, 7);
          seedGrad.addColorStop(0, '#b45309');
          seedGrad.addColorStop(0.35, '#f59e0b');
          seedGrad.addColorStop(0.75, '#d97706');
          seedGrad.addColorStop(1, '#78350f');

          ctx.fillStyle = seedGrad;
          ctx.strokeStyle = '#78350f';
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.ellipse(0, 0, 15, 7, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();

          // Longitudinal husk ridges
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
          ctx.beginPath();
          ctx.moveTo(-13, 0);
          ctx.lineTo(13, 0);
          ctx.moveTo(-10, -3.5);
          ctx.lineTo(10, -3.5);
          ctx.moveTo(-10, 3.5);
          ctx.lineTo(10, 3.5);
          ctx.stroke();
          ctx.restore();
        }

        // 3b. Downward Root System (Taproot & Fine Lateral Hairs)
        if (growthState.rootProgress > 0.05) {
          const rProg = growthState.rootProgress;
          ctx.save();
          ctx.strokeStyle = '#fef08a';
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';

          const maxRootDepth = 180;
          const rootDepth = maxRootDepth * rProg;

          ctx.lineWidth = 3.6 * Math.max(0.5, 1 - rProg * 0.3);
          ctx.beginPath();
          ctx.moveTo(seedX, seedY);

          const rSegs = 8;
          for (let s = 1; s <= rSegs; s++) {
            const segProg = s / rSegs;
            if (segProg > rProg) break;
            const targetY = seedY + (rootDepth / rSegs) * s;
            const targetX = seedX + Math.sin(s * 1.3) * (14 * segProg);
            ctx.lineTo(targetX, targetY);
          }
          ctx.stroke();

          // Laterals
          if (rProg > 0.25) {
            const latProg = (rProg - 0.25) / 0.75;
            ctx.lineWidth = 1.8;
            ctx.strokeStyle = 'rgba(254, 240, 138, 0.88)';

            const numLaterals = 8;
            for (let l = 1; l <= numLaterals; l++) {
              const lStartProg = l / (numLaterals + 1);
              if (lStartProg > rProg) continue;

              const ly = seedY + rootDepth * lStartProg * 0.82;
              const lx = seedX + Math.sin(l * 1.3) * 9;
              const side = l % 2 === 0 ? 1 : -1;
              const latLen = (38 + l * 8) * latProg;

              ctx.beginPath();
              ctx.moveTo(lx, ly);
              ctx.quadraticCurveTo(
                lx + side * latLen * 0.5,
                ly + 12,
                lx + side * latLen,
                ly + 28 + Math.sin(l) * 10
              );
              ctx.stroke();

              // Fine root hairs
              if (latProg > 0.5) {
                ctx.lineWidth = 0.9;
                ctx.strokeStyle = 'rgba(254, 240, 138, 0.58)';
                ctx.beginPath();
                ctx.moveTo(lx + side * latLen * 0.6, ly + 16);
                ctx.lineTo(lx + side * (latLen * 0.6 + 15), ly + 30);
                ctx.stroke();
              }
            }
          }
          ctx.restore();
        }

        // 3c. Upward Shoot & Translucent Rice Seedling
        if (growthState.stemProgress > 0.05) {
          const sProg = growthState.stemProgress;
          ctx.save();

          const stemGrad = ctx.createLinearGradient(0, seedY, 0, surfaceY - 150);
          stemGrad.addColorStop(0, '#ca8a04');
          stemGrad.addColorStop(0.3, '#65a30d');
          stemGrad.addColorStop(0.7, '#22c55e');
          stemGrad.addColorStop(1, '#4ade80');

          ctx.strokeStyle = stemGrad;
          ctx.lineWidth = 5.2;
          ctx.lineCap = 'round';

          const totalStemHeight = seedY - surfaceY + 150;
          const currentStemHeight = totalStemHeight * sProg;
          const stemTipY = seedY - currentStemHeight;

          ctx.beginPath();
          ctx.moveTo(seedX, seedY);
          ctx.quadraticCurveTo(
            seedX - 6,
            seedY - currentStemHeight * 0.5,
            seedX + Math.sin(tick * 0.04) * 3.5,
            stemTipY
          );
          ctx.stroke();

          // 3d. True Rice Leaves Unfolding
          if (stemTipY < surfaceY && growthState.leafProgress > 0.05) {
            const lProg = growthState.leafProgress;

            // Leaf 1
            ctx.save();
            ctx.translate(seedX, stemTipY + 22);
            ctx.rotate(-0.4 - lProg * 0.6);

            const leaf1Len = 70 * lProg;
            const leaf1W = 15 * lProg;

            const leafGrad = ctx.createLinearGradient(0, 0, leaf1Len, -leaf1W);
            leafGrad.addColorStop(0, '#15803d');
            leafGrad.addColorStop(0.45, '#22c55e');
            leafGrad.addColorStop(1, '#86efac');

            ctx.fillStyle = leafGrad;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(leaf1Len * 0.5, -leaf1W * 1.5, leaf1Len, 0);
            ctx.quadraticCurveTo(leaf1Len * 0.5, leaf1W * 0.8, 0, 0);
            ctx.closePath();
            ctx.fill();

            // Midrib
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(leaf1Len, 0);
            ctx.stroke();
            ctx.restore();

            // Leaf 2
            if (lProg > 0.25) {
              const l2Prog = (lProg - 0.25) / 0.75;
              ctx.save();
              ctx.translate(seedX + 2, stemTipY + 38);
              ctx.rotate(0.3 + l2Prog * 0.7);

              const leaf2Len = 62 * l2Prog;
              const leaf2W = 13 * l2Prog;

              ctx.fillStyle = leafGrad;
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.quadraticCurveTo(leaf2Len * 0.5, -leaf2W * 1.4, leaf2Len, 0);
              ctx.quadraticCurveTo(leaf2Len * 0.5, leaf2W * 0.7, 0, 0);
              ctx.closePath();
              ctx.fill();

              ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(0, 0);
              ctx.lineTo(leaf2Len, 0);
              ctx.stroke();
              ctx.restore();
            }

            // Central Flag Leaf
            if (lProg > 0.6) {
              const l3Prog = (lProg - 0.6) / 0.4;
              ctx.save();
              ctx.translate(seedX, stemTipY);
              ctx.rotate(Math.sin(tick * 0.05) * 0.05);

              const leaf3Len = 54 * l3Prog;
              const leaf3W = 11 * l3Prog;

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
      // 4. Camera Pullback to Dense Rice Field Rows
      // ==========================================
      if (pullback > 0.05) {
        ctx.save();
        const pbAlpha = Math.min(1, pullback * 1.5);
        ctx.globalAlpha = pbAlpha;

        const fieldFloorY = height * 0.35 * (1 - pullback);
        const landscapeGrad = ctx.createLinearGradient(0, fieldFloorY, 0, height);
        landscapeGrad.addColorStop(0, '#14532d');
        landscapeGrad.addColorStop(0.5, '#166534');
        landscapeGrad.addColorStop(1, '#15803d');
        ctx.fillStyle = landscapeGrad;
        ctx.fillRect(0, fieldFloorY, width, height - fieldFloorY);

        const rows = 16;
        for (let r = 0; r < rows; r++) {
          const rowP = r / rows;
          const ry = height * 0.38 + Math.pow(rowP, 1.8) * (height * 0.6);
          const rowScale = 0.2 + rowP * 0.8;
          const plantSpacing = 28 * rowScale;
          const numPlants = Math.floor(width / plantSpacing);

          for (let np = 0; np < numPlants; np++) {
            const px = np * plantSpacing + (r % 2) * (plantSpacing * 0.5);
            const pHeight = 36 * rowScale * (1 + Math.sin(np + r) * 0.2);

            ctx.strokeStyle = '#4ade80';
            ctx.lineWidth = 1.6 * rowScale;

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

        if (p < 0.2) {
          growthState.rootProgress = (p / 0.2) * 0.15;
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
      className="relative w-full h-screen overflow-hidden bg-[#0e0703] select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Subterranean Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-16 z-10">
        <div className="flex justify-between items-center text-xs tracking-[0.3em] font-mono text-amber-500/70 uppercase">
          <span>STAGE 04 // RHIZOSPHERE DYNAMICS</span>
          <span>SOIL PH: 6.8 // NITROGEN: 245 KG/HA</span>
        </div>

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
