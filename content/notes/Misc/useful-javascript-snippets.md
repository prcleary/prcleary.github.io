+++
title = "Useful JavaScript snippets"
+++

{{ toc() }}

## Extract Outlook or Proton webmail info to add to task list

The most reliable method I have found for avoiding productive procrastination (where you keep busy all day, but avoid important tasks you are still processing subconsciously or have a mental block on) is to randomise my tasks. I have found ways to get my tasks out of Nextcloud tasks to include in a text-based randomisation process, but I need this to work for email as well. You can easily copy the titles of emails from the Outlook client but by default you can't copy out of webmail clients (I have Outlook and Proton Mail webmail accounts - it is unlikely to work with other types of webmail as is). 

The most convenient way is to create a bookmarklet (a browser bookmark than runs some Javascript) - this works for me:

```javascript
javascript:(function () {   var host = location.host;   var isProton = host.indexOf('mail.proton.me') !== -1;   var isOutlook = host.indexOf('outlook.office.com') !== -1;    var lines = [];   var prefix = '';    if (isProton) {     prefix = 'Proton Mail';     var rows = document.querySelectorAll('[data-testid="message-list:message"]');      for (var i = 0; i < rows.length; i++) {       var row = rows[i];       var subjectEl = row.querySelector('[data-testid="message-column:subject"]');       var senderEl = row.querySelector('[data-testid="message-column:sender-address"] span:last-child');       var dateEl = row.querySelector('[data-testid="item-date-simple"]');        var subject = subjectEl ? subjectEl.innerText.trim() : '';       var sender = senderEl ? senderEl.innerText.trim() : '';       var date = dateEl ? dateEl.innerText.trim() : '';        if (subject || sender || date) {         lines.push(prefix + ' | ' + subject + ' | ' + sender + ' | ' + date);       }     }    } else if (isOutlook) {     prefix = 'Outlook Mail';     var rowsO = document.querySelectorAll('div[role="option"]');      function isDateText(t) {       return /(am|pm|mon|tue|wed|thu|fri|sat|sun|\d{1,2}\/\d{1,2})/i.test(t);     }      for (var r = 0; r < rowsO.length; r++) {       var rowO = rowsO[r];       var texts = [];       var els = rowO.querySelectorAll('span, time');        for (var e = 0; e < els.length; e++) {         var t = els[e].innerText;         if (t) {           t = t.trim();           if (t && texts.indexOf(t) === -1) {             texts.push(t);           }         }       }        if (!texts.length) continue;        var dateO = '';       var nonDates = [];        for (var n = 0; n < texts.length; n++) {         if (!dateO && isDateText(texts[n])) {           dateO = texts[n];         } else {           nonDates.push(texts[n]);         }       }        if (!nonDates.length) continue;        var subjectO = '';       var senderO = '';        if (nonDates.length === 1) {         subjectO = nonDates[0];       } else {         nonDates.sort(function (a, b) {           return b.length - a.length;         });         subjectO = nonDates[0];         senderO = nonDates.length > 1 ? nonDates[1] : '';       }        lines.push(prefix + ' | ' + subjectO + ' | ' + senderO + ' | ' + dateO);     }    } else {     alert('Unsupported mail site.');     return;   }    if (!lines.length) {     alert('No messages found.');     return;   }    var overlay = document.createElement('div');   overlay.style.cssText =     'position:fixed;inset:0;background:rgba(0,0,0,0.4);' +     'z-index:999999;display:flex;align-items:center;justify-content:center;';    var box = document.createElement('div');   box.style.cssText =     'background:Canvas;color:CanvasText;' +     'width:92%;max-width:1100px;height:95%;' +     'padding:12px;display:flex;flex-direction:column;';    var header = document.createElement('div');   header.style.cssText =     'display:flex;align-items:center;gap:8px;margin-bottom:8px;';    var title = document.createElement('div');   title.textContent = 'Extracted ' + lines.length + ' emails';   title.style.cssText = 'font-weight:bold;flex:1;';    var copyBtn = document.createElement('button');   copyBtn.textContent = 'Copy';   copyBtn.style.cssText =     'background:ButtonFace;color:ButtonText;padding:4px 10px;';    var closeBtn = document.createElement('button');   closeBtn.textContent = 'Close';   closeBtn.style.cssText =     'background:ButtonFace;color:ButtonText;padding:4px 10px;';    header.appendChild(title);   header.appendChild(copyBtn);   header.appendChild(closeBtn);    var textarea = document.createElement('textarea');   textarea.value = lines.join('\n');   textarea.style.cssText =     'flex:1;width:100%;min-height:65vh;' +     'resize:none;font-family:monospace;font-size:12px;' +     'background:Canvas;color:CanvasText;';    copyBtn.onclick = function () {     textarea.focus();     textarea.select();     try {       if (navigator.clipboard && navigator.clipboard.writeText) {         navigator.clipboard.writeText(textarea.value);       } else {         document.execCommand('copy');       }       copyBtn.textContent = 'Copied';       setTimeout(function () {         copyBtn.textContent = 'Copy';       }, 1200);     } catch (e) {       alert('Copy failed.');     }   };    closeBtn.onclick = function () {     overlay.remove();   };    box.appendChild(header);   box.appendChild(textarea);   overlay.appendChild(box);   document.body.appendChild(overlay);    textarea.focus();   textarea.select(); })();
```

A little window should open allowing you to copy the list of email tasks.

If you can't create a bookmarklet, then while on the webmail page in your browser press F12 and find the console, then copy this code in:

```javascript
(() => {
  const host = location.host;
  const isProton = host.includes('mail.proton.me');
  const isOutlook = host.includes('outlook.office.com');

  const lines = [];
  let prefix = '';

  if (isProton) {
    prefix = 'Proton Mail';
    document.querySelectorAll('[data-testid="message-list:message"]').forEach(row => {
      const subject = row.querySelector('[data-testid="message-column:subject"]')?.innerText.trim() || '';
      const sender =
        row.querySelector('[data-testid="message-column:sender-address"] span:last-child')
          ?.innerText.trim() || '';
      const date = row.querySelector('[data-testid="item-date-simple"]')?.innerText.trim() || '';

      if (subject || sender || date) {
        lines.push(`${prefix} | ${subject} | ${sender} | ${date}`);
      }
    });

  } else if (isOutlook) {
    prefix = 'Outlook Mail';
    const isDateText = t =>
      /(am|pm|mon|tue|wed|thu|fri|sat|sun|\d{1,2}\/\d{1,2})/i.test(t);

    document.querySelectorAll('div[role="option"]').forEach(row => {
      const texts = [];
      row.querySelectorAll('span, time').forEach(el => {
        const t = el.innerText?.trim();
        if (t && !texts.includes(t)) texts.push(t);
      });

      if (!texts.length) return;

      let date = '';
      const nonDates = [];
      texts.forEach(t => {
        if (!date && isDateText(t)) date = t;
        else nonDates.push(t);
      });

      if (!nonDates.length) return;

      let subject = '';
      let sender = '';

      if (nonDates.length === 1) {
        subject = nonDates[0];
      } else {
        subject = [...nonDates].sort((a, b) => b.length - a.length)[0];
        sender = nonDates.find(t => t !== subject) || '';
      }

      lines.push(`${prefix} | ${subject} | ${sender} | ${date}`);
    });

  } else {
    alert('Open Proton Mail or Outlook Web Mail first.');
    return;
  }

  if (!lines.length) {
    alert('No messages found.');
    return;
  }

  const overlay = document.createElement('div');
  overlay.style.cssText =
    'position:fixed;inset:0;background:rgba(0,0,0,0.4);z-index:999999;' +
    'display:flex;align-items:center;justify-content:center;';

  const box = document.createElement('div');
  box.style.cssText =
    'background:Canvas;color:CanvasText;width:92%;max-width:1100px;height:95%;' +
    'padding:12px;display:flex;flex-direction:column;';

  const header = document.createElement('div');
  header.style.cssText = 'display:flex;gap:8px;align-items:center;margin-bottom:8px;';

  const title = document.createElement('div');
  title.textContent = `Extracted ${lines.length} emails`;
  title.style.cssText = 'font-weight:bold;flex:1;';

  const copyBtn = document.createElement('button');
  copyBtn.textContent = 'Copy';

  const closeBtn = document.createElement('button');
  closeBtn.textContent = 'Close';

  header.appendChild(title);
  header.appendChild(copyBtn);
  header.appendChild(closeBtn);

  const textarea = document.createElement('textarea');
  textarea.value = lines.join('\n');
  textarea.style.cssText =
    'flex:1;width:100%;min-height:65vh;resize:none;' +
    'font-family:monospace;font-size:12px;' +
    'background:Canvas;color:CanvasText;';

  copyBtn.onclick = () => {
    textarea.select();
    navigator.clipboard?.writeText(textarea.value) ||
      document.execCommand('copy');
    copyBtn.textContent = 'Copied';
    setTimeout(() => (copyBtn.textContent = 'Copy'), 1200);
  };

  closeBtn.onclick = () => overlay.remove();

  box.append(header, textarea);
  overlay.appendChild(box);
  document.body.appendChild(overlay);

  textarea.focus();
  textarea.select();
})();
```


