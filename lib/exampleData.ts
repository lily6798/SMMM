// Synthetic example data for the "See an example model" demo page.
// NOT real client data — Hill-saturation response curves + a randomized
// weekly series, purely to show what Model Results looks like once a real
// model exists for a client.

export const GOLD = "#FDB600";
export const GREYS = ["#585858", "#7A7A7A", "#9E9E9E", "#C2C2C2", "#6B6B6B", "#8C8C8C"];

export type Channel = { key: string; name: string; spend: number; vmax: number; k: number; s: number };

export const CHANNELS: Channel[] = [
  { key: "bvod", name: "BVOD", spend: 8000, vmax: 46000, k: 9000, s: 1.6 },
  { key: "prog", name: "Programmatic Display", spend: 6000, vmax: 24000, k: 5000, s: 1.4 },
  { key: "olv", name: "Online Video", spend: 4000, vmax: 21000, k: 6000, s: 1.5 },
  { key: "social", name: "Paid Social", spend: 5000, vmax: 27000, k: 4500, s: 1.3 },
  { key: "search", name: "Search", spend: 4500, vmax: 30000, k: 3000, s: 1.2 },
  { key: "radio", name: "Radio", spend: 5500, vmax: 20000, k: 7000, s: 1.7 },
  { key: "ooh", name: "OOH", spend: 4000, vmax: 17000, k: 6500, s: 1.8 },
];

export const BASE_WEEKLY = 62000;

export function hill(x: number, ch: Pick<Channel, "vmax" | "k" | "s">) {
  return (ch.vmax * Math.pow(x, ch.s)) / (Math.pow(ch.k, ch.s) + Math.pow(x, ch.s));
}

export function marginal(x: number, ch: Pick<Channel, "vmax" | "k" | "s">) {
  return (hill(x + 100, ch) - hill(x, ch)) / 100;
}

export const fmt = (n: number) => "$" + Math.round(n).toLocaleString();
export const fmtK = (n: number) => "$" + (n >= 1000 ? Math.round(n / 1000) + "k" : Math.round(n));
export const colourOf = (i: number) => (i === 0 ? GOLD : GREYS[(i - 1) % GREYS.length]);

export function buildWeeks() {
  const out: Array<Record<string, number | string>> = [];
  for (let w = 1; w <= 52; w++) {
    const season = 1 + 0.28 * Math.sin(((w - 8) / 52) * Math.PI * 2) + (w >= 24 && w <= 28 ? 0.22 : 0);
    const row: Record<string, number | string> = {
      week: "W" + w,
      Base: Math.round(BASE_WEEKLY * season * (0.95 + 0.1 * Math.random())),
    };
    CHANNELS.forEach((ch, i) => {
      const flight = i === 6 ? (w % 13 < 7 ? 1.4 : 0.3) : 0.85 + 0.3 * Math.random();
      row[ch.name] = Math.round(hill(ch.spend * flight * season, ch));
    });
    out.push(row);
  }
  return out;
}

export function buildRoiData() {
  return CHANNELS.map((c) => ({ name: c.name, roi: +(hill(c.spend, c) / c.spend).toFixed(2) })).sort(
    (a, b) => b.roi - a.roi,
  );
}

export function buildCurveData() {
  const pts: Array<Record<string, number>> = [];
  for (let x = 0; x <= 16000; x += 500) {
    const r: Record<string, number> = { spend: x };
    CHANNELS.forEach((c) => (r[c.name] = Math.round(hill(x, c))));
    pts.push(r);
  }
  return pts;
}
