/**
 * T022: port of helper.initalizeFeatureObject (feature-helper.js:51-341), verbatim. This sets
 * per-AT-type default support scaffolding on a freshly-loaded feature object and fills in
 * standard title/rationale/strength/examples defaults for the well-known assertion ids — ported
 * as a direct transcription, not a redesign, per this migration's byte-identical requirement.
 */
import type { ATBrowsers } from '../types/at-browsers';

export function initalizeFeatureObject(
  atBrowsers: ATBrowsers,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  featureObject: any,
  techId: string,
  id: string
): void {
  featureObject.id = id;
  featureObject.techId = techId;

  featureObject.all_dates = {
    all: [],
    min: null,
    max: null,
  };

  featureObject.failing_dates = {
    all: [],
    min: null,
    max: null,
  };

  // Set up support properties
  featureObject.core_support = {};
  featureObject.core_support_by_at = {};
  featureObject.core_support_by_at_browser = {};
  featureObject.core_support_string = {};
  featureObject.extended_support = {};
  featureObject.extended_support_string = {};
  featureObject.core_must_support = {};
  featureObject.core_must_support_string = {};
  featureObject.core_should_support = {};
  featureObject.core_should_support_string = {};
  featureObject.core_may_support = {};
  featureObject.core_may_support_string = {};

  atBrowsers.types.forEach((at_type) => {
    featureObject.core_support[at_type] = [];
    featureObject.core_support_string[at_type] = 'unknown';
    featureObject.extended_support[at_type] = [];
    featureObject.extended_support_string[at_type] = 'unknown';
    featureObject.core_must_support[at_type] = [];
    featureObject.core_must_support_string[at_type] = 'unknown';
    featureObject.core_should_support[at_type] = [];
    featureObject.core_should_support_string[at_type] = 'unknown';
    featureObject.core_may_support[at_type] = [];
    featureObject.core_may_support_string[at_type] = 'unknown';
  });

  if (!featureObject.keywords) {
    featureObject.keywords = [];
  }

  if (!featureObject.is_form_control) {
    featureObject.is_form_control = false;
  }

  featureObject.keywords.push(featureObject.title);

  // Set defaults for assertions
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  featureObject.assertions.forEach((assertion: any, assertion_key: number) => {
    switch (assertion.id) {
      case 'convey_name':
        featureObject.assertions[assertion_key] = Object.assign(
          {
            title: 'convey its name',
            rationale: 'A screen reader user needs to know what to enter.',
            strength: {
              sr: 'MUST',
              vc: 'MUST',
              kb: 'NA',
            },
            operation_modes: ['sr/reading', 'sr/interaction', 'vc'],
          },
          assertion
        );

        if (featureObject.is_form_control && !featureObject.assertions[assertion_key].notes) {
          featureObject.assertions[assertion_key].notes =
            'For form inputs - commands to read line by line (down and up arrows in most windows screen readers) will not always result in the name being explicitly conveyed when the virtual focus is moved to an input where the label is visually displayed and programmatically associated with the input. This is acceptable because the name is implied by the fact that it should be naturally found in the reading order. Some screen readers choose to not convey the name in these cases, likely in an effort to reduce verbosity.';
        }
        break;
      case 'convey_role':
        featureObject.assertions[assertion_key] = Object.assign(
          {
            title: 'convey its role',
            rationale:
              'A screen reader user needs to know how they can interact with the element. Voice control software might use the role to help users activate controls that do not have a visible name.',
            examples: [
              'A screen reader might announce an element as something like "<name>, <role>"',
              'A screen reader might imply the role by the presence of certain context roles',
              'Voice Control software might let the user say something like "click, <role>".',
              'Voice Control software might let the user say something like "show numbers", and interactive roles will be flagged with numbers.',
            ],
            strength: {
              sr: 'MUST',
              vc: 'MUST',
              kb: 'NA',
            },
            operation_modes: ['sr/reading', 'sr/interaction', 'vc'],
            exclude_at: { vc_ios: 'no_support' },
          },
          assertion
        );
        break;
      case 'convey_value':
        featureObject.assertions[assertion_key] = Object.assign(
          {
            title: 'convey the current value',
            rationale: 'A screen reader user needs to know the current value of the input.',
            strength: {
              sr: 'MUST',
              vc: 'NA',
              kb: 'NA',
            },
            operation_modes: ['sr/reading', 'sr/interaction'],
          },
          assertion
        );
        break;
      case 'convey_change_in_value':
        featureObject.assertions[assertion_key] = Object.assign(
          {
            title: 'convey changes in value',
            rationale: 'The user needs to know that the value was successfully changed.',
            strength: {
              sr: 'MUST',
              vc: 'NA',
              kb: 'NA',
            },
            pass_strategy: 'all',
            operation_modes: ['sr/interaction'],
          },
          assertion
        );
        break;
      case 'convey_change_in_state':
        featureObject.assertions[assertion_key] = Object.assign(
          {
            title: 'convey changes in state',
            rationale: 'The user needs to know that the state was successfully changed.',
            strength: {
              sr: 'MUST',
              vc: 'NA',
              kb: 'NA',
            },
            pass_strategy: 'all',
            operation_modes: ['sr/interaction'],
          },
          assertion
        );
        break;
      case 'convey_boundaries':
        featureObject.assertions[assertion_key] = Object.assign(
          {
            title: 'convey the boundaries of the element',
            rationale: 'A user needs to know when they enter and exit an element',
            strength: {
              sr: 'MUST',
              vc: 'NA',
              kb: 'NA',
            },
            examples: [
              'A screen reader might announce the role of the element when entering and say something like "leaving" when exiting.',
              'A screen reader might not explicitly announce entering and existing the element, but instead imply that the is in the containing object by conveying the roles of required children (options in a listbox for example).',
              'A screen reader might announce position in set information such as "1 of 6".',
              'A screen reader might not convey boundaries if the content fits on a single line',
            ],
            pass_strategy: 'all',
            operation_modes: ['sr/reading', 'sr/interaction'],
          },
          assertion
        );
        break;
      case 'convey_nesting_level':
        featureObject.assertions[assertion_key] = Object.assign(
          {
            title: 'convey the nesting level',
            rationale: 'A screen reader user might find it helpful to know what nesting level they are at',
            strength: {
              sr: 'SHOULD',
              vc: 'NA',
              kb: 'NA',
            },
            operation_modes: ['sr/reading', 'sr/interaction'],
          },
          assertion
        );
        break;
      case 'content_navigable':
        featureObject.assertions[assertion_key] = Object.assign(
          {
            title: 'allow navigating content',
            rationale: 'A user needs to be able to navigate the content',
            strength: {
              sr: 'MUST',
              vc: 'NA',
              kb: 'NA',
            },
            examples: ['A screen reader might allow reading-mode navigation, such as reading line-by-line.'],
            pass_strategy: 'all',
            operation_modes: ['sr/reading'],
          },
          assertion
        );
        break;
      case 'convey_posinset':
        featureObject.assertions[assertion_key] = Object.assign(
          {
            title: 'convey the position in set information',
            rationale: 'A user needs to where the position is in the list',
            strength: {
              sr: 'MUST',
              vc: 'NA',
              kb: 'NA',
            },
            examples: ['A screen reader might something like "1 of 6".'],
            operation_modes: ['sr/reading', 'sr/interaction'],
          },
          assertion
        );
        break;
      case 'convey_boolean_property':
        featureObject.assertions[assertion_key] = Object.assign(
          {
            id: 'convey_boolean_property',
            title: 'convey the property',
            rationale: 'The user needs to know that property is set',
            strength: {
              sr: 'MUST',
              vc: 'NA',
              kb: 'NA',
            },
            examples: ['A screen reader might announce the property along with the elements name, role, and value'],
            operation_modes: ['sr/reading', 'sr/interaction'],
          },
          assertion
        );
        break;
      case 'provide_shortcuts':
        featureObject.assertions[assertion_key] = Object.assign(
          {
            title: 'provide shortcuts to jump to this role',
            rationale: 'Screen reader users might want to quickly navigate to elements of this type.',
            strength: {
              sr: 'SHOULD',
              vc: 'NA',
              kb: 'NA',
            },
            operation_modes: ['sr/reading'],
          },
          assertion
        );
        break;
      case 'convey_setsize':
        featureObject.assertions[assertion_key] = Object.assign(
          {
            title: 'convey the number of items in the list',
            rationale: 'A user needs to be able to understand how many items are in the list',
            strength: {
              sr: 'MUST',
              vc: 'NA',
              kb: 'NA',
            },
            examples: [
              'A screen reader might convey the position of each item in the list as something like "x of y" where y is the number of items in the list.',
              'A screen reader might convey the number of items in the list when first entering the list.',
            ],
            operation_modes: ['sr/reading'],
          },
          assertion
        );
        break;
      case 'allow_data_entry':
        featureObject.assertions[assertion_key] = Object.assign(
          {
            title: 'allow data entry',
            rationale: 'Users need to be able to enter data',
            strength: {
              sr: 'NA',
              vc: 'MUST',
              kb: 'NA',
            },
            examples: ['Voice control software might allow someone to dictate data into a field once it is focused.'],
            operation_modes: ['vc'],
          },
          assertion
        );
        break;
    }
  });

  // Define the keywords_string
  featureObject.keywords_string = featureObject.keywords.join(' ').replace(/"/g, '');
}
