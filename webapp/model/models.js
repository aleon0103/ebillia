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

        detailModelSeeComplement: function () {
			var oModel = new JSONModel({
                busy: false,
                delay: 0,
                info: null,
                Count: 0
            });
			return oModel;
        },

        layoutComplementModel: function () {
            var oModel = new JSONModel({
                fullScreen: true,
                exitFullScreen: null,
                closeColumn: true,
                layout: "TwoColumnsMidExpanded"
            });
			return oModel;
        },

        detailDeliveryN: function () {
            var oModel = new JSONModel({
                busy: false,
                delay: 0,
                orderId: '',
                GoodReceipts: null,
                count: 0,
                fecha_entrega: null
            });
            return oModel;
        }
        
        

	};
});