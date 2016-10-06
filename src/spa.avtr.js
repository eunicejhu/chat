import Spa_util_b from "./spa.util_b";
import Spa_util from "./spa.util";
require("../styles/sass/spa.avtr.scss");
export default class Spa_avtr {
	constructor() {
		this.configMap = {
			chat_model: null,
			people_model: null,
			settable_map: {
				chat_model: true,
				people_model: true
			}
		}

		//allow to track a dragged avatar between event handlers
		this.stateMap = {
			drag_map: null,
			$drag_target: null,
			drag_bg_color: undefined
		}

		this.jqueryMap = {}
	}
	/**
	 * [configModule 
	 * 		Configure the module prior to initialization
	 * 		values we do not expect to change during a user session]
	 * @return {[type]} [description]
	 * Actions:
	 * 		The internal configuration data structure (configMap) is updated with provided arguments.
	 * 		No other actions are taken.
	 * Throws:
	 * 		Javascript error object and stack trace on unacceptable or missing arguments
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
	 * [initModule directs the module to begin offering its feature]
	 * @param  {[type]} $container [description]
	 * @return {[type]}            [description]
	 * Action: Provides avatar interface for chat users
	 */
	initModule($container) {
		this._setJqueryMap($container);

		//bind model global events
		$.gevent.subscribe($container, 'spa-login', this._onListchange.bind(this));
		$.gevent.subscribe($container, 'spa-setchatee', this._onSetchatee.bind(this));
		$.gevent.subscribe($container, 'spa-listchange', this._onListchange.bind(this));
		$.gevent.subscribe($container, 'spa-logout', this._onLogout.bind(this));

		//bind actions
		//bind browser events next.
		//Doing this before the Model events could result in a race condition.
		$container
			.bind('utap', this._onTapNav.bind(this))
			.bind('uheldstart', this._onHeldstartNav.bind(this))
			.bind('uheldmove', this._onHeldmoveNav.bind(this))
			.bind('uheldend', this._onHeldendNav.bind(this));
		return true;
	}

	_getRandRgb() {
		let 
			rgb_list = [];
		[1,2,3].forEach((index) => {
			rgb_list.push(Math.floor(Math.random() * 128) + 128);
		});
		return `rgb(${rgb_list.join(',')})`;
	}

	_setJqueryMap($container) {
		this.jqueryMap = {
			$container: $container
		}
	}

	_updateAvatar($target) {
		let
			css_map,
			person_id;
		css_map = {
			top: parseInt($target.css('top'), 10),
			left: parseInt($target.css('left'), 10),
			'background-color': $target.css('background-color')
		};

		person_id = $target.attr('data-id');
		this.configMap.chat_model.update_avatar({
			person_id: person_id,
			css_map: css_map
		});
	}

	_onTapNav(event) {
		let
			css_map,
			$target = $(event.elem_target).closest('.spa-avtr-box');
		if($target.length === 0) {
			return false;
		}
		$target.css({
			'background-color': this._getRandRgb()
		});
		this._updateAvatar($target);
	}
	/**
	 * [_onHeldstartNav this is triggered when the user starts a dragging motion in the navigation area]
	 * @param  {[type]} event [description]
	 * @return {[type]}       [description]
	 */
	_onHeldstartNav(event) {
		let 
			offset_target_map,
			offset_nav_map,
			$target = $(event.elem_target).closest('.spa-avtr-box');
		if($target.length === 0) {
			return false;
		}
		this.stateMap.$drag_target = $target;
		offset_target_map = $target.offset();
		offset_nav_map = this.jqueryMap.$container.offset();

		offset_target_map.top -= offset_nav_map.top;
		offset_target_map.left -= offset_nav_map.left;

		this.stateMap.drag_map = offset_target_map;
		this.stateMap.drag_bg_color = $target.css('background-color');

		$target
			.addClass('spa-x-is-drag')
			.css('background-color', '');
	}
	/**
	 * [_onHeldmoveNav this is triggered when the user is in the process of dragging an avatar.
	 * 		this is executed frequently, 
	 * 		so calculation are kept to a minimum]
	 * @param  {[type]} event [description]
	 * @return {[type]}       [description]
	 */
	_onHeldmoveNav(event) {
		let
			drag_map = this.stateMap.drag_map;
		if(! drag_map) {
			return false;
		}
		drag_map.top += event.px_delta_y; //from jquery.event.ue
		drag_map.left += event.px_delta_x;

		this.stateMap.$drag_target.css({
			top: drag_map.top,
			left: drag_map.left
		});
	}
	/**
	 * [_onHeldendNav this is triggered when the user releases an avatar after a drag.
	 * 		The handler returns the dragged avatar back to its original color.
	 * 		It then invokes the updateAvatar method to read the avatar details and invoke the model.chat.update_avatar method]
	 * @param  {[type]} event [description]
	 * @return {[type]}       [description]
	 */
	_onHeldendNav(event) {
		let
			$drag_target = this.stateMap.$drag_target;
		if(! $drag_target) {
			return false;
		}

		$drag_target
			.removeClass('spa-x-is-drag')
			.css('background-color', this.stateMap.drag_bg_color);
		this.stateMap.drag_bg_color = undefined;
		this.stateMap.$drag_target = null;
		this.stateMap.drag_map = null;
		this._updateAvatar();
	}
	/**
	 * [_onSetchatee This is invoked when the Model publishes an spa-setchatee event.
	 * 		In this module, we set the outline of the chatee avatar to green]
	 * @param  {[type]} event   [description]
	 * @param  {[type]} arg_map [description]
	 * @return {[type]}         [description]
	 */
	_onSetchatee(event, arg_map) {
		let 
			$nav = this.jqueryMap.$container,
			new_chatee = arg_map.new_chatee,
			old_chatee = arg_map.old_chatee;
		//use this to hightlight avatar of user in nav area
		//see new_chatee.name, old_chatee.name, etc.
		
		//remove highlight from old_chatee avatar here
		if(old_chatee) {
			$nav
				.find(`.spa-avtr-box[data-id=${old_chatee.cid}]`)
				.removeClass('spa-x-is-chatee');
		}

		//add highlight to new_chatee avatar here
		if(new_chatee) {
			$nav
				.find(`.spa-avtr-box[data-id=${new_chatee.id}]`)
				.addClass('spa-x-is-chatee');
		}
	}
	/**
	 * [_onListchange This is invoked when the Model publishes an spa-listchange event.
	 * 		In this module, we redraw the avatars]
	 * @param  {[type]} event [description]
	 * @return {[type]}       [description]
	 */
	_onListchange(event) {
		let
			$nav = this.jqueryMap.$container,
			people_db = this.configMap.people_model.get_db(),
			user = this.configMap.people_model.get_user(),
			chatee = this.configMap.chat_model.get_chatee() || {},
			$box;
		$nav.empty();
		//if the user is logged out, do not render
		if(user.get_is_anon(user)) {
			return false;
		}

		people_db().each((person) => {
			let 
				class_list;
			if(person.get_is_anon(person)) {
				return true;
			}
			class_list =['spa-avtr-box'];

			if(person.id === chatee.id) {
				class_list.push('spa-x-is-chatee');
			}

			if(person.get_is_user(person)) {
				class_list.push('spa-x-is-user');
			}

			$box = $('<div/>')
				.addClass(class_list.join(' '))
				.css(person.css_map)
				.attr('data-id', String(person.id))
				.prop('title', Spa_util_b.encodeHtml(person.name))
				.text(person.name);
			$nav.append($box);
		});
	}
	/**
	 * [_onLogout This is invoked when the Model publishes an spa-logout event.
	 * 		In this module, we remove all avatars]
	 * @return {[type]} [description]
	 */
	_onLogout() {
		this.jqueryMap.$container.empty();
	}
}