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

    // Deep Space Starfield
    const stars: { x: number; y: number; size: number; alpha: number; speed: number; color: string }[] = [];
    const colors = ['#ffffff', '#bfdbfe', '#fef08a', '#93c5fd'];
    for (let i = 0; i < 450; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.6 + 0.3,
        alpha: Math.random() * 0.85 + 0.15,
        speed: Math.random() * 0.04 + 0.01,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    // Scrubbed state controlled by GSAP
    const satState = {
      progress: 0,
      leftWingAngle: 0,
      leftWingPanels: 0,
      rightWingAngle: 0,
      rightWingPanels: 0,
      satelliteRotation: 0,
      cameraZoom: 1,
      earthZoom: 1,
      scanBeamAlpha: 0,
    };

    let tick = 0;

    const render = () => {
      tick++;
      const p = satState.progress;

      // 1. Photorealistic Deep Space Backdrop
      ctx.fillStyle = '#010206';
      ctx.fillRect(0, 0, width, height);

      // Starfield drift
      for (let s of stars) {
        const starX = (s.x - tick * s.speed + width) % width;
        ctx.fillStyle = s.color;
        ctx.globalAlpha = s.alpha;
        ctx.beginPath();
        ctx.arc(starX, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      // 2. Photorealistic Curved Earth with Specular Ocean & Atmospheric Scattering
      const earthCenterX = width * 0.5;
      const baseEarthRadius = Math.max(width, height) * 0.9;
      const earthRadius = baseEarthRadius * satState.earthZoom;
      const earthCenterY = height * 0.98 + earthRadius * 0.65 - (satState.earthZoom - 1) * 380;

      ctx.save();

      // Atmospheric Rayleigh Blue Limb Glow (Outer Haze)
      const atmoGlow = ctx.createRadialGradient(
        earthCenterX,
        earthCenterY,
        earthRadius - 35,
        earthCenterX,
        earthCenterY,
        earthRadius + 85
      );
      atmoGlow.addColorStop(0, 'rgba(56, 189, 248, 0.55)');
      atmoGlow.addColorStop(0.25, 'rgba(14, 165, 233, 0.35)');
      atmoGlow.addColorStop(0.65, 'rgba(3, 105, 161, 0.12)');
      atmoGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = atmoGlow;
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, earthRadius + 85, 0, Math.PI * 2);
      ctx.fill();

      // Clip to Earth Sphere
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, earthRadius, 0, Math.PI * 2);
      ctx.clip();

      // Deep Ocean PBR Gradient
      const oceanGrad = ctx.createRadialGradient(
        earthCenterX - earthRadius * 0.2,
        earthCenterY - earthRadius * 0.6,
        earthRadius * 0.05,
        earthCenterX,
        earthCenterY,
        earthRadius
      );
      oceanGrad.addColorStop(0, '#0c4a80');
      oceanGrad.addColorStop(0.4, '#062d56');
      oceanGrad.addColorStop(0.8, '#021832');
      oceanGrad.addColorStop(1, '#010c1c');
      ctx.fillStyle = oceanGrad;
      ctx.fill();

      // Specular Sun Glint on Ocean
      const sunGlint = ctx.createRadialGradient(
        earthCenterX - earthRadius * 0.15,
        earthCenterY - earthRadius * 0.65,
        5,
        earthCenterX - earthRadius * 0.15,
        earthCenterY - earthRadius * 0.65,
        220
      );
      sunGlint.addColorStop(0, 'rgba(255, 255, 255, 0.55)');
      sunGlint.addColorStop(0.4, 'rgba(186, 230, 253, 0.2)');
      sunGlint.addColorStop(1, 'rgba(12, 74, 128, 0)');
      ctx.fillStyle = sunGlint;
      ctx.fill();

      // Realistic Continents & Agricultural Landmasses
      ctx.save();
      const drift = (tick * 0.06) % (width * 2);
      ctx.translate(drift - width * 0.5, 0);

      // Major Landmass (South Asia & Indo-Gangetic Basin)
      ctx.beginPath();
      ctx.moveTo(earthCenterX - 380, earthCenterY - earthRadius + 210);
      ctx.bezierCurveTo(
        earthCenterX - 240,
        earthCenterY - earthRadius + 90,
        earthCenterX - 70,
        earthCenterY - earthRadius + 140,
        earthCenterX + 90,
        earthCenterY - earthRadius + 260
      );
      ctx.bezierCurveTo(
        earthCenterX + 210,
        earthCenterY - earthRadius + 350,
        earthCenterX + 60,
        earthCenterY - earthRadius + 460,
        earthCenterX - 140,
        earthCenterY - earthRadius + 400
      );
      ctx.closePath();

      // Land vegetation gradient (Lush Green basin to arid plateaus)
      const landGrad = ctx.createLinearGradient(
        earthCenterX - 200,
        earthCenterY - earthRadius + 100,
        earthCenterX + 100,
        earthCenterY - earthRadius + 400
      );
      landGrad.addColorStop(0, '#164e2d'); // Northern fertile plains
      landGrad.addColorStop(0.4, '#1b5a34');
      landGrad.addColorStop(0.7, '#2d6a4f');
      landGrad.addColorStop(1, '#1e3d29');

      ctx.fillStyle = landGrad;
      ctx.fill();

      // Coastal Shallow Waters / Turquoise Continental Shelf
      ctx.strokeStyle = 'rgba(45, 212, 191, 0.35)';
      ctx.lineWidth = 8;
      ctx.stroke();

      // Secondary Eastern Archipelago
      ctx.beginPath();
      ctx.moveTo(earthCenterX + 240, earthCenterY - earthRadius + 170);
      ctx.bezierCurveTo(
        earthCenterX + 400,
        earthCenterY - earthRadius + 120,
        earthCenterX + 540,
        earthCenterY - earthRadius + 300,
        earthCenterX + 370,
        earthCenterY - earthRadius + 410
      );
      ctx.closePath();
      ctx.fillStyle = '#1e3d29';
      ctx.fill();
      ctx.restore();

      // Realistic Volumetric Storm & Cloud Bands with Self-Shadowing
      ctx.save();
      const cloudDrift = (tick * 0.12) % (width * 2);
      ctx.translate(cloudDrift - width * 0.5, 0);

      // Cloud Band 1 (Tropical Convergence)
      const cloudGrad1 = ctx.createRadialGradient(
        earthCenterX,
        earthCenterY - earthRadius + 180,
        30,
        earthCenterX,
        earthCenterY - earthRadius + 180,
        380
      );
      cloudGrad1.addColorStop(0, 'rgba(255, 255, 255, 0.82)');
      cloudGrad1.addColorStop(0.5, 'rgba(230, 240, 255, 0.45)');
      cloudGrad1.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = cloudGrad1;
      ctx.beginPath();
      ctx.ellipse(
        earthCenterX,
        earthCenterY - earthRadius + 180,
        400,
        95,
        Math.PI * 0.06,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Cloud Cyclonic Swirl 2 (Target Storm System)
      const cloudGrad2 = ctx.createRadialGradient(
        earthCenterX - 200,
        earthCenterY - earthRadius + 240,
        20,
        earthCenterX - 200,
        earthCenterY - earthRadius + 240,
        300
      );
      cloudGrad2.addColorStop(0, 'rgba(255, 255, 255, 0.92)');
      cloudGrad2.addColorStop(0.55, 'rgba(210, 225, 245, 0.55)');
      cloudGrad2.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = cloudGrad2;
      ctx.beginPath();
      ctx.ellipse(
        earthCenterX - 200,
        earthCenterY - earthRadius + 240,
        310,
        120,
        -Math.PI * 0.05,
        0,
        Math.PI * 2
      );
      ctx.fill();
      ctx.restore();

      // Earth Horizon Rim Glow
      const rimGrad = ctx.createRadialGradient(
        earthCenterX,
        earthCenterY,
        earthRadius - 18,
        earthCenterX,
        earthCenterY,
        earthRadius
      );
      rimGrad.addColorStop(0, 'rgba(186, 230, 253, 0)');
      rimGrad.addColorStop(0.65, 'rgba(125, 211, 252, 0.55)');
      rimGrad.addColorStop(1, 'rgba(255, 255, 255, 0.95)');
      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(earthCenterX, earthCenterY, earthRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore(); // end Earth clip

      // 3. Photorealistic Earth-Observation Scientific Satellite
      const satX = width * 0.5;
      const satY = height * 0.38 + (p > 0.7 ? (p - 0.7) * 320 : 0);
      const satScale = (1 + (satState.cameraZoom - 1) * 0.45) * (p > 0.8 ? Math.max(0, 1 - (p - 0.8) * 3) : 1);

      if (satScale > 0.04) {
        ctx.save();
        ctx.translate(satX, satY);
        ctx.scale(satScale, satScale);
        ctx.rotate(satState.satelliteRotation);

        // 3a. Optical Multispectral Scanning Swath Beam
        if (satState.scanBeamAlpha > 0.01) {
          const beamGrad = ctx.createLinearGradient(0, 50, 0, 420);
          beamGrad.addColorStop(0, `rgba(56, 189, 248, ${satState.scanBeamAlpha * 0.85})`);
          beamGrad.addColorStop(0.35, `rgba(16, 185, 129, ${satState.scanBeamAlpha * 0.4})`);
          beamGrad.addColorStop(1, 'rgba(6, 182, 212, 0)');

          ctx.fillStyle = beamGrad;
          ctx.beginPath();
          ctx.moveTo(-16, 50);
          ctx.lineTo(16, 50);
          ctx.lineTo(240, 440);
          ctx.lineTo(-240, 440);
          ctx.closePath();
          ctx.fill();

          // High-tech laser raster scan lines
          const pulseY = 60 + ((tick * 3.5) % 350);
          ctx.strokeStyle = `rgba(255, 255, 255, ${satState.scanBeamAlpha * 0.75})`;
          ctx.lineWidth = 1.8;
          ctx.beginPath();
          const scanSpread = (pulseY / 350) * 210 + 24;
          ctx.moveTo(-scanSpread, pulseY);
          ctx.lineTo(scanSpread, pulseY);
          ctx.stroke();
        }

        // 3b. LEFT SOLAR PANEL ARRAY (Mechanical Extension & Gallium Arsenide Cells)
        ctx.save();
        ctx.translate(-42, 0); // Hinge pivot

        const leftHingeAngle = -Math.PI * 0.5 * satState.leftWingAngle;
        ctx.rotate(leftHingeAngle);

        // Titanium Deployment Boom Strut
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -38);
        ctx.stroke();

        // 3-Segment Accordion Panels
        const numPanels = 3;
        const panelW = 36;
        const panelH = 70;

        for (let i = 0; i < numPanels; i++) {
          ctx.save();
          const panelOffset = (i + 0.5) * (panelW + 2) * satState.leftWingPanels;
          ctx.translate(panelOffset, -38);

          const pScaleX = satState.leftWingPanels;
          ctx.scale(pScaleX, 1);

          if (pScaleX > 0.04) {
            // Gallium-Arsenide Dark Indigo / Blue Photovoltaic PBR Material
            const solarGrad = ctx.createLinearGradient(-panelW * 0.5, 0, panelW * 0.5, 0);
            solarGrad.addColorStop(0, '#0a1e36');
            solarGrad.addColorStop(0.3, '#173d6a');
            solarGrad.addColorStop(0.65, '#0c2442');
            solarGrad.addColorStop(1, '#061324');

            ctx.fillStyle = solarGrad;
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 1.6;
            ctx.fillRect(-panelW * 0.5, -panelH * 0.5, panelW, panelH);
            ctx.strokeRect(-panelW * 0.5, -panelH * 0.5, panelW, panelH);

            // Gold Busbar Contact Grid Lines
            ctx.strokeStyle = 'rgba(234, 179, 8, 0.45)';
            ctx.lineWidth = 0.8;
            for (let gy = -panelH * 0.5 + 8; gy < panelH * 0.5; gy += 10) {
              ctx.beginPath();
              ctx.moveTo(-panelW * 0.5, gy);
              ctx.lineTo(panelW * 0.5, gy);
              ctx.stroke();
            }
            // Vertical silver collector
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.beginPath();
            ctx.moveTo(0, -panelH * 0.5);
            ctx.lineTo(0, panelH * 0.5);
            ctx.stroke();

            // Specular Glint
            const glint = (Math.sin(tick * 0.06 + i) + 1) * 0.16;
            ctx.fillStyle = `rgba(255, 255, 255, ${glint})`;
            ctx.fillRect(-panelW * 0.5, -panelH * 0.5, panelW, panelH);
          }
          ctx.restore();
        }
        ctx.restore(); // end Left Wing

        // 3c. RIGHT SOLAR PANEL ARRAY
        ctx.save();
        ctx.translate(42, 0); // Right Hinge

        const rightHingeAngle = Math.PI * 0.5 * satState.rightWingAngle;
        ctx.rotate(rightHingeAngle);

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, -38);
        ctx.stroke();

        for (let i = 0; i < numPanels; i++) {
          ctx.save();
          const panelOffset = -(i + 0.5) * (panelW + 2) * satState.rightWingPanels;
          ctx.translate(panelOffset, -38);

          const pScaleX = satState.rightWingPanels;
          ctx.scale(pScaleX, 1);

          if (pScaleX > 0.04) {
            const solarGrad = ctx.createLinearGradient(-panelW * 0.5, 0, panelW * 0.5, 0);
            solarGrad.addColorStop(0, '#061324');
            solarGrad.addColorStop(0.35, '#173d6a');
            solarGrad.addColorStop(0.7, '#0c2442');
            solarGrad.addColorStop(1, '#061324');

            ctx.fillStyle = solarGrad;
            ctx.strokeStyle = '#475569';
            ctx.lineWidth = 1.6;
            ctx.fillRect(-panelW * 0.5, -panelH * 0.5, panelW, panelH);
            ctx.strokeRect(-panelW * 0.5, -panelH * 0.5, panelW, panelH);

            ctx.strokeStyle = 'rgba(234, 179, 8, 0.45)';
            ctx.lineWidth = 0.8;
            for (let gy = -panelH * 0.5 + 8; gy < panelH * 0.5; gy += 10) {
              ctx.beginPath();
              ctx.moveTo(-panelW * 0.5, gy);
              ctx.lineTo(panelW * 0.5, gy);
              ctx.stroke();
            }
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
            ctx.beginPath();
            ctx.moveTo(0, -panelH * 0.5);
            ctx.lineTo(0, panelH * 0.5);
            ctx.stroke();

            const glint = (Math.sin(tick * 0.06 + i + 1) + 1) * 0.16;
            ctx.fillStyle = `rgba(255, 255, 255, ${glint})`;
            ctx.fillRect(-panelW * 0.5, -panelH * 0.5, panelW, panelH);
          }
          ctx.restore();
        }
        ctx.restore(); // end Right Wing

        // 3d. Satellite Chassis (Crinkled Gold Multi-Layer Insulation Foil)
        const busW = 82;
        const busH = 98;

        const goldGrad = ctx.createLinearGradient(-busW * 0.5, -busH * 0.5, busW * 0.5, busH * 0.5);
        goldGrad.addColorStop(0, '#b45309');
        goldGrad.addColorStop(0.2, '#f59e0b');
        goldGrad.addColorStop(0.45, '#fef08a'); // High specular gleam
        goldGrad.addColorStop(0.75, '#d97706');
        goldGrad.addColorStop(1, '#78350f');

        ctx.fillStyle = goldGrad;
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.roundRect(-busW * 0.5, -busH * 0.5, busW, busH, 7);
        ctx.fill();
        ctx.stroke();

        // Crinkled MLI Surface Normal Facets
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.lineWidth = 1;
        for (let fy = -busH * 0.5 + 10; fy < busH * 0.5; fy += 14) {
          ctx.beginPath();
          ctx.moveTo(-busW * 0.5 + 5, fy);
          ctx.lineTo(busW * 0.5 - 5, fy + Math.sin(fy * 1.5) * 4);
          ctx.stroke();
        }

        // 3e. Earth-Facing Optical Multi-Spectral Sensor Aperture (Nadir)
        const lensGrad = ctx.createRadialGradient(0, busH * 0.5 + 14, 2, 0, busH * 0.5 + 14, 20);
        lensGrad.addColorStop(0, '#06b6d4');
        lensGrad.addColorStop(0.4, '#0284c7');
        lensGrad.addColorStop(0.8, '#0f172a');
        lensGrad.addColorStop(1, '#334155');

        ctx.fillStyle = lensGrad;
        ctx.beginPath();
        ctx.arc(0, busH * 0.5 + 12, 18, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#cbd5e1';
        ctx.lineWidth = 2.8;
        ctx.stroke();

        // Multi-Spectral Optical Coating Glint (Cyan/Magenta)
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(-6, busH * 0.5 + 10, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(6, busH * 0.5 + 10, 4, 0, Math.PI * 2);
        ctx.fill();

        // 3f. High-Gain Telemetry Dish (Top)
        ctx.fillStyle = '#f1f5f9';
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.ellipse(0, -busH * 0.5 - 14, 26, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Sub-reflector Feed Horn
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(-14, -busH * 0.5 - 14);
        ctx.lineTo(0, -busH * 0.5 - 30);
        ctx.lineTo(14, -busH * 0.5 - 14);
        ctx.stroke();

        ctx.fillStyle = '#d97706';
        ctx.beginPath();
        ctx.arc(0, -busH * 0.5 - 30, 3.5, 0, Math.PI * 2);
        ctx.fill();

        // 3g. RCS Thrusters & Telemetry Strobe
        ctx.fillStyle = '#334155';
        [-busW * 0.5, busW * 0.5].forEach((cx) => {
          [-busH * 0.5 + 12, busH * 0.5 - 12].forEach((cy) => {
            ctx.fillRect(cx - (cx < 0 ? 6 : 0), cy - 3.5, 6, 7);
          });
        });

        const ledBlink = (Math.sin(tick * 0.18) + 1) * 0.5;
        ctx.fillStyle = `rgba(16, 185, 129, ${0.5 + ledBlink * 0.5})`;
        ctx.beginPath();
        ctx.arc(-busW * 0.5 + 14, -busH * 0.5 + 16, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(6, 182, 212, ${0.5 + (1 - ledBlink) * 0.5})`;
        ctx.beginPath();
        ctx.arc(-busW * 0.5 + 23, -busH * 0.5 + 16, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // 4. Cloud Penetration Layer (Transition to Weather)
      if (p > 0.82) {
        const cloudEntry = (p - 0.82) / 0.18;
        const entryGrad = ctx.createRadialGradient(
          width * 0.5,
          height * 0.5,
          50,
          width * 0.5,
          height * 0.5,
          width * 0.85
        );
        entryGrad.addColorStop(0, `rgba(148, 163, 184, ${cloudEntry * 0.95})`);
        entryGrad.addColorStop(0.6, `rgba(51, 65, 85, ${cloudEntry * 0.88})`);
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
          satState.cameraZoom = 1.6 + zSub * 1.8;
          satState.earthZoom = 1.65 + zSub * 1.6;
        }

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
      className="relative w-full h-screen overflow-hidden bg-[#010206] select-none"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block" />

      {/* Minimalistic Overlay */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-8 md:p-16 z-10">
        <div className="flex justify-between items-center text-xs tracking-[0.3em] font-mono text-cyan-500/70 uppercase">
          <span>STAGE 02 // MULTISPECTRAL OBSERVATORY</span>
          <span>ALT 705 KM // SUN-SYNCHRONOUS</span>
        </div>

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
