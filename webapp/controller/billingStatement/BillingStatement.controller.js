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

                var oFilter = this.getView().byId("filterBarBS");
                var textButtonGo;
                var textButtonClear;
                var that = this;
                
                oFilter.addEventDelegate({
                    "onAfterRendering": function(oEvent) {
                       
                        that.getModel("i18n").getResourceBundle().then(function (oBundle) {
                            textButtonGo = oBundle.getText("BuscarBS");
                            textButtonClear = oBundle.getText("BorrarBS");

                            var oButton = oEvent.srcControl._oSearchButton;
                            oButton.setText(textButtonGo);
                            var clearButton = oEvent.srcControl._oClearButtonOnFB;
                            clearButton.setText(textButtonClear);
                        });

                    }
                });

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
                this.onReset();
                this._oModel = this.getModel("user");
                this.rol = this._oModel.getProperty('/rol/id');

                
                if (this.rol && this.rol !== 3) {
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
                

            },

            clearFilters: function (oControlEvent) {
                this.onReset();
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
                        fechaFin = inputFF.getValue(); 
                    

                        // var fecha = value.split('-');
                        // this.byId("fechaFinBS").setMinDate(new Date(fecha[0]+'/'+fecha[1]+'/'+fecha[2]));
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

                        
                        // var fecha = value.split('-');
                        // this.byId("fechaInicioBS").setMaxDate(new Date(fecha[0]+'/'+fecha[1]+'/'+fecha[2]));
                    }

                } else {

                    this.getView().byId("fechaFinBS").setValue("");
                   

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
                if (this.rol && this.rol !== 3) {
                    proveedor = this.getView().byId("proveedorBS").getSelectedKey();
                } else {
                    proveedor = this._oModel.getProperty('/id');
                }

                var validDate = false;
                if (fechaInicio !== "" && fechaFin == "") {
                    validDate = false;
                } else if (fechaInicio == "" && fechaFin !== "") {
                    validDate = false;
                } else if (fechaInicio !== "" && fechaFin !== "") {
                    validDate = true;
                }

               

                if (validDate && proveedor !== "") {
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
            },

            downloadFileXML: function (oEvent) {
                var row = oEvent.getSource().getBindingContext("billingStatementView").getObject();
                // console.log(row);
                
                    
                    var oBusy = this.getModel("busyPage");
                    oBusy.setProperty("/busy", true);

                    var path = API.serviceList().GET_DOCUMENTS_ALL + 
                    `?num_proveedor=${row.proveedor}&uuid=${row.uuid}&sociedad=${row.sociedad}`;
                    API.Get(path).then(
                        function (respJson, paramw, param3) {
                            
                            this.response = respJson.data;
                            
                            if (respJson.message !== 'OK') {
                                MessageToast.show(respJson.message);
                            } else {
                                if (this.response[0] && this.response[0].URLXML && this.response[0].URLXML !== '') {
                                    
                                    const win = window.open(this.response[0].URLXML, '_blank');
                                    if (win) {
                                        win.focus();
                                    } else {
                                        alert('Por favor activa los popups en tu navegador');
                                    }

                                }
                                
                            }

                            oBusy.setProperty("/busy", false);

                        }, function (err) {
                            console.log("error in processing your request", err);
                            oBusy.setProperty("/busy", false);
                            MessageToast.show(err.error.message);
                    });
                    
                    

            },


            downloadFilePDF: function (oEvent) {
                var row = oEvent.getSource().getBindingContext("billingStatementView").getObject();
                
                var oBusy = this.getModel("busyPage");
                    oBusy.setProperty("/busy", true);

                    var path = API.serviceList().GET_DOCUMENTS_ALL + 
                    `?num_proveedor=${row.proveedor}&uuid=${row.uuid}&sociedad=${row.sociedad}`;
                    API.Get(path).then(
                        function (respJson, paramw, param3) {
                            
                            this.response = respJson.data;
                            
                            if (respJson.message !== 'OK') {
                                MessageToast.show(respJson.message);
                            } else {
                                if (this.response[0] && this.response[0].URLPDF && this.response[0].URLPDF !== '') {
                                    
                                    const win = window.open(this.response[0].URLPDF, '_blank');
                                    if (win) {
                                        win.focus();
                                    } else {
                                        alert('Por favor activa los popups en tu navegador');
                                    }

                                }
                            }

                            oBusy.setProperty("/busy", false);

                        }, function (err) {
                            console.log("error in processing your request", err);
                            oBusy.setProperty("/busy", false);
                            MessageToast.show(err.error.message);
                    });

            }

        });
})