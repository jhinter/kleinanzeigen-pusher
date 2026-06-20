// Runs in the page's MAIN world at document_start (see manifest.json) so we can
// patch the real window.fetch before kleinanzeigen's React app captures it.
//
// Re-posting trick: the "Anzeige speichern" button fires
//   POST /_actions/postListingWeb.submitListing/   (multipart/form-data)
// with an `adId` field. With `adId` present the backend UPDATES the existing ad.
// Removing `adId` makes it create a brand-new listing (which bumps it to the top
// for free). We only do this when the recreate flag is in the URL.

(function () {
  const RECREATE_FLAG = "ekz-recreate=true";
  const SUBMIT_PATH = "submitListing";

  if (!location.href.includes(RECREATE_FLAG)) {
    return;
  }

  patchFetch();
  relabelSubmitButton();

  function patchFetch() {
    const origFetch = window.fetch;

    window.fetch = function (input, init) {
      try {
        const url =
          typeof input === "string"
            ? input
            : (input && input.url) || "";

        if (url.includes(SUBMIT_PATH)) {
          const body = init && init.body;

          if (body instanceof FormData) {
            if (body.has("adId")) {
              body.delete("adId");
              console.log("[ekz] removed adId from submitListing -> creating NEW ad");
            } else {
              console.warn("[ekz] submitListing had no adId field (form layout changed?)");
            }
          } else {
            // Body wasn't a FormData we can edit (e.g. Request object or stream).
            // Log loudly so we notice if kleinanzeigen changes the request shape.
            console.warn(
              "[ekz] submitListing body is not editable FormData:",
              body && body.constructor && body.constructor.name
            );
          }
        }
      } catch (err) {
        console.error("[ekz] fetch interceptor error", err);
      }

      return origFetch.apply(this, arguments);
    };

    console.log("[ekz] recreate mode active - fetch interceptor installed");
  }

  // Cosmetic: make it obvious the button now re-posts instead of updates.
  function relabelSubmitButton() {
    const apply = () => {
      const btn = [...document.querySelectorAll("button")].find(
        (b) => (b.innerText || "").trim() === "Anzeige speichern"
      );
      if (btn && !btn.dataset.ekzLabeled) {
        btn.dataset.ekzLabeled = "1";
        btn.innerText = "Neu einstellen";
      }
    };

    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", apply);
    } else {
      apply();
    }
    // The button renders asynchronously, so keep trying as the app mounts.
    const observer = new MutationObserver(apply);
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
})();
