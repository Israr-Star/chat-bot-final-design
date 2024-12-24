(function () {
  // Check if the script is already loaded
  if (window.ChatbotScriptLoaded) return;
  window.ChatbotScriptLoaded = true;

  // Configuration object
  const chatbotConfig = {
    botUrl: "https://chat-bot-final-design.vercel.app/", // Replace with your chatbot's URL
    width: "450px",
    height: "660px",
    position: "bottom-right", // Options: 'bottom-right', 'bottom-left'
  };

  // Create iframe
  const iframe = document.createElement("iframe");
  iframe.src = chatbotConfig.botUrl;
  iframe.style.width = chatbotConfig.width;
  iframe.style.height = chatbotConfig.height;
  iframe.style.position = "fixed";
  iframe.style.border = "none";
  iframe.style.zIndex = "9999";
  // iframe.style.backgroundColor = "#FFFFFF";
  iframe.style.borderRadius = "18px";
  // iframe.style.display = "none"; // Initially hidden
  iframe.style.allowTransparency = "true";

  // Set position
  if (chatbotConfig.position === "bottom-right") {
    iframe.style.bottom = "0";
    iframe.style.right = "20px";
  } else if (chatbotConfig.position === "bottom-left") {
    iframe.style.bottom = "0";
    iframe.style.left = "20px";
  }

  // Append iframe to body
  document.body.appendChild(iframe);
})();
