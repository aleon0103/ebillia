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
            arrComplementos: [],
            objectTable: null,
            onInit: function () {
                console.log('on init DetailUpload');

                var oModel = new JSONModel({
                    busy: false,
                    delay: 0
                });
                // var oModelTable = new JSONModel({
                //     data: [],
                //     Count: 0
                // });

                this.getView().setModel(oModel, "detailView");
                // this.getView().setModel(oModelTable, "tablaModel");

                this._oRouter = this.getRouter();
                this._oRouter.getRoute("cargarComplementosDetail").attachPatternMatched(this._routePatternMatched, this);

            },

            onAfterRendering: function () {
                var oModelUser = this.getModel("user").getData();
                var modelDetail = this.getModel("detailView");
                modelDetail.setProperty("/nombreProveedor", oModelUser.nombre);
                modelDetail.setProperty("/rfcProveedor", oModelUser.rfc);
                modelDetail.refresh(true);
                console.log(oModelUser);
            },


            _routePatternMatched: function (oEvent) {
                var isSelected;
                if (oEvent) {
                    var oArguments = oEvent.getParameter("arguments");
                    this.objectItem = JSON.parse(oArguments.item);
                    isSelected = JSON.parse(oArguments.isSelected);
                } else {
                    this.objectItem = this.objectTable;
                    isSelected = false;
                }
                
                this._addRowTable(isSelected);  
                console.log(sap.ui.getCore())
            },

            _addRowTable: function (isSelected) {
                var tablaModel = this.getModel("tablaModel");
                var dataTable = tablaModel.getProperty("/data");
                
                if (dataTable.length == 0) {
                    // inicializar el arreglo cuando se limpie la tabla
                    this.arrComplementos = [];
                }

                console.log(this.objectItem);
                
                if (isSelected) {
                    this.arrComplementos.push(this.objectItem);
                } else {
                    const filter = this.arrComplementos.filter(c => c.noDocumento != this.objectItem.noDocumento);
                    this.arrComplementos = filter;
                }
                
                tablaModel.setProperty("/data", this.arrComplementos);
                tablaModel.setProperty("/Count", this.arrComplementos.length);
            },

            _deleteRowTable: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("listItem");
                var oContext = oSelectedItem.getBindingContext("tablaModel");
                this.objectTable = oContext.oModel.getProperty(oContext.sPath);
                console.log(this.objectTable);
                this._routePatternMatched();
            },

            _updateListCheck: function () {
                
                // var oList = this.byId("list");
                // // oList.setSelectedItemById(sId, bSelect?) : sap.m.ListBase
                // var itemsList = oList.getItems();
                // oList.setSelectedItemById(itemsList[0].sId, true);
                // console.log(itemsList)
            }



        });
    })