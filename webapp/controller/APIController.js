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
        GET_PROVEEDORES_CATALOG: '/portal_cloud_api/masterdata-services/catalog/obtener-proveedores',
        GET_REPORTE_ENTREGAS_PENDIENTES: '/portal_cloud_api/logistic-services/Proveedores-facturas/ReporteSaldos/',
        GET_ORDENES_COMPRA_ASN: '/portal_cloud_api/logistic-services/Proveedores-facturas/OrdenesDeCompra/ASN/',
        GET_POSICIONES_OC: '/portal_cloud_api/logistic-services/Proveedores-facturas/posicionesOC/',
        GET_ORDENES_CONFIRMADAS_: '/portal_cloud_api/logistic-services/Proveedores-facturas/OrdenDeCompraConfirmada/',
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
        GET_ASN:'/portal_cloud_api/logistic-services/asn/'
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

    };

});