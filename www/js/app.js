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

    var tabs = UI.tabs.tabChildren;
    tab = tabs[1];

    var Connect = new XMLHttpRequest();
    Connect.open("GET", "data/schedule.xml", false);
    Connect.setRequestHeader("Content-Type", "text/xml");
    Connect.send(null);
    TheDocument = Connect.responseXML;
    TheDocumentConference = TheDocument.getElementsByTagName("conference");
    TheDocumentDay = TheDocument.getElementsByTagName("day");
    TheDocumentEvents = TheDocument.getElementsByTagName("event");

    $('#info-evenement').html(getConferenceInfos());
    $('#decompte').html(rebour());
    setInterval(function(){$('#decompte').html(rebour());}, "1000");
    refreshMyConfList();
    $('#all-conf-list').html(getConfList());
    $('#all-speakers-list').html(createSpeakersHtml());
    $('#calendar').fullCalendar({
        lang: 'fr',
        header: {
            left: 'prev,next today',
            center: 'title',
            right:'',
        },
        contentHeight: 600,
        defaultDate: getFCdefaultDate(),
        defaultView: 'agendaDay',
        editable: false,
        allDaySlot: false,
        slotEventOverlap: false,
        minTime: "09:00:00",
        maxTime: "20:00:00",
        eventClick: function(event) {
            if (event.id){
                displayMyConfInfo( event.id );
            }
        }
    });
    $('.fc-toolbar .fc-left').prepend(
        $('<button type="button" class="fc-button fc-state-default fc-corner-left fc-corner-right">Rafraîchir</button>')
            .on('click', function() {
                refreshCalendar()
            })
    );
    initCalendar();
    tab.addEventListener("click", function() {
        $('#calendar').fullCalendar('render');
    });
});

function getFCdefaultDate(){
    var TheDocumentConference = TheDocument.getElementsByTagName("conference");
    var start = TheDocumentConference[0].getElementsByTagName("start")[0].childNodes[0].nodeValue;
    return start;
}

function getEventSource( confid ){
    var i = getEventById(TheDocumentEvents,confid);
    var confTitle = TheDocumentEvents[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
    var day = TheDocumentEvents[i].parentElement.parentElement.getAttribute("date");
    var start = TheDocumentEvents[i].getElementsByTagName("start")[0].childNodes[0].nodeValue;
    var duration = TheDocumentEvents[i].getElementsByTagName("duration")[0].childNodes[0].nodeValue;
    var startDate = moment(day + " " + start, "YYYY-MM-DD HH:mm");
    var startDate2 = moment(day + " " + start, "YYYY-MM-DD HH:mm");
    var durationTime = moment.duration(duration);
    var endDate = startDate2.add(durationTime);
    var eventsource = [confid, confTitle, startDate.utcOffset(60), endDate.utcOffset(60)];
    return eventsource;
}

function addEventToCalendar(confid){
    var eventsource = getEventSource(confid);
    $('#calendar').fullCalendar( 'addEventSource', [{
                                                        id: eventsource[0],
                                                        title: eventsource[1],
                                                        start: eventsource[2],
                                                        end: eventsource[3]
                                                    }]
                                );
    //refreshCalendar();
}

function delEventFromCalendar(confid){
    $('#calendar').fullCalendar( 'removeEvents', confid);
    //refreshCalendar();
}

function delAllEventsFromCalendar(){
    $('#calendar').fullCalendar( 'removeEvents');
    //refreshCalendar();
}

function refreshCalendar(){
    //tab.addEventListener("click", function() {
    //    console.log("tab clicked");
    //    $('#calendar').fullCalendar('render');
    //});
    $('#calendar').fullCalendar( 'addEventSource', [{
                                                        id: "0000",
                                                        title: 'Meeting',
                                                        start: '2015-02-12T10:30:00',
                                                        end: '2015-02-12T12:30:00'
                                                    }]
                                );
    $('#calendar').fullCalendar( 'removeEvents', "0000");

    //$('#calendar').fullCalendar('render');
}

function initCalendar(){
    if(typeof(Storage) !== "undefined") {
            //console.log("Good ! Storage is not undefined");
            if (localStorage.myconf) {
                console.log("Good ! localStorage.myconf exist : " + localStorage.myconf);
                var myconfsplit = localStorage.myconf.split(" ");
                for(var s = myconfsplit.length; s--;){
                    if (myconfsplit[s] === "") {
                        myconfsplit.splice(s, 1);
                    }
                }
                for(i=0;i<myconfsplit.length; i++){
                    addEventToCalendar(myconfsplit[i]);
                }
            }
    }
}

function rebour(){
    var date1 = new Date();
    var date2 = new Date ("Nov 21, 2015 09:00:00");
    var sec = (date2 - date1) / 1000;
    var n = 24 * 3600;
    if (sec > 0) {
      j = Math.floor (sec / n);
      h = Math.floor ((sec - (j * n)) / 3600);
      mn = Math.floor ((sec - ((j * n + h * 3600))) / 60);
      sec = Math.floor (sec - ((j * n + h * 3600 + mn * 60)));
      var mot_jour = 'j';
      var mot_heure = 'h';
      var mot_minute = 'min';
      var mot_seconde = 's';
      if (j == 0){
          j = '';
          mot_jour = '';
      }
      if (h == 0){
          h = '';
          mot_heure = '';
      }
      if (mn == 0){
          mn = '';
          mot_minute = '';
      }
      if (sec == 0){
    s = '';
        mot_seconde = '';
        et = '';
      }
  }
  var res = j + ' ' + mot_jour + ' ' + h + ' ' + mot_heure + ' ' + mn + ' ' + mot_minute + ' ' + sec + ' ' + mot_seconde;
  return res
}

function getConferenceInfos(){
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
    for (d=0;d<TheDocumentDay.length;d++){
        var confdate = TheDocumentDay[d].getAttribute('date');
        var dayid = TheDocumentDay[d].getAttribute('index');
        res += "<button data-role='button' class='secondary positive' onclick='displayConfDay(" + dayid + ")'>" + confdate + "</button><br><br>";
        res += "<div id='conf-of-day" + dayid + "' style='display: none'>";
        var TheDocumentEventsByDay = TheDocumentDay[d].getElementsByTagName("event");
        for (i=0;i<TheDocumentEventsByDay.length;i++) {
            var conftitle = TheDocumentEventsByDay[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
            var confid = TheDocumentEventsByDay[i].getAttribute('id');
            if (isConfProg(confid)){
                res += "<div><section data-role='event' class='positive' id='conf-title"+ confid +"' onclick='displayConfInfo(" + confid + ")'>" + conftitle + "</section>";
            } else{
                res += "<div><section data-role='event' class='negative' id='conf-title"+ confid +"' onclick='displayConfInfo(" + confid + ")'>" + conftitle + "</section>";
            }
            res += "<div id='conf-info" + confid + "' style='display: none'></div></div>";
         }
        res += "</div>"
    }
    return res;
}

function getEventById(doc,confid){
    for (j=0;j<doc.length;j++){
        if(doc[j].getAttribute('id') === confid.toString()){
            var i = j;
        }
    }
    return i;
}

function getEventInfo( confid ){
    var i = getEventById(TheDocumentEvents,confid);
    var confTitle = TheDocumentEvents[i].getElementsByTagName("title")[0].childNodes[0].nodeValue;
    var eventSpeakers = TheDocumentEvents[i].getElementsByTagName("persons");
    var eventLinks = TheDocumentEvents[i].getElementsByTagName("links");
    if(typeof(TheDocumentEvents[i].getElementsByTagName("start")[0].childNodes[0]) !== "undefined") {
      var confStart = TheDocumentEvents[i].getElementsByTagName("start")[0].childNodes[0].nodeValue;
    }
    if(typeof(TheDocumentEvents[i].getElementsByTagName("duration")[0].childNodes[0]) !== "undefined") {
      var confDuration = TheDocumentEvents[i].getElementsByTagName("duration")[0].childNodes[0].nodeValue;
    }
    if(typeof(TheDocumentEvents[i].getElementsByTagName("room")[0].childNodes[0]) !== "undefined") {
      var confRoom = TheDocumentEvents[i].getElementsByTagName("room")[0].childNodes[0].nodeValue;
    }
    if(typeof(TheDocumentEvents[i].getElementsByTagName("track")[0].childNodes[0]) !== "undefined") {
      var confTrack = TheDocumentEvents[i].getElementsByTagName("track")[0].childNodes[0].nodeValue;
    }
    if(typeof(TheDocumentEvents[i].getElementsByTagName("abstract")[0].childNodes[0]) !== "undefined") {
      var confAbstract = TheDocumentEvents[i].getElementsByTagName("abstract")[0].childNodes[0].nodeValue;
    }
    if(typeof(TheDocumentEvents[i].getElementsByTagName("description")[0].childNodes[0]) !== "undefined") {
      var confDescription = TheDocumentEvents[i].getElementsByTagName("description")[0].childNodes[0].nodeValue;
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
    var speakersArray = [];
    var TheDocumentSpeakers = TheDocument.getElementsByTagName("person");
    for(i=0;i<TheDocumentSpeakers.length;i++){
        var speaker = TheDocumentSpeakers[i].childNodes[0].nodeValue;
        if(speakersArray.indexOf(speaker) === -1){
            speakersArray.push(speaker);
        }
    }
    return speakersArray;
}

function createSpeakersHtml(){
    var speakersList = getSpeakersList();
    speakersList.sort();
    var res = '';
    for(i=0;i<speakersList.length;i++){
        res += "<section data-role='speaker' id='speaker-id"+ i +"' onclick=''>" + speakersList[i] + "</section>";
    }
    return res;
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

function isConfProg(confid){
    var confIsprog = false;
    if (localStorage.myconf) {
        var myconfsplit = localStorage.myconf.split(" ");
        for(var s = myconfsplit.length; s--;){
            if (myconfsplit[s] === "") {
                myconfsplit.splice(s, 1);
            }
        }
        if(myconfsplit.indexOf(confid) >= 0){
            confIsprog = true;
        } else {
            confIsprog = false;
        }
    }
    return confIsprog;
}

function displayConfInfo( id ){
    var res = getEventInfo( id );
    if (isConfProg(id.toString())){
        res += "<button id='bt-addconf-"+ id + "' data-role='button' class='negative' onclick='delConf(" + id + ")'>Conférence programmée</button>";
    } else {
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

function scrollToElement(el, ms){
    var speed = (ms) ? ms : 600;
    $('html,body').animate({
        scrollTop: $(el).offset().top
    }, speed);
}

function displayMyConfInfo( confid ){
    var res = getEventInfo( confid );
    res += "<button data-role='button' class='negative' onclick='delConf(" + confid + ")'>Supprimer du programme</button><br><br>";
    $("#myconf-info"+confid).html(res);
    var ele = document.getElementById("myconf-info"+confid);
    if(ele.style.display === "block") {
      ele.style.display = "none";
    } else {
      ele.style.display = "block";
    }
    scrollToElement("#myeventid-"+confid,600);
}

function refreshMyConfList(){
    if(typeof(Storage) !== "undefined") {
        //console.log("Good ! Storage is not undefined");
        if (localStorage.myconf) {
            console.log("Good ! localStorage.myconf exist : " + localStorage.myconf);
            var myconfsplit = localStorage.myconf.split(" ");
            for(var s = myconfsplit.length; s--;){
                if (myconfsplit[s] === "") {
                    myconfsplit.splice(s, 1);
                }
            }
            $("#my-conf-list").html('');
            for (i=0; i < myconfsplit.length; i++){
                var res='';
                var confid = myconfsplit[i];
                var j = getEventById(TheDocumentEvents,confid);
                if(typeof(j) !== "undefined"){
                    var conftitle = TheDocumentEvents[j].getElementsByTagName("title")[0].childNodes[0].nodeValue;
                    res += "<div id='myeventid-" + confid + "'><section data-role='event' class='positive' id='myconf-title"+ confid +"' onclick='displayMyConfInfo(" + confid + ")'>" + conftitle + "</section>";
                    res += "<div id='myconf-info" + confid + "' style='display: none'></div></div>";
                    $("#my-conf-list").append(res);
                }
            }
        } else {
            $("#my-conf-list").html('');
            console.log("localStorage.myconf does not exist");
        }
    }
}

function addConf( confid ){
    if(typeof(Storage) !== "undefined") {
        if (localStorage.myconf) {
            if(localStorage.myconf.indexOf(confid.toString()) === -1) {
                localStorage.myconf = localStorage.myconf + ' ' + confid.toString() + ' ';
                addEventToCalendar(confid);
                console.log("Event added");
            } else {
                console.log("Event already added");
            }
        } else {
            localStorage.myconf =  ' ' + confid.toString() + ' ';
            addEventToCalendar(confid);
            console.log("List empty : Event added");
        }
    }
    //console.log(localStorage.myconf);
    $("#conf-title"+ confid).attr('class', 'positive');
    $("#bt-addconf-"+confid).html("Conférence programmée");
    $("#bt-addconf-"+confid).attr('class', 'negative');
    $("#bt-addconf-"+confid).attr('onclick', 'delConf("'+ confid +'")');
    refreshMyConfList();
}

function delConf( confid ){
    console.log("Del Event : " + confid);
    if(typeof(Storage) !== "undefined") {
        console.log("Good ! Storage is not undefined");
        if (localStorage.myconf) {
            console.log("Current Storage" + localStorage.myconf);
            var mynewconf = localStorage.myconf.replace(' ' + confid.toString() + ' ','');
            localStorage.myconf = mynewconf;
            console.log("New Storage" + localStorage.myconf);
            delEventFromCalendar(confid);
        }
    }
    $("#myeventid-"+ confid).remove();
    $("#conf-title"+ confid).attr('class', 'negative');
    $("#bt-addconf-"+confid).html("Ajouter à mon programme");
    $("#bt-addconf-"+confid).attr('class', 'negative');
    $("#bt-addconf-"+confid).attr('onclick', 'addConf("'+ confid +'")');
}

function displayDialog1( ){
    $('html,body').animate({scrollTop: 0}, 'fast');
    var ele = document.getElementById("dialog1");
    if(ele.style.display === "block") {
      ele.style.display = "none";
    }
    else {
      ele.style.display = "block";
    }
}

function delAllConf(  ){
    displayDialog1( );
    if(typeof(Storage) !== "undefined") {
        localStorage.clear();
    }
    delAllEventsFromCalendar();
    refreshMyConfList();
    $('#all-conf-list').html(getConfList( ));
}
