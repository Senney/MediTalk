$(document).ready(setupBar);
function setupBar() {
	$("#navMenu").hover(function() {				
		$("#navMenu").stop().animate( { height: '160px', top: '-140px' }, 120);
	}, function() {
		$("#navMenu").stop().animate( { height: '20px', top: '0px' }, 120);
	});
}
