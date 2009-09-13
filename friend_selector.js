(function(){
	this.BFS = {};
	BFS.BetterFriendSelector = function (params) {
		var that = this;
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

		// UI Elements (assignments follow later)
		var filter;

		// Private Methods
		var _refreshPager = function () {
			if (params.pageSize) {
				pages = [];
				// Numeric paging
				if (params.pageSize.constructor == Number) {
					var visibleFriends = selector.find(".friend:not(.tabbed,.hidden,.filtered)").length;
					for (var i = 0; i < visibleFriends / params.pageSize; i++) {
						pages = pages.concat([i+1]);
					}
				// Alphabetic Paging
				} else if (params.pageSize == 'alpha') {
					pages = ['#','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];
				}
				selector.find(".pager").tmpl(BFS.templates.pager,{pages:pages}).show();
				selector.find(".page_change:first").trigger("click");
			}
		};
		var _doFilter = function() {
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
			_refreshPager();
		};
		var _resetFilter = function(){
			filter.addClass("empty").val(filter.siblings(".__empty_text").text());
		};
	
		$(function() {
			// Render the selector
			selector.tmpl(BFS.templates.body,params); 

			// Assign the UI elements
			filter = selector.find(".filter input");

			// Event Handlers Follow.  Order matters here at some level, so be careful moving these around.

			// Friend selected event
			selector.find("input[type=checkbox]").change(function(){
				if (limit >= 0 && that.selectedCount() > limit) {
					$(this).attr("checked",false);
					return false;
				}
				$(this).parents(".friend").addClass("hidden");
				var selected_elem = $("<div id='" + $(this).attr("id") + "'/>").addClass("selected_friend");
				selected_elem.tmpl(BFS.templates.selected_elem,{"name":$(this).siblings("label").text(), "id":$(this).attr("id")});
				selector.find(".selected").append(selected_elem);
				_refreshPager();
			});

			// Friend unselected event
			selector.find(".remove").live("click",function(){
				selector.find(".unselected #" + $(this).attr("id")).attr("checked",false).parents(".friend").removeClass("hidden");
				$(this).parents(".selected_friend").remove();
				_refreshPager();
			});

			// Filter changed event
			filter.bind("keyup", _doFilter);

			// Filter preloaded text stuff
			_resetFilter();
			filter.focus(function() {
				if ($(this).val() == $(this).siblings(".__empty_text").text()) {
					$(this).removeClass("empty").val('');
				}
			});
			filter.blur(function() {
				if ($(this).val() === "") {
					_resetFilter();
				}
			});
			selector.find(".filter .clear_filter").click(function(){
				_resetFilter();
				_doFilter();
			});

			// Paging
			selector.find(".page_change").live("click", function() {
				var low_num = parseInt($(this).attr("name")) * params.pageSize;
				selector.find(".friend:not(.filtered,.tabbed,.hidden)").addClass("paged").filter(":gt(" + low_num + "):lt(" + params.pageSize + ")").removeClass("paged");
			});

			// Tab Switching
			selector.find(".tab").click(function() {
				var name = $(this).attr("name");
				selector.find(".friend").removeClass("tabbed").not(".__tab_" + name).addClass("tabbed");
				$(this).addClass("selected_tab").siblings(".tab").removeClass("selected_tab");
				_refreshPager();
			}).filter(":first").trigger("click"); // this trigger will also cause _refreshPager() to be called for the first time

			// Form Submission
			selector.find("input[name=selector_submit]").click(function(){
				selector.find("form").submit();
			});
		});


		// Public Methods
		this.unselectAll = function() {
			selector.find(".selected .remove").click();
		};

		this.selectedCount = function() {
			return selector.find("input[type=checkbox][checked=true]").length;
		};

		this.unselectedCount = function() {
			return selector.find("input[type=checkbox][checked=false]").length;
		}

		this.selectRandom = function(n) {
			if (typeof(n) == 'undefined') {
				n = limit;
			}
			var selected = this.selectedCount();
			if (selected + n > limit) {
				n = limit - selected;
			}
			for (var i = 0; i < n; i++) {
				selector.find("input[type=checkbox][checked=false]").eq(Math.floor(Math.random()*this.unselectedCount())).click().change();
			}

		};
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
					<div class="pager clearfix" style="display:none;" />\
					<div class="selected" />\
				</div>\
				<input type="submit" name="selector_submit" class="submit" value="<%=submit_text%>" />\
			</div>\
		',
		"selected_elem":'\
			<div><span class="remove" id="<%=id%>">X</span><%=name%></div>\
		',
		"pager":'\
			<ul>\
				<% for (var i = 0; i < pages.length; i++) { %>\
					<li class="page_change" name="<%=i%>"><%=pages[i]%></li>\
				<% } %>\
			</ul>\
		'
	};
})();	
