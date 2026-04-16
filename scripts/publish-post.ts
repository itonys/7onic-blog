#!/usr/bin/env npx tsx
/**
 * Cross-post a blog post to dev.to and Hashnode.
 *
 * Usage:
 *   npm run publish-post -- "post-slug"
 *   npm run publish-post -- "post-slug" --update
 *   npm run publish-post -- "post-slug" --devto-only
 *   npm run publish-post -- "post-slug" --hashnode-only
 */

import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

// ── Config ────────────────────────────────────────────────────────────────────

const DEVTO_API_KEY    = process.env.DEVTO_API_KEY    ?? '';
const HASHNODE_API_KEY = process.env.HASHNODE_API_KEY ?? '';
const HASHNODE_PUB_ID  = process.env.HASHNODE_PUB_ID  ?? '';
const CANONICAL_BASE   = 'https://blog.7onic.design';

// ── Args ──────────────────────────────────────────────────────────────────────

const args        = process.argv.slice(2);
const slug        = args.find((a) => !a.startsWith('--'));
const isUpdate    = args.includes('--update');
const devtoOnly   = args.includes('--devto-only');
const hashnodeOnly = args.includes('--hashnode-only');

if (!slug) {
  console.error('Usage: npm run publish-post -- "post-slug" [--update] [--devto-only] [--hashnode-only]');
  process.exit(1);
}

// ── Read post ─────────────────────────────────────────────────────────────────

const postPath = path.resolve(process.cwd(), `src/content/blog/${slug}.md`);

if (!fs.existsSync(postPath)) {
  console.error(`❌ Post not found: ${postPath}`);
  process.exit(1);
}

const raw = fs.readFileSync(postPath, 'utf-8');
const { data: fm, content } = matter(raw);

if (fm.draft) {
  console.error('❌ Post is still a draft. Set draft: false before publishing.');
  process.exit(1);
}

const canonicalUrl = `${CANONICAL_BASE}/${slug}/`;
const tags = (fm.tags ?? []).slice(0, 4) as string[];

console.log(`\n📝 Publishing: ${fm.title}`);
console.log(`   canonical: ${canonicalUrl}\n`);

// ── dev.to ────────────────────────────────────────────────────────────────────

async function publishDevto(): Promise<string | null> {
  if (!DEVTO_API_KEY) { console.warn('⚠️  DEVTO_API_KEY not set, skipping dev.to'); return null; }

  const body = {
    article: {
      title: fm.title,
      body_markdown: content,
      published: true,
      canonical_url: canonicalUrl,
      tags,
      description: fm.description,
    },
  };

  const isExisting = !!fm.devtoId;
  const url    = isExisting ? `https://dev.to/api/articles/${fm.devtoId}` : 'https://dev.to/api/articles';
  const method = isExisting ? 'PUT' : 'POST';

  const res = await fetch(url, {
    method,
    headers: { 'api-key': DEVTO_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`❌ dev.to error (${res.status}):`, err);
    return null;
  }

  const data = await res.json() as { id: number; url: string };
  console.log(`✅ dev.to: ${data.url}`);
  return String(data.id);
}

// ── Hashnode ──────────────────────────────────────────────────────────────────

async function publishHashnode(): Promise<string | null> {
  if (!HASHNODE_API_KEY || !HASHNODE_PUB_ID) {
    console.warn('⚠️  HASHNODE_API_KEY or HASHNODE_PUB_ID not set, skipping Hashnode');
    return null;
  }

  const hashnodeTags = tags.map((t) => ({ name: t, slug: t }));
  const isExisting   = !!fm.hashnodeId;

  const mutation = isExisting
    ? `mutation UpdatePost($input: UpdatePostInput!) {
        updatePost(input: $input) { post { id url } }
      }`
    : `mutation PublishPost($input: PublishPostInput!) {
        publishPost(input: $input) { post { id url } }
      }`;

  const variables = isExisting
    ? {
        input: {
          id: fm.hashnodeId,
          title: fm.title,
          contentMarkdown: content,
          tags: hashnodeTags,
        },
      }
    : {
        input: {
          title: fm.title,
          contentMarkdown: content,
          publicationId: HASHNODE_PUB_ID,
          tags: hashnodeTags,
          originalArticleURL: canonicalUrl,
          metaTags: { description: fm.description },
        },
      };

  const res = await fetch('https://gql.hashnode.com', {
    method: 'POST',
    headers: { Authorization: HASHNODE_API_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: mutation, variables }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`❌ Hashnode error (${res.status}):`, err);
    return null;
  }

  const json = await res.json() as {
    data?: { publishPost?: { post: { id: string; url: string } }; updatePost?: { post: { id: string; url: string } } };
    errors?: { message: string }[];
  };

  if (json.errors?.length) {
    console.error('❌ Hashnode GraphQL errors:', json.errors.map((e) => e.message).join(', '));
    return null;
  }

  const post = json.data?.publishPost?.post ?? json.data?.updatePost?.post;
  if (!post) { console.error('❌ Hashnode: no post in response'); return null; }

  console.log(`✅ Hashnode: ${post.url}`);
  return post.id;
}

// ── Write IDs back to frontmatter ─────────────────────────────────────────────

function updateFrontmatter(devtoId: string | null, hashnodeId: string | null) {
  const updated = { ...fm };
  if (devtoId)    updated.devtoId    = devtoId;
  if (hashnodeId) updated.hashnodeId = hashnodeId;
  const newContent = matter.stringify(content, updated);
  fs.writeFileSync(postPath, newContent, 'utf-8');
  console.log('\n💾 frontmatter updated with IDs');
}

// ── Main ──────────────────────────────────────────────────────────────────────

(async () => {
  let devtoId:    string | null = null;
  let hashnodeId: string | null = null;

  if (!hashnodeOnly) devtoId    = await publishDevto();
  if (!devtoOnly)    hashnodeId = await publishHashnode();

  if (devtoId || hashnodeId) {
    updateFrontmatter(devtoId, hashnodeId);
  }

  console.log('\n🎉 Done!');
  console.log(`   blog: ${canonicalUrl}`);
})();
