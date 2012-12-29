/**
 * Calendarimporter
 *
 * Main entry point for the plugin
 *
 * @author   Christoph Haas <mail@h44z.net>
 * @modified 29.12.2012
 * @license  http://www.opensource.org/licenses/mit-license.php  MIT License
 */
 
Ext.namespace("Zarafa.plugins.calendarimporter");    								// Assign the right namespace

Zarafa.plugins.calendarimporter.ImportPlugin = Ext.extend(Zarafa.core.Plugin, {		// create new import plugin

    /**
     * @constructor
     * @param {Object} config Configuration object
     *
     */
	constructor: function (config) {
		config = config || {};
		
		Zarafa.plugins.calendarimporter.ImportPlugin.superclass.constructor.call(this, config);		
	},
	
	/**
	 * initialises insertion point for plugin
	 * @protected
	 */
	initPlugin : function()	{
		Zarafa.plugins.calendarimporter.ImportPlugin.superclass.initPlugin.apply(this, arguments);	
		Zarafa.core.data.SharedComponentType.addProperty('plugins.calendarimporter.dialogs.importevents');
		
		/* add import button to south navigation */
		this.registerInsertionPoint("navigation.south", this.createImportButton, this);
	},
	
    /**
     * Creates the button
     *
     * @return {Object} Configuration object for a {@link Ext.Button button}
     * @private
     */
	createImportButton: function () {
		var button=
		{
			xtype				: 'button',
			text				: _('Import Calendar'),
			iconCls				: 'icon_calendarimporter_button',
			navigationContext	: container.getContextByName('calendar'),
			handler				: this.onImportButtonClick,
			scope				: this
		};
		
		if(container.getSettingsModel().get("zarafa/v1/plugins/calendarimporter/enable_export")) {
			button.text = _('Import/Export Calendar');
		}
		
		return  button;
	},
	
	/**
	 * Clickhandler for the button
	 */
	onImportButtonClick: function () {		
		Zarafa.core.data.UIFactory.openLayerComponent(Zarafa.core.data.SharedComponentType['plugins.calendarimporter.dialogs.importevents'], undefined, {
			manager : Ext.WindowMgr
		});
	},
		
	/**
	 * Bid for the type of shared component
	 * and the given record.
	 * This will bid on calendar.dialogs.importevents
	 * @param {Zarafa.core.data.SharedComponentType} type Type of component a context can bid for.
	 * @param {Ext.data.Record} record Optionally passed record.
	 * @return {Number} The bid for the shared component
	 */
	bidSharedComponent : function(type, record)
	{
		var bid = -1;
		switch(type)
		{
			case Zarafa.core.data.SharedComponentType['plugins.calendarimporter.dialogs.importevents']:
				bid = 2;
				break;
		}
		return bid;
	},

	/**
	 * Will return the reference to the shared component.
	 * Based on the type of component requested a component is returned.
	 * @param {Zarafa.core.data.SharedComponentType} type Type of component a context can bid for.
	 * @param {Ext.data.Record} record Optionally passed record.
	 * @return {Ext.Component} Component
	 */
	getSharedComponent : function(type, record)
	{
		var component;
		switch(type)
		{
			case Zarafa.core.data.SharedComponentType['plugins.calendarimporter.dialogs.importevents']:
				component = Zarafa.plugins.calendarimporter.dialogs.ImportContentPanel;
				break;
		}

		return component;
	}
});


/*############################################################################################################################
 * STARTUP 
 *############################################################################################################################*/
Zarafa.onReady(function() {
	if(container.getSettingsModel().get("zarafa/v1/plugins/calendarimporter/enable") === true) {
		container.registerPlugin(new Zarafa.plugins.calendarimporter.ImportPlugin);
	}
});
