async function loadHistoricalPlans() {
  const container = document.getElementById("list-container");
  container.innerHTML = `
    <div class="card">
      <h2>Pläne Laden...</h2>
      <p>Bitte kurz Geduld!</p>
    </div>
  `;

  try {
    const response = await fetch("/plans"); // Worker-Route
    if (!response.ok) throw new Error("Fehler beim Abrufen der Pläne");
    const files = await response.json();

    const planFiles = files
      .filter(f => f.name.match(/^\d{4}-\d{2}-\d{2}\.html$/))
      .sort((a, b) => new Date(b.name.replace(".html", "")) - new Date(a.name.replace(".html", "")));

    const groupedByWeek = {};
    for (const file of planFiles) {
      const dateStr = file.name.replace(".html", "");
      const date = new Date(dateStr);
      const week = getWeekNumber(date);
      if (!groupedByWeek[week]) groupedByWeek[week] = [];
      groupedByWeek[week].push({ file, date });
    }

    container.innerHTML = "";
    let cardIndex = 0;

    Object.keys(groupedByWeek)
      .sort((a, b) => b - a)
      .forEach(week => {
        const listWrapper = document.createElement("div");
        listWrapper.className = "week-section";

        const heading = document.createElement("h2");
        heading.textContent = `Kalenderwoche ${week}`;
        listWrapper.appendChild(heading);

        const list = document.createElement("div");
        list.className = "list";

        groupedByWeek[week].forEach(({ file, date }) => {
          const options = { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" };
          const formattedDate = date.toLocaleDateString("de-DE", options);
          const [weekday, rest] = formattedDate.split(", ");
          const downloadUrl = `/plans/${file.name}`; // Worker liefert HTML

          const card = document.createElement("div");
          card.className = "card hidden";
          card.dataset.url = downloadUrl;
          card.onclick = () => loadPlan(card);
          card.style.cursor = "pointer";
          card.innerHTML = `
            <h2>${capitalizeFirstLetter(weekday)}, ${rest}</h2>
            <p>Datei: ${file.name}</p>
          `;

          list.appendChild(card);
          setTimeout(() => {
            card.classList.remove("hidden");
            card.classList.add("fade-in");
          }, cardIndex * 100);
          cardIndex++;
        });

        listWrapper.appendChild(list);
        container.appendChild(listWrapper);
      });
  } catch (error) {
    console.error(error);
    container.innerHTML = `
      <div class="card">
        <h2>Ein Fehler ist aufgetreten.</h2>
        <p>${error}</p>
      </div>
    `;
  }
}

// Hilfsfunktionen
function capitalizeFirstLetter(str) { return str.charAt(0).toUpperCase() + str.slice(1); }
function getWeekNumber(d) {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function loadPlan(element) {
  const url = element.dataset.url;
  window.open(url, "_blank"); // oder eigenes Modal, je nach Bedarf
}

document.addEventListener("DOMContentLoaded", loadHistoricalPlans);