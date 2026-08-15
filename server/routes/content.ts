/**
 * T041: port of routes/index.js's non-tech/non-test routes, serving pre-built payloads instead
 * of rendering Pug per request.
 */
import express from 'express';
import { loadApiFile, loadDataFile } from '../lib/load-build';
import { notFound } from '../lib/errors';
import type {
  HomePayload,
  TechIndexPayload,
  UpdatesPayload,
  CommandsPayload,
  RunTestsPayload,
  MarkdownPagePayload,
} from '../../src/types/api';
import type { ATBrowsers } from '../../src/types/at-browsers';

const router = express.Router();

const MARKDOWN_PAGES = ['faq', 'contribute', 'learn', 'vc_differences'];

// Same allow-list as the original routes/index.js:95.
const AT_LEARN_ALLOW_LIST = [
  'dragon',
  'jaws',
  'narrator',
  'nvda',
  'talkback',
  'vo_ios',
  'vo_macos',
  'orca',
  'vc_macos',
  'vc_ios',
  'va_and',
  'wsr',
  'win_kb',
  'va_windows',
];

router.get('/home', (_req, res) => {
  const home = loadApiFile<HomePayload>('home.json');
  res.json(home);
});

router.get('/at-browsers', (_req, res) => {
  const atBrowsers = loadDataFile<ATBrowsers>('ATBrowsers.json');
  res.json(atBrowsers);
});

router.get('/updates', (_req, res) => {
  const updates = loadApiFile<UpdatesPayload>('updates.json');
  res.json(updates);
});

router.get('/commands', (_req, res) => {
  const commands = loadApiFile<CommandsPayload>('commands.json');
  res.json(commands);
});

router.get('/run-tests', (_req, res) => {
  const runTests = loadApiFile<RunTestsPayload>('run-tests.json');
  res.json(runTests);
});

router.get('/content/:page', (req, res, next) => {
  if (!MARKDOWN_PAGES.includes(req.params.page!)) {
    next(notFound());
    return;
  }

  const page = loadApiFile<MarkdownPagePayload>(`markdown/${req.params.page}.json`);
  res.json(page);
});

router.get('/tech-index', (_req, res) => {
  const techIndex = loadApiFile<TechIndexPayload>('tech-index.json');
  res.json(techIndex);
});

router.get('/learn/at/:id', (req, res, next) => {
  if (!AT_LEARN_ALLOW_LIST.includes(req.params.id!)) {
    next(notFound());
    return;
  }

  const atId = req.params.id === 'dragon' ? 'dragon_win' : req.params.id;
  const atBrowsers = loadDataFile<ATBrowsers>('ATBrowsers.json');
  const doc = loadApiFile<{ html: string }>(`markdown/at/${req.params.id}.json`);

  res.json({
    id: req.params.id,
    atId,
    html: doc.html,
    commands: atBrowsers.at[atId!]?.commands ?? {},
    modifierKey: atBrowsers.at[atId!]?.modifier_key ?? null,
    commandTags: atBrowsers.command_tags,
  });
});

export default router;
