/**
 * Actions.js zarafa calender to ics im/exporter
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
	 * Callback for the export request.
	 * @param {Object} response
	 */
	downloadICS: function (response) {
		if (response.status == false) {
			Zarafa.common.dialogs.MessageBox.show({
				title  : dgettext('plugin_files', 'Warning'),
				msg    : dgettext('plugin_files', response.message),
				icon   : Zarafa.common.dialogs.MessageBox.WARNING,
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
	}
};