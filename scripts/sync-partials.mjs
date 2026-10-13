// Injects the shared header/footer partials into every page.
// Usage: node scripts/sync-partials.mjs
//
// Each page marks the regions with <!-- partial:header --> ... <!-- /partial:header -->
// (same for footer). The page key comes from <body data-page="...">, and the
// relative path to the site root is derived from the page's folder depth.
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const PAGES = [
  'index.html',
  'about/index.html',
  'projects/index.html',
  'contact-us/index.html',
  'aarna-royal/index.html',
  'avighna-aarna-vintage/index.html',
];

// Social profile URLs. The original site ships these links with an empty href,
// so they render as non-clickable icons until a real URL is filled in here.
const SOCIAL = [
  { name: 'Facebook', icon: 'brands-facebook-f', url: '' },
  { name: 'Twitter', icon: 'brands-twitter', url: '' },
  { name: 'Instagram', icon: 'brands-instagram', url: '' },
  { name: 'Linkedin', icon: 'brands-linkedin-in', url: '' },
];

const partials = {
  header: readFileSync(join(ROOT, 'partials/header.html'), 'utf8'),
  footer: readFileSync(join(ROOT, 'partials/footer.html'), 'utf8'),
};

function renderSocial(root) {
  return SOCIAL.map(({ name, icon, url }) => {
    const svg = `<svg class="icon" aria-hidden="true"><use href="${root}assets/images/icons.svg#i-${icon}"></use></svg>`;
    return url
      ? `<a class="social__item" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="${name}">${svg}</a>`
      : `<span class="social__item social__item--unlinked" role="img" aria-label="${name}" title="${name}">${svg}</span>`;
  }).join('');
}

function render(template, { root, page }) {
  return template
    .replaceAll('{{social}}', renderSocial(root))
    .replaceAll('{{root}}', root)
    .replace(/\{\{current:(\w+)\}\}/g, (_, key) => (key === page ? ' aria-current="page"' : ''));
}

for (const file of PAGES) {
  const path = join(ROOT, file);
  let html = readFileSync(path, 'utf8');
  const depth = relative(ROOT, dirname(path)).split(sep).filter(Boolean).length;
  const root = depth ? '../'.repeat(depth) : './';
  const page = (html.match(/<body[^>]*data-page="([^"]+)"/) || [])[1] || '';

  for (const [name, template] of Object.entries(partials)) {
    const re = new RegExp(`(<!-- partial:${name} -->)[\\s\\S]*?(<!-- /partial:${name} -->)`);
    if (!re.test(html)) throw new Error(`${file}: missing partial:${name} markers`);
    html = html.replace(re, (_, open, close) => `${open}\n${render(template, { root, page })}${close}`);
  }
  writeFileSync(path, html);
  console.log(`synced ${file} (page=${page || 'none'}, root=${root})`);
}
