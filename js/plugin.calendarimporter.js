/**
 * plugin.calendarimporter.js, Kopano calender to ics im/exporter
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

Ext.namespace("Zarafa.plugins.calendarimporter");									// Assign the right namespace

Zarafa.plugins.calendarimporter.ImportPlugin = Ext.extend(Zarafa.core.Plugin, {		// create new import plugin

    /**
     * @constructor
     * @param {Object} config Configuration object
     *
     */
    constructor: function (config) {
        config = config || {};

        Zarafa.plugins.calendarimporter.ImportPlugin.superclass.constructor.call(this, config);
    },

    /**
     * initialises insertion point for plugin
     * @protected
     */
    initPlugin: function () {
        Zarafa.plugins.calendarimporter.ImportPlugin.superclass.initPlugin.apply(this, arguments);

        /* our panel */
        Zarafa.core.data.SharedComponentType.addProperty('plugins.calendarimporter.dialogs.importevents');

        /* directly import received icals */
        this.registerInsertionPoint('common.contextmenu.attachment.actions', this.createAttachmentImportButton);

        /* add settings widget */
        this.registerInsertionPoint('context.settings.category.calendar', this.createSettingsWidget);

        /* export a calendar entry via rightclick */
        this.registerInsertionPoint('context.calendar.contextmenu.actions', this.createItemExportInsertionPoint, this);

        /* ical sync stuff */
        if (container.getSettingsModel().get("zarafa/v1/plugins/calendarimporter/enable_sync") === true) {
            /* edit panel */
            Zarafa.core.data.SharedComponentType.addProperty('plugins.calendarimporter.settings.dialogs.calsyncedit');

            /* enable the settings widget */
            this.registerInsertionPoint('context.settings.category.calendar', this.createSettingsCalSyncWidget);
        }
    },

    /**
     * This method hooks to the contact context menu and allows users to export users to vcf.
     *
     * @param include
     * @param btn
     * @returns {Object}
     */
    createItemExportInsertionPoint: function (include, btn) {
        return {
            text: dgettext('plugin_calendarimporter', 'Export Event'),
            handler: this.exportToICS.createDelegate(this, [btn]),
            scope: this,
            iconCls: 'icon_calendarimporter_export'
        };
    },

    /**
     * Generates a request to download the selected records as vCard.
     * @param {Ext.Button} btn
     */
    exportToICS: function (btn) {
        if (btn.records.length == 0) {
            return; // skip if no records where given!
        }

        var recordIds = [];

        for (var i = 0; i < btn.records.length; i++) {
            recordIds.push(btn.records[i].get("entryid"));
        }

        Zarafa.plugins.calendarimporter.data.Actions.exportToICS(btn.records[0].get("store_entryid"), recordIds, undefined);
    },

    /**
     * Creates the button
     *
     * @return {Object} Configuration object for a {@link Ext.Button button}
     *
     */
    createSettingsWidget: function () {
        return [{
            xtype: 'calendarimporter.settingswidget'
        }];
    },

    /**
     * Creates the button
     *
     * @return {Object} Configuration object for a {@link Ext.Button button}
     *
     */
    createSettingsCalSyncWidget: function () {
        return [{
            xtype: 'calendarimporter.settingscalsyncwidget'
        }];
    },

    /**
     * Insert import button in all attachment suggestions

     * @return {Object} Configuration object for a {@link Ext.Button button}
     */
    createAttachmentImportButton: function (include, btn) {
        return {
            text: dgettext('plugin_calendarimporter', 'Import to Calendar'),
            handler: this.getAttachmentFileName.createDelegate(this, [btn]),
            scope: this,
            iconCls: 'icon_calendarimporter_button',
            beforeShow: function (item, record) {
                var extension = record.data.name.split('.').pop().toLowerCase();

                if (record.data.filetype == "text/calendar" || extension == "ics" || extension == "ifb" || extension == "ical" || extension == "ifbf") {
                    item.setVisible(true);
                } else {
                    item.setVisible(false);
                }
            }
        };
    },

    /**
     * Callback for getAttachmentFileName
     */
    gotAttachmentFileName: function (response) {
        if (response.status == true) {
            this.scope.openImportDialog(response.tmpname);
        } else {
            Zarafa.common.dialogs.MessageBox.show({
                title: dgettext('plugin_calendarimporter', 'Error'),
                msg: response["message"],
                icon: Zarafa.common.dialogs.MessageBox.ERROR,
                buttons: Zarafa.common.dialogs.MessageBox.OK
            });
        }
    },

    /**
     * Clickhandler for the button
     */
    getAttachmentFileName: function (btn, callback) {
        Zarafa.common.dialogs.MessageBox.show({
            title: dgettext('plugin_calendarimporter', 'Please wait'),
            msg: dgettext('plugin_calendarimporter', 'Loading attachment...'),
            progressText: dgettext('plugin_calendarimporter', 'Initializing...'),
            width: 300,
            progress: true,
            closable: false
        });

        // progress bar... ;)
        var f = function (v) {
            return function () {
                if (v == 100) {
                    Zarafa.common.dialogs.MessageBox.hide();
                } else {
                    // # TRANSLATORS: {0} will be replaced by the percentage value (0-100)
                    Zarafa.common.dialogs.MessageBox.updateProgress(v / 100, String.format(dgettext('plugin_calendarimporter', '{0}% loaded'), Math.round(v)));
                }
            };
        };

        for (var i = 1; i < 101; i++) {
            setTimeout(f(i), 20 * i);
        }

        /* store the attachment to a temporary folder and prepare it for uploading */
        var attachmentRecord = btn.records;
        var attachmentStore = attachmentRecord.store;

        var store = attachmentStore.getParentRecord().get('store_entryid');
        var entryid = attachmentStore.getAttachmentParentRecordEntryId();
        var attachNum = new Array(1);
        if (attachmentRecord.get('attach_num') != -1) {
            attachNum[0] = attachmentRecord.get('attach_num');
        } else {
            attachNum[0] = attachmentRecord.get('tmpname');
        }
        var dialog_attachments = attachmentStore.getId();
        var filename = attachmentRecord.data.name;

        var responseHandler = new Zarafa.plugins.calendarimporter.data.ResponseHandler({
            successCallback: this.gotAttachmentFileName,
            scope: this
        });

        // request attachment preperation
        container.getRequest().singleRequest(
            'calendarmodule',
            'importattachment',
            {
                entryid: entryid,
                store: store,
                attachNum: attachNum,
                dialog_attachments: dialog_attachments,
                filename: filename
            },
            responseHandler
        );
    },

    /**
     * Open the import dialog.
     * @param {String} filename
     */
    openImportDialog: function (filename) {
        var componentType = Zarafa.core.data.SharedComponentType['plugins.calendarimporter.dialogs.importevents'];
        var config = {
            filename: filename,
            modal: true
        };

        Zarafa.core.data.UIFactory.openLayerComponent(componentType, undefined, config);
    },

    /**
     * Bid for the type of shared component
     * and the given record.
     * This will bid on calendar.dialogs.importevents
     * @param {Zarafa.core.data.SharedComponentType} type Type of component a context can bid for.
     * @param {Ext.data.Record} record Optionally passed record.
     * @return {Number} The bid for the shared component
     */
    bidSharedComponent: function (type, record) {
        var bid = -1;
        switch (type) {
            case Zarafa.core.data.SharedComponentType['plugins.calendarimporter.dialogs.importevents']:
                bid = 2;
                break;
            case Zarafa.core.data.SharedComponentType['plugins.calendarimporter.settings.dialogs.calsyncedit']:
                bid = 2;
                break;
            case Zarafa.core.data.SharedComponentType['common.contextmenu']:
                if (record instanceof Zarafa.core.data.MAPIRecord) {
                    if (record.get('object_type') == Zarafa.core.mapi.ObjectType.MAPI_FOLDER && record.get('container_class') == "IPF.Appointment") {
                        bid = 2;
                    }
                }
                break;
        }
        return bid;
    },

    /**
     * Will return the reference to the shared component.
     * Based on the type of component requested a component is returned.
     * @param {Zarafa.core.data.SharedComponentType} type Type of component a context can bid for.
     * @param {Ext.data.Record} record Optionally passed record.
     * @return {Ext.Component} Component
     */
    getSharedComponent: function (type, record) {
        var component;
        switch (type) {
            case Zarafa.core.data.SharedComponentType['plugins.calendarimporter.dialogs.importevents']:
                component = Zarafa.plugins.calendarimporter.dialogs.ImportContentPanel;
                break;
            case Zarafa.core.data.SharedComponentType['plugins.calendarimporter.settings.dialogs.calsyncedit']:
                component = Zarafa.plugins.calendarimporter.settings.dialogs.CalSyncEditContentPanel;
                break;
            case Zarafa.core.data.SharedComponentType['common.contextmenu']:
                component = Zarafa.plugins.calendarimporter.ui.ContextMenu;
                break;
        }

        return component;
    }
});


/*############################################################################################################################*
 * STARTUP 
 *############################################################################################################################*/
Zarafa.onReady(function () {
    container.registerPlugin(new Zarafa.core.PluginMetaData({
        name: 'calendarimporter',
        displayName: dgettext('plugin_calendarimporter', 'Calendarimporter Plugin'),
        about: Zarafa.plugins.calendarimporter.ABOUT,
        pluginConstructor: Zarafa.plugins.calendarimporter.ImportPlugin
    }));
});
