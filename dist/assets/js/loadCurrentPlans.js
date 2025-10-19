document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("currentPlans-container");
  const apiUrl = "https://api.github.com/repos/dsb-bot/dsb-database/contents/plans";
  const today = new Date().toISOString().split("T")[0];

  // Neues <div class="list"> erzeugen
  const listDiv = document.createElement("div");
  listDiv.className = "list";
  container.appendChild(listDiv);

  // Lade-Platzhalter anzeigen
  listDiv.innerHTML = `
    <div class="card">
      <h2>Pläne Laden...</h2>
      <p>Eigentlich sollte das nicht so lange dauern, dass du das hier lesen kannst!</p>
    </div>
  `;

  try {
    // Hole die Dateiliste aus GitHub
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Fehler beim Abrufen der API");
    const files = await response.json();

    // Filtere nur gültige HTML-Dateien mit Datum >= heute
    const futureFiles = files.filter(file => {
      if (!file.name.endsWith(".html")) return false;
      const datePart = file.name.replace(".html", "");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return false; // Nur echte Datumsnamen
      return datePart >= today;
    });

    // Sortiere nach Datum aufsteigend
    futureFiles.sort((a, b) => a.name.localeCompare(b.name));

    // Alte Lade-Karte entfernen, bevor neue Karten eingefügt werden
    listDiv.innerHTML = "";

    for (const file of futureFiles) {
      const dateStr = file.name.replace(".html", ""); // z.B. 2025-10-20
      const dateObj = new Date(dateStr + "T00:00:00");
      const downloadUrl = file.download_url;

      // HTML laden, um den Stand auszulesen
      const htmlResponse = await fetch(downloadUrl);
      const htmlText = await htmlResponse.text();

      // „Stand:“ mit Regex extrahieren
      const match = htmlText.match(/Stand:\s*([\d.]+\s*\d{2}:\d{2})/);
      const standText = match ? match[1] : "Unbekannt";

      // Wochentag + formatiertes Datum
      const weekdayNames = [
        "Sonntag", "Montag", "Dienstag", "Mittwoch",
        "Donnerstag", "Freitag", "Samstag"
      ];
      const weekday = weekdayNames[dateObj.getDay()];
      const formattedDate = `${weekday}, ${dateObj.getDate().toString().padStart(2, "0")}.${(dateObj.getMonth() + 1).toString().padStart(2, "0")}.${dateObj.getFullYear()}`;

      // Karte erzeugen
      const card = document.createElement("div");
      card.className = "card";
      card.dataset.url = downloadUrl;
      card.style.cursor = "pointer";
      card.onclick = () => loadPlan(card);

      card.innerHTML = `
        <h2>${formattedDate}</h2>
        <p>Stand: ${standText}</p>
      `;

      // Karte in listDiv einfügen
      listDiv.appendChild(card);
    }

    if (futureFiles.length === 0) {
    listDiv.innerHTML = `
    <div class="card">
      <h2>Keine Pläne da!</h2>
      <p>Es wurden keine aktuellen oder zukünftigen Pläne gefunden. Wenn Du glaubst, dass das ein Fehler ist, melde das bitte <a href="/kontakt.html">hier<a/>.</p>
    </div>
  `;
    }
  } catch (error) {
    console.error("Fehler:", error);
    listDiv.innerHTML = `
    <div class="card">
      <h2>Ein Fehler ist aufgetreten.</h2>
      <p>${error}</p>
      <p>Bitte melde den Fehler <a href="/kontakt.html">hier<a/>.</p>
    </div>
  `;
  }
});
