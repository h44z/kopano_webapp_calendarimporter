<?php
	/** Disable the import plugin for all clients */
	define('PLUGIN_CALENDARIMPORTER_USER_DEFAULT_ENABLE', true);
	/** Disable the sync feature for all clients */
	define('PLUGIN_CALENDARIMPORTER_USER_DEFAULT_ENABLE_SYNC', true); // not yet implemented
	
	/** The default calendar to import to*/
	define('PLUGIN_CALENDARIMPORTER_DEFAULT', "Kalender");
	define('PLUGIN_CALENDARIMPORTER_DEFAULT_TIMEZONE', "Europe/Vienna");
	
	/** Tempory path for uploaded files... */
	define('PLUGIN_CALENDARIMPORTER_TMP_UPLOAD', "/var/lib/zarafa-webapp/tmp/");
?>
