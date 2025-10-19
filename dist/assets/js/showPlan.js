function loadPlan(card) {
  const url = card.dataset.url;
  fetch(url)
    .then(response => response.text())
    .then(html => {
      const popup = document.getElementById("iframe-popup");
      const iframe = document.getElementById("plan-frame");

      // HTML in das iframe setzen
      iframe.srcdoc = html;

      // Popup anzeigen
      popup.style.display = "flex";
    })
    .catch(err => console.error("Fehler beim Laden:", err));
}

// Schließen-Button
document.getElementById("close-popup").addEventListener("click", () => {
  const popup = document.getElementById("iframe-popup");
  popup.style.display = "none";
});