var usernametextbox;
var passwordtextbox;
var decknametextbox;
var saveButton;

$(function() {
	init();
	$("#save-button").click(function() { save(); });
	$("#cancel-button").click(function() { init(); });
});

function init() {
    usernametextbox = $("#username");
    passwordtextbox = $("#password");
    decknametextbox = $("#deckname");
    deckmidtextbox = $("#deckmid");
    saveButton = $("#save-button");

    usernametextbox.val(localStorage.username || "");
    passwordtextbox.val(localStorage.password || "");
    decknametextbox.val(localStorage.deckname || "");
    deckmidtextbox.val(localStorage.deckmid || "");
}

function save() {
    localStorage.username = usernametextbox.val();
    localStorage.password = passwordtextbox.val();
    //if (localStorage.deckname != decknametextbox.val()) {
    	localStorage.deckmid = 0;
    //}
    localStorage.deckname = decknametextbox.val();
  
    chrome.extension.getBackgroundPage().init();
}