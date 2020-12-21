sap.ui.define(
	[
		"sap/m/UploadCollection"
		
	],
	function (UploadCollection, CustomFileUploader) {
		return UploadCollection.extend("CustomUploadCollection", {
           //Agregar la propedad file limit 
            



           	/**
	 * Handling of the Event typeMissmatch of the fileUploader
	 * @param {sap.ui.base.Event} event Event of the fileUploader
	 * @private
	 */
    /*
	UploadCollection.prototype._onTypeMissmatch = function(event) {
		var oFile = {
			name: event.getParameter("fileName"),
			fileType: event.getParameter("fileType"),
			mimeType: event.getParameter("mimeType")
		};
		var aFiles = [oFile];
		this.fireTypeMissmatch({
			// deprecated
			getParameter: function(sParameter) {
				if (sParameter) {
					return event.getParameter(sParameter);
				}
			},
			getParameters: function() {
				return event.getParameters();
			},
			mParameters: event.getParameters(),
			// new
			files: aFiles
		});
    };
    */


			renderer: "sap.m.UploadCollectionRenderer"
		});
	}
);