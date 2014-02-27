/*////// TODO: ///////
0. migrate todos to github issues, and initial commit message
1. window.location.replace itself triggers a second hashchange... but it's fine and causes no problems
2. openING a compose is sometimes triggering things because that's a hashchange, duh
3A. It gets confused and does odd things if you click another sidebar link before it's done. 
    A straightforward solution would be to temporarily overlay a div over the sidebar nav area to block repeat clicks. 
    However this led me to discover that by using the jquery-simulate plug-in or better yet http://stackoverflow.com/questions/2705583/how-to-simulate-a-click-with-javascript 
    it is possible to base the whole plugin on click interception rather than hashchanges by...
3B. Z-index divs over existing absolutely and relatively positioned divs - one to do the redirect, and others to simulate click the obscured dropdowns etc
    Doing it this way will be more straightforward, and eliminate the visible initial hashchange, and allow me to overlay visual indicators
4. Unit tests?

/////////////////////*/

var types = ["label", "category", "circle", "starred", "imp", "sent"];
var lastBaseHash;
$(document).ready(function(){lastBaseHash = getBaseHash();}); //wait - doc ready still necessary?
$(window).on('hashchange', function(){
console.log('hashchange');//delete this
//ADD: clickhandler on nav area overlay preventing repeat clicks?
  var hash = getHash();
  var type = getType(hash);
  var baseHash = getBaseHash(hash, type);
  if(types.indexOf(type) > -1 && baseHash !== lastBaseHash){
    var newBaseHash = "search/" + forBeforeColon(type) + "%3A" + forAfterColon(hash, type) + "+in%3Ainbox";
    var wasSearch = lastBaseHash.match("^search/[^/?]*");
    if(wasSearch === null || newBaseHash !== wasSearch[0]){
      changeHash(newBaseHash);
    }
    else{
      clickHandleRegularView(hash, type, newBaseHash);
    }
    lastBaseHash = getBaseHash();
    //remove preventive click handler?
  }
});

function getHash(){
  var hashIncludingSign = window.location.hash;
  return hashIncludingSign.substr(hashIncludingSign.indexOf("#")+1);
}
function getType(hash){
  return hash.match("^[^/?]*")[0]; 
}
function getBaseHash(hash, type){
  hash = hash || getHash();
  type = type || getType(hash);
  var hash = getHash();
  var type = getType(hash);
  if(type === "starred" || type === "imp" || type === "sent"){
   return type;
  }
  else{
    return hash.match("^[^/?]*(?:/[^/?]*)?")[0];
  }
}
function getLabelCatCirName(hash){
  return hash.match("^[^/]*[/]([^/?]*)")[1];
}

function forAfterColon(hash, type){
  if(type === "starred" || type === "sent"){var afterColon = type;}
  else if(type === "imp"){var afterColon = "important";}
  else{var afterColon = getLabelCatCirName(hash);}
  return afterColon;
}
function forBeforeColon(type){
  if( type === "starred" || type === "imp" || type === "sent"){
    var beforeColon = "is";
  }
  else{
    var beforeColon = type;
  }
  return beforeColon;
}
function changeHash(newBaseHash){
  window.location.replace("#" + newBaseHash);
}

function clickHandleRegularView(hash, type, newBaseHash){
  if(type === "starred" || type === "sent" || type === "imp"){ 
    type = type[0].toUpperCase() + type.substring(1);
    if(type === "Imp"){type = "Important";}
    var anchorTag = findAnchorTag(type);
    anchorTag.closest('[class^="aim"]').children().find('*')
      .click(function(){
        changeHash(newBaseHash);
    });
  }
  else{
    var anchorTag = findAnchorTag(getLabelCatCirName(hash));
    var anchorTagGrandparent = anchorTag.parent().parent();
    anchorTagGrandparent.next()
      .click(function(){
        event.stopPropagation();
    });
    if(anchorTagGrandparent.prev().filter('[title^="Collapse"]')){ //nester label
      anchorTagGrandparent.find('*')
        .click(function(){
          changeHash(newBaseHash);
      });
      anchorTagGrandparent.prev()
        .click(function(){
          event.stopPropagation();
      });
    }
    else{ //non-nester labels, categories, circles
      anchorTag.closest('[class^="aim"]').children().find('*')
        .click(function(){
          changeHash(newBaseHash);
      });
    }
  }
}
function findAnchorTag(title){
  var filter = true;
  var anchorTag =  $('a[title^="' + title + '"]');
  if(filter){return filterAnchorTitle(anchorTag, title);}
  else{return anchorTag;}
}
function filterAnchorTitle(anchorTag, title){ //prevents labels that are substrings of other labels from being a problem
  return anchorTag.filter(function(){
    return this.title.match(title + "(?: \(\d+\))?$");
  });
}