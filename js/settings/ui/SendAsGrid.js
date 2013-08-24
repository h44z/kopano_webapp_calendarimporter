Ext.namespace('Zarafa.common.sendas.ui');

/**
 * @class Zarafa.common.sendas.ui.SendAsGrid
 * @extends Ext.grid.GridPanel
 * @xtype zarafa.sendasgrid
 *
 * {@link Zarafa.common.sendas.ui.SendAsGrid SendAsGrid} will be used to display
 * sendas of the current user.
 */
Zarafa.common.sendas.ui.SendAsGrid = Ext.extend(Ext.grid.GridPanel, {
	/**
	 * @constructor
	 * @param {Object} config Configuration structure
	 */
	constructor : function(config)
	{
		config = config || {};
	
		Ext.applyIf(config, {
			xtype : 'zarafa.sendasgrid',
			border : true,
			store : config.store,
			viewConfig : {
				forceFit : true,
				emptyText : '<div class=\'emptytext\'>' + _('No sendas address exists') + '</div>'
			},
			loadMask : this.initLoadMask(),
			columns : this.initColumnModel(),
			selModel : this.initSelectionModel(),
			listeners : {
				viewready : this.onViewReady,
				rowdblclick : this.onRowDblClick,
				scope : this
			}
		});

		Zarafa.common.sendas.ui.SendAsGrid.superclass.constructor.call(this, config);
	},

	/**
	 * initialize events for the grid panel.
	 * @private
	 */
	initEvents : function()
	{
		Zarafa.common.sendas.ui.SendAsGrid.superclass.initEvents.call(this);

		// select first sendas when store has finished loading
		this.mon(this.store, 'load', this.onViewReady, this, {single : true});
	},

	/**
	 * Creates a column model object, used in {@link #colModel} config
	 * @return {Ext.grid.ColumnModel} column model object
	 * @private
	 */
	initColumnModel : function()
	{
		return [{
			dataIndex : 'display_name',
			header : _('Name'),
			renderer : Zarafa.common.ui.grid.Renderers.text
		},
		{
			dataIndex : 'email_address',
			header : _('Email Address'),
			renderer : Zarafa.common.ui.grid.Renderers.text
		}]
	},

	/**
	 * Creates a selection model object, used in {@link #selModel} config
	 * @return {Ext.grid.RowSelectionModel} selection model object
	 * @private
	 */
	initSelectionModel : function()
	{
		return new Ext.grid.RowSelectionModel({
			singleSelect : true
		});
	},

	/**
	 * Initialize the {@link Ext.grid.GridPanel.loadMask} field
	 *
	 * @return {Ext.LoadMask} The configuration object for {@link Ext.LoadMask}
	 * @private
	 */
	initLoadMask : function()
	{
		return {
			msg : _('Loading sendas addresses') + '...'
		};
	},

	/**
	 * Event handler which is fired when the gridPanel is ready. This will automatically
	 * select the first row in the grid.
	 * @private
	 */
	onViewReady : function()
	{
		this.getSelectionModel().selectFirstRow();
	},

	/**
	 * Function will be called to remove a sendas address.
	 */
	removeSendAs : function()
	{
		var sendasRecord = this.getSelectionModel().getSelected();
		if(!sendasRecord) {
			Ext.Msg.alert(_('Alert'), _('Please select a sendas address.'));
			return;
		}

		this.store.remove(sendasRecord);
	},
	
	/**
	 * Event handler which is fired when the {@link Zarafa.common.sendas.ui.SendAsGrid SendAsGrid} is double clicked.
	 * it will call generic function to handle the functionality.
	 * @private
	 */
	onRowDblClick : function(grid, rowIndex)
	{
		Zarafa.core.data.UIFactory.openLayerComponent(Zarafa.core.data.SharedComponentType['common.sendas.dialog.sendasedit'], undefined, {
			store : grid.getStore(),
			item : grid.getStore().getAt(rowIndex),
			manager : Ext.WindowMgr
		});
	}
});

Ext.reg('zarafa.sendasgrid', Zarafa.common.sendas.ui.SendAsGrid);
