/*
if (!chrome.runtime) {
    // Chrome 20-21
    chrome.runtime = chrome.extension;
} else if(!chrome.runtime.onMessage) {
    // Chrome 22-25
    chrome.runtime.onMessage = chrome.extension.onMessage;
    chrome.runtime.sendMessage = chrome.extension.sendMessage;
    chrome.runtime.onConnect = chrome.extension.onConnect;
    chrome.runtime.connect = chrome.extension.connect;
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "hello")
      sendResponse({farewell: "goodbye"});
  });

chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
	var divId = 'ooppqqwweediv';
    var frameId = 'ooppqqwweeiframe';

    console.log('megye');

    if (request.action == "getSelectedText") {
        var text = document.getSelection().toString();
        sendResponse({ 'selectedText': text });
    } else if (request.action == "showWindow") {
        var newDiv = document.getElementById(divId);
        if (newDiv == null)
            newDiv = document.createElement('div');
        newDiv.setAttribute('id', divId);
        newDiv.setAttribute('style', 'z-index:1000');

        var iframe = document.getElementById(frameId);
        if (iframe != null)
            newDiv.removeChild(iframe);

        iframe = document.createElement("iframe");
        iframe.src = chrome.extension.getURL("process.html") + "?word=" + encodeURI(request.word);
        iframe.setAttribute('style', 'width: 500px; height: 310px; border: 0; z-index: 1000;');
        iframe.setAttribute('id', frameId);
        newDiv.appendChild(iframe);

        document.body.appendChild(newDiv);

        var script = document.createElement("script");
        script.innerHTML = "var googlechromeextensioncontentdiv = document.getElementById('" + divId + "');  googlechromeextensioncontentdiv.setAttribute('style', 'position:absolute; left:' + (googlechromeextensionpx - 100) + 'px; top: ' + (googlechromeextensionpy - 50) + 'px; z-index:1000;');";
        document.body.appendChild(script);
    } else if (request.action == "closeiframe") {
        var newDiv = document.getElementById(divId);
        if (newDiv == null) {
            return;
        }
        var iframe = document.getElementById(frameId);
        if (iframe != null) {
            newDiv.removeChild(iframe);
        }

        document.body.removeChild(newDiv);

    } else {
        sendResponse({});
    }
});

var title;

*/
function addButton() {
    $('.eNode.owned.eRoot.article').each(function( index ) {
        var nid = $( this ).attr('nid');   
        $( this ).children('.Word.eNodeText').css('width','180px');
        $( this ).children('.Word.eNodeText').prepend( "<span id=\"toanki" + nid + "\" data-nid=\"" + nid + "\" class='toanki'>[to Anki]</span> " );

        document.getElementById("toanki" + nid).addEventListener('click',function(){
            var word;
            var translation;
            $('.eNode.owned.eRoot.article').each(function( index ) { if( $( this ).attr('nid') === nid ) { //e helyett egy .parent()
                word = $( this ).children('.Word.eNodeText');
                word.children('.toanki').remove();
                word.children('.playSound').remove();
                word.children('.comments').remove();
                //console.log(word.html());

                translation = $( this ).children('.eNodeLists');
                translation.find('.toggleEdit').remove();
                translation.find('.playSound').remove();
                translation.find('.wordLikeIcon.eIcon').remove();
                //console.log(translation.html());
            } });

            chrome.extension.sendMessage({ action: 'send', word: word.text(), translation: translation.text() }, function(response) {
                  console.log(response);
            });
        });
    });


}

var script = document.createElement("script");
//script.innerHTML = "var googlechromeextensionpx, googlechromeextensionpy; function getMouseXY(ev) {googlechromeextensionpx = ev.pageX; googlechromeextensionpy = ev.pageY;}; document.onmousemove = getMouseXY;";
    script.src = chrome.extension.getURL('js/preprocess.js'); //put whatever javascript you like here
    script.type = 'text/javascript';
 

addButton();

//document.body.appendChild(script);