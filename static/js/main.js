
import {submitButton, initiateClearSwimmers, initiateFilterButton, initiateAddSwimmers} from "./form.js";
import { openTab } from "./tabs.js";
import { clubFilter, initiateAutocompletes } from "./autocompletes.js";
import { initiateFilterToggle,initiateSliderFunction } from "./filters.js";
document.addEventListener("DOMContentLoaded", function () {
  const clubSearchInput = document.getElementById("club-input-wrapper0");
  clubFilter(clubSearchInput);
  submitButton();
  openTab();
  initiateAutocompletes();
  initiateClearSwimmers();
  initiateFilterButton();
  initiateAddSwimmers();
  initiateFilterToggle();
  initiateSliderFunction();
});




