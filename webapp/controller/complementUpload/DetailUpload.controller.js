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
                    this.arrComplementos.push(this.objectItem);
                    this._suma(this.objectItem);
                } else {
                    const filter = this.arrComplementos.filter(c => c.noDocumento != this.objectItem.noDocumento);
                    this.arrComplementos = filter;
                    this._resta(this.objectItem);
                }

                tablaModel.setProperty("/data", this.arrComplementos);
                tablaModel.setProperty("/Count", this.arrComplementos.length);
            },

            _deleteRowTable: function (oEvent) {
                var oSelectedItem = oEvent.getParameter("listItem");
                var oContext = oSelectedItem.getBindingContext("tablaModel");
                this.objectTable = oContext.oModel.getProperty(oContext.sPath);
                this._routePatternMatched();
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
                    }
                }
            },

            onCargarArchivos: function () {
                var that = this;

                if (!this.oSubmitDialog) {
                    this.oSubmitDialog = new Dialog({
                        type: DialogType.Message,
                        contentWidth: "50%",
                        title: "Carga los documentos del complemento",
                        content: [
                            new sap.m.HBox("hbox", {
                                justifyContent: FlexJustifyContent.SpaceBetween,
                                items: [
                                    new sap.m.UploadCollection("UploadCollection", {
                                        maximumFilenameLength: 55,
                                        maximumFileSize: 10,
                                        multiple: false,
                                        sameFilenameAllowed: false,
                                        instantUpload: false,
                                        fileType: ["pdf"],
                                        noDataDescription: "Selecciona un PDF o arrástralo aquí",
                                        change: function (oEvent) {
                                            var oUploadCollection = oEvent.getSource();
			                                // Header Token
                                            // @ts-ignore
                                            var oCustomerHeaderToken = new sap.m.UploadCollectionParameter({
                                                name: "x-csrf-token",
                                                value: "securityTokenFromModel"
                                            });
                                            oUploadCollection.addHeaderParameter(oCustomerHeaderToken);
                                            MessageToast.show("Event change triggered");
                                            // this.oSubmitDialog.getBeginButton().setEnabled(ffin.value.length > 0 && finicio.length > 0);
                                        }.bind(this),
                                        fileDeleted: function (oEvent) {

                                            // this.oSubmitDialog.getBeginButton().setEnabled(ffin.value.length > 0 && finicio.length > 0);
                                        }.bind(this),
                                        filenameLengthExceed: function (oEvent) {

                                            // this.oSubmitDialog.getBeginButton().setEnabled(ffin.value.length > 0 && finicio.length > 0);
                                        }.bind(this),
                                        fileSizeExceed: function (oEvent) {

                                            // this.oSubmitDialog.getBeginButton().setEnabled(ffin.value.length > 0 && finicio.length > 0);
                                        }.bind(this),
                                        typeMissmatch: function (oEvent) {

                                            // this.oSubmitDialog.getBeginButton().setEnabled(ffin.value.length > 0 && finicio.length > 0);
                                        }.bind(this),
                                        uploadComplete: function (oEvent) {

                                            // this.oSubmitDialog.getBeginButton().setEnabled(ffin.value.length > 0 && finicio.length > 0);
                                        }.bind(this),
                                        beforeUploadStarts: function (oEvent) {

                                        }.bind(this)
                                    }),
                                    new sap.m.UploadCollection("UploadCollection2", {
                                        maximumFilenameLength: 55,
                                        maximumFileSize: 10,
                                        multiple: false,
                                        sameFilenameAllowed: false,
                                        instantUpload: false,
                                        fileType: ["xml"],
                                        noDataDescription: "Selecciona un XML o arrástralo aquí",
                                        change: function (oEvent) {

                                            // this.oSubmitDialog.getBeginButton().setEnabled(ffin.value.length > 0 && finicio.length > 0);
                                        }.bind(this),
                                        fileDeleted: function (oEvent) {

                                            // this.oSubmitDialog.getBeginButton().setEnabled(ffin.value.length > 0 && finicio.length > 0);
                                        }.bind(this),
                                        filenameLengthExceed: function (oEvent) {

                                            // this.oSubmitDialog.getBeginButton().setEnabled(ffin.value.length > 0 && finicio.length > 0);
                                        }.bind(this),
                                        fileSizeExceed: function (oEvent) {

                                            // this.oSubmitDialog.getBeginButton().setEnabled(ffin.value.length > 0 && finicio.length > 0);
                                        }.bind(this),
                                        typeMissmatch: function (oEvent) {

                                            // this.oSubmitDialog.getBeginButton().setEnabled(ffin.value.length > 0 && finicio.length > 0);
                                        }.bind(this),
                                        uploadComplete: function (oEvent) {

                                            // this.oSubmitDialog.getBeginButton().setEnabled(ffin.value.length > 0 && finicio.length > 0);
                                        }.bind(this),
                                        beforeUploadStarts: function (oEvent) {

                                        }.bind(this)
                                    })
                                ]
                            })
                        ],
                        beginButton: new Button({
                            type: ButtonType.Emphasized,
                            text: "Cargar",
                            enabled: false,
                            press: function () {
                                // var fechaInicio = Core.byId("dpValue1").getValue();


                                this.oSubmitDialog.close();
                            }.bind(this)
                        }),
                        endButton: new Button({
                            text: "Cancelar",
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
                this._sendFilesService();
            },

            _sendFilesService: function () {
                var oModelUser = this.getModel("user").getData();
                var tablaModel = this.getModel("tablaModel");
                var userId = oModelUser.id;
                var tablaData = tablaModel.getProperty("/data");
                tablaData = JSON.stringify(tablaData);
                console.log(tablaData)

                var that = this;

                const formData = new FormData();
                formData.append("archivopdf", "ejemplo1");
                formData.append("archivoxml", "ejemplo2");
                formData.append("proveedor", userId);
                formData.append("usuario", userId);
                formData.append("facturas", tablaData);

                
                

                var path = API.serviceList().ENVIO_ARCHIVOS_COMPLEMENTOS;
                API.PostFiles(path, formData).then(
                    function (respJson, paramw, param3) {
                        

                        console.log(respJson);

                        
                    }, function (err) {

                        console.log("error in processing your request", err);
                    }
                );
            },

            _suma: function (item) {
                var amount = parseFloat(item.importe);
                var modelDetail = this.getModel("detailView");
                this.arrImports.push(amount);

                const sumaImports = this.arrImports.reduce((a, b) => a + b, 0);

                modelDetail.setProperty("/total", JSON.stringify(sumaImports));
                modelDetail.setProperty("/moneda", item.moneda)
                modelDetail.refresh(true);
            },

            _resta: function (item) {
                var amount = parseFloat(item.importe);
                var modelDetail = this.getModel("detailView");
                var total = parseFloat(modelDetail.getProperty("/total"));
                var resta = total - amount;

                modelDetail.setProperty("/total", JSON.stringify(resta));
                modelDetail.setProperty("/moneda", item.moneda)
                modelDetail.refresh(true);
            }



        });
    })