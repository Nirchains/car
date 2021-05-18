/**
* @package SP Page Builder
* @author JoomShaper http://www.joomshaper.com
* @copyright Copyright (c) 2010 - 2020 JoomShaper
* @license http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 or later
*/

jQuery(function($) {
    
    function showNotification(message, status) {
        if($('.sp-pagebuilder-notifications').length === 0) {
            $('<div class="sp-pagebuilder-notifications"></div>').appendTo('body')
        }
        
        $('<div class="notify-'+ status +'">' + message + '</div>').css({
            opacity: 0,
            'margin-top': -15,
            'margin-bottom': 0
        }).animate({
            opacity: 1,
            'margin-top': 0,
            'margin-bottom': 15
        },200).prependTo('.sp-pagebuilder-notifications');
        
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
    }
    
    $('.sp-pagebuilder-form-group-toggler').find('>span').on('click', function(event) {
        event.preventDefault();
        if($(this).parent().hasClass('active')) {
            $(this).parent().removeClass('active');
        } else {
            $('.sp-pagebuilder-form-group-toggler').removeClass('active');
            $(this).parent().addClass('active');
        }
    });
    
    var confirmOnPageExit = function (e)
    {
        if(typeof window.warningAtReload !== 'undefined' && window.warningAtReload == true){
            e = e || window.event;
            
            var message = 'Do you want to lose unsaved data?';
            
            if (e)
            {
                e.returnValue = message;
            }
            return message;
        } else {
            return null;
        }
    };
    
    window.onbeforeunload = confirmOnPageExit;
    
    function getParameterByName(name, url) {
        if (!url) url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
        if (!results) return null;
        if (!results[2]) return '';
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
    
    
    $(document).on('click', '#btn-save-page', function(event) {
        event.preventDefault();
        
        var $this = $(this);
        
        var pageData = $.parseJSON($('#jform_sptext').val());
        
        pageData.filter(function(row){
            return row.columns.filter(function(column){
                return column.addons.filter(function(addon){
                    if (addon.type === 'sp_row' || addon.type === 'inner_row') {
                        return addon.columns.filter(function(column){
                            return column.addons.filter(function(addon){
                                if(typeof addon.htmlContent != undefined){
                                    delete addon.htmlContent;
                                }
                                if(typeof addon.assets != undefined){
                                    delete addon.assets;
                                }
                                return addon;
                            })
                        })
                        
                    }else{
                        if(typeof addon.htmlContent != undefined){
                            delete addon.htmlContent;
                        }
                        if(typeof addon.assets != undefined){
                            delete addon.assets;
                        }
                        return addon;
                    }
                    
                });
            })
        });
        
        $('#jform_sptext').val(JSON.stringify(pageData))
        
        var form = $('#adminForm');
        var pageId = $('#sp-page-builder').data('pageid');
        
        $.ajax({
            type : 'POST',
            url: pagebuilder_base + 'index.php?option=com_sppagebuilder&task=page.apply&pageId='+pageId,
            data: form.serialize(),
            beforeSend: function() {
                $this.find('.fa-save').removeClass('fa-save').addClass('fa-spinner fa-spin');
            },
            success: function (response) {
                
                try {
                    var data = $.parseJSON(response);
                    
                    $this.find('.fa').removeClass('fa-spinner fa-spin').addClass('fa-save');
                    
                    if($('.sp-pagebuilder-notifications').length === 0) {
                        $('<div class="sp-pagebuilder-notifications"></div>').appendTo('body')
                    }
                    
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
                    
                    if(data.preview_url) {
                        if($('#btn-page-preview').length === 0) {
                            $('#btn-page-options').parent().before('<div class="sp-pagebuilder-btn-group"><a id="btn-page-preview" target="_blank" href="'+ data.preview_url +'" class="sp-pagebuilder-btn sp-pagebuilder-btn-primary"><i class="fa fa-eye"></i> Preview</a></div>');
                        }
                    }
                    
                    if(event.target.id == 'btn-save-new') {
                        window.location.href= "index.php?option=com_sppagebuilder&view=page&layout=edit";
                    }
                    
                    if(event.target.id == 'btn-save-close') {
                        window.location.href= "index.php?option=com_sppagebuilder&view=pages";
                    }
                    
                } catch (e) {
                    window.location.href= "index.php?option=com_sppagebuilder&view=pages";
                }
            }
        });
    });
    
    // Add to menu
    $('.page-builder-form-menu').on('submit', function(event){
        event.preventDefault();
        var data = $(this).serialize();
        
        $.ajax({
            type: 'POST',
            url: pagebuilder_base + 'index.php?option=com_sppagebuilder&task=page.addToMenu&pageId=' + $('#sp-page-builder').data('pageid'),
            dataType: 'json',
            cache: false,
            data: data,
            beforeSend: function() {
                $('#sp-pagebuilder-btn-add-to-menu').find('.fa').removeClass('fa-save').addClass('fa-spinner fa-spin');
            },
            success: function(response) {
                $('#sp-pagebuilder-btn-add-to-menu').find('.fa').removeClass('fa-spinner fa-spin').addClass('fa-save');
                if(response.status) {
                    showNotification(response.success, 'success');
                    window.location.href = response.redirect;
                } else {
                    showNotification(response.error, 'error');
                }
            }.bind(this)
        });
    });
    
    // Change menu type
    $('#jform_menutype').change(function(){
        var menutype = $(this).val();
        $.ajax({
            url: pagebuilder_base + 'index.php?option=com_sppagebuilder&task=page.getMenuParentItem&menutype=' + menutype,
            dataType: 'json'
        }).done(function(data) {
            
            $('#jform_menuparent_id option').each(function() {
                if ($(this).val() != '1') {
                    $(this).remove();
                }
            });
            
            $.each(data, function (i, val) {
                var option = $('<option>');
                option.text(val.title).val(val.id);
                $('#jform_menuparent_id').append(option);
            });
            
            $('#jform_menuparent_id').trigger('liszt:updated');	

        });
    });

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
