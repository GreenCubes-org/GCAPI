$(function() {
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
