$(function () {
	function resizeWindow(onResize) {
		var wndH = window.outerHeight - window.innerHeight;
		wndH = (!wndH || wndH < 0) ? 50 : wndH;
		var wndW = window.outerWidth - window.innerWidth;
		wndW = (!wndW || wndW < 0) ? 50 : wndW;

		var ctrlH = 500 + wndH;
		var ctrlW = 605 + (wndW || 15);

		window.resizeTo(ctrlW, ctrlH);
		window.moveTo(Math.floor((screen.width - ctrlW) / 2), Math.floor((screen.height - ctrlH) / 2));
	}
	resizeWindow();

	$(document).on('submit', "#loginform", function (e) {
		$.ajax({
			type: "POST",
			url: '/login',
			data: $('form#loginform').serialize(),
			success: function (data) {
				if (data.error) {
					$('#loginerr').html('<div class="ui error message"><div class="header">' + data.error.message + '</div></div>');
				}

				if (data.message === 'Success') {
					window.location.reload();
				}
			},
			error: function (err) {
				html = formhtml = '<div id="hd-loginform">' +
					'<div class="ui gc-loginmessage">У сервера появились проблемы :(</div>' +
					'</div>'
			}
		});
		return false;
	});
});
