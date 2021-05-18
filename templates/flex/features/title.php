<?php
/**
 * Flex @package Helix Framework
 * Template Name - Flex
 * @author Aplikko http://www.aplikko.com
 * @copyright Copyright (c) 2020 Aplikko
 * @license http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 or later
*/
//no direct access
defined ('_JEXEC') or die ('restricted access');

JHtml::addIncludePath(JPATH_COMPONENT . '/helpers');

class Helix3FeatureTitle {

	private $helix3;

	public function __construct($helix){
		$this->helix3 = $helix;
		$this->position = 'title';
	}

	public function renderFeature() {

		$app = JFactory::getApplication();
		$doc = JFactory::getDocument();
		$menuitem = $app->getMenu()->getActive(); // get the active item
		
		// Include template's params
		$tpl_params 	= JFactory::getApplication()->getTemplate(true)->params;
		$has_lazyload = $tpl_params->get('lazyload', 1);

		if($menuitem) {

			$params 	= $menuitem->params; // get the menu params
			
			if($params->get('enable_page_title', 0)) {

				$page_title  = $menuitem->title;
				$enable_page_title_parallax = $params->get('enable_page_title_parallax', 0);
				
				// Page Title class and responsive (added in Flex 3.9.1)
				$page_title_class = $params->get('page_title_class');
				$page_title_heading = $params->get('page_title_heading', 'h2');
				$page_title_sizes = $params->get('page_title_sizes');
				$page_title_desktop_size = $params->get('page_title_desktop_size', 36);
				$page_title_tablet_size = $params->get('page_title_tablet_size', 34);
				$page_title_mobile_size = $params->get('page_title_mobile_size', 32);
				$page_title_letter_spacing = $params->get('page_title_letter_spacing', 0);
				
				$page_title_height = $params->get('page_title_height');
				$page_title_align = $params->get('page_title_align');
				$page_title_alt = $params->get('page_title_alt');
				$page_subtitle = $params->get('page_subtitle');
				$page_subtitle_size = $params->get('page_subtitle_size', 15);
				$page_title_bg_color = $params->get('page_title_bg_color');
				$page_title_bg_image = $params->get('page_title_bg_image');
				$include_breadcrumbs = $params->get('include_breadcrumbs', 1);
				// Background Image options (added in Flex 3.0):
				$page_title_bg_image_repeat = $params->get('page_title_bg_image_repeat', 'no-repeat');
				$page_title_bg_image_size = $params->get('page_title_bg_image_size', 'cover');
				$page_title_bg_image_attachment = $params->get('page_title_bg_image_attachment', 'fixed');
				$page_title_bg_image_hor_position = $params->get('page_title_bg_image_hor_position', 50);
				$page_title_bg_image_vert_position = $params->get('page_title_bg_image_vert_position', 50);
				// Text color (added in Flex 3.2)
				$page_title_text_color = $params->get('page_title_text_color');
				$page_subtitle_color = $params->get('page_subtitle_color');

				$style = '';
				$title_css = '';
				$title_color = '';
				$subtitle_color = '';
				$page_title_bg = '';
				$parallax = '';
				$page_title_background_class = '';
				$page_title_align_style = '';
				$page_title_size_style = '';
	
				if($page_title_class) {
					$page_title_background_class = ' '. $page_title_class;
				} else {
					if($page_title_bg_image) {
					  $page_title_background_class = '';
					} else {
					  $page_title_background_class = ' gentle-stars text-shadow';
					}
				}
				
				if($enable_page_title_parallax) {
					$parallax = ' parallax_4';
				}
				
				if($page_title_height) {
				    $style .= 'height:' . $page_title_height . 'px;';
				} else {
					$style .= 'padding:60px 0;';
				}
				
				if($page_title_align) {
				    $style .= 'text-align:' . $page_title_align . ';';
				}
			
				if($page_title_bg_color) {
					$page_title_bg = 'background-color:' . $page_title_bg_color . ';';
				}
				
				if($page_title_text_color) {
					$title_color = 'color:' . $page_title_text_color . ';';
				}
				
				if($page_subtitle_color) {
					$subtitle_color = 'color:' . $page_subtitle_color . ';';
				}
				
				//$lazy_output = '';
				if($page_title_bg_image) {
					if (strpos($page_title_bg_image, '://') === false) {
						if($has_lazyload) {
							$style .= 'background-image: url(data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==);';
							$lazy_output = '<div class="lazyload sp-page-title'. $parallax .'" data-bg="'. JUri::root() . $page_title_bg_image .'">';
						} else {
							$style .= 'background-image:url(' . JURI::root(true) . '/' . $page_title_bg_image . ');';
						}
					} else {
						if($has_lazyload) {
							$style .= 'background-image: url(data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==);';
							$lazy_output = '<div class="lazyload sp-page-title'. $parallax .'" data-bg="'. $page_title_bg_image .'">';
						} else {
							$style .= 'background-image:url(' . $page_title_bg_image . ');';
						}
					}
					$style .= 'background-repeat:'. $page_title_bg_image_repeat .';';
					$style .= 'background-position:'. $page_title_bg_image_hor_position .'% '. $page_title_bg_image_vert_position .'%;';
					$style .= 'background-size:'. $page_title_bg_image_size .';';
					$style .= 'background-attachment:'. $page_title_bg_image_attachment .';';
				}
				
				// Heading - Title (responsive)
				if($page_title_bg_color) {
					$title_css .= '#sp-title .sp-page-title-wrapper {'. $page_title_bg .'}';
				}
				$title_css .= '#sp-title .sp-page-title-wrapper '. $page_title_heading .'.page_title{font-size:' . $page_title_desktop_size . 'px;line-height:1.2;letter-spacing:'.$page_title_letter_spacing.'px;'. $title_color .'}';
				$title_css .= '@media (min-width: 768px) and (max-width: 991px) {#sp-title .sp-page-title-wrapper '. $page_title_heading .'.page_title {font-size:' . $page_title_tablet_size . 'px;}}';
				$title_css .= '@media (max-width: 767px) {#sp-title .sp-page-title-wrapper '. $page_title_heading .'.page_title{ font-size:' . $page_title_mobile_size . 'px;}}';
				$doc->addStyleDeclaration($title_css);
			
				// Add styles
				$css = '.sp-page-title, .sp-page-title-no-img {'. $style .'}';
				if($page_title_bg_color) {
					$css .= '#sp-title .sp-page-title-wrapper .sp-page-title-no-img {'. $page_title_bg .'}';
				}
				$css .= '#sp-title .sp-page-title-wrapper .page_subtitle{font-size:' . $page_subtitle_size . 'px;line-height:1.3;'. $subtitle_color .'}';		 
				$doc->addStyleDeclaration($css);
				

				if($page_title_alt) {
					$page_title = $page_title_alt;
				}

				$output = '';

				
				
				if($page_title_bg_image) {
					
					$output .= '<div class="sp-page-title-wrapper'. $page_title_background_class .'">';
					
					// Lazy Loading for background image
					if($has_lazyload) {
						$output .= $lazy_output;
					} else {
						$output .= '<div class="sp-page-title'. $parallax .'">';
					}
				} else {
					$output .= '<div class="sp-page-title-wrapper">';
					$output .= '<div class="sp-page-title-no-img'. $parallax . $page_title_background_class .'">';
				}
				$output .= '<div class="container">';
				
				$output .= '<'. $page_title_heading .' class="page_title" itemprop="headline">'. $page_title .'</'. $page_title_heading .'>';
				
				if($page_subtitle) {
					$output .= '<h3 class="page_subtitle">'. $page_subtitle .'</h3>';
				}

				if($include_breadcrumbs == 1) {
					$output .= '<jdoc:include type="modules" name="breadcrumb" style="none" />';
				}

				$output .= '</div>';
				$output .= '</div>';

				$output .= '</div>';
				return $output;

			}
		}
	}
}
