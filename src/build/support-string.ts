/**
 * T025: port of helper.generateSupportString (feature-helper.js:1272-1383), verbatim except for
 * `.unique()`/`.occurenceCount()` becoming plain function calls (array-utils.ts) instead of
 * Array.prototype monkey-patches.
 */
import { unique, occurenceCount } from './array-utils';

export interface SupportString {
  class: string;
  string: string;
}

export function generateSupportString(support: string | string[]): SupportString {
  if (typeof support === 'string') {
    let supportString = '';
    let supportClass = '';
    switch (support) {
      case 'y':
        supportString = 'yes';
        supportClass = 'ye';
        break;
      case 'n':
        supportString = 'none';
        supportClass = 'no';
        break;
      case 'p':
        supportString = 'partial';
        supportClass = 'pa';
        break;
      case 'na':
        supportString = 'not applicable';
        supportClass = 'na';
        break;
      default:
        supportString = 'unknown';
        supportClass = 'un';
    }

    return {
      class: supportClass,
      string: supportString,
    };
  }

  if (support.length === 0) {
    return generateSupportString('unknown');
  }

  // test for full na support before filtering na support
  let uniqueSupport = unique(support);
  if (uniqueSupport.length === 1 && uniqueSupport[0] === 'na') {
    return generateSupportString('na');
  }

  // filter out "na" values
  const filteredSupport = support.filter((element) => element !== 'na');

  if (filteredSupport.length === 0) {
    return generateSupportString('na');
  }

  // Get the unique values to make it easier to compare
  uniqueSupport = unique(filteredSupport);

  if (uniqueSupport.length === 1) {
    if (uniqueSupport[0] === 'y') {
      return {
        class: 'ye',
        string: 'supported',
      };
    }

    return generateSupportString(uniqueSupport[0]!);
  }

  if (uniqueSupport.length === 2 && uniqueSupport.includes('y') && uniqueSupport.includes('u')) {
    const numUnknown = occurenceCount(filteredSupport, 'u');
    if (numUnknown === 1) {
      return {
        class: 'pa',
        string: 'supported with ' + numUnknown + ' unknown result',
      };
    }

    return {
      class: 'pa',
      string: 'supported with ' + numUnknown + ' unknown results',
    };
  }

  const numPassing = occurenceCount(filteredSupport, 'y');

  if (numPassing) {
    // At least one thing is passing
    return {
      class: 'pa',
      string: 'partial (' + numPassing + '/' + filteredSupport.length + ')',
    };
  }

  const numPartial = occurenceCount(filteredSupport, 'p');

  if (numPartial) {
    // At least one thing is passing
    return {
      class: 'pa',
      string: 'some partial support',
    };
  }

  if (support.includes('n')) {
    return {
      class: 'no',
      string: 'no known support',
    };
  }

  return {
    class: 'un',
    string: 'unknown support',
  };
}
