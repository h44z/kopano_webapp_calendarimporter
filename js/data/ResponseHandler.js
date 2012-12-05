Ext.namespace('Zarafa.plugins.calendarimporter.data');

/**
 * @class Zarafa.plugins.calendarimporter.data.ResponseHandler
 * @extends Zarafa.plugins.calendarimporter.data.AbstractResponseHandler
 *
 * Export specific response handler.
 */
Zarafa.plugins.calendarimporter.data.ResponseHandler = Ext.extend(Zarafa.core.data.AbstractResponseHandler, {
	/**
	 * @cfg {Function} successCallback The function which
	 * will be called after success request.
	 */
	successCallback : null,

	/**
	 * Call the successCallback callback function.
	 * @param {Object} response Object contained the response data.
	 */
	doExport : function(response)
	{
		this.successCallback(response);
	},
	
	/**
	 * In case exception happened on server, server will return
	 * exception response with the code of exception.
	 * @param {Object} response Object contained the response data.
	 */
	doError: function(response)
	{
		alert("error response code: " + response.error.info.code);
	}
});

Ext.reg('calendarimporter.calendarexporterresponsehandler', Zarafa.plugins.calendarimporter.data.ResponseHandler);