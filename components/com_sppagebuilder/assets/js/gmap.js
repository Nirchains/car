/**
* @package SP Page Builder
* @author JoomShaper http://www.joomshaper.com
* @copyright Copyright (c) 2010 - 2020 JoomShaper
* @license http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 or later
*/

function initSPPageBuilderGMap(doc) {
    var ConvertToBaseSixFour = {
        _keyStr: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
        decode: function(e) {
            var t = "";
            var n, r, i;
            var s, o, u, a;
            var f = 0;
            e = e.replace(/[^A-Za-z0-9+/=]/g, "");
            while (f < e.length) {
                s = this._keyStr.indexOf(e.charAt(f++));
                o = this._keyStr.indexOf(e.charAt(f++));
                u = this._keyStr.indexOf(e.charAt(f++));
                a = this._keyStr.indexOf(e.charAt(f++));
                n = s << 2 | o >> 4;
                r = (o & 15) << 4 | u >> 2;
                i = (u & 3) << 6 | a;
                t = t + String.fromCharCode(n);
                if (u != 64) {
                    t = t + String.fromCharCode(r)
                }
                if (a != 64) {
                    t = t + String.fromCharCode(i)
                }
            }
            t = ConvertToBaseSixFour._utf8_decode(t);
            return t
        },
        _utf8_decode: function(e) {
            var t = "";
            var n = 0;
            var r = c1 = c2 = 0;
            while (n < e.length) {
                r = e.charCodeAt(n);
                if (r < 128) {
                    t += String.fromCharCode(r);
                    n++
                } else if (r > 191 && r < 224) {
                    c2 = e.charCodeAt(n + 1);
                    t += String.fromCharCode((r & 31) << 6 | c2 & 63);
                    n += 2
                } else {
                    c2 = e.charCodeAt(n + 1);
                    c3 = e.charCodeAt(n + 2);
                    t += String.fromCharCode((r & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
                    n += 3
                }
            }
            return t
        }
    };
    jQuery('.sppb-addon-gmap-canvas', doc).each(function(index) {
        var mapId = jQuery(this).attr('id'),
        zoom = Number(jQuery(this).attr('data-mapzoom')),
        infowindow = jQuery(this).attr('data-infowindow'),
        mousescroll = (jQuery(this).attr('data-mousescroll') === 'true') ? true : false,
        showControll = (jQuery(this).attr('data-show-controll') === 'true') ? true : false,
        maptype = jQuery(this).attr('data-maptype'),
        latlng = { lat: Number(jQuery(this).attr('data-lat')), lng: Number(jQuery(this).attr('data-lng')) };

        var map = new google.maps.Map(doc.getElementById(mapId), {
            center: new google.maps.LatLng(latlng),
            zoom: zoom,
            scrollwheel: mousescroll,
            disableDefaultUI: showControll,
        });

        if(jQuery(this).attr('data-location') !== undefined){

            var prevLatitude = jQuery(this).attr('data-lat');
            var prevLongitude = jQuery(this).attr('data-lng');
            var prevInfoText = ConvertToBaseSixFour.decode(infowindow);
            var prevLocation = JSON.stringify([{address: prevInfoText, latitude: prevLatitude, longitude: prevLongitude}]);

            var locationsArr =ConvertToBaseSixFour.decode(jQuery(this).attr('data-location'));

            var locationPrevJson = JSON.parse(prevLocation);
            var locationNewJson = JSON.parse(locationsArr);

            var combinedLocation = locationPrevJson.concat(locationNewJson);

            var tempLocation = [];
            for(var i = 0; i < combinedLocation.length; i++) {
                var obj = combinedLocation[i];
                tempLocation.push([obj.address]+';'+[obj.latitude]+';'+[obj.longitude]);
            }
            var anotherLocation = [];
            for(var j = 0; j < tempLocation.length; j++){
                anotherLocation.push(tempLocation[j].split(';'));
            }
            
            var locations = anotherLocation;
            
            var infowindow = new google.maps.InfoWindow();
            
            var marker, i;
            
            for (i = 0; i < locations.length; i++) {  
                marker = new google.maps.Marker({
                    position: new google.maps.LatLng(locations[i][1], locations[i][2]),
                    map: map
                });
                
                google.maps.event.addListener(marker, 'click', (function(marker, i) {
                    return function() {
                        if(locations[i][0]){
                            infowindow.setContent(locations[i][0]);
                            infowindow.open(map, marker);
                        }
                    }
                })(marker, i));
            }
            
        }
        map.setMapTypeId(google.maps.MapTypeId[maptype]);
    });
};

jQuery(window).on("load", function() {
    initSPPageBuilderGMap(document);
});
