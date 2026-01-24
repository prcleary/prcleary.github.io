+++
title = "Useful JavaScript snippets"
+++

{{ toc() }}

## Extract Proton Mail emails to add to task list

Paste into browser console (should work on all browsers):

```javascript
(() => {
  const rows = document.querySelectorAll(
    '[data-testid="message-list:message"]'
  );

  const lines = [];

  rows.forEach(row => {
    const subject =
      row.querySelector('[data-testid="message-column:subject"]')
        ?.innerText.trim() ?? '';

    const sender =
      row.querySelector('[data-testid="message-column:sender-address"] span:last-child')
        ?.innerText.trim() ?? '';

    const date =
      row.querySelector('[data-testid="item-date-simple"]')
        ?.innerText.trim() ?? '';

    const labels = [...row.querySelectorAll('.label-stack-item-text')]
      .map(l => l.innerText.trim())
      .join(',');

    lines.push(
      `${subject} | ${sender} | ${date}${labels ? ' | labels:' + labels : ''}`
    );
  });

  const output =
    `Extracted ${lines.length} emails:\n\n` +
    lines.join('\n');

  console.clear();
  console.log(output);
})();
```

