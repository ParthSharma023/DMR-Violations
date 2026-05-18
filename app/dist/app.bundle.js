(function () {
  "use strict";
  const __wwip_modules__ = Object.create(null);
  const __wwip_cache__ = Object.create(null);
  function __wwip_define__(id, factory) { __wwip_modules__[id] = factory; }
  function __wwip_require__(id) {
    if (__wwip_cache__[id]) return __wwip_cache__[id].exports;
    if (!__wwip_modules__[id]) throw new Error(`Unknown module: ${id}`);
    const module = { exports: {} };
    __wwip_cache__[id] = module;
    __wwip_modules__[id](module, module.exports, __wwip_require__);
    return module.exports;
  }

  __wwip_define__('app/lib/preact.module.js', function (module, exports, __wwip_require__) {
var n,l,u,t,i,o,r,f,e,c,s,a,h={},p=[],v=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,y=Array.isArray;function d(n,l){for(var u in l)n[u]=l[u];return n}function w(n){var l=n.parentNode;l&&l.removeChild(n)}function _(l,u,t){var i,o,r,f={};for(r in u)"key"==r?i=u[r]:"ref"==r?o=u[r]:f[r]=u[r];if(arguments.length>2&&(f.children=arguments.length>3?n.call(arguments,2):t),"function"==typeof l&&null!=l.defaultProps)for(r in l.defaultProps)void 0===f[r]&&(f[r]=l.defaultProps[r]);return g(l,f,i,o,null)}function g(n,t,i,o,r){var f={type:n,props:t,key:i,ref:o,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,constructor:void 0,__v:null==r?++u:r,__i:-1,__u:0};return null==r&&null!=l.vnode&&l.vnode(f),f}function m(){return{current:null}}function k(n){return n.children}function b(n,l){this.props=n,this.context=l}function x(n,l){if(null==l)return n.__?x(n.__,n.__i+1):null;for(var u;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e)return u.__e;return"function"==typeof n.type?x(n):null}function C(n){var l,u;if(null!=(n=n.__)&&null!=n.__c){for(n.__e=n.__c.base=null,l=0;l<n.__k.length;l++)if(null!=(u=n.__k[l])&&null!=u.__e){n.__e=n.__c.base=u.__e;break}return C(n)}}function M(n){(!n.__d&&(n.__d=!0)&&i.push(n)&&!P.__r++||o!==l.debounceRendering)&&((o=l.debounceRendering)||r)(P)}function P(){var n,u,t,o,r,e,c,s;for(i.sort(f);n=i.shift();)n.__d&&(u=i.length,o=void 0,e=(r=(t=n).__v).__e,c=[],s=[],t.__P&&((o=d({},r)).__v=r.__v+1,l.vnode&&l.vnode(o),O(t.__P,o,r,t.__n,t.__P.namespaceURI,32&r.__u?[e]:null,c,null==e?x(r):e,!!(32&r.__u),s),o.__v=r.__v,o.__.__k[o.__i]=o,j(c,o,s),o.__e!=e&&C(o)),i.length>u&&i.sort(f));P.__r=0}function S(n,l,u,t,i,o,r,f,e,c,s){var a,v,y,d,w,_=t&&t.__k||p,g=l.length;for(u.__d=e,$(u,l,_),e=u.__d,a=0;a<g;a++)null!=(y=u.__k[a])&&"boolean"!=typeof y&&"function"!=typeof y&&(v=-1===y.__i?h:_[y.__i]||h,y.__i=a,O(n,y,v,i,o,r,f,e,c,s),d=y.__e,y.ref&&v.ref!=y.ref&&(v.ref&&N(v.ref,null,y),s.push(y.ref,y.__c||d,y)),null==w&&null!=d&&(w=d),65536&y.__u||v.__k===y.__k?(e&&!e.isConnected&&(e=x(v)),e=I(y,e,n)):"function"==typeof y.type&&void 0!==y.__d?e=y.__d:d&&(e=d.nextSibling),y.__d=void 0,y.__u&=-196609);u.__d=e,u.__e=w}function $(n,l,u){var t,i,o,r,f,e=l.length,c=u.length,s=c,a=0;for(n.__k=[],t=0;t<e;t++)r=t+a,null!=(i=n.__k[t]=null==(i=l[t])||"boolean"==typeof i||"function"==typeof i?null:"string"==typeof i||"number"==typeof i||"bigint"==typeof i||i.constructor==String?g(null,i,null,null,null):y(i)?g(k,{children:i},null,null,null):void 0===i.constructor&&i.__b>0?g(i.type,i.props,i.key,i.ref?i.ref:null,i.__v):i)?(i.__=n,i.__b=n.__b+1,f=L(i,u,r,s),i.__i=f,o=null,-1!==f&&(s--,(o=u[f])&&(o.__u|=131072)),null==o||null===o.__v?(-1==f&&a--,"function"!=typeof i.type&&(i.__u|=65536)):f!==r&&(f===r+1?a++:f>r?s>e-r?a+=f-r:a--:f<r?f==r-1&&(a=f-r):a=0,f!==t+a&&(i.__u|=65536))):(o=u[r])&&null==o.key&&o.__e&&0==(131072&o.__u)&&(o.__e==n.__d&&(n.__d=x(o)),V(o,o,!1),u[r]=null,s--);if(s)for(t=0;t<c;t++)null!=(o=u[t])&&0==(131072&o.__u)&&(o.__e==n.__d&&(n.__d=x(o)),V(o,o))}function I(n,l,u){var t,i;if("function"==typeof n.type){for(t=n.__k,i=0;t&&i<t.length;i++)t[i]&&(t[i].__=n,l=I(t[i],l,u));return l}n.__e!=l&&(u.insertBefore(n.__e,l||null),l=n.__e);do{l=l&&l.nextSibling}while(null!=l&&8===l.nodeType);return l}function H(n,l){return l=l||[],null==n||"boolean"==typeof n||(y(n)?n.some(function(n){H(n,l)}):l.push(n)),l}function L(n,l,u,t){var i=n.key,o=n.type,r=u-1,f=u+1,e=l[u];if(null===e||e&&i==e.key&&o===e.type&&0==(131072&e.__u))return u;if(t>(null!=e&&0==(131072&e.__u)?1:0))for(;r>=0||f<l.length;){if(r>=0){if((e=l[r])&&0==(131072&e.__u)&&i==e.key&&o===e.type)return r;r--}if(f<l.length){if((e=l[f])&&0==(131072&e.__u)&&i==e.key&&o===e.type)return f;f++}}return-1}function T(n,l,u){"-"===l[0]?n.setProperty(l,null==u?"":u):n[l]=null==u?"":"number"!=typeof u||v.test(l)?u:u+"px"}function A(n,l,u,t,i){var o;n:if("style"===l)if("string"==typeof u)n.style.cssText=u;else{if("string"==typeof t&&(n.style.cssText=t=""),t)for(l in t)u&&l in u||T(n.style,l,"");if(u)for(l in u)t&&u[l]===t[l]||T(n.style,l,u[l])}else if("o"===l[0]&&"n"===l[1])o=l!==(l=l.replace(/(PointerCapture)$|Capture$/i,"$1")),l=l.toLowerCase()in n||"onFocusOut"===l||"onFocusIn"===l?l.toLowerCase().slice(2):l.slice(2),n.l||(n.l={}),n.l[l+o]=u,u?t?u.u=t.u:(u.u=e,n.addEventListener(l,o?s:c,o)):n.removeEventListener(l,o?s:c,o);else{if("http://www.w3.org/2000/svg"==i)l=l.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if("width"!=l&&"height"!=l&&"href"!=l&&"list"!=l&&"form"!=l&&"tabIndex"!=l&&"download"!=l&&"rowSpan"!=l&&"colSpan"!=l&&"role"!=l&&l in n)try{n[l]=null==u?"":u;break n}catch(n){}"function"==typeof u||(null==u||!1===u&&"-"!==l[4]?n.removeAttribute(l):n.setAttribute(l,u))}}function F(n){return function(u){if(this.l){var t=this.l[u.type+n];if(null==u.t)u.t=e++;else if(u.t<t.u)return;return t(l.event?l.event(u):u)}}}function O(n,u,t,i,o,r,f,e,c,s){var a,h,p,v,w,_,g,m,x,C,M,P,$,I,H,L=u.type;if(void 0!==u.constructor)return null;128&t.__u&&(c=!!(32&t.__u),r=[e=u.__e=t.__e]),(a=l.__b)&&a(u);n:if("function"==typeof L)try{if(m=u.props,x=(a=L.contextType)&&i[a.__c],C=a?x?x.props.value:a.__:i,t.__c?g=(h=u.__c=t.__c).__=h.__E:("prototype"in L&&L.prototype.render?u.__c=h=new L(m,C):(u.__c=h=new b(m,C),h.constructor=L,h.render=q),x&&x.sub(h),h.props=m,h.state||(h.state={}),h.context=C,h.__n=i,p=h.__d=!0,h.__h=[],h._sb=[]),null==h.__s&&(h.__s=h.state),null!=L.getDerivedStateFromProps&&(h.__s==h.state&&(h.__s=d({},h.__s)),d(h.__s,L.getDerivedStateFromProps(m,h.__s))),v=h.props,w=h.state,h.__v=u,p)null==L.getDerivedStateFromProps&&null!=h.componentWillMount&&h.componentWillMount(),null!=h.componentDidMount&&h.__h.push(h.componentDidMount);else{if(null==L.getDerivedStateFromProps&&m!==v&&null!=h.componentWillReceiveProps&&h.componentWillReceiveProps(m,C),!h.__e&&(null!=h.shouldComponentUpdate&&!1===h.shouldComponentUpdate(m,h.__s,C)||u.__v===t.__v)){for(u.__v!==t.__v&&(h.props=m,h.state=h.__s,h.__d=!1),u.__e=t.__e,u.__k=t.__k,u.__k.forEach(function(n){n&&(n.__=u)}),M=0;M<h._sb.length;M++)h.__h.push(h._sb[M]);h._sb=[],h.__h.length&&f.push(h);break n}null!=h.componentWillUpdate&&h.componentWillUpdate(m,h.__s,C),null!=h.componentDidUpdate&&h.__h.push(function(){h.componentDidUpdate(v,w,_)})}if(h.context=C,h.props=m,h.__P=n,h.__e=!1,P=l.__r,$=0,"prototype"in L&&L.prototype.render){for(h.state=h.__s,h.__d=!1,P&&P(u),a=h.render(h.props,h.state,h.context),I=0;I<h._sb.length;I++)h.__h.push(h._sb[I]);h._sb=[]}else do{h.__d=!1,P&&P(u),a=h.render(h.props,h.state,h.context),h.state=h.__s}while(h.__d&&++$<25);h.state=h.__s,null!=h.getChildContext&&(i=d(d({},i),h.getChildContext())),p||null==h.getSnapshotBeforeUpdate||(_=h.getSnapshotBeforeUpdate(v,w)),S(n,y(H=null!=a&&a.type===k&&null==a.key?a.props.children:a)?H:[H],u,t,i,o,r,f,e,c,s),h.base=u.__e,u.__u&=-161,h.__h.length&&f.push(h),g&&(h.__E=h.__=null)}catch(n){u.__v=null,c||null!=r?(u.__e=e,u.__u|=c?160:32,r[r.indexOf(e)]=null):(u.__e=t.__e,u.__k=t.__k),l.__e(n,u,t)}else null==r&&u.__v===t.__v?(u.__k=t.__k,u.__e=t.__e):u.__e=z(t.__e,u,t,i,o,r,f,c,s);(a=l.diffed)&&a(u)}function j(n,u,t){u.__d=void 0;for(var i=0;i<t.length;i++)N(t[i],t[++i],t[++i]);l.__c&&l.__c(u,n),n.some(function(u){try{n=u.__h,u.__h=[],n.some(function(n){n.call(u)})}catch(n){l.__e(n,u.__v)}})}function z(l,u,t,i,o,r,f,e,c){var s,a,p,v,d,_,g,m=t.props,k=u.props,b=u.type;if("svg"===b?o="http://www.w3.org/2000/svg":"math"===b?o="http://www.w3.org/1998/Math/MathML":o||(o="http://www.w3.org/1999/xhtml"),null!=r)for(s=0;s<r.length;s++)if((d=r[s])&&"setAttribute"in d==!!b&&(b?d.localName===b:3===d.nodeType)){l=d,r[s]=null;break}if(null==l){if(null===b)return document.createTextNode(k);l=document.createElementNS(o,b,k.is&&k),r=null,e=!1}if(null===b)m===k||e&&l.data===k||(l.data=k);else{if(r=r&&n.call(l.childNodes),m=t.props||h,!e&&null!=r)for(m={},s=0;s<l.attributes.length;s++)m[(d=l.attributes[s]).name]=d.value;for(s in m)if(d=m[s],"children"==s);else if("dangerouslySetInnerHTML"==s)p=d;else if("key"!==s&&!(s in k)){if("value"==s&&"defaultValue"in k||"checked"==s&&"defaultChecked"in k)continue;A(l,s,null,d,o)}for(s in k)d=k[s],"children"==s?v=d:"dangerouslySetInnerHTML"==s?a=d:"value"==s?_=d:"checked"==s?g=d:"key"===s||e&&"function"!=typeof d||m[s]===d||A(l,s,d,m[s],o);if(a)e||p&&(a.__html===p.__html||a.__html===l.innerHTML)||(l.innerHTML=a.__html),u.__k=[];else if(p&&(l.innerHTML=""),S(l,y(v)?v:[v],u,t,i,"foreignObject"===b?"http://www.w3.org/1999/xhtml":o,r,f,r?r[0]:t.__k&&x(t,0),e,c),null!=r)for(s=r.length;s--;)null!=r[s]&&w(r[s]);e||(s="value",void 0!==_&&(_!==l[s]||"progress"===b&&!_||"option"===b&&_!==m[s])&&A(l,s,_,m[s],o),s="checked",void 0!==g&&g!==l[s]&&A(l,s,g,m[s],o))}return l}function N(n,u,t){try{"function"==typeof n?n(u):n.current=u}catch(n){l.__e(n,t)}}function V(n,u,t){var i,o;if(l.unmount&&l.unmount(n),(i=n.ref)&&(i.current&&i.current!==n.__e||N(i,null,u)),null!=(i=n.__c)){if(i.componentWillUnmount)try{i.componentWillUnmount()}catch(n){l.__e(n,u)}i.base=i.__P=null}if(i=n.__k)for(o=0;o<i.length;o++)i[o]&&V(i[o],u,t||"function"!=typeof n.type);t||null==n.__e||w(n.__e),n.__c=n.__=n.__e=n.__d=void 0}function q(n,l,u){return this.constructor(n,u)}function B(u,t,i){var o,r,f,e;l.__&&l.__(u,t),r=(o="function"==typeof i)?null:i&&i.__k||t.__k,f=[],e=[],O(t,u=(!o&&i||t).__k=_(k,null,[u]),r||h,h,t.namespaceURI,!o&&i?[i]:r?null:t.firstChild?n.call(t.childNodes):null,f,!o&&i?i:r?r.__e:t.firstChild,o,e),j(f,u,e)}function D(n,l){B(n,l,D)}function E(l,u,t){var i,o,r,f,e=d({},l.props);for(r in l.type&&l.type.defaultProps&&(f=l.type.defaultProps),u)"key"==r?i=u[r]:"ref"==r?o=u[r]:e[r]=void 0===u[r]&&void 0!==f?f[r]:u[r];return arguments.length>2&&(e.children=arguments.length>3?n.call(arguments,2):t),g(l.type,e,i||l.key,o||l.ref,null)}function G(n,l){var u={__c:l="__cC"+a++,__:n,Consumer:function(n,l){return n.children(l)},Provider:function(n){var u,t;return this.getChildContext||(u=[],(t={})[l]=this,this.getChildContext=function(){return t},this.shouldComponentUpdate=function(n){this.props.value!==n.value&&u.some(function(n){n.__e=!0,M(n)})},this.sub=function(n){u.push(n);var l=n.componentWillUnmount;n.componentWillUnmount=function(){u.splice(u.indexOf(n),1),l&&l.call(n)}}),n.children}};return u.Provider.__=u.Consumer.contextType=u}n=p.slice,l={__e:function(n,l,u,t){for(var i,o,r;l=l.__;)if((i=l.__c)&&!i.__)try{if((o=i.constructor)&&null!=o.getDerivedStateFromError&&(i.setState(o.getDerivedStateFromError(n)),r=i.__d),null!=i.componentDidCatch&&(i.componentDidCatch(n,t||{}),r=i.__d),r)return i.__E=i}catch(l){n=l}throw n}},u=0,t=function(n){return null!=n&&null==n.constructor},b.prototype.setState=function(n,l){var u;u=null!=this.__s&&this.__s!==this.state?this.__s:this.__s=d({},this.state),"function"==typeof n&&(n=n(d({},u),this.props)),n&&d(u,n),null!=n&&this.__v&&(l&&this._sb.push(l),M(this))},b.prototype.forceUpdate=function(n){this.__v&&(this.__e=!0,n&&this.__h.push(n),M(this))},b.prototype.render=k,i=[],r="function"==typeof Promise?Promise.prototype.then.bind(Promise.resolve()):setTimeout,f=function(n,l){return n.__v.__b-l.__v.__b},P.__r=0,e=0,c=F(!1),s=F(!0),a=0;
//# sourceMappingURL=preact.module.js.map
exports['Component'] = b;
exports['Fragment'] = k;
exports['cloneElement'] = E;
exports['createContext'] = G;
exports['createElement'] = _;
exports['createRef'] = m;
exports['h'] = _;
exports['hydrate'] = D;
exports['isValidElement'] = t;
exports['options'] = l;
exports['render'] = B;
exports['toChildArray'] = H;
  });

  __wwip_define__('app/lib/preact-hooks.module.js', function (module, exports, __wwip_require__) {
const {options: n} = __wwip_require__('app/lib/preact.module.js');
var t,r,u,i,o=0,f=[],c=[],e=n,a=e.__b,v=e.__r,l=e.diffed,m=e.__c,s=e.unmount,d=e.__;function h(n,t){e.__h&&e.__h(r,n,o||t),o=0;var u=r.__H||(r.__H={__:[],__h:[]});return n>=u.__.length&&u.__.push({__V:c}),u.__[n]}function p(n){return o=1,y(D,n)}function y(n,u,i){var o=h(t++,2);if(o.t=n,!o.__c&&(o.__=[i?i(u):D(void 0,u),function(n){var t=o.__N?o.__N[0]:o.__[0],r=o.t(t,n);t!==r&&(o.__N=[r,o.__[1]],o.__c.setState({}))}],o.__c=r,!r.u)){var f=function(n,t,r){if(!o.__c.__H)return!0;var u=o.__c.__H.__.filter(function(n){return!!n.__c});if(u.every(function(n){return!n.__N}))return!c||c.call(this,n,t,r);var i=!1;return u.forEach(function(n){if(n.__N){var t=n.__[0];n.__=n.__N,n.__N=void 0,t!==n.__[0]&&(i=!0)}}),!(!i&&o.__c.props===n)&&(!c||c.call(this,n,t,r))};r.u=!0;var c=r.shouldComponentUpdate,e=r.componentWillUpdate;r.componentWillUpdate=function(n,t,r){if(this.__e){var u=c;c=void 0,f(n,t,r),c=u}e&&e.call(this,n,t,r)},r.shouldComponentUpdate=f}return o.__N||o.__}function _(n,u){var i=h(t++,3);!e.__s&&C(i.__H,u)&&(i.__=n,i.i=u,r.__H.__h.push(i))}function A(n,u){var i=h(t++,4);!e.__s&&C(i.__H,u)&&(i.__=n,i.i=u,r.__h.push(i))}function F(n){return o=5,q(function(){return{current:n}},[])}function T(n,t,r){o=6,A(function(){return"function"==typeof n?(n(t()),function(){return n(null)}):n?(n.current=t(),function(){return n.current=null}):void 0},null==r?r:r.concat(n))}function q(n,r){var u=h(t++,7);return C(u.__H,r)?(u.__V=n(),u.i=r,u.__h=n,u.__V):u.__}function x(n,t){return o=8,q(function(){return n},t)}function P(n){var u=r.context[n.__c],i=h(t++,9);return i.c=n,u?(null==i.__&&(i.__=!0,u.sub(r)),u.props.value):n.__}function V(n,t){e.useDebugValue&&e.useDebugValue(t?t(n):n)}function b(n){var u=h(t++,10),i=p();return u.__=n,r.componentDidCatch||(r.componentDidCatch=function(n,t){u.__&&u.__(n,t),i[1](n)}),[i[0],function(){i[1](void 0)}]}function g(){var n=h(t++,11);if(!n.__){for(var u=r.__v;null!==u&&!u.__m&&null!==u.__;)u=u.__;var i=u.__m||(u.__m=[0,0]);n.__="P"+i[0]+"-"+i[1]++}return n.__}function j(){for(var n;n=f.shift();)if(n.__P&&n.__H)try{n.__H.__h.forEach(z),n.__H.__h.forEach(B),n.__H.__h=[]}catch(t){n.__H.__h=[],e.__e(t,n.__v)}}e.__b=function(n){r=null,a&&a(n)},e.__=function(n,t){n&&t.__k&&t.__k.__m&&(n.__m=t.__k.__m),d&&d(n,t)},e.__r=function(n){v&&v(n),t=0;var i=(r=n.__c).__H;i&&(u===r?(i.__h=[],r.__h=[],i.__.forEach(function(n){n.__N&&(n.__=n.__N),n.__V=c,n.__N=n.i=void 0})):(i.__h.forEach(z),i.__h.forEach(B),i.__h=[],t=0)),u=r},e.diffed=function(n){l&&l(n);var t=n.__c;t&&t.__H&&(t.__H.__h.length&&(1!==f.push(t)&&i===e.requestAnimationFrame||((i=e.requestAnimationFrame)||w)(j)),t.__H.__.forEach(function(n){n.i&&(n.__H=n.i),n.__V!==c&&(n.__=n.__V),n.i=void 0,n.__V=c})),u=r=null},e.__c=function(n,t){t.some(function(n){try{n.__h.forEach(z),n.__h=n.__h.filter(function(n){return!n.__||B(n)})}catch(r){t.some(function(n){n.__h&&(n.__h=[])}),t=[],e.__e(r,n.__v)}}),m&&m(n,t)},e.unmount=function(n){s&&s(n);var t,r=n.__c;r&&r.__H&&(r.__H.__.forEach(function(n){try{z(n)}catch(n){t=n}}),r.__H=void 0,t&&e.__e(t,r.__v))};var k="function"==typeof requestAnimationFrame;function w(n){var t,r=function(){clearTimeout(u),k&&cancelAnimationFrame(t),setTimeout(n)},u=setTimeout(r,100);k&&(t=requestAnimationFrame(r))}function z(n){var t=r,u=n.__c;"function"==typeof u&&(n.__c=void 0,u()),r=t}function B(n){var t=r;n.__c=n.__(),r=t}function C(n,t){return!n||n.length!==t.length||t.some(function(t,r){return t!==n[r]})}function D(n,t){return"function"==typeof t?t(n):t}
//# sourceMappingURL=hooks.module.js.map
exports['useCallback'] = x;
exports['useContext'] = P;
exports['useDebugValue'] = V;
exports['useEffect'] = _;
exports['useErrorBoundary'] = b;
exports['useId'] = g;
exports['useImperativeHandle'] = T;
exports['useLayoutEffect'] = A;
exports['useMemo'] = q;
exports['useReducer'] = y;
exports['useRef'] = F;
exports['useState'] = p;
  });

  __wwip_define__('app/lib/htm.module.js', function (module, exports, __wwip_require__) {
var n=function(t,s,r,e){var u;s[0]=0;for(var h=1;h<s.length;h++){var p=s[h++],a=s[h]?(s[0]|=p?1:2,r[s[h++]]):s[++h];3===p?e[0]=a:4===p?e[1]=Object.assign(e[1]||{},a):5===p?(e[1]=e[1]||{})[s[++h]]=a:6===p?e[1][s[++h]]+=a+"":p?(u=t.apply(a,n(t,a,r,["",null])),e.push(u),a[0]?s[0]|=2:(s[h-2]=0,s[h]=u)):e.push(a)}return e},t=new Map;const __default__ = function(s){var r=t.get(this);return r||(r=new Map,t.set(this,r)),(r=n(this,r.get(s)||(r.set(s,r=function(n){for(var t,s,r=1,e="",u="",h=[0],p=function(n){1===r&&(n||(e=e.replace(/^\s*\n\s*|\s*\n\s*$/g,"")))?h.push(0,n,e):3===r&&(n||e)?(h.push(3,n,e),r=2):2===r&&"..."===e&&n?h.push(4,n,0):2===r&&e&&!n?h.push(5,0,!0,e):r>=5&&((e||!n&&5===r)&&(h.push(r,0,e,s),r=6),n&&(h.push(r,n,0,s),r=6)),e=""},a=0;a<n.length;a++){a&&(1===r&&p(),p(a));for(var l=0;l<n[a].length;l++)t=n[a][l],1===r?"<"===t?(p(),h=[h],r=3):e+=t:4===r?"--"===e&&">"===t?(r=1,e=""):e=t+e[0]:u?t===u?u="":e+=t:'"'===t||"'"===t?u=t:">"===t?(p(),r=1):r&&("="===t?(r=5,s=e,e=""):"/"===t&&(r<5||">"===n[a][l+1])?(p(),3===r&&(h=h[0]),r=h,(h=h[0]).push(2,0,r),r=0):" "===t||"\t"===t||"\n"===t||"\r"===t?(p(),r=2):e+=t),3===r&&"!--"===e&&(r=4,h=h[0])}return p(),h}(s)),r),arguments,[])).length>1?r:r[0]}
exports['default'] = __default__;
  });

  __wwip_define__('src/state.js', function (module, exports, __wwip_require__) {
// Minimal reactive state holder. Preact's signals package would also work,
// but we're keeping dependencies minimal; a tiny pub/sub is enough here.

const subs = new Set();

const state = {
  manifest: null,
  route: parseHash(),
  currentPage: null,        // loaded page spec JSON
  currentPageLoading: false,
  currentPageError: null,
  filters: {
    // Page-scoped filter state: currentPlant is set when the page has a plant
    // slicer; visuals look up `data_by_plant[currentPlant]` for their rendered data.
    currentPlant: null,
    // currentDateRange is set when the page has a date slicer (DATATBL.DATESTAMP).
    // Values: one of the keys from DATE_RANGES in tools/aggregate.py
    // ("last_30_days", "last_90_days", "last_12_months", "last_5_years", "all_time").
    currentDateRange: null,
  },
};

function subscribe(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}

function update(mutator) {
  mutator(state);
  for (const fn of subs) fn(state);
}

function setCurrentPlant(plant) {
  update(s => { s.filters.currentPlant = plant || null; });
}

function setCurrentDateRange(key) {
  update(s => { s.filters.currentDateRange = key || null; });
}

function parseHash() {
  const h = (window.location.hash || "").replace(/^#\/?/, "");
  if (!h || h === "home") return { slug: "home" };
  return { slug: h };
}

window.addEventListener("hashchange", () => {
  update(s => { s.route = parseHash(); });
});
exports['subscribe'] = subscribe;
exports['update'] = update;
exports['setCurrentPlant'] = setCurrentPlant;
exports['setCurrentDateRange'] = setCurrentDateRange;
exports['state'] = state;
  });

  __wwip_define__('src/data.js', function (module, exports, __wwip_require__) {
// Data loaders for manifest + per-page specs.
// Uses generated classic scripts so the dashboard can run from file://
// by double-clicking index.html in browsers that block ES modules on disk.

const CACHE = new Map();
const SCRIPT_CACHE = new Map();
const SESSION = Date.now().toString(36);

function registry() {
  if (!window.__WWIP_DATA__) {
    window.__WWIP_DATA__ = { pages: {}, custom: {} };
  }
  window.__WWIP_DATA__.pages ||= {};
  window.__WWIP_DATA__.custom ||= {};
  return window.__WWIP_DATA__;
}

function scriptHref(relPath) {
  const href = new URL(relPath, document.baseURI);
  if (window.location.protocol !== "file:") {
    href.searchParams.set("v", SESSION);
  }
  return href.href;
}

function loadScript(relPath) {
  if (SCRIPT_CACHE.has(relPath)) return SCRIPT_CACHE.get(relPath);
  const promise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = scriptHref(relPath);
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load script: ${relPath}`));
    document.head.appendChild(script);
  });
  SCRIPT_CACHE.set(relPath, promise);
  return promise;
}

async function loadManifest() {
  if (CACHE.has("__manifest__")) return CACHE.get("__manifest__");
  const data = registry();
  if (!data.manifest) {
    await loadScript("data/manifest.js");
  }
  if (!data.manifest) {
    throw new Error("Manifest data did not register correctly.");
  }
  CACHE.set("__manifest__", data.manifest);
  return data.manifest;
}

async function loadPage(slug) {
  const key = `page:${slug}`;
  if (CACHE.has(key)) return CACHE.get(key);
  const data = registry();
  if (!data.pages[slug]) {
    await loadScript(`data/pages/${slug}.js`);
  }
  if (!data.pages[slug]) {
    throw new Error(`Page data did not register for slug: ${slug}`);
  }
  CACHE.set(key, data.pages[slug]);
  return data.pages[slug];
}

async function loadCustomData(key, relPath) {
  const cacheKey = `custom:${key}`;
  if (CACHE.has(cacheKey)) return CACHE.get(cacheKey);
  const data = registry();
  if (!data.custom[key]) {
    await loadScript(relPath);
  }
  if (!data.custom[key]) {
    throw new Error(`Custom data did not register for key: ${key}`);
  }
  CACHE.set(cacheKey, data.custom[key]);
  return data.custom[key];
}
exports['loadManifest'] = loadManifest;
exports['loadPage'] = loadPage;
exports['loadCustomData'] = loadCustomData;
  });

  __wwip_define__('src/components/nav-button.js', function (module, exports, __wwip_require__) {
const { h } = __wwip_require__('app/lib/preact.module.js');
const htm = __wwip_require__('app/lib/htm.module.js').default;
// actionButton → hash-navigation to the button's target page.


const html = htm.bind(h);

function NavButton({ visual }) {
  const caption = visual.button_text || visual.title || "(untitled)";
  const target = visual.action_target_slug;
  const onClick = (e) => {
    e.preventDefault();
    if (target) window.location.hash = `#/${target}`;
  };
  return html`
    <button class="nav-button" onClick=${onClick} disabled=${!target}>
      ${caption}
    </button>
  `;
}
exports['NavButton'] = NavButton;
  });

  __wwip_define__('src/components/visual-placeholder.js', function (module, exports, __wwip_require__) {
const { h } = __wwip_require__('app/lib/preact.module.js');
const htm = __wwip_require__('app/lib/htm.module.js').default;
// Placeholder component used for every visual type that doesn't have
// a real renderer yet (phase 5E/5F will add them).


const html = htm.bind(h);

function VisualPlaceholder({ visual }) {
  const proj = visual.projections || {};
  const projSummary = Object.entries(proj)
    .filter(([, v]) => v && v.length)
    .map(([k, v]) => `${k}: ${v.join(", ")}`)
    .join(" • ");
  return html`
    <div class="visual-placeholder">
      <div class="vp-type">${visual.type}</div>
      ${visual.title && html`<div class="vp-title">${visual.title}</div>`}
      ${projSummary && html`<div class="vp-binding">${projSummary}</div>`}
    </div>
  `;
}
exports['VisualPlaceholder'] = VisualPlaceholder;
  });

  __wwip_define__('src/components/card.js', function (module, exports, __wwip_require__) {
const { h } = __wwip_require__('app/lib/preact.module.js');
const htm = __wwip_require__('app/lib/htm.module.js').default;
// Card / KPI — single metric with a title.


const html = htm.bind(h);

function fmtValue(v) {
  if (v == null) return "—";
  if (typeof v === "number") {
    const abs = Math.abs(v);
    if (Number.isInteger(v) && abs < 1e6) return v.toLocaleString();
    if (abs >= 1000)   return v.toLocaleString(undefined, { maximumFractionDigits: 1 });
    if (abs >= 1)      return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
    if (abs > 0)       return v.toLocaleString(undefined, { maximumFractionDigits: 4 });
    return "0";
  }
  return String(v);
}

function Card({ visual }) {
  const d = visual.data;
  const val = d?.value;
  const label = visual.title || (d?.binding || "").replace(/.*\./, "");
  return html`
    <div style=${{
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column", justifyContent: "center",
      padding: "8px 12px",
      background: "var(--surface-2)",
      border: "1px solid var(--border)",
      borderRadius: "4px",
    }}>
      <div style=${{
        color: "var(--muted)", fontSize: "0.7rem",
        fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>${label}</div>
      <div style=${{
        color: "var(--accent)", fontSize: "1.35rem",
        fontWeight: 700, marginTop: 2,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>${fmtValue(val)}</div>
    </div>
  `;
}
exports['Card'] = Card;
  });

  __wwip_define__('src/components/slicer.js', function (module, exports, __wwip_require__) {
const { h } = __wwip_require__('app/lib/preact.module.js');
const htm = __wwip_require__('app/lib/htm.module.js').default;
const { state, setCurrentPlant, setCurrentDateRange } = __wwip_require__('src/state.js');
// Slicer — renders a dropdown of the options the aggregator produced.
// If this is the plant slicer on its page, changing it updates the global
// filter state so downstream visuals re-render with the selected plant's data.
// If this is the date slicer, it renders a canonical-windows dropdown
// ("Last 30 days" / "Last 90 days" / …) instead of the raw 500-item date list.



const html = htm.bind(h);

function Slicer({ visual, isPlantSlicer, isDateSlicer, dateRangeOptions }) {
  const d = visual.data;
  if (!d || d.shape !== "slicer") return null;
  const label = visual.title || (d.field || "").split(".").pop();

  // Date slicer — canonical windows override the raw date options.
  if (isDateSlicer && dateRangeOptions && dateRangeOptions.length) {
    const value = state.filters.currentDateRange || "";
    const onChange = (e) => setCurrentDateRange(e.target.value || null);
    return html`
      <div style=${{
        width: "100%", height: "100%",
        display: "flex", flexDirection: "column",
        background: "var(--surface-2)",
        border: "1px solid var(--accent)",
        borderRadius: "4px",
        padding: "6px 8px",
        overflow: "hidden",
      }}>
        <div style=${{
          color: "var(--accent)",
          fontSize: "0.66rem", fontWeight: 700,
          letterSpacing: "0.04em", textTransform: "uppercase",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>Date range</div>
        <select
          value=${value}
          onChange=${onChange}
          style=${{
            marginTop: 4, padding: "4px 6px",
            background: "var(--surface)", color: "var(--text)",
            border: "1px solid var(--border)", borderRadius: "3px",
            fontSize: "0.82rem",
          }}
        >
          ${dateRangeOptions.map(o => html`<option value=${o.key}>${o.label}</option>`)}
        </select>
      </div>
    `;
  }

  const value = isPlantSlicer ? (state.filters.currentPlant || "") : "";
  const onChange = (e) => {
    if (isPlantSlicer) setCurrentPlant(e.target.value || null);
  };

  return html`
    <div style=${{
      width: "100%", height: "100%",
      display: "flex", flexDirection: "column",
      background: "var(--surface-2)",
      border: isPlantSlicer ? "1px solid var(--accent)" : "1px solid var(--border)",
      borderRadius: "4px",
      padding: "6px 8px",
      overflow: "hidden",
    }}>
      <div style=${{
        color: isPlantSlicer ? "var(--accent)" : "var(--muted)",
        fontSize: "0.66rem", fontWeight: 700,
        letterSpacing: "0.04em", textTransform: "uppercase",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>${isPlantSlicer ? "WWTP" : label}</div>
      <select
        value=${value}
        onChange=${onChange}
        style=${{
          marginTop: 4, padding: "4px 6px",
          background: "var(--surface)", color: "var(--text)",
          border: "1px solid var(--border)", borderRadius: "3px",
          fontSize: "0.82rem",
        }}
      >
        <option value="">All (${d.options.length})</option>
        ${d.options.map(o => html`<option value=${o}>${o}</option>`)}
      </select>
    </div>
  `;
}
exports['Slicer'] = Slicer;
  });

  __wwip_define__('src/components/chart-base.js', function (module, exports, __wwip_require__) {
const { h } = __wwip_require__('app/lib/preact.module.js');
const { useEffect, useRef } = __wwip_require__('app/lib/preact-hooks.module.js');
const htm = __wwip_require__('app/lib/htm.module.js').default;
// Shared Chart.js helper. Handles mount/update/unmount lifecycle,
// CoH theme palette, and responsive behavior inside the PBIX canvas.



const html = htm.bind(h);

const PALETTE = [
  "#48d0c9", "#5da8ff", "#f2c14e", "#78d39b", "#ee6c5d",
  "#a78bfa", "#fb923c", "#34d399", "#f472b6", "#facc15",
  "#d46b2d", "#41b9a8", "#e6a52e", "#cf4336", "#60a5fa",
];

// Common Chart.js defaults for this dashboard
Chart.defaults.color = "#b4c0d0";
Chart.defaults.borderColor = "rgba(139, 175, 214, 0.22)";
Chart.defaults.font.family = '"Segoe UI", Arial, sans-serif';
Chart.defaults.font.size = 11;
Chart.defaults.plugins.legend.labels.boxWidth = 12;
Chart.defaults.plugins.legend.labels.padding = 8;

function ChartWrap({ type, data, options }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    chartRef.current = new Chart(canvasRef.current, { type, data, options });
    return () => {
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
    };
  }, []);

  useEffect(() => {
    if (!chartRef.current) return;
    chartRef.current.data = data;
    chartRef.current.options = options;
    chartRef.current.update("none");
  }, [data, options]);

  return html`
    <div style="width:100%;height:100%;position:relative;">
      <canvas ref=${canvasRef}></canvas>
    </div>
  `;
}
exports['ChartWrap'] = ChartWrap;
exports['PALETTE'] = PALETTE;
  });

  __wwip_define__('src/components/xy-chart.js', function (module, exports, __wwip_require__) {
const { h } = __wwip_require__('app/lib/preact.module.js');
const htm = __wwip_require__('app/lib/htm.module.js').default;
const { ChartWrap, PALETTE } = __wwip_require__('src/components/chart-base.js');
// Renders bar/line/area charts from the `xy` / `xy_series` data shape
// produced by the aggregator.



const html = htm.bind(h);

// Inline data-labels plugin: draws a short string inside each bar segment.
// Enabled via options.plugins.inlineLabels = true; label produced from ctx.
const inlineLabelsPlugin = {
  id: "inlineLabels",
  afterDatasetsDraw(chart, _args, opts) {
    if (!opts || !opts.enabled) return;
    const { ctx } = chart;
    ctx.save();
    ctx.fillStyle = "#f4fbfd";
    ctx.font = "600 11px Inter, system-ui, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    chart.data.datasets.forEach((ds, dsIdx) => {
      const meta = chart.getDatasetMeta(dsIdx);
      if (meta.hidden) return;
      meta.data.forEach((bar, i) => {
        const v = ds.data[i];
        if (v == null || v < 6) return;  // skip tiny slivers
        const { x, y, base } = bar.getProps(["x", "y", "base"], true);
        const cx = x, cy = (y + base) / 2;
        ctx.fillText(`${Math.round(v)}%`, cx, cy);
      });
    });
    ctx.restore();
  },
};
Chart.register(inlineLabelsPlugin);

// Mapping: visual.type -> Chart.js type + default dataset extras
const TYPE_MAP = {
  clusteredColumnChart:            { chartType: "bar",  extra: {} },
  columnChart:                     { chartType: "bar",  extra: {} },
  hundredPercentStackedColumnChart:{ chartType: "bar",  extra: { stack: "s" } },
  lineChart:                       { chartType: "line", extra: { tension: 0.2 } },
  areaChart:                       { chartType: "line", extra: { tension: 0.2, fill: "origin" } },
};

// Normalize series so each column sums to 100 (for 100%-stacked).
// Negative values are clamped to 0 first (over-limit plants just show 100%/0%).
function normalize100(series) {
  if (!series || !series.length) return series;
  const n = series[0].values.length;
  // Clamp negatives to 0
  const cleaned = series.map(s => ({
    ...s,
    values: s.values.map(v => Math.max(0, v || 0)),
  }));
  // Compute per-column totals
  const totals = Array(n).fill(0);
  for (const s of cleaned) {
    for (let i = 0; i < n; i++) totals[i] += s.values[i];
  }
  // Renormalize
  return cleaned.map(s => ({
    ...s,
    values: s.values.map((v, i) => totals[i] ? v / totals[i] * 100 : 0),
  }));
}

function XYChart({ visual }) {
  const d = visual.data;
  if (!d) return null;
  const { chartType, extra } = TYPE_MAP[visual.type] || { chartType: "bar", extra: {} };
  const is100Stacked = visual.type === "hundredPercentStackedColumnChart";

  // Optional per-visual overrides (set in build_pages.py for specific charts)
  const seriesLabels = visual.series_labels || null;     // e.g. ["Capacity Utilized", "Capacity Remaining"]
  const colorOverride = visual.colors || null;           // e.g. ["#6aaed6", "#bdbdbd"]
  const showDataLabels = !!visual.show_data_labels;

  let datasets;
  if (d.shape === "xy_series") {
    const series = is100Stacked ? normalize100(d.series) : d.series;
    datasets = series.map((s, i) => {
      const c = colorOverride ? colorOverride[i % colorOverride.length] : PALETTE[i % PALETTE.length];
      return {
        label: seriesLabels ? seriesLabels[i] : s.name,
        data: s.values,
        backgroundColor: c,
        borderColor:     c,
        borderWidth: 1.5,
        pointRadius: 0,
        pointHoverRadius: 3,
        ...extra,
      };
    });
  } else if (d.shape === "xy") {
    datasets = [{
      label: visual.title || "",
      data: d.y,
      backgroundColor: PALETTE[0],
      borderColor: PALETTE[0],
      borderWidth: 1.5,
      pointRadius: 0,
      pointHoverRadius: 3,
      ...extra,
    }];
  } else {
    return null;
  }

  const hasMultipleSeries = d.shape === "xy_series" && d.series.length > 1;

  const chartData = { labels: d.x, datasets };
  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: { display: hasMultipleSeries, position: "top", align: "end" },
      title:  visual.title ? { display: true, text: visual.title, color: "#f4fbfd" } : { display: false },
      tooltip: {
        mode: "index", intersect: false,
        callbacks: is100Stacked ? {
          label: ctx => `${ctx.dataset.label}: ${ctx.parsed.y?.toFixed(1)}%`,
        } : undefined,
      },
      inlineLabels: { enabled: showDataLabels },
    },
    scales: {
      x: { ticks: { maxTicksLimit: 40, autoSkip: true }, grid: { color: "rgba(43,74,84,0.3)" } },
      y: { beginAtZero: true, grid: { color: "rgba(43,74,84,0.3)" } },
    },
    interaction: { mode: "nearest", axis: "x", intersect: false },
    animation: false,
  };
  if (is100Stacked) {
    options.scales.x.stacked = true;
    options.scales.y.stacked = true;
    options.scales.y.max = 100;
    options.scales.y.ticks = { callback: v => `${v}%` };
  }

  return html`<${ChartWrap} type=${chartType} data=${chartData} options=${options} />`;
}
exports['XYChart'] = XYChart;
  });

  __wwip_define__('src/components/combo-chart.js', function (module, exports, __wwip_require__) {
const { h } = __wwip_require__('app/lib/preact.module.js');
const htm = __wwip_require__('app/lib/htm.module.js').default;
const { ChartWrap, PALETTE } = __wwip_require__('src/components/chart-base.js');
// Line + column combo (dual Y axis)



const html = htm.bind(h);

function ComboChart({ visual }) {
  const d = visual.data;
  if (!d || d.shape !== "combo") return null;
  const colorOverride = visual.colors || null;

  const datasets = d.series.map((s, i) => {
    const isLine = s.role === "y2";
    const c = colorOverride ? colorOverride[i % colorOverride.length] : PALETTE[i % PALETTE.length];
    return {
      label: s.name,
      data: s.values,
      type: isLine ? "line" : "bar",
      yAxisID: isLine ? "y1" : "y",
      backgroundColor: c,
      borderColor:     c,
      borderWidth: isLine ? 2 : 1,
      pointRadius: 0,
      pointHoverRadius: 3,
      tension: 0,
      fill: false,
    };
  });

  const data = { labels: d.x, datasets };
  const hasRightAxis = d.series.some(s => s.role === "y2");
  const options = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: { position: "top", align: "end" },
      title:  visual.title ? { display: true, text: visual.title, color: "#f4fbfd" } : { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x:  { ticks: { maxTicksLimit: 10, autoSkip: true }, grid: { color: "rgba(43,74,84,0.3)" } },
      y:  { beginAtZero: true, grid: { color: "rgba(43,74,84,0.3)" } },
      ...(hasRightAxis ? { y1: { position: "right", beginAtZero: true, grid: { display: false } } } : {}),
    },
    interaction: { mode: "nearest", axis: "x", intersect: false },
    animation: false,
  };
  return html`<${ChartWrap} type="bar" data=${data} options=${options} />`;
}
exports['ComboChart'] = ComboChart;
  });

  __wwip_define__('src/components/table.js', function (module, exports, __wwip_require__) {
const { h } = __wwip_require__('app/lib/preact.module.js');
const htm = __wwip_require__('app/lib/htm.module.js').default;
// Flat data table. Used for tableEx and (degraded) pivotTable.


const html = htm.bind(h);
const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function fmtCell(v, fmt) {
  if (v == null) return { text: "" };
  if (fmt?.format === "percent" && typeof v === "number") {
    const decimals = fmt.decimals ?? 0;
    const text = (v * 100).toFixed(decimals) + "%";
    let bg = null;
    for (const t of (fmt.thresholds || [])) {
      if (v < t.max) { bg = t.color; break; }
    }
    return { text, bg };
  }
  if (typeof v === "number") {
    if (Number.isInteger(v) && Math.abs(v) < 1e6) return { text: v.toLocaleString() };
    return { text: v.toLocaleString(undefined, { maximumFractionDigits: 2 }) };
  }
  return { text: String(v) };
}

function cleanHeader(s) {
  let text = String(s || "");
  const aggMatch = text.match(/^[A-Z][A-Za-z0-9_.]*\((.*)\)$/);
  if (aggMatch) text = aggMatch[1];
  const hierarchyParts = text.split(".").filter(Boolean);
  if (hierarchyParts.length) text = hierarchyParts[hierarchyParts.length - 1];
  return text
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fmtDimensionCell(v, header) {
  const cleaned = String(header || "").toLowerCase();
  if (cleaned === "month" && Number.isInteger(v) && v >= 1 && v <= 12) {
    return { text: MONTH_LABELS[v - 1] };
  }
  return fmtCell(v);
}

function PivotTable({ visual, d }) {
  const rowHeaders = (d.row_fields || []).map(cleanHeader);
  return html`
    <div style=${{
      width: "100%", height: "100%", overflow: "auto",
      background: "var(--surface-2)",
      border: "1px solid var(--border)",
      borderRadius: "4px",
      fontSize: "0.78rem",
    }}>
      ${visual.title && html`<div style=${{
        padding: "6px 10px",
        color: "var(--text)", fontWeight: 600,
        borderBottom: "1px solid var(--border)",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>${visual.title}</div>`}
      <table style=${{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            ${rowHeaders.map(rh => html`<th style=${{
              position: "sticky", top: 0, background: "var(--surface-3)",
              color: "var(--muted)", fontSize: "0.68rem", fontWeight: 700,
              letterSpacing: "0.03em", textTransform: "uppercase",
              padding: "6px 8px", textAlign: "left",
              borderBottom: "1px solid var(--border)",
            }}>${rh}</th>`)}
            ${(d.col_labels || []).map(cl => html`<th style=${{
              position: "sticky", top: 0, background: "var(--surface-3)",
              color: "var(--muted)", fontSize: "0.68rem", fontWeight: 700,
              letterSpacing: "0.03em", textTransform: "uppercase",
              padding: "6px 8px", textAlign: "right",
              borderBottom: "1px solid var(--border)",
            }}>${cl}</th>`)}
          </tr>
        </thead>
        <tbody>
          ${(d.row_labels || []).map((rl, i) => html`<tr>
            ${rl.map((cell, idx) => {
              const rendered = fmtDimensionCell(cell, rowHeaders[idx]);
              return html`<td style=${{
                padding: "4px 8px", borderBottom: "1px solid rgba(43,74,84,0.35)",
                color: "var(--text)", fontWeight: 600,
                whiteSpace: "nowrap",
              }}>${rendered.text}</td>`;
            })}
            ${(d.matrix[i] || []).map(v => {
              const rendered = fmtCell(v);
              const style = {
                padding: "4px 8px", borderBottom: "1px solid rgba(43,74,84,0.35)",
                color: "var(--text)", textAlign: "right",
                whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums",
              };
              if (rendered.bg) style.backgroundColor = rendered.bg;
              return html`<td style=${style}>${rendered.text}</td>`;
            })}
          </tr>`)}
        </tbody>
      </table>
    </div>
  `;
}

function DataTable({ visual }) {
  const d = visual.data;
  if (!d) return null;
  if (d.shape === "pivot") return html`<${PivotTable} visual=${visual} d=${d} />`;
  if (d.shape !== "table") return null;
  // visual.column_labels can remap either raw queryref (e.g. "Sum(LIMITS.LIMIT_VALUE)")
  // or the auto-cleaned header (e.g. "LIMIT_VALUE") to a display name.
  const labels = visual.column_labels || {};
  // visual.column_formats keyed the same way — raw queryref OR cleaned name.
  // Values: { format: "percent", decimals?, thresholds: [{max, color}] }
  const formats = visual.column_formats || {};
  const colCleaned = d.columns.map(c =>
    c.replace(/^.*?\./, "").replace(/^[A-Z]\w*\(/, "").replace(/\)$/, ""));
  const colHeaders = d.columns.map((c, i) => labels[c] || labels[colCleaned[i]] || colCleaned[i]);
  const colFmts = d.columns.map((c, i) => formats[c] || formats[colCleaned[i]] || null);
  return html`
    <div style=${{
      width: "100%", height: "100%", overflow: "auto",
      background: "var(--surface-2)",
      border: "1px solid var(--border)",
      borderRadius: "4px",
      fontSize: "0.78rem",
    }}>
      ${visual.title && html`<div style=${{
        padding: "6px 10px",
        color: "var(--text)", fontWeight: 600,
        borderBottom: "1px solid var(--border)",
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
      }}>${visual.title}</div>`}
      <table style=${{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            ${colHeaders.map(ch => html`<th style=${{
              position: "sticky", top: 0, background: "var(--surface-3)",
              color: "var(--muted)", fontSize: "0.68rem", fontWeight: 700,
              letterSpacing: "0.03em", textTransform: "uppercase",
              padding: "6px 8px", textAlign: "left",
              borderBottom: "1px solid var(--border)",
            }}>${ch}</th>`)}
          </tr>
        </thead>
        <tbody>
          ${d.rows.slice(0, 500).map(row => html`<tr>
            ${row.map((c, i) => {
              const cell = fmtCell(c, colFmts[i]);
              const style = {
                padding: "4px 8px", borderBottom: "1px solid rgba(43,74,84,0.35)",
                color: "var(--text)",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 200,
              };
              if (cell.bg) { style.backgroundColor = cell.bg; style.fontWeight = 600; }
              if (colFmts[i]?.format === "percent") style.textAlign = "right";
              return html`<td style=${style}>${cell.text}</td>`;
            })}
          </tr>`)}
        </tbody>
      </table>
    </div>
  `;
}
exports['DataTable'] = DataTable;
  });

  __wwip_define__('src/components/index.js', function (module, exports, __wwip_require__) {
const { h } = __wwip_require__('app/lib/preact.module.js');
const htm = __wwip_require__('app/lib/htm.module.js').default;
const { NavButton } = __wwip_require__('src/components/nav-button.js');
const { VisualPlaceholder } = __wwip_require__('src/components/visual-placeholder.js');
const { Card } = __wwip_require__('src/components/card.js');
const { Slicer } = __wwip_require__('src/components/slicer.js');
const { XYChart } = __wwip_require__('src/components/xy-chart.js');
const { ComboChart } = __wwip_require__('src/components/combo-chart.js');
const { DataTable } = __wwip_require__('src/components/table.js');
// Visual-type dispatcher. Maps PBIX visualType → component.
// Any type with aggregable data (visual.data) routes to the right renderer;
// otherwise we fall back to the placeholder showing the field binding.










const html = htm.bind(h);

const REGISTRY = {
  // layout / nav
  actionButton: NavButton,
  textbox:      ({ visual }) => html`<div class="visual-textbox">${visual.textbox_text || visual.title || ""}</div>`,
  shape:        () => html`<div class="visual-shape"></div>`,
  basicShape:   () => html`<div class="visual-shape"></div>`,
  image:        () => html`<div class="visual-shape"></div>`,

  // data-bound
  card:                             Card,
  kpi:                              Card,
  slicer:                           Slicer,
  areaChart:                        XYChart,
  lineChart:                        XYChart,
  clusteredColumnChart:             XYChart,
  columnChart:                      XYChart,
  hundredPercentStackedColumnChart: XYChart,
  lineClusteredColumnComboChart:    ComboChart,
  lineStackedColumnComboChart:      ComboChart,
  tableEx:                          DataTable,
  pivotTable:                       DataTable,   // degrades to flat table for now
};

// For a visual with `data_by_plant` and a current plant selection, project
// that plant's data onto `data`. Returns a shallow-cloned visual so we don't
// mutate the cached page spec.
function projectForPlant(visual, currentPlant) {
  if (!currentPlant) return visual;
  if (!visual.data_by_plant) return visual;
  const sliced = visual.data_by_plant[currentPlant];
  if (!sliced) return visual;  // plant has no data for this visual
  return { ...visual, data: sliced };
}

// Same idea for date-range. Precedence is evaluated in VisualRouter: if both
// a plant and a date-range are active, the date-range projection wins because
// the precomputed date-range dicts aren't per-plant in this pass.
function projectForDateRange(visual, currentDateRange) {
  if (!currentDateRange) return visual;
  if (!visual.data_by_date_range) return visual;
  const sliced = visual.data_by_date_range[currentDateRange];
  if (!sliced) return visual;
  return { ...visual, data: sliced };
}

function VisualRouter({ visual, plantSlicerName, plantSlicerField, currentPlant,
                               dateSlicerName, dateSlicerField, currentDateRange, dateRangeOptions }) {
  const Comp = REGISTRY[visual.type];
  if (!Comp) return html`<${VisualPlaceholder} visual=${visual} />`;
  if (Comp === NavButton) return html`<${Comp} visual=${visual} />`;
  if (Comp === Slicer) {
    const field = visual.data?.field || null;
    const isPlantSlicer = Boolean(
      (plantSlicerName && visual.name === plantSlicerName) ||
      (plantSlicerField && field === plantSlicerField)
    );
    const isDateSlicer = Boolean(
      (dateSlicerName && visual.name === dateSlicerName) ||
      (dateSlicerField && field === dateSlicerField)
    );
    return html`<${Slicer} visual=${visual}
                          isPlantSlicer=${isPlantSlicer}
                          isDateSlicer=${isDateSlicer}
                          dateRangeOptions=${dateRangeOptions} />`;
  }
  // Other data-bound components.
  // Priority: plant > date-range. Plant-sliced data is per-WWTP and specific;
  // date-range data is an all-plants aggregate. Only fall through to date-range
  // when the visual has no per-plant data (e.g. pages with only a date slicer).
  let effective = visual;
  if (currentPlant && visual.data_by_plant?.[currentPlant]) {
    effective = projectForPlant(effective, currentPlant);
  } else if (currentDateRange && visual.data_by_date_range?.[currentDateRange]) {
    effective = projectForDateRange(effective, currentDateRange);
  }
  if (Comp === Card || Comp === XYChart || Comp === ComboChart || Comp === DataTable) {
    if (!effective.data) return html`<${VisualPlaceholder} visual=${visual} />`;
  }
  return html`<${Comp} visual=${effective} />`;
}
exports['VisualRouter'] = VisualRouter;
  });

  __wwip_define__('src/pages/page.js', function (module, exports, __wwip_require__) {
const { h } = __wwip_require__('app/lib/preact.module.js');
const htm = __wwip_require__('app/lib/htm.module.js').default;
const { VisualRouter } = __wwip_require__('src/components/index.js');
// Generic page renderer — turns a page spec into absolute-positioned visuals
// on the PBIX canvas (1280×720 default). The parent .page-canvas handles scaling.




const html = htm.bind(h);

function PageCanvas({ page, currentPlant, currentDateRange }) {
  const { width = 1280, height = 720 } = page.canvas || {};
  const plantSlicerName = page.plant_slicer?.visual_name || null;
  const plantSlicerField = page.plant_slicer?.field || null;
  const dateSlicerName  = page.date_slicer?.visual_name  || null;
  const dateSlicerField = page.date_slicer?.field || null;
  const dateRangeOptions = page.date_slicer?.options || null;
  const keepSlicerByField = new Map();
  for (const visual of (page.visuals || [])) {
    if (visual.type !== "slicer") continue;
    const field = visual.data?.field || null;
    if (!field) continue;
    if (field !== plantSlicerField && field !== dateSlicerField) continue;
    const prev = keepSlicerByField.get(field);
    const z = visual.position?.z || 0;
    const prevZ = prev?.position?.z || 0;
    if (!prev || z >= prevZ) keepSlicerByField.set(field, visual);
  }

  const visuals = (page.visuals || []).filter((visual) => {
    if (visual.type !== "slicer") return true;
    const field = visual.data?.field || null;
    if (!field) return true;
    const keeper = keepSlicerByField.get(field);
    if (!keeper) return true;
    return keeper.name === visual.name;
  });

  return html`
    <div class="page-canvas" style=${{ width: `${width}px`, height: `${height}px` }}>
      ${visuals.map(v => {
        const { x = 0, y = 0, width: w = 200, height: hh = 50, z = 0 } = v.position || {};
        const style = {
          left:   `${x}px`,
          top:    `${y}px`,
          width:  `${w}px`,
          height: `${hh}px`,
          zIndex: z,
        };
        return html`<div class="visual" style=${style} key=${v.name}>
          <${VisualRouter} visual=${v}
                          plantSlicerName=${plantSlicerName}
                          plantSlicerField=${plantSlicerField}
                          currentPlant=${currentPlant}
                          dateSlicerName=${dateSlicerName}
                          dateSlicerField=${dateSlicerField}
                          currentDateRange=${currentDateRange}
                          dateRangeOptions=${dateRangeOptions} />
        </div>`;
      })}
    </div>
  `;
}
exports['PageCanvas'] = PageCanvas;
  });

  __wwip_define__('src/date-range.js', function (module, exports, __wwip_require__) {
const CUSTOM_DATE_RANGE_KEY = "custom";

const DATE_DAY_RANGES = {
  last_30_days: 30,
  last_90_days: 90,
  last_12_months: 365,
  last_5_years: 1825,
  all_time: null,
};

function parseIsoDate(value) {
  if (!value) return null;
  const parts = String(value).slice(0, 10).split("-").map(Number);
  if (parts.length < 3 || parts.some(Number.isNaN)) return null;
  return new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
}

function formatIsoDate(dt) {
  return dt ? dt.toISOString().slice(0, 10) : "";
}

function addUtcDays(value, days) {
  const dt = parseIsoDate(value);
  if (!dt) return "";
  dt.setUTCDate(dt.getUTCDate() + days);
  return formatIsoDate(dt);
}

function startOfUtcMonth(value) {
  const dt = parseIsoDate(value);
  if (!dt) return "";
  dt.setUTCDate(1);
  return formatIsoDate(dt);
}

function addUtcMonths(value, months) {
  const dt = parseIsoDate(value);
  if (!dt) return "";
  const yearMonth = (dt.getUTCFullYear() * 12 + dt.getUTCMonth()) + months;
  const year = Math.floor(yearMonth / 12);
  const month = yearMonth % 12;
  return formatIsoDate(new Date(Date.UTC(year, month, 1)));
}

function normalizeBounds(start, end) {
  const a = start ? String(start).slice(0, 10) : "";
  const b = end ? String(end).slice(0, 10) : "";
  if (!a && !b) return null;
  if (!a) return { start: b, end: b };
  if (!b) return { start: a, end: a };
  return a <= b ? { start: a, end: b } : { start: b, end: a };
}

function withCustomDateOption(options = []) {
  if (options.some((opt) => opt?.key === CUSTOM_DATE_RANGE_KEY)) return options;
  return [...options, { key: CUSTOM_DATE_RANGE_KEY, label: "Custom range" }];
}

function getPresetBounds(range, anchorDate, config = {}) {
  if (!range || range === "all_time" || range === CUSTOM_DATE_RANGE_KEY || !anchorDate) return null;

  const calendarMonthRanges = config.calendarMonthRanges || {};
  const calendarMonths = calendarMonthRanges[range];
  if (calendarMonths) {
    const monthStart = startOfUtcMonth(anchorDate);
    if (!monthStart) return null;
    return normalizeBounds(
      addUtcMonths(monthStart, -calendarMonths),
      addUtcDays(monthStart, -1),
    );
  }

  const days = DATE_DAY_RANGES[range];
  if (!days) return null;
  return normalizeBounds(addUtcDays(anchorDate, -days), formatIsoDate(parseIsoDate(anchorDate)));
}

function getActiveBounds({ range, anchorDate, customStart, customEnd, calendarMonthRanges }) {
  if (range === CUSTOM_DATE_RANGE_KEY) {
    return normalizeBounds(customStart, customEnd);
  }
  return getPresetBounds(range, anchorDate, { calendarMonthRanges });
}

function inferSeriesBounds(data) {
  const xs = data?.x || [];
  if (!xs.length) return null;
  const dates = xs.map((x) => String(x).slice(0, 10)).filter(Boolean);
  if (!dates.length) return null;
  return normalizeBounds(dates[0], dates[dates.length - 1]);
}

function inferMonthMatrixBounds(data) {
  const months = data?.months || [];
  if (!months.length) return null;
  const first = months[0];
  const last = months[months.length - 1];
  return normalizeBounds(
    `${first.yr}-${String(first.mo).padStart(2, "0")}-01`,
    `${last.yr}-${String(last.mo).padStart(2, "0")}-01`,
  );
}

function filterSeriesByBounds(data, bounds) {
  if (!data || !bounds?.start || !bounds?.end) return data;
  const xs = data.x || [];
  const keep = [];
  for (let i = 0; i < xs.length; i += 1) {
    const x = String(xs[i]).slice(0, 10);
    if (x >= bounds.start && x <= bounds.end) keep.push(i);
  }
  if (keep.length === xs.length) return data;
  return {
    ...data,
    x: keep.map((i) => xs[i]),
    series: (data.series || []).map((series) => ({
      ...series,
      values: keep.map((i) => series.values?.[i]),
    })),
    y: data.y ? keep.map((i) => data.y[i]) : undefined,
  };
}

function filterMonthMatrixByBounds(data, bounds) {
  if (!data || !bounds?.start || !bounds?.end) return data;
  const months = (data.months || []).filter(({ yr, mo }) => {
    const key = `${yr}-${String(mo).padStart(2, "0")}-01`;
    return key >= bounds.start && key <= bounds.end;
  });
  if (months.length === (data.months || []).length) return data;

  const grouped = new Map();
  const values = {};
  for (const { yr, mo } of months) {
    const key = `${yr}-${mo}`;
    const value = data.values?.[key];
    values[key] = value;
    if (!grouped.has(yr)) grouped.set(yr, []);
    if (value != null) grouped.get(yr).push(value);
  }
  for (const [yr, yrValues] of grouped.entries()) {
    if (!yrValues.length) {
      values[`${yr}-total`] = null;
    } else if (data.agg === "sum") {
      values[`${yr}-total`] = yrValues.reduce((sum, value) => sum + value, 0);
    } else {
      values[`${yr}-total`] = yrValues.reduce((sum, value) => sum + value, 0) / yrValues.length;
    }
  }
  return { ...data, months, values };
}

function getRoleSeries(data, role) {
  const series = data?.series || [];
  if (!series.length) return null;
  if (role == null) return series[0] || null;
  return series.find((item) => item.role === role) || null;
}

function numericValues(values = []) {
  return values.filter((value) => typeof value === "number" && Number.isFinite(value));
}

function maxNumeric(values = []) {
  const nums = numericValues(values);
  return nums.length ? Math.max(...nums) : null;
}

function averageNumeric(values = []) {
  const nums = numericValues(values);
  if (!nums.length) return null;
  return nums.reduce((sum, value) => sum + value, 0) / nums.length;
}

function sampleStdDevNumeric(values = []) {
  const nums = numericValues(values);
  if (nums.length < 2) return nums.length === 1 ? 0 : null;
  const avg = averageNumeric(nums);
  const variance = nums.reduce((sum, value) => sum + ((value - avg) ** 2), 0) / (nums.length - 1);
  return Math.sqrt(variance);
}

function monthMatrixValues(data) {
  return (data?.months || []).map(({ yr, mo }) => data?.values?.[`${yr}-${mo}`]);
}
exports['withCustomDateOption'] = withCustomDateOption;
exports['getPresetBounds'] = getPresetBounds;
exports['getActiveBounds'] = getActiveBounds;
exports['inferSeriesBounds'] = inferSeriesBounds;
exports['inferMonthMatrixBounds'] = inferMonthMatrixBounds;
exports['filterSeriesByBounds'] = filterSeriesByBounds;
exports['filterMonthMatrixByBounds'] = filterMonthMatrixByBounds;
exports['getRoleSeries'] = getRoleSeries;
exports['numericValues'] = numericValues;
exports['maxNumeric'] = maxNumeric;
exports['averageNumeric'] = averageNumeric;
exports['sampleStdDevNumeric'] = sampleStdDevNumeric;
exports['monthMatrixValues'] = monthMatrixValues;
exports['CUSTOM_DATE_RANGE_KEY'] = CUSTOM_DATE_RANGE_KEY;
exports['DATE_DAY_RANGES'] = DATE_DAY_RANGES;
  });

  __wwip_define__('src/pages/permit-summary.js', function (module, exports, __wwip_require__) {
const { h } = __wwip_require__('app/lib/preact.module.js');
const { useMemo, useState } = __wwip_require__('app/lib/preact-hooks.module.js');
const htm = __wwip_require__('app/lib/htm.module.js').default;
const {
  CUSTOM_DATE_RANGE_KEY,
  getActiveBounds,
  getPresetBounds,
  maxNumeric,
  averageNumeric,
  withCustomDateOption,
} = __wwip_require__('src/date-range.js');
// Bespoke page for (Tables) Permitted Capacity Evaluation PBI.
// Renders its own header; app.js skips the generic topbar for this slug.




const html = htm.bind(h);

const C = {
  bg:     "#071423",
  panel:  "#0f2440",
  panel2: "#102845",
  line:   "rgba(110,155,205,.18)",
  text:   "#eef4fb",
  muted:  "#9aaec6",
  accent: "#25d7d7",
  green:  "#0d5f59",
  shadow: "0 10px 30px rgba(0,0,0,.28)",
  r:      16,
};

function card(extra) {
  return {
    background: `linear-gradient(180deg,${C.panel2},${C.panel})`,
    border: `1px solid ${C.line}`,
    borderRadius: C.r,
    boxShadow: C.shadow,
    ...extra,
  };
}

function buildCustomTableData(visual, bounds) {
  const source = visual?.custom_range_source;
  if (!source?.plants?.length) return visual?.data;

  const rows = [];
  for (const plant of source.plants) {
    const plantRows = source.rows_by_plant?.[plant];
    if (!plantRows?.x?.length) continue;

    const activeIdx = [];
    for (let i = 0; i < plantRows.x.length; i += 1) {
      const x = String(plantRows.x[i]).slice(0, 10);
      if (!bounds?.start || !bounds?.end || (x >= bounds.start && x <= bounds.end)) {
        activeIdx.push(i);
      }
    }
    const useFallback = !activeIdx.length
      && bounds?.start
      && bounds?.end
      && source.fallback_mode === "all_time_when_empty";
    if (!activeIdx.length && !useFallback && bounds?.start && bounds?.end) continue;

    const keep = activeIdx.length ? activeIdx : plantRows.x.map((_, i) => i);
    const metricVals = keep.map((i) => plantRows.value?.[i]);
    const permitVals = keep.map((i) => plantRows.permit?.[i]);
    const metric = maxNumeric(metricVals);
    const permit = averageNumeric(permitVals);
    if (metric == null) continue;
    rows.push([plant, metric, (metric != null && permit) ? (metric / permit) : null]);
  }

  return {
    ...(visual?.data || {}),
    rows,
  };
}

// ── PBIX-matched conditional formatting ────────────────────────────
function pbixCellStyle(kind, value) {
  if (value == null || typeof value !== "number") return null;

  if (kind === "permit-pct") {
    if (value >= 0.65 && value < 0.70) return { backgroundColor: "#f7e9b5", color: "#111827" };
    if (value >= 0.70 && value < 0.75) return { backgroundColor: "#ECC846", color: "#111827" };
    if (value >= 0.75 && value < 0.90) return { backgroundColor: "#CD4C46", color: "#111827" };
    if (value >= 0.90 && value < 1.50) return { backgroundColor: "#666666", color: "#eef4fb" };
    return null;
  }

  if (kind === "permit-limit") {
    if (value === 1) return { backgroundColor: "#ECC846", color: "#111827" };
    if (value > 0 && value < 1) return { backgroundColor: "#73B761", color: "#111827" };
  }

  return null;
}

// ── Custom table card ─────────────────────────────────────────────
function TableCard({ title, icon, visual, colCfg, children }) {
  const rows = visual?.data?.rows || [];
  const cols = colCfg.length;
  const gridCols = colCfg.map(c => c.fr || "1fr").join(" ");
  return html`
    <section style=${card({ padding: 14, display: "flex", flexDirection: "column", overflow: "hidden" })}>
      <div style=${{ fontWeight: 800, fontSize: 14, marginBottom: 10, display: "flex", alignItems: "center", gap: 7 }}>
        <span style=${{ color: C.accent }}>${icon}</span>
        <span style=${{ color: C.text }}>${title}</span>
      </div>
      <!-- header row -->
      <div style=${{ display: "grid", gridTemplateColumns: gridCols, gap: 8, color: C.muted, fontSize: 11, fontWeight: 700, borderBottom: `1px solid ${C.line}`, paddingBottom: 7, marginBottom: 3 }}>
        ${colCfg.map(c => html`<div style=${{ textTransform: "uppercase", letterSpacing: "0.04em" }}>${c.label}</div>`)}
      </div>
      <!-- data rows -->
      <div style=${{ flex: 1, overflowY: "auto" }}>
        ${rows.map((row, ri) => html`
          <div key=${ri} style=${{ display: "grid", gridTemplateColumns: gridCols, gap: 8, padding: "4px 0", fontSize: 12.5, borderBottom: `1px solid rgba(255,255,255,.04)` }}>
            ${colCfg.map((c, ci) => {
              const val = row[c.col ?? ci];
              let text = val == null ? "—"
                : typeof val === "number"
                  ? c.pct
                    ? `${(val * 100).toFixed(c.digits ?? 2)}%`
                    : val.toLocaleString(undefined, {
                        minimumFractionDigits: c.minDigits ?? 0,
                        maximumFractionDigits: c.maxDigits ?? 2,
                      })
                  : String(val);
              const cellStyle = pbixCellStyle(c.style, val);
              return html`<div style=${{
                ...(cellStyle ? { ...cellStyle, borderRadius: 0, padding: "2px 5px", fontWeight: 600 } : {}),
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>${text}</div>`;
            })}
          </div>
        `)}
      </div>
      ${children}
    </section>
  `;
}

// ── Stat chip (top-right) ─────────────────────────────────────────
function StatChip({ icon, label, value, valueColor }) {
  return html`
    <div style=${card({ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, minWidth: 140 })}>
      <span style=${{ fontSize: "1.4rem", opacity: 0.8 }}>${icon}</span>
      <div>
        <div style=${{ color: C.muted, fontSize: 11 }}>${label}</div>
        <div style=${{ fontSize: "1.3rem", fontWeight: 800, lineHeight: 1.1, color: valueColor || C.text }}>${value}</div>
      </div>
    </div>
  `;
}

// ── Sidebar nav button ────────────────────────────────────────────
function SideNavBtn({ btn, active }) {
  return html`
    <button onClick=${() => { if (btn.action_target_slug) window.location.hash = `#/${btn.action_target_slug}`; }}
      style=${{
        padding: "14px 16px", borderRadius: 13,
        border: `1px solid ${C.line}`,
        background: active
          ? `linear-gradient(180deg,${C.green},#0b4e49)`
          : `linear-gradient(180deg,#102743,#0d2139)`,
        color: active ? C.accent : C.muted,
        fontFamily: "inherit", fontWeight: 700, fontSize: 13,
        textAlign: "left", cursor: "pointer", width: "100%",
        transition: "background 0.12s, color 0.12s",
        display: "flex", alignItems: "center", gap: 10,
      }}>
      <span style=${{ opacity: 0.7, fontSize: "0.95rem" }}>☰</span>
      ${btn.button_text || btn.title || "—"}
    </button>
  `;
}

// ── Main export ────────────────────────────────────────────────────
function PermitSummaryPage({ page, manifest, currentDateRange }) {
  const visuals = page.visuals || [];
  const dateOpts = page.date_slicer?.options || [];
  const anchor = page.date_slicer?.anchor_date || "";
  const initialRange = currentDateRange || page.date_slicer?.default || "last_5_years";
  const calendarMonthRanges = { last_12_months: 12, last_5_years: 60 };
  const initialBounds = getPresetBounds(initialRange, anchor, { calendarMonthRanges }) || { start: "", end: "" };
  const [range, setRange] = useState(initialRange);
  const [customStart, setCustomStart] = useState(initialBounds.start || "");
  const [customEnd, setCustomEnd] = useState(initialBounds.end || "");
  const dateOptions = useMemo(() => withCustomDateOption(dateOpts), [dateOpts]);
  const activeBounds = useMemo(() => getActiveBounds({
    range,
    anchorDate: anchor,
    customStart,
    customEnd,
    calendarMonthRanges,
  }), [range, anchor, customStart, customEnd]);

  // Project for date range
  function proj(v) {
    if (!v) return v;
    if (v.custom_range_source) {
      return {
        ...v,
        data: buildCustomTableData(v, activeBounds),
      };
    }
    if (range && v.data_by_date_range?.[range]) {
      return { ...v, data: v.data_by_date_range[range] };
    }
    return v;
  }

  const npdesVis = proj(visuals.find(v => (v.title || "").includes("NPDES")));
  const aafVis   = proj(visuals.find(v => (v.title || "").includes("Permit Evaluation, AAF")));
  const r7590Vis = proj(visuals.find(v => (v.title || "").includes("75/90")));

  const npdesRows = npdesVis?.data?.rows || [];

  const navBtns = useMemo(() =>
    visuals.filter(v => v.type === "actionButton" && v.action_target_slug && !/^home$/i.test(v.button_text || "")),
  [visuals]);

  const violations = (manifest?.totals?.violations || 0).toLocaleString();
  const plants     = manifest?.totals?.plants || 0;
  const refresh    = (manifest?.last_refresh || "—").slice(0, 10);

  return html`
    <div style=${{
      background: `radial-gradient(circle at 20% 10%,rgba(37,79,140,.2),transparent 26%),linear-gradient(180deg,#05101d,${C.bg})`,
      minHeight: "100vh", color: C.text, fontFamily: "Inter, system-ui, sans-serif",
      fontSize: 14, overflowY: "auto",
    }}>
      <div style=${{ padding: 18, display: "grid", gap: 14 }}>

        <!-- TOP ROW -->
        <div style=${{ display: "grid", gridTemplateColumns: "64px 1fr auto", gap: 16, alignItems: "start" }}>
          <button onClick=${() => { window.location.hash = "#/home"; }}
            style=${card({ height: 64, display: "grid", placeItems: "center", fontSize: 28, color: C.muted, cursor: "pointer" })}>←</button>

          <div>
            <small style=${{ display: "block", color: C.accent, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em", fontSize: 11, marginBottom: 4 }}>
              City of Houston — Public Works &amp; Engineering
            </small>
            <h1 style=${{ margin: 0, fontSize: 28, fontWeight: 800, lineHeight: 1.05 }}>
              WWiP Plant-Intelligence-System <span style=${{ color: C.accent }}>· Permitted Capacity Evaluation PBI</span>
            </h1>
          </div>

          <div style=${{ display: "grid", gridTemplateColumns: "repeat(3,auto)", gap: 12 }}>
            <${StatChip} icon="💧" label="Violations"   value=${violations} />
            <${StatChip} icon="🏭" label="Plants"       value=${plants} />
            <${StatChip} icon="📅" label="Last refresh" value=${refresh} valueColor=${C.accent} />
          </div>
        </div>

        <!-- MAIN 3-COL LAYOUT -->
        <div style=${{ display: "grid", gridTemplateColumns: "270px 1fr", gap: 14 }}>

          <!-- LEFT SIDEBAR -->
          <aside style=${{ display: "grid", gap: 14, alignContent: "start" }}>
            <div style=${card({ padding: 14 })}>
              <div style=${{ color: C.accent, fontWeight: 800, textTransform: "uppercase", fontSize: 12, marginBottom: 10 }}>Date Range</div>
              <select value=${range}
                onChange=${e => setRange(e.target.value || "")}
                style=${{
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                  padding: "11px 14px", border: `1px solid ${C.line}`, borderRadius: 12,
                  background: "#0a1c31", color: C.text, fontFamily: "inherit",
                  fontSize: 13, width: "100%",
                }}>
                ${dateOptions.map(o => html`<option value=${o.key}>${o.label}</option>`)}
              </select>
              ${range === CUSTOM_DATE_RANGE_KEY && html`
                <div style=${{ display: "grid", gap: 8, marginTop: 10 }}>
                  <input type="date" value=${customStart} max=${customEnd || undefined} onInput=${e => setCustomStart(e.target.value)}
                    style=${{
                      width: "100%", padding: "11px 14px", border: `1px solid ${C.line}`, borderRadius: 12,
                      background: "#0a1c31", color: C.text, fontFamily: "inherit", fontSize: 13,
                    }} />
                  <input type="date" value=${customEnd} min=${customStart || undefined} onInput=${e => setCustomEnd(e.target.value)}
                    style=${{
                      width: "100%", padding: "11px 14px", border: `1px solid ${C.line}`, borderRadius: 12,
                      background: "#0a1c31", color: C.text, fontFamily: "inherit", fontSize: 13,
                    }} />
                </div>
              `}
            </div>
            <div style=${{ display: "grid", gap: 10 }}>
              ${navBtns.map(btn => html`<${SideNavBtn} btn=${btn} active=${false} />`)}
            </div>
          </aside>

          <!-- CENTER: 3 TABLE CARDS -->
          <div style=${{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1.15fr", gap: 14, minWidth: 0 }}>
            <${TableCard} icon="🛡" title="NPDES Permit Limits" visual=${npdesVis}
              colCfg=${[
                { label: "WWTP", fr: "1.3fr" },
                { label: "Permit Limit (mgd)", fr: ".9fr", minDigits: 2, maxDigits: 2, style: "permit-limit" },
              ]}
            />
            <${TableCard} icon="📈" title="Permit Evaluation, AAF" visual=${aafVis}
              colCfg=${[
                { label: "WWTP", fr: "1.05fr" },
                { label: "Max CurVal (mgd)", fr: ".9fr", minDigits: 2, maxDigits: 2 },
                { label: "Max AAF%", fr: ".9fr", pct: true, col: 2, digits: 0, style: "permit-pct" },
              ]}
            />
            <${TableCard} icon="⚖" title="Permit Evaluation, 75/90 (≤1 mgd)" visual=${r7590Vis}
              colCfg=${[
                { label: "WWTP", fr: "1.05fr" },
                { label: "Rolling 3mo Max", fr: ".9fr", minDigits: 2, maxDigits: 2 },
                { label: "% of Permit", fr: ".9fr", pct: true, col: 2, digits: 2, style: "permit-pct" },
              ]}
            />
          </div>
        </div>

        <!-- FOOTER -->
        <div style=${{ display: "flex", justifyContent: "space-between", color: C.muted, paddingTop: 6, borderTop: `1px solid rgba(255,255,255,.08)`, fontSize: 11 }}>
          <div>All flows in mgd (million gallons per day). Data refreshed daily.</div>
          <div>Questions or feedback? Contact <span style=${{ color: C.accent }}>WWIP Support</span></div>
        </div>
      </div>
    </div>
  `;
}
exports['PermitSummaryPage'] = PermitSummaryPage;
  });

  __wwip_define__('src/pages/home-nav.js', function (module, exports, __wwip_require__) {
const { h } = __wwip_require__('app/lib/preact.module.js');
const { useEffect, useMemo, useState } = __wwip_require__('app/lib/preact-hooks.module.js');
const htm = __wwip_require__('app/lib/htm.module.js').default;
const html = htm.bind(h);

const CANVAS_W = 1280;
const CANVAS_H = 720;

function useCanvasScale(width, height) {
  const [layout, setLayout] = useState({ scale: 1, wrapW: width, wrapH: height });

  useEffect(() => {
    const recompute = () => {
      const availW = Math.max(window.innerWidth - 48, 320);
      const availH = Math.max(window.innerHeight - 24, 320);
      const scale = Math.min(availW / width, availH / height);
      setLayout({
        scale,
        wrapW: width * scale,
        wrapH: height * scale,
      });
    };

    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [width, height]);

  return layout;
}

function normalizeCaption(caption) {
  if (caption === "Permit Evaluation Summay Tables") return "Permit Evaluation Summary Tables";
  return caption;
}

function NavButton({ item }) {
  const { position = {}, target_slug: targetSlug } = item;
  const style = {
    position: "absolute",
    left: `${position.x || 0}px`,
    top: `${position.y || 0}px`,
    width: `${position.width || 120}px`,
    height: `${position.height || 40}px`,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "4px 12px",
    borderRadius: 8,
    border: "1px solid rgba(93,129,177,0.24)",
    background: "#10233d",
    color: "#f4f7fb",
    fontFamily: "Inter, sans-serif",
    fontSize: "14px",
    fontWeight: 700,
    lineHeight: 1.2,
    cursor: targetSlug ? "pointer" : "default",
    boxSizing: "border-box",
    boxShadow: "0 8px 18px rgba(0,0,0,0.16)",
    transition: "background 0.12s, border-color 0.12s, transform 0.12s",
    overflow: "hidden",
  };

  return html`
    <button
      key=${`${item.caption}-${position.x}-${position.y}`}
      onClick=${() => { if (targetSlug) window.location.hash = `#/${targetSlug}`; }}
      style=${style}
      onMouseEnter=${(e) => {
        e.currentTarget.style.background = "rgba(40,215,215,0.10)";
        e.currentTarget.style.borderColor = "rgba(40,215,215,0.42)";
        e.currentTarget.style.transform = "translateY(-1px)";
      }}
      onMouseLeave=${(e) => {
        e.currentTarget.style.background = "#10233d";
        e.currentTarget.style.borderColor = "rgba(93,129,177,0.24)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <span style=${{
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        width: "100%",
      }}>
        ${normalizeCaption(item.caption || "—")}
      </span>
    </button>
  `;
}

function HomeNavPage({ manifest }) {
  const homeNav = useMemo(
    () => [...(manifest?.home_nav || [])].sort((a, b) => (a.position?.z || 0) - (b.position?.z || 0)),
    [manifest],
  );
  const { scale, wrapW, wrapH } = useCanvasScale(CANVAS_W, CANVAS_H);
  const refresh = (manifest?.last_refresh || "—").replace("T", " ").replace(".000000", "");

  return html`
    <div style=${{
      minHeight: "100vh",
      background: "#071426",
      color: "#f4f7fb",
      fontFamily: "Inter, sans-serif",
      overflow: "hidden",
      padding: 12,
      boxSizing: "border-box",
      display: "grid",
      placeItems: "center",
    }}>
      <div style=${{ width: `${wrapW}px`, height: `${wrapH}px` }}>
        <div style=${{
          width: `${CANVAS_W}px`,
          height: `${CANVAS_H}px`,
          position: "relative",
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}>
          <div style=${{
            position: "absolute",
            left: "0px",
            top: "0px",
            width: "1280px",
            height: "56px",
            borderRadius: 10,
            border: "1px solid rgba(93,129,177,0.24)",
            background: "#10233d",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 24px",
            boxSizing: "border-box",
          }}>
            <div style=${{
              fontSize: "34px",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
            }}>
              WWiP Plant-Intelligence-System
            </div>
            <div style=${{
              fontSize: "15px",
              color: "#28d7d7",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}>
              transforms HachWIMS laboratory and process data into actionable insights
            </div>
          </div>

          <div style=${{
            position: "absolute",
            left: "14px",
            top: "58px",
            display: "flex",
            gap: "16px",
            alignItems: "center",
            color: "#a9b8cc",
            fontSize: "13px",
            fontWeight: 600,
          }}>
            <span style=${{ color: "#28d7d7", textTransform: "uppercase", letterSpacing: "0.06em" }}>Last Refreshed:</span>
            <span>${refresh}</span>
          </div>

          ${homeNav.map((item) => html`<${NavButton} key=${`${item.caption}-${item.position?.z || 0}`} item=${item} />`)}
        </div>
      </div>
    </div>
  `;
}
exports['HomeNavPage'] = HomeNavPage;
  });

  __wwip_define__('src/pages/daily-effluent-flow.js', function (module, exports, __wwip_require__) {
const { h, Fragment } = __wwip_require__('app/lib/preact.module.js');
const { useState, useMemo } = __wwip_require__('app/lib/preact-hooks.module.js');
const htm = __wwip_require__('app/lib/htm.module.js').default;
const { ChartWrap } = __wwip_require__('src/components/chart-base.js');
const {
  CUSTOM_DATE_RANGE_KEY,
  filterSeriesByBounds,
  getActiveBounds,
  getPresetBounds,
  inferSeriesBounds,
  withCustomDateOption,
} = __wwip_require__('src/date-range.js');
// Bespoke page for DT Daily Effluent Flow (dt-daily-effluent-flow).
// Renders as: back btn + title | WWTP sidebar | meta row + 3 bar charts.





const html = htm.bind(h);

const C = {
  bg:     "#071425",
  bg2:    "#0c1d34",
  card:   "#10253f",
  line:   "rgba(120,170,220,.16)",
  text:   "#eef4fb",
  muted:  "#9db0c7",
  accent: "#27d7d7",
  purple: "#8d6be8",
  orange: "#ef9447",
  green:  "#72c98f",
  red:    "#d74c45",
};

// ── Find a visual by title substring ──────────────────────────────
function findVis(visuals, substr) {
  return visuals.find(v => (v.title || "").toLowerCase().includes(substr.toLowerCase()));
}

// ── Get best data for a visual given plant + date range ───────────
function resolve(visual, plant, bounds) {
  if (!visual) return null;
  const byPlant = visual.data_by_plant;
  if (plant && byPlant?.[plant]) {
    return filterSeriesByBounds(byPlant[plant], bounds);
  }
  return filterSeriesByBounds(visual.data, bounds);
}

// ── Bar chart component ────────────────────────────────────────────
function BarChart({ title, icon, data, color, limitColor, height = 160 }) {
  if (!data) return null;
  const xs    = data.x || [];
  const series = data.series || [];
  const mainS  = series.find(s => s.role === "y"  || !s.role) || series[0];
  const limitS = series.find(s => s.role === "y2") || null;
  if (!mainS) return null;

  const datasets = [{
    label: mainS.name,
    data: mainS.values || [],
    backgroundColor: color,
    borderColor: color,
    borderWidth: 0,
    borderRadius: 2,
    type: "bar",
  }];
  if (limitS) {
    const limitVal = (limitS.values || []).find(v => v != null);
    if (limitVal != null) {
      datasets.push({
        label: limitS.name,
        data: Array(xs.length).fill(limitVal),
        type: "line",
        borderColor: limitColor || C.red,
        borderWidth: 2.5,
        pointRadius: 0,
        fill: false,
        tension: 0,
      });
    }
  }

  const chartData = { labels: xs, datasets };
  const opts = {
    responsive: true, maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: { display: true, position: "top", align: "start",
        labels: { color: C.muted, font: { size: 11 }, boxWidth: 10, padding: 10 } },
      tooltip: { mode: "index", intersect: false,
        callbacks: { title: ctx => ctx[0]?.label || "" } },
    },
    scales: {
      x: { ticks: { color: C.muted, font: { size: 9 }, maxTicksLimit: 8 },
           grid: { color: "rgba(255,255,255,0.05)" } },
      y: { ticks: { color: C.muted, font: { size: 9 } },
           grid: { color: "rgba(255,255,255,0.05)" },
           beginAtZero: true },
    },
  };

  return html`
    <div style=${{
      background: `linear-gradient(180deg,${C.card},#0d2139)`,
      border: `1px solid ${C.line}`, borderRadius: 14,
      padding: "14px 16px",
    }}>
      <h2 style=${{ margin: "0 0 4px", fontSize: 16, color: C.accent, display: "flex", alignItems: "center", gap: 8 }}>
        <span>${icon}</span>${title}
      </h2>
      <div style=${{ position: "relative", height }}>
        <${ChartWrap} type="bar" data=${chartData} options=${opts} />
      </div>
    </div>
  `;
}

// ── Meta row (top table) ───────────────────────────────────────────
function MetaRow({ tableVis, plant }) {
  if (!tableVis?.data) return html`
    <div style=${{ background: `linear-gradient(180deg,${C.card},#0d2139)`, border: `1px solid ${C.line}`, borderRadius: 14, padding: "12px 16px", color: C.muted, fontSize: 12 }}>
      Permit table loading…
    </div>
  `;
  const { columns, rows } = tableVis.data;
  const row = plant ? rows.find(r => r[0] === plant) || rows[0] : rows[0];
  if (!row) return null;
  const headers = columns.map(c => c.replace(/^.*?\./, "").replace(/^[A-Z]\w*\(/, "").replace(/\)$/, ""));
  return html`
    <div style=${{
      background: `linear-gradient(180deg,${C.card},#0d2139)`,
      border: `1px solid ${C.line}`, borderRadius: 14,
      display: "grid", gridTemplateColumns: `repeat(${headers.length}, 1fr)`,
      overflow: "hidden",
    }}>
      ${headers.map((h, i) => html`
        <div key=${i} style=${{
          padding: "10px 14px",
          borderRight: i < headers.length - 1 ? `1px solid ${C.line}` : "none",
        }}>
          <div style=${{ color: C.muted, fontSize: 10, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 5 }}>${h}</div>
          <div style=${{ fontSize: 13, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            ${typeof row[i] === "number" ? row[i].toLocaleString(undefined, { maximumFractionDigits: 2 }) : (row[i] ?? "—")}
          </div>
        </div>
      `)}
    </div>
  `;
}

// ── Main export ────────────────────────────────────────────────────
function DailyEffluentFlowPage({ page, currentDateRange }) {
  const visuals  = page.visuals || [];
  const plants   = page.plant_slicer?.options || [];
  const dateOpts = page.date_slicer?.options  || [];
  const anchor   = page.date_slicer?.anchor_date || "";
  const initialRange = currentDateRange || "last_12_months";
  const initialFlow = findVis(visuals, "Average Daily Flow");
  const initialBase = (page.plant_slicer?.default && initialFlow?.data_by_plant?.[page.plant_slicer.default]) || initialFlow?.data;
  const initialBounds = getPresetBounds(initialRange, anchor) || inferSeriesBounds(initialBase) || { start: "", end: "" };

  const [plant, setPlant]   = useState(page.plant_slicer?.default || plants[0] || "");
  const [search, setSearch] = useState("");
  const [range,  setRange]  = useState(initialRange);
  const [customStart, setCustomStart] = useState(initialBounds.start || "");
  const [customEnd, setCustomEnd] = useState(initialBounds.end || "");

  const tableVis  = findVis(visuals, "");                    // tableEx (no title — first one)
  const flowVis   = findVis(visuals, "Average Daily Flow");
  const peakVis   = findVis(visuals, "2-hr Peak");
  const rainVis   = findVis(visuals, "Rainfall");

  // tableEx specifically — find by type
  const tableExVis = visuals.find(v => v.type === "tableEx");
  const dateOptions = useMemo(() => withCustomDateOption(dateOpts), [dateOpts]);
  const activeBounds = useMemo(() => getActiveBounds({
    range,
    anchorDate: anchor,
    customStart,
    customEnd,
  }), [range, anchor, customStart, customEnd]);

  const flowData  = useMemo(() => resolve(flowVis,  plant, activeBounds), [flowVis,  plant, activeBounds]);
  const peakData  = useMemo(() => resolve(peakVis,  plant, activeBounds), [peakVis,  plant, activeBounds]);
  const rainData  = useMemo(() => resolve(rainVis,  plant, activeBounds), [rainVis,  plant, activeBounds]);

  const filteredPlants = plants.filter(p => p.toLowerCase().includes(search.toLowerCase()));
  const rangeLabel = dateOpts.find(o => o.key === range)?.label || range;

  return html`
    <div style=${{
      background: `radial-gradient(circle at 20% 10%,#16365f55,transparent 25%),linear-gradient(180deg,#05101d,${C.bg})`,
      minHeight: "100vh", color: C.text,
      fontFamily: "Inter, system-ui, sans-serif", fontSize: 14,
      overflowY: "auto",
    }}>
      <div style=${{ padding: 18, display: "grid", gap: 12 }}>

        <!-- TOP ROW -->
        <div style=${{ display: "grid", gridTemplateColumns: "64px 1fr auto", gap: 14, alignItems: "start" }}>
          <!-- Back button -->
          <button onClick=${() => { window.location.hash = "#/home"; }}
            style=${{
              height: 64, background: `linear-gradient(180deg,${C.card},#0d2139)`,
              border: `1px solid ${C.line}`, borderRadius: 14,
              color: C.muted, fontSize: 28, cursor: "pointer", display: "grid", placeItems: "center",
            }}>←</button>

          <!-- Title -->
          <div>
            <small style=${{ display: "block", color: C.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", fontSize: 11, marginBottom: 4 }}>
              City of Houston — Public Works &amp; Engineering
            </small>
            <h1 style=${{ margin: 0, fontSize: 26, fontWeight: 800, lineHeight: 1.05 }}>
              WWiP Plant-Intelligence-System <span style=${{ color: C.accent }}>· Effluent Flow | ADF and 2-hour Peak</span>
            </h1>
          </div>

          <!-- Date selector -->
          <div style=${{
            background: `linear-gradient(180deg,${C.card},#0d2139)`,
            border: `1px solid ${C.line}`, borderRadius: 14,
            padding: "12px 14px", minWidth: 220,
          }}>
            <div style=${{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Datestamp</div>
            <select value=${range} onChange=${e => setRange(e.target.value)}
              style=${{
                marginTop: 8, width: "100%", padding: "8px 10px",
                border: `1px solid ${C.line}`, borderRadius: 10,
                background: "#0b1c31", color: C.text, fontFamily: "inherit", fontSize: 13,
              }}>
              ${dateOptions.map(o => html`<option value=${o.key}>${o.label}</option>`)}
            </select>
            ${range === CUSTOM_DATE_RANGE_KEY && html`
              <div style=${{ display:"grid", gap:8, marginTop:10 }}>
                <input type="date" value=${customStart} max=${customEnd || undefined} onInput=${e => setCustomStart(e.target.value)}
                  style=${{ width:"100%", padding:"8px 10px", border:`1px solid ${C.line}`, borderRadius:10, background:"#0b1c31", color:C.text, fontFamily:"inherit", fontSize:13 }} />
                <input type="date" value=${customEnd} min=${customStart || undefined} onInput=${e => setCustomEnd(e.target.value)}
                  style=${{ width:"100%", padding:"8px 10px", border:`1px solid ${C.line}`, borderRadius:10, background:"#0b1c31", color:C.text, fontFamily:"inherit", fontSize:13 }} />
              </div>
            `}
          </div>
        </div>

        <!-- PERMIT META ROW -->
        <${MetaRow} tableVis=${tableExVis} plant=${plant} />

        <!-- MAIN LAYOUT -->
        <div style=${{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 12 }}>

          <!-- SIDEBAR -->
          <aside style=${{
            background: `linear-gradient(180deg,${C.card},#0d2139)`,
            border: `1px solid ${C.line}`, borderRadius: 14, padding: 12,
            maxHeight: "calc(100vh - 280px)", overflow: "auto",
          }}>
            <h3 style=${{ margin: "0 0 8px", color: C.accent, fontSize: 13 }}>WWTP</h3>
            <input
              placeholder="Search WWTP"
              value=${search}
              onInput=${e => setSearch(e.target.value)}
              style=${{
                width: "100%", padding: "8px 10px",
                borderRadius: 10, border: `1px solid ${C.line}`,
                background: "#0a1a2e", color: C.text,
                fontFamily: "inherit", fontSize: 12, marginBottom: 8,
              }}
            />
            <div style=${{ display: "grid", gap: 5 }}>
              ${filteredPlants.map(p => html`
                <label key=${p} style=${{
                  display: "flex", gap: 8, alignItems: "center",
                  padding: "5px 6px", borderRadius: 8, cursor: "pointer",
                  background: p === plant ? "rgba(39,215,215,0.12)" : "transparent",
                  color: p === plant ? C.accent : C.muted,
                  fontSize: 12,
                }}>
                  <input type="radio" name="plant" value=${p} checked=${p === plant}
                    onChange=${() => setPlant(p)}
                    style=${{ accentColor: C.accent }} />
                  ${p}
                </label>
              `)}
            </div>
          </aside>

          <!-- CHARTS -->
          <main style=${{ display: "grid", gap: 12 }}>
            <${BarChart}
              title="Average Daily Flow, MGD"
              icon="📈" data=${flowData}
              color=${C.purple} height=${160}
            />
            <${BarChart}
              title="Rainfall Depth, Inch"
              icon="🌧" data=${rainData}
              color=${C.orange} height=${130}
            />
            <${BarChart}
              title="2-hr Peak Flow, GPM"
              icon="⚡" data=${peakData}
              color=${C.green} limitColor=${C.red} height=${170}
            />
          </main>
        </div>

      </div>
    </div>
  `;
}
exports['DailyEffluentFlowPage'] = DailyEffluentFlowPage;
  });

  __wwip_define__('src/pages/generic-chart-page.js', function (module, exports, __wwip_require__) {
const { h } = __wwip_require__('app/lib/preact.module.js');
const { useState, useMemo } = __wwip_require__('app/lib/preact-hooks.module.js');
const htm = __wwip_require__('app/lib/htm.module.js').default;
const { ChartWrap } = __wwip_require__('src/components/chart-base.js');
// Generic bespoke chart page — same layout as daily-effluent-flow.js.
// Auto-discovers data-bound charts from page.visuals and renders them
// as bar charts with WWTP sidebar + date range selector.
// Used for: Charts Daily Influent/Effluent, DMR 5yr pages, etc.




const html = htm.bind(h);

const C = {
  bg:     "#071425",
  card:   "#10253f",
  line:   "rgba(120,170,220,.16)",
  text:   "#eef4fb",
  muted:  "#9db0c7",
  accent: "#27d7d7",
};

// Chart colours — cycled across multiple charts per page
const COLORS = ["#8d6be8", "#27d7d7", "#ef9447", "#72c98f", "#d74c45", "#5da8ff", "#f2c14e"];

// ── Client-side date window filter ────────────────────────────────
function applyDateWindow(d, anchorStr, days) {
  if (!d || !days || !anchorStr) return d;
  const cutoff = new Date(anchorStr);
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);
  const xs = d.x || [];
  const keep = [];
  for (let i = 0; i < xs.length; i++) if (xs[i] >= cutoffStr) keep.push(i);
  if (keep.length === xs.length) return d;
  return {
    ...d,
    x: keep.map(i => xs[i]),
    series: (d.series || []).map(s => ({ ...s, values: keep.map(i => s.values[i]) })),
    y: d.y ? keep.map(i => d.y[i]) : undefined,
  };
}

const DATE_DAYS = { last_30_days: 30, last_90_days: 90, last_12_months: 365, last_5_years: 1825, all_time: null };

function resolveData(visual, plant, range, anchor) {
  if (!visual) return null;
  const days = DATE_DAYS[range] ?? null;
  const byPlant = visual.data_by_plant;
  const base = (plant && byPlant?.[plant]) ? byPlant[plant] : visual.data;
  return applyDateWindow(base, anchor, days);
}

// Clean up series name for chart title — strip leading plant-code prefix
// e.g. "69 Plnt If CBOD" → "Plnt If CBOD"
function cleanSeriesName(name) {
  if (!name) return "Value";
  return name.replace(/^[A-Z0-9]{2,4}\s+/, "");
}

// ── Bar chart ─────────────────────────────────────────────────────
function BarChart({ data, color, limitColor, height = 160 }) {
  if (!data) return null;
  const xs = data.x || [];
  const series = data.series || [];
  const mainS  = series.find(s => s.role === "y"  || !s.role) || series[0];
  const limitS = series.find(s => s.role === "y2") || null;
  if (!mainS || !xs.length) return html`
    <div style=${{ height, display: "grid", placeItems: "center", color: C.muted, fontSize: 12 }}>
      No data for this selection
    </div>`;

  // Chart label: clean the series name
  const serLabel = cleanSeriesName(mainS.name);

  const datasets = [{
    label: serLabel,
    data: mainS.values || [],
    backgroundColor: color,
    borderColor: color,
    borderWidth: 0,
    borderRadius: 2,
    type: "bar",
  }];

  if (limitS) {
    const limitVal = (limitS.values || []).find(v => v != null);
    if (limitVal != null) {
      datasets.push({
        label: "Limit",
        data: Array(xs.length).fill(limitVal),
        type: "line",
        borderColor: limitColor || "#d74c45",
        borderWidth: 2,
        pointRadius: 0,
        fill: false,
        tension: 0,
      });
    }
  }

  const opts = {
    responsive: true, maintainAspectRatio: false, animation: false,
    plugins: {
      legend: { display: true, position: "top", align: "start",
        labels: { color: C.muted, font: { size: 11 }, boxWidth: 10, padding: 10 } },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { ticks: { color: C.muted, font: { size: 9 }, maxTicksLimit: 10 },
           grid: { color: "rgba(255,255,255,0.05)" } },
      y: { ticks: { color: C.muted, font: { size: 9 } },
           grid: { color: "rgba(255,255,255,0.05)" }, beginAtZero: true },
    },
  };

  return html`
    <div style=${{ position: "relative", height }}>
      <${ChartWrap} type="bar" data=${{ labels: xs, datasets }} options=${opts} />
    </div>
  `;
}

// ── Resolved chart card (owns the useMemo) ────────────────────────
function ChartCardResolved({ visual, plant, range, anchor, color, titleFn }) {
  const d = useMemo(() => resolveData(visual, plant, range, anchor), [visual, plant, range, anchor]);
  const title = titleFn(visual, plant);
  return html`<${ChartCard} title=${title} data=${d} color=${color} height=${160} />`;
}

// ── Chart card ────────────────────────────────────────────────────
function ChartCard({ title, data, color, height }) {
  return html`
    <div style=${{
      background: `linear-gradient(180deg,${C.card},#0d2139)`,
      border: `1px solid ${C.line}`, borderRadius: 14, padding: "14px 16px",
    }}>
      <h2 style=${{ margin: "0 0 6px", fontSize: 15, color: C.accent }}>${title}</h2>
      <${BarChart} data=${data} color=${color} height=${height || 160} />
    </div>
  `;
}

// ── KPI card ──────────────────────────────────────────────────────
function KpiCard({ visual, plant }) {
  const d = plant && visual.data_by_plant?.[plant] ? visual.data_by_plant[plant] : visual.data;
  const val = d?.value;
  const formatted = val == null ? "—"
    : typeof val === "number" ? val.toLocaleString(undefined, { maximumFractionDigits: 2 })
    : String(val);
  const label = (visual.projections?.Values?.[0] || "").replace(/^.*?\./, "").replace(/^[A-Z]\w*\(/, "").replace(/\)$/, "");
  return html`
    <div style=${{
      background: `linear-gradient(180deg,${C.card},#0d2139)`,
      border: `1px solid ${C.line}`, borderRadius: 14, padding: "12px 16px",
      textAlign: "center",
    }}>
      <div style=${{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>${label}</div>
      <div style=${{ fontSize: "1.5rem", fontWeight: 800, color: C.accent }}>${formatted}</div>
    </div>
  `;
}

// ── Main export ────────────────────────────────────────────────────
function GenericChartPage({ page, currentDateRange }) {
  const visuals    = page.visuals || [];
  const plants     = page.plant_slicer?.options || [];
  const dateOpts   = page.date_slicer?.options  || [];
  const anchor     = page.date_slicer?.anchor_date || "";

  const [plant, setPlant] = useState(page.plant_slicer?.default || plants[0] || "");
  const [search, setSearch] = useState("");
  const [range,  setRange]  = useState(currentDateRange || page.date_slicer?.default || "last_5_years");

  // Find all data-bound chart visuals (area, combo, line, bar)
  const CHART_TYPES = new Set(["areaChart","lineChart","clusteredColumnChart","columnChart",
    "lineClusteredColumnComboChart","lineStackedColumnComboChart",
    "hundredPercentStackedColumnChart"]);
  const charts = visuals.filter(v => CHART_TYPES.has(v.type) && (v.data || v.data_by_plant));

  // Find KPI cards (has data, is a card)
  const cards = visuals.filter(v => v.type === "card" && (v.data || v.data_by_plant));

  // Derive a readable title for each chart from its series data
  function chartTitle(visual) {
    if (visual.title && !visual.title.includes("Recorded Value")) return visual.title;
    const d = visual.data_by_plant?.[plant] || visual.data || {};
    const series = d.series || [];
    if (series[0]?.name) return cleanSeriesName(series[0].name).replace(/Plnt\s+(If|Ef)\s+/, "Influent: ").replace(/Plnt\s+/, "").trim();
    return "Value";
  }

  const filteredPlants = plants.filter(p => p.toLowerCase().includes(search.toLowerCase()));

  // Build page title from display name (strip PBIX cruft)
  const pageTitle = (page.display_name || "")
    .replace(/^DT\s*\(?Chart\)?\s*/i, "")
    .replace(/^DT\s*\(DMR\s*5yr\)?\s*/i, "")
    .replace(/^DT\s*/i, "")
    .trim();

  return html`
    <div style=${{
      background: `radial-gradient(circle at 20% 10%,#16365f55,transparent 25%),linear-gradient(180deg,#05101d,${C.bg})`,
      minHeight: "100vh", color: C.text, fontFamily: "Inter, system-ui, sans-serif",
      fontSize: 14, overflowY: "auto",
    }}>
      <div style=${{ padding: 18, display: "grid", gap: 12 }}>

        <!-- TOP ROW -->
        <div style=${{ display: "grid", gridTemplateColumns: "64px 1fr auto", gap: 14, alignItems: "start" }}>
          <button onClick=${() => window.history.back()}
            style=${{
              height: 64, background: `linear-gradient(180deg,${C.card},#0d2139)`,
              border: `1px solid ${C.line}`, borderRadius: 14,
              color: C.muted, fontSize: 28, cursor: "pointer",
              display: "grid", placeItems: "center",
            }}>←</button>
          <div>
            <small style=${{ display: "block", color: C.accent, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", fontSize: 11, marginBottom: 4 }}>
              City of Houston — Public Works &amp; Engineering
            </small>
            <h1 style=${{ margin: 0, fontSize: 26, fontWeight: 800, lineHeight: 1.05 }}>
              WWiP Plant-Intelligence-System
              <span style=${{ color: C.accent }}> · ${pageTitle}</span>
            </h1>
          </div>
          <div style=${{
            background: `linear-gradient(180deg,${C.card},#0d2139)`,
            border: `1px solid ${C.line}`, borderRadius: 14,
            padding: "12px 14px", minWidth: 220,
          }}>
            <div style=${{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.04em" }}>Date Range</div>
            <select value=${range} onChange=${e => setRange(e.target.value)}
              style=${{ marginTop: 8, width: "100%", padding: "8px 10px", border: `1px solid ${C.line}`, borderRadius: 10, background: "#0b1c31", color: C.text, fontFamily: "inherit", fontSize: 13 }}>
              ${dateOpts.map(o => html`<option value=${o.key}>${o.label}</option>`)}
            </select>
          </div>
        </div>

        <!-- KPI CARDS ROW (if any) -->
        ${cards.length > 0 && html`
          <div style=${{ display: "grid", gridTemplateColumns: `repeat(${Math.min(cards.length,4)}, 1fr)`, gap: 10 }}>
            ${cards.slice(0, 4).map((c, i) => html`<${KpiCard} key=${i} visual=${c} plant=${plant} />`)}
          </div>
        `}

        <!-- MAIN LAYOUT -->
        <div style=${{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 12 }}>

          <!-- SIDEBAR -->
          <aside style=${{
            background: `linear-gradient(180deg,${C.card},#0d2139)`,
            border: `1px solid ${C.line}`, borderRadius: 14, padding: 12,
            maxHeight: "calc(100vh - 240px)", overflow: "auto",
          }}>
            <h3 style=${{ margin: "0 0 8px", color: C.accent, fontSize: 13 }}>WWTP</h3>
            <input placeholder="Search WWTP" value=${search} onInput=${e => setSearch(e.target.value)}
              style=${{ width: "100%", padding: "8px 10px", borderRadius: 10, border: `1px solid ${C.line}`, background: "#0a1a2e", color: C.text, fontFamily: "inherit", fontSize: 12, marginBottom: 8 }}
            />
            <div style=${{ display: "grid", gap: 4 }}>
              ${filteredPlants.map(p => html`
                <label key=${p} style=${{
                  display: "flex", gap: 8, alignItems: "center", padding: "5px 6px",
                  borderRadius: 8, cursor: "pointer", fontSize: 12,
                  background: p === plant ? "rgba(39,215,215,0.12)" : "transparent",
                  color: p === plant ? C.accent : C.muted,
                }}>
                  <input type="radio" name="plant" checked=${p === plant} onChange=${() => setPlant(p)}
                    style=${{ accentColor: C.accent }} />
                  ${p}
                </label>
              `)}
            </div>
          </aside>

          <!-- CHARTS -->
          <main style=${{ display: "grid", gap: 12 }}>
            ${charts.map((vis, i) => html`<${ChartCardResolved}
              key=${i}
              visual=${vis}
              plant=${plant}
              range=${range}
              anchor=${anchor}
              color=${COLORS[i % COLORS.length]}
              titleFn=${chartTitle}
            />`)}
          </main>
        </div>

        <!-- FOOTER -->
        <div style=${{ display: "flex", justifyContent: "space-between", color: C.muted, paddingTop: 8, borderTop: `1px solid rgba(255,255,255,0.08)`, fontSize: 11 }}>
          <span>All flows in mgd (million gallons per day). Data refreshed daily.</span>
          <span>Questions or feedback? Contact <a href="mailto:" style=${{ color: "#5da8ff" }}>WWIP Support</a></span>
        </div>
      </div>
    </div>
  `;
}
exports['GenericChartPage'] = GenericChartPage;
  });

  __wwip_define__('src/pages/ef-flow-permit-eval.js', function (module, exports, __wwip_require__) {
const { h } = __wwip_require__('app/lib/preact.module.js');
const { useMemo, useState } = __wwip_require__('app/lib/preact-hooks.module.js');
const htm = __wwip_require__('app/lib/htm.module.js').default;
const {
  CUSTOM_DATE_RANGE_KEY,
  getActiveBounds,
  getPresetBounds,
  averageNumeric,
  maxNumeric,
  withCustomDateOption,
} = __wwip_require__('src/date-range.js');
const html = htm.bind(h);

const TEAL  = "#1fa3a8";
const SLATE = "#5c6f84";
const PANEL = "linear-gradient(180deg,#102844,#0d223b)";
const LINE  = "rgba(120,170,220,.16)";
const ACCENT = "#23d6d6";
const MUTED  = "#9db0c7";
const TEXT   = "#eef4fb";

const card = (extra = {}) => ({
  background: PANEL, border: `1px solid ${LINE}`, borderRadius: 16, ...extra,
});

function buildCustomChartData(chartVis, bounds) {
  const source = chartVis?.custom_range_source;
  if (!source?.plants?.length) return chartVis?.data;

  const xs = [];
  const utilized = [];
  const remaining = [];

  for (const plant of source.plants) {
    const plantRows = source.rows_by_plant?.[plant];
    if (!plantRows?.x?.length) continue;

    const activeIdx = [];
    for (let i = 0; i < plantRows.x.length; i += 1) {
      const x = String(plantRows.x[i]).slice(0, 10);
      if (!bounds?.start || !bounds?.end || (x >= bounds.start && x <= bounds.end)) {
        activeIdx.push(i);
      }
    }
    const keep = activeIdx.length ? activeIdx : plantRows.x.map((_, i) => i);
    const utilVals = keep.map((i) => plantRows.utilized?.[i]);
    const permitVals = keep.map((i) => plantRows.permit?.[i]);
    const maxUtil = maxNumeric(utilVals);
    const permit = averageNumeric(permitVals);
    const rem = (maxUtil != null && permit != null) ? (permit - maxUtil) : null;

    xs.push(plant);
    utilized.push(maxUtil);
    remaining.push(rem);
  }

  return {
    shape: "xy_series",
    x: xs,
    series: [
      { name: "Capacity Utilized", values: utilized },
      { name: "Capacity Remaining", values: remaining },
    ],
  };
}

function EfFlowPermitEvalPage({ page, manifest, currentDateRange }) {
  const visuals  = page.visuals || [];
  const chartVis = visuals.find(v => v.type === "hundredPercentStackedColumnChart");
  const dateOpts = page.date_slicer?.options || [];
  const anchor   = page.date_slicer?.anchor_date || "";
  const initialRange = currentDateRange || page.date_slicer?.default || "last_5_years";
  const initialBounds = getPresetBounds(initialRange, anchor, {
    calendarMonthRanges: { last_12_months: 12, last_5_years: 60 },
  }) || { start: "", end: "" };

  const [range, setRange] = useState(initialRange);
  const [customStart, setCustomStart] = useState(initialBounds.start || "");
  const [customEnd, setCustomEnd] = useState(initialBounds.end || "");
  const dateOptions = useMemo(() => withCustomDateOption(dateOpts), [dateOpts]);
  const activeBounds = useMemo(() => getActiveBounds({
    range,
    anchorDate: anchor,
    customStart,
    customEnd,
    calendarMonthRanges: { last_12_months: 12, last_5_years: 60 },
  }), [range, anchor, customStart, customEnd]);

  const chartData = useMemo(() => {
    if (range === CUSTOM_DATE_RANGE_KEY) {
      return buildCustomChartData(chartVis, activeBounds);
    }
    return chartVis?.data_by_date_range?.[range] || chartVis?.data;
  }, [chartVis, range, activeBounds]);

  const xs     = chartData?.x || [];
  const series = chartData?.series || [];
  const bars = useMemo(() => xs.map((plant, i) => {
    const utilized = Math.max(0, series[0]?.values?.[i] ?? 0);
    const rem = Math.max(0, series[1]?.values?.[i] ?? 0);
    const total = utilized + rem || 1;
    const pct = Math.round((utilized / total) * 100);
    const remPct = Math.round((rem / total) * 100);
    return { plant, pct, rem: remPct };
  }), [xs, series]);

  const violations = (manifest?.totals?.violations || 0).toLocaleString();
  const plants     = manifest?.totals?.plants || 0;
  const refresh    = (manifest?.last_refresh || "—").slice(0, 10);
  const rangeLabel = range === CUSTOM_DATE_RANGE_KEY
    ? `${customStart || "Start"} to ${customEnd || "End"}`
    : (dateOpts.find(o => o.key === range)?.label || range);

  return html`
    <div style=${{
      background: `radial-gradient(circle at 20% 10%,rgba(40,90,160,.18),transparent 26%),linear-gradient(180deg,#04101c,#061321)`,
      minHeight: "100vh",
      color: TEXT, fontFamily: "Inter,system-ui,sans-serif", fontSize: 14,
      padding: 18, display: "grid", gap: 14, gridTemplateRows: "auto 1fr auto",
    }}>

      <header style=${{ display:"grid", gridTemplateColumns:"72px 1fr 520px", gap:16, alignItems:"start" }}>
        <button onClick=${() => { window.location.hash = "#/home"; }}
          style=${card({ height:72, width:72, display:"grid", placeItems:"center", fontSize:28, color:MUTED, cursor:"pointer" })}>←</button>

        <div>
          <div style=${{ color:ACCENT, textTransform:"uppercase", fontWeight:700, letterSpacing:".08em", fontSize:11, marginBottom:4 }}>
            City of Houston — Public Works &amp; Engineering
          </div>
          <h1 style=${{ margin:"0 0 4px", fontSize:32, fontWeight:800, lineHeight:1.05 }}>Citywide WWTP Capacity Status</h1>
          <div style=${{ fontSize:20, fontWeight:700, color:ACCENT }}>Effluent Flow</div>
        </div>

        <div style=${{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12 }}>
          ${[
            { val: plants,     label: "Total WWTPs",       color: TEXT   },
            { val: violations, label: "Total Violations",  color: TEXT   },
            { val: refresh,    label: "Last refresh",      color: ACCENT },
          ].map(s => html`
            <div style=${card({ padding:"12px 16px" })}>
              <div style=${{ fontSize:"1.35rem", fontWeight:800, color:s.color }}>${s.val}</div>
              <div style=${{ color:MUTED, fontSize:12, marginTop:2 }}>${s.label}</div>
            </div>`
          )}
        </div>
      </header>

      <section style=${card({ padding:"16px 18px 14px", display:"flex", flexDirection:"column", minHeight:0 })}>
        <div style=${{
          display: "grid",
          gridTemplateColumns: "minmax(0,1fr) 380px 300px",
          gap: 16,
          alignItems: "start",
          marginBottom: 16,
          flexShrink: 0,
        }}>
          <div>
            <div style=${{ fontWeight:800, fontSize:15, marginBottom:10 }}>
              Effluent Flow, MGD
              <span style=${{ color:MUTED, fontWeight:500, fontSize:13 }}> | Based on Maximum of Twelve Consecutive Months of Average Flow for Selected Time Period</span>
            </div>
            <div style=${{ display:"flex", gap:24, fontSize:14, fontWeight:700 }}>
              <span><span style=${{ display:"inline-block", width:13, height:13, borderRadius:"50%", background:TEAL, marginRight:7, verticalAlign:-2 }}></span>Capacity Utilized</span>
              <span><span style=${{ display:"inline-block", width:13, height:13, borderRadius:"50%", background:SLATE, marginRight:7, verticalAlign:-2 }}></span>Capacity Remaining</span>
            </div>
          </div>

          <div style=${{ color:ACCENT, fontSize:12, lineHeight:1.55, paddingLeft:14, borderLeft:`1px solid ${LINE}` }}>
            5 WWTPs, Forest Cove, Tidwell Timbers, WCID 76, West Lake Houston and Westway are not included in this chart. These are evaluated based on 75/90 Rule.
          </div>

          <div style=${card({ padding:"14px 16px" })}>
            <div style=${{ color:ACCENT, fontWeight:800, textTransform:"uppercase", fontSize:11, letterSpacing:".08em", marginBottom:10 }}>Datestamp</div>
            <select value=${range} onChange=${e => setRange(e.target.value)}
              style=${{ width:"100%", padding:"9px 11px", border:`1px solid ${LINE}`, borderRadius:9, background:"#0a1d32", color:TEXT, fontFamily:"inherit", fontSize:13, marginBottom:10 }}>
              ${dateOptions.map(o => html`<option value=${o.key}>${o.label}</option>`)}
            </select>
            ${range === CUSTOM_DATE_RANGE_KEY && html`
              <div style=${{ display:"grid", gap:8, marginBottom:10 }}>
                <input type="date" value=${customStart} max=${customEnd || undefined} onInput=${e => setCustomStart(e.target.value)}
                  style=${{ width:"100%", padding:"9px 11px", border:`1px solid ${LINE}`, borderRadius:9, background:"#0a1d32", color:TEXT, fontFamily:"inherit", fontSize:13 }} />
                <input type="date" value=${customEnd} min=${customStart || undefined} onInput=${e => setCustomEnd(e.target.value)}
                  style=${{ width:"100%", padding:"9px 11px", border:`1px solid ${LINE}`, borderRadius:9, background:"#0a1d32", color:TEXT, fontFamily:"inherit", fontSize:13 }} />
              </div>
            `}
            <div style=${{ color:MUTED, fontSize:12, display:"flex", alignItems:"center", gap:6 }}>
              <span>📅</span><span>${rangeLabel}</span>
            </div>
          </div>
        </div>

        <div style=${{
          flex:1, display:"grid", minHeight:0, overflow:"hidden",
          gridTemplateColumns:`repeat(${bars.length},minmax(0,1fr))`,
          gap:6, alignItems:"end",
        }}>
          ${bars.map(({ plant, pct, rem }) => html`
            <div key=${plant} style=${{ display:"flex", flexDirection:"column", height:"100%", minWidth:0 }}>
              <div style=${{ flex:1, display:"flex", flexDirection:"column", borderRadius:"3px 3px 0 0", overflow:"hidden", minHeight:0 }}>
                <div style=${{ flex:rem, background:SLATE, display:"flex", alignItems:"center", justifyContent:"center", color:"#f3f6fb", fontWeight:800, fontSize:rem<14?9:11, minHeight:0 }}>
                  ${rem > 8 ? `${rem}%` : ""}
                </div>
                <div style=${{ flex:pct, background:TEAL, display:"flex", alignItems:"center", justifyContent:"center", color:"#eafcff", fontWeight:800, fontSize:pct<14?9:11, minHeight:0 }}>
                  ${pct > 8 ? `${pct}%` : ""}
                </div>
              </div>
              <div style=${{ height:90, flexShrink:0, display:"flex", alignItems:"flex-start", justifyContent:"center", paddingTop:6, overflow:"hidden" }}>
                <span style=${{ writingMode:"vertical-lr", transform:"rotate(180deg)", fontSize:10, color:"#d3dceb", whiteSpace:"nowrap", lineHeight:1 }}>${plant}</span>
              </div>
            </div>
          `)}
        </div>
      </section>

      <footer style=${{ display:"flex", justifyContent:"space-between", color:MUTED, fontSize:12, paddingTop:6, borderTop:`1px solid rgba(255,255,255,.08)` }}>
        <div>All flows in mgd (million gallons per day). Data refreshed daily.</div>
        <div>Questions or feedback? Contact <span style=${{ color:ACCENT }}>WWIP Support</span></div>
      </footer>
    </div>
  `;
}
exports['EfFlowPermitEvalPage'] = EfFlowPermitEvalPage;
  });

  __wwip_define__('src/pages/permit-evaluation-aaf.js', function (module, exports, __wwip_require__) {
const { h } = __wwip_require__('app/lib/preact.module.js');
const { useState, useMemo } = __wwip_require__('app/lib/preact-hooks.module.js');
const htm = __wwip_require__('app/lib/htm.module.js').default;
const { ChartWrap } = __wwip_require__('src/components/chart-base.js');
const {
  CUSTOM_DATE_RANGE_KEY,
  filterSeriesByBounds,
  getActiveBounds,
  getPresetBounds,
  getRoleSeries,
  inferSeriesBounds,
  maxNumeric,
  averageNumeric,
  withCustomDateOption,
} = __wwip_require__('src/date-range.js');
// Bespoke page for Permit Evaluation AAF (dt-permit-evaluation-aaf).
// Same layout family as daily-effluent-flow.js.





const html = htm.bind(h);

const C = {
  bg:     "#071425",
  card:   "#10253f",
  line:   "rgba(120,170,220,.16)",
  text:   "#eef4fb",
  muted:  "#9db0c7",
  accent: "#27d7d7",
};

function resolve(visual, plant, bounds) {
  const base = (plant && visual?.data_by_plant?.[plant]) ? visual.data_by_plant[plant] : visual?.data;
  return filterSeriesByBounds(base, bounds);
}

// ── Combo chart: bars (Y) + lines (Y2) ───────────────────────────
function AAFChart({ data }) {
  if (!data) return html`<div style=${{ flex:1, display:"grid", placeItems:"center", color:C.muted }}>No data</div>`;

  const xs = data.x || [];
  const series = data.series || [];
  const ySeries  = series.filter(s => s.role === "y"  || !s.role);
  const y2Series = series.filter(s => s.role === "y2");

  // Friendly names for known series
  const NAMES = {
    "Avg(DATATBL.CURVALUE)":    "Monthly Avg Flow, MGD",
    "Sum(LIMITS.LIMIT_VALUE)":  "Permit Limit",
    "Sum(DATATBL.90%)":         "90% Threshold",
    "Sum(DATATBL.75%)":         "75% Threshold",
  };
  const COLORS_Y2 = ["#d74c45", "#ef9447", "#72c98f"];

  const datasets = [
    ...ySeries.map(s => ({
      label: NAMES[s.name] || s.name,
      data: s.values || [],
      type: "bar",
      backgroundColor: "rgba(39,215,215,0.65)",
      borderColor: C.accent,
      borderWidth: 0,
      borderRadius: 2,
      order: 2,
    })),
    ...y2Series.map((s, i) => ({
      label: NAMES[s.name] || s.name,
      data: s.values || [],
      type: "line",
      borderColor: COLORS_Y2[i] || "#fff",
      borderWidth: i === 0 ? 2.5 : 1.5,
      borderDash: i === 0 ? [] : [6, 3],
      pointRadius: 0,
      fill: false,
      tension: 0,
      order: 1,
    })),
  ];

  // All series (bars + lines) share one y-axis in MGD — compute a shared max
  const allVals = [...ySeries, ...y2Series]
    .flatMap(s => s.values || [])
    .filter(v => v != null);
  const sharedMax = allVals.length ? Math.max(...allVals) * 1.1 : undefined;

  const opts = {
    responsive: true, maintainAspectRatio: false, animation: false,
    plugins: {
      legend: { display: true, position: "top", align: "start",
        labels: { color: C.muted, font:{ size:11 }, boxWidth:10, padding:10 } },
      tooltip: { mode:"index", intersect:false },
    },
    scales: {
      x: { ticks:{ color:C.muted, font:{size:9}, maxTicksLimit:12 }, grid:{ color:"rgba(255,255,255,0.05)" } },
      y: {
        ticks:{ color:C.muted, font:{size:9} },
        grid:{ color:"rgba(255,255,255,0.05)" },
        beginAtZero:true,
        max: sharedMax,
        title:{ display:true, text:"MGD", color:C.muted, font:{size:10} },
      },
    },
  };

  return html`
    <div style=${{ position:"relative", flex:1, minHeight:0 }}>
      <${ChartWrap} type="bar" data=${{ labels:xs, datasets }} options=${opts} />
    </div>
  `;
}

// ── KPI card ──────────────────────────────────────────────────────
function KpiCard({ label, value, format }) {
  let display = "—";
  if (value != null) {
    if (format === "pct") display = `${(value * 100).toFixed(1)}%`;
    else if (format === "mgd") display = `${value.toLocaleString(undefined, { maximumFractionDigits:2 })} MGD`;
    else display = value.toLocaleString(undefined, { maximumFractionDigits:3 });
  }
  return html`
    <div style=${{
      background:`linear-gradient(180deg,${C.card},#0d2139)`,
      border:`1px solid ${C.line}`, borderRadius:14,
      padding:"14px 18px",
    }}>
      <div style=${{ color:C.muted, fontSize:11, textTransform:"uppercase", letterSpacing:".06em", marginBottom:6 }}>${label}</div>
      <div style=${{ fontSize:"1.6rem", fontWeight:800, color:C.accent }}>${display}</div>
    </div>
  `;
}

function PermitTable({ visual, plant }) {
  const d = (plant && visual?.data_by_plant?.[plant]) || visual?.data;
  if (!d) return null;

  const columns = d.columns || [];
  const rows    = d.rows || [];
  const labels  = visual.column_labels || {};
  const headers = columns.map(c => labels[c] || c);

  return html`
    <div style=${{ overflowX:"auto" }}>
      <table style=${{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
        <thead>
          <tr>
            ${headers.map(h => html`
              <th key=${h} style=${{
                padding:"5px 8px",
                textAlign:"left",
                color:C.muted,
                borderBottom:`1px solid ${C.line}`,
                fontWeight:600,
                fontSize:10,
                textTransform:"uppercase",
                letterSpacing:".04em",
                whiteSpace:"nowrap",
              }}>${h}</th>
            `)}
          </tr>
        </thead>
        <tbody>
          ${rows.map((row, ri) => html`
            <tr key=${ri} style=${{ borderBottom:"1px solid rgba(255,255,255,.03)" }}>
              ${row.map((cell, ci) => html`
                <td key=${ci} style=${{ padding:"4px 8px", color:C.text, whiteSpace:"nowrap" }}>
                  ${cell ?? "—"}
                </td>
              `)}
            </tr>
          `)}
        </tbody>
      </table>
    </div>
  `;
}

// ── Main export ────────────────────────────────────────────────────
function PermitEvaluationAAFPage({ page, manifest, currentDateRange }) {
  const visuals  = page.visuals || [];
  const plants   = page.plant_slicer?.options || [];
  const dateOpts = page.date_slicer?.options  || [];
  const anchor   = page.date_slicer?.anchor_date || "";
  const CHART_TYPES = new Set(["lineStackedColumnComboChart","lineClusteredColumnComboChart"]);
  const initialRange = currentDateRange || page.date_slicer?.default || "last_5_years";
  const initialChart = visuals.find(v => CHART_TYPES.has(v.type));
  const initialBase = (page.plant_slicer?.default && initialChart?.data_by_plant?.[page.plant_slicer.default]) || initialChart?.data;
  const initialBounds = getPresetBounds(initialRange, anchor) || inferSeriesBounds(initialBase) || { start: "", end: "" };

  const [plant, setPlant] = useState(page.plant_slicer?.default || plants[0] || "");
  const [search, setSearch] = useState("");
  const [range,  setRange]  = useState(initialRange);
  const [customStart, setCustomStart] = useState(initialBounds.start || "");
  const [customEnd, setCustomEnd] = useState(initialBounds.end || "");

  const comboVis = initialChart;
  const cards    = visuals.filter(v => v.type === "card" && (v.data || v.data_by_plant));
  const tableVis = visuals.find(v => v.type === "tableEx" && (v.data || v.data_by_plant));
  const dateOptions = useMemo(() => withCustomDateOption(dateOpts), [dateOpts]);
  const activeBounds = useMemo(() => getActiveBounds({
    range,
    anchorDate: anchor,
    customStart,
    customEnd,
  }), [range, anchor, customStart, customEnd]);

  const chartData = useMemo(() => resolve(comboVis, plant, activeBounds), [comboVis, plant, activeBounds]);
  const fallbackCard0 = useMemo(() => { const d = (plant && cards[0]?.data_by_plant?.[plant]) || cards[0]?.data; return d?.value ?? null; }, [cards, plant]);
  const fallbackCard1 = useMemo(() => { const d = (plant && cards[1]?.data_by_plant?.[plant]) || cards[1]?.data; return d?.value ?? null; }, [cards, plant]);
  const card0val = useMemo(() => {
    const series = getRoleSeries(chartData, "y") || getRoleSeries(chartData, null);
    return maxNumeric(series?.values) ?? fallbackCard0;
  }, [chartData, fallbackCard0]);
  const card1val = useMemo(() => {
    const permit = averageNumeric(getRoleSeries(chartData, "y2")?.values);
    return (card0val != null && permit) ? (card0val / permit) : fallbackCard1;
  }, [chartData, card0val, fallbackCard1]);

  const filteredPlants = plants.filter(p => p.toLowerCase().includes(search.toLowerCase()));
  const violations = (manifest?.totals?.violations || 0).toLocaleString();
  const plants_n   = manifest?.totals?.plants || 0;
  const refresh    = (manifest?.last_refresh || "—").slice(0, 10);

  return html`
    <div style=${{
      background:`radial-gradient(circle at 20% 10%,#16365f55,transparent 25%),linear-gradient(180deg,#05101d,${C.bg})`,
      height:"100vh", color:C.text, fontFamily:"Inter,system-ui,sans-serif",
      fontSize:14, padding:18, display:"grid", gap:12,
      gridTemplateRows:"auto 1fr auto", overflow:"hidden",
    }}>

      <!-- TOP ROW -->
      <header style=${{ display:"grid", gridTemplateColumns:"64px 1fr auto", gap:14, alignItems:"start" }}>
        <button onClick=${() => { window.location.hash = "#/home"; }}
          style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`, borderRadius:14, height:64, display:"grid", placeItems:"center", fontSize:28, color:C.muted, cursor:"pointer" }}>←</button>
        <div>
          <small style=${{ display:"block", color:C.accent, fontWeight:700, textTransform:"uppercase", letterSpacing:".04em", fontSize:11, marginBottom:4 }}>City of Houston — Public Works &amp; Engineering</small>
          <h1 style=${{ margin:0, fontSize:26, fontWeight:800, lineHeight:1.05 }}>
            WWiP Plant-Intelligence-System <span style=${{ color:C.accent }}>· Permit Evaluation, Annual Average Flow</span>
          </h1>
        </div>
        <div style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`, borderRadius:14, padding:"12px 14px", minWidth:210 }}>
          <div style=${{ color:C.muted, fontSize:11, textTransform:"uppercase", letterSpacing:".04em" }}>Date Range</div>
          <select value=${range} onChange=${e => setRange(e.target.value)}
            style=${{ marginTop:8, width:"100%", padding:"8px 10px", border:`1px solid ${C.line}`, borderRadius:10, background:"#0b1c31", color:C.text, fontFamily:"inherit", fontSize:13 }}>
            ${dateOptions.map(o => html`<option value=${o.key}>${o.label}</option>`)}
          </select>
          ${range === CUSTOM_DATE_RANGE_KEY && html`
            <div style=${{ display:"grid", gap:8, marginTop:10 }}>
              <input type="date" value=${customStart} max=${customEnd || undefined} onInput=${e => setCustomStart(e.target.value)}
                style=${{ width:"100%", padding:"8px 10px", border:`1px solid ${C.line}`, borderRadius:10, background:"#0b1c31", color:C.text, fontFamily:"inherit", fontSize:13 }} />
              <input type="date" value=${customEnd} min=${customStart || undefined} onInput=${e => setCustomEnd(e.target.value)}
                style=${{ width:"100%", padding:"8px 10px", border:`1px solid ${C.line}`, borderRadius:10, background:"#0b1c31", color:C.text, fontFamily:"inherit", fontSize:13 }} />
            </div>
          `}
        </div>
      </header>

      <!-- MAIN LAYOUT -->
      <main style=${{ display:"grid", gridTemplateColumns:"220px 1fr", gap:12, minHeight:0 }}>

        <!-- WWTP SIDEBAR -->
        <aside style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`, borderRadius:14, padding:12, overflow:"auto" }}>
          <h3 style=${{ margin:"0 0 8px", color:C.accent, fontSize:13 }}>WWTP</h3>
          <input placeholder="Search WWTP" value=${search} onInput=${e => setSearch(e.target.value)}
            style=${{ width:"100%", padding:"8px 10px", borderRadius:10, border:`1px solid ${C.line}`, background:"#0a1a2e", color:C.text, fontFamily:"inherit", fontSize:12, marginBottom:8 }} />
          <div style=${{ display:"grid", gap:4 }}>
            ${filteredPlants.map(p => html`
              <label key=${p} style=${{ display:"flex", gap:8, alignItems:"center", padding:"5px 6px", borderRadius:8, cursor:"pointer", fontSize:12, background:p===plant?"rgba(39,215,215,0.12)":"transparent", color:p===plant?C.accent:C.muted }}>
                <input type="radio" name="plant" checked=${p===plant} onChange=${()=>setPlant(p)} style=${{ accentColor:C.accent }} />
                ${p}
              </label>
            `)}
          </div>
        </aside>

        <!-- MAIN CONTENT -->
        <div style=${{ display:"flex", flexDirection:"column", gap:12, minHeight:0 }}>

          <!-- KPI + chart-label row -->
          <div style=${{ display:"grid", gridTemplateColumns:"1fr 1fr 2fr", gap:12, flexShrink:0 }}>
            <${KpiCard} label="Max AAF (MGD)"    value=${card0val} format="mgd" />
            <${KpiCard} label="Max AAF % of Permit" value=${card1val} format="pct" />
            <div style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`, borderRadius:14, padding:"12px 16px" }}>
              <div style=${{ fontWeight:700, fontSize:12, color:C.muted, marginBottom:6, textTransform:"uppercase", letterSpacing:".04em" }}>Permit Limits</div>
              <${PermitTable} visual=${tableVis} plant=${plant} />
            </div>
          </div>

          <!-- COMBO CHART -->
          <div style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`, borderRadius:14, padding:"14px 16px", flex:1, display:"flex", flexDirection:"column", minHeight:0 }}>
            <div style=${{ fontWeight:700, fontSize:13, marginBottom:8 }}>Effluent Flow, MGD</div>
            <div style=${{ color:C.muted, fontSize:12, marginBottom:10, lineHeight:1.4 }}>
              Annual Average (Permit Evaluation) — monthly data points with permit limit and 75/90 planning thresholds
            </div>
            <${AAFChart} data=${chartData} />
          </div>
        </div>
      </main>

      <!-- FOOTER -->
      <footer style=${{ display:"flex", justifyContent:"space-between", color:C.muted, fontSize:11, paddingTop:6, borderTop:`1px solid rgba(255,255,255,.08)` }}>
        <span>All flows in mgd (million gallons per day). Data refreshed daily.</span>
        <span>Questions or feedback? Contact <a href="mailto:" style=${{ color:"#5da8ff" }}>WWIP Support</a></span>
      </footer>
    </div>
  `;
}
exports['PermitEvaluationAAFPage'] = PermitEvaluationAAFPage;
  });

  __wwip_define__('src/pages/permit-evaluation-7590.js', function (module, exports, __wwip_require__) {
const { h } = __wwip_require__('app/lib/preact.module.js');
const { useState, useMemo } = __wwip_require__('app/lib/preact-hooks.module.js');
const htm = __wwip_require__('app/lib/htm.module.js').default;
const { ChartWrap } = __wwip_require__('src/components/chart-base.js');
const {
  CUSTOM_DATE_RANGE_KEY,
  filterSeriesByBounds,
  getActiveBounds,
  getPresetBounds,
  getRoleSeries,
  inferSeriesBounds,
  maxNumeric,
  averageNumeric,
  withCustomDateOption,
} = __wwip_require__('src/date-range.js');
// Bespoke page for Permit Evaluation 75/90 Rule.





const html = htm.bind(h);

const C = { bg:"#071425", card:"#10253f", line:"rgba(120,170,220,.16)", text:"#eef4fb", muted:"#9db0c7", accent:"#27d7d7" };
function resolve(visual, plant, bounds) {
  const base = (plant && visual?.data_by_plant?.[plant]) ? visual.data_by_plant[plant] : visual?.data;
  return filterSeriesByBounds(base, bounds);
}

const NAMES = {
  "DATATBL.Rolling 3 Months Minimum":                "Rolling 3-Month Min Flow, MGD",
  "Avg(DATATBL.Color Format for Flow)":              "Monthly Permit Limit",
  "Sum(DATATBL.90%)":                                "90% Threshold",
  "Sum(DATATBL.75%)":                                "75% Threshold",
};
const Y2_COLORS = ["#d74c45","#ef9447","#72c98f"];

function ComboChart({ data }) {
  if (!data) return html`<div style=${{flex:1,display:"grid",placeItems:"center",color:C.muted}}>No data</div>`;
  const xs = data.x || [];
  const series = data.series || [];
  const ySer  = series.filter(s => s.role==="y" || !s.role);
  const y2Ser = series.filter(s => s.role==="y2");

  const datasets = [
    ...ySer.map(s => ({
      label: NAMES[s.name] || s.name, data: s.values||[], type:"bar",
      backgroundColor:"rgba(39,215,215,0.65)", borderColor:C.accent,
      borderWidth:0, borderRadius:2, order:2,
    })),
    ...y2Ser.map((s,i) => ({
      label: NAMES[s.name] || s.name, data: s.values||[], type:"line",
      borderColor:Y2_COLORS[i]||"#fff", borderWidth:i===0?2.5:1.5,
      borderDash:i===0?[]:[6,3], pointRadius:0, fill:false, tension:0,
      order:1,
    })),
  ];
  const allVals = [...ySer, ...y2Ser].flatMap(s => s.values||[]).filter(v=>v!=null);
  const sharedMax = allVals.length ? Math.max(...allVals)*1.1 : undefined;

  const opts = {
    responsive:true, maintainAspectRatio:false, animation:false,
    plugins:{ legend:{display:true,position:"top",align:"start",labels:{color:C.muted,font:{size:11},boxWidth:10,padding:10}}, tooltip:{mode:"index",intersect:false} },
    scales:{
      x:{ ticks:{color:C.muted,font:{size:9},maxTicksLimit:12}, grid:{color:"rgba(255,255,255,0.05)"} },
      y:{ ticks:{color:C.muted,font:{size:9}}, grid:{color:"rgba(255,255,255,0.05)"}, beginAtZero:true, max:sharedMax, title:{display:true,text:"MGD",color:C.muted,font:{size:10}} },
    },
  };
  return html`<div style=${{position:"relative",flex:1,minHeight:0}}><${ChartWrap} type="bar" data=${{labels:xs,datasets}} options=${opts} /></div>`;
}

function KpiCard({ label, value, format }) {
  let display = "—";
  if (value != null) {
    if (format==="pct") display = `${(value*100).toFixed(1)}%`;
    else display = `${value.toLocaleString(undefined,{maximumFractionDigits:2})} MGD`;
  }
  return html`
    <div style=${{background:`linear-gradient(180deg,${C.card},#0d2139)`,border:`1px solid ${C.line}`,borderRadius:14,padding:"14px 18px"}}>
      <div style=${{color:C.muted,fontSize:11,textTransform:"uppercase",letterSpacing:".06em",marginBottom:6}}>${label}</div>
      <div style=${{fontSize:"1.6rem",fontWeight:800,color:C.accent}}>${display}</div>
    </div>`;
}

function PermitEvaluation7590Page({ page, manifest, currentDateRange }) {
  const visuals  = page.visuals || [];
  const plants   = page.plant_slicer?.options || [];
  const dateOpts = page.date_slicer?.options  || [];
  const anchor   = page.date_slicer?.anchor_date || "";
  const COMBO = new Set(["lineClusteredColumnComboChart","lineStackedColumnComboChart"]);
  const initialRange = currentDateRange || page.date_slicer?.default || "last_5_years";
  const comboVisual = visuals.find(v => COMBO.has(v.type));
  const initialBase = (page.plant_slicer?.default && comboVisual?.data_by_plant?.[page.plant_slicer.default]) || comboVisual?.data;
  const initialBounds = getPresetBounds(initialRange, anchor) || inferSeriesBounds(initialBase) || { start: "", end: "" };

  const [plant, setPlant] = useState(page.plant_slicer?.default || plants[0] || "");
  const [search, setSearch] = useState("");
  const [range,  setRange]  = useState(initialRange);
  const [customStart, setCustomStart] = useState(initialBounds.start || "");
  const [customEnd, setCustomEnd] = useState(initialBounds.end || "");

  const comboVis = comboVisual;
  const cards    = visuals.filter(v => v.type==="card" && (v.data || v.data_by_plant));
  const dateOptions = useMemo(() => withCustomDateOption(dateOpts), [dateOpts]);
  const activeBounds = useMemo(() => getActiveBounds({
    range,
    anchorDate: anchor,
    customStart,
    customEnd,
  }), [range, anchor, customStart, customEnd]);

  const chartData = useMemo(() => resolve(comboVis, plant, activeBounds), [comboVis, plant, activeBounds]);
  const fallbackCard0  = useMemo(() => { const d=(plant&&cards[0]?.data_by_plant?.[plant])||cards[0]?.data; return d?.value??null; }, [cards, plant]);
  const fallbackCard1  = useMemo(() => { const d=(plant&&cards[1]?.data_by_plant?.[plant])||cards[1]?.data; return d?.value??null; }, [cards, plant]);
  const card0val = useMemo(() => {
    const series = getRoleSeries(chartData, "y") || getRoleSeries(chartData, null);
    return maxNumeric(series?.values) ?? fallbackCard0;
  }, [chartData, fallbackCard0]);
  const card1val = useMemo(() => {
    const permit = averageNumeric(getRoleSeries(chartData, "y2")?.values);
    return (card0val != null && permit) ? (card0val / permit) : fallbackCard1;
  }, [chartData, card0val, fallbackCard1]);

  const filteredPlants = plants.filter(p => p.toLowerCase().includes(search.toLowerCase()));
  const violations = (manifest?.totals?.violations || 0).toLocaleString();
  const refresh    = (manifest?.last_refresh || "—").slice(0, 10);

  const cardStyle = { background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`, borderRadius:14 };

  return html`
    <div style=${{ background:`radial-gradient(circle at 20% 10%,#16365f55,transparent 25%),linear-gradient(180deg,#05101d,${C.bg})`, height:"100vh", color:C.text, fontFamily:"Inter,system-ui,sans-serif", fontSize:14, padding:18, display:"grid", gap:12, gridTemplateRows:"auto 1fr auto", overflow:"hidden" }}>

      <header style=${{ display:"grid", gridTemplateColumns:"64px 1fr auto", gap:14, alignItems:"start" }}>
        <button onClick=${() => { window.location.hash = "#/home"; }} style=${{...cardStyle, height:64, display:"grid", placeItems:"center", fontSize:28, color:C.muted, cursor:"pointer" }}>←</button>
        <div>
          <small style=${{ display:"block", color:C.accent, fontWeight:700, textTransform:"uppercase", letterSpacing:".04em", fontSize:11, marginBottom:4 }}>City of Houston — Public Works &amp; Engineering</small>
          <h1 style=${{ margin:0, fontSize:26, fontWeight:800, lineHeight:1.05 }}>
            WWiP Plant-Intelligence-System <span style=${{ color:C.accent }}>· Permit Evaluation, 75/90 Rule</span>
          </h1>
        </div>
        <div style=${{...cardStyle, padding:"12px 14px", minWidth:210}}>
          <div style=${{ color:C.muted, fontSize:11, textTransform:"uppercase", letterSpacing:".04em" }}>Date Range</div>
          <select value=${range} onChange=${e=>setRange(e.target.value)} style=${{ marginTop:8, width:"100%", padding:"8px 10px", border:`1px solid ${C.line}`, borderRadius:10, background:"#0b1c31", color:C.text, fontFamily:"inherit", fontSize:13 }}>
            ${dateOptions.map(o => html`<option value=${o.key}>${o.label}</option>`)}
          </select>
          ${range === CUSTOM_DATE_RANGE_KEY && html`
            <div style=${{ display:"grid", gap:8, marginTop:10 }}>
              <input type="date" value=${customStart} max=${customEnd || undefined} onInput=${e => setCustomStart(e.target.value)}
                style=${{ width:"100%", padding:"8px 10px", border:`1px solid ${C.line}`, borderRadius:10, background:"#0b1c31", color:C.text, fontFamily:"inherit", fontSize:13 }} />
              <input type="date" value=${customEnd} min=${customStart || undefined} onInput=${e => setCustomEnd(e.target.value)}
                style=${{ width:"100%", padding:"8px 10px", border:`1px solid ${C.line}`, borderRadius:10, background:"#0b1c31", color:C.text, fontFamily:"inherit", fontSize:13 }} />
            </div>
          `}
        </div>
      </header>

      <main style=${{ display:"grid", gridTemplateColumns:"220px 1fr", gap:12, minHeight:0 }}>

        <aside style=${{...cardStyle, padding:12, overflow:"auto"}}>
          <h3 style=${{ margin:"0 0 8px", color:C.accent, fontSize:13 }}>WWTP</h3>
          <input placeholder="Search WWTP" value=${search} onInput=${e=>setSearch(e.target.value)}
            style=${{ width:"100%", padding:"8px 10px", borderRadius:10, border:`1px solid ${C.line}`, background:"#0a1a2e", color:C.text, fontFamily:"inherit", fontSize:12, marginBottom:8 }} />
          <div style=${{ display:"grid", gap:4 }}>
            ${filteredPlants.map(p => html`
              <label key=${p} style=${{ display:"flex", gap:8, alignItems:"center", padding:"5px 6px", borderRadius:8, cursor:"pointer", fontSize:12, background:p===plant?"rgba(39,215,215,0.12)":"transparent", color:p===plant?C.accent:C.muted }}>
                <input type="radio" name="plant" checked=${p===plant} onChange=${()=>setPlant(p)} style=${{ accentColor:C.accent }} />
                ${p}
              </label>`)}
          </div>
        </aside>

        <div style=${{ display:"flex", flexDirection:"column", gap:12, minHeight:0 }}>
          <div style=${{ display:"grid", gridTemplateColumns:"1fr 1fr 2fr", gap:12, flexShrink:0 }}>
            <${KpiCard} label="Max Rolling 3-Month Min" value=${card0val} format="mgd" />
            <${KpiCard} label="75/90 Min % of Permit"   value=${card1val} format="pct" />
            <div style=${{...cardStyle, padding:"12px 16px"}}>
              <div style=${{ fontWeight:700, fontSize:13 }}>Effluent Flow, MGD</div>
              <div style=${{ color:C.muted, fontSize:12, marginTop:4, lineHeight:1.4 }}>
                75/90 Rule Evaluation — rolling 3-month minimum with permit limit and planning thresholds. Triggers: 75% = begin planning expansion; 90% = construction required.
              </div>
            </div>
          </div>

          <div style=${{...cardStyle, padding:"14px 16px", flex:1, display:"flex", flexDirection:"column", minHeight:0}}>
            <${ComboChart} data=${chartData} />
          </div>
        </div>
      </main>

      <footer style=${{ display:"flex", justifyContent:"space-between", color:C.muted, fontSize:11, paddingTop:6, borderTop:`1px solid rgba(255,255,255,.08)` }}>
        <span>All flows in mgd (million gallons per day). Data refreshed daily.</span>
        <span>Questions or feedback? Contact <a href="mailto:" style=${{ color:"#5da8ff" }}>WWIP Support</a></span>
      </footer>
    </div>`;
}
exports['PermitEvaluation7590Page'] = PermitEvaluation7590Page;
  });

  __wwip_define__('src/pages/ef-flow-aaf-maf.js', function (module, exports, __wwip_require__) {
const { h } = __wwip_require__('app/lib/preact.module.js');
const { useState, useMemo } = __wwip_require__('app/lib/preact-hooks.module.js');
const htm = __wwip_require__('app/lib/htm.module.js').default;
const { ChartWrap } = __wwip_require__('src/components/chart-base.js');
const {
  CUSTOM_DATE_RANGE_KEY,
  filterSeriesByBounds,
  getActiveBounds,
  getPresetBounds,
  inferSeriesBounds,
  withCustomDateOption,
} = __wwip_require__('src/date-range.js');
// Bespoke page for "Ef Flow (AAF & MAF)" — Comparison of Permit Evaluation, AAF & MAF.
// Layout mirrors permit-evaluation-aaf.js: dark-theme sidebar + main chart + permit table.





const html = htm.bind(h);

const C = {
  bg:     "#071425",
  card:   "#10253f",
  line:   "rgba(120,170,220,.16)",
  text:   "#eef4fb",
  muted:  "#9db0c7",
  accent: "#27d7d7",
};

function resolve(visual, plant, bounds) {
  if (!visual) return null;
  const base = (plant && visual.data_by_plant?.[plant]) ? visual.data_by_plant[plant] : visual.data;
  return filterSeriesByBounds(base, bounds);
}

// Bar colors (navy / gold) and line colors (near-black / dark-red / dark-gold)
const COLORS_Y  = ["#3d5a8a", "#d4a820"];
const COLORS_Y2 = ["#ffffff", "#c0392b", "#b8860b"];

// ── Combo chart ────────────────────────────────────────────────────
function AAFMAFChart({ data }) {
  if (!data) return html`<div style=${{ flex:1, display:"grid", placeItems:"center", color:C.muted }}>No data</div>`;

  const xs      = data.x || [];
  const series  = data.series || [];
  const ySeries  = series.filter(s => s.role === "y");
  const y2Series = series.filter(s => s.role === "y2");

  const datasets = [
    ...ySeries.map((s, i) => ({
      label: s.name,
      data: s.values || [],
      type: "bar",
      backgroundColor: COLORS_Y[i] || "#888",
      borderColor:     COLORS_Y[i] || "#888",
      borderWidth: 0,
      borderRadius: 2,
      order: 2,
    })),
    ...y2Series.map((s, i) => ({
      label: s.name,
      data: s.values || [],
      type: "line",
      borderColor:     COLORS_Y2[i] || "#fff",
      backgroundColor: "transparent",
      borderWidth: i === 0 ? 2.5 : 1.5,
      borderDash: i === 0 ? [] : [6, 3],
      pointRadius: 0,
      fill: false,
      tension: 0,
      spanGaps: true,
      order: 1,
    })),
  ];

  const allVals = [...ySeries, ...y2Series]
    .flatMap(s => s.values || [])
    .filter(v => v != null);
  const sharedMax = allVals.length ? Math.max(...allVals) * 1.1 : undefined;

  const opts = {
    responsive: true, maintainAspectRatio: false, animation: false,
    plugins: {
      legend: { display:true, position:"top", align:"start",
        labels: { color:C.muted, font:{size:11}, boxWidth:10, padding:10 } },
      tooltip: { mode:"index", intersect:false },
    },
    scales: {
      x: { ticks:{ color:C.muted, font:{size:9}, maxTicksLimit:12 }, grid:{ color:"rgba(255,255,255,0.05)" } },
      y: {
        ticks:{ color:C.muted, font:{size:9} },
        grid:{ color:"rgba(255,255,255,0.05)" },
        beginAtZero:true,
        max: sharedMax,
        title:{ display:true, text:"MGD", color:C.muted, font:{size:10} },
      },
    },
  };

  return html`
    <div style=${{ position:"relative", flex:1, minHeight:0 }}>
      <${ChartWrap} type="bar" data=${{ labels:xs, datasets }} options=${opts} />
    </div>
  `;
}

// ── Permit limits table ────────────────────────────────────────────
function PermitTable({ visual, plant }) {
  const d = (plant && visual?.data_by_plant?.[plant]) || visual?.data;
  if (!d) return null;
  const columns = d.columns || [];
  const rows    = d.rows    || [];
  const labels  = visual.column_labels || {};
  const headers = columns.map(c => labels[c] || c);
  return html`
    <table style=${{ width:"100%", borderCollapse:"collapse", fontSize:12 }}>
      <thead>
        <tr>${headers.map(h => html`
          <th key=${h} style=${{ padding:"6px 10px", textAlign:"left", color:C.muted,
            borderBottom:`1px solid ${C.line}`, fontWeight:600, fontSize:11,
            textTransform:"uppercase", letterSpacing:".04em" }}>${h}</th>
        `)}</tr>
      </thead>
      <tbody>${rows.map((row, ri) => html`
        <tr key=${ri} style=${{ borderBottom:"1px solid rgba(255,255,255,.04)" }}>
          ${row.map((cell, ci) => html`
            <td key=${ci} style=${{ padding:"5px 10px", color:C.text }}>${cell ?? "—"}</td>
          `)}
        </tr>
      `)}</tbody>
    </table>
  `;
}

// ── Main export ────────────────────────────────────────────────────
function EfFlowAAFMAFPage({ page, manifest, currentDateRange }) {
  const visuals  = page.visuals || [];
  const plants   = page.plant_slicer?.options || [];
  const dateOpts = page.date_slicer?.options  || [];
  const anchor   = page.date_slicer?.anchor_date || "";
  const COMBO_TYPES = new Set(["lineClusteredColumnComboChart","lineStackedColumnComboChart"]);
  const initialRange = currentDateRange || page.date_slicer?.default || "last_5_years";
  const initialChart = visuals.find(v => COMBO_TYPES.has(v.type));
  const initialBase = (page.plant_slicer?.default && initialChart?.data_by_plant?.[page.plant_slicer.default]) || initialChart?.data;
  const initialBounds = getPresetBounds(initialRange, anchor) || inferSeriesBounds(initialBase) || { start: "", end: "" };

  const [plant,  setPlant]  = useState(page.plant_slicer?.default || plants[0] || "");
  const [search, setSearch] = useState("");
  const [range,  setRange]  = useState(initialRange);
  const [customStart, setCustomStart] = useState(initialBounds.start || "");
  const [customEnd, setCustomEnd] = useState(initialBounds.end || "");

  const comboVis = initialChart;
  const tableVis = visuals.find(v => v.type === "tableEx");
  const dateOptions = useMemo(() => withCustomDateOption(dateOpts), [dateOpts]);
  const activeBounds = useMemo(() => getActiveBounds({
    range,
    anchorDate: anchor,
    customStart,
    customEnd,
  }), [range, anchor, customStart, customEnd]);

  const chartData = useMemo(() => resolve(comboVis, plant, activeBounds), [comboVis, plant, activeBounds]);

  const filteredPlants = plants.filter(p => p.toLowerCase().includes(search.toLowerCase()));
  const refresh = (manifest?.last_refresh || "—").slice(0, 10);

  return html`
    <div style=${{
      background:`radial-gradient(circle at 20% 10%,#16365f55,transparent 25%),linear-gradient(180deg,#05101d,${C.bg})`,
      height:"100vh", color:C.text, fontFamily:"Inter,system-ui,sans-serif",
      fontSize:14, padding:18, display:"grid", gap:12,
      gridTemplateRows:"auto 1fr auto", overflow:"hidden",
    }}>

      <!-- HEADER -->
      <header style=${{ display:"grid", gridTemplateColumns:"64px 1fr auto", gap:14, alignItems:"start" }}>
        <button onClick=${() => { window.location.hash = "#/home"; }}
          style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`,
            borderRadius:14, height:64, display:"grid", placeItems:"center", fontSize:28, color:C.muted, cursor:"pointer" }}>←</button>
        <div>
          <small style=${{ display:"block", color:C.accent, fontWeight:700, textTransform:"uppercase", letterSpacing:".04em", fontSize:11, marginBottom:4 }}>
            City of Houston — Public Works &amp; Engineering
          </small>
          <h1 style=${{ margin:0, fontSize:26, fontWeight:800, lineHeight:1.05 }}>
            WWiP Plant-Intelligence-System <span style=${{ color:C.accent }}>· Comparison of Permit Evaluation, AAF &amp; MAF</span>
          </h1>
        </div>
        <div style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`, borderRadius:14, padding:"12px 14px", minWidth:210 }}>
          <div style=${{ color:C.muted, fontSize:11, textTransform:"uppercase", letterSpacing:".04em" }}>Date Range</div>
          <select value=${range} onChange=${e => setRange(e.target.value)}
            style=${{ marginTop:8, width:"100%", padding:"8px 10px", border:`1px solid ${C.line}`, borderRadius:10,
              background:"#0b1c31", color:C.text, fontFamily:"inherit", fontSize:13 }}>
            ${dateOptions.map(o => html`<option value=${o.key}>${o.label}</option>`)}
          </select>
          ${range === CUSTOM_DATE_RANGE_KEY && html`
            <div style=${{ display:"grid", gap:8, marginTop:10 }}>
              <input type="date" value=${customStart} max=${customEnd || undefined} onInput=${e => setCustomStart(e.target.value)}
                style=${{ width:"100%", padding:"8px 10px", border:`1px solid ${C.line}`, borderRadius:10, background:"#0b1c31", color:C.text, fontFamily:"inherit", fontSize:13 }} />
              <input type="date" value=${customEnd} min=${customStart || undefined} onInput=${e => setCustomEnd(e.target.value)}
                style=${{ width:"100%", padding:"8px 10px", border:`1px solid ${C.line}`, borderRadius:10, background:"#0b1c31", color:C.text, fontFamily:"inherit", fontSize:13 }} />
            </div>
          `}
        </div>
      </header>

      <!-- MAIN -->
      <main style=${{ display:"grid", gridTemplateColumns:"220px 1fr", gap:12, minHeight:0 }}>

        <!-- WWTP SIDEBAR -->
        <aside style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`,
          borderRadius:14, padding:12, overflow:"auto" }}>
          <h3 style=${{ margin:"0 0 8px", color:C.accent, fontSize:13 }}>WWTP</h3>
          <input placeholder="Search WWTP" value=${search} onInput=${e => setSearch(e.target.value)}
            style=${{ width:"100%", padding:"8px 10px", borderRadius:10, border:`1px solid ${C.line}`,
              background:"#0a1a2e", color:C.text, fontFamily:"inherit", fontSize:12, marginBottom:8 }} />
          <div style=${{ display:"grid", gap:4 }}>
            ${filteredPlants.map(p => html`
              <label key=${p} style=${{ display:"flex", gap:8, alignItems:"center", padding:"5px 6px",
                borderRadius:8, cursor:"pointer", fontSize:12,
                background:p===plant?"rgba(39,215,215,0.12)":"transparent",
                color:p===plant?C.accent:C.muted }}>
                <input type="radio" name="plant" checked=${p===plant} onChange=${()=>setPlant(p)} style=${{ accentColor:C.accent }} />
                ${p}
              </label>
            `)}
          </div>
        </aside>

        <!-- CONTENT -->
        <div style=${{ display:"flex", flexDirection:"column", gap:12, minHeight:0 }}>

          <!-- COMBO CHART -->
          <div style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`,
            borderRadius:14, padding:"14px 16px", flex:1, display:"flex", flexDirection:"column", minHeight:0 }}>
            <div style=${{ fontWeight:700, fontSize:13, marginBottom:8 }}>
              Effluent Flow, MGD — Annual Average (Permit Evaluation) vs. Monthly Average
            </div>
            <${AAFMAFChart} data=${chartData} />
          </div>

          <!-- PERMIT LIMITS TABLE -->
          ${tableVis && html`
            <div style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`,
              borderRadius:14, padding:"12px 16px", flexShrink:0 }}>
              <div style=${{ fontWeight:700, fontSize:12, color:C.muted, marginBottom:8,
                textTransform:"uppercase", letterSpacing:".04em" }}>Permit Limits</div>
              <${PermitTable} visual=${tableVis} plant=${plant} />
            </div>
          `}
        </div>
      </main>

      <!-- FOOTER -->
      <footer style=${{ display:"flex", justifyContent:"space-between", color:C.muted, fontSize:11, paddingTop:6, borderTop:`1px solid rgba(255,255,255,.08)` }}>
        <span>All flows in MGD (million gallons per day). Data refreshed daily.</span>
        <span>Last refresh: ${refresh}</span>
      </footer>
    </div>
  `;
}
exports['EfFlowAAFMAFPage'] = EfFlowAAFMAFPage;
  });

  __wwip_define__('src/pages/ef-flow-adf-2hrpeak.js', function (module, exports, __wwip_require__) {
const { h } = __wwip_require__('app/lib/preact.module.js');
const { useState } = __wwip_require__('app/lib/preact-hooks.module.js');
const htm = __wwip_require__('app/lib/htm.module.js').default;
const { ChartWrap } = __wwip_require__('src/components/chart-base.js');
const {
  CUSTOM_DATE_RANGE_KEY,
  filterSeriesByBounds,
  getActiveBounds,
  getPresetBounds,
  inferSeriesBounds,
  withCustomDateOption,
} = __wwip_require__('src/date-range.js');
// Bespoke page for "ADF_2HrPeak_to_Download" — Effluent Flow | ADF and 2-hour Peak.
// Three stacked daily charts: Average Daily Flow, Rainfall, and 2-hr Peak with permit line.





const html = htm.bind(h);

const C = {
  bg:     "#071425",
  card:   "#10253f",
  line:   "rgba(120,170,220,.16)",
  text:   "#eef4fb",
  muted:  "#9db0c7",
  accent: "#27d7d7",
};

function resolve(visual, plant, bounds) {
  if (!visual) return null;
  const base = (plant && visual.data_by_plant?.[plant]) ? visual.data_by_plant[plant] : visual.data;
  return filterSeriesByBounds(base, bounds);
}

// ── Single daily bar chart ─────────────────────────────────────────
function DailyChart({ data, barColor, limitColor, yLabel }) {
  if (!data) return html`<div style=${{ flex:1, display:"grid", placeItems:"center", color:C.muted, fontSize:12 }}>No data</div>`;

  const xs      = data.x || [];
  const series  = data.series || [];
  const barS    = series.find(s => s.role === "y"  || !s.role);
  const limitS  = series.find(s => s.role === "y2");

  const datasets = [
    barS && {
      label: barS.name,
      data: barS.values || [],
      type: "bar",
      backgroundColor: barColor,
      borderColor: barColor,
      borderWidth: 0,
      borderRadius: 1,
      order: 2,
    },
    limitS && {
      label: limitS.name,
      data: limitS.values || [],
      type: "line",
      borderColor: limitColor || "#c0392b",
      backgroundColor: "transparent",
      borderWidth: 2,
      pointRadius: 0,
      fill: false,
      tension: 0,
      spanGaps: true,
      order: 1,
    },
  ].filter(Boolean);

  const allVals = [barS, limitS].filter(Boolean).flatMap(s => s.values || []).filter(v => v != null);
  const sharedMax = allVals.length ? Math.max(...allVals) * 1.1 : undefined;

  const opts = {
    responsive: true, maintainAspectRatio: false, animation: false,
    plugins: {
      legend: { display: true, position: "top", align: "start",
        labels: { color: C.muted, font:{size:10}, boxWidth:8, padding:8 } },
      tooltip: { mode:"index", intersect:false },
    },
    scales: {
      x: { ticks:{ color:C.muted, font:{size:8}, maxTicksLimit:10, autoSkip:true },
           grid:{ color:"rgba(255,255,255,0.04)" } },
      y: {
        ticks:{ color:C.muted, font:{size:9} },
        grid:{ color:"rgba(255,255,255,0.04)" },
        beginAtZero: true,
        max: sharedMax,
        title:{ display: !!yLabel, text: yLabel || "", color:C.muted, font:{size:9} },
      },
    },
  };

  return html`
    <div style=${{ position:"relative", flex:1, minHeight:0 }}>
      <${ChartWrap} type="bar" data=${{ labels:xs, datasets }} options=${opts} />
    </div>
  `;
}

// ── Permit table ───────────────────────────────────────────────────
function PermitTable({ visual, plant }) {
  const d = (plant && visual?.data_by_plant?.[plant]) || visual?.data;
  if (!d) return null;
  const columns = d.columns || [];
  const rows    = d.rows    || [];
  const labels  = visual.column_labels || {};
  const headers = columns.map(c => labels[c] || c);
  return html`
    <div style=${{ overflowX:"auto" }}>
      <table style=${{ width:"100%", borderCollapse:"collapse", fontSize:11 }}>
        <thead><tr>${headers.map(h => html`
          <th key=${h} style=${{ padding:"5px 8px", textAlign:"left", color:C.muted,
            borderBottom:`1px solid ${C.line}`, fontWeight:600, fontSize:10,
            textTransform:"uppercase", letterSpacing:".04em", whiteSpace:"nowrap" }}>${h}</th>
        `)}</tr></thead>
        <tbody>${rows.map((row, ri) => html`
          <tr key=${ri} style=${{ borderBottom:"1px solid rgba(255,255,255,.03)" }}>
            ${row.map((cell, ci) => html`
              <td key=${ci} style=${{ padding:"4px 8px", color:C.text, whiteSpace:"nowrap" }}>${cell ?? "—"}</td>
            `)}
          </tr>
        `)}</tbody>
      </table>
    </div>
  `;
}

// ── Main export ────────────────────────────────────────────────────
function EfFlowADF2hrPeakPage({ page, manifest, currentDateRange }) {
  const visuals  = page.visuals || [];
  const plants   = page.plant_slicer?.options || [];
  const dateOpts = page.date_slicer?.options  || [];
  const anchor   = page.date_slicer?.anchor_date || "";
  const initialRange = currentDateRange || "last_12_months";
  const COMBO = new Set(["lineClusteredColumnComboChart","lineStackedColumnComboChart"]);
  const combos = visuals.filter(v => COMBO.has(v.type));
  const initialAdf = combos.find(v => (v.title||"").toLowerCase().includes("average daily"));
  const initialBase = (page.plant_slicer?.default && initialAdf?.data_by_plant?.[page.plant_slicer.default]) || initialAdf?.data;
  const initialBounds = getPresetBounds(initialRange, anchor) || inferSeriesBounds(initialBase) || { start: "", end: "" };

  const [plant,  setPlant]  = useState(page.plant_slicer?.default || plants[0] || "");
  const [search, setSearch] = useState("");
  // PBIX default is 12 months for this daily-data page
  const [range,  setRange]  = useState(initialRange);
  const [customStart, setCustomStart] = useState(initialBounds.start || "");
  const [customEnd, setCustomEnd] = useState(initialBounds.end || "");

  const tableVis = visuals.find(v => v.type === "tableEx");
  const dateOptions = withCustomDateOption(dateOpts);
  const activeBounds = getActiveBounds({
    range,
    anchorDate: anchor,
    customStart,
    customEnd,
  });

  const adfVis    = combos.find(v => (v.title||"").toLowerCase().includes("average daily"));
  const peakVis   = combos.find(v => (v.title||"").toLowerCase().includes("2-hr"));
  const rainVis   = combos.find(v => (v.title||"").toLowerCase().includes("rainfall"));

  const adfData  = resolve(adfVis,  plant, activeBounds);
  const rainData = resolve(rainVis, plant, activeBounds);
  const peakData = resolve(peakVis, plant, activeBounds);

  const filteredPlants = plants.filter(p => p.toLowerCase().includes(search.toLowerCase()));
  const refresh = (manifest?.last_refresh || "—").slice(0, 10);

  return html`
    <div style=${{
      background:`radial-gradient(circle at 20% 10%,#16365f55,transparent 25%),linear-gradient(180deg,#05101d,${C.bg})`,
      height:"100vh", color:C.text, fontFamily:"Inter,system-ui,sans-serif",
      fontSize:14, padding:18, display:"grid", gap:12,
      gridTemplateRows:"auto 1fr auto", overflow:"hidden",
    }}>

      <!-- HEADER -->
      <header style=${{ display:"grid", gridTemplateColumns:"64px 1fr auto", gap:14, alignItems:"start" }}>
        <button onClick=${() => { window.location.hash = "#/home"; }}
          style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`,
            borderRadius:14, height:64, display:"grid", placeItems:"center",
            fontSize:28, color:C.muted, cursor:"pointer" }}>←</button>
        <div>
          <small style=${{ display:"block", color:C.accent, fontWeight:700, textTransform:"uppercase",
            letterSpacing:".04em", fontSize:11, marginBottom:4 }}>
            City of Houston — Public Works &amp; Engineering
          </small>
          <h1 style=${{ margin:0, fontSize:26, fontWeight:800, lineHeight:1.05 }}>
            WWiP Plant-Intelligence-System
            <span style=${{ color:C.accent }}> · Effluent Flow | ADF and 2-hour Peak</span>
          </h1>
        </div>
        <div style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`,
          borderRadius:14, padding:"12px 14px", minWidth:210 }}>
          <div style=${{ color:C.muted, fontSize:11, textTransform:"uppercase", letterSpacing:".04em" }}>Date Range</div>
          <select value=${range} onChange=${e => setRange(e.target.value)}
            style=${{ marginTop:8, width:"100%", padding:"8px 10px", border:`1px solid ${C.line}`,
              borderRadius:10, background:"#0b1c31", color:C.text, fontFamily:"inherit", fontSize:13 }}>
            ${dateOptions.map(o => html`<option value=${o.key}>${o.label}</option>`)}
          </select>
          ${range === CUSTOM_DATE_RANGE_KEY && html`
            <div style=${{ display:"grid", gap:8, marginTop:10 }}>
              <input type="date" value=${customStart} max=${customEnd || undefined} onInput=${e => setCustomStart(e.target.value)}
                style=${{ width:"100%", padding:"8px 10px", border:`1px solid ${C.line}`, borderRadius:10, background:"#0b1c31", color:C.text, fontFamily:"inherit", fontSize:13 }} />
              <input type="date" value=${customEnd} min=${customStart || undefined} onInput=${e => setCustomEnd(e.target.value)}
                style=${{ width:"100%", padding:"8px 10px", border:`1px solid ${C.line}`, borderRadius:10, background:"#0b1c31", color:C.text, fontFamily:"inherit", fontSize:13 }} />
            </div>
          `}
        </div>
      </header>

      <!-- MAIN -->
      <main style=${{ display:"grid", gridTemplateColumns:"220px 1fr", gap:12, minHeight:0 }}>

        <!-- WWTP SIDEBAR -->
        <aside style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`,
          borderRadius:14, padding:12, overflow:"auto" }}>
          <h3 style=${{ margin:"0 0 8px", color:C.accent, fontSize:13 }}>WWTP</h3>
          <input placeholder="Search WWTP" value=${search} onInput=${e => setSearch(e.target.value)}
            style=${{ width:"100%", padding:"8px 10px", borderRadius:10, border:`1px solid ${C.line}`,
              background:"#0a1a2e", color:C.text, fontFamily:"inherit", fontSize:12, marginBottom:8 }} />
          <div style=${{ display:"grid", gap:4 }}>
            ${filteredPlants.map(p => html`
              <label key=${p} style=${{ display:"flex", gap:8, alignItems:"center", padding:"5px 6px",
                borderRadius:8, cursor:"pointer", fontSize:12,
                background:p===plant?"rgba(39,215,215,0.12)":"transparent",
                color:p===plant?C.accent:C.muted }}>
                <input type="radio" name="plant" checked=${p===plant}
                  onChange=${()=>setPlant(p)} style=${{ accentColor:C.accent }} />${p}
              </label>
            `)}
          </div>
        </aside>

        <!-- CONTENT -->
        <div style=${{ display:"flex", flexDirection:"column", gap:10, minHeight:0 }}>

          <!-- PERMIT TABLE -->
          ${tableVis && html`
            <div style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`,
              borderRadius:14, padding:"10px 14px", flexShrink:0 }}>
              <div style=${{ fontWeight:700, fontSize:11, color:C.muted, marginBottom:6,
                textTransform:"uppercase", letterSpacing:".04em" }}>Permit Limits</div>
              <${PermitTable} visual=${tableVis} plant=${plant} />
            </div>
          `}

          <!-- ADF CHART -->
          <div style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`,
            borderRadius:14, padding:"10px 14px", flex:1, display:"flex", flexDirection:"column", minHeight:0 }}>
            <div style=${{ fontWeight:700, fontSize:12, marginBottom:6 }}>Average Daily Flow, MGD</div>
            <${DailyChart} data=${adfData} barColor="rgba(114,201,143,0.8)" yLabel="MGD" />
          </div>

          <!-- RAINFALL CHART -->
          <div style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`,
            borderRadius:14, padding:"10px 14px", flex:1, display:"flex", flexDirection:"column", minHeight:0 }}>
            <div style=${{ fontWeight:700, fontSize:12, marginBottom:6 }}>Rainfall Depth, Inch</div>
            <${DailyChart} data=${rainData} barColor="rgba(167,139,250,0.8)" yLabel="Inches" />
          </div>

          <!-- 2-HR PEAK CHART -->
          <div style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`,
            borderRadius:14, padding:"10px 14px", flex:1, display:"flex", flexDirection:"column", minHeight:0 }}>
            <div style=${{ fontWeight:700, fontSize:12, marginBottom:6 }}>2-hr Peak Flow, GPM</div>
            <${DailyChart} data=${peakData} barColor="rgba(251,146,60,0.8)" limitColor="#c0392b" yLabel="GPM" />
          </div>

        </div>
      </main>

      <!-- FOOTER -->
      <footer style=${{ display:"flex", justifyContent:"space-between", color:C.muted, fontSize:11,
        paddingTop:6, borderTop:`1px solid rgba(255,255,255,.08)` }}>
        <span>ADF in MGD · 2-hr Peak in GPM · Rainfall in inches. Data refreshed daily.</span>
        <span>Last refresh: ${refresh}</span>
      </footer>
    </div>
  `;
}
exports['EfFlowADF2hrPeakPage'] = EfFlowADF2hrPeakPage;
  });

  __wwip_define__('src/pages/statistical-flows.js', function (module, exports, __wwip_require__) {
const { h } = __wwip_require__('app/lib/preact.module.js');
const { useState, useMemo } = __wwip_require__('app/lib/preact-hooks.module.js');
const htm = __wwip_require__('app/lib/htm.module.js').default;
const { ChartWrap } = __wwip_require__('src/components/chart-base.js');
const {
  CUSTOM_DATE_RANGE_KEY,
  filterSeriesByBounds,
  filterMonthMatrixByBounds,
  getActiveBounds,
  getPresetBounds,
  getRoleSeries,
  inferSeriesBounds,
  inferMonthMatrixBounds,
  maxNumeric,
  averageNumeric,
  sampleStdDevNumeric,
  withCustomDateOption,
  monthMatrixValues,
} = __wwip_require__('src/date-range.js');
// Bespoke page for "Statistical Flows" — HachWIMS Flow Statistics.
// Layout: 6 KPI cards + 3 horizontal pivot tables + daily ADF bar chart.





const html = htm.bind(h);

const C = {
  bg:     "#071425",
  card:   "#10253f",
  line:   "rgba(120,170,220,.16)",
  text:   "#eef4fb",
  muted:  "#9db0c7",
  accent: "#27d7d7",
};

const MONTH_LABELS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

function KpiCard({ label, value, accent }) {
  const display = value != null ? value.toFixed(2) : "—";
  return html`
    <div style=${{
      background: accent
        ? `linear-gradient(180deg,rgba(39,215,215,.12),rgba(39,215,215,.05))`
        : `linear-gradient(180deg,${C.card},#0d2139)`,
      border: `1px solid ${accent ? "rgba(39,215,215,.3)" : C.line}`,
      borderRadius: 12, padding: "12px 16px", flex: 1, minWidth: 0,
    }}>
      <div style=${{ fontSize: "1.7rem", fontWeight: 800,
        color: accent ? C.accent : C.text, lineHeight: 1.1 }}>${display}</div>
      <div style=${{ color: C.muted, fontSize: 11, marginTop: 4,
        textTransform: "uppercase", letterSpacing: ".04em" }}>${label}</div>
    </div>
  `;
}

function PivotTable({ title, data, plant }) {
  if (!data || !data.months?.length) return html`
    <div style=${{ color: C.muted, fontSize: 12, padding: "8px 0" }}>No data for this selection</div>
  `;

  const months  = data.months;
  const values  = data.values || {};

  const byYear = [];
  let cur = null;
  for (const { yr, mo } of months) {
    if (!cur || cur.yr !== yr) {
      cur = { yr, months: [] };
      byYear.push(cur);
    }
    cur.months.push(mo);
  }

  const tdBase = { padding: "4px 8px", whiteSpace: "nowrap", fontSize: 12, textAlign: "right", borderRight: `1px solid rgba(255,255,255,.04)` };

  return html`
    <div style=${{ marginBottom: 12 }}>
      <div style=${{ fontWeight: 700, fontSize: 12, color: C.muted, marginBottom: 6,
        textTransform: "uppercase", letterSpacing: ".04em" }}>${title}</div>
      <div style=${{ overflowX: "auto" }}>
        <table style=${{ borderCollapse: "collapse", fontSize: 12, minWidth: "100%" }}>
          <thead>
            <tr>
              <th style=${{ ...tdBase, textAlign: "left", color: C.muted, minWidth: 130,
                position: "sticky", left: 0, background: C.card, zIndex: 1 }}>WWTP</th>
              ${byYear.map(({ yr, months: mos }) => html`
                <th key=${yr} colSpan=${mos.length + 1}
                  style=${{ ...tdBase, textAlign: "center", color: C.accent, fontWeight: 700,
                    borderLeft: "2px solid rgba(39,215,215,.2)" }}>${yr}</th>
              `)}
            </tr>
            <tr>
              <th style=${{ ...tdBase, textAlign: "left", color: C.muted,
                position: "sticky", left: 0, background: C.card, zIndex: 1 }}> </th>
              ${byYear.map(({ yr, months: mos }) => html`
                ${mos.map(mo => html`
                  <th key=${yr+"-"+mo} style=${{ ...tdBase, color: C.muted, fontWeight: 400 }}>
                    ${MONTH_LABELS[mo - 1]}
                  </th>
                `)}
                <th key=${yr+"-T"} style=${{ ...tdBase, color: C.text, fontWeight: 700,
                  background: "rgba(255,255,255,.03)", borderLeft: "2px solid rgba(255,255,255,.08)" }}>
                  Total
                </th>
              `)}
            </tr>
          </thead>
          <tbody>
            <tr style=${{ borderTop: `1px solid ${C.line}` }}>
              <td style=${{ ...tdBase, textAlign: "left", color: C.text, fontWeight: 600,
                position: "sticky", left: 0, background: "#0d1f35", zIndex: 1 }}>${plant || "—"}</td>
              ${byYear.map(({ yr, months: mos }) => html`
                ${mos.map(mo => {
                  const v = values[yr + "-" + mo];
                  return html`
                    <td key=${yr+"-"+mo} style=${{ ...tdBase, color: C.text }}>
                      ${v != null ? v.toFixed(2) : "—"}
                    </td>
                  `;
                })}
                <td key=${yr+"-T"} style=${{ ...tdBase, color: C.text, fontWeight: 700,
                  background: "rgba(255,255,255,.03)", borderLeft: "2px solid rgba(255,255,255,.08)" }}>
                  ${values[yr + "-total"] != null ? values[yr + "-total"].toFixed(2) : "—"}
                </td>
              `)}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function ADFChart({ data, plant }) {
  if (!data) return null;
  const xs     = data.x || [];
  const vals   = data.series?.[0]?.values || [];
  const datasets = [{
    label: "Daily Avg Flow, MGD",
    data: vals,
    type: "bar",
    backgroundColor: "rgba(114,201,143,0.75)",
    borderColor: "rgba(114,201,143,0.75)",
    borderWidth: 0,
    borderRadius: 1,
  }];
  const opts = {
    responsive: true, maintainAspectRatio: false, animation: false,
    plugins: {
      legend: { display: false },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { ticks: { color: C.muted, font: { size: 8 }, maxTicksLimit: 12, autoSkip: true },
           grid: { color: "rgba(255,255,255,0.03)" } },
      y: { ticks: { color: C.muted, font: { size: 9 } },
           grid: { color: "rgba(255,255,255,0.03)" },
           beginAtZero: true,
           title: { display: true, text: "MGD", color: C.muted, font: { size: 9 } } },
    },
  };
  return html`
    <div style=${{ position: "relative", flex: 1, minHeight: 0 }}>
      <${ChartWrap} key=${"adf-"+plant} type="bar" data=${{ labels: xs, datasets }} options=${opts} />
    </div>
  `;
}

function StatisticalFlowsPage({ page, manifest, currentDateRange }) {
  const visuals  = page.visuals || [];
  const plants   = page.plant_slicer?.options || [];
  const dateOpts = page.date_slicer?.options  || [];
  const anchor   = page.date_slicer?.anchor_date || "";
  const initialRange = currentDateRange || page.date_slicer?.default || "last_5_years";

  const [plant, setPlant] = useState(page.plant_slicer?.default || plants[0] || "");
  const [range, setRange] = useState(initialRange);

  const CARD_CFG = [
    { binding: "Sum(LIMITS.LIMIT_VALUE)", label: "Permitted Annual Avg Flow", accent: false },
    { binding: "Sum(DATATBL.90%)",        label: "90% of Permit",             accent: false },
    { binding: "Sum(DATATBL.75%)",        label: "75% of Permit",             accent: false },
    { binding: "DATATBL.MAX Curval",      label: "Permit Evaluated Flow",     accent: true  },
    { binding: "DATATBL.AVG_Calc",        label: "AVG (Selected Period)",     accent: false },
    { binding: "DATATBL.STDEV.S",         label: "Standard Deviation",        accent: false },
  ];

  const cardVis = Object.fromEntries(
    visuals.filter(v => v.type === "card").map(v => {
      const binding = v.projections?.Values?.[0] || "";
      return [binding, v];
    })
  );

  const pivots = visuals.filter(v => v.type === "pivotTable");
  const aafPivot  = pivots.find(v => (v.title||"").toLowerCase().includes("permitted annual"));
  const adfPivot  = pivots.find(v => (v.title||"").toLowerCase().includes("average daily flow"));
  const rainPivot = pivots.find(v => (v.title||"").toLowerCase().includes("rainfall"));
  const chartVis  = visuals.find(v => v.type === "lineClusteredColumnComboChart");

  const initialPivotBase = (page.plant_slicer?.default && aafPivot?.data_by_plant?.[page.plant_slicer.default]) || aafPivot?.data;
  const initialChartBase = (page.plant_slicer?.default && chartVis?.data_by_plant?.[page.plant_slicer.default]) || chartVis?.data;
  const initialBounds = getPresetBounds(initialRange, anchor)
    || inferMonthMatrixBounds(initialPivotBase)
    || inferSeriesBounds(initialChartBase)
    || { start: "", end: "" };

  const [customStart, setCustomStart] = useState(initialBounds.start || "");
  const [customEnd, setCustomEnd] = useState(initialBounds.end || "");
  const dateOptions = useMemo(() => withCustomDateOption(dateOpts), [dateOpts]);
  const activeBounds = useMemo(() => getActiveBounds({
    range,
    anchorDate: anchor,
    customStart,
    customEnd,
  }), [range, anchor, customStart, customEnd]);

  const getCardVal = (binding) => {
    const vis = cardVis[binding];
    const d = (plant && vis?.data_by_plant?.[plant]) || vis?.data;
    return d?.value ?? null;
  };

  const aafPivotData = useMemo(() => {
    const base = (plant && aafPivot?.data_by_plant?.[plant]) || aafPivot?.data;
    return filterMonthMatrixByBounds(base, activeBounds);
  }, [aafPivot, plant, activeBounds]);
  const adfPivotData = useMemo(() => {
    const base = (plant && adfPivot?.data_by_plant?.[plant]) || adfPivot?.data;
    return filterMonthMatrixByBounds(base, activeBounds);
  }, [adfPivot, plant, activeBounds]);
  const rainPivotData = useMemo(() => {
    const base = (plant && rainPivot?.data_by_plant?.[plant]) || rainPivot?.data;
    return filterMonthMatrixByBounds(base, activeBounds);
  }, [rainPivot, plant, activeBounds]);
  const chartData = useMemo(() => {
    const base = (plant && chartVis?.data_by_plant?.[plant]) || chartVis?.data;
    return filterSeriesByBounds(base, activeBounds);
  }, [chartVis, plant, activeBounds]);

  const permitEvalVal = useMemo(
    () => maxNumeric(monthMatrixValues(aafPivotData)) ?? getCardVal("DATATBL.MAX Curval"),
    [aafPivotData, plant],
  );
  const avgSelectedVal = useMemo(
    () => averageNumeric(getRoleSeries(chartData, "y")?.values) ?? getCardVal("DATATBL.AVG_Calc"),
    [chartData, plant],
  );
  const stdSelectedVal = useMemo(
    () => sampleStdDevNumeric(getRoleSeries(chartData, "y")?.values) ?? getCardVal("DATATBL.STDEV.S"),
    [chartData, plant],
  );

  const refresh = (manifest?.last_refresh || "—").slice(0, 10);

  return html`
    <div style=${{
      background: `radial-gradient(circle at 20% 10%,#16365f55,transparent 25%),linear-gradient(180deg,#05101d,${C.bg})`,
      height: "100vh", color: C.text, fontFamily: "Inter,system-ui,sans-serif",
      fontSize: 14, padding: 18, display: "grid", gap: 10,
      gridTemplateRows: "auto auto auto 1fr auto", overflow: "hidden",
    }}>

      <header style=${{ display: "grid", gridTemplateColumns: "64px 1fr auto auto", gap: 12, alignItems: "center" }}>
        <button onClick=${() => { window.location.hash = "#/home"; }}
          style=${{ background: `linear-gradient(180deg,${C.card},#0d2139)`, border: `1px solid ${C.line}`,
            borderRadius: 14, height: 56, display: "grid", placeItems: "center",
            fontSize: 24, color: C.muted, cursor: "pointer" }}>←</button>
        <div>
          <div style=${{ color: C.accent, fontWeight: 700, fontSize: 20 }}>HachWIMS Flow Statistics</div>
          <div style=${{ color: C.muted, fontSize: 13 }}>WWTP Effluent Flow, MGD</div>
        </div>
        <div style=${{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style=${{ color: C.muted, fontSize: 11, textTransform: "uppercase" }}>WWTP</div>
          <select value=${plant} onChange=${e => setPlant(e.target.value)}
            style=${{ padding: "7px 10px", border: `1px solid ${C.line}`, borderRadius: 10,
              background: "#0b1c31", color: C.text, fontFamily: "inherit", fontSize: 13, minWidth: 180 }}>
            ${plants.map(p => html`<option value=${p}>${p}</option>`)}
          </select>
        </div>
        <div style=${{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div style=${{ color: C.muted, fontSize: 11, textTransform: "uppercase" }}>Date Range</div>
          <select value=${range} onChange=${e => setRange(e.target.value)}
            style=${{ padding: "7px 10px", border: `1px solid ${C.line}`, borderRadius: 10,
              background: "#0b1c31", color: C.text, fontFamily: "inherit", fontSize: 13, minWidth: 160 }}>
            ${dateOptions.map(o => html`<option value=${o.key}>${o.label}</option>`)}
          </select>
          ${range === CUSTOM_DATE_RANGE_KEY && html`
            <div style=${{ display:"grid", gap:8, marginTop:8 }}>
              <input type="date" value=${customStart} max=${customEnd || undefined} onInput=${e => setCustomStart(e.target.value)}
                style=${{ padding:"7px 10px", border:`1px solid ${C.line}`, borderRadius:10, background:"#0b1c31", color:C.text, fontFamily:"inherit", fontSize:13 }} />
              <input type="date" value=${customEnd} min=${customStart || undefined} onInput=${e => setCustomEnd(e.target.value)}
                style=${{ padding:"7px 10px", border:`1px solid ${C.line}`, borderRadius:10, background:"#0b1c31", color:C.text, fontFamily:"inherit", fontSize:13 }} />
            </div>
          `}
        </div>
      </header>

      <div style=${{ display: "flex", gap: 10 }}>
        ${CARD_CFG.map(({ binding, label, accent }) => {
          const value = binding === "DATATBL.MAX Curval"
            ? permitEvalVal
            : binding === "DATATBL.AVG_Calc"
              ? avgSelectedVal
              : binding === "DATATBL.STDEV.S"
                ? stdSelectedVal
                : getCardVal(binding);
          return html`<${KpiCard} key=${binding} label=${label} value=${value} accent=${accent} />`;
        })}
      </div>

      <div style=${{ background: `linear-gradient(180deg,${C.card},#0d2139)`,
        border: `1px solid ${C.line}`, borderRadius: 14, padding: "12px 16px", overflow: "hidden" }}>
        <${PivotTable} title="Permitted Annual Average Flow (Previous 12-month Avg, Reported Monthly)"
          data=${aafPivotData} plant=${plant} />
        <${PivotTable} title="Average Daily Flow (Reported in Monthly DMR)"
          data=${adfPivotData} plant=${plant} />
        <${PivotTable} title="Monthly Rainfall Recorded at the Plants"
          data=${rainPivotData} plant=${plant} />
      </div>

      <div style=${{ background: `linear-gradient(180deg,${C.card},#0d2139)`,
        border: `1px solid ${C.line}`, borderRadius: 14, padding: "10px 16px",
        display: "flex", flexDirection: "column", minHeight: 0 }}>
        <div style=${{ fontWeight: 700, fontSize: 12, marginBottom: 6 }}>Average Daily Flow, MGD</div>
        <${ADFChart} data=${chartData} plant=${plant} />
      </div>

      <footer style=${{ display: "flex", justifyContent: "space-between", color: C.muted, fontSize: 11,
        paddingTop: 6, borderTop: `1px solid rgba(255,255,255,.08)` }}>
        <span>All flows in MGD (million gallons per day). Data refreshed daily.</span>
        <span>Last refresh: ${refresh}</span>
      </footer>
    </div>
  `;
}
exports['StatisticalFlowsPage'] = StatisticalFlowsPage;
  });

  __wwip_define__('src/pages/permitted-aaf-vs-dmr.js', function (module, exports, __wwip_require__) {
const { h } = __wwip_require__('app/lib/preact.module.js');
const { useState, useMemo } = __wwip_require__('app/lib/preact-hooks.module.js');
const htm = __wwip_require__('app/lib/htm.module.js').default;
const { ChartWrap } = __wwip_require__('src/components/chart-base.js');
const {
  CUSTOM_DATE_RANGE_KEY,
  filterSeriesByBounds,
  getActiveBounds,
  getPresetBounds,
  getRoleSeries,
  inferSeriesBounds,
  maxNumeric,
  withCustomDateOption,
} = __wwip_require__('src/date-range.js');
// Bespoke page for "Permitted AAF Vs DMR" — Historical Trends.
// Two monthly combo charts (bars + 75% dotted reference line) + two KPI cards.





const html = htm.bind(h);

const C = {
  bg:     "#071425",
  card:   "#10253f",
  line:   "rgba(120,170,220,.16)",
  text:   "#eef4fb",
  muted:  "#9db0c7",
  accent: "#27d7d7",
};

function resolve(visual, plant, bounds) {
  if (!visual) return null;
  const base = (plant && visual.data_by_plant?.[plant]) ? visual.data_by_plant[plant] : visual.data;
  return filterSeriesByBounds(base, bounds);
}

// ── Combo chart: bars + 75% dotted reference line (same y-axis) ───
function TrendChart({ data, barLabel, barColor, height }) {
  if (!data) return html`<div style=${{ height: height||200, display:"grid", placeItems:"center", color:C.muted, fontSize:12 }}>No data</div>`;

  const xs      = data.x || [];
  const series  = data.series || [];
  const barS    = series.find(s => s.role === "y"  || !s.role);
  const lineS   = series.find(s => s.role === "y2");

  const datasets = [
    barS && {
      label: barS.name,
      data: barS.values || [],
      type: "bar",
      backgroundColor: barColor || "rgba(114,188,128,0.75)",
      borderColor:     barColor || "rgba(114,188,128,0.75)",
      borderWidth: 0,
      borderRadius: 2,
      order: 2,
      yAxisID: "y",
    },
    lineS && {
      label: lineS.name,
      data: lineS.values || [],
      type: "line",
      borderColor: "#c0392b",
      backgroundColor: "transparent",
      borderWidth: 2,
      borderDash: [6, 3],
      pointRadius: 0,
      fill: false,
      tension: 0,
      spanGaps: true,
      order: 1,
      yAxisID: "y",
    },
  ].filter(Boolean);

  const opts = {
    responsive: true, maintainAspectRatio: false, animation: false,
    plugins: {
      legend: { display: true, position: "top", align: "start",
        labels: { color: C.muted, font: { size: 10 }, boxWidth: 8, padding: 8 } },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: { ticks: { color: C.muted, font: { size: 8 }, maxTicksLimit: 14, autoSkip: true },
           grid: { color: "rgba(255,255,255,0.04)" } },
      y: { ticks: { color: C.muted, font: { size: 9 } },
           grid: { color: "rgba(255,255,255,0.04)" },
           beginAtZero: false,
           title: { display: true, text: "MGD", color: C.muted, font: { size: 9 } } },
    },
  };

  return html`
    <div style=${{ position:"relative", flex:1, minHeight:0 }}>
      <${ChartWrap} type="bar" data=${{ labels:xs, datasets }} options=${opts} />
    </div>
  `;
}

// ── KPI card ──────────────────────────────────────────────────────
function KpiCard({ label, value }) {
  return html`
    <div style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`,
      border:`1px solid ${C.line}`, borderRadius:12, padding:"10px 16px", minWidth:150 }}>
      <div style=${{ fontSize:"1.8rem", fontWeight:800, color:C.text, lineHeight:1.1 }}>
        ${value != null ? value.toFixed(2) : "—"}
      </div>
      <div style=${{ color:C.muted, fontSize:11, marginTop:4, textTransform:"uppercase", letterSpacing:".04em" }}>
        ${label}
      </div>
    </div>
  `;
}

// ── Main export ────────────────────────────────────────────────────
function PermittedAAFVsDMRPage({ page, manifest, currentDateRange }) {
  const visuals  = page.visuals || [];
  const plants   = page.plant_slicer?.options || [];
  const dateOpts = page.date_slicer?.options  || [];
  const anchor   = page.date_slicer?.anchor_date || "";
  const COMBO = new Set(["lineStackedColumnComboChart","lineClusteredColumnComboChart"]);
  const combos = visuals.filter(v => COMBO.has(v.type));
  const aafChart = combos.find(v => (v.title||"").toLowerCase().includes("annual average"));
  const initialRange = currentDateRange || page.date_slicer?.default || "last_5_years";
  const initialBase = (page.plant_slicer?.default && aafChart?.data_by_plant?.[page.plant_slicer.default]) || aafChart?.data;
  const initialBounds = getPresetBounds(initialRange, anchor) || inferSeriesBounds(initialBase) || { start: "", end: "" };

  const [plant, setPlant] = useState(page.plant_slicer?.default || plants[0] || "");
  const [range, setRange] = useState(initialRange);
  const [customStart, setCustomStart] = useState(initialBounds.start || "");
  const [customEnd, setCustomEnd] = useState(initialBounds.end || "");

  const aafVis = aafChart;
  const dmrVis = combos.find(v => (v.title||"").toLowerCase().includes("average daily"));
  const dateOptions = useMemo(() => withCustomDateOption(dateOpts), [dateOpts]);
  const activeBounds = useMemo(() => getActiveBounds({
    range,
    anchorDate: anchor,
    customStart,
    customEnd,
  }), [range, anchor, customStart, customEnd]);

  const aafData = useMemo(() => resolve(aafVis, plant, activeBounds), [aafVis, plant, activeBounds]);
  const dmrData = useMemo(() => resolve(dmrVis, plant, activeBounds), [dmrVis, plant, activeBounds]);

  const cards = visuals.filter(v => v.type === "card");
  const evalCard    = cards.find(v => (v.title||"").toLowerCase().includes("evaluated"));
  const permitCard  = cards.find(v => (v.title||"").toLowerCase().includes("permitted flow") || (v.title||"").toLowerCase().includes("permitted flow"));

  const evalFallback   = (plant && evalCard?.data_by_plant?.[plant]?.value)   ?? evalCard?.data?.value   ?? null;
  const permitFallback = (plant && permitCard?.data_by_plant?.[plant]?.value) ?? permitCard?.data?.value ?? null;
  const evalVal = useMemo(() => {
    const series = getRoleSeries(aafData, "y") || getRoleSeries(aafData, null);
    return maxNumeric(series?.values) ?? evalFallback;
  }, [aafData, evalFallback]);
  const permitVal = permitFallback;

  const refresh = (manifest?.last_refresh || "—").slice(0, 10);

  return html`
    <div style=${{
      background:`radial-gradient(circle at 20% 10%,#16365f55,transparent 25%),linear-gradient(180deg,#05101d,${C.bg})`,
      height:"100vh", color:C.text, fontFamily:"Inter,system-ui,sans-serif",
      fontSize:14, padding:18, display:"grid", gap:10,
      gridTemplateRows:"auto auto 1fr 1fr auto", overflow:"hidden",
    }}>

      <!-- HEADER -->
      <header style=${{ display:"grid", gridTemplateColumns:"64px 1fr auto auto", gap:12, alignItems:"center" }}>
        <button onClick=${() => { window.location.hash = "#/home"; }}
          style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`,
            borderRadius:14, height:56, display:"grid", placeItems:"center",
            fontSize:24, color:C.muted, cursor:"pointer" }}>←</button>
        <div>
          <div style=${{ color:C.text, fontWeight:800, fontSize:22 }}>Historical Trends</div>
          <div style=${{ color:C.accent, fontSize:13, fontWeight:600 }}>
            Annual Average Flow (Permit Equivalent) Vs. Average Daily Flow (DMR) in MGD
          </div>
        </div>
        <div style=${{ display:"flex", flexDirection:"column", gap:4 }}>
          <div style=${{ color:C.muted, fontSize:11, textTransform:"uppercase" }}>WWTP</div>
          <select value=${plant} onChange=${e => setPlant(e.target.value)}
            style=${{ padding:"7px 10px", border:`1px solid ${C.line}`, borderRadius:10,
              background:"#0b1c31", color:C.text, fontFamily:"inherit", fontSize:13, minWidth:180 }}>
            ${plants.map(p => html`<option value=${p}>${p}</option>`)}
          </select>
        </div>
        <div style=${{ display:"flex", flexDirection:"column", gap:4 }}>
          <div style=${{ color:C.muted, fontSize:11, textTransform:"uppercase" }}>Date Range</div>
          <select value=${range} onChange=${e => setRange(e.target.value)}
            style=${{ padding:"7px 10px", border:`1px solid ${C.line}`, borderRadius:10,
              background:"#0b1c31", color:C.text, fontFamily:"inherit", fontSize:13, minWidth:160 }}>
            ${dateOptions.map(o => html`<option value=${o.key}>${o.label}</option>`)}
          </select>
          ${range === CUSTOM_DATE_RANGE_KEY && html`
            <div style=${{ display:"grid", gap:8, marginTop:8 }}>
              <input type="date" value=${customStart} max=${customEnd || undefined} onInput=${e => setCustomStart(e.target.value)}
                style=${{ padding:"7px 10px", border:`1px solid ${C.line}`, borderRadius:10, background:"#0b1c31", color:C.text, fontFamily:"inherit", fontSize:13 }} />
              <input type="date" value=${customEnd} min=${customStart || undefined} onInput=${e => setCustomEnd(e.target.value)}
                style=${{ padding:"7px 10px", border:`1px solid ${C.line}`, borderRadius:10, background:"#0b1c31", color:C.text, fontFamily:"inherit", fontSize:13 }} />
            </div>
          `}
        </div>
      </header>

      <!-- KPI CARDS -->
      <div style=${{ display:"flex", gap:10, justifyContent:"flex-end" }}>
        <${KpiCard} label="Permit Evaluated Flow" value=${evalVal} />
        <${KpiCard} label="Permitted Flow"         value=${permitVal} />
      </div>

      <!-- ANNUAL AVERAGE FLOW CHART -->
      <div style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`,
        borderRadius:14, padding:"10px 16px", display:"flex", flexDirection:"column", minHeight:0 }}>
        <div style=${{ fontWeight:700, fontSize:12, marginBottom:6 }}>
          Annual Average Flow, MGD (Permit Evaluation), Reported Monthly
        </div>
        <${TrendChart} key=${"aaf-"+plant} data=${aafData} barColor="rgba(114,188,128,0.8)" />
      </div>

      <!-- MONTHLY DMR CHART -->
      <div style=${{ background:`linear-gradient(180deg,${C.card},#0d2139)`, border:`1px solid ${C.line}`,
        borderRadius:14, padding:"10px 16px", display:"flex", flexDirection:"column", minHeight:0 }}>
        <div style=${{ fontWeight:700, fontSize:12, marginBottom:6 }}>
          Average Daily Flow, MGD (Monthly DMR)
        </div>
        <${TrendChart} key=${"dmr-"+plant} data=${dmrData} barColor="rgba(114,188,128,0.8)" />
      </div>

      <!-- FOOTER -->
      <footer style=${{ display:"flex", justifyContent:"space-between", color:C.muted, fontSize:11,
        paddingTop:6, borderTop:`1px solid rgba(255,255,255,.08)` }}>
        <span>All flows in MGD. Annual avg = rolling 12-month average reported monthly. Data refreshed daily.</span>
        <span>Last refresh: ${refresh}</span>
      </footer>
    </div>
  `;
}
exports['PermittedAAFVsDMRPage'] = PermittedAAFVsDMRPage;
  });

  __wwip_define__('src/pages/permit-limits.js', function (module, exports, __wwip_require__) {
const { h } = __wwip_require__('app/lib/preact.module.js');
const { useMemo, useState } = __wwip_require__('app/lib/preact-hooks.module.js');
const htm = __wwip_require__('app/lib/htm.module.js').default;
const html = htm.bind(h);

const C = {
  bg: "#071425",
  card: "#10253f",
  line: "rgba(120,170,220,.16)",
  text: "#eef4fb",
  muted: "#9db0c7",
  accent: "#27d7d7",
};

const COL = {
  plant: 0,
  name: 1,
  vartype: 2,
  locid: 3,
  varid: 4,
  limit: 5,
  limitMgd: 6,
  units: 7,
  description: 8,
  limitType: 9,
  grouping: 10,
  statistic: 11,
  enddate: 12,
};

function StatCard({ label, value }) {
  return html`
    <div style=${{
      background: `linear-gradient(180deg,${C.card},#0d2139)`,
      border: `1px solid ${C.line}`,
      borderRadius: 14,
      padding: "12px 14px",
      minWidth: 140,
    }}>
      <div style=${{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em" }}>${label}</div>
      <div style=${{ color: C.accent, fontSize: 22, fontWeight: 800, marginTop: 4 }}>${value}</div>
    </div>
  `;
}

function LimitTable({ rows }) {
  const headers = [
    "Name",
    "Type",
    "Location",
    "VARID",
    "Limit Value",
    "Limit Value MGD",
    "Units",
    "Description",
    "Limit Type",
    "Grouping",
    "Statistic",
    "End Date",
  ];

  return html`
    <div style=${{ overflow: "auto", flex: 1, minHeight: 0 }}>
      <table style=${{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
        <thead>
          <tr>
            ${headers.map((header) => html`
              <th key=${header} style=${{
                position: "sticky",
                top: 0,
                background: "#0d2139",
                color: C.muted,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: ".05em",
                textTransform: "uppercase",
                padding: "8px 10px",
                textAlign: "left",
                borderBottom: `1px solid ${C.line}`,
                whiteSpace: "nowrap",
              }}>${header}</th>
            `)}
          </tr>
        </thead>
        <tbody>
          ${rows.map((row, idx) => html`
            <tr key=${idx} style=${{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>
              <td style=${cellStyle(220)}>${row[COL.name] || "—"}</td>
              <td style=${cellStyle(60)}>${row[COL.vartype] || "—"}</td>
              <td style=${cellStyle(80)}>${row[COL.locid] ?? "—"}</td>
              <td style=${cellStyle(90)}>${row[COL.varid] ?? "—"}</td>
              <td style=${cellStyle(90)}>${fmtNum(row[COL.limit])}</td>
              <td style=${cellStyle(110)}>${fmtNum(row[COL.limitMgd])}</td>
              <td style=${cellStyle(70)}>${row[COL.units] || "—"}</td>
              <td style=${cellStyle(220)}>${row[COL.description] || "—"}</td>
              <td style=${cellStyle(90)}>${row[COL.limitType] || "—"}</td>
              <td style=${cellStyle(70)}>${row[COL.grouping] || "—"}</td>
              <td style=${cellStyle(90)}>${row[COL.statistic] || "—"}</td>
              <td style=${cellStyle(100)}>${row[COL.enddate] || "—"}</td>
            </tr>
          `)}
        </tbody>
      </table>
    </div>
  `;
}

function cellStyle(maxWidth) {
  return {
    padding: "7px 10px",
    color: C.text,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth,
  };
}

function fmtNum(value) {
  if (value == null || value === "") return "—";
  return typeof value === "number"
    ? value.toLocaleString(undefined, { maximumFractionDigits: 3 })
    : String(value);
}

function PermitLimitsPage({ page, manifest }) {
  const visuals = page.visuals || [];
  const tableVis = visuals.find((v) => v.type === "tableEx");
  const plants = page.plant_slicer?.options || [];
  const allRows = tableVis?.data?.rows || [];

  const [plant, setPlant] = useState(page.plant_slicer?.default || plants[0] || "");
  const [plantSearch, setPlantSearch] = useState("");
  const [nameQuery, setNameQuery] = useState("");
  const [grouping, setGrouping] = useState("");
  const [vartype, setVartype] = useState("");
  const [endDate, setEndDate] = useState("");

  const filteredPlants = useMemo(
    () => plants.filter((item) => item.toLowerCase().includes(plantSearch.toLowerCase())),
    [plants, plantSearch],
  );

  const scopedRows = useMemo(
    () => allRows.filter((row) => !plant || row[COL.plant] === plant),
    [allRows, plant],
  );

  const groupingOptions = useMemo(
    () => [...new Set(scopedRows.map((row) => row[COL.grouping]).filter(Boolean))].sort(),
    [scopedRows],
  );
  const vartypeOptions = useMemo(
    () => [...new Set(scopedRows.map((row) => row[COL.vartype]).filter(Boolean))].sort(),
    [scopedRows],
  );
  const endDateOptions = useMemo(
    () => [...new Set(scopedRows.map((row) => row[COL.enddate]).filter(Boolean))].sort(),
    [scopedRows],
  );

  const visibleRows = useMemo(() => {
    const q = nameQuery.trim().toLowerCase();
    return scopedRows.filter((row) => {
      if (grouping && row[COL.grouping] !== grouping) return false;
      if (vartype && row[COL.vartype] !== vartype) return false;
      if (endDate && row[COL.enddate] !== endDate) return false;
      if (!q) return true;
      return String(row[COL.name] || "").toLowerCase().includes(q)
        || String(row[COL.description] || "").toLowerCase().includes(q)
        || String(row[COL.limitType] || "").toLowerCase().includes(q);
    });
  }, [scopedRows, grouping, vartype, endDate, nameQuery]);

  const distinctParams = useMemo(
    () => new Set(visibleRows.map((row) => row[COL.name]).filter(Boolean)).size,
    [visibleRows],
  );

  const refresh = (manifest?.last_refresh || "—").slice(0, 10);

  return html`
    <div style=${{
      background: `radial-gradient(circle at 20% 10%,#16365f55,transparent 25%),linear-gradient(180deg,#05101d,${C.bg})`,
      height: "100vh",
      color: C.text,
      fontFamily: "Inter,system-ui,sans-serif",
      fontSize: 14,
      padding: 18,
      display: "grid",
      gap: 12,
      gridTemplateRows: "auto auto 1fr auto",
      overflow: "hidden",
    }}>
      <header style=${{ display: "grid", gridTemplateColumns: "64px 1fr auto", gap: 14, alignItems: "start" }}>
        <button onClick=${() => { window.location.hash = "#/home"; }}
          style=${{
            background: `linear-gradient(180deg,${C.card},#0d2139)`,
            border: `1px solid ${C.line}`,
            borderRadius: 14,
            height: 64,
            display: "grid",
            placeItems: "center",
            fontSize: 28,
            color: C.muted,
            cursor: "pointer",
          }}>←</button>
        <div>
          <small style=${{
            display: "block",
            color: C.accent,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: ".04em",
            fontSize: 11,
            marginBottom: 4,
          }}>City of Houston — Public Works &amp; Engineering</small>
          <h1 style=${{ margin: 0, fontSize: 26, fontWeight: 800, lineHeight: 1.05 }}>
            WWiP Plant-Intelligence-System <span style=${{ color: C.accent }}>· Permit Limits</span>
          </h1>
        </div>
        <div style=${{ display: "grid", gridTemplateColumns: "repeat(3,auto)", gap: 10 }}>
          <${StatCard} label="Visible rows" value=${visibleRows.length.toLocaleString()} />
          <${StatCard} label="Parameters" value=${distinctParams.toLocaleString()} />
          <${StatCard} label="Last refresh" value=${refresh} />
        </div>
      </header>

      <section style=${{
        background: `linear-gradient(180deg,${C.card},#0d2139)`,
        border: `1px solid ${C.line}`,
        borderRadius: 14,
        padding: 14,
        display: "grid",
        gridTemplateColumns: "minmax(220px, 1.4fr) repeat(3, minmax(150px, 0.8fr))",
        gap: 10,
      }}>
        <input
          value=${nameQuery}
          onInput=${(e) => setNameQuery(e.target.value)}
          placeholder="Search parameter, description, or limit type"
          style=${inputStyle()}
        />
        <select value=${grouping} onChange=${(e) => setGrouping(e.target.value)} style=${inputStyle()}>
          <option value="">All groupings</option>
          ${groupingOptions.map((option) => html`<option key=${option} value=${option}>${option}</option>`)}
        </select>
        <select value=${vartype} onChange=${(e) => setVartype(e.target.value)} style=${inputStyle()}>
          <option value="">All types</option>
          ${vartypeOptions.map((option) => html`<option key=${option} value=${option}>${option}</option>`)}
        </select>
        <select value=${endDate} onChange=${(e) => setEndDate(e.target.value)} style=${inputStyle()}>
          <option value="">All end dates</option>
          ${endDateOptions.map((option) => html`<option key=${option} value=${option}>${option}</option>`)}
        </select>
      </section>

      <main style=${{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 12, minHeight: 0 }}>
        <aside style=${{
          background: `linear-gradient(180deg,${C.card},#0d2139)`,
          border: `1px solid ${C.line}`,
          borderRadius: 14,
          padding: 12,
          overflow: "auto",
        }}>
          <h3 style=${{ margin: "0 0 8px", color: C.accent, fontSize: 13 }}>WWTP</h3>
          <input
            value=${plantSearch}
            onInput=${(e) => setPlantSearch(e.target.value)}
            placeholder="Search WWTP"
            style=${{ ...inputStyle(), marginBottom: 8 }}
          />
          <div style=${{ display: "grid", gap: 4 }}>
            ${filteredPlants.map((item) => html`
              <label key=${item} style=${radioRowStyle(item === plant)}>
                <input
                  type="radio"
                  name="permit-limits-plant"
                  checked=${item === plant}
                  onChange=${() => setPlant(item)}
                  style=${{ accentColor: C.accent }}
                />
                ${item}
              </label>
            `)}
          </div>
        </aside>

        <section style=${{
          background: `linear-gradient(180deg,${C.card},#0d2139)`,
          border: `1px solid ${C.line}`,
          borderRadius: 14,
          padding: "10px 14px",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}>
          <div style=${{
            fontWeight: 700,
            fontSize: 12,
            marginBottom: 8,
            color: C.muted,
            textTransform: "uppercase",
            letterSpacing: ".04em",
          }}>
            ${plant || "All WWTP"} permit limits
          </div>
          <${LimitTable} rows=${visibleRows} />
        </section>
      </main>

      <footer style=${{
        display: "flex",
        justifyContent: "space-between",
        color: C.muted,
        fontSize: 11,
        paddingTop: 8,
        borderTop: "1px solid rgba(255,255,255,0.08)",
      }}>
        <span>Permit limit rows are rebuilt directly from the LIMITS and VARDESC sources.</span>
        <span>${manifest?.totals?.plants || 0} WWTPs in the current source set.</span>
      </footer>
    </div>
  `;
}

function inputStyle() {
  return {
    width: "100%",
    padding: "8px 10px",
    borderRadius: 10,
    border: `1px solid ${C.line}`,
    background: "#0a1a2e",
    color: C.text,
    fontFamily: "inherit",
    fontSize: 12,
  };
}

function radioRowStyle(active) {
  return {
    display: "flex",
    gap: 8,
    alignItems: "center",
    padding: "5px 6px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 12,
    background: active ? "rgba(39,215,215,0.12)" : "transparent",
    color: active ? C.accent : C.muted,
  };
}
exports['PermitLimitsPage'] = PermitLimitsPage;
  });

  __wwip_define__('src/pages/dmr-5yr-ef-flow.js', function (module, exports, __wwip_require__) {
const { h } = __wwip_require__('app/lib/preact.module.js');
const { useMemo, useState } = __wwip_require__('app/lib/preact-hooks.module.js');
const htm = __wwip_require__('app/lib/htm.module.js').default;
const { ChartWrap } = __wwip_require__('src/components/chart-base.js');
const {
  CUSTOM_DATE_RANGE_KEY,
  filterMonthMatrixByBounds,
  filterSeriesByBounds,
  getActiveBounds,
  getPresetBounds,
  inferMonthMatrixBounds,
  inferSeriesBounds,
  averageNumeric,
  getRoleSeries,
  maxNumeric,
  withCustomDateOption,
} = __wwip_require__('src/date-range.js');
const html = htm.bind(h);

const C = {
  bg: "#071425",
  card: "#10253f",
  line: "rgba(120,170,220,.16)",
  text: "#eef4fb",
  muted: "#9db0c7",
  accent: "#27d7d7",
};

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const LIMIT_COLORS = ["#d74c45", "#ef9447", "#5da8ff", "#f2c14e"];

function resolveMatrix(visual, plant, bounds) {
  const base = (plant && visual?.data_by_plant?.[plant]) || visual?.data;
  return filterMonthMatrixByBounds(base, bounds);
}

function resolveSeries(visual, plant, bounds) {
  const base = (plant && visual?.data_by_plant?.[plant]) || visual?.data;
  return filterSeriesByBounds(base, bounds);
}

function formatMetric(value, units) {
  return value == null ? "—" : `${value.toFixed(2)} ${units}`;
}

function StatCard({ label, value, accent }) {
  return html`
    <div style=${{
      background: `linear-gradient(180deg,${C.card},#0d2139)`,
      border: `1px solid ${accent ? "rgba(39,215,215,.35)" : C.line}`,
      borderRadius: 14,
      padding: "12px 16px",
    }}>
      <div style=${{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em" }}>${label}</div>
      <div style=${{ color: accent ? C.accent : C.text, fontSize: 22, fontWeight: 800, marginTop: 4 }}>${value}</div>
    </div>
  `;
}

function MonthlyMatrix({ data }) {
  if (!data?.months?.length) {
    return html`<div style=${{ color: C.muted, fontSize: 12 }}>No monthly values for this selection.</div>`;
  }

  const byYear = [];
  let current = null;
  for (const { yr, mo } of data.months) {
    if (!current || current.yr !== yr) {
      current = { yr, months: [] };
      byYear.push(current);
    }
    current.months.push(mo);
  }

  const cell = {
    padding: "6px 8px",
    whiteSpace: "nowrap",
    fontSize: 12,
    textAlign: "right",
    borderRight: "1px solid rgba(255,255,255,.04)",
  };

  return html`
    <div style=${{ overflow: "auto", flex: 1, minHeight: 0 }}>
      <table style=${{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            ${byYear.map(({ yr, months }) => html`
              <th key=${yr} colSpan=${months.length + 1} style=${{
                ...cell,
                color: C.accent,
                fontWeight: 700,
                textAlign: "center",
                borderBottom: `1px solid ${C.line}`,
              }}>${yr}</th>
            `)}
          </tr>
          <tr>
            ${byYear.map(({ yr, months }) => html`
              ${months.map((mo) => html`
                <th key=${`${yr}-${mo}`} style=${{
                  ...cell,
                  color: C.muted,
                  fontSize: 10,
                  textTransform: "uppercase",
                  letterSpacing: ".04em",
                  borderBottom: `1px solid ${C.line}`,
                }}>${MONTH_LABELS[mo - 1]}</th>
              `)}
              <th key=${`${yr}-total`} style=${{
                ...cell,
                color: C.text,
                fontSize: 10,
                textTransform: "uppercase",
                letterSpacing: ".04em",
                borderBottom: `1px solid ${C.line}`,
                background: "rgba(255,255,255,.03)",
              }}>Avg</th>
            `)}
          </tr>
        </thead>
        <tbody>
          <tr>
            ${byYear.map(({ yr, months }) => html`
              ${months.map((mo) => {
                const value = data.values?.[`${yr}-${mo}`];
                return html`
                  <td key=${`${yr}-${mo}`} style=${{ ...cell, color: C.text }}>
                    ${value == null ? "—" : value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                  </td>
                `;
              })}
              <td key=${`${yr}-total`} style=${{
                ...cell,
                color: C.text,
                background: "rgba(255,255,255,.03)",
                fontWeight: 700,
              }}>
                ${data.values?.[`${yr}-total`] == null ? "—" : data.values[`${yr}-total`].toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </td>
            `)}
          </tr>
        </tbody>
      </table>
    </div>
  `;
}

function PermitTable({ visual, plant }) {
  const data = (plant && visual?.data_by_plant?.[plant]) || visual?.data;
  const rows = data?.rows || [];
  return html`
    <div style=${{ overflowX: "auto" }}>
      <table style=${{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead>
          <tr>
            ${["S. Name", "Description", "Limit Value", "Units", "Type", "Limit Type", "End Date"].map((header) => html`
              <th key=${header} style=${thStyle()}>${header}</th>
            `)}
          </tr>
        </thead>
        <tbody>
          ${rows.map((row, idx) => html`
            <tr key=${idx} style=${{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>
              ${row.map((cell, i) => html`
                <td key=${i} style=${tdStyle()}>
                  ${typeof cell === "number" ? cell.toLocaleString(undefined, { maximumFractionDigits: 2 }) : (cell || "—")}
                </td>
              `)}
            </tr>
          `)}
        </tbody>
      </table>
    </div>
  `;
}

function ComboChart({ data, units }) {
  if (!data?.x?.length) {
    return html`<div style=${{ color: C.muted, fontSize: 12 }}>No chart data for this selection.</div>`;
  }
  const ySeries = (data.series || []).filter((series) => series.role === "y" || !series.role);
  const y2Series = (data.series || []).filter((series) => series.role === "y2");
  const datasets = [
    ...ySeries.map((series) => ({
      label: series.name,
      data: series.values || [],
      type: "bar",
      backgroundColor: "rgba(39,215,215,0.65)",
      borderColor: C.accent,
      borderWidth: 0,
      borderRadius: 2,
      order: 2,
    })),
    ...y2Series.map((series, idx) => ({
      label: series.name,
      data: series.values || [],
      type: "line",
      borderColor: LIMIT_COLORS[idx % LIMIT_COLORS.length],
      borderWidth: idx === 0 ? 2.5 : 1.5,
      borderDash: idx === 0 ? [] : [6, 3],
      pointRadius: 0,
      fill: false,
      tension: 0,
      order: 1,
    })),
  ];

  const allValues = [...ySeries, ...y2Series].flatMap((series) => series.values || []).filter((value) => value != null);
  const sharedMax = allValues.length ? Math.max(...allValues) * 1.1 : undefined;

  return html`
    <div style=${{ position: "relative", flex: 1, minHeight: 0 }}>
      <${ChartWrap}
        type="bar"
        data=${{ labels: data.x, datasets }}
        options=${{
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            legend: {
              display: true,
              position: "top",
              align: "start",
              labels: { color: C.muted, font: { size: 11 }, boxWidth: 10, padding: 10 },
            },
            tooltip: { mode: "index", intersect: false },
          },
          scales: {
            x: {
              ticks: { color: C.muted, font: { size: 9 }, maxTicksLimit: 12 },
              grid: { color: "rgba(255,255,255,0.05)" },
            },
            y: {
              ticks: { color: C.muted, font: { size: 9 } },
              grid: { color: "rgba(255,255,255,0.05)" },
              beginAtZero: true,
              max: sharedMax,
              title: { display: true, text: units, color: C.muted, font: { size: 10 } },
            },
          },
        }}
      />
    </div>
  `;
}

function Dmr5yrHistoricalMetricPage({ page, manifest, currentDateRange }) {
  const visuals = page.visuals || [];
  const meta = page.custom_metric_meta || {};
  const plants = page.plant_slicer?.options || [];
  const dateOptions = useMemo(() => withCustomDateOption(page.date_slicer?.options || []), [page.date_slicer?.options]);
  const anchor = page.date_slicer?.anchor_date || "";
  const pivotVis = visuals.find((visual) => visual.type === "pivotTable");
  const tableVis = visuals.find((visual) => visual.type === "tableEx");
  const chartVis = visuals.find((visual) => visual.type === "lineClusteredColumnComboChart");
  const units = meta.units || "MGD";
  const pageHeading = meta.page_heading || page.display_name || "DMR 5-Year Historical Metric";
  const footerCopy = meta.footer_copy || "Historical DMR values are rebuilt from monthly averages over the latest five years.";
  const calendarMonthRanges = useMemo(() => ({ last_12_months: 12, last_5_years: 60 }), []);
  const initialRange = currentDateRange || page.date_slicer?.default || "last_5_years";
  const initialBaseMatrix = (page.plant_slicer?.default && pivotVis?.data_by_plant?.[page.plant_slicer.default]) || pivotVis?.data;
  const initialBaseSeries = (page.plant_slicer?.default && chartVis?.data_by_plant?.[page.plant_slicer.default]) || chartVis?.data;
  const initialBounds = getPresetBounds(initialRange, anchor, { calendarMonthRanges })
    || inferMonthMatrixBounds(initialBaseMatrix)
    || inferSeriesBounds(initialBaseSeries)
    || { start: "", end: "" };

  const [plant, setPlant] = useState(page.plant_slicer?.default || plants[0] || "");
  const [plantSearch, setPlantSearch] = useState("");
  const [range, setRange] = useState(initialRange);
  const [customStart, setCustomStart] = useState(initialBounds.start || "");
  const [customEnd, setCustomEnd] = useState(initialBounds.end || "");

  const activeBounds = useMemo(() => getActiveBounds({
    range,
    anchorDate: anchor,
    customStart,
    customEnd,
    calendarMonthRanges,
  }), [range, anchor, customStart, customEnd, calendarMonthRanges]);

  const filteredPlants = useMemo(
    () => plants.filter((item) => item.toLowerCase().includes(plantSearch.toLowerCase())),
    [plants, plantSearch],
  );

  const matrixData = useMemo(() => resolveMatrix(pivotVis, plant, activeBounds), [pivotVis, plant, activeBounds]);
  const chartData = useMemo(() => resolveSeries(chartVis, plant, activeBounds), [chartVis, plant, activeBounds]);

  const peakValue = maxNumeric(getRoleSeries(chartData, "y")?.values);
  const avgValue = averageNumeric(getRoleSeries(chartData, "y")?.values);
  const refresh = (manifest?.last_refresh || "—").slice(0, 10);

  return html`
    <div style=${{
      background: `radial-gradient(circle at 20% 10%,#16365f55,transparent 25%),linear-gradient(180deg,#05101d,${C.bg})`,
      height: "100vh",
      color: C.text,
      fontFamily: "Inter,system-ui,sans-serif",
      fontSize: 14,
      padding: 18,
      display: "grid",
      gap: 12,
      gridTemplateRows: "auto auto 1fr auto",
      overflow: "hidden",
    }}>
      <header style=${{ display: "grid", gridTemplateColumns: "64px 1fr auto", gap: 14, alignItems: "start" }}>
        <button onClick=${() => { window.location.hash = "#/home"; }}
          style=${{
            background: `linear-gradient(180deg,${C.card},#0d2139)`,
            border: `1px solid ${C.line}`,
            borderRadius: 14,
            height: 64,
            display: "grid",
            placeItems: "center",
            fontSize: 28,
            color: C.muted,
            cursor: "pointer",
          }}>←</button>
        <div>
          <small style=${topLabelStyle()}>City of Houston — Public Works &amp; Engineering</small>
          <h1 style=${{ margin: 0, fontSize: 26, fontWeight: 800, lineHeight: 1.05 }}>
            WWiP Plant-Intelligence-System <span style=${{ color: C.accent }}>· ${pageHeading}</span>
          </h1>
        </div>
        <div style=${{
          background: `linear-gradient(180deg,${C.card},#0d2139)`,
          border: `1px solid ${C.line}`,
          borderRadius: 14,
          padding: "12px 14px",
          minWidth: 220,
        }}>
          <div style=${{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: ".04em" }}>Date Range</div>
          <select value=${range} onChange=${(e) => setRange(e.target.value)} style=${inputStyle()}>
            ${dateOptions.map((option) => html`<option key=${option.key} value=${option.key}>${option.label}</option>`)}
          </select>
          ${range === CUSTOM_DATE_RANGE_KEY && html`
            <div style=${{ display: "grid", gap: 8, marginTop: 10 }}>
              <input type="date" value=${customStart} max=${customEnd || undefined} onInput=${(e) => setCustomStart(e.target.value)} style=${inputStyle()} />
              <input type="date" value=${customEnd} min=${customStart || undefined} onInput=${(e) => setCustomEnd(e.target.value)} style=${inputStyle()} />
            </div>
          `}
        </div>
      </header>

      <section style=${{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 10 }}>
        <${StatCard} label="Peak monthly avg" value=${formatMetric(peakValue, units)} accent=${true} />
        <${StatCard} label="Avg monthly value" value=${formatMetric(avgValue, units)} />
        <${StatCard} label="Last refresh" value=${refresh} />
      </section>

      <main style=${{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 12, minHeight: 0 }}>
        <aside style=${{
          background: `linear-gradient(180deg,${C.card},#0d2139)`,
          border: `1px solid ${C.line}`,
          borderRadius: 14,
          padding: 12,
          overflow: "auto",
        }}>
          <h3 style=${{ margin: "0 0 8px", color: C.accent, fontSize: 13 }}>WWTP</h3>
          <input value=${plantSearch} onInput=${(e) => setPlantSearch(e.target.value)} placeholder="Search WWTP" style=${{ ...inputStyle(), marginBottom: 8 }} />
          <div style=${{ display: "grid", gap: 4 }}>
            ${filteredPlants.map((item) => html`
              <label key=${item} style=${radioRowStyle(item === plant)}>
                <input type="radio" name=${`dmr-historical-plant-${page.slug}`} checked=${item === plant} onChange=${() => setPlant(item)} style=${{ accentColor: C.accent }} />
                ${item}
              </label>
            `)}
          </div>
        </aside>

        <div style=${{ display: "grid", gap: 10, minHeight: 0, gridTemplateRows: "auto auto 1fr" }}>
          <section style=${panelStyle()}>
            <div style=${sectionTitleStyle()}>Permit Limits</div>
            <${PermitTable} visual=${tableVis} plant=${plant} />
          </section>
          <section style=${panelStyle({ minHeight: 0 })}>
            <div style=${sectionTitleStyle()}>${pivotVis?.title || "Monthly values (same as DMR Report)"}</div>
            <${MonthlyMatrix} data=${matrixData} />
          </section>
          <section style=${panelStyle({ display: "flex", flexDirection: "column", minHeight: 0 })}>
            <div style=${sectionTitleStyle()}>Monthly trend and permit reference lines</div>
            <${ComboChart} data=${chartData} units=${units} />
          </section>
        </div>
      </main>

      <footer style=${footerStyle()}>
        <span>${footerCopy}</span>
        <span>${manifest?.totals?.plants || 0} plants in the current WWTP list.</span>
      </footer>
    </div>
  `;
}

function panelStyle(extra = {}) {
  return {
    background: `linear-gradient(180deg,${C.card},#0d2139)`,
    border: `1px solid ${C.line}`,
    borderRadius: 14,
    padding: "10px 14px",
    ...extra,
  };
}

function sectionTitleStyle() {
  return {
    fontWeight: 700,
    fontSize: 12,
    marginBottom: 8,
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: ".04em",
  };
}

function thStyle() {
  return {
    padding: "5px 8px",
    textAlign: "left",
    color: C.muted,
    borderBottom: `1px solid ${C.line}`,
    fontWeight: 600,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: ".04em",
    whiteSpace: "nowrap",
  };
}

function tdStyle() {
  return {
    padding: "4px 8px",
    color: C.text,
    whiteSpace: "nowrap",
  };
}

function inputStyle() {
  return {
    marginTop: 8,
    width: "100%",
    padding: "8px 10px",
    border: `1px solid ${C.line}`,
    borderRadius: 10,
    background: "#0b1c31",
    color: C.text,
    fontFamily: "inherit",
    fontSize: 13,
  };
}

function radioRowStyle(active) {
  return {
    display: "flex",
    gap: 8,
    alignItems: "center",
    padding: "5px 6px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 12,
    background: active ? "rgba(39,215,215,0.12)" : "transparent",
    color: active ? C.accent : C.muted,
  };
}

function footerStyle() {
  return {
    display: "flex",
    justifyContent: "space-between",
    color: C.muted,
    fontSize: 11,
    paddingTop: 8,
    borderTop: "1px solid rgba(255,255,255,0.08)",
  };
}

function topLabelStyle() {
  return {
    display: "block",
    color: C.accent,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: ".04em",
    fontSize: 11,
    marginBottom: 4,
  };
}
exports['Dmr5yrHistoricalMetricPage'] = Dmr5yrHistoricalMetricPage;
  });

  __wwip_define__('src/pages/plant-ef-daily.js', function (module, exports, __wwip_require__) {
const { h } = __wwip_require__('app/lib/preact.module.js');
const { useEffect, useMemo, useState } = __wwip_require__('app/lib/preact-hooks.module.js');
const htm = __wwip_require__('app/lib/htm.module.js').default;
const { ChartWrap } = __wwip_require__('src/components/chart-base.js');
const { loadCustomData } = __wwip_require__('src/data.js');
const {
  CUSTOM_DATE_RANGE_KEY,
  averageNumeric,
  getActiveBounds,
  getPresetBounds,
  maxNumeric,
  withCustomDateOption,
} = __wwip_require__('src/date-range.js');
const html = htm.bind(h);

const C = {
  bg: "#071425",
  card: "#10253f",
  line: "rgba(120,170,220,.16)",
  text: "#eef4fb",
  muted: "#9db0c7",
  accent: "#27d7d7",
};

const LIMIT_COLORS = ["#d74c45", "#ef9447", "#5da8ff", "#f2c14e"];

function offsetToIso(originDate, offset) {
  const dt = new Date(`${originDate}T00:00:00Z`);
  dt.setUTCDate(dt.getUTCDate() + Number(offset || 0));
  return dt.toISOString().slice(0, 10);
}

function resolveSeries(originDate, seriesData, bounds) {
  if (!seriesData?.x?.length) return { x: [], values: [] };
  const x = [];
  const values = [];
  for (let i = 0; i < seriesData.x.length; i += 1) {
    const iso = offsetToIso(originDate, seriesData.x[i]);
    if (bounds?.start && bounds?.end && (iso < bounds.start || iso > bounds.end)) continue;
    x.push(iso);
    values.push(seriesData.v?.[i] ?? null);
  }
  return { x, values };
}

function chartDatasets(series, limits) {
  return [
    {
      label: "Recorded Value",
      data: series.values,
      type: "line",
      borderColor: C.accent,
      backgroundColor: "rgba(39,215,215,0.12)",
      borderWidth: 2,
      pointRadius: 0,
      fill: false,
      tension: 0,
      order: 2,
    },
    ...limits.map((limit, idx) => ({
      label: limit.d || limit.n || `Limit ${idx + 1}`,
      data: Array(series.x.length).fill(limit.v),
      type: "line",
      borderColor: LIMIT_COLORS[idx % LIMIT_COLORS.length],
      borderWidth: idx === 0 ? 2.5 : 1.5,
      borderDash: idx === 0 ? [] : [6, 3],
      pointRadius: 0,
      fill: false,
      tension: 0,
      order: 1,
    })),
  ];
}

function StatCard({ label, value, accent }) {
  return html`
    <div style=${{
      background: `linear-gradient(180deg,${C.card},#0d2139)`,
      border: `1px solid ${accent ? "rgba(39,215,215,.35)" : C.line}`,
      borderRadius: 14,
      padding: "12px 16px",
    }}>
      <div style=${{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: ".05em" }}>${label}</div>
      <div style=${{ color: accent ? C.accent : C.text, fontSize: 22, fontWeight: 800, marginTop: 4 }}>${value}</div>
    </div>
  `;
}

function LimitsTable({ limits }) {
  if (!limits?.length) {
    return html`<div style=${{ color: C.muted, fontSize: 12 }}>No current limit rows for this parameter.</div>`;
  }
  return html`
    <div style=${{ overflowX: "auto" }}>
      <table style=${{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
        <thead>
          <tr>
            ${["Limit Type", "Description", "Compare", "Limit Value", "Units", "End Date"].map((header) => html`
              <th key=${header} style=${thStyle()}>${header}</th>
            `)}
          </tr>
        </thead>
        <tbody>
          ${limits.map((limit, idx) => html`
            <tr key=${idx} style=${{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>
              <td style=${tdStyle()}><span style=${limitBadgeStyle(idx)}>${limit.n || "—"}</span></td>
              <td style=${tdStyle()}>${limit.d || "—"}</td>
              <td style=${tdStyle()}>${limit.c || "—"}</td>
              <td style=${tdStyle()}>${limit.v == null ? "—" : limit.v.toLocaleString(undefined, { maximumFractionDigits: 3 })}</td>
              <td style=${tdStyle()}>${limit.u || "—"}</td>
              <td style=${tdStyle()}>${limit.e || "—"}</td>
            </tr>
          `)}
        </tbody>
      </table>
    </div>
  `;
}

function DailyChart({ series, limits, units }) {
  if (!series.x.length) {
    return html`<div style=${{ color: C.muted, fontSize: 12 }}>No daily values in the active date window.</div>`;
  }
  const values = [...series.values, ...limits.map((limit) => limit.v)].filter((value) => typeof value === "number" && Number.isFinite(value));
  const maxValue = values.length ? Math.max(...values) * 1.1 : undefined;
  return html`
    <div style=${{ position: "relative", flex: 1, minHeight: 0 }}>
      <${ChartWrap}
        type="line"
        data=${{ labels: series.x, datasets: chartDatasets(series, limits) }}
        options=${{
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            legend: {
              display: true,
              position: "top",
              align: "start",
              labels: { color: C.muted, font: { size: 11 }, boxWidth: 10, padding: 10 },
            },
            tooltip: { mode: "index", intersect: false },
          },
          scales: {
            x: {
              ticks: { color: C.muted, font: { size: 9 }, maxTicksLimit: 12 },
              grid: { color: "rgba(255,255,255,0.05)" },
            },
            y: {
              ticks: { color: C.muted, font: { size: 9 } },
              grid: { color: "rgba(255,255,255,0.05)" },
              beginAtZero: false,
              suggestedMin: 0,
              max: maxValue,
              title: { display: !!units, text: units || "", color: C.muted, font: { size: 10 } },
            },
          },
        }}
      />
    </div>
  `;
}

function PlantEffluentDailyPage({ page, manifest, currentDateRange }) {
  const plants = page.plant_slicer?.options || [];
  const dateOptions = useMemo(
    () => withCustomDateOption((page.date_slicer?.options || []).filter((option) => option.key !== "all_time")),
    [page.date_slicer?.options],
  );

  const [plant, setPlant] = useState(page.plant_slicer?.default || plants[0] || "");
  const [plantSearch, setPlantSearch] = useState("");
  const [source, setSource] = useState(null);
  const [loadError, setLoadError] = useState(null);
  const [parameter, setParameter] = useState("");
  const [range, setRange] = useState(currentDateRange || page.date_slicer?.default || "last_5_years");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  useEffect(() => {
    let active = true;
    loadCustomData(page.custom_data_key, page.custom_data_href)
      .then((payload) => {
        if (!active) return;
        setSource(payload);
      })
      .catch((err) => {
        if (!active) return;
        setLoadError(err.message);
      });
    return () => { active = false; };
  }, [page.custom_data_href, page.custom_data_key]);

  const anchor = source?.anchor_date || page.date_slicer?.anchor_date || "";
  const initialBounds = getPresetBounds(range, anchor) || { start: "", end: "" };

  useEffect(() => {
    if (!customStart && initialBounds.start) setCustomStart(initialBounds.start);
    if (!customEnd && initialBounds.end) setCustomEnd(initialBounds.end);
  }, [initialBounds.start, initialBounds.end, customStart, customEnd]);

  const availableParameters = useMemo(() => {
    const plantData = source?.by_plant?.[plant] || {};
    const allowed = new Set(Object.keys(plantData));
    return (source?.parameters || []).filter((item) => allowed.has(item.key));
  }, [source, plant]);

  useEffect(() => {
    if (!availableParameters.length) {
      if (parameter) setParameter("");
      return;
    }
    if (!parameter || !availableParameters.some((item) => item.key === parameter)) {
      const preferred = availableParameters.find((item) => item.key === source?.default_parameter) || availableParameters[0];
      setParameter(preferred?.key || "");
    }
  }, [availableParameters, parameter, source?.default_parameter]);

  const selectedMeta = useMemo(
    () => availableParameters.find((item) => item.key === parameter) || null,
    [availableParameters, parameter],
  );

  const activeBounds = useMemo(() => getActiveBounds({
    range,
    anchorDate: anchor,
    customStart,
    customEnd,
  }), [range, anchor, customStart, customEnd]);

  const selectedSeriesRaw = source?.by_plant?.[plant]?.[parameter] || null;
  const series = useMemo(
    () => resolveSeries(source?.origin_date, selectedSeriesRaw, activeBounds),
    [source?.origin_date, selectedSeriesRaw, activeBounds],
  );
  const limits = selectedSeriesRaw?.l || [];
  const latestValue = series.values.length ? series.values[series.values.length - 1] : null;
  const latestDate = series.x.length ? series.x[series.x.length - 1] : "—";
  const avgValue = averageNumeric(series.values);
  const peakValue = maxNumeric(series.values);
  const filteredPlants = useMemo(
    () => plants.filter((item) => item.toLowerCase().includes(plantSearch.toLowerCase())),
    [plants, plantSearch],
  );
  const refresh = (manifest?.last_refresh || "—").slice(0, 10);

  if (loadError) {
    return html`<div style=${errorShell()}><div>Unable to load daily effluent source: ${loadError}</div></div>`;
  }

  if (!source) {
    return html`<div style=${errorShell()}><div>Loading daily effluent source…</div></div>`;
  }

  return html`
    <div style=${{
      background: `radial-gradient(circle at 20% 10%,#16365f55,transparent 25%),linear-gradient(180deg,#05101d,${C.bg})`,
      height: "100vh",
      color: C.text,
      fontFamily: "Inter,system-ui,sans-serif",
      fontSize: 14,
      padding: 18,
      display: "grid",
      gap: 12,
      gridTemplateRows: "auto auto 1fr auto",
      overflow: "hidden",
    }}>
      <header style=${{ display: "grid", gridTemplateColumns: "64px 1fr auto", gap: 14, alignItems: "start" }}>
        <button onClick=${() => { window.location.hash = "#/home"; }}
          style=${buttonStyle()}>←</button>
        <div>
          <small style=${topLabelStyle()}>City of Houston — Public Works &amp; Engineering</small>
          <h1 style=${{ margin: 0, fontSize: 26, fontWeight: 800, lineHeight: 1.05 }}>
            WWiP Plant-Intelligence-System <span style=${{ color: C.accent }}>· Plant Effluent Daily</span>
          </h1>
        </div>
        <div style=${panelStyle({ minWidth: 220 })}>
          <div style=${{ color: C.muted, fontSize: 11, textTransform: "uppercase", letterSpacing: ".04em" }}>Date Range</div>
          <select value=${range} onChange=${(e) => setRange(e.target.value)} style=${inputStyle()}>
            ${dateOptions.map((option) => html`<option key=${option.key} value=${option.key}>${option.label}</option>`)}
          </select>
          ${range === CUSTOM_DATE_RANGE_KEY && html`
            <div style=${{ display: "grid", gap: 8, marginTop: 10 }}>
              <input type="date" value=${customStart} max=${customEnd || undefined} onInput=${(e) => setCustomStart(e.target.value)} style=${inputStyle()} />
              <input type="date" value=${customEnd} min=${customStart || undefined} onInput=${(e) => setCustomEnd(e.target.value)} style=${inputStyle()} />
            </div>
          `}
        </div>
      </header>

      <section style=${{
        background: `linear-gradient(180deg,${C.card},#0d2139)`,
        border: `1px solid ${C.line}`,
        borderRadius: 14,
        padding: 14,
        display: "grid",
        gridTemplateColumns: "minmax(260px, 1.5fr) repeat(4, minmax(0, 1fr))",
        gap: 10,
      }}>
        <select value=${parameter} onChange=${(e) => setParameter(e.target.value)} style=${inputStyle()}>
          ${availableParameters.map((item) => html`
            <option key=${item.key} value=${item.key}>${item.label}${item.units ? ` (${item.units})` : ""}</option>
          `)}
        </select>
        <${StatCard} label="Latest value" value=${latestValue == null ? "—" : latestValue.toFixed(2)} accent=${true} />
        <${StatCard} label="Avg value" value=${avgValue == null ? "—" : avgValue.toFixed(2)} />
        <${StatCard} label="Peak value" value=${peakValue == null ? "—" : peakValue.toFixed(2)} />
        <${StatCard} label="Last refresh" value=${refresh} />
      </section>

      <main style=${{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 12, minHeight: 0 }}>
        <aside style=${panelStyle({ padding: 12, overflow: "auto" })}>
          <h3 style=${{ margin: "0 0 8px", color: C.accent, fontSize: 13 }}>WWTP</h3>
          <input value=${plantSearch} onInput=${(e) => setPlantSearch(e.target.value)} placeholder="Search WWTP" style=${{ ...inputStyle(), marginBottom: 8 }} />
          <div style=${{ display: "grid", gap: 4 }}>
            ${filteredPlants.map((item) => html`
              <label key=${item} style=${radioRowStyle(item === plant)}>
                <input type="radio" name="plant-ef-daily-plant" checked=${item === plant} onChange=${() => setPlant(item)} style=${{ accentColor: C.accent }} />
                ${item}
              </label>
            `)}
          </div>
        </aside>

        <div style=${{ display: "grid", gap: 10, minHeight: 0, gridTemplateRows: "auto 1fr auto" }}>
          <section style=${panelStyle()}>
            <div style=${sectionTitleStyle()}>
              ${selectedMeta?.label || parameter || "Parameter"} · ${plant || "WWTP"}
            </div>
            <div style=${{ color: C.muted, fontSize: 12 }}>
              Latest sampled date: <span style=${{ color: C.text }}>{latestDate}</span>
              ${selectedMeta?.units ? html` · Units: <span style=${{ color: C.text }}>{selectedMeta.units}</span>` : null}
            </div>
          </section>

          <section style=${panelStyle({ display: "flex", flexDirection: "column", minHeight: 0 })}>
            <div style=${sectionTitleStyle()}>Recorded value by date</div>
            <${DailyChart} series=${series} limits=${limits} units=${selectedMeta?.units} />
          </section>

          <section style=${panelStyle()}>
            <div style=${sectionTitleStyle()}>Current permit limits</div>
            <${LimitsTable} limits=${limits} />
          </section>
        </div>
      </main>

      <footer style=${footerStyle()}>
        <span>Daily effluent source retains the latest five years for interactive filtering on this page.</span>
        <span>${source.plants?.length || 0} plants · ${source.parameters?.length || 0} curated effluent parameters.</span>
      </footer>
    </div>
  `;
}

function panelStyle(extra = {}) {
  return {
    background: `linear-gradient(180deg,${C.card},#0d2139)`,
    border: `1px solid ${C.line}`,
    borderRadius: 14,
    padding: "12px 14px",
    ...extra,
  };
}

function inputStyle() {
  return {
    marginTop: 8,
    width: "100%",
    padding: "8px 10px",
    border: `1px solid ${C.line}`,
    borderRadius: 10,
    background: "#0b1c31",
    color: C.text,
    fontFamily: "inherit",
    fontSize: 13,
  };
}

function buttonStyle() {
  return {
    background: `linear-gradient(180deg,${C.card},#0d2139)`,
    border: `1px solid ${C.line}`,
    borderRadius: 14,
    height: 64,
    display: "grid",
    placeItems: "center",
    fontSize: 28,
    color: C.muted,
    cursor: "pointer",
  };
}

function topLabelStyle() {
  return {
    display: "block",
    color: C.accent,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: ".04em",
    fontSize: 11,
    marginBottom: 4,
  };
}

function sectionTitleStyle() {
  return {
    fontWeight: 700,
    fontSize: 12,
    marginBottom: 8,
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: ".04em",
  };
}

function radioRowStyle(active) {
  return {
    display: "flex",
    gap: 8,
    alignItems: "center",
    padding: "5px 6px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 12,
    background: active ? "rgba(39,215,215,0.12)" : "transparent",
    color: active ? C.accent : C.muted,
  };
}

function thStyle() {
  return {
    padding: "5px 8px",
    textAlign: "left",
    color: C.muted,
    borderBottom: `1px solid ${C.line}`,
    fontWeight: 600,
    fontSize: 10,
    textTransform: "uppercase",
    letterSpacing: ".04em",
    whiteSpace: "nowrap",
  };
}

function tdStyle() {
  return {
    padding: "4px 8px",
    color: C.text,
    whiteSpace: "nowrap",
  };
}

function limitBadgeStyle(idx) {
  return {
    display: "inline-block",
    padding: "2px 6px",
    borderRadius: 999,
    background: `${LIMIT_COLORS[idx % LIMIT_COLORS.length]}22`,
    color: LIMIT_COLORS[idx % LIMIT_COLORS.length],
    fontWeight: 700,
  };
}

function footerStyle() {
  return {
    display: "flex",
    justifyContent: "space-between",
    color: C.muted,
    fontSize: 11,
    paddingTop: 8,
    borderTop: "1px solid rgba(255,255,255,0.08)",
  };
}

function errorShell() {
  return {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    background: `linear-gradient(180deg,#05101d,${C.bg})`,
    color: C.text,
    fontFamily: "Inter,system-ui,sans-serif",
  };
}
exports['PlantEffluentDailyPage'] = PlantEffluentDailyPage;
  });

  __wwip_define__('src/pages/kpi-grid-page.js', function (module, exports, __wwip_require__) {
const { h } = __wwip_require__('app/lib/preact.module.js');
const { useMemo, useState } = __wwip_require__('app/lib/preact-hooks.module.js');
const htm = __wwip_require__('app/lib/htm.module.js').default;
const { ChartWrap } = __wwip_require__('src/components/chart-base.js');
const {
  CUSTOM_DATE_RANGE_KEY,
  filterSeriesByBounds,
  getActiveBounds,
  getPresetBounds,
  withCustomDateOption,
} = __wwip_require__('src/date-range.js');
const html = htm.bind(h);

const C = {
  bg: "#071425",
  card: "#10253f",
  line: "rgba(120,170,220,.16)",
  text: "#eef4fb",
  muted: "#9db0c7",
  accent: "#27d7d7",
};

const SERIES_COLORS = ["#27d7d7", "#5da8ff", "#9fd356", "#f2c14e", "#ef9447", "#d74c45"];
const LIMIT_COLORS = ["#f2c14e", "#ef9447", "#d74c45", "#b984ff"];

function resolveSeries(visual, plant, bounds) {
  const base = (plant && visual?.data_by_plant?.[plant]) || visual?.data;
  return filterSeriesByBounds(base, bounds);
}

function tileDatasets(data) {
  const series = data?.series || [];
  const ySeries = series.filter((item) => item.role === "y" || !item.role);
  const y2Series = series.filter((item) => item.role === "y2");
  return [
    ...ySeries.map((item, idx) => ({
      label: item.name,
      data: item.values || [],
      type: "line",
      borderColor: SERIES_COLORS[idx % SERIES_COLORS.length],
      backgroundColor: `${SERIES_COLORS[idx % SERIES_COLORS.length]}22`,
      borderWidth: 2,
      pointRadius: 0,
      fill: false,
      tension: 0,
      order: 2,
    })),
    ...y2Series.map((item, idx) => ({
      label: item.name,
      data: item.values || [],
      type: "line",
      borderColor: LIMIT_COLORS[idx % LIMIT_COLORS.length],
      borderWidth: idx === 0 ? 2.25 : 1.5,
      borderDash: idx === 0 ? [] : [6, 3],
      pointRadius: 0,
      fill: false,
      tension: 0,
      order: 1,
    })),
  ];
}

function TileChart({ visual, plant, bounds }) {
  const data = useMemo(() => resolveSeries(visual, plant, bounds), [visual, plant, bounds]);
  const datasets = tileDatasets(data);
  if (!data?.x?.length || !datasets.length) {
    return html`<div style=${emptyStateStyle()}>No values in the active date window.</div>`;
  }

  const allValues = datasets.flatMap((item) => item.data || []).filter((value) => typeof value === "number" && Number.isFinite(value));
  const maxValue = allValues.length ? Math.max(...allValues) * 1.1 : undefined;
  const showLegend = datasets.length > 1 && datasets.length <= 4;

  return html`
    <div style=${{ position: "relative", flex: 1, minHeight: 0 }}>
      <${ChartWrap}
        type="line"
        data=${{ labels: data.x, datasets }}
        options=${{
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            legend: {
              display: showLegend,
              position: "top",
              align: "start",
              labels: { color: C.muted, font: { size: 10 }, boxWidth: 10, padding: 8 },
            },
            tooltip: { mode: "index", intersect: false },
          },
          scales: {
            x: {
              ticks: { color: C.muted, font: { size: 9 }, maxTicksLimit: 6 },
              grid: { color: "rgba(255,255,255,0.05)" },
            },
            y: {
              ticks: { color: C.muted, font: { size: 9 } },
              grid: { color: "rgba(255,255,255,0.05)" },
              suggestedMin: 0,
              max: maxValue,
              title: {
                display: !!visual?.custom_units,
                text: visual?.custom_units || "",
                color: C.muted,
                font: { size: 10 },
              },
            },
          },
        }}
      />
    </div>
  `;
}

function KpiGridPage({ page, manifest, currentDateRange }) {
  const meta = page.custom_kpi_meta || {};
  const visuals = page.visuals || [];
  const plants = page.plant_slicer?.options || [];
  const dateOptions = useMemo(() => withCustomDateOption(page.date_slicer?.options || []), [page.date_slicer?.options]);
  const anchor = page.date_slicer?.anchor_date || "";
  const calendarMonthRanges = useMemo(() => ({ last_12_months: 12, last_5_years: 60 }), []);

  const [plant, setPlant] = useState(page.plant_slicer?.default || plants[0] || "");
  const [plantSearch, setPlantSearch] = useState("");
  const [range, setRange] = useState(currentDateRange || page.date_slicer?.default || "last_5_years");
  const initialBounds = getPresetBounds(range, anchor, { calendarMonthRanges }) || { start: "", end: "" };
  const [customStart, setCustomStart] = useState(initialBounds.start || "");
  const [customEnd, setCustomEnd] = useState(initialBounds.end || "");

  const activeBounds = useMemo(() => getActiveBounds({
    range,
    anchorDate: anchor,
    customStart,
    customEnd,
    calendarMonthRanges,
  }), [range, anchor, customStart, customEnd, calendarMonthRanges]);

  const filteredPlants = useMemo(
    () => plants.filter((item) => item.toLowerCase().includes(plantSearch.toLowerCase())),
    [plants, plantSearch],
  );

  const tiles = useMemo(
    () => (meta.tile_order || []).map((idx) => visuals[idx]).filter(Boolean),
    [meta.tile_order, visuals],
  );

  return html`
    <div style=${shellStyle()}>
      <header style=${{ display: "grid", gridTemplateColumns: "64px 1fr auto", gap: 14, alignItems: "start" }}>
        <button onClick=${() => { window.location.hash = "#/home"; }} style=${buttonStyle()}>←</button>
        <div>
          <small style=${topLabelStyle()}>City of Houston — Public Works &amp; Engineering</small>
          <h1 style=${{ margin: 0, fontSize: 26, fontWeight: 800, lineHeight: 1.05 }}>
            WWiP Plant-Intelligence-System <span style=${{ color: C.accent }}>· ${meta.page_heading || page.display_name}</span>
          </h1>
          ${meta.page_subtitle && html`<div style=${{ marginTop: 6, color: C.muted, fontSize: 13 }}>${meta.page_subtitle}</div>`}
        </div>
        <div style=${panelStyle({ minWidth: 220 })}>
          <div style=${sectionTitleStyle()}>Date Range</div>
          <select value=${range} onChange=${(e) => setRange(e.target.value)} style=${inputStyle()}>
            ${dateOptions.map((option) => html`<option key=${option.key} value=${option.key}>${option.label}</option>`)}
          </select>
          ${range === CUSTOM_DATE_RANGE_KEY && html`
            <div style=${{ display: "grid", gap: 8, marginTop: 10 }}>
              <input type="date" value=${customStart} max=${customEnd || undefined} onInput=${(e) => setCustomStart(e.target.value)} style=${inputStyle()} />
              <input type="date" value=${customEnd} min=${customStart || undefined} onInput=${(e) => setCustomEnd(e.target.value)} style=${inputStyle()} />
            </div>
          `}
        </div>
      </header>

      <section style=${panelStyle({
        display: "grid",
        gridTemplateColumns: "1fr auto auto",
        alignItems: "center",
        gap: 12,
      })}>
        <div style=${{ color: C.muted, fontSize: 13 }}>
          Selected plant: <span style=${{ color: C.text, fontWeight: 700 }}>{plant || "—"}</span>
        </div>
        <div style=${{ color: C.muted, fontSize: 12 }}>
          ${tiles.length} curated tiles
        </div>
        <div style=${{ color: C.muted, fontSize: 12 }}>
          Last refresh: <span style=${{ color: C.text }}>{(manifest?.last_refresh || "—").slice(0, 10)}</span>
        </div>
      </section>

      <main style=${{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 12, minHeight: 0 }}>
        <aside style=${panelStyle({ padding: 12, overflow: "auto" })}>
          <h3 style=${{ margin: "0 0 8px", color: C.accent, fontSize: 13 }}>WWTP</h3>
          <input value=${plantSearch} onInput=${(e) => setPlantSearch(e.target.value)} placeholder="Search WWTP" style=${{ ...inputStyle(), marginBottom: 8 }} />
          <div style=${{ display: "grid", gap: 4 }}>
            ${filteredPlants.map((item) => html`
              <label key=${item} style=${radioRowStyle(item === plant)}>
                <input type="radio" name=${`kpi-grid-plant-${page.slug}`} checked=${item === plant} onChange=${() => setPlant(item)} style=${{ accentColor: C.accent }} />
                ${item}
              </label>
            `)}
          </div>
        </aside>

        <div style=${panelStyle({ padding: 12, overflow: "auto", minHeight: 0 })}>
          <div style=${{
            display: "grid",
            gridTemplateColumns: `repeat(${meta.columns || 3}, minmax(0, 1fr))`,
            gap: 12,
          }}>
            ${tiles.map((visual, idx) => html`
              <section key=${idx} style=${tilePanelStyle()}>
                <div style=${tileTitleStyle()}>${visual.title || `Tile ${idx + 1}`}</div>
                <${TileChart} visual=${visual} plant=${plant} bounds=${activeBounds} />
              </section>
            `)}
          </div>
        </div>
      </main>

      <footer style=${footerStyle()}>
        <span>${meta.footer_copy || "Curated KPI tiles are rebuilt for the active plant and date range."}</span>
        <span>${plants.length} plants in the current WWTP list.</span>
      </footer>
    </div>
  `;
}

function shellStyle() {
  return {
    background: `radial-gradient(circle at 20% 10%,#16365f55,transparent 25%),linear-gradient(180deg,#05101d,${C.bg})`,
    height: "100vh",
    color: C.text,
    fontFamily: "Inter,system-ui,sans-serif",
    fontSize: 14,
    padding: 18,
    display: "grid",
    gap: 12,
    gridTemplateRows: "auto auto 1fr auto",
    overflow: "hidden",
  };
}

function panelStyle(extra = {}) {
  return {
    background: `linear-gradient(180deg,${C.card},#0d2139)`,
    border: `1px solid ${C.line}`,
    borderRadius: 14,
    padding: "12px 14px",
    ...extra,
  };
}

function tilePanelStyle() {
  return {
    background: "rgba(6, 17, 29, 0.5)",
    border: `1px solid ${C.line}`,
    borderRadius: 12,
    padding: "10px 12px",
    minHeight: 228,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  };
}

function buttonStyle() {
  return {
    background: `linear-gradient(180deg,${C.card},#0d2139)`,
    border: `1px solid ${C.line}`,
    borderRadius: 14,
    height: 64,
    display: "grid",
    placeItems: "center",
    fontSize: 28,
    color: C.muted,
    cursor: "pointer",
  };
}

function inputStyle() {
  return {
    marginTop: 8,
    width: "100%",
    padding: "8px 10px",
    border: `1px solid ${C.line}`,
    borderRadius: 10,
    background: "#0b1c31",
    color: C.text,
    fontFamily: "inherit",
    fontSize: 13,
  };
}

function radioRowStyle(active) {
  return {
    display: "flex",
    gap: 8,
    alignItems: "center",
    padding: "5px 6px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 12,
    background: active ? "rgba(39,215,215,0.12)" : "transparent",
    color: active ? C.accent : C.muted,
  };
}

function topLabelStyle() {
  return {
    display: "block",
    color: C.accent,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: ".04em",
    fontSize: 11,
    marginBottom: 4,
  };
}

function sectionTitleStyle() {
  return {
    fontWeight: 700,
    fontSize: 12,
    color: C.muted,
    textTransform: "uppercase",
    letterSpacing: ".04em",
  };
}

function tileTitleStyle() {
  return {
    fontWeight: 700,
    fontSize: 12,
    color: C.text,
    letterSpacing: ".01em",
    minHeight: 30,
  };
}

function emptyStateStyle() {
  return {
    color: C.muted,
    fontSize: 12,
    display: "grid",
    placeItems: "center",
    minHeight: 140,
    flex: 1,
  };
}

function footerStyle() {
  return {
    display: "flex",
    justifyContent: "space-between",
    color: C.muted,
    fontSize: 11,
    paddingTop: 8,
    borderTop: "1px solid rgba(255,255,255,0.08)",
  };
}
exports['KpiGridPage'] = KpiGridPage;
  });

  __wwip_define__('src/pages/monthly-flow-table.js', function (module, exports, __wwip_require__) {
const { h } = __wwip_require__('app/lib/preact.module.js');
const { useMemo, useState } = __wwip_require__('app/lib/preact-hooks.module.js');
const htm = __wwip_require__('app/lib/htm.module.js').default;
const {
  CUSTOM_DATE_RANGE_KEY,
  getActiveBounds,
  getPresetBounds,
  withCustomDateOption,
} = __wwip_require__('src/date-range.js');
const html = htm.bind(h);

const C = {
  bg: "#071423",
  panel: "#0f2440",
  panel2: "#102845",
  line: "rgba(110,155,205,.18)",
  text: "#eef4fb",
  muted: "#9aaec6",
  accent: "#25d7d7",
  shadow: "0 10px 30px rgba(0,0,0,.28)",
  radius: 16,
};

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function card(extra) {
  return {
    background: `linear-gradient(180deg,${C.panel2},${C.panel})`,
    border: `1px solid ${C.line}`,
    borderRadius: C.radius,
    boxShadow: C.shadow,
    ...extra,
  };
}

function StatChip({ icon, label, value, valueColor }) {
  return html`
    <div style=${card({ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, minWidth: 140 })}>
      <span style=${{ fontSize: "1.4rem", opacity: 0.8 }}>${icon}</span>
      <div>
        <div style=${{ color: C.muted, fontSize: 11 }}>${label}</div>
        <div style=${{ fontSize: "1.3rem", fontWeight: 800, lineHeight: 1.1, color: valueColor || C.text }}>${value}</div>
      </div>
    </div>
  `;
}

function getPageConfig(slug, pivotTitle) {
  if (slug === "dmr-monthlyadf-for-7590-rules") {
    return {
      accentTitle: "Monthly Average Daily Effluent Flow",
      sectionTitle: "Monthly ADF History",
      sectionNote: "Monthly average daily effluent flow used for 75/90 rule evaluation.",
      tableTitle: pivotTitle || "Monthly Average Daily Effluent Flow, MGD",
    };
  }
  return {
    accentTitle: "Monthly Annual Average Flow",
    sectionTitle: "Monthly AAF History",
    sectionNote: "Annual average flow reported monthly, estimated from the previous 12 months.",
    tableTitle: pivotTitle || "Annual Average Flow, MGD Reported Monthly",
  };
}

function filterPivotByBounds(data, bounds) {
  if (!data || !bounds?.start || !bounds?.end) return data;
  const rowLabels = data.row_labels || [];
  const matrix = data.matrix || [];
  const keep = [];
  for (let i = 0; i < rowLabels.length; i += 1) {
    const row = rowLabels[i] || [];
    const year = row[0];
    const month = row[1];
    if (!Number.isInteger(year) || !Number.isInteger(month)) continue;
    const key = `${year}-${String(month).padStart(2, "0")}-01`;
    if (key >= bounds.start && key <= bounds.end) keep.push(i);
  }
  if (keep.length === rowLabels.length) return data;
  return {
    ...data,
    row_labels: keep.map((i) => rowLabels[i]),
    matrix: keep.map((i) => matrix[i]),
  };
}

function TableCard({ title, data }) {
  const rowLabels = data?.row_labels || [];
  const matrix = data?.matrix || [];
  const colLabels = data?.col_labels || [];
  const valueHeader = colLabels[0] || "Value";

  return html`
    <section style=${card({ padding: 14, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" })}>
      <div style=${{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
        <div>
          <div style=${{ fontWeight: 800, fontSize: 15, color: C.text }}>${title}</div>
          <div style=${{ color: C.muted, fontSize: 12, marginTop: 3 }}>Monthly pivot view for the selected WWTP and date window</div>
        </div>
        <div style=${{ color: C.muted, fontSize: 12, whiteSpace: "nowrap" }}>
          ${rowLabels.length.toLocaleString()} rows
        </div>
      </div>

      <div style=${{ overflow: "auto", flex: 1, borderRadius: 12, border: `1px solid ${C.line}`, background: "rgba(4,15,27,.35)" }}>
        <table style=${{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              ${["Year", "Month", valueHeader].map((label, idx) => html`
                <th key=${label} style=${{
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  background: "#24395d",
                  color: idx < 2 ? C.muted : "#dbe6f4",
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  textAlign: idx < 2 ? "left" : "right",
                  padding: "10px 12px",
                  borderBottom: `1px solid ${C.line}`,
                }}>${label}</th>
              `)}
            </tr>
          </thead>
          <tbody>
            ${rowLabels.map((row, idx) => {
              const year = row?.[0];
              const month = row?.[1];
              const value = matrix?.[idx]?.[0];
              const valueText = typeof value === "number"
                ? value.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })
                : "—";
              return html`
                <tr key=${`${year}-${month}-${idx}`}>
                  <td style=${{
                    padding: "6px 12px",
                    borderBottom: `1px solid rgba(255,255,255,.04)`,
                    color: C.text,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}>${Number.isInteger(year) ? year.toLocaleString() : "—"}</td>
                  <td style=${{
                    padding: "6px 12px",
                    borderBottom: `1px solid rgba(255,255,255,.04)`,
                    color: C.text,
                    fontWeight: 700,
                    whiteSpace: "nowrap",
                  }}>${Number.isInteger(month) && month >= 1 && month <= 12 ? MONTH_LABELS[month - 1] : "—"}</td>
                  <td style=${{
                    padding: "6px 12px",
                    borderBottom: `1px solid rgba(255,255,255,.04)`,
                    color: C.text,
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                    whiteSpace: "nowrap",
                  }}>${valueText}</td>
                </tr>
              `;
            })}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

function MonthlyFlowTablePage({ page, manifest, currentDateRange }) {
  const pivotVisual = (page.visuals || []).find((visual) => visual.type === "pivotTable");
  const plants = page.plant_slicer?.options || [];
  const dateOpts = page.date_slicer?.options || [];
  const anchor = page.date_slicer?.anchor_date || "";
  const initialPlant = page.plant_slicer?.default || plants[0] || "";
  const initialRange = currentDateRange || page.date_slicer?.default || "last_5_years";
  const initialBounds = getPresetBounds(initialRange, anchor, {
    calendarMonthRanges: { last_12_months: 12, last_5_years: 60 },
  }) || { start: "", end: "" };

  const [plant, setPlant] = useState(initialPlant);
  const [range, setRange] = useState(initialRange);
  const [customStart, setCustomStart] = useState(initialBounds.start || "");
  const [customEnd, setCustomEnd] = useState(initialBounds.end || "");

  const dateOptions = useMemo(() => withCustomDateOption(dateOpts), [dateOpts]);
  const bounds = useMemo(() => getActiveBounds({
    range,
    anchorDate: anchor,
    customStart,
    customEnd,
    calendarMonthRanges: { last_12_months: 12, last_5_years: 60 },
  }), [range, anchor, customStart, customEnd]);

  const baseData = (plant && pivotVisual?.data_by_plant?.[plant]) || pivotVisual?.data;
  const tableData = useMemo(() => {
    if (!baseData) return null;
    if (range === "all_time") return baseData;
    return filterPivotByBounds(baseData, bounds);
  }, [baseData, bounds, range]);

  const cfg = getPageConfig(page.slug, pivotVisual?.title);
  const violations = (manifest?.totals?.violations || 0).toLocaleString();
  const plantCount = manifest?.totals?.plants || 0;
  const refresh = (manifest?.last_refresh || "—").slice(0, 10);
  const selectedLabel = plants.includes(plant) ? plant : "All Plants";

  return html`
    <div style=${{
      background: `radial-gradient(circle at 20% 10%,rgba(37,79,140,.2),transparent 26%),linear-gradient(180deg,#05101d,${C.bg})`,
      minHeight: "100vh",
      color: C.text,
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: 14,
      overflowY: "auto",
    }}>
      <div style=${{ padding: 18, display: "grid", gap: 14 }}>
        <div style=${{ display: "grid", gridTemplateColumns: "64px 1fr auto", gap: 16, alignItems: "start" }}>
          <button onClick=${() => { window.location.hash = "#/home"; }}
            style=${card({ height: 64, display: "grid", placeItems: "center", fontSize: 28, color: C.muted, cursor: "pointer" })}>←</button>

          <div>
            <small style=${{ display: "block", color: C.accent, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em", fontSize: 11, marginBottom: 4 }}>
              City of Houston — Public Works &amp; Engineering
            </small>
            <h1 style=${{ margin: 0, fontSize: 28, fontWeight: 800, lineHeight: 1.05 }}>
              WWiP Plant-Intelligence-System <span style=${{ color: C.accent }}>· ${cfg.accentTitle}</span>
            </h1>
          </div>

          <div style=${{ display: "grid", gridTemplateColumns: "repeat(3,auto)", gap: 12 }}>
            <${StatChip} icon="💧" label="Violations" value=${violations} />
            <${StatChip} icon="🏭" label="Plants" value=${plantCount} />
            <${StatChip} icon="📅" label="Last refresh" value=${refresh} valueColor=${C.accent} />
          </div>
        </div>

        <div style=${{ display: "grid", gridTemplateColumns: "270px 1fr", gap: 14 }}>
          <aside style=${{ display: "grid", gap: 14, alignContent: "start" }}>
            <section style=${card({ padding: 16 })}>
              <div style=${{ color: C.accent, fontWeight: 800, textTransform: "uppercase", fontSize: 11, letterSpacing: "0.08em", marginBottom: 10 }}>WWTP</div>
              <select
                value=${plant}
                onChange=${(e) => setPlant(e.target.value || "")}
                style=${{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, background: "#0a1d32", color: C.text, fontFamily: "inherit", fontSize: 14 }}
              >
                ${plants.map((option) => html`<option value=${option}>${option}</option>`)}
              </select>
              <div style=${{ color: C.muted, fontSize: 12, marginTop: 10 }}>Current selection: ${selectedLabel}</div>
            </section>

            <section style=${card({ padding: 16 })}>
              <div style=${{ color: C.accent, fontWeight: 800, textTransform: "uppercase", fontSize: 11, letterSpacing: "0.08em", marginBottom: 10 }}>Date range</div>
              <select
                value=${range}
                onChange=${(e) => setRange(e.target.value)}
                style=${{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, background: "#0a1d32", color: C.text, fontFamily: "inherit", fontSize: 14, marginBottom: range === CUSTOM_DATE_RANGE_KEY ? 10 : 0 }}
              >
                ${dateOptions.map((option) => html`<option value=${option.key}>${option.label}</option>`)}
              </select>
              ${range === CUSTOM_DATE_RANGE_KEY && html`
                <div style=${{ display: "grid", gap: 8 }}>
                  <input
                    type="date"
                    value=${customStart}
                    max=${customEnd || undefined}
                    onInput=${(e) => setCustomStart(e.target.value)}
                    style=${{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, background: "#0a1d32", color: C.text, fontFamily: "inherit", fontSize: 14 }}
                  />
                  <input
                    type="date"
                    value=${customEnd}
                    min=${customStart || undefined}
                    onInput=${(e) => setCustomEnd(e.target.value)}
                    style=${{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, background: "#0a1d32", color: C.text, fontFamily: "inherit", fontSize: 14 }}
                  />
                </div>
              `}
            </section>

            <section style=${card({ padding: 16 })}>
              <div style=${{ color: C.text, fontWeight: 800, fontSize: 15, marginBottom: 6 }}>${cfg.sectionTitle}</div>
              <div style=${{ color: C.muted, fontSize: 13, lineHeight: 1.55 }}>${cfg.sectionNote}</div>
            </section>
          </aside>

          <main style=${{ display: "grid", minHeight: 0 }}>
            <${TableCard} title=${cfg.tableTitle} data=${tableData} />
          </main>
        </div>
      </div>
    </div>
  `;
}
exports['MonthlyFlowTablePage'] = MonthlyFlowTablePage;
  });

  __wwip_define__('src/pages/operations-metric-page.js', function (module, exports, __wwip_require__) {
const { h } = __wwip_require__('app/lib/preact.module.js');
const { useMemo, useState } = __wwip_require__('app/lib/preact-hooks.module.js');
const htm = __wwip_require__('app/lib/htm.module.js').default;
const { ChartWrap } = __wwip_require__('src/components/chart-base.js');
const {
  CUSTOM_DATE_RANGE_KEY,
  filterSeriesByBounds,
  getActiveBounds,
  getPresetBounds,
  withCustomDateOption,
} = __wwip_require__('src/date-range.js');
const html = htm.bind(h);

const C = {
  bg: "#071423",
  panel: "#0f2440",
  panel2: "#102845",
  line: "rgba(110,155,205,.18)",
  text: "#eef4fb",
  muted: "#9aaec6",
  accent: "#25d7d7",
  shadow: "0 10px 30px rgba(0,0,0,.28)",
  radius: 16,
};

const SERIES_COLORS = ["#25d7d7", "#5da8ff", "#9fd356", "#f2c14e", "#ef9447", "#d74c45"];

const PAGE_CONFIG = {
  thck: {
    heading: "Thickener",
    note: "Process trend views for thickener-related signals. Use the asset and metric filters to narrow the active traces.",
    assetDefault: "Thck 01",
    defaultRange: "all_time",
    chartCards: [
      {
        title: "Thickener Trends",
        selector: (visual) => visual.type === "areaChart" && Boolean(visual.data_by_plant),
        mode: "xy_series",
      },
    ],
    showSeriesPanel: true,
  },
  elec: {
    heading: "Electricity Used",
    note: "Daily and long-term electricity usage trends for the selected WWTP.",
    assetDefault: "Elec 01",
    chartCards: [
      {
        title: "Daily Electricity Usage",
        selector: (visual) => visual.type === "clusteredColumnChart" && String(visual.title || "").toUpperCase() === "DAILY",
        mode: "xy_line",
      },
      {
        title: "Yearly Electricity Usage",
        selector: (visual) => visual.type === "clusteredColumnChart" && String(visual.title || "").toUpperCase() === "MONTHLY",
        mode: "xy",
      },
    ],
    showSeriesPanel: false,
  },
};

function card(extra) {
  return {
    background: `linear-gradient(180deg,${C.panel2},${C.panel})`,
    border: `1px solid ${C.line}`,
    borderRadius: C.radius,
    boxShadow: C.shadow,
    ...extra,
  };
}

function StatChip({ icon, label, value, valueColor }) {
  return html`
    <div style=${card({ padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, minWidth: 140 })}>
      <span style=${{ fontSize: "1.4rem", opacity: 0.8 }}>${icon}</span>
      <div>
        <div style=${{ color: C.muted, fontSize: 11 }}>${label}</div>
        <div style=${{ fontSize: "1.3rem", fontWeight: 800, lineHeight: 1.1, color: valueColor || C.text }}>${value}</div>
      </div>
    </div>
  `;
}

function normalizeText(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function matchToken(name, token) {
  if (!token) return true;
  const a = normalizeText(name);
  const b = normalizeText(token);
  return !b || a.includes(b);
}

function filterYearSeriesByBounds(data, bounds) {
  if (!data || !bounds?.start || !bounds?.end) return data;
  const years = data.x || [];
  const startYear = Number(String(bounds.start).slice(0, 4));
  const endYear = Number(String(bounds.end).slice(0, 4));
  if (!Number.isFinite(startYear) || !Number.isFinite(endYear)) return data;
  const keep = [];
  for (let i = 0; i < years.length; i += 1) {
    const year = Number(String(years[i]).slice(0, 4));
    if (Number.isFinite(year) && year >= startYear && year <= endYear) keep.push(i);
  }
  if (keep.length === years.length) return data;
  return {
    ...data,
    x: keep.map((i) => years[i]),
    y: (data.y || []).filter((_, i) => keep.includes(i)),
    series: (data.series || []).map((series) => ({
      ...series,
      values: keep.map((i) => series.values?.[i]),
    })),
  };
}

function filterDataByBounds(data, bounds) {
  if (!data) return data;
  if (!bounds?.start || !bounds?.end) return data;
  const xs = data.x || [];
  if (xs.length && /^\d{4}$/.test(String(xs[0]))) {
    return filterYearSeriesByBounds(data, bounds);
  }
  return filterSeriesByBounds(data, bounds);
}

function filterSeriesLocally(data, asset, metric) {
  if (!data?.series?.length) return data;
  const series = data.series.filter((item) => matchToken(item.name, asset) && matchToken(item.name, metric));
  return { ...data, series };
}

function resolveVisualData(visual, plant, bounds, asset, metric, mode) {
  if (!visual) return null;
  const base = (plant && visual.data_by_plant?.[plant]) || visual.data || null;
  if (!base) return null;
  const bounded = filterDataByBounds(base, bounds);
  if (mode === "xy_series") return filterSeriesLocally(bounded, asset, metric);
  return bounded;
}

function buildDatasets(data, mode) {
  if (!data) return [];
  if (mode === "xy_series") {
    return (data.series || []).slice(0, 8).map((series, idx) => ({
      label: series.name,
      data: series.values || [],
      type: "line",
      borderColor: SERIES_COLORS[idx % SERIES_COLORS.length],
      backgroundColor: `${SERIES_COLORS[idx % SERIES_COLORS.length]}22`,
      borderWidth: 2,
      pointRadius: 0,
      fill: false,
      tension: 0,
    }));
  }
  if (mode === "xy_line") {
    return [{
      label: "Value",
      data: data.y || [],
      type: "line",
      borderColor: "#25d7d7",
      backgroundColor: "rgba(37,215,215,0.16)",
      borderWidth: 2,
      pointRadius: 0,
      fill: false,
      tension: 0,
    }];
  }
  return [{
    label: "Value",
    data: data.y || [],
    type: "bar",
    backgroundColor: "rgba(37,215,215,0.65)",
    borderColor: "#25d7d7",
    borderWidth: 1,
    borderRadius: 4,
  }];
}

function chartOptions(mode) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        display: mode === "xy_series",
        position: "top",
        align: "start",
        labels: { color: C.muted, font: { size: 10 }, boxWidth: 10, padding: 8 },
      },
      tooltip: { mode: "index", intersect: false },
    },
    scales: {
      x: {
        ticks: { color: C.muted, font: { size: 9 }, maxTicksLimit: 8 },
        grid: { color: "rgba(255,255,255,0.05)" },
      },
      y: {
        ticks: { color: C.muted, font: { size: 9 } },
        grid: { color: "rgba(255,255,255,0.05)" },
        beginAtZero: true,
      },
    },
  };
}

function ChartCard({ title, data, mode }) {
  const datasets = buildDatasets(data, mode);
  const xs = data?.x || [];
  if (!xs.length || !datasets.length) {
    return html`
      <section style=${card({ padding: 14, display: "flex", flexDirection: "column", minHeight: 260 })}>
        <div style=${{ fontWeight: 800, fontSize: 15, color: C.text, marginBottom: 8 }}>${title}</div>
        <div style=${{ color: C.muted, fontSize: 13 }}>No values in the active selection.</div>
      </section>
    `;
  }

  return html`
    <section style=${card({ padding: 14, display: "flex", flexDirection: "column", minHeight: 260 })}>
      <div style=${{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
        <div style=${{ fontWeight: 800, fontSize: 15, color: C.text }}>${title}</div>
        <div style=${{ color: C.muted, fontSize: 12 }}>
          ${xs.length.toLocaleString()} points
        </div>
      </div>
      <div style=${{ position: "relative", flex: 1, minHeight: 220 }}>
        <${ChartWrap}
          type=${mode === "xy" ? "bar" : "line"}
          data=${{ labels: xs, datasets }}
          options=${chartOptions(mode)}
        />
      </div>
    </section>
  `;
}

function SeriesPanel({ data }) {
  const names = (data?.series || []).map((series) => series.name);
  return html`
    <section style=${card({ padding: 14 })}>
      <div style=${{ fontWeight: 800, fontSize: 15, color: C.text, marginBottom: 10 }}>Visible Signals</div>
      <div style=${{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        ${names.length
          ? names.map((name) => html`<span key=${name} style=${{
              padding: "6px 9px",
              borderRadius: 999,
              background: "rgba(37,215,215,0.12)",
              border: `1px solid ${C.line}`,
              color: C.text,
              fontSize: 12,
            }}>${name}</span>`)
          : html`<span style=${{ color: C.muted, fontSize: 13 }}>No series match the active asset/metric filters.</span>`}
      </div>
    </section>
  `;
}

function inferDefault(options, preferred) {
  if (preferred && options.includes(preferred)) return preferred;
  return "";
}

function getSlicerOptions(page, field) {
  const visual = (page.visuals || []).find((item) => item.type === "slicer" && item.data?.field === field);
  return visual?.data?.options || [];
}

function OperationsMetricPage({ page, manifest, currentDateRange }) {
  const cfg = PAGE_CONFIG[page.slug];
  const visuals = page.visuals || [];
  const plants = page.plant_slicer?.options || [];
  const dateOpts = page.date_slicer?.options || [];
  const assetOptions = getSlicerOptions(page, "VARDESC.UD1").filter(Boolean);
  const metricOptions = getSlicerOptions(page, "VARDESC.SHORTNAME").filter(Boolean);
  const anchor = page.date_slicer?.anchor_date || "";
  const initialPlant = page.plant_slicer?.default || plants[0] || "";
  const initialRange = cfg?.defaultRange || currentDateRange || page.date_slicer?.default || "last_5_years";
  const initialBounds = getPresetBounds(initialRange, anchor, {
    calendarMonthRanges: { last_12_months: 12, last_5_years: 60 },
  }) || { start: "", end: "" };

  const [plant, setPlant] = useState(initialPlant);
  const [range, setRange] = useState(initialRange);
  const [asset, setAsset] = useState(inferDefault(assetOptions, cfg?.assetDefault));
  const [metric, setMetric] = useState("");
  const [customStart, setCustomStart] = useState(initialBounds.start || "");
  const [customEnd, setCustomEnd] = useState(initialBounds.end || "");

  const dateOptions = useMemo(() => withCustomDateOption(dateOpts), [dateOpts]);
  const bounds = useMemo(() => getActiveBounds({
    range,
    anchorDate: anchor,
    customStart,
    customEnd,
    calendarMonthRanges: { last_12_months: 12, last_5_years: 60 },
  }), [range, anchor, customStart, customEnd]);

  const resolvedCards = useMemo(() => (cfg?.chartCards || []).map((item) => {
    const visual = visuals.find(item.selector);
    return {
      ...item,
      data: resolveVisualData(visual, plant, bounds, asset, metric, item.mode),
    };
  }), [cfg, visuals, plant, bounds, asset, metric]);

  const primarySeriesData = resolvedCards.find((item) => item.mode === "xy_series")?.data || null;
  const visibleSignalCount = primarySeriesData?.series?.length || 0;
  const violations = (manifest?.totals?.violations || 0).toLocaleString();
  const plantCount = manifest?.totals?.plants || 0;
  const refresh = (manifest?.last_refresh || "—").slice(0, 10);

  return html`
    <div style=${{
      background: `radial-gradient(circle at 20% 10%,rgba(37,79,140,.2),transparent 26%),linear-gradient(180deg,#05101d,${C.bg})`,
      minHeight: "100vh",
      color: C.text,
      fontFamily: "Inter, system-ui, sans-serif",
      fontSize: 14,
      overflowY: "auto",
    }}>
      <div style=${{ padding: 18, display: "grid", gap: 14 }}>
        <div style=${{ display: "grid", gridTemplateColumns: "64px 1fr auto", gap: 16, alignItems: "start" }}>
          <button onClick=${() => { window.location.hash = "#/home"; }}
            style=${card({ height: 64, display: "grid", placeItems: "center", fontSize: 28, color: C.muted, cursor: "pointer" })}>←</button>

          <div>
            <small style=${{ display: "block", color: C.accent, textTransform: "uppercase", fontWeight: 700, letterSpacing: "0.04em", fontSize: 11, marginBottom: 4 }}>
              City of Houston — Public Works &amp; Engineering
            </small>
            <h1 style=${{ margin: 0, fontSize: 28, fontWeight: 800, lineHeight: 1.05 }}>
              WWiP Plant-Intelligence-System <span style=${{ color: C.accent }}>· ${cfg?.heading || page.display_name}</span>
            </h1>
          </div>

          <div style=${{ display: "grid", gridTemplateColumns: "repeat(3,auto)", gap: 12 }}>
            <${StatChip} icon="💧" label="Violations" value=${violations} />
            <${StatChip} icon="🏭" label="Plants" value=${plantCount} />
            <${StatChip} icon="📅" label="Last refresh" value=${refresh} valueColor=${C.accent} />
          </div>
        </div>

        <div style=${{ display: "grid", gridTemplateColumns: "270px 1fr", gap: 14 }}>
          <aside style=${{ display: "grid", gap: 14, alignContent: "start" }}>
            <section style=${card({ padding: 16 })}>
              <div style=${{ color: C.accent, fontWeight: 800, textTransform: "uppercase", fontSize: 11, letterSpacing: "0.08em", marginBottom: 10 }}>WWTP</div>
              <select value=${plant} onChange=${(e) => setPlant(e.target.value || "")}
                style=${{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, background: "#0a1d32", color: C.text, fontFamily: "inherit", fontSize: 14 }}>
                ${plants.map((option) => html`<option value=${option}>${option}</option>`)}
              </select>
            </section>

            <section style=${card({ padding: 16 })}>
              <div style=${{ color: C.accent, fontWeight: 800, textTransform: "uppercase", fontSize: 11, letterSpacing: "0.08em", marginBottom: 10 }}>Date range</div>
              <select value=${range} onChange=${(e) => setRange(e.target.value)}
                style=${{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, background: "#0a1d32", color: C.text, fontFamily: "inherit", fontSize: 14, marginBottom: range === CUSTOM_DATE_RANGE_KEY ? 10 : 0 }}>
                ${dateOptions.map((option) => html`<option value=${option.key}>${option.label}</option>`)}
              </select>
              ${range === CUSTOM_DATE_RANGE_KEY && html`
                <div style=${{ display: "grid", gap: 8 }}>
                  <input type="date" value=${customStart} max=${customEnd || undefined} onInput=${(e) => setCustomStart(e.target.value)}
                    style=${{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, background: "#0a1d32", color: C.text, fontFamily: "inherit", fontSize: 14 }} />
                  <input type="date" value=${customEnd} min=${customStart || undefined} onInput=${(e) => setCustomEnd(e.target.value)}
                    style=${{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, background: "#0a1d32", color: C.text, fontFamily: "inherit", fontSize: 14 }} />
                </div>
              `}
            </section>

            ${assetOptions.length ? html`
              <section style=${card({ padding: 16 })}>
                <div style=${{ color: C.accent, fontWeight: 800, textTransform: "uppercase", fontSize: 11, letterSpacing: "0.08em", marginBottom: 10 }}>Asset</div>
                <select value=${asset} onChange=${(e) => setAsset(e.target.value)}
                  style=${{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, background: "#0a1d32", color: C.text, fontFamily: "inherit", fontSize: 14 }}>
                  <option value="">All assets</option>
                  ${assetOptions.map((option) => html`<option value=${option}>${option}</option>`)}
                </select>
              </section>
            ` : null}

            ${metricOptions.length ? html`
              <section style=${card({ padding: 16 })}>
                <div style=${{ color: C.accent, fontWeight: 800, textTransform: "uppercase", fontSize: 11, letterSpacing: "0.08em", marginBottom: 10 }}>Metric</div>
                <select value=${metric} onChange=${(e) => setMetric(e.target.value)}
                  style=${{ width: "100%", padding: "10px 12px", borderRadius: 10, border: `1px solid ${C.line}`, background: "#0a1d32", color: C.text, fontFamily: "inherit", fontSize: 14 }}>
                  <option value="">All metrics</option>
                  ${metricOptions.map((option) => html`<option value=${option}>${option}</option>`)}
                </select>
              </section>
            ` : null}

            <section style=${card({ padding: 16 })}>
              <div style=${{ color: C.text, fontWeight: 800, fontSize: 15, marginBottom: 6 }}>${cfg?.heading || page.display_name}</div>
              <div style=${{ color: C.muted, fontSize: 13, lineHeight: 1.55 }}>${cfg?.note || "Process metrics for the active plant and time range."}</div>
              ${cfg?.showSeriesPanel ? html`
              <div style=${{ color: C.muted, fontSize: 12, marginTop: 10 }}>
                  Visible signals: <span style=${{ color: C.text, fontWeight: 700 }}>${visibleSignalCount}</span>
                </div>
              ` : null}
            </section>
          </aside>

          <main style=${{ display: "grid", gap: 14, minHeight: 0 }}>
            <section style=${card({ padding: "12px 14px", display: "grid", gridTemplateColumns: cfg?.showSeriesPanel ? "repeat(3,minmax(0,1fr))" : "repeat(2,minmax(0,1fr))", gap: 12 })}>
              <div style=${{ color: C.muted, fontSize: 13 }}>
                Selected plant: <span style=${{ color: C.text, fontWeight: 700 }}>${plant || "—"}</span>
              </div>
              <div style=${{ color: C.muted, fontSize: 13 }}>
                Asset filter: <span style=${{ color: C.text, fontWeight: 700 }}>${asset || "All assets"}</span>
              </div>
              <div style=${{ color: C.muted, fontSize: 13 }}>
                Metric filter: <span style=${{ color: C.text, fontWeight: 700 }}>${metric || "All metrics"}</span>
              </div>
            </section>

            <div style=${{ display: "grid", gridTemplateColumns: resolvedCards.length > 1 ? "repeat(2,minmax(0,1fr))" : "1fr", gap: 14 }}>
              ${resolvedCards.map((item) => html`<${ChartCard} key=${item.title} title=${item.title} data=${item.data} mode=${item.mode} />`)}
            </div>

            ${cfg?.showSeriesPanel ? html`<${SeriesPanel} data=${primarySeriesData} />` : null}
          </main>
        </div>
      </div>
    </div>
  `;
}
exports['OperationsMetricPage'] = OperationsMetricPage;
  });

  __wwip_define__('src/app.js', function (module, exports, __wwip_require__) {
const { h, render } = __wwip_require__('app/lib/preact.module.js');
const { useEffect, useState } = __wwip_require__('app/lib/preact-hooks.module.js');
const htm = __wwip_require__('app/lib/htm.module.js').default;
const { state, subscribe, update, setCurrentPlant } = __wwip_require__('src/state.js');
const { loadManifest, loadPage } = __wwip_require__('src/data.js');
const { PageCanvas } = __wwip_require__('src/pages/page.js');
const { PermitSummaryPage } = __wwip_require__('src/pages/permit-summary.js');
const { HomeNavPage } = __wwip_require__('src/pages/home-nav.js');
const { DailyEffluentFlowPage } = __wwip_require__('src/pages/daily-effluent-flow.js');
const { GenericChartPage } = __wwip_require__('src/pages/generic-chart-page.js');
const { EfFlowPermitEvalPage } = __wwip_require__('src/pages/ef-flow-permit-eval.js');
const { PermitEvaluationAAFPage } = __wwip_require__('src/pages/permit-evaluation-aaf.js');
const { PermitEvaluation7590Page } = __wwip_require__('src/pages/permit-evaluation-7590.js');
const { EfFlowAAFMAFPage } = __wwip_require__('src/pages/ef-flow-aaf-maf.js');
const { EfFlowADF2hrPeakPage } = __wwip_require__('src/pages/ef-flow-adf-2hrpeak.js');
const { StatisticalFlowsPage } = __wwip_require__('src/pages/statistical-flows.js');
const { PermittedAAFVsDMRPage } = __wwip_require__('src/pages/permitted-aaf-vs-dmr.js');
const { PermitLimitsPage } = __wwip_require__('src/pages/permit-limits.js');
const { Dmr5yrHistoricalMetricPage } = __wwip_require__('src/pages/dmr-5yr-ef-flow.js');
const { PlantEffluentDailyPage } = __wwip_require__('src/pages/plant-ef-daily.js');
const { KpiGridPage } = __wwip_require__('src/pages/kpi-grid-page.js');
const { MonthlyFlowTablePage } = __wwip_require__('src/pages/monthly-flow-table.js');
const { OperationsMetricPage } = __wwip_require__('src/pages/operations-metric-page.js');
// WWiP Plant-Intelligence-System — v2 entry
// Phase 5B/5C: shell, router, Home page, generic page renderer.
























const html = htm.bind(h);

// ── useStore — rerenders on any state.* change ─────────────────
function useStore() {
  const [, tick] = useState(0);
  useEffect(() => subscribe(() => tick(x => x + 1)), []);
  return state;
}

// ── useScaleToFit — scales a fixed canvas to the viewport ──────
function useScaleToFit(width, height) {
  const [t, setT] = useState({ scale: 1, wrapH: height });
  useEffect(() => {
    const recompute = () => {
      const availW = window.innerWidth - 40;       // leave 20px padding each side
      const availH = window.innerHeight - 60 - 40; // topbar + padding
      const scale = Math.min(availW / width, availH / height);
      setT({ scale, wrapH: height * scale, wrapW: width * scale });
    };
    recompute();
    window.addEventListener("resize", recompute);
    return () => window.removeEventListener("resize", recompute);
  }, [width, height]);
  return t;
}

// ── Topbar ─────────────────────────────────────────────────────
function Topbar({ manifest, pageName, isHome }) {
  return html`
    <header class="app-topbar">
      <div>
        <p class="eyebrow">City of Houston — Public Works & Engineering</p>
        <h1>
          WWiP Plant-Intelligence-System
          ${isHome
            ? html` <span style=${{ color: "var(--accent)" }}> · Home</span>`
            : pageName
              ? html` <span style=${{ color: "var(--muted)", fontWeight: 400 }}> · ${pageName}</span>`
              : null}
        </h1>
      </div>
      <div class="topbar-right">
        <a class="home-link" href="#/home">Home</a>
        ${manifest && html`
          <span>${manifest.totals.violations.toLocaleString()} violations</span>
          <span>${manifest.totals.plants} plants</span>
          <span>Last refresh: ${manifest.last_refresh?.slice(0,10) || "—"}</span>
        `}
      </div>
    </header>
  `;
}

// ── Page viewport — scales the 1280×720 canvas to fit ──────────
function PageViewport({ page, currentPlant, currentDateRange }) {
  const { width = 1280, height = 720 } = page.canvas || {};
  const { scale, wrapH, wrapW } = useScaleToFit(width, height);
  return html`
    <div class="page-viewport">
      <div class="page-canvas-wrap" style=${{ width: `${wrapW}px`, height: `${wrapH}px` }}>
        <div style=${{ transform: `scale(${scale})`, transformOrigin: "top left" }}>
          <${PageCanvas} page=${page} currentPlant=${currentPlant}
                                      currentDateRange=${currentDateRange} />
        </div>
      </div>
    </div>
  `;
}

// ── App root ───────────────────────────────────────────────────
function App() {
  const s = useStore();

  // Load the manifest once
  useEffect(() => {
    loadManifest()
      .then(m => update(st => { st.manifest = m; }))
      .catch(err => update(st => { st.currentPageError = err.message; }));
  }, []);

  // Whenever the route slug changes, load that page spec
  useEffect(() => {
    if (!s.manifest) return;
    const slug = s.route.slug || "home";
    update(st => { st.currentPageLoading = true; st.currentPageError = null; });
    loadPage(slug)
      .then(p => update(st => {
        st.currentPage = p;
        st.currentPageLoading = false;
        // If this page has a plant slicer, set the default selection
        if (p.plant_slicer?.default) {
          st.filters.currentPlant = p.plant_slicer.default;
        } else {
          st.filters.currentPlant = null;
        }
        // If this page has a date slicer, set the default window
        if (p.date_slicer?.default) {
          st.filters.currentDateRange = p.date_slicer.default;
        } else {
          st.filters.currentDateRange = null;
        }
      }))
      .catch(err => update(st => { st.currentPageError = err.message; st.currentPageLoading = false; }));
  }, [s.manifest, s.route.slug]);

  if (!s.manifest) return html`<div class="app-loading">Loading manifest…</div>`;
  if (s.currentPageError) return html`
    <div class="app-frame">
      <${Topbar} manifest=${s.manifest} pageName=${null} />
      <div class="app-error">Error: ${s.currentPageError}</div>
    </div>
  `;
  if (!s.currentPage) return html`
    <div class="app-frame">
      <${Topbar} manifest=${s.manifest} pageName=${null} />
      <div class="app-loading">Loading page…</div>
    </div>
  `;

  const slug = s.currentPage.slug;

  return html`
    <div class="app-frame">
      ${!["home","tables-permitted-capacity-evaluation-pbi","dt-daily-effluent-flow","ef-flow-permit-eval","permit-evaluation-aaf","permit-evaluation-7590","ef-flow-aaf-maf","adf-2hrpeak-to-download","statistical-flows","permitted-aaf-vs-dmr",
           "permit-limits","dt-chart-plant-if-daily","dt-chart-plant-ef-daily",
           "dt-dmr-5yr-ef-flow-mgd","dt-dmr-5yr-ef-cbod",
           "dt-dmr-5yr-ef-tss","dt-dmr-5yr-ef-nh3-n",
           "dmr-5yr-ef-cbod-loading","dmr-5yr-ef-tss-loading","dmr-5yr-ef-nh3-n-loading",
           "dmr-5yr-ef-do-loading","dmr-5yr-ecoli","dmr-5yr-ph-field",
           "if-rem-ef-cbod-tss-nh3-n","plant-efficiency-process-evaluation","multi-var-operational-parameters",
           "regulatory-parameters-1-3x3","regulatory-parameters-2-3x3","regulatory-kpi-33",
           "dmr-monthlyaaf-for-permit-evaluation","dmr-monthlyadf-for-7590-rules",
           "thck","elec",
           "s-aeration","clarifier","svi","ras-01","was-01","dig-01"].includes(slug)
        && html`<${Topbar} manifest=${s.manifest} pageName=${s.currentPage.display_name} isHome=${false} />`}
      ${slug === "home"
        ? html`<${HomeNavPage} manifest=${s.manifest} />`
        : slug === "permit-evaluation-7590"
          ? html`<${PermitEvaluation7590Page} page=${s.currentPage} manifest=${s.manifest} currentDateRange=${s.filters.currentDateRange} />`
        : slug === "permit-evaluation-aaf"
          ? html`<${PermitEvaluationAAFPage} page=${s.currentPage} manifest=${s.manifest} currentDateRange=${s.filters.currentDateRange} />`
        : slug === "permitted-aaf-vs-dmr"
          ? html`<${PermittedAAFVsDMRPage}
                    page=${s.currentPage}
                    manifest=${s.manifest}
                    currentDateRange=${s.filters.currentDateRange} />`
        : slug === "statistical-flows"
          ? html`<${StatisticalFlowsPage}
                    page=${s.currentPage}
                    manifest=${s.manifest}
                    currentDateRange=${s.filters.currentDateRange} />`
        : slug === "adf-2hrpeak-to-download"
          ? html`<${EfFlowADF2hrPeakPage}
                    page=${s.currentPage}
                    manifest=${s.manifest}
                    currentDateRange=${s.filters.currentDateRange} />`
        : slug === "ef-flow-aaf-maf"
          ? html`<${EfFlowAAFMAFPage}
                    page=${s.currentPage}
                    manifest=${s.manifest}
                    currentDateRange=${s.filters.currentDateRange} />`
        : slug === "ef-flow-permit-eval"
          ? html`<${EfFlowPermitEvalPage}
                    page=${s.currentPage}
                    manifest=${s.manifest}
                    currentDateRange=${s.filters.currentDateRange} />`
        : slug === "dt-daily-effluent-flow"
          ? html`<${DailyEffluentFlowPage}
                    page=${s.currentPage}
                    currentDateRange=${s.filters.currentDateRange} />`
        : slug === "permit-limits"
          ? html`<${PermitLimitsPage}
                    page=${s.currentPage}
                    manifest=${s.manifest} />`
        : slug === "dt-chart-plant-ef-daily"
          ? html`<${PlantEffluentDailyPage}
                    page=${s.currentPage}
                    manifest=${s.manifest}
                    currentDateRange=${s.filters.currentDateRange} />`
        : ["dt-dmr-5yr-ef-flow-mgd","dt-dmr-5yr-ef-cbod",
           "dt-dmr-5yr-ef-tss","dt-dmr-5yr-ef-nh3-n",
           "dmr-5yr-ef-cbod-loading","dmr-5yr-ef-tss-loading","dmr-5yr-ef-nh3-n-loading",
           "dmr-5yr-ef-do-loading","dmr-5yr-ecoli","dmr-5yr-ph-field"].includes(slug)
          ? html`<${Dmr5yrHistoricalMetricPage}
                    page=${s.currentPage}
                    manifest=${s.manifest}
                    currentDateRange=${s.filters.currentDateRange} />`
        : ["if-rem-ef-cbod-tss-nh3-n","plant-efficiency-process-evaluation","multi-var-operational-parameters",
           "regulatory-parameters-1-3x3","regulatory-parameters-2-3x3","regulatory-kpi-33",
           "s-aeration","clarifier","svi","ras-01","was-01","dig-01"].includes(slug)
          ? html`<${KpiGridPage}
                    page=${s.currentPage}
                    manifest=${s.manifest}
                    currentDateRange=${s.filters.currentDateRange} />`
        : ["dmr-monthlyaaf-for-permit-evaluation","dmr-monthlyadf-for-7590-rules"].includes(slug)
          ? html`<${MonthlyFlowTablePage}
                    page=${s.currentPage}
                    manifest=${s.manifest}
                    currentDateRange=${s.filters.currentDateRange} />`
        : ["thck","elec"].includes(slug)
          ? html`<${OperationsMetricPage}
                    page=${s.currentPage}
                    manifest=${s.manifest}
                    currentDateRange=${s.filters.currentDateRange} />`
        : ["dt-chart-plant-if-daily","dt-chart-plant-ef-daily"].includes(slug)
          ? html`<${GenericChartPage} page=${s.currentPage} currentDateRange=${s.filters.currentDateRange} />`
        : slug === "tables-permitted-capacity-evaluation-pbi"
          ? html`<${PermitSummaryPage}
                    page=${s.currentPage}
                    manifest=${s.manifest}
                    currentDateRange=${s.filters.currentDateRange} />`
          : html`<${PageViewport} page=${s.currentPage}
                         currentPlant=${s.filters.currentPlant}
                         currentDateRange=${s.filters.currentDateRange} />`
      }
    </div>
  `;
}

render(html`<${App} />`, document.getElementById("app"));
  });

  __wwip_require__('src/app.js');
})();
