import Spa_util from './spa.util';
import Spa_util_b from './spa.util_b';
require("../styles/sass/spa.chat.scss");

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
						<div class="spa-chat-head-toggle">+</div>
						<div class="spa-chat-head-title">
							Chat
						</div>
					</div>
					<div class="spa-chat-closer">x</div>
					<div class="spa-chat-sizer">
						<div class="spa-chat-list">
							<div class="spa-chat-list-box"></div>
						</div>
						<div class="spa-chat-msg">
							<div class="spa-chat-msg-log"></div>
							<div class="spa-chat-msg-in">
								<form class="spa-chat-msg-form">
									<input type="text" />
									<input type="submit" style="display: none;" />
									<div class="spa-chat-msg-send">
										send
									</div>
								</form>
							</div>
						</div>
					</div>
				</div>
			`,
			settable_map: {
				slider_open_time: true,
				slider_close_time: true,
				slider_opened_em: true,
				slider_closed_em: true,
				slider_opened_title: true,
				slider_closed_title: true,

				spa_shell: true,
				chat_model: true,
				people_model: true,
				set_chat_anchor: true
			},
			slider_open_time: 250,
			slider_close_time: 250,
			slider_opened_em: 18,
			slider_closed_em: 2,
			slider_opened_min_em: 10,
			window_height_min_em: 20,
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
			$list_box: $slider.find('.spa-chat-list-box'),
			$msg_log: $slider.find('.spa-chat-msg-log'),
			$msg_in: $slider.find('.spa-chat-msg-in'),
			$input: $slider.find('.spa-chat-msg-in input[type=text]'),
			$send: $slider.find('.spa-chat-msg-send'),
			$form: $slider.find('.spa-chat-msg-form'),
			$window: $(window)
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
		let
			$list_box;
		this.stateMap.$append_target = $append_target;
		$append_target.append(this.configMap.main_html);
		
		this._setJqueryMap();
		this._setPxSizes();

		//intilize chat slider to default title and state
		this.jqueryMap.$toggle.prop('title', this.configMap.slider_closed_title);
		this.jqueryMap.$head.click(this, this._onClickToggle.bind(this));
		this.stateMap.position_type = 'closed';

		//have $list_box subscribe to jQuery global events
		$list_box = this.jqueryMap.$list_box;
		$.gevent.subscribe($list_box, 'spa-listchange', this._onListchange.bind(this));
		$.gevent.subscribe($list_box, 'spa-setchatee', this._onSetchatee.bind(this));
		$.gevent.subscribe($list_box, 'spa-updatechat', this._onUpdatechat.bind(this));
		$.gevent.subscribe($list_box, 'spa-login', this._onLogin.bind(this));
		$.gevent.subscribe($list_box, 'spa-logout', this._onLogout.bind(this));

		//bind user input events
		this.jqueryMap.$head.bind('click', this._onClickToggle.bind(this));
		this.jqueryMap.$list_box.bind('click', this._onTapList.bind(this));
		this.jqueryMap.$send.bind('click', this._onSubmitMsg.bind(this));
		this.jqueryMap.$send.bind('submit', this._onSubmitMsg.bind(this));
		return true;
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
			toggle_text,
			user;
		//position type of 'opened' is not allowed for anon user
		//therefore we simply return false; 
		//the shell will fix the uri and try again
		user = this.configMap.people_model.get_user();
		if (position_type === 'opened' && user.get_is_anon(user)) {
			return false;
		}
		//return true if slider already in requested position
		if(this.stateMap.position_type === position_type) {
			// focus on the input box when slider is opened.
			if(position_type === 'opened') {
				this.jqueryMap.$input.focus();
			}
			return true;
		}

		switch(position_type) {
			case 'opened':
				height_px = this.stateMap.slider_opened_px;
				animate_time = this.configMap.slider_open_time;
				slider_title = this.configMap.slider_opened_title;
				toggle_text = '=';
				this.jqueryMap.$input.focus();
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
	 * [removeSlider 
	 * 		* Removes chatSlider DOM element
	 * 		* Reverts to intial state
	 * 		* remove pointers to callbacks and other data ]
	 * @return {[Boolean]} [description]
	 */
	removeSlider() {
		if(this.jqueryMap.$slider) {
			this.jqueryMap.$slider.remove(); //remove event bindings too
			this.jqueryMap = {};
		}

		this.stateMap.$append_target = null;
		this.stateMap.position_type = 'closed';

		//unwind key configurations
		this.configMap.chat_model = null;
		this.configMap.people_model = null;
		this.configMap.set_chat_anchor = null;

		return true;
	}
	/**
	 * [handleResize Given a window resize event, adjust the presentation]
	 * @return {[Boolean]} [
	 *         * true - resize considered
	 *         * false - resize not considered
	 * ]
	 * Actions:
	 * 		if the window height or width falls below a given threshold, resize the chat slider for the reduced window size
	 */
	handleResize() {
		if(! this.jqueryMap.$slider) {
			return false;
		}

		this._setPxSizes();
		if(this.stateMap.position_type === 'opened') {
			this.jqueryMap.$slider.css({
				height: this.stateMap.slider_opened_px
			});
		}
		return true;
	}
	/**
	 * [_setPxSizes to calculate the pixel sizes for elements managed by this module]
	 */
	_setPxSizes() {
		let 
			px_per_em, 
			window_height_em,
			opened_height_em;
		px_per_em = Spa_util_b.getEmSize(this.jqueryMap.$slider.get(0));
		//calculate window height in em unit
		window_height_em = Math.floor(
			(this.jqueryMap.$window.height() / px_per_em) + 0.5
		);
		opened_height_em 
			= window_height_em > this.configMap.window_height_min_em
			? this.configMap.slider_opened_em
			: this.configMap.slider_opened_min_em;

		this.stateMap.px_per_em = px_per_em;

		this.stateMap.slider_closed_px = this.configMap.slider_closed_em * px_per_em;
		this.stateMap.slider_opened_px = opened_height_em * px_per_em;

		
		this.jqueryMap.$sizer.css({
			height: (opened_height_em - 2) * px_per_em
		});

	}

	_onClickToggle(event) {
		let 
			set_chat_anchor = this.configMap.set_chat_anchor;
		if(this.stateMap.position_type === 'opened') {
			set_chat_anchor(this.configMap.spa_shell, 'closed');
		} else if(this.stateMap.position_type === 'closed') {
			set_chat_anchor(this.configMap.spa_shell,'opened');
		}
		return false;
	}

	_scrollChat() {
		let 
			$msg_log = this.jqueryMap.$msg_log;
		$msg_log.animate({
			scrollTop: $msg_log.prop('scrollHeight') - $msg_log.height()
		}, 150);
	}

	_writeChat(person_name, text, is_user) {
		let
			msg_class = is_user ? 'spa-chat-msg-log-me' :'spa-chat-msg-log-msg';
		this.jqueryMap.$msg_log.append(`
			<div class="${msg_class}">
				${Spa_util_b.encodeHtml(person_name)} : ${Spa_util_b.encodeHtml(text)}
			</div>
		`);
		this._scrollChat();
	}

	_writeAlert(alert_text) {
		this.jqueryMap.$msg_log.append(`
			<div class="spa-chat-msg-log-alert">
				${Spa_util_b.encodeHtml(alert_text)}
			</div>
		`);
		this._scrollChat();
	}

	_clearChat() {
		this.jqueryMap.$msg_log.empty();
	}

	_onSubmitMsg(event) {
		let 
			msg_text = this.jqueryMap.$input.val();
		if(msg_text.trim() === '') {
			return false;
		}
		this.configMap.chat_model.send_msg(msg_text);
		this.jqueryMap.$input.focus();
		this.jqueryMap.$send.addClass('spa-x-select');
		setTimeout(() => {
			this.jqueryMap.$send.removeClass('spa-x-select');
		}, 250);

		return false;
	}

	_onTapList(event) {
		let
			$tapped = $(event.elem_target),
			chatee_id;
		if(! $tapped.hasClass('spa-caht-list-name')) {
			return false;
		}

		chatee_id = $tapped.attr('data-id');

		if(! chatee_id) {
			return false;
		}

		this.configMap.chat_model.set_chatee(chatee_id);
		return false;
	}

	_onSetchatee(event, arg_map) {
		let
			new_chatee = arg_map.new_chatee,
			old_chatee = arg_map.old_chatee;
		this.jqueryMap.$input.focus();
		if(! new_chatee) {
			if(old_chatee) {
				this._writeAlert(old_chatee.name + ' has left the chat');
			} else {
				this._writeAlert('Your friend has left the chat');
			}
			this.jqueryMap.$title.text('Chat');
			return false;
		}
		this.jqueryMap.$list_box
			.find('.spa-chat-list-name')
			.removeClass('spa-x-select')
			.end()
			.find(`[data-id="${arg_map.new_chatee.id}"]`)
			.addClass('spa-x-select');
		this._writeAlert(`Now Chatting with ${arg_map.new_chatee.name}`);
		this.jqueryMap.$title.text(`Chat with ${arg_map.new_chatee.name}`);
		return true;
	}

	_onUpdatechat(event, msg_map) {
		let 
			is_user,
			sender_id = msg_map.sender_id,
			msg_text = msg_map.msg_text,
			chatee = this.configMap.chat_model.get_chatee() || {},
			sender = this.configMap.people_model.get_by_cid(sender_id);
		if(! sender) {
			this._writeAlert(msg_text);
			return false;
		}

		is_user = sender.get_is_user();
		if(! (is_user || sender_id === chatee.id)) {
			this.configMap.chat_model.set_chatee(sender_id);
		}

		this._writeChat(sender.name, msg_text, is_user);

		if(is_user) {
			this.jqueryMap.$input.val('');
			this.jqueryMap.$input.focus();
		}
	}

	_onListchange(event) {
		let
			list_html = String(),
			people_db = this.configMap.people_model.get_db(),
			chatee = this.configMap.chat_model.get_chatee();
		people_db().each((person) => {
			let 
				select_class = '';
			if(person.get_is_anon(person) || person.get_is_user(person)) {
				return true;
			}

			if(chatee && chatee.id === person.id) {
				select_class = 'spa-x-select';
			}

			list_html += `
				<div class="spa-chat-list-note">
					To chat alone is the fate of all great souls.. <br><br>
					No one is online
				</div>
			`;

			this._clearChat();
			this.jqueryMap.$list_box.html(list_html);

		});
	}

	_onLogin(event, login_user) {
		this.configMap.set_chat_anchor(this.configMap.spa_shell, 'opened');
	}

	_onLogout(event, logout_user) {
		this.configMap.set_chat_anchor(this.configMap.spa_shell, 'closed');
		this.jqueryMap.$title.text('Chat');
		this._clearChat();
	}
}