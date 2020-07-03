function MicroInteraction(pageID) {
    this.ID = pageID;
    this.SetupTextAnimation();
};

MicroInteraction.prototype = {
    ID: '',
    DataAttrNames: {
        ID: 'data-nv-animate-id',
        Main: 'data-nv-animate',
        Delay: 'data-nv-animate-delay',
        Type: 'data-nv-animate-type',
        AutoPlay: 'data-nv-animate-auto-play'
    },
    DelayAttrVals: {
        NoWrap: 'noWrap'
    },
    AnimationClasses: {
        text: {
            initial: 'text-transition--initial',
            up: 'text-transition-up--end',
            down: 'text-transition-down--end',
            left: 'text-transition-left--end',
            right: 'text-transition-right--end'
        },
        block: {
            initial: 'block-transition--initial',
            up: 'block-transition-up--end',
            down: 'block-transition-down--end',
            left: 'block-transition-left--end',
            right: 'block-transition-right--end'
        }
    },
    $ElementsToAnimate: {}
};

MicroInteraction.prototype.WrapWords = function (str, tmpl) {
    /// <param name="str" type="string">
    /// The string to transform
    /// </param>
    /// <param name="tmpl" type="string">
    /// Template that gets interpolated
    /// </param>
    /// <returns type="string">
    /// The given input split by words wrapped in a span
    /// </returns>

    return str.replace(/[\w\.\-?,'"]+/g, tmpl || "<span>$&</span>");
};

MicroInteraction.prototype.SetupTextAnimation = function () {
    this.$ElementsToAnimate = $(`#${this.ID} [${this.DataAttrNames.Main}]`);

    this.$ElementsToAnimate.each((i, elmt) => {
        const override = $(elmt).attr(this.DataAttrNames.Main);

        if (override !== this.DelayAttrVals.NoWrap) {
            const text = this.WrapWords($(elmt).text());

            $(elmt).empty().append(text);
        }

        $(elmt)
            .attr(this.DataAttrNames.ID, this.ID + i)
            .addClass(this.GetAnimationClass(elmt, 'initial'));
    });
};

MicroInteraction.prototype.ResetAnimation = function (excludedElmts, $elmtsToReset = this.$ElementsToAnimate) {
    const idsToExclude = [];

    $(excludedElmts).each((i, elmt) => {
        idsToExclude.push($(elmt).attr(this.DataAttrNames.ID));
    });
    
    $elmtsToReset.each((i, elmt) => {
        const currentID = $(elmt).attr(this.DataAttrNames.ID);

        if ($.inArray(currentID, idsToExclude) === -1) {
            window.setTimeout(() => {
                $(elmt)
                    .removeClass(this.GetAnimationClass(elmt, 'up'))
                    .removeClass(this.GetAnimationClass(elmt, 'down'))
                    .removeClass(this.GetAnimationClass(elmt, 'left'))
                    .removeClass(this.GetAnimationClass(elmt, 'right'));
            }, 300);
        }
    });
};

MicroInteraction.prototype.GetDelay = function (elmt) {
    let delay = 0;

    if ($(elmt).attr(this.DataAttrNames.Delay)) {
        delay = Number($(elmt).attr(this.DataAttrNames.Delay));
    }

    return delay;
};

MicroInteraction.prototype.GetAnimationClass = function (elmt, modifier) {
    const animationType = $(elmt).attr(this.DataAttrNames.Type);
    
    if (animationType) {
        return this.AnimationClasses[animationType.toLowerCase()][modifier.toLowerCase()];
    }
};

MicroInteraction.prototype.GetElmtsToAnimate = function (elmtsContainer = null) {
    if (elmtsContainer) {
        return $(`[${this.DataAttrNames.Main}]`, elmtsContainer);
    } else {
        return $(`[${this.DataAttrNames.Main}]`);
    }
};

MicroInteraction.prototype.StartAnimation = function (elmt, direction) {
    window.setTimeout(() => {
        $(elmt).addClass(this.GetAnimationClass(elmt, direction));
    }, this.GetDelay(elmt));
};

MicroInteraction.prototype.TriggerAnimation = function (direction, elmtsContainer = null) {
    ///<params name="elmtsContainer" type="htmlDomElmt">
    /// Optional - Scopes out which elements to animate
    ///</params>
    let $elmtsToAnimate = this.GetElmtsToAnimate(elmtsContainer);
    
    this.ResetAnimation($elmtsToAnimate.get());

    $elmtsToAnimate.each((x, elmt) => {
        const autoPlay = $(elmt).attr(this.DataAttrNames.AutoPlay);

        if (autoPlay !== 'false') {
            this.StartAnimation(elmt, direction);
        }
    });
};

window.MicroInteraction = MicroInteraction;