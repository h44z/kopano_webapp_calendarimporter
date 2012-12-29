/**
 * ImportContentPanel
 *
 * Container for the importpanel.
 *
 * @author   Christoph Haas <mail@h44z.net>
 * @modified 29.12.2012
 * @license  http://www.opensource.org/licenses/mit-license.php  MIT License
 */
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
		
		var title = _('Import Calendar File');
		if(container.getSettingsModel().get("zarafa/v1/plugins/calendarimporter/enable_export")){
			title = _('Import/Export Calendar File');
		}

		Ext.applyIf(config, {
			layout					: 'fit',
			title					: title,
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