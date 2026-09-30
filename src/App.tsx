import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { RocketSection } from './components/RocketSection';
import { SatelliteSection } from './components/SatelliteSection';
import { WeatherSection } from './components/WeatherSection';
import { SoilSection } from './components/SoilSection';
import { CropPredictionSection } from './components/CropPredictionSection';

gsap.registerPlugin(ScrollTrigger);

export function App() {
  const lenisRef = useRef<Lenis | null>(null);
  const sectionRefs = [
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
    useRef<HTMLDivElement>(null),
  ];

  useEffect(() => {
    // Initialize Lenis Smooth Scrolling
    const lenis = new Lenis({
      duration: 1.4,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });
    lenisRef.current = lenis;

    // Synchronize Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const updateTicker = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateTicker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(updateTicker);
      lenis.destroy();
    };
  }, []);

  // Smooth scroll to a specific section (0: Rocket, 1: Satellite, 2: Weather, 3: Soil, 4: Prediction)
  const handleNavigateSection = (index: number) => {
    if (!lenisRef.current || !sectionRefs[index]?.current) return;
    lenisRef.current.scrollTo(sectionRefs[index].current, {
      offset: 0,
      duration: 2.0,
    });
  };

  return (
    <div className="relative w-full bg-[#020307] text-slate-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* 1. SECTION 1 — ROCKET (Night launch pad -> Ignition -> Ascent -> Space) */}
      <div ref={sectionRefs[0]}>
        <RocketSection />
      </div>

      {/* 2. SECTION 2 — SATELLITE (Earth Orbit -> Unfolding Solar Wings -> Nadir Orientation -> Cloud Dive) */}
      <div ref={sectionRefs[1]}>
        <SatelliteSection />
      </div>

      {/* 3. SECTION 3 — WEATHER (Atmospheric Entry -> Volumetric Storm -> Rain -> Lightning -> Agricultural Fields) */}
      <div ref={sectionRefs[2]}>
        <WeatherSection />
      </div>

      {/* 4. SECTION 4 — SOIL (Underground Strata -> Seed Germination -> Rooting -> Emerging Sapling -> Row Multiplication) */}
      <div ref={sectionRefs[3]}>
        <SoilSection />
      </div>

      {/* 5. SECTION 5 — CROP + PREDICTION (Golden Paddy Wind Waves -> Seamless App UI Reveal -> Crop Yield Prediction Platform) */}
      <div ref={sectionRefs[4]}>
        <CropPredictionSection onNavigateSection={handleNavigateSection} />
      </div>
    </div>
  );
}

export default App;
