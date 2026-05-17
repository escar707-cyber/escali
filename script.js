// ===== ESCALIER - COMPLETE REDESIGN =====
(function() {
    'use strict';

    // ===== FORCE FULLSCREEN ON iOS Documents App =====
    window.addEventListener('load', function() {
        forceFullscreen();
        _initExpStoreCarousel();
        _initExpPano2();
        _initExpBoutique6();
        _initExpTour7();
        // _initDnaZoom(); // re-enabled with universal pinch zoom
        _initDnaZoom();
    });

    // ===== SCREEN 6: Boutique Store full immersive carousel =====
    function _initExpBoutique6() {
        var slides   = document.querySelectorAll('#expBoutiqueGallery .exp-boutique-slide');
        var dots     = document.querySelectorAll('#expBoutiqueNav .exp-boutique-dot');
        var playBtn  = document.getElementById('expBoutiquePlayBtn');
        var scrollBtn = document.getElementById('expBoutiqueScrollDown');
        var capTitle = document.getElementById('expBoutiqueCapTitle');
        var capSub   = document.getElementById('expBoutiqueCapSub');
        if (!slides.length) return;

        var captions = [
            { title: 'WOMEN FRONT INTERIOR', sub: 'West Jakarta, Indonesia' },
            { title: 'WOMEN FRONT INTERIOR', sub: 'Thoughtfully arranged for effortless discovery' },
            { title: 'MEN INSIDE INTERIOR',  sub: 'Spacious suites with natural lighting' }
        ];

        var cur = 0, timer = null, playing = true;

        function showSlide(idx) {
            slides.forEach(function(s,i){ s.classList.toggle('active', i===idx); });
            dots.forEach(function(d,i){ d.classList.toggle('active', i===idx); });
            if (capTitle) capTitle.textContent = captions[idx].title;
            if (capSub)   capSub.textContent   = captions[idx].sub;
            cur = idx;
        }
        function startB() {
            if (timer) clearInterval(timer);
            playing = true;
            if (playBtn) playBtn.innerHTML = '<svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><rect x="0" y="0" width="3" height="10"/><rect x="6" y="0" width="3" height="10"/></svg>';
            timer = setInterval(function(){ showSlide((cur+1) % slides.length); }, 3500);
        }
        function stopB() {
            if (timer){ clearInterval(timer); timer=null; }
            playing = false;
            if (playBtn) playBtn.innerHTML = '<svg width="10" height="12" viewBox="0 0 10 12" fill="currentColor"><polygon points="0,0 10,6 0,12"/></svg>';
        }
        dots.forEach(function(d,i){ d.addEventListener('click', function(){ stopB(); showSlide(i); }); });
        if (playBtn) playBtn.addEventListener('click', function(){ if(playing) stopB(); else startB(); });

        // Scroll-down to Screen 7
        if (scrollBtn) {
            scrollBtn.addEventListener('click', function() {
                var aboutEl = document.getElementById('about');
                if (aboutEl) {
                    var h = aboutEl.clientHeight || window.innerHeight;
                    aboutEl.scrollTo({ top: h * 6, behavior: 'smooth' });
                }
            });
        }
        showSlide(0); startB();
    }

    // ===== SCREEN 7: Store Tour — video tap handlers =====
    function _initExpTour7() {
        [
            { vid: 'womenVideo7', btn: 'womenPlayBtn7', layer: 'womenTapLayer7', mute: 'womenMuteBtn7' },
            { vid: 'menVideo7',   btn: 'menPlayBtn7',   layer: 'menTapLayer7',   mute: 'menMuteBtn7'   }
        ].forEach(function(ids) {
            var video = document.getElementById(ids.vid);
            var btn   = document.getElementById(ids.btn);
            var layer = document.getElementById(ids.layer);
            var muteBtn = document.getElementById(ids.mute);
            if (!video) return;

            function updateBtn() {
                if (btn) btn.innerHTML = video.paused
                    ? '<i class="fas fa-play"></i>'
                    : '<i class="fas fa-pause"></i>';
            }
            if (layer) layer.addEventListener('click', function() {
                video.paused ? video.play() : video.pause();
                updateBtn();
            });
            if (btn) btn.addEventListener('click', function(e) {
                e.stopPropagation();
                video.paused ? video.play() : video.pause();
                updateBtn();
            });
            if (muteBtn) muteBtn.addEventListener('click', function() {
                video.muted = !video.muted;
                muteBtn.innerHTML = video.muted
                    ? '<i class="fas fa-volume-mute"></i>'
                    : '<i class="fas fa-volume-up"></i>';
            });
        });
    }


    function _initExpPano2() {
        var viewport = document.getElementById('expPano2Viewport');
        var inner    = document.getElementById('expPano2Inner');
        var zoomLbl  = document.getElementById('expZoomLevel');
        var zoomIn   = document.getElementById('expZoomInBtn');
        var zoomOut  = document.getElementById('expZoomOutBtn');
        var zoomReset = document.getElementById('expZoomResetBtn');
        if (!inner) return;

        var zoom = 1, minZ = 1, maxZ = 4;
        var panX = 0, panY = 0;

        function applyTransform() {
            inner.style.transform = 'scale(' + zoom + ') translate(' + panX + 'px,' + panY + 'px)';
            if (zoomLbl) zoomLbl.textContent = Math.round(zoom * 100) + '%';
        }

        if (zoomIn)    zoomIn.addEventListener('click',    function() { zoom = Math.min(maxZ, zoom + 0.5); applyTransform(); });
        if (zoomOut)   zoomOut.addEventListener('click',   function() { zoom = Math.max(minZ, zoom - 0.5); applyTransform(); });
        if (zoomReset) zoomReset.addEventListener('click', function() { zoom = 1; panX = 0; panY = 0; applyTransform(); });

        applyTransform();
    }

    // ===== UTILITIES =====
    function $(id) { return document.getElementById(id); }
    function fmt(p) { return 'Rp ' + p.toLocaleString('id-ID'); }

    function showToast(msg) {
        var t = $('toast'), m = $('toastMsg');
        if (!t || !m) return;
        m.textContent = msg;
        t.classList.add('show');
        setTimeout(function(){ t.classList.remove('show'); }, 2500);
    }

    function showComingSoon(e) {
        if (e) e.preventDefault();
        showToast('Coming Soon');
    }

    // ===== DATA =====
    // ===== PRODUCT HELPER WRAPPER =====
    var P = {
        // Get catalog thumbnail (first styling, first color)
        thumb: function(p) {
            return p.colors[0].stylings[0].photos[0];
        },
        // Get thumbnail for specific color
        colorThumb: function(p, colorIdx) {
            return p.colors[colorIdx].stylings[0].photos[0];
        },
        // Get all styling photos for active color (one photo per styling)
        stylingPhotos: function(p, colorIdx) {
            return p.colors[colorIdx].stylings.map(function(s) { return s.photos[0]; });
        },
        // Get styling label for index
        stylingLabel: function(p, colorIdx, stylingIdx) {
            var s = p.colors[colorIdx].stylings[stylingIdx];
            return s ? s.label : '';
        },
        // Get color ref
        colorRef: function(p, colorIdx) {
            return p.colors[colorIdx].ref || '2020/665/446';
        },
        // Get image for basket (first styling active color)
        basketImg: function(p, colorIdx) {
            return P.colorThumb(p, colorIdx);
        }
    };

    var products = [
        {id:'1',name:'STRUCTURED OFFICE BLAZER',price:1299000,cat:'blazers',subcat:'shirts',
         colors:[
           {name:'Black',hex:'#000000',ref:'2020/665/446',stylings:[
             {label:'Office Look',photos:['assets/women_office.jpg']},
             {label:'Casual Look',photos:['assets/product-1-front.jpg']},
             {label:'Evening Look',photos:['assets/women_lifestyle.jpg']}]},
           {name:'Navy',hex:'#1A1A2E',ref:'2020/665/447',stylings:[
             {label:'Office Look',photos:['assets/N4-home.jpg']},
             {label:'Casual Look',photos:['assets/product-2-front.jpg']},
             {label:'Evening Look',photos:['assets/N5-home.jpg']}]},
           {name:'Charcoal',hex:'#4A4A4A',ref:'2020/665/448',stylings:[
             {label:'Office Look',photos:['assets/N5-home.jpg']},
             {label:'Casual Look',photos:['assets/product-3-front.jpg']},
             {label:'Evening Look',photos:['assets/N6-home.jpg']}]}
         ],
         sizes:['XS','S','M','L','XL'],measurements:{S:{chest:46.5,frontLength:61,sleeveLength:14.5},M:{chest:48.5,frontLength:63,sleeveLength:15.5},L:{chest:50.5,frontLength:65,sleeveLength:16.5}},new:true,modelH:170,style:'office',gender:'women',desc:'Structured-fit blazer with clean lines. Notched lapels, single-button closure, fully lined. Perfect for modern professional settings.'},
        {id:'2',name:'MINIMALIST SILK BLOUSE',price:899000,cat:'tops',subcat:'shirts',
         colors:[
           {name:'White',hex:'#FFFFFF',ref:'2020/221/001',stylings:[
             {label:'Office Look',photos:['assets/women_lifestyle.jpg']},
             {label:'Casual Look',photos:['assets/product-2-front.jpg']},
             {label:'Evening Look',photos:['assets/women_evening.jpg']}]},
           {name:'Cream',hex:'#F5F5DC',ref:'2020/221/002',stylings:[
             {label:'Office Look',photos:['assets/N4-home.jpg']},
             {label:'Casual Look',photos:['assets/product-4-front.jpg']},
             {label:'Evening Look',photos:['assets/N6-home.jpg']}]},
           {name:'Blush',hex:'#F4C2C2',ref:'2020/221/003',stylings:[
             {label:'Office Look',photos:['assets/active_wear.jpg']},
             {label:'Casual Look',photos:['assets/product-5-front.jpg']},
             {label:'Evening Look',photos:['assets/women_evening.jpg']}]}
         ],
         sizes:['XS','S','M','L'],measurements:{S:{chest:45,frontLength:58,sleeveLength:14},M:{chest:47,frontLength:60,sleeveLength:15}},new:true,modelH:170,style:'minimalist',gender:'women',desc:'Elegant silk blouse with minimalist design. Hidden button placket, relaxed fit, mother-of-pearl buttons.'},
        {id:'3',name:'EVENING SEQUIN DRESS',price:1599000,cat:'dress',subcat:'blouse',
         colors:[
           {name:'Black',hex:'#000000',ref:'2020/332/001',stylings:[
             {label:'Evening Look',photos:['assets/women_evening.jpg']},
             {label:'Cocktail Look',photos:['assets/product-3-front.jpg']},
             {label:'Gala Look',photos:['assets/N6-home.jpg']}]},
           {name:'Gold',hex:'#D4AF37',ref:'2020/332/002',stylings:[
             {label:'Evening Look',photos:['assets/N6-home.jpg']},
             {label:'Cocktail Look',photos:['assets/product-6-front.jpg']},
             {label:'Gala Look',photos:['assets/women_evening.jpg']}]}
         ],
         sizes:['XS','S','M','L'],measurements:{S:{chest:42,frontLength:85,sleeveLength:0},M:{chest:44,frontLength:87,sleeveLength:0}},new:true,modelH:170,style:'evening',gender:'women',desc:'Stunning sequin evening dress with elegant silhouette. Cowl neckline, bias cut, fully lined for comfort.'},
        {id:'4',name:'ACTIVE FIT LEGGINGS',price:599000,cat:'trousers',subcat:'shirts',
         colors:[
           {name:'Black',hex:'#000000',ref:'2020/440/001',stylings:[
             {label:'Active Look',photos:['assets/active_wear.jpg']},
             {label:'Casual Look',photos:['assets/product-4-front.jpg']},
             {label:'Sport Look',photos:['assets/women_office.jpg']}]},
           {name:'Charcoal',hex:'#4A4A4A',ref:'2020/440/002',stylings:[
             {label:'Active Look',photos:['assets/product-4-front.jpg']},
             {label:'Casual Look',photos:['assets/active_wear.jpg']},
             {label:'Sport Look',photos:['assets/N4-home.jpg']}]}
         ],
         sizes:['XS','S','M','L','XL'],measurements:{S:{chest:0,frontLength:92,sleeveLength:0},M:{chest:0,frontLength:94,sleeveLength:0}},new:true,modelH:170,style:'active',gender:'women',desc:'High-performance active leggings with moisture-wicking fabric. High-waisted, four-way stretch, hidden pocket.'},
        {id:'5',name:'CASHMERE BLEND KNITWEAR',price:1199000,cat:'knitwear',subcat:'knitwear',
         colors:[
           {name:'Camel',hex:'#C19A6B',ref:'2020/550/001',stylings:[
             {label:'Office Look',photos:['assets/N4-home.jpg']},
             {label:'Casual Look',photos:['assets/product-5-front.jpg']},
             {label:'Weekend Look',photos:['assets/women_lifestyle.jpg']}]},
           {name:'Grey',hex:'#808080',ref:'2020/550/002',stylings:[
             {label:'Office Look',photos:['assets/N5-home.jpg']},
             {label:'Casual Look',photos:['assets/product-1-front.jpg']},
             {label:'Weekend Look',photos:['assets/women_office.jpg']}]},
           {name:'Black',hex:'#000000',ref:'2020/550/003',stylings:[
             {label:'Office Look',photos:['assets/women_office.jpg']},
             {label:'Casual Look',photos:['assets/product-3-front.jpg']},
             {label:'Weekend Look',photos:['assets/N6-home.jpg']}]}
         ],
         sizes:['S','M','L','XL'],measurements:{S:{chest:48,frontLength:62,sleeveLength:56},M:{chest:50,frontLength:64,sleeveLength:58}},new:true,modelH:170,style:'office',gender:'women',desc:'Luxurious cashmere blend knit sweater. Relaxed fit, ribbed cuffs and hem, crew neckline.'},
        {id:'6',name:'TAILORED WOOL TROUSERS',price:999000,cat:'trousers',subcat:'shirts',
         colors:[
           {name:'Black',hex:'#000000',ref:'2020/660/001',stylings:[
             {label:'Office Look',photos:['assets/N5-home.jpg']},
             {label:'Casual Look',photos:['assets/product-6-front.jpg']},
             {label:'Evening Look',photos:['assets/women_office.jpg']}]},
           {name:'Navy',hex:'#1A1A2E',ref:'2020/660/002',stylings:[
             {label:'Office Look',photos:['assets/women_office.jpg']},
             {label:'Casual Look',photos:['assets/product-2-front.jpg']},
             {label:'Evening Look',photos:['assets/N4-home.jpg']}]},
           {name:'Grey',hex:'#808080',ref:'2020/660/003',stylings:[
             {label:'Office Look',photos:['assets/N4-home.jpg']},
             {label:'Casual Look',photos:['assets/product-4-front.jpg']},
             {label:'Evening Look',photos:['assets/N5-home.jpg']}]}
         ],
         sizes:['XS','S','M','L','XL'],measurements:{S:{chest:0,frontLength:98,sleeveLength:0},M:{chest:0,frontLength:100,sleeveLength:0}},new:true,modelH:170,style:'minimalist',gender:'women',desc:'Impeccably tailored wool trousers. Straight leg, pressed creases, hidden zip closure.'},
        {id:'7',name:'EVENING SATIN TOP',price:799000,cat:'tops',subcat:'blouse',
         colors:[
           {name:'Emerald',hex:'#50C878',ref:'2020/770/001',stylings:[
             {label:'Evening Look',photos:['assets/N6-home.jpg']},
             {label:'Cocktail Look',photos:['assets/product-1-front.jpg']},
             {label:'Casual Look',photos:['assets/women_lifestyle.jpg']}]},
           {name:'Burgundy',hex:'#800020',ref:'2020/770/002',stylings:[
             {label:'Evening Look',photos:['assets/women_evening.jpg']},
             {label:'Cocktail Look',photos:['assets/product-5-front.jpg']},
             {label:'Casual Look',photos:['assets/N6-home.jpg']}]}
         ],
         sizes:['XS','S','M','L'],measurements:{S:{chest:43,frontLength:55,sleeveLength:12},M:{chest:45,frontLength:57,sleeveLength:13}},new:true,modelH:170,style:'evening',gender:'women',desc:'Elegant satin evening top with draped neckline. Relaxed fit, concealed side zip.'},
        {id:'8',name:'PERFORMANCE SPORTS BRA',price:399000,cat:'tops',subcat:'shirts',
         colors:[
           {name:'Black',hex:'#000000',ref:'2020/880/001',stylings:[
             {label:'Active Look',photos:['assets/active_wear.jpg']},
             {label:'Sport Look',photos:['assets/product-2-front.jpg']},
             {label:'Casual Look',photos:['assets/product-4-front.jpg']}]},
           {name:'Olive',hex:'#808000',ref:'2020/880/002',stylings:[
             {label:'Active Look',photos:['assets/product-2-front.jpg']},
             {label:'Sport Look',photos:['assets/active_wear.jpg']},
             {label:'Casual Look',photos:['assets/N4-home.jpg']}]}
         ],
         sizes:['XS','S','M','L'],measurements:{S:{chest:38,frontLength:30,sleeveLength:0},M:{chest:40,frontLength:32,sleeveLength:0}},new:true,modelH:170,style:'active',gender:'women',desc:'High-support sports bra with breathable mesh panels. Removable padding, racerback design.'},
        {id:'9',name:'CLASSIC WHITE SHIRT',price:699000,cat:'shirts',subcat:'shirts',
         colors:[
           {name:'White',hex:'#FFFFFF',ref:'2020/990/001',stylings:[
             {label:'Office Look',photos:['assets/women_office.jpg']},
             {label:'Casual Look',photos:['assets/product-3-front.jpg']},
             {label:'Evening Look',photos:['assets/women_lifestyle.jpg']}]},
           {name:'Blue Stripe',hex:'#E8F4FD',ref:'2020/990/002',stylings:[
             {label:'Office Look',photos:['assets/N4-home.jpg']},
             {label:'Casual Look',photos:['assets/product-1-front.jpg']},
             {label:'Evening Look',photos:['assets/N6-home.jpg']}]}
         ],
         sizes:['XS','S','M','L','XL'],measurements:{S:{chest:46,frontLength:65,sleeveLength:20},M:{chest:48,frontLength:67,sleeveLength:21}},new:true,modelH:170,style:'office',gender:'women',desc:'Crisp cotton poplin shirt with tailored fit. Spread collar, button cuffs, curved hem.'},
        {id:'10',name:'RELAXED LINEN SHIRT',price:799000,cat:'shirts',subcat:'shirts',
         colors:[
           {name:'Sand',hex:'#C2B280',ref:'2020/100/001',stylings:[
             {label:'Casual Look',photos:['assets/women_lifestyle.jpg']},
             {label:'Weekend Look',photos:['assets/product-4-front.jpg']},
             {label:'Office Look',photos:['assets/N5-home.jpg']}]},
           {name:'White',hex:'#FFFFFF',ref:'2020/100/002',stylings:[
             {label:'Casual Look',photos:['assets/product-4-front.jpg']},
             {label:'Weekend Look',photos:['assets/women_lifestyle.jpg']},
             {label:'Office Look',photos:['assets/women_office.jpg']}]},
           {name:'Sage',hex:'#9DC183',ref:'2020/100/003',stylings:[
             {label:'Casual Look',photos:['assets/N6-home.jpg']},
             {label:'Weekend Look',photos:['assets/product-6-front.jpg']},
             {label:'Office Look',photos:['assets/N4-home.jpg']}]}
         ],
         sizes:['XS','S','M','L'],measurements:{S:{chest:50,frontLength:68,sleeveLength:22},M:{chest:52,frontLength:70,sleeveLength:23}},new:true,modelH:170,style:'minimalist',gender:'women',desc:'Breathable linen shirt with relaxed silhouette. Camp collar, patch pocket, side vents.'},
        {id:'11',name:'VELVET EVENING BLOUSE',price:1099000,cat:'blazers',subcat:'blouse',
         colors:[
           {name:'Deep Red',hex:'#8B0000',ref:'2020/110/001',stylings:[
             {label:'Evening Look',photos:['assets/women_evening.jpg']},
             {label:'Cocktail Look',photos:['assets/product-5-front.jpg']},
             {label:'Gala Look',photos:['assets/N6-home.jpg']}]},
           {name:'Black',hex:'#000000',ref:'2020/110/002',stylings:[
             {label:'Evening Look',photos:['assets/N6-home.jpg']},
             {label:'Cocktail Look',photos:['assets/product-1-front.jpg']},
             {label:'Gala Look',photos:['assets/women_evening.jpg']}]}
         ],
         sizes:['XS','S','M','L'],measurements:{S:{chest:44,frontLength:56,sleeveLength:15},M:{chest:46,frontLength:58,sleeveLength:16}},new:true,modelH:170,style:'evening',gender:'women',desc:'Luxurious velvet blouse with dramatic sleeves. V-neckline, smocked cuffs, relaxed fit.'},
        {id:'12',name:'STRIPE COTTON SHIRT',price:649000,cat:'shirts',subcat:'stripes',
         colors:[
           {name:'Navy Stripe',hex:'#1A1A2E',ref:'2020/120/001',stylings:[
             {label:'Office Look',photos:['assets/N4-home.jpg']},
             {label:'Casual Look',photos:['assets/product-6-front.jpg']},
             {label:'Weekend Look',photos:['assets/women_lifestyle.jpg']}]},
           {name:'Red Stripe',hex:'#DC143C',ref:'2020/120/002',stylings:[
             {label:'Office Look',photos:['assets/women_office.jpg']},
             {label:'Casual Look',photos:['assets/product-2-front.jpg']},
             {label:'Weekend Look',photos:['assets/N5-home.jpg']}]}
         ],
         sizes:['XS','S','M','L','XL'],measurements:{S:{chest:47,frontLength:66,sleeveLength:20},M:{chest:49,frontLength:68,sleeveLength:21}},new:true,modelH:170,style:'office',gender:'women',desc:'Classic striped cotton shirt with modern cut. Button-down collar, chest pocket.'},
        {id:'13',name:'CHECKED FLANNEL SHIRT',price:749000,cat:'shirts',subcat:'checked',
         colors:[
           {name:'Red Check',hex:'#B22222',ref:'2020/130/001',stylings:[
             {label:'Casual Look',photos:['assets/N5-home.jpg']},
             {label:'Weekend Look',photos:['assets/product-1-front.jpg']},
             {label:'Outdoor Look',photos:['assets/active_wear.jpg']}]},
           {name:'Grey Check',hex:'#696969',ref:'2020/130/002',stylings:[
             {label:'Casual Look',photos:['assets/women_lifestyle.jpg']},
             {label:'Weekend Look',photos:['assets/product-3-front.jpg']},
             {label:'Outdoor Look',photos:['assets/N4-home.jpg']}]}
         ],
         sizes:['XS','S','M','L'],measurements:{S:{chest:49,frontLength:69,sleeveLength:21},M:{chest:51,frontLength:71,sleeveLength:22}},new:true,modelH:170,style:'minimalist',gender:'women',desc:'Soft flannel shirt with classic checked pattern. Point collar, button cuffs.'},
        {id:'14',name:'SILK EVENING CAMISOLE',price:699000,cat:'tops',subcat:'blouse',
         colors:[
           {name:'Champagne',hex:'#F7E7CE',ref:'2020/140/001',stylings:[
             {label:'Evening Look',photos:['assets/N6-home.jpg']},
             {label:'Cocktail Look',photos:['assets/product-2-front.jpg']},
             {label:'Casual Look',photos:['assets/women_lifestyle.jpg']}]},
           {name:'Black',hex:'#000000',ref:'2020/140/002',stylings:[
             {label:'Evening Look',photos:['assets/women_evening.jpg']},
             {label:'Cocktail Look',photos:['assets/product-4-front.jpg']},
             {label:'Casual Look',photos:['assets/N5-home.jpg']}]}
         ],
         sizes:['XS','S','M','L'],measurements:{S:{chest:41,frontLength:52,sleeveLength:0},M:{chest:43,frontLength:54,sleeveLength:0}},new:true,modelH:170,style:'evening',gender:'women',desc:'Delicate silk camisole with lace trim. Adjustable straps, relaxed fit.'},
        {id:'15',name:'OVERSIZED HOODIE',price:899000,cat:'knitwear',subcat:'knitwear',
         colors:[
           {name:'Grey',hex:'#808080',ref:'2020/150/001',stylings:[
             {label:'Casual Look',photos:['assets/women_office.jpg']},
             {label:'Weekend Look',photos:['assets/product-3-front.jpg']},
             {label:'Active Look',photos:['assets/active_wear.jpg']}]},
           {name:'Beige',hex:'#F5F5DC',ref:'2020/150/002',stylings:[
             {label:'Casual Look',photos:['assets/women_lifestyle.jpg']},
             {label:'Weekend Look',photos:['assets/product-5-front.jpg']},
             {label:'Active Look',photos:['assets/N4-home.jpg']}]}
         ],
         sizes:['S','M','L','XL'],measurements:{S:{chest:55,frontLength:65,sleeveLength:55},M:{chest:57,frontLength:67,sleeveLength:57}},new:true,modelH:170,style:'active',gender:'women',desc:'Ultra-comfortable oversized hoodie with fleece lining. Kangaroo pocket, drawstring hood.'},
        {id:'16',name:'CROPPED DENIM JACKET',price:1199000,cat:'jackets',subcat:'shirts',
         colors:[
           {name:'Light Wash',hex:'#B0C4DE',ref:'2020/160/001',stylings:[
             {label:'Casual Look',photos:['assets/women_lifestyle.jpg']},
             {label:'Street Look',photos:['assets/product-4-front.jpg']},
             {label:'Weekend Look',photos:['assets/N4-home.jpg']}]},
           {name:'Dark Wash',hex:'#4682B4',ref:'2020/160/002',stylings:[
             {label:'Casual Look',photos:['assets/N5-home.jpg']},
             {label:'Street Look',photos:['assets/product-6-front.jpg']},
             {label:'Weekend Look',photos:['assets/women_office.jpg']}]}
         ],
         sizes:['XS','S','M','L'],measurements:{S:{chest:48,frontLength:50,sleeveLength:55},M:{chest:50,frontLength:52,sleeveLength:57}},new:true,modelH:170,style:'office',gender:'women',desc:'Modern cropped denim jacket with vintage wash. Button front, chest pockets.'},
        {id:'17',name:'PLEATED MIDI SKIRT',price:899000,cat:'skirts',subcat:'shirts',
         colors:[
           {name:'Black',hex:'#000000',ref:'2020/170/001',stylings:[
             {label:'Office Look',photos:['assets/women_evening.jpg']},
             {label:'Casual Look',photos:['assets/product-5-front.jpg']},
             {label:'Evening Look',photos:['assets/N6-home.jpg']}]},
           {name:'Navy',hex:'#1A1A2E',ref:'2020/170/002',stylings:[
             {label:'Office Look',photos:['assets/N5-home.jpg']},
             {label:'Casual Look',photos:['assets/product-3-front.jpg']},
             {label:'Evening Look',photos:['assets/women_evening.jpg']}]}
         ],
         sizes:['XS','S','M','L'],measurements:{S:{chest:0,frontLength:75,sleeveLength:0},M:{chest:0,frontLength:77,sleeveLength:0}},new:true,modelH:170,style:'minimalist',gender:'women',desc:'Elegant pleated midi skirt with flowing silhouette. Elastic waist, fully lined.'},
        {id:'18',name:'EMBELLISHED EVENING GOWN',price:2599000,cat:'dress',subcat:'blouse',
         colors:[
           {name:'Midnight Blue',hex:'#191970',ref:'2020/180/001',stylings:[
             {label:'Gala Look',photos:['assets/active_wear.jpg']},
             {label:'Evening Look',photos:['assets/product-6-front.jpg']},
             {label:'Cocktail Look',photos:['assets/women_evening.jpg']}]},
           {name:'Burgundy',hex:'#800020',ref:'2020/180/002',stylings:[
             {label:'Gala Look',photos:['assets/women_evening.jpg']},
             {label:'Evening Look',photos:['assets/product-2-front.jpg']},
             {label:'Cocktail Look',photos:['assets/N6-home.jpg']}]}
         ],
         sizes:['XS','S','M','L'],measurements:{S:{chest:40,frontLength:155,sleeveLength:0},M:{chest:42,frontLength:157,sleeveLength:0}},new:true,modelH:170,style:'evening',gender:'women',desc:'Show-stopping embellished evening gown with intricate beadwork. Column silhouette, high slit.'}
    ];

    var menProducts = [
        {id:'m1',name:'SLIM FIT OXFORD SHIRT',price:799000,cat:'shirts',subcat:'shirts',
         colors:[
           {name:'White',hex:'#FFFFFF',ref:'2020/M01/001',stylings:[
             {label:'Urban Look',photos:['assets/men_urban.png']},
             {label:'Formal Look',photos:['assets/product-1-front.jpg']},
             {label:'Casual Look',photos:['assets/men_casual.png']}]},
           {name:'Light Blue',hex:'#ADD8E6',ref:'2020/M01/002',stylings:[
             {label:'Urban Look',photos:['assets/men_formal.png']},
             {label:'Formal Look',photos:['assets/product-2-front.jpg']},
             {label:'Casual Look',photos:['assets/men_urban.png']}]}
         ],
         sizes:['S','M','L','XL','2XL'],measurements:{M:{chest:52,frontLength:72,sleeveLength:23},L:{chest:54,frontLength:74,sleeveLength:24}},new:true,modelH:185,style:'urban',gender:'men',desc:'Classic Oxford shirt with modern slim fit. Button-down collar, single cuff.'},
        {id:'m2',name:'TAILORED SUIT JACKET',price:1899000,cat:'blazers',subcat:'shirts',
         colors:[
           {name:'Navy',hex:'#1A1A2E',ref:'2020/M02/001',stylings:[
             {label:'Formal Look',photos:['assets/men_formal.png']},
             {label:'Business Look',photos:['assets/product-2-front.jpg']},
             {label:'Smart Casual',photos:['assets/men_urban.png']}]},
           {name:'Charcoal',hex:'#4A4A4A',ref:'2020/M02/002',stylings:[
             {label:'Formal Look',photos:['assets/men_street.png']},
             {label:'Business Look',photos:['assets/product-3-front.jpg']},
             {label:'Smart Casual',photos:['assets/men_formal.png']}]}
         ],
         sizes:['S','M','L','XL'],measurements:{M:{chest:52,frontLength:72,sleeveLength:62},L:{chest:54,frontLength:74,sleeveLength:64}},new:true,modelH:185,style:'formal',gender:'men',desc:'Impeccably tailored suit jacket in premium wool. Two-button closure, notch lapels.'},
        {id:'m3',name:'STREET STYLE BOMBER',price:1299000,cat:'jackets',subcat:'shirts',
         colors:[
           {name:'Black',hex:'#000000',ref:'2020/M03/001',stylings:[
             {label:'Street Look',photos:['assets/men_street.png']},
             {label:'Casual Look',photos:['assets/product-3-front.jpg']},
             {label:'Urban Look',photos:['assets/men_urban.png']}]},
           {name:'Olive',hex:'#808000',ref:'2020/M03/002',stylings:[
             {label:'Street Look',photos:['assets/men_casual.png']},
             {label:'Casual Look',photos:['assets/product-5-front.jpg']},
             {label:'Urban Look',photos:['assets/men_street.png']}]}
         ],
         sizes:['S','M','L','XL','2XL'],measurements:{M:{chest:56,frontLength:65,sleeveLength:60},L:{chest:58,frontLength:67,sleeveLength:62}},new:true,modelH:185,style:'street',gender:'men',desc:'Contemporary bomber jacket with streetwear edge. Ribbed trims, zip closure, utility pockets.'},
        {id:'m4',name:'COTTON CREW NECK TEE',price:299000,cat:'tshirts',subcat:'shirts',
         colors:[
           {name:'White',hex:'#FFFFFF',ref:'2020/M04/001',stylings:[
             {label:'Urban Look',photos:['assets/men_urban.png']},
             {label:'Casual Look',photos:['assets/product-4-front.jpg']},
             {label:'Street Look',photos:['assets/men_casual.png']}]},
           {name:'Black',hex:'#000000',ref:'2020/M04/002',stylings:[
             {label:'Urban Look',photos:['assets/men_street.png']},
             {label:'Casual Look',photos:['assets/product-6-front.jpg']},
             {label:'Street Look',photos:['assets/men_urban.png']}]},
           {name:'Grey',hex:'#808080',ref:'2020/M04/003',stylings:[
             {label:'Urban Look',photos:['assets/men_casual.png']},
             {label:'Casual Look',photos:['assets/product-2-front.jpg']},
             {label:'Street Look',photos:['assets/men_formal.png']}]}
         ],
         sizes:['S','M','L','XL','2XL'],measurements:{M:{chest:51,frontLength:69,sleeveLength:20},L:{chest:53,frontLength:71,sleeveLength:21}},new:true,modelH:185,style:'urban',gender:'men',desc:'Premium cotton crew neck t-shirt with perfect fit. Reinforced neckline, pre-shrunk.'},
        {id:'m5',name:'SLIM FIT CHINOS',price:899000,cat:'trousers',subcat:'shirts',
         colors:[
           {name:'Khaki',hex:'#C3B091',ref:'2020/M05/001',stylings:[
             {label:'Formal Look',photos:['assets/men_formal.png']},
             {label:'Casual Look',photos:['assets/product-5-front.jpg']},
             {label:'Smart Look',photos:['assets/men_urban.png']}]},
           {name:'Navy',hex:'#1A1A2E',ref:'2020/M05/002',stylings:[
             {label:'Formal Look',photos:['assets/men_urban.png']},
             {label:'Casual Look',photos:['assets/product-1-front.jpg']},
             {label:'Smart Look',photos:['assets/men_formal.png']}]},
           {name:'Olive',hex:'#808000',ref:'2020/M05/003',stylings:[
             {label:'Formal Look',photos:['assets/men_street.png']},
             {label:'Casual Look',photos:['assets/product-3-front.jpg']},
             {label:'Smart Look',photos:['assets/men_casual.png']}]}
         ],
         sizes:['S','M','L','XL','2XL'],measurements:{M:{chest:0,frontLength:102,sleeveLength:0},L:{chest:0,frontLength:104,sleeveLength:0}},new:true,modelH:185,style:'formal',gender:'men',desc:'Versatile slim fit chinos in stretch cotton. Flat front, belt loops, zip fly.'},
        {id:'m6',name:'GRAPHIC PRINT TEE',price:499000,cat:'tshirts',subcat:'shirts',
         colors:[
           {name:'Black',hex:'#000000',ref:'2020/M06/001',stylings:[
             {label:'Street Look',photos:['assets/men_street.png']},
             {label:'Urban Look',photos:['assets/product-6-front.jpg']},
             {label:'Casual Look',photos:['assets/men_casual.png']}]},
           {name:'White',hex:'#FFFFFF',ref:'2020/M06/002',stylings:[
             {label:'Street Look',photos:['assets/men_casual.png']},
             {label:'Urban Look',photos:['assets/product-4-front.jpg']},
             {label:'Casual Look',photos:['assets/men_street.png']}]}
         ],
         sizes:['S','M','L','XL'],measurements:{M:{chest:53,frontLength:71,sleeveLength:21},L:{chest:55,frontLength:73,sleeveLength:22}},new:true,modelH:185,style:'street',gender:'men',desc:'Bold graphic print t-shirt with streetwear aesthetic. Oversized fit, dropped shoulders.'}
    ];

    // Cart state
    var cart = JSON.parse(localStorage.getItem('escalier_cart') || '[]');
    var wishlist = JSON.parse(localStorage.getItem('escalier_wishlist') || '[]');

    function saveCart() {
        localStorage.setItem('escalier_cart', JSON.stringify(cart));
        updateCartBadge();
    }

    function updateCartBadge() {
        var total = cart.reduce(function(s,c){return s + c.qty},0);
        // basket section tab
        var bpCount = $('basketPageCount');
        if (bpCount) bpCount.textContent = total > 0 ? '(' + total + ')' : '';
        // cart-count spans (original style: show number, hidden when 0)
        ['cartCount','pdpCartCount','fmCartCount'].forEach(function(id) {
            var el = $(id);
            if (!el) return;
            el.textContent = total > 0 ? String(total) : '';
            el.style.display = total > 0 ? '' : 'none';
        });
    }
    updateCartBadge();
    updateWishlistBadge();

    // ===== STATE =====
    var currentGender = 'women';
    var currentSection = 'home';
    var currentViewMode = 'vg1';
    var currentProduct = null;
    var selectedColor = 0;
    var selectedSize = null;
    var selectedQty = 1;
    var filterState = {sort:'new',colors:[],sizes:[],priceMin:59900,priceMax:999999};
    var currentClothingCategory = 'Shirts';
    var currentClothingSubcat = 'View All';
    var basketActiveTab = 'basket';

    // Navigation history stack
    var navHistory = [];
    var _isRestoring = false;

    function pushHistory(sectionId, restoreFn) {
        if (_isRestoring) return;
        navHistory.push({section: sectionId, restore: restoreFn});
        if (navHistory.length > 20) navHistory.shift();
    }
    function navigateBack() {
        if (navHistory.length === 0) {
            goHome();
            return;
        }
        navHistory.pop();
        var prev = navHistory[navHistory.length - 1];
        if (prev && prev.restore) {
            _isRestoring = true;
            prev.restore();
            _isRestoring = false;
        } else {
            goHome();
        }
    }

    // ===== HEADER THEME =====
    var siteHeader = $('siteHeader');

    function updateHeaderTheme() {
        if (!siteHeader) return;
        var theme = 'dark';
        var headerH = siteHeader.offsetHeight || 72;
        // Find the section currently dominating the viewport (under the header)
        var allSections = document.querySelectorAll('section[id]');
        var bestSection = null;
        var bestOverlap = 0;
        for (var i = 0; i < allSections.length; i++) {
            var s = allSections[i];
            if (s.style.display === 'none') continue;
            var rect = s.getBoundingClientRect();
            if (rect.height === 0) continue;
            // Calculate how much of this section overlaps the viewport below header
            var overlapTop = Math.max(rect.top, headerH);
            var overlapBottom = Math.min(rect.bottom, window.innerHeight);
            var overlap = Math.max(0, overlapBottom - overlapTop);
            if (overlap > bestOverlap) {
                bestOverlap = overlap;
                bestSection = s;
            }
        }
        if (bestSection) {
            var st = bestSection.getAttribute('data-header-theme');
            if (st) theme = st;
        }
        // Overrides for overlays / catalog sections
        var catalogSections = document.querySelectorAll('.catalog-section');
        for (var j = 0; j < catalogSections.length; j++) {
            if (catalogSections[j].style.display !== 'none') { theme = 'light'; }
        }
        if ($('fullMenu') && $('fullMenu').classList.contains('active')) { theme = 'light'; }
        if (($('newItemAnimation') && $('newItemAnimation').style.display !== 'none') ||
            ($('collectionAutoScroll') && $('collectionAutoScroll').style.display !== 'none')) { theme = 'dark'; }
        siteHeader.classList.remove('theme-dark', 'theme-light');
        siteHeader.classList.add('theme-' + theme);
        var isDark = theme === 'dark';
        var iconColor = isDark ? '#ffffff' : '#1a1a1a';
        // Update inline styles for brand-text and icon-btn
        var wordmark = $('headerWordmark');
        if (wordmark) wordmark.style.setProperty('color', iconColor, 'important');
        document.querySelectorAll('#headerRight .icon-btn, #headerRight .menu-toggle').forEach(function(btn) {
            btn.style.color = iconColor;
        });
        document.querySelectorAll('#headerRight .icon-btn i').forEach(function(icon) {
            icon.style.color = iconColor;
        });
        document.querySelectorAll('#headerRight .menu-toggle span').forEach(function(span) {
            span.style.backgroundColor = iconColor;
        });
        document.querySelectorAll('.cat-row1, .cat-row2, .cat-row3').forEach(function(row) {
            if (isDark) {
                row.classList.add('cat-dark');
                row.classList.remove('cat-light');
            } else {
                row.classList.add('cat-light');
                row.classList.remove('cat-dark');
            }
        });
    }
    // Use scroll event for smooth theme transitions
    window.addEventListener('scroll', updateHeaderTheme, {passive: true});
    // Force dark theme on initial load (hero is dark)
    if (siteHeader) {
        siteHeader.classList.remove('theme-dark', 'theme-light');
        siteHeader.classList.add('theme-dark');
    }

    // ===== HEADER HIDE ON SCROLL DOWN / SHOW ON SCROLL UP =====
    var _lastScrollY = 0;
    var _headerHidden = false;
    var _scrollTicking = false;

    function handleScrollDirection(currentY) {
        if (_scrollTicking) return;
        _scrollTicking = true;
        requestAnimationFrame(function() {
            var diff = currentY - _lastScrollY;
            if (diff > 4 && currentY > 80 && !_headerHidden) {
                siteHeader && siteHeader.classList.add('header-hidden');
                _headerHidden = true;
            } else if (diff < -4 && _headerHidden) {
                siteHeader && siteHeader.classList.remove('header-hidden');
                _headerHidden = false;
            }
            _lastScrollY = currentY;
            _scrollTicking = false;
        });
    }

    // Global window scroll (for non-about sections)
    window.addEventListener('scroll', function() {
        handleScrollDirection(window.scrollY);
    }, { passive: true });

    // About-section inner scroll container
    var aboutSection = document.getElementById('about');
    if (aboutSection) {
        var _lastAboutScrollY  = 0;
        var _headerVisible     = true;
        var _hideTimer         = null;

        function setHeaderIcons(visible) {
            // Only toggle icons (search, bag, home, hamburger) — not logo
            var headerRight = document.getElementById('headerRight');
            if (!headerRight) return;
            headerRight.querySelectorAll('.icon-btn, .menu-toggle').forEach(function(el) {
                el.style.visibility  = visible ? '' : 'hidden';
                el.style.opacity     = visible ? '' : '0';
            });
        }

        function showHeader() {
            var header = document.getElementById('siteHeader');
            if (!header) return;
            header.classList.remove('header-hidden');
            header.classList.remove('theme-light');
            header.classList.add('theme-dark');
            _headerVisible = true;
            setHeaderIcons(true);
        }

        function hideIcons() {
            // Hide icons but keep header visible (logo stays)
            setHeaderIcons(false);
        }

        aboutSection.addEventListener('scroll', function() {
            var currentY  = aboutSection.scrollTop;
            var screenH   = aboutSection.clientHeight || window.innerHeight;
            var screenIdx = Math.round(currentY / screenH);
            var delta     = currentY - _lastAboutScrollY;

            // Always dark theme
            var header = document.getElementById('siteHeader');
            if (header) {
                header.classList.remove('theme-light');
                header.classList.add('theme-dark');
            }

            // Hide icons during scroll, show when settled
            hideIcons();
            clearTimeout(_hideTimer);
            _hideTimer = setTimeout(function() {
                // Scroll settled — show icons again
                setHeaderIcons(true);
                // If scrolled down significantly, hide entire header
                if (header && delta > 10) {
                    header.classList.add('header-hidden');
                    _headerVisible = false;
                } else if (header && delta < -10) {
                    header.classList.remove('header-hidden');
                    _headerVisible = true;
                }
            }, 150);

            // DNA screen: activate X button
            document.body.classList.toggle('dna-section-active', screenIdx === 5);

            _lastAboutScrollY = currentY;
        }, { passive: true });

        // Show header when experience section first entered
        aboutSection.addEventListener('scrollend', function() {
            showHeader();
        }, { passive: true });
    }

    // Wire DNA X button
    var dnaXBtn = document.getElementById('dnaXBtn');
    if (dnaXBtn) {
        function dnaXClose() {
            var aboutEl = document.getElementById('about');
            if (!aboutEl) return;
            document.body.classList.remove('dna-section-active');
            var header = document.getElementById('siteHeader');
            if (header) header.classList.remove('header-hidden');
            aboutEl.style.scrollSnapType = 'none';
            aboutEl.style.overflow = 'hidden';
            aboutEl.scrollTop = (aboutEl.clientHeight || window.innerHeight) * 4;
            setTimeout(function() {
                aboutEl.style.overflow = '';
                aboutEl.style.scrollSnapType = '';
            }, 100);
        }
        dnaXBtn.addEventListener('click', dnaXClose);
        dnaXBtn.addEventListener('touchend', function(e) {
            e.preventDefault();
            dnaXClose();
        }, { passive: false });
    }

    // ===== LANGUAGE =====
    var languageSwitcher = $('languageSwitcher');
    var currentFlag = $('currentFlag');
    if ($('languageToggle') && languageSwitcher) {
        $('languageToggle').addEventListener('click', function() { languageSwitcher.classList.toggle('open'); });
        document.addEventListener('click', function(e) { if (!languageSwitcher.contains(e.target)) languageSwitcher.classList.remove('open'); });
    }
    // Full menu language switcher
    var fmLanguageSwitcher = $('fmLanguageSwitcher');
    var fmLanguageToggle = $('fmLanguageToggle');
    var fmLanguageDropdown = $('fmLanguageDropdown');
    var fmCurrentFlag = $('fmCurrentFlag');
    if (fmLanguageToggle && fmLanguageDropdown) {
        fmLanguageToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            fmLanguageDropdown.classList.toggle('open');
        });
        document.addEventListener('click', function(e) {
            if (fmLanguageDropdown && !fmLanguageSwitcher.contains(e.target)) {
                fmLanguageDropdown.classList.remove('open');
            }
        });
    }
    // Language option click handlers (works for both homepage and full menu)
    var flagMap = { en: 'assets/flag_us.svg', id: 'assets/flag_id.svg', ko: 'assets/flag_kr.svg' };
    var langNames = { en: 'EN', id: 'ID', ko: 'KR' };
    document.querySelectorAll('.language-option').forEach(function(btn) {
        btn.addEventListener('click', function() {
            var lang = this.dataset.lang;
            if (currentFlag && flagMap[lang]) {
                currentFlag.src = flagMap[lang];
                currentFlag.alt = langNames[lang] || lang.toUpperCase();
            }
            if (fmCurrentFlag && flagMap[lang]) {
                fmCurrentFlag.src = flagMap[lang];
                fmCurrentFlag.alt = langNames[lang] || lang.toUpperCase();
            }
            if (languageSwitcher) languageSwitcher.classList.remove('open');
            if (fmLanguageDropdown) fmLanguageDropdown.classList.remove('open');
        });
    });

    // ===== MENU =====
    var fullMenu = $('fullMenu');

    function openMenu() {
        if (!fullMenu) return;
        renderMenu(currentGender);
        fullMenu.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        if (!fullMenu) return;
        fullMenu.classList.remove('active');
        document.body.style.overflow = '';
    }

    $('menuToggle') && $('menuToggle').addEventListener('click', openMenu);
    $('fmHeaderBrand') && $('fmHeaderBrand').addEventListener('click', function(e) { e.preventDefault(); closeMenu(); goHome(); });

    // ===== HOME BUTTON (Universal) =====
    function navigateHome() {
        // Close any overlay
        closeMenu();
        var pdpEl = $('productDetail');
        if (pdpEl) { pdpEl.style.display = 'none'; pdpEl.classList.remove('active'); }
        if ($('measurementPage')) $('measurementPage').style.display = 'none';
        
        // Go home
        goHome();
        
        // Wait 2 seconds then show New In based on current gender
        setTimeout(function() {
            if (currentGender === 'women') {
                startWomenFlow();
            } else {
                startMenFlow();
            }
        }, 2000);
    }

    // Attach home button listeners
    $('homeBtn') && $('homeBtn').addEventListener('click', navigateHome);
    $('fmHomeBtn') && $('fmHomeBtn').addEventListener('click', function() {
        navigateHome();
    });

    // ===== HOME BUTTON VISIBILITY =====
    function updateHomeButtonVisibility() {
        var homeBtn = $('homeBtn');
        var fmHomeBtn = $('fmHomeBtn');
        // Hide in product detail and basket
        var isPDPVisible = $('productDetail') && $('productDetail').style.display !== 'none' && getComputedStyle($('productDetail')).display !== 'none';
        var isBasketVisible = $('basketPage') && $('basketPage').style.display !== 'none' && getComputedStyle($('basketPage')).display !== 'none';
        
        if (homeBtn) {
            homeBtn.style.display = (isPDPVisible || isBasketVisible) ? 'none' : '';
        }
        if (fmHomeBtn) {
            fmHomeBtn.style.display = (isPDPVisible || isBasketVisible) ? 'none' : '';
        }
    }
    setInterval(updateHomeButtonVisibility, 200);

    // Featured data
    var featuredData = {
        women: [
            {img:'assets/women_office.jpg', title:'Office Elegance', style:'office'},
            {img:'assets/women_lifestyle.jpg', title:'Minimalist Sophistication', style:'minimalist'},
            {img:'assets/women_evening.jpg', title:'Evening Glamour', style:'evening'},
            {img:'assets/active_wear.jpg', title:'Active Wear', style:'active'}
        ],
        men: [
            {img:'assets/men_urban.png', title:'Urban Minimalism', style:'urban'},
            {img:'assets/men_formal.png', title:'Modern Formals', style:'formal'},
            {img:'assets/men_street.png', title:'Street Essentials', style:'street'},
            {img:'assets/men_casual.png', title:'Smart Casual', style:'casual'}
        ]
    };

    var collectionSubmenus = {
        women: ['Office Elegance', 'Minimalist Sophisticated', 'Evening Glamour'],
        men: ['Urban Minimalism', 'Modern Formals', 'Street Essentials']
    };

    var clothingMenuData = {
        women: {
            'View All': ['View All'],
            'Shirts': ['View All','Shirts','Blouse','Stripes','Checked'],
            'T. Shirts': ['View All','Short Sleeve','Long Sleeve','Sleeveless','Striped','Grapic','Basic'],
            'Tops': ['View All','Short Sleeve','Long Sleeve','Sleeveless','KnitWear','Lace','Corsets'],
            'Blazers': ['View All','Suits','Blacks'],
            'Trousers': ['View All','Wide Leg','Flare','Jogger','Capri','Tailored','Ballon'],
            'Jeans': ['View All','Wide Leg','Barrel','Flared','Crop','Straight','Skinny','Baggy'],
            'Shorts': ['View All','Denim','Non Denim','Bermuda Shorts','Skorts'],
            'Dresses': ['View All','Mini','Midi','Maxi'],
            'Matching Sets': ['View All','Suits','Non Tailored'],
            'Knitwear': ['View All','Long Sleeve','Short Sleeve','Sleeveless','Cardigan'],
            'Jackets': ['View All','Bombers','Denim','Non Denim','Coats','Puffers','Leathers'],
            'Cardigans | Jumpers': ['View All','Cardigan','Jumpers'],
            'Sweatshirts | Pants': ['View All','Sweatshirs','Pants']
        },
        men: {
            'View All': ['View All'],
            'Shirts': ['View All','Short Sleeve','Denim','Overshirt','Printed','Formal','Plain'],
            'T. Shirts': ['View All','Short Sleeve','Long Sleeve','Sleeveless','Striped','Grapic','Basic','SportWear','Boxy','Oversize'],
            'Polos': ['View All','Short Sleeve','Long Sleeve','KnitWear','Basic','Printed'],
            'Blazers': ['View All','Formals','Semi Formals'],
            'Trousers': ['View All','Chinos','Joggers','Cargo','Tailored'],
            'Jeans': ['View All','Straight','Skinny','Baggy','Joggers'],
            'Shorts': ['View All','Denim','Non Denim','Bermuda Shorts','Cargo','Joggers','Sport wear'],
            'Matching Sets': ['View All','Suits','Non Tailored'],
            'Knitwear': ['View All','Long Sleeve','Short Sleeve','Sleeveless','Cardigan'],
            'Jackets': ['View All','Bombers','Denim','Non Denim','Coats','Puffers','Leathers','Sportwear'],
            'Overshirts': ['View All','Denim','Non Denim','Short Sleeve'],
            'Sweatshirts | Pants': ['View All','Sweatshirs','Hoodies','Pants','Sportwear']
        }
    };

    // Subtitle maps
    var womenSubtitleMap = {
        'Shirts': ['View All','Shirts','Blouse','Stripes','Checked'],
        'T. Shirts': ['View All','Short Sleeve','Long Sleeve','Sleeveless','Striped','Grapic','Basic'],
        'Tops': ['View All','Short Sleeve','Long Sleeve','Sleeveless','KnitWear','Lace','Corsets'],
        'Blazers': ['View All','Suits','Blacks'],
        'Trousers': ['View All','Wide Leg','Flare','Jogger','Capri','Tailored','Ballon'],
        'Jeans': ['View All','Wide Leg','Barrel','Flared','Crop','Straight','Skinny','Baggy'],
        'Shorts': ['View All','Denim','Non Denim','Bermuda Shorts','Skorts'],
        'Dresses': ['View All','Mini','Midi','Maxi'],
        'Matching Sets': ['View All','Suits','Non Tailored'],
        'Knitwear': ['View All','Long Sleeve','Short Sleeve','Sleeveless','Cardigan'],
        'Jackets': ['View All','Bombers','Denim','Non Denim','Coats','Puffers','Leathers'],
        'Cardigans | Jumpers': ['View All','Cardigan','Jumpers'],
        'Sweatshirts | Pants': ['View All','Sweatshirs','Pants'],
        'View All': ['View All','Shirts','T. Shirts','Tops','Blazers','Trousers','Jeans','Shorts','Dresses','Matching Sets','Knitwear','Jackets','Cardigans | Jumpers','Sweatshirts | Pants']
    };
    var menSubtitleMap = {
        'Shirts': ['View All','Short Sleeve','Denim','Overshirt','Printed','Formal','Plain'],
        'T. Shirts': ['View All','Short Sleeve','Long Sleeve','Sleeveless','Striped','Grapic','Basic','SportWear','Boxy','Oversize'],
        'Polos': ['View All','Short Sleeve','Long Sleeve','KnitWear','Basic','Printed'],
        'Blazers': ['View All','Formals','Semi Formals'],
        'Trousers': ['View All','Chinos','Joggers','Cargo','Tailored'],
        'Jeans': ['View All','Straight','Skinny','Baggy','Joggers'],
        'Shorts': ['View All','Denim','Non Denim','Bermuda Shorts','Cargo','Joggers','Sport wear'],
        'Matching Sets': ['View All','Suits','Non Tailored'],
        'Knitwear': ['View All','Long Sleeve','Short Sleeve','Sleeveless','Cardigan'],
        'Jackets': ['View All','Bombers','Denim','Non Denim','Coats','Puffers','Leathers','Sportwear'],
        'Overshirts': ['View All','Denim','Non Denim','Short Sleeve'],
        'Sweatshirts | Pants': ['View All','Sweatshirs','Hoodies','Pants','Sportwear'],
        'View All': ['View All','Shirts','T. Shirts','Polos','Blazers','Trousers','Jeans','Shorts','Matching Sets','Knitwear','Jackets','Overshirts','Sweatshirts | Pants']
    };

    function renderMenu(gender) {
        var featuredScroll = $('fmFeaturedScroll');
        if (featuredScroll) {
            var html = '';
            featuredData[gender].forEach(function(f) {
                html += '<div class="fm-feat-card" data-style="' + f.style + '" data-gender="' + gender + '">';
                html += '<img src="' + f.img + '" alt="' + f.title + '">';
                html += '<p>' + f.title + '</p>';
                html += '</div>';
            });
            featuredScroll.innerHTML = html;
            featuredScroll.querySelectorAll('.fm-feat-card').forEach(function(card) {
                card.addEventListener('click', function() {
                    var style = this.dataset.style;
                    var g = this.dataset.gender;
                    closeMenu();
                    setTimeout(function() { showCollectionGrid(g, style); }, 500);
                });
            });
        }

        var menuBody = $('fmMenuBody');
        if (menuBody) {
            var html = '';
            html += '<div class="fm-menu-item" data-action="new" data-gender="' + gender + '"><span class="fm-menu-item-text">New</span></div>';

            html += '<div class="fm-menu-item fm-toggle" data-toggle="collection"><span class="fm-menu-item-text">Collection</span><span class="fm-menu-toggle-icon"><i class="fas fa-chevron-right"></i></span></div>';
            html += '<div class="fm-submenu" id="collectionSubmenu">';
            collectionSubmenus[gender].forEach(function(item) {
                html += '<div class="fm-submenu-item" data-action="collection" data-collection="' + item + '" data-gender="' + gender + '">' + item + '</div>';
            });
            html += '</div>';

            html += '<div class="fm-menu-item fm-toggle" data-toggle="clothing"><span class="fm-menu-item-text">Clothing</span><span class="fm-menu-toggle-icon"><i class="fas fa-chevron-right"></i></span></div>';
            html += '<div class="fm-submenu" id="clothingSubmenu">';
            var clothingCats = Object.keys(clothingMenuData[gender]);
            clothingCats.forEach(function(cat) {
                html += '<div class="fm-submenu-item" data-action="clothing" data-cat="' + cat + '" data-gender="' + gender + '">' + cat + '</div>';
            });
            html += '</div>';

            html += '<div class="fm-menu-item" data-action="experience"><span class="fm-menu-item-text">Store Experience</span></div>';
            html += '<div class="fm-menu-item" data-action="about"><span class="fm-menu-item-text">The Experience</span></div>';
            html += '<div class="fm-menu-item" data-action="location"><span class="fm-menu-item-text">Location</span></div>';

            menuBody.innerHTML = html;

            // Toggle handlers
            menuBody.querySelectorAll('.fm-toggle').forEach(function(item) {
                item.addEventListener('click', function() {
                    var toggle = this.dataset.toggle;
                    var submenu = toggle === 'collection' ? $('collectionSubmenu') : $('clothingSubmenu');
                    var icon = this.querySelector('.fm-menu-toggle-icon');
                    if (submenu) {
                        submenu.classList.toggle('open');
                        icon.classList.toggle('open');
                    }
                });
            });

            // Collection clicks
            menuBody.querySelectorAll('.fm-submenu-item[data-action="collection"]').forEach(function(item) {
                item.addEventListener('click', function() {
                    closeMenu();
                    setTimeout(function() { showCollectionGrid(this.dataset.gender, this.dataset.collection); }.bind(this), 500);
                });
            });

            // Clothing clicks
            menuBody.querySelectorAll('.fm-submenu-item[data-action="clothing"]').forEach(function(item) {
                item.addEventListener('click', function() {
                    closeMenu();
                    setTimeout(function() { showClothingSection(this.dataset.gender, this.dataset.cat); }.bind(this), 500);
                });
            });

            // Main menu items
            menuBody.querySelectorAll('.fm-menu-item[data-action]').forEach(function(item) {
                if (item.classList.contains('fm-toggle')) return;
                item.addEventListener('click', function() {
                    var action = this.dataset.action;
                    var g = this.dataset.gender;
                    closeMenu();
                    if (action === 'new') {
                        setTimeout(function() { g === 'men' ? startMenFlow() : startWomenFlow(); }, 500);
                    } else if (action === 'experience') {
                        setTimeout(function() { showSectionWithHistory('experience'); }, 500);
                    } else if (action === 'about') {
                        setTimeout(function() {
                            enterExperience();
                        }, 500);
                    } else if (action === 'location') {
                        setTimeout(function() { showSectionWithHistory('location'); }, 500);
                    }
                });
            });
        }
    }

    // Gender tabs
    document.querySelectorAll('.fm-gender-tab').forEach(function(tab) {
        tab.addEventListener('click', function() {
            document.querySelectorAll('.fm-gender-tab').forEach(function(t){ t.classList.remove('active'); });
            tab.classList.add('active');
            currentGender = tab.dataset.gender;
            renderMenu(currentGender);
        });
    });

    // ===== SECTION NAVIGATION =====
    function hideAllSections() {
        var sections = ['home','about','location','experience','newItemsGridSection','clothingSection','collectionGridSection','basketPage','siteFooter','newsletterSection'];
        sections.forEach(function(id) { var el = $(id); if (el) el.style.display = 'none'; });
        if ($('newItemAnimation')) $('newItemAnimation').style.display = 'none';
        if ($('collectionAutoScroll')) $('collectionAutoScroll').style.display = 'none';
        if ($('productDetail')) { $('productDetail').style.display = 'none'; $('productDetail').classList.remove('active'); }
        if ($('measurementPage')) $('measurementPage').style.display = 'none';
        if ($('fullMenu')) $('fullMenu').classList.remove('active');
        document.body.style.overflow = '';
        // Cleanup catalog auto-hide saat keluar dari catalog section
        cleanupCatalogAutoHide();
    }

    function showSection(sectionId) {
        hideAllSections();
        var el = $(sectionId);
        if (el) { el.style.display = 'block'; currentSection = sectionId; }
        var header = document.getElementById('siteHeader');
        if (header) {
            header.classList.remove('header-hidden');
            if (sectionId === 'about') {
                // Update connector overlays after about becomes visible
                setTimeout(function() { if (window._connUpdateOverlays) window._connUpdateOverlays(); }, 400);
                header.classList.remove('theme-light');
                header.classList.add('theme-dark');
                // Restore icon visibility
                var headerRight = document.getElementById('headerRight');
                if (headerRight) {
                    headerRight.querySelectorAll('.icon-btn, .menu-toggle').forEach(function(el) {
                        el.style.visibility = '';
                        el.style.opacity = '';
                    });
                }
                document.body.classList.remove('dna-section-active');
            }
        }
        window.scrollTo({top:0, behavior:'smooth'});
    }

    function showSectionWithHistory(sectionId) {
        pushHistory(sectionId, function() { showSection(sectionId); });
        showSection(sectionId);
    }

    function goHome() {
        hideAllSections();
        navHistory = [];
        if ($('home')) $('home').style.display = 'block';
        currentSection = 'home';
        // Unhide header in case it was hidden during experience auto-scroll
        var header = document.getElementById('siteHeader');
        if (header) header.classList.remove('header-hidden');
        window.scrollTo({top:0, behavior:'smooth'});
    }

    $('headerBrand') && $('headerBrand').addEventListener('click', function(e) { e.preventDefault(); goHome(); });

    // ===== WOMEN FLOW =====
    function startWomenFlow() {
        currentGender = 'women';
        hideAllSections();
        navHistory = [];
        var animOverlay = $('newItemAnimation');
        if (animOverlay) {
            animOverlay.style.display = 'block';
            document.body.style.overflow = 'hidden';
            var slideshow = $('niAnimSlideshow');
            var womenNewItems = featuredData.women.slice(0, 3);
            var html = '';
            womenNewItems.forEach(function(item, i) {
                html += '<div class="ni-anim-slide' + (i === 0 ? ' active' : '') + '"><img src="' + item.img + '" alt="' + item.title + '"></div>';
            });
            slideshow.innerHTML = html;
            var slides = slideshow.querySelectorAll('.ni-anim-slide');
            var current = 0;
            var animInterval = setInterval(function() {
                slides[current].classList.remove('active');
                current = (current + 1) % slides.length;
                slides[current].classList.add('active');
            }, 2000);
            setTimeout(function() {
                clearInterval(animInterval);
                animOverlay.style.display = 'none';
                startCollectionAutoScroll();
            }, 6000);
            slides.forEach(function(slide) {
                slide.addEventListener('click', function() {
                    clearInterval(animInterval);
                    animOverlay.style.display = 'none';
                    showNewItemsGrid('women');
                });
            });
        }
    }

    // ===== MEN FLOW =====
    function startMenFlow() {
        currentGender = 'men';
        hideAllSections();
        navHistory = [];
        var animOverlay = $('newItemAnimation');
        if (animOverlay) {
            animOverlay.style.display = 'block';
            document.body.style.overflow = 'hidden';
            var slideshow = $('niAnimSlideshow');
            var menNewItems = featuredData.men;
            var html = '';
            menNewItems.forEach(function(item, i) {
                html += '<div class="ni-anim-slide' + (i === 0 ? ' active' : '') + '"><img src="' + item.img + '" alt="' + item.title + '"></div>';
            });
            slideshow.innerHTML = html;
            var slides = slideshow.querySelectorAll('.ni-anim-slide');
            var current = 0;
            var animInterval = setInterval(function() {
                slides[current].classList.remove('active');
                current = (current + 1) % slides.length;
                slides[current].classList.add('active');
            }, 2000);
            setTimeout(function() {
                clearInterval(animInterval);
                animOverlay.style.display = 'none';
                startMenCollectionScroll();
            }, 6000);
            slides.forEach(function(slide) {
                slide.addEventListener('click', function() {
                    clearInterval(animInterval);
                    animOverlay.style.display = 'none';
                    showNewItemsGrid('men');
                });
            });
        }
    }

    // ===== COLLECTION AUTO-SCROLL =====
    function startCollectionAutoScroll() {
        var overlay = $('collectionAutoScroll');
        if (overlay) {
            overlay.style.display = 'block';
            document.body.style.overflow = 'hidden';
            var container = $('casScrollContainer');
            var womenCollections = featuredData.women.slice(0, 3);
            var html = '';
            womenCollections.forEach(function(item, i) {
                html += '<div class="cas-slide' + (i === 0 ? ' active' : '') + '"><img src="' + item.img + '" alt="' + item.title + '"></div>';
            });
            container.innerHTML = html;
            var slides = container.querySelectorAll('.cas-slide');
            var caption = $('casCaption');
            var current = 0;
            function updateCaption() { if (caption) caption.textContent = womenCollections[current].title; }
            updateCaption();
            var scrollInterval = setInterval(function() {
                slides[current].classList.remove('active');
                current = (current + 1) % slides.length;
                slides[current].classList.add('active');
                updateCaption();
            }, 2000);
            setTimeout(function() {
                clearInterval(scrollInterval);
                overlay.style.display = 'none';
                document.body.style.overflow = '';
                showHomeWithNewsletter();
            }, 6000);
            slides.forEach(function(slide, idx) {
                slide.addEventListener('click', function() {
                    clearInterval(scrollInterval);
                    overlay.style.display = 'none';
                    document.body.style.overflow = '';
                    showCollectionGrid('women', womenCollections[idx].style);
                });
            });
        }
    }

    function startMenCollectionScroll() {
        var overlay = $('collectionAutoScroll');
        if (overlay) {
            overlay.style.display = 'block';
            document.body.style.overflow = 'hidden';
            var container = $('casScrollContainer');
            var menCollections = featuredData.men;
            var html = '';
            menCollections.forEach(function(item, i) {
                html += '<div class="cas-slide' + (i === 0 ? ' active' : '') + '"><img src="' + item.img + '" alt="' + item.title + '"></div>';
            });
            container.innerHTML = html;
            var slides = container.querySelectorAll('.cas-slide');
            var caption = $('casCaption');
            var current = 0;
            function updateCaption() { if (caption) caption.textContent = menCollections[current].title; }
            updateCaption();
            var scrollInterval = setInterval(function() {
                slides[current].classList.remove('active');
                current = (current + 1) % slides.length;
                slides[current].classList.add('active');
                updateCaption();
            }, 2000);
            setTimeout(function() {
                clearInterval(scrollInterval);
                overlay.style.display = 'none';
                document.body.style.overflow = '';
                showHomeWithNewsletter();
            }, 6000);
            slides.forEach(function(slide, idx) {
                slide.addEventListener('click', function() {
                    clearInterval(scrollInterval);
                    overlay.style.display = 'none';
                    document.body.style.overflow = '';
                    showCollectionGrid('men', menCollections[idx].style);
                });
            });
        }
    }

    function showHomeWithNewsletter() {
        hideAllSections();
        if ($('home')) $('home').style.display = 'block';
        if ($('newsletterSection')) $('newsletterSection').style.display = 'block';
        
        currentSection = 'home';
        window.scrollTo({top:0, behavior:'smooth'});
    }

    // ===== NEW ITEMS GRID =====
    function showNewItemsGrid(gender) {
        hideAllSections();
        currentGender = gender;
        currentSection = 'newItemsGrid';
        pushHistory('newItemsGrid', function() { showNewItemsGrid(gender); });
        var section = $('newItemsGridSection');
        if (section) {
            section.style.display = 'block';
            var title = $('nigTitle');
            if (title) title.textContent = 'NEW IN';
            var prods = gender === 'women' ? products : menProducts;
            renderCatalogGrid('nigGrid', prods, 'vg1');
            setupViewToggle('nigViewToggle', 'nigGrid', prods);
            setTimeout(function() { adjustCatalogGrid(); }, 100);
            $('nigFiltersToggle').onclick = function() { openFiltersPopup(prods); };
            var backBtn = $('nigBack');
            if (backBtn) backBtn.onclick = function() { openMenu(); };
        }
        window.scrollTo({top:0, behavior:'smooth'});
        setTimeout(function() { setupCatalogAutoHide(null); }, 200);
    }

    // ===== COLLECTION GRID =====
    function showCollectionGrid(gender, styleOrName) {
        hideAllSections();
        currentGender = gender;
        currentSection = 'collectionGrid';
        pushHistory('collectionGrid', function() { showCollectionGrid(gender, styleOrName); });
        var section = $('collectionGridSection');
        if (section) {
            section.style.display = 'block';
            var collections = featuredData[gender];
            var collection = collections.find(function(c) { return c.style === styleOrName || c.title === styleOrName; });
            var title = $('cgTitle');
            if (title && collection) title.textContent = collection.title.toUpperCase();
            else if (title) title.textContent = styleOrName.toUpperCase();
            var allProds = gender === 'women' ? products : menProducts;
            var styleCode = collection ? collection.style : styleOrName.toLowerCase().replace(/\s/g, '');
            var filtered = allProds.filter(function(p) { return p.style === styleCode || (collection && p.style === collection.style); });
            if (filtered.length === 0) filtered = allProds;
            renderCatalogGrid('cgGrid', filtered, 'vg1');
            setupViewToggle('cgViewToggle', 'cgGrid', filtered);
            setTimeout(function() { adjustCatalogGrid(); }, 100);
            var backBtn = $('cgBack');
            if (backBtn) backBtn.onclick = function() { openMenu(); };
            setTimeout(function() {
                window.scrollTo({top:0});
                setCatalogHeaderVisible(true);
                setupCatalogAutoHide(null);
            }, 150);
        }
        window.scrollTo({top:0, behavior:'smooth'});
    }

    // ===== CLOTHING SECTION =====
    function showClothingSection(gender, category) {
        hideAllSections();
        currentGender = gender;
        currentSection = 'clothing';
        currentClothingCategory = category || 'Shirts';
        currentClothingSubcat = 'View All';
        pushHistory('clothing', function() { showClothingSection(gender, category); });
        var section = $('clothingSection');
        if (section) {
            section.style.display = 'block';
            var title = $('clothingTitle');
            if (title) title.textContent = currentClothingCategory.toUpperCase();
            renderSubtitleTabs(currentClothingCategory, 'View All');
            var allProds = gender === 'women' ? products : menProducts;
            var filtered = filterByCategory(allProds, currentClothingCategory, currentClothingSubcat);
            renderCatalogGrid('clothingGrid', filtered, 'vg1');
            setupViewToggle('clothingViewToggle', 'clothingGrid', filtered);
            setTimeout(function() { adjustCatalogGrid(); }, 100);
            var backBtn = $('clothingBack');
            if (backBtn) backBtn.onclick = function() { openMenu(); };
            var filterBtn = $('filtersToggle');
            if (filterBtn) filterBtn.onclick = function() { openFiltersPopup(filtered); };
            // Setup auto-hide for clothing grid scroll
            setTimeout(function() {
                window.scrollTo({top:0});
                setupCatalogAutoHide(null);
            }, 200);
        }
        window.scrollTo({top:0, behavior:'smooth'});
    }

    function filterByCategory(products, category, subcat) {
        if (category === 'View All' && subcat === 'View All') return products;
        var catKey = category.toLowerCase().replace(/\.\s/g, '').replace(/\s/g, '').replace(/\|/g, '');
        var filtered = products.filter(function(p) {
            var pCat = (p.cat || '').toLowerCase().replace(/\s/g, '').replace(/\|/g, '');
            var pName = (p.name || '').toLowerCase();
            var pDesc = (p.desc || '').toLowerCase();
            return pCat === catKey || pCat.includes(catKey) || catKey.includes(pCat) || pName.includes(catKey) || pDesc.includes(catKey);
        });
        if (filtered.length === 0) filtered = products;
        if (subcat && subcat !== 'View All') {
            var subKey = subcat.toLowerCase().replace(/\s/g, '');
            filtered = filtered.filter(function(p) {
                var pSub = (p.subcat || '').toLowerCase().replace(/\s/g, '');
                var pDesc = (p.desc || '').toLowerCase();
                var pName = (p.name || '').toLowerCase();
                return pSub === subKey || pDesc.includes(subKey) || pName.includes(subKey) || subKey.includes(pSub) || pSub.includes(subKey);
            });
            if (filtered.length === 0) filtered = products;
        }
        return filtered;
    }

    function renderSubtitleTabs(category, activeSubcat) {
        var scroll = $('clothingSubtitleScroll');
        if (!scroll) return;
        var gender = currentGender || 'women';
        var subItems = ['View All'];
        if (gender === 'women' && womenSubtitleMap[category]) subItems = womenSubtitleMap[category];
        else if (gender === 'men' && menSubtitleMap[category]) subItems = menSubtitleMap[category];
        var html = '';
        subItems.forEach(function(sub) {
            var isActive = sub === activeSubcat;
            html += '<button class="subtitle-tab' + (isActive ? ' active' : '') + '" data-subcat="' + sub + '">' + sub.toUpperCase() + '</button>';
        });
        scroll.innerHTML = html;
        var clothingGrid = $('clothingGrid');
        if (clothingGrid) clothingGrid.classList.add('with-subtitle');
        scroll.querySelectorAll('.subtitle-tab').forEach(function(tab) {
            tab.addEventListener('click', function() {
                var subcat = this.dataset.subcat;
                scroll.querySelectorAll('.subtitle-tab').forEach(function(t){ t.classList.remove('active'); });
                this.classList.add('active');
                currentClothingSubcat = subcat;
                var allProds = currentGender === 'women' ? products : menProducts;
                var filtered = filterByCategory(allProds, currentClothingCategory, subcat);
                renderCatalogGrid('clothingGrid', filtered, currentViewMode);
                setTimeout(function() { adjustCatalogGrid(); }, 50);
            });
        });
    }

    // ===== CATALOG GRID =====
    function renderCatalogGrid(gridId, prods, viewMode) {
        var grid = $(gridId);
        if (!grid) return;
        grid.className = 'catalog-grid ' + viewMode;
        currentViewMode = viewMode;
        var html = '';
        prods.forEach(function(p) {
            html += '<div class="catalog-item" data-id="' + p.id + '">';
            html += '<div class="catalog-item-photo"><img src="' + P.thumb(p) + '" alt="' + p.name + '" loading="lazy"></div>';
            html += '<div class="catalog-item-info"><p class="catalog-item-name">' + p.name + '</p><p class="catalog-item-price">' + fmt(p.price) + '</p></div></div>';
        });
        grid.innerHTML = html;
        grid.querySelectorAll('.catalog-item').forEach(function(item) {
            item.addEventListener('click', function() {
                var id = this.dataset.id;
                var allProds = currentGender === 'women' ? products : menProducts;
                var product = allProds.find(function(p) { return p.id === id; });
                if (product) openProductDetail(product);
            });
        });
    }

    function setupViewToggle(toggleId, gridId, prods) {
        var toggle = $(toggleId);
        if (!toggle) return;
        var views = ['vg1', 'vg2', 'vg3'];
        var currentIdx = 0;
        toggle.onclick = function() {
            currentIdx = (currentIdx + 1) % views.length;
            var view = views[currentIdx];
            toggle.dataset.view = view;
            toggle.querySelectorAll('.vg-icon').forEach(function(icon, i) { icon.classList.toggle('active', i === currentIdx); });
            renderCatalogGrid(gridId, prods, view);
            // Adjust grid row heights after render (VG2/VG3 need exact viewport fit)
            setTimeout(function() { adjustCatalogGrid(); }, 50);
        };
    }

    // ===== DYNAMIC GRID HEIGHT (VG2: 4 items, VG3: 6 items per viewport) =====
    function adjustCatalogGrid() {
        var section = document.querySelector('.catalog-section:not([style*="display: none"])') ||
                      document.querySelector('.catalog-section[style*="display: block"]');
        if (!section) return;
        var grid = section.querySelector('.catalog-grid');
        if (!grid) return;

        // VG1: flexible layout, reset any fixed photo heights
        if (grid.classList.contains('vg1')) {
            grid.style.gridAutoRows = '';
            grid.querySelectorAll('.catalog-item-photo').forEach(function(p) {
                p.style.height = '';
                p.style.flex = '';
                p.style.paddingBottom = '';
            });
            grid.querySelectorAll('.catalog-item').forEach(function(item) {
                item.style.minHeight = '';
            });
            return;
        }

        // VG2/VG3: calculate exact photo height so 2 rows fill the viewport
        requestAnimationFrame(function() {
            var gridStyle = window.getComputedStyle(grid);
            var paddingTop = parseFloat(gridStyle.paddingTop) || 0;
            var vh = window.innerHeight;
            var available = vh - paddingTop;
            var gap = parseFloat(gridStyle.gap) || parseFloat(gridStyle.rowGap) || 0;

            // 2 rows per viewport for both VG2 and VG3
            var rows = 2;
            var totalGap = (rows - 1) * gap;

            // Info area height (name ~12px + price ~11px + padding ~8px + margin ~4px)
            var infoHeight = 35;

            // Total height consumed by info areas in 2 rows
            var totalInfoHeight = rows * infoHeight;

            // Available space for photos across 2 rows
            var photoAvailable = available - totalGap - totalInfoHeight;
            var photoHeight = Math.max(Math.floor(photoAvailable / rows), 80);

            // Apply to all photo containers
            grid.querySelectorAll('.catalog-item-photo').forEach(function(p) {
                p.style.height = photoHeight + 'px';
                p.style.flex = 'none';
                p.style.paddingBottom = '0';
            });

            // Reset grid-auto-rows so items size naturally
            grid.style.gridAutoRows = '';
        });
    }

    // Re-calculate on resize/orientation change
    window.addEventListener('resize', function() {
        setTimeout(function() { adjustCatalogGrid(); }, 100);
    });
    window.addEventListener('orientationchange', function() {
        setTimeout(function() { adjustCatalogGrid(); }, 300);
    });


    // ===== PRODUCT DETAIL PAGE =====
    function openProductDetail(product) {
        currentProduct = product;
        selectedColor = 0;
        selectedSize = null;
        selectedQty = 1;

        var pdp = $('productDetail');
        if (!pdp) return;

        pdp.style.display = 'block';
        pdp.classList.add('active');
        document.body.style.overflow = 'hidden';
        var siteHeader = $('siteHeader');
        if (siteHeader) siteHeader.style.display = 'none';
        currentSection = 'productDetail';
        pushHistory('productDetail', function() { openProductDetail(product); });

        // Main image
        var mainImg = $('pdpMainImg');
        if (mainImg) mainImg.src = P.thumb(product);

        // New tag
        var newTag = $('pdpNewTag');
        if (newTag) newTag.style.display = product.new ? 'inline-block' : 'none';

        // Description
        var desc = $('pdpDesc');
        if (desc) desc.textContent = product.desc;

        // Active color name
        var activeColorName = $('pdpActiveColorName');
        if (activeColorName && product.colors[selectedColor]) {
            activeColorName.textContent = product.colors[selectedColor].name + ' | Ref. ' + P.colorRef(product, selectedColor);
        }

        // Setup inline color icons row
        setupColorIconsRow(product);

        // SELECT SIZE button
        $('pdpSelectSizeBtn').onclick = function() { openSizePopup(product); };

        // VIEW LOOK button
        $('pdpViewLookBtn').onclick = function() { showToast('Lookbook coming soon'); };

        // Accordions
        var accordions = $('pdpAccordions');
        if (accordions) {
            accordions.innerHTML = '';
            var accordionData = [
                {title:'COMPOSITION', content: 'Main: 100% Premium Fabric<br>Lining: 100% Viscose<br><br>Professional dry clean only.'},
                {title:'SHIPPING & RETURNS', content: 'Free standard shipping on orders over Rp 1.000.000<br>Delivery: 3-5 business days<br>Free returns within 30 days.'}
            ];
            accordionData.forEach(function(acc) {
                var div = document.createElement('div');
                div.className = 'pdp-accordion';
                div.innerHTML = '<button class="pdp-acc-header"><span>' + acc.title + '</span><svg width="16" height="16" stroke="currentColor" stroke-width="1.5" class="pdp-acc-arrow"><polyline points="6,4 10,8 6,12"/></svg></button><div class="pdp-acc-body">' + acc.content + '</div>';
                accordions.appendChild(div);
                var header = div.querySelector('.pdp-acc-header');
                var body = div.querySelector('.pdp-acc-body');
                header.onclick = function() {
                    body.classList.toggle('open');
                    header.classList.toggle('open');
                };
            });
        }

        // X close button — closes PDP and safely returns to previous section
        var pdpCloseX = $('pdpCloseX');
        if (pdpCloseX) {
            pdpCloseX.onclick = function() {
                closePDP();
            };
        }

        // Cart button in PDP header -> open basket page
        var pdpCartBtn = $('pdpCartBtn');
        if (pdpCartBtn) {
            pdpCartBtn.onclick = function() {
                basketActiveTab = 'basket';
                showBasketPage();
            };
        }

        // Photo add button (bottom-left of photo)
        var photoAddBtn = $('pdpPhotoAddBtn');
        if (photoAddBtn) {
            photoAddBtn.onclick = function() {
                openSizePopup(product);
            };
        }

        // VIEW LOOK button - show Complete Your Look
        var viewLookBtn = $('pdpViewLookBtn');
        if (viewLookBtn) {
            viewLookBtn.onclick = function() {
                showCompleteYourLook(product);
                scrollToPdpSection('pdpCompleteLook');
            };
        }

        // Scroll listener: show Complete Your Look after SHIPPING & RETURNS
        var pdpScroll = $('pdpScroll');
        if (pdpScroll) {
            pdpScroll.onscroll = function() {
                var shippingSection = accordions ? accordions.lastElementChild : null;
                if (shippingSection) {
                    var rect = shippingSection.getBoundingClientRect();
                    if (rect.bottom < window.innerHeight * 0.8) {
                        showCompleteYourLook(product);
                    }
                }
            };
        }

        // Render You May Also Like (always visible)
        renderYouMayAlsoLike(product);

        // Setup image swipe with pagination dots
        setupPdpImageSwipe(product);

        // Scroll to top of PDP
        if ($('pdpScroll')) $('pdpScroll').scrollTop = 0;

        // PDP Header adaptive color based on scroll
        setupPdpHeaderAdaptive();

        // Setup photo wishlist (bottom-left of photo)
        setupPhotoWishlist(product);

        // Update badges
        updateWishlistBadge();
        updateCartBadge();

    }

    // ===== PDP IMAGE SWIPE WITH PAGINATION DOTS =====
    function setupPdpImageSwipe(product) {
        var scroll = $('pdpImageScroll');
        var dotsContainer = $('pdpImageDots');
        if (!scroll || !dotsContainer) return;

        // Use styling photos for active color
        var images = P.stylingPhotos(product, selectedColor);

        // Build image elements
        scroll.innerHTML = '';
        images.forEach(function(src, i) {
            var img = document.createElement('img');
            img.src = src;
            img.alt = product.name;
            img.className = 'pdp-main-img';
            // Click to open zoom
            img.dataset.stylingIdx = i;
            img.style.cssText = 'width:100%;min-width:100%;height:100%;object-fit:cover;flex-shrink:0;cursor:zoom-in;display:block;scroll-snap-align:start;';
            scroll.appendChild(img);
        });

        // Build dots
        dotsContainer.innerHTML = '';
        images.forEach(function(_, i) {
            var dot = document.createElement('div');
            dot.className = 'pdp-image-dot' + (i === 0 ? ' active' : '');
            dotsContainer.appendChild(dot);
        });

        // Click on image = zoom
        scroll.onclick = function(e) {
            var img = e.target.closest('.pdp-main-img');
            if (img) {
                var idx = parseInt(img.dataset.stylingIdx) || 0;
                openZoom(product, selectedColor, idx);
            }
        };

        // Update dots on scroll
        scroll.onscroll = function() {
            var index = Math.round(scroll.scrollLeft / scroll.clientWidth);
            var dots = dotsContainer.querySelectorAll('.pdp-image-dot');
            dots.forEach(function(dot, i) {
                dot.classList.toggle('active', i === index);
            });
        };

        // Touch swipe handling with page-turn animation
        var startX, scrollLeft, currentPage = 0;
        scroll.addEventListener('touchstart', function(e) {
            startX = e.touches[0].pageX - scroll.offsetLeft;
            scrollLeft = scroll.scrollLeft;
        }, {passive: true});

        scroll.addEventListener('touchmove', function(e) {
            var x = e.touches[0].pageX - scroll.offsetLeft;
            var walk = (x - startX) * 1.5;
            scroll.scrollLeft = scrollLeft - walk;
        }, {passive: true});

        // Page-turn animation on scroll end
        scroll.addEventListener('touchend', function() {
            var newPage = Math.round(scroll.scrollLeft / scroll.clientWidth);
            var images = scroll.querySelectorAll('.pdp-main-img');
            if (newPage !== currentPage && newPage >= 0 && newPage < images.length) {
                // Animate out old page
                if (images[currentPage]) {
                    images[currentPage].classList.remove('page-active', 'page-enter');
                    images[currentPage].classList.add('page-exit');
                }
                // Animate in new page
                if (images[newPage]) {
                    images[newPage].classList.remove('page-exit');
                    images[newPage].classList.add('page-enter');
                    setTimeout(function() {
                        images[newPage].classList.remove('page-enter');
                        images[newPage].classList.add('page-active');
                    }, 50);
                }
                // Reset old page after animation
                setTimeout(function() {
                    if (images[currentPage]) images[currentPage].classList.remove('page-exit');
                }, 500);
                currentPage = newPage;
                // Update dots
                var dots = dotsContainer.querySelectorAll('.pdp-image-dot');
                dots.forEach(function(dot, i) { dot.classList.toggle('active', i === currentPage); });
            }
        }, {passive: true});
    }

    // ===== COLOR POPUP (35% from bottom) =====
    function openColorPopup(product) {
        var container = $('colorSwipeContainer');
        if (container) {
            container.innerHTML = '';
            product.colors.forEach(function(color, i) {
                var div = document.createElement('div');
                div.className = 'color-option' + (i === selectedColor ? ' active' : '');
                div.innerHTML = '<img src="' + P.colorThumb(product, i) + '" alt="' + color.name + '"><p>' + color.name + '</p>';
                div.onclick = function() {
                    selectedColor = i;
                    // Rebuild image swipe for new color
                    setupPdpImageSwipe(product);
                    // Update color name + ref
                    var activeColorName = $('pdpActiveColorName');
                    if (activeColorName) activeColorName.textContent = color.name + ' | Ref. ' + P.colorRef(product, i);
                    // Update photo wishlist state
                    setupPhotoWishlist(product);
                    closePopup('colorPopup');
                };
                container.appendChild(div);
            });
        }
        var popup = $('colorPopup');
        if (popup) { popup.style.display = 'flex'; popup.classList.add('active'); }
    }

    $('colorPopupBackdrop') && $('colorPopupBackdrop').addEventListener('click', function() { closePopup('colorPopup'); });

    // ===== SELECT SIZE POPUP (55% from bottom) =====
    function openSizePopup(product) {
        var modelInfo = $('sizeModelInfo');
        if (modelInfo) modelInfo.textContent = 'Model: ' + product.modelH + ' cm and Size ' + product.sizes[1];
        var container = $('sizeOptions');
        if (container) {
            container.innerHTML = '';
            product.sizes.forEach(function(size) {
                var btn = document.createElement('button');
                btn.className = 'size-option';
                btn.textContent = size;
                btn.onclick = function() {
                    selectedSize = size;
                    closePopup('sizePopup');
                    addToBasket(product);
                };
                container.appendChild(btn);
            });
        }
        $('sizeMeasurementBtn').onclick = function() {
            closePopup('sizePopup');
            showMeasurementPage(product);
        };
        var popup = $('sizePopup');
        if (popup) { popup.style.display = 'flex'; popup.classList.add('active'); }
    }

    $('sizePopupBackdrop') && $('sizePopupBackdrop').addEventListener('click', function() { closePopup('sizePopup'); });

    // ===== MEASUREMENT PAGE (fullscreen) =====
    function showMeasurementPage(product) {
        var page = $('measurementPage');
        if (!page) return;
        page.style.display = 'block';
        document.body.style.overflow = 'hidden';
        var siteHeader = $('siteHeader');
        if (siteHeader) siteHeader.style.display = 'none';

        $('measurementClose').onclick = function() {
            page.style.display = 'none';
            var pdp = $('productDetail');
            if (pdp && pdp.style.display === 'block') {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
                var siteHeader = $('siteHeader');
                if (siteHeader) siteHeader.style.display = '';
            }
        };

        var sizeRow = $('measurementSizeRow');
        if (sizeRow) {
            sizeRow.innerHTML = '';
            product.sizes.forEach(function(size) {
                var btn = document.createElement('button');
                btn.className = 'measurement-size-btn' + (size === (selectedSize || 'S') ? ' active' : '');
                btn.textContent = size;
                btn.onclick = function() {
                    sizeRow.querySelectorAll('.measurement-size-btn').forEach(function(s) { s.classList.remove('active'); });
                    btn.classList.add('active');
                    renderMeasurementTable(product, size);
                };
                sizeRow.appendChild(btn);
            });
        }
        renderMeasurementTable(product, selectedSize || product.sizes[0]);
    }

    function renderMeasurementTable(product, size) {
        var table = $('measurementTable');
        var m = product.measurements && product.measurements[size];
        if (!table) return;
        if (!m) { table.innerHTML = '<p style="text-align:center;color:#999;padding:20px;">Measurements not available.</p>'; return; }
        var html = '';
        if (m.chest) html += '<div class="measurement-row"><span>Chest</span><span>' + m.chest + '</span></div>';
        if (m.frontLength) html += '<div class="measurement-row"><span>Front length</span><span>' + m.frontLength + '</span></div>';
        if (m.sleeveLength) html += '<div class="measurement-row"><span>Sleeve length</span><span>' + m.sleeveLength + '</span></div>';
        table.innerHTML = html;
    }

    // ===== POPUP HELPERS =====
    function closePopup(popupId) {
        var popup = $(popupId);
        if (popup) { popup.style.display = 'none'; popup.classList.remove('active'); }
    }

    // ===== ADD TO BASKET FLOW =====
    function addToBasket(product) {
        var colorName = product.colors && product.colors[selectedColor] ? product.colors[selectedColor].name : 'Default';
        var existing = cart.find(function(c) { return c.id === product.id && c.size === selectedSize && c.color === colorName; });
        if (existing) { existing.qty += selectedQty; }
        else {
            cart.push({id:product.id,name:product.name,price:product.price,img:P.basketImg(product,selectedColor),size:selectedSize,color:colorName,qty:selectedQty});
        }
        saveCart();
        showAddedToBasketPopup(product);
    }

    // ===== ADDED TO BASKET POPUP (2/3 screen) =====
    function showAddedToBasketPopup(product) {
        var colorName = product.colors && product.colors[selectedColor] ? product.colors[selectedColor].name : 'Default';
        var productDiv = $('basketPopupProduct');
        if (productDiv) {
            productDiv.innerHTML = '<img src="' + P.basketImg(product, selectedColor) + '" alt="' + product.name + '">' +
                '<div class="basket-popup-info"><p class="bp-name">' + product.name + '</p><p class="bp-color">' + colorName + '</p><p class="bp-price">' + fmt(product.price) + '</p></div>';
        }
        var recScroll = $('basketRecScroll');
        if (recScroll) {
            var allProds = product.gender === 'women' ? products : menProducts;
            var related = allProds.filter(function(p) { return p.id !== product.id; }).slice(0, 6);
            var html = '';
            related.forEach(function(rp) {
                html += '<div class="basket-rec-item" data-id="' + rp.id + '"><img src="' + P.thumb(rp) + '" alt="' + rp.name + '" loading="lazy"><p>' + rp.name + '</p><p>' + fmt(rp.price) + '</p></div>';
            });
            recScroll.innerHTML = html;
            recScroll.querySelectorAll('.basket-rec-item').forEach(function(item) {
                item.addEventListener('click', function() {
                    var id = this.dataset.id;
                    var rp = allProds.find(function(p) { return p.id === id; });
                    if (rp) { closePopup('basketPopup'); openProductDetail(rp); }
                });
            });
        }
        $('basketViewBtn').onclick = function() { closePopup('basketPopup'); showBasketPage(); };
        $('basketLinkBtn').onclick = function() { closePopup('basketPopup'); showBasketPage(); };
        var popup = $('basketPopup');
        if (popup) { popup.style.display = 'flex'; popup.classList.add('active'); }
    }

    $('basketPopupBackdrop') && $('basketPopupBackdrop').addEventListener('click', function() { closePopup('basketPopup'); });

    // ===== BASKET PAGE WITH FAVORITES TAB =====

    function updateBasketTabUI() {
        var isBasket = basketActiveTab !== 'wish';
        // CTA button active state
        var tabB = $('bh-tab-basket');
        var tabW = $('bh-tab-wish');
        if (tabB) tabB.classList.toggle('active', isBasket);
        if (tabW) tabW.classList.toggle('active', !isBasket);
        // Title update
        var title = $('bhTitle');
        if (title) title.textContent = isBasket ? 'BASKET' : 'WISH LIST';
    }

    function showBasketPage() {
        var prevSection = currentSection || 'home';
        var prevRestoreFn = navHistory.length > 0 ? navHistory[navHistory.length - 1].restore : null;

        hideAllSections();
        var siteHeader = $('siteHeader');
        if (siteHeader) siteHeader.style.display = 'none';
        var page = $('basketPage');
        if (page) {
            page.style.display = 'block';
            document.body.style.overflow = 'hidden';
            // Fix text gap inline (CSS override insurance)
            var bhText = document.querySelector('#basketPage .bh-brand-text');
            if (bhText) bhText.style.marginLeft = '10px';
            // Reset scroll and force scrollable on each open
            var bContent = $('basketPageContent');
            if (bContent) {
                bContent.scrollTop = 0;
                bContent.style.cssText = bContent.style.cssText + '; overflow-y: auto !important; -webkit-overflow-scrolling: touch !important;';
            }
            // Ensure basketPage itself doesn't block scroll
            var bPage = $('basketPage');
            if (bPage) {
                bPage.style.overflow = 'hidden';
            }
            pushHistory('basket', function() { showBasketPage(); });
            basketActiveTab = 'basket';
            renderBasketBody('basket');
            updateCartBadge();
            updateWishlistBadge();
            updateBasketTabUI();

            // Adaptive header theme
            var hdr = $('basketHeaderBar');
            if (hdr) {
                hdr.classList.remove('theme-dark', 'theme-light');
                hdr.classList.add('theme-light'); // basket always on white bg
            }

            // Close btn
            var closeBtn = $('basketPageClose');
            if (closeBtn) {
                var newClose = closeBtn.cloneNode(true);
                closeBtn.parentNode.replaceChild(newClose, closeBtn);
                $('basketPageClose').onclick = function() {
                    page.style.display = 'none';
                    document.body.style.overflow = '';
                    var siteHeader = $('siteHeader');
                    if (siteHeader) siteHeader.style.display = '';
                    navigateBack();
                };
            }

            // Tab buttons v6 — swap body content, keep same header
            ['bh-tab-basket', 'bh-tab-wish'].forEach(function(id) {
                var btn = $(id);
                if (btn) {
                    var nb = btn.cloneNode(true);
                    btn.parentNode.replaceChild(nb, btn);
                }
            });
            var tabB = $('bh-tab-basket');
            var tabW = $('bh-tab-wish');
            if (tabB) tabB.onclick = function() {
                basketActiveTab = 'basket';
                updateBasketTabUI();
                var bp = $('basketPage');
                if (bp) bp.classList.remove('wish-tab-active');
                var footer = $('basketPageFooter');
                if (footer) footer.style.removeProperty('display');
                renderBasketPage();
                updateCartBadge();
            };
            if (tabW) tabW.onclick = function() {
                basketActiveTab = 'wish';
                updateBasketTabUI();
                var bp = $('basketPage');
                if (bp) bp.classList.add('wish-tab-active');
                renderWishlistInBasket();
                updateWishlistBadge();
            };

            $('basketProcessBtn').onclick = function() {
                if (cart.length === 0) { showToast('Your basket is empty'); return; }
                var total = cart.reduce(function(s,c) { return s + c.price * c.qty; }, 0);
                var msg = 'Hi ESCALIER, I would like to order:\n';
                cart.forEach(function(c) { msg += '- ' + c.name + ' (' + c.color + ', Size ' + c.size + ') x' + c.qty + ' = ' + fmt(c.price * c.qty) + '\n'; });
                msg += '\nTotal: ' + fmt(total);
                window.open('https://wa.me/62816580999?text=' + encodeURIComponent(msg), '_blank');
            };
        }
        currentSection = 'basket';
    }

    function updateBasketTabs() {
        document.querySelectorAll('.basket-tab').forEach(function(tab) { tab.classList.remove('active'); });
        if (basketActiveTab === 'basket') {
            $('basketTabMain').classList.add('active');
            $('basketPageFooter').style.display = 'block';
        } else {
            $('basketTabFav').classList.add('active');
            $('basketPageFooter').style.display = 'none';
        }
    }

    function renderBasketPage() {
        // Restore footer visibility when showing basket tab
        var footer = $('basketPageFooter');
        if (footer) footer.style.display = '';
        var itemsContainer = $('basketPageItems');
        var countEl = $('basketPageCount');
        var totalEl = $('basketTotal');
        var total = cart.reduce(function(s,c){return s + c.qty},0);
        if (countEl) { countEl.textContent = total > 0 ? total : ''; }
        if (cart.length === 0) {
            if (itemsContainer) itemsContainer.innerHTML = '<div style="text-align:center;padding:80px 20px;color:#ccc;"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" style="margin:0 auto 16px;display:block;"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg><p style="font-size:13px;color:#999;">Your basket is empty</p></div>';
            if (totalEl) totalEl.textContent = 'Total: Rp 0';
            return;
        }
        var html = '';
        var totalAmt = 0;
        cart.forEach(function(item, idx) {
            totalAmt += item.price * item.qty;
            var isWished = false; // Always start as empty heart in basket - click to move to wishlist
            var wishSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
            var eraseSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M20 20H7L3 16l11-11 6 6-2 2"/><path d="M6.5 17.5l-4-4"/></svg>';
            html += '<div class="basket-item">';
            html += '<div class="basket-item-photo"><img src="' + item.img + '" alt="' + item.name + '"></div>';
            html += '<div class="basket-item-body">';
            html +=   '<div>';
            html +=     '<p class="basket-item-name">' + item.name + '</p>';
            html +=     '<p class="basket-item-meta">' + item.color + ' / ' + item.size + '</p>';
            html +=     '<p class="basket-item-price">' + fmt(item.price) + '</p>';
            html +=   '</div>';
            html +=   '<div class="basket-item-controls">';
            html +=     '<div class="basket-qty-box">';
            html +=       '<button class="basket-qty-btn" data-idx="' + idx + '" data-action="minus">−</button>';
            html +=       '<span class="basket-qty-value">' + item.qty + '</span>';
            html +=       '<button class="basket-qty-btn" data-idx="' + idx + '" data-action="plus">+</button>';
            html +=     '</div>';
            html +=   '</div>';
            html += '</div>';
            var trashSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>';
            var wishSvg2 = wishSvg; // keep reference
            html += '<div class="basket-item-actions">';
            html +=   '<button class="basket-wishlist-btn' + (isWished ? ' active' : '') + '" data-idx="' + idx + '">' + wishSvg + '</button>';
            html +=   '<button class="basket-erase-btn" data-idx="' + idx + '">' + trashSvg + '</button>';
            html += '</div>';
            html += '</div>';
        });
        if (itemsContainer) itemsContainer.innerHTML = html;
        if (totalEl) totalEl.textContent = fmt(totalAmt);
        if (itemsContainer) {
            itemsContainer.querySelectorAll('.basket-qty-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var i = parseInt(this.dataset.idx);
                    if (this.dataset.action === 'minus') { if (cart[i].qty > 1) cart[i].qty--; else cart.splice(i, 1); }
                    else { cart[i].qty++; }
                    saveCart(); renderBasketPage();
                });
            });
            itemsContainer.querySelectorAll('.basket-wishlist-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var i = parseInt(this.dataset.idx);
                    var item = cart[i];
                    if (!item) return;
                    // Always add to wishlist when moving from basket (use unique id to ensure qty increments)
                    var wKeyUnique = item.id + '_0_' + Date.now();
                    wishlist.push({id: wKeyUnique, productId: item.id, colorIdx: 0, name: item.name, img: item.img});
                    // Remove from cart
                    cart.splice(i, 1);
                    localStorage.setItem('escalier_wishlist', JSON.stringify(wishlist));
                    saveCart();
                    // Force update both badges immediately
                    updateWishlistBadge();
                    updateCartBadge();
                    // Force update favPageCount (CTA wish button qty)
                    var newN = wishlist.length;
                    var favEl = $('favPageCount');
                    if (favEl) favEl.textContent = newN > 0 ? '(' + newN + ')' : '';
                    showBasketWishlistToast();
                    // Stay on basket tab and re-render
                    basketActiveTab = 'basket';
                    var bp3 = $('basketPage');
                    if (bp3) bp3.classList.remove('wish-tab-active');
                    var footer2 = $('basketPageFooter');
                    if (footer2) footer2.style.removeProperty('display');
                    // Update badges BEFORE render to ensure cart is updated
                    updateCartBadge();
                    updateWishlistBadge();
                    updateBasketTabUI();
                    // Render basket page after badge updates
                    renderBasketPage();
                    // Force update basket counter again to ensure it displays correctly
                    var basketCountEl = $('basketPageCount');
                    if (basketCountEl) {
                        var newTotal = cart.reduce(function(s,c){return s + c.qty},0);
                        basketCountEl.textContent = newTotal > 0 ? newTotal : '';
                    }
                    // Force favPageCount one more time (survives re-render)
                    var favEl2 = $('favPageCount');
                    if (favEl2) favEl2.textContent = wishlist.length > 0 ? '(' + wishlist.length + ')' : '';
                });
            });
            itemsContainer.querySelectorAll('.basket-erase-btn').forEach(function(btn) {
                btn.addEventListener('click', function() {
                    var i = parseInt(this.dataset.idx);
                    cart.splice(i, 1);
                    saveCart(); renderBasketPage();
                });
            });
            // Photo click → open PDP
            itemsContainer.querySelectorAll('.basket-item-photo img').forEach(function(img) {
                img.style.cursor = 'pointer';
                img.addEventListener('click', function() {
                    var item_el = this.closest('.basket-item');
                    if (!item_el) return;
                    var idx = parseInt(item_el.querySelector('[data-idx]') ? item_el.querySelector('[data-idx]').dataset.idx : -1);
                    if (idx < 0 || !cart[idx]) return;
                    var productId = cart[idx].id;
                    var allProds = products.concat(menProducts);
                    var product = allProds.find(function(p) { return p.id === productId; });
                    if (product) {
                        // Close basket first
                        var bp = $('basketPage');
                        if (bp) bp.style.display = 'none';
                        document.body.style.overflow = '';
                        openProductDetail(product);
                    }
                });
            });
        }
    }

    function renderFavoritesPage() {
        var itemsContainer = $('basketPageItems');
        if (!itemsContainer) return;
        var countEl = $('favPageCount');
        if (countEl) countEl.textContent = wishlist.length > 0 ? wishlist.length : '';
        if (wishlist.length === 0) {
            itemsContainer.innerHTML = '<div style="text-align:center;padding:80px 20px;"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1" style="margin:0 auto 16px;display:block;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><p style="font-size:13px;color:#999;">No favorites yet</p></div>';
            return;
        }
        var html = '';
        var allProds = products.concat(menProducts);
        // Group wishlist by productId to avoid duplicates in display
        var uniqueWishlist = [];
        var seenProductIds = [];
        var originalIndices = [];
        wishlist.forEach(function(w, idx) {
            if (seenProductIds.indexOf(w.productId) === -1) {
                seenProductIds.push(w.productId);
                uniqueWishlist.push(w);
                originalIndices.push(idx);
            }
        });
        uniqueWishlist.forEach(function(w, wIdx) {
            var origIdx = originalIndices[wIdx];
            var item = allProds.find(function(p) { return p.id === w.productId; });
            var colorIdx = w.colorIdx || 0;
            var img = w.img || (item ? P.colorThumb(item, colorIdx) : '');
            var name = w.name || (item ? item.name : 'Product');
            var price = item ? fmt(item.price) : '';
            var color = (item && item.colors[colorIdx]) ? item.colors[colorIdx].name : '';
            var eraseSvg = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M20 20H7L3 16l11-11 6 6-2 2"/><path d="M6.5 17.5l-4-4"/></svg>';
            html += '<div class="fav-item">';
            html += '<div class="fav-item-photo"><img src="' + img + '" alt="' + name + '"></div>';
            html += '<div class="fav-item-body">';
            html +=   '<p class="fav-item-name">' + name + '</p>';
            html +=   '<p class="fav-item-color">' + color + '</p>';
            html +=   '<p class="fav-item-price">' + price + '</p>';
            html += '</div>';
            html += '<div class="fav-item-actions"><button class="fav-erase-btn" data-widx="' + origIdx + '">' + eraseSvg + '</button></div>';
            html += '</div>';
        });
        itemsContainer.innerHTML = html;
        itemsContainer.querySelectorAll('.fav-erase-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var wIdx = parseInt(this.dataset.widx);
                wishlist.splice(wIdx, 1);
                localStorage.setItem('escalier_wishlist', JSON.stringify(wishlist));
                updateWishlistBadge();
                renderFavoritesPage();
            });
        });
    }

    // ===== FILTERS POPUP =====
    var currentFilterProducts = [];
    function openFiltersPopup(products) {
        currentFilterProducts = products;
        var popup = $('filtersPopup');
        if (popup) { popup.style.display = 'flex'; popup.classList.add('active'); }
    }

    document.querySelectorAll('.filter-capsule').forEach(function(c) {
        c.addEventListener('click', function() {
            document.querySelectorAll('.filter-capsule').forEach(function(x){x.classList.remove('active');});
            this.classList.add('active');
            filterState.sort = this.dataset.sort;
        });
    });

    document.querySelectorAll('.filter-color-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            this.classList.toggle('active');
            var c = this.dataset.color;
            var i = filterState.colors.indexOf(c);
            if (i > -1) filterState.colors.splice(i, 1); else filterState.colors.push(c);
        });
    });

    document.querySelectorAll('.filter-size-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
            this.classList.toggle('active');
            var s = this.dataset.size;
            var i = filterState.sizes.indexOf(s);
            if (i > -1) filterState.sizes.splice(i, 1); else filterState.sizes.push(s);
        });
    });

    var priceRangeMin = $('priceRangeMin');
    var priceRangeMax = $('priceRangeMax');
    function updatePriceRange() {
        var min = parseInt(priceRangeMin.value);
        var max = parseInt(priceRangeMax.value);
        if (min > max) { var t = min; min = max; max = t; }
        filterState.priceMin = min; filterState.priceMax = max;
        if ($('priceRangeMinVal')) $('priceRangeMinVal').textContent = (min/1000).toFixed(0) + '.000 Rp';
        if ($('priceRangeMaxVal')) $('priceRangeMaxVal').textContent = (max/1000).toFixed(0) + '.000 Rp';
    }
    if (priceRangeMin) { priceRangeMin.addEventListener('input', updatePriceRange); priceRangeMax.addEventListener('input', updatePriceRange); }

    $('viewResultsBtn') && $('viewResultsBtn').addEventListener('click', function() {
        closePopup('filtersPopup');
        var filtered = currentFilterProducts.slice();
        if (filterState.sort === 'price-low') filtered.sort(function(a,b){return a.price-b.price;});
        else if (filterState.sort === 'price-high') filtered.sort(function(a,b){return b.price-a.price;});
        filtered = filtered.filter(function(p){return p.price>=filterState.priceMin&&p.price<=filterState.priceMax;});
        if (filterState.colors.length>0) filtered=filtered.filter(function(p){return p.colors.some(function(c){return filterState.colors.some(function(fc){return c.name.toLowerCase().includes(fc);});});});
        if (filterState.sizes.length>0) filtered=filtered.filter(function(p){return p.sizes.some(function(s){return filterState.sizes.indexOf(s)>-1;});});
        renderCatalogGrid('clothingGrid',filtered,currentViewMode);
        setTimeout(function() { adjustCatalogGrid(); }, 50);
        showToast('Filters applied: ' + filtered.length + ' results');
    });

    $('filtersPopupClose') && $('filtersPopupClose').addEventListener('click', function() { closePopup('filtersPopup'); });

    // ===== HERO BUTTONS =====
    $('heroExploreBtn') && $('heroExploreBtn').addEventListener('click', function(e) { e.preventDefault(); openMenu(); });
    // heroVisitBtn handled by experience mode system below

    // ===== NEWSLETTER =====
    $('newsletterSubmit') && $('newsletterSubmit').addEventListener('click', function() {
        var email = $('newsletterEmail').value;
        if (email && email.includes('@')) { showToast('Thank you for subscribing!'); $('newsletterEmail').value = ''; }
        else { showToast('Please enter a valid email'); }
    });

    // ===== FOOTER LINKS =====
    window.showWomenFlow = function(e) { if(e)e.preventDefault(); pushHistory('newItemsGrid',function(){showNewItemsGrid('women');}); showNewItemsGrid('women'); };
    window.showMenFlow = function(e) { if(e)e.preventDefault(); pushHistory('newItemsGrid',function(){showNewItemsGrid('men');}); showNewItemsGrid('men'); };

    // ===== IMMERSIVE CAROUSEL AUTO-SCROLL =====
    (function() {
        var carousel = $('immersiveCarousel');
        var scrollContainer = $('immersiveScroll');
        var dots = document.querySelectorAll('.immersive-dot');
        if (!carousel || !scrollContainer) return;

        var currentSlide = 0;
        var totalSlides = scrollContainer.querySelectorAll('.immersive-slide').length;
        var autoScrollInterval = null;
        var isScrolling = false;

        function goToSlide(index) {
            if (index < 0) index = totalSlides - 1;
            if (index >= totalSlides) index = 0;
            currentSlide = index;

            var slideWidth = scrollContainer.clientWidth;
            scrollContainer.scrollTo({
                left: slideWidth * currentSlide,
                behavior: 'smooth'
            });

            // Update dots
            dots.forEach(function(dot, i) {
                dot.classList.toggle('active', i === currentSlide);
            });
        }

        function nextSlide() {
            goToSlide(currentSlide + 1);
        }

        // Auto-scroll every 4 seconds
        function startAutoScroll() {
            if (autoScrollInterval) clearInterval(autoScrollInterval);
            autoScrollInterval = setInterval(nextSlide, 4000);
        }

        function stopAutoScroll() {
            if (autoScrollInterval) {
                clearInterval(autoScrollInterval);
                autoScrollInterval = null;
            }
        }

        // Dot click handlers
        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                var slide = parseInt(this.dataset.slide);
                goToSlide(slide);
                stopAutoScroll();
                startAutoScroll(); // restart timer
            });
        });

        // Handle scroll end to update current slide
        scrollContainer.addEventListener('scroll', function() {
            if (isScrolling) return;
            isScrolling = true;

            setTimeout(function() {
                var slideWidth = scrollContainer.clientWidth;
                var newSlide = Math.round(scrollContainer.scrollLeft / slideWidth);
                if (newSlide !== currentSlide && newSlide >= 0 && newSlide < totalSlides) {
                    currentSlide = newSlide;
                    dots.forEach(function(dot, i) {
                        dot.classList.toggle('active', i === currentSlide);
                    });
                }
                isScrolling = false;
            }, 150);
        }, {passive: true});

        // Pause on touch, resume after
        scrollContainer.addEventListener('touchstart', stopAutoScroll, {passive: true});
        scrollContainer.addEventListener('touchend', function() {
            setTimeout(startAutoScroll, 3000); // resume after 3s
        }, {passive: true});

        // Start auto-scroll
        startAutoScroll();
    })();

        // ===== INIT =====
    updateCartBadge();

    // Enable horizontal swipe for featured collections
    var featScrolls = document.querySelectorAll('.fm-featured-scroll');
    featScrolls.forEach(function(scroll) {
        var startX, scrollLeft, isDown;

        scroll.addEventListener('touchstart', function(e) {
            isDown = true;
            startX = e.touches[0].pageX - scroll.offsetLeft;
            scrollLeft = scroll.scrollLeft;
        }, {passive: true});

        scroll.addEventListener('touchmove', function(e) {
            if (!isDown) return;
            var x = e.touches[0].pageX - scroll.offsetLeft;
            var walk = (x - startX) * 1.5;
            scroll.scrollLeft = scrollLeft - walk;
            e.stopPropagation();
        }, {passive: true});

        scroll.addEventListener('touchend', function() {
            isDown = false;
        }, {passive: true});

        // Mouse drag support for desktop testing
        scroll.addEventListener('mousedown', function(e) {
            isDown = true;
            startX = e.pageX - scroll.offsetLeft;
            scrollLeft = scroll.scrollLeft;
        });

        scroll.addEventListener('mouseleave', function() { isDown = false; });
        scroll.addEventListener('mouseup', function() { isDown = false; });

        scroll.addEventListener('mousemove', function(e) {
            if (!isDown) return;
            e.preventDefault();
            var x = e.pageX - scroll.offsetLeft;
            var walk = (x - startX) * 1.5;
            scroll.scrollLeft = scrollLeft - walk;
        });
    });

    // Cart icon click
    var cartIconBtn = $('cartIconBtn');
    if (cartIconBtn) {
        cartIconBtn.addEventListener('click', function(e) {
            e.preventDefault();
            basketActiveTab = 'basket';
            showBasketPage();
        });
    }
    // Wishlist icon click (header)
    var wishlistIconBtn = $('wishlistIconBtn');
    if (wishlistIconBtn) {
        wishlistIconBtn.addEventListener('click', function(e) {
            e.preventDefault();
            basketActiveTab = 'wish';
            showBasketPage();
        });
    }
    var fmCartIconBtn = $('fmCartIconBtn');
    if (fmCartIconBtn) {
        fmCartIconBtn.addEventListener('click', function(e) {
            e.preventDefault();
            closeMenu();
            basketActiveTab = 'basket';
            showBasketPage();
        });
    }

    // ===== PANORAMA 2: ZOOM & PAN =====
    var p2Inner = $('pano2Inner');
    var p2Img = $('pano2Img');
    var zL = $('zoomLevel');
    var zoom = 1;
    var panX = 0, panY = 0;
    var isDraggingP2 = false;
    var startX, startY;

    function setZ(z) {
        zoom = Math.min(Math.max(z, 1), 5);
        if (p2Img) {
            p2Img.style.transform = 'translate(' + panX + 'px, ' + panY + 'px) scale(' + zoom + ')';
            p2Img.style.transformOrigin = 'center center';
        }
        if (zL) zL.textContent = Math.round(zoom * 100) + '%';
    }

    function resetPan() {
        panX = 0;
        panY = 0;
        setZ(1);
    }

    var zoomInBtn = $('zoomInBtn');
    var zoomOutBtn = $('zoomOutBtn');
    var zoomResetBtn = $('zoomResetBtn');

    if (zoomInBtn) zoomInBtn.addEventListener('click', function() { setZ(zoom + 0.5); });
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', function() { setZ(zoom - 0.5); });
    if (zoomResetBtn) zoomResetBtn.addEventListener('click', function() { resetPan(); });

    // Touch pan support for Pano 2
    if (p2Inner && p2Img) {
        p2Inner.addEventListener('touchstart', function(e) {
            if (zoom > 1 && e.touches.length === 1) {
                isDraggingP2 = true;
                startX = e.touches[0].pageX - panX;
                startY = e.touches[0].pageY - panY;
                p2Img.classList.add('zooming');
            }
        }, {passive: false});

        p2Inner.addEventListener('touchmove', function(e) {
            if (isDraggingP2 && e.touches.length === 1) {
                e.preventDefault();
                panX = e.touches[0].pageX - startX;
                panY = e.touches[0].pageY - startY;
                p2Img.style.transform = 'translate(' + panX + 'px, ' + panY + 'px) scale(' + zoom + ')';
            }
        }, {passive: false});

        p2Inner.addEventListener('touchend', function() {
            isDraggingP2 = false;
            p2Img.classList.remove('zooming');
        }, {passive: true});

        // Double-tap to zoom
        var lastTap = 0;
        p2Inner.addEventListener('touchend', function(e) {
            var now = Date.now();
            if (now - lastTap < 300) {
                e.preventDefault();
                if (zoom > 1) resetPan();
                else setZ(2);
            }
            lastTap = now;
        }, {passive: false});

        // Mouse drag for desktop
        p2Inner.addEventListener('mousedown', function(e) {
            if (zoom > 1) {
                isDraggingP2 = true;
                startX = e.pageX - panX;
                startY = e.pageY - panY;
                p2Img.classList.add('zooming');
            }
        });

        window.addEventListener('mousemove', function(e) {
            if (isDraggingP2) {
                e.preventDefault();
                panX = e.pageX - startX;
                panY = e.pageY - startY;
                p2Img.style.transform = 'translate(' + panX + 'px, ' + panY + 'px) scale(' + zoom + ')';
            }
        });

        window.addEventListener('mouseup', function() {
            isDraggingP2 = false;
            p2Img.classList.remove('zooming');
        });

        // Wheel zoom
        p2Inner.addEventListener('wheel', function(e) {
            e.preventDefault();
            var delta = e.deltaY > 0 ? 0.9 : 1.1;
            setZ(zoom * delta);
        }, {passive: false});
    }

    // ===== STORE VIDEOS =====
    // Key iOS fix: play button receives tap directly (no e.preventDefault/stopPropagation)
    // video has pointer-events:none so iOS cannot trigger native fullscreen on video tap
    // ===== STORE VIDEOS - ULTIMATE iOS FIX =====
    // Enhanced playsinline implementation for both Safari and WKWebView

    function setupStoreVideo(videoId, playBtnId, muteBtnId, toggleId, cardId, tapLayerId) {
        var v = $(videoId);
        var playBtn = $(playBtnId);
        var muteBtn = $(muteBtnId);
        var toggle = $(toggleId);
        var card = $(cardId);
        var tapLayer = $(tapLayerId);
        if (!v || !card || !tapLayer) return;

        // CRITICAL: Set playsinline as BOTH attribute AND DOM property
        v.setAttribute('playsinline', '');
        v.setAttribute('webkit-playsinline', '');
        v.setAttribute('x5-playsinline', '');
        v.setAttribute('x-webkit-airplay', 'deny');
        v.setAttribute('disablePictureInPicture', '');
        v.setAttribute('disableRemotePlayback', '');
        v.removeAttribute('controls');

        // DOM property (critical for iOS)
        v.playsInline = true;
        v.webkitPlaysInline = true;

        // CSS to prevent fullscreen
        v.style.objectFit = 'cover';
        v.style.pointerEvents = 'none';
        v.style.webkitTouchCallout = 'none';
        v.style.userSelect = 'none';
        v.style.webkitUserSelect = 'none';
        v.style.webkitUserDrag = 'none';

        var playing = false;

        // Tap layer handles ALL interactions
        tapLayer.addEventListener('click', function(e) {
            if (e.target.closest('.tour-play-btn')) return;
            if (!playing) {
                startPlayback();
            } else {
                pausePlayback();
            }
        });

        tapLayer.addEventListener('touchend', function(e) {
            if (!playing) {
                e.preventDefault();
                startPlayback();
            }
        }, {passive: false});

        // Play button
        if (playBtn) {
            playBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                if (!playing) {
                    startPlayback();
                } else {
                    pausePlayback();
                }
            });
        }

        function startPlayback() {
            /* Volume ON by default - medium level */
            v.muted = false;
            v.volume = 0.5;
            var playPromise = v.play();

            if (playPromise !== undefined) {
                playPromise.then(function() {
                    playing = true;
                    tapLayer.classList.add('playing');
                    if (playBtn) playBtn.classList.add('hidden');
                    if (muteBtn) {
                        var icon = muteBtn.querySelector('i');
                        if (icon) icon.className = 'fas fa-volume-mute';
                    }
                }).catch(function(err) {
                    console.log('Play error:', err);
                    v.muted = true;
                    v.play().then(function() {
                        playing = true;
                        tapLayer.classList.add('playing');
                        if (playBtn) playBtn.classList.add('hidden');
                    }).catch(function(err2) {
                        console.log('Second attempt failed:', err2);
                    });
                });
            } else {
                playing = true;
                tapLayer.classList.add('playing');
                if (playBtn) playBtn.classList.add('hidden');
            }
        }

        function pausePlayback() {
            v.pause();
            playing = false;
            tapLayer.classList.remove('playing');
            if (playBtn) {
                playBtn.classList.remove('hidden');
                var icon = playBtn.querySelector('i');
                if (icon) icon.className = 'fas fa-play';
            }
        }

        // Mute toggle
        if (muteBtn) {
            muteBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                v.muted = !v.muted;
                var icon = muteBtn.querySelector('i');
                if (icon) icon.className = v.muted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
                muteBtn.classList.toggle('unmuted', !v.muted);
            });
        }

        // Portrait/landscape toggle
        if (toggle) {
            toggle.addEventListener('click', function(e) {
                e.stopPropagation();
                card.classList.toggle('portrait');
                var icon = toggle.querySelector('i');
                if (icon) {
                    icon.className = card.classList.contains('portrait') ? 'fas fa-compress' : 'fas fa-expand';
                }
            });
        }

        // Autoplay on load with volume ON
        v.muted = false;
        v.volume = 0.5;
        v.play().then(function() {
            playing = true;
            tapLayer.classList.add('playing');
            if (playBtn) playBtn.classList.add('hidden');
        }).catch(function() {
            playing = false;
        });
    }

    // Initialize both videos
    setupStoreVideo('womenVideo', 'womenPlayBtn', 'womenMuteBtn', 'womenViewToggle', 'womenCard', 'womenTapLayer');
    setupStoreVideo('menVideo', 'menPlayBtn', 'menMuteBtn', 'menViewToggle', 'menCard', 'menTapLayer');



    // Store experience carousel - immersive auto-scroll
    var storeSlides = document.querySelectorAll('.store-exp-slide');
    var storeDotBtns = document.querySelectorAll('.store-exp-nav .store-exp-dot');
    var currentStoreSlide = 0;
    var storeInterval = null;

    function setStoreSlide(idx) {
        currentStoreSlide = idx;
        storeSlides.forEach(function(s, i) { s.classList.toggle('active', i === idx); });
        storeDotBtns.forEach(function(d, i) { d.classList.toggle('active', i === idx); });
    }

    storeDotBtns.forEach(function(dot) {
        dot.addEventListener('click', function() {
            setStoreSlide(parseInt(this.dataset.slide));
            resetStoreInterval();
        });
    });

    var storePlayBtn = $('storeExpPlayBtn');
    if (storePlayBtn) {
        storePlayBtn.addEventListener('click', function() {
            setStoreSlide((currentStoreSlide + 1) % storeSlides.length);
            resetStoreInterval();
        });
    }

    function startStoreInterval() {
        storeInterval = setInterval(function() {
            setStoreSlide((currentStoreSlide + 1) % storeSlides.length);
        }, 4000);
    }

    function resetStoreInterval() {
        if (storeInterval) clearInterval(storeInterval);
        startStoreInterval();
    }

    if (storeSlides.length > 0) {
        startStoreInterval();
    }

    // ===== CATALOG ROWS AUTO-HIDE (scroll-based, smooth) =====
    // Rule: scroll DOWN (see content below) → HIDE rows
    //       scroll UP (see content above) → SHOW rows
    var _catAccDelta = 0;        // accumulated scroll delta
    var _catLastDir = 0;         // last scroll direction: 0=none, 1=down, -1=up
    var _catIsTicking = false;   // rAF lock
    var _catTriggerThreshold = 25; // px accumulated in one direction to trigger
    var _catNoiseThreshold = 3;    // px below this is ignored as noise
    var _catHeaderHidden = false;
    var _catTouchActive = false;   // is user finger currently on screen
    var _catSettleTimer = null;    // timer to ignore momentum after touchend

    function setCatalogHeaderVisible(visible) {
        _catHeaderHidden = !visible;
        document.querySelectorAll('.cat-row1, .cat-row2').forEach(function(el) {
            if (visible) {
                el.classList.remove('cat-rows-hidden');
            } else {
                el.classList.add('cat-rows-hidden');
            }
        });
        // Also toggle on parent .catalog-section untuk adjust grid padding-top
        document.querySelectorAll('.catalog-section').forEach(function(sec) {
            if (visible) {
                sec.classList.remove('cat-rows-hidden');
            } else {
                sec.classList.add('cat-rows-hidden');
            }
        });
    }

    function setupCatalogAutoHide(scrollEl) {
        // Always show rows when section opens
        setCatalogHeaderVisible(true);
        // Reset state
        _catAccDelta = 0;
        _catLastDir = 0;
        _catTouchActive = false;
        if (_catSettleTimer) { clearTimeout(_catSettleTimer); _catSettleTimer = null; }

        // Remove old listener
        if (window._catScrollHandler) {
            window.removeEventListener('scroll', window._catScrollHandler, {passive: true});
            window._catScrollHandler = null;
        }
        if (window._catTouchStartHandler) {
            window.removeEventListener('touchstart', window._catTouchStartHandler, {passive: true});
            window._catTouchStartHandler = null;
        }
        if (window._catTouchEndHandler) {
            window.removeEventListener('touchend', window._catTouchEndHandler, {passive: true});
            window._catTouchEndHandler = null;
        }
        if (window._catMomentumTimer) {
            clearTimeout(window._catMomentumTimer);
            window._catMomentumTimer = null;
        }

        var _catLastSt = window.scrollY || 0;

        // Touch tracking: know when user finger is on screen
        window._catTouchStartHandler = function() {
            _catTouchActive = true;
            if (_catSettleTimer) { clearTimeout(_catSettleTimer); _catSettleTimer = null; }
        };
        window._catTouchEndHandler = function() {
            _catTouchActive = false;
            // After finger lifted, enter settle period: ignore momentum noise for 120ms
            if (_catSettleTimer) clearTimeout(_catSettleTimer);
            _catSettleTimer = setTimeout(function() {
                // After settle period, reset accumulator so old momentum doesn't affect next gesture
                _catAccDelta = 0;
                _catLastDir = 0;
                _catSettleTimer = null;
            }, 120);
        };
        window.addEventListener('touchstart', window._catTouchStartHandler, {passive: true});
        window.addEventListener('touchend', window._catTouchEndHandler, {passive: true});

        window._catScrollHandler = function() {
            var st = window.scrollY || window.pageYOffset || 0;
            var rawDelta = st - _catLastSt;
            _catLastSt = st;

            // Dynamic noise threshold: higher when finger not on screen (settling)
            var effectiveNoise = _catTouchActive ? _catNoiseThreshold : 12;
            if (Math.abs(rawDelta) < effectiveNoise) return;

            var dir = rawDelta > 0 ? 1 : -1;

            // If direction flipped, reset accumulator — prevents bounce false-positives
            if (_catLastDir !== 0 && dir !== _catLastDir) {
                _catAccDelta = 0;
            }

            _catAccDelta += rawDelta;
            _catLastDir = dir;

            // Clamp accumulator to prevent runaway growth
            if (Math.abs(_catAccDelta) > _catTriggerThreshold * 3) {
                _catAccDelta = dir * _catTriggerThreshold * 2;
            }

            // Batch UI updates via rAF
            if (!_catIsTicking) {
                _catIsTicking = true;
                requestAnimationFrame(function() {
                    if (_catAccDelta >= _catTriggerThreshold) {
                        // Net scroll DOWN enough → HIDE
                        setCatalogHeaderVisible(false);
                        _catAccDelta = 0;
                    } else if (_catAccDelta <= -_catTriggerThreshold) {
                        // Net scroll UP enough → SHOW
                        setCatalogHeaderVisible(true);
                        _catAccDelta = 0;
                    }
                    _catIsTicking = false;
                });
            }
        };

        window.addEventListener('scroll', window._catScrollHandler, {passive: true});
    }

    function cleanupCatalogAutoHide() {
        // Remove global scroll listener saat keluar dari catalog section
        if (window._catScrollHandler) {
            window.removeEventListener('scroll', window._catScrollHandler, {passive: true});
            window._catScrollHandler = null;
        }
        if (window._catTouchStartHandler) {
            window.removeEventListener('touchstart', window._catTouchStartHandler, {passive: true});
            window._catTouchStartHandler = null;
        }
        if (window._catTouchEndHandler) {
            window.removeEventListener('touchend', window._catTouchEndHandler, {passive: true});
            window._catTouchEndHandler = null;
        }
        if (window._catMomentumTimer) {
            clearTimeout(window._catMomentumTimer);
            window._catMomentumTimer = null;
        }
        if (_catSettleTimer) {
            clearTimeout(_catSettleTimer);
            _catSettleTimer = null;
        }
        // Reset accumulated state
        _catAccDelta = 0;
        _catLastDir = 0;
        _catTouchActive = false;
        // Reset rows visible
        setCatalogHeaderVisible(true);
    }

    // ===== PDP HELPERS: Complete Your Look / You May Also Like =====
    function setupPdpHeaderAdaptive() {
        var pdpScroll = $('pdpScroll');
        var pdpHeaderBar = $('pdpHeaderBar');
        var pdpImageScroll = $('pdpImageScroll');
        if (!pdpScroll || !pdpHeaderBar || !pdpImageScroll) return;

        pdpHeaderBar.classList.remove('hide');

        // Sample pixel color from image to determine header theme
        function sampleImageBrightness() {
            try {
                // Get currently visible image in scroll
                var imgs = pdpImageScroll.querySelectorAll('.pdp-main-img');
                var scrollIdx = Math.round(pdpImageScroll.scrollLeft / pdpImageScroll.clientWidth);
                var img = imgs[scrollIdx] || imgs[0];
                if (!img || !img.complete || img.naturalWidth === 0) return null;

                // Sample top area of image (behind header area: 0 to 117px)
                var canvas = document.createElement('canvas');
                var sampleW = 40, sampleH = 40;
                canvas.width = sampleW;
                canvas.height = sampleH;
                var ctx = canvas.getContext('2d');

                // Draw portion of image corresponding to header zone
                var imgRect = img.getBoundingClientRect();
                var scaleX = img.naturalWidth / imgRect.width;
                var scaleY = img.naturalHeight / imgRect.height;
                var headerH = 117;
                // Sample from middle of header area
                var srcY = (headerH * 0.4) * scaleY;
                var srcX = (imgRect.width * 0.1) * scaleX;

                ctx.drawImage(img,
                    srcX, srcY,
                    imgRect.width * 0.8 * scaleX, headerH * 0.5 * scaleY,
                    0, 0, sampleW, sampleH
                );

                var data = ctx.getImageData(0, 0, sampleW, sampleH).data;
                var r = 0, g = 0, b = 0, count = 0;
                for (var i = 0; i < data.length; i += 4) {
                    r += data[i]; g += data[i+1]; b += data[i+2]; count++;
                }
                if (count === 0) return null;
                r = r/count; g = g/count; b = b/count;

                // Perceived brightness (ITU-R BT.709)
                var brightness = 0.2126*r + 0.7152*g + 0.0722*b;
                return brightness;
            } catch(e) {
                return null;
            }
        }

        function updatePdpHeaderTheme() {
            var pdpScrollTop = pdpScroll.scrollTop;
            var imgArea = document.querySelector('.pdp-image-area');
            var imgAreaH = imgArea ? imgArea.offsetHeight : 400;

            // Once scrolled past image area: use light theme (white bg content)
            if (pdpScrollTop > imgAreaH - 80) {
                applyTheme('light');
                return;
            }

            // Sample image brightness
            var brightness = sampleImageBrightness();
            if (brightness === null) {
                // Fallback: image not loaded yet, default dark
                applyTheme('dark');
                return;
            }

            // Light image (brightness > 160) → dark icons
            // Dark image (brightness <= 160) → white icons
            if (brightness > 160) {
                applyTheme('light');
            } else {
                applyTheme('dark');
            }
        }

        function applyTheme(theme) {
            if (theme === 'light') {
                pdpHeaderBar.classList.remove('theme-dark');
                pdpHeaderBar.classList.add('theme-light');
            } else {
                pdpHeaderBar.classList.remove('theme-light');
                pdpHeaderBar.classList.add('theme-dark');
            }
        }

        // Also update theme when images load
        var imgs = pdpImageScroll.querySelectorAll('.pdp-main-img');
        imgs.forEach(function(img) {
            img.addEventListener('load', function() {
                setTimeout(updatePdpHeaderTheme, 100);
            });
        });

        // Update on scroll (both image horizontal scroll and page vertical scroll)
        pdpImageScroll.addEventListener('scroll', function() {
            setTimeout(updatePdpHeaderTheme, 50);
        }, { passive: true });

        updatePdpHeaderTheme();

        if (pdpScroll._pdpScrollHandler) {
            pdpScroll.removeEventListener('scroll', pdpScroll._pdpScrollHandler, { passive: true });
        }
        pdpScroll.addEventListener('scroll', updatePdpHeaderTheme, { passive: true });
        pdpScroll._pdpScrollHandler = updatePdpHeaderTheme;
    }

    function hidePdpSections() {
        var cl = $('pdpCompleteLook');
        var yml = $('pdpYouMayLike');
        if (cl) cl.style.display = 'none';
        if (yml) yml.style.display = 'none';
    }

    function closePDP() {
        var pdp = $('productDetail');
        if (pdp) {
            pdp.classList.remove('active');
            pdp.style.display = 'none';
        }
        document.body.style.overflow = '';
        var siteHeader = $('siteHeader');
        if (siteHeader) siteHeader.style.display = '';
        hidePdpSections();
        navigateBack();
    }

    function showCompleteYourLook(product) {
        var cl = $('pdpCompleteLook');
        var grid = $('pdpLookGrid');
        if (!cl || !grid) return;
        if (cl.style.display === 'block') return;

        cl.style.display = 'block';
        grid.innerHTML = '';

        // Pick 3 products with same style/gender as current product
        var styleMatches = products.filter(function(p) {
            return p.style === product.style && p.id !== product.id && p.gender === product.gender;
        });
        if (styleMatches.length < 3) {
            var genderMatches = products.filter(function(p) {
                return p.gender === product.gender && p.id !== product.id;
            });
            styleMatches = styleMatches.concat(genderMatches);
        }
        var lookProducts = styleMatches.slice(0, 3);

        lookProducts.forEach(function(p, idx) {
            var card = document.createElement('div');
            card.className = 'pdp-look-card';
            card.innerHTML = '<div class="pdp-look-item"><img src="' + P.thumb(p) + '" alt="' + p.name + '"><button class="pdp-look-add-inner pdp-look-add" data-id="' + p.id + '">+</button></div><div class="pdp-look-label">Look ' + (idx + 1) + '</div><div class="pdp-look-name">' + p.name + '</div><div class="pdp-look-price">Rp ' + p.price.toLocaleString('id-ID') + '</div>';
            grid.appendChild(card);

            card.querySelector('.pdp-look-add').onclick = function(e) {
                e.stopPropagation();
                openSizePopup(p);
            };
            card.onclick = function(e) {
                if (e.target.classList.contains('pdp-look-add')) return;
                openProductDetail(p);
            };
        });
    }

    function renderYouMayAlsoLike(currentProduct) {
        var yml = $('pdpYouMayLike');
        var grid = $('pdpAlGrid');
        if (!yml || !grid) return;
        yml.style.display = 'block';
        grid.innerHTML = '';

        // Pick 3 random products from same gender, different from current
        var candidates = products.filter(function(p) {
            return p.gender === currentProduct.gender && p.id !== currentProduct.id;
        });
        for (var i = candidates.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var tmp = candidates[i];
            candidates[i] = candidates[j];
            candidates[j] = tmp;
        }
        var recs = candidates.slice(0, 3);

        recs.forEach(function(p) {
            var card = document.createElement('div');
            card.className = 'pdp-al-card';
            card.innerHTML = '<div class="pdp-al-item"><img src="' + P.thumb(p) + '" alt="' + p.name + '"><button class="pdp-al-add-inner pdp-al-add" data-id="' + p.id + '">+</button></div><div class="pdp-al-name">' + p.name + '</div><div class="pdp-al-price">Rp ' + p.price.toLocaleString('id-ID') + '</div>';
            grid.appendChild(card);

            card.querySelector('.pdp-al-add').onclick = function(e) {
                e.stopPropagation();
                openSizePopup(p);
            };
            card.onclick = function(e) {
                if (e.target.classList.contains('pdp-al-add')) return;
                openProductDetail(p);
            };
        });
    }

    function scrollToPdpSection(id) {
        var el = $(id);
        if (el && $('pdpScroll')) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    window.showComingSoon = showComingSoon;


    // ===== ZOOM FULLSCREEN =====
    var zoomProduct = null;
    var zoomColorIdx = 0;
    var zoomCurrentIdx = 0;
    var zoomLevel = 1;
    var zoomPanX = 0, zoomPanY = 0;
    var zoomIsDragging = false;
    var zoomDragStartX, zoomDragStartY;
    var zoomScrollEl = null;
    var zoomImgs = [];

    function openZoom(product, colorIdx, startIdx) {
        zoomProduct = product;
        zoomColorIdx = colorIdx;
        zoomCurrentIdx = startIdx || 0;
        resetZoomState();

        var overlay = $('pdpZoomOverlay');
        var scroll = $('pdpZoomScroll');
        var dotsContainer = $('pdpZoomDots');
        var label = $('pdpZoomLabel');
        if (!overlay || !scroll) return;
        zoomScrollEl = scroll;

        var photos = P.stylingPhotos(product, colorIdx);
        var stylings = product.colors[colorIdx].stylings;

        // Build images
        scroll.innerHTML = '';
        zoomImgs = [];
        photos.forEach(function(src, i) {
            var wrapper = document.createElement('div');
            wrapper.style.cssText = 'width:100vw;min-width:100vw;height:100%;flex-shrink:0;scroll-snap-align:start;display:flex;align-items:center;justify-content:center;overflow:hidden;position:relative;';
            var img = document.createElement('img');
            img.src = src;
            img.alt = product.name;
            img.className = 'pdp-zoom-img';
            img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;transform-origin:center center;';
            img.draggable = false;
            wrapper.appendChild(img);
            scroll.appendChild(wrapper);
            zoomImgs.push({ wrapper: wrapper, img: img });
        });

        // Build dots
        if (dotsContainer) {
            dotsContainer.innerHTML = '';
            photos.forEach(function(_, i) {
                var dot = document.createElement('div');
                dot.className = 'pdp-zoom-dot' + (i === zoomCurrentIdx ? ' active' : '');
                dotsContainer.appendChild(dot);
            });
        }

        // Set label
        if (label && stylings[zoomCurrentIdx]) {
            label.textContent = stylings[zoomCurrentIdx].label;
        }

        // Hide PDP header behind zoom overlay
        var pdpHeaderBar = $('pdpHeaderBar');
        if (pdpHeaderBar) pdpHeaderBar.style.display = 'none';
        // Show overlay first before scrolling
        overlay.style.display = 'flex';

        // Scroll to startIdx after render
        setTimeout(function() {
            scroll.scrollLeft = zoomCurrentIdx * window.innerWidth;
        }, 80);

        // Update dots + label on scroll
        scroll.onscroll = function() {
            if (zoomLevel > 1) return; // disable scroll update when zoomed
            var idx = Math.round(scroll.scrollLeft / Math.max(1, window.innerWidth));
            if (idx !== zoomCurrentIdx) {
                zoomCurrentIdx = idx;
                if (dotsContainer) {
                    var dots = dotsContainer.querySelectorAll('.pdp-zoom-dot');
                    dots.forEach(function(d, i) { d.classList.toggle('active', i === idx); });
                }
                if (label && stylings[idx]) label.textContent = stylings[idx].label;
                resetZoomState(false); // reset zoom when swiping to next image
            }
            updateZoomHeaderTheme();
        };

        updateZoomHeaderTheme();

        // Close btn
        var closeBtn = $('pdpZoomClose');
        if (closeBtn) {
            var newCloseBtn = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newCloseBtn, closeBtn);
            $('pdpZoomClose').onclick = closeZoom;
        }

        // Setup zoom engine
        setupZoomEngine(scroll);
    }

    function resetZoomState(full) {
        zoomLevel = 1;
        zoomPanX = 0;
        zoomPanY = 0;
        zoomIsDragging = false;
        if (full !== false) {
            zoomImgs.forEach(function(item) {
                if (item.img) {
                    item.img.style.transform = 'translate(0px, 0px) scale(1)';
                }
            });
            if (zoomScrollEl) zoomScrollEl.classList.remove('zoom-active');
        }
    }

    function setZoomImage(imgEl, level, px, py) {
        if (!imgEl) return;
        imgEl.style.transform = 'translate(' + px + 'px, ' + py + 'px) scale(' + level + ')';
    }

    function getCurrentZoomImg() {
        if (zoomCurrentIdx >= 0 && zoomCurrentIdx < zoomImgs.length) {
            return zoomImgs[zoomCurrentIdx].img;
        }
        return null;
    }

    function getCurrentZoomWrapper() {
        if (zoomCurrentIdx >= 0 && zoomCurrentIdx < zoomImgs.length) {
            return zoomImgs[zoomCurrentIdx].wrapper;
        }
        return null;
    }

    function applyZoomToCurrent(level) {
        var img = getCurrentZoomImg();
        if (!img) return;
        zoomLevel = Math.min(Math.max(level, 1), 5);
        // Constrain pan values when zoom changes
        constrainPan();
        setZoomImage(img, zoomLevel, zoomPanX, zoomPanY);
        if (zoomScrollEl) {
            if (zoomLevel > 1) zoomScrollEl.classList.add('zoom-active');
            else zoomScrollEl.classList.remove('zoom-active');
        }
    }

    function constrainPan() {
        var maxPan = (zoomLevel - 1) * window.innerWidth * 0.5;
        var maxPanY = (zoomLevel - 1) * window.innerHeight * 0.5;
        zoomPanX = Math.max(-maxPan, Math.min(maxPan, zoomPanX));
        zoomPanY = Math.max(-maxPanY, Math.min(maxPanY, zoomPanY));
    }

    function setupZoomEngine(scroll) {
        // Remove previous listeners by cloning
        var newScroll = scroll.cloneNode(false);
        // Move all children to new scroll
        while (scroll.firstChild) newScroll.appendChild(scroll.firstChild);
        scroll.parentNode.replaceChild(newScroll, scroll);
        zoomScrollEl = newScroll;
        // Re-attach references to wrappers in new scroll
        var wrappers = newScroll.querySelectorAll(':scope > div');
        zoomImgs.forEach(function(item, i) {
            if (wrappers[i]) item.wrapper = wrappers[i];
            var img = wrappers[i] ? wrappers[i].querySelector('img') : null;
            if (img) item.img = img;
        });

        // Re-attach onscroll for dots/label navigation
        var dotsContainer = $('pdpZoomDots');
        var label = $('pdpZoomLabel');
        var stylings = zoomProduct && zoomProduct.colors[zoomColorIdx] ? zoomProduct.colors[zoomColorIdx].stylings : [];
        newScroll.onscroll = function() {
            if (zoomLevel > 1) return;
            var idx = Math.round(newScroll.scrollLeft / Math.max(1, window.innerWidth));
            if (idx !== zoomCurrentIdx) {
                zoomCurrentIdx = idx;
                if (dotsContainer) {
                    var dots = dotsContainer.querySelectorAll('.pdp-zoom-dot');
                    dots.forEach(function(d, i) { d.classList.toggle('active', i === idx); });
                }
                if (label && stylings[idx]) label.textContent = stylings[idx].label;
                resetZoomState(false);
            }
            updateZoomHeaderTheme();
        };

        // Zoom buttons removed — gesture zoom only (double-tap, pinch, wheel)

        // Pinch state to prevent double-tap false-positive after pinch release
        var isPinching = false;
        var pinchEndTimer = null;

        // Double-tap to zoom
        var lastTap = 0;
        newScroll.addEventListener('touchend', function(e) {
            // Ignore if we just finished a pinch gesture
            if (isPinching) return;
            // Only process as tap if exactly one finger was released (single tap, not pinch end)
            if (e.changedTouches.length !== 1) return;
            var now = Date.now();
            var target = e.target.closest('img');
            if (now - lastTap < 300 && target) {
                e.preventDefault();
                if (zoomLevel > 1) resetZoomState();
                else applyZoomToCurrent(2.5);
            }
            lastTap = now;
        }, {passive: false});

        // Double-click for desktop
        newScroll.addEventListener('dblclick', function(e) {
            var target = e.target.closest('img');
            if (target) {
                e.preventDefault();
                if (zoomLevel > 1) resetZoomState();
                else applyZoomToCurrent(2.5);
            }
        });

        // Pinch zoom
        var initialPinchDist = 0;
        var initialZoom = 1;
        newScroll.addEventListener('touchstart', function(e) {
            if (e.touches.length === 2) {
                e.preventDefault();
                isPinching = true;
                if (pinchEndTimer) { clearTimeout(pinchEndTimer); pinchEndTimer = null; }
                // Reset double-tap timer so pinch release isn't mistaken for double-tap
                lastTap = 0;
                initialPinchDist = Math.hypot(
                    e.touches[0].pageX - e.touches[1].pageX,
                    e.touches[0].pageY - e.touches[1].pageY
                );
                initialZoom = zoomLevel;
                var img = getCurrentZoomImg();
                if (img) img.classList.add('zooming');
            } else if (e.touches.length === 1 && zoomLevel > 1) {
                e.preventDefault();
                zoomIsDragging = true;
                zoomDragStartX = e.touches[0].pageX - zoomPanX;
                zoomDragStartY = e.touches[0].pageY - zoomPanY;
                var img = getCurrentZoomImg();
                if (img) img.classList.add('zooming');
            }
        }, {passive: false});

        newScroll.addEventListener('touchmove', function(e) {
            if (e.touches.length === 2) {
                e.preventDefault();
                var dist = Math.hypot(
                    e.touches[0].pageX - e.touches[1].pageX,
                    e.touches[0].pageY - e.touches[1].pageY
                );
                var scale = dist / Math.max(initialPinchDist, 1);
                applyZoomToCurrent(initialZoom * scale);
            } else if (zoomIsDragging && e.touches.length === 1) {
                e.preventDefault();
                zoomPanX = e.touches[0].pageX - zoomDragStartX;
                zoomPanY = e.touches[0].pageY - zoomDragStartY;
                constrainPan();
                var img = getCurrentZoomImg();
                setZoomImage(img, zoomLevel, zoomPanX, zoomPanY);
            }
        }, {passive: false});

        newScroll.addEventListener('touchend', function(e) {
            zoomIsDragging = false;
            if (e.touches.length < 2) {
                var img = getCurrentZoomImg();
                if (img) img.classList.remove('zooming');
            }
            // When all fingers lifted, end pinch after brief delay to block double-tap
            if (e.touches.length === 0 && isPinching) {
                if (pinchEndTimer) clearTimeout(pinchEndTimer);
                pinchEndTimer = setTimeout(function() {
                    isPinching = false;
                    pinchEndTimer = null;
                }, 350);
            }
        }, {passive: true});

        // Mouse drag for desktop pan
        newScroll.addEventListener('mousedown', function(e) {
            if (zoomLevel > 1) {
                e.preventDefault();
                zoomIsDragging = true;
                zoomDragStartX = e.pageX - zoomPanX;
                zoomDragStartY = e.pageY - zoomPanY;
                var img = getCurrentZoomImg();
                if (img) img.classList.add('zooming');
            }
        });

        window.addEventListener('mousemove', function onZoomMouseMove(e) {
            if (zoomIsDragging) {
                e.preventDefault();
                zoomPanX = e.pageX - zoomDragStartX;
                zoomPanY = e.pageY - zoomDragStartY;
                constrainPan();
                var img = getCurrentZoomImg();
                setZoomImage(img, zoomLevel, zoomPanX, zoomPanY);
            }
        });

        window.addEventListener('mouseup', function onZoomMouseUp() {
            if (zoomIsDragging) {
                zoomIsDragging = false;
                var img = getCurrentZoomImg();
                if (img) img.classList.remove('zooming');
            }
        });

        // Wheel zoom for desktop
        newScroll.addEventListener('wheel', function(e) {
            e.preventDefault();
            var delta = e.deltaY > 0 ? 0.9 : 1.1;
            applyZoomToCurrent(zoomLevel * delta);
        }, {passive: false});

    }

    function updateZoomBadges() {
        // No-op — basket icon removed from zoom overlay
    }

    function closeZoom() {
        var overlay = $('pdpZoomOverlay');
        if (overlay) overlay.style.display = 'none';
        var pdpHeaderBar = $('pdpHeaderBar');
        if (pdpHeaderBar) pdpHeaderBar.style.display = '';
        resetZoomState();
    }

    function updateZoomHeaderTheme() {
        // Zoom is always on dark background - use white icons
        var header = $('pdpZoomHeader');
        if (header) header.style.color = '#fff';
    }

    // ===== PHOTO WISHLIST (bottom-left of image area) =====
    function setupPhotoWishlist(product) {
        var btn = $('pdpPhotoWishlist');
        if (!btn) return;
        var wKey = product.id + '_' + selectedColor;
        var isWished = wishlist.some(function(w) { return w.id === wKey; });
        btn.classList.toggle('active', isWished);

        // Remove old listener
        var newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        btn = $('pdpPhotoWishlist');

        btn.onclick = function() {
            var wKey2 = product.id + '_' + selectedColor;
            var idx = wishlist.findIndex(function(w) { return w.id === wKey2; });
            if (idx === -1) {
                wishlist.push({id:wKey2, productId:product.id, colorIdx:selectedColor, name:product.name, img:P.colorThumb(product, selectedColor)});
                btn.classList.add('active');
                showWishlistToast('Add this item to Wish List');
            } else {
                wishlist.splice(idx, 1);
                btn.classList.remove('active');
                showWishlistToast('Remove this item from Wish List');
            }
            localStorage.setItem('escalier_wishlist', JSON.stringify(wishlist));
            updateWishlistBadge();
        };
    }

    function showWishlistToast(msg) {
        var toast = $('pdpPhotoWishlistToast');
        if (!toast) return;
        toast.textContent = msg || '';
        toast.classList.add('show');
        setTimeout(function() { toast.classList.remove('show'); }, 2500);
    }

    function toggleWishlist(product, colorIdx) {
        var wKey = product.id + '_' + colorIdx;
        var idx = wishlist.findIndex(function(w) { return w.id === wKey; });
        if (idx === -1) {
            wishlist.push({id:wKey, productId:product.id, colorIdx:colorIdx, name:product.name, img:P.colorThumb(product, colorIdx)});
        } else {
            wishlist.splice(idx, 1);
        }
        localStorage.setItem('escalier_wishlist', JSON.stringify(wishlist));
        updateWishlistBadge();
    }

    // ===== WISHLIST BADGE =====
    function updateWishlistBadge() {
        var n = wishlist.length;
        // Header wishlist counter (main header)
        var headerWishCount = $('wishlistCount');
        if (headerWishCount) {
            headerWishCount.textContent = n > 0 ? String(n) : '';
            headerWishCount.style.display = n > 0 ? '' : 'none';
        }
        // basket page wishlist qty as (n)
        var favCount = $('favPageCount');
        if (favCount) favCount.textContent = n > 0 ? '(' + n + ')' : '';
        // other badges
        ['pdpWishlistCount','wishlistSectionCount'].forEach(function(id) {
            var el = $(id);
            if (el) {
                el.textContent = n > 0 ? String(n) : '';
                el.classList.toggle('show', n > 0);
            }
        });
    }

    // ===== PDP HEADER WISHLIST BTN =====
    function setupPdpHeaderWishlist(product) {
        var btn = $('pdpWishlistBtn');
        if (!btn) return;
        var newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        btn = $('pdpWishlistBtn');
        btn.onclick = function() {
            showWishlistSection();
        };
    }

    // ===== INLINE COLOR ICONS ROW =====
    var colorIconsVisible = false;

    function setupColorIconsRow(product) {
        var row = $('pdpColorIconsRow');
        var toggleBtn = $('pdpMoreColors');
        var countSpan = $('moreColorsCount');
        if (!row || !toggleBtn) return;

        row.innerHTML = '';
        colorIconsVisible = false;

        product.colors.forEach(function(color, i) {
            var btn = document.createElement('button');
            btn.className = 'pdp-color-icon-btn' + (i === selectedColor ? ' active' : '');
            btn.title = color.name;
            var img = document.createElement('img');
            img.src = P.colorThumb(product, i);
            img.alt = color.name;
            img.loading = 'lazy';
            btn.appendChild(img);
            btn.onclick = function() {
                selectedColor = i;
                row.querySelectorAll('.pdp-color-icon-btn').forEach(function(b, bi) {
                    b.classList.toggle('active', bi === i);
                });
                setupPdpImageSwipe(product);
                var activeColorName = $('pdpActiveColorName');
                if (activeColorName) activeColorName.textContent = color.name + ' | Ref. ' + P.colorRef(product, i);
                setupPhotoWishlist(product);
            };
            row.appendChild(btn);
        });

        if (product.colors.length > 1) {
            toggleBtn.style.display = 'inline-flex';
            if (countSpan) countSpan.textContent = product.colors.length - 1;
            var newToggle = toggleBtn.cloneNode(true);
            toggleBtn.parentNode.replaceChild(newToggle, toggleBtn);
            var freshToggle = $('pdpMoreColors');
            freshToggle.onclick = function() {
                colorIconsVisible = !colorIconsVisible;
                var icons = row.querySelectorAll('.pdp-color-icon-btn');
                if (colorIconsVisible) {
                    icons.forEach(function(btn, idx) {
                        setTimeout(function() { btn.classList.add('visible'); }, idx * 70);
                    });
                } else {
                    icons.forEach(function(btn) { btn.classList.remove('visible'); });
                }
            };
        } else {
            toggleBtn.style.display = 'none';
        }
    }

    // Expose for testing

    // ===== WISHLIST SECTION (grid 2-col) =====
    var wishlistConfirmCallback = null;


    function showWishlistRemoveConfirm(wIdx, onYes) {
        var popup = $('wishlistConfirmPopup');
        if (!popup) { onYes(); return; } // fallback: just remove
        popup.classList.add('show');
        var yesBtn = $('wishlistConfirmYes');
        var noBtn = $('wishlistConfirmNo');
        var backdrop = $('wishlistConfirmBackdrop');
        function close() { popup.classList.remove('show'); }
        if (noBtn) { var nn=noBtn.cloneNode(true); noBtn.parentNode.replaceChild(nn,noBtn); $('wishlistConfirmNo').onclick = close; }
        if (backdrop) { var nb=backdrop.cloneNode(true); backdrop.parentNode.replaceChild(nb,backdrop); $('wishlistConfirmBackdrop').onclick = close; }
        if (yesBtn) {
            var ny=yesBtn.cloneNode(true); yesBtn.parentNode.replaceChild(ny,yesBtn);
            $('wishlistConfirmYes').onclick = function() { close(); onYes(); };
        }
    }

    function showWishlistSection() {
        hideAllSections();
        currentSection = 'wishlist';
        pushHistory('wishlist', showWishlistSection);

        // Create or show wishlist section
        var section = $('wishlistSection');
        if (!section) {
            section = document.createElement('section');
            section.id = 'wishlistSection';
            section.className = 'wishlist-section';
            section.style.cssText = 'position:fixed;inset:0;z-index:9000;background:#fff;overflow-y:auto;-webkit-overflow-scrolling:touch;';

            // Header
            var hdr = document.createElement('div');
            hdr.className = 'basket-header-bar';
            hdr.id = 'wishlistHeaderBar';
            hdr.style.cssText = 'position:fixed;top:0;left:0;right:0;height:var(--header-h);background:transparent;z-index:100;pointer-events:auto;';
            hdr.innerHTML = '<div class="basket-header-inner"><div class="basket-header-left"><button class="basket-close-x" id="wishlistClose"><svg width="22" height="22" stroke="currentColor" stroke-width="1.5"><line x1="4" y1="4" x2="18" y2="18"/><line x1="18" y1="4" x2="4" y2="18"/></svg></button><span class="basket-brand-text">ESCALIER</span></div><div class="basket-header-icons"><button class="basket-tab-icon active pdp-icon-wrap" id="wishlistTabIcon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span class="pdp-icon-qty" id="wishlistSectionCount"></span></button></div></div>';
            section.appendChild(hdr);

            // Grid container
            var grid = document.createElement('div');
            grid.className = 'wishlist-grid';
            grid.id = 'wishlistGrid';
            section.appendChild(grid);

            document.body.appendChild(section);
        }

        section.style.display = 'block';
        document.body.style.overflow = 'hidden';
        renderWishlistGrid();

        // Close btn
        var closeBtn = $('wishlistClose');
        if (closeBtn) {
            var newClose = closeBtn.cloneNode(true);
            closeBtn.parentNode.replaceChild(newClose, closeBtn);
            var prevWlRestore = navHistory.length > 1 ? navHistory[navHistory.length - 2].restore : null;
            $('wishlistClose').onclick = function() {
                section.style.display = 'none';
                document.body.style.overflow = '';
                navigateBack();
            };
        }

        // Wishlist icon in header → same page (noop)
        var wishlistTab = $('wishlistTabIcon');
        if (wishlistTab) wishlistTab.onclick = function() {};

    }

    function renderWishlistGrid() {
        var grid = $('wishlistGrid');
        if (!grid) return;
        var countEl = $('wishlistSectionCount');

        if (wishlist.length === 0) {
            grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:80px 20px;color:#ccc;"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1" style="margin:0 auto 16px;display:block;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><p style="font-size:13px;color:#999;">No favorites yet</p></div>';
            if (countEl) countEl.textContent = '';
            return;
        }
        if (countEl) { countEl.textContent = wishlist.length; countEl.classList.add('show'); }

        var allProds = products.concat(menProducts);
        var html = '';
        // Group wishlist by productId to avoid duplicates in display
        var uniqueWishlist = [];
        var seenProductIds = [];
        var originalIndices = [];
        wishlist.forEach(function(w, idx) {
            if (seenProductIds.indexOf(w.productId) === -1) {
                seenProductIds.push(w.productId);
                uniqueWishlist.push(w);
                originalIndices.push(idx);
            }
        });
        uniqueWishlist.forEach(function(w, wIdx) {
            var origIdx = originalIndices[wIdx];
            var item = allProds.find(function(p) { return p.id === w.productId; });
            var img = w.img || (item ? P.colorThumb(item, w.colorIdx || 0) : '');
            var name = w.name || (item ? item.name : '');
            var price = item ? fmt(item.price) : '';
            var heartSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="#1a1a1a" stroke="#1a1a1a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
            html += '<div class="wishlist-grid-item" data-widx="' + origIdx + '" data-prodid="' + (item ? item.id : '') + '">';
            html += '<div class="wishlist-grid-photo">';
            html += '<img src="' + img + '" alt="' + name + '" class="wishlist-grid-img" data-widx="' + origIdx + '">';
            html += '<button class="wishlist-heart-btn" data-widx="' + origIdx + '">' + heartSvg + '</button>';
            html += '</div>';
            html += '<p class="wishlist-grid-name">' + name + '</p>';
            html += '<p class="wishlist-grid-price">' + price + '</p>';
            html += '</div>';
        });
        grid.innerHTML = html;

        // Heart btn → confirm remove
        grid.querySelectorAll('.wishlist-heart-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var wIdx = parseInt(this.dataset.widx);
                showWishlistConfirm(wIdx);
            });
        });

        // Photo click → open PDP
        grid.querySelectorAll('.wishlist-grid-img, .wishlist-grid-photo').forEach(function(el) {
            el.style.cursor = 'pointer';
            el.addEventListener('click', function(e) {
                if(e.target.closest('.wishlist-heart-btn')) return; // don't trigger on heart
                var item_el = this.closest('.wishlist-grid-item');
                if(!item_el) return;
                var wIdx = parseInt(item_el.dataset.widx || this.dataset.widx || 0);
                var w = wishlist[wIdx];
                if(!w) return;
                var allProds2 = products.concat(menProducts);
                var item = allProds2.find(function(p) { return p.id === w.productId; });
                if (item) {
                    var section = $('wishlistSection');
                    if (section) section.style.display = 'none';
                    document.body.style.overflow = '';
                    openProductDetail(item);
                }
            });
        });
    }

    function showWishlistConfirm(wIdx) {
        var popup = $('wishlistConfirmPopup');
        if (!popup) return;
        popup.classList.add('show');

        var yesBtn = $('wishlistConfirmYes');
        var noBtn = $('wishlistConfirmNo');
        var backdrop = $('wishlistConfirmBackdrop');

        function close() { popup.classList.remove('show'); }

        if (noBtn) { var newNo = noBtn.cloneNode(true); noBtn.parentNode.replaceChild(newNo, noBtn); $('wishlistConfirmNo').onclick = close; }
        if (backdrop) { var newBd = backdrop.cloneNode(true); backdrop.parentNode.replaceChild(newBd, backdrop); $('wishlistConfirmBackdrop').onclick = close; }
        if (yesBtn) {
            var newYes = yesBtn.cloneNode(true);
            yesBtn.parentNode.replaceChild(newYes, yesBtn);
            var capturedIdx = wIdx;
            $('wishlistConfirmYes').onclick = function() {
                if(capturedIdx >= 0 && capturedIdx < wishlist.length) {
                    wishlist.splice(capturedIdx, 1);
                    localStorage.setItem('escalier_wishlist', JSON.stringify(wishlist));
                    updateWishlistBadge();
                }
                close();
                renderWishlistGrid();
            };
        }
    }

    function showBasketWishlistToast() {
        var toast = $('basketWishlistToast');
        if (!toast) return;
        toast.style.display = 'block';
        toast.classList.add('show');
        setTimeout(function() {
            toast.classList.remove('show');
            setTimeout(function() { toast.style.display = 'none'; }, 300);
        }, 2000);
    }


    // ===== BASKET BODY SWAP (poin 5) =====
    function renderBasketBody(mode) {
        var content = $('basketPageContent');
        if (!content) return;

        if (mode === 'basket') {
            renderBasketPage(); // existing function renders cart items
        } else if (mode === 'wish') {
            renderWishlistInBasket();
        }
    }

    function renderWishlistInBasket() {
        var itemsContainer = $('basketPageItems');
        if (!itemsContainer) return;

        // Hide footer in wish tab
        var footer = $('basketPageFooter');
        if (footer) { footer.style.setProperty('display', 'none', 'important'); }

        if (wishlist.length === 0) {
            itemsContainer.innerHTML = '<div style="text-align:center;padding:80px 20px;color:#ccc;"><svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1" style="margin:0 auto 16px;display:block;"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><p style="font-size:12px;color:#999;font-family:Montserrat,sans-serif;">No favorites yet</p></div>';
            return;
        }

        var allProds = products.concat(menProducts);
        // Group wishlist by productId to avoid duplicates in display
        var uniqueWishlist = [];
        var seenProductIds = [];
        var originalIndices = [];
        wishlist.forEach(function(w, idx) {
            if (seenProductIds.indexOf(w.productId) === -1) {
                seenProductIds.push(w.productId);
                uniqueWishlist.push(w);
                originalIndices.push(idx);
            }
        });
        var html = '<div class="wl-grid">';
        uniqueWishlist.forEach(function(w, wIdx) {
            var origIdx = originalIndices[wIdx];
            var item = allProds.find(function(p) { return p.id === w.productId; });
            var img = w.img || (item ? P.colorThumb(item, w.colorIdx||0) : '');
            var name = w.name || (item ? item.name : 'Product');
            var price = item ? fmt(item.price) : '';
            var heartSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="#1a1a1a" stroke="#1a1a1a" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>';
            html += '<div class="wl-grid-item" data-widx="' + origIdx + '" data-prodid="' + (item ? item.id : '') + '">';
            html += '<div class="wl-grid-photo">';
            html += '<img src="' + img + '" alt="' + name + '" class="wl-grid-img" data-widx="' + origIdx + '">';
            html += '<button class="wl-heart-btn" data-widx="' + origIdx + '">' + heartSvg + '</button>';
            html += '</div>';
            html += '<p class="wl-grid-name">' + name + '</p>';
            html += '<p class="wl-grid-price">' + price + '</p>';
            html += '</div>';
        });
        html += '</div>';
        itemsContainer.innerHTML = html;

        // Photo click → open PDP
        itemsContainer.querySelectorAll('.wl-grid-img').forEach(function(img) {
            img.addEventListener('click', function() {
                var wIdx = parseInt(this.dataset.widx);
                var w = wishlist[wIdx];
                if (!w) return;
                var allP = products.concat(menProducts);
                var item = allP.find(function(p) { return p.id === w.productId; });
                if (item) {
                    var bp = $('basketPage');
                    if (bp) bp.style.display = 'none';
                    document.body.style.overflow = '';
                    openProductDetail(item);
                }
            });
        });

        // Heart btn → confirm remove
        itemsContainer.querySelectorAll('.wl-heart-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                var wIdx = parseInt(this.dataset.widx);
                showWishlistRemoveConfirm(wIdx, function() {
                    wishlist.splice(wIdx, 1);
                    localStorage.setItem('escalier_wishlist', JSON.stringify(wishlist));
                    updateWishlistBadge();
                    renderWishlistInBasket();
                });
            });
        });
    }

    window.__openPDP = openProductDetail;
    window.__products = products;
    window.__menProducts = menProducts;
    window.__addWishlist = function(item) { wishlist.push(item); };
    window.__showWishlistSection = showWishlistSection;
    window.__showBasketPage = showBasketPage;
    // Expose for testing (direct references)
    // Expose getter/setter helpers for testability and cross-scope access
    window.__getCart = function() { return cart; };
    window.__getWishlist = function() { return wishlist; };
    window.__pushCart = function(item) { cart.push(item); updateCartBadge(); };
    window.__pushWishlist = function(item) { wishlist.push(item); updateWishlistBadge(); };
    window.__clearCart = function() { cart.length = 0; updateCartBadge(); };
    window.__clearWishlist = function() { wishlist.length = 0; updateWishlistBadge(); };
    window.__setCart = function(items) { cart.length = 0; items.forEach(function(i){cart.push(i);}); updateCartBadge(); };
    window.__setWishlist = function(items) { wishlist.length = 0; items.forEach(function(i){wishlist.push(i);}); updateWishlistBadge(); };
    // Direct function exposure
    window.showNewItemsGrid = showNewItemsGrid;
    window.showCollectionGrid = showCollectionGrid;
    window.showClothingSection = showClothingSection;
    window.showBasketPage = showBasketPage;
    window.showWishlistSection = showWishlistSection;
    window.renderWishlistGrid = renderWishlistGrid;
    window.renderBasketPage = renderBasketPage;
    window.updateCartBadge = updateCartBadge;
    window.updateWishlistBadge = updateWishlistBadge;
    window.openProductDetail = openProductDetail;
    // Proxy objects that always reference internal arrays
    Object.defineProperty(window, 'cart', { get: function(){ return cart; }, set: function(v){ cart.length=0; v.forEach(function(i){cart.push(i);}); updateCartBadge(); } });
    Object.defineProperty(window, 'wishlist', { get: function(){ return wishlist; }, set: function(v){ wishlist.length=0; v.forEach(function(i){wishlist.push(i);}); updateWishlistBadge(); } });
    Object.defineProperty(window, 'basketActiveTab', { get: function(){ return basketActiveTab; }, set: function(v){ basketActiveTab=v; } });


    // ===== BOUTIQUE STORE GALLERY =====
    var boutiqueSlides = document.querySelectorAll('.boutique-slide');
    var boutiqueDots = document.querySelectorAll('.boutique-dot');
    var boutiquePlayBtn = document.getElementById('boutiquePlayBtn');
    var currentBoutiqueSlide = 0;
    var boutiqueInterval = null;
    var isBoutiquePlaying = true;

    function setBoutiqueSlide(idx) {
        currentBoutiqueSlide = idx;
        boutiqueSlides.forEach(function(s, i) { s.classList.toggle('active', i === idx); });
        boutiqueDots.forEach(function(d, i) { d.classList.toggle('active', i === idx); });
    }

    boutiqueDots.forEach(function(dot) {
        dot.addEventListener('click', function() {
            setBoutiqueSlide(parseInt(this.dataset.bslide));
            if (isBoutiquePlaying) resetBoutiqueInterval();
        });
    });

    // Play/Pause button
    if (boutiquePlayBtn) {
        boutiquePlayBtn.addEventListener('click', function() {
            var icon = boutiquePlayBtn.querySelector('i');
            if (isBoutiquePlaying) {
                // Pause
                if (boutiqueInterval) clearInterval(boutiqueInterval);
                isBoutiquePlaying = false;
                if (icon) icon.className = 'fas fa-play';
                boutiquePlayBtn.classList.add('paused');
            } else {
                // Play
                setBoutiqueSlide((currentBoutiqueSlide + 1) % boutiqueSlides.length);
                startBoutiqueInterval();
                isBoutiquePlaying = true;
                if (icon) icon.className = 'fas fa-pause';
                boutiquePlayBtn.classList.remove('paused');
            }
        });
    }

    function nextBoutiqueSlide() {
        setBoutiqueSlide((currentBoutiqueSlide + 1) % boutiqueSlides.length);
    }

    function startBoutiqueInterval() {
        boutiqueInterval = setInterval(nextBoutiqueSlide, 4000);
    }

    function resetBoutiqueInterval() {
        if (boutiqueInterval) clearInterval(boutiqueInterval);
        startBoutiqueInterval();
    }

    // CTA scroll to Store Tour
    var boutiqueCta = document.getElementById('boutiqueCta');
    if (boutiqueCta) {
        boutiqueCta.addEventListener('click', function() {
            var storeTour = document.getElementById('storeTour');
            if (storeTour) {
                storeTour.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    }

    if (boutiqueSlides.length > 0) {
        startBoutiqueInterval();
    }

    // ===== DNA CAROUSEL (Screen 3) — infinite autoplay + NEXT btn + slide number =====
    (function() {
        var track    = document.getElementById('dnaCarouselTrack');
        var dots     = document.querySelectorAll('.dna-dot');
        var nextBtn  = null; // back button now handled by dnaXBtn
        var prevBtn  = document.getElementById('dnaPrevBtn');   // scroll-down
        var capTitle = document.getElementById('dnaCapTitle');
        var capDesc  = document.getElementById('dnaCapDesc');
        var slideNum = document.getElementById('dnaSlideNum');
        if (!track) return;

        var dnaData = [
            {
                num:   '01',
                title: 'ROYAL<br>KOREAN CHIC',
                desc:  'Royal Korean Chic is the soul of<br>ESCALIER\u2014calm elegance,<br>mindful design, and understated<br>beauty that transcends seasons.'
            },
            {
                num:   '02',
                title: 'MODERN<br>GLOBAL',
                desc:  'Modern Global introduces clarity<br>and precision — architectural<br>refinement drawn from<br>international design culture.'
            },
            {
                num:   '03',
                title: 'EFFORTLESS<br>LIFESTYLE',
                desc:  'Effortless Lifestyle complements<br>our refined aesthetic — clothing<br>designed to move naturally<br>with everyday life.'
            }
        ];

        var current = 0;
        var total   = dnaData.length;
        var autoTimer = null;
        var isPlaying = false;
        var startX = 0;
        var isDragging = false;

        var _gifTimer = null;
        var slides = document.querySelectorAll('#dnaCarouselTrack .dna-slide');

        function goTo(idx) {
            current = ((idx % total) + total) % total;
            track.style.transform = 'translateX(-' + (current * 33.3333) + '%)';
            dots.forEach(function(d, i) { d.classList.toggle('active', i === current); });
            if (slideNum) slideNum.textContent = dnaData[current].num;
            if (capTitle) capTitle.innerHTML   = dnaData[current].title;
            if (capDesc)  capDesc.innerHTML   = dnaData[current].desc;
            // Reset all GIFs
            clearTimeout(_gifTimer);
            slides.forEach(function(s) { s.classList.remove('gif-active'); });
            // Activate GIF after 2 seconds on active slide
            var activeSlide = slides[current];
            if (activeSlide) {
                _gifTimer = setTimeout(function() {
                    activeSlide.classList.add('gif-active');
                }, 2000);
            }
        }

        function startAuto() {
            if (isPlaying) return;
            isPlaying = true;
            autoTimer = setInterval(function() { goTo(current + 1); }, 4000);
        }
        function stopAuto() {
            if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
            isPlaying = false;
        }

        // DNA Play/Pause button (for manual mode)
        var dnaPlayPauseBtn = document.getElementById('dnaPlayPauseBtn');
        if (dnaPlayPauseBtn) {
            dnaPlayPauseBtn.addEventListener('click', function() {
                var pi = dnaPlayPauseBtn.querySelector('.dna-pause-icon');
                var pl = dnaPlayPauseBtn.querySelector('.dna-play-icon');
                if (isPlaying) {
                    stopAuto();
                    if (pi) pi.style.display = 'none';
                    if (pl) pl.style.display = 'block';
                } else {
                    startAuto();
                    if (pi) pi.style.display = 'block';
                    if (pl) pl.style.display = 'none';
                }
            });
        }

        // Dot clicks
        dots.forEach(function(dot) {
            dot.addEventListener('click', function() {
                stopAuto();
                goTo(parseInt(dot.getAttribute('data-slide')));
            });
        });

        // Scroll-down → Screen 6 (Our Style Collection)
        if (prevBtn) {
            prevBtn.addEventListener('click', function() {
                var aboutEl = document.getElementById('about');
                if (aboutEl) {
                    var h = aboutEl.clientHeight || window.innerHeight;
                    aboutEl.style.scrollSnapType = 'none';
                    aboutEl.style.overflow = 'hidden';
                    aboutEl.scrollTop = h * 6;
                    setTimeout(function() {
                        aboutEl.style.overflow = '';
                        aboutEl.style.scrollSnapType = '';
                    }, 100);
                }
            });
        }

        // BACK btn → scroll to connector screen (index 4)
        if (nextBtn) {
            nextBtn.addEventListener('click', function() {
                var aboutEl = document.getElementById('about');
                if (aboutEl) {
                    aboutEl.style.scrollSnapType = 'none';
                    aboutEl.style.overflow = 'hidden';
                    aboutEl.scrollTop = (aboutEl.clientHeight || window.innerHeight) * 4;
                    setTimeout(function() {
                        aboutEl.style.overflow = '';
                        aboutEl.style.scrollSnapType = '';
                    }, 100);
                }
            });
        }

        // Touch swipe
        var wrap = document.getElementById('dnaCarouselWrap');
        if (wrap) {
            var swipeStartY = 0;
            wrap.addEventListener('touchstart', function(e) {
                if (e.touches.length === 1) {
                    startX = e.touches[0].clientX;
                    swipeStartY = e.touches[0].clientY;
                    isDragging = true;
                } else {
                    isDragging = false; // pinch in progress — don't swipe
                }
            }, { passive: true });
            wrap.addEventListener('touchend', function(e) {
                if (!isDragging) return;
                var diffX = startX - e.changedTouches[0].clientX;
                var diffY = swipeStartY - e.changedTouches[0].clientY;
                // Only trigger slide if horizontal swipe dominant
                if (Math.abs(diffX) > 40 && Math.abs(diffX) > Math.abs(diffY) * 1.2) {
                    stopAuto();
                    goTo(diffX > 0 ? current + 1 : current - 1);
                }
                isDragging = false;
            }, { passive: true });
        }

        // Init
        goTo(0);
        startAuto();

        // Expose API
        window._dnaCarousel = {
            goTo: function(idx) { goTo(idx); },
            startAuto: startAuto,
            stopAuto: stopAuto,
            reset: function() { stopAuto(); goTo(0); }
        };
    })();

    // ===== SCREEN 4: Style Collection — editorial layout + fullscreen =====
    (function() {
        var heroImg    = document.getElementById('sc4HeroImg');
        var heroOverlay = document.getElementById('sc4HeroOverlay');
        var colTitle   = document.getElementById('sc4ColTitle');
        var styleName  = document.getElementById('sc4StyleName');
        var styleDesc  = document.getElementById('sc4StyleDesc');
        var forLabel   = document.getElementById('sc4ForLabel');
        var cardsTrack = document.getElementById('sc4CardsTrack');
        var womenBtn   = document.getElementById('sc4WomenBtn');
        var menBtn     = document.getElementById('sc4MenBtn');
        var prevBtn    = document.getElementById('sc4PrevCard');
        var nextBtn    = document.getElementById('sc4NextCard');
        var cardsWrap  = cardsTrack ? cardsTrack.parentElement : null;

        // Fullscreen elements
        var fsPanel    = document.getElementById('sc4Fullscreen');
        var fsClose    = document.getElementById('sc4FsClose');
        var fsTitle    = document.getElementById('sc4FsTitle');
        var fsDesc     = document.getElementById('sc4FsDesc');
        var fsTrack    = document.getElementById('sc4FsTrack');
        var fsPrev     = document.getElementById('sc4FsPrev');
        var fsNext     = document.getElementById('sc4FsNext');

        if (!cardsTrack) return;

        var genderData = {
            women: {
                colTitle: 'WOMEN<br>COLLECTION',
                forLabel: 'FOR WOMEN',
                items: [
                    { img: 'assets/women_office.png',    num: '01', name: 'Office Elegance',         desc: 'Timeless pieces for confident workdays.',    styleName: 'Office Elegance',         styleDesc: 'Timeless pieces for<br>confident workdays.',    fsDesc: 'Timeless pieces for confident workdays.' },
                    { img: 'assets/women_lifestyle.png', num: '02', name: 'Sophisticated Minimalism', desc: 'Clean lines, quiet details, modern ease.',    styleName: 'Sophisticated Minimalism', styleDesc: 'Clean lines, quiet details,<br>modern ease.',   fsDesc: 'Refined silhouettes for calm everyday living.' },
                    { img: 'assets/women_evening.png',   num: '03', name: 'Evening Refinement',       desc: 'Elevated looks for memorable moments.',       styleName: 'Evening Refinement',      styleDesc: 'Elevated looks for<br>memorable moments.',     fsDesc: 'Statement pieces for unforgettable evenings.' }
                ]
            },
            men: {
                colTitle: 'MEN<br>COLLECTION',
                forLabel: 'FOR MEN',
                items: [
                    { img: 'assets/men_urban.png',  num: '01', name: 'Urban Minimalism',  desc: 'Clean lines, sophisticated silhouettes.',   styleName: 'Urban Minimalism',  styleDesc: 'Clean lines,<br>sophisticated silhouettes.',  fsDesc: 'Refined urban looks for the modern man.' },
                    { img: 'assets/men_formal.png', num: '02', name: 'Modern Formals',    desc: 'Elevated workwear, contemporary details.', styleName: 'Modern Formals',    styleDesc: 'Elevated workwear,<br>contemporary details.', fsDesc: 'Precision tailoring for confident presence.' },
                    { img: 'assets/men_street.png', num: '03', name: 'Street Essentials', desc: 'Korean-inspired street fashion.',           styleName: 'Street Essentials', styleDesc: 'Korean-inspired<br>street fashion.',           fsDesc: 'Effortless style rooted in Korean culture.' }
                ]
            }
        };

        var activeGender = 'women';
        var activeCard   = 1;
        var fsCurrent    = 0;

        // ── Build fullscreen carousel slides ──
        var fsDots = document.getElementById('sc4FsDots');

        function buildFsSlides(gender, startIdx) {
            if (!fsTrack) return;
            var items = genderData[gender].items;
            fsTrack.innerHTML = '';
            if (fsDots) fsDots.innerHTML = '';

            items.forEach(function(item, i) {
                // Slide
                var slide = document.createElement('div');
                slide.className = 'sc4-fs-slide';
                var img = document.createElement('img');
                img.src = item.img;
                img.className = 'sc4-fs-slide-img';
                img.draggable = false;
                slide.appendChild(img);
                fsTrack.appendChild(slide);
                initPinchZoom(img);

                // Dot
                if (fsDots) {
                    var dot = document.createElement('button');
                    dot.className = 'sc4-fs-dot' + (i === (startIdx||0) ? ' active' : '');
                    dot.addEventListener('click', function() { fsGoTo(i); });
                    fsDots.appendChild(dot);
                }
            });

            fsCurrent = startIdx || 0;
            fsTrack.style.transition = 'none';
            fsTrack.style.transform = 'translateX(-' + (fsCurrent * 100) + 'vw)';
            updateFsCaption(items[fsCurrent]);
            // Start auto carousel
            setTimeout(fsStartAuto, 500);
        }

        function updateFsCaption(item) {
            if (fsTitle) fsTitle.innerHTML = item.styleName;
            if (fsDesc)  fsDesc.textContent = item.fsDesc;
        }

        function fsGoTo(idx) {
            var items = genderData[activeGender].items;
            fsCurrent = ((idx % items.length) + items.length) % items.length;
            fsTrack.style.transition = 'transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94)';
            fsTrack.style.transform = 'translateX(-' + (fsCurrent * 100) + 'vw)';
            updateFsCaption(items[fsCurrent]);
            // Sync dots
            if (fsDots) {
                fsDots.querySelectorAll('.sc4-fs-dot').forEach(function(d, i) {
                    d.classList.toggle('active', i === fsCurrent);
                });
            }
            // Sync main hero + active card
            selectCard(fsCurrent);
        }

        // ── Pinch zoom per slide (no stopPropagation on single touch) ──
        // Shared pinch flag for swipe handler
        var _fsPinching = false;

        function initPinchZoom(img) {
            var scale = 1, startDist = 0, startScale = 1;
            var panX = 0, panY = 0;
            var lastTouchX = 0, lastTouchY = 0;

            function applyTransform() {
                img.style.transform = 'scale(' + scale + ') translate(' + panX + 'px,' + panY + 'px)';
            }

            img.parentElement.addEventListener('touchstart', function(e) {
                if (e.touches.length === 2) {
                    _fsPinching = true;
                    startDist = Math.hypot(
                        e.touches[0].clientX - e.touches[1].clientX,
                        e.touches[0].clientY - e.touches[1].clientY);
                    startScale = scale;
                } else if (e.touches.length === 1 && scale > 1) {
                    lastTouchX = e.touches[0].clientX;
                    lastTouchY = e.touches[0].clientY;
                }
            }, { passive: true });

            img.parentElement.addEventListener('touchmove', function(e) {
                if (e.touches.length === 2 && _fsPinching) {
                    e.preventDefault();
                    var dist = Math.hypot(
                        e.touches[0].clientX - e.touches[1].clientX,
                        e.touches[0].clientY - e.touches[1].clientY);
                    scale = Math.min(4, Math.max(1, startScale * (dist / startDist)));
                    applyTransform();
                } else if (e.touches.length === 1 && scale > 1) {
                    // Pan while zoomed — stop propagation to prevent slide change
                    e.stopPropagation();
                    panX += (e.touches[0].clientX - lastTouchX) / scale;
                    panY += (e.touches[0].clientY - lastTouchY) / scale;
                    lastTouchX = e.touches[0].clientX;
                    lastTouchY = e.touches[0].clientY;
                    applyTransform();
                }
            }, { passive: false });

            img.parentElement.addEventListener('touchend', function() {
                if (_fsPinching) {
                    setTimeout(function() { _fsPinching = false; }, 80);
                    if (scale < 1.05) { scale = 1; panX = 0; panY = 0; applyTransform(); }
                }
            }, { passive: true });
        }

        // ── Fullscreen open/close ──
        function openFullscreen(gender, idx) {
            if (!fsPanel) return;
            activeGender = gender;
            buildFsSlides(gender, idx);
            fsPanel.classList.add('open');
            document.body.classList.add('sc4-fs-open');
            // Update gender labels
            var fsGender = document.getElementById('sc4FsGender');
            var fsLabel  = document.getElementById('sc4FsLabel');
            if (fsGender) fsGender.textContent = (gender === 'women' ? 'WOMEN' : 'MEN') + ' COLLECTION';
            if (fsLabel)  fsLabel.innerHTML  = 'OUR ' + (gender === 'women' ? 'WOMEN' : 'MEN') + '<br>STYLE COLLECTION';
        }

        function closeFullscreen() {
            if (!fsPanel) return;
            fsStopAuto();
            fsPanel.classList.remove('open');
            document.body.classList.remove('sc4-fs-open');
            if (fsTrack) {
                fsTrack.querySelectorAll('.sc4-fs-slide-img').forEach(function(img) {
                    img.style.transform = '';
                });
            }
        }

        if (fsClose) {
            fsClose.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                closeFullscreen();
            });
            fsClose.addEventListener('touchend', function(e) {
                e.stopPropagation();
                e.preventDefault();
                closeFullscreen();
            });
        }

        // FS prev/next
        if (fsPrev) fsPrev.addEventListener('click', function() { fsGoTo(fsCurrent - 1); });
        if (fsNext) fsNext.addEventListener('click', function() { fsGoTo(fsCurrent + 1); });

        // ── Fullscreen auto carousel ──
        var fsAutoTimer = null;
        var fsAutoPlaying = false;

        function fsStartAuto() {
            if (fsAutoTimer) clearInterval(fsAutoTimer);
            fsAutoPlaying = true;
            fsAutoTimer = setInterval(function() { fsGoTo(fsCurrent + 1); }, 3000);
            var ppBtn = document.getElementById('sc4FsPPBtn');
            if (ppBtn) {
                var pi = ppBtn.querySelector('.sc4-fs-pause-icon');
                var pl = ppBtn.querySelector('.sc4-fs-play-icon');
                if (pi) pi.style.display = 'block';
                if (pl) pl.style.display = 'none';
            }
        }
        function fsStopAuto() {
            if (fsAutoTimer) { clearInterval(fsAutoTimer); fsAutoTimer = null; }
            fsAutoPlaying = false;
            var ppBtn = document.getElementById('sc4FsPPBtn');
            if (ppBtn) {
                var pi = ppBtn.querySelector('.sc4-fs-pause-icon');
                var pl = ppBtn.querySelector('.sc4-fs-play-icon');
                if (pi) pi.style.display = 'none';
                if (pl) pl.style.display = 'block';
            }
        }

        var ppBtn = document.getElementById('sc4FsPPBtn');
        if (ppBtn) {
            ppBtn.addEventListener('click', function() {
                if (fsAutoPlaying) fsStopAuto(); else fsStartAuto();
            });
        }

        // Stop auto on manual swipe
        var fsSwipeStartX = 0, fsSwipeStartY = 0;
        var fsCarouselEl = document.getElementById('sc4FsCarousel');
        if (fsCarouselEl) {
            fsCarouselEl.addEventListener('touchstart', function(e) {
                if (e.touches.length === 1) {
                    fsSwipeStartX = e.touches[0].clientX;
                    fsSwipeStartY = e.touches[0].clientY;
                }
            }, { passive: true });
            fsCarouselEl.addEventListener('touchend', function(e) {
                if (_fsPinching) return;
                var diffX = fsSwipeStartX - e.changedTouches[0].clientX;
                var diffY = fsSwipeStartY - e.changedTouches[0].clientY;
                // Check current slide zoom state
                var curSlide = fsTrack ? fsTrack.children[fsCurrent] : null;
                var curImg = curSlide ? curSlide.querySelector('.sc4-fs-slide-img') : null;
                if (curImg && curImg.style.transform && curImg.style.transform !== '') return;
                // Horizontal dominant swipe
                if (Math.abs(diffX) > 45 && Math.abs(diffX) > Math.abs(diffY) * 1.3) {
                    fsStopAuto();
                    fsGoTo(diffX > 0 ? fsCurrent + 1 : fsCurrent - 1);
                }
            }, { passive: true });
        }

        // ── Build cards ──
        function buildCards(gender) {
            cardsTrack.innerHTML = '';
            genderData[gender].items.forEach(function(item, i) {
                var card = document.createElement('div');
                card.className = 'sc4-card' + (i === activeCard ? ' active' : '');
                card.innerHTML =
                    '<img src="' + item.img + '" alt="' + item.name + '" class="sc4-card-img">' +
                    '<div class="sc4-card-body">' +
                        '<p class="sc4-card-num">' + item.num + '</p>' +
                        '<div class="sc4-card-name-row">' +
                            '<span class="sc4-card-name">' + item.name + '</span>' +
                            '<span class="sc4-card-arrow">→</span>' +
                        '</div>' +
                        '<p class="sc4-card-desc">' + item.desc + '</p>' +
                    '</div>';
                // Click card → update hero + open fullscreen
                card.addEventListener('click', function() {
                    selectCard(i);
                    openFullscreen(activeGender, i);
                });
                cardsTrack.appendChild(card);
            });
        }

        // ── Select card ──
        function selectCard(idx) {
            var data = genderData[activeGender];
            activeCard = idx;
            var item = data.items[idx];

            // Fade hero image
            if (heroImg) {
                heroImg.style.opacity = '0';
                setTimeout(function() { heroImg.src = item.img; heroImg.style.opacity = '1'; }, 250);
            }
            if (styleName) styleName.innerHTML  = item.styleName;
            if (styleDesc) styleDesc.innerHTML  = item.styleDesc;

            // Update active card
            var cards = cardsTrack.querySelectorAll('.sc4-card');
            cards.forEach(function(c, i) { c.classList.toggle('active', i === idx); });

            // Scroll card into view
            if (cards[idx] && cardsWrap) {
                var cardLeft = cards[idx].offsetLeft - 20;
                cardsWrap.scrollTo({ left: cardLeft, behavior: 'smooth' });
            }
        }

        // ── Switch gender ──
        function switchGender(gender) {
            activeGender = gender;
            activeCard   = 1;
            var data = genderData[gender];

            if (womenBtn) womenBtn.classList.toggle('active', gender === 'women');
            if (menBtn)   menBtn.classList.toggle('active', gender === 'men');
            if (colTitle)  colTitle.innerHTML   = data.colTitle;
            if (forLabel)  forLabel.textContent = data.forLabel;

            // Update top label
            var gLabel = document.getElementById('sc4GenderLabel');
            if (gLabel) gLabel.textContent = gender === 'women' ? 'WOMEN' : 'MEN';

            var item = data.items[activeCard];
            if (heroImg) {
                heroImg.style.opacity = '0';
                setTimeout(function() { heroImg.src = item.img; heroImg.style.opacity = '1'; }, 250);
            }
            if (styleName) styleName.innerHTML = item.styleName;
            if (styleDesc) styleDesc.innerHTML = item.styleDesc;
            buildCards(gender);
        }

        // Gender btns — touchend to prevent snap scroll conflict
        function addSafeClick(btn, fn) {
            if (!btn) return;
            var tStart = 0, tStartX = 0, tStartY = 0;
            btn.addEventListener('touchstart', function(e) {
                tStart = Date.now();
                tStartX = e.touches[0].clientX;
                tStartY = e.touches[0].clientY;
                e.stopPropagation();
            }, { passive: true });
            btn.addEventListener('touchend', function(e) {
                e.stopPropagation();
                var dx = Math.abs(e.changedTouches[0].clientX - tStartX);
                var dy = Math.abs(e.changedTouches[0].clientY - tStartY);
                if (dx < 8 && dy < 8 && Date.now() - tStart < 300) fn();
            }, { passive: true });
            btn.addEventListener('click', function(e) { e.stopPropagation(); fn(); });
        }
        addSafeClick(womenBtn, function() { switchGender('women'); });
        addSafeClick(menBtn,   function() { switchGender('men'); });

        // Hero tap → fullscreen (safe, no snap conflict)
        function heroTapHandler(el) {
            if (!el) return;
            var tx = 0, ty = 0, ts = 0;
            el.addEventListener('touchstart', function(e) {
                tx = e.touches[0].clientX; ty = e.touches[0].clientY; ts = Date.now();
                e.stopPropagation();
            }, { passive: true });
            el.addEventListener('touchend', function(e) {
                e.stopPropagation();
                var dx = Math.abs(e.changedTouches[0].clientX - tx);
                var dy = Math.abs(e.changedTouches[0].clientY - ty);
                if (dx < 10 && dy < 10 && Date.now() - ts < 300) openFullscreen(activeGender, activeCard);
            }, { passive: true });
        }
        heroTapHandler(document.getElementById('sc4HeroImg'));
        heroTapHandler(document.getElementById('sc4HeroOverlay'));
        heroTapHandler(document.getElementById('sc4HeroClickZone'));

        // Prev/Next arrows
        if (prevBtn) prevBtn.addEventListener('click', function() {
            var total = genderData[activeGender].items.length;
            selectCard((activeCard - 1 + total) % total);
        });
        if (nextBtn) nextBtn.addEventListener('click', function() {
            var total = genderData[activeGender].items.length;
            selectCard((activeCard + 1) % total);
        });

        // Touch swipe cards
        var startX = 0;
        if (cardsWrap) {
            cardsWrap.addEventListener('touchstart', function(e) { startX = e.touches[0].clientX; }, { passive: true });
            cardsWrap.addEventListener('touchend', function(e) {
                var diff = startX - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 40) {
                    var total = genderData[activeGender].items.length;
                    selectCard(diff > 0 ? (activeCard+1)%total : (activeCard-1+total)%total);
                }
            }, { passive: true });
        }

        // Expose API
        // SC4 auto carousel
        var sc4AutoTimer = null;
        var sc4AutoPlaying = false;
        var sc4AutoIdx = 0;
        var sc4AutoGenders = ['women', 'women', 'women', 'men', 'men', 'men'];
        var sc4AutoCards  = [0, 1, 2, 0, 1, 2];

        function sc4StartAuto() {
            if (sc4AutoTimer) clearInterval(sc4AutoTimer);
            sc4AutoPlaying = true;
            var ppBtn = document.getElementById('sc4PlayPauseBtn');
            if (ppBtn) {
                var pi = ppBtn.querySelector('.sc4-pause-icon');
                var pl = ppBtn.querySelector('.sc4-play-icon');
                if (pi) pi.style.display = 'block';
                if (pl) pl.style.display = 'none';
            }
            sc4AutoTimer = setInterval(function() {
                sc4AutoIdx = (sc4AutoIdx + 1) % sc4AutoGenders.length;
                var g = sc4AutoGenders[sc4AutoIdx];
                var c = sc4AutoCards[sc4AutoIdx];
                if (activeGender !== g) switchGender(g);
                selectCard(c);
            }, 3000);
        }

        function sc4StopAuto() {
            if (sc4AutoTimer) { clearInterval(sc4AutoTimer); sc4AutoTimer = null; }
            sc4AutoPlaying = false;
            var ppBtn = document.getElementById('sc4PlayPauseBtn');
            if (ppBtn) {
                var pi = ppBtn.querySelector('.sc4-pause-icon');
                var pl = ppBtn.querySelector('.sc4-play-icon');
                if (pi) pi.style.display = 'none';
                if (pl) pl.style.display = 'block';
            }
        }

        // Wire sc4 play/pause button
        var sc4PPBtn = document.getElementById('sc4PlayPauseBtn');
        if (sc4PPBtn) {
            sc4PPBtn.addEventListener('click', function() {
                if (sc4AutoPlaying) sc4StopAuto(); else sc4StartAuto();
            });
        }
        // Stop auto when user taps gender or card
        ['sc4WomenBtn','sc4MenBtn'].forEach(function(id) {
            var b = document.getElementById(id);
            if (b) b.addEventListener('touchend', sc4StopAuto, { passive: true });
        });

        window._colCarousel = {
            switchGender: switchGender,
            selectCard:   selectCard,
            goTo:         selectCard,
            stopAuto:     sc4StopAuto,
            startAuto:    sc4StartAuto,
            reset:        function() { sc4StopAuto(); switchGender('women'); }
        };

        // Auto-start carousel by default
        sc4StartAuto();

        // Init
        switchGender('women');
    })();


    // ===== SCREEN 2B: Connector =====
    (function() {
        // Videos play only when user scrolls to connector screen
        var connVideo = document.getElementById('connBgVideo1');
        var connVideo2 = document.getElementById('connBgVideo2');

        var aboutEl   = document.getElementById('about');
        var cards     = document.querySelectorAll('#expScreen2b .conn-dna-card');
        var track     = document.getElementById('connCardsTrack');
        var ppBtn     = document.getElementById('connPPBtn');
        var scrollWrap = document.getElementById('connScrollWrap');
        var scrollBtn  = document.getElementById('connScrollBtn');
        var isPlaying = true;

        function goToDNA(dnaIdx) {
            document.body.classList.add('dna-section-active');
            if (scrollWrap) scrollWrap.style.display = 'none';
            if (!aboutEl) return;
            aboutEl.style.overflow = '';
            aboutEl.style.scrollSnapType = '';
            setTimeout(function() {
                var h = aboutEl.clientHeight || window.innerHeight;
                aboutEl.style.scrollSnapType = 'none';
                aboutEl.style.overflow = 'hidden';
                aboutEl.scrollTop = 5 * h;
                setTimeout(function() {
                    aboutEl.style.overflow = '';
                    aboutEl.style.scrollSnapType = '';
                    if (window._dnaCarousel) {
                        window._dnaCarousel.stopAuto();
                        window._dnaCarousel.goTo(dnaIdx);
                        setTimeout(function() { window._dnaCarousel.startAuto(); }, 200);
                    }
                }, 150);
            }, 30);
        }

        // Play/pause CSS animation
        function startAuto() {
            isPlaying = true;
            if (track) track.classList.remove('paused');
            if (ppBtn) {
                ppBtn.querySelector('.conn-pause-icon').style.display = 'block';
                ppBtn.querySelector('.conn-play-icon').style.display = 'none';
            }
        }
        function stopAuto() {
            isPlaying = false;
            if (track) track.classList.add('paused');
            if (ppBtn) {
                ppBtn.querySelector('.conn-pause-icon').style.display = 'none';
                ppBtn.querySelector('.conn-play-icon').style.display = 'block';
            }
        }

        if (ppBtn) {
            ppBtn.addEventListener('click', function(e) { e.stopPropagation(); if (isPlaying) stopAuto(); else startAuto(); });
            ppBtn.addEventListener('touchend', function(e) { e.stopPropagation(); e.preventDefault(); if (isPlaying) stopAuto(); else startAuto(); }, { passive: false });
        }

        // Card tap - use only first 3 cards (originals)
        var origCards = Array.prototype.slice.call(cards, 0, 3);
        origCards.forEach(function(card, i) {
            var tx = 0, ty = 0, ts = 0;
            card.addEventListener('touchstart', function(e) {
                tx = e.touches[0].clientX; ty = e.touches[0].clientY; ts = Date.now();
                e.stopPropagation();
            }, { passive: true });
            card.addEventListener('touchend', function(e) {
                e.stopPropagation();
                var dx = Math.abs(e.changedTouches[0].clientX - tx);
                var dy = Math.abs(e.changedTouches[0].clientY - ty);
                if (dx < 10 && dy < 10 && Date.now() - ts < 300) { stopAuto(); goToDNA(i); }
            }, { passive: true });
        });
        // Also wire duplicate cards
        var dupCards = Array.prototype.slice.call(cards, 3);
        dupCards.forEach(function(card, i) {
            var tx = 0, ty = 0, ts = 0;
            card.addEventListener('touchstart', function(e) {
                tx = e.touches[0].clientX; ty = e.touches[0].clientY; ts = Date.now();
                e.stopPropagation();
            }, { passive: true });
            card.addEventListener('touchend', function(e) {
                e.stopPropagation();
                var dx = Math.abs(e.changedTouches[0].clientX - tx);
                var dy = Math.abs(e.changedTouches[0].clientY - ty);
                if (dx < 10 && dy < 10 && Date.now() - ts < 300) { stopAuto(); goToDNA(i); }
            }, { passive: true });
        });

        if (scrollBtn) {
            scrollBtn.addEventListener('click', function() { goToDNA(0); });
            scrollBtn.addEventListener('touchend', function(e) { e.preventDefault(); goToDNA(0); }, { passive: false });
        }

        if (aboutEl && scrollWrap) {
            var cv1 = document.getElementById('connBgVideo1');
            var cv2 = document.getElementById('connBgVideo2');
            aboutEl.addEventListener('scroll', function() {
                var h = aboutEl.clientHeight || window.innerHeight;
                var idx = Math.round(aboutEl.scrollTop / h);
                scrollWrap.style.display = (idx === 4) ? 'block' : 'none';
                if (idx === 4) {
                    // Arrived at connector — reset and play
                    if (cv1) { cv1.muted = true; cv1.currentTime = 0; cv1.play().catch(function(){}); }
                    if (cv2) { cv2.muted = true; cv2.currentTime = 0; cv2.play().catch(function(){}); }
                } else {
                    // Left connector — pause
                    if (cv1 && !cv1.paused) cv1.pause();
                    if (cv2 && !cv2.paused) cv2.pause();
                }
            }, { passive: true });
        }
    })();


    function forceFullscreen() {
        var el = document.documentElement;

        // Try native Fullscreen API first (works in some browsers)
        try {
            if (el.requestFullscreen) {
                el.requestFullscreen().catch(function() {});
            } else if (el.webkitRequestFullscreen) {
                el.webkitRequestFullscreen();
            } else if (el.mozRequestFullScreen) {
                el.mozRequestFullScreen();
            }
        } catch(e) {}

        // Also fire scroll trick at multiple timings as fallback
        // (hides browser address bar on iOS Safari/Documents)
        [0, 100, 300, 600].forEach(function(delay) {
            setTimeout(function() {
                if (window.pageYOffset === 0) {
                    window.scrollTo(0, 1);
                    setTimeout(function() { window.scrollTo(0, 0); }, 20);
                }
            }, delay);
        });
    }


    // =====================================================
    // THE EXPERIENCE — MODE SELECTOR + PRESENTATION SYSTEM
    // =====================================================

    var _expTimers  = [];
    var _expPaused  = false;
    var _expMode    = null;
    var _resumeFn   = null;

    function _expClearAll() {
        _expTimers.forEach(function(t) { clearTimeout(t); clearInterval(t); });
        _expTimers = [];
        _resumeFn  = null;
        _expPaused = false;
        if (window._dnaCarousel) window._dnaCarousel.stopAuto();
    }

    function _expAfter(ms, fn) {
        var t = setTimeout(fn, ms);
        _expTimers.push(t);
        return t;
    }

    function _expScrollTo(idx) {
        var el = document.getElementById('about');
        if (!el) return;
        var h = el.clientHeight || window.innerHeight;
        el.style.scrollSnapType = 'none';
        el.style.overflow       = 'hidden';
        el.scrollTop            = Math.round(idx * h);
        setTimeout(function() {
            el.style.overflow       = '';
            el.style.scrollSnapType = '';
            // Update connector overlays when landing on connector screen
            if (idx === 4 && window._connUpdateOverlays) {
                window._connUpdateOverlays();
            }
            // Play connector videos when arriving at connector screen
            if (idx === 4) {
                var cv1 = document.getElementById('connBgVideo1');
                var cv2 = document.getElementById('connBgVideo2');
                if (cv1) { cv1.muted = true; cv1.currentTime = 0; cv1.play().catch(function(){}); }
                if (cv2) { cv2.muted = true; cv2.currentTime = 0; cv2.play().catch(function(){}); }
            }
        }, 150);
        var bar   = document.getElementById('expAutoProgressBar');
        var lbl   = document.getElementById('expAutoLabel');
        var names = ['Hero','Philosophy','Our Crest','The Brand','One Identity',
                     'Style DNA','Collection','Store','Boutique','Store Tour','Location'];
        if (bar) bar.style.width = Math.round(idx / 10 * 100) + '%';
        if (lbl) lbl.textContent = names[idx] || '';
    }

    function showExpModal() {
        var m = document.getElementById('expModeModal');
        if (!m) return;
        // Modal is position:fixed bottom:0 — always flush to screen bottom
        m.style.display = 'flex';

        // Pin hero title+subtitle so bottom of subtitle = modal top - 5mm
        // We need to know modal height first — use rAF after display:flex
        requestAnimationFrame(function() {
            var modalH = m.offsetHeight;
            var fiveMM = Math.round(5 * 3.78); // 5mm in px
            var subtitleBottom = window.innerHeight - modalH - fiveMM;

            // Move caption so subtitle bottom = subtitleBottom
            var caption = document.querySelector('#expScreen1 .exp-hero-caption');
            if (caption) {
                // caption is position:absolute top:57%
                // Instead pin it from bottom
                caption.style.top    = 'auto';
                caption.style.bottom = (modalH + fiveMM) + 'px';
            }
        });
    }
    function hideExpModal() {
        var m = document.getElementById('expModeModal');
        if (m) m.style.display = 'none';
        // Restore caption to original position
        var caption = document.querySelector('#expScreen1 .exp-hero-caption');
        if (caption) { caption.style.bottom = ''; caption.style.top = '57%'; }
    }
    function showAutoOv() {
        var o = document.getElementById('expAutoOverlay');
        if (o) o.style.display = 'block';
    }
    function hideAutoOv() {
        var o = document.getElementById('expAutoOverlay');
        if (o) o.style.display = 'none';
    }
    function setOvPaused(paused) {
        var pi = document.getElementById('expAutoPauseIcon');
        var pl = document.getElementById('expAutoPlayIcon');
        if (pi) pi.style.display = paused ? 'none' : 'block';
        if (pl) pl.style.display = paused ? 'block' : 'none';
    }
    function showComplete() {
        hideAutoOv();
        var p = document.getElementById('expCompletePanel');
        if (!p) return;
        // Position top at pano2 bottom boundary
        var pano2 = document.getElementById('expPano2Viewport');
        if (pano2) {
            var rect = pano2.getBoundingClientRect();
            p.style.top = Math.max(rect.bottom, window.innerHeight * 0.45) + 'px';
        } else {
            p.style.top = '55vh';
        }
        p.style.display = 'flex';
    }
    function hideComplete() {
        var p = document.getElementById('expCompletePanel');
        if (p) p.style.display = 'none';
    }

    // ── AUTO PRESENTATION ──
    function startExpPresentation() {
        _expClearAll();
        _expPaused = false;
        _expMode   = 'auto';
        _expAutoStartTime = Date.now(); // guard against forceFullscreen touch
        _expScrollTo(0);
        showAutoOv();
        setOvPaused(false);

        function step(ms, fn) {
            _expAfter(ms, function() {
                if (_expPaused) { _resumeFn = fn; }
                else { fn(); }
            });
        }

        var dna = window._dnaCarousel;
        var col = window._colCarousel;

        // Flat sequence: [delay, action] pairs executed one after another
        var _seq = [
            [3000, function() { _expScrollTo(1); }],
            [3000, function() { _expScrollTo(2); }],
            [3000, function() { _expScrollTo(3); }],
            [3000, function() { _expScrollTo(4); }],
            [3000, function() { _expScrollTo(5); if (dna) { dna.stopAuto(); dna.goTo(0); } }],
            [3000, function() { if (dna) dna.goTo(1); }],
            [3000, function() { if (dna) dna.goTo(2); }],
            [3000, function() { _expScrollTo(6); if (col) { col.switchGender('women'); col.goTo(0); } }],
            [3000, function() { if (col) col.goTo(1); }],
            [3000, function() { if (col) col.goTo(2); }],
            [3000, function() { if (col) { col.switchGender('men'); col.goTo(0); } }],
            [3000, function() { if (col) col.goTo(1); }],
            [3000, function() { if (col) col.goTo(2); }],
            [3000, function() { _expScrollTo(7); }],
            [4000, function() { _expScrollTo(8); }],
            [4000, function() { _expScrollTo(9); }],
            [4000, function() { _expScrollTo(10); }],
            [3000, function() { _expClearAll(); showComplete(); }]
        ];

        var _seqIdx = 0;
        function _runSeq() {
            if (_seqIdx >= _seq.length) return;
            var item = _seq[_seqIdx++];
            _expAfter(item[0], function() {
                if (_expPaused) {
                    _resumeFn = function() { item[1](); _runSeq(); };
                } else {
                    item[1]();
                    _runSeq();
                }
            });
        }
        _runSeq();

    } // end startExpPresentation

    // ── MANUAL MODE ──
    function startExpManual() {
        _expClearAll();
        _expMode = 'manual';
        hideAutoOv();
        _expScrollTo(0);
        // Start carousels — they auto-play with pause buttons available
        setTimeout(function() {
            if (window._dnaCarousel) window._dnaCarousel.startAuto();
            if (window._colCarousel) window._colCarousel.startAuto();
        }, 600);
    }

    // ── PAUSE / RESUME ──
    function pauseAuto() {
        _expPaused = true;
        setOvPaused(true);
    }
    function resumeAuto() {
        _expPaused = false;
        setOvPaused(false);
        if (_resumeFn) {
            var fn = _resumeFn;
            _resumeFn = null;
            fn();
        }
    }

    // ── Flag: modal sudah dipilih, jangan tampil lagi ──
    var _expModalShown = false;

    // ── ENTER EXPERIENCE ──
    function enterExperience() {
        _expClearAll();
        hideComplete();
        hideExpModal();
        _expModalShown = false;
        showSection('about');
        forceFullscreen();

        // Reset to hero, LOCK scroll — user can't pass screen 1
        var aboutEl = document.getElementById('about');
        if (aboutEl) {
            aboutEl.style.scrollSnapType = 'none';
            aboutEl.style.overflow = 'hidden';
            aboutEl.scrollTop = 0;
        }

        // Modal muncul HANYA saat user swipe ke bawah di hero screen
        var _touchStartY = 0;

        function _onTouchStart(e) {
            _touchStartY = e.touches[0].clientY;
        }

        function _onTouchEnd(e) {
            if (_expModalShown) return;
            var dy = _touchStartY - e.changedTouches[0].clientY;
            // dy > 15 = jari gerak ke atas = user scroll ke bawah
            if (dy > 15) {
                aboutEl.removeEventListener('touchstart', _onTouchStart);
                aboutEl.removeEventListener('touchend', _onTouchEnd);
                showExpModal();
            }
        }

        if (aboutEl) {
            aboutEl.addEventListener('touchstart', _onTouchStart, { passive: true });
            aboutEl.addEventListener('touchend', _onTouchEnd, { passive: true });
        }
    }

    // Called when user picks a mode — unlock scroll
    function _unlockExpScroll() {
        var aboutEl = document.getElementById('about');
        if (aboutEl) {
            aboutEl.style.overflow = '';
            aboutEl.style.scrollSnapType = '';
        }
        hideExpModal();
        _expModalShown = true;
    }

    // ── WIRE BUTTONS ──
    (function() {
        var btn = document.getElementById('heroVisitBtn');
        if (!btn) return;
        btn.textContent = 'THE EXPERIENCE';
        var nb = btn.cloneNode(true);
        btn.parentNode.replaceChild(nb, btn);
        nb.addEventListener('click', function(e) {
            e.preventDefault();
            enterExperience();
        });
    })();

    var _mAuto = document.getElementById('expModeAutoBtn');
    var _mMan  = document.getElementById('expModeManualBtn');
    var _mCls  = document.getElementById('expModeCloseBtn');

    if (_mAuto) _mAuto.addEventListener('click', function() {
        _unlockExpScroll();
        setTimeout(startExpPresentation, 200);
    });
    if (_mMan) _mMan.addEventListener('click', function() {
        _unlockExpScroll();
        setTimeout(startExpManual, 200);
    });
    if (_mCls) _mCls.addEventListener('click', function() {
        _unlockExpScroll();
        goHome();
    });

    var _oPause = document.getElementById('expAutoPauseBtn');
    var _oExit  = document.getElementById('expAutoExitBtn');
    if (_oPause) _oPause.addEventListener('click', function() {
        if (_expPaused) resumeAuto(); else pauseAuto();
    });
    if (_oExit) _oExit.addEventListener('click', function() {
        _expClearAll();
        hideAutoOv();
        _expMode = 'manual';
    });

    var _cHome = document.getElementById('expCompleteHomeBtn');
    var _cVisit = document.getElementById('expCompleteStayBtn');
    if (_cHome) _cHome.addEventListener('click', function() {
        hideComplete();
        goHome();
    });
    if (_cVisit) _cVisit.addEventListener('click', function() {
        hideComplete();
        // Go to location section
        pushHistory('location', function() { showSection('location'); });
        showSection('location');
    });

    // Auto mode: ONLY pause on intentional vertical swipe (not tap, not forceFullscreen)
    var _expAutoStartTime = 0;
    var _aboutTouch = document.getElementById('about');
    if (_aboutTouch) {
        var _swipeTouchY = 0;
        _aboutTouch.addEventListener('touchstart', function(e) {
            _swipeTouchY = e.touches[0].clientY;
        }, { passive: true });

        _aboutTouch.addEventListener('touchend', function(e) {
            if (_expMode !== 'auto' || _expPaused) return;
            // Ignore if < 2s after auto started
            if (Date.now() - _expAutoStartTime < 2000) return;
            // Only pause on clear vertical swipe (> 30px movement)
            var dy = Math.abs(e.changedTouches[0].clientY - _swipeTouchY);
            if (dy > 30) pauseAuto();
        }, { passive: true });
    }


})(); // IIFE end