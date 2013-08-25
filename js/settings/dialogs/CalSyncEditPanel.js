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
	currentItem : undefined,
	
	/**
	 * @constructor
	 * @param config Configuration structure
	 */
	constructor : function(config)
	{
		config = config || {};

		if(config.item)
			this.currentItem = config.item;

		Ext.applyIf(config, {
			// Override from Ext.Component
			xtype : 'calendarimporter.calsynceditpanel',
			labelAlign : 'left',
			defaultType: 'textfield',
			items : this.createPanelItems(config),
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
	doClose : function() {
		this.dialog.close();
	},
	
	/**
	 * save the data to the store
	 */
	doSave : function() {
		var store = this.dialog.store;
		var id = 0;
		var record = undefined;
		
		console.log(this);
		if(!this.currentItem) {
			record = new store.recordType({
				id: this.hashCode(this.icsurl.getValue()),
				icsurl: this.icsurl.getValue(),
				intervall: this.intervall.getValue(),
				user: this.user.getValue(),
				pass: this.pass.getValue(),
				lastsync: 0
			});
		}
		
		if(this.icsurl.isValid()) {
			if(record) {
				store.add(record);
			} else {
				this.currentItem.set('icsurl', this.icsurl.getValue());
				this.currentItem.set('intervall', this.intervall.getValue());
				this.currentItem.set('user', this.user.getValue());
				this.currentItem.set('pass', this.pass.getValue());
			}
			this.dialog.close();
		}
	},

	/**
	 * Function will create panel items for {@link Zarafa.plugins.calendarimporter.settings.dialogs.CalSyncEditPanel CalSyncEditPanel}
	 * @return {Array} array of items that should be added to panel.
	 * @private
	 */
	createPanelItems : function(config)
	{
		var icsurl = "";
		var intervall = "";
		var user = "";
		var pass = "";
		
		if(config.item){
			icsurl = config.item.get('icsurl');
			intervall = config.item.get('intervall');
			user = config.item.get('user');
			pass = config.item.get('pass');
		}
				
		return [{
			xtype: 'fieldset',
			title: _('ICAL Information'),
			defaultType: 'textfield',
			labelWidth: 120,
			layout: 'anchor',
			defaults: {
				anchor: '100%'
			},
			items: [{
				fieldLabel: _('ICS Url'),
				name: 'icsurl',
				ref: '../icsurl',
				value: icsurl,
				allowBlank: false
			},
			{
				xtype:'numberfield',
				fieldLabel: _('Sync Intervall'),
				name: 'intervall',
				ref: '../intervall',
				value: intervall,
				allowBlank: false
			}]
		},
		{
			xtype: 'fieldset',
			title: _('Authentication (optional)'),
			defaultType: 'textfield',
			labelWidth: 120,
			layout: 'anchor',
			defaults: {
				anchor: '100%'
			},
			items: [{
				fieldLabel: _('Username'),
				name: 'user',
				ref: '../user',
				value: user,
				allowBlank: true
			},
			{
				fieldLabel: _('Password'),
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
	hashCode : function(str){
		var hash = 0;
		var chr = 0;
		var i = 0;

		if (str.length == 0) return hash;
		for (i = 0; i < str.length; i++) {
			chr = str.charCodeAt(i);
			hash = ((hash<<5)-hash)+chr;
			hash = hash & hash; // Convert to 32bit integer
		}
		return Math.abs(hash);
	}
});

Ext.reg('calendarimporter.calsynceditpanel', Zarafa.plugins.calendarimporter.settings.dialogs.CalSyncEditPanel);
