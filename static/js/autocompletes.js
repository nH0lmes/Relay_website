import { collapseSwimmerBoxes } from "./form.js";
import { API_BASE } from "./config.js";
export function initiateAutocompletes() {
  document.querySelectorAll(".search-input").forEach(setupAutocomplete);
  document.addEventListener("click", function (event) {
    document.querySelectorAll(".open-autocomplete").forEach((box) => {
      const input = box.previousElementSibling; // assumes input precedes box
      if (!box.contains(event.target) && !input.contains(event.target)) {
        box.innerHTML = "";
        box.classList.remove("open-autocomplete");
      }
    });
  });
}
function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}
export function clubFilter(wrapper) {
  const input = wrapper.querySelector("input[type='text']");
  const resultBox = wrapper.querySelector(".autocomplete-club");
  input.addEventListener("input", debounce(async() => {
    resultBox.classList.add("open-autocomplete");
    const query = input.value.trim();
    if (!query) return (resultBox.innerHTML = "");

    const res = await fetch(
      `${API_BASE}/search-clubs?q=` + encodeURIComponent(query)
    );
    const suggestions = await res.json();

    resultBox.innerHTML = "";
    console.log(suggestions);
    suggestions.forEach((club) => {
      const item = document.createElement("div");
      item.textContent = club.club;
      item.addEventListener("click", () => {
        input.value = club.club;
        resultBox.classList.remove("open-autocomplete");
        resultBox.innerHTML = "";
      });
      resultBox.appendChild(item);
    });
  }, 100));
}

export function setupAutocomplete(searchInput) {
  const idSuffix = searchInput.id.match(/\d+$/)?.[0];
  if (!idSuffix) return;

  const resultBox = document.getElementById(`autocomplete-list${idSuffix}`);
  const asaInput = document.getElementById(`asa-number${idSuffix}`);
  const clubInput = document.getElementById(`club${idSuffix}`);
  const genderInput = document.getElementById(`gender${idSuffix}-value`);

  searchInput.addEventListener("input", debounce(async () => {
    resultBox.classList.add("open-autocomplete");
    const query = searchInput.value.trim();
    const club = clubInput.value.trim();
    if (!query) return (resultBox.innerHTML = "");

    const res = await fetch(
      `${API_BASE}/search?` + new URLSearchParams({ q: query, club: club })
    );
    const suggestions = await res.json();

    resultBox.innerHTML = "";
    suggestions.forEach((swimmer) => {
      const item = document.createElement("div");
      item.textContent = `${swimmer.first_name} ${swimmer.last_name} - ${swimmer.asa_number} - ${swimmer.club}`;
      item.addEventListener("click", () => {
        searchInput.value = `${swimmer.first_name} ${swimmer.last_name}`;
        asaInput.value = swimmer.asa_number;
        clubInput.value = swimmer.club;
        genderInput.textContent = `${swimmer.gender}`;
        resultBox.innerHTML = "";
        resultBox.classList.remove("open-autocomplete");
        collapseSwimmerBoxes(searchInput.closest(".individual-input"));
      });
      resultBox.appendChild(item);
    });
    if (resultBox.children.length == 0) {
      resultBox.style.display = "none";
    } else {
      resultBox.style.display = "block";
    }
  },100));
}
