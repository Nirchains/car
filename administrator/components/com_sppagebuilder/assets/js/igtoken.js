jQuery(function ($) {
	var config = Joomla.getOptions('igConfig');

	var $appIdInput = $('.sppb-ig-token #app_id'),
		$appSecretInput = $('.sppb-ig-token #app_secret'),
		$accessTokenInput = $('.sppb-ig-token #access_token'),
		$igIdInput = $('.sppb-ig-token #ig_id'),
		$igNextBtn = $('.sppb-ig-token #ig_next'),
		$appTokenBtn = $('.sppb-ig-token #app_token');

	var nameMap = {
		app_id: 'appId',
		app_secret: 'appSecret',
		access_token: 'accessToken',
		ig_id: 'igId',
	};

	var data = {
		appId: $appIdInput.val(),
		appSecret: $appSecretInput.val(),
		accessToken: $accessTokenInput.val(),
		igId: $igIdInput.val(),
	};

	var original = JSON.parse(JSON.stringify(data));

	var handleInputChange = function (e) {
		var id = e.target.id,
			value = e.target.value;
		data[nameMap[id]] = value;

		if (
			original.appId !== data.appId ||
			original.appSecret !== data.appSecret
		) {
			var $ATGrp = $accessTokenInput.closest('.control-group');
			if (!$ATGrp.hasClass('hidden')) $ATGrp.addClass('hidden');

			var $IGGrp = $igIdInput.closest('.control-group');
			if (!$IGGrp.hasClass('hidden')) $IGGrp.addClass('hidden');

			var $NextGrp = $igNextBtn.closest('.control-group');
			if ($NextGrp.hasClass('hidden')) $NextGrp.removeClass('hidden');
			var $TokenGrp = $appTokenBtn.closest('.control-group');
			if (!$TokenGrp.hasClass('hidden')) $TokenGrp.addClass('hidden');
		} else {
			var $ATGrp = $accessTokenInput.closest('.control-group');
			if ($ATGrp.hasClass('hidden')) $ATGrp.removeClass('hidden');

			var $IGGrp = $igIdInput.closest('.control-group');
			if ($IGGrp.hasClass('hidden')) $IGGrp.removeClass('hidden');

			var $NextGrp = $igNextBtn.closest('.control-group');
			if (!$NextGrp.hasClass('hidden')) $NextGrp.addClass('hidden');
			var $TokenGrp = $appTokenBtn.closest('.control-group');
			if ($TokenGrp.hasClass('hidden')) $TokenGrp.removeClass('hidden');
		}

		$('.sppb-ig-token input#' + config.inputId).val(JSON.stringify(data));
	};

	$appIdInput.on('keyup', handleInputChange);
	$appSecretInput.on('keyup', handleInputChange);
	$accessTokenInput.on('change', handleInputChange);
	$igIdInput.on('change', handleInputChange);

	$appTokenBtn.on('click', function (e) {
		e.preventDefault();
		var appId = $appIdInput.val();
		var appSecret = $appSecretInput.val();

		if (!appId || !appSecret) {
			alert(
				'You have to insert your facebook APP_ID and APP_SECRET for getting the access token!'
			);
			return;
		}

		var url =
			config.base +
			'/index.php?option=com_sppagebuilder&task=instagram.accessToken';

		window.open(
			url,
			'window name',
			'location=yes,height=750,left=350,top=0,width=750,modal=yes,alwaysRaised=yes'
		);
	});
});
