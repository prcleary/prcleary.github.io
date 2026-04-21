document.addEventListener('DOMContentLoaded', function() {
  const copyIcon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>';
  const checkIcon = '<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" /></svg>';

  document.querySelectorAll('pre code').forEach(function(codeBlock) {
    const pre = codeBlock.parentElement;
    const button = document.createElement('button');
    button.className = 'code-copy-button';
    button.innerHTML = copyIcon;
    button.setAttribute('aria-label', 'Copy code to clipboard');
    button.setAttribute('title', 'Copy code');

    button.addEventListener('click', function() {
      navigator.clipboard.writeText(codeBlock.textContent).then(function() {
        button.innerHTML = checkIcon;
        button.setAttribute('title', 'Copied!');
        setTimeout(function() {
          button.innerHTML = copyIcon;
          button.setAttribute('title', 'Copy code');
        }, 2000);
      }).catch(function(err) {
        console.error('Copy failed:', err);
      });
    });

    pre.appendChild(button);
  });
});
