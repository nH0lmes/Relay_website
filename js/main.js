let nameCount = 4;

document.getElementById('addSwimmerButton').addEventListener('click',function(){
    nameCount++;

    const nameBox = document.createElement('div');
    nameBox.className = 'swimmer-input';
    nameBox.dataset.index  =nameCount;

    const label = document.createElement('label');
    label.setAttribute('for', `Swimmer${nameCount}`);
    label.textContent = `Swimmer ${nameCount}`;

    const divider = document.createElement('div');
    divider.className = 'divider';

    const input = document.createElement('input');
    input.type = 'text';
    input.inputMode = 'numeric';
    input.id = `Swimmer${nameCount}`;
    input.name = `Swimmer${nameCount}`;

    const deleteButtonContainer = document.createElement('div');
    deleteButtonContainer.className = 'delete-button-container';

    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.textContent = '-';
    deleteButton.className = 'btn-delete';

    deleteButton.addEventListener('click',function(){
        nameBox.remove();
        deleteButtonContainer.remove();
        reindexSwimmerBoxes();
    });
    deleteButtonContainer.appendChild(deleteButton);

    nameBox.appendChild(label);
    nameBox.appendChild(divider);
    nameBox.appendChild(input);


    const form = document.getElementById('swimmer-form');
    form.insertBefore(nameBox, document.getElementById('addSwimmerButton'));
    form.insertBefore(deleteButtonContainer,document.getElementById('addSwimmerButton'));
    form.insertBefore(deleteButtonContainer, nameBox.nextSibling);
}); 

function reindexSwimmerBoxes(){
    const swimmerBoxes = document.querySelectorAll('.swimmer-input');
    const deleteButtonsContainers = document.querySelectorAll('delete-button-container');
    
    nameCount = swimmerBoxes.length;

    swimmerBoxes.forEach((box, index)=>{
        const newIndex = index + 1;
        box.dataset.index = newIndex;

        const label =box.querySelector('label');
        const input = box.querySelector('input');

        label.setAttribute('for', `Swimmer${newIndex}`);
        label.textContent = `Swimmer ${newIndex}`;
        input.id = `Swimmer${newIndex}`;
        input.name = `Swimmer${newIndex}`;
    });

    deleteButtonsContainers.forEach((container,index)=>{
    const newIndex = index + 1;
    container.dataset.index = newIndex;
    });
}