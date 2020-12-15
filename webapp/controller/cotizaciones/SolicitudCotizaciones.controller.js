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
                poModel.setProperty('/okSend', false);
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
        getSelectedIndices: function(evt) {

			var aIndices = this.byId("table1").getSelectedIndices();
            var poModel = this.getModel("cotizacionesModel");
            var ids = [];
            var proveedores = poModel.getProperty('/proveedores')
			if (aIndices.length > 0) {
                
                aIndices.forEach(element => {
                   ids.push(proveedores[element].lifnr)
                });
                this.sendData(ids)
                this.clearAllFilters(evt)
			}else{
                 this.getModel("i18n").getResourceBundle().then(function (oBundle) {
                    console.log()
                    MessageToast.show(oBundle.getText("noItems"));
                });
                	
            }
            
		},
        sendData: async function (ids){
            var oModel = this.getModel("user");
            var userId = oModel.getProperty('/id');

            var poModel = this.getModel("cotizacionesModel");
           
            poModel.setProperty('/busy', true);

            var path = API.serviceList().CREATE_COTIZACION+`?userId=${userId}&ids=${ids}`;
            await API.PostData(path, null).then(
                    function (respJson, paramw, param3) {
                        poModel.setProperty('/busy', false);
                        MessageToast.show(respJson.message)
                        
                    }, function (err) {
                        poModel.setProperty('/busy', false);
                        console.log("error in processing your request", err);
                    });
            this.getProveedores()
            
        },
        filterGlobally : function(oEvent) {
			var sQuery = oEvent.getParameter("query");
			this._oGlobalFilter = null;

			if (sQuery) {
				this._oGlobalFilter = new Filter([
					new Filter("lifnr", FilterOperator.Contains, sQuery),
					new Filter("name1", FilterOperator.Contains, sQuery)
				], false);
			}

			this._filter();
        },
        _filter : function() {
			var oFilter = null;

			if (this._oGlobalFilter && this._oPriceFilter) {
				oFilter = new Filter([this._oGlobalFilter, this._oPriceFilter], true);
			} else if (this._oGlobalFilter) {
				oFilter = this._oGlobalFilter;
			} else if (this._oPriceFilter) {
				oFilter = this._oPriceFilter;
			}

			this.byId("table1").getBinding("rows").filter(oFilter, "Application");
        },
        clearAllFilters : function(oEvent) {
			var oTable = this.byId("table1");

			

			this._oGlobalFilter = null;
			this._oPriceFilter = null;
			this._filter();

			var aColumns = oTable.getColumns();
			for (var i = 0; i < aColumns.length; i++) {
				oTable.filter(aColumns[i], null);
			}
		},

		// onSearch: function (oEvent) {
		// 	// add filter for search
		// 	var aFilters = [];
		// 	var sQuery = oEvent.getSource().getValue();
		// 	if (sQuery && sQuery.length > 0) {
		// 		var filter = new Filter("lifnr", FilterOperator.Contains, sQuery);
		// 		aFilters.push(filter);
		// 	}

		// 	// update list binding
		// 	var oList = this.byId("table1");
		// 	var oBinding = oList.getBinding("items");
		// 	oBinding.filter(aFilters, "Application");
		// },

		// onSelectionChange: function (oEvent) {
		// 	var oList = oEvent.getSource();
		// 	var oLabel = this.byId("idFilterLabel");
		// 	var oInfoToolbar = this.byId("idInfoToolbar");

		// 	console.log(oList._aSelectedPaths);
		// 	var aContexts = oList.getSelectedContexts(true);
        //     console.log(aContexts);
        //     var seleccion = []
        //     if(oList._aSelectedPaths){
        //         oList._aSelectedPaths.forEach(element => {
                  
        //             seleccion.push(element.split('/')[2])
        //         });
        //     }
		// 	// update UI
        //     var bSelected = (aContexts && aContexts.length > 0);
        //     var sText = aContexts.length;
        //     var poModel = this.getModel("cotizacionesModel");
        //     poModel.setProperty('/selected', aContexts.length);
        //     poModel.setProperty('/posiciones', seleccion);
        //     if (seleccion.length>0) {
        //         poModel.setProperty('/okSend', true);
        //     }else{
        //          poModel.setProperty('/okSend', false);
        //     }
		// 	oInfoToolbar.setVisible(bSelected);
        //     oLabel.setText(sText);
        //     console.log(seleccion);
            
		// }

	});
});