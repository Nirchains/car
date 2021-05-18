<?php
/**
 * Flex @package Helix Framework
 * @author Aplikko http://www.aplikko.com
 * @copyright Copyright (c) 2020 Aplikko
 * @license http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 or later
*/

defined('_JEXEC') or die;

// get item params and decode it
$item_decode = json_decode($item->params);

// Note. It is important to remove spaces between elements.
if ($item->anchor_css != 'hidden') {
	$class = $item->anchor_css ? 'class="' . $item->anchor_css . '" ' : '';
} else {
	$class = '';
}


$title = $item->anchor_title ? 'title="' . $item->anchor_title . '" ' : '';

if ($item->menu_image) {
	$item->params->get('menu_text', 1) ?
	$linktype = '<img src="' . $item->menu_image . '" alt="' . $item->title . '" /><span class="image-title">' . $item->title . '</span> ' :
	$linktype = '<img src="' . $item->menu_image . '" alt="' . $item->title . '" />';
} else {
	$linktype = $item->title;
}

$icon = '';
	
//Add Menu Pixeden Icon (for Flex)
if (isset($item_decode->peicon) && $item_decode->peicon) {
	$icon = ' <i class="pe ' . $item_decode->peicon . '"></i>';
} else {
	// FontAwesome icon
	
	if (isset($item_decode->icon) && $item_decode->icon) {
		
		if(strpos($item_decode->icon, "fab") !== false || strpos($item_decode->icon, "fas") !== false || strpos($item_decode->icon, "far") !== false) {
			// FontAwesome 5
			$fa_icon = str_replace("fa ", "", $item_decode->icon);
		} else {
			// FontAwesome 4
			$fa_icon = 'fa ' . $item_decode->icon;
		}
		
		$icon = ' <i class="' . $fa_icon . '"></i>';
	}
	
}

$flink = $item->flink;
$flink = JFilterOutput::ampReplace(htmlspecialchars($flink));

switch ($item->browserNav) {
	default:
	case 0:
?><a <?php echo $class; ?>href="<?php echo $flink; ?>" <?php echo $title; ?>><?php echo $icon . ' ' . $linktype; ?></a><?php
		break;
	case 1:
		// _blank
?><a <?php echo $class; ?>href="<?php echo $flink; ?>" target="_blank" <?php echo $title; ?>><?php echo $icon . ' ' .$linktype; ?></a><?php
		break;
	case 2:
	// Use JavaScript "window.open"
?><a <?php echo $class; ?>href="<?php echo $flink; ?>" onclick="window.open(this.href,'targetWindow','toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes');return false;" <?php echo $title; ?>><?php echo $icon . ' ' .$linktype; ?></a>
<?php
		break;
}

		if ($active_collapse != '') {
		   $collapsed = ' active-open';
		} else {
			$collapsed = ' collapsed';
		}

//if(($module->position == 'offcanvas') && ($item->deeper)) {
if($item->deeper) {
		echo '<span class="accordion-menu-toggler' . $collapsed . '" data-toggle="collapse" data-target="#collapse-menu-'. $item->id .'-'.$randomid.'"><i class="open-icon fas fa-chevron-down"></i></span>';	
} 