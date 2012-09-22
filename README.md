#淘宝旅行通用日历组件

####基于YUI3开发的价格日历组件

	@name：Y.TripCalendar
	@requires：['node', 'base-base', 'event-focus', 'event-mouseenter', 'event-outside']
	
##快速上手

####引入文件

在页面head引入YUI3.x.x种子

`<script src="http://yui.yahooapis.com/3.5.1/build/yui/yui-min.js"></script>`

####配置

```
var config = {
    modules: {
        'trip-calendar': {
            fullpath: 'trip-calendar.js', //根据项目路径调整
            type    : 'js',
            requires: ['trip-calendar-css']
        },
        'trip-calendar-css': {
            fullpath: 'trip-calendar.css', //根据项目路径调整
            type    : 'css'
        }
    }
};
```

####使用

```
YUI(config).use('trip-calendar', function(Y) {
    var oCalendar = new Y.TripCalendar();    
    //do something
});
```

##配置参数

* ####date

	> **概述**
	> 
	> *(默认值：当前日期) 日历初始日期*
	>
	> **类型**
	>
	> `{Date|String}`

* ####count

	> **概述**
	>
	> *(默认值：2) 日历个数*
	>
	> **类型**
	>
	> `{Number}`
	
* ####selectDate

	> **概述**
	>
	> *(默认值：空) 选择的日期*
	>
	> **类型**
	>
	> `{String}`
	
* ####minDate

	> **概述**
	>
	> *(默认值：null) 允许操作的最小日期*
	>
	> **类型**
	>
	> `{Date|String}`
	
* ####maxDate

	> **概述**
	>
	> *(默认值：null) 允许操作的最大日期*
	>
	> **类型**
	>
	> `{Date|String}`
	
* ####startDate

	> **概述**
	>
	> *(默认值：空) 开始时间*
	>
	> **类型**
	>
	> `{String}`
	
* ####endDate

	> **概述**
	>
	> *(默认值：空) 结束时间*
	>
	> **类型**
	>
	> `{String}`
	
* ####afterDays

	> **概述**
	>
	> *(默认值：0) 等价于设置minDate和maxDate，minDate未设置时取当前日期*
	>
	> **类型**
	>
	> `{Number}`
	
* ####message

	> **概述**
	>
	> *(默认值：空) 提示信息*
	>
	> **类型**
	>
	> `{String}`
	
* ####triggerNode

	> **概述**
	>
	> *(默认值：空) 触发节点，支持批量设置，用半角逗号分隔。弹出式日历必选配置。例('#ID, .className, ...')*
	>
	> **类型**
	>
	> `{String}`

* ####finalTriggerNode

	> **概述**
	>
	> *(默认值：空) 最后触发节点，用于选择起始时间和结束时间互动，支持批量设置，用半角逗号分隔。例('#ID, .className, ...')*
	>
	> **类型**
	>
	> `{String}`
	
* ####container

	> **概述**
	>
	> *(默认值：空) 放置日历的容器。非弹出式日历必选配置*
	>
	> **类型**
	>
	> `{String}`

* ####isSelect

	> **概述**
	>
	> *(默认值：false) 是否开启下拉列表选择日期，如果开启，日历个数限制为1*
	>
	> **类型**
	>
	> `{Boole}`
	
* ####isDateInfo

	> **概述**
	>
	> *(默认值：true) 是否显示日期信息*
	>
	> **类型**
	>
	> `{Boole}`

* ####isDateIcon

	> **概述**
	>
	> *(默认值：true) 是否显示日期图标*
	>
	> **类型**
	>
	> `{Boole}`

* ####isHoliday

	> **概述**
	>
	> *(默认值：true) 是否显示节假日信息*
	>
	> **类型**
	>
	> `{Boole}`

* ####isAutoSwitch

	> **概述**
	>
	> *(默认值：false) 是否自动切换到结束时间*
	>
	> **类型**
	>
	> `{Boole}`
	
##接口
	
* ####`render()`

	> **概述**
	>
	> *用于设置参数后渲染日历UI*
	>
	> **返回值**
	>
	> *日历对象，可做链式操作*
	
* ####`prevMonth()`

	> **概述**
	>
	> *渲染上月日历UI*
	>
	> **返回值**
	>
	> *日历对象，可做链式操作*
	
* ####`nextMonth()`

	> **概述**
	>
	> *渲染下月日历UI*
	>
	> **返回值**
	>
	> *日历对象，可做链式操作*
	
* ####`show()`

	> **概述**
	>
	> *显示日历*
	>
	> **返回值**
	>
	> *日历对象，可做链式操作*
	
* ####`hide()`

	> **概述**
	>
	> *隐藏日历*
	>
	> **返回值**
	>
	> *日历对象，可做链式操作*
	
* ####`showMessage()`

	> **概述**
	>
	> *显示提示信息*
	>
	> **返回值**
	>
	> *日历对象，可做链式操作*
	
* ####`hideMessage()`

	> **概述**
	>
	> *隐藏提示信息*
	>
	> **返回值**
	>
	> *日历对象，可做链式操作*
	
* ####`getSelectedDate()`

	> **概述**
	>
	> *获取选择的日期*
	>
	> **返回值**
	>
	> *`{String}`日期字符串*

* ####`getCurrentNode()`

	> **概述**
	>
	> *获取当前触发元素节点*
	>
	> **返回值**
	>
	> *`{Node}`节点对象*

* ####`getDateInfo()`

	> **概述**
	>
	> *获获取指定日期相关信息*
	>
	> **返回值**
	>
	> *`{String}`日期信息*
	>
	> **示例**
	
	```
	var oCalendar = new Y.TripCalendar();
    	oCalendar.getDateInfo('2012-05-01'); //劳动节
	```

* ####`syncUI()`

	> **概述**
	>
	> *同步UI，主要用于动态创建触发元素后使用*
	>
	> **返回值**
	>
	> *`{String}`日期信息*
	>
	> **示例**
	
	```
	var oCalendar = new Y.TripCalendar({
	    triggerNode: '.J_Item' //触发元素
	});
	//动态创建一个触发元素
	Y.one('body').append('<input type="text" class=".J_Item" />');
	//让新创建的触发元素可以触发日历
	oCalendar.syncUI();
	```

##自定义事件

* ####render

	> **概述**
	>
	> *渲染日历UI事件*
	>
	> **示例**
	
	```
	var oCalendar = new Y.TripCalendar();
    	oCalendar.on('render', function(e) {
        	//do something
    	});
	```
	
* ####show

	> **概述**
	>
	> *显示日历事件*
	>
	> **示例**
	
	```
	var oCalendar = new Y.TripCalendar();
    	oCalendar.on('show', function(e) {
        	//do something
    	});
	```
	
* ####hide

	> **概述**
	>
	> *隐藏日历事件*
	>
	> **示例**
	
	```
	var oCalendar = new Y.TripCalendar();
    	oCalendar.on('hide', function(e) {
        	//do something
    	});
	```

* ####prevmonth

	> **概述**
	>
	> *点击上月按钮事件*
	>
	> **示例**
	
	```
	var oCalendar = new Y.TripCalendar();
    	oCalendar.on('prevmonth', function(e) {
        	//do something
    	});
	```

* ####nextmonth

	> **概述**
	>
	> *点击下月按钮事件*
	>
	> **示例**
	
	```
	var oCalendar = new Y.TripCalendar();
    	oCalendar.on('nextmonth', function(e) {
        	//do something
    	});
	```

* ####dateclick

	> **概述**
	>
	> *日期点击事件*
	>
	> **参数**
	>
	> **{Object} 包含属性date(当前选择日期)，dateInfo(当前选择日期的日期信息)**
	>
	> **示例**
	
	```
	var oCalendar = new Y.TripCalendar();
    	oCalendar.on('dateclick', function(e) {
        	console.log(e.date);//当前选择日期
        	console.log(e.dateInfo);//当前选择日期的日期信息
        	//do something
    	});
    ```

* ####showmessage

	> **概述**
	>
	> *显示提示信息事件*
	>
	> **示例**
	
	```
	var oCalendar = new Y.TripCalendar();
    	oCalendar.on('showmessage', function(e) {
        	//do something
    	});
	```

* ####hidemessage

	> **概述**
	>
	> *隐藏提示信息事件*
	>
	> **示例**
	
	```
	var oCalendar = new Y.TripCalendar();
    	oCalendar.on('hidemessage', function(e) {
        	//do something
    	});
	```

##配置参数改变事件

* ####dateChange

	> **概述**
	>
	> *设置`date`参数触发事件*
	>
	> **示例**
	
	```
	var oCalendar = new Y.TripCalendar();
    	oCalendar.on('dateChange', function(e) {
        	//do something
    	});
	```
	> **注释**
	>
	> 已为此事件绑定render方法，在设置属性后无需再次调用render方法

* ####countChange

	> **概述**
	>
	> *设置`count`参数触发事件*
	>
	> **示例**
	
	```
	var oCalendar = new Y.TripCalendar();
    	oCalendar.on('countChange', function(e) {
        	//do something
    	});
	```
	
* ####selectedDateChange

	> **概述**
	>
	> *设置`selectDate`参数触发事件*
	>
	> **示例**
	
	```
	var oCalendar = new Y.TripCalendar();
    	oCalendar.on('selectedDateChange', function(e) {
        	//do something
    	});
	```
	
* ####minDateChange

	> **概述**
	>
	> *设置`minDate`参数触发事件*
	>
	> **示例**
	
	```
	var oCalendar = new Y.TripCalendar();
    	oCalendar.on('minDateChange', function(e) {
        	//do something
    	});
	```

* ####maxDateChange

	> **概述**
	>
	> *设置`maxDate`参数触发事件*
	>
	> **示例**
	
	```
	var oCalendar = new Y.TripCalendar();
    	oCalendar.on('maxDateChange', function(e) {
        	//do something
    	});
	```

* ####startDateChange

	> **概述**
	>
	> *设置`startDate`参数触发事件*
	>
	> **示例**
	
	```
	var oCalendar = new Y.TripCalendar();
    	oCalendar.on('startDateChange', function(e) {
        	//do something
    	});
	```

* ####endDateChange

	> **概述**
	>
	> *设置`endDate`参数触发事件*
	>
	> **示例**
	
	```
	var oCalendar = new Y.TripCalendar();
    	oCalendar.on('endDateChange', function(e) {
        	//do something
    	});
	```

* ####afterDaysChange

	> **概述**
	>
	> *设置`afterDays`参数触发事件*
	>
	> **示例**
	
	```
	var oCalendar = new Y.TripCalendar();
    	oCalendar.on('afterDaysChange', function(e) {
        	//do something
    	});
	```
	
* ####messageChange

	> **概述**
	>
	> *设置`message`参数触发事件*
	>
	> **示例**
	
	```
	var oCalendar = new Y.TripCalendar();
    	oCalendar.on('messageChange', function(e) {
        	//do something
    	});
	```
	
* ####isSelectChange

	> **概述**
	>
	> *设置`isSelect`参数触发事件*
	>
	> **示例**
	
	```
	var oCalendar = new Y.TripCalendar();
    	oCalendar.on('isSelectChange', function(e) {
        	//do something
    	});
	```
	
* ####isDateInfoChange

	> **概述**
	>
	> *设置`isDateInfo`参数触发事件*
	>
	> **示例**
	
	```
	var oCalendar = new Y.TripCalendar();
    	oCalendar.on('isDateInfoChange', function(e) {
        	//do something
    	});
	```
	
* ####isHolidayChange

	> **概述**
	>
	> *设置`isHoliday`参数触发事件*
	>
	> **示例**
	
	```
	var oCalendar = new Y.TripCalendar();
    	oCalendar.on('isHolidayChange', function(e) {
        	//do something
    	});
	```
	
* ####isAutoSwitchChange

	> **概述**
	>
	> *设置`isAutoSwitch`参数触发事件*
	>
	> **示例**
	
	```
	var oCalendar = new Y.TripCalendar();
    	oCalendar.on('isAutoSwitchChange', function(e) {
        	//do something
    	});
	```