const SHEET_API = ""; // Paste deployed Google Apps Script Web App URL here.
const UPI_ID = "arumugam5130335@oksbi";
const STORE_NAME = "3D Royal";

const demoProducts = [
 {id:"1",name:"3D Sports Car",category:"Cars",price:999,oldPrice:"",rating:4.8,reviews:128,badge:"NEW",image:"https://images.unsplash.com/photo-1544829099-b9a0c07fad1a?auto=format&fit=crop&w=800&q=80"},
 {id:"2",name:"3D Robo Warrior",category:"Robots",price:1299,oldPrice:"",rating:4.8,reviews:256,badge:"BEST SELLER",image:"https://images.unsplash.com/photo-1614726365723-49cfae9276b5?auto=format&fit=crop&w=800&q=80"},
 {id:"3",name:"3D Dino Rex",category:"Animals",price:699,oldPrice:"",rating:4.7,reviews:98,badge:"NEW",image:"https://images.unsplash.com/photo-1590510182802-28f8d7d5e7c6?auto=format&fit=crop&w=800&q=80"},
 {id:"4",name:"3D Dream Castle",category:"Building Sets",price:1199,oldPrice:1499,rating:4.9,reviews:176,badge:"20% OFF",image:"https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=800&q=80"}
];
const cats=[["Cars","🏎️"],["Robots","🤖"],["Animals","🦖"],["Figures","🦸"],["Building Sets","🧱"],["More","✈️"]];
let products=demoProducts, cart=[];

function loadProducts(){
  if(!SHEET_API){render();return}
  // JSONP avoids browser CORS restrictions when reading a public Apps Script web app.
  const callback="royalSheetCallback";
  window[callback]=(data)=>{if(Array.isArray(data)){products=data;render()}else{render()}};
  const s=document.createElement("script");
  s.src=SHEET_API+(SHEET_API.includes("?")?"&":"?")+"callback="+callback;
  s.onerror=()=>render();
  document.body.appendChild(s);
}
function money(n){return "₹"+Number(n).toLocaleString("en-IN")}
function renderCats(){
  document.getElementById("categories").innerHTML=cats.map(c=>`<button class="cat" onclick="filterProducts('${c[0]}')"><span class="emoji">${c[1]}</span><b>${c[0]}</b></button>`).join("")
}
function render(list=products){
  renderCats();
  document.getElementById("productsGrid").innerHTML=list.map(p=>`
  <article class="card"><span class="badge ${p.badge==="BEST SELLER"?"green":""}">${p.badge||""}</span>
    <div class="pic"><img src="${p.image}" alt="${p.name}" loading="lazy" onerror="this.style.display='none'"></div>
    <div class="info"><h3>${p.name}</h3><div class="stars">★★★★★ <span style="color:#777">(${p.reviews||0})</span></div>
    <div class="price"><span>${money(p.price)} ${p.oldPrice?`<del style="font-size:12px;color:#888">${money(p.oldPrice)}</del>`:""}</span>
    <button class="add" onclick="addToCart('${p.id}')">🛒</button></div></div>
  </article>`).join("");
}
function filterProducts(cat){let q=document.getElementById("search").value.toLowerCase();render(products.filter(p=>(!cat||p.category===cat)&&(!q||String(p.name).toLowerCase().includes(q)||String(p.category).toLowerCase().includes(q))));document.getElementById("products").scrollIntoView({behavior:"smooth"})}
document.getElementById("search").addEventListener("input",()=>filterProducts(""));
function addToCart(id){let p=products.find(x=>String(x.id)===String(id));if(!p)return;let item=cart.find(x=>String(x.id)===String(id));if(item)item.qty++;else cart.push({...p,qty:1});updateCart();document.getElementById("drawer").classList.add("show")}
function updateCart(){
 document.getElementById("cartCount").textContent=cart.reduce((a,b)=>a+b.qty,0);
 document.getElementById("cartItems").innerHTML=cart.length?cart.map(p=>`<div class="cart-row"><img src="${p.image}"><div><b>${p.name}</b>${money(p.price)} × ${p.qty}<br><button type="button" onclick="removeFromCart('${p.id}')" style="margin-top:5px">Remove</button></div></div>`).join(""):"<p>Your cart is empty.</p>";
 document.getElementById("cartTotal").textContent=money(cart.reduce((a,b)=>a+Number(b.price)*b.qty,0));
}
function removeFromCart(id){cart=cart.filter(p=>String(p.id)!==String(id));updateCart()}
document.getElementById("openCart").onclick=()=>document.getElementById("drawer").classList.add("show");
document.getElementById("closeCart").onclick=()=>document.getElementById("drawer").classList.remove("show");

document.getElementById("deliveryForm").addEventListener("submit", async (e)=>{
 e.preventDefault();
 const total=cart.reduce((a,b)=>a+Number(b.price)*b.qty,0);
 if(!total){alert("முதலில் Cart-ல் பொருள் சேர்க்கவும்.");return}
 const f=new FormData(e.currentTarget);
 const orderId="DR"+Date.now().toString().slice(-9);
 const order={
  orderId, date:new Date().toISOString(),
  customerName:f.get("name"), phone:f.get("phone"), address:f.get("address"),
  city:f.get("city"), pincode:f.get("pincode"),
  items:cart.map(p=>`${p.name} x ${p.qty} (${money(p.price)})`).join("; "),
  total, paymentStatus:"PENDING", orderStatus:"NEW"
 };
 if(SHEET_API){
   try{
     const body=new URLSearchParams();
     Object.entries(order).forEach(([k,v])=>body.append(k,String(v)));
     await fetch(SHEET_API,{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/x-www-form-urlencoded;charset=UTF-8"},body:body.toString()});
   }catch(err){alert("Order save செய்ய முடியவில்லை. Apps Script URL/Deploy சரிபார்க்கவும்.");return}
 }else{
   alert("Google Sheet இன்னும் இணைக்கப்படவில்லை. UPI திறக்கும்; ஆனால் order Google Sheet-ல் save ஆகாது.");
 }
 const upi=`upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(STORE_NAME)}&am=${total.toFixed(2)}&cu=INR&tn=${encodeURIComponent("Order "+orderId)}`;
 alert(`Order ID: ${orderId}\nமொத்தம்: ${money(total)}\nஅடுத்து UPI app திறக்கும். Payment செய்த பிறகு பணம் வந்ததைத் தனியாகச் சரிபார்க்கவும்.`);
 window.location.href=upi;
});
loadProducts();
