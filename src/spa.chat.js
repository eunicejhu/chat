import Spa_util from './spa.util';
require("../styles/sass/spa.chat.scss")

/**
 *  * a function that provides capability to adjust the chat URI anchor parameter
 *  * an object that provides methods for sending and receiving messages (from the Model)
 *  * an object that provides methods to interact with a list of users (from the Model)
 *  * any number of behavior settings such as slider opened height, slider open time, and slider close time
 */
export default class Spa_chat {
	constructor() {
		this.configMap = {
			main_html: `
				<div class="spa-chat">
					<div class="spa-chat-head">
						<div class="spa-chat-head-toggle"></div>
						<div class="spa-chat-head-title">
							Chat
						</div>
					</div>
					<div class="spa-chat-closer"></div>
					<div class="spa-chat-sizer">
						<div class="spa-chat-msgs"></div>
						<div class="spa-chat-box">
							<input type="text" />
							<div>send</div>
						</div>
					</div>
				</div>
			`,
			settable_map: {
				slider_open_time: true,
				slider_close_time: true,
				slider_open_em: true,
				slider_close_em: true,
				slider_opened_title: true,
				slider_closed_title: true,

				chat_model: true,
				people_modle: true,
				set_chat_anchor: true
			},
			slider_open_time: 250,
			slider_close_time: 250,
			slider_open_em: 16,
			slider_close_em: 2,
			slider_opened_title: 'Click to close',
			slider_closed_title: 'Click to open',
			chat_model: null,
			people_modle: null,
			set_chat_anchor: null

		};
		this.stateMap = {
			$append_target: null,
			position_type: 'closed',
			px_per_em: 0,
			slider_hidden_px: 0,
			slider_closed_px: 0,
			slider_opened_px: 0
		};
		this.jqueryMap = {};
	}
	/**
	 * [_setJqueryMap DOM method]
	 */
	_setJqueryMap() {
		let 
			$append_target = this.stateMap.$append_target,
			$slider = $append_target.find(".spa-chat");

		this.jqueryMap = {
			$slider: $slider,
			$head: $slider.find('.spa-chat-head'),
			$toggle: $slider.find('.spa-chat-head-toggle'),
			$title: $slider.find('.spa-chat-head-title'),
			$sizer: $slider.find('.spa-chat-sizer'),
			$msgs: $slider.find('.spa-chat-msgs'),
			$box: $slider.find('.spa-chat-box'),
			$input: $slider.find('.spa-chat-input input[type=text]')
		};
	}
	/**
	 * [configModule Adjust configuration of allowed keys, configure the module prior to initialization]
	 * @param  {[type]} input_map 
	 * [	a map of settable keys and values
	 * 		* set_chat_anchor - a callback to modify the URI anchor to indicate opened or closed state.
	 * 		* chat_model - provides methods to interact with our instant messaging
	 * 		* people_model - provides methods to manage the list of people the model maintains
	 * 		* slider_* settings.
	 * ]
	 * Action: The internal configuration data structure (configMap) is updated with provided arguments. No other actions are taken.
	 * @return {[type]}           [description]
	 */
	configModule(input_map) {
		Spa_util.setConfigMap({
			input_map: input_map,
			settable_map: this.configMap.settable_map,
			config_map: this.configMap
		});
		return true;
	}
	/**
	 * [initModule initialize module, directs Chat to offer its capability to the user]
	 * @param  {[type]} $container [jquery element used by this feature]
	 * @return {[type]}            [description]
	 * Action: appends the chat slider to the provided container and fills it with HTML content. It then initilize elements, events, and handlers to provide the user with a chat-room interface
	 */
	initModule($append_target) {
		$append_target.append(this.configMap.main_html);
		this.stateMap.$append_target = $append_target;
		this._setJqueryMap();
		this._setPxSizes();

		//intilize chat slider to default title and state
		this.jqueryMap.$toggle.prop('title', this.configMap.slider_closed_title);
		this.jqueryMap.$head.click(this, this._onClickToggle);
		this.stateMap.position_type = 'closed';
		return true;
	}
	/**
	 * [_setChatAnchor change the chat component of the anchor]
	 * @param {[type]} postion_type ['closed' or 'opened']
	 * Action: changes the URI anchor parameter 'chat' to the requested value if possible
	 * Returns:
	 * 		* true - requested anchor part was updated
	 * 		* false - not updated
	 */
	_setChatAnchor(position_type) {

	}
	/**
	 * [setSliderPosition Ensure chat slider is in the requested state]
	 * @param {[type]}   position_type [enum('closed', 'opened', or 'hidden')]
	 * @param {Function} callback      [optional callback at end of animation]
	 * Action: 
	 * 		* leaves slider in current state if it matches requested,
	 * 		* otherwise animate to requested state
	 * Returns:
	 * 		* true - requested state achieved
	 * 		* false - requested state not achieved
	 */
	setSliderPosition(position_type, callback) {
		let 
			self = this,
			height_px, 
			animate_time, 
			slider_title, 
			toggle_text;
		//return true if slider already in requested position
		if(this.stateMap.position_type === position_type) {
			return true;
		}

		switch(postion_type) {
			case 'opened':
				height_px = this.stateMap.slider_opened_px;
				animate_time = this.configMap.slider_open_time;
				slider_title = this.configMap.slider_opened_title;
				toggle_text = '=';
				break;
			case 'closed':
				height_px = this.stateMap.slider_closed_px;
				animate_time = this.configMap.slider_close_time;
				slider_title = this.configMap.slider_closed_title;
				toggle_text = '+';
				break;
			case 'hidden':
				height_px = 0;
				animate_time = this.configMap.slider_close_time;
				slider_title = '';
				toggle_text = '+';
				break;
			default:
				return false;
		}

		this.stateMap.position_type = '';
		this.jqueryMap.$slider.animate(
		{
			height: height_px
		},
		animate_time,
		function() {
			self.jqueryMap.$toggle.prop('title', slider_title);
			self.jqueryMap.$toggle.text(toggle_text);
			self.stateMap.position_type = position_type;
			if(callback) {
				callback(self.jqueryMap.$slider);
			}
		});

		return true;
	}
	/**
	 * [_getEmSize utility method, convert the em display unit to pixels, so we can use measurements in jQuery]
	 * @param  {[type]} elem [description]
	 * @return {[type]}      [description]
	 */
	_getEmSize(elem) {
		return Number(
			getComputedStyle(elem, '').fontSize.match(/\d*\.?\d*/)[0]
		);
	}
	/**
	 * [_setPxSizes to calculate the pixel sizes for elements managed by this module]
	 */
	_setPxSizes() {
		let 
			px_per_em, 
			opened_height_em;
		px_per_em = this._getEmSize(this.jqueryMap.$slider.get(0));
		opened_height_em = this.configMap.slider_open_em;

		this.stateMap.px_per_em = px_per_em;

		this.stateMap.slider_closed_px = this.configMap.slider_close_em * px_per_em;
		this.stateMap.slider_opened_px = this.configMap.slider_open_em * px_per_em;

		this.jqueryMap.$slider.css({
			height: (opened_height_em - 2) * px_per_em
		});
	}

	_onClickToggle(event) {
		let 
			self = event.data,
			set_chat_anchor = self.configMap.set_chat_anchor;
		if(self.stateMap.position_type === 'opened') {
			set_chat_anchor('closed');
		} else if(self.stateMap.position_type === 'closed') {
			set_chat_anchor('opened');
		}
		return false;
	}
}