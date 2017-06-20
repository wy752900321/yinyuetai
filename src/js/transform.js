(function (w) {
    w.css = function (node, type, val) {
        if (!node.transforms) {
            node.transforms = {};
        }
        if (arguments.length > 2) {
            // 写操作
            var text = "";
            node.transforms[type] = val;
            for (item in node.transforms) {
                //以单位分类
                switch (item) {
                    case "skewX":
                    case "skewY":
                    case "skew":
                    case "rotate":
                        text += item + "(" + node.transforms[item] + "deg) ";
                        break;
                    case "scale":
                    case "scaleX":
                    case "scaleY":
                        text += item + "(" + node.transforms[item] + ") ";
                        break;
                    case "translate":
                    case "translateX":
                    case "translateY":
                    case "translateZ":
                        text += item + "(" + node.transforms[item] + "px) ";
                        break;
                }
            }
            node.style.transform = node.style.webkitTransform = text;
        } else {
            //读操作
            val = node.transforms[type];
            if (typeof val == "undefined") {
                if (type == "scale" || type == "scaleX" || type == "scaleY") {
                    val = 1;
                } else {
                    val = 0;
                }
            }
            return val;
        }
    }
})(window);
