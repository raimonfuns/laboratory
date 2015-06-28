define(['jquery', 'jqueryUI'], function ($, $UI) {
    function Window() {
        this.config = {
            width: 300,
            height: 150,
            title: "系统消息",
            content: "",
            text4AlertBtn: "确定",
            hasCloseBtn: false,
            hasMask : true,
            isDraggable: true,
            dragHandle: null,
            skinClassName: null,
            handle4AlertBtn: null,
            handle4CloseBtn: null
        }
    }

    Window.prototype = {
        alert: function (config) {
            var CONFIG = $.extend(this.config, config),
                boundingBox = $(
                    '<div class="window_boundingBox">' + 
                        '<div class="window_header">' + CONFIG.title + '</div>' +
                        '<div class="window_body">' + CONFIG.content + '</div>' +
                        '<div class="window_footer"><input class="window_alertBtn" type="button" value="' + CONFIG.text4AlertBtn + '"></div>' + 
                    '</div>'
                ),
                btn = boundingBox.find('.window_alertBtn');
                mask = null;
            if (CONFIG.hasMask) {
                mask = $('<div class="window_mask"></div>');
                mask.appendTo('body');
            }
            boundingBox.appendTo('body');
            btn.click(function () {
                CONFIG.handle4AlertBtn && CONFIG.handle4AlertBtn();
                boundingBox.remove();
                mask && mask.remove();
            });
            boundingBox.css({
                width: this.config.width + "px",
                height: this.config.height + "px",
                left: (this.config.x || ($(window).width() - this.config.width) / 2) + "px",
                top: (this.config.y || ($(window).height() - this.config.height) / 2) + "px"
            });
            if (CONFIG.hasCloseBtn) {
                var closeBtn = $('<span class="window_closeBtn">X</span>');
                closeBtn.appendTo(boundingBox);
                closeBtn.click(function () {
                    CONFIG.handle4CloseBtn && CONFIG.handle4CloseBtn();
                    boundingBox.remove();
                    mask && mask.remove();
                });
            }
            if (CONFIG.skinClassName) {
                boundingBox.addClass(CONFIG.skinClassName);
            }
            if (CONFIG.isDraggable) {
                if (CONFIG.dragHandle) {
                    boundingBox.draggable({handle: CONFIG.dragHandle});
                } else {
                    boundingBox.draggable();
                }
            }
        },
        confirm: function () {

        },
        prompt: function () {

        }
    }

    return {
        Window: Window
    }
});