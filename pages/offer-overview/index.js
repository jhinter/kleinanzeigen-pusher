// Overview page ("Meine Anzeigen"). The ad list renders client-side, so instead
// of a fixed timeout we watch the DOM and inject a green "Neu einstellen" button
// next to every edit link as the list appears. The button reopens the edit page
// with the ekz-recreate flag, which pages/offer-details/index.js acts on.

const RECREATE_FLAG = "ekz-recreate=true";

injectRecreateButtons();

const observer = new MutationObserver(injectRecreateButtons);
observer.observe(document.documentElement, { childList: true, subtree: true });

function injectRecreateButtons() {
  const actionLinks = document.querySelectorAll(
    "a[href*='p-anzeige-bearbeiten.html']"
  );

  actionLinks.forEach((originalLink) => {
    if (originalLink.classList.contains("ekz-recreate")) return; // our own link
    if (originalLink.dataset.ekzProcessed) return;
    originalLink.dataset.ekzProcessed = "1";

    const liElement = originalLink.parentElement;
    const ulElement = liElement && liElement.parentElement;
    if (!ulElement) return;

    ulElement.appendChild(createLiRecreate({ originalLink, liElement }));
  });
}

function createLiRecreate({ originalLink, liElement }) {
  const newLiElement = document.createElement("li");
  newLiElement.className = liElement.className;

  const newLink = document.createElement("a");
  newLink.href = withRecreateFlag(originalLink.href);
  newLink.className = originalLink.className;
  newLink.classList.add("ekz-recreate");
  newLink.innerHTML = `
    <svg class="ekz-recreate-icon" width="16" height="16" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
      stroke-linejoin="round" aria-hidden="true">
      <polyline points="23 4 23 10 17 10"></polyline>
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path>
    </svg>Neu einstellen
  `;

  newLiElement.appendChild(newLink);

  return newLiElement;
}

function withRecreateFlag(href) {
  if (href.includes(RECREATE_FLAG)) return href;
  return href + (href.includes("?") ? "&" : "?") + RECREATE_FLAG;
}
