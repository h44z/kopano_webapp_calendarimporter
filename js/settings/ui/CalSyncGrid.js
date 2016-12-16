/**
 * CalSyncGrid.js, Kopano calender to ics im/exporter
 *
 * Author: Christoph Haas <christoph.h@sprinternet.at>
 * Copyright (C) 2012-2016 Christoph Haas
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
 *
 */

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
    constructor: function (config) {
        config = config || {};

        Ext.applyIf(config, {
            xtype: 'calendarimporter.calsyncgrid',
            border: true,
            store: config.store,
            viewConfig: {
                forceFit: true,
                emptyText: '<div class=\'emptytext\'>' + dgettext('plugin_calendarimporter', 'No ICAL sync entry exists') + '</div>'
            },
            loadMask: this.initLoadMask(),
            columns: this.initColumnModel(),
            selModel: this.initSelectionModel(),
            listeners: {
                viewready: this.onViewReady,
                rowdblclick: this.onRowDblClick,
                scope: this
            }
        });

        Zarafa.plugins.calendarimporter.settings.ui.CalSyncGrid.superclass.constructor.call(this, config);
    },

    /**
     * initialize events for the grid panel.
     * @private
     */
    initEvents: function () {
        Zarafa.plugins.calendarimporter.settings.ui.CalSyncGrid.superclass.initEvents.call(this);

        // select first icssync when store has finished loading
        this.mon(this.store, 'load', this.onViewReady, this, {single: true});
    },

    /**
     * Render function
     * @return {String}
     * @private
     */
    renderAuthColumn: function (value, p, record) {
        return value ? "true" : "false";
    },

    /**
     * Render function
     * @return {String}
     * @private
     */
    renderCalendarColumn: function (value, p, record) {
        return Zarafa.plugins.calendarimporter.data.Actions.getCalendarFolderByEntryid(value).display_name;
    },

    /**
     * Creates a column model object, used in {@link #colModel} config
     * @return {Ext.grid.ColumnModel} column model object
     * @private
     */
    initColumnModel: function () {
        return [{
            dataIndex: 'icsurl',
            header: dgettext('plugin_calendarimporter', 'ICS File'),
            renderer: Zarafa.common.ui.grid.Renderers.text
        },
            {
                dataIndex: 'calendarname',
                header: dgettext('plugin_calendarimporter', 'Destination Calender'),
                renderer: Zarafa.common.ui.grid.Renderers.text
            },
            {
                dataIndex: 'user',
                header: dgettext('plugin_calendarimporter', 'Authentication'),
                renderer: this.renderAuthColumn
            },
            {
                dataIndex: 'intervall',
                header: dgettext('plugin_calendarimporter', 'Sync Intervall')
            },
            {
                dataIndex: 'lastsync',
                header: dgettext('plugin_calendarimporter', 'Last Synchronisation'),
                renderer: Zarafa.common.ui.grid.Renderers.text
            }]
    },

    /**
     * Creates a selection model object, used in {@link #selModel} config
     * @return {Ext.grid.RowSelectionModel} selection model object
     * @private
     */
    initSelectionModel: function () {
        return new Ext.grid.RowSelectionModel({
            singleSelect: true
        });
    },

    /**
     * Initialize the {@link Ext.grid.GridPanel.loadMask} field
     *
     * @return {Ext.LoadMask} The configuration object for {@link Ext.LoadMask}
     * @private
     */
    initLoadMask: function () {
        return {
            msg: dgettext('plugin_calendarimporter', 'Loading ics sync entries...')
        };
    },

    /**
     * Event handler which is fired when the gridPanel is ready. This will automatically
     * select the first row in the grid.
     * @private
     */
    onViewReady: function () {
        this.getSelectionModel().selectFirstRow();
    },

    /**
     * Function will be called to remove a ics sync entry.
     */
    removeIcsSyncAs: function () {
        var icsRecord = this.getSelectionModel().getSelected();
        if (!icsRecord) {
            Ext.Msg.alert(dgettext('plugin_calendarimporter', 'Alert'), dgettext('plugin_calendarimporter', 'Please select a ics sync entry.'));
            return;
        }

        this.store.remove(icsRecord);
    },

    /**
     * Event handler which is fired when the {@link Zarafa.plugins.calendarimporter.settings.ui.CalSyncGrid CalSyncGrid} is double clicked.
     * it will call generic function to handle the functionality.
     * @private
     */
    onRowDblClick: function (grid, rowIndex) {
        Zarafa.core.data.UIFactory.openLayerComponent(Zarafa.core.data.SharedComponentType['plugins.calendarimporter.settings.dialogs.calsyncedit'], undefined, {
            store: grid.getStore(),
            item: grid.getStore().getAt(rowIndex),
            manager: Ext.WindowMgr
        });
    }
});

Ext.reg('calendarimporter.calsyncgrid', Zarafa.plugins.calendarimporter.settings.ui.CalSyncGrid);
