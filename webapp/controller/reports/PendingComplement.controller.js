sap.ui.define([
    './Formatter',
    './../BaseController',
    "./../APIController",
    'sap/ui/core/mvc/Controller',
    'sap/ui/model/json/JSONModel',
    'sap/m/library',
    'sap/ui/core/Fragment',
    "sap/ui/core/syncStyleClass",
    "sap/ui/model/Filter",
	"sap/ui/model/FilterOperator",
	"sap/m/MessageToast",

], function(Formatter,BaseController, API, Controller, JSONModel, mobileLibrary, Fragment, syncStyleClass,Filter, FilterOperator, MessageToast) {
"use strict";

	var PopinLayout = mobileLibrary.PopinLayout;

	var TableController = BaseController.extend("ns.EBilliaApp.controller.PendingComplement", {

		onInit: function () {
            // set explored app's demo model on this sample
            
            

            var currentDate = new Date();
            var previusDate = new Date()

            var pastDate = previusDate.getDate() - 15;
            previusDate.setDate(pastDate);
            var oDRS2 = this.byId("DRS2");
            oDRS2.setDateValue(previusDate);
            oDRS2.setSecondDateValue(currentDate);
            oDRS2.setMaxDate(currentDate);
            var oData = {
                   data:{
                       cantidad: 0,
                       listado: null,
                       download: false,
                       proveedores:[],
                       rol:3,
                       showProveedores:false,
                       filtros:{
                           fechaI: this._fechaFormato(previusDate),
                           fechaF: this._fechaFormato(currentDate),
                           proveedor:'',
                           
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
                



                if (rol == 2) {
                    complemetosModel.setProperty("/data/showProveedores", true)
                }
                if (rol == 3) {
                    complemetosModel.setProperty("/data/filtros/proveedor", userId)
                }


               setTimeout(() => {
                   this.searchComplementos()
               }, 500);



        },
        clearAllFilters: function (){
            var currentDate = new Date();
            var previusDate = new Date()

            var pastDate = previusDate.getDate() - 15;
            previusDate.setDate(pastDate);
            var complemetosModel = this.getView().getModel("complementos"); 
            complemetosModel.setProperty("/data/filtros/fechaI", this._fechaFormato(previusDate));
            complemetosModel.setProperty("/data/filtros/fechaF", this._fechaFormato(currentDate));
            complemetosModel.setProperty("/data/filtros/proveedor", '');
            var oDRS2 = this.byId("DRS2");
            oDRS2.setDateValue(previusDate);
            oDRS2.setSecondDateValue(currentDate);

        },
        searchComplementos: function(){
            var complemetosModel = this.getView().getModel("complementos"); 
            var data = complemetosModel.getProperty("/data");

            var path = API.serviceList().GET_COMPLEMENTOS_PENDIENTES + `?provedor=${data.filtros.proveedor}&fechai=${data.filtros.fechaI}&fechaf=${data.filtros.fechaF}&noDocPago=&estatus=Pagada`;
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
		handleChange: function (oEvent) {
            var complemetosModel = this.getView().getModel("complementos");
			var sFrom = oEvent.getParameter("from"),
				sTo = oEvent.getParameter("to");

			this._iEvent++;
            console.log(sFrom, sTo);
           complemetosModel.setProperty("/data/filtros/fechaI", this._fechaFormato(sFrom));
           complemetosModel.setProperty("/data/filtros/fechaF", this._fechaFormato(sTo));
		},
        onDataExport : function(oEvent) {
            console.log("downloading");
            var complemetosModel = this.getView().getModel("complementos"); 
            var data = complemetosModel.getProperty("/data");

            var path = API.serviceList().GET_EXCEL_COMPLEMENTOS + `?provedor=${data.filtros.proveedor}&fechai=${data.filtros.fechaI}&fechaf=${data.filtros.fechaF}&noDocPago=&estatus=Pagada`;
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
					// this.getView().addDependent(this._oDialog);
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

		onDialogClose: function (oEvent) {
            var oResourceBundle = this.getView().getModel("i18n").getResourceBundle();
            
            var aContexts = oEvent.getParameter("selectedContexts");
            var complemetosModel = this.getView().getModel("complementos");
			if (aContexts && aContexts.length) {
				MessageToast.show("You have chosen " + aContexts.map(function (oContext) { 
                     complemetosModel.setProperty("/data/filtros/proveedor", oContext.getObject().lifnr);
                    return oContext.getObject().lifnr; 
                }).join(", "));
			} else {
				MessageToast.show("No new item was selected.", oResourceBundle.getText("clearFilters"));
            }
            
              

           
            complemetosModel.setProperty("/data/proveedores", [])
			// oEvent.getSource().getBinding("items").filter([]);
		},
	});


	return TableController;

});