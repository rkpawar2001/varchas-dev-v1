(function(){
  'use strict';

  /* ── mobile menu toggle ── */
  var burger = document.getElementById('burgerBtn');
  var mob    = document.getElementById('mobNav');
  function setMenu(open){
    if(mob) {
      mob.classList.toggle('show', open);
      document.body.classList.toggle('open', open);
      if(burger) burger.setAttribute('aria-expanded', String(open));
    }
  }
  if(burger) burger.addEventListener('click', function(){ setMenu(!mob.classList.contains('show')); });
  if(mob) mob.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ setMenu(false); }); });
  document.addEventListener('click', function(e){
    if(mob && mob.classList.contains('show') && !mob.contains(e.target) && burger && !burger.contains(e.target)) setMenu(false);
  });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') setMenu(false); });

  /* ── scroll-reveal ── */
  if('IntersectionObserver' in window){
    var els = document.querySelectorAll('.cc,.pcard,.tc,.lbi,.pillar');
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){
          en.target.style.opacity='1';
          en.target.style.transform='translateY(0)';
          io.unobserve(en.target);
        }
      });
    },{threshold:0.08});
    els.forEach(function(el,i){
      el.style.opacity='0';
      el.style.transform='translateY(18px)';
      var d=(i%6)*0.065+'s';
      el.style.transition='opacity 0.45s ease '+d+', transform 0.45s ease '+d;
      io.observe(el);
    });
  }

  /* ── SHOPIFY AJAX CART API ── */
  window.VARCHAS_CART = {
    cartData: null,
    threshold: 99900, // â‚¹999.00 in cents

    init: function() {
      this.fetchCart();
    },

    fetchCart: function() {
      fetch(window.Shopify.routes.root + 'cart.js')
        .then(response => response.json())
        .then(data => {
          this.cartData = data;
          this.render();
        })
        .catch(e => console.error("Error fetching cart", e));
    },

    open: function() {
      var ov=document.getElementById('cartOverlay'), sb=document.getElementById('cartSidebar');
      if(ov) ov.classList.add('active');
      if(sb) sb.classList.add('active');
      document.body.style.overflow='hidden';
    },

    closeSidebar: function() {
      var ov=document.getElementById('cartOverlay'), sb=document.getElementById('cartSidebar');
      if(ov) ov.classList.remove('active');
      if(sb) sb.classList.remove('active');
      document.body.style.overflow='';
    },

    changeQty: function(key, quantity) {
      if(quantity < 0) quantity = 0;
      fetch(window.Shopify.routes.root + 'cart/change.js', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          id: key,
          quantity: quantity
        })
      })
      .then(response => response.json())
      .then(data => {
        this.cartData = data;
        this.render();
      })
      .catch(e => console.error("Error updating cart", e));
    },

    submitForm: function(form, btn) {
      var textSpan = btn ? btn.querySelector('span') : null;
      var originalText = '';
      if(btn) {
         btn.disabled = true;
         originalText = textSpan ? textSpan.innerHTML : btn.innerHTML;
         if (textSpan) {
           textSpan.innerHTML = 'ADDING...';
         } else {
           btn.innerHTML = 'ADDING...';
         }
      }

      fetch(window.Shopify.routes.root + 'cart/add.js', {
        method: 'POST',
        body: new FormData(form)
      })
      .then(response => {
        if (!response.ok) throw new Error("Add to cart failed");
        return response.json();
      })
      .then(item => {
        this.fetchCart();
        this.open();
      })
      .catch(e => {
        console.error("Error adding to cart", e);
        alert('Item could not be added to cart. It might be out of stock.');
      })
      .finally(() => {
        if(btn) {
          btn.disabled = false;
          if(textSpan) {
            textSpan.innerHTML = originalText;
          } else {
            btn.innerHTML = originalText;
          }
          // btn originalText logic shouldn't ruin pdp btn
          if(btn.id === 'atcBtn') {
             if (textSpan) {
               textSpan.innerHTML = 'ADDED TO CART';
             } else {
               btn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" class="atc-icn" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg> ADDED TO CART';
             }
             btn.classList.add('added');
             setTimeout(function(){
               btn.classList.remove('added');
               if (textSpan) {
                 textSpan.innerHTML = originalText;
               } else {
                 btn.innerHTML = originalText;
               }
             }, 2500);
          }
        }
      });
    },

    formatMoney: function(cents) {
      return '₹ ' + (cents / 100).toLocaleString('en-IN', {minimumFractionDigits: 0});
    },

    render: function() {
      if (!this.cartData) return;

      var count = this.cartData.item_count;
      var total = this.cartData.total_price;
      var left = Math.max(0, this.threshold - total);
      var pct = Math.min(100, (total / this.threshold) * 100);

      document.querySelectorAll('.cart-count,[id="cartCount"]').forEach(el => el.textContent = count);
      
      var ct = document.getElementById('cartTotal'); 
      if(ct) ct.textContent = this.formatMoney(total);
      
      var cl = document.getElementById('cartItemLabel'); 
      if(cl) cl.textContent = count + (count === 1 ? ' Item' : ' Items');
      
      var sl = document.getElementById('shippingLeft'); 
      if(sl) sl.textContent = left > 0 ? this.formatMoney(left) : 'FREE shipping unlocked 🎉';
      
      var sf = document.getElementById('shippingFill'); 
      if(sf) sf.style.width = pct + '%';
      
      var container = document.getElementById('cartItems');
      var emptyEl = document.getElementById('cartEmpty');
      var upsellEl = document.getElementById('cartUpsell');
      var footEl = document.getElementById('cartFoot');
      
      if(!container) return;

      if(count === 0){
        container.innerHTML = '';
        if(emptyEl)  emptyEl.style.display = 'flex';
        if(upsellEl) upsellEl.style.display = 'none';
        if(footEl)   footEl.style.display = 'none';
      } else {
        if(emptyEl)  emptyEl.style.display = 'none';
        if(upsellEl) upsellEl.style.display = 'flex'; // Optional: conditionally hide based on cart contents
        if(footEl)   footEl.style.display = 'block';
        
        container.innerHTML = this.cartData.items.map(item => {
          var optionsHtml = item.options_with_values ? item.options_with_values.map(o => o.value).join(' · ') : (item.variant_title || '');
          if(optionsHtml === 'Default Title') optionsHtml = '';
          
          var imageHtml = item.image ? `<img src="${item.image}" alt="${item.title}" style="width:100%; height:100%; object-fit:contain; background:#0F0D0A;">` : `<div class="ci-img" style="background:#0F0D0A; font-family:'Bebas Neue'; color:var(--saffron); font-size:11px; display:flex; align-items:center; justify-content:center;">VARCHAS</div>`;

          return `
            <div class="cart-item">
              <div class="ci-img" style="padding:0; overflow:hidden;">${imageHtml}</div>
              <div class="ci-info">
                <div class="ci-name">${item.product_title}</div>
                <div class="ci-variant">${optionsHtml}</div>
                <div class="ci-row">
                  <div class="ci-qty">
                    <button onclick="VARCHAS_CART.changeQty('${item.key}', ${item.quantity - 1})">−</button>
                    <span>${item.quantity}</span>
                    <button onclick="VARCHAS_CART.changeQty('${item.key}', ${item.quantity + 1})">+</button>
                  </div>
                  <div class="ci-price">${this.formatMoney(item.final_line_price)}</div>
                </div>
              </div>
              <button class="ci-remove" onclick="VARCHAS_CART.changeQty('${item.key}', 0)">✕</button>
            </div>
          `;
        }).join('');
      }
    }
  };

  // Initialize cart tracking on load
  VARCHAS_CART.init();

  /* ── wire cart open ── */
  var cartBtn = document.getElementById('cartBtn');
  if(cartBtn) cartBtn.onclick = function(){ VARCHAS_CART.open(); };
  var mobCartBtn = document.querySelector('.mob-cart');
  if(mobCartBtn) mobCartBtn.addEventListener('click',function(e){ e.preventDefault(); VARCHAS_CART.open(); setMenu(false); });
  var cartOverlay = document.getElementById('cartOverlay');
  if(cartOverlay) cartOverlay.onclick = function(){ VARCHAS_CART.closeSidebar(); };
  var cartClose = document.getElementById('cartClose');
  if(cartClose) cartClose.onclick = function(){ VARCHAS_CART.closeSidebar(); };

  document.addEventListener('keydown',function(e){ if(e.key==='Escape') VARCHAS_CART.closeSidebar(); });

  /* ── grid product card add to cart (using standard form submissions now) ── */
  document.querySelectorAll('form[action="/cart/add"]').forEach(function(form) {
    // skip pdp primary form as it's handled in varchas-product.js if needed, or bind globally
    form.addEventListener('submit', function(e) {
      // If it's the pdp form, let varchas-product.js handle it to avoid duplicate binding if both exist
      if(this.id === 'pdpForm') return; 

      e.preventDefault();
      e.stopPropagation();
      var btn = this.querySelector('button[type="submit"]');
      VARCHAS_CART.submitForm(this, btn);
    });
  });

  /* ── newsletter feedback ── */
  var nlf = document.getElementById('nlForm');
  if(nlf){
    nlf.addEventListener('submit', function(){
      var inp=nlf.querySelector('input');
      var btn=nlf.querySelector('button');
      if(!inp.value) return;
      btn.textContent='✓ Joined!';
      btn.style.background='#6DBF8A';
      inp.value='';
      setTimeout(function(){ btn.textContent='Arise →'; btn.style.background=''; }, 2400);
    });
  }

})();
