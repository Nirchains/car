<?php
/**
 * @package     Joomla.Site
 * @subpackage  mod_related_items
 *
 * @copyright   Copyright (C) 2005 - 2020 Open Source Matters, Inc. All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */
defined('_JEXEC') or die;
// Include template's params
$tpl_params 	= JFactory::getApplication()->getTemplate(true)->params;
$has_lazyload = $tpl_params->get('lazyload', 1);
?>
<?php //echo count($list); ?>
<div class="relateditems <?php echo $moduleclass_sfx; ?> row">
<?php foreach ($list as $item) :	

	$attrbs = json_decode($item->attribs);
	$images = json_decode($item->images);
	$thumb_image = '';
	
	if(isset($images->image_intro) && !empty($images->image_intro)) {
		if(isset($attrbs->spfeatured_image) && !empty($attrbs->spfeatured_image)) {
			$thumb_image = $attrbs->spfeatured_image;
		} else {
			$thumb_image = $images->image_intro;
		}
	} elseif(isset($attrbs->spfeatured_image) && !empty($attrbs->spfeatured_image)) {
		$thumb_image = $attrbs->spfeatured_image;	
	} 

?>
<div class="relateditem col-sm-6" itemscope itemtype="http://schema.org/Article">
	<a href="<?php echo $item->route; ?>" itemprop="url">
        <?php if (!empty($thumb_image)) {?>
                <span class="img-responsive article-list-img">
                    <span class="overlay"></span>
                    <?php 
					if(strpos($thumb_image, 'http://') !== false || strpos($thumb_image, 'https://') !== false){
						if($has_lazyload) { ?>
                        	<img class="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" data-src="<?php echo $thumb_image; ?>" alt="<?php echo $item->title; ?>" data-expand="-20">
                    	<?php } else { ?>
                        	<img src="<?php echo $thumb_image; ?>" alt="<?php echo $item->title; ?>">
                        <?php } 
						} else { 
                        if($has_lazyload) { ?>
                        	<img class="lazyload" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" data-src="<?php echo JUri::root() . $thumb_image; ?>" alt="<?php echo $item->title; ?>" data-expand="-20">
                    	<?php } else { ?>
                        	<img src="<?php echo $thumb_image; ?>" alt="<?php echo $item->title; ?>">
                        <?php }
						} ?>  
                </span>
            <?php } ?>
            
		<span class="related-articles-title" itemprop="name">
			<?php echo $item->title; ?>
        </span> 
        <?php // echo $item->introtext; ?>
        <?php if ($showDate) echo '<div class="related_date">'.JHTML::_('date', $item->created, JText::_('d F Y H:i')).'</div>'; ?>
        
        </a>
	</div>
<?php endforeach; ?>
</div>
