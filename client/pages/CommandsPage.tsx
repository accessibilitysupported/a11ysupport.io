/**
 * T073: port of commands.pug, verbatim.
 */
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { usePageTitle } from '../lib/usePageTitle';
import { LoadingStatus } from '../components/LoadingStatus';
import { RouteErrorBoundary } from '../components/RouteErrorBoundary';
import type { AtType } from '../../src/types/at-browsers';

export function CommandsPage() {
  usePageTitle('All AT commands | Accessibility Support');
  const commandsQuery = useQuery({ queryKey: ['commands'], queryFn: api.commands });
  const atBrowsersQuery = useQuery({ queryKey: ['at-browsers'], queryFn: api.atBrowsers });

  if (commandsQuery.isPending || atBrowsersQuery.isPending) return <LoadingStatus />;
  if (commandsQuery.isError) return <RouteErrorBoundary error={commandsQuery.error} />;
  if (atBrowsersQuery.isError) return <RouteErrorBoundary error={atBrowsersQuery.error} />;

  const commands = commandsQuery.data;
  const atBrowsers = atBrowsersQuery.data;

  return (
    <div className="content">
      <h1>All commands</h1>
      {(Object.keys(commands) as AtType[]).map((typeKey) => {
        const atsOfType = Object.values(atBrowsers.at).filter((at) => at.type === typeKey);
        return (
          <div key={typeKey}>
            <h2>{typeKey}</h2>
            <table>
              <tbody>
                <tr>
                  <th>Command</th>
                  {atsOfType.map((at) => (
                    <th key={at.id}>{at.title}</th>
                  ))}
                </tr>
                {Object.entries(commands[typeKey]).map(([commandKey, atsWithCommand]) => (
                  <tr key={commandKey}>
                    <th>{commandKey}</th>
                    {atsOfType.map((at) =>
                      atsWithCommand.includes(at.id) ? (
                        <td key={at.id}>
                          <span>{at.commands[commandKey]?.command}</span>
                        </td>
                      ) : (
                        <td key={at.id} />
                      )
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
}
