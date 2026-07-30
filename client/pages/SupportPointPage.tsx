/**
 * T070: port of test-case-support-point.pug.
 */
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router';
import { api } from '../lib/api';
import { usePageTitle } from '../lib/usePageTitle';
import { LoadingStatus } from '../components/LoadingStatus';
import { ErrorPage } from './ErrorPage';
import { makeSafe } from '../../src/lib/test-id-helper';

export function SupportPointPage() {
  const { testId, featureId, assertionId, atId, browserId } = useParams();
  const atBrowsersQuery = useQuery({ queryKey: ['at-browsers'], queryFn: api.atBrowsers });
  const supportPointQuery = useQuery({
    queryKey: ['support-point', testId, featureId, assertionId, atId, browserId],
    queryFn: () => api.supportPoint(testId!, featureId!, assertionId!, atId!, browserId!),
  });

  usePageTitle(
    atBrowsersQuery.data && supportPointQuery.data
      ? `${atId}/${browserId} | Test: ${supportPointQuery.data.test.title} | Accessibility Support`
      : 'Accessibility Support'
  );

  if (atBrowsersQuery.isPending || supportPointQuery.isPending) return <LoadingStatus />;
  if (atBrowsersQuery.isError) return <ErrorPage message={(atBrowsersQuery.error as Error).message} />;
  if (supportPointQuery.isError) return <ErrorPage message={(supportPointQuery.error as Error).message} />;

  const atBrowsers = atBrowsersQuery.data;
  const { test, assertion } = supportPointQuery.data;
  const result = assertion.results[atId!].browsers[browserId!];
  const version = test.versions[atId!]?.browsers?.[browserId!];

  return (
    <div className="content">
      <h1>
        Test: {test.title} ({atBrowsers.at[atId!]!.title}/{atBrowsers.browsers[browserId!]!.title})
      </h1>

      {assertion && (
        <p>
          Expectation: {assertion.feature_title}: {assertion.assertion_strength[atBrowsers.at[atId!]!.type]}{' '}
          {assertion.assertion_title}
          {assertion.applied_to && <span> - applied to the {assertion.applied_to_title}</span>}
          {assertion.references?.length > 0 && <span> - references the {assertion.references_titles}</span>}
        </p>
      )}

      <ul>
        <li>
          <Link to={`/tests/${makeSafe(test.id)}`}>Go back to the test</Link>
        </li>
        <li>
          <Link to={`/tests/${makeSafe(test.id)}/run`}>Submit new test results</Link>
        </li>
        <li>
          <a href={`/tests/html/${test.html_file}`}>Open the test case HTML file</a>
        </li>
      </ul>

      <table>
        <caption>Details</caption>
        <thead>
          <tr>
            <th>Property</th>
            <th>Value</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th scope="row">Support</th>
            <td>
              {result.support_string.string}
              {result.support_string.string === 'none' && (
                <div>
                  <strong>Grading Note:</strong>
                  <span>
                    {' '}
                    There is no known/documented support. There may still be support for this expectation, but
                    it is undocumented. If this is the case, please report this issue.
                  </span>
                </div>
              )}
            </td>
          </tr>
          <tr>
            <th scope="row">AT Name</th>
            <td>
              <Link to={`/learn/at/${atId}`}>{atBrowsers.at[atId!]!.title}</Link>
            </td>
          </tr>
          <tr>
            <th scope="row">AT Version</th>
            <td>{version ? version.at_version : 'unknown'}</td>
          </tr>
          <tr>
            <th scope="row">Browser Name</th>
            <td>{atBrowsers.browsers[browserId!]!.title}</td>
          </tr>
          <tr>
            <th scope="row">Browser Version</th>
            <td>{version ? version.browser_version : 'unknown'}</td>
          </tr>
          <tr>
            <th scope="row">OS version</th>
            <td>{version ? version.os_version : 'unknown'}</td>
          </tr>
          <tr>
            <th scope="row">Date</th>
            <td>{version ? version.date : 'unknown'}</td>
          </tr>
          <tr>
            <th scope="row">Notes</th>
            <td dangerouslySetInnerHTML={{ __html: result.notesHtml ?? '' }} />
          </tr>
        </tbody>
      </table>

      {result.output && (
        <>
          <h2>Commands and Output</h2>
          <p>These are specific commands used to access the target element in the test, along with the resulting output.</p>
          <table>
            <thead>
              <tr>
                <th>Command</th>
                <th>Result</th>
                <th>Output</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {result.output.map((output: any, i: number) => (
                <tr key={i}>
                  <td>
                    {output.command} ({atBrowsers.at[atId!]!.commands[output.command]?.command})
                  </td>
                  <td>{output.result}</td>
                  <td>{output.output}</td>
                  <td>
                    {output.notes && <span>{output.notes}</span>}
                    {(!assertion.pass_strategy || assertion.pass_strategy === 'any') && output.result === 'fail' && (
                      <>
                        <strong>Grading note:</strong>
                        <span> This command may be expected to fail. This result simply indicates that it did not yield support.</span>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
