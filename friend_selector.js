(function(){
	this.BFS = {};
	BFS.BetterFriendSelector = function (params) {
		//TODO: validation on params, existence of jQuery, etc.		

		// Required params
		var selector = params.elem;
		if (!params.friendGenerator) {
			params.friendGenerator = new (function(data) {
				var i = 0;
				this.next = function() {
					if (i >= data.length) {
						return null;
					}
					return data[i++];
				};
			})(params.data);
		}

		// Optional params
		var limit = params.limit !== null ? params.limit : -1;
		var extra_form_params = params.extra_form_params || {};
	
		$(function() {
			// Render the selector
			selector.tmpl(BFS.templates.body,params);

			// Friend selected event
			selector.find("input[type=checkbox]").change(function(){
				var count = selector.find("input[type=checkbox][checked=true]").length;
				if (limit >= 0 && count > limit) {
					$(this).attr("checked",false);
					return false;
				}
				$(this).parents(".friend").addClass("hidden");
				var selected_elem = $("<div id='" + $(this).attr("id") + "'/>").addClass("selected_friend");
				selected_elem.tmpl(BFS.templates.selected_elem,{"name":$(this).siblings("label").text(), "id":$(this).attr("id")});
				selector.find(".selected").append(selected_elem);
			});

			// Friend unselected event
			selector.find(".remove").live("click",function(){
				selector.find(".unselected #" + $(this).attr("id")).attr("checked",false).parents(".friend").removeClass("hidden");
				$(this).parents(".selected_friend").remove();
			});

			var filter = selector.find(".filter input");

			var reset_filter = function(){
				filter.addClass("empty").val(filter.siblings(".__empty_text").text());
			};
			// Filter changed event
			var do_filter = function() {
				var filter_text = filter.val();
				if (filter_text == filter.siblings(".__empty_text").text()) {
					filter_text = "";
				}
				selector.find(".unselected label").each(function(){
					if(!$(this).text().match("^" + filter_text) && !$(this).text().match("[- \t]+" + filter_text)) {
						$(this).parents(".friend").addClass("filtered");
					} else {
						$(this).parents(".friend").removeClass("filtered");
					}
				});
			};
			filter.keyup(do_filter);

			// Filter preloaded text stuff
			reset_filter();
			filter.focus(function() {
				if ($(this).val() == $(this).siblings(".__empty_text").text()) {
					$(this).removeClass("empty").val('');
				}
			});
			filter.blur(function() {
				if ($(this).val() === "") {
					reset_filter();
				}
			});
			selector.find(".filter .clear_filter").click(function(){
				reset_filter();
				do_filter();
			});


			// Tab Switching
			selector.find(".tab").click(function() {
				var name = $(this).attr("name");
				selector.find(".friend").removeClass("toggled").not(".__tab_" + name).addClass("toggled");
				$(this).addClass("selected_tab").siblings(".tab").removeClass("selected_tab");
			}).filter(":first").click();

			// Form Submission
			selector.find("input[name=selector_submit]").click(function(){
				selector.find("form").submit();
			});
		});
	};

	BFS.templates = {
		"body":'\
			<div class="friend_selector clearfix">\
				<% if (tabs) { %>\
				<div class="tabs">\
					<span class="tab" name="all">All Friends</span>\
					<% for (var i = 0; i < tabs.length; i++) { %>\
					<span class="tab" name="<%=tabs[i].key%>"><%=tabs[i].name%></span>\
					<% } %>\
				</div>\
				<div class="body">\
					<% } %>\
					<div class="filter">\
						<input type="text" name="filter" />\
						<span style="display:none" class="__empty_text">Start typing a friend\'s name...</span>\
						<div class="clear_filter">X</div>\
					</div>\
					<div class="unselected">\
						<form action="<%=action%>" method="<%=method%>">\
						<% var friend; %>\
						<% while (friend = friendGenerator.next()) { %>\
							<div class="friend __tab_all <% for (var j = 0; j < friend.tabs.length; j++) {%> __tab_<%=friend.tabs[j]%> <% } %>">\
								<input type="checkbox" name="ids[]" id="<%=\"cb\"+friend.id%>" value="<%=friend.id%>" />\
								<label for="<%=\"cb\"+friend.id%>"><%=friend.name%></label>\
							</div>\
						<% } %>\
						<% for (var k in extra_form_params) { %>\
							<input type="hidden" name="<%=k%>" value="<%=extra_form_params[k]%>" />\
						<% } %>\
						</form>\
					</div>\
					<div class="selected" />\
				</div>\
				<input type="submit" name="selector_submit" class="submit" value="<%=submit_text%>" />\
			</div>\
		',
		"selected_elem":'\
			<div><span class="remove" id="<%=id%>">X</span><%=name%></div>\
		'
	};
})();	
