// Adds a "Code" button to the dashboard navbar. While a page that has a
// page-code shortcode is showing, the button opens a window with its code.
document.addEventListener("DOMContentLoaded", () => {
  const byPage = {};
  for (const el of document.querySelectorAll("script.page-code-data")) {
    const d = JSON.parse(el.textContent);
    (byPage[d.page] = byPage[d.page] || []).push(...d.blocks);
  }

  // Map each page's title (as written in the .qmd) to its navbar link.
  const links = [...document.querySelectorAll(".navbar a.nav-link[data-bs-toggle='tab']")];
  const linkFor = (title) => links.find((a) => a.textContent.trim() === title);

  // Outside the collapsible menu, so the button stays visible on narrow screens.
  const nav = document.querySelector(".navbar .navbar-container") || document.querySelector(".navbar .container-fluid");
  if (!nav) return;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "btn page-code-button";
  button.innerHTML = '<i class="bi bi-code-slash"></i> Code';
  button.title = "Show the code for this page";
  nav.appendChild(button);

  const modal = document.createElement("div");
  modal.className = "modal fade page-code-modal";
  modal.tabIndex = -1;
  modal.innerHTML = `
    <div class="modal-dialog modal-xl modal-dialog-scrollable">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title"></h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body"></div>
      </div>
    </div>`;
  document.body.appendChild(modal);
  const bsModal = new bootstrap.Modal(modal);

  let current = null;
  const update = () => {
    const active = links.find((a) => a.classList.contains("active"));
    const title = active ? active.textContent.trim() : null;
    current = title && byPage[title] ? title : null;
    button.hidden = !current;
  };
  for (const a of links) a.addEventListener("shown.bs.tab", update);
  update();

  button.addEventListener("click", () => {
    if (!current) return;
    const blocks = byPage[current];
    modal.querySelector(".modal-title").textContent = `${current}: code`;
    modal.querySelector(".modal-body").innerHTML = blocks
      .map((b) => (blocks.length > 1 ? `<p class="page-code-label">${b.label}</p>` : "") + b.html)
      .join("");
    bsModal.show();
  });

  // Pages whose title has no matching navbar link would never show a button.
  for (const title of Object.keys(byPage)) {
    if (!linkFor(title)) console.warn(`page-code: no page titled "${title}"`);
  }
});
