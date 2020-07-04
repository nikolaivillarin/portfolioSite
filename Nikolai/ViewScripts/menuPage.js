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

MenuPage.prototype.OnPageChange = function (selectedPageId) {
    /// <summary>
    /// Function which is called when page is changed
    /// </summary>

    // Make sure we don't try to highlight the menu page
    if (selectedPageId !== this.$Element.attr('id').toLowerCase()) {
        $('li', this.$Element).removeClass('menu-links--selected');

        var $selectedLink = $('a', this.$Element).filter(function () {
            return $(this).attr('href').toLowerCase().indexOf(selectedPageId) > -1;
        });

        $selectedLink.parent().addClass('menu-links--selected');
    }

    if (selectedPageId && selectedPageId === 'menu') {
        this.PageDisable = false;

        this.MicroInteraction.TriggerAnimation(
            'up',
            this.$Element
        );
    } else {
        if (this.PageDisable === false) {
            this.MicroInteraction.ResetAnimation();

            this.PageDisable = true;
        }
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