function configureDropdown() {
    var coll = document.getElementsByClassName("collapsible");
    var i;

    for (i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.maxHeight) {
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    }
}

function menuToggle() {
    sidebar = document.getElementById("sidebar");
    sidebar.classList.remove("non-mobile");
    if (sidebar.style.display === "block") {
        sidebar.style.display = "none";
    } else {
        sidebar.style.display = "block";
    }
    adjustHeight();
}

function adjustHeight(resize = false) {
    if (window.scrollY < 48 && getComputedStyle(document.getElementById("sub-header")).display !== "none") {
        document.getElementById("header").style = "box-shadow: none";
        document.getElementById("sidebar").style.top = (96 - window.scrollY).toString() + "px";
        document.getElementById("sidebar").style.height = (window.innerHeight - 96 + window.scrollY).toString() + "px";
    } else {
        document.getElementById("header").style = "box-shadow: 0 2px 5px 0 rgba(0,0,0,0.16), 0 2px 10px 0 rgba(0,0,0,0.12)";
        document.getElementById("sidebar").style.height = (window.innerHeight - 48).toString() + "px";
        document.getElementById("sidebar").style.top = "48px";
    }
    if (resize) {
        drawBackgroundColor();
    }
}

function saveScroll(text, parent) {
    var sidebar = document.getElementById("sidebar");
    var child = document.getElementById(parent + "-child");
    window.location = text + "?parent=" + parent + "&position=" + child.getBoundingClientRect().top + "&height=" + child.getAttribute("style");
}

function updateScroll() {
    var sidebar = document.getElementById("sidebar");
    sidebar.classList.remove("non-mobile");

    var element = document.getElementById(getQueryVariable("parent"));
    var num = parseInt(element.getAttribute("data-num"));
    var height = parseInt(element.parentElement.offsetHeight);

    var id = getQueryVariable("parent") + "-child";
    var childHeight = parseInt(getQueryVariable("height").replace("%20", " ").replace(/\D/g, ""));
    document.getElementById(id).classList.add("no-transition");
    document.getElementById(id).setAttribute("style", "max-height: " + childHeight + "px");

    var element = document.getElementById(getQueryVariable("parent"));
    var num = element.getAttribute("data-num");
    var offset = document.getElementById("sidebar").offsetTop;
    var scroll = -parseInt(getQueryVariable("position")) + parseInt(offset) + (height * num) - 12;
    document.getElementById("sidebar").scrollTo(0, scroll);

    document.getElementById(id).classList.remove("no-transition");

    sidebar.classList.add("non-mobile");
}

function getQueryVariable(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split("=");
        if (pair[0] == variable) {
            return pair[1];
        }
    }
    return (false);
}

function includeHTML() {
  var z, i, elmnt, file, xhttp;
  /* Loop through a collection of all HTML elements: */
  z = document.getElementsByTagName("*");
  for (i = 0; i < z.length; i++) {
    elmnt = z[i];
    /*search for elements with a certain atrribute:*/
    file = elmnt.getAttribute("w3-include-html");
    if (file) {
      /* Make an HTTP request using the attribute value as the file name: */
      xhttp = new XMLHttpRequest();
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4) {
          if (this.status == 200) {elmnt.innerHTML = this.responseText;}
          if (this.status == 404) {elmnt.innerHTML = "Page not found.";}
          /* Remove the attribute, and call this function once more: */
          elmnt.removeAttribute("w3-include-html");
          includeHTML();
        }
      }
      xhttp.open("GET", file, true);
      xhttp.send();
      /* Exit the function: */
      return;
    }
  }
}

window.onload = function() {
    configureDropdown();
    includeHTML();
    updateScroll();
};
window.onscroll = function() {
    adjustHeight();
};
window.onresize = function() {
    adjustHeight(true);
};