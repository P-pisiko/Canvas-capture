// 
const durationInput   = document.getElementById('duration');
const pngFpsInput     = document.getElementById('png_fps');
const recordPngBtn    = document.getElementById('recordPngButton');

const bitrateInput    = document.getElementById('webm_bitrate');
const recordWebmBtn   = document.getElementById('recordWebmButton');

// helper function to get active tab
function getActiveTab() {
  return chrome.tabs.query({ active: true, currentWindow: true })
    .then(tabs => tabs[0]);
    
}
// helper to inject content.js content to the active tab.
async function injectContentScript(tabId) {
  await chrome.scripting.executeScript({
    target: { tabId },
    files: ['libs/jszip.min.js', 'content.js']
  });
}

// event listener for the png sequance button
recordPngBtn.addEventListener('click', async () => {
  
  

  const durationSec = Number(durationInput.value) || 5;
  const fps = Number(pngFpsInput.value) || 24;
  const tab = await getActiveTab();

  await injectContentScript(tab.id)

  chrome.tabs.sendMessage(tab.id, {
    action:   'capture_png_sequence',
    duration: durationSec * 1000,   // ms
    fps:      fps
  });
});

// event listener for the webm video button
recordWebmBtn.addEventListener('click', async () => {
  const durationSec = Number(durationInput.value) || 5;
  const bitrateKbps = Number(bitrateInput.value) || 8000;

  const tab = await getActiveTab();
  
  await injectContentScript(tab.id)

  chrome.tabs.sendMessage(tab.id, {
    action:   'capture_webm_video',
    duration: durationSec * 1000,       // ms
    bitrate:  bitrateKbps * 1000       // bits per second
  });
});
