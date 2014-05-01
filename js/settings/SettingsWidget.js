Ext.namespace('Zarafa.plugins.calendarimporter.settings');

/**
 * @class Zarafa.plugins.calendarimporter.settings.SettingsWidget
 * @extends Zarafa.settings.ui.SettingsWidget
 * @xtype calendarimporter.settingswidget
 *
 */
Zarafa.plugins.calendarimporter.settings.SettingsWidget = Ext.extend(Zarafa.settings.ui.SettingsWidget, {
	/**
	 * @cfg {Zarafa.settings.SettingsContext} settingsContext
	 */
	settingsContext : undefined,

	/**
	 * @constructor
	 * @param {Object} config Configuration object
	 */
	constructor : function(config)
	{
		config = config || {};

		Ext.applyIf(config, {
			title : _('Calendar Import/Export plugin settings'),
			xtype : 'calendarimporter.settingswidget',
			items : [
				{
					xtype : 'checkbox',
					name : 'zarafa/v1/plugins/calendarimporter/enable_export',
					ref : 'enableExport',
					fieldLabel : 'Enable exporter',
					lazyInit : false
				},
				{
					xtype : 'checkbox',
					name : 'zarafa/v1/plugins/calendarimporter/enable_sync',
					ref : 'enableSync',
					fieldLabel : 'Enable ical sync',
					lazyInit : false
				},
				this.createSelectBox(),
				this.createTimezoneBox()
			]
		});

		Zarafa.plugins.calendarimporter.settings.SettingsWidget.superclass.constructor.call(this, config);
	},
	
	createSelectBox: function() {
		var defaultFolder = container.getHierarchyStore().getDefaultFolder('calendar'); // @type: Zarafa.hierarchy.data.MAPIFolderRecord		
		var subFolders = defaultFolder.getChildren();
		var myStore = [];
		
		/* add all local calendar folders */
		var i = 0;
		myStore.push(new Array(defaultFolder.getDefaultFolderKey(), defaultFolder.getDisplayName()));
		for(i = 0; i < subFolders.length; i++) {
			/* Store all subfolders */
			myStore.push(new Array(subFolders[i].getDisplayName(), subFolders[i].getDisplayName(), false)); // 3rd field = isPublicfolder
		}
		
		/* add all shared calendar folders */
		var pubStore = container.getHierarchyStore().getPublicStore();
		
		if(typeof pubStore !== "undefined") {
			try {
				var pubFolder = pubStore.getDefaultFolder("publicfolders");
				var pubSubFolders = pubFolder.getChildren();
				
				for(i = 0; i < pubSubFolders.length; i++) {
					if(pubSubFolders[i].isContainerClass("IPF.Appointment")){
						myStore.push(new Array(pubSubFolders[i].getDisplayName(), pubSubFolders[i].getDisplayName() + " [Shared]", true)); // 3rd field = isPublicfolder
					}
				}
			} catch (e) {
				console.log("Error opening the shared folder...");
				console.log(e);
			}
		}
		
		return {
			xtype: "selectbox",
			ref : 'defaultCalendar',
			editable: false,
			name: "zarafa/v1/plugins/calendarimporter/default_calendar",
			value: container.getSettingsModel().get("zarafa/v1/plugins/calendarimporter/default_calendar"),
			width: 100,
			fieldLabel: "Default calender",
			store: myStore,
			mode: 'local',
			labelSeperator: ":",
			border: false,
			anchor: "100%",
			scope: this,
			allowBlank: false
		}
	},
	
	createTimezoneBox: function() {
		return {
			xtype: "selectbox",
			ref : 'defaultTimezone',
			editable: false,
			name: "zarafa/v1/plugins/calendarimporter/default_timezone",
			value: Zarafa.plugins.calendarimporter.data.Timezones.unMap(container.getSettingsModel().get("zarafa/v1/plugins/calendarimporter/default_timezone")),
			width: 100,
			fieldLabel: "Default timezone",
			store: Zarafa.plugins.calendarimporter.data.Timezones.store,
			labelSeperator: ":",
			mode: 'local',
			border: false,
			anchor: "100%",
			scope: this,
			allowBlank: false
		}
	},
	
	/**
	 * Called by the {@link Zarafa.settings.ui.SettingsCategory Category} when
	 * it has been called with {@link zarafa.settings.ui.SettingsCategory#update}.
	 * This is used to load the latest version of the settings from the
	 * {@link Zarafa.settings.SettingsModel} into the UI of this category.
	 * @param {Zarafa.settings.SettingsModel} settingsModel The settings to load
	 */
	update : function(settingsModel) {
		this.enableExport.setValue(settingsModel.get(this.enableExport.name));
		this.enableSync.setValue(settingsModel.get(this.enableSync.name));
		this.defaultCalendar.setValue(settingsModel.get(this.defaultCalendar.name));
		this.defaultTimezone.setValue(settingsModel.get(this.defaultTimezone.name));
	},

	/**
	 * Called by the {@link Zarafa.settings.ui.SettingsCategory Category} when
	 * it has been called with {@link zarafa.settings.ui.SettingsCategory#updateSettings}.
	 * This is used to update the settings from the UI into the {@link Zarafa.settings.SettingsModel settings model}.
	 * @param {Zarafa.settings.SettingsModel} settingsModel The settings to update
	 */
	updateSettings : function(settingsModel) {
		settingsModel.set(this.enableExport.name, this.enableExport.getValue());
		settingsModel.set(this.enableSync.name, this.enableSync.getValue());
		settingsModel.set(this.defaultCalendar.name, this.defaultCalendar.getValue());
		settingsModel.set(this.defaultTimezone.name, this.defaultTimezone.getValue());
	}
});

Ext.reg('calendarimporter.settingswidget', Zarafa.plugins.calendarimporter.settings.SettingsWidget);
