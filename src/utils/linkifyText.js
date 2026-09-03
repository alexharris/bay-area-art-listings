// Renders a plain string that may contain markdown-style [text](url) links
// into React nodes, turning each link into an <a> tag. Everything else is
// rendered as plain text.
export function linkifyText(text) {
  if (!text) return text;

  const linkPattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  const nodes = [];
  let lastIndex = 0;
  let match;
  let key = 0;

  while ((match = linkPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index));
    }
    const [, linkText, url] = match;
    nodes.push(
      <a key={key++} href={url} target="_blank" rel="noopener noreferrer" className="underline">
        {linkText}
      </a>
    );
    lastIndex = linkPattern.lastIndex;
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex));
  }

  return nodes;
}
