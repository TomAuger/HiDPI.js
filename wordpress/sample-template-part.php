<?php
/**
 * Sample template part for WordPress demonstrating how to use the `get_hidpi()` utility function.
 *
 * @uses extract() to create the following variables in the current scope:
 *		$low_image_url: URL to low resolution image source
 *		$low_image_bg_style_attribute: Style attribute (with leading space) for inline embedding as a background-image
 *		$hidpi_data_attribute: String (including leading space) for the data-hidpi-src attribute
 *		$hidpi_ready_class: String (including leading space) to be added to a list of classes on the container object
 *
 * @see get_hidpi()
 */

$background_image_ID = get_post_thumbnail_id( get_the_ID() );
extract( get_hidpi( $background_image_ID ) );

?>
<section role="complementary" class="masthead<?php echo $hidpi_ready_class; ?>"<?php echo $low_image_bg_style_attribute, $hidpi_data_attribute; ?>>
	<div class="content-wrapper">
		<header class="entry-header">
			<h1 class="entry-title"><?php the_title(); ?></h1>
		</header>
		<div class="entry-summary">
			<?php the_excerpt(); ?>
		</div>
	</div>
</section>