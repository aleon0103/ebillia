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

        return BaseController.extend("ns.EBilliaApp.controller.DetailUpload", {
            arrComplementos: [],
            arrImports: [],
            objectTable: null,
            filePDF: null,
            fileXML: null,
            layoutModel: null,
            onInit: function () {

                var oModel = new JSONModel({
                    busy: false,
                    delay: 0
                });

                this.getView().setModel(oModel, "detailView");

                this._oRouter = this.getRouter();
                this._oRouter.getRoute("cargarComplementosDetail").attachPatternMatched(this._routePatternMatched, this);

            },

            onAfterRendering: function () {
                this.layoutModel = this.getModel("layoutComplementModel");
                var oModelUser = this.getModel("user").getData();
                var modelDetail = this.getModel("detailView");
                modelDetail.setProperty("/nombreProveedor", oModelUser.nombre);
                modelDetail.setProperty("/rfcProveedor", oModelUser.rfc);
                modelDetail.refresh(true);
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
                    this._updateListCheck(isSelected);
                }

                this.layoutModel.setProperty("/layout", "TwoColumnsMidExpanded");
                this._addRowTable(isSelected);
            },

            _addRowTable: function (isSelected) {
                var tablaModel = this.getModel("tablaModel");
                var dataTable = tablaModel.getProperty("/data");

                if (dataTable.length == 0) {
                    // inicializar el arreglo cuando se limpie la tabla
                    this.arrComplementos = [];
                    this.arrImports = [];
                }

                console.log(this.objectItem);

                if (isSelected) {
                    if (Array.isArray(this.objectItem)) {
                        this.arrComplementos = this.objectItem;
                    } else {
                        this.arrComplementos.push(this.objectItem);
                    }
                    
                    this._suma(this.objectItem);
                } else {
                    const filter = this.arrComplementos.filter(c => c.noDocumento != this.objectItem.noDocumento);
                    this.arrComplementos = filter;
                    this._resta(this.objectItem);
                    // @ts-ignore
                    // sap.ui.getCore().byId("__xmlview2--check").setSelected(false);
                }

                tablaModel.setProperty("/data", this.arrComplementos);
                tablaModel.setProperty("/Count", this.arrComplementos.length);
            },

            _deleteRowTable: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("listItem");
                var oContext = oSelectedItem.getBindingContext("tablaModel");
                this.objectTable = oContext.oModel.getProperty(oContext.sPath);
                this._routePatternMatched();
                // @ts-ignore
                // sap.ui.getCore().byId("__xmlview2--check").setSelected(false);
            },

            _updateListCheck: function (bSelect) {
                var oList = sap.ui.getCore().byId("__xmlview2--list");
                // @ts-ignore
                var itemsList = oList.getItems();
                
                var dataList = oList.getModel("facturas").getProperty("/results");
                // @ts-ignore
                for (let i = 0; i < dataList.length; i++) {
                    const element = dataList[i];
                    if (element.noDocumento === this.objectTable.noDocumento) {
                        // @ts-ignore
                        oList.setSelectedItemById(itemsList[i].sId, bSelect);
                        // @ts-ignore
                        var itemSelected = oList.getSelectedItem();
                        
                        if (!itemSelected) {
                            this.getRouter().navTo("CargarComplementos", { param: false }, true);
                        }
                    }
                }
                
            },

            onCargarArchivos: function () {
                var that = this;

                if (!this.oSubmitDialog) {
                    this.oSubmitDialog = new Dialog({
                        type: DialogType.Message,
                        contentWidth: "50%",
                        title: "{i18n>dialogFilesTitle}",
                        content: [
                            new sap.m.HBox("hbox", {
                                justifyContent: FlexJustifyContent.SpaceBetween,
                                items: [
                                    new sap.m.UploadCollection("UploadCollection", {
                                        maximumFilenameLength: 65,
                                        maximumFileSize: 10,
                                        multiple: false,
                                        sameFilenameAllowed: false,
                                        instantUpload: false,
                                        fileType: ["pdf"],
                                        noDataDescription: "{i18n>fileTextpdf}",
                                        change: function (oEvent) {
                                            var file = oEvent.getParameter("files")[0];
                                            this.filePDF = file;
                                            console.log(oEvent)

                                            var xmlfile = Core.byId("UploadCollection2").getItems();
                                            var pdffile = oEvent.getParameter("files");

                                            this.oSubmitDialog.getBeginButton().setEnabled(pdffile.length > 0 && xmlfile.length > 0);
                                        }.bind(this),
                                        fileDeleted: function (oEvent) {
                                            
                                            var xmlfile = Core.byId("UploadCollection2").getItems();
                                            var pdffile = Core.byId("UploadCollection").getItems();
                                           
                                            this.oSubmitDialog.getBeginButton().setEnabled(pdffile.length > 0 && xmlfile.length > 0);
                                        }.bind(this)
                                    }),
                                    new sap.m.UploadCollection("UploadCollection2", {
                                        maximumFilenameLength: 65,
                                        maximumFileSize: 10,
                                        multiple: false,
                                        sameFilenameAllowed: false,
                                        instantUpload: false,
                                        fileType: ["xml"],
                                        noDataDescription: "{i18n>fileTextxml}",
                                        change: function (oEvent) {
                                            var file = oEvent.getParameter("files")[0];
                                            this.fileXML = file;

                                            var xmlfile = oEvent.getParameter("files");
                                            var pdffile = Core.byId("UploadCollection").getItems();
                                           
                                            this.oSubmitDialog.getBeginButton().setEnabled(pdffile.length > 0 && xmlfile.length > 0);
                                        }.bind(this),
                                        fileDeleted: function (oEvent) {
                                            console.log("delete")
                                            var xmlfile = Core.byId("UploadCollection2").getItems();
                                            var pdffile = Core.byId("UploadCollection").getItems();
                                           
                                            this.oSubmitDialog.getBeginButton().setEnabled(pdffile.length > 0 && xmlfile.length > 0);
                                        }.bind(this)
                                    })
                                ]
                            })
                        ],
                        beginButton: new Button({
                            type: ButtonType.Emphasized,
                            text: "{i18n>cargar}",
                            enabled: false,
                            press: function () {
                                this._sendFilesService(this.filePDF, this.fileXML);
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

            _sendFilesService: function (filepdf, filexml) {
                var oModelUser = this.getModel("user").getData();
                var tablaModel = this.getModel("tablaModel");
                var userId = oModelUser.id;
                var tablaData = tablaModel.getProperty("/data");
                tablaData = JSON.stringify(tablaData);

                var that = this;

                const formData = new FormData();
                formData.append("archivopdf", filepdf);
                formData.append("archivoxml", filexml);
                formData.append("proveedor", userId);
                formData.append("usuario", userId);
                formData.append("facturas", tablaData);

                var path = API.serviceList().ENVIO_ARCHIVOS_COMPLEMENTOS;
                API.PostFiles(path, formData).then(
                    function (respJson, paramw, param3) {
                        console.log(respJson);
                        var response = respJson;

                        if (response.status === "E") {
                            MessageToast.show(response.message);
                        } else {
                            MessageToast.show(response.message);
                            that.oSubmitDialog.close();
                        }
                        
                    }, function (err) {

                        console.log("error in processing your request", err);
                    }
                );
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
            },

            handleClose: function () {
                this.layoutModel.setProperty("/layout", "OneColumn");
                this.getRouter().navTo("CargarComplementos", { param: false }, true);
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