var n = 100;
var extra_form_params = {};
var qs = window.location.search.split('?');
if (qs.length > 1) {
	qs = qs[1].split('&');
	for (var i = 0; i < qs.length; i++) {
		var s = qs[i].split('=');
		if (s.length > 1 && s[0] == 'n') {
			n = parseInt(s[1]);
			extra_form_params.n = n;
		}
	}
}

fs_data = fs_data.slice(0,n);

var bfs = new BetterFriendSelector({
	action:"index.html", 
	method:"GET", 
	submit_text:"Send Friend Request", 
	data:fs_data,
	limit:10,
	elem:$("#bfs"), 
	tabs:[{key:"hasapp",name:"Friends With App"}, {key:"nonapp",name:"Friends Without App"}],
	extra_form_params:extra_form_params
});

