Ext.namespace('Zarafa.plugins.calendarimporter.settings.ui');

/**
 * @class Zarafa.plugins.calendarimporter.settings.ui.CalSyncGrid
 * @extends Ext.grid.GridPanel
 * @xtype calendarimporter.calsyncgrid
 *
 */
Zarafa.plugins.calendarimporter.settings.ui.CalSyncGrid = Ext.extend(Ext.grid.GridPanel, {
	/**
	 * @constructor
	 * @param {Object} config Configuration structure
	 */
	constructor : function(config)
	{
		config = config || {};
	
		Ext.applyIf(config, {
			xtype : 'calendarimporter.calsyncgrid',
			border : true,
			store : config.store,
			viewConfig : {
				forceFit : true,
				emptyText : '<div class=\'emptytext\'>' + _('No ICAL sync entry exists') + '</div>'
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

		Zarafa.plugins.calendarimporter.settings.ui.CalSyncGrid.superclass.constructor.call(this, config);
	},

	/**
	 * initialize events for the grid panel.
	 * @private
	 */
	initEvents : function()
	{
		Zarafa.plugins.calendarimporter.settings.ui.CalSyncGrid.superclass.initEvents.call(this);

		// select first icssync when store has finished loading
		this.mon(this.store, 'load', this.onViewReady, this, {single : true});
	},
	
	/**
	 * Render function
	 * @return {String}
	 * @private
	 */
	renderAuthColumn : function(value, p, record)
	{
		return value ? "true" : "false";
	},

	/**
	 * Creates a column model object, used in {@link #colModel} config
	 * @return {Ext.grid.ColumnModel} column model object
	 * @private
	 */
	initColumnModel : function()
	{
		return [{
			dataIndex : 'icsurl',
			header : _('ICS File'),
			renderer : Zarafa.common.ui.grid.Renderers.text
		},
		{
			dataIndex : 'calendar',
			header : _('Destination Calender'),
			renderer : Zarafa.common.ui.grid.Renderers.text
		},
		{
			dataIndex : 'user',
			header : _('Authentication'),
			renderer : this.renderAuthColumn
		},
		{
			dataIndex : 'intervall',
			header : _('Sync Intervall')
		},
		{
			dataIndex : 'lastsync',
			header : _('Last Synchronisation'),
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
			msg : _('Loading ics sync entries') + '...'
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
	 * Function will be called to remove a ics sync entry.
	 */
	removeIcsSyncAs : function()
	{
		var icsRecord = this.getSelectionModel().getSelected();
		if(!icsRecord) {
			Ext.Msg.alert(_('Alert'), _('Please select a ics sync entry.'));
			return;
		}

		this.store.remove(icsRecord);
	},
	
	/**
	 * Event handler which is fired when the {@link Zarafa.plugins.calendarimporter.settings.ui.CalSyncGrid CalSyncGrid} is double clicked.
	 * it will call generic function to handle the functionality.
	 * @private
	 */
	onRowDblClick : function(grid, rowIndex)
	{
		Zarafa.core.data.UIFactory.openLayerComponent(Zarafa.core.data.SharedComponentType['plugins.calendarimporter.settings.dialogs.calsyncedit'], undefined, {
			store : grid.getStore(),
			item : grid.getStore().getAt(rowIndex),
			manager : Ext.WindowMgr
		});
	}
});

Ext.reg('calendarimporter.calsyncgrid', Zarafa.plugins.calendarimporter.settings.ui.CalSyncGrid);
