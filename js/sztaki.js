
function sztaki_addButton() {

    var szotar = $('.dictTitleText').children().html().replace(' szótár','');
    console.log('szótár: ' + szotar);

    $('.eNode.owned.eRoot.article').each(function( index ) {
        var nid = $( this ).attr('nid');   
        $( this ).children('.Word.eNodeText').css('width','180px');
        $( this ).children('.Word.eNodeText').prepend( "<span id=\"toanki" + nid + "\" data-nid=\"" + nid + "\" class='toanki'>[to Anki]</span> " );

        document.getElementById("toanki" + nid).addEventListener('click',function(){
            var word;
            var translation;
            $('.eNode.owned.eRoot.article').each(function( index ) { if( $( this ).attr('nid') === nid ) { //e helyett egy .parent()
                word = $( this ).children('.Word.eNodeText');
                word.children('.toanki').html("[processing]");
                translation = $( this ).children('.eNodeLists');
            } });

            var word2 = sztaki_format_word(word);
            var translation2 = sztaki_format_translation(translation);
            
            console.log((word2));
            console.log((translation2));


            chrome.extension.sendMessage({ action: 'send', word: word2, translation: translation2, tags: szotar + ' SZTAKI'}, function(response) {
                  console.log(response);
                  word.children('.toanki').html("[done]");
            });
        });
    });
}

function sztaki_format_word(word) {
    var string;

    string = '**' + word.children('.prop_content').text() + '**'
    if(!(word.children('.prop_pos').text() === 'nincs')) string = string + ' _' + word.children('.prop_pos').text() + '_';
    if(word.children('.prop_ipaPronunciationUK').text() || word.children('.prop_ipaPronunciationUSA').text()) string = string + '\n\n';
    if(word.children('.prop_ipaPronunciationUK').text()) string = string + ' [' + word.children('.prop_ipaPronunciationUK').text() + ']';
    if(word.children('.prop_ipaPronunciationUSA').text()) string = string + ' [' + word.children('.prop_ipaPronunciationUSA').text() + ']';

    return string;
}
 
function sztaki_format_translation(translation) {
    var string = '';

    var max = translation.children().children('.eNode').length;
    var co = 1;

    var abc = ['a','b','c','d','e','f','g','h','i','j','k'];  
    
    translation.children().children('.eNode').each(function() {
        if(max > 1) string = string +  co.toString() + ". ";
        
        var subLength = $( this ).children('.eNodeLists').children('.subMeaningList').children().length;
        var i = 1;
        if( subLength > 0) { 
            $( this ).children('.eNodeLists').children('.subMeaningList').children().each(function(index){ 
                if(co > 0 && i > 1) string = string + '   ';
                string = string + abc[index] + '. ';

                if($( this ).children('.prop_thematicQualification').length > 0 ) { 
                   $( this ).children('.prop_thematicQualification').each(function(){
                        string = string + ' _(' + $( this ).text() + ')_ ';       
                    });
                }
                var m = $( this ).children('.eNodeLists').children('.WordList').children().length;
                var c = 1;       
                $( this ).children('.eNodeLists').children('.WordList').children().each(function() {

                        if($( this ).children().children('.prop_stylisticQualification').length > 0 ) { 
                           $( this ).children().children('.prop_stylisticQualification').each(function(){
                                string = string + ' _(' + $( this ).text() + ')_ ';       
                            });
                        }


                    var word = $( this ).children();


                    string = string + "**" + word.children('.prop_content').text() + "**"
                    if(word.children('.prop_ipaPronunciationUK').text()) string = string + ' [' + word.children('.prop_ipaPronunciationUK').text() + ']';
                    if(word.children('.prop_ipaPronunciationUSA').text()) string = string + ' [' + word.children('.prop_ipaPronunciationUSA').text() + ']';

                    if(m > c) string = string + ", ";
                     c++;
                });




                    if(subLength > i) string = string + "\n";
                    i++;

            });
        } else {

            if($( this ).children('.prop_geoQualification').length > 0 ) { 
               $( this ).children('.prop_geoQualification').each(function(){
                    string = string + ' _(' + $( this ).text() + ')_ ';       
                });
            }
            if($( this ).children('.prop_thematicQualification').length > 0 ) { 
               $( this ).children('.prop_thematicQualification').each(function(){
                    string = string + ' _(' + $( this ).text() + ')_ ';       
                });
            }
            if($( this ).children('.prop_stylisticQualification').length > 0 ) { 
               $( this ).children('.prop_stylisticQualification').each(function(){
                    string = string + ' _(' + $( this ).text() + ')_ ';       
                });
            }
            var m = $( this ).children('.eNodeLists').children('.WordList').children().length;
            var c = 1;       
            $( this ).children('.eNodeLists').children('.WordList').children().each(function() {
                var word = $( this ).children();
               if(word.children('.prop_stylisticQualification').length > 0 ) { 
                       word.children('.prop_stylisticQualification').each(function(){
                            string = string + ' _(' + $( this ).text() + ')_ ';       
                        });
                }
                if(word.children('.prop_geoQualification').length > 0 ) { 
                    word.children('.prop_geoQualification').each(function(){
                        string = string + ' _(' + $( this ).text() + ')_ ';       
                    });
                }
                string = string + "**" + word.children('.prop_content').text() + "**" ;
                if(word.children('.prop_ipaPronunciationUK').text()) string = string + ' [' + word.children('.prop_ipaPronunciationUK').text() + ']';
                if(word.children('.prop_ipaPronunciationUSA').text()) string = string + ' [' + word.children('.prop_ipaPronunciationUSA').text() + ']';

                if(m > c) string = string + ", ";
                 c++;
            });
        }
        if(co < max) string = string + '\n';
        co++;
    });
 
    return string;
}


sztaki_addButton();

//document.body.appendChild(script);