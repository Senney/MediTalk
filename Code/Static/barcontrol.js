$(document).ready(setupBar);
function setupBar() {
	$("#navMenu").hover(function() {				
		$("#navMenu").stop().animate( { height: '300px', top: '-280px' }, 120);
	}, function() {
		$("#navMenu").stop().animate( { height: '20px', top: '0px' }, 120);
	});
}
