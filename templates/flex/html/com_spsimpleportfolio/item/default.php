<?php
/**
 * Flex @package Helix Framework
 * Template Name - Flex
 * @author Aplikko http://www.aplikko.com
 * @copyright Copyright (c) 2020 Aplikko
 * @license http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 or later
*/

defined('_JEXEC') or die();

$config = \JFactory::getConfig();
$sitename = $config->get('sitename');
$doc = JFactory::getDocument();

//opengraph
$doc->addCustomTag('<meta content="'. htmlspecialchars($sitename) .'" property="og:site_name" />');
// Twitter
$doc->addCustomTag('<meta name="twitter:card" content="summary" />');
$doc->addCustomTag('<meta name="twitter:site" content="'. htmlspecialchars($sitename) .'" />');
$doc->addCustomTag('<meta name="twitter:title" content="'. $this->item->title .'" />');
$doc->addCustomTag('<meta name="twitter:description" content="'. \JHtml::_('string.truncate', (strip_tags($this->item->description)), 150) .'" />');
if ($this->item->image) {
    $doc->addCustomTag('<meta name="twitter:image:src" content="'. \JURI::root().ltrim($this->item->image, '/') .'" />');
}


$doc->addStylesheet( JURI::root(true) . '/templates/flex/html/com_spsimpleportfolio/assets/css/spsimpleportfolio.css' );

if($this->params->get('remove_sidebar') == '2') {
	$full_width_style = ' style="width:100%;"';
} else {
	$full_width_style = '';
}

//video
if($this->item->video) {
	$video = parse_url($this->item->video);

	switch($video['host']) {
		case 'youtu.be':
		$video_id 	= trim($video['path'],'/');
		$video_src 	= '//www.youtube.com/embed/' . $video_id;
		break;

		case 'www.youtube.com':
		case 'youtube.com':
		parse_str($video['query'], $query);
		$video_id 	= $query['v'];
		$video_src 	= '//www.youtube.com/embed/' . $video_id;
		break;

		case 'vimeo.com':
		case 'www.vimeo.com':
		$video_id 	= trim($video['path'],'/');
		$video_src 	= "//player.vimeo.com/video/" . $video_id;
	}

}
?>
<div id="sp-simpleportfolio" class="sp-simpleportfolio sp-simpleportfolio-view-item">
	<div class="sp-simpleportfolio-image">
		<?php if($this->item->video) { ?>
		<div class="sp-simpleportfolio-embed">
			<iframe src="<?php echo $video_src; ?>" frameborder="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen></iframe>
		</div>
		<?php } else { ?>
		<?php if($this->item->image) { ?>
		<img class="sp-simpleportfolio-img" src="<?php echo $this->item->image; ?>" alt="<?php echo $this->item->title; ?>">
		<?php } else { ?>
		<img class="sp-simpleportfolio-img" src="<?php echo $this->item->thumbnail; ?>" alt="<?php echo $this->item->title; ?>">
		<?php } ?>
		<?php } ?>
	</div>
	<div class="sp-simpleportfolio-details clearfix">
		<div<?php echo $full_width_style; ?> class="sp-simpleportfolio-description entry-header">
			<h2><?php echo $this->item->title; ?>
            <div class="divider"></div></h2>
			<div class="clearfix"><?php echo JHtml::_('content.prepare', $this->item->description); ?></div>
			<?php if($this->params->get('show_back_to_cat_btn', 1) == '1') { ?>
            <hr /><a class="btn sppb-btn-default btn-sm" href="javascript:history.back()"><i style="margin-left:-7px;margin-right:7px;" class="pe pe-7s-back"></i><?php echo JText::_('COM_SPPORTFOLIO_BACK_TO_CATEGORY'); ?></a>
            <?php } ?>
		</div>    
        <?php if($this->params->get('remove_sidebar', 1) == '1') { ?>
        <div class="sp-simpleportfolio-meta">
			<?php 
				// Sidebar style without labels (only tooltips)
				if($this->params->get('sidebar_labels', 1) == '2') {
					
                    // create conditions for client title and logo
                    $client_title_conditon 		= (isset($this->item->client) && $this->item->client);
                    $client_avatar_condition 	= (isset($this->item->client_avatar) && $this->item->client_avatar);
    
                    if( $client_title_conditon || $client_avatar_condition){ ?>
                        <div class="sp-simpleportfolio-client sp-module no-labels">
							<?php if( $client_avatar_condition ){ 
                                    $client_avatar_alt = ($client_title_conditon) ? $this->item->client : $this->item->title;
                                ?>
                                <div class="sp-simpleportfolio-client-avatar no-labels"><img src="<?php echo JURI::root() . $this->item->client_avatar?>" alt="<?php echo $client_avatar_alt; ?>"></div>
                            <?php } //client_avatar_condition ?>
                            <?php if( $client_title_conditon ){ ?>
                                <div style="margin-top:18px;" class="sp-module-content no-labels"><i class="pe pe-7s-ribbon hasTooltip" title="<?php echo JText::_('COM_SPSIMPLEPORTFOLIO_PROJECT_CLIENT'); ?>"></i><?php echo $this->item->client; ?></div>
                            <?php } //client_title_conditon ?>
                        </div> <!-- /.sp-simpleportfolio-client -->
                        <hr />
                    <?php } // has project client logo or title ?>
                    <div class="sp-simpleportfolio-created sp-module no-labels">
                        <div class="sp-module-content"><i class="pe pe-7s-date hasTooltip" title="<?php echo JText::_('COM_SPSIMPLEPORTFOLIO_PROJECT_DATE'); ?>"></i><?php echo JHtml::_('date', $this->item->created_on, JText::_('DATE_FORMAT_LC3')); ?></div>
                    </div>
                    <hr />
                    <div class="sp-simpleportfolio-tags sp-module no-labels">
                        <div class="sp-module-content"><i class="pe pe-7s-ticket hasTooltip" title="<?php echo JText::_('COM_SPSIMPLEPORTFOLIO_PROJECT_CATEGORIES'); ?>"></i><?php echo implode(', ', $this->item->tags); ?></div>   
                    </div>
                    <hr />
                    <?php if ($this->item->url) { ?>
                    <div class="sp-simpleportfolio-link sp-module">
                        <a class="btn sppb-btn-dark sppb-btn-3d" target="_blank" href="<?php echo $this->item->url; ?>"><i style="padding-right:8px;font-size:140%;margin:-1px 0 0 -2px;vertical-align:middle;line-height:1.4;" class="pe pe-7s-airplay"></i><?php echo JText::_('COM_SPSIMPLEPORTFOLIO_VIEW_PROJECT'); ?></a>
                    </div>
                    <?php } ?>
           
		   <?php } 
			   // Sidebar style with labels (classic)
			   else { 
                    // create conditions for client title and logo
                    $client_title_conditon 		= (isset($this->item->client) && $this->item->client);
                    $client_avatar_condition 	= (isset($this->item->client_avatar) && $this->item->client_avatar);
    
                    if( $client_title_conditon || $client_avatar_condition){ ?>
                        <div class="sp-simpleportfolio-client sp-module">
                            <h3 class="sp-module-title"><i style="margin-right:1px;" class="far fa-address-card"></i>
                            <?php echo JText::_('COM_SPSIMPLEPORTFOLIO_PROJECT_CLIENT'); ?>
                            <div class="divider"></div></h3><div class="divider"></div>
                                <?php if( $client_avatar_condition ){ 
                                        $client_avatar_alt = ($client_title_conditon) ? $this->item->client : $this->item->title;
                                    ?>
                                    <div class="sp-simpleportfolio-client-avatar">
                                        <img src="<?php echo JURI::root() . $this->item->client_avatar?>" alt="<?php echo $client_avatar_alt; ?>">
                                    </div>
                                <?php } //client_avatar_condition ?>
        
                                <?php if( $client_title_conditon ){ ?>
                                    <div class="sp-simpleportfolio-client-title">
                                        <?php echo $this->item->client; ?>
                                    </div>
                                <?php } //client_title_conditon ?>
                        </div>
                    <?php } // has project client logo or title ?>
                    
                    <div class="sp-simpleportfolio-created sp-module">
                        <h3 class="sp-module-title"><i class="far fa-calendar-alt"></i> <?php echo JText::_('COM_SPSIMPLEPORTFOLIO_PROJECT_DATE'); ?><div class="divider"></div></h3><div class="divider"></div>
                        <div class="sp-module-content"><?php echo JHtml::_('date', $this->item->created_on, JText::_('DATE_FORMAT_LC3')); ?></div>
                    </div>
                    <div class="sp-simpleportfolio-tags sp-module">
                        <h3 class="sp-module-title"><i style="margin-right:1px;" class="fas fa-tags"></i> <?php echo JText::_('COM_SPSIMPLEPORTFOLIO_PROJECT_CATEGORIES'); ?><div class="divider"></div></h3><div class="divider"></div>
                        <div class="sp-module-content"><?php echo implode(', ', $this->item->tags); ?></div>
                    </div>
                    <?php if ($this->item->url) { ?>
                    <div class="sp-simpleportfolio-link sp-module">
                        <a class="btn sppb-btn-dark sppb-btn-3d" target="_blank" href="<?php echo $this->item->url; ?>"><i style="padding-right:8px;" class="fas fa-external-link-alt"></i><?php echo JText::_('COM_SPSIMPLEPORTFOLIO_VIEW_PROJECT'); ?></a>
                    </div>
                    <?php } ?>
                    
                <?php } ?> 
            </div>
        <?php } ?>  
	</div>
</div>