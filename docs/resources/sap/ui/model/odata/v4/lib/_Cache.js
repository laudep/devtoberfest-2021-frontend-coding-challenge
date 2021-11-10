/*!
 * OpenUI5
 * (c) Copyright 2009-2021 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["./_GroupLock","./_Helper","./_Requestor","sap/base/Log","sap/base/util/isEmptyObject","sap/ui/base/SyncPromise","sap/ui/model/odata/ODataUtils"],function(e,t,n,i,r,s,o){"use strict";var a="sap.ui.model.odata.v4.lib._Cache",u=/\(\$uid=[-\w]+\)$/,h="@com.sap.vocabularies.Common.v1.Messages",l=/^-?\d+$/,d=/^([^(]*)(\(.*\))$/;function c(e,t,n,i){if(n.$count!==undefined){p(e,t,n,n.$count+i)}}function f(e,t){return t===""||e===t||e.startsWith(t+"/")}function p(e,n,i,r){if(typeof r==="string"){r=parseInt(r)}t.updateExisting(e,n,i,{$count:r})}function g(e,t,n,i,r,s){this.iActiveUsages=1;this.mChangeListeners={};this.fnGetOriginalResourcePath=r;this.iInactiveSince=Infinity;this.mPatchRequests={};this.oPendingRequestsPromise=null;this.mPostRequests={};this.sReportedMessagesPath=undefined;this.oRequestor=e;this.bSentRequest=false;this.bSortExpandSelect=i;this.setResourcePath(t);this.setQueryOptions(n);this.bSharedRequest=s}g.prototype._delete=function(n,i,r,o,a){var u=r.split("/"),h=u.pop(),d=l.test(h)?Number(h):undefined,c=u.join("/"),f=this;this.checkSharedRequest();this.addPendingRequest();return this.fetchValue(e.$cached,c).then(function(e){var r=g.from$skip(h,e),u=h?e[r]||e.$byPredicate[r]:e,l,p=t.getPrivateAnnotation(u,"predicate"),P=t.buildPath(c,Array.isArray(e)?p:h),y=t.getPrivateAnnotation(u,"transient");if(y===true){throw new Error("No 'delete' allowed while waiting for server response")}if(y){n.unlock();f.oRequestor.removePost(y,u);return undefined}if(u["$ui5.deleting"]){throw new Error("Must not delete twice: "+i)}u["$ui5.deleting"]=true;l={"If-Match":o||u};i+=f.oRequestor.buildQueryString(f.sMetaPath,f.mQueryOptions,true);return s.all([f.oRequestor.request("DELETE",i,n.getUnlockedCopy(),l,undefined,undefined,undefined,undefined,t.buildPath(f.getOriginalResourcePath(u),P)).catch(function(e){if(e.status!==404){delete u["$ui5.deleting"];throw e}}).then(function(){if(Array.isArray(e)){a(f.removeElement(e,d,p,c),e)}else{if(h){t.updateExisting(f.mChangeListeners,c,e,g.makeUpdateData([h],null))}else{u["$ui5.deleted"]=true}a()}f.oRequestor.getModelInterface().reportStateMessages(f.sResourcePath,[],[P])}),d===undefined&&f.requestCount(n),n.unlock()])}).finally(function(){f.removePendingRequest()})};g.prototype.addPendingRequest=function(){var e;if(!this.oPendingRequestsPromise){this.oPendingRequestsPromise=new s(function(t){e=t});this.oPendingRequestsPromise.$count=0;this.oPendingRequestsPromise.$resolve=e}this.oPendingRequestsPromise.$count+=1};g.prototype.calculateKeyPredicate=function(e,n,i){var r,s=n[i];if(s&&s.$Key){r=t.getKeyPredicate(e,i,n);if(r){t.setPrivateAnnotation(e,"predicate",r)}}return r};g.prototype.checkSharedRequest=function(){if(this.bSharedRequest){throw new Error(this+" is read-only")}};g.prototype.create=function(e,n,i,r,o,a,u){var h,l=o&&o["@$ui5.keepTransientPath"],d,f=this;function p(){t.removeByPath(f.mPostRequests,i,o);h.splice(h.indexOf(o),1);h.$created-=1;c(f.mChangeListeners,i,h,-1);delete h.$byPredicate[r];if(!i){f.adjustReadRequests(0,-1)}e.cancel()}function g(){f.addPendingRequest();t.setPrivateAnnotation(o,"transient",true);u()}function P(e,n){var u=n.getGroupId();t.setPrivateAnnotation(o,"transient",u);t.addByPath(f.mPostRequests,i,o);return s.all([f.oRequestor.request("POST",e,n,null,d,g,p,undefined,t.buildPath(f.sResourcePath,i,r)),f.fetchTypes()]).then(function(e){var n=e[0],s,a;t.deletePrivateAnnotation(o,"postBody");t.deletePrivateAnnotation(o,"transient");o["@$ui5.context.isTransient"]=false;t.removeByPath(f.mPostRequests,i,o);f.visitResponse(n,e[1],t.getMetaPath(t.buildPath(f.sMetaPath,i)),i+r,l);s=t.getPrivateAnnotation(n,"predicate");if(s){t.setPrivateAnnotation(o,"predicate",s);if(l){s=r}else{h.$byPredicate[s]=o;t.updateTransientPaths(f.mChangeListeners,r,s)}}a=t.getQueryOptionsForPath(f.mQueryOptions,i).$select;t.updateSelected(f.mChangeListeners,t.buildPath(i,s||r),o,n,a&&a.concat("@odata.etag"));f.removePendingRequest();return o},function(t){if(t.canceled){throw t}f.removePendingRequest();a(t);if(f.fetchTypes().isRejected()){throw t}return P(e,f.oRequestor.lockGroup(f.oRequestor.getGroupSubmitMode(u)==="API"?u:"$parked."+u,f,true,true))})}this.checkSharedRequest();o=t.publicClone(o,true)||{};d=t.merge({},o);t.setPrivateAnnotation(o,"postBody",d);t.setPrivateAnnotation(o,"transientPredicate",r);o["@$ui5.context.isTransient"]=true;h=this.getValue(i);if(!Array.isArray(h)){throw new Error("Create is only supported for collections; '"+i+"' does not reference a collection")}h.unshift(o);h.$created+=1;c(this.mChangeListeners,i,h,1);h.$byPredicate=h.$byPredicate||{};h.$byPredicate[r]=o;if(!i){f.adjustReadRequests(0,1)}return n.then(function(t){t+=f.oRequestor.buildQueryString(f.sMetaPath,f.mQueryOptions,true);return P(t,e)})};g.prototype.deregisterChange=function(e,n){if(!this.bSharedRequest){t.removeByPath(this.mChangeListeners,e,n)}};g.prototype.drillDown=function(e,n,r,o){var u=s.resolve(e),h,l,c,f=false,p=this;function P(e,t){i[t?"info":"error"]("Failed to drill-down into "+n+", invalid segment: "+e,p.toString(),a);return undefined}function y(n,i,s){var o=c.slice(0,s).join("/"),a,u;if(Array.isArray(n)){return P(i,i==="0")}return p.oRequestor.getModelInterface().fetchMetadata(p.sMetaPath+"/"+t.getMetaPath(o)).then(function(d){var g;if(!d){return P(i)}if(d.$Type==="Edm.Stream"){a=n[i+"@odata.mediaReadLink"]||n[i+"@mediaReadLink"];u=p.oRequestor.getServiceUrl();return a||t.buildPath(u+p.sResourcePath,o)}if(!f){g=n[t.getAnnotationKey(n,".Permissions",i)];if(g===0||g==="None"){return undefined}if(!h&&!Array.isArray(e)){h=e;l=0}return h&&p.fetchLateProperty(r,h,c.slice(0,l).join("/"),c.slice(l).join("/"),c.slice(l,s).join("/"))||P(i)}if(d.$kind==="NavigationProperty"){return null}if(!d.$Type.startsWith("Edm.")){return{}}if("$DefaultValue"in d){return d.$Type==="Edm.String"?d.$DefaultValue:t.parseLiteral(d.$DefaultValue,d.$Type,o)}return null})}if(!n){return u}c=n.split("/");return c.reduce(function(e,n,i){return e.then(function(e){var r,s,a;if(n==="$count"){return Array.isArray(e)?e.$count:P(n)}if(e===undefined||e===null){return undefined}if(typeof e!=="object"||n==="@$ui5._"||Array.isArray(e)&&(n[0]==="$"||n==="length")){return P(n)}if(t.hasPrivateAnnotation(e,"predicate")){h=e;l=i}a=e;f=f||e["@$ui5.context.isTransient"];s=d.exec(n);if(s){if(s[1]){e=e[s[1]]}if(e){e=e.$byPredicate&&e.$byPredicate[s[2]]}}else{r=g.from$skip(n,e);if(o&&r===n&&(e[n]===undefined||e[n]===null)){e[n]={}}e=e[r]}return e===undefined&&n[0]!=="#"&&n[0]!=="@"?y(a,n,i+1):e})},u)};g.prototype.fetchLateProperty=function(e,n,i,r,s){var o,a,u,h,l,d,c=t.getMetaPath(i),f=this.fetchTypes().getResult(),p=[r],g=this;function P(e,n){var i=t.buildPath(o,n),r=f[i],s;if(!r){r=g.fetchType(f,i).getResult()}if(n){(r.$Key||[]).forEach(function(e){if(typeof e==="object"){e=e[Object.keys(e)[0]]}p.push(t.buildPath(n,e))});p.push(n+"/@odata.etag");p.push(n+"/@$ui5._/predicate")}if(e.$expand){s=Object.keys(e.$expand)[0];P(e.$expand[s],t.buildPath(n,s))}}if(!this.mLateQueryOptions){return undefined}o=t.buildPath(this.sMetaPath,c);l=t.intersectQueryOptions(t.getQueryOptionsForPath(this.mLateQueryOptions,i),[r],this.oRequestor.getModelInterface().fetchMetadata,o,{});if(!l){return undefined}P(l);a=t.buildPath(this.sResourcePath,i);d=a+this.oRequestor.buildQueryString(o,l,false,true);h=this.mPropertyRequestByPath[d];if(!h){u=a+this.oRequestor.buildQueryString(o,this.mQueryOptions,true);h=this.oRequestor.request("GET",u,e.getUnlockedCopy(),undefined,undefined,undefined,undefined,o,undefined,false,l).then(function(e){g.visitResponse(e,f,o,i);return e});this.mPropertyRequestByPath[d]=h}return h.then(function(e){var r=t.getPrivateAnnotation(e,"predicate");if(r&&t.getPrivateAnnotation(n,"predicate")!==r){throw new Error("GET "+d+": Key predicate changed from "+t.getPrivateAnnotation(n,"predicate")+" to "+r)}if(e["@odata.etag"]!==n["@odata.etag"]){throw new Error("GET "+d+": ETag changed")}t.updateSelected(g.mChangeListeners,i,n,e,p);return t.drillDown(n,s.split("/"))}).finally(function(){delete g.mPropertyRequestByPath[d]})};g.prototype.fetchType=function(e,t){var n=this;return this.oRequestor.fetchTypeForPath(t).then(function(i){var r,o=[];if(i){r=n.oRequestor.getModelInterface().fetchMetadata(t+"/"+h).getResult();if(r){i=Object.create(i);i[h]=r}e[t]=i;(i.$Key||[]).forEach(function(i){if(typeof i==="object"){i=i[Object.keys(i)[0]];o.push(n.fetchType(e,t+"/"+i.slice(0,i.lastIndexOf("/"))))}});return s.all(o).then(function(){return i})}})};g.prototype.fetchTypes=function(){var e,t,n=this;function i(r,s){if(s&&s.$expand){Object.keys(s.$expand).forEach(function(o){var a=r;o.split("/").forEach(function(i){a+="/"+i;e.push(n.fetchType(t,a))});i(a,s.$expand[o])})}}if(!this.oTypePromise){e=[];t={};e.push(this.fetchType(t,this.sMetaPath));i(this.sMetaPath,this.mQueryOptions);this.oTypePromise=s.all(e).then(function(){return t})}return this.oTypePromise};g.prototype.getDownloadQueryOptions=function(e){return e};g.prototype.getDownloadUrl=function(e,n){var i=this.mQueryOptions;if(e){i=t.getQueryOptionsForPath(i,e);i=t.merge({},n,i)}return this.oRequestor.getServiceUrl()+t.buildPath(this.sResourcePath,e)+this.oRequestor.buildQueryString(t.buildPath(this.sMetaPath,t.getMetaPath(e)),this.getDownloadQueryOptions(i))};g.prototype.getLateQueryOptions=function(){return this.mLateQueryOptions};g.prototype.getQueryOptions=function(){return this.mQueryOptions};g.prototype.getValue=function(e){throw new Error("Unsupported operation")};g.prototype.getOriginalResourcePath=function(e){return this.fnGetOriginalResourcePath&&this.fnGetOriginalResourcePath(e)||this.sResourcePath};g.prototype.getResourcePath=function(){return this.sResourcePath};g.prototype.hasChangeListeners=function(){return!r(this.mChangeListeners)};g.prototype.hasPendingChangesForPath=function(e){return Object.keys(this.mPatchRequests).some(function(t){return f(t,e)})||Object.keys(this.mPostRequests).some(function(t){return f(t,e)})};g.prototype.hasSentRequest=function(){return this.bSentRequest};g.prototype.patch=function(n,i){var r=this;this.checkSharedRequest();return this.fetchValue(e.$cached,n).then(function(e){t.updateExisting(r.mChangeListeners,n,e,i);return e})};g.prototype.refreshSingle=function(n,i,r,o,a,u){var h=this;this.checkSharedRequest();return this.fetchValue(e.$cached,i).then(function(e){var l=Object.assign({},t.getQueryOptionsForPath(h.mQueryOptions,i)),d;if(r!==undefined){o=t.getPrivateAnnotation(e[r],"predicate")}d=t.buildPath(h.sResourcePath,i,o);if(a&&h.mLateQueryOptions){t.aggregateExpandSelect(l,h.mLateQueryOptions)}delete l.$apply;delete l.$count;delete l.$filter;delete l.$orderby;delete l.$search;d+=h.oRequestor.buildQueryString(h.sMetaPath,l,false,h.bSortExpandSelect);h.bSentRequest=true;return s.all([h.oRequestor.request("GET",d,n,undefined,undefined,u),h.fetchTypes()]).then(function(t){var n=t[0];h.replaceElement(e,r,o,n,t[1],i)})})};g.prototype.refreshSingleWithRemove=function(n,i,r,o,a,u,h){var l=this;this.checkSharedRequest();return s.all([this.fetchValue(e.$cached,i),this.fetchTypes()]).then(function(e){var d=e[0],c,f,p={},g,P,y=Object.assign({},t.getQueryOptionsForPath(l.mQueryOptions,i)),m,R=t.buildPath(l.sResourcePath,i),v=[],$=e[1];if(r!==undefined){c=d[r];o=t.getPrivateAnnotation(c,"predicate")}else{c=d.$byPredicate[o]}P=t.getKeyFilter(c,l.sMetaPath,$);f=(y.$filter?"("+y.$filter+") and ":"")+P;delete y.$count;delete y.$orderby;l.bSentRequest=true;if(a){if(l.mLateQueryOptions){t.aggregateExpandSelect(y,l.mLateQueryOptions)}p=Object.assign({},y);p.$filter=f;y.$filter=P;delete y.$search;m=R+l.oRequestor.buildQueryString(l.sMetaPath,y,false,l.bSortExpandSelect);v.push(l.oRequestor.request("GET",m,n,undefined,undefined,u));if(r!==undefined&&(P!==f||p.$search)){delete p.$select;delete p.$expand;p.$count=true;p.$top=0;g=R+l.oRequestor.buildQueryString(l.sMetaPath,p);v.push(l.oRequestor.request("GET",g,n.getUnlockedCopy()))}}else{y.$filter=f;m=R+l.oRequestor.buildQueryString(l.sMetaPath,y,false,l.bSortExpandSelect);v.push(l.oRequestor.request("GET",m,n,undefined,undefined,u))}return s.all(v).then(function(e){var t=e[0].value,n=e[1]&&e[1]["@odata.count"]==="0";if(t.length>1){throw new Error("Unexpected server response, more than one entity returned.")}else if(t.length===0){l.removeElement(d,r,o,i);l.oRequestor.getModelInterface().reportStateMessages(l.sResourcePath,[],[i+o]);h(false)}else if(n){l.removeElement(d,r,o,i);l.replaceElement(d,undefined,o,t[0],$,i);h(true)}else{l.replaceElement(d,r,o,t[0],$,i)}})})};g.prototype.registerChange=function(e,n){if(!this.bSharedRequest){t.addByPath(this.mChangeListeners,e,n)}};g.prototype.removeElement=function(e,n,i,r){var s,o;s=e.$byPredicate[i];if(n!==undefined){n=g.getElementIndex(e,i,n);e.splice(n,1);c(this.mChangeListeners,r,e,-1)}delete e.$byPredicate[i];o=t.getPrivateAnnotation(s,"transientPredicate");if(o){e.$created-=1;delete e.$byPredicate[o]}else if(!r){if(n!==undefined){this.iLimit-=1;this.adjustReadRequests(n,-1)}}return n};g.prototype.removeMessages=function(){if(this.sReportedMessagesPath){this.oRequestor.getModelInterface().reportStateMessages(this.sReportedMessagesPath,{});this.sReportedMessagesPath=undefined}};g.prototype.removePendingRequest=function(){if(this.oPendingRequestsPromise){this.oPendingRequestsPromise.$count-=1;if(!this.oPendingRequestsPromise.$count){this.oPendingRequestsPromise.$resolve();this.oPendingRequestsPromise=null}}};g.prototype.replaceElement=function(e,n,i,r,s,o){var a,u;if(n===undefined){e.$byPredicate[i]=r}else{n=g.getElementIndex(e,i,n);a=e[n];e[n]=e.$byPredicate[i]=r;u=t.getPrivateAnnotation(a,"transientPredicate");if(u){r["@$ui5.context.isTransient"]=false;e.$byPredicate[u]=r;t.setPrivateAnnotation(r,"transientPredicate",u)}}this.visitResponse(r,s,t.getMetaPath(t.buildPath(this.sMetaPath,o)),o+i)};g.prototype.requestCount=function(e){var t,n,i,r=this;if(this.mQueryOptions&&this.mQueryOptions.$count){n=Object.assign({},this.mQueryOptions);delete n.$expand;delete n.$orderby;delete n.$select;t=this.getFilterExcludingCreated();if(t){n.$filter=n.$filter?"("+n.$filter+") and "+t:t}n.$top=0;i=this.sResourcePath+this.oRequestor.buildQueryString(this.sMetaPath,n);return this.oRequestor.request("GET",i,e.getUnlockedCopy()).catch(function(t){if(t.cause&&t.cause.status===404){return r.oRequestor.request("GET",i,e.getUnlockedCopy())}throw t}).then(function(e){var t=parseInt(e["@odata.count"])+r.aElements.$created;p(r.mChangeListeners,"",r.aElements,t);r.iLimit=t})}};g.prototype.resetChangesForPath=function(e){var n=this;Object.keys(this.mPatchRequests).forEach(function(t){var i,r;if(f(t,e)){i=n.mPatchRequests[t];for(r=i.length-1;r>=0;r-=1){n.oRequestor.removePatch(i[r])}delete n.mPatchRequests[t]}});Object.keys(this.mPostRequests).forEach(function(i){var r,s,o;if(f(i,e)){r=n.mPostRequests[i];for(o=r.length-1;o>=0;o-=1){s=t.getPrivateAnnotation(r[o],"transient");n.oRequestor.removePost(s,r[o])}delete n.mPostRequests[i]}})};g.prototype.setActive=function(e){if(e){this.iActiveUsages+=1;this.iInactiveSince=Infinity}else{this.iActiveUsages-=1;if(!this.iActiveUsages){this.iInactiveSince=Date.now()}this.mChangeListeners={}}};g.prototype.setLateQueryOptions=function(e){if(e){this.mLateQueryOptions={$select:e.$select,$expand:e.$expand}}else{this.mLateQueryOptions=null}};g.prototype.setProperty=function(n,i,r){var s=this;this.checkSharedRequest();return this.fetchValue(e.$cached,r,null,null,true).then(function(e){t.updateAll(s.mChangeListeners,r,e,g.makeUpdateData(n.split("/"),i))})};g.prototype.setQueryOptions=function(e,t){this.checkSharedRequest();if(this.bSentRequest&&!t){throw new Error("Cannot set query options: Cache has already sent a request")}this.mQueryOptions=e;this.sQueryString=this.oRequestor.buildQueryString(this.sMetaPath,e,false,this.bSortExpandSelect)};g.prototype.setResourcePath=function(e){this.checkSharedRequest();this.sResourcePath=e;this.sMetaPath=t.getMetaPath("/"+e);this.oTypePromise=undefined;this.mLateQueryOptions=null;this.mPropertyRequestByPath={}};g.prototype.toString=function(){return this.oRequestor.getServiceUrl()+this.sResourcePath+this.sQueryString};g.prototype.update=function(n,r,o,u,h,l,d,c,f){var p,P=r.split("/"),y,m=this;this.checkSharedRequest();try{p=this.fetchValue(e.$cached,l)}catch(e){if(!e.$cached||this.oPromise!==null){throw e}p=this.oPromise=s.resolve({"@odata.etag":"*"})}return p.then(function(e){var p=t.buildPath(l,r),R=n.getGroupId(),v,$,q,E,b,S,w=g.makeUpdateData(P,o);function O(){t.removeByPath(m.mPatchRequests,p,$);t.updateExisting(m.mChangeListeners,l,e,g.makeUpdateData(P,v))}function M(n,i){var r={"If-Match":e},o;function a(){o=m.oRequestor.lockGroup(R,m,true);if(f){f()}}if(c){r.Prefer="return=minimal"}$=m.oRequestor.request("PATCH",h,n,r,w,a,O,undefined,t.buildPath(m.getOriginalResourcePath(e),l),i);t.addByPath(m.mPatchRequests,p,$);return s.all([$,m.fetchTypes()]).then(function(n){var i=n[0];t.removeByPath(m.mPatchRequests,p,$);if(!c){m.visitResponse(i,n[1],t.getMetaPath(t.buildPath(m.sMetaPath,l)),l)}t.updateExisting(m.mChangeListeners,l,e,c?{"@odata.etag":i["@odata.etag"]}:i)},function(n){var i=R;if(!u){O();throw n}t.removeByPath(m.mPatchRequests,p,$);if(n.canceled){throw n}u(n);switch(m.oRequestor.getGroupSubmitMode(R)){case"API":break;case"Auto":if(!m.oRequestor.hasChanges(R,e)){i="$parked."+R}break;default:throw n}o.unlock();o=undefined;return M(m.oRequestor.lockGroup(i,m,true,true),true)}).finally(function(){if(o){o.unlock()}})}if(!e){throw new Error("Cannot update '"+r+"': '"+l+"' does not exist")}b=t.getPrivateAnnotation(e,"transient");if(b){if(b===true){throw new Error("No 'update' allowed while waiting for server response")}if(b.startsWith("$parked.")){E=b;b=b.slice(8)}if(b!==R){throw new Error("The entity will be created via group '"+b+"'. Cannot patch via group '"+R+"'")}}v=t.drillDown(e,P);t.updateAll(m.mChangeListeners,l,e,w);q=t.getPrivateAnnotation(e,"postBody");if(q){t.updateAll({},l,q,w)}if(d){y=d.split("/");d=t.buildPath(l,d);S=m.getValue(d);if(S===undefined){i.debug("Missing value for unit of measure "+d+" when updating "+p,m.toString(),a)}else{t.merge(b?q:w,g.makeUpdateData(y,S))}}if(b){if(E){t.setPrivateAnnotation(e,"transient",b);m.oRequestor.relocate(E,q,b)}n.unlock();return Promise.resolve()}m.oRequestor.relocateAll("$parked."+R,R,e);h+=m.oRequestor.buildQueryString(m.sMetaPath,m.mQueryOptions,true);return M(n)})};g.prototype.visitResponse=function(e,n,i,r,s,o){var a,l=false,d={},c=this.oRequestor.getServiceUrl()+this.sResourcePath,f=this;function g(e,n,i){l=true;if(e&&e.length){d[n]=e;e.forEach(function(e){if(e.longtextUrl){e.longtextUrl=t.makeAbsolute(e.longtextUrl,i)}})}}function P(e,n){return n?t.makeAbsolute(n,e):e}function y(e,n,i,r){var s={},u,h,l,d;for(d=0;d<e.length;d+=1){h=e[d];u=i===""?o+d:d;if(h&&typeof h==="object"){m(h,n,i,r,u);l=t.getPrivateAnnotation(h,"predicate");if(!i){a.push(l||u.toString())}if(l){s[l]=h;e.$byPredicate=s}}}}function m(e,i,o,l,d){var c,R,v=n[i],$=v&&v[h]&&v[h].$Path,q;l=P(l,e["@odata.context"]);R=f.calculateKeyPredicate(e,n,i);if(d!==undefined){o=t.buildPath(o,R||d)}else if(!s&&R){c=u.exec(o);if(c){o=o.slice(0,-c[0].length)+R}}if(r&&!a){a=[o]}if($){q=t.drillDown(e,$.split("/"));if(q!==undefined){g(q,o,l)}}Object.keys(e).forEach(function(n){var r,s=i+"/"+n,a=e[n],u=t.buildPath(o,n);if(n.endsWith("@odata.mediaReadLink")||n.endsWith("@mediaReadLink")){e[n]=t.makeAbsolute(a,l)}if(n.includes("@")){return}if(Array.isArray(a)){a.$created=0;a.$count=undefined;r=e[n+"@odata.count"];if(r){p({},"",a,r)}else if(!e[n+"@odata.nextLink"]){p({},"",a,a.length)}y(a,s,u,P(l,e[n+"@odata.context"]))}else if(a&&typeof a==="object"){m(a,s,u,l)}})}if(o!==undefined){a=[];y(e.value,i||this.sMetaPath,"",P(c,e["@odata.context"]))}else if(e&&typeof e==="object"){m(e,i||this.sMetaPath,r||"",c)}if(l){this.sReportedMessagesPath=this.getOriginalResourcePath(e);this.oRequestor.getModelInterface().reportStateMessages(this.sReportedMessagesPath,d,a)}};function P(e,t,n,i,r,s){g.call(this,e,t,n,i,function(){return r},s);this.sContext=undefined;this.aElements=[];this.aElements.$byPredicate={};this.aElements.$count=undefined;this.aElements.$created=0;this.aElements.$tail=undefined;this.iLimit=Infinity;this.aReadRequests=[];this.bServerDrivenPaging=false;this.oSyncPromiseAll=undefined}P.prototype=Object.create(g.prototype);P.prototype.addKeptElement=function(e){this.aElements.$byPredicate[t.getPrivateAnnotation(e,"predicate")]=e};P.prototype.adjustReadRequests=function(e,t){this.aReadRequests.forEach(function(n){if(n.iStart>=e){n.iStart+=t;n.iEnd+=t}})};P.prototype.fetchValue=function(t,n,i,r,o){var a,u=n.split("/")[0],h,l=this;t.unlock();if(this.aElements.$byPredicate[u]){h=s.resolve()}else if((t===e.$cached||u!=="$count")&&this.aElements[u]!==undefined){h=s.resolve(this.aElements[u])}else{if(!this.oSyncPromiseAll){a=this.aElements.$tail?this.aElements.concat(this.aElements.$tail):this.aElements;this.oSyncPromiseAll=s.all(a)}h=this.oSyncPromiseAll}return h.then(function(){l.registerChange(n,r);return l.drillDown(l.aElements,n,t,o)})};P.prototype.fill=function(e,t,n){var i,r=Math.max(this.aElements.length,1024);if(n>r){if(this.aElements.$tail&&e){throw new Error("Cannot fill from "+t+" to "+n+", $tail already in use, # of elements is "+this.aElements.length)}this.aElements.$tail=e;n=this.aElements.length}for(i=t;i<n;i+=1){this.aElements[i]=e}this.oSyncPromiseAll=undefined};P.prototype.getFilterExcludingCreated=function(){var e,n,i=[],r,s;for(s=0;s<this.aElements.$created;s+=1){e=this.aElements[s];if(!e["@$ui5.context.isTransient"]){r=r||this.fetchTypes().getResult();n=t.getKeyFilter(e,this.sMetaPath,r);if(n){i.push(n)}}}return i.length?"not ("+i.join(" or ")+")":undefined};P.prototype.getQueryString=function(){var e=this.getFilterExcludingCreated(),n=Object.assign({},this.mQueryOptions),i=n.$filter,r=this.sQueryString;if(e){if(i){n.$filter="("+i+") and "+e;r=this.oRequestor.buildQueryString(this.sMetaPath,n,false,this.bSortExpandSelect)}else{r+=(r?"&":"?")+"$filter="+t.encode(e,false)}}return r};P.prototype.getResourcePathWithQuery=function(e,t){var n=this.aElements.$created,i=this.getQueryString(),r=i?"&":"?",s=t-e,o=this.sResourcePath+i;if(e<n){throw new Error("Must not request created element")}e-=n;if(e>0||s<Infinity){o+=r+"$skip="+e}if(s<Infinity){o+="&$top="+s}return o};P.prototype.getValue=function(t){var n=this.drillDown(this.aElements,t,e.$cached);if(n.isFulfilled()){return n.getResult()}};P.prototype.handleResponse=function(e,n,i,r){var s=-1,o,a=this.aElements.$created,u,h,l=this.aElements.$count,d,c=i.value.length,f;this.sContext=i["@odata.context"];this.visitResponse(i,r,undefined,undefined,undefined,e);for(f=0;f<c;f+=1){u=i.value[f];d=t.getPrivateAnnotation(u,"predicate");if(d){h=this.aElements.$byPredicate[d];if(h){if(u["@odata.etag"]===h["@odata.etag"]){t.merge(u,h)}else if(this.hasPendingChangesForPath(d)){throw new Error("Modified on client and on server: "+this.sResourcePath+d)}}this.aElements.$byPredicate[d]=u}this.aElements[e+f]=u}o=i["@odata.count"];if(o){this.iLimit=s=parseInt(o)}if(i["@odata.nextLink"]){this.bServerDrivenPaging=true;if(n<this.aElements.length){for(f=e+c;f<n;f+=1){delete this.aElements[f]}}else{this.aElements.length=e+c}}else if(c<n-e){if(s===-1){s=l&&l-a}s=Math.min(s!==undefined?s:Infinity,e-a+c);this.aElements.length=a+s;this.iLimit=s;if(!o&&s>0&&!this.aElements[s-1]){s=undefined}}if(s!==-1){p(this.mChangeListeners,"",this.aElements,s!==undefined?s+a:undefined)}};P.prototype.read=function(e,t,n,i,r){var a,u=this.oPendingRequestsPromise||this.aElements.$tail,h=this;if(e<0){throw new Error("Illegal index "+e+", must be >= 0")}if(t<0){throw new Error("Illegal length "+t+", must be >= 0")}if(u){return u.then(function(){return h.read(e,t,n,i,r)})}o._getReadIntervals(this.aElements,e,t,this.bServerDrivenPaging?0:n,this.aElements.$created+this.iLimit).forEach(function(e){h.requestElements(e.start,e.end,i.getUnlockedCopy(),r);r=undefined});i.unlock();a=this.aElements.slice(e,e+t+n);if(this.aElements.$tail&&e+t>this.aElements.length){a.push(this.aElements.$tail)}return s.all(a).then(function(){var n=h.aElements.slice(e,e+t);n.$count=h.aElements.$count;return{"@odata.context":h.sContext,value:n}})};P.prototype.refreshKeptElements=function(e,n){var i=Object.keys(this.aElements.$byPredicate).sort(),r,s=this;function o(){var e,n=t.merge({},s.mQueryOptions);t.aggregateExpandSelect(n,s.mLateQueryOptions);delete n.$count;delete n.$orderby;delete n.$search;e=i.map(function(e){return t.getKeyFilter(s.aElements.$byPredicate[e],s.sMetaPath,r)});n.$filter=e.join(" or ");if(e.length>1){n.$top=e.length}return s.sResourcePath+s.oRequestor.buildQueryString(s.sMetaPath,n,false,true)}if(i.length===0){return undefined}r=this.fetchTypes().getResult();return this.oRequestor.request("GET",o(),e).then(function(e){var o;s.visitResponse(e,r,undefined,undefined,undefined,0);o=e.value.$byPredicate||{};i.forEach(function(e){if(e in o){t.updateAll(s.mChangeListeners,e,s.aElements.$byPredicate[e],o[e])}else{delete s.aElements.$byPredicate[e];n(e)}})})};P.prototype.requestElements=function(e,t,n,i){var r,o={iEnd:t,iStart:e},a=this;this.aReadRequests.push(o);this.bSentRequest=true;r=s.all([this.oRequestor.request("GET",this.getResourcePathWithQuery(e,t),n,undefined,undefined,i),this.fetchTypes()]).then(function(e){if(a.aElements.$tail===r){a.aElements.$tail=undefined}a.handleResponse(o.iStart,o.iEnd,e[0],e[1])}).catch(function(e){a.fill(undefined,o.iStart,o.iEnd);throw e}).finally(function(){a.aReadRequests.splice(a.aReadRequests.indexOf(o),1)});this.fill(r,e,t)};P.prototype.requestSideEffects=function(e,n,i,r,o){var a,u=-1,h,l,d={},c,f=this.fetchTypes().getResult(),p=this;this.checkSharedRequest();if(this.oPendingRequestsPromise){return this.oPendingRequestsPromise.then(function(){return p.requestSideEffects(e,n,i,r,o)})}l=t.intersectQueryOptions(Object.assign({},this.mQueryOptions,this.mLateQueryOptions),n,this.oRequestor.getModelInterface().fetchMetadata,this.sMetaPath,i,"",true);if(!l){return s.resolve()}if(o){a=[this.aElements.$byPredicate[r[0]]]}else{r.forEach(function(e){d[e]=true});a=this.aElements.filter(function(e,n){var i;if(!e){return false}if(t.hasPrivateAnnotation(e,"transient")){u=n;return false}i=t.getPrivateAnnotation(e,"predicate");if(d[i]||t.hasPrivateAnnotation(e,"transientPredicate")){u=n;delete d[i];return true}delete p.aElements[n];delete p.aElements.$byPredicate[i];return false});this.aElements.length=u+1;if(!a.length){return s.resolve()}Object.keys(d).forEach(function(e){a.push(p.aElements.$byPredicate[e])})}l.$filter=a.map(function(e){return t.getKeyFilter(e,p.sMetaPath,f)}).join(" or ");if(a.length>1){l.$top=a.length}t.selectKeyProperties(l,f[this.sMetaPath]);delete l.$count;delete l.$orderby;delete l.$search;h=t.extractMergeableQueryOptions(l);c=this.sResourcePath+this.oRequestor.buildQueryString(this.sMetaPath,l,false,true);return this.oRequestor.request("GET",c,e,undefined,undefined,undefined,undefined,this.sMetaPath,undefined,false,h).then(function(e){var i,r,s,o;function u(e){e=e.slice(r.length+1);return!n.some(function(n){return t.getRelativePath(e,n)!==undefined})}if(e.value.length!==a.length){throw new Error("Expected "+a.length+" row(s), but instead saw "+e.value.length)}p.visitResponse(e,f,undefined,"",false,NaN);for(s=0,o=e.value.length;s<o;s+=1){i=e.value[s];r=t.getPrivateAnnotation(i,"predicate");t.updateAll(p.mChangeListeners,r,p.aElements.$byPredicate[r],i,u)}})};function y(e,t,n){g.call(this,e,t,n);this.oPromise=null}y.prototype=Object.create(g.prototype);y.prototype._delete=function(){throw new Error("Unsupported")};y.prototype.create=function(){throw new Error("Unsupported")};y.prototype.fetchValue=function(e,t,n,i,r){var o=this;if(r){throw new Error("Unsupported argument: bCreateOnDemand")}if(this.oPromise){e.unlock()}else{this.bSentRequest=true;this.oPromise=s.resolve(this.oRequestor.request("GET",this.sResourcePath+this.sQueryString,e,undefined,undefined,n,undefined,this.sMetaPath))}return this.oPromise.then(function(e){o.registerChange("",i);return e&&typeof e==="object"?e.value:e})};y.prototype.update=function(){throw new Error("Unsupported")};function m(e,t,n,i,r,s,o,a){g.call(this,e,t,n,i,s,r);this.sMetaPath=a||this.sMetaPath;this.bPost=o;this.bPosting=false;this.oPromise=null}m.prototype=Object.create(g.prototype);m.prototype.fetchValue=function(e,t,n,i,r){var o=this.sResourcePath+this.sQueryString,a=this;if(this.oPromise){e.unlock()}else{if(this.bPost){throw new Error("Cannot fetch a value before the POST request")}this.oPromise=s.all([this.oRequestor.request("GET",o,e,undefined,undefined,n,undefined,this.sMetaPath),this.fetchTypes()]).then(function(e){a.visitResponse(e[0],e[1]);return e[0]});this.bSentRequest=true}return this.oPromise.then(function(n){if(n&&n["$ui5.deleted"]){throw new Error("Cannot read a deleted entity")}a.registerChange(t,i);return a.drillDown(n,t,e,r)})};m.prototype.getValue=function(t){var n;if(this.oPromise&&this.oPromise.isFulfilled()){n=this.drillDown(this.oPromise.getResult(),t,e.$cached);if(n.isFulfilled()){return n.getResult()}}};m.prototype.post=function(e,t,n,i,r){var o,a=n?{"If-Match":i&&"@odata.etag"in n?"*":n}:{},u="POST",h=this;function l(e){h.bPosting=true;return s.all([h.oRequestor.request(u,h.sResourcePath+h.sQueryString,e,a,t),h.fetchTypes()]).then(function(e){h.visitResponse(e[0],e[1]);h.bPosting=false;return e[0]},function(t){h.bPosting=false;if(r&&t.strictHandlingFailed){return r(t).then(function(t){var n;if(t){delete a["Prefer"];return l(e.getUnlockedCopy())}n=Error("Action canceled due to strict handling");n.canceled=true;throw n})}throw t})}this.checkSharedRequest();if(!this.bPost){throw new Error("POST request not allowed")}if(this.bPosting){throw new Error("Parallel POST requests not allowed")}if(n){o=e.getGroupId();this.oRequestor.relocateAll("$parked."+o,o,n)}if(t){u=t["X-HTTP-Method"]||u;delete t["X-HTTP-Method"];if(this.oRequestor.isActionBodyOptional()&&!Object.keys(t).length){t=undefined}}this.bSentRequest=true;if(r){a["Prefer"]="handling=strict"}this.oPromise=l(e);return this.oPromise};m.prototype.requestSideEffects=function(n,i,r,o){var a,u=this.oPromise,h,l,d=this;this.checkSharedRequest();h=u&&t.intersectQueryOptions(Object.assign({},this.mQueryOptions,this.mLateQueryOptions),i,this.oRequestor.getModelInterface().fetchMetadata,this.sMetaPath,r);if(!h){return s.resolve()}a=t.extractMergeableQueryOptions(h);o=(o||this.sResourcePath)+this.oRequestor.buildQueryString(this.sMetaPath,h,false,true);l=s.all([this.oRequestor.request("GET",o,n,undefined,undefined,undefined,undefined,this.sMetaPath,undefined,false,a),this.fetchTypes(),this.fetchValue(e.$cached,"")]).then(function(e){return e}).then(function(e){var n=e[0],r=e[2];t.setPrivateAnnotation(n,"predicate",t.getPrivateAnnotation(r,"predicate"));d.visitResponse(n,e[1]);t.updateAll(d.mChangeListeners,"",r,n,function(e){return!i.some(function(n){return t.getRelativePath(e,n)!==undefined})})});return l};g.create=function(e,n,i,r,s,o){var a,u,h,l,d;if(o){h=n+e.buildQueryString(t.getMetaPath("/"+n),i,false,r);d=e.$mSharedCollectionCacheByPath;if(!d){d=e.$mSharedCollectionCacheByPath={}}l=d[h];if(l){l.setActive(true)}else{u=Object.keys(d);a=u.length;if(a>100){u.filter(function(e){return!d[e].iActiveUsages}).sort(function(e,t){return d[e].iInactiveSince-d[t].iInactiveSince}).every(function(e){delete d[e];a-=1;return a>100})}l=d[h]=new P(e,n,i,r,s,o)}return l}return new P(e,n,i,r,s)};g.createProperty=function(e,t,n){return new y(e,t,n)};g.createSingle=function(e,t,n,i,r,s,o,a){return new m(e,t,n,i,r,s,o,a)};g.from$skip=function(e,t){return l.test(e)?(t.$created||0)+Number(e):e};g.getElementIndex=function(e,n,i){var r=e[i];if(!r||t.getPrivateAnnotation(r,"predicate")!==n){i=e.indexOf(e.$byPredicate[n])}return i};g.makeUpdateData=function(e,t){return e.reduceRight(function(e,t){var n={};n[t]=e;return n},t)};return g},false);