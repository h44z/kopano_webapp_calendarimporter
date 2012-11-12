Ext.namespace("Zarafa.plugins.calendarimporter.dialogs"); 

/**
 * @class Zarafa.plugins.calendarimporter.dialogs.ImportContentPanel
 * @extends Zarafa.core.ui.ContentPanel
 *
 * The content panel which shows the hierarchy tree of Owncloud account files.
 * @xtype calendarimportercontentpanel
 */
Zarafa.plugins.calendarimporter.dialogs.ImportContentPanel = Ext.extend(Zarafa.core.ui.ContentPanel, {

	/**
	 * @constructor
	 * @param config Configuration structure
	 */
	constructor : function(config)
	{
		config = config || {};

		Ext.applyIf(config, {
			layout					: 'fit',
			title					: _('Import Calendar File'),
			closeOnSave				: true,
			width					: 400,
			height					: 300,
			//Add panel
			items					: [
				{
					xtype				: 'calendarimporter.importpanel'
				}
			]
		});

		Zarafa.plugins.calendarimporter.dialogs.ImportContentPanel.superclass.constructor.call(this, config);
	}

});

Ext.reg('calendarimporter.contentpanel' ,Zarafa.plugins.calendarimporter.dialogs.ImportContentPanel);