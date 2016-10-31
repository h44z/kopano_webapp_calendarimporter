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
		var myStore = Zarafa.plugins.calendarimporter.data.Actions.getAllCalendarFolders(true);

		return {
			xtype: "selectbox",
			ref : 'defaultCalendar',
			editable: false,
			name: "zarafa/v1/plugins/calendarimporter/default_calendar",
            value: Zarafa.plugins.calendarimporter.data.Actions.getCalendarFolderByName(container.getSettingsModel().get("zarafa/v1/plugins/calendarimporter/default_calendar")).entryid,
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
        // check if the user changed a value
        var changed = false;

        if(settingsModel.get(this.enableSync.name) != this.enableSync.getValue()) {
            changed = true;
        } else if(settingsModel.get(this.defaultCalendar.name) != this.defaultCalendar.getValue()) {
            changed = true;
        } else if(settingsModel.get(this.defaultTimezone.name) != this.defaultTimezone.getValue()) {
            changed = true;
        }

        if(changed) {
            // Really save changes
            settingsModel.set(this.enableSync.name, this.enableSync.getValue());
            settingsModel.set(this.defaultCalendar.name, this.defaultCalendar.getValue());
            settingsModel.set(this.defaultTimezone.name, this.defaultTimezone.getValue());

            this.onUpdateSettings();
        }
	},

    /**
     * Called after the {@link Zarafa.settings.SettingsModel} fires the {@link Zarafa.settings.SettingsModel#save save}
     * event to indicate the settings were successfully saved and it will forcefully realod the webapp.
     * settings which were saved to the server.
     * @private
     */
    onUpdateSettings : function()
    {
        var message = _('Your WebApp needs to be reloaded to make the changes visible!');
        message += '<br/><br/>';
        message += _('WebApp will automatically restart in order for these changes to take effect');
        message += '<br/>';

        Zarafa.common.dialogs.MessageBox.addCustomButtons({
            title: _('Restart WebApp'),
            msg : message,
            icon: Ext.MessageBox.QUESTION,
            fn : this.restartWebapp,
            customButton : [{
                text : _('Restart'),
                name : 'restart'
            }, {
                text : _('Cancel'),
                name : 'cancel'
            }],
            scope : this
        });

    },

    /**
     * Event handler for {@link #onResetSettings}. This will check if the user
     * wishes to reset the default settings or not.
     * @param {String} button The button which user pressed.
     * @private
     */
    restartWebapp : function(button)
    {
        if (button === 'restart') {
            var contextModel = this.ownerCt.settingsContext.getModel();
            var realModel = contextModel.getRealSettingsModel();

            realModel.save();

            this.loadMask = new Zarafa.common.ui.LoadMask(Ext.getBody(), {
                msg : '<b>' + _('Webapp is reloading, Please wait.') + '</b>'
            });
            this.loadMask.show();

            this.mon(realModel, 'save', this.onSettingsSave, this);
            this.mon(realModel, 'exception', this.onSettingsException, this);
        }

    },

    /**
     * Called when the {@link Zarafa.settings.} fires the {@link Zarafa.settings.SettingsModel#save save}
     * event to indicate the settings were successfully saved and it will forcefully realod the webapp.
     * @param {Zarafa.settings.SettingsModel} model The model which fired the event.
     * @param {Object} parameters The key-value object containing the action and the corresponding
     * settings which were saved to the server.
     * @private
     */
    onSettingsSave : function(model, parameters)
    {
        this.mun(model, 'save', this.onSettingsSave, this);
        Zarafa.core.Util.reloadWebapp();
    },

    /**
     * Called when the {@link Zarafa.settings.SettingsModel} fires the {@link Zarafa.settings.SettingsModel#exception exception}
     * event to indicate the settings were not successfully saved.
     * @param {Zarafa.settings.SettingsModel} model The settings model which fired the event
     * @param {String} type The value of this parameter will be either 'response' or 'remote'.
     * @param {String} action Name of the action (see {@link Ext.data.Api#actions}).
     * @param {Object} options The object containing a 'path' and 'value' field indicating
     * respectively the Setting and corresponding value for the setting which was being saved.
     * @param {Object} response The response object as received from the PHP-side
     * @private
     */
    onSettingsException : function(model, type, action, options, response)
    {
        this.loadMask.hide();

        // Remove event handlers
        this.mun(model, 'save', this.onSettingsSave, this);
        this.mun(model, 'exception', this.onSettingsException, this);
    }
});

Ext.reg('calendarimporter.settingswidget', Zarafa.plugins.calendarimporter.settings.SettingsWidget);
