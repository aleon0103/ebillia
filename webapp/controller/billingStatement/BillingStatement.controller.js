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
        
        return BaseController.extend("ns.EBilliaApp.controller.BillingStatement", {
        formatter: FormatterREP,
        _oModel: null,
        rol: null,
        _proveedoresModel: null,
        _dataTableModel: null,
        

            onInit: function () {
                console.log("on Billing Statement componet view");

                this._oRouter = this.getRouter();
                this._oRouter.getRoute("VerEstadoDeCuenta").attachPatternMatched(this._routePatternMatched, this);

                var oFilter = this.getView().byId("filterBarBS"),
				that = this;

                this._proveedoresModel = new JSONModel({});
                this.getView().setModel(this._proveedoresModel, "proveedores");

                this._dataTableModel = new JSONModel({
                    items: ''
                });
                this.setModel(this._dataTableModel, "billingStatementView");
                

                this.busy = new JSONModel({
                    busy: false
                });
                this.setModel(this.busy, "busyPage");
                

            },

            _routePatternMatched: function (oEvent) {

                console.log("ROUTE Billing Statement MATCH");
                // this.onReset();
                this._oModel = this.getModel("user");
                this.rol = this._oModel.getProperty('/rol/id');

                console.log(this.rol);
                if (this.rol && this.rol != 3) {
                    this.byId("selectProveedores").setVisible(true);
                    this.byId("fechaContabilizacionColumn").setVisible(true);
                    this.byId("NoDocumentoColumn").setVisible(true);
                } else {
                    this.byId("selectProveedores").setVisible(false);
                    this.byId("fechaContabilizacionColumn").setVisible(false);
                    this.byId("NoDocumentoColumn").setVisible(false);
                }

               
            },
            
            onReset: function (oEvent) {
                this._proveedoresModel.setData({modelData:{}});
                this._proveedoresModel.updateBindings(true);
                this._dataTableModel.setData({modelData:{}});
                this._dataTableModel.updateBindings(true);
                this.getView().byId("fechaInicioBS").setValue("");
                this.getView().byId("fechaFinBS").setValue("");
                this.getView().byId("ordenCompraBS").setValue("");
                this.getView().byId("noDocumentoBS").setValue("");
                this.getView().byId("proveedorBS").setSelectedKey("");
                this.getView().byId("BSFechaFin").setMandatory(false);
                this.getView().byId("BSFechaInicio").setMandatory(false);
            },

            clearFilters: function (oControlEvent) {
                this.onReset();
                this.getView().byId("ordenCompraBS").setEnabled(true);
                this.getView().byId("noDocumentoBS").setEnabled(true);
                this.getView().byId("fechaInicioBS").setEnabled(true);
                this.getView().byId("fechaFinBS").setEnabled(true);
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

            fechaInicioChange: function (oControlEvent) {
                var value = oControlEvent.getParameter("value");
                var bValid = oControlEvent.getParameter("valid");
                var inputFF = this.getView().byId("fechaFinBS"); 
                var fechaFin;
                
                if (bValid) {

                    if (value !== "") {
                        fechaFin = inputFF.getValue(); console.log(fechaFin);
                    
                        if (fechaFin == "") {
                            this.getView().byId("BSFechaFin").setMandatory(true);
                        } else {
                            this.getView().byId("BSFechaFin").setMandatory(false);
                        }
                        
                        this.getView().byId("ordenCompraBS").setEnabled(false);
                        this.getView().byId("noDocumentoBS").setEnabled(false);
                        this.getView().byId("BSFechaInicio").setMandatory(false);
                    }
                    
                } else {

                    this.getView().byId("fechaInicioBS").setValue("");
                   
                }
            },

            fechaFinChange: function (oControlEvent) {
                var value = oControlEvent.getParameter("value");
                var bValid = oControlEvent.getParameter("valid");
                var inputFI = this.getView().byId("fechaInicioBS"); 
                var fechaInicio;

                if (bValid) {

                    if (value !== "") {
                        fechaInicio = inputFI.getValue();

                        if (fechaInicio == "") {
                            this.getView().byId("BSFechaInicio").setMandatory(true);
                        } else {
                            this.getView().byId("BSFechaInicio").setMandatory(false);
                        }

                        this.getView().byId("ordenCompraBS").setEnabled(false);
                        this.getView().byId("noDocumentoBS").setEnabled(false);
                        this.getView().byId("BSFechaFin").setMandatory(false);
                    }

                } else {

                    this.getView().byId("fechaFinBS").setValue("");
                   

                }
                
                
            },

            ordenCompraChange: function (oControlEvent) {
                var ocValue = this.getView().byId("ordenCompraBS").getValue(); 

                if (ocValue == "") {
                    this.getView().byId("noDocumentoBS").setEnabled(true);
                    this.getView().byId("fechaInicioBS").setEnabled(true);
                    this.getView().byId("fechaFinBS").setEnabled(true);
                } else {
                    this.getView().byId("noDocumentoBS").setEnabled(false);
                    this.getView().byId("fechaInicioBS").setEnabled(false);
                    this.getView().byId("fechaFinBS").setEnabled(false);
                }
            },

            noDocumentoChange: function (oControlEvent) {
                var noDocValue = this.getView().byId("noDocumentoBS").getValue(); 

                if (noDocValue == "") {
                    this.getView().byId("ordenCompraBS").setEnabled(true);
                    this.getView().byId("fechaInicioBS").setEnabled(true);
                    this.getView().byId("fechaFinBS").setEnabled(true);
                } else {
                    this.getView().byId("ordenCompraBS").setEnabled(false);
                    this.getView().byId("fechaInicioBS").setEnabled(false);
                    this.getView().byId("fechaFinBS").setEnabled(false);
                }
            },

            generarReporte: function () {
                var oViewModel = this.getModel("billingStatementView");

                var fechaInicio = this.getView().byId("fechaInicioBS").getValue();
			    var fechaFin = this.getView().byId("fechaFinBS").getValue();
                var ordenCompra = this.getView().byId("ordenCompraBS").getValue();
                var noDocumento = this.getView().byId("noDocumentoBS").getValue();
                var sociedad = "";
                
                var proveedor;
                if (this.rol && this.rol != 3) {
                    proveedor = this.getView().byId("proveedorBS").getSelectedKey();
                } else {
                    proveedor = this._oModel.getProperty('/id');
                }

                var flag = true;
                if (fechaInicio !== "" && fechaFin == "") {
                    flag = false;
                } else if (fechaInicio == "" && fechaFin !== "") {
                    flag = false;
                } else if (fechaInicio !== "" && fechaFin !== "") {
                    flag = true;
                } else if (fechaInicio == "" && fechaFin == "" && ordenCompra == "" && noDocumento == "") {
                    flag = false;
                }
                

                if (flag || ordenCompra !== "" || noDocumento !== "") {
                    var oBusy = this.getModel("busyPage");
                    oBusy.setProperty("/busy", true);

                    var path = API.serviceList().GET_EDO_CUENTA + 
                    `?fecha_fin=${fechaFin}&fecha_inicio=${fechaInicio}&num_documento=${noDocumento}&orden_compra=${ordenCompra}&sociedad=${sociedad}&proveedor=${proveedor}`;
                    API.Get(path).then(
                        function (respJson, paramw, param3) {
                            
                            this.response = respJson.data;
                            
                            if (respJson.message == 'OK') {

                                for (let i = 0; i < this.response.length; i++ ) {
                                    if (this.response[i].pago == 'X') {
                                        this.response[i].estatusValue = 'Pagado';
                                    } else if (this.response[i].pago == 'Y') {
                                        this.response[i].estatusValue = 'Pago parcial';
                                    } else if (this.response[i].pago == '' || this.response[i].pago == null) {
                                        this.response[i].estatusValue = 'Sin pago';
                                    } else if (this.response[i].pago == 'C') {
                                        this.response[i].estatusValue = 'Cancelado';
                                    }
                                }

                                oViewModel.setProperty('/items', this.response);

                            } else {
                                oViewModel.setProperty('/items', []);

                            }

                            oViewModel.refresh();
                            oBusy.setProperty("/busy", false);

                        }, function (err) {
                            console.log("error in processing your request", err);
                            oBusy.setProperty("/busy", false);
                            MessageToast.show(err.error.message);
                    });

                } else {
                   console.log('Complete fields');
                }
            }

        });
})