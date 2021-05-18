<?php
/**
 * Flex @package Helix Framework
 * @author Aplikko http://www.aplikko.com
 * @copyright Copyright (c) 2020 Aplikko
 * @license http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 or later
*/

defined('_JEXEC') or die;

JHtml::addIncludePath(JPATH_COMPONENT . '/helpers');

$doc = JFactory::getDocument(); 
$config = \JFactory::getConfig();
$sitename = $config->get('sitename');

/* Load template's parameters */
$tpl_params 	= JFactory::getApplication()->getTemplate(true)->params;

//opengraph
$doc->addCustomTag('<meta property="og:url" content="'. \JURI::current() . '" />');
$doc->addCustomTag('<meta property="og:site_name" content="'. htmlspecialchars($sitename) .'" />');
$doc->addCustomTag('<meta property="og:type" content="blog" />');
if (isset($this->category->title)) {
$doc->addCustomTag('<meta property="og:title" content="'. $this->category->title .'" />');
}
/*
if (isset($this->category->description) && $this->category->description) {
$doc->addCustomTag('<meta property="og:description" content="'. \JHtml::_('string.truncate', (strip_tags(JHtml::_('content.prepare', $this->category->description, '', 'com_content.category'))), 150) .'" />');
}
*/
if (!empty($this->category->getParams()->get('image'))) {
	$doc->addCustomTag('<meta property="og:image" content="'. \JURI::root().ltrim($this->category->getParams()->get('image'), '/') .'" />');
	$doc->addCustomTag('<meta property="og:image:width" content="900" />');
	$doc->addCustomTag('<meta property="og:image:height" content="600" />');
}
// Twitter
$doc->addCustomTag('<meta name="twitter:card" content="summary" />');
$doc->addCustomTag('<meta name="twitter:site" content="'. htmlspecialchars($sitename) .'" />');
$doc->addCustomTag('<meta name="twitter:title" content="'. $this->category->title .'" />');
/*
if (isset($this->category->description) && $this->category->description) {
$doc->addCustomTag('<meta name="twitter:description" content="'. \JHtml::_('string.truncate', (strip_tags(JHtml::_('content.prepare', $this->category->description, '', 'com_content.category'))), 150) .'" />');
}
*/
if (!empty($this->category->getParams()->get('image'))) {
    $doc->addCustomTag('<meta name="twitter:image:src" content="'. \JURI::root().ltrim($this->category->getParams()->get('image'), '/') .'" />');
}

$masonry_item_spacing = $tpl_params->get('blog_item_spacing', 0);

if ($masonry_item_spacing == 0) {
	$masonry_item_padding = 'padding:30px 0 0;';
	$blog_hr = 'hr.blog_hr {margin-bottom:0}';
} else {
	$masonry_item_padding = 'padding:'. $masonry_item_spacing . 'px;';
	$blog_hr = '';
}
$tpl_params->get('blog_item_bg') != '' ? $blog_item_bg = 'background-color:' . $tpl_params->get('blog_item_bg') . ';' : $blog_item_bg = '';

if ($tpl_params->get('blog_layout') == 'masonry') :
// Add styles for Masonry
$post_style = '.masonry_item .item .post_intro {'
		. $masonry_item_padding
		. $blog_item_bg
		. '}'
		. $blog_hr
		. '.masonry_item {margin:0 0 30px 0;}'
        . '.masonry_item .item > div {margin-bottom:0;}';
$doc->addStyleDeclaration($post_style);
endif;

?>
<div class="blog<?php echo $this->pageclass_sfx; ?>" itemscope itemtype="http://schema.org/Blog">
	<?php if ($this->params->get('show_page_heading', 1)) : ?>
		<div class="page-header">
			<h1> <?php echo $this->escape($this->params->get('page_heading')); ?> </h1>
		</div>
	<?php endif; ?>

	<?php if ($this->params->get('show_category_title', 1) or $this->params->get('page_subheading')) : ?>
		<h2><?php echo $this->escape($this->params->get('page_subheading')); ?>
			<?php if ($this->params->get('show_category_title')) : ?>
				<span class="subheading-category"><?php echo $this->category->title; ?></span>
			<?php endif; ?>
		</h2>
	<?php endif; ?>

	<?php if ($this->params->get('show_cat_tags', 1) && !empty($this->category->tags->itemTags)) : ?>
		<?php $this->category->tagLayout = new JLayoutFile('joomla.content.tags'); ?>
		<?php echo $this->category->tagLayout->render($this->category->tags->itemTags); ?>
	<?php endif; ?>

	<?php if ($this->params->get('show_description', 1) || $this->params->def('show_description_image', 1)) : ?>
		<div class="category-desc clearfix">
			<?php if ($this->params->get('show_description_image') && $this->category->getParams()->get('image')) : ?>
				<img src="<?php echo $this->category->getParams()->get('image'); ?>" alt="<?php echo htmlspecialchars($this->category->getParams()->get('image_alt')); ?>"/>
			<?php endif; ?>
			<?php if ($this->params->get('show_description') && $this->category->description) : ?>
				<?php echo JHtml::_('content.prepare', $this->category->description, '', 'com_content.category'); ?>
			<?php endif; ?>
		</div>
	<?php endif; ?>

	<?php if (empty($this->lead_items) && empty($this->link_items) && empty($this->intro_items)) : ?>
		<?php if ($this->params->get('show_no_articles', 1)) : ?>
			<p><?php echo JText::_('COM_CONTENT_NO_ARTICLES'); ?></p>
		<?php endif; ?>
	<?php endif; ?>

	<?php $leadingcount = 0; ?>
	<?php if (!empty($this->lead_items)) : ?>
		<div class="items-leading clearfix">
			<?php foreach ($this->lead_items as &$item) : ?>
				<article class="item leading-<?php echo $leadingcount; ?><?php echo $item->state == 0 ? ' system-unpublished' : null; ?><?php echo $item->featured ? ' item-featured' : ''; ?>"
					itemprop="blogPost" itemscope itemtype="http://schema.org/BlogPosting">
					<?php
					$this->item = & $item;
					echo $this->loadTemplate('item');
					?>
				</article>&nbsp;
				<?php $leadingcount++; ?>
			<?php endforeach; ?>
		</div><!-- end items-leading -->
	<?php endif; ?>

	<?php
	$introcount = (count($this->intro_items));
	$counter = 0;
	$columns = round((12 / $this->columns));
	
	if ($this->columns > 1) {
		$xs_columns = 'col-xs-12 ';
		$sm_columns = 'col-sm-6 ';
	} else {
		$xs_columns = 'col-xs-12 ';
		$sm_columns = 'col-sm-12 ';
	}
	?>
	<?php if ($tpl_params->get('blog_layout') == 'masonry') : ?>    
        <?php if (!empty($this->intro_items)) : ?>
            <?php $i = 1; ?>
                <div class="items-row items-masonry row clearfix">
            <?php foreach ($this->intro_items as $key => &$item) : ?>
                <?php $item->itemno = $i; ?>
                <?php $i = ($i == 7) ? 1 : $i ; ?>
                <?php $rowcount = ((int) $key % (int) $this->columns) + 1; ?>
                    <div class="<?php echo $xs_columns . $sm_columns; ?>col-md-<?php echo round((12 / $this->columns)); ?> masonry_item">
                        <article class="item column-<?php echo $rowcount; ?><?php echo $item->state == 0 ? ' system-unpublished' : null; ?><?php echo $item->featured ? ' item-featured' : ''; ?>"
                            itemprop="blogPost" itemscope itemtype="http://schema.org/BlogPosting">
                            <?php
                            $this->item = & $item;
                            echo $this->loadTemplate('item');
                            ?>
                        </article>
                        <!-- end item -->
                        <?php $counter++; ?>
                    </div><!-- end col-sm-* -->
                <?php $i++; ?>
            <?php endforeach; ?>
                </div><!-- end row -->
        <?php endif; ?>
   
    <?php else : ?>
    
    	<?php if (!empty($this->intro_items)) : ?>
			<?php foreach ($this->intro_items as $key => &$item) : ?>
                <?php $rowcount = ((int) $key % (int) $this->columns) + 1; ?>
                <?php if ($rowcount == 1) : ?>
                    <?php $row = $counter / $this->columns; ?>
                    <div class="items-row <?php echo 'row-' . $row; ?> row clearfix">
                <?php endif; ?>
                <div class="col-sm-<?php echo round((12 / $this->columns)); ?>">
                    <article class="item column-<?php echo $rowcount; ?><?php echo $item->state == 0 ? ' system-unpublished' : null; ?><?php echo $item->featured ? ' item-featured' : ''; ?>"
                        itemprop="blogPost" itemscope itemtype="http://schema.org/BlogPosting">
                        <?php
                        $this->item = & $item;
                        echo $this->loadTemplate('item');
                        ?>
                    </article>
                    <!-- end item -->
                    <?php $counter++; ?>
                </div>
                <?php if (($rowcount == $this->columns) or ($counter == $introcount)) : ?>
                    </div><!-- end row -->
                <?php endif; ?>
            <?php endforeach; ?>
        <?php endif; ?>
    <?php endif; ?>

	<?php if (!empty($this->link_items)) : ?>
		<div class="items-more clearfix">
			<?php echo $this->loadTemplate('links'); ?>
		</div>
	<?php endif; ?>
	<?php if (!empty($this->children[$this->category->id]) && $this->maxLevel != 0) : ?>
		<div class="cat-children clearfix">
			<?php if ($this->params->get('show_category_heading_title_text', 1) == 1) : ?>
				<h3><?php echo JTEXT::_('JGLOBAL_SUBCATEGORIES'); ?></h3>
			<?php endif; ?>
			<?php echo $this->loadTemplate('children'); ?></div>
	<?php endif; ?>
	<?php if (($this->params->def('show_pagination', 1) == 1 || ($this->params->get('show_pagination') == 2)) && ($this->pagination->get('pages.total') > 1)) : ?>
		<div class="pagination-wrapper clearfix">
			<?php if ($this->params->def('show_pagination_results', 1)) : ?>
				<p class="counter"><?php echo $this->pagination->getPagesCounter(); ?></p>
			<?php endif; ?>
			<?php echo $this->pagination->getPagesLinks(); ?>
		</div>
	<?php endif;
	// Fixed Masonry load from overlapping "Links" (Flex 3.8.3) 
if ($tpl_params->get('blog_layout') == 'masonry') {
	$doc->addScriptDeclaration('jQuery(function($){$(".items-masonry").imagesLoaded(function(){$(".items-masonry").masonry({itemSelector:".masonry_item"})})});');
}
?>
</div>