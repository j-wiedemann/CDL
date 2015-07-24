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

    UI.button('lookup').click(function () {
        var lookup = document.getElementById('word').value;
        var url = "http://glosbe.com/gapi/translate?from=eng&dest=eng&format=json&phrase=" + lookup + "&pretty=true";

        $.ajax({
            type: 'GET',
            url: url,
            success: success,
            dataType:'jsonp',
            contentType: "application/json"
        });
    });

    var Connect = new XMLHttpRequest();
    Connect.open("GET", "schedule.xml", false);
    Connect.setRequestHeader("Content-Type", "text/xml");
    Connect.send(null);
    TheDocument = Connect.responseXML;
    console.log(TheDocument)

    $('#currentdate').html(makeDateString());

    $('#roomlist').html(getroom(TheDocument));

});

function success( data ){
    var resEl = document.getElementById('res');
    var res ='<header>Meanings</header><ul>';

    if (! data.tuc) {
        return;
    }
    for ( var idx1 = 0; idx1 < data.tuc.length; idx1++ ) {
        if ( data.tuc[idx1].meanings ) {
            for ( var idx2 = 0; idx2 < data.tuc[idx1].meanings.length; idx2++ ) {
                if ( data.tuc[idx1].meanings[idx2].text ) {
                    res += '<li>' + data.tuc[idx1].meanings[idx2].text + '</li>';
                }
            }
        }
    }

    resEl.innerHTML = res + '</ul>';
};

function getroom( ){
    var res = '<ul>'
    var TheDocumentRoom = TheDocument.getElementsByTagName("event");
    for (i=0;i<TheDocumentRoom.length;i++) {
        var conftitle = TheDocumentRoom[i].getElementsByTagName("title")[0].childNodes[0].nodeValue
      /*res += '<li>' + 'Yeah' + '</li>';
        */
      res += "<li onclick='displayConfInfo(" + i + ")'>" + conftitle + '<br><div><span id="confinfo"></span><br><br></div></li>';
      }
    res = res + '</ul>';
    return res;
};

function displayConfInfo( i ){
    var TheDocumentEvent = TheDocument.getElementsByTagName("event");
    var confTitle = TheDocumentEvent[i].getElementsByTagName("title")[0].childNodes[0].nodeValue
    var confAbstract = TheDocumentEvent[i].getElementsByTagName("abstract")[0].childNodes[0].nodeValue
    var confDescription = TheDocumentEvent[i].getElementsByTagName("description")[0].childNodes[0].nodeValue
    var res = '<h1>'+ confTitle + '</h1>';
    res += '<p>'+ confAbstract + '</p>';
    res += '<p>'+ confDescription + '</p>';
    $('#confinfo').html(res);
    /*$('html,body').animate({scrollTop: 0}, 'slow');*/
};

function makeDateString() {
      var d = new Date();
      var dString = d.getFullYear() + "-" + d.getMonth() + "-" + d.getDate();
      return dString;
};
