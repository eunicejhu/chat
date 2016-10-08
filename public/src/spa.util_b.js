/* globals $ */
export default class Spa_util_b {
	/**
	 * [decodeHtml unescape html entities in js, convert browser entities like &amp; into a displayed character like &]
	 * @param  {[type]} str [description]
	 * @return {[type]}     [description]
	 */
	decodeHtml(str) {
		return $('<div/>').html(str || '').text();
	}

	/**
	 * [encodeHtml description]
	 * @param  {[type]} input_arg_str [description]
	 * @param  {[type]} exclude_amp   [description]
	 * @return {[type]}               [description]
	 */
	static encodeHtml(input_arg_str, exclude_amp) {
		let 
			input_str = String(input_arg_str),
			regex,
			lookup_map;
		if(exclude_amp) {
			lookup_map = Spa_util_b.configMap.encode_noamp_map;
			regex = Spa_util_b.configMap.regex_encode_noamp;
		} else {
			lookup_map = Spa_util_b.configMap.html_encode_map;
			regex = Spa_util_b.configMap.regex_encode_html;
		}

		return input_str.replace(regex, (match, name) => {
			return lookup_map[match] || '';
		});
	}
	/**
	 * [_getEmSize utility method, convert the em display unit to pixels, so we can use measurements in jQuery]
	 * @param  {[type]} elem [description]
	 * @return {[type]}      [description]
	 */
	static getEmSize(elem) {
		return Number(
			getComputedStyle(elem, '').fontSize.match(/\d*\.?\d*/)[0]
		);
	}
}

Spa_util_b.configMap = {
	regex_encode_html: /[&"'><]/g,
	regex_encode_noamp: /["'><]/g,
	html_encode_map: {
		'&':  '&#38;', // special character : html entities
		'"': '&#34;',
		"'": '&#39;',
		'>': '&#62;',
		'<': '&#60;'
	}
}

// create q modified copy of the configurqtion used to encode entities
Spa_util_b.configMap.encode_noamp_map = $.extend({}, Spa_util_b.configMap.html_encode_map);
//delte & 
delete Spa_util_b.configMap.encode_noamp_map['&'];