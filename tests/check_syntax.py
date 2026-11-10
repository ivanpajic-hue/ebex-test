"""Parse app JavaScript with the system JavaScriptCore, without executing it."""
import ctypes, json, pathlib, sys
root = pathlib.Path(__file__).resolve().parents[1]
source = '\n'.join((root / 'src' / name).read_text() for name in ['domain.js','visuals.js','checks.js','app.js'])
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
code = js.JSStringCreateWithUTF8CString(('new Function(' + json.dumps(source) + '); "JavaScript syntax OK";').encode())
err = ptr()
value = js.JSEvaluateScript(ctx, code, None, None, 1, ctypes.byref(err))
string = js.JSValueToStringCopy(ctx, err.value or value, None)
size = js.JSStringGetMaximumUTF8CStringSize(string)
buf = ctypes.create_string_buffer(size)
js.JSStringGetUTF8CString(string, buf, size)
print(buf.value.decode())
sys.exit(1 if err.value else 0)
