<?php
/**
 * Flex @package Helix Framework
 * @author Aplikko http://www.aplikko.com
 * @copyright Copyright (c) 2020 Aplikko
 * @license http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 or later
*/

defined('JPATH_BASE') or die;

?>
<dd class="category-name">
	<i class="far fa-folder-open"></i>
	<?php $title = $this->escape($displayData['item']->category_title); ?>
	<?php if ($displayData['params']->get('link_category') && $displayData['item']->catslug) : ?>
		<?php echo '<a href="' . JRoute::_(ContentHelperRoute::getCategoryRoute($displayData['item']->catslug)) . '" itemprop="genre" data-toggle="tooltip" title="' . JText::_('COM_CONTENT_CONTENT_TYPE_CATEGORY') . '">' . $title . '</a>'; ?>
	<?php else : ?>
		<?php echo '<span itemprop="genre" itemprop="genre" data-toggle="tooltip" title="' . JText::_('COM_CONTENT_CONTENT_TYPE_CATEGORY') . '">' . $title . '</span>'; ?>
	<?php endif; ?>
</dd>