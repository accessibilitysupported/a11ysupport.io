/**
 * Hand-written types for data/ATBrowsers.json (no JSON Schema exists for it — the only config
 * file in data/ without one). Shape confirmed against the live file, not guessed:
 * `modifier_key` is absent on most AT entries (only narrator has one today), `commands[].note`
 * is present on some commands but not all, and `browsers[id]` is just `{ title }`.
 */

export type AtType = 'sr' | 'vc' | 'kb';

export interface AtCommand {
  command: string;
  name: string;
  tags: string[];
  note?: string;
}

export interface AssistiveTechnology {
  id: string;
  type: AtType;
  title: string;
  short_title: string;
  os: string;
  core_browsers: string[];
  extended_browsers: string[];
  url: string;
  description: string;
  bugs: string;
  modifier_key?: {
    name: string;
    key: string;
  };
  commands: Record<string, AtCommand>;
}

export interface Browser {
  title: string;
}

export interface CommandTag {
  id: string;
  name: string;
}

export interface ATBrowsers {
  types: AtType[];
  core_at: string[];
  extended_at: string[];
  at: Record<string, AssistiveTechnology>;
  command_tags: CommandTag[];
  browsers: Record<string, Browser>;
}
