import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface SatelliteSectionProps {
  onProgress?: (p: number) => void;
}

export const SatelliteSection: React.FC<SatelliteSectionProps> = ({ onProgress }) => {
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

    // Deep space stars with depth
    const stars: { x: number; y: number; size: number; alpha: number; speed: number }[] = [];
    for (let i = 0; i < 400; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.4,
        alpha: Math.random() * 0.9 + 0.1,
        speed: Math.random() * 0.05 + 0.01,
      });
    }

    // Scrubbed state controlled by GSAP
    const satState = {
      progress: 0,
      leftWingAngle: 0, // 0 (folded) to 1 (fully extended 90deg)
      leftWingPanels: 0, // 0 (folded) to 1 (unfolded)
      rightWingAngle: 0,
      rightWingPanels: 0,
      satelliteRotation: 0, // pitch towards Earth
      cameraZoom: 1,
      cameraX: 0,
      cameraY: 0,
      earthZoom: 1,
      scanBeamAlpha: 0,
    };

    let tick = 0;

    const render = () => {
      tick++;
      ctx.clearRect(0, 0, width, height);

      const p = satState.progress;

      // 1. Deep Space Black Backdrop
      ctx.fillStyle = '#010306';
      ctx.fillRect(0, 0, width, height);

      // Stars in background with orbital drift
      for (let s of stars) {
        const starX = (s.x - tick * s.speed + width) % width;
        ctx.fillStyle = `rgba(230, 240, 255, ${s.alpha})`;
        ctx.beginPath();
        ctx.arc(starX, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // 2. Photorealistic Curved Earth Below
      // Earth position shifts as camera moves closer
      const earthCenterX = width * 0.5 + satState.cameraX;
      // Earth radius expands dynamically to simulate atmospheric approach
      const baseEarthRadius = Math.max(width, height) * 0.85;
      const earthRadius = baseEarthRadius * satState.earthZoom;
      const earthCenterY = height * 0.95 + earthRadius * 0.65 - (satState.earthZoom - 1) * 350;

      ctx.save();

      // Atmospheric Glow (Rayleigh Scattering) on Earth's Rim
      const atmoGlow = ctx.createRadialGradient(
        earthCenterX,
        earthCenterY,
        earthRadius - 30,
        earthCenterX,
        earthCenterY,
        earthRadius + 60
      );
      atmoGlow.addColorStop(0, 'rgba(56, 189, 248, 0.45)');
      atmoGlow.addColorStop(0.3, 'rgba(14, 165, 233, 0.25)');
      atmoGlow.addColorStop(0.7, 'rgba(3, 105, 161, 0.1)');
      atmoGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = atmoGlow;
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, earthRadius + 60, 0, Math.PI * 2);
      ctx.fill();

      // Earth Globe Body (Clip to sphere)
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, earthRadius, 0, Math.PI * 2);
      ctx.clip();

      // Ocean Base Gradient
      const oceanGrad = ctx.createRadialGradient(
        earthCenterX,
        earthCenterY - earthRadius * 0.5,
        earthRadius * 0.1,
        earthCenterX,
        earthCenterY,
        earthRadius
      );
      oceanGrad.addColorStop(0, '#0a3663');
      oceanGrad.addColorStop(0.5, '#041f3d');
      oceanGrad.addColorStop(1, '#020d1c');
      ctx.fillStyle = oceanGrad;
      ctx.fill();

      // Continents & Landmasses (Curved organic land rendering)
      ctx.fillStyle = '#1e3d29';
      ctx.strokeStyle = '#275237';
      ctx.lineWidth = 14;

      // Draw stylized realistic continental curves (India & surrounding Indo-Gangetic basin)
      ctx.save();
      const drift = (tick * 0.08) % (width * 2);
      ctx.translate(drift - width * 0.5, 0);

      // Continent shapes
      ctx.beginPath();
      ctx.moveTo(earthCenterX - 350, earthCenterY - earthRadius + 180);
      ctx.bezierCurveTo(
        earthCenterX - 220,
        earthCenterY - earthRadius + 80,
        earthCenterX - 60,
        earthCenterY - earthRadius + 120,
        earthCenterX + 80,
        earthCenterY - earthRadius + 240
      );
      ctx.bezierCurveTo(
        earthCenterX + 180,
        earthCenterY - earthRadius + 320,
        earthCenterX + 40,
        earthCenterY - earthRadius + 420,
        earthCenterX - 120,
        earthCenterY - earthRadius + 360
      );
      ctx.closePath();
      ctx.fillStyle = '#22543d';
      ctx.fill();

      // Secondary landmass
      ctx.beginPath();
      ctx.moveTo(earthCenterX + 220, earthCenterY - earthRadius + 150);
      ctx.bezierCurveTo(
        earthCenterX + 380,
        earthCenterY - earthRadius + 100,
        earthCenterX + 520,
        earthCenterY - earthRadius + 280,
        earthCenterX + 350,
        earthCenterY - earthRadius + 380
      );
      ctx.closePath();
      ctx.fillStyle = '#1c4532';
      ctx.fill();
      ctx.restore();

      // Swirling Cloud Bands
      ctx.save();
      const cloudDrift = (tick * 0.15) % (width * 2);
      ctx.translate(cloudDrift - width * 0.5, 0);

      // Cloud swirl 1
      const cloudGrad1 = ctx.createRadialGradient(
        earthCenterX,
        earthCenterY - earthRadius + 160,
        20,
        earthCenterX,
        earthCenterY - earthRadius + 160,
        340
      );
      cloudGrad1.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      cloudGrad1.addColorStop(0.5, 'rgba(230, 240, 255, 0.4)');
      cloudGrad1.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = cloudGrad1;
      ctx.beginPath();
      ctx.ellipse(
        earthCenterX,
        earthCenterY - earthRadius + 160,
        360,
        90,
        Math.PI * 0.08,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Cloud swirl 2 (Storm system target)
      const cloudGrad2 = ctx.createRadialGradient(
        earthCenterX - 180,
        earthCenterY - earthRadius + 220,
        15,
        earthCenterX - 180,
        earthCenterY - earthRadius + 220,
        260
      );
      cloudGrad2.addColorStop(0, 'rgba(255, 255, 255, 0.85)');
      cloudGrad2.addColorStop(0.6, 'rgba(215, 230, 250, 0.45)');
      cloudGrad2.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = cloudGrad2;
      ctx.beginPath();
      ctx.ellipse(
        earthCenterX - 180,
        earthCenterY - earthRadius + 220,
        280,
        110,
        -Math.PI * 0.05,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();

      // Atmosphere Horizon Rim Brightness
      const rimGrad = ctx.createRadialGradient(
        earthCenterX,
        earthCenterY,
        earthRadius - 15,
        earthCenterX,
        earthCenterY,
        earthRadius
      );
      rimGrad.addColorStop(0, 'rgba(186, 230, 253, 0)');
      rimGrad.addColorStop(0.7, 'rgba(125, 211, 252, 0.6)');
      rimGrad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');
      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, earthRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // end Earth clip

      // 3. Realistic Scientific Earth-Observation Satellite
      // Satellite coordinates in upper-middle viewport
      const satX = width * 0.5;
      const satY = height * 0.38 + (p > 0.7 ? (p - 0.7) * 300 : 0);
      const satScale = (1 + (satState.cameraZoom - 1) * 0.4) * (p > 0.8 ? Math.max(0, 1 - (p - 0.8) * 3) : 1);

      if (satScale > 0.05) {
        ctx.save();
        ctx.translate(satX, satY);
        ctx.scale(satScale, satScale);
        ctx.rotate(satState.satelliteRotation);

        // 3a. Earth Sensor Scanning Beam (Active when pointing to Earth)
        if (satState.scanBeamAlpha > 0.01) {
          const beamGrad = ctx.createLinearGradient(0, 50, 0, 400);
          beamGrad.addColorStop(0, `rgba(56, 189, 248, ${satState.scanBeamAlpha * 0.8})`);
          beamGrad.addColorStop(0.4, `rgba(16, 185, 129, ${satState.scanBeamAlpha * 0.3})`);
          beamGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');

          ctx.fillStyle = beamGrad;
          ctx.beginPath();
          ctx.moveTo(-15, 50);
          ctx.lineTo(15, 50);
          ctx.lineTo(220, 420);
          ctx.lineTo(-220, 420);
          ctx.closePath();
          ctx.fill();

          // Scanning Pulse Lines
          const pulseY = 60 + ((tick * 3) % 320);
          ctx.strokeStyle = `rgba(255, 255, 255, ${satState.scanBeamAlpha * 0.6})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          const scanSpread = (pulseY / 320) * 190 + 20;
          ctx.moveTo(-scanSpread, pulseY);
          ctx.lineTo(scanSpread, pulseY);
          ctx.stroke();
        }

        // 3b. LEFT SOLAR PANEL ARRAY (Mechanically Unfolding)
        ctx.save();
        ctx.translate(-40, 0); // Left hinge pivot point

        // Left boom hinge rotation (0 = folded against side, 1 = extended 90deg left)
        const leftHingeAngle = -Math.PI * 0.5 * satState.leftWingAngle;
        ctx.rotate(leftHingeAngle);

        // Boom strut arm
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -35);
        ctx.stroke();

        // 3 Panels unfolding accordion style
        const numPanels = 3;
        const panelW = 34;
        const panelH = 65;

        for (let i = 0; i < numPanels; i++) {
          ctx.save();
          // Offset each panel along the wing
          const panelOffset = (i + 0.5) * (panelW + 2) * satState.leftWingPanels;
          ctx.translate(panelOffset, -35);

          // Panel scale expands during unfolding
          const pScaleX = satState.leftWingPanels;
          ctx.scale(pScaleX, 1);

          if (pScaleX > 0.05) {
            // Blue Photovoltaic Solar Cell Material
            const solarGrad = ctx.createLinearGradient(-panelW * 0.5, 0, panelW * 0.5, 0);
            solarGrad.addColorStop(0, '#0f2942');
            solarGrad.addColorStop(0.3, '#1e4976');
            solarGrad.addColorStop(0.6, '#0f2942');
            solarGrad.addColorStop(1, '#0a1d30');

            ctx.fillStyle = solarGrad;
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 1.5;
            ctx.fillRect(-panelW * 0.5, -panelH * 0.5, panelW, panelH);
            ctx.strokeRect(-panelW * 0.5, -panelH * 0.5, panelW, panelH);

            // Solar Cell Grid Lines (Gold/silver busbars)
            ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
            ctx.lineWidth = 0.8;
            for (let gy = -panelH * 0.5 + 8; gy < panelH * 0.5; gy += 10) {
              ctx.beginPath();
              ctx.moveTo(-panelW * 0.5, gy);
              ctx.lineTo(panelW * 0.5, gy);
              ctx.stroke();
            }
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.beginPath();
            ctx.moveTo(0, -panelH * 0.5);
            ctx.lineTo(0, panelH * 0.5);
            ctx.stroke();

            // Specular Reflection glint across panels
            const glintAlpha = (Math.sin(tick * 0.05 + i) + 1) * 0.15;
            ctx.fillStyle = `rgba(255, 255, 255, ${glintAlpha})`;
            ctx.fillRect(-panelW * 0.5, -panelH * 0.5, panelW, panelH);
          }

          ctx.restore();
        }
        ctx.restore(); // end Left Wing

        // 3c. RIGHT SOLAR PANEL ARRAY (Mechanically Unfolding)
        ctx.save();
        ctx.translate(40, 0); // Right hinge pivot point

        // Right boom hinge rotation
        const rightHingeAngle = Math.PI * 0.5 * satState.rightWingAngle;
        ctx.rotate(rightHingeAngle);

        // Boom strut arm
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -35);
        ctx.stroke();

        for (let i = 0; i < numPanels; i++) {
          ctx.save();
          const panelOffset = -(i + 0.5) * (panelW + 2) * satState.rightWingPanels;
          ctx.translate(panelOffset, -35);

          const pScaleX = satState.rightWingPanels;
          ctx.scale(pScaleX, 1);

          if (pScaleX > 0.05) {
            const solarGrad = ctx.createLinearGradient(-panelW * 0.5, 0, panelW * 0.5, 0);
            solarGrad.addColorStop(0, '#0a1d30');
            solarGrad.addColorStop(0.4, '#1e4976');
            solarGrad.addColorStop(0.7, '#0f2942');
            solarGrad.addColorStop(1, '#0a1d30');

            ctx.fillStyle = solarGrad;
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 1.5;
            ctx.fillRect(-panelW * 0.5, -panelH * 0.5, panelW, panelH);
            ctx.strokeRect(-panelW * 0.5, -panelH * 0.5, panelW, panelH);

            ctx.strokeStyle = 'rgba(234, 179, 8, 0.4)';
            ctx.lineWidth = 0.8;
            for (let gy = -panelH * 0.5 + 8; gy < panelH * 0.5; gy += 10) {
              ctx.beginPath();
              ctx.moveTo(-panelW * 0.5, gy);
              ctx.lineTo(panelW * 0.5, gy);
              ctx.stroke();
            }
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.beginPath();
            ctx.moveTo(0, -panelH * 0.5);
            ctx.lineTo(0, panelH * 0.5);
            ctx.stroke();

            const glintAlpha = (Math.sin(tick * 0.05 + i + 1) + 1) * 0.15;
            ctx.fillStyle = `rgba(255, 255, 255, ${glintAlpha})`;
            ctx.fillRect(-panelW * 0.5, -panelH * 0.5, panelW, panelH);
          }

          ctx.restore();
        }
        ctx.restore(); // end Right Wing

        // 3d. Main Satellite Chassis (Gold MLI Foil & Carbon Composite)
        const busW = 76;
        const busH = 92;

        // Gold Foil Multi-Layer Insulation Gradient
        const goldFoilGrad = ctx.createLinearGradient(-busW * 0.5, -busH * 0.5, busW * 0.5, busH * 0.5);
        goldFoilGrad.addColorStop(0, '#d97706');
        goldFoilGrad.addColorStop(0.25, '#fbbf24');
        goldFoilGrad.addColorStop(0.5, '#fef08a'); // High specular gleam
        goldFoilGrad.addColorStop(0.75, '#d97706');
        goldFoilGrad.addColorStop(1, '#92400e');

        ctx.fillStyle = goldFoilGrad;
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(-busW * 0.5, -busH * 0.5, busW, busH, 6);
        ctx.fill();
        ctx.stroke();

        // Crinkled MLI Foil Texture Lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
        ctx.lineWidth = 1;
        for (let fy = -busH * 0.5 + 10; fy < busH * 0.5; fy += 14) {
          ctx.beginPath();
          ctx.moveTo(-busW * 0.5 + 4, fy);
          ctx.lineTo(busW * 0.5 - 4, fy + (Math.sin(fy) * 3));
          ctx.stroke();
        }

        // 3e. Earth-Facing Optical Multi-Spectral Sensor Barrel (Bottom Nadir)
        const lensGrad = ctx.createRadialGradient(0, busH * 0.5 + 12, 2, 0, busH * 0.5 + 12, 18);
        lensGrad.addColorStop(0, '#06b6d4');
        lensGrad.addColorStop(0.5, '#0284c7');
        lensGrad.addColorStop(0.85, '#0f172a');
        lensGrad.addColorStop(1, '#334155');

        ctx.fillStyle = lensGrad;
        ctx.beginPath();
        ctx.arc(0, busH * 0.5 + 10, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Multi-Spectral Optical Apertures (Red, NIR, SWIR sensors)
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(-5, busH * 0.5 + 8, 3.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(5, busH * 0.5 + 8, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // 3f. High-Gain Parabolic Communications Dish (Top)
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(0, -busH * 0.5 - 12, 24, 9, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Dish Feed Horn Struts
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-12, -busH * 0.5 - 12);
        ctx.lineTo(0, -busH * 0.5 - 26);
        ctx.lineTo(12, -busH * 0.5 - 12);
        ctx.stroke();

        // Sub-reflector feed point
        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(0, -busH * 0.5 - 26, 3, 0, Math.PI * 2);
        ctx.fill();

        // 3g. RCS Reaction Control Thrusters (4 corners)
        ctx.fillStyle = '#334155';
        [-busW * 0.5, busW * 0.5].forEach((cx) => {
          [-busH * 0.5 + 10, busH * 0.5 - 10].forEach((cy) => {
            ctx.fillRect(cx - (cx < 0 ? 5 : 0), cy - 3, 5, 6);
          });
        });

        // 3h. Telemetry Status LEDs (Green/Cyan blinks)
        const ledBlink = (Math.sin(tick * 0.15) + 1) * 0.5;
        ctx.fillStyle = `rgba(16, 185, 129, ${0.5 + ledBlink * 0.5})`;
        ctx.beginPath();
        ctx.arc(-busW * 0.5 + 12, -busH * 0.5 + 14, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(6, 182, 212, ${0.5 + (1 - ledBlink) * 0.5})`;
        ctx.beginPath();
        ctx.arc(-busW * 0.5 + 20, -busH * 0.5 + 14, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 4. Smooth Transition to Weather (Cloud Penetration Layer)
      if (p > 0.82) {
        const cloudEntry = (p - 0.82) / 0.18;
        const entryGrad = ctx.createRadialGradient(
          width * 0.5,
          height * 0.5,
          50,
          width * 0.5,
          height * 0.5,
          width * 0.8
        );
        entryGrad.addColorStop(0, `rgba(148, 163, 184, ${cloudEntry * 0.95})`);
        entryGrad.addColorStop(0.6, `rgba(51, 65, 85, ${cloudEntry * 0.85})`);
        entryGrad.addColorStop(1, `rgba(15, 23, 42, ${cloudEntry * 0.95})`);
        ctx.fillStyle = entryGrad;
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
        satState.progress = p;
        if (onProgress) onProgress(p);

        // Sequence:
        // 0.00 - 0.20: Satellite glides into stable orbit (solar panels folded)
        // 0.20 - 0.42: Left solar panel rotates out & unfolds multi-cells
        // 0.42 - 0.65: Right solar panel rotates out & unfolds multi-cells & locks
        // 0.65 - 0.82: Satellite reorients nadir to Earth, scan beam activates
        // 0.82 - 1.00: Camera zooms down toward cloud tops

        if (p < 0.2) {
          satState.leftWingAngle = 0;
          satState.leftWingPanels = 0;
          satState.rightWingAngle = 0;
          satState.rightWingPanels = 0;
          satState.satelliteRotation = 0;
          satState.cameraZoom = 1;
          satState.earthZoom = 1;
          satState.scanBeamAlpha = 0;
        } else if (p < 0.42) {
          const lSub = (p - 0.2) / 0.22;
          satState.leftWingAngle = Math.min(1, lSub * 1.3);
          satState.leftWingPanels = Math.max(0, (lSub - 0.25) / 0.75);
          satState.rightWingAngle = 0;
          satState.rightWingPanels = 0;
          satState.satelliteRotation = 0;
          satState.cameraZoom = 1 + lSub * 0.15;
          satState.earthZoom = 1 + lSub * 0.1;
          satState.scanBeamAlpha = 0;
        } else if (p < 0.65) {
          const rSub = (p - 0.42) / 0.23;
          satState.leftWingAngle = 1;
          satState.leftWingPanels = 1;
          satState.rightWingAngle = Math.min(1, rSub * 1.3);
          satState.rightWingPanels = Math.max(0, (rSub - 0.25) / 0.75);
          satState.satelliteRotation = 0;
          satState.cameraZoom = 1.15 + rSub * 0.15;
          satState.earthZoom = 1.1 + rSub * 0.15;
          satState.scanBeamAlpha = 0;
        } else if (p < 0.82) {
          const oSub = (p - 0.65) / 0.17;
          satState.leftWingAngle = 1;
          satState.leftWingPanels = 1;
          satState.rightWingAngle = 1;
          satState.rightWingPanels = 1;
          // Spacecraft pitches smoothly to point optical sensor nadir
          satState.satelliteRotation = Math.sin(oSub * Math.PI * 0.5) * 0.12;
          satState.scanBeamAlpha = oSub;
          satState.cameraZoom = 1.3 + oSub * 0.3;
          satState.earthZoom = 1.25 + oSub * 0.4;
        } else {
          const zSub = (p - 0.82) / 0.18;
          satState.leftWingAngle = 1;
          satState.leftWingPanels = 1;
          satState.rightWingAngle = 1;
          satState.rightWingPanels = 1;
          satState.scanBeamAlpha = 1;
          // Rapid descent toward clouds
          satState.cameraZoom = 1.6 + zSub * 1.8;
          satState.earthZoom = 1.65 + zSub * 1.6;
        }

        // Minimal Text Label
        if (labelRef.current) {
          if (p < 0.1) {
            labelRef.current.style.opacity = '0';
          } else if (p < 0.75) {
            const op = Math.min(1, (p - 0.1) / 0.15);
            labelRef.current.style.opacity = op.toString();
          } else {
            const op = Math.max(0, 1 - (p - 0.75) / 0.15);
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
      className="relative w-full h-screen overflow-hidden bg-[#010306] select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Minimalistic Cinematic Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-16 z-10">
        <div className="flex justify-between items-center text-xs tracking-[0.3em] font-mono text-cyan-500/70 uppercase">
          <span>STAGE 02 // MULTISPECTRAL OBSERVATORY</span>
          <span>ALT 705 KM // SUN-SYNCHRONOUS</span>
        </div>

        {/* Minimal Text Label */}
        <div
          ref={labelRef}
          className="flex flex-col items-center justify-center text-center space-y-2 my-auto opacity-0 transition-opacity duration-300"
        >
          <h2 className="text-4xl md:text-6xl font-light tracking-[0.35em] text-white font-['Space_Grotesk']">
            SATELLITE
          </h2>
          <span className="text-xs md:text-sm tracking-[0.5em] text-emerald-400/80 font-mono uppercase">
            SOLAR ARRAY DEPLOYED // NADIR OBSERVATION ACTIVE
          </span>
        </div>

        <div className="flex justify-between items-end text-xs tracking-widest font-mono text-slate-500">
          <span>SPECTRAL BANDS: VNIR / SWIR / THERMAL</span>
          <span>RESOLUTION: 10M / PIXEL</span>
        </div>
      </div>
    </section>
  );
};
