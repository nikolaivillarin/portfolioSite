/*------------------------------------*\
    Summary: Holds the functionality that depends on scroll event
\*------------------------------------*/
function ScrollAnimation(pageID, options) {
    /// <summary>
    /// By default scroll effect are disabled. You must call
    /// Enable to enable the effects
    /// </summary>
    /// <param name="pageID" type="string">
    /// ID of page that the scrolling effect will be applied to
    /// </param>
    /// <param name="options" type="Object">
    /// Options hash. Refer to Options property for available options
    /// </param>

    this.$pageElmt = $('#' + pageID);

    this.Options = $.extend(true, this.Options, options);

    if (this.$pageElmt.length === 0) {
        throw new Error('Page with ID of : ' + pageID + ' cannot be found.');
    }
}

ScrollAnimation.prototype = {
    $pageElmt: null
    // Used for scroll optimization
    , HasScrollTicked: false
    , IsEnabled: false
};

ScrollAnimation.prototype.Options = {
    EnableParallax: false
    , EnableScrollAnimation: true
};

ScrollAnimation.prototype.Enable = function () {
    /// <summary>
    /// Starts listening to the scrolling event
    /// </summary>
    if (this.IsEnabled === false) {
        this.$pageElmt.on('scroll',
            $.proxy(this.PageScrolled, this)
        );

        this.IsEnabled = true;

        this.PageScrolled();
    }
};

ScrollAnimation.prototype.Disable = function () {
    /// <summary>
    /// Stops listening to the scrolling event
    /// </summary>
    if (this.IsEnabled === true) {
        this.$pageElmt.off('scroll',
            $.proxy(this.PageScrolled, this)
        );

        this.IsEnabled = false;

        this.PageScrolled();
    }
};

ScrollAnimation.prototype.PageScrolled = function () {
    /// <summary>
    /// Scroll optimized.
    /// </summary>
    var that = this;

    if (this.IsBrowserIE() === true) {
        // Internet explorer background transition is not smooth
        // when using requestAnimationFrame
        this.PositionBackgroundImages();

        if (this.HasScrollTicked === false) {
            window.requestAnimationFrame(function () {
                that.TriggerScrollAnimation();

                that.HasScrollTicked = false;
            });
        }

        that.HasScrollTicked = true;
    } else {
        if (this.HasScrollTicked === false) {
            window.requestAnimationFrame(function () {
                that.PositionBackgroundImages();

                that.TriggerScrollAnimation();

                that.HasScrollTicked = false;
            });
        }

        that.HasScrollTicked = true;
    }
};

ScrollAnimation.prototype.IsBrowserIE = function () {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf("MSIE ");
    var edge = ua.indexOf("Edge ");

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./) || edge > 0) {
        return true;
    }
    else {
        return false;
    }
};

ScrollAnimation.prototype.PositionBackgroundImages = function () {
    /// <summary>
    /// Positions background image on scroll slower so that it produces the
    /// parallax effect
    /// </summary>
    if (this.Options.EnableParallax === false) {
        return;
    }

    var yOffset = this.$pageElmt.scrollTop();

    var backgroundYPos = (yOffset * 0.5) + 'px';

    var $parallaxImgs = $('[data-nv-parallaximg]', this.$pageElmt);

    $parallaxImgs.css('background-position-y', backgroundYPos);
};

ScrollAnimation.prototype.TriggerScrollAnimation = function () {
    /// <summary>
    /// Determines if elements with the data property data-nv-animate
    /// are in view. If they are an in-view class is added to the element
    /// which is used to trigger CSS animations
    /// </summary>
    if (this.Options.EnableScrollAnimation === false) {
        return;
    }

    var that = this;
    var windowHeight = this.$pageElmt.outerHeight();
    var windowTopPosition = this.$pageElmt.scrollTop();
    var windowBottomPosition = windowTopPosition + windowHeight - 10;

    var $animatedElmts = $('[data-nv-animate]', this.$pageElmt);

    $animatedElmts.each(function () {
        var elmtHeight = $(this).outerHeight();
        var elmtTopPosition = $(this).offset().top;
        var elmtBottomPosition = elmtTopPosition + elmtHeight;

        if (that.IsEnabled === true
            && elmtBottomPosition >= windowTopPosition
            && elmtTopPosition <= windowBottomPosition) {
            $(this).addClass('in-view');
        } else {
            $(this).removeClass('in-view');
        }
    });
};