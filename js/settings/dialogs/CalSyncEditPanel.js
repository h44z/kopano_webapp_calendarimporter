/**
 * CalSyncEditPanel.js, Kopano calender to ics im/exporter
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

Ext.namespace('Zarafa.plugins.calendarimporter.settings.dialogs');

/**
 * @class Zarafa.plugins.calendarimporter.settings.dialogs.CalSyncEditPanel
 * @extends Ext.form.FormPanel
 * @xtype calendarimporter.calsynceditpanel
 *
 * Will generate UI for {@link Zarafa.plugins.calendarimporter.settings.dialogs.CalSyncEditPanel CalSyncEditPanel}.
 */
Zarafa.plugins.calendarimporter.settings.dialogs.CalSyncEditPanel = Ext.extend(Ext.form.FormPanel, {

    /**
     * the id of the currently edited item
     */
    currentItem: undefined,

    /**
     * @constructor
     * @param config Configuration structure
     */
    constructor: function (config) {
        config = config || {};

        if (config.item)
            this.currentItem = config.item;

        Ext.applyIf(config, {
            // Override from Ext.Component
            xtype: 'calendarimporter.calsynceditpanel',
            labelAlign: 'top',
            defaultType: 'textfield',
            items: this.createPanelItems(config),
            buttons: [{
                text: _('Save'),
                handler: this.doSave,
                scope: this
            },
                {
                    text: _('Cancel'),
                    handler: this.doClose,
                    scope: this
                }]
        });

        Zarafa.plugins.calendarimporter.settings.dialogs.CalSyncEditPanel.superclass.constructor.call(this, config);
    },

    /**
     * close the dialog
     */
    doClose: function () {
        this.dialog.close();
    },

    /**
     * save the data to the store
     */
    doSave: function () {
        var store = this.dialog.store;
        var id = 0;
        var record = undefined;

        if (!this.currentItem) {
            record = new store.recordType({
                id: this.hashCode(this.icsurl.getValue()),
                icsurl: this.icsurl.getValue(),
                intervall: this.intervall.getValue(),
                user: this.user.getValue(),
                pass: Ext.util.base64.encode(this.pass.getValue()),
                calendar: this.calendar.getValue(),
                calendarname: Zarafa.plugins.calendarimporter.data.Actions.getCalendarFolderByEntryid(this.calendar.getValue()).display_name,
                lastsync: "never"
            });
        }

        if (this.icsurl.isValid()) {
            if (record) {
                store.add(record);
            } else {
                this.currentItem.set('icsurl', this.icsurl.getValue());
                this.currentItem.set('intervall', this.intervall.getValue());
                this.currentItem.set('user', this.user.getValue());
                this.currentItem.set('pass', Ext.util.base64.encode(this.pass.getValue()));
                this.currentItem.set('calendar', this.calendar.getValue());
                this.currentItem.set('calendarname', Zarafa.plugins.calendarimporter.data.Actions.getCalendarFolderByEntryid(this.calendar.getValue()).display_name);
            }
            this.dialog.close();
        }
    },

    /**
     * Function will create panel items for {@link Zarafa.plugins.calendarimporter.settings.dialogs.CalSyncEditPanel CalSyncEditPanel}
     * @return {Array} array of items that should be added to panel.
     * @private
     */
    createPanelItems: function (config) {
        var icsurl = "";
        var intervall = "15";
        var user = "";
        var pass = "";
        var calendarname = "";
        var calendar = Zarafa.plugins.calendarimporter.data.Actions.getCalendarFolderByName(container.getSettingsModel().get("zarafa/v1/plugins/calendarimporter/default_calendar")).entryid;
        var myStore = Zarafa.plugins.calendarimporter.data.Actions.getAllCalendarFolders(true);

        if (config.item) {
            icsurl = config.item.get('icsurl');
            intervall = config.item.get('intervall');
            user = config.item.get('user');
            pass = Ext.util.base64.decode(config.item.get('pass'));
            calendar = config.item.get('calendar');
            calendarname = config.item.get('calendarname');
        }


        return [{
            xtype: 'fieldset',
            title: dgettext('plugin_calendarimporter', 'ICAL Information'),
            defaultType: 'textfield',
            layout: 'form',
            flex: 1,
            defaults: {
                anchor: '100%',
                flex: 1
            },
            items: [{
                fieldLabel: dgettext('plugin_calendarimporter', 'ICS Url'),
                name: 'icsurl',
                ref: '../icsurl',
                value: icsurl,
                allowBlank: false
            },
                {
                    xtype: 'selectbox',
                    fieldLabel: dgettext('plugin_calendarimporter', 'Destination Calendar'),
                    name: 'calendar',
                    ref: '../calendar',
                    value: calendar,
                    editable: false,
                    store: myStore,
                    mode: 'local',
                    labelSeperator: ":",
                    border: false,
                    anchor: "100%",
                    scope: this,
                    allowBlank: false
                },
                {
                    xtype: 'numberfield',
                    fieldLabel: dgettext('plugin_calendarimporter', 'Sync Intervall (minutes)'),
                    name: 'intervall',
                    ref: '../intervall',
                    value: intervall,
                    allowBlank: false
                }]
        },
            {
                xtype: 'fieldset',
                title: dgettext('plugin_calendarimporter', 'Authentication (optional)'),
                defaultType: 'textfield',
                layout: 'form',
                defaults: {
                    anchor: '100%'
                },
                items: [{
                    fieldLabel: dgettext('plugin_calendarimporter', 'Username'),
                    name: 'user',
                    ref: '../user',
                    value: user,
                    allowBlank: true
                },
                    {
                        fieldLabel: dgettext('plugin_calendarimporter', 'Password'),
                        name: 'pass',
                        ref: '../pass',
                        value: pass,
                        inputType: 'password',
                        allowBlank: true
                    }]
            }];
    },

    /**
     * Java String.hashCode() implementation
     * @private
     */
    hashCode: function (str) {
        var hash = 0;
        var chr = 0;
        var i = 0;

        if (str.length == 0) return hash;
        for (i = 0; i < str.length; i++) {
            chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }
});

Ext.reg('calendarimporter.calsynceditpanel', Zarafa.plugins.calendarimporter.settings.dialogs.CalSyncEditPanel);
