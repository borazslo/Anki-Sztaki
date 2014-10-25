
/*
chrome.contextMenus.create({
    "title": (localStorage.addtoanki == true) ? "Get definition and add to Anki" : "Get word definition",
    "type": "normal",
    "contexts": ["selection"],
	"id" : "simple"
});


chrome.contextMenus.onClicked.addListener(function(info, tab) {
	if ((info.menuItemId != 'simple') && (info.menuItemId != 'correction'))
		return;
	var text = $.trim(info.selectionText);
	if (info.menuItemId == 'correction')
		text = prompt(text, text);

	chrome.tabs.sendMessage(tab.id, { "action": "showWindow", "word": text }, function (response) {	});
});
*/
chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.action == "closeiframe") {
        chrome.tabs.getSelected(null, function (tab) {
            chrome.tabs.sendMessage(tab.id, { action: "closeiframe" }, function (response) {
                console.log('iframeclosed event triggered');
            });
        });
    } else if (request.action == "getdataobject") {
    	var dataobject = {
        		'username': localStorage.username,
        		'password' : localStorage.password,
        		'deckname' : localStorage.deckname,
        		'deckmid' : localStorage.deckmid
        		};
    	sendResponse(dataobject);
    } else if (request.action == "updatemid") {
    	localStorage.deckmid = request.mid;
    } else if (request.action == "send") { 
           
            $.ajax({
            type: 'POST',
            url: 'https://ankiweb.net/account/login',
            data: "submitted=1&username=" + localStorage.username + "&password=" + localStorage.password,
            success: function (data) {
                var html = $(data);
                if (($(".mitem", html).length) == 0) {
                    alert('Authorization failed. Check your username and password on options page');
                    //closeiframe();
                    return;
                }
                
                console.log('authorized, deck mid' + localStorage.deckmid);
                // Q: why does it have to be "undefined" here?
                if ((typeof localStorage.deckmid == "undefined") || (localStorage.deckmid == 0)) {
                    $.ajax( {
                        type: "GET",
                        url: "https://ankiweb.net/edit/",
                        success: function(data) {
                            var decks = jQuery.parseJSON(/editor\.decks = (.*}});/i.exec(data)[1]);
                            var models = jQuery.parseJSON(/editor\.models = (.*}]);/i.exec(data)[1]);
                            get_deck_model_ids(decks, models);
                            addWord(request.word,request.translation);
                        }
                    });
                } else {
                    addWord(request.word,request.translation);
                }
                
            },
            error: function (a, b, c) {
                alert('Authorization failed. Check your username and password on options page');
            }
        });

            sendResponse('ma');

    }
});

function addWord(word,definition) {
    console.log(word + definition);

    var front = word;
    // replace html new line tags 
    var back = definition.replace(/\n/g, '<br />').replace(/\r/g, '');
    
    // fields contains two items: the word and its definition.
    // In general, however, can be an array with an ordered numbered of
    // fields, depending on the note type
    var fields; 
    fields = [];
    fields.push(front);
    fields.push(back);
    
    var tags = '' // we assume no tags
    var data = [fields, tags];
    
    // DEBUG
    console.log(localStorage.deckname);
    
    var dict = {
         data: JSON.stringify(data),
         mid: localStorage.deckmid,
         deck: localStorage.deckname
    };
    
    var addurl ='https://ankiweb.net/edit/save';
    
    $.get(
        addurl,
        dict,
        function (data) {
            console.log('card added');
            //closeiframe();
        }
    );
}

function get_deck_model_ids(decks, models)
{
    var deck_id = 0; 
    var model_id = 0; 
    
    var deckname = localStorage.deckname;
    
    // search the destination deck among the retrieved ones
    for (var prop in decks) { 
        if (decks[prop].name == deckname) { 
            deck_id = prop == "1" ? "1" : prop.substr(0, prop.length - 3); 
            break; 
        }
    }; 
    if (deck_id == 0) {
        alert("The deck with name " + localStorage.deckname + " couldn't be found. Please check deck name and register");
        return;
    }
    
    // What we want is trying to access the right basic model, I think (how do we know? The user should specify that)
    
    // XXX: I suppose that from here on, what it's trying to do 
    // is getting the right (Basic) note type, aka model
    jQuery.each(models, function(i, n) {
        if (n.mod == deck_id) 
            model_id = n.id;
    });
    if (deck_id == "1" && model_id == 0) {
        model_id = models[0].id;
    }
    if (model_id == 0 && models.length > 0) {
        // Well. The linkages between note type and deck name is not clear, 
        // therefore this is the most reliable solution, but not right enough.
        model_id = models[0].id; 
    }
    if (model_id == 0) {
        alert("Couldn't find default note type model for the deck " + dataobject.deckname + ". Please contact with extension developer and describe the error situation");
        return;
    }
    //chrome.extension.sendMessage({ 'action': 'updatemid', 'mid' : model_id }, function() {}); 
    localStorage.deckmid = model_id;
    
}

    /*function translateAndAdd(askCorrection) {
    chrome.tabs.getSelected(null, function (tab) {
        chrome.tabs.sendRequest(tab.id, { action: "getSelectedText" }, function (response) {
            var text = $.trim(response.selectedText);
            if (askCorrection)
                text = prompt(text, text);
            chrome.tabs.sendRequest(tab.id, { "action": "showWindow", "word": text; }, function (response) { });
        });
    });
}

function process() {
    translateAndAdd(false);
}

function correctAndProcess() {
    translateAndAdd(true);
}*/
