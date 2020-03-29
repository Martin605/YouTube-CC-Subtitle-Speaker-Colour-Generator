let ytt=""
var htmlTxt = {}

// Operations when the web page is loaded.
function onLoad() {
  returnUpload()
  var lang = navigator.language || navigator.userLanguage; 
  document.querySelector('#colorupload').addEventListener('change', (e) => {
  loadJSON();
});
}

function sbvTransfer() {
  try {
  var sbvFiles = document.getElementById("sbvupload").files;
  if (!sbvFiles.length || sbvFiles[0].name.match('.sbv')) {
    document.getElementById("form").classList.add("was-validated");
  }
  let sbv = "";
  let colour = {};

  ytt = '<?xml version="1.0" encoding="utf-8"?>\n<timedtext format="3">\n<head>\n<wp id="0" ap="7" ah="50" av="100" />\n<ws id="0" ju="2" pd="0" sd="0" />\n<pen id="0" sz="120" fc="#FEFEFE" fo="254" bo="0" et="3" ec="#000000" />';
  var sbvTime =[];
  const reader = new FileReader();
  var colourNameList = document.getElementsByClassName("colourName");
  var colourCodeList = document.getElementsByClassName("colourCode");
  for (var i = 0; i < colourNameList.length; i++) {
    ytt += `<pen id="${i+1}" sz="120" fc="#${colourCodeList[i].value.toUpperCase()}" fo="254" bo="0" et="3" ec="#000000" />\n`
    colour[colourNameList[i].value] = i+1
  }
  const sbvreader = new FileReader();
  sbvreader.onload = function (e) {
    sbv = e.target.result.split("\n");
    ytt += "</head><body>"
    for (var i = 0; i < sbv.length; i++) {
      if (sbv[i].match(/.*:.*:.*,.*:.*:.*/)) {
        sbvTime = sbv[i].split(",");
        var t = listFloat(sbvTime[0].split(":"));
        t = parseInt(((t[0]*60+t[1])*60+t[2])*1000);
        if ( t==0 ) {t=1};
        var d = listFloat(sbvTime[1].split(":"));
        d = parseInt(((d[0]*60+d[1])*60+d[2])*1000 - t);
        ytt += `<p t="${t}" d="${d}" p="0" wp="0" ws="0">`
      } else if (sbv[i].length == 1 | sbv[i] == "") {
        ytt += "</p>\n"
      } else {
        var txt = [];
        if (sbv[i].match(/.*[:|\uff1a].*/)) {
          txt = sbv[i].split(/:|\uff1a/,2)
          if (txt[0].match('&')) {
            var speaker = txt[0].split('&')
            ytt += `\n`
            for (var ii = 0; ii < speaker.length; ii++) {
              if (typeof(colour[speaker[ii]]) == "undefined") {c=0} else {c=colour[speaker[ii]]}
              if (ii < speaker.length-1) {ytt += `<s p="${c}">${speaker[ii]}</s>&`}
              else {ytt += `<s p="${c}">${speaker[ii]}</s>`}
            }
            ytt += `\uff1a${txt[1]}`
          } else {
            if (typeof(colour[txt[0]]) == "undefined") {c=0} else {c=colour[txt[0]]}
            ytt += `\n<s p="${c}">${sbv[i]}</s>`
          }
        } else {
          ytt += `\n<s p="0">${sbv[i]}</s>`
        }
      }
    }
    ytt += "</body></timedtext>"
    let blob = new Blob([ytt], {type: "text/plain;charset=utf-8"});
    saveAs(blob, "subtitle.ytt");
  };
  sbvreader.readAsText(sbvFiles[0]);
  } catch(e) {
  showerror("Error")
  }
}

//// Preview
function preview() {
  document.getElementById("preview").style.display = "inline";
}

//// Upload
function upload() {
  sbvTransfer()
}

//// Download
// set download button
function setDownload(resultKey) {
  document.getElementById("loading").style.display = "none";
  url = resultURL(resultKey);
  document.getElementById("dowloadButton").href = url;
  document.getElementById("download").style.display = "inline";
  document.getElementById("returnButton").style.display = "inline";
}

// return
function returnButton() {
  document.getElementById("returnButton").style.display = "inline";
  document.getElementById("form").classList.remove("was-validated");
}
function returnUpload() {
  document.getElementById("error").style.display = "none";
  document.getElementById("upload").style.display = "inline";
  document.getElementById("returnButton").style.display = "none";
}

// error
function showerror(msg) {
  document.getElementById("upload").style.display = "none";
  document.getElementById("error").style.display = "inline";
  document.getElementById('errormsg').innerHTML = msg;
} 

function listFloat(list) {
  var newList = [];
  for (var i = 0; i < list.length; i++) {
    newList.push(parseFloat(list[i]))
  }
  return newList
}

function loadJSON() {
  var colourNameList = document.getElementsByClassName("colourName");
  for (var i = 0; i < colourNameList.length; i++) {
  removeColour(`"colour${i}`)}
  let fileToLoad = document.getElementById("colorupload").files[0];
  let fileReader = new FileReader();
  fileReader.onload = function (fileLoadedEvent) {
      prepareJson = JSON.parse(fileLoadedEvent.target.result);
      let keys = Object.keys(prepareJson);
      for (let i = 0; i < keys.length; i++) {
          let key = keys[i];
          addColour(key,prepareJson[key]);
      }
  };
  fileReader.readAsText(fileToLoad, "UTF-8");
}

function addNewColour(){
  var colourNameList = document.getElementsByClassName("colourName");
  addColour(`Speaker${colourNameList.length}`,"FFFFFF")
}

function colourListTxt(i,colourName,colourCode){
  return `<li id="colour${i}" class="list-group-item">
  <div class="input-group col-10">
    <input type="text" id="colourName${i}" class="colourName form-control" placeholder="Name" aria-describedby="inputGroupPrepend" value="${colourName}" required>
    &nbsp;&nbsp;
    <div class="input-group-prepend"><span class="input-group-text" id="inputGroupPrepend">#</span></div>
    <input type="text" id="colourCode${i}" class="colourCode form-control" value="${colourCode}" aria-describedby="inputGroupPrepend" pattern="^[A-Fa-f0-9]{6}$" required>
    &nbsp;&nbsp;
    <a class="btn btn-danger btn" onclick="removeColour(${i})" href="#" role="button"><span class="material-icons">delete</span></a>
  </div>
</li>`
}

function addColour(colourName,colourCode) {
  var colourNameList = document.getElementsByClassName("colourName");
  var colourCodeList = document.getElementsByClassName("colourCode");
  var ctxt = ""
  for (var i = 0; i < colourNameList.length; i++) {
    ctxt += colourListTxt(i,colourNameList[i].value,colourCodeList[i].value)
  }
  ctxt += colourListTxt(colourNameList.length,colourName,colourCode)
  document.getElementById("colourList").innerHTML = ctxt
}

function removeColour(id) {
  document.getElementById(`colour${id}`).remove();
}

function saveJSON() {
  let colourJson = {};
  var colourNameList = document.getElementsByClassName("colourName");
  var colourCodeList = document.getElementsByClassName("colourCode");
  for (var i = 0; i < colourNameList.length; i++) {
    colourJson[colourNameList[i].value] = colourCodeList[i].value;}
  let blob = new Blob([JSON.stringify(colourJson)], {type: "text/plain;charset=utf-8"});
  saveAs(blob, "colour.json");
}
