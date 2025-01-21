
//----------- masonry

const VRES= 5; // rem: must match css grid-template-rows TODO? read css
const VGAP= 40;
const gallery= document.getElementById("gallery");
const heightMap= new Map();

function updateMasonry() {
	for(let [elt,h] of heightMap.entries()) {
		if(elt.hidden) continue;
			h+= VGAP;
		let span= (h/VRES)|0;
		elt.style.gridRow= "span "+ span;
		elt.style.height= (span*VRES)+"px";
	}
}
function checkMasonry() {
	let update= false;
	for(let elt of gallery.children) {
		if(elt.hidden) continue;
			const h= elt.firstElementChild.getBoundingClientRect().height;
			if(((h/VRES)|0)!==(heightMap.get(elt)/VRES)|0) {
				heightMap.set(elt,h);
				update= true;
			}
	}
	if(!update) return;
	requestAnimationFrame(updateMasonry);
}

new ResizeObserver(checkMasonry).observe(gallery);
window.addEventListener("load",checkMasonry);

//----------- filter

const filterBar= document.getElementById("filters");
const filterLinkByHash= Array.prototype.reduce.call(
	filterBar.querySelectorAll("a"),
	(map,a)=>(map.set(a.getAttribute("href").substring(2),a),map),
	new Map()
);

let currentFilteLink= filterLinkByHash.get(filter= "all");

function updateFilter(filter) {
	let scrollY= main.scrollTop;
	currentFilteLink?.classList.remove("current");
	currentFilteLink= (filterLinkByHash.get(filter)??filterLinkByHash.get(filter= "all"));
	currentFilteLink.classList.add("current");

	for(const item of gallery.children) {
		item.hidden = filter !== "all" &&
			!Array.prototype.find.call(
				item.querySelectorAll("span.tag"),
				(span) => span.innerText===filter
			);
	}
	main.scrollTop= scrollY;
	gallery.scrollIntoView({behavior: 'smooth'});
}

//----------- dark mode

const darkMode= document.getElementById("dark-mode");
darkMode.checked= window.matchMedia("(prefers-color-scheme: dark)").matches;


//----------- popup

const popup= document.getElementById("popup");
const iframe= document.getElementById("popup-iframe");
const nextLink= document.getElementById("next");
const prevLink= document.getElementById("prev");
const closeLink= document.getElementById("popup-close");

// prevent history
function replaceLocationOnClick(ev) {
	ev.preventDefault();
	ev.cancelBubble= true;
	window.location.replace(ev.target.href);
}

nextLink.addEventListener("click",replaceLocationOnClick);
prevLink.addEventListener("click",replaceLocationOnClick);
closeLink.addEventListener("click",(ev)=>{
		ev.preventDefault();
		popup.close();
});

let doBackOnPopupClose= false;

gallery.addEventListener("click",ev=>{
		doBackOnPopupClose= true;
});

popup.addEventListener("close", (ev) => {
	iframe.contentWindow.location.replace("about:blank");
	if(window.location.hash.startsWith("#+")) {
		if(doBackOnPopupClose) window.history.back();
		else window.location= "#"
	}
});

function openDetail() {
		const hrefs= Array.prototype.map.call(gallery.querySelectorAll("div:not([hidden]) > a"),e=>e.href);
		const i= hrefs.indexOf(window.location.toString());
		prevLink.hidden= i===0;
		if(i>0) {
			prevLink.href= hrefs[i-1];
		}
		nextLink.hidden= i===hrefs.length-1;
		if(i<hrefs.length-1) {
			nextLink.href= hrefs[i+1];
		}
		closeLink.href= currentFilteLink.href;
		iframe.contentWindow.location.replace(window.location.hash.substring(2)+"#"+(darkMode.checked?"dark":"light"));
		popup.showModal();
}

//----------- url hash

function onLocationChange(ev) {
	let h= window.location.hash;
	console.log("onLocationChange",{ev,h})
	if(!h.startsWith("#+")) {
		popup.close();
		if(h.startsWith("#-")) updateFilter(h.substring(2));
		else document.getElementById(h.substring(1))?.scrollIntoView({behavior: 'smooth'});
	}
	else {
		openDetail();
	}
}

window.addEventListener('popstate',()=>{
	let h= window.location.hash;
	if(h.startsWith("#+")) {
		openDetail();
	}
	else {
		popup.close();
	}
});

window.addEventListener("load",()=>{
	let h= window.location.hash;
	if(h.startsWith("#+")) {
		openDetail();
	}
	else {
		if(h.startsWith("#-")) updateFilter(h.substring(2));
		else document.getElementById(h.substring(1))?.scrollIntoView({behavior: 'smooth'});
		window.location.replace("#");
	}
});



//----------- section tracking

const main = document.querySelector("main");
const sections= main.querySelectorAll("section");
const menu = document.getElementById("menu");

const visibleIds= {}

const sectionObserver = new IntersectionObserver(
	(entries, observer) => {
		for (const entry of entries) {
			visibleIds[entry.target.id]= entry.isIntersecting;
		}
		let firstVisibleId= Array.prototype.find.call(sections,section=>visibleIds[section.id])?.id;
		for(const link of menu.children) {
			link.classList.toggle("current", link.href.endsWith('#'+firstVisibleId));
		}
		document.body.dataset.section= firstVisibleId;
	},
	{root:main, rootMargin:"-20% 0px 0px 0px"}
);

window.addEventListener("DOMContentLoaded",()=>{
		for(const section of sections) {
			sectionObserver.observe(section)
		}
});

//----------- local navigation override

main.addEventListener("click",ev=>{
	let target= ev.target.closest("a");
	if(!target) return;
	let link= target.getAttribute("href");
	if(!link.startsWith("#")) return;

	if(link.startsWith("#-")) {
		ev.preventDefault();
		updateFilter(link.substring(2));
	}
	else if(!link.startsWith("#+")) {
		ev.preventDefault();
		let anchor= document.getElementById(link.substring(1));
		anchor?.scrollIntoView({behavior: 'smooth'});
	}
})

//----------- trick to give time to download fonts
// TODO replace with anim in css

//setTimeout(()=>(document.body.style.opacity=null),200)

