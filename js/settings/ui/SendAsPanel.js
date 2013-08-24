Ext.namespace('Zarafa.common.sendas.ui');

/**
 * @class Zarafa.common.sendas.ui.SendAsPanel
 * @extends Ext.Panel
 * @xtype zarafa.sendaspanel
 * Will generate UI for the {@link Zarafa.common.settings.SettingsSendAsWidget SettingsSendAsWidget}.
 */
Zarafa.common.sendas.ui.SendAsPanel = Ext.extend(Ext.Panel, {

	// store
	store : undefined,

	/**
	 * @constructor
	 * @param config Configuration structure
	 */
	constructor : function(config)
	{
		config = config || {};
		if(config.store)
			this.store = config.store;

		Ext.applyIf(config, {
			// Override from Ext.Component
			xtype : 'zarafa.sendaspanel',
			border : false,
			layout : {
				type : 'vbox',
				align : 'stretch',
				pack  : 'start'
			},
			items : this.createPanelItems(this.store)
		});

		Zarafa.common.sendas.ui.SendAsPanel.superclass.constructor.call(this, config);
	},
	
	/**
	 * Function will create panel items for {@link Zarafa.common.sendas.ui.SendAsPanel SendAsPanel}
	 * @return {Array} array of items that should be added to panel.
	 * @private
	 */
	createPanelItems : function(store)
	{
		return [{
			xtype : 'displayfield',
			value : _('Here you can setup your alias email addresses.'),
			fieldClass : 'x-form-display-field zarafa-delegates-extrainfo'
		}, {
			xtype : 'container',
			flex : 1,
			layout : {
				type : 'hbox',
				align : 'stretch',
				pack  : 'start'
			},
			items : [{
				xtype : 'zarafa.sendasgrid',
				ref : '../sendasGrid',
				store : store,
				flex : 1
			}, {
				xtype : 'container',
				width : 160,
				defaults : {
					width : 140
				},
				layout : {
					type : 'vbox',
					align : 'center',
					pack  : 'start'
				},
				items : [{
					xtype : 'button',
					text : _('Add') + '...',
					handler : this.onSendAsAdd,
					ref : '../../addButton',
					scope : this
				}, {
					xtype : 'spacer',
					height : 20
				}, {
					xtype : 'button',
					text : _('Remove') + '...',
					disabled : true,
					ref : '../../removeButton',
					handler : this.onSendAsRemove,
					scope : this
				}]
			}]
		}];
	},

	/**
	 * initialize events for the panel.
	 * @private
	 */
	initEvents : function()
	{
		Zarafa.common.sendas.ui.SendAsPanel.superclass.initEvents.call(this);

		// register event to enable/disable buttons
		this.mon(this.sendasGrid.getSelectionModel(), 'selectionchange', this.onGridSelectionChange, this);
	},

	/**
	 * Handler function will be called when user clicks on 'Add' button,
	 * this will show addressbook dialog to select sendas user.
	 * @private
	 */
	onSendAsAdd : function()
	{
		Zarafa.core.data.UIFactory.openLayerComponent(Zarafa.core.data.SharedComponentType['common.sendas.dialog.sendasedit'], undefined, {
			store : this.store,
			item : undefined,
			manager : Ext.WindowMgr
		});
	},

	/**
	 * Event handler will be called when selection in {@link Zarafa.common.ui.SendAsGrid SendAsGrid}
	 * has been changed
	 * @param {Ext.grid.RowSelectionModel} selectionModel selection model that fired the event
	 */
	onGridSelectionChange : function(selectionModel)
	{
		var noSelection = (selectionModel.hasSelection() === false);

		this.removeButton.setDisabled(noSelection);
	},

	/**
	 * Handler function will be called when user clicks on 'Remove' button,
	 * this will remove currently selected sendas from sendass list.
	 * @private
	 */
	onSendAsRemove : function()
	{
		this.sendasGrid.removeSendAs();
	},

	/**
	 * Function will be used to reload data in the store.
	 */
	discardChanges : function()
	{
		this.store.load();
	},

	/**
	 * Function will be used to save changes in the store.
	 */
	saveChanges : function()
	{
		this.store.save();
	}
});

Ext.reg('zarafa.sendaspanel', Zarafa.common.sendas.ui.SendAsPanel);
