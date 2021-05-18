/**
* @package SP Page Builder
* @author JoomShaper http://www.joomshaper.com
* @copyright Copyright (c) 2010 - 2020 JoomShaper
* @license http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 or later
*/

jQuery(function($) {

	Joomla.submitbutton = function(task, formSelector, validate)
	{

		var $button = '';
		if (task == 'page.save') {
            if($('#save-group-children-save').length) {
                $button = $('#save-group-children-save');
            } else {
                $button = $('#toolbar-save');
            }
			iconClass  = $button.find('span').attr('class');
		} else if (task == 'page.save2new') {
			$button = $('#toolbar-save-new');
			iconClass  = $button.find('span').attr('class');
		} else if (task == 'page.save2copy') {
			$button = $('#toolbar-save-copy');
			iconClass  = $button.find('span').attr('class');
		} else {
			$button = $('#toolbar-apply');
			iconClass  = $button.find('span').attr('class');
		}

		if (task == '')
		{
			return false;
		}
		else
		{
			var isValid=true;
			if (task != 'page.cancel' && task != 'page.close')
			{
				var forms = $('#adminForm.form-validate');
				for (var i = 0; i < forms.length; i++)
				{
					if (!document.formvalidator.isValid(forms[i]))
					{
						isValid = false;
						break;
					}
				}
			}
		
			if (isValid)
			{
				if (task != 'page.cancel' && task != 'page.close')
				{
					var form = $('#adminForm');
					form.find('input[name="task"]').val(task);

					$.ajax({
						type : 'POST',
						data: form.serialize(),
						url: pagebuilder_base + 'administrator/index.php?option=com_sppagebuilder&task=' + task,
						beforeSend: function() {
							$button.find('span').removeAttr('class').addClass('fas fa-spinner fa-spin');
						},
						success: function (response) {

							$button.find('span').removeAttr('class').addClass(iconClass);
			
							try {
								var data = $.parseJSON(response);
			
								var msg_class = 'success';
			
								if(!data.status) {
									var msg_class = 'error';
								}
			
								if(data.title) {
									$('#jform_title').val(data.title);
								}
			
								if(data.id) {
									$('#jform_id').val(data.id)
								}
			
								$('<div class="notify-'+ msg_class +'">' + data.message + '</div>').css({
									opacity: 0,
									'margin-top': -15,
									'margin-bottom': 0
								}).animate({
									opacity: 1,
									'margin-top': 0,
									'margin-bottom': 15
								},200).prependTo('.sp-pagebuilder-notifications');
			
								if(typeof window.warningAtReload !== 'undefined' && window.warningAtReload == true){
									window.warningAtReload = false;
								}
			
								$('.sp-pagebuilder-notifications').find('>div').each(function() {
									var $this = $(this);
			
									setTimeout(function(){
										$this.animate({
											opacity: 0,
											'margin-top': -15,
											'margin-bottom': 0
										}, 200, function() {
											$this.remove();
										});
									}, 3000);
								});
			
								if(!data.status) {
									return;
								}

								window.history.replaceState("", "", data.redirect);
			
								if(data.frontend_editor_url) {
									if($('#btn-page-frontend-editor').length === 0) {
										$('.sp-pagebuilder-frontend-actions').append('<a id="btn-page-frontend-editor" target="_blank" href="'+ data.frontend_editor_url +'" class="btn btn-primary">' + Joomla.JText._('COM_SPPAGEBUILDER_FRONTEND_EDITOR') + '</a>' + "\n");
									} else {
										$('#btn-page-frontend-editor').attr('href',data.frontend_editor_url);
									}
								}
			
								if(data.preview_url) {
									if($('#btn-page-preview').length === 0) {
										$('.sp-pagebuilder-frontend-actions').append('<a id="btn-page-preview" target="_blank" href="'+ data.preview_url +'" class="btn btn-outline-primary ml-3">' + Joomla.JText._('COM_SPPAGEBUILDER_PREVIEW') + '</a>' + "\n");
									} else {
										$('#btn-page-preview').attr('href',data.preview_url);
									}
								}
			
								if(task == 'page.save2new') {
									window.location.href= "index.php?option=com_sppagebuilder&view=page&layout=edit";
								}
			
								if(task == 'page.save') {
									window.location.href= "index.php?option=com_sppagebuilder&view=pages";
								}
			
							} catch (e) {
								window.location.href= "index.php?option=com_sppagebuilder&view=pages";
							}
						}
					});
				}
				else
				{
					Joomla.submitform(task, formSelector, validate);
				}
				return true;
			}
			else
			{
				return false;
			}
		}
	}

	var confirmOnPageExit = function (e)
	{
		if(typeof window.warningAtReload !== 'undefined' && window.warningAtReload == true){
	    // If we haven't been passed the event get the window.event
	    e = e || window.event;

	    var message = 'Do you want to lose unsaved data?';

	    // For IE6-8 and Firefox prior to version 4
	    if (e)
	    {
	        e.returnValue = message;
		}
		
		// For Chrome, Safari, IE8+ and Opera 12+
		return message;
		} else {
			return null;
		}
	};

	window.onbeforeunload = confirmOnPageExit;

	$(document).on({
        mouseenter: function () {
            var image = $(this).find('img')
            var imgHeight = $(this).find('img').outerHeight();
            var scroll = imgHeight - 230;
            image.css({top: '-' + scroll + 'px'})
        },
        mouseleave: function () {
            var image = $(this).find('img')
            image.css({top: 0})
        }
	}, ".sp-pagebuilder-page-templates li");
	
});