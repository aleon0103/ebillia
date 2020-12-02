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
        return BaseController.extend("ns.EBilliaApp.controller.MasterSee", {

            onInit: function () {

                var oModelFacturas = new JSONModel({
                    results: null,
                    busy: false,
                    Count: 0
                });
                this.getView().setModel(oModelFacturas, "facturas");

                this._oRouter = this.getRouter();
                this._oRouter.getRoute("VerComplementos").attachPatternMatched(this._routePatternMatched, this);

            },

            _routePatternMatched: function (oEvent) {
                
                
            },

            _getComplementos: function (fechaAtras, fechaHoy) {
                var oModelUser = this.getModel("user").getData();
                var userId = oModelUser.id;

                var poModel = this.getModel("facturas");
                poModel.setProperty('/busy', true);
                var that = this;

                var path = API.serviceList().ENVIO_ARCHIVOS_COMPLEMENTOS + `${userId}?desde=${fechaAtras}&hasta=${fechaHoy}&estatus=Cargado&noDocPago=`;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                        poModel.setProperty('/busy', false);
                        if (respJson) {
                            poModel.setProperty('/results', respJson)
                            
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
                                
                                this._clearTable();
                                this._getComplementos(fechaInicio, fechaFin);
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

            onSelectionChange: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("listItem");
                var oSelected = oEvent.getParameter("selected");
                var oContext = oSelectedItem.getBindingContext("facturas");
                var objectSolicitud = oContext.oModel.getProperty(oContext.sPath);
                
                objectSolicitud = JSON.stringify(objectSolicitud);
                this.getRouter().navTo("VerComplementosDetail", { item: objectSolicitud }, true);
            },

            onRefresh: function () {
                var modelDetail = sap.ui.getCore().getModel("detailView");
                console.log(modelDetail)
                // var fModel = this.getModel("facturas");
                // this._getFacturasPendientes(this.dateFormattedFinish, this.dateFormattedToday);
                
                // // limpiar tabla
                // this._clearTable()
            },

            _clearTable: function () {
                var tablaModel = this.getModel("tablaModel");
                tablaModel.setProperty("/data", []);
                tablaModel.refresh(true);
            }
            
        });
    })