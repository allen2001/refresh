// 封装refresh函数
var slide = function (option) {
	var defaults = {
		container: "",
		next: function () {}
	};
	var start,
		end,
		length,
		isLock = false,		// 是否锁定整个操作
		isCanDo = false,	// 是否移动滑块
		isTouchPad = (/hp-tablet/gi).test(navigator.appVersion),
		hasTouch = "ontouchstart" in window && !isTouchPad;

	var obj = document.querySelector(option.container);	// #content
	var loading = obj.querySelector(".loading");
	var offsetH = loading.clientHeight;
	var objParent = obj.parentElement; // .wrap

	// 操作方法对象
	var fn = {
		// 移动容器
		translate: function (diff) {
			obj.style.webkitTransform = "translate3d(0, " + diff + "px, 0)";
			obj.style.transform = "translate3d(0, " + diff + "px, 0)";
		},
		// 设置效果时间
		setTransition: function (time) {
			obj.style.webkitTransition = "all " + time + "s";
			obj.style.transition = "all " + time + "s";
		},
		// 返回到初始位置
		back: function () {
			fn.translate(0 - offsetH);
			// 标识操作完成
			isLock = false;
		},
		// 考虑兼容性封装事件监听
		addEvent: function (element, event_name, event_fn) {
			if (element.addEventListener) {
				element.addEventListener(event_name, event_fn, false);
			} else if (element.attachEvent) {
				element.attachEvent("on" + event_name, event_fn);
			} else {
				element["on" + event_name] = event_fn;
			}
		}
	};

	// init
	fn.translate(0 - offsetH);
	// 添加事件监听
	fn.addEvent(obj, "touchstart", start);
	fn.addEvent(obj, "touchmove", move);
	fn.addEvent(obj, "touchend", end);
	fn.addEvent(obj, "mousedown", start);
	fn.addEvent(obj, "mousemove", move);
	fn.addEvent(obj, "mouseup", end);

	// 滑动开始
	function start(ev) {
		if (document.body.scrollTop <= 0 && !isLock) {
			// 事件对象兼容性
			var even = (typeof event == "undefined") ? ev : event;
			// 标识操作进行中
			isLock = true;
			isCanDo = true;
			// 保存当前鼠标Y坐标
			start = hasTouch ? even.touches[0].pageY : even.pageY;
			// 消除滑块动画时间
			fn.setTransition(0);
			loading.innerHTML= "下拉刷新数据";
		}
	}
	// 滑动中
	function move(ev) {
		if (document.body.scrollTop <= 0 && isCanDo) {
			// 事件对象兼容性
			var even = (typeof event == "undefined") ? ev : event;
			// 保存当前鼠标Y坐标
			end = hasTouch ? even.touches[0].pageY : even.pageY;
			// 比较大小
			// console.log(start, end, offsetH);
			if (start < end) {
				// 取消鼠标拖拽默认事件
				even.preventDefault();
				// 消除滑块动画时间
				fn.setTransition(0);
				// 移动滑块
				if (end - start - offsetH > offsetH) {
					length = offsetH;
					fn.translate(length);
				} else {
					length = end - start - offsetH;
					fn.translate(length);
				}
			}
		}
	}
	// 滑动结束
	function end(ev) {
		if (isCanDo) {
			isCanDo = false;
			// 判断滑动距离是否大于等于指定值
			if (end - start - offsetH >= 0) {
				// 设置滑块回弹时间
				fn.setTransition(1);
				// 复位
				fn.translate(0);

				loading.innerHTML = "正在刷新数据";
				if (typeof option.next == "function") {
					option.next.call(fn, ev);
				}
			} else {
				fn.setTransition(1);
				fn.back();
			}
		}
	}
};
// 执行函数
slide({
	container: "#content",
	next: function (ev) {
		var that = this;	// fn
		setTimeout(function () {
			that.back();
		}, 2000);
	}
});