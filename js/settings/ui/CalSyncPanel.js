/**
 * CalSyncPanel.js, Kopano calender to ics im/exporter
 *
 * Author: Christoph Haas <christoph.h@sprinternet.at>
 * Copyright (C) 2012-2018 Christoph Haas
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
 * @class Zarafa.plugins.calendarimporter.settings.ui.CalSyncPanel
 * @extends Ext.Panel
 * @xtype calendarimporter.calsyncpanel
 * Will generate UI for the {@link Zarafa.common.settings.SettingsSendAsWidget SettingsSendAsWidget}.
 */
Zarafa.plugins.calendarimporter.settings.ui.CalSyncPanel = Ext.extend(Ext.Panel, {

    // store
    store: undefined,

    /**
     * @constructor
     * @param config Configuration structure
     */
    constructor: function (config) {
        config = config || {};
        if (config.store)
            this.store = config.store;

        Ext.applyIf(config, {
            // Override from Ext.Component
            xtype: 'calendarimporter.calsyncpanel',
            border: false,
            layout: {
                type: 'vbox',
                align: 'stretch',
                pack: 'start'
            },
            items: this.createPanelItems(this.store)
        });

        Zarafa.plugins.calendarimporter.settings.ui.CalSyncPanel.superclass.constructor.call(this, config);
    },

    /**
     * Function will create panel items for {@link Zarafa.plugins.calendarimporter.settings.ui.CalSyncPanel CalSyncPanel}
     * @return {Array} array of items that should be added to panel.
     * @private
     */
    createPanelItems: function (store) {
        return [{
            xtype: 'displayfield',
            value: dgettext('plugin_calendarimporter', 'Setup calendars you want to subscribe to.'),
            fieldClass: 'x-form-display-field'
        }, {
            xtype: 'container',
            flex: 1,
            layout: {
                type: 'hbox',
                align: 'stretch',
                pack: 'start'
            },
            items: [{
                xtype: 'calendarimporter.calsyncgrid',
                ref: '../calsyncGrid',
                store: store,
                flex: 1
            }, {
                xtype: 'container',
                width: 160,
                defaults: {
                    width: 140
                },
                layout: {
                    type: 'vbox',
                    align: 'center',
                    pack: 'start'
                },
                items: [{
                    xtype: 'button',
                    text: _('Add') + '...',
                    handler: this.onCalSyncAdd,
                    ref: '../../addButton',
                    scope: this
                }, {
                    xtype: 'spacer',
                    height: 20
                }, {
                    xtype: 'button',
                    text: _('Remove') + '...',
                    disabled: true,
                    ref: '../../removeButton',
                    handler: this.onCalSyncRemove,
                    scope: this
                }]
            }]
        }];
    },

    /**
     * initialize events for the panel.
     * @private
     */
    initEvents: function () {
        Zarafa.plugins.calendarimporter.settings.ui.CalSyncPanel.superclass.initEvents.call(this);

        // register event to enable/disable buttons
        this.mon(this.calsyncGrid.getSelectionModel(), 'selectionchange', this.onGridSelectionChange, this);
    },

    /**
     * Handler function will be called when user clicks on 'Add' button.
     * @private
     */
    onCalSyncAdd: function () {
        Zarafa.core.data.UIFactory.openLayerComponent(Zarafa.core.data.SharedComponentType['plugins.calendarimporter.settings.dialogs.calsyncedit'], undefined, {
            store: this.store,
            item: undefined,
            manager: Ext.WindowMgr
        });
    },

    /**
     * Event handler will be called when selection in {@link Zarafa.plugins.calendarimporter.settings.ui.CalSyncGrid CalSyncGrid}
     * has been changed
     * @param {Ext.grid.RowSelectionModel} selectionModel selection model that fired the event
     */
    onGridSelectionChange: function (selectionModel) {
        var noSelection = (selectionModel.hasSelection() === false);

        this.removeButton.setDisabled(noSelection);
    },

    /**
     * Handler function will be called when user clicks on 'Remove' button.
     * @private
     */
    onCalSyncRemove: function () {
        this.calsyncGrid.removeIcsSyncAs();
    },

    /**
     * Function will be used to reload data in the store.
     */
    discardChanges: function () {
        this.store.load();
    },

    /**
     * Function will be used to save changes in the store.
     */
    saveChanges: function () {
        this.store.save();
    }
});

Ext.reg('calendarimporter.calsyncpanel', Zarafa.plugins.calendarimporter.settings.ui.CalSyncPanel);
