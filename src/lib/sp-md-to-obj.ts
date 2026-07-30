/**
 * T031: port of src/sp-md-to-obj.js, verbatim — including the CRLF-only `split("\r\n")` (not a
 * bug to "fix": this parses GitHub issue bodies, which GitHub renders with CRLF line endings).
 */
import moment from 'moment';

export interface SupportPointOutput {
  [key: string]: string;
}

export interface SupportPoint {
  at_version: string | null;
  browser_version: string | null;
  os_version: string | null;
  date: string;
  output: SupportPointOutput[];
  notes: string;
  [key: string]: unknown;
}

export interface ParsedSupportPoint {
  testId: string | null;
  at: string | null;
  browser: string | null;
  supportPoint: SupportPoint;
}

/**
 * Takes a markdown-formatted string from a GitHub SupportPoint issue (or comment), parses it,
 * and converts it to an object representing the data needed to modify the test file (done by
 * another script).
 */
export function spMdToObject(body: string): ParsedSupportPoint {
  const currentDateString = moment().format('YYYY-MM-DD');
  const lines = body.split('\r\n');
  const skipColumns = ['property', '---', 'title'];
  let inNotes = false;

  const object: ParsedSupportPoint = {
    testId: null,
    at: null,
    browser: null,
    supportPoint: {
      at_version: null,
      browser_version: null,
      os_version: null,
      date: currentDateString,
      output: [],
      notes: '',
    },
  };

  // There may be extra lines above and below the table.
  lines.forEach(function (rawLine) {
    const line = rawLine.trim();
    if (line === '== begin notes ==') {
      inNotes = true;
      return;
    }
    if (inNotes) {
      if (line === '== end notes ==') {
        object.supportPoint.notes = object.supportPoint.notes.trim();
        inNotes = false;
        return;
      } else {
        object.supportPoint.notes += line + '\n';
      }
    }

    const columns = line.split('|');
    if (columns.length !== 4) {
      // This is not a table row
      return;
    }

    const property = columns[1]!.trim();
    const value = columns[2]!.trim();

    if (skipColumns.includes(property)) {
      if (property === 'title') {
        object.testId = value;
      }

      return;
    }

    if (property.indexOf('output_') === 0) {
      const match = property.match(/(\d+)/)!;
      const index = parseInt(match[0]!) - 1;
      if (!object.supportPoint.output[index]) {
        object.supportPoint.output[index] = {};
      }

      const tmpProperty = property.replace(/output_(\d+)_/, '');
      object.supportPoint.output[index]![tmpProperty] = value;
    } else if (property === 'at' || property === 'browser') {
      object[property] = value;
    } else {
      object.supportPoint[property] = value;
    }
  });

  return object;
}
