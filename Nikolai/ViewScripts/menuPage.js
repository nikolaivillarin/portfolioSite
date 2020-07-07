function MenuPage() {
    /// <summary>
    /// Default Constructor
    /// </summary>
    this.$Element = $('#menu');

    this.Initialize();
}

MenuPage.prototype = {
    $Element: null
    , MicroInteraction: null
    , PageDisable: true
};

MenuPage.prototype.Initialize = function () {
    window.MainNav.SubscribeToOnPageChange(
        $.proxy(this.OnPageChange, this)
    );

    window.MainNav.SubscribeToOnPageChanging(
        $.proxy(this.OnPageChanging, this)
    );

    window.MainNav.SubscribeToDialClick(
        $.proxy(this.CloseMenuClick, this)
    );

    this.MicroInteraction = new window.MicroInteraction('menu');
};

MenuPage.prototype.CloseMenuClick = function (selectedPageId, previousPageId) {
    /// <summary>
    /// Event handler for the close button on the menu
    /// </summary>
    if (previousPageId === 'loading') {
        // Menu was the landing page, so the only previous page available is loading
        // page and we don't want to navigate back to that.
        previousPageId = 'Home';
    }

    if (selectedPageId === 'menu') {
        window.MainNav.NavigateTo('/' + previousPageId);
    }
};

MenuPage.prototype.OnPageChange = function (pageId, previousPageId) {
    /// <summary>
    /// Function which is called when page is changed
    /// </summary>

    // Make sure we don't try to highlight the menu page
    if (pageId !== this.$Element.attr('id').toLowerCase()) {
        $('li', this.$Element).removeClass('menu-links--selected');

        var $selectedLink = $('a', this.$Element).filter(function () {
            return $(this).attr('href').toLowerCase().indexOf(pageId) > -1;
        });

        $selectedLink.parent().addClass('menu-links--selected');
    }

    if (pageId && pageId === 'menu') {
        this.PageDisable = false;
    } else {
        if (this.PageDisable === false) {
            this.MicroInteraction.ResetAnimation();

            this.PageDisable = true;
        }
    }

    if (pageId && pageId === 'menu' &&
        previousPageId && previousPageId === 'loading') {
        // Coming from loading screen so OnPageChanging event handler would have
        // not been called since this was still initializing. So call it now to 
        // trigger animations.

        this.OnPageChanging(pageId);
    }
};

MenuPage.prototype.OnPageChanging = function (pageId) {
    if (pageId && pageId === 'menu') {
        this.MicroInteraction.TriggerAnimation(
            'up',
            this.$Element
        );
    }
};

// Initializer
(function LoadMenuScript() {
    if (window.MainNav && window.MainNav.HasNavigationLoaded === true) {
        new MenuPage();
    } else if (window.MainNav) {
        window.MainNav.SubscribeToOnNavigationLoaded(function () {
            new MenuPage();
        });
    } else {
        window.setTimeout(LoadMenuScript, 50);
    }
})();