export default class Spa_util {
	/**
	 * [setConfigMap common code to set configs in feature modules]
	 * @param {[type]} arg_map 
	 * [
	 *   * input_map - map of key-values to set in config  
	 *   * settable_map - map of allowable keys to set
	 *   * config_map - map to apply settings to                      			
	 * ]
	 * Throws: Exception if input key not allowed
	 */
	static setConfigMap(arg_map) {
		let 
			input_map = arg_map.input_map,
			settable_map = arg_map.settable_map,
			config_map = arg_map.config_map,
			key_name, error;
		for(key_name in input_map) {
			if(input_map.hasOwnProperty(key_name)) {
				if(settable_map.hasOwnProperty(key_name)) {
					config_map[key_name] = input_map[key_name];
				} else {
					error = this.makeError('Bad Input', `Setting config key | ${key_name} | is not supported`);
					throw error;
				}
			}
		}
	}

	static setStateMap(arg_map) {
		let 
			input_map = arg_map.input_map,
			settable_map = arg_map.settable_map,
			state_map = arg_map.state_map,
			key_name, error;
		for(key_name in input_map) {
			if(input_map.hasOwnProperty(key_name)) {
				if(settable_map.hasOwnProperty(key_name)) {
					state_map[key_name] = input_map[key_name];
				} else {
					error = this.makeError('Bad Input', `Setting state key | ${key_name} | is not supported`);
					throw error;
				}
			}
		}
	}
	/**
	 * [makeError a convenience wrapper to create an error object]
	 * @param  {[type]} name_text [the error name]
	 * @param  {[type]} msg_text  [long error message]
	 * @param  {[type]} data      [optional data attached to error object]
	 * @return {[type]}           [newly constructed error object]
	 */
	static makeError(name_text, msg_text, data) {
		let 
			error = new Error();
		error.name = name_text;
		error.message = msg_text;
		if(data) {
			error.data = data;
		}
		return error;
	}
}