<?php
/**
 * Flex @package Helix Framework
 * @author Aplikko http://www.aplikko.com
 * @copyright Copyright (c) 2020 Aplikko
 * @license http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 or later
*/

defined('JPATH_BASE') or die;

?>
<dd class="modified">
	<i class="far fa-calendar-check"></i>
	<time datetime="<?php echo JHtml::_('date', $displayData['item']->modified, 'c'); ?>" itemprop="dateModified" data-toggle="tooltip" title="<?php echo JText::_('COM_CONTENT_MODIFIED_DATE'); ?>">
		<?php echo JHtml::_('date', $displayData['item']->modified, JText::_('DATE_FORMAT_LC3')); ?>
	</time>
</dd>