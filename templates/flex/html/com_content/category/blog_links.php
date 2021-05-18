<?php
/**
 * Flex @package Helix Framework
 * @author Aplikko http://www.aplikko.com
 * @copyright Copyright (c) 2020 Aplikko
 * @license http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 or later
*/

defined('_JEXEC') or die;
?>
<ol class="clearfix">
<?php foreach ($this->link_items as &$item) : ?>
	<li>
    	<a href="<?php echo JRoute::_(ContentHelperRoute::getArticleRoute($item->slug, $item->catid, $item->language)); ?>"><?php echo $item->title; ?></a>
	</li>
<?php endforeach; ?>
</ol>