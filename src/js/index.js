window.onload = function () {
    // remAdaptive();
    preventDefault(); //取消默认行为
    preventMistakeTouch(); //防止误触处理
    topMenu(); //顶部菜单显示隐藏
    searchInput(); //搜索框
    topNavbar(); //顶部导航条
    dragPage();

    /*防止误触，为a标签添加一个isMove属性*/
    function preventMistakeTouch() {
        var aEles = document.getElementsByTagName("a");
        for (var i = 0; i < aEles.length; i++) {
            var aEle = aEles[i];

            var startX = 0;
            var moveX = 0;
            aEle.addEventListener('touchstart', function (ev) {
                ev = ev || event;
                this.isMove = false;
                startX = ev.changedTouches[0].clientX;
            });

            aEle.addEventListener('touchmove', function (ev) {
                ev = ev || event;
                moveX = ev.changedTouches[0].clientX;

                //移动长度大于3才说明移动了。
                if (Math.abs(moveX - startX) > 3) {
                    this.isMove = true;
                }
            });
        }
    }

    //页面滑动，滚动条
    function dragPage() {
        var contentEle = document.querySelector(".content");
        var contentWrapEle = document.querySelector(".contentWrap");
        var scrollbar = document.querySelector("#scrollBar");

        /*
         new IScroll('.content', {
         scrollbars: true,
         mousewheel: true,
         interactiveScrollbars: true,
         shrinkScrollbars: 'scale',
         fadeScrollbars: true
         });
         */

        var callback = {

        };

        //包裹元素 滚动元素 滚动条
        window.drag(contentEle, contentWrapEle, scrollbar);
    }

    //拖拽，竖直滚动
    function drag(wrapEle, scrollEle, scrollbarEle) {
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

            var time = Math.abs(speed) < 1 ? 0.3 : 1.5;

            var bezier = '';
            if (target > 0) {
                target = 0;
                //使用贝塞尔，制作出去再回来效果
                bezier = 'cubic-bezier(0,.71,.6,1.55) ';
            } else if (target < maxScrollH) {
                target = maxScrollH;
                bezier = 'cubic-bezier(0,.71,.6,1.55) ';
            }

            scrollEle.style.transition = time + 's ' + bezier;
            css(scrollEle, 'translateZ', '.1'); //3d
            css(scrollEle, 'translateY', target);

            scrollEle.addEventListener('transitionend', function () {
                scrollbarEle.style.opacity = '0';
            });
        })
    }

    /*导航条滑动*/
    function topNavbar() {
        var navbarEle = document.getElementById("navbar");
        var navbarListEle = document.getElementById("navbarList");

        //touchstart位置
        var startX = 0;
        //元素上一次已平移的长度
        var translatedX = 0;
        //touchmove位置
        var moveX = 0;
        //最大平移长度为ul宽减外层容器宽
        var maxTranslate = navbarEle.clientWidth - navbarListEle.offsetWidth;

        var lasttime = 0;
        var lastpoint = 0;
        var nowtime = 0;
        var nowpoint = 0;
        var distime = 0;
        var dispoint = 0;

        //touchstart事件
        navbarEle.addEventListener('touchstart', function (ev) {
            ev = ev || event;
            navbarListEle.style.transition = 'none';
            startX = ev.changedTouches[0].clientX;
            //已滑动长度
            translatedX = css(navbarListEle, 'translateX');

            lasttime = new Date().getTime();
            lastpoint = css(navbarListEle, 'translateX');
        });

        //touchmove事件
        navbarEle.addEventListener('touchmove', function (ev) {
            ev = ev || event;
            moveX = ev.changedTouches[0].clientX;

            //计算距离
            var disX = moveX - startX;

            //需要滑动总长度
            var translateX = disX + translatedX;

            nowtime = new Date().getTime();
            nowpoint = css(navbarListEle, 'translateX');
            /*计算一次滑动的时间和滑动距离差值*/
            distime = nowtime - lasttime;
            dispoint = nowpoint - lastpoint;
            lasttime = nowtime;
            lastpoint = nowpoint;

            //限制滑动范围
            var scale = 0;

            if (translateX > 0) {
                //计算比例，越往右滑比例越小scale系数要控制在0-1之间
                //得到一个0-1的数，此时translateX就是溢出的长度，即>0的长度
                scale = document.documentElement.clientWidth / (document.documentElement.clientWidth * 2 + translateX);

                //滑动长度：已滑动长度 + 本次手指滑动距离乘以比例奇数。这样手指越往右滑，导航条滑动的长度越短。
                translateX = translatedX + disX * scale;
            } else if (translateX < maxTranslate) {
                //右侧溢出
                var whiteSpace = maxTranslate - translateX;
                scale = document.documentElement.clientWidth / (document.documentElement.clientWidth * 2 + whiteSpace);
                translateX = translatedX + disX * scale;
            }

            //平移
            css(navbarListEle, 'translateX', translateX);
        });

        navbarEle.addEventListener('touchend', function () {
            //计算最后一次滑动手指的速度
            var speed = distime / dispoint;
            var target = css(navbarListEle, 'translateX') + speed * 220;
            if (target > 0) {
                target = 0
            } else if (target < maxTranslate) {
                target = maxTranslate;
            }

            //平移
            navbarListEle.style.transition = '.5s';
            css(navbarListEle, 'translateX', target);
        });

        /*导航条条目点击事件*/
        var aEles = document.querySelectorAll("#navbarList li a");
        navbarListEle.addEventListener('touchend', function (ev) {
            ev = ev || event;
            if (ev.target.nodeName.toUpperCase() === 'A') {
                /*只有没有触发移动才算是点击了a标签*/
                if (!ev.target.isMove) {
                    for (var i = 0; i < aEles.length; i++) {
                        aEles[i].className = "";
                    }
                    ev.target.className = 'active';
                }
            }
        });
    }

    /*顶部搜索框聚焦离焦*/
    function searchInput() {
        var searchBoxEle = document.getElementById("searchBox");

        //点击顶部输入框，聚焦，可输入
        searchBoxEle.addEventListener('touchstart', function (ev) {
            ev = ev || event;
            this.focus();
            ev.stopPropagation();
        });

        /*触摸页面搜索框离焦*/
        document.addEventListener('touchstart', function () {
            searchBoxEle.blur();
        });
    }

    /*顶部菜单显示隐藏*/
    function topMenu() {
        var menuBtnEle = document.getElementById("menuBtn");
        var menuMaskEle = document.getElementById("menuMask");

        //页面touchstart时隐藏menu
        document.addEventListener('touchstart', function () {
            //隐藏菜单
            menuBtnEle.className = 'hide-menuMask';
            menuMaskEle.style.display = 'none';
        });

        //顶部菜单按钮触摸事件
        menuBtnEle.addEventListener('touchstart', function (ev) {
            ev = ev || event;
            if (this.className == 'show-menuMask') {
                this.className = 'hide-menuMask';
                menuMaskEle.style.display = 'none';
            } else if (this.className == 'hide-menuMask') {
                this.className = 'show-menuMask';
                menuMaskEle.style.display = 'block';
            }
            /*取消事件冒泡，访问事件传递到document的touchstart事件*/
            ev.stopPropagation();
        });

        //触摸菜单遮罩时，阻止事件冒泡到document，为了不触发document的touchstart事件，把遮罩隐藏。
        menuMaskEle.addEventListener('touchstart', function (ev) {
            ev = ev || event;
            ev.stopPropagation();
        })
    }

    //取消页面默认行为（滚动条，橡皮筋效果，a链接跳转）
    function preventDefault() {
        //超级隐患：所有行为都被禁止了（输入框聚焦、滚动条...）
        document.addEventListener('touchstart', function (ev) {
            ev = ev || event;
            ev.preventDefault();
        });
    }

    //rem适配，设置布局视口宽度为物理像素数量，解决1px问题。
    function remAdaptive() {
        //像素比
        var dpr = window.devicePixelRatio || 1;
        var cw = document.documentElement.clientWidth * dpr;

        //创建style标签，设置html字体大小
        var styleEle = document.createElement('style');
        styleEle.innerText = 'html{font-size:' + (cw / 16) + 'px!important}';
        document.head.appendChild(styleEle);

        //设置缩放比例
        var scale = 1 / dpr;
        var metaEle = document.querySelector("meta[name=viewport]");
        metaEle.content = 'width=device-width,initial-scale=' + scale + ',user-scalable=no';
    }
};