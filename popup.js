chrome.tabs.query({ currentWindow: true }, (tabs) => {
  const selectFirstTab = document.getElementById('tab1');
  const selectSecondTab = document.getElementById('tab2');

  tabs.forEach((tab) => {
    let title = tab.title.length > 50 ? tab.title.substring(0, 50) + "..." : tab.title;
    let option = new Option(title, tab.id);
    
    selectFirstTab.add(option.cloneNode(true));
    selectSecondTab.add(option.cloneNode(true));
  });

  chrome.storage.local.get(['lastTab1', 'lastTab2'], (result) => {
    const lastTab1 = result.lastTab1;
    const lastTab2 = result.lastTab2;

    if (lastTab1) {
      const option1 = Array.from(selectFirstTab.options).find(opt => opt.value === String(lastTab1));
      if (option1) selectFirstTab.value = lastTab1;
    }

    if (lastTab2) {
      const option2 = Array.from(selectSecondTab.options).find(opt => opt.value === String(lastTab2));
      if (option2) selectSecondTab.value = lastTab2;
    } else if (selectSecondTab.options.length > 1) {
      selectSecondTab.selectedIndex = 1;
    }

    chrome.runtime.sendMessage({ action: "get_sync_state" }, (response) => {
      if (response.isSyncing) {
        updateStatus("Sync active!");
        toggleButtons(true);
      }
    });
  });
});

document.getElementById('startBtn').addEventListener('click', () => {
  const firstTabId = parseInt(document.getElementById('tab1').value);
  const secondTabId = parseInt(document.getElementById('tab2').value);

  if (firstTabId === secondTabId) {
    updateStatus("Error: Please select two different tabs!");
    return;
  }

  chrome.storage.local.set({ 
    lastTab1: firstTabId, 
    lastTab2: secondTabId 
  });

  chrome.runtime.sendMessage({ 
    action: "start_sync", 
    tabs: [firstTabId, secondTabId] 
  }, (response) => {
    updateStatus(response.status);
    toggleButtons(true);
  });
});

document.getElementById('stopBtn').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: "stop_sync" }, (response) => {
    updateStatus(response.status);
    toggleButtons(false);
  });
});

document.getElementById('closePopupBtn').addEventListener('click', () => {
  window.close();
});

function updateStatus(msg) {
  document.getElementById('status').innerText = msg;
}

function toggleButtons(isSyncing) {
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  
  if (isSyncing) {
    startBtn.style.display = 'none';
    stopBtn.style.display = 'block';
    stopBtn.focus();
  } else {
    startBtn.style.display = 'block';
    stopBtn.style.display = 'none';
    startBtn.focus();
  }
}