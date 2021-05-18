/**
* @package SP Page Builder
* @author JoomShaper http://www.joomshaper.com
* @copyright Copyright (c) 2010 - 2020 JoomShaper
* @license http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 or later
*/

jQuery(function($) {

	// Toggle
	$(document).on('click', '[data-integration-toggle]', function(event) {
		event.preventDefault();

		var $this = $(this),
			group = $this.closest('[data-integration-list-item]').data('group'),
			name = $this.closest('[data-integration-list-item]').data('name');

		$.ajax({
			type : 'POST',
			url: pagebuilder_base + 'index.php?option=com_sppagebuilder&task=integrations.toggle&group=' + group + '&name=' + name,
			beforeSend: function()
			{
				$this.html('<span class="fas fa-spinner fa-spin" area-hidden="true"></span>');
			},
			success: function (response)
			{
				var data = $.parseJSON(response);
				console.log(data);
				if(data.success) {
					if(data.result)
					{
						$this.closest('[data-integration-list-item]').addClass('enabled');
						$this.removeClass('btn-primary').addClass('btn-danger').text('Deactivate');
					}
					else
					{
						$this.closest('[data-integration-list-item]').removeClass('enabled');
						$this.removeClass('btn-danger').addClass('btn-primary').text('Activate');
					}
				} else {
					alert(data.message);
				}
			}
		});
	});

});
