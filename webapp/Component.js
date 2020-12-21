sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/Device",
    "ns/EBilliaApp/model/models",
    "./controller/ErrorHandler"
], function (UIComponent, Device, models,ErrorHandler) {
    "use strict";

    return UIComponent.extend("ns.EBilliaApp.Component", {

        metadata: {
            manifest: "json"
        },

		/**
		 * The component is initialized by UI5 automatically during the startup of the app and calls the init method once.
		 * @public
		 * @override
		 */
        init: function () {
            // call the base component's init function
            UIComponent.prototype.init.apply(this, arguments);
           

            // enable routing
            this.getRouter().initialize();
             this._oErrorHandler = new ErrorHandler(this);

            // set the device model
            this.setModel(models.createDeviceModel(), "device");
            this.setModel(models.createUserModel(), "user");
            this.setModel(models.createJSONModel(), "notifications");
            this.setModel(models.tableModelComplements(), "tablaModel");
            this.setModel(models.detailModelSeeComplement(), "mDetailSeeComplement");
            this.setModel(models.layoutComplementModel(), "layoutComplementModel");
            this.setModel(models.detailDeliveryN(), "detailDeliveryN");
            //  this.setModel(models.createEMModel(), "invoiceUpload");
          //  this._configureInterceptor(); use instead errorhandler js 
        },
        getContentDensityClass: function () {
            if (!this._sContentDensityClass) {
                if (!sap.ui.Device.support.touch) {
                    this._sContentDensityClass = "sapUiSizeCompact";
                } else {
                    this._sContentDensityClass = "sapUiSizeCozy";
                }
            }
            return this._sContentDensityClass;
        },

        destroy : function () {
			
			this._oErrorHandler.destroy();
			// call the base component's destroy function
			UIComponent.prototype.destroy.apply(this, arguments);
		},

        _configureInterceptor: function () {
            $.ajaxSetup({

                complete: function (xhr, status) {
                    console.log("222");
                },
                error: function (xhr, status, error) {
                    console.log("333");
                    console.log(xhr.status);
                    alert(xhr.status);
                    console.log(status);
                    console.log(error);
                  
                },
            });

        }
    });
});
