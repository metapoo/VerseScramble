if (!this["vr"]) var vr = {};
vr.global_scope = this;

vr.update_version_select = function(language, version) {
    vr.ajax_request("/version/update_selector", {language:language, version:version}, "#version_select_parent");

}

vr.move_verse = function(direction, verse_id) {
    vr.ajax_request("/verse/move"+direction+"/"+verse_id, {}, "#verses");
}

vr.ajax_request = function(url, args, html_id) {
    $.ajax({ url: url, data: args}).done(
	function(data) {
        var el = $(html_id);
        if (el.prop("tagName") == "TEXTAREA") {
          el.val(data)
        } else {
	  el.html(data);
        }
    });
}

vr.confirm_delete = function() {
    return confirm("Are you sure you want to delete this?");
}

vr.show_language_selector = function() {
    if (!$("#languages").is(":visible")) {
	$("#languages").show();
	window.scrollTo(0,document.body.scrollHeight);
	vr.ajax_request("/translations/show", {'uri':window.location.pathname}, "#languages");
    } else {
	$("#languages").hide();
    }
}
