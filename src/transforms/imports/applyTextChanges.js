export default function applyTextChanges (input, changes) {
  return changes.reduceRight((text, change) => {
    const head = text.slice(0, change.span.start);
    const tail = text.slice(change.span.start + change.span.length);

    return `${head}${change.newText}${tail}`;
  }, input);
}