sap.ui.define([
    "./../BaseController",
    "./../APIController",
    "../../model/formatter",
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageToast',
    "sap/ui/Device"
],
    function (BaseController, API, formatter, JSONModel, MessageToast,Device) {
        "use strict";
        return BaseController.extend("ns.EBilliaApp.controller.InvoicesProccessedMaster", {

            formatter: formatter,

            onInit: function () {
                console.log('on init  Invoice Upload component view');

                var emModel = new JSONModel({ busy: true });
                this.getOwnerComponent().setModel(emModel, "invoiceUpload");

                var oModel = new JSONModel({ busy: true });
                this.getView().setModel(oModel, "purchaseOrderModel");

                this._oRouter = this.getRouter();
                this._oRouter.getRoute("ReporteFacturas").attachPatternMatched(this._routePatternMatched, this);

   
            var currentDate = new Date();
            var previusDate = new Date(currentDate.getFullYear()+'-' +(currentDate.getMonth()-3)+'-' +(currentDate.getDate() - 14))
            // var oDRS2 = this.byId("DRS2");
            // oDRS2.setDateValue(previusDate);
            // oDRS2.setSecondDateValue(currentDate);
            // oDRS2.setMaxDate(currentDate);
            var oData = {
                   data:{
                       cantidad: 0,
                       listado: null,
                       download: false,
                       proveedores:[],
                       sociedades:[],
                       rol:3,
                       showProveedores:false,
                       filtros:{
                           fechaI: this._fechaFormato(previusDate),
                           fechaF: this._fechaFormato(currentDate),
                           proveedor:'',
                           usuario:'',
                           sociedad:'',
                           
                       }
                   }
            };
                var oModel = new JSONModel(oData);
                this.getView().setModel(oModel, "complementos");
            

          
            
            setTimeout(() => {
                this._initData()
            }, 500);
            

            
            

        },
        _fechaFormato: function(date){
            var today = new Date(date)
            var year = today.getFullYear()
            var month = today.getMonth();
            var day = today.getDate();
            var monthF;
            var dayF;
            if (String(month+1).length == 1) {
            monthF = '0'+ (month+=1)
            }else{
            monthF = month+=1
            }
            if (String(day).length == 1) {
            dayF = '0'+day
            }else{
            dayF = day
            }
            
            return year+'-'+monthF+'-'+dayF
        },
        
        _initData: function () {

                var oModel = this.getModel("user");
                var rol = oModel.getProperty('/rol/id');
                var userId =  oModel.getProperty('/id');
                console.log(rol);


                console.log('loading complementos...');
                var complemetosModel = this.getView().getModel("complementos");               
                var me = this;
                
                complemetosModel.setProperty("/data/filtros/usuario", userId)
                
                var path = API.serviceList().GET_SOCIEDADES;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                        console.log(respJson);
                        if (respJson.sapSociedad) {
                            
                             complemetosModel.setProperty("/data/sociedades", respJson.sapSociedad)
                              
                        }

                    }, function (err) {
                        console.log("error in processing your request", err);
                    });



              

                    this.searchData()

        },
        searchData: function(){
            var complemetosModel = this.getView().getModel("complementos"); 
            var data = complemetosModel.getProperty("/data");

            var path = API.serviceList().GET_FACTURAS_PROCESADAS + `?sociedad=${data.filtros.sociedad}&provedor=${data.filtros.proveedor}&fechai=${data.filtros.fechaI}&fechaf=${data.filtros.fechaF}&nea=&nodocumento=&estatus=Procesada&grupoimputacion=&tipo=&referencia=&usuario=${data.filtros.usuario}`;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                        console.log(respJson);
                        if (respJson && respJson.length>0) {
                             complemetosModel.setProperty("/data/listado", respJson)
                              complemetosModel.setProperty("/data/cantidad", respJson.length)
                              complemetosModel.setProperty("/data/download", true)
                              console.log(data);
                              
                        }else{
                             complemetosModel.setProperty("/data/listado", [])
                              complemetosModel.setProperty("/data/cantidad", 0)
                              complemetosModel.setProperty("/data/download", false)
                        }

                    }, function (err) {
                        console.log("error in processing your request", err);
                    });
        },

            onAfterRendering: function () {
                console.log('on Uoload Inv View After Render');
            },

            _routePatternMatched: function (oEvent) {

                console.log("ROUTE U INVOICE MATCH")

                // gets called for ...#/
                // gets called for ...#/products/
                // gets called for ...#/products/Product/<productId>
                // for example: ...#/products/Product/1 . 
                // or #/products/Product/123

                //  this._initNotifications();
                this._getPurchaseOrders();

            },

            onSearch: function (oEvent) {
                if (oEvent.getParameters().refreshButtonPressed) {
                    // Search field's 'refresh' button has been pressed.
                    // This is visible if you select any master list item.
                    // In this case no new search is triggered, we only
                    // refresh the list binding.
                    this.onRefresh();
                    return;
                }

                var sQuery = oEvent.getParameter("query");

                if (sQuery) {
                    //	this._oListFilterState.aSearch = [new Filter("CustomerName", FilterOperator.Contains, sQuery)];
                    this._searchOrderById(sQuery);
                } else {
                    //	this._oListFilterState.aSearch = [];
                    this._getPurchaseOrders();
                }
                //	this._applyFilterSearch();

            },

            onRefresh: function () {
                this._getPurchaseOrders();
            },

            onSelectionChange: function (oEvent) {

                	var oList = oEvent.getSource(),
				bSelected = oEvent.getParameter("selected");

			// skip navigation when deselecting an item in multi selection mode
			if (!(oList.getMode() === "MultiSelect" && !bSelected)) {
				// get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
				this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
			}
            },



		/**
		 * Shows the selected item on the detail page
		 * On phones a additional history entry is created
		 * @param {sap.m.ObjectListItem} oItem selected Item
		 * @private
		 */
		_showDetail : function (oItem) {
			var bReplace = !Device.system.phone;
			// set the layout property of FCL control to show two columns
        //	this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
        console.log(oItem);
        
			this.getRouter().navTo("reporteFacturaDetail", {
			    id : 1
            }, bReplace);
            
            
        },
        onListItemPress: function (oEvent) {
			var oNextUIState = this.getOwnerComponent().getHelper().getNextUIState(1),
				productPath = oEvent.getSource().getBindingContext("products").getPath(),
				product = productPath.split("/").slice(-1).pop();

			this.oRouter.navTo("detail", {layout: oNextUIState.layout, product: product});

			var oItem = oEvent.getSource();
			oItem.setNavigated(true);
			var oParent = oItem.getParent();
			// store index of the item clicked, which can be used later in the columnResize event
			this.iIndex = oParent.indexOfItem(oItem);
		},

            /**Method to get POrchaseOrder List */

            _getPurchaseOrders: function () {

                var oModel = this.getModel("user");
                var rol = oModel.getProperty('/rol/id');
                var userId = oModel.getProperty('/id');
                console.log('Get purchase orders');
                var poModel = this.getModel("purchaseOrderModel");
                poModel.setProperty('/busy', true);
                var me = this;
                var path = API.serviceList().PROVEEDORES_FACTURAS + `OrdenesDeCompra/CARGAFACTURA/${userId}`;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                        poModel.setProperty('/busy', false);
                        if (respJson && respJson.data) {


                            poModel.setProperty('/PurchaseOrders', respJson.data)
                            if (respJson.data) {
                                poModel.setProperty('/Count', respJson.data.length)

                            } else {
                                poModel.setProperty('/Count', 0)
                            }

                            console.log(poModel)
                            poModel.refresh();
                        }
                    }, function (err) {
                        poModel.setProperty('/busy', false);

                        console.log("error in processing your request", err);
                    });
            },


            _searchOrderById: function (orderId) {
                console.log('searchOrder.. ', orderId);

                var oModel = this.getModel("user");
                var rol = oModel.getProperty('/rol/id');
                var userId = oModel.getProperty('/id');
                console.log('Get purchase order by id');
                var poModel = this.getModel("purchaseOrderModel");
                poModel.setProperty('/busy', true);
                var me = this;
                //https://arcade.flexi.com.mx:8762/portal_cloud_api/logistic-services/Proveedores-facturas/OrdenDeCompraConfirmada/4500376391
                var path = API.serviceList().PROVEEDORES_FACTURAS + `OrdenDeCompraConfirmada/${orderId}`;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                        poModel.setProperty('/busy', false);
                        if (respJson && respJson.data) {
                            poModel.setProperty('/busy', false);
                            var result = [];
                            result[0] = respJson.data;
                            poModel.setProperty('/PurchaseOrders', result)
                            if (respJson.data) {
                                poModel.setProperty('/Count', respJson.data.length)

                            } else {
                                poModel.setProperty('/Count', 0)
                                poModel.setProperty('/PurchaseOrders', [])
                            }

                            console.log(poModel)
                            poModel.refresh();
                        } else {
                            MessageToast.show(respJson.message);
                            poModel.setProperty('/Count', 0)
                            poModel.setProperty('/PurchaseOrders', [])

                        }
                    }, function (err) {
                        poModel.setProperty('/busy', false);
                        MessageToast.show(err.error.message);
                        poModel.setProperty('/Count', 0)
                        poModel.setProperty('/PurchaseOrders', [])

                        console.log("error in processing your request", err);
                    });



            }


        });
})