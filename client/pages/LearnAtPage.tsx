/**
 * T074: port of learn-at.pug. `command_list_has_notes`/`command_list_contains_tag` were template
 * helper functions in the original route; ported here as plain functions over the `commands`
 * data the API already returns (server/routes/content.ts).
 */
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router';
import { api } from '../lib/api';
import { usePageTitle } from '../lib/usePageTitle';
import { LoadingStatus } from '../components/LoadingStatus';
import { ErrorPage } from './ErrorPage';
import { MarkdownContent } from '../components/MarkdownContent';
import { CommandTable } from '../components/CommandTable';
import type { AtCommand, ATBrowsers } from '../../src/types/at-browsers';

function commandListContainsTag(commands: Record<string, AtCommand>, tag: string): boolean {
  return Object.values(commands).some((command) => command.tags.includes(tag));
}

function commandListHasNotes(commands: Record<string, AtCommand>, tag: string): boolean {
  return Object.values(commands).some((command) => command.tags.includes(tag) && command.note);
}

export function LearnAtPage() {
  const { id } = useParams();
  usePageTitle(`${id} | Learn | Accessibility Support`);

  const { data, isPending, isError, error } = useQuery({
    queryKey: ['learn-at', id],
    queryFn: () => api.learnAt(id!),
  });

  if (isPending) return <LoadingStatus />;
  if (isError) return <ErrorPage message={(error as Error).message} />;

  const commands: Record<string, AtCommand> = data.commands;
  const commandTags: ATBrowsers['command_tags'] = data.commandTags;

  return (
    <div className="content">
      <MarkdownContent html={data.html} />

      {commands && Object.keys(commands).length > 0 && (
        <>
          <h2>Commands</h2>
          <p>The following are some common commands.</p>
          {data.modifierKey && (
            <p>
              The default {data.modifierKey.name} modifier key is set to: {data.modifierKey.key}
            </p>
          )}
          {commandTags.map(
            (tag) =>
              commandListContainsTag(commands, tag.id) && (
                <div key={tag.id}>
                  <h3>{tag.name}</h3>
                  <CommandTable commands={commands} commandTag={tag.id} showNotes={commandListHasNotes(commands, tag.id)} />
                </div>
              )
          )}
        </>
      )}
    </div>
  );
}
