<?php
/**
 * Flex @package Helix Framework
 * @author Aplikko http://www.aplikko.com
 * @copyright Copyright (c) 2020 Aplikko
 * @license http://www.gnu.org/licenses/gpl-2.0.html GNU/GPLv2 or later
*/

defined('_JEXEC') or die;

// Note. It is important to remove spaces between elements.
$class = $item->anchor_css ? 'class="' . $item->anchor_css . '" ' : '';
$title = $item->anchor_title ? 'title="' . $item->anchor_title . '" ' : '';
$icon = '';

if ($item->menu_image)
{
	$item->params->get('menu_text', 1) ?
	$linktype = '<img src="' . $item->menu_image . '" alt="' . $item->title . '" /><span class="image-title">' . $item->title . '</span> ' :
	$linktype = '<img src="' . $item->menu_image . '" alt="' . $item->title . '" />';
}
else
{
	$linktype = $item->title;
}

$flink = $item->flink;
$flink = JFilterOutput::ampReplace(htmlspecialchars($flink));

switch ($item->browserNav) :
	default:
	case 0:
		$link_rel = ($item->anchor_rel) ? 'rel="' . $item->anchor_rel . '"' : '' ;
		?>
		<a <?php echo $class; ?> href="<?php echo $flink; ?>" <?php echo $title; ?> <?php echo $link_rel ?>><?php echo $icon . ' ' . $linktype; ?></a><?php
	break;
	case 1:
		// _blank
		$link_rel = ($item->anchor_rel == 'nofollow') ? 'noopener noreferrer nofollow' : 'noopener noreferrer';
		?>
		<a <?php echo $class; ?>href="<?php echo $flink; ?>" rel="<?php echo $link_rel ?>" target="_blank" <?php echo $title; ?>><?php echo $icon . ' ' . $linktype; ?></a><?php
	break;
	case 2:
		// Use JavaScript "window.open"
		$options = 'toolbar=no,location=no,status=no,menubar=no,scrollbars=yes,resizable=yes,' . $params->get('window_open');
			?><a <?php echo $class; ?>href="<?php echo $flink; ?>" onclick="window.open(this.href,'targetWindow','<?php echo $options;?>');return false;" <?php echo $title; ?>><?php echo $icon . ' ' . $linktype; ?></a><?php
	break;
endswitch;

		if ($active_collapse != '') {
		   $collapsed = ' active-open';
		} else {
			$collapsed = ' collapsed';
		}

if($item->deeper) {
		echo '<span class="accordion-menu-toggler' . $collapsed . '" data-toggle="collapse" data-target="#collapse-menu-'. $item->id .'-'.$randomid.'"><i class="open-icon fas fa-chevron-down"></i></span>';	
} 