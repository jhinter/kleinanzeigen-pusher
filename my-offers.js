injectRecreateButton();

function injectRecreateButton() {
  const editBtns = document.querySelectorAll("a[href^='/p-anzeige-bearbeiten.html']");

  editBtns.forEach((btn) => {
    const liElement = btn.parentElement;
    const ulElement = liElement.parentElement;

    const newLiElement = document.createElement('li');
    newLiElement.className = liElement.className
    const newLink = document.createElement('a');
    newLink.href = btn.href + "&ekz-recreate=true"
    newLink.innerHTML = `
      <i class="icon button-icon extend-icon icon-redo-gray"></i>Neu einstellen
    `
    newLink.className = btn.className
    
    newLiElement.appendChild(newLink);
    ulElement.appendChild(newLiElement);
  })
}
