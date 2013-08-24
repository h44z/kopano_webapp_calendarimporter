Ext.namespace('Zarafa.common.sendas.dialogs');

/**
 * @class Zarafa.common.sendas.dialogs.SendAsEditContentPanel
 * @extends Zarafa.core.ui.ContentPanel
 * @xtype zarafa.sendaseditcontentpanel
 *
 * {@link Zarafa.common.sendas.dialogs.SendAsEditContentPanel SendAsEditContentPanel} will be used to edit sendas addresses.
 */
Zarafa.common.sendas.dialogs.SendAsEditContentPanel = Ext.extend(Zarafa.core.ui.ContentPanel, {
	/**
	 * @constructor
	 * @param config Configuration structure
	 */
	constructor : function(config)
	{
		config = config || {};

		// Add in some standard configuration data.
		Ext.applyIf(config, {
			// Override from Ext.Component
			xtype : 'zarafa.sendaseditcontentpanel',
			// Override from Ext.Component
			layout : 'fit',
			model : true,
			autoSave : false,
			width : 400,
			height : 100,
			title : _('Send As'),
			items : [{
				xtype : 'zarafa.sendaseditpanel',
				item : config.item
			}]
		});

		Zarafa.common.sendas.dialogs.SendAsEditContentPanel.superclass.constructor.call(this, config);
	}
});

Ext.reg('zarafa.sendaseditcontentpanel', Zarafa.common.sendas.dialogs.SendAsEditContentPanel);
