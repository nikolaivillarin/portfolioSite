//#region Constructor
function ContactPage() {
    /// <summary>
    /// Default Constructor
    /// </summary>
    this.Initialize();
}
//#endregion

//#region Properties
ContactPage.prototype = {
};
//#endregion

//#region Methods
ContactPage.prototype.Initialize = function () {
    window.MainNav.SubscribeToOnPageChange(
        $.proxy(this.OnPageChange, this)
    );

    $('#frmContact input')
        .on('focusin', this.InputFocusIn)
        .on('focusout', this.InputFocusOut);

    $('#contactSummary h1').on('click', 
        $.proxy(this.ContactSummaryClicked, this)
    );

    $('#frmContact h1').on('click',
        $.proxy(this.ContactFormClicked, this)
    );

    $(window).resize(
        $.proxy(this.SizeForm, this)
    );

    this.SizeForm();
};

ContactPage.prototype.OnPageChange = function (pageId) {
    /// <summary>
    /// Function which is called when page is changed
    /// </summary>
    if (pageId && pageId === 'contact') {
        this.SizeForm();
    }
};

ContactPage.prototype.SizeForm = function () {
    /// <summary>
    /// If the screen is too small the form becomes collapse-able
    /// </summary>
    if ($(window).width() <= 600) {
        this.CollapseContactForm();
        this.ExpandContactSummary();
        this.EnableClickableHeaders();
    } else {
        this.ExpandContactForm();
        this.ExpandContactSummary();
        this.DisableClickableHeaders();
    }
};

ContactPage.prototype.EnableClickableHeaders = function () {
    $('#contactSummary h1').addClass('contact__header--clickable');
    $('#frmContact h1').addClass('contact__header--clickable');
};

ContactPage.prototype.DisableClickableHeaders = function () {
    $('#contactSummary h1').removeClass('contact__header--clickable');
    $('#frmContact h1').removeClass('contact__header--clickable');
};

ContactPage.prototype.ContactSummaryClicked = function () {
    if ($('#contactSummary').hasClass('contact__summary--collapsed') === true) {
        this.ExpandContactSummary();
        this.CollapseContactForm();
    }
};

ContactPage.prototype.ContactFormClicked = function () {
    if ($('#frmContact').hasClass('contact__form--collapsed') === true) {
        this.CollapseContactSummary();
        this.ExpandContactForm();
    }
};

ContactPage.prototype.CollapseContactForm = function () {
    $('#frmContact').addClass('contact__form--collapsed');
};

ContactPage.prototype.ExpandContactForm = function () {
    $('#frmContact').removeClass('contact__form--collapsed');
};

ContactPage.prototype.CollapseContactSummary = function () {
    $('#contactSummary').addClass('contact__summary--collapsed');
};

ContactPage.prototype.ExpandContactSummary = function () {
    $('#contactSummary').removeClass('contact__summary--collapsed');
};

ContactPage.prototype.InputFocusIn = function (evt) {
    /// <summary>
    /// Moves the placeholder out of the way
    /// </summary>
    var $container = $(evt.target).parent();
    var $label = $('label', $container);

    $label.addClass('contact__label--focus');
};

ContactPage.prototype.InputFocusOut = function (evt) {
    /// <summary>
    /// Moves the placeholder out of the way
    /// </summary>
    if ($(evt.target).val() === '') {
        var $container = $(evt.target).parent();
        var $label = $('label', $container);

        $label.removeClass('contact__label--focus');
    }
};
//#endregion

//#region Initializer
(function LoadContactScript() {
    if (window.MainNav && window.MainNav.HasNavigationLoaded === true) {
        new ContactPage();
    } else if (window.MainNav) {
        window.MainNav.SubscribeToOnNavigationLoaded(function () {
            new ContactPage();
        });
    } else {
        window.setTimeout(LoadContactScript, 50);
    }
})();
//#endregion