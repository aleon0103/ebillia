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
                    busy: true,
                    showSelectedAll: true,
                    showDeselectedAll: false
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
                        title: "{i18n>bucarComplemento}",
                        content: [
                            new sap.m.Label("label1", {
                                text: "{i18n>fechaIni}"
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
                                text: "{i18n>fechaFin}"
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
                            text: "{i18n>buscar}",
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
                            text: "{i18n>cancelar}",
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
                var fModel = this.getModel("facturas");
                this._getFacturasPendientes(this.dateFormattedFinish, this.dateFormattedToday);
                
                // limpiar tabla
                this._clearTable()
                // mostrar btn seleccionar todos
                fModel.setProperty("/showDeselectedAll", false);
                fModel.setProperty("/showSelectedAll", true);
            },

            onSelectionChange: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("listItem");
                var oSelected = oEvent.getParameter("selected");
                var oContext = oSelectedItem.getBindingContext("facturas");
                var objectSolicitud = oContext.oModel.getProperty(oContext.sPath);
                
                objectSolicitud = JSON.stringify(objectSolicitud);
                this.getRouter().navTo("cargarComplementosDetail", { item: objectSolicitud, isSelected: oSelected }, true);
            },

            _checkAll: function (selected) {
                var oList = this.byId("list");
                var tablaModel = this.getModel("tablaModel");
                // var selected = oEvent.getParameter("selected");
                var fModel = this.getModel("facturas");

                if (selected) {
                    oList.removeSelections(true);
                    oList.selectAll();    
                    tablaModel.setProperty("/data", fModel.getProperty("/results"));
                    tablaModel.setProperty("/Count", fModel.getProperty("/results").length);

                    // mostrar btn deseleccionar todos
                    fModel.setProperty("/showSelectedAll", false);
                    fModel.setProperty("/showDeselectedAll", true);
                    

                    var arraySolicitud = JSON.stringify(fModel.getProperty("/results"));
                    this.getRouter().navTo("cargarComplementosDetail", { item: arraySolicitud, isSelected: true }, true);
                } else {
                    // mostrar btn seleccionar todos
                    fModel.setProperty("/showDeselectedAll", false);
                    fModel.setProperty("/showSelectedAll", true);

                    oList.removeSelections(true);
                    this._clearTable();
                    this.getRouter().navTo("CargarComplementos", { param: false}, true);
                }   
                tablaModel.refresh(true);
            },

            _clearTable: function () {
                var tablaModel = this.getModel("tablaModel");
                tablaModel.setProperty("/data", []);
                tablaModel.setProperty("/Count", 0);
                tablaModel.refresh(true);
            }
        });
    })