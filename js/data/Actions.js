/**
 * Actions.js zarafa calender to ics im/exporter
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

/**
 * ResponseHandler
 *
 * This class handles all responses from the php backend
 */
Ext.namespace('Zarafa.plugins.calendarimporter.data');

/**
 * @class Zarafa.plugins.calendarimporter.data.Actions
 * Common actions which can be used within {@link Ext.Button buttons}
 * or other {@link Ext.Component components} with action handlers.
 * @singleton
 */
Zarafa.plugins.calendarimporter.data.Actions = {
    /**
     * Generates a request to download the selected records as vCard.
     *
     * @param storeId
     * @param recordIds
     */
    exportToICS: function (storeId, recordIds, recordFolder) {
        if ((typeof recordIds != "undefined" && recordIds.length < 1) || (typeof recordFolder != "undefined" && recordFolder.get('content_count') < 1)) {
            Zarafa.common.dialogs.MessageBox.show({
                title: dgettext('plugin_calendarimporter', 'Error'),
                msg: dgettext('plugin_calendarimporter', 'No events found. Export skipped!'),
                icon: Zarafa.common.dialogs.MessageBox.ERROR,
                buttons: Zarafa.common.dialogs.MessageBox.OK
            });
        } else {

            var responseHandler = new Zarafa.plugins.calendarimporter.data.ResponseHandler({
                successCallback: Zarafa.plugins.calendarimporter.data.Actions.downloadICS
            });

            var recordcount = 0;
            var exportPayload = {
                storeid: storeId,
                records: undefined,
                folder: undefined
            };

            if (typeof recordIds != "undefined") {
                exportPayload.records = recordIds;
                recordcount = recordIds.length;
            }

            if (typeof recordFolder != "undefined") {
                exportPayload.folder = recordFolder.get("entryid");
                recordcount = recordFolder.get('content_count');
            }

            // Notify user
            // # TRANSLATORS: {0} will be replaced by the number of contacts that will be exported
            container.getNotifier().notify('info', dgettext('plugin_contactimporter', 'Calendar Export'), String.format(dgettext('plugin_calendarimporter', 'Exporting {0} events. Please wait...'), recordcount));


            // request attachment preperation
            container.getRequest().singleRequest(
                'calendarmodule',
                'export',
                exportPayload,
                responseHandler
            );
        }
    },

    /**
     * Callback for the export request.
     * @param {Object} response
     */
    downloadICS: function (response) {
        if (response.status == false) {
            Zarafa.common.dialogs.MessageBox.show({
                title: dgettext('plugin_calendarimporter', 'Warning'),
                msg: response.message,
                icon: Zarafa.common.dialogs.MessageBox.WARNING,
                buttons: Zarafa.common.dialogs.MessageBox.OK
            });
        } else {
            var downloadFrame = Ext.getBody().createChild({
                tag: 'iframe',
                cls: 'x-hidden'
            });

            var url = document.URL;
            var link = url.substring(0, url.lastIndexOf('/') + 1);

            link += "index.php?sessionid=" + container.getUser().getSessionId() + "&load=custom&name=download_ics";
            link = Ext.urlAppend(link, "token=" + encodeURIComponent(response.download_token));
            link = Ext.urlAppend(link, "filename=" + encodeURIComponent(response.filename));

            downloadFrame.dom.contentWindow.location = link;
        }
    },

    /**
     * Get all calendar folders.
     * @param {boolean} asDropdownStore If true, a simple array store will be returned.
     * @returns {*}
     */
    getAllCalendarFolders: function (asDropdownStore) {
        asDropdownStore = Ext.isEmpty(asDropdownStore) ? false : asDropdownStore;

        var allFolders = [];

        var inbox = container.getHierarchyStore().getDefaultStore();
        var pub = container.getHierarchyStore().getPublicStore();

        if (!Ext.isEmpty(inbox) && !Ext.isEmpty(inbox.subStores)) {
            for (var i = 0; i < inbox.subStores.folders.totalLength; i++) {
                var folder = inbox.subStores.folders.getAt(i);
                if (!Ext.isEmpty(folder) && folder.get("container_class") == "IPF.Appointment") {
                    if (asDropdownStore) {
                        allFolders.push([
                            folder.get("entryid"),
                            folder.get("display_name")
                        ]);
                    } else {
                        allFolders.push({
                            display_name: folder.get("display_name"),
                            entryid: folder.get("entryid"),
                            store_entryid: folder.get("store_entryid"),
                            is_public: false
                        });
                    }
                }
            }
        }

        if (!Ext.isEmpty(pub) && !Ext.isEmpty(pub.subStores)) {
            for (var j = 0; j < pub.subStores.folders.totalLength; j++) {
                var folder = pub.subStores.folders.getAt(j);
                if (!Ext.isEmpty(folder) && folder.get("container_class") == "IPF.Appointment") {
                    if (asDropdownStore) {
                        allFolders.push([
                            folder.get("entryid"),
                            folder.get("display_name") + " (Public)"
                        ]);
                    } else {
                        allFolders.push({
                            display_name: folder.get("display_name"),
                            entryid: folder.get("entryid"),
                            store_entryid: folder.get("store_entryid"),
                            is_public: true
                        });
                    }
                }
            }
        }

        if (asDropdownStore) {
            return allFolders.sort(Zarafa.plugins.calendarimporter.data.Actions.dynamicSort(1));
        } else {
            return allFolders;
        }
    },

    /**
     * Return a calendar folder element by name.
     * @param {string} name
     * @returns {*}
     */
    getCalendarFolderByName: function (name) {
        var folders = Zarafa.plugins.calendarimporter.data.Actions.getAllCalendarFolders(false);

        for (var i = 0; i < folders.length; i++) {
            if (folders[i].display_name == name) {
                return folders[i];
            }
        }

        return container.getHierarchyStore().getDefaultFolder('calendar');
    },

    /**
     * Return a calendar folder element by entryid.
     * @param {string} entryid
     * @returns {*}
     */
    getCalendarFolderByEntryid: function (entryid) {
        var folders = Zarafa.plugins.calendarimporter.data.Actions.getAllCalendarFolders(false);

        for (var i = 0; i < folders.length; i++) {
            if (folders[i].entryid == entryid) {
                return folders[i];
            }
        }

        return container.getHierarchyStore().getDefaultFolder('calendar');
    },

    /**
     * Dynamic sort function, sorts by property name.
     * @param {string|int} property
     * @returns {Function}
     */
    dynamicSort: function (property) {
        var sortOrder = 1;
        if (property[0] === "-") {
            sortOrder = -1;
            property = property.substr(1);
        }
        return function (a, b) {
            var result = (a[property].toLowerCase() < b[property].toLowerCase()) ? -1 : (a[property].toLowerCase() > b[property].toLowerCase()) ? 1 : 0;
            return result * sortOrder;
        }
    }
};
