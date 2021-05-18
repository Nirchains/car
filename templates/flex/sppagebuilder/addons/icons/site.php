<?php
/**
 * Flex @package SP Page Builder
 * Template Name - Flex
 * @author Aplikko http://www.aplikko.com
 * @copyright Copyright (c) 2019 Aplikko
 * @license http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 or later
*/
// no direct access
defined('_JEXEC') or die;

class SppagebuilderAddonIcons extends SppagebuilderAddons {

    public function render() {
        $settings = $this->addon->settings;
		
		// Repeatable Items
		$icon_items = (isset($settings->sp_icons_item) && $settings->sp_icons_item) ? $settings->sp_icons_item : '';

        //Addon Options
		// Title
		$title = (isset($settings->title) && $settings->title) ? $settings->title : '';
		$heading_selector = (isset($settings->heading_selector) && $settings->heading_selector) ? $settings->heading_selector : 'h3';
		
		$title_fontsize = (isset($settings->title_fontsize) && $settings->title_fontsize) ? $settings->title_fontsize : '';
		$title_fontweight = (isset($settings->title_fontweight) && $settings->title_fontweight) ? $settings->title_fontweight : '';
		$title_text_color = (isset($settings->title_text_color) && $settings->title_text_color) ? $settings->title_text_color : '';
		$title_margin_top = (isset($settings->title_margin_top) && $settings->title_margin_top) ? $settings->title_margin_top : 10;
		$title_margin_bottom = (isset($settings->title_margin_bottom) && $settings->title_margin_bottom) ? $settings->title_margin_bottom : 10;
		$margin_gap = (isset($settings->margin_gap) && $settings->margin_gap) ? 'margin:0 '. $settings->margin_gap .'px '. $settings->margin_gap .'px 0;' : 'margin:0 10px 10px 0;';
        $alignment = (isset($settings->alignment) && $settings->alignment) ? $settings->alignment : 'sppb-text-left';
		$class = (isset($settings->class) && $settings->class) ? $settings->class : '';
		$title_tooltip = (isset($settings->title_tooltip) && $settings->title_tooltip) ? 1 : 0;
		
		// Output starts
        $output = '';
		$icons_alignment = ' ' . $alignment . '';
		$class != '' ? $icon_class = ' ' . $class . '"' : $icon_class = '';
		
		$output .= '<div class="sppb-addon sppb-addon-icons ' . $icons_alignment . $class . '">';

		if($title) {
	
			$title_style = '';
			if($title_margin_top !='') $title_style .= 'margin-top:' . (int) $title_margin_top . 'px;';
			if($title_margin_bottom !='') $title_style .= 'margin-bottom:' . (int) $title_margin_bottom . 'px;';
			if($title_text_color) $title_style .= 'color:' . $title_text_color  . ';';
			if($title_fontsize) $title_style .= 'font-size:'.$title_fontsize.'px;line-height:'.$title_fontsize.'px;';
			if($title_fontweight) $title_style .= 'font-weight:'.$title_fontweight.';';
	
			$output .= '<'.$heading_selector.' class="sppb-addon-title" style="' . $title_style . '">' . $title . '</'.$heading_selector.'>';
		}
		
		$output .= '<div class="flex-icons' . $icons_alignment . $icon_class . '">';
	
				
		if(isset($settings->sp_icons_item) && is_array($settings->sp_icons_item)){
			foreach ($settings->sp_icons_item as $key => $icon_item) {
                
                $icon_title = (isset($icon_item->title) && $icon_item->title) ? $icon_item->title : '';
				$peicon_name = (isset($icon_item->peicon_name) && $icon_item->peicon_name) ? $icon_item->peicon_name : '';
				$icon_name = (isset($icon_item->icon_name) && $icon_item->icon_name) ? $icon_item->icon_name : '';
				$size = (isset($icon_item->size) && $icon_item->size) ? $icon_item->size : 24;
				$font_weight = (isset($icon_item->font_weight) && $icon_item->font_weight) ? $icon_item->font_weight : '';	
				$color = (isset($icon_item->color) && $icon_item->color) ? $icon_item->color : '';
				$background = (isset($icon_item->background) && $icon_item->background) ? $icon_item->background : '';		
				$border_color = (isset($icon_item->border_color) && $icon_item->border_color) ? $icon_item->border_color : '';
				$border_width = (isset($icon_item->border_width) && $icon_item->border_width) ? $icon_item->border_width : 0;
				$border_radius = (isset($icon_item->border_radius) && $icon_item->border_radius) ? $icon_item->border_radius : 0;
				$icon_margin = (isset($icon_item->icon_margin) && $icon_item->icon_margin) ? $icon_item->icon_margin : 0;
				$padding = (isset($icon_item->padding) && $icon_item->padding) ? $icon_item->padding : 0;
				$url = (isset($icon_item->url) && $icon_item->url) ? $icon_item->url : '';
				$url_target = (isset($icon_item->url_target) && $icon_item->url_target) ? $icon_item->url_target : '';
				
				$style = '';
				$font_size = '';
				$extra_style = '';
				$icon_class = '';
				$url != '' ? $icon_url = $url : $icon_url = '#';

				// Output 
				if($icon_name || $peicon_name) {

					if($icon_margin) $style .= 'margin:' . (int) $icon_margin . 'px;';
					
					if($padding) { 
						$style .= 'padding:' . (int) $padding  . 'px;';
					}
				
					$extra_style .= 'width:' . (int) $size . 'px;';
					$extra_style .= 'height:' . (int) $size . 'px;';
					$extra_style .= 'line-height:' . (int) $size . 'px;';
					($title_tooltip == 1) ? $icon_tooltip = ' title="'.$icon_title.'" data-toggle="tooltip"' : $icon_tooltip = '';
					
					$url_target != '' ? $icon_url_target = ' target="' . $url_target . '"' : $icon_url_target = '';
					
					if($color) $style .= 'color:'. $color  . ';';
					if($font_weight) $font_weight = 'font-weight:' . $font_weight  . ';';
					if($background) $style .= 'background-color:' . $background  . ';';
					if($border_color) $style .= 'border-style:solid;border-color:' . $border_color  . ';';
					if($border_width) $style .= 'border-width:' . (int) $border_width  . 'px;';
					if($border_radius) $style .= 'border-radius:' . (int) $border_radius  . 'px;';
			
					if($size) $font_size .= 'font-size:' . (int) $size . 'px;' . $font_weight . $extra_style .'';
			
					$output .= '<div'.$icon_tooltip.' style="' . $margin_gap . '" class="flex-icon-wrap">';
					$output .= '<a' . $icon_url_target . ' href="' . $icon_url . '">';
					$output .= '<span style="' . $style . '"' . $icon_class . '>';
					if ($peicon_name) {
						$output .= '<i class="pe ' . $peicon_name . '" style="' . $font_size . '"></i>';
					}else{
						$output .= '<i class="fa ' . $icon_name . '" style="' . $font_size . '"></i>';
					}
					$output .= '</span>';
					$output .= '</a>';
					
					$output .= '</div>';
				}
            }
        }
	
		$output .= '</div>';
		$output .= '</div>';
	
        return $output;
    }
	
}
