/**
 * T060: renders markdown pre-rendered to HTML at build time (src/build/emit-api-payloads.ts),
 * matching the `p!= md.render(...)` / `div!= md.render(...)` raw-HTML-insertion pattern used
 * throughout the Pug templates. The HTML is generated from our own maintained markdown files
 * (FAQ.md, CONTRIBUTING.md, documentation/**), never user input.
 */
interface Props {
  html: string;
  className?: string;
}

export function MarkdownContent({ html, className }: Props) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
