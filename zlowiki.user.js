// ==UserScript==
//
// @name             Zlo Enhancement Suite
// @namespace        http://zlowiki.ru
// @description      various features for zlo.rt.mipt.ru and other WWWConf engine forums
// @description:ru   разные фичи для zlo.rt.mipt.ru и других форумов на движке WWWConf
// @author           Автор идеи: http://zlo.rt.mipt.ru/?persmsgform=Rustem
// @author           Допиливатель: http://zlo.rt.mipt.ru/?persmsgform=FastFlood
// @version    			 1.5.0.0
//
// @match            *://(board|zlo).rt.mipt.ru/*
// @match            *://x.mipt.cc/*
// @match            *://anime.mipt.cc/*
//
// @grant            GM_addStyle
// ==/UserScript==

// UPGRADES:
// 16.06.2013 [+] (broken) ссылка на приват в заголовке сообщения (latin alphabetic only)
// 28.03.2014 [+] coub, vimeo embedding

// TODO:
// * стрелки вверх на родителя сообщения, стрелку вниз обратно к ребёнку
// * заменить "Не проверять IP" на <lable for=''></> и для "Автологин"
// * скрывать треды по авторам и паттернам
// * На авторе поста ссылки на поиск показывать всегда, на всех остальных -- по наведению
// * Ссылка на persmsg=all
// * Починить ссылки на приват для кириллических имён пользователей


"use strict";

// const l = function(){}, i = function(){};
const l = console.log.bind(console, `${GM_info.script.name} debug:`), i = console.info.bind(console, `${GM_info.script.name} debug:`);

// host a pic
(function() {
	const host = 'http://i.zlowiki.ru/';
	const place = document.getElementsByName('bb0dy')[0];
	if (!place) return false;

	const frame = document.createElement('iframe');
	frame.src = host + 'i';
	frame.style.display = 'block';
	frame.style.width = '600px';
	frame.style.height = '100px';
	frame.style.border = '1px solid #999';
	frame.style.margin = '15px';

	place.parentNode.appendChild(frame);

	window.addEventListener('message', (e) => {
		const data = JSON.parse(e.data.replace(/\t/g, '\\t'));
		const s = (data.all) ? data.all.url : `[pic]${host}${data.files[0].name}[/pic]\n`;
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
		.w:hover a.user_search_invisible, .g:hover a.user_search_invisible {
			display: inline;
		}
		/*span[id^="m"]:hover a.user_search_invisible {
			display: inline;
		}*/
	`);

	// current message in particular thread handling
	if (document.querySelector('.nn + small') || document.querySelector('.unreg + small')) {
		user_nick = document.querySelector('.nn') || document.querySelector('.unreg');		
		user_nick.value = encodeURIComponent(user_nick.innerText);
		user_host = document.querySelector('.nn + small') || document.querySelector('.unreg + small');
		user_host.value = encodeURIComponent(user_host.innerText.slice(1, -1));

		[
			{
				url: `http://zlo.rt.mipt.ru:7500/nickhost.jsp?site=${siteSearch}&w=n&t=${user_nick.value}`,
				text: 'h',
				title: 'Хосты этого ника',
				where: user_nick
			}, {
				url: `http://zlo.rt.mipt.ru:7500/search?site=${siteSearch}&nick=${user_nick.value}`,
				text: '?',
				title: 'Сообщения этого пользователя',
				where: user_nick
			}, {
				url: `http://zlo.rt.mipt.ru:7500/search?site=${siteSearch}&nick=${user_nick.value}&host=${user_host.value}`,
				text: '?nh',
				title: 'Сообщения этого ника с этого хоста',
				where: user_host
			}, {
				url: `http://zlo.rt.mipt.ru:7500/nickhost.jsp?site=${siteSearch}&w=h&t=${user_host.value}`,
				text: 'n',
				title: 'Ники этого хоста',
				where: user_host
			}, {
				url: `http://zlo.rt.mipt.ru:7500/search?site=${siteSearch}&host=${user_host.value}`,
				text: '?',
				title: 'Сообщения с этого хоста',
				where: user_host
			}
		].forEach(function (e) {
			insertAfter(createLink(e.url, e.text, e.title), e.where);
		})
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

		[
			{
				url: `http://zlo.rt.mipt.ru:7500/search?site=${siteSearch}&nick=${user_nick.value}&host=${user_host.value}`,
				text: '?nh',
				title: 'Сообщения этого ника с этого хоста',
				invisible: true,
				where: where_to_post_links
			}, {
				url: `http://zlo.rt.mipt.ru:7500/nickhost.jsp?site=${siteSearch}&w=h&t=${user_host.value}`,
				text: 'n',
				title: 'Ники этого хоста',
				invisible: true,
				where: where_to_post_links
			}, {
				url: `http://zlo.rt.mipt.ru:7500/search?site=${siteSearch}&host=${user_host.value}`,
				text: '| ?',
				title: 'Сообщения с этого хоста',
				invisible: true,
				where: where_to_post_links
			}, {
				url: `http://zlo.rt.mipt.ru:7500/nickhost.jsp?site=${siteSearch}&w=n&t=${user_nick.value}`,
				text: 'h',
				title: 'Хосты этого ника',
				invisible: true,
				where: where_to_post_links
			}, {
				url: `http://zlo.rt.mipt.ru:7500/search?site=${siteSearch}&nick=${user_nick.value}`,
				text: '?',
				title: 'Сообщения этого пользователя',
				invisible: true,
				where: where_to_post_links
			}
		].forEach(function (e) {
			insertAfter(createLink(e.url, e.text, e.title, e.invisible), e.where);
		});
	});
})();


// add persmsg=all link
// all labels to checkboxes
(function(){
	const wrapInLabel = (node, sibling) => {
		const label = document.createElement('label');
		const parent = node.parentNode;
		if((sibling === 'nextSibling')||(sibling === 'nextElementSibling')) {
			parent.insertBefore(label, node.nextSibling.nextSibling);
			const sib = node[sibling];
			label.appendChild(node);
			label.appendChild(sib);
		} else {
			parent.insertBefore(label, node.nextSibling);
			label.appendChild(node[sibling]);
			label.appendChild(node);
		}
	}

	if (location.hostname.match(/^(?:board|zlo)\.rt\.mipt\.ru/) && location.search === '?persmsg') {
		const newPMlink = document.querySelector('a[href="?persmsgform"]');
		const link = document.createElement('a');
		link.href = '?persmsg=all';
		link.text = 'Все персональные сообщения';
		link.style.textDecoration = 'underline';
		newPMlink.parentNode.insertBefore(link, newPMlink);
		newPMlink.parentNode.insertBefore(document.createTextNode(' '), newPMlink);
	}

	[
		{
			selector: 'input[name="lmi"]',
			sibling: 'previousElementSibling'
		}, {
			selector: 'input[name="ipoff"]',
			sibling: 'nextSibling'
		}, {
			selector: 'input[name="dct"]',
			sibling: 'previousSibling'
		}, {
			selector: 'input[name="dst"]',
			sibling: 'previousSibling'
		}, {
			selector: 'input[name="wen"]',
			sibling: 'previousSibling'
		}
	].forEach(function (e){
		if (document.querySelector(e.selector)) {
			wrapInLabel(document.querySelector(e.selector), e.sibling);
		};
	});
})();


// settings menu
(function(){
	const settings = {
		init: () => {
			const div = document.createElement('div');
			
		},
		show: function () {
			l(this.n);
		},
		n: 'qwe'
	}

	const settingsLink = document.createElement('a');
	settingsLink.text = 'Настройки скрипта';
	settingsLink.href = '#';
	settingsLink.addEventListener('click', function(){settings.show()});
	document.querySelector('.menu').appendChild(settingsLink);
})();