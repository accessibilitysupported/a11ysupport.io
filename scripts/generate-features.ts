/**
 * T034: port of scripts/generate-features.js. Replaces `node-fetch` v3 (ESM-only, was already
 * broken under `require()`) with the built-in `fetch` (Node 18+) — otherwise verbatim.
 */
import fs from 'node:fs';
import path from 'node:path';
import sanitize from 'sanitize-filename';
import moment from 'moment';

const currentDateString = moment().format('YYYY-MM-DD');

function urlSafe(str: string): string {
  str = str.replace('[', '(');
  str = str.replace(']', ')');
  str = str.replace('=', '-');
  return str;
}

function createFeature(
  id: string,
  featureType: string,
  techId: string,
  title: string,
  description: string | null,
  linkTitle: string | null,
  linkUrl: string | null
): void {
  // Ensure a constant and safe file name
  id = id.replace(' ', '_').toLowerCase(); // Remove spaces
  id = sanitize(id);
  id = urlSafe(id);

  const file = path.join(__dirname, '../data/tech', techId, `${id}.json`);

  if (fs.existsSync(file)) {
    // Don't overwrite existing files
    return;
  }

  const feature: {
    id: string;
    title: string;
    type: string;
    description: string;
    references: Array<{ title: string; url: string }>;
    date_updated: string;
  } = {
    id,
    title,
    type: featureType,
    description: '',
    references: [],
    date_updated: currentDateString,
  };

  if (description) {
    feature.description = description;
  }

  if (linkTitle && linkUrl) {
    feature.references.push({
      title: linkTitle,
      url: linkUrl,
    });
  }

  fs.writeFileSync(file, JSON.stringify(feature, null, 2));
}

fetch('https://raw.githubusercontent.com/w3c/elements-of-html/master/elements.json')
  .then((res) => res.json())
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .then(function (json: any) {
    for (let i = 0; i < json.length; i++) {
      if (!json[i].specs.includes('5.2')) {
        continue;
      }

      // There are a LOT of elements, so lets reduce it to keep it simple for testing purposes
      const temporary_whitelist = [
        'figure',
        'figcaption',
        'canvas',
        'dialog',
        'input[type="text"]',
        'input[type="tel"]',
        'input[type="checkbox"]',
        'th',
        'td',
        'button',
        'main',
        'section',
        'aside',
        'header',
        'footer',
        'article',
        'select',
        'option',
        'datalist',
      ];
      if (!temporary_whitelist.includes(json[i].element)) {
        continue;
      }

      const id = json[i].element + '_element';
      const title = json[i].element + ' element';

      createFeature(id, 'element', 'html', title, null, 'HTML5 spec for ' + json[i].element, json[i].link);
    }
  });

// ARIA 1.1
fetch('https://raw.githubusercontent.com/jamiebuilds/aria-data/master/data.json')
  .then((res) => res.json())
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  .then(function (json: any) {
    for (const key in json.roles) {
      const role = json.roles[key];

      const id = role.name + '_role';
      const title = role.name + ' role';

      createFeature(id, 'role', 'aria', title, role.description, 'ARIA spec for ' + role.name, key);
    }

    for (const key in json.attributes) {
      const attribute = json.attributes[key];

      const id = attribute.name + '_attribute';
      const title = attribute.name + ' attribute';

      createFeature(id, 'attribute', 'aria', title, attribute.description, 'ARIA spec for ' + attribute.name, key);
    }
  });
