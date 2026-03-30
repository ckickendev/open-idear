import re
text = 'bg-[var(--admin-primary)] hover:bg-[var(--admin-primary-hover)] focus:ring-[var(--admin-primary-ring)] shadow-[var(--admin-shadow-sm)]'
pattern = r'(text|bg|border|ring|shadow|ring-offset|hover:bg|hover:text|hover:border|focus:ring|focus:border)-\[var\(--admin-([a-zA-Z0-9\-]+)\)\]'
print(re.findall(pattern, text))
