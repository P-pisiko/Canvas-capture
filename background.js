chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    files: ['libs/jszip.min.js'] // inject JSZip
  }, () => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js'] //🔁 
    });
  });
});
