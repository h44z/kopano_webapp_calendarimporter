/**
 * ImportPanel.js, Kopano calender to ics im/exporter
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
 * ImportPanel
 *
 * The main Panel of the calendarimporter plugin.
 */
Ext.namespace("Zarafa.plugins.calendarimporter.dialogs");

/**
 * @class Zarafa.plugins.calendarimporter.dialogs.ImportPanel
 * @extends Ext.Panel
 */
Zarafa.plugins.calendarimporter.dialogs.ImportPanel = Ext.extend(Ext.Panel, {

    /* store the imported timezone here... */
    timezone: null,

    /* ignore daylight saving time... */
    ignoredst: null,

    /* path to ics file on server... */
    icsfile: null,

    /* loadmask for timezone/dst changes... */
    loadMask: null,

    /* export event buffer */
    exportResponse: [],

    /* how many requests are still running? */
    runningRequests: null,

    /* The store for the selection grid */
    store: null,

    /* selected folder */
    folder: null,

    /**
     * @constructor
     * @param {object} config
     */
    constructor: function (config) {
        config = config || {};
        var self = this;
        this.timezone = container.getSettingsModel().get("zarafa/v1/plugins/calendarimporter/default_timezone");

        if (!Ext.isEmpty(config.filename)) {
            this.icsfile = config.filename;
        }

        if (!Ext.isEmpty(config.folder)) {
            this.folder = config.folder;
        }

        // create the data store
        this.store = new Ext.data.ArrayStore({
            fields: [
                {name: 'subject'},
                {name: 'startdate'},
                {name: 'enddate'},
                {name: 'location'},
                {name: 'body'},
                {name: 'priority'},
                {name: 'label'},
                {name: 'busy'},
                {name: 'class'},
                {name: 'organizer'},
                {name: 'alarms'},
                {name: 'timezone'},
                {name: 'record'}
            ]
        });

        Ext.apply(config, {
            xtype: 'calendarimporter.importpanel',
            ref: "importpanel",
            id: "importpanel",
            layout: {
                type: 'form',
                align: 'stretch'
            },
            anchor: '100%',
            bodyStyle: 'background-color: inherit;',
            defaults: {
                border: true,
                bodyStyle: 'background-color: inherit; padding: 3px 0px 3px 0px; border-style: none none solid none;'
            },
            items: [
                this.createSelectBox(),
                this.createTimezoneBox(),
                this.createDaylightSavingCheckBox(),
                this.initForm(),
                this.createGrid()
            ],
            buttons: [
                this.createSubmitAllButton(),
                this.createSubmitButton(),
                this.createCancelButton()
            ],
            listeners: {
                afterrender: function (cmp) {
                    this.loadMask = new Ext.LoadMask(this.getEl(), {msg: dgettext('plugin_calendarimporter', 'Loading...')});

                    if (this.icsfile != null) { // if we have got the filename from an attachment
                        this.parseCalendar(this.icsfile, this.timezone, this.ignoredst);
                    }
                },
                scope: this
            }
        });

        Zarafa.plugins.calendarimporter.dialogs.ImportPanel.superclass.constructor.call(this, config);
    },

    /**
     * Init embedded form, this is the form that is
     * posted and contains the attachments
     * @private
     */
    initForm: function () {
        return {
            xtype: 'form',
            ref: 'addFormPanel',
            layout: 'column',
            fileUpload: true,
            autoWidth: true,
            autoHeight: true,
            border: false,
            bodyStyle: 'padding: 5px;',
            defaults: {
                anchor: '95%',
                border: false,
                bodyStyle: 'padding: 5px;'
            },
            items: [this.createUploadField()]
        };
    },

    /**
     * Reloads the data of the grid
     * @private
     */
    reloadGridStore: function (eventdata) {
        var parsedData = [];

        if (eventdata !== null) {
            parsedData = new Array(eventdata.events.length);
            var i = 0;
            for (i = 0; i < eventdata.events.length; i++) {
                parsedData[i] = [
                    eventdata.events[i]["subject"],
                    new Date(parseInt(eventdata.events[i]["startdate"]) * 1000),
                    new Date(parseInt(eventdata.events[i]["duedate"]) * 1000),
                    eventdata.events[i]["location"],
                    eventdata.events[i]["body"],
                    eventdata.events[i]["priority"],
                    eventdata.events[i]["label"],
                    eventdata.events[i]["busystatus"],
                    eventdata.events[i]["private"],
                    eventdata.events[i]["organizer"],
                    eventdata.events[i]["alarms"],
                    eventdata.events[i]["timezone"],
                    eventdata.events[i]
                ];
            }
        } else {
            return null;
        }

        this.store.loadData(parsedData, false);
    },

    /**
     * Init embedded form, this is the form that is
     * posted and contains the attachments
     * @private
     */
    createGrid: function () {
        return {
            xtype: 'grid',
            ref: 'eventgrid',
            id: 'eventgrid',
            columnWidth: 1.0,
            store: this.store,
            width: '100%',
            height: 300,
            title: dgettext('plugin_calendarimporter', 'Select events to import'),
            frame: false,
            viewConfig: {
                forceFit: true
            },
            colModel: new Ext.grid.ColumnModel({
                defaults: {
                    width: 300,
                    sortable: true
                },
                columns: [
                    {
                        id: 'Summary',
                        header: dgettext('plugin_calendarimporter', 'Title'),
                        width: 200,
                        sortable: true,
                        dataIndex: 'subject'
                    },
                    {
                        header: dgettext('plugin_calendarimporter', 'Start'),
                        width: 200,
                        sortable: true,
                        dataIndex: 'startdate',
                        renderer: Zarafa.common.ui.grid.Renderers.datetime
                    },
                    {
                        header: dgettext('plugin_calendarimporter', 'End'),
                        width: 200,
                        sortable: true,
                        dataIndex: 'enddate',
                        renderer: Zarafa.common.ui.grid.Renderers.datetime
                    },
                    {
                        header: dgettext('plugin_calendarimporter', 'Location'),
                        width: 150,
                        sortable: true,
                        dataIndex: 'location'
                    },
                    {header: dgettext('plugin_calendarimporter', 'Description'), sortable: true, dataIndex: 'body'},
                    {header: dgettext('plugin_calendarimporter', 'Priority'), dataIndex: 'priority', hidden: true},
                    {header: dgettext('plugin_calendarimporter', 'Label'), dataIndex: 'label', hidden: true},
                    {header: dgettext('plugin_calendarimporter', 'Busystatus'), dataIndex: 'busy', hidden: true},
                    {header: dgettext('plugin_calendarimporter', 'Privacystatus'), dataIndex: 'class', hidden: true},
                    {header: dgettext('plugin_calendarimporter', 'Organizer'), dataIndex: 'organizer', hidden: true},
                    {
                        header: dgettext('plugin_calendarimporter', 'Alarm'),
                        dataIndex: 'alarms',
                        hidden: true,
                        renderer: Zarafa.common.ui.grid.Renderers.datetime
                    },
                    {header: dgettext('plugin_calendarimporter', 'Timezone'), dataIndex: 'timezone', hidden: true}
                ]
            }),
            sm: new Ext.grid.RowSelectionModel({multiSelect: true})
        }
    },

    createSelectBox: function () {
        var myStore = Zarafa.plugins.calendarimporter.data.Actions.getAllCalendarFolders(true);

        return {
            xtype: "selectbox",
            ref: 'calendarselector',
            editable: false,
            name: "choosen_calendar",
            value: Ext.isEmpty(this.folder) ? Zarafa.plugins.calendarimporter.data.Actions.getCalendarFolderByName(container.getSettingsModel().get("zarafa/v1/plugins/calendarimporter/default_calendar")).entryid : this.folder,
            width: 100,
            fieldLabel: dgettext('plugin_calendarimporter', 'Select folder'),
            store: myStore,
            mode: 'local',
            labelSeperator: ":",
            border: false,
            anchor: "100%",
            scope: this,
            hidden: Ext.isEmpty(this.folder) ? false : true,
            allowBlank: false
        }
    },

    createTimezoneBox: function () {
        return {
            xtype: "selectbox",
            ref: 'timezoneselector',
            editable: false,
            name: "choosen_timezone",
            value: Zarafa.plugins.calendarimporter.data.Timezones.unMap(container.getSettingsModel().get("zarafa/v1/plugins/calendarimporter/default_timezone")),
            width: 100,
            fieldLabel: dgettext('plugin_calendarimporter', 'Timezone'),
            store: Zarafa.plugins.calendarimporter.data.Timezones.store,
            labelSeperator: ":",
            mode: 'local',
            border: false,
            anchor: "100%",
            scope: this,
            allowBlank: true,
            listeners: {
                select: this.onTimezoneSelected,
                scope: this
            }
        }
    },

    createDaylightSavingCheckBox: function () {
        return {
            xtype: "checkbox",
            ref: 'dstcheck',
            name: "dst_check",
            width: 100,
            fieldLabel: dgettext('plugin_calendarimporter', 'Ignore DST'),
            boxLabel: dgettext('plugin_calendarimporter', 'This will ignore "Daylight saving time" offsets.'),
            labelSeperator: ":",
            border: false,
            anchor: "100%",
            scope: this,
            allowBlank: true,
            listeners: {
                check: this.onDstChecked,
                scope: this
            }
        }
    },

    createUploadField: function () {
        return {
            xtype: "fileuploadfield",
            ref: 'fileuploadfield',
            columnWidth: 1.0,
            id: 'form-file',
            name: 'icsdata',
            emptyText: dgettext('plugin_calendarimporter', 'Select an .ics calendar'),
            border: false,
            anchor: "100%",
            height: "30",
            scope: this,
            allowBlank: false,
            listeners: {
                fileselected: this.onFileSelected,
                scope: this
            }
        }
    },

    createSubmitButton: function () {
        return {
            xtype: "button",
            ref: "../submitButton",
            disabled: true,
            width: 100,
            border: false,
            text: dgettext('plugin_calendarimporter', 'Import'),
            anchor: "100%",
            handler: this.importCheckedEvents,
            scope: this
        }
    },

    createSubmitAllButton: function () {
        return {
            xtype: "button",
            ref: "../submitAllButton",
            disabled: true,
            width: 100,
            border: false,
            text: dgettext('plugin_calendarimporter', 'Import All'),
            anchor: "100%",
            handler: this.importAllEvents,
            scope: this
        }
    },

    createCancelButton: function () {
        return {
            xtype: "button",
            width: 100,
            border: false,
            text: dgettext('plugin_calendarimporter', 'Cancel'),
            anchor: "100%",
            handler: this.close,
            scope: this
        }
    },

    /**
     * This is called when a timezone has been seleceted in the timezone dialog
     * @param {Ext.form.ComboBox} combo
     * @param {Ext.data.Record} record
     * @param {Number} index
     */
    onTimezoneSelected: function (combo, record, index) {
        this.timezone = record.data.field1;

        if (this.icsfile != null) {
            this.parseCalendar(this.icsfile, this.timezone, this.ignoredst);
        }
    },

    /**
     * This is called when the dst checkbox has been selected
     * @param {Ext.form.CheckBox} checkbox
     * @param {boolean} checked
     */
    onDstChecked: function (checkbox, checked) {
        this.ignoredst = checked;

        if (this.icsfile != null) {
            this.parseCalendar(this.icsfile, this.timezone, this.ignoredst);
        }
    },

    /**
     * This is called when a file has been seleceted in the file dialog
     * in the {@link Ext.ux.form.FileUploadField} and the dialog is closed
     * @param {Ext.ux.form.FileUploadField} uploadField being added a file to
     */
    onFileSelected: function (uploadField) {
        var form = this.addFormPanel.getForm();

        if (form.isValid()) {
            form.submit({
                waitMsg: dgettext('plugin_calendarimporter', 'Uploading and parsing calendar...'),
                url: 'plugins/calendarimporter/php/upload.php',
                failure: function (file, action) {
                    this.submitButton.disable();
                    this.submitAllButton.disable();
                    Zarafa.common.dialogs.MessageBox.show({
                        title: _('Error'),
                        msg: _(action.result.error),
                        icon: Zarafa.common.dialogs.MessageBox.ERROR,
                        buttons: Zarafa.common.dialogs.MessageBox.OK
                    });
                },
                success: function (file, action) {
                    uploadField.reset();
                    this.icsfile = action.result.ics_file;

                    this.parseCalendar(this.icsfile, this.timezone, this.ignoredst);
                },
                scope: this
            });
        }
    },

    parseCalendar: function (icsPath, timezone, ignoredst) {
        this.loadMask.show();

        var responseHandler = new Zarafa.plugins.calendarimporter.data.ResponseHandler({
            successCallback: this.handleParsingResult,
            scope: this
        });

        container.getRequest().singleRequest(
            'calendarmodule',
            'load',
            {
                ics_filepath: icsPath,
                timezone: timezone,
                ignore_dst: ignoredst
            },
            responseHandler
        );
    },

    handleParsingResult: function (response) {
        var self = this.scope;

        self.loadMask.hide();

        if (response["status"] == true) {
            self.submitButton.enable();
            self.submitAllButton.enable();

            if (typeof response.parsed.calendar["X-WR-TIMEZONE"] !== "undefined") {
                self.timezone = response.parsed.calendar["X-WR-TIMEZONE"];
                self.timezoneselector.setValue(Zarafa.plugins.calendarimporter.data.Timezones.unMap(this.timezone));
            }
            self.reloadGridStore(response.parsed);
        } else {
            self.submitButton.disable();
            self.submitAllButton.disable();
            Zarafa.common.dialogs.MessageBox.show({
                title: dgettext('plugin_calendarimporter', 'Parser Error'),
                msg: response["message"],
                icon: Zarafa.common.dialogs.MessageBox.ERROR,
                buttons: Zarafa.common.dialogs.MessageBox.OK
            });
        }
    },

    close: function () {
        this.addFormPanel.getForm().reset();
        this.dialog.close()
    },

    importCheckedEvents: function () {
        var newRecords = this.eventgrid.selModel.getSelections();
        this.importEvents(newRecords);
    },

    importAllEvents: function () {
        //receive Records from grid rows
        this.eventgrid.selModel.selectAll();  // select all entries
        var newRecords = this.eventgrid.selModel.getSelections();
        this.importEvents(newRecords);
    },

    /**
     * This function stores all given events to the appointmentstore
     * @param events
     */
    importEvents: function (events) {
        //receive existing calendar store
        var calValue = this.calendarselector.getValue();

        if (Ext.isEmpty(calValue)) { // no calendar choosen
            Zarafa.common.dialogs.MessageBox.show({
                title: dgettext('plugin_calendarimporter', 'Error'),
                msg: dgettext('plugin_calendarimporter', 'You have to choose a calendar!'),
                icon: Zarafa.common.dialogs.MessageBox.ERROR,
                buttons: Zarafa.common.dialogs.MessageBox.OK
            });
        } else {
            if (this.eventgrid.selModel.getCount() < 1) {
                Zarafa.common.dialogs.MessageBox.show({
                    title: dgettext('plugin_calendarimporter', 'Error'),
                    msg: dgettext('plugin_calendarimporter', 'You have to choose at least one event to import!'),
                    icon: Zarafa.common.dialogs.MessageBox.ERROR,
                    buttons: Zarafa.common.dialogs.MessageBox.OK
                });
            } else {
                var calendarFolder = Zarafa.plugins.calendarimporter.data.Actions.getCalendarFolderByEntryid(calValue);

                this.loadMask.show();
                var uids = [];

                //receive Records from grid rows
                Ext.each(events, function (newRecord) {
                    uids.push(newRecord.data.record.internal_fields.event_uid);
                }, this);

                var responseHandler = new Zarafa.plugins.calendarimporter.data.ResponseHandler({
                    successCallback: this.importEventsDone,
                    scope: this
                });

                container.getRequest().singleRequest(
                    'calendarmodule',
                    'import',
                    {
                        storeid: calendarFolder.store_entryid,
                        folderid: calendarFolder.entryid,
                        uids: uids,
                        ics_filepath: this.icsfile
                    },
                    responseHandler
                );
            }
        }
    },

    /**
     * Callback for the import request.
     * @param {Object} response
     */
    importEventsDone: function (response) {
        var self = this.scope;

        self.loadMask.hide();
        self.dialog.close();
        if (response.status == true) {
            container.getNotifier().notify('info', 'Imported', 'Imported ' + response.count + ' events. Please reload your calendar!');
        } else {
            Zarafa.common.dialogs.MessageBox.show({
                title: dgettext('plugin_calendarimporter', 'Error'),
                msg: String.format(dgettext('plugin_calendarimporter', 'Import failed: {0}'), response.message),
                icon: Zarafa.common.dialogs.MessageBox.ERROR,
                buttons: Zarafa.common.dialogs.MessageBox.OK
            });
        }
    }
});

Ext.reg('calendarimporter.importpanel', Zarafa.plugins.calendarimporter.dialogs.ImportPanel);
