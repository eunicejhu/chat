require("jquery.urianchor");
require("../styles/sass/spa.shell.scss");
import Spa_model from "./spa.model";
import Spa_chat from "./spa.chat";

export default class Spa_shell {
	constructor() {
		this.configMap = {
			anchor_schema_map: { //used by uriAnchor for validation
				chat: {
					opened: true,
					closed: true
				}
			},
			resize_interval: 200,
			main_html: `
			 	<div class="spa-shell-head">
					<div class="spa-shell-head-logo"></div>
					<div class="spa-shell-head-acct"></div>
					<div class="spa-shell-head-search"></div>
				</div>
				<div class="spa-shell-main">
					<div class="spa-shell-main-nav"></div>
					<div class="spa-shell-main-content"></div>
				</div>
				<div class="spa-shell-foot"></div>
				<div class="spa-shell-modal"></div>
			 `
		};
		this.stateMap = {
			$container: null,
			spa_shell: null,
			spa_chat: null,
			spa_model: null,
			anchor_map: {}, //store the current anchor values in a map
			resize_idto: undefined //retain the resize timeout ID
		};
		this.jqueryMap = {};
	}

	/**
	 * [_setJqueryMap DOM method]
	 */
	_setJqueryMap() {
		let $container = this.stateMap.$container;
		this.jqueryMap = {
			$container: $container
		};
	}

	/**
	 * [initModule public method]
	 * @param  {[type]} $container [description]
	 * @return {[type]}            [description]
	 */
	initModule($container) {
		let 
			spa_chat = new Spa_chat(),
			spa_model = new Spa_model();
		this.stateMap.spa_shell = this;
		this.stateMap.spa_chat = spa_chat;
		this.stateMap.spa_model = spa_model;
		//load HTML and map jQuery collections
		this.stateMap.$container = $container;
		$container.html(this.configMap.main_html);
		this._setJqueryMap();

		//configure uriAnchor to use our schema
		$.uriAnchor.configModule({
			schema_map: this.configMap.anchor_schema_map
		});
		//configure and initilize feature modules
		this.stateMap.spa_chat.configModule({
			spa_shell: this.stateMap.spa_shell,
			set_chat_anchor: this._setChatAnchor,
			chat_model: this.stateMap.spa_model.chat,
			people_model: this.stateMap.spa_model.people
		});
		this.stateMap.spa_chat.initModule(this.jqueryMap.$container);

		//finally initialize the event handler [!!!important: should not handle until chat module is initialized]
		$(window)
			.bind('resize', this, this._onResize)
			.bind('hashchange', this, this._onHashchange)
			.trigger('hashchange'); //open from bookmark, get the stored state from initial load
	}	

	/**
	 * [_copyAnchorMap minimize overhead]
	 * @return {[type]} []
	 */
	_copyAnchorMap() {
		return $.extend(true, {}, this.stateMap.anchor_map);
	}

	_changeAnchorPart(arg_map) {
		let 
			anchor_map_revise = this._copyAnchorMap(),
			bool_return = true,
			key_name, key_name_dep;
		//merge changes into anchor_map
		for(key_name in arg_map) {
			if(arg_map.hasOwnProperty(key_name)) {
				if(key_name.indexOf('_') === 0) {
					return true;
				}
				anchor_map_revise[key_name] = arg_map[key_name];
				key_name_dep = '_' + key_name;
				if(arg_map[key_name_dep]) {
					anchor_map_revise[key_name_dep] = arg_map[key_name_dep];
				} else {
					delete anchor_map_revise[key_name_dep];
					delete anchor_map_revise['_s' + key_name_dep];
				}

			}
		}

		//attempt to udate URI; revert if not successful
		try {
			$.uriAnchor.setAnchor(anchor_map_revise);
		} catch(error) {
			$.uriAnchor.setAnchor(this.stateMap.anchor_map, null, true);
			bool_return = false;
		}
		return bool_return;
	}
	/**
	 * [_onHashchange handle URI anchor changes]
	 * @param  {[type]} event [description]
	 * @return {[type]}       [description]
	 *  Action: 
	 *  	* Parses the URI anchor component
	 *  	* Compares proposed application state with current
	 *  	* Adjust the application only where proposed state differs from existing
	 */
	_onHashchange(event) {
		let
			self  = event.data,
			_s_chat_previous, 
			_s_chat_proposed,
			s_chat_proposed,
			anchor_map_proposed,
			is_ok = true,
			anchor_map_previous = self._copyAnchorMap();

		//attempt to parse anchor, if the proposed anchor change is invalide, resets the anchor back to its prior value
		try {
			anchor_map_proposed = $.uriAnchor.makeAnchorMap();
		} catch(error) {
			$.uriAnchor.setAnchor(anchor_map_previous, null, true);
			return false;
		}

		self.stateMap.anchor_map = anchor_map_proposed;

		_s_chat_previous = anchor_map_previous._s_chat;
		_s_chat_proposed = anchor_map_proposed._s_chat;

		//adjust chat component if changed
		if(! anchor_map_previous || _s_chat_previous !== _s_chat_proposed) {
			s_chat_proposed = anchor_map_proposed.chat;
			switch(s_chat_proposed) {
				case 'opened':
					is_ok = self.stateMap.spa_chat.setSliderPosition('opened');
					break;
				case 'closed':
					is_ok = self.stateMap.spa_chat.setSliderPosition('closed');
					break;
				default:
					self.stateMap.spa_chat.setSliderPosition('closed');
					delete anchor_map_proposed.chat;
					$.uriAnchor.setAnchor(anchor_map_proposed, null, true);
			}
		}

		//revert anchor if slider change denied
		if(!is_ok) {
			if(anchor_map_previous) {
				$.uriAnchor.setAnchor(anchor_map_previous, null, true);
				self.stateMap.anchor_map = anchor_map_previous;
			} else {
				delete anchor_map_proposed.chat;
				$.uriAnchor.setAnchor(anchor_map_proposed, null, true);
			}
		}

		return false;
	}
	/**
	 * [_onResize description]
	 * @return {[Boolean]} [return true, so that jQuery doesn't preventDefault() or stopPropagation()]
	 */
	_onResize(event) {
		let 
			self = event.data;
		if(self.stateMap.resize_idto) {
			return true;
		}

		self.stateMap.spa_chat.handleResize();
		//every 200 milliseconds during a resize, stateMap.resize_idto will be undefined, and the full onResize logic will run
		self.stateMap.resize_idto = setTimeout(() => {
			self.stateMap.resize_idto = undefined;
		}, self.configMap.resize_interval);

		return true;
	}
	/**
	 * [_setChatAnchor callback method provided to Chat as a safe way to request a URI change]
	 * @param {[type]} callee [simulate arguments.callee, since es6 force to use strict mode, callee cannot be accessed]
	 * @param {[type]} position_type [description]
	 * Returns:
	 * 		* true - requested anchor part was updated
	 * 		* false - not updated
	 */
	_setChatAnchor(callee, position_type) {
		return callee._changeAnchorPart({chat: position_type});
	}
}
