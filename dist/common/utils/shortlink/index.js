var o=Object.defineProperty;var c=Object.getOwnPropertyDescriptor;var h=Object.getOwnPropertyNames;var l=Object.prototype.hasOwnProperty;var f=(r,t)=>{for(var e in t)o(r,e,{get:t[e],enumerable:!0})},s=(r,t,e,a)=>{if(t&&typeof t=="object"||typeof t=="function")for(let n of h(t))!l.call(r,n)&&n!==e&&o(r,n,{get:()=>t[n],enumerable:!(a=c(t,n))||a.enumerable});return r};var u=r=>s(o({},"__esModule",{value:!0}),r);var g={};f(g,{generateId:()=>d});module.exports=u(g);function d(r){let t="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",e="";for(let a=0;a<r;a++)e+=t.charAt(Math.floor(Math.random()*t.length));return e}0&&(module.exports={generateId});
//# sourceMappingURL=index.js.map
