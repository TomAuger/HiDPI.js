/**
 * Fast, lightweight Waypoints framework
 *
 * Static namespace for containing all global functions pertaining to setting "waypoints".
 *
 * A "waypoint" is a set of vertical coordinates (top, bottom) that triggers a callback whenever
 * they are scrolled into view (optionally: for the first time, only).
 *
 * Waypoints are added using {@link ZG_Waypoints.add()}. There is currently no formal remove,
 * though a waypoint will be removed once activated if the "oneShot" option is provided when the waypoint was added.
 *
 * @author Tom Auger, Zeitguys
 *
 * @returns {ZG_Waypoints}
 */
function ZG_Waypoints(){}
ZG_Waypoints.waypoints = []; // holds items that haven't been started because they're out of view

/**
 * Determine whether the top or bottom coordinates are within the current viewport
 *
 * @param {int} elementTop
 * @param {int} elementBottom
 * @param {Number} viewMargin Optional. Fractional percentage "buffer" or margin within the view
 * @returns {Boolean}
 */
ZG_Waypoints.inView = function( elementTop, elementBottom, viewMargin ){
	var viewMargin = viewMargin || 0.1,
		$window = jQuery( window ),
		viewTop = $window.scrollTop(),
		viewBottom = viewTop + $window.height(),
		viewMargin = $window.height() * viewMargin; // 10% margin;

	return(
		( elementTop >= viewTop + viewMargin && elementTop <= viewBottom - viewMargin ) ||
		( elementBottom >= viewTop + viewMargin && elementBottom <= viewBottom - viewMargin )
	);
};

/**
 * Add a selector, DOM Element or jQuery object as a waypoint.
 *
 * Adds `$element` reference to the options (which become the waypoint object)
 *
 * @param {string|DOMElement|jQuery} element
 * @param {Function} callback Function that will be called when the element is scrolled into view
 * @param {Object} options Optional
 *
 * @returns {undefined}
 */
ZG_Waypoints.addItem = function( element, callback, options ){
	// Apparently, it's 30% faster to test if the element is already a jQuery object
	// rather than re-wrapping it. http://stackoverflow.com/questions/30763960/is-there-a-cost-to-jquerying-an-existing-jquery-object
	// http://jsperf.com/jquerying-a-jquery-object
	var $element = element instanceof jQuery ? element : $( element ),
		top = $element.offset().top,
		bottom = top + $element.height();

	ZG_Waypoints.add( top, bottom, callback, jQuery.extend( { $element: $element }, options ) );
};

/**
 * Add a new waypoint, and register for a scroll event, if not already registered
 *
 * @uses jQuery
 *
 * @param {int} top
 * @param {int} bottom
 * @param {Function} callback
 * @param {Object} options Optional. Arguments to be included in the waypoint {
 *		@prop {Boolean} oneShot Delete the waypoint after the first time it's triggered.
 * }
 * @param {...*} callbackArgs Optional. One or more arguments to be passed to your callback function
 * @returns {undefined}
 */
ZG_Waypoints.add = function( top, bottom, callback, options ){
	var callbackArgs = Array.prototype.slice.call( arguments, 4 ); // Additional arguments passed to the callback

	ZG_Waypoints.waypoints.push( jQuery.extend( {
		top: top,
		bottom: bottom,
		callback: callback,
		callbackArgs: callbackArgs
	}, options ) );

	jQuery( window ).on( "scroll", ZG_Waypoints.update );
};

/**
 * @usedby $( window ).on( "scroll" )
 *
 * Iterates though a list of waypoints - objects containing "top" and "bottom" coordinates.
 * If any of those waypoints pass through the view, then we access the waypoint's $element,
 * which is presumably an SVG, and find its `force` object stored in data,
 * and kick off the simulation.
 *
 * Then we remove the waypoint, since we won't be restarting simulations here.
 *
 * Finally, if there are no more waypoints, we unregister the event listener.
 *
 * @returns {undefined}
 */
ZG_Waypoints.update = function(){
	var i = ZG_Waypoints.waypoints.length;

	while ( i-- ){
		var waypoint = ZG_Waypoints.waypoints[i];

		if ( ZG_Waypoints.inView( waypoint.top, waypoint.bottom ) ){
			// Trigger the callback, applying any arguments that might have been passed to add()
			if ( waypoint.callback ){
				waypoint.callback.apply( waypoint, waypoint.callbackArgs );
			}

			if ( waypoint.oneShot ){
				ZG_Waypoints.waypoints.splice( i, 1 );
			}
		}
	}

	// Remove the scroll listener if our waypoints are empty
	if ( ! ZG_Waypoints.waypoints.length ) {
		jQuery( window ).off( "scroll", ZG_Waypoints.update );
	}
};