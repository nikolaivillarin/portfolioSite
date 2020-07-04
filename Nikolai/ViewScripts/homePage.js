function HomePage() {
    /// <summary>
    /// Home page default constructor
    /// </summary>
    this.$Element = $('#home');
    this.$ElementOnboarding = $('#pnlNavOnboarding');
    this.$Canvas = $('#heroImageCanvas');

    this.Initialize();
}

HomePage.prototype = {
    $Element: null
    , $ElementOnboarding: null
    , $Canvas: null
    , BubbleCanvas: null
    , DialJiggleIntervalID: 0
    , MicroInteraction: null
    , PageDisable: true
};

HomePage.prototype.Initialize = function () {
    window.MainNav.SubscribeToOnPageChange(
        $.proxy(this.OnPageChange, this)
    );

    this.MicroInteraction = new window.MicroInteraction('home');

    this.SetupCanvas();

    this.DisableCanvas();
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

HomePage.prototype.OnPageChange = function (pageId, previousPageId) {
    /// <summary>
    /// Function which is called when page is changed
    /// </summary>
    if (pageId && pageId === 'home' &&
        this.$Element.width() > 0 &&
        previousPageId && previousPageId === 'work') {
        this.EnableCanvas();

        this.EnableDialJiggle();

        this.PageDisable = false;

        this.MicroInteraction.TriggerAnimation(
            'right',
            this.$Element
        );

        this.$ElementOnboarding.addClass('in-view');
    } else if (pageId && pageId === 'home' && this.$Element.width() > 0) {
        this.EnableCanvas();

        this.EnableDialJiggle();

        this.PageDisable = false;

        this.MicroInteraction.TriggerAnimation(
            'up',
            this.$Element
        );

        this.$ElementOnboarding.addClass('in-view');
    } else {
        this.DisableCanvas();

        this.DisableDialJiggle();

        if (this.PageDisable === false) {
            this.MicroInteraction.ResetAnimation();

            this.$ElementOnboarding.removeClass('in-view');

            this.PageDisable = true;
        }
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