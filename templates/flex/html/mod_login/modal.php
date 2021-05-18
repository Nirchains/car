<?php
/**
* @package		Joomla.Site
* @subpackage	mod_login
* @copyright	Copyright (C) 2005 - 2016 Open Source Matters, Inc. All rights reserved.
* @license		GNU General Public License version 2 or later; see LICENSE.txt
*/

// no direct access
defined('_JEXEC') or die;
require_once JPATH_SITE . '/components/com_users/helpers/route.php';
$doc = JFactory::getDocument();
JHtml::_('behavior.keepalive');
JHtml::_('bootstrap.tooltip');

$user = JFactory::getUser();

?>
<div class="modal-login-wrapper">
	<span class="top-divider"></span>
    <div class="ap-modal-login login">
        <span class="ap-login">
            <a id="modal-<?php echo $module->id; ?>-launch" href="javascript:void(0)" role="button">
                <i class="pe pe-7s-user"></i>
                <span class="info-content">
                <?php echo JText::_('FLEX_LOGIN'); ?>
                </span>
            </a>  
        </span>
        <?php // Flex Modal ?>
        	<div id="fm-<?php echo $module->id; ?>" class="flex-modal modal-login" aria-labelledby="<?php echo $module->id; ?>-ModalLabel" aria-hidden="true" role="dialog" tabindex="-1">
                <div class="flex-modal-content modal-content" role="document">
                     <button type="button" class="fm-<?php echo $module->id; ?>-close fm-close close" aria-label="Close" data-dismiss="flex-modal" aria-hidden="true"><i class="pe pe-7s-close-circle"></i></button>
                    <div class="flex-modal-header modal-header">
                    	<h2 id="<?php echo $module->id; ?>-ModalLabel" class="title">
                        <svg style="margin:-7px 0 0;vertical-align:middle;" width="1.22em" height="1.22em" viewBox="0 0 16 16" class="bi bi-person major_color-lighten-20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M13 14s1 0 1-1-1-4-6-4-6 3-6 4 1 1 1 1h10zm-9.995-.944v-.002.002zM3.022 13h9.956a.274.274 0 0 0 .014-.002l.008-.002c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664a1.05 1.05 0 0 0 .022.004zm9.974.056v-.002.002zM8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4zm3-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/></svg>
                        <?php echo ($user->id>0) ? JText::_('MY_ACCOUNT') : JText::_('JLOGIN'); ?></h2>
                    </div> 
                    <div class="flex-modal-body modal-body">
                    <form action="<?php echo JRoute::_(htmlspecialchars(JUri::getInstance()->toString()), true, $params->get('usesecure')); ?>" method="post" id="modal-login-form">
                            <?php if ($params->get('pretext')): ?>
                                <div class="pretext">
                                    <p><?php echo $params->get('pretext'); ?></p>
                                </div>
                            <?php endif; ?>
                            <fieldset class="userdata">
                                <input id="modallgn-username" placeholder="<?php echo JText::_('MOD_LOGIN_VALUE_USERNAME') ?>" type="text" name="username" class="input-block-level" required="required"  />
                                <input id="modallgn-passwd" type="password" placeholder="<?php echo JText::_('JGLOBAL_PASSWORD') ?>" name="password" class="input-block-level" required="required" />
                                <?php if (count($twofactormethods) > 1) : ?>
                                <div class="clearfix"></div>
                                <div id="form-login-secretkey" class="control-group">
                                    <div class="controls">
                                        <?php if (!$params->get('usetext')) : ?>
                                            <div class="input-prepend input-append">
                                                <span class="add-on">
                                                    <span class="far fa-star"></span>
                                                        <label for="modallgn-secretkey" class="hidden"><?php echo JText::_('JGLOBAL_SECRETKEY'); ?></label>
                                                </span>
                                                <input id="modallgn-secretkey" autocomplete="off" type="text" name="secretkey" class="form-control" tabindex="0" size="18" placeholder="<?php echo JText::_('JGLOBAL_SECRETKEY'); ?>" />
                                                <span class="add-on hasTooltip" title="<?php echo JText::_('JGLOBAL_SECRETKEY_HELP'); ?>">
                                                    <span class="far fa-question-circle"></span>
                                                </span>
                                        </div>
                                        <?php else : ?>
                                        <div class="input-append">
                                            <label for="modallgn-secretkey"><?php echo JText::_('JGLOBAL_SECRETKEY'); ?></label>
                                            <input id="modallgn-secretkey" autocomplete="off" type="text" name="secretkey" class="form-control" tabindex="0" size="18" placeholder="<?php echo JText::_('JGLOBAL_SECRETKEY'); ?>" />
                                            <span class="add-on hasTooltip" title="<?php echo JText::_('JGLOBAL_SECRETKEY_HELP'); ?>">
                                                <span class="far fa-question-circle"></span>
                                            </span>
                                        </div>
                                        <?php endif; ?>
                                    </div>
                                </div>
                                <?php endif; ?>
                                <div class="clearfix"></div>
                                <?php if (JPluginHelper::isEnabled('system', 'remember')) : ?>
                                    <div class="modlgn-remember remember-wrap">
                                        <input id="modallgn-remember" type="checkbox" name="remember" class="inputbox" value="yes"/>
                                        <label for="modallgn-remember"><?php echo JText::_('MOD_LOGIN_REMEMBER_ME') ?></label>
                                    </div>
                                <?php endif; ?>
                                <div class="button-wrap"><input type="submit" name="Submit" class="btn btn-primary sppb-btn-3d btn-xs-block" value="<?php echo JText::_('JLOGIN') ?>" /></div>
                                <div class="forget-name-link btn-xs-block">
                                    <?php echo JText::_('MOD_LOGIN_FORGOT'); ?> <a href="<?php echo JRoute::_('index.php?option=com_users&view=remind'); ?>">
                                    <?php echo JText::_('MOD_LOGIN_FORGOT_USERNAME'); ?></a> <?php echo jText::_('MOD_LOGIN_OR'); ?> <a href="<?php echo JRoute::_('index.php?option=com_users&view=reset'); ?>">
                                    <?php echo JText::_('MOD_LOGIN_FORGOT_PASSWORD'); ?></a> <?php echo JText::_('FLEX_QUESTION_MARK'); ?>
                                </div>
                                <input type="hidden" name="option" value="com_users" />
                                <input type="hidden" name="task" value="user.login" />
                                <input type="hidden" name="return" value="<?php echo $return; ?>" />
                                <?php echo JHtml::_('form.token'); ?>
                            </fieldset>
                            <?php if ($params->get('posttext')): ?>
                                <div class="posttext">
                                    <p><?php echo $params->get('posttext'); ?></p>
                                </div>
                            <?php endif; ?>
                        </form>
                    </div>
                    <?php
					$usersConfig = JComponentHelper::getParams('com_users');
					if ($usersConfig->get('allowUserRegistration')) : ?>
					<div class="modal-footer">
					<?php echo JText::_('MOD_NEW_REGISTER'); ?>
						<a href="<?php echo JRoute::_('index.php?option=com_users&view=registration'); ?>">
							<?php echo JText::_('MOD_LOGIN_REGISTER'); ?>
						</a>
					 </div>
					<?php endif; ?>
                </div>
            </div>
       <?php // END Flex Modal ?>
    </div>
</div>
<?php 
	// Add JS and minify
	$js ='
		setTimeout( function(){
			var modalFlex = document.getElementById("fm-'. $module->id .'");
			var launch_btn = document.getElementById("modal-'. $module->id .'-launch");
			var close_btn = document.getElementsByClassName("fm-'. $module->id .'-close")[0];
		
			function closingdown() {
				modalFlex.classList.remove("open-modal");
			}
			
			launch_btn.addEventListener("click", function(event) {
				modalFlex.classList.add("open-modal");
				
			});
			
			close_btn.addEventListener("click", function(event) {
				 closingdown()
			});
			
			window.addEventListener("click", function(event) {
				if (event.target == modalFlex) {
					closingdown()
				}
			});
			
			
		});	
		';
	$js = preg_replace(array('/([\s])\1+/', '/[\n\t]+/m'), '', $js); // Remove whitespace
	$doc->addScriptdeclaration($js);

	//Add css
	if (($params->get('pretext') && $params->get('posttext')) || count($twofactormethods) > 1) {
		$style = '.flex-modal .flex-modal-content {top:10vh;}';	
	} else {
		$style = '';	
	}	
	$doc->addStyleDeclaration($style);
?>