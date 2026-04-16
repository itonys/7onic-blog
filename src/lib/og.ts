// Shared OG image utilities

export const PALETTES = [
  { from: '#02010e', to: '#060318', accent: '#a78bfa', glow: 'rgba(139,92,246,0.58)' },
  { from: '#060208', to: '#130507', accent: '#fb923c', glow: 'rgba(251,146,60,0.54)' },
  { from: '#010510', to: '#01091c', accent: '#38bdf8', glow: 'rgba(56,189,248,0.54)' },
  { from: '#010805', to: '#010e06', accent: '#4ade80', glow: 'rgba(74,222,128,0.50)' },
  { from: '#040210', to: '#0a031c', accent: '#c084fc', glow: 'rgba(192,132,252,0.58)' },
  { from: '#070101', to: '#120202', accent: '#f87171', glow: 'rgba(248,113,113,0.54)' },
  { from: '#010810', to: '#01101c', accent: '#22d3ee', glow: 'rgba(34,211,238,0.54)' },
  { from: '#060604', to: '#0e0c02', accent: '#facc15', glow: 'rgba(250,204,21,0.48)' },
  { from: '#06020c', to: '#0f0318', accent: '#f472b6', glow: 'rgba(244,114,182,0.54)' },
  { from: '#020806', to: '#03120a', accent: '#34d399', glow: 'rgba(52,211,153,0.50)' },
];

export function hashToPalette(id: string): typeof PALETTES[number] {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  return PALETTES[Math.abs(h) % PALETTES.length];
}

export const MILKY_WAY = [
  { left: -80,  top: 330, w: 560, h: 200, o: 0.050 },
  { left: 200,  top: 225, w: 520, h: 170, o: 0.068 },
  { left: 460,  top: 148, w: 460, h: 155, o: 0.058 },
  { left: 700,  top: 72,  w: 400, h: 138, o: 0.042 },
];

export const STARS = Array.from({ length: 12 }, (_, i) => {
  const a = Math.abs(Math.sin(i * 2.1 + 1.5));
  const b = Math.abs(Math.sin(i * 3.7 + 2.3));
  const c = Math.abs(Math.sin(i * 5.3 + 0.7));
  const d = Math.abs(Math.sin(i * 7.9 + 3.1));
  return {
    left: Math.floor(a * 1180),
    top:  Math.floor(b * 610),
    size: 1.2 + c * 2.2,
    opacity: 0.30 + d * 0.60,
  };
});
