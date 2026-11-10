"""Run the same offline business-rule tests embedded in the prototype.
Uses Node when installed, otherwise the system JavaScriptCore on macOS.
No packages or network access required.
"""
import ctypes, json, pathlib, shutil, subprocess, sys
base = pathlib.Path(__file__).resolve().parents[1]
source = '\n'.join((base / 'src' / name).read_text() for name in ['domain.js', 'checks.js'])
source += '\nJSON.stringify(runEBTests());'
if shutil.which('node'):
    script = source.rsplit('JSON.stringify(runEBTests());', 1)[0] + '\nconsole.log(JSON.stringify(runEBTests()));'
    raw = subprocess.check_output(['node', '-e', script], text=True)
else:
    js = ctypes.CDLL('/System/Library/Frameworks/JavaScriptCore.framework/JavaScriptCore')
    ptr = ctypes.c_void_p
    js.JSGlobalContextCreate.restype = ptr
    js.JSGlobalContextCreate.argtypes = [ptr]
    js.JSStringCreateWithUTF8CString.restype = ptr
    js.JSStringCreateWithUTF8CString.argtypes = [ctypes.c_char_p]
    js.JSEvaluateScript.restype = ptr
    js.JSEvaluateScript.argtypes = [ptr, ptr, ptr, ptr, ctypes.c_int, ctypes.POINTER(ptr)]
    js.JSValueToStringCopy.restype = ptr
    js.JSValueToStringCopy.argtypes = [ptr, ptr, ctypes.POINTER(ptr)]
    js.JSStringGetMaximumUTF8CStringSize.restype = ctypes.c_size_t
    js.JSStringGetMaximumUTF8CStringSize.argtypes = [ptr]
    js.JSStringGetUTF8CString.argtypes = [ptr, ctypes.c_char_p, ctypes.c_size_t]
    ctx = js.JSGlobalContextCreate(None)
    code = js.JSStringCreateWithUTF8CString(source.encode())
    exception = ptr()
    value = js.JSEvaluateScript(ctx, code, None, None, 1, ctypes.byref(exception))
    value = exception.value or value
    string = js.JSValueToStringCopy(ctx, value, None)
    size = js.JSStringGetMaximumUTF8CStringSize(string)
    buf = ctypes.create_string_buffer(size)
    js.JSStringGetUTF8CString(string, buf, size)
    raw = buf.value.decode()
    if exception.value:
        sys.exit('JavaScript error: ' + raw)
results = json.loads(raw)
for r in results:
    print(('PASS ' if r['pass'] else 'FAIL ') + r['name'] + (': ' + r.get('error','') if not r['pass'] else ''))
print('\n%d/%d passed' % (sum(r['pass'] for r in results), len(results)))
(base / 'docs' / 'test-results.json').write_text(json.dumps(results, ensure_ascii=False, indent=2))
sys.exit(0 if all(r['pass'] for r in results) else 1)
