<?php
/**
 * @package SP Page Builder
 * @author JoomShaper http://www.joomshaper.com
 * @copyright Copyright (c) 2010 - 2020 JoomShaper
 * @license http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 or later
*/
//no direct accees
defined ('_JEXEC') or die ('Restricted access');

jimport('joomla.application.component.controller');

//CSRF
\JHtml::_('jquery.token');

$controller = JControllerLegacy::getInstance('Sppagebuilder');
$controller->execute(JFactory::getApplication()->input->get('task'));
$controller->redirect();
