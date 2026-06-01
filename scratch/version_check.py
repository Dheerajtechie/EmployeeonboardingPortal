import importlib, sys
print('python', sys.version)
for name in ['groq', 'httpx']:
    try:
        mod = importlib.import_module(name)
        print(name, getattr(mod, '__version__', 'unknown'))
    except Exception as e:
        print(name, 'import failed', repr(e))
