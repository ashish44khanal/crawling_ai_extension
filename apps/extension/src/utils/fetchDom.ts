export const fetchDOM = async (): Promise<{ url: string; dom: string } | null> => {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab?.id) return reject('No active tab');

      const url = activeTab.url || '';

      chrome.scripting.executeScript(
        {
          target: { tabId: activeTab.id },
          func: () => {
            const bodyHTML = document.body.innerHTML;
            const parser = new DOMParser();
            const doc = parser.parseFromString(bodyHTML, 'text/html');

            // Remove unwanted tags
            doc
              .querySelectorAll(
                'script, style, noscript, svg,img,video,audio,iframe,header,footer,nav'
              )
              .forEach((el) => el.remove());
            // Remove comments
            doc.body.innerHTML = doc.body.innerHTML.replace(/<!--[\s\S]*?-->/g, '');

            // Remove elements with display:none
            doc.querySelectorAll('*').forEach((el) => {
              const style = window.getComputedStyle(el);
              if (style && style.display === 'none') el.remove();
            });

            // Get cleaned HTML
            let cleanedHTML = doc.body.innerHTML;

            // Normalize whitespace
            cleanedHTML = cleanedHTML.replace(/\s+/g, ' ').trim();

            return cleanedHTML;
          },
        },
        (injectionResults) => {
          if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);

          if (injectionResults && injectionResults.length > 0) {
            const dom = injectionResults[0].result as string;
            resolve({ url, dom });
          } else {
            reject('No result from executeScript');
          }
        }
      );
    });
  });
};
