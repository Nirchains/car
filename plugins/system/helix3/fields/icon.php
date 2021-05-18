<?php
/**
 * Flex @package Helix Framework
 * Template Name - Flex
 * @author Aplikko http://www.aplikko.com
 * @copyright Copyright (c) 2020 Aplikko
 * @license http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 or later
*/

//no direct accees
defined ('_JEXEC') or die ('resticted aceess');

jimport('joomla.form.formfield');

jimport('joomla.html.html.select');

class JFormFieldIcon extends JFormField {

	protected $type = 'Icon';
	
	public function getInput() {
		
		
		$doc = JFactory::getDocument();
		
		$doc->addStyleSheet("https://use.fontawesome.com/releases/v5.12.1/css/all.css");
		$doc->addStyleSheet("https://use.fontawesome.com/releases/v5.12.1/css/v4-shims.css");
		
		$plg_path = JURI::root(true) . '/plugins/system/helix3';
		$doc->addScript($plg_path . '/assets/js/simple-slider.min.js');
		$doc->addStyleSheet($plg_path . '/assets/css/simple-slider.css');
		
		$class = $this->element['class'];
		$value = intval(htmlspecialchars($this->value, ENT_COMPAT, 'UTF-8'));
		$fieldID = str_replace(array('jform[params]','[',']'), '', $this->name);
		
		$scripts = '	
		jQuery(document).ready(function() {
			
			 // Slide options
			 jQuery("#'.$fieldID.'").each(function(){ 
				 jQuery("#'.$fieldID.'").bind("slider:ready slider:changed", function (event, data) { 
					 jQuery(".output_'.$fieldID.'").html(data.value.toFixed(0));		 
				 });
			  });
		
		});
		';
		JFactory::getDocument()->addScriptDeclaration($scripts);	
		

		$icons = $this->getFaiconsList();

		$arr = array();
		$arr[] = JHtml::_('select.option', '', '' );

		foreach ($icons as $value) {
			// Prefixes changed for FontAwesome 5
			$prefixes  = array('fab fa-', 'fas fa-', 'far fa-');
			$replace = array('', '', '');
			
			$arr[] = JHtml::_('select.option', $value, str_replace($prefixes, $replace, $value) );
			
		}
		return JHtml::_('select.genericlist', $arr, $this->name, null, 'value', 'text', $this->value);
	}
	
	/* Icons List (FontAwesome 5) loaded from server */
	 private static function getFaiconsList() {
	
		$content = file_get_contents('https://raw.githubusercontent.com/FortAwesome/Font-Awesome/master/metadata/icons.json');
		$json = json_decode($content);
		$icons = [];
	
		foreach ($json as $icon => $value) {
			foreach ($value->styles as $style) {
				$icons[] = 'fa'.substr($style, 0 ,1).' fa-'.$icon;
			}
		}
		
		return $icons;
	}

}
