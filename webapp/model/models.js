sap.ui.define([
	"sap/ui/model/json/JSONModel",
	"sap/ui/Device"
], function (JSONModel, Device) {
	"use strict";

	return {

		createDeviceModel: function () {
			var oModel = new JSONModel(Device);
			oModel.setDefaultBindingMode("OneWay");
			return oModel;
        },
        	createUserModel: function () {
			var oModel = new JSONModel({});
		//	oModel.setDefaultBindingMode("OneWay");
			return oModel;
        },

        	createJSONModel: function () {
			var oModel = new JSONModel({});
		//	oModel.setDefaultBindingMode("OneWay");
			return oModel;
        },

        createEMModel: function () {
			var oModel = new JSONModel({});
		//	oModel.setDefaultBindingMode("OneWay");
			return oModel;
        },

        tableModelComplements: function () {
			var oModelTable = new JSONModel({
                    data: [],
                    Count: 0
            });
			return oModelTable;
        },
        
        

	};
});