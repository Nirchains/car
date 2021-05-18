<?php
/**
 * Flex @package Helix Framework
 * @author Aplikko http://www.aplikko.com
 * @copyright Copyright (c) 2020 Aplikko
 * @license http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 or later
*/
defined('JPATH_BASE') or die;

?>
<dd class="createdby" itemprop="author" itemscope itemtype="http://schema.org/Person">
	<i class="fas fa-user"></i>
	<?php $author = ($displayData['item']->created_by_alias ? $displayData['item']->created_by_alias : $displayData['item']->author); ?>
	<?php $author = '<span itemprop="name" data-toggle="tooltip" title="' . JText::sprintf('COM_CONTENT_WRITTEN_BY', '') . '">' . $author . '</span>'; ?>
	<?php if (!empty($displayData['item']->contact_link ) && $displayData['params']->get('link_author') == true) : ?>
		<?php echo JHtml::_('link', $displayData['item']->contact_link, $author, array('itemprop' => 'url')); ?>
	<?php else :?>
		<?php echo $author; ?>
	<?php endif; ?>
</dd>