(function(root, factory) {
    var api = factory(root.jQuery);

    if (typeof module !== "undefined" && module.exports)
        module.exports = api;
}(typeof globalThis !== "undefined" ? globalThis : this, function($) {
    function shouldShowFloatingHeader(scrollTop, offsetTop, elementHeight) {
        return (scrollTop > offsetTop) && (scrollTop < offsetTop + elementHeight);
    }

    function updateTH () {
        $(".persist-area").each(function() {
            var $el = $(this)
            ,   offset = $el.offset()
            ,   scrollTop = $(window).scrollTop()
            ,   $floatingHeader = $(".floatingHeader", this)
            ;
            if (shouldShowFloatingHeader(scrollTop, offset.top, $el.height()))
                $floatingHeader.css({ "visibility": "visible" });
            else
               $floatingHeader.css({ "visibility": "hidden" });
        });
    }

    function initStickyHeaders() {
        var $clonedHeaderRow;
        $(".persist-area").each(function() {
            $clonedHeaderRow = $(".persist-header", this);
            var widths = [];
            $clonedHeaderRow.find("td, th").each(function () {
                widths.push($(this).outerWidth());
            });
            $clonedHeaderRow
                .before($clonedHeaderRow.clone())
                .css("width", $clonedHeaderRow.width())
                .addClass("floatingHeader");
            $clonedHeaderRow.find("td, th").each(function () {
                $(this).css("width", widths.shift());
            });
        });
        $(window)
            .scroll(updateTH)
            .trigger("scroll");
    }

    if ($)
        $(initStickyHeaders);

    return {
        shouldShowFloatingHeader,
        updateTH,
        initStickyHeaders,
    };
}));
