/*!
 * OpenUI5
 * (c) Copyright 2009-2021 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/thirdparty/jquery","./library","sap/ui/Device","sap/ui/core/ResizeHandler","sap/ui/core/Control","sap/m/library","sap/m/Button","sap/m/NavContainer","sap/ui/core/Configuration","sap/ui/core/theming/Parameters","sap/ui/dom/units/Rem","./FlexibleColumnLayoutRenderer","sap/base/Log","sap/base/assert","sap/base/util/isEmptyObject","sap/base/util/merge"],function(e,t,n,i,o,s,r,a,u,l,d,g,h,m,p,C){"use strict";var c=t.LayoutType;var _=o.extend("sap.f.FlexibleColumnLayout",{metadata:{interfaces:["sap.ui.core.IPlaceholderSupport"],properties:{autoFocus:{type:"boolean",group:"Behavior",defaultValue:true},layout:{type:"sap.f.LayoutType",defaultValue:c.OneColumn},defaultTransitionNameBeginColumn:{type:"string",group:"Appearance",defaultValue:"slide"},defaultTransitionNameMidColumn:{type:"string",group:"Appearance",defaultValue:"slide"},defaultTransitionNameEndColumn:{type:"string",group:"Appearance",defaultValue:"slide"},backgroundDesign:{type:"sap.m.BackgroundDesign",group:"Appearance",defaultValue:s.BackgroundDesign.Transparent},restoreFocusOnBackNavigation:{type:"boolean",group:"Behavior",defaultValue:false}},aggregations:{beginColumnPages:{type:"sap.ui.core.Control",multiple:true,forwarding:{getter:"_getBeginColumn",aggregation:"pages"}},midColumnPages:{type:"sap.ui.core.Control",multiple:true,forwarding:{getter:"_getMidColumn",aggregation:"pages"}},endColumnPages:{type:"sap.ui.core.Control",multiple:true,forwarding:{getter:"_getEndColumn",aggregation:"pages"}},landmarkInfo:{type:"sap.f.FlexibleColumnLayoutAccessibleLandmarkInfo",multiple:false},_beginColumnNav:{type:"sap.m.NavContainer",multiple:false,visibility:"hidden"},_midColumnNav:{type:"sap.m.NavContainer",multiple:false,visibility:"hidden"},_endColumnNav:{type:"sap.m.NavContainer",multiple:false,visibility:"hidden"},_beginColumnBackArrow:{type:"sap.m.Button",multiple:false,visibility:"hidden"},_midColumnForwardArrow:{type:"sap.m.Button",multiple:false,visibility:"hidden"},_midColumnBackArrow:{type:"sap.m.Button",multiple:false,visibility:"hidden"},_endColumnForwardArrow:{type:"sap.m.Button",multiple:false,visibility:"hidden"}},associations:{initialBeginColumnPage:{type:"sap.ui.core.Control",multiple:false},initialMidColumnPage:{type:"sap.ui.core.Control",multiple:false},initialEndColumnPage:{type:"sap.ui.core.Control",multiple:false}},events:{stateChange:{parameters:{layout:{type:"sap.f.LayoutType"},maxColumnsCount:{type:"int"},isNavigationArrow:{type:"boolean"},isResize:{type:"boolean"}}},beginColumnNavigate:{allowPreventDefault:true,parameters:{from:{type:"sap.ui.core.Control"},fromId:{type:"string"},to:{type:"sap.ui.core.Control"},toId:{type:"string"},firstTime:{type:"boolean"},isTo:{type:"boolean"},isBack:{type:"boolean"},isBackToTop:{type:"boolean"},isBackToPage:{type:"boolean"},direction:{type:"string"}}},afterBeginColumnNavigate:{parameters:{from:{type:"sap.ui.core.Control"},fromId:{type:"string"},to:{type:"sap.ui.core.Control"},toId:{type:"string"},firstTime:{type:"boolean"},isTo:{type:"boolean"},isBack:{type:"boolean"},isBackToTop:{type:"boolean"},isBackToPage:{type:"boolean"},direction:{type:"string"}}},midColumnNavigate:{allowPreventDefault:true,parameters:{from:{type:"sap.ui.core.Control"},fromId:{type:"string"},to:{type:"sap.ui.core.Control"},toId:{type:"string"},firstTime:{type:"boolean"},isTo:{type:"boolean"},isBack:{type:"boolean"},isBackToTop:{type:"boolean"},isBackToPage:{type:"boolean"},direction:{type:"string"}}},afterMidColumnNavigate:{parameters:{from:{type:"sap.ui.core.Control"},fromId:{type:"string"},to:{type:"sap.ui.core.Control"},toId:{type:"string"},firstTime:{type:"boolean"},isTo:{type:"boolean"},isBack:{type:"boolean"},isBackToTop:{type:"boolean"},isBackToPage:{type:"boolean"},direction:{type:"string"}}},endColumnNavigate:{allowPreventDefault:true,parameters:{from:{type:"sap.ui.core.Control"},fromId:{type:"string"},to:{type:"sap.ui.core.Control"},toId:{type:"string"},firstTime:{type:"boolean"},isTo:{type:"boolean"},isBack:{type:"boolean"},isBackToTop:{type:"boolean"},isBackToPage:{type:"boolean"},direction:{type:"string"}}},afterEndColumnNavigate:{parameters:{from:{type:"sap.ui.core.Control"},fromId:{type:"string"},to:{type:"sap.ui.core.Control"},toId:{type:"string"},firstTime:{type:"boolean"},isTo:{type:"boolean"},isBack:{type:"boolean"},isBackToTop:{type:"boolean"},isBackToPage:{type:"boolean"},direction:{type:"string"}}},columnResize:{parameters:{beginColumn:{type:"boolean"},midColumn:{type:"boolean"},endColumn:{type:"boolean"}}}}}});_.DEFAULT_COLUMN_LABELS={FirstColumn:"FCL_BEGIN_COLUMN_REGION_TEXT",MiddleColumn:"FCL_MID_COLUMN_REGION_TEXT",LastColumn:"FCL_END_COLUMN_REGION_TEXT"};_.COLUMN_RESIZING_ANIMATION_DURATION=560;_.PINNED_COLUMN_CLASS_NAME="sapFFCLPinnedColumn";_.COLUMN_ORDER=["begin","mid","end"];_.NAVIGATION_ARROW_WIDTH=d.toPx("1rem");_.prototype.init=function(){this._iWidth=0;this._oColumnFocusInfo={begin:{},mid:{},end:{}};this._initNavContainers();this._initButtons();this._oLayoutHistory=new f;this._oAnimationEndListener=new y;this._oRenderedColumnPagesBoolMap={};this._oColumnWidthInfo={begin:0,mid:0,end:0}};_.prototype._onNavContainerRendered=function(e){var t=e.srcControl,n=t.getPages().length>0,i=this._hasAnyColumnPagesRendered();this._setColumnPagesRendered(t.getId(),n);if(this._hasAnyColumnPagesRendered()!==i){this._hideShowArrows()}};_.prototype._createNavContainer=function(e){var t=e.charAt(0).toUpperCase()+e.slice(1);var n=new a(this.getId()+"-"+e+"ColumnNav",{autoFocus:this.getAutoFocus(),navigate:function(t){this._handleNavigationEvent(t,false,e)}.bind(this),afterNavigate:function(t){this._handleNavigationEvent(t,true,e)}.bind(this),defaultTransitionName:this["getDefaultTransitionName"+t+"Column"]()});n.addDelegate({onAfterRendering:this._onNavContainerRendered},this);this["_"+e+"ColumnFocusOutDelegate"]={onfocusout:function(t){this._oColumnFocusInfo[e]=t.target}};n.addEventDelegate(this["_"+e+"ColumnFocusOutDelegate"],this);return n};_.prototype._formatLandmarkInfo=function(e,t){var n=null;if(e){n=e["get"+t+"Label"]()}return{role:"region",label:n||_._getResourceBundle().getText(_.DEFAULT_COLUMN_LABELS[t])}};_.prototype._handleNavigationEvent=function(e,t,n){var i,o;if(t){i="after"+(n.charAt(0).toUpperCase()+n.slice(1))+"ColumnNavigate"}else{i=n+"ColumnNavigate"}o=this.fireEvent(i,e.mParameters,true);if(!o){e.preventDefault()}};_.prototype._getColumnByStringName=function(e){if(e==="end"){return this._getEndColumn()}else if(e==="mid"){return this._getMidColumn()}else{return this._getBeginColumn()}};_.prototype._getBeginColumn=function(){return this.getAggregation("_beginColumnNav")};_.prototype._getMidColumn=function(){return this.getAggregation("_midColumnNav")};_.prototype._getEndColumn=function(){return this.getAggregation("_endColumnNav")};_.prototype._flushColumnContent=function(e){var t=this.getAggregation("_"+e+"ColumnNav"),n=sap.ui.getCore().createRenderManager();n.renderControl(t);n.flush(this._$columns[e].find(".sapFFCLColumnContent")[0],undefined,true);n.destroy()};_.prototype.setLayout=function(e){e=this.validateProperty("layout",e);var t=this.getLayout();if(t===e){return this}var n=this.setProperty("layout",e,true);this._oLayoutHistory.addEntry(e);this._hideShowArrows();this._resizeColumns();return n};_.prototype.setAutoFocus=function(e){e=this.validateProperty("autoFocus",e);var t=this.getAutoFocus();if(t===e){return this}this._getNavContainers().forEach(function(t){t.setAutoFocus(e)});return this.setProperty("autoFocus",e,true)};_.prototype.onBeforeRendering=function(){this._deregisterResizeHandler();this._oAnimationEndListener.cancelAll()};_.prototype.onAfterRendering=function(){this._measureControlWidth();this._registerResizeHandler();this._cacheDOMElements();this._hideShowArrows();this._resizeColumns();this._flushColumnContent("begin");this._flushColumnContent("mid");this._flushColumnContent("end");this._fireStateChange(false,false)};_.prototype._restoreFocusToColumn=function(t){var n=this._oColumnFocusInfo[t];if(!n||p(n)){n=this._getFirstFocusableElement(t)}e(n).trigger("focus")};_.prototype._getFirstFocusableElement=function(e){var t=this._getColumnByStringName(e),n=t.getCurrentPage();if(n){return n.$().firstFocusableDomRef()}return null};_.prototype._isFocusInSomeOfThePreviousColumns=function(){var e=_.COLUMN_ORDER.indexOf(this._sPreviuosLastVisibleColumn)-1,t;for(;e>=0;e--){t=this._getColumnByStringName(_.COLUMN_ORDER[e]);if(t&&t._isFocusInControl(t)){return true}}return false};_.prototype._getControlWidth=function(){if(this._iWidth===0){this._measureControlWidth()}return this._iWidth};_.prototype._measureControlWidth=function(){if(this.$().is(":visible")){this._iWidth=this.$().width()}else{this._iWidth=0}};_.prototype.exit=function(){this._removeNavContainersFocusOutDelegate();this._oRenderedColumnPagesBoolMap=null;this._oColumnFocusInfo=null;this._deregisterResizeHandler();this._handleEvent(e.Event("Destroy"))};_.prototype._removeNavContainersFocusOutDelegate=function(){_.COLUMN_ORDER.forEach(function(e){this._getColumnByStringName(e).removeEventDelegate(this["_"+e+"ColumnFocusOutDelegate"])},this)};_.prototype._registerResizeHandler=function(){m(!this._iResizeHandlerId,"Resize handler already registered");this._iResizeHandlerId=i.register(this,this._onResize.bind(this))};_.prototype._deregisterResizeHandler=function(){if(this._iResizeHandlerId){i.deregister(this._iResizeHandlerId);this._iResizeHandlerId=null}};_.prototype._initNavContainers=function(){this.setAggregation("_beginColumnNav",this._createNavContainer("begin"),true);this.setAggregation("_midColumnNav",this._createNavContainer("mid"),true);this.setAggregation("_endColumnNav",this._createNavContainer("end"),true)};_.prototype._getNavContainers=function(){return[this._getBeginColumn(),this._getMidColumn(),this._getEndColumn()]};_.prototype._initButtons=function(){var e=new r(this.getId()+"-beginBack",{icon:"sap-icon://slim-arrow-left",tooltip:_._getResourceBundle().getText("FCL_BEGIN_COLUMN_BACK_ARROW"),type:"Transparent",press:this._onArrowClick.bind(this,"left")}).addStyleClass("sapFFCLNavigationButton").addStyleClass("sapFFCLNavigationButtonRight");this.setAggregation("_beginColumnBackArrow",e,true);var t=new r(this.getId()+"-midForward",{icon:"sap-icon://slim-arrow-right",tooltip:_._getResourceBundle().getText("FCL_MID_COLUMN_FORWARD_ARROW"),type:"Transparent",press:this._onArrowClick.bind(this,"right")}).addStyleClass("sapFFCLNavigationButton").addStyleClass("sapFFCLNavigationButtonLeft");this.setAggregation("_midColumnForwardArrow",t,true);var n=new r(this.getId()+"-midBack",{icon:"sap-icon://slim-arrow-left",tooltip:_._getResourceBundle().getText("FCL_MID_COLUMN_BACK_ARROW"),type:"Transparent",press:this._onArrowClick.bind(this,"left")}).addStyleClass("sapFFCLNavigationButton").addStyleClass("sapFFCLNavigationButtonRight");this.setAggregation("_midColumnBackArrow",n,true);var i=new r(this.getId()+"-endForward",{icon:"sap-icon://slim-arrow-right",tooltip:_._getResourceBundle().getText("FCL_END_COLUMN_FORWARD_ARROW"),type:"Transparent",press:this._onArrowClick.bind(this,"right")}).addStyleClass("sapFFCLNavigationButton").addStyleClass("sapFFCLNavigationButtonLeft");this.setAggregation("_endColumnForwardArrow",i,true)};_.prototype._cacheDOMElements=function(){this._cacheColumns();if(!n.system.phone){this._cacheArrows()}};_.prototype._cacheColumns=function(){this._$columns={begin:this.$("beginColumn"),mid:this.$("midColumn"),end:this.$("endColumn")}};_.prototype._cacheArrows=function(){this._oColumnSeparatorArrows={beginBack:this.$("beginBack"),midForward:this.$("midForward"),midBack:this.$("midBack"),endForward:this.$("endForward")}};_.prototype._getVisibleColumnsCount=function(){return _.COLUMN_ORDER.filter(function(e){return this._getColumnSize(e)>0},this).length};_.prototype._getVisibleArrowsCount=function(){if(!this._oColumnSeparatorArrows){return 0}return Object.keys(this._oColumnSeparatorArrows).filter(function(e){return this._oColumnSeparatorArrows[e].data("visible")},this).length};_.prototype._getTotalColumnsWidth=function(e){var t=this._getVisibleArrowsCount();if(e){t++}return this._getControlWidth()-t*_.NAVIGATION_ARROW_WIDTH};_.prototype._resizeColumns=function(){var e,t,o=_.COLUMN_ORDER.slice(),s=sap.ui.getCore().getConfiguration().getRTL(),r=sap.ui.getCore().getConfiguration().getAnimationMode(),a=r!==u.AnimationMode.none&&r!==u.AnimationMode.minimal,l,d,g,h,m,p,f,y={};if(!this.isActive()){return}d=this._getVisibleColumnsCount();if(d===0){return}h=this.getLayout();g=this._getMaxColumnsCountForLayout(h,_.DESKTOP_BREAKPOINT);m=o[g-1];f=this.getRestoreFocusOnBackNavigation()&&this._isNavigatingBackward(m)&&!this._isFocusInSomeOfThePreviousColumns();p=d===3&&h===c.ThreeColumnsEndExpanded;t=this._getTotalColumnsWidth(p);if(a){o.forEach(function(e){var t=this._shouldConcealColumn(g,e),n=this._shouldRevealColumn(g,e===m),i=this._$columns[e];i.toggleClass(_.PINNED_COLUMN_CLASS_NAME,t||n)},this);o.forEach(function(e){y[e]=this._oAnimationEndListener.isWaitingForColumnResizeEnd(this._$columns[e])},this);this._oAnimationEndListener.cancelAll()}o.forEach(function(o){var s=this._$columns[o],r=s.get(0),u,l,d,h,c,_,E;e=this._getColumnSize(o);u=Math.round(t*(e/100));if([100,0].indexOf(e)!==-1){l=e+"%"}else{l=u+"px"}E={previousAnimationCompleted:!y[s],iNewWidth:u,shouldRestoreFocus:f&&o===m,hidden:e===0&&this._oColumnWidthInfo[o]===0};if(a){d=this._shouldRevealColumn(g,o===m);h=this._shouldConcealColumn(g,o);c=d||h;E=C(E,{hasAnimations:true,shouldConcealColumn:h,pinned:c});_=this._canResizeColumnWithAnimation(o,E)}if(!h){s.toggleClass("sapFFCLColumnActive",e>0)}s.toggleClass("sapFFCLColumnInset",p&&o==="mid");s.removeClass("sapFFCLColumnHidden");s.removeClass("sapFFCLColumnOnlyActive");s.removeClass("sapFFCLColumnLastActive");s.removeClass("sapFFCLColumnFirstActive");if(_){i.suspend(r);this._oAnimationEndListener.waitForColumnResizeEnd(s).then(function(){i.resume(r)}).catch(function(){i.resume(r)})}if(!h){s.width(l)}else{this._oAnimationEndListener.waitForAllColumnsResizeEnd().then(function(){s.width(l)}).catch(function(){})}if(_||c){this._oAnimationEndListener.waitForAllColumnsResizeEnd().then(this._afterColumnResize.bind(this,o,E)).catch(function(){})}else{this._afterColumnResize(o,E)}if(!n.system.phone){this._updateColumnContextualSettings(o,u);this._updateColumnCSSClasses(o,u)}},this);l=o.filter(function(e){return this._getColumnSize(e)>0},this);if(s){o.reverse()}if(l.length===1){this._$columns[l[0]].addClass("sapFFCLColumnOnlyActive")}if(l.length>1){this._$columns[l[0]].addClass("sapFFCLColumnFirstActive");this._$columns[l[l.length-1]].addClass("sapFFCLColumnLastActive")}this._storePreviousResizingInfo(g,m)};_.prototype._afterColumnResize=function(e,t){var n=this._$columns[e],i=t.shouldConcealColumn,o=t.iNewWidth,s=t.shouldRestoreFocus;n.toggleClass(_.PINNED_COLUMN_CLASS_NAME,false);if(i){n.removeClass("sapFFCLColumnActive")}n.toggleClass("sapFFCLColumnHidden",o===0);this._cacheColumnWidth(e,o);if(s){this._restoreFocusToColumn(e)}};_.prototype._getColumnWidth=function(e){var t=this._$columns[e].get(0),n=t.style.width,i=parseInt(n),o;if(/px$/.test(n)){return i}o=/%$/.test(n);if(o&&i===100){return this._getControlWidth()}if(o&&i===0){return 0}return t.offsetWidth};_.prototype._cacheColumnWidth=function(e,t){var n;if(this._oColumnWidthInfo[e]!==t){n={};_.COLUMN_ORDER.forEach(function(t){n[t+"Column"]=t===e});this.fireColumnResize(n)}this._oColumnWidthInfo[e]=t};_.prototype._storePreviousResizingInfo=function(e,t){var n=this.getLayout();this._iPreviousVisibleColumnsCount=e;this._bWasFullScreen=n===c.MidColumnFullScreen||n===c.EndColumnFullScreen;this._sPreviuosLastVisibleColumn=t};_.prototype._isNavigatingBackward=function(e){return this._bWasFullScreen||_.COLUMN_ORDER.indexOf(this._sPreviuosLastVisibleColumn)>_.COLUMN_ORDER.indexOf(e)};_.prototype._shouldRevealColumn=function(e,t){return e>this._iPreviousVisibleColumnsCount&&!this._bWasFullScreen&&t};_.prototype._shouldConcealColumn=function(e,t){return e<this._iPreviousVisibleColumnsCount&&t===this._sPreviuosLastVisibleColumn&&!this._bWasFullScreen&&this._getColumnSize(t)===0};_.prototype._canResizeColumnWithAnimation=function(e,t){var n,i,o=t.iNewWidth,s=t.hasAnimations,r=t.pinned,a=t.hidden,u=!t.previousAnimationCompleted;if(!s||r||a){return false}n=this._$columns[e];if(u){return n.width()!==o}i=!n.get(0).style.width;if(i){return false}return this._getColumnWidth(e)!==o};_.prototype._propagateContextualSettings=function(){};_.prototype._updateColumnContextualSettings=function(e,t){var n,i;n=this.getAggregation("_"+e+"ColumnNav");if(!n){return}i=n._getContextualSettings();if(!i||i.contextualWidth!==t){n._applyContextualSettings({contextualWidth:t})}};_.prototype._updateColumnCSSClasses=function(e,t){var i="";this._$columns[e].removeClass("sapUiContainer-Narrow sapUiContainer-Medium sapUiContainer-Wide sapUiContainer-ExtraWide");if(t<n.media._predefinedRangeSets[n.media.RANGESETS.SAP_STANDARD_EXTENDED].points[0]){i="Narrow"}else if(t<n.media._predefinedRangeSets[n.media.RANGESETS.SAP_STANDARD_EXTENDED].points[1]){i="Medium"}else if(t<n.media._predefinedRangeSets[n.media.RANGESETS.SAP_STANDARD_EXTENDED].points[2]){i="Wide"}else{i="ExtraWide"}this._$columns[e].addClass("sapUiContainer-"+i)};_.prototype._getColumnSize=function(e){var t=this.getLayout(),n=this._getColumnWidthDistributionForLayout(t),i=n.split("/"),o={begin:0,mid:1,end:2},s=i[o[e]];return parseInt(s)};_.prototype.getMaxColumnsCount=function(){return this._getMaxColumnsCountForWidth(this._getControlWidth())};_.prototype._getMaxColumnsCountForWidth=function(e){if(e>=_.DESKTOP_BREAKPOINT){return 3}if(e>=_.TABLET_BREAKPOINT&&e<_.DESKTOP_BREAKPOINT){return 2}if(e>0){return 1}return 0};_.prototype._getMaxColumnsCountForLayout=function(e,t){var n=this._getMaxColumnsCountForWidth(t),i=this._getColumnWidthDistributionForLayout(e,false,n),o=i.split("/"),s={begin:0,mid:1,end:2},r,a,u=0;Object.keys(s).forEach(function(e){r=o[s[e]];a=parseInt(r);if(a){u++}});return u};_.prototype._onResize=function(e){var t=e.oldSize.width,n=e.size.width,i,o;this._iWidth=n;if(n===0){return}i=this._getMaxColumnsCountForWidth(t);o=this._getMaxColumnsCountForWidth(n);this._resizeColumns();if(o!==i){this._hideShowArrows();this._fireStateChange(false,true)}};_.prototype._setColumnPagesRendered=function(e,t){this._oRenderedColumnPagesBoolMap[e]=t};_.prototype._hasAnyColumnPagesRendered=function(){return Object.keys(this._oRenderedColumnPagesBoolMap).some(function(e){return this._oRenderedColumnPagesBoolMap[e]},this)};_.prototype._onArrowClick=function(e){var t=this.getLayout(),n=typeof _.SHIFT_TARGETS[t]!=="undefined"&&typeof _.SHIFT_TARGETS[t][e]!=="undefined",i;m(n,"An invalid layout was used for determining arrow behavior");i=n?_.SHIFT_TARGETS[t][e]:c.OneColumn;this.setLayout(i);if(_.ARROWS_NAMES[i][e]!==_.ARROWS_NAMES[t][e]&&n){var o=e==="right"?"left":"right";this._oColumnSeparatorArrows[_.ARROWS_NAMES[i][o]].focus()}this._fireStateChange(true,false)};_.prototype._hideShowArrows=function(){var e=this.getLayout(),t={},i=[],o,s;if(!this.isActive()||n.system.phone){return}o=this.getMaxColumnsCount();if(o>1){t[c.TwoColumnsBeginExpanded]=["beginBack"];t[c.TwoColumnsMidExpanded]=["midForward"];t[c.ThreeColumnsMidExpanded]=["midForward","midBack"];t[c.ThreeColumnsEndExpanded]=["endForward"];t[c.ThreeColumnsMidExpandedEndHidden]=["midForward","midBack"];t[c.ThreeColumnsBeginExpandedEndHidden]=["beginBack"];if(typeof t[e]==="object"){i=t[e]}}s=this._hasAnyColumnPagesRendered();Object.keys(this._oColumnSeparatorArrows).forEach(function(e){this._toggleButton(e,i.indexOf(e)!==-1,s)},this)};_.prototype._toggleButton=function(e,t,n){this._oColumnSeparatorArrows[e].toggle(t&&n);this._oColumnSeparatorArrows[e].data("visible",t)};_.prototype._fireStateChange=function(e,t){if(this._getControlWidth()===0){return}this.fireStateChange({isNavigationArrow:e,isResize:t,layout:this.getLayout(),maxColumnsCount:this.getMaxColumnsCount()})};_.prototype.setInitialBeginColumnPage=function(e){this._getBeginColumn().setInitialPage(e);this.setAssociation("initialBeginColumnPage",e,true);return this};_.prototype.setInitialMidColumnPage=function(e){this._getMidColumn().setInitialPage(e);this.setAssociation("initialMidColumnPage",e,true);return this};_.prototype.setInitialEndColumnPage=function(e){this._getEndColumn().setInitialPage(e);this.setAssociation("initialEndColumnPage",e,true);return this};_.prototype.to=function(e,t,n,i){if(this._getBeginColumn().getPage(e)){this._getBeginColumn().to(e,t,n,i)}else if(this._getMidColumn().getPage(e)){this._getMidColumn().to(e,t,n,i)}else{this._getEndColumn().to(e,t,n,i)}return this};_.prototype.backToPage=function(e,t,n){if(this._getBeginColumn().getPage(e)){this._getBeginColumn().backToPage(e,t,n)}else if(this._getMidColumn().getPage(e)){this._getMidColumn().backToPage(e,t,n)}else{this._getEndColumn().backToPage(e,t,n)}return this};_.prototype._safeBackToPage=function(e,t,n,i){if(this._getBeginColumn().getPage(e)){this._getBeginColumn()._safeBackToPage(e,t,n,i)}else if(this._getMidColumn().getPage(e)){this._getMidColumn()._safeBackToPage(e,t,n,i)}else{this._getEndColumn()._safeBackToPage(e,t,n,i)}};_.prototype.toBeginColumnPage=function(e,t,n,i){this._getBeginColumn().to(e,t,n,i);return this};_.prototype.toMidColumnPage=function(e,t,n,i){this._getMidColumn().to(e,t,n,i);return this};_.prototype.toEndColumnPage=function(e,t,n,i){this._getEndColumn().to(e,t,n,i);return this};_.prototype.backBeginColumn=function(e,t){return this._getBeginColumn().back(e,t)};_.prototype.backMidColumn=function(e,t){return this._getMidColumn().back(e,t)};_.prototype.backEndColumn=function(e,t){return this._getEndColumn().back(e,t)};_.prototype.backBeginColumnToPage=function(e,t,n){return this._getBeginColumn().backToPage(e,t,n)};_.prototype.backMidColumnToPage=function(e,t,n){return this._getMidColumn().backToPage(e,t,n)};_.prototype.backEndColumnToPage=function(e,t,n){return this._getEndColumn().backToPage(e,t,n)};_.prototype.backToTopBeginColumn=function(e,t){this._getBeginColumn().backToTop(e,t);return this};_.prototype.backToTopMidColumn=function(e,t){this._getMidColumn().backToTop(e,t);return this};_.prototype.backToTopEndColumn=function(e,t){this._getEndColumn().backToTop(e,t);return this};_.prototype.getCurrentBeginColumnPage=function(){return this._getBeginColumn().getCurrentPage()};_.prototype.getCurrentMidColumnPage=function(){return this._getMidColumn().getCurrentPage()};_.prototype.getCurrentEndColumnPage=function(){return this._getEndColumn().getCurrentPage()};_.prototype.setDefaultTransitionNameBeginColumn=function(e){this.setProperty("defaultTransitionNameBeginColumn",e,true);this._getBeginColumn().setDefaultTransitionName(e);return this};_.prototype.setDefaultTransitionNameMidColumn=function(e){this.setProperty("defaultTransitionNameMidColumn",e,true);this._getMidColumn().setDefaultTransitionName(e);return this};_.prototype.setDefaultTransitionNameEndColumn=function(e){this.setProperty("defaultTransitionNameEndColumn",e,true);this._getEndColumn().setDefaultTransitionName(e);return this};_.prototype._getLayoutHistory=function(){return this._oLayoutHistory};_.prototype._getColumnWidthDistributionForLayout=function(e,t,n){var i={},o;n||(n=this.getMaxColumnsCount());if(n===0){o="0/0/0"}else{i[c.OneColumn]="100/0/0";i[c.MidColumnFullScreen]="0/100/0";i[c.EndColumnFullScreen]="0/0/100";if(n===1){i[c.TwoColumnsBeginExpanded]="0/100/0";i[c.TwoColumnsMidExpanded]="0/100/0";i[c.ThreeColumnsMidExpanded]="0/0/100";i[c.ThreeColumnsEndExpanded]="0/0/100";i[c.ThreeColumnsMidExpandedEndHidden]="0/0/100";i[c.ThreeColumnsBeginExpandedEndHidden]="0/0/100"}else{i[c.TwoColumnsBeginExpanded]="67/33/0";i[c.TwoColumnsMidExpanded]="33/67/0";i[c.ThreeColumnsMidExpanded]=n===2?"0/67/33":"25/50/25";i[c.ThreeColumnsEndExpanded]=n===2?"0/33/67":"25/25/50";i[c.ThreeColumnsMidExpandedEndHidden]="33/67/0";i[c.ThreeColumnsBeginExpandedEndHidden]="67/33/0"}o=i[e]}if(t){o=o.split("/").map(function(e){return parseInt(e)})}return o};_.DESKTOP_BREAKPOINT=1280;_.TABLET_BREAKPOINT=960;_.ARROWS_NAMES={TwoColumnsBeginExpanded:{left:"beginBack"},TwoColumnsMidExpanded:{right:"midForward"},ThreeColumnsMidExpanded:{left:"midBack",right:"midForward"},ThreeColumnsEndExpanded:{right:"endForward"},ThreeColumnsMidExpandedEndHidden:{left:"midBack",right:"midForward"},ThreeColumnsBeginExpandedEndHidden:{left:"beginBack"}};_._getResourceBundle=function(){return sap.ui.getCore().getLibraryResourceBundle("sap.f")};_.SHIFT_TARGETS={TwoColumnsBeginExpanded:{left:c.TwoColumnsMidExpanded},TwoColumnsMidExpanded:{right:c.TwoColumnsBeginExpanded},ThreeColumnsMidExpanded:{left:c.ThreeColumnsEndExpanded,right:c.ThreeColumnsMidExpandedEndHidden},ThreeColumnsEndExpanded:{right:c.ThreeColumnsMidExpanded},ThreeColumnsMidExpandedEndHidden:{left:c.ThreeColumnsMidExpanded,right:c.ThreeColumnsBeginExpandedEndHidden},ThreeColumnsBeginExpandedEndHidden:{left:c.ThreeColumnsMidExpandedEndHidden}};_.prototype.showPlaceholder=function(e){switch(e.aggregation){case"beginColumnPages":return this.getAggregation("_beginColumnNav").showPlaceholder(e);case"midColumnPages":return this.getAggregation("_midColumnNav").showPlaceholder(e);default:return this.getAggregation("_endColumnNav").showPlaceholder(e)}};_.prototype.hidePlaceholder=function(e){switch(e.aggregation){case"beginColumnPages":this.getAggregation("_beginColumnNav").hidePlaceholder(e);break;case"midColumnPages":this.getAggregation("_midColumnNav").hidePlaceholder(e);break;default:this.getAggregation("_endColumnNav").hidePlaceholder(e)}};_.prototype.needPlaceholder=function(e,t){var n;switch(e){case"beginColumnPages":n=this.getAggregation("_beginColumnNav");break;case"midColumnPages":n=this.getAggregation("_midColumnNav");break;default:n=this.getAggregation("_endColumnNav")}return!t||n.getCurrentPage()!==t};function f(){this._aLayoutHistory=[]}f.prototype.addEntry=function(e){if(typeof e!=="undefined"){this._aLayoutHistory.push(e)}};f.prototype.getClosestEntryThatMatches=function(e){var t;for(t=this._aLayoutHistory.length-1;t>=0;t--){if(e.indexOf(this._aLayoutHistory[t])!==-1){return this._aLayoutHistory[t]}}};function y(){this._oListeners={};this._aPendingPromises=[];this._oPendingPromises={};this._oCancelPromises={};this._oPendingPromiseAll=null}y.prototype.waitForColumnResizeEnd=function(e){var t=e.get(0).id,n;if(!this._oPendingPromises[t]){n=new Promise(function(n,i){h.debug("FlexibleColumnLayout","wait for column "+t+" to resize");this._attachTransitionEnd(e,function(){h.debug("FlexibleColumnLayout","completed column "+t+" resize");this._cleanUp(e);n()}.bind(this));this._oCancelPromises[t]={cancel:function(){h.debug("FlexibleColumnLayout","cancel column "+t+" resize");this._cleanUp(e);i()}.bind(this)}}.bind(this));this._aPendingPromises.push(n);this._oPendingPromises[t]=n}return this._oPendingPromises[t]};y.prototype.waitForAllColumnsResizeEnd=function(){if(!this._oPendingPromiseAll){this._oPendingPromiseAll=new Promise(function(e,t){this.iTimer=setTimeout(function(){Promise.all(this._aPendingPromises).then(function(){h.debug("FlexibleColumnLayout","completed all columns resize");e()},0).catch(function(){t()});this.iTimer=null}.bind(this))}.bind(this))}return this._oPendingPromiseAll};y.prototype.isWaitingForColumnResizeEnd=function(e){var t=e.get(0).id;return!!this._oListeners[t]};y.prototype.cancelAll=function(){Object.keys(this._oCancelPromises).forEach(function(e){this._oCancelPromises[e].cancel()},this);this._oPendingPromises={};this._aPendingPromises=[];this._oCancelPromises={};this._oPendingPromiseAll=null;if(this.iTimer){clearTimeout(this.iTimer);this.iTimer=null}h.debug("FlexibleColumnLayout","detached all listeners for columns resize")};y.prototype._attachTransitionEnd=function(e,t){var n=e.get(0).id;if(!this._oListeners[n]){e.on("webkitTransitionEnd transitionend",t);this._oListeners[n]=t}};y.prototype._detachTransitionEnd=function(e){var t=e.get(0).id;if(this._oListeners[t]){e.off("webkitTransitionEnd transitionend",this._oListeners[t]);this._oListeners[t]=null}};y.prototype._cleanUp=function(e){if(e.length){var t=e.get(0).id;this._detachTransitionEnd(e);delete this._oPendingPromises[t];delete this._oCancelPromises[t]}};return _});