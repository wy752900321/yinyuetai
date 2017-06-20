(function (w) {
    /*
     * t：当前次数
     * b：初始位置
     * c：结束位置与初始位置之间的差值（总长度）
     * d：总次数
     * s：回弹距离
     */
    var Tween = {
        Linear: function (t, b, c, d) {
            return c * t / d + b;
        },
        Back: function (t, b, c, d, s) {
            if (s == undefined) s = 1.70158;
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        Quad: function (t, b, c, d) {
            return -c * (t /= d) * (t - 2) + b;
        }
    };

    //拖拽，竖直滚动
    w.drag = function (wrapEle, scrollEle, scrollbarEle) {
        var scrollEleH = scrollEle.offsetHeight;
        var wrapEleH = wrapEle.clientHeight;
        //可滑动最大高度
        var maxScrollH = -(scrollEleH - wrapEleH);

        var ratio = wrapEleH / scrollEleH;
        scrollbarEle.style.height = wrapEleH * ratio + 'px';

        var startPoint = {x: 0, y: 0};
        var scrollEleMoved = 0;

        var isFirst = true;
        var isX = false;
        var lastTime = 0;
        var lastPoint = 0;
        var disTime = 1;  //避免为0，点击没有触发move事件，导致计算速度时结果为NaN
        var disPoint = 0;

        wrapEle.addEventListener('touchstart', function (ev) {
            isFirst = true;
            isX = false;
            scrollEle.style.transition = 'none';
            clearInterval(wrapEle.clearTime);
            ev = ev || event;

            startPoint.y = ev.changedTouches[0].clientY;
            startPoint.x = ev.changedTouches[0].clientX;
            scrollEleMoved = css(scrollEle, 'translateY');

            lastTime = new Date().getTime();
            lastPoint = css(scrollEle, 'translateY');

            disPoint = 0; //清除速度
        });

        wrapEle.addEventListener('touchmove', function (ev) {
            if (isX) {
                return;
            }

            scrollbarEle.style.opacity = '1';
            ev = ev || event;
            var movePointY = ev.changedTouches[0].clientY;
            var movePointX = ev.changedTouches[0].clientX;
            var disY = movePointY - startPoint.y;
            var disX = movePointX - startPoint.x;
            var translateY = disY + scrollEleMoved;

            if (isFirst) {
                isFirst = false;
                if (Math.abs(disX) > Math.abs(disY)) {
                    isX = true;
                    return;
                }
            }

            var scale = 0;
            if (translateY > 0) {
                //超出区域高度：translateY

                //得到一个0-1的系数，并且越来越小
                scale = wrapEleH / (wrapEleH * 1.5 + translateY );
                //让每次滑动距离越来越小
                translateY = scrollEleMoved + disY * scale;

            } else if (translateY < maxScrollH) {
                //超出区域高度
                var spillDis = maxScrollH - translateY;

                scale = wrapEleH / (wrapEleH * 1.5 + spillDis );
                translateY = scrollEleMoved + disY * scale;
            }

            css(scrollEle, 'translateY', translateY);
            css(scrollEle, 'translateZ', '.1');

            css(scrollbarEle, 'translateY', -(translateY * ratio));
            css(scrollbarEle, 'translateZ', '.1');

            var nowTime = new Date().getTime();
            var nowPoint = css(scrollEle, 'translateY');
            disTime = nowTime - lastTime;
            disPoint = nowPoint - lastPoint;

            lastTime = nowTime;
            lastPoint = nowPoint;
        });

        wrapEle.addEventListener('touchend', function () {
            //最后一次滑动的速度
            var speed = disPoint / disTime;

            //元素已平移长度。加上最后一次滑动速度乘基数
            var target = css(scrollEle, 'translateY') + speed * 400;
            // var target = css(scrollEle, 'translateY');

            var time = Math.abs(speed) < 2 ? .4 : 1.5;

            // var bezier = '';
            var type = 'Quad';

            if (target > 0) {
                target = 0;
                type = 'Back';
                //使用贝塞尔，制作出去再回来效果
                // bezier = 'cubic-bezier(0,.71,.6,1.55) ';
            } else if (target < maxScrollH) {
                target = maxScrollH;
                type = 'Back';
                // bezier = 'cubic-bezier(0,.71,.6,1.55) ';
            }

            /*
             scrollEle.style.transition = time + 's ' + bezier;
             css(scrollEle, 'translateZ', '.1'); //3d
             css(scrollEle, 'translateY', target);
             scrollEle.addEventListener('transitionend', function () {
             scrollbarEle.style.opacity = '0';
             });
             */

            //使用tween加定时器过渡
            move(type, target, time);
        });

        //tween实现过渡
        function move(type, target, time) {
            //先清除在开启
            clearInterval(wrapEle.clearTime);
            var t = 0;
            var b = css(scrollEle, 'translateY');
            var c = target - b;
            var d = time / 0.02; // 总时间/每次执行时间 = 总次数
            var s = undefined;
            wrapEle.clearTime = setInterval(function () {
                /*
                 * t：当前次数
                 * b：初始位置
                 * c：结束位置与初始位置之间的差值（总长度）
                 * d：总次数
                 * s：回弹距离
                 */
                t++;
                if (t > d) {
                    clearInterval(wrapEle.clearTime);
                } else {
                    var point = Tween[type](t, b, c, d, s);
                    css(scrollEle, 'translateY', point);
                    css(scrollEle, 'translateZ', 0.1);
                }
            }, 20);
        }
    }
})(window);