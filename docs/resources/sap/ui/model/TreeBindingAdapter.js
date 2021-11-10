/*!
 * OpenUI5
 * (c) Copyright 2009-2021 SAP SE or an SAP affiliate company.
 * Licensed under the Apache License, Version 2.0 - see LICENSE.txt.
 */
sap.ui.define(["sap/ui/model/TreeBinding","sap/ui/model/TreeAutoExpandMode","sap/ui/model/ChangeReason","sap/ui/model/TreeBindingUtils","sap/base/assert","sap/base/Log","sap/base/util/each","sap/base/util/isEmptyObject"],function(e,t,i,o,n,r,a,s){"use strict";var d=function(){if(!(this instanceof e)||this._bIsAdapted){return}for(var i in d.prototype){if(d.prototype.hasOwnProperty(i)){this[i]=d.prototype[i]}}this.mParameters=this.mParameters||{};this._aRowIndexMap=[];this._iThreshold=0;this._iPageSize=0;this.setAutoExpandMode(this.mParameters.autoExpandMode||t.Sequential);if(this.mParameters.collapseRecursive===undefined){this.bCollapseRecursive=true}else{this.bCollapseRecursive=!!this.mParameters.collapseRecursive}this._createTreeState();this._bIsAdapted=true};d.prototype.getCurrentTreeState=function(){var e=";";var t={};for(var i in this._mTreeState.expanded){t[i]=true}var o={};for(var i in this._mTreeState.collapsed){o[i]=true}var n={};for(var i in this._mTreeState.selected){n[i]=true}return{_getExpandedList:function(){return Object.keys(t).join(e)},_getCollapsedList:function(){return Object.keys(o).join(e)},_getSelectedList:function(){return Object.keys(n).join(e)},_isExpanded:function(e){return!!t[e]},_isCollapsed:function(e){return!!o[e]},_remove:function(e){delete t[e];delete o[e];delete n[e]}}};d.prototype.setTreeState=function(e){this._oInitialTreeState=e};d.prototype.setAutoExpandMode=function(e){this._autoExpandMode=e};d.prototype.getLength=function(){if(!this._oRootNode){return 0}return this._oRootNode.magnitude};d.prototype.getContextByIndex=function(e){if(this.isInitial()){return}var t=this.findNode(e);return t?t.context:undefined};d.prototype.getNodeByIndex=function(e){if(this.isInitial()){return}if(e>=this.getLength()){return undefined}return this.findNode(e)};d.prototype.findNode=function(e){if(this.isInitial()){return}var t=typeof e;var i;var o=[];if(t==="number"){i=this._aRowIndexMap[e];if(!i){var n=-1;this._match(this._oRootNode,o,1,function(t){if(n===e){return true}n+=1});i=o[0]}}return i};d.prototype._createTreeState=function(e){if(!this._mTreeState||e){this._mTreeState={expanded:{},collapsed:{},selected:{},deselected:{}}}};d.prototype._updateTreeState=function(e){e=e||{};var t=e.expanded?this._mTreeState.expanded:this._mTreeState.collapsed;var i=e.expanded?this._mTreeState.collapsed:this._mTreeState.expanded;var o=this._getNodeState(e.groupID);if(!o){o=e.fallbackNodeState||this._createNodeState({groupID:e.groupID,expanded:e.expanded,sum:e.sum})}delete i[e.groupID];t[e.groupID]=o;o.expanded=e.expanded;return o};d.prototype._createNodeState=function(e){if(!e.groupID){n(false,"To create a node state a group ID is mandatory!");return}var t;var i;if(this._oInitialTreeState){t=this._oInitialTreeState._isExpanded(e.groupID);i=this._oInitialTreeState._isCollapsed(e.groupID);this._oInitialTreeState._remove(e.groupID)}var o=e.expanded||t||false;var r=e.selected||false;var a={groupID:e.groupID,expanded:o,sections:e.sections||[{startIndex:0,length:this._iPageSize}],sum:e.sum||false,selected:r};if(t||i){this._updateTreeState({groupID:e.groupID,fallbackNodeState:a,expanded:t,collapsed:i})}return a};d.prototype._getNodeState=function(e){var t=this._mTreeState.expanded[e];var i=this._mTreeState.collapsed[e];var o=this._mTreeState.selected[e];var n=this._mTreeState.deselected[e];return t||i||o||n};d.prototype._updateNodeSections=function(e,t){var i=this._getNodeState(e);if(!i){n(false,"No Node State for Group ID '"+e+"' found!");return}else if(!t){n(false,"No Section given!");return}else if(t.length<=0){n(false,"The length of the given section must be positive greater than 0.");return}else if(t.startIndex<0){n(false,"The sections start index must be greater/equal to 0.");return}i.sections=o.mergeSections(i.sections,t);return i.sections};d.prototype._increaseSections=function(){var e=function(e){if(!e){return}var t=this._getMaxGroupSize(e);var i=e.nodeState;if(t===undefined){var n=[];for(var r=0;r<i.sections.length;r++){var a=i.sections[r];a.length=Math.max(a.length,this._iPageSize);n=o.mergeSections(n,a)}i.sections=n}};this._map(this._oRootNode,e)};d.prototype._getMaxGroupSize=function(e){var t=0;if(e.isArtificial){var i=this.oModel.isList(this.sPath,this.getContext());if(this.bDisplayRootNode&&!i&&!this._bRootMissing){t=1}else{t=this._getGroupSize(e)||0}}else{t=this.nodeHasChildren(e)?this._getGroupSize(e):0}return t};d.prototype.getContexts=function(e,t,i){return this._getContextsOrNodes(false,e,t,i)};d.prototype._getContextsOrNodes=function(e,t,i,o){if(!this.isResolved()||this.isInitial()){return[]}if(!i){i=this.oModel.iSizeLimit}if(!o){o=0}if(i>this._iPageSize){this._iPageSize=i;this._increaseSections()}this._iThreshold=Math.max(this._iThreshold,o);this._aRowIndexMap=[];this._buildTree(t,i);var n=[];if(this._oRootNode){n=this._retrieveNodeSection(this._oRootNode,t,i)}this._updateRowIndexMap(n,t);var r=[];var s;for(var d=0;d<n.length;d++){var l=n[d];if(!l.context){s=s||{};var u=l.parent;s[u.groupID]=u;this._updateNodeSections(u.groupID,{startIndex:l.positionInParent,length:1})}r.push(l.context)}if(s){var h=this;a(s,function(e,t){t.magnitude=0;t.numberOfTotals=0;h._loadChildContexts(t)});r=[];for(var p=0;p<n.length;p++){var l=n[p];r.push(l.context)}}if(e){return n}else{return r}};d.prototype.getNodes=function(e,t,i){return this._getContextsOrNodes(true,e,t,i)};d.prototype._updateRowIndexMap=function(e,t){this._aRowIndexMap=[];for(var i=0;i<e.length;i++){this._aRowIndexMap[t+i]=e[i]}};d.prototype._retrieveNodeSection=function(e,t,i){var o=-1;var n=[];this._match(this._oRootNode,[],i,function(e,r,a){if(!e||!e.isArtificial){o++}if(o>=t&&o<t+i){if(!e){e=this._createNode({parent:a,positionInParent:r});a.children[r]=e}n.push(e);return true}});return n};d.prototype._buildTree=function(e,t){this._oRootNode=undefined;var i=null;var o=this._calculateGroupID({context:i,parent:null});var n=this._getNodeState(o);if(!n){var n=this._createNodeState({groupID:o,sum:true,sections:[{startIndex:e,length:t}]});this._updateTreeState({groupID:n.groupID,fallbackNodeState:n,expanded:true})}this._oRootNode=this._createNode({context:i,parent:null,level:this.bDisplayRootNode&&!(i===null)?0:-1,nodeState:n,isLeaf:false,autoExpand:this.getNumberOfExpandedLevels()+1});this._oRootNode.isArtificial=true;if(this._mTreeState.expanded[this._oRootNode.groupID]){this._loadChildContexts(this._oRootNode)}};d.prototype._calculateRequestLength=function(e,t){var i;if(!e){i=t.length}else{i=Math.max(Math.min(t.length,e-t.startIndex),0)}return i};d.prototype._loadChildContexts=function(e){var i=e.nodeState;var o=this._getMaxGroupSize(e);if(o>0){if(!e.children[o-1]){e.children[o-1]=undefined}i.leafCount=o}if(this.bClientOperation){i.sections=[{startIndex:0,length:o}]}for(var n=0;n<i.sections.length;n++){var r=i.sections[n];var a=this._calculateRequestLength(o,r);if(e.autoExpand>=0&&this._autoExpandMode===t.Bundled){a=Math.max(0,o)}var s;if(e.isArtificial){s=this.getRootContexts(r.startIndex,a,this._iThreshold)}else{s=this.nodeHasChildren(e)?this.getNodeContexts(e.context,r.startIndex,a,this._iThreshold):[]}for(var d=0;d<s.length;d++){var l=s[d];if(!l){continue}var u=d+r.startIndex;var h=e.children[u];var p={context:s[d],parent:e,level:e.level+1,positionInParent:u,autoExpand:Math.max(e.autoExpand-1,-1)};if(h){h.context=p.context;h.parent=p.parent;h.level=p.level;h.positionInParent=p.positionInParent;h.magnitude=0;h.numberOfTotals=0;h.autoExpand=p.autoExpand;var f;if(l){f=this._calculateGroupID(h)}h.groupID=f}else{h=this._createNode(p)}h.nodeState=this._getNodeState(h.groupID);if(!h.nodeState){h.nodeState=this._createNodeState({groupID:h.groupID,expanded:false})}h.nodeState.parentGroupID=e.groupID;h.isLeaf=!this.nodeHasChildren(h);e.children[u]=h;if(h.isLeaf){e.numberOfLeafs+=1}if(h.parent.nodeState.selectAllMode&&!this._mTreeState.deselected[h.groupID]){this.setNodeSelection(h.nodeState,true)}if((h.autoExpand>0||h.nodeState.expanded)&&this.isGrouped()){if(!this._mTreeState.collapsed[h.groupID]&&!h.isLeaf){this._updateTreeState({groupID:h.nodeState.groupID,fallbackNodeState:h.nodeState,expanded:true});this._loadChildContexts(h)}e.magnitude+=Math.max(h.magnitude||0,0);e.numberOfLeafs+=h.numberOfLeafs}}}e.magnitude+=Math.max(o||0,0)};d.prototype.isGrouped=function(){return true};d.prototype._calculateGroupID=function(e){r.error("TreeBindingAdapter#_calculateGroupID: Not implemented. Needs to be implemented in respective sub-classes.")};d.prototype._createNode=function(e){e=e||{};var t=e.context;var i=e.level||0;var o={context:t,level:i,children:e.children||[],parent:e.parent,nodeState:e.nodeState,isLeaf:e.isLeaf||false,positionInParent:e.positionInParent,magnitude:e.magnitude||0,numberOfTotals:e.numberOfTotals||0,numberOfLeafs:e.numberOfLeafs||0,autoExpand:e.autoExpand||0,absoluteNodeIndex:e.absoluteNodeIndex||0,totalNumberOfLeafs:0};if(t!==undefined){o.groupID=this._calculateGroupID(o)}return o};d.prototype.expand=function(e,t){var o=this.findNode(e);if(!o){n(false,"No node found for index "+e);return}this._updateTreeState({groupID:o.nodeState.groupID,fallbackNodeState:o.nodeState,expanded:true});if(!t){this._fireChange({reason:i.Expand})}};d.prototype.expandToLevel=function(e){this._mTreeState.collapsed={};this.setNumberOfExpandedLevels(e);this._fireChange({reason:i.Expand})};d.prototype.isExpanded=function(e){var t=this.findNode(e);return t&&t.nodeState?t.nodeState.expanded:false};d.prototype.collapse=function(e,t){var o;var r=this;if(typeof e==="object"){o=e}else if(typeof e==="number"){var s=this.findNode(e);if(!s){n(false,"No node found for index "+e);return}o=s.nodeState}this._updateTreeState({groupID:o.groupID,fallbackNodeState:o,expanded:false});o.selectAllMode=false;if(this.bCollapseRecursive){var d=o.groupID;a(this._mTreeState.expanded,function(e,t){if(typeof d=="string"&&d.length>0&&e.startsWith(d)){r._updateTreeState({groupID:e,expanded:false})}});var l=[];a(this._mTreeState.selected,function(e,t){if(typeof d=="string"&&d.length>0&&e.startsWith(d)&&e!==d){t.selectAllMode=false;r.setNodeSelection(t,false);l.push(e)}});if(l.length){var u={rowIndices:[]};var h=-1;this._map(this._oRootNode,function(e){if(!e||!e.isArtificial){h++}if(e&&l.indexOf(e.groupID)!==-1){if(e.groupID===this._sLeadSelectionGroupID){u.oldIndex=h;u.leadIndex=-1}u.rowIndices.push(h)}});this._publishSelectionChanges(u)}}if(!t){this._fireChange({reason:i.Collapse})}};d.prototype.collapseToLevel=function(e){if(!e||e<0){e=0}var t=this;a(this._mTreeState.expanded,function(i,o){var n=t._getGroupIdLevel(i)-1;if(n===e){t.collapse(o,true)}});if(this.bCollapseRecursive){this.setNumberOfExpandedLevels(e)}this._fireChange({reason:i.Collapse})};d.prototype._map=function(e,t){t.call(this,e);if(!e){return}for(var i=0;i<e.children.length;i++){var o=e.children[i];this._map(o,t)}if(this._afterMapHook){this._afterMapHook(e,t)}};d.prototype._match=function(e,t,i,o,n,r){if(t.length===i){return true}var a=o.call(this,e,n,r);if(a){t.push(e)}if(!e){return false}for(var s=0;s<e.children.length;s++){var d=e.children[s];var l=this._match(d,t,i,o,s,e);if(l){return true}}return this._afterMatchHook?this._afterMatchHook(e,t,i,o,n,r):false};d.prototype.toggleIndex=function(e){var t=this.findNode(e);if(!t){n(false,"There is no node at index "+e+".");return}if(t.nodeState.expanded){this.collapse(e)}else{this.expand(e)}};d.prototype._getGroupIdLevel=function(e){if(e==null){r.warning("assertion failed: no need to determine level of group ID = null");return-1}return e.split("/").length-2};d.prototype._getGroupSize=function(e){return this.getChildCount(e.context)};d.prototype.setNodeSelection=function(e,t){if(!e.groupID){n(false,"NodeState must have a group ID!");return}e.selected=t;if(t){this._mTreeState.selected[e.groupID]=e;delete this._mTreeState.deselected[e.groupID]}else{delete this._mTreeState.selected[e.groupID];this._mTreeState.deselected[e.groupID]=e}};d.prototype.isIndexSelected=function(e){var t=this.getNodeByIndex(e);return t&&t.nodeState?t.nodeState.selected:false};d.prototype.isIndexSelectable=function(e){var t=this.getNodeByIndex(e);return this._isNodeSelectable(t)};d.prototype._isNodeSelectable=function(e){return!!e&&!e.isArtificial};d.prototype.setSelectedIndex=function(e){var t=this.findNode(e);if(t&&this._isNodeSelectable(t)){var i=this._clearSelection();var o=i.rowIndices.indexOf(e);if(o>=0){i.rowIndices.splice(o,1)}else{i.rowIndices.push(e)}i.leadGroupID=t.groupID;i.leadIndex=e;this.setNodeSelection(t.nodeState,true);this._publishSelectionChanges(i)}else{r.warning("TreeBindingAdapter: The selection was ignored. Please make sure to only select rows, for which data has been fetched to the client. For AnalyticalTables, some rows might not be selectable at all.")}};d.prototype.getSelectedIndex=function(){if(!this._sLeadSelectionGroupID||s(this._mTreeState.selected)){return-1}var e=-1;var t=false;var i=function(i){if(!i||!i.isArtificial){e++}if(i){if(i.groupID===this._sLeadSelectionGroupID){t=true;return true}}};this._match(this._oRootNode,[],1,i);if(t){return e}return-1};d.prototype.getSelectedIndices=function(){var e=[];var t=this;if(s(this._mTreeState.selected)){return e}var i=Object.keys(this._mTreeState.selected).length;var o=-1;var n=function(i){if(!i||!i.isArtificial){o++}if(i){if(i.nodeState&&i.nodeState.selected&&!i.isArtificial){e.push(o);t._aRowIndexMap[o]=i;return true}}};this._match(this._oRootNode,[],i,n);return e};d.prototype.getSelectedNodesCount=function(){var e;if(this._oRootNode&&this._oRootNode.nodeState.selectAllMode){var t,i,o,n;var r,a=[];if(this.filterInfo&&this.oCombinedFilter){for(var s=this.filterInfo.aFilteredContexts.length-1;s>=0;s--){r=this.filterInfo.aFilteredContexts[s];a.push(this._calculateGroupID({context:r}))}}i=0;for(t in this._mTreeState.expanded){if(!this.oCombinedFilter||a.indexOf(t)!==-1){n=this._mTreeState.expanded[t];if(!n.selectAllMode&&n.leafCount!==undefined){i+=n.leafCount}}}for(t in this._mTreeState.selected){if(!this.oCombinedFilter||a.indexOf(t)!==-1){n=this._mTreeState.selected[t];o=this._mTreeState.expanded[n.parentGroupID];if(o&&!o.selectAllMode){i--}}}for(t in this._mTreeState.deselected){if(!this.oCombinedFilter||a.indexOf(t)!==-1){n=this._mTreeState.deselected[t];o=this._mTreeState.expanded[n.parentGroupID];if(o&&o.selectAllMode){i++}}}e=this._getSelectableNodesCount(this._oRootNode)-i}else{e=Object.keys(this._mTreeState.selected).length}return e};d.prototype._getSelectableNodesCount=function(e){if(e){return e.magnitude}else{return 0}};d.prototype.getSelectedContexts=function(){var e=[];var t=this;if(s(this._mTreeState.selected)){return e}var i=Object.keys(this._mTreeState.selected).length;var o=-1;var n=function(i){if(!i||!i.isArtificial){o++}if(i){if(i.nodeState&&i.nodeState.selected&&!i.isArtificial){e.push(i.context);t._aRowIndexMap[o]=i;return true}}};this._match(this._oRootNode,[],i,n);return e};d.prototype.setSelectionInterval=function(e,t){var i=this._clearSelection();var o=this._setSelectionInterval(e,t,true);var n={};var r=[];for(var a=0;a<i.rowIndices.length;a++){var s=i.rowIndices[a];n[s]=true}for(a=0;a<o.rowIndices.length;a++){s=o.rowIndices[a];if(n[s]){delete n[s]}else{n[s]=true}}for(s in n){if(n[s]){r.push(parseInt(s))}}this._publishSelectionChanges({rowIndices:r,oldIndex:i.oldIndex,leadIndex:o.leadIndex,leadGroupID:o.leadGroupID})};d.prototype._setSelectionInterval=function(e,t,i){var o=Math.min(e,t);var n=Math.max(e,t);var r=[];var a=[];var s=Math.abs(n-o)+1;var d;var l=-1;var u=function(e){if(!e||!e.isArtificial){l++}if(e){if(l>=o&&l<=n){if(this._isNodeSelectable(e)){if(e.nodeState.selected!==!!i){a.push(l)}if(e.groupID===this._sLeadSelectionGroupID){d=l}this.setNodeSelection(e.nodeState,!!i)}return true}}};this._match(this._oRootNode,r,s,u);var h={rowIndices:a,oldIndex:d,leadIndex:d&&!i?-1:undefined};if(r.length>0&&i){var p=r[r.length-1];h.leadGroupID=p.groupID;h.leadIndex=n}return h};d.prototype.addSelectionInterval=function(e,t){var i=this._setSelectionInterval(e,t,true);this._publishSelectionChanges(i)};d.prototype.removeSelectionInterval=function(e,t){var i=this._setSelectionInterval(e,t,false);this._publishSelectionChanges(i)};d.prototype.selectAll=function(){this._mTreeState.deselected={};var e={rowIndices:[],oldIndex:-1,selectAll:true};var t=-1;this._map(this._oRootNode,function(i){if(!i||!i.isArtificial){t++}if(i){if(i.groupID===this._sLeadSelectionGroupID){e.oldIndex=t}if(this._isNodeSelectable(i)){if(i.nodeState.selected!==true){e.rowIndices.push(t)}this.setNodeSelection(i.nodeState,true);e.leadGroupID=i.groupID;e.leadIndex=t}if(i.nodeState.expanded){i.nodeState.selectAllMode=true}}});this._publishSelectionChanges(e)};d.prototype._clearSelection=function(){var e=-1;var t=-1;var i;var o=[];if(this._oRootNode&&!this._oRootNode.nodeState.selectAllMode){i=0;for(var n in this._mTreeState.selected){if(n){i++}}}var r=function(i){if(!i||!i.isArtificial){e++}if(i){i.nodeState.selectAllMode=false;if(this._mTreeState.selected[i.groupID]){if(!i.isArtificial){o.push(e)}this.setNodeSelection(i.nodeState,false);if(i.groupID===this._sLeadSelectionGroupID){t=e}return true}}};this._match(this._oRootNode,[],i,r);if(this._oRootNode&&this._oRootNode.nodeState&&this._oRootNode.isArtificial){this._oRootNode.nodeState.selectAllMode=false}return{rowIndices:o,oldIndex:t,leadIndex:-1}};d.prototype.clearSelection=function(e){var t=this._clearSelection();if(!e){this._publishSelectionChanges(t)}};d.prototype._publishSelectionChanges=function(e){e.oldIndex=e.oldIndex||this.getSelectedIndex();e.rowIndices.sort(function(e,t){return e-t});if(e.leadIndex>=0&&e.leadGroupID){this._sLeadSelectionGroupID=e.leadGroupID}else if(e.leadIndex===-1){this._sLeadSelectionGroupID=undefined}else{e.leadIndex=e.oldIndex}if(e.rowIndices.length>0||e.leadIndex!=undefined&&e.leadIndex!==-1){this.fireSelectionChanged(e)}};d.prototype.setCollapseRecursive=function(e){this.bCollapseRecursive=!!e};d.prototype.getCollapseRecursive=function(){return this.bCollapseRecursive};d.prototype.attachSelectionChanged=function(e,t,i){this.attachEvent("selectionChanged",e,t,i);return this};d.prototype.detachSelectionChanged=function(e,t){this.detachEvent("selectionChanged",e,t);return this};d.prototype.fireSelectionChanged=function(e){this.fireEvent("selectionChanged",e);return this};return d},true);