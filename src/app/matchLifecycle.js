/** Record abandoned terminal outcome when user leaves mid-match (R11). */
export function recordAbandonedMatchIfPlaying(phase, metrics) {
  if (phase === 'playing') {
    metrics.record('match_completed', { outcome: 'abandoned' });
  }
}
