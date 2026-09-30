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

    // Starfield generation
    const stars: { x: number; y: number; size: number; alpha: number; twinkleSpeed: number }[] = [];
    for (let i = 0; i < 350; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height * 0.8,
        size: Math.random() * 1.8 + 0.5,
        alpha: Math.random() * 0.8 + 0.2,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
      });
    }

    // Launch Smoke Particle System
    interface SmokeParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      maxRadius: number;
      alpha: number;
      heat: number; // 1 = fiery orange/yellow, 0 = dense gray smoke
      age: number;
      maxAge: number;
    }
    const smokeParticles: SmokeParticle[] = [];

    // State object scrubbed by GSAP
    const launchState = {
      progress: 0, // 0 to 1
      ignition: 0, // 0 to 1
      flameHeight: 0,
      rocketY: 0,
      cameraY: 0,
      smokeIntensity: 0,
      shake: 0,
      opacity: 1,
    };

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      const p = launchState.progress;

      // Shake calculation during launch
      const currentShake = (Math.random() - 0.5) * launchState.shake * 12;

      // 1. Sky Gradient & Atmosphere
      const skyGrad = ctx.createLinearGradient(0, 0, 0, height);
      // As rocket climbs, sky gets progressively darker and atmosphere slips down
      const skyAlpha = Math.max(0, 1 - p * 0.7);
      skyGrad.addColorStop(0, '#020307');
      skyGrad.addColorStop(0.5, `rgba(6, 12, 26, ${skyAlpha})`);
      skyGrad.addColorStop(1, `rgba(14, 25, 48, ${skyAlpha})`);
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, width, height);

      // Distant atmospheric haze on horizon
      if (p < 0.7) {
        const horizonGrad = ctx.createRadialGradient(
          width * 0.5,
          height * 0.95,
          50,
          width * 0.5,
          height * 0.95,
          width * 0.8
        );
        horizonGrad.addColorStop(0, `rgba(20, 45, 80, ${(1 - p * 1.3) * 0.4})`);
        horizonGrad.addColorStop(1, 'rgba(2, 3, 7, 0)');
        ctx.fillStyle = horizonGrad;
        ctx.fillRect(0, height * 0.5, width, height * 0.5);
      }

      // 2. Stars (twinkling and parallax shifting downward as camera ascends)
      for (let s of stars) {
        s.alpha += Math.sin(tick * s.twinkleSpeed) * 0.01;
        const currentAlpha = Math.max(0.1, Math.min(1, s.alpha));
        const starY = (s.y + p * 200) % height;
        ctx.fillStyle = `rgba(220, 235, 255, ${currentAlpha * (0.4 + p * 0.6)})`;
        ctx.beginPath();
        ctx.arc(s.x, starY, s.size * (1 + p * 0.2), 0, Math.PI * 2);
        ctx.fill();
      }

      // Camera coordinates
      // Pad is at base (height - 120), rocket is on pad.
      const padY = height - 120 + launchState.cameraY;
      const rocketBaseX = width * 0.5 + currentShake;
      const rocketBaseY = padY - launchState.rocketY;

      // 3. Spawn Smoke and Flame particles when ignition > 0
      if (launchState.ignition > 0.05 && p < 0.9) {
        const spawnCount = Math.floor(launchState.ignition * 7);
        for (let i = 0; i < spawnCount; i++) {
          const angle = Math.PI * 0.5 + (Math.random() - 0.5) * 1.2;
          const speed = Math.random() * 8 + 4;
          const spreadX = (Math.random() - 0.5) * 40;
          smokeParticles.push({
            x: rocketBaseX + spreadX,
            y: rocketBaseY + 10,
            vx: Math.cos(angle) * speed + (Math.random() - 0.5) * 6,
            vy: Math.sin(angle) * speed * 0.5 + Math.random() * 2,
            radius: Math.random() * 15 + 8,
            maxRadius: Math.random() * 80 + 40,
            alpha: 0.85,
            heat: Math.random() > 0.3 ? 1 : 0.4,
            age: 0,
            maxAge: Math.random() * 50 + 35,
          });
        }
      }

      // 4. Update and Draw Smoke Particles
      for (let i = smokeParticles.length - 1; i >= 0; i--) {
        const sp = smokeParticles[i];
        sp.age++;
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.radius += (sp.maxRadius - sp.radius) * 0.04;
        sp.alpha = (1 - sp.age / sp.maxAge) * 0.7;
        sp.heat = Math.max(0, sp.heat - 0.03);

        if (sp.age >= sp.maxAge) {
          smokeParticles.splice(i, 1);
          continue;
        }

        const smokeGrad = ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, sp.radius);
        if (sp.heat > 0.2) {
          // Fiery ignition smoke
          smokeGrad.addColorStop(0, `rgba(255, 160, 40, ${sp.alpha * sp.heat})`);
          smokeGrad.addColorStop(0.4, `rgba(220, 80, 20, ${sp.alpha * 0.6})`);
          smokeGrad.addColorStop(0.8, `rgba(60, 60, 65, ${sp.alpha * 0.4})`);
          smokeGrad.addColorStop(1, 'rgba(20, 20, 25, 0)');
        } else {
          // Volumetric thick white/gray steam smoke
          smokeGrad.addColorStop(0, `rgba(210, 220, 230, ${sp.alpha * 0.7})`);
          smokeGrad.addColorStop(0.5, `rgba(130, 140, 155, ${sp.alpha * 0.4})`);
          smokeGrad.addColorStop(1, 'rgba(40, 45, 55, 0)');
        }
        ctx.fillStyle = smokeGrad;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 5. Draw Launch Pad Platform & Gantry Tower (if in view)
      if (padY < height + 400 && p < 0.85) {
        ctx.save();
        ctx.translate(0, padY - (height - 120));

        // Ground / Concrete Apron
        const groundGrad = ctx.createLinearGradient(0, height - 120, 0, height);
        groundGrad.addColorStop(0, '#0c1018');
        groundGrad.addColorStop(1, '#05070a');
        ctx.fillStyle = groundGrad;
        ctx.fillRect(0, height - 120, width, 120);

        // Ground reflection from engine flame
        if (launchState.ignition > 0.1) {
          const flameGlow = ctx.createRadialGradient(
            width * 0.5,
            height - 120,
            20,
            width * 0.5,
            height - 120,
            300 * launchState.ignition
          );
          flameGlow.addColorStop(0, `rgba(255, 140, 40, ${launchState.ignition * 0.7})`);
          flameGlow.addColorStop(0.5, `rgba(200, 60, 10, ${launchState.ignition * 0.3})`);
          flameGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = flameGlow;
          ctx.fillRect(0, height - 120, width, 120);
        }

        // Heavy Launch Mount Platform
        ctx.fillStyle = '#161c28';
        ctx.strokeStyle = '#2d3748';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(width * 0.5 - 110, height - 120);
        ctx.lineTo(width * 0.5 + 110, height - 120);
        ctx.lineTo(width * 0.5 + 85, height - 70);
        ctx.lineTo(width * 0.5 - 85, height - 70);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Exhaust Trench Opening
        ctx.fillStyle = '#080a0e';
        ctx.fillRect(width * 0.5 - 45, height - 120, 90, 30);

        // Gantry Tower (Lattice Truss Structure)
        const towerX = width * 0.5 + 80;
        const towerTop = height - 420;
        const towerBottom = height - 120;
        ctx.strokeStyle = '#3a4454';
        ctx.lineWidth = 2.5;

        // Vertical columns
        ctx.beginPath();
        ctx.moveTo(towerX, towerBottom);
        ctx.lineTo(towerX, towerTop);
        ctx.moveTo(towerX + 45, towerBottom);
        ctx.lineTo(towerX + 45, towerTop);
        ctx.stroke();

        // Cross bracing trusses
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = '#273142';
        for (let y = towerBottom; y > towerTop; y -= 35) {
          ctx.beginPath();
          ctx.moveTo(towerX, y);
          ctx.lineTo(towerX + 45, y - 35);
          ctx.moveTo(towerX + 45, y);
          ctx.lineTo(towerX, y - 35);
          ctx.moveTo(towerX, y);
          ctx.lineTo(towerX + 45, y);
          ctx.stroke();
        }

        // Umbilical Service Arms pointing to rocket
        if (p < 0.35) {
          const armRetract = Math.min(1, p / 0.3);
          const armAngle = armRetract * 0.8; // swings back
          ctx.save();
          ctx.translate(towerX, height - 290);
          ctx.rotate(armAngle);
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-45, 0);
          ctx.stroke();
          ctx.restore();

          // Upper arm
          ctx.save();
          ctx.translate(towerX, height - 370);
          ctx.rotate(armAngle * 1.2);
          ctx.strokeStyle = '#64748b';
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-40, 0);
          ctx.stroke();
          ctx.restore();
        }

        // Tower warning lights (red/white blinking)
        const beacon = (Math.sin(tick * 0.08) + 1) * 0.5;
        ctx.fillStyle = `rgba(255, 40, 40, ${beacon})`;
        ctx.beginPath();
        ctx.arc(towerX + 22, towerTop - 8, 4, 0, Math.PI * 2);
        ctx.fill();

        // Floodlight Beams
        const spotGlow = ctx.createRadialGradient(
          towerX,
          height - 250,
          10,
          width * 0.5,
          height - 250,
          200
        );
        spotGlow.addColorStop(0, 'rgba(200, 230, 255, 0.25)');
        spotGlow.addColorStop(1, 'rgba(200, 230, 255, 0)');
        ctx.fillStyle = spotGlow;
        ctx.beginPath();
        ctx.moveTo(towerX, height - 250);
        ctx.lineTo(width * 0.5 - 40, height - 350);
        ctx.lineTo(width * 0.5 - 40, height - 150);
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      // 6. Draw Realistic Metallic Multi-Stage Rocket
      // Rocket scale shrinks with altitude
      const rocketScale = Math.max(0.18, 1 - p * 0.72);
      const rocketAlpha = Math.max(0, Math.min(1, (1 - p) * 1.4));

      if (rocketAlpha > 0.01) {
        ctx.save();
        ctx.translate(rocketBaseX, rocketBaseY);
        ctx.scale(rocketScale, rocketScale);

        // Rocket Dimensions
        const rW = 34; // body diameter
        const rH = 220; // rocket total height

        // 6a. Engine Flame & Plasma Core
        if (launchState.ignition > 0.05) {
          const flameLength = launchState.flameHeight * (140 + Math.random() * 35);
          const flameWidth = rW * (0.85 + Math.random() * 0.15);

          // Outer Flame Glow
          const outerFlameGrad = ctx.createRadialGradient(
            0,
            flameLength * 0.5,
            5,
            0,
            flameLength * 0.5,
            flameLength
          );
          outerFlameGrad.addColorStop(0, `rgba(255, 120, 20, ${launchState.ignition * 0.9})`);
          outerFlameGrad.addColorStop(0.4, `rgba(255, 60, 10, ${launchState.ignition * 0.6})`);
          outerFlameGrad.addColorStop(1, 'rgba(255, 40, 0, 0)');
          ctx.fillStyle = outerFlameGrad;
          ctx.beginPath();
          ctx.ellipse(0, flameLength * 0.5, flameWidth * 1.8, flameLength * 0.8, 0, 0, Math.PI * 2);
          ctx.fill();

          // Intense Inner Flame Cone
          const innerFlameGrad = ctx.createLinearGradient(0, 0, 0, flameLength);
          innerFlameGrad.addColorStop(0, '#ffffff');
          innerFlameGrad.addColorStop(0.2, '#fff1a8');
          innerFlameGrad.addColorStop(0.5, '#ff8b19');
          innerFlameGrad.addColorStop(0.85, '#e63900');
          innerFlameGrad.addColorStop(1, 'rgba(200, 20, 0, 0)');

          ctx.fillStyle = innerFlameGrad;
          ctx.beginPath();
          ctx.moveTo(-flameWidth * 0.5, 0);
          ctx.quadraticCurveTo(
            -flameWidth * 0.35,
            flameLength * 0.6,
            (Math.random() - 0.5) * 8,
            flameLength
          );
          ctx.quadraticCurveTo(flameWidth * 0.35, flameLength * 0.6, flameWidth * 0.5, 0);
          ctx.closePath();
          ctx.fill();

          // Shock Diamonds (Supersonic Mach Discs)
          if (p > 0.35) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            for (let d = 25; d < flameLength * 0.7; d += 30) {
              ctx.beginPath();
              ctx.ellipse(0, d, 6, 3, 0, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }

        // 6b. Engine Nozzle / Bell
        const bellGrad = ctx.createLinearGradient(-16, 0, 16, 0);
        bellGrad.addColorStop(0, '#1a1e24');
        bellGrad.addColorStop(0.5, '#4a5568');
        bellGrad.addColorStop(1, '#11151c');
        ctx.fillStyle = bellGrad;
        ctx.beginPath();
        ctx.moveTo(-9, -15);
        ctx.lineTo(-17, 0);
        ctx.lineTo(17, 0);
        ctx.lineTo(9, -15);
        ctx.closePath();
        ctx.fill();

        // 6c. Grid Fins / Base Aerodynamic Stabilizers
        ctx.fillStyle = '#334155';
        // Left fin
        ctx.beginPath();
        ctx.moveTo(-rW * 0.5, -45);
        ctx.lineTo(-rW * 0.5 - 22, -15);
        ctx.lineTo(-rW * 0.5 - 18, -8);
        ctx.lineTo(-rW * 0.5, -18);
        ctx.closePath();
        ctx.fill();
        // Right fin
        ctx.beginPath();
        ctx.moveTo(rW * 0.5, -45);
        ctx.lineTo(rW * 0.5 + 22, -15);
        ctx.lineTo(rW * 0.5 + 18, -8);
        ctx.lineTo(rW * 0.5, -18);
        ctx.closePath();
        ctx.fill();

        // 6d. Main Rocket Cylindrical Fuselage
        const bodyGrad = ctx.createLinearGradient(-rW * 0.5, 0, rW * 0.5, 0);
        bodyGrad.addColorStop(0, '#64748b');
        bodyGrad.addColorStop(0.2, '#cbd5e1');
        bodyGrad.addColorStop(0.45, '#f8fafc'); // Specular highlight
        bodyGrad.addColorStop(0.75, '#94a3b8');
        bodyGrad.addColorStop(1, '#334155');

        ctx.fillStyle = bodyGrad;
        ctx.fillRect(-rW * 0.5, -rH + 55, rW, rH - 70);

        // Stage Interstage Ring Separator
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-rW * 0.5 - 1, -rH + 115, rW + 2, 6);

        // Markings & Decals (Black Roll Stripes & CROPCAST Text)
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-rW * 0.5, -rH + 60, 6, 25);
        ctx.fillRect(rW * 0.5 - 6, -rH + 60, 6, 25);

        ctx.save();
        ctx.fillStyle = '#1e293b';
        ctx.font = 'bold 8px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.translate(0, -rH + 95);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('CROPCAST-1', 0, 3);
        ctx.restore();

        // 6e. Payload Fairing (Aerodynamic Nose Cone)
        const noseTop = -rH;
        const noseBase = -rH + 55;
        const noseGrad = ctx.createLinearGradient(-rW * 0.5, 0, rW * 0.5, 0);
        noseGrad.addColorStop(0, '#94a3b8');
        noseGrad.addColorStop(0.3, '#f1f5f9');
        noseGrad.addColorStop(0.6, '#cbd5e1');
        noseGrad.addColorStop(1, '#475569');

        ctx.fillStyle = noseGrad;
        ctx.beginPath();
        ctx.moveTo(-rW * 0.5, noseBase);
        ctx.quadraticCurveTo(-rW * 0.5, noseTop + 15, 0, noseTop);
        ctx.quadraticCurveTo(rW * 0.5, noseTop + 15, rW * 0.5, noseBase);
        ctx.closePath();
        ctx.fill();

        // Fairing Separation Line
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.4)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(0, noseTop);
        ctx.lineTo(0, noseBase);
        ctx.stroke();

        // Strobe beacon on tip
        const noseBeacon = (Math.sin(tick * 0.12) + 1) * 0.5;
        ctx.fillStyle = `rgba(255, 255, 255, ${noseBeacon})`;
        ctx.beginPath();
        ctx.arc(0, noseTop - 2, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 7. Stratosphere Fade to Sky (smooth transition to Section 2)
      if (p > 0.82) {
        const spaceFade = (p - 0.82) / 0.18;
        ctx.fillStyle = `rgba(2, 4, 10, ${spaceFade})`;
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

        // Sequence timing:
        // 0.00 - 0.15: Idle on pad, fog/mist
        // 0.15 - 0.35: Engine Ignition & Smoke Accumulation
        // 0.35 - 0.75: Liftoff, Acceleration & Camera Tracking
        // 0.75 - 1.00: Stratospheric Ascent & Vanishing into Space

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
          // Initial small shuddering lift
          launchState.rocketY = liftSub * liftSub * 60;
          launchState.cameraY = liftSub * 20;
          launchState.shake = 0.6 + Math.sin(p * 20) * 0.2;
        } else if (p < 0.8) {
          const ascSub = (p - 0.35) / 0.45;
          launchState.ignition = 1;
          launchState.flameHeight = 1;
          // Power law acceleration upward
          launchState.rocketY = 60 + Math.pow(ascSub, 1.8) * (height * 1.8);
          launchState.cameraY = Math.pow(ascSub, 1.5) * (height * 0.9);
          launchState.shake = Math.max(0, (1 - ascSub) * 0.8);
        } else {
          const exitSub = (p - 0.8) / 0.2;
          launchState.ignition = Math.max(0, 1 - exitSub * 1.5);
          launchState.flameHeight = Math.max(0, 1 - exitSub);
          launchState.rocketY = 60 + (height * 1.8) + exitSub * (height * 1.2);
          launchState.cameraY = height * 0.9 + exitSub * 200;
          launchState.shake = 0;
        }

        // Subtitle & Title visibility
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
      className="relative w-full h-screen overflow-hidden bg-[#020307] select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Cinematic Subtle Typography Overlays */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-16 z-10">
        {/* Top telemetry mark */}
        <div className="flex justify-between items-center text-xs tracking-[0.3em] font-mono text-slate-500 uppercase">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
            MISSION STAGE 01 // ORBITAL INJECTION
          </span>
          <span>LAT 28.6°N // SLC-01</span>
        </div>

        {/* Center Title & Slogan */}
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

        {/* Bottom Scroll Cue */}
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
