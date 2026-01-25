const btn = document.getElementById("themeToggle");
const year = document.getElementById("year");

if (year) year.textContent = new Date().getFullYear();

const saved = localStorage.getItem("theme");
if (saved === "light") document.documentElement.classList.add("light");

if (btn) {
  btn.addEventListener("click", () => {
    document.documentElement.classList.toggle("light");
    localStorage.setItem(
      "theme",
      document.documentElement.classList.contains("light") ? "light" : "dark"
    );
  });
}
