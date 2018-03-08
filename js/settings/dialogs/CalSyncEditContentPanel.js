/**
 * CalSyncEditContentPanel.js, Kopano calender to ics im/exporter
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

Ext.namespace('Zarafa.plugins.calendarimporter.settings.dialogs');

/**
 * @class Zarafa.plugins.calendarimporter.settings.dialogs.CalSyncEditContentPanel
 * @extends Zarafa.core.ui.ContentPanel
 * @xtype calendarimporter.calsynceditcontentpanel
 *
 * {@link Zarafa.plugins.calendarimporter.settings.dialogs.CalSyncEditContentPanel CalSyncEditContentPanel} will be used to edit ics sync entries.
 */
Zarafa.plugins.calendarimporter.settings.dialogs.CalSyncEditContentPanel = Ext.extend(Zarafa.core.ui.ContentPanel, {
    /**
     * @constructor
     * @param config Configuration structure
     */
    constructor: function (config) {
        config = config || {};

        // Add in some standard configuration data.
        Ext.applyIf(config, {
            // Override from Ext.Component
            xtype: 'calendarimporter.calsynceditcontentpanel',
            layout: 'fit',
            model: true,
            autoSave: false,
            width: 400,
            height: 400,
            title: dgettext('plugin_calendarimporter', 'ICAL Sync'),
            items: [{
                xtype: 'calendarimporter.calsynceditpanel',
                item: config.item
            }]
        });

        Zarafa.plugins.calendarimporter.settings.dialogs.CalSyncEditContentPanel.superclass.constructor.call(this, config);
    }
});

Ext.reg('calendarimporter.calsynceditcontentpanel', Zarafa.plugins.calendarimporter.settings.dialogs.CalSyncEditContentPanel);
