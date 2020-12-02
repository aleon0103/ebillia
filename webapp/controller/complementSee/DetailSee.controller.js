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
            onInit: function () {

                var oModel = new JSONModel({
                    busy: false,
                    delay: 0,
                    info: null,
                    Count: 0
                });

                this.getView().setModel(oModel, "detailView");

                // modelUser = new sap.ui.model.json.JSONModel(response);
                //     //Guarda el modelo usuario de manera global 
                //     //para obtenerlo en todas las vistas
                //     sap.ui.getCore().setModel(modelUser, "user");

                this._oRouter = this.getRouter();
                this._oRouter.getRoute("VerComplementosDetail").attachPatternMatched(this._routePatternMatched, this);

            },

            onAfterRendering: function () {
                var oModelUser = this.getModel("user").getData();
                var modelDetail = this.getModel("detailView");
                modelDetail.setProperty("/nombreProveedor", oModelUser.nombre);
                modelDetail.setProperty("/rfcProveedor", oModelUser.rfc);
                modelDetail.setProperty("/sociedadProveedor", oModelUser.sociedad);
                modelDetail.refresh(true);
                console.log(oModelUser)
            },

            _routePatternMatched: function (oEvent) {
                var modelDetail = this.getModel("detailView");
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
                console.log(this.objectItem);
                this._getFiles();
            },

            _getFiles: function () {
                var oModelUser = this.getModel("user").getData();
                var userId = oModelUser.id;

                var poModel = this.getModel("detailView");
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
            }
        });
    })