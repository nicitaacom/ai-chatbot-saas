;(function () {
  const s = document.currentScript
  const widgetId = s.getAttribute("data-widget-id")
  // language will be fetched from widgetId (row in supabase widgetId will contain that info)
  // const languageTag = s.getAttribute("data-language-tag")

  let isOpen = false
  let iframe = null

  // 1. Create launcher button
  const button = document.createElement("button")
  button.style = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 999999;
    width: 64px;
    height: 64px;
    background: #00c851;
    border-radius: 50%;
    border: none;
    cursor: pointer;
    box-shadow: 0 4px 20px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.3s ease;
  `
  button.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" fill="white" height="28" viewBox="0 0 24 24" width="28">
      <path d="M0 0h24v24H0z" fill="none"/>
      <path d="M12 3C7.03 3 3 6.58 3 11c0 2.38 1.21 4.52 3.22 6.05L6 21l3.39-1.25c.84.22 1.73.34 2.61.34 4.97 0 9-3.58 9-8s-4.03-8-9-8z"/>
    </svg>
  `
  document.body.appendChild(button)

  // 2. Create iframe element (but don't append yet)
  function createIframe() {
    const url = process.env.NODE_ENV === "production" ? process.env.NEXT_PUBLIC_PRODUCTION_URL : "http://localhost:3000"
    iframe = document.createElement("iframe")
    iframe.id = "chat-iframe"
    iframe.src = `${url}/embed?widgetId=${widgetId}`
    iframe.style = `
      all: unset;
      position: fixed;
      bottom: 100px;
      right: 20px;
      width: 400px;
      height: 600px;
      z-index: 999998;
      border-radius: 16px;
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
      background: white;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s ease;
      pointer-events: none;
    `
    document.body.appendChild(iframe)

    // Allow animation to apply
    setTimeout(() => {
      iframe.style.opacity = "1"
      iframe.style.transform = "translateY(0)"
      iframe.style.pointerEvents = "auto"
    }, 10)
  }

  // 3. Toggle iframe
  function toggleChat() {
    if (isOpen) {
      closeChat()
    } else {
      createIframe()
      isOpen = true
    }
  }

  // 4. Close iframe with animation
  function closeChat() {
    if (!iframe) return
    iframe.style.opacity = "0"
    iframe.style.transform = "translateY(20px)"
    iframe.style.pointerEvents = "none"
    setTimeout(() => {
      if (iframe) {
        iframe.remove()
        iframe = null
        isOpen = false
      }
    }, 300)
  }

  // 5. Handle outside click
  document.addEventListener("click", function (event) {
    if (!isOpen || !iframe) return

    const target = event.target
    if (!iframe.contains(target) && !button.contains(target) && target !== iframe && target !== button) {
      closeChat()
    }
  })

  // 6. Escape key closes
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeChat()
  })

  // 7. Bind click to launcher
  button.addEventListener("click", toggleChat)
})()
