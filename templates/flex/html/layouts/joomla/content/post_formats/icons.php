<?php
/**
 * Flex @package Helix Framework
 * @author Aplikko http://www.aplikko.com
 * @copyright Copyright (c) 2020 Aplikko
 * @license http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 or later
*/
defined('JPATH_BASE') or die;

$params 	= JFactory::getApplication()->getTemplate(true)->params;

$format = $displayData;

if($params->get('show_post_format')) {

	//echo '<span class="post-format">';

	if (  $format == 'audio' ) {
		if ( $params->get('custom_audio_icon') != '' ) {
			echo '<i class="' .$params->get('custom_audio_icon') .'"></i>';
		} else {
			echo '<i class="fas fa-music"></i>';
		}
	} else if (  $format == 'video' ) {
		if ( $params->get('custom_video_icon') != '' ) {
			echo '<i class="' .$params->get('custom_video_icon') .'"></i>';
		} else {
			echo '<i class="fas fa-video"></i>';
		}
	} else if (  $format == 'gallery' ) {
		if ( $params->get('custom_gallery_icon') != '' ) {
			echo '<i class="' .$params->get('custom_gallery_icon') .'"></i>';
		} else {
			echo '<i class="far fa-images"></i>';
		}
	} else if (  $format == 'quote' ) {
		if ( $params->get('custom_quote_icon') != '' ) {
			echo '<i class="'. $params->get('custom_quote_icon') .'"></i>';
		} else {
			echo '<i class="fas fa-quote-left"></i>';
		}
	} else if (  $format == 'link' ) {
		if ( $params->get('custom_link_icon') != '' ) {
			echo '<i class="'. $params->get('custom_link_icon') .'"></i>';
		} else {
			echo '<i class="fas fa-link"></i>';
		}
	} else if (  $format == 'status' ) {
		if ( $params->get('custom_status_icon') != '' ) {
			echo '<i class="'. $params->get('custom_status_icon') .'"></i>';
		} else {
			echo '<i class="far fa-comment"></i>';
		}
	} else if (  $format == 'custom' ) {
		if ( $params->get('custom_post_icon') != '' ) {
			echo '<i class="'. $params->get('custom_post_icon') .'"></i>';
		} else {
			echo '<i class="far fa-thumbs-up"></i>';
		}
	} else {
		if ( $params->get('custom_standard_icon') != '' ) {
			echo '<i class="'. $params->get('custom_standard_icon') .'"></i>';
		} else {
			echo '<i class="fas fa-stream"></i>';
		}
	}
	//echo '</span>';

} 
