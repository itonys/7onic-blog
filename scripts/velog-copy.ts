/**
 * Velog has no official publishing API, so Korean posts are pasted by hand.
 * This script puts each field on the macOS clipboard in turn so the paste
 * takes a few keystrokes.
 *
 *   npm run velog                 # list drafts, mark which are posted, show next number
 *   npm run velog -- 20           # copy title → Enter → copy body, then print tags/series/description
 *   npm run velog -- 20 --body    # copy only the body
 *   npm run velog -- 20 --title   # copy only the title
 *
 * Drafts live in velog/NN-<english-slug>.md with frontmatter:
 *   number, title, series, tags, description, source, velogUrl?, postedAt?
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import readline from 'node:readline/promises';
import matter from 'gray-matter';

const DIR = path.resolve(import.meta.dirname, '..', 'velog');

type Draft = {
  file: string;
  number: number;
  title: string;
  series?: string;
  tags: string[];
  description?: string;
  source?: string;
  velogUrl?: string;
  postedAt?: string;
  body: string;
};

function loadDrafts(): Draft[] {
  if (!fs.existsSync(DIR)) return [];
  return fs
    .readdirSync(DIR)
    .filter((f) => /^\d+-.*\.md$/.test(f))
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(DIR, file), 'utf8'));
      return {
        file,
        number: Number(data.number ?? file.split('-')[0]),
        title: String(data.title ?? ''),
        series: data.series,
        tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
        description: data.description,
        source: data.source,
        velogUrl: data.velogUrl,
        // YAML turns an unquoted 2026-11-04 into a Date; keep it as YYYY-MM-DD.
        postedAt: data.postedAt instanceof Date
          ? data.postedAt.toISOString().slice(0, 10)
          : data.postedAt ? String(data.postedAt) : undefined,
        body: content.replace(/^\n+/, ''),
      };
    })
    .sort((a, b) => a.number - b.number);
}

function copy(text: string) {
  execFileSync('pbcopy', { input: text });
}

async function main() {
  const args = process.argv.slice(2);
  const drafts = loadDrafts();
  const n = args.find((a) => /^\d+$/.test(a));

  if (!n) {
    for (const d of drafts) {
      console.log(`${d.postedAt ? '✅' : '⬜'} #${d.number}  ${d.title}${d.postedAt ? `  (${d.postedAt})` : ''}`);
    }
    const next = drafts.length ? Math.max(...drafts.map((d) => d.number)) + 1 : 1;
    console.log(`\nnext number: #${next}`);
    return;
  }

  const d = drafts.find((x) => x.number === Number(n));
  if (!d) {
    console.error(`No draft #${n} in velog/`);
    process.exit(1);
  }

  const onlyTitle = args.includes('--title');
  const onlyBody = args.includes('--body');

  if (!onlyBody) {
    copy(d.title);
    console.log(`📋 Title copied: ${d.title}`);
  }
  if (!onlyTitle && !onlyBody) {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    await rl.question('   Paste it into the velog title field, then press Enter to copy the body… ');
    rl.close();
  }
  if (!onlyTitle) {
    copy(d.body);
    console.log(`📋 Body copied (${[...d.body].length} chars)`);
  }

  console.log('');
  if (d.series) console.log(`Series:      ${d.series}`);
  if (d.tags.length) console.log(`Tags:        ${d.tags.join(', ')}`);
  if (d.description) console.log(`Description: ${d.description}`);
  if (d.source) console.log(`Source:      ${d.source}`);
  if (!d.postedAt) console.log(`\nAfter posting, add postedAt and velogUrl to velog/${d.file}.`);
}

main();
