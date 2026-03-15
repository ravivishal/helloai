export function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds === undefined) return "N/A";
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
}
