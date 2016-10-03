export default class Spa_fake {
	getPeopleList() {
		return [
			{
				name: 'Betty',
				_id: 'id_01', // id - the unique id. this may be undefined if the object is not synced with backend
				css_map: {  // a map of attributes used for avatar presentation
					top: 20,
					left: 20,
					'background-color': 'rgb(128, 128, 128)'
				}
			},
			{
				name: 'Mike',
				_id: 'id_02',
				css_map: {
					top: 60,
					left: 20,
					'background-color': 'rgb(128, 255, 128)'
				}
			},
			{
				name: 'Pebbles',
				_id: 'id_03',
				css_map: {
					top: 100,
					left: 20,
					'background-color': 'rgb(128, 192, 190)'
				}
			},
			{
				name: 'Wilma',
				_id: 'id_04',
				css_map: {
					top: 140,
					left: 20,
					'background-color': 'rgb(192, 128, 128)'
				}
			}
		];
	}
}