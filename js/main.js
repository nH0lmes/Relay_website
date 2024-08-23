/*For adding new input rows to the submit form*/
let nameCount = 4;
let tbl_wrapper;

document
  .getElementById("addSwimmerButton")
  .addEventListener("click", function () {
    nameCount++;
    const wrapper = document.createElement("div");
    wrapper.className = "wrapper";

    const nameBox = document.createElement("div");
    nameBox.className = "swimmer-input new-one";
    nameBox.dataset.index = nameCount;

    const label = document.createElement("label");
    label.setAttribute("for", `Swimmer${nameCount}`);
    label.textContent = `Swimmer ${nameCount}`;

    const divider = document.createElement("div");
    divider.className = "divider";

    const input = document.createElement("input");
    input.type = "text";
    input.inputMode = "numeric";
    input.id = `Swimmer${nameCount}`;
    input.name = `Swimmer${nameCount}`;

    const deleteButton = document.createElement("button");
    deleteButton.type = "button";
    deleteButton.textContent = "-";
    deleteButton.className = "btn-delete";

    deleteButton.addEventListener("click", function () {
      wrapper.remove();
      reindexSwimmerBoxes();
    });

    nameBox.appendChild(label);
    nameBox.appendChild(divider);
    nameBox.appendChild(input);

    wrapper.appendChild(nameBox);
    wrapper.appendChild(deleteButton);

    const form = document.getElementById("swimmer-form");
    form.insertBefore(wrapper, document.getElementById("buttons-container"));
  });

function reindexSwimmerBoxes() {
  const swimmerBoxes = document.querySelectorAll(".swimmer-input");
  const deleteButtonsContainers = document.querySelectorAll(".btn-delete");

  nameCount = swimmerBoxes.length;

  swimmerBoxes.forEach((box, index) => {
    const newIndex = index + 1;
    box.dataset.index = newIndex;

    const label = box.querySelector("label");
    const input = box.querySelector("input");

    label.setAttribute("for", `Swimmer${newIndex}`);
    label.textContent = `Swimmer ${newIndex}`;
    input.id = `Swimmer${newIndex}`;
    input.name = `Swimmer${newIndex}`;
  });

  deleteButtonsContainers.forEach((container, index) => {
    const newIndex = index + 1;
    container.dataset.index = newIndex;
  });
}

/*Submit button function on the input form*/
document
  .getElementById("swimmer-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();
    let swimmer_list = [];
    for (let i = 1; i <= nameCount; i++) {
      const swimmer = document.getElementById(`Swimmer${i}`).value;
      swimmer_list.push(swimmer);
    }
    let swimmer_list2 = await runPython(swimmer_list);
    if (swimmer_list2) {
      tbl_create(swimmer_list2); // Proceed only if there's no error
    } else {
      console.error("Failed to create the table due to an error.");
    }
  });

async function runPython(swimmer_array) {
  const response = await fetch("http://127.0.0.1:8000/run-function/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ array: swimmer_array }),
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
