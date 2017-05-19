function ScrollAnimation(pageID, options) {
    /// <summary>
    /// ScrollAnimation contains the different types of effect
    /// that depend on the scroll event. For instance, elements with 
    /// the [data-nv-animate] attribute will have an in-view class added
    /// when the element is in view. This class can be used to trigger CSS
    /// animations or transitions
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
    // Set to a value to increase the amount of scroll before
    // animation get's triggered
    , ScrollThresholdAdjustment: 0
    // Specifies that when element is out of view
    // the element will lose the in-view class
    , RevertWhenOutOfView: false
};

ScrollAnimation.prototype.Enable = function () {
    /// <summary>
    /// Starts listening to the scrolling event
    /// </summary>
    if (this.IsEnabled === false) {
        this.$pageElmt.on('scroll',
            $.proxy(this.PageScrolled, this)
        );

        $(window).on('resize',
            $.proxy(this.WindowResize, this)
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

        $(window).off('resize',
            $.proxy(this.WindowResize, this)
        );

        this.IsEnabled = false;

        this.PageScrolled();
    }
};

ScrollAnimation.prototype.WindowResize = function () {
    this.$pageElmt.trigger('scroll');
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
    var windowBottomPosition = windowTopPosition + windowHeight;

    var $animatedElmts = $('[data-nv-animate]', this.$pageElmt);

    $animatedElmts.each(function () {
        var elmtTopPosition = $(this).position().top;

        // Don't display the element until it is actually on screen
        var scrollThreshold = windowBottomPosition - ($(this).outerHeight())
            - that.Options.ScrollThresholdAdjustment;

        if (that.IsEnabled === true
            && elmtTopPosition <= scrollThreshold) {
            $(this).addClass('in-view');
        } else if (that.IsEnabled === false || that.Options.RevertWhenOutOfView === true) {
            $(this).removeClass('in-view');
        }
    });
};