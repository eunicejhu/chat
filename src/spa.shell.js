require("jquery.urianchor");
export default class Spa_shell {
	constructor() {
		this.configMap = {
			anchor_schema_map: { //used by uriAnchor for validation
				chat: {
					open: true,
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
			 chat_extend_time: 250,
			 chat_retract_time: 300,
			 chat_extend_height: 450,
			 chat_retract_height: 15,
			 chat_extend_title: 'Click to retract',
			 chat_retract_title: 'Click to extend'
		};
		this.stateMap = {
			$container: null,
			anchor_map: {}, //store the current anchor values in a map
			is_chat_retracted: true //used in toggelChat
		};
		this.jqueryMap = {};
	}

	/**
	 * [setJqueryMap DOM method]
	 */
	setJqueryMap() {
		let $container = this.stateMap.$container;
		this.jqueryMap = {
			$container: $container,
			$chat: $container.find('.spa-shell-chat')
		};
	}

	/**
	 * [initModule public method]
	 * @param  {[type]} $container [description]
	 * @return {[type]}            [description]
	 */
	initModule($container) {
		//load HTML and map jQuery collections
		this.stateMap.$container = $container;
		$container.html(this.configMap.main_html);
		this.setJqueryMap();

		this.stateMap.is_chat_retracted = true;
		this.jqueryMap.$chat
			.attr('title', this.configMap.chat_retract_title)
			.click(this, this.onClickChat);
		//configure uriAnchor to use our schema
		$.uriAnchor.configModule({
			schema_map: this.configMap.anchor_schema_map
		});
		$(window)
			.bind('hashchange', this, this.onHashchange)
			.trigger('hashchange'); //open from bookmark, get the stored state from initial load
	}
	/**
	 * [toggleChat description]
	 * @param  {[boolean]}   do_extend [if true, extends slider, if false retracts ]
	 * @param  {Function} callback  [optional function to execute at end of animation]
	 * @return {[boolean]}             [* true - slider animation activated, 
	 *                                  * false - slider animation not activated]
	 *  State:  sets stateMap.is_chat_retracted
	 *  	* true - slider is retracted
	 *  	* false - slider is extended
	 */
	toggleChat(do_extend, callback) {
		let 
			self = this,
			px_chat_ht = this.jqueryMap.$chat.height(),
			is_open = px_chat_ht === this.configMap.chat_extend_height,
			is_closed = px_chat_ht === this.configMap.chat_retract_height,
			is_sliding = ! is_open && ! is_closed;
		//avoid race condition
		if(is_sliding) {
			return false;
		}
		//extend chat slider
		if(do_extend) {
			this.jqueryMap.$chat.animate({
				height: this.configMap.chat_extend_height
			}, 
			this.configMap.chat_extend_time,
			function() {
				self.jqueryMap.$chat.attr(
					'title', self.configMap.chat_extend_title	
				);
				self.stateMap.is_chat_retracted = false;
				if(callback) {
					callback(self.jqueryMap.$chat);
				}
			});
			return true;
		}
		//retract chat slider
		this.jqueryMap.$chat.animate({
			height: this.configMap.chat_retract_height
		},
		this.configMap.chat_retract_time,
		function() {
			self.jqueryMap.$chat.attr(
				'title', self.configMap.chat_retract_title
			);
			self.stateMap.is_chat_retracted = true;
			if(callback) {
				callback(self.jqueryMap.$chat);
			}
		});
		return true;
	}

	onClickChat(event) {
		let 
			self = event.data;
		// if(self.toggleChat( self.stateMap.is_chat_retracted)) {
		// 	$.uriAnchor.setAnchor({
		// 		chat: (self.stateMap.is_chat_retracted ? 'open' : 'closed')
		// 	});
		// }
		self.changeAnchorPart({
			chat: (self.stateMap.is_chat_retracted ? 'open' : 'closed')
		})
		return false;
	}
	/**
	 * [copyAnchorMap minimize overhead]
	 * @return {[type]} []
	 */
	copyAnchorMap() {
		return $.extend(true, {}, this.stateMap.anchor_map);
	}

	changeAnchorPart(arg_map) {
		let 
			anchor_map_revise = this.copyAnchorMap(),
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
	 * [onHashchange handle URI anchor changes]
	 * @param  {[type]} event [description]
	 * @return {[type]}       [description]
	 *  Action: 
	 *  	* Parses the URI anchor component
	 *  	* Compares proposed application state with current
	 *  	* Adjust the application only where proposed state differs from existing
	 */
	onHashchange(event) {
		let
			self  = event.data,
			anchor_map_previous = self.copyAnchorMap(),
			anchor_map_proposed,
			_s_chat_previous, _s_chat_proposed,
			s_chat_proposed;

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

		if(! anchor_map_previous || _s_chat_previous !== _s_chat_proposed) {
			s_chat_proposed = anchor_map_proposed.chat;
			switch(s_chat_proposed) {
				case 'open':
					self.toggleChat(true);
					break;
				case 'closed':
					self.toggleChat(false);
					break;
				default:
					self.toggleChat(false);
					delete anchor_map_proposed.chat;
					$.uriAnchor.setAnchor(anchor_map_proposed, null, true);
			}
		}

		return false;
	}
}
