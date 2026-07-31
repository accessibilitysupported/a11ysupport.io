/**
 * T067 (part): port of test-case.pug:305-310.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function HistoryList({ history }: { history: any[] }) {
  return (
    <>
      <h2 id="history" tabIndex={-1}>History</h2>
      <ul>
        {history.map((record, i) => (
          <li key={i}>
            <strong>{record.date} </strong>
            <span dangerouslySetInnerHTML={{ __html: record.messageHtml ?? record.message }} />
          </li>
        ))}
      </ul>
    </>
  );
}
