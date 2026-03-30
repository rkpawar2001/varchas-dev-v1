
(function(){
  'use strict';

  /* â”€â”€ mobile menu toggle â”€â”€ */
  var burger = document.getElementById('burgerBtn');
  var mob    = document.getElementById('mobNav');
  function setMenu(open){
    mob.classList.toggle('show', open);
    document.body.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  }
  burger.addEventListener('click', function(){ setMenu(!mob.classList.contains('show')); });
  mob.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ setMenu(false); }); });
  document.addEventListener('click', function(e){
    if(mob.classList.contains('show') && !mob.contains(e.target) && !burger.contains(e.target)) setMenu(false);
  });
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') setMenu(false); });

  /* â”€â”€ scroll-reveal â”€â”€ */
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


  /* â”€â”€ SHARED CART STATE â”€â”€ */
  window.VARCHAS_CART = {
    items: [],
    threshold: 999,
    add: function(item) {
      var ex = this.items.find(function(i){ return i.id===item.id && i.size===item.size && i.color===item.color; });
      if(ex){ ex.qty++; } else { this.items.push(Object.assign({qty:1},item)); }
      this.render(); this.open();
    },
    remove: function(idx) { this.items.splice(idx,1); this.render(); },
    changeQty: function(idx,d) { this.items[idx].qty = Math.max(1, this.items[idx].qty+d); this.render(); },
    total: function() { return this.items.reduce(function(s,i){ return s+i.price*i.qty; },0); },
    count: function() { return this.items.reduce(function(s,i){ return s+i.qty; },0); },
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
    render: function() {
      var count=this.count(), total=this.total();
      var left=Math.max(0,this.threshold-total);
      var pct=Math.min(100,(total/this.threshold)*100);
      document.querySelectorAll('.cart-count,[id="cartCount"]').forEach(function(el){ el.textContent=count; });
      var ct=document.getElementById('cartTotal'); if(ct) ct.textContent='â‚¹ '+total.toLocaleString('en-IN');
      var cl=document.getElementById('cartItemLabel'); if(cl) cl.textContent=count+(count===1?' Item':' Items');
      var sl=document.getElementById('shippingLeft'); if(sl) sl.textContent=left>0?'â‚¹'+left.toLocaleString('en-IN'):'FREE shipping unlocked ðŸŽ‰';
      var sf=document.getElementById('shippingFill'); if(sf) sf.style.width=pct+'%';
      var container=document.getElementById('cartItems');
      var emptyEl=document.getElementById('cartEmpty');
      var upsellEl=document.getElementById('cartUpsell');
      var footEl=document.getElementById('cartFoot');
      if(!container) return;
      if(this.items.length===0){
        container.innerHTML='';
        if(emptyEl)  emptyEl.style.display='flex';
        if(upsellEl) upsellEl.style.display='none';
        if(footEl)   footEl.style.display='none';
      } else {
        if(emptyEl)  emptyEl.style.display='none';
        if(upsellEl) upsellEl.style.display='flex';
        if(footEl)   footEl.style.display='block';
        var self=this;
        container.innerHTML=this.items.map(function(item,i){
          return '<div class="cart-item"><div class="ci-img">'+item.graphic+'</div><div class="ci-info"><div class="ci-name">'+item.name+'</div><div class="ci-variant">'+item.size+' Â· '+item.color+'</div><div class="ci-row"><div class="ci-qty"><button onclick="VARCHAS_CART.changeQty('+i+',-1)">âˆ’</button><span>'+item.qty+'</span><button onclick="VARCHAS_CART.changeQty('+i+',+1)">+</button></div><div class="ci-price">â‚¹ '+(item.price*item.qty).toLocaleString('en-IN')+'</div></div></div><button class="ci-remove" onclick="VARCHAS_CART.remove('+i+')">âœ•</button></div>';
        }).join('');
      }
    }
  };
  function closeCart(){ VARCHAS_CART.closeSidebar(); }
  function addUpsell(){ VARCHAS_CART.add({id:'upsell-arise-arjuna',name:'Arise Arjuna Oversized Tee',price:999,size:'M',color:'Ink Black',graphic:'ARISE\nARJUNA'}); }

  /* â”€â”€ wire cart open â”€â”€ */
  var cartBtn = document.getElementById('cartBtn');
  if(cartBtn) cartBtn.onclick = function(){ VARCHAS_CART.open(); };
  var mobCartBtn = document.querySelector('.mob-cart');
  if(mobCartBtn) mobCartBtn.addEventListener('click',function(e){ e.preventDefault(); VARCHAS_CART.open(); setMenu(false); });
  var cartOverlay = document.getElementById('cartOverlay');
  if(cartOverlay) cartOverlay.onclick = function(){ VARCHAS_CART.closeSidebar(); };
  var cartClose = document.getElementById('cartClose');
  if(cartClose) cartClose.onclick = function(){ VARCHAS_CART.closeSidebar(); };

  document.addEventListener('keydown',function(e){ if(e.key==='Escape') VARCHAS_CART.closeSidebar(); });

  /* â”€â”€ product card add to cart â”€â”€ */
  document.querySelectorAll('.padd').forEach(function(btn){
    btn.onclick = function(e){
      e.stopPropagation();
      var card = btn.closest('.pcard');
      var name = card.querySelector('.pname').textContent;
      var price= parseInt(card.querySelector('.pprice').textContent.replace(/[^0-9]/g,''));
      var graphic = card.querySelector('.pbig').textContent;
      VARCHAS_CART.add({id:'hp-'+name.replace(/\s/g,'-').toLowerCase(),name:name,price:price,size:'M',color:'Ink Black',graphic:graphic});
    };
  });
  VARCHAS_CART.render();


  /* â”€â”€ newsletter feedback â”€â”€ */
  var nlf = document.getElementById('nlForm');
  if(nlf){
    nlf.addEventListener('submit', function(){
      var inp=nlf.querySelector('input');
      var btn=nlf.querySelector('button');
      if(!inp.value) return;
      btn.textContent='âœ“ Joined!';
      btn.style.background='#6DBF8A';
      inp.value='';
      setTimeout(function(){ btn.textContent='Arise â†’'; btn.style.background=''; }, 2400);
    });
  }

})();

