(function () {
  // During local dev use localhost; after deploy, change this to your Vercel URL
   var CHAT_URL = "https://chatbot-frontend-rishav.vercel.app";

  if (window.__RISHAV_CHATBOT_WIDGET_LOADED__) return;
  window.__RISHAV_CHATBOT_WIDGET_LOADED__ = true;

  var container = document.createElement("div");
  container.style.position = "fixed";
  container.style.bottom = "20px";
  container.style.right = "20px";
  container.style.zIndex = "999999";
  container.style.fontFamily = "system-ui, sans-serif";

  var iframe = document.createElement("iframe");
  iframe.src = CHAT_URL;
  iframe.style.width = "602px";
  iframe.style.height = "70vh";
  iframe.style.border = "none";
  iframe.style.borderRadius = "12px";
  iframe.style.boxShadow = "0 0 20px rgba(0,0,0,0.15)";
  iframe.style.display = "none";
  iframe.style.background = "white";

  var button = document.createElement("button");
  button.innerText = "Chat with Rishav";
  button.style.width = "150px";
  button.style.height = "48px";
  button.style.borderRadius = "999px";
  button.style.border = "none";
  button.style.cursor = "pointer";
  button.style.fontSize = "14px";
  button.style.fontWeight = "600";
  button.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
  button.style.background = "#111827";
  button.style.color = "white";
  button.style.marginTop = "8px";

  var isOpen = false;
  button.onclick = function () {
    isOpen = !isOpen;
    iframe.style.display = isOpen ? "block" : "none";
    button.innerText = isOpen ? "Close chat" : "Chat with Rishav";
  };

  container.appendChild(iframe);
  container.appendChild(button);
  document.body.appendChild(container);
})();
