/*
 * HiDPI.js
 *
 * Substitute low-resolution images on elements with "hidpi-ready" class and a "data-hidpi-source" attribute.
 *
 * Expects a full URL to the HiDPI version within "data-hidpi-source" attribute in the HTML tag. Works on background
 * images as well as IMG tags.
 *
 * Overlays the low-resolution version above the hiDPI version once loaded, and performs an x-fade.
 *
 * There are 3 different Preloading schemes:
 * * "lazy" - (requires zg.waypoints.js) only load the HiDPI version when we scroll it into view
 * * "queued" - (not implemented) Load the 1st image immediately; queue the rest upon completion
 * * "immediate" - Load all images as soon as the DOM is ready. Could overwhelm the server with too many requests.
 *
 * @version 1.2
 * @author Tom Auger c/o Zeitguys
 *
 * @changelog
 * 1.2 - First commit to GitHub repo
 * 1.1 - we're no longer cloning the element if it's a container with a bg image. We still clone IMG tags though.
 */

;( function( $ ){
	var PRELOAD_SCHEME = "lazy", // "lazy", "queued", "immediate"

		DOMCHECK_INTERVAL = 200, // amount of time, in ms, between polls of the DOM
		CROSSFADE_TIME = 700, // amount of time it takes to xfade the hidpi version after it's been loaded
		HIDPI_BREAKPOINT = 1024, // elements beyond this width will get substituted
		DEBOUNCE_TIMEOUT = 500, // length of debounce delay (used in resize event handler)

		// Setup a timer to periodically check for HiDPI elements until the DOM is fully ready
		// This replaces a .ready() type event (and saves us loading a plugin).
		readyTimer = setInterval( checkForHiDPIElements, DOMCHECK_INTERVAL ),
		refreshTimer;

	// Check for any elements we can substitute right away
	checkForHiDPIElements();

	// Once the DOM has loaded, check one final time.
	$( function(){
		clearInterval( readyTimer );
		checkForHiDPIElements();
	} );

	// Also check on page refresh
	$( window ).on( "resize", function(){
		refreshTimer && clearTimeout( refreshTimer);
		refreshTimer = setTimeout( checkForHiDPIElements, DEBOUNCE_TIMEOUT );
	} );

	/**
	 * Looks through the DOM for any elements with a class of "hidpi-ready", whose
	 * width exceeds the HIDPI_BREAKPOINT and starts the HiDPI image preload.
	 *
	 * Also replaces the "hidpi-ready" class with "hidpi-processing", which would
	 * eventually resolve to "hidpi-loaded" or "hidpi-error", depending.
	 *
	 * @returns {undefined}
	 */
	function checkForHiDPIElements(){
		$( ".hidpi-ready" )
			// Only affect items larger than our Breakpoint
			.filter( function(){ return $( this ).width() > HIDPI_BREAKPOINT; } )
			.removeClass( "hidpi-ready" )

			// If image is in the viewport, preload the image right away,
			// otherwise, hold off
			.each( function( index, item ){
				var $item = $( item ),
					top = $item.offset().top,
					bottom = top + $item.height();

				if ( "immediate" == PRELOAD_SCHEME || ZG_Waypoints.inView( top, bottom ) ){
					preloadHiDPIImage( $item );
				} else {
					if ( "queued" == PRELOAD_SCHEME ){
						// @TODO: enqueue and start loading he suckers
					} else {
						ZG_Waypoints.add( top, bottom, preloadHiDPIImage, { oneShot : true }, $item.addClass( "hidpi-pending" ) );
					}
				}
			} );
	}

	function preloadHiDPIImage( $item ){
		var $imageLoader = $( new Image );

		$item.removeClass( "hidpi-queued hidpi-pending" ).addClass( "hidpi-loading" );

		$imageLoader.on( "load", $item, hiDPILoaded );
		$imageLoader.on( "error", $item, hiDPIError );
		$imageLoader.attr( "src", $item.data( "hidpi-src" ) );
	}

	/**
	 * Image load success event handler.
	 *
	 * Overlays a clone of the current image/element and fades it out,
	 * revealing the original element with the new HiDPI image instead of the
	 * original lower-resolution version.
	 *
	 * Adds the "hidpi-animating" and "hidpi-loaded" classes.
	 *
	 * @param {Object} event
	 * @returns {undefined}
	 */
	function hiDPILoaded( event ){
		var $item = event.data,
			$parent = $item.parent,
			$overlay;

			// Then swap in the HiDPI image into the original container.
			// If it's an IMG tag, it's easy: we just clone it.
			if ( "IMG" === $item.prop( "tagName" ) ){
				// Parent needs to have position for this to work
				if( "static" === $parent.css( "position" ) ){
					$parent.css( "position", "relative" );
				}

				// Overlay a clone
				$overlay = $item.removeClass( "hidpi-loading" ).clone()
					.addClass( "hidpi-clone hidpi-overlay" )
					.css( {
						position: "absolute",
						top: 0,
						left: 0
					} )
				.insertAfter( $item );
				$item.attr( "src", this.src );
			}

			// Otherwise change the background image of the original container,
			// and create a new element that floats just over the background.
			else {
				// Give item positioning if it doesn't have it.
				if ( "static" === $item.css( "position" ) ){
					$item.css( "position", "relative" );
				}

				$overlay = $( '<div class="hidpi-overlay"></div>' ),
					$overlay.css( {
						position : "absolute",
						top : 0,
						left : 0,
						width : $item.outerWidth() + "px",
						height : $item.outerHeight() + "px",
						background : $item.css( "background" )
					} ).prependTo( $item );

				$item.css( "backgroundImage", "url(" + this.src + ")" )
					.removeClass( "hidpi-loading" );
			}

			// Then fade out the clone
			$overlay.fadeOut( CROSSFADE_TIME, hiDPIAnimationComplete );

		$item.addClass( "hidpi-animating hidpi-loaded" )
			// Clean up our source code a little.
			.removeAttr( "data-hidpi-src" );
	}

	function hiDPIAnimationComplete(){
		var $this = $( this );

		// Remove the "animating" class. The hierarchy is different depending
		// on what kind of element we were dealing with.
		if ( "IMG" === $this.prop( "tagName" ) ){
			$this.prev().removeClass( "hidpi-animating" );
		} else {
			$this.parent().removeClass( "hidpi-animating" );
		}

		$this.remove();
	}

	function hiDPIError( event ){
		var $item = event.data;

		console.log( "HiDPI load error", this.src );
		$item.removeClass( "hidpi-processing" ).addClass( "hidpi-error" );
	}
} )( jQuery );



