<?php
/**
 * Flex @package SP Page Builder
 * Template Name - Flex
 * @author Aplikko http://www.aplikko.com
 * @copyright Copyright (c) 2020 Aplikko
 * @license http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 or later
*/
// no direct access

defined('JPATH_BASE') or die;

// Include template's params
$tpl_params 	= JFactory::getApplication()->getTemplate(true)->params;
$major_color = ($tpl_params->get('preset1_major') != '') ? $tpl_params->get('preset1_major') : 'F14833';

if ( $displayData['params']->get('video') ) {
	
	$video = parse_url($displayData['params']->get('video'));
	$output = '';

	switch($video['host']) {
		case 'youtu.be':
		$video_id 	= trim($video['path'],'/');
		$video_src 	= '//www.youtube.com/embed/' . $video_id;
		break;

		case 'www.youtube.com':
		case 'youtube.com':
		//parse_str($video['query'], $query);
		//$video_id 	= $query['v'];
		$video_id 	= trim($video['path'],'/embed');
		$video_src 	= 'https://www.youtube.com/embed/' . $video_id . '?showinfo=0&#038;controls=1';
		break;

		case 'vimeo.com':
		case 'www.vimeo.com':
		$video_id 	= trim($video['path'],'/');
		$video_src 	= "https://player.vimeo.com/video/". $video_id ."?title=0&byline=0&portrait=0&color=". trim($major_color,'#') ."";
	}

	if($video_src) {
		$output .= '<div class="entry-video embed-responsive embed-responsive-16by9">';
		$output .= '<iframe class="embed-responsive-item" src="'. $video_src .'" frameborder="0" allow="autoplay; encrypted-media" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>';
		$output .= '</div>';
		echo $output;
	} // has video source
	
} // has video value
