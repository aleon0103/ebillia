// @ts-ignore
sap.ui.define([
    "./../../BaseController",
    "./../../APIController",
    "../../../model/formatter",
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageToast',
    "sap/ui/Device",
    "sap/ui/core/format/DateFormat"
],
    function (BaseController, API, formatter, JSONModel, MessageToast, Device, DateFormat) {
        "use strict";
        return BaseController.extend("ns.EBilliaApp.controller.DeliveryNotificationsSecond", {
            formatter: formatter,
            posiciones: null,
            onInit: function () {

                var oModelTable = new JSONModel({
                    results: null,
                    busy: false
                });
                this.getView().setModel(oModelTable, "file");

                this._oRouter = this.getRouter();
                this._oRouter.getRoute("masterDeliveryNotificationsG1").attachPatternMatched(this._routePatternMatched, this);


            },

            onAfterRendering: function () {
                var fileTypes = ["xlsx", "XLSX", "xls"];
                this.byId("fileUploader").setFileType(fileTypes);
            },

            _routePatternMatched: function (oEvent) {
                console.log("ROUTE MATCH")
                var modelDeliveryN = this.getModel("detailDeliveryN");
                var posiciones = modelDeliveryN.getProperty("/GoodReceipts");
                var fechaPosicion = posiciones[0].fechaEntregaPosicion;
                var fechaEntrega = this.byId("DP1");

                var oDate = new Date(fechaPosicion);

                /* Fecha 15 dias antes */
                var dieciseisDias = 1000 * 60 * 60 * 24 * 15;
                var resta = oDate.getTime() - dieciseisDias;
                var fechaAtras = new Date(resta);

                // @ts-ignore
                var dateFormat = DateFormat.getDateInstance({
                    pattern: "yyyy-MM-dd"
                });

                var formatFechaAtras = dateFormat.format(fechaAtras, false);

                console.log(formatFechaAtras);
                
                fechaEntrega.setMinDate(fechaAtras);
                fechaEntrega.setValue(formatFechaAtras);
                console.log(posiciones);
                

            },

            handleUploadPress: function (oEvent) {
                var oFileUploader = this.byId("fileUploader");
                this.fileExcel = oFileUploader.oFileUpload.files;

                if (this.fileExcel[0]) {
                    var file = this.fileExcel[0];
                    var tipo = file.name.split('.'); 

                    if (file && (tipo[1] == "xlsx" || tipo[1] == "xls")) {
                        this.typeXLSX();
                    } else {
                        MessageToast.show("Tipo de archivo no valido");
                    }
                } else {
                    MessageToast.show("Tipo de archivo no valido");
                }

            },

            typeXLSX: function () {
                var modelFile = this.getModel("file");
                var oFileUploader = this.getView().byId("fileUploader");
                var file = oFileUploader.getFocusDomRef().files[0];
                var excelData;
                var that = this;

                if (file && window.FileReader) {
                    var reader = new FileReader();
                    reader.onload = function (evt) {
                        console.log(evt)
                        var data = evt.target.result;
                        // @ts-ignore
                        var workbook = XLSX.read(data, {
                            type: 'binary'
                        });
                        workbook.SheetNames.forEach(function (sheetName) {
                            console.log(sheetName)
                            // @ts-ignore
                            excelData = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                        });
                        console.log(excelData);

                        if (excelData.length > 0) {
                            modelFile.setProperty("/results", excelData);
                        } else {
                            modelFile.setProperty("/results", []);
                        }
                        
                    };
                    reader.onerror = function (ex) {
                        console.log(ex);
                    };
                    reader.readAsBinaryString(file);
                }
            },

            onCrearAsn: function () {

            }


        });
    })