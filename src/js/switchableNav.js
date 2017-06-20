/*
 * 可切换选项卡
 */
(function () {
    var videoLists = document.querySelectorAll(".video-list");
    var videoListW = videoLists[0].offsetWidth;
    var screenW = document.documentElement.clientWidth;

    /*为每个ul绑定相应事件*/
    for (var i = 0; i < videoLists.length; i++) {
        move(videoLists[i]);
    }

    /*手指触摸*/
    function move(videoList) {
        var startPoint = {x: 0, y: 0};
        var movePoint = {x: 0, y: 0};
        var dis = {x: 0, y: 0};

        var curIndex = 0; //当前nav索引
        var isFirst = true; //第一次
        var isY = false; //默认不是垂直滑动

        videoList.addEventListener('touchstart', function (ev) {
            ev = ev || event;
            this.style.transition = 'none';
            isFirst = true;
            isY = false;
            startPoint.x = ev.changedTouches[0].clientX;
            startPoint.y = ev.changedTouches[0].clientY;
        });

        videoList.addEventListener('touchmove', function (ev) {
            //如果第一次是垂直滑动，则不再让ul滑动
            if (isY) {
                return;
            }

            ev = ev || event;
            movePoint.x = ev.changedTouches[0].clientX;
            movePoint.y = ev.changedTouches[0].clientY;
            dis.x = movePoint.x - startPoint.x;
            dis.y = movePoint.y - startPoint.y;

            //垂直滑动防抖动处理。
            if (isFirst) {
                isFirst = false;
                //获取第一次滑动方向
                if (Math.abs(dis.y) > Math.abs(dis.x)) {
                    isY = true;
                    return;
                }
            }

            //实时移动ul
            css(this, 'translateZ', .1); //开启3d加速
            css(this, 'translateX', dis.x);
        });

        videoList.addEventListener('touchend', function () {
            end.bind(this)(videoList);
        });

        /*手指松开*/
        function end(videoList) {
            //loading元素
            var loadingEle = this.parentNode.querySelector('.loading');
            //所有导航条目
            var navItemEles = this.parentNode.parentNode.querySelectorAll('.videoTab-tabs a');
            //绿色下划线
            var undelineEle = this.parentNode.parentNode.querySelector('.videoTab-line');

            //滑动的距离小于一半，回到0
            if (Math.abs(dis.x) < videoListW / 2) {
                css(this, 'translateX', 0);
                this.style.transition = '.5s';
                return;
            }

            //接下来的逻辑，滑动距离大于一半

            //往左:1 往右:-1
            var dir = dis.x / Math.abs(dis.x);
            dis.x < 0 ? curIndex++ : curIndex--;

            //平移ul
            this.style.transition = '.5s';
            css(this, 'translateX', screenW * dir);

            /*索引越界处理*/
            if (curIndex < 0) {
                curIndex = navItemEles.length - 1;
            } else if (curIndex > navItemEles.length - 1) {
                curIndex = 0;
            }

            /*平移绿色下划线*/
            var offsetLeft = navItemEles[curIndex].offsetLeft;
            css(undelineEle, 'translateX', offsetLeft);

            //当过渡完毕，显示laoding
            this.addEventListener('transitionend', function () {
                //滑动长度小于一半不显示loading
                if (Math.abs(dis.x) < videoListW / 2) {
                    return;
                }
                loadingEle.style.opacity = '1';

                //定时器，模拟ajax
                setTimeout(function () {
                    loadingEle.style.opacity = '0';
                    videoList.style.transition = 'none';
                    css(videoList, 'translateX', 0);
                }, 1000);
            });
        }
    }
})();