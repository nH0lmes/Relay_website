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
  const deleteButtons = container.querySelectorAll(".btn-delete");

  swimmerBoxes.forEach((box, index) => {
    const newIndex = index + 1;
    box.dataset.index = newIndex;

    const header = box.querySelector("h2");
    header.textContent = `Swimmer ${newIndex}`;

    const asaInput = box.querySelector("input[id^='asa-number']");
    const asaLabel = box.querySelector("label[for^='asa-number']");
    asaInput.id = `asa-number${newIndex}`;
    asaInput.name = `asa-number${newIndex}`;

    const nameInput = box.querySelector("input[id^='name']");
    const nameLabel = box.querySelector("label[for^='name']");
    nameInput.id = `name${newIndex}`;
    nameInput.name = `name${newIndex}`;
    nameLabel.setAttribute("for", `name${newIndex}`);

    const clubInput = box.querySelector("input[id^='club']");
    const clubLabel = box.querySelector("label[for^='club']");
    clubInput.id = `club${newIndex}`;
    clubInput.name = `club${newIndex}`;
    clubLabel.setAttribute("for", `club${newIndex}`);
  });

  deleteButtons.forEach((container, index) => {
    const newIndex = index + 1;
    container.dataset.index = newIndex;
  });
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
    nameCount = form.querySelectorAll(".individual-input").length;
    if (course != null) {
      let swimmer_list = [];
      for (let i = 1; i <= nameCount; i++) {
        const swimmer = form.querySelector(`#asa-number${i}`).value;
        const gender = form.querySelector(`#gender${i}`).textContent;
        console.log([swimmer, gender]);
        swimmer_list.push([swimmer, gender]);
      }
      try {
        let swimmer_list2 = await runPython(
          swimmer_list,
          course.value,
          poolLength.value,
          targetGender.value
        );
        if (swimmer_list2) {
          tbl_create(swimmer_list2); // Proceed only if there's no error
        } else {
          console.error("Failed to create the table due to an error.");
        }
      } catch (error) {
        console.error("error occured:", error);
      } finally {
        spinner.style.display = "none";
      }
    } else {
      console.error("No boxes checked");
      spinner.style.display = "none";
    }
  });
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
