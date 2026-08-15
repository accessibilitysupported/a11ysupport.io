/**
 * T064: port of tech.pug. Fixes corrected-defect #1: the original reads
 * `feature.core_support_string.string`, but the build emits `core_support_string` keyed by AT
 * type (`.sr`/`.vc`/`.kb`) — it has always rendered blank. Fixed to show each supported type's
 * summary, filtered to `feature.supports_at` (the same filter index.pug/feature.pug use
 * elsewhere for this exact field).
 */
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router';
import { api } from '../lib/api';
import { usePageTitle } from '../lib/usePageTitle';
import { LoadingStatus } from '../components/LoadingStatus';
import { ErrorPage } from './ErrorPage';
import { makeSafe } from '../../src/lib/test-id-helper';
import type { AtType } from '../../src/types/at-browsers';

const AT_TYPE_LABELS: Record<AtType, string> = { sr: 'SR', vc: 'VC', kb: 'KB' };

export function TechPage() {
  const { techId } = useParams();
  usePageTitle(`${techId} | Accessibility Support`);

  const { data: tech, isPending, isError, error } = useQuery({
    queryKey: ['tech', techId],
    queryFn: () => api.tech(techId!),
  });

  if (isPending) return <LoadingStatus />;
  if (isError) return <ErrorPage message={(error as Error).message} />;

  return (
    <div className="content-wrapper">
      <div className="content">
        <h1>{techId}</h1>
        <p>{tech.description}</p>

        <h2>Features and Tests</h2>
        <p>
          Features represent the various aspects of a technology. In HTML a feature might be an element or
          attribute. In CSS a feature might be a property. In ARIA a feature might be an attribute.
        </p>
        <p>
          A test is a manual verification that a feature works like it is supposed to. The expectations of a
          feature might change in different contexts or when combined with different features and technologies.
          Therefore each feature can have many tests, and a test can be shared between many features and
          technologies. In general, a test should be specifically tailored to measure a single outcome.
        </p>

        {!tech.features || tech.features.length === 0 ? (
          <p>
            <strong>We don&apos;t have any features listed yet. Please contribute some!</strong>
          </p>
        ) : (
          <>
            <p>
              Can&apos;t find what you are looking for? Please{' '}
              <a href="https://github.com/accessibilitysupported/accessibilitysupported/issues/new">
                create an issue
              </a>{' '}
              and let us know.
            </p>
            <table>
              <tbody>
                <tr>
                  <th>Feature</th>
                  <th>Has Support</th>
                  <th>Failing tests</th>
                </tr>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {tech.features.map((feature: any) => (
                  <tr key={feature.id}>
                    <td>
                      <Link to={`/tech/${techId}/${feature.id}`}>{feature.id}</Link>
                    </td>
                    <td>
                      {(feature.supports_at ?? []).map((type: AtType) => (
                        <span key={type}>
                          {AT_TYPE_LABELS[type]}: {feature.core_support_string?.[type]?.string ?? 'unknown'}{' '}
                        </span>
                      ))}
                    </td>
                    <td>
                      {feature.failing_tests?.length > 0 && (
                        <ul>
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {feature.failing_tests.map((test: any) => (
                            <li key={test.id}>
                              <Link to={`/tests/${makeSafe(test.id)}`}>{test.title}</Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>

      {tech.references && (
        <div className="sidebar">
          <h2>References</h2>
          <ul>
            {tech.references.map((reference: { url: string; title: string }) => (
              <li key={reference.url}>
                <a href={reference.url}>{reference.title}</a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
