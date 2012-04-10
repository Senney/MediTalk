$(document).ready(setupBar);
function setupBar() {
	$("#navMenu").hover(function() {
		var height = 105 + window.barheight;
		$("#navMenu").stop().animate( { height: height, top: (-1 * height) + 20, }, 120);
	}, function() {
		$("#navMenu").stop().animate( { height: '20px', top: '0px' }, 120);
	});
	
	$("#uname").hover(function() {
		$(this).css({color: '#88888'});
	}, function() {
		$(this).css({color: 'black'});
	});
}
