"""Offline UI wiring checks. This is a DOM stub, not a browser or visual QA."""
import ctypes, json, pathlib, sys
base=pathlib.Path(__file__).resolve().parents[1]
js=ctypes.CDLL('/System/Library/Frameworks/JavaScriptCore.framework/JavaScriptCore')
ptr=ctypes.c_void_p
js.JSGlobalContextCreate.restype=ptr;js.JSGlobalContextCreate.argtypes=[ptr]
js.JSStringCreateWithUTF8CString.restype=ptr;js.JSStringCreateWithUTF8CString.argtypes=[ctypes.c_char_p]
js.JSEvaluateScript.restype=ptr;js.JSEvaluateScript.argtypes=[ptr,ptr,ptr,ptr,ctypes.c_int,ctypes.POINTER(ptr)]
js.JSValueToStringCopy.restype=ptr;js.JSValueToStringCopy.argtypes=[ptr,ptr,ctypes.POINTER(ptr)]
js.JSStringGetMaximumUTF8CStringSize.restype=ctypes.c_size_t;js.JSStringGetMaximumUTF8CStringSize.argtypes=[ptr]
js.JSStringGetUTF8CString.argtypes=[ptr,ctypes.c_char_p,ctypes.c_size_t]
def run(source):
    ctx=js.JSGlobalContextCreate(None);code=js.JSStringCreateWithUTF8CString(source.encode());err=ptr()
    value=js.JSEvaluateScript(ctx,code,None,None,1,ctypes.byref(err));string=js.JSValueToStringCopy(ctx,err.value or value,None)
    size=js.JSStringGetMaximumUTF8CStringSize(string);buf=ctypes.create_string_buffer(size);js.JSStringGetUTF8CString(string,buf,size)
    if err.value: raise RuntimeError(buf.value.decode())
    return json.loads(buf.value.decode())
stub=r'''
var window=globalThis;var events={};var hooks={};var errors=[];var timers=[];
var console={error:function(e){errors.push(String(e));},log:function(){}};
function setTimeout(f){timers.push(f);return 1;}function requestAnimationFrame(f){};
var scrollTo=function(){};window.scrollTo=scrollTo;
window.addEventListener=function(t,f){(hooks[t]||(hooks[t]=[])).push(f);};
var nodes={};function node(){return {innerHTML:'',style:{},scrollHeight:100,scrollTop:0,append:function(){},appendChild:function(){},remove:function(){},click:function(){},focus:function(){},scrollIntoView:function(){},querySelector:function(){return node()},querySelectorAll:function(){return []},classList:{toggle:function(){}}};}
['#shell','#toasts','#modals','.header','#chat-scroll','#audit-rows'].forEach(k=>nodes[k]=node());
var document={title:'',body:node(),activeElement:node(),addEventListener:function(t,f){(events[t]||(events[t]=[])).push(f);},querySelector:function(s){return nodes[s]||null;},querySelectorAll:function(){return [];},createElement:node};
var localStorage={data:{},getItem:function(k){return this.data[k]||null;},setItem:function(k,v){this.data[k]=v;}};
var currentHash=INITIAL_PATH;var location={};Object.defineProperty(location,'hash',{get:function(){return currentHash;},set:function(v){currentHash=v.startsWith('#')?v:'#'+v;}});
class HTMLFormElement{constructor(id,data,dataset){this.id=id;this.data=data;this.dataset=dataset||{};this.err=node();}querySelector(){return this.err;}}
var FormData=class{constructor(form){this.data=form.data;}[Symbol.iterator](){return Object.entries(this.data)[Symbol.iterator]();}};
function flush(){(hooks.hashchange||[]).forEach(f=>f());}
function click(action,id,extra){var target={dataset:Object.assign({action:action,id:id},extra||{})};events.click.forEach(f=>f({target:{closest:function(){return target;},matches:function(){return false;}},preventDefault:function(){}}));flush();}
function submit(id,data,dataset){var form=new HTMLFormElement(id,data,dataset);events.submit.forEach(f=>f({target:form,preventDefault:function(){}}));flush();return form.err.innerHTML;}
function state(){return JSON.parse(localStorage.data['ebex.prototype.v1.1']);}
function assert(x,m){if(!x)throw Error(m||'Assertion failed');}
'''
domain=(base/'src/domain.js').read_text()
rest='\n'.join((base/'src'/name).read_text() for name in ['visuals.js','checks.js','app.js'])
def fixture(path='market',role='buyer',admin='super'):
    return stub.replace('INITIAL_PATH',json.dumps('#/'+path))+domain+f"\nvar init=EB.seed();init.session.role={json.dumps(role)};init.session.adminRole={json.dumps(admin)};localStorage.setItem('ebex.prototype.v1.1',JSON.stringify(init));\n"+rest
results=[]
for path,role in [('market','buyer'),('favorites','buyer'),('listing/l1','buyer'),('listing/l2','buyer'),('orders','buyer'),('orders/EB-1042','buyer'),('seller','seller'),('sell','seller'),('messages','buyer'),('premium','seller'),('profile','buyer'),('test','buyer')]+[('admin/'+p,'admin') for p in ['overview','users','listings','orders','disputes','finance','shipping','config','premium','audit']]:
    try:
        r=run(fixture(path,role)+"\nJSON.stringify({size:nodes['#shell'].innerHTML.length,errors:errors,fail:nodes['#shell'].innerHTML.includes('Prikaz nije mogao')});")
        assert r['size']>3000 and not r['errors'] and not r['fail'],r
        results.append({'name':'Render '+path,'pass':True})
    except Exception as err: results.append({'name':'Render '+path,'pass':False,'error':str(err)})
flows={
'Kupovina, pakovanje, BEX uručenje i isplata kroz UI':r'''
click('checkout','l1');assert(nodes['#shell'].innerHTML.includes('checkout-form'),'Checkout missing');
assert(!submit('checkout-form',{name:'Test Kupac',street:'Test 1',city:'Beograd',postal:'11000',delivery:'home',terms:'on'}));
var id=state().orders.slice(-1)[0].id;assert(state().listings.find(l=>l.id==='l1').status==='RESERVED');
click('role-for-order',id,{role:'seller'});click('demo-proof',id);click('simulate',id,{type:'TRANSIT'});click('simulate',id,{type:'DELIVERED'});click('advance-day');click('simulate',id,{type:'PAYOUT'});
assert(state().orders.find(o=>o.id===id).status==='COMPLETED','UI success flow failed');assert(state().ledger.filter(l=>l.orderId===id&&l.type==='PAYOUT').length===1);
''',
'Scenario reklamacije i moderatorska zabrana':r'''
click('scenario','hold');var id=state().orders.slice(-1)[0].id;assert(state().orders.find(o=>o.id===id).payoutStatus==='HOLD_CONFIRMED');
click('role-for-order',id,{role:'admin'});var s=state();s.session.adminRole='moderator';localStorage.setItem('ebex.prototype.v1.1',JSON.stringify(s));(hooks.storage||[]).forEach(f=>f({key:'ebex.prototype.v1.1',newValue:JSON.stringify(s)}));
var error=submit('dispute-decision',{decision:'release',reason:'Provera moderatorskih ovlašćenja.'},{id:id});assert(error.includes('ovlašćenje'),'Moderator could release');assert(state().orders.find(o=>o.id===id).payoutStatus==='HOLD_CONFIRMED');
''',
'Dogovor kroz chat i formalna ponuda do kupovine':r'''
click('contact','l4');var c=state().conversations.find(c=>c.listingId==='l4');
assert(!submit('offer-form',{price:'65000'},{id:c.id}));var offer=state().conversations.find(x=>x.id===c.id).offers[0];
click('chat-role');click('accept-offer',offer.id,{conv:c.id});click('offer-checkout',offer.id,{conv:c.id});
assert(!submit('checkout-form',{name:'Test Kupac',street:'Test 1',city:'Beograd',postal:'11000',delivery:'shop',terms:'on'}));assert(state().orders.slice(-1)[0].price===6500000);
''',
'Premium aktivacija i audit trag kroz UI':r'''
assert(!submit('promote-form',{listing:'l11'},{id:'premium'}));assert(state().premiumPurchases.length===1);assert(state().audit.some(a=>a.action==='PREMIUM_SIMULATED'));
''',
'Promena profila poništava identitet i račun':r'''
assert(!submit('profile-form',{name:'Test Novo Ime',city:'Beograd',bio:'Test profil.'}));assert(state().users.me.identity===false&&state().users.me.bank===false);
'''
}
for name,code in flows.items():
    try:
        run(fixture()+code+"\nJSON.stringify({errors:errors});")
        results.append({'name':name,'pass':True})
    except Exception as err: results.append({'name':name,'pass':False,'error':str(err)})
for r in results: print(('PASS ' if r['pass'] else 'FAIL ')+r['name']+(': '+r.get('error','') if not r['pass'] else ''))
(base/'docs/ui-wiring-results.json').write_text(json.dumps(results,ensure_ascii=False,indent=2))
print('%d/%d isolated UI checks passed. Browser rendering not tested.'%(sum(r['pass'] for r in results),len(results)))
sys.exit(0 if all(r['pass'] for r in results) else 1)
