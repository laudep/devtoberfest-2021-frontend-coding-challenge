/*
 * OpenUI5
 * (c) Copyright 2009-2021 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./Delegate","sap/base/util/deepEqual","sap/base/security/encodeXML"],function(t,e,r){"use strict";var a=t.extend("sap.ui.core.util.serializer.delegate.XML",{constructor:function(e,r,a,i){t.apply(this);this._sDefaultNamespace=e;this._fnGetControlId=r;this._fnMemorizePackage=i;this._fnGetEventHandlerName=a}});a.prototype.startAggregation=function(t,e){return"<"+this._createAggregationName(t,e)+">"};a.prototype.endAggregation=function(t,e){return"</"+this._createAggregationName(t,e)+">"};a.prototype.start=function(t,e,r){return"<"+this._createTagName(t)};a.prototype.end=function(t,e,r){return"</"+this._createTagName(t)+">"};a.prototype.middle=function(t,r,a){var i=[];var n=this._fnGetControlId?this._fnGetControlId(t):t.getId();if(n.indexOf("__")!==0){i.push(this._createAttribute("id",n))}if(t.aCustomStyleClasses){var s=t.aCustomStyleClasses;var o=[];for(var u=0;u<s.length;u++){var g=s[u];if(!g.startsWith("sapM")&&!g.startsWith("sapUi")){o.push(g)}}if(o.length>0){i.push(this._createAttribute("class",o.join(" ")))}}if(this._fnGetEventHandlerName){var f=t.getMetadata().getAllEvents();for(var c in f){if(t.hasListeners(c)){var l=t.mEventRegistry[c];for(var u=0;u<l.length;u++){var p=this._fnGetEventHandlerName(l[u]);if(p){i.push(this._createAttribute(c,p));break}}}}}var d=t.getMetadata().getAllAssociations();this._createAttributes(i,t,d,function(t,e){if(d[t].multiple){return e.join(" ")}return e},function(t,e){return e!==null&&e!==""});var h=t.getMetadata().getAllProperties();var v=t.getMetadata().getPropertyDefaults();this._createAttributes(i,t,h,null,function(t,r){return!e(r,v[t])});var _=t.getMetadata().getAllAggregations();this._createAttributes(i,t,_,null,function(e,r){if(!t.getBindingInfo(e)&&(!r||typeof r!=="string")){return false}return true});i.push(">");return i.join("")};a.prototype._createAttributes=function(t,e,r,a,i){for(var n in r){var s=r[n];var o=s._sGetter;if(e[o]){var u=e[o]();u=a?a(n,u):u;if(!e.getBindingInfo(n)){if(!i||i(n,u)){t.push(this._createAttribute(n,u))}}else{t.push(this._createDataBindingAttribute(e,n,u))}}}};a.prototype._createDataBindingAttribute=function(t,e,r){var a=t.getBindingInfo(e);var i=null;var n=r;if(!a.bindingString){if(a.binding){var s=a.binding.getMetadata().getName();if(s==="sap.ui.model.PropertyBinding"||s==="sap.ui.model.resource.ResourcePropertyBinding"){i=a.binding.getValue()}}if(a.parts){a=a.parts[0]}var o=a.model;if(i===r||i===null){n="{"+(o?o+">"+a.path:a.path)+"}"}}else{n=a.bindingString}return this._createAttribute(e,n)};a.prototype._createAttribute=function(t,e){var a=typeof e==="string"||e instanceof String?r(e):e;return" "+t+'="'+a+'"'};a.prototype._createTagName=function(t){var e=t.getMetadata()._sClassName;var r=e.lastIndexOf(".");var a=r===-1?e:e.substring(r+1);var i=r===-1?e:e.substring(0,r);if(this._fnMemorizePackage){this._fnMemorizePackage(t,i)}return this._createNamespace(i,a)};a.prototype._createAggregationName=function(t,e){var r=t.getMetadata()._sClassName;var a=r.lastIndexOf(".");var i=a===-1?r:r.substring(0,a);return this._createNamespace(i,e)};a.prototype._createNamespace=function(t,e){if(this._sDefaultNamespace&&this._sDefaultNamespace===t){return e}else{return t+":"+e}};return a});