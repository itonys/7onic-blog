import type { APIRoute } from 'astro';
import satori from 'satori';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { CATEGORIES, SERIES } from '../../../consts';
import { hashToPalette, MILKY_WAY, STARS } from '../../../lib/og';

// Load fonts
const fontRegular = fs.readFileSync(
  path.resolve(process.cwd(), 'src/assets/fonts/atkinson-regular.woff')
);
const fontBold = fs.readFileSync(
  path.resolve(process.cwd(), 'src/assets/fonts/atkinson-bold.woff')
);

// Load logo — dark mode mono palette
const logoSvgBuf = fs.readFileSync(path.resolve(process.cwd(), 'public/favicon.svg'));
const logoSvgMono = logoSvgBuf.toString()
  .replace(/fill="#F46181"/g, 'fill="#6B7280"')
  .replace(/fill="#37D0DE"/g, 'fill="#D1D5DB"')
  .replace(/fill="#6D70E3"/g, 'fill="#F3F4F6"');
const logoPngBuf = await sharp(Buffer.from(logoSvgMono)).resize(null, 40).png().toBuffer();
const logoDataUrl = `data:image/png;base64,${logoPngBuf.toString('base64')}`;

export function getStaticPaths() {
  return [
    { params: { slug: 'home' },  props: { title: '7onic Blog',    label: 'Design to Code' } },
    { params: { slug: 'about' }, props: { title: 'About',         label: '7onic Blog' } },
    ...CATEGORIES.map((c) => ({
      params: { slug: `category-${c.id}` },
      props: { title: c.label, label: 'Category' },
    })),
    ...SERIES.map((s) => ({
      params: { slug: `series-${s.id}` },
      props: { title: s.label, label: 'Series' },
    })),
  ];
}

export const GET: APIRoute = async ({ props, params }) => {
  const { title, label } = props as { title: string; label: string };
  const colors = hashToPalette(params.slug as string);

  const titleFontSize = title.length > 20 ? '72px' : '88px';

  const svg = await satori(
    {
      type: 'div',
      props: {
        style: {
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          background: [
            `radial-gradient(ellipse 860px 680px at 94% -2%, ${colors.glow} 0%, transparent 58%)`,
            `linear-gradient(155deg, ${colors.from} 0%, ${colors.to} 100%)`,
          ].join(', '),
          position: 'relative',
          overflow: 'hidden',
        },
        children: [
          // Milky Way band
          ...MILKY_WAY.map((b) => ({
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                left: `${b.left}px`,
                top:  `${b.top}px`,
                width:  `${b.w}px`,
                height: `${b.h}px`,
                background: `radial-gradient(ellipse at center, rgba(255,255,255,${b.o}) 0%, transparent 70%)`,
                borderRadius: '50%',
              },
            },
          })),

          // Stars
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

          // Top accent line
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                top: '0', left: '0', right: '0',
                height: '3px',
                background: `linear-gradient(90deg, transparent 0%, ${colors.accent} 30%, ${colors.accent} 70%, transparent 100%)`,
                opacity: 0.9,
              },
            },
          },

          // Ghost "7"
          {
            type: 'div',
            props: {
              style: {
                position: 'absolute',
                right: '-30px', top: '-50px',
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
                // TOP: Logo
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'center', gap: '10px' },
                    children: [
                      {
                        type: 'img',
                        props: {
                          src: logoDataUrl,
                          width: 27, height: 40,
                          style: { width: '27px', height: '40px' },
                        },
                      },
                      {
                        type: 'span',
                        props: {
                          style: {
                            fontSize: '15px', fontWeight: '400',
                            color: 'rgba(255,255,255,0.28)',
                            letterSpacing: '0.04em',
                          },
                          children: 'Blog',
                        },
                      },
                    ],
                  },
                },

                // MIDDLE: Title
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
                    children: title,
                  },
                },

                // BOTTOM: label + domain
                {
                  type: 'div',
                  props: {
                    style: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
                    children: [
                      {
                        type: 'div',
                        props: {
                          style: { display: 'flex', alignItems: 'center', gap: '10px' },
                          children: [
                            {
                              type: 'div',
                              props: {
                                style: {
                                  width: '20px', height: '2px', borderRadius: '1px',
                                  background: colors.accent, opacity: 0.8,
                                },
                              },
                            },
                            {
                              type: 'span',
                              props: {
                                style: {
                                  fontSize: '13px', fontWeight: '700',
                                  color: colors.accent,
                                  letterSpacing: '0.12em',
                                  textTransform: 'uppercase',
                                  opacity: 0.85,
                                },
                                children: label,
                              },
                            },
                          ],
                        },
                      },
                      {
                        type: 'div',
                        props: {
                          style: {
                            fontSize: '13px', fontWeight: '400',
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
