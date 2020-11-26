sap.ui.define([
    './Formatter',
    './../BaseController',
    "./../APIController",
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    'sap/m/library',
    'sap/ui/core/Fragment',
    "sap/ui/core/syncStyleClass",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",

], function(Formatter,BaseController, API, Controller, JSONModel, mobileLibrary, Fragment, syncStyleClass,Filter, FilterOperator, MessageToast) {
"use strict";

	var PopinLayout = mobileLibrary.PopinLayout;

	var TableController = BaseController.extend("ns.EBilliaApp.controller.PendingComplement", {

		onInit: function () {
			// set explored app's demo model on this sample
			
            var oData = {
                   data:{
                       cantidad: 0,
                       listado: null
                   }
            };
                var oModel = new JSONModel(oData);
                this.getView().setModel(oModel, "complementos");
            

            this._initData()

            
            

        },
        
        _initData: function () {
                console.log('loading complementos...');
                var complemetosModel = this.getView().getModel("complementos");               
                var me = this;
                var loginData = complemetosModel.getProperty("/data");
                var path = API.serviceList().GET_COMPLEMENTOS_PENDIENTES;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                        console.log(respJson);
                        if (respJson) {
                             complemetosModel.setProperty("/data/listado", respJson)
                              complemetosModel.setProperty("/data/cantidad", respJson.length)
                              console.log(loginData);
                              
                        }

                    }, function (err) {
                        console.log("error in processing your request", err);
                    });



        },
        onDataExport : function(oEvent) {
            console.log("downloading");
            
        },
        onSelectDialogPress: function (oEvent) {
			var oButton = oEvent.getSource();

			if (!this._oDialog) {
				Fragment.load({
					name: "ns.EBilliaApp.view.reports.Dialog",
					controller: this
				}).then(function (oDialog){
                    this._oDialog = oDialog;
                    var complemetosModel = this.getView().getModel("complementos");               
                    var loginData = complemetosModel.getProperty("/data");
					this._oDialog.setModel(complemetosModel);
					// this.getView().addDependent(this._oDialog);
					this._configDialog(oButton);
					this._oDialog.open();
				}.bind(this));
			} else {
				this._configDialog(oButton);
				this._oDialog.open();
			}
		},
      
		_configDialog: function (oButton) {
			// Multi-select if required
			var bMultiSelect = !!oButton.data("multi");
			this._oDialog.setMultiSelect(bMultiSelect);

			var sCustomConfirmButtonText = oButton.data("confirmButtonText");
			this._oDialog.setConfirmButtonText(sCustomConfirmButtonText);

			// Remember selections if required
			var bRemember = !!oButton.data("remember");
			this._oDialog.setRememberSelections(bRemember);

			//add Clear button if needed
			var bShowClearButton = !!oButton.data("showClearButton");
			this._oDialog.setShowClearButton(bShowClearButton);

			// Set growing property
			var bGrowing = oButton.data("growing");
			this._oDialog.setGrowing(bGrowing == "true");

			// Set growing threshold
			var sGrowingThreshold = oButton.data("threshold");
			if (sGrowingThreshold) {
				this._oDialog.setGrowingThreshold(parseInt(sGrowingThreshold));
			}

			// Set draggable property
			var bDraggable = !!oButton.data("draggable");
			this._oDialog.setDraggable(bDraggable);

			// Set draggable property
			var bResizable = !!oButton.data("resizable");
			this._oDialog.setResizable(bResizable);

			// Set style classes
			var sResponsiveStyleClasses = "sapUiResponsivePadding--header sapUiResponsivePadding--subHeader sapUiResponsivePadding--content sapUiResponsivePadding--footer";
			var bResponsivePadding = !!oButton.data("responsivePadding");
			this._oDialog.toggleStyleClass(sResponsiveStyleClasses, bResponsivePadding);

			// clear the old search filter
			this._oDialog.getBinding("items").filter([]);

			// toggle compact style
			syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
		},

		onSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var oFilter = new Filter("proveedor", FilterOperator.Contains, sValue);
			var oBinding = oEvent.getParameter("itemsBinding");
			oBinding.filter([oFilter]);
		},

		onDialogClose: function (oEvent) {
			var aContexts = oEvent.getParameter("selectedContexts");
			if (aContexts && aContexts.length) {
				MessageToast.show("You have chosen " + aContexts.map(function (oContext) { return oContext.getObject().proveedor; }).join(", "));
			} else {
				MessageToast.show("No new item was selected.");
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
	});


	return TableController;

});