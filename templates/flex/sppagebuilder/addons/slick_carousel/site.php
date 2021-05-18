<?php
/**
 * Flex @package SP Page Builder
 * Template Name - Flex
 * @author Aplikko http://www.aplikko.com
 * @copyright Copyright (c) 2020 Aplikko
 * @license http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 or later
*/
// no direct access
defined('_JEXEC') or die;

class SppagebuilderAddonSlick_carousel extends SppagebuilderAddons {

	public function render() {

		$doc = JFactory::getDocument();
		$settings = $this->addon->settings;
		$class = (isset($settings->class) && $settings->class) ? ' ' . $settings->class : '';
		$lazyloading = (isset($settings->lazyloading) && $settings->lazyloading) ? 1 : 0;
		$spacing = (isset($settings->spacing) && $settings->spacing) ? $settings->spacing : 0;
		$arrows = (isset($settings->arrows) && $settings->arrows) ? 1 : 0;
		$arrows_size = (isset($settings->arrows_size) && $settings->arrows_size) ? $settings->arrows_size : '';
		$arrows_color = (isset($settings->arrows_color) && $settings->arrows_color) ? $settings->arrows_color . ';' : '';
		$arrows_background_color = (isset($settings->arrows_background_color) && $settings->arrows_background_color) ? $settings->arrows_background_color.';' : '';
		$arrows_class = (isset($settings->arrows_class) && $settings->arrows_class) ? ' '. $settings->arrows_class : '';
		$counter = (isset($settings->counter) && $settings->counter) ? 1 : 0;
		$counter_color = (isset($settings->counter_color) && $settings->counter_color) ? 'color:'.$settings->counter_color.';' : 'color:#777;';
		$dots = (isset($settings->dots) && $settings->dots) ? 1 : 0;
		$dots_color = (isset($settings->dots_color) && $settings->dots_color) ? 'color:'. $settings->dots_color .';' : '';
		$rtl_support = (isset($settings->rtl_support) && $settings->rtl_support) ? 1 : 0;
		$title = (isset($settings->title) && $settings->title) ? $settings->title : '';
	
		//Options:
		$heading_selector = (isset($settings->heading_selector) && $settings->heading_selector) ? $settings->heading_selector : 'h3';
		
		// Title
		$title_fontsize = (isset($settings->title_fontsize) && $settings->title_fontsize) ? $settings->title_fontsize : '';
		$title_fontweight = (isset($settings->title_fontweight) && $settings->title_fontweight) ? $settings->title_fontweight : '';
		$title_text_color = (isset($settings->title_text_color) && $settings->title_text_color) ? $settings->title_text_color : '';
		$title_margin_top = (isset($settings->title_margin_top) && $settings->title_margin_top) ? $settings->title_margin_top : 10;
		$title_margin_bottom = (isset($settings->title_margin_bottom) && $settings->title_margin_bottom) ? $settings->title_margin_bottom : 10;

			if ($dots == '1') {
				//with dots
				$arrows_margin_top = 'margin-top:-' . ( $arrows_size / 1.2 ) . 'px;';
			} else {
				//without dots
				$arrows_margin_top = 'margin-top:-' . ( $arrows_size / 2.2 ) . 'px;';
			}
			
			if($spacing=='') {
				$spacing = 0;
			}

			// RTL Support
	
			if ($rtl_support == 1) { 
				$rtl_support = 'rtl:true,';
				$rtl = ' dir="rtl"';
			} else {
				$rtl_support = '';
				$rtl = '';
			}

			//$arrows_size = '';
			$arrows_size != '' ? $arrows_size_style = 'font-size:'. $arrows_size.'px;' : $arrows_size_style = 'font-size:44px;';
			
			$arrows_color != '' ? $arrows_color_style = 'color:'.$arrows_color.';' : $arrows_color_style = '';
			$arrows_background_color != '' ? $arrows_background_color_style = 'background-color:'.$arrows_background_color.';' : $arrows_background_color_style = '';
			$arrows_class != '' ? $arrows_class = ' '.$arrows_class : $arrows_class = '';
				if ($arrows_size || $arrows_color || $arrows_background_color) {
					$arrow_style = ' style="' . $arrows_size_style . $arrows_color_style . $arrows_background_color_style . '"'; 
				}
			
			$show_counter = '';	
			$counter_height = '';
			$arrows_size != '' ? $counter_height = 'line-height:' . ( $arrows_size - 4 ) . 'px;' : $counter_height = 'line-height:40px;';
			
			// Add styles (old fashion way)
			$style = ''
				. '#slick-carousel-'.$this->addon->id.' .slick-slide{margin:0 ' . $spacing / 2 .'px;}'
				. '#slick-carousel-'.$this->addon->id.' .slick-list{margin:0 ' . $spacing . ';}'
				. '#slick-carousel-'.$this->addon->id.' .slick-prev,#slick-carousel-'.$this->addon->id.' .slick-next {' . $arrows_margin_top . $arrows_background_color_style . '}'
				. '#slick-carousel-'.$this->addon->id.' .slick-dots li button:before {'. $dots_color .'}'
				. '#slick-carousel-'.$this->addon->id.' .slick-prev i.pe, #slick-carousel-'.$this->addon->id.' .slick-next i.pe {'.$arrows_size_style.'color:'.$arrows_color.'}'
				;		 
				$doc->addStyleDeclaration($style);
	
			if ($counter != '0') { 	
				$style_counter = '#slick-carousel-'.$this->addon->id.' .slick-prev .slick-counter {left:-' . $arrows_size . 'px;height:'.$arrows_size.'px;width:' . $arrows_size . 'px;' . $counter_color . $counter_height . '}'
				. '#slick-carousel-'.$this->addon->id.' .slick-next .slick-counter {right:-' . $arrows_size . 'px;height:'.$arrows_size.'px;width:' . $arrows_size . 'px;' . $counter_color . $counter_height . '}';
				$doc->addStyleDeclaration($style_counter);
			}

		// Output starts
		$output = '';
		
		$output = '<div class="sppb-addon ' . $class . '">';
	
		if($title) {
			$title_style = '';
			if($title_margin_top !='') $title_style .= 'margin-top:' . (int) $title_margin_top . 'px;';
			if($title_margin_bottom !='') $title_style .= 'margin-bottom:' . (int) $title_margin_bottom . 'px;';
			if($title_text_color) $title_style .= 'color:' . $title_text_color  . ';';
			if($title_fontsize) $title_style .= 'font-size:'.$title_fontsize.'px;line-height:'.$title_fontsize.'px;';
			if($title_fontweight) $title_style .= 'font-weight:'.$title_fontweight.';';
	
			$output .= '<'.$heading_selector.' class="sppb-addon-title" style="' . $title_style . '">' . $title . '</'.$heading_selector.'>';
		}
	
		$output .= '<div'.$rtl.' id="slick-carousel-'.$this->addon->id.'" class="clearfix">';
	
	    if(isset($settings->sp_slick_carousel_item) && is_array($settings->sp_slick_carousel_item)){
			foreach ($settings->sp_slick_carousel_item as $key => $item_value) {

				$item_title = (isset($item_value->item_title) && $item_value->item_title) ? $item_value->item_title : '';
				$thumb = (isset($item_value->thumb) && $item_value->thumb) ? $item_value->thumb : '';
				$alt_text = (isset($item_value->alt_text) && $item_value->alt_text) ? $item_value->alt_text : '';
				$thumb_url = (isset($item_value->thumb_url) && $item_value->thumb_url) ? $item_value->thumb_url : '';
				$url_target = (isset($item_value->url_target) && $item_value->url_target) ? ' target="' . $item_value->url_target . '"' : '';
				$description = (isset($item_value->description) && $item_value->description) ? $item_value->description : '';
	
				if($item_title!='') {
					 $maintitle = '<h3>' . nl2br($item_title) . '</h3>';
				} else {
					$maintitle = '';
				}
	
				// Image
				if($thumb) {
					
					if (empty($alt_text)) {
						if (!empty($item_title)) {
							$alt_text = $item_title;
						} else {
							$alt_text = basename($thumb);
						}
					}

					$output .= '<div class="slick-img">';
					$output .= '';
					$output .= ($thumb_url !='') ? '<a href="'.$thumb_url.'"'.$url_target.'>' : '';
					$output .= '<img ';
					
					if(strpos($thumb, 'http://') !== false || strpos($thumb, 'https://') !== false){
						$output .= ($lazyloading == 1) ? 'data-lazy="'. $thumb . '" alt="'. $alt_text .'"' : 'src="'. $thumb . '" alt="'. $item_title. '"';
					} else {
						$output .= ($lazyloading == 1) ? 'data-lazy="'. JURI::base(true) . '/' . $thumb . '" alt="'. $alt_text .'"' : 'src="'. $thumb . '" alt="'. $item_title. '"';
					}
					$output .= '>';
					$output .= ($thumb_url !='') ? '</a>' : '';
					$output .= ($item_title != '') ? '<div class="clearfix"><h3>' . nl2br($item_title) . '</h3></div>' : '';
					$output .= $description != '' ? '<div class="slick-desc">' . $description . '</div>' : '';
					$output .= '</div>';
				} else {
					$output .= '<div class="slick-img no-bckg-img">';	
					$output .= $description != '' ? '<div class="slick-desc">' . $maintitle . $description . '</div>' : '';
					$output .= '</div>';
				}
			}
		}
		$output .= '</div>';	
		$output .= '</div>';

		return $output;
	}

	public function stylesheets() {
		$app = JFactory::getApplication();
		$tmplPath = JURI::base(true) . '/templates/'.$app->getTemplate();	
		return array($tmplPath.'/sppagebuilder/addons/slick_carousel/assets/css/slick.css');
	}

	public function scripts() {
		$app = JFactory::getApplication();
		$tmplPath = JURI::base(true) . '/templates/'.$app->getTemplate();	
		
		return array($tmplPath.'/sppagebuilder/addons/slick_carousel/assets/js/slick.min.js');
	}

	public function js() {
		$settings = $this->addon->settings;
		$infiniteloop = (isset($settings->infiniteloop) && $settings->infiniteloop) ? 1 : 0;
		$lazyloading = (isset($settings->lazyloading) && $settings->lazyloading) ? $lazyloading = 'lazyLoad:\'ondemand\',' : '';
		$slidestoshow = (isset($settings->slidestoshow) && $settings->slidestoshow) ? $settings->slidestoshow : 1;
		$slidestoscroll = (isset($settings->slidestoscroll) && $settings->slidestoscroll) ? $settings->slidestoscroll : 1;
		$spacing = (isset($settings->spacing) && $settings->spacing) ? $settings->spacing : 0;
		$fade_effect = (isset($settings->fade_effect) && $settings->fade_effect) ? 1 : 0;
		$autoplay = (isset($settings->autoplay) && $settings->autoplay) ? 1 : 0;
		$autoplay_pause_onhover = (isset($settings->autoplay_pause_onhover) && $settings->autoplay_pause_onhover) ? 1 : 0;
		$autoplay_pause_onfocus = (isset($settings->autoplay_pause_onfocus) && $settings->autoplay_pause_onfocus) ? 1 : 0;
		$autoplay_interval = (isset($settings->autoplay_interval) && $settings->autoplay_interval) ? $settings->autoplay_interval : 5000;
		$speed = (isset($settings->speed) && $settings->speed) ? $settings->speed : 500;
		$arrows = (isset($settings->arrows) && $settings->arrows) ? 1 : 0;
		$arrows_class = (isset($settings->arrows_class) && $settings->arrows_class) ? ' '. $settings->arrows_class : '';
		$counter = (isset($settings->counter) && $settings->counter) ? 1 : 0;
		$dots = (isset($settings->dots) && $settings->dots) ? 1 : 0;
		$autoheight = (isset($settings->autoheight) && $settings->autoheight) ? 1 : 0;
		$rtl_support = (isset($settings->rtl_support) && $settings->rtl_support) ? 1 : 0;
		$breakpoint1 = (isset($settings->breakpoint1) && $settings->breakpoint1) ? $settings->breakpoint1 : 992;
		$slidestoshow_break1 = (isset($settings->slidestoshow_break1) && $settings->slidestoshow_break1) ? $settings->slidestoshow_break1 : 3;
		$breakpoint2 = (isset($settings->breakpoint2) && $settings->breakpoint2) ? $settings->breakpoint2 : 768;
		$slidestoshow_break2 = (isset($settings->slidestoshow_break2) && $settings->slidestoshow_break2) ? $settings->slidestoshow_break2 : 2;
		$breakpoint3 = (isset($settings->breakpoint3) && $settings->breakpoint3) ? $settings->breakpoint3 : 480;
		$slidestoshow_break3 = (isset($settings->slidestoshow_break3) && $settings->slidestoshow_break3) ? $settings->slidestoshow_break3 : 1;
		$title = (isset($settings->title) && $settings->title) ? $settings->title : '';
		$infiniteloop == 0 ? $infiniteloop = 'infinite:false,' : $infiniteloop = '';
		if($autoplay_interval == '') {$autoplay_interval = '5000';} 
		
		$autoplay == 1 ? $autoplay = 'autoplay: true,autoplaySpeed: '.$autoplay_interval.',' : $autoplay = '';
		$autoplay_pause_onhover == 1 ? $autoplay_pause_onhover = '' : $autoplay_pause_onhover = 'pauseOnHover:false,';
		$autoplay_pause_onfocus == 1 ? $autoplay_pause_onfocus = '' : $autoplay_pause_onfocus = 'pauseOnHover:false,';
		
		$speed == '' ? $speed = 'speed:500,' : $speed = 'speed:'.(int) $speed.',';
		$fade_effect == 1 ? $fade_effect = 'fade:true,' : $fade_effect = '';
		$arrows == 0 ? $arrows = 'arrows:false,' : $arrows = '';
		$dots == 1 ? $dots = 'dots:true,' : $dots = '';
		$autoheight == 1 ? $autoheight = 'adaptiveHeight:true,' : $autoheight = '';
		
		// RTL Support
		if ($rtl_support == 1) { 
			$rtl_support = 'rtl:true,';
			$rtl = ' dir="rtl"';
		} else {
			$rtl_support = '';
			$rtl = '';
		}
		
		$var_counter = '';
		$show_counter = '';	
		
		if ($counter == 1) { 
		$var_counter = '
			var total_slides;
			$slick_carousel.on("init reInit afterChange", function (event, slick, currentSlide) {
				var prev_slide_index, next_slide_index, current;
				var $prev_counter = $slick_carousel.find(".slick-prev .slick-counter");
				var $next_counter = $slick_carousel.find(".slick-next .slick-counter");
				total_slides = slick.slideCount;
				current = (currentSlide ? currentSlide : 0) + 1;
				prev_slide_index = (current - 1 < 1) ? total_slides : current - 1;
				next_slide_index = (current + 1 > total_slides) ? 1 : current + 1;
				$prev_counter.text(prev_slide_index + "/" + total_slides);
				$next_counter.text(next_slide_index + "/"+ total_slides);
			});
			';
			$counter = '1' ? $show_counter = '<h4 class="slick-counter"></h4>' : $show_counter = '';
		} 
		
		$js = 'jQuery(function($){
		var $slick_carousel = jQuery("#slick-carousel-'.$this->addon->id.'");
		jQuery(document).ready(function(){ 
		   '.$var_counter.'
    		$slick_carousel.slick({
			 '.$infiniteloop.'
			  '.$lazyloading.'
			  slidesToShow: ' . $slidestoshow . ',
			  slidesToScroll: ' . $slidestoscroll . ',
			  nextArrow: \'<span class="slick-next'.$arrows_class.'">'.$show_counter.'<i class="pe pe-7s-angle-right"></i></span>\',
			  prevArrow: \'<span class="slick-prev'.$arrows_class.'">'.$show_counter.'<i class="pe pe-7s-angle-left"></i></span>\',
			  '.$rtl_support.'
			  '.$autoplay.'
			  '.$autoplay_pause_onhover.'
			  '.$autoplay_pause_onfocus.'
			  '.$fade_effect.'
			  '.$speed.'
			  '.$arrows.'
			  '.$dots.'
			  '.$autoheight.' 
			  cssEase: \'cubic-bezier(0.635, 0.010, 0.355, 1.000)\',
			  responsive: [
				{
				  breakpoint:'.$breakpoint1.',
				  settings: {
					slidesToShow:'.$slidestoshow_break1.',
					slidesToScroll:'.$slidestoshow_break1.'
				  }
				},
				{
				  breakpoint:'.$breakpoint2.',
				  settings: {
					slidesToShow:'.$slidestoshow_break2.',
					slidesToScroll:'.$slidestoshow_break2.'
				  }
				},
				{
				  breakpoint:'.$breakpoint3.',
				  settings: {
					slidesToShow:'.$slidestoshow_break3.',
					slidesToScroll:'.$slidestoshow_break3.'
				  }
				}
			  ]
			});
  		});
	});'; 
	$js = preg_replace(array('/([\s])\1+/', '/[\n\t]+/m'), '', $js); // Remove whitespace
	return $js;
	}
}
