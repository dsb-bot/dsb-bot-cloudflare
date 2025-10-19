function preloadImages(urls) {
  urls.forEach(url => {
    const img = new Image();
    img.src = url;
  });
}

preloadImages([
  "../assets/images/space_background.jpg",
  "../assets/images/brown_background.jpg",
  "../assets/images/pink_background.jpg",
  "../assets/images/green_background.jpg",
  "../assets/images/purple_background.jpg",
  "../assets/images/red_background.jpg",
  "../assets/images/cyan_background.jpg",
  "../assets/images/gold_background.jpg",
  "../assets/images/silver_background.jpg"
]);


fetch("../assets/html/footer.html")
  .then(response => response.text())
  .then(data => {
    document.getElementById("footer").innerHTML = data;
  });

fetch("../assets/html/navbar.html")
  .then(response => response.text())
  .then(data => {
    document.getElementById("navbar").innerHTML = data;

    // Dropdown-Logik erst nach dem Laden der Navbar ausführen
    const dropdowns = document.querySelectorAll(".dropdown");

    dropdowns.forEach((dropdown) => {
      const button = dropdown.querySelector(".dropdown-button");
      button.addEventListener("click", () => {
        dropdown.classList.toggle("active");
      });

      // Optional: Schließe das Dropdown, wenn außerhalb geklickt wird
      document.addEventListener("click", (event) => {
        if (!dropdown.contains(event.target)) {
          dropdown.classList.remove("active");
        }
      });
    });
  });

document.addEventListener("DOMContentLoaded", () => {
  const navbar = document.querySelector(".navbar");

  window.addEventListener("scroll", () => {
    if (window.scrollY > 0) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
});