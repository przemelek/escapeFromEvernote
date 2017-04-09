fs = require('fs');
crypto = require('crypto');
Evernote = require('evernote');
AuthToken = require("./AuthToken.js");

// Real applications authenticate with Evernote using OAuth, but for the
// purpose of exploring the API, you can get a developer token that allows
// you to access your own Evernote account. To get a developer token, visit
// https://sandbox.evernote.com/api/DeveloperToken.action

var authToken = AuthToken.token;

var pathToBackup = "backup/"
if (process.argv.length>2) {
  pathToBackup = process.argv[2];
}

if (authToken == "<your developer token goes here>") {
  console.log("Please fill in your developer token");
  console.log("To get a developer token, visit https://www.evernote.com/api/DeveloperToken.action");
  process.exit(1);
}

// Initial development is performed on our sandbox server.
//
// To use the production service, set isSandbox to false and replace your
// developer token above with a token from
// https://www.evernote.com/api/DeveloperToken.action
//
// To use the Evernote China service, set isSandbox to false and isChina to true, then replace your
// developer token above with a token from
// https://app.yinxiang.com/api/DeveloperToken.action
//
// For more information about Evernote China service, please visit
// https://dev.evernote.com/doc/articles/bootstrap.php
var isSandbox = false;
var isChina = false;
var client = new Evernote.Client({token: authToken, sandbox: isSandbox, china: isChina});
var userStore = client.getUserStore();

userStore.checkVersion(
  "Evernote EDAMTest (Node.js)",
  Evernote.EDAM_VERSION_MAJOR,
  Evernote.EDAM_VERSION_MINOR,
  function(err, versionOk) {
    console.log(err);
    console.log("Is my Evernote API version up to date? " + versionOk);
    console.log();
    if (!versionOk) {
      process.exit(1);
    }
  }
);

var noteStore = client.getNoteStore();

// List all of the notebooks in the user's account
var defaultNotebook = null;
var notebooks = noteStore.listNotebooks().then(function(notebooks) {
  console.log("Toster1");
  // console.log(err);
  console.log("Found " + notebooks.length + " notebooks:");
  for (var i in notebooks) {
    if (notebooks[i].name=='#cookbook') {
      console.log("Toster2");
      defaultNotebook = notebooks[i];
      console.log(defaultNotebook);
      // console.log(defaultNotebook.guid);
      var noteFilter = new Evernote.NoteStore.NoteFilter();
      noteFilter.notebookGuid=defaultNotebook.guid;
      console.log(noteFilter);
      console.log("Toster3");

      var spec = new Evernote.NoteStore.NotesMetadataResultSpec();
      spec.includeTitle=true;
      var list = noteStore.findNotesMetadata(noteFilter,0,1000,spec).then(function(notes) {
      // var list = noteStore.findNotes(noteFilter,0,1000,function(err,notes) {
        // if (err) {
        //   console.log("Error!!!!!");
        //   console.log(err);
        // }
        // console.log(notes);
        var tags=[];
        var notes2Tags = {};
        for (var j=0; j<notes.totalNotes; j++) {
          console.log("#"+j+":"+notes.notes[j].guid);
          noteStore.getNote(notes.notes[j].guid,true,true,false,false).then(function(note) {
            // console.log(err);
            var title = note.title;
            while (title.indexOf(" ")!=-1) {
              title=title.replace(" ","_");
            }
            while (title.indexOf("/")!=-1) {
              title=title.replace("/","_or_")
            }
            //console.log(note.tagGuids);
            if (note.tagGuids) {
              notes2Tags[title]=note.tagGuids;
              for (var tagIdx=0; tagIdx<note.tagGuids.length; tagIdx++) {
                var tag = note.tagGuids[tagIdx];
                if (tags.indexOf(tag)==-1) {
                  tags.push(tag);
                }
              }
            }
            title=pathToBackup+title;
            fs.writeFile(title+".json",JSON.stringify(note),function(err) {
              if (err) {
                console.log("problem "+err+" for "+title);
              }
            })
          });
        }
      });
    }
    console.log("  * " + notebooks[i].name);
  }
});
