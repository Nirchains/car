"use strict";

/**
* @package SP Page Builder
* @author JoomShaper http://www.joomshaper.com
* @copyright Copyright (c) 2010 - 2020 JoomShaper
* @license http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 or later
*/
;

(function ($, window, document, undefined) {
  var pluginName = 'spCarousel'; // Create the plugin constructor

  function Plugin(element, options) {
    /*
      Provide local access to the DOM node(s) that called the plugin,
      as well local access to the plugin name and default options.
    */
    this.element = element;
    this.elementWidth = 0;
    this._name = pluginName;
    this.item = null;
    this.delta = 1;
    this.isAnimating = false;
    this.isDragging = false; //interval clear 

    this.timer = 0;
    this._timeoutId1 = 0;
    this._timeoutId2 = 0;
    this.resizeTimer = 0;
    this._dotControllerTimeId = 0;
    this._lastViewPort = 0;
    this.viewPort = null;
    this.responsiveRefreshRate = 200;
    this.itemWidth = 0;
    this._clones = 0;
    this._items = 0;
    this.windowWidth = $(window).width();
    this._itemCoordinate = [];
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
    this._defaults = $.fn.spCarousel.defaults;
    /*
        The "$.extend" method merges the contents of two or more objects,
        and stores the result in the first object.
    */

    this.options = $.extend({}, this._defaults, options); // Check if has valid array nav_text 

    if (this.options.nav_text.length !== 2) {
      console.warn("nav text must be need two control element!");
      this.options.nav_text = ['<', '>'];
    } //Check if speed is bigger than interval then make they both equal


    if (this.options.speed > this.options.interval) {
      this.options.speed = this.options.interval;
    }
    /*
        The "init" method is the starting point for all plugin logic.
    */


    this.init();
  }

  $.extend(Plugin.prototype, {
    init: function init() {
      // Build cache for first rendering and search target element
      this.buildCache(); // Create necessary html DOM and element cache

      this.createHtmlDom(); // Apply initial style for next initiative

      this.applyBasicStyle(); // Apply all bind event into this function

      this.bindEvents(); // On inital start animation

      this.triggerOnStart(); //Check if autoplay set true 

      if (this.options.autoplay) {
        this.startLoop(); // Start auto play
      }
    },
    animationType: function animationType(type) {
      return typeof this.options.animationType !== 'undefined' && this.options.animationType === type;
    },
    // Trigger animation element on inital time
    triggerOnStart: function triggerOnStart() {
      // Trigger dot indicator if its enable 
      if (this.options.dot_indicator && this.options.dots) {
        var currentActiveDot = this.$dotContainer.find('li.active');
        this.animateDotIndicator(currentActiveDot, 'start');
      }
    },

    /**
     * On browswer close or tab change 
     * Remove plugin instance completely
     */
    destroy: function destroy() {
      this.unbindEvents();
      this.$outerStage.children('.clone').remove();
      this.$outerStage.unwrap();
      this.$outerStage.children().unwrap();
      this.$sliderList.unwrap();

      if (this.options.dots) {
        this.$dotContainer.parent('.sppb-carousel-extended-dots').remove();
      }

      if (this.options.nav) {
        this.$nextBtn.parent('.sppb-carousel-extended-nav-control').remove();
      }

      this.$element.removeData(this._name);
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
     * Definetly check user settings and create object based on it
     */
    createHtmlDom: function createHtmlDom() {
      // Create outersatge for grab intire slider
      this.createOuterStage();

      if (typeof this.options.responsive !== 'undefined') {
        this.parseResponsiveViewPort();
      } // Do calculate total items and clone numbers


      this.itemProfessor(); // Create nav element if nav setting enable

      if (this.options.nav) {
        this.createNavigationController();
      } // Create dots element if dots setting enable


      if (this.options.dots) {
        this.createDotsController();
      } // Clone the items that counted before in itemProcessor


      this.cloneItems();
    },

    /**
     * Slider professor which calculate and mesure whole slider needs 
     * @elementWidth = Total slider width with margin 
     * @itemWidth = each item width 
     * @_clones = Need to clone number of items 
     * @_maxL = maximum length of items 
     * @_minL = minimum length of items
     */
    itemProfessor: function itemProfessor() {
      this._numberOfItems = this.$element.find('.sppb-carousel-extended-item').length;
      var centerPadding = this.options.centerPadding;

      if (this.viewPort !== null) {
        this.options.items = typeof this.viewPort.items === 'undefined' ? this.options.items : this.viewPort.items;
        centerPadding = typeof this.viewPort.centerPadding === 'undefined' ? this.options.centerPadding : this.viewPort.centerPadding;
      }

      this.elementWidth = this.$element.outerWidth() + this.options.margin;
      this.itemWidth = this.options.center ? Math.abs((this.elementWidth - centerPadding * 2) / this.options.items) : Math.abs(this.elementWidth / this.options.items);
      this._clones = this._numberOfItems > this.options.items ? Math.ceil(this._numberOfItems / 2) : this.options.items;
      this._maxL = this.itemWidth * (this._numberOfItems + (this._clones - 1));
      this._minL = this.options.center === false ? this.itemWidth * this._clones : this.itemWidth * this._clones - centerPadding;
    },

    /**
     * Clone items and set the clone ones before and after the current items 
     */
    cloneItems: function cloneItems() {
      var cloneBefore = [];
      var cloneAfter = [];
      var css = this.animationType('fadeIn') ? {
        opacity: 1
      } : {};

      for (var i = 0; i < this._clones; i++) {
        if (i < this.options.items) {
          this.$element.find(".sppb-carousel-extended-item:nth-child(" + (i + 1) + ")").addClass('active').css(css);
        }

        cloneBefore.push(this.$element.find(".sppb-carousel-extended-item:nth-child(" + (this._numberOfItems - i) + ")").clone(true).addClass('clone').removeClass('active'));
        cloneAfter.push(this.$element.find(".sppb-carousel-extended-item:nth-child(" + (i + 1) + ")").clone(true).addClass('clone').removeClass('active'));
      }

      if (this.options.center) {
        this.applyCenterMode(0, this.options.items - 1);
      }

      this.appendBefore(cloneBefore);
      this.appendAfter(cloneAfter); // Calculate item coordinate 

      this.calculateItemCoordinate();
    },
    // Append before item
    appendBefore: function appendBefore(clones) {
      var _this = this;

      clones.map(function (item) {
        _this.$outerStage.prepend(item);
      });
    },
    // Append after item
    appendAfter: function appendAfter(clones) {
      var _this2 = this;

      clones.map(function (item) {
        _this2.$outerStage.append(item);
      });
    },

    /**
     * Find each children width and do parallal sum operation and store in array
     */
    calculateItemCoordinate: function calculateItemCoordinate() {
      var spCarousel = this;
      var child_ = this.$outerStage.children();
      child_.each(function (i, obj) {
        spCarousel._itemCoordinate.push((i + 1) * spCarousel.itemWidth);
      });
    },

    /**
     * Create outerstage for holding tightly and 
     * give slider a confortable apperance
     */
    createOuterStage: function createOuterStage() {
      this.sliderList = document.createElement('div');
      this.sliderList.setAttribute('class', 'sppb-carousel-extended-list');
      this.outerStage = document.createElement('div');
      this.outerStage.setAttribute('class', 'sppb-carousel-extended-outer-stage');
      this.outerStage.innerHTML = this.$element.html();

      if (this.options.center === true) {
        this.$element.addClass('sppb-carousel-extended-center');
      }

      if (this.animationType('fadeIn')) {
        this.$element.addClass('sppb-carousel-fadeIn');
      }

      if (this.animationType('fadeOut')) {
        this.$element.addClass('sppb-carousel-fadeOut');
      }

      this.sliderList.append(this.outerStage);
      this.$element.html(this.sliderList);
      this.$outerStage = $(this.outerStage);
      this.$sliderList = $(this.sliderList);
    },

    /**
     * Add navigation controller arrow 
     * @options.nav = true
     */
    createNavigationController: function createNavigationController() {
      // build controlls
      var controllerBox = document.createElement('div');
      controllerBox.setAttribute('class', 'sppb-carousel-extended-nav-control');
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
      var dotBox = document.createElement('div');
      dotBox.setAttribute('class', 'sppb-carousel-extended-dots');
      this.$element.append(dotBox);
      var spCarousel = this;
      var dotContainer = document.createElement('ul');
      var viewPort = null;
      if (typeof this.options.responsive !== 'undefined') viewPort = this.parseResponsiveViewPort();
      var items = viewPort === null ? this.options.items : typeof viewPort.items === 'undefined' ? this.options.items : viewPort.items;
      var dotLength = Math.floor(this._numberOfItems / items);

      if (dotLength > 1) {
        for (var i = 0; i < dotLength; i++) {
          var dotItem = document.createElement('li');
          dotItem.setAttribute('class', 'sppb-carousel-extended-dot-' + i);
          $(dotItem).css({
            '-webkit-transition': 'all 0.5s ease 0s',
            'transition': 'all 0.5s ease 0s',
          });

          if (i === 0) {
            $(dotItem).addClass('active');
          } // Dot indicator                        


          if (spCarousel.options.dot_indicator) {
            var dotIndicator = document.createElement('span');
            dotIndicator.setAttribute('class', 'sppb-carousel-extended-dot-indicator');
            dotItem.append(dotIndicator);
          }

          dotContainer.append(dotItem);
        }
      }

      dotBox.append(dotContainer);
      this.$element.append(dotBox); //Cache dot container

      this.$dotContainer = $(dotContainer);
    },

    /**
     * Apply base css property on initial hook 
     */
    applyBasicStyle: function applyBasicStyle() {
      var totalItems = 0;
      var cssPropety = {};
      cssPropety.width = this.itemWidth - this.options.margin + 'px';

      if (this.options.margin > 0) {
        cssPropety.marginRight = this.options.margin + 'px';
      }

      if (this.animationType('fadeIn')) {
        cssPropety.transition = "opacity " + this.options.speed + "ms";
      }

      this.$element.find('.sppb-carousel-extended-item').each(function () {
        totalItems++;
        $(this).css(cssPropety);
      });
      this._currentPosition = this._clones * this.itemWidth;

      if (this.options.center === true) {
        var centerPadding = typeof this.viewPort.centerPadding === 'undefined' ? this.options.centerPadding : this.viewPort.centerPadding;
        this._currentPosition = this._clones * this.itemWidth - centerPadding;
      }

      this.$outerStage.css({
        '-webkit-transition-duration': '0s',
        '-webkit-transform': "translate3D(-" + this._currentPosition + "px,0px,0px)",
        width: totalItems * this.itemWidth + 'px'
      });
      this._items = totalItems;
      this.updateResponsiveView();
    },

    /**
     * Start auto play loop with user provided interval
     * @interval = options.interval or default interval 
     * save each interval for force stop the loop
     */
    startLoop: function startLoop() {
      var _this3 = this;

      this.timer = setInterval(function () {
        if (_this3.isAnimating === false) _this3.Next();
      }, this.options.interval);
    },

    /**
     * Stop auto loop on trigger
     */
    stopLoop: function stopLoop() {
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
      // this.isAnimating = true
      if (this.delta === -1) this.delta = 1;
      this.updateItemStyle();
    },

    /**
     * Go prevouse slider item 
     * @if prevouse slider item is first one then go to last slider 
     * It will be looping on thread if you continousely click prev icon
     * 
     * Save the active item to the item object (globally) 
     */
    Prev: function Prev() {
      // this.isAnimating = true
      if (this.delta === 1) this.delta = -1;
      this.updateItemStyle();
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
      // this.isAnimating = true
      var updatedPosition = this.itemWidth * (this.options.items * position);
      var newPosition = position === 0 ? this._minL : this._minL + updatedPosition;
      var transition = this.animationType('fadeIn') ? '0s' : "all " + this.options.speed + "ms ease 0s";
      this.$outerStage.css({
        '-webkit-transition': transition,
        'transition': transition,
        '-webkit-transform': "translate3D(-" + newPosition + "px,0px,0px)",
        'transform': "translate3D(-" + newPosition + "px,0px,0px)"
      });
      this._currentPosition = newPosition;
      /**
       * Detect am I click the next elment of active one or prev element
       * If prev element then slide from left otherwise from right
       */

      this.delta = delta;
      this.processActivationWorker();
    },
    updateDotsFromPosition: function updateDotsFromPosition(position) {
      var _this4 = this;

      var prevActiveDot = this.$dotContainer.find('li.active').removeClass('active');
      var currentActiveDot = this.$dotContainer.find('li:nth-child(' + position + ')').addClass('active');

      if (this.options.dot_indicator) {
        this.animateDotIndicator(prevActiveDot, 'stop');

        if (this._dotControllerTimeId > 0) {
          clearTimeout(this._dotControllerTimeId);
          this._dotControllerTimeId = 0;
        }

        this._dotControllerTimeId = setTimeout(function () {
          _this4.animateDotIndicator(currentActiveDot, 'start');
        }, this.options.speed);
      }

      currentActiveDot.css({
        '-webkit-transition': 'all 0.5s ease 0s',
        'transition': 'all 0.5s ease 0s',
      });
    },

    /**
     * Check action 
     * If its start then get the speed between interval and slider speed 
     * Then set the transition duration
     * @param {DOM} dotItem 
     * @param {string} action 
     */
    animateDotIndicator: function animateDotIndicator(dotItem, action) {
      if (action === 'stop') {
        dotItem.find('.sppb-carousel-extended-dot-indicator').removeClass('active').css({
          '-webkit-transition-duration': '0s',
          'transition-duration': '0s',
        });
      }

      if (action === 'start') {
        var speed = Math.abs(this.options.interval - this.options.speed);
        dotItem.find('.sppb-carousel-extended-dot-indicator').addClass('active').css({
          '-webkit-transition-duration': speed + 'ms',
          'transition-duration': speed + 'ms',
        });
      }
    },

    /**
     * Update active and prevouse item style when change the slider 
     * 
     * Check if the new position gretter then Maximum length 
     * Then set the new position to minimum length 
     * 
     * Check if the new position gretter then Minimum length 
     * Then set the new psoition to maximum length
     * 
     * Update the @_currentPosition with new position
     */
    updateItemStyle: function updateItemStyle() {
      var _this5 = this;

      if (this._timeoutId1 > 0) {
        clearTimeout(this._timeoutId1);
        this._timeoutId1 = 0;
      }

      var dragEndPointer = this.prevCoordinate.dragPointer === -1 ? 0 : this.prevCoordinate.dragPointer;
      var currentPosition = this._currentPosition;
      var thePosition = this.itemWidth;

      if (this.options.items > 1) {
        thePosition += parseInt(dragEndPointer);
      }

      var newPosition = this.delta === 1 ? currentPosition + thePosition : currentPosition - thePosition;

      if (newPosition > this._maxL) {
        this.$outerStage.css({
          '-webkit-transition': "0s",
          'transition': "0s",
          '-webkit-transform': "translate3D(-" + (this._minL - this.itemWidth) + "px,0px,0px)",
          'transform': "translate3D(-" + (this._minL - this.itemWidth) + "px,0px,0px)",
        });
        newPosition = this._minL;
      }

      if (currentPosition < this._minL) {
        this.$outerStage.css({
          'transition': "0s",
          '-webkit-transform': "translate3D(-" + this._maxL + "px,0px,0px)",
          'transform': "translate3D(-" + this._maxL + "px,0px,0px)",
        });
        newPosition = this._maxL - this.itemWidth;
      }

      if (this.isDragging && this.options.items > 1) {
        var itemCoordinate = this._itemCoordinate;
        var centerPadding = typeof this.viewPort.centerPadding === 'undefined' ? this.options.centerPadding : this.viewPort.centerPadding;
        var found = false;

        for (var i = 0; i < itemCoordinate.length; i++) {
          if (itemCoordinate[i] > newPosition) {
            newPosition = this.options.center === true ? itemCoordinate[i] - centerPadding : itemCoordinate[i];
            found = true;
          }

          if (found === true) break;
        }
      }

      var setOuterStageTransition = function setOuterStageTransition() {
        var transition = _this5.animationType('fadeIn') ? "0s" : "all " + _this5.options.speed + "ms ease 0s";

        _this5.$outerStage.css({
          '-webkit-transition': transition,
          'transition': transition,
          '-webkit-transform': "translate3D(-" + newPosition + "px,0px,0px)",
          'transform': "translate3D(-" + newPosition + "px,0px,0px)",
        });

        _this5.$outerStage.bind('transitionend', function () {
          _this5.checkTransitionEndCallback.call(_this5);
        });
      };

      if (this.animationType('fadeIn')) {
        setOuterStageTransition();
      } else {
        this._timeoutId1 = setTimeout(setOuterStageTransition, 100);
      }

      this._currentPosition = newPosition;
      this.processActivationWorker(); // Start loop if click on controller 

      if (this.options.autoplay && this.timer === 0) {
        this.startLoop();
      }
    },
    getNextActiveItems: function getNextActiveItems() {
      return this.$outerStage.find('.active');
    },
    getStartAndEndIndex: function getStartAndEndIndex() {
      var currentStagePosition = this._currentPosition;
      var startIndex = Math.floor(currentStagePosition / this.itemWidth);
      startIndex = this.options.center ? startIndex + 1 : startIndex; // let items = this.options.center ? this.options.items+1 : this.options.items

      var endIndex = Math.floor(Math.abs(this.options.items + startIndex));
      return {
        startIndex: startIndex,
        endIndex: endIndex
      };
    },
    resetFadeState: function resetFadeState() {
      this.$outerStage.children(":not(.active)").css({
        left: 0,
        transition: '',
        opacity: 0,
        zIndex: ''
      });
    },

    /**
     * Add / Remove active class from visible elements  
     * 
     */
    processActivationWorker: function processActivationWorker() {
      if (this.animationType('fadeIn')) {
        this.resetFadeState();
      }

      var _this$getStartAndEndI = this.getStartAndEndIndex(),
          startIndex = _this$getStartAndEndI.startIndex,
          endIndex = _this$getStartAndEndI.endIndex;

      var activeItem = this.getNextActiveItems();
      activeItem.removeClass('active');

      for (var i = startIndex; i < endIndex; i++) {
        var _activeItem = this.$outerStage.children(':eq(' + i + ')');

        _activeItem.addClass('active');

        if (this.animationType('fadeIn')) {
          var activeItemIndex = activeItem.index();
          var moveIndex = Math.abs(activeItemIndex - i);
          moveIndex = activeItemIndex + 1 === Math.abs(this._clones - this._items) && this.delta === 1 ? moveIndex * -1 : moveIndex;
          var movePosition = this.delta * (this.itemWidth * moveIndex);
          var css = {
            left: movePosition + 'px',
            transition: '',
            zIndex: 1,
            opacity: 1
          };
          activeItem.css(css);

          _activeItem.css({
            'transition': "opacity " + this.options.speed + "ms ease",
            zIndex: 2,
            'opacity': 1
          });

          _activeItem.bind('transitionend', this.resetFadeState.bind(this));
        }
      }

      if (this.options.center) {
        this.applyCenterMode(startIndex, endIndex);
      }

      var reminder = Math.floor((startIndex - this._clones) / this.options.items) + 1;

      if (this.options.dots) {
        this.$dotContainer.find('.active').removeClass('active');
        this.$dotContainer.find('li:nth-child(' + reminder + ')').addClass('active');
      }
    },

    /**
     * Add center mode class when center enable
     * @param {Int} start 
     * @param {Int} end 
     */
    applyCenterMode: function applyCenterMode(startIndex, endIndex) {
      var centerEq = Math.floor((startIndex + endIndex) / 2);
      this.$outerStage.find('.sppb-carousel-extended-item-center').removeClass('sppb-carousel-extended-item-center');
      this.$outerStage.children(':eq(' + centerEq + ')').addClass('sppb-carousel-extended-item-center');
    },

    /**
     * Change the opacity/x-axis based on dragPointer to the active item and next item vice versa
     * It will work only on dragging over the slider 
     * direction right side drag
     */
    dragoverActionToNextItem: function dragoverActionToNextItem(dragPointer) {
      var _this6 = this;

      var currentPosition = this._currentPosition;
      var newPosition = currentPosition + parseInt(dragPointer);

      if (newPosition > this._maxL) {
        newPosition = this._minL - this.itemWidth + parseInt(dragPointer);
      }

      if (this._timeoutId2 > 0) {
        clearTimeout(this._timeoutId2);
        this._timeoutId2 = 0;
      }

      this._timeoutId2 = setTimeout(function () {
        _this6.$outerStage.css({
          '-webkit-transition': "0s",
          'transition': "0s",
          '-webkit-transform': "translate3D(-" + newPosition + "px,0px,0px)",
          'transform': "translate3D(-" + newPosition + "px,0px,0px)",
        });
      }, 0);
    },

    /**
     * Change the opacity to the active item and prev item vice versa
     * Active the function only on dragging item 
     * direction left side drag
     */
    dragoverActionToPrevItem: function dragoverActionToPrevItem(dragPointer) {
      var _this7 = this;

      var currentPosition = this._currentPosition;
      var newPosition = currentPosition - parseInt(dragPointer);

      if (newPosition < this._minL - this.itemWidth) {
        newPosition = this._maxL - parseInt(dragPointer);
      }

      if (this._timeoutId2 > 0) {
        clearTimeout(this._timeoutId2);
        this._timeoutId2 = 0;
      }

      this._timeoutId2 = setTimeout(function () {
        _this7.$outerStage.css({
          '-webkit-transition': "0s",
          'transition': "0s",
          '-webkit-transform': "translate3D(-" + newPosition + "px,0px,0px)",
          'transform': "translate3D(-" + newPosition + "px,0px,0px)"
        });
      }, 0);
    },

    /**
     * Reset coordination operation
     * When start dragging save some mouse coordinate for calculate the position 
     * So when release the drag it will reset the config to inital setting
     * 
     * Also check if some item already change the opacity on drag operation
     */
    resetCoordiante: function resetCoordiante() {
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

      if (this.options.autoplay && this.timer === 0) {
        this.startLoop();
      }
    },

    /**
     * Back to stage if not drag enough to satisfy condition
     */
    backToStage: function backToStage() {},
    // Bind events that trigger methods
    bindEvents: function bindEvents() {
      var spCarousel = this;

      if (spCarousel.options.nav) {
        spCarousel.$nextBtn.on('click' + '.' + spCarousel._name, function (e) {
          if (spCarousel.isAnimating === false) {
            if (spCarousel.options.autoplay) {
              spCarousel.stopLoop();
            }

            spCarousel.Next(); //Call spCarousel

            spCarousel.checkCallBackMethod.call(spCarousel);
          }
        });
        spCarousel.$prevBtn.on('click' + '.' + spCarousel._name, function (e) {
          if (spCarousel.isAnimating === false) {
            spCarousel.Prev(); //Call spCarousel

            if (spCarousel.options.autoplay) {
              spCarousel.stopLoop();
            }

            spCarousel.checkCallBackMethod.call(spCarousel);
          }
        });
      }

      if (spCarousel.options.dots) {
        spCarousel.$dotContainer.find('li').each(function (index) {
          $(this).on('click' + '.' + spCarousel._name, function (e) {
            if ($(this).hasClass('active') || spCarousel.isAnimating === true) return false;

            if (spCarousel.options.autoplay) {
              spCarousel.stopLoop();
            }

            var activeDotNav = $(this).parent().find('li.active');
            var activeIndex = spCarousel.$dotContainer.find('li').index(activeDotNav);
            var delta = activeIndex > index ? -1 : 1;
            spCarousel.slideFromPosition(index, delta);
            spCarousel.updateDotsFromPosition(index + 1); //Call spCarousel

            spCarousel.checkCallBackMethod.call(spCarousel);
          });
        });
      }

      spCarousel.$outerStage.on('mousedown' + '.' + spCarousel._name, $.proxy(spCarousel.onDragStart, spCarousel));
      spCarousel.$outerStage.on('mouseup' + '.' + spCarousel._name + ' touchend' + '.' + spCarousel._name, $.proxy(spCarousel.onDragEnd, spCarousel));
      spCarousel.$outerStage.on('touchstart' + '.' + spCarousel._name, $.proxy(spCarousel.onDragStart, spCarousel));
      spCarousel.$outerStage.on('touchcancel' + '.' + spCarousel._name, $.proxy(spCarousel.onDragEnd, spCarousel));
      $(window).focus(function () {
        if (spCarousel.options.autoplay && spCarousel.timer === 0) {
          spCarousel.startLoop();
        }
      });
      $(window).blur(function () {
        if (spCarousel.options.autoplay) {
          spCarousel.stopLoop();
        }
      });
      $(window).on('resize' + '.' + spCarousel._name, $.proxy(spCarousel.windowResize, spCarousel));
    },
    windowResize: function windowResize(e) {
      if (typeof e === 'undefined') return;

      if (this.options.responsive && this.windowWidth !== $(window).width()) {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(this.onResize.bind(this), this.responsiveRefreshRate);
      }
    },
    onResize: function onResize() {
      this.destroy();
      this.init();
    },
    parseResponsiveViewPort: function parseResponsiveViewPort() {
      var responsiveProps = this.options.responsive;
      if (typeof responsiveProps === 'undefined') return;
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

      this.viewPort = activeView;
      return activeView;
    },
    updateResponsiveView: function updateResponsiveView() {
      if (typeof this.options.responsive === 'undefined') return;
      var spCarousel = this;
      var wHeight = window.innerHeight;
      var viewPort = spCarousel.parseResponsiveViewPort();

      if (viewPort.height === 'full') {
        this.$outerStage.css({
          height: wHeight + 'px'
        });
        if (this._lastViewPort === wHeight) return;
        this._lastViewPort = wHeight;
      } else {
        this.$outerStage.css({
          height: viewPort.height
        });
        if (this._lastViewPort === viewPort.height) return;
        this._lastViewPort = viewPort.height;
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

    /**
     * Initiate drag operation
     * Get the mouse position and drag position 
     * Release mouseMove and mouseTouch event
     * @param {object} event 
     */
    onDragStart: function onDragStart(event) {
      if (event.which === 3 || event.which === 2 || this.animationType('fadeIn')) {
        return false;
      }

      var spCarousel = this;
      var position = spCarousel.getPosition(event);
      spCarousel.coordinate.x = position.x;
      spCarousel.coordinate.y = position.y;
      $(document).one('mousemove' + '.' + spCarousel._name + ' touchmove' + '.' + spCarousel._name, $.proxy(function (event) {
        $(document).on('mousemove' + '.' + spCarousel._name + ' touchmove' + '.' + spCarousel._name, $.proxy(spCarousel.onDragMove, spCarousel));
        event.preventDefault();
      }, this));
      spCarousel.isDragging = true;
    },

    /**
     * OnDraging mouse calculate only X co-ordinate position
     * Check the delta point 
     * If delta positive then move slider to next item 
     * If delta negative then move slider to right item
     * @param {object} event 
     */
    onDragMove: function onDragMove(event) {
      var spCarousel = this;

      if (spCarousel.isDragging === false) {
        return;
      }

      if (spCarousel.options.autoplay) {
        spCarousel.stopLoop();
      }

      var position = spCarousel.getPosition(event);
      var coordinate = spCarousel.coordinate;
      var prevCoordinate = spCarousel.prevCoordinate;

      if (prevCoordinate.x !== position.x) {
        var different = coordinate.x - position.x;
        var dragPercentage = (1 * Math.abs(different)).toFixed(0);
        spCarousel.prevCoordinate = {
          x: position.x,
          y: position.y,
          diff: different,
          dragPointer: dragPercentage
        };

        if (different > 0) {
          spCarousel.dragoverActionToNextItem(dragPercentage);
        }

        if (different < 0) {
          spCarousel.dragoverActionToPrevItem(dragPercentage);
        }
      }

      event.preventDefault();
    },

    /**
     * OnDragEnd event check the co-ordinate different 
     * If co-ordinate different value gretter than 0 then move the Next item 
     * Otherwise move the Prev item 
     * 
     * @param {object} event 
     */
    onDragEnd: function onDragEnd(event) {
      var spCarousel = this;

      if (spCarousel.isDragging) {
        var differentCoordinate = spCarousel.prevCoordinate.diff;

        if (Math.abs(differentCoordinate) > 100) {
          if (differentCoordinate > 0) {
            spCarousel.Next();
          }

          if (differentCoordinate < 0) {
            spCarousel.Prev();
          }
        } else {
          spCarousel.backToStage();
        }

        spCarousel.isDragging = false;
      }

      spCarousel.resetCoordiante();
    },

    /**
     * Check if it has callback function 
     * If has then fire callback function
     */
    checkCallBackMethod: function checkCallBackMethod() {
      this.callback();
    },
    checkTransitionEndCallback: function checkTransitionEndCallback() {
      var transitionEnd = this.options.transitionEnd;

      if (typeof transitionEnd === 'function') {
        var items = this.$element.find('.sppb-carousel-extended-item').length;
        var option = {
          item: this.item,
          items: items,
          element: this.$element
        };
        transitionEnd.call(this.element, option);
      }
    },

    /**
     * Fire callback function with current item 
     */
    callback: function callback() {
      var onChange = this.options.onChange;

      if (typeof onChange === 'function') {
        var items = this.$element.find('.sppb-carousel-extended-item').length;
        var option = {
          item: this.item,
          items: items,
          element: this.$element
        };
        onChange.call(this.element, option);
      }
    }
  });
  /**
   * Initiate the js-coursel plugin 
   */

  $.fn.spCarousel = function (options) {
    this.each(function () {
      if (!$.data(this, pluginName)) {
        $.data(this, pluginName, new Plugin(this, options));
      }
    });
    return this;
  };
  /**
   * Default setting for intire slide operation
   */


  $.fn.spCarousel.defaults = {
    animationType: 'slide',
    // Number of item need to show
    items: 4,
    // Autoplay trigger
    autoplay: false,
    // Is item mode center
    center: false,
    centerPadding: 50,
    // Margin between items 
    margin: 10,
    // Slide speed 
    speed: 800,
    // Slider interval 
    interval: 4500,
    // callback function in each onChnage event
    onChange: null,
    // Enable/Disable dots indicator
    dots: true,
    // Set inner span to each dot indicator
    dot_indicator: false,
    //Enable/Disable navigation
    nav: true,

    /**
     * Navigation text for next and previous
     * Its will be html or icon or text
     */
    nav_text: ['<', '>']
  };
})(jQuery, window, document);

(function ($) {
  $(document).ready(function () {
    $(".sppb-carousel-extended").each(function () {
      var carousel = $(this);
      var imageCarouselLayout = carousel.data('image-layout');
      var carouselItemNumber = carousel.data('item-number');
      var carouselItemNumberSm = carousel.data('item-number-sm');
      var carouselItemNumberXs = carousel.data('item-number-xs');
      var carouselAutoplay = carousel.data('autoplay');
      carouselAutoplay = carouselAutoplay === 1 ? true : false;
      var carouselSpeed = carousel.data('speed');
      var carouselInterval = carousel.data('interval');
      var carouselMargin = carousel.data('margin');
      var carouselCenterMode = false;
      var carouselCenterPadding = 180;
      var carouselCenterPaddingSm = 90;
      var carouselCenterPaddingXs = 50;
      var fadeCarousel = carousel.data('fade');
      var fadeAnimation = 'slide';

      if (imageCarouselLayout === 'layout3' || imageCarouselLayout === 'layout4') {
        carouselCenterMode = true;
      }

      if (imageCarouselLayout === 'layout3') {
        carouselItemNumber = 1;
        carouselItemNumberSm = 1;
        carouselItemNumberXs = 1;
      }

      if (carouselCenterMode) {
        carouselCenterPadding = carousel.data('padding');
        carouselCenterPaddingSm = carousel.data('padding-sm');
        carouselCenterPaddingXs = carousel.data('padding-xs');
      }

      if (imageCarouselLayout === 'layout1') {
        carouselItemNumber = 1;
        carouselItemNumberSm = 1;
        carouselItemNumberXs = 1;
        carouselCenterPadding = 0;
        carouselMargin = 0;
        if(fadeCarousel){
          fadeAnimation = 'fadeIn';
        }
      }

      var carouselHeight = carousel.data('height');
      var carouselHeightSm = carousel.data('height-sm');
      var carouselHeightXs = carousel.data('height-xs');

      var testiLayout = carousel.data('testi-layout');
      var teamLayout = carousel.data('team-layout');
      if((testiLayout && !imageCarouselLayout) || teamLayout){
        carouselHeight = 'auto';
        carouselHeightSm = 'auto';
        carouselHeightXs = 'auto';
      }

      var carouselArrow = carousel.data('arrow');
      carouselArrow = carouselArrow === 1 ? true : false;
      var carouselBullet = carousel.data('dots');
      carouselBullet = carouselBullet === 1 ? true : false;
      var leftArrow = carousel.data('left-arrow');
      var rightArrow = carousel.data('right-arrow');
      carousel.spCarousel({
        autoplay: carouselAutoplay,
        items: carouselItemNumber,
        speed: carouselSpeed,
        interval: carouselInterval,
        margin: carouselMargin,
        center: carouselCenterMode,
        centerPadding: carouselCenterPadding,
        dots: carouselBullet,
        dot_indicator: carouselBullet,
        nav: carouselArrow,
        nav_text: ['<i class="fa ' + leftArrow + '" aria-hidden="true"></i>', '<i class="fa ' + rightArrow + '" aria-hidden="true"></i>'],
        animationType: fadeAnimation,
        responsive: [{
          viewport: 1170,
          height: carouselHeight,
          items: carouselItemNumber,
        }, {
          viewport: 767,
          height: carouselHeightSm,
          items: carouselItemNumberSm,
          centerPadding: carouselCenterPaddingSm,
        }, {
          viewport: 320,
          height: carouselHeightXs,
          items: carouselItemNumberXs,
          centerPadding: carouselCenterPaddingXs,
        }]
      });
    });
    var observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        var newNodes = mutation.addedNodes;

        if (newNodes !== null) {
          var $nodes = $(newNodes);
          $nodes.each(function () {
            var $node = $(this);
            $node.find('.sppb-carousel-extended').each(function () {
              var carousel = $(this);
              var imageCarouselLayout = carousel.data('image-layout');
              var carouselItemNumber = carousel.data('item-number');
              var carouselItemNumberSm = carousel.data('item-number-sm');
              var carouselItemNumberXs = carousel.data('item-number-xs');
              var carouselAutoplay = carousel.data('autoplay');
              carouselAutoplay = carouselAutoplay === 1 ? true : false;
              var carouselSpeed = carousel.data('speed');
              var carouselInterval = carousel.data('interval');
              var carouselMargin = carousel.data('margin');
              var carouselCenterMode = false;
              var fadeCarousel = carousel.data('fade');
              var fadeAnimation = 'slide';

              if (imageCarouselLayout === 'layout3' || imageCarouselLayout === 'layout4') {
                carouselCenterMode = true;
              }

              var carouselCenterPadding = 180;
              var carouselCenterPaddingSm = 90;
              var carouselCenterPaddingXs = 50;

              if (carouselCenterMode) {
                carouselCenterPadding = carousel.data('padding');
                carouselCenterPaddingSm = carousel.data('padding-sm');
                carouselCenterPaddingXs = carousel.data('padding-xs');
              }

              if (imageCarouselLayout === 'layout3') {
                carouselItemNumber = 1;
                carouselItemNumberSm = 1;
                carouselItemNumberXs = 1;
              }

              if (imageCarouselLayout === 'layout1') {
                carouselItemNumber = 1;
                carouselItemNumberSm = 1;
                carouselItemNumberXs = 1;
                carouselCenterPadding = 0;
                carouselMargin = 0;
                if(fadeCarousel){
                  fadeAnimation = 'fadeIn';
                }
              }

              var carouselHeight = carousel.data('height');
              var carouselHeightSm = carousel.data('height-sm');
              var carouselHeightXs = carousel.data('height-xs');

              var testiLayout = carousel.data('testi-layout');
              var teamLayout = carousel.data('team-layout');
              if((testiLayout && !imageCarouselLayout) || teamLayout){
                carouselHeight = 'auto';
                carouselHeightSm = 'auto';
                carouselHeightXs = 'auto';
              }

              var carouselArrow = carousel.data('arrow');
              carouselArrow = carouselArrow === 1 ? true : false;
              var carouselBullet = carousel.data('dots');
              carouselBullet = carouselBullet === 1 ? true : false;
              var leftArrow = carousel.data('left-arrow');
              var rightArrow = carousel.data('right-arrow');
              carousel.spCarousel({
                autoplay: carouselAutoplay,
                items: carouselItemNumber,
                speed: carouselSpeed,
                interval: carouselInterval,
                margin: carouselMargin,
                center: carouselCenterMode,
                centerPadding: carouselCenterPadding,
                dots: carouselBullet,
                dot_indicator: carouselBullet,
                nav: carouselArrow,
                nav_text: ['<i class="fa ' + leftArrow + '" aria-hidden="true"></i>', '<i class="fa ' + rightArrow + '" aria-hidden="true"></i>'],
                animationType: fadeAnimation,
                responsive: [{
                  viewport: 1170,
                  height: carouselHeight,
                  items: carouselItemNumber
                }, {
                  viewport: 767,
                  height: carouselHeightSm,
                  items: carouselItemNumberSm,
                  centerPadding: carouselCenterPaddingSm,
                }, {
                  viewport: 320,
                  height: carouselHeightXs,
                  items: carouselItemNumberXs,
                  centerPadding: carouselCenterPaddingXs,
                }]
              });
            });
          });
        }
      });
    });
    var config = {
      childList: true,
      subtree: true
    }; // Pass in the target node, as well as the observer options

    observer.observe(document.body, config);
  });
})(jQuery);