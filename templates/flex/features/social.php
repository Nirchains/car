<?php
/**
 * Flex @package Helix3 Framework
 * Template Name - Flex
 * @author Aplikko http://www.aplikko.com
 * @copyright Copyright (c) 2020 Aplikko
 * @license http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 or later
*/
//no direct access
defined ('_JEXEC') or die ('restricted access');

class Helix3FeatureSocial {

	private $helix3;
	public $position;

	public function __construct( $helix3 ){
		$this->helix3 = $helix3;
		$this->position = $this->helix3->getParam('social_position');
		$this->load_pos = $this->helix3->getParam('social_load_pos');
	}

	public function renderFeature() {

		$facebook 	= $this->helix3->getParam('facebook');
		$twitter  	= $this->helix3->getParam('twitter');
		$googleplus = $this->helix3->getParam('googleplus');
		$instagram  = $this->helix3->getParam('instagram');
		$pinterest 	= $this->helix3->getParam('pinterest');
		$youtube 	= $this->helix3->getParam('youtube');
		$linkedin 	= $this->helix3->getParam('linkedin');
		$dribbble 	= $this->helix3->getParam('dribbble');
		$behance 	= $this->helix3->getParam('behance');
		$skype 		= $this->helix3->getParam('skype');
		$whatsapp 	= $this->helix3->getParam('whatsapp');
		$flickr 		= $this->helix3->getParam('flickr');
		$vk 			= $this->helix3->getParam('vk');
		$custom 		= $this->helix3->getParam('custom');

		if( $this->helix3->getParam('show_social_icons') && ( $facebook || $twitter || $googleplus || $instagram || $pinterest || $youtube || $linkedin || $dribbble || $behance || $skype || $whatsapp || $flickr || $vk ) ) {
			$html  = '<ul class="social-icons">';

			if( $facebook ) {
				$html .= '<li><a target="_blank" href="'. $facebook .'" aria-label="facebook"><i class="fab fa-facebook-f" aria-hidden="true"></i></a></li>';
			}
			if( $twitter ) {
				$html .= '<li><a target="_blank" href="'. $twitter .'" aria-label="twitter"><i class="fab fa-twitter" aria-hidden="true"></i></a></li>';
			}
			if( $googleplus ) {
				$html .= '<li><a target="_blank" href="'. $googleplus .'" aria-label="GooglePlus"><i class="fab fa-google-plus-g" aria-hidden="true"></i></a></li>';
			}
          	if( $instagram ) {
				$html .= '<li ><a target="_blank" href="'. $instagram .'" aria-label="Instagram"><i class="fab fa-instagram" aria-hidden="true"></i></a></li>';
			}
			if( $pinterest ) {
				$html .= '<li><a target="_blank" href="'. $pinterest .'" aria-label="Pinterest"><i class="fab fa-pinterest" aria-hidden="true"></i></a></li>';
			}
			if( $youtube ) {
				$html .= '<li><a target="_blank" href="'. $youtube .'" aria-label="Youtube"><i class="fab fa-youtube" aria-hidden="true"></i></a></li>';
			}
			if( $linkedin ) {
				$html .= '<li><a target="_blank" href="'. $linkedin .'" aria-label="LinkedIn"><i class="fab fa-linkedin" aria-hidden="true"></i></a></li>';
			}
			if( $dribbble ) {
				$html .= '<li><a target="_blank" href="'. $dribbble .'" aria-label="Dribbble"><i class="fab fa-dribbble" aria-hidden="true"></i></a></li>';
			}
			if( $behance ) {
				$html .= '<li><a target="_blank" href="'. $behance .'" aria-label="Behance"><i class="fab fa-behance" aria-hidden="true"></i></a></li>';
			}
			if( $flickr ) {
				$html .= '<li><a target="_blank" href="'. $flickr .'" aria-label="Flickr"><i class="fab fa-flickr" aria-hidden="true"></i></a></li>';
			}
			if( $vk ) {
				$html .= '<li><a target="_blank" href="'. $vk .'" aria-label="VK"><i class="fab fa-vk" aria-hidden="true"></i></a></li>';
			}
			if( $skype ) {
				$html .= '<li><a href="skype:'. $skype .'?chat" aria-label="Skype"><i class="fab fa-skype" aria-hidden="true"></i></a></li>';
			}
			if( $whatsapp ) {
				$html .= '<li><a href="whatsapp://send?abid='. $whatsapp .'&text=Hi" aria-label="WhatsApp"><i class="fab fa-whatsapp" aria-hidden="true"></i></a></li>';
			}

			if( $custom ) {
				$explt_custom = explode(' ', $custom);
				$html .= '<li><a target="_blank" href="'. $explt_custom[1] .'"><i class="fab '. $explt_custom[0] .'"></i></a></li>';
			}

			$html .= '</ul>';

			return $html;
		}

	}
}