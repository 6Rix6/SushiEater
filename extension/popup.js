let isEnabled = false;

document.getElementById("toggle").addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab) return;

  if (!isEnabled) {
    // main.js を注入
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: function(){
            const script = document.createElement("script");
            script.src = chrome.runtime.getURL("main.js");
            script.id = "cheat-main-script";
            document.body.appendChild(script);
            console.log("🎮 Cheat activated (main.js loaded)!");
        }
    });
    isEnabled = true;
    document.getElementById("toggle").innerText = "無効化";
  } else {
    // 再読み込みでリセット（無効化）
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        location.reload(); // 手軽に元に戻す
      },
    });
    isEnabled = false;
    document.getElementById("toggle").innerText = "有効化";
  }
});

document.getElementById('auto').addEventListener('click',async ()=>{
  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    chrome.tabs.sendMessage(tab.id, { type: "TOGGLE_CHEAT", state: document.getElementById('auto').checked });
  });
});

document.getElementById('visible').addEventListener('click',async ()=>{
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const isVisible = document.getElementById('visible').checked;
  if (isVisible){
    chrome.scripting.executeScript( {
      target: { tabId: tab.id },
      func: function(){
        const bufferCanvas = document.getElementById("bufferCanvas");
        if (bufferCanvas) bufferCanvas.style.display = "block";
      }
    });
  }else{
    chrome.scripting.executeScript( {
      target: { tabId: tab.id },
      func: function(){
        const bufferCanvas = document.getElementById("bufferCanvas");
        if (bufferCanvas) bufferCanvas.style.display = "none";
      }
    });
  }
});