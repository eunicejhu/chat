let $ = require("jquery")
require("jquery.urianchor")
require("../styles/sass/index.scss")

let spa = (function() {
	let 
		configMap = {
			extended_height : 434,
			extended_title : 'Click to retract',
			retracted_height : 16,
			retracted_title : 'Click to extend',
			template_html : `<div class="spa-slider"></div>`
		},
		$chatSlider,
		toggleSlider,
		onClickSlider,
		initModule;

	toggleSlider = function() {
		let
			slider_height = $chatSlider.height();
			if(slider_height === configMap.retracted_height) {
				$chatSlider
					.animate({height : configMap.extended_height})
					.attr('title', configMap.extended_title);
				return true;
			} else if(slider_height === configMap.extended_height) {
				$chatSlider
					.animate({height : configMap.retracted_height})
					.attr('title', configMap.extended_title);
				return true;
			}
			//if slider is in transition
			return false;
	};

	onClickSlider = function(event) {
		toggleSlider();
		return false;
	};

	initModule = function($container) {
		$container.html(configMap.template_html);
		$chatSlider = $container.find('.spa-slider');
		$chatSlider
			.attr('title', configMap.retracted_title)
			.click(onClickSlider);
		return true;
	};

	return {initModule : initModule}
}());

$(document).ready(function() {
	spa.initModule($('#spa'));
	console.log("anchor: ", $.uriAnchor)
})