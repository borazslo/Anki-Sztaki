
/*
based on
https://github.com/vilia/AnkiOxfordDictionaryGoogleChromeExtension

*/

var loggedin = false;
var error = false;


$.ajax({
    type: 'GET',
    url: 'https://ankiweb.net/account/settings',
    success: function (data) {
        console.log('ankiweb reached');
        var html = $(data);
        var email = $("table[cellpadding=2]", html).children().children('tr').children('td:eq(1)');
        if(email.html() === localStorage.username) { 
            console.log('ankiweb has been logged in');
            loggedin = true;
            //return html;
        } else if (email.html().match(/^</) === null) {
            console.log('ankiweb has been logged in with other name'); 

            $.ajax({
                type: 'GET',
                url: 'https://ankiweb.net/account/logout',
                success: function (data) {
                    console.log('ankiweb logged out');
                    login();
                },
                error: function (a, b, c) {
                    console.log('ankiweb is unaccessible');
                    error = true;
                    return;
                }
            });

        } else {
            login();
        }

        
         
    },
    error: function (a, b, c) {
        console.log('ankiweb is unaccessible');
        error = true;
        return;
    }
});



chrome.extension.onMessage.addListener(function (request, sender, sendResponse) {
        if(loggedin === false) {
            console.log('ankiweb not loggedin');
            return;
        } 
        
        console.log('anki deck mid' + localStorage.deckmid);
        // Q: why does it have to be "undefined" here?
        if ((typeof localStorage.deckmid == "undefined") || (localStorage.deckmid == 0)) {
            $.ajax( {
                type: "GET",
                url: "https://ankiweb.net/edit/",
                success: function(data) {
                    var decks = jQuery.parseJSON(/editor\.decks = (.*}});/i.exec(data)[1]);
                    var models = jQuery.parseJSON(/editor\.models = (.*}]);/i.exec(data)[1]);
                    get_deck_model_ids(decks, models);
                }
            });
        } 
        addWord(request.word,request.translation,request.tags);

        if(error === false) sendResponse('done');

                       
});

function login() {
    $.ajax({
            type: 'POST',
            url: 'https://ankiweb.net/account/login',
            data: "submitted=1&username=" + localStorage.username + "&password=" + localStorage.password,
            success: function (data) {
                console.log('ankiweb reached');
                var html = $(data);
                if (($(".mitem", html).length) == 0) {
                    console.log('ankiweb authorization failed');
                    alert('Authorization failed. Check your username and password on options page');
                    error = true;
                    return;
                }
                console.log('ankiweb logged in');
                loggedin = true;
                return html; 
            },
            error: function (a, b, c) {
                alert('Authorization failed. Check your username and password on options page');
                console.log('ankiweb is unaccessible');
                error = true;
                return;
            }
        });

}


function addWord(word,definition,tags) {
    console.log('ankiweb add word: ' + word + '::' + definition);

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
    
    tags = tags + ' Markdown';
    var data = [fields, tags];
    
    // DEBUG
    console.log('akinweb deckname' + localStorage.deckname);
    
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
            console.log('akiweb card added');
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

