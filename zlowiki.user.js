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
	let user_nick, user_host;
	
	if (!document.querySelector('.nn') && !document.querySelector('.unreg')) return false;
	
	user_nick = document.querySelector('.nn') || document.querySelector('.unreg');		
	user_nick.value = encodeURIComponent(user_nick.innerText);
	user_host = document.querySelector('.nn + small') || document.querySelector('.unreg + small');
	user_host.value = encodeURIComponent(user_host.innerText.slice(1, -1));

	const create_link = (url, text, title) => {
		const a = document.createElement('a');
		a.href = url;
		a.text = text;
		a.title = title;
		a.target = '_blank';
		a.style.color = 'green';
		a.style.fontWeight = 'bold';
		a.style.fontSize = 'small';
		a.style.marginLeft = '0.2em';
		return a;
	};

	const insertAfter = (what, where) => {
		where.parentNode.insertBefore(what, where.nextSibling);
	};

	let siteSearch;
	
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

	insertAfter(create_link(`http://zlo.rt.mipt.ru:7500/nickhost.jsp?site=${siteSearch}&w=n&t=${user_nick.value}`, 'h', 'Хосты этого ника'), user_nick);
	insertAfter(create_link(`http://zlo.rt.mipt.ru:7500/search?site=${siteSearch}&nick=${user_nick.value}`, '?', 'Сообщения этого пользователя'), user_nick);
	insertAfter(create_link(`http://zlo.rt.mipt.ru:7500/search?site=${siteSearch}&nick=${user_nick.value}&host=${user_host.value}`, '?nh', 'Сообщения этого ника с этого хоста'), user_host);
	insertAfter(create_link(`http://zlo.rt.mipt.ru:7500/nickhost.jsp?site=${siteSearch}&w=h&t=${user_host.value}`, 'n', 'Ники этого хоста'), user_host);
	insertAfter(create_link(`http://zlo.rt.mipt.ru:7500/search?site=${siteSearch}&host=${user_host.value}`, '?', 'Сообщения с этого хоста'), user_host);
})();
