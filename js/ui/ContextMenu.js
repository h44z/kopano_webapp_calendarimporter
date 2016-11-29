/**
 * ContectMenu.js, Kopano calender to ics im/exporter
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

Ext.namespace('Zarafa.plugins.calendarimporter.ui');

/**
 * @class Zarafa.plugins.calendarimporter.ui.ContextMenu
 * @extends Zarafa.hierarchy.ui.ContextMenu
 * @xtype calendarimporter.hierarchycontextmenu
 */
Zarafa.plugins.calendarimporter.ui.ContextMenu = Ext.extend(Zarafa.hierarchy.ui.ContextMenu, {

    /**
     * @constructor
     * @param {Object} config Configuration object
     */
    constructor: function (config) {
        config = config || {};

        if (config.contextNode) {
            config.contextTree = config.contextNode.getOwnerTree();
        }

        Zarafa.plugins.calendarimporter.ui.ContextMenu.superclass.constructor.call(this, config);

        // add item to menu
        var additionalItems = this.createAdditionalContextMenuItems(config);
        for (var i = 0; i < additionalItems.length; i++) {
            config.items[0].push(additionalItems[i]);
        }

        Zarafa.plugins.calendarimporter.ui.ContextMenu.superclass.constructor.call(this, config); // redo ... otherwise menu does not get published
    },

    /**
     * Create the Action context menu items.
     * @param {Object} config Configuration object for the {@link Zarafa.plugins.calendarimporter.ui.ContextMenu ContextMenu}
     * @return {Zarafa.core.ui.menu.ConditionalItem[]} The list of Action context menu items
     * @private
     *
     * Note: All handlers are called within the scope of {@link Zarafa.plugins.calendarimporter.ui.ContextMenu HierarchyContextMenu}
     */
    createAdditionalContextMenuItems: function (config) {
        return [{
            xtype: 'menuseparator'
        }, {
            text: dgettext('plugin_calendarimporter', 'Import Calendar'),
            iconCls: 'icon_calendarimporter_import',
            handler: this.onContextItemImport,
            beforeShow: function (item, record) {
                var access = record.get('access') & Zarafa.core.mapi.Access.ACCESS_MODIFY;
                if (!access || (record.isIPMSubTree() && !record.getMAPIStore().isDefaultStore())) {
                    item.setDisabled(true);
                } else {
                    item.setDisabled(false);
                }
            }
        }, {
            text: dgettext('plugin_calendarimporter', 'Export Calendar'),
            iconCls: 'icon_calendarimporter_export',
            handler: this.onContextItemExport,
            beforeShow: function (item, record) {
                var access = record.get('access') & Zarafa.core.mapi.Access.ACCESS_READ;
                if (!access || (record.isIPMSubTree() && !record.getMAPIStore().isDefaultStore())) {
                    item.setDisabled(true);
                } else {
                    item.setDisabled(false);
                }
            }
        }];
    },

    /**
     * Fires on selecting 'Open' menu option from {@link Zarafa.plugins.calendarimporter.ui.ContextMenu ContextMenu}
     * @private
     */
    onContextItemExport: function () {
        var responseHandler = new Zarafa.plugins.calendarimporter.data.ResponseHandler({
            successCallback: Zarafa.plugins.calendarimporter.data.Actions.downloadICS,
            scope: this
        });

        // Notify user
        // # TRANSLATORS: {0} will be replaced by the number of contacts that will be exported
        container.getNotifier().notify('info', dgettext('plugin_contactimporter', 'Calendar Export'), String.format(dgettext('plugin_calendarimporter', 'Exporting {0} events. Please wait...'), this.records.get('content_count')));

        // request attachment preperation
        container.getRequest().singleRequest(
            'calendarmodule',
            'export',
            {
                storeid: this.records.get("store_entryid"),
                folder: this.records.get("entryid")
            },
            responseHandler
        );
    },

    /**
     * Fires on selecting 'Open' menu option from {@link Zarafa.plugins.calendarimporter.ui.ContextMenu ContextMenu}
     * @private
     */
    onContextItemImport: function () {
        var componentType = Zarafa.core.data.SharedComponentType['plugins.calendarimporter.dialogs.importevents'];
        var config = {
            modal: true,
            folder: this.records.get("entryid")
        };

        Zarafa.core.data.UIFactory.openLayerComponent(componentType, undefined, config);
    }
});

Ext.reg('calendarimporter.hierarchycontextmenu', Zarafa.plugins.calendarimporter.ui.ContextMenu);