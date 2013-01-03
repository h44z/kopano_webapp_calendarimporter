/**
 * ImportPanel
 *
 * The main Panel of the calendarimporter plugin.
 *
 * @author   Christoph Haas <mail@h44z.net>
 * @modified 30.12.2012
 * @license  http://www.opensource.org/licenses/mit-license.php  MIT License
 */
Ext.namespace("Zarafa.plugins.calendarimporter.dialogs"); 

/**
 * @class Zarafa.plugins.calendarimporter.dialogs.ImportPanel
 * @extends Ext.form.FormPanel
 */
Zarafa.plugins.calendarimporter.dialogs.ImportPanel = Ext.extend(Ext.Panel, {

	/* store the imported timezone here... */
	timezone: null,
	
	/* keep the parsed result here, for timezone changes... */
	parsedresult: null,
	
	/**
	 * The internal 'iframe' which is hidden from the user, which is used for downloading
	 * attachments. See {@link #doOpen}.
	 * @property
	 * @type Ext.Element
	 */
	downloadFrame : undefined,	

	/**
	 * @constructor
	 * @param {object} config
	 */
	constructor : function (config) 
	{
		config = config || {};
		var self = this;
		Ext.apply(config, {
			xtype     : 'calendarimporter.importpanel',
			layout    : {
				type  : 'form',
				align : 'stretch'
			},
			anchor      : '100%',
			bodyStyle : 'background-color: inherit;',
			defaults  : {
				border      : true,
				bodyStyle   : 'background-color: inherit; padding: 3px 0px 3px 0px; border-style: none none solid none;'
			},
			items : [
				this.createSelectBox(),
				this.createTimezoneBox(),
				this.initForm()
			],
			buttons: [
				this.createExportAllButton(),
				this.createSubmitAllButton(),
				this.createSubmitButton(),
				this.createCancelButton()
			]
		});

		Zarafa.plugins.calendarimporter.dialogs.ImportPanel.superclass.constructor.call(this, config);
	},

	/**
	 * Init embedded form, this is the form that is
	 * posted and contains the attachments
	 * @private
	 */
	initForm : function ()
	{
		return {
			xtype: 'form',
			ref: 'addFormPanel',
			layout : 'column',
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
	 * Init embedded form, this is the form that is
	 * posted and contains the attachments
	 * @private
	 */
	createGrid : function(eventdata) {
		
		/* remove the grid if it already exists because of an old calendar file */
		this.remove("eventgrid");
		
		var parsedData = [];
		var local_tz_offset = new Date().getTimezoneOffset() * 60000;  // getTimezoneOffset returns minutes... we need milliseconds
		var tz_offset = local_tz_offset;
		
		if(this.timezone != null) {
			tz_offset = Zarafa.plugins.calendarimporter.data.Timezones.getOffset(this.timezone);
		}
		
		if(eventdata !== null) {
			parsedData = new Array(eventdata.events.length);
			var i = 0;
			for(i = 0; i < eventdata.events.length; i++) {
				var trigger = null;
				
				if(eventdata.events[i]["VALARM"]) {
					trigger = eventdata.events[i]["VALARM"]["TRIGGER"];
					trigger = new Date(parseInt(trigger) + local_tz_offset + tz_offset);
				}
				parsedData[i] = new Array(eventdata.events[i]["SUMMARY"], new Date(parseInt(eventdata.events[i]["DTSTART"]) + local_tz_offset + tz_offset), new Date(parseInt(eventdata.events[i]["DTEND"]) + local_tz_offset + tz_offset), eventdata.events[i]["LOCATION"], eventdata.events[i]["DESCRIPTION"],eventdata.events[i]["PRIORITY"],eventdata.events[i]["X-ZARAFA-LABEL"],eventdata.events[i]["X-MICROSOFT-CDO-BUSYSTATUS"],eventdata.events[i]["CLASS"],eventdata.events[i]["ORGANIZER"],trigger);
			}
		} else {
			return null;
		}

		// create the data store
		var store = new Ext.data.ArrayStore({
			fields: [
				{name: 'title'},
				{name: 'start'},
				{name: 'end'},
				{name: 'location'},
				{name: 'description'},
				{name: 'priority'},
				{name: 'label'},
				{name: 'busy'},
				{name: 'privatestate'},
				{name: 'organizer'},
				{name: 'trigger'}
			],
			data: parsedData
		});

		return {
			xtype: 'grid',
			ref: 'eventgrid',
			id: 'eventgrid',
			columnWidth: 1.0,
			store: store,
			width: '100%',
			height: 300,
			title: 'Select events to import',
			frame: true,
			colModel: new Ext.grid.ColumnModel({
				defaults: {
					width: 300,
					sortable: true
				},
				columns: [
					{id: 'Summary', header: 'Title', width: 300, sortable: true, dataIndex: 'title'},
					{header: 'Start', width: 150, sortable: true, dataIndex: 'start', renderer : Zarafa.common.ui.grid.Renderers.datetime},
					{header: 'End', width: 150, sortable: true, dataIndex: 'end', renderer : Zarafa.common.ui.grid.Renderers.datetime},
					{header: 'Location', width: 150, sortable: true, dataIndex: 'location'},
					{header: 'Description', width: 150, sortable: true, dataIndex: 'description'},
					{header: "Priority", dataIndex: 'priority', hidden: true},
					{header: "Label", dataIndex: 'label', hidden: true},
					{header: "Busystatus", dataIndex: 'busy', hidden: true},
					{header: "Privacystatus", dataIndex: 'privatestate', hidden: true},
					{header: "Organizer", dataIndex: 'organizer', hidden: true},
					{header: "Alarm", dataIndex: 'trigger', hidden: true, renderer : Zarafa.common.ui.grid.Renderers.datetime}
				]
			}),
			sm: new Ext.grid.RowSelectionModel({multiSelect:true})
		}
	},
	
	createSelectBox: function() {
		var defaultFolder = container.getHierarchyStore().getDefaultFolder('calendar'); // @type: Zarafa.hierarchy.data.MAPIFolderRecord		
		var subFolders = defaultFolder.getChildren();
		var myStore = [];		
		
		/* add all local calendar folders */
		var i = 0;
		myStore.push(new Array(defaultFolder.getDefaultFolderKey(), defaultFolder.getDisplayName()));
		for(i = 0; i < subFolders.length; i++) {
			/* Store all subfolders */
			myStore.push(new Array(subFolders[i].getDisplayName(), subFolders[i].getDisplayName(), false)); // 3rd field = isPublicfolder
		}
		
		/* add all shared calendar folders */
		var pubStore = container.getHierarchyStore().getPublicStore();
		var pubFolder = pubStore.getDefaultFolder("publicfolders");
		var pubSubFolders = pubFolder.getChildren();
		
		for(i = 0; i < pubSubFolders.length; i++) {		
			if(pubSubFolders[i].isContainerClass("IPF.Appointment")){
				myStore.push(new Array(pubSubFolders[i].getDisplayName(), pubSubFolders[i].getDisplayName() + " [Shared]", true)); // 3rd field = isPublicfolder
			}
		}
		
		return {
			xtype: "selectbox",
			ref: 'calendarselector',
			id: 'calendarselector',  
			editable: false,
			name: "choosen_calendar",
			value: container.getSettingsModel().get("zarafa/v1/plugins/calendarimporter/default_calendar"),
			width: 100,
			fieldLabel: "Select a calender",
			store: myStore,
			mode: 'local',
			labelSeperator: ":",
			border: false,
			anchor: "100%",
			scope: this,
			allowBlank: false
		}
	},
	
	createTimezoneBox: function() {
		return {
			xtype: "selectbox",
			ref: 'timezoneselector',
			id: 'timezoneselector',  
			editable: false,
			name: "choosen_timezone",
			width: 100,
			fieldLabel: "Select a timezone (optional)",
			store: Zarafa.plugins.calendarimporter.data.Timezones.store,
			labelSeperator: ":",
			mode: 'local',
			border: false,
			anchor: "100%",
			scope: this,
			allowBlank: true,
			listeners: {
				'select': this.onTimezoneSelected,
				scope: this
			}
		}
	},
	
	createUploadField: function() {
		return {
			xtype: "fileuploadfield",
			ref: 'fileuploadfield',
			columnWidth: 1.0,
			id: 'form-file',    
			name: 'icsdata',
			emptyText: 'Select an .ics calendar',
			border: false,
			anchor: "100%",
			scope: this,
			allowBlank: false,
			listeners: {
				'fileselected': this.onFileSelected,
				scope: this
			}
		}
	},
	
	createSubmitButton: function() {
		return {
			xtype: "button",
			ref: "submitButton",
			id: "submitButton",
			disabled: true,
			width: 100,
			border: false,
			text: _("Import"),
			anchor: "100%",
			handler: this.importCheckedEvents,
			scope: this,
			allowBlank: false
		}
	},
	
	createSubmitAllButton: function() {
		return {
			xtype: "button",
			ref: "submitAllButton",
			id: "submitAllButton",
			disabled: true,
			width: 100,
			border: false,
			text: _("Import All"),
			anchor: "100%",
			handler: this.importAllEvents,
			scope: this,
			allowBlank: false
		}
	},
	
	createExportAllButton: function() {
		return {
			xtype: "button",
			ref: "exportAllButton",
			id: "exportAllButton",
			hidden: !container.getSettingsModel().get("zarafa/v1/plugins/calendarimporter/enable_export"),
			width: 100,
			border: false,
			text: _("Export All"),
			anchor: "100%",
			handler: this.exportAllEvents,
			scope: this,
			allowBlank: false
		}
	},
	
	createCancelButton: function() {
		return {
			xtype: "button",
			width: 100,
			border: false,
			text: _("Cancel"),
			anchor: "100%",
			handler: this.close,
			scope: this,
			allowBlank: false
		}
	},
	
	/**
	 * This is called when a timezone has been seleceted in the timezone dialog
	 * @param {Ext.form.ComboBox} combo
	 * @param {Ext.data.Record} record
	 * @param {Number} index
	 */
	onTimezoneSelected : function(combo, record, index) {
		this.timezone = record.data.field1;
			
		if(this.parsedresult != null) {
			this.add(this.createGrid(this.parsedresult));
			this.doLayout();
		}
	},
	
	/**
	 * This is called when a file has been seleceted in the file dialog
	 * in the {@link Ext.ux.form.FileUploadField} and the dialog is closed
	 * @param {Ext.ux.form.FileUploadField} uploadField being added a file to
	 */
	onFileSelected	: function(uploadField) {
		var form = this.addFormPanel.getForm();

		if (form.isValid()) {
			form.submit({
				waitMsg: 'Uploading and parsing calendar...',
				url: 'plugins/calendarimporter/php/upload.php',
				failure: function(file, action) {
					Ext.getCmp('submitButton').disable();
					Ext.getCmp('submitAllButton').disable();
					Zarafa.common.dialogs.MessageBox.show({
						title   : _('Error'),
						msg     : _(action.result.errors[action.result.errors.type]),
						icon    : Zarafa.common.dialogs.MessageBox.ERROR,
						buttons : Zarafa.common.dialogs.MessageBox.OK
					});
				},
				success: function(file, action){
					uploadField.reset();
					Ext.getCmp('submitButton').enable();
					Ext.getCmp('submitAllButton').enable();
					this.parsedresult = action.result.response;
					
					if(this.timezone == null) {;
						this.timezone = action.result.response.calendar["X-WR-TIMEZONE"];
						this.timezoneselector.setValue(Zarafa.plugins.calendarimporter.data.Timezones.unMap(this.timezone));
					} else {
						this.timezone = this.timezoneselector.value;
					}
					this.add(this.createGrid(action.result.response));
					this.doLayout();
				},
				scope : this
			});
		}
	},

	close: function () {
		this.addFormPanel.getForm().reset();
		this.dialog.close()
	},

	convertToAppointmentRecord: function (calendarFolder,entry) {
		var newRecord = Zarafa.core.data.RecordFactory.createRecordObjectByMessageClass('IPM.Appointment', {
			startdate: new Date(entry.start),
			duedate: (entry.end != null) ?
				new Date(entry.end) :
				new Date(entry.start).add(Date.HOUR, 1),
			location: entry.location,
			subject: entry.title,
			body: entry.description,
			commonstart: new Date(entry.start),
			commonend: (entry.end != null) ?
				new Date(entry.end) :
				new Date(entry.start).add(Date.HOUR, 1),
			timezone: this.timezone,
			parent_entryid: calendarFolder.get('entryid'),
			store_entryid: calendarFolder.get('store_entryid')
		});
		
		var busystate = new Array("FREE", "TENTATIVE", "BUSY", "OOF");
		var zlabel = new Array("NONE", "IMPORTANT", "WORK", "PERSONAL", "HOLIDAY", "REQUIRED", "TRAVEL REQUIRED", "PREPARATION REQUIERED", "BIRTHDAY", "SPECIAL DATE", "PHONE INTERVIEW");
				
		/* optional fields */
		if(entry.priority !== "") {
			newRecord.data.importance = entry.priority;
		}		
		if(entry.label !== "") {
			newRecord.data.label = zlabel.indexOf(entry.label);
		}
		if(entry.busy !== "") {
			newRecord.data.busystatus = busystate.indexOf(entry.busy);
		}
		if(entry.privatestate !== "") {
			newRecord.data["private"] = entry.privatestate == "PUBLIC" ? false : true;
		}
		if(entry.organizer !== "") {
			newRecord.data.sent_representing_email_address = entry.organizer;
		}
		if(entry.trigger != null) {
			newRecord.data.reminder = true;
			newRecord.data.reminder_minutes = new Date((entry.start - entry.trigger)/60);
			newRecord.data.reminder_time = new Date(entry.trigger);
		} else {
			newRecord.data.reminder = false;
		}
		
		return newRecord;
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
	
	exportAllEvents: function () {
		//receive existing calendar store
		var calValue = this.calendarselector.value;

		if(calValue == undefined) { // no calendar choosen
			Zarafa.common.dialogs.MessageBox.show({
				title   : _('Error'),
				msg     : _('You have to choose a calendar!'),
				icon    : Zarafa.common.dialogs.MessageBox.ERROR,
				buttons : Zarafa.common.dialogs.MessageBox.OK
			});
		} else {
			var calexist = true;
			var calendarFolder =  container.getHierarchyStore().getDefaultFolder('calendar');
			var pubStore = container.getHierarchyStore().getPublicStore();
			var pubFolder = pubStore.getDefaultFolder("publicfolders");
			var pubSubFolders = pubFolder.getChildren();
			
			if(calValue != "calendar") {
				var subFolders = calendarFolder.getChildren();
				var i = 0;
				for(i = 0; i < pubSubFolders.length; i++) {		
					if(pubSubFolders[i].isContainerClass("IPF.Appointment")){
						subFolders.push(pubSubFolders[i]);
					}
				}
				for(i=0;i<subFolders.length;i++) {
					// loo up right folder 
					// TODO: improve!!
					if(subFolders[i].getDisplayName() == calValue) {
						calendarFolder = subFolders[i];
						break;
					}
				}
				
				if(calendarFolder.isDefaultFolder()) {
					Zarafa.common.dialogs.MessageBox.show({
						title   : _('Error'),
						msg     : _('Selected calendar does not exist!'),
						icon    : Zarafa.common.dialogs.MessageBox.ERROR,
						buttons : Zarafa.common.dialogs.MessageBox.OK
					});
					calexist = false;
				}
			}
			
			if(calexist) {
				Zarafa.common.dialogs.MessageBox.show({
					title: 'Please wait',
					msg: 'Generating ical file...',
					progressText: 'Exporting...',
					width:300,
					progress:true,
					closable:false
				});
				
				// progress bar... ;)
				var updateProgressBar = function(v){
					return function(){
						if(v == 100){
							if(Zarafa.common.dialogs.MessageBox.isVisible()) {
								updateTimer();
							}
						}else{
							Zarafa.common.dialogs.MessageBox.updateProgress(v/100, 'Exporting...');
						}
				   };
				};
				
				var updateTimer = function() {
					for(var i = 1; i < 101; i++){
						setTimeout(updateProgressBar(i), 20*i);
					}
				};
				
				updateTimer();
			
				// call export function here!
				var responseHandler = new Zarafa.plugins.calendarimporter.data.ResponseHandler({
					successCallback: this.exportDone.createDelegate(this)
				});
				
				container.getRequest().singleRequest(
					'appointmentlistmodule',
					'list',
					{
						groupDir: "ASC",
						restriction: {
							startdate: 0,
							duedate: 2145826800	// 2037... nearly highest unix timestamp
						},
						sort: [{
								"field": "startdate",
								"direction": "DESC"
						}],
						store_entryid : calendarFolder.data.store_entryid,
						entryid : calendarFolder.data.entryid
					},
					responseHandler
				);
			}
		}
    },
	
	/**
	 * Export done =)
	 * @param {Object} response
	 * @private
	 */
	exportDone : function(response)	{
		if(response.item.length > 0) {
			// call export function here!
			var responseHandler = new Zarafa.plugins.calendarimporter.data.ResponseHandler({
				successCallback: this.downLoadICS.createDelegate(this)
			});
			
			container.getRequest().singleRequest(
				'calendarexportermodule',
				'export',
				{
					data: response,
					calendar: this.calendarselector.value
				},
				responseHandler
			);
			container.getNotifier().notify('info', 'Exported', 'Found ' + response.item.length + ' entries to export.');
		} else {
			container.getNotifier().notify('info', 'Export Failed', 'There were no items to export!');
			Zarafa.common.dialogs.MessageBox.hide();
		}
		this.dialog.close();
	},	
	
	/**
	 * download ics file =)
	 * @param {Object} response
	 * @private
	 */
	downLoadICS : function(response) {
		Zarafa.common.dialogs.MessageBox.hide();
		if(response.status === true) {			
			if(!this.downloadFrame){
				this.downloadFrame = Ext.getBody().createChild({
					tag: 'iframe',
					cls: 'x-hidden'
				});
			}
			var url = 'plugins/calendarimporter/php/download.php?fileid='+response.fileid+'&basedir='+response.basedir+'&secid='+response.secid+'&realname='+response.realname;
			this.downloadFrame.dom.contentWindow.location = url;
		} else {
			container.getNotifier().notify('error', 'Export Failed', 'ICal File creation failed!');
		}		
	},
	
	importEvents: function (events) {
		//receive existing calendar store
		var calValue = this.calendarselector.value;

		if(calValue == undefined) { // no calendar choosen
			Zarafa.common.dialogs.MessageBox.show({
				title   : _('Error'),
				msg     : _('You have to choose a calendar!'),
				icon    : Zarafa.common.dialogs.MessageBox.ERROR,
				buttons : Zarafa.common.dialogs.MessageBox.OK
			});
		} else {
			var calexist = true;
			if(this.eventgrid.selModel.getCount() < 1) {
				Zarafa.common.dialogs.MessageBox.show({
					title   : _('Error'),
					msg     : _('You have to choose at least one event to import!'),
					icon    : Zarafa.common.dialogs.MessageBox.ERROR,
					buttons : Zarafa.common.dialogs.MessageBox.OK
				});
			} else {
				var calendarStore = new Zarafa.calendar.AppointmentStore();
				var calendarFolder =  container.getHierarchyStore().getDefaultFolder('calendar');
				var pubStore = container.getHierarchyStore().getPublicStore();
				var pubFolder = pubStore.getDefaultFolder("publicfolders");
				var pubSubFolders = pubFolder.getChildren();
			
				if(calValue != "calendar") {
					var subFolders = calendarFolder.getChildren();
					var i = 0;
					for(i = 0; i < pubSubFolders.length; i++) {		
						if(pubSubFolders[i].isContainerClass("IPF.Appointment")){
							subFolders.push(pubSubFolders[i]);
						}
					}
					for(i=0;i<subFolders.length;i++) {
						// look up right folder 
						// TODO: improve!!
						if(subFolders[i].getDisplayName() == calValue) {
							calendarFolder = subFolders[i];
							break;
						}
					}
					
					if(calendarFolder.isDefaultFolder()) {
						Zarafa.common.dialogs.MessageBox.show({
							title   : _('Error'),
							msg     : _('Selected calendar does not exist!'),
							icon    : Zarafa.common.dialogs.MessageBox.ERROR,
							buttons : Zarafa.common.dialogs.MessageBox.OK
						});
						calexist = false;
					}
				}

				if(calexist) {
					//receive Records from grid rows
					Ext.each(events, function(newRecord) {
						var record = this.convertToAppointmentRecord(calendarFolder,newRecord.data);
						calendarStore.add(record);
					}, this);
					calendarStore.save();
					this.dialog.close();
				}
			}
		}
	}	
});

Ext.reg('calendarimporter.importpanel', Zarafa.plugins.calendarimporter.dialogs.ImportPanel);
