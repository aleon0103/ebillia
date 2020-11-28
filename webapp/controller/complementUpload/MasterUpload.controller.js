// @ts-ignore
sap.ui.define([
    "./../BaseController",
    "./../APIController",
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageToast',
    "sap/ui/Device",
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/ui/core/Core",
    "sap/ui/core/format/NumberFormat",
    "sap/ui/core/format/DateFormat"
],
    function (BaseController, API, JSONModel, MessageToast, Device, Dialog, DialogType, Button, ButtonType, Core,
            NumberFormat, DateFormat) {
        "use strict";
        return BaseController.extend("ns.EBilliaApp.controller.MasterUpload", {
            dateFormattedFinish: null,
            dateFormattedToday: null,

            onInit: function () {
                this.dateFormattedFinish = "";
                this.dateFormattedToday = "";

                var oModelFacturas = new JSONModel({
                    results: null,
                    busy: true
                });
                this.getView().setModel(oModelFacturas, "facturas");

                this._oRouter = this.getRouter();
                this._oRouter.getRoute("CargarComplementos").attachPatternMatched(this._routePatternMatched, this);

            },

            _routePatternMatched: function (oEvent) {
                var oArguments = oEvent.getParameter("arguments");
                var updateList = JSON.parse(oArguments.param);

                var dateObjToday = new Date();

                /* Fecha 15 dias antes */
                var dieciseisDias = 1000 * 60 * 60 * 24 * 15;
                var resta = dateObjToday.getTime() - dieciseisDias;
                var fechaAtras = new Date(resta);

                // @ts-ignore
                var dateFormat = DateFormat.getDateInstance({
                    pattern: "yyyy-MM-dd"
                });

                this.dateFormattedToday = dateFormat.format(dateObjToday, false);
                this.dateFormattedFinish = dateFormat.format(fechaAtras, false);

                
                if (updateList) {
                    this.onRefresh();
                }
                
            },

            _getFacturasPendientes: function (fechaAtras, fechaHoy) {
                var oModelUser = this.getModel("user").getData();
                var userId = oModelUser.id;

                var poModel = this.getModel("facturas");
                poModel.setProperty('/busy', true);
                var that = this;

                var path = API.serviceList().FACTURAS_PENDIENTES + `facturas-pendientes?proveedor=${userId}&fechai=${fechaAtras}&fechaf=${fechaHoy}`;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                        poModel.setProperty('/busy', false);

                        console.log(respJson);

                        // limpiar seleccion de lista
                        var oList = that.byId("list");
                        oList.removeSelections(true);
                        var oBinding = oList.getBinding("items");
                        
                        if (respJson) {

                            poModel.setProperty('/results', respJson)
                            oBinding.refresh(true);
                            if (respJson) {
                                poModel.setProperty('/Count', respJson.length)

                            } else {
                                poModel.setProperty('/Count', 0)
                            }

                            poModel.refresh();
                        }
                    }, function (err) {

                        console.log("error in processing your request", err);
                    });
            },

            _onOpenViewFilters: function () {
                var that = this;

                if (!this.oSubmitDialog) {
                    this.oSubmitDialog = new Dialog({
                        type: DialogType.Message,
                        title: "Buscar Complemento",
                        content: [
                            new sap.m.Label("label1", {
                                text: "Fecha inicio"
                            }),
                            new sap.m.DatePicker("dpValue1", {
                                displayFormat: "yyyy-MM-dd",
                                valueFormat: "yyyy-MM-dd",
                                change: function (oEvent) {
                                    var finicio = oEvent.getParameters("value");
                                    var valueSplit = finicio.value.split("-");
                                    var value = new Date(+valueSplit[0], valueSplit[1] - 1, +valueSplit[2]);
                                    Core.byId("dpValue2").setValue(null);
                                    Core.byId("dpValue2").setMinDate(value);
                                }.bind(this)
                            }),
                            new sap.m.Label("label2", {
                                text: "Fecha fin"
                            }),
                            new sap.m.DatePicker("dpValue2", {
                                displayFormat: "yyyy-MM-dd",
                                valueFormat: "yyyy-MM-dd",
                                change: function (oEvent) {
                                    var ffin = oEvent.getParameters("value");
                                    var finicio = Core.byId("dpValue1").getValue();
                                    this.oSubmitDialog.getBeginButton().setEnabled(ffin.value.length > 0 && finicio.length > 0);
                                }.bind(this)
                            })
                        ],
                        beginButton: new Button({
                            type: ButtonType.Emphasized,
                            text: "Buscar",
                            enabled: false,
                            press: function () {
                                var fechaInicio = Core.byId("dpValue1").getValue();
                                var fechaFin = Core.byId("dpValue2").getValue();
                                this.getRouter().navTo("CargarComplementos", { param: false}, true);
                                this._clearTable();
                                this._getFacturasPendientes(fechaInicio, fechaFin);
                                this.oSubmitDialog.close();
                            }.bind(this)
                        }),
                        endButton: new Button({
                            text: "Cancelar",
                            press: function () {
                                this.oSubmitDialog.close();
                            }.bind(this)
                        }),
                        afterClose: function () {
                            that.oSubmitDialog.destroyContent();
                            that.oSubmitDialog = null;
                        }
                    });
                    this.getView().addDependent(this.oSubmitDialog);
                }
                this.oSubmitDialog.open();
            },

            onRefresh: function () {
                this._getFacturasPendientes(this.dateFormattedFinish, this.dateFormattedToday);
                
                // limpiar tabla
                this._clearTable()
                this.byId("check").setSelected(false);
            },

            onSelectionChange: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("listItem");
                var oSelected = oEvent.getParameter("selected");
                var oContext = oSelectedItem.getBindingContext("facturas");
                var objectSolicitud = oContext.oModel.getProperty(oContext.sPath);
                
                objectSolicitud = JSON.stringify(objectSolicitud);
                this.getRouter().navTo("cargarComplementosDetail", { item: objectSolicitud, isSelected: oSelected }, true);
            },

            _checkAll: function (oEvent) {
                var oList = this.byId("list");
                var tablaModel = this.getModel("tablaModel");
                var selected = oEvent.getParameter("selected");
                var fModel = this.getModel("facturas");

                if (selected) {
                    oList.removeSelections(true);
                    oList.selectAll();    
                    tablaModel.setProperty("/data", fModel.getProperty("/results"));
                    tablaModel.setProperty("/Count", fModel.getProperty("/results").length);

                    var arraySolicitud = JSON.stringify(fModel.getProperty("/results"));
                    this.getRouter().navTo("cargarComplementosDetail", { item: arraySolicitud, isSelected: true }, true);
                } else {
                    oList.removeSelections(true);
                    this._clearTable();
                    this.getRouter().navTo("CargarComplementos", { param: false}, true);
                }   
                tablaModel.refresh(true);
            },

            _formatCurrency: function () {
                var oLocale = new sap.ui.core.Locale("en-US");
                var oFormat = NumberFormat.getCurrencyInstance({
                    "currencyCode": false,
                    "customCurrencies": {
                        "MyCurr": {
                            "isoCode": "USD",
                            "decimals": 3,
                            "symbol": "$"
                        }

                    }
                }, oLocale);

                return oFormat;
            },

            _clearTable: function () {
                var tablaModel = this.getModel("tablaModel");
                tablaModel.setProperty("/data", []);
                tablaModel.setProperty("/Count", 0);
                tablaModel.refresh(true);
            },










            _searchOrderById: function (orderId) {
                console.log('searchOrder.. ', orderId);

                var oModel = this.getModel("user");
                var rol = oModel.getProperty('/rol/id');
                var userId = oModel.getProperty('/id');
                console.log('Get purchase order by id');
                var poModel = this.getModel("purchaseOrderModel");
                poModel.setProperty('/busy', true);
                var me = this;
                //https://arcade.flexi.com.mx:8762/portal_cloud_api/logistic-services/Proveedores-facturas/OrdenDeCompraConfirmada/4500376391
                var path = API.serviceList().PROVEEDORES_FACTURAS + `OrdenDeCompraConfirmada/${orderId}`;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                        poModel.setProperty('/busy', false);
                        if (respJson && respJson.data) {
                            poModel.setProperty('/busy', false);
                            var result = [];
                            result[0] = respJson.data;
                            poModel.setProperty('/PurchaseOrders', result)
                            if (respJson.data) {
                                poModel.setProperty('/Count', respJson.data.length)

                            } else {
                                poModel.setProperty('/Count', 0)
                                poModel.setProperty('/PurchaseOrders', [])
                            }

                            poModel.refresh();
                        } else {
                            MessageToast.show(respJson.message);
                            poModel.setProperty('/Count', 0)
                            poModel.setProperty('/PurchaseOrders', [])

                        }
                    }, function (err) {
                        poModel.setProperty('/busy', false);
                        MessageToast.show(err.error.message);
                        poModel.setProperty('/Count', 0)
                        poModel.setProperty('/PurchaseOrders', [])

                        console.log("error in processing your request", err);
                    });
            }
        });
    })