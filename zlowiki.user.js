// ==UserScript==
//
// @name             updated zlowiki services
// @namespace        http://zlowiki.ru
// @description      updated zlowiki.ru services 
// @author           http://zlo.rt.mipt.ru/?persmsgform=Rustem
// @author           http://zlo.rt.mipt.ru/?persmsgform=FastFlood
//
// @match          *://board.rt.mipt.ru/*
// @match          *://zlo.rt.mipt.ru/*
// @match          *://x.mipt.cc/*
// @match          *://anime.mipt.cc/*
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

"use strict";

const l = function(){}, i = function(){};
// const l = console.log.bind(console, `${GM_info.script.name} debug:`), i = console.info.bind(console, `${GM_info.script.name} debug:`);

// host a pic
(function() {
	const HOST = 'http://i.zlowiki.ru/';
	const place = document.getElementsByName('bb0dy')[0];
	if (!place) return false;

	const frame = document.createElement('iframe');
	frame.src = HOST + 'i';
	frame.style.display = 'block';
	frame.style.width = '600px';
	frame.style.height = '100px';
	frame.style.border = '1px solid #999';
	frame.style.margin = '15px';

	place.parentNode.appendChild(frame);
	
	window.addEventListener('message', (e) => {
		const data = JSON.parse(e.data.replace(/\t/g, '\\t'));
		const s = (data.all) ? data.all.url : `[pic]${HOST}${data.files[0].name}[/pic]\n`;
		place.value += s.replace('\t', '\n');
	}, false);
})();


// embed youtube, coub, vimeo
(function() {
	const width = 640;
	const height = 360;
	const linksList = Array.from(document.querySelectorAll('.body a'));
	const servicesList = [
		{
			're'	:	/(?:youtube.com\/watch\?\S*v=|youtu.be\/)([\w-]+)/i,
			'src'	:	'//youtube.com/embed/'
		},
		{
			're'	:	/(?:coub.com\/view\/)([\w-]+)/i,
			'src'	:	'//coub.com/embed/'
		},
		{
			're'	:	/(?:vimeo.com\/)([0-9]+)/i,
			'src'	:	'//player.vimeo.com/video/'
		}
	];

	linksList.forEach((link) => {
		servicesList.some((service) => {
			if (link.href.match(service.re)) {
				const mediaId = link.href.match(service.re)[1];
				const frame = document.createElement('iframe');
				frame.src = service.src + mediaId;
				frame.allowFullscreen = true;
				frame.frameBorder = 0;
				frame.style.display = 'block';
				frame.style.width = width + 'px';
				frame.style.height = height + 'px';
				link.parentNode.insertBefore(frame, link.nextSibling);
				return true;
			}
		});
	});
})();



//user search link next to his nick
(function() {
	let siteSearch;
	let user_nick, user_host;
	
	const createLink = (url, text, title, invisible) => {
		const a = document.createElement('a');
		a.href = url;
		a.text = text;
		a.title = title;
		a.target = '_blank';
		a.className = 'user_search';
		if (invisible) {
			a.className += ' user_search_invisible';
		}
		return a;
	};

	const insertAfter = (what, where) => {
		where.parentNode.insertBefore(what, where.nextSibling);
	};

	switch (location.hostname) {
		case 'x.mipt.cc':
			siteSearch = 12;
			break;
		case 'anime.mipt.cc':
			siteSearch = 3;
			break;
		case 'zlo.rt.mipt.ru':
		case 'board.rt.mipt.ru':
			siteSearch = 0;
	}

	GM_addStyle(`
		a.user_search {
			color: green;
			font-weight: bold;
			font-size: small !important;
			margin-left: 0.2em;
		}
		a.user_search_invisible {
			display: none;
		}
		span[id^="m"]:hover a.user_search_invisible {
			display: inline;
		}
	`);

	// current message in particular thread handling
	if (document.querySelector('.nn + small') || document.querySelector('.unreg + small')) {
		user_nick = document.querySelector('.nn') || document.querySelector('.unreg');		
		user_nick.value = encodeURIComponent(user_nick.innerText);
		user_host = document.querySelector('.nn + small') || document.querySelector('.unreg + small');
		user_host.value = encodeURIComponent(user_host.innerText.slice(1, -1));

		insertAfter(createLink(`http://zlo.rt.mipt.ru:7500/nickhost.jsp?site=${siteSearch}&w=n&t=${user_nick.value}`, 'h', 'Хосты этого ника'), user_nick);
		insertAfter(createLink(`http://zlo.rt.mipt.ru:7500/search?site=${siteSearch}&nick=${user_nick.value}`, '?', 'Сообщения этого пользователя'), user_nick);
		insertAfter(createLink(`http://zlo.rt.mipt.ru:7500/search?site=${siteSearch}&nick=${user_nick.value}&host=${user_host.value}`, '?nh', 'Сообщения этого ника с этого хоста'), user_host);
		insertAfter(createLink(`http://zlo.rt.mipt.ru:7500/nickhost.jsp?site=${siteSearch}&w=h&t=${user_host.value}`, 'n', 'Ники этого хоста'), user_host);
		insertAfter(createLink(`http://zlo.rt.mipt.ru:7500/search?site=${siteSearch}&host=${user_host.value}`, '?', 'Сообщения с этого хоста'), user_host);
	}

	// other messages handling, in individual thread and in global index
	const postsList = Array.from(document.querySelectorAll('span[id^="m"]'));
	postsList.forEach((post) => {
		let where_to_post_links;

		switch (location.hostname) {
		case 'zlo.rt.mipt.ru':
		case 'board.rt.mipt.ru':
			user_nick = post.lastElementChild;
			user_nick.value = encodeURIComponent(user_nick.innerText);
			user_host = post.lastChild;
			user_host.value = encodeURIComponent(user_host.textContent.match(/.*\((.*)\).*/)[1]);
			where_to_post_links = user_host;
			break;
		case 'x.mipt.cc':
			user_nick = post.querySelector('.unr, .reg');
			user_nick.value = encodeURIComponent(user_nick.innerText);
			user_host = post.querySelector('span.nobr:nth-last-of-type(3)');
			user_host.value = encodeURIComponent(user_host.textContent.match(/.*\((.*)\).*/)[1]);
			where_to_post_links = post.lastChild;
			break;
		}

		insertAfter(createLink(`http://zlo.rt.mipt.ru:7500/search?site=${siteSearch}&nick=${user_nick.value}&host=${user_host.value}`, '?nh', 'Сообщения этого ника с этого хоста', true), where_to_post_links);
		insertAfter(createLink(`http://zlo.rt.mipt.ru:7500/nickhost.jsp?site=${siteSearch}&w=h&t=${user_host.value}`, 'n', 'Ники этого хоста', true), where_to_post_links);
		insertAfter(createLink(`http://zlo.rt.mipt.ru:7500/search?site=${siteSearch}&host=${user_host.value}`, '| ?', 'Сообщения с этого хоста', true), where_to_post_links);
		insertAfter(createLink(`http://zlo.rt.mipt.ru:7500/nickhost.jsp?site=${siteSearch}&w=n&t=${user_nick.value}`, 'h', 'Хосты этого ника', true), where_to_post_links);
		insertAfter(createLink(`http://zlo.rt.mipt.ru:7500/search?site=${siteSearch}&nick=${user_nick.value}`, '?', 'Сообщения этого пользователя', true), where_to_post_links);
		});
})();
