/**
 * SettingsCalSyncWidget.js, Kopano calender to ics im/exporter
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

Ext.namespace('Zarafa.plugins.calendarimporter.settings');

/**
 * @class Zarafa.plugins.calendarimporter.settings.SettingsCalSyncWidget
 * @extends Zarafa.settings.ui.SettingsWidget
 * @xtype calendarimporter.settingscalsyncwidget
 *
 */
Zarafa.plugins.calendarimporter.settings.SettingsCalSyncWidget = Ext.extend(Zarafa.settings.ui.SettingsWidget, {
    /**
     * @cfg {Zarafa.settings.SettingsContext} settingsContext
     */
    settingsContext: undefined,

    /**
     * @constructor
     * @param {Object} config Configuration object
     */
    constructor: function (config) {
        config = config || {};

        var store = new Ext.data.JsonStore({
            fields: [
                {name: 'id', type: 'int'},
                {name: 'icsurl'},
                {name: 'user'},
                {name: 'pass'},
                {name: 'intervall', type: 'int'},
                {name: 'calendar'},
                {name: 'calendarname'},
                {name: 'lastsync'}
            ],
            sortInfo: {
                field: 'id',
                direction: 'ASC'
            },
            autoDestroy: true
        });

        Ext.applyIf(config, {
            height: 400,
            title: dgettext('plugin_calendarimporter', 'Calendar Sync settings'),
            xtype: 'calendarimporter.settingscalsyncwidget',
            layout: {
                // override from SettingsWidget
                type: 'fit'
            },
            items: [{
                xtype: 'calendarimporter.calsyncpanel',
                store: store,
                ref: 'calsyncPanel'
            }]
        });

        Zarafa.plugins.calendarimporter.settings.SettingsCalSyncWidget.superclass.constructor.call(this, config);
    },

    /**
     * Called by the {@link Zarafa.settings.ui.SettingsCategory Category} when
     * it has been called with {@link zarafa.settings.ui.SettingsCategory#update}.
     * This is used to load the latest version of the settings from the
     * {@link Zarafa.settings.SettingsModel} into the UI of this category.
     * @param {Zarafa.settings.SettingsModel} settingsModel The settings to load
     */
    update: function (settingsModel) {
        this.model = settingsModel;

        // Convert the signatures into Store data
        var icslinks = settingsModel.get('zarafa/v1/contexts/calendar/icssync', true);
        var syncArray = [];
        for (var key in icslinks) {
            if (icslinks.hasOwnProperty(key)) { // skip inherited props
                syncArray.push(Ext.apply({}, icslinks[key], {id: key}));
            }
        }

        // Load all icslinks into the GridPanel
        var store = this.calsyncPanel.calsyncGrid.getStore();
        store.loadData(syncArray);
    },

    /**
     * Called by the {@link Zarafa.settings.ui.SettingsCategory Category} when
     * it has been called with {@link zarafa.settings.ui.SettingsCategory#updateSettings}.
     * This is used to update the settings from the UI into the {@link Zarafa.settings.SettingsModel settings model}.
     * @param {Zarafa.settings.SettingsModel} settingsModel The settings to update
     */
    updateSettings: function (settingsModel) {
        settingsModel.beginEdit();

        // Start reading the Grid store and convert the contents back into
        // an object which can be pushed to the settings.
        var icslinks = this.calsyncPanel.calsyncGrid.getStore().getRange();
        var icslinkData = {};
        for (var i = 0, len = icslinks.length; i < len; i++) {
            var icslink = icslinks[i];

            icslinkData[icslink.get('id')] = {
                'icsurl': icslink.get('icsurl'),
                'intervall': icslink.get('intervall'),
                'user': icslink.get('user'),
                'pass': icslink.get('pass'),
                'lastsync': icslink.get('lastsync'),
                'calendar': icslink.get('calendar'),
                'calendarname': Zarafa.plugins.calendarimporter.data.Actions.getCalendarFolderByEntryid(icslink.get('calendar')).display_name
            };
        }
        settingsModel.set('zarafa/v1/contexts/calendar/icssync', icslinkData);

        settingsModel.endEdit();
    }
});

Ext.reg('calendarimporter.settingscalsyncwidget', Zarafa.plugins.calendarimporter.settings.SettingsCalSyncWidget);