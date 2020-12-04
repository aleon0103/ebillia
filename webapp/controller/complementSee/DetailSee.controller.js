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
    "sap/ui/core/format/DateFormat"
],
    function (BaseController, API, formatter, JSONModel, MessageToast, Device, Dialog, DialogType, Button,
        ButtonType, Core, DateFormat) {
        "use strict";

        return BaseController.extend("ns.EBilliaApp.controller.DetailSee", {
            arrImports: [],
            objectItem: null,
            layoutModel: null,
            onInit: function () {
                this._oRouter = this.getRouter();
                this._oRouter.getRoute("VerComplementosDetail").attachPatternMatched(this._routePatternMatched, this);
            },

            onAfterRendering: function () {
                this.layoutModel = this.getModel("layoutComplementModel");
                var oModelUser = this.getModel("user").getData();
                var modelDetail = this.getModel("mDetailSeeComplement");
                modelDetail.setProperty("/nombreProveedor", oModelUser.nombre);
                modelDetail.setProperty("/rfcProveedor", oModelUser.rfc);
                modelDetail.setProperty("/sociedadProveedor", oModelUser.sociedad);
                modelDetail.refresh(true);
                console.log(oModelUser)
            },

            _routePatternMatched: function (oEvent) {
                var modelDetail = this.getModel("mDetailSeeComplement");
                var oArguments = oEvent.getParameter("arguments");
                this.objectItem = JSON.parse(oArguments.item);

                // @ts-ignore
                var dateFormat = DateFormat.getDateInstance({
                    pattern: "yyyy-MM-dd"
                });

                var fc = new Date(this.objectItem.fechaComplemento);
                var fComplementoFormatted = dateFormat.format(fc, false);
                this.objectItem.fechaComplemento = fComplementoFormatted;

                modelDetail.setProperty("/info", this.objectItem);
                modelDetail.setProperty("/Count", this.objectItem.listaPagosRelacionados.length);
                this.layoutModel.setProperty("/layout", "TwoColumnsMidExpanded");
                console.log(this.objectItem);
                this._getFiles();
            },

            _getFiles: function () {
                var oModelUser = this.getModel("user").getData();
                var userId = oModelUser.id;

                var poModel = this.getModel("mDetailSeeComplement");
                poModel.setProperty('/busy', true);
                var that = this;

                var path = API.serviceList().GET_FILES_COMPLEMENTOS + `obtener-xml?noProveedor=${userId}&sociedad=${this.objectItem.sociedad}&uuid=${this.objectItem.uuid}`;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                        poModel.setProperty('/busy', false);
                        console.log(respJson)

                        if (respJson) {
                            poModel.setProperty('/files', respJson)
                            
                            poModel.refresh();
                        }
                    }, function (err) {
                        console.log("error in processing your request", err);
                    });
            },

            handlePressLink: function (evt) {
                var sSrc = evt.getSource().getTarget();
                console.log(sSrc);
            },

            handleClose: function () {
                this.layoutModel.setProperty("/layout", "OneColumn");
                this.getRouter().navTo("VerComplementos", { param: false }, true);
            },

            handleFullScreen: function () {
                this.layoutModel.setProperty("/layout", "MidColumnFullScreen");
                this.layoutModel.setProperty("/exitFullScreen", true);
                this.layoutModel.setProperty("/fullScreen", null);
            },

            handleExitFullScreen: function () {
                this.layoutModel.setProperty("/layout", "TwoColumnsMidExpanded");
                this.layoutModel.setProperty("/exitFullScreen", null);
                this.layoutModel.setProperty("/fullScreen", true);
            }
        });
    })