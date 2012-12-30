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
		['Pacific/Fakaofo','(UTC -10:00) Adak, Fakaofo, Honolulu, Johnston, Rarotonga, Tahiti', -600],
		['Pacific/Marquesas','(UTC -09:30) Marquesas', -570],
		['America/Anchorage','(UTC -09:00) Gambier, Anchorage, Juneau, Nome, Sitka, Yakutat', -540],
		['America/Dawson','(UTC -08:00) Dawson, Los Angeles, Tijuana, Vancouver, Whitehorse, Santa Isabel, Metlakatla, Pitcairn', -480],
		['America/Dawson_Creek','(UTC -07:00) Dawson Creek, Hermosillo, Phoenix, Chihuahua, Mazatlan, Boise, Cambridge Bay, Denver, Edmonton, Inuvik, Ojinaga, Shiprock, Yellowknife', -420],
		['America/Chicago','(UTC -06:00) Beulah, Center, Chicago, Knox, Matamoros, Menominee, New Salem, Rainy River, Rankin Inlet, Resolute, Tell City, Winnipeg', -360],
		['America/Belize','(UTC -06:00) Belize, Costa Rica, El Salvador, Galapagos, Guatemala, Managua, Regina, Swift Current, Tegucigalpa', -360],
		['Pacific/Easter','(UTC -06:00) Easter', -360],
		['America/Bahia_Banderas','(UTC -06:00) Bahia Banderas, Cancun, Merida, Mexico City, Monterrey', -360],
		['America/Detroit','(UTC -05:00) Detroit, Grand Turk, Indianapolis, Iqaluit, Louisville, Marengo, Monticello, Montreal, Nassau, New York, Nipigon, Pangnirtung, Petersburg, Thunder Bay, Toronto, Vevay, Vincennes, Winamac', -300],
		['America/Atikokan','(UTC -05:00) Atikokan, Bogota, Cayman, Guayaquil, Jamaica, Lima, Panama, Port-au-Prince', -300],
		['America/Havana','(UTC -05:00) Havana', -300],
		['America/Caracas','(UTC -04:30) Caracas', -270],
		['America/Glace_Bay','(UTC -04:00) Bermuda, Glace Bay, Goose Bay, Halifax, Moncton, Thule', -240],
		['Atlantic/Stanley','(UTC -04:00) Stanley', -240],
		['America/Santiago','(UTC -04:00) Palmer, Santiago', -240],
		['America/Anguilla','(UTC -04:00) Anguilla, Antigua, Aruba, Barbados, Blanc-Sablon, Boa Vista, Curacao, Dominica, Eirunepe, Grenada, Guadeloupe, Guyana, Kralendijk, La Paz, Lower Princes, Manaus, Marigot, Martinique, Montserrat, Port of Spain, Porto Velho, Puerto Rico, Rio Branco, Santo Domingo, St Barthelemy, St Kitts, St Lucia, St Thomas, St Vincent, Tortola', -240],
		['America/Campo_Grande','(UTC -04:00) Campo Grande, Cuiaba', -240],
		['America/Asuncion','(UTC -04:00) Asuncion', -240],
		['America/St_Johns','(UTC -03:30) St Johns', -210],
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
		['Europe/Vienna','(UTC +01:00) Amsterdam, Andorra, Belgrade, Berlin, Bratislava, Brussels, Budapest, Ceuta, Copenhagen, Gibraltar, Ljubljana, Longyearbyen, Luxembourg, Madrid, Malta, Monaco, Oslo, Paris, Podgorica, Prague, Rome, San Marino, Sarajevo, Skopje, Stockholm, Tirane, Vaduz, Vatican, Vienna, Warsaw, Zagreb, Zurich', 60],
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
		/*-11:00*/
		'Etc/GMT+11' : 'Pacific/Midway',
		'Pacific/Midway' : 'Pacific/Midway',
		'Pacific/Niue' : 'Pacific/Midway',
		'Pacific/Pago_Pago' : 'Pacific/Midway',
		'Pacific/Samoa' : 'Pacific/Midway',
		'US/Samoa' : 'Pacific/Midway',
		/*-10:00*/
		'America/Adak' : 'Pacific/Fakaofo',
		'America/Atka' : 'Pacific/Fakaofo',
		'Etc/GMT+10' : 'Pacific/Fakaofo',
		'HST' : 'Pacific/Fakaofo',
		'Pacific/Honolulu' : 'Pacific/Fakaofo',
		'Pacific/Johnston' : 'Pacific/Fakaofo',
		'Pacific/Rarotonga' : 'Pacific/Fakaofo',
		'Pacific/Tahiti' : 'Pacific/Fakaofo',
		'SystemV/HST10' : 'Pacific/Fakaofo',
		'US/Aleutian' : 'Pacific/Fakaofo',
		'US/Hawaii' : 'Pacific/Fakaofo',
		/*-9:30*/
		'Pacific/Marquesas' : 'Pacific/Marquesas',
		/*-9:00*/
		'AST' : 'America/Anchorage',
		'America/Anchorage' : 'America/Anchorage',
		'America/Juneau' : 'America/Anchorage',
		'America/Nome' : 'America/Anchorage',
		'America/Sitka' : 'America/Anchorage',
		'America/Yakutat' : 'America/Anchorage',
		'Etc/GMT+9' : 'America/Anchorage',
		'Pacific/Gambier' : 'America/Anchorage',
		'SystemV/YST9' : 'America/Anchorage',
		'SystemV/YST9YDT' : 'America/Anchorage',
		'US/Alaska' : 'America/Anchorage',
		/*-8:00*/
		'America/Dawson' : 'America/Dawson',
		'America/Ensenada' : 'America/Dawson',
		'America/Los_Angeles' : 'America/Dawson',
		'America/Metlakatla' : 'America/Dawson',
		'America/Santa_Isabel' : 'America/Dawson',
		'America/Tijuana' : 'America/Dawson',
		'America/Vancouver' : 'America/Dawson',
		'America/Whitehorse' : 'America/Dawson',
		'Canada/Pacific' : 'America/Dawson',
		'Canada/Yukon' : 'America/Dawson',
		'Etc/GMT+8' : 'America/Dawson',
		'Mexico/BajaNorte' : 'America/Dawson',
		'PST' : 'America/Dawson',
		'PST8PDT' : 'America/Dawson',
		'Pacific/Pitcairn' : 'America/Dawson',
		'SystemV/PST8' : 'America/Dawson',
		'SystemV/PST8PDT' : 'America/Dawson',
		'US/Pacific' : 'America/Dawson',
		'US/Pacific-New' : 'America/Dawson',
		/*-7:00*/
		'America/Boise' : 'America/Dawson_Creek',
		'America/Cambridge_Bay' : 'America/Dawson_Creek',
		'America/Chihuahua' : 'America/Dawson_Creek',
		'America/Creston' : 'America/Dawson_Creek',
		'America/Dawson_Creek' : 'America/Dawson_Creek',
		'America/Denver' : 'America/Dawson_Creek',
		'America/Edmonton' : 'America/Dawson_Creek',
		'America/Hermosillo' : 'America/Dawson_Creek',
		'America/Inuvik' : 'America/Dawson_Creek',
		'America/Mazatlan' : 'America/Dawson_Creek',
		'America/Ojinaga' : 'America/Dawson_Creek',
		'America/Phoenix' : 'America/Dawson_Creek',
		'America/Shiprock' : 'America/Dawson_Creek',
		'America/Yellowknife' : 'America/Dawson_Creek',
		'Canada/Mountain' : 'America/Dawson_Creek',
		'Etc/GMT+7' : 'America/Dawson_Creek',
		'MST' : 'America/Dawson_Creek',
		'MST7MDT' : 'America/Dawson_Creek',
		'Mexico/BajaSur' : 'America/Dawson_Creek',
		'Navajo' : 'America/Dawson_Creek',
		'PNT' : 'America/Dawson_Creek',
		'SystemV/MST7' : 'America/Dawson_Creek',
		'SystemV/MST7MDT' : 'America/Dawson_Creek',
		'US/Arizona' : 'America/Dawson_Creek',
		'US/Mountain' : 'America/Dawson_Creek',
		/*-6:00*/
		'America/Bahia_Banderas' : 'America/Chicago',
		'America/Belize' : 'America/Chicago',
		'America/Cancun' : 'America/Chicago',
		'America/Chicago' : 'America/Chicago',
		'America/Costa_Rica' : 'America/Chicago',
		'America/El_Salvador' : 'America/Chicago',
		'America/Guatemala' : 'America/Chicago',
		'America/Indiana/Knox' : 'America/Chicago',
		'America/Indiana/Tell_City' : 'America/Chicago',
		'America/Knox_IN' : 'America/Chicago',
		'America/Managua' : 'America/Chicago',
		'America/Matamoros' : 'America/Chicago',
		'America/Menominee' : 'America/Chicago',
		'America/Merida' : 'America/Chicago',
		'America/Mexico_City' : 'America/Chicago',
		'America/Monterrey' : 'America/Chicago',
		'America/North_Dakota/Beulah' : 'America/Chicago',
		'America/North_Dakota/Center' : 'America/Chicago',
		'America/North_Dakota/New_Salem' : 'America/Chicago',
		'America/Rainy_River' : 'America/Chicago',
		'America/Rankin_Inlet' : 'America/Chicago',
		'America/Regina' : 'America/Chicago',
		'America/Resolute' : 'America/Chicago',
		'America/Swift_Current' : 'America/Chicago',
		'America/Tegucigalpa' : 'America/Chicago',
		'America/Winnipeg' : 'America/Chicago',
		'CST' : 'America/Chicago',
		'CST6CDT' : 'America/Chicago',
		'Canada/Central' : 'America/Chicago',
		'Canada/East-Saskatchewan' : 'America/Chicago',
		'Canada/Saskatchewan' : 'America/Chicago',
		'Chile/EasterIsland' : 'America/Chicago',
		'Etc/GMT+6' : 'America/Chicago',
		'Mexico/General' : 'America/Chicago',
		'Pacific/Easter' : 'America/Chicago',
		'Pacific/Galapagos' : 'America/Chicago',
		'SystemV/CST6' : 'America/Chicago',
		'SystemV/CST6CDT' : 'America/Chicago',
		'US/Central' : 'America/Chicago',
		'US/Indiana-Starke' : 'America/Chicago',
		/*-5:00*/
		'America/Atikokan' : 'America/Detroit',
		'America/Bogota' : 'America/Detroit',
		'America/Cayman' : 'America/Detroit',
		'America/Coral_Harbour' : 'America/Detroit',
		'America/Detroit' : 'America/Detroit',
		'America/Fort_Wayne' : 'America/Detroit',
		'America/Grand_Turk' : 'America/Detroit',
		'America/Guayaquil' : 'America/Detroit',
		'America/Havana' : 'America/Detroit',
		'America/Indiana/Indianapolis' : 'America/Detroit',
		'America/Indiana/Marengo' : 'America/Detroit',
		'America/Indiana/Petersburg' : 'America/Detroit',
		'America/Indiana/Vevay' : 'America/Detroit',
		'America/Indiana/Vincennes' : 'America/Detroit',
		'America/Indiana/Winamac' : 'America/Detroit',
		'America/Indianapolis' : 'America/Detroit',
		'America/Iqaluit' : 'America/Detroit',
		'America/Jamaica' : 'America/Detroit',
		'America/Kentucky/Louisville' : 'America/Detroit',
		'America/Kentucky/Monticello' : 'America/Detroit',
		'America/Lima' : 'America/Detroit',
		'America/Louisville' : 'America/Detroit',
		'America/Montreal' : 'America/Detroit',
		'America/Nassau' : 'America/Detroit',
		'America/New_York' : 'America/Detroit',
		'America/Nipigon' : 'America/Detroit',
		'America/Panama' : 'America/Detroit',
		'America/Pangnirtung' : 'America/Detroit',
		'America/Port-au-Prince' : 'America/Detroit',
		'America/Thunder_Bay' : 'America/Detroit',
		'America/Toronto' : 'America/Detroit',
		'Canada/Eastern' : 'America/Detroit',
		'Cuba' : 'America/Detroit',
		'EST' : 'America/Detroit',
		'EST5EDT' : 'America/Detroit',
		'Etc/GMT+5' : 'America/Detroit',
		'IET' : 'America/Detroit',
		'Jamaica' : 'America/Detroit',
		'SystemV/EST5' : 'America/Detroit',
		'SystemV/EST5EDT' : 'America/Detroit',
		'US/East-Indiana' : 'America/Detroit',
		'US/Eastern' : 'America/Detroit',
		'US/Michigan' : 'America/Detroit',
		/*-4:30*/
		'America/Caracas' : 'America/Caracas',
		/*-4:00*/
		'America/Anguilla' : 'America/Santiago',
		'America/Antigua' : 'America/Santiago',
		'America/Argentina/San_Luis' : 'America/Santiago',
		'America/Aruba' : 'America/Santiago',
		'America/Asuncion' : 'America/Santiago',
		'America/Barbados' : 'America/Santiago',
		'America/Blanc-Sablon' : 'America/Santiago',
		'America/Boa_Vista' : 'America/Santiago',
		'America/Campo_Grande' : 'America/Santiago',
		'America/Cuiaba' : 'America/Santiago',
		'America/Curacao' : 'America/Santiago',
		'America/Dominica' : 'America/Santiago',
		'America/Eirunepe' : 'America/Santiago',
		'America/Glace_Bay' : 'America/Santiago',
		'America/Goose_Bay' : 'America/Santiago',
		'America/Grenada' : 'America/Santiago',
		'America/Guadeloupe' : 'America/Santiago',
		'America/Guyana' : 'America/Santiago',
		'America/Halifax' : 'America/Santiago',
		'America/Kralendijk' : 'America/Santiago',
		'America/La_Paz' : 'America/Santiago',
		'America/Lower_Princes' : 'America/Santiago',
		'America/Manaus' : 'America/Santiago',
		'America/Marigot' : 'America/Santiago',
		'America/Martinique' : 'America/Santiago',
		'America/Moncton' : 'America/Santiago',
		'America/Montserrat' : 'America/Santiago',
		'America/Port_of_Spain' : 'America/Santiago',
		'America/Porto_Acre' : 'America/Santiago',
		'America/Porto_Velho' : 'America/Santiago',
		'America/Puerto_Rico' : 'America/Santiago',
		'America/Rio_Branco' : 'America/Santiago',
		'America/Santiago' : 'America/Santiago',
		'America/Santo_Domingo' : 'America/Santiago',
		'America/St_Barthelemy' : 'America/Santiago',
		'America/St_Kitts' : 'America/Santiago',
		'America/St_Lucia' : 'America/Santiago',
		'America/St_Thomas' : 'America/Santiago',
		'America/St_Vincent' : 'America/Santiago',
		'America/Thule' : 'America/Santiago',
		'America/Tortola' : 'America/Santiago',
		'America/Virgin' : 'America/Santiago',
		'Antarctica/Palmer' : 'America/Santiago',
		'Atlantic/Bermuda' : 'America/Santiago',
		'Brazil/Acre' : 'America/Santiago',
		'Brazil/West' : 'America/Santiago',
		'Canada/Atlantic' : 'America/Santiago',
		'Chile/Continental' : 'America/Santiago',
		'Etc/GMT+4' : 'America/Santiago',
		'PRT' : 'America/Santiago',
		'SystemV/AST4' : 'America/Santiago',
		'SystemV/AST4ADT' : 'America/Santiago',
		/*-3:30*/
		'America/St_Johns' : 'America/St_Johns',
		'CNT' : '',
		'Canada/Newfoundland' : '',
		/*-3:00*/
		'AGT' : 'America/Sao_Paulo',
		'America/Araguaina' : 'America/Sao_Paulo',
		'America/Argentina/Buenos_Aires' : 'America/Sao_Paulo',
		'America/Argentina/Catamarca' : 'America/Sao_Paulo',
		'America/Argentina/ComodRivadavia' : 'America/Sao_Paulo',
		'America/Argentina/Cordoba' : 'America/Sao_Paulo',
		'America/Argentina/Jujuy' : 'America/Sao_Paulo',
		'America/Argentina/La_Rioja' : 'America/Sao_Paulo',
		'America/Argentina/Mendoza' : 'America/Sao_Paulo',
		'America/Argentina/Rio_Gallegos' : 'America/Sao_Paulo',
		'America/Argentina/Salta' : 'America/Sao_Paulo',
		'America/Argentina/San_Juan' : 'America/Sao_Paulo',
		'America/Argentina/Tucuman' : 'America/Sao_Paulo',
		'America/Argentina/Ushuaia' : 'America/Sao_Paulo',
		'America/Bahia' : 'America/Sao_Paulo',
		'America/Belem' : 'America/Sao_Paulo',
		'America/Buenos_Aires' : 'America/Sao_Paulo',
		'America/Catamarca' : 'America/Sao_Paulo',
		'America/Cayenne' : 'America/Sao_Paulo',
		'America/Cordoba' : 'America/Sao_Paulo',
		'America/Fortaleza' : 'America/Sao_Paulo',
		'America/Godthab' : 'America/Sao_Paulo',
		'America/Jujuy' : 'America/Sao_Paulo',
		'America/Maceio' : 'America/Sao_Paulo',
		'America/Mendoza' : 'America/Sao_Paulo',
		'America/Miquelon' : 'America/Sao_Paulo',
		'America/Montevideo' : 'America/Sao_Paulo',
		'America/Paramaribo' : 'America/Sao_Paulo',
		'America/Recife' : 'America/Sao_Paulo',
		'America/Rosario' : 'America/Sao_Paulo',
		'America/Santarem' : 'America/Sao_Paulo',
		'America/Sao_Paulo' : 'America/Sao_Paulo',
		'Antarctica/Rothera' : 'America/Sao_Paulo',
		'Atlantic/Stanley' : 'America/Sao_Paulo',
		'BET' : 'America/Sao_Paulo',
		'Brazil/East' : 'America/Sao_Paulo',
		'Etc/GMT+3' : 'America/Sao_Paulo',
		/*-2:00*/
		'America/Noronha' : 'America/Noronha',
		'Atlantic/South_Georgia' : 'America/Noronha',
		'Brazil/DeNoronha' : 'America/Noronha',
		'Etc/GMT+2' : 'America/Noronha',
		/*-1:00*/
		'America/Scoresbysund' : 'Atlantic/Cape_Verde',
		'Atlantic/Azores' : 'Atlantic/Cape_Verde',
		'Atlantic/Cape_Verde' : 'Atlantic/Cape_Verde',
		'Etc/GMT+1' : 'Atlantic/Cape_Verde',
		/*+0:00*/
		'Africa/Abidjan' : 'Africa/Abidjan',
		'Africa/Accra' : 'Africa/Abidjan',
		'Africa/Bamako' : 'Africa/Abidjan',
		'Africa/Banjul' : 'Africa/Abidjan',
		'Africa/Bissau' : 'Africa/Abidjan',
		'Africa/Casablanca' : 'Africa/Abidjan',
		'Africa/Conakry' : 'Africa/Abidjan',
		'Africa/Dakar' : 'Africa/Abidjan',
		'Africa/El_Aaiun' : 'Africa/Abidjan',
		'Africa/Freetown' : 'Africa/Abidjan',
		'Africa/Lome' : 'Africa/Abidjan',
		'Africa/Monrovia' : 'Africa/Abidjan',
		'Africa/Nouakchott' : 'Africa/Abidjan',
		'Africa/Ouagadougou' : 'Africa/Abidjan',
		'Africa/Sao_Tome' : 'Africa/Abidjan',
		'Africa/Timbuktu' : 'Africa/Abidjan',
		'America/Danmarkshavn' : 'Africa/Abidjan',
		'Atlantic/Canary' : 'Africa/Abidjan',
		'Atlantic/Faeroe' : 'Africa/Abidjan',
		'Atlantic/Faroe' : 'Africa/Abidjan',
		'Atlantic/Madeira' : 'Africa/Abidjan',
		'Atlantic/Reykjavik' : 'Africa/Abidjan',
		'Atlantic/St_Helena' : 'Africa/Abidjan',
		'Eire' : 'Africa/Abidjan',
		'Etc/GMT' : 'Africa/Abidjan',
		'Etc/GMT+0' : 'Africa/Abidjan',
		'Etc/GMT-0' : 'Africa/Abidjan',
		'Etc/GMT0' : 'Africa/Abidjan',
		'Etc/Greenwich' : 'Africa/Abidjan',
		'Etc/UCT' : 'Africa/Abidjan',
		'Etc/UTC' : 'Africa/Abidjan',
		'Etc/Universal' : 'Africa/Abidjan',
		'Etc/Zulu' : 'Africa/Abidjan',
		'Europe/Belfast' : 'Africa/Abidjan',
		'Europe/Dublin' : 'Africa/Abidjan',
		'Europe/Guernsey' : 'Africa/Abidjan',
		'Europe/Isle_of_Man' : 'Africa/Abidjan',
		'Europe/Jersey' : 'Africa/Abidjan',
		'Europe/Lisbon' : 'Africa/Abidjan',
		'Europe/London' : 'Africa/Abidjan',
		'GB' : 'Africa/Abidjan',
		'GB-Eire' : 'Africa/Abidjan',
		'GMT' : 'Africa/Abidjan',
		'GMT0' : 'Africa/Abidjan',
		'Greenwich' : 'Africa/Abidjan',
		'Iceland' : 'Africa/Abidjan',
		'Portugal' : 'Africa/Abidjan',
		'UCT' : 'Africa/Abidjan',
		'UTC' : 'Africa/Abidjan',
		'Universal' : 'Africa/Abidjan',
		'WET' : 'Africa/Abidjan',
		'Zulu' : 'Africa/Abidjan',
		/*+1:00*/
		'Africa/Algiers' : 'Europe/Vienna',
		'Africa/Bangui' : 'Europe/Vienna',
		'Africa/Brazzaville' : 'Europe/Vienna',
		'Africa/Ceuta' : 'Europe/Vienna',
		'Africa/Douala' : 'Europe/Vienna',
		'Africa/Kinshasa' : 'Europe/Vienna',
		'Africa/Lagos' : 'Europe/Vienna',
		'Africa/Libreville' : 'Europe/Vienna',
		'Africa/Luanda' : 'Europe/Vienna',
		'Africa/Malabo' : 'Europe/Vienna',
		'Africa/Ndjamena' : 'Europe/Vienna',
		'Africa/Niamey' : 'Europe/Vienna',
		'Africa/Porto-Novo' : 'Europe/Vienna',
		'Africa/Tunis' : 'Europe/Vienna',
		'Africa/Windhoek' : 'Europe/Vienna',
		'Arctic/Longyearbyen' : 'Europe/Vienna',
		'Atlantic/Jan_Mayen' : 'Europe/Vienna',
		'CET' : 'Europe/Vienna',
		'ECT' : 'Europe/Vienna',
		'Etc/GMT-1' : 'Europe/Vienna',
		'Europe/Amsterdam' : 'Europe/Vienna',
		'Europe/Andorra' : 'Europe/Vienna',
		'Europe/Belgrade' : 'Europe/Vienna',
		'Europe/Berlin' : 'Europe/Vienna',
		'Europe/Bratislava' : 'Europe/Vienna',
		'Europe/Brussels' : 'Europe/Vienna',
		'Europe/Budapest' : 'Europe/Vienna',
		'Europe/Copenhagen' : 'Europe/Vienna',
		'Europe/Gibraltar' : 'Europe/Vienna',
		'Europe/Ljubljana' : 'Europe/Vienna',
		'Europe/Luxembourg' : 'Europe/Vienna',
		'Europe/Madrid' : 'Europe/Vienna',
		'Europe/Malta' : 'Europe/Vienna',
		'Europe/Monaco' : 'Europe/Vienna',
		'Europe/Oslo' : 'Europe/Vienna',
		'Europe/Paris' : 'Europe/Vienna',
		'Europe/Podgorica' : 'Europe/Vienna',
		'Europe/Prague' : 'Europe/Vienna',
		'Europe/Rome' : 'Europe/Vienna',
		'Europe/San_Marino' : 'Europe/Vienna',
		'Europe/Sarajevo' : 'Europe/Vienna',
		'Europe/Skopje' : 'Europe/Vienna',
		'Europe/Stockholm' : 'Europe/Vienna',
		'Europe/Tirane' : 'Europe/Vienna',
		'Europe/Vaduz' : 'Europe/Vienna',
		'Europe/Vatican' : 'Europe/Vienna',
		'Europe/Vienna' : 'Europe/Vienna',
		'Europe/Warsaw' : 'Europe/Vienna',
		'Europe/Zagreb' : 'Europe/Vienna',
		'Europe/Zurich' : 'Europe/Vienna',
		'MET' : 'Europe/Vienna',
		'Poland' : 'Europe/Vienna',
		/*+2:00*/
		'ART' : 'Asia/Jerusalem',
		'Africa/Blantyre' : 'Asia/Jerusalem',
		'Africa/Bujumbura' : 'Asia/Jerusalem',
		'Africa/Cairo' : 'Asia/Jerusalem',
		'Africa/Gaborone' : 'Asia/Jerusalem',
		'Africa/Harare' : 'Asia/Jerusalem',
		'Africa/Johannesburg' : 'Asia/Jerusalem',
		'Africa/Kigali' : 'Asia/Jerusalem',
		'Africa/Lubumbashi' : 'Asia/Jerusalem',
		'Africa/Lusaka' : 'Asia/Jerusalem',
		'Africa/Maputo' : 'Asia/Jerusalem',
		'Africa/Maseru' : 'Asia/Jerusalem',
		'Africa/Mbabane' : 'Asia/Jerusalem',
		'Africa/Tripoli' : 'Asia/Jerusalem',
		'Asia/Amman' : 'Asia/Jerusalem',
		'Asia/Beirut' : 'Asia/Jerusalem',
		'Asia/Damascus' : 'Asia/Jerusalem',
		'Asia/Gaza' : 'Asia/Jerusalem',
		'Asia/Hebron' : 'Asia/Jerusalem',
		'Asia/Istanbul' : 'Asia/Jerusalem',
		'Asia/Jerusalem' : 'Asia/Jerusalem',
		'Asia/Nicosia' : 'Asia/Jerusalem',
		'Asia/Tel_Aviv' : 'Asia/Jerusalem',
		'CAT' : 'Asia/Jerusalem',
		'EET' : 'Asia/Jerusalem',
		'Egypt' : 'Asia/Jerusalem',
		'Etc/GMT-2' : 'Asia/Jerusalem',
		'Europe/Athens' : 'Asia/Jerusalem',
		'Europe/Bucharest' : 'Asia/Jerusalem',
		'Europe/Chisinau' : 'Asia/Jerusalem',
		'Europe/Helsinki' : 'Asia/Jerusalem',
		'Europe/Istanbul' : 'Asia/Jerusalem',
		'Europe/Kiev' : 'Asia/Jerusalem',
		'Europe/Mariehamn' : 'Asia/Jerusalem',
		'Europe/Nicosia' : 'Asia/Jerusalem',
		'Europe/Riga' : 'Asia/Jerusalem',
		'Europe/Simferopol' : 'Asia/Jerusalem',
		'Europe/Sofia' : 'Asia/Jerusalem',
		'Europe/Tallinn' : 'Asia/Jerusalem',
		'Europe/Tiraspol' : 'Asia/Jerusalem',
		'Europe/Uzhgorod' : 'Asia/Jerusalem',
		'Europe/Vilnius' : 'Asia/Jerusalem',
		'Europe/Zaporozhye' : 'Asia/Jerusalem',
		'Israel' : 'Asia/Jerusalem',
		'Libya' : 'Asia/Jerusalem',
		'Turkey' : 'Asia/Jerusalem',
		/*+3:00*/
		'Africa/Addis_Ababa' : 'Africa/Addis_Ababa',
		'Africa/Asmara' : 'Africa/Addis_Ababa',
		'Africa/Asmera' : 'Africa/Addis_Ababa',
		'Africa/Dar_es_Salaam' : 'Africa/Addis_Ababa',
		'Africa/Djibouti' : 'Africa/Addis_Ababa',
		'Africa/Juba' : 'Africa/Addis_Ababa',
		'Africa/Kampala' : 'Africa/Addis_Ababa',
		'Africa/Khartoum' : 'Africa/Addis_Ababa',
		'Africa/Mogadishu' : 'Africa/Addis_Ababa',
		'Africa/Nairobi' : 'Africa/Addis_Ababa',
		'Antarctica/Syowa' : 'Africa/Addis_Ababa',
		'Asia/Aden' : 'Africa/Addis_Ababa',
		'Asia/Baghdad' : 'Africa/Addis_Ababa',
		'Asia/Bahrain' : 'Africa/Addis_Ababa',
		'Asia/Kuwait' : 'Africa/Addis_Ababa',
		'Asia/Qatar' : 'Africa/Addis_Ababa',
		'Asia/Riyadh' : 'Africa/Addis_Ababa',
		'EAT' : 'Africa/Addis_Ababa',
		'Etc/GMT-3' : 'Africa/Addis_Ababa',
		'Europe/Kaliningrad' : 'Africa/Addis_Ababa',
		'Europe/Minsk' : 'Africa/Addis_Ababa',
		'Indian/Antananarivo' : 'Africa/Addis_Ababa',
		'Indian/Comoro' : 'Africa/Addis_Ababa',
		'Indian/Mayotte' : 'Africa/Addis_Ababa',
		/*+3:30*/
		'Asia/Tehran' : 'Asia/Tehran',
		'Iran' : 'Asia/Tehran',
		/*+4:00*/
		'Asia/Baku' : 'Asia/Dubai',
		'Asia/Dubai' : 'Asia/Dubai',
		'Asia/Muscat' : 'Asia/Dubai',
		'Asia/Tbilisi' : 'Asia/Dubai',
		'Asia/Yerevan' : 'Asia/Dubai',
		'Etc/GMT-4' : 'Asia/Dubai',
		'Europe/Moscow' : 'Asia/Dubai',
		'Europe/Samara' : 'Asia/Dubai',
		'Europe/Volgograd' : 'Asia/Dubai',
		'Indian/Mahe' : 'Asia/Dubai',
		'Indian/Mauritius' : 'Asia/Dubai',
		'Indian/Reunion' : 'Asia/Dubai',
		'NET' : 'Asia/Dubai',
		'W-SU' : 'Asia/Dubai',
		/*+4:30*/
		'Asia/Kabul' : 'Asia/Kabul',
		/*+5:00*/
		'Antarctica/Mawson' : 'Antarctica/Mawson',
		'Asia/Aqtau' : 'Antarctica/Mawson',
		'Asia/Aqtobe' : 'Antarctica/Mawson',
		'Asia/Ashgabat' : 'Antarctica/Mawson',
		'Asia/Ashkhabad' : 'Antarctica/Mawson',
		'Asia/Dushanbe' : 'Antarctica/Mawson',
		'Asia/Karachi' : 'Antarctica/Mawson',
		'Asia/Oral' : 'Antarctica/Mawson',
		'Asia/Samarkand' : 'Antarctica/Mawson',
		'Asia/Tashkent' : 'Antarctica/Mawson',
		'Etc/GMT-5' : 'Antarctica/Mawson',
		'Indian/Kerguelen' : 'Antarctica/Mawson',
		'Indian/Maldives' : 'Antarctica/Mawson',
		'PLT' : 'Antarctica/Mawson',
		/*+5:30*/
		'Asia/Calcutta' : 'Asia/Colombo',
		'Asia/Colombo' : 'Asia/Colombo',
		'Asia/Kolkata' : 'Asia/Colombo',
		'IST' : 'Asia/Colombo',
		/*+6:00*/
		'Antarctica/Vostok' : 'Antarctica/Vostok',
		'Asia/Almaty' : 'Antarctica/Vostok',
		'Asia/Bishkek' : 'Antarctica/Vostok',
		'Asia/Dacca' : 'Antarctica/Vostok',
		'Asia/Dhaka' : 'Antarctica/Vostok',
		'Asia/Qyzylorda' : 'Antarctica/Vostok',
		'Asia/Thimbu' : 'Antarctica/Vostok',
		'Asia/Thimphu' : 'Antarctica/Vostok',
		'Asia/Yekaterinburg' : 'Antarctica/Vostok',
		'BST' : 'Antarctica/Vostok',
		'Etc/GMT-6' : 'Antarctica/Vostok',
		'Indian/Chagos' : 'Antarctica/Vostok',
		/*+6:30*/
		'Asia/Rangoon' : 'Asia/Rangoon',
		'Indian/Cocos' : 'Asia/Rangoon',
		/*+7:00*/
		'Antarctica/Davis' : 'Antarctica/Davis',
		'Asia/Bangkok' : 'Antarctica/Davis',
		'Asia/Ho_Chi_Minh' : 'Antarctica/Davis',
		'Asia/Hovd' : 'Antarctica/Davis',
		'Asia/Jakarta' : 'Antarctica/Davis',
		'Asia/Novokuznetsk' : 'Antarctica/Davis',
		'Asia/Novosibirsk' : 'Antarctica/Davis',
		'Asia/Omsk' : 'Antarctica/Davis',
		'Asia/Phnom_Penh' : 'Antarctica/Davis',
		'Asia/Pontianak' : 'Antarctica/Davis',
		'Asia/Saigon' : 'Antarctica/Davis',
		'Asia/Vientiane' : 'Antarctica/Davis',
		'Etc/GMT-7' : 'Antarctica/Davis',
		'Indian/Christmas' : 'Antarctica/Davis',
		'VST' : 'Antarctica/Davis',
		/*+8:00*/
		'Antarctica/Casey' : 'Antarctica/Casey',
		'Asia/Brunei' : 'Antarctica/Casey',
		'Asia/Choibalsan' : 'Antarctica/Casey',
		'Asia/Chongqing' : 'Antarctica/Casey',
		'Asia/Chungking' : 'Antarctica/Casey',
		'Asia/Harbin' : 'Antarctica/Casey',
		'Asia/Hong_Kong' : 'Antarctica/Casey',
		'Asia/Kashgar' : 'Antarctica/Casey',
		'Asia/Krasnoyarsk' : 'Antarctica/Casey',
		'Asia/Kuala_Lumpur' : 'Antarctica/Casey',
		'Asia/Kuching' : 'Antarctica/Casey',
		'Asia/Macao' : 'Antarctica/Casey',
		'Asia/Macau' : 'Antarctica/Casey',
		'Asia/Makassar' : 'Antarctica/Casey',
		'Asia/Manila' : 'Antarctica/Casey',
		'Asia/Shanghai' : 'Antarctica/Casey',
		'Asia/Singapore' : 'Antarctica/Casey',
		'Asia/Taipei' : 'Antarctica/Casey',
		'Asia/Ujung_Pandang' : 'Antarctica/Casey',
		'Asia/Ulaanbaatar' : 'Antarctica/Casey',
		'Asia/Ulan_Bator' : 'Antarctica/Casey',
		'Asia/Urumqi' : 'Antarctica/Casey',
		'Australia/Perth' : 'Antarctica/Casey',
		'Australia/West' : 'Antarctica/Casey',
		'CTT' : 'Antarctica/Casey',
		'Etc/GMT-8' : 'Antarctica/Casey',
		'Hongkong' : 'Antarctica/Casey',
		'PRC' : 'Antarctica/Casey',
		'Singapore' : 'Antarctica/Casey',
		/*+9:00*/
		'Asia/Dili' : 'Asia/Dili',
		'Asia/Irkutsk' : 'Asia/Dili',
		'Asia/Jayapura' : 'Asia/Dili',
		'Asia/Pyongyang' : 'Asia/Dili',
		'Asia/Seoul' : 'Asia/Dili',
		'Asia/Tokyo' : 'Asia/Dili',
		'Etc/GMT-9' : 'Asia/Dili',
		'JST' : 'Asia/Dili',
		'Japan' : 'Asia/Dili',
		'Pacific/Palau' : 'Asia/Dili',
		'ROK' : 'Asia/Dili',
		/*+9:30*/
		'ACT' : 'Australia/Darwin',
		'Australia/Adelaide' : 'Australia/Darwin',
		'Australia/Broken_Hill' : 'Australia/Darwin',
		'Australia/Darwin' : 'Australia/Darwin',
		'Australia/North' : 'Australia/Darwin',
		'Australia/South' : 'Australia/Darwin',
		'Australia/Yancowinna' : 'Australia/Darwin',
		/*+10:00*/
		'AET' : 'Australia/Currie',
		'Antarctica/DumontDUrville' : 'Australia/Currie',
		'Asia/Yakutsk' : 'Australia/Currie',
		'Australia/ACT' : 'Australia/Currie',
		'Australia/Brisbane' : 'Australia/Currie',
		'Australia/Canberra' : 'Australia/Currie',
		'Australia/Currie' : 'Australia/Currie',
		'Australia/Hobart' : 'Australia/Currie',
		'Australia/Lindeman' : 'Australia/Currie',
		'Australia/Melbourne' : 'Australia/Currie',
		'Australia/NSW' : 'Australia/Currie',
		'Australia/Queensland' : 'Australia/Currie',
		'Australia/Sydney' : 'Australia/Currie',
		'Australia/Tasmania' : 'Australia/Currie',
		'Australia/Victoria' : 'Australia/Currie',
		'Etc/GMT-10' : 'Australia/Currie',
		'Pacific/Chuuk' : 'Australia/Currie',
		'Pacific/Guam' : 'Australia/Currie',
		'Pacific/Port_Moresby' : 'Australia/Currie',
		'Pacific/Saipan' : 'Australia/Currie',
		'Pacific/Truk' : 'Australia/Currie',
		'Pacific/Yap' : 'Australia/Currie',
		/*+10:30*/
		'Australia/LHI' : 'Australia/Lord_Howe',
		'Australia/Lord_Howe' : 'Australia/Lord_Howe',
		/*+11:00*/
		'Antarctica/Macquarie' : 'Antarctica/Macquarie',
		'Asia/Sakhalin' : 'Antarctica/Macquarie',
		'Asia/Vladivostok' : 'Antarctica/Macquarie',
		'Etc/GMT-11' : 'Antarctica/Macquarie',
		'Pacific/Efate' : 'Antarctica/Macquarie',
		'Pacific/Guadalcanal' : 'Antarctica/Macquarie',
		'Pacific/Kosrae' : 'Antarctica/Macquarie',
		'Pacific/Noumea' : 'Antarctica/Macquarie',
		'Pacific/Pohnpei' : 'Antarctica/Macquarie',
		'Pacific/Ponape' : 'Antarctica/Macquarie',
		'SST' : 'Antarctica/Macquarie',
		/*+11:30*/
		'Pacific/Norfolk' : 'Pacific/Norfolk',
		/*+12:00*/
		'Antarctica/McMurdo' : 'Antarctica/McMurdo',
		'Antarctica/South_Pole' : 'Antarctica/McMurdo',
		'Asia/Anadyr' : 'Antarctica/McMurdo',
		'Asia/Kamchatka' : 'Antarctica/McMurdo',
		'Asia/Magadan' : 'Antarctica/McMurdo',
		'Etc/GMT-12' : 'Antarctica/McMurdo',
		'Kwajalein' : 'Antarctica/McMurdo',
		'NST' : 'Antarctica/McMurdo',
		'NZ' : 'Antarctica/McMurdo',
		'Pacific/Auckland' : 'Antarctica/McMurdo',
		'Pacific/Fiji' : 'Antarctica/McMurdo',
		'Pacific/Funafuti' : 'Antarctica/McMurdo',
		'Pacific/Kwajalein' : 'Antarctica/McMurdo',
		'Pacific/Majuro' : 'Antarctica/McMurdo',
		'Pacific/Nauru' : 'Antarctica/McMurdo',
		'Pacific/Tarawa' : 'Antarctica/McMurdo',
		'Pacific/Wake' : 'Antarctica/McMurdo',
		'Pacific/Wallis' : 'Antarctica/McMurdo',
		/*+13:00*/
		'Etc/GMT-13' : 'Pacific/Enderbury',
		'MIT' : 'Pacific/Enderbury',
		'Pacific/Apia' : 'Pacific/Enderbury',
		'Pacific/Enderbury' : 'Pacific/Enderbury',
		'Pacific/Tongatapu' : 'Pacific/Enderbury',
		/*+14:00*/
		'Etc/GMT-14' : 'Pacific/Kiritimati',
		'Pacific/Fakaofo' : 'Pacific/Kiritimati',
		'Pacific/Kiritimati' : 'Pacific/Kiritimati'		
	},
	
	/* return unmapped timezone... */
	unMap: function(timezone) {
		return this.map[timezone] !== undefined ? this.map[timezone] : timezone;
	},
	
	getOffset: function(timezone) {
		/* find timezone, this needs to be optimized ;) */
		timezone = this.unMap(timezone);
		var i = 0;
		for(i = 0; i < this.store.length; i++) {
			if(this.store[i][0] == timezone) {
				return (this.store[i][2] * 60000);
			}
		}
	
		return 0;	// no offset found...
	}
});

Zarafa.plugins.calendarimporter.data.Timezones = new Zarafa.plugins.calendarimporter.data.Timezones();