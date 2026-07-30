/**
 * T069 (part): port of test-case-run.pug:160-164 / feature-test.js:316-324.
 */
import { useEffect, useRef } from 'react';

interface Props {
  issueBody: string;
  issueUrl: string;
}

export function IssueOutput({ issueBody, issueUrl }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
  }, [issueBody]);

  return (
    <div id="output">
      <h2 tabIndex={-1} id="output-heading" ref={headingRef}>
        Copy/paste this into a github issue
      </h2>
      <label htmlFor="issue-body">We generated an issue for you. Just copy paste this text into a github issue.</label>
      <textarea id="issue-body" readOnly rows={12} value={issueBody} />
      <a href={issueUrl} target="_new" id="issue-link">
        Use this link to create the issue
      </a>
    </div>
  );
}
