// @ts-ignore
sap.ui.define([
    "./../BaseController",
    "./../APIController",
    "../../model/formatter",
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageToast',
    "sap/ui/Device",
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/ui/core/Core",
    "sap/m/FlexJustifyContent"
],
    function (BaseController, API, formatter, JSONModel, MessageToast, Device, Dialog, DialogType, Button,
        ButtonType, Core, FlexJustifyContent) {
        "use strict";

        return BaseController.extend("ns.EBilliaApp.controller.DetailSee", {
            arrImports: [],
            onInit: function () {

                var oModel = new JSONModel({
                    busy: false,
                    delay: 0
                });

                this.getView().setModel(oModel, "detailView");

                this._oRouter = this.getRouter();
                this._oRouter.getRoute("VerComplementosDetail").attachPatternMatched(this._routePatternMatched, this);

            },

            onAfterRendering: function () {
                var oModelUser = this.getModel("user").getData();
                var modelDetail = this.getModel("detailView");
                modelDetail.setProperty("/nombreProveedor", oModelUser.nombre);
                modelDetail.setProperty("/rfcProveedor", oModelUser.rfc);
                modelDetail.refresh(true);
            },

            _routePatternMatched: function (oEvent) {
                
            },

            _suma: function (item) {
                var modelDetail = this.getModel("detailView");

                if (Array.isArray(item)) {
                    this.arrImports = [];
                    for (let i = 0; i < item.length; i++) {
                        const element = item[i];
                        this.arrImports.push(parseFloat(element.importe));
                    }
                    
                } else {
                    // @ts-ignore
                    var amount = parseFloat(item.importe);
                    this.arrImports.push(amount);
                }
                
                const sumaImports = this.arrImports.reduce((a, b) => a + b, 0);

                modelDetail.setProperty("/total", JSON.stringify(sumaImports));
                modelDetail.setProperty("/moneda", item.moneda)
                modelDetail.refresh(true);
            },

            _resta: function (item) {
                var modelDetail = this.getModel("detailView");

                if (Array.isArray(item)) {
                    modelDetail.setProperty("/total", 0);
                    modelDetail.setProperty("/moneda", "");
                } else {
                    // @ts-ignore
                    var amount = parseFloat(item.importe);
                    var total = parseFloat(modelDetail.getProperty("/total"));
                    var resta = total - amount;

                    modelDetail.setProperty("/total", JSON.stringify(resta));
                    // @ts-ignore
                    modelDetail.setProperty("/moneda", item.moneda)
                }

                modelDetail.refresh(true);   
            }
        });
    })