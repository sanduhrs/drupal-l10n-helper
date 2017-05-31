/*jslint browser: true*/

(function ($) {

    "use strict";

    $.fn.l10n = function () {

        function findGetParameter(parameterName) {
            var result = null;
            var tmp = [];
            location.search
                .substr(1)
                .split("&")
                .forEach(function (item) {
                    tmp = item.split("=");
                    if (tmp[0] === parameterName) {
                        result = decodeURIComponent(tmp[1]);
                    }
                });
            return result;
        }

        var server = "https://drupal-glossary.org/";
        var localize = "https://localize.drupal.org/";
        var project = findGetParameter('project');
        var langcode = window.location.pathname.split('/')[3];

        // Provide markup and structure.
        this.wrap("<div id=\"l10n-sidebar\"><div id=\"l10n-content\"></div></div>");
        $("#l10n-sidebar")
            .prepend("<div id=\"l10n-sidebar-container\"><div id=\"l10n-slide\" class=\"sticky\"><h2>Tools</h2></div></div>");
        $("#l10n-slide")
            .append("<div id=\"l10n-suggestion\" class=\"l10n-block\"><h3>Suggestion</h3><div class=\"content\">Click on a source text item to get a translation suggestion.</div></div>");
        $("#l10n-slide")
            .append("<div id=\"l10n-glossary\" class=\"l10n-block\"><h3>Glossary</h3><div class=\"content\">Click on a source text item to get the glossary terms.</div></div>");
        $(".l10n-block .content")
            .css("max-height", ((window.innerHeight - (window.innerHeight / 100 * 25)) / 2) + "px");

        // Establish sticky behaviour.
        var stickyOffset = $(".sticky").offset().top;
        $(window).scroll(function () {
            var sticky = $(".sticky");
            var scroll = $(window).scrollTop();

            if (scroll >= stickyOffset) {
                sticky.addClass("l10n-fixed");
            } else {
                sticky.removeClass("l10n-fixed");
            }
        });

        // Highlight selected row.
        $(".l10n-table tr").click(function () {
            $(".l10n-table tr").each(function () {
                $(this).removeClass("l10n-selected");
            });
            $(this).addClass("l10n-selected");
        });

        // Determine source text and placeholders.
        var text = "";
        var placeholders = [];
        $(".l10n-table tr").click(function () {
            placeholders = [];
            text = $(".source .l10n-string span", this).text();
            $(".source .l10n-string span .l10n-placeholder", this).each(function (index) {
                placeholders[index] = $(this).text();
            });
        });

        // Automatic translation.
        $(".l10n-table tr").click(function () {
            $.get(server + "translate?target=" + langcode + "&string=" + text, function (data) {
                // Display translation.
                $("#l10n-suggestion .content").text(data.text);
            });
        });

        // Glossary terms.
        $(".l10n-table tr").click(function () {
            // Get glossary terms.
            $.get(server + "glossary-terms?langcode=" + langcode + "&string=" + text, function (data) {
                // Display glossary terms.
                var list = "<dl>";
                $.each(data.terms, function (index, value) {
                    list = list + "<dt>";
                    list = list + value.title;
                    list = list + "<dd>";
                    list = list + value.field_translation_value;
                    list = list + "<div><a href=\"" + localize + "translate/languages/" + langcode + "/translate?project=" + project + "&search=" + value.title + "\">Show strings with this term</a></div>";
                    list = list + "<div><a href=\"" + server + "node/" + value.nid + "\">Show this term</a></div>";
                    list = list + "</dd>";
                });
                list = list + "</dl>";
                $("#l10n-glossary .content").html(list);
            });
        });

        return this;

    };

}(jQuery));
