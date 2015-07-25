/*
 * Copyright (C) 2014 Canonical
 * Author: Kyle Nitzsche <kyle.nitzsche@canonical.com>
 *
 * This package is free software; you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as 
 * published by the Free Software Foundation; either version 3 of the 
 * License, or
 * (at your option) any later version.
 *
 * This package is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public 
 * License along with this program. If not, see 
 * <http://www.gnu.org/licenses/>
 */

/*
 * Wait before the DOM has been loaded before initializing the Ubuntu UI layer
 * Using http://glosbe.com/a-api to get data
 */
$( document ).ready(function() {
    var UI = new UbuntuUI();
    UI.init();

    var Connect = new XMLHttpRequest();
    Connect.open("GET", "data/schedule.xml", false);
    Connect.setRequestHeader("Content-Type", "text/xml");
    Connect.send(null);
    TheDocument = Connect.responseXML;

    $('#info-evenement').html(getConferenceInfos());
    /*$('#currentdate').html(makeDateString());*/
    $('#my-conf-list').html(refreshMyConfList());

    $('#all-conf-list').html(getConfList(TheDocument));

});

function getConferenceInfos(){
    var TheDocumentConference = TheDocument.getElementsByTagName("conference");
    var title = TheDocumentConference[0].getElementsByTagName("title")[0].childNodes[0].nodeValue;
    var venue = TheDocumentConference[0].getElementsByTagName("venue")[0].childNodes[0].nodeValue;
    var city = TheDocumentConference[0].getElementsByTagName("city")[0].childNodes[0].nodeValue;
    var start = TheDocumentConference[0].getElementsByTagName("start")[0].childNodes[0].nodeValue;
    var end = TheDocumentConference[0].getElementsByTagName("end")[0].childNodes[0].nodeValue;
    var res = '<h1>'+ title + '</h1>';
    res += '<p>Lieu : '+ venue + '</p>';
    res += '<p>À : ' + city + '</p>';
    res += '<p>Du : ' + start + ' au : ' + end + '</p>';
    return res
}

function getConfList( ){
    var res ='';
    var TheDocumentRoom = TheDocument.getElementsByTagName("event");
    for (i=0;i<TheDocumentRoom.length;i++) {
        var conftitle = TheDocumentRoom[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
        res += "<div><h2 id='conf-title"+ i +"' onclick='displayConfInfo(" + i + ")'>" + conftitle + "</h2>";
        res += "<div id='conf-info" + i + "' style='display: none'></div><hr width='75%' align=left></div>";
      }
    return res;
};

function getEventInfo( i ){
    var TheDocumentEvent = TheDocument.getElementsByTagName("event");
    var confTitle = TheDocumentEvent[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
    var eventSpeakers = TheDocumentEvent[i].getElementsByTagName("persons");
    if(typeof(TheDocumentEvent[i].getElementsByTagName("start")[0].childNodes[0]) !== "undefined") {
      var confStart = TheDocumentEvent[i].getElementsByTagName("start")[0].childNodes[0].nodeValue;
    }
    if(typeof(TheDocumentEvent[i].getElementsByTagName("duration")[0].childNodes[0]) !== "undefined") {
      var confDuration = TheDocumentEvent[i].getElementsByTagName("duration")[0].childNodes[0].nodeValue;
    }
    if(typeof(TheDocumentEvent[i].getElementsByTagName("room")[0].childNodes[0]) !== "undefined") {
      var confRoom = TheDocumentEvent[i].getElementsByTagName("room")[0].childNodes[0].nodeValue;
    }
    if(typeof(TheDocumentEvent[i].getElementsByTagName("track")[0].childNodes[0]) !== "undefined") {
      var confTrack = TheDocumentEvent[i].getElementsByTagName("track")[0].childNodes[0].nodeValue;
    }
    if(typeof(TheDocumentEvent[i].getElementsByTagName("abstract")[0].childNodes[0]) !== "undefined") {
      var confAbstract = TheDocumentEvent[i].getElementsByTagName("abstract")[0].childNodes[0].nodeValue;
    }
    if(typeof(TheDocumentEvent[i].getElementsByTagName("description")[0].childNodes[0]) !== "undefined") {
      var confDescription = TheDocumentEvent[i].getElementsByTagName("description")[0].childNodes[0].nodeValue;
    }
    var res = '<p>Par :';
    for (j=0;j<eventSpeakers[0].getElementsByTagName("person").length;j++) {
        var speaker = eventSpeakers[0].getElementsByTagName("person")[j].childNodes[0].nodeValue;
        if(j>0){
          res += ' et ' + speaker;
        }
        else {
          res += ' ' + speaker;
        }
    }
    res += '</p>'
    if(confStart && confDuration) {
        res += '<p>Début : '+ confStart + ' - Durée : ' + confDuration + '</p>';
    }
    if(confTrack && confRoom) {
        res += '<p>Track : '+ confTrack + ' - Salle : ' + confRoom + '</p>';
    }
    if(confAbstract) {
      res += '<p>'+ confAbstract + '</p>';
    }
    if(confDescription) {
      res += '<p>'+ confDescription + '</p>';
    }
    return res
}

function getSpeakersList(){
    var TheDocumentSpeakers = TheDocument.getElementsByTagName("person");
    console.log(TheDocumentSpeakers);
};

function displayConfInfo( i ){
    var res = getEventInfo( i );
    res += "<button data-role='button' class='positive' onclick='addConf(" + i + ")'>Ajouter à mon programme</button>"
    $("#conf-info"+i).html(res);
    var ele = document.getElementById("conf-info"+i);
    var text = document.getElementById("conf-title"+i);
    if(ele.style.display === "block") {
      ele.style.display = "none";
    }
    else {
      ele.style.display = "block";
    }
};

function displayMyConfInfo( i ){
    var res = getEventInfo( i );
    res += "<button data-role='button' class='negative positive' onclick='delConf(" + i + ")'>Suprimmer du programme</button>"
    $("#myconf-info"+i).html(res);
    var ele = document.getElementById("myconf-info"+i);
    var text = document.getElementById("myconf-title"+i);
    if(ele.style.display === "block") {
      ele.style.display = "none";
    }
    else {
      ele.style.display = "block";
    }
};

function makeDateString() {
      var d = new Date();
      var dString = d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
      return dString;
};

function refreshMyConfList(){
    var res = ''
    if(typeof(Storage) !== "undefined") {
        if (localStorage.myconf) {
            var myconfsplit = localStorage.myconf.split(" ");
            for(var i = myconfsplit.length; i--;){
                if (myconfsplit[i] === "") {
                    myconfsplit.splice(i, 1)
                }
            };
            var TheDocumentRoom = TheDocument.getElementsByTagName("event");
            for (i=0; i < myconfsplit.length; i++){
                var confid = myconfsplit[i]
                var conftitle = TheDocumentRoom[confid].getElementsByTagName("title")[0].childNodes[0].nodeValue;
                res += "<div><h2 id='myconf-title"+ confid +"' onclick='displayMyConfInfo(" + confid + ")'>" + conftitle + "</h2>";
                res += "<div id='myconf-info" + confid + "' style='display: none'></div><hr width='75%' align=left></div>";
            }
            $("#my-conf-list").html(res);
        } else {
            $("#my-conf-list").html("Pas de conférences.");
        }
    }
}

function addConf( i ){
    if(typeof(Storage) !== "undefined") {
        if (localStorage.myconf) {
            localStorage.myconf = localStorage.myconf + ' ' + i.toString() + ' ';
        } else {
            localStorage.myconf =  ' ' + i.toString() + ' ';
        }
    }
    refreshMyConfList()
};

function delConf( i ){
    if(typeof(Storage) !== "undefined") {
        if (localStorage.myconf) {
            var mynewconf = localStorage.myconf.replace(' ' + i.toString() + ' ','');
            localStorage.myconf = mynewconf;
        }
    }
    refreshMyConfList()
};

function delAllConf(  ){
    if(typeof(Storage) !== "undefined") {
        localStorage.clear();
    }
    refreshMyConfList()
};
