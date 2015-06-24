<?php

/*
 * WordPress functions to make embedding HiDPI images easier
 */

/**
 * Get an array that contains the low quality image URL and the hiDPI URL and data-attribute
 *
 * @param int $attachment_id
 * @param string $low_size Corresponds to a registered $image_size string for the low-resolution version
 * @param string $high_size Registered $image_size string for hiDPI version
 * @return array {
 *		@type string $low_image_url URL to low resolution image source
 *		@type string $low_image_bg_style_attribute Style attribute (with leading space) for inline embedding as a background-image
 *		@type string $hidpi_data_attribute String (including leading space) for the data-hidpi-src attribute
 *		@type string $hidpi_ready_class String (including leading space) to be added to a list of classes on the container object
 * }
 */
function get_hidpi( $attachment_id, $low_size = "large", $high_size = "full" ){
	$low_image = wp_get_attachment_image_src( $attachment_id , $low_size );

	$hidpi_data_attribute =
		$hidpi_ready_class =
		$low_image_url =
		$low_image_bg_style_attribute = "";

	if ( $low_image ){
		$low_image_url = $low_image[0];
		$low_image_bg_style_attribute = $low_image_url ? ' style="background-image:url(' . $low_image_url . ');"' : '';

		$hidpi_image = wp_get_attachment_image_src( $attachment_id, $high_size );

		// Only do the HiDPI piece if the hidpi_image is actually larger than the
		// background image, and has the same proportions
		if ( $hidpi_image && $hidpi_image[1] > $low_image[1] && $hidpi_image[2] > $low_image[2] ){
			if ( round( $hidpi_image[1] / $hidpi_image[2] * 10 ) / 10 == round( $low_image[1] / $low_image[2] * 10) / 10 ){

				$hidpi_data_attribute = " data-hidpi-src='" . $hidpi_image[0] . "'";
				// hidpi.js is a dependency for nodes.js, so we're enqueueing it in theme-enqueue.php
				//wp_enqueue_script( "hidpi" );
				$hidpi_ready_class = " hidpi-ready";
			}
		}
	}

	return compact( "low_image_url", "low_image_bg_style_attribute", "hidpi_data_attribute", "hidpi_ready_class" );
}