<?php
/**
 * calendarimporter Plugin
 *
 * With this plugin you can import a ics file to your zarafa calendar
 *
 */
class Plugincalendarimporter extends Plugin {
	/**
	 * Constructor
	 */
	function Plugincalendarimporter() {}

	/**
	 * Function initializes the Plugin and registers all hooks
	 *
	 * @return void
	 */
	function init() {
		$this->registerHook('server.core.settings.init.before');
	}

	/**
	 * Function is executed when a hook is triggered by the PluginManager
	 *
	 * @param string $eventID the id of the triggered hook
	 * @param mixed $data object(s) related to the hook
	 * @return void
	 */
	function execute($eventID, &$data) {
		switch($eventID) {
			case 'server.core.settings.init.before' :
				$this->injectPluginSettings($data);
				break;
		}
	}

	/**
	 * Called when the core Settings class is initialized and ready to accept sysadmin default
	 * settings.
	 * @param Array $data Reference to the data of the triggered hook
	 */
	function injectPluginSettings(&$data) {
		$data['settingsObj']->addSysAdminDefaults(Array(
			'zarafa' => Array(
				'v1' => Array(
					'plugins' => Array(
						'calendarimporter' => Array(
							'enable'        => PLUGIN_CALENDARIMPORTER_USER_DEFAULT_ENABLE,
							'enable_export' => PLUGIN_CALENDARIMPORTER_USER_DEFAULT_ENABLE_EXPORT,
							'default_calendar'	=> PLUGIN_CALENDARIMPORTER_DEFAULT	// currently not used, maybe in next release
						)
					)
				)
			)
		));
	}
}
?>
