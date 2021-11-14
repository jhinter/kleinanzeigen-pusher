injectRecreateButton();

function injectRecreateButton() {
  const actionLinks = document.querySelectorAll(
    "a[href^='/p-anzeige-bearbeiten.html']"
  );

  actionLinks.forEach((originalLink) => {
    const liElement = originalLink.parentElement;
    const ulElement = liElement.parentElement;
    const newLiElement = createLiRecreate({ originalLink, liElement });

    ulElement.appendChild(newLiElement);
  });
}

function createLiRecreate({ originalLink, liElement }) {
  const newLiElement = document.createElement("li");
  newLiElement.className = liElement.className;

  const newLink = document.createElement("a");
  newLink.href = originalLink.href + "&ekz-recreate=true";
  newLink.className = originalLink.className;
  newLink.classList.add("ekz-recreate");
  newLink.innerHTML = `
    <i class="icon button-icon extend-icon icon-redo-gray"></i>Neu einstellen
  `;

  newLiElement.appendChild(newLink);

  return newLiElement;
}
