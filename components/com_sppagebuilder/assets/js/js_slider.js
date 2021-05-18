/**
* @package SP Page Builder
* @author JoomShaper http://www.joomshaper.com
* @copyright Copyright (c) 2010 - 2020 JoomShaper
* @license http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 or later
*/
'use strict';

//Polyfill for bullshit IE11
//Polyfill for ParentNode.append From MDN
(function (arr) {
    arr.forEach(function (item) {
        if (item.hasOwnProperty('append')) {
            return;
        }
        Object.defineProperty(item, 'append', {
            configurable: true,
            enumerable: true,
            writable: true,
            value: function append() {
                var argArr = Array.prototype.slice.call(arguments),
                docFrag = document.createDocumentFragment();
                
                argArr.forEach(function (argItem) {
                    var isNode = argItem instanceof Node;
                    docFrag.appendChild(isNode ? argItem : document.createTextNode(String(argItem)));
                });
                
                this.appendChild(docFrag);
            }
        });
    });
})([Element.prototype, Document.prototype, DocumentFragment.prototype]);

//Polyfill for Object.assign From MDN
if (typeof Object.assign != 'function') {
    // Must be writable: true, enumerable: false, configurable: true
    Object.defineProperty(Object, "assign", {
        value: function assign(target, varArgs) { // .length of function is 2
            'use strict';
            if (target == null) { // TypeError if undefined or null
                throw new TypeError('Cannot convert undefined or null to object');
            }
            
            var to = Object(target);
            
            for (var index = 1; index < arguments.length; index++) {
                var nextSource = arguments[index];
                
                if (nextSource != null) { // Skip over if undefined or null
                    for (var nextKey in nextSource) {
                        // Avoid bugs when hasOwnProperty is shadowed
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                            to[nextKey] = nextSource[nextKey];
                        }
                    }
                }
            }
            return to;
        },
        writable: true,
        configurable: true
    });
}

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

;(function ($, window, document, undefined) {
    var pluginName = 'jsSlider'; // Create the plugin constructor
    
    function Plugin(element, options) {
        /*
        Provide local access to the DOM node(s) that called the plugin,
        as well local access to the plugin name and default options.
        */
        this.element = element;
        this._name = pluginName;
        this.item = null;
        this.delta = 1;
        this.isAnimating = false;
        this.isDragging = false; //interval clear 
        
        this.timer = 0;
        this._timeoutId1 = 0;
        this._timeoutId2 = 0;
        this._dotControllerTimeId = 0;
        this._lastViewPort = 0;
        this.video = this.videoUtils();
        this.videoProps = {};
        this.videoList = {
            youtube: [],
            vimeo: [],
            html5: []
        };
        this.player = {};
        this.videoPlaying = false;
        this.onMouseOver = false;
        this.captionAnimationProperty = {
            direction: 'left',
            from: '100%',
            to: '0',
            type: 'slide',
            duration: 800,
            after: 0,
            origin: '50% 50% 0',
            timing_function: 'cubic-bezier(0, 0.46, 0, 0.63)'
        };
        this.videoAspectRatio = 1.78;
        this.coordinate = {
            x: 0,
            y: 0
        };
        this.prevCoordinate = {
            x: 0,
            y: 0,
            diff: 0,
            dragPointer: -1
        };
        this._defaults = $.fn.jsSlider.defaults;
        /*
        The "$.extend" method merges the contents of two or more objects,
        and stores the result in the first object.
        More: http://api.jquery.com/jquery.extend/
        */
        
        this.options = $.extend({}, this._defaults, options); // Check if has valid array nav_text 
        
        if (this.options.nav_text.length !== 2) {
            console.warn("navtext must be need two control element!");
            this.options.nav_text = ['<', '>'];
        }
        /*
        The "init" method is the starting point for all plugin logic.
        */
        
        
        this.init();
    }
    
    $.extend(Plugin.prototype, {
        init: function init() {
            this.buildCache();
            this.createHtmlDom();
            this.applyBasicStyle();
            this.createVideoDom();
            if(this.items>1){
                this.bindEvents();
            }
            this.triggerOnStart();
            
            if (this.options.autoplay) {
                this.startLoop();
            }
        },
        // Trigger animation element on inital time
        triggerOnStart: function triggerOnStart() {
            this.updateCaption(); // Slide indicator if enable
            
            if (this.options.indicator) {
                this.animateIndicator('start');
            } // Trigger dot indicator if its enable 
            
            
            if (this.options.dot_indicator && this.options.dots) {
                var currentActiveDot = this.$dotContainer.find('li.active');
                this.animateDotIndicator(currentActiveDot, 'start');
            }
        },
        // Remove plugin instance completely
        destroy: function destroy() {
            this.unbindEvents();
            this.$element.removeData();
        },
        // Cache DOM nodes for performance
        buildCache: function buildCache() {
            this.$element = $(this.element);
        },
        // Unbind events that trigger methods
        unbindEvents: function unbindEvents() {
            /*
            Unbind all events in our plugin's namespace that are attached
            to "this.$element".
            */
            this.$element.off('.' + this._name);
        },
        
        /**
        * Create necessary html object for slider 
        * Definetly check user input and create object based on it
        */
        createHtmlDom: function createHtmlDom() {
            this.createOuterStage(); // Assign default active class if haven't 
            
            if (this.$element.find('.sp-item.active').length === 0) {
                this.$element.find('.sp-item:first-child').addClass('active');
            }
            
            this.item = this.$element.find('.sp-item.active');
            
            if (this.options.nav) {
                this.createNavigationController();
            }
            
            if (this.options.dots) {
                this.createDotsController();
            }
            
            if (this.options.indicator) {
                this.createIndicator();
            }
            
            if (this.options.show_number) {
                this.createSliderNumber();
            }
            /**
            * Clone slider item when it has two item only
            * Make it twise (2x2)
            */
            
            
            if (this.$element.find('.sp-item').length === 2) {
                var cloneItem = this.$element.find('.sp-item').clone();
                cloneItem.removeClass('active').addClass('sp-clone-item');
                this.$outerStage.append(cloneItem);
            }
        },
        
        /**
        * Create outerstage for holding tightly and 
        * give slider a confortable apperance
        */
        createOuterStage: function createOuterStage() {
            this.outerStage = document.createElement('div');
            this.outerStage.setAttribute('class', 'sp-slider-outer-stage');
            var outerStage = $(this.outerStage);
            this.$element.find('.sp-item').each(function (i, item) {
                outerStage.append(item);
            }); // this.outerStage.innerHTML= this.$element.html()
            
            this.$element.append(outerStage);
            this.$outerStage = outerStage;
        },
        
        /**
        * Add navigation controller arrow 
        * @options.nav = true
        */
        createNavigationController: function createNavigationController() {
            // build controlls
            var controllerBox = document.createElement('div');
            controllerBox.setAttribute('class', 'sp-nav-control');
            this.$element.append(controllerBox);
            this.nextBtn = document.createElement('span');
            this.nextBtn.setAttribute('class', 'next-control nav-control');
            this.prevBtn = document.createElement('span');
            this.prevBtn.setAttribute('class', 'prev-control nav-control');
            controllerBox.append(this.nextBtn);
            controllerBox.append(this.prevBtn);
            this.nextBtn.innerHTML = this.options.nav_text[1]; //this.nav_text[1]
            
            this.prevBtn.innerHTML = this.options.nav_text[0]; //this.nav_text[0]
            // Cache next and prev button 
            
            this.$nextBtn = $(this.nextBtn);
            this.$prevBtn = $(this.prevBtn);
        },
        
        /**
        * Add dots navigation
        * @options.dots = true 
        */
        createDotsController: function createDotsController() {
            //Create dots navigation
            if (typeof this.options.dots_class !== 'undefined' && this.options.dots_class === '') {
                var dotBox = document.createElement('div');
                dotBox.setAttribute('class', 'sp-dots');
                this.$element.append(dotBox);
                var jsSlider = this;
                var dotContainer = document.createElement('ul');
                this.$element.find('.sp-item').each(function (i, obj) {
                    var dotItem = document.createElement('li');
                    dotItem.setAttribute('class', 'sp-dot-' + i); // Dot indicator                        
                    
                    if (jsSlider.options.dot_indicator) {
                        var dotIndicator = document.createElement('span');
                        dotIndicator.setAttribute('class', 'dot-indicator');
                        dotItem.append(dotIndicator);
                    }
                    
                    if ($(obj).hasClass('active')) {
                        dotItem.classList.add('active');
                    }
                    
                    dotContainer.append(dotItem);
                });
                dotBox.append(dotContainer);
                this.$element.append(dotBox); //Cache dot container
                
                this.$dotContainer = $(dotContainer);
            } else {
                this.$dotContainer = this.$element.find(this.options.dots_class);
                
                if (this.$element.find('.sp-item.active') > 0) {
                    var activeItemIndex = this.$element.find('.sp-item').index();
                    this.$dotContainer.find('li')[activeItemIndex].addClass("active");
                }
            }
        },
        
        /**
        * Add slider load indicator 
        * @options.indicator = true 
        */
        createIndicator: function createIndicator() {
            var _this = this;
            
            var indicatorClass = this.options.indicator_type === 'circle' ? 'circles-indicator' : 'line-indicator';
            
            var createDom = function createDom() {
                var parentIndicator = document.createElement('div');
                parentIndicator.setAttribute('class', 'sp-indicator-container');
                
                _this.$element.append(parentIndicator);
                
                _this.indicator = document.createElement('div');
                
                _this.indicator.setAttribute('class', 'sp-indicator ' + indicatorClass);
                
                $(parentIndicator).append(_this.indicator);
                _this.$indicator = $(_this.indicator);
            };
            
            if (this.options.indicator_class === '') {
                if (this.options.indicator_type === 'circle') {// Waiting for animation object
                } else {
                    createDom();
                }
            } else {
                if (this.$element.find(this.options.indicator_class).length > 0) {
                    this.$indicator = this.$element.find(this.options.indicator_class);
                    this.$indicator.addClass(indicatorClass);
                } else {
                    createDom();
                }
            }
        },
        
        /**
        * Show slider number and timeline 
        */
        createSliderNumber: function createSliderNumber() {
            var _this2 = this;
            
            var slider_number_inner_html = function slider_number_inner_html($slider_number_element) {
                var slider_number_dom = "<span class=\"sp-slider_current_number\"> </span>";
                $slider_number_element.append(slider_number_dom);
            };
            
            var createNumberContainer = function createNumberContainer() {
                var slider_number = document.createElement('div');
                slider_number.setAttribute('class', 'sp-slider_number');
                
                _this2.$element.append(slider_number);
                
                _this2.$slider_number = $(slider_number);
            };
            
            if (this.options.slider_number_class === '') {
                createNumberContainer();
            } else {
                if (this.$element.find(this.options.slider_number_class).length > 0) {
                    this.$slider_number = this.$element.find(this.options.slider_number_class);
                } else {
                    createNumberContainer();
                }
            }
            
            slider_number_inner_html(this.$slider_number);
        },
        updateSliderNumber: function updateSliderNumber() {
            if (this.options.show_number === true) {
                var totalItems = this.$element.find('.sp-item').not('.sp-clone-item').length
                var itemIndex = this.item.index()
                if( this.item.hasClass('sp-clone-item') ){
                    if( itemIndex === this.items-1 ){
                        itemIndex = 1
                    }else{
                        itemIndex = 0
                    }
                }
                var currentItemNumberSpan = this.$slider_number.find('.sp-slider_current_number');
                var currentSliderNo = itemIndex + 1 > 10 ? itemIndex + 1 : ('0' + (itemIndex + 1)).slice(-2);
                var totalSlider = totalItems > 10 ? totalItems : ('0' + totalItems).slice(-2);
                currentItemNumberSpan.html(currentSliderNo + '<span class="sp-slider-current-number-slash">/</span><span class="sp-slider-current-number-right">' + totalSlider + '</span>');
            }
        },
        videoUtils: function videoUtils() {
            var videoMethods = {};
            var self = this;
            videoMethods.getVideoSrc = function (videoSrc) {
                var isYouTube = videoSrc.match(/youtube|youtu\.be/);
                var isVimeo = -1 !== videoSrc.indexOf('vimeo');
                var html5 = false;
                var videoType = videoSrc.split('.').pop();
                
                if (videoType === 'mp4' || videoType === 'webm' || videoType === 'ogg') {
                    html5 = true;
                }
                
                return {
                    isYouTube: isYouTube,
                    isVimeo: isVimeo,
                    html5: html5,
                    videoType: videoType
                };
            }; videoMethods.getHtml5Type = function (videoSrc) {
                return videoSrc.split('.').pop();
            };
            videoMethods.getYoutubeId = function (url) {
                var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#\&\?]*).*/;
                var match = url.match(regExp);
                return match && match[7].length == 11 ? match[7] : false;
            }; videoMethods.hasVideo = function (itemIndex) {
                return typeof self.player["item_" + itemIndex] !== 'undefined';
            }; videoMethods.getPlayerType = function (itemIndex) {
                var type = 'youtube';
                if (self.player["item_" + itemIndex].type === 'vimeo') type = 'vimeo';
                if (self.player["item_" + itemIndex].type === 'html5') type = 'html5';
                return type;
            }; videoMethods.getPlayer = function (itemIndex, type) {
                if (type === void 0) {
                    type = 'youtube';
                }
                
                var player = self.player["item_" + itemIndex];
                if (typeof player !== 'undefined' && player.type === type) return player.player;
                return null;
            };
            videoMethods.uuid = function(){
                return 'xxx-4xxx-yxxx-xxxxx'.replace(/[xy]/g, function(c) {
                    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
                    return v.toString(16);
                });
            }
            return videoMethods;
        },
        createVideoDom: function createVideoDom() {
            var _this3 = this;
            
            if (this.videoList.youtube.length > 0) {
                if (window.YT) {
                    this.createYoutubeDom(this.videoList.youtube);
                } else {
                    window.onYouTubeIframeAPIReady = this.createYoutubeDom.bind(this, this.videoList.youtube);
                }
            }
            
            if (this.videoList.vimeo.length > 0) {
                this.createVimeoDom(this.videoList.vimeo);
            }
            
            if (this.videoList.html5.length > 0) {
                this.videoList.html5.map(function (item) {
                    _this3.createHtml5VideoDom(item);
                });
            }
        },
        createYoutubeDom: function createYoutubeDom(items) {
            var _this4 = this;
            
            items.map(function (item) {
                _this4.createYoutubeVideoFrame(item);
            });
        },
        createVimeoDom: function createVimeoDom(items) {
            var _this5 = this;
            
            if (typeof Vimeo === 'undefined') {
                setTimeout(function () {
                    _this5.createVimeoDom(items);
                }, 10);
            } else {
                items.map(function (item) {
                    _this5.createVimeoVideoFrame(item);
                });
            }
        },
        checkVideoBackground: function checkVideoBackground($item) {
            var videoContainer = $item.find('div[data-video_src]');
            
            if (videoContainer.length > 0) {
                var src = videoContainer.attr('data-video_src');
                var videoSource = this.video.getVideoSrc(src);
                
                if (videoSource.isYouTube) {
                    if (document.getElementById('sp-youtube-script') === null) {
                        var tag = document.createElement('script');
                        tag.setAttribute('id', 'sp-youtube-script');
                        tag.src = "https://www.youtube.com/iframe_api";
                        var firstScriptTag = document.getElementsByTagName('script')[0];
                        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                    }
                    
                    this.videoList.youtube.push($item);
                }
                
                if (videoSource.isVimeo) {
                    if (document.getElementById('sp-vimeo-script') === null) {
                        var _tag = document.createElement('script');
                        
                        _tag.setAttribute('id', 'sp-vimeo-script');
                        
                        _tag.src = "https://player.vimeo.com/api/player.js";
                        var _firstScriptTag = document.getElementsByTagName('script')[0];
                        
                        _firstScriptTag.parentNode.insertBefore(_tag, _firstScriptTag);
                    }
                    
                    this.videoList.vimeo.push($item);
                }
                
                if (videoSource.html5) {
                    this.videoList.html5.push($item);
                }
            }
        },
        
        /**
        * Apply base css property on initial hook 
        */
        applyBasicStyle: function applyBasicStyle() {
            this.outerWidth = this.$outerStage.outerWidth();
            var totalItems = 0;
            var transitionSpeed = this.options.speed;
            var animationType = this.options.animations;
            var jsSlider = this;
            this.$element.find('.sp-item').each(function () {
                totalItems++; // Check if it has video background 
                
                jsSlider.checkVideoBackground($(this));
                $(this).css({
                    '-webkit-transition-duration': transitionSpeed + 'ms'
                });
                
                if (animationType === 'fade') {
                    $(this).css({
                        'opacity': 0
                    });
                    
                    if ($(this).hasClass('active')) {
                        $(this).css({
                            'opacity': 1
                        });
                    }
                }
                
                if (animationType === 'zoomOut') {
                    if (!$(this).hasClass('active')) {
                        $(this).css({
                            '-webkit-transform': 'scale3D(.8,.8,.8)'
                        });
                    }
                }
                
                if (animationType === 'clip') {
                    if ($(this).hasClass('active')) {
                        $(this).css({
                            '-webkit-transition-duration': '0s',
                            '-webkit-transform': "translate3D(0,0,0)",
                            'clip': "rect(auto, " + jsSlider.outerWidth + "px, auto, 0px)",
                            'zIndex': 2,
                            opacity: 1
                        });
                    } else {
                        $(this).css({
                            '-webkit-transition-duration': jsSlider.options.speed + 'ms',
                            '-webkit-transform': "translate3D(0,0,0)",
                            'clip': "rect(auto, 0, auto, 0px)",
                            'opacity': 0,
                            'zIndex': 1
                        });
                    }
                }
                
                if (animationType === 'bubble') {
                    if ($(this).hasClass('active')) {
                        $(this).css({
                            '-webkit-transition-duration': '0s',
                            '-webkit-transform': "scale3D(1,1,1)",
                            'clip-path': "circle(100% at 50% 50%)",
                            'zIndex': 2,
                            'visibility': 'visible',
                            opacity: 1
                        });
                    } else {
                        var n = Math.floor(Math.random() * 50) + 20;
                        var n2 = Math.floor(Math.random() * 40) + 20;
                        $(this).css({
                            '-webkit-transition-duration': '0s',
                            '-webkit-transform': "scale3D(0,0,0)",
                            'clip-path': "circle(" + jsSlider.options.bubble_size + " at " + n + "% " + n2 + "%)",
                            'opacity': 0,
                            'visibility': 'visible',
                            'zIndex': 1
                        });
                    }
                }
            });
            
            if (animationType === '3D' || animationType === '3d') {
                this.$element.addClass('on-3d-active');
                this.add3DHook();
            }
            
            if (animationType === 'clip') {
                this.$element.addClass('sp-clip-slider');
            }
            
            if (animationType === 'bubble') {
                this.$element.addClass('sp-bubble-slider');
            }
            
            if (animationType === 'stack') {
                this.$element.addClass('sp-stack-slider');
            }
            
            if (animationType === 'slide') {
                this.$element.addClass('sp-basic-slider');
            }
            
            if (animationType === 'fade') {
                this.$element.addClass('sp-fade-slider');
            }
            
            this.items = totalItems;
            this.updateResponsiveView();
            this.updateSliderNumber();
        },
        
        /**
        * 3D hook for each item 
        */
        add3DHook: function add3DHook() {
            var rotate = this.options.rotate;
            var activeItem = this.$element.find('.sp-item.active');
            activeItem.css({
                'zIndex': 3,
                '-webkit-transition-duration': '0s',
                '-webkit-transform': 'translate3d(0, 0, -200px)'
            });
            activeItem.next('.sp-item').addClass('next-3d').css({
                'zIndex': 2,
                'opacity': 1,
                'visibility': 'visible',
                '-webkit-transition-duration': '0s',
                '-webkit-transform': "translate3d(100%, 0,-400px) rotate3d(0,-1,0," + rotate + "deg)"
            });
            this.$element.find('.sp-item:last-child').addClass('prev-3d').css({
                'zIndex': 2,
                'opacity': 1,
                'visibility': 'visible',
                '-webkit-transition-duration': '0s',
                '-webkit-transform': "translate3d(-100%, 0,-400px) rotate3d(0,-1,0," + -rotate + "deg)"
            });
        },
        
        /**
        * Start auto play loop with user provided interval
        * @interval = options.interval or default interval 
        * save each interval for force stop the loop
        */
        startLoop: function startLoop() {
            var _this6 = this;
            
            this.timer = setInterval(function () {
                if (_this6.isAnimating === false) _this6.Next();
            }, this.options.interval);
        },
        
        /**
        * Stop auto loop on trigger
        */
        stopLoop: function stopLoop(functionName) {
            if (functionName === void 0) {
                functionName = null;
            }
            
            clearInterval(this.timer);
            this.timer = 0;
        },
        
        /**
        * Go next slider item 
        * @if next slider item is last item 
        * @then go first item 
        * It will be looping one after another item continusely if you continusely click next nav controller
        * 
        * Save the active item to the item object (globally)
        */
        Next: function Next() {
            this.isAnimating = true;
            if (this.delta === -1) this.delta = 1;
            var prevouseElem = '';
            var currentElement = '';
            
            if (this.options.animations !== '3D') {
                prevouseElem = this.$element.find('.sp-item.active');
                prevouseElem.addClass('prev-item');
                
                if (prevouseElem.next('.sp-item').length) {
                    currentElement = prevouseElem.next('.sp-item').addClass('active next-item');
                } else {
                    currentElement = this.$element.find('.sp-item:first-child').addClass('active next-item');
                }
            }
            
            if (this.options.animations === '3d' || this.options.animations === '3D') {
                prevouseElem = this.$element.find('.sp-item.active');
                currentElement = this.$element.find('.next-3d');
            } // Store active item
            
            
            this.item = currentElement;
            this.updateSliderNumber();
            this.updateDotsController();
            if (this.options.animations !== '3D') this.updateItemStyle(prevouseElem, currentElement);
            if (this.options.animations === '3D') this.update3DItemStyle(prevouseElem, currentElement);
        },
        
        /**
        * Go prevouse slider item 
        * @if prevouse slider item is first one then go to last slider 
        * It will be looping on thread if you continousely click prev icon
        * 
        * Save the active item to the item object (globally) 
        */
        Prev: function Prev() {
            this.isAnimating = true;
            if (this.delta === 1) this.delta = -1;
            var currentElement = '';
            var prevouseElem = '';
            
            if (this.options.animations !== '3D') {
                prevouseElem = this.$element.find('.sp-item.active');
                prevouseElem.addClass('prev-item');
                
                if (prevouseElem.prev('.sp-item').length) {
                    currentElement = prevouseElem.prev('.sp-item').addClass('active next-item');
                } else {
                    currentElement = this.$element.find('.sp-item:last-child').addClass('active next-item');
                }
            }
            
            if (this.options.animations === '3d' || this.options.animations === '3D') {
                prevouseElem = this.$element.find('.sp-item.active');
                currentElement = this.$element.find('.prev-3d');
            } // Store active item
            
            
            this.item = currentElement;
            this.updateSliderNumber();
            this.updateDotsController(); // Update item css property
            
            if (this.options.animations !== '3D') this.updateItemStyle(prevouseElem, currentElement);
            if (this.options.animations === '3D') this.update3DItemStyle(prevouseElem, currentElement);
        },
        
        /**
        * Go exact slider position by index number
        * If you click on dots navication it will pick the index number of the dot controller
        * then search the slider index item and active that item 
        * 
        * Check also delta that will tell you where we should go (forword|backword)
        * 
        * Save the active item to the item object (globally)
        */
        slideFromPosition: function slideFromPosition(position, delta) {
            var _this7 = this;
            
            this.isAnimating = true;
            var prevouseElem = '';
            var currentElement = '';
            
            if (this.options.animations !== '3D') {
                prevouseElem = this.$element.find('.sp-item.active').addClass('prev-item');
                currentElement = this.$element.find('.sp-item:nth-child(' + position + ')').addClass('active next-item');
            }
            
            if (this.options.animations === '3D') {
                var _ret = function () {
                    var speed = 300;
                    
                    if (delta === 1) {
                        prevouseElem = _this7.$element.find('.sp-item.active');
                        currentElement = _this7.$element.find('.next-3d');
                        /**
                        * Find the clicked item index number and the active item index number
                        * Calculate the different of two index number 
                        */
                        
                        var currentIndex = prevouseElem.index();
                        var diffIndex = Math.abs(currentIndex - position); // If its clicked prev item then just slide them to prev
                        
                        if (diffIndex === 2) {
                            _this7.Next();
                            
                            return {
                                v: void 0
                            };
                        }
                        /**
                        * Slide the indexs items as a limited speed within a for loop
                        */
                        
                        
                        var _loop = function _loop(i) {
                            setTimeout(function () {
                                if (i !== 1) {
                                    prevouseElem = _this7.$element.find('.sp-item.active');
                                    currentElement = _this7.$element.find('.next-3d');
                                } //Do the slideshow
                                
                                
                                _this7.update3DItemStyle(prevouseElem, currentElement, speed);
                            }, speed * i);
                        };
                        
                        for (var i = 1; i < diffIndex; i++) {
                            _loop(i);
                        }
                    }
                    
                    if (delta === -1) {
                        prevouseElem = _this7.$element.find('.sp-item.active');
                        currentElement = _this7.$element.find('.prev-3d');
                        /**
                        * Find the clicked item index number and the active item index number
                        * Calculate the different of two index number 
                        */
                        
                        var _currentIndex = prevouseElem.index() + 1;
                        
                        var _diffIndex = Math.abs(_currentIndex - (position - 1)); // If its clicked prev item then just slide them to prev
                        
                        
                        if (_diffIndex === 2) {
                            _this7.Prev();
                            
                            return {
                                v: void 0
                            };
                        }
                        /**
                        * Slide the indexs items as a limited speed within a for loop
                        */
                        
                        
                        var _loop2 = function _loop2(i) {
                            setTimeout(function () {
                                /**
                                * If its not first loop then get the previous $item 
                                * Else get the new $item each time
                                */
                                if (i !== 1) {
                                    prevouseElem = _this7.$element.find('.sp-item.active');
                                    currentElement = _this7.$element.find('.prev-3d');
                                } // Do the slideshow
                                
                                
                                _this7.update3DItemStyle(prevouseElem, currentElement, speed);
                            }, speed * i);
                        };
                        
                        for (var i = 1; i < _diffIndex; i++) {
                            _loop2(i);
                        }
                    }
                }();
                
                if (_typeof(_ret) === "object") return _ret.v;
            } // Store active item
            
            
            this.item = currentElement;
            this.updateSliderNumber();
            /**
            * Detect am I click the next elment of active one or prev element
            * If prev element then slide from left otherwise from right
            */
            
            this.delta = delta; // Update item css property
            
            if (this.options.animations !== '3D') {
                this.updateItemStyle(prevouseElem, currentElement);
            }
        },
        
        /**
        * Update dots controller on each slider change 
        * Apply active class in current slider and remove from others 
        */
        updateDotsController: function updateDotsController() {
            var _this8 = this;
            
            if (!this.options.dots) {
                return;
            }
            
            var prevActiveDot = this.$dotContainer.find('li.active');
            var currentActiveDot = '';
            prevActiveDot.removeClass('active');
            
            if (this.delta === 1) {
                if (prevActiveDot.next('li').length) {
                    currentActiveDot = prevActiveDot.next('li').addClass('active');
                } else {
                    currentActiveDot = this.$dotContainer.find('li:first-child').addClass('active');
                }
            }
            
            if (this.delta === -1) {
                if (prevActiveDot.prev('li').length) {
                    currentActiveDot = prevActiveDot.prev('li').addClass('active');
                } else {
                    currentActiveDot = this.$dotContainer.find('li:last-child').addClass('active');
                }
            } // Check if user enable dot_indicator
            
            
            if (this.options.dot_indicator) {
                this.animateDotIndicator(prevActiveDot, 'stop');
                
                if (this._dotControllerTimeId > 0) {
                    clearTimeout(this._dotControllerTimeId);
                    this._dotControllerTimeId = 0;
                }
                
                this._dotControllerTimeId = setTimeout(function () {
                    _this8.animateDotIndicator(currentActiveDot, 'start');
                }, this.options.speed);
            }
            
            currentActiveDot.css({
                '-webkit-transition': 'all 0.5s linear 0s'
            });
        },
        updateDotsFromPosition: function updateDotsFromPosition(position) {
            var _this9 = this;
            
            var prevActiveDot = this.$dotContainer.find('li.active').removeClass('active');
            var currentActiveDot = this.$dotContainer.find('li:nth-child(' + position + ')').addClass('active');
            
            if (this.options.dot_indicator) {
                this.animateDotIndicator(prevActiveDot, 'stop');
                
                if (this._dotControllerTimeId > 0) {
                    clearTimeout(this._dotControllerTimeId);
                    this._dotControllerTimeId = 0;
                }
                
                this._dotControllerTimeId = setTimeout(function () {
                    _this9.animateDotIndicator(currentActiveDot, 'start');
                }, this.options.speed);
            }
            
            currentActiveDot.css({
                '-webkit-transition': 'all 0.5s linear 0s'
            });
        },
        // Animate dot indicator
        animateDotIndicator: function animateDotIndicator(dotItem, action) {
            //Check it has do-indicator class
            if (dotItem.find('.dot-indicator').length === 0) {
                return;
            }
            
            if (action === 'stop') {
                dotItem.find('.dot-indicator').removeClass('active').css({
                    '-webkit-transition-duration': '0s'
                });
            }
            
            if (action === 'start') {
                var speed = Math.abs(this.options.interval - this.options.speed);
                dotItem.find('.dot-indicator').addClass('active').css({
                    '-webkit-transition-duration': speed + 'ms'
                });
            }
        },
        // Animate slider indicator
        animateIndicator: function animateIndicator(name) {
            if (!this.options.indicator) {
                return;
            }
            
            var speed = Math.abs(this.options.interval - this.options.speed);
            
            if (this.options.indicator_type === 'line') {
                if (name === 'start') {
                    this.$indicator.css({
                        '-webkit-transition-duration': speed + 'ms',
                        'width': '100%'
                    });
                }
                
                if (name === 'stop') {
                    this.$indicator.css({
                        '-webkit-transition-duration': '0s',
                        'width': '0'
                    });
                }
            }
            
            if (this.options.indicator_type === 'circle') {
                if (name === 'start') {}
                
                if (name === 'stop') {
                    this.$indicator.removeClass('start');
                }
            }
        },
        
        /**
        * Update 3d item styles 
        * ==========
        * 3D
        * ==========
        */
        update3DItemStyle: function update3DItemStyle(prevouseElem, currentElement, custom_speed) {
            var _this10 = this;
            
            if (custom_speed === void 0) {
                custom_speed = null;
            }
            
            var speed = custom_speed === null ? this.options.speed : custom_speed;
            var rotate = this.options.rotate;
            this.animateIndicator('stop');
            
            if (this.delta === -1) {
                this.$element.find('.next-3d').removeClass('next-3d').css({
                    opacity: 0,
                    visibility: 'hidden'
                });
                var fPrevItem = '';
                
                if (currentElement.prev('.sp-item').length > 0) {
                    fPrevItem = currentElement.prev('.sp-item');
                } else {
                    fPrevItem = this.$element.find('.sp-item:last-child');
                }
                
                fPrevItem.addClass('prev-3d').css({
                    'opacity': 1,
                    'zIndex': 1,
                    'visibility': 'visible',
                    '-webkit-transition-duration': '0s',
                    '-webkit-transform': "translate3d(-100%, 0,-400px) rotate3d(0,-1,0," + -rotate + "deg)"
                });
                currentElement.addClass('active').removeClass('prev-3d').css({
                    'zIndex': 3,
                    'opacity': 1,
                    'visibility': 'visible',
                    '-webkit-transition-duration': speed + 'ms',
                    '-webkit-transform': 'translate3d(0, 0,-200px) rotate3d(0,0,0,0deg)'
                });
                prevouseElem.addClass('next-3d').removeClass('active').css({
                    'zIndex': 1,
                    'opacity': 1,
                    'visibility': 'visible',
                    '-webkit-transition-duration': speed + 'ms',
                    '-webkit-transform': "translate3d(100%, 0,-400px) rotate3d(0,-1,0," + rotate + "deg)"
                });
            }
            
            if (this.delta === 1) {
                this.$element.find('.prev-3d').removeClass('prev-3d').css({
                    opacity: 0,
                    visibility: 'hidden'
                });
                var fNextItem = ''; //future next item
                
                if (currentElement.next('.sp-item').length > 0) {
                    fNextItem = currentElement.next('.sp-item');
                } else {
                    fNextItem = this.$element.find('.sp-item:first-child');
                }
                
                fNextItem.addClass('next-3d').css({
                    'opacity': 1,
                    'visibility': 'visible',
                    '-webkit-transition-duration': '0s',
                    '-webkit-transform': "translate3d(100%, 0,-400px) rotate3d(0,-1,0," + rotate + "deg)"
                });
                currentElement.addClass('active').removeClass('next-3d').css({
                    'zIndex': 3,
                    'opacity': 1,
                    'visibility': 'visible',
                    '-webkit-transition-duration': speed + 'ms',
                    '-webkit-transform': 'translate3d(0, 0,-200px) rotate3d(0,0,0,0deg)'
                });
                prevouseElem.addClass('prev-3d').removeClass('active').css({
                    'zIndex': 1,
                    'opacity': 1,
                    'visibility': 'visible',
                    '-webkit-transition-duration': speed + 'ms',
                    '-webkit-transform': "translate3d(-100%, 0,-400px) rotate3d(0,-1,0," + -rotate + "deg)"
                });
            }
            
            if (this._timeoutId2) {
                clearTimeout(this._timeoutId2);
                this._timeoutId2 = 0;
            }
            
            this._timeoutId2 = setTimeout(function () {
                _this10.isAnimating = false;
                
                _this10.animateIndicator('start');
            }, speed); // Start loop if click on controller 
            
            if (this.options.autoplay && this.timer === 0) {
                this.startLoop();
            }
            
            this.updateCaption();
        },
        createIframeMask: function createIframeMask(videoSection, itemIndex, type) {
            if (type === void 0) {
                type = 'youtube';
            }
            
            var videoContainer = document.createElement('div', {
                css: {
                    position: 'absolute',
                    display: 'block',
                    minWidth: '100%'
                }
            });
            
            var iframeId = "sp-video-content-" + itemIndex + '-' + this.video.uuid();
            
            if (type === 'vimeo') {
                videoContainer.className = 'sp-video-container sp-vimeo-video-container';
                videoContainer.id = iframeId;
                videoSection.append(videoContainer);
            } else {
                videoContainer.className = 'sp-video-container';
                var videoContent = document.createElement('div');
                videoContent.id = iframeId;
                videoSection.append($(videoContainer).append(videoContent));
            }
            
            var videoMask = document.createElement('div');
            videoMask.className = 'sp-video-background-mask';
            videoSection.append(videoMask); //Create video control
            
            var videoControl = document.createElement('div');
            videoControl.className = 'sp-video-control';
            $(videoControl).append("<span data-type=\"" + type + "\" data-index=\"" + itemIndex + "\" class=\"sp-volumn-control fa fa-volume-off\"></span>");
            $(videoMask).append(videoControl);
            return iframeId;
        },
        createYoutubeVideoFrame: function createYoutubeVideoFrame(item) {
            /**
            * If its youtube video then set video type as @youtube
            * Check if there already iframe exist for video
            * If not then create iframe with player instance 
            * If yes then create player instance from existing iframe
            */
            var videoSection = item.find('div[data-video_src]');
            var itemIndex = item.index();
            var option = {
                active: item.hasClass('active')
                /**
                * Depend if there already only youtube video url
                * otherwise get the iframe id form iframe dom 
                **/
                
            };
            var iframeId = this.createIframeMask(videoSection, itemIndex);

            var youtubeId = this.video.getYoutubeId(videoSection.attr('data-video_src'));
            this.videoProps[itemIndex];
            var isAutoplay = item.hasClass('active') ? 1 : 0;
            var player = new YT.Player(iframeId, {
                width: '100%',
                height: '100%',
                videoId: youtubeId,
                playerVars: {
                    enablejsapi: 1,
                    autoplay: isAutoplay,
                    controls: 0,
                    rel: 0,
                    modestbranding: 0,
                    loop: 1,
                    showinfo: 0,
                    origin: window.location.origin
                },
                events: {
                    'onReady': this.onPlayerReady.bind(this, option),
                    'onStateChange': this.onPlayerStateChange.bind(this),
                    'onError': this.onPlayerError.bind(this)
                }
            });
            this.player["item_" + itemIndex] = {
                player: player,
                type: 'youtube'
            };
            this.resizeVideoIframeWithAspectRatio(videoSection);
            return player;
        },
        onPlayerReady: function onPlayerReady(option, event) {
            event.target.mute();
            this.videoReady = true; //Stop autoloop if true
            
            if (this.options.autoplay && this.timer > 0) {
                this.stopLoop('onPlayerReady');
            }
            
            if (option.active) {
                event.target.playVideo();
                this.videoPlaying = true;
            }
        },
        onPlayerStateChange: function onPlayerStateChange(event) {
            if (event.data === YT.PlayerState.ENDED) {
                if (this.options.autoplay && this.onMouseOver === false) {
                    this.Next();
                } else {
                    event.target.playVideo();
                }
            }
        },
        onPlayerError: function onPlayerError(event) {
            console.warn("get video error", event);
            this.Next();
        },
        createVimeoVideoFrame: function createVimeoVideoFrame(item) {
            var videoSection = item.find('div[data-video_src]');
            var itemIndex = item.index();
            var isAutoplay = item.hasClass('active') ? 1 : 0;
            var vimeoUrl = videoSection.attr('data-video_src');
            /**
            * Depend if there already only youtube video url
            * otherwise get the iframe id form iframe dom 
            **/
            
            var iframeId = this.createIframeMask(videoSection, itemIndex, 'vimeo');
            var player = new Vimeo.Player(iframeId, {
                url: vimeoUrl,
                title: 0,
                byline: 0,
                loop: isAutoplay,
                sidedock: 0,
                muted: 1,
                transparent: 1
            });
            
            this.player["item_" + itemIndex] = {
                player: player,
                type: 'vimeo'
            };

            player.on('bufferstart', (function(){
                this.resizeVideoIframeWithAspectRatio(videoSection);
            }).bind(this) )
         
            if (isAutoplay) {
                player.play();
                player.on('ended', this.vimeoOnPlayEnd.bind(this, player));
            }
        },
        createHtml5VideoDom: function createHtml5VideoDom(item) {
            var videoSection = item.find('div[data-video_src]');
            var itemIndex = item.index();
            var videoId = "sp-video-content-" + itemIndex + this.video.uuid();
            var isAutoplay = item.hasClass('active');
            var html5Src = videoSection.attr('data-video_src');
            var videoContainer = document.createElement('div');
            videoContainer.className = 'sp-video-container sp-html5-video-container';
            var videoMask = document.createElement('div');
            videoMask.className = 'sp-video-background-mask'; //Create video control
            
            var videoControl = document.createElement('div');
            videoControl.className = 'sp-video-control';
            $(videoControl).append("<span data-type=\"html5\" data-index=\"" + itemIndex + "\" class=\"sp-volumn-control fa fa-volume-off\"></span>");
            $(videoContainer).append($(videoMask).append(videoControl)); // Create video tag 
            
            var player = document.createElement('video');
            player.id = videoId;
            player.muted = true;
            player.playsinline = 'playsinline';
            var source = document.createElement('source');
            source.src = html5Src;
            source.type = "video/" + this.video.getHtml5Type(html5Src);
            player.append(source);
            videoSection.append($(videoContainer).append(player));
            this.player["item_" + itemIndex] = {
                player: player,
                type: 'html5'
            };
            this.resizeVideoIframeWithAspectRatio(videoSection);
            
            if (isAutoplay) {
                player.play();
                this.videoPlaying = true;
                player.onended = this.html5OnPlayEnd.bind(this, player);
            }
        },
        html5OnPlayEnd: function html5OnPlayEnd(player, data) {
            if (this.options.autoplay && this.onMouseOver === false) {
                this.Next();
            } else {
                player.play();
                player.onended = this.html5OnPlayEnd.bind(this, player);
            }
        },
        playVideoAnimation: function playVideoAnimation(currentElement) {
            var _this11 = this;
            
            var hasVideo = false;
            var videoSection = currentElement.find('div[data-video_src]');
            
            if (videoSection.length > 0) {
                var itemIndex = currentElement.index();
                
                if (this.video.hasVideo(itemIndex)) {
                    var videoType = this.video.getPlayerType(itemIndex);
                    
                    if (videoType === 'youtube') {
                        var player = this.video.getPlayer(itemIndex, videoType);
                        
                        if (typeof player.playVideo === 'function') {
                            var playerState = player.getPlayerState();
                            this.resizeVideoIframeWithAspectRatio( videoSection )
                            if (playerState === 5) {
                                player.seekTo(0);
                                player.playVideo();
                            } else {
                                player.playVideo();
                            }
                            
                            hasVideo = true;
                        } else {
                            hasVideo = false;
                        }
                    }
                    
                    if (videoType === 'vimeo') {
                        var _player = this.video.getPlayer(itemIndex, videoType);
                        
                        this.resizeVideoIframeWithAspectRatio(videoSection);
                        
                        if (typeof _player.play === 'function') {
                            _player.play().then(function () {
                                _player.on('ended', _this11.vimeoOnPlayEnd.bind(_this11, _player));
                            });
                            
                            _player.on('play', function (data) {
                                _player.setCurrentTime(0);
                            });
                            
                            hasVideo = true;
                        } else {
                            hasVideo = false;
                        }
                    }
                    
                    if (videoType === 'html5') {
                        var _player2 = this.video.getPlayer(itemIndex, videoType);
                        
                        if (_player2.paused && _player2.readyState > 0) {
                            setTimeout(function () {
                                _player2.currentTime = 0;
                                
                                _player2.play();
                                
                                _player2.onended = _this11.html5OnPlayEnd.bind(_this11, _player2);
                            }, 500);
                        }
                        
                        hasVideo = true;
                    }
                    
                    if (this.options.autoplay && hasVideo) {
                        this.stopLoop('playVideoAnimation');
                    }
                }
            }
            
            this.videoPlaying = hasVideo;
        },
        vimeoOnPlayEnd: function vimeoOnPlayEnd(player, event) {
            if (this.options.autoplay & this.onMouseOver === false) {
                this.Next();
                player.off('ended');
            } else {
                player.setCurrentTime(0);
                player.play();
                player.on('ended', this.vimeoOnPlayEnd.bind(this, player));
                player.off('ended');
            }
        },
        resizeVideoIframeWithAspectRatio: function resizeVideoIframeWithAspectRatio(videoSection) {
            var videoUrl = this.video.getVideoSrc(videoSection.attr('data-video_src'))
            var c = $(window).width();
            var d = $(window).height();
            var n = { width: this.$outerStage.innerWidth(), height: this.$outerStage.innerHeight()}
            var i = { width: 16, height: 9 }
            var iframe;
            
            if( videoUrl.isYouTube !== null ||  videoUrl.isVimeo ){ 
                iframe = videoSection.find('.sp-video-container')
            }
            if( videoUrl.html5 ){
                iframe = videoSection.find('.sp-html5-video-container')
            }
            if( videoUrl.isVimeo ){
                iframe.removeAttr('height');
                iframe.removeAttr('width');
            }

            var h = i.width / i.height;
            var u = n.width / n.height;

            h > u ? (c = n.width, d = c / h) : (d = n.height, c = d * h)

            var f = (n.height - d) / 2;
            var p = (n.width - c) / 2;
           
            iframe.css({
                width: c,
                height: d,
                top: f,
                left: p
            });
        },
        resetItemVideoFrame: function resetItemVideoFrame(item) {
            var itemIndex = item.index();
            
            if (this.video.hasVideo(itemIndex)) {
                var videoType = this.video.getPlayerType(itemIndex);
                
                if (videoType === 'youtube') {
                    var player = this.video.getPlayer(itemIndex, videoType);
                    
                    if (typeof player.stopVideo === 'function') {
                        player.stopVideo();
                    }
                }
                
                if (videoType === 'vimeo') {
                    var _player3 = this.video.getPlayer(itemIndex, videoType);
                    
                    if (typeof _player3.pause === 'function') {
                        _player3.pause();
                    }
                }
                
                if (videoType === 'html5') {
                    var _player4 = this.video.getPlayer(itemIndex, videoType);
                    
                    if (!_player4.paused) {
                        _player4.pause();
                    }
                }
            }
        },
        
        /**
        * Update active and prevouse item style when change the slider 
        * 
        */
        updateItemStyle: function updateItemStyle(prevouseElem, currentElement) {
            var _this12 = this;
            
            this.animateIndicator('stop');
            /**
            * If current element has video background
            * Then initiate the video and play from background
            */
            
            this.playVideoAnimation(currentElement);
            
            if (this.options.animations === 'fade') {
                prevouseElem.removeClass('active');
                currentElement.css({
                    'opacity': 1
                });
                
                if (this._timeoutId2) {
                    clearTimeout(this._timeoutId2);
                    this._timeoutId2 = 0;
                }
                
                this._timeoutId2 = setTimeout(function () {
                    prevouseElem.css({
                        'opacity': 0
                    });
                    currentElement.removeClass('next-item');
                    prevouseElem.removeClass('prev-item');
                    
                    _this12.animateIndicator('start');
                }, this.options.speed);
                this.isAnimating = false;
            } // Slide
            
            
            if (this.options.animations === 'slide') {
                var dragEndPointer = this.prevCoordinate.dragPointer === -1 ? 0 : this.prevCoordinate.dragPointer;
                var translatePX = this.delta === -1 ? '-' + (100 - dragEndPointer) : 100 - dragEndPointer;
                var translateNX = this.delta === -1 ? 100 : -100;
                currentElement.css({
                    '-webkit-transition-duration': '0s',
                    '-webkit-transform': 'translate3D(' + translatePX + '%,0,0)'
                });
                
                if (this._timeoutId1) {
                    clearTimeout(this._timeoutId1);
                    this._timeoutId1 = 0;
                }
                
                this._timeoutId1 = setTimeout(function () {
                    currentElement.css({
                        '-webkit-transition-duration': _this12.options.speed + 'ms',
                        '-webkit-transform': 'translate3D(0,0,0)'
                    });
                    prevouseElem.css({
                        '-webkit-transition-duration': _this12.options.speed + 1500 + 'ms',
                        '-webkit-transform': 'translate3D(' + translateNX + '%,0,0)'
                    });
                }, 50);
                
                if (this._timeoutId2) {
                    clearTimeout(this._timeoutId2);
                    this._timeoutId2 = 0;
                }
                
                this._timeoutId2 = setTimeout(function () {
                    var _prevouseElem$css;
                    
                    _this12.isAnimating = false;
                    prevouseElem.removeClass('active');
                    
                    _this12.$element.find('.next-item').removeClass('next-item');
                    
                    _this12.$element.find('.prev-item').removeClass('prev-item');
                    
                    prevouseElem.css((_prevouseElem$css = {
                        '-webkit-transition-duration': '1s',
                        '-webkit-transform': 'translateX(100%)'
                    }, _prevouseElem$css["-webkit-transform"] = 'translate3D(100%,0,0)', _prevouseElem$css));
                    
                    _this12.animateIndicator('start');
                }, this.options.speed + 100);
            }
            /**
            * Scale animation 
            * max-scale = 3
            * min-scale = 1
            */
            
            
            if (this.options.animations === 'zoomOut' || this.options.animations === 'zoomIn') {
                var scaleTo = 1.4;
                var defaultScale = 1;
                var scaleType = this.options.animations;
                var TozoomOut = .8;
                
                if (scaleType === 'zoomIn') {
                    this.delta = -1 * this.delta;
                }
                
                if (this._timeoutId1) {
                    clearTimeout(this._timeoutId1);
                    this._timeoutId1 = 0;
                }
                
                if (this.delta === -1) {
                    currentElement.css({
                        '-webkit-transition-duration': '0s',
                        '-webkit-transform': 'scale3d(' + scaleTo + ',' + scaleTo + ',' + scaleTo + ')',
                        'opacity': 0
                    });
                    this._timeoutId1 = setTimeout(function () {
                        prevouseElem.css({
                            '-webkit-transition-duration': _this12.options.speed + 'ms',
                            '-webkit-transform-origin': '50% 50% 50%',
                            '-webkit-transform': 'scale3d(' + TozoomOut + ',' + TozoomOut + ',' + TozoomOut + ') ',
                            'opacity': 0,
                            'zIndex': 2
                        });
                        currentElement.css({
                            '-webkit-transition-duration': _this12.options.speed + 'ms',
                            'opacity': 1,
                            '-webkit-transform-origin': '50% 50% 50%',
                            '-webkit-transform': 'scale3d(' + defaultScale + ',' + defaultScale + ',' + defaultScale + ')',
                            zIndex: 1
                        });
                    }, 100);
                }
                
                if (this.delta === 1) {
                    currentElement.css({
                        '-webkit-transition-duration': '0s',
                        '-webkit-transform': 'scale3d(' + TozoomOut + ',' + TozoomOut + ',' + TozoomOut + ')'
                    });
                    this._timeoutId1 = setTimeout(function () {
                        prevouseElem.css({
                            '-webkit-transition-duration': _this12.options.speed + 'ms',
                            '-webkit-transform-origin': '50% 50% 50%',
                            '-webkit-transform': 'scale3d(' + scaleTo + ',' + scaleTo + ',' + scaleTo + ') ',
                            'opacity': 0,
                            'zIndex': 1
                        });
                        currentElement.css({
                            '-webkit-transition-duration': _this12.options.speed - 100 + 'ms',
                            'opacity': 1,
                            '-webkit-transform-origin': '50% 50% 50%',
                            '-webkit-transform': 'scale3d(' + defaultScale + ',' + defaultScale + ',' + defaultScale + ')',
                            zIndex: 2
                        });
                    }, 100);
                }
                
                if (this._timeoutId2) {
                    clearTimeout(this._timeoutId2);
                    this._timeoutId2 = 0;
                }
                
                this._timeoutId2 = setTimeout(function () {
                    prevouseElem.removeClass('active');
                    currentElement.removeClass('next-item');
                    prevouseElem.removeClass('prev-item');
                    _this12.isAnimating = false;
                    
                    _this12.animateIndicator('start');
                }, this.options.speed + 100);
            } // Stack
            
            
            if (this.options.animations === 'stack') {
                if (this._timeoutId1) {
                    clearTimeout(this._timeoutId1);
                    this._timeoutId1 = 0;
                }
                
                var _dragEndPointer = this.prevCoordinate.dragPointer === -1 ? 0 : this.prevCoordinate.dragPointer;
                
                if (this.delta === 1) {
                    var dragp = 100 - _dragEndPointer;
                    var setProperty = {
                        tx: dragp + '%',
                        ty: 0,
                        tz: 0,
                        sx: 1,
                        sy: 1,
                        sz: 1
                    };
                    var prevProperty = {
                        tx: 0,
                        ty: 0,
                        tz: 0,
                        sx: 1,
                        sy: 1,
                        sz: 1
                    };
                    
                    if (this.options.vertical_mode === true) {
                        setProperty = Object.assign({}, setProperty, {
                            tx: 0,
                            ty: dragp + '%',
                            sx: 1.2,
                            sy: 1.2,
                            sz: 1.2
                        });
                        prevProperty = Object.assign({}, prevProperty, {
                            tx: 0,
                            ty: "-" + dragp + "%",
                            sx: 1.2,
                            sy: 1.2,
                            sz: 1.2
                        });
                    }
                    
                    currentElement.css({
                        '-webkit-transition-duration': '0s',
                        '-webkit-transform': "translate3D(" + setProperty.tx + "," + setProperty.ty + "," + setProperty.tz + ") scale3D(" + setProperty.sx + "," + setProperty.sy + "," + setProperty.sz + ")"
                    });
                    this._timeoutId1 = setTimeout(function () {
                        currentElement.css({
                            '-webkit-transition-duration': _this12.options.speed + 'ms',
                            'opacity': 1,
                            '-webkit-transform': 'translate3D(0,0,0) scale3d(1,1,1)',
                            zIndex: 2
                        });
                        prevouseElem.css({
                            '-webkit-transition-duration': _this12.options.speed + 200 + 'ms',
                            '-webkit-transform': "perspective(1000px) translate3D(" + prevProperty.tx + "," + prevProperty.ty + "," + prevProperty.tz + ") scale3d(" + prevProperty.sx + "," + prevProperty.sy + "," + prevProperty.sz + ")",
                            'opacity': .5,
                            'zIndex': 1
                        });
                    }, 50);
                }
                
                if (this.delta === -1) {
                    var _dragp = _dragEndPointer - 100;
                    
                    var _setProperty = {
                        tx: _dragp + '%',
                        ty: 0,
                        tz: 0,
                        sx: 1,
                        sy: 1,
                        sz: 1
                    };
                    var _prevProperty = {
                        tx: 0,
                        ty: 0,
                        tz: 0,
                        sx: 1,
                        sy: 1,
                        sz: 1
                    };
                    
                    if (this.options.vertical_mode) {
                        _setProperty = Object.assign({}, _setProperty, {
                            tx: 0,
                            ty: _dragp + '%',
                            sx: 1,
                            sy: 1,
                            sz: 1
                        });
                        _prevProperty = Object.assign({}, _prevProperty, {
                            tx: 0,
                            ty: -_dragp + '%',
                            sx: 1.2,
                            sy: 1.2,
                            sz: 1.2
                        });
                    }
                    
                    currentElement.css({
                        '-webkit-transition-duration': '0s',
                        '-webkit-transform': "translate3D(" + _setProperty.tx + "," + _setProperty.ty + "," + _setProperty.tz + ") scale3D(" + _setProperty.sx + "," + _setProperty.sy + "," + _setProperty.sz + ")"
                    });
                    this._timeoutId1 = setTimeout(function () {
                        currentElement.css({
                            '-webkit-transition-duration': _this12.options.speed + 'ms',
                            '-webkit-transform': 'translate3D(0,0,0) ',
                            'opacity': 1,
                            zIndex: 2
                        });
                        prevouseElem.css({
                            '-webkit-transition-duration': _this12.options.speed + 'ms',
                            '-webkit-transform': "translate3D(" + _prevProperty.tx + "," + _prevProperty.ty + "," + _prevProperty.tz + ") scale3d(" + _prevProperty.sx + "," + _prevProperty.sy + "," + _prevProperty.sz + ")",
                            'opacity': .5,
                            'zIndex': 1
                        });
                    }, 50);
                }
                
                if (this._timeoutId2) {
                    clearTimeout(this._timeoutId2);
                    this._timeoutId2 = 0;
                }
                
                this._timeoutId2 = setTimeout(function () {
                    prevouseElem.removeClass('active');
                    currentElement.removeClass('next-item');
                    prevouseElem.removeClass('prev-item');
                    _this12.isAnimating = false;
                    
                    _this12.animateIndicator('start');
                }, this.options.speed + 100);
            } // Clip animation
            
            
            if (this.options.animations === 'clip') {
                var _dragEndPointer2 = this.prevCoordinate.dragPointer === -1 ? 0 : this.prevCoordinate.dragPointer;
                
                var opacity = 0;
                var transformX = 5;
                
                if (this.prevCoordinate.dragPointer !== -1) {
                    opacity = _dragEndPointer2 * 0.001;
                    opacity = opacity > 1 ? 1 : Math.abs(opacity);
                    var x = transformX - Math.abs(_dragEndPointer2 * (transformX / 800));
                    transformX = x > transformX ? transformX : x < 0 ? 0 : x;
                }
                
                if (this._timeoutId1) {
                    clearTimeout(this._timeoutId1);
                    this._timeoutId1 = 0;
                }
                
                if (this.delta === 1) {
                    currentElement.css({
                        '-webkit-transition-duration': '0s',
                        '-webkit-transform': "translate3D(" + transformX + "%,0,0)",
                        'clip': "rect(auto, " + this.outerWidth + "px, auto, 0px)",
                        'zIndex': 2,
                        'opacity': opacity
                    });
                    this._timeoutId1 = setTimeout(function () {
                        prevouseElem.css({
                            '-webkit-transition-duration': _this12.options.speed + 'ms',
                            '-webkit-transform': "translate3D(0,0,0)",
                            'clip': "rect(auto, 0px, auto,  0px)",
                            'opacity': 1,
                            'zIndex': 3
                        });
                        currentElement.css({
                            '-webkit-transition-duration': _this12.options.speed + 'ms',
                            'opacity': 1,
                            '-webkit-transform': 'translate3D(0,0,0)'
                        });
                    }, 100);
                }
                
                if (this.delta === -1) {
                    currentElement.css({
                        '-webkit-transition-duration': '0s',
                        '-webkit-transform': "translate3D(-" + transformX + "%,0,0)",
                        'clip': "rect(auto, " + this.outerWidth + "px, auto, 0px)",
                        'zIndex': 2,
                        'opacity': opacity
                    });
                    this._timeoutId1 = setTimeout(function () {
                        prevouseElem.css({
                            '-webkit-transition-duration': _this12.options.speed + 'ms',
                            '-webkit-transform': "translate3D(0,0,0)",
                            'clip': "rect(auto, " + _this12.outerWidth + "px, auto, " + _this12.outerWidth + "px)",
                            'opacity': 1,
                            'zIndex': 3
                        });
                        currentElement.css({
                            '-webkit-transition-duration': _this12.options.speed + 'ms',
                            'opacity': 1,
                            '-webkit-transform': 'translate3D(0,0,0)'
                        });
                    }, 100);
                }
                
                prevouseElem.removeClass('active');
                
                if (this._timeoutId2) {
                    clearTimeout(this._timeoutId2);
                    this._timeoutId2 = 0;
                }
                
                this._timeoutId2 = setTimeout(function () {
                    currentElement.removeClass('next-item');
                    prevouseElem.removeClass('prev-item');
                    _this12.isAnimating = false;
                    
                    _this12.animateIndicator('start');
                }, this.options.speed);
            } // Bubble slider
            
            
            if (this.options.animations === 'bubble') {
                var _opacity = 1;
                prevouseElem.css({
                    'zIndex': 1
                });
                
                if (this.delta === 1) {
                    currentElement.css({
                        '-webkit-transition-duration': '.25s',
                        '-webkit-transform': "scale3D(1,1,1)",
                        '-webkit-transition-timing-function': 'cubic-bezier(1, 0.26, 0.18, 1.22)',
                        'zIndex': 2,
                        'opacity': _opacity
                    });
                }
                
                if (this.delta === -1) {
                    currentElement.css({
                        '-webkit-transition-duration': '.25s',
                        '-webkit-transform': "scale3D(1,1,1)",
                        '-webkit-transition-timing-function': 'cubic-bezier(1, 0.26, 0.18, 1.22)',
                        'zIndex': 2,
                        'opacity': _opacity
                    });
                }
                
                this._timeoutId1 = setTimeout(function () {
                    currentElement.css({
                        '-webkit-transition-duration': _this12.options.speed + 'ms',
                        '-webkit-transform': "scale3D(1,1,1)",
                        '-webkit-transition-timing-function': 'linear',
                        'opacity': 1,
                        'clip-path': "circle(100% at 50% 50%)"
                    });
                }, 500);
                
                if (this._timeoutId2) {
                    clearTimeout(this._timeoutId2);
                    this._timeoutId2 = 0;
                }
                
                this._timeoutId2 = setTimeout(function () {
                    var n = Math.floor(Math.random() * 50) + 20;
                    var n2 = Math.floor(Math.random() * 40) + 20;
                    prevouseElem.css({
                        '-webkit-transition-duration': '0s',
                        '-webkit-transform': "scale3D(0,0,0)",
                        'clip-path': "circle(" + _this12.options.bubble_size + " at " + n + "% " + n2 + "%)",
                        'opacity': 1,
                        'visibility': 'visible',
                        'zIndex': 1
                    });
                    prevouseElem.removeClass('active');
                    currentElement.removeClass('next-item');
                    prevouseElem.removeClass('prev-item');
                    _this12.isAnimating = false;
                    
                    _this12.animateIndicator('start');
                }, this.options.speed + 500);
            } //Reset previous item video controls
            
            
            this.resetItemVideoFrame(prevouseElem); // Start loop if click on controller 
            
            if (this.options.autoplay && this.timer === 0 && this.videoPlaying === false) {
                this.startLoop();
            }
            
            this.updateCaption();
        },
        hideOtherItemCaptions: function hideOtherItemCaptions() {
            var _this13 = this;
            
            var hideCaptions = function hideCaptions(item) {
                var layers = $(item).find('[data-layer="true"]');
                
                if (layers.length > 0) {
                    layers.each(function (i, cap) {
                        var delay = _this13.options.speed;
                        $(cap).css({
                            "transition": "opacity " + delay + "ms linear",
                            'opacity': 0
                        });
                        setTimeout(function () {
                            $(cap).css({
                                'visibility': 'hidden'
                            });
                        }, _this13.options.speed);
                    });
                }
            };
            
            if (this.item.next('.sp-item').length > 0) {
                var allNextElement = this.item.nextAll('.sp-item');
                allNextElement.each(function (index, item) {
                    hideCaptions(item);
                });
            }
            
            if (this.item.prev('.sp-item').length > 0) {
                var _allNextElement = this.item.prevAll('.sp-item');
                
                _allNextElement.each(function (index, item) {
                    hideCaptions(item);
                });
            }
        },
        
        /**
        * Start caption animation by the caption type
        */
        updateCaption: function updateCaption() {
            var layers = this.item.find('[data-layer="true"]');
            this.hideOtherItemCaptions();
            
            if (layers.length > 0) {
                var jsSlider = this;
                var animation = this.captionAnimation();
                layers.each(function (e) {
                    $(this).css({
                        "visibility": "visible"
                    });
                    var hasAnimation = $(this).attr('data-animation');
                    
                    if (typeof hasAnimation === 'undefined') {
                        return;
                    }
                    
                    var defaultAnimation = Object.assign({}, jsSlider.captionAnimationProperty);
                    
                    if (typeof hasAnimation !== 'undefined') {
                        hasAnimation = JSON.parse(hasAnimation);
                    } // Marge with default animation settings
                    
                    
                    hasAnimation = Object.assign(defaultAnimation, hasAnimation);
                    hasAnimation.after = parseInt(hasAnimation.after);
                    
                    if (hasAnimation.type === 'width') {
                        animation.width($(this), hasAnimation);
                    }
                    
                    if (hasAnimation.type === 'text-animate') {
                        animation.text($(this), hasAnimation);
                    }
                    
                    if (hasAnimation.type === 'slide') {
                        animation.slider($(this), hasAnimation);
                    }
                    
                    if (hasAnimation.type === 'zoom') {
                        animation.zoom($(this), hasAnimation);
                    }
                    
                    if (hasAnimation.type === 'rotate') {
                        animation.rotate($(this), hasAnimation);
                    }
                    
                    if (hasAnimation.type === 'flip') {
                        animation.flip($(this), hasAnimation);
                    }
                });
            }
        },
        
        /**
        * Create caption animation property 
        */
        captionAnimation: function captionAnimation() {
            var animation = {};
            
            animation.text = function (element, animationProperty) {
                var tx = '0px',
                ty = '0px';
                if (animationProperty.direction === 'top') ty = '-500px';
                if (animationProperty.direction === 'bottom') ty = '500px';
                if (animationProperty.direction === 'left') tx = '-500px';
                if (animationProperty.direction === 'right') tx = '500px';
                /**
                * Enable current element visibility and opacity enable when its active slider item
                */
                
                element.css({
                    'visibility': 'visibile',
                    'opacity': 1
                });
                
                if (element.hasClass('sp-letter-trimed')) {
                    self = this;
                    element.find('span').each(function () {
                        $(this).css({
                            'transform': "translateY(" + ty + ") translateX(" + tx + ")",
                            'display': 'inline-block',
                            'opacity': 0
                        });
                    });
                } else {
                    var chars = element.text().trim().split('');
                    element.empty();
                    $.each(chars, function (i, l) {
                        if (l !== ' ') {
                            var span = "<span class=\"sp-txt" + i + "\" style=\"transform: translateY(" + ty + ") translateX(" + tx + "); display:inline-block; opacity:0\">" + l + "</span>";
                            element.append(span);
                        } else {
                            element.append('&nbsp;');
                        }
                    });
                    element.addClass('sp-letter-trimed');
                }
                
                setTimeout(function () {
                    var chrsSpans = element.find('span');
                    chrsSpans.each(function (i, item) {
                        var _this14 = this;
                        
                        var delay = (i + 1) * (animationProperty.duration / chrsSpans.length) + 500;
                        setTimeout(function () {
                            $(_this14).css({
                                'opacity': 1,
                                '-webkit-transition-property': 'opacity transform',
                                'transform': 'translateY(0px) translateX(0)',
                                '-webkit-transition-duration': animationProperty.duration + 'ms',
                                '-webkit-transition-timing-function': animationProperty.timing_function
                            });
                        }, delay);
                    });
                }, animationProperty.after);
            };
            
            animation.width = function (elment, animationProperty) {
                elment.css({
                    'width': animationProperty.from,
                    '-webkit-transition-duration': '0s',
                    'overflow': 'hidden'
                });
                setTimeout(function () {
                    elment.css({
                        'width': animationProperty.to,
                        '-webkit-transition-duration': animationProperty.duration + 'ms',
                        '-webkit-transition-timing-function': animationProperty.timing_function,
                        '-webkit-transition-property': 'width transform'
                    });
                }, animationProperty.after);
            }; // slider animation
            
            
            animation.slider = function (element, animationProperty) {
                if (animationProperty.direction === 'left') {
                    element.css({
                        'opacity': '0',
                        '-webkit-transform': "translateX(-" + animationProperty.from + ")",
                        '-webkit-transition-duration': '0s'
                    });
                    this.sliderVertical(element, animationProperty);
                }
                
                if (animationProperty.direction === 'right') {
                    element.css({
                        'opacity': '0',
                        '-webkit-transform': "translateX(" + animationProperty.from + ")",
                        '-webkit-transition-duration': '0s'
                    });
                    this.sliderVertical(element, animationProperty);
                }
                
                if (animationProperty.direction === 'top') {
                    element.css({
                        'opacity': '0',
                        '-webkit-transform': "translateY(" + animationProperty.from + ")",
                        '-webkit-transition-duration': '0s'
                    });
                    this.sliderHorizontal(element, animationProperty);
                }
                
                if (animationProperty.direction === 'bottom') {
                    element.css({
                        'opacity': '0',
                        '-webkit-transform': "translateY(" + animationProperty.from + ")",
                        '-webkit-transition-duration': '0s'
                    });
                    this.sliderHorizontal(element, animationProperty);
                }
            }, // Vertical slider
            animation.sliderVertical = function (element, animationProperty) {
                setTimeout(function () {
                    element.css({
                        'opacity': '1',
                        '-webkit-transition-duration': animationProperty.duration + 'ms',
                        '-webkit-transition-timing-function': animationProperty.timing_function,
                        '-webkit-transition-property': 'opacity, transform, height, width',
                        '-webkit-transition-origin': '50% 50% 0',
                        '-webkit-transform': "translateX(" + animationProperty.to + ")"
                    });
                }, animationProperty.after);
            }, // Horizontal slider
            animation.sliderHorizontal = function (element, animationProperty) {
                setTimeout(function () {
                    element.css({
                        'opacity': '1',
                        '-webkit-transition-duration': animationProperty.duration + 'ms',
                        '-webkit-transition-timing-function': animationProperty.timing_function,
                        '-webkit-transition-property': 'opacity, transform, height, width',
                        '-webkit-transition-origin': '50% 50% 0',
                        '-webkit-transform': "translateY(" + animationProperty.to + ")"
                    });
                }, animationProperty.after);
            }, // Zoom animation
            animation.zoom = function (element, animationProperty) {
                if (animationProperty.direction === 'zoomIn') {
                    element.css({
                        'opacity': 1,
                        '-webkit-transform': "scale(" + animationProperty.from + ")",
                        '-webkit-transition-duration': '0s'
                    });
                    this.zooming(element, animationProperty);
                }
                
                if (animationProperty.direction === 'zoomOut') {
                    element.css({
                        'opacity': 1,
                        '-webkit-transform': "scale(" + animationProperty.from + ")",
                        '-webkit-transition-duration': '0s'
                    });
                    this.zooming(element, animationProperty);
                }
            }; // zooming action (zoomIn|zoomOut)
            
            animation.zooming = function (element, animationProperty) {
                setTimeout(function () {
                    element.css({
                        'opacity': 1,
                        '-webkit-transition-duration': animationProperty.duration + 'ms',
                        '-webkit-transition-timing-function': animationProperty.timing_function,
                        '-webkit-transition-property': 'transform, scale',
                        '-webkit-transition-origin': '50% 50% 0',
                        '-webkit-transform': "scale(" + animationProperty.to + ")"
                    });
                }, animationProperty.after);
            }; // Rotate object
            
            
            animation.rotate = function (element, animationProperty) {
                element.css({
                    '-webkit-transform': "rotate(" + animationProperty.from + ")",
                    '-webkit-transition-duration': '0s',
                    'opacity': 0
                });
                this.rotating(element, animationProperty);
            }; // Rotate action (clock|anti-clock)
            
            
            animation.rotating = function (element, animationProperty) {
                setTimeout(function () {
                    element.css({
                        '-webkit-transition-duration': animationProperty.duration + 'ms',
                        '-webkit-transition-timing-function': animationProperty.timing_function,
                        '-webkit-transition-property': 'transform,rotate',
                        '-webkit-transition-origin': animationProperty.origin,
                        '-webkit-transform': "rotate(" + animationProperty.to + ")",
                        'opacity': 1
                    });
                }, animationProperty.after);
            }; // Rotate object
            
            
            animation.flip = function (element, animationProperty) {
                var x = 0,
                y = 0,
                z = 0;
                var rotate = 180;
                
                if (animationProperty.direction === 'x') {
                    x = 1;
                }
                
                if (animationProperty.direction === 'y') {
                    y = 1;
                    rotate = -1 * rotate;
                }
                
                if (animationProperty.direction !== 'x' && animationProperty.direction !== 'y') {
                    x = 1;
                }
                
                element.css({
                    '-webkit-transform': "perspective(400px) rotate3d(" + x + ", " + y + ", " + z + ", " + rotate + "deg)",
                    '-webkit-transition-duration': '0s',
                    'backface-visibility': 'hidden',
                    'opacity': 1
                });
                this.fliping(element, animationProperty);
            }; // Rotate action (clock|anti-clock)
            
            
            animation.fliping = function (element, animationProperty) {
                setTimeout(function () {
                    element.css({
                        '-webkit-transition-duration': animationProperty.duration + 'ms',
                        '-webkit-transition-timing-function': animationProperty.timing_function,
                        '-webkit-transition-property': 'transform,rotate,opacity',
                        '-webkit-transition-origin': animationProperty.origin,
                        '-webkit-transform': "perspective(400px) rotate3d(0, 0, 0, 0deg)",
                        'opacity': 1
                    });
                }, animationProperty.after);
            };
            
            return animation;
        },
        
        /**
        * Change the opacity/x-axis based on dragPointer to the active item and next item vice versa
        * It will work only on dragging over the slider 
        * direction right side drag
        */
        dragoverActionToNextItem: function dragoverActionToNextItem(dragPointer) {
            if (this.options.animations === 'fade') {
                if (this.item.next('.sp-item').length) {
                    var currentItem = this.item.next('.sp-item');
                    currentItem.addClass('next-item').css({
                        'opacity': dragPointer
                    });
                } else {
                    var _currentItem = this.$element.find('.sp-item:first-child');
                    
                    _currentItem.addClass('next-item').css({
                        'opacity': dragPointer
                    });
                }
                
                this.item.addClass('prev-item').css({
                    'opacity': 1 - dragPointer
                });
            } // Slide
            
            
            if (this.options.animations === 'slide' || this.options.animations === 'stack') {
                this.$element.find('.dragenable').css({
                    '-webkit-transition-duration': '0s',
                    '-webkit-transform': 'translate3D(0,0,0)'
                }).removeClass('dragenable next-item');
                var dragP = dragPointer > 100 ? 100 : dragPointer;
                this.item.addClass('prev-item');
                var _currentItem2 = '';
                
                if (this.item.next('.sp-item').length) {
                    _currentItem2 = this.item.next('.sp-item');
                } else {
                    _currentItem2 = this.$element.find('.sp-item:first-child');
                }
                
                var ItemCssProperty = {
                    '-webkit-transition-duration': '0s',
                    '-webkit-transform': 'translate3D(-' + dragP + '%,0,0)' // Only for vertical mode
                    
                };
                var transformProperty = {
                    x: 100 - dragP + '%',
                    y: 0,
                    z: 0
                };
                if (this.options.vertical_mode) transformProperty = Object.assign({}, transformProperty, {
                    x: 0,
                    y: 100 - dragP + '%'
                });
                var prevCssProperty = {
                    '-webkit-transition-duration': '0s',
                    '-webkit-transform': "translate3D(" + transformProperty.x + "," + transformProperty.y + "," + transformProperty.z + ")"
                };
                
                if (this.options.animations === 'stack') {
                    prevCssProperty.opacity = 1;
                    prevCssProperty.zIndex = 3;
                }
                
                if (this.options.animations === 'slide') {
                    this.item.css(ItemCssProperty);
                }
                
                _currentItem2.addClass('dragenable next-item').css(prevCssProperty);
            } // Zoom
            
            
            if (this.options.animations === 'zoomIn' || this.options.animations === 'zoomOut') {
                var sliderType = this.options.animations;
                var scaleRange = dragPointer * 0.1;
                
                if (sliderType === 'zoomOut') {
                    scaleRange += 1;
                    scaleRange = scaleRange > 2 ? 2 : scaleRange;
                }
                
                if (sliderType === 'zoomIn') {
                    scaleRange = 1 - scaleRange;
                    scaleRange = scaleRange < 0 ? 0 : scaleRange;
                }
                
                this.item.addClass('prev-item');
                var _currentItem3 = '';
                
                if (this.item.next('.sp-item').length) {
                    _currentItem3 = this.item.next('.sp-item');
                } else {
                    _currentItem3 = this.$element.find('.sp-item:first-child');
                }
                
                _currentItem3.addClass('dragenable next-item').css({
                    '-webkit-transition-duration': '0s',
                    '-webkit-transform-origin': '50% 50% 50%',
                    '-webkit-transform': 'scale3d(1,1,1)',
                    'opacity': 1,
                    zIndex: 1
                });
                
                this.item.css({
                    '-webkit-transition-duration': '0s',
                    '-webkit-transform-origin': '50% 50% 50%',
                    '-webkit-transform': 'scale3d(' + scaleRange + ',' + scaleRange + ',' + scaleRange + ')',
                    'opacity': 1 - dragPointer * 0.1,
                    zIndex: 2
                });
            } // Clip
            
            
            if (this.options.animations === 'clip') {
                var opacity = dragPointer * 0.001;
                opacity = opacity > 1 ? 1 : opacity;
                
                var _dragP = dragPointer > this.outerWidth ? this.outerWidth : dragPointer;
                
                var transformX = 15;
                var x = transformX - Math.abs(_dragP * (transformX / 1000));
                transformX = x > transformX ? transformX : x < 0 ? 0 : x;
                this.item.addClass('prev-item');
                var _currentItem4 = '';
                
                if (this.item.next('.sp-item').length) {
                    _currentItem4 = this.item.next('.sp-item');
                } else {
                    _currentItem4 = this.$element.find('.sp-item:first-child');
                }
                
                this.item.css({
                    '-webkit-transition-duration': '0s',
                    '-webkit-transform': "translate3D(0,0,0)",
                    'clip': "rect(auto, " + (this.outerWidth - _dragP) + "px, auto, 0px)",
                    'opacity': 1,
                    'zIndex': 3
                });
                
                _currentItem4.addClass('next-item').css({
                    '-webkit-transition-duration': '0s',
                    '-webkit-transform': "translate3D(" + transformX + "%,0,0)",
                    'clip': "rect(auto, " + this.outerWidth + "px, auto, 0px)",
                    'zIndex': 2,
                    'opacity': opacity
                });
            }
        },
        
        /**
        * Change the opacity to the active item and prev item vice versa
        * Active the function only on dragging item 
        * direction left side drag
        */
        dragoverActionToPrevItem: function dragoverActionToPrevItem(dragPointer) {
            //Fade In
            if (this.options.animations === 'fade') {
                if (this.item.prev('.sp-item').length) {
                    var currentItem = this.item.prev('.sp-item');
                    currentItem.addClass('next-item').css({
                        'opacity': dragPointer
                    });
                } else {
                    var _currentItem5 = this.$element.find('.sp-item:last-child');
                    
                    _currentItem5.addClass('next-item').css({
                        'opacity': dragPointer
                    });
                }
                
                this.item.addClass('prev-item').css({
                    'opacity': 1 - dragPointer
                });
            } //Slide
            
            
            if (this.options.animations === 'slide' || this.options.animations === 'stack') {
                this.$element.find('.dragenable').css({
                    '-webkit-transition-duration': '0s',
                    '-webkit-transform': 'translate3D(0,0,0)'
                }).removeClass('dragenable next-item');
                var dragP = dragPointer > 100 ? 100 : dragPointer;
                var prevItem = '';
                this.item.addClass('prev-item');
                
                if (this.item.prev('.sp-item').length) {
                    prevItem = this.item.prev('.sp-item');
                } else {
                    prevItem = this.$element.find('.sp-item:last-child');
                }
                
                var transformProperty = {
                    x: dragP - 100 + '%',
                    y: 0,
                    z: 0
                };
                if (this.options.vertical_mode) transformProperty = Object.assign({}, transformProperty, {
                    x: 0,
                    y: dragP - 100 + '%'
                });
                var prevCssProperty = {
                    '-webkit-transition-duration': '0s',
                    '-webkit-transform': "translate3D(" + transformProperty.x + "," + transformProperty.y + "," + transformProperty.z + ")"
                };
                var itemCssProperty = {
                    '-webkit-transition-duration': '0s',
                    '-webkit-transform': 'translate3D(' + dragP + '%,0,0)'
                };
                
                if (this.options.animations === 'stack') {
                    prevCssProperty.opacity = 1;
                    prevCssProperty.zIndex = 3;
                }
                
                if (this.options.animations === 'slide') {
                    this.item.css(itemCssProperty);
                }
                
                prevItem.addClass('dragenable next-item').css(prevCssProperty);
            } // Zoom
            
            
            if (this.options.animations === 'zoomIn' || this.options.animations === 'zoomOut') {
                var sliderType = this.options.animations;
                var scaleRange = dragPointer * 0.25;
                
                if (sliderType === 'zoomOut') {
                    scaleRange += 1;
                    scaleRange = scaleRange > 2 ? 2 : scaleRange;
                }
                
                if (sliderType === 'zoomIn') {
                    scaleRange = 1 - scaleRange;
                    scaleRange = scaleRange < .2 ? .2 : scaleRange;
                }
                
                this.item.addClass('prev-item');
                var _currentItem6 = '';
                
                if (this.item.prev('.sp-item').length) {
                    _currentItem6 = this.item.prev('.sp-item');
                } else {
                    _currentItem6 = this.$element.find('.sp-item:last-child');
                }
                
                _currentItem6.addClass('dragenable next-item').css({
                    '-webkit-transition-duration': '0s',
                    '-webkit-transform-origin': '50% 50% 50%',
                    '-webkit-transform': 'scale3d(1,1,1)',
                    'opacity': 1,
                    zIndex: 1
                });
                
                this.item.css({
                    '-webkit-transition-duration': '0s',
                    '-webkit-transform-origin': '50% 50% 50%',
                    '-webkit-transform': 'scale3d(' + scaleRange + ',' + scaleRange + ',' + scaleRange + ')',
                    'opacity': 1 - dragPointer * 0.1,
                    zIndex: 2
                });
            } // Clip
            
            
            if (this.options.animations === 'clip') {
                var opacity = dragPointer * 0.001;
                opacity = opacity > 1 ? 1 : Math.abs(opacity);
                
                var _dragP2 = dragPointer > this.outerWidth ? this.outerWidth : dragPointer;
                
                _dragP2 = Math.abs(_dragP2);
                var transformX = 5;
                var x = transformX - Math.abs(_dragP2 * (transformX / 1000));
                transformX = x > transformX ? transformX : x < 0 ? 0 : x;
                this.item.addClass('prev-item');
                var _currentItem7 = '';
                
                if (this.item.prev('.sp-item').length) {
                    _currentItem7 = this.item.prev('.sp-item');
                } else {
                    _currentItem7 = this.$element.find('.sp-item:last-child');
                }
                
                this.item.css({
                    '-webkit-transition-duration': '0s',
                    '-webkit-transform': "translate3D(0,0,0)",
                    'clip': "rect(auto, " + this.outerWidth + "px, auto, " + _dragP2 + "px)",
                    'opacity': 1,
                    'zIndex': 3
                });
                
                _currentItem7.addClass('next-item').css({
                    '-webkit-transition-duration': '0s',
                    '-webkit-transform': "translate3D(-" + transformX + "%,0,0)",
                    'clip': "rect(auto, " + this.outerWidth + "px, auto, 0px)",
                    'zIndex': 2,
                    'opacity': opacity
                });
            }
        },
        
        /**
        * Reset coordination operation
        * When start dragging save some mouse coordinate for calculate the position 
        * So when release the drag it will reset the config to inital setting
        * 
        * Also check if some item already change the opacity on drag operation
        */
        resetCoordiante: function resetCoordiante() {
            var diff = this.prevCoordinate.diff;
            
            if (this.options.animations === 'fade') {
                if (diff > 0) {
                    if (this.item.next('.sp-item').length) this.item.next('.sp-item').css({
                        'opacity': 0
                    });else this.$element.find('.sp-item:first-child').css({
                        'opacity': 0
                    });
                }
                
                if (diff < 0) {
                    if (this.item.prev('.sp-item').length) this.item.prev('.sp-item').css({
                        'opacity': 0
                    });else this.$element.find('.sp-item:last-child').css({
                        'opacity': 0
                    });
                }
                
                this.item.css({
                    'opacity': 1
                });
            }
            
            this.$element.find('.dragenable').removeClass('dragenable');
            this.prevCoordinate = {
                x: 0,
                y: 0,
                diff: 0,
                dragPointer: -1
            };
            this.coordinate = {
                x: 0,
                y: 0
            };
            
            if (this.options.autoplay && this.timer === 0 && this.videoPlaying === false) {
                this.startLoop();
            }
        },
        
        /**
        * Back to stage if not drag enough to satisfy condition
        */
        backToStage: function backToStage() {
            var _this15 = this;
            
            var animType = this.options.animations;
            
            if (animType === 'zoomIn' || animType === 'zoomOut') {
                this.item.css({
                    '-webkit-transition-duration': this.options.speed + 'ms',
                    '-webkit-transform': 'scale3d(1,1,1)',
                    'opacity': 1
                });
            }
            
            if (animType === 'slide' || animType === 'stack') {
                var currentItem = this.$element.find('.next-item');
                var differentCoordinate = this.prevCoordinate.diff;
                var transformProperty = {
                    x: '100%',
                    y: 0,
                    z: 0
                };
                if (this.options.vertical_mode) transformProperty = Object.assign({}, transformProperty, {
                    x: 0,
                    y: '100%'
                });
                
                if (differentCoordinate > 0) {
                    currentItem.css({
                        '-webkit-transition-duration': this.options.speed + 'ms',
                        '-webkit-transform': "translate3d(" + transformProperty.x + "," + transformProperty.y + "," + transformProperty.z + ")"
                    });
                }
                
                if (differentCoordinate < 0) {
                    currentItem.css({
                        '-webkit-transition-duration': this.options.speed + 'ms',
                        '-webkit-transform': "translate3d(-" + transformProperty.x + ",-" + transformProperty.y + "," + transformProperty.z + ")"
                    });
                }
                
                setTimeout(function () {
                    currentItem.removeClass('next-item');
                    
                    _this15.item.removeClass('prev-item');
                }, this.options.speed);
                this.item.css({
                    '-webkit-transition-duration': this.options.speed + 'ms',
                    '-webkit-transform': 'translate3d(0,0,0)'
                });
            }
        },
        
        /**
        * Bind all triggered methods 
        * Its hold every events for the current slider
        */
        bindEvents: function bindEvents() {
            var jsSlider = this;
            /**
            * Trigger for next slider item 
            * 
            * If autoloop enable then stop the loop first 
            * 
            * Then release next slider
            */
            
            if (jsSlider.options.nav) {
                jsSlider.$nextBtn.on('click' + '.' + jsSlider._name, function (e) {
                    if (jsSlider.isAnimating === false) {
                        //Stop autoloop if true
                        if (jsSlider.options.autoplay) {
                            jsSlider.stopLoop('bindEvents');
                        } // Release next slider item 
                        
                        
                        jsSlider.Next(); // Check callback function
                        
                        jsSlider.checkCallBackMethod.call(jsSlider);
                    }
                });
                /**
                * Trigger for prev slider item 
                * 
                * Release the prev slider 
                * 
                * If autoloop enable then stop the loop first 
                */
                
                jsSlider.$prevBtn.on('click' + '.' + jsSlider._name, function (e) {
                    if (jsSlider.isAnimating === false) {
                        // Release prev slider item
                        jsSlider.Prev(); // Stop autoloop if true
                        
                        if (jsSlider.options.autoplay) {
                            jsSlider.stopLoop('bindEvents');
                        } // Check callback function
                        
                        
                        jsSlider.checkCallBackMethod.call(jsSlider);
                    }
                });
            }
            /**
            * Check click event for each dots 
            * 
            */
            
            
            if (jsSlider.options.dots) {
                jsSlider.$dotContainer.find('li').each(function (index) {
                    $(this).on('click' + '.' + jsSlider._name, function (e) {
                        if ($(this).hasClass('active') || jsSlider.isAnimating === true) return false;
                        
                        if (jsSlider.options.autoplay) {
                            jsSlider.stopLoop('bindEvents');
                        }
                        
                        var activeDotNav = $(this).parent().find('li.active');
                        var activeIndex = jsSlider.$dotContainer.find('li').index(activeDotNav);
                        var delta = activeIndex > index ? -1 : 1;
                        jsSlider.slideFromPosition(index + 1, delta);
                        jsSlider.updateDotsFromPosition(index + 1); //Call jsSlider
                        
                        jsSlider.checkCallBackMethod.call(jsSlider);
                    });
                });
            }
            
            $(document).on("click." + jsSlider._name, '.sp-volumn-control', this.controlVideoVolumn.bind(this));
            jsSlider.$outerStage.on('mouseenter' + '.' + jsSlider._name, $.proxy(jsSlider.onMouseEnter, jsSlider));
            jsSlider.$outerStage.on('mouseleave' + '.' + jsSlider._name, $.proxy(jsSlider.onMouseLeave, jsSlider));
            jsSlider.$outerStage.on('mousedown' + '.' + jsSlider._name, $.proxy(jsSlider.onDragStart, jsSlider));
            jsSlider.$outerStage.on('mouseup' + '.' + jsSlider._name + ' touchend' + '.' + jsSlider._name, $.proxy(jsSlider.onDragEnd, jsSlider));
            jsSlider.$outerStage.on('touchstart' + '.' + jsSlider._name, $.proxy(jsSlider.onDragStart, jsSlider));
            jsSlider.$outerStage.on('touchcancel' + '.' + jsSlider._name, $.proxy(jsSlider.onDragEnd, jsSlider));
            $(window).focus(function () {
                if (jsSlider.options.autoplay && jsSlider.timer === 0 && this.videoPlaying === false) {
                    jsSlider.startLoop();
                }
            });
            $(window).blur(function () {
                if (jsSlider.options.autoplay) {
                    jsSlider.stopLoop('window.blur');
                }
                
                jsSlider.destroy();
            });
            $(window).on('resize' + '.' + jsSlider._name, $.proxy(jsSlider.windowResize, jsSlider));
        },
        windowResize: function windowResize(e) {
            if (typeof e === 'undefined') return;
            this.updateResponsiveView();
        },
        parseResponsiveViewPort: function parseResponsiveViewPort() {
            if (typeof this.options.responsive === 'undefined') return null;
            var responsiveProps = this.options.responsive;
            var activeView = null;
            var wWidth = window.innerWidth;
            
            for (var i = 0; i < responsiveProps.length; i++) {
                if (wWidth > responsiveProps[i].viewport) {
                    activeView = responsiveProps[i];
                    break;
                }
            }
            
            if (activeView === null) {
                activeView = responsiveProps[responsiveProps.length - 1];
            }
            
            return activeView;
        },
        updateResponsiveView: function updateResponsiveView() {
            var wHeight = window.innerHeight;
            var videoSection = this.item.find('div[data-video_src]');
            
            if (videoSection.length > 0) {
                this.resizeVideoIframeWithAspectRatio(videoSection);
            }
            
            if (typeof this.options.responsive === 'undefined') {
                this.$outerStage.css({
                    height: wHeight + 'px'
                });
                return;
            }
            
            var jsSlider = this;
            var viewPort = jsSlider.parseResponsiveViewPort();
            
            if (viewPort.height === 'full') {
                if (this._lastViewPort === wHeight) return;
                this._lastViewPort = wHeight;
                this.$outerStage.css({
                    height: wHeight + 'px'
                });
            } else {
                if (this._lastViewPort === viewPort.height) return;
                this._lastViewPort = viewPort.height;
                this.$outerStage.css({
                    height: viewPort.height
                });
            }
        },
        
        /**
        * Get mouse position
        * @on touch device 
        * @on destkop
        */
        getPosition: function getPosition(event) {
            var result = {
                x: null,
                y: null
            };
            event = event.originalEvent || event || window.event;
            event = event.touches && event.touches.length ? event.touches[0] : event.changedTouches && event.changedTouches.length ? event.changedTouches[0] : event;
            
            if (event.pageX) {
                result.x = event.pageX;
                result.y = event.pageY;
            } else {
                result.x = event.clientX;
                result.y = event.clientY;
            }
            
            return result;
        },
        onMouseEnter: function onMouseEnter(event) {
            if( this.options.autoplay_stop_on_hover ){ 
                this.onMouseOver = true;
            }
            if (this.options.autoplay && this.timer > 0 && this.options.autoplay_stop_on_hover && this.videoPlaying === false) {
                this.stopLoop('onMouseEnter');
            }
        },
        onMouseLeave: function onMouseLeave(event) {
            if( this.options.autoplay_stop_on_hover ){ 
                this.onMouseOver = false;
            }
            if (this.options.autoplay && this.timer === 0 && this.videoPlaying === false && this.options.autoplay_stop_on_hover) {
                this.startLoop();
            }
        },
        onDragStart: function onDragStart(event) {
            var jsSlider = this;
            if (event.which === 3 || event.which === 2 || jsSlider.isAnimating === true) return false;
            var position = jsSlider.getPosition(event);
            jsSlider.coordinate.x = position.x;
            jsSlider.coordinate.y = position.y;
            $(document).one('mousemove' + '.' + jsSlider._name + ' touchmove' + '.' + jsSlider._name, $.proxy(function (event) {
                $(document).on('mousemove' + '.' + jsSlider._name + ' touchmove' + '.' + jsSlider._name, $.proxy(jsSlider.onDragMove, jsSlider));
                event.preventDefault();
            }, this));
            jsSlider.isDragging = true;
        },
        onDragMove: function onDragMove(event) {
            var jsSlider = this;
            
            if (jsSlider.isDragging === false) {
                return;
            }
            
            if (jsSlider.options.autoplay) {
                jsSlider.stopLoop('onDragMove');
            }
            
            var position = jsSlider.getPosition(event);
            var coordinate = jsSlider.coordinate;
            var prevCoordinate = jsSlider.prevCoordinate;
            var dragDirection = jsSlider.options.vertical_mode; // 1 = horizontal
            
            if (prevCoordinate.x !== position.x && dragDirection === false || prevCoordinate.y !== position.y && dragDirection === true) {
                var different = dragDirection ? coordinate.y - position.y : coordinate.x - position.x;
                var dragPercentage = 0;
                
                if (jsSlider.options.animations === 'slide' || jsSlider.options.animations === 'stack') {
                    dragPercentage = (99 / 1000 * Math.abs(different)).toFixed(0);
                } else if (jsSlider.options.animations === 'clip') {
                    dragPercentage = different;
                } else {
                    dragPercentage = (5 / 1000 * Math.abs(different)).toFixed(2);
                }
                
                jsSlider.prevCoordinate = {
                    x: position.x,
                    y: position.y,
                    diff: different,
                    dragPointer: dragPercentage
                };
                
                if (different > 0) {
                    jsSlider.dragoverActionToNextItem(dragPercentage);
                }
                
                if (different < 0) {
                    jsSlider.dragoverActionToPrevItem(dragPercentage);
                }
            }
            
            event.preventDefault();
        },
        onDragEnd: function onDragEnd(event) {
            var jsSlider = this;
            
            if (jsSlider.isDragging) {
                var differentCoordinate = jsSlider.prevCoordinate.diff;
                
                if (Math.abs(differentCoordinate) > 100) {
                    if (differentCoordinate > 0) {
                        jsSlider.Next();
                    }
                    
                    if (differentCoordinate < 0) {
                        jsSlider.Prev();
                    }
                } else {
                    jsSlider.backToStage();
                }
                
                jsSlider.isDragging = false;
            }
            
            jsSlider.resetCoordiante();
        },
        controlVideoVolumn: function controlVideoVolumn(event) {
            var element = $(event.target);
            var type = element.attr('data-type');
            var index = element.attr('data-index');
            var player = this.player["item_" + index].player;
            
            if (type === 'html5') {
                player.muted = !player.muted;
                player.volume = player.muted ? 0 : 1;
            }
            
            if (type === 'youtube') {
                if (!player.isMuted()) {
                    player.mute();
                } else {
                    player.unMute();
                }
            }
            
            if (type === 'vimeo') {
                player.getVolume().then(function (volume) {
                    player.setVolume(volume > 0 ? 0 : 1);
                });
            }
            
            if (!element.hasClass('sp-sound-enabled')) {
                // Turn on 
                element.addClass('sp-sound-enabled fa-volume-up').removeClass('fa-volume-off');
            } else {
                // Turn off 
                element.removeClass('sp-sound-enabled fa-volume-up').addClass('fa-volume-off');
            }
        },
        checkCallBackMethod: function checkCallBackMethod() {
            this.callback();
        },
        callback: function callback() {
            var onChange = this.options.onChange;
            
            if (typeof onChange === 'function') {
                var items = this.$element.find('.sp-item').length;
                var option = {
                    item: this.item,
                    items: items,
                    element: this.$element
                };
                onChange.call(this.element, option);
            }
        }
    });
    
    $.fn.jsSlider = function (options) {
        this.each(function () {
            if (!$.data(this, pluginName)) {
                $.data(this, pluginName, new Plugin(this, options));
            }
        });
        return this;
    };
    
    $.fn.jsSlider.defaults = {
        animations: '3D',
        //slide, fade, stack, 3D, clip, bubble
        rotate: 10,
        //3D Rotate
        autoplay: false,
        autoplay_stop_on_hover: false,
        bubble_size: '40px',
        //bubble slider
        indicator: true,
        indicator_type: 'line',
        indicator_class: '',
        speed: 800,
        interval: 4500,
        onChange: null,
        vertical_mode: false,
        dots: true,
        dots_class: '',
        dot_indicator: true,
        show_number: false,
        slider_number_class: '',
        nav: true,
        nav_text: ['<', '>']
    };
})(jQuery, window, document);

(function($){
    $(document).ready(function () {
        $('.sppb-addon-sp-slider').each(function(index){
            var slider = $(this);
            //Height
            var sliderHeight = slider.data('height');
            var sliderHeightSm = slider.data('height-sm');
            var sliderHeightXs = slider.data('height-xs');
            //Slider animation
            var sliderAnimation = slider.data('slider-animation');
            var sliderVertically = slider.data('slide-vertically');
            var threeDRotate = slider.data('3d-rotate');
            //autoplay & controllers
            var sliderAutoplay = slider.data('autoplay');
            var sliderPause = slider.data('pause-hover');
            var sliderInerval = slider.data('interval');
            var sliderTimer = slider.data('timer');
            var sliderSpeed = slider.data('speed');
            var sliderDotControl= slider.data('dot-control');
            var sliderArrowControl= slider.data('arrow-control');
            var sliderIndecator= slider.data('indecator');
            var sliderArrowContent= slider.data('arrow-content');
            var dotStyle = slider.data('dot-style');
            if(dotStyle === 'with_text'){
                dotStyle = '.sp-slider-custom-dot-indecators';
            } else {
                dotStyle = '';
            }
            //Slide count
            var slideCount = slider.data('slide-count');
            //Arrow text
            var arrowLeft = '';
            var arrowRight = '';
            if(sliderArrowContent === 'icon_only'){
                arrowLeft = '<i class="fa fa-angle-left"></i>';
                arrowRight = '<i class="fa fa-angle-right"></i>';
            } else if(sliderArrowContent==='long_arrow'){
                arrowLeft = '<i class="fa fa-long-arrow-left"></i>';
                arrowRight = '<i class="fa fa-long-arrow-right"></i>';
            } else if(sliderArrowContent==='icon_with_text'){
                arrowLeft = '<i class="fa fa-long-arrow-left"></i> Prev';
                arrowRight = 'Next <i class="fa fa-long-arrow-right"></i>';
            } else {
                arrowLeft = 'Prev';
                arrowRight = 'Next';
            }
            
            slider.jsSlider({
                autoplay: sliderAutoplay,
                autoplay_stop_on_hover: sliderPause,
                animations: sliderAnimation,
                rotate: threeDRotate,
                vertical_mode: sliderVertically,
                interval: sliderInerval,
                indicator: sliderTimer,
                speed: sliderSpeed,
                dots_class: dotStyle,
                dots: sliderDotControl,
                dot_indicator: sliderIndecator,
                nav: sliderArrowControl,
                nav_text : [arrowLeft,arrowRight],
                show_number: slideCount,
                responsive: [
                    {
                        viewport: 1170,
                        height:sliderHeight
                    },
                    {
                        viewport: 600,
                        height: sliderHeightSm
                    },
                    {
                        viewport: 480,
                        height: '480px'
                    },
                    {
                        viewport: 320,
                        height: sliderHeightXs
                    },
                ]
            });
            //set text thumbnail width
            if($('.sp-slider-custom-dot-indecators').length > 0){
                var getDom = $('.sp-slider-custom-dot-indecators ul li');
                var getThubWidth = getDom.outerWidth(true);
                var getDomLength = getDom.length;
                var totalWidth = getThubWidth * getDomLength;
                $('.sp-slider-custom-dot-indecators ul').css('width', totalWidth + 'px');
                var contWidth = $('.sp-slider-custom-dot-indecators').outerWidth(true);
                if(contWidth < totalWidth){
                    $('.sp-slider-custom-dot-indecators').css('overflowX', 'scroll')
                }
                $(window).on('resize', function () {
                    var totalWidth = getThubWidth * getDomLength;
                    var contWidth = $('.sp-slider-custom-dot-indecators').outerWidth(true);
                    if(contWidth < totalWidth){
                        $('.sp-slider-custom-dot-indecators').css('overflowX', 'scroll')
                    }
                });
            }
            
        });
        
        var observer = new MutationObserver(function( mutations ) {
            
            mutations.forEach(function( mutation ) {
                var newNodes = mutation.addedNodes;
                if( newNodes !== null ) {
                    var $nodes = $( newNodes );
                    
                    $nodes.each(function() {
                        var $node = $( this );
                        $node.find('.sppb-addon-sp-slider').each(function (){
                            var slider = $(this);
                            //Height
                            var sliderHeight = slider.data('height');
                            var sliderHeightSm = slider.data('height-sm');
                            var sliderHeightXs = slider.data('height-xs');
                            //Slider animation
                            var sliderAnimation = slider.data('slider-animation');
                            var sliderVertically = slider.data('slide-vertically');
                            var threeDRotate = slider.data('3d-rotate');
                            //autoplay & controllers
                            var sliderAutoplay = slider.data('autoplay');
                            var sliderPause = slider.data('pause-hover');
                            var sliderInerval = slider.data('interval');
                            var sliderTimer = slider.data('timer');
                            var sliderSpeed = slider.data('speed');
                            var sliderDotControl= slider.data('dot-control');
                            var sliderArrowControl= slider.data('arrow-control');
                            var sliderIndecator= slider.data('indecator');
                            var sliderArrowContent= slider.data('arrow-content');
                            var dotStyle = slider.data('dot-style');
                            
                            if(dotStyle === 'with_text'){
                                dotStyle = '.sp-slider-custom-dot-indecators';
                            } else {
                                dotStyle = '';
                            }
                            //Slide count
                            var slideCount = slider.data('slide-count');
                            //Arrow text
                            var arrowLeft = '';
                            var arrowRight = '';
                            if(sliderArrowContent === 'icon_only'){
                                arrowLeft = '<i class="fa fa-angle-left"></i>';
                                arrowRight = '<i class="fa fa-angle-right"></i>';
                            } else if(sliderArrowContent==='long_arrow'){
                                arrowLeft = '<i class="fa fa-long-arrow-left"></i>';
                                arrowRight = '<i class="fa fa-long-arrow-right"></i>';
                            } else if(sliderArrowContent==='icon_with_text'){
                                arrowLeft = '<i class="fa fa-long-arrow-left"></i> Prev';
                                arrowRight = 'Next <i class="fa fa-long-arrow-right"></i>';
                            } else {
                                arrowLeft = 'Prev';
                                arrowRight = 'Next';
                            }
                            
                            slider.jsSlider({
                                autoplay: sliderAutoplay,
                                autoplay_stop_on_hover: sliderPause,
                                animations: sliderAnimation,
                                vertical_mode: sliderVertically,
                                rotate: threeDRotate,
                                interval: sliderInerval,
                                indicator: sliderTimer,
                                speed: sliderSpeed,
                                dots: sliderDotControl,
                                dots_class: dotStyle,
                                dot_indicator: sliderIndecator,
                                nav: sliderArrowControl,
                                nav_text : [arrowLeft,arrowRight],
                                show_number: slideCount,
                                responsive: [
                                    {
                                        viewport: 1170,
                                        height:sliderHeight
                                    },
                                    {
                                        viewport: 600,
                                        height: sliderHeightSm
                                    },
                                    {
                                        viewport: 480,
                                        height: '480px'
                                    },
                                    {
                                        viewport: 320,
                                        height: sliderHeightXs
                                    },
                                ]
                            }); 
                            //set text thumbnail width
                            if($('.sp-slider-custom-dot-indecators').length > 0){
                                var getDom = $('.sp-slider-custom-dot-indecators ul li');
                                var getThubWidth = getDom.outerWidth(true);
                                var getDomLength = getDom.length;
                                var totalWidth = getThubWidth * getDomLength;
                                $('.sp-slider-custom-dot-indecators ul').css('width', totalWidth + 'px');
                                var contWidth = $('.sp-slider-custom-dot-indecators').outerWidth(true);
                                if(contWidth < totalWidth){
                                    $('.sp-slider-custom-dot-indecators').css('overflowX', 'scroll')
                                }
                                $(window).on('resize', function () {
                                    var totalWidth = getThubWidth * getDomLength;
                                    var contWidth = $('.sp-slider-custom-dot-indecators').outerWidth(true);
                                    if(contWidth < totalWidth){
                                        $('.sp-slider-custom-dot-indecators').css('overflowX', 'scroll')
                                    }
                                });
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
        
        // Pass in the target node, as well as the observer options
        observer.observe(document.body, config);
    });
})(jQuery)
