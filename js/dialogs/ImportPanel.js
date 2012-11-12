Ext.namespace("Zarafa.plugins.calendarimporter.dialogs"); 

/**
 * @class Zarafa.plugins.calendarimporter.dialogs.ImportPanel
 * @extends Ext.form.FormPanel
 */
Zarafa.plugins.calendarimporter.dialogs.ImportPanel = Ext.extend(Ext.form.FormPanel, {

	/**
	 * @constructor
	 * @param {object} config
	 */
	constructor : function(config)
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
				this.initForm()
			],
			buttons: [
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
	initForm : function()
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
	
		if(eventdata == null) {
			var parsedData = [
			];
		} else {
			var parsedData = new Array(eventdata.events.length);
			
			for(var i=0; i < eventdata.events.length; i++) {
				parsedData[i] = new Array(eventdata.events[i]["SUMMARY"], parseInt(eventdata.events[i]["DTSTART"]), parseInt(eventdata.events[i]["DTEND"]), eventdata.events[i]["LOCATION"], eventdata.events[i]["DESCRIPTION"]);
			}
		}
		
		// create the data store
		var store = new Ext.data.ArrayStore({
			fields: [
			   {name: 'title'},
			   {name: 'start'},
			   {name: 'end'},
			   {name: 'location'},
			   {name: 'description'}
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
					{id: 'title', header: 'Title', width: 300, sortable: true, dataIndex: 'title'},
					{header: 'startDate', width: 150, sortable: true, dataIndex: 'start'},
					{header: 'endDate', width: 150, sortable: true, dataIndex: 'end'},
					{header: 'startDate', width: 150, sortable: true, dataIndex: 'location'},
					{header: 'endDate', width: 150, sortable: true, dataIndex: 'description'}
				]
			}),
			sm: new Ext.grid.RowSelectionModel({multiSelect:true})
		}
	},
	
	createSelectBox: function() {
		ctx = container.getContextByName('calendar');
        model = ctx.getModel();
        defaultFolder = model.getDefaultFolder();
        subFolders = defaultFolder.getChildren();
        
        var myStore = new Ext.data.ArrayStore({
        	fields: ['calendar_id', 'calendar_displayname'],
        	idIndex: 0 // id for each record will be the first element
        });

        /* Calendar Record holds the name and real name of the calender */
		var CalendarRecord = Ext.data.Record.create([
			{name: 'realname', type: "string"},
			{name: 'displayname', type: "string"}
		]);

		/* Store the default folder */
		var myNewRecord = new CalendarRecord({
			realname: defaultFolder.getDefaultFolderKey(),
		    displayname: defaultFolder.getDisplayName()
		});
		myStore.add(myNewRecord);
        
        for(i=0;i<subFolders.length;i++) {
			/* Store all subfolders */
			myNewRecord = new CalendarRecord({
				realname: subFolders[i].getDisplayName(), // TODO: get the real path... 
			    displayname: subFolders[i].getDisplayName()
			});
			myStore.add(myNewRecord);
        }
        
        /* commit the changes to the store */
        myStore.commitChanges();
        
		return {
            xtype: "selectbox",
            editable: false,
            name: "choosen_calendar",
            width: 100,
            fieldLabel: "Select a calender",
            store: myStore,
            valueField: 'realname',
            displayField: 'displayname',
            labelSeperator: ":",
            border: false,
            anchor: "100%",
            scope: this,
            allowBlank: false
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
            handler: this.importAllEvents,
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
	 * This is called when a file has been seleceted in the file dialog
	 * in the {@link Ext.ux.form.FileUploadField} and the dialog is closed
	 * @param {Ext.ux.form.FileUploadField} uploadField being added a file to
	 */
	onFileSelected	: function(uploadField)	{
		var form = this.addFormPanel.getForm();

		if (form.isValid()) {
			form.submit({
				waitMsg: 'Uploading and parsing calendar...',
				url: 'plugins/calendarimporter/php/upload.php',
				failure: function(file, action) {
					Ext.getCmp('submitButton').disable();	// momstly called...
					Ext.MessageBox.show({
						title   : _('Error'),
						msg     : _(action.result.errors[action.result.errors.type]),
						icon    : Ext.MessageBox.ERROR,
						buttons : Ext.MessageBox.OK
					});
				},
				success: function(file, action){
					uploadField.reset();
					Ext.getCmp('submitButton').enable();
					this.insert(this.items.length,this.createGrid(action.result.response));
					this.doLayout();
				},
				scope : this
			});
		}
	},
	
	close: function () {
		this.addFormPanel.getForm().reset();
		this.getForm().reset();
		this.dialog.close()
	},
	
	convertToAppointmentRecord: function (calendarFolder,entry) {
		var newRecord = Zarafa.core.data.RecordFactory.createRecordObjectByMessageClass('IPM.Appointment', {
			startdate: new Date(entry.start),
			duedate: (entry.end) ?
				new Date(entry.end) :
				new Date(entry.start).add(Date.HOUR, 1),
			location: entry.location,
			subject: entry.title,
			body: entry.description,
			commonstart: new Date(entry.start),
			commonend: (entry.end) ?
				new Date(entry.end) :
				new Date(entry.start).add(Date.HOUR, 1),
			parent_entryid: calendarFolder.get('entryid'),
			store_entryid: calendarFolder.get('store_entryid')
		});
		return newRecord;
	},
	
    importAllEvents: function () {
		//receive existing calendar store
		var calendarStore = new Zarafa.calendar.AppointmentStore();
		var calendarFolder =  container.getHierarchyStore().getDefaultFolder('calendar');
		
		//receive Records from grid rows
		var newRecords = this.eventgrid.selModel.getSelections();
		Ext.each(newRecords, function(newRecord) {
			var record = this.convertToAppointmentRecord(calendarFolder,newRecord.data);
			calendarStore.add(record);
			calendarStore.save();
		}, this);
		this.dialog.close();
    }
	
});

Ext.reg('calendarimporter.importpanel', Zarafa.plugins.calendarimporter.dialogs.ImportPanel);
