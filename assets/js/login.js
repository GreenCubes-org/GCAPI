$(function () {
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
