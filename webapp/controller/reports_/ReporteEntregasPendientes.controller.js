sap.ui.define([
    "./../BaseController",
    "./../APIController",
    "../../model/FormatterREP",
    "sap/ui/core/mvc/Controller",
    'sap/ui/core/syncStyleClass',
    'sap/m/ActionSheet',
    'sap/m/Button',
    'sap/m/library',
    'sap/m/Link',
    'sap/ui/core/Fragment',
    'sap/m/MessageToast',
    "sap/ui/model/json/JSONModel",
    
],
    function (BaseController, API, FormatterREP, Controller, syncStyleClass, ActionSheet, Button, mobileLibrary,  Link, Fragment, MessageToast, JSONModel) {
        "use strict";
        var proveedoresData;
        

        return BaseController.extend("ns.EBilliaApp.controller.ReporteEntregasPendientes", {
        _oModel: null,
        rol: null,
        _proveedoresModel: null,
        _dataTableModel: null,
        sCollection: "/Data",
        aCrumbText: "",
        aCrumbs: ["arrayTmp", "posiciones"],
        flag: false,
        mInitialOrderState: {
			products: {},
			count: 0,
			hasCounts: false
		},

            onInit: function () {
                console.log("on REP componet view");

                this._oRouter = this.getRouter();
                this._oRouter.getRoute("ReporteEntregasPendientes").attachPatternMatched(this._routePatternMatched, this);

                var oFilter = this.getView().byId("filterBarREP"),
				that = this;
                
                

                this._proveedoresModel = new JSONModel({});
                this.getView().setModel(this._proveedoresModel, "proveedores");

                this._dataTableModel = new JSONModel({});

                if (!this.oTemplate) {
                    this.oTemplate = sap.ui.xmlfragment("ns.EBilliaApp.view.reports_.RowReporteEntregasPendientes");
                }
                
                this._oTable = this.byId("idProductsTable");

                this.busy = new JSONModel({
                    busy: false
                });
                this.setModel(this.busy, "busyPage");
                

            },

            _routePatternMatched: function (oEvent) {

                console.log("ROUTE REP MATCH");
                this.onReset();
                this._oModel = this.getModel("user");
                this.rol = this._oModel.getProperty('/rol/id');

                console.log(this.rol);
                if (this.rol && this.rol != 3) {
                    this.byId("selectProveedores").setVisible(true);
                } else {
                    this.byId("selectProveedores").setVisible(false);
                }
            },
            
            onReset: function (oEvent) {
                this._proveedoresModel.setData({modelData:{}});
                this._proveedoresModel.updateBindings(true);
                this._dataTableModel.setData({modelData:{}});
                this._dataTableModel.updateBindings(true);
                this.getView().byId("fechaInicioREP").setValue("");
                this.getView().byId("fechaFinREP").setValue("");
			    this.getView().byId("ordenCompraREP").setValue("");
                this.getView().byId("proveedorREP").setSelectedKey("");
            },


           	handleLoadItems: function(oControlEvent) {
                oControlEvent.getSource().getBinding("items").resume();
            },

            handleChange: function() {
                var fechaInicio = this.getView().byId("fechaInicioREP").getValue();
			    var fechaFin = this.getView().byId("fechaFinREP").getValue();
                var proveedor = this.getView().byId("proveedorREP").getSelectedKey();
                
                if (fechaInicio == '') { 
                    this.getView().byId("fechaInicioREP").setValueState(sap.ui.core.ValueState.Error);
                } else {
                    this.getView().byId("fechaInicioREP").setValueState(sap.ui.core.ValueState.None);
                }

                if (fechaFin == '') {
                    this.getView().byId("fechaFinREP").setValueState(sap.ui.core.ValueState.Error);
                } else {
                    this.getView().byId("fechaFinREP").setValueState(sap.ui.core.ValueState.None);
                }

                if (this.rol !== 3) {
                    if (!proveedor) {
                        this.getView().byId("proveedorREP").setValueState(sap.ui.core.ValueState.Error);
                    } else {
                        this.getView().byId("proveedorREP").setValueState(sap.ui.core.ValueState.None);
                    }
                }
                
            },
        
            _getInitialPath: function () {

                return [this.sCollection, this.aCrumbs[0]].join("/");
               
            },

            _nextCrumb: function (sCrumb) {
                for (var i = 0, ii = this.aCrumbs.length; i < ii; i++) {
                    if (this.aCrumbs[i] === sCrumb) {
                        return this.aCrumbs[i + 1];
                    }
                }
            },

            _stripItemBinding: function (sPath) {
                var aParts = sPath.split("/");
                return aParts.slice(0, aParts.length - 1).join("/");
            },

            _setAggregation: function (sPath) {
                // If we're at the leaf end, turn off navigation
                console.log(sPath);
                var sPathEnd = sPath.split("/").reverse()[0];
                if (sPathEnd === this.aCrumbs[this.aCrumbs.length - 1]) {
                    this._oTable.setMode("SingleSelectMaster");
                    this.byId("proveedorColumn").setVisible(false);
                    this.byId("fechaDocColumn").setVisible(false);
                    this.byId("ordenColumn").setVisible(false);
                    this.byId("posicionColumn").setVisible(true);
                    this.byId("materialColumn").setVisible(true);
                    this.byId("posicionColumn").setVisible(true);
                    this.byId("descripcionColumn").setVisible(true);
                    this.byId("vamColumn").setVisible(true);
                    this.byId("fechaEntregaColumn").setVisible(true);
                    this.byId("cantidadPedidoColumn").setVisible(true);
                    this.byId("cantidadPendienteColumn").setVisible(true);
                    this.byId("cantidadRecibidoColumn").setVisible(true);
                } else {
                    this._oTable.setMode("SingleSelectMaster");
                    this.byId("proveedorColumn").setVisible(true);
                    this.byId("fechaDocColumn").setVisible(true);
                    this.byId("ordenColumn").setVisible(true);
                    this.byId("posicionColumn").setVisible(false);
                    this.byId("materialColumn").setVisible(false);
                    this.byId("posicionColumn").setVisible(false);
                    this.byId("descripcionColumn").setVisible(false);
                    this.byId("vamColumn").setVisible(false);
                    this.byId("fechaEntregaColumn").setVisible(false);
                    this.byId("cantidadPedidoColumn").setVisible(false);
                    this.byId("cantidadPendienteColumn").setVisible(false);
                    this.byId("cantidadRecibidoColumn").setVisible(false);
                }

                // Set the new aggregation
                console.log(sPath);
                this._oTable.bindAggregation("items", sPath, this.oTemplate);
            },

            // Add to the order based on the selection
            _updateOrder: function (oSelectionInfo) {
                var oOrderModel = this.getView().getModel("Order");
                oOrderModel.setData({products: oSelectionInfo}, true);
                var aProductsSelected = FormatterREP.listProductsSelected(this.getView());
                oOrderModel.setData({
                    count: aProductsSelected.length,
				    hasCounts: aProductsSelected.length > 0
                }, true);
            },

            // Removes unwanted links added to breadcrumb and updates the breadcrumb
            onBreadcrumbPress: function (oEvent, sPath) {
                var oLink = oEvent.getSource();
                var oBreadCrumb = this.byId("breadcrumb");
                var iIndex = oBreadCrumb.indexOfLink(oLink);
                var aCrumb = oBreadCrumb.getLinks().slice(iIndex + 1);
                if (aCrumb.length) {
                    aCrumb.forEach(function(oLink) {
                        oLink.destroy();
                    });
                    this._setAggregation(sPath);
                }
            },

            // Handles breadcrumb creation and binding
            // Take care of the navigation through the hierarchy when the
            // user selects a table row
            handleSelectionChange: function (oEvent) {
                var sPath = oEvent.getParameter("listItem").getBindingContextPath();
                var aPath = sPath.split("/"); 
                var sPathEnd = sPath.split("/").reverse()[1]; 
                var sCurrentCrumb = aPath[aPath.length - 2]; 
                
                if (sPathEnd !== this.aCrumbs[this.aCrumbs.length - 1]) { 
                    var oBreadCrumb = this.byId("breadcrumb");
                    var sPrevNode = aPath[aPath.length - 2]; 
                    var iCurNodeIndex = this.aCrumbs.indexOf(sPrevNode) + 1;

                    var oLink = new Link({
                        text: "{ORDEN_COMPRA}",
                        press:[sPath + "/" + this.aCrumbs[iCurNodeIndex], this.onBreadcrumbPress, this]
                    });

                    oLink.bindElement({
                        path : sPath
                    });
                    oBreadCrumb.addLink(oLink);
                }

                // If we're on a leaf, remember the selections;
                // otherwise navigate
                if (sCurrentCrumb === this.aCrumbs[this.aCrumbs.length - 1]) { 
                    var oSelectionInfo = {};
                    var bSelected = oEvent.getParameter("selected");
                    
                } else { 
                    var sNewPath = [sPath, this._nextCrumb(sCurrentCrumb)].join("/");
                    this._setAggregation(sNewPath);
                }
            },

            



 getProveedores: function (value) {
                var me = this;
                var path = API.serviceList().GET_PROVEEDORES_CATALOG + `?value=${value}`;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                        
                        if (respJson) {
                            me.proveedoresData = respJson;

                            var localModel = me.getModel("proveedores");
							localModel.setData(me.proveedoresData);
                            sap.ui.getCore().setModel(localModel);
                            me._proveedoresModel.refresh(true);
                        }

                    }, function (err) {
                        console.log("error in processing your request", err);
                });
            },

            handleChangeProv: function (oEvent) {
                var oValidatedComboBox = oEvent.getSource(),
                    sSelectedKey = oValidatedComboBox.getSelectedKey(),
                    sValue = oValidatedComboBox.getValue();

                this.getProveedores(sValue);
            },

            generarReporte: function () {
                var oLink = new Link({});
                var oBreadCrumb = this.byId("breadcrumb");
                var iIndex = oBreadCrumb.indexOfLink(oLink);
                var aCrumb = oBreadCrumb.getLinks().slice(iIndex + 1);
                if (aCrumb.length) {
                    aCrumb.forEach(function(oLink) {
                        oLink.destroy();
                    });
                }

                var fechaInicio = this.getView().byId("fechaInicioREP").getValue();
			    var fechaFin = this.getView().byId("fechaFinREP").getValue();
			    var ordenCompra = this.getView().byId("ordenCompraREP").getValue();
                
                var proveedor;
                if (this.rol && this.rol != 3) {
                    proveedor = this.getView().byId("proveedorREP").getSelectedKey();
                } else {
                    proveedor = this._oModel.getProperty('/id');
                }
                
                var me = this;
                if (fechaInicio !== "" && fechaFin !== "" && proveedor !== "") {
                     var oBusy = this.getModel("busyPage");
                     oBusy.setProperty("/busy", true);

                    var path = API.serviceList().GET_REPORTE_ENTREGAS_PENDIENTES + 
                                    `${proveedor}?fecha_fin=${fechaFin}&fecha_inicio=${fechaInicio}&num_oc=${ordenCompra}`;
                    API.Get(path).then(
                        function (respJson, paramw, param3) {
                            
                            console.log(respJson);
                            this.response = respJson.data;
                            let cabecera;
                            let arrayTmp = []

                            if (respJson.message == 'OK') {

                            if (this.response.IT_SALDOS_CABECERA !== null && this.response.IT_SALDOS_POSICION !== null) {

                                if (this.response.IT_SALDOS_CABECERA.length) {
                                    for (let i = 0; i < this.response.IT_SALDOS_CABECERA.length; i++) {
                                    
                                        cabecera = this.response.IT_SALDOS_CABECERA[i]
                                        const result = this.response.IT_SALDOS_POSICION.filter(p => p.ORDEN_COMPRA == cabecera.ORDEN_COMPRA);
                        
                                        let obj = {
                                            FECHA_DOC: cabecera.FECHA_DOC,
                                            ORDEN_COMPRA: cabecera.ORDEN_COMPRA,
                                            PROVEEDOR: cabecera.PROVEEDOR,
                                            posiciones: result
                                        }
                                        
                                        arrayTmp.push(obj)
                                        
                                    }
                                }
                
                                } else {
                                    arrayTmp = []
                                }

                            } else {
                                arrayTmp = []
                            }

                            let objFinal = {
                                Data : {
                                    arrayTmp
                                }
                            }
                            
                            var sPath = objFinal;
                            me._dataTableModel = new JSONModel(sPath); 
                            me.getView().setModel(me._dataTableModel);
                            me.getView().setModel(new JSONModel(me.mInitialOrderState), "Order");
                            me._dataTableModel.refresh(true);

                            sPath = me._getInitialPath(); 
                            me._setAggregation(sPath);
                            var oBreadCrumb = me.byId("breadcrumb"); 

                            oLink = new Link({
                                text: "Ordenes", 
                                press:[sPath, me.onBreadcrumbPress, me]
                            }); 
                            oBreadCrumb.addLink(oLink); 

                            oBusy.setProperty("/busy", false);
                        }, function (err) {
                            console.log("error in processing your request", err);
                            oBusy.setProperty("/busy", false);
                            MessageToast.show(err.error.message);
                    });

                } else {
                   // this.handleChange();
                   console.log('Complete fields');
                }
            }

        });
})