const SHEET_API = ""; // Paste your deployed Google Apps Script Web App URL here.
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

async function loadProducts(){
  if(!SHEET_API){render();return}
  try{
    const r=await fetch(SHEET_API); products=await r.json(); render();
  }catch(e){console.warn(e);render()}
}
function money(n){return "₹"+Number(n).toLocaleString("en-IN")}
function renderCats(){
  document.getElementById("categories").innerHTML=cats.map(c=>`<button class="cat" onclick="filterProducts('${c[0]}')"><span class="emoji">${c[1]}</span><b>${c[0]}</b></button>`).join("")
}
function render(list=products){
  renderCats();
  document.getElementById("productsGrid").innerHTML=list.map(p=>`
  <article class="card"><span class="badge ${p.badge==="BEST SELLER"?"green":""}">${p.badge||""}</span>
    <div class="pic"><img src="${p.image}" alt="${p.name}" loading="lazy"></div>
    <div class="info"><h3>${p.name}</h3><div class="stars">★★★★★ <span style="color:#777">(${p.reviews||0})</span></div>
    <div class="price">${p.oldPrice?`<span>${money(p.price)} <del style="font-size:12px;color:#888">${money(p.oldPrice)}</del></span>`:`<span>${money(p.price)}</span>`}
    <button class="add" onclick="addToCart('${p.id}')">🛒</button></div></div>
  </article>`).join("");
}
function filterProducts(cat){let q=document.getElementById("search").value.toLowerCase();render(products.filter(p=>(!cat||p.category===cat)&&(!q||p.name.toLowerCase().includes(q)||p.category.toLowerCase().includes(q))));document.getElementById("products").scrollIntoView({behavior:"smooth"})}
document.getElementById("search").addEventListener("input",()=>filterProducts(""));
function addToCart(id){let p=products.find(x=>String(x.id)===String(id));let item=cart.find(x=>x.id===id);if(item)item.qty++;else cart.push({...p,qty:1});updateCart();document.getElementById("drawer").classList.add("show")}
function updateCart(){
 document.getElementById("cartCount").textContent=cart.reduce((a,b)=>a+b.qty,0);
 document.getElementById("cartItems").innerHTML=cart.length?cart.map(p=>`<div class="cart-row"><img src="${p.image}"><div><b>${p.name}</b>${money(p.price)} × ${p.qty}</div></div>`).join(""):"<p>Your cart is empty.</p>";
 document.getElementById("cartTotal").textContent=money(cart.reduce((a,b)=>a+b.price*b.qty,0));
}
document.getElementById("openCart").onclick=()=>document.getElementById("drawer").classList.add("show");
document.getElementById("closeCart").onclick=()=>document.getElementById("drawer").classList.remove("show");
document.getElementById("payBtn").onclick=()=>{
 const total=cart.reduce((a,b)=>a+b.price*b.qty,0);
 if(!total)return alert("Add a product first.");
 const url=`upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(STORE_NAME)}&am=${total.toFixed(2)}&cu=INR&tn=${encodeURIComponent("3D Royal order")}`;
 window.location.href=url;
};
loadProducts();