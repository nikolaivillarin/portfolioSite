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
    , BubbleCanvas: null
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
        this.BubbleCanvas = new window.BubbleCanvas('heroImageCanvas');
    }
};

HomePage.prototype.DisableCanvas = function () {
    /// <summary>
    /// Disables the Bokeh background
    /// </summary>
    this.BubbleCanvas.PauseAnimation();
};

HomePage.prototype.EnableCanvas = function () {
    /// <summary>
    /// Enables the Bokeh background
    /// </summary>
    this.BubbleCanvas.StartAnimation();
};

HomePage.prototype.OnPageChange = function (pageId) {
    /// <summary>
    /// Function which is called when page is changed
    /// </summary>
    if (pageId && pageId === 'home' && this.$Element.width() > 0) {
        this.EnableCanvas();

        this.EnableDialJiggle();

        $('#pnlNavOnboarding').addClass('in-view');
    } else {
        this.DisableCanvas();

        this.DisableDialJiggle();

        $('#pnlNavOnboarding').removeClass('in-view');
    }
};

HomePage.prototype.EnableDialJiggle = function () {
    /// <summary>
    /// Jiggles the navigation dial in intervals to 
    /// notify the user to drag the dial
    /// </summary>
    if (this.DialJiggleIntervalID === 0) {
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
(function LoadHomeScript() {
    if (window.MainNav && window.MainNav.HasNavigationLoaded === true) {
        new HomePage();
    } else if (window.MainNav) {
        window.MainNav.SubscribeToOnNavigationLoaded(function () {
            new HomePage();
        });
    } else {
        window.setTimeout(LoadHomeScript, 50);
    }
})();