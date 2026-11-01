(() => {
  const params = new URLSearchParams(location.search);
  if (params.get(EKP_RECREATE_PARAM) !== EKP_RECREATE_VALUE) return;

  const oldAdId = params.get("adId");
  if (!oldAdId) return;

  // The post form builds `new FormData(form)` on submit and preview; blanking adId there turns the
  // edit into a new listing, independent of React re-rendering the hidden input.
  document.addEventListener(
    "formdata",
    (event) => {
      if (!event.formData.has("adId")) return;
      event.formData.set("adId", "");
      ekpWritePending({ oldAdId, title: String(event.formData.get("title") ?? "").trim() });
    },
    true
  );

  ekpBanner({
    id: "ekp-edit-banner",
    title: "Kleinanzeigen Pusher: Neu einstellen",
    text:
      "Prüfe die Anzeige und klicke unten auf „Anzeige speichern“. Sie wird dann als neue Anzeige " +
      "eingestellt und erscheint wieder ganz oben. Die alte Anzeige kannst du danach unter " +
      "„Meine Anzeigen“ mit einem Klick löschen.",
    actions: [
      ekpButton("Abbrechen", () => location.assign("/m-meine-anzeigen.html"), "secondary"),
    ],
  });
})();
