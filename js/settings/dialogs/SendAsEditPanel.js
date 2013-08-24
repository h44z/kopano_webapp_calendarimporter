Ext.namespace('Zarafa.common.sendas.dialogs');

/**
 * @class Zarafa.common.sendas.dialogs.SendAsEditPanel
 * @extends Ext.form.FormPanel
 * @xtype zarafa.sendaseditpanel
 *
 * Will generate UI for {@link Zarafa.common.sendas.dialogs.SendAsEditContentPanel SendAsEditContentPanel}.
 */
Zarafa.common.sendas.dialogs.SendAsEditPanel = Ext.extend(Ext.form.FormPanel, {
	
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
			xtype : 'zarafa.sendaseditpanel',
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

		Zarafa.common.sendas.dialogs.SendAsEditPanel.superclass.constructor.call(this, config);
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
		
		if(!this.currentItem) {
			record = new store.recordType({
				id: this.hashCode(this.email_address.getValue()),
				display_name: this.display_name.getValue(),
				email_address: this.email_address.getValue()
			});
		}
		
		if(this.email_address.isValid()) {
			if(record) {
				store.add(record);
			} else {
				this.currentItem.set('display_name', this.display_name.getValue());
				this.currentItem.set('email_address', this.email_address.getValue());
			}
			this.dialog.close();
		}
	},

	/**
	 * Function will create panel items for {@link Zarafa.common.sendas.dialogs.SendAsEditPanel SendAsEditPanel}
	 * @return {Array} array of items that should be added to panel.
	 * @private
	 */
	createPanelItems : function(config)
	{
		var displayName = "";
		var emailAddress = "";
		
		if(config.item){
			displayName = config.item.get('display_name');
			emailAddress = config.item.get('email_address');
		}
				
		return [{
			fieldLabel: _('Display Name'),
			name: 'display_name',
			ref: 'display_name',
			value: displayName,
			anchor: '100%'
		},
		{
			fieldLabel: _('Email Address'),
			name: 'email_address',
			ref: 'email_address',
			allowBlank: false,
			value: emailAddress,
			vtype:'email',
			anchor: '100%'
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

Ext.reg('zarafa.sendaseditpanel', Zarafa.common.sendas.dialogs.SendAsEditPanel);
