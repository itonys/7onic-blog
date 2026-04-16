import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { CATEGORIES, SERIES } from '../../consts';

// Category colors with dual-nebula (primary + secondary corner)
const CATEGORY_COLORS: Record<string, {
  from: string; to: string; accent: string;
  glow: string; glow2: string;
}> = {
  'design-system': { from: '#02010e', to: '#070420', accent: '#a78bfa', glow: 'rgba(139,92,246,0.30)', glow2: 'rgba(56,189,248,0.11)' },
  'tokens':        { from: '#060208', to: '#140608', accent: '#fb923c', glow: 'rgba(251,146,60,0.28)', glow2: 'rgba(244,97,129,0.11)' },
  'components':    { from: '#010510', to: '#020c1e', accent: '#38bdf8', glow: 'rgba(56,189,248,0.28)', glow2: 'rgba(167,139,250,0.11)' },
  'tailwind':      { from: '#010810', to: '#010e1e', accent: '#22d3ee', glow: 'rgba(34,211,238,0.28)', glow2: 'rgba(99,102,241,0.11)' },
  'ai':            { from: '#010805', to: '#020e07', accent: '#4ade80', glow: 'rgba(74,222,128,0.24)', glow2: 'rgba(34,211,238,0.11)' },
  'cli':           { from: '#040210', to: '#0c041e', accent: '#c084fc', glow: 'rgba(192,132,252,0.30)', glow2: 'rgba(244,97,129,0.11)' },
  'devops':        { from: '#070101', to: '#140202', accent: '#f87171', glow: 'rgba(248,113,113,0.28)', glow2: 'rgba(251,146,60,0.11)' },
};

const DEFAULT_COLORS = {
  from: '#02010e', to: '#070420', accent: '#7c3aed',
  glow: 'rgba(124,58,237,0.30)', glow2: 'rgba(56,189,248,0.11)',
};

// Deterministic star field (no randomness at runtime)
const STARS = Array.from({ length: 60 }, (_, i) => {
  const a = Math.abs(Math.sin(i * 2.1 + 1.5));
  const b = Math.abs(Math.sin(i * 3.7 + 2.3));
  const c = Math.abs(Math.sin(i * 5.3 + 0.7));
  const d = Math.abs(Math.sin(i * 7.9 + 3.1));
  return {
    left: Math.floor(a * 1190),
    top:  Math.floor(b * 620),
    size: 0.7 + c * 1.6,      // 0.7–2.3 px
    opacity: 0.15 + d * 0.65, // 0.15–0.80
  };
});

// Load fonts
const fontRegular = fs.readFileSync(
  path.resolve(process.cwd(), 'src/assets/fonts/atkinson-regular.woff')
);
const fontBold = fs.readFileSync(
  path.resolve(process.cwd(), 'src/assets/fonts/atkinson-bold.woff')
);

// Load logo (SVG → PNG data URL for satori)
const logoSvgBuf = fs.readFileSync(path.resolve(process.cwd(), 'public/favicon.svg'));
const logoPngBuf = await sharp(logoSvgBuf).resize(null, 40).png().toBuffer();
const logoDataUrl = `data:image/png;base64,${logoPngBuf.toString('base64')}`;

export async function getStaticPaths() {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  return posts.map((post) => ({
    params: { id: post.id },
    props: { post },
  }));
}

export const GET: APIRoute = async ({ props }) => {
  const { post } = props as Awaited<ReturnType<typeof getStaticPaths>>[number]['props'];
  const { title, description, category, tags = [], series, seriesOrder } = post.data;

  const colors = CATEGORY_COLORS[category] ?? DEFAULT_COLORS;
  const categoryLabel = CATEGORIES.find((c) => c.id === category)?.label ?? category;
  const seriesLabel = series ? SERIES.find((s) => s.id === series)?.label : undefined;

  const displayTitle = title.length > 55 ? title.slice(0, 52) + '...' : title;
  const displayDesc = description.length > 90 ? description.slice(0, 87) + '...' : description;
  const titleFontSize = displayTitle.length > 35 ? '46px' : '54px';

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          // 4-layer cosmic background:
          // 1) secondary nebula — bottom-left
          // 2) primary nebula   — top-right (category accent)
          // 3) milky way band   — wide flat ellipse across center
          // 4) deep space base
          background: [
            `radial-gradient(ellipse 480px 380px at 8% 88%, ${colors.glow2} 0%, transparent 70%)`,
            `radial-gradient(ellipse 1100px 900px at 90% -18%, ${colors.glow} 0%, transparent 55%)`,
            `radial-gradient(ellipse 950px 260px at 52% 68%, rgba(255,255,255,0.014) 0%, transparent 100%)`,
            `linear-gradient(162deg, ${colors.from} 0%, ${colors.to} 100%)`,
          ].join(', '),
          position: 'relative',
          overflow: 'hidden',
        },
        children: [
          // Star field
          ...STARS.map((s) => ({
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                left: `${s.left}px`,
                top:  `${s.top}px`,
                width:  `${s.size}px`,
                height: `${s.size}px`,
                borderRadius: '50%',
                background: '#ffffff',
                opacity: s.opacity,
              },
            },
          })),

          // Top accent line — center-peaked like a cosmic horizon
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                height: '2px',
                background: `linear-gradient(90deg, transparent 0%, ${colors.accent} 35%, ${colors.accent} 65%, transparent 100%)`,
                opacity: 0.85,
              },
            },
          },

          // Ghost "7" watermark
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                right: '-20px',
                top: '-40px',
                fontSize: '560px',
                fontWeight: '700',
                color: 'rgba(255,255,255,0.022)',
                lineHeight: '1',
                letterSpacing: '-0.05em',
                userSelect: 'none',
              },
              children: '7',
            },
          },

          // Main content
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '100%',
                padding: '52px 72px 52px 72px',
              },
              children: [
                // Top row: brand + URL
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: { display: 'flex', alignItems: 'center', gap: '10px' },
                          children: [
                            {
                              type: 'img',
                              props: {
                                src: logoDataUrl,
                                width: 27,
                                height: 40,
                                style: { width: '27px', height: '40px' },
                              },
                            },
                            {
                              type: 'span',
                              props: {
                                style: {
                                  fontSize: '14px',
                                  fontWeight: '400',
                                  color: 'rgba(255,255,255,0.32)',
                                  letterSpacing: '0.02em',
                                },
                                children: '/ Blog',
                              },
                            },
                          ],
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '14px',
                            color: 'rgba(255,255,255,0.28)',
                            letterSpacing: '0.02em',
                          },
                          children: 'blog.7onic.design',
                        },
                      },
                    ],
                  },
                },

                // Center: series badge + title + description
                {
                  type: 'div',
                  props: {
                    style: {
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '18px',
                      maxWidth: '780px',
                    },
                    children: [
                      ...(seriesLabel && seriesOrder ? [{
                        type: 'div',
                        props: {
                          style: { display: 'flex', alignItems: 'center', gap: '8px' },
                          children: [
                            {
                              type: 'div',
                              props: {
                                style: {
                                  width: '4px',
                                  height: '18px',
                                  borderRadius: '2px',
                                  background: colors.accent,
                                },
                              },
                            },
                            {
                              type: 'span',
                              props: {
                                style: {
                                  fontSize: '13px',
                                  fontWeight: '400',
                                  color: colors.accent,
                                  letterSpacing: '0.06em',
                                  textTransform: 'uppercase',
                                },
                                children: `${seriesLabel}  ·  #${seriesOrder}`,
                              },
                            },
                          ],
                        },
                      }] : []),
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: titleFontSize,
                            fontWeight: '700',
                            color: '#ffffff',
                            lineHeight: '1.18',
                            letterSpacing: '-0.02em',
                          },
                          children: displayTitle,
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '20px',
                            fontWeight: '400',
                            color: 'rgba(255,255,255,0.42)',
                            lineHeight: '1.55',
                            letterSpacing: '0.005em',
                          },
                          children: displayDesc,
                        },
                      },
                    ],
                  },
                },

                // Bottom: category + tags
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'center', gap: '8px' },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '12px',
                            fontWeight: '700',
                            color: colors.accent,
                            background: `rgba(255,255,255,0.06)`,
                            border: `1px solid ${colors.accent}38`,
                            padding: '5px 14px',
                            borderRadius: '999px',
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                          },
                          children: categoryLabel,
                        },
                      },
                      ...tags.slice(0, 3).map((tag: string) => ({
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '12px',
                            fontWeight: '400',
                            color: 'rgba(255,255,255,0.32)',
                            background: 'rgba(255,255,255,0.04)',
                            padding: '5px 14px',
                            borderRadius: '999px',
                          },
                          children: `#${tag}`,
                        },
                      })),
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: 'Atkinson', data: fontRegular, weight: 400, style: 'normal' },
        { name: 'Atkinson', data: fontBold,   weight: 700, style: 'normal' },
      ],
    }
  );

  const png = await sharp(Buffer.from(svg)).png().toBuffer();

  return new Response(png, {
    headers: {
      'Content-Type': 'image/png',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};
