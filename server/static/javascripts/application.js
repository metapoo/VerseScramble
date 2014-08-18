if (!this["vr"]) var vr = {};
vr.global_scope = this;

vr.update_version_select = function(language, version) {
    $.ajax({ url: "/version/update_selector",
             data: {language:language, version:version}}).
      done(function(data) {
	  $("#version_select_parent").html(data);
      });
}

