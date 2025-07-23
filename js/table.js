export function tbl_create(swimmer_list,index) {
  console.log(swimmer_list.length)
  let tbl_wrapper;
  if (swimmer_list.length === 5){
    tbl_wrapper = tbl_generate(swimmer_list, index);
  }
  if (index === 0) {
    document.getElementById("table-row-top").appendChild(tbl_wrapper);
  } else if (index === 5) {
    if (tbl_wrapper){
      document.getElementById("table-row-bottom").appendChild(tbl_wrapper);
    }
    else{
      let message = document.createElement("p");
      message.textContent = "No swimmers found for this search.";
      document.getElementById("table-row-bottom").appendChild(message);
    }
  } else {
    document.getElementById("table-row-mid").appendChild(tbl_wrapper);
  }
  document.getElementById("table-row-top").scrollIntoView({ behavior: "smooth" });
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
    swimmer_list[n].forEach((text) => {
      const td = document.createElement("td");
      td.textContent = text;
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