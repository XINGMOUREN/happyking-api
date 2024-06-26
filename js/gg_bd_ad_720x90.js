var Follow=(function(){'use strict';var FollowPosition = /** @class */ (function () {
    /**
     * Constructor
     * @param {number} x
     * @param {number} y
     * @param {number} z (optional)
     */
    function FollowPosition(x, y, z) {
        if (z === void 0) { z = 0; }
        this.x = x;
        this.y = y;
        this.z = z;
    }
    return FollowPosition;
}());/**
 * Object with all debug methods
 */
var FollowDebug = /** @class */ (function () {
    function FollowDebug() {
    }
    /**
     * Add a dot to the dom
     * @param options
     * @param {FollowPosition} position
     * @param color
     */
    FollowDebug.addDot = function (options, position, color) {
        if (color === void 0) { color = 'blue'; }
        if (!options.debug) {
            return;
        }
        var dot = document.createElement('div');
        dot.style.height = '2px';
        dot.style.width = '2px';
        dot.style.position = 'absolute';
        dot.style.left = "".concat(position.x, "px");
        dot.style.top = "".concat(position.y, "px");
        dot.style.background = color;
        dot.style.borderRadius = '100%';
        document.body.append(dot);
        setTimeout(function () {
            dot.remove();
        }, this.timeout);
    };
    /**
     * Add a dot to the dom for the element
     * @param {FollowOptions} options
     * @param {FollowElement} element
     */
    FollowDebug.addOriginalPosition = function (options, element) {
        if (!options.debug) {
            return;
        }
        var copy = document.createElement('div');
        copy.style.height = "".concat(element.target.offsetHeight, "px");
        copy.style.width = "".concat(element.target.offsetWidth, "px");
        copy.style.position = 'absolute';
        copy.style.left = "".concat(element.position.x - (element.target.offsetHeight / 2), "px");
        copy.style.top = "".concat(element.position.y - (element.target.offsetWidth / 2), "px");
        copy.style.border = '1px solid red';
        copy.style.background = 'none';
        document.body.append(copy);
    };
    /**
     * Add a log message if debug is enabled
     * @param options
     * @param {string} message
     * @param object
     * @private
     */
    FollowDebug.addLog = function (options, message, object) {
        if (object === void 0) { object = undefined; }
        if (!options.debug) {
            return;
        }
        if (object) {
            console.log(message, object);
        }
        else {
            console.log(message);
        }
    };
    /**
     * The amount of time which the visual helpers will be displayed on the page
     * @type {number}
     * @private
     */
    FollowDebug.timeout = 5000;
    return FollowDebug;
}());var FollowElement = /** @class */ (function () {
    /**
     * Constructor
     * @param {HTMLElement} target
     * @param {FollowOptions} options
     */
    function FollowElement(target, options) {
        this.target = target;
        this.factor = parseInt(target.getAttribute(options['attribute'])) || options['factor'];
        this.position = this.getPosition();
        this.options = options;
        FollowDebug.addOriginalPosition(options, this);
    }
    /**
     * Get position of target to calculate translate values
     * @return {FollowPosition}
     */
    FollowElement.prototype.getPosition = function () {
        // define absolute location of element
        var bodyRectangular = document.body.getBoundingClientRect();
        var elemRect = this.target.getBoundingClientRect();
        var x = elemRect.left - bodyRectangular.left;
        var y = elemRect.top - bodyRectangular.top;
        // calculate position center of element
        var height = this.target.offsetHeight;
        var width = this.target.offsetWidth;
        x += (width / 2);
        y += (height / 2);
        return new FollowPosition(x, y);
    };
    /**
     * Update the position of the element
     */
    FollowElement.prototype.updatePosition = function () {
        this.position = this.getPosition();
    };
    /**
     * Replace the new translate property with the old one
     * @param {FollowPosition} position
     */
    FollowElement.prototype.setTranslate = function (position) {
        // if value is exactly zero, change to 0.01 because the css interpreter in the browser interprets it different
        if (position.x === 0)
            position.x = 0.1;
        if (position.y === 0)
            position.y = 0.1;
        var transform = this.target.style.transform;
        var translate = "translate(".concat(position.x, "px, ").concat(position.y, "px)");
        if (this.translate) {
            transform = transform.replace(this.translate, translate);
        }
        else {
            transform += " ".concat(translate).trim();
        }
        this.translate = translate;
        this.target.style.transform = transform;
    };
    return FollowElement;
}());/**
 * Object with all the settings in it.
 * The values may be overwritten
 */
var FollowOptions = /** @class */ (function () {
    function FollowOptions() {
        /**
         * The factor how much the element moves with your cursor
         * @type {number}
         */
        this.factor = 10;
        /**
         * The attribute for the elements you want to follow
         * @type {string}
         */
        this.attribute = 'data-follow';
        /**
         * If the object should automatically initiate the script on initialization of the class
         * @type {boolean}
         */
        this.initiate = true;
        /**
         * If debug mode is activated with log messages and visual helpers
         * @type {boolean}
         */
        this.debug = false;
    }
    return FollowOptions;
}());var Follow = /** @class */ (function () {
    /**
     * Constructor
     * @param {object} options
     */
    function Follow(options) {
        if (options === void 0) { options = undefined; }
        /**
         * The options for the follow script
         * @type {FollowOptions}
         */
        this.options = new FollowOptions();
        /**
         * Array where all the elements are stored in
         * @type Array<FollowElement>
         */
        this.elements = new Array();
        /**
         * Position of the Mouse to use to calculate
         * @type {FollowPosition}
         */
        this.mouse = new FollowPosition(0, 0);
        /**
         * Current scroll position to use to calculate
         * @type {FollowPosition}
         */
        this.scroll = new FollowPosition(0, 0);
        this.setOptions(options);
        this.options.initiate && this.initiate();
    }
    /**
     * Initiate the script
     * Get all elements with the given attribute and activate the animation
     */
    Follow.prototype.initiate = function () {
        var _this = this;
        FollowDebug.addLog(this.options, 'follow.js instance is enabled');
        var targets = document.querySelectorAll("[".concat(this.options['attribute'], "]"));
        targets.forEach(function (target) { return _this.elements.push(new FollowElement(target, _this.options)); });
        FollowDebug.addLog(this.options, "found ".concat(targets.length, " element(s) in the instance"));
        var context = this;
        document.addEventListener('mousemove', function (event) {
            Follow.updateMousePosition(new FollowPosition(event.clientX, event.clientY), context);
            Follow.animate(context);
        });
        document.addEventListener('scroll', function () {
            Follow.updateScrollPosition(new FollowPosition(window.scrollX, window.scrollY), context);
            Follow.animate(context);
        });
    };
    /**
     * Destroy the script
     * Remove all elements and set them to their normal position
     */
    Follow.prototype.destroy = function () {
        this.elements = new Array();
        FollowDebug.addLog(this.options, 'follow.js instance is destroyed');
    };
    /**
     * Destroy the script and initiate it again with the same options
     */
    Follow.prototype.refresh = function () {
        this.destroy();
        this.initiate();
        FollowDebug.addLog(this.options, 'follow.js instance is refreshed');
    };
    /**
     * Set FollowOptions if they have been passed in the object initialization
     * @param {object} options
     */
    Follow.prototype.setOptions = function (options) {
        if (options) {
            var customOptions = options["default"] || options;
            for (var property in this.options) {
                if (Object.prototype.hasOwnProperty.call(this.options, property) && customOptions[property] !== undefined) {
                    this.options[property] = customOptions[property];
                }
            }
        }
    };
    /**
     * Animate the element
     * @param context
     */
    Follow.animate = function (context) {
        for (var _i = 0, _a = context.elements; _i < _a.length; _i++) {
            var element = _a[_i];
            var additional = new FollowPosition(Math.round((context.mouse.x + context.scroll.x - element.position.x) / element.factor), Math.round((context.mouse.y + context.scroll.y - element.position.y) / element.factor));
            // set the additional pixels as css transform translate
            element.setTranslate(additional);
            if (context.options.debug) {
                // prevent unnecessary calculations if debug mode is disabled
                var current = new FollowPosition(element.position.x + additional.x, element.position.y + additional.y);
                FollowDebug.addDot(context.options, current, 'red');
            }
        }
    };
    /**
     * Update the correct current mouse position
     * @param {FollowPosition} position
     * @param context
     */
    Follow.updateMousePosition = function (position, context) {
        context.mouse.x = position.x;
        context.mouse.y = position.y;
        FollowDebug.addDot(context.options, context.mouse);
    };
    /**
     * Update the correct current scroll position
     * @param {FollowPosition} position
     * @param context
     */
    Follow.updateScrollPosition = function (position, context) {
        context.scroll.x = position.x;
        context.scroll.y = position.y;
        FollowDebug.addLog(context.options, "scroll event: x: ".concat(context.scroll.x, ", y: ").concat(context.scroll.y));
    };
    return Follow;
}());
/**
 * Check if auto init is enabled and if true, auto initialize the script
 * To enable it, add the attribute 'data-follow-auto' to the place where you add the script in your code
 */
(function () {
    if (document.currentScript) {
        var value = document.currentScript.getAttribute('data-follow-auto');
        if (value === '' || value === 'true') {
            window['follow'] = new Follow();
        }
    }
})();return Follow;})();