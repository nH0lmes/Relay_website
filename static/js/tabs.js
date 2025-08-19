
export function openTab(evt, tabName){
    document.querySelectorAll(".tablinks").forEach(button => {
    button.addEventListener("click", event => {
      const tabName = event.target.dataset.tab;
      openSite(event, tabName);
    });
  });

}

function openSite(evt, siteName) {
  var i, j, tabcontent, tablinks;

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