
// masonry

const VRES= 5; // rem: must match css grid-template-rows TODO? read css
const VGAP= 40;
const gallery= document.getElementById("gallery");
const heightMap= new Map();
function updateMasonry() {
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
	for(let [elt,h] of heightMap.entries()) {
		if(elt.hidden) continue;
			h+= VGAP;
		let span= (h/VRES)|0;
		elt.style.gridRow= "span "+ span;
		elt.style.height= (span*VRES)+"px";
	}
}
new ResizeObserver(updateMasonry).observe(gallery);
window.addEventListener("load",updateMasonry);

// filter

const filterBar= document.getElementById("filters");
const filterRadioByValue= Array.prototype.reduce.call(
	filterBar.querySelectorAll("input"),
	(map,input)=>(map.set(input.value,input),map),
	new Map()
);
console.log(filterRadioByValue)
filterBar.addEventListener("change", (event) => {
		window.location= "#-"+event.target.value;
	});

// navigation

const popup= document.getElementById("popup");
const iframe= document.getElementById("popup-iframe");
const nextLink= document.getElementById("next");
const prevLink= document.getElementById("prev");
const closeLink= document.getElementById("popup-close");

//let scrollY= 0;

function updatePopupState() {
	let h= window.location.hash;
	if(h.startsWith("#-")) {
		iframe.contentWindow.location.replace("about:blank");
		popup.close();

		document.querySelector("A[name=projects]").scrollIntoView();
		let filter= decodeURI(h.substring(2));
		(filterRadioByValue.get(filter)??filterRadioByValue.get(filter= "all")).checked= true;

		for(const item of gallery.children) {
			item.hidden = filter !== "all" &&
				!Array.prototype.find.call(
					item.querySelectorAll("span.tag"),
					(span) => span.innerText===filter
				);
		}
	}
	else if(h.startsWith("#+")) {
		//scrollY= window.scrollY;
		const hrefs= Array.prototype.map.call(document.querySelectorAll("#gallery > div:not([hidden]) > a"),e=>e.href);
		const i= hrefs.indexOf(window.location.toString());
		prevLink.hidden= i===0;
		if(i>0) {
			prevLink.href= hrefs[i-1];
		}
		nextLink.hidden= i===hrefs.length-1;
		if(i<hrefs.length-1) {
			nextLink.href= hrefs[i+1];
		}
		closeLink.href= "#-" + filterBar.querySelector(`input:checked`).value;
		iframe.contentWindow.location.replace(h.substring(2));
		popup.showModal();
	}
}
window.addEventListener('popstate', updatePopupState);

popup.addEventListener("close", (event) => {
		window.location= "#-" + filterBar.querySelector(`input:checked`).value;
	});

updatePopupState();
