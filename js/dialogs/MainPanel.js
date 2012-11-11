/*############################################################################################################################
 * IMPORT PANEL
 *############################################################################################################################*/
Ext.namespace("Zarafa.plugins.calendarimporter");    								// Assign the right namespace
Zarafa.plugins.calendarimporter.ImportPanel = Ext.extend(Ext.form.FormPanel, {
	constructor: function (a) {
	    a = a || {};
	    var b = this;
	    Ext.apply(a, {
	        xtype: "calendarimporter.ImportPanel",
	        layout: {
	            type: "form",
	            align: "stretch"
	        },
	        anchor: "100%",
	        bodyStyle: "background-color: inherit;",
	        defaults: {
	            border: true,
	            bodyStyle: "background-color: inherit; padding: 3px 0px 3px 0px; border-style: none none solid none;"
	        },
	        items: [this.createSelectBox(), this.createUploadField(), this.createSubmitButton(), this.createCancelButton()]
	    });
	    Zarafa.plugins.calendarimporter.ImportPanel.superclass.constructor.call(this, a)
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
				realname: subFolders[i].getDefaultFolderKey(),
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
            width: 100,
        id: 'form-file',    
	name: 'icspath',
            fieldLabel: "Upload .ics file",
            emptyText: 'Select an .ics calendar',
            labelSeperator: ":",
            border: false,
            anchor: "100%",
            scope: this,
            allowBlank: false
        }
	},
	createSubmitButton: function() {
		return {
            xtype: "button",
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
	close: function () {
		this.getForm().reset();
		this.dialog.close()
	},
    importAllEvents: function () {
    	if(this.getForm().isValid()){
            form_action=1;
            this.getForm().submit({
                url: 'plugins/calendarimporter/php/upload.php',
                waitMsg: 'Uploading file...',
                success: function(form,action){
                    msg('Success', 'Processed file on the server');
                }
            });
        }
    }
});
Zarafa.core.ui.Dialog.register(Zarafa.plugins.calendarimporter.ImportPanel, "calendarimporter.ImportPanel");