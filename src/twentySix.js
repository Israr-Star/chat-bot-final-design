(function () {
  if (window.ChatbotScriptLoaded) return;
  window.ChatbotScriptLoaded = true;
  const currentScriptTag =
    document.currentScript ||
    Array.from(document.getElementsByTagName("script")).pop();

  const param1 = currentScriptTag.getAttribute("data-param1");
  const param2 = currentScriptTag.getAttribute("data-bg");

  console.log(param1, param2);
  const chatbotConfig = {
    botUrl: "https://chat-bot-final-design.vercel.app/",
    width: "450px",
    height: "660px",
    position: "bottom-right",
    queryParams: {
      bgColor: param2, // Dynamic value
    },
  };

  const queryString = new URLSearchParams(chatbotConfig.queryParams).toString();
  const chatbotUrlWithParams = `${chatbotConfig.botUrl}?${queryString}`;

  const iframe = document.createElement("iframe");
  iframe.src = chatbotUrlWithParams;
  iframe.style.width = chatbotConfig.width;
  iframe.style.height = chatbotConfig.height;
  iframe.style.position = "fixed";
  iframe.style.border = "none";
  iframe.style.zIndex = "9999";
  iframe.style.borderRadius = "18px";
  iframe.style.allowTransparency = "true";

  if (chatbotConfig.position === "bottom-right") {
    iframe.style.bottom = "0";
    iframe.style.right = "20px";
  } else if (chatbotConfig.position === "bottom-left") {
    iframe.style.bottom = "0";
    iframe.style.left = "20px";
  }

  document.body.appendChild(iframe);
})();
