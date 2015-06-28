function log(value) {
    console.log(value);
}

function Gtd() {
    this.init();
}
Gtd.prototype = {
    init: function () {
        var _this = this;
        this.wrap = document.getElementById('wrap');

        // 左侧目录列表相关参数
        this.oTaskCategoryUl = this.wrap.getElementsByTagName('ul')[2]; // 左侧目录列表模块
        this.oContentMode = this.getByClass(this.wrap, 'task-cont')[0]; // 中间任务列表模块
        this.totalCount = this.getByClass(this.wrap, 'taskCount')[0]; // 全部任务总数
        this.sDefaultId = '/10000'; // 默认目录的id
        this.initLocalStorage(); // 初始化LocalStorage
        this.updateCategory(this.sDefaultId); // 初始化左侧目录
        this.aTaskCategory = this.oTaskCategoryUl.getElementsByTagName('li'); // 左侧目录列表li
        this.aListItem = this.oTaskCategoryUl.getElementsByTagName('a');
        this.oTargetAddOn = this.getByClass(this.oTaskCategoryUl, 'on')[0]; // 当前选中的分类
        this.aDeleteBtn = this.oTaskCategoryUl.getElementsByTagName('i');
        this.oAddCategoryBtn = document.getElementById('addCategory');
        this.oAddTaskBtn = document.getElementById('addTask');

        // 中间任务列表相关参数
        this.oProcess = document.getElementById('process');
        this.oProcessUl = this.oProcess.getElementsByTagName('ul')[0];
        this.aProcessFilterBtn = this.oProcessUl.getElementsByTagName('a');
        this.sProcessNow = 0; // 当前选中的任务状态 --- 所有
        this.oProcessContList = this.getByClass(this.oProcess, 'cont-list')[0];
        this.sTaskOnId = '/0'; // 当前选中的任务
        this.updateProcessList(this.sDefaultId); // 默认分类的id是 '/10000'

        // 任务详细内容输入，标题、时间、内容，全局使用
        this.oTitleInput = this.oContentMode.getElementsByTagName('input')[0];
        this.oDateInput = this.oContentMode.getElementsByTagName('input')[1];
        this.oContentTextarea = this.oContentMode.getElementsByTagName('textarea')[0];

         // 任务详细内容的按钮
        this.oTaskContentBtn = this.getByClass(this.oContentMode, 'btn-wrap')[0];
        this.oEditBtn = this.getByClass(this.oTaskContentBtn, 'edit-btn')[0];
        this.oFinishBtn = this.getByClass(this.oTaskContentBtn, 'finish-btn')[0];
        
        // 遮罩层
        this.oOverlayCode = document.getElementById('overlayCode');

        // 自定义prompt弹出框
        this.oPromptBoxWrap = document.getElementById('prompt-box-wrap');
        this.oPromptBoxInput = this.oPromptBoxWrap.getElementsByTagName('input')[0];
        this.oPromptBoxText = this.getByClass(this.oPromptBoxWrap, 'boxText')[0];
        this.oPromptSubmitBtn = this.getByClass(this.oPromptBoxWrap, 'boxSubmit')[0];

        // 自定义confirm弹出框
        this.oConfirmBoxWrap = document.getElementById('confirm-box-wrap');
        this.oConfirmBoxText = this.getByClass(this.oConfirmBoxWrap, 'boxText')[0];
        this.oConfirmBoxBtnSure = this.getByClass(this.oConfirmBoxWrap, 'boxBtnSure')[0];
        this.oConfirmBoxBtnCancel = this.getByClass(this.oConfirmBoxWrap, 'boxBtnCancel')[0];

        // 目录展开与收起
        this.taskTrigger();
        // 根据完成状态进行筛选
        this.filterTaskState();
        // 添加目录
        this.oAddCategoryBtn.onclick = function () { 
            _this.oPromptBoxText.innerHTML = '请输入目录名称:';
            _this.showBox(_this.oPromptBoxWrap);
            _this.oPromptSubmitBtn.onclick = function () {
                _this.addCategory.call(_this);
                _this.hideBox(_this.oPromptBoxWrap);
            }
        };
        this.oPromptBoxInput.onkeydown = function (ev) {
            var oEvent = ev || event;
            if (oEvent.keyCode === 13) {
                _this.oPromptSubmitBtn.onclick();
            }
        }
        // 添加任务
        this.oAddTaskBtn.onclick = function () {_this.addTask.call(_this)}; // 添加任务
        this.oEditBtn.onclick = function () {_this.editTask.call(_this)}; // 编辑任务
        this.oFinishBtn.onclick = function () {_this.finishTask.call(_this)}; // 完成任务
        // 隐藏弹出框
        this.oOverlayCode.onclick = function () { 
            _this.oPromptBoxInput.value = '';
            _this.hideBox(_this.oPromptBoxWrap);
            _this.hideBox(_this.oConfirmBoxWrap);
        }
    },
    // 初始化LocalStorag
    initLocalStorage: function () {  
        if (!(window.localStorage && window.localStorage.getItem)) {
            alert("该浏览器不支持localStorage本地存储");
        } else {
            this.ls = localStorage;
        }
    },
    // 更新左侧目录
    updateCategory: function (sCategoryId) {
        // this.ls.clear();
        if (!this.getItem(this.sDefaultId)) { // 用户第一次打开，初始化默认分类的id为10000，初始化目录结构数据
            this.setItem(this.sDefaultId, {total: 0, rows: []});
            this.setItem('categoryStructor', {"rows":[{"id":"/10000","title":"默认分类","subcategory":null}]});
        }
        // log(this.ls);
        var oData = this.getItem('categoryStructor');
        if (!oData) { return false; }
        var sHtmlContent = '';
        var aRows = oData.rows;
        var totalCount = 0;
        for (var i = 0; i < aRows.length; i++) {
            var oProcessData = this.getItem(aRows[i].id);
            var count = oProcessData ? oProcessData.total : 0;
            var sDefaultClass = (aRows[i].id === this.sDefaultId) ? 'task-dft' : '';
            var sOnClass = (aRows[i].id === sCategoryId) ? 'on' : '';
            totalCount += count;
            sHtmlContent += '<li class="TaskCategory group ' + sDefaultClass + ' TaskCategory-fold" data-id="' + aRows[i].id + '">' +
                                '<a href="#" class="list-item ' + sOnClass + ' ico-task"><span>' + aRows[i].title + '</span><span> (' + count + ') </span><i class="ico-delete"></i></a>';
            if (aRows[i].subcategory) {
                // log(aRows[i].subcategory);
                sHtmlContent += '<ul>';
                for (var j = 0; j < aRows[i].subcategory.length; j++) {
                    oProcessData = this.getItem(aRows[i].subcategory[j].id);
                    count = oProcessData ? oProcessData.total : 0;
                    sHtmlContent += '<li class="TaskCategory group" data-id="' + aRows[i].subcategory[j].id + '">' +
                                        '<a href="#" class="list-item ico-task-sec"><span>' + aRows[i].subcategory[j].title + '</span><span> (' + count + ') </span><i class="ico-delete"></i></a>' +
                                    '</li>';
                }
                sHtmlContent += '</ul></li>';
            } else {
                sHtmlContent +=  '<ul></ul></li>';
            } 
        }
        this.totalCount.innerHTML = totalCount;
        this.oTaskCategoryUl.innerHTML = sHtmlContent;
        this.oTargetAddOn = this.getByClass(this.oTaskCategoryUl, 'on')[0]; // 更新当前现在的分类
    },
    // 更新中间任务进度列表
    updateProcessList: function (sCategoryId) {
        var _this = this;
        var htmlContent = '';
        var oData = {rows:[]};
        var oTaskId = this.getItem(sCategoryId);
        var oTaskList = this.getItem('taskList');
        var oProcessData = {};
        var time = '';
        var aState = [
            'all',
            'unfinished',
            'finished'
        ];
        var sFilterState = aState[this.sProcessNow] || 'all';
        log('传入的sFilterState是：' + sFilterState); 

        if (oTaskId) {
            for (var i = 0; i < oTaskId.rows.length; i++) {
                for (var j = 0; j < oTaskList.rows.length; j++) {
                    if (oTaskList.rows[j].taskId === oTaskId.rows[i]) {
                        oData.rows.push(oTaskList.rows[j]);
                    }
                }
            }
        } else {
            this.addTask(); //如果没有任务，则准备添加
            this.oProcessContList.innerHTML = '';
            return false;
        } 

        if (oData) {
            for (var i = 0; i < oData.rows.length; i++) {
                var taskInfo = {};
                if (    sFilterState === 'all' 
                    ||  sFilterState === 'unfinished' && !oData.rows[i]['finished'] 
                    ||  sFilterState === 'finished' && oData.rows[i]['finished']) {
                    // log(oData.rows[i]['finished']);
                    time = oData.rows[i]['taskTime'];
                    taskInfo['taskTitle'] = oData.rows[i]['taskTitle'];
                    taskInfo['taskId'] = oData.rows[i]['taskId'];
                    taskInfo['finished'] = oData.rows[i]['finished'];
                    if (oProcessData[time]) {
                        oProcessData[time].push(taskInfo); 
                    } else {
                        var arr = [];
                        arr.push(taskInfo);
                        oProcessData[time] = arr;
                    }
                }
            }
        }
        var keyArr = Object.keys(oProcessData).sort();
        for (var t = 0; t < keyArr.length; t++) {
            var taskTimeHtml =  '<h3 class="taskTime">' + keyArr[t] + '</h3>';
            var taskTitleHtml = '';
            var finishedState = '';
            for (var i = 0; i < oProcessData[keyArr[t]].length; i++) {
                // 默认打开第一个任务的详细信息
                if (t === 0 && i === 0) {
                    this.sTaskOnId = oProcessData[keyArr[t]][0]['taskId'];
                    this.updateTaskInfo(this.sTaskOnId); 
                    log('this.sTaskOnId: ' + this.sTaskOnId);
                    var sSelectClass = ' on';
                }  else {
                    var sSelectClass = '';
                }
                finishedState = oProcessData[keyArr[t]][0]['finished'] ? 'finished' : '';
                taskTitleHtml += '<li class="noteTitle' + sSelectClass + ' ' + finishedState + '" task-id='+ oProcessData[keyArr[t]][i]['taskId'] +' ><a href="#">' + oProcessData[keyArr[t]][i]['taskTitle'] + '</a></li>';
            }
            htmlContent += taskTimeHtml + '<ul>' + taskTitleHtml + '</ul>';
        }
        this.oProcessContList.innerHTML = htmlContent;
        
        // 点击查看任务详细内容
        var aTaskLi = this.getByClass(this.oProcessContList, 'noteTitle');
        for (var i = 0; i < aTaskLi.length; i++) {
            aTaskLi[i].onclick = function () {
                for (var j = 0; j < aTaskLi.length; j++) {
                    _this.removeClass(aTaskLi[j], 'on');
                }
                _this.addClass(this, 'on');
                if (_this.sTaskOnId !== this.getAttribute('task-id')) { // 点击已选中的任务时，不做任何操作
                    _this.sTaskOnId = this.getAttribute('task-id');
                    _this.updateTaskInfo(_this.sTaskOnId);
                    // log('this.sTaskOnId: ' + _this.sTaskOnId);
                }
            }
        }
    },
    // 更新任务详细信息
    updateTaskInfo: function (sTaskId) {
        var sCategoryId = this.oTargetAddOn.parentNode.getAttribute('data-id');
        var oTaskData;
        var oCategoryData = {rows:[]};
        var oTaskId = this.getItem(sCategoryId);
        var oTaskList = this.getItem('taskList');
        if (oTaskId) {
            for (var i = 0; i < oTaskId.rows.length; i++) {
                for (var j = 0; j < oTaskList.rows.length; j++) {
                    if (oTaskList.rows[j].taskId === oTaskId.rows[i]) {
                        oCategoryData.rows.push(oTaskList.rows[j]);
                    }
                }
            }
        }  

        // 任务详细内容显示，标题、时间、内容
        var oTitle = this.getByClass(this.oContentMode, 'task-title-text')[0];
        var oDate = this.getByClass(this.oContentMode, 'task-date-text')[0];
        var oContent = this.getByClass(this.oContentMode, 'main-content')[0];
        // 任务详细内容输入，标题、时间、内容，全局使用
        this.oTitleInput = this.oContentMode.getElementsByTagName('input')[0];
        this.oDateInput = this.oContentMode.getElementsByTagName('input')[1];
        this.oContentTextarea = this.oContentMode.getElementsByTagName('textarea')[0];

        for (var i = 0; i < oCategoryData.rows.length; i++) {
            if (oCategoryData.rows[i].taskId === sTaskId) {
                oTaskData = oCategoryData.rows[i];
            }
        }

        // log('sCategoryId: ' + sCategoryId);
        // log(oTaskData);
        if (!oTaskData) {
            this.addTask();
        } else {
            this.removeClass(this.oContentMode, 'edit-mode');
            oTitle.innerHTML = oTaskData['taskTitle'];
            oDate.innerHTML = oTaskData['taskTime'];
            oContent.innerHTML = oTaskData['taskContent'];
            this.oTitleInput.value = oTaskData['taskTitle'];
            this.oDateInput.value = oTaskData['taskTime'];
            this.oContentTextarea.value = oTaskData['taskContent'];
        }
    },
    // 左侧按键展开、收起事件
    taskTrigger: function () {
        var _this = this;
        for (var i = 0; i < this.aListItem.length; i++) {
            this.oTaskCategoryUl.onclick = function (ev) {
                var oEvent = ev || event;
                var oTarget = oEvent.target || oEvent.srcElement;
                var tagName = oTarget.tagName.toLowerCase();
                var oTaskCategory = null;
                if (tagName === 'a') {  // 按下a标签
                    _this.oTargetAddOn = oTarget;
                    oTaskCategory = oTarget.parentNode;
                } else if (tagName === 'span') {    // 按下span标签    
                    _this.oTargetAddOn = oTarget.parentNode;
                    oTaskCategory = oTarget.parentNode.parentNode;
                } else if (tagName === 'i') {   // 按下删除按键
                    if (_this.hasClass(oTarget.parentNode.parentNode, 'task-dft')) { // 默认分类不能删除
                        alert("默认分类不能删除");
                    } else {
                        _this.oConfirmBoxText.innerHTML = "你确定删除《" + oTarget.parentNode.children[0].innerHTML + "》分类吗?";
                        _this.showBox(_this.oConfirmBoxWrap);
                        _this.oConfirmBoxBtnSure.onclick = function () {
                            var oSaveStructorData = _this.getItem('categoryStructor');
                            var oTaskList = _this.getItem('taskList');
                            var sId = oTarget.parentNode.parentNode.getAttribute('data-id');
                            if (!_this.hasClass(oTarget.parentNode, 'ico-task-sec')) { // 删除主目录
                                var oDeleteTaskList = _this.getItem(sId) ? _this.getItem(sId) : {rows:[]};
                                // 删除主目录对应的任务
                                log('要删除的任务有：');
                                log(oDeleteTaskList);
                                for (var i = 0; i < oDeleteTaskList.rows.length; i++) {
                                    for (var j = 0; j < oTaskList.rows.length; j++) {
                                        if (oTaskList.rows[j].taskId === oDeleteTaskList.rows[i]) {
                                            log("删除了id为：" + oTaskList.rows[j].taskId + '的任务');
                                            oTaskList.rows.splice(j, 1);
                                        }
                                    }   
                                }
                                for (var i = 0; i < oSaveStructorData.rows.length; i++) { // 删除该主目录下所有子目录对应的任务
                                    if (oSaveStructorData.rows[i].id === sId) {
                                        var sSubcategory = oSaveStructorData.rows[i].subcategory;
                                        if (sSubcategory) {
                                            for (var j = 0; j < sSubcategory.length; j++) {
                                                log('delete 子分类 id' + sSubcategory[j].id);
                                                delete _this.ls[sSubcategory[j].id];
                                            }
                                        }
                                    }
                                }
                                delete _this.ls[sId]; // 删除主目录对应的任务
                                log('delete 主分类 id' + sId);
                                for (var i = 0; i < oSaveStructorData.rows.length; i++) { // 删除主目录对应目录结构
                                    if (oSaveStructorData.rows[i]['id'] === sId) {
                                        log('delete 主分类的结构id' + sId);
                                        oSaveStructorData.rows.splice(i, 1); 
                                    }
                                }
                                _this.setItem('categoryStructor', oSaveStructorData);
                                _this.setItem('taskList', oTaskList);
                                _this.updateCategory(_this.sDefaultId);
                                _this.updateProcessList(_this.sDefaultId);
                            } else {
                                var sParentId = oTarget.parentNode.parentNode.parentNode.parentNode.getAttribute('data-id');
                                var oSaveParentTaskData = _this.getItem(sParentId);
                                var oDeleteTaskList = _this.getItem(sId) ? _this.getItem(sId) : {rows:[]};

                                var aChildDeleteTask = [];
                                
                                log('要删除的任务有：');
                                log(oDeleteTaskList);
                                for (var i = 0; i < oDeleteTaskList.rows.length; i++) {
                                    for (var j = 0; j < oTaskList.rows.length; j++) {
                                        if (oTaskList.rows[j].taskId === oDeleteTaskList.rows[i]) {
                                            oSaveParentTaskData.total--;
                                            log("删除了id为：" + oTaskList.rows[j].taskId + '的任务');
                                            oTaskList.rows.splice(j, 1);
                                        }
                                    }   
                                }

                                delete _this.ls[sId]; // 删除子目录对应的任务
                                log('delete 子分类 id' + sId);
                                log('主结构不删除,id是: ' + sParentId);
                                for (var i = 0; i < oSaveStructorData.rows.length; i++) { // 删除子目录对应目录结构
                                    if (oSaveStructorData.rows[i]['id'] === sParentId) {
                                        for (var j = 0; j < oSaveStructorData.rows[i]['subcategory'].length; j++) {
                                            if (oSaveStructorData.rows[i]['subcategory'][j]['id'] === sId) {
                                                log('delete 子分类的结构id' + sId); 
                                                oSaveStructorData.rows[i]['subcategory'].splice(j, 1);
                                            }
                                        } 
                                    }
                                }
                                _this.setItem('categoryStructor', oSaveStructorData);
                                _this.setItem('taskList', oTaskList);
                                _this.setItem(sParentId, oSaveParentTaskData);
                                _this.updateCategory(sParentId);
                                _this.updateProcessList(sParentId);
                            }
                            _this.updateTaskInfo(_this.sTaskOnId);
                            _this.hideBox(_this.oConfirmBoxWrap);
                        }
                        _this.oConfirmBoxBtnCancel.onclick = function () {
                            _this.hideBox(_this.oConfirmBoxWrap);
                        }
                            
                    }
                    return false;
                }
                _this.hasClass(oTaskCategory, 'TaskCategory-fold') ? _this.removeClass(oTaskCategory, 'TaskCategory-fold') : _this.addClass(oTaskCategory, 'TaskCategory-fold');
                if (!_this.hasClass(_this.oTargetAddOn, 'on')) {
                    // 选中当前分类
                    for (var i = 0; i < _this.aListItem.length; i++) {
                        _this.removeClass(_this.aListItem[i], 'on');
                    }
                    _this.addClass(_this.oTargetAddOn, 'on');

                    // 默认显示所有任务，不管完成与否
                    var aFilterBtn = _this.aProcessFilterBtn;
                    for (var i = 0; i < aFilterBtn.length; i++) {
                        aFilterBtn[i].className = '';
                    }
                    aFilterBtn[0].className = 'active';

                    _this.removeClass(oTaskCategory, 'TaskCategory-fold');
                    _this.sProcessNow = 0;
                    _this.updateProcessList.call(_this, _this.oTargetAddOn.parentNode.getAttribute('data-id'));
                }
            }
        }
    },
    // 根据完成状态进行筛选
    filterTaskState: function () {
        var _this = this;
        var aFilterBtn = this.aProcessFilterBtn;
        for (var i = 0; i < aFilterBtn.length; i++) {
            aFilterBtn[i].index = i;
            aFilterBtn[i].onclick = function () {
                if (this.index !== _this.sProcessNow) {
                    for (var i = 0; i < aFilterBtn.length; i++) {
                        aFilterBtn[i].className = '';
                    }
                    _this.sProcessNow = this.index;
                    log('_this.sProcessNow: ' + _this.sProcessNow);
                    this.className = 'active';
                    _this.updateProcessList(_this.oTargetAddOn.parentNode.getAttribute('data-id'));
                }
            }
        }
        
    },
    // 添加目录
    addCategory: function () {
        // var sCategoryName = prompt('请输入分类名称');
        var _this = this;
        var sCategoryName = _this.oPromptBoxInput.value;
        log('目录名为：' + _this.oPromptBoxInput.value);
        if (!sCategoryName) { return false; }
        var oLi = document.createElement('li');
        var sRandomId = '/' + parseInt(Math.random()*1000000);
        var oCategoryData = {id: sRandomId, title: sCategoryName, subcategory: null};
        var oSaveData = this.getItem('categoryStructor');

        oLi.className = 'TaskCategory';
        oLi.setAttribute('data-id', sRandomId);
        if (this.hasClass(this.oTargetAddOn.parentNode, 'task-dft')) { // 选择默认分类时，创建一个新分类
            oLi.innerHTML = '<a href="#" class="list-item ico-task"><span>' + sCategoryName + '</span><span> (0)</span><i class="ico-delete"></i></a><ul></ul>';
            this.oTaskCategoryUl.appendChild(oLi);
            oSaveData.rows.push(oCategoryData);
            // log(this.ls);
        } else { // 非默认分类时，在内部创建新分类
            var sId = '';

            oLi.innerHTML = '<a href="#" class="list-item ico-task-sec"><span>' + sCategoryName + '</span><span> (0)</span><i class="ico-delete"></i></a>';
            if (this.hasClass(this.oTargetAddOn, 'ico-task-sec')) { // 给当前ul添加分类
                sId = this.oTargetAddOn.parentNode.parentNode.parentNode.getAttribute('data-id');
                this.oTargetAddOn.parentNode.parentNode.appendChild(oLi);
            } else { // 给子分类的ul添加分类
                sId = this.oTargetAddOn.parentNode.getAttribute('data-id');
                this.removeClass(this.oTargetAddOn.parentNode, 'TaskCategory-fold');
                if (this.oTargetAddOn.nextElementSibling) {
                    this.oTargetAddOn.nextElementSibling.appendChild(oLi);
                } else {
                    this.oTargetAddOn.nextSibling.appendChild(oLi);
                }
            }

            for (var i = 0; i < oSaveData.rows.length; i++) {
                if (oSaveData.rows[i]['id'] === sId) {
                    var oSubcategoryData = {id: sRandomId, title: sCategoryName};
                    aOldSubcategoryData = oSaveData.rows[i].subcategory || [];
                    aOldSubcategoryData.push(oSubcategoryData);
                    oSaveData.rows[i].subcategory = aOldSubcategoryData;
                }
            }
        }
        this.setItem('categoryStructor', oSaveData);
    },
    // 添加任务
    addTask: function () {
        var _this = this;
        var oOkBtn = this.getByClass(_this.oContentMode, 'if-save-btn')[0];
        var oCancel = this.getByClass(_this.oContentMode, 'if-save-btn')[1];
        this.oTitleInput.value = "";
        this.oDateInput.value = "";
        this.oContentTextarea.value = "";
        this.btnTrigger.call(this);
        this.addClass(_this.oContentMode, 'edit-mode');
        oOkBtn.onclick = function () {
            _this.btnTrigger.call(_this);
            if(!_this.getItem('taskList')) { // 存放所有任务的容器
                _this.setItem('taskList', {rows:[]});
            }
            var sId = _this.oTargetAddOn.parentNode.getAttribute('data-id');
            var oSaveData = _this.getItem(sId) ? _this.getItem(sId) : {total: 0, rows:[]};
            var oTemp = {};
            var sTaskRandomId = '/' + parseInt(Math.random()*1000000);
            var oTaskList = _this.getItem('taskList');
            oSaveData.total++;
            oTemp.taskId = sTaskRandomId;
            oTemp.taskTitle = _this.oTitleInput.value;
            oTemp.taskTime = _this.oDateInput.value;
            oTemp.taskContent = _this.oContentTextarea.value;
            oTemp.finished = false;
            oSaveData.rows.push(oTemp.taskId);
            oTaskList.rows.push(oTemp);
            log(oTaskList);
            _this.setItem('taskList', oTaskList);
            if (_this.hasClass(_this.oTargetAddOn, 'ico-task-sec')) { // 添加到子分类的同时，也是添加到主分类
                var sParentId = _this.oTargetAddOn.parentNode.parentNode.parentNode.getAttribute('data-id');
                var oParentSaveData = _this.getItem(sParentId) ? _this.getItem(sParentId) : {total: 0, rows:[]};
                var oParent = _this.oTargetAddOn.parentNode.parentNode.previousSibling ? 
                _this.oTargetAddOn.parentNode.parentNode.previousSibling :
                _this.oTargetAddOn.parentNode.parentNode.previousElementSibling;
                oParentSaveData.total++;
                oParent.children[1].innerHTML = ' (' + oParentSaveData.total + ') ';
                oParentSaveData.rows.push(oTemp.taskId);
                _this.setItem(sParentId, oParentSaveData);
            }
            _this.setItem(sId, oSaveData);
            _this.oTargetAddOn.children[1].innerHTML = ' (' + oSaveData.total + ') ';
            _this.totalCount.innerHTML = 1 + parseInt(_this.totalCount.innerHTML);
            _this.updateProcessList(sId);
            _this.removeClass(_this.oContentMode, 'edit-mode');
            // log('sId: ' + sId);
            // log(_this.getItem(sId));
        }
        oCancel.onclick = function () {
            _this.btnTrigger.call(_this);
            _this.removeClass(_this.oContentMode, 'edit-mode');
        }
    },
    // 编辑任务
    editTask: function () {
        var _this = this;
        var oOkBtn = this.getByClass(this.oContentMode, 'if-save-btn')[0];
        var oCancel = this.getByClass(this.oContentMode, 'if-save-btn')[1];
        this.btnTrigger.call(this);
        this.addClass(this.oContentMode, 'edit-mode');
        oOkBtn.onclick = function () {
            _this.btnTrigger.call(_this);
            var sId = _this.oTargetAddOn.parentNode.getAttribute('data-id');
            var oTemp = {};
            var oTaskList = _this.getItem('taskList');

            oTemp.taskId = _this.sTaskOnId;
            oTemp.taskTitle = _this.oTitleInput.value;
            oTemp.taskTime = _this.oDateInput.value;
            oTemp.taskContent = _this.oContentTextarea.value;

            for (var i = 0; i < oTaskList.rows.length; i++) {
                if (oTaskList.rows[i].taskId === _this.sTaskOnId) {
                    oTemp.finished = oTaskList.rows[i].finished; // 不改动完成状态
                    oTaskList.rows[i] = oTemp;
                    log('修改了id为：' + oTaskList.rows[i].taskId + '的任务');
                }
            }
            _this.setItem('taskList', oTaskList);
            _this.updateProcessList(sId);
            _this.removeClass(_this.oContentMode, 'edit-mode');
        }
        oCancel.onclick = function () {
            _this.btnTrigger.call(_this);
            _this.updateTaskInfo(_this.sTaskOnId);
            _this.removeClass(_this.oContentMode, 'edit-mode');
        }
    },
    // 完成任务
    finishTask: function () {
        var _this = this;
        _this.oConfirmBoxText.innerHTML = "是否确认完成？";
        _this.showBox(_this.oConfirmBoxWrap);
        _this.oConfirmBoxBtnSure.onclick = function () {
            var oTaskList = _this.getItem('taskList');
            for (var i = 0; i < oTaskList.rows.length; i++) {
                if (oTaskList.rows[i].taskId === _this.sTaskOnId) {
                    oTaskList.rows[i].finished = true;
                }
            }
            _this.setItem('taskList', oTaskList);
            _this.aProcessFilterBtn[2].onclick();
            _this.hideBox(_this.oConfirmBoxWrap);
        }
        _this.oConfirmBoxBtnCancel.onclick = function () {
            _this.hideBox(_this.oConfirmBoxWrap);
        }
    },
    // 按钮切换
    btnTrigger: function () {
        this.css(this.oTaskContentBtn, 'right', '-85');
        this.doMove(this.oTaskContentBtn, {right: 0}, null, 5);
    },
    // 显示弹出窗
    showBox: function (oBoxWrap) {
        var _this = this;
        this.css(oBoxWrap, 'top', document.documentElement.clientHeight/2 - 100);
        this.css(oBoxWrap, 'display', 'block');
        this.css(this.oOverlayCode, 'opacity', 0);
        this.css(this.oOverlayCode, 'display', 'block');
        this.doMove(this.oOverlayCode, {opacity: 80}, null, 2);
    },
    // 隐藏弹出窗
    hideBox: function (oBoxWrap) {
        oBoxWrap.style.display = 'none';
        this.oOverlayCode.style.display = 'none';
    },
    // css方法
    css: function (oElement, attr, value) {
        if (arguments.length === 2) {
            return oElement.currentStyle ? oElement.currentStyle[attr] : getComputedStyle(oElement, false)[attr];
        } else if (arguments.length === 3) {
            switch(attr) {
                case 'width':
                case 'height':
                case 'top':
                case 'left':
                case 'right':
                case 'bottom':
                    oElement.style[attr] = value + 'px';
                    break;
                case 'opacity':
                    oElement.style.filter = 'alpha(opcity:' + value + ')';
                    oElement.style.opacity = value / 100;
                    break;
                default:
                    oElement.style[attr] = value;
                    break;
            }
        }
    },
    // 缓冲运动
    doMove: function (oElement, oAttr, fnCallback, speed) {
        var _this = this;
        clearInterval(oElement.timer);
        oElement.timer = setInterval(function () {
            var bStop = true;
            for (var property in oAttr) {
                var iCur = parseFloat(_this.css(oElement, property));
                property === 'opacity' && (iCur = parseInt(iCur.toFixed(2) * 100));
                var iSpeed = (oAttr[property] - iCur) / speed;
                iSpeed = iSpeed > 0 ? Math.ceil(iSpeed) : Math.floor(iSpeed);

                if (iCur != oAttr[property]) {
                    bStop = false;
                    _this.css(oElement, property, iCur + iSpeed);
                } 
            }
            if (bStop) {
                clearInterval(oElement.timer);
                fnCallback && fnCallback.apply(this, arguments);   
            }
        }, 30);
    },
    // 获取本地数据，参数为目录id
    getItem: function (sId) {
        return JSON.parse(this.ls.getItem(sId));
    },
    // 设置本地数据，参数为目录id和对应的数据
    setItem: function (sId, oData) {
        this.ls.setItem(sId, JSON.stringify(oData));
    },
    // 通过class获取元素
    getByClass: function (oElement, sClassName) {
        var elements = oElement.getElementsByTagName('*');
        var aResult = [];
        for (var i = 0; i < elements.length; i++) {
            if (this.hasClass(elements[i], sClassName)) {
                aResult.push(elements[i]);
            }
        }
        return aResult;
    },
    // 去掉前后空格
    trim: function (str) {
        return str.replace(/^\s+|\s+$/g,'');
    },
    // 获取元素的所有class，一数组的形式返回
    getClassNames: function (oElement) {
        if (!oElement) {return false;}
        return this.trim(oElement.className).replace(/\s+/g, ' ').split(' ');
    },
    // 为元素添加相应class
    addClass: function (oElement, sClassName) {
        if (!oElement || !sClassName) {return false;}
        var aClassName = this.getClassNames(oElement);
        if (this.inArray(sClassName, aClassName) != -1) {return false;}
        oElement.className += (oElement.className ? ' ' : '')+ sClassName;
    },
    // 为元素移除相应class
    removeClass: function (oElement, sClassName) {
        if (!oElement || !sClassName) {return false;}
        var aClassName = this.getClassNames(oElement);
        var length = aClassName.length;
        for (var i = 0; i < length; i++) {
            if (aClassName[i] === sClassName) {
                aClassName.splice(i, 1);
            }
        }
        oElement.className = aClassName.join(' ');
        return (length === aClassName.length) ? false : true;
    },
    // 判断元素是否在数组中
    inArray: function (value, array) {
        // if (!this.isArray(array)) {return false;}
        if (!Array.prototype.indexOf) {
            Array.prototype.indexOf = function(elt /*, from*/) {
                var len = this.length >>> 0; // 利用位运算中的无符号右移操作符进行转型

                var from = Number(arguments[1]) || 0;
                from = (from < 0)
                     ? Math.ceil(from)
                     : Math.floor(from);
                if (from < 0)
                  from += len;

                for (; from < len; from++) {
                  if (from in this &&
                      this[from] === elt)
                    return from;
                }
                return -1;
            };
        }
        return array.indexOf(value, arguments[2]);
    },
    // 判断元素是否有指定class
    hasClass: function (oElement, sClassName) {
        var aClassName = this.getClassNames(oElement);
        return this.inArray(sClassName, aClassName) != -1;
    },
    // 判断是否为数组
    isArray: function (array) {
        var str = Object.prototype.toString.call(array).slice(8,-1).toLowerCase();
        if (str == "array") { return true; }
        else { return false; }
    },
    // 遍历数组
    each: function (arr, fn) {
        if (!this.isArray(arr)) { return false; }
        if (typeof fn !== 'function') { return false; }
        for (var i = 0; i < arr.length; i++) {
            fn(i, arr[i]);
        }
    }
}
window.onload = function () {
    new Gtd();
}