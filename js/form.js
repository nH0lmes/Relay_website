import { setupAutocomplete,clubFilter } from "./autocompletes.js";
import { runPython } from "./pythonCaller.js";
import { tbl_create } from "./table.js";
export function addSwimmerBox(containerId) {
  let container = document.getElementById(containerId);
  let nameCount = container.querySelectorAll(".individual-input").length + 1;

  const wrapper = document.createElement("div");
  wrapper.className = "individual-input";

  const header = document.createElement("h2");
  header.textContent = `Swimmer ${nameCount}`;

  const asa_num = document.createElement("div");
  asa_num.className = "form-input";

  const label_asa = document.createElement("label");
  label_asa.setAttribute("for", `asa-number${nameCount}`);
  label_asa.textContent = "ASA number";

  const input_asa = document.createElement("input");
  input_asa.type = "text";
  input_asa.inputMode = "numeric";
  input_asa.placeholder = "Enter ASA Number";
  input_asa.id = `asa-number${nameCount}`;
  input_asa.name = `asa-number${nameCount}`;

  asa_num.append(label_asa);
  asa_num.append(input_asa);

  const name = document.createElement("div");
  name.className = "form-input";

  const label_name = document.createElement("label");
  label_name.setAttribute("for", `name${nameCount}`);
  label_name.textContent = "Name";

  const input_name = document.createElement("input");
  input_name.type = "text";
  input_name.placeholder = "Enter Full Name";
  input_name.id = `name${nameCount}`;
  input_name.name = `name${nameCount}`;
  input_name.classList.add("search-input");

  const autocomplete = document.createElement("div");
  autocomplete.id = `autocomplete-list${nameCount}`;
  autocomplete.className = "autocomplete-items";

  const gender = document.createElement("div");
  gender.id = `gender${nameCount}`;
  const genderValue = document.createElement("div");
  genderValue.id = `gender${nameCount}-value`;
  gender.append(genderValue);
  name.append(label_name, input_name, autocomplete);

  const club = document.createElement("div");
  club.className = "form-input";
  club.id = `club-input-wrapper${nameCount}`;

  const label_club = document.createElement("label");
  label_club.setAttribute("for", `club${nameCount}`);
  label_club.textContent = "Club";

  const input_club = document.createElement("input");
  input_club.type = "text";
  input_club.placeholder = "Enter Club";
  input_club.id = `club${nameCount}`;
  input_club.name = `club${nameCount}`;

  const autocomplete_club = document.createElement("div");
  autocomplete_club.id = `autocomplete-club${nameCount}`;
  autocomplete_club.className = "autocomplete-club";

  club.append(label_club, input_club, autocomplete_club);

  const deleteButton = document.createElement("i");
  deleteButton.className = "delete-button fa-solid fa-trash";
  deleteButton.title = "Delete"
  deleteButton.addEventListener("click", function () {
    wrapper.remove();
    reindexSwimmerBoxes(containerId);
  });

  const confirmButton = document.createElement("i");
  confirmButton.classList = "confirm-btn fa-regular fa-square-check";
  confirmButton.style.display = "none";
  confirmButton.title = "Confirm"
  confirmButton.addEventListener("click", function () {
    collapseSwimmerBoxes(wrapper);
    confirmButton.style.display = "none";
  });


  wrapper.append(header, name, club, asa_num, deleteButton, gender, confirmButton);

  container.appendChild(wrapper);
  setupAutocomplete(input_name);
  clubFilter(club);
  updateDeleteButtons();
  return wrapper;
}

export function collapseSwimmerBoxes(wrapper) {
  const name = wrapper.querySelector("input[name^='name']").value.trim();
  const asa = wrapper.querySelector("input[name^='asa-number']").value.trim();
  const club = wrapper.querySelector("input[name^='club']").value.trim();
  const confirmButton = wrapper.querySelector(".confirm-btn");
  wrapper
    .querySelectorAll(".form-input")
    .forEach((div) => (div.style.display = "none"));

  const summary = document.createElement("div");
  summary.className = "collapsed-summary";
  const line1 = document.createElement("div");
  line1.textContent = `${name} - ${asa}`;

  const line2 = document.createElement("div");
  line2.textContent = club;
  summary.append(line1, line2);

  wrapper.insertBefore(summary, wrapper.querySelector(".delete-button"));

  const editBtn = document.createElement("i");
  editBtn.className = "fa-solid fa-pen-to-square edit-button";
  editBtn.title = "Edit"

  editBtn.addEventListener("click", () => {
    summary.remove();
    editBtn.remove();
    confirmButton.style.display = "inline-block";
    wrapper
      .querySelectorAll(".form-input")
      .forEach((div) => (div.style.display = ""));
  });

  wrapper.insertBefore(editBtn, wrapper.querySelector(".delete-button"));
}

export function reindexSwimmerBoxes(containerId) {
  const container = document.getElementById(containerId);
  const swimmerBoxes = container.querySelectorAll(".individual-input");

  swimmerBoxes.forEach((box, index) => {
    const newIndex = index + 1;
    box.dataset.index = newIndex;

    // Header
    const header = box.querySelector("h2");
    if (header) header.textContent = `Swimmer ${newIndex}`;

    // ASA Number
    const asaInput = box.querySelector("input[id^='asa-number']");
    const asaLabel = box.querySelector("label[for^='asa-number']");
    if (asaInput) {
      asaInput.id = `asa-number${newIndex}`;
      asaInput.name = `asa-number${newIndex}`;
    }
    if (asaLabel) {
      asaLabel.setAttribute("for", `asa-number${newIndex}`);
    }

    // Name
    const nameInput = box.querySelector("input[id^='name']");
    const nameLabel = box.querySelector("label[for^='name']");
    const autocomplete = box.querySelector("div[id^='autocomplete-list']");
    if (nameInput) {
      nameInput.id = `name${newIndex}`;
      nameInput.name = `name${newIndex}`;
    }
    if (nameLabel) {
      nameLabel.setAttribute("for", `name${newIndex}`);
    }
    if (autocomplete) {
      autocomplete.id = `autocomplete-list${newIndex}`;
    }

    // Club
    const clubInput = box.querySelector("input[id^='club']");
    const clubLabel = box.querySelector("label[for^='club']");
    const autocompleteClub = box.querySelector("div[id^='autocomplete-club']");
    const clubWrapper = box.querySelector("div[id^='club-input-wrapper']");
    if (clubInput) {
      clubInput.id = `club${newIndex}`;
      clubInput.name = `club${newIndex}`;
    }
    if (clubLabel) {
      clubLabel.setAttribute("for", `club${newIndex}`);
    }
    if (autocompleteClub) {
      autocompleteClub.id = `autocomplete-club${newIndex}`;
    }
    if (clubWrapper) {
      clubWrapper.id = `club-input-wrapper${newIndex}`;
    }

    // Gender
    const gender = box.querySelector("div[id^='gender']");
    const genderValue = box.querySelector("div[id^='gender'][id$='-value']");
    if (gender) gender.id = `gender${newIndex}`;
    if (genderValue) genderValue.id = `gender${newIndex}-value`;
  });
  updateDeleteButtons();
}

export function updateDeleteButtons() {
  const boxes = document.querySelectorAll(".individual-input"); // adjust selector as needed
  const deleteButtons = document.querySelectorAll(".delete-button");

  if (boxes.length < 5) {
    deleteButtons.forEach((btn) => (btn.style.display = "none"));
  } else {
    deleteButtons.forEach((btn) => (btn.style.display = "inline-block"));
  }
}

export function submitButton(){
  document.querySelectorAll(".form-container").forEach((form) => {
    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      const spinner = document.getElementById("spinner");
      spinner.style.display = "block";
      spinner.scrollIntoView({ behavior: "smooth", block: "center" });

      let course = form.querySelector('input[name="course-type"]:checked');
      let poolLength = form.querySelector("input[name=pool-length]:checked");
      let targetGender = form.querySelector("input[name=gender]:checked");
      let male = 0;
      let female = 0;

      let warningBox = document.getElementById("team-warning");
      warningBox.classList.add("hidden");
      let nameCount = form.querySelectorAll(".individual-input").length;
      if (course != null && poolLength != null && targetGender != null) {
        let swimmer_list = [];
        let male = 0;
        let female = 0;
        for (let i = 1; i <= nameCount; i++) {
          const swimmer = form.querySelector(`#asa-number${i}`).value;
          const gender = form.querySelector(`#gender${i}`).textContent;
          if (gender == "Open/Male") {
            male += 1;
          } else if (gender == "Female") {
            female += 1;
          }
          console.log([swimmer, gender]);
          console.log(female);
          swimmer_list.push([swimmer, gender]);
        }

        if (swimmerChecker(male, female, warningBox, targetGender)) {
          try {
            let swimmer_list2 = await runPython(
              swimmer_list,
              course.value,
              poolLength.value,
              targetGender.value
            );
            if (swimmer_list2) {
              console.log("Swimmer List:", swimmer_list2);
              document.getElementById("table-row-top").innerHTML = "";
              document.getElementById("table-row-mid").innerHTML = "";
              document.getElementById("table-row-bottom").innerHTML = "";
              const separator = document.createElement("div");
              separator.classList.add("text_seperator");
              document.getElementById("Input").append(separator);
              swimmer_list2.forEach((swimmers, index) => {
                tbl_create(swimmers, index);
              });
            }
            else {
              console.error("Failed to create the table due to an error.");
            }
          } catch (error) {
            console.error("error occured:", error);
          } finally {
            spinner.style.display = "none";
          }
        } else {
          spinner.style.display = "none";
        }
      } else {
        spinner.style.display = "none";
        radioChecker(warningBox, course, poolLength, targetGender);
      }
    });
  });
}
function swimmerChecker(male, female, warningBox, targetGender) {
  const genderRules = [
    { type: "Mixed", required: 2, count: male, label: "males" },
    { type: "Open/Male", required: 4, count: male, label: "males" },
    { type: "Mixed", required: 2, count: female, label: "females" },
    { type: "Female", required: 4, count: female, label: "females" },
  ];

  const match = genderRules.find(
    (rule) => targetGender.value === rule.type && rule.count < rule.required
  );

  if (match) {
    const diff = match.required - match.count;
    const label = diff === 1 ? match.label.slice(0, -1) : match.label;

    warningBox.classList.remove("hidden");
    warningBox.innerHTML = `<div>WARNING: Not enough ${match.label} selected</div
                            <div>Add ${diff} more ${label} or switch category</div>`;
    console.log(`Not enough ${match.label} selected`);
    return false;
  } else {
    warningBox.classList.add("hidden");
    warningBox.innerHTML = "";
    return true;
  }
}

function radioChecker(warningBox, course, poolLength, genderTarget) {
  const checks = [
    { value: course, message: "No course type selected" },
    { value: poolLength, message: "No pool length selected" },
    { value: genderTarget, message: "No gender selected" },
  ];

  const missing = checks.find((check) => check.value == null);

  if (missing) {
    warningBox.classList.remove("hidden");
    warningBox.innerHTML = `<div>WARNING: ${missing.message}</div>`;
  }
}

export function initiateClearSwimmers() {
    document
    .getElementById("clearSwimmerButton-asa")
    .addEventListener("click", () => {
      const confirmClear = window.confirm(
        "Are you sure you want to clear all swimmers? This action cannot be undone.");
        if (!confirmClear) {
            return;
        }
  
        const container = document.getElementById("swimmer-container-ASA");
        container.innerHTML = ""; // Clear all swimmer boxes
        for (let i = 0; i < 4; i++) {
        addSwimmerBox("swimmer-container-ASA"); // Re-add 4 empty boxes
        }
        updateDeleteButtons(); // Update delete button visibility
        const spinner = document.getElementById("spinner");
        spinner.style.display = "none"; // Hide the spinner if it was visible
    });
}

export function initiateFilterButton(){
  document.getElementById("apply-filters").addEventListener("click", async () => {
    const club = document.getElementById("filter-club").value.trim();
    const gender = document.querySelector('input[name = "gender-filter"]:checked').value.trim()
    const minAge = document.getElementById("range-min").value || 0;
    const maxAge = document.getElementById("range-max").value || 100;

    const params = new URLSearchParams({
        club,
        gender,
        min_age: minAge,
        max_age: maxAge,
    });
    console.log(params.toString());
    const res = await fetch(
        `http://localhost:5000/filter-swimmers?${params.toString()}`
    );
    const swimmers = await res.json();

    const existingBoxes = document.querySelectorAll(".individual-input");
    const container = document.getElementById("swimmer-container-ASA");
    container.innerHTML = "";
    swimmers.forEach(async (swimmer, index) => {
        let wrapper;
        const num = index + 1;
        wrapper = addSwimmerBox("swimmer-container-ASA");
        const nameInput = wrapper.querySelector("input[id^='name']");
        const asaInput = wrapper.querySelector("input[id^='asa-number']");
        const clubInput = wrapper.querySelector("input[id^='club']");
        const genderInput = wrapper.querySelector(`div[id='gender${num}-value']`);

        if (nameInput)
        nameInput.value = `${swimmer.first_name} ${swimmer.last_name}`;
        if (asaInput) asaInput.value = swimmer.asa_number;
        if (clubInput) clubInput.value = swimmer.club;
        if (genderInput) genderInput.textContent = swimmer.gender;
        if (genderInput) console.log(genderInput.textContent);
        collapseSwimmerBoxes(wrapper);

        await setupAutocomplete(wrapper);
    });
    let new_boxes = document.querySelectorAll(".individual-input");
    new_boxes[new_boxes.length - 1].scrollIntoView({ behavior: "smooth" });
    while (new_boxes.length < 4) {
        wrapper = addSwimmerBox("swimmer-container-ASA");
        new_boxes = document.querySelectorAll(".individual-input");
    }
  });
}

export function initiateAddSwimmers(){
    document.querySelectorAll(".addSwimmerButton").forEach(function (button) {
    button.addEventListener("click", function () {
        const containerId = button.dataset.targetContainer;
        let container = document.getElementById(containerId);
        addSwimmerBox(containerId);
        setTimeout(() => {
          const inputs = container.querySelectorAll(".individual-input");
          const lastInput = inputs[inputs.length - 1];
          if (lastInput) {
            lastInput.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 0);

    });
    });
    const containerId = "swimmer-container-ASA";
    for (let i = 0; i < 4; i++) {
        addSwimmerBox(containerId);
    }
}


