document.body.classList.add(window.location.hash?.substring(1)||(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"));
