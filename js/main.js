/*For adding new input rows to the submit form*/
let nameCount = 4;
let tbl_wrapper;

document.querySelectorAll(".addSwimmerButton").forEach(function (button) {
  button.addEventListener("click", function () {
    const containerId = button.dataset.targetContainer;
    addSwimmerBox(containerId);
  });
});
document.addEventListener("DOMContentLoaded", function () {
  const containerId = "swimmer-container-ASA"; // replace with your actual container ID
  for (let i = 0; i < 4; i++) {
    addSwimmerBox(containerId);
  }
});

function addSwimmerBox(containerId) {
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

  deleteButton.addEventListener("click", function () {
    wrapper.remove();
    reindexSwimmerBoxes(containerId);
  });

  wrapper.append(header, name, club, asa_num, deleteButton, gender);

  container.appendChild(wrapper);
  setupAutocomplete(input_name);
  clubFilter(club);
  updateDeleteButtons();
  return wrapper;
}
function collapseSwimmerBoxes(wrapper) {
  const name = wrapper.querySelector("input[name^='name']").value.trim();
  const asa = wrapper.querySelector("input[name^='asa-number']").value.trim();
  const club = wrapper.querySelector("input[name^='club']").value.trim();

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

  editBtn.addEventListener("click", () => {
    summary.remove();
    editBtn.remove();
    wrapper
      .querySelectorAll(".form-input")
      .forEach((div) => (div.style.display = ""));
  });

  wrapper.insertBefore(editBtn, wrapper.querySelector(".delete-button"));
}

function reindexSwimmerBoxes(containerId) {
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

  // Update global count if needed
  nameCount = swimmerBoxes.length;

  updateDeleteButtons();
}
function updateDeleteButtons() {
  const boxes = document.querySelectorAll(".individual-input"); // adjust selector as needed
  const deleteButtons = document.querySelectorAll(".delete-button");

  if (boxes.length < 5) {
    deleteButtons.forEach((btn) => (btn.style.display = "none"));
  } else {
    deleteButtons.forEach((btn) => (btn.style.display = "inline-block"));
  }
}

/*Submit button function on the input form*/
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
    nameCount = form.querySelectorAll(".individual-input").length;
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
            for (assignment in swimmer_list2) {
              tbl_create(swimmer_list2[0]);
            } // Proceed only if there's no error
          } else {
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

document
  .getElementById("clearSwimmerButton-asa")
  .addEventListener("click", () => {
    const container = document.getElementById("swimmer-container-ASA");
    container.innerHTML = ""; // Clear all swimmer boxes
    for (let i = 0; i < 4; i++) {
      addSwimmerBox("swimmer-container-ASA"); // Re-add 4 empty boxes
    }
    updateDeleteButtons(); // Update delete button visibility
    const spinner = document.getElementById("spinner");
    spinner.style.display = "none"; // Hide the spinner if it was visible
  });
/*Loading Spinner*/
async function runPython(swimmer_array, course, poolLength, targetGender) {
  const sentData = {
    array: swimmer_array,
    courseType: course,
    pool_length: poolLength,
    target_gender: targetGender,
  };
  const response = await fetch("http://127.0.0.1:5000/run-function/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sentData),
  });

  if (response.ok) {
    const data = await response.json();
    return data.result;
  } else {
    console.error("Error:", response.statusText);
    return null;
  }
}
function tbl_create(swimmer_list) {
  if (typeof tbl_wrapper !== "undefined") {
    tbl_wrapper.remove();
  }
  const tbl_section = document.getElementById("results");
  const tbl = document.createElement("table");
  tbl.className = "results-table";

  /*Make the Header*/
  const tbl_header = document.createElement("thead");
  ["Stroke", "Name", "Time"].forEach((text) => {
    const head = document.createElement("th");
    head.textContent = text;
    tbl_header.appendChild(head);
  });
  tbl.appendChild(tbl_header);

  /*Add table contents*/
  for (let n = 0; n < swimmer_list.length - 1; n++) {
    const tr = document.createElement("tr");
    swimmer_list[n].forEach((text) => {
      const td = document.createElement("td");
      td.textContent = text;
      tr.appendChild(td);
    });
    tbl.appendChild(tr);
  }
  const tr = document.createElement("tr");
  last_row = swimmer_list[swimmer_list.length - 1];
  const td1 = document.createElement("td");
  td1.colSpan = "2";
  td1.textContent = last_row[0];
  const td2 = document.createElement("td");
  td2.textContent = last_row[1];
  tr.appendChild(td1);
  tr.appendChild(td2);
  tbl.appendChild(tr);

  tbl_wrapper = document.createElement("div");
  tbl_wrapper.className = "table-container";
  tbl_wrapper.appendChild(tbl);
  tbl_section.appendChild(tbl_wrapper);
  tbl_wrapper.scrollIntoView({ behavior: "smooth" });
}

/*Tabs function*/
function openSite(evt, siteName) {
  var j, tabcontent, tablinks;

  tabcontent = document.getElementsByClassName("tabcontent");
  for (j = 0; j < tabcontent.length; j++) {
    tabcontent[j].style.display = "none";
  }

  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  document.getElementById(siteName).style.display = "block";
  evt.currentTarget.className += "active";
}

function clubFilter(wrapper) {
  const input = wrapper.querySelector("input[type='text']");
  const resultBox = wrapper.querySelector(".autocomplete-club");
  input.addEventListener("input", async () => {
    resultBox.classList.add("open-autocomplete");
    const query = input.value.trim();
    if (!query) return (resultBox.innerHTML = "");

    const res = await fetch(
      "http://localhost:5000/search-clubs?q=" + encodeURIComponent(query)
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
  });
}
clubSearchInput = document.getElementById("club-input-wrapper0");
clubFilter(clubSearchInput);

function setupAutocomplete(searchInput) {
  const idSuffix = searchInput.id.match(/\d+$/)?.[0];
  if (!idSuffix) return;

  const resultBox = document.getElementById(`autocomplete-list${idSuffix}`);
  const asaInput = document.getElementById(`asa-number${idSuffix}`);
  const clubInput = document.getElementById(`club${idSuffix}`);
  const genderInput = document.getElementById(`gender${idSuffix}-value`);

  searchInput.addEventListener("input", async () => {
    resultBox.classList.add("open-autocomplete");
    const query = searchInput.value.trim();
    const club = clubInput.value.trim();
    if (!query) return (resultBox.innerHTML = "");

    const res = await fetch(
      "http://localhost:5000/search?" +
        new URLSearchParams({ q: query, club: club })
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
  });
}
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

document.getElementById("apply-filters").addEventListener("click", async () => {
  const club = document.getElementById("filter-club").value.trim();
  const gender = document.getElementById("filter-gender").value;
  const minAge = document.getElementById("filter-age-min").value || 0;
  const maxAge = document.getElementById("filter-age-max").value || 100;

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
  while (new_boxes.length < 4) {
    wrapper = addSwimmerBox("swimmer-container-ASA");
    new_boxes = document.querySelectorAll(".individual-input");
  }
});
