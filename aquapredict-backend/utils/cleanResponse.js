export const cleanResponse = (text) => {
  return text
    // remove markdown tables
    .replace(/\|.*\|/g, "")
    // remove headings
    .replace(/^#+\s.*$/gm, "")
    // remove checklist symbols
    .replace(/[-*•✔️✅]/g, "")
    // remove numbered steps
    .replace(/\d+\.\s+/g, "")
    // collapse extra newlines
    .replace(/\n{2,}/g, "\n\n")
    .trim();
};
