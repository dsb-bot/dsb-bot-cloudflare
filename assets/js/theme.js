// theme.js

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
}

// Beispiel: Theme-Wechsel-Buttons
document.querySelectorAll('.theme-button').forEach(button => {
  button.addEventListener('click', () => {
    const theme = button.dataset.theme;
    setTheme(theme);
  });
});
