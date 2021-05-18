<?php
/**
 * @package SP Page Builder
 * @author JoomShaper http://www.joomshaper.com
 * @copyright Copyright (c) 2010 - 2020 JoomShaper
 * @license http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 or later
*/
//no direct accees
defined ('_JEXEC') or die ('Restricted access');

use Joomla\CMS\Factory;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Router\Route;
use Joomla\CMS\Uri\Uri;

// import Joomla view library
jimport('joomla.application.component.view');

if(!class_exists('SppagebuilderHelperSite'))
{
	require_once JPATH_ROOT . '/components/com_sppagebuilder/helpers/helper.php';
}

class SppagebuilderViewForm extends JViewLegacy
{
	protected $form;
	protected $item;

	function display( $tpl = null )
	{
		$user = Factory::getUser();
		$app  = Factory::getApplication();

		$this->item = $this->get('Item');
		$this->form = $this->get('Form');

		if ( !$user->id ) {
			$uri = Uri::getInstance();	
			$pageURL = $uri->toString();
			$return_url = base64_encode($pageURL);
			$joomlaLoginUrl = 'index.php?option=com_users&view=login&return=' . $return_url;

			$app->redirect(Route::_($joomlaLoginUrl, false), Text::_('JERROR_ALERTNOAUTHOR'), 'message');
			return false;
		}

		$input = $app->input;
		$pageid = $input->get('id', '', 'INT');
		$item_info  = SppagebuilderModelPage::getPageInfoById($pageid);
		$authorised = $user->authorise('core.edit', 'com_sppagebuilder.page.' . $pageid) || ($user->authorise('core.edit.own',   'com_sppagebuilder.page.' . $pageid) && $item_info->created_by == $user->id);

		if ($authorised !== true)
		{
			$app->enqueueMessage(Text::_('COM_SPPAGEBUILDER_ERROR_EDIT_PERMISSION'), 'error');
			$app->setHeader('status', 403, true);
			return false;
		}

		// Check for errors.
		if (count($errors = (array) $this->get('Errors')))
		{
			JError::raiseWarning(500, implode("\n", $errors));
			return false;
		}

		$this->_prepareDocument($this->item->title);
		SppagebuilderHelperSite::loadLanguage();
		parent::display($tpl);
	}

	protected function _prepareDocument($title = '')
	{
		$config 	= Factory::getConfig();
		$app 		= Factory::getApplication();
		$doc 		= Factory::getDocument();
		$menus   	= $app->getMenu();
		$menu 		= $menus->getActive();

		if(isset($menu))
		{
			if($menu->getParams()->get('page_title', ''))
			{
				$title = $menu->getParams()->get('page_title');
			}
			else
			{
				$title = $menu->title;
			}
		}

		//Include Site title
		$sitetitle = $title;
		if($config->get('sitename_pagetitles')==2)
		{
			$sitetitle = Text::sprintf('JPAGETITLE', $sitetitle, $app->get('sitename'));
		}
		elseif ($config->get('sitename_pagetitles')==1)
		{
			$sitetitle = Text::sprintf('JPAGETITLE', $app->get('sitename'), $sitetitle);
		}

		$doc->setTitle($sitetitle);

	}
}
