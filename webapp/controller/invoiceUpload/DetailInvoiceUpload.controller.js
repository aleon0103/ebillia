// @ts-ignore
sap.ui.define([
    "./../BaseController",
    "./../APIController",
    "../../model/formatter",
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageToast',
    "sap/ui/Device",
    "sap/ui/core/Fragment",
    	"sap/m/MessageBox"

],
    function (BaseController, API, formatter, JSONModel, MessageToast, Device, Fragment,MessageBox) {
        "use strict";

        return BaseController.extend("ns.EBilliaApp.controller.DetailInvoiceUpload", {
            formatter: formatter,
            onInit: function () {
                console.log('on Detail InvoiceUpload component view')

                var oModel = new JSONModel({
                    busy: false,
                    delay: 0,
                    orderId: ''
                });
                this.getView().setModel(oModel, "POdetailView");

                this._oRouter = this.getRouter();
                this._oRouter.getRoute("cargaFacturaDetail").attachPatternMatched(this._routePatternMatched, this);


            },

            _routePatternMatched: function (oEvent) {

                console.log("ROUTE U INVOICE DETAIL MATCH")
                var oArguments = oEvent.getParameter("arguments");
                this._sObjectId = oArguments.orderId;
                console.log(this._sObjectId);
                var oViewModel = this.getModel("POdetailView")
                var oInvoiceModel = this.getModel("invoiceUpload");

                if (oInvoiceModel && oInvoiceModel.getProperty("/orderSelected")) {
                    console.log("ORDER SELECTED");
                } else {
                    console.log("ORDER NO SELECTED ");

                    // this.getRouter().getTargets().display("detailObjectNotFound");
                }

                console.log(this.getModel("invoiceUpload"));

                oViewModel.setProperty("/orderId", this._sObjectId);


                // gets called for ...#/
                // gets called for ...#/products/
                // gets called for ...#/products/Product/<productId>
                // for example: ...#/products/Product/1 . 
                // or #/products/Product/123


                if (this._sObjectId) {
                    this._getGoodsReceipts();

                }

            },
            onSelectionChange: function (oEvent) {

                var oList = oEvent.getSource();
                console.log('All items');
                var itemArray = oList.getItems();

                for (var item of itemArray) {



                    if (item.getSelected() == true) {
                        console.log("item selected");
                        // console.log(item.getBindingContext("POdetailView").getObject())
                        var item = item.getBindingContext("POdetailView").getObject();
                        this._updateTempModel(item, 'push');
                    } else {
                        console.log("item deselected");
                        var item = item.getBindingContext("POdetailView").getObject();
                        this._updateTempModel(item, 'delete');
                    }

                }





            },

            onSelectProveedor: function () {

            },

            _updateTempModel: function (item, method) {
                // console.log(item);
                var oInvoiceModel = this.getModel("invoiceUpload");
                var originalItems = oInvoiceModel.getProperty('/tempItems');

                if (method == 'push') {
                    if (originalItems.filter(itemb => JSON.stringify(itemb) === JSON.stringify(item)).length == 0) {
                        originalItems.push(item);
                    }

                } else if (method == 'delete') {
                    originalItems = originalItems.filter(x => JSON.stringify(x) !== JSON.stringify(item))

                }

                oInvoiceModel.setProperty('/tempItems', originalItems);
                oInvoiceModel.setProperty('/selectedCount', originalItems.length);


                //console.log(oInvoiceModel);

            },

            _configureTable: function () {
                console.log('configurando tabla');
                this.byId("lineItemsList").removeSelections(true);
                var oInvoiceModel = this.getModel("invoiceUpload");
                var tempItems = oInvoiceModel.getProperty('/tempItems');
                var itemArray = this.byId("lineItemsList").getItems();

                console.log(tempItems, itemArray);

                for (var item of itemArray) {
                    var itemObj = item.getBindingContext("POdetailView").getObject();
                    console.log(itemObj)

                    if (tempItems.filter(itemb => JSON.stringify(itemb) === JSON.stringify(itemObj)).length == 0) {
                        // se encontro item marcar
                        console.log('Item no encontrado');
                        //marcar check

                    } else {
                        console.log('item  encontrado');
                        item.setSelected(true);
                    }
                }




            },


            _getGoodsReceipts: function () {

                console.log('on get Goods Receips')



                var oModel = this.getModel("user");
                var rol = oModel.getProperty('/rol/id');
                var userId = oModel.getProperty('/id');
                var selProveedor = userId; // modificar para tomar el id del proveedor seleccioando 

                var proveedorId = rol === 3 ? userId : selProveedor;



                var poModel = this.getModel("POdetailView");
                poModel.setProperty('/busy', true);
                var me = this;
                //https://arcade.flexi.com.mx:8762/portal_cloud_api/logistic-services/Proveedores-facturas/EntradasDeMercancia/20000001/4500376391/E/%20
                var path = API.serviceList().PROVEEDORES_FACTURAS + `EntradasDeMercancia/${userId}/${this._sObjectId}/E/%20`;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                        poModel.setProperty('/busy', false);
                        if (respJson && respJson.data) {


                            poModel.setProperty('/GoodReceipts', respJson.data.positions)
                            if (respJson.data) {
                                poModel.setProperty('/Count', respJson.data.positions.length)

                            } else {
                                poModel.setProperty('/Count', 0)
                            }

                            console.log(poModel)

                        } else {

                            poModel.setProperty('/GoodReceipts', [])
                            poModel.setProperty('/Count', 0)
                        }
                        poModel.refresh();
                        me._configureTable();
                        // me.byId("lineItemsList").removeSelections(true); 
                    }, function (err) {
                        poModel.setProperty('/busy', false);

                        console.log("error in processing your request", err);
                    });
            },
            onCountPress: function () {
                this.getRouter().getTargets().display("detailObjectNotFound");
                console.log(this.getRouter());
                console.log('on count press');


            },
            onShowResumeTable: function () {

                this._cuentas = []
                this._cuentaProvSelected = {}
                this._provToSend = '';

                if (!this._oEMHelpDialog) {
                    Fragment.load({
                        name: "ns.EBilliaApp.view.invoice.uploadInvoiceDialog",
                        controller: this
                    }).then(function (oValueHelpDialog) {
                        this._oEMHelpDialog = oValueHelpDialog;
                        this.getView().addDependent(this._oEMHelpDialog);
                        this._configSendDialog();
                        this._oEMHelpDialog.open();

                    }.bind(this));
                } else {
                    this._configSendDialog();
                    this._oEMHelpDialog.open();
                }
            },

            onChangeFileUpload: function (oEvent) {

                var aItems = oEvent.getSource().getItems();
                var newItem = oEvent.getParameter("files");
                console.log(oEvent.getParameter("files"));
                var sUploadedFileName = oEvent.getParameter("files")[0].name;
                var fileExtesion = this.getFileExtension3(sUploadedFileName);
                console.log(sUploadedFileName);

                for (var item of aItems) {
                    var currentFile = item.getFileName()
                    if (this.getFileExtension3(currentFile) === fileExtesion) {
                        oEvent.getSource().removeItem(item);
                    }
                }

                //colocar files pfd y xml 
                if( fileExtesion.toUpperCase() == 'XML' ){
                    this._XML_FILE = oEvent.getParameter("files")[0];

                }
                 if( fileExtesion.toUpperCase() == 'XML' ){
                      this._PDF_FILE = oEvent.getParameter("files")[0];
                    
                }


            },

            _configSendDialog: function () {

                console.log('config send item');

                // var oModel2 = this.getModel("invoiceUpload");
                //var aRows = oModel2.getProperty("/tempItems");







                //console.log(aRows);
                var oModel = this.getModel("user");
                var rol = oModel.getProperty('/rol/id');
                var userId = oModel.getProperty('/id');
                var pais = oModel.getProperty('/pais');

                // 1.- verificar si el usuario es proveedor o no 
                if (rol !== 3) {

                    //configurar data en base a usuario seleccionado usuario seleccionado 

                } else {
                    //este usuario es proveedor configurar el propio pusario 

                    this._provToSend = userId;
                    this._sociedad = oModel.getProperty("/sociedad")
                    this._getCuentas(this._provToSend, this._sociedad);
                    this._getMoneda();

                }



                //modelo local de la vista 
                var oModel2 = this.getModel("invoiceUpload");


                console.log(pais);
                if (pais !== 'MX') {
                    sap.ui.getCore().byId("UploadCollection").setFileType(['pdf']);
                    sap.ui.getCore().byId("UploadCollection").setNoDataDescription('Select a PDF file')


                } else {
                    this._sinCfdi = false;
                    this._pais = pais;
                    this._fechaF = '';
                    sap.ui.getCore().byId("UploadCollection").setFileType(["pdf", "xml"]);
                    sap.ui.getCore().byId("UploadCollection").setNoDataDescription('Select PDF and XML files ')


                }

                console.log(sap.ui.getCore().byId("UploadCollection"));




            },

            getFileExtension3: function (filename) {
                return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2);
            },

            handleDeleteDialog: function (oEvent) {

                var oSelectedItem = oEvent.getParameter("listItem");

                var oContext = oSelectedItem.getBindingContext("invoiceUpload");



                var oTable = oEvent.getSource();

                var oModel2 = this.getModel("invoiceUpload");
                var aRows = oModel2.getProperty("/tempItems");


                console.log(aRows);



                var oThisObj = oContext.getObject();

                var index = $.map(aRows, function (obj, index) {

                    if (obj === oThisObj) {

                        return index;

                    }

                })

                console.log(index)
                aRows.splice(index, 1);







                oModel2.setProperty(

                    '/tempItems', aRows

                );
                oModel2.setProperty('/selectedCount', aRows.length);

                oTable.removeSelections();
                oModel2.refresh(true);




                this._configureTable();



            },


            /**VALIDATE INVOICE REQUIREMNTS  */

            validarCarga: function () {

                console.log('validar carga')
                var isValid = false;
                var file1, file2;

                // STEPS 

                //1.- Get Date 
                if (this._pais == 'MX') {
                    this.fechaF = '';
                } else {
                    //obtener fecha del formulario. 
                }

                //2.- Validate files 

                //file1=> pdf file2=>xml

                var aItems = sap.ui.getCore().byId("UploadCollection").getItems();

                for (var item of aItems) {
                    var currentFile = item.getFileName()
                    if (this.getFileExtension3(currentFile).toUpperCase() === 'XML') {
                        file2 = item
                    } else if (this.getFileExtension3(currentFile).toUpperCase() === 'PDF') {
                        file1 = item
                    }
                }

                if (this._pais == 'MX') {
                    isValid = (file1 && file2) ? true : false;
                } else {

                }


                //3 validate if is Zinc Document 
                if (this._isZinc && this._sinCfdi) {
                    isValid = file1 ? true : false;

                }

                //IF is valid select Account  else show alert             
                if (isValid) {
                    this.showAccount();

                } else {


                  
                   this.getView().getModel("i18n").getResourceBundle().then(function (oBundle) {

                     MessageToast.show(oBundle.getText("fileValidationFail"));

                     }.bind(this));


                }



            },

            /**SELECT CUST ACCOUNT */

            showAccount: function () {

                if (this._cuentas.length > 1) {
                    this.showCuentas = true;

                } else if (this._cuentas.length === 1) {

                    this._accountSelected = this._cuentas[0]
                    this._sendInvoice();

                } else {
                    this.toasterService.pop('error', 'Error', this.provSinCuenta);
                }



            },


            /**SEND INVOICE*/

            _sendInvoice: function () {
                var me = this;
                var entradas = []
                var oInvoiceModel = this.getModel("invoiceUpload");
                var cuenta = this._accountSelected['cuenta_bancaria'];
                var moneda;

                var odercenCompra = oInvoiceModel.getProperty("/orderSelected")


                if (this._sinCfdi) {
                    moneda = this._monedaSeleccionada;

                } else {
                    moneda = odercenCompra.moneda;

                }


                //formar array de entradas. 
                var tempItems = oInvoiceModel.getProperty('/tempItems');
                for (var item of tempItems) {
                  
                    let items = {
                        "ejercicioFiscal": item.ejercicio,
                        "idEntradaMercancia": item.num_doc_material,
                        "idOrdenCompra": item.num_doc_comp,
                        "importeTotalEntrada": item.importe,
                        "sociedadDeOrdenCompra": item.sociedad
                    };

                    entradas.push(items);


                }





                let obj = {
                    "cuentaDePago": cuenta,
                    "fechaFact": this.fechaF,
                    "idProveedor": this._provToSend,
                    "moneda": moneda,
                    "requestUploadInvoice": entradas,
                    "sinCfdi": this._sinCfdi//this._noCfdi
                }

                const formData = new FormData();
                var file1, file2;


                var aItems = sap.ui.getCore().byId("UploadCollection").getItems();

                for (var item of aItems) {
                    var currentFile = item.getFileName()
                    if (this.getFileExtension3(currentFile).toUpperCase() === 'XML') {
                        file2 = item
                    } else if (this.getFileExtension3(currentFile).toUpperCase() === 'PDF') {
                        file1 = item
                    }
                }

                console.log(file1.getSelected());
                formData.append('documentoFactura', JSON.stringify(obj))
                formData.append('xmlFile', this._XML_FILE),
                formData.append('pdfFile', this._PDF_FILE);

                // Call save invoice function 
                //     return this.http.post(this.baseFlexi + 'logistic-services/' +  'Proveedores-facturas/guardarFacturaOC',formData, options);

                
                var path = API.serviceList().ENVIO_ARCHIVOS_EM;
                API.PostFiles(path, formData).then(
                    function (respJson, paramw, param3) {
                        console.log(respJson);
                        var response = respJson;

                        if (response.status === "E") {
                           // MessageToast.show(response.message);
                            	MessageBox.error(response.message);
                        } else {
                            MessageBox.success(response.message);
                            //MessageToast.show(response.message);
                            me.closeDialog();
                            me._finishUpload();
                        }
                        
                    }, function (err) {

                        console.log("error in processing your request", err);
                         MessageBox.error(err.responseJSON.message);
                    }
                );




            },

            closeDialog: function () {
                this._oEMHelpDialog.close()
            },


            /**FINALIZA UPLOAD
             * 
             * limpia los datos del pop up y actualiza las entradas. 
            */
            _finishUpload: function(){

                this._XML_FILE=null
                this._PDF_FILE=null
                var oInvoiceModel = this.getModel("invoiceUpload");
                oInvoiceModel.setProperty('/tempItems',[]);
               // sap.ui.getCore().byId("UploadCollection").getItems();




            },


            /**MOSTRAR Y SELECCIONAR CUENTAS**/





            /**OBTENCION DE CATALOGOS**/
            _getCuentas: function (idProveedor, sociedad) {
                var me = this;

                /*
                this.catalogos.getCuentasProvSap(prov, sociedad).subscribe(
                    data => {
                        let response: any = data.data;
                        this.cuentas = response.cuentas;
                    },
                    err => {

                    },
                );
                */

                //     return this.http.get(this.baseFlexi + 'masterdata-services/catalog/obtenerProveedorSapPorNoCuentaYSoc/'+noCuenta+'/'+sociedad, options);

                var path = API.serviceList().MASTER_DATA_CATALOG + `obtenerProveedorSapPorNoCuentaYSoc/${idProveedor}/${sociedad}`;
                API.Get(path).then(
                    function (respJson, paramw, param3) {

                        if (respJson && respJson.data) {
                            me._cuentas = respJson.data.cuentas
                            console.log(me._cuentas);

                        }
                        // me.byId("lineItemsList").removeSelections(true); 
                    }, function (err) {


                        console.log("error in processing your request", err);
                    });




            },

            _getMoneda: function () {
                var me = this;

                /*

                  this.catalogos.obtenerMonedaPorModulo('P').subscribe(
      data => {
        this.moneda = data.moneda;
      },
      err => {
       
      },
    );
*/
                var modulo = 'P';
                var path = API.serviceList().MASTER_DATA_MONEDA + `obtener-moneda-por-modulo?modulo=${modulo}`;
                API.Get(path).then(
                    function (respJson, paramw, param3) {

                        if (respJson) {
                            me._moneda = respJson.moneda
                            console.log(me._moneda);

                        }
                        // me.byId("lineItemsList").removeSelections(true); 
                    }, function (err) {


                        console.log("error in processing your request", err);
                    });

            },


            /**PAGE FUNCTIONS*/

                 enterFullScreen: function () {
                var oViewModel = this.getModel("invoiceUpload")
                oViewModel.setProperty('/layout', 'MidColumnFullScreen')

            },

            exitFullScreen: function () {
                var oViewModel = this.getModel("invoiceUpload")
                oViewModel.setProperty('/layout', 'TwoColumnsMidExpanded')


            },
            onCloseDetailPress: function () {
                var oViewModel = this.getModel("invoiceUpload");
                oViewModel.setProperty("/layout", "OneColumn");
                this.getRouter().navTo("cargaFactura");

            },







        });
    })