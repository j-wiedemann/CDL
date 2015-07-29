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
    $('#my-conf-list').html(initMyConfList());
    refreshMyConfList();

    $('#all-conf-list').html(getConfList(TheDocument));

});

function getConferenceInfos(){
    var TheDocumentConference = TheDocument.getElementsByTagName("conference");
    var title = TheDocumentConference[0].getElementsByTagName("title")[0].childNodes[0].nodeValue;
    var venue = TheDocumentConference[0].getElementsByTagName("venue")[0].childNodes[0].nodeValue;
    var city = TheDocumentConference[0].getElementsByTagName("city")[0].childNodes[0].nodeValue;
    var start = TheDocumentConference[0].getElementsByTagName("start")[0].childNodes[0].nodeValue;
    var end = TheDocumentConference[0].getElementsByTagName("end")[0].childNodes[0].nodeValue;
    var res = '<p>Lieu : '+ venue + ' à '+ city +'</p>';
    res += '<p>Du ' + start + ' au ' + end + '</p>';
    return res
}

function getConfList( ){
    var res ='';
    var TheDocumentDay = TheDocument.getElementsByTagName("day");
    for (d=0;d<TheDocumentDay.length;d++){
        var confdate = TheDocumentDay[d].getAttribute('date');
        var dayid = TheDocumentDay[d].getAttribute('index');
        res += "<button data-role='button' class='secondary positive' onclick='displayConfDay(" + dayid + ")'>" + confdate + "</button><br><br>";
        res += "<div id='conf-of-day" + dayid + "' style='display: none'>"
        var TheDocumentEvent = TheDocumentDay[d].getElementsByTagName("event");
        for (i=0;i<TheDocumentEvent.length;i++) {
            var conftitle = TheDocumentEvent[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
            var confid = TheDocumentEvent[i].getAttribute('id');
            res += "<div><h2 id='conf-title"+ confid +"' onclick='displayConfInfo(" + confid + ")'><strong>" + conftitle + "</strong></h2>";
            res += "<div id='conf-info" + confid + "' style='display: none'></div><hr width='75%' align=left></div>";
         }
        res += "</div>"
    }
    return res;
}

function getEventById(TheDocumentEvent,confid){
    for (j=0;j<TheDocumentEvent.length;j++){
        if(TheDocumentEvent[j].getAttribute('id') === confid.toString()){
            var i = j;
        }
    }
    return i;
}

function getEventInfo( confid ){
    var TheDocumentEvent = TheDocument.getElementsByTagName("event");
    var i = getEventById(TheDocumentEvent,confid);
    var confTitle = TheDocumentEvent[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
    var eventSpeakers = TheDocumentEvent[i].getElementsByTagName("persons");
    var eventLinks = TheDocumentEvent[i].getElementsByTagName("links");
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
    res += '</p>';
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
    for (j=0;j<eventLinks[0].getElementsByTagName("link").length;j++) {
        var link = eventLinks[0].getElementsByTagName("link")[j].getAttribute("href");
        var linkdesc = eventLinks[0].getElementsByTagName("link")[j].childNodes[0].nodeValue;
        res += '<a href="' + link + '">'+ linkdesc+'</a><br>';
    }
    res += '</p>';
    return res;
}

function getSpeakersList(){
    var TheDocumentSpeakers = TheDocument.getElementsByTagName("person");
    console.log(TheDocumentSpeakers);
}

function displayConfDay( i ){
    var ele = document.getElementById("conf-of-day"+i);
    if(ele.style.display === "block") {
      ele.style.display = "none";
    }
    else {
      ele.style.display = "block";
    }
}

function displayMyConfDay( i ){
    var ele = document.getElementById("myconf-of-day"+i);
    if(ele.style.display === "block") {
      ele.style.display = "none";
    }
    else {
      ele.style.display = "block";
    }
}

function displayConfInfo( id ){
    if (localStorage.myconf) {
        console.log("Good ! localStorage.myconf exist : " + localStorage.myconf);
        var myconfsplit = localStorage.myconf.split(" ");
        for(var s = myconfsplit.length; s--;){
            if (myconfsplit[s] === "") {
                myconfsplit.splice(s, 1);
            }
        }
    }
    var res = getEventInfo( id );
    for (i=0; i < myconfsplit.length; i++){
        var confid = myconfsplit[i];
        if(confid === id.toString()){
            res += "<button id='bt-addconf-"+ id + "' data-role='button' class='negative' onclick='addConf(" + id + ")'>Conférence programmée</button>";
            var confisprog = "ok";
        }
    }
    if(confisprog !== "ok"){
        res += "<button id='bt-addconf-"+ id + "' data-role='button' class='negative' onclick='addConf(" + id + ")'>Ajouter à mon programme</button>";
    }
    $("#conf-info"+id).html(res);
    var ele = document.getElementById("conf-info"+id);
    if(ele.style.display === "block") {
      ele.style.display = "none";
    } else {
      ele.style.display = "block";
    }
}

function displayMyConfInfo( i ){
    var res = getEventInfo( i );
    res += "<button data-role='button' class='negative' onclick='delConf(" + i + ")'>Supprimer du programme</button>";
    $("#myconf-info"+i).html(res);
    var ele = document.getElementById("myconf-info"+i);
    if(ele.style.display === "block") {
      ele.style.display = "none";
    } else {
      ele.style.display = "block";
    }
}

function makeDateString() {
      var d = new Date();
      var dString = d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
      return dString;
}

function initMyConfList(){
    var res = '';
    var TheDocumentDay = TheDocument.getElementsByTagName("day");
    for (d=0;d<TheDocumentDay.length;d++){
        var confdate = TheDocumentDay[d].getAttribute('date');
        var dayid = TheDocumentDay[d].getAttribute('index');
        res += "<button data-role='button' class='secondary positive' onclick='displayMyConfDay(" + dayid + ")'>" + confdate + "</button><br><br>";
        res += "<div id='myconf-of-day" + dayid + "' style='display: none'>";
        var start = new Date("October 13, 2014 09:00:00");
        var halfhour = new Date(3600*500);
        for (i=0;i<20;i++){
            var min = start.getMinutes();
            var hour = start.getHours();
            if(min.toString().length < 2){
                min = "0"+min.toString();
            }
            res += "<p style='text-align:center'>----- "+ hour + ":" + min + " -----</p>";
            if(hour.toString().length < 2){
                hour = "0"+hour.toString();
            }
            res += "<div id='day"+ dayid + "h" + hour + min + "'></div>";
            start = new Date(start.getTime() + halfhour.getTime());
        }
        res += "</div>";
    }
    return res
}

function refreshMyConfList(){
    /*$('#my-conf-list').html(initMyConfList());*/
    if(typeof(Storage) !== "undefined") {
        console.log("Good ! Storage is not undefined");
        if (localStorage.myconf) {
            console.log("Good ! localStorage.myconf exist : " + localStorage.myconf);
            var myconfsplit = localStorage.myconf.split(" ");
            for(var s = myconfsplit.length; s--;){
                if (myconfsplit[s] === "") {
                    myconfsplit.splice(s, 1);
                }
            }
            var TheDocumentDay = TheDocument.getElementsByTagName("day");
            for (d=0;d<TheDocumentDay.length;d++){
                var confdate = TheDocumentDay[d].getAttribute('date');
                var dayid = TheDocumentDay[d].getAttribute('index');
                var TheDocumentEvent = TheDocumentDay[d].getElementsByTagName("event");
                for (i=0; i < myconfsplit.length; i++){
                    var confid = myconfsplit[i];
                    var j = getEventById(TheDocumentEvent,confid);
                    var res = '';
                    if(typeof(j) !== "undefined"){
                        var conftitle = TheDocumentEvent[j].getElementsByTagName("title")[0].childNodes[0].nodeValue;
                        var start = TheDocumentEvent[j].getElementsByTagName("start")[0].childNodes[0].nodeValue;
                        var startsplit = start.split(":");
                        if(startsplit[1]>=30){
                            start = startsplit[0] + "30";
                        } else {
                            start = startsplit[0] + "00";
                        }
                        res += "<div id='myeventid-" + confid + "'><h2 id='myconf-title"+ confid +"' onclick='displayMyConfInfo(" + confid + ")'><strong>" + conftitle + "</strong></h2>";
                        res += "<div id='myconf-info" + confid + "' style='display: none'></div><hr width='75%' align=left></div>";
                        $("#day"+ dayid + "h" + start).html(res)
                    }
                }
            }
        } else {
            console.log("localStorage.myconf does not exist");
        }
    }
}

function addConf( i ){
    if(typeof(Storage) !== "undefined") {
        if (localStorage.myconf) {
            if(localStorage.myconf.indexOf(i.toString()) === -1) {
                console.log("Event added");
                localStorage.myconf = localStorage.myconf + ' ' + i.toString() + ' ';
            } else {
                console.log("Event already added");
            }
        } else {
            localStorage.myconf =  ' ' + i.toString() + ' ';
            console.log("List empty : Event added");
        }
    }
    console.log(localStorage.myconf);
    var res = "<button id='bt-addconf-"+ i + "' data-role='button' class='secondary positive' onclick='addConf(" + i + ")'>Déjà programmée</button>";
    $("#bt-addconf-"+i).html("Conférence programmée");
    $("#bt-addconf-"+i).attr('class', 'secondary negative');
    refreshMyConfList();
}

function delConf( i ){
    console.log("Del Event : " + i);
    if(typeof(Storage) !== "undefined") {
        console.log("Good ! Storage is not undefined");
        if (localStorage.myconf) {
            console.log("Current Storage" + localStorage.myconf);
            var mynewconf = localStorage.myconf.replace(' ' + i.toString() + ' ','');
            localStorage.myconf = mynewconf;
            console.log("New Storage" + localStorage.myconf);
        }
    }
    /*var div = document.getElementById("myeventid-" + i);
    div.parentNode.removeChild(div);*/
    $("#myeventid-"+ i).remove();
}

function displayDialog1( ){
    var ele = document.getElementById("dialog1");
    if(ele.style.display === "block") {
      ele.style.display = "none";
    }
    else {
      ele.style.display = "block";
    }
}

function delAllConf(  ){
    /*
    <div data-role="dialog" id="dialog1" style="display: block">
                    <section>
                        <h1>Simple Dialog</h1>
                        <!-- this heading is optional -->
                        <p>Are you sure you want to delete this file?</p>
                        <menu>
                            <button data-role="button" class="negative" id="no">Cancel</button>
                            <button data-role="button" id="yes">Delete</button>
                        </menu>
                    </section>
                </div>*/
    displayDialog1( );
    if(typeof(Storage) !== "undefined") {
        localStorage.clear();
    }
    $('#my-conf-list').html(initMyConfList());
}
