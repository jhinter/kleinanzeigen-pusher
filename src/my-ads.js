(() => {
  const EDIT_LINK_SELECTOR = 'a[href*="p-anzeige-bearbeiten.html"]:not([data-ekp-recreate])';

  function injectRecreateButtons() {
    for (const editLink of document.querySelectorAll(EDIT_LINK_SELECTOR)) {
      const adId = new URL(editLink.href, location.origin).searchParams.get("adId");
      if (!adId) continue;

      const anchor = editLink.closest("li") ?? editLink;
      const container = anchor.parentElement;
      if (!container || container.querySelector(`[data-ekp-recreate="${CSS.escape(adId)}"]`)) continue;

      const button = ekpEl("a", {
        href: ekpRecreateUrl(adId),
        className: "ekp-btn ekp-btn--primary ekp-btn--small",
        title: "Anzeige als neue Anzeige einstellen, damit sie wieder ganz oben erscheint",
      }, [ekpEl("span", { className: "ekp-btn__icon", ariaHidden: "true", textContent: "↑" }), "Neu einstellen"]);
      button.dataset.ekpRecreate = adId;

      anchor.after(anchor === editLink ? button : ekpEl("li", { className: anchor.className }, button));
    }
  }

  // The ad list is rendered client-side and re-rendered on paging, filtering and actions.
  let scheduled = false;
  new MutationObserver(() => {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(() => {
      scheduled = false;
      injectRecreateButtons();
    });
  }).observe(document.body, { childList: true, subtree: true });
  injectRecreateButtons();

  offerDeletionOfOldAd().catch((error) => console.warn("[Kleinanzeigen Pusher]", error));

  async function offerDeletionOfOldAd() {
    const pending = ekpReadPending();
    if (!pending) return;

    const ads = await loadAds(pending.title);
    const oldAd = ads.find((ad) => String(ad.id) === String(pending.oldAdId));
    const newAd = ads.find(
      (ad) =>
        Number(ad.id) > Number(pending.oldAdId) &&
        (typeof ad.title !== "string" || normalize(ad.title) === normalize(pending.title))
    );
    if (!newAd) return;
    if (!oldAd) {
      ekpClearPending();
      return;
    }

    const label = pending.title ? `„${pending.title}“` : "Deine Anzeige";
    ekpBanner({
      id: "ekp-delete-banner",
      title: "Neu eingestellt!",
      text: `${label} ist als neue Anzeige online. Damit sie nicht doppelt erscheint, solltest du die alte Anzeige löschen.`,
      actions: [
        ekpButton("Alte Anzeige löschen", (event) => deleteOldAd(pending.oldAdId, event.currentTarget)),
        ekpButton("Behalten", () => {
          ekpClearPending();
          document.getElementById("ekp-delete-banner")?.remove();
        }, "secondary"),
      ],
    });
  }

  async function loadAds(keyword) {
    const url = new URL("/m-meine-anzeigen-verwalten.json", location.origin);
    url.searchParams.set("pageNum", "1");
    url.searchParams.set("pageSize", "100");
    if (keyword) url.searchParams.set("keyword", keyword);
    const response = await fetch(url, { credentials: "same-origin" });
    if (!response.ok) throw new Error(`Loading ads failed: HTTP ${response.status}`);
    return (await response.json()).ads ?? [];
  }

  async function deleteOldAd(oldAdId, button) {
    button.disabled = true;
    button.textContent = "Wird gelöscht …";
    try {
      const profile = await fetch("/m-mein-profil.json", { credentials: "same-origin" }).then((r) => r.json());
      const url = new URL("/m-anzeigen-loeschen.json", location.origin);
      url.searchParams.set("ids", oldAdId);
      const response = await fetch(url, {
        method: "POST",
        credentials: "same-origin",
        headers: { "X-CSRF-TOKEN": profile.csrfToken },
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || result.error?.map(String).includes(String(oldAdId))) {
        throw new Error(`Deleting ad failed: HTTP ${response.status}`);
      }
      ekpClearPending();
      ekpBanner({ id: "ekp-delete-banner", title: "Erledigt", text: "Die alte Anzeige wurde gelöscht." });
      setTimeout(() => location.reload(), 1500);
    } catch (error) {
      console.warn("[Kleinanzeigen Pusher]", error);
      ekpBanner({
        id: "ekp-delete-banner",
        title: "Löschen hat nicht geklappt",
        text: "Bitte lösche die alte Anzeige manuell über „Löschen“ in der Liste.",
      });
    }
  }

  function normalize(text) {
    return String(text ?? "").trim().toLowerCase();
  }
})();
