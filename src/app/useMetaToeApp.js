import { useEffect, useMemo, useReducer, useRef } from 'react';
import { createMetrics } from '../session/metrics.js';
import { createRivalryStorage } from '../session/rivalryStorage.js';
import { createInitialAppState, reduceApp } from './appState.js';
import { recordAbandonedMatchIfPlaying } from './matchLifecycle.js';

export function useMetaToeApp() {
  const services = useMemo(
    () => ({
      rivalry: createRivalryStorage(),
      metrics: createMetrics(),
    }),
    [],
  );

  const [state, dispatch] = useReducer(
    (current, action) => reduceApp(current, action, services),
    undefined,
    createInitialAppState,
  );

  const servicesRef = useRef(services);
  servicesRef.current = services;

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const onPageHide = () => {
      recordAbandonedMatchIfPlaying(state.phase, servicesRef.current.metrics);
    };
    window.addEventListener('pagehide', onPageHide);
    return () => window.removeEventListener('pagehide', onPageHide);
  }, [state.phase]);

  return { state, dispatch, services };
}
