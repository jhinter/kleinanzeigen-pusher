const EKP_RECREATE_PARAM = "ekp";
const EKP_RECREATE_VALUE = "recreate";
const EKP_PENDING_KEY = "ekp:pending-recreate";
const EKP_PENDING_TTL_MS = 6 * 60 * 60 * 1000;

function ekpRecreateUrl(adId) {
  const url = new URL("/p-anzeige-bearbeiten.html", location.origin);
  url.searchParams.set("adId", adId);
  url.searchParams.set(EKP_RECREATE_PARAM, EKP_RECREATE_VALUE);
  return url.toString();
}

// localStorage instead of sessionStorage: the user may open the my-ads page in another tab.
function ekpReadPending() {
  try {
    const pending = JSON.parse(localStorage.getItem(EKP_PENDING_KEY));
    if (pending && Date.now() - pending.at < EKP_PENDING_TTL_MS) return pending;
  } catch {}
  ekpClearPending();
  return null;
}

function ekpWritePending(pending) {
  try {
    localStorage.setItem(EKP_PENDING_KEY, JSON.stringify({ ...pending, at: Date.now() }));
  } catch {}
}

function ekpClearPending() {
  try {
    localStorage.removeItem(EKP_PENDING_KEY);
  } catch {}
}

function ekpEl(tag, props = {}, children = []) {
  const node = Object.assign(document.createElement(tag), props);
  for (const child of [].concat(children)) {
    node.append(child);
  }
  return node;
}

function ekpBanner({ id, title, text, actions = [] }) {
  document.getElementById(id)?.remove();
  const banner = ekpEl("div", { id, className: "ekp-banner", role: "status" }, [
    ekpEl("img", { className: "ekp-banner__logo", src: chrome.runtime.getURL("images/logo-48.png"), alt: "" }),
    ekpEl("div", { className: "ekp-banner__body" }, [
      ekpEl("strong", { textContent: title }),
      ekpEl("p", { className: "ekp-banner__text", textContent: text }),
      ekpEl("div", { className: "ekp-banner__actions" }, actions),
    ]),
    ekpEl("button", {
      type: "button",
      className: "ekp-banner__close",
      ariaLabel: "Schließen",
      textContent: "×",
      onclick: () => banner.remove(),
    }),
  ]);
  document.body.append(banner);
  return banner;
}

function ekpButton(label, onclick, variant = "primary") {
  return ekpEl("button", { type: "button", className: `ekp-btn ekp-btn--${variant}`, textContent: label, onclick });
}
