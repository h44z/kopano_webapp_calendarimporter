Ext.namespace('Zarafa.plugins.calendarimporter.settings.dialogs');

/**
 * @class Zarafa.plugins.calendarimporter.settings.dialogs.CalSyncEditContentPanel
 * @extends Zarafa.core.ui.ContentPanel
 * @xtype calendarimporter.calsynceditcontentpanel
 *
 * {@link Zarafa.plugins.calendarimporter.settings.dialogs.CalSyncEditContentPanel CalSyncEditContentPanel} will be used to edit ics sync entries.
 */
Zarafa.plugins.calendarimporter.settings.dialogs.CalSyncEditContentPanel = Ext.extend(Zarafa.core.ui.ContentPanel, {
	/**
	 * @constructor
	 * @param config Configuration structure
	 */
	constructor : function(config) {
		config = config || {};

		// Add in some standard configuration data.
		Ext.applyIf(config, {
			// Override from Ext.Component
			xtype : 'calendarimporter.calsynceditcontentpanel',
			layout : 'fit',
			model : true,
			autoSave : false,
			width : 400,
			height : 400,
			title : _('ICAL Sync'),
			items : [{
				xtype : 'calendarimporter.calsynceditpanel',
				item : config.item
			}]
		});

		Zarafa.plugins.calendarimporter.settings.dialogs.CalSyncEditContentPanel.superclass.constructor.call(this, config);
	}
});

Ext.reg('calendarimporter.calsynceditcontentpanel', Zarafa.plugins.calendarimporter.settings.dialogs.CalSyncEditContentPanel);
