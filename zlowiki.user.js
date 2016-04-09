// ==UserScript==
//
// @name             updated zlowiki services
// @namespace        http://zlowiki.ru
// @description      updated zlowiki.ru services 
// @author           http://zlo.rt.mipt.ru/?persmsgform=Rustem
// @author           http://zlo.rt.mipt.ru/?persmsgform=FastFlood
//
// @include          http://board.rt.mipt.ru/*
// @include          http://zlo.rt.mipt.ru/*
// @include          http://board.rt.mipt.ru./*
// @include          http://zlo.rt.mipt.ru./*
// @include          http://x.zlowiki.ru/*
// @include          http://frike.ru/*
// @include          http://takeoff.mipt.ru/*
// @include          http://www.takeoff.mipt.ru/*
//
// @grant            none
// ==/UserScript==

// UPGRADES:
// 16.06.2013 [+] (broken) ссылка на приват в заголовке сообщения (latin alphabetic only)
// 28.03.2014 [+] coub, vimeo embedding
// TODO:
// * стрелки вверх на родителя сообщения, стрелку вниз обратно к ребёнку
// * заменить "Не проверять IP" на <lable for=''></>
// * скрывать треды по авторам и паттернам

// host a pic
(function() {
	var host = 'http://i.zlowiki.ru/';
	var place = document.getElementsByName('bb0dy')[0];
	if (!place) return false;

	var frame = document.createElement('iframe');
	frame.src = host + 'i';
	frame.style.display = 'block';
	frame.style.width = '600px';
	frame.style.height = '100px';
	frame.style.border = '1px solid #999';
	frame.style.margin = '15px';

	place.parentNode.appendChild(frame);
	
	window.addEventListener('message', function(e) {
		var data = eval('('+e.data+')');
		var s = (data.all) ? data.all.url : '[pic]' + host + data.files[0].name+'[/pic]\n';
		var areas = document.getElementsByTagName('textarea');
		for (var i = 0; i < areas.length; i++) {
			 areas[i].value += s.replace('\t', '\n'); 
		}
	}, false);
}) ();


// embed youtube, coub, vimeo
(function() {
	var page_links = document.links;
    var width = 640;
    var height = 360;
    var sizes = 'width="' + width + '" height="' + height + '"';	
	var sites = [
		{
			're'             : /(?:youtube.com\/watch\?\S*v=|youtu.be\/)([\w-]+)/i,
			'iframe_div_pre' : '<iframe ' + sizes + ' src="http://www.youtube.com/embed/',
			'iframe_div_post': '" frameborder="0"></iframe>'
		},
		{
			're'             : /(?:coub.com\/view\/)([\w-]+)/i,
			'iframe_div_pre' : '<iframe ' + sizes + ' src="http://coub.com/embed/',
			'iframe_div_post': '?muted=false&amp;autostart=false&originalSize=true&hideTopBar=false&noSiteButtons=true&startWithHD=true" allowfullscreen="true" frameborder="0"></iframe>'
		},
		{
			're'             : /(?:vimeo.com\/)([0-9]+)/i,
			'iframe_div_pre' : '<iframe ' + sizes + ' src="//player.vimeo.com/video/',
			'iframe_div_post': '" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>'
		}
	]
	
	for (var i = 0; i < page_links.length; i++) {
	for (var j = 0; j < sites.length; j++) {
		if (id = page_links[i].href.match(sites[j].re)) {
			var embed_div = document.createElement('div');
			embed_div.innerHTML = sites[j].iframe_div_pre + id[1] + sites[j].iframe_div_post;
			page_links[i].parentNode.insertBefore(embed_div, page_links[i].nextSibling);
			break;
	}}}
}) ();



//user search link next to his nick
(function() {
	var new_span = document.createElement('span');
	var body = document.getElementsByClassName('body');
	var parentDiv = body[0].parentNode;
	parentDiv.insertBefore(new_span, body[0]);
	
	
	var user_link = document.getElementsByClassName('nn');
	var user_host = user_link[0].parentNode.innerHTML.match(/(?:<small>\()(.*)(?:\)<\/small>)/);
		/*for (i = 0; i < user_host.length; i++) {
		new_span.textContent += '__' + i + ': ' + user_host[i] + '';
		}*/
		
	var user_nick = encodeURI(user_link[0].innerHTML);
	var link1 = " <small><b><a target='_blank' href='http://zlo.rt.mipt.ru:7500/search?nick=" + user_nick + "'>?</a></b></small>";
	var link2 = "<small><b><a target='_blank' href='http://zlo.rt.mipt.ru:7500/nickhost.jsp?site=0&w=n&t=" + user_nick + "'>n</a></b></small>";
	var link3 = "<small><b><a target='_blank' href='http://zlo.rt.mipt.ru:7500/nickhost.jsp?site=0&w=h&t=" + user_host[1] + "'>h</a></b></small>";
	var link4 = " <small><b><a target='_blank' title='Написать в приват' href='http://zlo.rt.mipt.ru/?persmsgform=" + encodeURI(user_nick) + "'>p</a></b></small>";
	
	//new_span.innerHTML += user_link[0].parentNode.innerHTML;
	var r = user_link[0].parentNode.innerHTML.match(/(.*<\/small>)(.*)/);
	/*for (i =0; i < r.length; i++) {
		new_span.textContent += '__' + i + ': ' + r[i] + '';
		}*/
	 user_link[0].parentNode.innerHTML = r[1] + link1 + link2 + link3 + link4 + r[2];
/*	s1 = document.createElement('span');
	s1.textContent = '123';
  user_link[0].parentNode.insertBefore(s1, user_link[0].nextSibling);*/
	
	var span_element = document.querySelectorAll('.reg, .own, .sel');
	for (i = 0; i < span_element.length; i++) {
			var nick = span_element[i].textContent;
			var host = span_element[i].nextSibling.textContent.match(/(?:\()(.*)(?:\))/)[1];
			var link1 = "<a target='_blank' href='http://zlo.rt.mipt.ru:7500/search?nick=" + nick + "'>?</a>";
			var link2 = "<a target='_blank' href='http://zlo.rt.mipt.ru:7500/nickhost.jsp?site=0&w=n&t=" + nick + "'>n</a>";
			var link3 = "<a target='_blank' href='http://zlo.rt.mipt.ru:7500/nickhost.jsp?site=0&w=h&t=" + host + "'>h</a>";
			var insertion_point = span_element[i].nextSibling.textContent.match(/(.*\))(.*)/);
			//console.log(insertion_point);
			//span_element[i].nextSibling.innerHTML = link1;	
//		else if (span_element[i].className != 'e' && span_element[i].className.length != 0) {console.log(i, span_element[i].className, span_element[i].textContent)}
	}
/*	var page_reg = document.getElementsByClassName('reg');
	var page_own = document.getElementsByClassName('own');
	var page_cel = document.getElementsByClassName('sel');*/

/*
	for (j = 0; j < page_reg.length; j++) {
		var host = page_reg[j].textContent;
		//var ip = page_reg[j].nextSibling.textContent.match(/(?:\()(.*)(?:\))/)[1];
		page_reg[j]
		//console.log(j + ' host: ' + host + ' ip: ' + ip);
	}*/
	
}) ();
