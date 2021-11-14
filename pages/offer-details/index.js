injectRecreateButton();

function injectRecreateButton() {
  if (!document.location.href.includes("ekz-recreate=true")) {
    return;
  }

  const submitBtn = document.querySelector("#pstad-submit");

  if (submitBtn) {
    const btnSection = submitBtn.parentElement;
    btnSection.innerHTML = "";

    const newBtn = document.createElement("button");
    newBtn.type = "submit";
    newBtn.innerHTML = "Neu einstellen";
    newBtn.onclick = handleSubmit;

    btnSection.appendChild(newBtn);
  }
}

function handleSubmit(e) {
  e.preventDefault();
  const form = e.currentTarget.form;
  const toDelete = form.querySelector("#postad-id");
  if (toDelete) {
    form.removeChild(toDelete);
  }
  form.submit();
}
