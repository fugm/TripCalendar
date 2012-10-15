/**
 * 淘宝旅行通用日历组件
 * Author: Angtian
 * E-mail: Angtian.fgm@taobao.com
 */

YUI.add('trip-calendar', function(Y) {

/**
 * 淘宝旅行通用日历组件是一个UI控件。可让用户选择所需时间
 * 可用做输入框选择日期，也可以直接显示在指定位置
 * 可配置显示节假日信息
 * 可自动匹配节假日前1~3天，后1~3天日期信息
 *
 * @module trip-calendar
 */
 
var $      = Y.all,
    L      = Y.Lang,
    each   = Y.each,
    toHTML = L.sub,
    
    IE        = Y.UA.ie,
    REG       = /-|\//g,
    RDATE     = /^((19|2[01])\d{2})-(0?[1-9]|1[012])-(0?[1-9]|[12]\d|3[01])$/,
    
    DELEGATE_CLICK    = 'delegate-click',
    DELEGATE_CHANGE   = 'delegate-change',
    DELEGATE_ICON     = 'delegate-icon',
    TRIGGER_CLASSNAME = 'trigger-node';

/**
  * 创建日历构造函数
  *
  * @class   Calendar
  * @extends {Base}
  * @param   {Object} config 配置对象 (详情见API)
  * @constructor
  */  
function Calendar() {
    Calendar.superclass.constructor.apply(this, arguments);
}

Y.TripCalendar = Y.extend(Calendar, Y.Base, {

    /**
     * 日历外容器
     *
     * @element _boundingBox
     * @type {Node}
     * @private
     */
    _boundingBox: null,
    
    /**
     * 内容容器
     *
     * @element _contentBox
     * @type {Node}
     * @private
     */    
    _contentBox: null,
    
    /**
     * 日历日期容器
     *
     * @element _dateBox
     * @type {Node}
     * @private
     */
    _dateBox: null, 

    /**
     * 消息容器
     *
     * @element _messageBox
     * @type {Node}
     * @private
     */
    _messageBox: null,
    
    /**
     * 节假日数据地图
     *
     * @property _dateMap
     * @type {Object}
     * @private
     */ 
    _dateMap: null,    

    /**
     * 当前触发元素节点
     *
     * @element _oTriggerNode
     * @type {Node}
     * @private
     */ 
    _oTriggerNode: null,

    /**
     * 日历初始化
     * 
     * @method initializer
     */      
    initializer: function() {
        this.set('calendarId', 'calendar-' + (+new Date) +  Math.floor(Math.random() * (+new Date)));
        this.renderUI();
        this._minDateCache = this.get('minDate');
        this.get('container') || this.hide();
    },
    
    /**
     * 渲染日历结构
     * 
     * @method renderUI
     */ 
    renderUI: function() {
        Y.one(this.get('container') || 'body').append(this._initCalendarHTML(this.get('date')));
        (function(that, boundingBox) {
            that._dateBox    = boundingBox.one('.date-box');
            that._contentBox = boundingBox.one('.content-box');
            that._messageBox = boundingBox.one('.message-box');
            boundingBox.setStyle('position', that.get('container') ? 'relative' : 'absolute');
            that.get('container') || (that._inputWrap()._setDefaultValue(), boundingBox.setStyle('top', '-9999px'));
            that.bindUI()._fixSelectMask()._setWidth()._setBtnStates()._setDateStyle();
            that.set('boundingBox', boundingBox);
        })(this, this._boundingBox = Y.one('#' + this.get('calendarId')));
    },
    
    /**
     * 事件绑定
     * 
     * @method bindUI
     */ 
    bindUI: function() {
        (function(that, boundingBox, win, doc) {
            that.after('dateChange', that.render);
            that.after('messageChange', that._setMessage);
            boundingBox.delegate('click', that._clickDelegate, '.' + DELEGATE_CLICK, that);
            boundingBox.delegate('change', that._changeDelegate, '.' + DELEGATE_CHANGE, that);
            if(that.get('container')) return;
            boundingBox.on('mousedown', that._mousedown, that);
            boundingBox.on('clickoutside', that._clickoutside, that);
            boundingBox.delegate(['mouseenter', 'mouseleave'], that._mouseDelegate, 'a', that);
            doc.delegate('focus', that._focusDelegate, '.' + TRIGGER_CLASSNAME, that);
            doc.delegate('blur', that._blurDelegate, '.' + TRIGGER_CLASSNAME, that);
            doc.delegate('keyup', that._keyup, '.' + TRIGGER_CLASSNAME, that);
            doc.delegate('click', that._infoClickDelegate, '.' + DELEGATE_ICON, that);
            doc.delegate('click', that._selectDelegate, '.' + TRIGGER_CLASSNAME);
            doc.delegate('mousedown', that._mousedown, '.' + DELEGATE_ICON, that);
            win.on('resize', that._rectify, that);      
        })(this, this._boundingBox, Y.one(window), Y.one(document));
        return this;
    },
   
    /**
     * 同步UI，主要用于动态创建触发元素后使用
     * 
     * @method syncUI
     */
    syncUI: function() {
        !this.get('container') && this.get('triggerNode') && this._inputWrap();
    },     
  
    /**
     * 渲染方法
     * 
     * @method render
     */     
    render: function() {
        this._dateBox.setContent(this._dateHTML());
        this._setWidth()._setDateStyle()._setBtnStates()._fixIEChange();
        this.fire('render');
        return this;
    },
    
    /**
     * 渲染下月日历
     * 
     * @method nextMonth
     */         
    nextMonth: function() {
        this.set('date', this._getSiblingMonth(this.get('date'), 1));
        this.fire('nextmonth');
        return this;
    },
    
    /**
     * 渲染上月日历
     * 
     * @method prevMonth
     */         
    prevMonth: function() {
        this.set('date', this._getSiblingMonth(this.get('date'), -1));
        this.fire('prevmonth');
        return this;
    },
    
    /**
     * 显示日历
     * 
     * @method show
     */
    show: function() {
        this._setDefaultDate();
        this._boundingBox.show();
        this.fire('show', {node: this._oTriggerNode});
        return this;
    },
    
    /**
     * 隐藏日历
     * 
     * @method hide
     */
    hide: function() {
        this._boundingBox.hide();
        this._oTriggerNode && this._oTriggerNode.blur();
        this.hideMessage();
        return this;
    },
    
    /**
     * 显示提示信息
     * 
     * @method showMessage
     */
    showMessage: function() {
        (function(that) {
            that.fire('showmessage');
            setTimeout(function() {
                that._messageBox.addClass('visible');
            }, 5);
        })(this);
        return this;
    },
    
    /**
     * 隐藏提示信息
     * 
     * @method hideMessage
     */
    hideMessage: function() {
        this._messageBox.removeClass('visible');
        this.fire('hidemessage');
        return this;
    },
    
    /**
     * 获取选择的日期
     * 
     * @method getSelectedDate
     * @return {String} 日期字符串
     */
    getSelectedDate: function() {
        return this.get('selectedDate');
    },
    
    /**
     * 获取当前触发元素节点
     * 
     * @method getCurrentNode
     * @return {Node} 节点对象
     */
    getCurrentNode: function() {
        return this._oTriggerNode;
    },    

    /**
     * 获取指定日期相关信息
     * 
     * @method getDateInfo
     * @param  {String} v 日期字符串
     * @return {String} 日期信息
     */
    getDateInfo: function(v) {
        var iDiff     = -1,
            sNowDate  = this._toStringDate(new Date),
            sDateName = ['\u4eca\u5929', '\u660e\u5929', '\u540e\u5929'];
        switch(true) {
            case v == sNowDate:
                iDiff = 0;
                break;
            case v == this._getSiblingDate(sNowDate, 1):
                iDiff = 1;
                break;
            case v == this._getSiblingDate(sNowDate, 2):
                iDiff = 2;
                break;
        }
        !this._dateMap && this.get('isHoliday') && (this._dateMap = this._createDateMap());
        return this._dateMap && this._dateMap[v] || sDateName[iDiff] || this._getWeek(v);
    },
    
    /**
     * 获取指定日期是星期几
     * 
     * @method _getWeek
     * @param {String} v 日期字符串
     * @private
     * @return {String} 星期几
     */
    _getWeek: function(v) {
        return '\u661f\u671f' + ['\u65e5', '\u4e00', '\u4e8c', '\u4e09', '\u56db', '\u4e94', '\u516d'][this._toDate(v).getDay()];
    },    
    
    /**
     * 获取指定日期的兄弟日期
     * 
     * @method _getSiblingDate
     * @param {String} v 日期字符串
     * @param {Number} n 整数，支持负数
     * @private
     * @return {String} 新的日期
     */
    _getSiblingDate: function(v, n) {
        v = v.split(REG);
        return this._toStringDate(new Date(v[0], v[1] - 1, v[2] * 1 + n));
    },
    
    /**
     * 获取指定月份的兄弟月份
     * 
     * @method _getSiblingMonth
     * @param {Date} v 日期对象
     * @param {Number} n 整数，支持负数
     * @private
     * @return {Date} 新的日期对象
     */
    _getSiblingMonth: function(v, n) {
        return new Date(v.getFullYear(), v.getMonth() * 1 + n);
    },
    
    /**
     * 获取指定的日期状态
     * 
     * @method _getDateStatus
     * @param {String} v 日期字符串
     * @private
     * @return {Boole}
     */
    _getDateStatus: function(v) {
        return (this.get('minDate') && this._toNumber(v) < this._toNumber(this.get('minDate'))) || 
               (this.get('maxDate') && this._toNumber(v) > this._toNumber(this.get('maxDate')));
    },
    
    /**
     * 获取两个日期间隔天数
     * 
     * @method _getDateDiff
     * @param {String} sDate1 日期字符串1
     * @param {String} sDate2 日期字符串2
     * @private
     * @return {Number}
     */
    _getDateDiff: function(sDate1, sDate2) {
        var oDate1 = +this._toDate(sDate1),
            oDate2 = +this._toDate(sDate2);
        return parseInt(Math.abs(oDate1 - oDate2) / 24 / 60 / 60 / 1000);
    },
    
    /**
     * 获取指定日期className
     * 
     * @method _getHolidaysClass
     * @param {String} v 日期字符串
     * @param {Boole} b 日期是否可用
     * @private
     * @return {String} 样式名
     */ 
    _getHolidaysClass: function(v, b) {
        var oHolidays = Calendar.HOLIDAYS;
        switch(true) {
            case b:
            case !this.get('isHoliday'):
                return '';
            case v == this._toStringDate(new Date):
                return 'today';
            case true:
                for(var property in oHolidays) if(Y.Array.indexOf(oHolidays[property], v) != -1)
                return property;
            default:
                return '';
        }
    },

    /**
     * 设置日历容器宽度
     * 
     * @method _setWidth
     * @private
     */
    _setWidth: function() {
        (function(that, boundingBox, contentBox) {
            boundingBox.all('.inner, h4').setStyle('width', boundingBox.one('table').get('offsetWidth'));
            boundingBox.setStyle('width',
                boundingBox.one('.inner').get('offsetWidth') * that.get('count') +
                parseInt(contentBox.getStyle('borderLeftWidth')) +
                parseInt(contentBox.getStyle('borderRightWidth')) +
                parseInt(contentBox.getStyle('paddingLeft')) +
                parseInt(contentBox.getStyle('paddingRight')));
            if(IE !== 6) return this;
            boundingBox.one('iframe').setStyles({
                width : boundingBox.get('offsetWidth'),
                height: boundingBox.get('offsetHeight')
            });
        })(this, this._boundingBox, this._contentBox);
        return this;
    },
    
    /**
     * 触发元素赋值
     * 
     * @method _setValue
     */
    _setValue: function(v) {
        this.set('selectedDate', v);
        if(this.get('container')) return this;
        this._isInput(this._oTriggerNode) && this._oTriggerNode.set('value', v);
        switch(true) {
            case this._boundingBox.hasClass('calendar-bounding-box-style'):
                this.set('endDate', v);
                break;
            case !this._boundingBox.hasClass('calendar-bounding-box-style') && !!this.get('finalTriggerNode'):
                this.set('startDate', v);
                break;
            default:
                this.set('selectedDate', v);
                break;
        }
        return this;
    },

    /**
     * 设置日期信息
     * 
     * @method _setDateInfo
     * @param {String} v 日期字符串
     */    
    _setDateInfo: function(v) {
        if(this.get('container') || !this.get('isDateInfo') || !this._isInput(this._oTriggerNode)) return this;
        this._oTriggerNode.previous().setContent(RDATE.test(v) ? this.getDateInfo(v) : '');
        return this;
    },
    
    /**
     * 设置触发元素默认值对应的日期信息
     * 
     * @method _setDefaultValue
     */
    _setDefaultValue: function() {
        var triggerNode      = $(this.get('triggerNode')).item(0),
            finalTriggerNode = $(this.get('finalTriggerNode')).item(0),
            startValue       = triggerNode && triggerNode.get('value'),
            endValue         = finalTriggerNode && finalTriggerNode.get('value');
        if(startValue && RDATE.test(startValue)) {
            this.get('isDateInfo') && triggerNode.previous().setContent(this.getDateInfo(startValue));
            this.set('startDate', startValue);
        }
        if(endValue && RDATE.test(endValue)) {
            this.get('isDateInfo') && finalTriggerNode.previous().setContent(this.getDateInfo(endValue));
            this.set('endDate', endValue);
        }
        return this;
    },    
 
    /**
     * 设置触发元素默认值对应的日期
     * 
     * @method _setDefaultDate
     */ 
    _setDefaultDate: function() {
        if(this.get('container')) return this;
        
        this.get('startDate') && this.set('minDate', this._boundingBox.hasClass('calendar-bounding-box-style') ? this.get('startDate') : this._minDateCache).render();

        if(this._boundingBox.hasClass('calendar-bounding-box-style') && (function(start, end) {
            return start.getMonth()%12 + 1 >= (end.getFullYear() > start.getFullYear() ? end.getMonth() + 12 : end.getMonth());
        })(this._toDate(this.get('startDate')), this._toDate(this.get('endDate')))) {
            this.set('date', this.get('startDate') || this.get('date'));
            return this;
        }
        this.set('date', this._oTriggerNode.get('value') || this.get('date'));

        return this;
    },
    
    /**
     * 设置时间样式
     * 
     * @method _setDateStyle
     */
    _setDateStyle: function() {
        var boundingBox   = this._boundingBox,
            startDate     = this.get('startDate'),
            endDate       = this.get('endDate'),
            selectedDate  = this.get('selectedDate'),
            oStartDate    = startDate && boundingBox.one('td[data-date="' + startDate + '"]'),
            oEndDate      = endDate && boundingBox.one('td[data-date="' + endDate + '"]'),
            oSelectedDate = selectedDate && boundingBox.one('td[data-date="' + selectedDate + '"]'),
            iDiff         = this._getDateDiff(startDate, endDate),
            aTd           = boundingBox.all('td'),
            oTd           = null;
        aTd.removeClass('start-date').removeClass('end-date').removeClass('selected-range').removeClass('selected-date');
        oStartDate && oStartDate.addClass('start-date');
        oEndDate && oEndDate.addClass('end-date');
        oSelectedDate && oSelectedDate.addClass('selected-date');
        if(this._toNumber(startDate) > this._toNumber(endDate)) return this;        
        for(var i = 0; i < iDiff - 1; i++) {
            startDate = this._getSiblingDate(startDate, 1);
            oTd       = boundingBox.one('td[data-date="' + startDate + '"]');
            oTd && oTd.addClass('selected-range');
        }
        return this;
    },
    
    /**
     * 设置上月/下月/关闭按钮状态
     * 
     * @method _setBtnStates
     * @private
     */    
    _setBtnStates: function() {
        var curDate  = +this._getSiblingMonth(this.get('date'), 0),
            maxDate  = this.get('maxDate'),
            minDate  = this.get('minDate'),
            prevBtn  = this._boundingBox.one('.prev-btn'),
            nextBtn  = this._boundingBox.one('.next-btn'),
            closeBtn = this._boundingBox.one('.close-btn');
            if(minDate) {
                minDate = +this._toDate(minDate);
            }
            if(maxDate) {
                maxDate = +this._getSiblingMonth(this._toDate(maxDate), 1 - this.get('count'));
            }
            curDate <= (minDate || Number.MIN_VALUE) ? prevBtn.addClass('prev-btn-disabled') : prevBtn.removeClass('prev-btn-disabled');
            curDate >= (maxDate || Number.MAX_VALUE) ? nextBtn.addClass('next-btn-disabled') : nextBtn.removeClass('next-btn-disabled');
            this.get('container') && closeBtn.hide();
            return this;
    },
    
    /**
     * 设置日历提示信息
     * 
     * @method _setMessage
     * @private
     */
    _setMessage: function() {
        this._messageBox.setContent(this.get('message'));
        return this;
    },
    
    /**
     * 创建触发元素外容器
     * 
     * @method _inputWrap
     * @private
     */
    _inputWrap: function() {
        (function(that, triggerNodeList, finalTriggerNodeList) {
            triggerNodeList.each(function(o) {
                if((that.get('isDateInfo') || that.get('isDateIcon')) && that._isInput(o) && !o.ancestor('.calendar-input-wrap')) {
                    o.wrap(Calendar.INPUT_WRAP_TEMPLATE);
                    o.insert(toHTML(Calendar.START_DATE_TEMPLATE, {'delegate_icon': DELEGATE_ICON}), 'before');
                    that.get('isDateIcon') || o.previous().removeClass('calendar-start-icon');
                }
                o.addClass(TRIGGER_CLASSNAME);
            });
            finalTriggerNodeList.each(function(o) {
                if((that.get('isDateInfo') || that.get('isDateIcon')) && that._isInput(o) && !o.ancestor('.calendar-input-wrap')) {
                    o.wrap(Calendar.INPUT_WRAP_TEMPLATE);
                    o.insert(toHTML(Calendar.END_DATE_TEMPLATE, {'delegate_icon': DELEGATE_ICON}), 'before');
                    that.get('isDateIcon') || o.previous().removeClass('calendar-end-icon');
                }
                o.addClass(TRIGGER_CLASSNAME);
            });
            //triggerNodeList.concat(finalTriggerNodeList).wrap(Calendar.INPUT_WRAP_TEMPLATE);
            //triggerNodeList.insert(Calendar.START_DATE_TEMPLATE, 'before');
            //finalTriggerNodeList.insert(Calendar.END_DATE_TEMPLATE, 'before');
        })(this, $(this.get('triggerNode')), $(this.get('finalTriggerNode')));
        return this;
    },

    /**
     * 触发元素获得焦点事件
     * 
     * @method _focus
     * @private
     */
    _focus: function(currentNode) {
        (function(that, boundingBox, triggerNodeList, className) {
            setTimeout(function() {
                clearTimeout(that.hideTimer);
            }, IE != 6 ? 10 : 30);
            if(!currentNode) return;
            that._cacheNode && (that._cacheNode != currentNode) && that.fire('hide', {node: that._cacheNode});
            triggerNodeList.indexOf(currentNode) != -1 ? boundingBox.removeClass(className) : boundingBox.addClass(className); 
            that._oTriggerNode = currentNode;
            that.hideMessage().show()._setWidth()._rectify();
        })(this, this._boundingBox, $(this.get('triggerNode')), 'calendar-bounding-box-style');    
    },
    
    /**
     * 触发元素失去焦点事件
     * 
     * @method _blur
     * @private
     */
    _blur: function(currentNode) {  
        (function(that) {
            that._cacheNode = currentNode;
            that._cacheNode && (that._oTriggerNode._isSelect = null);
            clearTimeout(that.hideTimer);
            that.hideTimer = setTimeout(function() {
                that._boundingBox.getStyle('display') == 'block' && that.fire('hide', {node: that._oTriggerNode});
                that.hide();
            }, IE != 6 ? 100 : 200);
        })(this);        
    },
    
    /**
     * 日历容器鼠标按下事件
     * 
     * @method _mousedown
     * @private
     */    
    _mousedown: function(e) {
        this._focus();
    },      
    
    /**
     * 获得焦点代理
     * 
     * @method _focusDelegate
     * @param {Event} e 事件对象
     * @private
     */
    _focusDelegate: function(e) {
        this._focus(e.currentTarget);
    },
    
    /**
     * 失去焦点代理
     * 
     * @method _blurDelegate
     * @param {Event} e 事件对象
     * @private
     */
    _blurDelegate: function(e) {
        this._blur(e.currentTarget)
    },
    
    /**
     * 容器外部点击事件
     * 
     * @method _clickoutside
     * @private
     */
    _clickoutside: function(e) {
        e.target.hasClass(TRIGGER_CLASSNAME) || e.target.hasClass(DELEGATE_ICON) || this._blur();
    },
    
    /**
     * 日历点击事件代理
     * 
     * @method _clickDelegate
     * @private
     */ 
    _clickDelegate: function(e) {
        var oTarget = e.currentTarget,
            sDate   = oTarget.getAttribute('data-date');
        switch(true) {
            case oTarget.hasClass('prev-btn') && !oTarget.hasClass('prev-btn-disabled'):
                this.prevMonth();
                break;
            case oTarget.hasClass('next-btn') && !oTarget.hasClass('next-btn-disabled'):
                this.nextMonth();
                break;
            case oTarget.hasClass('close-btn'):
                this.hide().fire('hide', {node: this._oTriggerNode});
                this._cacheNode = null;
                break;
            case !!oTarget.getAttribute('data-date') && !oTarget.hasClass('disabled'):
                this._setValue(sDate)
                    ._setDateInfo(sDate)
                    ._setDateStyle()
                    ._afterSetValue()
                    .fire('dateclick', {
                        date: sDate,
                        dateInfo: this.getDateInfo(sDate)
                    });
                break;
        }    
    },

    /**
     * selectChange事件代理
     * 
     * @method _changeDelegate
     * @private
     */     
    _changeDelegate: function() {
        var selectList = this._boundingBox.all('.' + DELEGATE_CHANGE);
        this.set('date', selectList.item(0).get('value') + '-' + selectList.item(1).get('value') + '-01');
    },

    /**
     * 解决版本9以下IE浏览器无法做change代理的问题
     * 
     * @method _fixIEChange
     * @private
     */      
    _fixIEChange: function() {
        if(!this.get('isSelect') || IE > 8 || !IE) return this;
        this._boundingBox.all('.' + DELEGATE_CHANGE).on('change', this._changeDelegate, this);
        return this;
    },
    
    /**
     * 修复ie6下日历无法遮挡select的bug
     * 
     * @method _fixSelectMask
     * @private
     */     
    _fixSelectMask: function() {
        IE === 6 && this._boundingBox.append('<iframe />');
        return this;
    },
    
    /**
     * 日历信息容器点击事件代理
     * 
     * @method _infoClickDelegate
     * @private
     */
    _infoClickDelegate: function(e) {
        var oTarget = e.target.next();
        if(oTarget != this._oTriggerNode || this._boundingBox.getStyle('display') == 'none') {
            oTarget.focus();
            oTarget._node.select && (oTarget.select()._isSelect = true);
        }
    },

    /**
     * 输入框点击事件代理
     * 
     * @method _selectDelegate
     * @private
     */      
    _selectDelegate: function(e) {
        var oTarget = e.target;
        if(oTarget._node.select && !oTarget._isSelect) {
            oTarget.select()._isSelect = true;
        }
    },
    
    /**
     * 鼠标移入事件
     * 
     * @method _mouseenter
     * @param {Event} oTarget 事件对象    
     * @private
     */
    _mouseenter: function(oTarget) {
        var boundingBox = this._boundingBox,
            startDate   = this.get('startDate'),
            curDate     = oTarget.getAttribute('data-date'),
            iDiff       = this._getDateDiff(startDate, curDate),
            aTd         = boundingBox.all('td'),
            oTd         = null;
        clearTimeout(this.leaveTimer);
        boundingBox.all('td').removeClass('hover');
        if(this._toNumber(startDate) > this._toNumber(curDate)) return;
        for(var i = 0; i < iDiff - 1; i++) {
            startDate = this._getSiblingDate(startDate, 1);
            oTd       = boundingBox.one('td[data-date="' + startDate + '"]');
            oTd && oTd.addClass('hover');
        }
    },
    
    /**
     * 鼠标移出事件
     * 
     * @method _mouseleave  
     * @private
     */
    _mouseleave: function() {
        (function(that) {
            clearTimeout(that.leaveTimer);
            that.leaveTimer = setTimeout(function() {
                that._boundingBox.all('td').removeClass('hover'); 
            }, 30);
        })(this);
    },
    
    /**
     * 鼠标移入/移出事件代理
     * 
     * @method _mouseDelegate  
     * @param {Event} e 事件对象
     * @private
     */    
    _mouseDelegate: function(e) {
        var oTarget = e.currentTarget.ancestor('td');
        if(oTarget.hasClass('disabled')) return;
        switch(e.type) {
            case 'mouseenter':
                this._boundingBox.hasClass('calendar-bounding-box-style') && 
                !!this.get('startDate') &&
                this._mouseenter(oTarget);                   
                break;
            case 'mouseleave':
                this._mouseleave();
                break;
        }    
    },  

    /**
     * 输入框输入事件
     * 
     * @method _keyup  
     * @private
     */
    _keyup: function(e) {
        if(!this.get('isKeyup')) return;
        clearTimeout(this.keyupTimer);
        var that = this,
            oTarget = e.currentTarget;
        if(!this._isInput(oTarget)) return;
        var v = oTarget.get('value');
        that._setDateInfo(v);
        if(!RDATE.test(v)) return;
        this.keyupTimer = setTimeout(function() {
            v = that._toStringDate(that._toDate(v));
            that._setValue(v);
            that.set('date', v);
        }, 200);
    },
    
    /**
     * 赋值后处理方法
     * 
     * @method _afterSetValue
     */    
    _afterSetValue: function() {
        if(this.get('container')) return this;        
        this.hide().fire('hide', {node: this._oTriggerNode});
        this._cacheNode = null;       
        var finalTriggerNode = Y.one(this.get('finalTriggerNode'));
        if(!this._boundingBox.hasClass('calendar-bounding-box-style') && finalTriggerNode && this.get('isAutoSwitch')) {
            finalTriggerNode._node.select && (finalTriggerNode.select()._isSelect = true);
        }
        return this;
    },    
    
    /**
     * 纠正显示位置
     * 
     * @method _rectify
     * @private
     */    
    _rectify: function() {
        (function(that, currentNode) {
            if(!currentNode) return;
            setTimeout(function() {
                var iLeft              = currentNode.getX(),
                    iTop               = currentNode.getY() + currentNode.get('offsetHeight'),        
                    iBoundingBoxWidth  = that._boundingBox.get('offsetWidth'),
                    iBoundingBoxHeight = that._boundingBox.get('offsetHeight'),
                    iCurrentNodeWidth  = currentNode.get('offsetWidth'),
                    iCurrentNodeHeight = currentNode.get('offsetHeight'),
                    iMaxLeft           = currentNode.get('winWidth') * 1 + currentNode.get('docScrollX') - iBoundingBoxWidth,
                    iMaxTop            = currentNode.get('winHeight') * 1 + currentNode.get('docScrollY') - iBoundingBoxHeight;
                (function(t, l) {
                    if(iTop > iMaxTop) iTop = t < 0 ? iTop : t;
                    if(iLeft > iMaxLeft) iLeft = l < 0 ? iLeft : l;
                })(iTop - iBoundingBoxHeight - iCurrentNodeHeight, iLeft + iCurrentNodeWidth - iBoundingBoxWidth);   
                that._boundingBox.setStyles({
                    top : iTop,
                    left: iLeft
                });            
            }, 10);
        })(this, this._oTriggerNode);
        return this;
    }, 
    
    /**
     * 获取同排显示的日历中最大的单元格数
     * 
     * @method _maxCell
     * @private
     * @return {Number} 返回最大数
     */
    _maxCell: function() {
        var oDate  = this.get('date'),
            iYear  = oDate.getFullYear(),
            iMonth = oDate.getMonth() + 1,
            aCell  = [];
        for(var i = 0; i < this.get('count'); i++) {
            aCell.push(new Date(iYear, iMonth - 1 + i, 1).getDay() + new Date(iYear, iMonth * 1 + i, 0).getDate());
        }
        return Math.max.apply(null, aCell);
    },
    
    /**
     * 不足两位数的数字补零
     * 
     * @method _filled
     * @param {Number} v 要转换的数字
     * @private
     */    
    _filled: function(v) {
        return v.toString().replace(/^(\d)$/, '0$1');
    },
    
    /**
     * 将日期字符串格式化为数字
     * 
     * @method _toNumber
     * @param {String} v 日期字符串 
     * @private
     */        
    _toNumber: function(v) {
        return v.toString().replace(/-|\//g, '');
    },
    
    /**
     * 将日期对象转为字符串格式
     * 
     * @method _toStringDate
     * @param {Date} v 日期对象
     * @private
     */
    _toStringDate: function(v) {
        return v.getFullYear() + '-' + this._filled(v.getMonth() * 1 + 1) + '-' + this._filled(v.getDate());
    },
    
    /**
     * 将日期字符串转为日期对象
     * 
     * @method _toDate
     * @param {String} v 日期字符串
     * @private
     */
    _toDate: function(v) {
        v = v.split(REG);
        return new Date(v[0], v[1] - 1, v[2]);
    },
    
    /**
     * 判断node是不是input
     * 
     * @method _isInput
     * @param {Object} v node
     * @private
     */    
    _isInput: function(v) {
        return v.get('tagName').toUpperCase() === 'INPUT' && (v.get('type') === 'text' || v.get('type') === 'date');
    },
    
    /**
     * 创建年/月选择器
     * 
     * @method _createSelect
     * @private
     * @return {String}
     */
    _createSelect: function() {
        var curDate  = this.get('date'),
            minDate  = this.get('minDate'),
            maxDate  = this.get('maxDate'),
            curYear  = curDate.getFullYear(),
            curMonth = this._filled(curDate.getMonth() * 1 + 1),
            minYear  = minDate && minDate.substr(0, 4) || 1900,
            maxYear  = maxDate && maxDate.substr(0, 4) || new Date().getFullYear() + 3,
            minMonth = minDate && minDate.substr(5, 2) || 1,
            maxMonth = maxDate && maxDate.substr(5, 2) || 12,
            selected = ' selected="selected"',
            select_template = {};
            select_template['delegate_change'] = DELEGATE_CHANGE;
            select_template['year_template']   = '';
            select_template['month_template']  = '';
            curYear == minYear || curYear == maxYear || (minMonth = 1, maxMonth = 12);
            for(var i = maxYear; i >= minYear; i--) {
                select_template['year_template'] += 
                    '<option' + (curYear == i ? selected : '') + ' value="'+ i +'">' + i + '</option>';
            }
            for(var i = minMonth; i <= maxMonth; i++) {
                select_template['month_template'] += 
                    '<option' + (curMonth == i ? selected : '') + ' value="' + this._filled(i) + '">' + this._filled(i) + '</option>';
            }
            return toHTML(Calendar.SELECT_TEMPLATE, select_template);
    },
    
    /**
     * 创建2012——2020年节假日数据（包括节假日前1~3天/后1~3天）
     * 
     * @method _createDateMap
     * @private
     * @return {Object} 节假日数据
     */
    _createDateMap: function() {
        var oTmp = {};
        for(var propety in Calendar.HOLIDAYS) {
            var curHoliday = Calendar.HOLIDAYS[propety];
            for(var i = 0; i < curHoliday.length; i++) {
                var sDate = curHoliday[i],
                    sName = Calendar.DATENAME[propety];
                for(var j = 0; j < 7; j++) {
                    var curDate = this._getSiblingDate(sDate, j - 3); 
                    (function(j, v) {
                        oTmp[curDate] = oTmp[curDate] ? j > 2 ? v : oTmp[curDate] : v;
                    })(j, sName + (j != 3 ? (j < 3 ? '\u524d' : '\u540e') + Math.abs(j - 3) + '\u5929' : ''));
                }
            }   
        }
        return oTmp;
    },
    
    /**
     * 生成日历模板
     * 
     * @method _initCalendarHTML
     * @param {String} date 日期字符串yyyy-mm-dd
     * @private
     * @return {String} 返回日历字符串
     */        
    _initCalendarHTML: function() {
        var calendar_template                     = {};
            calendar_template['delegate_click']   = DELEGATE_CLICK;
            calendar_template['bounding_box_id']  = this.get('calendarId');
            calendar_template['message_template'] = this.get('message');
            calendar_template['date_template']    = this._dateHTML();
        return toHTML(Calendar.CALENDAR_TEMPLATE, calendar_template);       
    },
    
    /**
     * 生成多日历模板
     * 
     * @method _dateHTML
     * @param {Date} date 日期对象 
     * @private
     * @return {String} 返回双日历模板字符串
     */        
    _dateHTML: function(date) {
        var date          = this.get('date'),
            iYear         = date.getFullYear(),
            iMonth        = date.getMonth(),
            date_template = '';
        for(var i = 0; i < this.get('count'); i++) {
            date_template += 
                toHTML(Calendar.DATE_TEMPLATE, this._singleDateHTML(new Date(iYear, iMonth + i)));    
        }
        return date_template;
    },
    
    /**
     * 生成单日历模板
     * 
     * @method _singleDateHTML
     * @param {Date} date 日期对象 
     * @private
     * @return {Object} 返回单个日历模板对象
     */    
    _singleDateHTML: function(date) {
        var iYear     = date.getFullYear(),
            iMonth    = date.getMonth() + 1,
            firstDays = new Date(iYear, iMonth - 1, 1).getDay(),
            monthDays = new Date(iYear, iMonth, 0).getDate(),
            weekdays  = [{wd: '\u65e5', weekend: 'weekend'},
                         {wd: '\u4e00'},
                         {wd: '\u4e8c'},
                         {wd: '\u4e09'},
                         {wd: '\u56db'},
                         {wd: '\u4e94'},
                         {wd: '\u516d', weekend: 'weekend'}];
        //week template string                
        var weekday_template = '';
            each(weekdays, function(v) {
                weekday_template +=
                    toHTML(Calendar.HEAD_TEMPLATE, {weekday_name: v.wd, weekend: v.weekend || ''});
            });
        //tbody template string    
        var body_template = '',
            days_array    = [];
        for(;firstDays--;) days_array.push(0);
        for(var i = 1; i <= monthDays; i++) days_array.push(i);
        days_array.length = this._maxCell();
        var rows  = Math.ceil(days_array.length / 7),
            oData = this.get('data');
        for(var i = 0; i < rows; i++) {
            var calday_row = '';
            for(var j = 0; j <= 6; j++) {
                var days = days_array[j + 7 * i] || '';
                var date = days ? iYear + '-' + this._filled(iMonth) + '-' + this._filled(days) : '';
                calday_row += 
                    toHTML(Calendar.DAY_TEMPLATE,
                        {
                            'day': days,
                            'date': date,
                            'disabled': this._getDateStatus(date) || !days ? 'disabled' : DELEGATE_CLICK,
                            'date_class': this._getHolidaysClass(date, this._getDateStatus(date) || !days)
                        }
                    )  
            }
            body_template +=
                toHTML(Calendar.BODY_TEMPLATE, {calday_row: calday_row})
        }                    
        //table template object                
        var table_template = {};
            //thead string
            table_template['head_template'] = weekday_template;
            //tbody string            
            table_template['body_template'] = body_template;
        //single Calendar object
        var single_calendar_template = {};
            single_calendar_template['date'] = this.get('isSelect') ? this._createSelect() : iYear + '\u5e74' + iMonth + '\u6708';
            single_calendar_template['table_template'] = toHTML(Calendar.TABLE_TEMPLATE, table_template);
        //return single Calendar template object
        return single_calendar_template;
    }
},
{
    /**
     * 日历模板
     *
     * @property CALENDAR_TEMPLATE
     * @type String
     * @static
     */
    CALENDAR_TEMPLATE: '<div id="{bounding_box_id}" class="calendar-bounding-box">' +
                            '<div class="container">' +
                                '<div class="message-box">' +
                                    '{message_template}' +
                                '</div>' +
                                '<div class="content-box">' +
                                    '<div class="arrow">' +
                                        '<span class="close-btn {delegate_click}" title="\u5173\u95ed">close</span>' +
                                        '<span class="prev-btn {delegate_click}" title="\u4e0a\u6708">prev</span>' +
                                        '<span class="next-btn {delegate_click}" title="\u4e0b\u6708">next</span>' +
                                    '</div>' +
                                    '<div class="date-box">' +
                                        '{date_template}' +
                                    '</div>' +
                                '</div>' +
                            '</div>' +
                        '</div>',
                        
    DATE_TEMPLATE: '<div class="inner">' +
                        '<h4>' +
                            '{date}' +
                        '</h4>' +
                        '{table_template}' +
                    '</div>',
                    
    SELECT_TEMPLATE: '<select class="{delegate_change}">' +
                        '{year_template}' +
                     '</select>' +
                     '\u5e74' +
                     '<select class="{delegate_change}">' +
                        '{month_template}' +
                     '</select>' +
                     '\u6708',
                        
    TABLE_TEMPLATE: '<table>' +    
                        '<thead>' +
                            '<tr>' +
                                '{head_template}' +
                            '</tr>' +
                        '</thead>' +                        
                        '<tbody>' +
                            '{body_template}' +
                        '</tbody>' +                    
                    '</table>',
                    
    HEAD_TEMPLATE: '<th class="{weekend}">{weekday_name}</th>',
    
    BODY_TEMPLATE: '<tr>' +
                        '{calday_row}' +
                    '</tr>',
                    
    DAY_TEMPLATE: '<td data-date="{date}" class="{disabled}">' +
                        '<a href="javascript:;" class="{date_class}">' +
                            '{day}' +
                        '</a>' +                    
                    '</td>',
    
    INPUT_WRAP_TEMPLATE: '<div class="calendar-input-wrap" />',
    
    START_DATE_TEMPLATE: '<span class="calendar-start-icon {delegate_icon}" />',

    END_DATE_TEMPLATE: '<span class="calendar-end-icon {delegate_icon}" />',
     
    /**
     * 日期名字
     *
     * @property DATENAME
     * @type Object
     * @static
     */     
    DATENAME: {
        "today"   : "\u4eca\u5929",
        "yuandan" : "\u5143\u65e6",
        "chuxi"   : "\u9664\u5915",
        "chunjie" : "\u6625\u8282",
        "yuanxiao": "\u5143\u5bb5\u8282",
        "qingming": "\u6e05\u660e",
        "wuyi"    : "\u52b3\u52a8\u8282",
        "duanwu"  : "\u7aef\u5348\u8282",
        "zhongqiu": "\u4e2d\u79cb\u8282",
        "guoqing" : "\u56fd\u5e86\u8282"
    },

    /**
     * 节假日时间
     *
     * @property HOLIDAYS
     * @type Object
     * @static
     */
    HOLIDAYS: {
        yuandan : ["2012-01-01", "2013-01-01", "2014-01-01", "2015-01-01", "2016-01-01", "2017-01-01", "2018-01-01", "2019-01-01", "2020-01-01"],
        chuxi   : ["2012-01-22", "2013-02-09", "2014-01-30", "2015-02-18", "2016-02-07", "2017-01-27", "2018-02-15", "2019-02-04", "2020-01-24"],
        chunjie : ["2012-01-23", "2013-02-10", "2014-01-31", "2015-02-19", "2016-02-08", "2017-01-28", "2018-02-16", "2019-02-05", "2020-01-25"],
        yuanxiao: ["2012-02-06", "2013-02-24", "2014-2-14", "2015-03-05", "2016-02-22", "2017-02-11", "2018-03-02", "2019-02-19", "2020-02-8"],
        qingming: ["2012-04-04", "2013-04-04", "2014-04-05", "2015-04-05", "2016-04-04", "2017-04-04", "2018-04-05", "2019-04-05", "2020-04-04"],
        wuyi    : ["2012-05-01", "2013-05-01", "2014-05-01", "2015-05-01", "2016-05-01", "2017-05-01", "2018-05-01", "2019-05-01", "2020-05-01"],
        duanwu  : ["2012-06-23", "2013-06-12", "2014-06-02", "2015-06-20", "2016-06-09", "2017-05-30", "2018-06-18", "2019-06-07", "2020-06-25"],
        zhongqiu: ["2012-09-30", "2013-09-19", "2014-09-08", "2015-09-27", "2016-09-15", "2017-10-04", "2018-09-24", "2019-09-13", "2020-10-01"],
        guoqing : ["2012-10-01", "2013-10-01", "2014-10-01", "2015-10-01", "2016-10-01", "2017-10-01", "2018-10-01", "2019-10-01", "2020-10-01"]
    },

    /**
     * 日历组件标识
     *
     * @property NAME
     * @type String
     * @default 'TripCalendar'
     * @readOnly
     * @protected
     * @static
     */      
    NAME: 'TripCalendar',

    /**
     * 默认属性配置
     *
     * @property ATTRS
     * @type {Object}
     * @protected
     * @static
     */
    ATTRS: {

        /**
         * 日历唯一ID
         *
         * @attribute calendarId
         * @type {String}
         */
        calendarId: {
            readOnly: true
        },
    
        /**
         * 日历外容器
         *
         * @attribute boundingBox
         * @type {Node}
         */
        boundingBox: {
            readOnly: true
        },
        
        /**
         * 日历初始日期
         *
         * @attribute date
         * @type {Date|String}
         * @default new Date()
         */ 
        date: {
            value: new Date(),
            setter: function(v) {
                if(!L.isDate(v)) {
                    v = RDATE.test(v) ? v : new Date();
                }
                return v;
            },
            getter: function(v) {
                if(L.isDate(v)) return v;
                if(L.isString(v)) {
                    v = v.split(REG);
                    return new Date(v[0], v[1] - 1);    
                }
            }
        },
        
        /**
         * 日历个数
         *
         * @attribute count
         * @type {Number}
         * @default 2
         */         
        count: {
            value: 2,
            getter: function(v) {
                if(this.get('isSelect')) v = 1;
                return v;
            }
        },
        
        /**
         * 选择的日期
         *
         * @attribute selectedDate
         * @type {String}
         * @default ''
         */         
        selectedDate: {
            value: null,
            setter: function(v) {
                if(L.isDate(v)) {
                    v = this._toStringDate(v);
                }
                return RDATE.test(v) ? v : null;
            },
            getter: function(v) {
                if(L.isString(v)) {
                    v = v.split(REG);
                    v = v[0] + '-' + this._filled(v[1]) + '-' + this._filled(v[2]);
                }
                return v || '';
            }
        },
        
        /**
         * 允许操作的最小日期
         *
         * @attribute minDate
         * @type {Date|String}
         * @default null
         */         
        minDate: {
            value: null,
            setter: function(v) {
                if(L.isDate(v)) {
                    v = this._toStringDate(v);
                }
                return RDATE.test(v) ? v : null;
            },
            getter: function(v) {
                if(L.isString(v)) {
                    v = v.split(REG);
                    v = v[0] + '-' + this._filled(v[1]) + '-' + this._filled(v[2]);
                }
                return v || '';
            }
        },
        
        /**
         * 允许操作的最大日期
         *
         * @attribute maxDate
         * @type {Date|String}
         * @default null
         */         
        maxDate: {
            value: null,
            setter: function(v) {
                if(L.isDate(v)) {
                    v = this._toStringDate(v);
                }
                return RDATE.test(v) ? v : null;
            },
            getter: function(v) {
                if(L.isString(v)) {
                    v = v.split(REG);
                    v = v[0] + '-' + this._filled(v[1]) + '-' + this._filled(v[2]);
                    return v;
                }
                if(this.get('afterDays')) {
                    var oDate = this.get('minDate').split(REG);
                    v = new Date(oDate[0], oDate[1] - 1, oDate[2] * 1 + this.get('afterDays') * 1 - 1);
                    v = this._toStringDate(v);
                    return v;
                }           
                return v || '';
            }
        },
        
        /**
         * 开始时间
         *
         * @attribute startDate
         * @type {String}
         * @default ''
         */     
        startDate: {
            value: ''
        },
        
        /**
         * 结束时间
         *
         * @attribute endDate
         * @type {String}
         * @default ''
         */ 
        endDate: {
            value: ''
        },
        
        /**
         * 等价于设置minDate和maxDate，minDate未设置时取当前日期
         *
         * @attribute afterDays
         * @type {Number}
         * @default 0
         */     
        afterDays: {
            value: 0,
            getter: function(v) {
                v && (this.get('minDate') || this.set('minDate', new Date()));
                return v;
            }
        },
        
        /**
         * 提示信息
         *
         * @attribute message
         * @type {String}
         * @default ''
         */         
        message: {
            value: ''
        },

        /**
         * 触发节点，支持批量设置，用半角逗号分隔。弹出式日历必选配置。例('#ID, .className, ...')
         *
         * @attribute triggerNode
         * @type {String}
         * @default ''
         */         
        triggerNode: {
            value: '',
            getter: function(v) {
                if(/\,/.test(v)) {
                    v = v.replace(/\s+/g, '');
                    v = v.split(new RegExp('\\s+' + v + '+\\s', 'g'));
                    v = v.join().replace(/^,+|,+$/g, '');
                }
                return v       
            }
        },
        
        /**
         * 最后触发节点，用于选择起始时间和结束时间互动，支持批量设置，用半角逗号分隔。例('#ID, .className, ...')
         *
         * @attribute finalTriggerNode
         * @type {String}
         * @default ''
         */         
        finalTriggerNode: {
            value: '',
            getter: function(v) {
                if(/\,/.test(v)) {
                    v = v.replace(/\s+/g, '');
                    v = v.split(new RegExp('\\s+' + v + '+\\s', 'g'));
                    v = v.join().replace(/^,+|,+$/g, '');
                }
                return v       
            }        
        },
        
        /**
         * 放置日历的容器。非弹出式日历必选配置
         *
         * @attribute container
         * @type {String}
         * @default null
         */
        container: {
            value: null,
            getter: function(v) {
                if(/\,/.test(v)) {
                    v = v.replace(/\s+/g, '');
                    v = v.split(new RegExp('\\s+' + v + '+\\s', 'g'));
                    v = v.join().replace(/^,+|,+$/g, '');
                }
                return v            
            }
        },
        
        /**
         * 是否开启下拉列表选择日期
         *
         * @attribute isSelect
         * @type {Boole}
         * @default false
         */         
        isSelect: {
            value: false
        },  
        
        /**
         * 是否开启键盘输入关联
         *
         * @attribute isKeyup
         * @type {Boole}
         * @default true
         */         
        isKeyup: {
            value: true
        },        
        
        /**
         * 是否显示日期信息
         *
         * @attribute isDateInfo
         * @type {Boole}
         * @default true
         */         
        isDateInfo: {
            value: true
        },
        
        /**
         * 是否显示日期图标
         *
         * @attribute isDateIcon
         * @type {Boole}
         * @default true
         */         
        isDateIcon: {
            value: true
        },        

        /**
         * 是否显示节假日信息
         *
         * @attribute isHoliday
         * @type {Boole}
         * @default true
         */         
        isHoliday: {
            value: true,
            setter: function(v) {
                if(!v) this._dateMap = null;
                return v;
            }
        },
        
        /**
         * 是否自动切换到结束时间
         *
         * @attribute isAutoSwitch
         * @type {Boole}
         * @default false
         */
        isAutoSwitch: {
            value: false
        }
    }
});

}, '1.0', {requires: ['node', 'base-base', 'event-focus', 'event-mouseenter', 'event-outside']});