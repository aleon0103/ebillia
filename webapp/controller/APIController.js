sap.ui.define([

], function () {
    "use strict";

    var jwt;
    var user;
    var URL = 'https://arcade.flexi.com.mx:8762';

    var endpoints = {
        GET_BADGE_PRONOSTICOS:'/portal_cloud_api/logistic-services/pronostico/getNotifications/',
        GET_BADGE_COTIZACIONES:'/portal_cloud_api/logistic-services/quotation/getNotifications/',
        PROVEEDORES_FACTURAS:'/portal_cloud_api/logistic-services/Proveedores-facturas/',
        FACTURAS_PENDIENTES:'/portal_cloud_api/payment-services/master-factura/',
        ENVIO_ARCHIVOS_COMPLEMENTOS: '/portal_cloud_api/payment-services/complementos/',
        GET_COMPLEMENTOS_PENDIENTES: '/portal_cloud_api/payment-services/master-factura/facturas-pendientes-complemento',
        GET_PROVEEDORES:'/portal_cloud_api/masterdata-services/catalog/obtener-proveedores',
        GET_EXCEL_COMPLEMENTOS: '/portal_cloud_api/payment-services/facturas/excel-facturas-pendientes-complemento',
        GET_FACTURAS_PROCESADAS: '/portal_cloud_api/payment-services/facturas/obtener-facturas',
        GET_SOCIEDADES: '/portal_cloud_api/masterdata-services/catalog/obtener-sociedades',
        GET_EXCEL_FACTURAS: '/portal_cloud_api/payment-services/facturas/excel-facturas-pendientes-complemento',
        PUT_CANCELAR_FACTURA:'/portal_cloud_api/payment-services/facturas/factura/cancelar-documento/',
        GET_ARCHIVOS_FACTURA:'/portal_cloud_api/payment-services/master-factura/obtener-xml',
        GET_ASN:'/portal_cloud_api/logistic-services/asn/',
        GET_EXCEL_ASN:'/portal_cloud_api/logistic-services/asn/getAsnExcel/',
        GET_PDF_ASN:'/portal_cloud_api/logistic-services/asn/generarPDFAsn/',
        CREATE_COTIZACION:'/portal_cloud_api/logistic-services/quotation/createNotification',
        GET_MONEDAS:'/portal_cloud_api/masterdata-services/moneda/obtener-moneda-por-modulo?modulo=P',
        GET_HOMOLOGACION: '/portal_cloud_api/masterdata-services/homologacion-moneda/obtener-hm',
        DELETE_MONEDAS: '/portal_cloud_api/masterdata-services/moneda/borrar-moneda',
        DELETE_HOMOLOGACION: '/portal_cloud_api/masterdata-services/homologacion-moneda/borrar-hm',
        CREATE_MONEDAS: '/portal_cloud_api/masterdata-services/moneda/insertar-moneda',
        CREATE_HOMOLOGACION: '/portal_cloud_api/masterdata-services/homologacion-moneda/insertar-hm',
        GET_COTIZACIONES:'/portal_cloud_api/logistic-services/quotation/getNotificationsEnviadas/',
        GET_FILE_COTIZACION: '/portal_cloud_api/logistic-services/quotation/getFile'
    };
    return {


        Login: function (path, data, callback) {

            console.log(data)
            return $.ajax({
                data: JSON.stringify(data),
                contentType: "application/json",
                method: "POST",
                url: URL+path,

            })
        },
        signOut: function () {
            user = {};
            jwt = null;
        },

        getJwt: function () {
            return jwt;
        },

        serviceList: function (){
            return endpoints;

        },

        setJwt: function (token) {
            console.log(token);
            jwt = token
        },

        getCurrentUser: function () {
            return user;
        },

        Get: function (path, callback) {
            console.log(path);
            return $.ajax({
                method: "GET",
                headers: {
                    'Authorization': jwt
                },
                url: URL+path,
                contentType: "application/json; charset=utf-8",
                dataType: "json",
            })
        },

        Post: function (url, data, callback) {
            console.log(url);
            console.log(data)
            return $.ajax({
                data: JSON.stringify(data),
                contentType: "application/json",
                method: "POST",
                url: url,
            })


        },

        PostFiles: function (path, formData, callback) {
            return $.ajax({
                data: formData,
                processData: false,
                contentType: false,
                headers: { 
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
                    'Authorization': jwt
                 },
                type: "POST",
                url: URL+path,
            })
        },

        Update: function () {



        },
        Delete: function () {



        },
        Put: function (path, data, callback) {
            console.log(path);
            return $.ajax({
                method: "PUT",
                headers: {
                    'Authorization': jwt
                },
                url: URL+path,
                contentType: "application/json; charset=utf-8",
                data: data,
            })
        },
        PostData: function (url, data, callback) {
            console.log(url);
            console.log(data)
            return $.ajax({
                data: JSON.stringify(data),
                contentType: "application/json",
                method: "POST",
                headers: {
                    'Authorization': jwt
                },
                url: URL+url,
            })


        },

        GetFile: function (path, callback) {
             var xhr = new XMLHttpRequest();
             

            xhr.open("GET", URL+path, true);
            xhr.setRequestHeader('Authorization', jwt);
            xhr.responseType = "blob";
            xhr.onload = function() {

                callback(xhr.response, xhr.status);

            };
            xhr.onerror = function() {
                console.log('Error request...');
            };

            xhr.send(null);
        },
        

    };

});