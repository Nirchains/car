<?php
/**
 * Flex @package Helix Framework
 * @author Aplikko http://www.aplikko.com
 * @copyright Copyright (c) 2020 Aplikko
 * @license http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 or later
*/
defined('JPATH_BASE') or die;

use Joomla\Registry\Registry;

JLoader::register('TagsHelperRoute', JPATH_BASE . '/components/com_tags/helpers/route.php');

?>
<?php if (!empty($displayData)) : ?>
	<div class="tags">
    	<?php // Tags or (one) tag
		foreach ($displayData as $n => $nmb) :
			if($n == 0) :
				$number_tags = '';
            else : 
				$number_tags = 's';
            endif;
		endforeach; ?>
        <span><i class="fas fa-tag<?php echo $number_tags; ?> hasTooltip" title="<?php echo JText::_('HELIX_TAGS'); ?>"></i></span>   
		<?php foreach ($displayData as $i => $tag) : ?>
			<?php if (in_array($tag->access, JAccess::getAuthorisedViewLevels(JFactory::getUser()->get('id')))) : ?>
				<?php $tagParams = new Registry($tag->params); ?>
				<?php $link_class = $tagParams->get('tag_link_class'); ?>
				<a href="<?php echo JRoute::_(TagsHelperRoute::getTagRoute($tag->tag_id . '-' . $tag->alias)) ?>" class="<?php echo $link_class; ?>" rel="tag"><?php echo $this->escape($tag->title); ?></a>
				<?php if ($link_class != 'label label-info') { 
					if($i != (count($displayData)-1)) echo ','; ?>	
				<?php } ?>
			<?php endif; ?>
		<?php endforeach; ?>
	</div>
<?php endif; ?>
