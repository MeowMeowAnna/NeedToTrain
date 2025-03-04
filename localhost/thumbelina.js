;(function($) {
    $.fn.Thumbelina = function(settings) {
        var $container = this,
            $list = $('ul',this),
            moveDir = 0,
            pos = 0,
            destPos = 0,
            listDimension = 0,
            idle = 0,
            outerFunc,
            orientData;

        // Add thumblina CSS class, and create an inner wrapping container, within which the list will slide with overflow hidden.
        $list.addClass('thumbelina').wrap('<div style="position:absolute;overflow:hidden;width:100%;height:100%;">');
        settings = $.extend({}, $.fn.Thumbelina.defaults, settings);

        // Depending on vertical or horizontal, get functions to call and CSS attribute to change.
        orientData = {outerSizeFunc:  'outerWidth', cssAttr: 'left', display: 'inline-block'};

        // Apply display type of list items.
        $('li',$list).css({display: orientData.display});

        // Function to bind events to buttons.
        var bindButEvents = function($elem,dir) {
            $elem.bind('mousedown mouseup touchend touchstart',function(evt) {
                if (evt.type==='mouseup' || evt.type==='touchend') moveDir = 0;
                else moveDir = dir;
                return false;
            });
        };

        // Bind the events.
        bindButEvents(settings.$bwdBut,1);
        bindButEvents(settings.$fwdBut,-1);

        // Store ref to outerWidth() or outerHeight() function.
        outerFunc = orientData.outerSizeFunc;

        // Function to animate. Moves the list element inside the container.
        // Does various bounds checks.
        var animate = function() {
            var minPos;

            // If no movement or resize for 100 cycles, then go into 'idle' mode to save CPU.
            if (!moveDir && pos === destPos && listDimension === $container[outerFunc]() ) {
                idle++;
                if (idle>100) return;
            }else {
                // Make a note of current size for idle comparison next cycle.
                listDimension = $container[outerFunc]();
                idle = 0;
            }

            // Update destination pos.
            destPos += settings.maxSpeed * moveDir;

            // Work out minimum scroll position.
            // This will also cause the thumbs to drag back out again when increasing container size.
            minPos = listDimension - $list[outerFunc]();


            // Minimum pos should always be <= 0;
            if (minPos > 0) minPos = 0;
            // Bounds check (maximum advance i.e list moving left/up)
            if (destPos < minPos) destPos = minPos;
            // Bounds check (maximum retreat i.e list moving right/down)
            if (destPos>0) destPos = 0;

            // Disable/enable buttons depending min/max extents.
            if (destPos === minPos) settings.$fwdBut.addClass('disabled');
            else settings.$fwdBut.removeClass('disabled');
            if (destPos === 0) settings.$bwdBut.addClass('disabled');
            else settings.$bwdBut.removeClass('disabled');

            // Animate towards destination with a simple easing calculation.
            pos += (destPos - pos) / settings.easing;

            // If within 1000th of a pixel to dest, then just 'snap' to exact value.
            // Do this so pos will end up exactly == destPos (deals with rounding errors).
            if (Math.abs(destPos-pos)<0.001) pos = destPos;

            $list.css(orientData.cssAttr, Math.floor(pos));
        };

        setInterval(function(){
            animate();
        },100/60);
    };

    $.fn.Thumbelina.defaults = {
        orientation:    "horizontal",   // Orientation mode, horizontal or vertical.
        easing:         8,              // Amount of easing (min 1) larger = more drift.
        maxSpeed:       5,              // Max speed of movement (pixels per cycle).
        $bwdBut:   null,                // jQuery element used as backward button.
        $fwdBut:   null                // jQuery element used as forward button.
    };

})(jQuery);