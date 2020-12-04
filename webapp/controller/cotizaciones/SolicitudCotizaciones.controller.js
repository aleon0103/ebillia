sap.ui.define([
    "./../BaseController",
    "./../APIController",
	"sap/ui/core/mvc/Controller",
	"sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageToast'
], function (BaseController, API, Controller, Filter, FilterOperator, JSONModel, MessageToast) {
	"use strict";

	return BaseController.extend("ns.EBilliaApp.controller.SolicitudCotizaciones", {

		onInit: function () {

             var emModel = new JSONModel({ busy: true });
                this.getOwnerComponent().setModel(emModel, "cotizaciones");

                var oModel = new JSONModel({ busy: true });
                this.getView().setModel(oModel, "cotizacionesModel");
                this.getProveedores()
        },
        getProveedores: function(){
            var poModel = this.getModel("cotizacionesModel");
                poModel.setProperty('/busy', true);
                poModel.setProperty('/selected', 0);
                poModel.setProperty('/posiciones', []);
            var path = API.serviceList().GET_PROVEEDORES;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                        poModel.setProperty('/busy', false);
                        if (respJson.sapProveedor) {
                            
                             poModel.setProperty("/proveedores", respJson.sapProveedor)
                              
                        }else{
                             poModel.setProperty("/proveedores", [])
                        }

                    }, function (err) {
                        poModel.setProperty('/busy', false);
                        console.log("error in processing your request", err);
                    });

        },
        sendData: function (){
            var oModel = this.getModel("user");
            var userId = oModel.getProperty('/id');

            var poModel = this.getModel("cotizacionesModel");
            var ids = [];
            var posiciones = poModel.getProperty('/posiciones')
            var proveedores = poModel.getProperty('/proveedores')
            posiciones.forEach(i => {
                ids.push(proveedores[i].lifnr)
            });
            poModel.setProperty('/busy', true);

            var path = API.serviceList().CREATE_COTIZACION+`?userId=${userId}&ids=${ids}`;
                API.Post(path, null).then(
                    function (respJson, paramw, param3) {
                        poModel.setProperty('/busy', false);
                        MessageToast.show(respJson.message)
                        this.getProveedores()
                    }, function (err) {
                        poModel.setProperty('/busy', false);
                        console.log("error in processing your request", err);
                    });
        },
		onSearch: function (oEvent) {
			// add filter for search
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("lifnr", FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}

			// update list binding
			var oList = this.byId("idList");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilters, "Application");
		},

		onSelectionChange: function (oEvent) {
			var oList = oEvent.getSource();
			var oLabel = this.byId("idFilterLabel");
			var oInfoToolbar = this.byId("idInfoToolbar");

			console.log(oList._aSelectedPaths);
            oList.s
			var aContexts = oList.getSelectedContexts(true);
            console.log(aContexts);
            var seleccion = []
            if(oList._aSelectedPaths){
                oList._aSelectedPaths.forEach(element => {
                  
                    seleccion.push(element.split('/')[2])
                });
            }
			// update UI
            var bSelected = (aContexts && aContexts.length > 0);
            var sText = aContexts.length;
            var poModel = this.getModel("cotizacionesModel");
            poModel.setProperty('/selected', aContexts.length);
            poModel.setProperty('/posiciones', seleccion);
			oInfoToolbar.setVisible(bSelected);
            oLabel.setText(sText);
            console.log(seleccion);
            
		}

	});
});