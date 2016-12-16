/**
 * ImportContentPanel.js, Kopano calender to ics im/exporter
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

/**
 * ImportContentPanel
 *
 * Container for the importpanel.
 */
Ext.namespace("Zarafa.plugins.calendarimporter.dialogs");

/**
 * @class Zarafa.plugins.calendarimporter.dialogs.ImportContentPanel
 * @extends Zarafa.core.ui.ContentPanel
 *
 * The content panel which shows the hierarchy tree of Owncloud account files.
 * @xtype calendarimportercontentpanel
 */
Zarafa.plugins.calendarimporter.dialogs.ImportContentPanel = Ext.extend(Zarafa.core.ui.ContentPanel, {

    /**
     * @constructor
     * @param config Configuration structure
     */
    constructor: function (config) {
        config = config || {};
        Ext.applyIf(config, {
            layout: 'fit',
            title: dgettext('plugin_calendarimporter', 'Import Calendar File'),
            closeOnSave: true,
            width: 800,
            height: 700,
            //Add panel
            items: [
                {
                    xtype: 'calendarimporter.importpanel',
                    filename: config.filename,
                    folder: config.folder
                }
            ]
        });

        Zarafa.plugins.calendarimporter.dialogs.ImportContentPanel.superclass.constructor.call(this, config);
    }

});

Ext.reg('calendarimporter.contentpanel', Zarafa.plugins.calendarimporter.dialogs.ImportContentPanel);