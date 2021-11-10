var Mobify = window.Mobify = window.Mobify || {};
Mobify.$ = Mobify.$ || window.Zepto || window.jQuery;
// MODIFIED BY SAP: changed classPrefix from 'm-' to ''
Mobify.UI = Mobify.UI || { classPrefix: '' };

(function($, document) {
    $.support = $.support || {};

    // BEGIN: MODIFIED BY SAP
    var support = {
        'touch': 'ontouchend' in document
    };

    // => if the device API is loaded we override the touch detection
    if (window.sap && sap.ui && sap.ui.Device && sap.ui.Device.support) {
        support.touch = sap.ui.Device.support.touch
    }

    $.extend($.support, support);
    // END: MODIFIED BY SAP

})(Mobify.$, document);



/**
    @module Holds common functions relating to UI.
*/
Mobify.UI.Utils = (function($) {
    var exports = {}
        , has = $.support;

    /**
        Events (either touch or mouse)
    */
    // BEGIN: MODIFIED BY SAP
    exports.events = {
        down: 'touchstart mousedown',
        move: 'touchmove mousemove',
        up: 'touchend touchcancel mouseup'
    };
    // END: MODIFIED BY SAP

    /**
        Returns the position of a mouse or touch event in (x, y)
        @function
        @param {Event} touch or mouse event
        @returns {Object} X and Y coordinates
    */
    // BEGIN: MODIFIED BY SAP
    exports.getCursorPosition = function(e) {
        e = e.originalEvent || e;
        var oTouches = e.touches && e.touches[0];

        return {
            x: oTouches ? oTouches.clientX : e.clientX,
            y: oTouches ? oTouches.clientY : e.clientY
        }
    }
    // END: MODIFIED BY SAP

    /**
        Returns prefix property for current browser.
        @param {String} CSS Property Name
        @return {String} Detected CSS Property Name
    */
    exports.getProperty = function(name) {
        var prefixes = ['Webkit', 'Moz', 'O', 'ms', '']
          , testStyle = document.createElement('div').style;

        for (var i = 0; i < prefixes.length; ++i) {
            if (testStyle[prefixes[i] + name] !== undefined) {
                return prefixes[i] + name;
            }
        }

        // Not Supported
        return;
    };

    $.extend(has, {
        'transform': !! (exports.getProperty('Transform'))
      , 'transform3d': !! (window.WebKitCSSMatrix && 'm11' in new WebKitCSSMatrix())
    });

    // translateX(element, delta)
    // Moves the element by delta (px)
    var transformProperty = exports.getProperty('Transform');
    if (has.transform3d) {
        exports.translateX = function(element, delta) {
             if (typeof delta == 'number') delta = delta + 'px';
             element.style[transformProperty] = 'translate3d(' + delta  + ',0,0)';
        };
    } else if (has.transform) {
        exports.translateX = function(element, delta) {
             if (typeof delta == 'number') delta = delta + 'px';
             element.style[transformProperty] = 'translate(' + delta  + ',0)';
        };
    } else {
        exports.translateX = function(element, delta) {
            if (typeof delta == 'number') delta = delta + 'px';
            element.style.left = delta;
        };
    }

    // setTransitions
    var transitionProperty = exports.getProperty('Transition')
      , durationProperty = exports.getProperty('TransitionDuration');

    exports.setTransitions = function(element, enable) {
        if (enable) {
            element.style[durationProperty] = '';
        } else {
            element.style[durationProperty] = '0s';
        }
    }


    // Request Animation Frame
    // courtesy of @paul_irish
    exports.requestAnimationFrame = (function() {
        var prefixed = (window.requestAnimationFrame       ||
                        window.webkitRequestAnimationFrame ||
                        window.mozRequestAnimationFrame    ||
                        window.oRequestAnimationFrame      ||
                        window.msRequestAnimationFrame     ||
                        function( callback ){
                            window.setTimeout(callback, 1000 / 60);
                        });

        var requestAnimationFrame = function() {
            prefixed.apply(window, arguments);
        };

        return requestAnimationFrame;
    })();

    return exports;

})(Mobify.$);

Mobify.UI.Carousel = (function($, Utils) {
    var defaults = {
            dragRadius: 10
          , moveRadius: 20
          , classPrefix: undefined
          , classNames: {
                outer: 'sapMCrsl'
              , inner: 'sapMCrslInner'
              , item: 'sapMCrslItem'
              , center: 'sapMCrslCenter'
              , touch: 'has-touch'
              , dragging: 'dragging'
              , active: 'sapMCrslActive'
            }
        }
       , has = $.support;

    // Constructor
    var Carousel = function(element, options) {
        this.setOptions(options);
        this.initElements(element);
        this.initOffsets();
        this.initAnimation();
        this.bind();
    };

    // Expose Dfaults
    Carousel.defaults = defaults;

    Carousel.prototype.setOptions = function(opts) {
        var options = $.extend(this.options || {}, defaults, opts);

        /* classNames requires a deep copy */
        options.classNames = $.extend({}, options.classNames, opts.classNames || {});

        /* By default, classPrefix is `undefined`, which means to use the Mobify-wide level prefix */
        options.classPrefix = options.classPrefix || Mobify.UI.classPrefix;


        this.options = options;
    };

    Carousel.prototype.initElements = function(element) {
        this._index = 1;

        this.element = element;
        this.$element = $(element);
        this.$inner = this.$element.find('.' + this._getClass('inner'));
        this.$items = this.$inner.children();

        this.$start = this.$items.eq(0);
        this.$sec = this.$items.eq(1);
        this.$current = this.$items.eq(this._index);

        this._length = this.$items.length;
        this._alignment = this.$element.hasClass(this._getClass('center')) ? 0.5 : 0;

    };

    Carousel.prototype.initOffsets = function() {
        this._offset = 0;
        this._offsetDrag = 0;
    }

    Carousel.prototype.initAnimation = function() {
        this.animating = false;
        this.dragging = false;
        this._hasActiveTransition = false;
        this._needsUpdate = false;
        this._sTransitionEvents = 'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd';
        this._enableAnimation();
    };


    Carousel.prototype._getClass = function(id) {
        return this.options.classPrefix + this.options.classNames[id];
    };


    Carousel.prototype._enableAnimation = function() {
        if (this.animating) {
            return;
        }

        Utils.setTransitions(this.$inner[0], true);
        this.$inner.removeClass(this._getClass('dragging'));
        this.animating = true;
    }

    Carousel.prototype._disableAnimation = function() {
        if (!this.animating) {
            return;
        }

        Utils.setTransitions(this.$inner[0], false);
        this.$inner.addClass(this._getClass('dragging'));
        this.animating = false;
    }

    Carousel.prototype.update = function() {
        /* We throttle calls to the real `_update` for efficiency */
        if (this._needsUpdate) {
            return;
        }

        var self = this;
        this._needsUpdate = true;
        Utils.requestAnimationFrame(function() {
            self._update();
        });
    }

    Carousel.prototype._update = function() {
		var $current,
			currentOffset,
			x;

		if (!this._needsUpdate) {
            return;
		}

		$current = this.$items.eq(this._index - 1);
		currentOffset = $current.prop('offsetLeft') + $current.prop('clientWidth') * this._alignment,
			 startOffset = this.$start.prop('offsetLeft') + this.$start.prop('clientWidth') * this._alignment

		this._offset = -(currentOffset - startOffset);
        x = Math.round(this._offset + this._offsetDrag);

		if(this.$inner) {
        	Utils.translateX(this.$inner[0], x);
        }

        this._needsUpdate = false;
    }

    // MODIFIED BY SAP
    //added loop getter and setter
    Carousel.prototype.setLoop = function(bLoop) {
        this._bLoop = bLoop;
    }

    Carousel.prototype.getLoop = function() {
        return this._bLoop;
    }

    //setter and getter  for right-to-left mode
    Carousel.prototype.setRTL = function(bRTL) {
        this._bRTL = bRTL;
    }

    Carousel.prototype.getRTL = function() {
        return this._bRTL;
    }
    // MODIFIED BY SAP
    //added private changeAnimation function
    Carousel.prototype.changeAnimation = function(sTransitionClass, fnCallback, oCallbackContext, aCallbackParams) {
    	if ( this.$inner ){
	    	var $carouselInner = this.$inner,
	    		sTransitionEvents = 'transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd';

	    	var fnCleanUpTransition = function(){
				$carouselInner.off(sTransitionEvents, fnCleanUpTransition);
				$carouselInner.removeClass(sTransitionClass);
				//Exexute callback function if there is one.
				if(fnCallback) {
					fnCallback.apply(oCallbackContext, aCallbackParams);
				}
			}

	    	$carouselInner.addClass(sTransitionClass);
			$carouselInner.on(sTransitionEvents, fnCleanUpTransition);
    	}
    }

    // MODIFIED BY SAP
    //added resize function
    Carousel.prototype.resize = function() {
    	this.changeAnimation('sapMCrslHideNonActive');

        this.update();
    }

    Carousel.prototype.touchstart = function(e) {
    	if(this._fnStart) {
    		this._fnStart.call(this, e);
    	} else {
    		jQuery.sap.log.warning("Mobify's 'start' method not available yet.");
    	}
    }

    Carousel.prototype.touchmove = function(e) {
        // BEGIN: MODIFIED BY SAP
        if (jQuery(e.target).is("input, textarea, select, [contenteditable='true']")) {
            return;
        }
        // END: MODIFIED BY SAP

    	if(this._fnDrag) {
    		this._fnDrag.call(this, e);
    	} else {
    		jQuery.sap.log.warning("Mobify's 'drag' method not available yet.")
    	}
    }

    Carousel.prototype.touchend = function(e) {
    	if(this._fnEnd) {
    		this._fnEnd.call(this, e);
    	} else {
    		jQuery.sap.log.warning("Mobify's 'end' method not available yet.")
    	}
    }



    Carousel.prototype.bind = function() {
        var abs = Math.abs
            , dragging = false
            , canceled = false
            , dragRadius = this.options.dragRadius
            , xy
            , dx
            , dy
            , dragThresholdMet
            , self = this
            , $element = this.$element
            , $inner = this.$inner
            , opts = this.options
            , dragLimit = this.$element.width()
            , lockLeft = false
            , lockRight = false;

        // MODIFIED BY SAP
        //make functions 'start', 'drag' and 'end' available to
        //containing carousel control.
        if(!self._fnStart) {
        	self._fnStart = function start(e) {

	            // BEGIN: MODIFIED BY SAP
	            if (e.isMarked("delayedMouseEvent")) {
	                return;
	            }

	            //add event handler flags
	    		var oElement = jQuery(e.target).control(0);
	    		if(oElement instanceof sap.m.Slider ||
	    			oElement instanceof sap.m.Switch ||
	    			oElement instanceof sap.m.IconTabBar) {
	    			//Make sure that swipe is executed for all controls except those that
	    			//themselves require horizontal swiping
	    			canceled = true;
	    			return;
	    		}
	        	// END: MODIFIED BY SAP

	            dragging = true;
	            canceled = false;

	            xy = Utils.getCursorPosition(e);
	            dx = 0;
	            dy = 0;
	            dragThresholdMet = false;

	            // Disable smooth transitions
	            self._disableAnimation();

	            lockLeft = self._index == 1;
	            lockRight = self._index == self._length;
	        };

        	self._fnDrag = function drag(e) {

	            // BEGIN: MODIFIED BY SAP
	            if (!dragging || canceled || e.isMarked("delayedMouseEvent")) {
	            	return;
	            }
	            // mark the event for components that needs to know if the event was handled by the carousel
	            e.setMarked();
	            // END: MODIFIED BY SAP

	            var newXY = Utils.getCursorPosition(e);
	            dx = xy.x - newXY.x;
	            dy = xy.y - newXY.y;

	            if (dragThresholdMet || abs(dx) > abs(dy) && (abs(dx) > dragRadius)) {
	                dragThresholdMet = true;
	                e.preventDefault();

	                if (lockLeft && (dx < 0)) {
	                    dx = dx * (-dragLimit)/(dx - dragLimit);
	                } else if (lockRight && (dx > 0)) {
	                    dx = dx * (dragLimit)/(dx + dragLimit);
	                }
	                self._offsetDrag = -dx;
	                self.update();
	            } else if ((abs(dy) > abs(dx)) && (abs(dy) > dragRadius)) {
	                canceled = true;
	            }
	        };

	        self._fnEnd = function end(e) {

	            // BEGIN: MODIFIED BY SAP
	            if (!dragging || e.isMarked("delayedMouseEvent")) {
	                return;
	            }
	            // END: MODIFIED BY SAP

	            dragging = false;

	            self._enableAnimation();

	            if (!canceled && abs(dx) > opts.moveRadius) {
	                // Move to the next slide if necessary
	                if (dx > 0) {
	                	self.getRTL() ? self.prev() : self.next();
	                } else {
	                	self.getRTL() ? self.next() : self.prev();
	                }
	            } else {
	                // Reset back to regular position
	                self._offsetDrag = 0;
	                self.update();
	            }

	        };
        }

        function click(e) {
            if (dragThresholdMet) {
            	e.preventDefault();
            	//When 'dragThresholdMet' the carousel will switch to
            	//the next page. Therefore no other action shall be performed on
            	//the current page
            	e.stopPropagation();
            	e.setMarked();
            }
        }

        // BEGIN: MODIFIED BY SAP
        $inner
            .on('click.carousel', click)
            .on('mouseout.carousel', self._fnEnd);
        // END: MODIFIED BY SAP


        $element.on('click', '[data-slide]', function(e){

	        // BEGIN: MODIFIED BY SAP
	        // The event might bubble up from another carousel inside of this one.
	        // In this case we ignore the event.
	        var oCarousel = jQuery(e.target).closest('.sapMCrsl');
	        if (oCarousel[0] != $element[0]) {
		        return;
	        }
	        // END: MODIFIED BY SAP

            e.preventDefault();
            var action = $(this).attr('data-slide')
              , index = parseInt(action, 10);

            if (isNaN(index)) {
                self[action]();
            } else {
            	// MODIFIED BY SAP deactivate move on
            	//bullet press
                //self.move(index);
            }
        });

        $element.on('afterSlide', function(e, previousSlide, nextSlide) {
			var iFirstElement = nextSlide - 1,
				sActiveClass = self._getClass('active');

            // The event might bubble up from another carousel inside of this one.
            // In this case we ignore the event.
            if (e.target != this) {
                return;
            }

            var sId = self.$element[0].id,
                sPageIndicatorId = sId.replace(/(:|\.)/g,'\\$1') + '-pageIndicator';

            // self.$items.eq(previousSlide - 1).removeClass(self._getClass('active'));
			for (var i = iFirstElement; i < iFirstElement + self.options.numberOfItemsToShow; i++) {
				var element = self.$items.eq(i);
				element.addClass(sActiveClass);
			}

            self.$element.find('#' + sPageIndicatorId + ' > [data-slide=\'' + previousSlide + '\']').removeClass(self._getClass('active'));
            self.$element.find('#' + sPageIndicatorId + ' > [data-slide=\'' + nextSlide + '\']').addClass(self._getClass('active'));

            if (self.$items[nextSlide - 1]) {
                this.setAttribute('aria-activedescendant', self.$items[nextSlide - 1].id);
            }
        });


        $element.trigger('beforeSlide', [1, 1]);
        $element.trigger('afterSlide', [1, 1]);

        self.update();

    };

    Carousel.prototype.unbind = function() {
        this.$inner.off();
    };

    // BEGIN: MODIFIED BY SAP
    Carousel.prototype.onTransitionComplete = function() {
        this.$inner.off(this._sTransitionEvents, this.onTransitionComplete);

		var sActiveClass = this._getClass('active'),
			i;

        for (i = 0; i < this.$items.length; i++) {
			if (i != this._index - 1) {
				this.$items.eq(i).removeClass(sActiveClass);
			}
		}

        this._hasActiveTransition = false;

		// Trigger afterSlide event
		this.$element.trigger('afterSlide', [this._prevIndex, this._index]);
		this.setShouldFireEvent(false);
	};

	Carousel.prototype.getShouldFireEvent = function() {
		return this._shouldFireEvent;
	};

	Carousel.prototype.setShouldFireEvent = function(bShouldFireEvent) {
		this._shouldFireEvent = bShouldFireEvent;
	};

	Carousel.prototype.hasActiveTransition = function() {
		return this._hasActiveTransition;
	};
    // END: MODIFIED BY SAP

	Carousel.prototype.destroy = function() {
        this.unbind();
        this.$element.trigger('destroy');
        this.$element.remove();

        // Cleanup
        this.$element = null;
        this.$inner = null;
        this.$start = null;
		this.$current = null;

		this._needsUpdate = false;
    }

    Carousel.prototype.move = function(newIndex, opts) {
    	//if list is empty or transition is in process , return
    	// MODIFIED BY SAP
    	if(this._length === 0 || this._hasActiveTransition == true) {
    		return;
    	}

        var $element = this.$element
            , $inner = this.$inner
            , $items = this.$items
            , $start = this.$start
            , $current = this.$current
            , length = this._length
            , index = this._index;

        opts = opts || {};

		// BEGIN: MODIFIED BY SAP
		// prevent loop when carousel shows more pages than 1
		if (this.getLoop() && this.options.numberOfItemsToShow !== 1 &&
				(newIndex < 1 || newIndex > this._length)) { // new index out of range - will cause loop
			return;
		}
		// END: MODIFIED BY SAP

        // Bound Values between [1, length];
        if (newIndex < 1) {
        	// MODIFIED BY SAP
            //if looping move to last index
        	if(this._bLoop) {
        		// this.changeAnimation('sapMCrslNoTransition');
        		newIndex = this._length;
        	} else {
        		newIndex = 1;
        	}
        } else if (newIndex > this._length) {
        	// MODIFIED BY SAP
            //if looping move to first index
        	if(this._bLoop) {
        		// this.changeAnimation('sapMCrslNoTransition');
        		newIndex = 1;
        	} else {
        		newIndex = length;
        	}
		}

		if (newIndex + this.options.numberOfItemsToShow > this._length) {
			newIndex = this._length - this.options.numberOfItemsToShow + 1;
		}

        // Bail out early if no move is necessary.
        var bTriggerEvents = true;
        if (newIndex == this._index) {
        	// MODIFIED BY SAP
        	//only trigger events if index changes
        	bTriggerEvents = false;
        }

        // Trigger beforeSlide event
        if(bTriggerEvents) {
        	$element.trigger('beforeSlide', [index, newIndex]);
        }

        this._offsetDrag = 0;
        this._prevIndex = this._index;
        this._index = newIndex;
        this.update();

        // MODIFIED BY SAP
        if(bTriggerEvents) {
            // This indicates that transition has started
            this._hasActiveTransition = true;
            $inner.bind(this._sTransitionEvents, jQuery.proxy(this.onTransitionComplete, this));
        }
    };

    Carousel.prototype.next = function() {
        this.setShouldFireEvent(true);
        this.move(this._index + 1);
    };

    Carousel.prototype.prev = function() {
        this.setShouldFireEvent(true);
        this.move(this._index - 1);
    };

    return Carousel;

})(Mobify.$, Mobify.UI.Utils);



(function($) {
    /**
        jQuery interface to set up a carousel


        @param {String} [action] Action to perform. When no action is passed, the carousel is simply initialized.
        @param {Object} [options] Options passed to the action.
    */
    $.fn.carousel = function (action, options) {
        var initOptions = $.extend({}, $.fn.carousel.defaults, options);

        // Handle different calling conventions
        if (typeof action == 'object') {
            initOptions = $(initOptions, action);
            options = null;
            action = null;
        }

        this.each(function () {
            var $this = $(this)
              , carousel = this._carousel;

            if (!carousel) {
                carousel = new Mobify.UI.Carousel(this, initOptions);
            } else {
                carousel.setOptions(initOptions);
                carousel.initElements(this);
                carousel.initOffsets();
                carousel.initAnimation();
                carousel.bind();
            }

            if (action) {
                carousel[action](options);

                if (action === 'destroy') {
                    carousel = null;
                }
            }

            this._carousel = carousel;
        })

        return this;
    };

    $.fn.carousel.defaults = {};

})(Mobify.$);
