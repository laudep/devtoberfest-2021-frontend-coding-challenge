/*!
 * OpenUI5
 * (c) Copyright 2009-2021 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/support/library"],function(t){"use strict";var e=t.Categories,i=t.Severity,s=t.Audiences;var a={id:"objectStatusActive",audiences:[s.Control],categories:[e.Usage],enabled:true,minversion:"*",title:"ObjectStatus: active property",description:"Checks if active property is set to true but no icon or text are set.",resolution:"Set text or icon when active property is true",resolutionurls:[{text:"API Reference: sap.m.ObjectStatus",href:"https://sapui5.hana.ondemand.com/#/api/sap.m.ObjectStatus"}],check:function(t,e,s){s.getElementsByClassName("sap.m.ObjectStatus").forEach(function(e){var s=e.getId(),a=e.getMetadata().getElementName();if(e.getActive()&&!e.getText()&&!e.getIcon()){t.addIssue({severity:i.Medium,details:"ObjectStatus '"+a+"' ("+s+") sets active to true but no icon or text.",context:{id:s}})}})}};return[a]},true);