export function tbl_create(swimmer_list, index) {
  const tableRows = document.getElementById("table-rows");
  tableRows.style.display = "block";
  let tbl_wrapper;
  let mid_wrapper;
  if (swimmer_list.length === 5) {
    tbl_wrapper = tbl_generate(swimmer_list, index);
  }
  if (index === 0) {
    const topTable = document.getElementById("table-row-top");
    const title = document.createElement("h3");
    title.textContent = "Fastest Team";
    title.classList.add("table-title");
    topTable.append(title, tbl_wrapper);
  } else if (index === 5) {
    if (tbl_wrapper) {
      const bottomTable = document.getElementById("table-row-bottom");
      const title = document.createElement("h3");
      title.textContent = "B Team - Contains no swimmers from the fastest team";
      title.classList.add("table-title");
      bottomTable.append(title, tbl_wrapper);
    } else {
      let message = document.createElement("p");
      message.textContent = "Not enough swimmers to form a B Team";
      document.getElementById("table-row-bottom").appendChild(message);
    }
  } else {
    if (index === 1) {
      const midTable = document.getElementById("table-row-mid");
      const title = document.createElement("h3");
      title.textContent = "Alternate options";
      title.classList.add("table-title");
      midTable.append(title);
    }
    const mid_wrapper = ensureMidWrapper();
    mid_wrapper.append(tbl_wrapper);
  }
  document
    .getElementById("table-row-top")
    .scrollIntoView({ behavior: "smooth" });
}
function ensureMidWrapper() {
  let midWrapper = document.getElementById("mid-tables-wrapper");
  if (!midWrapper) {
    midWrapper = document.createElement("div");
    midWrapper.id = "mid-tables-wrapper";
    midWrapper.classList.add("mid-tables-wrapper"); // Optional styling class
    const midRow = document.getElementById("table-row-mid");
    if (midRow) {
      midRow.appendChild(midWrapper);
    } else {
      console.warn(
        "Could not find #table-row-mid to append mid-tables-wrapper."
      );
    }
  }
  return midWrapper;
}

function tbl_generate(swimmer_list, index) {
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
    swimmer_list[n].forEach((text, index) => {
      const td = document.createElement("td");
      td.textContent = text;
      if (index === 1) {
        td.classList.add("table-name");
        attachScroll(td, text);
      }
      tr.appendChild(td);
    });
    tbl.appendChild(tr);
  }
  const tr = document.createElement("tr");
  let last_row = swimmer_list[swimmer_list.length - 1];
  const td1 = document.createElement("td");
  td1.colSpan = "2";
  td1.textContent = last_row[0];
  const td2 = document.createElement("td");
  td2.textContent = last_row[1];
  tr.appendChild(td1);
  tr.appendChild(td2);
  tbl.appendChild(tr);

  let tbl_wrapper = document.createElement("div");
  tbl_wrapper.className = "table-container";
  tbl_wrapper.appendChild(tbl);
  return tbl_wrapper;
}

function attachScroll(cell, name) {
  cell.addEventListener("click", () => {
    const nameToFind = name.toLowerCase();
    console.log(nameToFind);
    const match = Array.from(
      document.querySelectorAll(".individual-input")
    ).find((wrapper) => {
      const summary = wrapper.querySelector(".collapsed-summary");
      const firstDiv = summary?.children?.[0];
      return (
        firstDiv && firstDiv.textContent.toLowerCase().includes(nameToFind)
      );
    });
    if (match) {
      console.log(match);
      match.scrollIntoView({ behavior: "smooth", block: "center" });
      setTimeout(() => match.classList.add("input-pulse"), 500);
      setTimeout(() => match.classList.remove("input-pulse"), 2500);
    } else {
      console.log("no match found");
    }
  });
}
