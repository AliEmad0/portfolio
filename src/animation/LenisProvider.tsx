'use client';

import { createContext, useContext, useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useReducedMotion } from '@/hooks/useReducedMotion';

gsap.registerPlugin(ScrollTrigger);

/** A stable container whose `.current` holds the live Lenis instance (or null). */
export type LenisRef = { current: Lenis | null };

const LenisContext = createContext<LenisRef>({ current: null });

/**
 * Access the shared Lenis container. Read `.current` at call time (e.g. inside an
 * event handler) to get the live instance, or `null` when smooth scroll is off.
 */
export function useLenis(): LenisRef {
  return useContext(LenisContext);
}

/**
 * Provides a single Lenis smooth-scroll instance (synced with GSAP ScrollTrigger)
 * to descendants via {@link useLenis}. The instance lives in a stable ref so
 * exposing it needs no re-render. Disabled under reduced motion, where `.current`
 * stays `null` and the page uses native scrolling.
 */
export function LenisProvider({ children }: { children: React.ReactNode }) {
  const reduced = useReducedMotion();
  const ref = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reduced) return;
    const instance = new Lenis({ duration: 1.1, smoothWheel: true });
    ref.current = instance;

    const onScroll = () => ScrollTrigger.update();
    instance.on('scroll', onScroll);
    const tick = (time: number) => instance.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      instance.off('scroll', onScroll);
      gsap.ticker.remove(tick);
      instance.destroy();
      ref.current = null;
    };
  }, [reduced]);

  return <LenisContext.Provider value={ref}>{children}</LenisContext.Provider>;
}
