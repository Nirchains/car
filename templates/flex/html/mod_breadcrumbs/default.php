<?php
/**
 * @package     Joomla.Site
 * @subpackage  mod_breadcrumbs
 *
 * @copyright   Copyright (C) 2005 - 2017 Open Source Matters, Inc. All rights reserved.
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

defined('_JEXEC') or die;

JHtml::_('bootstrap.tooltip');

?>

<ol itemscope itemtype="https://schema.org/BreadcrumbList" class="breadcrumb<?php echo $moduleclass_sfx; ?>">
	<?php
	if ($params->get('showHere', 1)) {
		echo '<span>' . JText::_('MOD_BREADCRUMBS_HERE') . '&#160;</span>';
	} else {
		if (htmlspecialchars($params->get('homeText'), ENT_COMPAT, 'UTF-8') != '') {
			echo '';
		} else {
			echo '<li><i class="fa fa-home"></i></li>';
		}
	}

	// Get rid of duplicated entries on trail including home page when using multilanguage
	for ($i = 0; $i < $count; $i++)
	{
		if ($i === 1 && !empty($list[$i]->link) && !empty($list[$i - 1]->link) && $list[$i]->link === $list[$i - 1]->link)
		{
			unset($list[$i]);
		}
	}

	// Find last and penultimate items in breadcrumbs list
	end($list);
	$last_item_key   = key($list);
	prev($list);
	$penult_item_key = key($list);

	// Make a link if not the last item in the breadcrumbs
	$show_last = $params->get('showLast', 1);
	
	//JPath::clean($separator);
	$lang = JFactory::getLanguage();

		// If a custom separator has not been provided we try to load a template
		// specific one first, and if that is not present we load the default separator

			if ($lang->isRtl())
			{
				$_separator = htmlspecialchars(' \ ', ENT_COMPAT, 'UTF-8');
			}
			else
			{
				$_separator = htmlspecialchars(' / ', ENT_COMPAT, 'UTF-8');
			}
		

		//return $_separator;
	
// Generate the trail
	foreach ($list as $key => $item) :
		if ($key !== $last_item_key) :
			// Render all but last item - along with separator ?>
			<li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem">
				<?php if (!empty($item->link)) : ?>
					<a itemprop="item" href="<?php echo $item->link; ?>" class="pathway">
                    <span itemprop="name">
					  <?php echo $item->name; ?>
                    </span>
                    </a>
				<?php else : ?>
					<span itemprop="name">
					  <?php echo $item->name; ?>
					</span>
				<?php endif; ?>

                <?php if (($key !== $penult_item_key) || $show_last) : ?>

                    <?php if (htmlspecialchars($params->get('separator'), ENT_COMPAT, 'UTF-8') != '') : ?> 
                    	<span class="text_separator"><?php echo $separator; ?></span>
                    <?php else : ?>
                        <span class="breadcrumb_divider"><?php echo $_separator; ?><span>  
                    <?php endif; ?>
         
				<?php endif; ?>
                  
				<meta itemprop="position" content="<?php echo $key + 1; ?>">
			</li>
		<?php elseif ($show_last) :
			// Render last item if reqd. ?>
			<li itemprop="itemListElement" itemscope itemtype="https://schema.org/ListItem" class="active">
				<span itemprop="name">
					<?php echo $item->name; ?>
				</span>
				<meta itemprop="position" content="<?php echo $key + 1; ?>">
			</li>
		<?php endif;
	endforeach; ?>
</ol>
