
// masonry

const VRES= 5; // rem: must match css grid-template-rows TODO? read css
const VGAP= 60;
const gallery= document.getElementById("gallery");
const heightMap= new Map();
new ResizeObserver(()=>{
		let update= false;
		for(let elt of gallery.children) {
			const h= elt.firstElementChild.getBoundingClientRect().height;
			if(((h/VRES)|0)!==(heightMap.get(elt)/VRES)|0) {
				heightMap.set(elt,h);
				update= true;
			}
		}
		if(!update) return;
		for(let [elt,h] of heightMap.entries()) {
			h+= VGAP;
			let span= (h/VRES)|0;
			elt.style.gridRow= "span "+ span;
			elt.style.height= (span*VRES)+"px";
		}
	}).observe(gallery)

// filter

document.querySelector("header").addEventListener("change", (event) => {
		const scrollY= window.scrollY;

		const filter = event.target.value.toLowerCase();
		for(const item of gallery.children) {
			item.hidden = filter !== "all" &&
				!Array.prototype.find.call(
					item.querySelectorAll("span.tag"),
					(span) => span.innerText.toLowerCase()===filter
				);
		}
		window.scrollTo(0,scrollY);
	});

// popup navigation

const popup= document.getElementById("popup");
const iframe= document.getElementById("popup-iframe");
const nextLink= document.getElementById("next");
const prevLink= document.getElementById("prev");

let scrollY= 0;

function updatePopupState() {
		let h= window.location.hash;
		if(h==="" || h==="#") {
			iframe.contentWindow.location.replace("");
			popup.close();
			//setTimeout(()=>window.scrollTo(0,scrollY),0);
		}
		else {
			scrollY= window.scrollY;
			const hrefs= Array.prototype.map.call(document.querySelectorAll("#gallery > div:not([hidden]) > a"),e=>e.href);
			const i= hrefs.indexOf(window.location.toString());
			prevLink.hidden= i===0;
			if(i>0) {
				prevLink.href= hrefs[i-1];
			}
			nextLink.hidden= i===hrefs.length-1
			if(i<hrefs.length-1) {
				nextLink.href= hrefs[i+1];
			}

			iframe.contentWindow.location.replace(h.substring(1));
			popup.showModal();
		}
}
window.addEventListener('popstate', updatePopupState);


popup.addEventListener("close", (event) => {
		window.location= "#";
		window.scrollTo(0,scrollY);
	});
/*
popup.addEventListener("click", (ev) => {
	if(ev.target===popup) {
		ev.preventDefault();
		popup.close();
	}
});
*/
updatePopupState();
