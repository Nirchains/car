/**
 * @package SP Page Builder
 * @author JoomShaper http://www.joomshaper.com
 * @copyright Copyright (c) 2010 - 2020 JoomShaper
 * @license http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 or later
 */

jQuery(function($) {
    $(document).on('click', '.sp-pagebuilder-btn-install, .sp-pagebuilder-btn-update', function(event) {
        event.preventDefault();
        var $this = $(this);
        var language = $this.closest('tr').data('language');

        $.ajax({
            type: "POST",
            url: pagebuilder_base + "index.php?option=com_sppagebuilder&task=languages.install&language=" + language,
            beforeSend: function() {
                $this.html('<span class="fas fa-spinner fa-spin" area-hidden="true"></span> Installing...');
            },
            success: function(response) {
                var data = $.parseJSON(response);
                if(data.success)
                {
                    $this.closest('tr').find('.installed-version').html('<span class="badge badge-success">' + data.version + '</span>');
                    $this.closest('td').html('<span class="text text-success"><span class="fas fa-check"></span> Installed</span>');
                }
                else
                {
                    $this.closest('td').html('<i class="fas fa-exclamation-triangle"></i> Error');
                    alert(data.message);
                }
            }
        });
    });
});