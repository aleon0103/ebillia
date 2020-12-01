sap.ui.define([
	 "./../BaseController",
    "./../APIController",
    "../../model/formatter",
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageToast',
    "sap/ui/Device"
], function (BaseController, API, formatter, JSONModel, MessageToast, Device) {
	"use strict";

	return BaseController.extend("ns.EBilliaApp.controller.InvoicesProccessedDetail", {
		onInit: function () {
			    console.log('on Detail InvoiceUpload component view')

                var oData = {
                   data:{
                       cantidad: 0,
                       factura: null,
                       download: false,
                       validaciones:[],
                       sociedades:[],
                       rol:3,
                       showProveedores:false,
                       filtros:{
                           proveedor:'',
                           usuario:'',
                           sociedad:'',
                           
                       }
                   }
            };
                var oModel = new JSONModel(oData);
                this.getView().setModel(oModel, "complementos");
                this._oRouter = this.getOwnerComponent().getRouter();
                                    this._oRouter.getRoute("reporteFacturaDetail").attachPatternMatched(this._routePatternMatched, this);

        },
        

            _routePatternMatched: function (oEvent) {

                console.log("ROUTE U INVOICE DETAIL MATCH")
                var oArguments = oEvent.getParameter("arguments");
                this._sObjectId = oArguments.id;
                console.log(this._sObjectId);
                
               




                if (this._sObjectId) {
                    setTimeout(() => {
                                      this._getInvoice(this._sObjectId);
      
                    }, 500);

                }

            },
        _getInvoice: function(doc){

             var validationRows = [
                {
                check: true,
                criterio: "PAC de validación fiscal",
                criterioen: "Fiscal validations (PAC)"
                },
                {
                check: true,
                criterio: "Monto de la factura",
                criterioen: "Amount of the invoice"
                },
                {
                check: true,
                criterio: "RFC de la sociedad conincide con el RFC del Receptor del XML",
                criterioen: "RFC of the society matches the RFC of the XML receiver"
                },
                {
                check: true,
                criterio: "RFC del proveedor coincide con el RFC del Emisor del XML",
                criterioen: "RFC of the provider matches the RFC of the XML sender"
                },
                {
                check: true,
                criterio: "La fecha de la factura se encuentra dentro de la fecha permitida",
                criterioen: "The date of the invoice is within the allowed date"
                },
                {
                check: true,
                criterio: "Proveedor no se encuentra en la lista de contribuyentes incumplidos",
                criterioen: "Provider is not on the list of unfulfilled contributors"
                },
            ];



                 var oModel = this.getModel("user");
                 console.log(oModel);
                 
                var rol = oModel.getProperty('/rol/id');
                var userId =  oModel.getProperty('/id');

             var complemetosModel = this.getView().getModel("complementos");               
                
                complemetosModel.setProperty("/data/filtros/usuario", userId)
                 complemetosModel.setProperty("/data/validaciones", validationRows)

            var data = complemetosModel.getProperty("/data");
            var path = API.serviceList().GET_FACTURAS_PROCESADAS + `?sociedad=&provedor=&fechai=&fechaf=&nea=&nodocumento=${doc}&estatus=Procesada&grupoimputacion=&tipo=&referencia=&usuario=${userId}`;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                        console.log(respJson);
                        if (respJson && respJson.length>0) {
                            complemetosModel.setProperty('/data/factura', respJson[0])
                              
                        }else{
                            //  complemetosModel.setProperty("/data/listado", [])
                            //   complemetosModel.setProperty("/data/cantidad", 0)
                            //   complemetosModel.setProperty("/data/download", false)
                        }

                    }, function (err) {
                        console.log("error in processing your request", err);
                    });
        },
		handleFullScreen: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/fullScreen");
			this.oRouter.navTo("detail", {layout: sNextLayout, product: this._product});
		},
		handleExitFullScreen: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/exitFullScreen");
			this.oRouter.navTo("detail", {layout: sNextLayout, product: this._product});
		},
		handleClose: function () {
			var sNextLayout = this.oModel.getProperty("/actionButtonsInfo/midColumn/closeColumn");
			this.oRouter.navTo("master", {layout: sNextLayout});
		},
		_onProductMatched: function (oEvent) {
			this._product = oEvent.getParameter("arguments").product || this._product || "0";
			this.getView().bindElement({
				path: "/ProductCollection/" + this._product,
				model: "products"
			});
		}
	});
}, true);
