/**
* @package SP Page Builder
* @author JoomShaper http://www.joomshaper.com
* @copyright Copyright (c) 2010 - 2020 JoomShaper
* @license http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 or later
*/

jQuery(function($) {

	// Edit Sidebar
	$('[data-pb-sidebar-action]').on('click', function(event)
	{
		event.preventDefault();
		var $this = $(this);
		$('.sp-pagebuilder-sidebar-tabs').find('[data-pb-sidebar-action]').not(this).parent().removeClass('active');
		$this.parent().toggleClass('active');
	});

	$('.sp-pagebuilder-close-sidebar').on('click', function(event)
	{
		event.preventDefault();
		$('.sp-pagebuilder-sidebar-tabs').find('.sp-pagebuilder-sidebar-tab-item').removeClass('active');
	});

	// Override Joomla sidebar
	var sidebar = $('.sp-pagebuilder-admin [data-sidebar]');
	var sidebarHtml = sidebar.html();

	var joomlaSidebar = $('#sidebarmenu');
	var joomlaSidebarNav = joomlaSidebar.find('> nav');

	var joomlaMenu = joomlaSidebarNav.find('ul.main-nav:not(.sppagebuilder-nav)');

	joomlaMenu.hide();

	var joomlaSidebarTemplate = $('[data-joomla-sidebar]').html();

	joomlaMenu.prepend(joomlaSidebarTemplate);

	// Append our own sidebar
	joomlaSidebarNav.append(sidebarHtml);

	var spPageBuilderMenu = joomlaSidebarNav.find('ul.sppagebuilder-nav');

	// Media items
	if($('.sp-pagebuilder-media-categories').length)
	{
		var mediaSidebarMenu = $('.sp-pagebuilder-media-categories').html();
		$('.item-sp-pagebuilder-media').find('>a').removeClass('no-dropdown').addClass('has-arrow');
		$('.item-sp-pagebuilder-media').append(mediaSidebarMenu);
		$('.sp-pagebuilder-media-categories').remove();
	}

	$(document).on('click', '[data-back-joomla]', function() {
		joomlaMenu.show();
		spPageBuilderMenu.hide();
	});

	$(document).on('click', '[data-back-sppagebuilder]', function() {
		joomlaMenu.hide();
		spPageBuilderMenu.show();
	});
	
});