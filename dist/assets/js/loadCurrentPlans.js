document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("currentPlans-container");
  const apiUrl = "/plans"; // Worker-Route
  const today = new Date().toISOString().split("T")[0];

  const listDiv = document.createElement("div");
  listDiv.className = "list";
  container.appendChild(listDiv);

  listDiv.innerHTML = `
    <div class="card">
      <h2>Pläne Laden...</h2>
      <p>Eigentlich sollte das nicht so lange dauern!</p>
    </div>
  `;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error("Fehler beim Abrufen der Pläne");
    const files = await response.json();

    // Nur gültige HTML-Dateien mit Datum >= heute
    const futureFiles = files.filter(file => {
      if (!file.name.endsWith(".html")) return false;
      const datePart = file.name.replace(".html", "");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(datePart)) return false;
      return datePart >= today;
    });

    futureFiles.sort((a, b) => a.name.localeCompare(b.name));
    listDiv.innerHTML = "";

    for (const file of futureFiles) {
      const dateStr = file.name.replace(".html", "");
      const dateObj = new Date(dateStr + "T00:00:00");
      const downloadUrl = `/plans/${file.name}`; // Worker liefert HTML

      const htmlResponse = await fetch(downloadUrl);
      const htmlText = await htmlResponse.text();

      const match = htmlText.match(/Stand:\s*([\d.]+\s*\d{2}:\d{2})/);
      const standText = match ? match[1] : "Unbekannt";

      const weekdayNames = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
      const weekday = weekdayNames[dateObj.getDay()];
      const formattedDate = `${weekday}, ${dateObj.getDate().toString().padStart(2, "0")}.${(dateObj.getMonth() + 1).toString().padStart(2, "0")}.${dateObj.getFullYear()}`;

      const card = document.createElement("div");
      card.className = "card";
      card.dataset.url = downloadUrl;
      card.style.cursor = "pointer";
      card.onclick = () => loadPlan(card);

      card.innerHTML = `
        <h2>${formattedDate}</h2>
        <p>Stand: ${standText}</p>
      `;

      listDiv.appendChild(card);
    }

    if (futureFiles.length === 0) {
      listDiv.innerHTML = `
        <div class="card">
          <h2>Keine Pläne da!</h2>
          <p>Es wurden keine aktuellen oder zukünftigen Pläne gefunden.</p>
        </div>
      `;
    }
  } catch (error) {
    console.error("Fehler:", error);
    listDiv.innerHTML = `
      <div class="card">
        <h2>Ein Fehler ist aufgetreten.</h2>
        <p>${error}</p>
      </div>
    `;
  }
});