let isSyncing = false;
let syncTimeout;

window.addEventListener('scroll', () => {
  if (isSyncing) return;

  chrome.runtime.sendMessage({
    action: "scrolled",
    data: { 
      x: window.scrollX, 
      y: window.scrollY,
      pctY: window.scrollY / (document.body.scrollHeight - window.innerHeight)
    }
  });
});

chrome.runtime.onMessage.addListener((request) => {
  if (request.action === "update_scroll") {
    isSyncing = true;
    
    const { x, y } = request.data;
    window.scrollTo(x, y);

    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => {
      isSyncing = false;
    }, 50);
  }
});