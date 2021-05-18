(function (root, factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD. Register as an anonymous module.
		define(['leaflet'], factory);
	} else if (typeof modules === 'object' && module.exports) {
		// define a Common JS module that relies on 'leaflet'
		module.exports = factory(require('leaflet'));
	} else {
		// Assume Leaflet is loaded into global object L already
		factory(L);
	}
}(this, function (L) {
	'use strict';
    
	L.TileLayer.Provider = L.TileLayer.extend({
		initialize: function (arg, options) {
			var providers = L.TileLayer.Provider.providers;
            
			var parts = arg.split('.');
            
			var providerName = parts[0];
			var variantName = parts[1];
            
			if (!providers[providerName]) {
				throw 'No such provider (' + providerName + ')';
			}
            
			var provider = {
				url: providers[providerName].url,
				options: providers[providerName].options
			};
            
			// overwrite values in provider from variant.
			if (variantName && 'variants' in providers[providerName]) {
				if (!(variantName in providers[providerName].variants)) {
					throw 'No such variant of ' + providerName + ' (' + variantName + ')';
				}
				var variant = providers[providerName].variants[variantName];
				var variantOptions;
				if (typeof variant === 'string') {
					variantOptions = {
						variant: variant
					};
				} else {
					variantOptions = variant.options;
				}
				provider = {
					url: variant.url || provider.url,
					options: L.Util.extend({}, provider.options, variantOptions)
				};
			}
            
			// replace attribution placeholders with their values from toplevel provider attribution,
			// recursively
			var attributionReplacer = function (attr) {
				if (attr.indexOf('{attribution.') === -1) {
					return attr;
				}
				return attr.replace(/\{attribution.(\w*)\}/,
                function (match, attributionName) {
                    return attributionReplacer(providers[attributionName].options.attribution);
                }
                );
            };
            provider.options.attribution = attributionReplacer(provider.options.attribution);
            
            // Compute final options combining provider options with any user overrides
            var layerOpts = L.Util.extend({}, provider.options, options);
            L.TileLayer.prototype.initialize.call(this, provider.url, layerOpts);
        }
    });
    
    /**
    * Definition of providers.
    * see http://leafletjs.com/reference.html#tilelayer for options in the options map.
    */
    
    L.TileLayer.Provider.providers = {
        OpenStreetMap: {
            url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            options: {
                maxZoom: 19,
                attribution:
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            },
            variants: {
                Mapnik: {},
                BlackAndWhite: {
                    url: 'https://{s}.tiles.wmflabs.org/bw-mapnik/{z}/{x}/{y}.png',
                    options: {
                        maxZoom: 18
                    }
                },
                HOT: {
                    url: 'https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png',
                    options: {
                        attribution: '{attribution.OpenStreetMap}, Tiles courtesy of <a href="https://hot.openstreetmap.org/" target="_blank">Humanitarian OpenStreetMap Team</a>'
                    }
                },
            }
        },
        Hydda: {
            url: 'https://{s}.tile.openstreetmap.se/hydda/{variant}/{z}/{x}/{y}.png',
            options: {
                maxZoom: 18,
                variant: 'full',
                attribution: 'Tiles courtesy of <a href="https://openstreetmap.se/" target="_blank">OpenStreetMap Sweden</a> &mdash; Map data {attribution.OpenStreetMap}'
            },
            variants: {
                Full: 'full',
            }
        },
        Stamen: {
            url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/{variant}/{z}/{x}/{y}{r}.{ext}',
            options: {
                attribution:
                'Map tiles by <a href="https://stamen.com">Stamen Design</a>, ' +
                '<a href="https://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; ' +
                'Map data {attribution.OpenStreetMap}',
                subdomains: 'abcd',
                minZoom: 0,
                maxZoom: 20,
                variant: 'toner',
                ext: 'png'
            },
            variants: {
                Toner: 'toner',
                TonerHybrid: 'toner-hybrid',
                TonerLite: 'toner-lite',
                Terrain: {
                    options: {
                        variant: 'terrain',
                        minZoom: 0,
                        maxZoom: 18
                    }
                },
            }
        },
        Esri: {
            url: 'https://server.arcgisonline.com/ArcGIS/rest/services/{variant}/MapServer/tile/{z}/{y}/{x}',
            options: {
                variant: 'World_Street_Map',
                attribution: 'Tiles &copy; Esri'
            },
            variants: {
                WorldStreetMap: {
                    options: {
                        attribution:
                        '{attribution.Esri} &mdash; ' +
                        'Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012'
                    }
                },
                DeLorme: {
                    options: {
                        variant: 'Specialty/DeLorme_World_Base_Map',
                        minZoom: 1,
                        maxZoom: 11,
                        attribution: '{attribution.Esri} &mdash; Copyright: &copy;2012 DeLorme'
                    }
                },
                WorldTopoMap: {
                    options: {
                        variant: 'World_Topo_Map',
                        attribution:
                        '{attribution.Esri} &mdash; ' +
                        'Esri, DeLorme, NAVTEQ, TomTom, Intermap, iPC, USGS, FAO, NPS, NRCAN, GeoBase, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), and the GIS User Community'
                    }
                },
                OceanBasemap: {
                    options: {
                        variant: 'Ocean_Basemap',
                        maxZoom: 13,
                        attribution: '{attribution.Esri} &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri'
                    }
                },
                NatGeoWorldMap: {
                    options: {
                        variant: 'NatGeo_World_Map',
                        maxZoom: 16,
                        attribution: '{attribution.Esri} &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC'
                    }
                },
                WorldGrayCanvas: {
                    options: {
                        variant: 'Canvas/World_Light_Gray_Base',
                        maxZoom: 16,
                        attribution: '{attribution.Esri} &mdash; Esri, DeLorme, NAVTEQ'
                    }
                }
            }
        },
        CartoDB: {
            url: 'https://cartodb-basemaps-{s}.global.ssl.fastly.net/{variant}/{z}/{x}/{y}{r}.png',
            options: {
                attribution: '{attribution.OpenStreetMap} &copy; <a href="https://cartodb.com/attributions">CartoDB</a>',
                subdomains: 'abcd',
                maxZoom: 19,
                variant: 'light_all'
            },
            variants: {
                Positron: 'light_all',
                DarkMatter: 'dark_all',
                Voyager: 'rastertiles/voyager',
            }
        },
        HikeBike: {
            url: 'https://{s}.tiles.wmflabs.org/{variant}/{z}/{x}/{y}.png',
            options: {
                maxZoom: 19,
                attribution: '{attribution.OpenStreetMap}',
                variant: 'hikebike'
            },
            variants: {
                HikeBike: {},
            }
        },
        NASAGIBS: {
            url: 'https://map1.vis.earthdata.nasa.gov/wmts-webmerc/{variant}/default/{time}/{tilematrixset}{maxZoom}/{z}/{y}/{x}.{format}',
            options: {
                attribution:
                'Imagery provided by services from the Global Imagery Browse Services (GIBS), operated by the NASA/GSFC/Earth Science Data and Information System ' +
                '(<a href="https://earthdata.nasa.gov">ESDIS</a>) with funding provided by NASA/HQ.',
                bounds: [[-85.0511287776, -179.999999975], [85.0511287776, 179.999999975]],
                minZoom: 1,
                maxZoom: 9,
                format: 'jpg',
                time: '',
                tilematrixset: 'GoogleMapsCompatible_Level'
            },
            variants: {
                ViirsEarthAtNight2012: {
                    options: {
                        variant: 'VIIRS_CityLights_2012',
                        maxZoom: 8
                    }
                }
            }
        },
        Wikimedia: {
            url: 'https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png',
            options: {
                attribution: '<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>',
                minZoom: 1,
                maxZoom: 19
            }
        }
    };
    
    L.tileLayer.provider = function (provider, options) {
        return new L.TileLayer.Provider(provider, options);
    };
    
    return L;
}));

//Map Initialize
function initOpenStreetMap(doc) {
    jQuery('.sppb-addon-openstreetmap', doc).each(function(index) {
        
        var mapId = jQuery(this).attr('id'),
        zoom = jQuery(this).attr('data-mapzoom'),
        zoomControl = (Number(jQuery(this).attr('data-zoomcontrol')) === 1) ? true : false,
        dragging = (Number(jQuery(this).attr('data-dragging')) === 1) ? true : false,
        mousescroll = (Number(jQuery(this).attr('data-mousescroll')) === 1) ? true : false,
        attribution = (Number(jQuery(this).attr('data-attribution')) === 1) ? true : false,
        mapstyle = jQuery(this).attr('data-mapstyle');
        
        var locationData = JSON.parse(jQuery(this).attr('data-location'));
        var initialLatitude = locationData[0].latitude;
        var initialLongitude = locationData[0].longitude;
        
        var map = L.map(mapId, {
            center: [initialLatitude, initialLongitude],
            zoom: zoom,
            zoomControl: zoomControl,
            scrollWheelZoom: mousescroll,
            dragging: dragging,
            maxZoom: 100,
            attributionControl: attribution
        });
        
        L.tileLayer.provider(mapstyle).addTo(map);
        
        jQuery('a[data-toggle="sppb-tab"]').on('click', function (e) {
            var _this = this;
            setTimeout(function(){
                if(jQuery(_this).parent('li').hasClass('active')){ 
                    map.invalidateSize();
                }  
            },200)
        });
        jQuery('.sppb-panel-heading').on('click', function (e) {
            var _this = this;
            setTimeout(function(){
                if(jQuery(_this).hasClass('active')){ 
                    map.invalidateSize();
                }  
            },200)
        });
        
        var i;
        
        for(i=0; i<locationData.length; i++){
            var LeafIcon = L.Icon.extend({
                options: {
                    iconAnchor:   [30, 65],
                    popupAnchor:  [-5, -65]
                }
            });
            var icons = locationData[i].custom_icon;
            var custom_icon = '';
            var iconUrls = '';
            
            for(var j = 0; j<icons.length; j++){
                custom_icon = new LeafIcon({iconUrl: icons});
                iconUrls = {icon: custom_icon};
            }
            
            L.marker([locationData[i].latitude, locationData[i].longitude],iconUrls).addTo(map).bindPopup(locationData[i].address);
            
        }
        
    });
}
jQuery(window).on('load', function() {
    //Initialize on window load
    initOpenStreetMap(document);
    //Re Initialize on DOM change
    var observer = new MutationObserver(function (mutations) {
        mutations.forEach(function (mutation) {
            var newNodes = mutation.addedNodes;
            if (newNodes !== null) {
                var nodes = jQuery(newNodes);
                nodes.each(function () {
                    var node = jQuery(this);
                    node.find('.sppb-addon-openstreetmap').each(function () {
                        var mapId = jQuery(this).attr('id'),
                        zoom = jQuery(this).attr('data-mapzoom'),
                        zoomControl = (Number(jQuery(this).attr('data-zoomcontrol')) === 1) ? true : false,
                        dragging = (Number(jQuery(this).attr('data-dragging')) === 1) ? true : false,
                        mousescroll = (Number(jQuery(this).attr('data-mousescroll')) === 1) ? true : false,
                        attribution = (Number(jQuery(this).attr('data-attribution')) === 1) ? true : false,
                        mapstyle = jQuery(this).attr('data-mapstyle');
                        
                        var locationData = JSON.parse(jQuery(this).attr('data-location'));
                        var initialLatitude = locationData[0].latitude;
                        var initialLongitude = locationData[0].longitude;
                        
                        var map = L.map(mapId, {
                            center: [initialLatitude, initialLongitude],
                            zoom: zoom,
                            zoomControl: zoomControl,
                            scrollWheelZoom: mousescroll,
                            dragging: dragging,
                            maxZoom: 100,
                            attributionControl: attribution
                        });
                        
                        L.tileLayer.provider(mapstyle).addTo(map);
                        
                        jQuery('a[data-toggle="sppb-tab"]').on('click', function (e) {
                            var _this = this;
                            setTimeout(function(){
                                if(jQuery(_this).parent('li').hasClass('active')){ 
                                    map.invalidateSize();
                                }  
                            },200)
                        });
                        jQuery('.sppb-panel-heading').on('click', function (e) {
                            var _this = this;
                            setTimeout(function(){
                                if(jQuery(_this).hasClass('active')){ 
                                    map.invalidateSize();
                                }  
                            },200)
                        });
                        
                        var i;
                        
                        for(i=0; i<locationData.length; i++){
                            var LeafIcon = L.Icon.extend({
                                options: {
                                    iconAnchor:   [30, 65],
                                    popupAnchor:  [-5, -65]
                                }
                            });
                            var icons = locationData[i].custom_icon;
                            var custom_icon = '';
                            var iconUrls = '';
                            
                            for(var j = 0; j<icons.length; j++){
                                custom_icon = new LeafIcon({iconUrl: icons});
                                iconUrls = {icon: custom_icon};
                            }
                            
                            L.marker([locationData[i].latitude, locationData[i].longitude],iconUrls).addTo(map).bindPopup(locationData[i].address);
                            
                        }
                    });
                });
            }
        });
    });
    var config = {
        childList: true,
        subtree: true
    };
    observer.observe(document.body, config);
});
