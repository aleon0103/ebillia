sap.ui.define([
    "./../BaseController",
    "./../APIController",
    "../../model/formatter",
    "sap/ui/model/json/JSONModel",
    'sap/m/MessageToast',
    "sap/ui/Device",
    'sap/ui/core/Fragment',
    "sap/ui/core/syncStyleClass",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",

],
    function (BaseController, API, formatter, JSONModel, MessageToast,Device, Fragment, syncStyleClass, Filter, FilterOperator) {
        "use strict";
        return BaseController.extend("ns.EBilliaApp.controller.InvoicesProccessedMaster", {

            formatter: formatter,

            onInit: function () {
                console.log('on init  Invoice Upload component view');

                var emModel = new JSONModel({ busy: true });
                this.getOwnerComponent().setModel(emModel, "facturas");

                var oModel = new JSONModel({ busy: true });
                this.getView().setModel(oModel, "reporteFacturas");

                this._oRouter = this.getRouter();
                this._oRouter.getRoute("ReporteFacturas").attachPatternMatched(this._routePatternMatched, this);

   
            var currentDate = new Date();
            // var previusDate = new Date(currentDate.getFullYear()+'-' +(currentDate.getMonth()-3)+'-' +(currentDate.getDate()))
            var oDRS2 = this.byId("DRS2");
            // oDRS2.setDateValue(previusDate);
            // oDRS2.setSecondDateValue(currentDate);
            oDRS2.setMaxDate(currentDate);
            var oData = {
                   data:{
                       cantidad: 0,
                       listado: null,
                       download: false,
                       proveedores:[],
                       sociedades:[],
                       sociedadesListar:[],
                       rol:3,
                       showProveedores:false,
                       filtros:{
                           fechaI: '',
                           fechaF: '',
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
                             complemetosModel.setProperty("/data/sociedadesListar", respJson.sapSociedad)
                              
                        }

                    }, function (err) {
                        console.log("error in processing your request", err);
                    });



              

                    

        },
        
		handleChange: function (oEvent) {
            var complemetosModel = this.getView().getModel("complementos");
			var sFrom = oEvent.getParameter("from"),
				sTo = oEvent.getParameter("to");

			this._iEvent++;
            console.log(sFrom, sTo);
           complemetosModel.setProperty("/data/filtros/fechaI", this._fechaFormato(sFrom));
           complemetosModel.setProperty("/data/filtros/fechaF", this._fechaFormato(sTo));
		},
        searchData: function(){
            var poModel = this.getModel("reporteFacturas");
                poModel.setProperty('/busy', true);

            var complemetosModel = this.getView().getModel("complementos"); 
            var data = complemetosModel.getProperty("/data");
            var path = API.serviceList().GET_FACTURAS_PROCESADAS + `?sociedad=${data.filtros.sociedad}&provedor=${data.filtros.proveedor}&fechai=${data.filtros.fechaI}&fechaf=${data.filtros.fechaF}&nea=&nodocumento=&estatus=Procesada&grupoimputacion=&tipo=&referencia=&usuario=${data.filtros.usuario}`;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                        console.log(respJson);
                        if (respJson && respJson.length>0) {
                            poModel.setProperty('/listado', respJson)
                            poModel.setProperty("/cantidad", respJson.length)
                            complemetosModel.setProperty("/data/download", true)
                              
                        }else{
                            poModel.setProperty("/cantidad", 0)
                             poModel.setProperty('/listado', [])
                             complemetosModel.setProperty("/data/download", false)
                        }

                    }, function (err) {
                        console.log("error in processing your request", err);
                         poModel.setProperty("/cantidad", 0)
                    });
        },
        onDataExport : function(oEvent) {
            console.log("downloading");
            var complemetosModel = this.getView().getModel("complementos"); 
            var data = complemetosModel.getProperty("/data");

            var path = API.serviceList().GET_EXCEL_FACTURAS + `?sociedad=${data.filtros.sociedad}&provedor=${data.filtros.proveedor}&fechai=${data.filtros.fechaI}&fechaf=${data.filtros.fechaF}&nea=&nodocumento=&estatus=Procesada&grupoimputacion=&tipo=&referencia=&usuario=${data.filtros.usuario}`;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                        console.log(respJson);
                            if (respJson && respJson.statusType == 'OK') {
                                const linkSource = `data:application/xlsx;base64,${respJson.entity}`;
                                const downloadLink = document.createElement("a");
                                var titulo = respJson.metadata['Content-Disposition'][0]; 
                                titulo = titulo.split(';'); 
                                titulo = titulo[1];
                                titulo = titulo.split("=");
                                titulo = titulo[1];
                                titulo = titulo.split(".");
                                titulo = titulo[0]; 
                                const fileName = titulo+".xlsx";
                        
                                downloadLink.href = linkSource;
                                downloadLink.download = fileName;
                                downloadLink.click();
                                } else {
                                // this.toasterService.pop('error', "", this.sinDatos);
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

              

            },
            onSearchSociedad: function (oEvent) {
                var sValue = oEvent.getParameter("value");
                var oFilter = new Filter("proveedor", FilterOperator.Contains, sValue);
                var oBinding = oEvent.getParameter("itemsBinding");


                var complemetosModel = this.getView().getModel("complementos");
                var sociedades = complemetosModel.getProperty("/data/sociedades");
                var nuevasSociedades = []
                sociedades.forEach(element => {
                    if (element.sociedad.includes(sValue)) {
                        nuevasSociedades.push(element)
                    }
                });
                 complemetosModel.setProperty("/data/sociedadesListar", nuevasSociedades)
            },
		onSearch: function (oEvent) {
			var sValue = oEvent.getParameter("value");
            var oFilter = new Filter("proveedor", FilterOperator.Contains, sValue);
            var oBinding = oEvent.getParameter("itemsBinding");


            var complemetosModel = this.getView().getModel("complementos");

            var path = API.serviceList().GET_PROVEEDORES + `?value=${sValue}`;
                API.Get(path).then(
                    function (respJson, paramw, param3) {
                        console.log(respJson);
                        if (respJson.sapProveedor) {
                            
                            oBinding.filter(respJson.sapProveedor);
                             complemetosModel.setProperty("/data/proveedores", respJson.sapProveedor)
                              
                        }

                    }, function (err) {
                        console.log("error in processing your request", err);
                    });




			
		},

            onRefresh: function () {
                this._getPurchaseOrders();
            },

      

	
		_showDetail : function (oEvent) {
			var bReplace = !Device.system.phone;
			// set the layout property of FCL control to show two columns
        //	this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");


		var productPath = oEvent.getSource().getBindingContext("reporteFacturas").getPath(),
				item = productPath.split("/").slice(-1).pop();
        console.log(item);
        
        var poModel = this.getModel("reporteFacturas");
        console.log(poModel);
            var data = poModel.getProperty("/listado");
            console.log(data);
            
        
			this.getRouter().navTo("reporteFacturaDetail", {
                id : data[item].nodocumento,
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

        onSelectDialogPress: function (oEvent) {

            
                

			var oButton = oEvent.getSource();

			if (!this._oDialog) {
				Fragment.load({
					name: "ns.EBilliaApp.view.reports.Dialog",
					controller: this
				}).then(function (oDialog){
                    this._oDialog = oDialog;
                    var complemetosModel = this.getView().getModel("complementos");               
					this._oDialog.setModel(complemetosModel);
					this._configDialog(oButton);
					this._oDialog.open();
				}.bind(this));
			} else {
				this._configDialog(oButton);
				this._oDialog.open();
			}
		},
      
		_configDialog: function (oButton) {
			// Multi-select if required
			var bMultiSelect = !!oButton.data("multi");
			this._oDialog.setMultiSelect(bMultiSelect);

			var sCustomConfirmButtonText = oButton.data("confirmButtonText");
			this._oDialog.setConfirmButtonText(sCustomConfirmButtonText);

			// Remember selections if required
			var bRemember = !!oButton.data("remember");
			this._oDialog.setRememberSelections(bRemember);

			//add Clear button if needed
			var bShowClearButton = !!oButton.data("showClearButton");
			this._oDialog.setShowClearButton(bShowClearButton);

			// Set growing property
			var bGrowing = oButton.data("growing");
			this._oDialog.setGrowing(bGrowing == "true");

			// Set growing threshold
			var sGrowingThreshold = oButton.data("threshold");
			if (sGrowingThreshold) {
				this._oDialog.setGrowingThreshold(parseInt(sGrowingThreshold));
			}

			// Set draggable property
			var bDraggable = !!oButton.data("draggable");
			this._oDialog.setDraggable(bDraggable);

			// Set draggable property
			var bResizable = !!oButton.data("resizable");
			this._oDialog.setResizable(bResizable);

			// Set style classes
			var sResponsiveStyleClasses = "sapUiResponsivePadding--header sapUiResponsivePadding--subHeader sapUiResponsivePadding--content sapUiResponsivePadding--footer";
			var bResponsivePadding = !!oButton.data("responsivePadding");
			this._oDialog.toggleStyleClass(sResponsiveStyleClasses, bResponsivePadding);

			// clear the old search filter
			this._oDialog.getBinding("items").filter([]);

			// toggle compact style
			syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialog);
		},

		onDialogClose: function (oEvent) {
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            
            var aContexts = oEvent.getParameter("selectedContexts");
            var complemetosModel = this.getView().getModel("complementos");
			if (aContexts && aContexts.length) {
				MessageToast.show(" " + aContexts.map(function (oContext) { 
                     complemetosModel.setProperty("/data/filtros/proveedor", oContext.getObject().lifnr);
                    return oContext.getObject().lifnr; 
                }).join(", "));
			} else {
                 this.getModel("i18n").getResourceBundle().then(function (oBundle) {
                 MessageToast.show(oBundle.getText("noItems"));
                });
            }
            
              

           
            complemetosModel.setProperty("/data/proveedores", [])
			// oEvent.getSource().getBinding("items").filter([]);
        },
        onDialogSociedades: function (oEvent) {
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            
            var aContexts = oEvent.getParameter("selectedContexts");
            var complemetosModel = this.getView().getModel("complementos");
			if (aContexts && aContexts.length) {
				MessageToast.show("" + aContexts.map(function (oContext) { 
                     complemetosModel.setProperty("/data/filtros/sociedad", oContext.getObject().sociedad);
                    return oContext.getObject().sociedad; 
                }).join(", "));
			} else {
                 this.getModel("i18n").getResourceBundle().then(function (oBundle) {
                 MessageToast.show(oBundle.getText("noItems"));
                });
            }
            
              

           
        },
        _configDialogSociedades: function (oButton) {
			// Multi-select if required
			var bMultiSelect = !!oButton.data("multi");
			this._oDialogS.setMultiSelect(bMultiSelect);

			var sCustomConfirmButtonText = oButton.data("confirmButtonText");
			this._oDialogS.setConfirmButtonText(sCustomConfirmButtonText);

			// Remember selections if required
			var bRemember = !!oButton.data("remember");
			this._oDialogS.setRememberSelections(bRemember);

			//add Clear button if needed
			var bShowClearButton = !!oButton.data("showClearButton");
			this._oDialogS.setShowClearButton(bShowClearButton);

			// Set growing property
			var bGrowing = oButton.data("growing");
			this._oDialogS.setGrowing(bGrowing == "true");

			// Set growing threshold
			var sGrowingThreshold = oButton.data("threshold");
			if (sGrowingThreshold) {
				this._oDialogS.setGrowingThreshold(parseInt(sGrowingThreshold));
			}

			// Set draggable property
			var bDraggable = !!oButton.data("draggable");
			this._oDialogS.setDraggable(bDraggable);

			// Set draggable property
			var bResizable = !!oButton.data("resizable");
			this._oDialogS.setResizable(bResizable);

			// Set style classes
			var sResponsiveStyleClasses = "sapUiResponsivePadding--header sapUiResponsivePadding--subHeader sapUiResponsivePadding--content sapUiResponsivePadding--footer";
			var bResponsivePadding = !!oButton.data("responsivePadding");
			this._oDialogS.toggleStyleClass(sResponsiveStyleClasses, bResponsivePadding);

			// clear the old search filter
			this._oDialogS.getBinding("items").filter([]);

			// toggle compact style
			syncStyleClass("sapUiSizeCompact", this.getView(), this._oDialogS);
		},

          clearAllFilters: function (){
            
            var complemetosModel = this.getView().getModel("complementos"); 
            complemetosModel.setProperty("/data/filtros/fechaI", '');
            complemetosModel.setProperty("/data/filtros/fechaF", '');
            complemetosModel.setProperty("/data/filtros/proveedor", '');
            complemetosModel.setProperty("/data/filtros/sociedad", '');
            var oDRS2 = this.byId("DRS2");
            oDRS2.setDateValue(previusDate);
            oDRS2.setSecondDateValue(currentDate);

        },
        onSelectDialogSociedades: function (oEvent) {

            console.log("on selec sociedades");
            
                

			var oButton = oEvent.getSource();

			if (!this._oDialogS) {
				Fragment.load({
					name: "ns.EBilliaApp.view.reports.DialogSociedades",
					controller: this
				}).then(function (oDialog){
                    this._oDialogS = oDialog;
                    var complemetosModel = this.getView().getModel("complementos");               
					this._oDialogS.setModel(complemetosModel);
					this._configDialogSociedades(oButton);
					this._oDialogS.open();
				}.bind(this));
			} else {
				this._configDialogSociedades(oButton);
				this._oDialogS.open();
			}
		},

        });
})