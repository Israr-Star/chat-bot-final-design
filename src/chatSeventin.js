(function () {
  // Check if the script is already loaded
  if (window.ChatbotScriptLoaded) return;
  window.ChatbotScriptLoaded = true;

  // Configuration object
  const chatbotConfig = {
    botUrl: "https://chat-bot-final-design.vercel.app/", // Replace with your chatbot's URL
    width: "54px",
    height: "54px",
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
  iframe.style.display = "none"; // Initially hidden
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
  iframe.addEventListener("click", () => {
    if (iframe.style.display === "none") {
      iframe.style.width = "400px";
      iframe.style.height = "650px";
      iframe.style.display = "block";
    } else {
      iframe.style.width = chatbotConfig.width;
      iframe.style.height = chatbotConfig.height;
      iframe.style.display = "none";
    }
  });
  

  // Create toggle button

  // const toggleButtonWrapper = document.createElement("iframe");

  // // Apply styles to the button
  // toggleButtonWrapper.style.width = "54px";
  // toggleButtonWrapper.style.height = "54px";
  // toggleButtonWrapper.style.borderRadius = "18px";
  // // toggleButtonWrapper.style.backgroundColor = "#007bff";
  // toggleButtonWrapper.style.position = "fixed";
  // toggleButtonWrapper.style.bottom = "12px";
  // toggleButtonWrapper.style.right = "20px";
  // // toggleButtonWrapper.style.zIndex = "10000";
  // toggleButtonWrapper.style.cursor = "pointer";
  // toggleButtonWrapper.style.display = "flex";
  // toggleButtonWrapper.style.alignItems = "center";
  // toggleButtonWrapper.style.justifyContent = "center";
  // // Track visibility state
  // document.body.appendChild(toggleButtonWrapper);

  // const containerDiv = document.createElement("div");
  // containerDiv.style.boxShadow =
  //   "0px 24px 16px -5px #7C3AED29, 0px 20px 25px -5px #00000033";

  // containerDiv.style.width = "54px";
  // containerDiv.style.height = "54px";
  // containerDiv.style.borderRadius = "18px";
  // containerDiv.style.backgroundColor = "#7C3AED";
  // containerDiv.style.display = "flex";
  // containerDiv.style.alignItems = "center";
  // containerDiv.style.justifyContent = "center";
  // containerDiv.style.transition = "transform 0.3s ease";
  // containerDiv.style.position = "fixed";
  // containerDiv.style.bottom = "12px";
  // containerDiv.style.right = "20px";
  // containerDiv.style.cursor = "pointer";
  // containerDiv.style.zIndex = "10000";
  // const img = document.createElement("img");
  // img.src = "http://localhost:5173/src/assets/icon/chat.svg"; // Replace with the path to your SVG icon
  // img.alt = "SVG Icon";
  // img.style.width = "24px";
  // img.style.height = "24px";
  // containerDiv.appendChild(img);

  // let isChatShown = false;

  // containerDiv.addEventListener("click", () => {
  //   if (iframe.style.display === "none") {
  //     iframe.style.display = "block";
  //     containerDiv.removeChild(img);
  //     img.src = "http://localhost:5173/src/assets/icon/arrow.svg"; // Replace with the path to your SVG icon
  //     img.alt = "SVG Icon";
  //     img.style.width = "24px";
  //     img.style.height = "24px";
  //     containerDiv.appendChild(img);
  //   } else {
  //     iframe.style.display = "none";
  //     containerDiv.removeChild(img);
  //     img.src = "http://localhost:5173/src/assets/icon/chat.svg"; // Replace with the path to your SVG icon
  //     img.alt = "SVG Icon";
  //     img.style.width = "24px";
  //     img.style.height = "24px";
  //     containerDiv.appendChild(img);
  //   }
  // });
  // // toggleButtonWrapper.onclick = () => {
  // //   if (isChatShown) {
  // //     isChatShown = false;
  // //     containerDiv.removeChild(img);
  // //     img.src = "/src/assets/icon/chat.svg"; // Replace with the path to your SVG icon
  // //     img.alt = "SVG Icon";
  // //     img.style.width = "24px";
  // //     img.style.height = "24px";
  // //     containerDiv.appendChild(img);
  // //     iframe.style.display = "none";
  // //   } else {
  // //     isChatShown = true;
  // //     containerDiv.removeChild(img);
  // //     img.src = "/src/assets/icon/arrow.svg"; // Replace with the path to your SVG icon
  // //     img.alt = "SVG Icon";
  // //     img.style.width = "24px";
  // //     img.style.height = "24px";
  // //     containerDiv.appendChild(img);
  // //     iframe.style.display = "block";
  // //   }
  // //   // setChatVisible((prevChatVisible) => !prevChatVisible);
  // // };
  // containerDiv.onmouseover = () => {
  //   containerDiv.style.transform = "scale(1.2)";
  // };
  // containerDiv.onmouseout = () => {
  //   containerDiv.style.transform = "scale(1)";
  // };
  // document.body.appendChild(containerDiv);

  // Apply styles to the button
  // const toggleButton = document.createElement("div");

  // toggleButton.style.width = "40px";
  // toggleButton.style.height = "40px";
  // toggleButton.style.borderRadius = "50%";
  // toggleButton.style.backgroundColor = "#007bff";
  // toggleButton.style.position = "fixed";
  // toggleButton.style.bottom = "0";
  // toggleButton.style.right = "20px";
  // toggleButton.style.zIndex = "10000";
  // toggleButton.style.cursor = "pointer";
  // toggleButton.style.display = "flex";
  // toggleButton.style.alignItems = "center";
  // toggleButton.style.justifyContent = "center";

  // // Create a span element to hold the icon
  // const icon = document.createElement("span");
  // icon.style.fontSize = "24px";
  // icon.style.color = "white";
  // icon.innerHTML = "&#128172;"; // Initial icon

  // toggleButton.appendChild(icon);

  // // Append the button to the body
  // document.body.appendChild(toggleButton);
  // let visible = false;

  // // Add click event listener to toggle the iframe
  // toggleButton.addEventListener("click", () => {
  // if (iframe.style.display === "none") {
  //   iframe.style.display = "block";
  // } else {
  //   iframe.style.display = "none";
  // }
  // });
  //   toggleButtonWrapper.onclick = function () {};
})();
