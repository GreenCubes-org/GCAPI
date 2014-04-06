$(function() {

	$(document).on('click', "#wtflink", function (e) {
		$.ajax({
			type: "GET",
			url: '/logout',
			success: function(data) {
				if (data.message === "Success") window.location.reload();
			}
		});
		return false;
	});
});
