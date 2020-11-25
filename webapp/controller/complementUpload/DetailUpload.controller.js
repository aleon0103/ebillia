// @ts-ignore
sap.ui.define([
    "./../BaseController",
    "./../APIController",
    "../../model/formatter",
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageToast',
    "sap/ui/Device"
],
    function (BaseController, API, formatter, JSONModel, MessageToast, Device) {
        "use strict";

        return BaseController.extend("ns.EBilliaApp.controller.DetailUpload", {

            onInit: function () {
                console.log('on init DetailUpload')

                var oModel = new JSONModel({
                    busy: false,
                    delay: 0,
                    orderId: ''
                });
                this.getView().setModel(oModel, "POdetailView");

                this._oRouter = this.getRouter();
                this._oRouter.getRoute("cargarComplementosDetail").attachPatternMatched(this._routePatternMatched, this);

            },

            _routePatternMatched: function (oEvent) {

                
                var oArguments = oEvent.getParameter("arguments");
                this.objectItem = JSON.parse(oArguments.item);

                console.log(this.objectItem);


                // if (this.arrSol.length > 0) {
                //     //Verifica que no exista el objeto en el array
                //     var include = this.arrSol.includes(objectSolicitud);

                //     if (include) {
                //         MessageToast.show("La solicitud ya se encuentra en la tabla");
                //     } else {
                //         this.arrSol.push(objectSolicitud);
                //         this._onSumTotalesPreAutorizados(objectSolicitud);
                //     }

                // } else {
                //     this.arrSol.push(objectSolicitud);
                //     this._onSumTotalesPreAutorizados(objectSolicitud);
                // }

                // var tablaModel = this.getModel("tablaModel");
                // tablaModel.setProperty("/data", this.arrSol);

            },




        });
    })