/**
 * T057: port of command-table.mixin.pug, verbatim. Takes the AT's `commands` map directly
 * (rather than `(atBrowsers, atId)`, the original mixin's signature) since every call site
 * already has that map in hand — a simpler, equally-faithful interface.
 */
import type { AtCommand } from '../../src/types/at-browsers';

interface Props {
  commands: Record<string, AtCommand>;
  commandTag: string;
  showNotes: boolean;
}

export function CommandTable({ commands, commandTag, showNotes }: Props) {
  if (!commands) return null;

  const rows = Object.values(commands).filter((command) => command.tags.includes(commandTag));

  return (
    <table>
      <thead>
        <tr>
          <th>Task</th>
          <th>Command</th>
          {showNotes && <th>Notes</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((command, index) => (
          <tr key={index}>
            <td>{command.name}</td>
            <td>{command.command}</td>
            {showNotes && <td>{command.note}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
