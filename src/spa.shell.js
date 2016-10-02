require("jquery.urianchor");
require("../styles/sass/spa.shell.scss");
import Spa_model from "./spa.model";
import Spa_chat from "./spa.chat";
import Spa_util from "./spa.util";



export default class Spa_shell {
	constructor() {
		this.configMap = {
			anchor_schema_map: { //used by uriAnchor for validation
				chat: {
					opened: true,
					closed: true
				}
			},
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
				<div class="spa-shell-chat"></div>
				<div class="spa-shell-modal"></div>
			 `,
			 settable_map: {
			 	spa_shell: true
			 },
			 chat_extend_time: 250,
			 chat_retract_time: 300,
			 chat_extend_height: 450,
			 chat_retract_height: 15,
			 chat_extend_title: 'Click to retract',
			 chat_retract_title: 'Click to extend'
		};
		this.stateMap = {
			$container: null,
			spa_chat: null,
			spa_model: null,
			anchor_map: {}, //store the current anchor values in a map
			is_chat_retracted: true //used in toggelChat
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

	configModule(input_map) {
		Spa_util.setConfigMap({
			input_map: input_map,
			settable_map: this.configMap.settable_map,
			config_map: this.configMap
		});
		return true;
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
		this.stateMap.spa_chat = spa_chat;
		this.stateMap.spa_model = spa_model;
		//load HTML and map jQuery collections
		this.stateMap.$container = $container;
		$container.html(this.configMap.main_html);
		this._setJqueryMap();

		this.stateMap.is_chat_retracted = true;
		
		//configure uriAnchor to use our schema
		$.uriAnchor.configModule({
			schema_map: this.configMap.anchor_schema_map
		});
		//configure and initilize feature modules
		this.stateMap.spa_chat.configModule({
			spa_shell: this.configMap.spa_shell,
			set_chat_anchor: this._setChatAnchor,
			chat_model: this.stateMap.spa_model.chat,
			people_model: this.stateMap.spa_model.people
		});
		this.stateMap.spa_chat.initModule(this.jqueryMap.$container);

		//finally initialize the event handler [!!!important: should not handle until chat module is initialized]
		$(window)
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
			is_ok,
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
				case 'open':
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
	 * [_setChatAnchor callback method provided to Chat as a safe way to request a URI change]
	 * @param {[type]} callee [simulate arguments.callee, since es6 force to use strict mode, callee cannot be accessed]
	 * @param {[type]} position_type [description]
	 * Returns:
	 * 		* true - requested anchor part was updated
	 * 		* false - not updated
	 */
	_setChatAnchor(callee, position_type) {
		console.log("callee: ", callee);
		return callee._changeAnchorPart({chat: position_type});
	}
}
