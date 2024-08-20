let nameCount = 4;

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
  const deleteButtonsContainers = document.querySelectorAll(
    "delete-button-container"
  );

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
