injectRecreateButton();

function injectRecreateButton() {
    if (!document.location.pathname.includes("ekz-recreate=true")) return;

  const submitBtn = document.querySelector("#pstad-submit");

  if (submitBtn) {
    const btnSection = submitBtn.parentElement;

    const newBtn = document.createElement("button");
    newBtn.type = "submit";
    newBtn.innerHTML = "Neu einstellen";
    newBtn.classList.add("recreate");

    newBtn.onclick = (e) => {
      e.preventDefault();
      const form = e.currentTarget.form;
      const toDelete = form.querySelector("#postad-id");
      if (toDelete) {
        form.removeChild(toDelete);
      }
      form.submit();
    };
    
    btnSection.appendChild(newBtn);
  }
}
