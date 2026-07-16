import { GLYPHS, P } from "./glyph-data";

export type Point = [number, number];
export type Contour = Point[];
export type Shape = Contour[];

/** Decode "x,y x,y ..." strings into the point structure used for interpolation. */
export function parseGlyph(code: string): Shape {
  const g = GLYPHS[code];
  if (!g) throw new Error(`No outline data for locale "${code}"`);
  return g.map((c) => c.split(" ").map((p) => p.split(",").map(Number) as Point));
}

/**
 * Rotate the target contour's start vertex to whichever offset sits nearest the
 * source's. Skip this and A → あ unwinds like a spool: every vertex takes the
 * long way round before the shape settles.
 */
function alignContour(from: Contour, to: Contour): Contour {
  let best = Infinity;
  let offset = 0;
  for (let o = 0; o < P; o++) {
    let sum = 0;
    for (let i = 0; i < P; i += 3) {
      const a = from[i];
      const b = to[(i + o) % P];
      sum += (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
    }
    if (sum < best) {
      best = sum;
      offset = o;
    }
  }
  return to.slice(offset).concat(to.slice(0, offset));
}

export const align = (from: Shape, to: Shape): Shape =>
  from.map((c, i) => alignContour(c, to[i]));

export const lerpShape = (a: Shape, b: Shape, t: number): Shape =>
  a.map((contour, i) =>
    contour.map(([x, y], j): Point => [
      x + (b[i][j][0] - x) * t,
      y + (b[i][j][1] - y) * t,
    ]),
  );

export const toPath = (shape: Shape): string =>
  shape
    .map(
      (c) =>
        "M" + c.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join("L") + "Z",
    )
    .join("");

const channels = (h: string): [number, number, number] => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

export function lerpColor(a: string, b: string, t: number): string {
  const [r1, g1, b1] = channels(a);
  const [r2, g2, b2] = channels(b);
  const m = (x: number, y: number) => Math.round(x + (y - x) * t);
  return `rgb(${m(r1, r2)},${m(g1, g2)},${m(b1, b2)})`;
}

/** Back-ease: the outline springs a touch past its target, then settles. */
export function easeInOutBack(t: number): number {
  const c = 1.70158 * 1.2;
  return t < 0.5
    ? ((2 * t) ** 2 * ((c + 1) * 2 * t - c)) / 2
    : ((2 * t - 2) ** 2 * ((c + 1) * (2 * t - 2) + c) + 2) / 2;
}
