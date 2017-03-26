function HomePage() {
    /// <summary>
    /// Home page default constructor
    /// </summary>
    this.$Element = $('#home');
    this.$Canvas = $('#heroImageCanvas');

    this.Initialize();
}

HomePage.prototype = {
    $Element: null
    , $Canvas: null
    , DialJiggleIntervalID: 0
};

HomePage.prototype.Initialize = function () {
    var selectedPage = window.MainNav.GetCurrentRoute().PageID;

    window.MainNav.SubscribeToOnPageChange(
        $.proxy(this.OnPageChange, this)
    );

    this.SetupCanvas();

    this.DisableCanvas();

    this.OnPageChange(selectedPage);
};

HomePage.prototype.SetupCanvas = function () {
    /// <summary>
    /// Set's up homepage Bokeh background 
    /// </summary>
    if (window.BubbleCanvas === null || window.BubbleCanvas === undefined) {
        throw new Error('Script BubbleCanvas is missing');
    } else {
        new window.BubbleCanvas('heroImageCanvas');
    }
};

HomePage.prototype.DisableCanvas = function () {
    /// <summary>
    /// Disables the Bokeh background
    /// </summary>
    if (this.$Element.hasClass('home-effect--disabled') === false) {
        this.$Element.addClass('home-effect--disabled');
        this.$Canvas.hide();
    }
};

HomePage.prototype.EnableCanvas = function () {
    /// <summary>
    /// Enables the Bokeh background
    /// </summary>
    if (this.$Element.hasClass('home-effect--disabled') === true) {
        this.$Element.removeClass('home-effect--disabled');
        this.$Canvas.show();
    }
};

HomePage.prototype.OnPageChange = function (pageId) {
    /// <summary>
    /// Function which is called when page is changed
    /// </summary>
    if (pageId && pageId === 'home' && this.$Element.width() > 0) {
        this.EnableCanvas();

        this.EnableDialJiggle();
    } else {
        this.DisableCanvas();

        this.DisableDialJiggle();
    }
};

HomePage.prototype.EnableDialJiggle = function () {
    /// <summary>
    /// Jiggles the navigation dial in intervals to 
    /// notify the user to drag the dial
    /// </summary>
    if (this.DialJiggleIntervalID === 0) {
        var that = this;

        this.DialJiggleIntervalID = window.setInterval(function () {
            window.MainNav.NavBar.DialControl.$Element.effect({
                effect: 'shake'
                , direction: 'right'
                , distance: 20
                , duration: 1000
                , times: 1
            });
        }, 10000);
    }
};

HomePage.prototype.DisableDialJiggle = function () {
    /// <summary>
    /// Disables dial jiggle
    /// </summary>
    if (this.DialJiggleIntervalID !== 0) {
        window.clearInterval(this.DialJiggleIntervalID);

        this.DialJiggleIntervalID = 0;
    }
};

// Initializer
$(function () {
    new HomePage();
});