/*For adding new input rows to the submit form*/
let nameCount = 4;
let tbl_wrapper;

document.querySelectorAll(".addSwimmerButton").forEach(function (button) {
  button.addEventListener("click", function () {
    const containerId = button.dataset.targetContainer;
    addSwimmerBox(containerId);
  });
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

  name.append(label_name, input_name, autocomplete);

  const club = document.createElement("div");
  club.className = "form-input";

  const label_club = document.createElement("label");
  label_club.setAttribute("for", `club${nameCount}`);
  label_club.textContent = "Club";

  const input_club = document.createElement("input");
  input_club.type = "text";
  input_club.placeholder = "Enter Club";
  input_club.id = `club${nameCount}`;
  input_club.name = `club${nameCount}`;

  club.append(label_club, input_club);

  const deleteButton = document.createElement("button");
  deleteButton.type = "button";
  deleteButton.textContent = "-";
  deleteButton.className = "btn-delete";

  deleteButton.addEventListener("click", function () {
    wrapper.remove();
    reindexSwimmerBoxes(containerId);
  });

  wrapper.append(header, name, asa_num, club, deleteButton);

  container.appendChild(wrapper);
  setupAutocomplete(input_name);
  return wrapper;
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
    nameCount = form.querySelectorAll(".individual-input").length;
    if (course != null) {
      let swimmer_list = [];
      for (let i = 1; i <= nameCount; i++) {
        const swimmer = form.querySelector(`#asa-number${i}`).value;
        swimmer_list.push(swimmer);
      }
      try {
        let swimmer_list2 = await runPython(
          swimmer_list,
          course.value,
          poolLength.value
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
async function runPython(swimmer_array, course, poolLength) {
  const sentData = {
    array: swimmer_array,
    courseType: course,
    pool_length: poolLength,
  };
  const response = await fetch("http://127.0.0.1:8000/run-function/", {
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
clubSearchInput = document.getElementById("filter-club");
clubSearchInput.addEventListener("input", async () => {
  const resultBox = document.getElementById("autocomplete-club");
  const query = clubSearchInput.value.trim();
  if (!query) return (resultBox.innerHTML = "");

  const res = await fetch(
    "http://localhost:8000/search-clubs?q=" + encodeURIComponent(query)
  );
  const suggestions = await res.json();

  resultBox.innerHTML = "";
  console.log(suggestions);
  suggestions.forEach((club) => {
    const item = document.createElement("div");
    item.textContent = club.club;
    item.addEventListener("click", () => {
      clubSearchInput.value = club.club;
      resultBox.innerHTML = "";
    });
    resultBox.appendChild(item);
  });
});

function setupAutocomplete(searchInput) {
  const idSuffix = searchInput.id.match(/\d+$/)?.[0];
  if (!idSuffix) return;

  const resultBox = document.getElementById(`autocomplete-list${idSuffix}`);
  const asaInput = document.getElementById(`asa-number${idSuffix}`);
  const clubInput = document.getElementById(`club${idSuffix}`);

  searchInput.addEventListener("input", async () => {
    const query = searchInput.value.trim();
    if (!query) return (resultBox.innerHTML = "");

    const res = await fetch(
      "http://localhost:8000/search?q=" + encodeURIComponent(query)
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
        resultBox.innerHTML = "";
      });
      resultBox.appendChild(item);
    });
  });
}
document.querySelectorAll(".search-input").forEach(setupAutocomplete);

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
    `http://localhost:8000/filter-swimmers?${params.toString()}`
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

    if (nameInput)
      nameInput.value = `${swimmer.first_name} ${swimmer.last_name}`;
    if (asaInput) asaInput.value = swimmer.asa_number;
    if (clubInput) clubInput.value = swimmer.club;

    await setupAutocomplete(wrapper);
  });
  let new_boxes = document.querySelectorAll(".individual-input");
  while (new_boxes.length < 4) {
    wrapper = addSwimmerBox("swimmer-container-ASA");
    new_boxes = document.querySelectorAll(".individual-input");
  }
});
