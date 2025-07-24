export function initiateFilterToggle(){
  const toggleBtn = document.getElementById('toggle-filter-btn')
  const filterBar = document.getElementById('filter-bar')

  toggleBtn.addEventListener('click',() =>{
    filterBar.classList.toggle('filter-visible');
    const isVisible = filterBar.classList.contains('filter-visible');
    toggleBtn.textContent = isVisible ?  "Hide Filters \u25B2":"Show Filters \u25BC";
  });
}

export function initiateSliderFunction(){
    const minRange = document.getElementById("range-min");
    const maxRange = document.getElementById("range-max");
    const minInput = document.getElementById("min-age");
    const maxInput = document.getElementById("max-age");
    const sliderTrack = document.getElementById("slider-track");
    const sliderMaxVal=100
    

    minRange.addEventListener("input", () =>
        syncFromSliders(minRange, maxRange, minInput, maxInput, sliderTrack, sliderMaxVal)
        );
    maxRange.addEventListener("input", () =>
        syncFromSliders(minRange, maxRange, minInput, maxInput, sliderTrack, sliderMaxVal)
        );
    minInput.addEventListener("input", () =>
        syncFromInputs(minRange, maxRange, minInput, maxInput, sliderTrack, sliderMaxVal)
        );
    maxInput.addEventListener("input", () =>
        syncFromInputs(minRange, maxRange, minInput, maxInput, sliderTrack, sliderMaxVal)
        );
    updateSliderTrack(minRange,maxRange,sliderTrack,sliderMaxVal);
    syncFromSliders(minRange,maxRange,minInput,maxInput,sliderTrack,sliderMaxVal);
}
function updateSliderTrack(minRange,maxRange,sliderTrack,sliderMaxVal){
    const min = parseInt(minRange.value)
    const max = parseInt(maxRange.value)

    const percentMin = (min / sliderMaxVal) * 100;
    const percentMax = (max / sliderMaxVal) * 100;

    sliderTrack.style.left = percentMin + "%";
    sliderTrack.style.width = (percentMax - percentMin) + "%";
}

function syncFromSliders(minRange,maxRange,minInput,maxInput,sliderTrack,sliderMaxVal) {
    let min = parseInt(minRange.value);
    let max= parseInt(maxRange.value);

    if (min > max) {
        minRange.value = max;
        min = max;
    }
    minInput.value = min;
    maxInput.value = max;

    updateSliderTrack(minRange,maxRange,sliderTrack,sliderMaxVal);
  }
function syncFromInputs(minRange,maxRange,minInput,maxInput,sliderTrack,sliderMaxVal) {
    let min = parseInt(minInput.value);
    if (min<0) min=0;
    let max = parseInt(maxInput.value);
    if(max>sliderMaxVal) max = sliderMaxVal;
    if (min > max){
        minRange.value = max
        min = max;
    } 

    minRange.value = min;
    maxRange.value = max;

    updateSliderTrack(minRange,maxRange,sliderTrack,sliderMaxVal);
  }