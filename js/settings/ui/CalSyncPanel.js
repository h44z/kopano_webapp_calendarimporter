Ext.namespace('Zarafa.plugins.calendarimporter.settings.ui');

/**
 * @class Zarafa.plugins.calendarimporter.settings.ui.CalSyncPanel
 * @extends Ext.Panel
 * @xtype calendarimporter.calsyncpanel
 * Will generate UI for the {@link Zarafa.common.settings.SettingsSendAsWidget SettingsSendAsWidget}.
 */
Zarafa.plugins.calendarimporter.settings.ui.CalSyncPanel = Ext.extend(Ext.Panel, {

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
			xtype : 'calendarimporter.calsyncpanel',
			border : false,
			layout : {
				type : 'vbox',
				align : 'stretch',
				pack  : 'start'
			},
			items : this.createPanelItems(this.store)
		});

		Zarafa.plugins.calendarimporter.settings.ui.CalSyncPanel.superclass.constructor.call(this, config);
	},
	
	/**
	 * Function will create panel items for {@link Zarafa.plugins.calendarimporter.settings.ui.CalSyncPanel CalSyncPanel}
	 * @return {Array} array of items that should be added to panel.
	 * @private
	 */
	createPanelItems : function(store)
	{
		return [{
			xtype : 'displayfield',
			value : _('Here you can .ics files that will be synchronised.'),
			fieldClass : 'x-form-display-field'
		}, {
			xtype : 'container',
			flex : 1,
			layout : {
				type : 'hbox',
				align : 'stretch',
				pack  : 'start'
			},
			items : [{
				xtype : 'calendarimporter.calsyncgrid',
				ref : '../calsyncGrid',
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
		Zarafa.plugins.calendarimporter.settings.ui.CalSyncPanel.superclass.initEvents.call(this);

		// register event to enable/disable buttons
		this.mon(this.calsyncGrid.getSelectionModel(), 'selectionchange', this.onGridSelectionChange, this);
	},

	/**
	 * Handler function will be called when user clicks on 'Add' button.
	 * @private
	 */
	onSendAsAdd : function()
	{
		Zarafa.core.data.UIFactory.openLayerComponent(Zarafa.core.data.SharedComponentType['plugins.calendarimporter.settings.dialogs.calsyncedit'], undefined, {
			store : this.store,
			item : undefined,
			manager : Ext.WindowMgr
		});
	},

	/**
	 * Event handler will be called when selection in {@link Zarafa.plugins.calendarimporter.settings.ui.CalSyncGrid CalSyncGrid}
	 * has been changed
	 * @param {Ext.grid.RowSelectionModel} selectionModel selection model that fired the event
	 */
	onGridSelectionChange : function(selectionModel)
	{
		var noSelection = (selectionModel.hasSelection() === false);

		this.removeButton.setDisabled(noSelection);
	},

	/**
	 * Handler function will be called when user clicks on 'Remove' button.
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

Ext.reg('calendarimporter.calsyncpanel', Zarafa.plugins.calendarimporter.settings.ui.CalSyncPanel);
