#!/usr/bin/env node
/* Page-to-media source inventory, generated from existing HTML.
 * Read-only, using Node built-ins only. Does not alter original media.
 * Commands:
 *   node scripts/build-media-placement-inventory.cjs --summary
 *   node scripts/build-media-placement-inventory.cjs --output /tmp/ruwaidix-media.json
 * Runtime-generated galleries, CSS backgrounds and film frame quality require
 * additional visual/browser audits, not guesses from this inventory.
 */
'use strict';
const fs = require('node:fs');
const path = require('node:path');

function htmlFiles(root) {
  const result = [];
  function visit(dir) {
    for (const entry of fs.readdirSync(dir, {withFileTypes:true})) {
      if (entry.name === '.git' || entry.name === 'node_modules') continue;
      const abs = path.join(dir, entry.name);
      if (entry.isDirectory()) visit(abs);
      else if (entry.isFile() && entry.name.endsWith('.html')) {
        result.push(path.relative(root, abs).split(path.sep).join('/'));
      }
    }
  }
  visit(root);
  return result.sort();
}

function attr(tag, name) {
  const match = tag.match(new RegExp('(?:^|\\s)' + name + '\\s*=\\s*(?:"([^"]*)"|\\x27([^\\x27]*)\\x27)', 'i'));
  return match ? (match[1] === undefined ? match[2] : match[1]) : null;
}
function cleanTitle(value) {
  return value.replace(/<[^>]*>/g,' ').replace(/&amp;/g,'&')
    .replace(/&nbsp;/g,' ').replace(/\s+/g,' ').trim().slice(0,140);
}
function atLine(position, starts) {
  let lo=0,hi=starts.length-1;
  while(lo<=hi) {
    const mid=(lo+hi)>>1;
    if(starts[mid]<=position)lo=mid+1;
    else hi=mid-1;
  }
  return hi+1;
}
function availability(root, page, original) {
  if (!original || original.includes('$' + '{')) return 'dynamic-unverified';
  if (original.startsWith('data:')) return 'embedded-unverified';
  if (/^(?:https?:)?\/\//i.test(original)) return 'external-unverified';
  if (/^(?:blob:|javascript:|mailto:)/i.test(original)) return 'dynamic-unverified';
  const url=original.split(/[?#]/)[0];
  if (!url) return 'dynamic-unverified';
  const rel=url.startsWith('/') ? url.slice(1) :
    path.posix.normalize(path.posix.join(path.posix.dirname(page),url));
  if (rel.startsWith('../') || rel==='..') return 'outside-repository';
  return fs.existsSync(path.join(root,rel)) ? 'present' : 'missing-in-repository';
}

function buildInventory(root) {
  const pages={};
  const counts={
    htmlFiles:0,mediaReferences:0,localPresent:0,localMissing:0,
    externalUnverified:0,embeddedUnverified:0,otherUnverified:0
  };
  for (const page of htmlFiles(root)) {
    const html=fs.readFileSync(path.join(root,page),'utf8');
    // Exclude script and style templates without shifting offsets/newline positions.
    const visible=html.replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/gi,
      match=>match.replace(/[^\r\n]/g,' '));
    const lineStarts=[0];
    for(let i=0;i<visible.length;i++)if(visible.charCodeAt(i)===10)lineStarts.push(i+1);
    const headings=[];
    for(const h of visible.matchAll(/<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi)) {
      headings.push({offset:h.index,text:cleanTitle(h[2])});
    }
    let hi=-1;
    const records=[];
    for(const m of visible.matchAll(/<(img|video|source|track)\b([^>]*)>/gi)) {
      while(hi+1<headings.length && headings[hi+1].offset<m.index)hi++;
      const tag=m[1].toLowerCase(),source=m[0];
      const urls=[];
      if(tag==='img')urls.push(['img',attr(source,'src')]);
      if(tag==='video') {
        if(attr(source,'src'))urls.push(['video',attr(source,'src')]);
        if(attr(source,'poster'))urls.push(['poster',attr(source,'poster')]);
      }
      if(tag==='source') {
        if(attr(source,'src'))urls.push(['source',attr(source,'src')]);
        if(attr(source,'srcset'))urls.push(['srcset',attr(source,'srcset')]);
      }
      if(tag==='track')urls.push(['track',attr(source,'src')]);
      for(const [kind,url] of urls) {
        const state=availability(root,page,url);
        records.push({
          tag:kind,url:url && url.startsWith('data:')?'[inline data URI]':url,
          ordinalOnPage:records.length+1,characterOffset:m.index,
          line:atLine(m.index,lineStarts),
          contextHeading:hi>=0?headings[hi].text:'Opening/navigation',
          imageAlt:tag==='img'?attr(source,'alt'):null,
          loading:tag==='img'?attr(source,'loading'):null,
          mediaLabel:tag==='video'?attr(source,'aria-label'):null,
          availability:state
        });
        counts.mediaReferences++;
        if(state==='present')counts.localPresent++;
        else if(state==='missing-in-repository')counts.localMissing++;
        else if(state==='external-unverified')counts.externalUnverified++;
        else if(state==='embedded-unverified')counts.embeddedUnverified++;
        else counts.otherUnverified++;
      }
    }
    pages[page]=records;
    counts.htmlFiles++;
  }
  return {
    scope:'Static HTML source placement and file existence only; not a photographic provenance, visual positioning, rights clearance, responsive screenshot or rendered-film audit. Dynamically injected galleries and CSS media are excluded.',
    counts,pages
  };
}
module.exports={buildInventory};
if(require.main===module) {
  const args=process.argv.slice(2);
  const result=buildInventory(path.resolve(__dirname,'..'));
  const i=args.indexOf('--output');
  if(i>=0) {
    if(!args[i+1])throw Error('--output requires a path');
    fs.writeFileSync(path.resolve(args[i+1]),JSON.stringify(result,null,2)+'\n');
  } else if(args.includes('--summary')) {
    process.stdout.write(JSON.stringify({scope:result.scope,counts:result.counts},null,2)+'\n');
  } else process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
