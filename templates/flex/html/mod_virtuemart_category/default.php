<?php // no direct access
defined('_JEXEC') or die('Restricted access');

/* ID for jQuery dropdown */
$ID = str_replace('.', '_', substr(microtime(true), -8, 8));
?>
<ul class="accordion-menu VMmenu<?php echo $class_sfx ?>" id="<?php echo "VMmenu".$ID ?>">


<?php foreach ($categories as $category) {
		$active_menu = '';
		//$active_child = '';
		$active_collapse = '';
		$collapsed = ' collapsed';
		$caturl = JRoute::_('index.php?option=com_virtuemart&view=category&virtuemart_category_id='.$category->virtuemart_category_id);
		if (($categoryModel->countProducts($category->virtuemart_category_id ) != 0 )) {
			$cattext = $category->category_name. ' <span class="nmb_products">'.$categoryModel->countProducts($category->virtuemart_category_id ).'</span>';
		} else {
			$cattext = $category->category_name;
		}
		if (in_array( $category->virtuemart_category_id, $parentCategories)) {
			/*
			foreach ($category as $deeper) { 
				if ($deeper->virtuemart_category_id == $active_category_id) {
					$active_child = ' deeper';
				}
			} 
			*/ 
			$active_collapse = ' in'; 
			$active_menu = ' class="active"';
			$collapsed = '';
		} 
?>
<li<?php echo $active_menu; ?>><?php echo JHTML::link($caturl, $cattext);

	if (!empty($category->childs)) { ?>
    	<span class="vmmenu-toggler<?php echo $collapsed; ?>" data-toggle="collapse" data-target="#collapse-vmmenu-<?php echo $category->virtuemart_category_id; ?>"><i class="open-icon fas fa-angle-down"></i></span>
	<?php } ?>
            	
    <?php if (!empty($category->childs)) { ?>
        <ul class="collapse<?php echo $active_collapse . $class_sfx; ?>" id="collapse-vmmenu-<?php echo $category->virtuemart_category_id; ?>">
        
			 <?php foreach ($category->childs as $child) { 
			 
			 	$active_menu = '';
				//$active_child = '';
				$active_collapse1 = '';
				$collapsed1 = ' collapsed';
				
                $active_child_menu = '';
                $catchildurl = JRoute::_('index.php?option=com_virtuemart&view=category&virtuemart_category_id='.$child->virtuemart_category_id);
                if (($categoryModel->countProducts($child->virtuemart_category_id ) != 0 )) {
                    $catchildtext = $child->category_name. '<span class="nmb_products">'.$categoryModel->countProducts($child->virtuemart_category_id ).'</span>';
                } else {
                    $catchildtext = $child->category_name;
                }
                if ($child->virtuemart_category_id == $active_category_id) {
					//$active_child = ' deeper';
					$active_child_menu = ' class="active"';
				}
				
				if (in_array( $child->virtuemart_category_id, $parentCategories)) {
					$active_collapse1 = ' in'; 
					$collapsed1 = '';
				}
				
                ?>
                
                <li<?php echo $active_child_menu; ?>><?php echo JHTML::link($catchildurl, $catchildtext); 
					if (!empty($category->childs)) { ?>
						<span class="vmmenu-toggler<?php echo $collapsed1; ?>" data-toggle="collapse" data-target="#collapse-childmenu-<?php echo $child->virtuemart_category_id; ?>"><i class="open-icon fas fa-angle-down"></i></span>
					<?php } ?>
				</li>
                
				<?php if(!empty($child->childs)){ ?>
                    <ul class="collapse<?php echo $active_collapse1 . $class_sfx; ?>" id="collapse-childmenu-<?php echo $child->virtuemart_category_id; ?>">
						<?php
						foreach ($child->childs as $child1) {
							
							$caturl = JRoute::_('index.php?option=com_virtuemart&view=category&virtuemart_category_id='.$child1->virtuemart_category_id);
							if (($categoryModel->countProducts($child1->virtuemart_category_id ) != 0 )) {
								$cattext = vmText::_($child1->category_name). '<span class="nmb_products">'.$categoryModel->countProducts($child1->virtuemart_category_id ).'</span>';
							} else {
								$cattext = vmText::_($child1->category_name);
							}
							
							if ($child1->virtuemart_category_id == $active_category_id) {
								$active_child_submenu = ' class="active"';
								$collapsed = '';
							} 
							?>
							<li<?php echo $active_child_submenu; ?>>
								<?php echo JHTML::link($caturl, $cattext); ?>
							</li>
							<?php
						} ?>
					</ul>
				<?php }
			} ?>
        </ul>
	<?php } ?>
</li>
<?php } ?>
</ul>
