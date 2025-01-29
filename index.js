"use strict"

//----------- masonry
/*
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
*/

const parsePx= px=>parseFloat(px);
const gallery= document.getElementById('gallery');
let slowTime= 0;

let updatingMasonry= false;
function updateMasonry() {
		gallery.classList.remove("swipe-out");
	//return;
    const gridComputedStyle = window.getComputedStyle(gallery);
    const rgap= parsePx(gridComputedStyle.getPropertyValue("grid-row-gap"));
    const cgap= parsePx(gridComputedStyle.getPropertyValue("grid-column-gap"));
    const cols= gridComputedStyle.getPropertyValue("grid-template-columns").split(" ");
    for(let i= 0; i<cols.length; ++i) cols[i]= parsePx(cols[i]) + cgap + (i ? cols[i-1]:0);
    const colHeights= cols.map(()=>0)

    const now= performance.now();

    for(let cell of gallery.children) {
        if(cell.hidden) continue;
        const h= cell.getBoundingClientRect().height;
        let hi= 0;
        for(let j= hi; ++j<colHeights.length;) if(colHeights[j]<colHeights[hi]) hi= j;
				//const prevTop= parsePx(cell.style.marginTop);
        //const prevLeft= parsePx(cell.style.left);
        cell.style.marginTop= colHeights[hi]+"px";
        const left= hi==0 ? 0 : cols[hi-1];
				/*
        const diff= Math.max(Math.abs(left-prevLeft),Math.abs(colHeights[hi]-prevTop));
				if(!cell.style.left) { // was hidden
            cell.style.transitionDuration= "0s";
				}
				else if(diff>50) {
            slowTime= performance.now()
            cell.style.transitionDuration= "";
        }
				else if(now-slowTime>500 && cell.style.transitionDuration!=="0s") {
            cell.style.transitionDuration= "0s";
        }
				*/
        cell.style.left= `${left}px`;
        colHeights[hi]+= rgap + h;
    }
		updatingMasonry= false;
		/*
		scrollToElt && setTimeout(()=>{
					scrollToElt.scrollIntoView();
					scrollToElt= undefined;
			},200)
		*/
}

const deferUpdateMasonry= ()=>{
	if(updatingMasonry) return;
	updatingMasonry= true;
	requestAnimationFrame(updateMasonry);
}
new ResizeObserver(deferUpdateMasonry).observe(gallery);

//----------- filter

const filterBar= document.getElementById("filters");
const filterLinkByHash= Array.prototype.reduce.call(
	filterBar.querySelectorAll("a"),
	(map,a)=>(map.set(a.getAttribute("href").substring(2),a),map),
	new Map()
);

let currentFilteLink= filterLinkByHash.get("all");

function updateFilter(filter) {
	let newLink= (filterLinkByHash.get(filter)??filterLinkByHash.get(filter= "all"));
	if(currentFilteLink===newLink) {
		gallery.scrollIntoView();
		return;
	}
	currentFilteLink.classList.remove("current");
	currentFilteLink= newLink;
	currentFilteLink.classList.add("current");

	gallery.classList.add("swipe-out");
}

gallery.addEventListener("transitionend", (ev)=>{
		if(ev.target!==gallery) return;
		if(gallery.classList.contains("swipe-out")) {
			updateFilter2();
		}
});

function updateFilter2() {
	const filter= currentFilteLink.getAttribute("href").substring(2);

	let scrollY= main.scrollTop;

	for(const item of gallery.children) {
		if(!item.hidden) {
			item.style.animation= "none";
		}
		item.hidden= filter !== "all" &&
			!Array.prototype.find.call(
				item.querySelectorAll("span.tag"),
				(span) => span.innerText===filter
			);
		if(item.hidden) {
			item.style.left= "";
			item.style.marginTop= "";
			item.style.animation= "";
		}
	}
	main.scrollTop= scrollY;
	gallery.scrollIntoView(/*{behavior:"instant"}*/);
	updateMasonry();
}

//----------- dark mode
const parseBool=s=>s==="true"?true:s=="false"?false:undefined;
const darkMode= document.getElementById("dark-mode");
darkMode.checked= parseBool(localStorage.getItem("dark-mode")) ?? window.matchMedia("(prefers-color-scheme: dark)").matches;

darkMode.addEventListener("change",()=>{
		let systemDarkMode= window.matchMedia("(prefers-color-scheme: dark)").matches;
		if(systemDarkMode===darkMode.checked) localStorage.removeItem("dark-mode");
		else localStorage.setItem("dark-mode",darkMode.checked);
	})

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
		const hrefs= Array.prototype.map.call(gallery.querySelectorAll("a:not([hidden])"),e=>e.href);
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

window.addEventListener('popstate',()=>{
	let h= window.location.hash;
	if(h.startsWith("#+")) {
		openDetail();
	}
	else {
		popup.close();
	}
});

let scrollToElt;

window.addEventListener("load",()=>{
	const t= `moc.liam${"g@"}nnametna.xela`.split("").reverse().join("")
	for(let a of document.querySelectorAll(`a[href='ma${"ilt"}o:']`)) {
		a.href+= t;
		a.innerHTML= t;
	}

	let h= window.location.hash;
	if(h.startsWith("#+")) {
		openDetail();
	}
	else {
		if(h.startsWith("#-")) updateFilter(h.substring(2));
		else {
			scrollToElt= document.getElementById(h.substring(1))
			scrollToElt?.scrollIntoView(/*{behavior:"instant"}*/)
		}
		window.location.replace("#")
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
		anchor?.scrollIntoView(/*{behavior:"instant"}*/);
	}
})

//----------- trick to give time to download fonts
// TODO replace with anim in css

//setTimeout(()=>(document.body.style.opacity=null),200)

