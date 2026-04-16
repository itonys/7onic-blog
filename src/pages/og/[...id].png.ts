import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import satori from 'satori';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

// Bold gradient palettes — picked by post ID hash
const PALETTES = [
  { from: '#02010e', to: '#060318', accent: '#a78bfa', glow: 'rgba(139,92,246,0.58)' },  // violet
  { from: '#060208', to: '#130507', accent: '#fb923c', glow: 'rgba(251,146,60,0.54)' },   // orange
  { from: '#010510', to: '#01091c', accent: '#38bdf8', glow: 'rgba(56,189,248,0.54)' },   // sky
  { from: '#010805', to: '#010e06', accent: '#4ade80', glow: 'rgba(74,222,128,0.50)' },   // green
  { from: '#040210', to: '#0a031c', accent: '#c084fc', glow: 'rgba(192,132,252,0.58)' },  // purple
  { from: '#070101', to: '#120202', accent: '#f87171', glow: 'rgba(248,113,113,0.54)' },  // red
  { from: '#010810', to: '#01101c', accent: '#22d3ee', glow: 'rgba(34,211,238,0.54)' },   // cyan
  { from: '#060604', to: '#0e0c02', accent: '#facc15', glow: 'rgba(250,204,21,0.48)' },   // yellow
  { from: '#06020c', to: '#0f0318', accent: '#f472b6', glow: 'rgba(244,114,182,0.54)' },  // pink
  { from: '#020806', to: '#03120a', accent: '#34d399', glow: 'rgba(52,211,153,0.50)' },   // emerald
];

// Hash post ID → palette index (deterministic per post, feels random across posts)
function hashToPalette(id: string): typeof PALETTES[number] {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  return PALETTES[Math.abs(h) % PALETTES.length];
}

// Load fonts
const fontRegular = fs.readFileSync(
  path.resolve(process.cwd(), 'src/assets/fonts/atkinson-regular.woff')
);
const fontBold = fs.readFileSync(
  path.resolve(process.cwd(), 'src/assets/fonts/atkinson-bold.woff')
);

// Load logo
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
  const { title } = post.data;

  const colors = hashToPalette(post.id);

  const displayTitle = title.length > 55 ? title.slice(0, 52) + '...' : title;
  const titleFontSize = displayTitle.length > 45 ? '64px' : displayTitle.length > 30 ? '80px' : '96px';

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          // Single strong nebula: top-right corner blast + deep space base
          background: [
            `radial-gradient(ellipse 860px 680px at 94% -2%, ${colors.glow} 0%, transparent 58%)`,
            `linear-gradient(155deg, ${colors.from} 0%, ${colors.to} 100%)`,
          ].join(', '),
          position: 'relative',
          overflow: 'hidden',
        },
        children: [
          // Top accent line
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '0',
                left: '0',
                right: '0',
                height: '3px',
                background: `linear-gradient(90deg, transparent 0%, ${colors.accent} 30%, ${colors.accent} 70%, transparent 100%)`,
                opacity: 0.9,
              },
            },
          },

          // Ghost "7" — large design element
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                right: '-30px',
                top: '-50px',
                fontSize: '620px',
                fontWeight: '700',
                color: 'rgba(255,255,255,0.040)',
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
                padding: '52px 72px',
              },
              children: [
                // TOP: Logo mark
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
                            fontSize: '15px',
                            fontWeight: '400',
                            color: 'rgba(255,255,255,0.28)',
                            letterSpacing: '0.04em',
                          },
                          children: 'Blog',
                        },
                      },
                    ],
                  },
                },

                // MIDDLE: Title only (huge)
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: titleFontSize,
                      fontWeight: '700',
                      color: '#ffffff',
                      lineHeight: '1.12',
                      letterSpacing: '-0.03em',
                      maxWidth: '1020px',
                    },
                    children: displayTitle,
                  },
                },

                // BOTTOM: Accent dash + domain
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
                          style: {
                            width: '32px',
                            height: '3px',
                            borderRadius: '2px',
                            background: colors.accent,
                            opacity: 0.8,
                          },
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '13px',
                            fontWeight: '400',
                            color: 'rgba(255,255,255,0.22)',
                            letterSpacing: '0.03em',
                          },
                          children: 'blog.7onic.design',
                        },
                      },
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
