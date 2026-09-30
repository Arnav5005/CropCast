import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface RocketSectionProps {
  onProgress?: (p: number) => void;
}

export const RocketSection: React.FC<RocketSectionProps> = ({ onProgress }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);

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

    // Realistic Starfield with Stellar Classification Colors (Blue-white, Warm yellow, Red giants)
    const stars: {
      x: number;
      y: number;
      size: number;
      alpha: number;
      twinkleSpeed: number;
      color: string;
      scintillationPhase: number;
    }[] = [];
    const starColors = ['#f8fafc', '#93c5fd', '#fef08a', '#fdba74', '#bfdbfe'];
    for (let i = 0; i < 500; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * Math.random() * 2.2 + 0.5,
        alpha: Math.random() * 0.85 + 0.15,
        twinkleSpeed: Math.random() * 0.04 + 0.01,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        scintillationPhase: Math.random() * Math.PI * 2,
      });
    }

    // High-Fidelity Volumetric Smoke Particle Simulation
    interface FluidSmoke {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      growthRate: number;
      alpha: number;
      heat: number; // 1 = blazing fire core, 0.4 = amber glow, 0 = dense gray smoke
      rotation: number;
      rotSpeed: number;
      maxAge: number;
      age: number;
    }
    const smokeParticles: FluidSmoke[] = [];

    // Cryogenic LOX Vent Vapor Mist
    interface VaporMist {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      age: number;
      maxAge: number;
    }
    const vaporParticles: VaporMist[] = [];

    // Igniter Spark Pyrotechnics
    interface Spark {
      x: number;
      y: number;
      vx: number;
      vy: number;
      length: number;
      alpha: number;
      color: string;
    }
    const sparks: Spark[] = [];

    // Smooth scrubbed state
    const launchState = {
      progress: 0,
      ignition: 0,
      flameHeight: 0,
      rocketY: 0,
      cameraY: 0,
      shake: 0,
      padLight: 0,
    };

    let tick = 0;

    const render = () => {
      tick++;
      const p = launchState.progress;

      // 1. Cinematic Deep Night Atmosphere with Stratospheric Raymarching Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      const skyDarken = Math.max(0, 1 - p * 0.85);
      skyGrad.addColorStop(0, '#010204');
      skyGrad.addColorStop(0.4, `rgba(4, 8, 18, ${skyDarken})`);
      skyGrad.addColorStop(0.75, `rgba(10, 20, 42, ${skyDarken * 0.9})`);
      skyGrad.addColorStop(1, `rgba(16, 28, 54, ${skyDarken * 0.8})`);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Atmospheric Rayleigh scattering & distant horizon mountain silhouettes
      if (p < 0.75) {
        const horizonGrad = ctx.createLinearGradient(0, height * 0.65, 0, height);
        horizonGrad.addColorStop(0, 'rgba(12, 24, 48, 0)');
        horizonGrad.addColorStop(0.6, `rgba(28, 48, 85, ${(1 - p / 0.75) * 0.35})`);
        horizonGrad.addColorStop(1, `rgba(8, 14, 28, ${(1 - p / 0.75) * 0.8})`);
        ctx.fillStyle = horizonGrad;
        ctx.fillRect(0, height * 0.65, width, height * 0.35);

        // Distant subtle mountain ridges
        ctx.fillStyle = `rgba(5, 10, 20, ${(1 - p / 0.75) * 0.9})`;
        ctx.beginPath();
        ctx.moveTo(0, height - 120);
        ctx.lineTo(width * 0.2, height - 160);
        ctx.lineTo(width * 0.45, height - 135);
        ctx.lineTo(width * 0.75, height - 175);
        ctx.lineTo(width, height - 130);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fill();
      }

      // 2. Realistic Stars with Atmospheric Twinkle & Parallax
      for (let s of stars) {
        const twinkle = Math.sin(tick * s.twinkleSpeed + s.scintillationPhase) * 0.3 + 0.7;
        const currentAlpha = Math.max(0.05, Math.min(1, s.alpha * twinkle * (0.35 + p * 0.65)));
        const starY = (s.y + p * 300) % height;

        ctx.fillStyle = s.color;
        ctx.globalAlpha = currentAlpha;
        ctx.beginPath();
        ctx.arc(s.x, starY, s.size * (1 + p * 0.25), 0, Math.PI * 2);
        ctx.fill();

        // Lens flare spike on bright stars
        if (s.size > 1.8 && currentAlpha > 0.6) {
          ctx.strokeStyle = s.color;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(s.x - s.size * 3, starY);
          ctx.lineTo(s.x + s.size * 3, starY);
          ctx.moveTo(s.x, starY - s.size * 3);
          ctx.lineTo(s.x, starY + s.size * 3);
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;

      // Realistic Camera Shake during ignition and liftoff
      const shakeIntensity = launchState.shake * 8;
      const shakeX = (Math.sin(tick * 0.8) * 0.5 + (Math.random() - 0.5)) * shakeIntensity;
      const shakeY = (Math.cos(tick * 0.9) * 0.5 + (Math.random() - 0.5)) * shakeIntensity;

      // Coordinates
      const padY = height - 130 + launchState.cameraY + shakeY;
      const rocketBaseX = width * 0.5 + shakeX;
      const rocketBaseY = padY - launchState.rocketY;

      // Cryogenic LOX vent vapor (boiling off liquid oxygen in cold night)
      if (p < 0.4) {
        if (tick % 2 === 0) {
          vaporParticles.push({
            x: rocketBaseX + (Math.random() - 0.5) * 16,
            y: rocketBaseY - 140,
            vx: (Math.random() - 0.5) * 1.5 - 2.5,
            vy: Math.random() * 0.8 - 0.2,
            radius: Math.random() * 4 + 2,
            alpha: 0.6,
            age: 0,
            maxAge: Math.random() * 45 + 30,
          });
        }
      }

      // Update and draw LOX vapor
      for (let i = vaporParticles.length - 1; i >= 0; i--) {
        const vp = vaporParticles[i];
        vp.age++;
        vp.x += vp.vx;
        vp.y += vp.vy;
        vp.radius += 0.4;
        vp.alpha = (1 - vp.age / vp.maxAge) * 0.4;

        if (vp.age >= vp.maxAge) {
          vaporParticles.splice(i, 1);
          continue;
        }

        const vGrad = ctx.createRadialGradient(vp.x, vp.y, 0, vp.x, vp.y, vp.radius);
        vGrad.addColorStop(0, `rgba(220, 240, 255, ${vp.alpha})`);
        vGrad.addColorStop(1, 'rgba(200, 220, 240, 0)');
        ctx.fillStyle = vGrad;
        ctx.beginPath();
        ctx.arc(vp.x, vp.y, vp.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Spawning Pyrotechnic Igniter Sparks & Heavy Fluid Smoke
      if (launchState.ignition > 0.05 && p < 0.88) {
        const spawnCount = Math.floor(launchState.ignition * 8);
        for (let i = 0; i < spawnCount; i++) {
          const sideAngle = (Math.random() - 0.5) * 1.6 + Math.PI * 0.5;
          const speed = Math.random() * 12 + 6;
          smokeParticles.push({
            x: rocketBaseX + (Math.random() - 0.5) * 36,
            y: rocketBaseY + 12,
            vx: Math.cos(sideAngle) * speed + (Math.random() - 0.5) * 8,
            vy: Math.sin(sideAngle) * speed * 0.4 + Math.random() * 3,
            radius: Math.random() * 18 + 12,
            growthRate: Math.random() * 2.2 + 1.2,
            alpha: 0.9,
            heat: Math.random() > 0.25 ? 1 : 0.3,
            rotation: Math.random() * Math.PI * 2,
            rotSpeed: (Math.random() - 0.5) * 0.05,
            age: 0,
            maxAge: Math.random() * 60 + 40,
          });
        }

        // Igniter Spark Sprays
        for (let s = 0; s < 4; s++) {
          sparks.push({
            x: rocketBaseX + (Math.random() - 0.5) * 20,
            y: rocketBaseY + 10,
            vx: (Math.random() - 0.5) * 16,
            vy: Math.random() * 14 + 4,
            length: Math.random() * 10 + 6,
            alpha: 1,
            color: Math.random() > 0.3 ? '#fef08a' : '#ffedd5',
          });
        }
      }

      // 4. Update and Render Multi-Pass Smoke Simulation
      for (let i = smokeParticles.length - 1; i >= 0; i--) {
        const sp = smokeParticles[i];
        sp.age++;
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vx *= 0.97;
        sp.vy *= 0.98;
        sp.radius += sp.growthRate;
        sp.rotation += sp.rotSpeed;
        sp.heat = Math.max(0, sp.heat - 0.025);
        sp.alpha = (1 - sp.age / sp.maxAge) * 0.85;

        if (sp.age >= sp.maxAge) {
          smokeParticles.splice(i, 1);
          continue;
        }

        const smkGrad = ctx.createRadialGradient(
          sp.x,
          sp.y,
          sp.radius * 0.05,
          sp.x,
          sp.y,
          sp.radius
        );

        if (sp.heat > 0.2) {
          // Blazing Fire Core with Scattering
          smkGrad.addColorStop(0, `rgba(255, 245, 200, ${sp.alpha * sp.heat})`);
          smkGrad.addColorStop(0.2, `rgba(255, 140, 20, ${sp.alpha * 0.85})`);
          smkGrad.addColorStop(0.55, `rgba(200, 50, 10, ${sp.alpha * 0.6})`);
          smkGrad.addColorStop(0.85, `rgba(45, 45, 55, ${sp.alpha * 0.35})`);
          smkGrad.addColorStop(1, 'rgba(10, 10, 15, 0)');
        } else {
          // Dense Volumetric Steam & Smoke with ambient light absorption
          smkGrad.addColorStop(0, `rgba(215, 225, 240, ${sp.alpha * 0.75})`);
          smkGrad.addColorStop(0.4, `rgba(130, 145, 165, ${sp.alpha * 0.5})`);
          smkGrad.addColorStop(0.75, `rgba(50, 60, 75, ${sp.alpha * 0.3})`);
          smkGrad.addColorStop(1, 'rgba(15, 20, 28, 0)');
        }

        ctx.fillStyle = smkGrad;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw Sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const spk = sparks[i];
        spk.x += spk.vx;
        spk.y += spk.vy;
        spk.vy += 0.4; // gravity
        spk.alpha -= 0.04;

        if (spk.alpha <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.strokeStyle = spk.color;
        ctx.lineWidth = 1.8;
        ctx.globalAlpha = spk.alpha;
        ctx.beginPath();
        ctx.moveTo(spk.x, spk.y);
        ctx.lineTo(spk.x - spk.vx * 0.6, spk.y - spk.vy * 0.6);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // 5. High-Precision Launch Pad & Heavy Gantry Tower
      if (padY < height + 400 && p < 0.85) {
        ctx.save();
        ctx.translate(0, padY - (height - 130));

        // Concrete Launch Apron with PBR Texture
        const groundGrad = ctx.createLinearGradient(0, height - 130, 0, height);
        groundGrad.addColorStop(0, '#111722');
        groundGrad.addColorStop(0.4, '#090d15');
        groundGrad.addColorStop(1, '#04060a');
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, height - 130, width, 130);

        // Flame Trench Blast Lighting Illumination
        if (launchState.ignition > 0.05) {
          const padFlameGlow = ctx.createRadialGradient(
            width * 0.5,
            height - 130,
            25,
            width * 0.5,
            height - 130,
            420 * launchState.ignition
          );
          padFlameGlow.addColorStop(0, `rgba(255, 170, 50, ${launchState.ignition * 0.95})`);
          padFlameGlow.addColorStop(0.35, `rgba(235, 80, 15, ${launchState.ignition * 0.6})`);
          padFlameGlow.addColorStop(0.7, `rgba(140, 25, 5, ${launchState.ignition * 0.25})`);
          padFlameGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = padFlameGlow;
          ctx.fillRect(0, height - 130, width, 130);
        }

        // Heavy Reinforced Launch Mount Ring
        ctx.fillStyle = '#1e293b';
        ctx.strokeStyle = '#334155';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(width * 0.5 - 120, height - 130);
        ctx.lineTo(width * 0.5 + 120, height - 130);
        ctx.lineTo(width * 0.5 + 90, height - 70);
        ctx.lineTo(width * 0.5 - 90, height - 70);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Exhaust Blast Deflector Trench
        ctx.fillStyle = '#06080c';
        ctx.fillRect(width * 0.5 - 55, height - 130, 110, 35);
        ctx.strokeStyle = '#1e293b';
        ctx.strokeRect(width * 0.5 - 55, height - 130, 110, 35);

        // Gantry Tower (Ultra-Detailed Steel Lattice Truss)
        const towerX = width * 0.5 + 90;
        const towerTop = height - 460;
        const towerBottom = height - 130;
        const towerW = 50;

        // Main Vertical Support Columns
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(towerX, towerBottom);
        ctx.lineTo(towerX, towerTop);
        ctx.moveTo(towerX + towerW, towerBottom);
        ctx.lineTo(towerX + towerW, towerTop);
        ctx.stroke();

        // Cross Structural Trusses
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = '#334155';
        for (let y = towerBottom; y > towerTop; y -= 36) {
          ctx.beginPath();
          ctx.moveTo(towerX, y);
          ctx.lineTo(towerX + towerW, y - 36);
          ctx.moveTo(towerX + towerW, y);
          ctx.lineTo(towerX, y - 36);
          ctx.moveTo(towerX, y);
          ctx.lineTo(towerX + towerW, y);
          ctx.stroke();

          // Horizontal walkway railing
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(towerX - 6, y - 4, towerW + 12, 4);
        }

        // Mechanical Umbilical Swing Arms (Retracting on liftoff)
        const armRetract = Math.min(1, p / 0.35);
        const armAngle = armRetract * 1.1;

        // Lower arm
        ctx.save();
        ctx.translate(towerX, height - 310);
        ctx.rotate(armAngle);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(-52, -4, 52, 8);
        ctx.strokeStyle = '#94a3b8';
        ctx.strokeRect(-52, -4, 52, 8);
        ctx.restore();

        // Upper arm (Crew/Payload access)
        ctx.save();
        ctx.translate(towerX, height - 400);
        ctx.rotate(armAngle * 1.25);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(-48, -3, 48, 6);
        ctx.strokeStyle = '#94a3b8';
        ctx.strokeRect(-48, -3, 48, 6);
        ctx.restore();

        // Gantry Warning Beacons (Strobe Red/White)
        const beaconIntensity = (Math.sin(tick * 0.1) + 1) * 0.5;
        ctx.fillStyle = `rgba(239, 68, 68, ${beaconIntensity})`;
        ctx.shadowColor = '#ef4444';
        ctx.shadowBlur = 12 * beaconIntensity;
        ctx.beginPath();
        ctx.arc(towerX + towerW * 0.5, towerTop - 10, 4.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Volumetric Spotlight Beam Illuminating Rocket
        const spotGrad = ctx.createRadialGradient(
          towerX,
          height - 280,
          10,
          width * 0.5,
          height - 280,
          240
        );
        spotGrad.addColorStop(0, 'rgba(224, 242, 254, 0.35)');
        spotGrad.addColorStop(0.5, 'rgba(186, 230, 253, 0.12)');
        spotGrad.addColorStop(1, 'rgba(224, 242, 254, 0)');
        ctx.fillStyle = spotGrad;
        ctx.beginPath();
        ctx.moveTo(towerX, height - 280);
        ctx.lineTo(width * 0.5 - 50, height - 420);
        ctx.lineTo(width * 0.5 - 50, height - 160);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      // 6. Photorealistic Heavy Aerospace Launch Vehicle (The Rocket)
      const rocketScale = Math.max(0.16, 1 - p * 0.74);
      const rocketAlpha = Math.max(0, Math.min(1, (1 - p) * 1.35));

      if (rocketAlpha > 0.01) {
        ctx.save();
        ctx.translate(rocketBaseX, rocketBaseY);
        ctx.scale(rocketScale, rocketScale);

        const rW = 38; // Diameter
        const rH = 240; // Total Height

        // 6a. Blazing Engine Plasma Cone & Supersonic Mach Diamonds
        if (launchState.ignition > 0.05) {
          const flameLength = launchState.flameHeight * (170 + Math.random() * 40);
          const flameWidth = rW * (0.9 + Math.random() * 0.15);

          // Outer Volumetric Flame Glow
          const outerGlow = ctx.createRadialGradient(
            0,
            flameLength * 0.45,
            10,
            0,
            flameLength * 0.45,
            flameLength * 1.2
          );
          outerGlow.addColorStop(0, `rgba(255, 140, 20, ${launchState.ignition * 0.95})`);
          outerGlow.addColorStop(0.35, `rgba(235, 70, 10, ${launchState.ignition * 0.7})`);
          outerGlow.addColorStop(0.7, `rgba(180, 20, 5, ${launchState.ignition * 0.3})`);
          outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = outerGlow;
          ctx.beginPath();
          ctx.ellipse(0, flameLength * 0.5, flameWidth * 2.2, flameLength * 0.9, 0, 0, Math.PI * 2);
          ctx.fill();

          // Intense Inner Core Plasma Cone
          const innerGrad = ctx.createLinearGradient(0, 0, 0, flameLength);
          innerGrad.addColorStop(0, '#ffffff');
          innerGrad.addColorStop(0.15, '#fef08a');
          innerGrad.addColorStop(0.45, '#f97316');
          innerGrad.addColorStop(0.8, '#dc2626');
          innerGrad.addColorStop(1, 'rgba(150, 10, 0, 0)');

          ctx.fillStyle = innerGrad;
          ctx.beginPath();
          ctx.moveTo(-flameWidth * 0.5, 0);
          ctx.quadraticCurveTo(
            -flameWidth * 0.35,
            flameLength * 0.65,
            (Math.random() - 0.5) * 8,
            flameLength
          );
          ctx.quadraticCurveTo(flameWidth * 0.35, flameLength * 0.65, flameWidth * 0.5, 0);
          ctx.closePath();
          ctx.fill();

          // Supersonic Mach Diamonds (Shock Diamonds)
          if (p > 0.3) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
            for (let d = 26; d < flameLength * 0.75; d += 34) {
              ctx.beginPath();
              ctx.ellipse(0, d, 7, 3.5, 0, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // 6b. Metallic Regeneratively-Cooled Engine Bell Nozzle
        const bellGrad = ctx.createLinearGradient(-18, 0, 18, 0);
        bellGrad.addColorStop(0, '#111827');
        bellGrad.addColorStop(0.2, '#374151');
        bellGrad.addColorStop(0.5, '#6b7280'); // specular
        bellGrad.addColorStop(0.8, '#374151');
        bellGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = bellGrad;
        ctx.beginPath();
        ctx.moveTo(-11, -16);
        ctx.lineTo(-20, 0);
        ctx.lineTo(20, 0);
        ctx.lineTo(11, -16);
        ctx.closePath();
        ctx.fill();

        // Nozzle Cooling Stiffener Rings
        ctx.strokeStyle = '#9ca3af';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-16, -6);
        ctx.lineTo(16, -6);
        ctx.moveTo(-13, -11);
        ctx.lineTo(13, -11);
        ctx.stroke();

        // 6c. Titanium Base Aerodynamic Grid Fins
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 1.5;
        // Left
        ctx.beginPath();
        ctx.moveTo(-rW * 0.5, -48);
        ctx.lineTo(-rW * 0.5 - 24, -18);
        ctx.lineTo(-rW * 0.5 - 20, -10);
        ctx.lineTo(-rW * 0.5, -20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // Right
        ctx.beginPath();
        ctx.moveTo(rW * 0.5, -48);
        ctx.lineTo(rW * 0.5 + 24, -18);
        ctx.lineTo(rW * 0.5 + 20, -10);
        ctx.lineTo(rW * 0.5, -20);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 6d. Main Aerospace Alloy Cylindrical Fuselage with PBR Light Sheen
        const bodyGrad = ctx.createLinearGradient(-rW * 0.5, 0, rW * 0.5, 0);
        bodyGrad.addColorStop(0, '#64748b');
        bodyGrad.addColorStop(0.2, '#e2e8f0');
        bodyGrad.addColorStop(0.42, '#ffffff'); // Specular highlight
        bodyGrad.addColorStop(0.7, '#cbd5e1');
        bodyGrad.addColorStop(1, '#475569');

        ctx.fillStyle = bodyGrad;
        ctx.fillRect(-rW * 0.5, -rH + 60, rW, rH - 76);

        // Stage Separation Interstage Ring (Carbon Fiber Matte Black)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-rW * 0.5 - 1.5, -rH + 125, rW + 3, 7);

        // High-Precision Decals & Roll Patterns
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-rW * 0.5, -rH + 65, 7, 28);
        ctx.fillRect(rW * 0.5 - 7, -rH + 65, 7, 28);

        // Mission Decal Typography
        ctx.save();
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 9px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.translate(0, -rH + 105);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('CROPCAST // AGRI-1', 0, 3.5);
        ctx.restore();

        // 6e. Aerodynamic Payload Fairing (Nose Cone)
        const noseTop = -rH;
        const noseBase = -rH + 60;
        const fairingGrad = ctx.createLinearGradient(-rW * 0.5, 0, rW * 0.5, 0);
        fairingGrad.addColorStop(0, '#94a3b8');
        fairingGrad.addColorStop(0.3, '#ffffff');
        fairingGrad.addColorStop(0.65, '#cbd5e1');
        fairingGrad.addColorStop(1, '#64748b');

        ctx.fillStyle = fairingGrad;
        ctx.beginPath();
        ctx.moveTo(-rW * 0.5, noseBase);
        ctx.quadraticCurveTo(-rW * 0.5, noseTop + 18, 0, noseTop);
        ctx.quadraticCurveTo(rW * 0.5, noseTop + 18, rW * 0.5, noseBase);
        ctx.closePath();
        ctx.fill();

        // Fairing Split Seam
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.45)';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(0, noseTop);
        ctx.lineTo(0, noseBase);
        ctx.stroke();

        // Tip Strobe Flash
        const strobe = (Math.sin(tick * 0.16) + 1) * 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${strobe})`;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 10 * strobe;
        ctx.beginPath();
        ctx.arc(0, noseTop - 2, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.restore();
      }

      // 7. Stratosphere Fade to Deep Space
      if (p > 0.82) {
        const spaceFade = (p - 0.82) / 0.18;
        ctx.fillStyle = `rgba(1, 3, 6, ${spaceFade})`;
        ctx.fillRect(0, 0, width, height);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    // GSAP ScrollTrigger Scrubbing Timeline
    const st = ScrollTrigger.create({
      trigger: containerRef.current,
      start: 'top top',
      end: '+=180%',
      pin: true,
      scrub: 1.2,
      onUpdate: (self) => {
        const p = self.progress;
        launchState.progress = p;
        if (onProgress) onProgress(p);

        if (p < 0.15) {
          launchState.ignition = p / 0.15;
          launchState.flameHeight = p / 0.15;
          launchState.rocketY = 0;
          launchState.cameraY = 0;
          launchState.shake = p * 0.2;
        } else if (p < 0.35) {
          launchState.ignition = 1;
          launchState.flameHeight = 1;
          const liftSub = (p - 0.15) / 0.2;
          launchState.rocketY = liftSub * liftSub * 60;
          launchState.cameraY = liftSub * 20;
          launchState.shake = 0.6 + Math.sin(p * 20) * 0.2;
        } else if (p < 0.8) {
          const ascSub = (p - 0.35) / 0.45;
          launchState.ignition = 1;
          launchState.flameHeight = 1;
          launchState.rocketY = 60 + Math.pow(ascSub, 1.8) * (height * 1.8);
          launchState.cameraY = Math.pow(ascSub, 1.5) * (height * 0.9);
          launchState.shake = Math.max(0, (1 - ascSub) * 0.8);
        } else {
          const exitSub = (p - 0.8) / 0.2;
          launchState.ignition = Math.max(0, 1 - exitSub * 1.5);
          launchState.flameHeight = Math.max(0, 1 - exitSub);
          launchState.rocketY = 60 + height * 1.8 + exitSub * (height * 1.2);
          launchState.cameraY = height * 0.9 + exitSub * 200;
          launchState.shake = 0;
        }

        // Minimal Typography Fade
        if (textRef.current && subtitleRef.current && scrollCueRef.current) {
          if (p < 0.12) {
            textRef.current.style.opacity = '1';
            subtitleRef.current.style.opacity = '0.9';
            scrollCueRef.current.style.opacity = '1';
          } else if (p < 0.45) {
            const fade = Math.max(0, 1 - (p - 0.12) / 0.2);
            textRef.current.style.opacity = fade.toString();
            subtitleRef.current.style.opacity = fade.toString();
            scrollCueRef.current.style.opacity = fade.toString();
          } else {
            textRef.current.style.opacity = '0';
            subtitleRef.current.style.opacity = '0';
            scrollCueRef.current.style.opacity = '0';
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
      className="relative w-full h-screen overflow-hidden bg-[#010204] select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Cinematic Subtle Typography Overlays */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-16 z-10">
        <div className="flex justify-between items-center text-xs tracking-[0.3em] font-mono text-slate-500 uppercase">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            MISSION STAGE 01 // ORBITAL INJECTION
          </span>
          <span>LAT 28.6°N // SLC-01</span>
        </div>

        <div className="flex flex-col items-center justify-center text-center space-y-4 my-auto">
          <h1
            ref={textRef}
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-[0.25em] text-white font-['Space_Grotesk'] text-glow-white transition-opacity duration-300"
          >
            CROPCAST
          </h1>
          <p
            ref={subtitleRef}
            className="text-sm md:text-base tracking-[0.45em] text-cyan-200/80 font-mono uppercase transition-opacity duration-300"
          >
            FROM SPACE TO YIELD
          </p>
        </div>

        <div
          ref={scrollCueRef}
          className="flex flex-col items-center justify-center space-y-2 text-slate-400 font-mono text-xs tracking-widest transition-opacity duration-300"
        >
          <span>SCROLL TO INITIATE LAUNCH</span>
          <div className="w-5 h-8 border-2 border-slate-600 rounded-full flex justify-center p-1">
            <div className="w-1.5 h-2 bg-cyan-400 rounded-full animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
};
