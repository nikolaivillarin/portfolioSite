function TextTransition(pageID) {
    this.ID = pageID;
    this.SetupTextAnimation();
};

TextTransition.prototype = {
    ID: '',
    DataAttrNames: {
        ID: 'data-nv-animate-id',
        Main: 'data-nv-animate',
        Delay: 'data-nv-animate-delay'
    },
    DelayAttrVals: {
        NoWrap: 'noWrap'
    },
    AnimationClasses: {
        Initial: 'text-transition-text--initial',
        UpEnd: 'text-transition-up--end',
        DownEnd: 'text-transition-down--end'
    },
    $ElementsToAnimate: {}
};

/**
 * Wraps a string around each word
 *
 * @param {string} str The string to transform
 * @param {string} tmpl Template that gets interpolated
 * @returns {string} The given input splitted by words
 */
TextTransition.prototype.WrapWords = function (str, tmpl) {
    return str.replace(/\w+/g, tmpl || "<span>$&</span>");
};

TextTransition.prototype.SetupTextAnimation = function () {
    this.$ElementsToAnimate = $(`#about [${this.DataAttrNames.Main}]`);

    this.$ElementsToAnimate.each((i, elmt) => {
        const override = $(elmt).attr(this.DataAttrNames.Main);

        if (override !== this.DelayAttrVals.NoWrap) {
            const text = this.WrapWords($(elmt).text());

            $(elmt).empty().append(text);
        }

        $(elmt).attr(this.DataAttrNames.ID, this.ID + i);
    }).addClass(this.AnimationClasses.Initial);
};

TextTransition.prototype.ResetTextAnimation = function (elmtsToAnimate) {
    const idsToExclude = [];

    $(elmtsToAnimate).each((i, elmt) => {
        idsToExclude.push($(elmt).attr(this.DataAttrNames.ID));
    });
    
    this.$ElementsToAnimate.each((i, elmt) => {
        const currentID = $(elmt).attr(this.DataAttrNames.ID);

        if ($.inArray(currentID, idsToExclude) === -1) {
            window.setTimeout(() => {
                $(elmt)
                    .removeClass(this.AnimationClasses.UpEnd)
                    .removeClass(this.AnimationClasses.DownEnd);
            }, 300);
        }
    });
};

TextTransition.prototype.TriggerTextAnimation = function (direction, elmtsToAnimate) {
    const triggerAnimation = (elmt, delay, animationClass) => {
        window.setTimeout(() => {
            $(elmt).addClass(animationClass);
        }, delay);
    };
    
    this.ResetTextAnimation(elmtsToAnimate);

    switch (direction) {
        case 'up':
            $(elmtsToAnimate).each((x, elmt) => {
                triggerAnimation(
                    elmt,
                    Number($(elmt).attr(this.DataAttrNames.Delay)),
                    this.AnimationClasses.DownEnd
                );
            });
            break;
        case 'down':
            $(elmtsToAnimate).each((x, elmt) => {
                triggerAnimation(
                    elmt,
                    Number($(elmt).attr(this.DataAttrNames.Delay)),
                    this.AnimationClasses.UpEnd
                );
            });
            break;
    }
};

window.TextTransition = TextTransition;