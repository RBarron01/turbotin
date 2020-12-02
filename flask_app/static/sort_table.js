function hidden_alert() {
    if ($('#myTable tr:visible').length > 101){
        $("#alert").css('opacity', 1);
    } else {
        $("#alert").css('opacity', 0);
    }
}

function sort_attr($tr, idx) {
    var $td = $tr.children("td:nth-child(" + idx + ")"),
        sort_attr = $td.attr("sort")
    if (typeof(sort_attr) === "undefined") {
        sort_attr = $td.text()
    }
    sort_attr = sort_attr.trim().toLowerCase()
    var int_attr = parseInt(sort_attr)
    if (int_attr === 0 || !!int_attr && typeof(int_attr) == "number") {
        return int_attr
    }
    return sort_attr
}

function _sort(idx, ascending) {
    return ascending ? function _sorter(a, b) {
        return sort_attr($(a), idx) > sort_attr($(b), idx) ? 1 : -1;
    } : function _sorter(a, b) {
        return sort_attr($(a), idx) < sort_attr($(b), idx) ? 1 : -1;
    }
}

function sort_table(n) {
    hidden_alert();
    var fn = _sort(n, document.getElementById("price_sort").dataset.sort_direction == "asc")
    console.log($("[data-filtered=true]").length);
    $("table tbody").html($("table tbody tr").sort(fn));
    $("table tbody").find("tr").hide();
    $("table tbody").find("[data-filtered=false]").slice(0, 101).show();

}