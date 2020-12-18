// @ts-ignore
sap.ui.define([
    "./../../BaseController",
    "./../../APIController",
    "../../../model/formatter",
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageToast',
    "sap/ui/Device"
],
    function (BaseController, API, formatter, JSONModel, MessageToast, Device) {
        "use strict";

        return BaseController.extend("ns.EBilliaApp.controller.DetailDeliveryNotificationsInt", {
        deliveryDate: null,
        ordenCompra: [],
        index: null,
        objLength: [],
        fileExcel: null,

            onInit: function () {
                console.log('on Detail Delivery Notifications component view')

                this.btnModel = new JSONModel();
                this.btnModel.setData({
                    badgeMin:			"",
                    badgeMax:			"",
                    badgeCurrent:		1,
                    buttonText: 		"Button with Badge",
                    buttonIcon: 		"sap-icon://excel-attachment",
                    buttonType: 		"Default",
                    buttonWithIcon:		true,
                    buttonWithText:		true,
                    buttonWithTooltip:	false
                });
                this.getView().setModel(this.btnModel);
            
                var oModel = new JSONModel({
                    busy: false,
                    delay: 0,
                    orderId: ''
                });
                this.getView().setModel(oModel, "POdetailView");

                var pModel = new JSONModel({});
                this.getOwnerComponent().setModel(pModel, "positionsSelected");

                this._oRouter = this.getRouter();
                this._oRouter.getRoute("NotificacionEntregaInternacionalDetail").attachPatternMatched(this._routePatternMatched, this);

            },

            _routePatternMatched: function (oEvent) {

                console.log("ROUTE DETAIL MATCH")
                
                var oArguments = oEvent.getParameter("arguments");  
                console.log(oArguments.orderId);
                this._sObjectId = oArguments.orderId;
                var oViewModel = this.getModel("POdetailView")

                var poModel = this.getModel("purchaseOrderModel").oData; 
                var oc = null;
            
                var poModel = this.getModel("purchaseOrderModel").oData; 
                for (let i = 0; i < poModel.PurchaseOrders.length; i++) {
                    if (poModel.PurchaseOrders[i].idOrdenCompra == this._sObjectId) {
                        oc = poModel.PurchaseOrders[i];
                        this.index = i
                        break;
                    }
                }
                console.log(this.index);
                
                this.ordenCompra = poModel.PurchaseOrders;

                oViewModel.setProperty("/orderId", this._sObjectId);

                console.log(oViewModel);

                // if (this._sObjectId) {
                //     this._getGoodsReceipts();
                // }

            },


            handleUploadPress: function(oEvent) {
                var oFileUploader = this.byId("fileUploader"); 
                this.fileExcel = oFileUploader.oFileUpload.files;
                console.log(this.fileExcel);
                console.log(oEvent.getParameter("files"));
                if (this.fileExcel[0]) {
                    var file = this.fileExcel[0];
                    var tipo = file.name.split('.'); console.log(tipo);

                     if (file && tipo[1] == "xlsx") {
                        console.log(file);
                        
                        var reader = new FileReader();

                        var that = this;
                        var oFileUploader = that.getView().byId("fileUploader");
                        var oFile = oFileUploader.getFocusDomRef().files[0];
                        //To check the File type of uploaded File.
                        if (oFile.type === "application/vnd.ms-excel") {
                            //To call the CSV File Function
                            that.typeCsv();
                        }
                        else {
                            //To call the XLSX File Function
                            that.typeXLSX();
                        }


                    } else {
                        MessageToast.show("Tipo de archivo no valido");
                    }
                } else {
                    MessageToast.show("Tipo de archivo no valido");
                }

            },

            typeCsv: function () {
                var that = this;
                var oFileUploader = that.getView().byId("fileUploader");
                var oFile = oFileUploader.getFocusDomRef().files[0];
                if (oFile && window.FileReader) {
                    var reader = new FileReader();
                    reader.onload = function (evt) {
                    var strData = evt.target.result; 
                    };
                    reader.onerror = function (exe) {
                        console.log(exe);
                    };
                    reader.readAsText(oFile);
                }

             },
               
        
        typeXLSX: function() {
            var that = this;
            var oFileUploader = that.getView().byId("fileUploader");
            var file = oFileUploader.getFocusDomRef().files[0];
            var excelData = {};
            if (file && window.FileReader) {
                var reader = new FileReader();
                reader.onload = function (evt) {
                    var data = evt.target.result;
                    var workbook = XLSX.read(data, {
                        type: 'binary'
                    });
                    workbook.SheetNames.forEach(function (sheetName) {
                        excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                    });
                    console.log(excelData);
                    

                };
                reader.onerror = function (ex) {
                    console.log(ex);
                };
                reader.readAsBinaryString(file);
            }
        },
                   
        reviewData: function () {
            var data = this.getModel("positionsSelected").oData; console.log(data);
            let posiciones = data.positions;
        }

        });
    })