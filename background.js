let pairedTabs = [];

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  
  if (request.action === "start_sync") {
    pairedTabs = request.tabs;
    
    pairedTabs.forEach(tabId => {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ["content.js"]
      }).catch(() => {});
    });

    chrome.action.setBadgeText({ text: "ON" });
    chrome.action.setBadgeBackgroundColor({ color: "#32CD32" }); 

    sendResponse({ status: "Sync active!" });
    return true;
  }

  if (request.action === "stop_sync") {
    pairedTabs = [];

    chrome.action.setBadgeText({ text: "" });

    sendResponse({ status: "Sync stopped." });
    return true;
  }

  if (request.action === "get_sync_state") {
    sendResponse({ 
      isSyncing: pairedTabs.length === 2,
      pairedTabs: pairedTabs
    });
    return true;
  }

  if (request.action === "scrolled") {
    if (pairedTabs.length < 2) return;

    const senderId = sender.tab.id;
    const targetId = pairedTabs.find(id => id !== senderId);

    if (targetId) {
      chrome.tabs.sendMessage(targetId, {
        action: "update_scroll",
        data: request.data
      }).catch(() => {
        pairedTabs = [];
        chrome.action.setBadgeText({ text: "ERR" });
        chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
      });
    }
  }
});