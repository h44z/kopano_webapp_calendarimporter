/**
 * Timezone class
 *
 * This class can handle all our timezone operations and conversions.
 *
 * @author   Christoph Haas <mail@h44z.net>
 * @modified 29.12.2012
 * @license  http://www.opensource.org/licenses/mit-license.php  MIT License
 */
 
Ext.namespace("Zarafa.plugins.calendarimporter.data"); 

Zarafa.plugins.calendarimporter.data.Timezones = Ext.extend(Object, {

	store :	[
		['Pacific/Midway','(UTC -11:00) Midway, Niue, Pago Pago', -660],
		['America/Adak','(UTC -10:00) Adak', -600],
		['Pacific/Fakaofo','(UTC -10:00) Fakaofo, Honolulu, Johnston, Rarotonga, Tahiti', -600],
		['Pacific/Marquesas','(UTC -10:30) Marquesas', -630],
		['America/Anchorage','(UTC -09:00) Anchorage, Juneau, Nome, Sitka, Yakutat', -540],
		['Pacific/Gambier','(UTC -09:00) Gambier', -540],
		['America/Dawson','(UTC -08:00) Dawson, Los Angeles, Tijuana, Vancouver, Whitehorse', -480],
		['America/Santa_Isabel','(UTC -08:00) Santa Isabel', -480],
		['America/Metlakatla','(UTC -08:00) Metlakatla, Pitcairn', -480],
		['America/Dawson_Creek','(UTC -07:00) Dawson Creek, Hermosillo, Phoenix', -420],
		['America/Chihuahua','(UTC -07:00) Chihuahua, Mazatlan', -420],
		['America/Boise','(UTC -07:00) Boise, Cambridge Bay, Denver, Edmonton, Inuvik, Ojinaga, Shiprock, Yellowknife', -420],
		['America/Chicago','(UTC -06:00) Beulah, Center, Chicago, Knox, Matamoros, Menominee, New Salem, Rainy River, Rankin Inlet, Resolute, Tell City, Winnipeg', -360],
		['America/Belize','(UTC -06:00) Belize, Costa Rica, El Salvador, Galapagos, Guatemala, Managua, Regina, Swift Current, Tegucigalpa', -360],
		['Pacific/Easter','(UTC -06:00) Easter', -360],
		['America/Bahia_Banderas','(UTC -06:00) Bahia Banderas, Cancun, Merida, Mexico City, Monterrey', -360],
		['America/Detroit','(UTC -05:00) Detroit, Grand Turk, Indianapolis, Iqaluit, Louisville, Marengo, Monticello, Montreal, Nassau, New York, Nipigon, Pangnirtung, Petersburg, Thunder Bay, Toronto, Vevay, Vincennes, Winamac', -300],
		['America/Atikokan','(UTC -05:00) Atikokan, Bogota, Cayman, Guayaquil, Jamaica, Lima, Panama, Port-au-Prince', -300],
		['America/Havana','(UTC -05:00) Havana', -300],
		['America/Caracas','(UTC -05:30) Caracas', -330],
		['America/Glace_Bay','(UTC -04:00) Bermuda, Glace Bay, Goose Bay, Halifax, Moncton, Thule', -240],
		['Atlantic/Stanley','(UTC -04:00) Stanley', -240],
		['America/Santiago','(UTC -04:00) Palmer, Santiago', -240],
		['America/Anguilla','(UTC -04:00) Anguilla, Antigua, Aruba, Barbados, Blanc-Sablon, Boa Vista, Curacao, Dominica, Eirunepe, Grenada, Guadeloupe, Guyana, Kralendijk, La Paz, Lower Princes, Manaus, Marigot, Martinique, Montserrat, Port of Spain, Porto Velho, Puerto Rico, Rio Branco, Santo Domingo, St Barthelemy, St Kitts, St Lucia, St Thomas, St Vincent, Tortola', -240],
		['America/Campo_Grande','(UTC -04:00) Campo Grande, Cuiaba', -240],
		['America/Asuncion','(UTC -04:00) Asuncion', -240],
		['America/St_Johns','(UTC -04:30) St Johns', -270],
		['America/Sao_Paulo','(UTC -03:00) Sao Paulo', -180],
		['America/Araguaina','(UTC -03:00) Araguaina, Bahia, Belem, Buenos Aires, Catamarca, Cayenne, Cordoba, Fortaleza, Jujuy, La Rioja, Maceio, Mendoza, Paramaribo, Recife, Rio Gallegos, Rothera, Salta, San Juan, Santarem, Tucuman, Ushuaia', -180],
		['America/Montevideo','(UTC -03:00) Montevideo', -180],
		['America/Godthab','(UTC -03:00) Godthab', -180],
		['America/Argentina/San_Luis','(UTC -03:00) San Luis', -180],
		['America/Miquelon','(UTC -03:00) Miquelon', -180],
		['America/Noronha','(UTC -02:00) Noronha, South Georgia', -120],
		['Atlantic/Cape_Verde','(UTC -01:00) Cape Verde', -60],
		['America/Scoresbysund','(UTC -01:00) Azores, Scoresbysund', -60],
		['Atlantic/Canary','(UTC) Canary, Dublin, Faroe, Guernsey, Isle of Man, Jersey, Lisbon, London, Madeira', 0],
		['Africa/Abidjan','(UTC) Abidjan, Accra, Bamako, Banjul, Bissau, Casablanca, Conakry, Dakar, Danmarkshavn, El Aaiun, Freetown, Lome, Monrovia, Nouakchott, Ouagadougou, Reykjavik, Sao Tome, St Helena', 0],
		['Africa/Algiers','(UTC +01:00) Algiers, Bangui, Brazzaville, Douala, Kinshasa, Lagos, Libreville, Luanda, Malabo, Ndjamena, Niamey, Porto-Novo, Tunis', 60],
		['Africa/Ceuta','(UTC +01:00) Amsterdam, Andorra, Belgrade, Berlin, Bratislava, Brussels, Budapest, Ceuta, Copenhagen, Gibraltar, Ljubljana, Longyearbyen, Luxembourg, Madrid, Malta, Monaco, Oslo, Paris, Podgorica, Prague, Rome, San Marino, Sarajevo, Skopje, Stockholm, Tirane, Vaduz, Vatican, Vienna, Warsaw, Zagreb, Zurich', 60],
		['Africa/Windhoek','(UTC +01:00) Windhoek', 60],
		['Asia/Damascus','(UTC +02:00) Damascus', 120],
		['Asia/Beirut','(UTC +02:00) Beirut', 120],
		['Asia/Jerusalem','(UTC +02:00) Jerusalem', 120],
		['Asia/Nicosia','(UTC +02:00) Athens, Bucharest, Chisinau, Helsinki, Istanbul, Mariehamn, Nicosia, Riga, Sofia, Tallinn, Vilnius', 120],
		['Africa/Blantyre','(UTC +02:00) Blantyre, Bujumbura, Cairo, Gaborone, Gaza, Harare, Hebron, Johannesburg, Kigali, Lubumbashi, Lusaka, Maputo, Maseru, Mbabane, Tripoli', 120],
		['Asia/Amman','(UTC +02:00) Amman', 120],
		['Africa/Addis_Ababa','(UTC +03:00) Addis Ababa, Aden, Antananarivo, Asmara, Baghdad, Bahrain, Comoro, Dar es Salaam, Djibouti, Juba, Kaliningrad, Kampala, Khartoum, Kiev, Kuwait, Mayotte, Minsk, Mogadishu, Nairobi, Qatar, Riyadh, Simferopol, Syowa, Uzhgorod, Zaporozhye', 180],
		['Asia/Tehran','(UTC +03:30) Tehran', 210],
		['Asia/Yerevan','(UTC +04:00) Yerevan', 240],
		['Asia/Dubai','(UTC +04:00) Dubai, Mahe, Mauritius, Moscow, Muscat, Reunion, Samara, Tbilisi, Volgograd', 240],
		['Asia/Baku','(UTC +04:00) Baku', 240],
		['Asia/Kabul','(UTC +04:30) Kabul', 270],
		['Antarctica/Mawson','(UTC +05:00) Aqtau, Aqtobe, Ashgabat, Dushanbe, Karachi, Kerguelen, Maldives, Mawson, Oral, Samarkand, Tashkent', 300],
		['Asia/Colombo','(UTC +05:30) Colombo, Kolkata', 330],
		['Asia/Kathmandu','(UTC +05:45) Kathmandu', 345],
		['Antarctica/Vostok','(UTC +06:00) Almaty, Bishkek, Chagos, Dhaka, Qyzylorda, Thimphu, Vostok, Yekaterinburg', 360],
		['Asia/Rangoon','(UTC +06:30) Cocos, Rangoon', 390],
		['Antarctica/Davis','(UTC +07:00) Bangkok, Christmas, Davis, Ho Chi Minh, Hovd, Jakarta, Novokuznetsk, Novosibirsk, Omsk, Phnom Penh, Pontianak, Vientiane', 420],
		['Antarctica/Casey','(UTC +08:00) Brunei, Casey, Choibalsan, Chongqing, Harbin, Hong Kong, Kashgar, Krasnoyarsk, Kuala Lumpur, Kuching, Macau, Makassar, Manila, Perth, Shanghai, Singapore, Taipei, Ulaanbaatar, Urumqi', 480],
		['Australia/Eucla','(UTC +08:45) Eucla', 525],
		['Asia/Dili','(UTC +09:00) Dili, Irkutsk, Jayapura, Palau, Pyongyang, Seoul, Tokyo', 540],
		['Australia/Adelaide','(UTC +09:30) Adelaide, Broken Hill', 570],
		['Australia/Darwin','(UTC +09:30) Darwin', 570],
		['Antarctica/DumontDUrville','(UTC +10:00) Brisbane, Chuuk, DumontDUrville, Guam, Lindeman, Port Moresby, Saipan, Yakutsk', 600],
		['Australia/Currie','(UTC +10:00) Currie, Hobart, Melbourne, Sydney', 600],
		['Australia/Lord_Howe','(UTC +10:30) Lord Howe', 630],
		['Antarctica/Macquarie','(UTC +11:00) Efate, Guadalcanal, Kosrae, Macquarie, Noumea, Pohnpei, Sakhalin, Vladivostok', 660],
		['Pacific/Norfolk','(UTC +11:30) Norfolk', 690],
		['Antarctica/McMurdo','(UTC +12:00) Auckland, McMurdo, South Pole', 720],
		['Asia/Anadyr','(UTC +12:00) Anadyr, Fiji, Funafuti, Kamchatka, Kwajalein, Magadan, Majuro, Nauru, Tarawa, Wake, Wallis', 720],
		['Pacific/Chatham','(UTC +12:45) Chatham', 765],
		['Pacific/Enderbury','(UTC +13:00) Enderbury, Tongatapu', 780],
		['Pacific/Apia','(UTC +13:00) Apia', 780],
		['Pacific/Kiritimati','(UTC +14:00) Kiritimati', 840]		
	],
	
	/* map all citys to the above timezones */
	map : {
		/* Pacific */
		'Pacific/Midway' : 'Pacific/Midway',
		'Pacific/Niue' : 'Pacific/Midway',
		'Pacific/Pago_Pago' : 'Pacific/Midway',
		'Pacific/Fakaofo' : 'Pacific/Fakaofo',
		'Pacific/Honolulu' : 'Pacific/Fakaofo',
		'Pacific/Johnston' : 'Pacific/Fakaofo',
		'Pacific/Rarotonga' : 'Pacific/Fakaofo',
		'Pacific/Tahiti' : 'Pacific/Fakaofo',
		'Pacific/Marquesas' : 'Pacific/Marquesas',
		'Pacific/Gambier' : 'Pacific/Gambier',
		'Pacific/Easter' : 'Pacific/Easter',
		'Pacific/Norfolk' : 'Pacific/Norfolk',
		'Pacific/Chatham' : 'Pacific/Chatham',
		'Pacific/Enderbury' : 'Pacific/Enderbury',
		'Pacific/Tongatapu' : 'Pacific/Enderbury',
		'Pacific/Apia' : 'Pacific/Apia',
		'Pacific/Kiritimati' : 'Pacific/Kiritimati',
		/* America */
		'America/Adak' : 'America/Adak',
		'America/Anchorage' : 'America/Anchorage',
		'America/Juneau' : 'America/Anchorage',
		'America/Nome' : 'America/Anchorage',
		'America/Sitka' : 'America/Anchorage',
		'America/Yakutat' : 'America/Anchorage',
		'America/Dawson' : 'America/Dawson',
		'America/Los_Angeles' : 'America/Dawson',
		'America/Tijuana' : 'America/Dawson',
		'America/Vancouver' : 'America/Dawson',
		'America/Whitehorse' : 'America/Dawson',
		'America/Santa_Isabel' : 'America/Santa_Isabel',
		'America/Metlakatla' : 'America/Metlakatla',
		'America/Dawson_Creek' : 'America/Dawson_Creek',
		'America/Hermosillo' : 'America/Dawson_Creek',
		'America/Phoenix' : 'America/Dawson_Creek',
		'America/Chihuahua' : 'America/Chihuahua',
		'America/Mazatlan' : 'America/Chihuahua'
		/* Europe */
		/* Africa */
		/* Australia */
		/* Atlantic */
		/* Antarctica */
		/* Artic */
		/* 
		/* Asia */
		/* Indian */
		/* Others */
		
	},
	
	/* return unmapped timezone... */
	unMap: function(timezone) {
		return this.map[timezone] !== undefined ? this.map[timezone] : timezone;
	},
	
	getOffset: function(timezone) {
		/* find timezone, this needs to be optimized ;) */
		timezone = this.unMap(timezone);
		
		for(i = 0; i < this.store.length; i++) {
			if(this.store[i][0] == timezone) {
				return (this.store[i][2] * 60000);
			}
		}
	
		return 0;	// no offset found...
	}
});

Zarafa.plugins.calendarimporter.data.Timezones = new Zarafa.plugins.calendarimporter.data.Timezones();