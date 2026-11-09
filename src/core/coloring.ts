export type Point = [number, number];
export function distanceToSegment(point: Point, start: Point, end: Point): number {
  const dx = end[0] - start[0], dy = end[1] - start[1];
  const t = dx === 0 && dy === 0 ? 0 : Math.max(0, Math.min(1, ((point[0] - start[0]) * dx + (point[1] - start[1]) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(point[0] - start[0] - t * dx, point[1] - start[1] - t * dy);
}
export function markCoverage(samples: Point[], covered: Set<number>, start: Point, end: Point, radius: number) {
  samples.forEach((point, index) => { if (!covered.has(index) && distanceToSegment(point, start, end) <= radius) covered.add(index); });
  return samples.length ? covered.size / samples.length * 100 : 0;
}
